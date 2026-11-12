import { ApiProperty } from '@nestjs/swagger';

export class AssignmentServiceResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Servicio IA' }) name!: string;
}

export class AssignedPersonResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ nullable: true }) name!: string | null;
  @ApiProperty({ nullable: true }) last_name!: string | null;
  @ApiProperty({ enum: ['admin_empresa', 'responsable', 'delegado', 'auditor', 'admin_monkey'], enumName: 'UserRole' }) role!: string;
}

export class AssignmentItemResponse {
  @ApiProperty({ format: 'uuid', description: 'El control del cliente (de un servicio): la unidad que se asigna.' }) client_control_id!: string;
  @ApiProperty({ example: 'IAC-12', description: 'El código del control (D80): el del catálogo (`IAC-12`) o la numeración propia (`C01`).' }) code!: string;
  @ApiProperty({ isArray: true, type: String, example: ['CC6.1', 'CC6.2'], description: 'Requisitos del marco que cubre; vacío en un control propio.' }) requirement_codes!: string[];
  @ApiProperty() name!: string;
  @ApiProperty({ type: AssignmentServiceResponse }) service!: AssignmentServiceResponse;
  @ApiProperty({ isArray: true, type: String, example: ['CC'], description: 'Prefijos de sus requisitos; vacío en un control propio.' }) categories!: string[];
  @ApiProperty({ enum: ['unassigned', 'assigned'], enumName: 'AssignmentFilter', description: '`unassigned` lleva `owner: null`.' }) assignment!: string;
  @ApiProperty({ type: AssignedPersonResponse, nullable: true }) owner!: AssignedPersonResponse | null;
  @ApiProperty({ type: AssignedPersonResponse, nullable: true, description: 'Nulo = ejecuta el dueño.' }) executor!: AssignedPersonResponse | null;
  @ApiProperty({ enum: ['effective', 'ineffective', 'expired', 'error', 'incomplete', 'evaluating', 'no_tests'], enumName: 'ControlState', description: 'Estado del control, derivado por servicio.' }) state!: string;
}
