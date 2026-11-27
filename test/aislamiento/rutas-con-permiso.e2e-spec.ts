import type { INestApplication } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { ModulesContainer } from '@nestjs/core';
import { ANY_AUTHENTICATED_KEY, PERMISSION_KEY } from '../../src/common/authorization/can.decorator';
import { PERMISSION_KEYS, type Permission } from '../../src/common/authorization/permission-matrix';
import { IS_PUBLIC_KEY } from '../../src/common/decorators/public.decorator';
import { bootApp } from '../support/app';

// SEG-86 · Toda ruta autenticada NIEGA POR DEFECTO: esta prueba recorre TODAS las rutas de la aplicación armada y falla si alguna no declara su permiso de la matriz (`@Can`), una marca
// explícita de «cualquier sesión» (`@AnyAuthenticated`) o de pública (`@Public`). Una ruta nueva sin permiso rompe aquí, no en producción.
let app: INestApplication;
const VERBS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ALL', 'OPTIONS', 'HEAD'];

type Route = { id: string; permission?: Permission; anyAuthenticated: boolean; isPublic: boolean };

function routes(): Route[] {
  const found: Route[] = [];
  const modules = app.get(ModulesContainer, { strict: false });
  for (const module of modules.values()) {
    for (const wrapper of module.controllers.values()) {
      const controller = wrapper.metatype as (new (...args: never[]) => unknown) | null;
      if (!controller) continue;
      const base = Reflect.getMetadata(PATH_METADATA, controller) as string | string[] | undefined;
      const basePath = Array.isArray(base) ? base[0] : (base ?? '');
      for (const name of Object.getOwnPropertyNames(controller.prototype)) {
        const handler = (controller.prototype as Record<string, unknown>)[name];
        if (typeof handler !== 'function') continue;
        const verb = Reflect.getMetadata(METHOD_METADATA, handler) as number | undefined;
        if (verb === undefined) continue;
        const path = Reflect.getMetadata(PATH_METADATA, handler) as string | string[];
        const over = <T>(key: string): T | undefined => (Reflect.getMetadata(key, handler) as T | undefined) ?? (Reflect.getMetadata(key, controller) as T | undefined);
        found.push({
          id: `${VERBS[verb]} /${basePath}/${Array.isArray(path) ? path[0] : path}`.replace(/\/+/g, '/').replace(/(.)\/$/, '$1'),
          permission: over<Permission>(PERMISSION_KEY),
          anyAuthenticated: over<boolean>(ANY_AUTHENTICATED_KEY) ?? false,
          isPublic: over<boolean>(IS_PUBLIC_KEY) ?? false,
        });
      }
    }
  }
  return found;
}

beforeAll(async () => {
  app = await bootApp();
});
afterAll(async () => {
  await app?.close();
});

describe('Ninguna ruta sin permiso (SEG-86)', () => {
  it('cada ruta declara un permiso de la matriz, «cualquier sesión» o pública', () => {
    const all = routes();
    expect(all.length).toBeGreaterThan(150);
    const sinPermiso = all.filter((r) => !r.permission && !r.anyAuthenticated && !r.isPublic).map((r) => r.id);
    expect(sinPermiso).toEqual([]);
  });

  it('todo permiso declarado existe en la matriz', () => {
    for (const r of routes()) if (r.permission) expect(PERMISSION_KEYS).toContain(r.permission);
  });

  it('«cualquier sesión» es la excepción: solo las etiquetas de los catálogos y la campana de notificaciones, nada de una empresa', () => {
    const abiertas = routes().filter((r) => r.anyAuthenticated && !r.isPublic).map((r) => r.id).sort();
    expect(abiertas.every((id) => /\/catalogs\/:name$|\/notification/.test(id))).toBe(true);
  });

  it('las rutas públicas son las de entrar (auth), los instaladores, la API interna del trabajador y las dos vueltas desde Microsoft', () => {
    // D157 · A donde Microsoft devuelve el navegador, que llega sin la sesión: exigen un recibo firmado por Monkey y con vencimiento, no cambian nada y solo redirigen (SEG-90).
    // Van una por una, no por prefijo: otra ruta pública bajo `/integrations` tiene que romper aquí.
    const vueltasDeMicrosoft = ['POST /integrations/microsoft/signin', 'GET /integrations/microsoft/consent'];
    const publicas = routes().filter((r) => r.isPublic).map((r) => r.id);
    expect(publicas.filter((id) => !/^(GET|POST) \/(auth|install|internal\/runner)\//.test(id)).sort()).toEqual([...vueltasDeMicrosoft].sort());
  });

  it('las rutas con permiso que la matriz da al colaborador son solo su cuenta y sus documentos (SEG-85)', () => {
    const delColaborador = routes()
      .filter((r) => r.permission && ['account.manage', 'account.devices', 'documents.accept', 'documents.mine', 'documents.view_current'].includes(r.permission))
      .map((r) => r.id);
    expect(delColaborador.every((id) => /\/auth\/|\/documents|\/me\/documents/.test(id))).toBe(true);
  });
});
