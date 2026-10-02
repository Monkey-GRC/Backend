import {
  BusinessModel,
  ClientCountry,
  ComplianceMaturity,
  IncorporationCountry,
  Industry,
  Size,
  YearsInOperation,
} from '../../../../common/catalogs/onboarding-catalogs';

export type RegulationRef = { code: string; name: string; jurisdiction: string };

// Lo que el cliente declara de su empresa, una vez (modelo-datos.md §6.1, Componente 1). Antes de
// guardarlo por primera vez existe "vacío": solo trae la razón social, que ya se fijó al registrar
// la empresa (D24) y llega bloqueada.
export class OrganizationalContext {
  constructor(
    public readonly id: string | null,
    public readonly name: string,
    public readonly description: string | null,
    public readonly size: Size | null,
    public readonly industry: Industry | null,
    public readonly businessModel: BusinessModel | null,
    public readonly yearsInOperation: YearsInOperation | null,
    public readonly incorporationCountries: IncorporationCountry[],
    public readonly clientCountries: ClientCountry[],
    public readonly complianceMaturity: ComplianceMaturity | null,
    public readonly regulations: RegulationRef[],
  ) {}

  static empty(name: string): OrganizationalContext {
    return new OrganizationalContext(null, name, null, null, null, null, null, [], [], null, []);
  }

  get exists(): boolean {
    return this.id !== null;
  }

  // Cuenta campos de formulario, no cumplimiento: nunca se presenta como readiness (philosophy.md).
  // `name` cuenta como obligatorio ya llenado; `years_in_operation` es el único opcional.
  get completion() {
    const requiredFilled = [
      true,
      !!this.description,
      !!this.size,
      !!this.industry,
      !!this.businessModel,
      this.incorporationCountries.length > 0,
      this.clientCountries.length > 0,
      !!this.complianceMaturity,
      this.regulations.length > 0,
    ].filter(Boolean).length;
    return {
      required_total: 9,
      required_filled: requiredFilled,
      optional_total: 1,
      optional_filled: this.yearsInOperation ? 1 : 0,
    };
  }

  get isComplete(): boolean {
    return this.completion.required_filled === this.completion.required_total;
  }

  // Forma para el audit trail (estado antes/después, CC9.2).
  snapshot(): Record<string, unknown> {
    return {
      id: this.id,
      description: this.description,
      size: this.size,
      industry: this.industry,
      business_model: this.businessModel,
      years_in_operation: this.yearsInOperation,
      incorporation_countries: this.incorporationCountries,
      client_countries: this.clientCountries,
      compliance_maturity: this.complianceMaturity,
      regulation_codes: this.regulations.map((r) => r.code),
    };
  }
}

// El formulario completo que se guarda con PUT (el guardado parcial se decidió aplazar, D36).
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
