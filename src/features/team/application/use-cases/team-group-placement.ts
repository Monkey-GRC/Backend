import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { GroupKind, RESPONSIBLES_GROUP_NAME } from '../../domain/team.types';

// contracts/gestion-usuarios.md · «Quién puede qué» y «Crear un grupo». Reglas puras: quién crea qué grupo y cómo se compara un nombre.
// Que el líder elegido exista y sea un responsable de la empresa lo resuelve el repositorio dentro de la transacción de la creación.

/**
 * Un nombre se compara sin mayúsculas ni espacios de más: «  responsables », «RESPONSABLES» y «Responsables» son el mismo.
 * La base guarda el nombre con los espacios ya normalizados (`cleanGroupName`); la comparación sin mayúsculas solo vale para el nombre reservado.
 */
export const cleanGroupName = (name: string): string => name.trim().replace(/\s+/g, ' ');
export const isReservedGroupName = (name: string): boolean => cleanGroupName(name).toLocaleLowerCase('es') === RESPONSIBLES_GROUP_NAME.toLocaleLowerCase('es');

/** El grupo por omisión de los responsables (D104): un grupo de responsables que lleva el nombre reservado. No se renombra. */
export const isDefaultResponsiblesGroup = (g: { name: string; kind: GroupKind }): boolean => g.kind === 'responsables' && isReservedGroupName(g.name);

export type GroupCreationPlan = { kind: GroupKind; leaderId: string };

/** `leaderId` es el `leader_id` del cuerpo (null si no vino). */
export function planGroupCreation(creator: Pick<Principal, 'userId' | 'role'>, leaderId: string | null): GroupCreationPlan {
  if (creator.role === 'admin_empresa') return leaderId === null ? { kind: 'responsables', leaderId: creator.userId } : { kind: 'team', leaderId };
  // El responsable solo crea SU equipo: mandar el id de otra persona es pedir algo que no es suyo.
  if (creator.role === 'responsable') {
    if (leaderId !== null && leaderId !== creator.userId) throw new DomainError('FORBIDDEN');
    return { kind: 'team', leaderId: creator.userId };
  }
  throw new DomainError('FORBIDDEN');
}
