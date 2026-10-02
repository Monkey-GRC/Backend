// Catálogo de capacidades automáticas ac_01 a ac_06 (modelo-datos.md §6.3, contracts/enums.md).
// ac_01 a ac_03 salen tal cual del contrato de onboarding-technical-control.md. ac_04 a ac_06 no
// tienen ficha completa en el brain: se completaron por analogía con sus equivalentes en nube y
// quedan marcadas «por revisar con el comité» en deuda-tecnica.md (D46).
//
// `provider` es INTERNO y confidencial: existe en la tabla porque el modelo lo pide, vive solo en
// este seed y nunca sale en un response, un log ni una pantalla. No va en `src/`.
export type CapabilitySeed = {
  catalogCode: string;
  category: string;
  supportedPlatforms: string[];
  method: string;
  requiredPermissions: string[];
  provider: string;
  baseFrequency: string;
  generatedEvidence: string;
};

const PROVIDER = 'wazuh';
const SERVERS = ['Linux', 'Windows', 'HP-UX', 'AIX', 'Solaris'];
const SERVER_EVIDENCE = 'Configuración del sistema operativo, cuentas de usuario y registros de eventos del servidor';
const DB_EVIDENCE = 'Configuración, accesos y registros de auditoría de la base de datos';

export const CAPABILITY_SEED: CapabilitySeed[] = [
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
    supportedPlatforms: SERVERS,
    method: 'Instalar agente ligero de Monkey (o agentless SSH/WinRM)',
    requiredPermissions: ['sudo o administrador para la instalación'],
    provider: PROVIDER,
    baseFrequency: 'continuo',
    generatedEvidence: SERVER_EVIDENCE,
  },
  {
    catalogCode: 'ac_03',
    category: 'Bases de datos en nube',
    supportedPlatforms: ['PostgreSQL', 'MySQL', 'SQL Server', 'Oracle', 'MongoDB'],
    method: 'Agente en host + usuario de solo lectura',
    requiredPermissions: ['Usuario de solo lectura de auditoría'],
    provider: PROVIDER,
    baseFrequency: 'continuo',
    generatedEvidence: DB_EVIDENCE,
  },
  {
    catalogCode: 'ac_04',
    category: 'Servidores on-premise',
    supportedPlatforms: SERVERS,
    method: 'Instalar agente ligero de Monkey (o agentless SSH/WinRM)',
    requiredPermissions: ['sudo o administrador para la instalación'],
    provider: PROVIDER,
    baseFrequency: 'continuo',
    generatedEvidence: SERVER_EVIDENCE,
  },
  {
    catalogCode: 'ac_05',
    category: 'Bases de datos on-premise',
    supportedPlatforms: ['PostgreSQL', 'MySQL/MariaDB', 'SQL Server', 'Oracle', 'MongoDB'],
    method: 'Agente en host + usuario de solo lectura',
    requiredPermissions: ['Usuario de solo lectura de auditoría'],
    provider: PROVIDER,
    baseFrequency: 'continuo',
    generatedEvidence: DB_EVIDENCE,
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
