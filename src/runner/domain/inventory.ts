// Lo que el trabajador descubre en la cuenta del cliente al validar la conexión (D59): qué activos hay y qué se puede leer de cada uno.
// Dominio puro: sin AWS ni Nest. Solo lectura y solo en las regiones que el cliente declaró.

export type ResourceKind = 'server' | 'database' | 'storage' | 'function' | 'other';

export type DiscoveredResource = {
  uid: string; // ARN
  type: string;
  kind: ResourceKind;
  name: string | null;
  region: string | null;
  // Solo lo que se pudo leer. Lo que no se sabe no está (y no se inventa).
  attributes: Record<string, string | number | boolean | null>;
  // Las etiquetas del recurso en el proveedor (`clave=valor`), sin las que pone el propio proveedor. Es como el cliente lo reconoce y lo clasifica.
  tags: string[];
};

export type Inventory = {
  resources: DiscoveredResource[];
  // Servicios que no se pudieron leer (permiso denegado, tiempo agotado): el cliente debe ver «incompleto», no «vacío».
  warnings: string[];
};
