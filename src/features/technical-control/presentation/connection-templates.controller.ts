import { Controller, Get, Header } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DomainError } from '../../../common/errors/domain-error';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GCP_SETUP_FILE_NAME, TEMPLATE_FILE_NAME } from '../application/cloud-connection';
import { ConnectionTemplates } from '../application/connection-templates';
import { API_TAGS } from '../../../common/swagger/api-docs.config';

// La plantilla que el cliente crea en su cuenta de AWS para dar acceso de SOLO LECTURA a Monkey (contracts/modules/control-tecnico.md).
// Es contenido estático, pero va tras la sesión: no es información para publicar.
@ApiTags(API_TAGS.connectionTemplates)
@Roles('admin_empresa')
@Controller('connection-templates')
export class ConnectionTemplatesController {
  constructor(
    private readonly config: ConfigService,
    private readonly templates: ConnectionTemplates,
  ) {}

  @ApiOperation({ summary: 'Plantilla del rol de solo lectura (AWS)', description: 'Plantilla de CloudFormation (YAML) que el cliente crea en su cuenta de AWS para dar a Monkey acceso de **solo lectura**. Se descarga como archivo; no es información para publicar, por eso va tras la sesión.' })
  @ApiOkResponse({ description: 'La plantilla como archivo YAML.', content: { 'text/yaml': { schema: { type: 'string', format: 'binary' } } } })
  @Get('aws-readonly-role')
  @Header('Content-Type', 'text/yaml; charset=utf-8')
  @Header('Content-Disposition', `attachment; filename="${TEMPLATE_FILE_NAME}"`)
  awsReadonlyRole(): string {
    return this.templates.awsReadonlyRole();
  }

  @ApiOperation({ summary: 'Script de alta de GCP', description: 'Script (bash) que el cliente corre en Cloud Shell, en su proyecto de Google Cloud, para dar a Monkey acceso de **solo lectura** por federación de identidad, sin claves (D112). Es el mismo que va dentro de `connection_setup.setup_command`; aquí se puede leer o descargar. Recibe el ID del proyecto y el identificador externo como parámetros. `503 CONNECTION_UNAVAILABLE` si el servidor no tiene configurada la identidad de Monkey.' })
  @ApiOkResponse({ description: 'El script como archivo.', content: { 'text/x-shellscript': { schema: { type: 'string', format: 'binary' } } } })
  @Get('gcp-identity-federation')
  @Header('Content-Type', 'text/x-shellscript; charset=utf-8')
  @Header('Content-Disposition', `attachment; filename="${GCP_SETUP_FILE_NAME}"`)
  gcpIdentityFederation(): string {
    const role = this.config.get<string>('MONKEY_GCP_FEDERATION_ROLE_ARN')?.trim();
    if (!role) throw new DomainError('CONNECTION_UNAVAILABLE');
    return this.templates.gcpSetupScript(role);
  }
}
