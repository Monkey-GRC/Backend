import { ApiProperty } from '@nestjs/swagger';

// Formas del `data` de contracts/integraciones.md, solo para la documentación (las arma integration-response.mapper.ts). Ninguna nombra al motor que evalúa.

const PURPOSE = ['measurement', 'workflow'] as const;
const AVAILABILITY = ['available', 'coming_soon'] as const;
const STATUS = ['active', 'pending', 'needs_attention'] as const;
const PROVISIONING_STATUS = ['pending', 'validated', 'active', 'scheduled', 'failed'] as const;
const OPERATIONAL_STATUS = ['operational', 'warning', 'error', 'not_monitored'] as const;

export class IntegrationConnectionTargetResponse {
  @ApiProperty({ example: 'ac_01', description: 'Categoría de la conexión donde se conecta.' }) category!: string;
  @ApiProperty({ example: 'aws', description: 'Código de la plataforma elegida al conectar.' }) platform!: string;
}

export class CatalogIntegrationResponse {
  @ApiProperty({ example: 'aws', description: 'Identificador estable.' }) code!: string;
  @ApiProperty({ example: 'Amazon Web Services', description: 'La marca tal cual: no se traduce.' }) name!: string;
  @ApiProperty({ example: 'aws', description: 'Nombre del SVG en Frontend-Platform (`public/providers/<logo_key>.svg` y `-dark.svg`).' }) logo_key!: string;
  @ApiProperty({ enum: PURPOSE, enumName: 'IntegrationPurpose' }) purpose!: string;
  @ApiProperty({ enum: AVAILABILITY, enumName: 'FrameworkAvailability', description: 'Si la integración tiene plataforma de conexión, es la de la plataforma.' }) availability!: string;
  @ApiProperty({ description: 'Para qué le sirve al cliente, traducida según `Accept-Language`.' }) description!: string;
  @ApiProperty({ type: IntegrationConnectionTargetResponse, nullable: true, description: 'Dónde se conecta; `null` si todavía no tiene flujo de conexión.' }) connection!: IntegrationConnectionTargetResponse | null;
  @ApiProperty({ description: 'La empresa ya tiene al menos una conexión activa de esta integración.' }) connected!: boolean;
}

export class IntegrationServiceResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
}

export class IntegrationConnectionResponse {
  @ApiProperty({ format: 'uuid', description: 'El activo que es la conexión.' }) asset_id!: string;
  @ApiProperty({ example: 'AST-0001' }) code!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: PROVISIONING_STATUS, enumName: 'ProvisioningStatus' }) connection_status!: string;
  @ApiProperty({ enum: OPERATIONAL_STATUS, enumName: 'OperationalStatus' }) operational_status!: string;
  @ApiProperty({ description: 'Problema de conexión (validación fallida o activo en error), no un incumplimiento.' }) needs_attention!: boolean;
  @ApiProperty({ type: IntegrationServiceResponse, isArray: true, description: 'Los servicios a los que pertenece la conexión.' }) services!: IntegrationServiceResponse[];
}

export class IntegrationResponse {
  @ApiProperty({ example: 'aws' }) code!: string;
  @ApiProperty({ example: 'Amazon Web Services' }) name!: string;
  @ApiProperty({ example: 'aws', description: 'Nombre del SVG en Frontend-Platform.' }) logo_key!: string;
  @ApiProperty({ enum: PURPOSE, enumName: 'IntegrationPurpose' }) purpose!: string;
  @ApiProperty({ enum: STATUS, enumName: 'IntegrationStatus', description: 'Derivado de las conexiones: `needs_attention` > `active` > `pending`.' }) status!: string;
  @ApiProperty({ example: 1, description: 'Conexiones vigentes de esta integración.' }) connection_count!: number;
  @ApiProperty({ example: 42, description: 'Recursos que esas conexiones reconocieron en su último descubrimiento.' }) resource_count!: number;
  @ApiProperty({ type: String, format: 'date-time', nullable: true, description: 'La validación más reciente entre sus conexiones.' }) last_validated_at!: string | null;
  @ApiProperty({ type: IntegrationConnectionResponse, isArray: true, description: 'Las conexiones vigentes de esta integración.' }) connections!: IntegrationConnectionResponse[];
}

export class IntegrationPermissionResponse {
  @ApiProperty({ example: 'SecurityAudit', description: 'Nombre del permiso, traducido.' }) name!: string;
  @ApiProperty({ description: 'Para qué lo pide Monkey, traducido.' }) detail!: string;
  @ApiProperty({ type: String, nullable: true, example: 'arn:aws:iam::aws:policy/SecurityAudit', description: 'El identificador técnico tal como lo ve el cliente en su plataforma; `null` si no tiene.' }) scope!: string | null;
  @ApiProperty({ enum: ['read', 'write'], enumName: 'IntegrationPermissionAccess', description: 'Si el permiso solo lee o también escribe.' }) access!: string;
}

