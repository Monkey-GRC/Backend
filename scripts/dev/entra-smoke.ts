// Prueba manual contra una organización REAL de Microsoft (D154), con las MISMAS piezas de la aplicación y SIN base de datos ni Backend.
//   preparar  <tenant>                         genera el certificado y el comando para Azure Cloud Shell
//   alta      <tenant> [exchange]              lo mismo sin Cloud Shell (que exige una suscripción de Azure): corre el comando en Docker. Necesita tu terminal
//   validar   <tenant> <id-aplicacion>         comprueba el acceso (y si Microsoft acepta reutilizar el permiso firmado, de lo que depende Azure)
//   m365      <tenant> <id-aplicacion>         corre la evaluación de Microsoft 365 en Docker
//   azure     <tenant> <id-aplicacion> <suscripcion...>   EXPERIMENTO: evalúa Azure sin entregar ninguna llave al motor
// Todo (incluida la llave privada y los resultados) queda en ~/.monkey-smoke/<tenant>/, fuera de los repositorios. Al terminar: bórrala y elimina la aplicación en Entra.
// Uso, desde Backend:  npx tsx scripts/dev/entra-smoke.ts preparar <tenant>
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import Docker from 'dockerode';
import { buildMicrosoft365SetupCommand } from '../../src/features/technical-control/infrastructure/templates/microsoft-365-app.template';
import { ForgeCertificateIssuer } from '../../src/features/technical-control/infrastructure/security/forge-certificate.issuer';
import { RunnerFailure, RunnerJob } from '../../src/runner/domain/runner.types';
import { DockerScanEngine } from '../../src/runner/infrastructure/docker-scan-engine';
import { commonEngineArgs, ENGINE_OUTPUT_PATH } from '../../src/runner/infrastructure/providers/engine-common';
import { buildClientAssertion } from '../../src/runner/infrastructure/providers/microsoft365/microsoft-365-client-assertion';
import { Microsoft365CredentialBroker } from '../../src/runner/infrastructure/providers/microsoft365/microsoft-365-credential-broker';
import { prowlerMicrosoft365Profile } from '../../src/runner/infrastructure/providers/microsoft365/microsoft-365-engine-profile';

const IMAGE = process.env['ENGINE_IMAGE'] || 'toniblyx/prowler@sha256:9dbcc3c9abd71ec6d37610e6a5a2c45279bc6488caf8aaa948a9e8e368622d30';
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type State = { privateKeyPem: string; certificatePem: string; thumbprint: string };

const die = (message: string): never => {
  console.error(`✖ ${message}`);
  process.exit(1);
};
const guid = (value: string | undefined, name: string): string => (value && GUID.test(value) ? value.toLowerCase() : die(`${name} debe ser un identificador con forma xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.`));
const dirOf = (tenant: string) => join(homedir(), '.monkey-smoke', tenant);
const stateOf = (tenant: string): State => {
  const file = join(dirOf(tenant), 'certificado.json');
  if (!existsSync(file)) die('Primero corre «preparar» para este tenant.');
  return JSON.parse(readFileSync(file, 'utf8')) as State;
};
const jobOf = (tenant: string, clientId: string, s: State): RunnerJob => ({
  executionId: 'smoke', kind: 'validation', tenantId: 'smoke', assetId: 'smoke', origin: 'manual', platform: 'microsoft_365', externalAccountId: tenant, regions: [],
  connection: { method: 'app_certificate', clientId, certificateThumbprint: s.thumbprint, privateKeyPem: s.privateKeyPem },
});

function prepare(tenant: string, quiet = false): void {
  const dir = dirOf(tenant);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, 'certificado.json');
  if (!existsSync(file)) writeFileSync(file, JSON.stringify(new ForgeCertificateIssuer().issue('prueba')), { mode: 0o600 });
  const command = join(dir, 'comando-cloud-shell.txt');
  writeFileSync(command, buildMicrosoft365SetupCommand(tenant, stateOf(tenant).certificatePem));
  if (!quiet) console.log(`✔ Certificado listo.\n\nAbre este archivo, copia TODO su contenido y pégalo en Azure Cloud Shell (modo Bash):\n  ${command}\n\nAl terminar, el comando imprime el ID DE LA APLICACIÓN. Cópialo: es el segundo dato de los pasos siguientes.`);
}

