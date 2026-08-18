import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateManualCheckDto {
    @ApiProperty({ example: "Verificar que la política de contraseñas esté documentada y firmada" })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title!: string;

    @ApiPropertyOptional({ description: 'Qué se debe verificar exactamente' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @ApiPropertyOptional({ description: 'Qué hacer si al evaluarlo el resultado es fallido' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    remediation?: string;
}
