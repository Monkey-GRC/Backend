import { Injectable } from '@nestjs/common';
import {
  ENUM_CATALOGS,
  EnumCatalogName,
} from '../../../../common/catalogs/onboarding-catalogs';
import { CONNECTION_OPTION_CATALOGS } from '../../../../common/catalogs/technical-catalogs';
import { DomainError } from '../../../../common/errors/domain-error';
import { Catalog } from '../../domain/entities/catalog-item';
import { CapabilityCatalogRepository } from '../../domain/repositories/capability-catalog.repository';
import { FrameworkCatalogRepository } from '../../domain/repositories/framework-catalog.repository';
import { ConnectionOptionCatalogRepository } from '../../domain/repositories/connection-option-catalog.repository';
import { RegionCatalogRepository } from '../../domain/repositories/region-catalog.repository';
import { RegulationCatalogRepository } from '../../domain/repositories/regulation-catalog.repository';

// GET /v1/catalogs/{name}: las opciones de los formularios. El frontend no hardcodea listas.
@Injectable()
export class GetCatalogUseCase {
  constructor(
    private readonly regulations: RegulationCatalogRepository,
    private readonly frameworks: FrameworkCatalogRepository,
    private readonly capabilities: CapabilityCatalogRepository,
    private readonly regions: RegionCatalogRepository,
    private readonly options: ConnectionOptionCatalogRepository,
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
    // `<plataforma>_region` (p. ej. `aws_region`): las regiones de esa plataforma salen de la base (D67), no de una lista del código.
    const region = /^([a-z0-9_]+)_region$/.exec(name);
    if (region) {
      const items = await this.regions.findByPlatform(region[1]);
      if (items.length === 0) throw new DomainError('NOT_FOUND');
      return { kind: 'regions', items };
    }
    // Las opciones del asistente de conexión (D114) salen de la base, con su disponibilidad y etiquetas.
    if (CONNECTION_OPTION_CATALOGS.includes(name)) {
      return { kind: 'options', name, items: await this.options.findByCatalog(name) };
    }
    if (!Object.prototype.hasOwnProperty.call(ENUM_CATALOGS, name)) {
      throw new DomainError('NOT_FOUND');
    }
    return { kind: 'enum', name, values: ENUM_CATALOGS[name as EnumCatalogName] };
  }
}
