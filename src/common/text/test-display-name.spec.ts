import { localizedTestName, testDisplayName } from './test-display-name';

const full = { code: 'T-CLD-001', displayName: 'Evaluación de IAM', displayNameEn: 'Assessment of IAM' };

describe('nombre neutro de una prueba según el idioma', () => {
  it('en: el inglés, o el español si no está traducido, o el código', () => {
    expect(testDisplayName(full, 'en')).toBe('Assessment of IAM');
    expect(testDisplayName({ ...full, displayNameEn: null }, 'en')).toBe('Evaluación de IAM');
    expect(testDisplayName({ code: 'T-X', displayName: null, displayNameEn: null }, 'en')).toBe('T-X');
  });
  it('es: el español, o el código; nunca el inglés', () => {
    expect(testDisplayName(full, 'es')).toBe('Evaluación de IAM');
    expect(testDisplayName({ code: 'T-X', displayName: null, displayNameEn: 'English only' }, 'es')).toBe('T-X');
  });
  it('un idioma desconocido o ausente se comporta como es; en-US como en', () => {
    expect(testDisplayName(full, undefined)).toBe('Evaluación de IAM');
    expect(testDisplayName(full, 'fr')).toBe('Evaluación de IAM');
    expect(testDisplayName(full, 'en-US')).toBe('Assessment of IAM');
  });
  it('localizedTestName devuelve null sin ningún nombre, para que la pantalla use su texto genérico', () => {
    expect(localizedTestName({ displayName: null, displayNameEn: null }, 'en')).toBeNull();
    expect(localizedTestName({ displayName: 'x' }, 'es')).toBe('x');
  });
});
