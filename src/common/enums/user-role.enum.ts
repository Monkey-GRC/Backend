// Los 4 roles del comité (modelo-datos.md §5.1). Mismos valores que platform.user_role.
export const USER_ROLES = ['admin_monkey', 'admin_empresa', 'funcional', 'auditor'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['active', 'inactive', 'suspended'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];
