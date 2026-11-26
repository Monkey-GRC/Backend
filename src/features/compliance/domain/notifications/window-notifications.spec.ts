import { readControl } from '../controls/control-readout';
import { control, data, readoutTest, requirement } from '../controls/readout.fixtures';
import { EXPIRED_LOOKBACK_DAYS, windowNotifications } from './window-notifications';

// MD-515 · D138, D151 · Los avisos de las ventanas salen de la lectura de los controles (la foto ya cargada), con la regla de grupo y de destinatarios del contrato.
const at = (day: string) => new Date(`${day}T12:00:00Z`);
const OWNER = { id: 'owner-1', name: 'Laura', lastName: 'Gómez', role: 'responsable' };
const EXECUTOR = { id: 'exec-1', name: 'Juan', lastName: 'Pérez', role: 'delegado' };
const ADMINS = ['admin-1', 'admin-2'];
const SERVICE = { id: 's1', name: 'Plataforma de pagos' };
const PERIOD = { start: new Date('2026-07-01T00:00:00Z'), end: new Date('2026-12-31T00:00:00Z') };
const valid = (...days: string[]) => days.map((d) => ({ state: 'compliant' as const, submittedAt: new Date(`${d}T10:00:00Z`) }));
const evidence = (testId: string, ...days: string[]) => ({ testId, state: 'compliant' as const, submittedAt: new Date(`${days[days.length - 1]}T10:00:00Z`), history: valid(...days) });

const monthly = (patch: Parameters<typeof control>[1] = {}, periodicity: 'monthly' | 'daily' | 'quarterly' = 'monthly') =>
  control([requirement('r1', [readoutTest('t1', 'documentary')], { periodicity })], { access: { owner: OWNER, executor: EXECUTOR }, ...patch });

function notices(c: ReturnType<typeof monthly>, today: string, extra: { period?: typeof PERIOD; adminIds?: string[] } = {}) {
  const readout = readControl(c, data([c], [], { signals: { now: at(today), ...(extra.period ? { period: extra.period } : {}) } }));
  return windowNotifications({ companyId: 'co-1', service: SERVICE, readouts: [readout], adminIds: extra.adminIds ?? ADMINS, today });
}

describe('windowNotifications · ventana por vencer (PR-06)', () => {
  it('desde alert_at, con una prueba sin evidencia: un aviso al ejecutor y otro al dueño, con el cierre y el código', () => {
    const drafts = notices(monthly(), '2026-11-26');
    expect(drafts.map((d) => [d.userId, d.type, d.dueAt, d.dedupeKey])).toEqual([
      ['exec-1', 'window_due_soon', '2026-11-30', 'window_due_soon:c1:2026-11-30'],
      ['owner-1', 'window_due_soon', '2026-11-30', 'window_due_soon:c1:2026-11-30'],
    ]);
    expect(drafts[0]).toMatchObject({ companyId: 'co-1', targetKind: 'control', targetId: 'c1' });
    expect(drafts[0].params).toMatchObject({ control_code: 'IAC-1', requirement_codes: ['CC6.1'], service_id: 's1', service_name: 'Plataforma de pagos', periodicity: 'monthly', owner: { name: 'Laura Gómez', role: 'responsable' }, executor: { name: 'Juan Pérez', role: 'delegado' } });
  });

  it('un nombre de control que nombra al proveedor de la sonda no sale: se muestra el código (SEG-39)', () => {
    const [d] = notices(monthly({ name: 'Lectura con Wazuh de los accesos' }), '2026-11-26');
    expect((d.params as { control_name: string }).control_name).toBe('IAC-1');
    expect(JSON.stringify(d)).not.toMatch(/wazuh|prowler/i);
  });

  it('antes de alert_at no avisa', () => {
    expect(notices(monthly(), '2026-11-24')).toEqual([]);
  });

  it('con la evidencia ya validada en la ventana, no avisa', () => {
    expect(notices(monthly({ evidence: [evidence('t1', '2026-11-10')] }), '2026-11-26')).toEqual([]);
  });

  it('la periodicidad diaria no genera «por vencer»', () => {
    expect(notices(monthly({}, 'daily'), '2026-11-26')).toEqual([]);
  });

  it('un servicio sin período auditado abierto recibe el aviso previo', () => {
    expect(notices(monthly(), '2026-11-26').length).toBe(2);
  });

  it('sin ejecutor ejecuta el dueño: una persona con dos papeles recibe UN aviso', () => {
    const drafts = notices(monthly({ access: { owner: OWNER, executor: null } }), '2026-11-26');
    expect(drafts.map((d) => d.userId)).toEqual(['owner-1']);
  });

  it('repetir la lectura da las mismas claves: la pasada es idempotente', () => {
    const keys = (d: ReturnType<typeof notices>) => d.map((x) => `${x.userId}|${x.dedupeKey}`);
    expect(keys(notices(monthly(), '2026-11-26'))).toEqual(keys(notices(monthly(), '2026-11-27')));
  });
});

