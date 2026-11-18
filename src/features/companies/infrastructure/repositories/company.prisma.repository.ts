import { Injectable } from '@nestjs/common';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { DomainError } from '../../../../common/errors/domain-error';
import { lockUserQuota } from '../../../../common/quota/user-quota';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { revokeTrustedDevices } from '../../../../infrastructure/database/trusted-devices';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { AccessKey } from '../../domain/entities/access-key.entity';
import {
  CompanyDetail,
  CompanyOverview,
  ContractedFramework,
} from '../../domain/entities/company-overview';
import { Company } from '../../domain/entities/company.entity';
import {
  ArchiveData,
  ArchivedCompany,
  RegisteredCompany,
  RotatedAccessKey,
  CompanyListQuery,
  CompanyRepository,
  NewAccessKey,
  NewCompany,
} from '../../domain/repositories/company.repository';

type CompanyRow = {
  id: string;
  name: string;
  adminEmail: string;
  isolationStrategy: 'dedicated' | 'shared';
  status: 'active' | 'suspended' | 'deactivated';
  createdAt: Date;
  updatedAt: Date;
  deactivatedAt: Date | null;
  archiveUntil: Date | null;
  deactivationReasonCode: 'non_payment' | 'client_request' | 'other' | null;
  deactivationReason: string | null;
  maxUsers: number | null;
};

type AccessKeyRow = {
  id: string;
  companyId: string;
  status: 'pending' | 'used' | 'expired' | 'revoked';
  expiresAt: Date;
  usedAt: Date | null;
};

const toCompany = (r: CompanyRow) =>
  new Company(
    r.id,
    r.name,
    r.adminEmail,
    r.isolationStrategy,
    r.status,
    r.createdAt,
    r.updatedAt,
    r.status === 'deactivated' && r.deactivatedAt && r.archiveUntil
      ? { deactivatedAt: r.deactivatedAt, archiveUntil: r.archiveUntil, reasonCode: r.deactivationReasonCode, reason: r.deactivationReason }
      : null,
    r.maxUsers,
  );

const toAccessKey = (r: AccessKeyRow) =>
  new AccessKey(r.id, r.companyId, r.status, r.expiresAt, r.usedAt);

type FrameworkRow = { contractedAt: Date; framework: { code: string; name: string } };

const toContracted = (rows: FrameworkRow[]): ContractedFramework[] =>
  rows
    .map((r) => ({
      code: r.framework.code,
      name: r.framework.name,
      contractedAt: r.contractedAt.toISOString().slice(0, 10),
    }))
    .sort((a, b) => a.code.localeCompare(b.code));

const FRAMEWORKS_INCLUDE = { include: { framework: { select: { code: true, name: true } } } } as const;

const startOfDayUtc = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

// access_keys no tiene created_at: la clave vigente es la que vence más tarde (cada regeneración
// emite una con vencimiento posterior).
const CURRENT_KEY_ORDER = { expiresAt: 'desc' } as const;

