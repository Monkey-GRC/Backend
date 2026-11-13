import { CredentialBroker, InventoryScanner } from '../../domain/ports';
import { RunnerJob } from '../../domain/runner.types';
import { CloudAdapter, RoutingCredentialBroker, RoutingInventoryScanner } from './cloud-adapters';

const creds = { aws: { provider: 'aws' as const, accessKeyId: 'A', secretAccessKey: 's', sessionToken: null }, gcp: { provider: 'gcp' as const, accessToken: 't', expiresAt: new Date() } };
const brokerOf = (name: 'aws' | 'gcp'): CredentialBroker => ({ obtain: () => Promise.resolve(creds[name]) });
const adapter = (name: 'aws' | 'gcp', inventory: InventoryScanner | null = null): CloudAdapter => ({ broker: brokerOf(name), engineProfile: { image: 'i', outputPath: '/o', command: () => [], env: () => [] }, inventory });
const job = (platform: 'aws' | 'gcp') => ({ platform }) as RunnerJob;

describe('RoutingCredentialBroker', () => {
  it('elige el broker por la plataforma del trabajo', async () => {
    const r = new RoutingCredentialBroker({ aws: adapter('aws'), gcp: adapter('gcp') });
    expect((await r.obtain(job('aws'))).provider).toBe('aws');
    expect((await r.obtain(job('gcp'))).provider).toBe('gcp');
  });
  it('sin adaptador de GCP (sin MONKEY_GCP_FEDERATION_ROLE_ARN) falla con connection.method_not_supported_by_runner', async () => {
    await expect(new RoutingCredentialBroker({ aws: adapter('aws') }).obtain(job('gcp'))).rejects.toMatchObject({ reason: 'connection.method_not_supported_by_runner' });
  });
});

describe('RoutingInventoryScanner', () => {
  const found = { resources: [], warnings: [] };
  it('descubre con el escáner de la nube de las credenciales; GCP no descubre nada (null, no «cuenta vacía»)', async () => {
    const r = new RoutingInventoryScanner({ aws: adapter('aws', { discover: () => Promise.resolve(found) }), gcp: adapter('gcp') });
    expect(await r.discover({ accountId: '1', regions: [], credentials: creds.aws })).toBe(found);
    expect(await r.discover({ accountId: 'p', regions: [], credentials: creds.gcp })).toBeNull();
  });
});
