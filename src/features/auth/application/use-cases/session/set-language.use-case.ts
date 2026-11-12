import { Injectable } from '@nestjs/common';
import { Principal } from '../../../../../common/auth/principal';
import { RequestMeta } from '../../../../../common/http/request-meta';
import { AuthUserRepository } from '../../../domain/repositories/auth-user.repository';
import { LanguageValue } from '../../dtos/language.dto';

// PATCH /v1/auth/me/language (D111): la persona guarda el idioma en el que usa Monkey; con él salen sus correos.
@Injectable()
export class SetLanguageUseCase {
  constructor(private readonly users: AuthUserRepository) {}

  async execute(principal: Principal, language: LanguageValue, meta: RequestMeta): Promise<void> {
    await this.users.setPreferredLanguage({ companyId: principal.companyId, userId: principal.userId, role: principal.role }, principal.userId, language, ({ from, to }) => ({
      tenantId: principal.companyId,
      userId: principal.userId,
      action: 'user.language_changed',
      resource: 'user',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      beforeState: { preferred_language: from },
      afterState: { preferred_language: to },
    }));
  }
}
