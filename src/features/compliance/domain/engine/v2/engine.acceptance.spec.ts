import { control, data, readoutTest, repeat, requirement, serverResults, servers, links, NOW, asset } from '../../controls/readout.fixtures';
import { readControl, ReadoutControl, ResultsIndex, testAssetKey } from '../../controls/control-readout';
import { evaluateCategory, evaluateFramework } from '../rollup';
import { AssetResult } from '../states';

// Aceptación del motor v2 (MD-498): el ejemplo resuelto de §9 (C1 a C9) recorrido de punta a punta: activo → check → prueba → requisito → control → categoría → marco.
const SRV = readoutTest('srv', 'technical');
const DOC = readoutTest('doc', 'documentary');
const evidenceOk = [{ testId: 'doc', state: 'compliant' as const, submittedAt: new Date('2026-11-10T00:00:00Z') }];

type Case = { results: Array<AssetResult | null>; exceptions?: number; complementary?: boolean };
function service(c: Case, patch: Partial<ReadoutControl> = {}) {
  const assets = servers(50);
  const ctl = control([requirement('r1', [SRV], { periodicity: 'monthly' }), requirement('r2', [DOC], { periodicity: 'monthly' })], { evidence: evidenceOk, ...patch });
  const { results, dates } = serverResults('c1', 'srv', assets, c.results);
  const exceptions = new Set(assets.slice(0, c.exceptions ?? 0).map((a) => testAssetKey('srv', a.id)));
  const complementaryFails = new Set(c.complementary ? [testAssetKey('srv', 'a1')] : []);
  const d = data([ctl], assets, { results, signals: { resultDates: dates, exceptions, complementaryFails } });
  const readout = readControl(ctl, d);
  const technical = readout.requirements[0].tests[0];
  return { readout, technical };
}
const pass = (n: number) => repeat<AssetResult | null>(n, 'compliant');

