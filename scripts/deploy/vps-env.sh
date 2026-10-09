#!/usr/bin/env bash
# Cambia o añade variables en el servidor de desarrollo DESDE TU MÁQUINA, y reinicia lo que las usa. Un solo comando, sin base64.
#
# Uso:   npm run env:vps -- backend CLAVE=valor [CLAVE=valor ...]     (el .env del backend)
#        npm run env:vps -- runner  CLAVE=valor [CLAVE=valor ...]     (el runner.env del trabajador)
# Ejemplo: npm run env:vps -- backend PROBE_MODE=runner VALIDATION_WAIT_SECONDS=25
#
# Necesitas poder entrar por SSH a la VPS (tu llave). Cambia el destino con VPS_HOST y VPS_USER si hace falta.
set -euo pipefail
TARGET=${1:-}; shift || true
[ "$#" -ge 1 ] || { echo "Uso: npm run env:vps -- <backend|runner> CLAVE=valor [CLAVE=valor ...]" >&2; exit 2; }
case "$TARGET" in
  backend) FILE=.env;       SERVICE=backend ;;
  runner)  FILE=runner.env; SERVICE=runner ;;
  *) echo "El primer argumento es backend o runner (recibí: ${TARGET:-nada})" >&2; exit 2 ;;
esac
HOST=${VPS_HOST:-135.148.46.195}
USER_=${VPS_USER:-ubuntu}
HERE=$(cd "$(dirname "$0")" && pwd)
# El script de cambio viaja por la conexión (no hace falta que ya esté en el servidor) y los valores se pasan como argumentos entre comillas.
quoted=$(printf ' %q' "$@")
ssh "$USER_@$HOST" "bash -s -- /home/ubuntu/monkey-dev/$FILE$quoted && cd /home/ubuntu/monkey-dev && docker compose up -d $SERVICE" < "$HERE/set-env.sh"
echo "✓ Listo: $FILE actualizado y $SERVICE reiniciado en $HOST"
