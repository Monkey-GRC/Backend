import { ApiProperty } from '@nestjs/swagger';
import { DIMENSIONS } from '../../../common/catalogs/dimensions';
import { CONTROL_TYPES, FAILURE_CATEGORIES, RISK_CRITERIA } from '../application/dtos/catalog-write.dto';

// Formas del `data` de contracts/modules/monkey-admin-catalog.md, solo para la documentación (las arma catalog-admin-response.mapper.ts).
// Las ve únicamente `admin_monkey`: por eso la prueba lleva aquí los textos del comité, que al cliente no salen nunca (D70).

const ORIGIN = ['committee', 'monkey_admin'] as const;
const ORIGIN_DOC = '`committee` viene del Excel del comité · `monkey_admin` lo creó un administrador de Monkey.';

export class CatalogCountsResponse {
  @ApiProperty({ example: 61, description: 'Requisitos del marco.' }) requirements!: number;
  @ApiProperty({ example: 210, description: 'Controles del marco.' }) controls!: number;
  @ApiProperty({ example: 340, description: 'Pruebas del marco.' }) tests!: number;
}

export class FrameworkResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'soc2' }) code!: string;
  @ApiProperty({ example: 'SOC 2' }) name!: string;
  @ApiProperty({ example: '2017', description: 'Versión del marco.' }) version!: string;
  @ApiProperty({ example: 'attestation', description: 'Tipo de marco.' }) type!: string;
  @ApiProperty({ enum: ['available', 'coming_soon'], description: '`available` ya tiene catálogo y se puede contratar · `coming_soon` es solo oferta comercial.' }) availability!: string;
  @ApiProperty({ description: 'Alcance del marco, tal como lo describe el catálogo.' }) scope_description!: string;
  @ApiProperty({ type: CatalogCountsResponse, description: 'Cuántos requisitos, controles y pruebas tiene.' }) counts!: CatalogCountsResponse;
}

export class FrameworkTrustCriterionResponse {
  @ApiProperty({ example: 'security', description: 'Criterio de confianza.' }) criterion!: string;
  @ApiProperty({ description: 'Si el criterio es obligatorio en el marco (en SOC 2, solo `security`).' }) is_mandatory!: boolean;
}

export class FrameworkRequirementResponse {
  @ApiProperty({ example: 'CC6.1', description: 'Código del requisito en el marco.' }) code!: string;
  @ApiProperty({ example: 'Common Criteria', description: 'Categoría del marco a la que pertenece.' }) tsc_category!: string;
  @ApiProperty({ description: 'Texto del criterio.' }) criterion!: string;
  @ApiProperty({ example: 'security', description: 'Criterio de confianza al que pertenece el requisito.' }) trust_criterion!: string;
  @ApiProperty({ example: 5, description: 'Puntos de enfoque del requisito.' }) points_of_focus_count!: number;
  @ApiProperty({ example: 8, description: 'Controles que cubren el requisito.' }) controls_count!: number;
}

export class FrameworkDetailResponse extends FrameworkResponse {
  @ApiProperty({ type: FrameworkTrustCriterionResponse, isArray: true, description: 'Criterios de confianza del marco y cuáles son obligatorios.' }) trust_criteria!: FrameworkTrustCriterionResponse[];
  @ApiProperty({ type: FrameworkRequirementResponse, isArray: true, description: 'Requisitos del marco con sus puntos de enfoque y controles.' }) requirements!: FrameworkRequirementResponse[];
}

export class CatalogControlResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'CAP-1', description: 'Código del control en el catálogo.' }) code!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ type: String, nullable: true, description: 'El primero de `domains` (compatibilidad). Nulo si el control no tiene dominio.' }) domain!: string | null;
  @ApiProperty({ type: String, isArray: true, description: 'Dominios distintos de los puntos de enfoque del control, en el orden de esos puntos (el dominio es de cada punto, no del control).' }) domains!: string[];
  @ApiProperty({ enum: ORIGIN, description: ORIGIN_DOC }) origin!: string;
  @ApiProperty({ description: 'Los controles no se borran: se dan de baja.' }) is_active!: boolean;
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension', isArray: true, description: 'Dimensiones en que se evalúa.' }) dimensions!: string[];
  @ApiProperty({ example: 3, description: 'Pruebas vinculadas al control.' }) tests_count!: number;
  @ApiProperty({ example: 2, description: 'Plantillas de evidencia vinculadas al control.' }) evidence_templates_count!: number;
}

