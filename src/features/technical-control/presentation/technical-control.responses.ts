import { ApiProperty } from '@nestjs/swagger';
import {
  ASSET_CRITICALITY_VALUES,
  CONNECTION_CATEGORY_VALUES,
  CONNECTION_METHOD_VALUES,
  RESOURCE_KIND_VALUES,
  SCHEDULE_FREQUENCY_VALUES,
} from '../../../common/catalogs/technical-catalogs';
import { CapabilityOptionResponse } from '../../catalogs/presentation/catalogs.responses';

// Formas del `data` de contracts/modules/onboarding-technical-control.md y control-tecnico-operacion.md, solo para la documentación
// (las arman technical-control-response.mapper.ts y scan-response.mapper.ts). Ninguna lleva el proveedor de la capacidad ni credenciales.

const PROVISIONING_STATUS = ['pending', 'validated', 'active', 'scheduled', 'failed'] as const;
const OPERATIONAL_STATUS = ['operational', 'warning', 'error', 'not_monitored'] as const;
const ASSET_TYPE = ['server', 'database', 'cloud_service', 'application', 'endpoint', 'network_device', 'documentation'] as const;
const READINESS = ['ready', 'almost_ready', 'needs_work', 'not_measured'] as const;
const PROBE_MODE = ['simulated', 'unavailable', 'runner'] as const;

export class TechnicalControlStateResponse {
  @ApiProperty({ type: CapabilityOptionResponse, isArray: true, description: 'Conexiones que el cliente puede registrar: todas las del catálogo. El cliente no declara dónde vive su servicio, elige la plataforma (D92).' }) applicable_capabilities!: CapabilityOptionResponse[];
  @ApiProperty({ enum: PROBE_MODE, enumName: 'ProbeMode', description: '`simulated` demostración · `runner` comprobación real contra la cuenta del cliente · `unavailable` esta instalación aún no puede comprobar conexiones.' }) probe_mode!: string;
}

export class ServiceAssetsResultResponse {
  @ApiProperty({ example: 12, description: 'Activos de la conexión que quedan en el servicio.' }) included!: number;
  @ApiProperty({ example: 3, description: 'Cuántos se agregaron con esta llamada.' }) added!: number;
  @ApiProperty({ example: 1, description: 'Cuántos se quitaron con esta llamada.' }) removed!: number;
}

export class AssetServiceRefResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Mesa de servicio gestionada' }) name!: string;
}

export class ConnectionSetupResponse {
  @ApiProperty({ enum: CONNECTION_METHOD_VALUES, enumName: 'ConnectionMethod', description: 'Con qué canal se conecta; define qué otros campos vienen.' }) method!: string;
  @ApiProperty({ required: false, description: '`readonly_role`: identificador externo que Monkey generó; el cliente lo pega al crear el rol.' }) external_id?: string;
  @ApiProperty({ required: false, nullable: true, description: '`readonly_role`: identidad de Monkey a la que el rol del cliente da confianza.' }) monkey_principal_arn?: string | null;
  @ApiProperty({ required: false, example: 'MonkeyReadOnly', description: '`readonly_role`: nombre sugerido del rol.' }) role_name?: string;
  @ApiProperty({ required: false, example: '/v1/connection-templates/aws-readonly-role', description: '`readonly_role` e `identity_federation`: ruta de la plantilla o del script que el cliente descarga.' }) template_path?: string;
  @ApiProperty({ required: false, nullable: true, example: 'arn:aws:iam::123456789012:role/MonkeyReadOnly', description: '`readonly_role`: rol que el cliente ya entregó, si lo hizo.' }) role_arn?: string | null;
  @ApiProperty({ required: false, example: 'acme-prod-421905', description: '`identity_federation` (GCP): el ID del proyecto declarado.' }) project_id?: string;
  @ApiProperty({ required: false, nullable: true, example: '407295138461', description: '`identity_federation`: número de proyecto que el cliente entregó; `null` hasta entonces.' }) project_number?: string | null;
  @ApiProperty({ required: false, nullable: true, description: '`identity_federation`: comando listo para pegar en Cloud Shell, con el script completo dentro. `null` si el servidor no tiene configurada la identidad de Monkey.' }) setup_command?: string | null;
  @ApiProperty({ required: false, example: '3f2a91c4-7b6d-4e0a-9c11-5d8e2f7a0b13', description: '`app_certificate` (Microsoft 365): el ID del tenant declarado.' }) tenant_id?: string;
  @ApiProperty({ required: false, nullable: true, example: '0b8c3e1a-2d4f-4a6b-8c9d-1e2f3a4b5c6d', description: '`app_certificate`: el ID de la aplicación que el cliente entregó; `null` hasta entonces.' }) client_id?: string | null;
  @ApiProperty({ required: false, type: Object, description: '`app_certificate`: `{ thumbprint, expires_at }` del certificado público que se sube a la aplicación. No son secretos; la clave privada nunca sale.' }) certificate?: { thumbprint: string; expires_at: string };
  @ApiProperty({ required: false, description: '`access_keys`: advertencia de que las llaves de larga duración son menos seguras que un rol.' }) warning?: string;
  @ApiProperty({ isArray: true, type: String, description: 'Pasos de instrucciones ya traducidos al idioma de la petición.' }) steps!: string[];
}

