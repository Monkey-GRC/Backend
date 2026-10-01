import { TenantScope } from '../../../../common/tenancy/tenant-scope';

// Qué pasos del onboarding ya tiene hechos la empresa. Auth solo necesita saber esto para decirle
// al frontend dónde continuar; no conoce el detalle de cada componente (vive en `onboarding`).
export abstract class OnboardingProgressReader {
  // Componente 1: existe ya la organización de esta empresa.
  abstract hasOrganizationalContext(scope: TenantScope): Promise<boolean>;
  // Componente 2: la empresa ya declaró al menos un servicio completo (con marco y descripción).
  abstract hasDeclaredService(scope: TenantScope): Promise<boolean>;
}
