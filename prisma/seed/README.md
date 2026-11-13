# Siembra del catálogo maestro

Carga en la base el catálogo de **SOC 2** que entregó el comité: 1 marco, 5 criterios de confianza, 61 requisitos,
302 puntos de enfoque, 119 controles y 729 relaciones (MD-65), más 10 riesgos con 56 causas y sus relaciones, 61
pruebas con 284 asignaciones, 50 plantillas de evidencia con 89 vínculos, 10 políticas con 16 vínculos y 210
dimensiones por control (D39), y la versión 1 del catálogo: 2.305 filas.
Por qué se hizo así: `Monkey-Brain-IA` → `references/datos/modelo-datos-decisiones.md` (D35, D38, D39) y `references/datos/schema-implementacion.md` §11.

**El dato real manda (D38):** las cifras se midieron sobre las hojas, no se copiaron de ningún resumen. Lo que el
Excel dice y los datos no confirman queda en `meta.sourceNotes` del JSON y en `catalog_versions.change_summary`.

```
Excel del comité ──extract──▶ data/soc2-catalog.json (git) ──load──▶ base de datos ──verify──▶ ✓
   (.gitignore)               con el sha256 del Excel        (1 transacción)         (solo lectura)
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run catalog:extract` | Lee el Excel (`CATALOG_XLSX_PATH`, por defecto el de `Monkey-Brain-IA/assets/`), valida y escribe el JSON. Si algo falla, **no escribe**. |
| `npm run catalog:load` | **Dry-run.** Imprime destino, filas a insertar, huérfanos y conflictos. No escribe. |
| `npm run catalog:load -- --apply` | Carga en **una transacción**. Cualquier error revierte todo. |
| `npm run catalog:verify` | Solo lectura. Sale con código 1 si algo no cuadra. |
| `npx jest prisma/seed` | Pruebas del validador, del constructor y de los analizadores de texto, de las dimensiones derivadas y de los catálogos de referencia (59). |

## Garantías

- **Valida antes de escribir**: conteos, unicidad, referencias, estructura (todo requisito con puntos de
  enfoque, todo punto de enfoque con control, el control no cuelga de marco ni requisito) y consistencia del
  prefijo TSC. Informa **todos** los errores, no solo el primero.
- **Solo inserta lo que falta.** Si una fila existe con contenido distinto, **aborta y muestra el diff**;
  nunca sobrescribe. Cambiar el catálogo exige una versión nueva (A4/D33).
- **Una sola excepción: el nombre neutro de cada prueba** (`tests.display_name`, D70), que es lo que ve el cliente. Es nullable y se
  carga como dato, no en la migración (en un entorno nuevo la migración corre antes de que existan las pruebas). Si está **vacío**, `catalog:load`
  lo completa; si ya tiene un valor distinto, es un conflicto como cualquier otro y aborta. La regla vive en `soc2/display-names.ts`: el nombre
  neutro es el del comité y solo se reescribe cuando ese nombre nombra al proveedor de la sonda (hoy `T-SRV-001`, `002`, `003` y `005`). El validador
  rechaza un catálogo cuyo nombre visible nombre al proveedor (`[confidencialidad]`) y `catalog:verify` comprueba la base.
  Lo mismo vale para la **descripción corta** (`tests.display_description`, D82): es el objetivo del comité, reescrito solo en esas mismas cuatro pruebas.
- **No borra.** Lo que hay en la base y no en la fuente se reporta como huérfano.
- **Idempotente**: correrlo dos veces no cambia nada.
- **Se niega a correr como `monkey_app`.** Usa `DATABASE_URL` (rol dueño), como `migrate deploy`.

## Antes de correrlo contra un servidor real

1. `pg_dump` de la base.
2. Ojo: el `.env` local apunta al servidor de dev. Corre primero el dry-run y **lee el destino** que imprime.
3. `--apply`, luego `catalog:verify` (con `APP_DATABASE_URL` definida, para comprobar el RLS de escritura).
4. Una segunda carga debe decir "Nada que insertar".

## Qué NO cubre

Sin fuente en el Excel: `requirement_relations`. Las **dimensiones por control no vienen del Excel: se derivan de
las pruebas** (D39; `deriveControlDimensions` en `soc2/build.ts`) y su tipo y banderas esperan ratificación del
comité. Sin uso en el MVP: `control_measurements` (D2). Fuera de este seed: checks, políticas SCA y mapeos.

## Otros seeds

| Comando | Qué siembra |
|---|---|
| `npm run reference:load` (`-- --apply`) · `reference:verify` | Las 14 regulaciones (MD-75) y las 6 capacidades `ac_01…ac_06` (MD-83). Datos en `reference/data.ts`. Mismas garantías: solo inserta lo que falta, aborta con diff, no borra |
| `BOOTSTRAP_ADMIN_EMAIL=… BOOTSTRAP_ADMIN_PASSWORD=… BOOTSTRAP_ADMIN_NAME=… BOOTSTRAP_ADMIN_LAST_NAME=… npm run bootstrap:admin` (`-- --apply`) | La empresa interna de Monkey y el primer `admin_monkey`. La contraseña solo por variable de entorno (política §5.3, bcrypt). Si ya hay un `admin_monkey`, no hace nada |

Las listas de opciones del Componente 1 (tamaño, industria, modelo de negocio, años en operación, madurez, países) **no
se siembran**: son enums de Postgres, no tablas.