export class AssetProvisioningResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: CONNECTION_CATEGORY_VALUES, enumName: 'ConnectionCategory', description: 'Capacidad automática (`ac_01`…`ac_06`) con la que se conectó.' }) automated_capability_code!: string;
  @ApiProperty({ enum: CONNECTION_METHOD_VALUES, enumName: 'ConnectionMethod', nullable: true }) connection_method!: string | null;
  @ApiProperty({ isArray: true, type: String, example: ['us-east-1'], description: 'Regiones que se evalúan: las únicas que se miran (D53).' }) regions!: string[];
  @ApiProperty({ enum: PROVISIONING_STATUS, enumName: 'ProvisioningStatus', description: 'Flujo: `pending` → `validated` → `active` → `scheduled`. `failed` = la validación no conectó.' }) connection_status!: string;
  @ApiProperty({ format: 'date-time', nullable: true }) last_validated_at!: string | null;
  @ApiProperty({ description: 'Si la evaluación automática está activada.' }) is_active!: boolean;
  @ApiProperty({ enum: SCHEDULE_FREQUENCY_VALUES, enumName: 'ScheduleFrequency', nullable: true }) schedule_frequency!: string | null;
}

export class AssetOsVersionResponse {
  @ApiProperty({ example: 'ubuntu_22_04_lts', description: 'El `value` con el que se declaró (`GET /v1/catalogs/<sistema>_version`).' }) value!: string;
  @ApiProperty({ example: 'Ubuntu 22.04 LTS', description: 'El mismo texto que el catálogo.' }) label!: string;
}

export class AssetAgentResponse {
  @ApiProperty({ enum: ['pending', 'connected', 'disconnected', 'removed'], enumName: 'AssetAgentStatus', description: '`pending`: declarado, sin conectarse todavía · `connected` · `disconnected` · `removed`: se quitó el activo.' }) status!: string;
  @ApiProperty({ enum: ['linux', 'windows', 'macos', 'solaris', 'hp_ux'], example: 'linux', description: 'El sistema, de la versión declarada: de él depende el comando de instalación.' }) os!: string;
  @ApiProperty({ type: AssetOsVersionResponse }) os_version!: AssetOsVersionResponse;
  @ApiProperty({ format: 'date-time', nullable: true, description: 'La última vez que Monkey leyó este servidor con éxito (la «última revisión»). Nulo mientras no se ha conectado.' }) last_sync_at!: string | null;
}

