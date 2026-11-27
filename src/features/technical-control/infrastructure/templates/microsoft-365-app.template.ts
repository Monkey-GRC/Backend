// Script de alta que el cliente corre en Azure Cloud Shell, en SU organización de Microsoft 365 (D154). Es la ÚNICA fuente: el backend lo sirve en
// `GET /v1/connection-templates/microsoft-365-app` y lo incrusta en el comando de `connection_setup.setup_command`.
//
// Qué crea y qué NO: una aplicación de solo lectura en el Microsoft Entra del cliente, con el certificado PÚBLICO que generó Monkey, permisos de aplicación de LECTURA
// de Microsoft Graph y el consentimiento del administrador. No crea secretos, no cambia ni borra nada de la organización. Es idempotente. El texto es del cliente:
// no nombra al motor de evaluación (D70).
//
// La lista de permisos es un acuerdo con el trabajador: éste exige que el token los traiga todos (`MICROSOFT_365_REQUIRED_ROLES`); una prueba comprueba que coinciden.
import { M365_GUID } from '../../../../common/catalogs/technical-catalogs';

// Los 13 permisos de aplicación de Microsoft Graph que el motor lista para evaluar el tenant (todos de LECTURA). Los que un tenant no ofrezca se omiten y se avisan.
export const MICROSOFT_365_GRAPH_PERMISSIONS = [
  'AccessReview.Read.All',
  'AuditLog.Read.All',
  'Directory.Read.All',
  'OnPremDirectorySynchronization.Read.All',
  'Policy.Read.All',
  'RoleManagementPolicy.Read.Directory',
  'SecurityIdentitiesHealth.Read.All',
  'SecurityIdentitiesSensors.Read.All',
  'SharePointTenantSettings.Read.All',
  'ThreatHunting.Read.All',
  'DeviceManagementServiceConfig.Read.All',
  'DeviceManagementConfiguration.Read.All',
  'DeviceManagementManagedDevices.Read.All',
] as const;

const HEREDOC_DELIMITER = 'MONKEY_SETUP';
// Un certificado PEM: una cabecera, líneas de base64 y un pie. Nada más entra al comando.
const PUBLIC_CERTIFICATE = /^-----BEGIN CERTIFICATE-----\n[A-Za-z0-9+/=\n]+-----END CERTIFICATE-----\n?$/;

