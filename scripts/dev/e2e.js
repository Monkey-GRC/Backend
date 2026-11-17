// `npm run test:e2e [-- <rutas de suites o flags de jest>]`
// Corre las suites en paralelo (E2E_WORKERS) y, después, las que no toleran paralelo (test/serial-suites.json) en serie.
// Con rutas, solo las que se piden: cada una va a su grupo.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const serial = require('../../test/serial-suites.json');

const root = path.resolve(__dirname, '../..');
const jest = ['--experimental-vm-modules', 'node_modules/jest/bin/jest.js', '--config', './test/jest-e2e.config.js', '--forceExit'];
const args = process.argv.slice(2);
const isPath = (a) => !a.startsWith('-') && /e2e-spec|^test\/|\/$/.test(a);
const paths = args.filter(isPath);
const flags = args.filter((a) => !isPath(a));
const run = (extra, env) => spawnSync('node', [...jest, ...flags, ...extra], { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } }).status ?? 1;
const inSerial = (p) => serial.some((s) => p.replace(/^\.\//, '').endsWith(s) || s.startsWith(p.replace(/^\.\//, '')));

const par = paths.length ? paths.filter((p) => !inSerial(p)) : [];
const ser = paths.length ? paths.filter(inSerial) : [];
let code = 0;
if (!paths.length || par.length) code = run(par, {});
if ((!paths.length && serial.length) || ser.length) code = run(ser, { E2E_SERIAL: '1' }) || code;
process.exit(code);
