import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models.js";
import { type PrismaClient } from "./class.js";
export type * from '../models.js';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
export declare const prismaVersion: PrismaVersion;
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: runtime.DbNullClass;
export declare const JsonNull: runtime.JsonNullClass;
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly AuditLog: "AuditLog";
    readonly ComplianceEvent: "ComplianceEvent";
    readonly Control: "Control";
    readonly PointOfFocusControl: "PointOfFocusControl";
    readonly ControlDimensionEntry: "ControlDimensionEntry";
    readonly ControlMeasurement: "ControlMeasurement";
    readonly Policy: "Policy";
    readonly ControlPolicy: "ControlPolicy";
    readonly EvidenceTemplate: "EvidenceTemplate";
    readonly ControlEvidenceTemplate: "ControlEvidenceTemplate";
    readonly Framework: "Framework";
    readonly TrustCriterion: "TrustCriterion";
    readonly Requirement: "Requirement";
    readonly PointOfFocus: "PointOfFocus";
    readonly RequirementRelation: "RequirementRelation";
    readonly Risk: "Risk";
    readonly Cause: "Cause";
    readonly RiskCause: "RiskCause";
    readonly CauseControl: "CauseControl";
    readonly AutomatedCapability: "AutomatedCapability";
    readonly MonitoringDomain: "MonitoringDomain";
    readonly MonitoringDomainRequirement: "MonitoringDomainRequirement";
    readonly MonitoringDomainCapability: "MonitoringDomainCapability";
    readonly TestPlan: "TestPlan";
    readonly Test: "Test";
    readonly ControlTest: "ControlTest";
    readonly Check: "Check";
    readonly TestCheck: "TestCheck";
    readonly CheckMapping: "CheckMapping";
    readonly ScaPolicy: "ScaPolicy";
    readonly CatalogVersion: "CatalogVersion";
    readonly Company: "Company";
    readonly AccessKey: "AccessKey";
    readonly User: "User";
    readonly CustomRole: "CustomRole";
    readonly UserControlAssignment: "UserControlAssignment";
    readonly AuditorAssignment: "AuditorAssignment";
    readonly Session: "Session";
    readonly ApiKey: "ApiKey";
    readonly ClientControl: "ClientControl";
    readonly ActionPlan: "ActionPlan";
    readonly Mitigation: "Mitigation";
    readonly ResidualRisk: "ResidualRisk";
    readonly RiskTreatment: "RiskTreatment";
    readonly EvidenceRequirement: "EvidenceRequirement";
    readonly EvidenceSubmission: "EvidenceSubmission";
    readonly Exclusion: "Exclusion";
    readonly Evaluation: "Evaluation";
    readonly Finding: "Finding";
    readonly Vulnerability: "Vulnerability";
    readonly ClientRisk: "ClientRisk";
    readonly ClientCause: "ClientCause";
    readonly ClientRiskCause: "ClientRiskCause";
    readonly ClientCauseControl: "ClientCauseControl";
    readonly ClientControlDimension: "ClientControlDimension";
    readonly ClientControlTest: "ClientControlTest";
    readonly Organization: "Organization";
    readonly Regulation: "Regulation";
    readonly OrganizationRegulation: "OrganizationRegulation";
    readonly OrganizationResponsible: "OrganizationResponsible";
    readonly Service: "Service";
    readonly ServiceTrustCriterion: "ServiceTrustCriterion";
    readonly ServiceRegulation: "ServiceRegulation";
    readonly ServiceFramework: "ServiceFramework";
    readonly SubserviceOrganization: "SubserviceOrganization";
    readonly Csoc: "Csoc";
    readonly Cuec: "Cuec";
    readonly SystemDescription: "SystemDescription";
    readonly Scope: "Scope";
    readonly Asset: "Asset";
    readonly ServiceAsset: "ServiceAsset";
    readonly AssetProvisioning: "AssetProvisioning";
    readonly ScheduleRule: "ScheduleRule";
    readonly Execution: "Execution";
    readonly CheckResult: "CheckResult";
    readonly ExecutionLog: "ExecutionLog";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "auditLog" | "complianceEvent" | "control" | "pointOfFocusControl" | "controlDimensionEntry" | "controlMeasurement" | "policy" | "controlPolicy" | "evidenceTemplate" | "controlEvidenceTemplate" | "framework" | "trustCriterion" | "requirement" | "pointOfFocus" | "requirementRelation" | "risk" | "cause" | "riskCause" | "causeControl" | "automatedCapability" | "monitoringDomain" | "monitoringDomainRequirement" | "monitoringDomainCapability" | "testPlan" | "test" | "controlTest" | "check" | "testCheck" | "checkMapping" | "scaPolicy" | "catalogVersion" | "company" | "accessKey" | "user" | "customRole" | "userControlAssignment" | "auditorAssignment" | "session" | "apiKey" | "clientControl" | "actionPlan" | "mitigation" | "residualRisk" | "riskTreatment" | "evidenceRequirement" | "evidenceSubmission" | "exclusion" | "evaluation" | "finding" | "vulnerability" | "clientRisk" | "clientCause" | "clientRiskCause" | "clientCauseControl" | "clientControlDimension" | "clientControlTest" | "organization" | "regulation" | "organizationRegulation" | "organizationResponsible" | "service" | "serviceTrustCriterion" | "serviceRegulation" | "serviceFramework" | "subserviceOrganization" | "csoc" | "cuec" | "systemDescription" | "scope" | "asset" | "serviceAsset" | "assetProvisioning" | "scheduleRule" | "execution" | "checkResult" | "executionLog";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        AuditLog: {
            payload: Prisma.$AuditLogPayload<ExtArgs>;
            fields: Prisma.AuditLogFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AuditLogFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>;
                };
                findFirst: {
                    args: Prisma.AuditLogFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>;
                };
                findMany: {
                    args: Prisma.AuditLogFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>[];
                };
                create: {
                    args: Prisma.AuditLogCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>;
                };
                createMany: {
                    args: Prisma.AuditLogCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AuditLogCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>[];
                };
                delete: {
                    args: Prisma.AuditLogDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>;
                };
                update: {
                    args: Prisma.AuditLogUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>;
                };
                deleteMany: {
                    args: Prisma.AuditLogDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AuditLogUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AuditLogUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>[];
                };
                upsert: {
                    args: Prisma.AuditLogUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>;
                };
                aggregate: {
                    args: Prisma.AuditLogAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAuditLog>;
                };
                groupBy: {
                    args: Prisma.AuditLogGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AuditLogGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AuditLogCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AuditLogCountAggregateOutputType> | number;
                };
            };
        };
        ComplianceEvent: {
            payload: Prisma.$ComplianceEventPayload<ExtArgs>;
            fields: Prisma.ComplianceEventFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ComplianceEventFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComplianceEventPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ComplianceEventFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComplianceEventPayload>;
                };
                findFirst: {
                    args: Prisma.ComplianceEventFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComplianceEventPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ComplianceEventFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComplianceEventPayload>;
                };
                findMany: {
                    args: Prisma.ComplianceEventFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComplianceEventPayload>[];
                };
                create: {
                    args: Prisma.ComplianceEventCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComplianceEventPayload>;
                };
                createMany: {
                    args: Prisma.ComplianceEventCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ComplianceEventCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComplianceEventPayload>[];
                };
                delete: {
                    args: Prisma.ComplianceEventDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComplianceEventPayload>;
                };
                update: {
                    args: Prisma.ComplianceEventUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComplianceEventPayload>;
                };
                deleteMany: {
                    args: Prisma.ComplianceEventDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ComplianceEventUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ComplianceEventUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComplianceEventPayload>[];
                };
                upsert: {
                    args: Prisma.ComplianceEventUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ComplianceEventPayload>;
                };
                aggregate: {
                    args: Prisma.ComplianceEventAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateComplianceEvent>;
                };
                groupBy: {
                    args: Prisma.ComplianceEventGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ComplianceEventGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ComplianceEventCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ComplianceEventCountAggregateOutputType> | number;
                };
            };
        };
        Control: {
            payload: Prisma.$ControlPayload<ExtArgs>;
            fields: Prisma.ControlFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ControlFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ControlFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPayload>;
                };
                findFirst: {
                    args: Prisma.ControlFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ControlFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPayload>;
                };
                findMany: {
                    args: Prisma.ControlFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPayload>[];
                };
                create: {
                    args: Prisma.ControlCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPayload>;
                };
                createMany: {
                    args: Prisma.ControlCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ControlCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPayload>[];
                };
                delete: {
                    args: Prisma.ControlDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPayload>;
                };
                update: {
                    args: Prisma.ControlUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPayload>;
                };
                deleteMany: {
                    args: Prisma.ControlDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ControlUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ControlUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPayload>[];
                };
                upsert: {
                    args: Prisma.ControlUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPayload>;
                };
                aggregate: {
                    args: Prisma.ControlAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateControl>;
                };
                groupBy: {
                    args: Prisma.ControlGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ControlGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ControlCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ControlCountAggregateOutputType> | number;
                };
            };
        };
        PointOfFocusControl: {
            payload: Prisma.$PointOfFocusControlPayload<ExtArgs>;
            fields: Prisma.PointOfFocusControlFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PointOfFocusControlFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusControlPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PointOfFocusControlFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusControlPayload>;
                };
                findFirst: {
                    args: Prisma.PointOfFocusControlFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusControlPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PointOfFocusControlFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusControlPayload>;
                };
                findMany: {
                    args: Prisma.PointOfFocusControlFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusControlPayload>[];
                };
                create: {
                    args: Prisma.PointOfFocusControlCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusControlPayload>;
                };
                createMany: {
                    args: Prisma.PointOfFocusControlCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PointOfFocusControlCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusControlPayload>[];
                };
                delete: {
                    args: Prisma.PointOfFocusControlDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusControlPayload>;
                };
                update: {
                    args: Prisma.PointOfFocusControlUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusControlPayload>;
                };
                deleteMany: {
                    args: Prisma.PointOfFocusControlDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PointOfFocusControlUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PointOfFocusControlUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusControlPayload>[];
                };
                upsert: {
                    args: Prisma.PointOfFocusControlUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusControlPayload>;
                };
                aggregate: {
                    args: Prisma.PointOfFocusControlAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePointOfFocusControl>;
                };
                groupBy: {
                    args: Prisma.PointOfFocusControlGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PointOfFocusControlGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PointOfFocusControlCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PointOfFocusControlCountAggregateOutputType> | number;
                };
            };
        };
        ControlDimensionEntry: {
            payload: Prisma.$ControlDimensionEntryPayload<ExtArgs>;
            fields: Prisma.ControlDimensionEntryFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ControlDimensionEntryFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlDimensionEntryPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ControlDimensionEntryFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlDimensionEntryPayload>;
                };
                findFirst: {
                    args: Prisma.ControlDimensionEntryFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlDimensionEntryPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ControlDimensionEntryFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlDimensionEntryPayload>;
                };
                findMany: {
                    args: Prisma.ControlDimensionEntryFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlDimensionEntryPayload>[];
                };
                create: {
                    args: Prisma.ControlDimensionEntryCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlDimensionEntryPayload>;
                };
                createMany: {
                    args: Prisma.ControlDimensionEntryCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ControlDimensionEntryCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlDimensionEntryPayload>[];
                };
                delete: {
                    args: Prisma.ControlDimensionEntryDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlDimensionEntryPayload>;
                };
                update: {
                    args: Prisma.ControlDimensionEntryUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlDimensionEntryPayload>;
                };
                deleteMany: {
                    args: Prisma.ControlDimensionEntryDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ControlDimensionEntryUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ControlDimensionEntryUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlDimensionEntryPayload>[];
                };
                upsert: {
                    args: Prisma.ControlDimensionEntryUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlDimensionEntryPayload>;
                };
                aggregate: {
                    args: Prisma.ControlDimensionEntryAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateControlDimensionEntry>;
                };
                groupBy: {
                    args: Prisma.ControlDimensionEntryGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ControlDimensionEntryGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ControlDimensionEntryCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ControlDimensionEntryCountAggregateOutputType> | number;
                };
            };
        };
        ControlMeasurement: {
            payload: Prisma.$ControlMeasurementPayload<ExtArgs>;
            fields: Prisma.ControlMeasurementFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ControlMeasurementFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlMeasurementPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ControlMeasurementFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlMeasurementPayload>;
                };
                findFirst: {
                    args: Prisma.ControlMeasurementFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlMeasurementPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ControlMeasurementFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlMeasurementPayload>;
                };
                findMany: {
                    args: Prisma.ControlMeasurementFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlMeasurementPayload>[];
                };
                create: {
                    args: Prisma.ControlMeasurementCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlMeasurementPayload>;
                };
                createMany: {
                    args: Prisma.ControlMeasurementCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ControlMeasurementCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlMeasurementPayload>[];
                };
                delete: {
                    args: Prisma.ControlMeasurementDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlMeasurementPayload>;
                };
                update: {
                    args: Prisma.ControlMeasurementUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlMeasurementPayload>;
                };
                deleteMany: {
                    args: Prisma.ControlMeasurementDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ControlMeasurementUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ControlMeasurementUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlMeasurementPayload>[];
                };
                upsert: {
                    args: Prisma.ControlMeasurementUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlMeasurementPayload>;
                };
                aggregate: {
                    args: Prisma.ControlMeasurementAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateControlMeasurement>;
                };
                groupBy: {
                    args: Prisma.ControlMeasurementGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ControlMeasurementGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ControlMeasurementCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ControlMeasurementCountAggregateOutputType> | number;
                };
            };
        };
        Policy: {
            payload: Prisma.$PolicyPayload<ExtArgs>;
            fields: Prisma.PolicyFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PolicyFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PolicyFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyPayload>;
                };
                findFirst: {
                    args: Prisma.PolicyFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PolicyFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyPayload>;
                };
                findMany: {
                    args: Prisma.PolicyFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyPayload>[];
                };
                create: {
                    args: Prisma.PolicyCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyPayload>;
                };
                createMany: {
                    args: Prisma.PolicyCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PolicyCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyPayload>[];
                };
                delete: {
                    args: Prisma.PolicyDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyPayload>;
                };
                update: {
                    args: Prisma.PolicyUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyPayload>;
                };
                deleteMany: {
                    args: Prisma.PolicyDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PolicyUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PolicyUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyPayload>[];
                };
                upsert: {
                    args: Prisma.PolicyUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PolicyPayload>;
                };
                aggregate: {
                    args: Prisma.PolicyAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePolicy>;
                };
                groupBy: {
                    args: Prisma.PolicyGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PolicyGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PolicyCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PolicyCountAggregateOutputType> | number;
                };
            };
        };
        ControlPolicy: {
            payload: Prisma.$ControlPolicyPayload<ExtArgs>;
            fields: Prisma.ControlPolicyFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ControlPolicyFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPolicyPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ControlPolicyFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPolicyPayload>;
                };
                findFirst: {
                    args: Prisma.ControlPolicyFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPolicyPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ControlPolicyFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPolicyPayload>;
                };
                findMany: {
                    args: Prisma.ControlPolicyFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPolicyPayload>[];
                };
                create: {
                    args: Prisma.ControlPolicyCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPolicyPayload>;
                };
                createMany: {
                    args: Prisma.ControlPolicyCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ControlPolicyCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPolicyPayload>[];
                };
                delete: {
                    args: Prisma.ControlPolicyDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPolicyPayload>;
                };
                update: {
                    args: Prisma.ControlPolicyUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPolicyPayload>;
                };
                deleteMany: {
                    args: Prisma.ControlPolicyDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ControlPolicyUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ControlPolicyUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPolicyPayload>[];
                };
                upsert: {
                    args: Prisma.ControlPolicyUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlPolicyPayload>;
                };
                aggregate: {
                    args: Prisma.ControlPolicyAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateControlPolicy>;
                };
                groupBy: {
                    args: Prisma.ControlPolicyGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ControlPolicyGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ControlPolicyCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ControlPolicyCountAggregateOutputType> | number;
                };
            };
        };
        EvidenceTemplate: {
            payload: Prisma.$EvidenceTemplatePayload<ExtArgs>;
            fields: Prisma.EvidenceTemplateFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.EvidenceTemplateFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceTemplatePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.EvidenceTemplateFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceTemplatePayload>;
                };
                findFirst: {
                    args: Prisma.EvidenceTemplateFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceTemplatePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.EvidenceTemplateFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceTemplatePayload>;
                };
                findMany: {
                    args: Prisma.EvidenceTemplateFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceTemplatePayload>[];
                };
                create: {
                    args: Prisma.EvidenceTemplateCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceTemplatePayload>;
                };
                createMany: {
                    args: Prisma.EvidenceTemplateCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.EvidenceTemplateCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceTemplatePayload>[];
                };
                delete: {
                    args: Prisma.EvidenceTemplateDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceTemplatePayload>;
                };
                update: {
                    args: Prisma.EvidenceTemplateUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceTemplatePayload>;
                };
                deleteMany: {
                    args: Prisma.EvidenceTemplateDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.EvidenceTemplateUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.EvidenceTemplateUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceTemplatePayload>[];
                };
                upsert: {
                    args: Prisma.EvidenceTemplateUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceTemplatePayload>;
                };
                aggregate: {
                    args: Prisma.EvidenceTemplateAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateEvidenceTemplate>;
                };
                groupBy: {
                    args: Prisma.EvidenceTemplateGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EvidenceTemplateGroupByOutputType>[];
                };
                count: {
                    args: Prisma.EvidenceTemplateCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EvidenceTemplateCountAggregateOutputType> | number;
                };
            };
        };
        ControlEvidenceTemplate: {
            payload: Prisma.$ControlEvidenceTemplatePayload<ExtArgs>;
            fields: Prisma.ControlEvidenceTemplateFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ControlEvidenceTemplateFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlEvidenceTemplatePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ControlEvidenceTemplateFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlEvidenceTemplatePayload>;
                };
                findFirst: {
                    args: Prisma.ControlEvidenceTemplateFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlEvidenceTemplatePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ControlEvidenceTemplateFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlEvidenceTemplatePayload>;
                };
                findMany: {
                    args: Prisma.ControlEvidenceTemplateFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlEvidenceTemplatePayload>[];
                };
                create: {
                    args: Prisma.ControlEvidenceTemplateCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlEvidenceTemplatePayload>;
                };
                createMany: {
                    args: Prisma.ControlEvidenceTemplateCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ControlEvidenceTemplateCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlEvidenceTemplatePayload>[];
                };
                delete: {
                    args: Prisma.ControlEvidenceTemplateDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlEvidenceTemplatePayload>;
                };
                update: {
                    args: Prisma.ControlEvidenceTemplateUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlEvidenceTemplatePayload>;
                };
                deleteMany: {
                    args: Prisma.ControlEvidenceTemplateDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ControlEvidenceTemplateUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ControlEvidenceTemplateUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlEvidenceTemplatePayload>[];
                };
                upsert: {
                    args: Prisma.ControlEvidenceTemplateUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlEvidenceTemplatePayload>;
                };
                aggregate: {
                    args: Prisma.ControlEvidenceTemplateAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateControlEvidenceTemplate>;
                };
                groupBy: {
                    args: Prisma.ControlEvidenceTemplateGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ControlEvidenceTemplateGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ControlEvidenceTemplateCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ControlEvidenceTemplateCountAggregateOutputType> | number;
                };
            };
        };
        Framework: {
            payload: Prisma.$FrameworkPayload<ExtArgs>;
            fields: Prisma.FrameworkFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.FrameworkFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FrameworkPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.FrameworkFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FrameworkPayload>;
                };
                findFirst: {
                    args: Prisma.FrameworkFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FrameworkPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.FrameworkFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FrameworkPayload>;
                };
                findMany: {
                    args: Prisma.FrameworkFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FrameworkPayload>[];
                };
                create: {
                    args: Prisma.FrameworkCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FrameworkPayload>;
                };
                createMany: {
                    args: Prisma.FrameworkCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.FrameworkCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FrameworkPayload>[];
                };
                delete: {
                    args: Prisma.FrameworkDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FrameworkPayload>;
                };
                update: {
                    args: Prisma.FrameworkUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FrameworkPayload>;
                };
                deleteMany: {
                    args: Prisma.FrameworkDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.FrameworkUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.FrameworkUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FrameworkPayload>[];
                };
                upsert: {
                    args: Prisma.FrameworkUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FrameworkPayload>;
                };
                aggregate: {
                    args: Prisma.FrameworkAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateFramework>;
                };
                groupBy: {
                    args: Prisma.FrameworkGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.FrameworkGroupByOutputType>[];
                };
                count: {
                    args: Prisma.FrameworkCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.FrameworkCountAggregateOutputType> | number;
                };
            };
        };
        TrustCriterion: {
            payload: Prisma.$TrustCriterionPayload<ExtArgs>;
            fields: Prisma.TrustCriterionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TrustCriterionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrustCriterionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TrustCriterionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrustCriterionPayload>;
                };
                findFirst: {
                    args: Prisma.TrustCriterionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrustCriterionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TrustCriterionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrustCriterionPayload>;
                };
                findMany: {
                    args: Prisma.TrustCriterionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrustCriterionPayload>[];
                };
                create: {
                    args: Prisma.TrustCriterionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrustCriterionPayload>;
                };
                createMany: {
                    args: Prisma.TrustCriterionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TrustCriterionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrustCriterionPayload>[];
                };
                delete: {
                    args: Prisma.TrustCriterionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrustCriterionPayload>;
                };
                update: {
                    args: Prisma.TrustCriterionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrustCriterionPayload>;
                };
                deleteMany: {
                    args: Prisma.TrustCriterionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TrustCriterionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TrustCriterionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrustCriterionPayload>[];
                };
                upsert: {
                    args: Prisma.TrustCriterionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TrustCriterionPayload>;
                };
                aggregate: {
                    args: Prisma.TrustCriterionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTrustCriterion>;
                };
                groupBy: {
                    args: Prisma.TrustCriterionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TrustCriterionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TrustCriterionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TrustCriterionCountAggregateOutputType> | number;
                };
            };
        };
        Requirement: {
            payload: Prisma.$RequirementPayload<ExtArgs>;
            fields: Prisma.RequirementFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RequirementFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RequirementFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementPayload>;
                };
                findFirst: {
                    args: Prisma.RequirementFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RequirementFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementPayload>;
                };
                findMany: {
                    args: Prisma.RequirementFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementPayload>[];
                };
                create: {
                    args: Prisma.RequirementCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementPayload>;
                };
                createMany: {
                    args: Prisma.RequirementCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RequirementCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementPayload>[];
                };
                delete: {
                    args: Prisma.RequirementDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementPayload>;
                };
                update: {
                    args: Prisma.RequirementUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementPayload>;
                };
                deleteMany: {
                    args: Prisma.RequirementDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RequirementUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RequirementUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementPayload>[];
                };
                upsert: {
                    args: Prisma.RequirementUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementPayload>;
                };
                aggregate: {
                    args: Prisma.RequirementAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRequirement>;
                };
                groupBy: {
                    args: Prisma.RequirementGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequirementGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RequirementCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequirementCountAggregateOutputType> | number;
                };
            };
        };
        PointOfFocus: {
            payload: Prisma.$PointOfFocusPayload<ExtArgs>;
            fields: Prisma.PointOfFocusFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PointOfFocusFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PointOfFocusFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusPayload>;
                };
                findFirst: {
                    args: Prisma.PointOfFocusFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PointOfFocusFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusPayload>;
                };
                findMany: {
                    args: Prisma.PointOfFocusFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusPayload>[];
                };
                create: {
                    args: Prisma.PointOfFocusCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusPayload>;
                };
                createMany: {
                    args: Prisma.PointOfFocusCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PointOfFocusCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusPayload>[];
                };
                delete: {
                    args: Prisma.PointOfFocusDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusPayload>;
                };
                update: {
                    args: Prisma.PointOfFocusUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusPayload>;
                };
                deleteMany: {
                    args: Prisma.PointOfFocusDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PointOfFocusUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PointOfFocusUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusPayload>[];
                };
                upsert: {
                    args: Prisma.PointOfFocusUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PointOfFocusPayload>;
                };
                aggregate: {
                    args: Prisma.PointOfFocusAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePointOfFocus>;
                };
                groupBy: {
                    args: Prisma.PointOfFocusGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PointOfFocusGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PointOfFocusCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PointOfFocusCountAggregateOutputType> | number;
                };
            };
        };
        RequirementRelation: {
            payload: Prisma.$RequirementRelationPayload<ExtArgs>;
            fields: Prisma.RequirementRelationFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RequirementRelationFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementRelationPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RequirementRelationFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementRelationPayload>;
                };
                findFirst: {
                    args: Prisma.RequirementRelationFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementRelationPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RequirementRelationFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementRelationPayload>;
                };
                findMany: {
                    args: Prisma.RequirementRelationFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementRelationPayload>[];
                };
                create: {
                    args: Prisma.RequirementRelationCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementRelationPayload>;
                };
                createMany: {
                    args: Prisma.RequirementRelationCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RequirementRelationCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementRelationPayload>[];
                };
                delete: {
                    args: Prisma.RequirementRelationDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementRelationPayload>;
                };
                update: {
                    args: Prisma.RequirementRelationUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementRelationPayload>;
                };
                deleteMany: {
                    args: Prisma.RequirementRelationDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RequirementRelationUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RequirementRelationUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementRelationPayload>[];
                };
                upsert: {
                    args: Prisma.RequirementRelationUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequirementRelationPayload>;
                };
                aggregate: {
                    args: Prisma.RequirementRelationAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRequirementRelation>;
                };
                groupBy: {
                    args: Prisma.RequirementRelationGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequirementRelationGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RequirementRelationCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequirementRelationCountAggregateOutputType> | number;
                };
            };
        };
        Risk: {
            payload: Prisma.$RiskPayload<ExtArgs>;
            fields: Prisma.RiskFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RiskFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RiskFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskPayload>;
                };
                findFirst: {
                    args: Prisma.RiskFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RiskFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskPayload>;
                };
                findMany: {
                    args: Prisma.RiskFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskPayload>[];
                };
                create: {
                    args: Prisma.RiskCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskPayload>;
                };
                createMany: {
                    args: Prisma.RiskCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RiskCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskPayload>[];
                };
                delete: {
                    args: Prisma.RiskDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskPayload>;
                };
                update: {
                    args: Prisma.RiskUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskPayload>;
                };
                deleteMany: {
                    args: Prisma.RiskDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RiskUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RiskUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskPayload>[];
                };
                upsert: {
                    args: Prisma.RiskUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskPayload>;
                };
                aggregate: {
                    args: Prisma.RiskAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRisk>;
                };
                groupBy: {
                    args: Prisma.RiskGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RiskGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RiskCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RiskCountAggregateOutputType> | number;
                };
            };
        };
        Cause: {
            payload: Prisma.$CausePayload<ExtArgs>;
            fields: Prisma.CauseFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CauseFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CausePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CauseFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CausePayload>;
                };
                findFirst: {
                    args: Prisma.CauseFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CausePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CauseFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CausePayload>;
                };
                findMany: {
                    args: Prisma.CauseFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CausePayload>[];
                };
                create: {
                    args: Prisma.CauseCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CausePayload>;
                };
                createMany: {
                    args: Prisma.CauseCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CauseCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CausePayload>[];
                };
                delete: {
                    args: Prisma.CauseDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CausePayload>;
                };
                update: {
                    args: Prisma.CauseUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CausePayload>;
                };
                deleteMany: {
                    args: Prisma.CauseDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CauseUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CauseUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CausePayload>[];
                };
                upsert: {
                    args: Prisma.CauseUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CausePayload>;
                };
                aggregate: {
                    args: Prisma.CauseAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCause>;
                };
                groupBy: {
                    args: Prisma.CauseGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CauseGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CauseCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CauseCountAggregateOutputType> | number;
                };
            };
        };
        RiskCause: {
            payload: Prisma.$RiskCausePayload<ExtArgs>;
            fields: Prisma.RiskCauseFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RiskCauseFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskCausePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RiskCauseFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskCausePayload>;
                };
                findFirst: {
                    args: Prisma.RiskCauseFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskCausePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RiskCauseFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskCausePayload>;
                };
                findMany: {
                    args: Prisma.RiskCauseFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskCausePayload>[];
                };
                create: {
                    args: Prisma.RiskCauseCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskCausePayload>;
                };
                createMany: {
                    args: Prisma.RiskCauseCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RiskCauseCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskCausePayload>[];
                };
                delete: {
                    args: Prisma.RiskCauseDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskCausePayload>;
                };
                update: {
                    args: Prisma.RiskCauseUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskCausePayload>;
                };
                deleteMany: {
                    args: Prisma.RiskCauseDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RiskCauseUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RiskCauseUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskCausePayload>[];
                };
                upsert: {
                    args: Prisma.RiskCauseUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskCausePayload>;
                };
                aggregate: {
                    args: Prisma.RiskCauseAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRiskCause>;
                };
                groupBy: {
                    args: Prisma.RiskCauseGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RiskCauseGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RiskCauseCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RiskCauseCountAggregateOutputType> | number;
                };
            };
        };
        CauseControl: {
            payload: Prisma.$CauseControlPayload<ExtArgs>;
            fields: Prisma.CauseControlFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CauseControlFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CauseControlPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CauseControlFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CauseControlPayload>;
                };
                findFirst: {
                    args: Prisma.CauseControlFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CauseControlPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CauseControlFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CauseControlPayload>;
                };
                findMany: {
                    args: Prisma.CauseControlFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CauseControlPayload>[];
                };
                create: {
                    args: Prisma.CauseControlCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CauseControlPayload>;
                };
                createMany: {
                    args: Prisma.CauseControlCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CauseControlCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CauseControlPayload>[];
                };
                delete: {
                    args: Prisma.CauseControlDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CauseControlPayload>;
                };
                update: {
                    args: Prisma.CauseControlUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CauseControlPayload>;
                };
                deleteMany: {
                    args: Prisma.CauseControlDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CauseControlUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CauseControlUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CauseControlPayload>[];
                };
                upsert: {
                    args: Prisma.CauseControlUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CauseControlPayload>;
                };
                aggregate: {
                    args: Prisma.CauseControlAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCauseControl>;
                };
                groupBy: {
                    args: Prisma.CauseControlGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CauseControlGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CauseControlCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CauseControlCountAggregateOutputType> | number;
                };
            };
        };
        AutomatedCapability: {
            payload: Prisma.$AutomatedCapabilityPayload<ExtArgs>;
            fields: Prisma.AutomatedCapabilityFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AutomatedCapabilityFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutomatedCapabilityPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AutomatedCapabilityFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutomatedCapabilityPayload>;
                };
                findFirst: {
                    args: Prisma.AutomatedCapabilityFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutomatedCapabilityPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AutomatedCapabilityFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutomatedCapabilityPayload>;
                };
                findMany: {
                    args: Prisma.AutomatedCapabilityFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutomatedCapabilityPayload>[];
                };
                create: {
                    args: Prisma.AutomatedCapabilityCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutomatedCapabilityPayload>;
                };
                createMany: {
                    args: Prisma.AutomatedCapabilityCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AutomatedCapabilityCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutomatedCapabilityPayload>[];
                };
                delete: {
                    args: Prisma.AutomatedCapabilityDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutomatedCapabilityPayload>;
                };
                update: {
                    args: Prisma.AutomatedCapabilityUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutomatedCapabilityPayload>;
                };
                deleteMany: {
                    args: Prisma.AutomatedCapabilityDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AutomatedCapabilityUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AutomatedCapabilityUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutomatedCapabilityPayload>[];
                };
                upsert: {
                    args: Prisma.AutomatedCapabilityUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutomatedCapabilityPayload>;
                };
                aggregate: {
                    args: Prisma.AutomatedCapabilityAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAutomatedCapability>;
                };
                groupBy: {
                    args: Prisma.AutomatedCapabilityGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AutomatedCapabilityGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AutomatedCapabilityCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AutomatedCapabilityCountAggregateOutputType> | number;
                };
            };
        };
        MonitoringDomain: {
            payload: Prisma.$MonitoringDomainPayload<ExtArgs>;
            fields: Prisma.MonitoringDomainFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MonitoringDomainFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MonitoringDomainFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainPayload>;
                };
                findFirst: {
                    args: Prisma.MonitoringDomainFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MonitoringDomainFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainPayload>;
                };
                findMany: {
                    args: Prisma.MonitoringDomainFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainPayload>[];
                };
                create: {
                    args: Prisma.MonitoringDomainCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainPayload>;
                };
                createMany: {
                    args: Prisma.MonitoringDomainCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MonitoringDomainCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainPayload>[];
                };
                delete: {
                    args: Prisma.MonitoringDomainDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainPayload>;
                };
                update: {
                    args: Prisma.MonitoringDomainUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainPayload>;
                };
                deleteMany: {
                    args: Prisma.MonitoringDomainDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MonitoringDomainUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MonitoringDomainUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainPayload>[];
                };
                upsert: {
                    args: Prisma.MonitoringDomainUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainPayload>;
                };
                aggregate: {
                    args: Prisma.MonitoringDomainAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMonitoringDomain>;
                };
                groupBy: {
                    args: Prisma.MonitoringDomainGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MonitoringDomainGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MonitoringDomainCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MonitoringDomainCountAggregateOutputType> | number;
                };
            };
        };
        MonitoringDomainRequirement: {
            payload: Prisma.$MonitoringDomainRequirementPayload<ExtArgs>;
            fields: Prisma.MonitoringDomainRequirementFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MonitoringDomainRequirementFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainRequirementPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MonitoringDomainRequirementFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainRequirementPayload>;
                };
                findFirst: {
                    args: Prisma.MonitoringDomainRequirementFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainRequirementPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MonitoringDomainRequirementFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainRequirementPayload>;
                };
                findMany: {
                    args: Prisma.MonitoringDomainRequirementFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainRequirementPayload>[];
                };
                create: {
                    args: Prisma.MonitoringDomainRequirementCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainRequirementPayload>;
                };
                createMany: {
                    args: Prisma.MonitoringDomainRequirementCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MonitoringDomainRequirementCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainRequirementPayload>[];
                };
                delete: {
                    args: Prisma.MonitoringDomainRequirementDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainRequirementPayload>;
                };
                update: {
                    args: Prisma.MonitoringDomainRequirementUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainRequirementPayload>;
                };
                deleteMany: {
                    args: Prisma.MonitoringDomainRequirementDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MonitoringDomainRequirementUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MonitoringDomainRequirementUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainRequirementPayload>[];
                };
                upsert: {
                    args: Prisma.MonitoringDomainRequirementUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainRequirementPayload>;
                };
                aggregate: {
                    args: Prisma.MonitoringDomainRequirementAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMonitoringDomainRequirement>;
                };
                groupBy: {
                    args: Prisma.MonitoringDomainRequirementGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MonitoringDomainRequirementGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MonitoringDomainRequirementCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MonitoringDomainRequirementCountAggregateOutputType> | number;
                };
            };
        };
        MonitoringDomainCapability: {
            payload: Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>;
            fields: Prisma.MonitoringDomainCapabilityFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MonitoringDomainCapabilityFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainCapabilityPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MonitoringDomainCapabilityFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainCapabilityPayload>;
                };
                findFirst: {
                    args: Prisma.MonitoringDomainCapabilityFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainCapabilityPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MonitoringDomainCapabilityFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainCapabilityPayload>;
                };
                findMany: {
                    args: Prisma.MonitoringDomainCapabilityFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainCapabilityPayload>[];
                };
                create: {
                    args: Prisma.MonitoringDomainCapabilityCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainCapabilityPayload>;
                };
                createMany: {
                    args: Prisma.MonitoringDomainCapabilityCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MonitoringDomainCapabilityCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainCapabilityPayload>[];
                };
                delete: {
                    args: Prisma.MonitoringDomainCapabilityDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainCapabilityPayload>;
                };
                update: {
                    args: Prisma.MonitoringDomainCapabilityUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainCapabilityPayload>;
                };
                deleteMany: {
                    args: Prisma.MonitoringDomainCapabilityDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MonitoringDomainCapabilityUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MonitoringDomainCapabilityUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainCapabilityPayload>[];
                };
                upsert: {
                    args: Prisma.MonitoringDomainCapabilityUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MonitoringDomainCapabilityPayload>;
                };
                aggregate: {
                    args: Prisma.MonitoringDomainCapabilityAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMonitoringDomainCapability>;
                };
                groupBy: {
                    args: Prisma.MonitoringDomainCapabilityGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MonitoringDomainCapabilityGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MonitoringDomainCapabilityCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MonitoringDomainCapabilityCountAggregateOutputType> | number;
                };
            };
        };
        TestPlan: {
            payload: Prisma.$TestPlanPayload<ExtArgs>;
            fields: Prisma.TestPlanFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TestPlanFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPlanPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TestPlanFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPlanPayload>;
                };
                findFirst: {
                    args: Prisma.TestPlanFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPlanPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TestPlanFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPlanPayload>;
                };
                findMany: {
                    args: Prisma.TestPlanFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPlanPayload>[];
                };
                create: {
                    args: Prisma.TestPlanCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPlanPayload>;
                };
                createMany: {
                    args: Prisma.TestPlanCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TestPlanCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPlanPayload>[];
                };
                delete: {
                    args: Prisma.TestPlanDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPlanPayload>;
                };
                update: {
                    args: Prisma.TestPlanUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPlanPayload>;
                };
                deleteMany: {
                    args: Prisma.TestPlanDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TestPlanUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TestPlanUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPlanPayload>[];
                };
                upsert: {
                    args: Prisma.TestPlanUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPlanPayload>;
                };
                aggregate: {
                    args: Prisma.TestPlanAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTestPlan>;
                };
                groupBy: {
                    args: Prisma.TestPlanGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TestPlanGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TestPlanCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TestPlanCountAggregateOutputType> | number;
                };
            };
        };
        Test: {
            payload: Prisma.$TestPayload<ExtArgs>;
            fields: Prisma.TestFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TestFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TestFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPayload>;
                };
                findFirst: {
                    args: Prisma.TestFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TestFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPayload>;
                };
                findMany: {
                    args: Prisma.TestFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPayload>[];
                };
                create: {
                    args: Prisma.TestCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPayload>;
                };
                createMany: {
                    args: Prisma.TestCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TestCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPayload>[];
                };
                delete: {
                    args: Prisma.TestDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPayload>;
                };
                update: {
                    args: Prisma.TestUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPayload>;
                };
                deleteMany: {
                    args: Prisma.TestDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TestUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TestUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPayload>[];
                };
                upsert: {
                    args: Prisma.TestUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestPayload>;
                };
                aggregate: {
                    args: Prisma.TestAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTest>;
                };
                groupBy: {
                    args: Prisma.TestGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TestGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TestCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TestCountAggregateOutputType> | number;
                };
            };
        };
        ControlTest: {
            payload: Prisma.$ControlTestPayload<ExtArgs>;
            fields: Prisma.ControlTestFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ControlTestFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlTestPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ControlTestFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlTestPayload>;
                };
                findFirst: {
                    args: Prisma.ControlTestFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlTestPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ControlTestFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlTestPayload>;
                };
                findMany: {
                    args: Prisma.ControlTestFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlTestPayload>[];
                };
                create: {
                    args: Prisma.ControlTestCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlTestPayload>;
                };
                createMany: {
                    args: Prisma.ControlTestCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ControlTestCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlTestPayload>[];
                };
                delete: {
                    args: Prisma.ControlTestDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlTestPayload>;
                };
                update: {
                    args: Prisma.ControlTestUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlTestPayload>;
                };
                deleteMany: {
                    args: Prisma.ControlTestDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ControlTestUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ControlTestUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlTestPayload>[];
                };
                upsert: {
                    args: Prisma.ControlTestUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ControlTestPayload>;
                };
                aggregate: {
                    args: Prisma.ControlTestAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateControlTest>;
                };
                groupBy: {
                    args: Prisma.ControlTestGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ControlTestGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ControlTestCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ControlTestCountAggregateOutputType> | number;
                };
            };
        };
        Check: {
            payload: Prisma.$CheckPayload<ExtArgs>;
            fields: Prisma.CheckFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CheckFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CheckFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckPayload>;
                };
                findFirst: {
                    args: Prisma.CheckFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CheckFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckPayload>;
                };
                findMany: {
                    args: Prisma.CheckFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckPayload>[];
                };
                create: {
                    args: Prisma.CheckCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckPayload>;
                };
                createMany: {
                    args: Prisma.CheckCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CheckCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckPayload>[];
                };
                delete: {
                    args: Prisma.CheckDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckPayload>;
                };
                update: {
                    args: Prisma.CheckUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckPayload>;
                };
                deleteMany: {
                    args: Prisma.CheckDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CheckUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CheckUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckPayload>[];
                };
                upsert: {
                    args: Prisma.CheckUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckPayload>;
                };
                aggregate: {
                    args: Prisma.CheckAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCheck>;
                };
                groupBy: {
                    args: Prisma.CheckGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CheckGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CheckCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CheckCountAggregateOutputType> | number;
                };
            };
        };
        TestCheck: {
            payload: Prisma.$TestCheckPayload<ExtArgs>;
            fields: Prisma.TestCheckFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TestCheckFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestCheckPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TestCheckFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestCheckPayload>;
                };
                findFirst: {
                    args: Prisma.TestCheckFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestCheckPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TestCheckFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestCheckPayload>;
                };
                findMany: {
                    args: Prisma.TestCheckFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestCheckPayload>[];
                };
                create: {
                    args: Prisma.TestCheckCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestCheckPayload>;
                };
                createMany: {
                    args: Prisma.TestCheckCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TestCheckCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestCheckPayload>[];
                };
                delete: {
                    args: Prisma.TestCheckDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestCheckPayload>;
                };
                update: {
                    args: Prisma.TestCheckUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestCheckPayload>;
                };
                deleteMany: {
                    args: Prisma.TestCheckDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TestCheckUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TestCheckUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestCheckPayload>[];
                };
                upsert: {
                    args: Prisma.TestCheckUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TestCheckPayload>;
                };
                aggregate: {
                    args: Prisma.TestCheckAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTestCheck>;
                };
                groupBy: {
                    args: Prisma.TestCheckGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TestCheckGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TestCheckCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TestCheckCountAggregateOutputType> | number;
                };
            };
        };
        CheckMapping: {
            payload: Prisma.$CheckMappingPayload<ExtArgs>;
            fields: Prisma.CheckMappingFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CheckMappingFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckMappingPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CheckMappingFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckMappingPayload>;
                };
                findFirst: {
                    args: Prisma.CheckMappingFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckMappingPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CheckMappingFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckMappingPayload>;
                };
                findMany: {
                    args: Prisma.CheckMappingFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckMappingPayload>[];
                };
                create: {
                    args: Prisma.CheckMappingCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckMappingPayload>;
                };
                createMany: {
                    args: Prisma.CheckMappingCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CheckMappingCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckMappingPayload>[];
                };
                delete: {
                    args: Prisma.CheckMappingDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckMappingPayload>;
                };
                update: {
                    args: Prisma.CheckMappingUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckMappingPayload>;
                };
                deleteMany: {
                    args: Prisma.CheckMappingDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CheckMappingUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CheckMappingUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckMappingPayload>[];
                };
                upsert: {
                    args: Prisma.CheckMappingUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckMappingPayload>;
                };
                aggregate: {
                    args: Prisma.CheckMappingAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCheckMapping>;
                };
                groupBy: {
                    args: Prisma.CheckMappingGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CheckMappingGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CheckMappingCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CheckMappingCountAggregateOutputType> | number;
                };
            };
        };
        ScaPolicy: {
            payload: Prisma.$ScaPolicyPayload<ExtArgs>;
            fields: Prisma.ScaPolicyFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ScaPolicyFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScaPolicyPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ScaPolicyFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScaPolicyPayload>;
                };
                findFirst: {
                    args: Prisma.ScaPolicyFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScaPolicyPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ScaPolicyFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScaPolicyPayload>;
                };
                findMany: {
                    args: Prisma.ScaPolicyFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScaPolicyPayload>[];
                };
                create: {
                    args: Prisma.ScaPolicyCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScaPolicyPayload>;
                };
                createMany: {
                    args: Prisma.ScaPolicyCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ScaPolicyCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScaPolicyPayload>[];
                };
                delete: {
                    args: Prisma.ScaPolicyDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScaPolicyPayload>;
                };
                update: {
                    args: Prisma.ScaPolicyUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScaPolicyPayload>;
                };
                deleteMany: {
                    args: Prisma.ScaPolicyDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ScaPolicyUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ScaPolicyUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScaPolicyPayload>[];
                };
                upsert: {
                    args: Prisma.ScaPolicyUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScaPolicyPayload>;
                };
                aggregate: {
                    args: Prisma.ScaPolicyAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateScaPolicy>;
                };
                groupBy: {
                    args: Prisma.ScaPolicyGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ScaPolicyGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ScaPolicyCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ScaPolicyCountAggregateOutputType> | number;
                };
            };
        };
        CatalogVersion: {
            payload: Prisma.$CatalogVersionPayload<ExtArgs>;
            fields: Prisma.CatalogVersionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CatalogVersionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CatalogVersionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CatalogVersionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CatalogVersionPayload>;
                };
                findFirst: {
                    args: Prisma.CatalogVersionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CatalogVersionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CatalogVersionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CatalogVersionPayload>;
                };
                findMany: {
                    args: Prisma.CatalogVersionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CatalogVersionPayload>[];
                };
                create: {
                    args: Prisma.CatalogVersionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CatalogVersionPayload>;
                };
                createMany: {
                    args: Prisma.CatalogVersionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CatalogVersionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CatalogVersionPayload>[];
                };
                delete: {
                    args: Prisma.CatalogVersionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CatalogVersionPayload>;
                };
                update: {
                    args: Prisma.CatalogVersionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CatalogVersionPayload>;
                };
                deleteMany: {
                    args: Prisma.CatalogVersionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CatalogVersionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CatalogVersionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CatalogVersionPayload>[];
                };
                upsert: {
                    args: Prisma.CatalogVersionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CatalogVersionPayload>;
                };
                aggregate: {
                    args: Prisma.CatalogVersionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCatalogVersion>;
                };
                groupBy: {
                    args: Prisma.CatalogVersionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CatalogVersionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CatalogVersionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CatalogVersionCountAggregateOutputType> | number;
                };
            };
        };
        Company: {
            payload: Prisma.$CompanyPayload<ExtArgs>;
            fields: Prisma.CompanyFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CompanyFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CompanyFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>;
                };
                findFirst: {
                    args: Prisma.CompanyFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CompanyFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>;
                };
                findMany: {
                    args: Prisma.CompanyFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>[];
                };
                create: {
                    args: Prisma.CompanyCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>;
                };
                createMany: {
                    args: Prisma.CompanyCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CompanyCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>[];
                };
                delete: {
                    args: Prisma.CompanyDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>;
                };
                update: {
                    args: Prisma.CompanyUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>;
                };
                deleteMany: {
                    args: Prisma.CompanyDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CompanyUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CompanyUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>[];
                };
                upsert: {
                    args: Prisma.CompanyUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>;
                };
                aggregate: {
                    args: Prisma.CompanyAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCompany>;
                };
                groupBy: {
                    args: Prisma.CompanyGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CompanyGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CompanyCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CompanyCountAggregateOutputType> | number;
                };
            };
        };
        AccessKey: {
            payload: Prisma.$AccessKeyPayload<ExtArgs>;
            fields: Prisma.AccessKeyFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AccessKeyFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AccessKeyPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AccessKeyFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AccessKeyPayload>;
                };
                findFirst: {
                    args: Prisma.AccessKeyFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AccessKeyPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AccessKeyFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AccessKeyPayload>;
                };
                findMany: {
                    args: Prisma.AccessKeyFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AccessKeyPayload>[];
                };
                create: {
                    args: Prisma.AccessKeyCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AccessKeyPayload>;
                };
                createMany: {
                    args: Prisma.AccessKeyCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AccessKeyCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AccessKeyPayload>[];
                };
                delete: {
                    args: Prisma.AccessKeyDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AccessKeyPayload>;
                };
                update: {
                    args: Prisma.AccessKeyUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AccessKeyPayload>;
                };
                deleteMany: {
                    args: Prisma.AccessKeyDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AccessKeyUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AccessKeyUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AccessKeyPayload>[];
                };
                upsert: {
                    args: Prisma.AccessKeyUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AccessKeyPayload>;
                };
                aggregate: {
                    args: Prisma.AccessKeyAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAccessKey>;
                };
                groupBy: {
                    args: Prisma.AccessKeyGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AccessKeyGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AccessKeyCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AccessKeyCountAggregateOutputType> | number;
                };
            };
        };
        User: {
            payload: Prisma.$UserPayload<ExtArgs>;
            fields: Prisma.UserFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findFirst: {
                    args: Prisma.UserFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findMany: {
                    args: Prisma.UserFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                create: {
                    args: Prisma.UserCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                createMany: {
                    args: Prisma.UserCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                delete: {
                    args: Prisma.UserDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                update: {
                    args: Prisma.UserUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                deleteMany: {
                    args: Prisma.UserDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                upsert: {
                    args: Prisma.UserUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                aggregate: {
                    args: Prisma.UserAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUser>;
                };
                groupBy: {
                    args: Prisma.UserGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserCountAggregateOutputType> | number;
                };
            };
        };
        CustomRole: {
            payload: Prisma.$CustomRolePayload<ExtArgs>;
            fields: Prisma.CustomRoleFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CustomRoleFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomRolePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CustomRoleFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomRolePayload>;
                };
                findFirst: {
                    args: Prisma.CustomRoleFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomRolePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CustomRoleFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomRolePayload>;
                };
                findMany: {
                    args: Prisma.CustomRoleFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomRolePayload>[];
                };
                create: {
                    args: Prisma.CustomRoleCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomRolePayload>;
                };
                createMany: {
                    args: Prisma.CustomRoleCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CustomRoleCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomRolePayload>[];
                };
                delete: {
                    args: Prisma.CustomRoleDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomRolePayload>;
                };
                update: {
                    args: Prisma.CustomRoleUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomRolePayload>;
                };
                deleteMany: {
                    args: Prisma.CustomRoleDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CustomRoleUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CustomRoleUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomRolePayload>[];
                };
                upsert: {
                    args: Prisma.CustomRoleUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomRolePayload>;
                };
                aggregate: {
                    args: Prisma.CustomRoleAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCustomRole>;
                };
                groupBy: {
                    args: Prisma.CustomRoleGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CustomRoleGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CustomRoleCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CustomRoleCountAggregateOutputType> | number;
                };
            };
        };
        UserControlAssignment: {
            payload: Prisma.$UserControlAssignmentPayload<ExtArgs>;
            fields: Prisma.UserControlAssignmentFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserControlAssignmentFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserControlAssignmentPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserControlAssignmentFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserControlAssignmentPayload>;
                };
                findFirst: {
                    args: Prisma.UserControlAssignmentFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserControlAssignmentPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserControlAssignmentFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserControlAssignmentPayload>;
                };
                findMany: {
                    args: Prisma.UserControlAssignmentFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserControlAssignmentPayload>[];
                };
                create: {
                    args: Prisma.UserControlAssignmentCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserControlAssignmentPayload>;
                };
                createMany: {
                    args: Prisma.UserControlAssignmentCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserControlAssignmentCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserControlAssignmentPayload>[];
                };
                delete: {
                    args: Prisma.UserControlAssignmentDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserControlAssignmentPayload>;
                };
                update: {
                    args: Prisma.UserControlAssignmentUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserControlAssignmentPayload>;
                };
                deleteMany: {
                    args: Prisma.UserControlAssignmentDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserControlAssignmentUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserControlAssignmentUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserControlAssignmentPayload>[];
                };
                upsert: {
                    args: Prisma.UserControlAssignmentUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserControlAssignmentPayload>;
                };
                aggregate: {
                    args: Prisma.UserControlAssignmentAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUserControlAssignment>;
                };
                groupBy: {
                    args: Prisma.UserControlAssignmentGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserControlAssignmentGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserControlAssignmentCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserControlAssignmentCountAggregateOutputType> | number;
                };
            };
        };
        AuditorAssignment: {
            payload: Prisma.$AuditorAssignmentPayload<ExtArgs>;
            fields: Prisma.AuditorAssignmentFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AuditorAssignmentFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditorAssignmentPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AuditorAssignmentFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditorAssignmentPayload>;
                };
                findFirst: {
                    args: Prisma.AuditorAssignmentFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditorAssignmentPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AuditorAssignmentFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditorAssignmentPayload>;
                };
                findMany: {
                    args: Prisma.AuditorAssignmentFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditorAssignmentPayload>[];
                };
                create: {
                    args: Prisma.AuditorAssignmentCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditorAssignmentPayload>;
                };
                createMany: {
                    args: Prisma.AuditorAssignmentCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AuditorAssignmentCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditorAssignmentPayload>[];
                };
                delete: {
                    args: Prisma.AuditorAssignmentDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditorAssignmentPayload>;
                };
                update: {
                    args: Prisma.AuditorAssignmentUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditorAssignmentPayload>;
                };
                deleteMany: {
                    args: Prisma.AuditorAssignmentDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AuditorAssignmentUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AuditorAssignmentUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditorAssignmentPayload>[];
                };
                upsert: {
                    args: Prisma.AuditorAssignmentUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditorAssignmentPayload>;
                };
                aggregate: {
                    args: Prisma.AuditorAssignmentAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAuditorAssignment>;
                };
                groupBy: {
                    args: Prisma.AuditorAssignmentGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AuditorAssignmentGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AuditorAssignmentCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AuditorAssignmentCountAggregateOutputType> | number;
                };
            };
        };
        Session: {
            payload: Prisma.$SessionPayload<ExtArgs>;
            fields: Prisma.SessionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SessionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SessionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>;
                };
                findFirst: {
                    args: Prisma.SessionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SessionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>;
                };
                findMany: {
                    args: Prisma.SessionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>[];
                };
                create: {
                    args: Prisma.SessionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>;
                };
                createMany: {
                    args: Prisma.SessionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SessionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>[];
                };
                delete: {
                    args: Prisma.SessionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>;
                };
                update: {
                    args: Prisma.SessionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>;
                };
                deleteMany: {
                    args: Prisma.SessionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SessionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SessionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>[];
                };
                upsert: {
                    args: Prisma.SessionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>;
                };
                aggregate: {
                    args: Prisma.SessionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSession>;
                };
                groupBy: {
                    args: Prisma.SessionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SessionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SessionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SessionCountAggregateOutputType> | number;
                };
            };
        };
        ApiKey: {
            payload: Prisma.$ApiKeyPayload<ExtArgs>;
            fields: Prisma.ApiKeyFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ApiKeyFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ApiKeyFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>;
                };
                findFirst: {
                    args: Prisma.ApiKeyFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ApiKeyFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>;
                };
                findMany: {
                    args: Prisma.ApiKeyFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>[];
                };
                create: {
                    args: Prisma.ApiKeyCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>;
                };
                createMany: {
                    args: Prisma.ApiKeyCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ApiKeyCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>[];
                };
                delete: {
                    args: Prisma.ApiKeyDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>;
                };
                update: {
                    args: Prisma.ApiKeyUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>;
                };
                deleteMany: {
                    args: Prisma.ApiKeyDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ApiKeyUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ApiKeyUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>[];
                };
                upsert: {
                    args: Prisma.ApiKeyUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApiKeyPayload>;
                };
                aggregate: {
                    args: Prisma.ApiKeyAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateApiKey>;
                };
                groupBy: {
                    args: Prisma.ApiKeyGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApiKeyGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ApiKeyCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApiKeyCountAggregateOutputType> | number;
                };
            };
        };
        ClientControl: {
            payload: Prisma.$ClientControlPayload<ExtArgs>;
            fields: Prisma.ClientControlFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ClientControlFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ClientControlFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlPayload>;
                };
                findFirst: {
                    args: Prisma.ClientControlFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ClientControlFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlPayload>;
                };
                findMany: {
                    args: Prisma.ClientControlFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlPayload>[];
                };
                create: {
                    args: Prisma.ClientControlCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlPayload>;
                };
                createMany: {
                    args: Prisma.ClientControlCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ClientControlCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlPayload>[];
                };
                delete: {
                    args: Prisma.ClientControlDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlPayload>;
                };
                update: {
                    args: Prisma.ClientControlUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlPayload>;
                };
                deleteMany: {
                    args: Prisma.ClientControlDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ClientControlUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ClientControlUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlPayload>[];
                };
                upsert: {
                    args: Prisma.ClientControlUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlPayload>;
                };
                aggregate: {
                    args: Prisma.ClientControlAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateClientControl>;
                };
                groupBy: {
                    args: Prisma.ClientControlGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientControlGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ClientControlCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientControlCountAggregateOutputType> | number;
                };
            };
        };
        ActionPlan: {
            payload: Prisma.$ActionPlanPayload<ExtArgs>;
            fields: Prisma.ActionPlanFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ActionPlanFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionPlanPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ActionPlanFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionPlanPayload>;
                };
                findFirst: {
                    args: Prisma.ActionPlanFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionPlanPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ActionPlanFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionPlanPayload>;
                };
                findMany: {
                    args: Prisma.ActionPlanFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionPlanPayload>[];
                };
                create: {
                    args: Prisma.ActionPlanCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionPlanPayload>;
                };
                createMany: {
                    args: Prisma.ActionPlanCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ActionPlanCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionPlanPayload>[];
                };
                delete: {
                    args: Prisma.ActionPlanDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionPlanPayload>;
                };
                update: {
                    args: Prisma.ActionPlanUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionPlanPayload>;
                };
                deleteMany: {
                    args: Prisma.ActionPlanDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ActionPlanUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ActionPlanUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionPlanPayload>[];
                };
                upsert: {
                    args: Prisma.ActionPlanUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionPlanPayload>;
                };
                aggregate: {
                    args: Prisma.ActionPlanAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateActionPlan>;
                };
                groupBy: {
                    args: Prisma.ActionPlanGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ActionPlanGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ActionPlanCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ActionPlanCountAggregateOutputType> | number;
                };
            };
        };
        Mitigation: {
            payload: Prisma.$MitigationPayload<ExtArgs>;
            fields: Prisma.MitigationFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MitigationFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MitigationPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MitigationFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MitigationPayload>;
                };
                findFirst: {
                    args: Prisma.MitigationFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MitigationPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MitigationFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MitigationPayload>;
                };
                findMany: {
                    args: Prisma.MitigationFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MitigationPayload>[];
                };
                create: {
                    args: Prisma.MitigationCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MitigationPayload>;
                };
                createMany: {
                    args: Prisma.MitigationCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MitigationCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MitigationPayload>[];
                };
                delete: {
                    args: Prisma.MitigationDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MitigationPayload>;
                };
                update: {
                    args: Prisma.MitigationUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MitigationPayload>;
                };
                deleteMany: {
                    args: Prisma.MitigationDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MitigationUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MitigationUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MitigationPayload>[];
                };
                upsert: {
                    args: Prisma.MitigationUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MitigationPayload>;
                };
                aggregate: {
                    args: Prisma.MitigationAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMitigation>;
                };
                groupBy: {
                    args: Prisma.MitigationGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MitigationGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MitigationCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MitigationCountAggregateOutputType> | number;
                };
            };
        };
        ResidualRisk: {
            payload: Prisma.$ResidualRiskPayload<ExtArgs>;
            fields: Prisma.ResidualRiskFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ResidualRiskFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ResidualRiskPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ResidualRiskFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ResidualRiskPayload>;
                };
                findFirst: {
                    args: Prisma.ResidualRiskFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ResidualRiskPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ResidualRiskFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ResidualRiskPayload>;
                };
                findMany: {
                    args: Prisma.ResidualRiskFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ResidualRiskPayload>[];
                };
                create: {
                    args: Prisma.ResidualRiskCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ResidualRiskPayload>;
                };
                createMany: {
                    args: Prisma.ResidualRiskCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ResidualRiskCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ResidualRiskPayload>[];
                };
                delete: {
                    args: Prisma.ResidualRiskDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ResidualRiskPayload>;
                };
                update: {
                    args: Prisma.ResidualRiskUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ResidualRiskPayload>;
                };
                deleteMany: {
                    args: Prisma.ResidualRiskDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ResidualRiskUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ResidualRiskUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ResidualRiskPayload>[];
                };
                upsert: {
                    args: Prisma.ResidualRiskUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ResidualRiskPayload>;
                };
                aggregate: {
                    args: Prisma.ResidualRiskAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateResidualRisk>;
                };
                groupBy: {
                    args: Prisma.ResidualRiskGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ResidualRiskGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ResidualRiskCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ResidualRiskCountAggregateOutputType> | number;
                };
            };
        };
        RiskTreatment: {
            payload: Prisma.$RiskTreatmentPayload<ExtArgs>;
            fields: Prisma.RiskTreatmentFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RiskTreatmentFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskTreatmentPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RiskTreatmentFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskTreatmentPayload>;
                };
                findFirst: {
                    args: Prisma.RiskTreatmentFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskTreatmentPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RiskTreatmentFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskTreatmentPayload>;
                };
                findMany: {
                    args: Prisma.RiskTreatmentFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskTreatmentPayload>[];
                };
                create: {
                    args: Prisma.RiskTreatmentCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskTreatmentPayload>;
                };
                createMany: {
                    args: Prisma.RiskTreatmentCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RiskTreatmentCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskTreatmentPayload>[];
                };
                delete: {
                    args: Prisma.RiskTreatmentDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskTreatmentPayload>;
                };
                update: {
                    args: Prisma.RiskTreatmentUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskTreatmentPayload>;
                };
                deleteMany: {
                    args: Prisma.RiskTreatmentDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RiskTreatmentUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RiskTreatmentUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskTreatmentPayload>[];
                };
                upsert: {
                    args: Prisma.RiskTreatmentUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RiskTreatmentPayload>;
                };
                aggregate: {
                    args: Prisma.RiskTreatmentAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRiskTreatment>;
                };
                groupBy: {
                    args: Prisma.RiskTreatmentGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RiskTreatmentGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RiskTreatmentCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RiskTreatmentCountAggregateOutputType> | number;
                };
            };
        };
        EvidenceRequirement: {
            payload: Prisma.$EvidenceRequirementPayload<ExtArgs>;
            fields: Prisma.EvidenceRequirementFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.EvidenceRequirementFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceRequirementPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.EvidenceRequirementFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceRequirementPayload>;
                };
                findFirst: {
                    args: Prisma.EvidenceRequirementFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceRequirementPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.EvidenceRequirementFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceRequirementPayload>;
                };
                findMany: {
                    args: Prisma.EvidenceRequirementFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceRequirementPayload>[];
                };
                create: {
                    args: Prisma.EvidenceRequirementCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceRequirementPayload>;
                };
                createMany: {
                    args: Prisma.EvidenceRequirementCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.EvidenceRequirementCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceRequirementPayload>[];
                };
                delete: {
                    args: Prisma.EvidenceRequirementDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceRequirementPayload>;
                };
                update: {
                    args: Prisma.EvidenceRequirementUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceRequirementPayload>;
                };
                deleteMany: {
                    args: Prisma.EvidenceRequirementDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.EvidenceRequirementUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.EvidenceRequirementUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceRequirementPayload>[];
                };
                upsert: {
                    args: Prisma.EvidenceRequirementUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceRequirementPayload>;
                };
                aggregate: {
                    args: Prisma.EvidenceRequirementAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateEvidenceRequirement>;
                };
                groupBy: {
                    args: Prisma.EvidenceRequirementGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EvidenceRequirementGroupByOutputType>[];
                };
                count: {
                    args: Prisma.EvidenceRequirementCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EvidenceRequirementCountAggregateOutputType> | number;
                };
            };
        };
        EvidenceSubmission: {
            payload: Prisma.$EvidenceSubmissionPayload<ExtArgs>;
            fields: Prisma.EvidenceSubmissionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.EvidenceSubmissionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceSubmissionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.EvidenceSubmissionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceSubmissionPayload>;
                };
                findFirst: {
                    args: Prisma.EvidenceSubmissionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceSubmissionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.EvidenceSubmissionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceSubmissionPayload>;
                };
                findMany: {
                    args: Prisma.EvidenceSubmissionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceSubmissionPayload>[];
                };
                create: {
                    args: Prisma.EvidenceSubmissionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceSubmissionPayload>;
                };
                createMany: {
                    args: Prisma.EvidenceSubmissionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.EvidenceSubmissionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceSubmissionPayload>[];
                };
                delete: {
                    args: Prisma.EvidenceSubmissionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceSubmissionPayload>;
                };
                update: {
                    args: Prisma.EvidenceSubmissionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceSubmissionPayload>;
                };
                deleteMany: {
                    args: Prisma.EvidenceSubmissionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.EvidenceSubmissionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.EvidenceSubmissionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceSubmissionPayload>[];
                };
                upsert: {
                    args: Prisma.EvidenceSubmissionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvidenceSubmissionPayload>;
                };
                aggregate: {
                    args: Prisma.EvidenceSubmissionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateEvidenceSubmission>;
                };
                groupBy: {
                    args: Prisma.EvidenceSubmissionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EvidenceSubmissionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.EvidenceSubmissionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EvidenceSubmissionCountAggregateOutputType> | number;
                };
            };
        };
        Exclusion: {
            payload: Prisma.$ExclusionPayload<ExtArgs>;
            fields: Prisma.ExclusionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ExclusionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExclusionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ExclusionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExclusionPayload>;
                };
                findFirst: {
                    args: Prisma.ExclusionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExclusionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ExclusionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExclusionPayload>;
                };
                findMany: {
                    args: Prisma.ExclusionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExclusionPayload>[];
                };
                create: {
                    args: Prisma.ExclusionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExclusionPayload>;
                };
                createMany: {
                    args: Prisma.ExclusionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ExclusionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExclusionPayload>[];
                };
                delete: {
                    args: Prisma.ExclusionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExclusionPayload>;
                };
                update: {
                    args: Prisma.ExclusionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExclusionPayload>;
                };
                deleteMany: {
                    args: Prisma.ExclusionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ExclusionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ExclusionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExclusionPayload>[];
                };
                upsert: {
                    args: Prisma.ExclusionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExclusionPayload>;
                };
                aggregate: {
                    args: Prisma.ExclusionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateExclusion>;
                };
                groupBy: {
                    args: Prisma.ExclusionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ExclusionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ExclusionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ExclusionCountAggregateOutputType> | number;
                };
            };
        };
        Evaluation: {
            payload: Prisma.$EvaluationPayload<ExtArgs>;
            fields: Prisma.EvaluationFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.EvaluationFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvaluationPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.EvaluationFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvaluationPayload>;
                };
                findFirst: {
                    args: Prisma.EvaluationFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvaluationPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.EvaluationFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvaluationPayload>;
                };
                findMany: {
                    args: Prisma.EvaluationFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvaluationPayload>[];
                };
                create: {
                    args: Prisma.EvaluationCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvaluationPayload>;
                };
                createMany: {
                    args: Prisma.EvaluationCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.EvaluationCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvaluationPayload>[];
                };
                delete: {
                    args: Prisma.EvaluationDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvaluationPayload>;
                };
                update: {
                    args: Prisma.EvaluationUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvaluationPayload>;
                };
                deleteMany: {
                    args: Prisma.EvaluationDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.EvaluationUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.EvaluationUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvaluationPayload>[];
                };
                upsert: {
                    args: Prisma.EvaluationUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EvaluationPayload>;
                };
                aggregate: {
                    args: Prisma.EvaluationAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateEvaluation>;
                };
                groupBy: {
                    args: Prisma.EvaluationGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EvaluationGroupByOutputType>[];
                };
                count: {
                    args: Prisma.EvaluationCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EvaluationCountAggregateOutputType> | number;
                };
            };
        };
        Finding: {
            payload: Prisma.$FindingPayload<ExtArgs>;
            fields: Prisma.FindingFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.FindingFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FindingPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.FindingFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FindingPayload>;
                };
                findFirst: {
                    args: Prisma.FindingFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FindingPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.FindingFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FindingPayload>;
                };
                findMany: {
                    args: Prisma.FindingFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FindingPayload>[];
                };
                create: {
                    args: Prisma.FindingCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FindingPayload>;
                };
                createMany: {
                    args: Prisma.FindingCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.FindingCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FindingPayload>[];
                };
                delete: {
                    args: Prisma.FindingDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FindingPayload>;
                };
                update: {
                    args: Prisma.FindingUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FindingPayload>;
                };
                deleteMany: {
                    args: Prisma.FindingDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.FindingUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.FindingUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FindingPayload>[];
                };
                upsert: {
                    args: Prisma.FindingUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FindingPayload>;
                };
                aggregate: {
                    args: Prisma.FindingAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateFinding>;
                };
                groupBy: {
                    args: Prisma.FindingGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.FindingGroupByOutputType>[];
                };
                count: {
                    args: Prisma.FindingCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.FindingCountAggregateOutputType> | number;
                };
            };
        };
        Vulnerability: {
            payload: Prisma.$VulnerabilityPayload<ExtArgs>;
            fields: Prisma.VulnerabilityFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.VulnerabilityFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VulnerabilityPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.VulnerabilityFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VulnerabilityPayload>;
                };
                findFirst: {
                    args: Prisma.VulnerabilityFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VulnerabilityPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.VulnerabilityFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VulnerabilityPayload>;
                };
                findMany: {
                    args: Prisma.VulnerabilityFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VulnerabilityPayload>[];
                };
                create: {
                    args: Prisma.VulnerabilityCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VulnerabilityPayload>;
                };
                createMany: {
                    args: Prisma.VulnerabilityCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.VulnerabilityCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VulnerabilityPayload>[];
                };
                delete: {
                    args: Prisma.VulnerabilityDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VulnerabilityPayload>;
                };
                update: {
                    args: Prisma.VulnerabilityUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VulnerabilityPayload>;
                };
                deleteMany: {
                    args: Prisma.VulnerabilityDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.VulnerabilityUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.VulnerabilityUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VulnerabilityPayload>[];
                };
                upsert: {
                    args: Prisma.VulnerabilityUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VulnerabilityPayload>;
                };
                aggregate: {
                    args: Prisma.VulnerabilityAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateVulnerability>;
                };
                groupBy: {
                    args: Prisma.VulnerabilityGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.VulnerabilityGroupByOutputType>[];
                };
                count: {
                    args: Prisma.VulnerabilityCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.VulnerabilityCountAggregateOutputType> | number;
                };
            };
        };
        ClientRisk: {
            payload: Prisma.$ClientRiskPayload<ExtArgs>;
            fields: Prisma.ClientRiskFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ClientRiskFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ClientRiskFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskPayload>;
                };
                findFirst: {
                    args: Prisma.ClientRiskFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ClientRiskFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskPayload>;
                };
                findMany: {
                    args: Prisma.ClientRiskFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskPayload>[];
                };
                create: {
                    args: Prisma.ClientRiskCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskPayload>;
                };
                createMany: {
                    args: Prisma.ClientRiskCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ClientRiskCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskPayload>[];
                };
                delete: {
                    args: Prisma.ClientRiskDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskPayload>;
                };
                update: {
                    args: Prisma.ClientRiskUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskPayload>;
                };
                deleteMany: {
                    args: Prisma.ClientRiskDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ClientRiskUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ClientRiskUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskPayload>[];
                };
                upsert: {
                    args: Prisma.ClientRiskUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskPayload>;
                };
                aggregate: {
                    args: Prisma.ClientRiskAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateClientRisk>;
                };
                groupBy: {
                    args: Prisma.ClientRiskGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientRiskGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ClientRiskCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientRiskCountAggregateOutputType> | number;
                };
            };
        };
        ClientCause: {
            payload: Prisma.$ClientCausePayload<ExtArgs>;
            fields: Prisma.ClientCauseFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ClientCauseFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCausePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ClientCauseFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCausePayload>;
                };
                findFirst: {
                    args: Prisma.ClientCauseFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCausePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ClientCauseFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCausePayload>;
                };
                findMany: {
                    args: Prisma.ClientCauseFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCausePayload>[];
                };
                create: {
                    args: Prisma.ClientCauseCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCausePayload>;
                };
                createMany: {
                    args: Prisma.ClientCauseCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ClientCauseCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCausePayload>[];
                };
                delete: {
                    args: Prisma.ClientCauseDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCausePayload>;
                };
                update: {
                    args: Prisma.ClientCauseUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCausePayload>;
                };
                deleteMany: {
                    args: Prisma.ClientCauseDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ClientCauseUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ClientCauseUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCausePayload>[];
                };
                upsert: {
                    args: Prisma.ClientCauseUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCausePayload>;
                };
                aggregate: {
                    args: Prisma.ClientCauseAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateClientCause>;
                };
                groupBy: {
                    args: Prisma.ClientCauseGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientCauseGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ClientCauseCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientCauseCountAggregateOutputType> | number;
                };
            };
        };
        ClientRiskCause: {
            payload: Prisma.$ClientRiskCausePayload<ExtArgs>;
            fields: Prisma.ClientRiskCauseFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ClientRiskCauseFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskCausePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ClientRiskCauseFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskCausePayload>;
                };
                findFirst: {
                    args: Prisma.ClientRiskCauseFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskCausePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ClientRiskCauseFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskCausePayload>;
                };
                findMany: {
                    args: Prisma.ClientRiskCauseFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskCausePayload>[];
                };
                create: {
                    args: Prisma.ClientRiskCauseCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskCausePayload>;
                };
                createMany: {
                    args: Prisma.ClientRiskCauseCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ClientRiskCauseCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskCausePayload>[];
                };
                delete: {
                    args: Prisma.ClientRiskCauseDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskCausePayload>;
                };
                update: {
                    args: Prisma.ClientRiskCauseUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskCausePayload>;
                };
                deleteMany: {
                    args: Prisma.ClientRiskCauseDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ClientRiskCauseUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ClientRiskCauseUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskCausePayload>[];
                };
                upsert: {
                    args: Prisma.ClientRiskCauseUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientRiskCausePayload>;
                };
                aggregate: {
                    args: Prisma.ClientRiskCauseAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateClientRiskCause>;
                };
                groupBy: {
                    args: Prisma.ClientRiskCauseGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientRiskCauseGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ClientRiskCauseCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientRiskCauseCountAggregateOutputType> | number;
                };
            };
        };
        ClientCauseControl: {
            payload: Prisma.$ClientCauseControlPayload<ExtArgs>;
            fields: Prisma.ClientCauseControlFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ClientCauseControlFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCauseControlPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ClientCauseControlFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCauseControlPayload>;
                };
                findFirst: {
                    args: Prisma.ClientCauseControlFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCauseControlPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ClientCauseControlFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCauseControlPayload>;
                };
                findMany: {
                    args: Prisma.ClientCauseControlFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCauseControlPayload>[];
                };
                create: {
                    args: Prisma.ClientCauseControlCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCauseControlPayload>;
                };
                createMany: {
                    args: Prisma.ClientCauseControlCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ClientCauseControlCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCauseControlPayload>[];
                };
                delete: {
                    args: Prisma.ClientCauseControlDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCauseControlPayload>;
                };
                update: {
                    args: Prisma.ClientCauseControlUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCauseControlPayload>;
                };
                deleteMany: {
                    args: Prisma.ClientCauseControlDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ClientCauseControlUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ClientCauseControlUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCauseControlPayload>[];
                };
                upsert: {
                    args: Prisma.ClientCauseControlUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientCauseControlPayload>;
                };
                aggregate: {
                    args: Prisma.ClientCauseControlAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateClientCauseControl>;
                };
                groupBy: {
                    args: Prisma.ClientCauseControlGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientCauseControlGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ClientCauseControlCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientCauseControlCountAggregateOutputType> | number;
                };
            };
        };
        ClientControlDimension: {
            payload: Prisma.$ClientControlDimensionPayload<ExtArgs>;
            fields: Prisma.ClientControlDimensionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ClientControlDimensionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlDimensionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ClientControlDimensionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlDimensionPayload>;
                };
                findFirst: {
                    args: Prisma.ClientControlDimensionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlDimensionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ClientControlDimensionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlDimensionPayload>;
                };
                findMany: {
                    args: Prisma.ClientControlDimensionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlDimensionPayload>[];
                };
                create: {
                    args: Prisma.ClientControlDimensionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlDimensionPayload>;
                };
                createMany: {
                    args: Prisma.ClientControlDimensionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ClientControlDimensionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlDimensionPayload>[];
                };
                delete: {
                    args: Prisma.ClientControlDimensionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlDimensionPayload>;
                };
                update: {
                    args: Prisma.ClientControlDimensionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlDimensionPayload>;
                };
                deleteMany: {
                    args: Prisma.ClientControlDimensionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ClientControlDimensionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ClientControlDimensionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlDimensionPayload>[];
                };
                upsert: {
                    args: Prisma.ClientControlDimensionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlDimensionPayload>;
                };
                aggregate: {
                    args: Prisma.ClientControlDimensionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateClientControlDimension>;
                };
                groupBy: {
                    args: Prisma.ClientControlDimensionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientControlDimensionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ClientControlDimensionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientControlDimensionCountAggregateOutputType> | number;
                };
            };
        };
        ClientControlTest: {
            payload: Prisma.$ClientControlTestPayload<ExtArgs>;
            fields: Prisma.ClientControlTestFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ClientControlTestFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlTestPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ClientControlTestFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlTestPayload>;
                };
                findFirst: {
                    args: Prisma.ClientControlTestFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlTestPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ClientControlTestFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlTestPayload>;
                };
                findMany: {
                    args: Prisma.ClientControlTestFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlTestPayload>[];
                };
                create: {
                    args: Prisma.ClientControlTestCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlTestPayload>;
                };
                createMany: {
                    args: Prisma.ClientControlTestCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ClientControlTestCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlTestPayload>[];
                };
                delete: {
                    args: Prisma.ClientControlTestDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlTestPayload>;
                };
                update: {
                    args: Prisma.ClientControlTestUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlTestPayload>;
                };
                deleteMany: {
                    args: Prisma.ClientControlTestDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ClientControlTestUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ClientControlTestUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlTestPayload>[];
                };
                upsert: {
                    args: Prisma.ClientControlTestUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ClientControlTestPayload>;
                };
                aggregate: {
                    args: Prisma.ClientControlTestAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateClientControlTest>;
                };
                groupBy: {
                    args: Prisma.ClientControlTestGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientControlTestGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ClientControlTestCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ClientControlTestCountAggregateOutputType> | number;
                };
            };
        };
        Organization: {
            payload: Prisma.$OrganizationPayload<ExtArgs>;
            fields: Prisma.OrganizationFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.OrganizationFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.OrganizationFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationPayload>;
                };
                findFirst: {
                    args: Prisma.OrganizationFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.OrganizationFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationPayload>;
                };
                findMany: {
                    args: Prisma.OrganizationFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationPayload>[];
                };
                create: {
                    args: Prisma.OrganizationCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationPayload>;
                };
                createMany: {
                    args: Prisma.OrganizationCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.OrganizationCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationPayload>[];
                };
                delete: {
                    args: Prisma.OrganizationDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationPayload>;
                };
                update: {
                    args: Prisma.OrganizationUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationPayload>;
                };
                deleteMany: {
                    args: Prisma.OrganizationDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.OrganizationUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.OrganizationUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationPayload>[];
                };
                upsert: {
                    args: Prisma.OrganizationUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationPayload>;
                };
                aggregate: {
                    args: Prisma.OrganizationAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateOrganization>;
                };
                groupBy: {
                    args: Prisma.OrganizationGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OrganizationGroupByOutputType>[];
                };
                count: {
                    args: Prisma.OrganizationCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OrganizationCountAggregateOutputType> | number;
                };
            };
        };
        Regulation: {
            payload: Prisma.$RegulationPayload<ExtArgs>;
            fields: Prisma.RegulationFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RegulationFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RegulationPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RegulationFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RegulationPayload>;
                };
                findFirst: {
                    args: Prisma.RegulationFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RegulationPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RegulationFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RegulationPayload>;
                };
                findMany: {
                    args: Prisma.RegulationFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RegulationPayload>[];
                };
                create: {
                    args: Prisma.RegulationCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RegulationPayload>;
                };
                createMany: {
                    args: Prisma.RegulationCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RegulationCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RegulationPayload>[];
                };
                delete: {
                    args: Prisma.RegulationDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RegulationPayload>;
                };
                update: {
                    args: Prisma.RegulationUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RegulationPayload>;
                };
                deleteMany: {
                    args: Prisma.RegulationDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RegulationUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RegulationUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RegulationPayload>[];
                };
                upsert: {
                    args: Prisma.RegulationUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RegulationPayload>;
                };
                aggregate: {
                    args: Prisma.RegulationAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRegulation>;
                };
                groupBy: {
                    args: Prisma.RegulationGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RegulationGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RegulationCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RegulationCountAggregateOutputType> | number;
                };
            };
        };
        OrganizationRegulation: {
            payload: Prisma.$OrganizationRegulationPayload<ExtArgs>;
            fields: Prisma.OrganizationRegulationFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.OrganizationRegulationFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationRegulationPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.OrganizationRegulationFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationRegulationPayload>;
                };
                findFirst: {
                    args: Prisma.OrganizationRegulationFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationRegulationPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.OrganizationRegulationFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationRegulationPayload>;
                };
                findMany: {
                    args: Prisma.OrganizationRegulationFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationRegulationPayload>[];
                };
                create: {
                    args: Prisma.OrganizationRegulationCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationRegulationPayload>;
                };
                createMany: {
                    args: Prisma.OrganizationRegulationCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.OrganizationRegulationCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationRegulationPayload>[];
                };
                delete: {
                    args: Prisma.OrganizationRegulationDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationRegulationPayload>;
                };
                update: {
                    args: Prisma.OrganizationRegulationUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationRegulationPayload>;
                };
                deleteMany: {
                    args: Prisma.OrganizationRegulationDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.OrganizationRegulationUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.OrganizationRegulationUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationRegulationPayload>[];
                };
                upsert: {
                    args: Prisma.OrganizationRegulationUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationRegulationPayload>;
                };
                aggregate: {
                    args: Prisma.OrganizationRegulationAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateOrganizationRegulation>;
                };
                groupBy: {
                    args: Prisma.OrganizationRegulationGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OrganizationRegulationGroupByOutputType>[];
                };
                count: {
                    args: Prisma.OrganizationRegulationCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OrganizationRegulationCountAggregateOutputType> | number;
                };
            };
        };
        OrganizationResponsible: {
            payload: Prisma.$OrganizationResponsiblePayload<ExtArgs>;
            fields: Prisma.OrganizationResponsibleFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.OrganizationResponsibleFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationResponsiblePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.OrganizationResponsibleFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationResponsiblePayload>;
                };
                findFirst: {
                    args: Prisma.OrganizationResponsibleFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationResponsiblePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.OrganizationResponsibleFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationResponsiblePayload>;
                };
                findMany: {
                    args: Prisma.OrganizationResponsibleFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationResponsiblePayload>[];
                };
                create: {
                    args: Prisma.OrganizationResponsibleCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationResponsiblePayload>;
                };
                createMany: {
                    args: Prisma.OrganizationResponsibleCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.OrganizationResponsibleCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationResponsiblePayload>[];
                };
                delete: {
                    args: Prisma.OrganizationResponsibleDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationResponsiblePayload>;
                };
                update: {
                    args: Prisma.OrganizationResponsibleUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationResponsiblePayload>;
                };
                deleteMany: {
                    args: Prisma.OrganizationResponsibleDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.OrganizationResponsibleUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.OrganizationResponsibleUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationResponsiblePayload>[];
                };
                upsert: {
                    args: Prisma.OrganizationResponsibleUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrganizationResponsiblePayload>;
                };
                aggregate: {
                    args: Prisma.OrganizationResponsibleAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateOrganizationResponsible>;
                };
                groupBy: {
                    args: Prisma.OrganizationResponsibleGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OrganizationResponsibleGroupByOutputType>[];
                };
                count: {
                    args: Prisma.OrganizationResponsibleCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OrganizationResponsibleCountAggregateOutputType> | number;
                };
            };
        };
        Service: {
            payload: Prisma.$ServicePayload<ExtArgs>;
            fields: Prisma.ServiceFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ServiceFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServicePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ServiceFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServicePayload>;
                };
                findFirst: {
                    args: Prisma.ServiceFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServicePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ServiceFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServicePayload>;
                };
                findMany: {
                    args: Prisma.ServiceFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServicePayload>[];
                };
                create: {
                    args: Prisma.ServiceCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServicePayload>;
                };
                createMany: {
                    args: Prisma.ServiceCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ServiceCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServicePayload>[];
                };
                delete: {
                    args: Prisma.ServiceDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServicePayload>;
                };
                update: {
                    args: Prisma.ServiceUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServicePayload>;
                };
                deleteMany: {
                    args: Prisma.ServiceDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ServiceUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ServiceUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServicePayload>[];
                };
                upsert: {
                    args: Prisma.ServiceUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServicePayload>;
                };
                aggregate: {
                    args: Prisma.ServiceAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateService>;
                };
                groupBy: {
                    args: Prisma.ServiceGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ServiceGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ServiceCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ServiceCountAggregateOutputType> | number;
                };
            };
        };
        ServiceTrustCriterion: {
            payload: Prisma.$ServiceTrustCriterionPayload<ExtArgs>;
            fields: Prisma.ServiceTrustCriterionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ServiceTrustCriterionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceTrustCriterionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ServiceTrustCriterionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceTrustCriterionPayload>;
                };
                findFirst: {
                    args: Prisma.ServiceTrustCriterionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceTrustCriterionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ServiceTrustCriterionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceTrustCriterionPayload>;
                };
                findMany: {
                    args: Prisma.ServiceTrustCriterionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceTrustCriterionPayload>[];
                };
                create: {
                    args: Prisma.ServiceTrustCriterionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceTrustCriterionPayload>;
                };
                createMany: {
                    args: Prisma.ServiceTrustCriterionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ServiceTrustCriterionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceTrustCriterionPayload>[];
                };
                delete: {
                    args: Prisma.ServiceTrustCriterionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceTrustCriterionPayload>;
                };
                update: {
                    args: Prisma.ServiceTrustCriterionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceTrustCriterionPayload>;
                };
                deleteMany: {
                    args: Prisma.ServiceTrustCriterionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ServiceTrustCriterionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ServiceTrustCriterionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceTrustCriterionPayload>[];
                };
                upsert: {
                    args: Prisma.ServiceTrustCriterionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceTrustCriterionPayload>;
                };
                aggregate: {
                    args: Prisma.ServiceTrustCriterionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateServiceTrustCriterion>;
                };
                groupBy: {
                    args: Prisma.ServiceTrustCriterionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ServiceTrustCriterionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ServiceTrustCriterionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ServiceTrustCriterionCountAggregateOutputType> | number;
                };
            };
        };
        ServiceRegulation: {
            payload: Prisma.$ServiceRegulationPayload<ExtArgs>;
            fields: Prisma.ServiceRegulationFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ServiceRegulationFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceRegulationPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ServiceRegulationFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceRegulationPayload>;
                };
                findFirst: {
                    args: Prisma.ServiceRegulationFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceRegulationPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ServiceRegulationFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceRegulationPayload>;
                };
                findMany: {
                    args: Prisma.ServiceRegulationFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceRegulationPayload>[];
                };
                create: {
                    args: Prisma.ServiceRegulationCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceRegulationPayload>;
                };
                createMany: {
                    args: Prisma.ServiceRegulationCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ServiceRegulationCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceRegulationPayload>[];
                };
                delete: {
                    args: Prisma.ServiceRegulationDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceRegulationPayload>;
                };
                update: {
                    args: Prisma.ServiceRegulationUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceRegulationPayload>;
                };
                deleteMany: {
                    args: Prisma.ServiceRegulationDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ServiceRegulationUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ServiceRegulationUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceRegulationPayload>[];
                };
                upsert: {
                    args: Prisma.ServiceRegulationUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceRegulationPayload>;
                };
                aggregate: {
                    args: Prisma.ServiceRegulationAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateServiceRegulation>;
                };
                groupBy: {
                    args: Prisma.ServiceRegulationGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ServiceRegulationGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ServiceRegulationCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ServiceRegulationCountAggregateOutputType> | number;
                };
            };
        };
        ServiceFramework: {
            payload: Prisma.$ServiceFrameworkPayload<ExtArgs>;
            fields: Prisma.ServiceFrameworkFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ServiceFrameworkFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceFrameworkPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ServiceFrameworkFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceFrameworkPayload>;
                };
                findFirst: {
                    args: Prisma.ServiceFrameworkFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceFrameworkPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ServiceFrameworkFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceFrameworkPayload>;
                };
                findMany: {
                    args: Prisma.ServiceFrameworkFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceFrameworkPayload>[];
                };
                create: {
                    args: Prisma.ServiceFrameworkCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceFrameworkPayload>;
                };
                createMany: {
                    args: Prisma.ServiceFrameworkCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ServiceFrameworkCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceFrameworkPayload>[];
                };
                delete: {
                    args: Prisma.ServiceFrameworkDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceFrameworkPayload>;
                };
                update: {
                    args: Prisma.ServiceFrameworkUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceFrameworkPayload>;
                };
                deleteMany: {
                    args: Prisma.ServiceFrameworkDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ServiceFrameworkUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ServiceFrameworkUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceFrameworkPayload>[];
                };
                upsert: {
                    args: Prisma.ServiceFrameworkUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceFrameworkPayload>;
                };
                aggregate: {
                    args: Prisma.ServiceFrameworkAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateServiceFramework>;
                };
                groupBy: {
                    args: Prisma.ServiceFrameworkGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ServiceFrameworkGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ServiceFrameworkCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ServiceFrameworkCountAggregateOutputType> | number;
                };
            };
        };
        SubserviceOrganization: {
            payload: Prisma.$SubserviceOrganizationPayload<ExtArgs>;
            fields: Prisma.SubserviceOrganizationFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SubserviceOrganizationFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SubserviceOrganizationPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SubserviceOrganizationFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SubserviceOrganizationPayload>;
                };
                findFirst: {
                    args: Prisma.SubserviceOrganizationFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SubserviceOrganizationPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SubserviceOrganizationFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SubserviceOrganizationPayload>;
                };
                findMany: {
                    args: Prisma.SubserviceOrganizationFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SubserviceOrganizationPayload>[];
                };
                create: {
                    args: Prisma.SubserviceOrganizationCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SubserviceOrganizationPayload>;
                };
                createMany: {
                    args: Prisma.SubserviceOrganizationCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SubserviceOrganizationCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SubserviceOrganizationPayload>[];
                };
                delete: {
                    args: Prisma.SubserviceOrganizationDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SubserviceOrganizationPayload>;
                };
                update: {
                    args: Prisma.SubserviceOrganizationUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SubserviceOrganizationPayload>;
                };
                deleteMany: {
                    args: Prisma.SubserviceOrganizationDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SubserviceOrganizationUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SubserviceOrganizationUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SubserviceOrganizationPayload>[];
                };
                upsert: {
                    args: Prisma.SubserviceOrganizationUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SubserviceOrganizationPayload>;
                };
                aggregate: {
                    args: Prisma.SubserviceOrganizationAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSubserviceOrganization>;
                };
                groupBy: {
                    args: Prisma.SubserviceOrganizationGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SubserviceOrganizationGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SubserviceOrganizationCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SubserviceOrganizationCountAggregateOutputType> | number;
                };
            };
        };
        Csoc: {
            payload: Prisma.$CsocPayload<ExtArgs>;
            fields: Prisma.CsocFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CsocFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CsocPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CsocFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CsocPayload>;
                };
                findFirst: {
                    args: Prisma.CsocFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CsocPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CsocFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CsocPayload>;
                };
                findMany: {
                    args: Prisma.CsocFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CsocPayload>[];
                };
                create: {
                    args: Prisma.CsocCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CsocPayload>;
                };
                createMany: {
                    args: Prisma.CsocCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CsocCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CsocPayload>[];
                };
                delete: {
                    args: Prisma.CsocDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CsocPayload>;
                };
                update: {
                    args: Prisma.CsocUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CsocPayload>;
                };
                deleteMany: {
                    args: Prisma.CsocDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CsocUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CsocUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CsocPayload>[];
                };
                upsert: {
                    args: Prisma.CsocUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CsocPayload>;
                };
                aggregate: {
                    args: Prisma.CsocAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCsoc>;
                };
                groupBy: {
                    args: Prisma.CsocGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CsocGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CsocCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CsocCountAggregateOutputType> | number;
                };
            };
        };
        Cuec: {
            payload: Prisma.$CuecPayload<ExtArgs>;
            fields: Prisma.CuecFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CuecFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CuecPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CuecFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CuecPayload>;
                };
                findFirst: {
                    args: Prisma.CuecFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CuecPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CuecFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CuecPayload>;
                };
                findMany: {
                    args: Prisma.CuecFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CuecPayload>[];
                };
                create: {
                    args: Prisma.CuecCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CuecPayload>;
                };
                createMany: {
                    args: Prisma.CuecCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CuecCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CuecPayload>[];
                };
                delete: {
                    args: Prisma.CuecDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CuecPayload>;
                };
                update: {
                    args: Prisma.CuecUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CuecPayload>;
                };
                deleteMany: {
                    args: Prisma.CuecDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CuecUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CuecUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CuecPayload>[];
                };
                upsert: {
                    args: Prisma.CuecUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CuecPayload>;
                };
                aggregate: {
                    args: Prisma.CuecAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCuec>;
                };
                groupBy: {
                    args: Prisma.CuecGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CuecGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CuecCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CuecCountAggregateOutputType> | number;
                };
            };
        };
        SystemDescription: {
            payload: Prisma.$SystemDescriptionPayload<ExtArgs>;
            fields: Prisma.SystemDescriptionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SystemDescriptionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemDescriptionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SystemDescriptionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemDescriptionPayload>;
                };
                findFirst: {
                    args: Prisma.SystemDescriptionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemDescriptionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SystemDescriptionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemDescriptionPayload>;
                };
                findMany: {
                    args: Prisma.SystemDescriptionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemDescriptionPayload>[];
                };
                create: {
                    args: Prisma.SystemDescriptionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemDescriptionPayload>;
                };
                createMany: {
                    args: Prisma.SystemDescriptionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SystemDescriptionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemDescriptionPayload>[];
                };
                delete: {
                    args: Prisma.SystemDescriptionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemDescriptionPayload>;
                };
                update: {
                    args: Prisma.SystemDescriptionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemDescriptionPayload>;
                };
                deleteMany: {
                    args: Prisma.SystemDescriptionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SystemDescriptionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SystemDescriptionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemDescriptionPayload>[];
                };
                upsert: {
                    args: Prisma.SystemDescriptionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemDescriptionPayload>;
                };
                aggregate: {
                    args: Prisma.SystemDescriptionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSystemDescription>;
                };
                groupBy: {
                    args: Prisma.SystemDescriptionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SystemDescriptionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SystemDescriptionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SystemDescriptionCountAggregateOutputType> | number;
                };
            };
        };
        Scope: {
            payload: Prisma.$ScopePayload<ExtArgs>;
            fields: Prisma.ScopeFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ScopeFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScopePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ScopeFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScopePayload>;
                };
                findFirst: {
                    args: Prisma.ScopeFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScopePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ScopeFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScopePayload>;
                };
                findMany: {
                    args: Prisma.ScopeFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScopePayload>[];
                };
                create: {
                    args: Prisma.ScopeCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScopePayload>;
                };
                createMany: {
                    args: Prisma.ScopeCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ScopeCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScopePayload>[];
                };
                delete: {
                    args: Prisma.ScopeDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScopePayload>;
                };
                update: {
                    args: Prisma.ScopeUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScopePayload>;
                };
                deleteMany: {
                    args: Prisma.ScopeDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ScopeUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ScopeUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScopePayload>[];
                };
                upsert: {
                    args: Prisma.ScopeUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScopePayload>;
                };
                aggregate: {
                    args: Prisma.ScopeAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateScope>;
                };
                groupBy: {
                    args: Prisma.ScopeGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ScopeGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ScopeCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ScopeCountAggregateOutputType> | number;
                };
            };
        };
        Asset: {
            payload: Prisma.$AssetPayload<ExtArgs>;
            fields: Prisma.AssetFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AssetFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AssetFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>;
                };
                findFirst: {
                    args: Prisma.AssetFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AssetFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>;
                };
                findMany: {
                    args: Prisma.AssetFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>[];
                };
                create: {
                    args: Prisma.AssetCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>;
                };
                createMany: {
                    args: Prisma.AssetCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AssetCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>[];
                };
                delete: {
                    args: Prisma.AssetDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>;
                };
                update: {
                    args: Prisma.AssetUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>;
                };
                deleteMany: {
                    args: Prisma.AssetDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AssetUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AssetUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>[];
                };
                upsert: {
                    args: Prisma.AssetUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetPayload>;
                };
                aggregate: {
                    args: Prisma.AssetAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAsset>;
                };
                groupBy: {
                    args: Prisma.AssetGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AssetGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AssetCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AssetCountAggregateOutputType> | number;
                };
            };
        };
        ServiceAsset: {
            payload: Prisma.$ServiceAssetPayload<ExtArgs>;
            fields: Prisma.ServiceAssetFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ServiceAssetFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceAssetPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ServiceAssetFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceAssetPayload>;
                };
                findFirst: {
                    args: Prisma.ServiceAssetFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceAssetPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ServiceAssetFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceAssetPayload>;
                };
                findMany: {
                    args: Prisma.ServiceAssetFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceAssetPayload>[];
                };
                create: {
                    args: Prisma.ServiceAssetCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceAssetPayload>;
                };
                createMany: {
                    args: Prisma.ServiceAssetCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ServiceAssetCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceAssetPayload>[];
                };
                delete: {
                    args: Prisma.ServiceAssetDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceAssetPayload>;
                };
                update: {
                    args: Prisma.ServiceAssetUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceAssetPayload>;
                };
                deleteMany: {
                    args: Prisma.ServiceAssetDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ServiceAssetUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ServiceAssetUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceAssetPayload>[];
                };
                upsert: {
                    args: Prisma.ServiceAssetUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServiceAssetPayload>;
                };
                aggregate: {
                    args: Prisma.ServiceAssetAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateServiceAsset>;
                };
                groupBy: {
                    args: Prisma.ServiceAssetGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ServiceAssetGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ServiceAssetCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ServiceAssetCountAggregateOutputType> | number;
                };
            };
        };
        AssetProvisioning: {
            payload: Prisma.$AssetProvisioningPayload<ExtArgs>;
            fields: Prisma.AssetProvisioningFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AssetProvisioningFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetProvisioningPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AssetProvisioningFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetProvisioningPayload>;
                };
                findFirst: {
                    args: Prisma.AssetProvisioningFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetProvisioningPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AssetProvisioningFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetProvisioningPayload>;
                };
                findMany: {
                    args: Prisma.AssetProvisioningFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetProvisioningPayload>[];
                };
                create: {
                    args: Prisma.AssetProvisioningCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetProvisioningPayload>;
                };
                createMany: {
                    args: Prisma.AssetProvisioningCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AssetProvisioningCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetProvisioningPayload>[];
                };
                delete: {
                    args: Prisma.AssetProvisioningDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetProvisioningPayload>;
                };
                update: {
                    args: Prisma.AssetProvisioningUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetProvisioningPayload>;
                };
                deleteMany: {
                    args: Prisma.AssetProvisioningDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AssetProvisioningUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AssetProvisioningUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetProvisioningPayload>[];
                };
                upsert: {
                    args: Prisma.AssetProvisioningUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AssetProvisioningPayload>;
                };
                aggregate: {
                    args: Prisma.AssetProvisioningAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAssetProvisioning>;
                };
                groupBy: {
                    args: Prisma.AssetProvisioningGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AssetProvisioningGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AssetProvisioningCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AssetProvisioningCountAggregateOutputType> | number;
                };
            };
        };
        ScheduleRule: {
            payload: Prisma.$ScheduleRulePayload<ExtArgs>;
            fields: Prisma.ScheduleRuleFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ScheduleRuleFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleRulePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ScheduleRuleFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleRulePayload>;
                };
                findFirst: {
                    args: Prisma.ScheduleRuleFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleRulePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ScheduleRuleFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleRulePayload>;
                };
                findMany: {
                    args: Prisma.ScheduleRuleFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleRulePayload>[];
                };
                create: {
                    args: Prisma.ScheduleRuleCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleRulePayload>;
                };
                createMany: {
                    args: Prisma.ScheduleRuleCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ScheduleRuleCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleRulePayload>[];
                };
                delete: {
                    args: Prisma.ScheduleRuleDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleRulePayload>;
                };
                update: {
                    args: Prisma.ScheduleRuleUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleRulePayload>;
                };
                deleteMany: {
                    args: Prisma.ScheduleRuleDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ScheduleRuleUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ScheduleRuleUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleRulePayload>[];
                };
                upsert: {
                    args: Prisma.ScheduleRuleUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleRulePayload>;
                };
                aggregate: {
                    args: Prisma.ScheduleRuleAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateScheduleRule>;
                };
                groupBy: {
                    args: Prisma.ScheduleRuleGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ScheduleRuleGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ScheduleRuleCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ScheduleRuleCountAggregateOutputType> | number;
                };
            };
        };
        Execution: {
            payload: Prisma.$ExecutionPayload<ExtArgs>;
            fields: Prisma.ExecutionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ExecutionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ExecutionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPayload>;
                };
                findFirst: {
                    args: Prisma.ExecutionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ExecutionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPayload>;
                };
                findMany: {
                    args: Prisma.ExecutionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPayload>[];
                };
                create: {
                    args: Prisma.ExecutionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPayload>;
                };
                createMany: {
                    args: Prisma.ExecutionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ExecutionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPayload>[];
                };
                delete: {
                    args: Prisma.ExecutionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPayload>;
                };
                update: {
                    args: Prisma.ExecutionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPayload>;
                };
                deleteMany: {
                    args: Prisma.ExecutionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ExecutionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ExecutionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPayload>[];
                };
                upsert: {
                    args: Prisma.ExecutionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionPayload>;
                };
                aggregate: {
                    args: Prisma.ExecutionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateExecution>;
                };
                groupBy: {
                    args: Prisma.ExecutionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ExecutionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ExecutionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ExecutionCountAggregateOutputType> | number;
                };
            };
        };
        CheckResult: {
            payload: Prisma.$CheckResultPayload<ExtArgs>;
            fields: Prisma.CheckResultFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CheckResultFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckResultPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CheckResultFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckResultPayload>;
                };
                findFirst: {
                    args: Prisma.CheckResultFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckResultPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CheckResultFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckResultPayload>;
                };
                findMany: {
                    args: Prisma.CheckResultFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckResultPayload>[];
                };
                create: {
                    args: Prisma.CheckResultCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckResultPayload>;
                };
                createMany: {
                    args: Prisma.CheckResultCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CheckResultCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckResultPayload>[];
                };
                delete: {
                    args: Prisma.CheckResultDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckResultPayload>;
                };
                update: {
                    args: Prisma.CheckResultUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckResultPayload>;
                };
                deleteMany: {
                    args: Prisma.CheckResultDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CheckResultUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CheckResultUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckResultPayload>[];
                };
                upsert: {
                    args: Prisma.CheckResultUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CheckResultPayload>;
                };
                aggregate: {
                    args: Prisma.CheckResultAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCheckResult>;
                };
                groupBy: {
                    args: Prisma.CheckResultGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CheckResultGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CheckResultCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CheckResultCountAggregateOutputType> | number;
                };
            };
        };
        ExecutionLog: {
            payload: Prisma.$ExecutionLogPayload<ExtArgs>;
            fields: Prisma.ExecutionLogFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ExecutionLogFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionLogPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ExecutionLogFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionLogPayload>;
                };
                findFirst: {
                    args: Prisma.ExecutionLogFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionLogPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ExecutionLogFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionLogPayload>;
                };
                findMany: {
                    args: Prisma.ExecutionLogFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionLogPayload>[];
                };
                create: {
                    args: Prisma.ExecutionLogCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionLogPayload>;
                };
                createMany: {
                    args: Prisma.ExecutionLogCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ExecutionLogCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionLogPayload>[];
                };
                delete: {
                    args: Prisma.ExecutionLogDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionLogPayload>;
                };
                update: {
                    args: Prisma.ExecutionLogUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionLogPayload>;
                };
                deleteMany: {
                    args: Prisma.ExecutionLogDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ExecutionLogUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ExecutionLogUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionLogPayload>[];
                };
                upsert: {
                    args: Prisma.ExecutionLogUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExecutionLogPayload>;
                };
                aggregate: {
                    args: Prisma.ExecutionLogAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateExecutionLog>;
                };
                groupBy: {
                    args: Prisma.ExecutionLogGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ExecutionLogGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ExecutionLogCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ExecutionLogCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const AuditLogScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly userId: "userId";
    readonly attemptedEmail: "attemptedEmail";
    readonly action: "action";
    readonly resource: "resource";
    readonly beforeState: "beforeState";
    readonly afterState: "afterState";
    readonly ipAddress: "ipAddress";
    readonly userAgent: "userAgent";
    readonly result: "result";
    readonly createdAt: "createdAt";
};
export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum];
export declare const ComplianceEventScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly userId: "userId";
    readonly changedField: "changedField";
    readonly previousValue: "previousValue";
    readonly newValue: "newValue";
    readonly ipAddress: "ipAddress";
    readonly userAgent: "userAgent";
    readonly createdAt: "createdAt";
};
export type ComplianceEventScalarFieldEnum = (typeof ComplianceEventScalarFieldEnum)[keyof typeof ComplianceEventScalarFieldEnum];
export declare const ControlScalarFieldEnum: {
    readonly id: "id";
    readonly code: "code";
    readonly domain: "domain";
    readonly name: "name";
    readonly description: "description";
    readonly sourceRef: "sourceRef";
};
export type ControlScalarFieldEnum = (typeof ControlScalarFieldEnum)[keyof typeof ControlScalarFieldEnum];
export declare const PointOfFocusControlScalarFieldEnum: {
    readonly id: "id";
    readonly pointOfFocusId: "pointOfFocusId";
    readonly controlId: "controlId";
};
export type PointOfFocusControlScalarFieldEnum = (typeof PointOfFocusControlScalarFieldEnum)[keyof typeof PointOfFocusControlScalarFieldEnum];
export declare const ControlDimensionEntryScalarFieldEnum: {
    readonly id: "id";
    readonly controlId: "controlId";
    readonly dimension: "dimension";
    readonly type: "type";
    readonly requiresProbe: "requiresProbe";
    readonly requiresAi: "requiresAi";
    readonly requiresComplianceConfirmation: "requiresComplianceConfirmation";
    readonly reasonNotApplicable: "reasonNotApplicable";
};
export type ControlDimensionEntryScalarFieldEnum = (typeof ControlDimensionEntryScalarFieldEnum)[keyof typeof ControlDimensionEntryScalarFieldEnum];
export declare const ControlMeasurementScalarFieldEnum: {
    readonly id: "id";
    readonly controlId: "controlId";
    readonly dimension: "dimension";
    readonly weight: "weight";
    readonly formula: "formula";
};
export type ControlMeasurementScalarFieldEnum = (typeof ControlMeasurementScalarFieldEnum)[keyof typeof ControlMeasurementScalarFieldEnum];
export declare const PolicyScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly approvalStatus: "approvalStatus";
    readonly validUntil: "validUntil";
    readonly version: "version";
};
export type PolicyScalarFieldEnum = (typeof PolicyScalarFieldEnum)[keyof typeof PolicyScalarFieldEnum];
export declare const ControlPolicyScalarFieldEnum: {
    readonly id: "id";
    readonly controlId: "controlId";
    readonly policyId: "policyId";
};
export type ControlPolicyScalarFieldEnum = (typeof ControlPolicyScalarFieldEnum)[keyof typeof ControlPolicyScalarFieldEnum];
export declare const EvidenceTemplateScalarFieldEnum: {
    readonly id: "id";
    readonly code: "code";
    readonly description: "description";
    readonly dimension: "dimension";
};
export type EvidenceTemplateScalarFieldEnum = (typeof EvidenceTemplateScalarFieldEnum)[keyof typeof EvidenceTemplateScalarFieldEnum];
export declare const ControlEvidenceTemplateScalarFieldEnum: {
    readonly id: "id";
    readonly controlId: "controlId";
    readonly evidenceTemplateId: "evidenceTemplateId";
    readonly sequence: "sequence";
};
export type ControlEvidenceTemplateScalarFieldEnum = (typeof ControlEvidenceTemplateScalarFieldEnum)[keyof typeof ControlEvidenceTemplateScalarFieldEnum];
export declare const FrameworkScalarFieldEnum: {
    readonly id: "id";
    readonly code: "code";
    readonly name: "name";
    readonly version: "version";
    readonly type: "type";
    readonly scopeDescription: "scopeDescription";
};
export type FrameworkScalarFieldEnum = (typeof FrameworkScalarFieldEnum)[keyof typeof FrameworkScalarFieldEnum];
export declare const TrustCriterionScalarFieldEnum: {
    readonly id: "id";
    readonly criterion: "criterion";
    readonly isMandatory: "isMandatory";
};
export type TrustCriterionScalarFieldEnum = (typeof TrustCriterionScalarFieldEnum)[keyof typeof TrustCriterionScalarFieldEnum];
export declare const RequirementScalarFieldEnum: {
    readonly id: "id";
    readonly frameworkId: "frameworkId";
    readonly trustCriterionId: "trustCriterionId";
    readonly code: "code";
    readonly tscCategory: "tscCategory";
    readonly criterion: "criterion";
};
export type RequirementScalarFieldEnum = (typeof RequirementScalarFieldEnum)[keyof typeof RequirementScalarFieldEnum];
export declare const PointOfFocusScalarFieldEnum: {
    readonly id: "id";
    readonly requirementId: "requirementId";
    readonly number: "number";
    readonly description: "description";
};
export type PointOfFocusScalarFieldEnum = (typeof PointOfFocusScalarFieldEnum)[keyof typeof PointOfFocusScalarFieldEnum];
export declare const RequirementRelationScalarFieldEnum: {
    readonly id: "id";
    readonly sourceRequirementId: "sourceRequirementId";
    readonly relatedRequirementId: "relatedRequirementId";
};
export type RequirementRelationScalarFieldEnum = (typeof RequirementRelationScalarFieldEnum)[keyof typeof RequirementRelationScalarFieldEnum];
export declare const RiskScalarFieldEnum: {
    readonly id: "id";
    readonly code: "code";
    readonly name: "name";
    readonly description: "description";
    readonly trustCriterion: "trustCriterion";
    readonly potentialImpact: "potentialImpact";
    readonly likelihood: "likelihood";
    readonly impact: "impact";
    readonly inherentRiskValue: "inherentRiskValue";
    readonly inherentRiskLevel: "inherentRiskLevel";
    readonly isActive: "isActive";
};
export type RiskScalarFieldEnum = (typeof RiskScalarFieldEnum)[keyof typeof RiskScalarFieldEnum];
export declare const CauseScalarFieldEnum: {
    readonly id: "id";
    readonly code: "code";
    readonly name: "name";
    readonly failureCategory: "failureCategory";
    readonly description: "description";
};
export type CauseScalarFieldEnum = (typeof CauseScalarFieldEnum)[keyof typeof CauseScalarFieldEnum];
export declare const RiskCauseScalarFieldEnum: {
    readonly id: "id";
    readonly code: "code";
    readonly riskId: "riskId";
    readonly causeId: "causeId";
};
export type RiskCauseScalarFieldEnum = (typeof RiskCauseScalarFieldEnum)[keyof typeof RiskCauseScalarFieldEnum];
export declare const CauseControlScalarFieldEnum: {
    readonly id: "id";
    readonly causeId: "causeId";
    readonly controlId: "controlId";
};
export type CauseControlScalarFieldEnum = (typeof CauseControlScalarFieldEnum)[keyof typeof CauseControlScalarFieldEnum];
export declare const AutomatedCapabilityScalarFieldEnum: {
    readonly id: "id";
    readonly catalogCode: "catalogCode";
    readonly category: "category";
    readonly supportedPlatforms: "supportedPlatforms";
    readonly method: "method";
    readonly requiredPermissions: "requiredPermissions";
    readonly provider: "provider";
    readonly baseFrequency: "baseFrequency";
    readonly generatedEvidence: "generatedEvidence";
};
export type AutomatedCapabilityScalarFieldEnum = (typeof AutomatedCapabilityScalarFieldEnum)[keyof typeof AutomatedCapabilityScalarFieldEnum];
export declare const MonitoringDomainScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly monitoredScope: "monitoredScope";
    readonly coveredCriterion: "coveredCriterion";
    readonly generatedEvidence: "generatedEvidence";
};
export type MonitoringDomainScalarFieldEnum = (typeof MonitoringDomainScalarFieldEnum)[keyof typeof MonitoringDomainScalarFieldEnum];
export declare const MonitoringDomainRequirementScalarFieldEnum: {
    readonly id: "id";
    readonly monitoringDomainId: "monitoringDomainId";
    readonly requirementId: "requirementId";
};
export type MonitoringDomainRequirementScalarFieldEnum = (typeof MonitoringDomainRequirementScalarFieldEnum)[keyof typeof MonitoringDomainRequirementScalarFieldEnum];
export declare const MonitoringDomainCapabilityScalarFieldEnum: {
    readonly id: "id";
    readonly monitoringDomainId: "monitoringDomainId";
    readonly automatedCapabilityId: "automatedCapabilityId";
};
export type MonitoringDomainCapabilityScalarFieldEnum = (typeof MonitoringDomainCapabilityScalarFieldEnum)[keyof typeof MonitoringDomainCapabilityScalarFieldEnum];
export declare const TestPlanScalarFieldEnum: {
    readonly id: "id";
    readonly controlId: "controlId";
    readonly description: "description";
    readonly steps: "steps";
    readonly population: "population";
    readonly samplingRule: "samplingRule";
    readonly origin: "origin";
};
export type TestPlanScalarFieldEnum = (typeof TestPlanScalarFieldEnum)[keyof typeof TestPlanScalarFieldEnum];
export declare const TestScalarFieldEnum: {
    readonly id: "id";
    readonly code: "code";
    readonly dimension: "dimension";
    readonly name: "name";
    readonly objective: "objective";
    readonly type: "type";
    readonly tool: "tool";
    readonly population: "population";
    readonly period: "period";
    readonly populationSize: "populationSize";
    readonly suggestedSampleSize: "suggestedSampleSize";
    readonly selectionMethod: "selectionMethod";
    readonly evidenceToRequest: "evidenceToRequest";
    readonly prerequisites: "prerequisites";
    readonly stepByStep: "stepByStep";
    readonly attributesToValidate: "attributesToValidate";
    readonly complianceCriterion: "complianceCriterion";
    readonly exceptions: "exceptions";
    readonly exceptionsHandling: "exceptionsHandling";
    readonly evidenceToRetain: "evidenceToRetain";
    readonly automatedCoverage: "automatedCoverage";
    readonly complementaryManualValidation: "complementaryManualValidation";
    readonly limitations: "limitations";
};
export type TestScalarFieldEnum = (typeof TestScalarFieldEnum)[keyof typeof TestScalarFieldEnum];
export declare const ControlTestScalarFieldEnum: {
    readonly id: "id";
    readonly controlId: "controlId";
    readonly testId: "testId";
};
export type ControlTestScalarFieldEnum = (typeof ControlTestScalarFieldEnum)[keyof typeof ControlTestScalarFieldEnum];
export declare const CheckScalarFieldEnum: {
    readonly id: "id";
    readonly platform: "platform";
    readonly policyId: "policyId";
    readonly checkId: "checkId";
    readonly titleEs: "titleEs";
    readonly titleEn: "titleEn";
    readonly condition: "condition";
    readonly remediation: "remediation";
    readonly verificationRule: "verificationRule";
    readonly origin: "origin";
    readonly mappingProvenance: "mappingProvenance";
    readonly mappingConfidence: "mappingConfidence";
    readonly scaPolicyId: "scaPolicyId";
};
export type CheckScalarFieldEnum = (typeof CheckScalarFieldEnum)[keyof typeof CheckScalarFieldEnum];
export declare const TestCheckScalarFieldEnum: {
    readonly id: "id";
    readonly testId: "testId";
    readonly checkId: "checkId";
};
export type TestCheckScalarFieldEnum = (typeof TestCheckScalarFieldEnum)[keyof typeof TestCheckScalarFieldEnum];
export declare const CheckMappingScalarFieldEnum: {
    readonly id: "id";
    readonly checkId: "checkId";
    readonly frameworkCode: "frameworkCode";
    readonly frameworkVersion: "frameworkVersion";
    readonly requirementCode: "requirementCode";
};
export type CheckMappingScalarFieldEnum = (typeof CheckMappingScalarFieldEnum)[keyof typeof CheckMappingScalarFieldEnum];
export declare const ScaPolicyScalarFieldEnum: {
    readonly id: "id";
    readonly platform: "platform";
    readonly benchmark: "benchmark";
    readonly scaId: "scaId";
    readonly yamlFile: "yamlFile";
    readonly checkCount: "checkCount";
};
export type ScaPolicyScalarFieldEnum = (typeof ScaPolicyScalarFieldEnum)[keyof typeof ScaPolicyScalarFieldEnum];
export declare const CatalogVersionScalarFieldEnum: {
    readonly id: "id";
    readonly number: "number";
    readonly publishedAt: "publishedAt";
    readonly changeSummary: "changeSummary";
    readonly publishedBy: "publishedBy";
    readonly propagatedAutomatically: "propagatedAutomatically";
    readonly requiresAcceptance: "requiresAcceptance";
};
export type CatalogVersionScalarFieldEnum = (typeof CatalogVersionScalarFieldEnum)[keyof typeof CatalogVersionScalarFieldEnum];
export declare const CompanyScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly adminEmail: "adminEmail";
    readonly isolationStrategy: "isolationStrategy";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type CompanyScalarFieldEnum = (typeof CompanyScalarFieldEnum)[keyof typeof CompanyScalarFieldEnum];
