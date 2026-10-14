import { EvidenceInput, evaluateDocumentaryTest, evaluateEvidence } from './documentary-test';

const ok: EvidenceInput = { typeOk: true, periodOk: true, approvedOk: true, signedOk: true, contentOk: true, validOk: true, review: 'human_validated' };
const evidence = (patch: Partial<EvidenceInput> = {}): EvidenceInput => ({ ...ok, ...patch });

describe('evaluateEvidence (RN-01 a RN-03)', () => {
  it('con todos los atributos en sí y validada por una persona → CUMPLE', () => {
    expect(evaluateEvidence(evidence())).toBe('compliant');
  });

  it.each(['typeOk', 'periodOk', 'approvedOk', 'signedOk', 'contentOk'] as const)('%s en «No» → NO CUMPLE', (attribute) => {
    expect(evaluateEvidence(evidence({ [attribute]: false }))).toBe('non_compliant');
  });

  it('la vigencia en «No» → EVIDENCIA VENCIDA, no «no cumple» (RN-02)', () => {
    expect(evaluateEvidence(evidence({ validOk: false }))).toBe('expired');
  });

  it('un atributo incorrecto prevalece sobre la vigencia', () => {
    expect(evaluateEvidence(evidence({ validOk: false, contentOk: false }))).toBe('non_compliant');
  });

  it('un atributo sin valorar → PENDIENTE', () => {
    expect(evaluateEvidence(evidence({ signedOk: null }))).toBe('pending');
    expect(evaluateEvidence(evidence({ validOk: null }))).toBe('pending');
  });

  it('la IA nunca produce CUMPLE: la pre-validada queda EN REVISIÓN (RN-03)', () => {
    expect(evaluateEvidence(evidence({ review: 'ai_prevalidated' }))).toBe('in_review');
  });

  it('pendiente de revisión queda PENDIENTE, aunque todos los atributos estén bien', () => {
    expect(evaluateEvidence(evidence({ review: 'pending_review' }))).toBe('pending');
  });

  it('una evidencia que no aplica es NO APLICA', () => {
    expect(evaluateEvidence(evidence({ applicable: false }))).toBe('not_applicable');
  });
});

describe('evaluateDocumentaryTest (RN-04)', () => {
  it('sin evidencias → PENDIENTE: la ausencia de evidencia nunca es cumplimiento (V14)', () => {
    expect(evaluateDocumentaryTest([])).toBe('pending');
  });

  it('todas CUMPLE → CUMPLE', () => {
    expect(evaluateDocumentaryTest(['compliant', 'compliant'])).toBe('compliant');
  });

  it('prioridad: NO CUMPLE > VENCIDA > EN REVISIÓN > PENDIENTE > CUMPLE', () => {
    expect(evaluateDocumentaryTest(['compliant', 'pending', 'in_review', 'expired', 'non_compliant'])).toBe('non_compliant');
    expect(evaluateDocumentaryTest(['compliant', 'pending', 'in_review', 'expired'])).toBe('expired');
    expect(evaluateDocumentaryTest(['compliant', 'pending', 'in_review'])).toBe('in_review');
    expect(evaluateDocumentaryTest(['compliant', 'pending'])).toBe('pending');
  });

  it('una evidencia que no aplica no cuenta; si todas no aplican, el test no aplica', () => {
    expect(evaluateDocumentaryTest(['compliant', 'not_applicable'])).toBe('compliant');
    expect(evaluateDocumentaryTest(['not_applicable'])).toBe('not_applicable');
  });
});