Si el Excel cambia, el cambio **no** entra por recarga: `catalog:load` aborta con el diff (A4/D33).

## Checks del motor de nube (D56)

| Comando | Qué hace |
|---|---|
| `npm run cloud:extract -- <carpeta-del-motor> [versión] [--platform gcp]` | Lee los metadatos y los marcos del motor y escribe `data/cloud-<plataforma>-checks.json` (por defecto `aws`: 662 checks, 3.413 mapeos a los marcos ofrecidos, 569 asignaciones propuestas a las pruebas `T-CLD`; `gcp`: 110 checks, 1.899 mapeos, 99 asignaciones: T-CLD-001 24, 002 35, 003 32, 009 4, 010 3, 011 1; 12 checks sin prueba, P15). Si algo no cuadra, **no escribe**. En GCP el motor no trae GDPR ni NIST-CSF 2.0: sale como aviso, no como error. Las reglas de asignación propias de GCP están en `proposeTests` y solo corren con `gcp` |
| `npm run cloud:load` · `-- --apply` · `-- --platform gcp` | Dry-run / carga en una transacción, de todas las plataformas con dataset (o de la indicada); la clave del check es (plataforma, `cloud_configuration`, check). Mismas garantías que los otros seeds; **no pisa una asignación `committee_ratified`** |
| `npm run cloud:verify` | Solo lectura; sale con código 1 si la base no coincide |

`cloud:translate` (guía en español, D90) lee `data/cloud-checks-es.json` para AWS y `data/cloud-gcp-checks-es.json` para GCP (un mismo `checkId` puede existir en las dos nubes). Requiere el catálogo de SOC 2 ya cargado (las pruebas `T-CLD`). Las asignaciones check → prueba son **propuestas** (`monkey_proposed`) hasta
que el comité las ratifique. Los textos del motor son internos: no salen al cliente. **Licencia del motor sin verificar (`P14` E1):** el
JSON incluye sus metadatos; revísalo antes de abrir el repo.

## Políticas y checks de la sonda de servidores (D113)

| Comando | Qué hace |
|---|---|
| `npm run sonda:extract -- <carpeta ruleset/sca> [ref]` | Lee la hoja «Checks» del Excel del comité (`SONDA_XLSX_PATH`) y las políticas de la sonda y escribe `data/sonda-checks.json.gz` (77 políticas, 11.352 checks, 14.334 mapeos a SOC 2, 19.850 asignaciones propuestas; 1,2 MB comprimido). Si algo no cuadra, **no escribe** |
| `npm run sonda:load` · `-- --apply` | Dry-run / carga en una transacción (≈45.000 filas). Mismas garantías que los otros seeds; **no pisa una asignación `committee_ratified`** |
| `npm run sonda:verify` | Solo lectura; sale con código 1 si la base no coincide |
| `npm run sonda:untranslated` · `-- <política> [--from N --count M]` | Solo lee archivos. Sin argumentos: cuántas guías de corrección faltan por traducir en cada política ofrecida. Con una política: las pendientes en JSON (id, título, original), para repartir el trabajo en tandas |
| `npm run sonda:generate -- --gpo --reuse [política…]` (`--dry-run`) | Completa `data/sonda-es/<política>.json` **sin escribir a mano**: `--gpo` genera las guías de Windows con el formato estándar de directiva de grupo (`sonda/gpo-translate.ts`; la ruta va exacta en un bloque de código); `--reuse` copia la traducción cuando el original en inglés es **idéntico** al de otra guía ya traducida. Nunca pisa lo que ya está en el archivo ni lo que el comité trae en español |
| `npm run sonda:translate` · `-- --check` · `-- --apply` | Carga `data/sonda-es/*.json` en `remediation_es` (`translation_origin = 'machine'`, sin revisar). **Valida antes de escribir**: todo lo que la traducción deja como código (comandos, rutas) tiene que aparecer **igual** en el original (un comando alterado le haría daño al servidor del cliente), nada nombra al proveedor de la sonda y no se pisa lo del comité. `--check` solo valida (sin base de datos). Idempotente; nunca toca `reviewed` ni los títulos. Hoy: ≈4.000 guías (Ubuntu 22.04 completo, Windows ≈98 %, y Linux donde el texto es idéntico) |

Las políticas de la sonda se bajan del repositorio público **en la etiqueta de la versión que usa el manager** (hoy `v4.14.6`), solo `ruleset/sca`, en una carpeta nueva
y vacía (`git clone --depth 1 --filter=blob:none --sparse --branch v4.14.6 https://github.com/wazuh/wazuh.git <carpeta>` y `git -C <carpeta> sparse-checkout set ruleset/sca`).
Los archivos se leen como texto y nunca se ejecutan. **El id oficial de cada política sale de su YAML, no del nombre del archivo** (19 de las 77 no coinciden).

Requiere el catálogo de SOC 2 ya cargado (las pruebas `T-SRV` y `T-BD`). Las asignaciones a `T-APP-*` no se cargan (esas pruebas no existen, `P9`) y se informan.
La asignación check → prueba entra como **`monkey_proposed`**: la hoja del comité no es la versión final. La tabla `catalog.sca_policies` queda como fuente de las versiones
que se ofrecen al cliente (`GET /v1/catalogs/<sistema>_version`): solo `is_offerable` (lo que la sonda entrega y es un sistema operativo).
