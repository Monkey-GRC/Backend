import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { INTEGRATION_ENUM_CATALOGS } from './integration-catalogs';
import { ENUM_CATALOGS } from './onboarding-catalogs';

const texts = (lang: string) => JSON.parse(readFileSync(join(process.cwd(), 'i18n', lang, 'catalogs.json'), 'utf8')) as Record<string, Record<string, string>>;

describe('catálogos de Integraciones (D110)', () => {
  it('se sirven por GET /v1/catalogs/{nombre} y sus valores son los del contrato', () => {
    for (const name of Object.keys(INTEGRATION_ENUM_CATALOGS)) expect(Object.keys(ENUM_CATALOGS)).toContain(name);
    expect([...INTEGRATION_ENUM_CATALOGS.integration_purpose]).toEqual(['measurement', 'workflow']);
    expect([...INTEGRATION_ENUM_CATALOGS.integration_status]).toEqual(['active', 'pending', 'needs_attention']);
  });

  it.each(['es', 'en'])('%s: cada valor tiene su etiqueta', (lang) => {
    for (const [name, list] of Object.entries(INTEGRATION_ENUM_CATALOGS)) {
      expect(Object.keys(texts(lang)[name] ?? {}).sort()).toEqual([...list].map(String).sort());
      for (const value of list) expect(texts(lang)[name][value].trim().length).toBeGreaterThan(0);
    }
  });
});
