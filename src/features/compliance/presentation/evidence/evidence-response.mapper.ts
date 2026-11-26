import { I18nContext } from 'nestjs-i18n';
import { localizedTestName } from '../../../../common/text/test-display-name';
import { evidenceStateOf, WITHIN_EVALUATION_PERIOD } from '../../domain/evidence/evidence';
import { RequirementRecord, SubmissionRecord } from '../../domain/evidence/evidence.repository';
import { fileNameOfKey } from '../../application/evidence/evidence-file';
import type { TestEvidenceView } from '../../application/evidence/evidence.use-cases';

// Una entrega al JSON del contrato (compliance-evidence.md). La llave del objeto en el almacenamiento nunca sale.
export function toSubmission(s: SubmissionRecord, includeRequirement = false) {
  return {
    id: s.id,
    ...(includeRequirement ? { requirement_id: s.requirementId } : {}),
    version: s.version,
    file_name: fileNameOfKey(s.fileKey),
    file_type: s.fileType,
    file_size: s.fileSize,
    integrity_hash: s.integrityHash,
    submitted_by: { id: s.submittedBy.id, name: s.submittedBy.name, last_name: s.submittedBy.lastName },
    submitted_at: s.submittedAt.toISOString(),
    // D132 · Cuenta si no fue devuelta; una devuelta es `non_compliant`.
    evidence_state: evidenceStateOf({ returned: s.returned !== null }),
    // D132 · El motivo de la devolución del control que dejó esta entrega sin contar: es lo que quien subió lee para corregir. `null` si no fue devuelta.
    review_note: s.returned?.reason ?? null,
    // La IA sugiere y siempre va marcada; el contrato prevé una confianza que hoy no se guarda.
    ai: s.aiVerdict ? { is_ai_generated: true, ai_confidence: null, verdict: s.aiVerdict } : null,
  };
}

export function toRequirement(r: RequirementRecord) {
  return {
    id: r.id,
    code: r.code,
    sequence: r.sequence,
    // Un requerimiento creado desde una prueba copió su nombre neutro (D70): se muestra en el idioma de la petición. Un requerimiento del catálogo o escrito por la empresa es texto de la empresa y no se toca.
    description: r.test && r.description === r.test.displayName ? (localizedTestName(r.test, I18nContext.current()?.lang) ?? r.description) : r.description,
    dimension: r.dimension,
    // D88 · `null` = compartida con todas las pruebas documentales del control; si no, la prueba de este control a la que sirve.
    test: r.test ? { id: r.test.id, code: r.test.code, display_name: localizedTestName(r.test, I18nContext.current()?.lang) } : null,
    validity_within_period: r.validityWithinPeriod === WITHIN_EVALUATION_PERIOD ? ((I18nContext.current()?.t('evidence.validity.within_period') as string | undefined) ?? r.validityWithinPeriod) : r.validityWithinPeriod,
    origin: r.origin,
    responsible: r.responsible ? { id: r.responsible.id, type: r.responsible.type, person_name: r.responsible.personName } : null,
    submissions: r.submissions.map((s) => toSubmission(s)),
  };
}

// GET /v1/controls/{id}/tests/{testId}/evidence: cada requerimiento dice de qué control es (D85) y `shared_with` avisa dónde más aplica el test.
export function toTestEvidence(d: TestEvidenceView) {
  return {
    test_id: d.testId,
    shared_with: d.sharedWith,
    items: d.items.map((i) => ({ ...toRequirement(i.requirement), control: { id: i.controlId, code: d.controlCodes.get(i.controlId) as string } })),
  };
}
