import { RunContext } from '../../domain/repositories/scan.repository';
import { buildConnection } from './scan.use-cases';

const ctx = (over: Partial<RunContext> = {}): RunContext => ({
  executionId: 'e', assetId: 'a', origin: 'manual', kind: 'assessment', roleArn: null, externalId: null, projectNumber: null, platform: 'AWS', externalAccountId: '123456789012', regions: ['us-east-1'], connectionMethod: null, encryptedCredentials: 'x', ...over,
});

describe('buildConnection', () => {
  it('rol de solo lectura: usa el formulario provisional (read_only_role, external_id)', () => {
    expect(buildConnection(ctx(), { account_id: '1', read_only_role: 'arn:aws:iam::1:role/R', external_id: 'mk-1' })).toEqual({
      ok: true,
      job: { platform: 'aws', externalAccountId: '123456789012', connection: { method: 'readonly_role', roleArn: 'arn:aws:iam::1:role/R', externalId: 'mk-1' } },
    });
  });
  it('prefiere role_arn cuando exista, y toma la cuenta de las credenciales si el activo no la trae', () => {
    const out = buildConnection(ctx({ externalAccountId: null }), { account_id: '999', role_arn: 'arn:aws:iam::999:role/N' });
    expect(out).toMatchObject({ ok: true, job: { externalAccountId: '999', connection: { roleArn: 'arn:aws:iam::999:role/N', externalId: null } } });
  });
  it('llaves: solo con el canal de llaves y las dos llaves presentes', () => {
    expect(buildConnection(ctx({ connectionMethod: 'access_keys' }), { access_key_id: 'AKIA', secret_access_key: 's' })).toMatchObject({ ok: true, job: { connection: { method: 'access_keys', accessKeyId: 'AKIA', secretAccessKey: 's' } } });
    expect(buildConnection(ctx({ connectionMethod: 'access_keys' }), { access_key_id: 'AKIA' })).toEqual({ ok: false, reason: 'connection.credentials_invalid' });
  });
  it.each([
    ['otro proveedor', ctx({ platform: 'Azure' }), { read_only_role: 'x' }, 'connection.provider_not_supported'],
    ['sin regiones declaradas', ctx({ regions: [] }), { read_only_role: 'x' }, 'connection.regions_missing'],
    ['sin credenciales', ctx(), null, 'connection.not_configured'],
    ['sin rol', ctx(), { account_id: '1' }, 'connection.role_not_found'],
    ['canal de agente (no es del trabajador de nube)', ctx({ connectionMethod: 'agent' }), { x: 'y' }, 'connection.method_not_supported_by_runner'],
  ])('%s → falla con su razón', (_n, c, creds, reason) => {
    expect(buildConnection(c, creds as Record<string, unknown> | null)).toEqual({ ok: false, reason });
  });
});

describe('buildConnection · GCP (D112)', () => {
  const gcp = (over: Partial<RunContext> = {}) =>
    ctx({ platform: 'gcp', externalAccountId: 'acme-prod-421905', regions: [], connectionMethod: 'identity_federation', externalId: 'mk-3f9a1c7e2b', projectNumber: '407295138461', encryptedCredentials: null, ...over });

  it('entrega la federación con external_id y número de proyecto, sin regiones, también en una evaluación', () => {
    expect(buildConnection(gcp(), null)).toEqual({
      ok: true,
      job: { platform: 'gcp', externalAccountId: 'acme-prod-421905', connection: { method: 'identity_federation', externalId: 'mk-3f9a1c7e2b', projectNumber: '407295138461' } },
    });
  });
  it.each([
    ['sin número de proyecto', gcp({ projectNumber: null }), 'connection.not_configured'],
    ['sin identificador externo', gcp({ externalId: null }), 'connection.not_configured'],
    ['otro canal', gcp({ connectionMethod: 'readonly_role' }), 'connection.method_not_supported_by_runner'],
  ])('%s → falla con su razón', (_n, c, reason) => {
    expect(buildConnection(c, null)).toEqual({ ok: false, reason });
  });
  it('AWS sigue pidiendo regiones y GCP no', () => {
    expect(buildConnection(ctx({ regions: [] }), { read_only_role: 'x' })).toEqual({ ok: false, reason: 'connection.regions_missing' });
    expect(buildConnection(gcp({ kind: 'assessment' }), null)).toMatchObject({ ok: true });
  });
});
