import { buildCatalog, deriveControlDimensions, numberedLines, parsePolicyLine, Row, SourceMeta, splitAttributes, splitSteps, testKind } from './build';

const meta: SourceMeta = {
  sourceFile: 'x.xlsx',
  sourceSha256: '0'.repeat(64),
  sheets: { requirementsAndRelations: 'a', controls: 'b' },
};

const rel = (over: Row = {}): Row => ({
  'TSC Ref': 'CC1.1',
  'Categoría TSC': 'Entorno de control',
  'Categoría (corto)': 'Criterios Comunes (Seguridad)',
  Dominio: 'Gobierno',
  Criterio: 'Criterio uno',
  'POC #': 1,
  'Punto de Enfoque (Completo)': 'Punto uno',
  ID: 'GOV-1',
  Control: 'Control uno',
  Descripción: 'Descripción uno',
  ...over,
});
const ctl = (over: Row = {}): Row => ({ ID: 'GOV-1', Control: 'Control uno', Descripción: 'Descripción uno', Dominio: 'Gobierno', ...over });
const build = (relations: Row[], controls: Row[]) =>
  buildCatalog({ relations, controls, risks: [], causes: [], riskCauses: [], tests: [], matrix: [] }, meta);

describe('buildCatalog (consistencia de la fuente)', () => {
  it('arma el catálogo cuando las hojas son consistentes', () => {
    const { catalog, errors } = build([rel()], [ctl()]);
    expect(errors).toEqual([]);
    expect(catalog.requirements).toEqual([{ code: 'CC1.1', tscCategory: 'Entorno de control', criterion: 'Criterio uno', trustCriterion: 'security' }]);
    expect(catalog.controls[0]).toMatchObject({ code: 'GOV-1', domain: 'Gobierno', sourceRef: 'vanta:GOV-1' });
    expect(catalog.pointOfFocusControls).toEqual([{ requirementCode: 'CC1.1', pointNumber: 1, controlCode: 'GOV-1' }]);
  });

  it('normaliza espacios sobrantes', () => {
    const { catalog } = build([rel({ Criterio: '  Criterio uno \n' })], [ctl()]);
    expect(catalog.requirements[0].criterion).toBe('Criterio uno');
  });

  it('detecta un requisito que cambia de criterio entre filas', () => {
    const { errors } = build([rel(), rel({ 'POC #': 2, 'Punto de Enfoque (Completo)': 'Punto dos', Criterio: 'OTRO' })], [ctl()]);
    expect(errors.some((e) => e.includes('cambia de categoría/criterio'))).toBe(true);
  });

  it('detecta un punto de enfoque con descripciones distintas', () => {
    const { errors } = build([rel(), rel({ 'Punto de Enfoque (Completo)': 'Distinto', ID: 'GOV-2', Control: 'c2', Descripción: 'd2' })], [ctl(), ctl({ ID: 'GOV-2', Control: 'c2', Descripción: 'd2' })]);
    expect(errors.some((e) => e.includes('cambia de descripción'))).toBe(true);
  });

  it('detecta un control que difiere entre las dos hojas', () => {
    const { errors } = build([rel()], [ctl({ Descripción: 'OTRA' })]);
    expect(errors.some((e) => e.includes('difiere entre la hoja de relaciones y la de controles'))).toBe(true);
  });

  it('detecta un control de las relaciones ausente en la hoja de controles', () => {
    const { errors } = build([rel()], []);
    expect(errors.some((e) => e.includes('no en la hoja de controles'))).toBe(true);
  });

  it('detecta una relación repetida', () => {
    const { errors } = build([rel(), rel()], [ctl()]);
    expect(errors.some((e) => e.includes('repiten una relación'))).toBe(true);
  });

  it('detecta una categoría corta desconocida', () => {
    const { errors } = build([rel({ 'Categoría (corto)': 'Otra cosa' })], [ctl()]);
    expect(errors.some((e) => e.includes('desconocida'))).toBe(true);
  });

  it('detecta un POC # que no es entero', () => {
    const { errors } = build([rel({ 'POC #': 'abc' })], [ctl()]);
    expect(errors.some((e) => e.includes('no es un entero'))).toBe(true);
  });

  it('detecta una columna faltante en la hoja', () => {
    const r = rel();
    delete r['Dominio'];
    const { errors } = build([r], [ctl()]);
    expect(errors.some((e) => e.includes('falta la columna "Dominio"'))).toBe(true);
  });
});