export class PointOfFocusResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'soc2', description: 'Código del marco al que pertenece el punto de enfoque.' }) framework_code!: string;
  @ApiProperty({ example: 'CC6.1', description: 'Código del requisito del marco (por ejemplo `CC6.1`).' }) requirement_code!: string;
  @ApiProperty({ example: 2, description: 'Número del punto dentro del requisito.' }) number!: number;
  @ApiProperty() description!: string;
}

export class FrameworkPointOfFocusResponse extends PointOfFocusResponse {
  @ApiProperty({ example: 4, description: 'Controles vinculados a este punto de enfoque.' }) controls_count!: number;
}

export class CatalogControlDimensionResponse {
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension', description: 'Dimensión en que se evalúa.' }) dimension!: string;
  @ApiProperty({ enum: CONTROL_TYPES, description: 'Cómo se evalúa en esa dimensión.' }) type!: string;
  @ApiProperty({ description: 'Si requiere la sonda (evaluación automática).' }) requires_probe!: boolean;
  @ApiProperty({ description: 'Si requiere apoyo de IA (siempre etiquetado como generado por IA).' }) requires_ai!: boolean;
  @ApiProperty({ description: 'Si requiere confirmación del admin_empresa.' }) requires_compliance_confirmation!: boolean;
}

export class ControlTestRefResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'T-DOC-001' }) code!: string;
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension', description: 'Dimensión en que se ejecuta la prueba.' }) dimension!: string;
  @ApiProperty({ nullable: true, description: 'Nombre neutro que ve el cliente.' }) display_name!: string | null;
  @ApiProperty() is_active!: boolean;
}

export class ControlEvidenceTemplateRefResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'DOC-001' }) code!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ example: 1, description: 'Posición de la plantilla dentro del control.' }) sequence!: number;
}

export class ControlPolicyResponse {
  @ApiProperty() name!: string;
  @ApiProperty({ description: 'Si los empleados deben aceptarla.' }) requires_employee_acceptance!: boolean;
}

export class CatalogRefResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'R001' }) code!: string;
  @ApiProperty() name!: string;
}

export class CatalogControlDetailResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'CAP-1' }) code!: string;
  @ApiProperty() name!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ type: String, nullable: true, description: 'El primero de `domains` (compatibilidad). Nulo si el control no tiene dominio.' }) domain!: string | null;
  @ApiProperty({ type: String, isArray: true, description: 'Dominios distintos de los puntos de enfoque del control, en el orden de esos puntos (el dominio es de cada punto, no del control).' }) domains!: string[];
  @ApiProperty({ nullable: true, description: 'Referencia de origen (por ejemplo, hoja del Excel del comité).' }) source_ref!: string | null;
  @ApiProperty({ enum: ORIGIN, description: ORIGIN_DOC }) origin!: string;
  @ApiProperty() is_active!: boolean;
  @ApiProperty({ type: PointOfFocusResponse, isArray: true, description: 'Puntos de enfoque a los que está vinculado (de ahí cuelga de los requisitos).' }) points_of_focus!: PointOfFocusResponse[];
  @ApiProperty({ type: CatalogControlDimensionResponse, isArray: true, description: 'Dimensiones en que se evalúa el control y cómo.' }) dimensions!: CatalogControlDimensionResponse[];
  @ApiProperty({ type: ControlTestRefResponse, isArray: true, description: 'Pruebas vinculadas al control.' }) tests!: ControlTestRefResponse[];
  @ApiProperty({ type: ControlEvidenceTemplateRefResponse, isArray: true, description: 'Plantillas de evidencia que pide el control, en orden.' }) evidence_templates!: ControlEvidenceTemplateRefResponse[];
  @ApiProperty({ type: ControlPolicyResponse, isArray: true, description: 'Políticas que el control exige.' }) policies!: ControlPolicyResponse[];
  @ApiProperty({ type: CatalogRefResponse, isArray: true, description: 'Causas que este control trata.' }) causes!: CatalogRefResponse[];
}

