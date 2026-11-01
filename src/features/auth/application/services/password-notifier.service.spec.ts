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

  it('sin ADMIN_APP_URL (vacía) admin_monkey cae a la dirección de Platform', async () => {
    const { notifier, sent } = build({ PLATFORM_APP_URL: 'https://app.monkey.test', ADMIN_APP_URL: '' });
    await notifier.sendResetLink('root@monkey.co', 'admin_monkey', 'tok');
    expect(sent[0].text).toContain('https://app.monkey.test/reset-password?token=tok');
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
});
