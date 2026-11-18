import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { MaxmindGeoIpLookup } from './maxmind-geo-ip.lookup';

const config = (path: string) => ({ get: () => path }) as unknown as ConfigService;

describe('MaxmindGeoIpLookup (D123)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('sin el archivo de la base: null, un solo aviso, y nunca lanza', async () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const geo = new MaxmindGeoIpLookup(config('geoip/no-existe.mmdb'));
    expect(await geo.lookup('8.8.8.8')).toBeNull();
    expect(await geo.lookup('1.1.1.1')).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it.each(['10.1.2.3', '192.168.0.4', '172.20.0.1', '127.0.0.1', '::1', 'fe80::1', '::ffff:10.0.0.5', 'no-es-ip', ''])('IP privada o inválida %s: null sin abrir la base', async (ip) => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const geo = new MaxmindGeoIpLookup(config('geoip/no-existe.mmdb'));
    expect(await geo.lookup(ip)).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });
});
