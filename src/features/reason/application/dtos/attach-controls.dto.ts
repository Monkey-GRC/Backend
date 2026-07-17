import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AttachControlsDto {
  @ApiProperty({ type: [String], description: 'IDs de los controles a vincular con la causa' })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  controlIds!: string[];
}
