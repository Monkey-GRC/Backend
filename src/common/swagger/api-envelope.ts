import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { DOMAIN_ERROR_CATALOG } from '../errors/domain-error.catalog';
import type { DomainErrorCode } from '../errors/domain-error';

// Documentación del sobre único de respuesta (contracts/conventions.md): { statusCode, message, data }. Los decoradores arman el esquema completo para
// que cada operación muestre su `data` tipado y no un objeto vacío. Solo describen: no cambian lo que la API responde.

type Schema = Record<string, unknown>;

const refOf = (model: Type<unknown>): Schema => ({ $ref: getSchemaPath(model) });

const envelope = (status: number, data: Schema, message?: string): Schema => ({
  type: 'object',
  required: ['statusCode', 'message', 'data'],
  properties: {
    statusCode: { type: 'integer', example: status },
    message: { type: 'string', description: 'Texto para mostrar, en el idioma de `Accept-Language`.', example: message ?? 'Operación exitosa.' },
    data,
  },
});

type Options = { status?: number; message?: string };

/** 200/201 con `data` = un objeto del modelo. */
export function ApiData(model: Type<unknown>, description: string, { status = 200, message }: Options = {}) {
  return applyDecorators(ApiExtraModels(model), ApiResponse({ status, description, schema: envelope(status, refOf(model), message) }));
}

/** `data` = `{ items: [modelo…] }`, un listado sin paginar. */
export function ApiItems(model: Type<unknown>, description: string, { status = 200, message }: Options = {}) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      description,
      schema: envelope(status, { type: 'object', required: ['items'], properties: { items: { type: 'array', items: refOf(model) } } }, message),
    }),
  );
}

/** `data` = un arreglo de objetos del modelo, sin envoltorio (un listado corto sin paginar). */
export function ApiArray(model: Type<unknown>, description: string, { status = 200, message }: Options = {}) {
  return applyDecorators(ApiExtraModels(model), ApiResponse({ status, description, schema: envelope(status, { type: 'array', items: refOf(model) }, message) }));
}

/** `data` = `{ items: [...] }` donde cada elemento tiene una de varias formas (un mismo endpoint sirve catálogos de formas distintas). */
export function ApiItemsOneOf(models: Type<unknown>[], description: string, { status = 200, message }: Options = {}) {
  return applyDecorators(
    ApiExtraModels(...models),
    ApiResponse({
      status,
      description,
      schema: envelope(
        status,
        { type: 'object', required: ['items'], properties: { items: { type: 'array', items: { oneOf: models.map(refOf) } } } },
        message,
      ),
    }),
  );
}

/** `data` = la colección paginada de `toPageResponse`: `{ items, page, page_size, total, total_pages }`. */
export function ApiPaged(model: Type<unknown>, description: string, { status = 200, message }: Options = {}) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      description,
      schema: envelope(
        status,
        {
          type: 'object',
          required: ['items', 'page', 'page_size', 'total', 'total_pages'],
          properties: {
            items: { type: 'array', items: refOf(model) },
            page: { type: 'integer', example: 1, description: 'Página actual (desde 1).' },
            page_size: { type: 'integer', example: 25, description: 'Elementos por página (máx. 100).' },
            total: { type: 'integer', example: 120, description: 'Total de elementos que cumplen el filtro.' },
            total_pages: { type: 'integer', example: 5, description: 'Total de páginas.' },
          },
        },
        message,
      ),
    }),
  );
}

/** Éxito sin datos: `data` es `null`. */
export function ApiEmpty(description: string, { status = 200, message }: Options = {}) {
  return ApiResponse({ status, description, schema: envelope(status, { type: 'object', nullable: true, example: null }, message) });
}

/** 204: no hay cuerpo. */
export const ApiNoBody = (description: string) => ApiResponse({ status: 204, description });

/** Errores de negocio que esta operación puede devolver, agrupados por status con sus `error.code` (los comunes —401, 403, 404, 422— se agregan solos). */
export function ApiDomainErrors(...codes: DomainErrorCode[]) {
  const byStatus = new Map<number, DomainErrorCode[]>();
  for (const code of codes) {
    const { status } = DOMAIN_ERROR_CATALOG[code];
    byStatus.set(status, [...(byStatus.get(status) ?? []), code]);
  }
  return applyDecorators(
    ...[...byStatus].map(([status, list]) =>
      ApiResponse({
        status,
        description: list.map((c) => `\`${c}\``).join(' · '),
        schema: { allOf: [{ $ref: '#/components/schemas/ErrorEnvelope' }], example: errorExample(status, list[0]) },
      }),
    ),
  );
}

export const errorExample = (status: number, code: string): Schema => ({ statusCode: status, message: 'Texto del error en el idioma de la petición.', data: null, error: { code } });

// Esquemas que comparten todas las respuestas de error. Los agrega el enriquecedor al documento.
export const ERROR_SCHEMAS: Record<string, Schema> = {
  ErrorEnvelope: {
    type: 'object',
    required: ['statusCode', 'message', 'data', 'error'],
    properties: {
      statusCode: { type: 'integer', example: 409, description: 'Código HTTP de la respuesta.' },
      message: { type: 'string', example: 'Texto del error en el idioma de la petición.', description: 'Texto del error para mostrar, en el idioma de `Accept-Language`.' },
      data: { type: 'object', nullable: true, example: null, description: 'Siempre `null` en un error.' },
      error: { $ref: '#/components/schemas/ErrorBody' },
    },
  },
  ErrorBody: {
    type: 'object',
    required: ['code'],
    properties: {
      code: { type: 'string', example: 'VALIDATION_FAILED', description: 'Código estable del error (ver el catálogo en la descripción de la API).' },
      fields: { type: 'array', description: 'Solo en `422`: todos los campos inválidos a la vez.', items: { $ref: '#/components/schemas/FieldError' } },
    },
  },
  FieldError: {
    type: 'object',
    required: ['field', 'code', 'message'],
    properties: {
      field: { type: 'string', example: 'email', description: 'Campo con notación de punto o corchete (`items[0].name`).' },
      code: { type: 'string', example: 'email.invalid', description: 'Motivo corto: `required`, `enum.invalid`, `string.max`, `number.min`…' },
      message: { type: 'string', example: 'El correo no es válido.', description: 'Texto del motivo, en el idioma de `Accept-Language`.' },
    },
  },
};
