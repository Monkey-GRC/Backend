"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toServiceResponse = toServiceResponse;
exports.toServiceListItem = toServiceListItem;
function toServiceResponse(service, catalogMessage = 'catalog.cloned') {
    const d = service.data;
    return {
        id: d.id,
        organization_id: d.organizationId,
        name: d.name,
        description: d.description,
        scope_statement: d.scopeStatement,
        type: d.type,
        industries_served: d.industriesServed,
        active_client_count: d.activeClientCount,
        countries: d.countries,
        data_types: d.dataTypes,
        trust_criteria: d.trustCriteria,
        frameworks: d.frameworks.map((f) => ({
            code: f.code,
            name: f.name,
            contracted_at: f.contractedAt,
            status: f.status,
            catalog_version: f.catalogVersion,
            evaluation_period: f.evaluationPeriod,
        })),
        regulations: d.regulations,
        subservice_organizations: d.subserviceOrganizations.map((s) => ({
            id: s.id,
            type: s.type,
            provider: s.provider,
            service_provided: s.serviceProvided,
            responsibility: s.responsibility,
        })),
        previous_certification: d.previousCertification,
        expected_availability: d.expectedAvailability,
        system_description: d.systemDescription,
        catalog: {
            status: d.catalog.status,
            applicable_requirements: d.catalog.applicableRequirements,
            cloned_controls: d.catalog.clonedControls,
            message: catalogMessage,
        },
        completion: service.completion,
        is_complete: service.isComplete,
        technical_control: toTechnicalControlSummary(service),
        created_at: d.createdAt.toISOString(),
        updated_at: d.updatedAt.toISOString(),
    };
}
function toTechnicalControlSummary(service) {
    return {
        deployment_scenario: service.data.deploymentScenario,
        has_scope: service.data.hasScope,
        is_complete: service.technicalControlDone,
    };
}
function toServiceListItem(service) {
    const d = service.data;
    return {
        id: d.id,
        name: d.name,
        type: d.type,
        is_complete: service.isComplete,
        frameworks: d.frameworks.map((f) => ({ code: f.code, status: f.status })),
        catalog: { status: d.catalog.status, cloned_controls: d.catalog.clonedControls },
        technical_control: toTechnicalControlSummary(service),
        created_at: d.createdAt.toISOString(),
    };
}
//# sourceMappingURL=service-response.mapper.js.map