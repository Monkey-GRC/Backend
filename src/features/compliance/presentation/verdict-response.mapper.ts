import { VerdictIssued, VerdictRecord } from '../domain/repositories/test-verdict.repository';
import { VerdictResponse } from './verdict.responses';

export const toVerdict = (v: VerdictRecord | VerdictIssued): VerdictResponse => ({
  id: v.id, control_id: v.controlId, test_id: v.testId, dimension: v.dimension, origin: 'manual', result: v.result, note: v.note,
  closure_observation_reason: v.closureObservationReason,
  confirmed_by: { id: v.confirmedBy.id, name: v.confirmedBy.name, last_name: v.confirmedBy.lastName },
  evaluated_at: v.evaluatedAt.toISOString(),
  ...('testState' in v ? { test_state: v.testState } : {}),
  applies_to_controls: v.appliesToControls,
});
