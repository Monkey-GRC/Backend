import { clientIp, normalizeIp } from './client-ip';

describe('clientIp / normalizeIp', () => {
  it.each([
    ['181.49.12.7', '181.49.12.7'],
    ['::ffff:172.22.0.2', '172.22.0.2'],
    ['::FFFF:181.49.12.7', '181.49.12.7'],
    ['2800:484:1::7', '2800:484:1::7'],
    ['::1', '127.0.0.1'],
    ['', ''],
    [undefined, ''],
    [null, ''],
  ])('normaliza %s', (input, expected) => {
    expect(normalizeIp(input)).toBe(expected);
  });

  it('clientIp lee req.ip y devuelve vacío si no hay', () => {
    expect(clientIp({ ip: '::ffff:10.0.0.5' })).toBe('10.0.0.5');
    expect(clientIp({ ip: undefined })).toBe('');
  });
});
