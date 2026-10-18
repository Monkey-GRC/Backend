import { Controller, Get, Header } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TEMPLATE_FILE_NAME } from '../application/cloud-connection';
import { AWS_READONLY_ROLE_TEMPLATE } from '../infrastructure/templates/aws-readonly-role.template';
import { API_TAGS } from '../../../common/swagger/api-docs.config';

// La plantilla que el cliente crea en su cuenta de AWS para dar acceso de SOLO LECTURA a Monkey (contracts/modules/control-tecnico.md).
// Es contenido estático, pero va tras la sesión: no es información para publicar.
@ApiTags(API_TAGS.connectionTemplates)
@Roles('admin_empresa')
@Controller('connection-templates')
export class ConnectionTemplatesController {
  @ApiOperation({ summary: 'Plantilla del rol de solo lectura (AWS)', description: 'Plantilla de CloudFormation (YAML) que el cliente crea en su cuenta de AWS para dar a Monkey acceso de **solo lectura**. Se descarga como archivo; no es información para publicar, por eso va tras la sesión.' })
  @ApiOkResponse({ description: 'La plantilla como archivo YAML.', content: { 'text/yaml': { schema: { type: 'string', format: 'binary' } } } })
  @Get('aws-readonly-role')
  @Header('Content-Type', 'text/yaml; charset=utf-8')
  @Header('Content-Disposition', `attachment; filename="${TEMPLATE_FILE_NAME}"`)
  awsReadonlyRole(): string {
    return AWS_READONLY_ROLE_TEMPLATE;
  }
}
