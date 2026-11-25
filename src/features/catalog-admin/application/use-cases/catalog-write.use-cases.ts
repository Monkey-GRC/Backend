import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { FieldError, ValidationException } from '../../../../common/errors/validation.exception';
import { RequestMeta } from '../../../../common/http/request-meta';
import { namesProvider } from '../../../../common/text/provider-names';
import { Audit, CatalogAdminWriteRepository, Change, NewTest, PointOfFocusRef, TestPatch } from '../../domain/repositories/catalog-admin-write.repository';
import {
  AddDimensionDto,
  CreateCauseDto,
  CreateControlDto,
  CreateEvidenceTemplateDto,
  CreateRiskDto,
  CreateTestDto,
  UpdateCauseDto,
  UpdateControlDto,
  UpdateEvidenceTemplateDto,
  UpdateRiskDto,
  UpdateTestDto,
} from '../dtos/catalog-write.dto';

// Escritura del catálogo maestro desde Monkey Admin (contracts/modules/monkey-admin-catalog.md). Solo `admin_monkey` (lo impone @Can en el controlador y la RLS de
// `catalog`). Cada cambio deja su rastro `catalog.*` en la misma transacción. Dar de baja no borra.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });

const auditOf =
  (p: Principal, meta: RequestMeta, action: string, resource: string): Audit =>
  (change: Change): AuditEntry => ({
    tenantId: p.companyId,
    userId: p.userId,
    action,
    resource,
    result: 'success',
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    beforeState: change.before,
    afterState: change.after,
  });

/** `is_active` en un PATCH da de baja o reactiva; sin él es una edición. */
const verbOf = (patch: { isActive?: boolean }) => (patch.isActive === false ? 'deactivate' : patch.isActive === true ? 'reactivate' : 'update');

/** Un PATCH sin ningún campo no cambia nada: es un error del cliente, no un éxito silencioso. */
function assertNotEmpty(patch: Record<string, unknown>): void {
  if (Object.values(patch).every((v) => v === undefined)) throw new ValidationException([{ field: 'body', code: 'required' }]);
}

// El proveedor de la sonda es confidencial frente al cliente (SEG-39, D70). Es el mismo patrón que valida `catalog:load` (prisma/seed/soc2/display-names.ts):
// lo que ve el cliente de una prueba —su nombre y su descripción— nunca lo nombra. Las palabras viven en `common/text/provider-names`.
const TEST_PREFIX_TO_DIMENSION: Record<string, string> = { DOC: 'policy', SRV: 'server', BD: 'database', CLD: 'cloud', APP: 'app' };

function assertNeutral(texts: Record<string, string | undefined>): void {
  const fields: FieldError[] = Object.entries(texts)
    .filter(([, value]) => value !== undefined && namesProvider(value))
    .map(([field]) => ({ field, code: 'text.names_provider' }));
  if (fields.length) throw new ValidationException(fields);
}

/** `T-SRV-900` es una prueba de servidor: el prefijo del código tiene que corresponder a su dimensión. */
function assertTestCode(code: string, dimension: string): void {
  const prefix = /^T-([A-Z]+)-/.exec(code)?.[1];
  if (!prefix || TEST_PREFIX_TO_DIMENSION[prefix] !== dimension) throw new ValidationException([{ field: 'code', code: 'code.dimension_mismatch' }]);
}

const found = (change: Change | null): Change => {
  if (!change) throw new DomainError('NOT_FOUND');
  return change;
};

const testTexts = (d: CreateTestDto | UpdateTestDto) => ({
  tool: d.tool,
  population: d.population,
  period: d.period,
  populationSize: d.population_size,
  suggestedSampleSize: d.suggested_sample_size,
  selectionMethod: d.selection_method,
  evidenceToRequest: d.evidence_to_request,
  prerequisites: d.prerequisites,
  stepByStep: d.step_by_step,
  attributesToValidate: d.attributes_to_validate,
  complianceCriterion: d.compliance_criterion,
  exceptions: d.exceptions,
  exceptionsHandling: d.exceptions_handling,
  evidenceToRetain: d.evidence_to_retain,
  automatedCoverage: d.automated_coverage,
  complementaryManualValidation: d.complementary_manual_validation,
  limitations: d.limitations,
});

@Injectable()
export class ControlWrites {
  constructor(private readonly write: CatalogAdminWriteRepository) {}

  create(p: Principal, dto: CreateControlDto, meta: RequestMeta): Promise<Change> {
    return this.write.createControl(scopeOf(p), { code: dto.code, name: dto.name, description: dto.description, domain: dto.domain, sourceRef: dto.source_ref }, auditOf(p, meta, 'catalog.control.create', 'catalog_control'));
  }

  async update(p: Principal, id: string, dto: UpdateControlDto, meta: RequestMeta): Promise<Change> {
    const patch = { name: dto.name, description: dto.description, domain: dto.domain, sourceRef: dto.source_ref, isActive: dto.is_active };
    assertNotEmpty(patch);
    return found(await this.write.updateControl(scopeOf(p), id, patch, auditOf(p, meta, `catalog.control.${verbOf(patch)}`, 'catalog_control')));
  }

