import { Controller, Get, Header, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors } from '../../../common/swagger/api-envelope';
import { servedInstaller } from '../domain/agent-install/install-command';
import { GetAgentInstallStateUseCase, RegenerateAgentInstallUseCase, RevealAgentInstallUseCase, StartAgentInstallUseCase } from '../application/use-cases/agent-install.use-cases';
import { AGENT_INSTALL_PS1, AGENT_INSTALL_PS1_PARAMS } from '../infrastructure/templates/agent-install.ps1.template';
import { AGENT_INSTALL_SH } from '../infrastructure/templates/agent-install.sh.template';
import { toInstallRevealResponse, toInstallStateResponse } from './agent-install-response.mapper';
import { AgentInstallRevealResponse, AgentInstallStateResponse } from './technical-control.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

const TEMPLATES = { linuxScript: AGENT_INSTALL_SH, windowsScript: AGENT_INSTALL_PS1, windowsParamsBlock: AGENT_INSTALL_PS1_PARAMS };

// Instalar la sonda en un servidor con agente (D113). El estado se consulta (GET) las veces que haga falta y no lleva ningún secreto; el comando, que lleva la clave del
// servidor, se pide aparte (POST) y se entrega UNA sola vez.
@ApiTags(API_TAGS.assets)
@Roles('admin_empresa')
@Controller('assets/:id/agent-install')
export class AgentInstallController {
  constructor(
    private readonly getState: GetAgentInstallStateUseCase,
    private readonly start: StartAgentInstallUseCase,
    private readonly reveal: RevealAgentInstallUseCase,
    private readonly regenerate: RegenerateAgentInstallUseCase,
  ) {}

  @ApiOperation({ summary: 'Estado de la instalación', description: 'En qué punto está la instalación de la sonda en este servidor: `not_started` · `preparing` (se está creando el agente, unos segundos) · `ready` (el comando se puede pedir, una vez, hasta `expires_at`) · `delivered` (ya se mostró o caducó) · `failed` (con el motivo traducido). **No lleva ningún secreto**: se puede consultar las veces que haga falta.' })
  @ApiData(AgentInstallStateResponse, 'Estado de la instalación.')
  @ApiDomainErrors('ASSET_NOT_AGENT', 'AGENT_INSTALL_UNAVAILABLE')
  @Get()
  async state(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string) {
    return new ResponseDto(HttpStatus.OK, t('agent_install.read'), toInstallStateResponse(await this.getState.execute(principal, id), t));
  }

  @ApiOperation({ summary: 'Empezar la instalación', description: 'Deja en cola la creación del agente y responde ya (202); nunca espera. Repetirla es inofensivo: si ya está en curso, lista o entregada, no hace nada. Después, consultar el estado hasta `ready`.' })
  @ApiData(AgentInstallStateResponse, 'Instalación en preparación.', { status: 202 })
  @ApiDomainErrors('ASSET_NOT_AGENT', 'AGENT_INSTALL_UNAVAILABLE', 'EXECUTION_IN_PROGRESS')
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async begin(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    return new ResponseDto(HttpStatus.ACCEPTED, t('agent_install.started'), toInstallStateResponse(await this.start.execute(principal, id, metaOf(req)), t));
  }

  // Un POST y no un GET a propósito: leerlo lo gasta, y un reintento del navegador o de un proxy no debe poder llevarse la clave.
  @ApiOperation({ summary: 'Mostrar el comando de instalación (una sola vez)', description: 'Devuelve el comando (y, en Windows, también un archivo) **con la clave de este servidor adentro**, y la borra: no se vuelve a mostrar. Si no se alcanzó a copiar, se genera uno nuevo. Es sensible: no se registra en ninguna parte.' })
  @ApiData(AgentInstallRevealResponse, 'Comando de instalación.')
  @ApiDomainErrors('ASSET_NOT_AGENT', 'AGENT_INSTALL_NOT_READY', 'AGENT_INSTALL_UNAVAILABLE')
  @Post('reveal')
  @HttpCode(HttpStatus.OK)
  async show(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    return new ResponseDto(HttpStatus.OK, t('agent_install.revealed'), toInstallRevealResponse(await this.reveal.execute(principal, id, metaOf(req)), t));
  }

  @ApiOperation({ summary: 'Generar el comando de nuevo', description: 'Si el comando no se alcanzó a copiar (o se perdió): retira el agente anterior y crea otro. El comando viejo deja de servir. Responde ya (202).' })
  @ApiData(AgentInstallStateResponse, 'Instalación en preparación.', { status: 202 })
  @ApiDomainErrors('ASSET_NOT_AGENT', 'AGENT_INSTALL_UNAVAILABLE', 'EXECUTION_IN_PROGRESS')
  @Post('regenerate')
  @HttpCode(HttpStatus.ACCEPTED)
  async again(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    return new ResponseDto(HttpStatus.ACCEPTED, t('agent_install.regenerated'), toInstallStateResponse(await this.regenerate.execute(principal, id, metaOf(req)), t));
  }
}

// Los instaladores que ejecuta el comando del cliente. Son PÚBLICOS a propósito: el `curl` del servidor del cliente no lleva sesión. No contienen ningún secreto ni dato de un
// servidor (la clave llega como argumento del comando, no en este archivo).
@ApiTags(API_TAGS.connectionTemplates)
@Public()
@Controller('install')
export class InstallScriptsController {
  @ApiOperation({ summary: 'Instalador para Linux', description: 'El script que ejecuta el comando de instalación en un servidor Linux. Público y sin secretos: los datos de cada servidor llegan como argumentos.' })
  @ApiOkResponse({ description: 'El script.', content: { 'text/plain': { schema: { type: 'string' } } } })
  @Get('agent.sh')
  @Header('Content-Type', 'text/x-shellscript; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  linux(): string {
    return servedInstaller('linux', TEMPLATES);
  }

  @ApiOperation({ summary: 'Instalador para Windows', description: 'El script de PowerShell que ejecuta el comando de instalación en un servidor Windows. Público y sin secretos: los datos de cada servidor llegan como argumentos.' })
  @ApiOkResponse({ description: 'El script.', content: { 'text/plain': { schema: { type: 'string' } } } })
  @Get('agent.ps1')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  windows(): string {
    return servedInstaller('windows', TEMPLATES);
  }
}
