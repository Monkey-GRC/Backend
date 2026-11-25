import type { INestApplication } from '@nestjs/common';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { FileStorage } from '../../src/common/storage/file-storage';
import { Agent, bootApp, owner, RUN } from '../support/app';
import { controlesDe } from '../support/asignaciones';
import { avisosDe, idDe } from '../support/avisos';
import { invitarYActivar, sembrarEquipo } from '../support/equipo';
import { dosEmpresas, Tenant } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-515 · D151 · Los avisos que nacen con el hecho: `control_assigned` (al asignar dueño o ejecutor) y `evidence_approved` / `evidence_rejected` (al revisar una evidencia). Nacen EN la misma
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
const ALL_OK = { type_ok: true, period_ok: true, valid_ok: true, approved_ok: true, signed_ok: true, content_ok: true, review: 'human_validated' as const };

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

describe('evidence_approved y evidence_rejected · al revisar una evidencia', () => {
  let testId: string;

  beforeAll(async () => {
    [{ id: testId }] = await owner<{ id: string }>(
      `select t.id from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = $1 and t.dimension = 'policy' order by t.code limit 1`,
      [controlX],
    );
  });
  const subir = async (agent: Agent, marca: string) => (await agent.post(`/v1/controls/${controlX}/tests/${testId}/evidence`).attach('file', pdf(marca), `${marca}.pdf`).expect(201)).body.data.id as string;
  const revisar = (agent: Agent, submissionId: string, body: Record<string, unknown>) => agent.put(`/v1/evidence-submissions/${submissionId}/review`).send(body);
  const preparar = async () => {
    await putOwner([controlX], responsable.id).expect(200);
    await putExecutor([controlX], delegado.id).expect(200);
    await owner('delete from platform.notifications where company_id = $1', [a.companyId]);
  };

  it('validar avisa a quien subió y al dueño; no a quien revisó', async () => {
    await preparar();
    const entrega = await subir(delegado.session, 'ok-1');
    await revisar(a.agent, entrega, { ...ALL_OK, note: 'Aprobada.' }).expect(200);
    const delDelegado = await deTipo(delegado.id, 'evidence_approved');
    const delDueno = await deTipo(responsable.id, 'evidence_approved');
    expect([delDelegado.length, delDueno.length]).toEqual([1, 1]);
    expect(await avisosDe(adminId)).toEqual([]);
    expect(delDelegado[0].params).toMatchObject({ service_name: a.serviceName, actor: { role: 'admin_empresa' } });

    const visto = (await lista(delegado.session, '?type=evidence_approved'))[0];
    expect(visto.title).toMatch(/^[A-Z]+-\d+ · Se validó una evidencia$/);
    expect(visto.control.id).toBe(controlX);
    expect(JSON.stringify(visto)).not.toMatch(/wazuh|prowler|T-DOC/i);
  });

  it('rechazar avisa a quien subió y al dueño con el tipo «rechazada»', async () => {
    await preparar();
    const entrega = await subir(delegado.session, 'no-1');
    await revisar(a.agent, entrega, { ...ALL_OK, signed_ok: false, note: 'Falta la firma.' }).expect(200);
    expect((await deTipo(delegado.id, 'evidence_rejected')).length).toBe(1);
    expect((await deTipo(responsable.id, 'evidence_rejected')).length).toBe(1);
    expect(await deTipo(delegado.id, 'evidence_approved')).toEqual([]);
    expect((await lista(delegado.session, '?type=evidence_rejected'))[0].detail.how_to_fix).toBe('Abre el control, lee el motivo del rechazo y sube una versión corregida.');
  });

  it('si quien revisa es el dueño, solo avisa a quien subió; si quien sube es el dueño, recibe un solo aviso', async () => {
    await preparar();
    const delDelegado = await subir(delegado.session, 'dueno-revisa');
    await revisar(responsable.session, delDelegado, ALL_OK).expect(200);
    expect(await deTipo(responsable.id, 'evidence_approved')).toEqual([]);
    expect((await deTipo(delegado.id, 'evidence_approved')).length).toBe(1);

    const delDueno = await subir(responsable.session, 'dueno-sube');
    await revisar(a.agent, delDueno, ALL_OK).expect(200);
    expect((await deTipo(responsable.id, 'evidence_approved')).length).toBe(1);
  });

  it('una revisión sin decisión (sin validación humana) no avisa', async () => {
    await preparar();
    const entrega = await subir(delegado.session, 'pendiente');
    await revisar(a.agent, entrega, { ...ALL_OK, review: 'pending_review' }).expect(200);
    expect(await avisosDe(delegado.id)).toEqual([]);
  });

  it('revisar de nuevo con otra decisión avisa de nuevo', async () => {
    await preparar();
    const entrega = await subir(delegado.session, 'cambio');
    await revisar(a.agent, entrega, ALL_OK).expect(200);
    await revisar(a.agent, entrega, { ...ALL_OK, content_ok: false, note: 'No era el contenido.' }).expect(200);
    expect((await avisosDe(delegado.id)).map((x) => x.type)).toEqual(['evidence_approved', 'evidence_rejected']);
  });
});
