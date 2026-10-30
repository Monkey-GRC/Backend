import { randomUUID } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { CredentialCipher } from '../../../../common/security/credential-cipher';
import { FileStorage } from '../../../../common/storage/file-storage';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { StepUp } from '../../../auth/application/services/step-up.service';
import { CompanyDetail } from '../../domain/entities/company-overview';
import { CompanyRepository } from '../../domain/repositories/company.repository';

export type ArchiveCompanyInput = {
  confirmName: string;
  reasonCode: 'non_payment' | 'client_request' | 'other';
  reason: string;
  retentionDays: number;
  totpCode?: string;
};

const DAY_MS = 86_400_000;

// D97 · Archivar una empresa: corta accesos y motores y fija cuándo se borra todo. Es reversible hasta ese día.
@Injectable()
export class ArchiveCompanyUseCase {
  constructor(
    private readonly companies: CompanyRepository,
    private readonly stepUp: StepUp,
    private readonly cipher: CredentialCipher,
    private readonly storage: FileStorage,
    private readonly audit: AuditLogWriter,
  ) {}

  async execute(principal: Principal, companyId: string, input: ArchiveCompanyInput, meta: RequestMeta): Promise<CompanyDetail> {
    const scope: TenantScope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    // La empresa interna de Monkey no es un cliente: no se archiva (responde como si no existiera).
    const detail = await this.companies.findById(scope, companyId, principal.companyId);
    if (!detail) throw new DomainError('NOT_FOUND');
    const { company } = detail;
    if (company.status === 'deactivated') {
      await this.recordRefusal(principal, companyId, 'already_deactivated', meta);
      throw new DomainError('COMPANY_ALREADY_DEACTIVATED');
    }
    if (input.confirmName !== company.name) {
      await this.recordRefusal(principal, companyId, 'confirmation_mismatch', meta);
      throw new DomainError('CONFIRMATION_MISMATCH');
    }

    await this.stepUp.assert(scope, principal.userId, input.totpCode, meta);

    // La copia de cómo quedó la empresa, antes de tocar nada: cifrada, en el bucket privado y bajo el prefijo de la propia empresa (se borra con ella).
    // Si no se puede guardar, no se archiva.
    const now = new Date();
    const snapshot = await this.companies.exportSnapshot(scope, companyId);
    const packed = gzipSync(Buffer.from(JSON.stringify(snapshot), 'utf8')).toString('base64');
    // El sufijo único evita que dos archivados simultáneos compartan llave: el que pierde borra la suya, y no debe llevarse la copia del que ganó.
    const snapshotKey = `${companyId}/archive/${now.toISOString().replace(/[:.]/g, '-')}-${randomUUID()}.snapshot`;
    await this.storage.put(snapshotKey, Buffer.from(this.cipher.encrypt({ snapshot: packed }), 'utf8'), 'application/octet-stream');

    const archiveUntil = new Date(now.getTime() + input.retentionDays * DAY_MS);
    try {
      await this.companies.archive(
        scope,
        companyId,
        { reasonCode: input.reasonCode, reason: input.reason, archiveUntil, snapshotKey, at: now, by: principal.userId },
        ({ sessionsClosed }) => ({
          // Acción de plataforma: tenant_id nulo (la hace admin_monkey). Solo lo mínimo de la empresa; el motivo vive en su fila y se borra con ella.
          tenantId: null,
          userId: principal.userId,
          action: 'company.deactivate',
          resource: 'company',
          result: 'success',
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          beforeState: { status: company.status },
          afterState: {
            company_id: companyId,
            name: company.name,
            status: 'deactivated',
            reason_code: input.reasonCode,
            archive_until: archiveUntil.toISOString(),
            sessions_closed: sessionsClosed,
          },
        }),
      );
    } catch (error) {
      // No quedó archivada: la copia no sirve de nada y no debe quedar guardada.
      await this.storage.remove(snapshotKey);
      throw error;
    }

    const archived = await this.companies.findById(scope, companyId, principal.companyId);
    return archived!;
  }

  // D97 punto 12 · Un intento rechazado también deja rastro, pero solo el mínimo: quién, sobre qué empresa y por qué no pasó (nunca lo que escribió).
  private recordRefusal(principal: Principal, companyId: string, reason: 'already_deactivated' | 'confirmation_mismatch', meta: RequestMeta): Promise<void> {
    return this.audit.write({
      tenantId: null,
      userId: principal.userId,
      action: 'company.deactivate',
      resource: 'company',
      result: 'error',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState: { company_id: companyId, reason },
    });
  }
}
