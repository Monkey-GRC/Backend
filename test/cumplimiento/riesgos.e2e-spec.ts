import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-122 · Riesgos y causas de un servicio (contracts/modules/compliance-risks.md).
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let funcional: Agent;
let funcionalId: string;
let adminId: string;
const risks = (t: Tenant, q = '') => `/v1/services/${t.serviceId}/risks${q}`;
const causes = (t: Tenant, q = '') => `/v1/services/${t.serviceId}/causes${q}`;
const RISK = { name: 'Pérdida de un portátil con datos de clientes', description: 'Un equipo se extravía o es robado fuera de la oficina.', trust_criterion: 'confidentiality', potential_impact: ['reputational', 'financial_loss'] };
const CAUSE = { name: 'Equipos sin cifrado de disco', description: 'Los portátiles no tienen el disco cifrado.', failure_category: 'information_technology' };

async function cuenta(companyId: string, email: string, role: 'auditor' | 'funcional'): Promise<string> {
  return (await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  ))[0].id;
}
const fields = (res: { body: any }) => (res.body.error.fields as Array<{ field: string; code: string; message: string }>).map(({ field, code }) => ({ field, code }));
const all = async (agent: Agent, path: string) => (await agent.get(`${path}${path.includes('?') ? '&' : '?'}page_size=100`).expect(200)).body.data.items as Array<Record<string, any>>;

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  await cuenta(a.companyId, `auditor-rsk-${RUN}@cumplimiento.test`, 'auditor');
  funcionalId = await cuenta(a.companyId, `funcional-rsk-${RUN}@cumplimiento.test`, 'funcional');
  auditor = await login(app, `auditor-rsk-${RUN}@cumplimiento.test`);
  funcional = await login(app, `funcional-rsk-${RUN}@cumplimiento.test`);
  adminId = (await owner<{ id: string }>(`select id from platform.users where email = $1`, [a.email]))[0].id;
});
afterAll(async () => {
  await app?.close();
});

describe('Lo que trae un servicio recién clonado', () => {
  it('lista los riesgos del catálogo sin evaluar, con la forma del contrato', async () => {
    const res = await a.agent.get(risks(a)).expect(200);
    expect(res.body.data.total).toBe(10);
    expect(res.body.data.items[0]).toEqual({
      id: expect.any(String), code: 'R001', name: expect.any(String), trust_criterion: expect.any(String), origin: 'catalog', is_active: true,
      likelihood: null, impact: null, inherent_risk_value: null, inherent_risk_level: null, treatment: null, causes_count: expect.any(Number),
    });
  });

  it('filtra por categoría, nivel, evaluado y origen; pagina', async () => {
    const conf = await all(a.agent, risks(a, '?trust_criterion=confidentiality'));
    expect(conf.length).toBeGreaterThan(0);
    expect(conf.every((r) => r.trust_criterion === 'confidentiality')).toBe(true);
    expect((await all(a.agent, risks(a, '?evaluated=false'))).length).toBe(10);
    expect(await all(a.agent, risks(a, '?evaluated=true'))).toEqual([]);
    expect(await all(a.agent, risks(a, '?origin=own'))).toEqual([]);
    expect(await all(a.agent, risks(a, '?inherent_risk_level=high'))).toEqual([]);
    expect((await a.agent.get(risks(a, '?page_size=4&page=3')).expect(200)).body.data).toMatchObject({ page: 3, page_size: 4, total: 10, total_pages: 3 });
    await a.agent.get(risks(a, '?inherent_risk_level=enorme')).expect(422);
  });

  it('el detalle lee el árbol riesgo → causas → acciones, con el tipo de pérdida en valores y sin códigos de control', async () => {
    const list = await all(a.agent, risks(a));
    const rich = list.find((r) => r.causes_count > 0)!;
    const d = (await a.agent.get(`/v1/risks/${rich.id}`).expect(200)).body.data;
    expect(d.service_id).toBe(a.serviceId);
    expect(d.potential_impact.length).toBeGreaterThan(0);
    expect(d.potential_impact.every((v: string) => ['reputational', 'financial_loss', 'regulatory_sanction', 'litigation', 'customer_trust_loss', 'operation_interruption'].includes(v))).toBe(true);
    expect(d.causes.length).toBe(rich.causes_count);
    const withControls = d.causes.find((c: any) => c.controls.length > 0);
    expect(withControls.controls[0]).toEqual({ control_id: expect.any(String), own_code: null, name: expect.any(String), is_mandatory: true, effect: null });
    expect(JSON.stringify(d.causes.map((c: any) => c.controls))).not.toMatch(/\b[A-Z]{2,4}-\d{1,3}\b/);
    expect(d).not.toHaveProperty('technical');
  });

  it('las causas se listan, se filtran por categoría y por riesgo, y traen sus riesgos y acciones', async () => {
    const list = await all(a.agent, causes(a));
    expect(list.length).toBe(56);
    const withRisk = list.find((c) => c.risks.length > 0)!;
    expect(withRisk).toMatchObject({ code: expect.stringMatching(/^F\d{3}$/), origin: 'catalog', is_active: true, failure_category: expect.any(String) });
    expect((await all(a.agent, causes(a, `?risk_id=${withRisk.risks[0].id}`))).map((c) => c.id)).toContain(withRisk.id);
    expect((await all(a.agent, causes(a, '?failure_category=governance'))).every((c) => c.failure_category === 'governance')).toBe(true);
  });
});

