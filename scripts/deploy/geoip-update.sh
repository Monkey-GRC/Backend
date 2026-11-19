#!/usr/bin/env bash
# Actualiza la base GeoLite2-City (D123) en la VPS de desarrollo.
#
#   . ~/monkey-dev/geoip.env && bash ~/monkey-dev/backend/scripts/deploy/geoip-update.sh [--restart]
#
# Cron semanal sugerido (lunes 4:00):
#   0 4 * * 1 . ~/monkey-dev/geoip.env && bash ~/monkey-dev/backend/scripts/deploy/geoip-update.sh >> ~/monkey-dev/geoip/update.log 2>&1
#
# geoip.env: fuera del repo, permisos 600, solo con estas dos variables (el Backend NO las necesita; solo este script):
#   MAXMIND_ACCOUNT_ID=...
#   MAXMIND_LICENSE_KEY=...
#
# Destino: ${GEOIP_DIR:-/home/ubuntu/monkey-dev/geoip}/GeoLite2-City.mmdb. La copia anterior queda como .prev (una sola).
# En el compose, el servicio `backend` monta la carpeta como `./geoip:/app/geoip:ro`.
#
# El adaptador del Backend vuelve a abrir el archivo cuando cambia su fecha de modificación (se comprueba como mucho
# una vez por hora), así que no hace falta reiniciar. Con --restart se reinicia el servicio `backend` igualmente.
# (Un Backend desplegado antes de ese cambio sigue con la base vieja hasta el próximo despliegue.)
#
# Credenciales: se pasan a curl por un archivo netrc temporal (600) que se borra al salir; la clave nunca se imprime.
#
# Esta base incluye datos GeoLite2 creados por MaxMind, disponibles en https://www.maxmind.com
set -euo pipefail

: "${MAXMIND_ACCOUNT_ID:?Falta MAXMIND_ACCOUNT_ID (cárgalo desde ~/monkey-dev/geoip.env)}"
: "${MAXMIND_LICENSE_KEY:?Falta MAXMIND_LICENSE_KEY (cárgalo desde ~/monkey-dev/geoip.env)}"

RESTART=0
for arg in "$@"; do
  case "$arg" in
    --restart) RESTART=1 ;;
    *) echo "Argumento desconocido: $arg (uso: geoip-update.sh [--restart])" >&2; exit 2 ;;
  esac
done

GEOIP_DIR="${GEOIP_DIR:-/home/ubuntu/monkey-dev/geoip}"
COMPOSE_FILE="${COMPOSE_FILE:-/home/ubuntu/monkey-dev/docker-compose.yml}"
URL="https://download.maxmind.com/geoip/databases/GeoLite2-City/download?suffix=tar.gz"
DEST="$GEOIP_DIR/GeoLite2-City.mmdb"

mkdir -p "$GEOIP_DIR"
WORK="$(mktemp -d "$GEOIP_DIR/.update.XXXXXX")"
trap 'rm -rf "$WORK"' EXIT

( umask 077; printf 'machine download.maxmind.com login %s password %s\n' "$MAXMIND_ACCOUNT_ID" "$MAXMIND_LICENSE_KEY" > "$WORK/netrc" )

echo "[$(date -u +%FT%TZ)] Descargando GeoLite2-City..."
curl -fsSL --retry 3 --netrc-file "$WORK/netrc" -o "$WORK/db.tar.gz" "$URL"

MEMBER="$(tar -tzf "$WORK/db.tar.gz" | grep -E '/GeoLite2-City\.mmdb$' | head -n1 || true)"
[ -n "$MEMBER" ] || { echo "El archivo descargado no contiene GeoLite2-City.mmdb" >&2; exit 1; }
tar -xzf "$WORK/db.tar.gz" -C "$WORK" -O "$MEMBER" > "$WORK/GeoLite2-City.mmdb"

NEW="$WORK/GeoLite2-City.mmdb"
[ -s "$NEW" ] || { echo "La base extraída está vacía" >&2; exit 1; }
# Los mmdb llevan la marca de metadatos «MaxMind.com» cerca del final.
tail -c 131072 "$NEW" | grep -aq 'MaxMind.com' || { echo "El archivo no parece una base mmdb de MaxMind" >&2; exit 1; }

chmod 644 "$NEW"
TMP="$GEOIP_DIR/.GeoLite2-City.mmdb.new"
mv "$NEW" "$TMP"
if [ -f "$DEST" ]; then cp -p "$DEST" "$DEST.prev"; fi
mv "$TMP" "$DEST"
echo "[$(date -u +%FT%TZ)] Base actualizada: $DEST ($(du -h "$DEST" | cut -f1))"

if [ "$RESTART" -eq 1 ]; then
  docker compose -f "$COMPOSE_FILE" restart backend
  echo "Backend reiniciado."
fi
