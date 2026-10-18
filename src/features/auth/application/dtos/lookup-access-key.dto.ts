import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// contracts/modules/auth.md — POST /v1/auth/redeem/lookup (primer paso de la activación, D51).
export class LookupAccessKeyDto {
  @ApiProperty({ example: 'MNK-7F3A-92KD-5QXB', maxLength: 32, description: 'Clave de acceso que Monkey entregó al cliente (formato `MNK-XXXX-XXXX-XXXX`, con o sin guiones, en mayúsculas o minúsculas).' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  code!: string;
}
