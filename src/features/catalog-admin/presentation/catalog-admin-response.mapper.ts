import {
  CauseDetail,
  CauseSummary,
  ControlDetail,
  ControlSummary,
  EvidenceTemplateSummary,
  FrameworkDetail,
  FrameworkSummary,
  RiskDetail,
  RiskSummary,
  TestDetail,
  TestSummary,
} from '../domain/repositories/catalog-admin.repository';

// Formas de contracts/modules/monkey-admin-catalog.md, en snake_case. Las ve solo `admin_monkey`; por eso la prueba lleva aquí los textos del comité,
// que al cliente no salen nunca (D70).

export const toFramework = (f: FrameworkSummary) => ({
  id: f.id,
  code: f.code,
  name: f.name,
  version: f.version,
  type: f.type,
  availability: f.availability,
  scope_description: f.scopeDescription,
  counts: f.counts,
});

export const toFrameworkDetail = (f: FrameworkDetail) => ({
  ...toFramework(f),
  trust_criteria: f.trustCriteria.map((t) => ({ criterion: t.criterion, is_mandatory: t.isMandatory })),
  requirements: f.requirements.map((r) => ({
    code: r.code,
    tsc_category: r.tscCategory,
    criterion: r.criterion,
    trust_criterion: r.trustCriterion,
    points_of_focus_count: r.pointsOfFocusCount,
    controls_count: r.controlsCount,
  })),
});

export const toControl = (c: ControlSummary) => ({
  id: c.id,
  code: c.code,
  name: c.name,
  domain: c.domain,
  origin: c.origin,
  is_active: c.isActive,
  dimensions: c.dimensions,
  tests_count: c.testsCount,
  evidence_templates_count: c.evidenceTemplatesCount,
});

export const toControlDetail = (c: ControlDetail) => ({
  id: c.id,
  code: c.code,
  name: c.name,
  description: c.description,
  domain: c.domain,
  source_ref: c.sourceRef,
  origin: c.origin,
  is_active: c.isActive,
  points_of_focus: c.pointsOfFocus.map((p) => ({ framework_code: p.frameworkCode, requirement_code: p.requirementCode, number: p.number, description: p.description })),
  dimensions: c.dimensions.map((d) => ({
    dimension: d.dimension,
    type: d.type,
    requires_probe: d.requiresProbe,
    requires_ai: d.requiresAi,
    requires_compliance_confirmation: d.requiresComplianceConfirmation,
  })),
  tests: c.tests.map((t) => ({ id: t.id, code: t.code, dimension: t.dimension, display_name: t.displayName, is_active: t.isActive })),
  evidence_templates: c.evidenceTemplates,
  policies: c.policies.map((p) => ({ name: p.name, requires_employee_acceptance: p.requiresEmployeeAcceptance })),
  causes: c.causes,
});

export const toRisk = (r: RiskSummary) => ({
  id: r.id,
  code: r.code,
  name: r.name,
  trust_criterion: r.trustCriterion,
  origin: r.origin,
  is_active: r.isActive,
  causes_count: r.causesCount,
});

export const toRiskDetail = (r: RiskDetail) => ({
  id: r.id,
  code: r.code,
  name: r.name,
  description: r.description,
  trust_criterion: r.trustCriterion,
  potential_impact: r.potentialImpact,
  origin: r.origin,
  is_active: r.isActive,
  causes: r.causes,
});

export const toCause = (c: CauseSummary) => ({
  id: c.id,
  code: c.code,
  name: c.name,
  failure_category: c.failureCategory,
  origin: c.origin,
  is_active: c.isActive,
  risks_count: c.risksCount,
  controls_count: c.controlsCount,
});

export const toCauseDetail = (c: CauseDetail) => ({
  id: c.id,
  code: c.code,
  name: c.name,
  description: c.description,
  failure_category: c.failureCategory,
  origin: c.origin,
  is_active: c.isActive,
  risks: c.risks,
  controls: c.controls,
});

export const toTest = (t: TestSummary) => ({
  id: t.id,
  code: t.code,
  dimension: t.dimension,
  name: t.name,
  display_name: t.displayName,
  type: t.type,
  origin: t.origin,
  is_active: t.isActive,
  controls_count: t.controlsCount,
});

export const toTestDetail = (t: TestDetail) => ({
  id: t.id,
  code: t.code,
  dimension: t.dimension,
  name: t.name,
  display_name: t.displayName,
  display_description: t.displayDescription,
  origin: t.origin,
  is_active: t.isActive,
  committee: {
    objective: t.committee.objective,
    type: t.committee.type,
    tool: t.committee.tool,
    population: t.committee.population,
    period: t.committee.period,
    population_size: t.committee.populationSize,
    suggested_sample_size: t.committee.suggestedSampleSize,
    selection_method: t.committee.selectionMethod,
    evidence_to_request: t.committee.evidenceToRequest,
    prerequisites: t.committee.prerequisites,
    step_by_step: t.committee.stepByStep,
    attributes_to_validate: t.committee.attributesToValidate,
    compliance_criterion: t.committee.complianceCriterion,
    exceptions: t.committee.exceptions,
    exceptions_handling: t.committee.exceptionsHandling,
    evidence_to_retain: t.committee.evidenceToRetain,
    automated_coverage: t.committee.automatedCoverage,
    complementary_manual_validation: t.committee.complementaryManualValidation,
    limitations: t.committee.limitations,
  },
  controls: t.controls,
});

export const toEvidenceTemplate = (e: EvidenceTemplateSummary) => ({
  id: e.id,
  code: e.code,
  description: e.description,
  dimension: e.dimension,
  origin: e.origin,
  is_active: e.isActive,
  controls_count: e.controlsCount,
});
