import { exampleChecksIndex } from './example-sheets';
import { crossTestChecks } from './checks-cross';
import { Row } from './parse';

const row = (over: Row): Row => ({
  ID_Test: 'T-X-1-01', Herramienta: 'Prowler', 'Plataforma / Política': 'AWS / rds', 'Check ID': 'rds_instance_deprecated_engine_version', Rol: 'Directo', Plataforma: 'AWS',
  'Servicio / Política': 'rds', 'Objetivo común': 'Motor soportado', 'Aplica cuando': 'Cliente conecta AWS', ...over,
});
const cross = (rows: Row[], index = exampleChecksIndex()) => {
  const errors: string[] = [];
  return { out: crossTestChecks(rows, index, errors), errors };
};

describe('cruce de TEST_CHECKS con los catálogos de checks', () => {
  it('nube: la etiqueta de la plataforma se traduce a su código y la política es la constante del motor', () => {
    const { out, errors } = cross([row({})]);
    expect(errors).toEqual([]);
    expect(out).toEqual([{ testCode: 'T-X-1-01', role: 'direct', platform: 'aws', policyId: 'cloud_configuration', checkId: 'rds_instance_deprecated_engine_version', moduleRef: null, commonObjective: 'Motor soportado', ownerControlCode: null, appliesWhen: 'Cliente conecta AWS' }]);
  });

  it('sonda: la política llega por NOMBRE, se cruza con sca_policies y el check ID numérico se vuelve texto', () => {
    const { out, errors } = cross([row({ Herramienta: 'Wazuh SCA', Plataforma: 'Ubuntu', 'Servicio / Política': 'CIS Ubuntu 22', 'Check ID': 28500, Rol: 'Complementario' })]);
    expect(errors).toEqual([]);
    expect(out[0]).toMatchObject({ role: 'complementary', platform: 'ubuntu', policyId: 'cis_ubuntu22-04', checkId: '28500', moduleRef: null });
  });

  it('un check ID repetido en dos plataformas se resuelve por plataforma', () => {
    const index = { ...exampleChecksIndex(), hasCloudCheck: (p: string, c: string) => c === 'kms_key_rotation_enabled' && (p === 'aws' || p === 'gcp') };
    const { out, errors } = cross([row({ 'Check ID': 'kms_key_rotation_enabled' }), row({ 'Check ID': 'kms_key_rotation_enabled', Plataforma: 'GCP' })], index);
    expect(errors).toEqual([]);
    expect(out.map((o) => o.platform)).toEqual(['aws', 'gcp']);
  });

  it('los «N/A» van sin check y con module_ref (módulo o puntaje global)', () => {
    const { out, errors } = cross([row({ Herramienta: 'Wazuh – módulo', 'Check ID': 'N/A', 'Plataforma / Política': 'Rootcheck', Rol: 'Dependencia', 'Objetivo común': 'Inventario (dueño ACT-3)' })]);
    expect(errors).toEqual([]);
    expect(out[0]).toMatchObject({ platform: null, policyId: null, checkId: null, moduleRef: 'Rootcheck', role: 'dependency', ownerControlCode: 'ACT-3' });
  });

  it('un check que no existe, una política desconocida o una plataforma desconocida no cruzan', () => {
    const { out, errors } = cross([
      row({ 'Check ID': 'no_existe' }),
      row({ Plataforma: 'Plan9' }),
      row({ Herramienta: 'Wazuh SCA', Plataforma: 'Ubuntu', 'Servicio / Política': 'Otra política', 'Check ID': 1 }),
      row({ Herramienta: 'Wazuh SCA', Plataforma: 'Ubuntu', 'Servicio / Política': 'CIS Ubuntu 22', 'Check ID': 999 }),
    ]);
    expect(out).toEqual([]);
    expect(errors).toHaveLength(4);
    expect(errors.join('\n')).toMatch(/no existe en AWS/);
    expect(errors.join('\n')).toMatch(/Plan9/);
    expect(errors.join('\n')).toMatch(/Otra política/);
    expect(errors.join('\n')).toMatch(/999/);
  });

  it('un rol desconocido, una herramienta desconocida y un vínculo repetido son errores', () => {
    const { errors } = cross([row({ Rol: 'Opcional' }), row({ Herramienta: 'Otra' }), row({}), row({})]);
    expect(errors).toHaveLength(3);
    expect(errors.join('\n')).toMatch(/Opcional/);
    expect(errors.join('\n')).toMatch(/no se sabe cruzar/);
    expect(errors.join('\n')).toMatch(/repetido/);
  });
});