// Cloud Shell exige una suscripción de Azure y una organización de solo Microsoft 365 no tiene. Aquí el mismo comando corre en la imagen oficial de la CLI de Microsoft.
// Tú inicias sesión con un código en tu navegador; la sesión vive dentro del contenedor y se borra con él. Solo se monta el comando: la llave privada no entra.
// Con «exchange» pide además el permiso de Exchange y el rol de Lector global (DT-131).
function onboard(tenant: string, exchange: boolean): void {
  prepare(tenant, true);
  const folder = join(dirOf(tenant), 'alta');
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, 'comando.txt'), readFileSync(join(dirOf(tenant), 'comando-cloud-shell.txt'), 'utf8'));
  console.log('\nCuando aparezca un enlace y un código, ábrelo en el navegador e inicia sesión con tu administrador.\n');
  const run = spawnSync('docker', ['run', '--rm', '-i', ...(process.stdin.isTTY ? ['-t'] : []), '-v', `${folder}:/alta:ro`, '-e', 'AZURE_CORE_LOGIN_EXPERIENCE_V2=off', '-e', `MONKEY_POWERSHELL=${exchange ? '1' : '0'}`,
    'mcr.microsoft.com/azure-cli:latest', 'bash', '-c', `az login --use-device-code --allow-no-subscriptions --tenant ${tenant} --output none && bash /alta/comando.txt`], { stdio: 'inherit' });
  if (run.status !== 0) die('El alta no terminó. Copia las últimas líneas y pásamelas (sin tu correo).');
}

// Pide un token con una aserción dada. Solo devuelve el código HTTP, los códigos de error de Microsoft (AADSTSnnnnn) y el token: nunca vuelca el cuerpo.
async function token(tenant: string, clientId: string, assertion: string, scope: string): Promise<{ status: number; codes: string; token: string | null }> {
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, scope, client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer', client_assertion: assertion }).toString(),
  });
  const body = (await res.json().catch(() => ({}))) as { access_token?: string; error_codes?: number[] };
  return { status: res.status, codes: (body.error_codes ?? []).map((c) => `AADSTS${c}`).join(' '), token: body.access_token ?? null };
}

const assertionFor = (tenant: string, clientId: string, s: State, lifetimeSeconds: number) =>
  buildClientAssertion({ tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, clientId, thumbprint: s.thumbprint, privateKeyPem: s.privateKeyPem, now: new Date(), lifetimeSeconds });

async function validate(tenant: string, clientId: string): Promise<void> {
  const s = stateOf(tenant);
  console.log('1) Validación de Microsoft 365 (la misma que usará la aplicación)…');
  try {
    await new Microsoft365CredentialBroker().obtain(jobOf(tenant, clientId, s));
    console.log('   ✔ Conexión válida: el certificado sirve, la organización es la declarada y están los permisos necesarios.');
  } catch (e) {
    console.log(`   ✖ ${e instanceof RunnerFailure ? `${e.reason} (${e.message})` : (e as Error).message}`);
  }
  console.log('\n2) Prueba para Azure: el MISMO permiso firmado, usado dos veces y con 30 minutos de vida…');
  const assertion = assertionFor(tenant, clientId, s, 1800);
  const graph = await token(tenant, clientId, assertion, 'https://graph.microsoft.com/.default');
  const arm = await token(tenant, clientId, assertion, 'https://management.azure.com/.default');
  console.log(`   Primer uso (directorio):  HTTP ${graph.status} ${graph.codes}`);
  console.log(`   Segundo uso (Azure):      HTTP ${arm.status} ${arm.codes}`);
  console.log(graph.token && arm.token ? '   ✔ Microsoft lo acepta: Azure puede conectarse sin entregar llaves al motor.' : '   ✖ No se aceptó. Copia estas dos líneas y pásamelas.');
  if (!arm.token) return;
  const res = await fetch('https://management.azure.com/subscriptions?api-version=2022-12-01', { headers: { Authorization: `Bearer ${arm.token}` } });
  const list = ((await res.json().catch(() => ({}))) as { value?: { subscriptionId: string; displayName: string }[] }).value ?? [];
  console.log(`\n3) Suscripciones de Azure que la aplicación puede leer: ${list.length}`);
  for (const sub of list) console.log(`   - ${sub.subscriptionId}  ${sub.displayName}`);
  if (list.length === 0) console.log('   Ninguna todavía: falta darle el rol «Reader» (paso de Azure de la guía).');
}

type Finding = { status_code?: string; metadata?: { event_code?: string } };

function summarize(platform: string, file: string, findings: Finding[]): void {
  writeFileSync(file, JSON.stringify(findings));
  const byStatus = new Map<string, number>();
  for (const f of findings) byStatus.set(f.status_code ?? 'sin estado', (byStatus.get(f.status_code ?? 'sin estado') ?? 0) + 1);
  const seen = new Set(findings.map((f) => f.metadata?.event_code).filter(Boolean) as string[]);
  const catalog = JSON.parse(readFileSync(join(__dirname, '..', '..', 'prisma', 'seed', 'data', 'catalog-v2.json'), 'utf8')) as { testChecks: { platform: string | null; checkId: string | null; role: string }[] };
  const links = catalog.testChecks.filter((l) => l.platform === platform && l.checkId);
  const linked = new Set(links.map((l) => l.checkId as string));
  const direct = new Set(links.filter((l) => l.role === 'direct').map((l) => l.checkId as string));
  const missing = [...linked].filter((c) => !seen.has(c));
  console.log(`\n✔ ${findings.length} resultados de ${seen.size} verificaciones. Por estado: ${[...byStatus].map(([k, v]) => `${k}=${v}`).join(', ')}`);
  console.log(`  Verificaciones que CUENTAN para la matriz: llegaron ${linked.size - missing.length} de ${linked.size}; de las que DECIDEN: ${[...direct].filter((c) => seen.has(c)).length} de ${direct.size}.`);
  if (missing.length) console.log(`  No llegaron:\n   - ${missing.sort().join('\n   - ')}`);
  console.log(`  Detalle completo (datos de tu organización, no lo compartas fuera): ${file}`);
}

