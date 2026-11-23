import type { ExecutionContext } from '@nestjs/common';
import { DomainError } from '../../../common/errors/domain-error';
import { CatalogReadOnlyGuard } from './catalog-read-only.guard';

const contextOf = (method: string) => ({ switchToHttp: () => ({ getRequest: () => ({ method }) }) }) as unknown as ExecutionContext;

describe('CatalogReadOnlyGuard (MD-491)', () => {
  const guard = new CatalogReadOnlyGuard();

  it.each(['GET', 'HEAD'])('deja pasar %s', (method) => {
    expect(guard.canActivate(contextOf(method))).toBe(true);
  });

  it.each(['POST', 'PATCH', 'PUT', 'DELETE'])('%s responde CATALOG_READ_ONLY', (method) => {
    expect(() => guard.canActivate(contextOf(method))).toThrow(DomainError);
    try {
      guard.canActivate(contextOf(method));
    } catch (e) {
      expect((e as DomainError).code).toBe('CATALOG_READ_ONLY');
    }
  });
});
