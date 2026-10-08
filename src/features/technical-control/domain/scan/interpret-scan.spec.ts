import { interpretScan, resourceKey } from './interpret-scan';
import { EngineFinding } from './scan.types';

const f = (over: Partial<EngineFinding> & { checkId: string }): EngineFinding => ({
  status: 'passed',
  region: 'us-east-1',
  severity: 'medium',
  detail: null,
  resource: { uid: 'arn:aws:ec2:us-east-1:123:security-group/sg-1', type: 'AwsEc2SecurityGroup', name: 'sg-1' },
  ...over,
});

describe('resourceKey', () => {
  it('funde un recurso de cuenta repetido por región', () => {
    expect(resourceKey('arn:aws:bedrock:us-east-1:123:logging', 'us-east-1')).toBe(resourceKey('arn:aws:bedrock:us-east-2:123:logging', 'us-east-2'));
  });
  it('no funde recursos distintos', () => {
    expect(resourceKey('arn:aws:ec2:us-east-1:123:sg/a', 'us-east-1')).not.toBe(resourceKey('arn:aws:ec2:us-east-1:123:sg/b', 'us-east-1'));
  });
});

describe('interpretScan', () => {
  it('un check ejecutado sin filas queda not_applicable (no «cumplido» ni descartado)', () => {
    const { results } = interpretScan({ executedCheckIds: ['s3_x', 'ec2_y'], findings: [f({ checkId: 'ec2_y' })] });
    expect(results.find((r) => r.checkId === 's3_x')).toMatchObject({ result: 'not_applicable', resourceKey: null });
    expect(results.find((r) => r.checkId === 'ec2_y')?.result).toBe('passed');
  });

  it('mapea los estados: MANUAL → not_run, desconocido → invalid', () => {
    const { results } = interpretScan({
      executedCheckIds: ['a', 'b'],
      findings: [f({ checkId: 'a', status: 'manual' }), f({ checkId: 'b', status: 'unknown' })],
    });
    expect(results.map((r) => r.result).sort()).toEqual(['invalid', 'not_run']);
  });

  it('un silencio hecho en el motor no se cree: cuenta como fallo', () => {
    const { results } = interpretScan({ executedCheckIds: ['a'], findings: [f({ checkId: 'a', status: 'muted' })] });
    expect(results[0].result).toBe('failed');
  });

  it('funde la misma configuración repetida por región en UNA evaluación, y manda la peor', () => {
    const uid = (r: string) => `arn:aws:bedrock:${r}:123:model-invocation-logging`;
    const rows = [
      f({ checkId: 'bedrock_x', region: 'us-east-1', status: 'passed', resource: { uid: uid('us-east-1'), type: 'Other', name: null } }),
      f({ checkId: 'bedrock_x', region: 'us-east-2', status: 'failed', severity: 'high', resource: { uid: uid('us-east-2'), type: 'Other', name: null } }),
    ];
    const { results } = interpretScan({ executedCheckIds: ['bedrock_x'], findings: rows });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ result: 'failed', severity: 'high', regions: ['us-east-1', 'us-east-2'] });
  });

  it('dos recursos distintos del mismo check son dos evaluaciones', () => {
    const rows = [
      f({ checkId: 'sg_x' }),
      f({ checkId: 'sg_x', resource: { uid: 'arn:aws:ec2:us-east-1:123:security-group/sg-2', type: 'AwsEc2SecurityGroup', name: 'sg-2' } }),
    ];
    expect(interpretScan({ executedCheckIds: ['sg_x'], findings: rows }).results).toHaveLength(2);
  });

  it('informa un check que el motor devolvió y no estaba en la corrida, sin descartarlo en silencio', () => {
    const { results, unexpectedChecks } = interpretScan({ executedCheckIds: ['a'], findings: [f({ checkId: 'zzz' })] });
    expect(unexpectedChecks).toEqual(['zzz']);
    expect(results.map((r) => r.checkId)).toEqual(['a']);
  });
});
