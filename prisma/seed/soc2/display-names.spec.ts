import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NEUTRAL_DESCRIPTION_OVERRIDES, NEUTRAL_NAME_OVERRIDES, PROVIDER_PATTERN, displayDescriptionOf, displayNameOf } from './display-names';
import { Soc2Catalog } from './types';
import { validateCatalog } from './validate';

// Línea base: el JSON REAL versionado (las 61 pruebas del comité).
const baseline = (): Soc2Catalog => JSON.parse(readFileSync(resolve(__dirname, '../data/soc2-catalog.json'), 'utf8'));

const has = (errors: string[], rule: string, text?: string) => errors.some((e) => e.startsWith(`[${rule}]`) && (!text || e.includes(text)));

describe('el nombre neutro de una prueba (D70)', () => {
  it('ya ninguna prueba del comité nombra al proveedor en su nombre (D92: el catálogo se neutralizó), pero las cuatro de D70 conservan su nombre neutro', () => {
    expect(baseline().tests.filter((t) => PROVIDER_PATTERN.test(t.name))).toEqual([]);
    expect(Object.keys(NEUTRAL_NAME_OVERRIDES).sort()).toEqual(['T-SRV-001', 'T-SRV-002', 'T-SRV-003', 'T-SRV-005']);
  });

  it('usa el nombre del comité tal cual en las otras 57', () => {
    const rest = baseline().tests.filter((t) => !(t.code in NEUTRAL_NAME_OVERRIDES));
    expect(rest).toHaveLength(57);
    for (const t of rest) expect(displayNameOf(t)).toBe(t.name);
  });

  it('da a las cuatro reescritas un nombre distinto del del comité y sin el proveedor', () => {
    for (const t of baseline().tests.filter((x) => x.code in NEUTRAL_NAME_OVERRIDES)) {
      const shown = displayNameOf(t);
      expect(shown).not.toBe(t.name);
      expect(PROVIDER_PATTERN.test(shown)).toBe(false);
    }
  });

  it('deja a las 61 pruebas con un nombre visible, único por prueba y sin el proveedor', () => {
    const tests = baseline().tests;
    const names = tests.map(displayNameOf);
    expect(names).toHaveLength(61);
    for (const n of names) {
      expect(n.trim()).toBe(n);
      expect(n.length).toBeGreaterThan(0);
      expect(PROVIDER_PATTERN.test(n)).toBe(false);
    }
  });

  it('el catálogo real sigue siendo válido con la regla de confidencialidad', () => {
    expect(validateCatalog(baseline())).toEqual([]);
  });

  it('el validador detecta una prueba nueva cuyo nombre nombra al proveedor y no tiene nombre neutro', () => {
    const c = baseline();
    const t = c.tests.find((x) => x.code === 'T-BD-001')!;
    t.name = 'Validación del motor de base de datos mediante Wazuh SCA';
    const e = validateCatalog(c);
    expect(has(e, 'confidencialidad', 'T-BD-001')).toBe(true);
  });

  it('el validador detecta un nombre neutro escrito para una prueba que no existe', () => {
    const c = baseline();
    c.tests = c.tests.filter((t) => t.code !== 'T-SRV-005');
    c.controlTests = c.controlTests.filter((r) => r.testCode !== 'T-SRV-005');
    expect(has(validateCatalog(c), 'confidencialidad', 'T-SRV-005')).toBe(true);
  });
});

describe('la descripción corta de una prueba (D82)', () => {
  it('ya ningún objetivo del comité nombra al proveedor (D92: el catálogo se neutralizó), pero las cuatro de D82 conservan su descripción neutra', () => {
    expect(baseline().tests.filter((t) => PROVIDER_PATTERN.test(t.objective))).toEqual([]);
    expect(Object.keys(NEUTRAL_DESCRIPTION_OVERRIDES).sort()).toEqual(['T-SRV-001', 'T-SRV-002', 'T-SRV-003', 'T-SRV-005']);
  });

  it('usa el objetivo del comité tal cual en las otras 57', () => {
    const rest = baseline().tests.filter((t) => !(t.code in NEUTRAL_DESCRIPTION_OVERRIDES));
    expect(rest.length).toBe(57);
    for (const t of rest) expect(displayDescriptionOf(t)).toBe(t.objective);
  });

  it('las 61 descripciones son no vacías y no nombran al proveedor', () => {
    const all = baseline().tests.map(displayDescriptionOf);
    expect(all.length).toBe(61);
    for (const d of all) {
      expect(d.trim().length).toBeGreaterThan(0);
      expect(PROVIDER_PATTERN.test(d)).toBe(false);
    }
  });

  it('el validador detecta una descripción que nombra al proveedor sin descripción neutra', () => {
    const c = baseline();
    c.tests.find((x) => x.code === 'T-BD-001')!.objective = 'Revisar la base de datos con Prowler.';
    expect(has(validateCatalog(c), 'confidencialidad', 'T-BD-001')).toBe(true);
  });
});