// Una opción de una lista desplegable: el valor que viaja y, para las regulaciones, su ficha.
export type RegulationItem = {
  code: string;
  name: string;
  jurisdiction: string;
};

export type Catalog =
  | { kind: 'enum'; name: string; values: readonly string[] }
  | { kind: 'regulations'; items: RegulationItem[] };
