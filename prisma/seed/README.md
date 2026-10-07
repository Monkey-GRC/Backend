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
