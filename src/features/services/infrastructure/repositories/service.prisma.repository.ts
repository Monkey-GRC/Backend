import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page, PageRequest } from '../../../../common/pagination/page';
import {
  ExpectedAvailability,
  TRUST_CRITERION_MANDATORY,
  TrustCriterionValue,
} from '../../../../common/catalogs/service-catalogs';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import {
  ServiceData,
  ServiceDetail,
  ServiceInput,
  ServicePatch,
  SubserviceInput,
  SystemDescriptionInput,
} from '../../domain/entities/service.entity';
import { Change, ServiceRepository } from '../../domain/repositories/service.repository';
import { CatalogCloner } from '../catalog-cloner';

// Crear o ampliar un servicio clona el catálogo en la misma transacción: escribe unos cientos de
// filas contra la base, así que necesita más de los 5 s que Prisma da por defecto.
const CLONING_TRANSACTION = { timeoutMs: 60_000 };

// "2026-Q4": el periodo de evaluación con que se contrata un marco (A4, modelo-datos.md §6.2).
const evaluationPeriodFor = (date: Date): string =>
  `${date.getUTCFullYear()}-Q${Math.floor(date.getUTCMonth() / 3) + 1}`;

const startOfDayUtc = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

// Prisma no admite miembros de enum que empiecen con dígito: en sus consultas el valor "24x7" se
// llama `h24x7`. Los tipos generados dicen "24x7", pero el runtime solo acepta el nombre.
const toDbAvailability = (value: ExpectedAvailability): never =>
  (value === '24x7' ? 'h24x7' : value) as never;
const fromDbAvailability = (value: string): ExpectedAvailability =>
  (value === 'h24x7' ? '24x7' : value) as ExpectedAvailability;

const subserviceKey =(s: SubserviceInput): string =>
  JSON.stringify([s.type, s.provider, s.serviceProvided, s.responsibility]);

const withMandatory = (criteria: TrustCriterionValue[]): TrustCriterionValue[] =>
  criteria.includes(TRUST_CRITERION_MANDATORY) ? criteria : [TRUST_CRITERION_MANDATORY, ...criteria];

@Injectable()
export class ServicePrismaRepository extends ServiceRepository {
  private readonly cloner = new CatalogCloner();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async existingFrameworkCodes(codes: string[]): Promise<string[]> {
    const rows = await this.prisma.framework.findMany({
      where: { code: { in: codes } },
      select: { code: true },
      distinct: ['code'],
    });
    return rows.map((r) => r.code);
  }

  async existingRegulationCodes(codes: string[]): Promise<string[]> {
    const rows = await this.prisma.regulation.findMany({
      where: { code: { in: codes } },
      select: { code: true },
    });
    return rows.map((r) => r.code);
  }

  contractedFrameworkCodes(scope: TenantScope): Promise<string[]> {
    return this.prisma.withScope(scope, async (tx) => {
      const rows = await tx.companyFramework.findMany({
        where: { companyId: scope.companyId },
        select: { framework: { select: { code: true } } },
      });
      return [...new Set(rows.map((r) => r.framework.code))];
    });
  }

  create(scope: TenantScope, input: ServiceInput): Promise<ServiceDetail> {
    return this.prisma.withScope(scope, async (tx) => {
      const organization = await tx.organization.findUnique({
        where: { companyId: scope.companyId },
        select: { id: true },
      });
      if (!organization) throw new DomainError('ORGANIZATION_NOT_DECLARED');
      await this.assertNameFree(tx, organization.id, input.name, null);

      const service = await tx.service.create({
        data: {
          tenantId: scope.companyId,
          organizationId: organization.id,
          name: input.name,
          description: input.description,
          scopeStatement: input.scopeStatement,
          type: input.type,
          industriesServed: input.industriesServed,
          activeClientCount: input.activeClientCount,
          countries: input.countries,
          dataTypes: input.dataTypes,
          expectedAvailability: toDbAvailability(input.expectedAvailability),
          previousCertification: input.previousCertification,
        },
        select: { id: true },
      });

      await this.replaceTrustCriteria(tx, scope.companyId, service.id, withMandatory(input.trustCriteria));
      await this.replaceRegulations(tx, scope.companyId, service.id, input.regulationCodes);
      await this.syncSubservices(tx, scope.companyId, service.id, input.subserviceOrganizations);
      await this.upsertSystemDescription(tx, scope.companyId, service.id, input.systemDescription);
      await this.syncFrameworks(tx, scope.companyId, service.id, input.frameworkCodes);
      await this.cloneContractedFrameworks(tx, scope.companyId, service.id);

      return this.read(tx, service.id);
    }, CLONING_TRANSACTION);
  }