describe('Crear y vincular (el árbol se lee completo)', () => {
  let riskId: string;
  let causeId: string;
  let controlId: string;

  it('el administrador crea un riesgo propio: el código es el siguiente libre y el impacto se guarda como el catálogo', async () => {
    const res = await a.agent.post(risks(a)).send(RISK).expect(201);
    riskId = res.body.data.id;
    expect(res.body.data).toMatchObject({ code: 'R011', origin: 'own', is_active: true, potential_impact: ['reputational', 'financial_loss'], likelihood: null, inherent_risk_level: null, causes: [] });
    const [row] = await owner(`select potential_impact, risk_id from tenant.client_risks where id = $1`, [riskId]);
    expect(row).toEqual({ potential_impact: ['Reputacional', 'Pérdida financiera'], risk_id: null });
  });

  it('crea una causa propia (F057), la vincula al riesgo y a una acción, y el árbol queda completo', async () => {
    const cause = (await a.agent.post(causes(a)).send(CAUSE).expect(201)).body.data;
    causeId = cause.id;
    expect(cause).toMatchObject({ code: 'F057', origin: 'own', risks: [], controls: [] });
    controlId = (await all(a.agent, `/v1/services/${a.serviceId}/controls`))[0].id;

    await a.agent.post(`/v1/risks/${riskId}/causes`).send({ cause_id: causeId }).expect(201).expect((r) => expect(r.body.data).toEqual({ risk_id: riskId, cause_id: causeId }));
    const linked = await a.agent.post(`/v1/causes/${causeId}/controls`).send({ control_id: controlId, effect: 'probability' }).expect(201);
    expect(linked.body.data).toEqual({ cause_id: causeId, control_id: controlId, is_mandatory: true, effect: 'probability' });

    const tree = (await a.agent.get(`/v1/risks/${riskId}`).expect(200)).body.data;
    expect(tree.causes).toHaveLength(1);
    expect(tree.causes[0]).toMatchObject({ id: causeId, code: 'F057', failure_category: 'information_technology' });
    expect(tree.causes[0].controls).toEqual([{ control_id: controlId, own_code: null, name: expect.any(String), is_mandatory: true, effect: 'probability' }]);
    expect((await a.agent.get(`/v1/causes/${causeId}`).expect(200)).body.data.risks).toEqual([{ id: riskId, code: 'R011', name: RISK.name }]);
    expect((await all(a.agent, risks(a, '?origin=own')))[0].causes_count).toBe(1);
  });

  it('repetir un vínculo es un conflicto; quitarlo borra solo la relación', async () => {
    const dup = await a.agent.post(`/v1/risks/${riskId}/causes`).send({ cause_id: causeId }).expect(409);
    expect(dup.body.error.code).toBe('LINK_ALREADY_EXISTS');
    await a.agent.post(`/v1/causes/${causeId}/controls`).send({ control_id: controlId }).expect(409);
    await a.agent.delete(`/v1/causes/${causeId}/controls/${controlId}`).expect(204);
    await a.agent.delete(`/v1/causes/${causeId}/controls/${controlId}`).expect(404);
    await a.agent.delete(`/v1/risks/${riskId}/causes/${causeId}`).expect(204);
    expect((await a.agent.get(`/v1/risks/${riskId}`).expect(200)).body.data.causes).toEqual([]);
    expect((await a.agent.get(`/v1/causes/${causeId}`).expect(200)).body.data).toMatchObject({ is_active: true }); // la causa sigue existiendo
  });

  it('un código que la empresa elige y ya existe es un conflicto', async () => {
    const res = await a.agent.post(risks(a)).send({ ...RISK, code: 'R011' }).expect(409);
    expect(res.body.error.code).toBe('CODE_ALREADY_EXISTS');
    expect((await a.agent.post(risks(a)).send({ ...RISK, code: 'R050' }).expect(201)).body.data.code).toBe('R050');
    expect((await a.agent.post(risks(a)).send(RISK).expect(201)).body.data.code).toBe('R051'); // y la serie sigue desde el más alto
  });

  it('valida por campo, con textos traducidos', async () => {
    const res = await a.agent.post(risks(a)).send({ name: '', description: 'x', trust_criterion: 'frio', potential_impact: ['reputational', 'marciano'] }).expect(422);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    for (const f of res.body.error.fields) expect(f.message).not.toMatch(/^validation\./);
    expect(fields(res)).toEqual(expect.arrayContaining([{ field: 'name', code: 'required' }, { field: 'trust_criterion', code: 'enum.invalid' }, { field: 'potential_impact', code: 'enum.invalid' }]));
    const cause = await a.agent.post(causes(a)).send({ ...CAUSE, failure_category: 'mala_suerte' }).expect(422);
    expect(fields(cause)).toEqual(expect.arrayContaining([{ field: 'failure_category', code: 'enum.invalid' }]));
  });
});

