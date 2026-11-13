import { Injectable, Logger } from '@nestjs/common';
import { isReadingDue } from '../../domain/agent-reading/reading-plan';
import { ScanRepository } from '../../domain/repositories/scan.repository';
import { AgentReadingConfig } from '../agent-reading-config';

// Tope por pasada: una instalación con miles de servidores no inunda al trabajador de golpe; lo que sobre se atiende en la pasada siguiente (un minuto después).
export const MAX_READINGS_PER_PASS = 200;
const HOUR_SECONDS = 3600;

export type ReadingPass = { considered: number; due: number; queued: number };

// Una pasada de la lectura automática (D112): mira los servidores de todas las empresas, decide a cuáles les toca (`isReadingDue`) y deja en cola una lectura de cada uno. El trabajador la
// reclama como cualquier otra y entrega lo que lee la sonda. Esta pasada NO lee la sonda ni espera al trabajador: solo encola.
//
// Es segura de repetir y de correr en dos instancias del backend a la vez: un servidor no puede tener dos lecturas abiertas (índice único), así que la segunda pasada simplemente no encola.
@Injectable()
export class QueueAgentReadingsUseCase {
  private readonly logger = new Logger(QueueAgentReadingsUseCase.name);

  constructor(
    private readonly repo: ScanRepository,
    private readonly config: AgentReadingConfig,
  ) {}

  async execute(now: Date = new Date()): Promise<ReadingPass> {
    const cfg = this.config.get();
    const candidates = await this.repo.listAgentReadingCandidates({ windowSeconds: cfg.watchWindowHours * HOUR_SECONDS, refreshSeconds: cfg.refreshIntervalHours * HOUR_SECONDS });
    const due = candidates.filter((c) => isReadingDue(c, cfg, now)).slice(0, MAX_READINGS_PER_PASS);
    let queued = 0;
    for (const c of due) {
      try {
        if (await this.repo.queueAgentReading({ companyId: c.tenantId }, c.assetId)) queued += 1;
      } catch (error) {
        // Un servidor que falla no detiene a los demás. Se registra el identificador, nunca datos del cliente.
        this.logger.error(`No se pudo encolar la lectura del activo ${c.assetId}: ${(error as Error).message}`);
      }
    }
    return { considered: candidates.length, due: due.length, queued };
  }
}
