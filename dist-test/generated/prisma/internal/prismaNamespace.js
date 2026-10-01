"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogVersionScalarFieldEnum = exports.ScaPolicyScalarFieldEnum = exports.CheckMappingScalarFieldEnum = exports.TestCheckScalarFieldEnum = exports.CheckScalarFieldEnum = exports.ControlTestScalarFieldEnum = exports.TestScalarFieldEnum = exports.TestPlanScalarFieldEnum = exports.MonitoringDomainCapabilityScalarFieldEnum = exports.MonitoringDomainRequirementScalarFieldEnum = exports.MonitoringDomainScalarFieldEnum = exports.AutomatedCapabilityScalarFieldEnum = exports.CauseControlScalarFieldEnum = exports.RiskCauseScalarFieldEnum = exports.CauseScalarFieldEnum = exports.RiskScalarFieldEnum = exports.RequirementRelationScalarFieldEnum = exports.PointOfFocusScalarFieldEnum = exports.RequirementScalarFieldEnum = exports.TrustCriterionScalarFieldEnum = exports.FrameworkScalarFieldEnum = exports.ControlEvidenceTemplateScalarFieldEnum = exports.EvidenceTemplateScalarFieldEnum = exports.ControlPolicyScalarFieldEnum = exports.PolicyScalarFieldEnum = exports.ControlMeasurementScalarFieldEnum = exports.ControlDimensionEntryScalarFieldEnum = exports.PointOfFocusControlScalarFieldEnum = exports.ControlScalarFieldEnum = exports.ComplianceEventScalarFieldEnum = exports.AuditLogScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.prismaVersion = exports.getExtensionContext = exports.Decimal = exports.Sql = exports.raw = exports.join = exports.empty = exports.sql = exports.PrismaClientValidationError = exports.PrismaClientInitializationError = exports.PrismaClientRustPanicError = exports.PrismaClientUnknownRequestError = exports.PrismaClientKnownRequestError = void 0;
exports.JsonNullValueFilter = exports.QueryMode = exports.JsonNullValueInput = exports.NullableJsonNullValueInput = exports.SortOrder = exports.ExecutionLogScalarFieldEnum = exports.CheckResultScalarFieldEnum = exports.ExecutionScalarFieldEnum = exports.ScheduleRuleScalarFieldEnum = exports.AssetProvisioningScalarFieldEnum = exports.ServiceAssetScalarFieldEnum = exports.AssetScalarFieldEnum = exports.ScopeScalarFieldEnum = exports.SystemDescriptionScalarFieldEnum = exports.CuecScalarFieldEnum = exports.CsocScalarFieldEnum = exports.SubserviceOrganizationScalarFieldEnum = exports.ServiceFrameworkScalarFieldEnum = exports.ServiceRegulationScalarFieldEnum = exports.ServiceTrustCriterionScalarFieldEnum = exports.ServiceScalarFieldEnum = exports.OrganizationResponsibleScalarFieldEnum = exports.OrganizationRegulationScalarFieldEnum = exports.RegulationScalarFieldEnum = exports.OrganizationScalarFieldEnum = exports.ClientControlTestScalarFieldEnum = exports.ClientControlDimensionScalarFieldEnum = exports.ClientCauseControlScalarFieldEnum = exports.ClientRiskCauseScalarFieldEnum = exports.ClientCauseScalarFieldEnum = exports.ClientRiskScalarFieldEnum = exports.VulnerabilityScalarFieldEnum = exports.FindingScalarFieldEnum = exports.EvaluationScalarFieldEnum = exports.ExclusionScalarFieldEnum = exports.EvidenceSubmissionScalarFieldEnum = exports.EvidenceRequirementScalarFieldEnum = exports.RiskTreatmentScalarFieldEnum = exports.ResidualRiskScalarFieldEnum = exports.MitigationScalarFieldEnum = exports.ActionPlanScalarFieldEnum = exports.ClientControlScalarFieldEnum = exports.ApiKeyScalarFieldEnum = exports.SessionScalarFieldEnum = exports.AuditorAssignmentScalarFieldEnum = exports.UserControlAssignmentScalarFieldEnum = exports.CustomRoleScalarFieldEnum = exports.UserScalarFieldEnum = exports.AccessKeyScalarFieldEnum = exports.CompanyScalarFieldEnum = void 0;
exports.defineExtension = exports.NullsOrder = void 0;
const runtime = __importStar(require("@prisma/client/runtime/client"));
exports.PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
exports.PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
exports.PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
exports.PrismaClientInitializationError = runtime.PrismaClientInitializationError;
exports.PrismaClientValidationError = runtime.PrismaClientValidationError;
exports.sql = runtime.sqltag;
exports.empty = runtime.empty;
exports.join = runtime.join;
exports.raw = runtime.raw;
exports.Sql = runtime.Sql;
exports.Decimal = runtime.Decimal;
exports.getExtensionContext = runtime.Extensions.getExtensionContext;
exports.prismaVersion = {
    client: "7.2.0",
    engine: "0c8ef2ce45c83248ab3df073180d5eda9e8be7a3"
};
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    AuditLog: 'AuditLog',
    ComplianceEvent: 'ComplianceEvent',
    Control: 'Control',
    PointOfFocusControl: 'PointOfFocusControl',
    ControlDimensionEntry: 'ControlDimensionEntry',
    ControlMeasurement: 'ControlMeasurement',
    Policy: 'Policy',
    ControlPolicy: 'ControlPolicy',
    EvidenceTemplate: 'EvidenceTemplate',
    ControlEvidenceTemplate: 'ControlEvidenceTemplate',
    Framework: 'Framework',
    TrustCriterion: 'TrustCriterion',
    Requirement: 'Requirement',
    PointOfFocus: 'PointOfFocus',
    RequirementRelation: 'RequirementRelation',
    Risk: 'Risk',
    Cause: 'Cause',
    RiskCause: 'RiskCause',
    CauseControl: 'CauseControl',
    AutomatedCapability: 'AutomatedCapability',
    MonitoringDomain: 'MonitoringDomain',
    MonitoringDomainRequirement: 'MonitoringDomainRequirement',
    MonitoringDomainCapability: 'MonitoringDomainCapability',
    TestPlan: 'TestPlan',
    Test: 'Test',
    ControlTest: 'ControlTest',
    Check: 'Check',
    TestCheck: 'TestCheck',
    CheckMapping: 'CheckMapping',
    ScaPolicy: 'ScaPolicy',
    CatalogVersion: 'CatalogVersion',
    Company: 'Company',
    AccessKey: 'AccessKey',
    User: 'User',
    CustomRole: 'CustomRole',
    UserControlAssignment: 'UserControlAssignment',
    AuditorAssignment: 'AuditorAssignment',
    Session: 'Session',
    ApiKey: 'ApiKey',
    ClientControl: 'ClientControl',
    ActionPlan: 'ActionPlan',
    Mitigation: 'Mitigation',
    ResidualRisk: 'ResidualRisk',
    RiskTreatment: 'RiskTreatment',
    EvidenceRequirement: 'EvidenceRequirement',
    EvidenceSubmission: 'EvidenceSubmission',
    Exclusion: 'Exclusion',
    Evaluation: 'Evaluation',
    Finding: 'Finding',
    Vulnerability: 'Vulnerability',
    ClientRisk: 'ClientRisk',
    ClientCause: 'ClientCause',
    ClientRiskCause: 'ClientRiskCause',
    ClientCauseControl: 'ClientCauseControl',
    ClientControlDimension: 'ClientControlDimension',
    ClientControlTest: 'ClientControlTest',
    Organization: 'Organization',
    Regulation: 'Regulation',
    OrganizationRegulation: 'OrganizationRegulation',
    OrganizationResponsible: 'OrganizationResponsible',
    Service: 'Service',
    ServiceTrustCriterion: 'ServiceTrustCriterion',
    ServiceRegulation: 'ServiceRegulation',
    ServiceFramework: 'ServiceFramework',
    SubserviceOrganization: 'SubserviceOrganization',
    Csoc: 'Csoc',
    Cuec: 'Cuec',
    SystemDescription: 'SystemDescription',
    Scope: 'Scope',
    Asset: 'Asset',
    ServiceAsset: 'ServiceAsset',
    AssetProvisioning: 'AssetProvisioning',
    ScheduleRule: 'ScheduleRule',
    Execution: 'Execution',
    CheckResult: 'CheckResult',
    ExecutionLog: 'ExecutionLog'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.AuditLogScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    userId: 'userId',
    attemptedEmail: 'attemptedEmail',
    action: 'action',
    resource: 'resource',
    beforeState: 'beforeState',
    afterState: 'afterState',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    result: 'result',
    createdAt: 'createdAt'
};
exports.ComplianceEventScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    userId: 'userId',
    changedField: 'changedField',
    previousValue: 'previousValue',
    newValue: 'newValue',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    createdAt: 'createdAt'
};
exports.ControlScalarFieldEnum = {
    id: 'id',
    code: 'code',
    domain: 'domain',
    name: 'name',
    description: 'description',
    sourceRef: 'sourceRef'
};
exports.PointOfFocusControlScalarFieldEnum = {
    id: 'id',
    pointOfFocusId: 'pointOfFocusId',
    controlId: 'controlId'
};
exports.ControlDimensionEntryScalarFieldEnum = {
    id: 'id',
    controlId: 'controlId',
    dimension: 'dimension',
    type: 'type',
    requiresProbe: 'requiresProbe',
    requiresAi: 'requiresAi',
    requiresComplianceConfirmation: 'requiresComplianceConfirmation',
    reasonNotApplicable: 'reasonNotApplicable'
};
exports.ControlMeasurementScalarFieldEnum = {
    id: 'id',
    controlId: 'controlId',
    dimension: 'dimension',
    weight: 'weight',
    formula: 'formula'
};
exports.PolicyScalarFieldEnum = {
    id: 'id',
    name: 'name',
    approvalStatus: 'approvalStatus',
    validUntil: 'validUntil',
    version: 'version'
};
exports.ControlPolicyScalarFieldEnum = {
    id: 'id',
    controlId: 'controlId',
    policyId: 'policyId'
};
exports.EvidenceTemplateScalarFieldEnum = {
    id: 'id',
    code: 'code',
    description: 'description',
    dimension: 'dimension'
};
exports.ControlEvidenceTemplateScalarFieldEnum = {
    id: 'id',
    controlId: 'controlId',
    evidenceTemplateId: 'evidenceTemplateId',
    sequence: 'sequence'
};
exports.FrameworkScalarFieldEnum = {
    id: 'id',
    code: 'code',
    name: 'name',
    version: 'version',
    type: 'type',
    scopeDescription: 'scopeDescription'
};
exports.TrustCriterionScalarFieldEnum = {
    id: 'id',
    criterion: 'criterion',
    isMandatory: 'isMandatory'
};
exports.RequirementScalarFieldEnum = {
    id: 'id',
    frameworkId: 'frameworkId',
    trustCriterionId: 'trustCriterionId',
    code: 'code',
    tscCategory: 'tscCategory',
    criterion: 'criterion'
};
exports.PointOfFocusScalarFieldEnum = {
    id: 'id',
    requirementId: 'requirementId',
    number: 'number',
    description: 'description'
};
exports.RequirementRelationScalarFieldEnum = {
    id: 'id',
    sourceRequirementId: 'sourceRequirementId',
    relatedRequirementId: 'relatedRequirementId'
};
exports.RiskScalarFieldEnum = {
    id: 'id',
    code: 'code',
    name: 'name',
    description: 'description',
    trustCriterion: 'trustCriterion',
    potentialImpact: 'potentialImpact',
    likelihood: 'likelihood',
    impact: 'impact',
    inherentRiskValue: 'inherentRiskValue',
    inherentRiskLevel: 'inherentRiskLevel',
    isActive: 'isActive'
};
exports.CauseScalarFieldEnum = {
    id: 'id',
    code: 'code',
    name: 'name',
    failureCategory: 'failureCategory',
    description: 'description'
};
exports.RiskCauseScalarFieldEnum = {
    id: 'id',
    code: 'code',
    riskId: 'riskId',
    causeId: 'causeId'
};
exports.CauseControlScalarFieldEnum = {
    id: 'id',
    causeId: 'causeId',
    controlId: 'controlId'
};
exports.AutomatedCapabilityScalarFieldEnum = {
    id: 'id',
    catalogCode: 'catalogCode',
    category: 'category',
    supportedPlatforms: 'supportedPlatforms',
    method: 'method',
    requiredPermissions: 'requiredPermissions',
    provider: 'provider',
    baseFrequency: 'baseFrequency',
    generatedEvidence: 'generatedEvidence'
};
exports.MonitoringDomainScalarFieldEnum = {
    id: 'id',
    name: 'name',
    monitoredScope: 'monitoredScope',
    coveredCriterion: 'coveredCriterion',
    generatedEvidence: 'generatedEvidence'
};
exports.MonitoringDomainRequirementScalarFieldEnum = {
    id: 'id',
    monitoringDomainId: 'monitoringDomainId',
    requirementId: 'requirementId'
};
exports.MonitoringDomainCapabilityScalarFieldEnum = {
    id: 'id',
    monitoringDomainId: 'monitoringDomainId',
    automatedCapabilityId: 'automatedCapabilityId'
};
exports.TestPlanScalarFieldEnum = {
    id: 'id',
    controlId: 'controlId',
    description: 'description',
    steps: 'steps',
    population: 'population',
    samplingRule: 'samplingRule',
    origin: 'origin'
};
exports.TestScalarFieldEnum = {
    id: 'id',
    code: 'code',
    dimension: 'dimension',
    name: 'name',
    objective: 'objective',
    type: 'type',
    tool: 'tool',
    population: 'population',
    period: 'period',
    populationSize: 'populationSize',
    suggestedSampleSize: 'suggestedSampleSize',
    selectionMethod: 'selectionMethod',
    evidenceToRequest: 'evidenceToRequest',
    prerequisites: 'prerequisites',
    stepByStep: 'stepByStep',
    attributesToValidate: 'attributesToValidate',
    complianceCriterion: 'complianceCriterion',
    exceptions: 'exceptions',
    exceptionsHandling: 'exceptionsHandling',
    evidenceToRetain: 'evidenceToRetain',
    automatedCoverage: 'automatedCoverage',
    complementaryManualValidation: 'complementaryManualValidation',
    limitations: 'limitations'
};
exports.ControlTestScalarFieldEnum = {
    id: 'id',
    controlId: 'controlId',
    testId: 'testId'
};
exports.CheckScalarFieldEnum = {
    id: 'id',
    platform: 'platform',
    policyId: 'policyId',
    checkId: 'checkId',
    titleEs: 'titleEs',
    titleEn: 'titleEn',
    condition: 'condition',
    remediation: 'remediation',
    verificationRule: 'verificationRule',
    origin: 'origin',
    mappingProvenance: 'mappingProvenance',
    mappingConfidence: 'mappingConfidence',
    scaPolicyId: 'scaPolicyId'
};
exports.TestCheckScalarFieldEnum = {
    id: 'id',
    testId: 'testId',
    checkId: 'checkId'
};
exports.CheckMappingScalarFieldEnum = {
    id: 'id',
    checkId: 'checkId',
    frameworkCode: 'frameworkCode',
    frameworkVersion: 'frameworkVersion',
    requirementCode: 'requirementCode'
};
exports.ScaPolicyScalarFieldEnum = {
    id: 'id',
    platform: 'platform',
    benchmark: 'benchmark',
    scaId: 'scaId',
    yamlFile: 'yamlFile',
    checkCount: 'checkCount'
};
exports.CatalogVersionScalarFieldEnum = {
    id: 'id',
    number: 'number',
    publishedAt: 'publishedAt',
    changeSummary: 'changeSummary',
    publishedBy: 'publishedBy',
    propagatedAutomatically: 'propagatedAutomatically',
    requiresAcceptance: 'requiresAcceptance'
};
exports.CompanyScalarFieldEnum = {
    id: 'id',
    name: 'name',
    adminEmail: 'adminEmail',
    isolationStrategy: 'isolationStrategy',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.AccessKeyScalarFieldEnum = {
    id: 'id',
    companyId: 'companyId',
    createdBy: 'createdBy',
    codeHash: 'codeHash',
    status: 'status',
    expiresAt: 'expiresAt',
    usedAt: 'usedAt'
};
exports.UserScalarFieldEnum = {
    id: 'id',
    companyId: 'companyId',
    customRoleId: 'customRoleId',
    email: 'email',
    name: 'name',
    lastName: 'lastName',
    passwordHash: 'passwordHash',
    role: 'role',
    status: 'status',
    isMfaEnabled: 'isMfaEnabled',
    lastLoginAt: 'lastLoginAt',
    failedLoginAttempts: 'failedLoginAttempts',
    lockedUntil: 'lockedUntil',
    passwordChangedAt: 'passwordChangedAt',
    mfaSecretEncrypted: 'mfaSecretEncrypted',
    createdAt: 'createdAt'
};
exports.CustomRoleScalarFieldEnum = {
    id: 'id',
    companyId: 'companyId',
    name: 'name',
    permissions: 'permissions',
    createdAt: 'createdAt'
};
exports.UserControlAssignmentScalarFieldEnum = {
    id: 'id',
    companyId: 'companyId',
    userId: 'userId',
    clientControlId: 'clientControlId',
    assignedBy: 'assignedBy',
    assignedAt: 'assignedAt'
};
exports.AuditorAssignmentScalarFieldEnum = {
    id: 'id',
    auditorUserId: 'auditorUserId',
    companyId: 'companyId',
    assignedBy: 'assignedBy',
    assignedAt: 'assignedAt',
    expiresAt: 'expiresAt'
};
exports.SessionScalarFieldEnum = {
    id: 'id',
    companyId: 'companyId',
    userId: 'userId',
    refreshTokenHash: 'refreshTokenHash',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    expiresAt: 'expiresAt',
    revokedAt: 'revokedAt',
    createdAt: 'createdAt',
    lastActivityAt: 'lastActivityAt'
};
exports.ApiKeyScalarFieldEnum = {
    id: 'id',
    companyId: 'companyId',
    createdBy: 'createdBy',
    name: 'name',
    keyHash: 'keyHash',
    status: 'status',
    lastRotatedAt: 'lastRotatedAt'
};
exports.ClientControlScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    controlId: 'controlId',
    serviceId: 'serviceId',
    ownCode: 'ownCode',
    clientInterpretation: 'clientInterpretation',
    type: 'type',
    sourceRef: 'sourceRef',
    isActive: 'isActive'
};
exports.ActionPlanScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    clientControlId: 'clientControlId',
    responsibleId: 'responsibleId',
    actionDescription: 'actionDescription',
    dueDate: 'dueDate',
    status: 'status'
};
exports.MitigationScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    clientCauseId: 'clientCauseId',
    clientRiskId: 'clientRiskId',
    responsePercentage: 'responsePercentage',
    calculatedAt: 'calculatedAt'
};
exports.ResidualRiskScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    clientRiskId: 'clientRiskId',
    acceptedBy: 'acceptedBy',
    residualLevel: 'residualLevel',
    justification: 'justification',
    acceptedAt: 'acceptedAt'
};
exports.RiskTreatmentScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    clientRiskId: 'clientRiskId',
    responsibleId: 'responsibleId',
    decision: 'decision',
    dueDate: 'dueDate'
};
exports.EvidenceRequirementScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    clientControlId: 'clientControlId',
    responsibleId: 'responsibleId',
    code: 'code',
    sequence: 'sequence',
    description: 'description',
    dimension: 'dimension',
    validityWithinPeriod: 'validityWithinPeriod',
    sourceRef: 'sourceRef'
};
exports.EvidenceSubmissionScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    evidenceRequirementId: 'evidenceRequirementId',
    submittedBy: 'submittedBy',
    approvedBy: 'approvedBy',
    filePath: 'filePath',
    fileType: 'fileType',
    fileSize: 'fileSize',
    storageLocation: 'storageLocation',
    integrityHash: 'integrityHash',
    version: 'version',
    validationStatus: 'validationStatus',
    aiVerdict: 'aiVerdict'
};
exports.ExclusionScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    testId: 'testId',
    proposedBy: 'proposedBy',
    approvedBy: 'approvedBy',
    excludedCheckId: 'excludedCheckId',
    justification: 'justification',
    validUntil: 'validUntil'
};
exports.EvaluationScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    serviceId: 'serviceId',
    clientControlId: 'clientControlId',
    testId: 'testId',
    checkId: 'checkId',
    assetId: 'assetId',
    catalogVersionId: 'catalogVersionId',
    confirmedBy: 'confirmedBy',
    evaluatedAt: 'evaluatedAt',
    dimension: 'dimension',
    result: 'result',
    rawProbeResult: 'rawProbeResult',
    diagnosticPercentage: 'diagnosticPercentage',
    origin: 'origin',
    clientResponse: 'clientResponse',
    consultantAssessment: 'consultantAssessment',
    closureObservationReason: 'closureObservationReason',
    coveredPeriod: 'coveredPeriod'
};
exports.FindingScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    evaluationId: 'evaluationId',
    assetId: 'assetId',
    reportedBy: 'reportedBy',
    dimension: 'dimension',
    failedTestOrCheck: 'failedTestOrCheck',
    severity: 'severity',
    status: 'status',
    origin: 'origin',
    detectedAt: 'detectedAt',
    closedAt: 'closedAt'
};
exports.VulnerabilityScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    assetId: 'assetId',
    cve: 'cve',
    severity: 'severity',
    packageName: 'packageName',
    packageVersion: 'packageVersion',
    cvssScore: 'cvssScore',
    status: 'status',
    recommendation: 'recommendation'
};
exports.ClientRiskScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    serviceId: 'serviceId',
    riskId: 'riskId',
    code: 'code',
    name: 'name',
    description: 'description',
    trustCriterion: 'trustCriterion',
    potentialImpact: 'potentialImpact',
    likelihood: 'likelihood',
    impact: 'impact',
    inherentRiskValue: 'inherentRiskValue',
    inherentRiskLevel: 'inherentRiskLevel',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.ClientCauseScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    serviceId: 'serviceId',
    causeId: 'causeId',
    code: 'code',
    name: 'name',
    failureCategory: 'failureCategory',
    description: 'description',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.ClientRiskCauseScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    clientRiskId: 'clientRiskId',
    clientCauseId: 'clientCauseId'
};
exports.ClientCauseControlScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    clientCauseId: 'clientCauseId',
    clientControlId: 'clientControlId'
};
exports.ClientControlDimensionScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    clientControlId: 'clientControlId',
    dimension: 'dimension',
    type: 'type',
    requiresProbe: 'requiresProbe',
    requiresAi: 'requiresAi',
    requiresComplianceConfirmation: 'requiresComplianceConfirmation',
    reasonNotApplicable: 'reasonNotApplicable'
};
exports.ClientControlTestScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    clientControlId: 'clientControlId',
    testId: 'testId'
};
exports.OrganizationScalarFieldEnum = {
    id: 'id',
    companyId: 'companyId',
    name: 'name',
    description: 'description',
    size: 'size',
    industry: 'industry',
    businessModel: 'businessModel',
    yearsInOperation: 'yearsInOperation',
    incorporationCountries: 'incorporationCountries',
    clientCountries: 'clientCountries',
    complianceMaturity: 'complianceMaturity',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.RegulationScalarFieldEnum = {
    id: 'id',
    code: 'code',
    name: 'name',
    jurisdiction: 'jurisdiction'
};
exports.OrganizationRegulationScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    organizationId: 'organizationId',
    regulationId: 'regulationId'
};
exports.OrganizationResponsibleScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    organizationId: 'organizationId',
    type: 'type',
    personName: 'personName'
};
exports.ServiceScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    organizationId: 'organizationId',
    name: 'name',
    description: 'description',
    scopeStatement: 'scopeStatement',
    type: 'type',
    industriesServed: 'industriesServed',
    activeClientCount: 'activeClientCount',
    countries: 'countries',
    dataTypes: 'dataTypes',
    expectedAvailability: 'expectedAvailability',
    deploymentScenario: 'deploymentScenario',
    previousCertification: 'previousCertification',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.ServiceTrustCriterionScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    serviceId: 'serviceId',
    trustCriterionId: 'trustCriterionId'
};
exports.ServiceRegulationScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    serviceId: 'serviceId',
    regulationId: 'regulationId'
};
exports.ServiceFrameworkScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    frameworkId: 'frameworkId',
    serviceId: 'serviceId',
    catalogVersionId: 'catalogVersionId',
    contractedAt: 'contractedAt',
    status: 'status',
    evaluationPeriod: 'evaluationPeriod'
};
exports.SubserviceOrganizationScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    serviceId: 'serviceId',
    provider: 'provider',
    serviceProvided: 'serviceProvided',
    responsibility: 'responsibility',
    type: 'type'
};
exports.CsocScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    subserviceOrganizationId: 'subserviceOrganizationId',
    expectedControl: 'expectedControl'
};
exports.CuecScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    serviceId: 'serviceId',
    expectedControl: 'expectedControl'
};
exports.SystemDescriptionScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    serviceId: 'serviceId',
    filePath: 'filePath',
    sections: 'sections'
};
exports.ScopeScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    serviceId: 'serviceId',
    serverCount: 'serverCount',
    cloudCount: 'cloudCount',
    appCount: 'appCount',
    databaseCount: 'databaseCount',
    endpointCount: 'endpointCount'
};
exports.AssetScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    organizationId: 'organizationId',
    responsibleId: 'responsibleId',
    code: 'code',
    connectionCategory: 'connectionCategory',
    type: 'type',
    name: 'name',
    platform: 'platform',
    ipAddress: 'ipAddress',
    location: 'location',
    criticality: 'criticality',
    tags: 'tags',
    origin: 'origin',
    status: 'status',
    operationalStatus: 'operationalStatus',
    technicalCoverage: 'technicalCoverage'
};
exports.ServiceAssetScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    assetId: 'assetId',
    serviceId: 'serviceId'
};
exports.AssetProvisioningScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    assetId: 'assetId',
    automatedCapabilityId: 'automatedCapabilityId',
    connectionStatus: 'connectionStatus',
    lastValidatedAt: 'lastValidatedAt',
    technicalCoverage: 'technicalCoverage',
    encryptedCredentials: 'encryptedCredentials',
    isActive: 'isActive',
    scheduleFrequency: 'scheduleFrequency'
};
exports.ScheduleRuleScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    rule: 'rule',
    appliesTo: 'appliesTo',
    affectedAssetCount: 'affectedAssetCount',
    nextRunAt: 'nextRunAt'
};
exports.ExecutionScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    assetId: 'assetId',
    scheduleRuleId: 'scheduleRuleId',
    retryOfId: 'retryOfId',
    startedAt: 'startedAt',
    finishedAt: 'finishedAt',
    status: 'status',
    progressPercentage: 'progressPercentage',
    origin: 'origin'
};
exports.CheckResultScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    executionId: 'executionId',
    checkId: 'checkId',
    platform: 'platform',
    policyId: 'policyId',
    rawCheckId: 'rawCheckId',
    result: 'result',
    evaluatedAt: 'evaluatedAt'
};
exports.ExecutionLogScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    executionId: 'executionId',
    loggedAt: 'loggedAt',
    level: 'level',
    message: 'message'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.NullableJsonNullValueInput = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull
};
exports.JsonNullValueInput = {
    JsonNull: exports.JsonNull
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.JsonNullValueFilter = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull,
    AnyNull: exports.AnyNull
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.defineExtension = runtime.Extensions.defineExtension;
//# sourceMappingURL=prismaNamespace.js.map