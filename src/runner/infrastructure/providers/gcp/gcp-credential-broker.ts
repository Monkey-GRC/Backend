import { AssumeRoleCommand } from '@aws-sdk/client-sts';
import { CredentialBroker } from '../../../domain/ports';
import { FAILURE, RunnerFailure, RunnerJob, TemporaryCredentials } from '../../../domain/runner.types';
import { createBaseSts, errName, SESSION_SECONDS, StsLike } from '../sts-base';
import { buildAwsSubjectToken } from './aws-subject-token';

// GCP se conecta SIN llaves (D112): la identidad de origen es un rol de AWS de Monkey sin permisos (`monkey-gcp-federation`) que se asume con el `external_id`
// del activo como nombre de sesión. El proyecto del cliente solo acepta esa sesión; con ella:
//   1. la sesión firma una petición `GetCallerIdentity` (el «subject token» de AWS) con la audiencia del proveedor del proyecto;
//   2. STS de Google la cambia por un token federado;
//   3. ese token pide un token de acceso de 1 h para `monkey-reader@<proyecto>`, la cuenta de solo lectura que creó el script de alta.
// El motor solo recibe el token del paso 3 (SEG-46). Nunca se registra un token ni una credencial: solo clases de error y códigos HTTP.
const TOKEN_LIFETIME = '3600s';
const SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const STS_URL = 'https://sts.googleapis.com/v1/token';
const IAM_CREDENTIALS_URL = 'https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts';
const RESOURCE_MANAGER_URL = 'https://cloudresourcemanager.googleapis.com/v1/projects';
const HTTP_TIMEOUT_MS = 20_000;
// Los nombres que crea el script de alta en el proyecto del cliente (`gcp-identity-federation.template.ts`). Son un acuerdo entre los dos lados:
// el trabajador no importa del backend, así que una prueba comprueba que coinciden.
export const GCP_FEDERATION_NAMES = { poolId: 'monkey-access', providerId: 'monkey-aws', serviceAccountId: 'monkey-reader' } as const;
// Lo que el cliente puede corregir: Google rechazó la identidad o el proyecto. 5xx, 429 y fallos de red son nuestros (o de Google), no de su conexión.
const CLIENT_REJECTIONS = new Set([400, 401, 403, 404]);

type Fetch = typeof fetch;

export class GcpCredentialBroker extends CredentialBroker {
  constructor(
    private readonly federationRoleArn: string,
    private readonly base: StsLike = createBaseSts(),
    private readonly http: Fetch = fetch,
    private readonly now: () => Date = () => new Date(),
  ) {
    super();
  }

  async obtain(job: RunnerJob): Promise<TemporaryCredentials> {
    const c = job.connection;
    if (c.method !== 'identity_federation' || !job.externalAccountId) throw new RunnerFailure(FAILURE.methodNotSupportedByRunner);
    const projectId = job.externalAccountId;
    const { poolId, providerId, serviceAccountId } = GCP_FEDERATION_NAMES;
    const audience = `//iam.googleapis.com/projects/${c.projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`;

    const session = await this.assumeFederationRole(c.externalId);
    const federated = await this.exchange(buildAwsSubjectToken(session, audience, this.now()), audience);
    const access = await this.impersonate(federated, `${serviceAccountId}@${projectId}.iam.gserviceaccount.com`);
    await this.assertProject(access.accessToken, projectId, c.projectNumber);
    return { provider: 'gcp', accessToken: access.accessToken, expiresAt: access.expiresAt };
  }

  // Un fallo aquí es nuestro (el rol de Monkey, las llaves base vencidas, sin red): jamás se le achaca al cliente.
  private async assumeFederationRole(externalId: string) {
    let out;
    try {
      out = await this.base.send(new AssumeRoleCommand({ RoleArn: this.federationRoleArn, RoleSessionName: externalId, DurationSeconds: SESSION_SECONDS }));
    } catch (e) {
      throw new RunnerFailure(FAILURE.engineFailed, errName(e));
    }
    const cr = out.Credentials;
    if (!cr?.AccessKeyId || !cr.SecretAccessKey || !cr.SessionToken) throw new RunnerFailure(FAILURE.engineFailed, 'sin credenciales en la respuesta');
    return { accessKeyId: cr.AccessKeyId, secretAccessKey: cr.SecretAccessKey, sessionToken: cr.SessionToken };
  }

  private async exchange(subjectToken: string, audience: string): Promise<string> {
    const body = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      audience,
      scope: SCOPE,
      requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      subject_token_type: 'urn:ietf:params:aws:token-type:aws4_request',
      subject_token: subjectToken,
    });
    const json = await this.call(STS_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() }, 'sts');
    const token = json['access_token'];
    if (typeof token !== 'string' || !token) throw new RunnerFailure(FAILURE.engineFailed, 'sts sin token');
    return token;
  }

  private async impersonate(federatedToken: string, serviceAccount: string): Promise<{ accessToken: string; expiresAt: Date }> {
    const json = await this.call(
      `${IAM_CREDENTIALS_URL}/${encodeURIComponent(serviceAccount)}:generateAccessToken`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${federatedToken}` }, body: JSON.stringify({ scope: [SCOPE], lifetime: TOKEN_LIFETIME }) },
      'generateAccessToken',
    );
    const token = json['accessToken'];
    if (typeof token !== 'string' || !token) throw new RunnerFailure(FAILURE.engineFailed, 'generateAccessToken sin token');
    const expiresAt = new Date(typeof json['expireTime'] === 'string' ? json['expireTime'] : NaN);
    return { accessToken: token, expiresAt: Number.isNaN(expiresAt.getTime()) ? new Date(this.now().getTime() + SESSION_SECONDS * 1000) : expiresAt };
  }

  // El proyecto al que da acceso el token es el declarado (ID y número). Si no, nunca se evalúa.
  private async assertProject(accessToken: string, projectId: string, projectNumber: string): Promise<void> {
    const json = await this.call(`${RESOURCE_MANAGER_URL}/${encodeURIComponent(projectId)}`, { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } }, 'projects.get');
    if (json['projectId'] !== projectId || String(json['projectNumber']) !== projectNumber) throw new RunnerFailure(FAILURE.accountMismatch);
  }

  private async call(url: string, init: RequestInit, step: string): Promise<Record<string, unknown>> {
    let res: Response;
    try {
      res = await this.http(url, { ...init, signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) });
    } catch (e) {
      throw new RunnerFailure(FAILURE.engineFailed, `${step}: ${errName(e)}`);
    }
    // Nunca se vuelca el cuerpo de un error: puede repetir lo que se envió.
    if (CLIENT_REJECTIONS.has(res.status)) throw new RunnerFailure(FAILURE.federationRejected, `${step}: ${res.status}`);
    if (!res.ok) throw new RunnerFailure(FAILURE.engineFailed, `${step}: ${res.status}`);
    try {
      const json: unknown = await res.json();
      if (json && typeof json === 'object') return json as Record<string, unknown>;
    } catch {
      /* cae abajo */
    }
    throw new RunnerFailure(FAILURE.engineFailed, `${step}: respuesta no válida`);
  }
}
