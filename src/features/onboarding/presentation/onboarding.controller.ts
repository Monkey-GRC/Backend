import { Body, Controller, Get, HttpCode, HttpStatus, Put, Req } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { SaveOrganizationalContextDto } from '../application/dtos/save-organizational-context.dto';
import { GetOrganizationalContextUseCase } from '../application/use-cases/get-organizational-context.use-case';
import { SaveOrganizationalContextUseCase } from '../application/use-cases/save-organizational-context.use-case';
import { toOrganizationalContextResponse } from './organizational-context-response.mapper';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;

// Componente 1 del onboarding. Solo el admin_empresa declara el contexto de su empresa.
@ApiTags('onboarding')
@ApiCookieAuth()
@Roles('admin_empresa')
@Controller('onboarding/organizational-context')
export class OnboardingController {
  constructor(
    private readonly getContext: GetOrganizationalContextUseCase,
    private readonly saveContext: SaveOrganizationalContextUseCase,
  ) {}

  @Get()
  async get(@CurrentUser() principal: Principal) {
    const ctx = await this.getContext.execute(principal);
    return new ResponseDto(HttpStatus.OK, t('organizational_context.get'), toOrganizationalContextResponse(ctx));
  }

  // Crea la organización la primera vez y la actualiza las siguientes (mismo endpoint, idempotente).
  @Put()
  @HttpCode(HttpStatus.OK)
  async save(
    @CurrentUser() principal: Principal,
    @Body() dto: SaveOrganizationalContextDto,
    @Req() req: Request,
  ) {
    const ctx = await this.saveContext.execute(
      principal,
      {
        description: dto.description,
        size: dto.size,
        industry: dto.industry,
        businessModel: dto.business_model,
        yearsInOperation: dto.years_in_operation ?? null,
        incorporationCountries: dto.incorporation_countries,
        clientCountries: dto.client_countries,
        complianceMaturity: dto.compliance_maturity,
        regulationCodes: dto.regulation_codes,
      },
      { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' },
    );
    return new ResponseDto(HttpStatus.OK, t('organizational_context.saved'), toOrganizationalContextResponse(ctx));
  }
}