export class AgentInstallOutboundResponse {
  @ApiProperty({ example: 'sonda.monkey.example', description: 'A dónde se conecta el servidor del cliente.' }) host!: string;
  @ApiProperty({ example: 1514, description: 'El puerto, de SALIDA: el servidor del cliente se conecta a Monkey; no hace falta abrir puertos de entrada.' }) port!: number;
}

export class AgentInstallConnectionResponse {
  @ApiProperty({ enum: ['pending', 'connected', 'disconnected', 'removed'], enumName: 'AssetAgentStatus', description: 'Lo último que Monkey vio del servidor.' }) status!: string;
  @ApiProperty({ description: '`true` mientras Monkey busca solo al servidor (hasta 24 horas desde que se creó su agente; un servidor desconectado se sigue buscando). Si es `false` y el estado es `pending`, Monkey dejó de buscarlo: ofrecer «Comprobar ahora» o «Generar de nuevo».' }) watching!: boolean;
  @ApiProperty({ format: 'date-time', nullable: true, description: 'La última vez que Monkey leyó este servidor con éxito.' }) last_sync_at!: string | null;
}

export class AgentInstallStateResponse {
  @ApiProperty({ enum: ['not_started', 'preparing', 'ready', 'delivered', 'failed'], enumName: 'AgentInstallStatus', description: '`ready`: el comando se puede pedir (una vez, hasta `expires_at`) · `delivered`: ya se mostró o caducó · `failed`: ver `failure_message`.' }) status!: string;
  @ApiProperty({ nullable: true, description: 'Solo en `failed`: el motivo, ya traducido. Nunca el mensaje de la sonda.' }) failure_message!: string | null;
  @ApiProperty({ enum: ['linux', 'windows', 'macos', 'solaris', 'hp_ux'], example: 'linux', description: 'El sistema, de la versión que el cliente declaró: de él depende el comando.' }) os!: string;
  @ApiProperty({ type: AssetOsVersionResponse, description: 'La versión del sistema que el cliente declaró.' }) os_version!: AssetOsVersionResponse;
  @ApiProperty({ format: 'date-time', nullable: true, description: 'Solo en `ready`: hasta cuándo se puede pedir el comando.' }) expires_at!: string | null;
  @ApiProperty({ type: AgentInstallOutboundResponse, description: 'Lo que el firewall del cliente debe permitir de SALIDA. No hace falta abrir puertos de entrada.' }) requires_outbound!: AgentInstallOutboundResponse;
  @ApiProperty({ type: AgentInstallConnectionResponse, description: 'Cómo va la conexión del servidor con Monkey, una vez instalado.' }) connection!: AgentInstallConnectionResponse;
}

export class AgentInstallOptionResponse {
  @ApiProperty({ enum: ['command', 'file'], description: '`command`: se copia y se pega en una terminal · `file`: se descarga y se ejecuta.' }) kind!: string;
  @ApiProperty({ example: 'Terminal', description: 'Dónde se pega o con qué se ejecuta («Terminal», «PowerShell»).' }) label!: string;
  @ApiProperty({ required: false, enum: ['bash', 'powershell'], description: '`command`: dónde se pega.' }) shell?: string;
  @ApiProperty({ required: false, description: '`command`: el comando. **Sensible**: lleva la clave de este servidor.' }) value?: string;
  @ApiProperty({ required: false, example: 'instalar-monkey.ps1', description: '`file`: nombre con el que el navegador lo guarda.' }) filename?: string;
  @ApiProperty({ required: false, description: '`file`: el contenido del archivo. **Sensible**: lleva la clave de este servidor.' }) content?: string;
}

export class AgentInstallRevealResponse {
  @ApiProperty({ enum: ['linux', 'windows', 'macos', 'solaris', 'hp_ux'], example: 'linux', description: 'El sistema, de la versión que el cliente declaró.' }) os!: string;
  @ApiProperty({ type: AssetOsVersionResponse, description: 'La versión del sistema que el cliente declaró.' }) os_version!: AssetOsVersionResponse;
  @ApiProperty({ type: AgentInstallOptionResponse, isArray: true, description: 'Linux: un comando. Windows: un comando de PowerShell y un archivo. Se muestran UNA sola vez.' }) options!: AgentInstallOptionResponse[];
  @ApiProperty({ type: AgentInstallOutboundResponse }) requires_outbound!: AgentInstallOutboundResponse;
}

