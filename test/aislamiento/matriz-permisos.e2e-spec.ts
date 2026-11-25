import type { INestApplication } from '@nestjs/common';
import { ANY_AUTHENTICATED_KEY, PERMISSION_KEY } from '../../src/common/authorization/can.decorator';
import { can, PERMISSION_KEYS, type Permission } from '../../src/common/authorization/permission-matrix';
import { USER_ROLES, type UserRole } from '../../src/common/enums/user-role.enum';
import { Agent, bootApp } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';
import { delegadoDe, personaDe, Roles, unaPersonaPorRol } from '../support/roles';
import { sembrarEquipo } from '../support/equipo';
import { owner } from '../support/app';

// SEG-85, SEG-86, D150 · La matriz (§5.5) aplicada de punta a punta: UN endpoint representativo por permiso, llamado con la sesión real de CADA uno de los seis roles. Quien no tiene el permiso
// (celda vacía o pendiente) recibe 403 del guard; quien lo tiene pasa el guard (la respuesta puede ser 200, 404 o 422, nunca el 403 de la matriz). El endpoint llega con un id inexistente o
// un cuerpo vacío a propósito: lo que se mide es la puerta, no la operación (esas pruebas están en cada módulo).
const U = '00000000-0000-4000-8000-000000000001';
let app: INestApplication;
let a: Tenant;
let roles: Roles;
let agents: Record<UserRole, Agent>;

type Call = (agent: Agent, t: Tenant) => PromiseLike<{ status: number }>;
const sid = (t: Tenant) => t.serviceId;

// Un endpoint por permiso. Los permisos del libro que aún no tienen ruta (aprobar un control, archivar, exportar…) están en SIN_RUTA y esta prueba exige que sigan sin ella.
const RUTAS: Partial<Record<Permission, Call>> = {
  'companies.manage': (g) => g.get('/v1/companies'),
  'company.configure': (g) => g.get('/v1/onboarding/organizational-context'),
  'users.manage': (g) => g.patch(`/v1/users/${U}`).send({ status: 'active' }),
  'assignments.owner': (g) => g.put('/v1/assignments/owner').send({ client_control_ids: [U], owner_id: null }),
  'groups.manage': (g) => g.patch(`/v1/groups/${U}`).send({ name: 'Nada' }),
  'team.workload': (g) => g.get('/v1/team/workload'),
  'controls.manage': (g) => g.delete(`/v1/controls/${U}`),
  'controls.edit': (g) => g.patch(`/v1/controls/${U}`).send({ interpretation: 'Nada' }),
  'controls.view': (g, t) => g.get(`/v1/services/${sid(t)}/controls`),
  'controls.delegate': (g) => g.put('/v1/assignments/executor').send({ client_control_ids: [U], executor_id: null }),
  'risks.create': (g, t) => g.post(`/v1/services/${sid(t)}/risks`).send({}),
  'risks.edit': (g) => g.patch(`/v1/risks/${U}`).send({ name: 'Nada' }),
  'risks.view': (g, t) => g.get(`/v1/services/${sid(t)}/risks`),
  'evidence.upload': (g) => g.post(`/v1/controls/${U}/tests/${U}/evidence`),
  'evidence.view': (g, t) => g.get(`/v1/services/${sid(t)}/evidence`),
  'exclusions.decide': (g, t) => g.post(`/v1/services/${sid(t)}/exclusions`).send({}),
  'documents.write': (g) => g.post(`/v1/documents/${U}/versions`),
  'documents.assign': (g) => g.post(`/v1/documents/${U}/assignments`).send({ user_ids: [U] }),
  'documents.accept': (g) => g.post(`/v1/documents/${U}/acceptance`).send({ version_id: U }),
  'documents.view_current': (g) => g.get(`/v1/documents/${U}/versions/${U}/file`),
  'documents.history': (g) => g.get('/v1/documents'),
  'tests.execute': (g) => g.get(`/v1/assets/${U}/executions`),
  'tests.results': (g) => g.get(`/v1/controls/${U}/tests/${U}/findings`),
  'audit.observe': (g, t) => g.post(`/v1/services/${sid(t)}/observations`).send({}),
  'observations.answer': (g) => g.post(`/v1/observations/${U}/answer`).send({}),
  'reports.dashboard': (g, t) => g.get(`/v1/services/${sid(t)}/compliance-overview`),
  'integrations.configure': (g) => g.get('/v1/integrations/catalog'),
  'integrations.view': (g) => g.get('/v1/integrations'),
  'users.reset_mfa': (g) => g.delete(`/v1/users/${U}/mfa`),
  'account.manage': (g) => g.patch('/v1/auth/me/language').send({ language: 'es' }),
  'monkey_admins.manage': (g) => g.get('/v1/admins'),
  'catalog.manage': (g) => g.get('/v1/catalog/controls'),
  'account.devices': (g) => g.get('/v1/auth/devices'),
  'services.manage': (g) => g.post('/v1/services').send({}),
  'services.view': (g) => g.get('/v1/services'),
  'users.list': (g) => g.get('/v1/users'),
  'groups.list': (g) => g.get('/v1/groups'),
  'controls.periodicity': (g) => g.put(`/v1/controls/${U}/periodicity`).send({ periodicity: null, justification: 'Nada' }),
  'assignments.view': (g) => g.get('/v1/assignments'),
  'risks.manage': (g) => g.delete(`/v1/risks/${U}`),
  'risks.history': (g) => g.get(`/v1/risks/${U}/evaluation-history`),
  'evidence.review': (g) => g.put(`/v1/evidence-submissions/${U}/review`).send({ review: 'human_validated' }),
  'evidence.requirements': (g) => g.post(`/v1/controls/${U}/evidence-requirements`).send({}),
  'exclusions.view': (g, t) => g.get(`/v1/services/${sid(t)}/exclusions`),
  'verdicts.register': (g) => g.post(`/v1/controls/${U}/tests/${U}/verdicts`).send({}),
  'verdicts.review': (g) => g.put(`/v1/verdicts/${U}/review`).send({}),
  'observations.view': (g, t) => g.get(`/v1/services/${sid(t)}/observations`),
  'periods.manage': (g, t) => g.put(`/v1/services/${sid(t)}/frameworks/soc2/evaluation-period`).send({}),
  'periods.view': (g, t) => g.get(`/v1/services/${sid(t)}/frameworks/soc2/evaluation-periods`),
  'responsibles.view': (g) => g.get('/v1/responsibles'),
  'responsibles.manage': (g) => g.delete(`/v1/responsibles/${U}`),
  'work.mine': (g) => g.get('/v1/me/work'),
  'documents.mine': (g) => g.get('/v1/me/documents'),
};