export declare const AccessKeyScalarFieldEnum: {
    readonly id: "id";
    readonly companyId: "companyId";
    readonly createdBy: "createdBy";
    readonly codeHash: "codeHash";
    readonly status: "status";
    readonly expiresAt: "expiresAt";
    readonly usedAt: "usedAt";
};
export type AccessKeyScalarFieldEnum = (typeof AccessKeyScalarFieldEnum)[keyof typeof AccessKeyScalarFieldEnum];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly companyId: "companyId";
    readonly customRoleId: "customRoleId";
    readonly email: "email";
    readonly name: "name";
    readonly lastName: "lastName";
    readonly passwordHash: "passwordHash";
    readonly role: "role";
    readonly status: "status";
    readonly isMfaEnabled: "isMfaEnabled";
    readonly lastLoginAt: "lastLoginAt";
    readonly failedLoginAttempts: "failedLoginAttempts";
    readonly lockedUntil: "lockedUntil";
    readonly passwordChangedAt: "passwordChangedAt";
    readonly mfaSecretEncrypted: "mfaSecretEncrypted";
    readonly createdAt: "createdAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const CustomRoleScalarFieldEnum: {
    readonly id: "id";
    readonly companyId: "companyId";
    readonly name: "name";
    readonly permissions: "permissions";
    readonly createdAt: "createdAt";
};
export type CustomRoleScalarFieldEnum = (typeof CustomRoleScalarFieldEnum)[keyof typeof CustomRoleScalarFieldEnum];
export declare const UserControlAssignmentScalarFieldEnum: {
    readonly id: "id";
    readonly companyId: "companyId";
    readonly userId: "userId";
    readonly clientControlId: "clientControlId";
    readonly assignedBy: "assignedBy";
    readonly assignedAt: "assignedAt";
};
export type UserControlAssignmentScalarFieldEnum = (typeof UserControlAssignmentScalarFieldEnum)[keyof typeof UserControlAssignmentScalarFieldEnum];
export declare const AuditorAssignmentScalarFieldEnum: {
    readonly id: "id";
    readonly auditorUserId: "auditorUserId";
    readonly companyId: "companyId";
    readonly assignedBy: "assignedBy";
    readonly assignedAt: "assignedAt";
    readonly expiresAt: "expiresAt";
};
export type AuditorAssignmentScalarFieldEnum = (typeof AuditorAssignmentScalarFieldEnum)[keyof typeof AuditorAssignmentScalarFieldEnum];
export declare const SessionScalarFieldEnum: {
    readonly id: "id";
    readonly companyId: "companyId";
    readonly userId: "userId";
    readonly refreshTokenHash: "refreshTokenHash";
    readonly ipAddress: "ipAddress";
    readonly userAgent: "userAgent";
    readonly expiresAt: "expiresAt";
    readonly revokedAt: "revokedAt";
    readonly createdAt: "createdAt";
    readonly lastActivityAt: "lastActivityAt";
};
export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum];
export declare const ApiKeyScalarFieldEnum: {
    readonly id: "id";
    readonly companyId: "companyId";
    readonly createdBy: "createdBy";
    readonly name: "name";
    readonly keyHash: "keyHash";
    readonly status: "status";
    readonly lastRotatedAt: "lastRotatedAt";
};
export type ApiKeyScalarFieldEnum = (typeof ApiKeyScalarFieldEnum)[keyof typeof ApiKeyScalarFieldEnum];
export declare const ClientControlScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly controlId: "controlId";
    readonly serviceId: "serviceId";
    readonly ownCode: "ownCode";
    readonly clientInterpretation: "clientInterpretation";
    readonly type: "type";
    readonly sourceRef: "sourceRef";
    readonly isActive: "isActive";
};
export type ClientControlScalarFieldEnum = (typeof ClientControlScalarFieldEnum)[keyof typeof ClientControlScalarFieldEnum];
export declare const ActionPlanScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly clientControlId: "clientControlId";
    readonly responsibleId: "responsibleId";
    readonly actionDescription: "actionDescription";
    readonly dueDate: "dueDate";
    readonly status: "status";
};
export type ActionPlanScalarFieldEnum = (typeof ActionPlanScalarFieldEnum)[keyof typeof ActionPlanScalarFieldEnum];
export declare const MitigationScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly clientCauseId: "clientCauseId";
    readonly clientRiskId: "clientRiskId";
    readonly responsePercentage: "responsePercentage";
    readonly calculatedAt: "calculatedAt";
};
export type MitigationScalarFieldEnum = (typeof MitigationScalarFieldEnum)[keyof typeof MitigationScalarFieldEnum];
export declare const ResidualRiskScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly clientRiskId: "clientRiskId";
    readonly acceptedBy: "acceptedBy";
    readonly residualLevel: "residualLevel";
    readonly justification: "justification";
    readonly acceptedAt: "acceptedAt";
};
export type ResidualRiskScalarFieldEnum = (typeof ResidualRiskScalarFieldEnum)[keyof typeof ResidualRiskScalarFieldEnum];
export declare const RiskTreatmentScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly clientRiskId: "clientRiskId";
    readonly responsibleId: "responsibleId";
    readonly decision: "decision";
    readonly dueDate: "dueDate";
};
export type RiskTreatmentScalarFieldEnum = (typeof RiskTreatmentScalarFieldEnum)[keyof typeof RiskTreatmentScalarFieldEnum];
export declare const EvidenceRequirementScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly clientControlId: "clientControlId";
    readonly responsibleId: "responsibleId";
    readonly code: "code";
    readonly sequence: "sequence";
    readonly description: "description";
    readonly dimension: "dimension";
    readonly validityWithinPeriod: "validityWithinPeriod";
    readonly sourceRef: "sourceRef";
};
export type EvidenceRequirementScalarFieldEnum = (typeof EvidenceRequirementScalarFieldEnum)[keyof typeof EvidenceRequirementScalarFieldEnum];
export declare const EvidenceSubmissionScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly evidenceRequirementId: "evidenceRequirementId";
    readonly submittedBy: "submittedBy";
    readonly approvedBy: "approvedBy";
    readonly filePath: "filePath";
    readonly fileType: "fileType";
    readonly fileSize: "fileSize";
    readonly storageLocation: "storageLocation";
    readonly integrityHash: "integrityHash";
    readonly version: "version";
    readonly validationStatus: "validationStatus";
    readonly aiVerdict: "aiVerdict";
};
export type EvidenceSubmissionScalarFieldEnum = (typeof EvidenceSubmissionScalarFieldEnum)[keyof typeof EvidenceSubmissionScalarFieldEnum];
export declare const ExclusionScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly testId: "testId";
    readonly proposedBy: "proposedBy";
    readonly approvedBy: "approvedBy";
    readonly excludedCheckId: "excludedCheckId";
    readonly justification: "justification";
    readonly validUntil: "validUntil";
};
export type ExclusionScalarFieldEnum = (typeof ExclusionScalarFieldEnum)[keyof typeof ExclusionScalarFieldEnum];
export declare const EvaluationScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly serviceId: "serviceId";
    readonly clientControlId: "clientControlId";
    readonly testId: "testId";
    readonly checkId: "checkId";
    readonly assetId: "assetId";
    readonly catalogVersionId: "catalogVersionId";
    readonly confirmedBy: "confirmedBy";
    readonly evaluatedAt: "evaluatedAt";
    readonly dimension: "dimension";
    readonly result: "result";
    readonly rawProbeResult: "rawProbeResult";
    readonly diagnosticPercentage: "diagnosticPercentage";
    readonly origin: "origin";
    readonly clientResponse: "clientResponse";
    readonly consultantAssessment: "consultantAssessment";
    readonly closureObservationReason: "closureObservationReason";
    readonly coveredPeriod: "coveredPeriod";
};
export type EvaluationScalarFieldEnum = (typeof EvaluationScalarFieldEnum)[keyof typeof EvaluationScalarFieldEnum];
export declare const FindingScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly evaluationId: "evaluationId";
    readonly assetId: "assetId";
    readonly reportedBy: "reportedBy";
    readonly dimension: "dimension";
    readonly failedTestOrCheck: "failedTestOrCheck";
    readonly severity: "severity";
    readonly status: "status";
    readonly origin: "origin";
    readonly detectedAt: "detectedAt";
    readonly closedAt: "closedAt";
};
export type FindingScalarFieldEnum = (typeof FindingScalarFieldEnum)[keyof typeof FindingScalarFieldEnum];
export declare const VulnerabilityScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly assetId: "assetId";
    readonly cve: "cve";
    readonly severity: "severity";
    readonly packageName: "packageName";
    readonly packageVersion: "packageVersion";
    readonly cvssScore: "cvssScore";
    readonly status: "status";
    readonly recommendation: "recommendation";
};
export type VulnerabilityScalarFieldEnum = (typeof VulnerabilityScalarFieldEnum)[keyof typeof VulnerabilityScalarFieldEnum];
export declare const ClientRiskScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly serviceId: "serviceId";
    readonly riskId: "riskId";
    readonly code: "code";
    readonly name: "name";
    readonly description: "description";
    readonly trustCriterion: "trustCriterion";
    readonly potentialImpact: "potentialImpact";
    readonly likelihood: "likelihood";
    readonly impact: "impact";
    readonly inherentRiskValue: "inherentRiskValue";
    readonly inherentRiskLevel: "inherentRiskLevel";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ClientRiskScalarFieldEnum = (typeof ClientRiskScalarFieldEnum)[keyof typeof ClientRiskScalarFieldEnum];
