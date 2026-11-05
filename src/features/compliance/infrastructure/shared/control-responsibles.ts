import { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { Dimension } from '../../domain/controls/control-readout';

// D102 · Quién hace el trabajo de un control: su dueño y su ejecutor (platform.client_control_assignments), activos. Se expone por dimensión para no cambiar la forma que consumen
// los lectores; todas las dimensiones en que el control tiene pruebas llevan a las mismas personas.
// DT-87: transitorio hasta MD-193 (visibilidad por dueño/ejecutor)
export const DIMENSION_ORDER: readonly Dimension[] = ['policy', 'server', 'database', 'app', 'cloud'];

export type ControlResponsibles = {
  /** control → dimensión → el dueño y el ejecutor del control. */
  byControl: Map<string, Map<Dimension, string[]>>;
};

export async function loadControlResponsibles(tx: TransactionClient, controlIds: string[]): Promise<ControlResponsibles> {
  const byControl = new Map<string, Map<Dimension, string[]>>();
  if (!controlIds.length) return { byControl };

  const links = await tx.clientControlTest.findMany({ where: { clientControlId: { in: controlIds } }, select: { clientControlId: true, test: { select: { dimension: true } } } });
  const assignments = await tx.clientControlAssignment.findMany({
    where: { clientControlId: { in: controlIds } },
    select: { clientControlId: true, ownerId: true, executorId: true, owner: { select: { status: true } }, executor: { select: { status: true } } },
  });
  const peopleOf = new Map<string, string[]>();
  for (const a of assignments) {
    const people = [a.owner.status === 'active' ? a.ownerId : null, a.executorId && a.executor?.status === 'active' ? a.executorId : null].filter((u): u is string => !!u);
    peopleOf.set(a.clientControlId, people);
  }

  for (const l of links) {
    const dimension = l.test.dimension as Dimension;
    const users = peopleOf.get(l.clientControlId);
    if (!users?.length) continue;
    const dims = byControl.get(l.clientControlId) ?? new Map<Dimension, string[]>();
    dims.set(dimension, users);
    byControl.set(l.clientControlId, dims);
  }
  return { byControl };
}

/** Las personas que atienden un control en alguna de sus dimensiones, sin repetir. */
export const usersOf = (dims: ReadonlyMap<Dimension, string[]> | undefined): string[] => (dims ? [...new Set([...dims.values()].flat())] : []);
