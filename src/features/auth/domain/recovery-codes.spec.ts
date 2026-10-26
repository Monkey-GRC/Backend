import { generateRecoveryCodes, normalizeRecoveryCode, RECOVERY_CODE_COUNT } from './recovery-codes';

describe('códigos de recuperación (D94)', () => {
  it('son 10, con la forma XXXXX-XXXXX, sin caracteres que se confundan y sin repetirse', () => {
    const codes = generateRecoveryCodes();
    expect(codes).toHaveLength(RECOVERY_CODE_COUNT);
    for (const code of codes) expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5}-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5}$/);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('se normalizan: sin guiones ni espacios y en mayúsculas', () => {
    const [code] = generateRecoveryCodes(1);
    const bare = code.replace('-', '');
    expect(normalizeRecoveryCode(code)).toBe(bare);
    expect(normalizeRecoveryCode(` ${code.toLowerCase().replace('-', ' ')} `)).toBe(bare);
  });

  it('un texto con la forma equivocada no es un código', () => {
    for (const bad of ['', 'ABC', 'ABCDE-FGHJ', 'ABCDE-FGHJK-L', 'ABCD0-FGHJK', 'ABCDE-FGHJ1']) expect(normalizeRecoveryCode(bad)).toBeNull();
  });
});
