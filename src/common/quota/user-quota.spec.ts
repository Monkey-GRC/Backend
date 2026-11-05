import { TransactionClient } from '../../infrastructure/database/prisma.service';
import { DomainError } from '../errors/domain-error';
import { assertRoomIn, assertUserRoom, lockUserQuota, QuotaDb } from './user-quota';

// D103 · SEG-72. La función no conoce Prisma: aquí se le da una transacción de mentira que contesta lo que se le diga y recuerda el SQL que recibió.
function fakeDb(company: Array<{ max_users: number | null }>, usersCount: number): QuotaDb & { sql: string[] } {
  const sql: string[] = [];
  const answers: unknown[] = [company, [{ users_count: usersCount }]];
  return {
    sql,
    $queryRaw: (async (strings: TemplateStringsArray) => {
      sql.push(strings.join('?'));
      return answers.shift();
    }) as QuotaDb['$queryRaw'],
  };
}

// El cliente de transacción de Prisma tiene que poder usarse donde se pide un QuotaDb: si deja de cumplirlo, esta línea no compila.
const _prismaCumple = (tx: TransactionClient): QuotaDb => tx;
void _prismaCumple;

describe('lockUserQuota', () => {
  it('bloquea la fila de la empresa ANTES de contar las cuentas', async () => {
    const db = fakeDb([{ max_users: 5 }], 2);
    await expect(lockUserQuota(db, 'c1')).resolves.toEqual({ maxUsers: 5, usersCount: 2 });
    expect(db.sql[0]).toMatch(/FROM platform\.companies/);
    expect(db.sql[0]).toMatch(/FOR UPDATE/);
    expect(db.sql[1]).toMatch(/company_users_count/);
  });

  it('cuenta SOLO con platform.company_users_count: no lee users (RLS) ni repite qué estados cuentan', async () => {
    const db = fakeDb([{ max_users: 5 }], 0);
    await lockUserQuota(db, 'c1');
    expect(db.sql[1]).toMatch(/platform\.company_users_count/);
    expect(db.sql[1]).not.toMatch(/platform\.users/);
    expect(db.sql[1]).not.toMatch(/active|pending|suspended|inactive/);
  });

  it('una empresa que no existe (o no es visible) es NOT_FOUND', async () => {
    await expect(lockUserQuota(fakeDb([], 0), 'c1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('assertUserRoom', () => {
  it('con cupo libre deja pasar y devuelve el cupo', async () => {
    await expect(assertUserRoom(fakeDb([{ max_users: 3 }], 2), 'c1')).resolves.toEqual({ maxUsers: 3, usersCount: 2 });
  });

  it('sin cupo fijado (null) no hay tope, tenga las cuentas que tenga', async () => {
    await expect(assertUserRoom(fakeDb([{ max_users: null }], 500), 'c1')).resolves.toEqual({ maxUsers: null, usersCount: 500 });
  });

  it('con max_users = N y N cuentas contadas, la N+1 es USER_LIMIT_REACHED con los dos números', async () => {
    const err = await assertUserRoom(fakeDb([{ max_users: 3 }], 3), 'c1').catch((e) => e);
    expect(err).toBeInstanceOf(DomainError);
    expect(err.code).toBe('USER_LIMIT_REACHED');
    expect(err.details).toEqual({ max_users: 3, users_count: 3 });
  });

  it('si ya hay más cuentas que el cupo (se bajó a mano), tampoco entra nadie', async () => {
    const err = await assertUserRoom(fakeDb([{ max_users: 2 }], 4), 'c1').catch((e) => e);
    expect(err.code).toBe('USER_LIMIT_REACHED');
    expect(err.details).toEqual({ max_users: 2, users_count: 4 });
  });
});

describe('assertRoomIn', () => {
  it('con espacio no lanza; con el cupo lleno, o sobrepasado, lanza USER_LIMIT_REACHED con los dos números; sin cupo (null) nunca', () => {
    expect(() => assertRoomIn({ maxUsers: 3, usersCount: 2 })).not.toThrow();
    expect(() => assertRoomIn({ maxUsers: null, usersCount: 900 })).not.toThrow();
    for (const quota of [{ maxUsers: 3, usersCount: 3 }, { maxUsers: 3, usersCount: 5 }]) {
      try {
        assertRoomIn(quota);
        throw new Error('debía lanzar');
      } catch (e) {
        expect((e as DomainError).code).toBe('USER_LIMIT_REACHED');
        expect((e as DomainError).details).toEqual({ max_users: quota.maxUsers, users_count: quota.usersCount });
      }
    }
  });
});
