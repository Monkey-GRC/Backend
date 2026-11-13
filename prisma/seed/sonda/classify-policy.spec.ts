import { classifyPolicy, compareNewestFirst, versionCode } from './classify-policy';

// Los 77 nombres REALES de la hoja «Checks» del Excel del comité (VF2), tal como vienen. Si el comité entrega otra versión con políticas nuevas y alguna
// no se reconoce, el cargador falla: aquí se fija que hoy se reconocen todas, y a qué.
const REAL: [platform: string, name: string, expected: string][] = [
  ['Windows', 'CIS Microsoft Windows 10 Enterprise Benchmark v4.0.0', 'windows|windows_desktop|10'],
  ['Windows', 'CIS Microsoft Windows 11 Enterprise Benchmark v3.0.0', 'windows|windows_desktop|11'],
  ['Windows', 'CIS Microsoft Windows Server 2012 (non-R2) Benchmark v3.0.0.', 'windows|windows_server|2012'],
  ['Windows', 'CIS Microsoft Windows Server 2012 R2 Benchmark v3.0.0', 'windows|windows_server|2012 R2'],
  ['Windows', 'CIS Microsoft Windows Server 2016 v2.0.0', 'windows|windows_server|2016'],
  ['Windows', 'CIS Microsoft Windows Server 2019 Benchmark v2.0.0', 'windows|windows_server|2019'],
  ['Windows', 'CIS Microsoft Windows Server 2022 Benchmark v2.0.0', 'windows|windows_server|2022'],
  ['Windows', 'CIS Microsoft Windows Server 2025 Benchmark', 'windows|windows_server|2025'],
  ['Debian', 'CIS Debian Linux 10 Benchmark v2.0.0', 'linux|debian|10'],
  ['Debian', 'CIS Debian Linux 11 Benchmark v1.0.0', 'linux|debian|11'],
  ['Debian', 'CIS Debian Linux 7 Benchmark v1.0.0', 'linux|debian|7'],
  ['Debian', 'CIS Debian Linux 8 Benchmark v2.0.0', 'linux|debian|8'],
  ['Debian', 'CIS Debian Linux 9 Benchmark v1.0.1', 'linux|debian|9'],
  ['Debian', 'Center for Internet Security Debian Linux 12 Benchmark v1.1.0', 'linux|debian|12'],
  ['Debian', 'Center for Internet Security Debian Linux 13 Benchmark', 'linux|debian|13'],
  ['Ubuntu', 'CIS Ubuntu Linux 14.04 LTS Benchmark v2.1.0', 'linux|ubuntu|14.04 LTS'],
  ['Ubuntu', 'CIS Ubuntu Linux 16.04 LTS Benchmark v1.1.0', 'linux|ubuntu|16.04 LTS'],
  ['Ubuntu', 'CIS Ubuntu Linux 18.04 LTS Benchmark v2.1.0', 'linux|ubuntu|18.04 LTS'],
  ['Ubuntu', 'CIS Ubuntu Linux 20.04 LTS Benchmark v2.0.0', 'linux|ubuntu|20.04 LTS'],
  ['Ubuntu', 'CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0.', 'linux|ubuntu|22.04 LTS'],
  ['Ubuntu', 'CIS Ubuntu Linux 24.04 LTS Benchmark v1.0.0.', 'linux|ubuntu|24.04 LTS'],
  ['CentOS', 'CIS CentOS Linux 10 Benchmark', 'linux|centos|10'],
  ['CentOS', 'CIS CentOS Linux 6 Benchmark v2.0.2', 'linux|centos|6'],
  ['CentOS', 'CIS CentOS Linux 7 Benchmark v3.1.2.', 'linux|centos|7'],
  ['CentOS', 'CIS CentOS Linux 8 Benchmark v2.0.0', 'linux|centos|8'],
  ['CentOS', 'CIS CentOS Linux 9 Benchmark', 'linux|centos|9'],
  ['Red Hat', 'CIS Red Hat Enterprise Linux 10 Benchmark.', 'linux|rhel|10'],
  ['Red Hat', 'CIS Red Hat Enterprise Linux 5 Benchmark v2.2.0', 'linux|rhel|5'],
  ['Red Hat', 'CIS Red Hat Enterprise Linux 6 Benchmark v2.1.0', 'linux|rhel|6'],
  ['Red Hat', 'CIS Red Hat Enterprise Linux 7 Benchmark v3.1.1', 'linux|rhel|7'],
  ['Red Hat', 'CIS Red Hat Enterprise Linux 8 Benchmark v2.0.0', 'linux|rhel|8'],
  ['Red Hat', 'CIS Red Hat Enterprise Linux 9 Benchmark v1.0.0.', 'linux|rhel|9'],
  ['AlmaLinux', 'CIS Alma Linux 8 Benchmark v2.0.0', 'linux|alma|8'],
  ['AlmaLinux', 'CIS Benchmark for Alma Linux 10', 'linux|alma|10'],
  ['AlmaLinux', 'CIS Benchmark for Alma Linux 9', 'linux|alma|9'],
  ['macOS', 'CIS Apple macOS 10.11 Benchmark v1.1.0', 'macos|macos|10.11'],
  ['macOS', 'CIS Apple macOS 10.12 Benchmark v1.1.0', 'macos|macos|10.12'],
  ['macOS', 'CIS Apple macOS 10.13 Benchmark v1.0.0', 'macos|macos|10.13'],
  ['macOS', 'CIS Apple macOS 10.14 Benchmark v1.0.0', 'macos|macos|10.14'],
  ['macOS', 'CIS Apple macOS 10.15 Benchmark v1.1.0', 'macos|macos|10.15'],
  ['macOS', 'CIS Apple macOS 11.0 Big Sur Benchmark v2.1.0', 'macos|macos|11 Big Sur'],
  ['macOS', 'CIS Apple macOS 12.0 Monterey Benchmark v1.1.0', 'macos|macos|12 Monterey'],
  ['macOS', 'CIS_Apple_macOS_13.0_Ventura_Benchmark_v1.1.0', 'macos|macos|13 Ventura'],
  ['macOS', 'CIS_Apple_macOS_14.0_Sonoma_Benchmark_v1.0.0', 'macos|macos|14 Sonoma'],
  ['macOS', 'CIS_Apple_macOS_15.0_Sequoia_Benchmark_v1.0.0', 'macos|macos|15 Sequoia'],
  ['macOS', 'CIS_Apple_macOS_26.0_Tahoe_Benchmark_v1.0.0', 'macos|macos|26 Tahoe'],
  ['Amazon Linux', 'CIS Amazon Linux 2 Benchmark v2.0.0', 'linux|amazon_linux|2'],
  ['Amazon Linux', 'CIS Amazon Linux Benchmark v2.1.0', 'linux|amazon_linux|1'],
  ['Amazon Linux', 'CIS Benchmark for Amazon Linux 2023 Benchmark v1.0.0.', 'linux|amazon_linux|2023'],
  ['Rocky Linux', 'CIS Rocky Linux 10 Benchmark v1.0.0', 'linux|rocky|10'],
  ['Rocky Linux', 'CIS Rocky Linux 8 Benchmark v1.0.0', 'linux|rocky|8'],
  ['Rocky Linux', 'CIS Rocky Linux 9 Benchmark v1.0.0', 'linux|rocky|9'],
  ['SUSE Linux Enterprise', 'CIS SUSE Linux Enterprise 11 Benchmark v2.1.0', 'linux|suse|11'],
  ['SUSE Linux Enterprise', 'CIS SUSE Linux Enterprise 12 Benchmark v2.1.0', 'linux|suse|12'],
  ['SUSE Linux Enterprise', 'CIS SUSE Linux Enterprise 15 Benchmark v1.1.1', 'linux|suse|15'],
  ['SUSE Linux Enterprise', 'CIS SUSE Linux Enterprise 16 Benchmark', 'linux|suse|16'],
  ['Ol', 'Center for Internet Security Oracle Linux 10.', 'linux|oracle_linux|10'],
  ['Ol', 'Center for Internet Security Oracle Linux 9 Benchmark v1.0.0.', 'linux|oracle_linux|9'],
  ['Generic', 'CIS Distribution Independent Linux Benchmark v2.0.0.', 'linux|linux_generic|generic'],
  ['Sunos', 'CIS Benchmark for Oracle Solaris 11 v1.1.0', 'solaris|solaris|11'],
  ['Sunos', 'CIS Benchmark for Oracle Solaris 11.4 v1.0.0', 'solaris|solaris|11.4'],
  ['HP-UX', 'CIS HP-UX 11i Benchmark', 'hp_ux|hp_ux|11i'],
  ['HP-UX', 'CIS HP-UX 11i Benchmark v1.5.0', 'hp_ux|hp_ux|11i'],
];

