// Catálogos pequeños y estables que no salen del seed de SOC 2: regulaciones (MD-75) y capacidades
// automáticas ac_01…ac_06 (MD-83). Viven aquí como datos versionados porque son seis y catorce filas
// que el comité fijó en `TSC INTERGRAL SOC 2 DETALLADO VF.xlsx` y en `contracts/`.
//
// Las listas de opciones del Componente 1 (tamaño, industria, modelo de negocio, años en operación,
// madurez, países) NO se siembran: son enums de Postgres (migración 18 y siguientes), no tablas. La
// única que sí es tabla es `regulations`.

export interface RegulationSeed {
  code: string;
  name: string;
  jurisdiction: string;
}

// Fuente: contracts/enums.md `regulation` (14 valores) y hoja "Contexto Empresa" del Excel, fila
// "Regulaciones aplicables a la empresa". El nombre va sin el país (contracts/modules/onboarding-
// organizational-context.md: "Ley 1581", jurisdicción "CO"). `none` y `other` son las dos opciones de salida
// del multi-select, no leyes: su jurisdicción es "n/a". `regulations` no se puntúa (D10).
export const REGULATIONS: RegulationSeed[] = [
  { code: 'ley_1581_co', name: 'Ley 1581', jurisdiction: 'CO' },
  { code: 'lfpdppp_mx', name: 'LFPDPPP', jurisdiction: 'MX' },
  { code: 'ley_29733_pe', name: 'Ley 29733', jurisdiction: 'PE' },
  { code: 'ley_19628_cl', name: 'Ley 19628', jurisdiction: 'CL' },
  { code: 'ley_25326_ar', name: 'Ley 25326', jurisdiction: 'AR' },
  { code: 'lgpd_br', name: 'LGPD', jurisdiction: 'BR' },
  { code: 'gdpr_eu', name: 'GDPR', jurisdiction: 'EU' },
  { code: 'lopdgdd_es', name: 'LOPDGDD', jurisdiction: 'ES' },
  { code: 'hipaa_us', name: 'HIPAA', jurisdiction: 'US' },
  { code: 'ccpa_cpra_us', name: 'CCPA/CPRA', jurisdiction: 'US' },
  { code: 'glba_us', name: 'GLBA', jurisdiction: 'US' },
  { code: 'pci_dss', name: 'PCI DSS', jurisdiction: 'global' },
  { code: 'none', name: 'Ninguna', jurisdiction: 'n/a' },
  { code: 'other', name: 'Otra', jurisdiction: 'n/a' },
];

export interface CapabilitySeed {
  catalogCode: string;
  category: string;
  supportedPlatforms: string[];
  method: string;
  requiredPermissions: string[];
  // INTERNO Y CONFIDENCIAL: nunca sale en una respuesta, pantalla, log o texto de IA (CLAUDE.md, MD-87).
  provider: string;
  baseFrequency: string;
  generatedEvidence: string;
}

// Fuente: hoja "Activos del Servicio (SCOPE)", BLOQUE 2 — catálogo de conexiones (AC-01…AC-06): categoría,
// plataformas, permisos y frecuencia. El método y la evidencia generada van con la redacción que ya consume el
// frontend (contracts/modules/onboarding-technical-control.md) y que ya estaba cargada en dev: es la versión del
// Excel dicha para el cliente, sin jerga ("Hardening, parches, FIM" → "Configuración del sistema operativo…").
// La columna "Recolección interna — CONFIDENCIAL" del Excel es lo que hace `provider`: no se guarda su texto.
const PROVIDER = 'wazuh';
const AGENT_PERMISSION = 'sudo o administrador para la instalación';
const DB_PERMISSION = 'Usuario de solo lectura de auditoría';

export const CAPABILITIES: CapabilitySeed[] = [
  {
    catalogCode: 'ac_01',
    category: 'Servicios en nube (gestionados, sin servidor)',
    supportedPlatforms: ['AWS', 'Azure', 'GCP', 'Microsoft 365', 'Google Workspace'],
    method: 'Autorización API / rol de solo lectura u OAuth',
    requiredPermissions: ['Rol de solo lectura', 'Consentimiento OAuth'],
    provider: PROVIDER,
    baseFrequency: 'cada 6-24 h',
    generatedEvidence: 'Postura de configuración y registros de actividad de la nube',
  },
  {
    catalogCode: 'ac_02',
    category: 'Servidores en nube / VPS',
    supportedPlatforms: ['Linux', 'Windows', 'HP-UX', 'AIX', 'Solaris'],
    method: 'Instalar agente ligero de Monkey (o agentless SSH/WinRM)',
    requiredPermissions: [AGENT_PERMISSION],
    provider: PROVIDER,
    baseFrequency: 'continuo',
    generatedEvidence: 'Configuración del sistema operativo, cuentas de usuario y registros de eventos del servidor',
  },
  {
    catalogCode: 'ac_03',
    category: 'Bases de datos en nube',
    supportedPlatforms: ['PostgreSQL', 'MySQL', 'SQL Server', 'Oracle', 'MongoDB'],
    method: 'Agente en host + usuario de solo lectura',
    requiredPermissions: [DB_PERMISSION],
    provider: PROVIDER,
    baseFrequency: 'continuo',
    generatedEvidence: 'Configuración, accesos y registros de auditoría de la base de datos',
  },
  {
    catalogCode: 'ac_04',
    category: 'Servidores on-premise',
    supportedPlatforms: ['Linux', 'Windows', 'HP-UX', 'AIX', 'Solaris'],
    method: 'Instalar agente ligero de Monkey (o agentless SSH/WinRM)',
    requiredPermissions: [AGENT_PERMISSION],
    provider: PROVIDER,
    baseFrequency: 'continuo',
    generatedEvidence: 'Configuración del sistema operativo, cuentas de usuario y registros de eventos del servidor',
  },
  {
    catalogCode: 'ac_05',
    category: 'Bases de datos on-premise',
    supportedPlatforms: ['PostgreSQL', 'MySQL/MariaDB', 'SQL Server', 'Oracle', 'MongoDB'],
    method: 'Agente en host + usuario de solo lectura',
    requiredPermissions: [DB_PERMISSION],
    provider: PROVIDER,
    baseFrequency: 'continuo',
    generatedEvidence: 'Configuración, accesos y registros de auditoría de la base de datos',
  },
  {
    catalogCode: 'ac_06',
    category: 'Endpoints / estaciones de trabajo',
    supportedPlatforms: ['Windows', 'macOS', 'Linux'],
    method: 'Instalar agente ligero de Monkey',
    requiredPermissions: ['Permisos de administrador local para la instalación'],
    provider: PROVIDER,
    baseFrequency: 'continuo',
    generatedEvidence: 'Estado de cifrado, parches, antivirus y configuración de las estaciones de trabajo',
  },
];

// Qué conexiones se ofrecen según el escenario de despliegue (contracts/enums.md `deployment_scenario`).
// No se guarda en una tabla: es una regla que el servicio de catálogo aplica. `hybrid` ofrece las seis.
export const CAPABILITIES_BY_SCENARIO: Record<string, string[]> = {
  cloud_managed_only: ['ac_01'],
  cloud_with_servers: ['ac_01', 'ac_02', 'ac_03'],
  on_premise: ['ac_04', 'ac_05', 'ac_06'],
  hybrid: ['ac_01', 'ac_02', 'ac_03', 'ac_04', 'ac_05', 'ac_06'],
};