export class AssetResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'AST-0007', description: 'Código legible del activo.' }) code!: string;
  @ApiProperty({ example: 'srv-app-prod-01' }) name!: string;
  @ApiProperty({ enum: CONNECTION_CATEGORY_VALUES, enumName: 'ConnectionCategory' }) connection_category!: string;
  @ApiProperty({ enum: ASSET_TYPE, enumName: 'AssetType', description: 'Se deduce de la conexión elegida (D46).' }) type!: string;
  @ApiProperty({ example: 'aws', description: 'Plataforma elegida al conectar.' }) platform!: string;
  @ApiProperty({ nullable: true, example: '123456789012', description: 'Cuenta (o suscripción, o proyecto) a la que apunta la conexión. Solo activos de nube.' }) external_account_id!: string | null;
  @ApiProperty({ nullable: true, example: '10.20.3.14', description: 'Dirección IP, si aplica.' }) ip_address!: string | null;
  @ApiProperty({ nullable: true, example: 'Azure East US', description: 'Dónde está el activo.' }) location!: string | null;
  @ApiProperty({ enum: ASSET_CRITICALITY_VALUES, enumName: 'AssetCriticality' }) criticality!: string;
  @ApiProperty({ isArray: true, type: String, description: 'Etiquetas libres.' }) tags!: string[];
  @ApiProperty({ enum: ['declared', 'discovered'], enumName: 'AssetOrigin', description: '`declared` lo registró el cliente · `discovered` lo reconoció la evaluación en su cuenta.' }) origin!: string;
  @ApiProperty({ enum: ['active', 'inactive'], enumName: 'AssetStatus' }) status!: string;
  @ApiProperty({ enum: OPERATIONAL_STATUS, enumName: 'OperationalStatus' }) operational_status!: string;
  @ApiProperty({ example: '0/18', description: 'Cuántas de las 18 capacidades técnicas cubre hoy la evaluación en este activo.' }) technical_coverage!: string;
  @ApiProperty({ type: AssetServiceRefResponse, isArray: true, description: 'Servicios a los que da soporte.' }) services!: AssetServiceRefResponse[];
  @ApiProperty({ type: AssetProvisioningResponse }) provisioning!: AssetProvisioningResponse;
  @ApiProperty({ type: ConnectionSetupResponse, nullable: true, description: 'Instrucciones para completar la conexión, sin secretos. Las llaves nunca salen. `null` si no aplica.' }) connection_setup!: ConnectionSetupResponse | null;
  @ApiProperty({ type: AssetAgentResponse, nullable: true, description: 'Solo un servidor o equipo con agente (D113): su estado y la versión del sistema que el cliente declaró. `null` en los demás.' }) agent!: AssetAgentResponse | null;
}

export class AssetListProvisioningResponse {
  @ApiProperty({ enum: CONNECTION_METHOD_VALUES, enumName: 'ConnectionMethod', nullable: true }) connection_method!: string | null;
  @ApiProperty({ isArray: true, type: String, description: 'Regiones que se evalúan.' }) regions!: string[];
  @ApiProperty({ enum: PROVISIONING_STATUS, enumName: 'ProvisioningStatus' }) connection_status!: string;
  @ApiProperty() is_active!: boolean;
  @ApiProperty({ enum: SCHEDULE_FREQUENCY_VALUES, enumName: 'ScheduleFrequency', nullable: true }) schedule_frequency!: string | null;
}

