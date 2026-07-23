import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute() {
    return this.userRepository.findAll();
  }
}