export class CatalogRiskResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'R001' }) code!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: RISK_CRITERIA, description: 'Criterio de confianza al que afecta el riesgo.' }) trust_criterion!: string;
  @ApiProperty({ enum: ORIGIN, description: ORIGIN_DOC }) origin!: string;
  @ApiProperty() is_active!: boolean;
  @ApiProperty({ example: 3, description: 'Causas vinculadas al riesgo.' }) causes_count!: number;
}

export class CatalogRiskDetailResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'R001' }) code!: string;
  @ApiProperty() name!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ enum: RISK_CRITERIA, description: 'Criterio de confianza al que afecta el riesgo.' }) trust_criterion!: string;
  @ApiProperty({ type: String, isArray: true, example: ['Reputacional'], description: 'Impactos potenciales, tal como los escribe el comité.' }) potential_impact!: string[];
  @ApiProperty({ enum: ORIGIN, description: ORIGIN_DOC }) origin!: string;
  @ApiProperty() is_active!: boolean;
  @ApiProperty({ type: CatalogRefResponse, isArray: true, description: 'Causas vinculadas al riesgo.' }) causes!: CatalogRefResponse[];
}

export class CatalogCauseResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'F001' }) code!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: FAILURE_CATEGORIES, description: 'Categoría de falla de la causa.' }) failure_category!: string;
  @ApiProperty({ enum: ORIGIN, description: ORIGIN_DOC }) origin!: string;
  @ApiProperty() is_active!: boolean;
  @ApiProperty({ example: 2, description: 'Riesgos a los que contribuye la causa.' }) risks_count!: number;
  @ApiProperty({ example: 4, description: 'Controles que tratan la causa.' }) controls_count!: number;
}

export class CatalogCauseDetailResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'F001' }) code!: string;
  @ApiProperty() name!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ enum: FAILURE_CATEGORIES, description: 'Categoría de falla de la causa.' }) failure_category!: string;
  @ApiProperty({ enum: ORIGIN, description: ORIGIN_DOC }) origin!: string;
  @ApiProperty() is_active!: boolean;
  @ApiProperty({ type: CatalogRefResponse, isArray: true, description: 'Riesgos a los que contribuye la causa.' }) risks!: CatalogRefResponse[];
  @ApiProperty({ type: CatalogRefResponse, isArray: true, description: 'Controles que la tratan.' }) controls!: CatalogRefResponse[];
}

export class CatalogTestResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'T-DOC-001' }) code!: string;
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension', description: 'Dimensión de la prueba.' }) dimension!: string;
  @ApiProperty({ description: 'Nombre interno (el del comité).' }) name!: string;
  @ApiProperty({ nullable: true, description: 'Nombre neutro que ve el cliente (D70).' }) display_name!: string | null;
  @ApiProperty({ description: 'Texto libre del comité: Manual, Mixta, Técnica…' }) type!: string;
  @ApiProperty({ enum: ORIGIN, description: ORIGIN_DOC }) origin!: string;
  @ApiProperty() is_active!: boolean;
  @ApiProperty({ example: 2, description: 'Controles que usan la prueba.' }) controls_count!: number;
}

export class TestCommitteeResponse {
  @ApiProperty({ description: 'Objetivo de la prueba.' }) objective!: string;
  @ApiProperty({ description: 'Texto libre del comité.' }) type!: string;
  @ApiProperty({ description: 'Herramienta con la que se ejecuta la prueba.' }) tool!: string;
  @ApiProperty({ description: 'Población sobre la que se prueba.' }) population!: string;
  @ApiProperty({ description: 'Periodo que cubre la prueba.' }) period!: string;
  @ApiProperty({ description: 'Tamaño de la población.' }) population_size!: string;
  @ApiProperty({ description: 'Tamaño de muestra sugerido.' }) suggested_sample_size!: string;
  @ApiProperty({ description: 'Método de selección de la muestra.' }) selection_method!: string;
  @ApiProperty({ description: 'Evidencia que se solicita.' }) evidence_to_request!: string;
  @ApiProperty({ description: 'Prerrequisitos para ejecutar la prueba.' }) prerequisites!: string;
  @ApiProperty({ type: String, isArray: true, description: 'Pasos de la prueba, en orden.' }) step_by_step!: string[];
  @ApiProperty({ type: String, isArray: true, description: 'Atributos que la prueba valida.' }) attributes_to_validate!: string[];
  @ApiProperty({ description: 'Criterio para considerar que cumple.' }) compliance_criterion!: string;
  @ApiProperty({ description: 'Excepciones que se aceptan.' }) exceptions!: string;
  @ApiProperty({ description: 'Cómo se tratan las excepciones.' }) exceptions_handling!: string;
  @ApiProperty({ description: 'Evidencia que se conserva.' }) evidence_to_retain!: string;
  @ApiProperty({ description: 'Qué cubre la parte automática.' }) automated_coverage!: string;
  @ApiProperty({ description: 'Validación manual complementaria.' }) complementary_manual_validation!: string;
  @ApiProperty({ description: 'Limitaciones de la prueba.' }) limitations!: string;
}

