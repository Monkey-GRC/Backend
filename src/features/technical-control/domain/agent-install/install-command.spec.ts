import { spawnSync } from 'node:child_process';
import { AGENT_INSTALL_PS1, AGENT_INSTALL_PS1_PARAMS } from '../../infrastructure/templates/agent-install.ps1.template';
import { AGENT_INSTALL_SH } from '../../infrastructure/templates/agent-install.sh.template';
import { buildInstallOptions, InstallParams, InstallTemplates, invalidInstallParams, servedInstaller } from './install-command';

const ASSET = '78778a4a-6fef-45b0-ade1-2ad12b457c22';
// Una clave con la forma real: base64 de «001 <uuid> any <64 hex>» (110 caracteres decodificados).
const KEY = Buffer.from(`001 ${ASSET} any ${'a1'.repeat(32)}`).toString('base64');
const TEMPLATES: InstallTemplates = { linuxScript: AGENT_INSTALL_SH, windowsScript: AGENT_INSTALL_PS1, windowsParamsBlock: AGENT_INSTALL_PS1_PARAMS };
const params = (over: Partial<InstallParams> = {}): InstallParams => ({
  os: 'linux', assetId: ASSET, key: KEY, managerHost: 'sonda.monkey.example', managerPort: 1514, agentVersion: '4.14.6', installerBaseUrl: 'https://api.monkey.example/v1/install', ...over,
});

