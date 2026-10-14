import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import { CreateResponsibleDto, ListResponsiblesQuery, UpdateResponsibleDto } from '../application/dtos/responsible.dto';
import { CreateResponsibleUseCase, DeleteResponsibleUseCase, ListResponsiblesUseCase, UpdateResponsibleUseCase } from '../application/use-cases/responsible.use-cases';
import { Responsible } from '../domain/repositories/responsible.repository';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });
const toResponse = (r: Responsible) => ({ id: r.id, type: r.type, person_name: r.personName, is_in_use: r.isInUse });

// Cargos responsables de la organización (contracts/modules/compliance-responsibles.md, MD-133). Los ven todos los roles de la empresa; los gestiona
// solo el administrador. `admin_monkey` no entra al cumplimiento de una empresa por aquí.
@ApiTags('compliance')
@ApiCookieAuth()
@Controller('responsibles')
export class ResponsiblesController {
  constructor(
    private readonly listResponsibles: ListResponsiblesUseCase,
    private readonly createResponsible: CreateResponsibleUseCase,
    private readonly updateResponsible: UpdateResponsibleUseCase,
    private readonly deleteResponsible: DeleteResponsibleUseCase,
  ) {}

  @Get()
  @Roles('admin_empresa', 'funcional', 'consultor', 'auditor')
  async list(@CurrentUser() principal: Principal, @Query() q: ListResponsiblesQuery) {
    const page = await this.listResponsibles.execute(principal, { type: q.type, page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('responsible.list'), toPageResponse(page, toResponse));
  }

  @Post()
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() principal: Principal, @Body() dto: CreateResponsibleDto, @Req() req: Request) {
    const created = await this.createResponsible.execute(principal, { type: dto.type, personName: dto.person_name }, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('responsible.created'), toResponse(created));
  }

  @Patch(':id')
  @Roles('admin_empresa')
  async update(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Body() dto: UpdateResponsibleDto, @Req() req: Request) {
    const updated = await this.updateResponsible.execute(principal, id, dto.person_name, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('responsible.updated'), toResponse(updated));
  }

  @Delete(':id')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    await this.deleteResponsible.execute(principal, id, metaOf(req));
  }
}
