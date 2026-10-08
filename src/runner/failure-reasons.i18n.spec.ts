import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FAILURE } from './domain/runner.types';

// Una razón de fallo es una clave i18n que el cliente verá en el historial. Si el código inventa una y nadie le escribe su texto, el cliente vería
// la clave cruda. Esta prueba recoge TODAS las claves `connection.*` y `execution.*` que usan el trabajador y el caso de uso de reclamo, y exige
// su texto en español y en inglés.
const SOURCES = [
  'src/runner/domain/runner.types.ts',
  'src/runner/application/run-next-execution.ts',
  'src/runner/infrastructure/sts-credential-broker.ts',
  'src/features/technical-control/application/use-cases/scan.use-cases.ts',
];
// Las acciones del audit trail comparten el prefijo `execution.` pero no son razones de fallo ni llevan texto para el cliente.
const AUDIT_ACTIONS = new Set(['execution.queue', 'execution.complete', 'execution.fail']);
const KEY = /['"`]((?:connection|execution)\.[a-z_]+)['"`]/g;
const text = (lang: string, file: string): Record<string, string> => JSON.parse(readFileSync(join('i18n', lang, `${file}.json`), 'utf8'));

describe('las razones de fallo tienen texto para el cliente', () => {
  const keys = new Set<string>(Object.values(FAILURE));
  for (const f of SOURCES) for (const m of readFileSync(f, 'utf8').matchAll(KEY)) if (!AUDIT_ACTIONS.has(m[1])) keys.add(m[1]);

  it('encuentra las razones conocidas', () => {
    expect(keys.size).toBeGreaterThanOrEqual(9);
    expect(keys).toContain('connection.role_not_found');
    expect(keys).toContain('execution.engine_timeout');
  });

  it.each(['es', 'en'])('todas existen en %s y no son vacías', (lang) => {
    const missing = [...keys].filter((k) => {
      const [file, name] = k.split('.');
      return !text(lang, file)[name]?.trim();
    });
    expect(missing).toEqual([]);
  });

  it('ningún texto para el cliente nombra a un proveedor', () => {
    for (const lang of ['es', 'en']) for (const file of ['connection', 'execution']) expect(JSON.stringify(text(lang, file))).not.toMatch(/prowler|wazuh/i);
  });
});
