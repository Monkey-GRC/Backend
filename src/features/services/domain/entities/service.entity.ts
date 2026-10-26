import {
  ActiveClientCount,
  DataType,
  ExpectedAvailability,
  PreviousCertification,
  ServedIndustry,
  ServiceCountry,
  ServiceType,
  SubserviceType,
  TrustCriterionValue,
} from '../../../../common/catalogs/service-catalogs';

export type SubserviceInput = {
  type: SubserviceType;
  provider: string | null;
  serviceProvided: string | null;
  responsibility: string | null;
};

// La Descripción del Sistema se entrega con un enlace, con un archivo ya guardado en el almacenamiento, o con
// las dos cosas (D51). Cada campo es un cambio: `undefined` no toca lo que había. `fileKey` es la llave del
// objeto; la arma la aplicación, nunca el cliente.
export type SystemDescriptionInput = { linkUrl?: string; fileKey?: string };

// Una llave de archivo termina en el nombre original: `.../<uuid>/<nombre>` (ver system-description-file.ts).
export const fileNameOfKey = (key: string): string => key.slice(key.lastIndexOf('/') + 1);

// Los 15 campos del request de POST /v1/services (16 del Excel: el subservicio colapsa en un array).
export type ServiceInput = {
  name: string;
  description: string;
  scopeStatement: string;
  type: ServiceType;
  industriesServed: ServedIndustry[];
  activeClientCount: ActiveClientCount | null;
  countries: ServiceCountry[];
  dataTypes: DataType[];
  trustCriteria: TrustCriterionValue[];
  subserviceOrganizations: SubserviceInput[];
  frameworkCodes: string[];
  previousCertification: PreviousCertification | null;
  expectedAvailability: ExpectedAvailability;
  // Opcional al crear: con archivo, el servicio se crea primero y el archivo se sube después (D51).
  systemDescription: SystemDescriptionInput | null;
};

// PATCH: solo las claves presentes.
export type ServicePatch = Partial<ServiceInput>;

export type ServiceFrameworkRef = {
  code: string;
  name: string;
  contractedAt: string; // YYYY-MM-DD
  status: string;
  catalogVersion: number;
  evaluationPeriod: string;
};

export type SubserviceView = SubserviceInput & { id: string };

export type SystemDescriptionView = {
  id: string;
  // Pueden venir las dos, o solo una. Un archivo no expone su llave: se descarga con un enlace temporal.
  url: string | null;
  fileName: string | null;
  // Interno (nunca sale en el response): la llave del objeto para descargarlo o reemplazarlo.
  storageKey: string | null;
  sections: unknown[];
};

export type CatalogSummary = {
  // El clonado corre dentro de la misma transacción que la creación: al responder ya está listo.
  status: 'ready';
  applicableRequirements: number;
  clonedControls: number;
};

export type ServiceData = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  scopeStatement: string;
  type: ServiceType;
  industriesServed: ServedIndustry[];
  activeClientCount: ActiveClientCount | null;
  countries: ServiceCountry[];
  dataTypes: DataType[];
  trustCriteria: TrustCriterionValue[];
  subserviceOrganizations: SubserviceView[];
  frameworks: ServiceFrameworkRef[];
  previousCertification: PreviousCertification | null;
  expectedAvailability: ExpectedAvailability;
  systemDescription: SystemDescriptionView | null;
  catalog: CatalogSummary;
  // Componente 3 (control técnico): solo lo que la lista necesita para decir si ya se hizo.
  // Cuántas conexiones (activos) tiene registradas este servicio.
  connectionCount: number;
  createdAt: Date;
  updatedAt: Date;
};

// Lo que el cliente declara de UN servicio (modelo-datos.md §6.2, Componente 2).
export class ServiceDetail {
  constructor(public readonly data: ServiceData) {}

  get id(): string {
    return this.data.id;
  }

  // Cuenta campos de formulario, no cumplimiento: nunca se presenta como readiness (philosophy.md).
  // 12 obligatorios y 3 opcionales (el "detalle" del subservicio, el número de clientes y la
  // certificación previa). La regulación ya no se declara por servicio sino por empresa (D51).
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
      !!d.expectedAvailability,
      !!d.systemDescription,
    ].filter(Boolean).length;
    const hasDetail = d.subserviceOrganizations.some(
      (s) => s.provider || s.serviceProvided || s.responsibility,
    );
    return {
      required_total: 12,
      required_filled: requiredFilled,
      optional_total: 3,
      optional_filled: [!!d.activeClientCount, !!d.previousCertification, hasDetail].filter(Boolean).length,
    };
  }

  get isComplete(): boolean {
    return this.completion.required_filled === this.completion.required_total;
  }

  // El paso 3 está hecho cuando el servicio tiene al menos una conexión (D92). Ya no hay escenario de despliegue que declarar.
  get technicalControlDone(): boolean {
    return this.data.connectionCount > 0;
  }

  // Forma para el audit trail (estado antes/después, CC9.2).
  snapshot(): Record<string, unknown> {
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
      previous_certification: d.previousCertification,
      expected_availability: d.expectedAvailability,
      system_description: d.systemDescription
        ? { url: d.systemDescription.url, file_name: d.systemDescription.fileName }
        : null,
    };
  }
}
