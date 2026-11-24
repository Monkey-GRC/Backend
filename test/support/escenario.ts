import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Agent, login, owner, PASSWORD, RUN, seedAdminMonkey } from './app';
import { claveEnviadaA } from './correo-en-memoria';

export type Tenant = {
  agent: Agent;
  companyId: string;
  companyName: string;
  email: string;
  serviceId: string;
  serviceName: string;
  assetId: string;
  assetName: string;
};

/** MD-500 · Deja como período abierto del servicio (todos sus marcos) el que se pide, o ninguno si `end` es `null`. Escribe directo en la base, con el superusuario de las pruebas. */
export async function definirPeriodo(serviceId: string, start: string | null, end: string | null, cutoff: string | null = null): Promise<void> {
  await owner(`delete from tenant.service_framework_periods where service_framework_id in (select id from tenant.service_frameworks where service_id = $1)`, [serviceId]);
  if (start && end) {
    await owner(
      `insert into tenant.service_framework_periods (id, tenant_id, service_framework_id, period_start, period_end, cutoff_date)
       select gen_random_uuid(), tenant_id, id, $2::date, $3::date, $4::date from tenant.service_frameworks where service_id = $1`,
      [serviceId, start, end, cutoff],
    );
  }
}

export const servicePayload = (name: string) => ({
  name,
  description: 'Soporte de primer y segundo nivel para clientes corporativos, 24/7.',
  scope_statement: 'Se presta a clientes del sector financiero en Colombia y México.',
  type: 'service_desk',
  industries_served: ['financial', 'retail'],
  active_client_count: 'from_11_to_50',
  countries: ['co', 'mx'],
  data_types: ['pii', 'business', 'logs'],
  trust_criteria: ['security', 'confidentiality', 'availability'],
  subservice_organizations: [{ type: 'azure', provider: 'Microsoft Azure', service_provided: 'Hosting', responsibility: 'Infraestructura' }],
  framework_codes: ['soc2'],
  previous_certification: 'none',
  expected_availability: '24x7',
  system_description: { kind: 'link', url: 'https://docs.ejemplo.com/system-description.pdf' },
});

export const orgPayload = {
  description: 'Consultoría de auditoría y cumplimiento para empresas de servicios en LATAM.',
  size: 'from_51_to_200',
  industry: 'bpo_outsourcing',
  business_model: 'consulting',
  years_in_operation: 'from_5_to_10',
  incorporation_countries: ['co', 'pa'],
  client_countries: ['co', 'mx', 'us'],
  compliance_maturity: 'implementing',
  regulation_codes: ['ley_1581_co'],
};

function must(res: request.Response, status: number, what: string) {
  if (res.status !== status) throw new Error(`${what}: esperaba ${status} y llegó ${res.status} ${JSON.stringify(res.body).slice(0, 500)}`);
  return res.body.data;
}

/** Una empresa completa, creada SOLO por la API real: registro → canje de clave → contexto → servicio → activo. */
async function crearTenant(app: INestApplication, admin: Agent, k: string): Promise<Tenant> {
  const companyName = `Empresa ${k} ${RUN}`;
  const email = `admin-${k.toLowerCase()}-${RUN}@aislamiento.test`;
  const company = must(
    await admin.post('/v1/companies').send({ name: companyName, requires_dedicated_database: false, max_users: 1000, admin_email: email, framework_codes: ['soc2'] }),
    201,
    `registrar ${k}`,
  );
  const agent = request.agent(app.getHttpServer());
  must(await agent.post('/v1/auth/redeem').send({ code: claveEnviadaA(email), email, password: PASSWORD }), 201, `canjear clave ${k}`);
  must(await agent.put('/v1/onboarding/organizational-context').send(orgPayload), 200, `contexto organizacional ${k}`);
  const serviceName = `Servicio ${k} ${RUN}`;
  const service = must(await agent.post('/v1/services').send(servicePayload(serviceName)), 201, `servicio ${k}`);
  // Una cuenta de AWS: es la única plataforma con flujo (D67). Servidores y bases se muestran bloqueados hasta tener su canal de agente (DT-57).
  const assetName = `aws-${k.toLowerCase()}-${RUN}`;
  const asset = must(
    await agent.post('/v1/assets').send({
      name: assetName,
      connection_category: 'ac_01',
      platform: 'aws',
      connection_method: 'readonly_role',
      external_account_id: '123456789012',
      regions: ['us-east-1'],
      service_ids: [service.id],
    }),
    201,
    `activo ${k}`,
  );
  return { agent, companyId: company.id, companyName, email, serviceId: service.id, serviceName, assetId: asset.id, assetName };
}

/** El alta de una cuenta de AWS tal como la hace la pantalla (D67): la plataforma elegida, el canal de rol y las regiones. */
export const awsBody = (t: Tenant, name: string, over: Record<string, unknown> = {}) => ({
  name,
  connection_category: 'ac_01',
  platform: 'aws',
  connection_method: 'readonly_role',
  external_account_id: '123456789012',
  regions: ['us-east-1'],
  service_ids: [t.serviceId],
  ...over,
});

export async function dosEmpresas(app: INestApplication): Promise<{ a: Tenant; b: Tenant; monkey: Agent }> {
  const { email } = await seedAdminMonkey();
  const monkey = await login(app, email);
  const a = await crearTenant(app, monkey, 'A');
  const b = await crearTenant(app, monkey, 'B');
  return { a, b, monkey };
}

/**
 * Una empresa recién registrada, con su administrador ya dentro, sin servicio ni activos y con el cupo de usuarios que se pida (D103).
 * `null` = sin tope: es como quedaron las empresas anteriores al cupo (la API no deja registrar una así, por eso se deja en la base).
 */
export async function empresaConCupo(app: INestApplication, monkey: Agent, k: string, maxUsers: number | null): Promise<{ agent: Agent; companyId: string; email: string }> {
  const email = `admin-${k.toLowerCase()}-${RUN}@cupo.test`;
  const company = must(
    await monkey.post('/v1/companies').send({ name: `Empresa ${k} ${RUN}`, requires_dedicated_database: false, max_users: maxUsers ?? 1000, admin_email: email, framework_codes: ['soc2'] }),
    201,
    `registrar ${k}`,
  );
  const agent = request.agent(app.getHttpServer());
  must(await agent.post('/v1/auth/redeem').send({ code: claveEnviadaA(email), email, password: PASSWORD }), 201, `canjear clave ${k}`);
  if (maxUsers === null) await owner('update platform.companies set max_users = null where id = $1', [company.id]);
  return { agent, companyId: company.id as string, email };
}
