#!/usr/bin/env bash
# Migra la base de staging antes de levantar el backend (MD-91).
#
#   MIGRATE_DATABASE_URL='postgresql://postgres:<clave>@postgres-staging:5432/monkey' bash scripts/deploy/migrate.sh
#
# Qué hace, en orden:
#   1. Construye la imagen de herramientas (la etapa `build` del Dockerfile: trae el CLI de Prisma y tsx;
#      la imagen de runtime NO los trae a propósito).
#   2. Si la base ya tiene datos, la respalda con pg_dump ANTES de tocarla. Guarda las últimas $KEEP copias.
#   3. Corre `prisma migrate deploy` en un contenedor desechable con el rol DUEÑO. Ese rol solo existe en este
#      paso: el `.env` del backend sigue llevando únicamente `APP_DATABASE_URL` (rol `monkey_app`).
#
# Si algo falla, sale con código distinto de 0 y el deploy se aborta: el backend anterior sigue corriendo.
# La URL con la clave nunca se imprime ni se pasa como argumento (se exporta y Docker la lee del entorno).
set -euo pipefail

: "${MIGRATE_DATABASE_URL:?Falta MIGRATE_DATABASE_URL (rol dueño, el de las migraciones)}"
DB_CONTAINER="${DB_CONTAINER:-postgres-staging}"
DB_NAME="${DB_NAME:-monkey}"
DB_SUPERUSER="${DB_SUPERUSER:-postgres}"
NETWORK="${NETWORK:-proxy_net}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/monkey}"
KEEP="${KEEP:-14}"
IMAGE="${IMAGE:-monkey-backend-tools}"
CONTEXT="${CONTEXT:-$(cd "$(dirname "$0")/../.." && pwd)}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

echo "==> 1/3 Construyendo la imagen de herramientas ($IMAGE)"
docker build --target build -t "$IMAGE" "$CONTEXT" >/dev/null

echo "==> 2/3 Respaldo previo"
tables="$(docker exec "$DB_CONTAINER" psql -U "$DB_SUPERUSER" -d "$DB_NAME" -Atc \
  "select count(*) from pg_tables where schemaname in ('catalog','platform','tenant','audit')")"
if [ "$tables" -eq 0 ]; then
  echo "    La base no tiene tablas todavía: no hay nada que respaldar."
else
  mkdir -p "$BACKUP_DIR"
  dump="$BACKUP_DIR/${DB_NAME}_pre-migrate_${STAMP}.dump"
  docker exec "$DB_CONTAINER" pg_dump -U "$DB_SUPERUSER" -Fc "$DB_NAME" > "$dump"
  # Un respaldo vacío o ilegible es peor que ninguno: se comprueba antes de seguir.
  if [ ! -s "$dump" ] || ! docker exec -i "$DB_CONTAINER" pg_restore --list < "$dump" >/dev/null; then
    rm -f "$dump"
    echo "ERROR: el respaldo salió vacío o ilegible; no se migra." >&2
    exit 1
  fi
  echo "    Respaldo: $dump ($(du -h "$dump" | cut -f1))"
  # Conserva solo las últimas $KEEP copias.
  ls -1t "$BACKUP_DIR"/"${DB_NAME}"_pre-migrate_*.dump 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f --
fi

echo "==> 3/3 prisma migrate deploy"
export DATABASE_URL="$MIGRATE_DATABASE_URL"
if ! docker run --rm --network "$NETWORK" -e DATABASE_URL "$IMAGE" npx prisma migrate deploy; then
  echo "ERROR: la migración falló. El backend NO se redespliega." >&2
  [ -n "${dump:-}" ] && echo "       Respaldo previo: $dump" >&2
  echo "       Qué hacer: Monkey-Brain-IA/skills/product/monkey-compliance-council/references/schema-implementacion.md §7 (reversa)." >&2
  exit 1
fi
echo "==> Migraciones al día."
