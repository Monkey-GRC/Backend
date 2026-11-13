import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import { ListResourcesQuery } from '../application/dtos/runner.dtos';
import { CreateAssetDto, ListAssetsQuery, ScheduleDto, SetConnectionDto, UpdateAssetDto } from '../application/dtos/technical-control.dtos';
import {
  ActivateAssetUseCase,
  CreateAssetUseCase,
  GetAssetUseCase,
  ListAssetResourcesUseCase,
  ListAssetsUseCase,
  RetireAssetUseCase,
  ScheduleAssetUseCase,
  SetAssetConnectionUseCase,
  UpdateAssetUseCase,
  ValidateAssetUseCase,
} from '../application/use-cases/asset.use-cases';
import { ConnectionProbe } from '../domain/ports/connection-probe';
import { ConnectionTemplates } from '../application/connection-templates';
import { GcpSetupCommand, toAssetListItem, toAssetResponse } from './technical-control-response.mapper';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiEmpty, ApiPaged } from '../../../common/swagger/api-envelope';
import { AssetListItemResponse, AssetResponse, AssetValidationResponse, DiscoveredResourcesResponse } from './technical-control.responses';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// Componente 3, parte de los activos: registrar y conectar → validar → activar → programar.
// Solo admin_empresa. Las credenciales entran en el POST y no vuelven a salir.
@ApiTags(API_TAGS.assets)
@Roles('admin_empresa')
@Controller('assets')
export class AssetsController {
  constructor(
    private readonly createAsset: CreateAssetUseCase,
    private readonly listAssets: ListAssetsUseCase,
    private readonly getAsset: GetAssetUseCase,
    private readonly validateAsset: ValidateAssetUseCase,
    private readonly activateAsset: ActivateAssetUseCase,
    private readonly scheduleAsset: ScheduleAssetUseCase,
    private readonly setConnection: SetAssetConnectionUseCase,
    private readonly updateAsset: UpdateAssetUseCase,
    private readonly retireAsset: RetireAssetUseCase,
    private readonly listResources: ListAssetResourcesUseCase,
    private readonly probe: ConnectionProbe,
    private readonly config: ConfigService,
    private readonly templates: ConnectionTemplates,
  ) {}

  // La identidad de Monkey que asume el rol del cliente. Configuración, no secreto; sin ella el cliente no sabe a quién dar confianza.
  private principalArn(): string | null {
    return this.config.get<string>('MONKEY_AWS_PRINCIPAL_ARN')?.trim() || null;
  }

  // El rol de AWS de Monkey que GCP acepta como identidad de origen (D112). Configuración, no secreto.
  private gcpSetupCommand(): GcpSetupCommand | null {
    const role = this.config.get<string>('MONKEY_GCP_FEDERATION_ROLE_ARN')?.trim();
    return role ? (projectId, externalId) => this.templates.gcpSetupCommand(role, projectId, externalId) : null;
  }

