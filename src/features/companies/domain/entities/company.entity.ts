export type IsolationStrategy = 'dedicated' | 'shared';
export type CompanyStatus = 'active' | 'suspended';

// El tenant (modelo-datos.md §4.1). No es el negocio que declara el cliente — eso es
// organizations, que se llena después en el onboarding —, ni un usuario: la cuenta
// admin_empresa la crea el cliente al canjear su clave de acceso.
export class Company {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly adminEmail: string,
    public readonly isolationStrategy: IsolationStrategy,
    public readonly status: CompanyStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  // La razón social se compara sin mayúsculas ni espacios de más: "Acme  S.A.S" = "acme s.a.s".
  static normalizeName(name: string): string {
    return name.trim().replace(/\s+/g, ' ');
  }

  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  static isolationFor(requiresDedicatedDatabase: boolean): IsolationStrategy {
    return requiresDedicatedDatabase ? 'dedicated' : 'shared';
  }
}
