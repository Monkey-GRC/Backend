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
import { ValidationException } from '../../../../common/errors/validation.exception';
import { evidenceStateOf, reviewerRoleFor } from '../../domain/evidence/evidence';
import { EvidenceAccess, EvidenceRepository, RequirementRecord, SubmissionRecord, TestEvidence } from '../../domain/evidence/evidence.repository';
import { CreateEvidenceRequirementDto, ReviewEvidenceDto } from './evidence.dto';
import { assertEvidenceFile, evidenceKey, fileNameOfKey, INLINE_TYPES } from './evidence-file';
import { ViewMode, viewModeOf } from '../shared/view-access';

// MD-126 · Evidencias de un control (contracts/modules/compliance-evidence.md, D84). La empresa solo APORTA: sube `admin_empresa` y el `funcional` dueño del control;
// el auditor lee y descarga (lo impone @Roles en la ruta). Subir no valida: la validación es del admin_empresa (MD-127, D96).
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
/** Algo de la propia empresa de lo que el `funcional` no es responsable: no es de otra empresa (eso sería 404), es que no le toca (403). */
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
    const data = await this.repo.listByControl(scopeOf(p), controlId, reviewerRoleFor(p.role));
    if (!data) throw new DomainError('NOT_FOUND');
    assertCanTouch(p, data.assignedUserIds);
    // D96, SEG-66 · El funcional recibe solo los requerimientos de las dimensiones de las que es responsable en este control.
    const requirements = p.role === 'funcional' ? data.requirements.filter((r) => (data.responsibleByDimension[r.dimension] ?? []).includes(p.userId)) : data.requirements;
    return { view: mode, requirements };
  }
}

/** Lo que se subió para un test manual o documental, ya filtrado para quien pregunta. */
export type TestEvidenceView = { view: ViewMode; testId: string; sharedWith: Array<{ id: string; code: string }>; items: TestEvidence['items']; controlCodes: Map<string, string> };

// D85, D88 · La evidencia de un test manual o documental, para mostrarla en el test del control. D96, SEG-66: el `funcional` recibe solo lo de las dimensiones de las que es
// solo ve el código de los otros controles que llevan el test si también atiende esa dimensión en ellos; lo demás se omite, no falla.
@Injectable()
export class ListTestEvidenceUseCase {
  constructor(private readonly repo: EvidenceRepository) {}