describe('ejemplo de §9: 50 servidores y sus checks Directos (T-04)', () => {
  it('C1 · 45 PASS y 5 FAIL → Excepción; el requisito no cumple y el control queda en 50 % (Débil)', () => {
    const { readout, technical } = service({ results: [...pass(45), ...repeat<AssetResult | null>(5, 'non_compliant')] });
    expect(technical.status).toBe('exception');
    expect(readout.requirements[0].status).toBe('non_compliant');
    expect(readout).toMatchObject({ level: 'weak', cPercent: 50 });
    expect(readout.state).toBe('ineffective');
    expect(readout.failing).toEqual([{ dimension: 'server', affected: expect.arrayContaining([{ kind: 'asset', id: 'a46', name: 'activo-a46' }]) }]);
  });
  it('C2 · 45 PASS y 5 sin resultado → Pendiente (ventana abierta); el requisito queda pendiente', () => {
    const { readout, technical } = service({ results: [...pass(45), ...repeat<AssetResult | null>(5, null)] });
    expect(technical.status).toBe('pending');
    expect(technical.assetCoverage).toEqual({ withResult: 45, inScope: 50 });
    expect(readout.requirements[0].status).toBe('pending');
    expect(readout.complies).toBe(false);
  });
  it('C3 · 50 de 50 en PASS → Correcto; con el documento válido el control es Sólido y cumple', () => {
    const { readout, technical } = service({ results: pass(50) });
    expect(technical.status).toBe('correct');
    expect(technical.checks).toEqual({ directPass: 50, directFail: 0, directException: 0, noData: 0, complementaryFail: 0 });
    expect(readout).toMatchObject({ level: 'solid', complies: true, state: 'effective', readiness: 'ready', cPercent: 100, progress: { done: 2, total: 2 } });
  });
  it('C4 · 48 PASS y 2 con error técnico → igual que C2', () => {
    const { technical } = service({ results: [...pass(48), 'error', 'error'] });
    expect(technical.status).toBe('pending');
  });
  it('C5 · 47 PASS y 3 FAIL con excepción vigente → Correcto, marcados', () => {
    const { technical, readout } = service({ results: [...repeat<AssetResult | null>(3, 'non_compliant'), ...pass(47)], exceptions: 3 });
    expect(technical.status).toBe('correct');
    expect(technical.checks).toMatchObject({ directException: 3, directPass: 47 });
    expect(readout.complies).toBe(true);
  });
  it('C6 · ningún Directo aplica → se prueba a mano (T-05): sin evidencia, Pendiente; con evidencia validada, Correcto', () => {
    const assets = servers(3);
    const ctl = control([requirement('r1', [SRV])]);
    const sinEvidencia = readControl(ctl, data([ctl], assets, { results: new Map(assets.map((a) => [`c1|srv|${a.id}`, 'not_applicable' as const])) }));
    expect(sinEvidencia.requirements[0].tests[0].status).toBe('pending');
    expect(sinEvidencia.requirements[0].tests[0].checks).toBeNull();
    const conEvidencia = control([requirement('r1', [SRV])], { evidence: [{ testId: 'srv', state: 'compliant', submittedAt: new Date('2026-11-20T00:00:00Z') }] });
    expect(readControl(conEvidencia, data([conEvidencia], [])).requirements[0].tests[0].status).toBe('correct');
  });
  it('C7 · ningún resultado todavía → Pendiente y el control, No evaluado', () => {
    const ctl = control([requirement('r1', [SRV])]);
    const r = readControl(ctl, data([ctl], servers(50)));
    expect(r.requirements[0].tests[0].status).toBe('pending');
    expect(r).toMatchObject({ level: 'not_evaluated', readiness: 'not_measured', decided: false });
  });
  it('C8 · 45 PASS, 3 FAIL y 2 sin resultado → Excepción: prevalece la falla', () => {
    const { technical } = service({ results: [...pass(45), ...repeat<AssetResult | null>(3, 'non_compliant'), null, null] });
    expect(technical.status).toBe('exception');
  });
  it('C9 · 50 PASS y falla un check Complementario → Observación; el control cumple en Adecuado, no en Sólido', () => {
    const { readout, technical } = service({ results: pass(50), complementary: true });
    expect(technical.status).toBe('observation');
    expect(readout.requirements[0].status).toBe('compliant');
    expect(readout).toMatchObject({ level: 'adequate', complies: true });
  });
});

describe('ventana y frescura de lo automático', () => {
  it('un resultado de una ventana anterior deja la prueba vencida (mensual) o pendiente (permanente, PR-05)', () => {
    const assets = servers(2);
    const old = new Map([['c1|srv|a1', new Date('2026-10-20T00:00:00Z')], ['c1|srv|a2', new Date('2026-10-20T00:00:00Z')]]);
    const results: ResultsIndex = new Map([['c1|srv|a1', 'compliant'], ['c1|srv|a2', 'compliant']]);
    const monthly = control([requirement('r1', [SRV], { periodicity: 'monthly' })]);
    expect(readControl(monthly, data([monthly], assets, { results, signals: { resultDates: old } })).requirements[0].tests[0].status).toBe('expired');
    const permanent = control([requirement('r1', [SRV], { periodicity: 'permanent' })]);
    expect(readControl(permanent, data([permanent], assets, { results, signals: { resultDates: old } })).requirements[0].tests[0].status).toBe('pending');
    expect(readControl(monthly, data([monthly], assets, { results, signals: { resultDates: old } })).requirements[0].status).toBe('expired');
  });
  it('la periodicidad del requisito manda; si no tiene, la del control', () => {
    const assets = servers(1);
    const results: ResultsIndex = new Map([['c1|srv|a1', 'compliant']]);
    const dates = new Map([['c1|srv|a1', new Date('2026-10-20T00:00:00Z')]]);
    const control1 = control([requirement('r1', [SRV], { periodicity: null })], { periodicity: 'quarterly' });
    expect(readControl(control1, data([control1], assets, { results, signals: { resultDates: dates } })).requirements[0].tests[0]).toMatchObject({ status: 'correct', windowEnd: '2026-12-31' });
  });
});

