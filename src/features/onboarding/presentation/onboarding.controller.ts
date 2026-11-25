import { Body, Controller, Get, HttpCode, HttpStatus, Put, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Can } from '../../../common/authorization/can.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { SaveOrganizationalContextDto } from '../application/dtos/save-organizational-context.dto';
import { GetOrganizationalContextUseCase } from '../application/use-cases/get-organizational-context.use-case';
import { SaveOrganizationalContextUseCase } from '../application/use-cases/save-organizational-context.use-case';
import { toOrganizationalContextResponse } from './organizational-context-response.mapper';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData } from '../../../common/swagger/api-envelope';
import { OrganizationalContextResponse } from './organizational-context.responses';
import { clientIp } from '../../../common/http/client-ip';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;

// Componente 1 del onboarding. Solo el admin_empresa declara el contexto de su empresa.
@ApiTags(API_TAGS.organizationalContext)
@Can('company.configure')
@Controller('onboarding/organizational-context')
export class OnboardingController {
  constructor(
    private readonly getContext: GetOrganizationalContextUseCase,
    private readonly saveContext: SaveOrganizationalContextUseCase,
  ) {}

  @ApiOperation({ summary: 'Leer el contexto organizacional', description: 'Devuelve lo declarado de la empresa. Si aún no se guardó, `id` es `null` y solo trae la razón social (precargada y bloqueada).' })
  @ApiData(OrganizationalContextResponse, 'Contexto de la organización, con su avance de llenado.')
  @Get()
  async get(@CurrentUser() principal: Principal) {
    const ctx = await this.getContext.execute(principal);
    return new ResponseDto(HttpStatus.OK, t('organizational_context.get'), toOrganizationalContextResponse(ctx));
  }

  // Crea la organización la primera vez y la actualiza las siguientes (mismo endpoint, idempotente).
  @ApiOperation({ summary: 'Guardar el contexto organizacional', description: 'Guarda el formulario completo (9 campos obligatorios y 1 opcional). Crea la organización la primera vez y la actualiza las siguientes; es idempotente. La razón social no se envía: es de solo lectura. Queda registro de auditoría con el estado antes y después.' })
  @ApiData(OrganizationalContextResponse, 'Contexto guardado. Las regulaciones vuelven con nombre y jurisdicción.')
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
      { ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' },
    );
    return new ResponseDto(HttpStatus.OK, t('organizational_context.saved'), toOrganizationalContextResponse(ctx));
  }
}
