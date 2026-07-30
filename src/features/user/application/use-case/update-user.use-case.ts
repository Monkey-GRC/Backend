import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, dto: UpdateUserDto) {
    const password = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;

    return this.userRepository.update(id, {
      email: dto.email,
      username: dto.username,
      password,
      name: dto.name,
      last_name: dto.last_name,
      is_active: dto.is_active,
    });
  }
}
