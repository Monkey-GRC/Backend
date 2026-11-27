import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import request from 'supertest';
import { configureApp } from '../../app.setup';
import { setupSwagger } from '../../swagger.config';
import { API_TAG_DESCRIPTIONS, isApiDocsEnabled } from './api-docs.config';

// MD-182 · La documentación de la API: solo local, completa y sin nombres de proveedor. No necesita base de datos: los controladores se montan con sus dependencias simuladas.

function controllerFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return controllerFiles(path);
    return name.endsWith('.controller.ts') ? [path] : [];
  });
}

// Estas pruebas arrancan la aplicación entera (todos los controladores): en el runner del CI la primera paga además la compilación y
// pasa de los 5 s por defecto de jest (MD-491). No es lentitud de la app: es el arranque en frío de la prueba.
jest.setTimeout(30_000);

async function bootDocsApp(env: Record<string, string | undefined>): Promise<{ app: INestApplication; documented: boolean }> {
  const saved = { ...process.env };
  delete process.env.API_DOCS_ENABLED;
  Object.assign(process.env, { NODE_ENV: 'test' }, env);
  try {
    const controllers = controllerFiles(join(__dirname, '..', '..', 'features')).flatMap((file) =>
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- se cargan todos los controladores que haya en la carpeta, sin listarlos a mano
      Object.values(require(file) as Record<string, unknown>).filter((v): v is new (...a: never[]) => unknown => typeof v === 'function' && /Controller$/.test(v.name)),
    );
    const moduleRef = await Test.createTestingModule({ imports: [ConfigModule.forRoot({ ignoreEnvFile: true })], controllers }).useMocker(() => ({})).compile();
    const app = moduleRef.createNestApplication();
    app.useLogger(false);
    configureApp(app);
    const documented = setupSwagger(app);
    await app.init();
    return { app, documented };
  } finally {
    process.env = saved;
  }
}

describe('nombres de esquema', () => {
  it('ninguna clase documentada repite nombre: Swagger las fusionaría y mostraría el esquema equivocado', () => {
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return files(path);
        return /\.(dto|query|responses)\.ts$/.test(name) ? [path] : [];
      });
    const seen = new Map<string, string>();
    const duplicates: string[] = [];
    for (const file of files(join(__dirname, '..', '..', 'features'))) {
      const source = readFileSync(file, 'utf8');
      for (const m of source.matchAll(/(?:@ApiSchema\(\{ name: '([^']+)'[^)]*\)\s*)?export class (\w+)/g)) {
        const name = m[1] ?? m[2];
        if (seen.has(name)) duplicates.push(`${name} (${seen.get(name)} y ${file})`);
        seen.set(name, file);
      }
    }
    expect(duplicates).toEqual([]);
  });
});

describe('isApiDocsEnabled', () => {
  it('se apaga por defecto: sin la variable explícita no hay documentación', () => {
    expect(isApiDocsEnabled({})).toBe(false);
    expect(isApiDocsEnabled({ NODE_ENV: 'development' })).toBe(false);
    expect(isApiDocsEnabled({ API_DOCS_ENABLED: 'false' })).toBe(false);
    expect(isApiDocsEnabled({ API_DOCS_ENABLED: '1' })).toBe(false);
  });

  it('se enciende solo con API_DOCS_ENABLED=true', () => {
    expect(isApiDocsEnabled({ API_DOCS_ENABLED: 'true' })).toBe(true);
    expect(isApiDocsEnabled({ API_DOCS_ENABLED: 'true', NODE_ENV: 'development' })).toBe(true);
  });

  it('en producción nunca, aunque alguien deje la variable puesta', () => {
    expect(isApiDocsEnabled({ API_DOCS_ENABLED: 'true', NODE_ENV: 'production' })).toBe(false);
  });
});

