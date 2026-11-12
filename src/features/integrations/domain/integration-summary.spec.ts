import { ConnectionRecord, IntegrationConnections } from './entities/integration.entities';
import { deriveStatus, summarizeIntegrations } from './integration-summary';

const conn = (over: Partial<ConnectionRecord> = {}): ConnectionRecord => ({
  assetId: 'a', code: 'AST-0001', name: 'Cuenta', connectionStatus: 'pending', operationalStatus: 'not_monitored', lastValidatedAt: null, resourceCount: 0, services: [], ...over,
});
const row = (over: Partial<IntegrationConnections> = {}): IntegrationConnections => ({ code: 'aws', name: 'Amazon Web Services', logoKey: 'aws', purpose: 'measurement', sortOrder: 1, connections: [conn()], ...over });

describe('estado de una integración (D110)', () => {
  it('pending si ninguna conexión está activa ni programada', () => {
    expect(deriveStatus([conn({ connectionStatus: 'pending' }), conn({ connectionStatus: 'validated' })])).toBe('pending');
  });
  it('active si alguna está activa o programada', () => {
    expect(deriveStatus([conn(), conn({ connectionStatus: 'active' })])).toBe('active');
    expect(deriveStatus([conn({ connectionStatus: 'scheduled' })])).toBe('active');
  });
  it('needs_attention gana a active: validación fallida o activo en error', () => {
    expect(deriveStatus([conn({ connectionStatus: 'active' }), conn({ connectionStatus: 'failed' })])).toBe('needs_attention');
    expect(deriveStatus([conn({ connectionStatus: 'scheduled', operationalStatus: 'error' })])).toBe('needs_attention');
  });
  it('un aviso (warning) no es atención', () => {
    expect(deriveStatus([conn({ connectionStatus: 'scheduled', operationalStatus: 'warning' })])).toBe('active');
  });
});

describe('lista de integraciones (D110)', () => {
  it('omite las integraciones sin conexiones', () => {
    expect(summarizeIntegrations([row({ connections: [] })])).toEqual([]);
  });

  it('ordena needs_attention, luego active, luego pending, y por nombre dentro de cada estado', () => {
    const out = summarizeIntegrations([
      row({ code: 'p', name: 'Zeta', connections: [conn()] }),
      row({ code: 'a2', name: 'Beta', connections: [conn({ connectionStatus: 'active' })] }),
      row({ code: 'n', name: 'Omega', connections: [conn({ connectionStatus: 'failed' })] }),
      row({ code: 'a1', name: 'Alfa', connections: [conn({ connectionStatus: 'scheduled' })] }),
    ]);
    expect(out.map((i) => i.code)).toEqual(['n', 'a1', 'a2', 'p']);
  });

  it('suma conexiones y recursos, toma la validación más reciente y marca la conexión con problema', () => {
    const [i] = summarizeIntegrations([
      row({
        connections: [
          conn({ assetId: '1', code: 'AST-0002', resourceCount: 5, lastValidatedAt: new Date('2026-11-01T00:00:00Z'), connectionStatus: 'failed' }),
          conn({ assetId: '2', code: 'AST-0001', resourceCount: 7, lastValidatedAt: new Date('2026-11-10T00:00:00Z'), connectionStatus: 'active' }),
        ],
      }),
    ]);
    expect(i.connectionCount).toBe(2);
    expect(i.resourceCount).toBe(12);
    expect(i.lastValidatedAt).toEqual(new Date('2026-11-10T00:00:00Z'));
    expect(i.connections.map((c) => [c.code, c.needsAttention])).toEqual([['AST-0001', false], ['AST-0002', true]]);
  });

  it('sin ninguna validación, last_validated_at es null', () => {
    expect(summarizeIntegrations([row()])[0].lastValidatedAt).toBeNull();
  });
});
