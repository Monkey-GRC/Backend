import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import { CreateAssetDto, ListAssetsQuery, ScheduleDto } from '../application/dtos/technical-control.dtos';
import {
  ActivateAssetUseCase,
  CreateAssetUseCase,
  GetAssetUseCase,
  ListAssetsUseCase,
  ScheduleAssetUseCase,
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
    private readonly probe: ConnectionProbe,
  ) {}

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
      },
      metaOf(req),
    );
    return new ResponseDto(HttpStatus.CREATED, t('asset.created'), toAssetResponse(asset));
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
    return new ResponseDto(HttpStatus.OK, t('asset.detail'), toAssetResponse(await this.getAsset.execute(principal, id)));
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
      // «demo» mientras la sonda sea la simulada: la pantalla lo muestra con claridad.
      mode: this.probe.mode === 'simulated' ? 'demo' : 'live',
    });
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    const asset = await this.activateAsset.execute(principal, id, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('asset.activated'), toAssetResponse(asset));
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
    return new ResponseDto(HttpStatus.OK, t('asset.scheduled'), toAssetResponse(asset));
  }
}
