import { isScopedRole } from '../../../../common/enums/user-role.enum';

/** Una persona con cuenta a cargo de un control (D102). */
export type ControlParty = { id: string; name: string | null; lastName: string | null; role: string };

/** Quién atiende un control: su dueño y su ejecutor, ambos activos (`platform.client_control_assignments`). El ejecutor es siempre un delegado del equipo del dueño. */
export type ControlAccess = { owner: ControlParty | null; executor: ControlParty | null };

export const NO_ACCESS: ControlAccess = { owner: null, executor: null };

type Parties = { owner: { id: string } | null; executor: { id: string } | null };

/** La persona es el dueño o el ejecutor activo del control. */
export const isPartyOf = (userId: string, access: Parties): boolean => access.owner?.id === userId || access.executor?.id === userId;

/** D102, D118 · `responsable` y `delegado` ven y tocan solo los controles de los que son dueño o ejecutor; el resto de los roles, todos. */
export const canSeeControl = (p: { role: string; userId: string }, access: Parties): boolean => !isScopedRole(p.role) || isPartyOf(p.userId, access);
