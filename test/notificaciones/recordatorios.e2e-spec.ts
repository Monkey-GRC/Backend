import type { INestApplication } from '@nestjs/common';
import { Agent, bootApp, owner, RUN } from '../support/app';
import { asignarControl, controlesDe } from '../support/asignaciones';
import { avisosDe, idDe } from '../support/avisos';
import { invitarYActivar, sembrarEquipo } from '../support/equipo';
import { definirPeriodo, dosEmpresas, Tenant } from '../support/escenario';
import { RollEvaluationPeriodsUseCase } from '../../src/features/compliance/application/periods/evaluation-period.use-cases';

// MD-515 · D138, D151 · Los recordatorios de las ventanas los genera la pasada diaria de los períodos (la misma que abre los períodos, D148) con la foto del servicio que ya cargó:
// `window_due_soon` desde `alert_at` (PR-06) y `window_expired` cuando el cierre cayó sin evidencia en el período auditado (G-06). Idempotentes. El reloj de la pasada es el que se le da.
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let adminIds: string[];
let responsable: { id: string; session: Agent };
let delegado: { id: string; session: Agent };
let mensual: string; // un control con dueño, ejecutor y periodicidad mensual
let diario: string; // otro con periodicidad diaria
let sinDueno: string; // uno «Sin asignar» con periodicidad mensual
let n = 0;
const email = (k: string) => `${k}-${RUN}-${n++}@recordatorios.test`;
const at = (dia: string, hora = '12:00') => new Date(`${dia}T${hora}:00Z`);
const pasada = (now: Date) => app.get(RollEvaluationPeriodsUseCase).execute(now, [a.companyId, b.companyId]);

const avisos = (companyId: string, type: string) =>
  owner<{ user_id: string; target_id: string; target_kind: string; due_at: string; dedupe_key: string; params: any }>(
    `select user_id, target_id, target_kind::text, due_at::text, dedupe_key, params from platform.notifications where company_id = $1 and type = $2::platform.notification_type order by dedupe_key, user_id`,
    [companyId, type],
  );
const deControl = (rows: Awaited<ReturnType<typeof avisos>>, controlId: string) => rows.filter((r) => r.target_id === controlId);
const agrupados = (rows: Awaited<ReturnType<typeof avisos>>) => rows.filter((r) => r.target_kind === 'service');
const limpiar = () => owner('delete from platform.notifications where company_id = any($1::uuid[])', [[a.companyId, b.companyId]]);
const periodicidad = (controlId: string, valor: string) => owner(`update tenant.client_control_requirements set periodicity = $2::catalog.periodicity where client_control_id = $1`, [controlId, valor]);

beforeAll(async () => {
  app = await bootApp();
  ({ a, b } = await dosEmpresas(app));
  adminIds = [await idDe(a.email)];
  responsable = await invitarYActivar(app, a.agent, { email: email('resp'), name: 'Laura', last_name: 'Gómez', role: 'responsable' });
  const equipo = await sembrarEquipo(a.companyId, responsable.id, `Equipo ${RUN}`);
  delegado = await invitarYActivar(app, a.agent, { email: email('del'), name: 'Juan', last_name: 'Pérez', role: 'delegado', group_id: equipo, is_internal: true });
  [mensual, diario, sinDueno] = await controlesDe(a.serviceId);
  await asignarControl(a.companyId, mensual, responsable.id, delegado.id);
  await asignarControl(a.companyId, diario, responsable.id, delegado.id);
  await periodicidad(mensual, 'monthly');
  await periodicidad(diario, 'daily');
  await periodicidad(sinDueno, 'monthly');
  await definirPeriodo(a.serviceId, null, null);
});
afterAll(async () => {
  await app?.close();
});
beforeEach(limpiar);

