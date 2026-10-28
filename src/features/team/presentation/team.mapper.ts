import { MemberWithCode } from '../application/use-cases/team-users.use-cases';
import { ControlResponsibleRow, DimensionOwnerRow, PersonRef, TeamMember } from '../domain/team.types';

// Forma de contracts/modules/users-team.md. Nunca sale el hash de la contraseña, el secreto del segundo factor ni la huella del código.
const person = (p: PersonRef | null) => (p ? { id: p.id, email: p.email, name: p.name, last_name: p.lastName } : null);

export const toMember = (m: TeamMember) => ({
  id: m.id,
  email: m.email,
  name: m.name,
  last_name: m.lastName,
  role: m.role,
  status: m.status,
  is_mfa_enabled: m.isMfaEnabled,
  last_login_at: m.lastLoginAt ? m.lastLoginAt.toISOString() : null,
  dimensions: m.dimensions,
  created_at: m.createdAt.toISOString(),
});

export const toMemberWithCode = (v: MemberWithCode) => ({
  ...toMember(v.member),
  activation_code: { code: v.activationCode.code, status: v.activationCode.status, expires_at: v.activationCode.expiresAt.toISOString() },
});

export const toDimensionOwner = (r: DimensionOwnerRow) => ({
  dimension: r.dimension,
  owner: person(r.owner),
  controls_total: r.controlsTotal,
  controls_with_exception: r.controlsWithException,
  controls_without_owner: r.controlsWithoutOwner,
});

export const toControlResponsible = (r: ControlResponsibleRow) => ({ dimension: r.dimension, tests_count: r.testsCount, owner: person(r.owner), source: r.source });
