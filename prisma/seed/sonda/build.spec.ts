import { buildSondaDataset, BuildInput, ExcelCheckRow, RulesetPolicy } from './build';

const UBU22 = 'CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0.';
const UBU24 = 'CIS Ubuntu Linux 24.04 LTS Benchmark v1.0.0.';
const WIN22 = 'CIS Microsoft Windows Server 2022 Benchmark v2.0.0';
const HPUX_A = 'CIS HP-UX 11i Benchmark';
const HPUX_B = 'CIS HP-UX 11i Benchmark v1.5.0';
const PG = 'CIS Benchmark for PostgreSQL 13';

const RULESET: RulesetPolicy[] = [
  { id: 'cis_ubuntu22-04', name: UBU22, file: 'cis_ubuntu22-04.yml' },
  { id: 'cis_ubuntu24-04', name: UBU24, file: 'cis_ubuntu24-04.yml' },
  { id: 'cis_win2022', name: WIN22, file: 'cis_win2022.yml' },
  { id: 'cis_hpux', name: HPUX_A, file: 'cis_hpux_11i.yml' },
  { id: 'cis_hpux_bastille', name: HPUX_B, file: 'cis_hpux_11i_bastille.yml' },
  { id: 'cis_postgresql_13', name: PG, file: 'cis_postgre-sql-13.yml' },
];

const row = (platform: string, policy: string, id: string, extra: ExcelCheckRow = {}): ExcelCheckRow => ({
  Plataforma: platform, Política: policy, 'Check ID': id, Título: `Title ${id}`, Condición: 'all', Remediación: 'Fix it', 'Regla de verificación': 'f:/etc/x -> r:^a', 'SOC 2': 'CC6.3, CC6.6', TSC: '', 'Título (español)': `Título ${id}`, 'Remediación (español)': '', ...extra,
});

const ROWS: ExcelCheckRow[] = [
  row('Ubuntu', UBU22, '28500'), row('Ubuntu', UBU22, '28501', { 'SOC 2': '', TSC: 'CC6.1' }),
  row('Ubuntu', UBU22, '28502', { 'SOC 2': '' }),
  row('Ubuntu', UBU24, '90000'),
  row('Windows', WIN22, '10001'),
  row('HP-UX', HPUX_A, '1'), row('HP-UX', HPUX_B, '1'),
  row('Aplicaciones', PG, 'p1'),
];

const input = (over: Partial<BuildInput> = {}): BuildInput => ({
  rows: ROWS, ruleset: RULESET, soc2RequirementCodes: new Set(['CC6.1', 'CC6.3', 'CC6.6']), source: { file: 'x.xlsx', sha256: 'abc', sondaVersion: '4.14.7', rulesetRef: 'v4.14.7' }, ...over,
});

