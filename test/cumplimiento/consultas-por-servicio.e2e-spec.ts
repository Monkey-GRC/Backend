import { TransactionClient } from '../../src/infrastructure/database/prisma.service';
import { BOOK_PARAMETERS } from '../../src/features/compliance/domain/engine/v2/parameters.fixtures';
import { loadServiceSnapshot } from '../../src/features/compliance/infrastructure/shared/service-snapshot.loader';

// MD-498 · La foto de un servicio hace un número FIJO de consultas, sin importar cuántos controles tenga (no hay N+1). Se cuenta cada llamada al cliente transaccional.
const test = (id: string) => ({
  id, code: `T-${id}`, dimension: 'server', displayName: null, displayNameEn: null, displayDescription: null, type: 'technical',
  testChecks: [
    { role: 'direct', checkId: `k-${id}`, ownerControlId: null, moduleRef: null, provenance: 'committee_ratified' },
    { role: 'complementary', checkId: `c-${id}`, ownerControlId: null, moduleRef: null, provenance: 'committee_ratified' },
    { role: 'direct', checkId: null, ownerControlId: null, moduleRef: 'Detección de vulnerabilidades', provenance: 'committee_ratified' },
  ],
});
const control = (i: number) => ({
  id: `cc-${i}`, serviceId: 's1', ownCode: `IAC-${i}`, name: null, trustCriterion: null, type: 'hybrid', clientInterpretation: 'x', controlId: `cat-${i}`,
  control: { code: `IAC-${i}`, name: 'Control', description: 'x', periodicity: null, pointOfFocusControls: [] },
  dimensions: [],
  requirements: [0, 1, 2].map((r) => ({ id: `r-${i}-${r}`, periodicity: null, isApplicable: true, controlRequirement: { code: `IAC-${i}-L${r}`, text: 'x', type: 'technical', pointNumber: r, periodicity: null, tests: [{ test: test(`t-${i}-${r}`) }] } })),
});

/** Un cliente transaccional de mentira: cuenta cada consulta y devuelve vacío, salvo los controles y los activos. */
function fakeTx(controls: number) {
  const calls: string[] = [];
  const answer = (path: string): unknown => {
    if (path === 'clientControl.findMany') return Array.from({ length: controls }, (_, i) => control(i));
    if (path === 'serviceAsset.findMany') return [{ asset: { id: 'a1', name: 'srv', type: 'server' } }];
    return [];
  };
  const leaf = (path: string) => (..._args: unknown[]) => {
    calls.push(path);
    return Promise.resolve(answer(path));
  };
  const tx = new Proxy({}, { get: (_t, model: string) => (model.startsWith('$') ? leaf(model) : new Proxy({}, { get: (_m, method: string) => leaf(`${model}.${method}`) })) });
  return { tx: tx as unknown as TransactionClient, calls };
}

describe('loadServiceSnapshot · consultas por servicio', () => {
  const params = BOOK_PARAMETERS;
  const run = async (controls: number) => {
    const { tx, calls } = fakeTx(controls);
    const data = await loadServiceSnapshot(tx, 's1', params);
    return { calls: calls.length, controls: data.controls.length };
  };

  it('con 3 o con 80 controles hace las mismas consultas', async () => {
    const few = await run(3);
    const many = await run(80);
    expect(few.controls).toBe(3);
    expect(many.controls).toBe(80);
    expect(many.calls).toBe(few.calls);
    expect(few.calls).toBeLessThanOrEqual(20);
  });

  it('leer un control que no depende de otros no carga el resto del servicio', async () => {
    const { tx, calls } = fakeTx(1);
    await loadServiceSnapshot(tx, 's1', params, 'cc-0');
    expect(calls.filter((c) => c === 'clientControl.findMany')).toHaveLength(1);
  });
});
