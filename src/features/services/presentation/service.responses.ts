import { ApiProperty } from '@nestjs/swagger';
import {
  ACTIVE_CLIENT_COUNT_VALUES,
  DATA_TYPE_VALUES,
  EXPECTED_AVAILABILITY_VALUES,
  PREVIOUS_CERTIFICATION_VALUES,
  SERVED_INDUSTRY_VALUES,
  SERVICE_COUNTRY_VALUES,
  SERVICE_TYPE_VALUES,
  SUBSERVICE_TYPE_VALUES,
  TRUST_CRITERION_VALUES,
} from '../../../common/catalogs/service-catalogs';
import { CompletionResponse } from '../../../common/swagger/shared.responses';

// Formas del `data` de contracts/modules/onboarding-service-context.md, solo para la documentación (las arma service-response.mapper.ts).

export class ServiceFrameworkResponse {
  @ApiProperty({ example: 'soc2' }) code!: string;
  @ApiProperty({ example: 'SOC 2' }) name!: string;
  @ApiProperty({ example: '2026-10-01', description: 'Fecha en que la empresa contrató el marco (YYYY-MM-DD).' }) contracted_at!: string;
  @ApiProperty({ enum: ['active', 'paused', 'finished'], enumName: 'ServiceFrameworkStatus', description: 'Estado del marco dentro del servicio.' }) status!: string;
  @ApiProperty({ example: 1, description: 'Versión del catálogo que se clonó para este servicio.' }) catalog_version!: number;
  @ApiProperty({ example: '2026', description: 'Periodo de evaluación del marco.' }) evaluation_period!: string;
}

export class SubserviceResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: SUBSERVICE_TYPE_VALUES, enumName: 'SubserviceType' }) type!: string;
  @ApiProperty({ nullable: true, example: 'Amazon Web Services', description: 'Nombre del proveedor del tercero.' }) provider!: string | null;
  @ApiProperty({ nullable: true, example: 'Cómputo y almacenamiento', description: 'Qué servicio presta el tercero.' }) service_provided!: string | null;
  @ApiProperty({ nullable: true, description: 'Responsabilidad que asume el tercero frente al servicio.' }) responsibility!: string | null;
}

export class SystemDescriptionResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ nullable: true, example: 'https://docs.ejemplo.com/system-description-v2.pdf', description: 'Enlace, si se declaró uno. Pueden venir el enlace y el archivo a la vez.' }) url!: string | null;
  @ApiProperty({ nullable: true, example: 'descripcion-del-sistema.pdf', description: 'Nombre del archivo subido, si hay. Se descarga con `GET /v1/services/{id}/system-description/file`; la llave interna no sale.' }) file_name!: string | null;
  @ApiProperty({ isArray: true, type: Object, description: 'Secciones extraídas del documento (reservado).' }) sections!: unknown[];
}

export class ServiceCatalogResponse {
  @ApiProperty({ enum: ['ready'], description: 'El catálogo se clona dentro de la misma transacción que crea el servicio: al responder ya está listo.' }) status!: string;
  @ApiProperty({ example: 61, description: 'Requisitos del marco que aplican según los criterios elegidos.' }) applicable_requirements!: number;
  @ApiProperty({ example: 52, description: 'Controles clonados al servicio.' }) cloned_controls!: number;
  @ApiProperty({ example: 'catalog.cloned', description: 'Clave del mensaje; el texto traducido viaja en `message` del sobre.' }) message!: string;
}

export class TechnicalControlSummaryResponse {
  @ApiProperty({ example: 2, description: 'Activos conectados registrados para este servicio.' }) connection_count!: number;
  @ApiProperty({ description: 'El Componente 3 está hecho cuando el servicio tiene al menos una conexión (D92: ya no hay escenario de despliegue que declarar).' }) is_complete!: boolean;
}

