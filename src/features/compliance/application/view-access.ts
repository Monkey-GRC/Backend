import type { Principal } from '../../../common/auth/principal';
import { DomainError } from '../../../common/errors/domain-error';

export type ViewMode = 'business' | 'technical';

// La vista técnica (códigos de requisito y de control, estados de evaluación) es de los roles `auditor` y `consultor` (D63, D64, SEG-54). Para
// cualquier otro —incluido `admin_empresa`— pedirla es `403`: no es un modo que active el cliente.
const TECHNICAL_ROLES = new Set(['auditor', 'consultor', 'admin_empresa']);

export function viewModeOf(principal: Principal, view: 'technical' | undefined): ViewMode {
  if (view !== 'technical') return 'business';
  if (!TECHNICAL_ROLES.has(principal.role)) throw new DomainError('FORBIDDEN');
  return 'technical';
}
