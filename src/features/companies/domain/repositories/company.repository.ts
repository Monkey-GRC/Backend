import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page, PageRequest } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { AccessKey } from '../entities/access-key.entity';
import { CompanyDetail, CompanyOverview, ContractedFramework } from '../entities/company-overview';
import { Company, CompanyStatus, IsolationStrategy } from '../entities/company.entity';

export type NewCompany = {
  name: string;
  adminEmail: string;
  isolationStrategy: IsolationStrategy;
  // Marcos que se contratan al registrar la empresa (D47). Ya validados contra el catálogo.
  frameworkCodes: string[];
};

export type NewAccessKey = {
  codeHash: string;
  expiresAt: Date;
  createdBy: string;
};

export type CompanySort = 'created_at' | '-created_at' | 'name' | '-name';

export type CompanyListQuery = PageRequest & {
  sort: CompanySort;
  status?: CompanyStatus;
  // La empresa interna de Monkey (la del admin que consulta) no es un cliente: no se lista.
  excludeCompanyId: string;
};

export type RegisteredCompany = { company: Company; accessKey: AccessKey; frameworks: ContractedFramework[] };

// `revokedKeys`: cuántas claves pendientes se anularon al emitir la nueva.
export type RotatedAccessKey = { company: Company; accessKey: AccessKey; revokedKeys: number };

export type ArchiveData = {
  reasonCode: 'non_payment' | 'client_request' | 'other';
  reason: string;
  archiveUntil: Date;
  snapshotKey: string;
  at: Date;
  by: string;
};

// Una empresa archivada que ya debe borrarse (o que está por vencer, para el listado de Monkey Admin).
export type ArchivedCompany = { id: string; name: string; archiveUntil: Date; reasonCode: string | null; snapshotKey: string | null };

export abstract class CompanyRepository {
  abstract existsActiveWithName(scope: TenantScope, name: string): Promise<boolean>;

  abstract existsWithAdminEmail(scope: TenantScope, adminEmail: string): Promise<boolean>;

  // catalog.frameworks: lectura libre. Devuelve cuáles de estos códigos existen en el catálogo.
  abstract existingFrameworkCodes(codes: string[]): Promise<string[]>;

  // De esos códigos, los que ya tienen catálogo y se pueden contratar (`available`, D50).
  abstract availableFrameworkCodes(codes: string[]): Promise<string[]>;

  // Empresa, clave y marcos contratados en la misma transacción: nunca queda una empresa sin forma
  // de entrar ni sin su contrato.
  // `audit` se escribe en esa misma transacción: sin rastro no hay empresa (SEG-36).
  abstract createWithAccessKey(
    scope: TenantScope,
    company: NewCompany,
    accessKey: NewAccessKey,
    audit: AuditIntent<RegisteredCompany>,
  ): Promise<RegisteredCompany>;

  // D99 · Reenviar la clave: anula la pendiente y emite otra, en una transacción con su rastro (`access_key.regenerate`).
  // Lanza `NOT_FOUND` (no existe o es la interna de Monkey), `COMPANY_ALREADY_DEACTIVATED` (archivada) o `ACCESS_KEY_NOT_PENDING` (ya la canjeó).
  abstract rotateAccessKey(
    scope: TenantScope,
    companyId: string,
    excludeCompanyId: string,
    accessKey: NewAccessKey,
    audit: AuditIntent<RotatedAccessKey>,
  ): Promise<RotatedAccessKey>;

  abstract list(scope: TenantScope, query: CompanyListQuery): Promise<Page<CompanyOverview>>;

  abstract findById(
    scope: TenantScope,
    companyId: string,
    excludeCompanyId: string,
  ): Promise<CompanyDetail | null>;

  // D97 · Archivar: el estado, el corte de sesiones, la cancelación de lo que estaba en cola y el rastro, en una sola transacción.
  // Devuelve cuántas sesiones se cerraron. Si otra petición la archivó entre la verificación y este cambio, lanza `COMPANY_ALREADY_DEACTIVATED`.
  abstract archive(scope: TenantScope, companyId: string, data: ArchiveData, audit: AuditIntent<{ sessionsClosed: number }>): Promise<number>;

  // D97 · La copia de todo lo de la empresa (`platform.export_company`), antes de archivarla.
  abstract exportSnapshot(scope: TenantScope, companyId: string): Promise<unknown>;

  // D97 · Reactivar: vuelve a `active` y el plazo desaparece. Devuelve la llave de la copia que ya no hace falta (para borrarla).
  // Lanza `COMPANY_NOT_DEACTIVATED` o `COMPANY_ARCHIVE_EXPIRED` si, entre la verificación y este cambio, la empresa dejó de estar archivada o venció su plazo.
  abstract reactivate(scope: TenantScope, companyId: string, audit: AuditIntent<{ snapshotKey: string | null }>): Promise<string | null>;

  // Las archivadas, de la que vence antes a la que vence después.
  abstract listArchived(scope: TenantScope, dueBefore?: Date): Promise<ArchivedCompany[]>;

  // D97 · Borrado definitivo (`platform.purge_company`) y su rastro mínimo, en una transacción. Devuelve el nombre de la empresa borrada.
  // Una empresa se borra una sola vez aunque haya varias réplicas corriendo la tarea: quien toma el candado de esa empresa ejecuta `cleanFiles` (sus archivos) y
  // después la base; quien no lo toma, o la encuentra ya borrada, recibe `null` y no hace nada.
  abstract purge(scope: TenantScope, companyId: string, cleanFiles: () => Promise<void>, audit: AuditIntent<{ name: string }>): Promise<string | null>;
}
