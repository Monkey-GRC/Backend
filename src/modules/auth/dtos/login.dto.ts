// src/modules/auth/dtos/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'jhon.doe@exmaple.com or jhon.doe' })
    identifier!: string;

    @IsString()
    @MinLength(8)
    @ApiProperty({ minLength: 8 })
    password!: string;
}