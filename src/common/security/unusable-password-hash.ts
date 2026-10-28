import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcrypt';

// Mismo costo que el hash de las contraseñas reales (BcryptPasswordHasher): que probar el correo de una cuenta `pending` tarde lo mismo que probar el de cualquier otra
// no deja distinguirla desde fuera.
const COST = 12;

// D95 · Una cuenta `pending` (creada por Monkey, aún sin activar) necesita un `password_hash`, pero nadie debe poder entrar con él. Es el hash real de un secreto aleatorio
// de 256 bits que se descarta en el acto: no existe contraseña que lo cumpla. La persona pone la suya al activar el código.
export function unusablePasswordHash(): Promise<string> {
  return bcrypt.hash(randomBytes(32).toString('hex'), COST);
}