const NOT_OS_REAL: [string, string][] = [
  ['Aplicaciones', 'CIS Apache HTTP Server 2.4 Benchmark v1.5.0'],
  ['Aplicaciones', 'CIS Benchmark for PostgreSQL 13'],
  ['Aplicaciones', 'CIS Microsoft IIS 10 Benchmark v1.1.1'],
  ['Aplicaciones', 'CIS Microsoft SQL Server 2019 Benchmark v1.1.0'],
  ['Aplicaciones', 'System audit for web-related vulnerabilities'],
  ['Oracledb', 'CIS Benchmark for Oracle Database 19c v1.0.0'],
  ['Nginx', 'CIS NGINX version 1.14.0 Benchmark v1.0.0'],
  ['Mongodb', 'CIS MongoDB 3.6 Benchmark v1.0.0'],
];

const show = (p: ReturnType<typeof classifyPolicy>) => (p ? `${p.osCode}|${p.distribution}|${p.versionLabel}` : 'NO RECONOCIDA');

describe('classifyPolicy', () => {
  it.each(REAL)('%s · %s → %s', (platform, name, expected) => {
    expect(show(classifyPolicy(platform, name))).toBe(expected);
  });

  it('reconoce las 63 políticas de sistema operativo del catálogo actual (las otras 14 son de bases de datos y aplicaciones)', () => {
    expect(REAL).toHaveLength(63);
    expect(REAL.filter(([p, nm]) => classifyPolicy(p, nm) === null)).toEqual([]);
  });

  it.each(NOT_OS_REAL)('%s · %s no es un sistema operativo (se carga pero no se ofrece como versión de un servidor)', (platform, name) => {
    expect(classifyPolicy(platform, name)).toEqual({ osCode: null, distribution: null, distributionName: null, versionLabel: null, sortKey: [] });
  });

  it('una plataforma desconocida o una política que no se entiende NO se adivina: devuelve null y el cargador falla', () => {
    expect(classifyPolicy('Plan9', 'CIS Plan 9 Benchmark')).toBeNull();
    expect(classifyPolicy('Ubuntu', 'CIS Ubuntu Linux sin version')).toBeNull();
    expect(classifyPolicy('Windows', 'CIS Microsoft Windows 95')).toBeNull();
  });

  it('el nombre de la distribución es la marca; las que no son una marca se distinguen por su código', () => {
    expect(classifyPolicy('Ubuntu', 'CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0.')!.distributionName).toBe('Ubuntu');
    expect(classifyPolicy('Windows', 'CIS Microsoft Windows 11 Enterprise Benchmark v3.0.0')).toMatchObject({ distribution: 'windows_desktop', distributionName: 'Windows' });
    expect(classifyPolicy('Generic', 'CIS Distribution Independent Linux Benchmark v2.0.0.')).toMatchObject({ distribution: 'linux_generic' });
  });
});

