import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
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
import { toPageResponse } from '../../../common/pagination/page';
import { CreateCompanyDto } from '../application/dtos/create-company.dto';
import { ListCompaniesQuery } from '../application/dtos/list-companies.query';
import { GetCompanyUseCase } from '../application/use-cases/get-company.use-case';
import { ListCompaniesUseCase } from '../application/use-cases/list-companies.use-case';
import { RegisterCompanyUseCase } from '../application/use-cases/register-company.use-case';
import {
  toCompanyDetail,
  toCompanyListItem,
  toRegisteredCompanyResponse,
} from './company-response.mapper';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;

// contracts/modules/monkey-admin.md — todo el módulo es exclusivo de admin_monkey.
@ApiTags('companies')
@ApiCookieAuth()
@Roles('admin_monkey')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly registerCompany: RegisterCompanyUseCase,
    private readonly listCompanies: ListCompaniesUseCase,
    private readonly getCompany: GetCompanyUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() principal: Principal,
    @Body() dto: CreateCompanyDto,
    @Req() req: Request,
  ) {
    const result = await this.registerCompany.execute(
      principal,
      {
        name: dto.name,
        requiresDedicatedDatabase: dto.requires_dedicated_database,
        adminEmail: dto.admin_email,
      },
      { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' },
    );
    return new ResponseDto(
      HttpStatus.CREATED,
      t('company.created'),
      toRegisteredCompanyResponse(result),
    );
  }

  @Get()
  async list(@CurrentUser() principal: Principal, @Query() query: ListCompaniesQuery) {
    const page = await this.listCompanies.execute(principal, {
      page: query.page,
      pageSize: query.page_size,
      sort: query.sort,
      status: query.status,
    });
    return new ResponseDto(HttpStatus.OK, t('company.list'), toPageResponse(page, (item) => toCompanyListItem(item)));
  }

  @Get(':id')
  async detail(
    @CurrentUser() principal: Principal,
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND })) id: string,
  ) {
    const detail = await this.getCompany.execute(principal, id);
    return new ResponseDto(HttpStatus.OK, t('company.detail'), toCompanyDetail(detail));
  }
}
