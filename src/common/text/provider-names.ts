// El proveedor de las sondas es confidencial frente al cliente (SEG-39, D70): ningún texto que ve el cliente lo nombra. Aquí viven las palabras, en un solo sitio:
// lo usan `catalog:load`, el alta de pruebas y los hallazgos de nube (D90).
export const PROVIDER_PATTERN = /wazuh|prowler/i;

export const namesProvider = (text: string): boolean => PROVIDER_PATTERN.test(text);

// El texto tal cual si es neutro; null si nombra al proveedor (quien lo muestra elige qué poner en su lugar).
export const publicText = (text: string | null | undefined): string | null => {
  if (!text) return null;
  return namesProvider(text) ? null : text;
};
