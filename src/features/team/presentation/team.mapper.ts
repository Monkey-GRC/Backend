import { MemberWithCode } from '../application/use-cases/team-users.use-cases';
import { TeamMember } from '../domain/team.types';

// Forma de contracts/gestion-usuarios.md. Nunca sale el hash de la contraseña, el secreto del segundo factor ni la huella del código.

export const toMember = (m: TeamMember) => ({
  id: m.id,
  email: m.email,
  name: m.name,
  last_name: m.lastName,
  role: m.role,
  status: m.status,
  is_mfa_enabled: m.isMfaEnabled,
  last_login_at: m.lastLoginAt ? m.lastLoginAt.toISOString() : null,
  created_at: m.createdAt.toISOString(),
});

export const toMemberWithCode = (v: MemberWithCode) => ({
  ...toMember(v.member),
  activation_code: { code: v.activationCode.code, status: v.activationCode.status, expires_at: v.activationCode.expiresAt.toISOString() },
});
