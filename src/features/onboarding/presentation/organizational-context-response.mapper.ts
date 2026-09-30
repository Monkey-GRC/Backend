import { OrganizationalContext } from '../domain/entities/organizational-context.entity';

// Forma de contracts/modules/onboarding-organizational-context.md, en snake_case.
// Asimetría deliberada: el request manda `regulation_codes`; el response devuelve `regulations`
// con su nombre y jurisdicción, para que el frontend no tenga que resolverlos por su cuenta.
export function toOrganizationalContextResponse(ctx: OrganizationalContext) {
  return {
    id: ctx.id,
    name: ctx.name,
    description: ctx.description,
    size: ctx.size,
    industry: ctx.industry,
    business_model: ctx.businessModel,
    years_in_operation: ctx.yearsInOperation,
    incorporation_countries: ctx.incorporationCountries,
    client_countries: ctx.clientCountries,
    compliance_maturity: ctx.complianceMaturity,
    regulations: ctx.regulations,
    completion: ctx.completion,
    is_complete: ctx.isComplete,
  };
}
