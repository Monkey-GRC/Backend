import { ApiProperty } from '@nestjs/swagger';
import { RESPONSIBLE_TYPES } from '../domain/repositories/responsible.repository';

// Forma del `data` de contracts/modules/compliance-responsibles.md, solo para la documentación.

export const RESPONSIBLE_TYPE_DOC =
  'Cargo dentro de la organización: `coo`, `it`, `compliance`, `process`, `ciso` o `asset_owner`. Es un cargo, no una persona con cuenta (`GET /v1/catalogs/responsible_type`).';

/** El cargo tal como viaja dentro de otros objetos (evidencias, tratamientos). */
export class ResponsibleRefResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: RESPONSIBLE_TYPES, enumName: 'ResponsibleType', description: RESPONSIBLE_TYPE_DOC }) type!: string;
  @ApiProperty({ example: 'Ana Pérez', description: 'Nombre de quien ocupa el cargo.' }) person_name!: string;
}

export class ResponsibleResponse extends ResponsibleRefResponse {
  @ApiProperty({ description: 'Si el cargo está asignado a algo (evidencias o tratamientos). Uno en uso no se puede borrar.' }) is_in_use!: boolean;
}
