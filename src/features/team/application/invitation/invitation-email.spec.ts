import { buildInvitationEmail } from './invitation-email';

const base = { to: 'ana@acme.test', inviterName: 'Lucía Gómez', companyName: 'Acme S.A.S.', role: 'delegado', code: 'MNK-7F3A-92KD-5QXB', expiresAt: new Date('2026-11-12T15:04:00Z'), appUrl: null };

describe('buildInvitationEmail', () => {
  it('lleva quién invitó, la empresa, el rol en lenguaje de negocio, el código y el vencimiento, y es confidencial', () => {
    const m = buildInvitationEmail(base);
    expect(m.to).toBe('ana@acme.test');
    expect(m.confidential).toBe(true);
    expect(m.text).toContain('Lucía Gómez te invitó');
    expect(m.text).toContain('Acme S.A.S.');
    expect(m.text).toContain('rol de delegado');
    expect(m.text).toContain('MNK-7F3A-92KD-5QXB');
    expect(m.text).toContain('12/11/2026 15:04 UTC');
    expect(m.text).not.toContain('http');
    expect(`${m.subject}${m.text}${m.html}`.toLowerCase()).not.toMatch(/wazuh|prowler/);
  });

  it('escapa en el HTML lo que viene de afuera y pone el enlace solo si hay dirección', () => {
    const m = buildInvitationEmail({ ...base, companyName: '<b>Acme</b>', appUrl: 'https://app.monkey.test' });
    expect(m.html).toContain('&lt;b&gt;Acme&lt;/b&gt;');
    expect(m.html).not.toContain('<b>Acme</b>');
    expect(m.html).toContain('href="https://app.monkey.test"');
    expect(m.text).toContain('https://app.monkey.test');
  });
});
