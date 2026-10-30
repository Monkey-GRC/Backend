import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DOMAIN_ERROR_CATALOG } from '../errors/domain-error.catalog';

// La documentación de la API (MD-182) SOLO existe en el equipo de quien desarrolla. El despliegue no fija NODE_ENV, así que no se puede confiar en él para
// apagarla: se enciende únicamente con `API_DOCS_ENABLED=true` (nadie lo pone en el .env del servidor; scripts/deploy/check-env.sh no lo pide) y, aunque alguien
// lo pusiera, NODE_ENV=production la deja apagada. Apagada, no se registra ninguna ruta: `/v1/docs` y `/v1/docs-json` responden 404 como cualquier otra ruta.
export function isApiDocsEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.API_DOCS_ENABLED === 'true' && env.NODE_ENV !== 'production';
}

/** Grupos de la documentación, en el orden en que se muestran. Un grupo por módulo de `contracts/modules/`. */
export const API_TAGS = {
  auth: 'Autenticación',
  team: 'Equipo',
  companies: 'Monkey Admin · Empresas',
  catalogFrameworks: 'Monkey Admin · Catálogo · Marcos y requisitos',
  catalogControls: 'Monkey Admin · Catálogo · Controles',
  catalogRisks: 'Monkey Admin · Catálogo · Riesgos y causas',
  catalogTests: 'Monkey Admin · Catálogo · Pruebas',
  catalogEvidence: 'Monkey Admin · Catálogo · Plantillas de evidencia',
  catalogs: 'Catálogos de referencia',
  organizationalContext: 'Onboarding · Contexto organizacional',
  services: 'Onboarding · Servicios',
  technicalControl: 'Onboarding · Control técnico',
  assets: 'Control técnico · Activos',
  executions: 'Control técnico · Evaluaciones',
  connectionTemplates: 'Control técnico · Plantillas de conexión',
  overview: 'Cumplimiento · Resumen',
  controls: 'Cumplimiento · Controles',
  evidence: 'Cumplimiento · Evidencias',
  risks: 'Cumplimiento · Riesgos y causas',
  riskAssessment: 'Cumplimiento · Evaluación y tratamiento del riesgo',
  responsibles: 'Cumplimiento · Responsables',
  exclusions: 'Cumplimiento · Exclusiones',
  observations: 'Cumplimiento · Observaciones del auditor',
} as const;

export const API_TAG_DESCRIPTIONS: Record<(typeof API_TAGS)[keyof typeof API_TAGS], string> = {
  [API_TAGS.team]:
    'El equipo de la empresa: invitar, activar, desactivar y repartir el trabajo por dimensión. Solo dmin_empresa (el uditor lee los responsables). Contrato: contracts/modules/users-team.md.',
  [API_TAGS.auth]:
    'Inicio y cierre de sesión, renovación, activación de la cuenta con la clave de acceso y datos del usuario en sesión. Contrato: `contracts/modules/auth.md`.',
  [API_TAGS.companies]:
    'Registro de empresas clientes, marcos que se contratan y clave de acceso del primer administrador. Solo `admin_monkey`. Contrato: `contracts/modules/monkey-admin.md`.',
  [API_TAGS.catalogFrameworks]:
    'Lectura del catálogo maestro de marcos (SOC 2…), sus requisitos y los puntos de enfoque. Solo `admin_monkey`. Contrato: `contracts/modules/monkey-admin-catalog.md`.',
  [API_TAGS.catalogControls]:
    'Controles del catálogo maestro: lectura, alta, edición, baja y los vínculos con pruebas, plantillas de evidencia, puntos de enfoque y dimensiones. Solo `admin_monkey`.',
  [API_TAGS.catalogRisks]:
    'Riesgos y causas del catálogo maestro y su vínculo con los controles que las tratan. Solo `admin_monkey`.',
  [API_TAGS.catalogTests]: 'Pruebas del catálogo maestro (manuales y automáticas). Solo `admin_monkey`.',
  [API_TAGS.catalogEvidence]: 'Plantillas de evidencia que el catálogo maestro pide para cada control. Solo `admin_monkey`.',
  [API_TAGS.catalogs]:
    'Listas de opciones que el frontend nunca escribe a mano (valores `snake_case` con su etiqueta traducida) y los marcos contratados por la empresa. Contrato: `contracts/enums.md`.',
  [API_TAGS.organizationalContext]:
    'Componente 1 del onboarding: el formulario del contexto de la organización. Contrato: `contracts/modules/onboarding-organizational-context.md`.',
  [API_TAGS.services]:
    'Componente 2 del onboarding: los servicios que la empresa evalúa y la Descripción del Sistema (texto o archivo). Contrato: `contracts/modules/onboarding-service-context.md`.',
  [API_TAGS.technicalControl]:
    'Componente 3 del onboarding: escenario de despliegue, capacidades automáticas y qué activos usa cada conexión. Contrato: `contracts/modules/onboarding-technical-control.md`.',
  [API_TAGS.assets]:
    'Activos de la empresa que se conectan al control técnico: alta, conexión, validación, activación y programación. Contrato: `contracts/modules/onboarding-technical-control.md`.',
  [API_TAGS.executions]:
    'Evaluaciones automáticas de un activo: lanzarlas, ver su historial y saber si el activo está listo. Contrato: `contracts/modules/control-tecnico-operacion.md`.',
  [API_TAGS.connectionTemplates]: 'Plantillas que la empresa aplica en su nube para dar acceso de solo lectura a Monkey.',
  [API_TAGS.overview]:
    'Resumen de cumplimiento de un servicio por marco: estado, avance y cobertura juntos. Contrato: `contracts/modules/compliance-overview.md`.',
  [API_TAGS.controls]:
    'Controles de un servicio (listado y detalle), alta de un control propio y solicitudes de cambio. Contrato: `contracts/modules/compliance-controls.md`.',
  [API_TAGS.evidence]:
    'Requerimientos de evidencia de un control, entregas con huella de integridad y versión, y descarga con enlace firmado. Contrato: `contracts/modules/compliance-evidence.md`.',
  [API_TAGS.risks]:
    'Matriz de riesgo, riesgos y causas de un servicio y su vínculo con los controles. Contrato: `contracts/modules/compliance-risks.md`.',
  [API_TAGS.riskAssessment]: 'Evaluación del riesgo (inherente y residual) y sus tratamientos. Contrato: `contracts/modules/compliance-risks.md`.',
  [API_TAGS.responsibles]:
    'Responsables de aportar evidencias (personas o áreas) de la empresa. Contrato: `contracts/modules/compliance-responsibles.md`.',
  [API_TAGS.exclusions]:
    'Exclusiones de requisitos o controles que el administrador de la empresa crea y decide en un solo acto (D96). Contrato: `contracts/modules/compliance-audit.md`.',
  [API_TAGS.observations]:
    'Observaciones que escribe el auditor sobre un servicio, un control o una evidencia, y que la empresa responde y el auditor cierra (D96). No mueven el porcentaje. Contrato: `contracts/modules/compliance-audit.md`.',
};