export class AssetListItemResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'AST-0007' }) code!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: CONNECTION_CATEGORY_VALUES, enumName: 'ConnectionCategory' }) connection_category!: string;
  @ApiProperty({ enum: ASSET_TYPE, enumName: 'AssetType' }) type!: string;
  @ApiProperty({ enum: OPERATIONAL_STATUS, enumName: 'OperationalStatus' }) operational_status!: string;
  @ApiProperty({ example: '0/18', description: 'Capacidades técnicas cubiertas, como `n/18`.' }) technical_coverage!: string;
  @ApiProperty({ type: AssetServiceRefResponse, isArray: true, description: 'Servicios a los que da soporte.' }) services!: AssetServiceRefResponse[];
  @ApiProperty({ nullable: true, description: 'Cuenta (o suscripción, o proyecto) a la que apunta la conexión.' }) external_account_id!: string | null;
  @ApiProperty({ type: AssetListProvisioningResponse }) provisioning!: AssetListProvisioningResponse;
}

export class AssetValidationResponse {
  @ApiProperty({ enum: PROVISIONING_STATUS, enumName: 'ProvisioningStatus', description: '`validated` si conectó; `failed` si no.' }) connection_status!: string;
  @ApiProperty({ format: 'date-time', nullable: true }) last_validated_at!: string | null;
  @ApiProperty({ example: '4/18', description: 'Capacidades técnicas cubiertas tras la validación, como `n/18`.' }) technical_coverage!: string;
  @ApiProperty({ example: 4, description: 'Comprobaciones disponibles con esta conexión.' }) checks_available!: number;
  @ApiProperty({ enum: ['demo', 'live'], description: '`demo` es una simulación y se muestra como tal · `live` es una comprobación real contra la cuenta del cliente.' }) mode!: string;
  @ApiProperty({ enum: PROBE_MODE, enumName: 'ProbeMode' }) probe_mode!: string;
}

export class DiscoveredResourceResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'AST-0021' }) code!: string;
  @ApiProperty({ enum: RESOURCE_KIND_VALUES, enumName: 'ResourceKind', description: 'Qué clase de activo es, en lenguaje del cliente (no el tipo de recurso del proveedor).' }) kind!: string;
  @ApiProperty({ example: 'ec2_instance', description: 'Tipo de recurso tal como lo reconoció la evaluación.' }) type!: string;
  @ApiProperty({ nullable: true }) name!: string | null;
  @ApiProperty({ nullable: true, example: 'us-east-1', description: 'Región donde está el recurso.' }) region!: string | null;
  @ApiProperty({ example: 'aws', description: 'Plataforma o sistema donde corre.' }) platform!: string;
  @ApiProperty({ nullable: true, description: 'Dirección IP, si se pudo leer.' }) ip_address!: string | null;
  @ApiProperty({ nullable: true, description: 'Ubicación, si se pudo leer.' }) location!: string | null;
  @ApiProperty({ enum: ASSET_CRITICALITY_VALUES, enumName: 'AssetCriticality' }) criticality!: string;
  @ApiProperty({ isArray: true, type: String, description: 'Etiquetas que trae el recurso.' }) tags!: string[];
  @ApiProperty({ type: Object, description: 'Solo los atributos que se pudieron leer; lo que no, no está.' }) attributes!: Record<string, unknown>;
  @ApiProperty({ description: 'Si el recurso ya forma parte del servicio consultado (`service_id`).' }) in_service!: boolean;
}

export class ResourceKindCountResponse {
  @ApiProperty({ enum: RESOURCE_KIND_VALUES, enumName: 'ResourceKind' }) kind!: string;
  @ApiProperty({ example: 8, description: 'Cuántos activos de esa clase.' }) count!: number;
}

