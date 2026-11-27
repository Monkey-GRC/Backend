import { classifyControlWork, outcomeOfEvidence, pendingItemsOf, WorkItem, WorkViewer } from './work-bucket';

const owner: WorkViewer = { userId: 'r1', role: 'owner', executorId: 'd1' };
const executor: WorkViewer = { userId: 'd1', role: 'executor', executorId: 'd1' };
const item = (by: string, outcome: 'rejected' | 'waiting' | 'accepted', ownerCanReview = true): WorkItem => ({ delivery: { by, outcome, ownerCanReview } });
const none: WorkItem = { delivery: null };

describe('classifyControlWork (D122)', () => {
  it('sin piezas o todo aceptado: listo', () => {
    expect(classifyControlWork(owner, []).bucket).toBe('done');
    expect(classifyControlWork(executor, [item('d1', 'accepted')]).bucket).toBe('done');
  });
  it('falta una pieza: por subir', () => {
    expect(classifyControlWork(executor, [none, item('d1', 'accepted')])).toMatchObject({ bucket: 'to_upload', missing: 1 });
  });
  it('lo entregado que espera a otra persona: en revisión', () => {
    expect(classifyControlWork(executor, [item('d1', 'waiting')]).bucket).toBe('in_review');
    expect(classifyControlWork(owner, [item('r1', 'waiting')]).bucket).toBe('in_review');
  });
  it('por revisar es solo del dueño y de lo que subió otra persona', () => {
    expect(classifyControlWork(owner, [item('d1', 'waiting')])).toMatchObject({ bucket: 'to_review', toReview: 1 });
    expect(classifyControlWork(executor, [item('d1', 'waiting')]).bucket).toBe('in_review');
    expect(classifyControlWork(owner, [item('d1', 'waiting', false)]).bucket).toBe('in_review');
  });
  it('rechazado: el que subió el ejecutor cuenta para el dueño; el de un tercero, no', () => {
    expect(classifyControlWork(owner, [item('d1', 'rejected')]).bucket).toBe('rejected');
    expect(classifyControlWork(executor, [item('d1', 'rejected')]).bucket).toBe('rejected');
    expect(classifyControlWork(executor, [item('admin', 'rejected')]).bucket).toBe('done');
    expect(classifyControlWork(owner, [item('admin', 'rejected')]).bucket).toBe('done');
  });
  it('cuando aplican varios, gana el primero: rechazado > por revisar > por subir > en revisión', () => {
    const all = [none, item('d1', 'waiting'), item('r1', 'waiting'), item('d1', 'rejected')];
    expect(classifyControlWork(owner, all).bucket).toBe('rejected');
    expect(classifyControlWork(owner, all.slice(0, 3)).bucket).toBe('to_review');
    expect(classifyControlWork(owner, [none, item('r1', 'waiting')]).bucket).toBe('to_upload');
    expect(classifyControlWork(executor, [none, item('d1', 'waiting')]).bucket).toBe('to_upload');
  });
  it('pending_items suma lo que falta, lo rechazado, lo por revisar y las observaciones abiertas', () => {
    const w = classifyControlWork(owner, [none, none, item('d1', 'rejected'), item('d1', 'waiting')]);
    expect(pendingItemsOf(w, 2)).toBe(2 + 1 + 1 + 2);
  });
});

describe('outcomes', () => {
  it('evidencia', () => {
    expect(['non_compliant', 'expired', 'pending', 'in_review', 'compliant', 'not_applicable'].map((s) => outcomeOfEvidence(s as never))).toEqual(['rejected', 'rejected', 'waiting', 'waiting', 'accepted', 'accepted']);
  });
});

describe('el resultado de una prueba manual (MD-529, DT-120)', () => {
  const result = (evidenceReady: boolean, delivered = false): WorkItem => ({ kind: 'result', evidenceReady, delivery: delivered ? { by: 'r1', outcome: 'accepted', ownerCanReview: false } : null });

  it('al dueño le toca registrarlo cuando la evidencia del delegado ya está: por revisar, no por subir', () => {
    expect(classifyControlWork(owner, [item('d1', 'accepted'), result(true)])).toMatchObject({ bucket: 'to_review', toReview: 1, resultsToRegister: 1, missing: 0 });
  });
  it('sin la evidencia del delegado todavía falta la pieza: por subir', () => {
    expect(classifyControlWork(owner, [none, result(false)])).toMatchObject({ bucket: 'to_upload', missing: 2, resultsToRegister: 0 });
  });
  it('registrado, está entregado', () => {
    expect(classifyControlWork(owner, [item('d1', 'accepted'), result(true, true)]).bucket).toBe('done');
  });
  it('para el delegado no es una pieza suya: no la ve ni le falta', () => {
    expect(classifyControlWork(executor, [item('d1', 'accepted'), result(true)])).toMatchObject({ bucket: 'done', missing: 0, toReview: 0 });
    expect(classifyControlWork(executor, [result(false)]).bucket).toBe('done');
  });
});
