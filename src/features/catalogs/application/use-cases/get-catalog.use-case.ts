import { Injectable } from '@nestjs/common';
import {
  ENUM_CATALOGS,
  EnumCatalogName,
} from '../../../../common/catalogs/onboarding-catalogs';
import { DomainError } from '../../../../common/errors/domain-error';
import { Catalog } from '../../domain/entities/catalog-item';
import { RegulationCatalogRepository } from '../../domain/repositories/regulation-catalog.repository';

// GET /v1/catalogs/{name}: las opciones de los formularios. El frontend no hardcodea listas.
@Injectable()
export class GetCatalogUseCase {
  constructor(private readonly regulations: RegulationCatalogRepository) {}

  async execute(name: string): Promise<Catalog> {
    if (name === 'regulations') {
      return { kind: 'regulations', items: await this.regulations.findAll() };
    }
    if (!Object.prototype.hasOwnProperty.call(ENUM_CATALOGS, name)) {
      throw new DomainError('NOT_FOUND');
    }
    return { kind: 'enum', name, values: ENUM_CATALOGS[name as EnumCatalogName] };
  }
}
