import type { Principal } from '../../../../common/auth/principal';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { ControlEvidenceFacts, EvidenceRepository } from '../../domain/evidence/evidence.repository';
import { IntegrationConnections } from '../../domain/evidence/integration-connections';
import { CreateEvidenceRequirementUseCase, ListTestEvidenceUseCase, UploadEvidenceUseCase, UploadTestEvidenceUseCase } from './evidence.use-cases';

// MD-499 · La subida por prueba y los requerimientos propios deciden con la misma regla (fuente principal, dimensión aplicable y las integraciones conectadas del servicio).
const p = { companyId: 'co', userId: 'u1', role: 'admin_empresa' } as Principal;
const meta = { ipAddress: '1.1.1.1', userAgent: 'jest' } as never;
const pdf = { buffer: Buffer.from('%PDF-1.7\n% prueba\n'), originalName: 'acta.pdf', mimeType: 'application/pdf' };

const test = (id: string, patch: Partial<ControlEvidenceFacts['tests'][number]> = {}): ControlEvidenceFacts['tests'][number] =>
  ({ id, code: `T-${id}`, displayName: `Prueba ${id}`, displayNameEn: null, dimension: 'process', primarySource: 'manual', integrationCategory: null, ...patch });
const facts = (tests: ControlEvidenceFacts['tests'], dimensions = ['process']): ControlEvidenceFacts => ({
  controlId: 'c1', serviceId: 's1', active: true, ownCode: 'C01', access: { owner: null, executor: null }, dimensions, tests, validityWithinPeriod: null,
});
const connections = (...categories: string[]): IntegrationConnections => ({ connectedCategories: jest.fn().mockResolvedValue(new Set(categories)) });

