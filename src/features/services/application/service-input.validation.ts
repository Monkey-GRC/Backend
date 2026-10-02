import { REGULATION_NONE } from '../../../common/catalogs/onboarding-catalogs';
import { DomainError } from '../../../common/errors/domain-error';
import { FieldError, ValidationException } from '../../../common/errors/validation.exception';
import { TenantScope } from '../../../common/tenancy/tenant-scope';
import { ServicePatch } from '../domain/entities/service.entity';
import { ServiceRepository } from '../domain/repositories/service.repository';

// Reglas de negocio que el DTO no puede expresar: lo que depende del catálogo en la base y las
// combinaciones que no valen. Se juntan todos los errores y se devuelven a la vez (422); después
// se comprueba el contrato de la empresa (409).
export async function assertServiceInput(
  services: ServiceRepository,
  scope: TenantScope,
  input: Pick<ServicePatch, 'frameworkCodes' | 'regulationCodes'>,
): Promise<void> {
  const errors: FieldError[] = [];

  if (input.regulationCodes) {
    // "Ninguna" significa que no le aplica ninguna regulación: no puede ir junto con otras.
    if (input.regulationCodes.includes(REGULATION_NONE) && input.regulationCodes.length > 1) {
      errors.push({ field: 'regulation_codes', code: 'regulation.none_exclusive' });
    } else {
      const existing = new Set(await services.existingRegulationCodes(input.regulationCodes));
      if (input.regulationCodes.some((code) => !existing.has(code))) {
        errors.push({ field: 'regulation_codes', code: 'enum.invalid' });
      }
    }
  }

  if (input.frameworkCodes) {
    // Hoy solo existe SOC 2 en el catálogo (D37): cualquier otro código no es una opción.
    const existing = new Set(await services.existingFrameworkCodes(input.frameworkCodes));
    if (input.frameworkCodes.some((code) => !existing.has(code))) {
      errors.push({ field: 'framework_codes', code: 'enum.invalid' });
    }
  }

  if (errors.length > 0) throw new ValidationException(errors);

  // El cliente solo puede perseguir marcos que Monkey Admin contrató para su empresa (D43).
  if (input.frameworkCodes) {
    const contracted = new Set(await services.contractedFrameworkCodes(scope));
    const missing = input.frameworkCodes.filter((code) => !contracted.has(code));
    if (missing.length > 0) throw new DomainError('FRAMEWORK_NOT_CONTRACTED', { framework_codes: missing });
  }
}
