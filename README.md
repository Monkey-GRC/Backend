# Monkey Backend

API REST de Monkey (cumplimiento GRC): **NestJS + Prisma + PostgreSQL 17** con RLS por empresa, organizada en Clean Architecture
por features. Este README es para **levantarlo y moverte en el repo**. Las reglas de diseño, los contratos y cómo construir una
feature viven en el cerebro, [`Monkey-Brain-IA`](../Monkey-Brain-IA) (carpeta hermana de este repo): ver [Dónde está cada cosa](#dónde-está-cada-cosa).

## Requisitos

- **Node 20** (`nvm use`; lo dice `.nvmrc`). El `package-lock.json` debe generarse con Node 20: npm 11 descarta del lock paquetes que npm 10 sí instala y `npm ci` falla en el CI.
  Si cambias dependencias con otra versión: `docker run --rm -v "$PWD":/w -w /w node:20-alpine npm install --package-lock-only`.
- **Docker**, para el Postgres local y para las pruebas.

## Levantarlo en local

```bash
nvm use && npm ci
npx prisma generate        # genera el cliente en ./generated/prisma; sin él ni el catálogo ni la app compilan
cp .env.example .env       # luego edita .env (ver «Variables de entorno»)
```

**1. Secretos** (cada uno distinto; no los reutilices entre ambientes):

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64url'))"   # JWT_SECRET y TOKEN_HASH_PEPPER
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"      # CREDENTIALS_ENCRYPTION_KEY
```

**2. Postgres** (rol dueño `postgres` para migrar; la app se conecta como `monkey_app`, sujeto a RLS):

```bash
docker run -d --name monkey-pg -e POSTGRES_PASSWORD=password -e POSTGRES_DB=monkey -p 5432:5432 postgres:17
docker exec monkey-pg psql -U postgres -c "CREATE DATABASE monkey_shadow"      # solo la usa `prisma migrate dev`
```

**3. Esquema, rol y datos base:**

```bash
npx prisma migrate deploy                                                       # usa DATABASE_URL (rol dueño)
docker exec monkey-pg psql -U postgres -d monkey -c "ALTER ROLE monkey_app PASSWORD 'password'"   # las migraciones lo crean sin clave
npm run catalog:load -- --apply && npm run reference:load -- --apply            # catálogo SOC 2 y datos de referencia (idempotentes)
```

**4. Primer `admin_monkey`** (la contraseña solo por variable de entorno: 12+ caracteres con mayúscula, minúscula, número y símbolo):

```bash
BOOTSTRAP_ADMIN_EMAIL=tu@correo.com BOOTSTRAP_ADMIN_NAME=Tu BOOTSTRAP_ADMIN_LAST_NAME=Apellido \
BOOTSTRAP_ADMIN_PASSWORD='…' npm run bootstrap:admin -- --apply
```

**5. Arrancar:** `npm run start:dev` → API en `http://localhost:3000/v1`. Los frontends esperan CORS desde `localhost:4200` (Admin) y `localhost:4201` (Platform).

## Variables de entorno

`.env.example` es la lista **completa y comentada**; con `cp .env.example .env` ya vienen con valor las que no están en esta tabla (**no las borres**: sin `JWT_ACCESS_EXPIRES_IN`, `SESSION_IDLE_TIMEOUT` y `SESSION_MAX_DURATION` la app no arranca). Esto es lo que debes completar para empezar:

| Variable | Para qué | En local |
|---|---|---|
| `DATABASE_URL`, `SHADOW_DATABASE_URL` | Migraciones (rol dueño) | `postgresql://postgres:password@localhost:5432/monkey` (y `monkey_shadow`) |
| `APP_DATABASE_URL` | Runtime, rol `monkey_app` (RLS) | `postgresql://monkey_app:password@localhost:5432/monkey` |
| `JWT_SECRET`, `TOKEN_HASH_PEPPER`, `CREDENTIALS_ENCRYPTION_KEY` | Firmas y cifrado | los de arriba. **No pierdas ni cambies** `CREDENTIALS_ENCRYPTION_KEY`: lo ya cifrado dejaría de poder leerse |
| `MFA_REQUIRED` | Segundo factor (TOTP) | `false` solo sirve en local para no sacar el celular en cada ingreso; en producción el servidor no arranca así |
| `MAIL_PROVIDER` | `log` (escribe el mensaje en la consola) o `resend` (envía de verdad, con `MAIL_API_KEY` y `MAIL_FROM`) | `log`. **El código de invitación de un usuario no se imprime** (SEG-75): para verlo usa `resend` |
| `PLATFORM_APP_URL`, `ADMIN_APP_URL` | Enlaces de los correos (solo `http(s)`) | `http://localhost:4201` |
| `PROBE_MODE` | Motor de nube: vacío (no disponible), `simulated` (solo dev) o `runner` (real, ver abajo) | vacío o `simulated` |
| `S3_*` | Archivos (S3 o MinIO). Sin ellos la app arranca, pero subir un archivo responde 503 | opcional |
| `API_DOCS_ENABLED` | Swagger local | `true` |

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run start:dev` · `build` · `start:prod` | Arrancar con recarga · compilar · correr lo compilado |
| `npm test` · `npm run lint` (con `--fix`) · `lint:ci` · `npx tsc --noEmit` | Unitarias · lint · lint como en el CI · tipos (incluye las pruebas) |
| `npm run test:e2e` | Aislamiento entre empresas y API real (ver «Pruebas») |
| `npm run prisma:migrate` · `prisma:migrate:deploy` · `prisma:studio` | Migración nueva en desarrollo · aplicar migraciones · explorar la base |
| `npm run catalog:load` · `reference:load` | Cargan catálogo y referencia. Sin `-- --apply` son un ensayo que no escribe |
| `npm run catalog:verify` · `reference:verify` · `clone:verify` · `audit:verify` | Verificadores contra la base (los corre el CI) |
| `npm run bootstrap:admin` · `mfa:reset` | Primer `admin_monkey` · restablecer el segundo factor de un `admin_empresa` |
| `npm run runner:local` | El trabajador del motor de nube en tu máquina (ver abajo) |

## Pruebas

- **Unitarias:** `npm test` (no necesita nada).
- **e2e:** necesitan un Postgres **desechable** con migraciones y catálogo. Crean empresas reales por la API y se niegan a correr contra un servidor que no sea local: **nunca las apuntes a la base compartida de dev**.

```bash
docker run -d --name monkey-test-pg -e POSTGRES_PASSWORD=test -e POSTGRES_DB=monkey -p 55432:5432 postgres:17
export DATABASE_URL=postgresql://postgres:test@localhost:55432/monkey
export APP_DATABASE_URL=postgresql://monkey_app:test@localhost:55432/monkey
export TEST_DATABASE_URL=$DATABASE_URL
npx prisma migrate deploy
docker exec monkey-test-pg psql -U postgres -d monkey -c "ALTER ROLE monkey_app PASSWORD 'test'"
npm run catalog:load -- --apply && npm run reference:load -- --apply
npm run test:e2e
```

Exporta las tres URLs **en la misma terminal**: el `.env` apunta a la base de dev y `dotenv` no pisa lo que ya está definido. Exporta **solo esas**: si también exportas `MAIL_PROVIDER` o `PLATFORM_APP_URL`, fallan dos pruebas unitarias que leen el entorno. Al terminar: `docker rm -f monkey-test-pg`.
El CI (`.github/workflows/ci.yml`) hace exactamente esto en cada PR a `develop` y `main`; al fusionar en `develop` solo corre el despliegue.

## El trabajador (runner) en local

El motor de nube no corre dentro de la API: lo ejecuta un **trabajador** que reclama las evaluaciones del backend y las entrega. Para comprobar conexiones de verdad contra AWS desde tu máquina:

1. En el `.env` del backend: `PROBE_MODE=runner` y `RUNNER_TOKEN=<valor>` (reinicia el backend).
2. Crea `deploy/runner.env` desde `deploy/runner.env.example` (`RUNNER_TOKEN` igual al del backend, `ENGINE_IMAGE` fijada por versión o digest, y las llaves AWS de pruebas). **Nunca lo commitees ni copies ahí el `.env` del backend.**
3. `npm run runner:local` (o `-- --no-build` para no recompilar). El script busca el archivo de entorno en este orden: `RUNNER_ENV_FILE=ruta`, `deploy/runner.env` y `~/.monkey-runner.env`; si no encuentra ninguno, falla y lo dice.

**GCP de punta a punta** (D112): con `PREVIEW_PLATFORMS=gcp` y `MONKEY_GCP_FEDERATION_ROLE_ARN` en el `.env` y el ARN también en el entorno del trabajador,
`scripts/dev/smoke-gcp.sh declare` declara el proyecto y deja el comando para Cloud Shell; `finish` entrega el número de proyecto, valida y evalúa (ver su encabezado).
**El trabajador del servidor de desarrollo reclama la misma cola** (`DT-105`): detenlo durante la prueba (`docker stop monkey-dev-runner-1`) y vuelve a levantarlo al terminar.

Cómo funciona, qué permisos usa y qué decidió el comité: `references/arquitectura/control-tecnico/motores/README.md` del cerebro.

## Documentación de la API (solo local)

Con `API_DOCS_ENABLED=true` y `npm run start:dev`, abre <http://localhost:3000/v1/docs> (JSON en `/v1/docs-json`). Inicia sesión en *Autenticación → login* y el navegador guarda las cookies para probar el resto.
Con `NODE_ENV=production` no se sirve aunque la variable esté puesta: **nunca la agregues al `.env` del servidor**. Cómo documentar un endpoint nuevo (y qué hace fallar a `npm test`): `skills/backend/add-feature.md`.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Features (una carpeta por módulo, con `domain/`, `application/`, `infrastructure/`, `presentation/`) | `src/features/` (`auth`, `companies`, `team`, `compliance`, `onboarding`, `services`, `technical-control`, `catalogs`, `catalog-admin`) |
| Transversal sin lógica de negocio (errores, auditoría, cupo, correo, Swagger…) | `src/common/` |
| Prisma, bloqueos de fila, correo, almacenamiento, auditoría y seguridad (adaptadores) | `src/infrastructure/` (`database/`, `mail/`, `storage/`, `audit/`, `security/`) |
| El trabajador del motor de nube | `src/runner/` |
| Esquema Prisma (un archivo por módulo) · migraciones · seeds y verificadores | `prisma/schema/` · `prisma/migrations/` · `prisma/seed/` y `scripts/` |
| Pruebas (aislamiento, auditoría, autenticación, equipo, empresas…) | `test/` |
| Despliegue a dev: workflows, scripts y compose | `.github/workflows/` · `scripts/deploy/` · `deploy/` |

**En el cerebro (`../Monkey-Brain-IA`):**

| Necesito… | Leer |
|---|---|
| Reglas del proyecto, flujo de trabajo y qué leer según la tarea | `CLAUDE.md` y `README.md` |
| La forma de cada endpoint (request, response, errores) | `contracts/<módulo>.md` |
| Cómo está construido el backend hoy (capas, features, convenciones) | `context/backend.md` |
| **Cómo crear una feature**, un modelo Prisma, un error i18n, una integración | `skills/backend/` (`add-feature.md`, `add-prisma-model.md`, `add-i18n-error.md`, `architecture-guardian.md`) |
| Modelo de datos, decisiones, deuda técnica y requisitos de seguridad | `skills/product/monkey-compliance-council/references/` (`datos/`, `deuda-tecnica/`, `seguridad/`) |
| Esquema, roles de base de datos, migraciones y RLS | `references/datos/schema-implementacion.md` |
