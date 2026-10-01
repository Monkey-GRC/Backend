// Una opción de una lista desplegable: el valor que viaja y, para las regulaciones, su ficha.
export type RegulationItem = {
  code: string;
  name: string;
  jurisdiction: string;
};

// Un marco que se puede contratar (catalog.frameworks). Hoy solo SOC 2 (D37).
export type FrameworkItem = {
  code: string;
  name: string;
  description: string;
};

// Una conexión del catálogo ac_01…ac_06. SIN `provider`: es interno y nunca sale (confidencialidad).
export type CapabilityItem = {
  catalogCode: string;
  category: string;
  supportedPlatforms: string[];
  method: string;
  requiredPermissions: string[];
  baseFrequency: string;
  generatedEvidence: string;
};

export type Catalog =
  | { kind: 'capabilities'; items: CapabilityItem[] }
  | { kind: 'enum'; name: string; values: readonly string[] }
  | { kind: 'regulations'; items: RegulationItem[] }
  | { kind: 'frameworks'; items: FrameworkItem[] };
