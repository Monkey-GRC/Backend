import { buildCatalog, countsOf, Sheets } from './build';
import { EXAMPLE_SOURCE, exampleChecksIndex, exampleSheets } from './example-sheets';
import { Row } from './parse';

const build = (mutate: (s: Sheets) => void = () => undefined) => {
  const sheets = exampleSheets();
  mutate(sheets);
  return buildCatalog(sheets, EXAMPLE_SOURCE, exampleChecksIndex());
};

describe('buildCatalog (libro de ejemplo)', () => {
  const { catalog, errors, warnings } = build();

  it('el libro de ejemplo construye sin errores ni avisos', () => {
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
  });

  it('criterios, puntos de enfoque y vínculos con control, con el dominio POR FILA', () => {
    expect(catalog.requirements).toEqual([{ code: 'A1.1', tscCategory: 'Criterios adicionales para la disponibilidad', criterion: 'La entidad mantiene la capacidad.', trustCriterion: 'availability' }]);
    expect(catalog.pointsOfFocus.map((p) => p.number)).toEqual([1, 2]);
    expect(catalog.pointOfFocusControls.map((p) => [p.pointNumber, p.domain])).toEqual([[1, 'Planificación de Capacidad y Rendimiento'], [2, 'Monitoreo Continuo']]);
    expect(catalog.trustCriteria.find((t) => t.criterion === 'security')).toMatchObject({ isMandatory: true });
  });

  it('el control trae tipo, periodicidad y rol sugerido traducidos a enums; las dimensiones salen de las columnas «Definido»', () => {
    expect(catalog.controls).toEqual([expect.objectContaining({ code: 'CAP-1', type: 'it_dependent_manual', periodicity: 'monthly', suggestedOwnerRole: 'Líder de Infraestructura / Gerente de TI' })]);
    expect(catalog.controlDimensions.map((d) => d.dimension).sort()).toEqual(['cloud', 'policy', 'server']);
  });

  it('«Cuando sea Requerido» es on_demand y «Permanente» es permanent', () => {
    const r = build((s) => {
      s.controlRows.forEach((x) => (x['Periodicidad del Control'] = 'Cuando sea Requerido'));
    });
    expect(r.catalog.controls[0].periodicity).toBe('on_demand');
    expect(catalog.controlRequirements.map((x) => x.periodicity)).toEqual(['monthly', 'permanent']);
  });

  it('los requisitos del control: punto L numérico, tipo, obligatorio y la observación de armado; con sus pruebas y documentos', () => {
    expect(catalog.controlRequirements[1]).toMatchObject({ code: 'CAP-1-L2', controlCode: 'CAP-1', pointNumber: 2, type: 'technical', isMandatory: true, assemblyNote: 'Tipo Técnico: todos sus tests son Técnicos.' });
    expect(catalog.controlRequirementTests).toEqual([{ requirementCode: 'CAP-1-L1', testCode: 'T-DOC-POL001' }, { requirementCode: 'CAP-1-L2', testCode: 'T-CAP-1-01' }]);
    expect(catalog.controlRequirementDocuments).toEqual([{ requirementCode: 'CAP-1-L1', documentCode: 'POL-001' }]);
  });

  it('las pruebas: la T-DOC va sin control; fuente, nivel y automatización son enums; «N/A» de integración es nulo', () => {
    const doc = catalog.tests.find((t) => t.code === 'T-DOC-POL001')!;
    const tec = catalog.tests.find((t) => t.code === 'T-CAP-1-01')!;
    expect(doc).toMatchObject({ controlCode: null, type: 'documentary', dimension: 'policy', primarySource: 'document', level: 'design', automation: 'manual', integrationCategoryName: null });
    expect(tec).toMatchObject({ controlCode: 'CAP-1', type: 'operational', dimension: 'server', primarySource: 'probe_and_cloud_engine', level: 'implementation', automation: 'semi_automated', integrationCategoryName: 'Nube' });
  });

  it('el nombre del cliente: T-DOC = nombre del documento; «Posible Checks» = objetivo; marca blanca aplicada; sin revisar y sin inglés', () => {
    const doc = catalog.tests.find((t) => t.code === 'T-DOC-POL001')!;
    const tec = catalog.tests.find((t) => t.code === 'T-CAP-1-01')!;
    expect(doc.displayName).toBe('Política de seguridad de la información');
    expect(tec.displayName).toBe('Que los servidores en alcance están en el inventario y los revisa la sonda.');
    expect(tec.displayDescription).toBe('Que los servidores en alcance están en el inventario y los revisa la sonda.');
    expect([doc, tec].every((t) => t.displayNameReviewed === false && t.displayNameEn === null)).toBe(true);
  });

  it('el puente control_tests es la columna «Test» y los documentos llevan su prueba', () => {
    expect(catalog.controlTests).toEqual([{ controlCode: 'CAP-1', testCode: 'T-DOC-POL001' }, { controlCode: 'CAP-1', testCode: 'T-CAP-1-01' }]);
    expect(catalog.controlDocuments).toEqual([{ controlCode: 'CAP-1', documentCode: 'POL-001' }]);
    expect(catalog.documents[0]).toMatchObject({ type: 'policy', origin: 'internal', suggestedAcceptance: 'all_users', reviewPeriodicity: 'annual', testCode: 'T-DOC-POL001' });
  });

  it('el riesgo toma el número de «3 - Posible» y el nivel del libro; la causa, origen y tipo', () => {
    expect(catalog.risks[0]).toMatchObject({ likelihood: 3, impact: 4, inherentRiskValue: 12, inherentRiskLevel: 'critical', trustCriterion: 'availability', potentialImpact: ['Pérdida financiera', 'Reputacional'] });
    expect(catalog.causes[0]).toMatchObject({ causeOrigin: 'internal', causeType: 'human' });
    expect(catalog.riskCauses).toEqual([{ riskCode: 'R001', causeCode: 'F001' }]);
    expect(catalog.causeControls).toEqual([{ causeCode: 'F001', controlCode: 'CAP-1' }]);
  });

  it('los vínculos prueba–check: el N/A queda sin check y con module_ref', () => {
    expect(catalog.testChecks.map((t) => [t.role, t.platform, t.checkId, t.moduleRef])).toEqual([
      ['direct', 'ubuntu', '28500', null],
      ['complementary', 'aws', 'rds_instance_deprecated_engine_version', null],
      ['direct', null, null, 'FIM (monitoreo de integridad de archivos)'],
    ]);
  });

  it('el mapeo a marcos, los procedimientos y las categorías de integración', () => {
    expect(catalog.controlFrameworkMappings).toEqual([
      { controlCode: 'CAP-1', frameworkCode: 'soc2', requirementRef: 'A1.1 POC 1', relationType: 'direct', justification: 'Asignado en Controles Monkey' },
      expect.objectContaining({ requirementRef: 'A1.1 POC 2' }),
    ]);
    expect(catalog.standardProcedures).toHaveLength(2);
    expect(catalog.integrationCategories[0]).toMatchObject({ name: 'Nube', procedureCodes: ['PE-MUE-01'] });
    expect(catalog.integrationCategoryControls).toEqual([{ categoryName: 'Nube', controlCode: 'CAP-1' }]);
  });

  it('los conteos salen de lo construido', () => {
    expect(catalog.meta.counts).toEqual(countsOf(catalog));
    expect(catalog.meta.counts).toMatchObject({ controls: 1, pointOfFocusControls: 2, controlRequirements: 2, tests: 2, testChecks: 3 });
    expect(catalog.meta).toMatchObject({ catalogVersion: 2, sourceSha256: 'abc', sondaVersion: '4.14.7', cloudEngineVersion: '5.45.0' });
  });

  describe('lo que se rechaza', () => {
    const fails = (mutate: (s: Sheets) => void, msg: RegExp) => expect(build(mutate).errors.join('\n')).toMatch(msg);

    it('IN-08: una columna que cambia entre las filas de un mismo control', () => fails((s) => (s.controlRows[1]['Descripción'] = 'Otra'), /IN-08 · CAP-1.*Descripción/));
    it('IN-08: el dominio SÍ puede cambiar entre filas (es de la fila)', () => expect(build().errors).toEqual([]));
    it('IN-02: la columna ID_Causa del control no coincide con la hoja Causas', () => fails((s) => s.controlRows.forEach((r) => (r['ID_Causa'] = 'F001, F002')), /IN-02 · CAP-1/));
    it('IN-03: un riesgo sin causa o con otra lista', () => fails((s) => (s.risks[0]['ID_Causa'] = 'F009'), /IN-03 · R001/));
    it('IN-09: un control sin rol responsable sugerido', () => fails((s) => s.controlRows.forEach((r) => (r['ROL RESPONSABLE SUGERIDO'] = '')), /IN-09|ROL RESPONSABLE/));
    it('una etiqueta que no es una opción conocida', () => {
      fails((s) => s.controlRows.forEach((r) => (r['TIPO CONTROL'] = 'Mixto')), /TIPO CONTROL.*«Mixto»/);
      fails((s) => (s.tests[1]['Fuente principal'] = 'Otra'), /Fuente principal/);
      fails((s) => (s.causes[0]['Tipo_Causa'] = 'Raro'), /Tipo_Causa/);
    });
    it('un riesgo sin número en la probabilidad', () => fails((s) => (s.risks[0]['Probabilidad inherente [CATEGORÍA]'] = 'Posible'), /probabilidad o impacto/));
    it('un punto de enfoque que el control cita y la matriz no tiene', () => fails((s) => (s.controlRows[1]['POC #'] = 9), /POC 9, que no está/));
    it('un procedimiento o una integración que no existen', () => {
      fails((s) => (s.tests[1]['Procedimiento estándar'] = 'PE-XX-01'), /procedimiento estándar «PE-XX-01»/);
      fails((s) => (s.tests[1]['Integración sugerida'] = 'Fax'), /integración sugerida «Fax»/);
    });
    it('un vínculo con un check que no existe', () => fails((s) => (s.testChecks[0]['Check ID'] = 1), /no existe en la política/));
    it('los controles de un documento no coinciden entre las dos hojas', () => fails((s) => (s.documents[0]['Códigos de control relacionados'] = 'CAP-2'), /POL-001.*no coinciden/));
    it('un código repetido', () => fails((s) => s.tests.push({ ...(s.tests[1] as Row) }), /TEST: el código T-CAP-1-01 está repetido/));
    it('«Obligatorio» distinto de Sí o No', () => fails((s) => (s.requirements[0]['Obligatorio'] = 'Quizá'), /Obligatorio/));
  });

  it('si un criterio trae dos categorías TSC, gana la más frecuente y se avisa; las categorías cortas distintas son error', () => {
    const two = build((s) => (s.controlRows[1]['Categoría TSC'] = 'Otra categoría'));
    expect(two.warnings.join('\n')).toMatch(/A1\.1 trae 2 categorías TSC/);
    expect(two.errors.filter((e) => /IN-08/.test(e))).toEqual([]);
    expect(build((s) => (s.controlRows[1]['Categoría (corto)'] = 'Privacidad')).errors.join('\n')).toMatch(/dos categorías cortas/);
  });
});
