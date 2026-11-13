import { InstallFacts, installState } from './install-state';

const NOW = new Date('2026-11-12T12:00:00Z');
const later = new Date(NOW.getTime() + 10 * 60_000);
const earlier = new Date(NOW.getTime() - 1);
const facts = (over: Partial<InstallFacts> = {}): InstallFacts => ({ agentId: null, hasKey: false, keyExpiresAt: null, latestEnrollment: null, ...over });
const run = (over: Partial<InstallFacts>) => installState(facts(over), NOW);

describe('installState (D112)', () => {
  it('sin nada empezado', () => {
    expect(run({})).toEqual({ status: 'not_started', failureReason: null });
  });

  it.each(['queued', 'running'] as const)('con una creación del agente %s: preparando', (status) => {
    expect(run({ latestEnrollment: { status, failureReason: null } })).toEqual({ status: 'preparing', failureReason: null });
  });

  it('con el agente creado y la clave vigente: listo para pedir el comando', () => {
    expect(run({ agentId: '001', hasKey: true, keyExpiresAt: later, latestEnrollment: { status: 'completed', failureReason: null } })).toEqual({ status: 'ready', failureReason: null });
  });

  it('una clave vigente manda aunque haya otra ejecución anotada', () => {
    expect(run({ agentId: '001', hasKey: true, keyExpiresAt: later, latestEnrollment: { status: 'queued', failureReason: null } }).status).toBe('ready');
  });

  it('una clave CADUCADA no está lista: el comando ya no se puede pedir y hay que generar uno nuevo', () => {
    expect(run({ agentId: '001', hasKey: true, keyExpiresAt: earlier, latestEnrollment: { status: 'completed', failureReason: null } }).status).toBe('delivered');
  });

  it('la clave caduca justo en su instante límite (no se puede pedir en el mismo segundo en que vence)', () => {
    expect(run({ agentId: '001', hasKey: true, keyExpiresAt: NOW }).status).toBe('delivered');
  });

  it('con el agente creado y sin clave: ya se entregó', () => {
    expect(run({ agentId: '001', latestEnrollment: { status: 'completed', failureReason: null } })).toEqual({ status: 'delivered', failureReason: null });
  });

  it('una clave sin fecha de caducidad NO se considera vigente (nunca vive para siempre)', () => {
    expect(run({ agentId: '001', hasKey: true, keyExpiresAt: null }).status).toBe('delivered');
  });

  it.each(['failed', 'cancelled'] as const)('si la creación %s y no hay agente: falló, con su razón', (status) => {
    expect(run({ latestEnrollment: { status, failureReason: 'connection.probe_unreachable' } })).toEqual({ status: 'failed', failureReason: 'connection.probe_unreachable' });
  });

  it('al generar de nuevo (el agente anterior se retiró) la creación en curso es «preparando», no «entregado»', () => {
    expect(run({ agentId: null, latestEnrollment: { status: 'running', failureReason: null } }).status).toBe('preparing');
  });
});
