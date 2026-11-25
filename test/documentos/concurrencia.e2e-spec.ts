import type { INestApplication } from '@nestjs/common';
import { FileStorage } from '../../src/common/storage/file-storage';
import { bootApp, owner } from '../support/app';
import { documentosDe, pdf, publicar } from '../support/documentos';
import { dosEmpresas, Tenant } from '../support/escenario';
import { personaDe } from '../support/roles';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// SEG-88, D152 · Lo que pasa cuando dos peticiones llegan a la vez: la aceptación se turna con el bloqueo de la asignación y el índice único; las publicaciones se turnan con el bloqueo del documento.
let app: INestApplication;
let a: Tenant;
let docs: Array<{ id: string }>;
let n = 0;

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(new StorageEnMemoria()));
  ({ a } = await dosEmpresas(app));
  docs = await documentosDe(a.companyId, 'users_who_apply');
  expect(docs.length).toBeGreaterThan(5);
});
afterAll(async () => {
  await app?.close();
});

const nuevoDocumento = async () => {
  const id = docs[n++].id;
  const version = (await publicar(a.agent, id).expect(201)).body.data.id as string;
  return { id, version };
};

describe('doble aceptación a la vez', () => {
  it('la misma persona acepta dos veces en paralelo: una 201 y la otra 409 DOCUMENT_ALREADY_ACCEPTED; una sola fila (10 rondas)', async () => {
    for (let i = 0; i < 10; i++) {
      const { id, version } = await nuevoDocumento();
      const p = await personaDe(app, a, 'colaborador', `dbl-${i}`);
      await a.agent.post(`/v1/documents/${id}/assignments`).send({ user_ids: [p.id] }).expect(200);
      const [x, y] = await Promise.all([p.agent.post(`/v1/documents/${id}/acceptance`).send({ version_id: version }), p.agent.post(`/v1/documents/${id}/acceptance`).send({ version_id: version })]);
      expect([x.status, y.status].sort()).toEqual([201, 409]);
      expect([x, y].find((res) => res.status === 409)?.body.error.code).toBe('DOCUMENT_ALREADY_ACCEPTED');
      expect(await owner('select 1 from tenant.document_acceptances where document_version_id = $1 and user_id = $2', [version, p.id])).toHaveLength(1);
    }
  });

  it('dos personas distintas aceptan a la vez: las dos entran', async () => {
    const { id, version } = await nuevoDocumento();
    const [p, q] = [await personaDe(app, a, 'colaborador', 'par-1'), await personaDe(app, a, 'colaborador', 'par-2')];
    await a.agent.post(`/v1/documents/${id}/assignments`).send({ user_ids: [p.id, q.id] }).expect(200);
    const res = await Promise.all([p.agent, q.agent].map((g) => g.post(`/v1/documents/${id}/acceptance`).send({ version_id: version })));
    expect(res.map((x) => x.status)).toEqual([201, 201]);
  });
});

describe('aceptar mientras se publica una versión nueva', () => {
  it('o se acepta la 1 antes de archivarse, o se rechaza con 409 DOCUMENT_VERSION_NOT_CURRENT; nunca queda una aceptación de una versión que se archivó sin que la persona la haya visto vigente, ni un 500 (8 rondas)', async () => {
    for (let i = 0; i < 8; i++) {
      const { id, version } = await nuevoDocumento();
      const p = await personaDe(app, a, 'colaborador', `pub-${i}`);
      await a.agent.post(`/v1/documents/${id}/assignments`).send({ user_ids: [p.id] }).expect(200);
      const [acepta, publica] = await Promise.all([p.agent.post(`/v1/documents/${id}/acceptance`).send({ version_id: version }), publicar(a.agent, id, { file: pdf(`r${i}`) })]);
      expect(publica.status).toBe(201);
      expect([201, 409]).toContain(acepta.status);
      if (acepta.status === 409) expect(acepta.body.error.code).toBe('DOCUMENT_VERSION_NOT_CURRENT');
      const vigentes = await owner('select 1 from tenant.document_versions where company_document_id = $1 and status = $2', [id, 'current']);
      expect(vigentes).toHaveLength(1);
      expect(await owner('select 1 from tenant.document_acceptances where document_version_id = $1', [version])).toHaveLength(acepta.status === 201 ? 1 : 0);
    }
  });
});

describe('publicar a la vez', () => {
  it('dos publicaciones simultáneas se turnan: números 2 y 3, una sola vigente y la otra archivada', async () => {
    const { id } = await nuevoDocumento();
    const [x, y] = await Promise.all([publicar(a.agent, id, { file: pdf('x') }), publicar(a.agent, id, { file: pdf('y') })]);
    expect([x.status, y.status]).toEqual([201, 201]);
    expect([x.body.data.number, y.body.data.number].sort()).toEqual([2, 3]);
    const filas = await owner<{ number: number; status: string }>('select number, status::text from tenant.document_versions where company_document_id = $1 order by number', [id]);
    expect(filas).toEqual([{ number: 1, status: 'archived' }, { number: 2, status: 'archived' }, { number: 3, status: 'current' }]);
  });
});

describe('asignar a la vez', () => {
  it('dos asignaciones simultáneas de la misma persona: entre las dos cuentan una nueva, y una sola fila', async () => {
    const { id } = await nuevoDocumento();
    const p = await personaDe(app, a, 'colaborador', 'asig-par');
    const res = await Promise.all([1, 2].map(() => a.agent.post(`/v1/documents/${id}/assignments`).send({ user_ids: [p.id] })));
    expect(res.map((x) => x.status)).toEqual([200, 200]);
    expect(res.reduce((s, x) => s + x.body.data.added, 0)).toBe(1);
    expect(await owner('select 1 from tenant.document_assignments where company_document_id = $1 and user_id = $2', [id, p.id])).toHaveLength(1);
  });

  it('asignar a alguien mientras se desactiva su cuenta: o entra antes de la baja o se rechaza con 409; sin 500', async () => {
    for (let i = 0; i < 6; i++) {
      const { id } = await nuevoDocumento();
      const p = await personaDe(app, a, 'colaborador', `baja-${i}`);
      const [asigna, baja] = await Promise.all([a.agent.post(`/v1/documents/${id}/assignments`).send({ user_ids: [p.id] }), a.agent.patch(`/v1/users/${p.id}`).send({ status: 'inactive' })]);
      expect(baja.status).toBe(200);
      expect([200, 409]).toContain(asigna.status);
    }
  });
});
