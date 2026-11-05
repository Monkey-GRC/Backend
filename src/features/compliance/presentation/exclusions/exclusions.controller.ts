import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../../common/auth/principal';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../../common/dtos/response.dto';
import { RequestMeta } from '../../../../common/http/request-meta';
import { toPageResponse } from '../../../../common/pagination/page';
import { ListExclusionsQuery, RequestExclusionDto } from '../../application/exclusions/exclusion.dto';
import { ListExclusionsUseCase, RequestExclusionUseCase } from '../../application/exclusions/exclusion.use-cases';
import { toExclusion } from './exclusion-response.mapper';
import { API_TAGS } from '../../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiPaged } from '../../../../common/swagger/api-envelope';
import { ExclusionResponse } from './exclusion.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });

// Exclusiones de un servicio (contracts/modules/compliance-audit.md, MD-144, D78). Las ven el administrador y el auditor; la crea y la decide solo el administrador
// en un solo acto (D96): nace aprobada. El `responsable` y `admin_monkey` no entran.
@ApiTags(API_TAGS.exclusions)
@Roles('admin_empresa', 'auditor')
@Controller()
export class ExclusionsController {
  constructor(private readonly list: ListExclusionsUseCase, private readonly request: RequestExclusionUseCase) {}

  @ApiOperation({ summary: 'Listar las exclusiones de un servicio', description: 'Las exclusiones (de una prueba sobre un activo) con filtros por estado, prueba, activo y vigencia. Las ven el administrador de la empresa y el auditor.' })
  @ApiPaged(ExclusionResponse, 'Página de exclusiones.')
  @Get('services/:serviceId/exclusions')
  async exclusions(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Query() q: ListExclusionsQuery) {
    const page = await this.list.execute(p, serviceId, { status: q.status, testId: q.test_id, assetId: q.asset_id, expired: q.expired, page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('exclusion.list'), toPageResponse(page, (v) => toExclusion(v, t)));
  }

  @ApiOperation({ summary: 'Crear una exclusión', description: 'Solo `admin_empresa` (D96). Excluye una prueba para un activo con su justificación, y la decide en el mismo acto: nace `approved` y el activo deja de medirse en esa prueba; si la prueba es automática se exige además el sustento técnico (la evaluación automática no se sobrescribe sin él). La vigencia la fija el período del servicio. Deja evento de cumplimiento y registro de auditoría.' })
  @ApiData(ExclusionResponse, 'Exclusión creada y aprobada.', { status: 201 })
  @ApiDomainErrors('EXCLUSION_ALREADY_EXISTS', 'EVALUATION_NOT_DEFINED')
  @Post('services/:serviceId/exclusions')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async newExclusion(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Body() dto: RequestExclusionDto, @Req() req: Request) {
    const created = await this.request.execute(p, serviceId, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('exclusion.created'), toExclusion(created, t));
  }

}
