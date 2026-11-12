import type { INestApplication } from '@nestjs/common';
import { bootApp, owner } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-211 · El nombre neutro de una prueba sale en el idioma de la petición: `display_name_en` si existe, si no el español. Aquí, las pruebas de nube (T-CLD) en el detalle de un control.
let app: INestApplication;
let a: Tenant;
let controlId: string;

const detail = async (lang: string) =>
  (await a.agent.get(`/v1/controls/${controlId}?view=technical`).set('Accept-Language', lang).expect(200)).body.data.technical.tests as Array<{ test_code: string; display_name: string }>;

beforeAll(async () => {
  app = await bootApp();
  ({ a } = await dosEmpresas(app));
  const [row] = await owner<{ code: string }>(
    `select k.code from catalog.controls k join catalog.control_tests ct on ct.control_id = k.id join catalog.tests t on t.id = ct.test_id
      where t.code = 'T-CLD-001' and k.is_active order by k.code limit 1`,
  );
  const list = (await a.agent.get(`/v1/services/${a.serviceId}/controls?page_size=100`).expect(200)).body.data.items as Array<{ id: string; code: string }>;
  controlId = list.find((c) => c.code === row.code)!.id;
});
afterAll(async () => {
  await app?.close();
});

describe('Nombre de las pruebas según Accept-Language', () => {
  it('en inglés, una prueba T-CLD traducida llega con su nombre en inglés', async () => {
    const t = (await detail('en')).find((x) => x.test_code === 'T-CLD-001')!;
    expect(t.display_name).toBe('Assessment of IAM, MFA and privileged accounts at the cloud provider');
  });

  it('en español, con su nombre en español', async () => {
    const t = (await detail('es')).find((x) => x.test_code === 'T-CLD-001')!;
    expect(t.display_name).toBe('Evaluación de IAM, MFA y cuentas privilegiadas en el proveedor cloud');
  });

  it('en inglés, una prueba sin traducción conserva su nombre en español, y nunca sale vacío', async () => {
    const [row] = await owner<{ code: string }>(
      `select k.code from catalog.controls k join catalog.control_tests ct on ct.control_id = k.id join catalog.tests t on t.id = ct.test_id
        where t.display_name_en is null and k.is_active order by k.code limit 1`,
    );
    const list = (await a.agent.get(`/v1/services/${a.serviceId}/controls?page_size=100`).expect(200)).body.data.items as Array<{ id: string; code: string }>;
    const id = list.find((c) => c.code === row.code)!.id;
    const en = (await a.agent.get(`/v1/controls/${id}?view=technical`).set('Accept-Language', 'en').expect(200)).body.data.technical.tests as Array<{ test_code: string; display_name: string }>;
    const es = (await a.agent.get(`/v1/controls/${id}?view=technical`).set('Accept-Language', 'es').expect(200)).body.data.technical.tests as Array<{ test_code: string; display_name: string }>;
    const untranslated = (list: typeof en) => list.filter((t) => !t.test_code.startsWith('T-CLD-')).map((t) => t.display_name);
    expect(untranslated(en)).toEqual(untranslated(es));
    expect(untranslated(en).length).toBeGreaterThan(0);
    for (const t of en) expect(t.display_name.trim()).not.toBe('');
  });
});
