import { AwsInventoryScanner } from './aws-inventory-scanner';

const CREDS = { accessKeyId: 'ASIA', secretAccessKey: 's', sessionToken: 't' };
type Cmd = { constructor: { name: string }; input: Record<string, unknown> };

// Un SDK falso: responde según el nombre del comando y la región; `deny` lista los servicios que dan «acceso denegado».
function fakeSdk(deny: string[] = []) {
  const reply = (service: string, region: string, cmd: Cmd) => {
    if (deny.includes(service)) throw Object.assign(new Error('AccessDenied con datos de la cuenta 123456789012'), { name: 'UnauthorizedOperation' });
    switch (cmd.constructor.name) {
      case 'DescribeInstancesCommand':
        return region === 'us-east-1'
          ? { Reservations: [{ Instances: [
              { InstanceId: 'i-aaa', ImageId: 'ami-ubuntu', InstanceType: 't3.micro', State: { Name: 'running' }, PlatformDetails: 'Linux/UNIX', Tags: [{ Key: 'Name', Value: 'api-prod' }] },
              { InstanceId: 'i-bbb', ImageId: 'ami-propia', State: { Name: 'running' }, PlatformDetails: 'Linux/UNIX' },
              { InstanceId: 'i-ccc', State: { Name: 'terminated' } },
            ] }] }
          : { Reservations: [] };
      case 'DescribeImagesCommand': {
        const ids = cmd.input['ImageIds'] as string[];
        // Una imagen inaccesible hace fallar el lote entero (como AWS): hay que reintentar una a una.
        if (ids.length > 1) throw new Error('InvalidAMIID.NotFound');
        return ids[0] === 'ami-ubuntu' ? { Images: [{ ImageId: 'ami-ubuntu', Name: 'ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-2024' }] } : (() => { throw new Error('InvalidAMIID.NotFound'); })();
      }
      case 'DescribeDBInstancesCommand':
        return { DBInstances: [{ DBInstanceArn: `arn:aws:rds:${region}:123456789012:db:main`, DBInstanceIdentifier: 'main', Engine: 'postgres', EngineVersion: '16.3', DBInstanceStatus: 'available', StorageEncrypted: true }] };
      case 'ListFunctionsCommand':
        return { Functions: [{ FunctionArn: `arn:aws:lambda:${region}:123456789012:function:cron`, FunctionName: 'cron', Runtime: 'nodejs20.x' }] };
      case 'ListBucketsCommand':
        return { Buckets: [{ Name: 'datos-prod', BucketRegion: 'us-east-1' }, { Name: 'de-otra-region', BucketRegion: 'eu-west-1' }] };
      default:
        throw new Error(`comando inesperado ${cmd.constructor.name}`);
    }
  };
  const client = (service: string) => (region: string) => ({ send: (cmd: Cmd) => Promise.resolve().then(() => reply(service, region, cmd)) }) as never;
  return () => ({ ec2: client('ec2'), rds: client('rds'), lambda: client('lambda'), s3: client('s3') });
}

describe('AwsInventoryScanner', () => {
  it('descubre servidores, bases de datos, funciones y almacenamiento solo en las regiones declaradas', async () => {
    const inv = await new AwsInventoryScanner(fakeSdk()).discover({ accountId: '123456789012', regions: ['us-east-1'], credentials: CREDS });
    expect(inv.warnings).toEqual([]);
    const byKind = (k: string) => inv.resources.filter((r) => r.kind === k);
    expect(byKind('server').map((r) => r.name).sort()).toEqual(['api-prod', 'i-bbb']); // el terminado no cuenta
    expect(byKind('database')[0].attributes).toMatchObject({ engine: 'postgres', engine_version: '16.3' });
    expect(byKind('function')[0].attributes).toMatchObject({ runtime: 'nodejs20.x' });
    expect(byKind('storage').map((r) => r.name)).toEqual(['datos-prod']); // el de otra región queda fuera
  });

  it('el sistema operativo sale de la imagen y se marca como tal; sin imagen legible no se inventa', async () => {
    const inv = await new AwsInventoryScanner(fakeSdk()).discover({ accountId: '123456789012', regions: ['us-east-1'], credentials: CREDS });
    const api = inv.resources.find((r) => r.name === 'api-prod')!;
    expect(api.attributes).toMatchObject({ os: 'Ubuntu 22.04', os_source: 'image', platform: 'Linux/UNIX' });
    expect(api.uid).toBe('arn:aws:ec2:us-east-1:123456789012:instance/i-aaa');
    const other = inv.resources.find((r) => r.name === 'i-bbb')!;
    expect(other.attributes).toMatchObject({ os: null, os_source: null });
  });

  it('un servicio sin permiso no tumba el resto: se anota como incompleto y no se filtra el error del proveedor', async () => {
    const inv = await new AwsInventoryScanner(fakeSdk(['rds'])).discover({ accountId: '123456789012', regions: ['us-east-1', 'us-east-2'], credentials: CREDS });
    expect(inv.warnings).toEqual(['rds']);
    expect(inv.resources.some((r) => r.kind === 'database')).toBe(false);
    expect(inv.resources.some((r) => r.kind === 'server')).toBe(true);
    expect(JSON.stringify(inv)).not.toMatch(/123456789012:.*AccessDenied|UnauthorizedOperation/);
  });
});
