import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page, PageRequest } from '../../../../common/pagination/page';
import {
  ExpectedAvailability,
  TRUST_CRITERION_MANDATORY,
  TrustCriterionValue,
} from '../../../../common/catalogs/service-catalogs';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import {
  fileNameOfKey,
  ServiceData,
  ServiceDetail,
  ServiceInput,
  ServicePatch,
  SubserviceInput,
  SystemDescriptionInput,
  SystemDescriptionView,
} from '../../domain/entities/service.entity';
import { Change, ServiceRepository } from '../../domain/repositories/service.repository';
import { CloneCatalogService } from '../../../onboarding/application/clone-catalog.service';

// Crear o ampliar un servicio clona el catálogo en la misma transacción: escribe unos cientos de
// filas contra la base, así que necesita más de los 5 s que Prisma da por defecto.
const CLONING_TRANSACTION = { timeoutMs: 60_000 };

// Leer un servicio son varias consultas seguidas (sus criterios, marcos, proveedores, conexiones y conteos) y la lista lee uno por uno. Contra una base remota (~100 ms por consulta)
// con unos cuantos servicios se pasaba de los 5 s de Prisma y la lista fallaba con 500 (DT-82).
const READ_TRANSACTION = { timeoutMs: 30_000 };

// "2026-Q4": el periodo de evaluación con que se contrata un marco (A4, modelo-datos.md §6.2).
const evaluationPeriodFor = (date: Date): string =>
  `${date.getUTCFullYear()}-Q${Math.floor(date.getUTCMonth() / 3) + 1}`;

const startOfDayUtc = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

// Prisma no admite miembros de enum que empiecen con dígito: en sus consultas el valor "24x7" se
// llama `h24x7`. Los tipos generados dicen "24x7", pero el runtime solo acepta el nombre.
const toDbAvailability = (value: ExpectedAvailability): never =>
  (value === '24x7' ? 'h24x7' : value) as never;
const fromDbAvailability = (value: string): ExpectedAvailability =>
  (value === 'h24x7' ? '24x7' : value) as ExpectedAvailability;

const subserviceKey = (s: SubserviceInput): string =>
  JSON.stringify([s.type, s.provider, s.serviceProvided, s.responsibility]);

const toSystemDescriptionView = (row: {
  id: string;
  linkUrl: string | null;
  fileKey: string | null;
  sections: unknown;
}): SystemDescriptionView => ({
  id: row.id,
  url: row.linkUrl,
  fileName: row.fileKey ? fileNameOfKey(row.fileKey) : null,
  storageKey: row.fileKey,
  sections: Array.isArray(row.sections) ? row.sections : [],
});

const withMandatory =(criteria: TrustCriterionValue[]): TrustCriterionValue[] =>
  criteria.includes(TRUST_CRITERION_MANDATORY) ? criteria : [TRUST_CRITERION_MANDATORY, ...criteria];

