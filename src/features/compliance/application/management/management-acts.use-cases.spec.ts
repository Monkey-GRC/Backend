import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { control, data, readoutTest, requirement } from '../../domain/controls/readout.fixtures';
import { ControlReadout, readControl } from '../../domain/controls/control-readout';
import { NO_EXTRAS, type ManagementExtras } from '../../domain/controls/management-extras';
import type { ManualResult } from '../../domain/engine/v2/manual-test';
import {
  DecideLevelOverrideUseCase, DeclareNoOccurrencesUseCase, ProposeLevelOverrideUseCase, RegisterOccurrenceUseCase, RegisterRemediationPlanUseCase, RequestNotApplicableUseCase, RevertNotApplicableUseCase,
} from './management-acts.use-cases';

// MD-529 · El ORDEN de las validaciones de cada acto: primero existe (404), luego quién puede (403), luego el cuerpo (422) y al final el estado (409). Con repositorios de mentira: aquí no hay base.
const owner = { id: 'r1', name: 'Ana', lastName: 'Pérez', role: 'responsable' };
const ago = new Date(Date.now() - 3_600_000);
const principal = (role: Principal['role'], userId: string): Principal => ({ userId, companyId: 'co', role, sessionId: 's' });
const RESPONSABLE = principal('responsable', 'r1');
const AJENO = principal('responsable', 'r9');
const ADMIN = principal('admin_empresa', 'a1');
const DELEGADO = principal('delegado', 'd1');
const meta = { ipAddress: '1.1.1.1', userAgent: 'jest' };

function readoutOf(failing: string[] = [], extras: Partial<ManagementExtras> = {}, onDemand = false): ControlReadout {
  const ids = ['t1', 't2', 't3', 't4', 't5'];
  const reqs = ids.map((id) => requirement(`r${id}`, [readoutTest(id, 'operational')], { type: 'operational', ...(onDemand ? { periodicity: 'on_demand' as const } : {}) }));
  const results = new Map<string, ManualResult>(ids.map((id) => [id, { result: failing.includes(id) ? 'exception' : 'correct', at: ago }]));
  const c = control(reqs, { access: { owner, executor: null }, manualResults: results, extras: { ...NO_EXTRAS, ...extras } });
  return readControl(c, data([c], []));
}

function build(readout: ControlReadout | null) {
  const management = { lockAndRead: jest.fn().mockResolvedValue(readout && { readout, data: { signals: { now: new Date() } }, before: new Map() }) };
  const saved = { id: 'new', stateAfter: 'non_compliant', readout: readout as ControlReadout, invalidatedDeclarationIds: [] as string[] };
  const acts = {
    controlOfRequest: jest.fn().mockResolvedValue('c1'), isAssignable: jest.fn().mockResolvedValue(true), auditExtra: jest.fn(),
    createLevelOverride: jest.fn().mockResolvedValue(saved), decideLevelOverride: jest.fn().mockResolvedValue(saved), createPlan: jest.fn().mockResolvedValue(saved),
    createApplicabilityRequest: jest.fn().mockResolvedValue(saved), revertApplicability: jest.fn().mockResolvedValue(saved), createOccurrence: jest.fn().mockResolvedValue(saved), createDeclaration: jest.fn().mockResolvedValue(saved),
  };
  const tx = { run: <T>(_s: unknown, fn: () => Promise<T>) => fn() };
  return { management, acts, args: [management, acts, tx] as never };
}
const code = async (p: Promise<unknown>): Promise<string> => p.then(() => 'ok', (e: unknown) => (e instanceof DomainError ? e.code : e instanceof ValidationException ? (e.fields[0]?.code ?? 'validation') : String(e)));

