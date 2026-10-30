import { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { Dimension } from '../../domain/controls/control-readout';

// D96, SEG-66 · El responsable efectivo de un par (control, dimensión): la excepción del control si existe; si no, el responsable del servicio en esa dimensión; si tampoco,
// nadie. Se calcula al leer: no hay una fila por control, así que cambiar al responsable del servicio mueve a todos los controles sin excepción (modelo/05-usuarios.md).
// Solo cuentan las dimensiones en las que el control tiene pruebas.
export const DIMENSION_ORDER: readonly Dimension[] = ['policy', 'server', 'database', 'app', 'cloud'];

export type PersonName = { id: string; name: string | null; lastName: string | null };
export type ControlResponsibles = {
  /** control → dimensión → usuario responsable. */
  byControl: Map<string, Map<Dimension, string>>;
  people: Map<string, PersonName>;
};

export async function loadControlResponsibles(tx: TransactionClient, serviceId: string, controlIds: string[]): Promise<ControlResponsibles> {
  const byControl = new Map<string, Map<Dimension, string>>();
  const people = new Map<string, PersonName>();
  if (!controlIds.length) return { byControl, people };

  const links = await tx.clientControlTest.findMany({ where: { clientControlId: { in: controlIds } }, select: { clientControlId: true, test: { select: { dimension: true } } } });
  const exceptions = await tx.userControlAssignment.findMany({ where: { clientControlId: { in: controlIds } }, select: { clientControlId: true, dimension: true, userId: true } });
  const owners = await tx.serviceDimensionOwner.findMany({ where: { serviceId }, select: { dimension: true, userId: true } });

  for (const l of links) {
    const dimension = l.test.dimension as Dimension;
    const exception = exceptions.find((e) => e.clientControlId === l.clientControlId && e.dimension === dimension);
    const userId = exception?.userId ?? owners.find((o) => o.dimension === dimension)?.userId;
    if (!userId) continue;
    const dims = byControl.get(l.clientControlId) ?? new Map<Dimension, string>();
    dims.set(dimension, userId);
    byControl.set(l.clientControlId, dims);
  }

  const ids = [...new Set([...byControl.values()].flatMap((m) => [...m.values()]))];
  if (ids.length) for (const u of await tx.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, lastName: true } })) people.set(u.id, u);
  return { byControl, people };
}

/** Las personas responsables de un control en alguna de sus dimensiones, sin repetir y en el orden de las dimensiones. */
export const usersOf = (dims: ReadonlyMap<Dimension, string> | undefined): string[] =>
  dims ? [...new Set(DIMENSION_ORDER.flatMap((d) => (dims.has(d) ? [dims.get(d) as string] : [])))] : [];