describe('Dependencia (T-06): la prueba toma el estado de la prueba del control dueño', () => {
  const OWNER_TEST = readoutTest('own-t', 'technical', { links: links({ directCheckCount: 1, directKeys: ['check:k1'] }) });
  const DEP_TEST = readoutTest('dep-t', 'technical', { links: links({ directCheckCount: 0, dependencies: [{ ownerControlId: 'cat-owner', key: 'check:k1' }] }) });
  const owner = control([requirement('ro', [OWNER_TEST])], { id: 'owner', catalogControlId: 'cat-owner', catalogCode: 'CIF-3' });
  const dependent = control([requirement('rd', [DEP_TEST])], { id: 'dep', catalogControlId: 'cat-dep', catalogCode: 'IAC-9' });
  const assets = servers(2);
  const state = (result: AssetResult | null, controls: ReadoutControl[]) => {
    const results: ResultsIndex = new Map(result ? assets.map((a) => [`owner|own-t|${a.id}`, result]) : []);
    const dates = new Map(result ? assets.map((a) => [`owner|own-t|${a.id}`, new Date(NOW.getTime() - 60_000)]) : []);
    return readControl(dependent, data(controls, assets, { results, signals: { resultDates: dates } })).requirements[0].tests[0].status;
  };
  it('si el dueño está Correcto, el dependiente también; si está en Excepción, también', () => {
    expect(state('compliant', [owner, dependent])).toBe('correct');
    expect(state('non_compliant', [owner, dependent])).toBe('exception');
  });
  it('si el dueño no tiene resultado, el dependiente está Pendiente; si el dueño no está en el servicio, también', () => {
    expect(state(null, [owner, dependent])).toBe('pending');
    expect(state('compliant', [dependent])).toBe('pending');
  });
  it('se resuelve con el pool aunque se lea un solo control', () => {
    const results: ResultsIndex = new Map(assets.map((a) => [`owner|own-t|${a.id}`, 'compliant']));
    const dates = new Map(assets.map((a) => [`owner|own-t|${a.id}`, new Date(NOW.getTime() - 60_000)]));
    const d = { ...data([dependent], assets, { results, signals: { resultDates: dates } }), pool: [owner, dependent] };
    expect(readControl(dependent, d).requirements[0].tests[0].status).toBe('correct');
  });
  it('una dependencia circular no se cuelga: queda pendiente', () => {
    const a = control([requirement('ra', [readoutTest('ta', 'technical', { links: links({ dependencies: [{ ownerControlId: 'cat-b', key: 'check:x' }], directKeys: ['check:y'] }) })])], { id: 'a', catalogControlId: 'cat-a' });
    const b = control([requirement('rb', [readoutTest('tb', 'technical', { links: links({ dependencies: [{ ownerControlId: 'cat-a', key: 'check:y' }], directKeys: ['check:x'] }) })])], { id: 'b', catalogControlId: 'cat-b' });
    expect(readControl(a, data([a, b], assets)).requirements[0].tests[0].status).toBe('pending');
  });
});

describe('vínculos de módulo (D141) dentro de una prueba', () => {
  const MODULE = readoutTest('vul', 'technical', { links: links({ modules: [{ role: 'direct', ref: 'Detección de vulnerabilidades' }], directKeys: ['module:Detección de vulnerabilidades'] }) });
  const ctl = control([requirement('r1', [MODULE])]);
  const assets = [asset('a1')];
  const read = (facts?: { openCriticalHigh: number | null; scorePercent: number | null }) =>
    readControl(ctl, data([ctl], assets, { signals: { moduleFacts: new Map(facts ? [['a1', facts]] : []) } })).requirements[0].tests[0].status;
  it('pasa sin hallazgos críticos ni altos; falla con alguno; sin dato queda pendiente', () => {
    expect(read({ openCriticalHigh: 0, scorePercent: null })).toBe('correct');
    expect(read({ openCriticalHigh: 3, scorePercent: null })).toBe('exception');
    expect(read()).toBe('pending');
  });
});

