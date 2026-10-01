import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Soc2Catalog } from './types';
import { validateCatalog } from './validate';

// Línea base: el JSON REAL versionado. Debe ser consistente; cada prueba negativa lo muta y comprueba
// que la regla correspondiente lo detecta. Así el test también protege el JSON commiteado.
const baseline = (): Soc2Catalog =>
  JSON.parse(readFileSync(resolve(__dirname, '../data/soc2-catalog.json'), 'utf8'));

const has = (errors: string[], rule: string, text?: string) =>
  errors.some((e) => e.startsWith(`[${rule}]`) && (!text || e.includes(text)));

describe('validateCatalog', () => {
  it('el catálogo real (61 / 302 / 119 / 729) no tiene errores', () => {
    expect(validateCatalog(baseline())).toEqual([]);
  });

  it('detecta una relación menos (conteo)', () => {
    const c = baseline();
    c.pointOfFocusControls.pop();
    expect(has(validateCatalog(c), 'conteos', 'pointOfFocusControls')).toBe(true);
  });

  it('detecta un punto de enfoque repetido (unicidad)', () => {
    const c = baseline();
    c.pointsOfFocus.push({ ...c.pointsOfFocus[0] });
    const e = validateCatalog(c);
    expect(has(e, 'unicidad', 'punto de enfoque repetido')).toBe(true);
    expect(has(e, 'conteos', 'pointsOfFocus')).toBe(true);
  });

  it('detecta una relación repetida', () => {
    const c = baseline();
    c.pointOfFocusControls.push({ ...c.pointOfFocusControls[0] });
    expect(has(validateCatalog(c), 'unicidad', 'relación repetida')).toBe(true);
  });

  it('detecta una relación a un control inexistente', () => {
    const c = baseline();
    c.pointOfFocusControls[0] = { ...c.pointOfFocusControls[0], controlCode: 'ZZZ-99' };
    expect(has(validateCatalog(c), 'referencias', 'control inexistente')).toBe(true);
  });

  it('detecta una relación a un punto de enfoque inexistente', () => {
    const c = baseline();
    c.pointOfFocusControls[0] = { ...c.pointOfFocusControls[0], pointNumber: 999 };
    expect(has(validateCatalog(c), 'referencias', 'punto de enfoque inexistente')).toBe(true);
  });

  it('detecta un punto de enfoque sin ningún control', () => {
    const c = baseline();
    const { requirementCode, pointNumber } = c.pointOfFocusControls[0];
    c.pointOfFocusControls = c.pointOfFocusControls.filter(
      (r) => !(r.requirementCode === requirementCode && r.pointNumber === pointNumber),
    );
    expect(has(validateCatalog(c), 'estructura', 'no tiene ningún control')).toBe(true);
  });

  it('detecta un control sin punto de enfoque distinto de CPL-1', () => {
    const c = baseline();
    c.controls.push({ code: 'XXX-1', name: 'n', description: 'd', domain: 'x', sourceRef: 'vanta:XXX-1' });
    expect(has(validateCatalog(c), 'estructura', 'controles sin punto de enfoque')).toBe(true);
  });

  it('detecta que CPL-1 quedó asignado a un punto de enfoque', () => {
    const c = baseline();
    c.pointOfFocusControls[0] = { ...c.pointOfFocusControls[0], controlCode: 'CPL-1' };
    expect(has(validateCatalog(c), 'estructura', 'controles sin punto de enfoque')).toBe(true);
  });

  it('detecta numeración de puntos de enfoque no contigua', () => {
    const c = baseline();
    const p = c.pointsOfFocus.find((x) => x.number === 2)!;
    p.number = 50;
    c.pointOfFocusControls.forEach((r) => {
      if (r.requirementCode === p.requirementCode && r.pointNumber === 2) r.pointNumber = 50;
    });
    expect(has(validateCatalog(c), 'estructura', 'no son contiguos')).toBe(true);
  });

  it('detecta un criterio de confianza que no corresponde al prefijo', () => {
    const c = baseline();
    c.requirements.find((r) => r.code.startsWith('CC'))!.trustCriterion = 'privacy';
    expect(has(validateCatalog(c), 'prefijo', 'dice security')).toBe(true);
  });

  it('detecta un control atado a un marco o requisito', () => {
    const c = baseline();
    (c.controls[0] as unknown as Record<string, unknown>).requirementCode = 'CC1.1';
    expect(has(validateCatalog(c), 'estructura', 'marco o requisito')).toBe(true);
  });

  it('detecta campos vacíos y con espacios sobrantes', () => {
    const c = baseline();
    c.controls[0].description = '';
    c.pointsOfFocus[0].description = ' con espacios ';
    const e = validateCatalog(c);
    expect(has(e, 'campos', 'descripción')).toBe(true);
    expect(e.filter((m) => m.startsWith('[campos]')).length).toBeGreaterThanOrEqual(2);
  });

  it('exige que solo security sea obligatorio', () => {
    const c = baseline();
    c.trustCriteria.find((t) => t.criterion === 'privacy')!.isMandatory = true;
    expect(has(validateCatalog(c), 'referencias', 'is_mandatory')).toBe(true);
  });

  it('informa TODOS los errores y no solo el primero', () => {
    const c = baseline();
    c.pointOfFocusControls.pop();
    c.controls[0].name = '';
    c.requirements[0].trustCriterion = 'privacy';
    const rules = new Set(validateCatalog(c).map((m) => m.slice(1, m.indexOf(']'))));
    expect(rules.size).toBeGreaterThanOrEqual(3);
  });
});

