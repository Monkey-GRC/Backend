import type { INestApplication } from '@nestjs/common';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { FileStorage } from '../../src/common/storage/file-storage';
import { Agent, bootApp, owner, RUN } from '../support/app';
import { controlesDe } from '../support/asignaciones';
import { controlPropioConPruebas } from '../support/controles';
import { avisosDe, idDe } from '../support/avisos';
import { invitarYActivar, sembrarEquipo } from '../support/equipo';
import { dosEmpresas, Tenant } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-515 · D151 · Los avisos que nacen con el hecho: `control_assigned` (al asignar dueño o ejecutor) y, desde MD-504 (D132), `control_pending_approval`, `control_owner_approved` y `control_returned` (la gestión del control). Nacen EN la misma
// transacción del hecho y nunca avisan a quien lo causa. Por HTTP real con la sesión de cada rol, contra el Postgres desechable.
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let adminId: string;
let responsable: { id: string; session: Agent };
let otroResponsable: { id: string; session: Agent };
let delegado: { id: string; session: Agent };
let controlX: string;
let controlY: string;
let n = 0;
const email = (k: string) => `${k}-${RUN}-${n++}@emisores.test`;
const pdf = (marca: string) => Buffer.from(`%PDF-1.7\n% evidencia ${marca} ${RUN}\n`);

const putOwner = (ids: string[], ownerId: string | null) => a.agent.put('/v1/assignments/owner').send({ client_control_ids: ids, owner_id: ownerId });
const putExecutor = (ids: string[], executorId: string | null, agent: Agent = responsable.session) => agent.put('/v1/assignments/executor').send({ client_control_ids: ids, executor_id: executorId });
const deTipo = async (userId: string, type: string) => (await avisosDe(userId)).filter((x) => x.type === type);
const lista = async (agent: Agent, query = '') => (await agent.get(`/v1/me/notifications${query}`).expect(200)).body.data.items as any[];

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(new StorageEnMemoria()));
  ({ a, b } = await dosEmpresas(app));
  adminId = await idDe(a.email);
  responsable = await invitarYActivar(app, a.agent, { email: email('resp'), name: 'Laura', last_name: 'Gómez', role: 'responsable' });
  otroResponsable = await invitarYActivar(app, a.agent, { email: email('resp2'), name: 'Rosa', last_name: 'Rojas', role: 'responsable' });
  const equipo = await sembrarEquipo(a.companyId, responsable.id, `Equipo ${RUN}`);
  delegado = await invitarYActivar(app, a.agent, { email: email('del'), name: 'Juan', last_name: 'Pérez', role: 'delegado', group_id: equipo, is_internal: true });
  [controlX, controlY] = (await controlesDe(a.serviceId)).slice(0, 2);
});
afterAll(async () => {
  await app?.close();
});
beforeEach(async () => {
  await owner('delete from platform.client_control_assignments where company_id = $1', [a.companyId]);
  await owner('delete from platform.notifications where company_id = any($1::uuid[])', [[a.companyId, b.companyId]]);
});
afterEach(() => jest.restoreAllMocks());

describe('control_assigned · al asignar dueño o ejecutor', () => {
  it('asignar el dueño avisa al dueño, no a quien lo asigna; el texto lleva el código y quién lo asignó', async () => {
    await putOwner([controlX, controlY], responsable.id).expect(200);
    const avisos = await deTipo(responsable.id, 'control_assigned');
    expect(avisos.map((x) => x.target_id).sort()).toEqual([controlX, controlY].sort());
    expect(avisos[0].params).toMatchObject({ assignee_role: 'owner', service_id: a.serviceId, service_name: a.serviceName });
    expect(await avisosDe(adminId)).toEqual([]);

    const mio = (await lista(responsable.session, '?type=control_assigned')).find((i) => i.control.id === controlX);
    expect(mio.title).toMatch(/^[A-Z]+-\d+ · Te asignaron este control como dueño$/);
    expect(mio).toMatchObject({ is_read: false, target: { kind: 'control', id: controlX, service_id: a.serviceId }, service: { id: a.serviceId, name: a.serviceName } });
    expect(mio.detail.what_happened).toContain(`del servicio ${a.serviceName} como dueño`);
    expect(mio.detail.why_it_matters).toBe('Respondes por este control y revisas la evidencia que sube tu equipo.');
  });

  it('asignar el ejecutor avisa al delegado y no al responsable que lo asigna', async () => {
    await putOwner([controlX], responsable.id).expect(200);
    await putExecutor([controlX], delegado.id).expect(200);
    const avisos = await deTipo(delegado.id, 'control_assigned');
    expect(avisos).toHaveLength(1);
    expect(avisos[0].params).toMatchObject({ assignee_role: 'executor', owner: { name: 'Laura Gómez', role: 'responsable' }, executor: { name: 'Juan Pérez', role: 'delegado' } });
    expect(await deTipo(responsable.id, 'control_assigned')).toHaveLength(1); // solo el que recibió al ser dueño
    const en = (await lista(delegado.session, '?type=control_assigned'))[0];
    expect(en.title).toContain('Te asignaron este control como ejecutor');
  });

  it('el administrador que se asigna a sí mismo no recibe aviso; tampoco «Sin asignar» ni quitar el ejecutor', async () => {
    await putOwner([controlX], adminId).expect(200);
    expect(await avisosDe(adminId)).toEqual([]);
    await putOwner([controlX], responsable.id).expect(200);
    await putExecutor([controlX], delegado.id).expect(200);
    const antes = (await avisosDe(delegado.id)).length;
    await putExecutor([controlX], null).expect(200);
    await putOwner([controlX], null).expect(200);
    expect((await avisosDe(delegado.id)).length).toBe(antes);
    expect((await avisosDe(responsable.id)).length).toBe(1);
  });

  it('repetir la misma asignación (sin cambio) no avisa otra vez', async () => {
    await putOwner([controlX], responsable.id).expect(200);
    await putOwner([controlX], responsable.id).expect(200);
    expect(await deTipo(responsable.id, 'control_assigned')).toHaveLength(1);
  });

  it('reasignar a otra persona avisa a la nueva, no a la anterior', async () => {
    await putOwner([controlX], responsable.id).expect(200);
    await putOwner([controlX], otroResponsable.id).expect(200);
    expect(await deTipo(otroResponsable.id, 'control_assigned')).toHaveLength(1);
    expect(await deTipo(responsable.id, 'control_assigned')).toHaveLength(1);
  });

  it('nace en la misma transacción: si el rastro de auditoría falla, la asignación se revierte y no queda ningún aviso', async () => {
    jest.spyOn(auditInsert, 'insertAuditLog').mockRejectedValueOnce(new Error('el rastro falló'));
    await putOwner([controlX], responsable.id).expect(500);
    expect(await avisosDe(responsable.id)).toEqual([]);
    expect((await owner('select 1 from platform.client_control_assignments where client_control_id = $1', [controlX])).length).toBe(0);
  });

  it('el aviso es de una sola empresa: no aparece en la campana de otra', async () => {
    await putOwner([controlX], responsable.id).expect(200);
    expect(await lista(b.agent)).toEqual([]);
  });
});

