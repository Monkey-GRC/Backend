// Construye, a partir de la hoja «Checks» del Excel del comité y del conjunto de reglas de la sonda, el catálogo de políticas y checks de servidores (D112).
// Dominio puro: sin Excel, sin archivos y sin base de datos (los scripts de extracción y de carga se los pasan). Así se prueba con datos chicos.
//
// Reglas que no se rompen:
//  - Una política del catálogo SIN su par en la sonda (o al revés) es un error: no se ofrece nada que la sonda no entregue (D112).
//  - Una política que no se reconoce como sistema operativo ni como base de datos/aplicación es un error: no se adivina su etiqueta.
//  - La asignación check → prueba entra como `monkey_proposed`: la hoja del comité no es la versión final (Carlos, 2026-11-11).
import { classifyPolicy, compareNewestFirst, PolicyClass, versionCode } from './classify-policy';

export type ExcelCheckRow = Record<string, unknown>;
export type RulesetPolicy = { id: string; name: string; file: string };

export type SeedPolicy = {
  scaId: string;
  yamlFile: string;
  benchmark: string;
  // La columna «Plataforma» del comité tal cual.
  platformLabel: string;
  // `platform` del catálogo de checks (clave natural de tres partes, D6).
  platform: string;
  checkCount: number;
  osCode: string | null;
  distribution: string | null;
  distributionName: string | null;
  versionLabel: string | null;
  versionCode: string | null;
  sortOrder: number;
  isOfferable: boolean;
};

export type SeedCheck = {
  platform: string;
  policyId: string;
  checkId: string;
  titleEn: string;
  titleEs: string | null;
  condition: string;
  remediation: string;
  remediationEs: string | null;
  translationOrigin: 'machine' | null;
  verificationRule: string | null;
  origin: 'cis_native';
  mappingProvenance: 'engine_native' | 'monkey_proposed';
  mappingConfidence: 'high' | 'low';
};

export type SeedMapping = { policyId: string; checkId: string; frameworkCode: 'soc2'; frameworkVersion: '2017'; requirementCode: string; provenance: 'engine_native' };
export type SeedTestCheck = { testCode: string; policyId: string; checkId: string; provenance: 'monkey_proposed'; confidence: null; rationale: string };

export type SondaDataset = {
  meta: { sourceFile: string; sourceSha256: string; sondaVersion: string; rulesetRef: string; counts: Record<string, number> };
  policies: SeedPolicy[];
  checks: SeedCheck[];
  mappings: SeedMapping[];
  testChecks: SeedTestCheck[];
  // Lo que se vio y NO impide cargar, pero hay que mirar.
  warnings: string[];
};

export const RATIONALE = 'Hoja «Checks» del Excel del comité (VF2). La hoja no es la versión final: queda propuesta hasta que el comité la ratifique.';

// Valor de la columna «Plataforma» → `platform` del catálogo. «Ol» es cómo el comité abrevió Oracle Linux; el resto se pasa a minúsculas con guion bajo.
const PLATFORM_SLUG: Record<string, string> = {
  Windows: 'windows', Debian: 'debian', Ubuntu: 'ubuntu', CentOS: 'centos', 'Red Hat': 'red_hat', AlmaLinux: 'almalinux', macOS: 'macos',
  'Amazon Linux': 'amazon_linux', 'Rocky Linux': 'rocky_linux', 'SUSE Linux Enterprise': 'suse', Ol: 'oracle_linux', Generic: 'linux_generic',
  Sunos: 'solaris', 'HP-UX': 'hp_ux', Aplicaciones: 'applications', Oracledb: 'oracle_db', Nginx: 'nginx', Mongodb: 'mongodb',
};

// En qué orden se listan las distribuciones: lo más usado primero; «otra distribución» al final de Linux.
const DISTRIBUTION_ORDER = ['ubuntu', 'debian', 'rhel', 'centos', 'alma', 'rocky', 'oracle_linux', 'amazon_linux', 'suse', 'linux_generic', 'windows_server', 'windows_desktop', 'macos', 'solaris', 'hp_ux'];

const text = (v: unknown): string => (v === null || v === undefined ? '' : String(v).trim());
const norm = (s: string): string => s.toLowerCase().replace(/[_\s]+/g, ' ').replace(/\.+$/, '').trim();
const list = (v: unknown): string[] => text(v).split(',').map((s) => s.trim()).filter(Boolean);
const slug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

