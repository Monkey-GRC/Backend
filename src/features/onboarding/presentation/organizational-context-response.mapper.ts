import { translateOr } from '../../../common/text/translate-or';
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
    // «Ninguna» y «Otra» no son leyes: su nombre sale de i18n (como en `GET /v1/catalogs/regulations`); el resto usa su nombre propio.
    regulations: ctx.regulations.map((r) => (r.code === 'none' || r.code === 'other' ? { ...r, name: translateOr(`catalogs.regulation.${r.code}`, r.name) } : r)),
    completion: ctx.completion,
    is_complete: ctx.isComplete,
  };
}