export class DiscoveredResourcesResponse {
  @ApiProperty({ format: 'date-time', nullable: true, description: 'Cuándo se hizo el último descubrimiento; `null` si aún no hay.' }) discovered_at!: string | null;
  @ApiProperty({ isArray: true, type: String, example: ['us-east-1'], description: 'Regiones donde se buscó.' }) regions!: string[];
  @ApiProperty({ isArray: true, type: String, description: 'Servicios de la nube que no se pudieron leer (por ejemplo, permiso denegado): el inventario está incompleto, no vacío.' }) incomplete_services!: string[];
  @ApiProperty({ type: ResourceKindCountResponse, isArray: true, description: 'Conteo por clase, sin filtrar.' }) summary!: ResourceKindCountResponse[];
  @ApiProperty({ example: 5, description: 'Cuántos ya están incluidos en el servicio consultado.' }) included_count!: number;
  @ApiProperty({ type: DiscoveredResourceResponse, isArray: true, description: 'Recursos de esta página.' }) items!: DiscoveredResourceResponse[];
  @ApiProperty({ example: 1, description: 'Página actual (desde 1).' }) page!: number;
  @ApiProperty({ example: 50, description: 'Elementos por página (máx. 100).' }) page_size!: number;
  @ApiProperty({ example: 12, description: 'Total de recursos que cumplen el filtro.' }) total!: number;
  @ApiProperty({ example: 1, description: 'Total de páginas.' }) total_pages!: number;
}

export class QueuedExecutionResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ['queued'], description: 'Estado inicial: `queued`.' }) status!: string;
  @ApiProperty({ enum: ['manual'], description: '`manual`: la pidió el cliente.' }) origin!: string;
  @ApiProperty({ nullable: true, example: null, description: 'Aún no empieza.' }) started_at!: string | null;
}

export class MicrosoftConsentStartResponse {
  @ApiProperty({ example: 'https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?client_id=…', description: 'La dirección de Microsoft a la que se manda el navegador del administrador.' }) authorize_url!: string;
}

export class ExecutionResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ['queued', 'running', 'completed', 'failed', 'cancelled'], enumName: 'ExecutionStatus' }) status!: string;
  @ApiProperty({ enum: ['scheduled', 'manual'], enumName: 'ExecutionOrigin', description: '`manual` la pidió el cliente («Evaluar ahora») · `scheduled` la lanzó la programación.' }) origin!: string;
  @ApiProperty({ format: 'date-time', nullable: true }) queued_at!: string | null;
  @ApiProperty({ format: 'date-time', nullable: true }) started_at!: string | null;
  @ApiProperty({ format: 'date-time', nullable: true }) finished_at!: string | null;
  @ApiProperty({ type: Number, nullable: true, example: 42, description: 'Avance real (0 a 99) de una evaluación en curso que lo informa; `null` si no lo informa o ya no está en curso.' }) progress_percent!: number | null;
  @ApiProperty({ type: Boolean, nullable: true, description: 'Solo en una evaluación completada de Microsoft 365: si de verdad se leyó el correo (D157). `null` en cualquier otro caso.' }) mail_reviewed!: boolean | null;
  @ApiProperty({ nullable: true, example: 'connection.role_not_found', description: 'Clave de por qué falló; nunca el texto del motor.' }) failure_reason!: string | null;
  @ApiProperty({ nullable: true, description: 'El mismo motivo ya traducido al idioma de la petición.' }) failure_message!: string | null;
}

export class ReadinessCoverageResponse {
  @ApiProperty({ example: 14, description: 'Comprobaciones que sí se midieron.' }) measured!: number;
  @ApiProperty({ example: 18, description: 'Comprobaciones que se esperaban.' }) expected!: number;
}

export class ReadinessOfMeasuredResponse {
  @ApiProperty({ example: 11, description: 'Comprobaciones medidas que cumplen.' }) compliant!: number;
  @ApiProperty({ example: 3, description: 'Comprobaciones medidas que no cumplen.' }) not_compliant!: number;
}

export class ReadinessAreaResponse {
  @ApiProperty({ enum: ['identity_access', 'data_network', 'logging_backup'], enumName: 'ReadinessArea', description: 'Agrupación de pruebas en lenguaje de negocio (propuesta de desarrollo, por ratificar con el comité).' }) area!: string;
  @ApiProperty({ enum: READINESS, enumName: 'Readiness' }) readiness!: string;
  @ApiProperty({ example: 2, description: 'Hallazgos abiertos del área.' }) open_findings!: number;
  @ApiProperty({ example: 0, description: 'Comprobaciones del área sin medir.' }) not_measured!: number;
}

