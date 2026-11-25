import { ApiProperty } from '@nestjs/swagger';
import { DIMENSIONS } from '../../../../common/catalogs/dimensions';
import { TEST_STATES } from '../controls/control.responses';

export class VerdictPersonResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Camilo' }) name!: string;
  @ApiProperty({ example: 'Ortiz' }) last_name!: string;
}

export class VerdictRegistrantResponse extends VerdictPersonResponse {
  @ApiProperty({ enum: ['admin_empresa', 'responsable', 'delegado'], example: 'delegado', description: 'El rol de quien lo registró.' }) role!: string;
}

export class VerdictReviewResponse {
  @ApiProperty({ enum: ['admin_empresa', 'responsable'], enumName: 'ReviewerRole', description: 'El rol con el que revisó; lo fija el servidor.' }) reviewer_role!: string;
  @ApiProperty({ enum: ['approve', 'reject'], enumName: 'VerdictReviewDecision' }) decision!: string;
  @ApiProperty({ nullable: true, description: 'Por qué; obligatoria al rechazar.' }) note!: string | null;
  @ApiProperty({ type: VerdictPersonResponse }) reviewed_by!: VerdictPersonResponse;
  @ApiProperty({ format: 'date-time' }) reviewed_at!: string;
}

export class VerdictControlRefResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'IAC-12', description: 'Código del control (el del catálogo o el propio).' }) code!: string;
}

export class VerdictResponse {
  @ApiProperty({ format: 'uuid', description: 'El veredicto (D121): del test en el servicio, nunca se edita ni se borra.' }) id!: string;
  @ApiProperty({ format: 'uuid', description: 'El control de origen: desde el que se dio el veredicto (D85).' }) control_id!: string;
  @ApiProperty({ format: 'uuid', description: 'El test al que se le dio el veredicto.' }) test_id!: string;
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension', description: 'Dimensión del test.' }) dimension!: string;
  @ApiProperty({ enum: ['manual'], enumName: 'EvaluationOrigin', description: 'Siempre `manual`: lo registró una persona.' }) origin!: string;
  @ApiProperty({ enum: ['compliant', 'non_compliant'], enumName: 'VerdictResult' }) result!: string;
  @ApiProperty({ nullable: true, description: 'Por qué.' }) note!: string | null;
  @ApiProperty({ nullable: true, description: 'La razón por la que se dio aunque el control de origen tuviera observaciones abiertas.' }) closure_observation_reason!: string | null;
  @ApiProperty({ enum: ['pending', 'approved', 'rejected'], enumName: 'VerdictState', description: 'Se deriva de las revisiones: algún rechazo es `rejected`; sin rechazos y con una aprobación, `approved`; sin revisión, `pending`. Solo uno `approved` cuenta.' }) state!: string;
  @ApiProperty({ type: VerdictRegistrantResponse, description: 'Quién lo registró.' }) registered_by!: VerdictRegistrantResponse;
  @ApiProperty({ type: VerdictReviewResponse, isArray: true, description: 'A lo sumo una por rol (el dueño y el admin_empresa).' }) reviews!: VerdictReviewResponse[];
  @ApiProperty({ type: VerdictPersonResponse, description: 'Quién lo registró (igual que `registered_by`, nombre del contrato D96).' }) confirmed_by!: VerdictPersonResponse;
  @ApiProperty({ format: 'date-time', description: 'Cuándo se registró.' }) evaluated_at!: string;
  @ApiProperty({ enum: TEST_STATES, enumName: 'TestState', required: false, description: 'El estado del test en el control de origen tras el cambio. Solo al registrar o revisar.' }) test_state?: string;
  @ApiProperty({ type: VerdictControlRefResponse, isArray: true, description: 'Los controles del servicio donde cuenta (D85): todos los que llevan el test.' }) applies_to_controls!: VerdictControlRefResponse[];
}
