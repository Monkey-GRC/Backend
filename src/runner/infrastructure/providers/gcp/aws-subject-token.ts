import { createHash, createHmac } from 'node:crypto';

// El «subject token» que Google acepta de una identidad de AWS (federación de identidades de carga de trabajo): la petición `GetCallerIdentity` de STS,
// FIRMADA con SigV4 pero NO enviada, serializada como JSON y codificada en URL. Google la envía a AWS y comprueba quién la firmó. El firmador es propio
// (node:crypto, unas líneas) para no añadir una dependencia: lo único que se firma es esta petición, sin cuerpo.
const REGION = 'us-east-1';
const SERVICE = 'sts';
const HOST = 'sts.amazonaws.com';
const QUERY = 'Action=GetCallerIdentity&Version=2011-06-15';
const EMPTY_PAYLOAD_HASH = createHash('sha256').update('').digest('hex');
const TARGET_HEADER = 'x-goog-cloud-target-resource';

export type SigningCredentials = { accessKeyId: string; secretAccessKey: string; sessionToken: string | null };

const sha256 = (data: string) => createHash('sha256').update(data, 'utf8').digest('hex');
const hmac = (key: Buffer | string, data: string) => createHmac('sha256', key).update(data, 'utf8').digest();

// SigV4 sobre una petición ya canónica: `headers` en minúsculas y `query` ya ordenada y codificada. Exportada para probarla con los vectores de AWS.
export function signV4(input: {
  method: string;
  path: string;
  query: string;
  headers: Record<string, string>;
  payloadHash: string;
  region: string;
  service: string;
  credentials: SigningCredentials;
  amzDate: string; // 20150830T123600Z
}): string {
  const names = Object.keys(input.headers).sort();
  const canonicalHeaders = names.map((n) => `${n}:${input.headers[n].trim()}\n`).join('');
  const signedHeaders = names.join(';');
  const canonicalRequest = [input.method, input.path, input.query, canonicalHeaders, signedHeaders, input.payloadHash].join('\n');
  const day = input.amzDate.slice(0, 8);
  const scope = `${day}/${input.region}/${input.service}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', input.amzDate, scope, sha256(canonicalRequest)].join('\n');
  const key = hmac(hmac(hmac(hmac(`AWS4${input.credentials.secretAccessKey}`, day), input.region), input.service), 'aws4_request');
  const signature = createHmac('sha256', key).update(stringToSign, 'utf8').digest('hex');
  return `AWS4-HMAC-SHA256 Credential=${input.credentials.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

// `audience`: la audiencia del proveedor de identidades; va firmada en `x-goog-cloud-target-resource` para que el token solo sirva para ese proveedor.
export function buildAwsSubjectToken(credentials: SigningCredentials, audience: string, now: Date): string {
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const headers: Record<string, string> = { host: HOST, 'x-amz-date': amzDate, [TARGET_HEADER]: audience };
  if (credentials.sessionToken) headers['x-amz-security-token'] = credentials.sessionToken;
  const authorization = signV4({ method: 'POST', path: '/', query: QUERY, headers, payloadHash: EMPTY_PAYLOAD_HASH, region: REGION, service: SERVICE, credentials, amzDate });
  const request = {
    url: `https://${HOST}?${QUERY}`,
    method: 'POST',
    headers: [{ key: 'Authorization', value: authorization }, ...Object.keys(headers).sort().map((key) => ({ key, value: headers[key] }))],
  };
  return encodeURIComponent(JSON.stringify(request));
}
