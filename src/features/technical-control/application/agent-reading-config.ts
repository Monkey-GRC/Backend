import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_READING_CONFIG, ReadingConfig } from '../domain/agent-reading/reading-plan';

export type AgentReadingSettings = ReadingConfig & {
  // `AGENT_WATCH_INTERVAL_MINUTES=0` apaga la lectura automática (las pruebas y los scripts).
  enabled: boolean;
};

// Cada cuánto, hasta cuándo y con qué frecuencia lee Monkey la sonda de un servidor (D113). Todo sale de la configuración de esta instalación, con los valores que aprobó Carlos
// (2026-11-12) por omisión: el tope de frecuencia y la retención siguen siendo una pregunta abierta del comité, y cambiarlos no debe exigir tocar el código.
@Injectable()
export class AgentReadingConfig {
  constructor(private readonly config: ConfigService) {}

  get(): AgentReadingSettings {
    const number = (key: string, fallback: number, { min }: { min: number }): number => {
      const raw = this.config.get<string>(key)?.trim();
      if (!raw) return fallback;
      const n = Number(raw);
      // Un valor ilegible o fuera de rango no apaga ni dispara la lectura: se usa el de siempre.
      return Number.isFinite(n) && n >= min ? n : fallback;
    };
    const watchIntervalMinutes = number('AGENT_WATCH_INTERVAL_MINUTES', DEFAULT_READING_CONFIG.watchIntervalMinutes, { min: 0 });
    return {
      enabled: watchIntervalMinutes > 0,
      // Con 0 (apagado) se conserva el valor por omisión: el resto de la lógica (p. ej. el plazo que muestra la pantalla) sigue teniendo números con sentido.
      watchIntervalMinutes: watchIntervalMinutes > 0 ? watchIntervalMinutes : DEFAULT_READING_CONFIG.watchIntervalMinutes,
      watchWindowHours: number('AGENT_WATCH_WINDOW_HOURS', DEFAULT_READING_CONFIG.watchWindowHours, { min: 1 }),
      refreshIntervalHours: number('AGENT_REFRESH_INTERVAL_HOURS', DEFAULT_READING_CONFIG.refreshIntervalHours, { min: 1 }),
      recheckIntervalMinutes: number('AGENT_RECHECK_INTERVAL_MINUTES', DEFAULT_READING_CONFIG.recheckIntervalMinutes, { min: 1 }),
    };
  }
}