describe('versionCode', () => {
  const code = (p: string, name: string) => {
    const c = classifyPolicy(p, name)!;
    return versionCode(c.distribution!, c.versionLabel!);
  };

  it('es un código de la API en snake_case, definido por Monkey', () => {
    expect(code('Ubuntu', 'CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0.')).toBe('ubuntu_22_04_lts');
    expect(code('Windows', 'CIS Microsoft Windows Server 2012 R2 Benchmark v3.0.0')).toBe('windows_server_2012_r2');
    expect(code('Windows', 'CIS Microsoft Windows 11 Enterprise Benchmark v3.0.0')).toBe('windows_desktop_11');
    expect(code('macOS', 'CIS Apple macOS 11.0 Big Sur Benchmark v2.1.0')).toBe('macos_11_big_sur');
    expect(code('Sunos', 'CIS Benchmark for Oracle Solaris 11.4 v1.0.0')).toBe('solaris_11_4');
    expect(code('Generic', 'CIS Distribution Independent Linux Benchmark v2.0.0.')).toBe('linux_generic');
  });

  it('es único para las 63 políticas de sistema operativo, salvo las dos HP-UX 11i, que son el mismo sistema', () => {
    const codes = REAL.map(([p, nm]) => code(p, nm));
    const dup = codes.filter((c, i) => codes.indexOf(c) !== i);
    expect(dup).toEqual(['hp_ux_11i']);
  });

  it('solo letras minúsculas, números y guion bajo', () => {
    for (const [p, nm] of REAL) expect(code(p, nm)).toMatch(/^[a-z0-9]+(_[a-z0-9]+)*$/);
  });
});

describe('compareNewestFirst', () => {
  const key = (p: string, nm: string) => classifyPolicy(p, nm)!.sortKey;

  it('ordena de la más nueva a la más vieja, comparando número a número (22.04 antes que 4.10, 2012 R2 antes que 2012)', () => {
    const ubuntu = ['14.04', '24.04', '22.04', '18.04'].map((v) => ({ v, k: key('Ubuntu', `CIS Ubuntu Linux ${v} LTS Benchmark v1.0.0`) }));
    expect(ubuntu.sort((a, b) => compareNewestFirst(a.k, b.k)).map((x) => x.v)).toEqual(['24.04', '22.04', '18.04', '14.04']);
    const win = [
      { v: '2012', k: key('Windows', 'CIS Microsoft Windows Server 2012 (non-R2) Benchmark v3.0.0.') },
      { v: '2012 R2', k: key('Windows', 'CIS Microsoft Windows Server 2012 R2 Benchmark v3.0.0') },
      { v: '2022', k: key('Windows', 'CIS Microsoft Windows Server 2022 Benchmark v2.0.0') },
    ];
    expect(win.sort((a, b) => compareNewestFirst(a.k, b.k)).map((x) => x.v)).toEqual(['2022', '2012 R2', '2012']);
  });

  it('en macOS, 26 va antes que 15 y 10.15 queda al final', () => {
    const names = ['10.15', '26.0_Tahoe', '15.0_Sequoia', '11.0 Big Sur'].map((v) => ({ v, k: key('macOS', `CIS Apple macOS ${v} Benchmark v1.0.0`) }));
    expect(names.sort((a, b) => compareNewestFirst(a.k, b.k)).map((x) => x.v)).toEqual(['26.0_Tahoe', '15.0_Sequoia', '11.0 Big Sur', '10.15']);
  });
});
