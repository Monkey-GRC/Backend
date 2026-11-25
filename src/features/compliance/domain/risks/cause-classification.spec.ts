import { classificationErrorsOf } from './cause-classification';

describe('classificationErrorsOf (MD-499)', () => {
  it('una causa propia acepta cualquier clasificación, también null', () => {
    expect(classificationErrorsOf({ fromCatalog: false }, { causeOrigin: null, causeType: 'human' })).toEqual([]);
  });

  it('una del catálogo devuelve el campo intentado; sin clasificación en el patch, nada', () => {
    expect(classificationErrorsOf({ fromCatalog: true }, { name: 'n' })).toEqual([]);
    expect(classificationErrorsOf({ fromCatalog: true }, { causeOrigin: 'external' })).toEqual([{ field: 'cause_origin', code: 'cause.catalog_classification' }]);
    expect(classificationErrorsOf({ fromCatalog: true }, { causeOrigin: 'external', causeType: null }).map((e) => e.field)).toEqual(['cause_origin', 'cause_type']);
  });
});
