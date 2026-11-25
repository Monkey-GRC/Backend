// Los 6 roles (modelo-datos.md §5.1, D102, D136). Mismos valores que platform.user_role. No hay roles personalizados.
// El orden es el de las columnas de la matriz de permisos (`common/authorization/permission-matrix.ts`).
export const USER_ROLES = ['admin_monkey', 'admin_empresa', 'responsable', 'delegado', 'auditor', 'colaborador'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// pending (D95): la cuenta existe pero la persona aún no activó su código, así que no puede iniciar sesión.
export const USER_STATUSES = ['active', 'inactive', 'suspended', 'pending'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];
