import type { TransactionClient } from './prisma.service';

// D117 · Quién hizo algo. Las columnas que atribuyen una acción a un admin_monkey no tienen clave foránea (la cuenta se purga a los 7 días de desactivarla y el audit trail
// no se reescribe): se resuelven aquí. Primero la cuenta (con la RLS de quien lee); si ya no existe, su sello (`audit.admin_tombstones`, solo lo lee admin_monkey).
export type Attribution = { id: string; name: string | null; lastName: string | null; role: string; purged: boolean };

export async function resolveAttributions(tx: TransactionClient, ids: ReadonlyArray<string | null | undefined>): Promise<Map<string, Attribution>> {
  const wanted = [...new Set(ids.filter((id): id is string => !!id))];
  const found = new Map<string, Attribution>();
  if (wanted.length === 0) return found;
  const users = await tx.user.findMany({ where: { id: { in: wanted } }, select: { id: true, name: true, lastName: true, role: true } });
  for (const u of users) found.set(u.id, { id: u.id, name: u.name, lastName: u.lastName, role: u.role, purged: false });
  const missing = wanted.filter((id) => !found.has(id));
  if (missing.length > 0) {
    const stamps = await tx.adminTombstone.findMany({ where: { userId: { in: missing } } });
    for (const s of stamps) found.set(s.userId, { id: s.userId, name: s.name, lastName: s.lastName, role: s.role, purged: true });
  }
  return found;
}
