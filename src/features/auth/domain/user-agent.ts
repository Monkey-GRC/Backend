export type DeviceType = 'computer' | 'mobile' | 'tablet';
export type UserAgentSummary = { browser: string | null; os: string | null; deviceType: DeviceType | null };

// Orden importa: Edge, Opera y otros dicen «Chrome» y Chrome dice «Safari»; iOS dice «Mac OS X».
const BROWSERS: Array<[RegExp, string]> = [
  [/\b(?:Edg|EdgA|EdgiOS|Edge)\//, 'Edge'],
  [/\b(?:OPR|Opera)\//, 'Opera'],
  [/\bSamsungBrowser\//, 'Samsung Internet'],
  [/\bFirefox\/|\bFxiOS\//, 'Firefox'],
  [/\bChrome\/|\bCriOS\//, 'Chrome'],
  [/\bSafari\//, 'Safari'],
];

const SYSTEMS: Array<[RegExp, string]> = [
  [/\bWindows\b/, 'Windows'],
  [/\b(?:iPhone|iPad|iPod)\b/, 'iOS'],
  [/\bAndroid\b/, 'Android'],
  [/\bCrOS\b/, 'ChromeOS'],
  [/\bMac OS X\b|\bMacintosh\b/, 'macOS'],
  [/\bUbuntu\b/, 'Ubuntu'],
  [/\bLinux\b|\bX11\b/, 'Linux'],
];

const first = (patterns: Array<[RegExp, string]>, ua: string): string | null => patterns.find(([re]) => re.test(ua))?.[1] ?? null;

const COMPUTER_SYSTEMS = new Set(['Windows', 'macOS', 'Linux', 'Ubuntu', 'ChromeOS']);

// Para las filas guardadas antes de que existiera `device_type`: se deduce del sistema ya guardado.
export function deviceTypeOfOs(os: string | null): DeviceType | null {
  if (!os) return null;
  if (os === 'Android' || os === 'iOS') return 'mobile';
  return COMPUTER_SYSTEMS.has(os) ? 'computer' : null;
}

// Un iPad o un Android sin `Mobile` es tableta; un iPhone, iPod o un Android con `Mobile`, celular; los demás sistemas de escritorio, computador.
function deviceTypeOf(ua: string, os: string | null): DeviceType | null {
  if (/\biPad\b/.test(ua)) return 'tablet';
  if (os === 'Android') return /\bMobile\b/.test(ua) ? 'mobile' : 'tablet';
  if (os === 'iOS') return 'mobile';
  return deviceTypeOfOs(os);
}

// Resumen para que la persona reconozca el dispositivo («Chrome en Windows»). Texto libre del cliente: solo sale un nombre de la lista, nunca el original.
export function summarizeUserAgent(userAgent: string | undefined): UserAgentSummary {
  const ua = (userAgent ?? '').slice(0, 512);
  const os = first(SYSTEMS, ua);
  return { browser: first(BROWSERS, ua), os, deviceType: deviceTypeOf(ua, os) };
}
