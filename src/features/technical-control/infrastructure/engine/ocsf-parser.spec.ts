import { EngineOutputError, parseOcsfFindings } from './ocsf-parser';

const row = (over: Record<string, unknown> = {}) => ({
  status_code: 'FAIL',
  severity: 'High',
  status_detail: 'x',
  metadata: { event_code: 'iam_root_mfa_enabled' },
  cloud: { region: 'us-east-1' },
  resources: [{ uid: 'arn:aws:iam::123:root', type: 'AwsIamUser', name: 'root' }],
  ...over,
});

describe('parseOcsfFindings', () => {
  it('normaliza un hallazgo', () => {
    expect(parseOcsfFindings([row()])[0]).toEqual({
      checkId: 'iam_root_mfa_enabled', status: 'failed', region: 'us-east-1', severity: 'high', detail: 'x',
      resource: { uid: 'arn:aws:iam::123:root', type: 'AwsIamUser', name: 'root' },
    });
  });
  it('reconoce MANUAL y un hallazgo silenciado (Suppressed)', () => {
    expect(parseOcsfFindings([row({ status_code: 'MANUAL' })])[0].status).toBe('manual');
    expect(parseOcsfFindings([row({ status: 'Suppressed' })])[0].status).toBe('muted');
  });
  it('un estado desconocido no se descarta: queda unknown', () => {
    expect(parseOcsfFindings([row({ status_code: 'WEIRD' })])[0].status).toBe('unknown');
  });
  it('falla en voz alta con una fila mal formada, diciendo cuál', () => {
    expect(() => parseOcsfFindings([row(), row({ metadata: {} })])).toThrow(/Hallazgo 1/);
    expect(() => parseOcsfFindings([row({ resources: [] })])).toThrow(EngineOutputError);
    expect(() => parseOcsfFindings({})).toThrow(EngineOutputError);
  });
});
