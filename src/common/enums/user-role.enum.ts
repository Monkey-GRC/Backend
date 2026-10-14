// Los 5 roles (modelo-datos.md §5.1, D63, D64). Mismos valores que platform.user_role. No hay roles personalizados.
export const USER_ROLES = ['admin_monkey', 'admin_empresa', 'funcional', 'consultor', 'auditor'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['active', 'inactive', 'suspended'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];