  list(scope: TenantScope, request: PageRequest): Promise<Page<ServiceDetail>> {
    return this.prisma.withScope(scope, async (tx) => {
      const where = { organization: { companyId: scope.companyId } };
      const total = await tx.service.count({ where });
      const rows = await tx.service.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (request.page - 1) * request.pageSize,
        take: request.pageSize,
        select: { id: true },
      });
      const items: ServiceDetail[] = [];
      for (const row of rows) items.push(await this.read(tx, row.id));
      return { items, total, page: request.page, pageSize: request.pageSize };
    });
  }

  findById(scope: TenantScope, id: string): Promise<ServiceDetail | null> {
    return this.prisma.withScope(scope, (tx) => this.readOrNull(tx, id));
  }

  update(scope: TenantScope, id: string, patch: ServicePatch): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.readOrNull(tx, id);
      if (!before) return null;

      if (patch.name !== undefined) {
        await this.assertNameFree(tx, before.data.organizationId, patch.name, id);
      }
      await tx.service.update({
        where: { id },
        data: {
          name: patch.name,
          description: patch.description,
          scopeStatement: patch.scopeStatement,
          type: patch.type,
          industriesServed: patch.industriesServed,
          activeClientCount: patch.activeClientCount,
          countries: patch.countries,
          dataTypes: patch.dataTypes,
          expectedAvailability:
            patch.expectedAvailability === undefined
              ? undefined
              : toDbAvailability(patch.expectedAvailability),
          previousCertification: patch.previousCertification,
        },
      });

      if (patch.trustCriteria) {
        await this.replaceTrustCriteria(tx, scope.companyId, id, withMandatory(patch.trustCriteria));
      }
      if (patch.regulationCodes) {
        await this.replaceRegulations(tx, scope.companyId, id, patch.regulationCodes);
      }
      if (patch.subserviceOrganizations) {
        await this.syncSubservices(tx, scope.companyId, id, patch.subserviceOrganizations);
      }
      if (patch.systemDescription) {
        await this.upsertSystemDescription(tx, scope.companyId, id, patch.systemDescription);
      }
      if (patch.frameworkCodes) {
        await this.syncFrameworks(tx, scope.companyId, id, patch.frameworkCodes);
      }
      // Ampliar criterios o marcos recalcula los requisitos aplicables y clona lo que falte. Nunca
      // borra ni pisa: lo que el cliente ya tiene (y editó) se queda como está.
      if (patch.trustCriteria || patch.frameworkCodes) {
        await this.cloneContractedFrameworks(tx, scope.companyId, id);
      }

      return { before, after: await this.read(tx, id) };
    }, CLONING_TRANSACTION);
  }

  setSystemDescription(
    scope: TenantScope,
    id: string,
    input: SystemDescriptionInput,
  ): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.readOrNull(tx, id);
      if (!before) return null;
      await this.upsertSystemDescription(tx, scope.companyId, id, input);
      return { before, after: await this.read(tx, id) };
    });
  }

  remove(scope: TenantScope, id: string): Promise<ServiceDetail | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.readOrNull(tx, id);
      if (!before) return null;

      // El histórico es inmutable: con evaluaciones, evidencias entregadas o planes de acción el
      // servicio no se borra.
      const history =
        (await tx.evaluation.count({ where: { serviceId: id } })) +
        (await tx.evidenceSubmission.count({
          where: { evidenceRequirement: { clientControl: { serviceId: id } } },
        })) +
        (await tx.actionPlan.count({ where: { clientControl: { serviceId: id } } }));
      if (history > 0) throw new DomainError('SERVICE_HAS_EVALUATIONS');

      // Solo lo que clonó el onboarding y lo que el cliente declaró; en el orden de las FK.
      const clientControls = { clientControl: { serviceId: id } };
      await tx.clientCauseControl.deleteMany({ where: clientControls });
      await tx.clientRiskCause.deleteMany({ where: { clientRisk: { serviceId: id } } });
      await tx.evidenceRequirement.deleteMany({ where: clientControls });
      await tx.clientControlTest.deleteMany({ where: clientControls });
      await tx.clientControlDimension.deleteMany({ where: clientControls });
      await tx.userControlAssignment.deleteMany({ where: clientControls });
      await tx.clientControl.deleteMany({ where: { serviceId: id } });
      await tx.clientCause.deleteMany({ where: { serviceId: id } });
      await tx.clientRisk.deleteMany({ where: { serviceId: id } });
      await tx.serviceAsset.deleteMany({ where: { serviceId: id } });
      await tx.scope.deleteMany({ where: { serviceId: id } });
      await tx.csoc.deleteMany({ where: { subserviceOrganization: { serviceId: id } } });
      await tx.cuec.deleteMany({ where: { serviceId: id } });
      await tx.subserviceOrganization.deleteMany({ where: { serviceId: id } });
      await tx.systemDescription.deleteMany({ where: { serviceId: id } });
      await tx.serviceRegulation.deleteMany({ where: { serviceId: id } });
      await tx.serviceFramework.deleteMany({ where: { serviceId: id } });
      await tx.serviceTrustCriterion.deleteMany({ where: { serviceId: id } });
      await tx.service.delete({ where: { id } });
      return before;
    }, CLONING_TRANSACTION);
  }

  // --- escritura -------------------------------------------------------------------------------

  private async assertNameFree(
    tx: TransactionClient,
    organizationId: string,
    name: string,
    exceptId: string | null,
  ): Promise<void> {
    const clash = await tx.service.findFirst({
      where: {
        organizationId,
        name: { equals: name, mode: 'insensitive' },
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      select: { id: true },
    });
    if (clash) throw new DomainError('SERVICE_NAME_TAKEN');
  }

  private async replaceTrustCriteria(
    tx: TransactionClient,
    tenantId: string,
    serviceId: string,
    criteria: TrustCriterionValue[],
  ): Promise<void> {
    const wanted = await tx.trustCriterion.findMany({
      where: { criterion: { in: criteria } },
      select: { id: true },
    });
    const wantedIds = wanted.map((c) => c.id);
    await tx.serviceTrustCriterion.deleteMany({
      where: { serviceId, trustCriterionId: { notIn: wantedIds } },
    });
    const kept = await tx.serviceTrustCriterion.findMany({
      where: { serviceId },
      select: { trustCriterionId: true },
    });
    const keptIds = new Set(kept.map((c) => c.trustCriterionId));
    const toAdd = wantedIds.filter((id) => !keptIds.has(id));
    if (toAdd.length) {
      await tx.serviceTrustCriterion.createMany({
        data: toAdd.map((trustCriterionId) => ({ tenantId, serviceId, trustCriterionId })),
      });
    }
  }

  private async replaceRegulations(
    tx: TransactionClient,
    tenantId: string,
    serviceId: string,
    codes: string[],
  ): Promise<void> {
    const wanted = await tx.regulation.findMany({
      where: { code: { in: codes } },
      select: { id: true },
    });
    const wantedIds = wanted.map((r) => r.id);
    await tx.serviceRegulation.deleteMany({
      where: { serviceId, regulationId: { notIn: wantedIds } },
    });
    const kept = await tx.serviceRegulation.findMany({
      where: { serviceId },
      select: { regulationId: true },
    });
    const keptIds = new Set(kept.map((r) => r.regulationId));
    const toAdd = wantedIds.filter((id) => !keptIds.has(id));
    if (toAdd.length) {
      await tx.serviceRegulation.createMany({
        data: toAdd.map((regulationId) => ({ tenantId, serviceId, regulationId })),
      });
    }
  }

  // Deja exactamente la lista enviada. Un proveedor que no cambió conserva su id (de él cuelgan
  // los CSOC), así que solo se borran los que sobran y se crean los nuevos.
  private async syncSubservices(
    tx: TransactionClient,
    tenantId: string,
    serviceId: string,
    wanted: SubserviceInput[],
  ): Promise<void> {
    const current = await tx.subserviceOrganization.findMany({ where: { serviceId } });
    const pending = new Map<string, number>();
    for (const s of wanted) pending.set(subserviceKey(s), (pending.get(subserviceKey(s)) ?? 0) + 1);

    const toDelete: string[] = [];
    for (const row of current) {
      const key = subserviceKey({
        type: row.type,
        provider: row.provider,
        serviceProvided: row.serviceProvided,
        responsibility: row.responsibility,
      });
      const left = pending.get(key) ?? 0;
      if (left > 0) pending.set(key, left - 1);
      else toDelete.push(row.id);
    }
    if (toDelete.length) {
      await tx.subserviceOrganization.deleteMany({ where: { id: { in: toDelete } } });
    }
    const toCreate = wanted.filter((s) => {
      const left = pending.get(subserviceKey(s)) ?? 0;
      if (left <= 0) return false;
      pending.set(subserviceKey(s), left - 1);
      return true;
    });
    if (toCreate.length) {
      await tx.subserviceOrganization.createMany({
        data: toCreate.map((s) => ({
          tenantId,
          serviceId,
          type: s.type,
          provider: s.provider,
          serviceProvided: s.serviceProvided,
          responsibility: s.responsibility,
        })),
      });
    }
  }

  private async upsertSystemDescription(
    tx: TransactionClient,
    tenantId: string,
    serviceId: string,
    input: SystemDescriptionInput,
  ): Promise<void> {
    // Una Descripción del Sistema por servicio. Al cambiar el documento se vacían las secciones:
    // las que había detectado ya no corresponden.
    await tx.systemDescription.upsert({
      where: { serviceId },
      create: { tenantId, serviceId, filePath: input.url, sections: [] },
      update: { filePath: input.url, sections: [] },
    });
  }

  // Contrata los marcos pedidos (con la versión vigente del catálogo y el periodo actual), pausa
  // los que ya no se piden y reactiva los que vuelven. No borra nada: el histórico manda.
  private async syncFrameworks(
    tx: TransactionClient,
    tenantId: string,
    serviceId: string,
    codes: string[],
  ): Promise<void> {
    const current = await tx.serviceFramework.findMany({
      where: { serviceId },
      include: { framework: { select: { code: true } } },
    });
    const currentByCode = new Map(current.map((f) => [f.framework.code, f]));

    for (const row of current) {
      if (!codes.includes(row.framework.code) && row.status === 'active') {
        await tx.serviceFramework.update({ where: { id: row.id }, data: { status: 'paused' } });
      }
    }

    const today = new Date();
    for (const code of codes) {
      const existing = currentByCode.get(code);
      if (existing) {
        if (existing.status !== 'active') {
          await tx.serviceFramework.update({ where: { id: existing.id }, data: { status: 'active' } });
        }
        continue;
      }
      const framework = await tx.framework.findFirstOrThrow({
        where: { code },
        orderBy: { version: 'desc' },
        select: { id: true },
      });
      const version = await tx.catalogVersion.findFirstOrThrow({
        orderBy: { number: 'desc' },
        select: { id: true },
      });
      await tx.serviceFramework.create({
        data: {
          tenantId,
          serviceId,
          frameworkId: framework.id,
          catalogVersionId: version.id,
          contractedAt: startOfDayUtc(today),
          evaluationPeriod: evaluationPeriodFor(today),
        },
      });
    }
  }

  // Elegir marco dispara el clonado sin acción manual (MD-80, criterio de aceptación del sprint).
  private async cloneContractedFrameworks(
    tx: TransactionClient,
    tenantId: string,
    serviceId: string,
  ): Promise<void> {
    const [frameworks, criteria] = await Promise.all([
      tx.serviceFramework.findMany({ where: { serviceId, status: 'active' } }),
      tx.serviceTrustCriterion.findMany({ where: { serviceId }, select: { trustCriterionId: true } }),
    ]);
    for (const f of frameworks) {
      await this.cloner.cloneFramework(tx, {
        tenantId,
        serviceId,
        frameworkId: f.frameworkId,
        trustCriterionIds: criteria.map((c) => c.trustCriterionId),
        evaluationPeriod: f.evaluationPeriod,
      });
    }
  }

  // --- lectura ---------------------------------------------------------------------------------

  private async read(tx: TransactionClient, id: string): Promise<ServiceDetail> {
    const detail = await this.readOrNull(tx, id);
    if (!detail) throw new DomainError('NOT_FOUND');
    return detail;
  }

  private async readOrNull(tx: TransactionClient, id: string): Promise<ServiceDetail | null> {
    const row = await tx.service.findUnique({
      where: { id },
      include: {
        trustCriteria: { include: { trustCriterion: true } },
        regulations: { include: { regulation: true } },
        frameworks: { include: { framework: true, catalogVersion: true } },
        subserviceOrganizations: true,
        systemDescription: true,
        scope: { select: { id: true } },
      },
    });
    if (!row) return null;

    const criterionIds = row.trustCriteria.map((c) => c.trustCriterionId);
    const activeFrameworkIds = row.frameworks.filter((f) => f.status === 'active').map((f) => f.frameworkId);
    const [applicableRequirements, clonedControls] = await Promise.all([
      tx.requirement.count({
        where: { frameworkId: { in: activeFrameworkIds }, trustCriterionId: { in: criterionIds } },
      }),
      tx.clientControl.count({ where: { serviceId: id, isActive: true } }),
    ]);

    const data: ServiceData = {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      description: row.description,
      scopeStatement: row.scopeStatement,
      type: row.type,
      industriesServed: row.industriesServed,
      activeClientCount: row.activeClientCount,
      countries: row.countries,
      dataTypes: row.dataTypes,
      // Orden estable: el de los 5 criterios del contrato, no el de inserción.
      trustCriteria: row.trustCriteria
        .map((c) => c.trustCriterion.criterion)
        .sort((a, b) => a.localeCompare(b)),
      subserviceOrganizations: row.subserviceOrganizations.map((s) => ({
        id: s.id,
        type: s.type,
        provider: s.provider,
        serviceProvided: s.serviceProvided,
        responsibility: s.responsibility,
      })),
      frameworks: row.frameworks
        .map((f) => ({
          code: f.framework.code,
          name: f.framework.name,
          contractedAt: f.contractedAt.toISOString().slice(0, 10),
          status: f.status,
          catalogVersion: f.catalogVersion.number,
          evaluationPeriod: f.evaluationPeriod,
        }))
        .sort((a, b) => a.code.localeCompare(b.code)),
      regulations: row.regulations
        .map((r) => ({
          code: r.regulation.code,
          name: r.regulation.name,
          jurisdiction: r.regulation.jurisdiction,
        }))
        .sort((a, b) => a.code.localeCompare(b.code)),
      previousCertification: row.previousCertification,
      expectedAvailability: fromDbAvailability(row.expectedAvailability),
      systemDescription: row.systemDescription
        ? {
            id: row.systemDescription.id,
            kind: /^https?:\/\//i.test(row.systemDescription.filePath) ? 'link' : 'file',
            url: row.systemDescription.filePath,
            sections: Array.isArray(row.systemDescription.sections) ? row.systemDescription.sections : [],
          }
        : null,
      catalog: { status: 'ready', applicableRequirements, clonedControls },
      deploymentScenario: row.deploymentScenario,
      hasScope: row.scope !== null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return new ServiceDetail(data);
  }
}
