import { RegionItem } from '../entities/catalog-item';

// catalog.platform_regions (D67): las regiones que el cliente puede declarar para una plataforma, en su orden. Lectura libre.
export abstract class RegionCatalogRepository {
  // Vacío si la plataforma no tiene regiones (o no existe).
  abstract findByPlatform(platformCode: string): Promise<RegionItem[]>;
}
