export type UpsertCompanyProfileInput = {
  business_type?: string;
  server_count?: number;
};

export abstract class CompanyProfileRepository {
  abstract get(): Promise<any | null>;
  abstract upsert(input: UpsertCompanyProfileInput): Promise<any>;
}
