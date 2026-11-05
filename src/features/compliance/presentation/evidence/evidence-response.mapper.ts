import { evidenceStateOf } from '../../domain/evidence/evidence';
import { RequirementRecord, SubmissionRecord } from '../../domain/evidence/evidence.repository';
import { fileNameOfKey } from '../../application/evidence/evidence-file';
import type { ViewMode } from '../../application/shared/view-access';
import type { TestEvidenceView } from '../../application/evidence/evidence.use-cases';

// Una entrega al JSON del contrato (compliance-evidence.md). La llave del objeto en el almacenamiento nunca sale.
export function toSubmission(s: SubmissionRecord, view: ViewMode, includeRequirement = false) {
  const base = {
    id: s.id,
    ...(includeRequirement ? { requirement_id: s.requirementId } : {}),
    version: s.version,
    file_name: fileNameOfKey(s.fileKey),
    file_type: s.fileType,
    file_size: s.fileSize,
    integrity_hash: s.integrityHash,
    submitted_by: { id: s.submittedBy.id, name: s.submittedBy.name, last_name: s.submittedBy.lastName },
    submitted_at: s.submittedAt.toISOString(),
    // D96 · Lo deriva el servidor de la única revisión de la entrega, la del admin_empresa.
    evidence_state: evidenceStateOf(s),
    // D96 · El motivo con el que el admin_empresa rechazó (o la nota con la que validó): es lo que el responsable lee para corregir. `null` si no hay revisión o no dejó nota.
    review_note: s.review?.note ?? null,
    // La IA sugiere y siempre va marcada; el contrato prevé una confianza que hoy no se guarda.
    ai: s.aiVerdict ? { is_ai_generated: true, ai_confidence: null, verdict: s.aiVerdict } : null,
  };
  if (view !== 'technical') return base;
  // La revisión de quien pregunta (`ai_prevalidated` lo deriva el servidor, nunca lo manda una persona). Sin revisión humana, todo queda sin valorar.
  const r = s.review;
  return {
    ...base,
    technical: {
      review: r ? r.review : s.aiVerdict ? 'ai_prevalidated' : 'pending_review',
      attributes: {
        type_ok: r?.typeOk ?? null, period_ok: r?.periodOk ?? null, valid_ok: r?.validOk ?? null,
        approved_ok: r?.approvedOk ?? null, signed_ok: r?.signedOk ?? null, content_ok: r?.contentOk ?? null,
      },
      note: r?.note ?? null,
      reviewed_by: r ? { id: r.reviewedBy.id, name: r.reviewedBy.name, last_name: r.reviewedBy.lastName } : null,
      reviewed_at: r ? r.reviewedAt.toISOString() : null,
    },
  };
}

export function toRequirement(r: RequirementRecord, view: ViewMode) {
  return {
    id: r.id,
    code: r.code,
    sequence: r.sequence,
    description: r.description,
    dimension: r.dimension,
    // D88 · `null` = compartida con todas las pruebas documentales del control; si no, la prueba de este control a la que sirve.
    test: r.test ? { id: r.test.id, code: r.test.code, display_name: r.test.displayName } : null,
    validity_within_period: r.validityWithinPeriod,
    origin: r.origin,
    responsible: r.responsible ? { id: r.responsible.id, type: r.responsible.type, person_name: r.responsible.personName } : null,
    submissions: r.submissions.map((s) => toSubmission(s, view)),
  };
}

// GET /v1/controls/{id}/tests/{testId}/evidence: cada requerimiento dice de qué control es (D85) y `shared_with` avisa dónde más aplica el test.
export function toTestEvidence(d: TestEvidenceView) {
  return {
    test_id: d.testId,
    shared_with: d.sharedWith,
    items: d.items.map((i) => ({ ...toRequirement(i.requirement, d.view), control: { id: i.controlId, code: d.controlCodes.get(i.controlId) as string } })),
  };
}