  @ApiOperation({ summary: 'Registrar y conectar un activo', description: 'Primer paso del flujo **conectar → validar → activar → programar**. El tipo del activo se deduce de la conexión elegida (D46). Con el canal de rol de solo lectura la respuesta trae `connection_setup`: el identificador externo y los pasos para crear el rol en la cuenta del cliente. Las credenciales (canal de llaves) solo entran aquí, se guardan cifradas y **nunca se devuelven**. Requiere el escenario de despliegue.' })
  @ApiData(AssetResponse, 'Activo registrado, con las instrucciones para completar la conexión.', { status: 201 })
  @ApiDomainErrors('CONNECTION_METHOD_NOT_APPLICABLE', 'ORGANIZATION_NOT_DECLARED')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() principal: Principal, @Body() dto: CreateAssetDto, @Req() req: Request) {
    const asset = await this.createAsset.execute(
      principal,
      {
        name: dto.name,
        connectionCategory: dto.connection_category,
        platform: dto.platform,
        ipAddress: dto.ip_address ?? null,
        location: dto.location ?? null,
        criticality: dto.criticality,
        tags: dto.tags,
        serviceIds: dto.service_ids,
        responsibleId: dto.responsible_id ?? null,
        credentials: dto.credentials,
        connectionMethod: dto.connection_method,
        externalAccountId: dto.external_account_id ?? null,
        regions: dto.regions,
      },
      metaOf(req),
    );
    return new ResponseDto(HttpStatus.CREATED, t('asset.created'), toAssetResponse(asset, this.principalArn(), t, this.gcpSetupCommand()));
  }

  @ApiOperation({ summary: 'Listar activos', description: 'Activos de la empresa, filtrables por servicio, categoría de conexión y estado operativo. No incluye los dados de baja.' })
  @ApiPaged(AssetListItemResponse, 'Página de activos.')
  @Get()
  async list(@CurrentUser() principal: Principal, @Query() query: ListAssetsQuery) {
    const page = await this.listAssets.execute(
      principal,
      {
        serviceId: query.service_id,
        connectionCategory: query.connection_category,
        operationalStatus: query.operational_status,
      },
      { page: query.page, pageSize: query.page_size },
    );
    return new ResponseDto(HttpStatus.OK, t('asset.list'), toPageResponse(page, toAssetListItem));
  }

  @ApiOperation({ summary: 'Detalle de un activo', description: 'El activo con su conexión y, si falta completarla, las instrucciones (`connection_setup`). Nunca incluye credenciales.' })
  @ApiData(AssetResponse, 'Detalle del activo.')
  @Get(':id')
  async detail(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string) {
    return new ResponseDto(HttpStatus.OK, t('asset.detail'), toAssetResponse(await this.getAsset.execute(principal, id), this.principalArn(), t, this.gcpSetupCommand()));
  }

  // Los activos que la conexión reconoció dentro de la cuenta, en las regiones declaradas (D59).
  @ApiOperation({ summary: 'Activos descubiertos por una conexión', description: 'Lo que la conexión reconoció dentro de la cuenta del cliente, en las regiones declaradas (D59), con un conteo por clase. Con `service_id` marca cuáles ya son de ese servicio.' })
  @ApiData(DiscoveredResourcesResponse, 'Inventario descubierto, paginado, con su resumen por clase.')
  @Get(':id/resources')
  async resources(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Query() query: ListResourcesQuery) {
    const listing = await this.listResources.execute(principal, id, { kind: query.kind, serviceId: query.service_id }, { page: query.page, pageSize: query.page_size });
    return new ResponseDto(HttpStatus.OK, t('asset.resources'), {
      discovered_at: listing.discoveredAt?.toISOString() ?? null,
      regions: listing.regions,
      incomplete_services: listing.incompleteServices,
      summary: listing.summary.map((s) => ({ kind: s.kind, count: s.count })),
      included_count: listing.includedCount,
      ...toPageResponse(
        { items: listing.items, total: listing.total, page: query.page, pageSize: query.page_size },
        (r) => ({
          id: r.id,
          code: r.code,
          kind: r.kind,
          type: r.type,
          name: r.name,
          region: r.region,
          platform: r.platform,
          ip_address: r.ipAddress,
          location: r.location,
          criticality: r.criticality,
          tags: r.tags,
          attributes: r.attributes,
          in_service: r.inService,
        }),
      ),
    });
  }

  // Editar un sistema. Lo que cambia la conexión (cuenta, regiones, rol, llaves) la devuelve a «pendiente».
  @ApiOperation({ summary: 'Editar un activo', description: 'Todo es opcional. Lo que cambia la conexión (cuenta, regiones, rol o llaves) la devuelve a `pending`: hay que validarla de nuevo. Una cuenta nueva genera un identificador externo nuevo. Queda registro de auditoría.' })
  @ApiData(AssetResponse, 'Activo actualizado.')
  @ApiDomainErrors('CONNECTION_METHOD_NOT_APPLICABLE')
  @Patch(':id')
  async update(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Body() dto: UpdateAssetDto, @Req() req: Request) {
    const asset = await this.updateAsset.execute(
      principal,
      id,
      {
        name: dto.name,
        criticality: dto.criticality,
        tags: dto.tags,
        externalAccountId: dto.external_account_id,
        regions: dto.regions,
        roleArn: dto.role_arn,
        credentials: dto.credentials,
      },
      metaOf(req),
    );
    return new ResponseDto(HttpStatus.OK, t('asset.updated'), toAssetResponse(asset, this.principalArn(), t, this.gcpSetupCommand()));
  }

  // Dar de baja: el sistema deja de listarse y de evaluarse; su historial se conserva.
  @ApiOperation({ summary: 'Dar de baja un activo', description: 'El activo deja de listarse y de evaluarse; su historial se conserva. Queda registro de auditoría.' })
  @ApiEmpty('Activo dado de baja. `data` es `null`.')
  @ApiDomainErrors('EXECUTION_IN_PROGRESS')
  @Delete(':id')
  async remove(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    await this.retireAsset.execute(principal, id, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('asset.removed'), null);
  }

  // El cliente entrega el rol que creó en su cuenta con la plantilla. La conexión vuelve a «pendiente»: hay que comprobarla de nuevo.
  @ApiOperation({ summary: 'Entregar el rol o el número de proyecto de la conexión', description: 'El cliente pega el `RoleArn` del rol que creó en su cuenta (`readonly_role`) o el número de proyecto que imprime el script de alta (`identity_federation`, GCP). Un campo del otro canal da `422 field.not_allowed`. La conexión vuelve a `pending`: hay que validarla de nuevo.' })
  @ApiData(AssetResponse, 'Activo con el rol registrado.')
  @ApiDomainErrors('CONNECTION_METHOD_NOT_APPLICABLE')
  @Patch(':id/connection')
  async connection(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Body() dto: SetConnectionDto, @Req() req: Request) {
    const asset = await this.setConnection.execute(principal, id, { roleArn: dto.role_arn, projectNumber: dto.project_number }, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('asset.connection_set'), toAssetResponse(asset, this.principalArn(), t, this.gcpSetupCommand()));
  }

  @ApiOperation({ summary: 'Validar la conexión', description: 'Comprueba que Monkey puede leer la cuenta del cliente. Deja la conexión en `validated` (o `failed`, con el motivo). En modo `demo` la comprobación es simulada y así se indica; en `live` es real. Con un descubrimiento exitoso se actualiza el inventario (D59).' })
  @ApiData(AssetValidationResponse, 'Resultado de la validación.')
  @ApiDomainErrors('EXECUTION_IN_PROGRESS', 'CONNECTION_METHOD_NOT_APPLICABLE', 'CONNECTION_UNAVAILABLE')
  @Post(':id/validate')
  @HttpCode(HttpStatus.OK)
  async validate(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    const { asset, checksAvailable } = await this.validateAsset.execute(principal, id, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('asset.validated'), {
      connection_status: asset.provisioning.connectionStatus,
      last_validated_at: asset.provisioning.lastValidatedAt?.toISOString() ?? null,
      technical_coverage: asset.technicalCoverage,
      checks_available: checksAvailable,
      // `simulated` es demostración y se muestra como tal; `runner` es una comprobación real hecha contra la cuenta del cliente (D58).
      mode: this.probe.mode === 'simulated' ? 'demo' : 'live',
      probe_mode: this.probe.mode,
    });
  }

  @ApiOperation({ summary: 'Activar la evaluación automática', description: 'Solo una conexión ya validada. Activarla permite programar y lanzar evaluaciones. Queda registro de auditoría.' })
  @ApiData(AssetResponse, 'Activo con la evaluación activada.')
  @ApiDomainErrors('ASSET_NOT_VALIDATED', 'ASSET_ALREADY_ACTIVE')
  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    const asset = await this.activateAsset.execute(principal, id, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('asset.activated'), toAssetResponse(asset, this.principalArn(), t, this.gcpSetupCommand()));
  }

  @ApiOperation({ summary: 'Programar la frecuencia de evaluación', description: 'Cada cuánto se evalúa el activo de forma automática. Solo un activo ya activado. Queda registro de auditoría.' })
  @ApiData(AssetResponse, 'Activo con la frecuencia programada.')
  @ApiDomainErrors('ASSET_NOT_ACTIVE', 'FREQUENCY_NOT_SUPPORTED')
  @Put(':id/schedule')
  @HttpCode(HttpStatus.OK)
  async schedule(
    @CurrentUser() principal: Principal,
    @Param('id', idPipe) id: string,
    @Body() dto: ScheduleDto,
    @Req() req: Request,
  ) {
    const asset = await this.scheduleAsset.execute(principal, id, dto.frequency, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('asset.scheduled'), toAssetResponse(asset, this.principalArn(), t, this.gcpSetupCommand()));
  }
}
