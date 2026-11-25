import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { digestHourUtc } from '../application/digest/digest-hour';
import { PurgeExpiredNotificationsUseCase } from '../application/digest/purge-notifications.use-case';
import { SendNotificationDigestsUseCase } from '../application/digest/send-digests.use-case';

/** ¿Ya es la hora del resumen? Desde `hourUtc` (UTC) hasta el final del día. */
export const isDigestTime = (now: Date, hourUtc: number): boolean => now.getUTCHours() >= hourUtc;

const integer = (config: ConfigService, key: string, fallback: number, min: number, max: number): number => {
  const raw = config.get<string>(key)?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${key} debe ser un entero entre ${min} y ${max}`);
  return value;
};

// D143, D151 · La tarea de los avisos: cada `NOTIFICATION_DIGEST_INTERVAL_MINUTES` (60 por defecto; `0` la apaga: las pruebas y los scripts) revisa si ya pasó `NOTIFICATION_DIGEST_HOUR_UTC`
// (12) y, de ser así, envía los resúmenes que falten (los fallidos se reintentan en la siguiente pasada del día, máximo 3) y, una vez al día, borra los avisos de más de 90 días.
// Todo es idempotente: dos réplicas o un reinicio no duplican nada.
@Injectable()
export class NotificationScheduler implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(NotificationScheduler.name);
  private timer: NodeJS.Timeout | null = null;
  private first: NodeJS.Timeout | null = null;
  private running = false;
  private purgedOn: string | null = null;
  private hour: number | null = null;

  constructor(private readonly digests: SendNotificationDigestsUseCase, private readonly purge: PurgeExpiredNotificationsUseCase, private readonly config: ConfigService) {}

  onApplicationBootstrap(): void {
    // Una hora mal configurada para el arranque (no falla en silencio cada hora, cuando ya no se ve).
    this.hour = digestHourUtc(this.config);
    const minutes = integer(this.config, 'NOTIFICATION_DIGEST_INTERVAL_MINUTES', 60, 0, 1440);
    if (minutes === 0) {
      this.logger.log('Tarea de avisos apagada (NOTIFICATION_DIGEST_INTERVAL_MINUTES=0).');
      return;
    }
    this.timer = setInterval(() => void this.tick(), minutes * 60_000);
    this.timer.unref();
    this.first = setTimeout(() => void this.tick(), 60_000);
    this.first.unref();
  }

  onApplicationShutdown(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.first) clearTimeout(this.first);
  }

  async tick(now: Date = new Date()): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      this.hour ??= digestHourUtc(this.config);
      if (isDigestTime(now, this.hour)) await this.digests.execute(now);
      const day = now.toISOString().slice(0, 10);
      if (this.purgedOn !== day) {
        // El día solo se da por hecho si TODAS las empresas se limpiaron: una que falló se reintenta en la pasada siguiente.
        const { failed } = await this.purge.execute();
        if (failed === 0) this.purgedOn = day;
      }
    } catch (error) {
      this.logger.error(`Falló la pasada de avisos: ${(error as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
