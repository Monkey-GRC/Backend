import { I18nContext } from 'nestjs-i18n';
import { testDisplayName } from '../../../common/text/test-display-name';
import { CatalogIntegration, IntegrationDetail, IntegrationSummary } from '../domain/entities/integration.entities';

type Translate = (key: string) => string;
const list = (t: Translate, key: string): string[] => {
  const v = t(key) as unknown;
  return Array.isArray(v) ? v.map(String) : [];
};

export const toCatalogIntegration = (i: CatalogIntegration, description: string) => ({
  code: i.code,
  name: i.name,
  logo_key: i.logoKey,
  purpose: i.purpose,
  availability: i.availability,
  description,
  connection: i.connection,
  connected: i.connected,
});

export const toIntegration = (i: IntegrationSummary) => ({
  code: i.code,
  name: i.name,
  logo_key: i.logoKey,
  purpose: i.purpose,
  status: i.status,
  connection_count: i.connectionCount,
  resource_count: i.resourceCount,
  last_validated_at: i.lastValidatedAt?.toISOString() ?? null,
  connections: i.connections.map((c) => ({
    asset_id: c.assetId,
    code: c.code,
    name: c.name,
    connection_status: c.connectionStatus,
    operational_status: c.operationalStatus,
    needs_attention: c.needsAttention,
    services: c.services.map((s) => ({ id: s.id, name: s.name })),
  })),
});

// El detalle: la forma de la lista (o su valor vacío si la empresa no la tiene) más el contenido, cuyos textos salen de i18n y cuya estructura sale del dominio.
export function toIntegrationDetail(d: IntegrationDetail, t: Translate) {
  const base = `integration.content.${d.item.code}`;
  const summary = d.summary ? toIntegration(d.summary) : null;
  return {
    ...toCatalogIntegration(d.item, t(`integration.description.${d.item.code}`)),
    status: summary?.status ?? null,
    connection_count: summary?.connection_count ?? 0,
    resource_count: summary?.resource_count ?? 0,
    last_validated_at: summary?.last_validated_at ?? null,
    connections: summary?.connections ?? [],
    overview: t(`${base}.overview`),
    features: list(t, `${base}.features`),
    prerequisites: d.content.full ? list(t, `${base}.prerequisites`) : [],
    permissions: d.content.permissions.map((p) => ({ name: t(`${base}.permissions.${p.key}.name`), detail: t(`${base}.permissions.${p.key}.detail`), scope: p.scope, access: p.access })),
    resource_types: d.content.resourceTypes,
    coverage: d.coverage && {
      tests: d.coverage.tests.map((x) => ({ code: x.code, name: testDisplayName(x, I18nContext.current()?.lang) })),
      controls_count: d.coverage.controlsCount,
      frameworks: d.coverage.frameworks.map((f) => ({ code: f.code, name: f.name, controls_count: f.controlsCount })),
    },
    security: d.content.security.map((topic) => ({ topic, text: t(`${base}.security.${topic}`) })),
    capabilities: list(t, `${base}.capabilities`),
    works_with: list(t, `${base}.works_with`),
  };
}
