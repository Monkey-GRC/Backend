import { DomainError } from '../../../common/errors/domain-error';
import { PlatformRule } from '../domain/entities/technical-control.entities';
import { buildConnectionSetup, planConnection } from './cloud-connection';

const gcp: PlatformRule = { id: 'p-gcp', capabilityCode: 'ac_01', code: 'gcp', name: 'GCP', logoKey: 'gcp', availability: 'coming_soon', connectionMethods: ['identity_federation'], regionCodes: [] };
const aws: PlatformRule = { id: 'p-aws', capabilityCode: 'ac_01', code: 'aws', name: 'AWS', logoKey: 'aws', availability: 'available', connectionMethods: ['readonly_role', 'access_keys'], regionCodes: ['us-east-1'] };
const fed = (over = {}) => ({ connectionMethod: 'identity_federation' as const, externalAccountId: 'acme-prod-421905', ...over });

describe('planConnection · GCP (D112)', () => {
  it('el proyecto se declara sin regiones y nace con un external_id mk-… de Monkey', () => {
    const { errors, plan } = planConnection(fed(), gcp);
    expect(errors).toEqual([]);
    expect(plan).toMatchObject({ method: 'identity_federation', platform: 'gcp', externalAccountId: 'acme-prod-421905', regions: [], secretToStore: null });
    expect(plan?.externalId).toMatch(/^mk-[a-f0-9]{20}$/);
  });
  it.each([['sin proyecto', { externalAccountId: undefined }, 'required'], ['un número de cuenta de AWS', { externalAccountId: '123456789012' }, 'invalid'], ['mayúsculas', { externalAccountId: 'Acme-Prod' }, 'invalid'], ['muy corto', { externalAccountId: 'abc' }, 'invalid']])('%s → external_account_id %s', (_n, over, code) => {
    expect(planConnection(fed(over), gcp).errors).toEqual([{ field: 'external_account_id', code }]);
  });
  it('regiones y credenciales no se admiten (422 field.not_allowed)', () => {
    expect(planConnection(fed({ regions: ['us-east-1'] }), gcp).errors).toEqual([{ field: 'regions', code: 'field.not_allowed' }]);
    expect(planConnection(fed({ credentials: { access_key_id: 'x' } }), gcp).errors).toEqual([{ field: 'credentials', code: 'field.not_allowed' }]);
    expect(planConnection(fed({ regions: [] }), gcp).errors).toEqual([{ field: 'regions', code: 'field.not_allowed' }]);
  });
  it('un canal que la plataforma no tiene es 409, y AWS no admite la federación', () => {
    expect(() => planConnection(fed(), aws)).toThrow(DomainError);
    expect(() => planConnection({ connectionMethod: 'readonly_role', externalAccountId: 'acme-prod-421905' }, gcp)).toThrow(DomainError);
  });
  it('AWS sigue igual: cuenta de 12 dígitos y regiones', () => {
    const { plan } = planConnection({ connectionMethod: 'readonly_role', externalAccountId: '123456789012', regions: ['us-east-1'] }, aws);
    expect(plan).toMatchObject({ platform: 'aws', regions: ['us-east-1'] });
  });
});

describe('buildConnectionSetup · GCP', () => {
  it('lleva proyecto, número (nulo al principio), ruta del script y pasos', () => {
    expect(buildConnectionSetup({ connectionMethod: 'identity_federation', externalId: 'mk-1', roleArn: null, projectNumber: null, externalAccountId: 'acme-prod-421905' }, null)).toEqual({
      method: 'identity_federation', externalId: 'mk-1', projectId: 'acme-prod-421905', projectNumber: null, templatePath: '/v1/connection-templates/gcp-identity-federation',
      steps: ['connection.gcp_federation.step_1', 'connection.gcp_federation.step_2', 'connection.gcp_federation.step_3'],
    });
  });
});
