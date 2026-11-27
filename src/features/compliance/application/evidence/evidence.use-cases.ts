import { createHash } from 'node:crypto';
import { acceptsEvidence, evidenceBlockOf } from '../../domain/evidence/test-evidence-source';
import { IntegrationConnections } from '../../domain/evidence/integration-connections';
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
import { TransactionRunner } from '../../../../common/tenancy/transaction-runner';
import { WITHIN_EVALUATION_PERIOD } from '../../domain/evidence/evidence';
import { EvidenceAccess, EvidenceRepository, RequirementRecord, ServiceEvidence, SubmissionRecord, TestEvidence } from '../../domain/evidence/evidence.repository';
import { CreateEvidenceRequirementDto } from './evidence.dto';
import { assertEvidenceFile, evidenceKey, fileNameOfKey, INLINE_TYPES } from './evidence-file';
import { compareOwnCode } from '../../domain/controls/control-readout';
import { canSeeControl, ControlAccess } from '../../domain/controls/control-access';

// MD-126 · Evidencias de un control (contracts/modules/compliance-evidence.md, D84). La empresa solo APORTA: sube `admin_empresa` y el `responsable` dueño del control;
// el auditor lee y descarga (lo impone @Can en la ruta). Subir no valida: la validación es del admin_empresa (MD-127, D96).
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
/** Algo de la propia empresa de lo que el `responsable` no es responsable: no es de otra empresa (eso sería 404), es que no le toca (403). */
const assertCanTouch = (p: Principal, access: ControlAccess): void => {
  if (!canSeeControl(p, access)) throw new DomainError('FORBIDDEN');
};
/** El enlace de descarga vive 5 minutos (SEG-59). */
export const DOWNLOAD_LINK_SECONDS = 300;

@Injectable()
export class ListEvidenceUseCase {
  constructor(private readonly repo: EvidenceRepository) {}

  async execute(p: Principal, controlId: string): Promise<{ requirements: RequirementRecord[] }> {
    const data = await this.repo.listByControl(scopeOf(p), controlId);
    if (!data) throw new DomainError('NOT_FOUND');
    assertCanTouch(p, data.access);
    return { requirements: data.requirements };
  }
}

/** MD-208 · La evidencia de todos los controles visibles del servicio, en una petición: admin_empresa y auditor ven todos; responsable y delegado, los que atienden (D102). */
@Injectable()
export class ListServiceEvidenceUseCase {
  constructor(private readonly repo: EvidenceRepository) {}

  async execute(p: Principal, serviceId: string): Promise<{ items: ServiceEvidence['items'] }> {
    const data = await this.repo.listByService(scopeOf(p), serviceId);
    if (!data) throw new DomainError('NOT_FOUND');
    const visible = data.controls.filter((c) => canSeeControl(p, c.access)).sort((a, b) => compareOwnCode(a.ownCode, b.ownCode));
    const items = visible.flatMap((c) => data.items.filter((i) => i.controlId === c.id).sort((a, b) => a.requirement.sequence - b.requirement.sequence));
    return { items };
  }
}

/** Lo que se subió para un test manual o documental, ya filtrado para quien pregunta. */
export type TestEvidenceView = { testId: string; sharedWith: Array<{ id: string; code: string }>; items: TestEvidence['items']; controlCodes: Map<string, string> };

// D85, D88 · La evidencia de un test manual o documental, para mostrarla en el test del control. D102: el `responsable` y el `delegado` reciben solo lo de sus controles y
// solo ven el código de los otros controles que llevan el test si también son suyos; lo demás se omite, no falla.
@Injectable()
export class ListTestEvidenceUseCase {
  constructor(private readonly repo: EvidenceRepository, private readonly integrations: IntegrationConnections) {}

