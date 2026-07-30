import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ClientRepository } from '../../domain/repositories/client.repository';

@Injectable()
export class GetOneClientUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly i18n: I18nService,
  ) {}

  async execute(id: string) {
    const client = await this.clientRepository.findOne(id);
    if (!client) {
      throw new NotFoundException(this.i18n.t('client.NOT_FOUND'));
    }
    return client;
  }
}
