// D162, D138 punto 3 · La prioridad de una brecha: la severidad del check frente a la criticidad del activo. Función pura; la usan el detalle del control y el aviso `direct_check_failed`.

export type GapPriority = 'critical' | 'high' | 'medium' | 'low';
export const GAP_PRIORITIES: readonly GapPriority[] = ['critical', 'high', 'medium', 'low'];

export type PriorityBasis = { severity: string | null; assetCriticality: string };

const LEVEL = { low: 1, medium: 2, high: 3, critical: 4, informational: 1 } as const;
const PRIORITY_OF_LEVEL: readonly GapPriority[] = ['low', 'low', 'medium', 'high', 'critical'];
const levelOf = (name: string): number => LEVEL[name as keyof typeof LEVEL] ?? LEVEL.medium;

/**
 * Cada parte pasa a un nivel (low 1, medium 2, high 3, critical 4; informational cuenta 1). Con severidad: el promedio redondeado hacia arriba. Sin severidad (la sonda no califica
 * sus checks, D141 punto 3): la criticidad del activo. Un valor que no es de la escala cuenta como medio, como siempre.
 */
export function gapPriority(basis: PriorityBasis): GapPriority {
  const asset = levelOf(basis.assetCriticality);
  const level = basis.severity === null ? asset : Math.ceil((levelOf(basis.severity) + asset) / 2);
  return PRIORITY_OF_LEVEL[level] as GapPriority;
}

/** De mayor a menor prioridad: 0 es `critical`. */
export const priorityRank = (p: GapPriority): number => GAP_PRIORITIES.indexOf(p);

/** De la más grave a la menos grave (enums.md `severity`). */
export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'informational'] as const;
export type Severity = (typeof SEVERITIES)[number];
const SEVERITY_ORDER = SEVERITIES;

/** Sin dato no hay severidad (nulo: la sonda no califica); un valor que no es de la escala cuenta como media. */
export function normalizeSeverity(s: string | null | undefined): Severity | null {
  const v = s?.trim().toLowerCase();
  if (!v) return null;
  return (SEVERITY_ORDER as readonly string[]).includes(v) ? (v as Severity) : 'medium';
}

/** La más grave de las dos; una severidad calificada gana a una sin calificar. */
export function worstSeverity(a: Severity | null, b: Severity | null): Severity | null {
  if (a === null) return b;
  if (b === null) return a;
  return SEVERITY_ORDER.indexOf(a) <= SEVERITY_ORDER.indexOf(b) ? a : b;
}
