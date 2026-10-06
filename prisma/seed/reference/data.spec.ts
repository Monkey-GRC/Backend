import { CAPABILITIES, CAPABILITIES_BY_SCENARIO, FRAMEWORK_OFFERS, REGULATIONS } from './data';

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
      expect(c.supportedPlatforms.length).toBeGreaterThan(0);
      expect(c.requiredPermissions.length).toBeGreaterThan(0);
      for (const f of [c.category, c.method, c.provider, c.baseFrequency, c.generatedEvidence]) expect(f.trim()).not.toBe('');
    }
  });

  it('solo ac_01 corre por intervalos; el resto es continuo', () => {
    expect(CAPABILITIES.filter((c) => c.baseFrequency !== 'continuo').map((c) => c.catalogCode)).toEqual(['ac_01']);
  });

  it('el proveedor del motor solo aparece en `provider`, nunca en un texto que pueda ver el cliente', () => {
    for (const c of CAPABILITIES) {
      const visible = [c.category, c.method, c.baseFrequency, c.generatedEvidence, ...c.supportedPlatforms, ...c.requiredPermissions].join(' ');
      expect(visible).not.toMatch(/wazuh|prowler/i);
    }
  });

  it('los escenarios solo ofrecen capacidades que existen', () => {
    const codes = new Set(CAPABILITIES.map((c) => c.catalogCode));
    for (const list of Object.values(CAPABILITIES_BY_SCENARIO)) for (const k of list) expect(codes.has(k)).toBe(true);
    expect(CAPABILITIES_BY_SCENARIO.hybrid).toHaveLength(6);
  });
});
