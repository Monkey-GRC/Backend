import { buildAccessKeyEmail } from '../../features/companies/application/access-key-email';
import { buildPasswordChangedEmail, buildPasswordResetLinkEmail } from '../../features/auth/application/password-email';
import { buildInvitationEmail } from '../../features/team/application/invitation/invitation-email';
import { renderBrandEmail } from './brand-email';
import type { MailMessage } from './mailer';

// D111 · Las cuatro plantillas existen en español y en inglés, con la misma información y sin nombrar al motor.
const expires = new Date(Date.UTC(2026, 10, 5, 14, 3));
const access = (language: 'es' | 'en') => buildAccessKeyEmail({ companyName: 'Acme <S.A.>', adminEmail: 'ana@acme.co', code: 'ABCD-1234', expiresAt: expires, redeemUrl: 'https://app.test/register', language });
const invitation = (language: 'es' | 'en', role = 'responsable') => buildInvitationEmail({ to: 'luis@acme.co', inviterName: 'Ana', companyName: 'Acme', role, code: 'XYZ-9', expiresAt: expires, appUrl: 'https://app.test', language });
const reset = (language: 'es' | 'en') => buildPasswordResetLinkEmail({ to: 'ana@acme.co', resetUrl: 'https://app.test/reset-password?token=t', minutes: 30, language });
const changed = (language: 'es' | 'en', via: 'changed' | 'reset' = 'changed') => buildPasswordChangedEmail({ to: 'ana@acme.co', via, language });
const body = (m: MailMessage) => `${m.subject}\n${m.text}\n${m.html}`;

describe('plantillas de correo por idioma', () => {
  it('clave de acceso: asunto, texto y fecha en cada idioma; el código y el enlace no cambian', () => {
    const es = access('es');
    const en = access('en');
    expect(es.subject).toBe('Tu clave de acceso a Monkey');
    expect(en.subject).toBe('Your Monkey access key');
    expect(es.text).toContain('Vence el 05/11/2026 14:03 UTC');
    expect(en.text).toContain('It expires on Nov 5, 2026, 14:03 UTC');
    for (const m of [es, en]) expect([m.text, m.html ?? ''].every((t) => t.includes('ABCD-1234') && t.includes('https://app.test/register'))).toBe(true);
    expect(en.html).toContain('<html lang="en">');
    expect(en.html).toContain('Access key');
    expect(en.html).toContain('Acme &lt;S.A.&gt;');
  });

  it('invitación: el rol y los textos en cada idioma, y sigue siendo confidencial', () => {
    const es = invitation('es');
    const en = invitation('en');
    expect(es.subject).toBe('Ana te invitó a Monkey');
    expect(en.subject).toBe('Ana invited you to Monkey');
    expect(es.text).toContain('con el rol de responsable');
    expect(en.text).toContain('with the role of responsible');
    expect(invitation('en', 'admin_empresa').text).toContain('administrator');
    expect(invitation('en', 'delegado').text).toContain('delegate');
    expect(es.text).toContain('vence el 05/11/2026 14:03 UTC');
    expect(en.text).toContain('expires on Nov 5, 2026, 14:03 UTC');
    expect([es.confidential, en.confidential]).toEqual([true, true]);
  });

  it('recuperar la contraseña y el aviso de cambio, en cada idioma', () => {
    expect(reset('es').subject).toBe('Crea tu contraseña nueva de Monkey');
    expect(reset('en').subject).toBe('Create your new Monkey password');
    expect(reset('en').text).toContain('expires in 30 minutes');
    expect(changed('es', 'reset').text).toContain('Usaste el enlace');
    expect(changed('en', 'reset').text).toContain('You used the "Forgot your password?" link.');
    expect(changed('en').text).toContain('You changed it from your account settings.');
    expect(changed('en').subject).toBe('Your Monkey account password changed');
  });

  it('sin idioma salen en español (compatibilidad)', () => {
    expect(buildPasswordResetLinkEmail({ to: 'a@b.co', resetUrl: 'https://x', minutes: 5 }).subject).toBe('Crea tu contraseña nueva de Monkey');
  });

  it('el envoltorio común lleva el idioma en <html lang> y en el pie', () => {
    const base = { title: 't', preheader: 'p', heading: 'h', introHtml: 'i', footnote: 'f', logoCid: null };
    expect(renderBrandEmail(base)).toContain('<html lang="es">');
    expect(renderBrandEmail({ ...base, lang: 'en' })).toContain('<html lang="en">');
    expect(renderBrandEmail({ ...base, lang: 'en' })).toContain('Monkey &middot; Cybersecurity and compliance');
    expect(renderBrandEmail(base)).toContain('Monkey &middot; Ciberseguridad y cumplimiento');
  });

  it('ningún texto en ningún idioma nombra al motor que evalúa', () => {
    for (const lang of ['es', 'en'] as const) for (const m of [access(lang), invitation(lang), reset(lang), changed(lang), changed(lang, 'reset')]) expect(body(m)).not.toMatch(/wazuh|prowler/i);
  });
});
