import type { Principal } from '../../../../common/auth/principal';
import { isScopedRole } from '../../../../common/enums/user-role.enum';

/** D102 · `responsable` y `delegado` ven y tocan solo los controles que atienden (dueño o ejecutor); el resto de los roles, todos. */
export const canSeeControl = (p: Principal, assignedUserIds: readonly string[]): boolean => !isScopedRole(p.role) || assignedUserIds.includes(p.userId);
