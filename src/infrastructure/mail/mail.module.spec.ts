import { ConfigService } from '@nestjs/config';
import { LogMailer } from './log.mailer';
import { createMailer } from './mail.module';
import { ResendMailer } from './resend.mailer';

// D99 / SEG-71 · Sin correo real en producción nadie recibe su clave, así que el servidor no arranca.
const config = (env: Record<string, string>) => new ConfigService(env);

describe('createMailer', () => {
  it('fuera de producción, sin valor, usa `log`', () => {
    expect(createMailer(config({ NODE_ENV: 'development' }))).toBeInstanceOf(LogMailer);
  });
  it('en producción se niega a arrancar con `log` o sin valor', () => {
    expect(() => createMailer(config({ NODE_ENV: 'production', MAIL_PROVIDER: 'log' }))).toThrow(/producción/);
    expect(() => createMailer(config({ NODE_ENV: 'production' }))).toThrow(/MAIL_PROVIDER inválido/);
  });
  it('el servicio real exige credencial y remitente', () => {
    expect(() => createMailer(config({ MAIL_PROVIDER: 'resend', MAIL_FROM: 'Monkey <no-reply@x.test>' }))).toThrow(/MAIL_API_KEY/);
    expect(createMailer(config({ NODE_ENV: 'production', MAIL_PROVIDER: 'resend', MAIL_API_KEY: 'k', MAIL_FROM: 'Monkey <no-reply@x.test>' }))).toBeInstanceOf(ResendMailer);
  });
  it('un valor desconocido falla', () => {
    expect(() => createMailer(config({ MAIL_PROVIDER: 'otro' }))).toThrow(/MAIL_PROVIDER inválido/);
  });
});
