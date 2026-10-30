// El equipo de una empresa (contracts/modules/users-team.md, D96): quién es quién y de qué dimensión es responsable.

export const DIMENSIONS = ['policy', 'server', 'database', 'app', 'cloud'] as const;
export type Dimension = (typeof DIMENSIONS)[number];

/** Los roles que el admin_empresa puede crear y mover: otro administrador de su empresa, un funcional o un auditor. Nunca admin_monkey. */
export const TEAM_ROLES = ['admin_empresa', 'funcional', 'auditor'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export type TeamMember = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
  role: string;
  status: string;
  isMfaEnabled: boolean;
  lastLoginAt: Date | null;
  /** Solo un `funcional` tiene especialidades. */
  dimensions: Dimension[];
  createdAt: Date;
};

export type IssuedActivationCode = { code: string; status: 'pending'; expiresAt: Date };

export type PersonRef = { id: string; email: string; name: string | null; lastName: string | null };

/** De dónde sale el responsable efectivo de un par (control, dimensión). */
export type ResponsibleSource = 'control' | 'service';

export type DimensionOwnerRow = {
  dimension: Dimension;
  owner: PersonRef | null;
  controlsTotal: number;
  controlsWithException: number;
  controlsWithoutOwner: number;
};

export type ControlResponsibleRow = {
  dimension: Dimension;
  testsCount: number;
  owner: PersonRef | null;
  source: ResponsibleSource | null;
};
