import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import { platformAppUrl } from '../../../../common/mail/app-url';
import { Mailer } from '../../../../common/mail/mailer';
import type { DigestBatch } from '../../domain/notification';
import { NotificationDigestRepository } from '../../domain/notification.repository';
import { NotificationViewer } from '../notification-view';
import { retentionLimit } from '../notification.use-cases';
import { buildDigestEmail } from './digest-email';

export type DigestRunResult = { candidates: number; sent: number; failed: number; skipped: number };

// D143, D151 · El resumen diario. Cada persona en su propia transacción y COMO esa persona (RLS por persona): una que falla no frena a las demás y la siguiente pasada del día la reintenta
// (máximo 3). El correo sale FUERA de la transacción: nunca se retiene una conexión esperando al servicio de correo. Si el envío falla, sus avisos no se marcan como enviados.
@Injectable()
export class SendNotificationDigestsUseCase {
  private readonly logger = new Logger(SendNotificationDigestsUseCase.name);

  constructor(
    private readonly digests: NotificationDigestRepository,
    private readonly viewer: NotificationViewer,
    private readonly mailer: Mailer,
    private readonly config: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async execute(now: Date = new Date()): Promise<DigestRunResult> {
    const result: DigestRunResult = { candidates: 0, sent: 0, failed: 0, skipped: 0 };
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const candidates = await this.digests.candidates(today);
    result.candidates = candidates.length;
    const appUrl = platformAppUrl(this.config);
    for (const { companyId, userId } of candidates) {
      const scope = { companyId, userId };
      try {
        const batch = await this.digests.claim(scope, today, now, retentionLimit(now));
        if (!batch) {
          result.skipped++;
          continue;
        }
        const outcome = await this.send(batch, appUrl, now, today);
        await this.digests.finish(scope, batch, outcome, now, (done): AuditEntry => ({
          tenantId: companyId, userId: null, action: 'notification.digest_email', resource: 'notification_digest', result: done.outcome === 'sent' ? 'success' : 'error', ipAddress: '', userAgent: 'system',
          beforeState: null,
          afterState: { user_id: userId, digest_date: today.toISOString().slice(0, 10), item_count: done.itemCount },
        }));
        result[outcome]++;
      } catch (error) {
        result.failed++;
        this.logger.error(`Falló el resumen de la persona ${userId} (empresa ${companyId}): ${(error as Error).message}`);
      }
    }
    return result;
  }

  private async send(batch: DigestBatch, appUrl: string | undefined, now: Date, today: Date): Promise<'sent' | 'failed'> {
    const lang = batch.language;
    const t = (key: string, args?: Record<string, string | number>): string => this.i18n.t(key, { lang, ...(args ? { args } : {}) }) as string;
    const lines = batch.items.map((record) => ({ title: this.viewer.view(record, lang, now).title, serviceName: 'service_name' in record.params ? (record.params.service_name ?? null) : null }));
    try {
      await this.mailer.send(buildDigestEmail({ to: batch.email, lang, date: today.toISOString().slice(0, 10), lines, total: batch.total, appUrl }, t));
      return 'sent';
    } catch (error) {
      // Nunca el cuerpo del mensaje ni el correo de la persona en el registro.
      this.logger.warn(`El servicio de correo no aceptó el resumen ${batch.digestId}: ${(error as Error).message}`);
      return 'failed';
    }
  }
}
