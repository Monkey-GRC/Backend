// modelo-datos.md §5.3: 12+ caracteres con mayúscula, minúscula, número y símbolo.
export const PASSWORD_MIN_LENGTH = 12;

export function meetsPasswordPolicy(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