  async execute(p: Principal, controlId: string, testId: string): Promise<TestEvidenceView> {
    const data = await this.repo.listByTest(scopeOf(p), controlId, testId);
    if (!data) throw new DomainError('NOT_FOUND');
    // Se lee si la prueba acepta subida (la regla de la subida) O si el control ya tiene entregas de ella: al conectar la integración las evidencias subidas quedan de histórico y
    // no se ocultan. Solo una prueba que no acepta y no tiene nada en este control es 404.
    const hasHistory = data.items.some((i) => i.controlId === controlId && i.requirement.test?.id === testId && i.requirement.submissions.length > 0);
    if (!hasHistory && !acceptsEvidence(data.test, await this.integrations.connectedCategories(scopeOf(p), data.serviceId), data.test.dimensionApplies)) throw new DomainError('NOT_FOUND');
    const origin = data.controls.find((c) => c.id === controlId);
    if (!origin) throw new DomainError('NOT_FOUND');
    assertCanTouch(p, origin.access);
    const mine = (control: string) => { const c = data.controls.find((x) => x.id === control); return !!c && canSeeControl(p, c.access); };
    const items = data.items.filter((i) => mine(i.controlId));
    return {
      testId: data.testId,
      sharedWith: data.controls.filter((c) => c.id !== controlId && mine(c.id)).map((c) => ({ id: c.id, code: c.code })),
      items,
      controlCodes: new Map(data.controls.filter((c) => items.some((i) => i.controlId === c.id)).map((c) => [c.id, c.code])),
    };
  }
}

@Injectable()
export class ListSubmissionsUseCase {
  constructor(private readonly repo: EvidenceRepository, private readonly tx: TransactionRunner) {}

  async execute(p: Principal, requirementId: string, page: number, pageSize: number): Promise<{ page: Page<SubmissionRecord> }> {
    return this.tx.run(scopeOf(p), async () => {
      const access = await this.repo.findRequirement(scopeOf(p), requirementId);
      if (!access) throw new DomainError('NOT_FOUND');
      assertCanTouch(p, access.access);
      return { page: await this.repo.listSubmissions(scopeOf(p), requirementId, page, pageSize) };
    });
  }
}

@Injectable()
export class UploadEvidenceUseCase {
  constructor(private readonly repo: EvidenceRepository, private readonly storage: FileStorage) {}