export function renderMicrosoft365SetupScript(): string {
  return `#!/usr/bin/env bash
# Monkey - acceso de solo lectura a tu organización de Microsoft 365 (Microsoft Entra).
# Uso: bash monkey-m365-setup.sh ID_DEL_TENANT CERTIFICADO_PUBLICO_EN_BASE64
# Crea en tu Microsoft Entra una aplicación de solo lectura para Monkey, con el certificado público que te dimos, y la autoriza. No crea secretos.
# Puedes correrlo varias veces: no duplica nada. Debe correrlo un administrador global.
# Opcional: MONKEY_POWERSHELL=1 pide además el acceso de Exchange (lo necesitan los checks de correo y Teams).
set -euo pipefail

APP_NAME="Monkey (solo lectura)"
GRAPH_APP_ID="00000003-0000-0000-c000-000000000000"
# El identificador del rol integrado «Lector global» (Global Reader) es el mismo en todas las organizaciones.
GLOBAL_READER_ROLE_ID="f2ef992c-3afb-46b9-b7cf-a126ee74c451"
EXCHANGE_APP_ID="00000002-0000-0ff1-ce00-000000000000"
GRAPH_PERMISSIONS=(${MICROSOFT_365_GRAPH_PERMISSIONS.join(' ')})

fail() {
  echo "Error: $1" >&2
  exit "\${2:-1}"
}

# Resuelve el identificador de un permiso de aplicación por su nombre (el nombre no cambia de un tenant a otro; el identificador se pregunta, no se copia).
role_id() {
  local ROLES="$1" NAME="$2" VALUE ID
  while IFS=$'\\t' read -r VALUE ID; do
    if [ "$VALUE" = "$NAME" ]; then
      printf '%s\\n' "$ID"
      break
    fi
  done <<< "$ROLES"
}

requested_ids() {
  az ad app show --id "$1" --query "requiredResourceAccess[].resourceAccess[].id" --output tsv
}

# Cuántos de los permisos pedidos siguen SIN aprobar. El comando de consentimiento puede responder bien y dejar alguno fuera (p. ej. el recién pedido): hay que mirarlo.
pending_consent() {
  local APP_ID="$1" SP_ID="$2" GRANTED ID PENDING=0
  GRANTED="$(az rest --method GET --url "https://graph.microsoft.com/v1.0/servicePrincipals/$SP_ID/appRoleAssignments" --query "value[].appRoleId" --output tsv || true)"
  for ID in $(requested_ids "$APP_ID"); do
    if ! printf '%s\\n' "$GRANTED" | grep -qxF -- "$ID"; then
      PENDING=$((PENDING + 1))
    fi
  done
  echo "$PENDING"
}

# Agrega permisos de aplicación de una API a la aplicación. Un permiso que el tenant no ofrece se omite y se avisa.
add_permissions() {
  local APP_ID="$1" API_ID="$2"
  shift 2
  local ROLES NAME ID ADDED=0 REQUESTED
  ROLES="$(az ad sp show --id "$API_ID" --query "appRoles[?contains(allowedMemberTypes, 'Application')].[value, id]" --output tsv)"
  REQUESTED="$(requested_ids "$APP_ID")"
  for NAME in "$@"; do
    ID="$(role_id "$ROLES" "$NAME")"
    if [ -z "$ID" ]; then
      echo "   Aviso: tu organización no ofrece el permiso $NAME; se omite." >&2
      continue
    fi
    if ! printf '%s\\n' "$REQUESTED" | grep -qxF -- "$ID"; then
      az ad app permission add --id "$APP_ID" --api "$API_ID" --api-permissions "$ID=Role" >/dev/null 2>&1 || fail "no se pudo pedir el permiso $NAME."
    fi
    ADDED=$((ADDED + 1))
  done
  echo "   $ADDED permisos solicitados."
}

# El acceso de Exchange exige además el rol de directorio «Lector global». Si no queda asignado se dice: sin él, esos checks no corren y nadie sabría por qué.
assign_global_reader() {
  local SP_ID ROLES_URL FOUND ATTEMPT ERROR
  SP_ID="$(az ad sp show --id "$1" --query id --output tsv)"
  ROLES_URL="https://graph.microsoft.com/v1.0/roleManagement/directory/roleAssignments"
  FOUND="$(az rest --method GET --url "$ROLES_URL?\\$filter=principalId%20eq%20'$SP_ID'" --query "value[?roleDefinitionId=='$GLOBAL_READER_ROLE_ID'].id" --output tsv || true)"
  if [ -n "$FOUND" ]; then
    echo "   El rol de Lector global ya estaba asignado."
    return 0
  fi
  for ATTEMPT in 1 2 3; do
    if ERROR="$(az rest --method POST --url "$ROLES_URL" \\
      --body "{\\"principalId\\": \\"$SP_ID\\", \\"roleDefinitionId\\": \\"$GLOBAL_READER_ROLE_ID\\", \\"directoryScopeId\\": \\"/\\"}" 2>&1 >/dev/null)"; then
      echo "   Rol de Lector global asignado."
      return 0
    fi
    sleep 10
  done
  fail "no se pudo asignar el rol de Lector global: $ERROR"
}

main() {
  local TENANT_ID="\${1:-}" CERT_B64="\${2:-}"
  if ! [[ "$TENANT_ID" =~ ${M365_GUID.source} ]]; then
    fail "el ID del tenant no es válido." 2
  fi
  if ! [[ "$CERT_B64" =~ ^[A-Za-z0-9+/=]+$ ]] || [ "\${#CERT_B64}" -lt 100 ] || [ "\${#CERT_B64}" -gt 8000 ]; then
    fail "el certificado no es válido. Copia el comando completo desde Monkey." 2
  fi
  command -v az >/dev/null 2>&1 || fail "no se encontró az. Corre este comando en Azure Cloud Shell (modo Bash)."
  command -v openssl >/dev/null 2>&1 || fail "no se encontró openssl."

  echo "1/6 Comprobando tu organización..."
  local CURRENT
  CURRENT="$(az account show --query tenantId --output tsv 2>/dev/null || true)"
  if [ "$CURRENT" != "$TENANT_ID" ]; then
    fail "esta sesión es de otra organización (\${CURRENT:-sin sesión}). Abre Cloud Shell con la cuenta del tenant $TENANT_ID."
  fi

  # Global (no local): el trap corre cuando main ya terminó, y con set -u una variable local ya no existiría.
  CERT_FILE="$(mktemp)"
  trap 'rm -f "\${CERT_FILE:-}"' EXIT
  printf '%s' "$CERT_B64" | base64 -d > "$CERT_FILE"
  if ! head -n 1 "$CERT_FILE" | grep -q -- '-----BEGIN CERTIFICATE-----'; then
    fail "el certificado no es válido. Copia el comando completo desde Monkey." 2
  fi
  local THUMBPRINT
  THUMBPRINT="$(openssl x509 -in "$CERT_FILE" -noout -fingerprint -sha1 | sed 's/.*=//; s/://g' | tr 'a-f' 'A-F')"

  echo "2/6 Creando la aplicación de Monkey..."
  local APP_ID
  APP_ID="$(az ad app list --display-name "$APP_NAME" --query "[0].appId" --output tsv)"
  if [ -z "$APP_ID" ]; then
    APP_ID="$(az ad app create --display-name "$APP_NAME" --sign-in-audience AzureADMyOrg --query appId --output tsv)"
  fi
  if ! [[ "$APP_ID" =~ ${M365_GUID.source} ]]; then
    fail "no se pudo crear la aplicación. Revisa que eres administrador global."
  fi

  echo "3/6 Subiendo el certificado público..."
  if az ad app credential list --id "$APP_ID" --cert --query "[].customKeyIdentifier" --output tsv | tr 'a-f' 'A-F' | grep -q "$THUMBPRINT"; then
    echo "   El certificado ya estaba subido."
  else
    az ad app credential reset --id "$APP_ID" --cert "@$CERT_FILE" --append --query appId --output tsv >/dev/null
  fi

  echo "4/6 Creando la identidad de la aplicación..."
  if ! az ad sp show --id "$APP_ID" >/dev/null 2>&1; then
    az ad sp create --id "$APP_ID" >/dev/null
  fi

  echo "5/6 Pidiendo los permisos de solo lectura..."
  add_permissions "$APP_ID" "$GRAPH_APP_ID" "\${GRAPH_PERMISSIONS[@]}"
  if [ "\${MONKEY_POWERSHELL:-0}" = "1" ]; then
    echo "   Pidiendo también el acceso de Exchange..."
    add_permissions "$APP_ID" "$EXCHANGE_APP_ID" Exchange.ManageAsApp
    assign_global_reader "$APP_ID"
  fi

  echo "6/6 Dando el consentimiento del administrador..."
  local ATTEMPT PENDING SP_OBJECT_ID
  SP_OBJECT_ID="$(az ad sp show --id "$APP_ID" --query id --output tsv)"
  for ATTEMPT in 1 2 3 4 5 6; do
    # Una aplicación o un permiso recién creados tardan unos segundos en poder recibir el consentimiento.
    sleep 10
    az ad app permission admin-consent --id "$APP_ID" >/dev/null 2>&1 || true
    sleep 10
    PENDING="$(pending_consent "$APP_ID" "$SP_OBJECT_ID")"
    if [ "$PENDING" = "0" ]; then
      echo "   Todos los permisos quedaron aprobados."
      break
    fi
    if [ "$ATTEMPT" = "6" ]; then
      fail "quedaron $PENDING permisos sin aprobar. Revisa que eres administrador global y vuelve a correr el comando en unos minutos."
    fi
    echo "   Faltan $PENDING permisos por aprobar; reintentando..."
  done

  echo
  echo "=============================================================="
  echo " Listo. Copia este ID de la aplicación y pégalo en Monkey:"
  echo
  echo "   ID DE LA APLICACIÓN: \${APP_ID}"
  echo "=============================================================="
}

main "$@"
`;
}

// El comando que el cliente pega en Cloud Shell: el script completo dentro de un heredoc con comillas (nada se expande ni se publica en una URL) y los parámetros ya
// puestos. El certificado público viaja en base64 para que ningún salto de línea llegue al shell. Se valida otra vez aquí: ningún valor entra sin revisar.
export function buildMicrosoft365SetupCommand(tenantId: string, certificatePem: string): string {
  if (!M365_GUID.test(tenantId)) throw new Error('ID de tenant no válido.');
  if (!PUBLIC_CERTIFICATE.test(certificatePem)) throw new Error('Certificado público no válido.');
  const script = renderMicrosoft365SetupScript();
  if (script.split('\n').includes(HEREDOC_DELIMITER)) throw new Error('El script no puede contener el delimitador del comando.');
  const certificate = Buffer.from(certificatePem, 'utf8').toString('base64');
  return `bash -s -- ${tenantId.toLowerCase()} ${certificate} <<'${HEREDOC_DELIMITER}'\n${script}${HEREDOC_DELIMITER}\n`;
}
