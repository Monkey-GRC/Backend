import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { DomainError } from '../../../common/errors/domain-error';

// MD-491 · Transición (contracts/catalogo-maestro.md «Admin en solo lectura»): el catálogo v2 solo lo cambia la carga. Punto único: toda petición que
// no sea de lectura al controlador de escritura responde 409 CATALOG_READ_ONLY. Corre después de la sesión y del rol, y antes de validar el cuerpo.
@Injectable()
export class CatalogReadOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { method } = context.switchToHttp().getRequest<Request>();
    if (method === 'GET' || method === 'HEAD') return true;
    throw new DomainError('CATALOG_READ_ONLY');
  }
}
