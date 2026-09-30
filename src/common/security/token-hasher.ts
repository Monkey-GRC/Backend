// Huella determinista de un secreto de alta entropía (refresh token, clave de acceso) para
// guardarlo y buscarlo por igualdad sin tenerlo nunca en claro. bcrypt no sirve aquí: su sal
// aleatoria da una huella distinta cada vez. Lo usan auth (sesiones) y companies (claves).
export abstract class TokenHasher {
  abstract generate(): string;
  abstract hash(token: string): string;
}