export declare const ClientCauseScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly serviceId: "serviceId";
    readonly causeId: "causeId";
    readonly code: "code";
    readonly name: "name";
    readonly failureCategory: "failureCategory";
    readonly description: "description";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ClientCauseScalarFieldEnum = (typeof ClientCauseScalarFieldEnum)[keyof typeof ClientCauseScalarFieldEnum];
export declare const ClientRiskCauseScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly clientRiskId: "clientRiskId";
    readonly clientCauseId: "clientCauseId";
};
export type ClientRiskCauseScalarFieldEnum = (typeof ClientRiskCauseScalarFieldEnum)[keyof typeof ClientRiskCauseScalarFieldEnum];
export declare const ClientCauseControlScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly clientCauseId: "clientCauseId";
    readonly clientControlId: "clientControlId";
};
export type ClientCauseControlScalarFieldEnum = (typeof ClientCauseControlScalarFieldEnum)[keyof typeof ClientCauseControlScalarFieldEnum];
export declare const ClientControlDimensionScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly clientControlId: "clientControlId";
    readonly dimension: "dimension";
    readonly type: "type";
    readonly requiresProbe: "requiresProbe";
    readonly requiresAi: "requiresAi";
    readonly requiresComplianceConfirmation: "requiresComplianceConfirmation";
    readonly reasonNotApplicable: "reasonNotApplicable";
};
export type ClientControlDimensionScalarFieldEnum = (typeof ClientControlDimensionScalarFieldEnum)[keyof typeof ClientControlDimensionScalarFieldEnum];
export declare const ClientControlTestScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly clientControlId: "clientControlId";
    readonly testId: "testId";
};
export type ClientControlTestScalarFieldEnum = (typeof ClientControlTestScalarFieldEnum)[keyof typeof ClientControlTestScalarFieldEnum];
export declare const OrganizationScalarFieldEnum: {
    readonly id: "id";
    readonly companyId: "companyId";
    readonly name: "name";
    readonly description: "description";
    readonly size: "size";
    readonly industry: "industry";
    readonly businessModel: "businessModel";
    readonly yearsInOperation: "yearsInOperation";
    readonly incorporationCountries: "incorporationCountries";
    readonly clientCountries: "clientCountries";
    readonly complianceMaturity: "complianceMaturity";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type OrganizationScalarFieldEnum = (typeof OrganizationScalarFieldEnum)[keyof typeof OrganizationScalarFieldEnum];
export declare const RegulationScalarFieldEnum: {
    readonly id: "id";
    readonly code: "code";
    readonly name: "name";
    readonly jurisdiction: "jurisdiction";
};
export type RegulationScalarFieldEnum = (typeof RegulationScalarFieldEnum)[keyof typeof RegulationScalarFieldEnum];
export declare const OrganizationRegulationScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly organizationId: "organizationId";
    readonly regulationId: "regulationId";
};
export type OrganizationRegulationScalarFieldEnum = (typeof OrganizationRegulationScalarFieldEnum)[keyof typeof OrganizationRegulationScalarFieldEnum];
export declare const OrganizationResponsibleScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly organizationId: "organizationId";
    readonly type: "type";
    readonly personName: "personName";
};
export type OrganizationResponsibleScalarFieldEnum = (typeof OrganizationResponsibleScalarFieldEnum)[keyof typeof OrganizationResponsibleScalarFieldEnum];
export declare const ServiceScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly organizationId: "organizationId";
    readonly name: "name";
    readonly description: "description";
    readonly scopeStatement: "scopeStatement";
    readonly type: "type";
    readonly industriesServed: "industriesServed";
    readonly activeClientCount: "activeClientCount";
    readonly countries: "countries";
    readonly dataTypes: "dataTypes";
    readonly expectedAvailability: "expectedAvailability";
    readonly deploymentScenario: "deploymentScenario";
    readonly previousCertification: "previousCertification";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ServiceScalarFieldEnum = (typeof ServiceScalarFieldEnum)[keyof typeof ServiceScalarFieldEnum];
