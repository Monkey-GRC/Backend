import { buildPasswordChangedEmail, buildPasswordResetLinkEmail } from './password-email';

const reset = buildPasswordResetLinkEmail({ to: 'ana@acme.co', resetUrl: 'https://app.monkey.test/reset-password?token=abc%20123', minutes: 30 });
const changed = buildPasswordChangedEmail({ to: 'ana@acme.co', via: 'reset' });

describe('correos de la contraseña (D101)', () => {
  it('the recovery link uses the same branded template as the access key: logo, button and bullets', () => {
    expect(reset.to).toBe('ana@acme.co');
    expect(reset.html).toContain('src="cid:monkey-logo"');
    expect(reset.inlineImages).toHaveLength(1);
    expect(reset.html).toContain('href="https://app.monkey.test/reset-password?token=abc%20123"');
    expect(reset.html).toContain('Crear contraseña nueva');
    expect(reset.html).toContain('30 minutos');
    expect(reset.html).toContain('&bull;');
  });

  it('the plain-text version carries the link and the minutes too', () => {
    expect(reset.text).toContain('https://app.monkey.test/reset-password?token=abc%20123');
    expect(reset.text).toContain('30 minutos');
  });

  it('the change notice is branded, has no button, and says how the password changed', () => {
    expect(changed.html).toContain('cid:monkey-logo');
    expect(changed.inlineImages).toHaveLength(1);
    expect(changed.html).not.toContain('href=');
    expect(changed.html).toContain('Usaste el enlace');
    expect(buildPasswordChangedEmail({ to: 'a@b.co', via: 'changed' }).html).toContain('desde la configuración de tu cuenta');
  });

  it('never names the engine providers, and never carries a password', () => {
    for (const mail of [reset, changed]) expect(`${mail.subject}${mail.text}${mail.html}`.toLowerCase()).not.toMatch(/wazuh|prowler|password=|contraseña:/);
  });
});
