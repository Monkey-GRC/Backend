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

export abstract class CompanyRepository {
  abstract existsActiveWithName(scope: TenantScope, name: string): Promise<boolean>;

  abstract existsWithAdminEmail(scope: TenantScope, adminEmail: string): Promise<boolean>;

  // catalog.frameworks: lectura libre. Devuelve cuáles de estos códigos existen en el catálogo.
  abstract existingFrameworkCodes(codes: string[]): Promise<string[]>;

  // De esos códigos, los que ya tienen catálogo y se pueden contratar (`available`, D50).
  abstract availableFrameworkCodes(codes: string[]): Promise<string[]>;

  // Empresa, clave y marcos contratados en la misma transacción: nunca queda una empresa sin forma
  // de entrar ni sin su contrato.
  abstract createWithAccessKey(
    scope: TenantScope,
    company: NewCompany,
    accessKey: NewAccessKey,
  ): Promise<{ company: Company; accessKey: AccessKey; frameworks: ContractedFramework[] }>;

  abstract list(scope: TenantScope, query: CompanyListQuery): Promise<Page<CompanyOverview>>;

  abstract findById(
    scope: TenantScope,
    companyId: string,
    excludeCompanyId: string,
  ): Promise<CompanyDetail | null>;
}
