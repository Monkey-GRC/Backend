import type { INestApplication } from '@nestjs/common';
import { FileStorage } from '../../src/common/storage/file-storage';
import { Agent, bootApp, owner } from '../support/app';
import { documentosDe, publicar } from '../support/documentos';
import { dosEmpresas, Tenant } from '../support/escenario';
import { delegadoDe, personaDe, Roles, unaPersonaPorRol } from '../support/roles';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// D133, D136, D150, D152 · «Quién puede qué» de contracts/documentos.md, acción por acción y rol por rol, con la sesión real de cada uno: lo asignado y lo no asignado.
type Rol = 'admin_empresa' | 'responsable' | 'delegado' | 'colaborador' | 'auditor' | 'admin_monkey';
const ROLES: Rol[] = ['admin_empresa', 'responsable', 'delegado', 'colaborador', 'auditor', 'admin_monkey'];

let app: INestApplication;
let a: Tenant;
let r: Roles;
let doc: string;
let version: string;
let agentes: Record<Rol, Agent>;
let ids: Record<Rol, string>;
let sinAsignar: Record<'admin_empresa' | 'responsable' | 'delegado' | 'colaborador', Agent>;

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(new StorageEnMemoria()));
  const { a: tenant, monkey } = await dosEmpresas(app);
  a = tenant;
  r = await unaPersonaPorRol(app, a, monkey);
  const adminId = (await owner<{ id: string }>('select id from platform.users where email = $1', [a.email]))[0].id;
  doc = (await documentosDe(a.companyId, 'users_who_apply'))[0].id;
  version = (await publicar(a.agent, doc).expect(201)).body.data.id;
  ids = { admin_empresa: adminId, responsable: r.responsable.id, delegado: r.delegado.id, colaborador: r.colaborador.id, auditor: r.auditor.id, admin_monkey: adminId };
  agentes = { admin_empresa: r.admin_empresa, responsable: r.responsable.agent, delegado: r.delegado.agent, colaborador: r.colaborador.agent, auditor: r.auditor.agent, admin_monkey: r.admin_monkey };
  await a.agent.post(`/v1/documents/${doc}/assignments`).send({ user_ids: [ids.admin_empresa, ids.responsable, ids.delegado, ids.colaborador] }).expect(200);
  sinAsignar = {
    admin_empresa: (await personaDe(app, a, 'admin_empresa', 'adm-sin')).agent,
    responsable: (await personaDe(app, a, 'responsable', 'resp-sin')).agent,
    delegado: (await delegadoDe(app, a, r.equipo, 'del-sin')).agent,
    colaborador: (await personaDe(app, a, 'colaborador', 'colab-sin')).agent,
  };
});
afterAll(async () => {
  await app?.close();
});

type Fila = { accion: string; llamar: (g: Agent) => PromiseLike<{ status: number }>; espera: Record<Rol, number> };
const FILAS: Fila[] = [
  { accion: 'listar los documentos', llamar: (g) => g.get('/v1/documents'), espera: { admin_empresa: 200, responsable: 403, delegado: 403, colaborador: 403, auditor: 200, admin_monkey: 403 } },
  { accion: 'ver el detalle', llamar: (g) => g.get(`/v1/documents/${doc}`), espera: { admin_empresa: 200, responsable: 403, delegado: 403, colaborador: 403, auditor: 200, admin_monkey: 403 } },
  { accion: 'asignar (repetir no cambia nada)', llamar: (g) => g.post(`/v1/documents/${doc}/assignments`).send({ user_ids: [ids.colaborador] }), espera: { admin_empresa: 200, responsable: 403, delegado: 403, colaborador: 403, auditor: 403, admin_monkey: 403 } },
  { accion: 'quitar una asignación que no existe', llamar: (g) => g.delete(`/v1/documents/${doc}/assignments/${ids.auditor}`), espera: { admin_empresa: 404, responsable: 403, delegado: 403, colaborador: 403, auditor: 403, admin_monkey: 403 } },
  { accion: '«Mis documentos»', llamar: (g) => g.get('/v1/me/documents'), espera: { admin_empresa: 200, responsable: 200, delegado: 200, colaborador: 200, auditor: 403, admin_monkey: 403 } },
  { accion: 'ver el archivo vigente, asignado', llamar: (g) => g.get(`/v1/documents/${doc}/versions/${version}/file`), espera: { admin_empresa: 200, responsable: 200, delegado: 200, colaborador: 200, auditor: 200, admin_monkey: 403 } },
  { accion: 'aceptar, asignado', llamar: (g) => g.post(`/v1/documents/${doc}/acceptance`).send({ version_id: version }), espera: { admin_empresa: 201, responsable: 201, delegado: 201, colaborador: 201, auditor: 403, admin_monkey: 403 } },
  { accion: 'aceptar otra vez (ya aceptó)', llamar: (g) => g.post(`/v1/documents/${doc}/acceptance`).send({ version_id: version }), espera: { admin_empresa: 409, responsable: 409, delegado: 409, colaborador: 409, auditor: 403, admin_monkey: 403 } },
  { accion: 'publicar una versión', llamar: (g) => publicar(g, doc), espera: { admin_empresa: 201, responsable: 403, delegado: 403, colaborador: 403, auditor: 403, admin_monkey: 403 } },
];

describe('documentos · acción × rol', () => {
  for (const fila of FILAS) {
    it.each(ROLES)(`${fila.accion} · %s`, async (rol) => {
      expect({ rol, status: (await fila.llamar(agentes[rol])).status }).toEqual({ rol, status: fila.espera[rol] });
    });
  }
});

describe('documentos · quien NO lo tiene asignado', () => {
  it.each(['admin_empresa', 'responsable', 'delegado', 'colaborador'] as const)('%s: el archivo y aceptar, 403 (la versión vigente ahora es la 2: se lee la 2)', async (rol) => {
    const vigente = (await a.agent.get(`/v1/documents/${doc}`).expect(200)).body.data.current_version.id;
    const archivo = (await sinAsignar[rol].get(`/v1/documents/${doc}/versions/${vigente}/file`)).status;
    // El administrador ve cualquier versión (lo suyo no es «estar asignado»); los demás necesitan la asignación.
    expect({ rol, archivo }).toEqual({ rol, archivo: rol === 'admin_empresa' ? 200 : 403 });
    expect({ rol, aceptar: (await sinAsignar[rol].post(`/v1/documents/${doc}/acceptance`).send({ version_id: vigente })).status }).toEqual({ rol, aceptar: 403 });
    expect((await sinAsignar[rol].get('/v1/me/documents')).body.data.total).toBe(0);
  });
});
