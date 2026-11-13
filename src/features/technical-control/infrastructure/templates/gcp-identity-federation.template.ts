// Script de alta que el cliente corre en Cloud Shell, en SU proyecto de Google Cloud (D112). Es la ÚNICA fuente: el backend lo sirve en
// `GET /v1/connection-templates/gcp-identity-federation` y lo incrusta en el comando de `connection_setup.setup_command`.
//
// Qué crea y qué NO: un pool de identidades y un proveedor que SOLO aceptan la sesión de AWS de Monkey con el nombre de este activo, y una cuenta de
// servicio de solo lectura que esa sesión puede usar. No crea claves, no cambia ni borra nada del cliente. Es idempotente. El texto es del cliente:
// no nombra al motor de evaluación (D70).
import { GCP_PROJECT_ID } from '../../../../common/catalogs/technical-catalogs';

// `arn:aws:iam::<cuenta>:role/<nombre>` sin ruta: la sesión asumida no lleva la ruta, y así el ARN de la sesión se arma sin ambigüedad.
const FEDERATION_ROLE_ARN = /^arn:aws:iam::(\d{12}):role\/([\w+=,.@-]{1,64})$/;
// Lo que el comando recibe como parámetro: nada más entra al script.
const EXTERNAL_ID = /^mk-[A-Za-z0-9]{8,40}$/;
const HEREDOC_DELIMITER = 'MONKEY_SETUP';

export function parseFederationRoleArn(arn: string): { account: string; roleName: string } {
  const match = FEDERATION_ROLE_ARN.exec(arn.trim());
  if (!match) throw new Error('MONKEY_GCP_FEDERATION_ROLE_ARN no tiene la forma arn:aws:iam::<12 dígitos>:role/<nombre>.');
  return { account: match[1], roleName: match[2] };
}

