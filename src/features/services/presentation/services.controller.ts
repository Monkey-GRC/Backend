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
import { CreateServiceDto } from '../application/dtos/create-service.dto';
import { ListServicesQuery } from '../application/dtos/list-services.query';
import { SetSystemDescriptionDto } from '../application/dtos/system-description.dto';
import { UpdateServiceDto } from '../application/dtos/update-service.dto';
import { CreateServiceUseCase } from '../application/use-cases/create-service.use-case';
import { DeleteServiceUseCase } from '../application/use-cases/delete-service.use-case';
import { GetServiceUseCase } from '../application/use-cases/get-service.use-case';
import { ListServicesUseCase } from '../application/use-cases/list-services.use-case';
import { SetSystemDescriptionUseCase } from '../application/use-cases/set-system-description.use-case';
import { UpdateServiceUseCase } from '../application/use-cases/update-service.use-case';
import { ServiceInput, ServicePatch } from '../domain/entities/service.entity';
import { toServiceListItem, toServiceResponse } from './service-response.mapper';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;

const metaOf = (req: Request): RequestMeta => ({
  ipAddress: req.ip ?? '',
  userAgent: req.get('user-agent') ?? '',
});

// 404 también cuando el id no es un UUID: no hay nada que encontrar.
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

const toInput = (dto: CreateServiceDto): ServiceInput => ({
  name: dto.name,
  description: dto.description,
  scopeStatement: dto.scope_statement,
  type: dto.type,
  industriesServed: dto.industries_served,
  activeClientCount: dto.active_client_count ?? null,
  countries: dto.countries,
  dataTypes: dto.data_types,
  trustCriteria: dto.trust_criteria,
  subserviceOrganizations: dto.subservice_organizations.map((s) => ({
    type: s.type,
    provider: s.provider ?? null,
    serviceProvided: s.service_provided ?? null,
    responsibility: s.responsibility ?? null,
  })),
  frameworkCodes: dto.framework_codes,
  regulationCodes: dto.regulation_codes,
  previousCertification: dto.previous_certification ?? null,
  expectedAvailability: dto.expected_availability,
  systemDescription: { kind: 'link', url: dto.system_description.url },
});

// Solo las claves presentes: `null` en un opcional es "bórralo", ausente es "no lo toques".
const toPatch = (dto: UpdateServiceDto): ServicePatch => {
  const patch: ServicePatch = {};
  if (dto.name !== undefined) patch.name = dto.name;
  if (dto.description !== undefined) patch.description = dto.description;
  if (dto.scope_statement !== undefined) patch.scopeStatement = dto.scope_statement;
  if (dto.type !== undefined) patch.type = dto.type;
  if (dto.industries_served !== undefined) patch.industriesServed = dto.industries_served;
  if (dto.active_client_count !== undefined) patch.activeClientCount = dto.active_client_count;
  if (dto.countries !== undefined) patch.countries = dto.countries;
  if (dto.data_types !== undefined) patch.dataTypes = dto.data_types;
  if (dto.trust_criteria !== undefined) patch.trustCriteria = dto.trust_criteria;
  if (dto.subservice_organizations !== undefined) {
    patch.subserviceOrganizations = dto.subservice_organizations.map((s) => ({
      type: s.type,
      provider: s.provider ?? null,
      serviceProvided: s.service_provided ?? null,
      responsibility: s.responsibility ?? null,
    }));
  }
  if (dto.framework_codes !== undefined) patch.frameworkCodes = dto.framework_codes;
  if (dto.regulation_codes !== undefined) patch.regulationCodes = dto.regulation_codes;
  if (dto.previous_certification !== undefined) patch.previousCertification = dto.previous_certification;
  if (dto.expected_availability !== undefined) patch.expectedAvailability = dto.expected_availability;
  if (dto.system_description !== undefined) {
    patch.systemDescription = { kind: 'link', url: dto.system_description.url };
  }
  return patch;
};

// Componente 2 del onboarding (contracts/modules/onboarding-service-context.md).
// Solo el admin_empresa declara los servicios de su empresa.
@ApiTags('services')
@ApiCookieAuth()
@Roles('admin_empresa')
@Controller('services')
export class ServicesController {
  constructor(
    private readonly createService: CreateServiceUseCase,
    private readonly listServices: ListServicesUseCase,
    private readonly getService: GetServiceUseCase,
    private readonly updateService: UpdateServiceUseCase,
    private readonly deleteService: DeleteServiceUseCase,
    private readonly setSystemDescription: SetSystemDescriptionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() principal: Principal,
    @Body() dto: CreateServiceDto,
    @Req() req: Request,
  ) {
    const service = await this.createService.execute(principal, toInput(dto), metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('service.created'), toServiceResponse(service));
  }

  @Get()
  async list(@CurrentUser() principal: Principal, @Query() query: ListServicesQuery) {
    const page = await this.listServices.execute(principal, {
      page: query.page,
      pageSize: query.page_size,
    });
    return new ResponseDto(HttpStatus.OK, t('service.list'), toPageResponse(page, toServiceListItem));
  }

  @Get(':id')
  async detail(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string) {
    const service = await this.getService.execute(principal, id);
    return new ResponseDto(HttpStatus.OK, t('service.detail'), toServiceResponse(service));
  }

  @Patch(':id')
  async update(
    @CurrentUser() principal: Principal,
    @Param('id', idPipe) id: string,
    @Body() dto: UpdateServiceDto,
    @Req() req: Request,
  ) {
    const service = await this.updateService.execute(principal, id, toPatch(dto), metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('service.updated'), toServiceResponse(service));
  }

  @Delete(':id')
  async remove(
    @CurrentUser() principal: Principal,
    @Param('id', idPipe) id: string,
    @Req() req: Request,
  ) {
    await this.deleteService.execute(principal, id, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('service.deleted'), null);
  }

  @Post(':id/system-description')
  @HttpCode(HttpStatus.OK)
  async saveSystemDescription(
    @CurrentUser() principal: Principal,
    @Param('id', idPipe) id: string,
    @Body() dto: SetSystemDescriptionDto,
    @Req() req: Request,
  ) {
    const service = await this.setSystemDescription.execute(
      principal,
      id,
      { kind: 'link', url: dto.url },
      metaOf(req),
    );
    return new ResponseDto(
      HttpStatus.OK,
      t('service.system_description_saved'),
      toServiceResponse(service),
    );
  }
}
