import { ApiProperty } from '@nestjs/swagger';
import { CoverageResponse, ProgressResponse, READINESS, READINESS_DOC } from '../controls/control.responses';
import { AssignedPersonResponse, AssignmentServiceResponse } from '../assignments/assignments.responses';
import { WORK_BUCKETS } from '../../domain/work/work-bucket';

export class WorkProgressResponse {
  @ApiProperty({ enum: READINESS, enumName: 'Readiness', description: READINESS_DOC }) readiness!: string;
  @ApiProperty({ type: ProgressResponse, description: 'Controles cumplidos sobre el total de los suyos. El porcentaje lo deriva la pantalla.' }) progress!: ProgressResponse;
  @ApiProperty({ type: CoverageResponse }) coverage!: CoverageResponse;
}

export class WorkItemResponse {
  @ApiProperty({ format: 'uuid' }) client_control_id!: string;
  @ApiProperty({ example: 'IAC-12' }) code!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ type: AssignmentServiceResponse }) service!: AssignmentServiceResponse;
  @ApiProperty({ enum: ['owner', 'executor'], enumName: 'RoleInControl' }) role_in_control!: string;
  @ApiProperty({ enum: WORK_BUCKETS, enumName: 'WorkBucket', description: 'El primero que aplique (D122): rejected, to_review, to_upload, in_review, done.' }) bucket!: string;
  @ApiProperty({ description: 'Lo que falta subir, lo rechazado, lo que hay que revisar y las observaciones abiertas del auditor.' }) pending_items!: number;
  @ApiProperty({ enum: ['effective', 'ineffective', 'expired', 'error', 'incomplete', 'evaluating', 'no_tests'], enumName: 'ControlState' }) state!: string;
}

export class MyWorkResponse {
  @ApiProperty({ type: WorkItemResponse, isArray: true }) items!: WorkItemResponse[];
  @ApiProperty({ type: WorkProgressResponse, description: 'Avance de SUS controles (los del servicio, si se filtró por él).' }) progress!: WorkProgressResponse;
  @ApiProperty() page!: number;
  @ApiProperty() page_size!: number;
  @ApiProperty() total!: number;
  @ApiProperty() total_pages!: number;
}

export class WorkloadItemResponse {
  @ApiProperty({ type: AssignedPersonResponse }) user!: AssignedPersonResponse;
  @ApiProperty() owned_count!: number;
  @ApiProperty() executed_count!: number;
  @ApiProperty({ type: WorkProgressResponse, description: 'Avance de sus controles: los que posee y los que ejecuta.' }) progress!: WorkProgressResponse;
}

export class WorkloadResponse {
  @ApiProperty({ type: WorkloadItemResponse, isArray: true }) items!: WorkloadItemResponse[];
  @ApiProperty({ description: 'Controles vigentes «Sin asignar» de toda la empresa.' }) unassigned_count!: number;
}
