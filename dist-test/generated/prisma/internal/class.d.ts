import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "./prismaNamespace.js";
export type LogOptions<ClientOptions extends Prisma.PrismaClientOptions> = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never;
export interface PrismaClientConstructor {
    new <Options extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions, LogOpts extends LogOptions<Options> = LogOptions<Options>, OmitOpts extends Prisma.PrismaClientOptions['omit'] = Options extends {
        omit: infer U;
    } ? U : Prisma.PrismaClientOptions['omit'], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs>(options: Prisma.Subset<Options, Prisma.PrismaClientOptions>): PrismaClient<LogOpts, OmitOpts, ExtArgs>;
}
export interface PrismaClient<in LogOpts extends Prisma.LogLevel = never, in out OmitOpts extends Prisma.PrismaClientOptions['omit'] = undefined, in out ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['other'];
    };
    $on<V extends LogOpts>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;
    $connect(): runtime.Types.Utils.JsPromise<void>;
    $disconnect(): runtime.Types.Utils.JsPromise<void>;
    $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;
    $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;
    $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;
    $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;
    $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: {
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;
    $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => runtime.Types.Utils.JsPromise<R>, options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<R>;
    $extends: runtime.Types.Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<OmitOpts>, ExtArgs, runtime.Types.Utils.Call<Prisma.TypeMapCb<OmitOpts>, {
        extArgs: ExtArgs;
    }>>;
    get auditLog(): Prisma.AuditLogDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get complianceEvent(): Prisma.ComplianceEventDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get control(): Prisma.ControlDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get pointOfFocusControl(): Prisma.PointOfFocusControlDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get controlDimensionEntry(): Prisma.ControlDimensionEntryDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get controlMeasurement(): Prisma.ControlMeasurementDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get policy(): Prisma.PolicyDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get controlPolicy(): Prisma.ControlPolicyDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get evidenceTemplate(): Prisma.EvidenceTemplateDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get controlEvidenceTemplate(): Prisma.ControlEvidenceTemplateDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get framework(): Prisma.FrameworkDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get trustCriterion(): Prisma.TrustCriterionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get requirement(): Prisma.RequirementDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get pointOfFocus(): Prisma.PointOfFocusDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get requirementRelation(): Prisma.RequirementRelationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get risk(): Prisma.RiskDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get cause(): Prisma.CauseDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get riskCause(): Prisma.RiskCauseDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get causeControl(): Prisma.CauseControlDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get automatedCapability(): Prisma.AutomatedCapabilityDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get monitoringDomain(): Prisma.MonitoringDomainDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get monitoringDomainRequirement(): Prisma.MonitoringDomainRequirementDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get monitoringDomainCapability(): Prisma.MonitoringDomainCapabilityDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get testPlan(): Prisma.TestPlanDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get test(): Prisma.TestDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get controlTest(): Prisma.ControlTestDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get check(): Prisma.CheckDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get testCheck(): Prisma.TestCheckDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get checkMapping(): Prisma.CheckMappingDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get scaPolicy(): Prisma.ScaPolicyDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get catalogVersion(): Prisma.CatalogVersionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get company(): Prisma.CompanyDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get accessKey(): Prisma.AccessKeyDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get user(): Prisma.UserDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get customRole(): Prisma.CustomRoleDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get userControlAssignment(): Prisma.UserControlAssignmentDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get auditorAssignment(): Prisma.AuditorAssignmentDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get session(): Prisma.SessionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get apiKey(): Prisma.ApiKeyDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get clientControl(): Prisma.ClientControlDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get actionPlan(): Prisma.ActionPlanDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get mitigation(): Prisma.MitigationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get residualRisk(): Prisma.ResidualRiskDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get riskTreatment(): Prisma.RiskTreatmentDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get evidenceRequirement(): Prisma.EvidenceRequirementDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get evidenceSubmission(): Prisma.EvidenceSubmissionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get exclusion(): Prisma.ExclusionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get evaluation(): Prisma.EvaluationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get finding(): Prisma.FindingDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get vulnerability(): Prisma.VulnerabilityDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get clientRisk(): Prisma.ClientRiskDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get clientCause(): Prisma.ClientCauseDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get clientRiskCause(): Prisma.ClientRiskCauseDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get clientCauseControl(): Prisma.ClientCauseControlDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get clientControlDimension(): Prisma.ClientControlDimensionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get clientControlTest(): Prisma.ClientControlTestDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get organization(): Prisma.OrganizationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get regulation(): Prisma.RegulationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get organizationRegulation(): Prisma.OrganizationRegulationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get organizationResponsible(): Prisma.OrganizationResponsibleDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get service(): Prisma.ServiceDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get serviceTrustCriterion(): Prisma.ServiceTrustCriterionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get serviceRegulation(): Prisma.ServiceRegulationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get serviceFramework(): Prisma.ServiceFrameworkDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get subserviceOrganization(): Prisma.SubserviceOrganizationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get csoc(): Prisma.CsocDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get cuec(): Prisma.CuecDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get systemDescription(): Prisma.SystemDescriptionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get scope(): Prisma.ScopeDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get asset(): Prisma.AssetDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get serviceAsset(): Prisma.ServiceAssetDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get assetProvisioning(): Prisma.AssetProvisioningDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get scheduleRule(): Prisma.ScheduleRuleDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get execution(): Prisma.ExecutionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get checkResult(): Prisma.CheckResultDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get executionLog(): Prisma.ExecutionLogDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
}
export declare function getPrismaClientClass(): PrismaClientConstructor;