describe('control_pending_approval, control_owner_approved y control_returned · la gestión del control (D132)', () => {
  let control: string;
  let testId: string;

  beforeAll(async () => {
    // Un control propio cuya única prueba es la documental que se va a entregar: subirla lo deja «Cumple – por aprobar».
    [{ id: testId }] = await owner<{ id: string }>(`select id from catalog.tests where code like 'T-DOC-%' order by code limit 1`);
    control = await controlPropioConPruebas(a.companyId, a.serviceId, `N${RUN.toUpperCase()}`, [testId]);
  });
  const subir = async (agent: Agent, marca: string) => (await agent.post(`/v1/controls/${control}/tests/${testId}/evidence`).attach('file', pdf(marca), `${marca}.pdf`).expect(201)).body.data.id as string;
  const decidir = (agent: Agent, body: Record<string, unknown>) => agent.post(`/v1/controls/${control}/approval`).send(body);
  const preparar = async () => {
    await owner('delete from tenant.evidence_submissions where evidence_requirement_id in (select id from tenant.evidence_requirements where client_control_id = $1)', [control]).catch(() => undefined);
    await putOwner([control], responsable.id).expect(200);
    await putExecutor([control], delegado.id).expect(200);
    await owner('delete from platform.notifications where company_id = $1', [a.companyId]);
  };

  it('al llegar a «por aprobar» avisa al responsable (no a quien cargó la evidencia); la primera aprobación avisa al administrador', async () => {
    await preparar();
    await subir(delegado.session, 'por-aprobar');
    const aviso = await deTipo(responsable.id, 'control_pending_approval');
    expect(aviso).toHaveLength(1);
    expect(await deTipo(delegado.id, 'control_pending_approval')).toEqual([]);
    expect(await deTipo(adminId, 'control_pending_approval')).toEqual([]);

    await decidir(responsable.session, { decision: 'approve' }).expect(200);
    const alAdmin = await deTipo(adminId, 'control_owner_approved');
    expect(alAdmin).toHaveLength(1);
    expect(alAdmin[0].params).toMatchObject({ service_name: a.serviceName, actor: { role: 'responsable' } });
    expect(await deTipo(responsable.id, 'control_owner_approved')).toEqual([]);
  });

  it('devolver avisa al delegado y al responsable, no a quien devuelve', async () => {
    await putOwner([control], responsable.id).expect(200);
    await putExecutor([control], delegado.id).expect(200);
    await owner('delete from platform.notifications where company_id = $1', [a.companyId]);
    await decidir(a.agent, { decision: 'return', reason: 'El acta no está firmada.' }).expect(200);
    expect((await deTipo(delegado.id, 'control_returned')).length).toBe(1);
    expect((await deTipo(responsable.id, 'control_returned')).length).toBe(1);
    expect(await deTipo(adminId, 'control_returned')).toEqual([]);
    const visto = (await lista(delegado.session, '?type=control_returned'))[0];
    expect(visto.control.id).toBe(control);
    expect(JSON.stringify(visto)).not.toMatch(/wazuh|prowler|T-DOC/i);
  });

  it('con un control sin responsable, «por aprobar» avisa al administrador', async () => {
    await owner('delete from platform.client_control_assignments where company_id = $1', [a.companyId]);
    await owner('delete from platform.notifications where company_id = $1', [a.companyId]);
    await subir(a.agent, 'sin-responsable-2');
    // El administrador causó la carga pero el aviso nace del cambio de estado: sin actor.
    expect((await deTipo(adminId, 'control_pending_approval')).length).toBe(1);
  });
});
