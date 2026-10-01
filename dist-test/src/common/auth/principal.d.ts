import { UserRole } from '../enums/user-role.enum';
export type Principal = {
    userId: string;
    companyId: string;
    role: UserRole;
    sessionId: string;
};
