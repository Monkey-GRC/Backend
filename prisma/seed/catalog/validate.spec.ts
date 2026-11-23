import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildCatalog, Sheets } from './build';
import { buildChecksIndex, readCloudDatasets, readSondaDataset } from './checks-index';
import { EXAMPLE_SOURCE, exampleChecksIndex, exampleSheets } from './example-sheets';
import { Row, text } from './parse';
import { CatalogV2, CATALOG_V2_JSON, EXPECTED_COUNTS } from './types';
import { validateCatalog } from './validate';
import { DEFAULT_XLSX, openWorkbook, readRows, SHEETS } from './workbook';

const example = (): CatalogV2 => buildCatalog(exampleSheets(), EXAMPLE_SOURCE, exampleChecksIndex()).catalog;
const errorsOf = (c: CatalogV2) => validateCatalog(c).errors.join('\n');
// El libro de ejemplo es consistente salvo en los totales de la tabla 10: se filtran para probar solo las reglas.
const rulesOnly = (c: CatalogV2) => validateCatalog(c).errors.filter((e) => !/^(Total|Requisitos de tipo|Pruebas de tipo|Vínculos de rol|Vínculos sin check|Dominios)/.test(e));

describe('validateCatalog: totales de la tabla 10', () => {
  it('el libro de ejemplo no cumple los totales y lo dice, uno por uno', () => {
    const msg = errorsOf(example());
    expect(msg).toMatch(/Total «controls»: se esperaban 114 y hay 1/);
    expect(msg).toMatch(/Total «tests»: se esperaban 472 y hay 2/);
    expect(msg).toMatch(/Vínculos sin check \(N\/A\): se esperaban 19 y hay 1/);
    expect(msg).toMatch(/Requisitos de tipo documentary: se esperaban 232/);
  });

  it('las cifras esperadas son las del comité', () => {
    expect(EXPECTED_COUNTS).toMatchObject({
      controls: 114, pointOfFocusControls: 472, requirements: 61, pointsOfFocus: 302, controlRequirements: 576, tests: 472, testChecks: 4684, documents: 42, causes: 100, risks: 10,
      riskCauses: 551, causeControls: 771, controlDocuments: 228, standardProcedures: 8, integrationCategories: 14, integrationCategoryControls: 64, controlFrameworkMappings: 472,
    });
  });
});

