// Clasifica una política de configuración del catálogo del comité (hoja «Checks») en sistema operativo, distribución y versión (D113).
// Dominio puro: sin base de datos ni Excel. Es lo que permite que el cliente elija «Ubuntu → 22.04 LTS» y que Monkey sepa qué política esperar.
//
// El comité nombra cada política por su NOMBRE («CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0.») y la sonda por su id (`cis_ubuntu22-04`): de ahí que esta
// clasificación se haga sobre el nombre y que el cargador exija que TODAS las políticas se reconozcan (si llega una nueva y no se reconoce, falla en voz alta
// en vez de ofrecerla mal).

// El código del sistema coincide con el de la plataforma del catálogo de conexiones (`capability_platforms.code`): `linux`, `windows`…
export type OsCode = 'linux' | 'windows' | 'macos' | 'solaris' | 'hp_ux';

export type PolicyClass = {
  // null: no es un sistema operativo (un motor de base de datos o un servidor de aplicaciones). Se guarda, pero no se ofrece como versión de un servidor.
  osCode: OsCode | null;
  // Código estable de la distribución (`ubuntu`, `windows_server`…). Agrupa las versiones en la pantalla.
  distribution: string | null;
  // La marca tal cual, que no se traduce. Las que no son una marca (`linux_generic`, `windows_desktop`) se traducen por su código.
  distributionName: string | null;
  // La versión como la lee el cliente («22.04 LTS», «2022», «13 Ventura»).
  versionLabel: string | null;
  // Para ordenar de la más nueva a la más vieja dentro de una distribución.
  sortKey: number[];
};

const NOT_OS: PolicyClass = { osCode: null, distribution: null, distributionName: null, versionLabel: null, sortKey: [] };

const n = (s: string | undefined): number => Number.parseInt(s ?? '0', 10);
const cls = (osCode: OsCode, distribution: string, distributionName: string, versionLabel: string, sortKey: number[]): PolicyClass => ({ osCode, distribution, distributionName, versionLabel, sortKey });

// Los nombres de CIS traen guiones bajos en algunas políticas y puntos al final: se normalizan antes de leerlos.
const clean = (name: string): string => name.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

// Cada regla recibe el nombre ya limpio y devuelve null si no reconoce la versión (el cargador lo trata como error).
type Rule = (name: string) => PolicyClass | null;

const major = (re: RegExp, build: (v: string) => PolicyClass): Rule => (name) => {
  const m = re.exec(name);
  return m ? build(m[1]) : null;
};

