import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class GetOneUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(id: string) {
    return this.userRepository.findOne(id);
  }
}
