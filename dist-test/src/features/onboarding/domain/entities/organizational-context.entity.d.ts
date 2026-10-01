import { BusinessModel, ClientCountry, ComplianceMaturity, IncorporationCountry, Industry, Size, YearsInOperation } from '../../../../common/catalogs/onboarding-catalogs';
export type RegulationRef = {
    code: string;
    name: string;
    jurisdiction: string;
};
export declare class OrganizationalContext {
    readonly id: string | null;
    readonly name: string;
    readonly description: string | null;
    readonly size: Size | null;
    readonly industry: Industry | null;
    readonly businessModel: BusinessModel | null;
    readonly yearsInOperation: YearsInOperation | null;
    readonly incorporationCountries: IncorporationCountry[];
    readonly clientCountries: ClientCountry[];
    readonly complianceMaturity: ComplianceMaturity | null;
    readonly regulations: RegulationRef[];
    constructor(id: string | null, name: string, description: string | null, size: Size | null, industry: Industry | null, businessModel: BusinessModel | null, yearsInOperation: YearsInOperation | null, incorporationCountries: IncorporationCountry[], clientCountries: ClientCountry[], complianceMaturity: ComplianceMaturity | null, regulations: RegulationRef[]);
    static empty(name: string): OrganizationalContext;
    get exists(): boolean;
    get completion(): {
        required_total: number;
        required_filled: number;
        optional_total: number;
        optional_filled: number;
    };
    get isComplete(): boolean;
    snapshot(): Record<string, unknown>;
}
export type OrganizationalContextInput = {
    description: string;
    size: Size;
    industry: Industry;
    businessModel: BusinessModel;
    yearsInOperation: YearsInOperation | null;
    incorporationCountries: IncorporationCountry[];
    clientCountries: ClientCountry[];
    complianceMaturity: ComplianceMaturity;
    regulationCodes: string[];
};
