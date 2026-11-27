import { ApiProperty } from '@nestjs/swagger';
import { PersonResponse } from '../../../../common/swagger/shared.responses';
import { MANAGEMENT_ACTIONS } from '../../domain/management/allowed-actions';
import { LEVELS } from '../../domain/controls/management-extras';
import { MANAGEMENT_STATES } from '../../domain/controls/management-state';

// Las constantes se repiten aquí (y no se importan de `controls/control.responses.ts`) porque ese archivo importa estas clases: un ciclo dejaría los enums sin definir al decorar.
const CONTROL_LEVELS = LEVELS;
const CONTROL_MANAGEMENT_STATES = MANAGEMENT_STATES;
const CONTROL_MANAGEMENT_STATE_DOC = 'El estado de gestión del control (`control_management_state`): solo `approved` cuenta como cumplido.';
const PERIODICITIES = ['permanent', 'daily', 'weekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual', 'on_demand'] as const;
const TEST_STATUSES = ['pending', 'correct', 'observation', 'exception', 'not_applicable', 'expired'] as const;

// MD-529 · Formas del `data` de contracts/cumplimiento/aprobacion.md («Lo nuevo de MD-529»), solo para la documentación (las arman management-acts.mapper.ts y la del detalle).
const CHANGE_STATUSES = ['pending', 'approved', 'rejected'] as const;
const APPLICABILITY = ['applicable', 'not_applicable_pending', 'not_applicable'] as const;
const STATUS_DOC = '`pending` por aprobar · `approved` aprobada · `rejected` rechazada (`change_request_status`).';

export class TestRefResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'T-GOB-5-01', description: 'El código de la prueba en el catálogo.' }) code!: string;
  @ApiProperty({ description: 'El nombre neutro de la prueba; nunca su texto del comité.' }) display_name!: string;
}
export class RequirementRefResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'IAC-12-L2', description: 'El código del requisito del control.' }) code!: string;
}

export class LevelOverrideResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid', description: 'El control corregido.' }) control_id!: string;
  @ApiProperty({ enum: CONTROL_LEVELS, enumName: 'ControlLevel', description: 'El nivel del motor cuando se propuso.' }) suggested_level!: string;
  @ApiProperty({ enum: CONTROL_LEVELS, enumName: 'ControlLevel', description: 'El nivel final que se propone.' }) proposed_level!: string;
  @ApiProperty({ description: 'Por qué el nivel del motor no refleja la realidad.' }) justification!: string;
  @ApiProperty({ enum: CHANGE_STATUSES, enumName: 'ChangeRequestStatus', description: STATUS_DOC }) status!: string;
  @ApiProperty({ description: '`false` si dejó de valer: cambió el nivel sugerido o empezó otra ventana del control; no se puede aprobar.' }) is_valid!: boolean;
  @ApiProperty({ type: PersonResponse, description: 'Quién la propuso.' }) proposed_by!: PersonResponse;
  @ApiProperty({ format: 'date-time' }) proposed_at!: string;
  @ApiProperty({ type: PersonResponse, nullable: true, description: 'Quién la decidió; el mismo que propuso si el `admin_empresa` lleva el control.' }) decided_by!: PersonResponse | null;
  @ApiProperty({ format: 'date-time', nullable: true }) decided_at!: string | null;
  @ApiProperty({ nullable: true, description: 'El motivo de la decisión; obligatorio al rechazar.' }) decision_reason!: string | null;
  @ApiProperty({ enum: CONTROL_MANAGEMENT_STATES, enumName: 'ControlManagementState', required: false, description: `El estado de gestión del control después del acto (solo en la respuesta del acto). ${CONTROL_MANAGEMENT_STATE_DOC}` }) management_state?: string;
}

export class RemediationPlanResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) control_id!: string;
  @ApiProperty({ type: TestRefResponse, description: 'La prueba en excepción a la que responde el plan.' }) test!: TestRefResponse;
  @ApiProperty({ type: RequirementRefResponse, nullable: true, description: 'El requisito del control al que sirve la prueba.' }) requirement!: RequirementRefResponse | null;
  @ApiProperty({ description: 'Qué se hará.' }) what!: string;
  @ApiProperty({ type: PersonResponse, description: 'Quién lo hará (persona activa de la empresa).' }) owner!: PersonResponse;
  @ApiProperty({ format: 'date', description: 'Para cuándo.' }) due_date!: string;
  @ApiProperty({ description: '`due_date` pasó y la excepción sigue abierta. Solo informa: el plan sigue contando.' }) is_overdue!: boolean;
  @ApiProperty({ enum: CHANGE_STATUSES, enumName: 'ChangeRequestStatus', description: STATUS_DOC }) status!: string;
  @ApiProperty({ description: '`false` si dejó de valer: empezó otra ventana del control o la prueba ya no está en excepción.' }) is_valid!: boolean;
  @ApiProperty({ type: PersonResponse, description: 'Quién lo registró.' }) proposed_by!: PersonResponse;
  @ApiProperty({ format: 'date-time' }) proposed_at!: string;
  @ApiProperty({ type: PersonResponse, nullable: true }) decided_by!: PersonResponse | null;
  @ApiProperty({ format: 'date-time', nullable: true }) decided_at!: string | null;
  @ApiProperty({ nullable: true, description: 'El motivo de la decisión; obligatorio al rechazar.' }) decision_reason!: string | null;
  @ApiProperty({ enum: CONTROL_MANAGEMENT_STATES, enumName: 'ControlManagementState', required: false, description: `El estado de gestión del control después del acto (solo en la respuesta del acto). ${CONTROL_MANAGEMENT_STATE_DOC}` }) management_state?: string;
}

