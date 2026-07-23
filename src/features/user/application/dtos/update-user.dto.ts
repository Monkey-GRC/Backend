import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['client_id'] as const),
) {
  @ApiPropertyOptional({
    description:
      'Enviar null para desvincular del tenant (solo válido si role pasa a ser MONKEY_ADMIN, USER o VIEWER).',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  client_id?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
