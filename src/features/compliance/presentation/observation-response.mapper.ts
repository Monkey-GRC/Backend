import { ObservationRecord, Person } from '../domain/repositories/observation.repository';

// Forma de contracts/modules/compliance-audit.md (MD-154).
const person = (p: Person) => ({ id: p.id, name: p.name, last_name: p.lastName });
const iso = (d: Date | null) => (d ? d.toISOString() : null);

export const toObservation = (o: ObservationRecord) => ({
  id: o.id,
  service_id: o.serviceId,
  client_control_id: o.clientControlId,
  evidence_submission_id: o.evidenceSubmissionId,
  type: o.type,
  body: o.body,
  status: o.status,
  created_by: { ...person(o.createdBy), role: o.createdBy.role },
  created_at: o.createdAt.toISOString(),
  answer_note: o.answerNote,
  answer_evidence_id: o.answerEvidenceId,
  answered_by: o.answeredBy ? person(o.answeredBy) : null,
  answered_at: iso(o.answeredAt),
  closed_by: o.closedBy ? person(o.closedBy) : null,
  closed_at: iso(o.closedAt),
});
