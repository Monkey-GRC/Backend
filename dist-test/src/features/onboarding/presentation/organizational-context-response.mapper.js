"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toOrganizationalContextResponse = toOrganizationalContextResponse;
function toOrganizationalContextResponse(ctx) {
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
//# sourceMappingURL=organizational-context-response.mapper.js.map