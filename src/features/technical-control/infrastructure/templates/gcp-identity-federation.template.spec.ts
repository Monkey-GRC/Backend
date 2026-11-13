import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { GCP_FEDERATION_NAMES } from '../../../../runner/infrastructure/providers/gcp/gcp-credential-broker';
import { buildGcpSetupCommand, renderGcpSetupScript } from './gcp-identity-federation.template';

const ROLE = 'arn:aws:iam::210987654321:role/monkey-gcp-federation';
const PROJECT = 'acme-prod-421905';
const EXTERNAL = 'mk-3f9a1c7e2b4d5a6f7a8b';
const SCRIPT_FILE = join(mkdtempSync(join(tmpdir(), 'monkey-gcp-')), 'script.sh');
writeFileSync(SCRIPT_FILE, renderGcpSetupScript(ROLE));

describe('script de alta de GCP', () => {
  const script = renderGcpSetupScript(ROLE);

  it('hornea la cuenta de AWS de Monkey y el nombre del rol, y la condición que solo acepta la sesión de ese activo', () => {
    expect(script).toContain('MONKEY_AWS_ACCOUNT="210987654321"');
    expect(script).toContain('MONKEY_ROLE_NAME="monkey-gcp-federation"');
    expect(script).toContain('local SESSION_ARN="arn:aws:sts::${MONKEY_AWS_ACCOUNT}:assumed-role/${MONKEY_ROLE_NAME}/${EXTERNAL_ID}"');
    expect(script).toContain('local CONDITION="assertion.arn == \'${SESSION_ARN}\'"');
    expect(script).toContain('google.subject=assertion.arn');
  });

  it('crea el pool, el proveedor, la cuenta de solo lectura con sus tres roles y el permiso de la sesión, e imprime el número de proyecto', () => {
    for (const piece of [
      'POOL_ID="monkey-access"', 'PROVIDER_ID="monkey-aws"', 'SERVICE_ACCOUNT_ID="monkey-reader"',
      'iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com', 'cloudresourcemanager.googleapis.com serviceusage.googleapis.com logging.googleapis.com',
      'roles/viewer roles/iam.securityReviewer roles/stackdriver.accounts.viewer', '--condition=None', 'roles/iam.workloadIdentityUser',
      'principal://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/subject/${SESSION_ARN}',
      'providers create-aws', 'providers update-aws', 'NÚMERO DE PROYECTO: ${PROJECT_NUMBER}', 'set -euo pipefail',
    ]) expect(script).toContain(piece);
  });

  it('no nombra al motor ni a la sonda (D70)', () => {
    expect(script).not.toMatch(/prowler|wazuh/i);
    expect(buildGcpSetupCommand(ROLE, PROJECT, EXTERNAL)).not.toMatch(/prowler|wazuh/i);
  });

  it('es bash válido (bash -n) y, si hay shellcheck, pasa shellcheck', () => {
    const run = (cmd: string, args: string[]) => spawnSync(cmd, args, { input: script, encoding: 'utf8' });
    expect(run('bash', ['-n']).status).toBe(0);
    const probe = spawnSync('shellcheck', ['--version'], { encoding: 'utf8' });
    if (probe.error) return; // shellcheck no está instalado
    const check = run('shellcheck', ['-s', 'bash', '-']);
    expect(check.stdout).toBe('');
    expect(check.status).toBe(0);
  });

  it('valida los parámetros: un ID o un identificador malos se rechazan antes de llamar a nada', () => {
    const exec = (...args: string[]) => spawnSync('/bin/bash', ['-s', '--', ...args], { input: script, encoding: 'utf8', env: { PATH: '/usr/bin:/bin' } });
    for (const bad of [[], ['Mal-ID', EXTERNAL], ['acme-prod-421905; echo hola', EXTERNAL], [PROJECT, 'mk-$(id)'], [PROJECT, 'otro-1234567890'], [PROJECT]]) {
      const r = exec(...bad);
      expect(r.status).toBe(2);
      expect(r.stderr).toMatch(/no es válido/);
      expect(r.stdout).not.toContain('Buscando');
    }
  });

  it('con parámetros válidos y sin gcloud se detiene con un mensaje claro', () => {
    const r = spawnSync('/bin/bash', ['-s', '--', PROJECT, EXTERNAL], { input: script, encoding: 'utf8', env: { PATH: '/nonexistent' } });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('gcloud');
  });

  it('corre contra un gcloud de mentira: hace lo que dice, en orden, y es idempotente', () => {
    const out = execFileSync('bash', ['-c', FAKE_RUN(script)], { encoding: 'utf8' });
    expect(out).toContain('NÚMERO DE PROYECTO: 407295138461');
    const calls = out.split('\n').filter((l) => l.startsWith('GCLOUD '));
    const has = (s: string) => calls.some((c) => c.includes(s));
    expect(has('iam workload-identity-pools create monkey-access')).toBe(true);
    expect(has('providers create-aws monkey-aws')).toBe(true);
    expect(has(`--attribute-condition assertion.arn == 'arn:aws:sts::210987654321:assumed-role/monkey-gcp-federation/${EXTERNAL}'`)).toBe(true);
    expect(has('--account-id 210987654321')).toBe(true);
    expect(has(`iam service-accounts create monkey-reader`)).toBe(true);
    expect(calls.filter((c) => c.includes('projects add-iam-policy-binding acme-prod-421905')).length).toBe(3);
    expect(has(`--member principal://iam.googleapis.com/projects/407295138461/locations/global/workloadIdentityPools/monkey-access/subject/arn:aws:sts::210987654321:assumed-role/monkey-gcp-federation/${EXTERNAL}`)).toBe(true);
    // Segunda corrida con todo ya creado: no vuelve a crear nada.
    const again = execFileSync('bash', ['-c', FAKE_RUN(script, true)], { encoding: 'utf8' });
    expect(again).not.toMatch(/GCLOUD .* (pools create|providers create-aws|service-accounts create)/);
    expect(again).toMatch(/providers update-aws/);
  });
});

