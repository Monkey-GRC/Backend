import { UserRole } from '../enums/user-role.enum';

// El usuario autenticado de la petición en curso, ya verificado contra la base.
export type Principal = {
  userId: string;
  companyId: string;
  role: UserRole;
  sessionId: string;
};