// Filas del libro sin ruta todavía: la matriz ya las declara y un guard las aplicará el día que alguien las construya.
const SIN_RUTA: Permission[] = [
  'controls.approve_first', 'controls.approve_final', 'evidence.retire', 'documents.assign_owner', 'documents.workflow', 'documents.approve', 'documents.archive', 'audit.log', 'reports.export',
  'reports.technical_view', 'security.policies',
];

beforeAll(async () => {
  app = await bootApp();
  const { a: tenant, monkey } = await dosEmpresas(app);
  a = tenant;
  roles = await unaPersonaPorRol(app, a, monkey);
  agents = { admin_monkey: roles.admin_monkey, admin_empresa: roles.admin_empresa, responsable: roles.responsable.agent, delegado: roles.delegado.agent, auditor: roles.auditor.agent, colaborador: roles.colaborador.agent };
});
afterAll(async () => {
  await app?.close();
});

describe('cada permiso tiene su ruta de prueba', () => {
  it('todos los permisos de la matriz están cubiertos o declarados sin ruta', () => {
    const cubiertos = new Set<string>([...Object.keys(RUTAS), ...SIN_RUTA]);
    expect(PERMISSION_KEYS.filter((k) => !cubiertos.has(k))).toEqual([]);
  });
});

describe('la matriz aplicada por HTTP: permiso × rol', () => {
  const casos = (Object.keys(RUTAS) as Permission[]).flatMap((permission) => USER_ROLES.map((role) => [permission, role] as const));

  it.each(casos)('%s · %s', async (permission, role) => {
    const res = await (RUTAS[permission] as Call)(agents[role], a);
    if (can(permission, role)) expect({ permission, role, status: res.status, pasa: res.status !== 403 }).toEqual({ permission, role, status: res.status, pasa: true });
    else expect({ permission, role, status: res.status }).toEqual({ permission, role, status: 403 });
  });
});

