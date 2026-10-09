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
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
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
import { toAssetListItem, toAssetResponse } from './technical-control-response.mapper';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// Componente 3, parte de los activos: registrar y conectar → validar → activar → programar.
// Solo admin_empresa. Las credenciales entran en el POST y no vuelven a salir.
@ApiTags('assets')
@ApiCookieAuth()
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
  ) {}

  // La identidad de Monkey que asume el rol del cliente. Configuración, no secreto; sin ella el cliente no sabe a quién dar confianza.
  private principalArn(): string | null {
    return this.config.get<string>('MONKEY_AWS_PRINCIPAL_ARN')?.trim() || null;
  }

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
    return new ResponseDto(HttpStatus.CREATED, t('asset.created'), toAssetResponse(asset, this.principalArn(), t));
  }

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

  @Get(':id')
  async detail(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string) {
    return new ResponseDto(HttpStatus.OK, t('asset.detail'), toAssetResponse(await this.getAsset.execute(principal, id), this.principalArn(), t));
  }

  // Los activos que la conexión reconoció dentro de la cuenta, en las regiones declaradas (D59).
  @Get(':id/resources')
  async resources(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Query() query: ListResourcesQuery) {
    const listing = await this.listResources.execute(principal, id, { kind: query.kind }, { page: query.page, pageSize: query.page_size });
    return new ResponseDto(HttpStatus.OK, t('asset.resources'), {
      discovered_at: listing.discoveredAt?.toISOString() ?? null,
      regions: listing.regions,
      incomplete_services: listing.incompleteServices,
      summary: listing.summary.map((s) => ({ kind: s.kind, count: s.count })),
      ...toPageResponse(
        { items: listing.items, total: listing.total, page: query.page, pageSize: query.page_size },
        (r) => ({ id: r.id, kind: r.kind, type: r.type, name: r.name, region: r.region, attributes: r.attributes }),
      ),
    });
  }

  // Editar un sistema. Lo que cambia la conexión (cuenta, regiones, rol, llaves) la devuelve a «pendiente».
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
    return new ResponseDto(HttpStatus.OK, t('asset.updated'), toAssetResponse(asset, this.principalArn(), t));
  }

  // Dar de baja: el sistema deja de listarse y de evaluarse; su historial se conserva.
  @Delete(':id')
  async remove(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    await this.retireAsset.execute(principal, id, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('asset.removed'), null);
  }

  // El cliente entrega el rol que creó en su cuenta con la plantilla. La conexión vuelve a «pendiente»: hay que comprobarla de nuevo.
  @Patch(':id/connection')
  async connection(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Body() dto: SetConnectionDto, @Req() req: Request) {
    const asset = await this.setConnection.execute(principal, id, dto.role_arn, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('asset.connection_set'), toAssetResponse(asset, this.principalArn(), t));
  }

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

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    const asset = await this.activateAsset.execute(principal, id, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('asset.activated'), toAssetResponse(asset, this.principalArn(), t));
  }

  @Put(':id/schedule')
  @HttpCode(HttpStatus.OK)
  async schedule(
    @CurrentUser() principal: Principal,
    @Param('id', idPipe) id: string,
    @Body() dto: ScheduleDto,
    @Req() req: Request,
  ) {
    const asset = await this.scheduleAsset.execute(principal, id, dto.frequency, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('asset.scheduled'), toAssetResponse(asset, this.principalArn(), t));
  }
}
