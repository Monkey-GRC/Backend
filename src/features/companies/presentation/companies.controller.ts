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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { DEFAULT_CONTRACTED_FRAMEWORKS } from '../../../common/catalogs/service-catalogs';
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
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiPaged } from '../../../common/swagger/api-envelope';
import { CompanyDetailResponse, CompanyListItemResponse, RegisteredCompanyResponse } from './company.responses';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;

// contracts/modules/monkey-admin.md — todo el módulo es exclusivo de admin_monkey.
@ApiTags(API_TAGS.companies)
@Roles('admin_monkey')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly registerCompany: RegisterCompanyUseCase,
    private readonly listCompanies: ListCompaniesUseCase,
    private readonly getCompany: GetCompanyUseCase,
  ) {}

  @ApiOperation({ summary: 'Registrar una empresa cliente', description: 'Crea la empresa con su estrategia de aislamiento, le contrata los marcos indicados (por defecto SOC 2) y genera la clave de acceso de su primer administrador. **El código de la clave viaja en claro solo en esta respuesta**; hay que entregarlo al cliente. Queda registro de auditoría.' })
  @ApiData(RegisteredCompanyResponse, 'Empresa registrada, con su clave de acceso en claro (única vez).', { status: 201 })
  @ApiDomainErrors('COMPANY_NAME_TAKEN', 'ADMIN_EMAIL_TAKEN', 'FRAMEWORK_NOT_AVAILABLE', 'DEDICATED_DATABASE_NOT_AVAILABLE')
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
        frameworkCodes: dto.framework_codes ?? [...DEFAULT_CONTRACTED_FRAMEWORKS],
      },
      { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' },
    );
    return new ResponseDto(
      HttpStatus.CREATED,
      t('company.created'),
      toRegisteredCompanyResponse(result),
    );
  }

  @ApiOperation({ summary: 'Listar empresas', description: 'Empresas clientes con su estado, marcos contratados y el estado de su clave de acceso. Nunca incluye el código de la clave.' })
  @ApiPaged(CompanyListItemResponse, 'Página de empresas.')
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

  @ApiOperation({ summary: 'Detalle de una empresa', description: 'La empresa con su historial de claves de acceso (estado y fechas, nunca el código).' })
  @ApiData(CompanyDetailResponse, 'Detalle de la empresa.')
  @Get(':id')
  async detail(
    @CurrentUser() principal: Principal,
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND })) id: string,
  ) {
    const detail = await this.getCompany.execute(principal, id);
    return new ResponseDto(HttpStatus.OK, t('company.detail'), toCompanyDetail(detail));
  }
}
