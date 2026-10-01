"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetCriticality = exports.AssetType = exports.ServiceFrameworkStatus = exports.AssetOperationalStatus = exports.AssetConnectionCategory = exports.PreviousCertification = exports.DeploymentScenario = exports.ExpectedAvailability = exports.DataType = exports.ServiceCountry = exports.ActiveClientCount = exports.ServedIndustry = exports.ServiceType = exports.SubserviceProviderType = exports.OrganizationResponsibleType = exports.ComplianceMaturity = exports.ClientCountry = exports.IncorporationCountry = exports.YearsInOperation = exports.BusinessModel = exports.Industry = exports.OrganizationSize = exports.Severity = exports.EvaluationOrigin = exports.EvidenceValidationStatus = exports.ActionPlanStatus = exports.VulnerabilityStatus = exports.RiskTreatmentDecision = exports.FindingOrigin = exports.FindingStatus = exports.RawProbeResult = exports.EvaluationResult = exports.ApiKeyStatus = exports.UserStatus = exports.UserRole = exports.AccessKeyStatus = exports.CompanyStatus = exports.IsolationStrategy = exports.MappingConfidence = exports.CheckOrigin = exports.TestPlanOrigin = exports.RiskLevel = exports.RiskCriterion = exports.FailureCategory = exports.FrameworkType = exports.TrustCriterionCode = exports.PolicyApprovalStatus = exports.ControlDimensionType = exports.Dimension = exports.AuditResult = void 0;
exports.ExecutionStatus = exports.ExecutionLogLevel = exports.CheckResultStatus = exports.ExecutionOrigin = exports.ScheduleFrequency = exports.ProvisioningStatus = exports.AssetStatus = exports.AssetOrigin = void 0;
exports.AuditResult = {
    success: 'success',
    error: 'error'
};
exports.Dimension = {
    policy: 'policy',
    server: 'server',
    database: 'database',
    app: 'app',
    cloud: 'cloud'
};
exports.ControlDimensionType = {
    manual: 'manual',
    automated: 'automated',
    hybrid: 'hybrid',
    technical_manual: 'technical_manual'
};
exports.PolicyApprovalStatus = {
    draft: 'draft',
    pending_approval: 'pending_approval',
    approved: 'approved'
};
exports.TrustCriterionCode = {
    security: 'security',
    availability: 'availability',
    confidentiality: 'confidentiality',
    integrity: 'integrity',
    privacy: 'privacy'
};
exports.FrameworkType = {
    attestation: 'attestation',
    certification: 'certification',
    standard: 'standard',
    regulation: 'regulation'
};
exports.FailureCategory = {
    human_resource: 'human_resource',
    processes: 'processes',
    information_technology: 'information_technology',
    infrastructure: 'infrastructure',
    external: 'external',
    governance: 'governance'
};
exports.RiskCriterion = {
    confidentiality: 'confidentiality',
    integrity: 'integrity',
    availability: 'availability',
    privacy: 'privacy',
    compliance: 'compliance',
    security: 'security',
    continuity: 'continuity',
    third_parties: 'third_parties',
    fraud: 'fraud',
    reputation: 'reputation',
    operations: 'operations'
};
exports.RiskLevel = {
    low: 'low',
    moderate: 'moderate',
    high: 'high',
    critical: 'critical'
};
exports.TestPlanOrigin = {
    predefined: 'predefined',
    custom: 'custom'
};
exports.CheckOrigin = {
    cis_native: 'cis_native',
    monkey_policy: 'monkey_policy',
    auditor_criterion: 'auditor_criterion'
};
exports.MappingConfidence = {
    confirmed: 'confirmed',
    high: 'high',
    medium: 'medium',
    low: 'low'
};
exports.IsolationStrategy = {
    dedicated: 'dedicated',
    shared: 'shared'
};
exports.CompanyStatus = {
    active: 'active',
    suspended: 'suspended'
};
exports.AccessKeyStatus = {
    pending: 'pending',
    used: 'used',
    expired: 'expired',
    revoked: 'revoked'
};
exports.UserRole = {
    admin_monkey: 'admin_monkey',
    admin_empresa: 'admin_empresa',
    funcional: 'funcional',
    auditor: 'auditor'
};
exports.UserStatus = {
    active: 'active',
    inactive: 'inactive',
    suspended: 'suspended'
};
exports.ApiKeyStatus = {
    active: 'active',
    revoked: 'revoked'
};
exports.EvaluationResult = {
    compliant: 'compliant',
    non_compliant: 'non_compliant',
    pending: 'pending',
    not_applicable: 'not_applicable'
};
exports.RawProbeResult = {
    ok: 'ok',
    fail: 'fail'
};
exports.FindingStatus = {
    open: 'open',
    remediated: 'remediated',
    excluded: 'excluded'
};
exports.FindingOrigin = {
    system: 'system',
    auditor: 'auditor'
};
exports.RiskTreatmentDecision = {
    mitigate: 'mitigate',
    accept: 'accept',
    transfer: 'transfer',
    avoid: 'avoid'
};
exports.VulnerabilityStatus = {
    active: 'active',
    solved: 'solved',
    mitigated: 'mitigated'
};
exports.ActionPlanStatus = {
    open: 'open',
    in_progress: 'in_progress',
    done: 'done',
    cancelled: 'cancelled'
};
exports.EvidenceValidationStatus = {
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected'
};
exports.EvaluationOrigin = {
    automated: 'automated',
    manual: 'manual',
    ai_assisted: 'ai_assisted'
};
exports.Severity = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'critical'
};
exports.OrganizationSize = {
    from_10_to_50: 'from_10_to_50',
    from_51_to_200: 'from_51_to_200',
    from_201_to_500: 'from_201_to_500',
    from_501_to_1000: 'from_501_to_1000',
    from_1001_to_2000: 'from_1001_to_2000',
    from_2001_to_5000: 'from_2001_to_5000',
    more_than_5000: 'more_than_5000'
};
exports.Industry = {
    financial_banking: 'financial_banking',
    fintech: 'fintech',
    healthcare: 'healthcare',
    technology_saas: 'technology_saas',
    bpo_outsourcing: 'bpo_outsourcing',
    telecommunications: 'telecommunications',
    retail_ecommerce: 'retail_ecommerce',
    manufacturing: 'manufacturing',
    government: 'government',
    education: 'education',
    insurance: 'insurance',
    logistics: 'logistics',
    energy_utilities: 'energy_utilities',
    other: 'other'
};
exports.BusinessModel = {
    bpo_kpo_ito: 'bpo_kpo_ito',
    call_contact_center: 'call_contact_center',
    data_center: 'data_center',
    ai_ml: 'ai_ml',
    service_desk: 'service_desk',
    saas_paas_iaas: 'saas_paas_iaas',
    fintech_payments: 'fintech_payments',
    banking: 'banking',
    insurance: 'insurance',
    marketplace_ecommerce: 'marketplace_ecommerce',
    software_factory: 'software_factory',
    consulting: 'consulting',
    telecommunications: 'telecommunications',
    logistics: 'logistics',
    healthcare: 'healthcare',
    edtech: 'edtech',
    manufacturing: 'manufacturing',
    government: 'government',
    other: 'other'
};
exports.YearsInOperation = {
    less_than_1: 'less_than_1',
    from_1_to_3: 'from_1_to_3',
    from_3_to_5: 'from_3_to_5',
    from_5_to_10: 'from_5_to_10',
    more_than_10: 'more_than_10'
};
exports.IncorporationCountry = {
    co: 'co',
    mx: 'mx',
    pe: 'pe',
    cl: 'cl',
    ar: 'ar',
    br: 'br',
    ec: 'ec',
    pa: 'pa',
    cr: 'cr',
    us: 'us',
    es: 'es',
    other: 'other'
};
exports.ClientCountry = {
    co: 'co',
    mx: 'mx',
    pe: 'pe',
    cl: 'cl',
    ar: 'ar',
    br: 'br',
    ec: 'ec',
    pa: 'pa',
    cr: 'cr',
    us: 'us',
    es: 'es',
    eu: 'eu',
    other: 'other'
};
exports.ComplianceMaturity = {
    none: 'none',
    initial_ad_hoc: 'initial_ad_hoc',
    implementing: 'implementing',
    defined: 'defined',
    managed_certified: 'managed_certified'
};
exports.OrganizationResponsibleType = {
    coo: 'coo',
    it: 'it',
    compliance: 'compliance',
    process: 'process',
    ciso: 'ciso',
    asset_owner: 'asset_owner'
};
exports.SubserviceProviderType = {
    aws: 'aws',
    azure: 'azure',
    gcp: 'gcp',
    on_premise: 'on_premise',
    hybrid: 'hybrid',
    mobile: 'mobile',
    other: 'other'
};
exports.ServiceType = {
    saas: 'saas',
    bpo: 'bpo',
    call_center: 'call_center',
    data_center: 'data_center',
    ai_services: 'ai_services',
    specialized_with_data_intervention: 'specialized_with_data_intervention',
    service_desk: 'service_desk',
    managed_services: 'managed_services',
    consulting: 'consulting',
    development: 'development',
    other: 'other'
};
exports.ServedIndustry = {
    financial: 'financial',
    healthcare: 'healthcare',
    retail: 'retail',
    technology: 'technology',
    government: 'government',
    education: 'education',
    manufacturing: 'manufacturing',
    telecommunications: 'telecommunications',
    energy: 'energy',
    logistics: 'logistics',
    other: 'other'
};
exports.ActiveClientCount = {
    from_1_to_10: 'from_1_to_10',
    from_11_to_50: 'from_11_to_50',
    from_51_to_200: 'from_51_to_200',
    from_201_to_1000: 'from_201_to_1000',
    more_than_1000: 'more_than_1000'
};
exports.ServiceCountry = {
    co: 'co',
    mx: 'mx',
    pe: 'pe',
    cl: 'cl',
    ar: 'ar',
    br: 'br',
    ec: 'ec',
    uy: 'uy',
    py: 'py',
    bo: 'bo',
    ve: 've',
    cr: 'cr',
    pa: 'pa',
    gt: 'gt',
    us: 'us',
    ca: 'ca',
    es: 'es',
    pt: 'pt',
    gb: 'gb',
    de: 'de',
    fr: 'fr',
    eu: 'eu',
    latam: 'latam',
    global: 'global'
};
exports.DataType = {
    pii: 'pii',
    payment: 'payment',
    phi: 'phi',
    business: 'business',
    files: 'files',
    logs: 'logs',
    credentials: 'credentials',
    biometric: 'biometric'
};
exports.ExpectedAvailability = {
    h24x7: '24x7',
    business_hours: 'business_hours',
    on_demand: 'on_demand',
    not_applicable: 'not_applicable'
};
exports.DeploymentScenario = {
    cloud_managed_only: 'cloud_managed_only',
    cloud_with_servers: 'cloud_with_servers',
    on_premise: 'on_premise',
    hybrid: 'hybrid'
};
exports.PreviousCertification = {
    soc2: 'soc2',
    soc1: 'soc1',
    iso27001: 'iso27001',
    none: 'none'
};
exports.AssetConnectionCategory = {
    ac_01: 'ac_01',
    ac_02: 'ac_02',
    ac_03: 'ac_03',
    ac_04: 'ac_04',
    ac_05: 'ac_05',
    ac_06: 'ac_06'
};
exports.AssetOperationalStatus = {
    operational: 'operational',
    warning: 'warning',
    error: 'error',
    not_monitored: 'not_monitored'
};
exports.ServiceFrameworkStatus = {
    active: 'active',
    paused: 'paused',
    finished: 'finished'
};
exports.AssetType = {
    server: 'server',
    database: 'database',
    cloud_service: 'cloud_service',
    application: 'application',
    endpoint: 'endpoint',
    network_device: 'network_device',
    documentation: 'documentation'
};
exports.AssetCriticality = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'critical'
};
exports.AssetOrigin = {
    declared: 'declared',
    discovered: 'discovered'
};
exports.AssetStatus = {
    active: 'active',
    inactive: 'inactive'
};
exports.ProvisioningStatus = {
    pending: 'pending',
    validated: 'validated',
    active: 'active',
    scheduled: 'scheduled',
    failed: 'failed'
};
exports.ScheduleFrequency = {
    continuous: 'continuous',
    every_6h: 'every_6h',
    every_24h: 'every_24h'
};
exports.ExecutionOrigin = {
    scheduled: 'scheduled',
    manual: 'manual'
};
exports.CheckResultStatus = {
    passed: 'passed',
    failed: 'failed',
    invalid: 'invalid',
    not_applicable: 'not_applicable',
    not_run: 'not_run'
};
exports.ExecutionLogLevel = {
    info: 'info',
    warn: 'warn',
    error: 'error'
};
exports.ExecutionStatus = {
    queued: 'queued',
    running: 'running',
    completed: 'completed',
    failed: 'failed',
    cancelled: 'cancelled'
};
//# sourceMappingURL=enums.js.map