  async execute(p: Principal, controlId: string, testId: string, view: 'technical' | undefined): Promise<TestEvidenceView> {
    const mode = viewModeOf(p, view);
    const data = await this.repo.listByTest(scopeOf(p), controlId, testId, reviewerRoleFor(p.role));
    if (!data) throw new DomainError('NOT_FOUND');
    const responsibleOf = (control: string, dimension: string) => data.controls.find((c) => c.id === control)?.responsibleByDimension[dimension] ?? [];
    const mine = (control: string, dimension: string) => p.role !== 'funcional' || responsibleOf(control, dimension).includes(p.userId);
    const items = data.items.filter((i) => mine(i.controlId, i.requirement.dimension));
    return {
      view: mode,
      testId: data.testId,
      sharedWith: data.controls.filter((c) => c.id !== controlId && mine(c.id, data.dimension)).map((c) => ({ id: c.id, code: c.code })),
      items,
      controlCodes: new Map(data.controls.filter((c) => items.some((i) => i.controlId === c.id)).map((c) => [c.id, c.code])),
    };
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
    const result = await this.repo.listSubmissions(scopeOf(p), requirementId, page, pageSize, reviewerRoleFor(p.role));
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
        { fileKey: key, fileType: contentType, fileSize: file.buffer.length, integrityHash: createHash('sha256').update(file.buffer).digest('hex'), submittedBy: p.userId, meta },
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

// D96 · La revisión de una entrega la hace solo el admin_empresa, en una sola revisión (el rol sale de la sesión, no del cuerpo): la valida o la rechaza con motivo. Crea o
// reemplaza la propia. De esta revisión sale el estado de la evidencia y, con él, el de las pruebas documentales de su control (D88).
@Injectable()
export class ReviewEvidenceUseCase {
  constructor(private readonly repo: EvidenceRepository) {}

  async execute(p: Principal, submissionId: string, dto: ReviewEvidenceDto, meta: RequestMeta): Promise<SubmissionRecord> {
    const reviewerRole = reviewerRoleFor(p.role);
    // Rechazar es dejar algún atributo en `false`: el funcional necesita el motivo para saber qué corregir (compliance-audit.md).
    const rejects = [dto.type_ok, dto.period_ok, dto.valid_ok, dto.approved_ok, dto.signed_ok, dto.content_ok].some((v) => v === false);
    if (rejects && !dto.note?.trim()) throw new ValidationException([{ field: 'note', code: 'note.required' }]);
    const saved = await this.repo.saveReview(
      scopeOf(p), submissionId,
      {
        reviewerRole, reviewedBy: p.userId, typeOk: dto.type_ok ?? null, periodOk: dto.period_ok ?? null, validOk: dto.valid_ok ?? null, approvedOk: dto.approved_ok ?? null,
        signedOk: dto.signed_ok ?? null, contentOk: dto.content_ok ?? null, review: dto.review, note: dto.note?.trim() || null, meta,
      },
      // Sin los atributos en el detalle (compliance-audit.md): se audita quién revisó qué entrega y con qué resultado global.
      (done): AuditEntry => ({
        tenantId: p.companyId, userId: p.userId, action: 'evidence_review.update', resource: 'evidence_review', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
        beforeState: done.before ? { submission_id: done.submission.id, reviewer_role: reviewerRole, review: done.before.review } : null,
        afterState: { submission_id: done.submission.id, requirement_id: done.submission.requirementId, version: done.submission.version, reviewer_role: reviewerRole, review: done.after.review, evidence_state: evidenceStateOf(done.submission) },
      }),
    );
    if (!saved) throw new DomainError('NOT_FOUND');
    return saved.submission;
  }
}

// D88 · Entregar la evidencia de UNA prueba documental en un control, en un solo paso: la persona lee lo que la prueba pide y sube su documento. El lugar donde queda
// (el requerimiento de esa prueba) se crea en la primera entrega y las siguientes son versiones nuevas. Después el admin_empresa lo valida (D96).
@Injectable()
export class UploadTestEvidenceUseCase {
  constructor(private readonly repo: EvidenceRepository, private readonly upload: UploadEvidenceUseCase) {}

  async execute(p: Principal, controlId: string, testId: string, file: UploadedFile | undefined, meta: RequestMeta): Promise<SubmissionRecord> {
    if (!file) throw new DomainError('FILE_REQUIRED');
    const facts = await this.repo.controlEvidenceFacts(scopeOf(p), controlId);
    if (!facts) throw new DomainError('NOT_FOUND');
    assertCanTouch(p, facts.assignedUserIds);
    if (!facts.active) throw new DomainError('CONTROL_RETIRED');
    const test = facts.tests.find((t) => t.id === testId);
    if (!test) throw new DomainError('NOT_FOUND');
    // D98 · Además de atender el control en alguna dimensión, atiende la dimensión DE ESTA prueba.
    assertCanTouch(p, facts.responsibleByDimension[test.dimension] ?? []);
    if (test.dimension !== 'policy') throw new ValidationException([{ field: 'test_id', code: 'test.not_documentary' }]);
    // El archivo se comprueba ANTES de crear el lugar donde quedará: uno rechazado no deja un requerimiento vacío.
    assertEvidenceFile(file);

    const slot = await this.repo.findOrCreateTestRequirement(
      scopeOf(p), controlId, testId,
      { description: test.displayName ?? test.code, dimension: 'policy', testId, validityWithinPeriod: facts.validityWithinPeriod ?? 'Dentro del período de evaluación' },
      (done): AuditEntry => ({
        tenantId: p.companyId, userId: p.userId, action: 'evidence_requirement.create', resource: 'evidence_requirement', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
        beforeState: null,
        afterState: { id: done.id, control_id: controlId, code: done.code, dimension: done.dimension, test_id: done.test?.id ?? null, description: done.description },
      }),
    );
    if (!slot) throw new DomainError('NOT_FOUND');
    return this.upload.execute(p, slot.requirementId, file, meta);
  }
}

// D88 · Agrega una evidencia propia al control, para una prueba documental concreta o compartida. Así todo control puede respaldar sus pruebas manuales aunque el catálogo
// no le haya traído un documento (los 52 controles sin plantilla, B7). La empresa decide qué documento aporta; el admin_empresa lo valida.
@Injectable()
export class CreateEvidenceRequirementUseCase {
  constructor(private readonly repo: EvidenceRepository) {}

  async execute(p: Principal, controlId: string, dto: CreateEvidenceRequirementDto, meta: RequestMeta): Promise<RequirementRecord> {
    const facts = await this.repo.controlEvidenceFacts(scopeOf(p), controlId);
    if (!facts) throw new DomainError('NOT_FOUND');
    if (!facts.active) throw new DomainError('CONTROL_RETIRED');

    const errors: Array<{ field: string; code: string }> = [];
    const description = dto.description.trim();
    if (!description) errors.push({ field: 'description', code: 'required' });
    if (!facts.dimensions.includes(dto.dimension)) errors.push({ field: 'dimension', code: 'dimension.not_in_control' });
    if (dto.test_id) {
      const test = facts.tests.find((t) => t.id === dto.test_id);
      if (!test) errors.push({ field: 'test_id', code: 'test.not_in_control' });
      else if (test.dimension !== 'policy' || dto.dimension !== 'policy') errors.push({ field: 'test_id', code: 'test.not_documentary' });
    }
    if (errors.length > 0) throw new ValidationException(errors);

    const created = await this.repo.createRequirement(
      scopeOf(p), controlId,
      { description, dimension: dto.dimension, testId: dto.test_id ?? null, validityWithinPeriod: facts.validityWithinPeriod ?? 'Dentro del período de evaluación' },
      (done): AuditEntry => ({
        tenantId: p.companyId, userId: p.userId, action: 'evidence_requirement.create', resource: 'evidence_requirement', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
        beforeState: null,
        afterState: { id: done.id, control_id: controlId, code: done.code, dimension: done.dimension, test_id: done.test?.id ?? null, description: done.description },
      }),
    );
    if (!created) throw new DomainError('NOT_FOUND');
    return created;
  }
}

@Injectable()
export class GetEvidenceDownloadUseCase {
  constructor(private readonly repo: EvidenceRepository, private readonly storage: FileStorage, private readonly audit: AuditLogWriter) {}

  /** `inline` hace que la pantalla muestre el archivo sin descargarlo; solo PDF, PNG y JPG (`422 disposition.not_supported` con otro tipo). */
  async execute(p: Principal, submissionId: string, disposition: 'attachment' | 'inline', meta: RequestMeta): Promise<{ url: string; fileName: string; fileType: string; disposition: 'attachment' | 'inline'; expiresIn: number }> {
    const found = await this.repo.findSubmission(scopeOf(p), submissionId, reviewerRoleFor(p.role));
    if (!found) throw new DomainError('NOT_FOUND');
    assertCanTouch(p, found.access.assignedUserIds);
    if (disposition === 'inline' && !INLINE_TYPES.includes(found.submission.fileType)) throw new ValidationException([{ field: 'disposition', code: 'disposition.not_supported' }]);

    const fileName = fileNameOfKey(found.submission.fileKey);
    // El tipo y la disposición se fijan al firmar: quien recibe el enlace no los puede cambiar.
    const url = await this.storage.downloadUrl(found.submission.fileKey, fileName, DOWNLOAD_LINK_SECONDS, { disposition, contentType: found.submission.fileType });
    // Generar el enlace no cambia ningún dato, así que no hay con qué ser atómico: se registra aparte (de mejor esfuerzo), con la entrega y sin la URL firmada.
    await this.audit.write({
      tenantId: p.companyId, userId: p.userId, action: 'evidence.download', resource: 'evidence_submission', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
      beforeState: null, afterState: { id: found.submission.id, requirement_id: found.submission.requirementId, version: found.submission.version, file_name: fileName, disposition },
    });
    return { url, fileName, fileType: found.submission.fileType, disposition, expiresIn: DOWNLOAD_LINK_SECONDS };
  }
}
