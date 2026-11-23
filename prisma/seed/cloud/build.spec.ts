import { buildCloudDatasets, EngineRow, platformOfLabel, PLATFORM_BY_LABEL, PLATFORMS, POLICY_ID } from './build';

const row = (over: EngineRow = {}): EngineRow => ({
  Plataforma: 'AWS', Servicio: 'rds', 'Check ID': 'rds_instance_x', Título: 'RDS x', Severidad: 'high', Remediación: 'Fix it', 'Qué evalúa': 'Evaluates x', 'SOC 2': 'cc_6_7, cc_a_1_1', 'ISO 27001:2022': 'A.8.3',
  HIPAA: '164_308_a_4_ii_a', GDPR: 'article_32', 'PCI DSS v4.0': '3.5.1', 'NIST CSF 2.0': 'ac_1, ac_6', ...over,
});
const SOURCE = { engineVersion: '5.45.0', sourceSha256: 'abc' };

describe('buildCloudDatasets', () => {
  it('hay 20 plataformas con código propio', () => {
    expect(PLATFORMS).toHaveLength(20);
    expect(new Set(PLATFORMS).size).toBe(20);
    expect(platformOfLabel('Oracle Cloud (OCI)')).toBe('oracle_cloud');
    expect(platformOfLabel('Plan9')).toBeNull();
    expect(Object.keys(PLATFORM_BY_LABEL)).toContain('Linode (Akamai)');
  });

  it('un dataset por plataforma; el check lleva el servicio, la severidad y la procedencia con la versión del motor', () => {
    const { datasets, errors } = buildCloudDatasets([row(), row({ Plataforma: 'GCP', 'Check ID': 'gcp_y' })], SOURCE);
    expect(errors).toEqual([]);
    expect([...datasets.keys()].sort()).toEqual(['aws', 'gcp']);
    expect(datasets.get('aws')!.checks[0]).toEqual({
      platform: 'aws', policyId: POLICY_ID, checkId: 'rds_instance_x', titleEn: 'RDS x', titleEs: null, condition: 'Evaluates x', remediation: 'Fix it', verificationRule: null, origin: 'engine_native',
      mappingProvenance: 'engine:aws:5.45.0', mappingConfidence: 'high', serviceName: 'rds', resourceType: null, engineSeverity: 'high', categories: [],
    });
    expect(datasets.get('aws')).toMatchObject({ engineVersion: '5.45.0', sourceSha256: 'abc' });
  });

  it('el mismo check ID en dos plataformas son dos checks (10 se repiten en el libro)', () => {
    const { datasets, errors } = buildCloudDatasets([row({ 'Check ID': 'kms_key_rotation_enabled' }), row({ Plataforma: 'GCP', 'Check ID': 'kms_key_rotation_enabled' })], SOURCE);
    expect(errors).toEqual([]);
    expect(datasets.get('aws')!.checks).toHaveLength(1);
    expect(datasets.get('gcp')!.checks).toHaveLength(1);
  });

  it('el mapeo a SOC 2 se normaliza (cc_6_7 → CC6.7, cc_a_1_1 → A1.1) y el de los demás marcos queda tal cual', () => {
    const { datasets } = buildCloudDatasets([row()], SOURCE);
    const m = datasets.get('aws')!.mappings;
    expect(m.filter((x) => x.frameworkCode === 'soc2').map((x) => x.requirementCode).sort()).toEqual(['A1.1', 'CC6.7']);
    expect(m.find((x) => x.frameworkCode === 'soc2')).toMatchObject({ frameworkVersion: '2017', provenance: 'engine_native' });
    expect(m.filter((x) => x.frameworkCode === 'nist_csf').map((x) => x.requirementCode)).toEqual(['ac_1', 'ac_6']);
    expect(m.find((x) => x.frameworkCode === 'pci_dss')).toMatchObject({ frameworkVersion: '4.0', requirementCode: '3.5.1' });
    expect(m.find((x) => x.frameworkCode === 'iso27001')).toMatchObject({ frameworkVersion: '2022', requirementCode: 'A.8.3' });
    expect(m.map((x) => x.frameworkCode).sort()).toEqual(['gdpr', 'hipaa', 'iso27001', 'nist_csf', 'nist_csf', 'pci_dss', 'soc2', 'soc2']);
  });

  it('un check sin etiqueta de SOC 2 queda con confianza baja', () => {
    const { datasets } = buildCloudDatasets([row({ 'SOC 2': null })], SOURCE);
    expect(datasets.get('aws')!.checks[0].mappingConfidence).toBe('low');
  });

  it('una plataforma sin código, un check repetido, sin id, sin título o con un SOC 2 raro son errores', () => {
    const { errors } = buildCloudDatasets([row({ Plataforma: 'Plan9' }), row(), row(), row({ 'Check ID': '' }), row({ 'Check ID': 'z', Título: '' }), row({ 'Check ID': 'w', 'SOC 2': 'xx_1' })], SOURCE);
    expect(errors).toHaveLength(5);
    expect(errors.join('\n')).toMatch(/Plan9/);
    expect(errors.join('\n')).toMatch(/repetido/);
    expect(errors.join('\n')).toMatch(/no tiene id/);
    expect(errors.join('\n')).toMatch(/no tiene título/);
    expect(errors.join('\n')).toMatch(/formato desconocido: xx_1/);
  });
});
