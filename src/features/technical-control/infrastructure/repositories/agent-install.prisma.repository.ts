import { Injectable } from '@nestjs/common';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { DomainError } from '../../../../common/errors/domain-error';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { EnrollmentExecutionStatus } from '../../domain/agent-install/install-state';
import { AgentInstallFacts, AgentInstallRepository } from '../../domain/repositories/agent-install.repository';

@Injectable()
export class AgentInstallPrismaRepository extends AgentInstallRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  getFacts(scope: TenantScope, assetId: string): Promise<AgentInstallFacts | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // Un activo dado de baja, o descubierto dentro de una cuenta de nube, no es una conexión: no existe aquí (igual que en el resto del módulo).
      const asset = await tx.asset.findFirst({
        where: { id: assetId, status: 'active', parentAssetId: null },
        select: {
          id: true,
          agent: { select: { agentId: true, installKeyCipher: true, installKeyExpiresAt: true, status: true, lastSyncAt: true, scaPolicy: { select: { osCode: true, versionCode: true, distribution: true, distributionName: true, versionLabel: true } } } },
        },
      });
      if (!asset) return null;
      const last = await tx.execution.findFirst({ where: { assetId, kind: 'enrollment' }, orderBy: { queuedAt: 'desc' }, select: { status: true, failureReason: true } });
      // Cuándo terminó Monkey de crear el agente: desde ahí corre el plazo en que lo busca solo (D112).
      const enrolled = await tx.execution.findFirst({ where: { assetId, kind: 'enrollment', status: 'completed' }, orderBy: { finishedAt: 'desc' }, select: { finishedAt: true } });
      const a = asset.agent;
      const sp = a?.scaPolicy;
      const complete = a && sp?.osCode && sp.versionCode && sp.distribution && sp.distributionName && sp.versionLabel;
      return {
        assetId: asset.id,
        agent: complete
          ? {
              agentId: a.agentId,
              hasKey: a.installKeyCipher !== null,
              keyExpiresAt: a.installKeyExpiresAt,
              status: a.status,
              lastSyncAt: a.lastSyncAt,
              enrolledAt: enrolled?.finishedAt ?? null,
              os: sp.osCode!,
              osVersion: { code: sp.versionCode!, distribution: sp.distribution!, distributionName: sp.distributionName!, versionLabel: sp.versionLabel! },
            }
          : null,
        latestEnrollment: last ? { status: last.status as EnrollmentExecutionStatus, failureReason: last.failureReason } : null,
      };
    });
  }

  queueEnrollment(scope: TenantScope, assetId: string, opts: { reset: boolean }, audit: AuditIntent<{ executionId: string }>): Promise<{ executionId: string }> {
    return this.prisma.withScope(scope, async (tx) => {
      const agent = await tx.assetAgent.findFirst({ where: { assetId, asset: { status: 'active', parentAssetId: null } }, select: { id: true } });
      if (!agent) throw new DomainError('NOT_FOUND');
      let executionId: string;
      try {
        // El índice único parcial `executions_one_open_per_asset` decide: un activo no tiene dos ejecuciones abiertas.
        executionId = (await tx.execution.create({ data: { tenantId: scope.companyId, assetId, status: 'queued', origin: 'manual', kind: 'enrollment' }, select: { id: true } })).id;
      } catch (e) {
        if ((e as { code?: string }).code === 'P2002') throw new DomainError('EXECUTION_IN_PROGRESS');
        throw e;
      }
      if (opts.reset) {
        await tx.assetAgent.update({ where: { id: agent.id }, data: { agentId: null, installKeyCipher: null, installKeyExpiresAt: null, status: 'pending', firstSeenAt: null, lastSeenAt: null, lastSyncAt: null } });
      }
      const queued = { executionId };
      await insertAuditLog(tx, audit(queued));
      return queued;
    });
  }

  takeInstallKey(scope: TenantScope, assetId: string, audit: AuditIntent<{ assetId: string }>): Promise<string | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // Atómico: el SELECT ... FOR UPDATE bloquea la fila y el UPDATE la deja sin clave; solo UNA petición se lleva el valor. Caduca por su fecha, no por quien pregunte.
      const rows = await tx.$queryRaw<{ cipher: string }[]>`
        WITH old AS (
          SELECT id, install_key_cipher AS cipher
            FROM tenant.asset_agents
           WHERE asset_id = ${assetId}::uuid
             AND install_key_cipher IS NOT NULL
             AND install_key_expires_at > (now() AT TIME ZONE 'utc')
             FOR UPDATE
        )
        UPDATE tenant.asset_agents a
           SET install_key_cipher = NULL, install_key_expires_at = NULL
          FROM old
         WHERE a.id = old.id
        RETURNING old.cipher AS cipher`;
      if (rows.length === 0) return null;
      await insertAuditLog(tx, audit({ assetId }));
      return rows[0].cipher;
    });
  }

  loadEnrollmentTarget(scope: TenantScope, executionId: string): Promise<{ assetId: string; platform: string; retired: boolean }> {
    return this.prisma.withScope(scope, async (tx) => {
      const execution = await tx.execution.findFirst({ where: { id: executionId, kind: 'enrollment' }, select: { assetId: true } });
      if (!execution) throw new DomainError('NOT_FOUND');
      const asset = await tx.asset.findFirst({ where: { id: execution.assetId }, select: { platform: true, status: true } });
      if (!asset) throw new DomainError('NOT_FOUND');
      return { assetId: execution.assetId, platform: asset.platform, retired: asset.status !== 'active' };
    });
  }

  completeRemoval(scope: TenantScope, executionId: string, audit: AuditIntent<{ executionId: string; assetId: string }>): Promise<{ assetId: string }> {
    return this.prisma.withScope(scope, async (tx) => {
      const closed = await tx.execution.updateMany({ where: { id: executionId, kind: 'enrollment', status: 'running' }, data: { status: 'completed', finishedAt: new Date(), progressPercentage: 100 } });
      if (closed.count === 0) throw new DomainError('EXECUTION_NOT_RUNNING');
      const execution = await tx.execution.findFirstOrThrow({ where: { id: executionId }, select: { assetId: true } });
      await insertAuditLog(tx, audit({ executionId, assetId: execution.assetId }));
      return { assetId: execution.assetId };
    });
  }

  completeEnrollment(
    scope: TenantScope,
    executionId: string,
    input: { agentId: string; keyCipher: string; keyExpiresAt: Date },
    audit: AuditIntent<{ executionId: string; assetId: string; agentId: string; released: number }>,
  ): Promise<{ assetId: string }> {
    return this.prisma.withScope(scope, async (tx) => {
      // Condicional: solo una creación de agente en curso se cierra, y solo una vez.
      const closed = await tx.execution.updateMany({ where: { id: executionId, kind: 'enrollment', status: 'running' }, data: { status: 'completed', finishedAt: new Date(), progressPercentage: 100 } });
      if (closed.count === 0) throw new DomainError('EXECUTION_NOT_RUNNING');
      const execution = await tx.execution.findFirstOrThrow({ where: { id: executionId }, select: { assetId: true } });
      // La sonda recicla ids: si este id figuraba en otro activo (de cualquier empresa), ese agente ya no existe en ella y su vínculo es una referencia colgada. Se suelta antes de enlazar.
      const [{ released }] = await tx.$queryRaw<{ released: number }[]>`SELECT tenant.release_agent_id(${input.agentId}, ${execution.assetId}::uuid) AS released`;
      try {
        const linked = await tx.assetAgent.updateMany({
          where: { assetId: execution.assetId },
          data: { agentId: input.agentId, installKeyCipher: input.keyCipher, installKeyExpiresAt: input.keyExpiresAt, status: 'pending' },
        });
        if (linked.count === 0) throw new DomainError('NOT_FOUND');
      } catch (e) {
        // `agent_id` es único en toda la base: un agente no puede ser de dos activos.
        if ((e as { code?: string }).code === 'P2002') throw new DomainError('AGENT_ALREADY_LINKED');
        throw e;
      }
      await insertAuditLog(tx, audit({ executionId, assetId: execution.assetId, agentId: input.agentId, released: Number(released) }));
      return { assetId: execution.assetId };
    });
  }
}
