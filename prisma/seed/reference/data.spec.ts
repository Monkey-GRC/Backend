import { CAPABILITIES, CAPABILITIES_BY_SCENARIO, FRAMEWORK_OFFERS, FREQUENCIES_BY_CAPABILITY, PLATFORMS, PLATFORM_REGIONS, REGULATIONS } from './data';

describe('catálogos de referencia (MD-75, MD-83)', () => {
  it('trae las 18 regulaciones del contrato, sin códigos ni nombres repetidos y con jurisdicción', () => {
    expect(REGULATIONS).toHaveLength(18);
    expect(new Set(REGULATIONS.map((r) => r.code)).size).toBe(18);
    expect(new Set(REGULATIONS.map((r) => r.name)).size).toBe(18);
    for (const r of REGULATIONS) {
      expect(r.code).toMatch(/^[a-z0-9_]+$/);
      expect(r.name.trim()).toBe(r.name);
      expect(r.jurisdiction.trim()).not.toBe('');
    }
  });

  it('PCI DSS no es una norma de protección de datos: no está entre las regulaciones (D51)', () => {
    expect(REGULATIONS.map((r) => r.code)).not.toContain('pci_dss');
  });

  it('ofrece 6 marcos como gancho, sin repetir y sin SOC 2 (que trae su propio catálogo, D50)', () => {
    expect(FRAMEWORK_OFFERS.map((f) => f.code)).toEqual(['iso27001', 'hipaa', 'gdpr', 'pci_dss', 'nist_csf', 'soc1']);
    for (const f of FRAMEWORK_OFFERS) {
      for (const v of [f.name, f.version, f.scopeDescription]) expect(v.trim()).toBe(v);
      expect(f.scopeDescription).not.toBe('');
    }
  });

  it('las dos opciones de salida no son leyes', () => {
    expect(REGULATIONS.filter((r) => r.jurisdiction === 'n/a').map((r) => r.code)).toEqual(['none', 'other']);
  });

  it('trae las 6 capacidades ac_01…ac_06, completas', () => {
    expect(CAPABILITIES.map((c) => c.catalogCode)).toEqual(['ac_01', 'ac_02', 'ac_03', 'ac_04', 'ac_05', 'ac_06']);
    for (const c of CAPABILITIES) {
      expect(PLATFORMS.filter((p) => p.capability === c.catalogCode).length).toBeGreaterThan(0);
      expect(c.requiredPermissions.length).toBeGreaterThan(0);
      for (const f of [c.category, c.method, c.provider, c.baseFrequency, c.generatedEvidence]) expect(f.trim()).not.toBe('');
    }
  });

  it('solo ac_01 corre por intervalos; el resto es continuo', () => {
    expect(CAPABILITIES.filter((c) => c.baseFrequency !== 'continuo').map((c) => c.catalogCode)).toEqual(['ac_01']);
  });

  it('el proveedor del motor solo aparece en `provider`, nunca en un texto que pueda ver el cliente', () => {
    for (const c of CAPABILITIES) {
      const visible = [c.category, c.method, c.baseFrequency, c.generatedEvidence, ...PLATFORMS.filter((p) => p.capability === c.catalogCode).flatMap((p) => [p.name, p.code, p.logoKey]), ...c.requiredPermissions].join(' ');
      expect(visible).not.toMatch(/wazuh|prowler/i);
    }
  });

  it('los escenarios solo ofrecen capacidades que existen', () => {
    const codes = new Set(CAPABILITIES.map((c) => c.catalogCode));
    for (const list of Object.values(CAPABILITIES_BY_SCENARIO)) for (const k of list) expect(codes.has(k)).toBe(true);
    expect(CAPABILITIES_BY_SCENARIO.hybrid).toHaveLength(6);
  });

  // El catálogo de conexiones (D67): las plataformas son las de la hoja del comité, y solo se elige lo que tiene un flujo real.
  describe('catálogo de conexiones (D67)', () => {
    const names = (cap: string) => PLATFORMS.filter((p) => p.capability === cap).map((p) => p.name);

    it('las plataformas de cada conexión son las de la hoja del comité, en su orden', () => {
      expect(names('ac_01')).toEqual(['Amazon Web Services', 'Azure', 'GCP', 'Microsoft 365', 'Google Workspace']);
      expect(names('ac_02')).toEqual(['Linux', 'Windows', 'HP-UX', 'AIX', 'Solaris']);
      expect(names('ac_03')).toEqual(['PostgreSQL', 'MySQL', 'SQL Server', 'Oracle', 'MongoDB']);
      expect(names('ac_04')).toEqual(names('ac_02'));
      expect(names('ac_05')).toEqual(['PostgreSQL', 'MySQL / MariaDB', 'SQL Server', 'Oracle', 'MongoDB']);
      expect(names('ac_06')).toEqual(['Windows', 'macOS', 'Linux']);
    });

    it('una plataforma es el sistema operativo o el motor, no el lugar donde vive', () => {
      const all = PLATFORMS.map((p) => p.name).join(' ');
      expect(all).not.toMatch(/EC2|RDS|Cloud SQL|Atlas|VPS|Azure VM/i);
    });

    it('solo AWS está disponible: es el único flujo construido', () => {
      expect(PLATFORMS.filter((p) => p.availability === 'available').map((p) => `${p.capability}/${p.code}`)).toEqual(['ac_01/aws']);
    });

    it('una plataforma disponible tiene canal y regiones; una bloqueada no se puede conectar todavía', () => {
      for (const p of PLATFORMS.filter((x) => x.availability === 'available')) {
        expect(p.methods.length).toBeGreaterThan(0);
        expect(PLATFORM_REGIONS[`${p.capability}/${p.code}`]?.length).toBeGreaterThan(0);
      }
      expect(PLATFORMS.find((p) => p.code === 'aws')?.methods[0]).toBe('readonly_role');
    });

    it('no hay dos plataformas con el mismo código dentro de una conexión, y los logos tienen nombre de archivo', () => {
      const keys = PLATFORMS.map((p) => `${p.capability}/${p.code}`);
      expect(new Set(keys).size).toBe(keys.length);
      for (const p of PLATFORMS) expect(p.logoKey).toMatch(/^[a-z0-9_]+$/);
    });

    it('cada conexión tiene frecuencias, tipo de activo y plataformas', () => {
      for (const c of CAPABILITIES) {
        expect(FREQUENCIES_BY_CAPABILITY[c.catalogCode]?.length).toBeGreaterThan(0);
        expect(['server', 'database', 'cloud_service', 'endpoint']).toContain(c.assetType);
      }
      expect(FREQUENCIES_BY_CAPABILITY['ac_01']).toEqual(['every_6h', 'every_24h']);
    });

    it('las regiones son de plataformas que existen', () => {
      for (const key of Object.keys(PLATFORM_REGIONS)) expect(PLATFORMS.some((p) => `${p.capability}/${p.code}` === key)).toBe(true);
    });
  });
});
