import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsDefined, IsUUID, ValidateIf } from 'class-validator';

// contracts/gestion-usuarios.md · Asignación de controles (MD-192). Hasta 200 controles por petición, sin repetir.
export const MAX_ASSIGNMENT_CONTROLS = 200;

const CONTROL_IDS_DOC = `Controles del cliente (\`client_control_id\`): de 1 a ${MAX_ASSIGNMENT_CONTROLS}, sin repetir.`;

export class SetOwnerDto {
  @ApiProperty({ type: String, isArray: true, format: 'uuid', description: CONTROL_IDS_DOC })
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(MAX_ASSIGNMENT_CONTROLS) @ArrayUnique() @IsUUID('all', { each: true }) client_control_ids!: string[];

  @ApiProperty({ type: String, format: 'uuid', nullable: true, description: 'Un `responsable` activo o pendiente de la empresa, o el propio `admin_empresa`. `null` deja los controles «Sin asignar».' })
  @IsDefined() @ValidateIf((o: SetOwnerDto) => o.owner_id !== null) @IsUUID('all') owner_id!: string | null;
}

export class SetExecutorDto {
  @ApiProperty({ type: String, isArray: true, format: 'uuid', description: `${CONTROL_IDS_DOC} Solo controles de los que el responsable es dueño.` })
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(MAX_ASSIGNMENT_CONTROLS) @ArrayUnique() @IsUUID('all', { each: true }) client_control_ids!: string[];

  @ApiProperty({ type: String, format: 'uuid', nullable: true, description: 'Un `delegado` activo o pendiente del equipo del responsable. `null` quita el ejecutor (ejecuta el dueño).' })
  @IsDefined() @ValidateIf((o: SetExecutorDto) => o.executor_id !== null) @IsUUID('all') executor_id!: string | null;
}
