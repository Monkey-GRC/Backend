import { ConnectionCategory } from '../../../../common/catalogs/technical-catalogs';
import { OsVersionRule, PlatformRule } from '../entities/technical-control.entities';

// Lo que el alta de una conexión necesita saber del catálogo (D67): si la plataforma existe en esa conexión, si está disponible, con qué canales
// se conecta y qué regiones admite. El catálogo es global (no es de ninguna empresa): se lee sin tenant, como el resto de los catálogos.
export abstract class ConnectionCatalogRepository {
  // Null si la plataforma no existe dentro de esa conexión (p. ej. `linux` en `ac_01`).
  abstract findPlatform(category: ConnectionCategory, code: string): Promise<PlatformRule | null>;
  abstract findPlatformById(id: string): Promise<PlatformRule | null>;
  // La versión de un sistema con ese código, SOLO si la sonda la entrega (`is_offerable`); null si no existe o no se ofrece (D113).
  abstract findOsVersion(code: string): Promise<OsVersionRule | null>;
}