describe('documentación de la API apagada', () => {
  it('/v1/docs y /v1/docs-json responden 404 como cualquier ruta que no existe', async () => {
    const { app, documented } = await bootDocsApp({});
    try {
      expect(documented).toBe(false);
      await request(app.getHttpServer()).get('/v1/docs').expect(404);
      await request(app.getHttpServer()).get('/v1/docs-json').expect(404);
    } finally {
      await app.close();
    }
  });

  it('con NODE_ENV=production tampoco se sirve, aunque la variable esté en true', async () => {
    const { app, documented } = await bootDocsApp({ API_DOCS_ENABLED: 'true', NODE_ENV: 'production' });
    try {
      expect(documented).toBe(false);
      await request(app.getHttpServer()).get('/v1/docs').expect(404);
    } finally {
      await app.close();
    }
  });
});

describe('documentación de la API encendida (local)', () => {
  let app: INestApplication;
  let doc: OpenAPIObject;

  beforeAll(async () => {
    const booted = await bootDocsApp({ API_DOCS_ENABLED: 'true' });
    app = booted.app;
    expect(booted.documented).toBe(true);
    const res = await request(app.getHttpServer()).get('/v1/docs-json').expect(200);
    doc = res.body as OpenAPIObject;
  });
  afterAll(() => app.close());

  type Op = { tags?: string[]; summary?: string; description?: string; responses?: Record<string, unknown>; security?: unknown[]; operationId?: string; 'x-roles'?: string[] };
  const operations = (): { id: string; op: Op }[] =>
    Object.entries(doc.paths).flatMap(([path, item]) =>
      Object.entries(item as Record<string, Op>)
        .filter(([verb]) => ['get', 'post', 'put', 'patch', 'delete'].includes(verb))
        .map(([verb, op]) => ({ id: `${verb.toUpperCase()} ${path}`, op })),
    );

  it('sirve la interfaz en /v1/docs', async () => {
    await request(app.getHttpServer()).get('/v1/docs').expect(200);
  });

  it('documenta toda la API pública y deja fuera la interna del trabajador', () => {
    const ids = operations().map((o) => o.id);
    // 164 de develop + 6 de la instalación de la sonda en un servidor (D113): estado, empezar, mostrar el comando, generar de nuevo, y los dos instaladores públicos
    // + 1 de MD-194: revisar un veredicto (`PUT /v1/verdicts/{verdictId}/review`).
    // + 2 de MD-195: `GET /v1/me/work` y `GET /v1/team/workload`.
    // + 3 de MD-217: `GET /v1/auth/devices`, `DELETE /v1/auth/devices/{id}` y `DELETE /v1/auth/devices` (dispositivos recordados, D123).
    // + 2 de MD-500: `PUT /v1/controls/{id}/periodicity` y `GET …/evaluation-periods`.
    // + 2 de MD-495: `GET /v1/catalog/evaluation-parameters` y `PATCH /v1/catalog/evaluation-parameters/{key}`.
    // + 8 de MD-503: Documentos (listar, detalle, publicar versión, archivo, asignar, quitar, aceptar y `GET /v1/me/documents`).
    // + 7 de MD-515: Notificaciones.
    // - 3 y + 2 de MD-504: se retiran `PUT /v1/evidence-submissions/{id}/review`, `POST …/verdicts` y `PUT /v1/verdicts/{id}/review`; entran `POST /v1/controls/{id}/approval` y `POST …/tests/{test_id}/result`; también se retira `GET …/tests/{test_id}/verdicts` (el historial v1 se borra): −1.
    // + 1 de D154: `GET /v1/connection-templates/microsoft-365-app` (el script de alta de Microsoft 365).
    // + 2 de D157: `POST /v1/assets/{id}/connection/microsoft/start` y `…/complete` (las vueltas del navegador desde Microsoft no se documentan).
    // + 12 de MD-529: R5 (proponer y decidir), plan de remediación (registrar y decidir), «No aplica» (pedir, decidir y revertir), ocurrencias (registrar y listar), declaración «sin ocurrencias», historial de gestión y `GET /v1/users/directory`.
    expect(ids.length).toBe(208);
    expect(ids.some((id) => id.includes('/internal/'))).toBe(false);
  });

  it('cada operación tiene resumen, descripción, un grupo con título y una respuesta de éxito', () => {
    const problems: string[] = [];
    for (const { id, op } of operations()) {
      if (!op.summary) problems.push(`${id}: sin resumen`);
      if (!op.description || op.description.length < 20) problems.push(`${id}: sin descripción`);
      if (!op.tags?.length) problems.push(`${id}: sin grupo`);
      for (const tag of op.tags ?? []) if (!(tag in API_TAG_DESCRIPTIONS)) problems.push(`${id}: grupo «${tag}» sin descripción`);
      if (!Object.keys(op.responses ?? {}).some((s) => /^2\d\d$/.test(s))) problems.push(`${id}: sin respuesta de éxito`);
    }
    expect(problems).toEqual([]);
  });

  it('cada operación dice quién la puede llamar y su seguridad', () => {
    const problems: string[] = [];
    for (const { id, op } of operations()) {
      if (!op.description?.includes('**Roles que pueden llamarla:**') && !op.description?.includes('**Acceso:**')) problems.push(`${id}: sin roles ni acceso`);
      if (!op.security) problems.push(`${id}: sin seguridad`);
    }
    expect(problems).toEqual([]);
  });

  it('las operaciones con sesión documentan 401; las que tienen roles, 403', () => {
    const problems: string[] = [];
    for (const { id, op } of operations()) {
      if ((op.security?.length ?? 0) > 0 && !op.responses?.['401']) problems.push(`${id}: sin 401`);
      if (op['x-roles']?.length && !op.responses?.['403']) problems.push(`${id}: sin 403`);
    }
    expect(problems).toEqual([]);
  });

  it('los ids de operación no se repiten', () => {
    const ids = operations().map((o) => o.op.operationId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cada propiedad de cada esquema tiene descripción', () => {
    const missing: string[] = [];
    for (const [schema, def] of Object.entries(doc.components?.schemas ?? {})) {
      const props = (def as { properties?: Record<string, { description?: string; $ref?: string; allOf?: unknown[] }> }).properties ?? {};
      for (const [name, prop] of Object.entries(props)) {
        if (!prop.description && !prop.$ref && !prop.allOf) missing.push(`${schema}.${name}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('los parámetros de ruta y de consulta tienen descripción', () => {
    const missing: string[] = [];
    for (const [path, item] of Object.entries(doc.paths)) {
      for (const [verb, op] of Object.entries(item as Record<string, { parameters?: { name: string; in: string; description?: string }[] }>)) {
        for (const p of op.parameters ?? []) if (!p.description) missing.push(`${verb.toUpperCase()} ${path} (${p.in}:${p.name})`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('todas las referencias $ref apuntan a un esquema que existe', () => {
    const schemas = new Set(Object.keys(doc.components?.schemas ?? {}));
    const refs = [...JSON.stringify(doc).matchAll(/"\$ref":"#\/components\/schemas\/([^"]+)"/g)].map((m) => m[1]);
    expect(refs.filter((r) => !schemas.has(r))).toEqual([]);
  });

  it('cada respuesta de éxito con cuerpo declara su esquema (el sobre con su data tipada)', () => {
    const problems: string[] = [];
    for (const { id, op } of operations()) {
      for (const [status, res] of Object.entries(op.responses ?? {})) {
        if (!/^2\d\d$/.test(status) || status === '204') continue;
        const r = res as { content?: Record<string, { schema?: unknown }> };
        if (!Object.values(r.content ?? {}).some((c) => c.schema)) problems.push(`${id}: ${status} sin esquema`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('las operaciones con cuerpo JSON describen su esquema', () => {
    const problems: string[] = [];
    for (const { id, op } of operations()) {
      const body = (op as { requestBody?: { content?: Record<string, { schema?: unknown }> } }).requestBody;
      if (body && !Object.values(body.content ?? {}).some((c) => c.schema)) problems.push(`${id}: cuerpo sin esquema`);
    }
    expect(problems).toEqual([]);
  });

  it('no nombra a los proveedores de las capacidades automáticas', () => {
    const text = JSON.stringify(doc).toLowerCase();
    expect(text).not.toContain('wazuh');
    expect(text).not.toContain('prowler');
  });

  it('el catálogo de errores y el sobre quedan en la descripción', () => {
    expect(doc.info.description).toContain('Catálogo de errores de negocio');
    expect(doc.info.description).toContain('ACCESS_KEY_INVALID');
    expect(SwaggerModule).toBeDefined();
  });
});
