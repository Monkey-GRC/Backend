import { MAIL_ONLY_CHECKS, mailReviewed } from './mail-review';

describe('mailReviewed (D157)', () => {
  const m365 = new Set(['e1', 'e2']);
  const withMail = new Set(['e1']);

  it('dice si la evaluación completada de Microsoft 365 leyó el correo', () => {
    expect(mailReviewed({ id: 'e1', status: 'completed' }, m365, withMail)).toBe(true);
    expect(mailReviewed({ id: 'e2', status: 'completed' }, m365, withMail)).toBe(false);
  });

  it('no aplica a otra nube ni a una evaluación sin terminar', () => {
    expect(mailReviewed({ id: 'aws', status: 'completed' }, m365, withMail)).toBeNull();
    expect(mailReviewed({ id: 'e1', status: 'running' }, m365, withMail)).toBeNull();
    expect(mailReviewed({ id: 'e1', status: 'failed' }, m365, withMail)).toBeNull();
  });

  it('no cuenta la verificación de correo que también aparece sin ese acceso', () => {
    expect(MAIL_ONLY_CHECKS).not.toContain('exchange_application_access_policy_restricts_mailbox_apps');
    expect(new Set(MAIL_ONLY_CHECKS).size).toBe(MAIL_ONLY_CHECKS.length);
  });
});
