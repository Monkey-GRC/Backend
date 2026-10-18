import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import { DecideExclusionDto, ListExclusionsQuery, RequestExclusionDto } from '../application/dtos/exclusion.dto';
import { DecideExclusionUseCase, ListExclusionsUseCase, RequestExclusionUseCase } from '../application/use-cases/exclusion.use-cases';
import { toExclusion } from './exclusion-response.mapper';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiPaged } from '../../../common/swagger/api-envelope';
import { ExclusionResponse } from './exclusion.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });

// Exclusiones de un servicio (contracts/modules/compliance-audit.md, MD-144, D78). Las ven el administrador, el consultor y el auditor; la propone solo el administrador
// y la decide solo el consultor. El `funcional` y `admin_monkey` no entran.
@ApiTags(API_TAGS.exclusions)
@Roles('admin_empresa', 'consultor', 'auditor')
@Controller()
export class ExclusionsController {
  constructor(private readonly list: ListExclusionsUseCase, private readonly request: RequestExclusionUseCase, private readonly decide: DecideExclusionUseCase) {}

  @ApiOperation({ summary: 'Listar las exclusiones de un servicio', description: 'Las exclusiones (de una prueba sobre un activo) con filtros por estado, prueba, activo y vigencia. Las ven el administrador de la empresa, el consultor y el auditor.' })
  @ApiPaged(ExclusionResponse, 'Página de exclusiones.')
  @Get('services/:serviceId/exclusions')
  async exclusions(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Query() q: ListExclusionsQuery) {
    const page = await this.list.execute(p, serviceId, { status: q.status, testId: q.test_id, assetId: q.asset_id, expired: q.expired, page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('exclusion.list'), toPageResponse(page, (v) => toExclusion(v, t)));
  }

  @ApiOperation({ summary: 'Pedir una exclusión', description: 'Solo `admin_empresa`. Pide excluir una prueba para un activo con su justificación; si la prueba es automática se exige además el sustento técnico (la evaluación automática no se sobrescribe sin él). La vigencia la fija el período del servicio. Nace `pending`. Queda registro de auditoría.' })
  @ApiData(ExclusionResponse, 'Exclusión pedida.', { status: 201 })
  @ApiDomainErrors('EXCLUSION_ALREADY_EXISTS', 'EVALUATION_NOT_DEFINED')
  @Post('services/:serviceId/exclusions')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async newExclusion(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Body() dto: RequestExclusionDto, @Req() req: Request) {
    const created = await this.request.execute(p, serviceId, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('exclusion.requested'), toExclusion(created, t));
  }

  @ApiOperation({ summary: 'Decidir una exclusión', description: 'Solo `consultor`. Aprueba o rechaza una exclusión pendiente; al rechazar, la nota es obligatoria. Queda registro de auditoría.' })
  @ApiData(ExclusionResponse, 'Exclusión decidida.')
  @ApiDomainErrors('ALREADY_DECIDED')
  @Patch('exclusions/:id')
  @Roles('consultor')
  async decideExclusion(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: DecideExclusionDto, @Req() req: Request) {
    const decided = await this.decide.execute(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('exclusion.decided'), toExclusion(decided, t));
  }
}
