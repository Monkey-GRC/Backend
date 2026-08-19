import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import type { TranslationTargetLang } from '../../domain/repositories/translation.repository';

export class TranslateTextDto {
    @ApiProperty({ description: 'Texto a traducir (ej. el rationale/remediation de un check CIS)' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(4000)
    text!: string;

    @ApiProperty({ enum: ['es', 'en'], description: 'Idioma destino' })
    @IsIn(['es', 'en'])
    targetLang!: TranslationTargetLang;
}
