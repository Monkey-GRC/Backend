// Comprueba que el audit trail (MD-92) y las evaluaciones (MD-145) son inmutables en la base de datos, para TODOS los roles.
// Todo ocurre dentro de una transacción que se REVIERTE: no deja ningún rastro y no toca el histórico real.
//
//   npm run audit:verify     (usa DATABASE_URL, el rol dueño)
import 'dotenv/config';
import assert from 'node:assert/strict';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

class Rollback extends Error {}
type Tx = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const ok = (m: string) => console.log('  ✓ ' + m);
let failures = 0;
const check = (cond: boolean, pass: string, fail: string) => (cond ? ok(pass) : (failures++, console.error('  ✗ ' + fail)));

/** Ejecuta una sentencia que DEBE fallar, dentro de un savepoint para no abortar la transacción. */
async function mustFail(tx: Tx, sql: string, pass: string, expected: RegExp) {
  await tx.$executeRawUnsafe('SAVEPOINT intento');
  let error: string | null = null;
  try {
    await tx.$executeRawUnsafe(sql);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT intento');
  check(error !== null && expected.test(error), pass, `NO falló como debía: ${sql}${error ? `  (error inesperado: ${error.slice(0, 120)})` : '  (se ejecutó sin error)'}`);
}

async function main() {
  try {
    await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({ data: { name: 'Prueba auditoría', adminEmail: 'auditoria@example.test' } });
      const user = await tx.user.create({
        data: { companyId: company.id, email: 'auditoria@example.test', name: 'x', lastName: 'y', passwordHash: 'no-es-un-hash', role: 'admin_empresa' },
      });
      await tx.$executeRaw`insert into audit.audit_logs (id, tenant_id, user_id, action, resource, ip_address, user_agent, result)
        values (gen_random_uuid(), ${company.id}::uuid, ${user.id}::uuid, 'prueba.insertar', 'prueba', '127.0.0.1', 'verify', 'success')`;
      await tx.$executeRaw`insert into audit.compliance_events (id, tenant_id, user_id, changed_field, new_value, ip_address, user_agent)
        values (gen_random_uuid(), ${company.id}::uuid, ${user.id}::uuid, 'prueba', '"x"'::jsonb, '127.0.0.1', 'verify')`;
      ok('se puede AGREGAR a audit_logs y a compliance_events (el append sigue funcionando)');

      // Solo las filas de prueba: nunca una sentencia sin WHERE sobre el histórico real (TRUNCATE no admite WHERE,
      // pero es transaccional y toda la prueba se revierte).
      const PRUEBA = (t: string) => (t.endsWith('audit_logs') ? "action like 'prueba.%'" : "changed_field = 'prueba'");
      const writes = /append-only|insufficient_privilege|permission denied|permiso denegado/i;
      console.log('\n1. Como el dueño de las tablas (el rol de las migraciones)');
      for (const t of ['audit.audit_logs', 'audit.compliance_events']) {
        await mustFail(tx, `update ${t} set created_at = now() where ${PRUEBA(t)}`, `UPDATE sobre ${t} falla`, writes);
        await mustFail(tx, `delete from ${t} where ${PRUEBA(t)}`, `DELETE sobre ${t} falla`, writes);
        await mustFail(tx, `truncate ${t}`, `TRUNCATE sobre ${t} falla`, writes);
      }
      const dentro = await tx.$queryRaw<{ n: number }[]>`select count(*)::int n from audit.audit_logs where action = 'prueba.insertar'`;
      check(dentro[0].n === 1, 'la fila de prueba sigue intacta', 'la fila de prueba cambió');

      console.log('\n2. Como la app (monkey_app)');
      await tx.$executeRaw`select set_config('app.tenant_id', ${company.id}, true), set_config('app.user_role', 'admin_empresa', true)`;
      await tx.$executeRawUnsafe('SET LOCAL ROLE monkey_app');
      for (const t of ['audit.audit_logs', 'audit.compliance_events']) {
        await mustFail(tx, `update ${t} set created_at = now() where ${PRUEBA(t)}`, `UPDATE sobre ${t} falla`, writes);
        await mustFail(tx, `delete from ${t} where ${PRUEBA(t)}`, `DELETE sobre ${t} falla`, writes);
        await mustFail(tx, `truncate ${t}`, `TRUNCATE sobre ${t} falla`, writes);
      }
      await tx.$executeRaw`insert into audit.audit_logs (id, tenant_id, user_id, action, resource, ip_address, user_agent, result)
        values (gen_random_uuid(), ${company.id}::uuid, ${user.id}::uuid, 'prueba.app', 'prueba', '127.0.0.1', 'verify', 'success')`;
      ok('la app sí puede AGREGAR');
      await tx.$executeRawUnsafe('RESET ROLE');

      // Las evaluaciones (MD-145, SEG-38): nacen de una cadena de filas (servicio, control, test, activo), así que el
      // vaciado se prueba siempre y UPDATE/DELETE sobre una evaluación real si hay alguna; las dos son pruebas por fila
      // completas en test/auditoria/evaluaciones-inmutables.e2e-spec.ts.
      console.log('\n3. Evaluaciones (tenant.evaluations), como el dueño');
      const immutable = /es inmutable|permission denied|permiso denegado/i;
      await mustFail(tx, 'truncate tenant.evaluations cascade', 'TRUNCATE sobre tenant.evaluations falla', immutable);
      const [evaluation] = await tx.$queryRaw<{ id: string }[]>`select id from tenant.evaluations limit 1`;
      if (evaluation) {
        await mustFail(tx, `update tenant.evaluations set evaluated_at = now() where id = '${evaluation.id}'::uuid`, 'UPDATE de lo medido en tenant.evaluations falla', immutable);
        await mustFail(tx, `delete from tenant.evaluations where id = '${evaluation.id}'::uuid`, 'DELETE sobre tenant.evaluations falla', immutable);
      } else {
        console.log('  · no hay evaluaciones en esta base: UPDATE y DELETE por fila quedan para la prueba e2e');
      }

      throw new Rollback();
    }, { timeout: 120_000, maxWait: 10_000 });
  } catch (e) {
    if (!(e instanceof Rollback)) throw e;
  }
  assert.equal(failures, 0, `${failures} comprobación(es) fallaron`);
  console.log('\n✓ El audit trail y las evaluaciones son inmutables para todos los roles. Todo se revirtió: la base quedó como estaba.');
}

main()
  .catch((e) => {
    console.error('\n✗', e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