export class RequirementRefTextResponse extends RequirementRefResponse {
  @ApiProperty({ description: 'El texto del requisito.' }) text!: string;
}
export class NotApplicableRequestResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) control_id!: string;
  @ApiProperty({ type: RequirementRefTextResponse }) requirement!: RequirementRefTextResponse;
  @ApiProperty({ description: 'La justificación del «No aplica».' }) reason!: string;
  @ApiProperty({ enum: CHANGE_STATUSES, enumName: 'ChangeRequestStatus', description: STATUS_DOC }) status!: string;
  @ApiProperty({ type: PersonResponse }) requested_by!: PersonResponse;
  @ApiProperty({ format: 'date-time' }) requested_at!: string;
  @ApiProperty({ type: PersonResponse, nullable: true }) decided_by!: PersonResponse | null;
  @ApiProperty({ format: 'date-time', nullable: true }) decided_at!: string | null;
  @ApiProperty({ nullable: true, description: 'El motivo de la decisión; obligatorio al rechazar.' }) decision_reason!: string | null;
  @ApiProperty({ type: PersonResponse, nullable: true, description: 'Quién lo revirtió, si se revirtió.' }) reverted_by!: PersonResponse | null;
  @ApiProperty({ format: 'date-time', nullable: true }) reverted_at!: string | null;
  @ApiProperty({ enum: CONTROL_MANAGEMENT_STATES, enumName: 'ControlManagementState', required: false, description: `El estado de gestión del control después del acto (solo en la respuesta del acto). ${CONTROL_MANAGEMENT_STATE_DOC}` }) management_state?: string;
}

export class OccurrenceResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ type: RequirementRefResponse }) requirement!: RequirementRefResponse;
  @ApiProperty({ format: 'date', description: 'Cuándo ocurrió.' }) occurred_on!: string;
  @ApiProperty({ description: 'Qué pasó.' }) description!: string;
  @ApiProperty({ description: 'Tiene al menos una entrega de evidencia vigente y no devuelta.' }) has_evidence!: boolean;
  @ApiProperty({ example: 1, description: 'Cuántas entregas vigentes y no devueltas tiene.' }) evidence_count!: number;
  @ApiProperty({ type: PersonResponse }) registered_by!: PersonResponse;
  @ApiProperty({ format: 'date-time' }) registered_at!: string;
}

export class NoOccurrenceDeclarationResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ type: RequirementRefResponse }) requirement!: RequirementRefResponse;
  @ApiProperty({ format: 'date', description: 'Primer día del trimestre declarado.' }) window_start!: string;
  @ApiProperty({ format: 'date', description: 'Último día del trimestre declarado.' }) window_end!: string;
  @ApiProperty({ nullable: true, description: 'Una nota opcional.' }) note!: string | null;
  @ApiProperty({ type: PersonResponse }) declared_by!: PersonResponse;
  @ApiProperty({ format: 'date-time' }) declared_at!: string;
}

export class ManagementLevelResponse {
  @ApiProperty({ enum: CONTROL_LEVELS, enumName: 'ControlLevel', description: 'El nivel que dio el motor.' }) suggested!: string;
  @ApiProperty({ enum: CONTROL_LEVELS, enumName: 'ControlLevel', description: 'El nivel que rige: el sugerido o, con una corrección aprobada y vigente, el corregido.' }) final!: string;
  @ApiProperty({ description: 'Hay una corrección aprobada y vigente.' }) is_corrected!: boolean;
  @ApiProperty({ enum: CONTROL_LEVELS, enumName: 'ControlLevel', isArray: true, description: 'Los niveles que quien llama puede proponer ahora; vacío si no puede.' }) allowed_levels!: string[];
}