@Injectable()
export class ServicePrismaRepository extends ServiceRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloneCatalog: CloneCatalogService,
  ) {
    super();
  }

  async existingFrameworkCodes(codes: string[]): Promise<string[]> {
    const rows = await this.prisma.framework.findMany({
      where: { code: { in: codes } },
      select: { code: true },
      distinct: ['code'],
    });
    return rows.map((r) => r.code);
  }

  contractedFrameworkCodes(scope: TenantScope): Promise<string[]> {
    return this.prisma.withScope(scope, async (tx) => {
      const rows = await tx.companyFramework.findMany({
        where: { companyId: scope.companyId },
        select: { framework: { select: { code: true } } },
      });
      return [...new Set(rows.map((r) => r.framework.code))];
    });
  }

  create(scope: TenantScope, input: ServiceInput, audit: AuditIntent<ServiceDetail>): Promise<ServiceDetail> {
    return this.prisma.withScope(scope, async (tx) => {
      const organization = await tx.organization.findUnique({
        where: { companyId: scope.companyId },
        select: { id: true },
      });
      if (!organization) throw new DomainError('ORGANIZATION_NOT_DECLARED');
      await this.assertNameFree(tx, organization.id, input.name, null);

      const service = await tx.service.create({
        data: {
          tenantId: scope.companyId,
          organizationId: organization.id,
          name: input.name,
          description: input.description,
          scopeStatement: input.scopeStatement,
          type: input.type,
          industriesServed: input.industriesServed,
          activeClientCount: input.activeClientCount,
          countries: input.countries,
          dataTypes: input.dataTypes,
          expectedAvailability: toDbAvailability(input.expectedAvailability),
          previousCertification: input.previousCertification,
        },
        select: { id: true },
      });

      await this.replaceTrustCriteria(tx, scope.companyId, service.id, withMandatory(input.trustCriteria));
      await this.syncSubservices(tx, scope.companyId, service.id, input.subserviceOrganizations);
      if (input.systemDescription) {
        await this.upsertSystemDescription(tx, scope.companyId, service.id, input.systemDescription);
      }
      await this.syncFrameworks(tx, scope.companyId, service.id, input.frameworkCodes);
      await this.cloneContractedFrameworks(tx, service.id);

      const created = await this.read(tx, service.id);
      await insertAuditLog(tx, audit(created));
      return created;
    }, CLONING_TRANSACTION);
  }

  list(scope: TenantScope, request: PageRequest): Promise<Page<ServiceDetail>> {
    return this.prisma.withScope(scope, async (tx) => {
      // D96 · Un `funcional` lee solo los servicios en los que es responsable de alguna dimensión; el administrador y el auditor, todos.
      const where = { organization: { companyId: scope.companyId }, ...(scope.role === 'funcional' ? await this.specialtyOf(tx, scope.userId as string) : {}) };
      const total = await tx.service.count({ where });
      const rows = await tx.service.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (request.page - 1) * request.pageSize,
        take: request.pageSize,
        select: { id: true },
      });
      const items: ServiceDetail[] = [];
      for (const row of rows) items.push(await this.read(tx, row.id));
      return { items, total, page: request.page, pageSize: request.pageSize };
    }, READ_TRANSACTION);
  }

  isResponsible(scope: TenantScope, serviceId: string): Promise<boolean> {
    return this.prisma.withScope(scope, async (tx) => !!(await tx.service.findFirst({ where: { id: serviceId, ...(await this.specialtyOf(tx, scope.userId as string)) }, select: { id: true } })));
  }

  // D98 · Un funcional lee los servicios que tienen pruebas de alguna de sus especialidades (los controles de todo servicio llevan pruebas documentales, así que quien tiene la
  // documental los ve todos). Sin especialidad, ninguno.
  private async specialtyOf(tx: TransactionClient, userId: string) {
    const dimensions = (await tx.userDimension.findMany({ where: { userId }, select: { dimension: true } })).map((d) => d.dimension);
    return { clientControls: { some: { isActive: true, tests: { some: { test: { dimension: { in: dimensions } } } } } } };
  }
  findById(scope: TenantScope, id: string): Promise<ServiceDetail | null> {
    return this.prisma.withScope(scope, (tx) => this.readOrNull(tx, id), READ_TRANSACTION);
  }

  update(
    scope: TenantScope,
    id: string,
    patch: ServicePatch,
    audit: AuditIntent<Change>,
  ): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.readOrNull(tx, id);
      if (!before) return null;

      if (patch.name !== undefined) {
        await this.assertNameFree(tx, before.data.organizationId, patch.name, id);
      }
      await tx.service.update({
        where: { id },
        data: {
          name: patch.name,
          description: patch.description,
          scopeStatement: patch.scopeStatement,
          type: patch.type,
          industriesServed: patch.industriesServed,
          activeClientCount: patch.activeClientCount,
          countries: patch.countries,
          dataTypes: patch.dataTypes,
          expectedAvailability:
            patch.expectedAvailability === undefined
              ? undefined
              : toDbAvailability(patch.expectedAvailability),
          previousCertification: patch.previousCertification,
        },
      });

      if (patch.trustCriteria) {
        await this.replaceTrustCriteria(tx, scope.companyId, id, withMandatory(patch.trustCriteria));
      }
      if (patch.subserviceOrganizations) {
        await this.syncSubservices(tx, scope.companyId, id, patch.subserviceOrganizations);
      }
      if (patch.systemDescription) {
        await this.upsertSystemDescription(tx, scope.companyId, id, patch.systemDescription);
      }
      if (patch.frameworkCodes) {
        await this.syncFrameworks(tx, scope.companyId, id, patch.frameworkCodes);
      }
      // Ampliar criterios o marcos recalcula los requisitos aplicables y clona lo que falte. Nunca
      // borra ni pisa: lo que el cliente ya tiene (y editó) se queda como está.
      if (patch.trustCriteria || patch.frameworkCodes) {
        await this.cloneContractedFrameworks(tx, id);
      }

      const change = { before, after: await this.read(tx, id) };
      await insertAuditLog(tx, audit(change));
      return change;
    }, CLONING_TRANSACTION);
  }

  setSystemDescription(
    scope: TenantScope,
    id: string,
    input: SystemDescriptionInput,
    audit: AuditIntent<Change>,
  ): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.readOrNull(tx, id);
      if (!before) return null;
      await this.upsertSystemDescription(tx, scope.companyId, id, input);
      const change = { before, after: await this.read(tx, id) };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  remove(scope: TenantScope, id: string, audit: AuditIntent<ServiceDetail>): Promise<ServiceDetail | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.readOrNull(tx, id);
      if (!before) return null;

      // El histórico es inmutable: con evaluaciones, evidencias entregadas, planes de acción u observaciones
      // del auditor (que nunca se borran, MD-154) el servicio no se borra.
      const history =
        (await tx.evaluation.count({ where: { serviceId: id } })) +
        (await tx.auditObservation.count({ where: { serviceId: id } })) +
        (await tx.evidenceSubmission.count({
          where: { evidenceRequirement: { clientControl: { serviceId: id } } },
        })) +
        (await tx.actionPlan.count({ where: { clientControl: { serviceId: id } } }));
      if (history > 0) throw new DomainError('SERVICE_HAS_EVALUATIONS');

      // Solo lo que clonó el onboarding y lo que el cliente declaró; en el orden de las FK.
      const clientControls = { clientControl: { serviceId: id } };
      await tx.clientCauseControl.deleteMany({ where: clientControls });
      await tx.clientRiskCause.deleteMany({ where: { clientRisk: { serviceId: id } } });
      await tx.evidenceRequirement.deleteMany({ where: clientControls });
      await tx.clientControlTest.deleteMany({ where: clientControls });
      await tx.clientControlDimension.deleteMany({ where: clientControls });
      await tx.userControlAssignment.deleteMany({ where: clientControls });
      await tx.clientControl.deleteMany({ where: { serviceId: id } });
      await tx.clientCause.deleteMany({ where: { serviceId: id } });
      await tx.clientRisk.deleteMany({ where: { serviceId: id } });
      await tx.serviceAsset.deleteMany({ where: { serviceId: id } });
      await tx.csoc.deleteMany({ where: { subserviceOrganization: { serviceId: id } } });
      await tx.cuec.deleteMany({ where: { serviceId: id } });
      await tx.subserviceOrganization.deleteMany({ where: { serviceId: id } });
      await tx.systemDescription.deleteMany({ where: { serviceId: id } });
      await tx.serviceFramework.deleteMany({ where: { serviceId: id } });
      await tx.serviceTrustCriterion.deleteMany({ where: { serviceId: id } });
      await tx.service.delete({ where: { id } });
      await insertAuditLog(tx, audit(before));
      return before;
    }, CLONING_TRANSACTION);
  }

  // --- escritura -------------------------------------------------------------------------------

  private async assertNameFree(
    tx: TransactionClient,
    organizationId: string,
    name: string,
    exceptId: string | null,
  ): Promise<void> {
    const clash = await tx.service.findFirst({
      where: {
        organizationId,
        name: { equals: name, mode: 'insensitive' },
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      select: { id: true },
    });
    if (clash) throw new DomainError('SERVICE_NAME_TAKEN');
  }

  private async replaceTrustCriteria(
    tx: TransactionClient,
    tenantId: string,
    serviceId: string,
    criteria: TrustCriterionValue[],
  ): Promise<void> {
    const wanted = await tx.trustCriterion.findMany({
      where: { criterion: { in: criteria } },
      select: { id: true },
    });
    const wantedIds = wanted.map((c) => c.id);
    await tx.serviceTrustCriterion.deleteMany({
      where: { serviceId, trustCriterionId: { notIn: wantedIds } },
    });
    const kept = await tx.serviceTrustCriterion.findMany({
      where: { serviceId },
      select: { trustCriterionId: true },
    });
    const keptIds = new Set(kept.map((c) => c.trustCriterionId));
    const toAdd = wantedIds.filter((id) => !keptIds.has(id));
    if (toAdd.length) {
      await tx.serviceTrustCriterion.createMany({
        data: toAdd.map((trustCriterionId) => ({ tenantId, serviceId, trustCriterionId })),
      });
    }
  }

  // Deja exactamente la lista enviada. Un proveedor que no cambió conserva su id (de él cuelgan
  // los CSOC), así que solo se borran los que sobran y se crean los nuevos.
  private async syncSubservices(
    tx: TransactionClient,
    tenantId: string,
    serviceId: string,
    wanted: SubserviceInput[],
  ): Promise<void> {
    const current = await tx.subserviceOrganization.findMany({ where: { serviceId } });
    const pending = new Map<string, number>();
    for (const s of wanted) pending.set(subserviceKey(s), (pending.get(subserviceKey(s)) ?? 0) + 1);

    const toDelete: string[] = [];
    for (const row of current) {
      const key = subserviceKey({
        type: row.type,
        provider: row.provider,
        serviceProvided: row.serviceProvided,
        responsibility: row.responsibility,
      });
      const left = pending.get(key) ?? 0;
      if (left > 0) pending.set(key, left - 1);
      else toDelete.push(row.id);
    }
    if (toDelete.length) {
      await tx.subserviceOrganization.deleteMany({ where: { id: { in: toDelete } } });
    }
    const toCreate = wanted.filter((s) => {
      const left = pending.get(subserviceKey(s)) ?? 0;
      if (left <= 0) return false;
      pending.set(subserviceKey(s), left - 1);
      return true;
    });
    if (toCreate.length) {
      await tx.subserviceOrganization.createMany({
        data: toCreate.map((s) => ({
          tenantId,
          serviceId,
          type: s.type,
          provider: s.provider,
          serviceProvided: s.serviceProvided,
          responsibility: s.responsibility,
        })),
      });
    }
  }

  private async upsertSystemDescription(
    tx: TransactionClient,
    tenantId: string,
    serviceId: string,
    input: SystemDescriptionInput,
  ): Promise<void> {
    // Una Descripción del Sistema por servicio. Al cambiar el documento se vacían las secciones:
    // las que había detectado ya no corresponden.
    // Solo cambia lo que viene: un enlace nuevo no borra el archivo, ni al revés. Al crearla, el caso de
    // uso garantiza que viene al menos uno (el CHECK de la base lo vuelve a exigir).
    const source = { linkUrl: input.linkUrl, fileKey: input.fileKey };
    await tx.systemDescription.upsert({
      where: { serviceId },
      create: { tenantId, serviceId, ...source, sections: [] },
      update: { ...source, sections: [] },
    });
  }

  // Contrata los marcos pedidos (con la versión vigente del catálogo y el periodo actual), pausa
  // los que ya no se piden y reactiva los que vuelven. No borra nada: el histórico manda.
  private async syncFrameworks(
    tx: TransactionClient,
    tenantId: string,
    serviceId: string,
    codes: string[],
  ): Promise<void> {
    const current = await tx.serviceFramework.findMany({
      where: { serviceId },
      include: { framework: { select: { code: true } } },
    });
    const currentByCode = new Map(current.map((f) => [f.framework.code, f]));

    for (const row of current) {
      if (!codes.includes(row.framework.code) && row.status === 'active') {
        await tx.serviceFramework.update({ where: { id: row.id }, data: { status: 'paused' } });
      }
    }

    const today = new Date();
    for (const code of codes) {
      const existing = currentByCode.get(code);
      if (existing) {
        if (existing.status !== 'active') {
          await tx.serviceFramework.update({ where: { id: existing.id }, data: { status: 'active' } });
        }
        continue;
      }
      const framework = await tx.framework.findFirstOrThrow({
        where: { code },
        orderBy: { version: 'desc' },
        select: { id: true },
      });
      const version = await tx.catalogVersion.findFirstOrThrow({
        orderBy: { number: 'desc' },
        select: { id: true },
      });
      await tx.serviceFramework.create({
        data: {
          tenantId,
          serviceId,
          frameworkId: framework.id,
          catalogVersionId: version.id,
          contractedAt: startOfDayUtc(today),
          evaluationPeriod: evaluationPeriodFor(today),
        },
      });
    }
  }

  // Elegir marco dispara el clonado sin acción manual (MD-80, criterio de aceptación del sprint). El
  // clonado es el de `CloneCatalogService` (D40): idempotente, respeta lo que el cliente personalizó y
  // corre en esta misma transacción, con el tenant ya fijado.
  private async cloneContractedFrameworks(tx: TransactionClient, serviceId: string): Promise<void> {
    const frameworks = await tx.serviceFramework.findMany({
      where: { serviceId, status: 'active' },
      select: { id: true },
    });
    for (const f of frameworks) await this.cloneCatalog.cloneForServiceFramework(tx, f.id);
  }

  // --- lectura ---------------------------------------------------------------------------------

  private async read(tx: TransactionClient, id: string): Promise<ServiceDetail> {
    const detail = await this.readOrNull(tx, id);
    if (!detail) throw new DomainError('NOT_FOUND');
    return detail;
  }

  private async readOrNull(tx: TransactionClient, id: string): Promise<ServiceDetail | null> {
    const row = await tx.service.findUnique({
      where: { id },
      include: {
        trustCriteria: { include: { trustCriterion: true } },
        frameworks: { include: { framework: true, catalogVersion: true } },
        subserviceOrganizations: true,
        systemDescription: true,
        _count: { select: { serviceAssets: { where: { asset: { status: 'active', parentAssetId: null } } } } },
      },
    });
    if (!row) return null;

    const criterionIds = row.trustCriteria.map((c) => c.trustCriterionId);
    const activeFrameworkIds = row.frameworks.filter((f) => f.status === 'active').map((f) => f.frameworkId);
    const [applicableRequirements, clonedControls] = await Promise.all([
      tx.requirement.count({
        where: { frameworkId: { in: activeFrameworkIds }, trustCriterionId: { in: criterionIds } },
      }),
      tx.clientControl.count({ where: { serviceId: id, isActive: true } }),
    ]);

    const data: ServiceData = {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      description: row.description,
      scopeStatement: row.scopeStatement,
      type: row.type,
      industriesServed: row.industriesServed,
      activeClientCount: row.activeClientCount,
      countries: row.countries,
      dataTypes: row.dataTypes,
      // Orden estable: el de los 5 criterios del contrato, no el de inserción.
      trustCriteria: row.trustCriteria
        .map((c) => c.trustCriterion.criterion)
        .sort((a, b) => a.localeCompare(b)),
      subserviceOrganizations: row.subserviceOrganizations.map((s) => ({
        id: s.id,
        type: s.type,
        provider: s.provider,
        serviceProvided: s.serviceProvided,
        responsibility: s.responsibility,
      })),
      frameworks: row.frameworks
        .map((f) => ({
          code: f.framework.code,
          name: f.framework.name,
          contractedAt: f.contractedAt.toISOString().slice(0, 10),
          status: f.status,
          catalogVersion: f.catalogVersion.number,
          evaluationPeriod: f.evaluationPeriod,
        }))
        .sort((a, b) => a.code.localeCompare(b.code)),
      previousCertification: row.previousCertification,
      expectedAvailability: fromDbAvailability(row.expectedAvailability),
      systemDescription: row.systemDescription ? toSystemDescriptionView(row.systemDescription) : null,
      catalog: { status: 'ready', applicableRequirements, clonedControls },
      connectionCount: row._count.serviceAssets,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return new ServiceDetail(data);
  }
}