describe('validateCatalog — riesgos, causas, pruebas y plantillas de evidencia', () => {
  it('detecta un riesgo sin ninguna causa', () => {
    const c = baseline();
    const code = c.riskCauses[0].riskCode;
    c.riskCauses = c.riskCauses.filter((r) => r.riskCode !== code);
    expect(has(validateCatalog(c), 'estructura', `el riesgo ${code} no tiene ninguna causa`)).toBe(true);
  });

  it('detecta una causa nueva sin riesgo (solo las 10 del comité están permitidas)', () => {
    const c = baseline();
    c.causes.push({ code: 'F999', name: 'n', failureCategory: 'governance', description: 'd' });
    c.causeControls.push({ causeCode: 'F999', controlCode: c.controls[0].code });
    expect(has(validateCatalog(c), 'estructura', 'causas sin riesgo')).toBe(true);
  });

  it('detecta una de las 10 causas huérfanas que dejó de serlo', () => {
    const c = baseline();
    c.riskCauses.push({ code: 'RC999', riskCode: c.risks[0].code, causeCode: 'F003' });
    expect(has(validateCatalog(c), 'estructura', 'causas sin riesgo')).toBe(true);
  });

  it('detecta una causa sin control que la mitigue', () => {
    const c = baseline();
    c.causeControls = c.causeControls.filter((r) => r.causeCode !== 'F001');
    expect(has(validateCatalog(c), 'estructura', 'la causa F001 no tiene ningún control')).toBe(true);
  });

  it('detecta una relación causa↔control a un control inexistente', () => {
    const c = baseline();
    c.causeControls[0] = { ...c.causeControls[0], controlCode: 'ZZZ-9' };
    expect(has(validateCatalog(c), 'referencias', 'control inexistente')).toBe(true);
  });

  it('detecta una prueba sin ningún control', () => {
    const c = baseline();
    const code = c.tests[0].code;
    c.controlTests = c.controlTests.filter((r) => r.testCode !== code);
    expect(has(validateCatalog(c), 'estructura', `la prueba ${code} no tiene ningún control`)).toBe(true);
  });

  it('detecta una asignación a una prueba inexistente (como T-APP-001 de la matriz)', () => {
    const c = baseline();
    c.controlTests.push({ controlCode: c.controls[0].code, testCode: 'T-APP-001' });
    expect(has(validateCatalog(c), 'referencias', 'prueba inexistente T-APP-001')).toBe(true);
  });

  it('detecta una prueba cuyo código no corresponde a su dimensión', () => {
    const c = baseline();
    c.tests.find((t) => t.code.startsWith('T-SRV'))!.dimension = 'cloud';
    expect(has(validateCatalog(c), 'estructura', 'no corresponde a su dimensión')).toBe(true);
  });

  it('detecta un control sin ninguna prueba distinto de CPL-1', () => {
    const c = baseline();
    const k = c.controlTests[0].controlCode;
    c.controlTests = c.controlTests.filter((r) => r.controlCode !== k);
    expect(has(validateCatalog(c), 'estructura', 'controles sin ninguna prueba')).toBe(true);
  });

  it('detecta un campo de prueba vacío y un paso a paso vacío', () => {
    const c = baseline();
    c.tests[0].objective = '';
    c.tests[1].stepByStep = [];
    const e = validateCatalog(c);
    expect(has(e, 'campos', 'objective')).toBe(true);
    expect(has(e, 'campos', 'paso a paso vacío')).toBe(true);
  });

  it('detecta una secuencia de plantillas de evidencia no contigua', () => {
    const c = baseline();
    c.controlEvidenceTemplates[0].sequence = 7;
    expect(has(validateCatalog(c), 'estructura', 'no están numeradas 1..N')).toBe(true);
  });

  it('detecta una plantilla de evidencia sin ningún control', () => {
    const c = baseline();
    c.evidenceTemplates.push({ code: 'DOC-ffffffff', description: 'huérfana', dimension: 'policy' });
    expect(has(validateCatalog(c), 'estructura', 'no está ligada a ningún control')).toBe(true);
  });

  it('detecta una plantilla de evidencia repetida por descripción', () => {
    const c = baseline();
    c.evidenceTemplates.push({ ...c.evidenceTemplates[0], code: 'DOC-00000000' });
    expect(has(validateCatalog(c), 'unicidad', 'descripción repetida')).toBe(true);
  });

  it('detecta un riesgo repetido', () => {
    const c = baseline();
    c.risks.push({ ...c.risks[0] });
    expect(has(validateCatalog(c), 'unicidad', 'riesgo repetido')).toBe(true);
  });
});
