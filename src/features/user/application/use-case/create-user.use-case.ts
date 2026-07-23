import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { Role } from 'generated/prisma/client';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly i18n: I18nService,
  ) {}

  async execute(dto: CreateUserDto) {
    const requiresTenant = dto.role === Role.CLIENT_ADMIN;

    if (requiresTenant && !dto.client_id) {
      throw new BadRequestException(this.i18n.t('user.TENANT_REQUIRED'));
    }
    if (!requiresTenant && dto.client_id) {
      throw new BadRequestException(this.i18n.t('user.TENANT_NOT_ALLOWED'));
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.userRepository.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
      name: dto.name,
      last_name: dto.last_name,
      role: dto.role,
      client_id: requiresTenant ? dto.client_id : null,
    });
  }
}
