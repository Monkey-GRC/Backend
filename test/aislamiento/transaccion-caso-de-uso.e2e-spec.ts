import type { INestApplication } from '@nestjs/common';
import { insertAuditLog } from '../../src/infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { TransactionRunner } from '../../src/common/tenancy/transaction-runner';
import { bootApp, owner, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-230 · TransactionRunner: una transacción por caso de uso; withScope la reutiliza con el mismo scope.
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let prisma: PrismaService;
let runner: TransactionRunner;

beforeAll(async () => {
  app = await bootApp();
  ({ a, b } = await dosEmpresas(app));
  prisma = app.get(PrismaService);
  runner = app.get(TransactionRunner);
});
afterAll(async () => {
  await app?.close();
});

const scopeA = () => ({ companyId: a.companyId });
const entry = (action: string) => ({ tenantId: a.companyId, userId: null, action, resource: 'tx_test', result: 'success' as const, ipAddress: '127.0.0.1', userAgent: 'jest' });
const rows = (action: string) => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [a.companyId, action]).then((r) => r[0].n);
const txId = (tx: { $queryRaw: PrismaService['$queryRaw'] }) => tx.$queryRaw<{ id: string }[]>`select txid_current()::text as id`.then((r) => r[0].id);

describe('TransactionRunner (MD-230)', () => {
  it('con el mismo scope reutiliza la transacción: una apertura y un solo set_config', async () => {
    const open = jest.spyOn(prisma, '$transaction');
    try {
      const ids = await runner.run(scopeA(), async () => {
        const x = await prisma.withScope(scopeA(), (tx) => txId(tx));
        const y = await prisma.withScope(scopeA(), (tx) => txId(tx));
        const tenant = await prisma.withScope(scopeA(), (tx) => tx.$queryRaw<{ t: string }[]>`select current_setting('app.tenant_id') t`);
        expect(tenant[0].t).toBe(a.companyId);
        return [x, y];
      });
      expect(ids[0]).toBe(ids[1]);
      expect(open).toHaveBeenCalledTimes(1);
    } finally {
      open.mockRestore();
    }
  });

  it('un scope distinto dentro del run es un error y no abre otra transacción', async () => {
    const open = jest.spyOn(prisma, '$transaction');
    try {
      await expect(runner.run(scopeA(), () => prisma.withScope({ companyId: b.companyId }, async () => 1))).rejects.toThrow(/scope distinto/);
      await expect(runner.run(scopeA(), () => prisma.withScope({ companyId: a.companyId, role: 'auditor' }, async () => 1))).rejects.toThrow(/scope distinto/);
      expect(open).toHaveBeenCalledTimes(2);
    } finally {
      open.mockRestore();
    }
  });

  it('un timeout mayor que el del run es un error; uno menor o igual se acepta', async () => {
    await expect(runner.run(scopeA(), () => prisma.withScope(scopeA(), async () => 1, { timeoutMs: 30_000 }), { timeoutMs: 10_000 })).rejects.toThrow(/timeout/);
    await expect(runner.run(scopeA(), () => prisma.withScope(scopeA(), async () => 1, { timeoutMs: 10_000 }), { timeoutMs: 10_000 })).resolves.toBe(1);
  });

  it('si algo falla dentro del run se revierte todo, también la auditoría ya insertada', async () => {
    const action = `tx_rollback_${RUN}`;
    await expect(
      runner.run(scopeA(), async () => {
        await prisma.withScope(scopeA(), (tx) => insertAuditLog(tx, entry(action)));
        await prisma.withScope(scopeA(), (tx) => insertAuditLog(tx, entry(action)));
        throw new Error('falla');
      }),
    ).rejects.toThrow('falla');
    expect(await rows(action)).toBe(0);
  });

  it('si todo sale bien, se confirma', async () => {
    const action = `tx_commit_${RUN}`;
    await runner.run(scopeA(), () => prisma.withScope(scopeA(), (tx) => insertAuditLog(tx, entry(action))));
    expect(await rows(action)).toBe(1);
  });

  it('sin run, cada withScope abre su transacción como siempre', async () => {
    const open = jest.spyOn(prisma, '$transaction');
    try {
      const x = await prisma.withScope(scopeA(), (tx) => txId(tx));
      const y = await prisma.withScope(scopeA(), (tx) => txId(tx));
      expect(x).not.toBe(y);
      expect(open).toHaveBeenCalledTimes(2);
    } finally {
      open.mockRestore();
    }
  });

  it('dentro de un run una tabla con RLS solo devuelve filas de la empresa del scope', async () => {
    const ids = await runner.run(scopeA(), () => prisma.withScope(scopeA(), async (tx) => (await tx.service.findMany({ select: { id: true } })).map((r) => r.id)));
    expect(ids).toContain(a.serviceId);
    expect(ids).not.toContain(b.serviceId);
    const idsB = await runner.run({ companyId: b.companyId }, () => prisma.withScope({ companyId: b.companyId }, async (tx) => (await tx.service.findMany({ select: { id: true } })).map((r) => r.id)));
    expect(idsB).toContain(b.serviceId);
    expect(idsB).not.toContain(a.serviceId);
  });

  it('dos runs de empresas distintas en paralelo, con awaits intercalados, no se cruzan', async () => {
    const vuelta = (t: Tenant) => {
      const scope = { companyId: t.companyId };
      return runner.run(scope, async () => {
        const vistos: Array<{ tenant: string; ids: string[] }> = [];
        for (let i = 0; i < 5; i++) {
          await prisma.withScope(scope, (tx) => tx.$queryRaw`select pg_sleep(0.02)::text`);
          vistos.push(
            await prisma.withScope(scope, async (tx) => ({
              tenant: (await tx.$queryRaw<{ t: string }[]>`select current_setting('app.tenant_id') t`)[0].t,
              ids: (await tx.service.findMany({ select: { id: true } })).map((r) => r.id),
            })),
          );
        }
        return vistos;
      });
    };
    const [va, vb] = await Promise.all([vuelta(a), vuelta(b)]);
    for (const v of va) {
      expect(v.tenant).toBe(a.companyId);
      expect(v.ids).toContain(a.serviceId);
      expect(v.ids).not.toContain(b.serviceId);
    }
    for (const v of vb) {
      expect(v.tenant).toBe(b.companyId);
      expect(v.ids).toContain(b.serviceId);
      expect(v.ids).not.toContain(a.serviceId);
    }
  });
});
