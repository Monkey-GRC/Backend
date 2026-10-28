import type { Principal } from '../../../common/auth/principal';
import { DomainError } from '../../../common/errors/domain-error';

export type ViewMode = 'business' | 'technical';

// La vista técnica (códigos de requisito y de control, estados de evaluación, todas las pruebas del control) la piden `auditor` y, mientras
// los permisos por pantalla sigan abiertos (P3), `admin_empresa` (D81, SEG-54). Para el `funcional` y `admin_monkey` pedirla es `403`.
const TECHNICAL_ROLES = new Set(['admin_empresa', 'auditor']);

export function viewModeOf(principal: Principal, view: 'technical' | undefined): ViewMode {
  if (view !== 'technical') return 'business';
  if (!TECHNICAL_ROLES.has(principal.role)) throw new DomainError('FORBIDDEN');
  return 'technical';
}
