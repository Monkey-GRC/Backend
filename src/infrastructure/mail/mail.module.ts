import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Mailer } from '../../common/mail/mailer';
import { LogMailer } from './log.mailer';
import { ResendMailer } from './resend.mailer';

// D99 · Qué servicio entrega el correo lo decide MAIL_PROVIDER. Sin valor, `log` fuera de producción; en producción el
// servidor no arranca sin un servicio real, porque sin correo nadie recibe su clave de acceso.
export function createMailer(config: ConfigService): Mailer {
  const production = config.get<string>('NODE_ENV') === 'production';
  const provider = config.get<string>('MAIL_PROVIDER')?.trim() || (production ? '' : 'log');

  if (provider === 'log') {
    if (production) throw new Error('MAIL_PROVIDER=log no se permite en producción: la clave de acceso solo llega por correo (SEG-71).');
    return new LogMailer();
  }
  if (provider === 'resend') {
    const apiKey = config.get<string>('MAIL_API_KEY')?.trim();
    const from = config.get<string>('MAIL_FROM')?.trim();
    if (!apiKey || !from) throw new Error('MAIL_PROVIDER=resend exige MAIL_API_KEY y MAIL_FROM.');
    return new ResendMailer(apiKey, from);
  }
  throw new Error(`MAIL_PROVIDER inválido: "${provider}". Usa "resend" (o "log" fuera de producción).`);
}

@Global()
@Module({
  providers: [{ provide: Mailer, inject: [ConfigService], useFactory: createMailer }],
  exports: [Mailer],
})
export class MailModule {}
