import { STSClient } from '@aws-sdk/client-sts';

// Lo que comparten los brokers de AWS y de GCP: los dos parten de la identidad base de AWS del trabajador y asumen un rol de 1 h (SEG-46).
export const SESSION_SECONDS = 3600;
export type StsLike = Pick<STSClient, 'send'>;
export const createBaseSts = (): StsLike => new STSClient({ region: process.env['AWS_REGION'] ?? 'us-east-1' });
// Solo el nombre de la clase del error: nunca su contenido, que puede traer datos de la cuenta.
export const errName = (e: unknown): string => (e as { name?: string })?.name ?? 'Error';
