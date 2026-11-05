// El equipo de una empresa (contracts/gestion-usuarios.md, D102): quién es quién.

/** Los roles que el admin_empresa puede crear y mover: otro administrador, un responsable, un delegado o un auditor. Nunca admin_monkey. */
export const TEAM_ROLES = ['admin_empresa', 'responsable', 'delegado', 'auditor'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

/** Nombre del grupo de responsables por omisión de una empresa; se crea al hacer falta (contracts/gestion-usuarios.md). */
export const RESPONSIBLES_GROUP_NAME = 'Responsables';

export type TeamPerson = { id: string; name: string | null; lastName: string | null };

export type TeamMember = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
  role: string;
  status: string;
  isMfaEnabled: boolean;
  /** Solo `delegado`; nulo en los demás roles. */
  isInternal: boolean | null;
  group: { id: string; name: string } | null;
  /** Solo `delegado`: el líder de su grupo (no se guarda aparte). */
  responsible: TeamPerson | null;
  lastLoginAt: Date | null;
  createdAt: Date;
};

/** La invitación de una cuenta recién creada. `pending` hasta que el envío por correo exista (MD-190). El código nunca sale. */
export type Invitation = { deliveryStatus: 'sent' | 'failed' | 'pending'; expiresAt: Date };

export type IssuedActivationCode = { code: string; status: 'pending'; expiresAt: Date };
