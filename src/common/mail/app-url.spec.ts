import { ConfigService } from '@nestjs/config';
import { appUrl, platformAppUrl } from './app-url';

const cfg = (value?: string) => new ConfigService(value === undefined ? {} : { PLATFORM_APP_URL: value });

describe('platformAppUrl', () => {
  it.each([
    ['https://app.monkey.test', 'https://app.monkey.test'],
    ['https://app.monkey.test///', 'https://app.monkey.test'],
    ['http://localhost:4201', 'http://localhost:4201'],
    ['  https://app.monkey.test/  ', 'https://app.monkey.test'],
  ])('acepta %p', (raw, esperado) => expect(platformAppUrl(cfg(raw))).toBe(esperado));

  it.each([[undefined], [''], ['   '], ['javascript:alert(1)'], ['app.monkey.test'], ['ftp://app.monkey.test'], ['https://app monkey.test'], ['//app.monkey.test']])(
    'no devuelve nada para %p',
    (raw) => expect(platformAppUrl(cfg(raw))).toBeUndefined(),
  );

  it('sirve para cualquier variable', () => {
    expect(appUrl(new ConfigService({ ADMIN_APP_URL: 'https://admin.monkey.test/' }), 'ADMIN_APP_URL')).toBe('https://admin.monkey.test');
  });
});