  async execute(p: Principal, requirementId: string, file: UploadedFile | undefined, meta: RequestMeta, occurrenceId: string | null = null): Promise<SubmissionRecord> {
    if (!file) throw new DomainError('FILE_REQUIRED');
    // Primero quién es el requerimiento y si a esta persona le toca: uno ajeno o inexistente es 404 y no gasta ni almacenamiento.
    const access: EvidenceAccess | null = await this.repo.findRequirement(scopeOf(p), requirementId);
    if (!access) throw new DomainError('NOT_FOUND');
    assertCanTouch(p, access.access);
    if (!access.controlActive) throw new DomainError('CONTROL_RETIRED');

    const contentType = assertEvidenceFile(file);
    const key = evidenceKey(p.companyId, access.serviceId, requirementId, file.originalName);
    await this.storage.put(key, file.buffer, contentType);

    let created: SubmissionRecord | null;
    try {
      created = await this.repo.createSubmission(
        scopeOf(p), requirementId,
        { occurrenceId, fileKey: key, fileType: contentType, fileSize: file.buffer.length, integrityHash: createHash('sha256').update(file.buffer).digest('hex'), submittedBy: p.userId, meta },
        // Se audita la huella y el nombre, nunca el contenido ni la llave del objeto.
        (done): AuditEntry => ({
          tenantId: p.companyId, userId: p.userId, action: 'evidence.submit', resource: 'evidence_submission', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
          beforeState: null,
          afterState: { id: done.id, requirement_id: done.requirementId, occurrence_id: occurrenceId, version: done.version, file_name: fileNameOfKey(done.fileKey), file_type: done.fileType, file_size: done.fileSize, integrity_hash: done.integrityHash },
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

// D88 · Entregar la evidencia de UNA prueba documental en un control, en un solo paso: la persona lee lo que la prueba pide y sube su documento. El lugar donde queda
// (el requerimiento de esa prueba) se crea en la primera entrega y las siguientes son versiones nuevas. Después el admin_empresa lo valida (D96).
@Injectable()
export class UploadTestEvidenceUseCase {
  constructor(private readonly repo: EvidenceRepository, private readonly upload: UploadEvidenceUseCase, private readonly integrations: IntegrationConnections) {}

  async execute(p: Principal, controlId: string, testId: string, file: UploadedFile | undefined, meta: RequestMeta, occurrenceId: string | null = null): Promise<SubmissionRecord> {
    if (!file) throw new DomainError('FILE_REQUIRED');
    const facts = await this.repo.controlEvidenceFacts(scopeOf(p), controlId);
    if (!facts) throw new DomainError('NOT_FOUND');
    assertCanTouch(p, facts.access);
    if (!facts.active) throw new DomainError('CONTROL_RETIRED');
    const test = facts.tests.find((t) => t.id === testId);
    if (!test) throw new DomainError('NOT_FOUND');
    // La dimensión de la prueba debe aplicar en el control (una marcada «no aplica» no se evalúa ahí) y su fuente debe aceptar subida.
    const block = evidenceBlockOf(test, await this.integrations.connectedCategories(scopeOf(p), facts.serviceId), facts.dimensions.includes(test.dimension));
    if (block) throw new ValidationException([{ field: 'test_id', code: block }]);
    // MD-529 (DT-115) · En un requisito «cuando sea requerido» cada entrega prueba una ocurrencia; en cualquier otro no se admite.
    const occurrence = await this.repo.occurrenceFacts(scopeOf(p), controlId, testId, occurrenceId);
    if (occurrence.onDemand && !occurrenceId) throw new ValidationException([{ field: 'occurrence_id', code: 'occurrence_id.required' }]);
    if (occurrenceId && !occurrence.occurrenceOk) throw new ValidationException([{ field: 'occurrence_id', code: 'occurrence_id.invalid' }]);
    // El archivo se comprueba ANTES de crear el lugar donde quedará: uno rechazado no deja un requerimiento vacío.
    assertEvidenceFile(file);

    const slot = await this.repo.findOrCreateTestRequirement(
      scopeOf(p), controlId, testId,
      { description: test.displayName ?? test.code, dimension: test.dimension, testId, validityWithinPeriod: facts.validityWithinPeriod ?? WITHIN_EVALUATION_PERIOD },
      (done): AuditEntry => ({
        tenantId: p.companyId, userId: p.userId, action: 'evidence_requirement.create', resource: 'evidence_requirement', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
        beforeState: null,
        afterState: { id: done.id, control_id: controlId, code: done.code, dimension: done.dimension, test_id: done.test?.id ?? null, description: done.description },
      }),
    );
    if (!slot) throw new DomainError('NOT_FOUND');
    return this.upload.execute(p, slot.requirementId, file, meta, occurrenceId);
  }
}

// D88 · Agrega una evidencia propia al control, para una prueba documental concreta o compartida. Así todo control puede respaldar sus pruebas manuales aunque el catálogo
// no le haya traído un documento (los 52 controles sin plantilla, B7). La empresa decide qué documento aporta; el admin_empresa lo valida.
@Injectable()
export class CreateEvidenceRequirementUseCase {
  constructor(private readonly repo: EvidenceRepository, private readonly integrations: IntegrationConnections) {}

  async execute(p: Principal, controlId: string, dto: CreateEvidenceRequirementDto, meta: RequestMeta): Promise<RequirementRecord> {
    const facts = await this.repo.controlEvidenceFacts(scopeOf(p), controlId);
    if (!facts) throw new DomainError('NOT_FOUND');
    if (!facts.active) throw new DomainError('CONTROL_RETIRED');

    const errors: Array<{ field: string; code: string }> = [];
    const description = dto.description.trim();
    if (!description) errors.push({ field: 'description', code: 'required' });
    const test = dto.test_id ? facts.tests.find((t) => t.id === dto.test_id) : undefined;
    if (!facts.dimensions.includes(dto.dimension)) errors.push({ field: 'dimension', code: 'dimension.not_in_control' });
    else if (test && dto.dimension !== test.dimension) errors.push({ field: 'dimension', code: 'dimension.not_of_test' });
    if (dto.test_id && !test) errors.push({ field: 'test_id', code: 'test.not_in_control' });
    if (test) {
      const block = evidenceBlockOf(test, await this.integrations.connectedCategories(scopeOf(p), facts.serviceId), facts.dimensions.includes(test.dimension));
      if (block) errors.push({ field: 'test_id', code: block });
    }
    if (errors.length > 0) throw new ValidationException(errors);

    const created = await this.repo.createRequirement(
      scopeOf(p), controlId,
      { description, dimension: dto.dimension, testId: dto.test_id ?? null, validityWithinPeriod: facts.validityWithinPeriod ?? WITHIN_EVALUATION_PERIOD },
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
    const found = await this.repo.findSubmission(scopeOf(p), submissionId);
    if (!found) throw new DomainError('NOT_FOUND');
    assertCanTouch(p, found.access.access);
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
