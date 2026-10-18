import { evidenceStateOf } from '../domain/evidence';
import { RequirementRecord, SubmissionRecord } from '../domain/repositories/evidence.repository';
import { fileNameOfKey } from '../application/evidence-file';
import type { ViewMode } from '../application/view-access';

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
    // D84 · Lo deriva el servidor de la revisión; sin la revisión de MD-127 una entrega espera.
    evidence_state: evidenceStateOf(s),
    // La IA sugiere y siempre va marcada; el contrato prevé una confianza que hoy no se guarda.
    ai: s.aiVerdict ? { is_ai_generated: true, ai_confidence: null, verdict: s.aiVerdict } : null,
  };
  if (view !== 'technical') return base;
  // La revisión de quien pregunta; hasta MD-127 no hay ninguna (ai_prevalidated lo deriva el servidor, nunca lo manda una persona).
  return {
    ...base,
    technical: {
      review: s.aiVerdict ? 'ai_prevalidated' : 'pending_review',
      attributes: { type_ok: null, period_ok: null, valid_ok: null, approved_ok: null, signed_ok: null, content_ok: null },
      reviewed_by: null,
      reviewed_at: null,
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
    validity_within_period: r.validityWithinPeriod,
    origin: r.origin,
    responsible: r.responsible ? { id: r.responsible.id, type: r.responsible.type, person_name: r.responsible.personName } : null,
    submissions: r.submissions.map((s) => toSubmission(s, view)),
  };
}
