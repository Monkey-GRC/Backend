import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { MailMessage, Mailer } from '../../../common/mail/mailer';
import { AdminInvitationDelivery } from './admin-invitation-delivery.service';

const config = (values: Record<string, string>) => ({ get: (key: string) => values[key] }) as unknown as ConfigService;
const input = { to: 'nuevo@monkey.co', inviterName: 'Ana', code: 'ABCD-1234', expiresAt: new Date('2030-01-01T00:00:00Z'), userId: 'u1' };

function build(values: Record<string, string>) {
  const sent: MailMessage[] = [];
  const mailer = { send: async (m: MailMessage) => void sent.push(m) } as Mailer;
  return { delivery: new AdminInvitationDelivery(mailer, config(values)), sent };
}

describe('AdminInvitationDelivery (MD-492)', () => {
  it('con ADMIN_APP_URL el enlace lleva a Monkey Admin', async () => {
    const { delivery, sent } = build({ PLATFORM_APP_URL: 'https://app.monkey.test', ADMIN_APP_URL: 'https://admin.monkey.test/' });
    await expect(delivery.deliver(input)).resolves.toBe('sent');
    expect(sent[0].text).toContain('https://admin.monkey.test');
    expect(sent[0].text).not.toContain('app.monkey.test');
  });

  it('sin ADMIN_APP_URL no manda a Platform: sale sin enlace y se avisa', async () => {
    const { delivery, sent } = build({ PLATFORM_APP_URL: 'https://app.monkey.test' });
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    await expect(delivery.deliver(input)).resolves.toBe('sent');
    expect(sent[0].text).not.toContain('app.monkey.test');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('falta ADMIN_APP_URL'));
    warn.mockRestore();
  });
});
