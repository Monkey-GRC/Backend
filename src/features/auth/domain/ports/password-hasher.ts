export abstract class PasswordHasher {
  abstract hash(plain: string): Promise<string>;
  abstract compare(plain: string, hash: string): Promise<boolean>;
  // Mismo costo que un compare real: se usa cuando el email no existe, para que el tiempo de
  // respuesta no delate si una cuenta existe.
  abstract compareAgainstDummy(plain: string): Promise<void>;
}
