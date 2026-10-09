#!/usr/bin/env bash
# Añade o cambia variables en un archivo de entorno del servidor, sin tocar lo demás y sin convertir nada a base64.
#
# Uso (en el servidor):  bash set-env.sh <archivo> CLAVE=valor [CLAVE=valor ...]
# Desde tu máquina:      ssh ubuntu@<vps> 'bash ~/monkey-dev/backend/scripts/deploy/set-env.sh ~/monkey-dev/.env PROBE_MODE=runner'
# Ejemplos: ~/monkey-dev/.env (backend)  ·  ~/monkey-dev/runner.env (trabajador)
#
# Si la clave existe se reemplaza su valor; si no, se agrega al final. El archivo queda con permisos 600. Después, reinicia lo que lo usa:
#   cd ~/monkey-dev && docker compose up -d backend runner
set -euo pipefail
[ "$#" -ge 2 ] || { echo "Uso: $0 <archivo> CLAVE=valor [CLAVE=valor ...]" >&2; exit 2; }
FILE=$1; shift
[ -f "$FILE" ] || { echo "No existe $FILE" >&2; exit 1; }
for pair in "$@"; do
  key=${pair%%=*}; value=${pair#*=}
  [[ "$key" =~ ^[A-Z][A-Z0-9_]*$ ]] || { echo "Clave inválida: $key" >&2; exit 2; }
  [ "$pair" != "$key" ] || { echo "Falta el valor de $key (CLAVE=valor)" >&2; exit 2; }
  tmp=$(mktemp)
  # awk con -v interpreta secuencias de escape: el valor viaja por el entorno para que se guarde tal cual.
  KEY="$key" VALUE="$value" awk 'BEGIN { k = ENVIRON["KEY"]; v = ENVIRON["VALUE"]; done = 0 }
    index($0, k "=") == 1 { print k "=" v; done = 1; next }
    { print }
    END { if (!done) print k "=" v }' "$FILE" > "$tmp"
  cat "$tmp" > "$FILE"; rm -f "$tmp"
  echo "✓ $key actualizado en $FILE"
done
chmod 600 "$FILE"
