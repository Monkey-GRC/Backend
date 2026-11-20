import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import * as maxmind from 'maxmind';
import { MaxmindGeoIpLookup } from './maxmind-geo-ip.lookup';

jest.mock('node:fs', () => ({ ...jest.requireActual('node:fs'), statSync: jest.fn(jest.requireActual('node:fs').statSync) }));
jest.mock('maxmind', () => ({ open: jest.fn() }));

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

  it.each(['10.1.2.3', '192.168.0.4', '172.20.0.1', '127.0.0.1', '::1', 'fe80::1', '::ffff:10.0.0.5', '::ffff:172.22.0.2', 'no-es-ip', ''])('IP privada o inválida %s: null sin abrir la base', async (ip) => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const geo = new MaxmindGeoIpLookup(config('geoip/no-existe.mmdb'));
    expect(await geo.lookup(ip)).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  describe('recarga cuando cambia el archivo', () => {
    const reader = (country: string) => ({ get: () => ({ country: { iso_code: country } }) });
    const stat = fs.statSync as unknown as jest.Mock;
    const open = maxmind.open as unknown as jest.Mock;
    const at = (iso: string) => jest.setSystemTime(new Date(iso));

    beforeEach(() => {
      jest.useFakeTimers();
      at('2026-01-01T00:00:00Z');
      stat.mockReset();
      open.mockReset();
    });
    afterEach(() => jest.useRealTimers());

    it('no relee antes de una hora y relee si cambió la fecha del archivo', async () => {
      stat.mockReturnValue({ mtimeMs: 1 });
      open.mockResolvedValueOnce(reader('CO')).mockResolvedValueOnce(reader('MX'));
      const geo = new MaxmindGeoIpLookup(config('x.mmdb'));
      expect((await geo.lookup('8.8.8.8'))?.country).toBe('CO');
      stat.mockReturnValue({ mtimeMs: 2 });
      expect((await geo.lookup('8.8.8.8'))?.country).toBe('CO');
      expect(open).toHaveBeenCalledTimes(1);
      at('2026-01-01T01:00:01Z');
      expect((await geo.lookup('8.8.8.8'))?.country).toBe('MX');
      expect(open).toHaveBeenCalledTimes(2);
    });

    it('si la fecha no cambió no vuelve a abrir', async () => {
      stat.mockReturnValue({ mtimeMs: 1 });
      open.mockResolvedValue(reader('CO'));
      const geo = new MaxmindGeoIpLookup(config('x.mmdb'));
      await geo.lookup('8.8.8.8');
      at('2026-01-01T02:00:00Z');
      await geo.lookup('8.8.8.8');
      expect(open).toHaveBeenCalledTimes(1);
    });

    it('si la nueva base no abre, conserva la anterior', async () => {
      jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      stat.mockReturnValue({ mtimeMs: 1 });
      open.mockResolvedValueOnce(reader('CO')).mockRejectedValueOnce(new Error('corrupta'));
      const geo = new MaxmindGeoIpLookup(config('x.mmdb'));
      await geo.lookup('8.8.8.8');
      stat.mockReturnValue({ mtimeMs: 2 });
      at('2026-01-01T02:00:00Z');
      expect((await geo.lookup('8.8.8.8'))?.country).toBe('CO');
    });
  });
});
