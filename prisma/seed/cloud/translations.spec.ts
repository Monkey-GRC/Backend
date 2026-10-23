import { validateTranslations } from './translations';

const ok = { checkId: 'a', titleEs: 'Título', remediationEs: 'Haz esto.' };
const known = new Set(['a', 'b']);

describe('validateTranslations (D90)', () => {
  it('accepts a complete translation of a known check', () => {
    expect(validateTranslations([ok], known)).toEqual([]);
  });

  it('rejects unknown, repeated and incomplete translations', () => {
    const problems = validateTranslations([ok, ok, { checkId: 'z', titleEs: 'x', remediationEs: 'y' }, { checkId: 'b', titleEs: ' ', remediationEs: '' }], known);
    expect(problems).toEqual(expect.arrayContaining(['a: repetido', 'z: no existe en el catálogo', 'b: falta el título', 'b: falta la guía']));
  });

  it('rejects a text that names the probe provider', () => {
    expect(validateTranslations([{ ...ok, remediationEs: 'Consulta la documentación de Prowler.' }], known)).toEqual(['a: nombra al proveedor de la sonda']);
  });
});