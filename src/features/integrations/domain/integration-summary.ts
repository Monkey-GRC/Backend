import { ConnectionRecord, ConnectionSummary, IntegrationConnections, IntegrationStatusValue, IntegrationSummary } from './entities/integration.entities';

// Un problema de conexión, no un incumplimiento (D57): la validación falló o el activo está en error.
export const needsAttention = (c: Pick<ConnectionRecord, 'connectionStatus' | 'operationalStatus'>): boolean =>
  c.connectionStatus === 'failed' || c.operationalStatus === 'error';

// De la más grave a la menos (D110): needs_attention > active > pending.
export function deriveStatus(connections: Pick<ConnectionRecord, 'connectionStatus' | 'operationalStatus'>[]): IntegrationStatusValue {
  if (connections.some(needsAttention)) return 'needs_attention';
  if (connections.some((c) => c.connectionStatus === 'active' || c.connectionStatus === 'scheduled')) return 'active';
  return 'pending';
}

const STATUS_ORDER: Record<IntegrationStatusValue, number> = { needs_attention: 0, active: 1, pending: 2 };

const latest = (dates: (Date | null)[]): Date | null =>
  dates.reduce<Date | null>((max, d) => (d && (!max || d > max) ? d : max), null);

// Una fila por integración con al menos una conexión vigente; todo se deriva de las conexiones y no se guarda nada.
export function summarizeIntegrations(rows: IntegrationConnections[]): IntegrationSummary[] {
  return rows
    .filter((r) => r.connections.length > 0)
    .map((r): IntegrationSummary => ({
      code: r.code,
      name: r.name,
      logoKey: r.logoKey,
      purpose: r.purpose,
      status: deriveStatus(r.connections),
      connectionCount: r.connections.length,
      resourceCount: r.connections.reduce((sum, c) => sum + c.resourceCount, 0),
      lastValidatedAt: latest(r.connections.map((c) => c.lastValidatedAt)),
      connections: r.connections
        .map((c): ConnectionSummary => ({ ...c, needsAttention: needsAttention(c) }))
        .sort((a, b) => a.code.localeCompare(b.code)),
    }))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name));
}
