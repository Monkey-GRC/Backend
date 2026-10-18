import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { FileStorage } from '../../../../common/storage/file-storage';
import type { UploadedFile } from '../../../../common/storage/uploaded-file';
import { EvidenceAccess, EvidenceRepository, RequirementRecord, SubmissionRecord } from '../../domain/repositories/evidence.repository';
import { assertEvidenceFile, evidenceKey, fileNameOfKey } from '../evidence-file';
import { ViewMode, viewModeOf } from '../view-access';

// MD-126 · Evidencias de un control (contracts/modules/compliance-evidence.md, D84). La empresa solo APORTA: sube `admin_empresa` y el `funcional` dueño del control;
// consultor y auditor leen y descargan (lo impone @Roles en la ruta). Nadie de la empresa aprueba nada: la revisión es de MD-127.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
/** Un control de la propia empresa que el `funcional` no tiene asignado: no es de otra empresa (eso sería 404), es que no le toca (403). */
const assertCanTouch = (p: Principal, assignedUserIds: string[]): void => {
  if (p.role === 'funcional' && !assignedUserIds.includes(p.userId)) throw new DomainError('FORBIDDEN');
};
/** El enlace de descarga vive 5 minutos (SEG-59). */
export const DOWNLOAD_LINK_SECONDS = 300;

@Injectable()
export class ListEvidenceUseCase {
  constructor(private readonly repo: EvidenceRepository) {}

  async execute(p: Principal, controlId: string, view: 'technical' | undefined): Promise<{ view: ViewMode; requirements: RequirementRecord[] }> {
    const mode = viewModeOf(p, view);
    const data = await this.repo.listByControl(scopeOf(p), controlId);
    if (!data) throw new DomainError('NOT_FOUND');
    assertCanTouch(p, data.assignedUserIds);
    return { view: mode, requirements: data.requirements };
  }
}

@Injectable()
export class ListSubmissionsUseCase {
  constructor(private readonly repo: EvidenceRepository) {}

  async execute(p: Principal, requirementId: string, page: number, pageSize: number, view: 'technical' | undefined): Promise<{ view: ViewMode; page: Page<SubmissionRecord> }> {
    const mode = viewModeOf(p, view);
    const access = await this.repo.findRequirement(scopeOf(p), requirementId);
    if (!access) throw new DomainError('NOT_FOUND');
    assertCanTouch(p, access.assignedUserIds);
    const result = await this.repo.listSubmissions(scopeOf(p), requirementId, page, pageSize);
    if (!result) throw new DomainError('NOT_FOUND');
    return { view: mode, page: result };
  }
}

@Injectable()
export class UploadEvidenceUseCase {
  constructor(private readonly repo: EvidenceRepository, private readonly storage: FileStorage) {}

  async execute(p: Principal, requirementId: string, file: UploadedFile | undefined, meta: RequestMeta): Promise<SubmissionRecord> {
    if (!file) throw new DomainError('FILE_REQUIRED');
    // Primero quién es el requerimiento y si a esta persona le toca: uno ajeno o inexistente es 404 y no gasta ni almacenamiento.
    const access: EvidenceAccess | null = await this.repo.findRequirement(scopeOf(p), requirementId);
    if (!access) throw new DomainError('NOT_FOUND');
    assertCanTouch(p, access.assignedUserIds);
    if (!access.controlActive) throw new DomainError('CONTROL_RETIRED');

    const contentType = assertEvidenceFile(file);
    const key = evidenceKey(p.companyId, access.serviceId, requirementId, file.originalName);
    await this.storage.put(key, file.buffer, contentType);

    let created: SubmissionRecord | null;
    try {
      created = await this.repo.createSubmission(
        scopeOf(p), requirementId,
        { fileKey: key, fileType: contentType, fileSize: file.buffer.length, integrityHash: createHash('sha256').update(file.buffer).digest('hex'), submittedBy: p.userId },
        // Se audita la huella y el nombre, nunca el contenido ni la llave del objeto.
        (done): AuditEntry => ({
          tenantId: p.companyId, userId: p.userId, action: 'evidence.submit', resource: 'evidence_submission', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
          beforeState: null,
          afterState: { id: done.id, requirement_id: done.requirementId, version: done.version, file_name: fileNameOfKey(done.fileKey), file_type: done.fileType, file_size: done.fileSize, integrity_hash: done.integrityHash },
        }),
      );
    } catch (error) {
      // Si la base o el rastro fallan, el archivo no puede quedar huérfano en el bucket.
      await this.storage.remove(key);
      throw error;
    }
    if (!created) {
      await this.storage.remove(key);
      throw new DomainError('NOT_FOUND');
    }
    return created;
  }
}

@Injectable()
export class GetEvidenceDownloadUseCase {
  constructor(private readonly repo: EvidenceRepository, private readonly storage: FileStorage, private readonly audit: AuditLogWriter) {}

  async execute(p: Principal, submissionId: string, meta: RequestMeta): Promise<{ url: string; fileName: string; fileType: string; expiresIn: number }> {
    const found = await this.repo.findSubmission(scopeOf(p), submissionId);
    if (!found) throw new DomainError('NOT_FOUND');
    assertCanTouch(p, found.access.assignedUserIds);

    const fileName = fileNameOfKey(found.submission.fileKey);
    const url = await this.storage.downloadUrl(found.submission.fileKey, fileName, DOWNLOAD_LINK_SECONDS);
    // Generar el enlace no cambia ningún dato, así que no hay con qué ser atómico: se registra aparte (de mejor esfuerzo), con la entrega y sin la URL firmada.
    await this.audit.write({
      tenantId: p.companyId, userId: p.userId, action: 'evidence.download', resource: 'evidence_submission', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
      beforeState: null, afterState: { id: found.submission.id, requirement_id: found.submission.requirementId, version: found.submission.version, file_name: fileName },
    });
    return { url, fileName, fileType: found.submission.fileType, expiresIn: DOWNLOAD_LINK_SECONDS };
  }
}
