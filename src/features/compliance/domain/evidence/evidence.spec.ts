import { EvidenceReviewRecord, evidenceStateOf, rejectingReview, reviewerRoleFor } from './evidence';

const review = (patch: Partial<EvidenceReviewRecord> = {}): EvidenceReviewRecord => ({
  reviewerRole: 'admin_empresa', review: 'human_validated', typeOk: true, periodOk: true, validOk: true, approvedOk: true, signedOk: true, contentOk: true, note: null,
  reviewedBy: { id: 'u1', name: 'Camilo', lastName: 'Ortiz' }, reviewedAt: new Date('2026-10-22T12:00:00Z'), ...patch,
});

describe('evidenceStateOf (D84, RN-01 a RN-03)', () => {
  it('sin revisión una entrega espera; si la IA ya opinó queda en revisión, nunca cumple', () => {
    expect(evidenceStateOf({ aiVerdict: null })).toBe('pending');
    expect(evidenceStateOf({ aiVerdict: 'parece firmada', reviews: [] })).toBe('in_review');
  });

  it('solo una evidencia validada por una persona con los seis atributos en «sí» cumple', () => {
    expect(evidenceStateOf({ aiVerdict: null, reviews: [review()] })).toBe('compliant');
  });

  it('con todo en «sí» pero sin validación humana no cumple: queda pendiente (o en revisión si la IA sugirió)', () => {
    expect(evidenceStateOf({ aiVerdict: null, reviews: [review({ review: 'pending_review' })] })).toBe('pending');
    expect(evidenceStateOf({ aiVerdict: 'ok', reviews: [review({ review: 'pending_review' })] })).toBe('in_review');
  });

  it('un atributo en «no» no cumple; la vigencia en «no» la deja vencida; uno sin valorar la deja pendiente', () => {
    expect(evidenceStateOf({ aiVerdict: null, reviews: [review({ signedOk: false })] })).toBe('non_compliant');
    expect(evidenceStateOf({ aiVerdict: null, reviews: [review({ validOk: false })] })).toBe('expired');
    expect(evidenceStateOf({ aiVerdict: null, reviews: [review({ contentOk: null })] })).toBe('pending');
  });

  it('«no cumple» manda sobre «vencida» (RN-02)', () => {
    expect(evidenceStateOf({ aiVerdict: null, reviews: [review({ approvedOk: false, validOk: false })] })).toBe('non_compliant');
  });
});

const as = (reviewerRole: 'admin_empresa' | 'responsable', patch: Partial<EvidenceReviewRecord> = {}) => review({ reviewerRole, ...patch });
const rejected = { signedOk: false, note: 'Falta la firma.' } as const;

describe('evidenceStateOf · combinación de las revisiones de cada rol (D102)', () => {
  it('una sola validación, de cualquiera de los dos roles, cumple', () => {
    expect(evidenceStateOf({ aiVerdict: null, reviews: [as('responsable')] })).toBe('compliant');
    expect(evidenceStateOf({ aiVerdict: null, reviews: [as('admin_empresa')] })).toBe('compliant');
  });

  it('si validan los dos, cumple', () => {
    expect(evidenceStateOf({ aiVerdict: null, reviews: [as('responsable'), as('admin_empresa')] })).toBe('compliant');
  });

  it('un rechazo gana, sea del rol que sea y venga antes o después de la validación', () => {
    expect(evidenceStateOf({ aiVerdict: null, reviews: [as('responsable'), as('admin_empresa', rejected)] })).toBe('non_compliant');
    expect(evidenceStateOf({ aiVerdict: null, reviews: [as('responsable', rejected), as('admin_empresa')] })).toBe('non_compliant');
    expect(evidenceStateOf({ aiVerdict: null, reviews: [as('responsable', rejected)] })).toBe('non_compliant');
  });

  it('un rechazo posterior a una validación la anula; una vencida también pesa más que una validación', () => {
    expect(evidenceStateOf({ aiVerdict: null, reviews: [as('admin_empresa', rejected)] })).toBe('non_compliant');
    expect(evidenceStateOf({ aiVerdict: null, reviews: [as('responsable'), as('admin_empresa', { validOk: false })] })).toBe('expired');
    expect(evidenceStateOf({ aiVerdict: null, reviews: [as('responsable', { validOk: false }), as('admin_empresa', rejected)] })).toBe('non_compliant');
  });

  it('una revisión sin validación humana no cumple ni bloquea a la otra', () => {
    const pending = as('responsable', { review: 'pending_review' });
    expect(evidenceStateOf({ aiVerdict: null, reviews: [pending] })).toBe('pending');
    expect(evidenceStateOf({ aiVerdict: 'ok', reviews: [pending] })).toBe('in_review');
    expect(evidenceStateOf({ aiVerdict: null, reviews: [pending, as('admin_empresa')] })).toBe('compliant');
  });

  it('la IA nunca produce «cumple»: sin revisión humana queda en revisión', () => {
    expect(evidenceStateOf({ aiVerdict: 'parece firmada', reviews: [] })).toBe('in_review');
  });
});

describe('rejectingReview', () => {
  it('es la revisión que no cumple (la más reciente si son dos); sin rechazos, nula', () => {
    const old = as('responsable', { ...rejected, note: 'Antigua', reviewedAt: new Date('2026-10-01T00:00:00Z') });
    const recent = as('admin_empresa', { ...rejected, note: 'Reciente', reviewedAt: new Date('2026-10-02T00:00:00Z') });
    expect(rejectingReview([old, recent])?.note).toBe('Reciente');
    expect(rejectingReview([as('admin_empresa')])).toBeNull();
  });
});

describe('reviewerRoleFor (D102)', () => {
  const owner = { owner: { id: 'dueno' }, executor: null };
  it('el admin_empresa revisa siempre, también lo que subió él', () => {
    expect(reviewerRoleFor({ role: 'admin_empresa', userId: 'admin' }, owner, 'admin')).toBe('admin_empresa');
    expect(reviewerRoleFor({ role: 'admin_empresa', userId: 'admin' }, { owner: null, executor: null }, 'otro')).toBe('admin_empresa');
  });

  it('el responsable revisa si es el dueño y no subió él', () => {
    expect(reviewerRoleFor({ role: 'responsable', userId: 'dueno' }, owner, 'delegado')).toBe('responsable');
    expect(reviewerRoleFor({ role: 'responsable', userId: 'dueno' }, owner, 'dueno')).toBeNull();
    expect(reviewerRoleFor({ role: 'responsable', userId: 'ajeno' }, owner, 'delegado')).toBeNull();
    expect(reviewerRoleFor({ role: 'responsable', userId: 'dueno' }, { owner: null, executor: null }, 'delegado')).toBeNull();
  });

  it('el delegado, el auditor y el admin_monkey no revisan', () => {
    for (const role of ['delegado', 'auditor', 'admin_monkey']) expect(reviewerRoleFor({ role, userId: 'dueno' }, owner, 'otro')).toBeNull();
  });
});
