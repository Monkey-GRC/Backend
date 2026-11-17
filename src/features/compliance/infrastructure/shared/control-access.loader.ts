import { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { ControlAccess, ControlParty } from '../../domain/controls/control-access';

const PERSON = { select: { id: true, name: true, lastName: true, role: true, status: true } } as const;

type PersonRow = { id: string; name: string | null; lastName: string | null; role: string; status: string } | null;

const activeParty = (u: PersonRow): ControlParty | null => (u && u.status === 'active' ? { id: u.id, name: u.name, lastName: u.lastName, role: u.role } : null);

/**
 * D102 · El dueño y el ejecutor ACTIVOS de cada control, en una sola consulta sin importar cuántos controles sean. Un control sin fila o con la persona dada de baja
 * no tiene a esa persona. MISMA regla en `services/.../service.prisma.repository.ts` (`assignedTo`) y `technical-control/.../scan.prisma.repository.ts` (responsables de un test automático): un cambio toca los tres. Es lo único que decide quién ve y toca un control (`canSeeControl`).
 */
export async function loadControlAccess(tx: TransactionClient, controlIds: string[]): Promise<Map<string, ControlAccess>> {
  const byControl = new Map<string, ControlAccess>();
  if (!controlIds.length) return byControl;
  const rows = await tx.clientControlAssignment.findMany({ where: { clientControlId: { in: controlIds } }, select: { clientControlId: true, owner: PERSON, executor: PERSON } });
  for (const r of rows) byControl.set(r.clientControlId, { owner: activeParty(r.owner), executor: activeParty(r.executor) });
  return byControl;
}
