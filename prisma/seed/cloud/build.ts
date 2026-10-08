// Checks del motor de nube y su mapeo al modelo de Monkey (D53, D56). Funciones puras: sin base de datos ni archivos.
//
// El motor mapea check → requisito de CADA marco. Monkey evalúa check → prueba → control → punto de enfoque → requisito, y
// el eslabón check → prueba es del comité. Aquí se PROPONE (`monkey_proposed`) desde las categorías del motor y los atributos
// de cada prueba T-CLD; el mapeo propio del motor se guarda con su procedencia (`engine_native`). Gana siempre el del comité.

export const PLATFORM = 'aws';
// El motor de nube no tiene «política» como la sonda (que agrupa checks en un benchmark): una constante mantiene la clave
// de tres partes (platform + policy_id + check_id) sin inventar una agrupación.
export const POLICY_ID = 'cloud_configuration';

export type EngineCheckMeta = {
  CheckID: string;
  CheckTitle: string;
  ServiceName: string;
  Severity: string;
  ResourceType: string;
  Description: string;
  Categories?: string[];
  Remediation?: { Recommendation?: { Text?: string } };
};
export type EngineRequirement = { Id: string; Checks: string[] };
export type EngineFramework = { Framework: string; Version: string; Requirements: EngineRequirement[] };

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
  resourceType: string;
  engineSeverity: string;
  categories: string[];
};
export type SeedMapping = { checkId: string; frameworkCode: string; frameworkVersion: string; requirementCode: string; provenance: 'engine_native' };
export type SeedTestCheck = { testCode: string; checkId: string; provenance: 'monkey_proposed'; confidence: 'high' | 'medium' | 'low'; rationale: string };

// Los marcos que Monkey ofrece (D50) y que el motor mapea. Los demás (43 en total) se descartan: se agregan cuando se activen.
export const OFFERED_FRAMEWORKS: { engineName: string; version: string; code: string; codeVersion: string }[] = [
  { engineName: 'SOC2', version: '', code: 'soc2', codeVersion: '2017' },
  { engineName: 'ISO27001', version: '2022', code: 'iso27001', codeVersion: '2022' },
  { engineName: 'HIPAA', version: '', code: 'hipaa', codeVersion: '' },
  { engineName: 'GDPR', version: '', code: 'gdpr', codeVersion: '' },
  { engineName: 'PCI', version: '4.0', code: 'pci_dss', codeVersion: '4.0' },
  { engineName: 'NIST-CSF', version: '2.0', code: 'nist_csf', codeVersion: '2.0' },
];

// El motor escribe SOC 2 como `cc_6_6`, `cc_a_1_1`, `cc_c_1_1`, `pi_1_3`; el catálogo del comité, como `CC6.6`, `A1.1`, `C1.1`, `PI1.3`.
export function normalizeSoc2Requirement(id: string): string | null {
  let m = /^cc_(\d+)_(\d+)$/.exec(id);
  if (m) return `CC${m[1]}.${m[2]}`;
  m = /^cc_a_(\d+)_(\d+)$/.exec(id);
  if (m) return `A${m[1]}.${m[2]}`;
  m = /^cc_c_(\d+)_(\d+)$/.exec(id);
  if (m) return `C${m[1]}.${m[2]}`;
  m = /^pi_(\d+)_(\d+)$/.exec(id);
  if (m) return `PI${m[1]}.${m[2]}`;
  return null;
}

export type Soc2Source = {
  controlTests: { controlCode: string; testCode: string }[];
  pointOfFocusControls: { requirementCode: string; controlCode: string }[];
};

/** Requisitos a los que llega cada prueba: prueba → controles → puntos de enfoque → requisitos. */
export function requirementsByTest(src: Soc2Source): Map<string, Set<string>> {
  const byControl = new Map<string, Set<string>>();
  for (const p of src.pointOfFocusControls) {
    if (!byControl.has(p.controlCode)) byControl.set(p.controlCode, new Set());
    byControl.get(p.controlCode)!.add(p.requirementCode);
  }
  const out = new Map<string, Set<string>>();
  for (const ct of src.controlTests) {
    if (!out.has(ct.testCode)) out.set(ct.testCode, new Set());
    for (const r of byControl.get(ct.controlCode) ?? []) out.get(ct.testCode)!.add(r);
  }
  return out;
}

