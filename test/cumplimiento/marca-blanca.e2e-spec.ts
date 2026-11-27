import type { INestApplication } from '@nestjs/common';
import { PROVIDER_PATTERN } from '../../src/common/text/provider-names';
import { Agent, bootApp, owner } from '../support/app';
import { asignarControl } from '../support/asignaciones';
import { definirPeriodo, dosEmpresas, Tenant } from '../support/escenario';
import { Roles, unaPersonaPorRol } from '../support/roles';

// SEG-39 · D70 · D128 (regla 1): ninguna respuesta de cumplimiento que ve el cliente nombra al proveedor de la sonda ni del motor de nube. El catálogo guarda el texto del comité intacto
// (p. ej. los requisitos «Posible Checks Wazuh» de ACT-3); la API lo pasa por la tabla 9 al salir. La prueba recorre todos los controles del servicio con el catálogo cargado y cada string.
let app: INestApplication;
let a: Tenant;
let roles: Roles;

const strings = (v: unknown, path = '$', out: Array<{ path: string; text: string }> = []): Array<{ path: string; text: string }> => {
  if (typeof v === 'string') out.push({ path, text: v });
  else if (Array.isArray(v)) v.forEach((x, i) => strings(x, `${path}[${i}]`, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) strings(x, `${path}.${k}`, out);
  return out;
};

const leaks = (route: string, body: unknown) => strings(body).filter((s) => PROVIDER_PATTERN.test(s.text)).map((s) => `${route} ${s.path}: ${s.text.slice(0, 80)}`);

async function recorrer(agent: Agent, routes: string[]): Promise<string[]> {
  const found: string[] = [];
  for (const r of routes) {
    const res = await agent.get(r);
    if (res.status === 200) found.push(...leaks(r, res.body));
  }
  return found;
}

beforeAll(async () => {
  app = await bootApp({});
  const { a: t, monkey } = await dosEmpresas(app);
  a = t;
  roles = await unaPersonaPorRol(app, a, monkey);
  await definirPeriodo(a.serviceId, '2026-01-01', '2027-12-31');
});
afterAll(async () => app.close());

describe('marca blanca de las respuestas de cumplimiento (SEG-39)', () => {
  it('el libro tiene requisitos «Posible Checks …» en el servicio (la prueba tiene qué filtrar)', async () => {
    const [r] = await owner<{ n: number }>(
      `select count(*)::int n from tenant.client_control_requirements r join catalog.control_requirements cr on cr.id = r.control_requirement_id join tenant.client_controls c on c.id = r.client_control_id where c.service_id = $1 and cr.text ~* '^posibles? checks?'`, [a.serviceId]);
    expect(r.n).toBeGreaterThan(0);
  });

  it('ningún control, historial, «Mi trabajo» ni resumen nombra al proveedor, para cada rol', async () => {
    const controls = await owner<{ id: string }>('select id from tenant.client_controls where service_id = $1 and is_active', [a.serviceId]);
    expect(controls.length).toBeGreaterThan(0);
    for (const c of controls.slice(0, 400)) await asignarControl(a.companyId, c.id, roles.responsable.id, roles.delegado.id).catch(() => undefined);

    const porControl = controls.flatMap((c) => [`/v1/controls/${c.id}`, `/v1/controls/${c.id}?view=technical`, `/v1/controls/${c.id}/tests`, `/v1/controls/${c.id}/evidence`, `/v1/controls/${c.id}/management-history`]);
    const generales = [`/v1/services/${a.serviceId}/controls?page_size=100`, `/v1/services/${a.serviceId}/controls?page_size=100&view=technical`, `/v1/services/${a.serviceId}/compliance-overview`, `/v1/services/${a.serviceId}/compliance-overview?view=technical`, `/v1/services/${a.serviceId}/evidence`, `/v1/services/${a.serviceId}/observations`, '/v1/me/work?page_size=100'];

    const found: string[] = [];
    found.push(...(await recorrer(roles.admin_empresa, [...generales, ...porControl])));
    found.push(...(await recorrer(roles.responsable.agent, [...generales, ...porControl.filter((_, i) => i % 5 < 2)])));
    found.push(...(await recorrer(roles.delegado.agent, ['/v1/me/work?page_size=100'])));
    found.push(...(await recorrer(roles.auditor.agent, [`/v1/services/${a.serviceId}/controls?page_size=100&view=technical`, ...porControl.slice(0, 50)])));
    expect([...new Set(found)].slice(0, 20)).toEqual([]);
  }, 600_000);
});
