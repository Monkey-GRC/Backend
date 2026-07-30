import { Injectable } from '@nestjs/common';
import { ClientRepository } from '../../domain/repositories/client.repository';

@Injectable()
export class GetAllClientsUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  execute() {
    return this.clientRepository.findAll();
  }
}
