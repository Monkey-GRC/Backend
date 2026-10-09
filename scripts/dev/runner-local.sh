#!/usr/bin/env bash
# Levanta el trabajador del motor de nube EN TU MÁQUINA, apuntando a tu backend local (D57, D58).
# Con esto las conexiones se comprueban de verdad contra AWS antes de subir nada al ambiente de desarrollo.
#
# Requisitos (una sola vez):
#   1. En el .env del backend:  PROBE_MODE=runner  y  RUNNER_TOKEN=<el mismo valor que abajo>  (reinicia el backend).
#   2. En ~/.monkey-runner.env (fuera del repo): RUNNER_TOKEN, ENGINE_IMAGE y las llaves AWS de la identidad base
#      (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY). Plantilla: deploy/runner.env.example.
#
# Uso:  npm run runner:local
set -euo pipefail
ENV_FILE="${RUNNER_ENV_FILE:-$HOME/.monkey-runner.env}"
[ -f "$ENV_FILE" ] || { echo "Falta $ENV_FILE (plantilla: deploy/runner.env.example)." >&2; exit 1; }
set -a; . "$ENV_FILE"; set +a
for v in RUNNER_TOKEN ENGINE_IMAGE AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY; do
  [ -n "${!v:-}" ] || { echo "Falta $v en $ENV_FILE." >&2; exit 1; }
done
export BACKEND_INTERNAL_URL="${BACKEND_INTERNAL_URL:-http://localhost:3000}"
cd "$(dirname "$0")/../.."
npm run build --silent
exec node dist/src/runner/main.js
