# Scripts del modelo viejo — referencia, no ejecutables

Lo que hay aquí apunta a entidades que el comité derogó (`Template`,
`Risk.template_id`), así que **no corre** contra el schema actual. Se conserva
porque su lógica es el punto de partida de historias del sprint.

Esta carpeta está excluida del build a propósito (ver `tsconfig.json`).

## `seed-soc2-template.ts`

Antepasado directo de **MD-65 (sembrar el catálogo maestro de SOC 2)**. Lee
`MONKEY_SOC2_CONTROLES_AMPLIADOS.xlsx`, hoja `SOC2_Maestro` (118 filas) y:

- Mapea las columnas del Excel a las 5 dimensiones:
  `APP → APP`, `BD → DATABASE`, `NUBE → CLOUD`, `SERVIDORES → SERVER`,
  `GOBIERNO → POLICY`. **Ese mapeo sirve tal cual.**
- Agrupa 1 riesgo por cada uno de los 27 dominios, y 1 causa por cada código
  TSC distinto, con el criterio AICPA real como texto.
- Crea `ControlDimensionRequirement` solo para las dimensiones marcadas "Sí".

Qué cambia al reescribirlo para MD-65: ya no se cuelga de un `Template` — el
control se vincula a `points_of_focus`, y el marco se contrata por servicio
(`service_frameworks`). Ver `modelo-datos.md` §3.1 y §3.2.

**Ojo:** la ruta del Excel está hardcodeada a la máquina de Carlos
(`/home/carlos-castano/Escritorio/...`). Al reescribirlo, parametrizarla.
