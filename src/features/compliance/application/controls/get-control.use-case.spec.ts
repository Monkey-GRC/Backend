import type { Principal } from '../../../../common/auth/principal';
import { asset, control, data, readoutTest, requirement } from '../../domain/controls/readout.fixtures';
import { ControlRepository } from '../../domain/controls/control.repository';
import { IntegrationConnections } from '../../domain/evidence/integration-connections';
import { toControlDetail } from '../../presentation/controls/control-response.mapper';
import { GetControlUseCase } from './get-control.use-case';

// MD-499 · El detalle lleva las integraciones conectadas del servicio: con la categoría de una prueba de fuente `integration` conectada, la prueba deja de aceptar subida y de ofrecerse
// como respaldo; sin ella (hoy, siempre) acepta subida de respaldo. Y los vínculos de los checks solo se piden en la vista técnica.
const admin = { companyId: 'co', userId: 'u1', role: 'admin_empresa' } as Principal;
const t = (key: string) => key;
const connections = (...categories: string[]): IntegrationConnections => ({ connectedCategories: jest.fn().mockResolvedValue(new Set(categories)) });

function build(integrations: IntegrationConnections) {
  const test = readoutTest('t1', 'documentary', { dimension: 'process', primarySource: 'integration', integrationCategory: 'Identidades' });
  const dimensions = [{ dimension: 'process' as const, applies: true, type: 'manual' as const, reasonNotApplicable: null }];
  const readout = { ...data([control([requirement('r1', [test])], { dimensions })], [asset('a1')]), evidence: [], causes: [] };
  const repo = { loadControl: jest.fn().mockResolvedValue(readout) };
  return { repo, uc: new GetControlUseCase(repo as unknown as ControlRepository, integrations) };
}

describe('GetControlUseCase · integraciones conectadas (MD-499)', () => {
  it('con la categoría de la prueba conectada: no acepta subida ni es respaldo, y no se ofrece en evidence_tests', async () => {
    const { uc } = build(connections('Identidades'));
    const detail = await uc.execute(admin, 'c1', 'technical');
    expect([...detail.connectedIntegrations]).toEqual(['Identidades']);
    const body = toControlDetail(detail, t);
    expect(body.technical?.tests[0]).toMatchObject({ test_id: 't1', accepts_evidence: false, evidence_fallback: false });
    expect(body.evidence_tests).toEqual([]);
  });

  it('sin integración conectada: acepta subida de respaldo y se ofrece', async () => {
    const { uc } = build(connections());
    const body = toControlDetail(await uc.execute(admin, 'c1', 'technical'), t);
    expect(body.technical?.tests[0]).toMatchObject({ accepts_evidence: true, evidence_fallback: true });
    expect(body.evidence_tests.map((x) => [x.test_id, x.evidence_fallback])).toEqual([['t1', true]]);
  });

  it('los vínculos de los checks solo se cargan en la vista técnica', async () => {
    const { uc, repo } = build(connections());
    await uc.execute(admin, 'c1', undefined);
    expect(repo.loadControl.mock.calls[0][2]).toBe(false);
    await uc.execute(admin, 'c1', 'technical');
    expect(repo.loadControl.mock.calls[1][2]).toBe(true);
  });
});
