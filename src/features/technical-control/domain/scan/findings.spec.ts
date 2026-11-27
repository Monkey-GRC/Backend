import { buildFindings, classifyFailure, FailedRow, FindingsContext, MAX_RESOURCES_PER_FINDING } from './findings';

const row = (patch: Partial<FailedRow> = {}): FailedRow => ({
  checkId: 'c1',
  role: 'direct',
  assetId: 'a1',
  assetName: 'cuenta-produccion',
  assetCriticality: 'low',
  severity: 'critical',
  check: { titleEn: 'Bucket allows public access', titleEs: null, condition: 'Buckets are evaluated.', remediation: 'Enable block public access.', remediationEs: null, translationOrigin: null },
  resourceName: 'bucket-a',
  resourceUid: 'arn:aws:s3:::bucket-a',
  region: 'us-east-1',
  failingSince: new Date('2026-11-20T05:40:00Z'),
  ...patch,
});

const ctx = (patch: Partial<FindingsContext> = {}): FindingsContext => ({
  direct: new Map([['a1', 'fail' as const]]),
  exceptions: new Map(),
  plan: null,
  controlOwner: { id: 'u-owner', name: 'Laura', lastName: 'Gómez' },
  language: 'en',
  fallbackTitle: 'x',
  ...patch,
});

// D138 punto 3, MD-502 · Una fila por check y activo: brecha abierta, exceptuada u observación; lo decide el motor v2.
describe('classifyFailure', () => {
  it('un Complementario es observación, sea cual sea la lectura Directa del activo', () => {
    expect(classifyFailure('complementary', 'fail')).toBe('observation');
    expect(classifyFailure('complementary', null)).toBe('observation');
  });

  it('un Directo es brecha si el motor lo lee en FAIL y exceptuada si lo lee con excepción', () => {
    expect(classifyFailure('direct', 'fail')).toBe('gap');
    expect(classifyFailure('direct', 'fail_with_exception')).toBe('excepted');
  });

  it('un Directo que el motor no lee en FAIL (corrida vencida, sin datos) no es nada', () => {
    expect(classifyFailure('direct', null)).toBeNull();
    expect(classifyFailure('direct', undefined)).toBeNull();
  });
});

