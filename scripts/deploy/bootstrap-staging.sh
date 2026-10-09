#!/usr/bin/env bash
# Deja staging listo DESPUÉS del primer deploy que migró (MD-91). Se corre UNA vez, en la VPS:
#
#   cd ~/monkey-dev/backend && bash scripts/deploy/bootstrap-staging.sh
#
# Te pide las claves (no se muestran ni quedan en el historial) y hace, en orden:
#   1. Le pone contraseña al rol `monkey_app` (las migraciones lo crean SIN contraseña).
#   2. Carga el catálogo de SOC 2 y los catálogos de referencia, y los verifica con `monkey_app`.
#   3. Crea la empresa interna de Monkey y el primer `admin_monkey`.
# Al final te imprime la línea `APP_DATABASE_URL` que debe ir en el `.env` del servidor (se pone con `scripts/deploy/set-env.sh`).
#
# Es seguro repetirlo: el seed solo agrega lo que falta y el admin no se crea dos veces.
set -euo pipefail

DB_CONTAINER="${DB_CONTAINER:-postgres-staging}"
DB_NAME="${DB_NAME:-monkey}"
DB_SUPERUSER="${DB_SUPERUSER:-postgres}"
NETWORK="${NETWORK:-proxy_net}"
IMAGE="${IMAGE:-monkey-backend-tools}"
CONTEXT="${CONTEXT:-$(cd "$(dirname "$0")/../.." && pwd)}"

ask() { # ask VARIABLE "pregunta" [secreto]
  local var="$1" prompt="$2" secret="${3:-}"
  [ -n "${!var:-}" ] && return 0
  if [ -n "$secret" ]; then read -rsp "$prompt: " "$var"; echo; else read -rp "$prompt: " "$var"; fi
}
# Claves sin caracteres especiales: así van tal cual en la URL y en el SQL, sin codificar nada.
safe() { [[ "$2" =~ ^[A-Za-z0-9._~-]+$ ]] || { echo "ERROR: $1 solo puede llevar letras, números y . _ ~ - (sin otros símbolos)." >&2; exit 1; }; }

echo "== Datos que necesito =="
ask PGPW "Clave del superusuario postgres de staging" secret
safe "La clave de postgres" "$PGPW"
if [ -z "${APPPW:-}" ]; then
  read -rsp "Clave nueva para monkey_app (Enter = generar una aleatoria): " APPPW; echo
  if [ -z "$APPPW" ]; then APPPW="$(openssl rand -hex 24)"; GENERATED=1; fi
fi
safe "La clave de monkey_app" "$APPPW"
ask BOOTSTRAP_ADMIN_EMAIL "Correo del primer admin_monkey"
ask BOOTSTRAP_ADMIN_NAME "Nombre"
ask BOOTSTRAP_ADMIN_LAST_NAME "Apellido"
ask BOOTSTRAP_ADMIN_PASSWORD "Contraseña del admin_monkey (12+ con mayúscula, minúscula, número y símbolo)" secret

export DATABASE_URL="postgresql://${DB_SUPERUSER}:${PGPW}@${DB_CONTAINER}:5432/${DB_NAME}"
export APP_DATABASE_URL="postgresql://monkey_app:${APPPW}@${DB_CONTAINER}:5432/${DB_NAME}"
export BOOTSTRAP_ADMIN_EMAIL BOOTSTRAP_ADMIN_NAME BOOTSTRAP_ADMIN_LAST_NAME BOOTSTRAP_ADMIN_PASSWORD

run() { docker run --rm --network "$NETWORK" -e DATABASE_URL -e APP_DATABASE_URL \
  -e BOOTSTRAP_ADMIN_EMAIL -e BOOTSTRAP_ADMIN_NAME -e BOOTSTRAP_ADMIN_LAST_NAME -e BOOTSTRAP_ADMIN_PASSWORD "$IMAGE" "$@"; }

docker image inspect "$IMAGE" >/dev/null 2>&1 || { echo "== Construyendo la imagen de herramientas"; docker build --target build -t "$IMAGE" "$CONTEXT" >/dev/null; }

echo; echo "== 1/4 Contraseña de monkey_app"
exists="$(docker exec "$DB_CONTAINER" psql -U "$DB_SUPERUSER" -d "$DB_NAME" -Atc "select count(*) from pg_roles where rolname='monkey_app'")"
[ "$exists" = "1" ] || { echo "ERROR: el rol monkey_app no existe: corre primero el deploy que migra (o scripts/deploy/migrate.sh)." >&2; exit 1; }
docker exec "$DB_CONTAINER" psql -U "$DB_SUPERUSER" -d "$DB_NAME" -qc "ALTER ROLE monkey_app PASSWORD '${APPPW}'"
echo "    Listo."

echo; echo "== 2/4 Catálogo de SOC 2 y catálogos de referencia"
run npm run --silent catalog:load -- --apply
run npm run --silent reference:load -- --apply

echo; echo "== 3/4 Primer admin_monkey"
run npm run --silent bootstrap:admin -- --apply

echo; echo "== 4/4 Verificación (con el rol monkey_app, el de la app)"
run npm run --silent catalog:verify | grep -E "✗|^✓|monkey_app|la app" || true
run npm run --silent reference:verify | tail -n 2

echo
echo "== Todo listo =="
echo "Falta una cosa: que el .env del servidor tenga esta línea:"
echo "  APP_DATABASE_URL=postgresql://monkey_app:${APPPW}@${DB_CONTAINER}:5432/${DB_NAME}"
echo "Ponla con:  bash ~/monkey-dev/backend/scripts/deploy/set-env.sh ~/monkey-dev/.env 'APP_DATABASE_URL=...'"
[ -n "${GENERATED:-}" ] && echo "(La clave de monkey_app se generó aleatoria; esta es la única vez que se muestra. Guárdala.)"
echo "Después, redespliega o reinicia el backend."
