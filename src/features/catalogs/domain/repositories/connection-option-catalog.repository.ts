import { ConnectionOptionItem } from '../entities/catalog-item';

// catalog.connection_options (D114): las opciones del asistente de conexión de un catálogo, en su orden. Lectura libre.
export abstract class ConnectionOptionCatalogRepository {
  // Vacío si el catálogo no tiene opciones.
  abstract findByCatalog(catalog: string): Promise<ConnectionOptionItem[]>;
}
