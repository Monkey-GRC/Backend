import { VerdictRecord, VerdictWithTestState } from '../../domain/verdicts/test-verdict.repository';
import { VerdictResponse } from './verdict.responses';

// Un veredicto al JSON del contrato (veredictos.md, D121). `confirmed_by` y `evaluated_at` siguen siendo quien lo registró y cuándo (nombres del contrato D96); `state` y `reviews[]` son nuevos.
export const toVerdict = (v: VerdictRecord | VerdictWithTestState): VerdictResponse => ({
  id: v.id, control_id: v.controlId, test_id: v.testId, dimension: v.dimension, origin: 'manual', result: v.result, note: v.note,
  closure_observation_reason: v.closureObservationReason,
  state: v.state,
  registered_by: { id: v.registeredBy.id, name: v.registeredBy.name, last_name: v.registeredBy.lastName, role: v.registeredBy.role },
  reviews: v.reviews.map((r) => ({
    reviewer_role: r.reviewerRole, decision: r.decision, note: r.note, reviewed_by: { id: r.reviewedBy.id, name: r.reviewedBy.name, last_name: r.reviewedBy.lastName }, reviewed_at: r.reviewedAt.toISOString(),
  })),
  confirmed_by: { id: v.registeredBy.id, name: v.registeredBy.name, last_name: v.registeredBy.lastName },
  evaluated_at: v.registeredAt.toISOString(),
  ...('testState' in v ? { test_state: v.testState } : {}),
  applies_to_controls: v.appliesToControls,
});
