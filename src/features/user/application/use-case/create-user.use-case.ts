import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.userRepository.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
      name: dto.name,
      last_name: dto.last_name,
    });
  }
}
