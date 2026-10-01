export declare const AuditResult: {
    readonly success: "success";
    readonly error: "error";
};
export type AuditResult = (typeof AuditResult)[keyof typeof AuditResult];
export declare const Dimension: {
    readonly policy: "policy";
    readonly server: "server";
    readonly database: "database";
    readonly app: "app";
    readonly cloud: "cloud";
};
export type Dimension = (typeof Dimension)[keyof typeof Dimension];
export declare const ControlDimensionType: {
    readonly manual: "manual";
    readonly automated: "automated";
    readonly hybrid: "hybrid";
    readonly technical_manual: "technical_manual";
};
export type ControlDimensionType = (typeof ControlDimensionType)[keyof typeof ControlDimensionType];
export declare const PolicyApprovalStatus: {
    readonly draft: "draft";
    readonly pending_approval: "pending_approval";
    readonly approved: "approved";
};
export type PolicyApprovalStatus = (typeof PolicyApprovalStatus)[keyof typeof PolicyApprovalStatus];
export declare const TrustCriterionCode: {
    readonly security: "security";
    readonly availability: "availability";
    readonly confidentiality: "confidentiality";
    readonly integrity: "integrity";
    readonly privacy: "privacy";
};
export type TrustCriterionCode = (typeof TrustCriterionCode)[keyof typeof TrustCriterionCode];
export declare const FrameworkType: {
    readonly attestation: "attestation";
    readonly certification: "certification";
    readonly standard: "standard";
    readonly regulation: "regulation";
};
export type FrameworkType = (typeof FrameworkType)[keyof typeof FrameworkType];
export declare const FailureCategory: {
    readonly human_resource: "human_resource";
    readonly processes: "processes";
    readonly information_technology: "information_technology";
    readonly infrastructure: "infrastructure";
    readonly external: "external";
    readonly governance: "governance";
};
export type FailureCategory = (typeof FailureCategory)[keyof typeof FailureCategory];
export declare const RiskCriterion: {
    readonly confidentiality: "confidentiality";
    readonly integrity: "integrity";
    readonly availability: "availability";
    readonly privacy: "privacy";
    readonly compliance: "compliance";
    readonly security: "security";
    readonly continuity: "continuity";
    readonly third_parties: "third_parties";
    readonly fraud: "fraud";
    readonly reputation: "reputation";
    readonly operations: "operations";
};
export type RiskCriterion = (typeof RiskCriterion)[keyof typeof RiskCriterion];
export declare const RiskLevel: {
    readonly low: "low";
    readonly moderate: "moderate";
    readonly high: "high";
    readonly critical: "critical";
};
export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];
export declare const TestPlanOrigin: {
    readonly predefined: "predefined";
    readonly custom: "custom";
};
export type TestPlanOrigin = (typeof TestPlanOrigin)[keyof typeof TestPlanOrigin];
export declare const CheckOrigin: {
    readonly cis_native: "cis_native";
    readonly monkey_policy: "monkey_policy";
    readonly auditor_criterion: "auditor_criterion";
};
export type CheckOrigin = (typeof CheckOrigin)[keyof typeof CheckOrigin];
export declare const MappingConfidence: {
    readonly confirmed: "confirmed";
    readonly high: "high";
    readonly medium: "medium";
    readonly low: "low";
};
export type MappingConfidence = (typeof MappingConfidence)[keyof typeof MappingConfidence];
export declare const IsolationStrategy: {
    readonly dedicated: "dedicated";
    readonly shared: "shared";
};
export type IsolationStrategy = (typeof IsolationStrategy)[keyof typeof IsolationStrategy];
export declare const CompanyStatus: {
    readonly active: "active";
    readonly suspended: "suspended";
};
export type CompanyStatus = (typeof CompanyStatus)[keyof typeof CompanyStatus];
export declare const AccessKeyStatus: {
    readonly pending: "pending";
    readonly used: "used";
    readonly expired: "expired";
    readonly revoked: "revoked";
};
export type AccessKeyStatus = (typeof AccessKeyStatus)[keyof typeof AccessKeyStatus];
export declare const UserRole: {
    readonly admin_monkey: "admin_monkey";
    readonly admin_empresa: "admin_empresa";
    readonly funcional: "funcional";
    readonly auditor: "auditor";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const UserStatus: {
    readonly active: "active";
    readonly inactive: "inactive";
    readonly suspended: "suspended";
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export declare const ApiKeyStatus: {
    readonly active: "active";
    readonly revoked: "revoked";
};
export type ApiKeyStatus = (typeof ApiKeyStatus)[keyof typeof ApiKeyStatus];
export declare const EvaluationResult: {
    readonly compliant: "compliant";
    readonly non_compliant: "non_compliant";
    readonly pending: "pending";
    readonly not_applicable: "not_applicable";
};
export type EvaluationResult = (typeof EvaluationResult)[keyof typeof EvaluationResult];
export declare const RawProbeResult: {
    readonly ok: "ok";
    readonly fail: "fail";
};
export type RawProbeResult = (typeof RawProbeResult)[keyof typeof RawProbeResult];
export declare const FindingStatus: {
    readonly open: "open";
    readonly remediated: "remediated";
    readonly excluded: "excluded";
};
export type FindingStatus = (typeof FindingStatus)[keyof typeof FindingStatus];
export declare const FindingOrigin: {
    readonly system: "system";
    readonly auditor: "auditor";
};
export type FindingOrigin = (typeof FindingOrigin)[keyof typeof FindingOrigin];
export declare const RiskTreatmentDecision: {
    readonly mitigate: "mitigate";
    readonly accept: "accept";
    readonly transfer: "transfer";
    readonly avoid: "avoid";
};
export type RiskTreatmentDecision = (typeof RiskTreatmentDecision)[keyof typeof RiskTreatmentDecision];
export declare const VulnerabilityStatus: {
    readonly active: "active";
    readonly solved: "solved";
    readonly mitigated: "mitigated";
};
export type VulnerabilityStatus = (typeof VulnerabilityStatus)[keyof typeof VulnerabilityStatus];
export declare const ActionPlanStatus: {
    readonly open: "open";
    readonly in_progress: "in_progress";
    readonly done: "done";
    readonly cancelled: "cancelled";
};
export type ActionPlanStatus = (typeof ActionPlanStatus)[keyof typeof ActionPlanStatus];
export declare const EvidenceValidationStatus: {
    readonly pending: "pending";
    readonly approved: "approved";
    readonly rejected: "rejected";
};
export type EvidenceValidationStatus = (typeof EvidenceValidationStatus)[keyof typeof EvidenceValidationStatus];
export declare const EvaluationOrigin: {
    readonly automated: "automated";
    readonly manual: "manual";
    readonly ai_assisted: "ai_assisted";
};
export type EvaluationOrigin = (typeof EvaluationOrigin)[keyof typeof EvaluationOrigin];
export declare const Severity: {
    readonly low: "low";
    readonly medium: "medium";
    readonly high: "high";
    readonly critical: "critical";
};
export type Severity = (typeof Severity)[keyof typeof Severity];
export declare const OrganizationSize: {
    readonly from_10_to_50: "from_10_to_50";
    readonly from_51_to_200: "from_51_to_200";
    readonly from_201_to_500: "from_201_to_500";
    readonly from_501_to_1000: "from_501_to_1000";
    readonly from_1001_to_2000: "from_1001_to_2000";
    readonly from_2001_to_5000: "from_2001_to_5000";
    readonly more_than_5000: "more_than_5000";
};
export type OrganizationSize = (typeof OrganizationSize)[keyof typeof OrganizationSize];
export declare const Industry: {
    readonly financial_banking: "financial_banking";
    readonly fintech: "fintech";
    readonly healthcare: "healthcare";
    readonly technology_saas: "technology_saas";
    readonly bpo_outsourcing: "bpo_outsourcing";
    readonly telecommunications: "telecommunications";
    readonly retail_ecommerce: "retail_ecommerce";
    readonly manufacturing: "manufacturing";
    readonly government: "government";
    readonly education: "education";
    readonly insurance: "insurance";
    readonly logistics: "logistics";
    readonly energy_utilities: "energy_utilities";
    readonly other: "other";
};
export type Industry = (typeof Industry)[keyof typeof Industry];
export declare const BusinessModel: {
    readonly bpo_kpo_ito: "bpo_kpo_ito";
    readonly call_contact_center: "call_contact_center";
    readonly data_center: "data_center";
    readonly ai_ml: "ai_ml";
    readonly service_desk: "service_desk";
    readonly saas_paas_iaas: "saas_paas_iaas";
    readonly fintech_payments: "fintech_payments";
    readonly banking: "banking";
    readonly insurance: "insurance";
    readonly marketplace_ecommerce: "marketplace_ecommerce";
    readonly software_factory: "software_factory";
    readonly consulting: "consulting";
    readonly telecommunications: "telecommunications";
    readonly logistics: "logistics";
    readonly healthcare: "healthcare";
    readonly edtech: "edtech";
    readonly manufacturing: "manufacturing";
    readonly government: "government";
    readonly other: "other";
};
export type BusinessModel = (typeof BusinessModel)[keyof typeof BusinessModel];
export declare const YearsInOperation: {
    readonly less_than_1: "less_than_1";
    readonly from_1_to_3: "from_1_to_3";
    readonly from_3_to_5: "from_3_to_5";
    readonly from_5_to_10: "from_5_to_10";
    readonly more_than_10: "more_than_10";
};
export type YearsInOperation = (typeof YearsInOperation)[keyof typeof YearsInOperation];
export declare const IncorporationCountry: {
    readonly co: "co";
    readonly mx: "mx";
    readonly pe: "pe";
    readonly cl: "cl";
    readonly ar: "ar";
    readonly br: "br";
    readonly ec: "ec";
    readonly pa: "pa";
    readonly cr: "cr";
    readonly us: "us";
    readonly es: "es";
    readonly other: "other";
};
export type IncorporationCountry = (typeof IncorporationCountry)[keyof typeof IncorporationCountry];
export declare const ClientCountry: {
    readonly co: "co";
    readonly mx: "mx";
    readonly pe: "pe";
    readonly cl: "cl";
    readonly ar: "ar";
    readonly br: "br";
    readonly ec: "ec";
    readonly pa: "pa";
    readonly cr: "cr";
    readonly us: "us";
    readonly es: "es";
    readonly eu: "eu";
    readonly other: "other";
};
export type ClientCountry = (typeof ClientCountry)[keyof typeof ClientCountry];
export declare const ComplianceMaturity: {
    readonly none: "none";
    readonly initial_ad_hoc: "initial_ad_hoc";
    readonly implementing: "implementing";
    readonly defined: "defined";
    readonly managed_certified: "managed_certified";
};
export type ComplianceMaturity = (typeof ComplianceMaturity)[keyof typeof ComplianceMaturity];
export declare const OrganizationResponsibleType: {
    readonly coo: "coo";
    readonly it: "it";
    readonly compliance: "compliance";
    readonly process: "process";
    readonly ciso: "ciso";
    readonly asset_owner: "asset_owner";
};
export type OrganizationResponsibleType = (typeof OrganizationResponsibleType)[keyof typeof OrganizationResponsibleType];
export declare const SubserviceProviderType: {
    readonly aws: "aws";
    readonly azure: "azure";
    readonly gcp: "gcp";
    readonly on_premise: "on_premise";
    readonly hybrid: "hybrid";
    readonly mobile: "mobile";
    readonly other: "other";
};
export type SubserviceProviderType = (typeof SubserviceProviderType)[keyof typeof SubserviceProviderType];
export declare const ServiceType: {
    readonly saas: "saas";
    readonly bpo: "bpo";
    readonly call_center: "call_center";
    readonly data_center: "data_center";
    readonly ai_services: "ai_services";
    readonly specialized_with_data_intervention: "specialized_with_data_intervention";
    readonly service_desk: "service_desk";
    readonly managed_services: "managed_services";
    readonly consulting: "consulting";
    readonly development: "development";
    readonly other: "other";
};
export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];
export declare const ServedIndustry: {
    readonly financial: "financial";
    readonly healthcare: "healthcare";
    readonly retail: "retail";
    readonly technology: "technology";
    readonly government: "government";
    readonly education: "education";
    readonly manufacturing: "manufacturing";
    readonly telecommunications: "telecommunications";
    readonly energy: "energy";
    readonly logistics: "logistics";
    readonly other: "other";
};
export type ServedIndustry = (typeof ServedIndustry)[keyof typeof ServedIndustry];
export declare const ActiveClientCount: {
    readonly from_1_to_10: "from_1_to_10";
    readonly from_11_to_50: "from_11_to_50";
    readonly from_51_to_200: "from_51_to_200";
    readonly from_201_to_1000: "from_201_to_1000";
    readonly more_than_1000: "more_than_1000";
};
export type ActiveClientCount = (typeof ActiveClientCount)[keyof typeof ActiveClientCount];
export declare const ServiceCountry: {
    readonly co: "co";
    readonly mx: "mx";
    readonly pe: "pe";
    readonly cl: "cl";
    readonly ar: "ar";
    readonly br: "br";
    readonly ec: "ec";
    readonly uy: "uy";
    readonly py: "py";
    readonly bo: "bo";
    readonly ve: "ve";
    readonly cr: "cr";
    readonly pa: "pa";
    readonly gt: "gt";
    readonly us: "us";
    readonly ca: "ca";
    readonly es: "es";
    readonly pt: "pt";
    readonly gb: "gb";
    readonly de: "de";
    readonly fr: "fr";
    readonly eu: "eu";
    readonly latam: "latam";
    readonly global: "global";
};
export type ServiceCountry = (typeof ServiceCountry)[keyof typeof ServiceCountry];
export declare const DataType: {
    readonly pii: "pii";
    readonly payment: "payment";
    readonly phi: "phi";
    readonly business: "business";
    readonly files: "files";
    readonly logs: "logs";
    readonly credentials: "credentials";
    readonly biometric: "biometric";
};
export type DataType = (typeof DataType)[keyof typeof DataType];
export declare const ExpectedAvailability: {
    readonly h24x7: "24x7";
    readonly business_hours: "business_hours";
    readonly on_demand: "on_demand";
    readonly not_applicable: "not_applicable";
};
export type ExpectedAvailability = (typeof ExpectedAvailability)[keyof typeof ExpectedAvailability];
export declare const DeploymentScenario: {
    readonly cloud_managed_only: "cloud_managed_only";
    readonly cloud_with_servers: "cloud_with_servers";
    readonly on_premise: "on_premise";
    readonly hybrid: "hybrid";
};
export type DeploymentScenario = (typeof DeploymentScenario)[keyof typeof DeploymentScenario];
export declare const PreviousCertification: {
    readonly soc2: "soc2";
    readonly soc1: "soc1";
    readonly iso27001: "iso27001";
    readonly none: "none";
};
export type PreviousCertification = (typeof PreviousCertification)[keyof typeof PreviousCertification];
export declare const AssetConnectionCategory: {
    readonly ac_01: "ac_01";
    readonly ac_02: "ac_02";
    readonly ac_03: "ac_03";
    readonly ac_04: "ac_04";
    readonly ac_05: "ac_05";
    readonly ac_06: "ac_06";
};
export type AssetConnectionCategory = (typeof AssetConnectionCategory)[keyof typeof AssetConnectionCategory];
export declare const AssetOperationalStatus: {
    readonly operational: "operational";
    readonly warning: "warning";
    readonly error: "error";
    readonly not_monitored: "not_monitored";
};
export type AssetOperationalStatus = (typeof AssetOperationalStatus)[keyof typeof AssetOperationalStatus];
export declare const ServiceFrameworkStatus: {
    readonly active: "active";
    readonly paused: "paused";
    readonly finished: "finished";
};
export type ServiceFrameworkStatus = (typeof ServiceFrameworkStatus)[keyof typeof ServiceFrameworkStatus];
export declare const AssetType: {
    readonly server: "server";
    readonly database: "database";
    readonly cloud_service: "cloud_service";
    readonly application: "application";
    readonly endpoint: "endpoint";
    readonly network_device: "network_device";
    readonly documentation: "documentation";
};
export type AssetType = (typeof AssetType)[keyof typeof AssetType];
export declare const AssetCriticality: {
    readonly low: "low";
    readonly medium: "medium";
    readonly high: "high";
    readonly critical: "critical";
};
export type AssetCriticality = (typeof AssetCriticality)[keyof typeof AssetCriticality];
export declare const AssetOrigin: {
    readonly declared: "declared";
    readonly discovered: "discovered";
};
export type AssetOrigin = (typeof AssetOrigin)[keyof typeof AssetOrigin];
export declare const AssetStatus: {
    readonly active: "active";
    readonly inactive: "inactive";
};
export type AssetStatus = (typeof AssetStatus)[keyof typeof AssetStatus];
export declare const ProvisioningStatus: {
    readonly pending: "pending";
    readonly validated: "validated";
    readonly active: "active";
    readonly scheduled: "scheduled";
    readonly failed: "failed";
};
export type ProvisioningStatus = (typeof ProvisioningStatus)[keyof typeof ProvisioningStatus];
export declare const ScheduleFrequency: {
    readonly continuous: "continuous";
    readonly every_6h: "every_6h";
    readonly every_24h: "every_24h";
};
export type ScheduleFrequency = (typeof ScheduleFrequency)[keyof typeof ScheduleFrequency];
export declare const ExecutionOrigin: {
    readonly scheduled: "scheduled";
    readonly manual: "manual";
};
export type ExecutionOrigin = (typeof ExecutionOrigin)[keyof typeof ExecutionOrigin];
export declare const CheckResultStatus: {
    readonly passed: "passed";
    readonly failed: "failed";
    readonly invalid: "invalid";
    readonly not_applicable: "not_applicable";
    readonly not_run: "not_run";
};
export type CheckResultStatus = (typeof CheckResultStatus)[keyof typeof CheckResultStatus];
export declare const ExecutionLogLevel: {
    readonly info: "info";
    readonly warn: "warn";
    readonly error: "error";
};
export type ExecutionLogLevel = (typeof ExecutionLogLevel)[keyof typeof ExecutionLogLevel];
export declare const ExecutionStatus: {
    readonly queued: "queued";
    readonly running: "running";
    readonly completed: "completed";
    readonly failed: "failed";
    readonly cancelled: "cancelled";
};
export type ExecutionStatus = (typeof ExecutionStatus)[keyof typeof ExecutionStatus];
