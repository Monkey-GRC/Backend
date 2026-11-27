import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootApp } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// GET /v1/catalogs/{nombre} con las listas de Cumplimiento (contracts/conventions.md): los formularios y filtros del frontend las piden aquí en vez de escribirlas.
type Agent = Awaited<ReturnType<typeof dosEmpresas>>['monkey'];
type Item = { value: string; label: string };

let app: INestApplication;
let a: Tenant;
let monkey: Agent;

beforeAll(async () => {
  app = await bootApp();
  ({ a, monkey } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});

const NAMES = ['risk_criterion', 'failure_category', 'risk_level', 'risk_treatment_decision', 'responsible_type', 'cause_control_effect', 'exclusion_status', 'audit_observation_type', 'audit_observation_status', 'assessor_role', 'assessment_verdict', 'dimension', 'control_type', 'catalog_origin', 'loss_type', 'risk_scale'];

const items = async (agent: Agent, name: string, lang?: string): Promise<Item[]> => {
  const req = agent.get(`/v1/catalogs/${name}`);
  return (await (lang ? req.set('Accept-Language', lang) : req).expect(200)).body.data.items;
};

describe('Catálogos de Cumplimiento', () => {
  it('los pide cualquier rol con sesión: el administrador de una empresa y el de Monkey', async () => {
    for (const name of NAMES) {
      expect((await items(a.agent, name)).length).toBeGreaterThan(0);
      expect((await items(monkey, name)).length).toBeGreaterThan(0);
    }
  });

  it('MD-529: control_level y los catálogos de gestión se sirven con sus etiquetas', async () => {
    expect((await items(a.agent, 'control_level')).map((i) => i.value)).toEqual(['not_evaluated', 'ineffective', 'weak', 'partial', 'adequate', 'solid']);
    expect(await items(a.agent, 'control_level', 'en')).toContainEqual({ value: 'solid', label: 'Solid' });
    for (const name of ['requirement_status', 'management_history_type', 'requirement_applicability', 'change_request_status', 'work_decision_kind', 'management_action']) expect((await items(a.agent, name)).length).toBeGreaterThan(0);
  });

  it('cada opción trae el valor y su etiqueta en el idioma de la petición', async () => {
    const es = await items(a.agent, 'risk_treatment_decision');
    expect(es).toEqual([
      { value: 'mitigate', label: 'Mitigar' },
      { value: 'accept', label: 'Aceptar' },
      { value: 'transfer', label: 'Transferir' },
      { value: 'avoid', label: 'Evitar' },
    ]);
    const en = await items(a.agent, 'risk_treatment_decision', 'en');
    expect(en.map((i) => i.label)).toEqual(['Mitigate', 'Accept', 'Transfer', 'Avoid']);
  });

  it('las listas salen en el orden del enum: el nivel va de bajo a crítico y la escala de 1 a 5', async () => {
    expect((await items(a.agent, 'risk_level')).map((i) => i.value)).toEqual(['low', 'moderate', 'high', 'critical']);
    expect((await items(a.agent, 'risk_scale')).map((i) => i.value)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('traen todos los criterios de riesgo, las categorías de falla y los cargos del comité', async () => {
    expect(await items(a.agent, 'risk_criterion')).toHaveLength(11);
    expect(await items(a.agent, 'failure_category')).toHaveLength(6);
    expect((await items(a.agent, 'responsible_type')).map((i) => i.value)).toEqual(['coo', 'it', 'compliance', 'process', 'ciso', 'asset_owner']);
    expect(await items(a.agent, 'loss_type')).toHaveLength(6);
  });

  it('un catálogo que no existe es 404 y sin sesión es 401', async () => {
    await a.agent.get('/v1/catalogs/no_existe').expect(404);
    await request(app.getHttpServer()).get('/v1/catalogs/risk_criterion').expect(401);
  });
});
