import { Injectable } from '@nestjs/common';
import {
  ENUM_CATALOGS,
  EnumCatalogName,
} from '../../../../common/catalogs/onboarding-catalogs';
import { DomainError } from '../../../../common/errors/domain-error';
import { Catalog } from '../../domain/entities/catalog-item';
import { CapabilityCatalogRepository } from '../../domain/repositories/capability-catalog.repository';
import { FrameworkCatalogRepository } from '../../domain/repositories/framework-catalog.repository';
import { OsVersionCatalogRepository } from '../../domain/repositories/os-version-catalog.repository';
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
    private readonly osVersions: OsVersionCatalogRepository,
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
    // `<sistema>_version` (p. ej. `linux_version`, `windows_version`): las versiones que el cliente puede declarar para un servidor salen de la base (D112),
    // solo las que la sonda entrega. Ninguna lista vive en el código ni en la pantalla.
    const version = /^([a-z0-9_]+)_version$/.exec(name);
    if (version) {
      const items = await this.osVersions.findOfferableByOs(version[1]);
      if (items.length === 0) throw new DomainError('NOT_FOUND');
      return { kind: 'os_versions', items };
    }
    if (!Object.prototype.hasOwnProperty.call(ENUM_CATALOGS, name)) {
      throw new DomainError('NOT_FOUND');
    }
    return { kind: 'enum', name, values: ENUM_CATALOGS[name as EnumCatalogName] };
  }
}