describe('D150 · lo que cambia frente a lo construido, con nombre', () => {
  const nuevo = (k: string, role: string) => ({ email: `${k}-${Date.now()}@matriz.test`, name: 'Nuevo', last_name: 'Persona', role });

  it('el responsable ya no crea usuarios ni grupos (403) y el administrador sí crea al colaborador', async () => {
    expect((await roles.responsable.agent.post('/v1/users').send({ ...nuevo('r1', 'delegado'), group_id: roles.equipo, is_internal: true })).status).toBe(403);
    expect((await roles.responsable.agent.post('/v1/groups').send({ name: 'Equipo nuevo' })).status).toBe(403);
    expect((await roles.admin_empresa.post('/v1/users').send(nuevo('c1', 'colaborador'))).status).toBe(201);
  });

  it('el delegado ya no ve el resumen de cumplimiento del servicio; el responsable sí (de lo suyo)', async () => {
    expect((await roles.delegado.agent.get(`/v1/services/${a.serviceId}/compliance-overview`)).status).toBe(403);
    expect((await roles.responsable.agent.get(`/v1/services/${a.serviceId}/compliance-overview`)).status).toBe(200);
  });

  it('el colaborador no ve nada de cumplimiento (SEG-85), pero sí su cuenta y «Mis documentos»', async () => {
    const c = roles.colaborador.agent;
    for (const path of ['/v1/services', `/v1/services/${a.serviceId}/controls`, '/v1/assignments', '/v1/users', '/v1/groups', '/v1/integrations', '/v1/me/work', '/v1/documents']) expect({ path, status: (await c.get(path)).status }).toEqual({ path, status: 403 });
    expect((await c.get('/v1/auth/me')).status).toBe(200);
    expect((await c.get('/v1/me/documents')).status).toBe(200);
    expect((await c.get('/v1/auth/devices')).status).toBe(200);
    expect((await c.get('/v1/catalogs/document_type')).status).toBe(200);
  });

  it('admin_monkey sobre los datos de una empresa sigue siendo 403 (pendiente, DT-124)', async () => {
    const m = roles.admin_monkey;
    for (const path of ['/v1/users', '/v1/assignments', `/v1/services/${a.serviceId}/controls`, '/v1/documents']) expect({ path, status: (await m.get(path)).status }).toEqual({ path, status: 403 });
  });

  it('restablecer el segundo factor: el administrador a cualquiera de la empresa; el responsable, solo a los delegados de SU equipo (D150); el delegado y el auditor, nunca', async () => {
    const otro = await personaDe(app, a, 'responsable', 'otro-resp');
    const delOtro = await delegadoDe(app, a, await sembrarEquipo(a.companyId, otro.id), 'del-otro');
    const colab = await personaDe(app, a, 'colaborador', 'colab-mfa');
    const miDelegado = await delegadoDe(app, a, roles.equipo, 'del-mfa');
    const conMfa = async (id: string) => (await owner<{ is_mfa_enabled: boolean }>('select is_mfa_enabled from platform.users where id = $1', [id]))[0].is_mfa_enabled;
    await owner('update platform.users set is_mfa_enabled = true where id = any($1::uuid[])', [[miDelegado.id, delOtro.id, colab.id, roles.auditor.id]]);
    // Ajeno al equipo, de otro rol o él mismo: 403 y no cambia nada.
    for (const id of [delOtro.id, colab.id, roles.auditor.id, otro.id, roles.responsable.id]) expect({ id, status: (await roles.responsable.agent.delete(`/v1/users/${id}/mfa`)).status }).toEqual({ id, status: 403 });
    for (const agent of [roles.delegado.agent, roles.auditor.agent, roles.colaborador.agent]) expect((await agent.delete(`/v1/users/${colab.id}/mfa`)).status).toBe(403);
    expect(await conMfa(delOtro.id)).toBe(true);
    // Un delegado de su equipo, sí; el administrador, al colaborador.
    expect((await roles.responsable.agent.delete(`/v1/users/${miDelegado.id}/mfa`)).status).toBe(204);
    expect(await conMfa(miDelegado.id)).toBe(false);
    expect((await roles.admin_empresa.delete(`/v1/users/${colab.id}/mfa`)).status).toBe(204);
    expect(await conMfa(colab.id)).toBe(false);
    // Otra empresa: 404.
    expect((await roles.responsable.agent.delete('/v1/users/00000000-0000-4000-8000-000000000001/mfa')).status).toBe(404);
  });

  it('la vista técnica sigue siendo del administrador y del auditor', async () => {
    const q = `/v1/services/${a.serviceId}/controls?view=technical`;
    expect((await roles.admin_empresa.get(q)).status).toBe(200);
    expect((await roles.auditor.agent.get(q)).status).toBe(200);
    expect((await roles.responsable.agent.get(q)).status).toBe(403);
    expect((await roles.delegado.agent.get(q)).status).toBe(403);
  });
});

describe('las marcas de la metadata siguen siendo las que esta prueba asume', () => {
  it('PERMISSION_KEY y ANY_AUTHENTICATED_KEY son los nombres que lee el guard', () => {
    expect([PERMISSION_KEY, ANY_AUTHENTICATED_KEY]).toEqual(['permission', 'anyAuthenticated']);
  });
});
