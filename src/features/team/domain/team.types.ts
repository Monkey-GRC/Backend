// El equipo de una empresa (contracts/gestion-usuarios.md, D102): quién es quién.

/** Los roles que el admin_empresa puede crear y mover: otro administrador, un responsable, un delegado o un auditor. Nunca admin_monkey. */
export const TEAM_ROLES = ['admin_empresa', 'responsable', 'delegado', 'auditor'] as const;
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
  createdAt: Date;
};

export type IssuedActivationCode = { code: string; status: 'pending'; expiresAt: Date };
