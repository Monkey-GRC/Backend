// Una opción de una lista desplegable: el valor que viaja y, para las regulaciones, su ficha.
export type RegulationItem = {
  code: string;
  name: string;
  jurisdiction: string;
};

// Un marco que Monkey ofrece (catalog.frameworks). `availability` dice si ya tiene catálogo y se puede
// contratar (`available`, hoy solo SOC 2) o si es solo oferta comercial (`coming_soon`, D50).
export type FrameworkItem = {
  code: string;
  name: string;
  description: string;
  availability: 'available' | 'coming_soon';
};

// Lo que el cliente elige al conectar (D67): un proveedor de nube, un sistema operativo o un motor. Solo se elige la `available`; la
// `coming_soon` se muestra bloqueada. `logoKey` es el nombre del SVG en la plataforma.
export type PlatformItem = {
  code: string;
  name: string;
  logoKey: string;
  availability: 'available' | 'coming_soon';
  // Canales de la plataforma; el primero es el recomendado. Vacío si aún no tiene canal.
  connectionMethods: string[];
};

// Una conexión del catálogo ac_01…ac_06. SIN `provider`: es interno y nunca sale (confidencialidad).
export type CapabilityItem = {
  catalogCode: string;
  category: string;
  platforms: PlatformItem[];
  method: string;
  requiredPermissions: string[];
  baseFrequency: string;
  generatedEvidence: string;
};

// Una opción del asistente de conexión (D114). El texto (`label`, `description`) sale de i18n por `code`.
export type ConnectionOptionItem = {
  code: string;
  availability: 'available' | 'coming_soon';
  tags: string[];
};

// Una región de una plataforma (D67): su código es lo que viaja; `name` es el nombre del proveedor, por si no hay etiqueta traducida.
export type RegionItem = { code: string; name: string };

// Una versión de un sistema operativo que el cliente puede declarar para un servidor (D113): «Ubuntu 22.04 LTS», «Windows Server 2022». Solo salen las que la
// sonda realmente entrega. `code` es el código de la API, definido por Monkey (no el id que use la sonda).
export type OsVersionItem = { code: string; distribution: string; distributionName: string; versionLabel: string };

export type Catalog =
  | { kind: 'capabilities'; items: CapabilityItem[] }
  | { kind: 'regions'; items: RegionItem[] }
  | { kind: 'os_versions'; items: OsVersionItem[] }
  | { kind: 'options'; name: string; items: ConnectionOptionItem[] }
  | { kind: 'enum'; name: string; values: readonly string[] }
  | { kind: 'regulations'; items: RegulationItem[] }
  | { kind: 'frameworks'; items: FrameworkItem[] };
