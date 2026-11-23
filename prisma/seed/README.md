# Siembra del catálogo maestro (catálogo v2, VF18)

Carga en la base el catálogo que entregó el comité en el libro **VF18** (`assets/TSC INTERGRAL SOC 2 DETALLADO VF18_DEV.xlsx` de `Monkey-Brain-IA`; el libro
no está en git). Contrato: `Monkey-Brain-IA/contracts/catalogo-maestro.md` («Carga del catálogo v2», RC-01) y modelo: `datos/modelo/03-catalogo-maestro.md`.
**La v2 reemplaza a la v1 y no convive con ella** (D128): se carga sobre una base recreada.

**El dato real manda (D38):** las cifras salen de las hojas, no de un resumen. Los totales exactos son los de la tabla 10 de la hoja `01_DESARROLLO`
(114 controles, 472 filas, 61 criterios, 302 puntos de enfoque, 576 requisitos, 472 pruebas, 4.684 vínculos prueba–check, 42 documentos, 100 causas, 10
riesgos, 551 + 771 + 228 vínculos, 8 procedimientos, 14 categorías, 64 integración–control y 472 mapeos).

```
Libro VF18 ──sonda:extract / cloud:extract──▶ data/sonda-checks.json.gz · data/cloud-<plataforma>-checks.json (20)
   │                                                   │
   └────────────────── catalog:extract ◀───────────────┘  (cruza TEST_CHECKS con esos catálogos y exige el mismo sha256)
                              │
                              ▼
        data/catalog-v2.json (git) ──catalog:load──▶ base de datos ──catalog:verify──▶ ✓
```

## Orden del reset de una base nueva

Cada paso solo inserta lo que falta y se niega a correr como `monkey_app` (usa `DATABASE_URL`, el rol dueño). Los de carga hacen **dry-run por defecto**: se agrega `-- --apply`.

```
npx prisma migrate deploy
npm run reference:load -- --apply          # 14 regulaciones y capacidades ac_01…ac_06
npm run sonda:load -- --apply              # 77 políticas y 11.352 checks de la sonda
npm run cloud:load -- --apply              # 1.621 checks del motor de nube en 20 plataformas
npm run catalog:load -- --apply            # catálogo v2: necesita los checks de arriba (los vínculos de TEST_CHECKS apuntan a ellos)
npm run cloud:translate -- --apply         # guía en español de AWS y GCP (opcional: cloud:load ya la escribe)
npm run sonda:translate -- --apply         # guía en español de la sonda
npm run reference:verify && npm run sonda:verify && npm run cloud:verify && npm run catalog:verify
read -rs "BOOTSTRAP_ADMIN_PASSWORD?Contraseña: " && export BOOTSTRAP_ADMIN_PASSWORD   # zsh; en bash: read -rsp "Contraseña: " BOOTSTRAP_ADMIN_PASSWORD
BOOTSTRAP_ADMIN_EMAIL=… BOOTSTRAP_ADMIN_NAME=… BOOTSTRAP_ADMIN_LAST_NAME=… npm run bootstrap:admin -- --apply
unset BOOTSTRAP_ADMIN_PASSWORD
npm run clone:verify                       # comprobación del clonado, en una transacción que se revierte
```

**Contra qué base corren.** Todos los scripts leen el `.env` (`dotenv/config`): sin `DATABASE_URL` y `APP_DATABASE_URL` exportados apuntan a la base de desarrollo. Para verificar otra base, exporta **las dos** apuntando a ella; si `APP_DATABASE_URL` apunta a otra, la comprobación de RLS de `catalog:verify` da falsos fallos. La contraseña del admin se teclea con `read -s` para que no quede en el historial del shell.

**En la VPS** el despliegue a dev (`scripts/deploy/migrate.sh`) hace todos los pasos de carga en este orden sobre la base que encuentre, sin bloquear el despliegue; tras recrear la base solo queda `bootstrap:admin`. El CI (`.github/workflows/ci.yml`) sigue el mismo orden.