describe('windowNotifications · controles «Sin asignar»: un aviso por administrador, servicio, tipo y día', () => {
  const sinAsignar = (n: number, today: string, extra: { period?: typeof PERIOD } = {}) => {
    const controls = Array.from({ length: n }, (_, i) => monthly({ id: `c${i + 1}`, catalogCode: `IAC-${String(i + 1).padStart(2, '0')}`, access: { owner: null, executor: null } }));
    const readouts = controls.map((c) => readControl(c, data([c], [], { signals: { now: at(today), ...(extra.period ? { period: extra.period } : {}) } })));
    return windowNotifications({ companyId: 'co-1', service: SERVICE, readouts, adminIds: ADMINS, today });
  };

  it('el día del aviso previo, cada administrador recibe UNO por servicio con la cantidad y los códigos (máximo 5)', () => {
    const drafts = sinAsignar(7, '2026-11-25');
    expect(drafts).toHaveLength(ADMINS.length);
    expect(drafts.map((d) => d.userId)).toEqual(ADMINS);
    expect(drafts[0]).toMatchObject({ type: 'window_due_soon', targetKind: 'service', targetId: 's1', dueAt: null, dedupeKey: 'window_due_soon:service:s1:2026-11-25' });
    expect(drafts[0].params).toEqual({ service_id: 's1', service_name: 'Plataforma de pagos', control_count: 7, control_codes: ['IAC-01', 'IAC-02', 'IAC-03', 'IAC-04', 'IAC-05'], controls: ['c1', 'c2', 'c3', 'c4', 'c5'].map((id, i) => ({ id, code: `IAC-0${i + 1}` })) });
  });

  it('no repite al día siguiente los controles que ya avisaron (solo entran los de hoy) ni antes de su alert_at', () => {
    expect(sinAsignar(3, '2026-11-26')).toEqual([]);
    expect(sinAsignar(3, '2026-11-24')).toEqual([]);
  });

  it('la clave lleva el día: mañana puede haber otro aviso agrupado y repetir la pasada de hoy no duplica', () => {
    expect(sinAsignar(2, '2026-11-25').map((d) => d.dedupeKey)).toEqual(sinAsignar(2, '2026-11-25').map((d) => d.dedupeKey));
  });

  it('la ventana vencida de ayer también se agrupa, por servicio y día', () => {
    const c = monthly({ id: 'c1', evidence: [evidence('t1', '2026-07-10', '2026-08-10', '2026-09-12')], access: { owner: null, executor: null } });
    const readout = readControl(c, data([c], [], { signals: { now: at('2026-11-01'), period: PERIOD } }));
    const drafts = windowNotifications({ companyId: 'co-1', service: SERVICE, readouts: [readout], adminIds: ADMINS, today: '2026-11-01' }).filter((d) => d.type === 'window_expired');
    expect(drafts.map((d) => [d.userId, d.targetKind, d.dedupeKey])).toEqual(ADMINS.map((u) => [u, 'service', 'window_expired:service:s1:2026-11-01']));
    expect(drafts[0].params).toMatchObject({ control_count: 1, control_codes: ['IAC-1'], controls: [{ id: 'c1', code: 'IAC-1' }] });
  });

  it('un control con dueño sigue con su aviso por control', () => {
    expect(notices(monthly(), '2026-11-26').every((d) => d.targetKind === 'control')).toBe(true);
  });
});

describe('windowNotifications · ventana vencida (G-06)', () => {
  // Evidencia en julio, agosto y septiembre; la ventana de octubre (cierra el 31/10) quedó sin evidencia.
  const missingOctober = () => monthly({ evidence: [evidence('t1', '2026-07-10', '2026-08-10', '2026-09-12')] });

  it('el día después del cierre avisa al ejecutor, al dueño y a TODOS los administradores', () => {
    const drafts = notices(missingOctober(), '2026-11-01', { period: PERIOD }).filter((d) => d.type === 'window_expired');
    expect(drafts.map((d) => d.userId)).toEqual(['exec-1', 'owner-1', 'admin-1', 'admin-2']);
    expect(drafts[0]).toMatchObject({ dueAt: '2026-10-31', dedupeKey: 'window_expired:c1:2026-10-31', params: { periodicity: 'monthly' } });
  });

  it('un cierre de hace más de unos días no se avisa de golpe (una pasada nueva no inunda)', () => {
    const late = new Date(Date.parse('2026-10-31') + (EXPIRED_LOOKBACK_DAYS + 3) * 86_400_000).toISOString().slice(0, 10);
    expect(notices(missingOctober(), late, { period: PERIOD }).filter((d) => d.type === 'window_expired')).toEqual([]);
  });

  it('de la periodicidad diaria solo se avisa la ventana de ayer, no las de hace dos o tres días', () => {
    const diaria = monthly({}, 'daily');
    const dias = (today: string) => notices(diaria, today, { period: PERIOD }).filter((d) => d.type === 'window_expired').map((d) => d.dueAt);
    expect([...new Set(dias('2026-11-03'))]).toEqual(['2026-11-02']);
  });

  it('sin período auditado abierto no hay ventanas que perder: solo el aviso previo', () => {
    expect(notices(missingOctober(), '2026-11-01').filter((d) => d.type === 'window_expired')).toEqual([]);
  });

  it('si la ventana sí tuvo evidencia, no hay aviso de vencida', () => {
    const c = monthly({ evidence: [evidence('t1', '2026-07-10', '2026-08-10', '2026-09-12', '2026-10-05')] });
    expect(notices(c, '2026-11-01', { period: PERIOD }).filter((d) => d.type === 'window_expired')).toEqual([]);
  });
});
