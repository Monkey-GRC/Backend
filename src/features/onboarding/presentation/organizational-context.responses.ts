import { ApiProperty } from '@nestjs/swagger';
import { CompletionResponse } from '../../../common/swagger/shared.responses';
import {
  BUSINESS_MODEL_VALUES,
  CLIENT_COUNTRY_VALUES,
  COMPLIANCE_MATURITY_VALUES,
  INCORPORATION_COUNTRY_VALUES,
  INDUSTRY_VALUES,
  SIZE_VALUES,
  YEARS_IN_OPERATION_VALUES,
} from '../../../common/catalogs/onboarding-catalogs';

// Forma del `data` de contracts/modules/onboarding-organizational-context.md, solo para la documentación (la arma organizational-context-response.mapper.ts).

export class RegulationResponse {
  @ApiProperty({ example: 'lgpd_br', description: 'Código de la regulación (el mismo que se envía en `regulation_codes`).' }) code!: string;
  @ApiProperty({ example: 'LGPD' }) name!: string;
  @ApiProperty({ example: 'Brasil', description: 'Jurisdicción a la que aplica.' }) jurisdiction!: string;
}

export class OrganizationalContextResponse {
  @ApiProperty({ format: 'uuid', nullable: true, description: '`null` mientras el contexto no se haya guardado nunca.' }) id!: string | null;
  @ApiProperty({ example: 'Next Audit & Consulting S.A.S.', description: 'Razón social, fijada al registrar la empresa. Solo lectura.' }) name!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty({ enum: SIZE_VALUES, enumName: 'OrganizationSize', nullable: true }) size!: string | null;
  @ApiProperty({ enum: INDUSTRY_VALUES, enumName: 'Industry', nullable: true }) industry!: string | null;
  @ApiProperty({ enum: BUSINESS_MODEL_VALUES, enumName: 'BusinessModel', nullable: true }) business_model!: string | null;
  @ApiProperty({ enum: YEARS_IN_OPERATION_VALUES, enumName: 'YearsInOperation', nullable: true }) years_in_operation!: string | null;
  @ApiProperty({ enum: INCORPORATION_COUNTRY_VALUES, enumName: 'IncorporationCountry', isArray: true, description: 'Países donde está constituida la empresa.' }) incorporation_countries!: string[];
  @ApiProperty({ enum: CLIENT_COUNTRY_VALUES, enumName: 'ClientCountry', isArray: true, description: 'Países donde están sus clientes.' }) client_countries!: string[];
  @ApiProperty({ enum: COMPLIANCE_MATURITY_VALUES, enumName: 'ComplianceMaturity', nullable: true }) compliance_maturity!: string | null;
  @ApiProperty({ type: RegulationResponse, isArray: true, description: 'Regulaciones declaradas, ya con nombre y jurisdicción (el request manda solo `regulation_codes`).' }) regulations!: RegulationResponse[];
  @ApiProperty({ type: CompletionResponse, description: 'Cuenta campos del formulario llenos; no mide cumplimiento.' }) completion!: CompletionResponse;
  @ApiProperty({ description: 'Si los 9 campos obligatorios están llenos.' }) is_complete!: boolean;
}
