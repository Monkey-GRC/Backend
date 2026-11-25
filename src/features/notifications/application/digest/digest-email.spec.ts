import { translatorFor } from '../../domain/notification-text.fixtures';
import { buildDigestEmail } from './digest-email';

// D143, D151 · El resumen diario: asunto con la cantidad y la fecha, una línea por aviso, «y N más», un botón a la campana y cómo apagarlo; en el idioma de la persona y sin proveedor.
const lines = [
  { title: 'IAC-12 · La ventana trimestral cierra el 31/12/2026 y falta evidencia', serviceName: 'Plataforma de pagos' },
  { title: 'IAC-3 · Se rechazó una evidencia', serviceName: null },
];
const base = { to: 'ana@empresa.test', date: '2026-11-24', lines, total: 2, appUrl: 'https://app.monkey.test' };

describe('buildDigestEmail', () => {
  it('en español: «Monkey · Tienes N avisos nuevos (dd/mm/aaaa)», una línea por aviso con su servicio y el botón', () => {
    const m = buildDigestEmail({ ...base, lang: 'es' }, translatorFor('es'));
    expect(m.subject).toBe('Monkey · Tienes 2 avisos nuevos (24/11/2026)');
    expect(m.to).toBe('ana@empresa.test');
    expect(m.text).toContain('- IAC-12 · La ventana trimestral cierra el 31/12/2026 y falta evidencia · Plataforma de pagos');
    expect(m.text).toContain('- IAC-3 · Se rechazó una evidencia');
    expect(m.text).toContain('Abrir mis notificaciones: https://app.monkey.test');
    expect(m.text).toContain('desactiva el resumen por correo');
    expect(m.html).toContain('href="https://app.monkey.test"');
    expect(m.html).toContain('lang="es"');
  });

  it('en inglés', () => {
    const m = buildDigestEmail({ ...base, lang: 'en', lines: [lines[0]], total: 1 }, translatorFor('en'));
    expect(m.subject).toBe('Monkey · You have 1 new notification (Nov 24, 2026)');
    expect(m.text).toContain('Open my notifications');
    expect(m.html).toContain('lang="en"');
  });

  it('con más avisos que líneas dice «y N más»', () => {
    const m = buildDigestEmail({ ...base, lang: 'es', total: 23 }, translatorFor('es'));
    expect(m.subject).toContain('Tienes 23 avisos nuevos');
    expect(m.text).toContain('- y 21 más');
  });

  it('sin dirección de la app el correo sale sin botón ni enlace', () => {
    const m = buildDigestEmail({ ...base, lang: 'es', appUrl: undefined }, translatorFor('es'));
    expect(m.text).not.toContain('Abrir mis notificaciones');
    expect(m.html).not.toContain('<a href');
  });

  it('escapa el HTML de lo que viene de afuera (el nombre de un control o de un servicio)', () => {
    const m = buildDigestEmail({ ...base, lang: 'es', lines: [{ title: 'IAC-1 · <script>alert(1)</script>', serviceName: 'A & B' }], total: 1 }, translatorFor('es'));
    expect(m.html).not.toContain('<script>');
    expect(m.html).toContain('&lt;script&gt;');
    expect(m.html).toContain('A &amp; B');
  });

  it('nunca nombra al proveedor de la sonda ni del motor de nube', () => {
    for (const lang of ['es', 'en'] as const) {
      const m = buildDigestEmail({ ...base, lang }, translatorFor(lang));
      expect(`${m.subject}${m.text}${m.html}`).not.toMatch(/wazuh|prowler/i);
    }
  });
});
