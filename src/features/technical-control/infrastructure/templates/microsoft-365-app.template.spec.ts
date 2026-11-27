import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MICROSOFT_365_REQUIRED_ROLES } from '../../../../runner/infrastructure/providers/microsoft365/microsoft-365-credential-broker';
import { ForgeCertificateIssuer } from '../security/forge-certificate.issuer';
import { MICROSOFT_365_GRAPH_PERMISSIONS, buildMicrosoft365SetupCommand, renderMicrosoft365SetupScript } from './microsoft-365-app.template';

const TENANT = '3f2a91c4-7b6d-4e0a-9c11-5d8e2f7a0b13';
const APP_ID = '0b8c3e1a-2d4f-4a6b-8c9d-1e2f3a4b5c6d';

// En Windows el `bash` es el de Git: sus rutas son /c/Users/…, no C:\\Users\\….
const posix = (p: string): string => (process.platform === 'win32' ? p.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_m, d: string) => `/${d.toLowerCase()}`) : p);

// Un `az` de mentira: apunta cada llamada en un registro y contesta lo mínimo que el script pregunta. Así se prueba el orden, la idempotencia y los avisos sin una organización real.
const FAKE_AZ = `#!/usr/bin/env bash
echo "az $*" >> "$AZ_LOG"
case "$*" in
  "account show"*) echo "$FAKE_TENANT" ;;
  "ad app list"*) if [ -n "\${FAKE_APP_ID:-}" ]; then echo "$FAKE_APP_ID"; fi ;;
  "ad app create"*) echo "${APP_ID}" ;;
  "ad app credential list"*) if [ -n "\${FAKE_CERT_THUMB:-}" ]; then echo "$FAKE_CERT_THUMB"; fi ;;
  "ad app credential reset"*) echo "${APP_ID}" ;;
  "ad sp show --id 00000003"*) cat "$FAKE_GRAPH_ROLES" ;;
  "ad sp show --id 00000002"*) printf 'Exchange.ManageAsApp\\tid-exchange\\n' ;;
  "ad sp show --id ${APP_ID} --query id"*) echo "sp-object-id" ;;
  "ad sp show --id ${APP_ID}"*) if [ -n "\${FAKE_SP_MISSING:-}" ]; then exit 1; fi ;;
  "ad sp create"*) echo "sp" ;;
  "ad app show"*) cat "$AZ_LOG.requested" 2>/dev/null || true ;;
  "ad app permission add"*) for last; do :; done; echo "\${last%=Role}" >> "$AZ_LOG.requested" ;;
  "ad app permission admin-consent"*)
    if [ -n "\${FAKE_CONSENT_FAILS:-}" ]; then exit 1; fi
    if [ -n "\${FAKE_CONSENT_PARTIAL:-}" ]; then grep -v '^id-exchange$' "$AZ_LOG.requested" > "$AZ_LOG.granted" || true; else cp "$AZ_LOG.requested" "$AZ_LOG.granted"; fi ;;
  "rest --method GET"*appRoleAssignments*) cat "$AZ_LOG.granted" 2>/dev/null || true ;;
  "rest --method GET"*) if [ -n "\${FAKE_ROLE_ASSIGNED:-}" ]; then echo "assignment-id"; fi ;;
  "rest --method POST"*) if [ -n "\${FAKE_ROLE_FAILS:-}" ]; then echo "Insufficient privileges" >&2; exit 1; fi ;;
  *) echo "az: llamada no esperada: $*" >&2; exit 99 ;;
esac
`;

