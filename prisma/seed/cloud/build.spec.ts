import { buildCloudDataset, EngineCheckMeta, EngineFramework, normalizeSoc2Requirement, proposeTests, requirementsByTest, Soc2Source } from './build';

const meta = (over: Partial<EngineCheckMeta> & { CheckID: string }): EngineCheckMeta => ({
  CheckTitle: 't',
  ServiceName: 'iam',
  Severity: 'high',
  ResourceType: 'AwsIamUser',
  Description: 'd',
  Categories: [],
  Remediation: { Recommendation: { Text: 'r' } },
  ...over,
});
const fw = (name: string, version: string, reqs: { Id: string; Checks: string[] }[]): EngineFramework => ({ Framework: name, Version: version, Requirements: reqs });
const allFrameworks = (soc2Reqs: { Id: string; Checks: string[] }[]): EngineFramework[] => [
  fw('SOC2', '', soc2Reqs),
  fw('ISO27001', '2022', []),
  fw('HIPAA', '', []),
  fw('GDPR', '', []),
  fw('PCI', '4.0', []),
  fw('NIST-CSF', '2.0', []),
];
const soc2: Soc2Source = {
  controlTests: [{ controlCode: 'IAM-1', testCode: 'T-CLD-001' }, { controlCode: 'NET-1', testCode: 'T-CLD-002' }, { controlCode: 'LOG-1', testCode: 'T-CLD-003' }, { controlCode: 'PW-1', testCode: 'T-CLD-011' }, { controlCode: 'BK-1', testCode: 'T-CLD-008' }],
  pointOfFocusControls: [{ requirementCode: 'CC6.3', controlCode: 'IAM-1' }, { requirementCode: 'CC6.6', controlCode: 'NET-1' }, { requirementCode: 'CC7.2', controlCode: 'LOG-1' }, { requirementCode: 'CC6.1', controlCode: 'PW-1' }, { requirementCode: 'A1.2', controlCode: 'BK-1' }],
};

describe('normalizeSoc2Requirement', () => {
  it.each([
    ['cc_6_6', 'CC6.6'],
    ['cc_a_1_1', 'A1.1'],
    ['cc_c_1_2', 'C1.2'],
    ['pi_1_3', 'PI1.3'],
  ])('%s → %s', (i, o) => expect(normalizeSoc2Requirement(i)).toBe(o));
  it('devuelve null con un formato desconocido (no inventa)', () => expect(normalizeSoc2Requirement('xx_9')).toBeNull());
});

describe('proposeTests', () => {
  it('la política de contraseñas va a T-CLD-011', () => expect(proposeTests(meta({ CheckID: 'iam_password_policy_minimum_length_14' }))[0].tests).toEqual(['T-CLD-011']));
  it('MFA va a T-CLD-001 y T-CLD-011', () => expect(proposeTests(meta({ CheckID: 'iam_root_mfa_enabled' }))[0].tests).toEqual(['T-CLD-001', 'T-CLD-011']));
  it('el servicio de respaldos va a T-CLD-003 y T-CLD-008', () => expect(proposeTests(meta({ CheckID: 'backup_vaults_exist', Categories: ['resilience'] }))[0].tests).toEqual(['T-CLD-003', 'T-CLD-008']));
  it('una categoría de exposición va a T-CLD-002', () => expect(proposeTests(meta({ CheckID: 'ec2_securitygroup_x', Categories: ['internet-exposed'] }))[0].tests).toEqual(['T-CLD-002']));
  it('un check sin categoría que lo ubique queda sin prueba (cobertura no alcanzada)', () => expect(proposeTests(meta({ CheckID: 'sagemaker_clarify_exists', Categories: ['gen-ai'] }))).toEqual([]));
});

describe('requirementsByTest', () => {
  it('recorre prueba → control → requisito', () => expect([...requirementsByTest(soc2).get('T-CLD-001')!]).toEqual(['CC6.3']));
});

describe('buildCloudDataset', () => {
  const metas = [meta({ CheckID: 'iam_no_root_access_key', Categories: ['identity-access'] }), meta({ CheckID: 'sagemaker_clarify_exists', Categories: ['gen-ai'] })];

  it('guarda el mapeo del motor normalizado y con su procedencia', () => {
    const { dataset, errors } = buildCloudDataset('5.44.0', metas, allFrameworks([{ Id: 'cc_6_3', Checks: ['iam_no_root_access_key'] }]), soc2);
    expect(errors).toEqual([]);
    expect(dataset.mappings).toEqual([{ checkId: 'iam_no_root_access_key', frameworkCode: 'soc2', frameworkVersion: '2017', requirementCode: 'CC6.3', provenance: 'engine_native' }]);
  });
  it('sube la confianza a high solo si el requisito que cita el motor es alcanzable desde la prueba propuesta', () => {
    const ok = buildCloudDataset('5.44.0', metas, allFrameworks([{ Id: 'cc_6_3', Checks: ['iam_no_root_access_key'] }]), soc2).dataset;
    expect(ok.testChecks[0]).toMatchObject({ testCode: 'T-CLD-001', provenance: 'monkey_proposed', confidence: 'high' });
    const no = buildCloudDataset('5.44.0', metas, allFrameworks([{ Id: 'cc_1_3', Checks: ['iam_no_root_access_key'] }]), soc2).dataset;
    expect(no.testChecks[0].confidence).toBe('medium');
  });
  it('nunca presenta una propuesta como ratificada y deja sin prueba lo que no encaja', () => {
    const { dataset } = buildCloudDataset('5.44.0', metas, allFrameworks([]), soc2);
    expect(dataset.testChecks.every((t) => t.provenance === 'monkey_proposed')).toBe(true);
    expect(dataset.testChecks.map((t) => t.checkId)).not.toContain('sagemaker_clarify_exists');
    expect(dataset.checks).toHaveLength(2);
  });
  it('un check sin mapeo SOC 2 del motor queda con confianza low', () => {
    const { dataset } = buildCloudDataset('5.44.0', metas, allFrameworks([]), soc2);
    expect(dataset.checks.every((c) => c.mappingConfidence === 'low')).toBe(true);
  });
  it('informa un check citado por el motor que no existe, y una prueba inexistente', () => {
    const e1 = buildCloudDataset('5.44.0', metas, allFrameworks([{ Id: 'cc_6_3', Checks: ['no_existe'] }]), soc2).errors;
    expect(e1.join()).toMatch(/no_existe/);
    const e2 = buildCloudDataset('5.44.0', metas, allFrameworks([]), { controlTests: [], pointOfFocusControls: [] }).errors;
    expect(e2.join()).toMatch(/T-CLD-001/);
  });
  it('informa si el motor no trae un marco ofrecido', () => {
    expect(buildCloudDataset('5.44.0', metas, [], soc2).errors.join()).toMatch(/SOC2/);
  });
});
