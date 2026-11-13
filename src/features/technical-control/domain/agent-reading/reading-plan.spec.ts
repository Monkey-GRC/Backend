import { AgentReadingFacts, attemptOutcome, DEFAULT_READING_CONFIG as cfg, isNotReadyReason, isReadingDue, isWatching } from './reading-plan';

const NOW = new Date('2026-11-12T12:00:00Z');
const ago = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000);
const facts = (over: Partial<AgentReadingFacts> = {}): AgentReadingFacts => ({ tenantId: 't', assetId: 'a', status: 'pending', enrolledAt: ago(10), lastSyncAt: null, lastAttempt: null, ...over });

describe('isReadingDue · servidor que todavía no se conecta', () => {
  it('lo busca en cuanto el agente existe', () => {
    expect(isReadingDue(facts(), cfg, NOW)).toBe(true);
  });
  it('espera 3 minutos entre intento e intento', () => {
    expect(isReadingDue(facts({ lastAttempt: { outcome: 'not_ready', at: ago(2) } }), cfg, NOW)).toBe(false);
    expect(isReadingDue(facts({ lastAttempt: { outcome: 'not_ready', at: ago(3) } }), cfg, NOW)).toBe(true);
  });
  it('si un intento falló de verdad, espera una hora (no insiste cada 3 minutos con un error)', () => {
    expect(isReadingDue(facts({ lastAttempt: { outcome: 'failed', at: ago(30) } }), cfg, NOW)).toBe(false);
    expect(isReadingDue(facts({ lastAttempt: { outcome: 'failed', at: ago(60) } }), cfg, NOW)).toBe(true);
  });
  it('deja de buscarlo pasadas 24 horas desde que se creó su agente', () => {
    expect(isReadingDue(facts({ enrolledAt: ago(24 * 60 - 1) }), cfg, NOW)).toBe(true);
    expect(isReadingDue(facts({ enrolledAt: ago(24 * 60 + 1) }), cfg, NOW)).toBe(false);
  });
  it('sin agente creado todavía no hay nada que leer', () => {
    expect(isReadingDue(facts({ enrolledAt: null }), cfg, NOW)).toBe(false);
  });
});

describe('isReadingDue · servidor conectado', () => {
  const connected = (over: Partial<AgentReadingFacts> = {}) => facts({ status: 'connected', lastSyncAt: ago(60), ...over });
  it('se relee a las 24 horas, no antes', () => {
    expect(isReadingDue(connected({ lastSyncAt: ago(23 * 60) }), cfg, NOW)).toBe(false);
    expect(isReadingDue(connected({ lastSyncAt: ago(24 * 60) }), cfg, NOW)).toBe(true);
  });
  it('no machaca a uno cuya última lectura falló: espera una hora', () => {
    expect(isReadingDue(connected({ lastSyncAt: ago(30 * 60), lastAttempt: { outcome: 'failed', at: ago(20) } }), cfg, NOW)).toBe(false);
    expect(isReadingDue(connected({ lastSyncAt: ago(30 * 60), lastAttempt: { outcome: 'failed', at: ago(61) } }), cfg, NOW)).toBe(true);
  });
  it('si por alguna razón no tiene lectura guardada, toca', () => {
    expect(isReadingDue(connected({ lastSyncAt: null }), cfg, NOW)).toBe(true);
  });
});

describe('isReadingDue · servidor desconectado', () => {
  it('se reintenta cada hora, sin plazo: si el servidor vuelve, se entera solo', () => {
    const d = (m: number) => facts({ status: 'disconnected', enrolledAt: ago(10 * 24 * 60), lastAttempt: { outcome: 'not_ready', at: ago(m) } });
    expect(isReadingDue(d(59), cfg, NOW)).toBe(false);
    expect(isReadingDue(d(60), cfg, NOW)).toBe(true);
    expect(isReadingDue(facts({ status: 'disconnected', lastAttempt: null }), cfg, NOW)).toBe(true);
  });
});

describe('isWatching', () => {
  it('es cierto mientras Monkey lo busca solo y falso al vencer el plazo', () => {
    expect(isWatching({ status: 'pending', enrolledAt: ago(60) }, cfg, NOW)).toBe(true);
    expect(isWatching({ status: 'pending', enrolledAt: ago(25 * 60) }, cfg, NOW)).toBe(false);
    expect(isWatching({ status: 'pending', enrolledAt: null }, cfg, NOW)).toBe(false);
  });
  it('uno desconectado sigue buscándose; uno conectado ya no hace falta', () => {
    expect(isWatching({ status: 'disconnected', enrolledAt: ago(99999) }, cfg, NOW)).toBe(true);
    expect(isWatching({ status: 'connected', enrolledAt: ago(5) }, cfg, NOW)).toBe(false);
  });
});

describe('clasificación', () => {
  it('una lectura automática que cierra como cancelada es «no estaba lista»', () => {
    expect(attemptOutcome('completed')).toBe('completed');
    expect(attemptOutcome('cancelled')).toBe('not_ready');
    expect(attemptOutcome('failed')).toBe('failed');
  });
  it('solo «aún no entrega su primera evaluación» y «no está conectado» son razones de espera', () => {
    expect(isNotReadyReason('connection.agent_no_scan_yet')).toBe(true);
    expect(isNotReadyReason('connection.agent_disconnected')).toBe(true);
    expect(isNotReadyReason('connection.agent_not_found')).toBe(false);
    expect(isNotReadyReason('connection.agent_group_mismatch')).toBe(false);
  });
});
