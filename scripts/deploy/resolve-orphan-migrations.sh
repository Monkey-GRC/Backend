#!/usr/bin/env bash
# Destraba el deploy cuando la base tiene una migración FALLIDA cuya carpeta ya no existe en el código (P3009).
#
# Pasa cuando una migración se renombra o se borra después de que un deploy ya la intentó: Prisma ve una migración nueva, falla, y deja una fila
# fallida en `_prisma_migrations`. Esa fila bloquea todos los deploys siguientes aunque el código ya haya vuelto al nombre original, y como la carpeta
# no existe no hay nada que reintentar. Hasta MD-126 se resolvía a mano en la VPS; ahora lo hace el deploy, con el respaldo previo ya tomado.
#
# Qué hace, en orden:
#   1. Lista las filas fallidas (sin terminar y sin revertir) de `_prisma_migrations`.
#   2. Si la carpeta existe en `prisma/migrations`, NO la toca: es un fallo real y `migrate deploy` lo reportará (P3009) para que se revise a mano.
#   3. Si la carpeta no existe, la marca como revertida con `prisma migrate resolve --rolled-back`: la fila se conserva (queda el rastro) y deja de bloquear.
#
# Nunca marca como aplicada ni borra filas, y nunca ejecuta SQL de una migración. Solo corre dentro de migrate.sh, que ya respaldó la base.
set -euo pipefail

: "${MIGRATE_DATABASE_URL:?Falta MIGRATE_DATABASE_URL (rol dueño, el de las migraciones)}"
DB_CONTAINER="${DB_CONTAINER:-postgres-staging}"
DB_NAME="${DB_NAME:-monkey}"
DB_SUPERUSER="${DB_SUPERUSER:-postgres}"
NETWORK="${NETWORK:-proxy_net}"
IMAGE="${IMAGE:-monkey-backend-tools}"
CONTEXT="${CONTEXT:-$(cd "$(dirname "$0")/../.." && pwd)}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-$CONTEXT/prisma/migrations}"

# La tabla puede no existir todavía (base vacía): entonces no hay nada fallido.
failed="$(docker exec "$DB_CONTAINER" psql -U "$DB_SUPERUSER" -d "$DB_NAME" -Atc \
  "select migration_name from public._prisma_migrations where finished_at is null and rolled_back_at is null order by started_at" 2>/dev/null || true)"

if [ -z "$failed" ]; then
  echo "    No hay migraciones fallidas."
  exit 0
fi

export DATABASE_URL="$MIGRATE_DATABASE_URL"
while IFS= read -r name; do
  [ -n "$name" ] || continue
  # El nombre sale de la base: solo se acepta el formato de Prisma, para no pasar texto raro a un comando.
  if ! [[ "$name" =~ ^[0-9]{14}_[A-Za-z0-9_]+$ ]]; then
    echo "AVISO: migración fallida con un nombre que no reconozco, no la toco: $name" >&2
    continue
  fi
  if [ -d "$MIGRATIONS_DIR/$name" ]; then
    echo "    $name falló y SU CARPETA EXISTE: es un fallo real, no la toco (revisar a mano, schema-implementacion.md §7)."
    continue
  fi
  echo "    $name falló y su carpeta ya no existe (se renombró o se borró): se marca como revertida para que no bloquee el deploy."
  docker run --rm --network "$NETWORK" -e DATABASE_URL "$IMAGE" npx prisma migrate resolve --rolled-back "$name"
done <<< "$failed"
