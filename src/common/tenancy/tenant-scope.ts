import { UserRole } from '../enums/user-role.enum';

// Quién actúa y sobre qué empresa. La infraestructura lo convierte en las variables de sesión
// app.tenant_id / app.user_id / app.user_role que leen las políticas RLS (modelo-datos.md §4.4).
export type TenantScope = {
  companyId: string;
  userId?: string;
  role?: UserRole;
};