describe('ProposeLevelOverrideUseCase · el orden de las validaciones', () => {
  const run = (b: ReturnType<typeof build>, p: Principal, body: { proposed_level: string; justification: string }) => new ProposeLevelOverrideUseCase(...(b.args as [never, never, never])).execute(p, 'c1', body as never, meta);

  it('404 antes que todo: un control que no existe o está dado de baja', async () => {
    expect(await code(run(build(null), RESPONSABLE, { proposed_level: 'weak', justification: '' }))).toBe('NOT_FOUND');
  });
  it('403 antes que el cuerpo: el delegado, el ajeno y el admin con otro responsable', async () => {
    for (const p of [DELEGADO, AJENO, ADMIN]) expect(await code(run(build(readoutOf(['t1'])), p, { proposed_level: 'weak', justification: '' }))).toBe('FORBIDDEN');
  });
  it('422 de la justificación antes que los 409 del estado', async () => {
    expect(await code(run(build(readoutOf(['t1'])), RESPONSABLE, { proposed_level: 'adequate', justification: '  ' }))).toBe('justification.required');
  });
  it('409 con una propuesta pendiente, antes de revisar el nivel pedido', async () => {
    const r = readoutOf(['t1']);
    const pending = { id: 'o0', suggestedValue: r.suggestedLevelValue, proposedValue: 1, justification: 'x', status: 'pending' as const, proposedBy: owner, proposedAt: ago, decidedBy: null, decidedAt: null, decisionReason: null, windowStart: r.windowStart, invalidatedAt: null };
    expect(await code(run(build(readoutOf(['t1'], { overrides: [pending] })), RESPONSABLE, { proposed_level: 'adequate', justification: 'x' }))).toBe('LEVEL_OVERRIDE_ALREADY_PENDING');
  });
  it('el nivel que cruza a «cumple» es 409; el mismo que rige, 422; uno válido escribe', async () => {
    expect(await code(run(build(readoutOf(['t1'])), RESPONSABLE, { proposed_level: 'adequate', justification: 'x' }))).toBe('LEVEL_CHANGE_NOT_ALLOWED');
    expect(await code(run(build(readoutOf(['t1'])), RESPONSABLE, { proposed_level: 'weak', justification: 'x' }))).toBe('proposed_level.invalid');
    const b = build(readoutOf(['t1']));
    expect(await code(run(b, RESPONSABLE, { proposed_level: 'ineffective', justification: 'x' }))).toBe('ok');
    expect(b.acts.createLevelOverride).toHaveBeenCalledTimes(1);
  });
});

describe('DecideLevelOverrideUseCase', () => {
  it('404 si la solicitud no existe; 403 para quien no decide; 422 al rechazar sin motivo', async () => {
    const b = build(readoutOf(['t1']));
    b.acts.controlOfRequest.mockResolvedValueOnce(null);
    expect(await code(new DecideLevelOverrideUseCase(...(b.args as [never, never, never])).execute(ADMIN, 'o1', { decision: 'approve' }, meta))).toBe('NOT_FOUND');
    expect(await code(new DecideLevelOverrideUseCase(...(b.args as [never, never, never])).execute(RESPONSABLE, 'o1', { decision: 'approve' }, meta))).toBe('FORBIDDEN');
    expect(await code(new DecideLevelOverrideUseCase(...(b.args as [never, never, never])).execute(ADMIN, 'o1', { decision: 'reject' }, meta))).toBe('NOT_FOUND'); // la propuesta no es del control: 404 va antes que el cuerpo
  });
});

describe('RegisterRemediationPlanUseCase', () => {
  const run = (b: ReturnType<typeof build>, p: Principal, body: Record<string, unknown>) => new RegisterRemediationPlanUseCase(...(b.args as [never, never, never])).execute(p, 'c1', { test_id: 't1', what: 'Firmar', owner_id: 'u2', due_date: '2099-01-01', ...body } as never, meta);

  it('403, luego qué/fecha/persona (422), luego la prueba (404 y 409)', async () => {
    const r = readoutOf(['t1']);
    expect(await code(run(build(r), DELEGADO, {}))).toBe('FORBIDDEN');
    expect(await code(run(build(r), RESPONSABLE, { what: ' ' }))).toBe('what.required');
    expect(await code(run(build(r), RESPONSABLE, { due_date: '2020-01-01' }))).toBe('due_date.past');
    const sinPersona = build(r);
    sinPersona.acts.isAssignable.mockResolvedValue(false);
    expect(await code(run(sinPersona, RESPONSABLE, {}))).toBe('owner_id.invalid');
    expect(await code(run(build(r), RESPONSABLE, { test_id: 'no-existe' }))).toBe('NOT_FOUND');
    expect(await code(run(build(r), RESPONSABLE, { test_id: 't2' }))).toBe('TEST_NOT_IN_EXCEPTION');
    const ok = build(r);
    expect(await code(run(ok, RESPONSABLE, {}))).toBe('ok');
    expect(ok.acts.createPlan).toHaveBeenCalledTimes(1);
  });
});

