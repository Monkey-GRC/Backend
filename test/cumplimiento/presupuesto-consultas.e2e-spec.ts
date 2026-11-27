import type { INestApplication } from '@nestjs/common';
import { SessionRepository } from '../../src/features/auth/domain/repositories/session.repository';
import { bootApp, owner } from '../support/app';
import { contarConsultas } from '../support/consultas';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-529 · Presupuesto de consultas por petición. Cada consulta es un viaje a la base (~85 ms en la base remota de dev) y una transacción
// de 5 s no admite decenas en serie: el número debe ser FIJO, igual con 10 que con 95 controles. Si una petición pasa del tope, algo volvió a
// consultar por control, por servicio o por requisito.
let app: INestApplication;
let a: Tenant;
let controlId: string;

beforeAll(async () => {
  app = await bootApp();
  ({ a } = await dosEmpresas(app));
  controlId = (await owner<{ id: string }>(`select id from tenant.client_controls where service_id = $1 and is_active order by own_code limit 1`, [a.serviceId]))[0].id;
});
afterAll(async () => {
  await app?.close();
});

// Tope de sentencias que llegan a Postgres (incluye BEGIN, set_config y COMMIT) y de transacciones por petición (la del caso de uso; el guard ya no abre una).
const PRESUPUESTO = { lista: 21, detalle: 21, servicios: 10, trabajo: 22, sesion: 1, transacciones: 2 };

type Medida = { total: number; transacciones: number };
const rutas: Array<[string, number, () => PromiseLike<unknown>]> = [
  ['GET /services/:id/controls', PRESUPUESTO.lista, () => a.agent.get(`/v1/services/${a.serviceId}/controls`).expect(200)],
  ['GET /controls/:id', PRESUPUESTO.detalle, () => a.agent.get(`/v1/controls/${controlId}`).expect(200)],
  ['GET /services', PRESUPUESTO.servicios, () => a.agent.get('/v1/services').expect(200)],
  ['GET /me/work?bucket=to_review', PRESUPUESTO.trabajo, () => a.agent.get('/v1/me/work?bucket=to_review').expect(200)],
];

async function medir(): Promise<Record<string, Medida>> {
  const out: Record<string, Medida> = {};
  for (const [nombre, , llamada] of rutas) {
    const { total, transacciones } = await contarConsultas(llamada);
    out[nombre] = { total, transacciones };
  }
  return out;
}

describe('presupuesto de consultas (MD-529)', () => {
  it('cada ruta respeta su tope y el número no crece con los controles (95 y 10)', async () => {
    const con95 = await medir();
    for (const [nombre, tope] of rutas.map(([n, t]) => [n, t] as const)) {
      expect(con95[nombre].total).toBeLessThanOrEqual(tope);
      expect(con95[nombre].transacciones).toBeLessThanOrEqual(PRESUPUESTO.transacciones);
    }

    // Se dan de baja todos los controles menos 10: la petición no puede costar más ni menos consultas.
    await owner(`update tenant.client_controls set is_active = false where service_id = $1 and is_active and id <> $2 and id not in (select id from tenant.client_controls where service_id = $1 and is_active order by own_code limit 10)`, [a.serviceId, controlId]);
    expect((await owner<{ n: string }>(`select count(*) n from tenant.client_controls where service_id = $1 and is_active`, [a.serviceId]))[0].n).toBe('10');
    const con10 = await medir();
    expect(Object.fromEntries(Object.entries(con10).map(([k, v]) => [k, v.total]))).toEqual(Object.fromEntries(Object.entries(con95).map(([k, v]) => [k, v.total])));
  });

  it('validar la sesión del guard cuesta una consulta y ninguna transacción', async () => {
    const s = (await owner<{ id: string; company_id: string; user_id: string }>(`select id, company_id, user_id from platform.sessions where company_id = $1 limit 1`, [a.companyId]))[0];
    const medida = await contarConsultas(() => app.get(SessionRepository).findWithOwner({ companyId: s.company_id, userId: s.user_id }, s.id));
    expect({ total: medida.total, transacciones: medida.transacciones }).toEqual({ total: PRESUPUESTO.sesion, transacciones: 0 });
  });

  it('una sesión de otra empresa no se encuentra aunque el id sea válido', async () => {
    const s = (await owner<{ id: string; user_id: string }>(`select id, user_id from platform.sessions where company_id = $1 limit 1`, [a.companyId]))[0];
    const otra = (await owner<{ id: string }>(`select id from platform.companies where id <> $1 limit 1`, [a.companyId]))[0].id;
    expect(await app.get(SessionRepository).findWithOwner({ companyId: otra, userId: s.user_id }, s.id)).toBeNull();
  });
});
