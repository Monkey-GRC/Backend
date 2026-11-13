import { RunnerFailure } from '../../../domain/runner.types';
import { prowlerAwsProfile } from '../aws/aws-engine-profile';
import { prowlerGcpProfile } from './gcp-engine-profile';

const gcp = { provider: 'gcp' as const, accessToken: 'token-gcp', expiresAt: new Date() };
const aws = { provider: 'aws' as const, accessKeyId: 'ASIA', secretAccessKey: 's', sessionToken: 't' };
const input = (over = {}) => ({ executionId: 'e', accountId: 'acme-prod-421905', regions: [], credentials: gcp, ...over });

describe('prowlerGcpProfile', () => {
  const p = prowlerGcpProfile('toniblyx/prowler:5.44.0');

  it('evalúa el proyecto completo, sin regiones, y excluye el check que necesita un servicio externo', () => {
    expect(p.command(input())).toEqual([
      'gcp', '--project-id', 'acme-prod-421905', '-M', 'json-ocsf', '-F', 'scan', '-o', '/home/prowler/output', '--no-banner', '--ignore-exit-code-3', '--log-level', 'ERROR',
      '--excluded-check', 'compute_public_address_shodan',
    ]);
    expect(p.outputPath).toBe('/home/prowler/output/scan.ocsf.json');
  });

  it('el entorno lleva solo el token de acceso y el proyecto: nunca credenciales de AWS', () => {
    expect(p.env(input())).toEqual(['CLOUDSDK_AUTH_ACCESS_TOKEN=token-gcp', 'GOOGLE_CLOUD_PROJECT=acme-prod-421905']);
  });

  it.each([[null], ['ACME-prod'], ['x; rm -rf /'], ['--project'], ['a']])('rechaza el proyecto %j antes de tocar Docker', (accountId) => {
    expect(() => p.command(input({ accountId }))).toThrow(RunnerFailure);
    expect(() => p.env(input({ accountId }))).toThrow(RunnerFailure);
  });

  it('rechaza credenciales de otra nube', () => {
    expect(() => p.env(input({ credentials: aws }))).toThrow(RunnerFailure);
  });
});

describe('prowlerAwsProfile (sin cambios)', () => {
  const p = prowlerAwsProfile('toniblyx/prowler:5.44.0');
  it('el entorno lleva las credenciales temporales de AWS como antes', () => {
    expect(p.env({ executionId: 'e', accountId: '1', regions: ['us-east-1'], credentials: aws })).toEqual(['AWS_DEFAULT_REGION=us-east-1', 'AWS_ACCESS_KEY_ID=ASIA', 'AWS_SECRET_ACCESS_KEY=s', 'AWS_SESSION_TOKEN=t']);
  });
  it('rechaza credenciales de GCP', () => {
    expect(() => p.env({ executionId: 'e', accountId: '1', regions: ['us-east-1'], credentials: gcp })).toThrow(RunnerFailure);
  });
  it('el comando sigue siendo el de regiones', () => {
    expect(p.command({ executionId: 'e', accountId: '1', regions: ['us-east-1'], credentials: aws }).slice(0, 3)).toEqual(['aws', '-f', 'us-east-1']);
  });
});
