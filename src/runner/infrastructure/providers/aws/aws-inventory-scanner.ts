import { DescribeImagesCommand, DescribeInstancesCommand, EC2Client, Instance } from '@aws-sdk/client-ec2';
import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda';
import { DescribeDBInstancesCommand, RDSClient } from '@aws-sdk/client-rds';
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { InventoryScanner } from '../../../domain/ports';
import { DiscoveredResource, Inventory } from '../../../domain/inventory';
import { AwsCredentials, TemporaryCredentials } from '../../../domain/runner.types';
import { osFromImage } from './os-from-image';

// Descubre los activos de una cuenta de AWS con las credenciales de SOLO LECTURA de la conexión (D59): servidores (EC2), bases de datos (RDS),
// almacenamiento (S3) y funciones (Lambda), únicamente en las regiones que el cliente declaró. Son llamadas de lectura de segundos, no el motor.
// Un servicio que no se puede leer no aborta nada: se anota en `warnings` para que el cliente vea «incompleto» y no «vacío».
const MAX_RESOURCES = 500;
const OVERALL_TIMEOUT_MS = 15_000;

type Sdk = {
  ec2: (region: string) => Pick<EC2Client, 'send'>;
  rds: (region: string) => Pick<RDSClient, 'send'>;
  lambda: (region: string) => Pick<LambdaClient, 'send'>;
  s3: (region: string) => Pick<S3Client, 'send'>;
};

const sdkFor = (credentials: AwsCredentials): Sdk => {
  const creds = { accessKeyId: credentials.accessKeyId, secretAccessKey: credentials.secretAccessKey, ...(credentials.sessionToken ? { sessionToken: credentials.sessionToken } : {}) };
  const config = (region: string) => ({ region, credentials: creds, maxAttempts: 2 });
  return { ec2: (r) => new EC2Client(config(r)), rds: (r) => new RDSClient(config(r)), lambda: (r) => new LambdaClient(config(r)), s3: (r) => new S3Client(config(r)) };
};

const nameTag = (tags: { Key?: string; Value?: string }[] | undefined): string | null => tags?.find((t) => t.Key === 'Name')?.Value ?? null;
// Las etiquetas del cliente como `clave=valor`: sin las `aws:*` (las pone AWS) ni `Name` (ya es el nombre), y acotadas.
const MAX_TAGS = 20;
const tagList = (tags: { Key?: string; Value?: string }[] | undefined): string[] =>
  (tags ?? [])
    .filter((t) => t.Key && t.Key !== 'Name' && !t.Key.startsWith('aws:'))
    .slice(0, MAX_TAGS)
    .map((t) => `${t.Key}=${t.Value ?? ''}`.slice(0, 120));

export class AwsInventoryScanner extends InventoryScanner {
  constructor(private readonly sdk?: (credentials: AwsCredentials) => Sdk) {
    super();
  }

