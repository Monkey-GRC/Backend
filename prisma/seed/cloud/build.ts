// Checks del motor de nube y su mapeo a los marcos (D53, D56), leídos de la hoja «Checks prowler» de la VF18 (motor 5.45.0, 20 plataformas).
// Funciones puras: sin base de datos ni archivos. Los vínculos prueba–check ya no se proponen aquí: los define el comité en TEST_CHECKS (DEV-12) y los cruza
// `catalog/checks-cross.ts` con las claves de estos datasets.
import { normalizeSoc2Requirement } from '../catalog/parse';

// Código de cada plataforma del motor (clave `checks.platform`) por su etiqueta en el libro. Los códigos de las 18 plataformas nuevas son de desarrollo.
export const PLATFORM_BY_LABEL = {
  AWS: 'aws',
  Azure: 'azure',
  'Microsoft 365': 'microsoft_365',
  GCP: 'gcp',
  Kubernetes: 'kubernetes',
  'Alibaba Cloud': 'alibaba_cloud',
  'Google Workspace': 'google_workspace',
  'Oracle Cloud (OCI)': 'oracle_cloud',
  OpenStack: 'openstack',
  Cloudflare: 'cloudflare',
  Okta: 'okta',
  'E2E Networks': 'e2e_networks',
  GitHub: 'github',
  'Huawei Cloud': 'huawei_cloud',
  Vercel: 'vercel',
  'Linode (Akamai)': 'linode',
  'MongoDB Atlas': 'mongodb_atlas',
  STACKIT: 'stackit',
  'NHN Cloud': 'nhn_cloud',
  Scaleway: 'scaleway',
} as const;

export type Platform = (typeof PLATFORM_BY_LABEL)[keyof typeof PLATFORM_BY_LABEL];
export const PLATFORMS: Platform[] = Object.values(PLATFORM_BY_LABEL);
export const platformOfLabel = (label: string): Platform | null => (PLATFORM_BY_LABEL as Record<string, Platform>)[label] ?? null;

// El motor de nube no tiene «política» como la sonda (que agrupa checks en un benchmark): una constante mantiene la clave
// de tres partes (platform + policy_id + check_id) sin inventar una agrupación.
export const POLICY_ID = 'cloud_configuration';

export type EngineRow = Record<string, unknown>;

export type SeedCheck = {
  platform: string;
  policyId: string;
  checkId: string;
  titleEn: string;
  titleEs: null;
  condition: string;
  remediation: string;
  verificationRule: null;
  origin: 'engine_native';
  mappingProvenance: string;
  mappingConfidence: 'high' | 'low';
  serviceName: string;
  // La hoja del libro no trae el tipo de recurso ni las categorías del motor.
  resourceType: string | null;
  engineSeverity: string;
  categories: string[];
};
export type SeedMapping = { checkId: string; frameworkCode: string; frameworkVersion: string; requirementCode: string; provenance: 'engine_native' };

// Columnas de marcos del libro que Monkey ofrece (D50) → código del marco. Las demás columnas de la hoja (43 marcos) se descartan: se agregan cuando se activen.
export const OFFERED_COLUMNS: { column: string; code: string; codeVersion: string }[] = [
  { column: 'SOC 2', code: 'soc2', codeVersion: '2017' },
  { column: 'ISO 27001:2022', code: 'iso27001', codeVersion: '2022' },
  { column: 'HIPAA', code: 'hipaa', codeVersion: '' },
  { column: 'GDPR', code: 'gdpr', codeVersion: '' },
  { column: 'PCI DSS v4.0', code: 'pci_dss', codeVersion: '4.0' },
  { column: 'NIST CSF 2.0', code: 'nist_csf', codeVersion: '2.0' },
];

export type CloudDataset = { engineVersion: string; sourceSha256: string; checks: SeedCheck[]; mappings: SeedMapping[] };

const text = (v: unknown): string => (v === null || v === undefined ? '' : String(v).replace(/\r\n?/g, '\n').trim());
const list = (v: unknown): string[] => text(v).split(',').map((s) => s.trim()).filter(Boolean);

/** Un dataset por plataforma a partir de las filas de la hoja del motor de nube. */
export function buildCloudDatasets(
  rows: readonly EngineRow[],
  source: { engineVersion: string; sourceSha256: string },
): { datasets: Map<Platform, CloudDataset>; errors: string[] } {
  const errors: string[] = [];
  const datasets = new Map<Platform, CloudDataset>();
  const seen = new Set<string>();
  for (const r of rows) {
    const label = text(r['Plataforma']);
    const platform = platformOfLabel(label);
    const checkId = text(r['Check ID']);
    if (!platform) {
      errors.push(`La plataforma «${label}» (check ${checkId}) no tiene código en el catálogo.`);
      continue;
    }
    if (!checkId) {
      errors.push(`Un check de ${label} no tiene id.`);
      continue;
    }
    if (seen.has(`${platform}|${checkId}`)) {
      errors.push(`El check ${checkId} de ${label} está repetido.`);
      continue;
    }
    seen.add(`${platform}|${checkId}`);
    const titleEn = text(r['Título']);
    if (!titleEn) {
      errors.push(`El check ${checkId} de ${label} no tiene título.`);
      continue;
    }
    const ds = datasets.get(platform) ?? { engineVersion: source.engineVersion, sourceSha256: source.sourceSha256, checks: [], mappings: [] };
    datasets.set(platform, ds);

    let nativeSoc2 = false;
    const mapped = new Set<string>();
    for (const o of OFFERED_COLUMNS) {
      for (const id of list(r[o.column])) {
        const code = o.code === 'soc2' ? normalizeSoc2Requirement(id) : id;
        if (!code) {
          errors.push(`${label} · ${checkId}: requisito SOC 2 con formato desconocido: ${id}`);
          continue;
        }
        const key = `${o.code}|${o.codeVersion}|${code}`;
        if (mapped.has(key)) continue;
        mapped.add(key);
        ds.mappings.push({ checkId, frameworkCode: o.code, frameworkVersion: o.codeVersion, requirementCode: code, provenance: 'engine_native' });
        if (o.code === 'soc2') nativeSoc2 = true;
      }
    }
    ds.checks.push({
      platform,
      policyId: POLICY_ID,
      checkId,
      titleEn,
      titleEs: null,
      condition: text(r['Qué evalúa']),
      remediation: text(r['Remediación']),
      verificationRule: null,
      origin: 'engine_native',
      mappingProvenance: `engine:${platform}:${source.engineVersion}`,
      mappingConfidence: nativeSoc2 ? 'high' : 'low',
      serviceName: text(r['Servicio']),
      resourceType: null,
      engineSeverity: text(r['Severidad']),
      categories: [],
    });
  }
  for (const ds of datasets.values()) {
    ds.checks.sort((a, b) => a.checkId.localeCompare(b.checkId));
    ds.mappings.sort((a, b) => a.frameworkCode.localeCompare(b.frameworkCode) || a.requirementCode.localeCompare(b.requirementCode) || a.checkId.localeCompare(b.checkId));
  }
  return { datasets, errors };
}