export class AssetReadinessResponse {
  @ApiProperty({ format: 'uuid', description: 'Identificador (UUID) del activo.' }) asset_id!: string;
  @ApiProperty({ enum: READINESS, enumName: 'Readiness', description: '`ready` = todo lo medido cumple · `almost_ready` = solo fallos leves o algo sin medir · `needs_work` = hay un fallo alto o crítico · `not_measured` = aún no hay nada medido (un hueco de cobertura, no un fallo). Derivado, nunca almacenado.' }) readiness!: string;
  @ApiProperty({ format: 'date-time', nullable: true, description: 'Cuándo terminó la última evaluación completada.' }) measured_at!: string | null;
  @ApiProperty({ description: 'Si `true`, parte de lo medido se apoya en vínculos que el comité aún no ratificó.' }) includes_proposed_mappings!: boolean;
  @ApiProperty({ type: ReadinessCoverageResponse, description: 'Cobertura: cuánto se midió.' }) coverage!: ReadinessCoverageResponse;
  @ApiProperty({ type: ReadinessOfMeasuredResponse, description: 'Avance «de lo medido»: cuántas comprobaciones cumplen y cuántas no. Informa; no decide el cumplimiento.' }) of_measured!: ReadinessOfMeasuredResponse;
  @ApiProperty({ type: ReadinessAreaResponse, isArray: true, description: 'Preparación por área, en lenguaje de negocio.' }) areas!: ReadinessAreaResponse[];
  @ApiProperty({ example: 0, description: 'Cuántas comprobaciones necesitan revisión manual.' }) needs_manual_review!: number;
}

// D90 · Qué falló y cómo corregirlo.
export class FindingResourceResponse {
  @ApiProperty({ nullable: true, example: 'bucket-facturas', description: 'Nombre del recurso.' }) name!: string | null;
  @ApiProperty({ nullable: true, example: 'arn:aws:s3:::bucket-facturas', description: 'Identificador del recurso en la nube del cliente.' }) uid!: string | null;
  @ApiProperty({ nullable: true, example: 'us-east-1', description: 'Región donde está el recurso.' }) region!: string | null;
}

export class FindingRemediationResponse {
  @ApiProperty({ description: 'Cómo corregirlo, en texto plano.' }) text!: string;
  @ApiProperty({ enum: ['es', 'en'], enumName: 'FindingLanguage', description: '`es` si hay traducción de Monkey; `en` si se muestra el original por no tenerla.' }) language!: string;
  @ApiProperty({ description: 'La traducción la hizo una IA y nadie la ha revisado: la pantalla debe decirlo.' }) is_ai_generated!: boolean;
}

export class FindingResponse {
  @ApiProperty({ format: 'uuid', description: 'Identifica la comprobación dentro del catálogo de Monkey.' }) id!: string;
  @ApiProperty({ example: 'El almacenamiento permite acceso público', description: 'Qué no se cumple, en el idioma de la petición.' }) title!: string;
  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low', 'informational'], enumName: 'FindingSeverity', nullable: true, description: 'Nulo cuando quien midió no califica sus checks (los servidores): no se inventa un nivel.' }) severity!: string | null;
  @ApiProperty({ type: [FindingResourceResponse], description: 'Hasta 50 recursos afectados.' }) resources!: FindingResourceResponse[];
  @ApiProperty({ example: 3, description: 'Cuántos recursos están afectados en total (puede ser más de los que se listan).' }) resources_total!: number;
  @ApiProperty({ type: FindingRemediationResponse, nullable: true, description: 'Null si la comprobación no trae una guía que se pueda mostrar.' }) remediation!: FindingRemediationResponse | null;
}