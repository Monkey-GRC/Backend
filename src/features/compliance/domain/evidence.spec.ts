import { EvidenceReviewRecord, evidenceStateOf, reviewerRoleFor } from './evidence';

const review = (patch: Partial<EvidenceReviewRecord> = {}): EvidenceReviewRecord => ({
  reviewerRole: 'consultor', review: 'human_validated', typeOk: true, periodOk: true, validOk: true, approvedOk: true, signedOk: true, contentOk: true, note: null,
  reviewedBy: { id: 'u1', name: 'Camilo', lastName: 'Ortiz' }, reviewedAt: new Date('2026-10-22T12:00:00Z'), ...patch,
});

describe('evidenceStateOf (D84, RN-01 a RN-03)', () => {
  it('sin revisión una entrega espera; si la IA ya opinó queda en revisión, nunca cumple', () => {
    expect(evidenceStateOf({ aiVerdict: null })).toBe('pending');
    expect(evidenceStateOf({ aiVerdict: 'parece firmada', review: null })).toBe('in_review');
  });

  it('solo una evidencia validada por una persona con los seis atributos en «sí» cumple', () => {
    expect(evidenceStateOf({ aiVerdict: null, review: review() })).toBe('compliant');
  });

  it('con todo en «sí» pero sin validación humana no cumple: queda pendiente (o en revisión si la IA sugirió)', () => {
    expect(evidenceStateOf({ aiVerdict: null, review: review({ review: 'pending_review' }) })).toBe('pending');
    expect(evidenceStateOf({ aiVerdict: 'ok', review: review({ review: 'pending_review' }) })).toBe('in_review');
  });

  it('un atributo en «no» no cumple; la vigencia en «no» la deja vencida; uno sin valorar la deja pendiente', () => {
    expect(evidenceStateOf({ aiVerdict: null, review: review({ signedOk: false }) })).toBe('non_compliant');
    expect(evidenceStateOf({ aiVerdict: null, review: review({ validOk: false }) })).toBe('expired');
    expect(evidenceStateOf({ aiVerdict: null, review: review({ contentOk: null }) })).toBe('pending');
  });

  it('«no cumple» manda sobre «vencida» (RN-02)', () => {
    expect(evidenceStateOf({ aiVerdict: null, review: review({ approvedOk: false, validOk: false }) })).toBe('non_compliant');
  });
});

describe('reviewerRoleFor (SEG-61)', () => {
  it('el auditor ve la suya; la empresa y el consultor, la del consultor', () => {
    expect(reviewerRoleFor('auditor')).toBe('auditor');
    for (const role of ['consultor', 'admin_empresa', 'funcional']) expect(reviewerRoleFor(role)).toBe('consultor');
  });
});
