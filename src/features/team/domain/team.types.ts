// El equipo de una empresa (contracts/gestion-usuarios.md, D102): quién es quién.

/** Los roles que el admin_empresa puede crear: otro administrador, un responsable, un delegado, un auditor o un colaborador (D136). Nunca admin_monkey. */
export const TEAM_ROLES = ['admin_empresa', 'responsable', 'delegado', 'auditor', 'colaborador'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

/** Nombre del grupo de responsables por omisión de una empresa; se crea al hacer falta (contracts/gestion-usuarios.md). */
export { RESPONSIBLES_GROUP_NAME } from '../../../common/text/responsibles-group';

/** Las dos clases de grupo (D104, enum `group_kind`): el de responsables lo lidera el admin_empresa; el equipo de delegados, un responsable. */
export const GROUP_KINDS = ['responsables', 'team'] as const;
export type GroupKind = (typeof GROUP_KINDS)[number];

export type GroupLeader = { id: string; name: string | null; lastName: string | null; role: string };

export type TeamGroup = { id: string; name: string; kind: GroupKind; leader: GroupLeader; membersCount: number };

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

/** El resultado de enviar el código de activación por correo. `failed`: la cuenta existe y se reenvía con la reemisión. El código nunca sale del correo (SEG-75). */
export type Invitation = { deliveryStatus: 'sent' | 'failed'; expiresAt: Date };

/** Quién invita y a qué empresa: lo que el correo de invitación dice de ambos. */
/** `null` si la fila ya no se encuentra: el correo usa palabras neutras. */
export type InvitationContext = { inviterName: string | null; companyName: string | null };

/** Un responsable (o administrador) vigente: lo que sirve de líder de un equipo. */
export const LIVE_STATUSES = ['active', 'pending'] as const;
export const isLiveStatus = (status: string | null): boolean => status !== null && (LIVE_STATUSES as readonly string[]).includes(status);

/** Dueño y ejecutor de un control (`client_control_assignments`); `null` en ambos = «Sin asignar». */
export type AssignmentState = { ownerId: string | null; executorId: string | null };
/** Un control cuyo dueño o ejecutor cambió por la baja o el movimiento de una persona: de ahí sale el rastro `control_assignment.set` (uno por control). */
export type ReleasedControl = { controlId: string; before: AssignmentState; after: AssignmentState };
