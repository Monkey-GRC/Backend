import { submissionCounts } from './evidence-state.mapper';

// MD-529 · Una entrega «tiene evidencia» con el mismo criterio con que cuenta para el motor: cargada, vigente y no devuelta con el control.
describe('submissionCounts', () => {
  it('cuenta una entrega no devuelta y no cuenta la que se devolvió con el control', () => {
    expect(submissionCounts({ version: '1', returnedApprovalId: null })).toBe(true);
    expect(submissionCounts({ version: '1', returnedApprovalId: 'a1' })).toBe(false);
  });
});