export function renderGcpSetupScript(federationRoleArn: string): string {
  const { account, roleName } = parseFederationRoleArn(federationRoleArn);
  return `#!/usr/bin/env bash
# Monkey - acceso de solo lectura a tu proyecto de Google Cloud.
# Uso: bash monkey-gcp-setup.sh ID_DEL_PROYECTO IDENTIFICADOR_EXTERNO
# Crea en tu proyecto un acceso de solo lectura para Monkey, sin claves. Puedes correrlo varias veces: no duplica nada.
set -euo pipefail

MONKEY_AWS_ACCOUNT="${account}"
MONKEY_ROLE_NAME="${roleName}"
POOL_ID="monkey-access"
PROVIDER_ID="monkey-aws"
SERVICE_ACCOUNT_ID="monkey-reader"

main() {
  local PROJECT_ID="\${1:-}" EXTERNAL_ID="\${2:-}"
  if ! [[ "$PROJECT_ID" =~ ${GCP_PROJECT_ID.source} ]]; then
    echo "Error: el ID del proyecto no es válido." >&2
    exit 2
  fi
  if ! [[ "$EXTERNAL_ID" =~ ${EXTERNAL_ID.source} ]]; then
    echo "Error: el identificador externo no es válido." >&2
    exit 2
  fi
  if ! command -v gcloud >/dev/null 2>&1; then
    echo "Error: no se encontró gcloud. Corre este comando en Cloud Shell." >&2
    exit 1
  fi

  local SESSION_ARN="arn:aws:sts::\${MONKEY_AWS_ACCOUNT}:assumed-role/\${MONKEY_ROLE_NAME}/\${EXTERNAL_ID}"
  local SERVICE_ACCOUNT="\${SERVICE_ACCOUNT_ID}@\${PROJECT_ID}.iam.gserviceaccount.com"

  echo "1/6 Buscando el proyecto \${PROJECT_ID}..."
  local PROJECT_NUMBER
  PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)' --quiet)"
  if ! [[ "$PROJECT_NUMBER" =~ ^[0-9]{6,19}$ ]]; then
    echo "Error: no se pudo obtener el número del proyecto. Revisa que tienes acceso a \${PROJECT_ID}." >&2
    exit 1
  fi

  echo "2/6 Activando los servicios necesarios..."
  gcloud services enable iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com \\
    cloudresourcemanager.googleapis.com serviceusage.googleapis.com logging.googleapis.com \\
    --project "$PROJECT_ID" --quiet

  echo "3/6 Creando el grupo de identidades de Monkey..."
  local STATE
  if STATE="$(gcloud iam workload-identity-pools describe "$POOL_ID" --project "$PROJECT_ID" --location global --format='value(state)' --quiet 2>/dev/null)"; then
    if [ "$STATE" = "DELETED" ]; then
      gcloud iam workload-identity-pools undelete "$POOL_ID" --project "$PROJECT_ID" --location global --quiet >/dev/null
    fi
  else
    gcloud iam workload-identity-pools create "$POOL_ID" --project "$PROJECT_ID" --location global \\
      --display-name "Monkey" --description "Acceso de solo lectura para Monkey" --quiet >/dev/null
  fi

  echo "4/6 Configurando quién puede entrar (solo la sesión de Monkey para este activo)..."
  local CONDITION="assertion.arn == '\${SESSION_ARN}'"
  local PROVIDER_ARGS=(--project "$PROJECT_ID" --location global --workload-identity-pool "$POOL_ID"
    --account-id "$MONKEY_AWS_ACCOUNT" --attribute-mapping "google.subject=assertion.arn" --attribute-condition "$CONDITION" --quiet)
  if STATE="$(gcloud iam workload-identity-pools providers describe "$PROVIDER_ID" --project "$PROJECT_ID" --location global --workload-identity-pool "$POOL_ID" --format='value(state)' --quiet 2>/dev/null)"; then
    if [ "$STATE" = "DELETED" ]; then
      gcloud iam workload-identity-pools providers undelete "$PROVIDER_ID" --project "$PROJECT_ID" --location global --workload-identity-pool "$POOL_ID" --quiet >/dev/null
    fi
    gcloud iam workload-identity-pools providers update-aws "$PROVIDER_ID" "\${PROVIDER_ARGS[@]}" >/dev/null
  else
    gcloud iam workload-identity-pools providers create-aws "$PROVIDER_ID" "\${PROVIDER_ARGS[@]}" >/dev/null
  fi

  echo "5/6 Creando la cuenta de solo lectura..."
  if ! gcloud iam service-accounts describe "$SERVICE_ACCOUNT" --project "$PROJECT_ID" --quiet >/dev/null 2>&1; then
    gcloud iam service-accounts create "$SERVICE_ACCOUNT_ID" --project "$PROJECT_ID" \\
      --display-name "Monkey (solo lectura)" --description "Lectura de la configuración del proyecto para Monkey" --quiet >/dev/null
  fi
  local ROLE ATTEMPT
  for ROLE in roles/viewer roles/iam.securityReviewer roles/stackdriver.accounts.viewer; do
    # Una cuenta recién creada tarda unos segundos en poder recibir permisos.
    for ATTEMPT in 1 2 3 4 5 6; do
      if gcloud projects add-iam-policy-binding "$PROJECT_ID" --member "serviceAccount:\${SERVICE_ACCOUNT}" \\
        --role "$ROLE" --condition=None --quiet >/dev/null 2>&1; then
        break
      fi
      if [ "$ATTEMPT" = "6" ]; then
        echo "Error: no se pudo dar el permiso \${ROLE}." >&2
        exit 1
      fi
      sleep 5
    done
  done

  echo "6/6 Permitiendo que la sesión de Monkey use esa cuenta..."
  for ATTEMPT in 1 2 3 4 5 6; do
    if gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT" --project "$PROJECT_ID" \\
      --role roles/iam.workloadIdentityUser \\
      --member "principal://iam.googleapis.com/projects/\${PROJECT_NUMBER}/locations/global/workloadIdentityPools/\${POOL_ID}/subject/\${SESSION_ARN}" \\
      --quiet >/dev/null 2>&1; then
      break
    fi
    if [ "$ATTEMPT" = "6" ]; then
      echo "Error: no se pudo dar acceso a la sesión de Monkey." >&2
      exit 1
    fi
    sleep 5
  done

  echo
  echo "=============================================================="
  echo " Listo. Copia este número de proyecto y pégalo en Monkey:"
  echo
  echo "   NÚMERO DE PROYECTO: \${PROJECT_NUMBER}"
  echo "=============================================================="
}

main "$@"
`;
}

// El comando que el cliente pega en Cloud Shell: el script completo dentro de un heredoc con comillas (nada se expande ni se publica en una URL) y
// los parámetros ya puestos. Se validan otra vez aquí: ningún valor llega al shell sin revisar.
export function buildGcpSetupCommand(federationRoleArn: string, projectId: string, externalId: string): string {
  if (!GCP_PROJECT_ID.test(projectId)) throw new Error('ID de proyecto no válido.');
  if (!EXTERNAL_ID.test(externalId)) throw new Error('Identificador externo no válido.');
  const script = renderGcpSetupScript(federationRoleArn);
  if (script.split('\n').includes(HEREDOC_DELIMITER)) throw new Error('El script no puede contener el delimitador del comando.');
  return `bash -s -- ${projectId} ${externalId} <<'${HEREDOC_DELIMITER}'\n${script}${HEREDOC_DELIMITER}\n`;
}
