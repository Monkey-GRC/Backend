import { Injectable } from '@nestjs/common';
import {
  ENUM_CATALOGS,
  EnumCatalogName,
} from '../../../../common/catalogs/onboarding-catalogs';
import { DomainError } from '../../../../common/errors/domain-error';
import { Catalog } from '../../domain/entities/catalog-item';
import { CapabilityCatalogRepository } from '../../domain/repositories/capability-catalog.repository';
import { FrameworkCatalogRepository } from '../../domain/repositories/framework-catalog.repository';
import { RegulationCatalogRepository } from '../../domain/repositories/regulation-catalog.repository';

// GET /v1/catalogs/{name}: las opciones de los formularios. El frontend no hardcodea listas.
@Injectable()
export class GetCatalogUseCase {
  constructor(
    private readonly regulations: RegulationCatalogRepository,
    private readonly frameworks: FrameworkCatalogRepository,
    private readonly capabilities: CapabilityCatalogRepository,
  ) {}

  async execute(name: string): Promise<Catalog> {
    if (name === 'automated-capabilities') {
      return { kind: 'capabilities', items: await this.capabilities.findAll() };
    }
    if (name === 'regulations') {
      return { kind: 'regulations', items: await this.regulations.findAll() };
    }
    if (name === 'frameworks') {
      return { kind: 'frameworks', items: await this.frameworks.findAll() };
    }
    if (!Object.prototype.hasOwnProperty.call(ENUM_CATALOGS, name)) {
      throw new DomainError('NOT_FOUND');
    }
    return { kind: 'enum', name, values: ENUM_CATALOGS[name as EnumCatalogName] };
  }
}
