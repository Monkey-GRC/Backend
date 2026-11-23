#!/usr/bin/env bash
# Postgres persistente para las pruebas e2e: un contenedor fijo con una base PLANTILLA (migraciones + datos de referencia +
# checks de la sonda y del motor de nube + catálogo v2 + contraseña de monkey_app). El globalSetup de jest la clona en una base por worker.
#   up       arranca el contenedor y reconstruye la plantilla solo si cambió la huella (idempotente)
#   rebuild  reconstruye la plantilla aunque la huella no haya cambiado
#   clean    borra el contenedor y su volumen
#   status   dice si el contenedor está arriba y si la plantilla está al día
set -euo pipefail

CONTAINER="${TEST_PG_CONTAINER:-monkey-test-pg}"
PORT="${TEST_PG_PORT:-55432}"
TEMPLATE="${TEST_TEMPLATE_DB:-monkey_template}"
APP_PASSWORD="${TEST_APP_PASSWORD:-test}"
VOLUME="${CONTAINER}-data"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
URL="postgresql://postgres:test@localhost:${PORT}"

psql_admin() { docker exec -i "$CONTAINER" psql -U postgres -v ON_ERROR_STOP=1 -qtAX "$@"; }

fingerprint() {
  (cd "$ROOT" && find prisma/migrations prisma/seed -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum | cut -d' ' -f1)
}

stored_fingerprint() {
  psql_admin -d postgres -c "select coalesce(shobj_description(oid,'pg_database'),'') from pg_database where datname='${TEMPLATE}'" 2>/dev/null || true
}

start_container() {
  if docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then return; fi
  if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER"; then
    docker start "$CONTAINER" >/dev/null
  else
    # fsync apagado: la base es desechable y reconstruible, así clonar y escribir es mucho más rápido.
    docker run -d --name "$CONTAINER" --memory="${TEST_PG_MEMORY:-640m}" --memory-swap="${TEST_PG_MEMORY:-640m}" -p "127.0.0.1:${PORT}:5432" -v "${VOLUME}:/var/lib/postgresql/data" \
      -e POSTGRES_PASSWORD=test postgres:17 \
      -c fsync=off -c synchronous_commit=off -c full_page_writes=off -c max_connections=100 -c shared_buffers=64MB -c work_mem=4MB -c maintenance_work_mem=32MB >/dev/null
  fi
  for _ in $(seq 1 60); do
    docker exec "$CONTAINER" pg_isready -U postgres -q 2>/dev/null && return
    sleep 1
  done
  echo "Postgres no respondió a tiempo" >&2; exit 1
}

build_template() {
  local fp="$1"
  echo "Reconstruyendo la plantilla ${TEMPLATE}…"
  psql_admin -d postgres -c "update pg_database set datistemplate = false where datname = '${TEMPLATE}'" -c "drop database if exists ${TEMPLATE} with (force)" -c "create database ${TEMPLATE}"
  (
    cd "$ROOT"
    export DATABASE_URL="${URL}/${TEMPLATE}"
    npx prisma migrate deploy >/dev/null
    psql_admin -d postgres -c "alter role monkey_app with login password '${APP_PASSWORD}'"
    npm run -s reference:load -- --apply >/dev/null
    npm run -s sonda:load -- --apply >/dev/null
    npm run -s cloud:load -- --apply >/dev/null
    npm run -s catalog:load -- --apply >/dev/null
  )
  psql_admin -d postgres -c "comment on database ${TEMPLATE} is '${fp}'" -c "alter database ${TEMPLATE} is_template true"
  echo "Plantilla lista."
}

ensure() {
  local force="${1:-}" fp
  start_container
  fp="$(fingerprint)"
  if [ "$force" = force ] || [ "$(stored_fingerprint)" != "$fp" ]; then build_template "$fp"; else echo "Plantilla al día."; fi
  echo "TEST_DATABASE_URL=${URL}/${TEMPLATE}"
}

case "${1:-}" in
  up) ensure ;;
  rebuild) ensure force ;;
  clean) docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; docker volume rm "$VOLUME" >/dev/null 2>&1 || true; echo "Contenedor y volumen borrados." ;;
  status)
    if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then echo "abajo ($CONTAINER)"; exit 1; fi
    if [ "$(stored_fingerprint)" = "$(fingerprint)" ]; then echo "arriba en el puerto ${PORT}, plantilla ${TEMPLATE} al día"; else echo "arriba en el puerto ${PORT}, plantilla ${TEMPLATE} DESACTUALIZADA: npm run test:db"; exit 1; fi ;;
  *) echo "Uso: $0 up|rebuild|clean|status" >&2; exit 2 ;;
esac
