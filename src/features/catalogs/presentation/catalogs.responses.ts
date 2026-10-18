import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Formas de los elementos de `data.items` de contracts/enums.md, solo para la documentación (las arma catalogs.controller.ts).

export class CatalogOptionResponse {
  @ApiProperty({ example: 'technology_saas', description: 'Valor `snake_case` que viaja por el cable. Es lo que se envía en los formularios.' }) value!: string;
  @ApiProperty({ example: 'Tecnología / SaaS', description: 'Etiqueta traducida al idioma de `Accept-Language`. Es lo único que se muestra.' }) label!: string;
  @ApiPropertyOptional({ enum: ['country', 'region', 'other'], description: 'Solo en listas de países: permite agrupar (`region` = agrupaciones como UE o LATAM).' }) group?: string;
}

export class RegulationOptionResponse {
  @ApiProperty({ example: 'lgpd_br' }) code!: string;
  @ApiProperty({ example: 'LGPD' }) name!: string;
  @ApiProperty({ example: 'Brasil', description: 'Jurisdicción a la que aplica la regulación.' }) jurisdiction!: string;
  @ApiProperty({ example: 'LGPD', description: 'Texto a mostrar.' }) label!: string;
}

export class FrameworkOptionResponse {
  @ApiProperty({ example: 'soc2' }) code!: string;
  @ApiProperty({ example: 'SOC 2' }) name!: string;
  @ApiProperty({ description: 'Descripción comercial del marco.' }) description!: string;
  @ApiProperty({ enum: ['available', 'coming_soon'], description: '`available` ya tiene catálogo y se puede contratar · `coming_soon` es solo oferta comercial.' }) availability!: string;
  @ApiProperty({ example: 'SOC 2', description: 'Texto a mostrar.' }) label!: string;
}

export class PlatformOptionResponse {
  @ApiProperty({ example: 'aws' }) code!: string;
  @ApiProperty({ example: 'AWS', description: 'Marca de la plataforma; no se traduce.' }) name!: string;
  @ApiProperty({ example: 'aws', description: 'Nombre del ícono SVG en la plataforma.' }) logo_key!: string;
  @ApiProperty({ enum: ['available', 'coming_soon'], description: 'Solo se puede elegir la `available`; la otra se muestra bloqueada.' }) availability!: string;
  @ApiProperty({ isArray: true, type: String, description: 'Canales de conexión de la plataforma; el primero es el recomendado. Vacío si aún no tiene.' }) connection_methods!: string[];
}

export class CapabilityOptionResponse {
  @ApiProperty({ example: 'ac_01', description: 'Código de la capacidad automática en el catálogo.' }) catalog_code!: string;
  @ApiProperty({ description: 'Categoría de la capacidad automática.' }) category!: string;
  @ApiProperty({ description: 'Cómo se obtiene la información.' }) method!: string;
  @ApiProperty({ isArray: true, type: String, description: 'Permisos de solo lectura que el cliente debe conceder.' }) required_permissions!: string[];
  @ApiProperty({ description: 'Frecuencia base de la evaluación.' }) base_frequency!: string;
  @ApiProperty({ type: PlatformOptionResponse, isArray: true, description: 'Plataformas entre las que el cliente elige al conectar.' }) platforms!: PlatformOptionResponse[];
  @ApiProperty({ description: 'Evidencia que genera esta capacidad.' }) generated_evidence!: string;
}
