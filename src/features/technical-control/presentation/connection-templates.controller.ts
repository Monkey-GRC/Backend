import { Controller, Get, Header } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ROLE_NAME } from '../application/cloud-connection';
import { AWS_READONLY_ROLE_TEMPLATE } from '../infrastructure/templates/aws-readonly-role.template';

// La plantilla que el cliente crea en su cuenta de AWS para dar acceso de SOLO LECTURA a Monkey (contracts/modules/control-tecnico.md).
// Es contenido estático, pero va tras la sesión: no es información para publicar.
@ApiTags('connection-templates')
@ApiCookieAuth()
@Roles('admin_empresa')
@Controller('connection-templates')
export class ConnectionTemplatesController {
  @Get('aws-readonly-role')
  @Header('Content-Type', 'text/yaml; charset=utf-8')
  @Header('Content-Disposition', `attachment; filename="monkey-${ROLE_NAME.toLowerCase()}.yaml"`)
  awsReadonlyRole(): string {
    return AWS_READONLY_ROLE_TEMPLATE;
  }
}