describe('validateCatalog: reglas IN-01…IN-10', () => {
  it('el libro de ejemplo cumple todas', () => {
    expect(rulesOnly(example())).toEqual([]);
  });

  it('IN-01: un punto de enfoque sin control', () => {
    const c = example();
    c.pointsOfFocus.push({ requirementCode: 'A1.1', number: 3, description: 'x' });
    expect(rulesOnly(c).join('\n')).toMatch(/IN-01: A1\.1 POC 3 no tiene ningún control/);
  });

  it('IN-02 e IN-03: un control sin causa y un riesgo sin causa', () => {
    const c = example();
    c.causeControls = [];
    c.riskCauses = [];
    const msg = rulesOnly(c).join('\n');
    expect(msg).toMatch(/IN-02: el control CAP-1 no tiene causa/);
    expect(msg).toMatch(/IN-03: el riesgo R001 no tiene causa/);
  });

  it('IN-04: un requisito sin test', () => {
    const c = example();
    c.controlRequirementTests = c.controlRequirementTests.filter((t) => t.requirementCode !== 'CAP-1-L2');
    expect(rulesOnly(c).join('\n')).toMatch(/IN-04: el requisito CAP-1-L2 no tiene ningún test/);
  });

  it('IN-05: un documento que no existe y un documento sin su T-DOC', () => {
    const c = example();
    c.controlRequirementDocuments.push({ requirementCode: 'CAP-1-L1', documentCode: 'POL-999' });
    c.documents[0].testCode = 'T-DOC-NADA';
    const msg = rulesOnly(c).join('\n');
    expect(msg).toMatch(/IN-05: CAP-1-L1 cita el documento POL-999/);
    expect(msg).toMatch(/IN-05: el documento POL-001 no tiene su T-DOC/);
  });

  describe('IN-06 e IN-07', () => {
    const withDirect = (owner: string): CatalogV2 => {
      const c = example();
      c.controls.push({ ...c.controls[0], code: 'MNT-3' });
      c.causeControls.push({ causeCode: 'F001', controlCode: 'MNT-3' });
      c.tests.push({ ...c.tests[1], code: 'T-MNT-3-01', controlCode: 'MNT-3' });
      c.controlDimensions.push({ controlCode: 'MNT-3', dimension: 'policy' }, { controlCode: 'MNT-3', dimension: 'server' });
      c.controlRequirements.push({ ...c.controlRequirements[1], code: 'MNT-3-L1', controlCode: 'MNT-3' });
      c.controlRequirementTests.push({ requirementCode: 'MNT-3-L1', testCode: 'T-MNT-3-01' });
      c.controlTests.push({ controlCode: 'MNT-3', testCode: 'T-MNT-3-01' });
      c.testChecks.push({ ...c.testChecks[0], testCode: 'T-MNT-3-01', role: 'dependency', ownerControlCode: owner });
      return c;
    };

    it('una Dependencia cuyo dueño es Directo en ese control es válida', () => {
      expect(rulesOnly(withDirect('CAP-1'))).toEqual([]);
    });

    it('una Dependencia sin dueño, con un dueño que no es Directo, o con un dueño que no existe', () => {
      expect(rulesOnly(withDirect('MNT-3')).join('\n')).toMatch(/IN-06: T-MNT-3-01 depende de MNT-3 .* ahí no es Directo/);
      expect(rulesOnly(withDirect('XXX-9')).join('\n')).toMatch(/IN-06: el control dueño XXX-9/);
      const c = withDirect('CAP-1');
      c.testChecks[c.testChecks.length - 1].ownerControlCode = null;
      expect(rulesOnly(c).join('\n')).toMatch(/IN-06: la dependencia de T-MNT-3-01/);
    });

    it('IN-07: un mismo check Directo en dos controles es error, salvo el módulo «Detección de vulnerabilidades» de VUL-1 y VUL-2 (aviso)', () => {
      const c = withDirect('CAP-1');
      c.testChecks[c.testChecks.length - 1].role = 'direct';
      c.testChecks[c.testChecks.length - 1].ownerControlCode = null;
      expect(rulesOnly(c).join('\n')).toMatch(/IN-07: ubuntu\|cis_ubuntu22-04\|28500 es Directo en CAP-1 y MNT-3/);

      const mod = withDirect('CAP-1');
      mod.controls.forEach((k, i) => (k.code = ['VUL-1', 'VUL-2'][i]));
      mod.tests.forEach((t) => (t.controlCode = t.controlCode === 'CAP-1' ? 'VUL-1' : t.controlCode === 'MNT-3' ? 'VUL-2' : null));
      mod.testChecks.forEach((t) => Object.assign(t, { platform: null, policyId: null, checkId: null, moduleRef: 'Detección de vulnerabilidades', role: 'direct', ownerControlCode: null }));
      const out = validateCatalog(mod);
      expect(out.warnings.join('\n')).toMatch(/IN-07 \(aviso conocido\)/);
      expect(out.errors.join('\n')).not.toMatch(/IN-07/);
    });

    it('un vínculo con check y módulo a la vez, o con ninguno', () => {
      const c = example();
      c.testChecks[0].moduleRef = 'X';
      c.testChecks[2].moduleRef = null;
      expect(rulesOnly(c).join('\n')).toMatch(/debe traer un check o un módulo/);
    });
  });

  it('IN-09: un control sin rol sugerido', () => {
    const c = example();
    c.controls[0].suggestedOwnerRole = '';
    expect(rulesOnly(c).join('\n')).toMatch(/IN-09: el control CAP-1/);
  });

  it('IN-10: un documento sin rol responsable, o interno sin aprobador (el externo no lo necesita)', () => {
    const c = example();
    c.documents[0].suggestedOwnerRole = '';
    c.documents[0].suggestedApproverRole = null;
    expect(rulesOnly(c).join('\n')).toMatch(/IN-10: el documento POL-001 no tiene rol responsable/);
    expect(rulesOnly(c).join('\n')).toMatch(/IN-10: el documento interno POL-001 no tiene rol aprobador/);
    c.documents[0].suggestedOwnerRole = 'CISO';
    c.documents[0].origin = 'external';
    expect(rulesOnly(c)).toEqual([]);
  });

  it('el puente control_tests debe coincidir con tests.control_id y control_documents', () => {
    const c = example();
    c.controlTests = c.controlTests.slice(1);
    expect(rulesOnly(c).join('\n')).toMatch(/control_tests: falta el par CAP-1\|T-DOC-POL001/);
    c.controlTests.push({ controlCode: 'CAP-1', testCode: 'T-DOC-POL001' }, { controlCode: 'CAP-1', testCode: 'T-OTRA' });
    expect(rulesOnly(c).join('\n')).toMatch(/el par CAP-1\|T-OTRA/);
  });

  it('el mapeo a marcos debe coincidir con los vínculos control–punto de enfoque', () => {
    const c = example();
    c.controlFrameworkMappings.pop();
    expect(rulesOnly(c).join('\n')).toMatch(/MAPEO_MARCOS no coincide/);
  });

  it('P9: el tipo de pérdida «Interrupción de la operación» es un aviso; otro desconocido es error', () => {
    const c = example();
    c.risks[0].potentialImpact = ['Interrupción de la operación'];
    expect(validateCatalog(c).warnings.join('\n')).toMatch(/P9 · R001/);
    expect(rulesOnly(c)).toEqual([]);
    c.risks[0].potentialImpact = ['Terremoto'];
    expect(rulesOnly(c).join('\n')).toMatch(/«Terremoto»/);
  });

  it('el valor inherente es probabilidad × impacto', () => {
    const c = example();
    c.risks[0].inherentRiskValue = 11;
    expect(rulesOnly(c).join('\n')).toMatch(/R001: el valor inherente 11/);
  });
});

