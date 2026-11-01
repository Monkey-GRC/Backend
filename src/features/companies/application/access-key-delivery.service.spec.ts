import { ConfigService } from '@nestjs/config';
import type { AuditEntry, AuditLogWriter } from '../../../common/audit/audit-log.writer';
import type { MailMessage, Mailer } from '../../../common/mail/mailer';
import { AccessKeyDelivery } from './access-key-delivery.service';
import { buildAccessKeyEmail } from './access-key-email';

// D99 · El correo de la clave: qué lleva, qué NO lleva y que un fallo del servicio no tumba nada.
const CODE = 'MNK-7F3A-92KD-5QXB';
const meta = { ipAddress: '10.0.0.1', userAgent: 'jest' };
const input = { actorId: 'u1', companyId: 'c1', companyName: 'Acme S.A.S.', adminEmail: 'admin@acme.test', accessKeyId: 'k1', code: CODE, expiresAt: new Date('2026-10-07T15:04:00Z') };

describe('buildAccessKeyEmail', () => {
  it('lleva la clave, el correo, el vencimiento y el enlace; no nombra al proveedor del motor', () => {
    const msg = buildAccessKeyEmail({ companyName: 'Acme S.A.S.', adminEmail: 'admin@acme.test', code: CODE, expiresAt: input.expiresAt, redeemUrl: 'https://app.monkey.test/register' });
    expect(msg.to).toBe('admin@acme.test');
    expect(msg.text).toContain(CODE);
    expect(msg.text).toContain('Acme S.A.S.');
    expect(msg.text).toContain('07/10/2026 15:04 UTC');
    expect(msg.text).toContain('https://app.monkey.test/register');
    expect(`${msg.subject}${msg.text}`.toLowerCase()).not.toMatch(/wazuh|prowler/);
  });

  it('la versión HTML lleva la clave, el botón y el logo incrustado, escapa el nombre y no nombra al proveedor', () => {
    const msg = buildAccessKeyEmail({ companyName: '<b>Acme</b> & Cía', adminEmail: 'admin@acme.test', code: CODE, expiresAt: input.expiresAt, redeemUrl: 'https://app.monkey.test/register' });
    expect(msg.html).toContain(CODE);
    expect(msg.html).toContain('href="https://app.monkey.test/register"');
    // El logo viaja DENTRO del correo (cid), no como una URL: así se ve también desde una dirección local y con las imágenes remotas bloqueadas.
    expect(msg.html).toContain('src="cid:monkey-logo"');
    expect(msg.inlineImages).toHaveLength(1);
    expect(msg.inlineImages![0]).toMatchObject({ cid: 'monkey-logo', contentType: 'image/png' });
    expect(Buffer.from(msg.inlineImages![0].contentBase64, 'base64').subarray(1, 4).toString()).toBe('PNG');
    expect(msg.html).toContain('&lt;b&gt;Acme&lt;/b&gt; &amp; Cía');
    expect(msg.html).not.toContain('<b>Acme</b>');
    expect(msg.html?.toLowerCase()).not.toMatch(/wazuh|prowler/);
  });

  it('sin URL configurada no inventa un enlace', () => {
    const msg = buildAccessKeyEmail({ companyName: 'Acme', adminEmail: 'a@a.test', code: CODE, expiresAt: input.expiresAt, redeemUrl: null });
    expect(msg.text).not.toContain('http');
    expect(msg.html).not.toContain('href=');
    expect(msg.html).toContain('cid:monkey-logo'); // el logo no depende de ninguna dirección
  });
});

describe('AccessKeyDelivery', () => {
  let sent: MailMessage[];
  let writes: AuditEntry[];
  let fail: boolean;
  const make = (platformUrl?: string) => {
    const mailer = { send: jest.fn(async (m: MailMessage) => { if (fail) throw new Error('HTTP 429, daily_quota_exceeded'); sent.push(m); }) } as unknown as Mailer;
    const audit = { write: jest.fn(async (e: AuditEntry) => { writes.push(e); }) } as unknown as AuditLogWriter;
    const config = { get: (k: string) => (k === 'PLATFORM_APP_URL' ? platformUrl : undefined) } as unknown as ConfigService;
    return new AccessKeyDelivery(mailer, audit, config);
  };
  beforeEach(() => { sent = []; writes = []; fail = false; });

  it('envía y deja el rastro `access_key.email` sin la clave', async () => {
    expect(await make('https://app.monkey.test/').deliver(input, meta)).toBe('sent');
    expect(sent[0].text).toContain('https://app.monkey.test/register');
    expect(writes).toHaveLength(1);
    expect(writes[0]).toMatchObject({ action: 'access_key.email', result: 'success', tenantId: null, userId: 'u1' });
    expect(JSON.stringify(writes[0])).not.toContain(CODE);
  });

  it('si el servicio falla responde `failed`, no lanza y deja el rastro con error', async () => {
    fail = true;
    expect(await make().deliver(input, meta)).toBe('failed');
    expect(writes[0]).toMatchObject({ action: 'access_key.email', result: 'error' });
    expect(JSON.stringify(writes[0])).not.toContain(CODE);
  });
});