describe('window_due_soon · desde alert_at (PR-06)', () => {
  it('antes de alert_at no avisa', async () => {
    await pasada(at('2026-11-24'));
    expect(deControl(await avisos(a.companyId, 'window_due_soon'), mensual)).toEqual([]);
  });

  it('desde alert_at avisa al ejecutor y al dueño del control con el cierre de la ventana', async () => {
    await pasada(at('2026-11-26'));
    const rows = deControl(await avisos(a.companyId, 'window_due_soon'), mensual);
    expect(rows.map((r) => r.user_id).sort()).toEqual([delegado.id, responsable.id].sort());
    expect(rows[0]).toMatchObject({ due_at: '2026-11-30', dedupe_key: `window_due_soon:${mensual}:2026-11-30`, params: { periodicity: 'monthly', service_name: a.serviceName } });
    expect(rows[0].params.requirement_codes.length).toBeGreaterThan(0);
  });

  it('lo ve la persona en su campana: título con el código y el cierre, y los 7 campos', async () => {
    await pasada(at('2026-11-26'));
    const items = (await responsable.session.get('/v1/me/notifications?type=window_due_soon').expect(200)).body.data.items as any[];
    const item = items.find((i) => i.control?.id === mensual);
    expect(item.title).toMatch(/^[A-Z]+-\d+ · La ventana mensual cierra el 30\/11\/2026 y falta evidencia$/);
    expect(item).toMatchObject({ due_at: '2026-11-30', target: { kind: 'control', id: mensual, service_id: a.serviceId } });
    expect(item.detail.who).toBe('Ejecuta: Juan Pérez (delegado) · Dueño: Laura Gómez (responsable)');
    expect(item.detail.what_happened).toContain(`servicio ${a.serviceName}`);
    for (const campo of ['what_happened', 'why_it_matters', 'how_to_fix', 'who', 'time_needed', 'evidence', 'impact']) expect(typeof item.detail[campo]).toBe('string');
    expect(JSON.stringify(item)).not.toMatch(/wazuh|prowler/i);
  });

  it('un servicio sin período auditado abierto recibe el aviso previo', async () => {
    await definirPeriodo(a.serviceId, null, null);
    await pasada(at('2026-11-26'));
    expect(deControl(await avisos(a.companyId, 'window_due_soon'), mensual).length).toBe(2);
  });

  it('la periodicidad diaria no genera «por vencer»', async () => {
    await pasada(at('2026-11-26'));
    expect(deControl(await avisos(a.companyId, 'window_due_soon'), diario)).toEqual([]);
  });

  it('es idempotente: repetir la pasada, el mismo día o los siguientes, no duplica', async () => {
    await pasada(at('2026-11-26'));
    const antes = (await avisos(a.companyId, 'window_due_soon')).length;
    expect(antes).toBeGreaterThan(0);
    await pasada(at('2026-11-26', '18:00'));
    await pasada(at('2026-11-27'));
    expect((await avisos(a.companyId, 'window_due_soon')).length).toBe(antes);
  });

  it('los controles «Sin asignar» no avisan uno por uno: cada administrador recibe UN aviso por servicio y día, con la cantidad y los códigos', async () => {
    await pasada(at('2026-11-25'));
    const todos = await avisos(a.companyId, 'window_due_soon');
    const sinAsignar = (await controlesDe(a.serviceId)).filter((c) => c !== mensual && c !== diario);
    expect(todos.filter((r) => r.target_kind === 'control' && sinAsignar.includes(r.target_id))).toEqual([]);
    const grupo = agrupados(todos);
    expect(grupo.map((r) => r.user_id)).toEqual(adminIds);
    expect(grupo[0]).toMatchObject({ target_id: a.serviceId, due_at: null, dedupe_key: `window_due_soon:service:${a.serviceId}:2026-11-25` });
    expect(grupo[0].params).toMatchObject({ service_id: a.serviceId, service_name: a.serviceName, control_count: expect.any(Number) });
    expect(grupo[0].params.control_count).toBeGreaterThanOrEqual(1);
    expect(grupo[0].params.control_codes.length).toBe(Math.min(grupo[0].params.control_count, 5));
    expect(grupo[0].params.controls.map((c: { code: string }) => c.code)).toEqual(grupo[0].params.control_codes);
    expect(await controlesDe(a.serviceId)).toEqual(expect.arrayContaining(grupo[0].params.controls.map((c: { id: string }) => c.id)));
    const item = ((await a.agent.get('/v1/me/notifications?type=window_due_soon').expect(200)).body.data.items as any[]).find((i) => i.target.kind === 'service');
    expect(item).toMatchObject({ control: null, service: { id: a.serviceId, name: a.serviceName }, target: { kind: 'service', id: a.serviceId, service_id: a.serviceId }, due_at: null });
    expect(item.controls).toEqual(grupo[0].params.controls);
    expect(item.controls.length).toBe(Math.min(grupo[0].params.control_count, 5));
    expect(item.title).toMatch(/^\d+ controles? sin asignar tienen? (ventanas por vencer|una ventana por vencer)$/);
    expect(item.detail.how_to_fix).toContain('«Sin asignar»');
    // Repetir la pasada del mismo día no duplica.
    await pasada(at('2026-11-25', '18:00'));
    expect(agrupados(await avisos(a.companyId, 'window_due_soon')).length).toBe(grupo.length);
  });

  it('cada empresa recibe solo lo suyo', async () => {
    await pasada(at('2026-11-26'));
    const deB = await avisos(b.companyId, 'window_due_soon');
    for (const r of deB) expect(r.user_id).not.toBe(responsable.id);
    expect((await avisos(a.companyId, 'window_due_soon')).every((r) => !deB.some((x) => x.user_id === r.user_id))).toBe(true);
  });
});