describe('buildInstallOptions (D113)', () => {
  it('Linux: UN comando, que baja el instalador de Monkey y le pasa los datos de ESTE servidor', () => {
    const [cmd, ...rest] = buildInstallOptions(params(), TEMPLATES);
    expect(rest).toEqual([]);
    expect(cmd).toEqual({
      kind: 'command', label: 'Terminal', shell: 'bash',
      value: `curl -fsSL 'https://api.monkey.example/v1/install/agent.sh' | sudo bash -s -- --manager 'sonda.monkey.example' --port 1514 --name '${ASSET}' --version '4.14.6' --key '${KEY}'`,
    });
  });

  it('Windows: un comando de PowerShell Y un archivo, y el archivo ya trae los datos del servidor', () => {
    const [cmd, file] = buildInstallOptions(params({ os: 'windows' }), TEMPLATES);
    expect(cmd).toMatchObject({ kind: 'command', shell: 'powershell' });
    expect((cmd as { value: string }).value).toContain(`-File $p -Manager 'sonda.monkey.example' -Port 1514 -Name '${ASSET}' -Version '4.14.6' -Key '${KEY}'`);
    expect((cmd as { value: string }).value).toContain(`Invoke-WebRequest -UseBasicParsing 'https://api.monkey.example/v1/install/agent.ps1'`);
    expect(file).toMatchObject({ kind: 'file', filename: 'instalar-monkey.ps1' });
    const content = (file as { content: string }).content;
    expect(content).toContain(`$Name = '${ASSET}'`);
    expect(content).toContain(`$Key = '${KEY}'`);
    expect(content).not.toContain('__PARAMS__');
    expect(content).not.toMatch(/^param\(/m); // el archivo ya completo no pide parámetros
  });

  it('el instalador que se SIRVE no lleva ningún dato de un servidor ni clave (es público)', () => {
    const linux = servedInstaller('linux', TEMPLATES);
    const win = servedInstaller('windows', TEMPLATES);
    for (const s of [linux, win]) {
      expect(s).not.toContain(KEY);
      expect(s).not.toContain(ASSET);
    }
    expect(win).toMatch(/^param\(/m);
    expect(win).not.toContain('__PARAMS__');
  });

  describe('lo que entra a un comando se valida con una forma ESTRICTA (nada se vuelve una orden)', () => {
    it.each([
      ['una comilla en el servidor de Monkey', { managerHost: "x';rm -rf /;'" }, 'managerHost'],
      ['un espacio en el servidor de Monkey', { managerHost: 'a b' }, 'managerHost'],
      ['un nombre que no es un identificador', { assetId: "srv'; id #" }, 'assetId'],
      ['una clave con caracteres fuera de base64', { key: `${KEY}';id;'` }, 'key'],
      ['una clave demasiado corta', { key: 'abc' }, 'key'],
      ['una versión con texto', { agentVersion: '4.14.6; id' }, 'agentVersion'],
      ['una versión incompleta', { agentVersion: '4.14' }, 'agentVersion'],
      ['un puerto fuera de rango', { managerPort: 70000 }, 'managerPort'],
      ['un puerto que no es entero', { managerPort: 1514.5 }, 'managerPort'],
      ['una dirección de instaladores con comillas', { installerBaseUrl: "https://x/'$(id)" }, 'installerBaseUrl'],
      ['una dirección de instaladores sin esquema', { installerBaseUrl: 'api.monkey.example/v1/install' }, 'installerBaseUrl'],
      ['un sistema sin instalador todavía (macOS)', { os: 'macos' }, 'os'],
    ])('rechaza %s', (_n, over, field) => {
      expect(invalidInstallParams(params(over as Partial<InstallParams>))).toContain(field);
      expect(() => buildInstallOptions(params(over as Partial<InstallParams>), TEMPLATES)).toThrow(/inválidos/);
    });

    it('el error nombra los CAMPOS, nunca los valores (uno es la clave)', () => {
      let message = '';
      try { buildInstallOptions(params({ key: 'CLAVE-SECRETA-QUE-NO-DEBE-SALIR!' }), TEMPLATES); } catch (e) { message = (e as Error).message; }
      expect(message).toContain('key');
      expect(message).not.toContain('CLAVE-SECRETA');
    });

    it('lo válido pasa: un servidor con puerto propio y con dirección IP', () => {
      expect(invalidInstallParams(params({ managerHost: '10.20.30.40', managerPort: 51514 }))).toEqual([]);
    });
  });
});

describe('los instaladores', () => {
  it('no llevan acentos graves ni caracteres que rompan una plantilla', () => {
    for (const s of [AGENT_INSTALL_SH, AGENT_INSTALL_PS1]) expect(s).not.toContain('`');
  });

  it('el de Linux valida cada argumento antes de tocar el servidor y exige administrador', () => {
    for (const re of [/MANAGER.*grep -Eq/, /PORT.*grep -Eq/, /NAME.*grep -Eq/, /VERSION.*grep -Eq/, /KEY.*grep -Eq/, /id -u/]) expect(AGENT_INSTALL_SH).toMatch(re);
    // la clave se comprueba contra el nombre de ESTE servidor ANTES de instalar nada
    expect(AGENT_INSTALL_SH.indexOf('La clave no corresponde')).toBeLessThan(AGENT_INSTALL_SH.indexOf('apt-get install'));
  });

  it('el de Linux nunca imprime la clave: donde aparece, solo se entrega a otro comando o a un archivo', () => {
    const lines = AGENT_INSTALL_SH.split('\n').filter((l) => /\$(KEY|LINE)\b/.test(l));
    expect(lines.length).toBeGreaterThan(0);
    // O va por una tubería (a grep, a base64), o a un archivo (>), o es la asignación de la variable: nunca a la pantalla ni a un mensaje de error.
    for (const l of lines) expect(l).toMatch(/\||>|^\s*(LINE|KEY)=|--key\)/);
    expect(AGENT_INSTALL_SH).not.toMatch(/(failm?|m) ["'][^"']*\$(KEY|LINE)/);
  });

  it('el de Windows verifica la firma del instalador antes de ejecutarlo', () => {
    expect(AGENT_INSTALL_PS1.indexOf('Get-AuthenticodeSignature')).toBeGreaterThan(-1);
    expect(AGENT_INSTALL_PS1.indexOf('Get-AuthenticodeSignature')).toBeLessThan(AGENT_INSTALL_PS1.indexOf('msiexec.exe'));
  });

  it('ningún texto que ve el cliente nombra a un proveedor de la sonda', () => {
    // Lo que se imprime: desde la llamada a `failm`, `m`, `Say` o `Fail` hasta el fin de esa línea (antes de ella puede haber código con nombres internos).
    const visible = (s: string) =>
      s.split('\n').map((l) => { const i = l.search(/(?:\bfailm|\bm|\bSay|\bFail)\s+['"]/); return i === -1 ? '' : l.slice(i); }).join('\n');
    expect(visible(AGENT_INSTALL_SH).length).toBeGreaterThan(200);
    expect(visible(AGENT_INSTALL_SH)).not.toMatch(/wazuh|prowler/i);
    expect(visible(AGENT_INSTALL_PS1).length).toBeGreaterThan(200);
    expect(visible(AGENT_INSTALL_PS1)).not.toMatch(/wazuh|prowler/i);
  });

  // La sintaxis se comprueba de verdad cuando la máquina tiene el intérprete (el desarrollo y CI en Linux tienen bash; el análisis de PowerShell solo donde exista).
  const bash = spawnSync('bash', ['--version'], { encoding: 'utf8' });
  (bash.status === 0 ? it : it.skip)('el de Linux tiene sintaxis válida (bash -n)', () => {
    const r = spawnSync('bash', ['-n'], { input: AGENT_INSTALL_SH, encoding: 'utf8' });
    expect(r.stderr).toBe('');
    expect(r.status).toBe(0);
  });

  const ps = spawnSync('powershell', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.Major'], { encoding: 'utf8' });
  const parse = (script: string) =>
    spawnSync('powershell', ['-NoProfile', '-Command', '$t=$null;$e=$null;[void][System.Management.Automation.Language.Parser]::ParseInput([Console]::In.ReadToEnd(),[ref]$t,[ref]$e);$e|ForEach-Object{$_.Message};exit $e.Count'], { input: script, encoding: 'utf8' });
  (ps.status === 0 ? it : it.skip)('el de Windows tiene sintaxis válida (analizador de PowerShell), servido y con los datos adentro', () => {
    const served = parse(servedInstaller('windows', TEMPLATES));
    expect(served.stdout.trim()).toBe('');
    expect(served.status).toBe(0);
    const file = buildInstallOptions(params({ os: 'windows' }), TEMPLATES)[1] as { content: string };
    const embedded = parse(file.content);
    expect(embedded.stdout.trim()).toBe('');
    expect(embedded.status).toBe(0);
  });
});
