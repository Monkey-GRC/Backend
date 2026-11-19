import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { AuthUser } from '../entities/auth-user.entity';

// Lo que existe en la base para cada paso del onboarding; el orden y el «siguiente» los decide el caso de uso.
export type OnboardingFlags = { organizationalContext: boolean; declaredService: boolean; technicalControl: boolean };

export abstract class CurrentUserReader {
  // Perfil y, si `withOnboarding`, los pasos del onboarding, leídos en una sola transacción.
  abstract read(scope: TenantScope, userId: string, withOnboarding: boolean): Promise<{ user: AuthUser; onboarding: OnboardingFlags | null } | null>;
}