describe('window_expired · la ventana cerró sin evidencia en el período auditado (G-06)', () => {
  beforeAll(async () => {
    await definirPeriodo(a.serviceId, '2026-07-01', '2026-12-31');
  });
  afterAll(async () => {
    await definirPeriodo(a.serviceId, null, null);
  });

  it('el día después del cierre avisa al ejecutor, al dueño y a TODOS los administradores', async () => {
    await pasada(at('2026-11-01'));
    const rows = deControl(await avisos(a.companyId, 'window_expired'), mensual);
    expect(rows.map((r) => r.user_id).sort()).toEqual([delegado.id, responsable.id, ...adminIds].sort());
    expect(rows[0]).toMatchObject({ due_at: '2026-10-31', dedupe_key: `window_expired:${mensual}:2026-10-31`, params: { periodicity: 'monthly' } });
  });

  it('su texto dice que la ventana cerró y qué pasa con el control', async () => {
    await pasada(at('2026-11-01'));
    const item = ((await responsable.session.get('/v1/me/notifications?type=window_expired').expect(200)).body.data.items as any[]).find((i) => i.control?.id === mensual);
    expect(item.title).toMatch(/^[A-Z]+-\d+ · La ventana mensual cerró el 31\/10\/2026 sin evidencia$/);
    expect(item.detail.why_it_matters).toBe('El requisito pasa a Vencido y el control vuelve a Incumplimiento.');
    const delAdmin = ((await a.agent.get('/v1/me/notifications?type=window_expired').expect(200)).body.data.items as any[]).find((i) => i.control?.id === mensual);
    expect(delAdmin).toBeTruthy();
  });

  it('es idempotente y un cierre viejo no se avisa de golpe', async () => {
    await pasada(at('2026-11-01'));
    const antes = deControl(await avisos(a.companyId, 'window_expired'), mensual).length;
    expect(antes).toBe(2 + adminIds.length);
    await pasada(at('2026-11-01', '20:00'));
    await pasada(at('2026-11-02'));
    expect(deControl(await avisos(a.companyId, 'window_expired'), mensual).length).toBe(antes);
    await limpiar();
    await pasada(at('2026-11-20'));
    expect(deControl(await avisos(a.companyId, 'window_expired'), mensual)).toEqual([]);
  });

  it('la periodicidad diaria sí avisa de la ventana vencida, pero solo la de ayer', async () => {
    await pasada(at('2026-11-01'));
    expect(deControl(await avisos(a.companyId, 'window_expired'), diario).map((r) => r.due_at)).toEqual(Array(2 + adminIds.length).fill('2026-10-31'));
  });

  it('los «Sin asignar» vencidos también se agrupan: uno por administrador, servicio y día', async () => {
    await pasada(at('2026-11-01'));
    const grupo = agrupados(await avisos(a.companyId, 'window_expired'));
    expect(grupo.map((r) => [r.user_id, r.target_id, r.dedupe_key])).toEqual(adminIds.map((u) => [u, a.serviceId, `window_expired:service:${a.serviceId}:2026-11-01`]));
    expect(grupo[0].params.control_codes.length).toBeGreaterThanOrEqual(1);
    const sinAsignar = (await controlesDe(a.serviceId)).filter((c) => c !== mensual && c !== diario);
    expect((await avisos(a.companyId, 'window_expired')).filter((r) => r.target_kind === 'control' && sinAsignar.includes(r.target_id))).toEqual([]);
  });

  it('sin período auditado abierto no hay ventanas que perder: solo el aviso previo', async () => {
    await definirPeriodo(a.serviceId, null, null);
    await pasada(at('2026-11-01'));
    expect(deControl(await avisos(a.companyId, 'window_expired'), mensual)).toEqual([]);
    await definirPeriodo(a.serviceId, '2026-07-01', '2026-12-31');
  });
});

describe('la pasada no deja avisos a medias', () => {
  it('lo que se escribió es todo del destinatario y de su empresa', async () => {
    await pasada(at('2026-11-26'));
    const rows = await owner<{ company_id: string; empresa_usuario: string }>(`select n.company_id, u.company_id as empresa_usuario from platform.notifications n join platform.users u on u.id = n.user_id where n.company_id = any($1::uuid[])`, [[a.companyId, b.companyId]]);
    for (const r of rows) expect(r.company_id).toBe(r.empresa_usuario);
    expect((await avisosDe(responsable.id)).every((x) => ['window_due_soon', 'window_expired'].includes(x.type))).toBe(true);
  });
});
