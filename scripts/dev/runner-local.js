#!/usr/bin/env node
// Levanta el trabajador del motor de nube EN TU MÁQUINA, apuntando a tu backend local (D57, D58).
// Con esto las conexiones se comprueban de verdad contra AWS antes de subir nada al ambiente de desarrollo.
// Funciona igual en Windows, Linux y macOS (no depende de bash).
//
// Requisitos (una sola vez):
//   1. En el .env del backend:  PROBE_MODE=runner  y  RUNNER_TOKEN=<el mismo valor que en el archivo de entorno> (reinicia el backend).
//   2. Un archivo de entorno con RUNNER_TOKEN, ENGINE_IMAGE y las llaves AWS (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY).
//      Plantilla: deploy/runner.env.example.
//
// Uso:  npm run runner:local               (busca deploy/runner.env y luego ~/.monkey-runner.env)
//       npm run runner:local -- --no-build (no recompila; usa el dist/ existente)
// Otra ruta:  RUNNER_ENV_FILE=ruta/al/archivo npm run runner:local   (en PowerShell: $env:RUNNER_ENV_FILE="ruta"; npm run runner:local)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, spawn } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const candidates = [
  process.env.RUNNER_ENV_FILE && path.resolve(process.cwd(), process.env.RUNNER_ENV_FILE),
  path.join(root, 'deploy', 'runner.env'),
  path.join(os.homedir(), '.monkey-runner.env'),
].filter(Boolean);
const envFile = candidates.find((f) => fs.existsSync(f));
if (!envFile) {
  console.error(`Falta el archivo de entorno del runner. Busqué en:\n  ${candidates.join('\n  ')}\nPlantilla: deploy/runner.env.example.`);
  process.exit(1);
}

const fileEnv = {};
for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
  if (!m || line.trim().startsWith('#')) continue;
  fileEnv[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
}

const missing = ['RUNNER_TOKEN', 'ENGINE_IMAGE', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'].filter((v) => !fileEnv[v]);
if (missing.length) {
  console.error(`Falta ${missing.join(', ')} en ${envFile}.`);
  process.exit(1);
}

const env = { BACKEND_INTERNAL_URL: 'http://localhost:3000', ...process.env, ...fileEnv };

if (!process.argv.includes('--no-build')) {
  const build = spawnSync('npm run build --silent', { cwd: root, stdio: 'inherit', shell: true });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

console.log(`Runner con ${envFile} -> ${env.BACKEND_INTERNAL_URL}`);
const child = spawn(process.execPath, [path.join('dist', 'src', 'runner', 'main.js')], { cwd: root, env, stdio: 'inherit' });
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => child.kill(s));