describe('Editar es sobre la copia de la empresa', () => {
  it('editar un riesgo del catálogo no cambia el catálogo ni a otra empresa', async () => {
    const mine = (await all(a.agent, risks(a)))[0];
    const [catalogBefore] = await owner<{ name: string }>(`select name from catalog.risks where code = $1`, [mine.code]);
    const edited = await a.agent.patch(`/v1/risks/${mine.id}`).send({ name: 'Acceso indebido a la información de clientes', potential_impact: ['litigation'] }).expect(200);
    expect(edited.body.data).toMatchObject({ id: mine.id, name: 'Acceso indebido a la información de clientes', potential_impact: ['litigation'], origin: 'catalog' });
    expect((await owner<{ name: string }>(`select name from catalog.risks where code = $1`, [mine.code]))[0].name).toBe(catalogBefore.name);
    expect((await all(b.agent, risks(b))).find((r) => r.code === mine.code)!.name).toBe(catalogBefore.name);
  });

  it('la evaluación no se escribe por aquí: probabilidad e impacto no se aceptan en un PATCH', async () => {
    const id = (await all(a.agent, risks(a)))[1].id;
    const res = await a.agent.patch(`/v1/risks/${id}`).send({ likelihood: 5, impact: 5, inherent_risk_level: 'critical' }).expect(422);
    expect(fields(res).map((f) => f.field).sort()).toEqual(['impact', 'inherent_risk_level', 'likelihood']);
  });

  it('una causa se edita igual: su nombre, su descripción y su categoría', async () => {
    const c = (await all(a.agent, causes(a)))[0];
    const edited = await a.agent.patch(`/v1/causes/${c.id}`).send({ failure_category: 'external', name: 'Cambio de nombre' }).expect(200);
    expect(edited.body.data).toMatchObject({ id: c.id, name: 'Cambio de nombre', failure_category: 'external' });
  });
});