describe('UploadTestEvidenceUseCase', () => {
  const build = (f: ControlEvidenceFacts, integrations: IntegrationConnections) => {
    const repo = { occurrenceFacts: jest.fn().mockResolvedValue({ onDemand: false, occurrenceOk: false }), controlEvidenceFacts: jest.fn().mockResolvedValue(f), findOrCreateTestRequirement: jest.fn().mockResolvedValue({ requirementId: 'r1', created: true }) };
    const upload = { execute: jest.fn().mockResolvedValue({ id: 'sub1' }) };
    return { repo, upload, uc: new UploadTestEvidenceUseCase(repo as unknown as EvidenceRepository, upload as unknown as UploadEvidenceUseCase, integrations) };
  };
  const rejection = (promise: Promise<unknown>) => promise.then(() => null, (e: ValidationException) => e.fields);

  it('una prueba manual de una dimensión que aplica sube la evidencia', async () => {
    const { uc, repo, upload } = build(facts([test('t1')]), connections());
    await expect(uc.execute(p, 'c1', 't1', pdf, meta)).resolves.toEqual({ id: 'sub1' });
    expect(repo.findOrCreateTestRequirement).toHaveBeenCalledTimes(1);
    expect(upload.execute).toHaveBeenCalledTimes(1);
  });

  it('una prueba de integración con la categoría conectada es 422 test.not_manual y no crea nada', async () => {
    const { uc, repo, upload } = build(facts([test('t1', { primarySource: 'integration', integrationCategory: 'Identidades' })]), connections('Identidades'));
    expect(await rejection(uc.execute(p, 'c1', 't1', pdf, meta))).toEqual([{ field: 'test_id', code: 'test.not_manual' }]);
    expect(repo.findOrCreateTestRequirement).not.toHaveBeenCalled();
    expect(upload.execute).not.toHaveBeenCalled();
  });

  it('sin la integración conectada, la misma prueba acepta subida de respaldo', async () => {
    const { uc, upload } = build(facts([test('t1', { primarySource: 'integration', integrationCategory: 'Identidades' })]), connections('Otra'));
    await uc.execute(p, 'c1', 't1', pdf, meta);
    expect(upload.execute).toHaveBeenCalledTimes(1);
  });

  it('una prueba de sonda es 422 test.not_manual; una cuya dimensión no aplica, 422 dimension.not_in_control', async () => {
    expect(await rejection(build(facts([test('t1', { primarySource: 'probe' })]), connections()).uc.execute(p, 'c1', 't1', pdf, meta))).toEqual([{ field: 'test_id', code: 'test.not_manual' }]);
    expect(await rejection(build(facts([test('t1')], []), connections()).uc.execute(p, 'c1', 't1', pdf, meta))).toEqual([{ field: 'test_id', code: 'dimension.not_in_control' }]);
  });

  it('una prueba que el control no lleva es NOT_FOUND', async () => {
    await expect(build(facts([test('t1')]), connections()).uc.execute(p, 'c1', 'otra', pdf, meta)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('CreateEvidenceRequirementUseCase', () => {
  const dto = (patch: Partial<{ description: string; dimension: string; test_id: string }> = {}) => ({ description: 'Acta firmada', dimension: 'process', test_id: 't1', ...patch }) as never;
  const build = (f: ControlEvidenceFacts, integrations: IntegrationConnections) => {
    const repo = { controlEvidenceFacts: jest.fn().mockResolvedValue(f), createRequirement: jest.fn().mockResolvedValue({ id: 'req1' }) };
    return { repo, uc: new CreateEvidenceRequirementUseCase(repo as unknown as EvidenceRepository, integrations) };
  };
  const errors = (promise: Promise<unknown>) => promise.then(() => null, (e: ValidationException) => e.fields);

  it('acepta la dimensión `process` de una prueba `process` que acepta subida', async () => {
    const { uc, repo } = build(facts([test('t1')]), connections());
    await expect(uc.execute(p, 'c1', dto(), meta)).resolves.toEqual({ id: 'req1' });
    expect(repo.createRequirement.mock.calls[0][2]).toMatchObject({ dimension: 'process', testId: 't1' });
  });

  it('la dimensión debe ser la de la prueba: dimension.not_of_test, una sola vez', async () => {
    const { uc, repo } = build(facts([test('t1')], ['process', 'policy']), connections());
    expect(await errors(uc.execute(p, 'c1', dto({ dimension: 'policy' }), meta))).toEqual([{ field: 'dimension', code: 'dimension.not_of_test' }]);
    expect(repo.createRequirement).not.toHaveBeenCalled();
  });

  it('una dimensión que el control no tiene es dimension.not_in_control, sin sumar not_of_test', async () => {
    const { uc } = build(facts([test('t1')]), connections());
    expect(await errors(uc.execute(p, 'c1', dto({ dimension: 'network' }), meta))).toEqual([{ field: 'dimension', code: 'dimension.not_in_control' }]);
  });

  it('una prueba de integración con la categoría conectada es test.not_manual en test_id', async () => {
    const { uc, repo } = build(facts([test('t1', { primarySource: 'integration', integrationCategory: 'Identidades' })]), connections('Identidades'));
    expect(await errors(uc.execute(p, 'c1', dto(), meta))).toEqual([{ field: 'test_id', code: 'test.not_manual' }]);
    expect(repo.createRequirement).not.toHaveBeenCalled();
  });

  it('una prueba que el control no lleva es test.not_in_control; sin test_id, la dimensión basta', async () => {
    const { uc } = build(facts([test('t1')]), connections());
    expect(await errors(uc.execute(p, 'c1', dto({ test_id: 'x' }), meta))).toEqual([{ field: 'test_id', code: 'test.not_in_control' }]);
    await expect(uc.execute(p, 'c1', { description: 'Acta', dimension: 'process' } as never, meta)).resolves.toEqual({ id: 'req1' });
  });
});

describe('ListTestEvidenceUseCase · histórico (MD-499)', () => {
  const access = { owner: null, executor: null };
  const requirement = (testId: string | null, submissions: number) => ({ id: 'r', sequence: 1, test: testId && { id: testId }, submissions: Array.from({ length: submissions }, () => ({})) });
  const build = (source: string, items: unknown[], connected: string[] = []) => {
    const data = { testId: 't1', dimension: 'server', serviceId: 's1', test: { primarySource: source, integrationCategory: 'Identidades', dimensionApplies: true }, controls: [{ id: 'c1', code: 'C01', access }], items };
    return new ListTestEvidenceUseCase({ listByTest: jest.fn().mockResolvedValue(data) } as unknown as EvidenceRepository, connections(...connected));
  };

  it('una prueba que ya no acepta subida se lee mientras el control tenga entregas DE ELLA', async () => {
    const uc = build('integration', [{ controlId: 'c1', requirement: requirement('t1', 1) }], ['Identidades']);
    expect((await uc.execute(p, 'c1', 't1')).items).toHaveLength(1);
  });

  it('un requerimiento compartido (sin prueba) con entregas no abre la lectura de una prueba de sonda', async () => {
    await expect(build('probe', [{ controlId: 'c1', requirement: requirement(null, 2) }]).execute(p, 'c1', 't1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('ni las entregas de otra prueba, ni las de otro control, ni un requerimiento sin entregas', async () => {
    for (const item of [{ controlId: 'c1', requirement: requirement('otra', 1) }, { controlId: 'c2', requirement: requirement('t1', 1) }, { controlId: 'c1', requirement: requirement('t1', 0) }]) {
      await expect(build('probe', [item]).execute(p, 'c1', 't1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    }
  });
});
