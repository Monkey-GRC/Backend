import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Can } from '../../../common/authorization/can.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiItems } from '../../../common/swagger/api-envelope';
import { GetIntegrationCatalogUseCase } from '../application/use-cases/get-integration-catalog.use-case';
import { GetIntegrationUseCase } from '../application/use-cases/get-integration.use-case';
import { ListIntegrationsUseCase } from '../application/use-cases/list-integrations.use-case';
import { toCatalogIntegration, toIntegration, toIntegrationDetail } from './integration-response.mapper';
import { CatalogIntegrationResponse, IntegrationDetailResponse, IntegrationResponse } from './integration.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;

// La sección Integraciones de la empresa (D110, MD-211): el catálogo para agregar y lo que ya está conectado. No conecta nada: la conexión sigue su flujo por servicio.
@ApiTags(API_TAGS.integrations)
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly getCatalog: GetIntegrationCatalogUseCase,
    private readonly listIntegrations: ListIntegrationsUseCase,
    private readonly getIntegration: GetIntegrationUseCase,
  ) {}

  @ApiOperation({ summary: 'Catálogo de integraciones', description: 'Lo que se puede conectar, sin paginar: medición antes que flujo de trabajo y, dentro, por orden del catálogo. `availability` es el de la plataforma de conexión cuando la tiene; `connected` indica si la empresa ya tiene una conexión activa. Solo `admin_empresa`. Contrato: `contracts/integraciones.md`.' })
  @ApiItems(CatalogIntegrationResponse, 'Catálogo de integraciones.', { message: 'integration.catalog' })
  @Get('catalog')
  @Can('integrations.configure')
  async catalog(@CurrentUser() principal: Principal) {
    const items = await this.getCatalog.execute(principal);
    return new ResponseDto(HttpStatus.OK, t('integration.catalog'), {
      items: items.map((i) => toCatalogIntegration(i, t(`integration.description.${i.code}`))),
    });
  }

  @ApiOperation({ summary: 'Integraciones de la empresa', description: 'Una fila por integración con al menos una conexión vigente, con su estado derivado (`needs_attention` > `active` > `pending`), sus recursos y sus conexiones. Sin paginar. `admin_empresa` y `auditor` (lectura). Contrato: `contracts/integraciones.md`.' })
  @ApiItems(IntegrationResponse, 'Integraciones de la empresa.', { message: 'integration.list' })
  @Get()
  @Can('integrations.view')
  async list(@CurrentUser() principal: Principal) {
    const items = await this.listIntegrations.execute(principal);
    return new ResponseDto(HttpStatus.OK, t('integration.list'), { items: items.map(toIntegration) });
  }

  // Va después de `catalog` para que no se confunda con un código.
  @ApiOperation({ summary: 'Detalle de una integración', description: 'La página de detalle: el catálogo, el estado y las conexiones de la empresa (vacíos si no la tiene), lo que hace, lo que pide, cómo la protege Monkey y lo que alimenta en el cumplimiento (`coverage`, derivado del catálogo: la integración alimenta pruebas, no las aprueba). `admin_empresa` ve cualquier integración del catálogo; `auditor`, solo las que la empresa tiene conectadas (si no, 404). Contrato: `contracts/integraciones.md`.' })
  @ApiParam({ name: 'code', description: 'Código de la integración del catálogo (`aws`, `github`, `jira`…).', example: 'aws' })
  @ApiData(IntegrationDetailResponse, 'Detalle de la integración.', { message: 'integration.detail' })
  @ApiDomainErrors('INTEGRATION_NOT_FOUND')
  @Get(':code')
  @Can('integrations.view')
  async detail(@CurrentUser() principal: Principal, @Param('code') code: string) {
    const detail = await this.getIntegration.execute(principal, code);
    return new ResponseDto(HttpStatus.OK, t('integration.detail'), toIntegrationDetail(detail, t));
  }
}
