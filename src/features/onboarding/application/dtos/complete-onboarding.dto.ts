import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { BusinessType } from 'generated/prisma-tenant/browser';

export class CompleteOnboardingDto {
  @ApiProperty({ description: 'Código de onboarding entregado por MONKEY_ADMIN' })
  @IsString()
  @IsNotEmpty()
  onboarding_code!: string;

  @ApiPropertyOptional({ description: 'Plantilla maestra elegida — se clona dentro del tenant recién aprovisionado. Si no se envía, el tenant arranca sin template inicial.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  template_id?: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string;

  @ApiPropertyOptional({ enum: BusinessType })
  @IsOptional()
  @IsEnum(BusinessType)
  business_type?: BusinessType;

  @ApiPropertyOptional({ description: 'Número de servidores a evaluar' })
  @IsOptional()
  @IsInt()
  @Min(1)
  server_count?: number;
}
