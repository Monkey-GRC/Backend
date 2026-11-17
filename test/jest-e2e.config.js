// E2E en paralelo: cada worker tiene su propia base clonada de la plantilla (test/support/global-setup.ts).
// E2E_WORKERS fija los workers (por defecto 2: la máquina de desarrollo es pequeña); E2E_WORKER_MEMORY recicla un worker que crezca.
// Con E2E_SERIAL=1 solo corren las suites de `serial-suites.json` (las que no toleran paralelo); sin ella, todas las demás.
const serial = require('./serial-suites.json');
const soloSerie = process.env.E2E_SERIAL === '1';

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.e2e-spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  testTimeout: 60000,
  globalSetup: '<rootDir>/support/global-setup.ts',
  setupFiles: ['<rootDir>/support/worker-db.ts'],
  maxWorkers: soloSerie ? 1 : Number(process.env.E2E_WORKERS ?? 2),
  workerIdleMemoryLimit: process.env.E2E_WORKER_MEMORY ?? '400MB',
  ...(soloSerie
    ? { testMatch: serial.map((s) => `<rootDir>/${s}`) }
    : { testPathIgnorePatterns: ['/node_modules/', ...serial.map((s) => `<rootDir>/${s}`)] }),
};
