import { DomainError } from '../../../common/errors/domain-error';
import { FieldError, ValidationException } from '../../../common/errors/validation.exception';
import { TenantScope } from '../../../common/tenancy/tenant-scope';
import { ServicePatch } from '../domain/entities/service.entity';
import { ServiceRepository } from '../domain/repositories/service.repository';

// Reglas de negocio que el DTO no puede expresar: lo que depende del catálogo en la base. Se juntan
// todos los errores y se devuelven a la vez (422); después se comprueba el contrato de la empresa (409).
export async function assertServiceInput(
  services: ServiceRepository,
  scope: TenantScope,
  input: Pick<ServicePatch, 'frameworkCodes'>,
): Promise<void> {
  const errors: FieldError[] = [];

  if (input.frameworkCodes) {
    // El catálogo lista todos los marcos que Monkey ofrece (D50), pero solo se puede elegir uno que
    // la empresa tenga contratado; un código que no existe en el catálogo no es una opción.
    const existing = new Set(await services.existingFrameworkCodes(input.frameworkCodes));
    if (input.frameworkCodes.some((code) => !existing.has(code))) {
      errors.push({ field: 'framework_codes', code: 'enum.invalid' });
    }
  }

  if (errors.length > 0) throw new ValidationException(errors);

  // El cliente solo puede perseguir marcos que Monkey Admin contrató para su empresa (D47).
  if (input.frameworkCodes) {
    const contracted = new Set(await services.contractedFrameworkCodes(scope));
    const missing = input.frameworkCodes.filter((code) => !contracted.has(code));
    if (missing.length > 0) throw new DomainError('FRAMEWORK_NOT_CONTRACTED', { framework_codes: missing });
  }
}
