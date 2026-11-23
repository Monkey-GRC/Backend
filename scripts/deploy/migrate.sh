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
#   5. Carga los catálogos de referencia (plataformas, regiones, integraciones; idempotente y NO bloqueante) y los verifica.
#   6. Carga los checks de la sonda y sus traducciones (idempotente y NO bloqueante).
#   7. Carga el catálogo v2 de la VF18 (MD-491; necesita los checks de 4 y 6; idempotente y NO bloqueante) y lo verifica.
#
# Si algo falla, sale con código distinto de 0 y el deploy se aborta: el backend anterior sigue corriendo.
# La URL con la clave nunca se imprime ni se pasa como argumento (se exporta y Docker la lee del entorno).
set -euo pipefail

: "${MIGRATE_DATABASE_URL:?Falta MIGRATE_DATABASE_URL (rol dueño, el de las migraciones)}"
DB_NAME="${DB_NAME:-monkey}"
NETWORK="${NETWORK:-proxy_net}"
# Cliente de Postgres efímero: consulta y respalda la base POR SU URL, esté donde esté. La base dev vive en otro servidor, no en esta VPS:
# un `docker exec` a un contenedor local consultaría y respaldaría otra base distinta de la que se migra.
PG_CLIENT_IMAGE="${PG_CLIENT_IMAGE:-postgres:17-alpine}"
pg() { docker run --rm -i --network "$NETWORK" -e MIGRATE_DATABASE_URL "$PG_CLIENT_IMAGE" "$@"; }
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/monkey}"
KEEP="${KEEP:-14}"
IMAGE="${IMAGE:-monkey-backend-tools}"
CONTEXT="${CONTEXT:-$(cd "$(dirname "$0")/../.." && pwd)}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

echo "==> 1/7 Construyendo la imagen de herramientas ($IMAGE)"
docker build --target build -t "$IMAGE" "$CONTEXT" >/dev/null

echo "==> 2/7 Respaldo previo"
tables="$(pg sh -c 'psql "$MIGRATE_DATABASE_URL" -Atc "$0"' \
  "select count(*) from pg_tables where schemaname in ('catalog','platform','tenant','audit')")"
if [ "$tables" -eq 0 ]; then
  echo "    La base no tiene tablas todavía: no hay nada que respaldar."
else
  mkdir -p "$BACKUP_DIR"
  dump="$BACKUP_DIR/${DB_NAME}_pre-migrate_${STAMP}.dump"
  pg sh -c 'pg_dump -Fc "$MIGRATE_DATABASE_URL"' > "$dump"
  # Un respaldo vacío o ilegible es peor que ninguno: se comprueba antes de seguir.
  if [ ! -s "$dump" ] || ! pg pg_restore --list < "$dump" >/dev/null; then
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
echo "==> 2b/7 Migraciones fallidas que ya no existen en el código"
bash "$(dirname "$0")/resolve-orphan-migrations.sh"

echo "==> 3/7 prisma migrate deploy"
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
# despliegue: si no se puede, se avisa y el backend sigue subiendo.
echo "==> 4/7 Catálogo de checks de nube (solo inserta lo que falta)"
if docker run --rm --network "$NETWORK" -e DATABASE_URL "$IMAGE" npm run cloud:load -- --apply; then
  echo "==> Catálogo de nube al día."
else
  echo "AVISO: no se pudo cargar el catálogo de nube (¿una fila difiere de la fuente?). El despliegue sigue; hasta que se cargue no se podrán guardar resultados de evaluaciones." >&2
fi

# Los catálogos de referencia (conexiones, regiones, integraciones: D67, D110) son dato que la migración deja vacío. La carga es IDEMPOTENTE (solo inserta lo que falta; si una
# fila difiere, aborta sin tocar nada) y, como la migración ya está aplicada, NO bloquea el despliegue: se avisa y el backend sigue (igual que el catálogo de nube).
echo "==> 5/7 Catálogos de referencia (solo inserta lo que falta)"
if docker run --rm --network "$NETWORK" -e DATABASE_URL "$IMAGE" npm run reference:load -- --apply \
  && docker run --rm --network "$NETWORK" -e DATABASE_URL "$IMAGE" npm run reference:verify; then
  echo "==> Catálogos de referencia al día."
else
  echo "AVISO: no se pudieron cargar o verificar los catálogos de referencia (¿una fila difiere de la fuente?). El despliegue sigue; hasta que se carguen, el catálogo de conexiones o de integraciones puede estar incompleto." >&2
fi

# Los checks de la sonda (políticas SCA de servidores con agente, D113) y sus guías de corrección en español. Misma regla: IDEMPOTENTE, NO bloquea. Si falla, los servidores
# se conectan pero no se pueden traducir los resultados hasta que se cargue.
echo "==> 6/7 Catálogo de checks de la sonda y sus traducciones (solo inserta lo que falta)"
if docker run --rm --network "$NETWORK" -e DATABASE_URL "$IMAGE" npm run sonda:load -- --apply \
  && docker run --rm --network "$NETWORK" -e DATABASE_URL "$IMAGE" npm run sonda:translate -- --apply; then
  echo "==> Catálogo de la sonda al día."
else
  echo "AVISO: no se pudo cargar el catálogo de la sonda (¿una fila difiere de la fuente?). El despliegue sigue; hasta que se cargue no se leerán resultados de servidores." >&2
fi

# El catálogo v2 (VF18, MD-491): sus vínculos prueba–check apuntan a los checks cargados en 4 y 6, por eso va al final. IDEMPOTENTE (si la v2 ya está, no hace nada) y NO
# bloquea: si la base tiene otro catálogo del comité (la v1), aborta sin escribir y se avisa; la v2 va sobre una base recreada (D128, prisma/seed/README.md).
echo "==> 7/7 Catálogo v2 (solo sobre una base sin otro catálogo; si ya está, no hace nada)"
if docker run --rm --network "$NETWORK" -e DATABASE_URL "$IMAGE" npm run catalog:load -- --apply \
  && docker run --rm --network "$NETWORK" -e DATABASE_URL "$IMAGE" npm run catalog:verify; then
  echo "==> Catálogo v2 al día."
else
  echo "AVISO: no se pudo cargar o verificar el catálogo v2 (¿la base tiene la v1? ver prisma/seed/README.md, «Orden del reset»). El despliegue sigue; sin catálogo no se pueden contratar marcos." >&2
fi
