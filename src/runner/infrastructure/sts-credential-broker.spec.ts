import { AssumeRoleCommand } from '@aws-sdk/client-sts';
import { RunnerJob } from '../domain/runner.types';
import { StsCredentialBroker } from './sts-credential-broker';

const job = (over: Partial<RunnerJob> = {}): RunnerJob => ({
  executionId: 'abcdef12-0000', tenantId: 't', assetId: 'a', origin: 'manual', platform: 'aws', externalAccountId: '123456789012', regions: ['us-east-1'],
  connection: { method: 'readonly_role', roleArn: 'arn:aws:iam::123456789012:role/MonkeyReadOnly', externalId: 'mk-1' }, ...over,
});
const named = (name: string) => Object.assign(new Error('x'), { name });
const assumed = (account = '123456789012') => ({ Credentials: { AccessKeyId: 'ASIA', SecretAccessKey: 's', SessionToken: 't' }, AssumedRoleUser: { Arn: `arn:aws:sts::${account}:assumed-role/MonkeyReadOnly/s` } });

describe('StsCredentialBroker', () => {
  it('asume el rol con su ExternalId y entrega credenciales TEMPORALES (con token de sesión)', async () => {
    const sent: unknown[] = [];
    const broker = new StsCredentialBroker({ send: (c: unknown) => { sent.push(c); return Promise.resolve(assumed()); } } as never);
    expect(await broker.obtain(job())).toEqual({ accessKeyId: 'ASIA', secretAccessKey: 's', sessionToken: 't' });
    const input = (sent[0] as AssumeRoleCommand).input;
    expect(input).toMatchObject({ RoleArn: 'arn:aws:iam::123456789012:role/MonkeyReadOnly', ExternalId: 'mk-1', DurationSeconds: 3600, RoleSessionName: 'monkey-abcdef12' });
  });

  it('AccessDenied al asumir → connection.role_not_found (le toca al cliente revisar el rol)', async () => {
    const broker = new StsCredentialBroker({ send: () => Promise.reject(named('AccessDenied')) } as never);
    await expect(broker.obtain(job())).rejects.toMatchObject({ reason: 'connection.role_not_found' });
  });

  it('un error nuestro (llaves base vencidas, sin red) NO se le achaca al cliente', async () => {
    const broker = new StsCredentialBroker({ send: () => Promise.reject(named('ExpiredToken')) } as never);
    await expect(broker.obtain(job())).rejects.toMatchObject({ reason: 'execution.engine_failed' });
  });

  it('un rol de OTRA cuenta que la declarada se rechaza: nunca se evalúa una cuenta distinta', async () => {
    const broker = new StsCredentialBroker({ send: () => Promise.resolve(assumed('999999999999')) } as never);
    await expect(broker.obtain(job())).rejects.toMatchObject({ reason: 'connection.account_mismatch' });
  });

  it('sin ExternalId guardado no lo envía', async () => {
    const sent: unknown[] = [];
    const broker = new StsCredentialBroker({ send: (c: unknown) => { sent.push(c); return Promise.resolve(assumed()); } } as never);
    await broker.obtain(job({ connection: { method: 'readonly_role', roleArn: 'arn:r', externalId: null } }));
    expect((sent[0] as AssumeRoleCommand).input.ExternalId).toBeUndefined();
  });

  it('una respuesta sin credenciales es un fallo, no un éxito vacío', async () => {
    const broker = new StsCredentialBroker({ send: () => Promise.resolve({ Credentials: {} }) } as never);
    await expect(broker.obtain(job())).rejects.toMatchObject({ reason: 'execution.engine_failed' });
  });
});
