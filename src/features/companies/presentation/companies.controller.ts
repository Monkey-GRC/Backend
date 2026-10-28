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
import { ArchiveCompanyDto, ReactivateCompanyDto } from '../application/dtos/archive-company.dto';
import { CreateCompanyDto } from '../application/dtos/create-company.dto';
import { ListCompaniesQuery } from '../application/dtos/list-companies.query';
import { ArchiveCompanyUseCase } from '../application/use-cases/archive-company.use-case';
import { GetCompanyUseCase } from '../application/use-cases/get-company.use-case';
import { ListCompaniesUseCase } from '../application/use-cases/list-companies.use-case';
import { ListPendingPurgeUseCase } from '../application/use-cases/list-pending-purge.use-case';
import { ReactivateCompanyUseCase } from '../application/use-cases/reactivate-company.use-case';
import { RegisterCompanyUseCase } from '../application/use-cases/register-company.use-case';
import {
  toCompanyDetail,
  toCompanyListItem,
  toRegisteredCompanyResponse,
} from './company-response.mapper';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiItems, ApiPaged } from '../../../common/swagger/api-envelope';
import { CompanyDetailResponse, CompanyListItemResponse, PendingPurgeCompanyResponse, RegisteredCompanyResponse } from './company.responses';

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
    private readonly archiveCompany: ArchiveCompanyUseCase,
    private readonly reactivateCompany: ReactivateCompanyUseCase,
    private readonly listPendingPurge: ListPendingPurgeUseCase,
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

  // Va antes que `:id`: «pending-purge» no es un UUID.
  @ApiOperation({ summary: 'Empresas archivadas y cuándo se borran', description: 'D95. Las empresas archivadas, de la que se borra antes a la que se borra después, con los días que faltan. Es lo que Monkey Admin muestra para saber cuáles están por vencer.' })
  @ApiItems(PendingPurgeCompanyResponse, 'Empresas archivadas.')
  @Get('pending-purge')
  async pendingPurge(@CurrentUser() principal: Principal) {
    const now = Date.now();
    const items = (await this.listPendingPurge.execute(principal)).map((c) => ({
      id: c.id,
      name: c.name,
      archive_until: c.archiveUntil.toISOString(),
      days_left: Math.max(0, Math.ceil((c.archiveUntil.getTime() - now) / 86_400_000)),
      deactivation_reason_code: c.reasonCode,
    }));
    return new ResponseDto(HttpStatus.OK, t('company.pending_purge'), { items });
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

  @ApiOperation({
    summary: 'Archivar una empresa',
    description: 'D95. Corta el acceso de todos sus usuarios, detiene las evaluaciones y fija cuándo se borra todo (`retention_days`, 180 por defecto). Los datos se conservan hasta entonces y se toma una copia cifrada. Pide la razón social exacta, un motivo y el código TOTP **de quien archiva**. Reversible con `reactivation` dentro del plazo.',
  })
  @ApiData(CompanyDetailResponse, 'Empresa archivada.')
  @ApiDomainErrors('CONFIRMATION_MISMATCH', 'COMPANY_ALREADY_DEACTIVATED', 'MFA_CODE_INVALID', 'ACCOUNT_LOCKED')
  @Post(':id/deactivation')
  @HttpCode(HttpStatus.OK)
  async deactivate(
    @CurrentUser() principal: Principal,
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND })) id: string,
    @Body() dto: ArchiveCompanyDto,
    @Req() req: Request,
  ) {
    const detail = await this.archiveCompany.execute(
      principal,
      id,
      { confirmName: dto.confirm_name, reasonCode: dto.reason_code, reason: dto.reason, retentionDays: dto.retention_days, totpCode: dto.totp_code },
      { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' },
    );
    return new ResponseDto(HttpStatus.OK, t('company.deactivated'), toCompanyDetail(detail));
  }

  @ApiOperation({
    summary: 'Reactivar una empresa archivada',
    description: 'D95. Solo dentro del plazo. La empresa vuelve a `active` y el plazo desaparece; sus usuarios deben iniciar sesión de nuevo. Pide un motivo y el código TOTP de quien reactiva.',
  })
  @ApiData(CompanyDetailResponse, 'Empresa reactivada.')
  @ApiDomainErrors('COMPANY_NOT_DEACTIVATED', 'COMPANY_ARCHIVE_EXPIRED', 'MFA_CODE_INVALID', 'ACCOUNT_LOCKED')
  @Post(':id/reactivation')
  @HttpCode(HttpStatus.OK)
  async reactivate(
    @CurrentUser() principal: Principal,
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND })) id: string,
    @Body() dto: ReactivateCompanyDto,
    @Req() req: Request,
  ) {
    const detail = await this.reactivateCompany.execute(
      principal,
      id,
      { reason: dto.reason, totpCode: dto.totp_code },
      { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' },
    );
    return new ResponseDto(HttpStatus.OK, t('company.reactivated'), toCompanyDetail(detail));
  }
}
