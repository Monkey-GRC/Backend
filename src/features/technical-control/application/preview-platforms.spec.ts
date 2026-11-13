import { readPreviewPlatforms } from './preview-platforms';

describe('readPreviewPlatforms', () => {
  it('sin valor no hay plataformas de vista previa, ni en producción', () => {
    expect(readPreviewPlatforms(undefined, 'production')).toEqual([]);
    expect(readPreviewPlatforms('  ', 'production')).toEqual([]);
  });
  it('en desarrollo lee una lista separada por comas', () => {
    expect(readPreviewPlatforms('gcp, Azure ,', 'development')).toEqual(['gcp', 'azure']);
  });
  it('en producción el servidor se niega a arrancar si está definida', () => {
    expect(() => readPreviewPlatforms('gcp', 'production')).toThrow(/PREVIEW_PLATFORMS.*producción/);
  });
  it('rechaza valores que no son códigos de plataforma', () => {
    expect(() => readPreviewPlatforms('gcp;rm', 'development')).toThrow(/PREVIEW_PLATFORMS/);
  });
});
