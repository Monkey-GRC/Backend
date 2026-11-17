import { ConnectionMethodValue, OS_CONNECTION_CATEGORIES } from '../../../common/catalogs/technical-catalogs';
import { FieldError } from '../../../common/errors/validation.exception';
import { OsVersionRule } from '../domain/entities/technical-control.entities';

// La versión del sistema que el cliente declara para un servidor o un equipo con agente (D113). Funciones puras: sin Nest ni base de datos.
//
// Por qué se pide: de ella salen el comando de instalación correcto (Linux, Windows o macOS) y qué evaluación se espera. Y por qué solo aquí: una cuenta de
// nube (`ac_01`) o una base de datos no tienen un sistema operativo que declarar.

// ¿Este alta tiene que traer `os_version`? Solo un activo con agente cuya conexión es de sistemas operativos.
export const needsOsVersion = (category: string, method: ConnectionMethodValue): boolean => method === 'agent' && OS_CONNECTION_CATEGORIES.includes(category);

/**
 * Qué se puede decir de `os_version` sin tocar la base: si falta, si sobra, y (con lo que el catálogo devolvió) si es de ESTE sistema. `found` es la versión
 * que el catálogo ofrece con ese código, o `null` si no existe o la sonda no la entrega.
 */
export function checkOsVersion(input: {
  category: string;
  method: ConnectionMethodValue;
  platformCode: string;
  osVersion: string | null | undefined;
  found: OsVersionRule | null;
}): FieldError[] {
  const given = input.osVersion?.trim() || null;
  if (!needsOsVersion(input.category, input.method)) return given ? [{ field: 'os_version', code: 'field.not_allowed' }] : [];
  if (!given) return [{ field: 'os_version', code: 'required' }];
  // Un código que no existe, o que la sonda no entrega, no se acepta: no se promete una evaluación que no hay.
  if (!input.found) return [{ field: 'os_version', code: 'invalid' }];
  // La versión es de OTRO sistema (p. ej. Windows Server 2022 para una plataforma Linux): el comando saldría equivocado.
  if (input.found.osCode !== input.platformCode) return [{ field: 'os_version', code: 'invalid' }];
  return [];
}
