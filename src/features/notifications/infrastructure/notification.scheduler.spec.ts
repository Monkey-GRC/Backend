import type { ConfigService } from '@nestjs/config';
import type { PurgeExpiredNotificationsUseCase } from '../application/digest/purge-notifications.use-case';
import type { SendNotificationDigestsUseCase } from '../application/digest/send-digests.use-case';
import { isDigestTime, NotificationScheduler } from './notification.scheduler';

const at = (iso: string) => new Date(iso);
const config = (values: Record<string, string> = {}) => ({ get: (key: string) => values[key] }) as unknown as ConfigService;

describe('isDigestTime · desde las 12:00 UTC (NOTIFICATION_DIGEST_HOUR_UTC)', () => {
  it('antes de la hora no, desde la hora y hasta el final del día sí', () => {
    expect(isDigestTime(at('2026-11-24T11:59:59Z'), 12)).toBe(false);
    expect(isDigestTime(at('2026-11-24T12:00:00Z'), 12)).toBe(true);
    expect(isDigestTime(at('2026-11-24T23:59:00Z'), 12)).toBe(true);
    expect(isDigestTime(at('2026-11-24T00:00:00Z'), 0)).toBe(true);
  });
});

describe('NotificationScheduler.tick', () => {
  const build = (values?: Record<string, string>) => {
    const digests = { execute: jest.fn().mockResolvedValue({}) };
    const purge = { execute: jest.fn().mockResolvedValue({ companies: 1, deleted: 0, failed: 0 }) };
    const scheduler = new NotificationScheduler(digests as unknown as SendNotificationDigestsUseCase, purge as unknown as PurgeExpiredNotificationsUseCase, config(values));
    return { scheduler, digests, purge };
  };

  it('antes de la hora no envía resúmenes pero sí borra lo viejo, una vez al día', async () => {
    const { scheduler, digests, purge } = build();
    await scheduler.tick(at('2026-11-24T08:00:00Z'));
    await scheduler.tick(at('2026-11-24T09:00:00Z'));
    expect(digests.execute).not.toHaveBeenCalled();
    expect(purge.execute).toHaveBeenCalledTimes(1);
    await scheduler.tick(at('2026-11-25T08:00:00Z'));
    expect(purge.execute).toHaveBeenCalledTimes(2);
  });

  it('desde la hora envía en cada pasada del día (los fallidos se reintentan)', async () => {
    const { scheduler, digests } = build();
    await scheduler.tick(at('2026-11-24T12:00:00Z'));
    await scheduler.tick(at('2026-11-24T13:00:00Z'));
    expect(digests.execute).toHaveBeenCalledTimes(2);
  });

  it('la hora sale de NOTIFICATION_DIGEST_HOUR_UTC', async () => {
    const { scheduler, digests } = build({ NOTIFICATION_DIGEST_HOUR_UTC: '15' });
    await scheduler.tick(at('2026-11-24T14:00:00Z'));
    expect(digests.execute).not.toHaveBeenCalled();
    await scheduler.tick(at('2026-11-24T15:00:00Z'));
    expect(digests.execute).toHaveBeenCalledTimes(1);
  });

  it('una pasada que falla no tumba la tarea y la siguiente corre', async () => {
    const { scheduler, digests } = build();
    digests.execute.mockRejectedValueOnce(new Error('la base no responde'));
    await expect(scheduler.tick(at('2026-11-24T12:00:00Z'))).resolves.toBeUndefined();
    await scheduler.tick(at('2026-11-24T13:00:00Z'));
    expect(digests.execute).toHaveBeenCalledTimes(2);
  });

  it('una hora inválida es un error de configuración: la app no arranca, no falla en silencio cada hora', async () => {
    for (const bad of ['25', '-1', '1.5', 'doce']) {
      const { scheduler, digests } = build({ NOTIFICATION_DIGEST_HOUR_UTC: bad });
      expect(() => scheduler.onApplicationBootstrap()).toThrow(/NOTIFICATION_DIGEST_HOUR_UTC debe ser un entero entre 0 y 23/);
      await scheduler.tick(at('2026-11-24T12:00:00Z'));
      expect(digests.execute).not.toHaveBeenCalled();
    }
  });

  it('si el borrado falla en alguna empresa, el día no se da por hecho y se reintenta en la pasada siguiente', async () => {
    const { scheduler, purge } = build();
    purge.execute.mockResolvedValueOnce({ companies: 1, deleted: 0, failed: 1 });
    await scheduler.tick(at('2026-11-24T08:00:00Z'));
    await scheduler.tick(at('2026-11-24T09:00:00Z'));
    expect(purge.execute).toHaveBeenCalledTimes(2);
    await scheduler.tick(at('2026-11-24T10:00:00Z'));
    expect(purge.execute).toHaveBeenCalledTimes(2); // la segunda salió bien: ya está hecho el día
  });
});
