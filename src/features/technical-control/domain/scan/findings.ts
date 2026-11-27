import { gapMessage, type CatalogCheck, type GapLanguage, type MessageText } from './gap-message';
import { priorityRank, worstSeverity, normalizeSeverity, type GapPriority, type Severity } from './gap-priority';

// D138 punto 3, D162, MD-502 · Las brechas de una prueba: una fila por check y activo. Convierte los FAIL de la última corrida de cada activo en ítems `gap`, `excepted` u `observation`.
// Lo que decide si un FAIL Directo es brecha abierta o exceptuada es el motor v2 (`direct` de cada activo, `gapScopeOf`); aquí no se repite esa regla.

export const MAX_RESOURCES_PER_FINDING = 50;

export type { GapLanguage };
export type FindingLanguage = GapLanguage;

/** Un FAIL de la última corrida de un activo: el check, el recurso afectado y desde cuándo falla (la racha actual). */
export type FailedRow = {
  checkId: string;
  role: 'direct' | 'complementary';
  assetId: string;
  assetName: string;
  assetCriticality: string;
  severity: string | null;
  check: CatalogCheck;
  resourceName: string | null;
  resourceUid: string | null;
  region: string | null;
  failingSince: Date;
};

export const GAP_KINDS = ['gap', 'excepted', 'observation'] as const;
export type GapKind = (typeof GAP_KINDS)[number];
export type FindingResource = { name: string | null; uid: string | null; region: string | null };
export type Person = { id: string; name: string | null; lastName: string | null };
export type Finding = {
  id: string;
  kind: GapKind;
  asset: { id: string; name: string; criticality: string };
  title: string;
  evaluated: MessageText | null;
  remediation: MessageText | null;
  priority: GapPriority | null;
  priorityBasis: { severity: Severity | null; assetCriticality: string } | null;
  resources: FindingResource[];
  resourcesTotal: number;
  exception: { id: string; effectiveUntil: string } | null;
  owner: Person | null;
  dueDate: string | null;
  failingSince: Date;
};

export type FindingsContext = {
  /** Por activo: `fail` (brecha abierta) o `fail_with_exception`, según el motor v2. Un activo ausente o `null` no tiene brecha Directa. */
  direct: ReadonlyMap<string, 'fail' | 'fail_with_exception' | null>;
  /** La excepción vigente de la prueba en cada activo. */
  exceptions: ReadonlyMap<string, { id: string; effectiveUntil: string }>;
  /** El plan aprobado y vigente de la prueba; si no hay, el responsable del control y sin fecha. */
  plan: { assignee: Person; dueDate: string } | null;
  controlOwner: Person | null;
  language: GapLanguage;
  fallbackTitle: string;
};

/** Lo que la base y el motor v2 entregan de una prueba para armar sus brechas. */
export type FindingSource = {
  control: { id: string; code: string; name: string };
  test: { id: string; code: string; displayName: string | null; displayNameEn: string | null };
  /** La corrida más reciente que se leyó; nulo si ningún activo tiene una completada. */
  measuredAt: Date | null;
  rows: FailedRow[];
  direct: FindingsContext['direct'];
  exceptions: FindingsContext['exceptions'];
  plan: FindingsContext['plan'];
  controlOwner: FindingsContext['controlOwner'];
};

export type FindingsSummary = { openGaps: number; excepted: number; observations: number };

/** El tipo de un FAIL: un Complementario es observación; un Directo, brecha o exceptuada según el motor; si el motor no lo cuenta como FAIL, no es nada. */
export function classifyFailure(role: FailedRow['role'], direct: 'fail' | 'fail_with_exception' | null | undefined): GapKind | null {
  if (role === 'complementary') return 'observation';
  if (direct === 'fail') return 'gap';
  if (direct === 'fail_with_exception') return 'excepted';
  return null;
}

const KIND_ORDER: Record<GapKind, number> = { gap: 0, excepted: 1, observation: 2 };

export function buildFindings(rows: readonly FailedRow[], ctx: FindingsContext): { items: Finding[]; summary: FindingsSummary } {
  type Entry = { first: FailedRow; kind: GapKind; severity: Severity | null; failingSince: Date; seen: Set<string>; resources: FindingResource[] };
  const entries = new Map<string, Entry>();
  for (const row of rows) {
    const kind = classifyFailure(row.role, ctx.direct.get(row.assetId));
    if (!kind) continue;
    const key = `${row.assetId}:${row.checkId}`;
    const severity = normalizeSeverity(row.severity);
    const entry = entries.get(key) ?? { first: row, kind, severity, failingSince: row.failingSince, seen: new Set<string>(), resources: [] };
    entry.severity = worstSeverity(entry.severity, severity);
    if (row.failingSince < entry.failingSince) entry.failingSince = row.failingSince;
    // El mismo recurso en dos regiones o dos cuentas cuenta una vez por identificador y región. Un servidor no trae recursos: el activo es el recurso.
    const resourceKey = `${row.resourceUid ?? row.resourceName ?? ''}|${row.region ?? ''}`;
    if ((row.resourceUid || row.resourceName) && !entry.seen.has(resourceKey)) {
      entry.seen.add(resourceKey);
      entry.resources.push({ name: row.resourceName, uid: row.resourceUid, region: row.region });
    }
    entries.set(key, entry);
  }

  const items = [...entries.entries()].map(([id, e]): Finding => {
    const { first } = e;
    const message = gapMessage({ check: first.check, severity: e.severity, assetCriticality: first.assetCriticality, language: ctx.language, fallbackTitle: ctx.fallbackTitle });
    const resources = [...e.resources].sort((a, b) => (a.name ?? a.uid ?? '').localeCompare(b.name ?? b.uid ?? ''));
    const owned = e.kind !== 'observation';
    return {
      id,
      kind: e.kind,
      asset: { id: first.assetId, name: first.assetName, criticality: first.assetCriticality },
      title: message.title,
      evaluated: message.evaluated,
      remediation: message.remediation,
      priority: owned ? message.priority : null,
      priorityBasis: owned ? message.priorityBasis : null,
      resources: resources.slice(0, MAX_RESOURCES_PER_FINDING),
      resourcesTotal: resources.length,
      exception: e.kind === 'excepted' ? (ctx.exceptions.get(first.assetId) ?? null) : null,
      owner: owned ? (ctx.plan?.assignee ?? ctx.controlOwner) : null,
      dueDate: owned ? (ctx.plan?.dueDate ?? null) : null,
      failingSince: e.failingSince,
    };
  });

  items.sort(
    (a, b) =>
      KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
      (a.kind === 'gap' ? priorityRank(a.priority as GapPriority) - priorityRank(b.priority as GapPriority) : 0) ||
      a.title.localeCompare(b.title) ||
      a.asset.name.localeCompare(b.asset.name) ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
  const count = (kind: GapKind) => items.filter((i) => i.kind === kind).length;
  return { items, summary: { openGaps: count('gap'), excepted: count('excepted'), observations: count('observation') } };
}
