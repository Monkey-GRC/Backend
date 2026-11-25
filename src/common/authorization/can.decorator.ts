import { SetMetadata } from '@nestjs/common';
import type { Permission } from './permission-matrix';

export const PERMISSION_KEY = 'permission';
export const ANY_AUTHENTICATED_KEY = 'anyAuthenticated';

/** El permiso de la matriz (§5.5) que exige la ruta. En un método manda sobre el de la clase. Sin él, el `PermissionsGuard` responde 403. */
export const Can = (permission: Permission) => SetMetadata(PERMISSION_KEY, permission);

/** Cualquier cuenta con sesión, sea cual sea su rol (datos que no son de una empresa, p. ej. las etiquetas de los catálogos). Es una decisión explícita, no un descuido. */
export const AnyAuthenticated = () => SetMetadata(ANY_AUTHENTICATED_KEY, true);
