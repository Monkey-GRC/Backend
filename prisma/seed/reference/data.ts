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

// Normas de PROTECCIÓN DE DATOS PERSONALES (D51). Fuente: contracts/enums.md `regulation` y hoja
// "Contexto Empresa" del Excel, depurada el 2026-10-05 por pedido del comité: PCI DSS salió porque es un
// estándar de la industria de tarjetas (y ya es un marco), no una norma de protección de datos. HIPAA y GLBA
// se quedan: son leyes sectoriales de EE. UU. que protegen datos de salud y financieros. Se añadieron la
// ley chilena que reemplaza a la 19.628 desde el 1 de diciembre de 2026 y las leyes de Uruguay, Ecuador,
// Panamá y Costa Rica. El nombre va sin el país. `none` y `other` son las dos opciones de salida del
// multi-select, no leyes: su jurisdicción es "n/a". `regulations` no se puntúa (D10).
export const REGULATIONS: RegulationSeed[] = [
  { code: 'ley_1581_co', name: 'Ley 1581', jurisdiction: 'CO' },
  { code: 'lfpdppp_mx', name: 'LFPDPPP', jurisdiction: 'MX' },
  { code: 'ley_29733_pe', name: 'Ley 29733', jurisdiction: 'PE' },
  { code: 'ley_19628_cl', name: 'Ley 19628', jurisdiction: 'CL' },
  { code: 'ley_21719_cl', name: 'Ley 21719', jurisdiction: 'CL' },
  { code: 'ley_25326_ar', name: 'Ley 25326', jurisdiction: 'AR' },
  { code: 'ley_18331_uy', name: 'Ley 18331', jurisdiction: 'UY' },
  { code: 'lopdp_ec', name: 'LOPDP', jurisdiction: 'EC' },
  { code: 'ley_81_pa', name: 'Ley 81', jurisdiction: 'PA' },
  { code: 'ley_8968_cr', name: 'Ley 8968', jurisdiction: 'CR' },
  { code: 'lgpd_br', name: 'LGPD', jurisdiction: 'BR' },
  { code: 'gdpr_eu', name: 'GDPR', jurisdiction: 'EU' },
  { code: 'lopdgdd_es', name: 'LOPDGDD', jurisdiction: 'ES' },
  { code: 'hipaa_us', name: 'HIPAA', jurisdiction: 'US' },
  { code: 'ccpa_cpra_us', name: 'CCPA/CPRA', jurisdiction: 'US' },
  { code: 'glba_us', name: 'GLBA', jurisdiction: 'US' },
  { code: 'none', name: 'Ninguna', jurisdiction: 'n/a' },
  { code: 'other', name: 'Otra', jurisdiction: 'n/a' },
];

export interface FrameworkOfferSeed {
  code: string;
  name: string;
  version: string;
  type: 'attestation' | 'certification' | 'standard' | 'regulation';
  scopeDescription: string;
}

// Marcos que Monkey ofrece pero todavía no tiene construidos (D50): se siembran como `coming_soon`, sin
// requisitos, para mostrarlos como gancho comercial. SOC 2 NO va aquí: lo carga `catalog:load` con su catálogo
// completo y como `available`. Versiones y alcance según frameworks/*.md del brain (verificados el 2026-07-22);
// el orden es el de demanda (Drata, ACC 2025): ISO 27001, HIPAA, GDPR, PCI DSS, NIST CSF, SOC 1.
export const FRAMEWORK_OFFERS: FrameworkOfferSeed[] = [
  {
    code: 'iso27001',
    name: 'ISO 27001',
    version: '2022',
    type: 'certification',
    scopeDescription:
      'Certificación internacional de un sistema de gestión de seguridad de la información, con 93 controles en el Anexo A.',
  },
  {
    code: 'hipaa',
    name: 'HIPAA',
    version: 'Security Rule',
    type: 'regulation',
    scopeDescription:
      'Salvaguardas administrativas, físicas y técnicas para proteger la información de salud electrónica en EE. UU.',
  },
  {
    code: 'gdpr',
    name: 'GDPR',
    version: 'Reglamento (UE) 2016/679',
    type: 'regulation',
    scopeDescription:
      'Reglamento europeo de protección de datos personales; aplica a quien trate datos de personas en la UE.',
  },
  {
    code: 'pci_dss',
    name: 'PCI DSS',
    version: '4.0.1',
    type: 'standard',
    scopeDescription:
      'Estándar de la industria de tarjetas de pago para proteger los datos de los titulares, con 12 requisitos.',
  },
  {
    code: 'nist_csf',
    name: 'NIST CSF',
    version: '2.0',
    type: 'standard',
    scopeDescription:
      'Marco voluntario de ciberseguridad organizado en seis funciones: gobernar, identificar, proteger, detectar, responder y recuperar.',
  },
  {
    code: 'soc1',
    name: 'SOC 1',
    version: 'SSAE 18',
    type: 'attestation',
    scopeDescription:
      'Informe de atestación sobre los controles de una organización de servicios que afectan el reporte financiero de sus clientes.',
  },
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