describe('Script de alta de Microsoft 365 (D154)', () => {
  let dir: string;
  let certPem: string;
  let certB64: string;
  const script = renderMicrosoft365SetupScript();
  const rolesFile = () => join(dir, 'roles.tsv');

  beforeAll(() => {
    certPem = new ForgeCertificateIssuer().issue('prueba').certificatePem;
    certB64 = Buffer.from(certPem, 'utf8').toString('base64');
    dir = mkdtempSync(join(tmpdir(), 'monkey-m365-'));
    writeFileSync(join(dir, 'az'), FAKE_AZ);
    writeFileSync(join(dir, 'sleep'), '#!/usr/bin/env bash\nexit 0\n');
    chmodSync(join(dir, 'az'), 0o755);
    chmodSync(join(dir, 'sleep'), 0o755);
    // El tenant ofrece todos los permisos menos uno: el script lo omite y avisa.
    writeFileSync(rolesFile(), MICROSOFT_365_GRAPH_PERMISSIONS.filter((p) => p !== 'ThreatHunting.Read.All').map((p, i) => `${p}\tid-${i}`).join('\n') + '\n');
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  const run = (over: { tenant?: string; cert?: string; env?: Record<string, string>; log?: string } = {}) => {
    const log = over.log ?? join(dir, `az-${Math.random().toString(36).slice(2)}.log`);
    writeFileSync(log, '');
    const result = spawnSync('bash', ['-c', 'export PATH="$FAKE_DIR:$PATH"; exec bash -s -- "$@"', '_', over.tenant ?? TENANT, over.cert ?? certB64], {
      input: script,
      encoding: 'utf8',
      env: { ...process.env, FAKE_DIR: posix(dir), AZ_LOG: posix(log), FAKE_TENANT: TENANT, FAKE_GRAPH_ROLES: posix(rolesFile()), ...over.env },
    });
    const calls = readFileSync(log, 'utf8').split('\n').filter(Boolean);
    return { status: result.status, out: result.stdout, err: result.stderr, calls };
  };

  it('el script es bash válido', () => {
    const r = spawnSync('bash', ['-n'], { input: script, encoding: 'utf8' });
    expect(r.status).toBe(0);
  });

  it('en una organización nueva: crea la aplicación, sube el certificado SIN secretos, pide solo permisos de lectura, da el consentimiento e imprime el ID', () => {
    const r = run();
    expect(r.status).toBe(0);
    expect(r.out).toContain(`ID DE LA APLICACIÓN: ${APP_ID}`);
    const creates = r.calls.filter((c) => c.startsWith('az ad app create'));
    expect(creates).toHaveLength(1);
    expect(creates[0]).toContain('--sign-in-audience AzureADMyOrg'); // solo para esta organización
    const reset = r.calls.filter((c) => c.startsWith('az ad app credential reset'));
    expect(reset).toHaveLength(1);
    expect(reset[0]).toMatch(/--cert @\S+ --append/); // el certificado público, sin pisar lo que ya tuviera la aplicación
    expect(r.calls.some((c) => /--password|--secret|client-secret/i.test(c))).toBe(false);
    // Un permiso por cada uno que la organización ofrece (13 menos el que no), todos de aplicación (`=Role`) y de lectura.
    const added = r.calls.filter((c) => c.startsWith('az ad app permission add'));
    expect(added).toHaveLength(MICROSOFT_365_GRAPH_PERMISSIONS.length - 1);
    for (const c of added) expect(c).toMatch(/--api 00000003-0000-0000-c000-000000000000 --api-permissions \S+=Role$/);
    expect(r.calls.some((c) => c.startsWith('az ad app permission admin-consent'))).toBe(true);
    // El que la organización no ofrece se avisa, y no detiene el alta.
    expect(r.err).toContain('ThreatHunting.Read.All');
    // Sin la opción de Exchange no se toca el rol ni la API de Exchange.
    expect(r.calls.some((c) => c.startsWith('az rest --method POST') || c.includes('roleAssignments?') || c.includes('00000002-0000-0ff1'))).toBe(false);
  });

  it('es idempotente: si la aplicación y el certificado ya están, no crea ni sube nada otra vez', () => {
    const thumb = spawnSync('openssl', ['x509', '-noout', '-fingerprint', '-sha1'], { input: certPem, encoding: 'utf8' }).stdout.replace(/.*=/, '').replace(/:/g, '').trim().toLowerCase();
    const r = run({ env: { FAKE_APP_ID: APP_ID, FAKE_CERT_THUMB: thumb } });
    expect(r.status).toBe(0);
    expect(r.out).toContain('El certificado ya estaba subido');
    expect(r.calls.some((c) => c.startsWith('az ad app create'))).toBe(false);
    expect(r.calls.some((c) => c.startsWith('az ad app credential reset'))).toBe(false);
    expect(r.out).toContain(`ID DE LA APLICACIÓN: ${APP_ID}`);
  });

  it('una aplicación existente sin identidad la recibe; con identidad no se crea otra', () => {
    expect(run({ env: { FAKE_APP_ID: APP_ID, FAKE_SP_MISSING: '1' } }).calls.some((c) => c.startsWith('az ad sp create'))).toBe(true);
    expect(run({ env: { FAKE_APP_ID: APP_ID } }).calls.some((c) => c.startsWith('az ad sp create'))).toBe(false);
  });

  it('si la sesión de Cloud Shell es de OTRA organización, no crea nada', () => {
    const r = run({ env: { FAKE_TENANT: '11111111-2222-4333-8444-555555555555' } });
    expect(r.status).toBe(1);
    expect(r.err).toContain('otra organización');
    expect(r.calls.some((c) => c.startsWith('az ad app create') || c.includes('credential reset'))).toBe(false);
  });

  it('rechaza un tenant o un certificado con forma rara, antes de hablar con Microsoft', () => {
    for (const bad of [{ tenant: 'no-es-un-guid' }, { tenant: `${TENANT}; echo hola` }, { cert: 'corto' }, { cert: `${certB64}$(touch x)` }]) {
      const r = run(bad);
      expect(r.status).toBe(2);
      expect(r.calls).toEqual([]);
    }
  });

  it('un certificado en base64 que no es un certificado se rechaza', () => {
    const r = run({ cert: Buffer.from('x'.repeat(300)).toString('base64') });
    expect(r.status).toBe(2);
    expect(r.calls.some((c) => c.startsWith('az ad app create'))).toBe(false);
  });

  it('si el consentimiento no se puede dar tras los reintentos, falla diciendo qué hacer', () => {
    const r = run({ env: { FAKE_CONSENT_FAILS: '1' } });
    expect(r.status).toBe(1);
    expect(r.err).toContain('administrador global');
    expect(r.calls.filter((c) => c.startsWith('az ad app permission admin-consent'))).toHaveLength(6);
  });

  it('con MONKEY_POWERSHELL=1 pide además el acceso de Exchange y el rol de lectura global', () => {
    const r = run({ env: { MONKEY_POWERSHELL: '1' } });
    expect(r.status).toBe(0);
    expect(r.calls.some((c) => c.includes('--id 00000002-0000-0ff1-ce00-000000000000'))).toBe(true);
    expect(r.calls.some((c) => c.startsWith('az rest --method POST') && c.includes('roleAssignments'))).toBe(true);
  });

  it('si Microsoft aprueba solo una parte de los permisos, no dice «Listo»', () => {
    const r = run({ env: { MONKEY_POWERSHELL: '1', FAKE_CONSENT_PARTIAL: '1' } });
    expect(r.status).not.toBe(0);
    expect(r.err).toContain('1 permisos sin aprobar');
    expect(r.out).not.toContain('ID DE LA APLICACIÓN');
  });

  it('no vuelve a pedir un permiso que la aplicación ya tiene pedido', () => {
    const log = join(dir, 'repetido.log');
    writeFileSync(log + '.requested', MICROSOFT_365_GRAPH_PERMISSIONS.filter((p) => p !== 'ThreatHunting.Read.All').map((_p, i) => `id-${i}`).join('\n') + '\n');
    const r = run({ env: { AZ_LOG: posix(log) }, log });
    expect(r.status).toBe(0);
    expect(r.calls.some((c) => c.startsWith('az ad app permission add'))).toBe(false);
  });

  it('si el rol de lectura global no se puede asignar, lo dice y no termina como si todo hubiera salido bien', () => {
    const r = run({ env: { MONKEY_POWERSHELL: '1', FAKE_ROLE_FAILS: '1' } });
    expect(r.status).not.toBe(0);
    expect(r.err).toContain('Insufficient privileges');
    expect(r.out).not.toContain('ID DE LA APLICACIÓN');
  });

  it('si el rol ya estaba asignado, no lo asigna otra vez', () => {
    const r = run({ env: { MONKEY_POWERSHELL: '1', FAKE_ROLE_ASSIGNED: '1' } });
    expect(r.status).toBe(0);
    expect(r.calls.some((c) => c.startsWith('az rest --method POST'))).toBe(false);
  });

  it('el script pide cada permiso que el trabajador exige para validar (el acuerdo entre los dos lados)', () => {
    for (const role of MICROSOFT_365_REQUIRED_ROLES) expect(MICROSOFT_365_GRAPH_PERMISSIONS).toContain(role);
    // Y todos son de LECTURA: nada que cambie o borre algo de la organización.
    for (const permission of MICROSOFT_365_GRAPH_PERMISSIONS) expect(permission).toMatch(/\.Read\./);
  });

  it('el texto del script nunca nombra al motor de evaluación (D70)', () => {
    expect(script).not.toMatch(/prowler/i);
  });
});

describe('Comando de alta de Microsoft 365', () => {
  const pem = new ForgeCertificateIssuer().issue('prueba').certificatePem;

  it('lleva el tenant, el certificado público en base64 y el script completo en un heredoc con comillas', () => {
    const cmd = buildMicrosoft365SetupCommand(TENANT.toUpperCase(), pem);
    const [first, ...rest] = cmd.split('\n');
    expect(first).toMatch(new RegExp(`^bash -s -- ${TENANT} [A-Za-z0-9+/=]+ <<'MONKEY_SETUP'$`));
    expect(Buffer.from(first.split(' ')[4], 'base64').toString('utf8')).toBe(pem);
    expect(rest.join('\n')).toContain(renderMicrosoft365SetupScript());
    expect(cmd.trimEnd().endsWith('MONKEY_SETUP')).toBe(true);
  });

  it('nunca lleva la clave privada ni el PFX: solo el certificado público', () => {
    const cmd = buildMicrosoft365SetupCommand(TENANT, pem);
    expect(cmd).not.toContain('PRIVATE KEY');
    expect(Buffer.from(cmd.split('\n')[0].split(' ')[4], 'base64').toString('utf8')).not.toContain('PRIVATE');
  });

  it('no deja pasar un tenant ni un certificado que no sean de la forma esperada', () => {
    expect(() => buildMicrosoft365SetupCommand('x; rm -rf /', pem)).toThrow();
    expect(() => buildMicrosoft365SetupCommand(TENANT, '$(touch x)')).toThrow();
    expect(() => buildMicrosoft365SetupCommand(TENANT, pem.replace('BEGIN CERTIFICATE', 'BEGIN PRIVATE KEY'))).toThrow();
  });
});
