import { DomainError } from '../../../common/errors/domain-error';
import { PlatformRule } from '../domain/entities/technical-control.entities';
import { IssuedCertificate } from '../domain/ports/certificate-issuer';
import { buildConnectionSetup, checkM365Tenant, planConnection } from './cloud-connection';

const gcp: PlatformRule = { id: 'p-gcp', capabilityCode: 'ac_01', code: 'gcp', name: 'GCP', logoKey: 'gcp', availability: 'available', connectionMethods: ['identity_federation'], regionCodes: [] };
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

describe('planConnection · Microsoft 365 (D154)', () => {
  const m365: PlatformRule = { id: 'p-m365', capabilityCode: 'ac_01', code: 'microsoft_365', name: 'Microsoft 365', logoKey: 'microsoft_365', availability: 'available', connectionMethods: ['app_certificate'], regionCodes: [] };
  const TENANT = '3F2A91C4-7B6D-4E0A-9C11-5D8E2F7A0B13';
  const issued: IssuedCertificate = { privateKeyPem: 'PRIV', certificatePem: 'PUB', thumbprint: 'AB12', expiresAt: new Date('2028-11-22T00:00:00Z') };
  const make = (over = {}) => ({ connectionMethod: 'app_certificate' as const, externalAccountId: TENANT, ...over });
  const deps = () => {
    const labels: string[] = [];
    return { labels, deps: { issueCertificate: (label: string) => (labels.push(label), issued) } };
  };

  it('el activo es el tenant (en minúsculas), sin regiones, y el certificado lo genera Monkey', () => {
    const d = deps();
    const { errors, plan } = planConnection(make(), m365, d.deps);
    expect(errors).toEqual([]);
    expect(plan).toMatchObject({ method: 'app_certificate', platform: 'microsoft_365', externalAccountId: TENANT.toLowerCase(), regions: [], externalId: null });
    // Lo secreto va aparte de lo público: la clave privada y el PFX se cifran; el certificado público se muestra.
    expect(plan?.secretToStore).toEqual({ private_key_pem: 'PRIV' });
    expect(plan?.certificate).toEqual({ pem: 'PUB', thumbprint: 'AB12', expiresAt: issued.expiresAt });
    expect(d.labels).toEqual([TENANT.toLowerCase()]);
  });

  it.each([
    ['sin tenant', { externalAccountId: undefined }, 'required'],
    ['con algo que no es un GUID', { externalAccountId: '123456789012' }, 'invalid'],
    ['con un GUID con texto extra', { externalAccountId: `${TENANT} x` }, 'invalid'],
  ])('%s → 422 en external_account_id y NO se genera ningún certificado', (_n, over, code) => {
    const d = deps();
    expect(planConnection(make(over), m365, d.deps).errors).toEqual([{ field: 'external_account_id', code }]);
    expect(d.labels).toEqual([]);
  });

  it('regiones y credenciales no se admiten (el tenant se evalúa completo y no hay llaves del cliente)', () => {
    const d = deps();
    expect(planConnection(make({ regions: ['us-east-1'] }), m365, d.deps).errors).toEqual([{ field: 'regions', code: 'field.not_allowed' }]);
    expect(planConnection(make({ credentials: { access_key_id: 'x' } }), m365, d.deps).errors).toEqual([{ field: 'credentials', code: 'field.not_allowed' }]);
    expect(d.labels).toEqual([]);
  });

  it('el canal solo existe en Microsoft 365 y Microsoft 365 no tiene otros', () => {
    expect(() => planConnection(make(), aws, deps().deps)).toThrow(DomainError);
    expect(() => planConnection({ connectionMethod: 'identity_federation', externalAccountId: 'acme-prod-421905' }, m365)).toThrow(DomainError);
  });

  it('checkM365Tenant: acepta el GUID en cualquier caja y lo guarda en minúsculas', () => {
    expect(checkM365Tenant(`  ${TENANT}  `)).toEqual({ errors: [], tenant: TENANT.toLowerCase() });
    expect(checkM365Tenant(null).errors).toEqual([{ field: 'external_account_id', code: 'required' }]);
  });
});

describe('buildConnectionSetup · Microsoft 365', () => {
  const certificate = { pem: 'PUB', thumbprint: 'AB12', expiresAt: new Date('2028-11-22T00:00:00Z') };
  const base = { connectionMethod: 'app_certificate' as const, externalId: null, roleArn: null, externalAccountId: '3f2a91c4-7b6d-4e0a-9c11-5d8e2f7a0b13', certificate };

  it('lleva el tenant, el ID de la aplicación (nulo al principio), el certificado público, la ruta del script y los pasos', () => {
    expect(buildConnectionSetup({ ...base, appClientId: null }, null)).toEqual({
      method: 'app_certificate',
      tenantId: '3f2a91c4-7b6d-4e0a-9c11-5d8e2f7a0b13',
      clientId: null,
      certificate,
      templatePath: '/v1/connection-templates/microsoft-365-app',
      steps: ['connection.m365_app.step_1', 'connection.m365_app.step_2', 'connection.m365_app.step_3'],
    });
  });

  it('una vez entregado el ID de la aplicación, se devuelve', () => {
    expect(buildConnectionSetup({ ...base, appClientId: '0b8c3e1a-2d4f-4a6b-8c9d-1e2f3a4b5c6d' }, null)).toMatchObject({ clientId: '0b8c3e1a-2d4f-4a6b-8c9d-1e2f3a4b5c6d' });
  });

  it('sin certificado no hay escenario que mostrar (no se inventa)', () => {
    expect(buildConnectionSetup({ ...base, certificate: null }, null)).toBeNull();
  });
});
