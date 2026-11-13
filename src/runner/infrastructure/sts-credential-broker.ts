import { GetCallerIdentityCommand, AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { CredentialBroker } from '../domain/ports';
import { FAILURE, RunnerFailure, RunnerJob, TemporaryCredentials } from '../domain/runner.types';

// Quien mira la cuenta del cliente es SIEMPRE una credencial temporal (SEG-46):
//  - rol de solo lectura: se asume con el ExternalId de la conexión → credenciales de 1 hora;
//  - llaves (canal menos seguro): se comprueban y se pasan tal cual.
// La identidad base con la que se asume el rol sale del entorno del trabajador (en desarrollo, llaves de una cuenta de pruebas; en producción,
// una identidad propia de Monkey sin llaves guardadas, DT-43).
const SESSION_SECONDS = 3600;

type StsLike = Pick<STSClient, 'send'>;
const accountOf = (arn: string | undefined) => arn?.split(':')[4] ?? null;
const errName = (e: unknown) => (e as { name?: string })?.name ?? '';

export class StsCredentialBroker extends CredentialBroker {
  constructor(private readonly base: StsLike = new STSClient({ region: process.env['AWS_REGION'] ?? 'us-east-1' })) {
    super();
  }

  async obtain(job: RunnerJob): Promise<TemporaryCredentials> {
    // Un servidor con agente (D112) no tiene credenciales del cliente: lo lee la sonda, no este corredor. Aquí no debería llegar (RunNextExecution lo desvía).
    if (job.connection.method === 'agent') throw new RunnerFailure(FAILURE.methodNotSupported);
    return job.connection.method === 'readonly_role' ? this.assume(job, job.connection) : this.verifyKeys(job, job.connection);
  }

  private async assume(job: RunnerJob, c: { roleArn: string; externalId: string | null }): Promise<TemporaryCredentials> {
    let out;
    try {
      out = await this.base.send(
        new AssumeRoleCommand({ RoleArn: c.roleArn, RoleSessionName: `monkey-${job.executionId.slice(0, 8)}`, DurationSeconds: SESSION_SECONDS, ...(c.externalId ? { ExternalId: c.externalId } : {}) }),
      );
    } catch (e) {
      // AccessDenied: el rol no existe, no confía en Monkey o el ExternalId no coincide: al cliente le toca revisar el rol (no es un fallo nuestro).
      // Cualquier otra cosa (nuestras propias llaves vencidas, sin red) es del trabajador, no de la conexión del cliente.
      throw new RunnerFailure(errName(e) === 'AccessDenied' || errName(e) === 'AccessDeniedException' ? FAILURE.roleNotFound : FAILURE.engineFailed, errName(e));
    }
    const cr = out.Credentials;
    if (!cr?.AccessKeyId || !cr.SecretAccessKey || !cr.SessionToken) throw new RunnerFailure(FAILURE.engineFailed, 'sin credenciales en la respuesta');
    // Cuenta equivocada: nunca se evalúa una cuenta distinta de la declarada.
    const assumed = accountOf(out.AssumedRoleUser?.Arn);
    if (job.externalAccountId && assumed && assumed !== job.externalAccountId) throw new RunnerFailure(FAILURE.accountMismatch);
    return { accessKeyId: cr.AccessKeyId, secretAccessKey: cr.SecretAccessKey, sessionToken: cr.SessionToken };
  }

  private async verifyKeys(job: RunnerJob, c: { accessKeyId: string; secretAccessKey: string }): Promise<TemporaryCredentials> {
    const sts = new STSClient({ region: process.env['AWS_REGION'] ?? 'us-east-1', credentials: { accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey } });
    try {
      const who = await sts.send(new GetCallerIdentityCommand({}));
      if (job.externalAccountId && who.Account && who.Account !== job.externalAccountId) throw new RunnerFailure(FAILURE.accountMismatch);
    } catch (e) {
      if (e instanceof RunnerFailure) throw e;
      throw new RunnerFailure(FAILURE.credentialsInvalid, errName(e));
    }
    return { accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey, sessionToken: null };
  }
}