La plantilla de las pruebas e2e (`npm run test:db -- up`, `scripts/dev/test-db.sh`) hace los pasos `migrate deploy`, `reference:load`, `sonda:load`, `cloud:load` y `catalog:load`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run sonda:extract -- <ruleset/sca de la sonda 4.14.7>` | Hoja `Checks Wazuh` + reglas de la sonda → `sonda-checks.json.gz` (77 políticas, 11.352 checks). Ver «Cómo obtener las políticas de la sonda» |
| `npm run cloud:extract` | Hoja `Checks prowler` → un `cloud-<plataforma>-checks.json` por plataforma (20; 1.621 checks, motor 5.45.0) con los mapeos a marcos normalizados (`cc_6_7` → `CC6.7`) |
| `npm run catalog:extract` | El libro completo → `catalog-v2.json`: valida los totales de la tabla 10 y las reglas `IN-01…IN-10`; si algo falla, **no escribe**. Exige que los datasets de checks salgan del mismo libro (sha256) |
| `npm run catalog:load` · `-- --apply` | Dry-run / carga en **una transacción**, en el orden de la tabla 10. Publica `catalog_versions.number = 2` |
| `npm run catalog:verify` · `-- --detail` | Solo lectura. Totales, base ↔ JSON fila por fila, puentes, integridad relacional, checks por plataforma y política (con `--detail`, una fila por política de la sonda), marca blanca y RLS de escritura (con `APP_DATABASE_URL`). Sale con código 1 si algo no cuadra |
| `npx jest prisma/seed` | Analizadores, cruce de checks, marca blanca, constructor y validador (con el libro real si está en disco) |

`CATALOG_XLSX_PATH` apunta al libro (por defecto `../Monkey-Brain-IA/assets/…VF18_DEV.xlsx`). Código del extractor: `catalog/` (`workbook`, `parse`, `labels`, `display-names`, `checks-cross`, `build`, `validate`, `types`).

## Garantías

- **Valida antes de escribir.** El extractor comprueba los totales y las reglas del comité; el cargador vuelve a validar el JSON. Informa **todos** los errores.
- **Solo inserta.** `catalog:load` aborta con un mensaje claro si la base ya tiene un catálogo del comité que no es la v2 (la v1 o una carga a medias), y no hace nada si la v2 ya está cargada. Nunca sobrescribe ni borra.
- **Lo agregado desde Monkey Admin** (`origin = monkey_admin`) se ignora: ni se compara ni se cuenta.
- **Marca blanca (SEG-39).** El nombre y la descripción que ve el cliente de cada prueba se derivan del libro aplicando la tabla 9 de `01_DESARROLLO`; ninguno nombra al proveedor de la sonda ni del motor de nube. Los textos internos del comité (`step_by_step`, `applies_when`, `module_ref`…) los nombran y nunca salen al cliente.
- **Los vínculos de `TEST_CHECKS` entran como `committee_ratified`** (DEV-12): 4.665 con su check y 19 «N/A» (módulo o puntaje global, `P49`) con `module_ref` y sin check.
- **Puentes con el código v1** (hasta las fases 2 y 3): `control_tests` (658) y `control_dimensions.type` derivado del tipo del control (`manual`→`manual`, `automated`→`automated`, `it_dependent_manual`→`hybrid`).
- **Se niega a correr como `monkey_app`.**

Antes de correrlo contra un servidor real: `pg_dump`, y **leer el destino** que imprime el dry-run (el `.env` local apunta al servidor de dev).

## Avisos conocidos del libro (no fallan)

- `IN-07` en VUL-1 y VUL-2: el módulo «Detección de vulnerabilidades» es Directo en los dos controles.
- `P9`: R003 y R004 escriben «Interrupción de la operación» donde la lista del comité dice «Interrupción o cierre de la operación»; se carga literal.
- CC8.1 trae en 4 filas (POC 14) la categoría de confidencialidad en vez de «Gestión de cambios»; se carga la más frecuente.
- La hoja de la sonda cita requisitos que no existen (`PL1.4`, `CC6.1"`, `CC.7.3`): no se mapean y se avisa en `sonda:extract`.
- `integration_categories.procedure_code` es una clave foránea a **un** procedimiento: de «PE-INT-01; PE-ACC-01» se guarda el primero.

## Cómo obtener las políticas de la sonda

`sonda:extract` necesita las políticas SCA de la sonda en la etiqueta de la versión del libro (hoy `v4.14.7`), solo `ruleset/sca`, en una carpeta **nueva y vacía fuera del repo**:

```
git clone --depth 1 --filter=blob:none --sparse --branch v4.14.7 https://github.com/wazuh/wazuh.git <carpeta>
git -C <carpeta> sparse-checkout set ruleset/sca
npm run sonda:extract -- <carpeta>/ruleset/sca
```

Los archivos se leen como texto y nunca se ejecutan. **El id oficial de cada política sale de su YAML, no del nombre del archivo.** Borra la carpeta al terminar.

## Otros seeds

| Comando | Qué siembra |
|---|---|
| `npm run reference:load` (`-- --apply`) · `reference:verify` | Las 14 regulaciones (MD-75) y las 6 capacidades `ac_01…ac_06` (MD-83). Datos en `reference/data.ts`. Solo inserta lo que falta, aborta con diff, no borra |
| `npm run sonda:load` (`-- --apply`) · `sonda:verify` | Políticas, checks y mapeo a SOC 2 de la sonda (D113). Los vínculos con las pruebas los carga `catalog:load` |
| `npm run cloud:load` (`-- --apply`, `-- --platform <código>`) · `cloud:verify` | Checks del motor de nube y su mapeo a los marcos; la clave del check es (plataforma, `cloud_configuration`, check). También escribe la guía en español (D90) de AWS y GCP (`data/cloud-checks-es.json`, `data/cloud-gcp-checks-es.json`); las demás plataformas no la tienen |
| `npm run cloud:translate` · `npm run sonda:translate` (`-- --apply`) | Guías de corrección en español (`translation_origin = 'machine'`, sin pisar lo que una persona revisó). `sonda:untranslated` y `sonda:generate` ayudan a completarlas |
| `BOOTSTRAP_ADMIN_EMAIL=… BOOTSTRAP_ADMIN_PASSWORD=… BOOTSTRAP_ADMIN_NAME=… BOOTSTRAP_ADMIN_LAST_NAME=… npm run bootstrap:admin` (`-- --apply`) | La empresa interna de Monkey y el primer `admin_monkey`. La contraseña solo por variable de entorno (política §5.3, bcrypt). Si ya hay un `admin_monkey`, no hace nada |

Las listas de opciones del Componente 1 (tamaño, industria, modelo de negocio, años en operación, madurez, países) **no se siembran**: son enums de Postgres, no tablas.
Si el libro cambia, el cambio **no** entra por recarga: hace falta una versión nueva del catálogo y aceptación (A4/D33). **Licencia del motor de nube sin verificar (`P14` E1):** los datos incluyen sus metadatos; revísalo antes de abrir el repo.
