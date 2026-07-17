import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    MaxLength,
    IsInt,
    Min,
    Max,
    IsUUID,
} from 'class-validator';

export class CreateRiskDto {

    @ApiProperty({
        description: 'Nombre del riesgo',
        example: 'Riesgo de caída de sistemas críticos',
        maxLength: 150,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name!: string;

    @ApiPropertyOptional({
        description: 'Descripción detallada del riesgo',
        example: 'Posible indisponibilidad del sistema principal por falla eléctrica',
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiProperty({
        description: 'Nivel de impacto del riesgo (1 = Bajo, 5 = Crítico)',
        example: 4,
        minimum: 1,
        maximum: 5,
        type: Number,
    })
    @IsInt()
    @Min(1)
    @Max(5)
    impact!: number;

    @ApiProperty({
        description: 'Probabilidad de ocurrencia del riesgo (1 = Muy baja, 5 = Muy alta)',
        example: 3,
        minimum: 1,
        maximum: 5,
        type: Number,
    })
    @IsInt()
    @Min(1)
    @Max(5)
    probability!: number;

    @ApiPropertyOptional({
        description: 'ID del template al que pertenece este riesgo',
    })
    @IsOptional()
    @IsUUID()
    templateId?: string;
}
