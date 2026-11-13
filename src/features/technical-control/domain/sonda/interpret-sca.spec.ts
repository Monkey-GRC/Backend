import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { interpretSca } from './interpret-sca';
import { CatalogCheckRef, CatalogLookup, ScaPolicyInput } from './sonda.types';

const READ_AT = new Date('2026-11-12T02:00:00Z');
const POLICY = 'cis_ubuntu22-04';
const NAME = 'CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0.';

// Un catálogo en memoria con la clave natural de tres partes: platform + policy_id + check_id.
const catalog = (ids: string[], policyId = POLICY): CatalogLookup => {
  const map = new Map<string, CatalogCheckRef>(ids.map((id) => [`${policyId}|${id}`, { id: `uuid-${id}`, platform: 'ubuntu', policyId, rawCheckId: id }]));
  return (p, _name, id) => map.get(`${p}|${id}`) ?? null;
};
const policy = (checks: ScaPolicyInput['checks'], over: Partial<ScaPolicyInput> = {}): ScaPolicyInput => ({ policyId: POLICY, name: NAME, scanEndedAt: '2026-11-12T01:37:33+00:00', checks, ...over });
const chk = (id: string, result: string, reason: string | null = null) => ({ id, result, reason, compliance: [] });

describe('interpretSca', () => {
  it('cada check del catálogo se convierte en una fila con su resultado y la fecha de la MEDICIÓN', () => {
    const out = interpretSca({ policies: [policy([chk('1', 'passed'), chk('2', 'failed'), chk('3', 'not applicable', 'no se pudo abrir el archivo')])], lookup: catalog(['1', '2', '3']), readAt: READ_AT });
    expect(out.unmapped).toEqual([]);
    expect(out.rows.map((r) => [r.rawCheckId, r.result])).toEqual([['1', 'passed'], ['2', 'failed'], ['3', 'not_applicable']]);
    expect(out.rows[0]).toMatchObject({ checkId: 'uuid-1', platform: 'ubuntu', policyId: POLICY, evaluatedAt: new Date('2026-11-12T01:37:33Z') });
    expect(out.rows[2].statusDetail).toBe('no se pudo abrir el archivo');
  });

  it('lo que el catálogo no conoce NO se guarda ni se inventa: se informa por política (cobertura no alcanzada)', () => {
    const out = interpretSca({
      policies: [policy([chk('1', 'passed'), chk('999', 'failed')]), policy([chk('7', 'passed'), chk('8', 'failed')], { policyId: 'cis_win_server_2022', name: 'CIS Windows Server 2022' })],
      lookup: catalog(['1']),
      readAt: READ_AT,
    });
    expect(out.rows.map((r) => r.rawCheckId)).toEqual(['1']);
    expect(out.unmapped).toEqual([
      { policyId: POLICY, policyName: NAME, checks: 1 },
      { policyId: 'cis_win_server_2022', policyName: 'CIS Windows Server 2022', checks: 2 },
    ]);
  });

  it('el catálogo se consulta con el id de la política Y su nombre (el comité las nombra por nombre)', () => {
    const seen: string[] = [];
    interpretSca({ policies: [policy([chk('1', 'passed')])], lookup: (p, n, id) => { seen.push(`${p}|${n}|${id}`); return null; }, readAt: READ_AT });
    expect(seen).toEqual([`${POLICY}|${NAME}|1`]);
  });

  it('un resultado que no conocemos queda `invalid`, nunca `passed`', () => {
    const out = interpretSca({ policies: [policy([chk('1', 'compliant')])], lookup: catalog(['1']), readAt: READ_AT });
    expect(out.rows[0].result).toBe('invalid');
  });

  it('un mismo check repetido se guarda UNA vez, con el peor resultado, y se cuenta', () => {
    const out = interpretSca({ policies: [policy([chk('1', 'passed'), chk('1', 'failed', 'motivo'), chk('1', 'passed')])], lookup: catalog(['1']), readAt: READ_AT });
    expect(out.rows).toHaveLength(1);
    expect(out.rows[0]).toMatchObject({ result: 'failed', statusDetail: 'motivo' });
    expect(out.duplicates).toBe(2);
  });

  describe('la fecha de la medición', () => {
    const when = (scanEndedAt: string | null) => interpretSca({ policies: [policy([chk('1', 'passed')], { scanEndedAt })], lookup: catalog(['1']), readAt: READ_AT }).rows[0].evaluatedAt;

    it('es la que informa la sonda', () => expect(when('2026-11-11T20:00:00Z')).toEqual(new Date('2026-11-11T20:00:00Z')));
    it('si no hay o es ilegible, es el momento de la lectura', () => { expect(when(null)).toEqual(READ_AT); expect(when('ayer')).toEqual(READ_AT); });
    it('una fecha del futuro no se cree (se usaría para hacer pasar una medición vieja por nueva)', () => expect(when('2027-01-01T00:00:00Z')).toEqual(READ_AT));
  });

  it('una entrega vacía no produce nada', () => {
    expect(interpretSca({ policies: [], lookup: catalog([]), readAt: READ_AT })).toEqual({ rows: [], unmapped: [], duplicates: 0 });
  });

  // Con lo que de verdad devolvió la sonda 4.14.6 (fixture capturado), sin tocar a mano.
  it('con una respuesta REAL de la sonda: los 6 checks se interpretan y conservan su resultado', () => {
    const page = JSON.parse(readFileSync(join(process.cwd(), 'src/runner/infrastructure/sonda/fixtures/sca-checks-page.json'), 'utf8'));
    const checks = page.data.affected_items.map((c: any) => ({ id: String(c.id), result: c.result, reason: c.reason ?? null, compliance: c.compliance }));
    const out = interpretSca({ policies: [policy(checks)], lookup: catalog(checks.map((c: { id: string }) => c.id)), readAt: READ_AT });
    expect(out.rows).toHaveLength(6);
    expect(out.rows.map((r) => r.result).sort()).toEqual(['failed', 'failed', 'not_applicable', 'not_applicable', 'passed', 'passed']);
    expect(out.unmapped).toEqual([]);
  });
});
