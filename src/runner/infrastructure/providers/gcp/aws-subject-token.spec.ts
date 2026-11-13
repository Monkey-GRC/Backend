import { buildAwsSubjectToken, signV4 } from './aws-subject-token';

describe('signV4', () => {
  // Vector oficial de AWS (documentación de Signature Version 4: ListUsers en IAM, clave de ejemplo).
  it('reproduce la firma publicada por AWS', () => {
    const authorization = signV4({
      method: 'GET', path: '/', query: 'Action=ListUsers&Version=2010-05-08',
      headers: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8', host: 'iam.amazonaws.com', 'x-amz-date': '20150830T123600Z' },
      payloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', region: 'us-east-1', service: 'iam',
      credentials: { accessKeyId: 'AKIDEXAMPLE', secretAccessKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY', sessionToken: null }, amzDate: '20150830T123600Z',
    });
    expect(authorization).toBe(
      'AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/iam/aws4_request, SignedHeaders=content-type;host;x-amz-date, Signature=5d672d79c15b13162d9279b0855cfba6789a8edb4c82c400e06b5924a6f2b5d7',
    );
  });
});

describe('buildAwsSubjectToken', () => {
  const audience = '//iam.googleapis.com/projects/407295138461/locations/global/workloadIdentityPools/monkey-access/providers/monkey-aws';
  const creds = { accessKeyId: 'ASIATEMP', secretAccessKey: 'secreto', sessionToken: 'tok' };
  const parse = (t: string) => JSON.parse(decodeURIComponent(t)) as { url: string; method: string; headers: { key: string; value: string }[] };

  it('es la petición GetCallerIdentity firmada, como JSON codificado en URL, con la audiencia firmada', () => {
    const token = buildAwsSubjectToken(creds, audience, new Date('2026-11-12T10:20:30.456Z'));
    expect(token).not.toMatch(/[{}" ]/);
    const req = parse(token);
    expect(req).toMatchObject({ url: 'https://sts.amazonaws.com?Action=GetCallerIdentity&Version=2011-06-15', method: 'POST' });
    const h = Object.fromEntries(req.headers.map((x) => [x.key, x.value]));
    expect(h).toMatchObject({ host: 'sts.amazonaws.com', 'x-amz-date': '20261112T102030Z', 'x-amz-security-token': 'tok', 'x-goog-cloud-target-resource': audience });
    expect(h['Authorization']).toMatch(/^AWS4-HMAC-SHA256 Credential=ASIATEMP\/20261112\/us-east-1\/sts\/aws4_request, SignedHeaders=host;x-amz-date;x-amz-security-token;x-goog-cloud-target-resource, Signature=[0-9a-f]{64}$/);
  });

  it('otra audiencia da otra firma: el token solo sirve para ese proveedor', () => {
    const when = new Date('2026-11-12T10:20:30Z');
    const sig = (t: string) => parse(t).headers.find((x) => x.key === 'Authorization')!.value;
    expect(sig(buildAwsSubjectToken(creds, audience, when))).not.toBe(sig(buildAwsSubjectToken(creds, audience.replace('407295138461', '1'), when)));
  });

  it('nunca lleva la clave secreta', () => {
    expect(decodeURIComponent(buildAwsSubjectToken(creds, audience, new Date()))).not.toContain('secreto');
  });
});
