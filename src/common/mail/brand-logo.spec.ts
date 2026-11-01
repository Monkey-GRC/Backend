import { BRAND_LOGO_CID, loadBrandLogo } from './brand-logo';

describe('loadBrandLogo (el logo que viaja en los correos)', () => {
  it('reads the PNG of the project once and hands it over ready to attach', () => {
    const logo = loadBrandLogo()!;
    expect(logo.cid).toBe(BRAND_LOGO_CID);
    expect(logo.contentType).toBe('image/png');
    const bytes = Buffer.from(logo.contentBase64, 'base64');
    expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a'); // firma de un PNG
    expect(bytes.length).toBeLessThan(200_000); // un logo, no una foto: el correo debe pesar poco
    expect(loadBrandLogo()).toBe(logo); // se lee una sola vez
  });
});