export class CatalogTestDetailResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'T-DOC-001' }) code!: string;
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension', description: 'Dimensión de la prueba.' }) dimension!: string;
  @ApiProperty({ description: 'Nombre interno (el del comité).' }) name!: string;
  @ApiProperty({ nullable: true, description: 'Nombre neutro que ve el cliente (D70).' }) display_name!: string | null;
  @ApiProperty({ nullable: true, description: 'Descripción corta que ve el cliente (D82).' }) display_description!: string | null;
  @ApiProperty({ enum: ORIGIN, description: ORIGIN_DOC }) origin!: string;
  @ApiProperty() is_active!: boolean;
  @ApiProperty({ type: TestCommitteeResponse, description: 'Textos del comité. **Nunca salen al cliente** (D70).' }) committee!: TestCommitteeResponse;
  @ApiProperty({ type: CatalogRefResponse, isArray: true, description: 'Controles que usan la prueba.' }) controls!: CatalogRefResponse[];
}

export class CatalogEvidenceTemplateResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'DOC-001' }) code!: string;
  @ApiProperty({ description: 'Qué evidencia se pide.' }) description!: string;
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension', description: 'Dimensión de la evidencia.' }) dimension!: string;
  @ApiProperty({ enum: ORIGIN, description: ORIGIN_DOC }) origin!: string;
  @ApiProperty() is_active!: boolean;
  @ApiProperty({ example: 2, description: 'Controles que la piden.' }) controls_count!: number;
}

export class EvaluationParameterUpdatedByResponse {
  @ApiProperty({ format: 'uuid', description: 'Quién hizo el último cambio.' }) id!: string;
  @ApiProperty({ description: 'Nombre de quien hizo el último cambio.' }) name!: string;
}

export class EvaluationParameterResponse {
  @ApiProperty({ example: 'partial_threshold', description: 'Identificador estable en `snake_case`; va en la ruta del PATCH.' }) key!: string;
  @ApiProperty({ type: String, nullable: true, example: 'PR-01', description: 'Código del libro (`PR-01`…`PR-16`); nulo en los dos parámetros que el libro no numera.' }) code!: string | null;
  @ApiProperty({ description: 'Nombre del parámetro, traducido según `Accept-Language`.' }) name!: string;
  @ApiProperty({ description: 'Qué controla el parámetro, traducido según `Accept-Language`.' }) description!: string;
  @ApiProperty({ enum: ['percent', 'days', 'hours', 'months', 'count', 'boolean', 'days_by_periodicity', 'window_mode'], description: 'Forma de `value` (enum `evaluation_parameter_unit`).' }) unit!: string;
  @ApiProperty({ example: 75, description: 'Valor vigente, con la forma que dice `unit`: entero, booleano, un modo de ventana o un objeto con los días de cada periodicidad.', oneOf: [{ type: 'integer' }, { type: 'boolean' }, { type: 'string' }, { type: 'object', additionalProperties: { type: 'integer' } }] }) value!: unknown;
  @ApiProperty({ example: 75, description: 'Valor del libro (el de la semilla), con la misma forma que `value`.', oneOf: [{ type: 'integer' }, { type: 'boolean' }, { type: 'string' }, { type: 'object', additionalProperties: { type: 'integer' } }] }) default_value!: unknown;
  @ApiProperty({ type: String, format: 'date-time', nullable: true, description: 'Fecha del último cambio; nulo si sigue el valor de la semilla.' }) updated_at!: string | null;
  @ApiProperty({ type: EvaluationParameterUpdatedByResponse, nullable: true, description: 'Quién hizo el último cambio; nulo si sigue el valor de la semilla.' }) updated_by!: EvaluationParameterUpdatedByResponse | null;
}
