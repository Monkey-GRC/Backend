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
  @ApiProperty({ format: 'uuid', description: 'El control del cliente (de un servicio).' }) client_control_id!: string;
  @ApiProperty({ example: 'IAC-12', description: 'El código del control (D80): el del catálogo o la numeración propia.' }) code!: string;
  @ApiProperty({ description: 'El nombre del control.' }) title!: string;
  @ApiProperty({ type: AssignmentServiceResponse }) service!: AssignmentServiceResponse;
  @ApiProperty({ enum: ['owner', 'executor', 'approver'], enumName: 'RoleInControl', description: '`owner` dueño · `executor` ejecutor · `approver` (MD-529) el `admin_empresa` que decide sobre un control de otro responsable.' }) role_in_control!: string;
  @ApiProperty({ enum: WORK_BUCKETS, enumName: 'WorkBucket', description: 'El primero que aplique (D122): rejected, to_review, to_upload, in_review, done.' }) bucket!: string;
  @ApiProperty({ description: 'Lo que falta subir, lo rechazado, lo que hay que revisar y las observaciones abiertas del auditor.' }) pending_items!: number;
  @ApiProperty({ enum: ['effective', 'ineffective', 'expired', 'error', 'incomplete', 'evaluating', 'no_tests'], enumName: 'ControlState' }) state!: string;
  @ApiProperty({ enum: ['control_approval', 'manual_result', 'level_override', 'remediation_plan', 'not_applicable'], enumName: 'WorkDecisionKind', isArray: true, description: 'MD-529 · Las decisiones que le tocan en este control (`[]` fuera de `to_review`).' }) pending_decisions!: string[];
}

export class MyWorkResponse {
  @ApiProperty({ type: WorkItemResponse, isArray: true, description: 'Los controles de la página.' }) items!: WorkItemResponse[];
  @ApiProperty({ type: WorkProgressResponse, nullable: true, description: 'Avance de SUS controles (los del servicio, si se filtró por él). `null` para el `admin_empresa`: no hay un avance de «toda la empresa».' }) progress!: WorkProgressResponse | null;
  @ApiProperty({ description: 'Página actual, desde 1.' }) page!: number;
  @ApiProperty({ description: 'Elementos por página.' }) page_size!: number;
  @ApiProperty({ description: 'Controles que cumplen los filtros.' }) total!: number;
  @ApiProperty({ description: 'Páginas en total.' }) total_pages!: number;
}

export class WorkloadItemResponse {
  @ApiProperty({ type: AssignedPersonResponse }) user!: AssignedPersonResponse;
  @ApiProperty({ description: 'Controles de los que es dueño.' }) owned_count!: number;
  @ApiProperty({ description: 'Controles que ejecuta.' }) executed_count!: number;
  @ApiProperty({ type: WorkProgressResponse, description: 'Avance de sus controles: los que posee y los que ejecuta.' }) progress!: WorkProgressResponse;
}

export class WorkloadResponse {
  @ApiProperty({ type: WorkloadItemResponse, isArray: true, description: 'Cada persona con su carga, por rol y nombre.' }) items!: WorkloadItemResponse[];
  @ApiProperty({ description: 'Controles vigentes «Sin asignar» de toda la empresa.' }) unassigned_count!: number;
}
