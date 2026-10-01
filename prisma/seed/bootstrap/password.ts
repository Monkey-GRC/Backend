// Política de contraseña de modelo-datos.md §5.3: 12+ caracteres con mayúscula, minúscula, número y símbolo.
export function passwordProblems(p: string): string[] {
  const out: string[] = [];
  if (p.length < 12) out.push('mínimo 12 caracteres');
  if (!/[A-Z]/.test(p)) out.push('una mayúscula');
  if (!/[a-z]/.test(p)) out.push('una minúscula');
  if (!/\d/.test(p)) out.push('un número');
  if (!/[^A-Za-z0-9]/.test(p)) out.push('un símbolo');
  return out;
}
