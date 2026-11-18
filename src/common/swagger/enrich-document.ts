import { INestApplication } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { ModulesContainer } from '@nestjs/core';
import type { OpenAPIObject } from '@nestjs/swagger';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UserRole } from '../enums/user-role.enum';
import { API_TAG_DESCRIPTIONS } from './api-docs.config';
import { ERROR_SCHEMAS, errorExample } from './api-envelope';

// La clave de metadatos de @ApiExcludeController(). @nestjs/swagger no exporta `dist/constants` (su `exports` lo impide), así que se repite aquí.
const API_EXCLUDE_CONTROLLER = 'swagger/apiExcludeController';

// Completa cada operación con lo que el código YA dice y que no conviene repetir a mano: quién puede llamarla (@Roles / @Public, los mismos metadatos que lee el
// guard, así la documentación no se desfasa) y los errores comunes de toda ruta (401, 403, 404 por id, 422 por cuerpo o consulta). Los errores propios de cada
// operación los declara su controlador con @ApiDomainErrors.

const ROLE_LABELS: Record<UserRole, string> = {
  admin_monkey: 'Administrador de Monkey',
  admin_empresa: 'Administrador de la empresa',
  responsable: 'Responsable',
  delegado: 'Delegado',
  auditor: 'Auditor',
};

type Parameter = { in: string; name: string; description?: string; schema?: Record<string, unknown> };
type Operation = {
  tags?: string[];
  description?: string;
  parameters?: Parameter[];
  requestBody?: unknown;
  responses?: Record<string, { description?: string; schema?: unknown; content?: unknown }>;
  security?: Record<string, string[]>[];
  [extension: string]: unknown;
};

// Lo que identifica el `{id}` de una ruta sale del tramo que lo antecede (`/controls/{id}` → el control).
const ID_OWNER: Record<string, string> = {
  companies: 'la empresa',
  services: 'el servicio',
  controls: 'el control',
  risks: 'el riesgo',
  causes: 'la causa',
  assets: 'el activo',
  responsibles: 'el responsable',
  exclusions: 'la exclusión',
  frameworks: 'el marco',
  tests: 'la prueba',
  'evidence-templates': 'la plantilla de evidencia',
};
const NAMED_PARAMS: Record<string, string> = {
  serviceId: 'el servicio',
  frameworkCode: 'el código del marco contratado (p. ej. `soc2`)',
  controlId: 'el control',
  riskId: 'el riesgo',
  causeId: 'la causa',
  connectionId: 'la conexión (el activo que la define)',
  requirementId: 'el requerimiento de evidencia',
  submissionId: 'la entrega de evidencia',
  verdictId: 'el veredicto de una prueba manual',
  templateId: 'la plantilla de evidencia',
  testId: 'la prueba',
  pointOfFocusId: 'el punto de enfoque',
};

function describePathParam(path: string, name: string): string | undefined {
  if (name === 'id') {
    const segments = path.split('/').filter(Boolean);
    const owner = ID_OWNER[segments[segments.findIndex((x) => x === '{id}') - 1] ?? ''];
    return `Identificador (UUID) d${owner ?? 'el recurso'}. Si no es un UUID o no existe, responde 404.`;
  }
  const named = NAMED_PARAMS[name];
  return named ? `Identificador (UUID) d${named}. Si no es un UUID o no existe, responde 404.` : undefined;
}

// Campos que significan lo mismo en todo el contrato (conventions.md): su descripción no se repite en cada clase. Lo propio de un campo se escribe en su clase.
const COMMON_FIELD_DOCS: Record<string, string> = {
  id: 'Identificador único (UUID).',
  name: 'Nombre.',
  last_name: 'Apellido.',
  code: 'Código.',
  description: 'Descripción.',
  is_active: 'Si el elemento está activo. Lo dado de baja no se borra: se conserva con `false`.',
  service_id: 'Identificador (UUID) del servicio.',
  control_id: 'Identificador (UUID) del control.',
  risk_id: 'Identificador (UUID) del riesgo.',
  cause_id: 'Identificador (UUID) de la causa.',
  requirement_id: 'Identificador (UUID) del requerimiento de evidencia.',
  user_id: 'Identificador (UUID) del usuario.',
};

function fillFieldDocs(schemas: Record<string, { properties?: Record<string, { description?: string; $ref?: string; allOf?: unknown[] }> }>): void {
  for (const def of Object.values(schemas)) {
    for (const [name, prop] of Object.entries(def.properties ?? {})) {
      if (prop.description || prop.$ref || prop.allOf) continue;
      prop.description = COMMON_FIELD_DOCS[name] ?? (name.endsWith('_at') ? 'Fecha y hora (ISO 8601, UTC).' : undefined);
      if (!prop.description) delete prop.description;
    }
  }
}

const toOpenApiPath = (path: string) => path.replace(/:([A-Za-z0-9_]+)/g, '{$1}').replace(/\/+/g, '/').replace(/(.)\/$/, '$1');

