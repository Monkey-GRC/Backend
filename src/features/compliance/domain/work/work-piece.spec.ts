import { workPieceOf } from './work-piece';

// MD-499 · De qué cuenta una prueba en «Mi trabajo»: evidencia si acepta subida; veredicto si no la acepta y el control la resuelve a mano (nunca una documental); si no, nada.
const test = (dimension: string, primarySource: string | null, integrationCategory: string | null = null) => ({ dimension, primarySource, integrationCategory });
const dim = (type: string, applies = true) => ({ applies, type });
const NONE: ReadonlySet<string> = new Set();

describe('workPieceOf', () => {
  it.each([
    ['manual y la dimensión aplica → evidencia', test('process', 'manual'), dim('manual'), NONE, 'evidence'],
    ['documental en su dimensión → evidencia', test('policy', 'document'), dim('manual'), NONE, 'evidence'],
    ['manual en una dimensión híbrida → evidencia', test('process', 'manual'), dim('hybrid'), NONE, 'evidence'],
    ['integración sin conectar → evidencia (respaldo)', test('app', 'integration', 'Identidades'), dim('hybrid'), NONE, 'evidence'],
    ['sonda en una dimensión manual → veredicto', test('server', 'probe'), dim('manual'), NONE, 'verdict'],
    ['motor de nube en una dimensión technical_manual → veredicto', test('cloud', 'cloud_engine'), dim('technical_manual'), NONE, 'verdict'],
    ['integración conectada en una dimensión manual → veredicto', test('app', 'integration', 'Identidades'), dim('manual'), new Set(['Identidades']), 'verdict'],
    ['documental que no acepta (sonda en `policy`) → nada', test('policy', 'probe'), dim('manual'), NONE, null],
    ['sonda en una dimensión híbrida → nada', test('server', 'probe'), dim('hybrid'), NONE, null],
    ['sonda en una dimensión automática → nada', test('server', 'probe'), dim('automated'), NONE, null],
    ['la dimensión no aplica → nada, aunque acepte subida', test('process', 'manual'), dim('manual', false), NONE, null],
    ['la dimensión no aplica y la mide la sonda → nada', test('server', 'probe'), dim('manual', false), NONE, null],
    ['el control no tiene la dimensión → nada', test('process', 'manual'), undefined, NONE, null],
  ] as const)('%s', (_caso, t, d, connected, expected) => {
    expect(workPieceOf(t, d, connected)).toBe(expected);
  });
});
