import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { COMPLIANCE_ENUM_CATALOGS } from './compliance-catalogs';
import { ENUM_CATALOGS } from './onboarding-catalogs';

const ROOT = resolve(__dirname, '../../..');

// Las opciones de los formularios de Cumplimiento salen de los enums de Postgres. Estas pruebas vigilan que ninguna lista se desvíe de la base ni se quede sin texto:
// el frontend no escribe estas listas (contracts/conventions.md), así que una opción sin etiqueta se vería rota en pantalla.
function schemaEnums(): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.prisma') ? [join(dir, e.name)] : []));
  for (const file of walk(join(ROOT, 'prisma/schema'))) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/enum\s+(\w+)\s*\{([^}]*)\}/g)) {
      const body = m[2].split(/\r?\n/).map((l) => l.replace(/\/\/.*$/, '').trim());
      out.set(m[1], body.filter((l) => /^[a-z_][a-z0-9_]*$/i.test(l) && !l.startsWith('@')));
    }
  }
  return out;
}

const labels = (lang: 'es' | 'en') => JSON.parse(readFileSync(join(ROOT, 'i18n', lang, 'catalogs.json'), 'utf8')) as Record<string, Record<string, string>>;

// El catálogo → el enum de Postgres del que sale. `loss_type` y `risk_scale` no son enums de la base.
const POSTGRES_ENUM: Record<string, string> = {
  risk_criterion: 'RiskCriterion',
  failure_category: 'FailureCategory',
  risk_level: 'RiskLevel',
  risk_treatment_decision: 'RiskTreatmentDecision',
  responsible_type: 'OrganizationResponsibleType',
  cause_control_effect: 'ClientCauseControlEffect',
  exclusion_status: 'ExclusionStatus',
  audit_observation_type: 'AuditObservationType',
  audit_observation_status: 'AuditObservationStatus',
  assessor_role: 'AssessorRole',
  assessment_verdict: 'AssessmentVerdict',
  dimension: 'Dimension',
  control_type: 'ControlDimensionType',
  catalog_origin: 'CatalogOrigin',
  catalog_control_type: 'ControlType',
  periodicity: 'Periodicity',
  requirement_type: 'RequirementType',
  test_primary_source: 'TestPrimarySource',
  test_level: 'TestLevel',
  test_automation: 'TestAutomation',
  check_role: 'CheckRole',
  cause_origin: 'CauseOrigin',
  cause_type: 'CauseType',
  document_type: 'DocumentType',
  document_origin: 'DocumentOrigin',
  document_acceptance: 'DocumentAcceptance',
  evaluation_period_status: 'EvaluationPeriodStatus',
  evaluation_period_origin: 'EvaluationPeriodOrigin',
};

describe('catálogos de Cumplimiento', () => {
  const enums = schemaEnums();

  it('se sirven en GET /v1/catalogs/{nombre}, junto a los del onboarding', () => {
    for (const name of Object.keys(COMPLIANCE_ENUM_CATALOGS)) expect(Object.keys(ENUM_CATALOGS)).toContain(name);
  });

  it.each(Object.entries(POSTGRES_ENUM))('%s tiene exactamente los valores del enum %s de Postgres, en el mismo orden', (name, enumName) => {
    const inSchema = enums.get(enumName);
    expect(inSchema).toBeDefined();
    expect([...COMPLIANCE_ENUM_CATALOGS[name as keyof typeof COMPLIANCE_ENUM_CATALOGS]]).toEqual(inSchema);
  });

  it('ninguna lista está vacía ni repite un valor', () => {
    for (const [name, list] of Object.entries(COMPLIANCE_ENUM_CATALOGS)) {
      expect(list.length).toBeGreaterThan(0);
      expect(new Set(list).size).toBe(list.length);
      expect(name).toBe(name.toLowerCase());
    }
  });

  it.each(['es', 'en'] as const)('cada valor tiene su etiqueta en %s, y no sobra ninguna', (lang) => {
    const texts = labels(lang);
    for (const [name, list] of Object.entries(COMPLIANCE_ENUM_CATALOGS)) {
      expect(Object.keys(texts[name] ?? {}).sort()).toEqual([...list].map(String).sort());
      for (const value of list) expect((texts[name][value] ?? '').trim().length).toBeGreaterThan(0);
    }
  });

  it('la escala de la matriz va del mínimo al máximo de la evaluación: 1 a 5', () => {
    expect([...COMPLIANCE_ENUM_CATALOGS.risk_scale]).toEqual(['1', '2', '3', '4', '5']);
  });

  it('el impacto potencial lleva los seis valores del comité', () => {
    expect([...COMPLIANCE_ENUM_CATALOGS.loss_type]).toHaveLength(6);
  });
});
