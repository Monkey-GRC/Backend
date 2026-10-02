// Comprobación del clonado (MD-80) contra una base REAL con el catálogo de SOC 2 sembrado.
// Todo ocurre dentro de una transacción que se REVIERTE al final: no deja ningún rastro.
//
//   npm run clone:verify     (usa DATABASE_URL, el rol dueño)
//
// No es una prueba de jest porque el cliente de Prisma 7 es ESM y el jest del repo es CommonJS.
import 'dotenv/config';
import assert from 'node:assert/strict';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { CloneCatalogService } from '../src/features/onboarding/application/clone-catalog.service';

class Rollback extends Error {}
type Tx = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const ok = (m: string) => console.log('  ✓ ' + m);

async function inRollback(fn: (tx: Tx) => Promise<void>) {
  try {
    await prisma.$transaction(async (tx) => {
      await fn(tx);
      throw new Rollback();
    }, { timeout: 180_000, maxWait: 10_000 });
  } catch (e) {
    if (!(e instanceof Rollback)) throw e;
  }
}

/** Empresa con un servicio que contrata SOC 2 con los criterios dados. */
async function contract(tx: Tx, criteria: string[]) {
  const company = await tx.company.create({ data: { name: 'Prueba clonado', adminEmail: 'clonado@example.test' } });
  const org = await tx.organization.create({
    data: {
      companyId: company.id, name: 'Prueba clonado', description: 'x', size: 'from_51_to_200', industry: 'bpo_outsourcing', businessModel: 'consulting',
      complianceMaturity: 'implementing', incorporationCountries: ['co'], clientCountries: ['co'],
    },
  });
  // Prisma 7 con @map: el tipo generado dice "24x7" pero el cliente en runtime espera el nombre del miembro (h24x7).
  const newService = (name: string) =>
    tx.service.create({
      data: {
        tenantId: company.id, organizationId: org.id, name, description: 'x', scopeStatement: 'x', type: 'saas',
        expectedAvailability: 'h24x7' as never, deploymentScenario: 'cloud_with_servers', industriesServed: [], countries: [], dataTypes: [],
      },
    });
  const service = await newService('Servicio');
  const tcs = await tx.trustCriterion.findMany({ where: { criterion: { in: criteria as never[] } } });
  await tx.serviceTrustCriterion.createMany({ data: tcs.map((t) => ({ tenantId: company.id, serviceId: service.id, trustCriterionId: t.id })) });
  const fw = await tx.framework.findFirstOrThrow({ where: { code: 'soc2' } });
  const version = await tx.catalogVersion.findFirstOrThrow({ orderBy: { number: 'desc' } });
  const sf = await tx.serviceFramework.create({
    data: { tenantId: company.id, frameworkId: fw.id, serviceId: service.id, catalogVersionId: version.id, contractedAt: new Date('2026-10-01'), evaluationPeriod: '12 meses' },
  });
  return { company, org, service, sf, fw, newService };
}

