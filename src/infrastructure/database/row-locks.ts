import { Prisma } from '../../../generated/prisma/client';
import { DomainError } from '../../common/errors/domain-error';
import type { TransactionClient } from './prisma.service';

// ORDEN DE BLOQUEO GLOBAL de toda escritura que audita en `features/team` (PATCH de usuarios, alta, reemisión de código, crear y renombrar grupos) y de lo que toca las
// mismas filas desde `features/auth` (cierre de sesión con auditoría, activación). Un solo orden en todas las rutas, para que dos transacciones nunca se esperen en ciclo:
//   1. Filas de usuario del ACTOR y del SUJETO, en orden ascendente por id: el sujeto con FOR UPDATE (choca con el KEY SHARE de las FK de las asignaciones, MD-192) y el actor con
//      FOR KEY SHARE (el insert de auditoría lo toma de todos modos por la FK `user_id`, así que se toma ANTES y en orden). Si actor = sujeto, un solo FOR UPDATE.
//      Con la fila del actor bloqueada nadie lo desactiva hasta el commit: la empresa nunca se queda sin administrador por dos bajas cruzadas.
//   2. Fila del GRUPO (alta con grupo, mover y reactivar: FOR SHARE; renombrar: FOR NO KEY UPDATE). Así renombrar un grupo y meter a alguien en él se turnan.
//   2b. Fila del responsable LÍDER con FOR SHARE (alta, mover, reactivar, crear el equipo): quien lo desactiva toma su fila FOR UPDATE (paso 1) antes de contar sus delegados.
//   3. Fila de la empresa (FOR UPDATE, cupo): la auditoría toma KEY SHARE sobre ella por la FK `tenant_id`, así que nadie debe esperar otra fila estando ya con ella.
//   4. Lo demás (sesiones, códigos de activación, asignaciones de controles): siempre DESPUÉS de las filas de usuario; las asignaciones, además, en orden por id.
// Nunca se pide una fila de un paso anterior después de tener una de uno posterior. Quien escribe en `sessions` o en `user_activation_codes` con auditoría toma antes la fila del usuario.

export type LockMode = 'UPDATE' | 'NO KEY UPDATE' | 'SHARE' | 'KEY SHARE';

// Cerrado y fijo: nunca llega texto de fuera a la sentencia.
const CLAUSE: Record<LockMode, Prisma.Sql> = {
  UPDATE: Prisma.raw('FOR UPDATE'),
  'NO KEY UPDATE': Prisma.raw('FOR NO KEY UPDATE'),
  SHARE: Prisma.raw('FOR SHARE'),
  'KEY SHARE': Prisma.raw('FOR KEY SHARE'),
};

/** Bloquea la fila del usuario y devuelve su estado ya bloqueado (null si no existe o RLS no la deja ver). */
export async function lockUserRow(tx: TransactionClient, id: string, mode: LockMode): Promise<string | null> {
  const rows = await tx.$queryRaw<Array<{ status: string }>>(Prisma.sql`SELECT status::text AS status FROM platform.users WHERE id = ${id}::uuid ${CLAUSE[mode]}`);
  return rows[0]?.status ?? null;
}

/** Bloquea la fila del grupo; false si no existe en esta empresa. */
export async function lockGroupRow(tx: TransactionClient, id: string, mode: LockMode): Promise<boolean> {
  const rows = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`SELECT id FROM platform.user_groups WHERE id = ${id}::uuid ${CLAUSE[mode]}`);
  return rows.length > 0;
}

/** Paso 2b. FOR SHARE sobre el responsable líder; devuelve su estado ya bloqueado (null si no existe). */
export const lockLeaderShare = (tx: TransactionClient, leaderId: string): Promise<string | null> => lockUserRow(tx, leaderId, 'SHARE');

/**
 * Paso 1. Bloquea al actor y (si hay) al sujeto en orden ascendente por id. El actor tiene que seguir `active` con la fila ya bloqueada: si otra transacción lo
 * desactivó antes, esta petición ya no es de nadie (ACCOUNT_INACTIVE) y no escribe nada. `actorMode = 'SHARE'` cuando el actor además es el líder que la operación protege.
 */
export async function lockActorAndSubject(tx: TransactionClient, actorId: string | undefined, subjectId: string | null, actorMode: 'KEY SHARE' | 'SHARE' = 'KEY SHARE'): Promise<void> {
  if (!actorId) throw new DomainError('ACCOUNT_INACTIVE');
  const ids = [...new Set([actorId, ...(subjectId ? [subjectId] : [])])].sort();
  let actorStatus: string | null = null;
  for (const id of ids) {
    const status = await lockUserRow(tx, id, id === subjectId ? 'UPDATE' : actorMode);
    if (id === actorId) actorStatus = status;
  }
  if (actorStatus !== 'active') throw new DomainError('ACCOUNT_INACTIVE');
}
