import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { MailMessage, Mailer } from '../../../../common/mail/mailer';
import { PasswordNotifier } from './password-notifier.service';

const config = (values: Record<string, string>) => ({ get: (key: string) => values[key] }) as unknown as ConfigService;

function build(values: Record<string, string>, fail = false) {
  const sent: MailMessage[] = [];
  const mailer = {
    send: async (message: MailMessage) => {
      if (fail) throw new Error('proveedor caído');
      sent.push(message);
    },
  } as Mailer;
  return { notifier: new PasswordNotifier(mailer, config(values)), sent };
}

describe('PasswordNotifier (D101)', () => {
  it('el enlace de una cuenta de empresa lleva a Monkey Platform', async () => {
    const { notifier, sent } = build({ PLATFORM_APP_URL: 'https://app.monkey.test/', ADMIN_APP_URL: 'https://admin.monkey.test' });
    await notifier.sendResetLink('ana@acme.co', 'admin_empresa', 'tok en/1');
    expect(sent[0].text).toContain('https://app.monkey.test/reset-password?token=tok%20en%2F1');
  });

  it('el enlace de admin_monkey lleva a Monkey Admin, que cuelga sus pantallas de acceso de /auth', async () => {
    const { notifier, sent } = build({ PLATFORM_APP_URL: 'https://app.monkey.test', ADMIN_APP_URL: 'https://admin.monkey.test/' });
    await notifier.sendResetLink('root@monkey.co', 'admin_monkey', 'tok');
    expect(sent[0].text).toContain('https://admin.monkey.test/auth/reset-password?token=tok');
  });

  it('sin ADMIN_APP_URL admin_monkey no recibe enlace a Platform: no se envía y se avisa (MD-492)', async () => {
    const { notifier, sent } = build({ PLATFORM_APP_URL: 'https://app.monkey.test', ADMIN_APP_URL: '' });
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    await notifier.sendResetLink('root@monkey.co', 'admin_monkey', 'tok');
    expect(sent).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('falta ADMIN_APP_URL'));
    warn.mockRestore();
  });

  it('sin ninguna dirección no envía un enlace roto', async () => {
    const { notifier, sent } = build({});
    await notifier.sendResetLink('ana@acme.co', 'admin_empresa', 'tok');
    expect(sent).toHaveLength(0);
  });

  it('un fallo del proveedor de correo no tumba la operación', async () => {
    const { notifier } = build({ PLATFORM_APP_URL: 'https://app.monkey.test' }, true);
    await expect(notifier.sendResetLink('ana@acme.co', 'admin_empresa', 'tok')).resolves.toBeUndefined();
    await expect(notifier.sendChanged('ana@acme.co', 'changed')).resolves.toBeUndefined();
  });

  it('el correo sale en el idioma guardado de la persona (D111)', async () => {
    const { notifier, sent } = build({ PLATFORM_APP_URL: 'https://app.monkey.test' });
    await notifier.sendResetLink('ana@acme.co', 'admin_empresa', 'tok', 'en');
    await notifier.sendChanged('ana@acme.co', 'reset', 'en');
    await notifier.sendResetLink('ana@acme.co', 'admin_empresa', 'tok', 'es');
    expect(sent.map((m) => m.subject)).toEqual(['Create your new Monkey password', 'Your Monkey account password changed', 'Crea tu contraseña nueva de Monkey']);
    expect(sent[0].html).toContain('<html lang="en">');
    expect(sent[2].html).toContain('<html lang="es">');
  });
});
