import { UserRole } from '../enums/user-role.enum';
export type TenantScope = {
    companyId: string;
    userId?: string;
    role?: UserRole;
};
