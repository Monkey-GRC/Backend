#!/usr/bin/env bash
# Migra la base de staging antes de levantar el backend (MD-91).
#
#   MIGRATE_DATABASE_URL='postgresql://postgres:<clave>@postgres-staging:5432/monkey' bash scripts/deploy/migrate.sh
#
# Qué hace, en orden:
#   1. Construye la imagen de herramientas (la etapa `build` del Dockerfile: trae el CLI de Prisma y tsx;
#      la imagen de runtime NO los trae a propósito).
#   2. Si la base ya tiene datos, la respalda con pg_dump ANTES de tocarla. Guarda las últimas $KEEP copias.
#   2b. Si hay una migración fallida cuya carpeta ya no existe, la marca como revertida (resolve-orphan-migrations.sh); si su carpeta existe, no la toca.
#   3. Corre `prisma migrate deploy` en un contenedor desechable con el rol DUEÑO. Ese rol solo existe en este
#      paso: el `.env` del backend sigue llevando únicamente `APP_DATABASE_URL` (rol `monkey_app`).
#   4. Carga el catálogo de checks de nube (idempotente y NO bloqueante).
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

echo "==> 1/4 Construyendo la imagen de herramientas ($IMAGE)"
docker build --target build -t "$IMAGE" "$CONTEXT" >/dev/null

echo "==> 2/4 Respaldo previo"
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

# Una migración que falló y cuya carpeta ya no existe (se renombró o se borró tras un deploy) deja una fila fallida que bloquea TODOS los deploys siguientes (P3009).
# Aquí se marca como revertida; una fallida cuya carpeta sí existe NO se toca. Va después del respaldo, nunca antes.
echo "==> 2b/4 Migraciones fallidas que ya no existen en el código"
bash "$(dirname "$0")/resolve-orphan-migrations.sh"

echo "==> 3/4 prisma migrate deploy"
export DATABASE_URL="$MIGRATE_DATABASE_URL"
if ! docker run --rm --network "$NETWORK" -e DATABASE_URL "$IMAGE" npx prisma migrate deploy; then
  echo "ERROR: la migración falló. El backend NO se redespliega." >&2
  [ -n "${dump:-}" ] && echo "       Respaldo previo: $dump" >&2
  echo "       Qué hacer: Monkey-Brain-IA/skills/product/monkey-compliance-council/references/datos/schema-implementacion.md §7 (reversa)." >&2
  exit 1
fi
echo "==> Migraciones al día."

# El catálogo de checks de la nube (D56) es dato de referencia que las evaluaciones necesitan: sin él, guardar el resultado de una corrida falla. La carga es
# IDEMPOTENTE (solo inserta lo que falta; si una fila difiere, aborta sin tocar nada), así que correrla en cada despliegue es seguro. NO bloquea el
# despliegue: si no se puede (p. ej. aún no está cargado el catálogo de SOC 2), se avisa y el backend sigue subiendo.
echo "==> 4/4 Catálogo de checks de nube (solo inserta lo que falta)"
if docker run --rm --network "$NETWORK" -e DATABASE_URL "$IMAGE" npm run cloud:load -- --apply; then
  echo "==> Catálogo de nube al día."
else
  echo "AVISO: no se pudo cargar el catálogo de nube (¿falta el catálogo de SOC 2? corre bootstrap-staging.sh). El despliegue sigue; hasta que se cargue no se podrán guardar resultados de evaluaciones." >&2
fi
