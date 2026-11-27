import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { Can } from '../../../common/authorization/can.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { clientIp } from '../../../common/http/client-ip';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors } from '../../../common/swagger/api-envelope';
import { ConnectionTemplates } from '../application/connection-templates';
import { CompleteMicrosoftConsentDto } from '../application/dtos/technical-control.dtos';
import { CompleteMicrosoftConsentUseCase, MicrosoftConsentedUseCase, MicrosoftSignedInUseCase, StartMicrosoftConsentUseCase } from '../application/use-cases/microsoft-consent.use-cases';
import { toAssetResponse } from './technical-control-response.mapper';
import { AssetResponse, MicrosoftConsentStartResponse } from './technical-control.responses';

const t = (key: string): string => I18nContext.current()?.t(key) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' });

// «Conectar Microsoft 365» (D157): lo que la pantalla llama con la sesión del cliente.
@ApiTags(API_TAGS.assets)
@Can('integrations.configure')
@Controller('assets/:id/connection/microsoft')
export class MicrosoftConsentController {
  constructor(
    private readonly startConsent: StartMicrosoftConsentUseCase,
    private readonly completeConsent: CompleteMicrosoftConsentUseCase,
    private readonly config: ConfigService,
    private readonly templates: ConnectionTemplates,
  ) {}

  @ApiOperation({ summary: 'Empezar «Conectar Microsoft 365»', description: 'Devuelve la dirección de Microsoft a la que la pantalla manda al administrador: primero inicia sesión (así Monkey comprueba de qué organización es y que la administra) y después autoriza los permisos de **solo lectura**. `503 CONNECTION_UNAVAILABLE` si el servidor no tiene configurada la aplicación de Monkey.' })
  @ApiData(MicrosoftConsentStartResponse, 'A dónde mandar el navegador.')
  @ApiDomainErrors('CONNECTION_METHOD_NOT_APPLICABLE', 'ASSET_ALREADY_ACTIVE', 'CONNECTION_UNAVAILABLE')
  @Post('start')
  @HttpCode(HttpStatus.OK)
  async start(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string) {
    const out = await this.startConsent.execute(principal, id);
    return new ResponseDto(HttpStatus.OK, t('asset.microsoft_consent_started'), { authorize_url: out.authorizeUrl });
  }

  @ApiOperation({ summary: 'Terminar «Conectar Microsoft 365»', description: 'La pantalla entrega el recibo con el que Microsoft devolvió al administrador. Solo vale en la misma sesión de Monkey que empezó y para ese activo; vence en 5 minutos. Enlaza el activo a la organización comprobada y deja la conexión en `pending`, lista para **comprobar**. `422` en `handle` si no vale o venció.' })
  @ApiData(AssetResponse, 'El activo ya enlazado a la organización.')
  @ApiDomainErrors('CONNECTION_METHOD_NOT_APPLICABLE', 'ASSET_ALREADY_ACTIVE')
  @Post('complete')
  @HttpCode(HttpStatus.OK)
  async complete(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Body() dto: CompleteMicrosoftConsentDto, @Req() req: Request) {
    const asset = await this.completeConsent.execute(principal, id, dto.handle, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('asset.connection_set'), toAssetResponse(asset, this.config.get<string>('MONKEY_AWS_PRINCIPAL_ARN') || null, t));
  }
}

const field = (source: Record<string, unknown>, name: string, max: number): string => {
  const value = source[name];
  return typeof value === 'string' && value.length <= max ? value : '';
};

// A donde Microsoft devuelve el NAVEGADOR (no son parte de la API: no van en la documentación). Públicas porque llegan sin la sesión de Monkey; no cambian nada: solo verifican
// y redirigen a la pantalla, que es la que termina con su sesión. No se guarda ni se registra lo que traen.
@ApiExcludeController()
@Public()
@Controller('integrations/microsoft')
export class MicrosoftConsentCallbackController {
  constructor(
    private readonly signedIn: MicrosoftSignedInUseCase,
    private readonly consented: MicrosoftConsentedUseCase,
  ) {}

  // Microsoft entrega la identidad firmada con un formulario (`form_post`): así no queda en la dirección ni en el historial.
  @Post('signin')
  async signin(@Body() body: Record<string, unknown>, @Res() res: Response): Promise<void> {
    redirect(res, await this.signedIn.execute({ state: field(body, 'state', 2000), idToken: field(body, 'id_token', 12000), error: field(body, 'error', 200) }));
  }

  @Get('consent')
  consent(@Query() query: Record<string, unknown>, @Res() res: Response): void {
    redirect(res, this.consented.execute({ state: field(query, 'state', 2000), tenant: field(query, 'tenant', 64), adminConsent: field(query, 'admin_consent', 10), error: field(query, 'error', 200) }));
  }
}

function redirect(res: Response, url: string): void {
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  res.redirect(303, url);
}
