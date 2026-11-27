import { ScanRepository } from '../../domain/repositories/scan.repository';
import { MAX_SCHEDULED_WAITING, QueueScheduledAssessmentsUseCase, RETRY_AFTER_SECONDS } from './cloud-schedule.use-cases';

describe('QueueScheduledAssessmentsUseCase (D158)', () => {
  const due = [
    { tenantId: 't1', assetId: 'a1' },
    { tenantId: 't2', assetId: 'a2' },
  ];

  it('encola cada una dentro de su empresa, con el tope de espera y el reintento acordados', async () => {
    const queueScheduledAssessment = jest.fn().mockResolvedValue({ executionId: 'e' });
    const listDueCloudAssessments = jest.fn().mockResolvedValue(due);
    const pass = await new QueueScheduledAssessmentsUseCase({ listDueCloudAssessments, queueScheduledAssessment } as unknown as ScanRepository).execute();
    expect(listDueCloudAssessments).toHaveBeenCalledWith({ maxWaiting: MAX_SCHEDULED_WAITING, retrySeconds: RETRY_AFTER_SECONDS });
    expect(queueScheduledAssessment.mock.calls).toEqual([[{ companyId: 't1' }, 'a1'], [{ companyId: 't2' }, 'a2']]);
    expect(pass).toEqual({ due: 2, queued: 2 });
  });

  it('una que falla o que otro ya encoló no detiene a las demás', async () => {
    const queueScheduledAssessment = jest.fn().mockRejectedValueOnce(new Error('se cayó')).mockResolvedValueOnce(null);
    const pass = await new QueueScheduledAssessmentsUseCase({ listDueCloudAssessments: jest.fn().mockResolvedValue(due), queueScheduledAssessment } as unknown as ScanRepository).execute();
    expect(queueScheduledAssessment).toHaveBeenCalledTimes(2);
    expect(pass).toEqual({ due: 2, queued: 0 });
  });
});
