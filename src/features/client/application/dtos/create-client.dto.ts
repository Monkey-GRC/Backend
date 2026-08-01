import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ClientDocumentType } from 'generated/prisma-central/browser';

export class CreateClientDto {
  @ApiProperty({ description: 'Nombre o razón social' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiProperty({ enum: ClientDocumentType })
  @IsEnum(ClientDocumentType)
  document_type!: ClientDocumentType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  document_number!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone!: string;

  @ApiProperty({ description: 'Dirección de ubicación de la empresa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  address!: string;
}
