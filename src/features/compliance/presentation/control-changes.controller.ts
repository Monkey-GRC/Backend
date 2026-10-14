import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import { ListChangesQuery, ProposeChangeDto } from '../application/dtos/control-change.dto';
import { ListChangesUseCase } from '../application/use-cases/list-changes.use-case';
import { ProposeChangeUseCase } from '../application/use-cases/propose-change.use-case';
import { toControlChange } from './control-response.mapper';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// Propuestas de cambio de una acción de protección (contracts/modules/compliance-controls.md, MD-118). Proponen `admin_empresa` y `funcional` (solo lo suyo);
// el consultor decide en otro ticket (MD-156). El consultor y el auditor solo leen.
@ApiTags('compliance')
@ApiCookieAuth()
@Controller('controls/:id/changes')
export class ControlChangesController {
  constructor(
    private readonly proposeChange: ProposeChangeUseCase,
    private readonly listChanges: ListChangesUseCase,
  ) {}

  @Post()
  @Roles('admin_empresa', 'funcional')
  @HttpCode(HttpStatus.CREATED)
  async propose(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Body() dto: ProposeChangeDto, @Req() req: Request) {
    const meta: RequestMeta = { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' };
    const change = await this.proposeChange.execute(principal, id, dto, meta);
    return new ResponseDto(HttpStatus.CREATED, t('control_change.requested'), toControlChange(change));
  }

  @Get()
  @Roles('admin_empresa', 'funcional', 'consultor', 'auditor')
  async list(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Query() q: ListChangesQuery) {
    const page = await this.listChanges.execute(principal, id, { status: q.status, page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('control_change.list'), toPageResponse(page, toControlChange));
  }
}