export class ServiceResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid', description: 'Organización (contexto organizacional) a la que pertenece.' }) organization_id!: string;
  @ApiProperty({ example: 'Mesa de servicio gestionada' }) name!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ description: 'Alcance del servicio (qué entra y qué no en la evaluación).' }) scope_statement!: string;
  @ApiProperty({ enum: SERVICE_TYPE_VALUES, enumName: 'ServiceType' }) type!: string;
  @ApiProperty({ enum: SERVED_INDUSTRY_VALUES, enumName: 'ServedIndustry', isArray: true, description: 'Industrias a las que sirve el servicio.' }) industries_served!: string[];
  @ApiProperty({ enum: ACTIVE_CLIENT_COUNT_VALUES, enumName: 'ActiveClientCount', nullable: true }) active_client_count!: string | null;
  @ApiProperty({ enum: SERVICE_COUNTRY_VALUES, enumName: 'ServiceCountry', isArray: true, description: 'Países (o regiones) donde se presta.' }) countries!: string[];
  @ApiProperty({ enum: DATA_TYPE_VALUES, enumName: 'DataType', isArray: true, description: 'Tipos de datos que el servicio trata.' }) data_types!: string[];
  @ApiProperty({ enum: TRUST_CRITERION_VALUES, enumName: 'TrustCriterion', isArray: true, description: 'Criterios de confianza de SOC 2. `security` siempre está.' }) trust_criteria!: string[];
  @ApiProperty({ type: ServiceFrameworkResponse, isArray: true, description: 'Marcos que se evalúan en el servicio.' }) frameworks!: ServiceFrameworkResponse[];
  @ApiProperty({ type: SubserviceResponse, isArray: true, description: 'Organizaciones subservicio (terceros de los que depende el servicio).' }) subservice_organizations!: SubserviceResponse[];
  @ApiProperty({ enum: PREVIOUS_CERTIFICATION_VALUES, enumName: 'PreviousCertification', nullable: true }) previous_certification!: string | null;
  @ApiProperty({ enum: EXPECTED_AVAILABILITY_VALUES, enumName: 'ExpectedAvailability' }) expected_availability!: string;
  @ApiProperty({ type: SystemDescriptionResponse, nullable: true, description: '`null` mientras no se haya declarado la Descripción del Sistema.' }) system_description!: SystemDescriptionResponse | null;
  @ApiProperty({ type: ServiceCatalogResponse }) catalog!: ServiceCatalogResponse;
  @ApiProperty({ type: CompletionResponse, description: 'Campos del formulario llenos; no mide cumplimiento.' }) completion!: CompletionResponse;
  @ApiProperty({ description: 'Si los 12 campos obligatorios están llenos.' }) is_complete!: boolean;
  @ApiProperty({ type: TechnicalControlSummaryResponse }) technical_control!: TechnicalControlSummaryResponse;
  @ApiProperty({ format: 'date-time' }) created_at!: string;
  @ApiProperty({ format: 'date-time' }) updated_at!: string;
}

export class ServiceListFrameworkResponse {
  @ApiProperty({ example: 'soc2' }) code!: string;
  @ApiProperty({ enum: ['active', 'paused', 'finished'], enumName: 'ServiceFrameworkStatus' }) status!: string;
}

export class ServiceListCatalogResponse {
  @ApiProperty({ enum: ['ready'], description: '`ready`: el catálogo ya está clonado.' }) status!: string;
  @ApiProperty({ example: 52, description: 'Controles clonados al servicio.' }) cloned_controls!: number;
}

export class ServiceListItemResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Mesa de servicio gestionada' }) name!: string;
  @ApiProperty({ enum: SERVICE_TYPE_VALUES, enumName: 'ServiceType' }) type!: string;
  @ApiProperty({ description: 'Si los campos obligatorios del servicio están llenos.' }) is_complete!: boolean;
  @ApiProperty({ type: ServiceListFrameworkResponse, isArray: true, description: 'Marcos que se evalúan en el servicio.' }) frameworks!: ServiceListFrameworkResponse[];
  @ApiProperty({ type: ServiceListCatalogResponse }) catalog!: ServiceListCatalogResponse;
  @ApiProperty({ type: TechnicalControlSummaryResponse }) technical_control!: TechnicalControlSummaryResponse;
  @ApiProperty({ format: 'date-time' }) created_at!: string;
}

export class SystemDescriptionDownloadResponse {
  @ApiProperty({ format: 'uri', description: 'Enlace firmado de un solo propósito. **Vence en 5 minutos**; el archivo nunca es público.' }) url!: string;
  @ApiProperty({ example: 'descripcion-del-sistema.pdf', description: 'Nombre del archivo.' }) file_name!: string;
  @ApiProperty({ example: 300, description: 'Segundos que dura el enlace.' }) expires_in!: number;
}
