#!/usr/bin/env bash
# Verifica que los archivos de entorno del SERVIDOR tengan lo que el despliegue necesita, ANTES de tocar nada.
#
# Los archivos `.env` (backend) y `runner.env` (trabajador) viven en el servidor y NO se escriben desde el workflow: no hay secretos en base64 que reconvertir cada
# vez que se añade una variable. Se editan en el servidor con `scripts/deploy/set-env.sh`. Si falta algo, el despliegue se detiene con un mensaje que dice qué.
#
# Uso: check-env.sh [carpeta]   (por defecto /home/ubuntu/monkey-dev)
set -euo pipefail
ROOT="${1:-/home/ubuntu/monkey-dev}"
problems=0

value() { grep -E "^$2=" "$1" | tail -1 | cut -d= -f2- | tr -d '"' || true; }
fail() { echo "✗ $*"; problems=$((problems + 1)); }
warn() { echo "⚠ $*"; }

need() {
  local file=$1; shift
  [ -f "$file" ] || { fail "Falta $file (plantilla: backend/.env.example y backend/deploy/runner.env.example)"; return; }
  local key
  for key in "$@"; do [ -n "$(value "$file" "$key")" ] || fail "$file: falta $key"; done
}

ENV="$ROOT/.env"
RUNNER="$ROOT/runner.env"
need "$ENV" PORT CORS_ORIGINS APP_DATABASE_URL JWT_SECRET TOKEN_HASH_PEPPER CREDENTIALS_ENCRYPTION_KEY PROBE_MODE MAIL_PROVIDER MAIL_API_KEY MAIL_FROM PLATFORM_APP_URL ADMIN_APP_URL

if [ -f "$ENV" ] && [ "$(value "$ENV" PROBE_MODE)" = "runner" ]; then
  # Con la comprobación REAL, el backend necesita hablar con el trabajador y decirle al cliente quién asume su rol.
  need "$ENV" RUNNER_TOKEN MONKEY_AWS_PRINCIPAL_ARN
  need "$RUNNER" RUNNER_TOKEN ENGINE_IMAGE AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_REGION
  if [ -f "$RUNNER" ]; then
    [ "$(value "$ENV" RUNNER_TOKEN)" = "$(value "$RUNNER" RUNNER_TOKEN)" ] || fail "RUNNER_TOKEN distinto en .env y runner.env: el trabajador no podría reclamar nada"
    # GCP (D112): opcional, pero si se define debe ser el mismo rol en los dos lados (el backend lo hornea en el script de alta; el trabajador lo asume).
    [ "$(value "$ENV" MONKEY_GCP_FEDERATION_ROLE_ARN)" = "$(value "$RUNNER" MONKEY_GCP_FEDERATION_ROLE_ARN)" ] || fail "MONKEY_GCP_FEDERATION_ROLE_ARN distinto en .env y runner.env: el trabajador no asumiría el rol que el script de alta de GCP acepta"
    # El trabajador solo recibe lo suyo: nunca los secretos del backend.
    ! grep -qE '^(JWT_SECRET|APP_DATABASE_URL|CREDENTIALS_ENCRYPTION_KEY|TOKEN_HASH_PEPPER)=' "$RUNNER" || fail "runner.env trae secretos del backend: quítalos"
  fi
fi

# Servidores con agente (D113): es OPCIONAL, pero si el trabajador trae SONDA_API_URL tiene que venir completo (el trabajador tampoco arranca incompleto).
if [ -f "$RUNNER" ] && [ -n "$(value "$RUNNER" SONDA_API_URL)" ]; then
  need "$RUNNER" SONDA_API_USER SONDA_API_PASSWORD SONDA_ENROLL_USER SONDA_ENROLL_PASSWORD SONDA_SUPPORTED_VERSIONS SONDA_CA_FILE
  [ "$(value "$RUNNER" SONDA_API_USER)" != "$(value "$RUNNER" SONDA_ENROLL_USER)" ] || fail "$RUNNER: SONDA_API_USER y SONDA_ENROLL_USER tienen que ser distintos (uno lee, otro da de alta)"
  ca="$(value "$RUNNER" SONDA_CA_FILE)"
  # El certificado se guarda en $ROOT/runner-secrets/ y el compose lo monta en /run/secrets/.
  [ -z "$ca" ] || [ -f "$ROOT/runner-secrets/$(basename "$ca")" ] || fail "Falta el certificado de la sonda: $ROOT/runner-secrets/$(basename "$ca")"
  need "$ENV" SONDA_MANAGER_HOST SONDA_MANAGER_PORT SONDA_AGENT_VERSION
fi

# D112: el grupo de trabajadores es opcional (queda «default»), pero con un formato inválido el backend se niega a arrancar.
if [ -f "$ENV" ]; then
  pool="$(value "$ENV" RUNNER_POOL)"
  [ -z "$pool" ] || [[ "$pool" =~ ^[a-z0-9][a-z0-9-]{0,39}$ ]] || fail "$ENV: RUNNER_POOL inválido (minúsculas, dígitos y guiones, máx. 40): el backend no arrancaría"
fi

# Almacenamiento privado de archivos (MD-110). Es una ADVERTENCIA y no detiene el despliegue: sin él la app arranca, pero subir un archivo responde 503.
if [ -f "$ENV" ]; then
  missing_s3=""
  for key in S3_ENDPOINT S3_BUCKET S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY S3_PUBLIC_ENDPOINT; do
    [ -n "$(value "$ENV" "$key")" ] || missing_s3="$missing_s3 $key"
  done
  [ -z "$missing_s3" ] || warn "$ENV: almacenamiento de archivos incompleto, falta:$missing_s3 (subir evidencias o la Descripción del Sistema fallará; ver scripts/deploy/setup-storage.sh)"
fi

if [ "$problems" -gt 0 ]; then
  echo "El despliegue se detiene: $problems problema(s) en los archivos de entorno del servidor. Corrige con: bash $ROOT/backend/scripts/deploy/set-env.sh <archivo> CLAVE=valor"
  exit 1
fi
echo "✓ Entorno del servidor completo"