async function scanM365(tenant: string, clientId: string): Promise<void> {
  const s = stateOf(tenant);
  const credentials = await new Microsoft365CredentialBroker().obtain({ ...jobOf(tenant, clientId, s), kind: 'assessment' });
  console.log('Evaluando Microsoft 365 (puede tardar varios minutos)…');
  const engine = new DockerScanEngine(new Docker(), () => prowlerMicrosoft365Profile(IMAGE), { timeoutMs: 25 * 60_000, memoryBytes: 2048 * 1024 * 1024, cpus: 2 }, 'smoke');
  let shown = -1;
  const onProgress = (done: number, total: number) => {
    const step = Math.floor((done / total) * 10);
    if (step > shown) {
      shown = step;
      console.log(`  avance real: ${done} de ${total} verificaciones`);
    }
  };
  const run = await engine.run({ executionId: 'smoke-m365', accountId: tenant, regions: [], credentials, onProgress });
  summarize('microsoft_365', join(dirOf(tenant), 'resultado-m365.json'), run.findings as Finding[]);
}

// EXPERIMENTO, aún no es parte de la aplicación. El motor no admite certificado para Azure, pero la librería de Microsoft que trae lee un permiso firmado desde un archivo:
// el motor recibe SOLO ese permiso (caduca en 30 minutos), nunca la llave privada.
function scanAzure(tenant: string, clientId: string, subscriptions: string[]): void {
  const dir = dirOf(tenant);
  const tokenFile = join(dir, 'permiso-temporal');
  writeFileSync(tokenFile, assertionFor(tenant, clientId, stateOf(tenant), 1800), { mode: 0o644 });
  const docker = (...args: string[]) => execFileSync('docker', args, { encoding: 'utf8' }).trim();
  const env = [`AZURE_TENANT_ID=${tenant}`, `AZURE_CLIENT_ID=${clientId}`, 'AZURE_AUTHORITY_HOST=https://login.microsoftonline.com', 'AZURE_FEDERATED_TOKEN_FILE=/tmp/permiso-temporal'];
  const id = docker('create', '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges:true', '--memory', '2g', '--cpus', '2', ...env.flatMap((e) => ['-e', e]), IMAGE,
    'azure', '--managed-identity-auth', '--subscription-ids', ...subscriptions, ...commonEngineArgs());
  try {
    docker('cp', tokenFile, `${id}:/tmp/permiso-temporal`);
    console.log('Evaluando Azure (puede tardar varios minutos)…');
    const run = spawnSync('docker', ['start', '--attach', id], { stdio: 'inherit', timeout: 25 * 60_000 });
    // `throw`, no `die`: `process.exit` se saltaría el `finally` que borra el contenedor y el permiso.
    if (run.status !== 0) throw new Error(`El motor terminó con código ${run.status}. Copia los últimos mensajes y pásamelos (sin identificadores si no quieres compartirlos).`);
    const out = join(dir, 'resultado-azure.json');
    docker('cp', `${id}:${ENGINE_OUTPUT_PATH}`, out);
    summarize('azure', out, JSON.parse(readFileSync(out, 'utf8')) as Finding[]);
  } finally {
    docker('rm', '--force', id);
    rmSync(tokenFile, { force: true });
  }
}

async function main(): Promise<void> {
  const [step, rawTenant, rawClient, ...rest] = process.argv.slice(2);
  if (!['alta', 'preparar', 'validar', 'm365', 'azure'].includes(step ?? '')) die('Pasos: preparar <tenant> · validar <tenant> <app> · m365 <tenant> <app> · azure <tenant> <app> <suscripcion...>');
  const tenant = guid(rawTenant, 'El ID del tenant');
  if (step === 'preparar') return prepare(tenant);
  if (step === 'alta') return onboard(tenant, rawClient === 'exchange');
  const clientId = guid(rawClient, 'El ID de la aplicación');
  if (step === 'validar') return validate(tenant, clientId);
  if (step === 'm365') return scanM365(tenant, clientId);
  if (rest.length === 0) die('Indica al menos un ID de suscripción.');
  scanAzure(tenant, clientId, rest.map((r) => guid(r, 'El ID de la suscripción')));
}

main().catch((e: unknown) => die(e instanceof RunnerFailure ? `${e.reason} (${e.message})` : e instanceof Error ? e.message : 'error desconocido'));