describe('analizadores de texto del Excel', () => {
  it('numberedLines separa "1. a\\r\\n2. b" y une las líneas sin número a la anterior', () => {
    expect(numberedLines('1. Uno\r\n2. Dos\r\ncontinúa\r\n3. Tres')).toEqual([
      { n: 1, text: 'Uno' }, { n: 2, text: 'Dos continúa' }, { n: 3, text: 'Tres' },
    ]);
    expect(numberedLines('')).toEqual([]);
  });

  it('splitSteps separa pasos "1. … 2. …" y "1) … 2) …"', () => {
    expect(splitSteps('1. Solicitar el documento. 2. Verificar la versión. 3. Confirmar la aprobación.')).toEqual([
      'Solicitar el documento.', 'Verificar la versión.', 'Confirmar la aprobación.',
    ]);
    expect(splitSteps('1) Pedir inventario 2) Conciliar')).toEqual(['Pedir inventario', 'Conciliar']);
  });

  it('splitSteps no confunde números dentro del texto con el siguiente paso', () => {
    expect(splitSteps('1. Revisar 10 servidores y 2 bases. 2. Registrar el resultado')).toEqual([
      'Revisar 10 servidores y 2 bases.', 'Registrar el resultado',
    ]);
  });

  it('splitSteps devuelve null si no empieza en 1 (no se adivina)', () => {
    expect(splitSteps('Solicitar el documento. 2. Verificar')).toBeNull();
    expect(splitSteps('2. Solo el segundo')).toBeNull();
  });

  it('splitAttributes acepta viñetas por línea o frases separadas por ";"', () => {
    expect(splitAttributes('- Cobertura por host.\r\n- Umbrales definidos.')).toEqual(['Cobertura por host', 'Umbrales definidos']);
    expect(splitAttributes('Existencia; código/versión; vigencia.')).toEqual(['Existencia', 'código/versión', 'vigencia']);
  });
});

describe('políticas y dimensiones (D39)', () => {
  it('lee el nombre de la política y si exige la aceptación del empleado', () => {
    expect(parsePolicyLine('Política de Gestión de Activos — El control depende de la aprobación de la política')).toEqual({ name: 'Política de Gestión de Activos', requiresEmployeeAcceptance: false });
    expect(parsePolicyLine('Código de Conducta — El control depende de la aprobación de la política y la aceptación del empleado')).toEqual({ name: 'Código de Conducta', requiresEmployeeAcceptance: true });
    expect(parsePolicyLine('Algo sin el formato esperado')).toBeNull();
  });

  it('clasifica el tipo de una prueba por su texto y falla si no lo reconoce', () => {
    const t = (dimension: 'policy' | 'server', type: string) => ({ code: 'T-X-1', dimension, type });
    expect(testKind(t('policy', 'Prueba de diseño (control detectivo, dependiente de TI)'))).toBe('manual');
    expect(testKind(t('server', 'Manual'))).toBe('manual');
    expect(testKind(t('server', 'Mixta'))).toBe('hybrid');
    expect(testKind(t('server', 'Técnica'))).toBe('technical_manual');
    expect(testKind(t('server', 'Prueba de implementación y efectividad operativa (control detectivo, automatizado)'))).toBe('automated');
    expect(testKind(t('server', 'Prueba de implementación y efectividad operativa (control correctivo, automatizado + manual)'))).toBe('hybrid');
    expect(() => testKind(t('server', 'Otra cosa'))).toThrow(/no se puede clasificar/);
  });

  const tests = [
    { code: 'T-DOC-1', dimension: 'policy' as const, type: 'Manual' },
    { code: 'T-SRV-1', dimension: 'server' as const, type: 'Mixta' },
    { code: 'T-SRV-2', dimension: 'server' as const, type: 'Manual' },
    { code: 'T-SRV-3', dimension: 'server' as const, type: 'Prueba de implementación (control detectivo, automatizado)' },
  ];

  it('una dimensión aplica solo si el control tiene una prueba de esa dimensión', () => {
    const dims = deriveControlDimensions(tests, [
      { controlCode: 'GOV-1', testCode: 'T-DOC-1' },
      { controlCode: 'GOV-2', testCode: 'T-DOC-1' },
      { controlCode: 'GOV-2', testCode: 'T-SRV-1' },
    ]);
    expect(dims.map((d) => `${d.controlCode}/${d.dimension}`)).toEqual(['GOV-1/policy', 'GOV-2/policy', 'GOV-2/server']);
  });

  it('la dimensión documental es manual, con IA y con confirmación humana, sin sonda', () => {
    const [d] = deriveControlDimensions(tests, [{ controlCode: 'GOV-1', testCode: 'T-DOC-1' }]);
    expect(d).toMatchObject({ type: 'manual', requiresProbe: false, requiresAi: true, requiresComplianceConfirmation: true });
  });

  it('pruebas de tipos distintos en una misma dimensión dan una dimensión mixta que pide sonda', () => {
    const [d] = deriveControlDimensions(tests, [{ controlCode: 'A-1', testCode: 'T-SRV-2' }, { controlCode: 'A-1', testCode: 'T-SRV-3' }]);
    expect(d).toMatchObject({ type: 'hybrid', requiresProbe: true, requiresAi: false, requiresComplianceConfirmation: true });
  });

  it('solo lo puramente automático cierra sin confirmación humana', () => {
    const [d] = deriveControlDimensions(tests, [{ controlCode: 'A-1', testCode: 'T-SRV-3' }]);
    expect(d).toMatchObject({ type: 'automated', requiresProbe: true, requiresComplianceConfirmation: false });
  });
});
