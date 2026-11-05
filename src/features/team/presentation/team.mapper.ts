import { InvitedMember, MemberWithCode } from '../application/use-cases/team-users.use-cases';
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
  is_internal: m.role === 'delegado' ? m.isInternal : null,
  group: m.group,
  ...(m.role === 'delegado' ? { responsible: m.responsible ? { id: m.responsible.id, name: m.responsible.name, last_name: m.responsible.lastName } : null } : {}),
  last_login_at: m.lastLoginAt ? m.lastLoginAt.toISOString() : null,
  created_at: m.createdAt.toISOString(),
});

// El alta nunca devuelve el código: solo el estado de la invitación (SEG-75).
export const toInvitedMember = (v: InvitedMember) => ({
  ...toMember(v.member),
  invitation: { delivery_status: v.invitation.deliveryStatus, expires_at: v.invitation.expiresAt.toISOString() },
});

export const toMemberWithCode = (v: MemberWithCode) => ({
  ...toMember(v.member),
  activation_code: { code: v.activationCode.code, status: v.activationCode.status, expires_at: v.activationCode.expiresAt.toISOString() },
});