  async deactivate(p: Principal, id: string, meta: RequestMeta): Promise<void> {
    found(await this.write.updateControl(scopeOf(p), id, { isActive: false }, auditOf(p, meta, 'catalog.control.deactivate', 'catalog_control')));
  }
}

@Injectable()
export class RiskWrites {
  constructor(private readonly write: CatalogAdminWriteRepository) {}

  create(p: Principal, dto: CreateRiskDto, meta: RequestMeta): Promise<Change> {
    return this.write.createRisk(
      scopeOf(p),
      { code: dto.code, name: dto.name, description: dto.description, trustCriterion: dto.trust_criterion, potentialImpact: dto.potential_impact },
      auditOf(p, meta, 'catalog.risk.create', 'catalog_risk'),
    );
  }

  async update(p: Principal, id: string, dto: UpdateRiskDto, meta: RequestMeta): Promise<Change> {
    const patch = { name: dto.name, description: dto.description, trustCriterion: dto.trust_criterion, potentialImpact: dto.potential_impact, isActive: dto.is_active };
    assertNotEmpty(patch);
    return found(await this.write.updateRisk(scopeOf(p), id, patch, auditOf(p, meta, `catalog.risk.${verbOf(patch)}`, 'catalog_risk')));
  }

  async deactivate(p: Principal, id: string, meta: RequestMeta): Promise<void> {
    found(await this.write.updateRisk(scopeOf(p), id, { isActive: false }, auditOf(p, meta, 'catalog.risk.deactivate', 'catalog_risk')));
  }
}

@Injectable()
export class CauseWrites {
  constructor(private readonly write: CatalogAdminWriteRepository) {}

  create(p: Principal, dto: CreateCauseDto, meta: RequestMeta): Promise<Change> {
    return this.write.createCause(scopeOf(p), { code: dto.code, name: dto.name, description: dto.description, failureCategory: dto.failure_category }, auditOf(p, meta, 'catalog.cause.create', 'catalog_cause'));
  }

  async update(p: Principal, id: string, dto: UpdateCauseDto, meta: RequestMeta): Promise<Change> {
    const patch = { name: dto.name, description: dto.description, failureCategory: dto.failure_category, isActive: dto.is_active };
    assertNotEmpty(patch);
    return found(await this.write.updateCause(scopeOf(p), id, patch, auditOf(p, meta, `catalog.cause.${verbOf(patch)}`, 'catalog_cause')));
  }

  async deactivate(p: Principal, id: string, meta: RequestMeta): Promise<void> {
    found(await this.write.updateCause(scopeOf(p), id, { isActive: false }, auditOf(p, meta, 'catalog.cause.deactivate', 'catalog_cause')));
  }
}

@Injectable()
export class EvidenceTemplateWrites {
  constructor(private readonly write: CatalogAdminWriteRepository) {}

  create(p: Principal, dto: CreateEvidenceTemplateDto, meta: RequestMeta): Promise<Change> {
    return this.write.createEvidenceTemplate(scopeOf(p), { code: dto.code, description: dto.description, dimension: dto.dimension }, auditOf(p, meta, 'catalog.evidence_template.create', 'catalog_evidence_template'));
  }

  async update(p: Principal, id: string, dto: UpdateEvidenceTemplateDto, meta: RequestMeta): Promise<Change> {
    const patch = { description: dto.description, isActive: dto.is_active };
    assertNotEmpty(patch);
    return found(await this.write.updateEvidenceTemplate(scopeOf(p), id, patch, auditOf(p, meta, `catalog.evidence_template.${verbOf(patch)}`, 'catalog_evidence_template')));
  }

  async deactivate(p: Principal, id: string, meta: RequestMeta): Promise<void> {
    found(await this.write.updateEvidenceTemplate(scopeOf(p), id, { isActive: false }, auditOf(p, meta, 'catalog.evidence_template.deactivate', 'catalog_evidence_template')));
  }
}

@Injectable()
export class TestWrites {
  constructor(private readonly write: CatalogAdminWriteRepository) {}

  create(p: Principal, dto: CreateTestDto, meta: RequestMeta): Promise<Change> {
    assertTestCode(dto.code, dto.dimension);
    assertNeutral({ display_name: dto.display_name, display_description: dto.display_description });
    const input: NewTest = {
      ...testTexts(dto),
      code: dto.code,
      dimension: dto.dimension,
      name: dto.name,
      displayName: dto.display_name,
      displayDescription: dto.display_description,
      objective: dto.objective,
      type: dto.type,
    };
    return this.write.createTest(scopeOf(p), input, auditOf(p, meta, 'catalog.test.create', 'catalog_test'));
  }

  async update(p: Principal, id: string, dto: UpdateTestDto, meta: RequestMeta): Promise<Change> {
    const patch: TestPatch = { ...testTexts(dto), name: dto.name, displayName: dto.display_name, displayDescription: dto.display_description, objective: dto.objective, type: dto.type, isActive: dto.is_active };
    assertNotEmpty(patch);
    assertNeutral({ display_name: dto.display_name, display_description: dto.display_description });
    return found(await this.write.updateTest(scopeOf(p), id, patch, auditOf(p, meta, `catalog.test.${verbOf(patch)}`, 'catalog_test')));
  }

