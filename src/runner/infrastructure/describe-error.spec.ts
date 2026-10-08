import { describeError } from './describe-error';

describe('describeError', () => {
  it('un fallo de red de fetch dice la causa real, no solo «TypeError»', () => {
    const e = Object.assign(new TypeError('fetch failed'), { cause: Object.assign(new Error('connect ECONNREFUSED 172.18.0.3:3000'), { code: 'ECONNREFUSED' }) });
    expect(describeError(e)).toBe('no se pudo conectar con el backend (ECONNREFUSED)');
  });
  it('un nombre que no resuelve', () => {
    const e = Object.assign(new TypeError('fetch failed'), { cause: Object.assign(new Error('x'), { code: 'ENOTFOUND' }) });
    expect(describeError(e)).toContain('ENOTFOUND');
  });
  it('un error con código propio muestra clase y código', () => {
    expect(describeError(Object.assign(new Error('x'), { code: 'EACCES' }))).toBe('Error, EACCES');
  });
  it('nunca incluye el mensaje, que puede llevar secretos', () => {
    const out = describeError(new Error('falló con AKIASECRETO y un-token-largo'));
    expect(out).toBe('Error');
    expect(out).not.toContain('AKIA');
  });
  it('descarta un «código» que no tiene forma de código (podría ser texto libre con secretos)', () => {
    expect(describeError(Object.assign(new Error('x'), { code: 'token secreto 123' }))).toBe('Error');
  });
  it('no revienta con lo que no es un error', () => {
    expect(describeError(undefined)).toBe('Error');
    expect(describeError('texto')).toBe('String');
  });
});
