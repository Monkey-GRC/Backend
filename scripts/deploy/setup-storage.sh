#!/usr/bin/env bash
# Deja listo el almacenamiento PRIVADO de evidencias en el MinIO (o S3 compatible) de un entorno (MD-110). Se corre una vez por entorno y es seguro repetirlo.
#
#   S3_ENDPOINT=http://minio:9000 S3_ACCESS_KEY_ID=… S3_SECRET_ACCESS_KEY=… bash scripts/deploy/setup-storage.sh
#
# Qué hace: (1) crea el bucket de evidencias si no existe; (2) comprueba que NO tenga política pública y la quita si la hubiera; (3) activa el versionado, para que
# reemplazar un archivo no destruya el anterior; (4) comprueba desde afuera que un acceso sin firma se rechaza. NO crea las claves: usa una cuenta de servicio de
# MinIO limitada a este bucket (no la clave raíz) y ponla en el `.env` del servidor con `scripts/deploy/set-env.sh`. Al terminar imprime las variables a poner.
#
# Variables: S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY (obligatorias); S3_BUCKET (monkey-evidence), NETWORK (proxy_net), S3_PUBLIC_ENDPOINT (opcional).
set -euo pipefail

: "${S3_ENDPOINT:?Falta S3_ENDPOINT (p. ej. http://minio:9000, el nombre del contenedor en la red de Docker)}"
: "${S3_ACCESS_KEY_ID:?Falta S3_ACCESS_KEY_ID}"
: "${S3_SECRET_ACCESS_KEY:?Falta S3_SECRET_ACCESS_KEY}"
BUCKET="${S3_BUCKET:-monkey-evidence}"
NETWORK="${NETWORK:-proxy_net}"
AWS_IMAGE="${AWS_IMAGE:-amazon/aws-cli}"
CURL_IMAGE="${CURL_IMAGE:-curlimages/curl}"

# Las claves viajan por el entorno del contenedor (-e VAR sin valor), no por los argumentos.
export AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY_ID" AWS_SECRET_ACCESS_KEY="$S3_SECRET_ACCESS_KEY" AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"
aws() { docker run --rm --network "$NETWORK" -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY -e AWS_DEFAULT_REGION "$AWS_IMAGE" --endpoint-url "$S3_ENDPOINT" "$@"; }

echo "==> 1/4 Bucket «$BUCKET»"
if aws s3api head-bucket --bucket "$BUCKET" >/dev/null 2>&1; then
  echo "    ya existe"
else
  aws s3api create-bucket --bucket "$BUCKET" >/dev/null
  echo "    creado"
fi

echo "==> 2/4 Sin política pública"
# Un bucket sin política es privado. Si alguien dejó una, se quita: las evidencias solo se entregan con un enlace firmado de corta duración.
if aws s3api get-bucket-policy --bucket "$BUCKET" >/dev/null 2>&1; then
  aws s3api delete-bucket-policy --bucket "$BUCKET" >/dev/null
  echo "    había una política: se quitó"
else
  echo "    no tiene (privado)"
fi

echo "==> 3/4 Versionado"
if aws s3api put-bucket-versioning --bucket "$BUCKET" --versioning-configuration Status=Enabled >/dev/null 2>&1; then
  echo "    activado"
else
  echo "    ADVERTENCIA: este servidor no activó el versionado; reemplazar un archivo no conservará el anterior." >&2
fi

echo "==> 4/4 Un acceso sin firma se rechaza"
# Misma red que el backend: sin credenciales y sin enlace firmado, el bucket y un objeto cualquiera deben responder 401/403.
for path in "/$BUCKET/" "/$BUCKET/no-existe.pdf"; do
  status="$(docker run --rm --network "$NETWORK" "$CURL_IMAGE" -s -o /dev/null -w '%{http_code}' "$S3_ENDPOINT$path" || true)"
  case "$status" in
    401|403) echo "    $path → $status (rechazado)" ;;
    *) echo "ERROR: $path respondió $status sin firma: el bucket NO es privado." >&2; exit 1 ;;
  esac
done

cat <<OUT

✓ Almacenamiento listo. Pon esto en el .env del servidor (la clave secreta no se imprime):
    bash scripts/deploy/set-env.sh ~/monkey-dev/.env S3_ENDPOINT=$S3_ENDPOINT S3_BUCKET=$BUCKET S3_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY=<la clave> S3_FORCE_PATH_STYLE=true S3_PUBLIC_ENDPOINT=${S3_PUBLIC_ENDPOINT:-<la dirección pública de MinIO en el proxy>}
Después reinicia (cd ~/monkey-dev && docker compose up -d backend) y corre:  npm run storage:smoke   (con SMOKE_API_URL=https://<api> para probar también el límite del proxy)
OUT