const RULES: Record<string, Rule> = {
  Windows: (name) => {
    const server = /Windows Server (\d{4})( R2)?/i.exec(name);
    if (server) return cls('windows', 'windows_server', 'Windows Server', `${server[1]}${server[2] ? ' R2' : ''}`, [n(server[1]), server[2] ? 1 : 0]);
    const desktop = /Windows (10|11)\b/.exec(name);
    return desktop ? cls('windows', 'windows_desktop', 'Windows', desktop[1], [n(desktop[1])]) : null;
  },
  Ubuntu: (name) => {
    const m = /Ubuntu Linux (\d{2})\.(\d{2})( LTS)?/.exec(name);
    return m ? cls('linux', 'ubuntu', 'Ubuntu', `${m[1]}.${m[2]}${m[3] ?? ''}`, [n(m[1]), n(m[2])]) : null;
  },
  Debian: major(/Debian Linux (\d+)/, (v) => cls('linux', 'debian', 'Debian', v, [n(v)])),
  CentOS: major(/CentOS Linux (\d+)/, (v) => cls('linux', 'centos', 'CentOS', v, [n(v)])),
  'Red Hat': major(/Red Hat Enterprise Linux (\d+)/, (v) => cls('linux', 'rhel', 'Red Hat Enterprise Linux', v, [n(v)])),
  AlmaLinux: major(/Alma Linux (\d+)/i, (v) => cls('linux', 'alma', 'AlmaLinux', v, [n(v)])),
  'Rocky Linux': major(/Rocky Linux (\d+)/, (v) => cls('linux', 'rocky', 'Rocky Linux', v, [n(v)])),
  Ol: major(/Oracle Linux (\d+)/, (v) => cls('linux', 'oracle_linux', 'Oracle Linux', v, [n(v)])),
  'SUSE Linux Enterprise': major(/Enterprise (\d+)/, (v) => cls('linux', 'suse', 'SUSE Linux Enterprise', v, [n(v)])),
  'Amazon Linux': (name) => {
    const m = /Amazon Linux (2023|2)\b/.exec(name);
    // «CIS Amazon Linux Benchmark» sin número es la primera generación (así la nombra CIS); las demás llevan su versión.
    return m ? cls('linux', 'amazon_linux', 'Amazon Linux', m[1], [n(m[1])]) : /Amazon Linux Benchmark/.test(name) ? cls('linux', 'amazon_linux', 'Amazon Linux', '1', [1]) : null;
  },
  // CIS Distribution Independent Linux: sirve a una distribución que no está en la lista. La etiqueta se traduce (no es una marca).
  Generic: (name) => (/Distribution Independent Linux/.test(name) ? cls('linux', 'linux_generic', 'Linux', 'generic', [0]) : null),
  macOS: (name) => {
    const m = /macOS (\d+)(?:\.(\d+))?\s*(.*?)\s*Benchmark/.exec(name);
    if (!m) return null;
    // 10.11 … 10.15 se distinguen por el segundo número; de macOS 11 en adelante, por el mayor y el nombre de la versión.
    if (n(m[1]) === 10) return cls('macos', 'macos', 'macOS', `10.${m[2]}`, [10, n(m[2])]);
    return cls('macos', 'macos', 'macOS', m[3] ? `${m[1]} ${m[3]}` : m[1], [n(m[1]), 0]);
  },
  Sunos: major(/Solaris (\d+(?:\.\d+)?)/, (v) => cls('solaris', 'solaris', 'Oracle Solaris', v, v.split('.').map(n))),
  'HP-UX': major(/HP-UX (\d+i)/, (v) => cls('hp_ux', 'hp_ux', 'HP-UX', v, [n(v)])),
};

// Columnas «Plataforma» del catálogo que NO son un sistema operativo (motores de base de datos y servidores de aplicaciones): se cargan, pero no se ofrecen
// como versión de un servidor. Entrarán con las conexiones de bases de datos (`ac_03`, `ac_05`).
const NOT_AN_OS = new Set(['Aplicaciones', 'Oracledb', 'Nginx', 'Mongodb']);

/**
 * `null` si la plataforma es desconocida o la política no se reconoce: el cargador falla en voz alta (una política nueva del comité se revisa a mano,
 * no se ofrece al cliente con una etiqueta adivinada).
 */
export function classifyPolicy(excelPlatform: string, policyName: string): PolicyClass | null {
  if (NOT_AN_OS.has(excelPlatform)) return NOT_OS;
  const rule = RULES[excelPlatform];
  return rule ? rule(clean(policyName)) : null;
}

/**
 * El código de una versión en la API (`ubuntu_22_04_lts`, `windows_server_2012_r2`, `macos_13_ventura`). Lo define Monkey a partir de la distribución y la
 * versión, nunca del id que use la sonda: es lo que viaja entre la pantalla y el Backend. `linux_generic` ya es único, no lleva versión.
 */
export function versionCode(distribution: string, versionLabel: string): string {
  if (versionLabel === 'generic') return distribution;
  const slug = `${distribution} ${versionLabel}`.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return slug;
}

// Ordena de la más nueva a la más vieja (para listar primero lo más probable), comparando las claves numéricas.
export function compareNewestFirst(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const d = (b[i] ?? 0) - (a[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}
