import { DomainError } from '../../../../common/errors/domain-error';
import { ClaimedExecution, RunContext, ScanRepository, ScaOutcome } from '../../domain/repositories/scan.repository';
import { ClaimExecutionUseCase, CompleteScaExecutionUseCase, ScaReading } from './scan.use-cases';

const TENANT = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const ASSET = '33333333-3333-4333-8333-333333333333';
const EXEC = '44444444-4444-4444-8444-444444444444';

const catalog = [{ scaId: 'cis_ubuntu22-04', benchmark: 'CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0.', checks: [{ id: 'u-1', platform: 'Ubuntu', checkId: '28500' }, { id: 'u-2', platform: 'Ubuntu', checkId: '28501' }] }];

const reading = (over: Partial<ScaReading> = {}): ScaReading => ({
  sondaVersion: '4.14.6',
  finishedAt: new Date('2026-11-12T10:00:00Z'),
  agent: { agentId: '001', name: ASSET, groups: [TENANT] },
  policies: [{ policyId: 'cis_ubuntu22-04', name: 'CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0.', scanEndedAt: '2026-11-12T09:59:00Z', checks: [
    { id: '28500', result: 'passed', reason: null, compliance: [] },
    { id: '28501', result: 'failed', reason: null, compliance: [] },
    { id: '99999', result: 'passed', reason: null, compliance: [] },
  ] }],
  ...over,
});

function fakeRepo(link: { tenantId: string; assetId: string; agentId: string | null } | null) {
  const completed: ScaOutcome[] = [];
  const repo = {
    loadAgentLink: jest.fn().mockResolvedValue(link),
    scaCatalog: jest.fn().mockResolvedValue(catalog),
    completeSca: jest.fn(async (_s, id: string, outcome: ScaOutcome) => {
      completed.push(outcome);
      return { executionId: id, resultCount: outcome.rows.length };
    }),
  } as unknown as ScanRepository;
  return { repo, completed };
}

describe('CompleteScaExecutionUseCase', () => {
  it('guarda lo que el catálogo reconoce, cuenta el conjunto ejecutado y avisa de lo que no conoce', async () => {
    const { repo, completed } = fakeRepo({ tenantId: TENANT, assetId: ASSET, agentId: '001' });
    const out = await new CompleteScaExecutionUseCase(repo).execute(TENANT, EXEC, reading());
    expect(out).toEqual({ executionId: EXEC, resultCount: 2 });
    const [o] = completed;
    expect(o.agentId).toBe('001');
    expect(o.checksExecuted).toBe(2);
    expect(o.rows.map((r) => [r.checkId, r.result])).toEqual([['u-1', 'passed'], ['u-2', 'failed']]);
  });

  it('un check que el catálogo no conoce no se guarda ni se inventa: queda en la bitácora', async () => {
    const { repo, completed } = fakeRepo({ tenantId: TENANT, assetId: ASSET, agentId: '001' });
    (repo.scaCatalog as jest.Mock).mockResolvedValue([]);
    await new CompleteScaExecutionUseCase(repo).execute(TENANT, EXEC, reading());
    expect(completed[0].rows).toEqual([]);
    expect(completed[0].logs.some((l) => l.level === 'warn' && l.message.includes('fuera del catálogo'))).toBe(true);
  });

  it.each([
    ['el agente que entrega no es el enlazado al activo', { agentId: '002', name: ASSET, groups: [TENANT] }, 'AGENT_NOT_LINKED'],
    ['el nombre del agente no es el id del activo', { agentId: '001', name: 'otro', groups: [TENANT] }, 'AGENT_GROUP_MISMATCH'],
    ['el grupo del agente es el de otra empresa', { agentId: '001', name: ASSET, groups: [OTHER] }, 'AGENT_GROUP_MISMATCH'],
    ['el agente está también en el grupo de otra empresa', { agentId: '001', name: ASSET, groups: [TENANT, OTHER] }, 'AGENT_GROUP_MISMATCH'],
  ])('SEG-45: %s → se rechaza y no se guarda nada', async (_n, agent, code) => {
    const { repo } = fakeRepo({ tenantId: TENANT, assetId: ASSET, agentId: '001' });
    await expect(new CompleteScaExecutionUseCase(repo).execute(TENANT, EXEC, reading({ agent }))).rejects.toMatchObject({ code } as Partial<DomainError>);
    expect(repo.completeSca).not.toHaveBeenCalled();
  });

  it.each([
    ['la ejecución no existe para esta empresa', null],
    ['el activo no tiene agente creado todavía', { tenantId: TENANT, assetId: ASSET, agentId: null }],
  ])('SEG-45: %s → AGENT_NOT_LINKED', async (_n, link) => {
    const { repo } = fakeRepo(link);
    await expect(new CompleteScaExecutionUseCase(repo).execute(TENANT, EXEC, reading())).rejects.toMatchObject({ code: 'AGENT_NOT_LINKED' });
    expect(repo.completeSca).not.toHaveBeenCalled();
  });
});

describe('ClaimExecutionUseCase · servidor con agente', () => {
  const claimed = (): ClaimedExecution => ({ executionId: EXEC, tenantId: TENANT, assetId: ASSET, origin: 'manual', kind: 'assessment' });
  const ctx = (): RunContext => ({ executionId: EXEC, assetId: ASSET, origin: 'manual', kind: 'assessment', platform: 'Ubuntu', externalAccountId: null, regions: [], connectionMethod: 'agent', roleArn: null, externalId: null, encryptedCredentials: null });

  it('entrega el agente enlazado al activo, sin credenciales ni regiones', async () => {
    const repo = { claimNext: jest.fn().mockResolvedValueOnce(claimed()), loadRunContext: jest.fn().mockResolvedValue(ctx()), loadAgentLink: jest.fn().mockResolvedValue({ tenantId: TENANT, assetId: ASSET, agentId: '007' }) } as unknown as ScanRepository;
    const job = await new ClaimExecutionUseCase(repo, {} as never, {} as never).execute('assessment');
    expect(job).toMatchObject({ kind: 'assessment', connection: { method: 'agent' }, regions: [], externalAccountId: null, agent: { name: ASSET, group: TENANT, agentId: '007' } });
  });

  it('si el agente aún no existe en la sonda, cierra la ejecución como fallo de conexión y sigue con la siguiente', async () => {
    const repo = {
      claimNext: jest.fn().mockResolvedValueOnce(claimed()).mockResolvedValueOnce(null),
      loadRunContext: jest.fn().mockResolvedValue(ctx()),
      loadAgentLink: jest.fn().mockResolvedValue({ tenantId: TENANT, assetId: ASSET, agentId: null }),
      failExecution: jest.fn().mockResolvedValue({ executionId: EXEC }),
    } as unknown as ScanRepository;
    expect(await new ClaimExecutionUseCase(repo, {} as never, {} as never).execute('assessment')).toBeNull();
    expect(repo.failExecution).toHaveBeenCalledWith({ companyId: TENANT }, EXEC, 'connection.agent_not_found', expect.any(Function));
  });
});
