import type { Principal } from '../../../../common/auth/principal';
import { can } from '../../../../common/authorization/permission-matrix';
import { DomainError } from '../../../../common/errors/domain-error';

export type ViewMode = 'business' | 'technical';

// La vista técnica (códigos de requisito y de control, estados de evaluación, todas las pruebas del control) es de quien tiene `reports.technical_view` en la matriz: `auditor` y
// `admin_empresa` (D81, SEG-54). Para el `responsable`, el `delegado` y `admin_monkey` pedirla es `403`.

export function viewModeOf(principal: Principal, view: 'technical' | undefined): ViewMode {
  if (view !== 'technical') return 'business';
  if (!can('reports.technical_view', principal.role)) throw new DomainError('FORBIDDEN');
  return 'technical';
}