export type BuildInput = {
  rows: readonly ExcelCheckRow[];
  ruleset: readonly RulesetPolicy[];
  // Requisitos de SOC 2 que existen en el catálogo cargado: un código que no está se informa (no se descarta en silencio).
  soc2RequirementCodes: ReadonlySet<string>;
  source: { file: string; sha256: string; sondaVersion: string; rulesetRef: string };
};

export function buildSondaDataset(input: BuildInput): SondaDataset {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Las políticas del comité y su par en la sonda, por nombre.
  const byName = new Map<string, RulesetPolicy[]>();
  for (const r of input.ruleset) byName.set(norm(r.name), [...(byName.get(norm(r.name)) ?? []), r]);
  const ids = input.ruleset.map((r) => r.id);
  for (const id of new Set(ids.filter((x, i) => ids.indexOf(x) !== i))) errors.push(`La sonda repite el id de política «${id}».`);

  const groups = new Map<string, { platformLabel: string; name: string; rows: ExcelCheckRow[] }>();
  for (const r of input.rows) {
    const platformLabel = text(r['Plataforma']);
    const name = text(r['Política']);
    const key = `${platformLabel}||${name}`;
    const g = groups.get(key) ?? { platformLabel, name, rows: [] };
    g.rows.push(r);
    groups.set(key, g);
  }

  type Draft = { scaId: string; yamlFile: string; g: { platformLabel: string; name: string; rows: ExcelCheckRow[] }; cls: PolicyClass };
  const drafts: Draft[] = [];
  const usedScaIds = new Set<string>();
  for (const g of groups.values()) {
    const hit = byName.get(norm(g.name)) ?? [];
    if (hit.length === 0) { errors.push(`La política «${g.name}» (${g.platformLabel}) está en el catálogo del comité pero la sonda no la entrega.`); continue; }
    if (hit.length > 1) { errors.push(`La política «${g.name}» coincide con ${hit.length} de la sonda (${hit.map((h) => h.id).join(', ')}): no se puede elegir.`); continue; }
    const cls = classifyPolicy(g.platformLabel, g.name);
    if (!cls) { errors.push(`No se reconoce la política «${g.name}» (plataforma «${g.platformLabel}»): hay que enseñarle a classifyPolicy qué es antes de ofrecerla.`); continue; }
    if (!PLATFORM_SLUG[g.platformLabel]) { errors.push(`La plataforma «${g.platformLabel}» no tiene su nombre en el catálogo.`); continue; }
    usedScaIds.add(hit[0].id);
    drafts.push({ scaId: hit[0].id, yamlFile: hit[0].file, g, cls });
  }
  for (const r of input.ruleset) if (!usedScaIds.has(r.id)) errors.push(`La sonda entrega la política «${r.name}» (${r.id}) y el catálogo del comité no la tiene.`);

  // 2. Orden y código de versión. Las políticas de un mismo sistema y versión (p. ej. dos de HP-UX 11i) no se pueden ofrecer las dos: gana la de id más corto y
  // la otra queda cargada pero NO ofrecida, con un código distinto para que el único de la base no choque.
  const os = drafts.filter((d) => d.cls.osCode !== null);
  const baseCode = (d: Draft) => versionCode(d.cls.distribution!, d.cls.versionLabel!);
  const byCode = new Map<string, Draft[]>();
  for (const d of os) byCode.set(baseCode(d), [...(byCode.get(baseCode(d)) ?? []), d]);
  const demoted = new Set<Draft>();
  for (const [code, ds] of byCode) {
    if (ds.length < 2) continue;
    const sorted = [...ds].sort((a, b) => a.scaId.length - b.scaId.length || a.scaId.localeCompare(b.scaId));
    sorted.slice(1).forEach((d) => demoted.add(d));
    warnings.push(`«${code}» la tienen ${ds.length} políticas de la sonda (${sorted.map((d) => d.scaId).join(', ')}): solo se ofrece ${sorted[0].scaId}.`);
  }

  const rank = (d: Draft) => {
    const dist = DISTRIBUTION_ORDER.indexOf(d.cls.distribution ?? '');
    return dist === -1 ? DISTRIBUTION_ORDER.length : dist;
  };
  const sortedOs = [...os].sort((a, b) => rank(a) - rank(b) || compareNewestFirst(a.cls.sortKey, b.cls.sortKey) || a.scaId.localeCompare(b.scaId));
  const sortOrderOf = new Map<Draft, number>();
  sortedOs.forEach((d, i) => sortOrderOf.set(d, (i + 1) * 10));

  const policies: SeedPolicy[] = drafts
    .map((d): SeedPolicy => {
      const isOs = d.cls.osCode !== null;
      const base = isOs ? baseCode(d) : null;
      return {
        scaId: d.scaId,
        yamlFile: d.yamlFile,
        benchmark: d.g.name,
        platformLabel: d.g.platformLabel,
        platform: PLATFORM_SLUG[d.g.platformLabel],
        checkCount: d.g.rows.length,
        osCode: d.cls.osCode,
        distribution: d.cls.distribution,
        distributionName: d.cls.distributionName,
        versionLabel: d.cls.versionLabel,
        versionCode: base === null ? null : demoted.has(d) ? `${base}_${slug(d.scaId)}` : base,
        sortOrder: isOs ? sortOrderOf.get(d)! : 0,
        // Se ofrece lo que es un sistema operativo, la sonda entrega y tiene checks. Lo demás queda cargado y sin ofrecer.
        isOfferable: isOs && !demoted.has(d) && d.g.rows.length > 0,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || a.scaId.localeCompare(b.scaId));

  // 3. Checks, su mapeo a SOC 2 (la sonda etiqueta `tsc` en unas políticas y `soc_2` en otras: es el mismo marco) y su asignación propuesta a las pruebas.
  const scaIdOf = new Map(drafts.map((d) => [`${d.g.platformLabel}||${d.g.name}`, d.scaId]));
  const checks: SeedCheck[] = [];
  const mappings: SeedMapping[] = [];
  const testChecks: SeedTestCheck[] = [];
  const unknownRequirements = new Map<string, number>();
  const seen = new Set<string>();

  for (const [key, g] of groups) {
    const policyId = scaIdOf.get(key);
    if (!policyId) continue;
    const platform = PLATFORM_SLUG[g.platformLabel];
    for (const r of g.rows) {
      const checkId = text(r['Check ID']);
      if (!checkId) { errors.push(`Un check de «${g.name}» no tiene id.`); continue; }
      if (seen.has(`${policyId}|${checkId}`)) { errors.push(`El check ${checkId} de «${g.name}» está repetido.`); continue; }
      seen.add(`${policyId}|${checkId}`);
      const titleEn = text(r['Título']);
      if (!titleEn) { errors.push(`El check ${checkId} de «${g.name}» no tiene título.`); continue; }

      const requirements = [...new Set([...list(r['SOC 2']), ...list(r['TSC'])])];
      const known = requirements.filter((c) => input.soc2RequirementCodes.has(c));
      for (const c of requirements) if (!input.soc2RequirementCodes.has(c)) unknownRequirements.set(c, (unknownRequirements.get(c) ?? 0) + 1);
      const remediationEs = text(r['Remediación (español)']);

      checks.push({
        platform,
        policyId,
        checkId,
        titleEn,
        titleEs: text(r['Título (español)']) || null,
        condition: text(r['Condición']),
        remediation: text(r['Remediación']),
        remediationEs: remediationEs || null,
        // Una traducción que ya viene escrita no está revisada por una persona: se marca como automática hasta que alguien la revise (D90).
        translationOrigin: remediationEs ? 'machine' : null,
        verificationRule: text(r['Regla de verificación']) || null,
        origin: 'cis_native',
        // El mapeo viene de las etiquetas de la propia sonda (alta confianza); sin etiqueta no hay mapeo propio y el check solo cuenta por su prueba.
        mappingProvenance: known.length > 0 ? 'engine_native' : 'monkey_proposed',
        mappingConfidence: known.length > 0 ? 'high' : 'low',
      });
      for (const code of known) mappings.push({ policyId, checkId, frameworkCode: 'soc2', frameworkVersion: '2017', requirementCode: code, provenance: 'engine_native' });
      for (const testCode of [...new Set(list(r['TEST']))]) testChecks.push({ testCode, policyId, checkId, provenance: 'monkey_proposed', confidence: null, rationale: RATIONALE });
    }
  }
  if (unknownRequirements.size > 0) {
    warnings.push(`Requisitos de SOC 2 que la sonda cita y el catálogo no tiene (no se mapean): ${[...unknownRequirements].map(([c, n]) => `${c} (${n})`).join(', ')}.`);
  }

  if (errors.length > 0) throw new Error(`El catálogo de la sonda no se puede construir:\n - ${errors.join('\n - ')}`);

  return {
    meta: {
      sourceFile: input.source.file,
      sourceSha256: input.source.sha256,
      sondaVersion: input.source.sondaVersion,
      rulesetRef: input.source.rulesetRef,
      counts: { policies: policies.length, offerable: policies.filter((p) => p.isOfferable).length, checks: checks.length, mappings: mappings.length, testChecks: testChecks.length },
    },
    policies,
    checks,
    mappings,
    testChecks,
    warnings,
  };
}
