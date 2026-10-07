import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { REGULATION_NONE } from '../../../../common/catalogs/onboarding-catalogs';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { RequestMeta } from '../../../../common/http/request-meta';
import {
  OrganizationalContext,
  OrganizationalContextInput,
} from '../../domain/entities/organizational-context.entity';
import { OrganizationalContextRepository } from '../../domain/repositories/organizational-context.repository';

@Injectable()
export class SaveOrganizationalContextUseCase {
  constructor(
    private readonly contexts: OrganizationalContextRepository,
  ) {}

  async execute(
    principal: Principal,
    input: OrganizationalContextInput,
    meta: RequestMeta,
  ): Promise<OrganizationalContext> {
    // "Ninguna" significa que no le aplica ninguna regulación: no puede ir junto con otras.
    if (input.regulationCodes.includes(REGULATION_NONE) && input.regulationCodes.length > 1) {
      throw new ValidationException([
        { field: 'regulation_codes', code: 'regulation.none_exclusive' },
      ]);
    }

    // El catálogo se siembra con el seed; si falta una fila, se dice qué código sobra.
    const existing = new Set(await this.contexts.existingRegulationCodes(input.regulationCodes));
    if (input.regulationCodes.some((code) => !existing.has(code))) {
      throw new ValidationException([{ field: 'regulation_codes', code: 'enum.invalid' }]);
    }

    const scope = {
      companyId: principal.companyId,
      userId: principal.userId,
      role: principal.role,
    };
    // CC9.2 (gestión de cambios): estado antes y después, con quién y desde dónde. El rastro se escribe en la
    // misma transacción que el cambio (SEG-36).
    const { after } = await this.contexts.save(scope, input, ({ before, after }) => ({
      tenantId: principal.companyId,
      userId: principal.userId,
      action: 'organizational_context.save',
      resource: 'organization',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      beforeState: before.exists ? before.snapshot() : null,
      afterState: after.snapshot(),
    }));
    return after;
  }
}
