import { groupDisplayName } from '../../../common/text/translate-or';
import { InvitedMember } from '../application/use-cases/team-users.use-cases';
import { Invitation, TeamGroup, TeamMember } from '../domain/team.types';

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
  group: m.group ? { ...m.group, name: groupDisplayName(m.group.name) } : m.group,
  ...(m.role === 'delegado' ? { responsible: m.responsible ? { id: m.responsible.id, name: m.responsible.name, last_name: m.responsible.lastName } : null } : {}),
  last_login_at: m.lastLoginAt ? m.lastLoginAt.toISOString() : null,
  created_at: m.createdAt.toISOString(),
});

// Ninguna respuesta lleva el código: solo el estado de la invitación (SEG-75).
export const toInvitation = (i: Invitation) => ({ delivery_status: i.deliveryStatus, expires_at: i.expiresAt.toISOString() });

export const toInvitedMember = (v: InvitedMember) => ({ ...toMember(v.member), invitation: toInvitation(v.invitation) });

export const toGroup = (g: TeamGroup) => ({
  id: g.id,
  name: g.kind === 'responsables' ? groupDisplayName(g.name) : g.name,
  kind: g.kind,
  leader: { id: g.leader.id, name: g.leader.name, last_name: g.leader.lastName, role: g.leader.role },
  members_count: g.membersCount,
});