async function main() {
  const svc = new CloneCatalogService();

  console.log('\n1. Clona SOC 2 al servicio, es idempotente y respeta lo que el cliente ya tiene');
  await inRollback(async (tx) => {
    const { service, sf, fw } = await contract(tx, ['security']);
    const expectedControls = new Set(
      (await tx.pointOfFocusControl.findMany({
        where: { pointOfFocus: { requirement: { frameworkId: fw.id, trustCriterion: { criterion: 'security' } } } },
        select: { controlId: true },
      })).map((r) => r.controlId),
    );
    const first = await svc.cloneForServiceFramework(tx, sf.id);
    console.log('    ', JSON.stringify(first));
    assert.equal(first.clientControls, expectedControls.size);
    ok(`${first.clientControls} controles: exactamente los de los puntos de enfoque de Seguridad`);
    assert.equal(first.clientRisks, 10);
    assert.equal(first.clientCauses, 56);
    assert.equal(first.clientRiskCauses, 92);
    ok('set base de riesgos (10), causas (56) y relaciones riesgo↔causa (92)');
    assert.ok(first.clientControlTests > 0 && first.evidenceRequirements > 0 && first.clientControlDimensions > first.clientControls);
    ok('dimensiones, vínculo con pruebas y evidencias requeridas clonados');

    assert.equal(await tx.clientControl.count({ where: { serviceId: service.id } }), expectedControls.size);
    assert.equal(await tx.clientControl.count({ where: { serviceId: service.id, controlId: null } }), 0);
    assert.equal(await tx.clientControl.count({ where: { serviceId: service.id, ownCode: 'CPL-1' } }), 0);
    ok('CPL-1 (sin punto de enfoque) no se clona; todos quedan ligados a su plantilla');
    assert.equal(await tx.evidenceRequirement.count({ where: { clientControl: { serviceId: service.id }, responsibleId: { not: null } } }), 0);
    assert.equal(await tx.evidenceRequirement.count({ where: { clientControl: { serviceId: service.id }, validityWithinPeriod: { not: '12 meses' } } }), 0);
    ok('evidencias sin responsable y con el periodo de evaluación del marco');
    assert.equal(await tx.clientControlDimension.count({ where: { clientControl: { serviceId: service.id }, dimension: 'app' } }), 0);
    ok('ninguna dimensión de aplicación (0 pruebas T-APP, P9)');

    const second = await svc.cloneForServiceFramework(tx, sf.id);
    assert.ok(Object.values(second).every((n) => n === 0));
    ok('clonar de nuevo no crea nada (idempotente)');

    const own = await tx.clientControl.create({ data: { tenantId: sf.tenantId, serviceId: service.id, ownCode: 'C01', clientInterpretation: 'Mío', type: 'manual' } });
    const victim = await tx.clientControl.findFirstOrThrow({ where: { serviceId: service.id, controlId: { not: null } } });
    await tx.clientControl.update({ where: { id: victim.id }, data: { isActive: false } });
    const third = await svc.cloneForServiceFramework(tx, sf.id);
    assert.ok(Object.values(third).every((n) => n === 0));
    assert.equal((await tx.clientControl.findUniqueOrThrow({ where: { id: victim.id } })).isActive, false);
    assert.ok(await tx.clientControl.findUnique({ where: { id: own.id } }));
    ok('un control propio y uno dado de baja por el cliente no se tocan al volver a clonar');

    const avail = await tx.trustCriterion.findFirstOrThrow({ where: { criterion: 'availability' } });
    await tx.serviceTrustCriterion.create({ data: { tenantId: sf.tenantId, serviceId: service.id, trustCriterionId: avail.id } });
    const fourth = await svc.cloneForServiceFramework(tx, sf.id);
    assert.ok(fourth.clientControls > 0);
    assert.equal(fourth.clientRisks, 0);
    assert.equal(fourth.clientCauses, 0);
    ok(`contratar Disponibilidad después suma solo lo nuevo (${fourth.clientControls} controles)`);
  });

  console.log('\n2. Dos servicios del mismo cliente obtienen cada uno su propio juego de controles');
  await inRollback(async (tx) => {
    const a = await contract(tx, ['security']);
    const second = await a.newService('Servicio 2');
    const sec = await tx.trustCriterion.findFirstOrThrow({ where: { criterion: 'security' } });
    await tx.serviceTrustCriterion.create({ data: { tenantId: a.company.id, serviceId: second.id, trustCriterionId: sec.id } });
    const sf2 = await tx.serviceFramework.create({
      data: { tenantId: a.company.id, frameworkId: a.fw.id, serviceId: second.id, catalogVersionId: a.sf.catalogVersionId, contractedAt: new Date('2026-10-01'), evaluationPeriod: '6 meses' },
    });
    const r1 = await svc.cloneForServiceFramework(tx, a.sf.id);
    const r2 = await svc.cloneForServiceFramework(tx, sf2.id);
    assert.equal(r2.clientControls, r1.clientControls);
    assert.equal(await tx.clientControl.count({ where: { tenantId: a.company.id } }), r1.clientControls * 2);
    assert.equal((await tx.evidenceRequirement.findFirstOrThrow({ where: { clientControl: { serviceId: second.id } } })).validityWithinPeriod, '6 meses');
    ok(`${r1.clientControls} controles por servicio, cada uno con su periodo de evaluación`);
  });

  console.log('\n3. Un servicio sin criterios contratados falla en vez de clonar vacío');
  await inRollback(async (tx) => {
    const { sf } = await contract(tx, []);
    await assert.rejects(() => svc.cloneForServiceFramework(tx, sf.id), /no tiene ningún criterio de confianza/);
    ok('error claro');
  });

  console.log('\n4. Con el rol de la app (monkey_app) y el contexto de tenant, bajo RLS');
  await inRollback(async (tx) => {
    const { company, sf } = await contract(tx, ['security']);
    await tx.$executeRaw`select set_config('app.tenant_id', ${company.id}, true), set_config('app.user_role', 'admin_empresa', true)`;
    await tx.$executeRawUnsafe('SET LOCAL ROLE monkey_app');
    const r = await svc.cloneForServiceFramework(tx, sf.id);
    assert.equal(r.clientControls, 79);
    ok(`el clonado escribe ${r.clientControls} controles y el resto con las políticas RLS de tenant`);
    const again = await svc.cloneForServiceFramework(tx, sf.id);
    assert.ok(Object.values(again).every((n) => n === 0));
    ok('y sigue siendo idempotente');
    await tx.$executeRawUnsafe('RESET ROLE');
  });

  console.log('\n✓ El clonado se comporta como dice MD-80. Todo se revirtió: la base quedó como estaba.');
}

main()
  .catch((e) => {
    console.error('\n✗', e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
