import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { Role } from 'generated/prisma/client';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly i18n: I18nService,
  ) {}

  async execute(id: string, dto: UpdateUserDto) {
    const settingClientAdmin = dto.role === Role.CLIENT_ADMIN;
    const settingNonTenantRole = dto.role !== undefined && !settingClientAdmin;
    const clearingClientId = dto.client_id === null;

    if (settingClientAdmin && !dto.client_id) {
      throw new BadRequestException(this.i18n.t('user.TENANT_REQUIRED'));
    }
    if (settingNonTenantRole && dto.client_id) {
      throw new BadRequestException(this.i18n.t('user.TENANT_NOT_ALLOWED'));
    }
    if (clearingClientId && !settingNonTenantRole) {
      throw new BadRequestException(this.i18n.t('user.TENANT_REQUIRED'));
    }

    const password = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;

    return this.userRepository.update(id, {
      email: dto.email,
      username: dto.username,
      password,
      name: dto.name,
      last_name: dto.last_name,
      role: dto.role,
      client_id: settingNonTenantRole ? null : dto.client_id ?? undefined,
      is_active: dto.is_active,
    });
  }
}
