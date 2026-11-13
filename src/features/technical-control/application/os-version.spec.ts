import { OsVersionRule } from '../domain/entities/technical-control.entities';
import { checkOsVersion, needsOsVersion } from './os-version';

const UBUNTU: OsVersionRule = { id: 'p1', osCode: 'linux', code: 'ubuntu_22_04_lts', distribution: 'ubuntu', distributionName: 'Ubuntu', versionLabel: '22.04 LTS' };
const WIN: OsVersionRule = { id: 'p2', osCode: 'windows', code: 'windows_server_2022', distribution: 'windows_server', distributionName: 'Windows Server', versionLabel: '2022' };

const check = (over: Partial<Parameters<typeof checkOsVersion>[0]> = {}) =>
  checkOsVersion({ category: 'ac_04', method: 'agent', platformCode: 'linux', osVersion: 'ubuntu_22_04_lts', found: UBUNTU, ...over });

describe('needsOsVersion', () => {
  it.each([['ac_02'], ['ac_04'], ['ac_06']])('un activo con agente de %s declara la versión de su sistema', (category) => {
    expect(needsOsVersion(category, 'agent')).toBe(true);
  });
  it.each([['ac_01', 'readonly_role'], ['ac_01', 'access_keys'], ['ac_03', 'agent'], ['ac_05', 'agent']] as const)('%s con %s no (una cuenta de nube y una base de datos no tienen un SO que declarar)', (category, method) => {
    expect(needsOsVersion(category, method)).toBe(false);
  });
});

describe('checkOsVersion (D113)', () => {
  it('una versión que el catálogo ofrece y es de ese sistema: sin errores', () => {
    expect(check()).toEqual([]);
    expect(check({ platformCode: 'windows', osVersion: 'windows_server_2022', found: WIN })).toEqual([]);
  });

  it('en un servidor con agente es obligatoria', () => {
    for (const osVersion of [undefined, null, '', '   ']) expect(check({ osVersion, found: null })).toEqual([{ field: 'os_version', code: 'required' }]);
  });

  it('un código que el catálogo no ofrece (no existe, o la sonda no lo entrega) es inválido', () => {
    expect(check({ osVersion: 'ubuntu_99_04', found: null })).toEqual([{ field: 'os_version', code: 'invalid' }]);
  });

  it('una versión de OTRO sistema (Windows para una plataforma Linux) es inválida: el comando saldría equivocado', () => {
    expect(check({ osVersion: 'windows_server_2022', found: WIN })).toEqual([{ field: 'os_version', code: 'invalid' }]);
    expect(check({ platformCode: 'windows', osVersion: 'ubuntu_22_04_lts', found: UBUNTU })).toEqual([{ field: 'os_version', code: 'invalid' }]);
  });

  it('donde no aplica (nube, bases de datos) sobra: no se acepta', () => {
    expect(check({ category: 'ac_01', method: 'readonly_role', platformCode: 'aws', found: null })).toEqual([{ field: 'os_version', code: 'field.not_allowed' }]);
    expect(check({ category: 'ac_05', platformCode: 'postgresql', found: null })).toEqual([{ field: 'os_version', code: 'field.not_allowed' }]);
  });

  it('donde no aplica y no viene, no hay nada que decir', () => {
    expect(check({ category: 'ac_01', method: 'readonly_role', platformCode: 'aws', osVersion: undefined, found: null })).toEqual([]);
    expect(check({ category: 'ac_01', method: 'access_keys', platformCode: 'aws', osVersion: '', found: null })).toEqual([]);
  });
});