describe('verdicts y control propio', () => {
  it('un veredicto aprobado decide una prueba manual que no es documental', () => {
    const op = readoutTest('op', 'operational');
    const ctl = control([requirement('r1', [op])]);
    const d = data([ctl], [], { signals: { verdicts: new Map([['op', { result: 'compliant', at: new Date('2026-11-20T00:00:00Z') }]]) } });
    expect(readControl(ctl, d).requirements[0].tests[0].status).toBe('correct');
    const doc = control([requirement('r1', [DOC])]);
    expect(readControl(doc, data([doc], [], { signals: { verdicts: new Map([['doc', { result: 'compliant', at: new Date('2026-11-20T00:00:00Z') }]]) } })).requirements[0].tests[0].status).toBe('pending');
  });
  it('un control propio se mide con su evidencia como un requisito documental único', () => {
    const own = (evidence: ReadoutControl['evidence']) => control([], { id: 'own', origin: 'own', catalogCode: null, catalogControlId: null, evidence, name: 'Revisión de proveedores' });
    const read = (c: ReadoutControl) => readControl(c, data([c], []));
    expect(read(own([]))).toMatchObject({ level: 'not_evaluated', progress: { done: 0, total: 1 } });
    expect(read(own([{ testId: null, state: 'compliant', submittedAt: new Date('2026-11-01T00:00:00Z') }]))).toMatchObject({ level: 'solid', complies: true, progress: { done: 1, total: 1 }, readiness: 'ready' });
    expect(read(own([{ testId: null, state: 'non_compliant', submittedAt: null }]))).toMatchObject({ level: 'ineffective', state: 'ineffective' });
    expect(read(own([])).requirements[0].requirement).toMatchObject({ code: 'C01', text: 'Revisión de proveedores', type: 'documentary' });
  });
  it('un control del catálogo sin requisitos copiados no inventa cumplimiento', () => {
    const empty = control([]);
    expect(readControl(empty, data([empty], []))).toMatchObject({ level: 'not_evaluated', state: 'no_tests', readiness: 'not_measured', cPercent: null });
  });
});

describe('propagación: control → categoría → marco (el rollup se conserva)', () => {
  const read = (c: Case) => service(c).readout;
  it('un control que cumple propaga CUMPLE; un solo requisito que falla propaga NO CUMPLE hasta el marco', () => {
    const ok = read({ results: pass(50) });
    const bad = read({ results: [...pass(49), 'non_compliant'] });
    const ref = (r: typeof ok, id: string) => ({ controlId: id, state: r.state, decided: r.decided });
    expect(evaluateCategory({ inScope: true, controls: [ref(ok, 'c1'), ref(bad, 'c2')] }).state).toBe('non_compliant');
    expect(evaluateFramework([{ inScope: true, controls: [ref(ok, 'c1'), ref(bad, 'c2')] }]).failing).toEqual(['c2']);
    expect(evaluateFramework([{ inScope: true, controls: [ref(ok, 'c1')] }]).state).toBe('compliant');
  });
  it('un control con requisitos pendientes no está decidido: baja la cobertura del marco, no la sube', () => {
    const pending = read({ results: [...pass(45), ...repeat<AssetResult | null>(5, null)] });
    const framework = evaluateFramework([{ inScope: true, controls: [{ controlId: 'c1', state: pending.state, decided: pending.decided }] }]);
    expect(framework.coverage).toBe(0);
    expect(framework.pending).toEqual(['c1']);
  });
});