describe('validateCatalog: marca blanca (SEG-39)', () => {
  it('rechaza un nombre o una descripción que nombran al proveedor', () => {
    const c = example();
    c.tests[1].displayName = 'Revisión con Wazuh';
    c.tests[1].displayDescription = 'Resultados de Prowler';
    const msg = rulesOnly(c).join('\n');
    expect(msg).toMatch(/\[confidencialidad\] T-CAP-1-01: el nombre/);
    expect(msg).toMatch(/\[confidencialidad\] T-CAP-1-01: la descripción/);
  });

  it('un nombre no puede nacer revisado', () => {
    const c = example();
    c.tests[0].displayNameReviewed = true;
    expect(rulesOnly(c).join('\n')).toMatch(/no puede nacer revisado/);
  });
});

// El JSON versionado en git es el que carga `catalog:load`: debe cumplir TODO el validador y las cifras de la tabla 10.
describe('el catálogo v2 versionado (data/catalog-v2.json)', () => {
  const file = resolve(CATALOG_V2_JSON);
  (existsSync(file) ? it : it.skip)('cumple los totales de la tabla 10 y las reglas IN-01…IN-10, sin errores', () => {
    const c = JSON.parse(readFileSync(file, 'utf8')) as CatalogV2;
    const out = validateCatalog(c);
    expect(out.errors).toEqual([]);
    expect(c.meta.counts).toEqual(EXPECTED_COUNTS);
    expect(c.testChecks.filter((t) => t.checkId !== null)).toHaveLength(4665);
    expect(c.testChecks.filter((t) => t.checkId === null)).toHaveLength(19);
    expect(out.warnings.join('\n')).toMatch(/IN-07 \(aviso conocido\)/);
  });
});

// Con el libro real en disco (no está en el repo): reconstruir el JSON desde cero y compararlo con el versionado.
describe('el libro VF18 real', () => {
  const book = resolve(process.env.CATALOG_XLSX_PATH ?? DEFAULT_XLSX);
  const ready = existsSync(book) && existsSync(resolve(CATALOG_V2_JSON));
  (ready ? it : it.skip)('reconstruye exactamente el JSON versionado (determinista)', () => {
    const wb = openWorkbook(book);
    const rows = (sheet: string, cols: string[], headerRow = 1): Row[] => readRows(wb.wb, sheet, cols, headerRow);
    const sheets: Sheets = {
      matrix: rows(SHEETS.matrix, ['TSC Ref', 'POC #']).filter((r) => text(r['TSC Ref'])),
      controlRows: rows(SHEETS.controls, ['TSC Ref', 'ID'], 2).filter((r) => text(r['TSC Ref'])),
      requirements: rows(SHEETS.requirements, ['ID_Requisito']).filter((r) => text(r['ID_Requisito'])),
      tests: rows(SHEETS.tests, ['ID_Test']).filter((r) => text(r['ID_Test'])),
      testChecks: rows(SHEETS.testChecks, ['ID_Test']).filter((r) => text(r['ID_Test'])),
      procedures: rows(SHEETS.procedures, ['Código']).filter((r) => text(r['Código'])),
      integrations: rows(SHEETS.integrations, ['Categoría']).filter((r) => text(r['Categoría'])),
      documents: rows(SHEETS.documents, ['Código']).filter((r) => text(r['Código'])),
      mappings: rows(SHEETS.mappings, ['ID_Control']).filter((r) => text(r['ID_Control'])),
      risks: rows(SHEETS.risks, ['ID_Riesgo']).filter((r) => /^R\d+$/.test(text(r['ID_Riesgo']))),
      causes: rows(SHEETS.causes, ['ID_Causa']).filter((r) => /^F\d+$/.test(text(r['ID_Causa']))),
    };
    const built = buildCatalog(sheets, { sourceFile: wb.file, sourceSha256: wb.sha256, sondaVersion: '4.14.7', cloudEngineVersion: '5.45.0' }, buildChecksIndex(readSondaDataset(), readCloudDatasets()));
    expect(built.errors).toEqual([]);
    const stored = JSON.parse(readFileSync(resolve(CATALOG_V2_JSON), 'utf8')) as CatalogV2;
    built.catalog.meta.warnings = stored.meta.warnings;
    expect(JSON.parse(JSON.stringify(built.catalog))).toEqual(stored);
  });
});