describe('«No aplica»', () => {
  it('pedirlo: 403, 404 del requisito, 422 del motivo, 409 de lo ya aplicado', async () => {
    const r = readoutOf();
    const ask = (b: ReturnType<typeof build>, p: Principal, requirementId: string, reason: string) => new RequestNotApplicableUseCase(...(b.args as [never, never, never])).execute(p, 'c1', requirementId, { reason }, meta);
    expect(await code(ask(build(r), DELEGADO, 'rt1', 'x'))).toBe('FORBIDDEN');
    expect(await code(ask(build(r), RESPONSABLE, 'no', 'x'))).toBe('NOT_FOUND');
    expect(await code(ask(build(r), RESPONSABLE, 'rt1', ' '))).toBe('reason.required');
    const b = build(r);
    expect(await code(ask(b, RESPONSABLE, 'rt1', 'No operamos eso'))).toBe('ok');
    expect(b.acts.createApplicabilityRequest).toHaveBeenCalledWith(expect.anything(), 'c1', { requirementId: 'rt1', reason: 'No operamos eso', direct: false }, expect.anything(), expect.any(Function));
  });
  it('revertirlo: 404, 422 del motivo y 409 si el requisito sí aplica', async () => {
    const r = readoutOf();
    const revert = (p: Principal, requirementId: string, reason: string) => new RevertNotApplicableUseCase(...(build(r).args as [never, never, never])).execute(p, 'c1', requirementId, { reason }, meta);
    expect(await code(revert(RESPONSABLE, 'no', 'x'))).toBe('NOT_FOUND');
    expect(await code(revert(RESPONSABLE, 'rt1', ''))).toBe('reason.required');
    expect(await code(revert(RESPONSABLE, 'rt1', 'x'))).toBe('NOT_NOT_APPLICABLE');
  });
});

describe('ocurrencias y declaración', () => {
  it('un requisito que no es «cuando sea requerido» es 409; el delegado registra la ocurrencia pero no declara', async () => {
    const plain = readoutOf();
    const occ = (b: ReturnType<typeof build>, p: Principal, body: Record<string, unknown>) => new RegisterOccurrenceUseCase(...(b.args as [never, never, never])).execute(p, 'c1', 'rt1', { occurred_on: '2020-01-01', description: 'Alta', ...body } as never, meta);
    const declare = (b: ReturnType<typeof build>, p: Principal) => new DeclareNoOccurrencesUseCase(...(b.args as [never, never, never])).execute(p, 'c1', 'rt1', {}, meta);
    expect(await code(occ(build(plain), RESPONSABLE, {}))).toBe('REQUIREMENT_NOT_ON_DEMAND');
    const onDemand = readoutOf([], {}, true);
    expect(await code(occ(build(onDemand), principal('colaborador', 'c9'), {}))).toBe('FORBIDDEN');
    expect(await code(occ(build(onDemand), RESPONSABLE, { description: ' ' }))).toBe('description.required');
    expect(await code(occ(build(onDemand), RESPONSABLE, { occurred_on: '2999-01-01' }))).toBe('occurred_on.future');
    expect(await code(occ(build(onDemand), RESPONSABLE, {}))).toBe('ok');
    expect(await code(declare(build(onDemand), DELEGADO))).toBe('FORBIDDEN');
    expect(await code(declare(build(onDemand), RESPONSABLE))).toBe('ok');
  });
});