export class ManagementExceptionResponse {
  @ApiProperty({ type: TestRefResponse, description: 'La prueba en excepción.' }) test!: TestRefResponse;
  @ApiProperty({ type: RequirementRefResponse, nullable: true }) requirement!: RequirementRefResponse | null;
  @ApiProperty({ type: RemediationPlanResponse, nullable: true, description: 'El plan vigente (`pending` o `approved`) o el último rechazado; `null` si no hay.' }) plan!: RemediationPlanResponse | null;
  @ApiProperty({ enum: MANAGEMENT_ACTIONS, enumName: 'ManagementAction', isArray: true, description: 'Lo que quien llama puede hacer con esta excepción.' }) allowed_actions!: string[];
}

export class OnDemandQuarterResponse {
  @ApiProperty({ format: 'date', description: 'Primer día del trimestre actual.' }) window_start!: string;
  @ApiProperty({ format: 'date', description: 'Último día del trimestre actual.' }) window_end!: string;
  @ApiProperty({ example: 0, description: 'Ocurrencias del trimestre sin evidencia vigente.' }) occurrences_without_evidence!: number;
  @ApiProperty({ example: 1, description: 'Total de ocurrencias (casos) del trimestre vigente.' }) occurrences_count!: number;
  @ApiProperty({ description: 'El trimestre tiene su declaración de «sin ocurrencias».' }) has_declaration!: boolean;
}

export class ManagementRequirementResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'IAC-12-L2' }) code!: string;
  @ApiProperty({ description: 'El texto del requisito.' }) text!: string;
  @ApiProperty({ enum: PERIODICITIES, enumName: 'Periodicity', nullable: true }) periodicity!: string | null;
  @ApiProperty({ enum: APPLICABILITY, enumName: 'RequirementApplicability', description: '`applicable` aplica · `not_applicable_pending` «No aplica» por aprobar · `not_applicable` «No aplica» aprobado.' }) applicability!: string;
  @ApiProperty({ type: NotApplicableRequestResponse, nullable: true, description: 'La solicitud de «No aplica» más reciente.' }) not_applicable!: NotApplicableRequestResponse | null;
  @ApiProperty({ type: OnDemandQuarterResponse, nullable: true, description: 'Solo en un requisito «cuando sea requerido»: el estado del trimestre actual.' }) on_demand!: OnDemandQuarterResponse | null;
  @ApiProperty({ enum: MANAGEMENT_ACTIONS, enumName: 'ManagementAction', isArray: true, description: 'Lo que quien llama puede hacer con este requisito.' }) allowed_actions!: string[];
}

export class ManualResultRefResponse {
  @ApiProperty({ enum: ['correct', 'observation', 'exception'], enumName: 'ManualTestResult' }) result!: string;
  @ApiProperty({ nullable: true, description: 'Lo que se vio.' }) note!: string | null;
  @ApiProperty({ type: PersonResponse, nullable: true, description: 'Quién lo registró.' }) registered_by!: PersonResponse | null;
  @ApiProperty({ format: 'date-time' }) registered_at!: string;
}

export class ManagementManualTestResponse {
  @ApiProperty({ type: TestRefResponse }) test!: TestRefResponse;
  @ApiProperty({ format: 'uuid', nullable: true, description: 'El requisito del control al que sirve la prueba (el «cuando sea requerido» si tiene alguno): de ahí la pantalla pide la ocurrencia. `null` en un control propio.' }) requirement_id!: string | null;
  @ApiProperty({ enum: TEST_STATUSES, enumName: 'TestStatus', description: 'El estado de la prueba en este control.' }) status!: string;
  @ApiProperty({ description: 'La prueba acepta evidencia subida.' }) accepts_evidence!: boolean;
  @ApiProperty({ type: ManualResultRefResponse, nullable: true, description: 'El último resultado registrado; `null` si no hay.' }) latest_result!: ManualResultRefResponse | null;
  @ApiProperty({ enum: MANAGEMENT_ACTIONS, enumName: 'ManagementAction', isArray: true, description: 'Lo que quien llama puede hacer con esta prueba (`register_result`).' }) allowed_actions!: string[];
}

export class ManagementHistoryItemResponse {
  @ApiProperty({ format: 'uuid', description: 'Del registro de origen (aprobación, resultado, propuesta, plan…).' }) id!: string;
  @ApiProperty({ example: 'approval', description: 'Qué tipo de acto es (`management_history_type`).' }) type!: string;
  @ApiProperty({ format: 'date-time', description: 'Cuándo ocurrió.' }) at!: string;
  @ApiProperty({ type: PersonResponse, nullable: true, description: 'Quién lo hizo; `null` si lo hizo el sistema.' }) actor!: PersonResponse | null;
  @ApiProperty({ type: TestRefResponse, nullable: true, description: 'La prueba, si el acto es de una prueba.' }) test!: TestRefResponse | null;
  @ApiProperty({ type: RequirementRefResponse, nullable: true, description: 'El requisito, si el acto es de un requisito.' }) requirement!: RequirementRefResponse | null;
  @ApiProperty({ type: Object, description: 'Depende del `type`: ver el contrato.' }) detail!: Record<string, unknown>;
}
