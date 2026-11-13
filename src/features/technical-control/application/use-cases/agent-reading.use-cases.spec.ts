import { ConfigService } from '@nestjs/config';
import { AgentReadingFacts } from '../../domain/agent-reading/reading-plan';
import { ScanRepository } from '../../domain/repositories/scan.repository';
import { AgentReadingConfig } from '../agent-reading-config';
import { MAX_READINGS_PER_PASS, QueueAgentReadingsUseCase } from './agent-reading.use-cases';
import { FailExecutionUseCase } from './scan.use-cases';

const NOW = new Date('2026-11-12T12:00:00Z');
const ago = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000);
const facts = (n: number, over: Partial<AgentReadingFacts> = {}): AgentReadingFacts => ({ tenantId: `t${n}`, assetId: `a${n}`, status: 'pending', enrolledAt: ago(10), lastSyncAt: null, lastAttempt: null, ...over });

const config = (env: Record<string, string> = {}) => new AgentReadingConfig({ get: (k: string) => env[k] } as unknown as ConfigService);
const repoWith = (candidates: AgentReadingFacts[], queue = jest.fn().mockResolvedValue({ executionId: 'e' })) => ({ listAgentReadingCandidates: jest.fn().mockResolvedValue(candidates), queueAgentReading: queue }) as unknown as ScanRepository;

describe('QueueAgentReadingsUseCase', () => {
  it('encola solo los servidores a los que les toca, cada uno en SU empresa', async () => {
    const repo = repoWith([
      facts(1), // aún no se conecta, nunca se intentó: toca
      facts(2, { lastAttempt: { outcome: 'not_ready', at: ago(1) } }), // se intentó hace 1 minuto: no toca todavía
      facts(3, { status: 'connected', lastSyncAt: ago(25 * 60) }), // conectado hace más de 24 h: toca
      facts(4, { status: 'connected', lastSyncAt: ago(60) }), // conectado hace una hora: no toca
      facts(5, { enrolledAt: ago(30 * 60) }), // pasó el plazo de búsqueda: no toca
    ]);
    const pass = await new QueueAgentReadingsUseCase(repo, config()).execute(NOW);
    expect(pass).toEqual({ considered: 5, due: 2, queued: 2 });
    expect(repo.queueAgentReading).toHaveBeenCalledWith({ companyId: 't1' }, 'a1');
    expect(repo.queueAgentReading).toHaveBeenCalledWith({ companyId: 't3' }, 'a3');
    expect(repo.queueAgentReading).toHaveBeenCalledTimes(2);
  });

  it('pide a la base solo lo que cabe en los plazos configurados', async () => {
    const repo = repoWith([]);
    await new QueueAgentReadingsUseCase(repo, config({ AGENT_WATCH_WINDOW_HOURS: '12', AGENT_REFRESH_INTERVAL_HOURS: '6' })).execute(NOW);
    expect(repo.listAgentReadingCandidates).toHaveBeenCalledWith({ windowSeconds: 12 * 3600, refreshSeconds: 6 * 3600 });
  });

  it('si otra pasada (u otra instancia) ya dejó la lectura en cola, no cuenta como encolada', async () => {
    const repo = repoWith([facts(1), facts(2)], jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ executionId: 'e' }));
    expect((await new QueueAgentReadingsUseCase(repo, config()).execute(NOW)).queued).toBe(1);
  });

  it('un servidor que falla no detiene a los demás', async () => {
    const repo = repoWith([facts(1), facts(2)], jest.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce({ executionId: 'e' }));
    expect((await new QueueAgentReadingsUseCase(repo, config()).execute(NOW)).queued).toBe(1);
  });

  it('no inunda al trabajador: tope por pasada, y el resto queda para la siguiente', async () => {
    const many = Array.from({ length: MAX_READINGS_PER_PASS + 50 }, (_, i) => facts(i));
    const repo = repoWith(many);
    const pass = await new QueueAgentReadingsUseCase(repo, config()).execute(NOW);
    expect(pass.due).toBe(MAX_READINGS_PER_PASS);
    expect(repo.queueAgentReading).toHaveBeenCalledTimes(MAX_READINGS_PER_PASS);
  });
});

describe('AgentReadingConfig', () => {
  it('usa los valores aprobados por omisión: 3 min, 24 h, 24 h, 60 min', () => {
    expect(config().get()).toEqual({ enabled: true, watchIntervalMinutes: 3, watchWindowHours: 24, refreshIntervalHours: 24, recheckIntervalMinutes: 60 });
  });
  it('se configura por entorno, y un valor ilegible no apaga ni dispara la lectura', () => {
    expect(config({ AGENT_WATCH_INTERVAL_MINUTES: '5', AGENT_REFRESH_INTERVAL_HOURS: '12' }).get()).toMatchObject({ watchIntervalMinutes: 5, refreshIntervalHours: 12 });
    expect(config({ AGENT_WATCH_INTERVAL_MINUTES: 'mucho', AGENT_WATCH_WINDOW_HOURS: '-4', AGENT_RECHECK_INTERVAL_MINUTES: '0' }).get()).toMatchObject({ enabled: true, watchIntervalMinutes: 3, watchWindowHours: 24, recheckIntervalMinutes: 60 });
  });
  it('AGENT_WATCH_INTERVAL_MINUTES=0 la apaga', () => {
    expect(config({ AGENT_WATCH_INTERVAL_MINUTES: '0' }).get().enabled).toBe(false);
  });
});

describe('FailExecutionUseCase · lectura automática que no estaba lista (D112)', () => {
  const T = '11111111-1111-4111-8111-111111111111';
  const E = '44444444-4444-4444-8444-444444444444';

  it('si se cerró sin ruido, no la marca como fallo', async () => {
    const repo = { settleAgentReading: jest.fn().mockResolvedValue(true), failExecution: jest.fn() } as unknown as ScanRepository;
    const out = await new FailExecutionUseCase(repo).execute(T, E, 'connection.agent_no_scan_yet');
    expect(out).toEqual({ executionId: E });
    expect(repo.failExecution).not.toHaveBeenCalled();
    expect(repo.settleAgentReading).toHaveBeenCalledWith({ companyId: T }, E, 'connection.agent_no_scan_yet', expect.any(Function));
  });

  it('si no aplica (otra razón, o la pidió una persona), se cierra como fallo normal con su razón a la vista', async () => {
    const repo = { settleAgentReading: jest.fn().mockResolvedValue(false), failExecution: jest.fn().mockResolvedValue({ executionId: E }) } as unknown as ScanRepository;
    await new FailExecutionUseCase(repo).execute(T, E, 'connection.agent_not_found');
    expect(repo.failExecution).toHaveBeenCalledWith({ companyId: T }, E, 'connection.agent_not_found', expect.any(Function));
  });

  it('el cambio a «desconectado» se audita sin persona detrás y sin datos del servidor', async () => {
    const audits: Record<string, unknown>[] = [];
    const repo = {
      settleAgentReading: jest.fn(async (_s, _e, _r, audit) => {
        audits.push(audit({ executionId: E, assetId: 'a1' }));
        return true;
      }),
    } as unknown as ScanRepository;
    await new FailExecutionUseCase(repo).execute(T, E, 'connection.agent_disconnected');
    expect(audits[0]).toMatchObject({ tenantId: T, userId: null, action: 'agent.disconnected', resource: 'asset', afterState: { asset_id: 'a1', execution_id: E, reason: 'connection.agent_disconnected' } });
  });
});
