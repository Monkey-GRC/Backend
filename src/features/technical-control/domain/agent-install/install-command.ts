// El comando (o el archivo) con el que el cliente instala la sonda en su servidor (D113). Dominio puro: las plantillas de los instaladores se le pasan.
//
// Cada valor se valida con una forma ESTRICTA antes de entrar a un comando: ninguno puede traer una comilla, un espacio ni un punto y coma. Es lo que impide que un dato raro
// (un nombre de servidor, una configuración equivocada) se convierta en una orden en la máquina del cliente.

export type InstallParams = {
  // `linux` o `windows`: de la versión del sistema que el cliente declaró. Los demás todavía no tienen instalador.
  os: string;
  // El id del activo: es el nombre del agente en la sonda.
  assetId: string;
  // La clave del agente (base64), que sale una sola vez.
  key: string;
  managerHost: string;
  managerPort: number;
  // La versión FIJADA del agente (la misma del manager).
  agentVersion: string;
  // Dónde sirve el backend los instaladores, sin barra final (`https://api.ejemplo.com/v1/install`).
  installerBaseUrl: string;
};

export type InstallOption =
  | { kind: 'command'; label: string; shell: 'bash' | 'powershell'; value: string }
  // Un archivo que el navegador descarga: su contenido ya lleva los datos de ESE servidor (y por eso es sensible igual que el comando).
  | { kind: 'file'; label: string; filename: string; content: string };

export type InstallTemplates = { linuxScript: string; windowsScript: string; windowsParamsBlock: string };

const HOST = /^[A-Za-z0-9]([A-Za-z0-9.-]{0,251}[A-Za-z0-9])?$/;
const UUID = /^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/;
const VERSION = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const KEY = /^[A-Za-z0-9+/]{40,600}={0,2}$/;
const URL_BASE = /^https?:\/\/[A-Za-z0-9.-]+(:[0-9]{2,5})?(\/[A-Za-z0-9._~-]+)*$/;

export const SUPPORTED_INSTALL_OS = ['linux', 'windows'] as const;

/** Qué está mal en lo que se va a poner en un comando. Vacío = se puede construir. */
export function invalidInstallParams(p: InstallParams): string[] {
  const bad: string[] = [];
  if (!(SUPPORTED_INSTALL_OS as readonly string[]).includes(p.os)) bad.push('os');
  if (!UUID.test(p.assetId)) bad.push('assetId');
  if (!KEY.test(p.key)) bad.push('key');
  if (!HOST.test(p.managerHost)) bad.push('managerHost');
  if (!Number.isInteger(p.managerPort) || p.managerPort < 1 || p.managerPort > 65535) bad.push('managerPort');
  if (!VERSION.test(p.agentVersion)) bad.push('agentVersion');
  if (!URL_BASE.test(p.installerBaseUrl)) bad.push('installerBaseUrl');
  return bad;
}

export function buildInstallOptions(p: InstallParams, t: InstallTemplates): InstallOption[] {
  const bad = invalidInstallParams(p);
  // El mensaje nombra los CAMPOS que fallan, nunca sus valores (uno es la clave).
  if (bad.length > 0) throw new Error(`Parámetros de instalación inválidos: ${bad.join(', ')}`);
  const base = p.installerBaseUrl;
  const args = (flag: string, value: string) => `${flag} '${value}'`;

  if (p.os === 'linux') {
    const flags = [args('--manager', p.managerHost), `--port ${p.managerPort}`, args('--name', p.assetId), args('--version', p.agentVersion), args('--key', p.key)].join(' ');
    return [{ kind: 'command', label: 'Terminal', shell: 'bash', value: `curl -fsSL '${base}/agent.sh' | sudo bash -s -- ${flags}` }];
  }

  // Windows: el comando se pega TAL CUAL en una consola de PowerShell abierta como administrador. El instalador se ejecuta con una política que solo vale para ese archivo.
  const psArgs = [args('-Manager', p.managerHost), `-Port ${p.managerPort}`, args('-Name', p.assetId), args('-Version', p.agentVersion), args('-Key', p.key)].join(' ');
  const command = `$p = Join-Path $env:TEMP 'monkey-agent.ps1'; Invoke-WebRequest -UseBasicParsing '${base}/agent.ps1' -OutFile $p; powershell -NoProfile -ExecutionPolicy Bypass -File $p ${psArgs}`;
  const embedded = t.windowsScript.replace('__PARAMS__', [
    `$Manager = '${p.managerHost}'`,
    `$Port = ${p.managerPort}`,
    `$Name = '${p.assetId}'`,
    `$Version = '${p.agentVersion}'`,
    `$Key = '${p.key}'`,
  ].join('\n'));
  return [
    { kind: 'command', label: 'PowerShell', shell: 'powershell', value: command },
    { kind: 'file', label: 'PowerShell', filename: 'instalar-monkey.ps1', content: embedded },
  ];
}

/** El instalador tal como se sirve (sin ningún dato de un servidor): Linux se descarga tal cual; el de Windows, con su bloque `param(...)`. */
export function servedInstaller(os: 'linux' | 'windows', t: InstallTemplates): string {
  return os === 'linux' ? t.linuxScript : t.windowsScript.replace('__PARAMS__', t.windowsParamsBlock);
}
