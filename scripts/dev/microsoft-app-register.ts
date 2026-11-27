// Registra UNA vez la aplicación de Monkey que los clientes autorizan con «Conectar Microsoft 365» (D157), en la organización de Microsoft de Monkey.
// Uso, desde Backend:  npx tsx scripts/dev/microsoft-app-register.ts <id-del-tenant-de-monkey> [direccion-publica-de-la-api]   (por defecto http://localhost:3100/v1)
// Crea la llave y el certificado en ~/.monkey-microsoft-app/ (fuera de los repositorios), registra la aplicación con la CLI oficial de Microsoft en Docker (tú inicias sesión con
// un código) y deja escritas las variables para el Backend y el trabajador. Repetirlo no duplica la aplicación. No autoriza nada: autorizar es lo que hace el botón.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ForgeCertificateIssuer } from '../../src/features/technical-control/infrastructure/security/forge-certificate.issuer';
import { MICROSOFT_365_GRAPH_PERMISSIONS } from '../../src/features/technical-control/infrastructure/templates/microsoft-365-app.template';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const die = (message: string): never => {
  console.error(`✖ ${message}`);
  process.exit(1);
};

const [rawTenant, rawBase = 'http://localhost:3100/v1'] = process.argv.slice(2);
const tenant = rawTenant && GUID.test(rawTenant) ? rawTenant.toLowerCase() : die('Indica el ID del tenant de Monkey (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).');
const base = rawBase.replace(/\/+$/, '');
// Microsoft solo admite http en el propio equipo; en cualquier otra dirección exige https.
if (!/^(https:\/\/[^\s'"$`\\]+|http:\/\/localhost(:\d+)?(\/[A-Za-z0-9/_-]*)?)$/.test(base)) die('La dirección debe ser https://… (o http://localhost… para probar).');
const local = base.startsWith('http://localhost');
const name = local ? 'Monkey (pruebas en local)' : 'Monkey';

const dir = join(homedir(), '.monkey-microsoft-app');
const share = join(dir, 'registro');
mkdirSync(share, { recursive: true });
const keyFile = join(dir, 'llave.pem');
const certFile = join(dir, 'certificado.pem');
if (!existsSync(keyFile) || !existsSync(certFile)) {
  const issued = new ForgeCertificateIssuer().issue('aplicacion');
  writeFileSync(keyFile, issued.privateKeyPem, { mode: 0o600 });
  writeFileSync(certFile, issued.certificatePem);
}
// Al contenedor solo se le monta el certificado PÚBLICO y el guion. La llave se queda fuera.
writeFileSync(join(share, 'certificado.pem'), readFileSync(certFile, 'utf8'));
writeFileSync(
  join(share, 'registrar.sh'),
  `set -euo pipefail
NAME='${name}'
SIGNIN='${base}/integrations/microsoft/signin'
CONSENT='${base}/integrations/microsoft/consent'
GRAPH='00000003-0000-0000-c000-000000000000'
EXCHANGE='00000002-0000-0ff1-ce00-000000000000'

echo "1/4 Registrando la aplicación..."
APP_ID="$(az ad app list --display-name "$NAME" --query "[0].appId" --output tsv)"
if [ -z "$APP_ID" ]; then
  APP_ID="$(az ad app create --display-name "$NAME" --sign-in-audience AzureADMultipleOrgs --query appId --output tsv)"
fi

echo "2/4 Configurando a dónde vuelve el cliente..."
az ad app update --id "$APP_ID" --sign-in-audience AzureADMultipleOrgs --web-redirect-uris "$SIGNIN" "$CONSENT" --enable-id-token-issuance true >/dev/null
# Con esto la identidad firmada dice si quien inicia sesión es administrador.
az rest --method PATCH --url "https://graph.microsoft.com/v1.0/applications(appId='$APP_ID')" --body '{"groupMembershipClaims":"DirectoryRole"}' >/dev/null

echo "3/4 Subiendo el certificado público..."
if [ -z "$(az ad app credential list --id "$APP_ID" --cert --query "[].keyId" --output tsv)" ]; then
  az ad app credential reset --id "$APP_ID" --cert @/registro/certificado.pem --append --query appId --output tsv >/dev/null
fi

echo "4/4 Declarando los permisos de solo lectura que verá cada cliente..."
add() {
  local API="$1" NAME_WANTED="$2" ID HAVE
  ID="$(az ad sp show --id "$API" --query "appRoles[?value=='$NAME_WANTED' && contains(allowedMemberTypes, 'Application')].id | [0]" --output tsv)"
  if [ -z "$ID" ]; then echo "   Aviso: tu organización no ofrece $NAME_WANTED; se omite." >&2; return 0; fi
  HAVE="$(az ad app show --id "$APP_ID" --query "requiredResourceAccess[].resourceAccess[].id" --output tsv)"
  if ! printf '%s\\n' "$HAVE" | grep -qxF -- "$ID"; then
    az ad app permission add --id "$APP_ID" --api "$API" --api-permissions "$ID=Role" >/dev/null 2>&1
  fi
}
for PERMISSION in ${MICROSOFT_365_GRAPH_PERMISSIONS.join(' ')}; do add "$GRAPH" "$PERMISSION"; done
add "$EXCHANGE" Exchange.ManageAsApp

echo "$APP_ID" > /salida/id-aplicacion.txt
echo
echo " Listo. ID de la aplicación de Monkey: $APP_ID"
`,
);

const out = join(dir, 'salida');
mkdirSync(out, { recursive: true });
console.log('\nCuando aparezca un enlace y un código, ábrelo e inicia sesión con un administrador. No cierres esta terminal hasta que diga «Listo».\n');
const run = spawnSync(
  'docker',
  ['run', '--rm', '-i', ...(process.stdin.isTTY ? ['-t'] : []), '-v', `${share}:/registro:ro`, '-v', `${out}:/salida`, '-e', 'AZURE_CORE_LOGIN_EXPERIENCE_V2=off', 'mcr.microsoft.com/azure-cli:latest', 'bash', '-c',
    `az login --use-device-code --allow-no-subscriptions --tenant ${tenant} --output none && bash /registro/registrar.sh`],
  { stdio: 'inherit' },
);
if (run.status !== 0) die('El registro no terminó. Copia las últimas líneas y pásamelas (sin tu correo ni el código).');
const clientId = readFileSync(join(out, 'id-aplicacion.txt'), 'utf8').trim();
const settings = join(dir, 'variables.env');
writeFileSync(
  settings,
  [`# Backend`, `M365_APP_CLIENT_ID=${clientId}`, `M365_CALLBACK_BASE_URL=${base}`, ``, `# Trabajador (las rutas son las de este equipo)`, `M365_APP_CLIENT_ID=${clientId}`, `M365_APP_KEY_FILE=${keyFile}`, `M365_APP_CERT_FILE=${certFile}`, ''].join('\n'),
);
console.log(`\n✔ Variables guardadas en ${settings}\nLa llave queda en ${keyFile}: no la compartas ni la subas a ningún repositorio.`);
