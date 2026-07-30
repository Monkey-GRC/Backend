import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'jhon.doe@exmaple.com or jhon.doe' })
    identifier!: string;

    @IsString()
    @MinLength(8)
    @ApiProperty({ minLength: 8 })
    password!: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description:
            'api_key del tenant ("<api_key_id>.<secret>"). Requerido para iniciar sesión como usuario de un tenant; se omite para sesiones MONKEY_ADMIN.',
    })
    api_key?: string;
}
