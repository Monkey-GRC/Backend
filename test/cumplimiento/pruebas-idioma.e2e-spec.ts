import type { INestApplication } from '@nestjs/common';
import { bootApp, owner } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-211 · El nombre neutro de una prueba sale en el idioma de la petición: `display_name_en` si existe, si no el español.
// El catálogo v2 no trae nombres en inglés (P50): la prueba pone uno a una sola prueba del control y lo quita al terminar.
let app: INestApplication;
let a: Tenant;
let controlId: string;
let translated: { code: string; display_name: string };
const NAME_EN = 'Neutral name in English (test)';

const detail = async (lang: string) =>
  (await a.agent.get(`/v1/controls/${controlId}?view=technical`).set('Accept-Language', lang).expect(200)).body.data.technical.tests as Array<{ test_code: string; display_name: string }>;

beforeAll(async () => {
  app = await bootApp();
  ({ a } = await dosEmpresas(app));
  // Un control del servicio con al menos dos pruebas: a una se le pone nombre en inglés y la otra queda sin traducir.
  const [row] = await owner<{ code: string; test: string; display_name: string }>(
    `select k.code, (array_agg(t.code order by t.code))[1] test, (array_agg(t.display_name order by t.code))[1] display_name
       from catalog.controls k join catalog.control_tests ct on ct.control_id = k.id join catalog.tests t on t.id = ct.test_id
      where k.is_active and t.display_name_en is null group by k.code having count(*) >= 2 order by k.code limit 1`,
  );
  translated = { code: row.test, display_name: row.display_name };
  await owner(`update catalog.tests set display_name_en = $2 where code = $1`, [row.test, NAME_EN]);
  const list = (await a.agent.get(`/v1/services/${a.serviceId}/controls?page_size=100`).expect(200)).body.data.items as Array<{ id: string; code: string }>;
  controlId = list.find((c) => c.code === row.code)!.id;
});
afterAll(async () => {
  await owner(`update catalog.tests set display_name_en = null where code = $1`, [translated.code]);
  await app?.close();
});

describe('Nombre de las pruebas según Accept-Language', () => {
  it('en inglés, una prueba traducida llega con su nombre en inglés', async () => {
    const t = (await detail('en')).find((x) => x.test_code === translated.code)!;
    expect(t.display_name).toBe(NAME_EN);
  });

  it('en español, con su nombre en español', async () => {
    const t = (await detail('es')).find((x) => x.test_code === translated.code)!;
    expect(t.display_name).toBe(translated.display_name);
  });

  it('en inglés, una prueba sin traducción conserva su nombre en español, y nunca sale vacío', async () => {
    const en = await detail('en');
    const es = await detail('es');
    const untranslated = (list: typeof en) => list.filter((t) => t.test_code !== translated.code).map((t) => t.display_name);
    expect(untranslated(en)).toEqual(untranslated(es));
    expect(untranslated(en).length).toBeGreaterThan(0);
    for (const t of en) expect(t.display_name.trim()).not.toBe('');
  });
});
