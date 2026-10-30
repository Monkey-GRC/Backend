import { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { Dimension } from '../../domain/controls/control-readout';

// D98 · Quién hace el trabajo de un control en una dimensión: por ahora, TODOS los `funcional` activos de la empresa que tienen esa especialidad. No hace falta asignarles nada:
// quien entra con la dimensión «servidores» ve y atiende todo lo de servidores. El reparto a personas concretas (responsable de un servicio, excepción de un control) existe en
// la base y en la API, pero queda aparte hasta que se decida cómo usarlo; hoy no cambia lo que nadie ve. Solo cuentan las dimensiones en que el control tiene pruebas.
export const DIMENSION_ORDER: readonly Dimension[] = ['policy', 'server', 'database', 'app', 'cloud'];

export type ControlResponsibles = {
  /** control → dimensión → los `funcional` que la atienden. */
  byControl: Map<string, Map<Dimension, string[]>>;
};

export async function loadControlResponsibles(tx: TransactionClient, controlIds: string[]): Promise<ControlResponsibles> {
  const byControl = new Map<string, Map<Dimension, string[]>>();
  if (!controlIds.length) return { byControl };

  const links = await tx.clientControlTest.findMany({ where: { clientControlId: { in: controlIds } }, select: { clientControlId: true, test: { select: { dimension: true } } } });
  const specialists = await tx.userDimension.findMany({ where: { user: { role: 'funcional', status: 'active' } }, select: { userId: true, dimension: true } });
  const byDimension = new Map<string, string[]>();
  for (const s of specialists) byDimension.set(s.dimension, [...(byDimension.get(s.dimension) ?? []), s.userId]);

  for (const l of links) {
    const dimension = l.test.dimension as Dimension;
    const users = byDimension.get(dimension);
    if (!users?.length) continue;
    const dims = byControl.get(l.clientControlId) ?? new Map<Dimension, string[]>();
    dims.set(dimension, users);
    byControl.set(l.clientControlId, dims);
  }
  return { byControl };
}

/** Las personas que atienden un control en alguna de sus dimensiones, sin repetir. */
export const usersOf = (dims: ReadonlyMap<Dimension, string[]> | undefined): string[] => (dims ? [...new Set([...dims.values()].flat())] : []);
