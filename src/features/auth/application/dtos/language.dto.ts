import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export const LANGUAGES = ['es', 'en'] as const;
export type LanguageValue = (typeof LANGUAGES)[number];

// contracts/autenticacion.md — PATCH /v1/auth/me/language (D111).
export class SetLanguageDto {
  @ApiProperty({ enum: LANGUAGES, enumName: 'Language', example: 'en', description: 'El idioma en el que la persona usa Monkey.' })
  @IsIn([...LANGUAGES])
  language!: LanguageValue;
}
