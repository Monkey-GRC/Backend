"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceDetail = void 0;
class ServiceDetail {
    data;
    constructor(data) {
        this.data = data;
    }
    get id() {
        return this.data.id;
    }
    get completion() {
        const d = this.data;
        const requiredFilled = [
            !!d.name,
            !!d.description,
            !!d.scopeStatement,
            !!d.type,
            d.industriesServed.length > 0,
            d.countries.length > 0,
            d.dataTypes.length > 0,
            d.trustCriteria.length > 0,
            d.subserviceOrganizations.length > 0,
            d.frameworks.length > 0,
            d.regulations.length > 0,
            !!d.expectedAvailability,
            !!d.systemDescription,
        ].filter(Boolean).length;
        const hasDetail = d.subserviceOrganizations.some((s) => s.provider || s.serviceProvided || s.responsibility);
        return {
            required_total: 13,
            required_filled: requiredFilled,
            optional_total: 3,
            optional_filled: [!!d.activeClientCount, !!d.previousCertification, hasDetail].filter(Boolean).length,
        };
    }
    get isComplete() {
        return this.completion.required_filled === this.completion.required_total;
    }
    get technicalControlDone() {
        return this.data.deploymentScenario !== null && this.data.hasScope;
    }
    snapshot() {
        const d = this.data;
        return {
            id: d.id,
            name: d.name,
            description: d.description,
            scope_statement: d.scopeStatement,
            type: d.type,
            industries_served: d.industriesServed,
            active_client_count: d.activeClientCount,
            countries: d.countries,
            data_types: d.dataTypes,
            trust_criteria: d.trustCriteria,
            subservice_organizations: d.subserviceOrganizations.map((s) => ({
                type: s.type,
                provider: s.provider,
                service_provided: s.serviceProvided,
                responsibility: s.responsibility,
            })),
            framework_codes: d.frameworks.map((f) => `${f.code}:${f.status}`),
            regulation_codes: d.regulations.map((r) => r.code),
            previous_certification: d.previousCertification,
            expected_availability: d.expectedAvailability,
            system_description: d.systemDescription?.url ?? null,
        };
    }
}
exports.ServiceDetail = ServiceDetail;
//# sourceMappingURL=service.entity.js.map