// Los textos de error salen de i18n/es: la tabla de la descripción nunca se desfasa del producto.
function spanishMessage(messageKey: string): string {
  const [file, ...rest] = messageKey.split('.');
  try {
    const json = JSON.parse(readFileSync(join(process.cwd(), 'i18n', 'es', `${file}.json`), 'utf8')) as Record<string, unknown>;
    const value = rest.reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], json);
    return typeof value === 'string' ? value : '';
  } catch {
    return '';
  }
}

function errorTable(): string {
  const rows = Object.entries(DOMAIN_ERROR_CATALOG)
    .sort(([, a], [, b]) => a.status - b.status)
    .map(([code, { status, messageKey }]) => `| ${status} | \`${code}\` | ${spanishMessage(messageKey)} |`);
  return ['| HTTP | `error.code` | Mensaje (es) |', '|---|---|---|', ...rows].join('\n');
}

export function apiDescription(): string {
  return `API de Monkey, la herramienta de gobierno, riesgo y cumplimiento. **Esta documentación solo existe en local** (\`API_DOCS_ENABLED=true\`); no se publica en el dominio de la API.

## Convenciones
Todo está definido en \`contracts/conventions.md\` del cerebro del producto.

* **Prefijo y formato.** Todas las rutas cuelgan de \`/v1\`. Los campos del cuerpo y de la respuesta van en \`snake_case\`; las fechas, en ISO 8601 UTC.
* **Sesión.** Se inicia con \`POST /v1/auth/login\` y viaja en cookies \`httpOnly\` (\`mnk_access\`, \`mnk_refresh\`): el frontend nunca toca los tokens. Desde esta página, inicia sesión en *Autenticación → login* y el navegador enviará la cookie en las demás pruebas.
* **Idioma.** El texto de \`message\` se devuelve en el idioma de la cabecera \`Accept-Language\` (\`es\` o \`en\`). Los códigos (\`error.code\`) y los valores de los enums no se traducen.
* **Sobre de respuesta.** Éxito y error comparten forma: \`{ statusCode, message, data, error? }\`. En un error, \`data\` es \`null\` y \`error.code\` es el código estable.
* **Paginación.** Los listados reciben \`page\` (desde 1) y \`page_size\` (máx. 100) y devuelven \`{ items, page, page_size, total, total_pages }\`.
* **Validación.** Un cuerpo o una consulta inválidos devuelven \`422\` con **todos** los errores por campo a la vez en \`error.fields\`.
* **Aislamiento.** Todo se filtra por la empresa de la sesión: un recurso de otra empresa responde \`404\`, igual que uno que no existe.
* **Roles.** Cada operación lista los roles que pueden llamarla (\`admin_monkey\`, \`admin_empresa\`, \`funcional\`, \`auditor\`).
* **Vista técnica.** Donde se ofrece \`view=technical\`, solo la reciben \`auditor\` y \`admin_empresa\`.

## Catálogo de errores de negocio
${errorTable()}`;
}
