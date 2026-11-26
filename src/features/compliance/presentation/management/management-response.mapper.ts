import type { ResultSaved } from '../../domain/management/control-management.repository';
import type { ManualTestResultResponse } from './management.responses';

export const toManualTestResult = (r: ResultSaved): ManualTestResultResponse => ({
  id: r.id, control_id: r.controlId, test_id: r.testId, result: r.result, note: r.note,
  registered_by: { id: r.registeredBy.id, name: r.registeredBy.name, last_name: r.registeredBy.lastName },
  registered_at: r.registeredAt.toISOString(), management_state: r.stateAfter,
});
