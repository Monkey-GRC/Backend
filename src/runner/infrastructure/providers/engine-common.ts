// Lo que el motor tiene igual en todas las nubes: dónde deja su resultado y los argumentos de salida. Cada perfil aporta solo lo suyo.
export const ENGINE_OUTPUT_DIR = '/home/prowler/output';
export const ENGINE_OUTPUT_PATH = `${ENGINE_OUTPUT_DIR}/scan.ocsf.json`;

export const commonEngineArgs = (): string[] => [
  '-M', 'json-ocsf', '-F', 'scan', '-o', ENGINE_OUTPUT_DIR,
  '--no-banner',
  // El motor sale con código 3 cuando hay hallazgos; eso no es un fallo de la corrida.
  '--ignore-exit-code-3',
  '--log-level', 'ERROR',
];
