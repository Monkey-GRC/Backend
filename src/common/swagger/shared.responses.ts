import { ApiProperty } from '@nestjs/swagger';

// Formas que se repiten en varias respuestas, solo para la documentación.

/** Cuenta los campos de un formulario llenos. No mide cumplimiento (philosophy.md). */
export class CompletionResponse {
  @ApiProperty({ example: 9, description: 'Campos obligatorios del formulario.' }) required_total!: number;
  @ApiProperty({ example: 6, description: 'Obligatorios ya llenos.' }) required_filled!: number;
  @ApiProperty({ example: 1, description: 'Campos opcionales.' }) optional_total!: number;
  @ApiProperty({ example: 0, description: 'Opcionales ya llenos.' }) optional_filled!: number;
}

/** Una persona tal como la muestra el contrato: el nombre puede faltar. */
export class PersonResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ nullable: true, example: 'Ana' }) name!: string | null;
  @ApiProperty({ nullable: true, example: 'Pérez' }) last_name!: string | null;
}