type Rule = { tests: string[]; confidence: 'medium' | 'low'; rationale: string };

/**
 * Propone a qué pruebas T-CLD alimenta un check, por orden: nombre (los casos que la categoría no distingue) y luego
 * categoría del motor. Devuelve vacío si ninguna prueba de nube aplica: el check queda sin prueba (cobertura no alcanzada).
 */
export function proposeTests(c: EngineCheckMeta): Rule[] {
  const id = c.CheckID;
  const cats = new Set(c.Categories ?? []);
  const out: Rule[] = [];
  const add = (r: Rule) => out.push(r);

  if (id.startsWith('iam_password_policy')) add({ tests: ['T-CLD-011'], confidence: 'medium', rationale: 'Parámetro de la política de contraseñas (longitud, complejidad, historial, expiración) → T-CLD-011.' });
  if (/^iam_(root_)?(hardware_)?mfa|mfa_enabled|administrator_access_with_mfa/.test(id)) {
    add({ tests: ['T-CLD-001', 'T-CLD-011'], confidence: 'medium', rationale: 'MFA en cuentas: «MFA en cuentas privilegiadas» (T-CLD-001) y «exigencia de MFA» (T-CLD-011).' });
  }
  if (out.length === 0) {
    if (/backup|snapshot|replica|versioning|retention|deletion_protection|point_in_time/.test(id)) {
      add({ tests: id.startsWith('backup_') ? ['T-CLD-003', 'T-CLD-008'] : ['T-CLD-003'], confidence: 'medium', rationale: 'Respaldos/replicación activos → T-CLD-003 (y T-CLD-008 si es el servicio de respaldos).' });
    } else if (/multi_?az|different_az|cross_region|multiaz|multiple_az/.test(id)) {
      add({ tests: ['T-CLD-009'], confidence: 'medium', rationale: 'Distribución multi-zona de recursos críticos → T-CLD-009.' });
    } else if (cats.has('threat-detection') || /^(guardduty|networkfirewall|waf|shield|inspector2|securityhub)_|vpc_flow_logs/.test(id)) {
      add({ tests: ['T-CLD-010'], confidence: 'medium', rationale: 'Detección de amenazas / monitoreo de red → T-CLD-010.' });
    } else if (cats.has('identity-access') || cats.has('privilege-escalation')) {
      add({ tests: ['T-CLD-001'], confidence: 'medium', rationale: 'Categoría del motor «identity-access» → mínimo privilegio y llaves de T-CLD-001.' });
    } else if (cats.has('logging') || cats.has('forensics-ready')) {
      add({ tests: ['T-CLD-003'], confidence: 'medium', rationale: 'Categoría «logging»/«forensics-ready» → registro de actividad de T-CLD-003.' });
    } else if (cats.has('encryption') || cats.has('secrets') || cats.has('internet-exposed') || cats.has('trust-boundaries')) {
      add({ tests: ['T-CLD-002'], confidence: 'medium', rationale: 'Categoría «encryption»/«secrets»/«internet-exposed»/«trust-boundaries» → cifrado, red y exposición de T-CLD-002.' });
    } else if (cats.has('ec2-imdsv1')) {
      add({ tests: ['T-CLD-002'], confidence: 'low', rationale: 'Exposición de credenciales de instancia (IMDS) → T-CLD-002, a revisar.' });
    }
  }
  return out;
}

export type CloudDataset = { checks: SeedCheck[]; mappings: SeedMapping[]; testChecks: SeedTestCheck[]; engineVersion: string };

