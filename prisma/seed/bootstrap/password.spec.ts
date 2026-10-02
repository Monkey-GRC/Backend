import { passwordProblems } from './password';

describe('política de contraseña (§5.3)', () => {
  it('acepta una contraseña que cumple todo', () => {
    expect(passwordProblems('UnaClaveLarga123!')).toEqual([]);
  });
  it('lista TODO lo que falta, no solo lo primero', () => {
    expect(passwordProblems('corta')).toEqual(['mínimo 12 caracteres', 'una mayúscula', 'un número', 'un símbolo']);
  });
  it('exige cada clase de carácter', () => {
    expect(passwordProblems('sinmayusculas123!')).toEqual(['una mayúscula']);
    expect(passwordProblems('SINMINUSCULAS123!')).toEqual(['una minúscula']);
    expect(passwordProblems('SinNumerosAquí!!')).toEqual(['un número']);
    expect(passwordProblems('SinSimbolos12345')).toEqual(['un símbolo']);
  });
});