  async discover(input: { accountId: string | null; regions: string[]; credentials: TemporaryCredentials }): Promise<Inventory> {
    if (input.credentials.provider !== 'aws') throw new Error('credenciales de otra nube');
    const sdk = (this.sdk ?? sdkFor)(input.credentials);
    const resources: DiscoveredResource[] = [];
    const warnings = new Set<string>();
    const guard = async (service: string, work: () => Promise<DiscoveredResource[]>) => {
      try {
        resources.push(...(await work()));
      } catch {
        // Nunca se vuelca el error del proveedor: puede traer datos de la cuenta. Se dice qué servicio no se pudo leer y nada más.
        warnings.add(service);
      }
    };
    const run = Promise.all([
      ...input.regions.flatMap((region) => [
        guard('ec2', () => this.servers(sdk, region, input.accountId)),
        guard('rds', () => this.databases(sdk, region)),
        guard('lambda', () => this.functions(sdk, region)),
      ]),
      guard('s3', () => this.buckets(sdk, input.regions)),
    ]);
    const timeout = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), OVERALL_TIMEOUT_MS).unref());
    if ((await Promise.race([run.then(() => 'done' as const), timeout])) === 'timeout') warnings.add('timeout');
    return { resources: resources.slice(0, MAX_RESOURCES), warnings: [...warnings].sort() };
  }

  private async servers(sdk: Sdk, region: string, accountId: string | null): Promise<DiscoveredResource[]> {
    const ec2 = sdk.ec2(region);
    const instances: Instance[] = [];
    let token: string | undefined;
    do {
      const page = await ec2.send(new DescribeInstancesCommand({ NextToken: token, MaxResults: 100 }));
      for (const r of page.Reservations ?? []) instances.push(...(r.Instances ?? []));
      token = page.NextToken;
    } while (token && instances.length < MAX_RESOURCES);
    const live = instances.filter((i) => i.InstanceId && i.State?.Name !== 'terminated');
    const images = await this.images(ec2, [...new Set(live.map((i) => i.ImageId).filter((x): x is string => !!x))]);
    return live.map((i) => {
      const image = i.ImageId ? images.get(i.ImageId) : undefined;
      const os = osFromImage(image?.name, image?.description) ?? (i.PlatformDetails?.toLowerCase().includes('windows') ? 'Windows' : null);
      return {
        uid: `arn:aws:ec2:${region}:${accountId ?? ''}:instance/${i.InstanceId}`,
        type: 'AwsEc2Instance',
        kind: 'server' as const,
        name: nameTag(i.Tags) ?? i.InstanceId!,
        region,
        attributes: {
          instance_id: i.InstanceId!,
          state: i.State?.Name ?? null,
          instance_type: i.InstanceType ?? null,
          platform: i.PlatformDetails ?? null,
          // El sistema operativo sale de la imagen con la que se lanzó: es una inferencia, y se marca como tal.
          os,
          os_source: os ? 'image' : null,
          architecture: i.Architecture ?? null,
          launched_at: i.LaunchTime?.toISOString() ?? null,
          // Lo que distingue un servidor de otro igual: dónde está y cómo se llega a él.
          private_ip: i.PrivateIpAddress ?? null,
          public_ip: i.PublicIpAddress ?? null,
          availability_zone: i.Placement?.AvailabilityZone ?? null,
          vpc_id: i.VpcId ?? null,
          subnet_id: i.SubnetId ?? null,
        },
        tags: tagList(i.Tags),
      };
    });
  }

  // El nombre de la imagen no siempre se puede leer (imagen retirada o privada de otra cuenta): sin ella, el sistema operativo queda sin decir.
  private async images(ec2: Pick<EC2Client, 'send'>, ids: string[]): Promise<Map<string, { name?: string; description?: string }>> {
    const out = new Map<string, { name?: string; description?: string }>();
    for (let i = 0; i < ids.length; i += 100) {
      try {
        const res = await ec2.send(new DescribeImagesCommand({ ImageIds: ids.slice(i, i + 100) }));
        for (const img of res.Images ?? []) if (img.ImageId) out.set(img.ImageId, { name: img.Name, description: img.Description });
      } catch {
        /* una imagen inaccesible hace fallar el lote entero: se reintenta una a una */
        for (const id of ids.slice(i, i + 100)) {
          try {
            const res = await ec2.send(new DescribeImagesCommand({ ImageIds: [id] }));
            const img = res.Images?.[0];
            if (img?.ImageId) out.set(img.ImageId, { name: img.Name, description: img.Description });
          } catch {
            /* sin imagen: sin sistema operativo */
          }
        }
      }
    }
    return out;
  }

  private async databases(sdk: Sdk, region: string): Promise<DiscoveredResource[]> {
    const rds = sdk.rds(region);
    const out: DiscoveredResource[] = [];
    let marker: string | undefined;
    do {
      const page = await rds.send(new DescribeDBInstancesCommand({ Marker: marker, MaxRecords: 100 }));
      for (const db of page.DBInstances ?? []) {
        if (!db.DBInstanceArn) continue;
        out.push({
          uid: db.DBInstanceArn,
          type: 'AwsRdsDbInstance',
          kind: 'database',
          name: db.DBInstanceIdentifier ?? null,
          region,
          attributes: { engine: db.Engine ?? null, engine_version: db.EngineVersion ?? null, status: db.DBInstanceStatus ?? null, instance_class: db.DBInstanceClass ?? null, multi_az: db.MultiAZ ?? null, encrypted: db.StorageEncrypted ?? null, availability_zone: db.AvailabilityZone ?? null, endpoint: db.Endpoint?.Address ?? null },
          tags: tagList(db.TagList),
        });
      }
      marker = page.Marker;
    } while (marker && out.length < MAX_RESOURCES);
    return out;
  }

  private async functions(sdk: Sdk, region: string): Promise<DiscoveredResource[]> {
    const lambda = sdk.lambda(region);
    const out: DiscoveredResource[] = [];
    let marker: string | undefined;
    do {
      const page = await lambda.send(new ListFunctionsCommand({ Marker: marker, MaxItems: 50 }));
      for (const f of page.Functions ?? []) {
        if (!f.FunctionArn) continue;
        out.push({ uid: f.FunctionArn, type: 'AwsLambdaFunction', kind: 'function', name: f.FunctionName ?? null, region, attributes: { runtime: f.Runtime ?? null, last_modified: f.LastModified ?? null }, tags: [] });
      }
      marker = page.NextMarker;
    } while (marker && out.length < MAX_RESOURCES);
    return out;
  }

  // Los buckets son globales: se listan una vez y se quedan los de las regiones declaradas.
  private async buckets(sdk: Sdk, regions: string[]): Promise<DiscoveredResource[]> {
    const res = await sdk.s3(regions[0] ?? 'us-east-1').send(new ListBucketsCommand({ MaxBuckets: 500 }));
    return (res.Buckets ?? [])
      .filter((b) => b.Name && (!b.BucketRegion || regions.includes(b.BucketRegion)))
      .map((b) => ({ uid: `arn:aws:s3:::${b.Name}`, type: 'AwsS3Bucket', kind: 'storage' as const, name: b.Name!, region: b.BucketRegion ?? null, attributes: { created_at: b.CreationDate?.toISOString() ?? null }, tags: [] }));
  }
}
