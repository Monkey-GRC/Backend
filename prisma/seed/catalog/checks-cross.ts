// Cruce de TEST_CHECKS con los catálogos de checks (DEV-11): un check se identifica por plataforma + check ID en el motor de nube y por política + check ID en la sonda.
//  - Motor de nube («Prowler»): la etiqueta de la plataforma («Oracle Cloud (OCI)») → su código, y el check ID. 10 check ID se repiten entre plataformas.
//  - Sonda («Wazuh SCA»): el nombre de la política («Servicio / Política») → `sca_policies.benchmark` → `sca_id`, y el check ID.
//  - Los 19 vínculos con check ID «N/A» son módulos de la sonda o puntajes globales (P49): van sin check y con `module_ref`.
import { CHECK_ROLE, lookup } from './labels';
import { ownerControlOf, Row, text, textOrNull } from './parse';
import { TestCheckRow } from './types';

export type ChecksIndex = {
  /** Política de la sonda por etiqueta de plataforma + nombre del benchmark; null si no existe. */
  sondaPolicy(platformLabel: string, benchmark: string): { platform: string; policyId: string } | null;
  hasSondaCheck(platform: string, policyId: string, checkId: string): boolean;
  /** Código de la plataforma del motor de nube a partir de su etiqueta; null si no existe. */
  cloudPlatform(label: string): string | null;
  hasCloudCheck(platform: string, checkId: string): boolean;
};

// Todos los checks del motor de nube comparten una «política»: el motor no agrupa por benchmark (D56).
export const CLOUD_POLICY_ID = 'cloud_configuration';

const TOOL_MODULE = 'wazuh – módulo';
const TOOL_SCA = 'wazuh sca';
const TOOL_CLOUD = 'prowler';

export function crossTestChecks(rows: readonly Row[], index: ChecksIndex, errors: string[]): TestCheckRow[] {
  const out: TestCheckRow[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    const testCode = text(r['ID_Test']);
    const tool = text(r['Herramienta']).toLowerCase();
    const checkId = text(r['Check ID']);
    const ctx = `TEST_CHECKS · ${testCode} · ${text(r['Plataforma / Política'])} · ${checkId}`;
    const role = lookup(CHECK_ROLE, r['Rol']);
    if (!role) {
      errors.push(`${ctx}: el rol «${text(r['Rol'])}» no es Directo, Complementario ni Dependencia.`);
      continue;
    }
    const commonObjective = text(r['Objetivo común']);
    const base = { testCode, role, commonObjective, ownerControlCode: ownerControlOf(commonObjective), appliesWhen: text(r['Aplica cuando']) };

    let row: TestCheckRow | null = null;
    if (checkId.toUpperCase() === 'N/A') {
      // Módulo de la sonda o puntaje global: no es un check. Se guarda a qué módulo o puntaje se refiere.
      row = { ...base, platform: null, policyId: null, checkId: null, moduleRef: textOrNull(r['Plataforma / Política']) };
    } else if (tool === TOOL_CLOUD) {
      const label = text(r['Plataforma']);
      const platform = index.cloudPlatform(label);
      if (!platform) errors.push(`${ctx}: la plataforma «${label}» no está en el catálogo del motor de nube.`);
      else if (!index.hasCloudCheck(platform, checkId)) errors.push(`${ctx}: el check ${checkId} no existe en ${label}.`);
      else row = { ...base, platform, policyId: CLOUD_POLICY_ID, checkId, moduleRef: null };
    } else if (tool === TOOL_SCA) {
      const label = text(r['Plataforma']);
      const benchmark = text(r['Servicio / Política']);
      const policy = index.sondaPolicy(label, benchmark);
      if (!policy) errors.push(`${ctx}: la política «${benchmark}» (${label}) no está en el catálogo de la sonda.`);
      else if (!index.hasSondaCheck(policy.platform, policy.policyId, checkId)) errors.push(`${ctx}: el check ${checkId} no existe en la política ${policy.policyId}.`);
      else row = { ...base, platform: policy.platform, policyId: policy.policyId, checkId, moduleRef: null };
    } else {
      errors.push(`${ctx}: la herramienta «${text(r['Herramienta'])}» con check ID ${checkId} no se sabe cruzar${tool === TOOL_MODULE ? ' (un módulo debe traer N/A)' : ''}.`);
    }
    if (!row) continue;
    const key = `${testCode}|${row.platform}|${row.policyId}|${row.checkId}|${row.moduleRef}`;
    if (seen.has(key)) errors.push(`${ctx}: el vínculo está repetido.`);
    seen.add(key);
    out.push(row);
  }
  return out;
}
