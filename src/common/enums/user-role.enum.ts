// Los 5 roles (modelo-datos.md §5.1, D102). Mismos valores que platform.user_role. No hay roles personalizados.
export const USER_ROLES = ['admin_monkey', 'admin_empresa', 'responsable', 'delegado', 'auditor'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** `responsable` y `delegado` ven solo los controles de los que son dueño o ejecutor (contracts/gestion-usuarios.md, D102). */
export const isScopedRole = (role: string): boolean => role === 'responsable' || role === 'delegado';

// pending (D95): la cuenta existe pero la persona aún no activó su código, así que no puede iniciar sesión.
export const USER_STATUSES = ['active', 'inactive', 'suspended', 'pending'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];
