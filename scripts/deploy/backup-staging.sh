#!/usr/bin/env bash
# Respaldo nocturno de la base de staging a MinIO (MD-92: el audit trail se retiene, y lo sostienen los respaldos).
#
#   . ~/backups/.minio.env && bash scripts/deploy/backup-staging.sh
#
# Qué hace: pg_dump de la base → comprueba que el dump sea legible → lo sube al bucket de MinIO y verifica que quedó
# con el mismo tamaño → fija en el bucket la expiración a $KEEP_DAYS días → deja en la VPS solo las últimas
# $KEEP_LOCAL copias. Sale con código distinto de 0 si cualquier paso falla (el cron lo deja en el log).
#
# Habla S3 con el AWS CLI (imagen `amazon/aws-cli`), que MinIO entiende. No se usa `mc`: MinIO dejó de publicar
# sus imágenes en registros públicos.
#
# Credenciales por variables de entorno, nunca por argumento ni en un archivo del repo:
#   MINIO_ENDPOINT   p. ej. http://minio:9000   (nombre del contenedor en la red de Docker)
#   MINIO_ACCESS_KEY, MINIO_SECRET_KEY
set -euo pipefail

: "${MINIO_ENDPOINT:?Falta MINIO_ENDPOINT (p. ej. http://minio:9000)}"
: "${MINIO_ACCESS_KEY:?Falta MINIO_ACCESS_KEY}"
: "${MINIO_SECRET_KEY:?Falta MINIO_SECRET_KEY}"
DB_CONTAINER="${DB_CONTAINER:-postgres-staging}"
DB_NAME="${DB_NAME:-monkey}"
DB_SUPERUSER="${DB_SUPERUSER:-postgres}"
NETWORK="${NETWORK:-proxy_net}"
BUCKET="${MINIO_BUCKET:-monkey-backups}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/monkey}"
KEEP_DAYS="${KEEP_DAYS:-30}"
KEEP_LOCAL="${KEEP_LOCAL:-7}"
AWS_IMAGE="${AWS_IMAGE:-amazon/aws-cli}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILE="${DB_NAME}_nightly_${STAMP}.dump"

mkdir -p "$BACKUP_DIR"
dump="$BACKUP_DIR/$FILE"

echo "==> 1/4 pg_dump de $DB_NAME"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_SUPERUSER" -Fc "$DB_NAME" > "$dump"
if [ ! -s "$dump" ] || ! docker exec -i "$DB_CONTAINER" pg_restore --list < "$dump" >/dev/null; then
  rm -f "$dump"
  echo "ERROR: el respaldo salió vacío o ilegible; no se sube." >&2
  exit 1
fi
echo "    $dump ($(du -h "$dump" | cut -f1))"

# Las claves viajan por el entorno del contenedor (-e VAR sin valor), no por los argumentos.
export AWS_ACCESS_KEY_ID="$MINIO_ACCESS_KEY" AWS_SECRET_ACCESS_KEY="$MINIO_SECRET_KEY" AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"
aws() { docker run --rm --network "$NETWORK" -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY -e AWS_DEFAULT_REGION -v "$BACKUP_DIR:/b:ro" "$AWS_IMAGE" --endpoint-url "$MINIO_ENDPOINT" "$@"; }

echo "==> 2/4 Subiendo a MinIO ($BUCKET)"
aws s3api head-bucket --bucket "$BUCKET" >/dev/null 2>&1 || aws s3api create-bucket --bucket "$BUCKET" >/dev/null
aws s3 cp "/b/$FILE" "s3://$BUCKET/$FILE" --only-show-errors
# Comprueba que quedó en el bucket con el mismo tamaño: un "subió" sin verificar no es un respaldo.
local_size="$(stat -c %s "$dump")"
remote_size="$(aws s3api head-object --bucket "$BUCKET" --key "$FILE" --query ContentLength --output text)"
if [ "$local_size" != "$remote_size" ]; then
  echo "ERROR: el archivo en MinIO ($remote_size bytes) no coincide con el local ($local_size)." >&2
  exit 1
fi
echo "    Verificado en MinIO: $remote_size bytes"

echo "==> 3/4 Expiración en MinIO a ${KEEP_DAYS} días"
aws s3api put-bucket-lifecycle-configuration --bucket "$BUCKET" --lifecycle-configuration \
  "{\"Rules\":[{\"ID\":\"expira-respaldos\",\"Status\":\"Enabled\",\"Filter\":{\"Prefix\":\"\"},\"Expiration\":{\"Days\":${KEEP_DAYS}}}]}"

echo "==> 4/4 Retención local (últimas ${KEEP_LOCAL})"
ls -1t "$BACKUP_DIR"/"${DB_NAME}"_nightly_*.dump 2>/dev/null | tail -n +"$((KEEP_LOCAL + 1))" | xargs -r rm -f --
echo "==> Respaldo listo: $FILE"
