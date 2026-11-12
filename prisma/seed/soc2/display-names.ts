import { TestRow } from './types';

// El nombre que ve el CLIENTE de cada prueba (D70). De una prueba el cliente ve solo su resultado y un nombre neutro que escribe Monkey; los textos del comité
// (objetivo, herramienta, limitaciones…) no salen. `tests.display_name` es nullable a propósito y se carga como dato, no en la migración: en un entorno nuevo la
// migración corre antes de que existan las pruebas.
//
// La regla es una sola: el nombre neutro es el nombre del comité (hoja «Pruebas», columna NOMBRE DEL TEST) y solo se reescribe cuando ese nombre nombra al
// proveedor de la sonda, que es confidencial frente al cliente (philosophy.md, SEG-39). Hoy son 4 pruebas, las que fija D70.
export const NEUTRAL_NAME_OVERRIDES: Readonly<Record<string, string>> = {
  'T-SRV-001': 'Evaluación de configuración/hardening de servidores',
  'T-SRV-002': 'Monitoreo de integridad de archivos críticos',
  'T-SRV-003': 'Detección de vulnerabilidades en servidores',
  'T-SRV-005': 'Validación de gestión y monitoreo de logs de servidores',
};

// El nombre neutro en inglés (MD-211). Solo las pruebas de nube (T-CLD) lo tienen por ahora; el resto se muestra con su nombre en español. Mismo dato que la migración
// 20261112000300_test_display_name_en. Ningún nombre nombra al proveedor de la sonda.
export const DISPLAY_NAMES_EN: Readonly<Record<string, string>> = {
  'T-CLD-001': 'Assessment of IAM, MFA and privileged accounts at the cloud provider',
  'T-CLD-002': 'Assessment of encryption, network, public exposure and storage in the cloud',
  'T-CLD-003': 'Assessment of logging, monitoring and backups/replication in the cloud',
  'T-CLD-004': 'Verification of capacity and performance monitoring in the cloud (Azure) with threshold alerts',
  'T-CLD-005': 'Operational verification of log ingestion, retention and review (SIEM/log management)',
  'T-CLD-006': 'Operational verification of infrastructure performance monitoring with threshold alerts (Azure)',
  'T-CLD-007': 'Verification of replication failure alerts to administrators',
  'T-CLD-008': 'Operational verification of production backups, separate location and restore tests',
  'T-CLD-009': 'Verification of the multi-availability-zone architecture in production',
  'T-CLD-010': 'Intrusion detection and network threat monitoring in the cloud',
  'T-CLD-011': 'Validation of the password and authentication policy at the cloud provider (IAM/Entra ID)',
};

// La descripción corta que ve el cliente junto al nombre (D82): el objetivo del comité (hoja «Pruebas», columna OBJETIVO DEL TEST), reescrito solo en las mismas cuatro
// pruebas, cuyo objetivo nombra al proveedor y sus módulos. Dice de qué va la prueba, en una o dos frases; no es el «por qué importa» ni el paso a paso.
export const NEUTRAL_DESCRIPTION_OVERRIDES: Readonly<Record<string, string>> = {
  'T-SRV-001': 'Verificar que los servidores Windows/Linux en alcance cumplen la línea base de configuración segura (hardening) definida, comprobándola de forma automática sobre el 100% de los servidores.',
  'T-SRV-002': 'Verificar que se monitorea la integridad de archivos y directorios críticos de los servidores en alcance y que las alteraciones generan alertas que se gestionan.',
  'T-SRV-003': 'Verificar que se detectan y gestionan las vulnerabilidades del sistema operativo y de los paquetes instalados en los servidores en alcance.',
  'T-SRV-005': 'Comprobar que los servidores en alcance envían sus logs a la plataforma de gestión centralizada y que se generan y gestionan alertas.',
};

// Proveedores de la sonda que nunca se nombran al cliente. «SIEM» o «EDR» son categorías de producto, no un proveedor.
export const PROVIDER_PATTERN = /wazuh|prowler/i;

/** El nombre neutro de una prueba: el del comité, o el que lo reescribe cuando el del comité nombra al proveedor. */
export function displayNameOf(test: Pick<TestRow, 'code' | 'name'>): string {
  return NEUTRAL_NAME_OVERRIDES[test.code] ?? test.name;
}

/** La descripción corta de una prueba: el objetivo del comité, o la que lo reescribe cuando el objetivo nombra al proveedor. */
export function displayDescriptionOf(test: Pick<TestRow, 'code' | 'objective'>): string {
  return NEUTRAL_DESCRIPTION_OVERRIDES[test.code] ?? test.objective;
}

/** El nombre neutro en inglés de una prueba, o null si aún no está traducido. */
export function displayNameEnOf(test: Pick<TestRow, 'code'>): string | null {
  return DISPLAY_NAMES_EN[test.code] ?? null;
}