const errorResponse = (status: number, code: string, description: string) => ({
  description,
  content: {
    'application/json': {
      schema: { allOf: [{ $ref: '#/components/schemas/ErrorEnvelope' }], example: errorExample(status, code) },
    },
  },
});

/** Agrega al texto de un error ya declarado (p. ej. 404 con códigos propios) lo común, sin pisarlo. */
function addResponse(op: Operation, status: number, code: string, description: string) {
  const responses = (op.responses ??= {});
  const key = String(status);
  if (!responses[key]) {
    responses[key] = errorResponse(status, code, description);
    return;
  }
  const current = responses[key].description ?? '';
  if (!current.includes(`\`${code}\``)) responses[key].description = `\`${code}\` · ${current}`;
}

export function enrichApiDocument(app: INestApplication, document: OpenAPIObject, prefix = 'v1'): OpenAPIObject {
  document.components ??= {};
  document.components.schemas = { ...(document.components.schemas ?? {}), ...ERROR_SCHEMAS } as NonNullable<OpenAPIObject['components']>['schemas'];

  const modules = app.get(ModulesContainer, { strict: false });
  for (const module of modules.values()) {
    for (const wrapper of module.controllers.values()) {
      const controller = wrapper.metatype as (new (...args: never[]) => unknown) | null;
      if (!controller || Reflect.getMetadata(API_EXCLUDE_CONTROLLER, controller)) continue;

      const base = Reflect.getMetadata(PATH_METADATA, controller) as string | string[] | undefined;
      const basePath = Array.isArray(base) ? base[0] : (base ?? '');
      const classRoles = Reflect.getMetadata(ROLES_KEY, controller) as UserRole[] | undefined;
      const classPublic = Reflect.getMetadata(IS_PUBLIC_KEY, controller) as boolean | undefined;

      for (const name of Object.getOwnPropertyNames(controller.prototype)) {
        const handler = (controller.prototype as Record<string, unknown>)[name];
        if (typeof handler !== 'function') continue;
        const httpMethod = Reflect.getMetadata(METHOD_METADATA, handler) as number | undefined;
        if (httpMethod === undefined) continue;

        const methodPath = Reflect.getMetadata(PATH_METADATA, handler) as string | string[];
        const verb = ['get', 'post', 'put', 'delete', 'patch', 'all', 'options', 'head'][httpMethod];
        const path = toOpenApiPath(`/${prefix}/${basePath}/${Array.isArray(methodPath) ? methodPath[0] : methodPath}`);
        const op = (document.paths[path] as Record<string, Operation> | undefined)?.[verb];
        if (!op) continue;

        // Un controlador sin @ApiTags de clase recibe su nombre como grupo: aquí solo valen los grupos con título.
        if (op.tags?.some((tag) => tag in API_TAG_DESCRIPTIONS)) op.tags = op.tags.filter((tag) => tag in API_TAG_DESCRIPTIONS);

        const roles = (Reflect.getMetadata(ROLES_KEY, handler) as UserRole[] | undefined) ?? classRoles;
        const isPublic = (Reflect.getMetadata(IS_PUBLIC_KEY, handler) as boolean | undefined) ?? classPublic ?? false;

        const access = isPublic
          ? '**Acceso:** público, no requiere sesión.'
          : roles?.length
            ? `**Roles que pueden llamarla:** ${roles.map((r) => `\`${r}\` (${ROLE_LABELS[r]})`).join(', ')}.`
            : '**Acceso:** cualquier usuario con sesión.';
        op.description = [op.description, access].filter(Boolean).join('\n\n');
        if (roles?.length) op['x-roles'] = roles;

        op.security = isPublic ? [] : [{ cookie: [] }];

        if (!isPublic) {
          addResponse(op, 401, 'UNAUTHENTICATED', '`UNAUTHENTICATED` · `SESSION_EXPIRED` · No hay sesión o ya venció.');
          if (roles?.length) addResponse(op, 403, 'FORBIDDEN', '`FORBIDDEN` · El rol de la sesión no puede usar esta operación.');
        }
        if (op.parameters?.some((p) => p.in === 'path')) {
          addResponse(op, 404, 'NOT_FOUND', '`NOT_FOUND` · No existe, el id no es válido o es de otra empresa.');
        }
        if (op.requestBody || op.parameters?.some((p) => p.in === 'query')) {
          addResponse(op, 422, 'VALIDATION_FAILED', '`VALIDATION_FAILED` · Los datos no cumplen las reglas; `error.fields` trae todos los campos inválidos.');
        }
      }
    }
  }

  // Los parámetros de ruta no llevan metadatos en el controlador: se describen por lo que identifican.
  for (const [path, item] of Object.entries(document.paths)) {
    for (const op of Object.values(item as Record<string, Operation>)) {
      for (const param of op.parameters ?? []) {
        if (param.in !== 'path') continue;
        param.description ??= describePathParam(path, param.name);
        if (param.name === 'id' || param.name.endsWith('Id')) param.schema = { ...param.schema, type: 'string', format: 'uuid' };
      }
    }
  }
  fillFieldDocs(document.components.schemas as never);
  return document;
}
