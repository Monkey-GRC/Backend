import { Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiDomainErrors, ApiNoBody } from '../../../common/swagger/api-envelope';
import { ResetMfaUseCase } from '../application/use-cases/mfa/reset-mfa.use-case';
import { requestMeta } from './auth-cookies';

const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// D94 · Quitarle el segundo factor a quien perdió el celular y sus códigos de recuperación. Es del administrador de la empresa sobre su propio equipo.
@ApiTags(API_TAGS.auth)
@Roles('admin_empresa')
@Controller('users')
export class MfaAdminController {
  constructor(private readonly reset: ResetMfaUseCase) {}

  @ApiOperation({ summary: 'Quitar el segundo factor a un integrante del equipo', description: 'Solo `admin_empresa`, y solo sobre un `funcional` o `auditor` de su empresa. Borra el secreto y los códigos de recuperación y **cierra todas sus sesiones**; en su próximo ingreso la persona configura el segundo factor de nuevo. No se puede aplicar a uno mismo ni a otro administrador (el administrador de la empresa lo restablece Monkey). Queda registro de auditoría.' })
  @ApiNoBody('Segundo factor quitado. No hay cuerpo.')
  @ApiDomainErrors('FORBIDDEN', 'NOT_FOUND')
  @Delete(':id/mfa')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request): Promise<void> {
    await this.reset.execute(principal, id, requestMeta(req));
  }
}