export declare const ServiceTrustCriterionScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly serviceId: "serviceId";
    readonly trustCriterionId: "trustCriterionId";
};
export type ServiceTrustCriterionScalarFieldEnum = (typeof ServiceTrustCriterionScalarFieldEnum)[keyof typeof ServiceTrustCriterionScalarFieldEnum];
export declare const ServiceRegulationScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly serviceId: "serviceId";
    readonly regulationId: "regulationId";
};
export type ServiceRegulationScalarFieldEnum = (typeof ServiceRegulationScalarFieldEnum)[keyof typeof ServiceRegulationScalarFieldEnum];
export declare const ServiceFrameworkScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly frameworkId: "frameworkId";
    readonly serviceId: "serviceId";
    readonly catalogVersionId: "catalogVersionId";
    readonly contractedAt: "contractedAt";
    readonly status: "status";
    readonly evaluationPeriod: "evaluationPeriod";
};
export type ServiceFrameworkScalarFieldEnum = (typeof ServiceFrameworkScalarFieldEnum)[keyof typeof ServiceFrameworkScalarFieldEnum];
export declare const SubserviceOrganizationScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly serviceId: "serviceId";
    readonly provider: "provider";
    readonly serviceProvided: "serviceProvided";
    readonly responsibility: "responsibility";
    readonly type: "type";
};
export type SubserviceOrganizationScalarFieldEnum = (typeof SubserviceOrganizationScalarFieldEnum)[keyof typeof SubserviceOrganizationScalarFieldEnum];
export declare const CsocScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly subserviceOrganizationId: "subserviceOrganizationId";
    readonly expectedControl: "expectedControl";
};
export type CsocScalarFieldEnum = (typeof CsocScalarFieldEnum)[keyof typeof CsocScalarFieldEnum];
export declare const CuecScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly serviceId: "serviceId";
    readonly expectedControl: "expectedControl";
};
export type CuecScalarFieldEnum = (typeof CuecScalarFieldEnum)[keyof typeof CuecScalarFieldEnum];
export declare const SystemDescriptionScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly serviceId: "serviceId";
    readonly filePath: "filePath";
    readonly sections: "sections";
};
export type SystemDescriptionScalarFieldEnum = (typeof SystemDescriptionScalarFieldEnum)[keyof typeof SystemDescriptionScalarFieldEnum];
export declare const ScopeScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly serviceId: "serviceId";
    readonly serverCount: "serverCount";
    readonly cloudCount: "cloudCount";
    readonly appCount: "appCount";
    readonly databaseCount: "databaseCount";
    readonly endpointCount: "endpointCount";
};
export type ScopeScalarFieldEnum = (typeof ScopeScalarFieldEnum)[keyof typeof ScopeScalarFieldEnum];
export declare const AssetScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly organizationId: "organizationId";
    readonly responsibleId: "responsibleId";
    readonly code: "code";
    readonly connectionCategory: "connectionCategory";
    readonly type: "type";
    readonly name: "name";
    readonly platform: "platform";
    readonly ipAddress: "ipAddress";
    readonly location: "location";
    readonly criticality: "criticality";
    readonly tags: "tags";
    readonly origin: "origin";
    readonly status: "status";
    readonly operationalStatus: "operationalStatus";
    readonly technicalCoverage: "technicalCoverage";
};
export type AssetScalarFieldEnum = (typeof AssetScalarFieldEnum)[keyof typeof AssetScalarFieldEnum];
export declare const ServiceAssetScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly assetId: "assetId";
    readonly serviceId: "serviceId";
};
export type ServiceAssetScalarFieldEnum = (typeof ServiceAssetScalarFieldEnum)[keyof typeof ServiceAssetScalarFieldEnum];
export declare const AssetProvisioningScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly assetId: "assetId";
    readonly automatedCapabilityId: "automatedCapabilityId";
    readonly connectionStatus: "connectionStatus";
    readonly lastValidatedAt: "lastValidatedAt";
    readonly technicalCoverage: "technicalCoverage";
    readonly encryptedCredentials: "encryptedCredentials";
    readonly isActive: "isActive";
    readonly scheduleFrequency: "scheduleFrequency";
};
export type AssetProvisioningScalarFieldEnum = (typeof AssetProvisioningScalarFieldEnum)[keyof typeof AssetProvisioningScalarFieldEnum];
export declare const ScheduleRuleScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly rule: "rule";
    readonly appliesTo: "appliesTo";
    readonly affectedAssetCount: "affectedAssetCount";
    readonly nextRunAt: "nextRunAt";
};
export type ScheduleRuleScalarFieldEnum = (typeof ScheduleRuleScalarFieldEnum)[keyof typeof ScheduleRuleScalarFieldEnum];
export declare const ExecutionScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly assetId: "assetId";
    readonly scheduleRuleId: "scheduleRuleId";
    readonly retryOfId: "retryOfId";
    readonly startedAt: "startedAt";
    readonly finishedAt: "finishedAt";
    readonly status: "status";
    readonly progressPercentage: "progressPercentage";
    readonly origin: "origin";
};
export type ExecutionScalarFieldEnum = (typeof ExecutionScalarFieldEnum)[keyof typeof ExecutionScalarFieldEnum];
export declare const CheckResultScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly executionId: "executionId";
    readonly checkId: "checkId";
    readonly platform: "platform";
    readonly policyId: "policyId";
    readonly rawCheckId: "rawCheckId";
    readonly result: "result";
    readonly evaluatedAt: "evaluatedAt";
};
export type CheckResultScalarFieldEnum = (typeof CheckResultScalarFieldEnum)[keyof typeof CheckResultScalarFieldEnum];
export declare const ExecutionLogScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly executionId: "executionId";
    readonly loggedAt: "loggedAt";
    readonly level: "level";
    readonly message: "message";
};
export type ExecutionLogScalarFieldEnum = (typeof ExecutionLogScalarFieldEnum)[keyof typeof ExecutionLogScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const JsonNullValueInput: {
    readonly JsonNull: runtime.JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const JsonNullValueFilter: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
    readonly AnyNull: runtime.AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>;
export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>;
export type EnumAuditResultFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuditResult'>;
export type ListEnumAuditResultFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuditResult[]'>;
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
export type EnumDimensionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Dimension'>;
export type ListEnumDimensionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Dimension[]'>;
export type EnumControlDimensionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ControlDimensionType'>;
export type ListEnumControlDimensionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ControlDimensionType[]'>;
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>;
export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>;
export type EnumPolicyApprovalStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PolicyApprovalStatus'>;
export type ListEnumPolicyApprovalStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PolicyApprovalStatus[]'>;
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
export type EnumFrameworkTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FrameworkType'>;
export type ListEnumFrameworkTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FrameworkType[]'>;
export type EnumTrustCriterionCodeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TrustCriterionCode'>;
export type ListEnumTrustCriterionCodeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TrustCriterionCode[]'>;
export type EnumRiskCriterionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskCriterion'>;
export type ListEnumRiskCriterionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskCriterion[]'>;
export type EnumRiskLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskLevel'>;
export type ListEnumRiskLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskLevel[]'>;
export type EnumFailureCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FailureCategory'>;
export type ListEnumFailureCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FailureCategory[]'>;
export type EnumTestPlanOriginFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TestPlanOrigin'>;
export type ListEnumTestPlanOriginFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TestPlanOrigin[]'>;
export type EnumCheckOriginFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CheckOrigin'>;
export type ListEnumCheckOriginFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CheckOrigin[]'>;
export type EnumMappingConfidenceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MappingConfidence'>;
export type ListEnumMappingConfidenceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MappingConfidence[]'>;
export type EnumIsolationStrategyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'IsolationStrategy'>;
export type ListEnumIsolationStrategyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'IsolationStrategy[]'>;
export type EnumCompanyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CompanyStatus'>;
export type ListEnumCompanyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CompanyStatus[]'>;
export type EnumAccessKeyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AccessKeyStatus'>;
export type ListEnumAccessKeyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AccessKeyStatus[]'>;
export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>;
export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>;
export type EnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus'>;
export type ListEnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus[]'>;
export type EnumApiKeyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApiKeyStatus'>;
export type ListEnumApiKeyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApiKeyStatus[]'>;
export type EnumActionPlanStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActionPlanStatus'>;
export type ListEnumActionPlanStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActionPlanStatus[]'>;
export type EnumRiskTreatmentDecisionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskTreatmentDecision'>;
export type ListEnumRiskTreatmentDecisionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskTreatmentDecision[]'>;
export type EnumEvidenceValidationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EvidenceValidationStatus'>;
export type ListEnumEvidenceValidationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EvidenceValidationStatus[]'>;
export type EnumEvaluationResultFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EvaluationResult'>;
export type ListEnumEvaluationResultFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EvaluationResult[]'>;
export type EnumRawProbeResultFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RawProbeResult'>;
export type ListEnumRawProbeResultFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RawProbeResult[]'>;
export type EnumEvaluationOriginFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EvaluationOrigin'>;
export type ListEnumEvaluationOriginFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EvaluationOrigin[]'>;
export type EnumSeverityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Severity'>;
export type ListEnumSeverityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Severity[]'>;
export type EnumFindingStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FindingStatus'>;
export type ListEnumFindingStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FindingStatus[]'>;
export type EnumFindingOriginFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FindingOrigin'>;
export type ListEnumFindingOriginFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FindingOrigin[]'>;
export type EnumVulnerabilityStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VulnerabilityStatus'>;
export type ListEnumVulnerabilityStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VulnerabilityStatus[]'>;
export type EnumOrganizationSizeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrganizationSize'>;
export type ListEnumOrganizationSizeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrganizationSize[]'>;
export type EnumIndustryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Industry'>;
export type ListEnumIndustryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Industry[]'>;
export type EnumBusinessModelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BusinessModel'>;
export type ListEnumBusinessModelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BusinessModel[]'>;
export type EnumYearsInOperationFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'YearsInOperation'>;
export type ListEnumYearsInOperationFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'YearsInOperation[]'>;
export type ListEnumIncorporationCountryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'IncorporationCountry[]'>;
export type EnumIncorporationCountryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'IncorporationCountry'>;
export type ListEnumClientCountryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ClientCountry[]'>;
export type EnumClientCountryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ClientCountry'>;
export type EnumComplianceMaturityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ComplianceMaturity'>;
export type ListEnumComplianceMaturityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ComplianceMaturity[]'>;
export type EnumOrganizationResponsibleTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrganizationResponsibleType'>;
export type ListEnumOrganizationResponsibleTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrganizationResponsibleType[]'>;
export type EnumServiceTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServiceType'>;
export type ListEnumServiceTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServiceType[]'>;
export type ListEnumServedIndustryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServedIndustry[]'>;
export type EnumServedIndustryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServedIndustry'>;
export type EnumActiveClientCountFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActiveClientCount'>;
export type ListEnumActiveClientCountFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActiveClientCount[]'>;
export type ListEnumServiceCountryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServiceCountry[]'>;
export type EnumServiceCountryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServiceCountry'>;
export type ListEnumDataTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DataType[]'>;
export type EnumDataTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DataType'>;
export type EnumExpectedAvailabilityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ExpectedAvailability'>;
export type ListEnumExpectedAvailabilityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ExpectedAvailability[]'>;
export type EnumDeploymentScenarioFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DeploymentScenario'>;
export type ListEnumDeploymentScenarioFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DeploymentScenario[]'>;
export type EnumPreviousCertificationFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PreviousCertification'>;
export type ListEnumPreviousCertificationFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PreviousCertification[]'>;
export type EnumServiceFrameworkStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServiceFrameworkStatus'>;
export type ListEnumServiceFrameworkStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServiceFrameworkStatus[]'>;
export type EnumSubserviceProviderTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SubserviceProviderType'>;
export type ListEnumSubserviceProviderTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SubserviceProviderType[]'>;
export type EnumAssetConnectionCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetConnectionCategory'>;
export type ListEnumAssetConnectionCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetConnectionCategory[]'>;
export type EnumAssetTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetType'>;
export type ListEnumAssetTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetType[]'>;
export type EnumAssetCriticalityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetCriticality'>;
export type ListEnumAssetCriticalityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetCriticality[]'>;
export type EnumAssetOriginFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetOrigin'>;
export type ListEnumAssetOriginFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetOrigin[]'>;
export type EnumAssetStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetStatus'>;
export type ListEnumAssetStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetStatus[]'>;
export type EnumAssetOperationalStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetOperationalStatus'>;
export type ListEnumAssetOperationalStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetOperationalStatus[]'>;
export type EnumProvisioningStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProvisioningStatus'>;
export type ListEnumProvisioningStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProvisioningStatus[]'>;
export type EnumScheduleFrequencyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ScheduleFrequency'>;
export type ListEnumScheduleFrequencyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ScheduleFrequency[]'>;
export type EnumExecutionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ExecutionStatus'>;
export type ListEnumExecutionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ExecutionStatus[]'>;
export type EnumExecutionOriginFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ExecutionOrigin'>;
export type ListEnumExecutionOriginFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ExecutionOrigin[]'>;
export type EnumCheckResultStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CheckResultStatus'>;
export type ListEnumCheckResultStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CheckResultStatus[]'>;
export type EnumExecutionLogLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ExecutionLogLevel'>;
export type ListEnumExecutionLogLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ExecutionLogLevel[]'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export type PrismaClientOptions = ({
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
} | {
    accelerateUrl: string;
    adapter?: never;
}) & {
    errorFormat?: ErrorFormat;
    log?: (LogLevel | LogDefinition)[];
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    omit?: GlobalOmitConfig;
    comments?: runtime.SqlCommenterPlugin[];
};
export type GlobalOmitConfig = {
    auditLog?: Prisma.AuditLogOmit;
    complianceEvent?: Prisma.ComplianceEventOmit;
    control?: Prisma.ControlOmit;
    pointOfFocusControl?: Prisma.PointOfFocusControlOmit;
    controlDimensionEntry?: Prisma.ControlDimensionEntryOmit;
    controlMeasurement?: Prisma.ControlMeasurementOmit;
    policy?: Prisma.PolicyOmit;
    controlPolicy?: Prisma.ControlPolicyOmit;
    evidenceTemplate?: Prisma.EvidenceTemplateOmit;
    controlEvidenceTemplate?: Prisma.ControlEvidenceTemplateOmit;
    framework?: Prisma.FrameworkOmit;
    trustCriterion?: Prisma.TrustCriterionOmit;
    requirement?: Prisma.RequirementOmit;
    pointOfFocus?: Prisma.PointOfFocusOmit;
    requirementRelation?: Prisma.RequirementRelationOmit;
    risk?: Prisma.RiskOmit;
    cause?: Prisma.CauseOmit;
    riskCause?: Prisma.RiskCauseOmit;
    causeControl?: Prisma.CauseControlOmit;
    automatedCapability?: Prisma.AutomatedCapabilityOmit;
    monitoringDomain?: Prisma.MonitoringDomainOmit;
    monitoringDomainRequirement?: Prisma.MonitoringDomainRequirementOmit;
    monitoringDomainCapability?: Prisma.MonitoringDomainCapabilityOmit;
    testPlan?: Prisma.TestPlanOmit;
    test?: Prisma.TestOmit;
    controlTest?: Prisma.ControlTestOmit;
    check?: Prisma.CheckOmit;
    testCheck?: Prisma.TestCheckOmit;
    checkMapping?: Prisma.CheckMappingOmit;
    scaPolicy?: Prisma.ScaPolicyOmit;
    catalogVersion?: Prisma.CatalogVersionOmit;
    company?: Prisma.CompanyOmit;
    accessKey?: Prisma.AccessKeyOmit;
    user?: Prisma.UserOmit;
    customRole?: Prisma.CustomRoleOmit;
    userControlAssignment?: Prisma.UserControlAssignmentOmit;
    auditorAssignment?: Prisma.AuditorAssignmentOmit;
    session?: Prisma.SessionOmit;
    apiKey?: Prisma.ApiKeyOmit;
    clientControl?: Prisma.ClientControlOmit;
    actionPlan?: Prisma.ActionPlanOmit;
    mitigation?: Prisma.MitigationOmit;
    residualRisk?: Prisma.ResidualRiskOmit;
    riskTreatment?: Prisma.RiskTreatmentOmit;
    evidenceRequirement?: Prisma.EvidenceRequirementOmit;
    evidenceSubmission?: Prisma.EvidenceSubmissionOmit;
    exclusion?: Prisma.ExclusionOmit;
    evaluation?: Prisma.EvaluationOmit;
    finding?: Prisma.FindingOmit;
    vulnerability?: Prisma.VulnerabilityOmit;
    clientRisk?: Prisma.ClientRiskOmit;
    clientCause?: Prisma.ClientCauseOmit;
    clientRiskCause?: Prisma.ClientRiskCauseOmit;
    clientCauseControl?: Prisma.ClientCauseControlOmit;
    clientControlDimension?: Prisma.ClientControlDimensionOmit;
    clientControlTest?: Prisma.ClientControlTestOmit;
    organization?: Prisma.OrganizationOmit;
    regulation?: Prisma.RegulationOmit;
    organizationRegulation?: Prisma.OrganizationRegulationOmit;
    organizationResponsible?: Prisma.OrganizationResponsibleOmit;
    service?: Prisma.ServiceOmit;
    serviceTrustCriterion?: Prisma.ServiceTrustCriterionOmit;
    serviceRegulation?: Prisma.ServiceRegulationOmit;
    serviceFramework?: Prisma.ServiceFrameworkOmit;
    subserviceOrganization?: Prisma.SubserviceOrganizationOmit;
    csoc?: Prisma.CsocOmit;
    cuec?: Prisma.CuecOmit;
    systemDescription?: Prisma.SystemDescriptionOmit;
    scope?: Prisma.ScopeOmit;
    asset?: Prisma.AssetOmit;
    serviceAsset?: Prisma.ServiceAssetOmit;
    assetProvisioning?: Prisma.AssetProvisioningOmit;
    scheduleRule?: Prisma.ScheduleRuleOmit;
    execution?: Prisma.ExecutionOmit;
    checkResult?: Prisma.CheckResultOmit;
    executionLog?: Prisma.ExecutionLogOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
