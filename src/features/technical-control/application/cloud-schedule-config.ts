import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_RUNNER_POOL, RUNNER_POOL } from './runner-pool';

export const DEFAULT_CLOUD_SCHEDULE_MINUTES = 5;

export type CloudScheduleSettings = { enabled: boolean; intervalMinutes: number };

// D158 · Cada cuánto revisa Monkey qué conexiones de nube vencieron. Solo con la evaluación REAL. Sin valor, solo se enciende en el grupo de trabajadores `default`: un backend local con
// grupo propio que comparta la base se llevaría las evaluaciones de los demás a su máquina.
export function cloudScheduleSettings(env: { probeMode?: string; interval?: string; runnerPool: string }): CloudScheduleSettings {
  const raw = env.interval?.trim();
  const value = raw ? Number(raw) : NaN;
  // Un valor ilegible no enciende ni apaga: se trata como si no estuviera.
  const explicit = Number.isInteger(value) && value >= 0 ? value : null;
  const minutes = explicit ?? (env.runnerPool === DEFAULT_RUNNER_POOL ? DEFAULT_CLOUD_SCHEDULE_MINUTES : 0);
  const enabled = env.probeMode?.trim() === 'runner' && minutes > 0;
  return { enabled, intervalMinutes: minutes > 0 ? minutes : DEFAULT_CLOUD_SCHEDULE_MINUTES };
}

@Injectable()
export class CloudScheduleConfig {
  constructor(
    private readonly config: ConfigService,
    @Inject(RUNNER_POOL) private readonly runnerPool: string,
  ) {}

  get(): CloudScheduleSettings {
    return cloudScheduleSettings({ probeMode: this.config.get<string>('PROBE_MODE'), interval: this.config.get<string>('CLOUD_SCHEDULE_INTERVAL_MINUTES'), runnerPool: this.runnerPool });
  }
}