  async deactivate(p: Principal, id: string, meta: RequestMeta): Promise<void> {
    found(await this.write.updateTest(scopeOf(p), id, { isActive: false }, auditOf(p, meta, 'catalog.test.deactivate', 'catalog_test')));
  }
}

// Vínculos entre elementos del catálogo. Cada uno deja su rastro; quitar uno borra solo la relación, nunca los elementos.
@Injectable()
export class CatalogLinks {
  constructor(private readonly write: CatalogAdminWriteRepository) {}

  async linkEvidenceTemplate(p: Principal, controlId: string, templateId: string, sequence: number | undefined, meta: RequestMeta) {
    return found(await this.write.linkEvidenceTemplate(scopeOf(p), controlId, templateId, sequence, auditOf(p, meta, 'catalog.control_evidence_template.link', 'catalog_control_evidence_template')));
  }

  async unlinkEvidenceTemplate(p: Principal, controlId: string, templateId: string, meta: RequestMeta) {
    return found(await this.write.unlinkEvidenceTemplate(scopeOf(p), controlId, templateId, auditOf(p, meta, 'catalog.control_evidence_template.unlink', 'catalog_control_evidence_template')));
  }

  async linkTest(p: Principal, controlId: string, testId: string, meta: RequestMeta) {
    return found(await this.write.linkTest(scopeOf(p), controlId, testId, auditOf(p, meta, 'catalog.control_test.link', 'catalog_control_test')));
  }

  async unlinkTest(p: Principal, controlId: string, testId: string, meta: RequestMeta) {
    return found(await this.write.unlinkTest(scopeOf(p), controlId, testId, auditOf(p, meta, 'catalog.control_test.unlink', 'catalog_control_test')));
  }

  async linkPointOfFocus(p: Principal, controlId: string, pointOfFocusId: string, meta: RequestMeta) {
    return found(await this.write.linkPointOfFocus(scopeOf(p), controlId, pointOfFocusId, auditOf(p, meta, 'catalog.control_point_of_focus.link', 'catalog_control_point_of_focus')));
  }

  async unlinkPointOfFocus(p: Principal, controlId: string, pointOfFocusId: string, meta: RequestMeta) {
    return found(await this.write.unlinkPointOfFocus(scopeOf(p), controlId, pointOfFocusId, auditOf(p, meta, 'catalog.control_point_of_focus.unlink', 'catalog_control_point_of_focus')));
  }

  async linkCauseToControl(p: Principal, causeId: string, controlId: string, meta: RequestMeta) {
    return found(await this.write.linkCauseToControl(scopeOf(p), causeId, controlId, auditOf(p, meta, 'catalog.cause_control.link', 'catalog_cause_control')));
  }

  async unlinkCauseFromControl(p: Principal, causeId: string, controlId: string, meta: RequestMeta) {
    return found(await this.write.unlinkCauseFromControl(scopeOf(p), causeId, controlId, auditOf(p, meta, 'catalog.cause_control.unlink', 'catalog_cause_control')));
  }

  async linkRiskToCause(p: Principal, riskId: string, causeId: string, meta: RequestMeta) {
    return found(await this.write.linkRiskToCause(scopeOf(p), riskId, causeId, auditOf(p, meta, 'catalog.risk_cause.link', 'catalog_risk_cause')));
  }

  async unlinkRiskFromCause(p: Principal, riskId: string, causeId: string, meta: RequestMeta) {
    return found(await this.write.unlinkRiskFromCause(scopeOf(p), riskId, causeId, auditOf(p, meta, 'catalog.risk_cause.unlink', 'catalog_risk_cause')));
  }

  async addDimension(p: Principal, controlId: string, dto: AddDimensionDto, meta: RequestMeta) {
    return found(
      await this.write.addDimension(
        scopeOf(p),
        controlId,
        { dimension: dto.dimension, type: dto.type, requiresProbe: dto.requires_probe ?? false, requiresAi: dto.requires_ai ?? false, requiresComplianceConfirmation: dto.requires_compliance_confirmation ?? false },
        auditOf(p, meta, 'catalog.control_dimension.add', 'catalog_control_dimension'),
      ),
    );
  }

  async removeDimension(p: Principal, controlId: string, dimension: string, meta: RequestMeta) {
    return found(await this.write.removeDimension(scopeOf(p), controlId, dimension, auditOf(p, meta, 'catalog.control_dimension.remove', 'catalog_control_dimension')));
  }
}

@Injectable()
export class ListPointsOfFocusUseCase {
  constructor(private readonly write: CatalogAdminWriteRepository) {}

  async execute(frameworkId: string, requirementCode?: string): Promise<PointOfFocusRef[]> {
    const list = await this.write.listPointsOfFocus(frameworkId, requirementCode);
    if (!list) throw new DomainError('NOT_FOUND');
    return list;
  }
}