export class IntegrationSecurityResponse {
  @ApiProperty({ enum: ['read_only', 'temporary_credentials', 'external_id', 'isolated_execution', 'tenant_isolation', 'encrypted_keys'], enumName: 'IntegrationSecurityTopic', description: 'El tema; la pantalla elige el icono y el título por valor.' }) topic!: string;
  @ApiProperty({ description: 'Cómo lo protege Monkey, traducido. Solo lo verificado.' }) text!: string;
}

export class CoverageTestResponse {
  @ApiProperty({ example: 'T-CLD-001' }) code!: string;
  @ApiProperty({ description: 'Nombre neutro de la prueba.' }) name!: string;
}

export class CoverageFrameworkResponse {
  @ApiProperty({ example: 'soc2' }) code!: string;
  @ApiProperty({ example: 'SOC 2' }) name!: string;
  @ApiProperty({ description: 'Controles de esas pruebas que cubren un requisito del marco.' }) controls_count!: number;
}

export class IntegrationCoverageResponse {
  @ApiProperty({ type: CoverageTestResponse, isArray: true, description: 'Pruebas automáticas que la integración alimenta (con al menos un check de su plataforma).' }) tests!: CoverageTestResponse[];
  @ApiProperty({ description: 'Controles vinculados a esas pruebas, sin repetir. La integración alimenta; no aprueba.' }) controls_count!: number;
  @ApiProperty({ type: CoverageFrameworkResponse, isArray: true, description: 'Por marco.' }) frameworks!: CoverageFrameworkResponse[];
}

export class IntegrationDetailResponse {
  @ApiProperty({ example: 'aws' }) code!: string;
  @ApiProperty({ example: 'Amazon Web Services' }) name!: string;
  @ApiProperty({ example: 'aws', description: 'Nombre del SVG en Frontend-Platform.' }) logo_key!: string;
  @ApiProperty({ enum: PURPOSE, enumName: 'IntegrationPurpose' }) purpose!: string;
  @ApiProperty({ enum: AVAILABILITY, enumName: 'FrameworkAvailability' }) availability!: string;
  @ApiProperty({ description: 'Para qué le sirve al cliente, traducida.' }) description!: string;
  @ApiProperty({ type: IntegrationConnectionTargetResponse, nullable: true, description: 'Dónde se conecta; `null` si todavía no tiene flujo.' }) connection!: IntegrationConnectionTargetResponse | null;
  @ApiProperty({ description: 'La empresa ya tiene al menos una conexión activa.' }) connected!: boolean;
  @ApiProperty({ enum: STATUS, enumName: 'IntegrationStatus', nullable: true, description: 'El de la lista si la empresa la tiene; `null` si no.' }) status!: string | null;
  @ApiProperty({ description: 'Conexiones vigentes; 0 si no la tiene.' }) connection_count!: number;
  @ApiProperty({ description: 'Recursos reconocidos; 0 si no la tiene.' }) resource_count!: number;
  @ApiProperty({ type: String, format: 'date-time', nullable: true, description: 'La validación más reciente; `null` si no la tiene.' }) last_validated_at!: string | null;
  @ApiProperty({ type: IntegrationConnectionResponse, isArray: true, description: 'Como en la lista; vacío si no la tiene.' }) connections!: IntegrationConnectionResponse[];
  @ApiProperty({ description: 'Qué hace, en dos o tres frases.' }) overview!: string;
  @ApiProperty({ type: String, isArray: true, description: 'Lo que el cliente puede hacer con ella.' }) features!: string[];
  @ApiProperty({ type: String, isArray: true, description: 'Lo que necesita antes de conectar. Vacío en `coming_soon`.' }) prerequisites!: string[];
  @ApiProperty({ type: IntegrationPermissionResponse, isArray: true, description: 'Lo que Monkey pide en la plataforma. Vacío en `coming_soon`.' }) permissions!: IntegrationPermissionResponse[];
  @ApiProperty({ type: String, isArray: true, enum: ['server', 'database', 'storage', 'function'], description: 'Tipos de recurso que descubre (`resource_kind`, sin `other`).' }) resource_types!: string[];
  @ApiProperty({ type: IntegrationCoverageResponse, nullable: true, description: 'Lo que alimenta en el cumplimiento, derivado del catálogo; `null` si no tiene checks cargados.' }) coverage!: IntegrationCoverageResponse | null;
  @ApiProperty({ type: IntegrationSecurityResponse, isArray: true, description: 'Cómo protege Monkey la conexión. Solo lo verificado. Vacío en `coming_soon`.' }) security!: IntegrationSecurityResponse[];
  @ApiProperty({ type: String, isArray: true, description: 'Qué aporta, en pocas palabras.' }) capabilities!: string[];
  @ApiProperty({ type: String, isArray: true, description: 'En qué partes de Monkey se usa.' }) works_with!: string[];
}