// Un `gcloud` falso en PATH que anota cada llamada. `existing`: todo lo del proyecto ya existe.
const FAKE_RUN = (_script: string, existing = false) => `
set -e
dir="$(mktemp -d)"
cat > "$dir/gcloud" <<'FAKE'
#!/usr/bin/env bash
echo "GCLOUD $*" >> "$GCLOUD_LOG"
case "$*" in
  "projects describe"*) echo 407295138461 ;;
  *"pools describe"*|*"providers describe"*) ${existing ? 'echo ACTIVE' : 'exit 1'} ;;
  *"service-accounts describe"*) ${existing ? 'exit 0' : 'exit 1'} ;;
esac
FAKE
chmod +x "$dir/gcloud"
cp ${SCRIPT_FILE} "$dir/setup.sh"
export GCLOUD_LOG="$dir/calls"
PATH="$dir:$PATH" bash "$dir/setup.sh" ${PROJECT} ${EXTERNAL}
cat "$dir/calls"
`;

describe('comando de alta de GCP (setup_command)', () => {
  const cmd = buildGcpSetupCommand(ROLE, PROJECT, EXTERNAL);

  it('lleva el script completo en un heredoc con comillas y los parámetros ya puestos', () => {
    expect(cmd.startsWith(`bash -s -- ${PROJECT} ${EXTERNAL} <<'MONKEY_SETUP'\n`)).toBe(true);
    expect(cmd.endsWith('\nMONKEY_SETUP\n')).toBe(true);
    expect(cmd).toContain(renderGcpSetupScript(ROLE));
    expect(cmd.split('\n').filter((l) => l === 'MONKEY_SETUP')).toHaveLength(1);
  });

  it('es bash válido', () => {
    expect(spawnSync('bash', ['-n'], { input: cmd, encoding: 'utf8' }).status).toBe(0);
  });

  it.each([['a; rm -rf /', EXTERNAL], ['ACME', EXTERNAL], [PROJECT, 'mk-1; id'], [PROJECT, "mk-'x'"], [PROJECT, 'otro']])('rechaza parámetros que no son del formato (%s, %s): no hay inyección posible', (p, e) => {
    expect(() => buildGcpSetupCommand(ROLE, p, e)).toThrow();
  });

  it('rechaza un rol de federación mal configurado', () => {
    expect(() => buildGcpSetupCommand('arn:aws:iam::1:role/x', PROJECT, EXTERNAL)).toThrow(/MONKEY_GCP_FEDERATION_ROLE_ARN/);
    expect(() => renderGcpSetupScript('arn:aws:iam::210987654321:role/path/name')).toThrow();
  });
});

// El script crea el grupo, el proveedor y la cuenta; el trabajador los usa por nombre. Si un lado cambia sin el otro, la conexión se rompe en silencio.
describe('acuerdo de nombres entre el script de alta y el trabajador', () => {
  it('el script crea exactamente lo que el trabajador busca', () => {
    const script = renderGcpSetupScript(ROLE);
    expect(script).toContain(`POOL_ID="${GCP_FEDERATION_NAMES.poolId}"`);
    expect(script).toContain(`PROVIDER_ID="${GCP_FEDERATION_NAMES.providerId}"`);
    expect(script).toContain(`SERVICE_ACCOUNT_ID="${GCP_FEDERATION_NAMES.serviceAccountId}"`);
  });
});
