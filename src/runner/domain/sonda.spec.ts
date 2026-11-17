import { agentGroupsMatchTenant, isSupportedSondaVersion } from './sonda';

describe('agentGroupsMatchTenant (el trabajador comprueba el grupo; el backend lo vuelve a comprobar)', () => {
  const A = '11111111-1111-4111-8111-111111111111';
  const B = '22222222-2222-4222-8222-222222222222';
  it('el grupo de la empresa, solo o con uno que no es de ninguna empresa', () => {
    expect(agentGroupsMatchTenant([A], A)).toBe(true);
    expect(agentGroupsMatchTenant([A, 'linux'], A)).toBe(true);
  });
  it('el de otra empresa, solo o acompañando al nuestro, o ninguno, no vale', () => {
    expect(agentGroupsMatchTenant([B], A)).toBe(false);
    expect(agentGroupsMatchTenant([A, B], A)).toBe(false);
    expect(agentGroupsMatchTenant([], A)).toBe(false);
    expect(agentGroupsMatchTenant(['default'], A)).toBe(false);
  });
});

describe('isSupportedSondaVersion', () => {
  it('acepta cualquier parche de una versión menor soportada', () => {
    for (const v of ['4.14.0', '4.14.6', '4.14.10', '4.14']) expect(isSupportedSondaVersion(v, ['4.14'])).toBe(true);
  });

  it('no acepta otra versión menor ni mayor, ni un prefijo que solo coincide por texto', () => {
    for (const v of ['4.13.9', '4.15.0', '5.0.0', '4.140.1', '40.14.0']) expect(isSupportedSondaVersion(v, ['4.14'])).toBe(false);
  });

  it('con varias versiones soportadas basta con una', () => {
    expect(isSupportedSondaVersion('4.15.2', ['4.14', '4.15'])).toBe(true);
  });

  it('una versión que no tiene forma de versión, o una lista vacía, no se acepta (nunca se adivina)', () => {
    for (const v of ['', 'dev', 'latest', '4', '4.14.x', '4.14.6-rc1']) expect(isSupportedSondaVersion(v, ['4.14'])).toBe(false);
    expect(isSupportedSondaVersion('4.14.6', [])).toBe(false);
    expect(isSupportedSondaVersion('4.14.6', [''])).toBe(false);
  });

  it('tolera espacios y un punto final en la configuración', () => {
    expect(isSupportedSondaVersion(' 4.14.6 ', [' 4.14. '])).toBe(true);
  });
});
