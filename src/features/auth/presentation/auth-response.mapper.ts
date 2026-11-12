import { groupDisplayName } from '../../../common/text/translate-or';
import { AuthUser } from '../domain/entities/auth-user.entity';
import { OnboardingProgress } from '../application/use-cases/session/get-onboarding-progress.use-case';

// Forma del objeto user + company de contracts/modules/auth.md (snake_case en el cable).
// `onboarding` solo viaja para el admin_empresa, que es quien recorre el onboarding.
export function toAuthResponse(user: AuthUser, onboarding?: OnboardingProgress | null) {
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      last_name: user.lastName,
      role: user.role,
      status: user.status,
      is_mfa_enabled: user.isMfaEnabled,
      preferred_language: user.preferredLanguage,
      group: user.group ? { ...user.group, name: groupDisplayName(user.group.name) } : user.group,
      ...(user.role === 'delegado' ? { responsible: user.responsible ? { id: user.responsible.id, name: user.responsible.name, last_name: user.responsible.lastName } : null } : {}),
      last_login_at: user.lastLoginAt?.toISOString() ?? null,
      created_at: user.createdAt.toISOString(),
    },
    company: { id: user.companyId, name: user.companyName },
    ...(onboarding ? { onboarding } : {}),
  };
}