@Injectable()
export class CompanyPrismaRepository extends CompanyRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // companies y access_keys: las políticas RLS dejan ver todo a app.user_role = admin_monkey (D31).

  existsActiveWithName(scope: TenantScope, name: string): Promise<boolean> {
    return this.prisma.withScope(scope, async (tx) =>
      (await tx.company.count({
        where: { status: 'active', name: { equals: name, mode: 'insensitive' } },
      })) > 0,
    );
  }

  existsWithAdminEmail(scope: TenantScope, adminEmail: string): Promise<boolean> {
    return this.prisma.withScope(scope, async (tx) =>
      (await tx.company.count({
        where: { adminEmail: { equals: adminEmail, mode: 'insensitive' } },
      })) > 0,
    );
  }

  // `users` tiene RLS por empresa: Monkey Admin no ve a las personas de otras empresas con un SELECT normal. La búsqueda por correo del login
  // (find_login_candidates, SECURITY DEFINER) sí cruza empresas y devuelve solo los datos mínimos; aquí solo importa si hay alguna fila.
  async existsUserWithEmail(scope: TenantScope, email: string): Promise<boolean> {
    const rows = await this.prisma.withScope(scope, (tx) => tx.$queryRaw<{ id: string }[]>`SELECT id FROM platform.find_login_candidates(${email}) LIMIT 1`);
    return rows.length > 0;
  }

  async existingFrameworkCodes(codes: string[]): Promise<string[]> {
    // catalog.*: lectura libre, no necesita tenant.
    const rows = await this.prisma.framework.findMany({
      where: { code: { in: codes } },
      select: { code: true },
      distinct: ['code'],
    });
    return rows.map((r) => r.code);
  }

  async availableFrameworkCodes(codes: string[]): Promise<string[]> {
    const rows = await this.prisma.framework.findMany({
      where: { code: { in: codes }, availability: 'available' },
      select: { code: true },
      distinct: ['code'],
    });
    return rows.map((r) => r.code);
  }

  createWithAccessKey(
    scope: TenantScope,
    data: NewCompany,
    key: NewAccessKey,
    audit: AuditIntent<RegisteredCompany>,
  ): Promise<RegisteredCompany> {
    return this.prisma.withScope(scope, async (tx) => {
      const company = await tx.company.create({
        data: {
          name: data.name,
          adminEmail: data.adminEmail,
          isolationStrategy: data.isolationStrategy,
          maxUsers: data.maxUsers,
        },
      });
      const accessKey = await tx.accessKey.create({
        data: {
          companyId: company.id,
          createdBy: key.createdBy,
          codeHash: key.codeHash,
          expiresAt: key.expiresAt,
        },
      });

      // Contrato de marcos (D47): la versión vigente de cada marco. platform.company_frameworks
      // solo admite escritura de admin_monkey (RLS), que es quien registra la empresa.
      const today = startOfDayUtc(new Date());
      for (const code of data.frameworkCodes) {
        const framework = await tx.framework.findFirstOrThrow({
          where: { code },
          orderBy: { version: 'desc' },
          select: { id: true },
        });
        await tx.companyFramework.create({
          data: {
            companyId: company.id,
            frameworkId: framework.id,
            contractedBy: key.createdBy,
            contractedAt: today,
          },
        });
      }
      const contracted = await tx.companyFramework.findMany({
        where: { companyId: company.id },
        ...FRAMEWORKS_INCLUDE,
      });
      const registered = {
        company: toCompany(company),
        accessKey: toAccessKey(accessKey),
        frameworks: toContracted(contracted),
      };
      // En la misma transacción que la empresa, la clave y el contrato (SEG-36).
      await insertAuditLog(tx, audit(registered));
      return registered;
    });
  }

  rotateAccessKey(
    scope: TenantScope,
    companyId: string,
    excludeCompanyId: string,
    key: NewAccessKey,
    audit: AuditIntent<RotatedAccessKey>,
  ): Promise<RotatedAccessKey> {
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.company.findFirst({ where: { id: companyId, NOT: { id: excludeCompanyId } } });
      if (!row) throw new DomainError('NOT_FOUND');
      if (row.status === 'deactivated') throw new DomainError('COMPANY_ALREADY_DEACTIVATED');
      if ((await tx.accessKey.count({ where: { companyId, status: 'used' } })) > 0) throw new DomainError('ACCESS_KEY_NOT_PENDING');

      // La anterior deja de servir aunque no haya vencido: se reenvía porque el correo se perdió o no salió.
      const revoked = await tx.accessKey.updateMany({ where: { companyId, status: 'pending' }, data: { status: 'revoked' } });
      const accessKey = await tx.accessKey.create({
        data: { companyId, createdBy: key.createdBy, codeHash: key.codeHash, expiresAt: key.expiresAt },
      });
      const rotated = { company: toCompany(row), accessKey: toAccessKey(accessKey), revokedKeys: revoked.count };
      await insertAuditLog(tx, audit(rotated));
      return rotated;
    });
  }

  list(scope: TenantScope, query: CompanyListQuery): Promise<Page<CompanyOverview>> {
    return this.prisma.withScope(scope, async (tx) => {
      const where = {
        id: { not: query.excludeCompanyId },
        // Las archivadas (D97) salen del listado por defecto; se ven con el filtro `status=deactivated`.
        status: query.status ?? { not: 'deactivated' as const },
      };
      const field = query.sort.replace('-', '') === 'name' ? 'name' : 'createdAt';
      const direction = query.sort.startsWith('-') ? 'desc' : 'asc';

      const [rows, total] = await Promise.all([
        tx.company.findMany({
          where,
          orderBy: { [field]: direction },
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
          include: {
            accessKeys: { orderBy: CURRENT_KEY_ORDER, take: 1 },
            frameworks: FRAMEWORKS_INCLUDE,
          },
        }),
        tx.company.count({ where }),
      ]);

      const ids = rows.map((r) => r.id);
      const onboarded = await this.onboardedCompanyIds(tx, scope, ids);
      const counts = await this.usersCounts(tx, ids);
      return {
        items: rows.map((row) => ({
          company: toCompany(row),
          currentAccessKey: row.accessKeys[0] ? toAccessKey(row.accessKeys[0]) : null,
          frameworks: toContracted(row.frameworks),
          onboardingCompleted: onboarded.has(row.id),
          usersCount: counts.get(row.id) ?? 0,
        })),
        total,
        page: query.page,
        pageSize: query.pageSize,
      };
    });
  }

  findById(
    scope: TenantScope,
    companyId: string,
    excludeCompanyId: string,
  ): Promise<CompanyDetail | null> {
    if (companyId === excludeCompanyId) return Promise.resolve(null);
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.company.findUnique({
        where: { id: companyId },
        include: { accessKeys: { orderBy: CURRENT_KEY_ORDER }, frameworks: FRAMEWORKS_INCLUDE },
      });
      if (!row) return null;

      const onboarded = await this.onboardedCompanyIds(tx, scope, [row.id]);
      const counts = await this.usersCounts(tx, [row.id]);
      const accessKeys = row.accessKeys.map(toAccessKey);
      return {
        company: toCompany(row),
        currentAccessKey: accessKeys[0] ?? null,
        frameworks: toContracted(row.frameworks),
        onboardingCompleted: onboarded.has(row.id),
        usersCount: counts.get(row.id) ?? 0,
        accessKeys,
      };
    });
  }

  updateMaxUsers(
    scope: TenantScope,
    companyId: string,
    excludeCompanyId: string,
    maxUsers: number,
    audit: AuditIntent<{ before: number | null; after: number }>,
  ): Promise<void> {
    if (companyId === excludeCompanyId) throw new DomainError('NOT_FOUND');
    return this.prisma.withScope(scope, async (tx) => {
      // La fila queda bloqueada hasta el final: un alta que compite por el cupo espera y ve el valor nuevo (o el viejo, si esto falla).
      // `lockUserQuota` bloquea la fila y cuenta con la misma puerta que usan las altas (`platform.company_users_count`): una sola regla de qué cuenta, para cualquier rol.
      const { maxUsers: before, usersCount } = await lockUserQuota(tx, companyId);
      if (maxUsers < usersCount) throw new DomainError('MAX_USERS_BELOW_CURRENT', { max_users: maxUsers, users_count: usersCount });
      await tx.company.update({ where: { id: companyId }, data: { maxUsers } });
      await insertAuditLog(tx, audit({ before, after: maxUsers }));
    });
  }

  archive(
    scope: TenantScope,
    companyId: string,
    data: ArchiveData,
    audit: AuditIntent<{ sessionsClosed: number }>,
  ): Promise<number> {
    return this.prisma.withScope(scope, async (tx) => {
      // La condición va en el mismo UPDATE: si dos peticiones llegan a la vez, solo una cambia la fila (la otra espera su turno y ya no la encuentra activa).
      const archived = await tx.company.updateMany({
        where: { id: companyId, status: { not: 'deactivated' } },
        data: {
          status: 'deactivated',
          deactivatedAt: data.at,
          archiveUntil: data.archiveUntil,
          deactivationReasonCode: data.reasonCode,
          deactivationReason: data.reason,
          deactivatedBy: data.by,
          archiveSnapshotKey: data.snapshotKey,
        },
      });
      if (archived.count === 0) throw new DomainError('COMPANY_ALREADY_DEACTIVATED');
      // Lo que sigue es de tenant: sessions, mfa_challenges y executions solo se ven con el `app.tenant_id` de esa empresa (RLS). Se fija el de la empresa y,
      // al final, se restaura el de quien actúa.
      await tx.$queryRaw`SELECT set_config('app.tenant_id', ${companyId}, true)`;
      // Sin sesión no hay acceso (se valida en cada petición) y sin desafío abierto nadie termina de entrar.
      const sessions = await tx.session.updateMany({ where: { companyId, revokedAt: null }, data: { revokedAt: data.at } });
      await tx.mfaChallenge.deleteMany({ where: { companyId } });
      // D123 · Y ningún dispositivo recordado de la empresa archivada vale.
      await revokeTrustedDevices(tx, { companyId }, data.at);
      // Lo que estaba en cola o en curso se cancela; el trabajador ya no reclama a una empresa archivada.
      await tx.execution.updateMany({
        where: { tenantId: companyId, status: { in: ['queued', 'running'] } },
        data: { status: 'cancelled', finishedAt: data.at, failureReason: 'company.archived' },
      });
      await tx.$queryRaw`SELECT set_config('app.tenant_id', ${scope.companyId}, true)`;
      await insertAuditLog(tx, audit({ sessionsClosed: sessions.count }));
      return sessions.count;
    });
  }

  exportSnapshot(scope: TenantScope, companyId: string): Promise<unknown> {
    return this.prisma.withScope(
      scope,
      async (tx) => {
        const rows = await tx.$queryRaw<Array<{ snapshot: unknown }>>`SELECT platform.export_company(${companyId}::uuid) AS snapshot`;
        return rows[0]?.snapshot;
      },
      { timeoutMs: 120_000 },
    );
  }

  reactivate(scope: TenantScope, companyId: string, audit: AuditIntent<{ snapshotKey: string | null }>): Promise<string | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // Se vuelve a comprobar aquí, con la fila bloqueada (FOR UPDATE): entre la verificación del caso de uso y este cambio la empresa pudo reactivarse por otra
      // petición o vencer su plazo, y el borrado definitivo no debe competir con una reactivación tardía.
      const [before] = await tx.$queryRaw<Array<{ status: string; archiveSnapshotKey: string | null }>>`
        SELECT status::text AS status, archive_snapshot_key AS "archiveSnapshotKey" FROM platform.companies WHERE id = ${companyId}::uuid FOR UPDATE`;
      if (!before) throw new DomainError('NOT_FOUND');
      const reactivated = await tx.company.updateMany({
        where: { id: companyId, status: 'deactivated', archiveUntil: { gt: new Date() } },
        data: {
          status: 'active',
          deactivatedAt: null,
          archiveUntil: null,
          deactivationReasonCode: null,
          deactivationReason: null,
          deactivatedBy: null,
          archiveSnapshotKey: null,
        },
      });
      if (reactivated.count === 0) throw new DomainError(before.status !== 'deactivated' ? 'COMPANY_NOT_DEACTIVATED' : 'COMPANY_ARCHIVE_EXPIRED');
      await insertAuditLog(tx, audit({ snapshotKey: before.archiveSnapshotKey }));
      return before.archiveSnapshotKey;
    });
  }

  listArchived(scope: TenantScope, dueBefore?: Date): Promise<ArchivedCompany[]> {
    return this.prisma.withScope(scope, async (tx) => {
      const rows = await tx.company.findMany({
        where: { status: 'deactivated', archiveUntil: dueBefore ? { lte: dueBefore } : { not: null } },
        orderBy: { archiveUntil: 'asc' },
        select: { id: true, name: true, archiveUntil: true, deactivationReasonCode: true, archiveSnapshotKey: true },
      });
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        archiveUntil: r.archiveUntil as Date,
        reasonCode: r.deactivationReasonCode,
        snapshotKey: r.archiveSnapshotKey,
      }));
    });
  }

  purge(scope: TenantScope, companyId: string, cleanFiles: () => Promise<void>, audit: AuditIntent<{ name: string }>): Promise<string | null> {
    return this.prisma.withScope(
      scope,
      async (tx) => {
        // Un candado por empresa, que vive lo que dure la transacción: con varias réplicas corriendo la tarea, solo una borra sus archivos y su base. Quien no lo
        // consigue la deja a la que ya va en camino; quien lo consigue tarde la encuentra ya borrada.
        const [{ locked }] = await tx.$queryRaw<Array<{ locked: boolean }>>`SELECT pg_try_advisory_xact_lock(hashtextextended(${'company_purge:' + companyId}, 0)) AS locked`;
        if (!locked) return null;
        if ((await tx.company.count({ where: { id: companyId } })) === 0) return null;
        // Primero los archivos y después la base, con el candado tomado: si algo falla la empresa sigue archivada y se reintenta en la pasada siguiente.
        await cleanFiles();
        const rows = await tx.$queryRaw<Array<{ name: string }>>`SELECT platform.purge_company(${companyId}::uuid) AS name`;
        const name = rows[0]!.name;
        // El rastro mínimo también en la auditoría: sin `company_id` ni datos del cliente, para que la propia purga no lo borre.
        await insertAuditLog(tx, audit({ name }));
        return name;
      },
      { timeoutMs: 300_000 },
    );
  }

  // D103 · Cuentas que cuentan para el cupo, de toda la página en una consulta. `users` tiene RLS por empresa y admin_monkey no ve las de otras:
  // la función SECURITY DEFINER devuelve solo conteos y aplica el aislamiento por dentro.
  private async usersCounts(tx: TransactionClient, companyIds: string[]): Promise<Map<string, number>> {
    if (companyIds.length === 0) return new Map();
    const rows = await tx.$queryRaw<Array<{ company_id: string; users_count: number }>>`
      SELECT company_id, users_count FROM platform.company_users_count(${companyIds}::uuid[])`;
    return new Map(rows.map((r) => [r.company_id, r.users_count]));
  }

  // "¿Existe ya organizations para esta empresa?" (campo derivado del contrato). organizations es
  // de tenant y su política solo mira app.tenant_id, sin excepción para admin_monkey: dentro de la
  // misma transacción se fija el tenant de cada empresa para consultarla, y al final se restaura.
  private async onboardedCompanyIds(
    tx: TransactionClient,
    scope: TenantScope,
    companyIds: string[],
  ): Promise<Set<string>> {
    const onboarded = new Set<string>();
    for (const id of companyIds) {
      await tx.$queryRaw`SELECT set_config('app.tenant_id', ${id}, true)`;
      const organization = await tx.organization.findUnique({
        where: { companyId: id },
        select: { id: true },
      });
      if (organization) onboarded.add(id);
    }
    await tx.$queryRaw`SELECT set_config('app.tenant_id', ${scope.companyId}, true)`;
    return onboarded;
  }
}
