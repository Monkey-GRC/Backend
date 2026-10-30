import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditLogWriter } from '../../../common/audit/audit-log.writer';
import { RequestMeta } from '../../../common/http/request-meta';
import { Mailer } from '../../../common/mail/mailer';
import { buildAccessKeyEmail } from './access-key-email';

export type DeliveryStatus = 'sent' | 'failed';

export type AccessKeyDeliveryInput = {
  actorId: string;
  companyId: string;
  companyName: string;
  adminEmail: string;
  accessKeyId: string;
  code: string;
  expiresAt: Date;
};

// D99 · Entrega la clave de acceso al `admin_email`. Un fallo del correo NO tumba el registro ni el reenvío: la clave ya
// existe y se puede volver a reenviar, así que aquí solo se informa `failed` y se deja rastro (`access_key.email`).
// Ni el log ni el rastro llevan la clave (SEG-71).
@Injectable()
export class AccessKeyDelivery {
  private readonly logger = new Logger(AccessKeyDelivery.name);

  constructor(
    private readonly mailer: Mailer,
    private readonly audit: AuditLogWriter,
    private readonly config: ConfigService,
  ) {}

  async deliver(input: AccessKeyDeliveryInput, meta: RequestMeta): Promise<DeliveryStatus> {
    const base = this.config.get<string>('PLATFORM_APP_URL')?.trim().replace(/\/+$/, '');
    const message = buildAccessKeyEmail({
      companyName: input.companyName,
      adminEmail: input.adminEmail,
      code: input.code,
      expiresAt: input.expiresAt,
      redeemUrl: base ? `${base}/register` : null,
    });

    let status: DeliveryStatus = 'sent';
    try {
      await this.mailer.send(message);
    } catch (error) {
      status = 'failed';
      this.logger.warn(`No se pudo enviar la clave de acceso de la empresa ${input.companyId}: ${error instanceof Error ? error.message : 'error desconocido'}`);
    }

    // De mejor esfuerzo, como el resto de los intentos que no acompañan a un cambio: si el rastro falla no se pierde el envío.
    await this.audit.write({
      tenantId: null,
      userId: input.actorId,
      action: 'access_key.email',
      resource: 'access_key',
      result: status === 'sent' ? 'success' : 'error',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState: { company_id: input.companyId, access_key_id: input.accessKeyId, delivery_status: status },
    });
    return status;
  }
}
