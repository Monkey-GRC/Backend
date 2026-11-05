import { DomainError } from '../errors/domain-error';

// D103 · El cupo de usuarios (`companies.max_users`) se hace cumplir en el servidor (SEG-72). Cuentan las cuentas de la empresa `active`, `pending` y `suspended`,
// de cualquier rol (también `admin_empresa`, `auditor` y delegados externos); `inactive` no cuenta, y por eso desactivar a alguien libera el cupo.
//
// La comprobación y el alta/reactivación tienen que ir en LA MISMA transacción, con la fila de la empresa bloqueada (`FOR UPDATE`): así dos altas simultáneas
// con un solo cupo libre se turnan y solo entra una. Por eso las funciones reciben el cliente de la transacción y no abren otra.
//
// El conteo NO lee `platform.users` directamente (tiene RLS por empresa y un `admin_monkey` vería 0 cuentas ajenas): pasa por `platform.company_users_count`, la
// única puerta que sabe contar para cualquier rol (un `admin_monkey` ve la empresa que pida; los demás, solo la suya) y la única que define qué estados cuentan.

/** Lo único que la función necesita de la transacción; lo cumple el cliente de transacción de Prisma (`withScope`). */
export interface QuotaDb {
  $queryRaw<T = unknown>(query: TemplateStringsArray, ...values: unknown[]): PromiseLike<T>;
}

export type UserQuota = {
  /** `null` = la empresa aún no tiene cupo fijado («sin tope»). */
  maxUsers: number | null;
  /** Cuentas que hoy cuentan para el cupo. */
  usersCount: number;
};

/**
 * Bloquea la fila de la empresa (`FOR UPDATE`) y devuelve su cupo y cuántas cuentas cuentan. Solo dentro de la transacción que va a escribir.
 * Es correcta para cualquier rol: el conteo sale de `platform.company_users_count`, no de una lectura sujeta a RLS.
 */
export async function lockUserQuota(db: QuotaDb, companyId: string): Promise<UserQuota> {
  const company = await db.$queryRaw<Array<{ max_users: number | null }>>`
    SELECT max_users FROM platform.companies WHERE id = ${companyId}::uuid FOR UPDATE`;
  if (company.length === 0) throw new DomainError('NOT_FOUND');
  const counted = await db.$queryRaw<Array<{ users_count: number }>>`
    SELECT users_count FROM platform.company_users_count(ARRAY[${companyId}::uuid])`;
  return { maxUsers: company[0].max_users, usersCount: counted[0]?.users_count ?? 0 };
}

/**
 * Comprueba que cabe UNA cuenta más (alta o reactivación) y, si no, responde `409 USER_LIMIT_REACHED` con `max_users` y `users_count`.
 * Sin cupo fijado (`null`) no hay tope.
 */
export async function assertUserRoom(db: QuotaDb, companyId: string): Promise<UserQuota> {
  const quota = await lockUserQuota(db, companyId);
  assertRoomIn(quota);
  return quota;
}

/**
 * La comprobación sola, sobre un cupo que YA se bloqueó con `lockUserQuota` en esta transacción. Existe para quien necesita tomar el turno del cupo antes de
 * leer otros datos (p. ej. el estado de la cuenta que va a reactivar) y decidir después, sin bloquear dos veces.
 */
export function assertRoomIn(quota: UserQuota): void {
  if (quota.maxUsers !== null && quota.usersCount >= quota.maxUsers) {
    throw new DomainError('USER_LIMIT_REACHED', { max_users: quota.maxUsers, users_count: quota.usersCount });
  }
}
