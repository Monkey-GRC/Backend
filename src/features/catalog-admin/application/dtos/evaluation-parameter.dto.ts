import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class UpdateEvaluationParameterDto {
  @ApiProperty({
    description: 'El valor nuevo, con la forma que dice la `unit` del parámetro: un entero (`percent`, `days`, `hours`, `months`, `count`), `true`/`false` (`boolean`), un objeto con las 7 periodicidades (`days_by_periodicity`) o un modo de ventana (`window_mode`).',
    example: 80,
  })
  @IsDefined()
  value!: unknown;
}
