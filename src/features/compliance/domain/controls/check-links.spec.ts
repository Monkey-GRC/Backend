import { checkLinksByTest, LinkItem } from './control-readout';
import { asset, control, data, links, readoutTest, requirement, serverResults } from './readout.fixtures';

// MD-499 · `check_links[]` del detalle: los tres roles en orden, un módulo clasificado y un dueño fuera del alcance.
const check = (id: string, titleEs: string | null, titleEn: string) => ({ id, titleEs, titleEn });
const item = (patch: Partial<LinkItem> & Pick<LinkItem, 'role' | 'key'>): LinkItem => ({ check: null, moduleRef: null, owner: null, ...patch });

const items: LinkItem[] = [
  item({ role: 'dependency', key: 'check:dep', check: check('dep', null, 'Account lockout'), owner: { controlId: 'cat-o', code: 'IAC-15' } }),
  item({ role: 'dependency', key: 'check:gone', check: check('gone', 'Registro de auditoría', 'Audit log'), owner: { controlId: 'cat-gone', code: 'LOG-3' } }),
  item({ role: 'complementary', key: 'check:k1', check: check('k1', 'Complemento', 'Complement') }),
  item({ role: 'direct', key: 'module:Vulnerabilidades', moduleRef: 'Vulnerabilidades' }),
  item({ role: 'direct', key: 'check:d1', check: check('d1', 'MFA habilitada', 'MFA enabled') }),
];

function setup() {
  const assets = [asset('a1'), asset('a2')];
  const test = readoutTest('t1', 'technical', { links: links({ directCheckCount: 1, directKeys: ['check:d1'], items }) });
  const main = control([requirement('r1', [test])], { id: 'c1' });
  const ownerTest = readoutTest('t-owner', 'technical', { links: links({ directCheckCount: 1, directKeys: ['check:dep'] }) });
  const owner = control([requirement('ro', [ownerTest])], { id: 'o1', catalogControlId: 'cat-o', catalogCode: 'IAC-15' });
  const mine = serverResults('c1', 't1', assets, ['compliant', 'non_compliant']);
  const theirs = serverResults('o1', 't-owner', assets, ['compliant', 'compliant']);
  const facts = new Map([['a1', { openCriticalHigh: 0, scorePercent: null }], ['a2', { openCriticalHigh: 2, scorePercent: null }]]);
  const d = data([main], assets, {
    results: new Map([...mine.results, ...theirs.results]),
    signals: { resultDates: new Map([...mine.dates, ...theirs.dates]), moduleFacts: facts, complementaryFailChecks: new Set(['t1|a2|k1']) },
  });
  return { main, d: { ...d, pool: [main, owner] } };
}

describe('checkLinksByTest · MD-499', () => {
  it('ordena Directos, Complementarios y Dependencias; solo el Complementario cuenta activos en FAIL', () => {
    const { main, d } = setup();
    const out = checkLinksByTest(main, d).get('t1')!;
    expect(out.map((l) => [l.role, l.kind])).toEqual([['direct', 'check'], ['direct', 'module'], ['complementary', 'check'], ['dependency', 'check'], ['dependency', 'check']]);
    expect(out[0]).toMatchObject({ check: { id: 'd1', titleEs: 'MFA habilitada' }, module: null, failingAssets: null, owner: null });
    expect(out[2]).toMatchObject({ failingAssets: 1 });
  });

  it('un vínculo a un módulo sale clasificado, sin el nombre interno, ', () => {
    const { main, d } = setup();
    const mod = checkLinksByTest(main, d).get('t1')![1];
    expect(mod).toMatchObject({ kind: 'module', check: null, module: 'vulnerabilities', failingAssets: null });
    expect(JSON.stringify(mod)).not.toContain('Vulnerabilidades');
  });

  it('una Dependencia no lleva resultado: lleva el control dueño y el estado de su prueba; fuera de alcance, sin id ni estado', () => {
    const { main, d } = setup();
    const [inScope, gone] = checkLinksByTest(main, d).get('t1')!.slice(3);
    expect(inScope).toMatchObject({ role: 'dependency', failingAssets: null, owner: { controlId: 'o1', controlCode: 'IAC-15', testStatus: 'correct' } });
    expect(gone).toMatchObject({ failingAssets: null, owner: { controlId: null, controlCode: 'LOG-3', testStatus: null } });
  });

  it('las pruebas no técnicas no llevan vínculos', () => {
    const doc = readoutTest('d', 'documentary');
    const c = control([requirement('r', [doc])]);
    expect(checkLinksByTest(c, data([c], [])).get('d')).toEqual([]);
  });
});
