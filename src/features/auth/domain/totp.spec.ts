import { base32Decode, base32Encode, buildOtpauthUri, generateTotpSecret, hotp, normalizeTotpCode, totpAt, totpStep, verifyTotp } from './totp';

// El secreto de los vectores de prueba del RFC 6238 es el ASCII «12345678901234567890». El RFC da códigos de 8 dígitos; los de 6 son sus últimos seis.
const RFC_SECRET = base32Encode(Buffer.from('12345678901234567890', 'ascii'));
const at = (seconds: number) => new Date(seconds * 1000);

describe('TOTP (RFC 6238)', () => {
  it.each([
    [59, '287082'],
    [1111111109, '081804'],
    [1111111111, '050471'],
    [1234567890, '005924'],
    [2000000000, '279037'],
    [20000000000, '353130'],
  ])('da el código que fija el RFC en el segundo %i', (seconds, expected) => {
    expect(totpAt(RFC_SECRET, at(seconds))).toBe(expected);
  });

  it('HOTP coincide con los vectores del RFC 4226', () => {
    const secret = Buffer.from('12345678901234567890', 'ascii');
    expect(['755224', '287082', '359152', '969429', '338314', '254676'].map((_, i) => hotp(secret, i))).toEqual(['755224', '287082', '359152', '969429', '338314', '254676']);
  });

  it('base32 va y vuelve sin perder nada', () => {
    const bytes = Buffer.from('Monkey segundo factor', 'utf8');
    expect(base32Decode(base32Encode(bytes)).equals(bytes)).toBe(true);
    expect(base32Decode(' jbsw y3dp ').toString()).toBe('Hello');
  });

  it('un secreto nuevo son 160 bits en base32, distinto cada vez', () => {
    const a = generateTotpSecret();
    expect(a).toMatch(/^[A-Z2-7]{32}$/);
    expect(base32Decode(a)).toHaveLength(20);
    expect(generateTotpSecret()).not.toBe(a);
  });
});

describe('verifyTotp', () => {
  const now = at(1111111109);
  const step = totpStep(now);

  it('acepta el código del paso actual y devuelve su paso', () => {
    expect(verifyTotp(RFC_SECRET, '081804', now, null)).toEqual({ ok: true, step });
  });

  it('acepta un código con espacios y rechaza lo que no son seis dígitos', () => {
    expect(verifyTotp(RFC_SECRET, '081 804', now, null).ok).toBe(true);
    for (const bad of ['', '08180', '0818044', 'abcdef', '08-1804']) expect(verifyTotp(RFC_SECRET, bad, now, null).ok).toBe(false);
  });

  it('absorbe un paso de desfase hacia cada lado, pero no dos', () => {
    expect(verifyTotp(RFC_SECRET, totpAt(RFC_SECRET, at(1111111109 - 30)), now, null).ok).toBe(true);
    expect(verifyTotp(RFC_SECRET, totpAt(RFC_SECRET, at(1111111109 + 30)), now, null).ok).toBe(true);
    expect(verifyTotp(RFC_SECRET, totpAt(RFC_SECRET, at(1111111109 - 90)), now, null).ok).toBe(false);
  });

  it('un código ya usado no vale otra vez, aunque siga dentro de su ventana', () => {
    expect(verifyTotp(RFC_SECRET, '081804', now, step).ok).toBe(false);
    // el del paso siguiente sí, porque es posterior al último usado
    expect(verifyTotp(RFC_SECRET, totpAt(RFC_SECRET, at(1111111109 + 30)), now, step).ok).toBe(true);
  });

  it('rechaza el código de otro secreto', () => {
    expect(verifyTotp(generateTotpSecret(), '081804', now, null).ok).toBe(false);
  });
});

describe('normalizeTotpCode', () => {
  it('quita espacios y exige seis dígitos', () => {
    expect(normalizeTotpCode(' 123 456 ')).toBe('123456');
    expect(normalizeTotpCode('12345')).toBeNull();
  });
});

describe('buildOtpauthUri', () => {
  it('arma la dirección que lee el QR, con el emisor y el correo bien escapados', () => {
    const uri = buildOtpauthUri({ issuer: 'Monkey', account: 'ana.perez+qa@ejemplo.com', secret: 'JBSWY3DPEHPK3PXP' });
    expect(uri.startsWith('otpauth://totp/Monkey:ana.perez%2Bqa%40ejemplo.com?')).toBe(true);
    const query = new URL(uri).searchParams;
    expect(query.get('secret')).toBe('JBSWY3DPEHPK3PXP');
    expect(query.get('issuer')).toBe('Monkey');
    expect([query.get('algorithm'), query.get('digits'), query.get('period')]).toEqual(['SHA1', '6', '30']);
  });
});
