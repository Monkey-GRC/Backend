// El nombre neutro de una prueba (D70) según el idioma de la petición. `display_name` es el del catálogo, en español; `display_name_en` solo existe en las pruebas ya traducidas
// y, sin él, se muestra el español. Una sola regla para toda la API.
export type TestNames = { displayName: string | null; displayNameEn?: string | null };

/** El nombre según el idioma, o null si la prueba no tiene ninguno (cada pantalla decide su texto genérico). */
export function localizedTestName(test: TestNames, lang: string | undefined): string | null {
  const english = lang?.toLowerCase().startsWith('en') === true;
  return (english ? test.displayNameEn || test.displayName : test.displayName) ?? null;
}

/** El nombre visible: `en` → `display_name_en ?? display_name ?? code`; `es` → `display_name ?? code`. */
export const testDisplayName = (test: TestNames & { code: string }, lang: string | undefined): string => localizedTestName(test, lang) ?? test.code;