describe('El motivo de la baja de un riesgo (D93)', () => {
  it('queda en el rastro de auditoría de la baja, y se puede dar de baja sin motivo', async () => {
    const con = (await a.agent.post(risks(a)).send({ ...RISK, name: 'No aplica a mi servicio' }).expect(201)).body.data.id;
    await a.agent.delete(`/v1/risks/${con}`).send({ reason: '  No usamos portátiles; todo es remoto.  ' }).expect(204);
    const rows = await owner<{ after_state: { retirement_reason?: string } }>(
      `select after_state from audit.audit_logs where tenant_id = $1 and action = 'client_risk.deactivate' and before_state->>'id' = $2`,
      [a.companyId, con],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].after_state.retirement_reason).toBe('No usamos portátiles; todo es remoto.');

    const sin = (await a.agent.post(risks(a)).send({ ...RISK, name: 'Sin motivo' }).expect(201)).body.data.id;
    await a.agent.delete(`/v1/risks/${sin}`).expect(204);
    await a.agent.delete(`/v1/risks/${(await a.agent.post(risks(a)).send({ ...RISK, name: 'Motivo largo' }).expect(201)).body.data.id}`).send({ reason: 'x'.repeat(501) }).expect(422);
  });
});

describe('Volver a incluir un riesgo retirado (D93)', () => {
  it('lo devuelve a la lista con su evaluación, es idempotente y solo lo hace el administrador', async () => {
    const id = (await a.agent.post(risks(a)).send({ ...RISK, name: 'Se retira y vuelve' }).expect(201)).body.data.id;
    await a.agent.post(`/v1/risks/${id}/evaluation`).send({ likelihood: 3, impact: 3 }).expect(201);
    await a.agent.delete(`/v1/risks/${id}`).send({ reason: 'Por ahora no aplica' }).expect(204);
    expect((await all(a.agent, risks(a))).some((r) => r.id === id)).toBe(false);
    const back = await a.agent.post(`/v1/risks/${id}/reactivation`).expect(200);
    expect(back.body.data).toMatchObject({ id, is_active: true, likelihood: 3, impact: 3 });
    expect((await all(a.agent, risks(a))).some((r) => r.id === id)).toBe(true);
    await a.agent.post(`/v1/risks/${id}/reactivation`).expect(200); // idempotente
    const rows = await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = 'client_risk.reactivate' and before_state->>'id' = $2`, [a.companyId, id]);
    expect(rows[0].n).toBe(1); // la segunda vez no deja rastro
    await auditor.post(`/v1/risks/${id}/reactivation`).expect(403);
  });
});

describe('Dar de baja conserva el historial', () => {
  it('un riesgo dado de baja no aparece en la lista, pero sigue existiendo y se puede leer', async () => {
    const id = (await a.agent.post(risks(a)).send({ ...RISK, name: 'Riesgo que se retira' }).expect(201)).body.data.id;
    await a.agent.delete(`/v1/risks/${id}`).expect(204);
    expect((await all(a.agent, risks(a))).some((r) => r.id === id)).toBe(false);
    expect((await all(a.agent, risks(a, '?include_inactive=true'))).find((r) => r.id === id)).toMatchObject({ is_active: false });
    expect((await a.agent.get(`/v1/risks/${id}`).expect(200)).body.data.is_active).toBe(false);
    expect((await owner<{ is_active: boolean }>(`select is_active from tenant.client_risks where id = $1`, [id]))[0].is_active).toBe(false); // la fila sigue ahí
    await a.agent.delete(`/v1/risks/${id}`).expect(204); // idempotente
    // y ya no se edita ni se vincula
    expect((await a.agent.patch(`/v1/risks/${id}`).send({ name: 'x' }).expect(409)).body.error.code).toBe('RISK_INACTIVE');
    const cause = (await all(a.agent, causes(a)))[0];
    expect((await a.agent.post(`/v1/risks/${id}/causes`).send({ cause_id: cause.id }).expect(409)).body.error.code).toBe('RISK_INACTIVE');
  });

  it('una causa dada de baja deja de contar en el riesgo y no se vincula', async () => {
    const cause = (await a.agent.post(causes(a)).send({ ...CAUSE, name: 'Causa que se retira' }).expect(201)).body.data;
    const risk = (await a.agent.post(risks(a)).send({ ...RISK, name: 'Riesgo con causa' }).expect(201)).body.data;
    await a.agent.post(`/v1/risks/${risk.id}/causes`).send({ cause_id: cause.id }).expect(201);
    expect((await a.agent.get(`/v1/risks/${risk.id}`).expect(200)).body.data.causes).toHaveLength(1);
    await a.agent.delete(`/v1/causes/${cause.id}`).expect(204);
    expect((await a.agent.get(`/v1/risks/${risk.id}`).expect(200)).body.data.causes).toHaveLength(0);
    expect((await a.agent.patch(`/v1/causes/${cause.id}`).send({ name: 'x' }).expect(409)).body.error.code).toBe('CAUSE_INACTIVE');
  });
});

describe('Quién puede qué y entre empresas', () => {
  it('el auditor lee pero no crea ni edita ni vincula; admin_monkey no entra', async () => {
    await auditor.get(risks(a)).expect(200);
    await auditor.post(risks(a)).send(RISK).expect(403);
    await auditor.post(causes(a)).send(CAUSE).expect(403);
    const id = (await all(a.agent, risks(a)))[0].id;
    await auditor.patch(`/v1/risks/${id}`).send({ name: 'x' }).expect(403);
    await auditor.delete(`/v1/risks/${id}`).expect(403);
    await funcional.post(risks(a)).send(RISK).expect(403);
    await monkey.get(risks(a)).expect(403);
    await monkey.post(risks(a)).send(RISK).expect(403);
  });

  it('la empresa A no puede vincular una acción ni una causa de la B: 404; ni leer sus riesgos', async () => {
    const aRisk = (await all(a.agent, risks(a)))[0].id;
    const aCause = (await all(a.agent, causes(a)))[0].id;
    const bControl = (await all(b.agent, `/v1/services/${b.serviceId}/controls`))[0].id;
    const bCause = (await all(b.agent, causes(b)))[0].id;
    const bRisk = (await all(b.agent, risks(b)))[0].id;
    await a.agent.post(`/v1/causes/${aCause}/controls`).send({ control_id: bControl }).expect(404);
    await a.agent.post(`/v1/risks/${aRisk}/causes`).send({ cause_id: bCause }).expect(404);
    await a.agent.get(`/v1/risks/${bRisk}`).expect(404);
    await a.agent.get(`/v1/causes/${bCause}`).expect(404);
    await a.agent.get(risks(b)).expect(404);
    await a.agent.post(risks(b)).send(RISK).expect(404);
    await a.agent.get('/v1/risks/no-es-un-uuid').expect(404);
  });

  it('un servicio de la misma empresa pero otro: los vínculos no cruzan servicios', async () => {
    // Un segundo servicio de A, con su propio catálogo clonado.
    const second = await a.agent.post('/v1/services').send({
      name: `Segundo servicio ${RUN}`, description: 'Soporte de primer y segundo nivel para clientes corporativos, 24/7.', scope_statement: 'Se presta a clientes del sector financiero.',
      type: 'service_desk', industries_served: ['financial'], active_client_count: 'from_11_to_50', countries: ['co'], data_types: ['pii'], trust_criteria: ['security'],
      subservice_organizations: [{ type: 'azure', provider: 'Microsoft Azure', service_provided: 'Hosting', responsibility: 'Infraestructura' }], framework_codes: ['soc2'],
      previous_certification: 'none', expected_availability: '24x7', system_description: { kind: 'link', url: 'https://docs.ejemplo.com/s.pdf' },
    }).expect(201);
    const otherRisk = (await a.agent.get(`/v1/services/${second.body.data.id}/risks`).expect(200)).body.data.items[0].id;
    const myCause = (await all(a.agent, causes(a)))[0].id;
    await a.agent.post(`/v1/risks/${otherRisk}/causes`).send({ cause_id: myCause }).expect(404);
  });
});

describe('Vista de cada rol', () => {
  it('el funcional ve solo los riesgos y causas que llegan a una acción que tiene asignada', async () => {
    expect(await all(funcional, risks(a))).toEqual([]);
    expect(await all(funcional, causes(a))).toEqual([]);
    // Una causa del catálogo con acciones: se le asigna una de ellas.
    const withControl = (await all(a.agent, causes(a))).find((c) => c.controls.length > 0)!;
    const control = withControl.controls[0].control_id as string;
    await owner(`insert into platform.user_control_assignments (id, company_id, user_id, client_control_id, dimension, assigned_by) select gen_random_uuid(), $1, $2, $3::uuid, d.dimension, $4 from (select distinct t.dimension from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = $3::uuid) d`, [a.companyId, funcionalId, control, adminId]);
    const mine = await all(funcional, causes(a));
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.every((c) => c.controls.some((k: any) => k.control_id === control))).toBe(true);
    const myRisks = await all(funcional, risks(a));
    expect(myRisks.length).toBeGreaterThan(0);
    expect(myRisks.length).toBeLessThan(10);
    // lo que no le toca es 403
    const others = (await all(a.agent, risks(a))).filter((r) => !myRisks.some((m) => m.id === r.id));
    expect(others.length).toBeGreaterThan(0);
    await funcional.get(`/v1/risks/${others[0].id}`).expect(403);
    await funcional.get(`/v1/risks/${myRisks[0].id}`).expect(200);
  });

  it('la vista técnica trae los códigos del catálogo para el auditor y para el administrador (D81); el funcional recibe 403', async () => {
    await funcional.get(risks(a, '?view=technical')).expect(403);
    await funcional.get(causes(a, '?view=technical')).expect(403);
    const adminTech = await all(a.agent, risks(a, '?view=technical'));
    expect(adminTech.find((r) => r.origin === 'catalog')!.technical).toEqual({ catalog_code: expect.any(String) });
    expect((await a.agent.get(causes(a, '?view=technical')).expect(200)).body.data.items[0].technical).toBeDefined();
    const tech = await all(auditor, risks(a, '?view=technical'));
    const catalog = tech.find((r) => r.origin === 'catalog')!;
    expect(catalog.technical).toEqual({ catalog_code: catalog.code });
    const own = tech.find((r) => r.origin === 'own')!;
    expect(own.technical).toEqual({ catalog_code: null });
    const detail = (await auditor.get(`/v1/risks/${catalog.id}?view=technical`).expect(200)).body.data;
    expect(detail.technical.catalog_code).toBe(catalog.code);
    expect(detail.causes[0].technical).toBeDefined();
  });
});

describe('Rastro', () => {
  it('cada escritura deja su auditoría', async () => {
    const rows = await owner<{ action: string }>(`select distinct action from audit.audit_logs where tenant_id = $1 and action like 'client_%' order by 1`, [a.companyId]);
    expect(rows.map((r) => r.action)).toEqual(
      expect.arrayContaining(['client_risk.create', 'client_risk.update', 'client_risk.deactivate', 'client_cause.create', 'client_cause.update', 'client_cause.deactivate', 'client_risk_cause.link', 'client_risk_cause.unlink', 'client_cause_control.link', 'client_cause_control.unlink']),
    );
  });
});
