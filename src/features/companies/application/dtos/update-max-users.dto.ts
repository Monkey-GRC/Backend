import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, Min } from 'class-validator';

export class UpdateMaxUsersDto {
  @ApiProperty({ example: 25, minimum: 1, description: 'Nuevo cupo de usuarios. No puede ser menor que las cuentas que ya cuentan (`users_count`).' })
  @IsDefined()
  @IsInt()
  @Min(1)
  max_users!: number;
}
