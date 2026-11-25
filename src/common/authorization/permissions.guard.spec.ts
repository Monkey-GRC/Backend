import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorators/public.decorator';
import { AnyAuthenticated, Can } from './can.decorator';
import { PermissionsGuard } from './permissions.guard';

// SEG-86 · El guard NIEGA POR DEFECTO y manda lo más específico: el método sobre la clase.
const guard = new PermissionsGuard(new Reflector());

class Sin {
  ruta(): void {}
}
@Can('users.manage')
class ConPermisoDeClase {
  ruta(): void {}
  @AnyAuthenticated()
  abierta(): void {}
  @Can('controls.view')
  otra(): void {}
}
@AnyAuthenticated()
class AbiertaDeClase {
  ruta(): void {}
  @Can('users.manage')
  restringida(): void {}
}
class AmbasEnMetodo {
  @AnyAuthenticated()
  @Can('users.manage')
  ruta(): void {}
}
class Publica {
  @Public()
  ruta(): void {}
}
class SoloMetodo {
  @Can('users.manage')
  ruta(): void {}
  @AnyAuthenticated()
  abierta(): void {}
  @Can('controls.view')
  acotada(): void {}
  @Can('account.manage')
  cuenta(): void {}
}

const context = (cls: new () => object, method: string, principal?: { role: string }): ExecutionContext =>
  ({
    getHandler: () => (cls.prototype as Record<string, () => void>)[method],
    getClass: () => cls,
    switchToHttp: () => ({ getRequest: () => ({ principal }) }),
  }) as unknown as ExecutionContext;
const passes = (cls: new () => object, method: string, role: string) => guard.canActivate(context(cls, method, { role }));
const forbidden = (fn: () => unknown) => expect(fn).toThrow(expect.objectContaining({ code: 'FORBIDDEN' }));

describe('PermissionsGuard', () => {
  it('una ruta sin permiso declarado responde 403 a cualquier rol', () => {
    for (const role of ['admin_monkey', 'admin_empresa', 'responsable', 'delegado', 'auditor', 'colaborador']) forbidden(() => passes(Sin, 'ruta', role));
  });

  it('con el permiso de la matriz pasa; sin él (celda vacía o pendiente), 403', () => {
    expect(passes(SoloMetodo, 'ruta', 'admin_empresa')).toBe(true);
    for (const role of ['responsable', 'delegado', 'auditor', 'colaborador']) forbidden(() => passes(SoloMetodo, 'ruta', role));
    forbidden(() => passes(SoloMetodo, 'ruta', 'admin_monkey')); // pendiente (DT-124)
  });

  it('una ruta acotada (⊗) deja pasar al rol; lo suyo lo filtra el caso de uso', () => {
    expect(passes(SoloMetodo, 'acotada', 'responsable')).toBe(true);
  });

  it('«cualquier sesión» pasa a cualquier rol, pero exige sesión', () => {
    expect(passes(SoloMetodo, 'abierta', 'colaborador')).toBe(true);
    forbidden(() => guard.canActivate(context(SoloMetodo, 'abierta', undefined)));
  });

  it('una ruta pública no pide nada', () => {
    expect(guard.canActivate(context(Publica, 'ruta', undefined))).toBe(true);
  });

  it('un rol que no existe no pasa', () => {
    forbidden(() => passes(SoloMetodo, 'cuenta', 'superusuario'));
  });

  describe('especificidad: el método gana sobre la clase', () => {
    it('un `@Can` de método sobre un `@AnyAuthenticated` de clase exige el permiso', () => {
      expect(passes(AbiertaDeClase, 'ruta', 'colaborador')).toBe(true);
      forbidden(() => passes(AbiertaDeClase, 'restringida', 'colaborador'));
      expect(passes(AbiertaDeClase, 'restringida', 'admin_empresa')).toBe(true);
    });

    it('un `@AnyAuthenticated` de método sobre un `@Can` de clase abre solo esa ruta', () => {
      forbidden(() => passes(ConPermisoDeClase, 'ruta', 'colaborador'));
      expect(passes(ConPermisoDeClase, 'abierta', 'colaborador')).toBe(true);
    });

    it('un `@Can` de método sustituye al `@Can` de clase (no se suman)', () => {
      expect(passes(ConPermisoDeClase, 'otra', 'responsable')).toBe(true);
      forbidden(() => passes(ConPermisoDeClase, 'ruta', 'responsable'));
    });

    it('en un mismo nivel, `@Can` gana a `@AnyAuthenticated`', () => {
      forbidden(() => passes(AmbasEnMetodo, 'ruta', 'colaborador'));
      expect(passes(AmbasEnMetodo, 'ruta', 'admin_empresa')).toBe(true);
    });
  });
});