export function buildCloudDataset(
  engineVersion: string,
  metas: EngineCheckMeta[],
  frameworks: EngineFramework[],
  soc2: Soc2Source,
): { dataset: CloudDataset; errors: string[] } {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const m of metas) {
    if (ids.has(m.CheckID)) errors.push(`check duplicado en el motor: ${m.CheckID}`);
    ids.add(m.CheckID);
  }

  const mappings: SeedMapping[] = [];
  const seen = new Set<string>();
  const nativeSoc2 = new Map<string, Set<string>>(); // check → requisitos SOC 2 que cita el motor
  for (const offered of OFFERED_FRAMEWORKS) {
    const fw = frameworks.find((f) => f.Framework === offered.engineName && (f.Version || '') === offered.version);
    if (!fw) {
      errors.push(`el motor no trae el marco ${offered.engineName} ${offered.version}`.trim());
      continue;
    }
    for (const r of fw.Requirements) {
      const code = offered.code === 'soc2' ? normalizeSoc2Requirement(r.Id) : r.Id;
      if (!code) {
        errors.push(`requisito SOC 2 del motor con formato desconocido: ${r.Id}`);
        continue;
      }
      for (const checkId of r.Checks) {
        if (!ids.has(checkId)) {
          errors.push(`${offered.code} ${r.Id} cita un check que no está en el catálogo del motor: ${checkId}`);
          continue;
        }
        const key = `${checkId}|${offered.code}|${offered.codeVersion}|${code}`;
        if (seen.has(key)) continue;
        seen.add(key);
        mappings.push({ checkId, frameworkCode: offered.code, frameworkVersion: offered.codeVersion, requirementCode: code, provenance: 'engine_native' });
        if (offered.code === 'soc2') {
          if (!nativeSoc2.has(checkId)) nativeSoc2.set(checkId, new Set());
          nativeSoc2.get(checkId)!.add(code);
        }
      }
    }
  }

  const checks: SeedCheck[] = metas
    .map((m) => ({
      platform: PLATFORM,
      policyId: POLICY_ID,
      checkId: m.CheckID,
      titleEn: m.CheckTitle,
      titleEs: null,
      condition: m.Description,
      remediation: m.Remediation?.Recommendation?.Text ?? '',
      verificationRule: null,
      origin: 'engine_native' as const,
      mappingProvenance: `engine:${PLATFORM}:${engineVersion}`,
      mappingConfidence: (nativeSoc2.has(m.CheckID) ? 'high' : 'low') as 'high' | 'low',
      serviceName: m.ServiceName,
      resourceType: m.ResourceType,
      engineSeverity: m.Severity,
      categories: m.Categories ?? [],
    }))
    .sort((a, b) => a.checkId.localeCompare(b.checkId));

  // check → prueba. La confianza sube a `high` cuando el requisito SOC 2 que el propio motor cita para el check es alcanzable
  // desde la prueba propuesta (dos fuentes independientes coinciden); si no, queda la de la regla.
  const reach = requirementsByTest(soc2);
  const testChecks: SeedTestCheck[] = [];
  for (const m of metas) {
    const seenTests = new Set<string>();
    for (const rule of proposeTests(m)) {
      for (const testCode of rule.tests) {
        if (seenTests.has(testCode)) continue;
        seenTests.add(testCode);
        if (!reach.has(testCode)) {
          errors.push(`la prueba ${testCode} propuesta para ${m.CheckID} no existe en el catálogo del comité`);
          continue;
        }
        const native = nativeSoc2.get(m.CheckID);
        const corroborated = !!native && [...native].some((r) => reach.get(testCode)!.has(r));
        testChecks.push({ testCode, checkId: m.CheckID, provenance: 'monkey_proposed', confidence: corroborated ? 'high' : rule.confidence, rationale: rule.rationale + (corroborated ? ' El requisito SOC 2 que cita el motor es alcanzable desde esta prueba.' : '') });
      }
    }
  }
  testChecks.sort((a, b) => a.testCode.localeCompare(b.testCode) || a.checkId.localeCompare(b.checkId));

  mappings.sort((a, b) => a.frameworkCode.localeCompare(b.frameworkCode) || a.requirementCode.localeCompare(b.requirementCode) || a.checkId.localeCompare(b.checkId));
  return { dataset: { checks, mappings, testChecks, engineVersion }, errors };
}
