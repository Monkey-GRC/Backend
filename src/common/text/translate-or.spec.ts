import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { capabilityTexts, groupDisplayName, translateListOr, translateOr } from './translate-or';

const load = (lang: string, file: string): Record<string, any> => JSON.parse(readFileSync(join(process.cwd(), 'i18n', lang, `${file}.json`), 'utf8'));
const CAPS = ['ac_01', 'ac_02', 'ac_03', 'ac_04', 'ac_05', 'ac_06'];
const FRAMEWORKS = ['gdpr', 'hipaa', 'iso27001', 'nist_csf', 'pci_dss', 'soc1', 'soc2'];

describe('textos de catálogos con respaldo (sin idioma de petición: la base)', () => {
  it('translateOr y translateListOr devuelven el respaldo si no hay petición', () => {
    expect(translateOr('capability.ac_01.category', 'base')).toBe('base');
    expect(translateListOr('capability.ac_01.required_permissions', ['a'])).toEqual(['a']);
  });
  it('capabilityTexts conserva los campos de la base', () => {
    const base = { catalogCode: 'ac_01', category: 'c', method: 'm', requiredPermissions: ['p'], baseFrequency: 'f', generatedEvidence: 'e' };
    expect(capabilityTexts(base)).toEqual({ category: 'c', method: 'm', required_permissions: ['p'], base_frequency: 'f', generated_evidence: 'e' });
  });
  it('groupDisplayName solo toca el nombre reservado del grupo por omisión', () => {
    expect(groupDisplayName('Finanzas')).toBe('Finanzas');
    expect(groupDisplayName('Responsables')).toBe('Responsables');
  });
});

describe('claves i18n de los catálogos, en es y en', () => {
  it.each(['es', 'en'])('%s: cada conexión, marco y el grupo por omisión tienen su texto', (lang) => {
    const cap = load(lang, 'capability');
    for (const code of CAPS) {
      for (const k of ['category', 'method', 'base_frequency', 'generated_evidence']) expect(typeof cap[code][k]).toBe('string');
      expect(Array.isArray(cap[code].required_permissions) && cap[code].required_permissions.length > 0).toBe(true);
    }
    const fw = load(lang, 'framework').scope;
    for (const code of FRAMEWORKS) expect(fw[code]?.length).toBeGreaterThan(10);
    expect(load(lang, 'group').responsibles_default_name).toBeTruthy();
    expect(load(lang, 'catalogs').regulation).toEqual({ none: expect.any(String), other: expect.any(String) });
    expect(load(lang, 'evidence').validity.within_period).toBeTruthy();
  });

  it.each(['es', 'en'])('%s: existen las claves que salían crudas (company.archived, connection.permission_denied)', (lang) => {
    expect(load(lang, 'company').archived).toBeTruthy();
    expect(load(lang, 'connection').permission_denied).toBeTruthy();
  });

  it('el inglés no repite el español ni nombra al motor', () => {
    const es = load('es', 'capability');
    const en = load('en', 'capability');
    for (const code of CAPS) expect(en[code].category).not.toBe(es[code].category);
    expect(JSON.stringify([en, load('en', 'framework').scope])).not.toMatch(/wazuh|prowler/i);
  });
});