describe('buildFindings', () => {
  it('arma un ítem por check y activo con sus recursos, la prioridad y su base', () => {
    const { items, summary } = buildFindings([row(), row({ resourceName: 'bucket-b', resourceUid: 'arn:aws:s3:::bucket-b' })], ctx());
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: 'a1:c1', kind: 'gap', asset: { id: 'a1', name: 'cuenta-produccion', criticality: 'low' }, priority: 'high', priorityBasis: { severity: 'critical', assetCriticality: 'low' }, resourcesTotal: 2,
    });
    expect(items[0].resources.map((r) => r.name)).toEqual(['bucket-a', 'bucket-b']);
    expect(summary).toEqual({ openGaps: 1, excepted: 0, observations: 0 });
  });

  it('el mismo check en dos activos son dos ítems; cuenta el mismo recurso una vez y toma la severidad más grave', () => {
    const { items } = buildFindings(
      [row({ severity: 'low' }), row({ severity: 'critical' }), row({ assetId: 'a2', assetName: 'otra', assetCriticality: 'high', severity: 'low' })],
      ctx({ direct: new Map([['a1', 'fail' as const], ['a2', 'fail' as const]]) }),
    );
    expect(items).toHaveLength(2);
    const first = items.find((i) => i.asset.id === 'a1');
    expect(first?.resources).toHaveLength(1);
    expect(first?.priorityBasis?.severity).toBe('critical');
    expect(items.find((i) => i.asset.id === 'a2')?.priority).toBe('medium');
  });

  it('una brecha exceptuada lleva su excepción y sigue con prioridad y responsable; no cuenta como abierta', () => {
    const { items, summary } = buildFindings([row()], ctx({ direct: new Map([['a1', 'fail_with_exception' as const]]), exceptions: new Map([['a1', { id: 'ex1', effectiveUntil: '2026-12-31' }]]) }));
    expect(items[0]).toMatchObject({ kind: 'excepted', exception: { id: 'ex1', effectiveUntil: '2026-12-31' }, priority: 'high', owner: { id: 'u-owner' } });
    expect(summary).toEqual({ openGaps: 0, excepted: 1, observations: 0 });
  });

  it('una observación no lleva prioridad, base, responsable, fecha ni excepción', () => {
    const { items } = buildFindings([row({ role: 'complementary' })], ctx({ plan: { assignee: { id: 'u-plan', name: 'P', lastName: 'Q' }, dueDate: '2026-12-15' } }));
    expect(items[0]).toMatchObject({ kind: 'observation', priority: null, priorityBasis: null, owner: null, dueDate: null, exception: null });
  });

  it('el responsable y la fecha son los del plan vigente; sin plan, el responsable del control y sin fecha', () => {
    const withPlan = buildFindings([row()], ctx({ plan: { assignee: { id: 'u-plan', name: 'Pedro', lastName: 'Ruiz' }, dueDate: '2026-12-15' } })).items[0];
    expect(withPlan.owner).toEqual({ id: 'u-plan', name: 'Pedro', lastName: 'Ruiz' });
    expect(withPlan.dueDate).toBe('2026-12-15');
    const without = buildFindings([row()], ctx()).items[0];
    expect(without.owner).toEqual({ id: 'u-owner', name: 'Laura', lastName: 'Gómez' });
    expect(without.dueDate).toBeNull();
    expect(buildFindings([row()], ctx({ controlOwner: null })).items[0].owner).toBeNull();
  });

  it('deja fuera un Directo que el motor no lee en FAIL', () => {
    expect(buildFindings([row()], ctx({ direct: new Map() })).items).toEqual([]);
  });

  it('failing_since es la primera corrida de la racha (la más antigua de sus filas)', () => {
    const { items } = buildFindings([row({ failingSince: new Date('2026-11-25T00:00:00Z') }), row({ resourceUid: 'u2', failingSince: new Date('2026-11-20T00:00:00Z') })], ctx());
    expect(items[0].failingSince).toEqual(new Date('2026-11-20T00:00:00Z'));
  });

  it('ordena las brechas por prioridad, luego las exceptuadas y al final las observaciones; dentro de cada grupo, por título', () => {
    const t = (titleEn: string) => ({ ...row().check, titleEn });
    const { items } = buildFindings(
      [
        row({ checkId: 'o1', role: 'complementary', check: t('Aaa observación') }),
        row({ checkId: 'e1', assetId: 'a2', check: t('Bbb exceptuada') }),
        row({ checkId: 'g1', severity: 'low', assetCriticality: 'low', check: t('Aaa baja') }),
        row({ checkId: 'g2', severity: 'critical', assetCriticality: 'critical', check: t('Zzz crítica') }),
        row({ checkId: 'g3', severity: 'critical', assetCriticality: 'critical', check: t('Bbb crítica') }),
        row({ checkId: 'e2', assetId: 'a2', check: t('Aaa exceptuada') }),
      ],
      ctx({ direct: new Map([['a1', 'fail' as const], ['a2', 'fail_with_exception' as const]]) }),
    );
    expect(items.map((i) => i.title)).toEqual(['Bbb crítica', 'Zzz crítica', 'Aaa baja', 'Aaa exceptuada', 'Bbb exceptuada', 'Aaa observación']);
  });

  it('acota los recursos de un ítem a 50 y cuenta el total real', () => {
    const many = Array.from({ length: MAX_RESOURCES_PER_FINDING + 10 }, (_, i) => row({ resourceName: `r${i}`, resourceUid: `uid-${i}` }));
    const { items } = buildFindings(many, ctx());
    expect(items[0].resources).toHaveLength(MAX_RESOURCES_PER_FINDING);
    expect(items[0].resourcesTotal).toBe(MAX_RESOURCES_PER_FINDING + 10);
  });

  it('un servidor no trae recursos: el activo es el recurso', () => {
    const { items } = buildFindings([row({ severity: null, resourceName: null, resourceUid: null, region: null })], ctx());
    expect(items[0]).toMatchObject({ resources: [], resourcesTotal: 0, priority: 'low', priorityBasis: { severity: null, assetCriticality: 'low' } });
  });

  it('en español da la traducción de la guía como generada por IA y el título traducido', () => {
    const { items } = buildFindings([row({ check: { ...row().check, titleEs: 'El bucket permite acceso público', remediationEs: 'Activa el bloqueo.', translationOrigin: 'machine' } })], ctx({ language: 'es' }));
    expect(items[0].title).toBe('El bucket permite acceso público');
    expect(items[0].remediation).toEqual({ text: 'Activa el bloqueo.', language: 'es', isAiGenerated: true });
  });

  it('un texto que nombra al proveedor no sale: título neutro y sin guía', () => {
    const { items } = buildFindings([row({ check: { ...row().check, titleEn: 'Prowler finding', remediation: 'See the Prowler docs.', condition: null } })], ctx({ fallbackTitle: 'Comprobación sin título' }));
    expect(items[0]).toMatchObject({ title: 'Comprobación sin título', remediation: null, evaluated: null });
  });
});
