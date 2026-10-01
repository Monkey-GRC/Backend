"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCapabilityResponse = toCapabilityResponse;
exports.toScopeResponse = toScopeResponse;
exports.toDeploymentScenarioResponse = toDeploymentScenarioResponse;
exports.toTechnicalControlResponse = toTechnicalControlResponse;
exports.toAssetResponse = toAssetResponse;
exports.toAssetListItem = toAssetListItem;
function toCapabilityResponse(c) {
    return {
        catalog_code: c.catalogCode,
        category: c.category,
        method: c.method,
        required_permissions: c.requiredPermissions,
        base_frequency: c.baseFrequency,
        supported_platforms: c.supportedPlatforms,
        generated_evidence: c.generatedEvidence,
    };
}
function toScopeResponse(scope) {
    return {
        id: scope.id,
        ...scope.counts,
        declared_total: scope.declaredTotal,
        connected_total: scope.connectedTotal,
        connected: scope.connected,
    };
}
function toDeploymentScenarioResponse(state) {
    return {
        deployment_scenario: state.deploymentScenario,
        applicable_capabilities: state.applicableCapabilities.map(toCapabilityResponse),
    };
}
function toTechnicalControlResponse(state, probeMode) {
    return {
        ...toDeploymentScenarioResponse(state),
        scope: state.scope ? toScopeResponse(state.scope) : null,
        is_complete: state.deploymentScenario !== null && state.scope !== null,
        probe_mode: probeMode,
    };
}
function toAssetResponse(a) {
    return {
        id: a.id,
        code: a.code,
        name: a.name,
        connection_category: a.connectionCategory,
        type: a.type,
        platform: a.platform,
        ip_address: a.ipAddress,
        location: a.location,
        criticality: a.criticality,
        tags: a.tags,
        origin: a.origin,
        status: a.status,
        operational_status: a.operationalStatus,
        technical_coverage: a.technicalCoverage,
        services: a.services,
        provisioning: {
            id: a.provisioning.id,
            automated_capability_code: a.provisioning.automatedCapabilityCode,
            connection_status: a.provisioning.connectionStatus,
            last_validated_at: a.provisioning.lastValidatedAt?.toISOString() ?? null,
            is_active: a.provisioning.isActive,
            schedule_frequency: a.provisioning.scheduleFrequency,
        },
    };
}
function toAssetListItem(a) {
    return {
        id: a.id,
        code: a.code,
        name: a.name,
        connection_category: a.connectionCategory,
        type: a.type,
        operational_status: a.operationalStatus,
        technical_coverage: a.technicalCoverage,
        services: a.services,
        provisioning: {
            connection_status: a.provisioning.connectionStatus,
            is_active: a.provisioning.isActive,
            schedule_frequency: a.provisioning.scheduleFrequency,
        },
    };
}
//# sourceMappingURL=technical-control-response.mapper.js.map