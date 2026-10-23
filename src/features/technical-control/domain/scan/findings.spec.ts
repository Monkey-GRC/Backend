import { buildFindings, FailedRow, MAX_RESOURCES_PER_FINDING } from './findings';

const row = (patch: Partial<FailedRow> = {}): FailedRow => ({
  checkUuid: 'c1',
  severity: 'high',
  titleEn: 'Bucket allows public access',
  titleEs: null,
  remediation: 'Enable block public access.',
  remediationEs: null,
  translationOrigin: null,
  resourceName: 'bucket-a',
  resourceUid: 'arn:aws:s3:::bucket-a',
  region: 'us-east-1',
  ...patch,
});

// D90 · Los hallazgos: uno por check, con sus recursos y la guía en el idioma de la persona, sin nombrar al proveedor.
describe('buildFindings (D90)', () => {
  it('groups the failed rows of a check into one finding with its resources', () => {
    const out = buildFindings([row(), row({ resourceName: 'bucket-b', resourceUid: 'arn:aws:s3:::bucket-b' })], 'en', 'x');
    expect(out).toHaveLength(1);
    expect(out[0].resources.map((r) => r.name)).toEqual(['bucket-a', 'bucket-b']);
    expect(out[0].resourcesTotal).toBe(2);
  });

  it('counts the same resource once, and keeps the worst severity of the check', () => {
    const out = buildFindings([row({ severity: 'low' }), row({ severity: 'critical' })], 'en', 'x');
    expect(out[0].resources).toHaveLength(1);
    expect(out[0].severity).toBe('critical');
  });

  it('sorts by severity first, then by title', () => {
    const out = buildFindings(
      [row({ checkUuid: 'a', severity: 'low', titleEn: 'A' }), row({ checkUuid: 'b', severity: 'critical', titleEn: 'Z' }), row({ checkUuid: 'c', severity: 'critical', titleEn: 'B' })],
      'en',
      'x',
    );
    expect(out.map((f) => f.title)).toEqual(['B', 'Z', 'A']);
  });

  it('caps the resources of a finding and reports the real total', () => {
    const many = Array.from({ length: MAX_RESOURCES_PER_FINDING + 10 }, (_, i) => row({ resourceName: `r${i}`, resourceUid: `uid-${i}` }));
    const out = buildFindings(many, 'en', 'x');
    expect(out[0].resources).toHaveLength(MAX_RESOURCES_PER_FINDING);
    expect(out[0].resourcesTotal).toBe(MAX_RESOURCES_PER_FINDING + 10);
  });

  it('gives the Spanish guidance flagged as AI-generated while nobody has reviewed it', () => {
    const [f] = buildFindings([row({ titleEs: 'El bucket permite acceso público', remediationEs: 'Activa el bloqueo de acceso público.', translationOrigin: 'machine' })], 'es', 'x');
    expect(f.title).toBe('El bucket permite acceso público');
    expect(f.remediation).toEqual({ text: 'Activa el bloqueo de acceso público.', language: 'es', isAiGenerated: true });
  });

  it('does not flag a reviewed translation as AI-generated', () => {
    const [f] = buildFindings([row({ remediationEs: 'Activa el bloqueo.', translationOrigin: 'reviewed' })], 'es', 'x');
    expect(f.remediation).toEqual({ text: 'Activa el bloqueo.', language: 'es', isAiGenerated: false });
  });

  it('falls back to the original English, said as English, when there is no translation', () => {
    const [f] = buildFindings([row()], 'es', 'x');
    expect(f.remediation).toEqual({ text: 'Enable block public access.', language: 'en', isAiGenerated: false });
    expect(f.title).toBe('Bucket allows public access');
  });

  it('never lets a text that names the probe provider out', () => {
    const [f] = buildFindings([row({ titleEn: 'Prowler check failed', remediation: 'Run Wazuh to fix it', remediationEs: 'Usa prowler', translationOrigin: 'machine' })], 'es', 'Configuración que no cumple');
    expect(f.title).toBe('Configuración que no cumple');
    expect(f.remediation).toBeNull();
    expect(JSON.stringify(f)).not.toMatch(/prowler|wazuh/i);
  });

  it('returns nothing when nothing failed', () => {
    expect(buildFindings([], 'es', 'x')).toEqual([]);
  });
});
