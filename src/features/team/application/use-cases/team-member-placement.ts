import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { FieldError, ValidationException } from '../../../../common/errors/validation.exception';
import type { Placement } from '../../domain/repositories/team-user.repository';
import type { TeamRole } from '../../domain/team.types';

// contracts/gestion-usuarios.md · «Quién puede qué» y los campos `group_id` / `is_internal` del alta. Reglas puras: quién crea a quién y qué campos admite cada rol.
// Que el grupo exista y sirva de destino lo resuelve el repositorio dentro de la transacción del alta.

export type CreationRequest = { role: TeamRole; groupId: string | null; isInternal: boolean | null };
export type CreationPlan = { isInternal: boolean | null; placement: Placement };

export function planCreation(creator: Pick<Principal, 'userId' | 'role'>, req: CreationRequest): CreationPlan {
  // El administrador crea a cualquiera; el responsable, solo delegados; el resto no crea (la ruta ya lo filtra, esto es la segunda barrera).
  const mayCreate = creator.role === 'admin_empresa' || (creator.role === 'responsable' && req.role === 'delegado');
  if (!mayCreate) throw new DomainError('FORBIDDEN');

  const errors: FieldError[] = [];
  const isDelegate = req.role === 'delegado';
  const adminPlaces = creator.role === 'admin_empresa';
  if (isDelegate && req.isInternal === null) errors.push({ field: 'is_internal', code: 'required' });
  if (!isDelegate && req.isInternal !== null) errors.push({ field: 'is_internal', code: 'is_internal.not_allowed' });
  if (isDelegate && adminPlaces && req.groupId === null) errors.push({ field: 'group_id', code: 'required' });
  if (!isDelegate && req.role !== 'responsable' && req.groupId !== null) errors.push({ field: 'group_id', code: 'group_id.not_allowed' });
  if (errors.length > 0) throw new ValidationException(errors);

  if (req.role === 'responsable') return { isInternal: null, placement: { kind: 'responsibles-group', groupId: req.groupId } };
  if (isDelegate) {
    const placement: Placement = adminPlaces ? { kind: 'team-of', groupId: req.groupId as string } : { kind: 'own-team', leaderId: creator.userId, groupId: req.groupId };
    return { isInternal: req.isInternal, placement };
  }
  return { isInternal: null, placement: { kind: 'none' } };
}
