import { scopeOf, type Permission } from '../../../../common/authorization/permission-matrix';

/** Una persona con cuenta a cargo de un control (D102). */
export type ControlParty = { id: string; name: string | null; lastName: string | null; role: string };

/** Quién atiende un control: su dueño y su ejecutor, ambos activos (`platform.client_control_assignments`). El ejecutor es siempre un delegado del equipo del dueño. */
export type ControlAccess = { owner: ControlParty | null; executor: ControlParty | null };

export const NO_ACCESS: ControlAccess = { owner: null, executor: null };

export type Parties = { owner: { id: string } | null; executor: { id: string } | null };

/** La persona es el dueño o el ejecutor activo del control. */
export const isPartyOf = (userId: string, access: Parties): boolean => access.owner?.id === userId || access.executor?.id === userId;

/** La persona es el dueño activo del control. */
export const isOwnerOf = (userId: string, access: Parties): boolean => access.owner?.id === userId;

/**
 * D102, D118, D150 · Con un permiso acotado (⊗ en la matriz), la persona toca solo los controles de los que es dueño o ejecutor; con uno sin acotar, todos; sin él, ninguno.
 * El guard ya negó a quien no tiene el permiso: esto es la segunda barrera y el filtro de lo suyo.
 */
export const withinScope = (permission: Permission, p: { role: string; userId: string }, access: Parties): boolean => {
  const scope = scopeOf(permission, p.role);
  return scope === 'all' || (scope === 'scoped' && isPartyOf(p.userId, access));
};

/** Ver un control (`controls.view`): `responsable` y `delegado` solo los suyos; `admin_empresa` y `auditor`, todos. */
export const canSeeControl = (p: { role: string; userId: string }, access: Parties): boolean => withinScope('controls.view', p, access);
