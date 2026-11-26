import { ApiProperty } from '@nestjs/swagger';
import { PersonResponse } from '../../../../common/swagger/shared.responses';
import { CONTROL_MANAGEMENT_STATE_DOC, CONTROL_MANAGEMENT_STATES } from '../controls/control.responses';

// Forma del `data` de POST /v1/controls/{control_id}/tests/{test_id}/result (contracts/cumplimiento/aprobacion.md), solo para la documentación (la arma management-response.mapper.ts).
export class ManualTestResultResponse {
  @ApiProperty({ format: 'uuid', description: 'El resultado registrado: inmutable; uno nuevo lo reemplaza en la ventana vigente.' }) id!: string;
  @ApiProperty({ format: 'uuid', description: 'El control en el que se registró: el resultado es de la prueba EN ESE control (D129).' }) control_id!: string;
  @ApiProperty({ format: 'uuid', description: 'La prueba manual.' }) test_id!: string;
  @ApiProperty({ enum: ['correct', 'observation', 'exception'], enumName: 'ManualTestResult' }) result!: string;
  @ApiProperty({ nullable: true, description: 'Lo que se vio; obligatoria si el resultado es `observation` o `exception`.' }) note!: string | null;
  @ApiProperty({ type: PersonResponse, description: 'Quién lo registró.' }) registered_by!: PersonResponse;
  @ApiProperty({ format: 'date-time', description: 'Cuándo se registró.' }) registered_at!: string;
  @ApiProperty({ enum: CONTROL_MANAGEMENT_STATES, enumName: 'ControlManagementState', description: `El estado de gestión del control después del registro. ${CONTROL_MANAGEMENT_STATE_DOC}` }) management_state!: string;
}
