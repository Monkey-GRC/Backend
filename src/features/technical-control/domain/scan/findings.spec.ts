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

// D113 · Los servidores: la sonda no califica sus checks, y el recurso afectado es el propio servidor.
describe('buildFindings · servidores (D113)', () => {
  const server = (patch: Partial<FailedRow> = {}): FailedRow =>
    row({ checkUuid: 's1', severity: null, titleEn: 'Ensure /tmp is a separate partition.', titleEs: 'Asegurar que /tmp es una partición separada.', remediation: 'Create a separate /tmp partition.', resourceName: 'srv-prod-01', resourceUid: null, region: null, ...patch });

  it('does not invent a severity: a check the probe does not rate has none', () => {
    const [f] = buildFindings([server()], 'es', 'x');
    expect(f.severity).toBeNull();
    // Un valor ilegible sí cae a «media» (como siempre), pero la ausencia de dato no.
    expect(buildFindings([server({ severity: 'rara' })], 'es', 'x')[0].severity).toBe('medium');
    expect(buildFindings([server({ severity: '  ' })], 'es', 'x')[0].severity).toBeNull();
  });

  it('puts what is not rated after everything that is, and keeps a real severity when another row has it', () => {
    const out = buildFindings([server({ checkUuid: 'a', titleEn: 'Alpha', titleEs: 'Alfa' }), server({ checkUuid: 'b', titleEs: 'Beta', severity: 'low' })], 'es', 'x');
    expect(out.map((f) => f.title)).toEqual(['Beta', 'Alfa']);
    expect(buildFindings([server(), server({ severity: 'high' })], 'es', 'x')[0].severity).toBe('high');
  });

  it('names the affected server and lists every server that fails the same check once', () => {
    const [f] = buildFindings([server(), server({ resourceName: 'srv-prod-02' }), server()], 'es', 'x');
    expect(f.resources).toEqual([
      { name: 'srv-prod-01', uid: null, region: null },
      { name: 'srv-prod-02', uid: null, region: null },
    ]);
    expect(f.resourcesTotal).toBe(2);
  });

  it('uses the Spanish title of the catalog and says when the guidance is only available in English', () => {
    const [f] = buildFindings([server()], 'es', 'x');
    expect(f.title).toBe('Asegurar que /tmp es una partición separada.');
    expect(f.remediation).toEqual({ text: 'Create a separate /tmp partition.', language: 'en', isAiGenerated: false });
  });
});
