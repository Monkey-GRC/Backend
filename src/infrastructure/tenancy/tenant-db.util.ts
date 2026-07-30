const SAFE_PG_IDENTIFIER = /^[a-z_][a-z0-9_]{2,62}$/;

export function assertSafePgIdentifier(id: string): void {
  if (!SAFE_PG_IDENTIFIER.test(id)) {
    throw new Error(`Identificador Postgres inválido: ${id}`);
  }
}

export function tenantIdentifiersFromSeq(seq: number): { dbUser: string; dbName: string } {
  const suffix = `${seq}`;
  const dbUser = `monkey_tenant_${suffix}`;
  const dbName = `monkey_tenant_${suffix}`;
  assertSafePgIdentifier(dbUser);
  assertSafePgIdentifier(dbName);
  return { dbUser, dbName };
}

export interface PostgresConnectionInput {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
}

export function buildPostgresUrl(input: PostgresConnectionInput): string {
  const { host, port, database, user, password, ssl } = input;
  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);
  const sslParam = ssl ? '?sslmode=require' : '';
  return `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${database}${sslParam}`;
}
