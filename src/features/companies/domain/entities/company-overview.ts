import { AccessKey } from './access-key.entity';
import { Company } from './company.entity';

// Un marco contratado para la empresa (D43).
export type ContractedFramework = {
  code: string;
  name: string;
  contractedAt: string; // YYYY-MM-DD
};

// Lo que Monkey Admin ve de cada empresa: la empresa, su clave vigente, los marcos que tiene
// contratados y si el cliente ya declaró su organización (contracts/modules/monkey-admin.md,
// campos derivados del listado).
export type CompanyOverview = {
  company: Company;
  currentAccessKey: AccessKey | null;
  frameworks: ContractedFramework[];
  onboardingCompleted: boolean;
};

export type CompanyDetail = CompanyOverview & {
  accessKeys: AccessKey[];
};
