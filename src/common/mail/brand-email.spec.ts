import { escapeHtml, renderBrandEmail } from './brand-email';

const base = { title: 'Título', preheader: 'Vista previa', heading: 'Encabezado', introHtml: 'Hola', footnote: 'Nota', logoCid: 'monkey-logo' };

describe('renderBrandEmail (la plantilla de marca de los correos)', () => {
  it('draws the brand header with the logo embedded in the email itself (cid), not downloaded from a URL', () => {
    const html = renderBrandEmail(base);
    expect(html).toContain('src="cid:monkey-logo"');
    expect(html).not.toContain('http');
    expect(html).toContain('Encabezado');
    expect(html).toContain('Monkey &middot; Ciberseguridad y cumplimiento');
  });

  it('falls back to the name in text when there is no logo', () => {
    const html = renderBrandEmail({ ...base, logoCid: null });
    expect(html).not.toContain('<img');
    expect(html).toContain('>MONKEY<');
  });

  it('adds a button only when asked, and escapes its label and address', () => {
    expect(renderBrandEmail(base)).not.toContain('href=');
    const html = renderBrandEmail({ ...base, button: { label: 'Entrar <ya>', url: 'https://app.monkey.test/x?a=1&b="2"' } });
    expect(html).toContain('href="https://app.monkey.test/x?a=1&amp;b=&quot;2&quot;"');
    expect(html).toContain('Entrar &lt;ya&gt;');
  });

  it('adds the highlight and the bullets only when given, and always escapes the plain texts', () => {
    const plain = renderBrandEmail(base);
    expect(plain).not.toContain('&bull;');
    const html = renderBrandEmail({ ...base, highlightHtml: '<b>CLAVE</b>', bulletsHtml: ['uno', 'dos'], title: '<script>', footnote: 'a & b' });
    expect(html).toContain('<b>CLAVE</b>');
    expect(html.match(/&bull;/g)).toHaveLength(2);
    expect(html).toContain('<title>&lt;script&gt;</title>');
    expect(html).toContain('a &amp; b');
  });
});

describe('helpers', () => {
  it('escapeHtml escapes the four dangerous characters', () => {
    expect(escapeHtml(`<a href="x">&</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;');
  });
});
