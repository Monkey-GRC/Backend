import { workPiecesOf } from './work-piece';

// MD-499, MD-529 (DT-120) · De qué cuenta una prueba en «Mi trabajo»: evidencia si acepta subida y resultado del responsable si no es documental (una manual que acepta subida lleva las dos); nada si la mide la evaluación automática.
const test = (dimension: string, primarySource: string | null, integrationCategory: string | null = null, type: string | null = 'operational') => ({ dimension, primarySource, integrationCategory, type });
const dim = (type: string, applies = true) => ({ applies, type });
const NONE: ReadonlySet<string> = new Set();

describe('workPiecesOf', () => {
  it.each([
    ['manual no documental y la dimensión aplica → evidencia y resultado', test('process', 'manual'), dim('manual'), NONE, ['evidence', 'result']],
    ['documental → solo evidencia', test('policy', 'document', null, 'documentary'), dim('manual'), NONE, ['evidence']],
    ['manual en una dimensión híbrida → evidencia y resultado', test('process', 'manual'), dim('hybrid'), NONE, ['evidence', 'result']],
    ['integración sin conectar → evidencia (respaldo) y resultado', test('app', 'integration', 'Identidades'), dim('hybrid'), NONE, ['evidence', 'result']],
    ['sonda en una dimensión manual → solo resultado', test('server', 'probe'), dim('manual'), NONE, ['result']],
    ['motor de nube en una dimensión technical_manual → solo resultado', test('cloud', 'cloud_engine'), dim('technical_manual'), NONE, ['result']],
    ['integración conectada en una dimensión manual → solo resultado', test('app', 'integration', 'Identidades'), dim('manual'), new Set(['Identidades']), ['result']],
    ['documental que no acepta (sonda en `policy`) → nada', test('policy', 'probe'), dim('manual'), NONE, []],
    ['sonda en una dimensión híbrida → nada', test('server', 'probe'), dim('hybrid'), NONE, []],
    ['sonda en una dimensión automática → nada', test('server', 'probe'), dim('automated'), NONE, []],
    ['la dimensión no aplica → nada, aunque acepte subida', test('process', 'manual'), dim('manual', false), NONE, []],
    ['el control no tiene la dimensión → nada', test('process', 'manual'), undefined, NONE, []],
  ] as const)('%s', (_caso, t, d, connected, expected) => {
    expect(workPiecesOf(t, d, connected)).toEqual(expected);
  });
});
