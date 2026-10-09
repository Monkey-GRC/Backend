import { ServiceDetail } from '../domain/entities/service.entity';

// Forma de contracts/modules/onboarding-service-context.md, en snake_case. Además de lo que
// muestra el ejemplo del 201, trae todos los campos declarados: la pantalla de edición los necesita.
export function toServiceResponse(service: ServiceDetail, catalogMessage = 'catalog.cloned') {
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
    subservice_organizations: d.subserviceOrganizations.map((s) => ({
      id: s.id,
      type: s.type,
      provider: s.provider,
      service_provided: s.serviceProvided,
      responsibility: s.responsibility,
    })),
    previous_certification: d.previousCertification,
    expected_availability: d.expectedAvailability,
    // La llave del objeto no sale: un archivo se baja con GET .../system-description/file.
    // Enlace y/o archivo (D51): pueden venir los dos.
    system_description: d.systemDescription && {
      id: d.systemDescription.id,
      url: d.systemDescription.url,
      file_name: d.systemDescription.fileName,
      sections: d.systemDescription.sections,
    },
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

// Lo mínimo del Componente 3 para decidir qué mostrar; el detalle vive en
// GET /v1/services/{id}/technical-control.
function toTechnicalControlSummary(service: ServiceDetail) {
  return {
    deployment_scenario: service.data.deploymentScenario,
    connection_count: service.data.connectionCount,
    is_complete: service.technicalControlDone,
  };
}

// Cada elemento de GET /v1/services: id, name, type, is_complete, frameworks[].code y catalog.status.
export function toServiceListItem(service: ServiceDetail) {
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
