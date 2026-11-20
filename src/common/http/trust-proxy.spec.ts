import { parseTrustProxy } from './trust-proxy';

describe('parseTrustProxy', () => {
  it.each([[undefined], [''], ['  '], ['false']])('apagado con %p', (raw) => {
    expect(parseTrustProxy(raw)).toBe(false);
  });

  it('acepta saltos, palabras clave, IP y CIDR', () => {
    expect(parseTrustProxy('2')).toBe(2);
    expect(parseTrustProxy('loopback')).toBe('loopback');
    expect(parseTrustProxy('loopback, uniquelocal')).toEqual(['loopback', 'uniquelocal']);
    expect(parseTrustProxy('172.16.0.0/12')).toBe('172.16.0.0/12');
    expect(parseTrustProxy('10.0.0.1,fd00::/8')).toEqual(['10.0.0.1', 'fd00::/8']);
  });

  it.each([['true'], ['0'], ['99'], ['banana'], ['10.0.0.0/33'], ['10.0.0.0/x'], ['loopback,nope']])('rechaza %s', (raw) => {
    expect(() => parseTrustProxy(raw)).toThrow(/TRUST_PROXY/);
  });
});