describe('buildSondaDataset', () => {
  const ds = buildSondaDataset(input());

  describe('políticas', () => {
    it('cada una lleva el id OFICIAL de la sonda (no el nombre de su archivo) y su archivo', () => {
      const hp = ds.policies.find((p) => p.scaId === 'cis_hpux')!;
      expect(hp.yamlFile).toBe('cis_hpux_11i.yml');
      expect(ds.policies.find((p) => p.scaId === 'cis_ubuntu22-04')).toMatchObject({ benchmark: UBU22, platformLabel: 'Ubuntu', platform: 'ubuntu', checkCount: 3 });
    });

    it('se ofrece lo que es un sistema operativo y la sonda entrega; una base de datos se carga pero no se ofrece', () => {
      const pg = ds.policies.find((p) => p.scaId === 'cis_postgresql_13')!;
      expect(pg).toMatchObject({ osCode: null, versionCode: null, isOfferable: false, sortOrder: 0 });
      expect(ds.policies.find((p) => p.scaId === 'cis_win2022')).toMatchObject({ osCode: 'windows', versionCode: 'windows_server_2022', isOfferable: true });
    });

    it('el código de versión lo define Monkey, no la sonda', () => {
      expect(ds.policies.find((p) => p.scaId === 'cis_ubuntu22-04')!.versionCode).toBe('ubuntu_22_04_lts');
    });

    it('las listas salen ordenadas: la distribución más usada primero y, dentro, la versión más nueva', () => {
      const offered = ds.policies.filter((p) => p.isOfferable && p.osCode === 'linux').map((p) => p.versionCode);
      expect(offered).toEqual(['ubuntu_24_04_lts', 'ubuntu_22_04_lts']);
    });

    it('dos políticas del mismo sistema y versión (HP-UX 11i): se ofrece UNA (la de id más corto) y la otra queda sin ofrecer, con otro código, y se avisa', () => {
      const a = ds.policies.find((p) => p.scaId === 'cis_hpux')!;
      const b = ds.policies.find((p) => p.scaId === 'cis_hpux_bastille')!;
      expect(a).toMatchObject({ versionCode: 'hp_ux_11i', isOfferable: true });
      expect(b).toMatchObject({ versionCode: 'hp_ux_11i_cis_hpux_bastille', isOfferable: false });
      expect(new Set(ds.policies.map((p) => p.versionCode).filter(Boolean)).size).toBe(ds.policies.filter((p) => p.versionCode).length);
      expect(ds.warnings.join('\n')).toMatch(/hp_ux_11i.*cis_hpux/);
    });
  });

  describe('checks', () => {
    it('cada check cuelga de su política por el id oficial, con su título en los dos idiomas y su origen', () => {
      const c = ds.checks.find((x) => x.policyId === 'cis_ubuntu22-04' && x.checkId === '28500')!;
      expect(c).toMatchObject({ platform: 'ubuntu', titleEn: 'Title 28500', titleEs: 'Título 28500', condition: 'all', remediation: 'Fix it', verificationRule: 'f:/etc/x -> r:^a', origin: 'cis_native' });
    });

    it('la clave (política, id) no se repite aunque dos políticas usen el mismo número de check', () => {
      const keys = ds.checks.map((c) => `${c.policyId}|${c.checkId}`);
      expect(new Set(keys).size).toBe(keys.length);
      expect(ds.checks.filter((c) => c.checkId === '1')).toHaveLength(2);
    });

    it('una traducción de la remediación que ya viene escrita se marca como automática (sin revisar); sin ella queda nula', () => {
      const out = buildSondaDataset(input({ rows: [row('Ubuntu', UBU22, '1', { 'Remediación (español)': 'Corrígelo' }), row('Ubuntu', UBU22, '2')], ruleset: [RULESET[0]] }));
      expect(out.checks[0]).toMatchObject({ remediationEs: 'Corrígelo', translationOrigin: 'machine' });
      expect(out.checks[1]).toMatchObject({ remediationEs: null, translationOrigin: null });
    });

    it('un check con etiqueta de SOC 2 de la sonda es `engine_native` con confianza alta; sin etiqueta, `monkey_proposed` con confianza baja', () => {
      expect(ds.checks.find((c) => c.checkId === '28500')).toMatchObject({ mappingProvenance: 'engine_native', mappingConfidence: 'high' });
      expect(ds.checks.find((c) => c.checkId === '28502')).toMatchObject({ mappingProvenance: 'monkey_proposed', mappingConfidence: 'low' });
    });
  });

  describe('mapeo a SOC 2', () => {
    it('une las columnas `SOC 2` y `TSC` (es el mismo marco) y no repite', () => {
      const codes = (id: string) => ds.mappings.filter((m) => m.checkId === id && m.policyId === 'cis_ubuntu22-04').map((m) => m.requirementCode).sort();
      expect(codes('28500')).toEqual(['CC6.3', 'CC6.6']);
      expect(codes('28501')).toEqual(['CC6.1']);
      expect(codes('28502')).toEqual([]);
      expect(ds.mappings.every((m) => m.frameworkCode === 'soc2' && m.frameworkVersion === '2017' && m.provenance === 'engine_native')).toBe(true);
    });

    it('un requisito que la sonda cita y el catálogo no tiene NO se mapea, pero se avisa (no se descarta en silencio)', () => {
      const out = buildSondaDataset(input({ rows: [row('Ubuntu', UBU22, '1', { 'SOC 2': 'CC6.3, CC9.9' })], ruleset: [RULESET[0]] }));
      expect(out.mappings.map((m) => m.requirementCode)).toEqual(['CC6.3']);
      expect(out.warnings.join('\n')).toMatch(/CC9\.9 \(1\)/);
    });
  });

  it('ya no propone vínculos con las pruebas: los define el comité en TEST_CHECKS', () => {
    expect(ds).not.toHaveProperty('testChecks');
  });

  describe('lo que no se puede construir falla en voz alta', () => {
    const fails = (over: Partial<BuildInput>, msg: RegExp) => expect(() => buildSondaDataset(input(over))).toThrow(msg);

    it('una política del catálogo que la sonda no entrega', () => fails({ ruleset: RULESET.filter((r) => r.id !== 'cis_win2022') }, /«.*Windows Server 2022.*» .* la sonda no la entrega/));
    it('una política de la sonda que el catálogo no tiene', () => fails({ ruleset: [...RULESET, { id: 'cis_nueva', name: 'CIS Nueva', file: 'cis_nueva.yml' }] }, /no la tiene/));
    it('una política que no se reconoce (no se adivina su etiqueta)', () => fails({ rows: [...ROWS, row('Ubuntu', 'CIS Ubuntu Linux sin version', '1')], ruleset: [...RULESET, { id: 'x', name: 'CIS Ubuntu Linux sin version', file: 'x.yml' }] }, /No se reconoce/));
    it('una plataforma sin nombre en el catálogo', () => fails({ rows: [...ROWS, row('Plan9', 'CIS Plan 9', '1')], ruleset: [...RULESET, { id: 'p9', name: 'CIS Plan 9', file: 'p9.yml' }] }, /No se reconoce|no tiene su nombre/));
    it('dos políticas de la sonda con el mismo nombre', () => fails({ ruleset: [...RULESET, { id: 'cis_ubuntu22-04-b', name: UBU22, file: 'b.yml' }] }, /coincide con 2/));
    it('un id de política repetido en la sonda', () => fails({ ruleset: [...RULESET, { id: 'cis_win2022', name: 'otra', file: 'o.yml' }] }, /repite el id/));
    it('un check repetido, sin id o sin título', () => {
      fails({ rows: [...ROWS, row('Ubuntu', UBU22, '28500')] }, /repetido/);
      fails({ rows: [...ROWS, row('Ubuntu', UBU22, '')] }, /no tiene id/);
      fails({ rows: [...ROWS, row('Ubuntu', UBU22, '999', { Título: '' })] }, /no tiene título/);
    });
  });

  it('el resumen cuenta lo que hay', () => {
    expect(ds.meta.counts).toEqual({ policies: 6, offerable: 4, checks: 8, mappings: ds.mappings.length });
  });
});
