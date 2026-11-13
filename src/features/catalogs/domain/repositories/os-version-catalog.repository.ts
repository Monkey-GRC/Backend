import { OsVersionItem } from '../entities/catalog-item';

// catalog.sca_policies (D112): las versiones de un sistema operativo que el cliente puede declarar, en su orden. Lectura libre.
export abstract class OsVersionCatalogRepository {
  // Solo las que la sonda entrega (`is_offerable`). Vacío si el sistema no tiene ninguna (o no existe): una política cargada que la sonda no trae NO se ofrece.
  abstract findOfferableByOs(osCode: string): Promise<OsVersionItem[]>;
}
