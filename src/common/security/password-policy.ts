// modelo-datos.md §5.3 (SEG-13): 12+ caracteres con mayúscula, minúscula, número y símbolo. Es la ÚNICA definición de
// la política: todo lo que reciba una contraseña nueva (canje de la clave, y cambio o restablecimiento cuando existan)
// la pasa a `IsStrongPassword`. Antes había además una función `meetsPasswordPolicy` que nadie llamaba y que podía
// divergir de la regla real; se eliminó.
export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_POLICY = {
  minLength: PASSWORD_MIN_LENGTH,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
} as const;
