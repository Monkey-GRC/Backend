import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CheckResultModel = runtime.Types.Result.DefaultSelection<Prisma.$CheckResultPayload>;
export type AggregateCheckResult = {
    _count: CheckResultCountAggregateOutputType | null;
    _min: CheckResultMinAggregateOutputType | null;
    _max: CheckResultMaxAggregateOutputType | null;
};
export type CheckResultMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    executionId: string | null;
    checkId: string | null;
    platform: string | null;
    policyId: string | null;
    rawCheckId: string | null;
    result: $Enums.CheckResultStatus | null;
    evaluatedAt: Date | null;
};
export type CheckResultMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    executionId: string | null;
    checkId: string | null;
    platform: string | null;
    policyId: string | null;
    rawCheckId: string | null;
    result: $Enums.CheckResultStatus | null;
    evaluatedAt: Date | null;
};
export type CheckResultCountAggregateOutputType = {
    id: number;
    tenantId: number;
    executionId: number;
    checkId: number;
    platform: number;
    policyId: number;
    rawCheckId: number;
    result: number;
    evaluatedAt: number;
    _all: number;
};
export type CheckResultMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    executionId?: true;
    checkId?: true;
    platform?: true;
    policyId?: true;
    rawCheckId?: true;
    result?: true;
    evaluatedAt?: true;
};
export type CheckResultMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    executionId?: true;
    checkId?: true;
    platform?: true;
    policyId?: true;
    rawCheckId?: true;
    result?: true;
    evaluatedAt?: true;
};
export type CheckResultCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    executionId?: true;
    checkId?: true;
    platform?: true;
    policyId?: true;
    rawCheckId?: true;
    result?: true;
    evaluatedAt?: true;
    _all?: true;
};
export type CheckResultAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckResultWhereInput;
    orderBy?: Prisma.CheckResultOrderByWithRelationInput | Prisma.CheckResultOrderByWithRelationInput[];
    cursor?: Prisma.CheckResultWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CheckResultCountAggregateInputType;
    _min?: CheckResultMinAggregateInputType;
    _max?: CheckResultMaxAggregateInputType;
};
export type GetCheckResultAggregateType<T extends CheckResultAggregateArgs> = {
    [P in keyof T & keyof AggregateCheckResult]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCheckResult[P]> : Prisma.GetScalarType<T[P], AggregateCheckResult[P]>;
};
export type CheckResultGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckResultWhereInput;
    orderBy?: Prisma.CheckResultOrderByWithAggregationInput | Prisma.CheckResultOrderByWithAggregationInput[];
    by: Prisma.CheckResultScalarFieldEnum[] | Prisma.CheckResultScalarFieldEnum;
    having?: Prisma.CheckResultScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CheckResultCountAggregateInputType | true;
    _min?: CheckResultMinAggregateInputType;
    _max?: CheckResultMaxAggregateInputType;
};
export type CheckResultGroupByOutputType = {
    id: string;
    tenantId: string;
    executionId: string;
    checkId: string;
    platform: string;
    policyId: string;
    rawCheckId: string;
    result: $Enums.CheckResultStatus;
    evaluatedAt: Date;
    _count: CheckResultCountAggregateOutputType | null;
    _min: CheckResultMinAggregateOutputType | null;
    _max: CheckResultMaxAggregateOutputType | null;
};
type GetCheckResultGroupByPayload<T extends CheckResultGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CheckResultGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CheckResultGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CheckResultGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CheckResultGroupByOutputType[P]>;
}>>;
export type CheckResultWhereInput = {
    AND?: Prisma.CheckResultWhereInput | Prisma.CheckResultWhereInput[];
    OR?: Prisma.CheckResultWhereInput[];
    NOT?: Prisma.CheckResultWhereInput | Prisma.CheckResultWhereInput[];
    id?: Prisma.UuidFilter<"CheckResult"> | string;
    tenantId?: Prisma.UuidFilter<"CheckResult"> | string;
    executionId?: Prisma.UuidFilter<"CheckResult"> | string;
    checkId?: Prisma.UuidFilter<"CheckResult"> | string;
    platform?: Prisma.StringFilter<"CheckResult"> | string;
    policyId?: Prisma.StringFilter<"CheckResult"> | string;
    rawCheckId?: Prisma.StringFilter<"CheckResult"> | string;
    result?: Prisma.EnumCheckResultStatusFilter<"CheckResult"> | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFilter<"CheckResult"> | Date | string;
    execution?: Prisma.XOR<Prisma.ExecutionScalarRelationFilter, Prisma.ExecutionWhereInput>;
    check?: Prisma.XOR<Prisma.CheckScalarRelationFilter, Prisma.CheckWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type CheckResultOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    executionId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
    rawCheckId?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    evaluatedAt?: Prisma.SortOrder;
    execution?: Prisma.ExecutionOrderByWithRelationInput;
    check?: Prisma.CheckOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type CheckResultWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.CheckResultWhereInput | Prisma.CheckResultWhereInput[];
    OR?: Prisma.CheckResultWhereInput[];
    NOT?: Prisma.CheckResultWhereInput | Prisma.CheckResultWhereInput[];
    tenantId?: Prisma.UuidFilter<"CheckResult"> | string;
    executionId?: Prisma.UuidFilter<"CheckResult"> | string;
    checkId?: Prisma.UuidFilter<"CheckResult"> | string;
    platform?: Prisma.StringFilter<"CheckResult"> | string;
    policyId?: Prisma.StringFilter<"CheckResult"> | string;
    rawCheckId?: Prisma.StringFilter<"CheckResult"> | string;
    result?: Prisma.EnumCheckResultStatusFilter<"CheckResult"> | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFilter<"CheckResult"> | Date | string;
    execution?: Prisma.XOR<Prisma.ExecutionScalarRelationFilter, Prisma.ExecutionWhereInput>;
    check?: Prisma.XOR<Prisma.CheckScalarRelationFilter, Prisma.CheckWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id">;
export type CheckResultOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    executionId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
    rawCheckId?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    evaluatedAt?: Prisma.SortOrder;
    _count?: Prisma.CheckResultCountOrderByAggregateInput;
    _max?: Prisma.CheckResultMaxOrderByAggregateInput;
    _min?: Prisma.CheckResultMinOrderByAggregateInput;
};
export type CheckResultScalarWhereWithAggregatesInput = {
    AND?: Prisma.CheckResultScalarWhereWithAggregatesInput | Prisma.CheckResultScalarWhereWithAggregatesInput[];
    OR?: Prisma.CheckResultScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CheckResultScalarWhereWithAggregatesInput | Prisma.CheckResultScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"CheckResult"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"CheckResult"> | string;
    executionId?: Prisma.UuidWithAggregatesFilter<"CheckResult"> | string;
    checkId?: Prisma.UuidWithAggregatesFilter<"CheckResult"> | string;
    platform?: Prisma.StringWithAggregatesFilter<"CheckResult"> | string;
    policyId?: Prisma.StringWithAggregatesFilter<"CheckResult"> | string;
    rawCheckId?: Prisma.StringWithAggregatesFilter<"CheckResult"> | string;
    result?: Prisma.EnumCheckResultStatusWithAggregatesFilter<"CheckResult"> | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeWithAggregatesFilter<"CheckResult"> | Date | string;
};
export type CheckResultCreateInput = {
    id?: string;
    platform: string;
    policyId: string;
    rawCheckId: string;
    result: $Enums.CheckResultStatus;
    evaluatedAt: Date | string;
    execution: Prisma.ExecutionCreateNestedOneWithoutCheckResultsInput;
    check: Prisma.CheckCreateNestedOneWithoutCheckResultsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutCheckResultsInput;
};
export type CheckResultUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    executionId: string;
    checkId: string;
    platform: string;
    policyId: string;
    rawCheckId: string;
    result: $Enums.CheckResultStatus;
    evaluatedAt: Date | string;
};
export type CheckResultUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    rawCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumCheckResultStatusFieldUpdateOperationsInput | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    execution?: Prisma.ExecutionUpdateOneRequiredWithoutCheckResultsNestedInput;
    check?: Prisma.CheckUpdateOneRequiredWithoutCheckResultsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutCheckResultsNestedInput;
};
export type CheckResultUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    executionId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    rawCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumCheckResultStatusFieldUpdateOperationsInput | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckResultCreateManyInput = {
    id?: string;
    tenantId: string;
    executionId: string;
    checkId: string;
    platform: string;
    policyId: string;
    rawCheckId: string;
    result: $Enums.CheckResultStatus;
    evaluatedAt: Date | string;
};
export type CheckResultUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    rawCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumCheckResultStatusFieldUpdateOperationsInput | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckResultUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    executionId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    rawCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumCheckResultStatusFieldUpdateOperationsInput | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckResultListRelationFilter = {
    every?: Prisma.CheckResultWhereInput;
    some?: Prisma.CheckResultWhereInput;
    none?: Prisma.CheckResultWhereInput;
};
export type CheckResultOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CheckResultCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    executionId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
    rawCheckId?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    evaluatedAt?: Prisma.SortOrder;
};
export type CheckResultMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    executionId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
    rawCheckId?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    evaluatedAt?: Prisma.SortOrder;
};
export type CheckResultMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    executionId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
    rawCheckId?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    evaluatedAt?: Prisma.SortOrder;
};
export type CheckResultCreateNestedManyWithoutCheckInput = {
    create?: Prisma.XOR<Prisma.CheckResultCreateWithoutCheckInput, Prisma.CheckResultUncheckedCreateWithoutCheckInput> | Prisma.CheckResultCreateWithoutCheckInput[] | Prisma.CheckResultUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.CheckResultCreateOrConnectWithoutCheckInput | Prisma.CheckResultCreateOrConnectWithoutCheckInput[];
    createMany?: Prisma.CheckResultCreateManyCheckInputEnvelope;
    connect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
};
export type CheckResultUncheckedCreateNestedManyWithoutCheckInput = {
    create?: Prisma.XOR<Prisma.CheckResultCreateWithoutCheckInput, Prisma.CheckResultUncheckedCreateWithoutCheckInput> | Prisma.CheckResultCreateWithoutCheckInput[] | Prisma.CheckResultUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.CheckResultCreateOrConnectWithoutCheckInput | Prisma.CheckResultCreateOrConnectWithoutCheckInput[];
    createMany?: Prisma.CheckResultCreateManyCheckInputEnvelope;
    connect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
};
export type CheckResultUpdateManyWithoutCheckNestedInput = {
    create?: Prisma.XOR<Prisma.CheckResultCreateWithoutCheckInput, Prisma.CheckResultUncheckedCreateWithoutCheckInput> | Prisma.CheckResultCreateWithoutCheckInput[] | Prisma.CheckResultUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.CheckResultCreateOrConnectWithoutCheckInput | Prisma.CheckResultCreateOrConnectWithoutCheckInput[];
    upsert?: Prisma.CheckResultUpsertWithWhereUniqueWithoutCheckInput | Prisma.CheckResultUpsertWithWhereUniqueWithoutCheckInput[];
    createMany?: Prisma.CheckResultCreateManyCheckInputEnvelope;
    set?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    disconnect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    delete?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    connect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    update?: Prisma.CheckResultUpdateWithWhereUniqueWithoutCheckInput | Prisma.CheckResultUpdateWithWhereUniqueWithoutCheckInput[];
    updateMany?: Prisma.CheckResultUpdateManyWithWhereWithoutCheckInput | Prisma.CheckResultUpdateManyWithWhereWithoutCheckInput[];
    deleteMany?: Prisma.CheckResultScalarWhereInput | Prisma.CheckResultScalarWhereInput[];
};
export type CheckResultUncheckedUpdateManyWithoutCheckNestedInput = {
    create?: Prisma.XOR<Prisma.CheckResultCreateWithoutCheckInput, Prisma.CheckResultUncheckedCreateWithoutCheckInput> | Prisma.CheckResultCreateWithoutCheckInput[] | Prisma.CheckResultUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.CheckResultCreateOrConnectWithoutCheckInput | Prisma.CheckResultCreateOrConnectWithoutCheckInput[];
    upsert?: Prisma.CheckResultUpsertWithWhereUniqueWithoutCheckInput | Prisma.CheckResultUpsertWithWhereUniqueWithoutCheckInput[];
    createMany?: Prisma.CheckResultCreateManyCheckInputEnvelope;
    set?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    disconnect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    delete?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    connect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    update?: Prisma.CheckResultUpdateWithWhereUniqueWithoutCheckInput | Prisma.CheckResultUpdateWithWhereUniqueWithoutCheckInput[];
    updateMany?: Prisma.CheckResultUpdateManyWithWhereWithoutCheckInput | Prisma.CheckResultUpdateManyWithWhereWithoutCheckInput[];
    deleteMany?: Prisma.CheckResultScalarWhereInput | Prisma.CheckResultScalarWhereInput[];
};
export type CheckResultCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.CheckResultCreateWithoutTenantInput, Prisma.CheckResultUncheckedCreateWithoutTenantInput> | Prisma.CheckResultCreateWithoutTenantInput[] | Prisma.CheckResultUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.CheckResultCreateOrConnectWithoutTenantInput | Prisma.CheckResultCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.CheckResultCreateManyTenantInputEnvelope;
    connect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
};
export type CheckResultUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.CheckResultCreateWithoutTenantInput, Prisma.CheckResultUncheckedCreateWithoutTenantInput> | Prisma.CheckResultCreateWithoutTenantInput[] | Prisma.CheckResultUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.CheckResultCreateOrConnectWithoutTenantInput | Prisma.CheckResultCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.CheckResultCreateManyTenantInputEnvelope;
    connect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
};
export type CheckResultUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.CheckResultCreateWithoutTenantInput, Prisma.CheckResultUncheckedCreateWithoutTenantInput> | Prisma.CheckResultCreateWithoutTenantInput[] | Prisma.CheckResultUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.CheckResultCreateOrConnectWithoutTenantInput | Prisma.CheckResultCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.CheckResultUpsertWithWhereUniqueWithoutTenantInput | Prisma.CheckResultUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.CheckResultCreateManyTenantInputEnvelope;
    set?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    disconnect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    delete?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    connect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    update?: Prisma.CheckResultUpdateWithWhereUniqueWithoutTenantInput | Prisma.CheckResultUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.CheckResultUpdateManyWithWhereWithoutTenantInput | Prisma.CheckResultUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.CheckResultScalarWhereInput | Prisma.CheckResultScalarWhereInput[];
};
export type CheckResultUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.CheckResultCreateWithoutTenantInput, Prisma.CheckResultUncheckedCreateWithoutTenantInput> | Prisma.CheckResultCreateWithoutTenantInput[] | Prisma.CheckResultUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.CheckResultCreateOrConnectWithoutTenantInput | Prisma.CheckResultCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.CheckResultUpsertWithWhereUniqueWithoutTenantInput | Prisma.CheckResultUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.CheckResultCreateManyTenantInputEnvelope;
    set?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    disconnect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    delete?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    connect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    update?: Prisma.CheckResultUpdateWithWhereUniqueWithoutTenantInput | Prisma.CheckResultUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.CheckResultUpdateManyWithWhereWithoutTenantInput | Prisma.CheckResultUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.CheckResultScalarWhereInput | Prisma.CheckResultScalarWhereInput[];
};
export type CheckResultCreateNestedManyWithoutExecutionInput = {
    create?: Prisma.XOR<Prisma.CheckResultCreateWithoutExecutionInput, Prisma.CheckResultUncheckedCreateWithoutExecutionInput> | Prisma.CheckResultCreateWithoutExecutionInput[] | Prisma.CheckResultUncheckedCreateWithoutExecutionInput[];
    connectOrCreate?: Prisma.CheckResultCreateOrConnectWithoutExecutionInput | Prisma.CheckResultCreateOrConnectWithoutExecutionInput[];
    createMany?: Prisma.CheckResultCreateManyExecutionInputEnvelope;
    connect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
};
export type CheckResultUncheckedCreateNestedManyWithoutExecutionInput = {
    create?: Prisma.XOR<Prisma.CheckResultCreateWithoutExecutionInput, Prisma.CheckResultUncheckedCreateWithoutExecutionInput> | Prisma.CheckResultCreateWithoutExecutionInput[] | Prisma.CheckResultUncheckedCreateWithoutExecutionInput[];
    connectOrCreate?: Prisma.CheckResultCreateOrConnectWithoutExecutionInput | Prisma.CheckResultCreateOrConnectWithoutExecutionInput[];
    createMany?: Prisma.CheckResultCreateManyExecutionInputEnvelope;
    connect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
};
export type CheckResultUpdateManyWithoutExecutionNestedInput = {
    create?: Prisma.XOR<Prisma.CheckResultCreateWithoutExecutionInput, Prisma.CheckResultUncheckedCreateWithoutExecutionInput> | Prisma.CheckResultCreateWithoutExecutionInput[] | Prisma.CheckResultUncheckedCreateWithoutExecutionInput[];
    connectOrCreate?: Prisma.CheckResultCreateOrConnectWithoutExecutionInput | Prisma.CheckResultCreateOrConnectWithoutExecutionInput[];
    upsert?: Prisma.CheckResultUpsertWithWhereUniqueWithoutExecutionInput | Prisma.CheckResultUpsertWithWhereUniqueWithoutExecutionInput[];
    createMany?: Prisma.CheckResultCreateManyExecutionInputEnvelope;
    set?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    disconnect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    delete?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    connect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    update?: Prisma.CheckResultUpdateWithWhereUniqueWithoutExecutionInput | Prisma.CheckResultUpdateWithWhereUniqueWithoutExecutionInput[];
    updateMany?: Prisma.CheckResultUpdateManyWithWhereWithoutExecutionInput | Prisma.CheckResultUpdateManyWithWhereWithoutExecutionInput[];
    deleteMany?: Prisma.CheckResultScalarWhereInput | Prisma.CheckResultScalarWhereInput[];
};
export type CheckResultUncheckedUpdateManyWithoutExecutionNestedInput = {
    create?: Prisma.XOR<Prisma.CheckResultCreateWithoutExecutionInput, Prisma.CheckResultUncheckedCreateWithoutExecutionInput> | Prisma.CheckResultCreateWithoutExecutionInput[] | Prisma.CheckResultUncheckedCreateWithoutExecutionInput[];
    connectOrCreate?: Prisma.CheckResultCreateOrConnectWithoutExecutionInput | Prisma.CheckResultCreateOrConnectWithoutExecutionInput[];
    upsert?: Prisma.CheckResultUpsertWithWhereUniqueWithoutExecutionInput | Prisma.CheckResultUpsertWithWhereUniqueWithoutExecutionInput[];
    createMany?: Prisma.CheckResultCreateManyExecutionInputEnvelope;
    set?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    disconnect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    delete?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    connect?: Prisma.CheckResultWhereUniqueInput | Prisma.CheckResultWhereUniqueInput[];
    update?: Prisma.CheckResultUpdateWithWhereUniqueWithoutExecutionInput | Prisma.CheckResultUpdateWithWhereUniqueWithoutExecutionInput[];
    updateMany?: Prisma.CheckResultUpdateManyWithWhereWithoutExecutionInput | Prisma.CheckResultUpdateManyWithWhereWithoutExecutionInput[];
    deleteMany?: Prisma.CheckResultScalarWhereInput | Prisma.CheckResultScalarWhereInput[];
};
export type EnumCheckResultStatusFieldUpdateOperationsInput = {
    set?: $Enums.CheckResultStatus;
};
export type CheckResultCreateWithoutCheckInput = {
    id?: string;
    platform: string;
    policyId: string;
    rawCheckId: string;
    result: $Enums.CheckResultStatus;
    evaluatedAt: Date | string;
    execution: Prisma.ExecutionCreateNestedOneWithoutCheckResultsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutCheckResultsInput;
};
export type CheckResultUncheckedCreateWithoutCheckInput = {
    id?: string;
    tenantId: string;
    executionId: string;
    platform: string;
    policyId: string;
    rawCheckId: string;
    result: $Enums.CheckResultStatus;
    evaluatedAt: Date | string;
};
export type CheckResultCreateOrConnectWithoutCheckInput = {
    where: Prisma.CheckResultWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckResultCreateWithoutCheckInput, Prisma.CheckResultUncheckedCreateWithoutCheckInput>;
};
export type CheckResultCreateManyCheckInputEnvelope = {
    data: Prisma.CheckResultCreateManyCheckInput | Prisma.CheckResultCreateManyCheckInput[];
    skipDuplicates?: boolean;
};
export type CheckResultUpsertWithWhereUniqueWithoutCheckInput = {
    where: Prisma.CheckResultWhereUniqueInput;
    update: Prisma.XOR<Prisma.CheckResultUpdateWithoutCheckInput, Prisma.CheckResultUncheckedUpdateWithoutCheckInput>;
    create: Prisma.XOR<Prisma.CheckResultCreateWithoutCheckInput, Prisma.CheckResultUncheckedCreateWithoutCheckInput>;
};
export type CheckResultUpdateWithWhereUniqueWithoutCheckInput = {
    where: Prisma.CheckResultWhereUniqueInput;
    data: Prisma.XOR<Prisma.CheckResultUpdateWithoutCheckInput, Prisma.CheckResultUncheckedUpdateWithoutCheckInput>;
};
export type CheckResultUpdateManyWithWhereWithoutCheckInput = {
    where: Prisma.CheckResultScalarWhereInput;
    data: Prisma.XOR<Prisma.CheckResultUpdateManyMutationInput, Prisma.CheckResultUncheckedUpdateManyWithoutCheckInput>;
};
export type CheckResultScalarWhereInput = {
    AND?: Prisma.CheckResultScalarWhereInput | Prisma.CheckResultScalarWhereInput[];
    OR?: Prisma.CheckResultScalarWhereInput[];
    NOT?: Prisma.CheckResultScalarWhereInput | Prisma.CheckResultScalarWhereInput[];
    id?: Prisma.UuidFilter<"CheckResult"> | string;
    tenantId?: Prisma.UuidFilter<"CheckResult"> | string;
    executionId?: Prisma.UuidFilter<"CheckResult"> | string;
    checkId?: Prisma.UuidFilter<"CheckResult"> | string;
    platform?: Prisma.StringFilter<"CheckResult"> | string;
    policyId?: Prisma.StringFilter<"CheckResult"> | string;
    rawCheckId?: Prisma.StringFilter<"CheckResult"> | string;
    result?: Prisma.EnumCheckResultStatusFilter<"CheckResult"> | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFilter<"CheckResult"> | Date | string;
};
export type CheckResultCreateWithoutTenantInput = {
    id?: string;
    platform: string;
    policyId: string;
    rawCheckId: string;
    result: $Enums.CheckResultStatus;
    evaluatedAt: Date | string;
    execution: Prisma.ExecutionCreateNestedOneWithoutCheckResultsInput;
    check: Prisma.CheckCreateNestedOneWithoutCheckResultsInput;
};
export type CheckResultUncheckedCreateWithoutTenantInput = {
    id?: string;
    executionId: string;
    checkId: string;
    platform: string;
    policyId: string;
    rawCheckId: string;
    result: $Enums.CheckResultStatus;
    evaluatedAt: Date | string;
};
export type CheckResultCreateOrConnectWithoutTenantInput = {
    where: Prisma.CheckResultWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckResultCreateWithoutTenantInput, Prisma.CheckResultUncheckedCreateWithoutTenantInput>;
};
export type CheckResultCreateManyTenantInputEnvelope = {
    data: Prisma.CheckResultCreateManyTenantInput | Prisma.CheckResultCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type CheckResultUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.CheckResultWhereUniqueInput;
    update: Prisma.XOR<Prisma.CheckResultUpdateWithoutTenantInput, Prisma.CheckResultUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.CheckResultCreateWithoutTenantInput, Prisma.CheckResultUncheckedCreateWithoutTenantInput>;
};
export type CheckResultUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.CheckResultWhereUniqueInput;
    data: Prisma.XOR<Prisma.CheckResultUpdateWithoutTenantInput, Prisma.CheckResultUncheckedUpdateWithoutTenantInput>;
};
export type CheckResultUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.CheckResultScalarWhereInput;
    data: Prisma.XOR<Prisma.CheckResultUpdateManyMutationInput, Prisma.CheckResultUncheckedUpdateManyWithoutTenantInput>;
};
export type CheckResultCreateWithoutExecutionInput = {
    id?: string;
    platform: string;
    policyId: string;
    rawCheckId: string;
    result: $Enums.CheckResultStatus;
    evaluatedAt: Date | string;
    check: Prisma.CheckCreateNestedOneWithoutCheckResultsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutCheckResultsInput;
};
export type CheckResultUncheckedCreateWithoutExecutionInput = {
    id?: string;
    tenantId: string;
    checkId: string;
    platform: string;
    policyId: string;
    rawCheckId: string;
    result: $Enums.CheckResultStatus;
    evaluatedAt: Date | string;
};
export type CheckResultCreateOrConnectWithoutExecutionInput = {
    where: Prisma.CheckResultWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckResultCreateWithoutExecutionInput, Prisma.CheckResultUncheckedCreateWithoutExecutionInput>;
};
export type CheckResultCreateManyExecutionInputEnvelope = {
    data: Prisma.CheckResultCreateManyExecutionInput | Prisma.CheckResultCreateManyExecutionInput[];
    skipDuplicates?: boolean;
};
export type CheckResultUpsertWithWhereUniqueWithoutExecutionInput = {
    where: Prisma.CheckResultWhereUniqueInput;
    update: Prisma.XOR<Prisma.CheckResultUpdateWithoutExecutionInput, Prisma.CheckResultUncheckedUpdateWithoutExecutionInput>;
    create: Prisma.XOR<Prisma.CheckResultCreateWithoutExecutionInput, Prisma.CheckResultUncheckedCreateWithoutExecutionInput>;
};
export type CheckResultUpdateWithWhereUniqueWithoutExecutionInput = {
    where: Prisma.CheckResultWhereUniqueInput;
    data: Prisma.XOR<Prisma.CheckResultUpdateWithoutExecutionInput, Prisma.CheckResultUncheckedUpdateWithoutExecutionInput>;
};
export type CheckResultUpdateManyWithWhereWithoutExecutionInput = {
    where: Prisma.CheckResultScalarWhereInput;
    data: Prisma.XOR<Prisma.CheckResultUpdateManyMutationInput, Prisma.CheckResultUncheckedUpdateManyWithoutExecutionInput>;
};
export type CheckResultCreateManyCheckInput = {
    id?: string;
    tenantId: string;
    executionId: string;
    platform: string;
    policyId: string;
    rawCheckId: string;
    result: $Enums.CheckResultStatus;
    evaluatedAt: Date | string;
};
export type CheckResultUpdateWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    rawCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumCheckResultStatusFieldUpdateOperationsInput | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    execution?: Prisma.ExecutionUpdateOneRequiredWithoutCheckResultsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutCheckResultsNestedInput;
};
export type CheckResultUncheckedUpdateWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    executionId?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    rawCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumCheckResultStatusFieldUpdateOperationsInput | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckResultUncheckedUpdateManyWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    executionId?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    rawCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumCheckResultStatusFieldUpdateOperationsInput | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckResultCreateManyTenantInput = {
    id?: string;
    executionId: string;
    checkId: string;
    platform: string;
    policyId: string;
    rawCheckId: string;
    result: $Enums.CheckResultStatus;
    evaluatedAt: Date | string;
};
export type CheckResultUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    rawCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumCheckResultStatusFieldUpdateOperationsInput | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    execution?: Prisma.ExecutionUpdateOneRequiredWithoutCheckResultsNestedInput;
    check?: Prisma.CheckUpdateOneRequiredWithoutCheckResultsNestedInput;
};
export type CheckResultUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    executionId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    rawCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumCheckResultStatusFieldUpdateOperationsInput | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckResultUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    executionId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    rawCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumCheckResultStatusFieldUpdateOperationsInput | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckResultCreateManyExecutionInput = {
    id?: string;
    tenantId: string;
    checkId: string;
    platform: string;
    policyId: string;
    rawCheckId: string;
    result: $Enums.CheckResultStatus;
    evaluatedAt: Date | string;
};
export type CheckResultUpdateWithoutExecutionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    rawCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumCheckResultStatusFieldUpdateOperationsInput | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    check?: Prisma.CheckUpdateOneRequiredWithoutCheckResultsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutCheckResultsNestedInput;
};
export type CheckResultUncheckedUpdateWithoutExecutionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    rawCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumCheckResultStatusFieldUpdateOperationsInput | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckResultUncheckedUpdateManyWithoutExecutionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    rawCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumCheckResultStatusFieldUpdateOperationsInput | $Enums.CheckResultStatus;
    evaluatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckResultSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    executionId?: boolean;
    checkId?: boolean;
    platform?: boolean;
    policyId?: boolean;
    rawCheckId?: boolean;
    result?: boolean;
    evaluatedAt?: boolean;
    execution?: boolean | Prisma.ExecutionDefaultArgs<ExtArgs>;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["checkResult"]>;
export type CheckResultSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    executionId?: boolean;
    checkId?: boolean;
    platform?: boolean;
    policyId?: boolean;
    rawCheckId?: boolean;
    result?: boolean;
    evaluatedAt?: boolean;
    execution?: boolean | Prisma.ExecutionDefaultArgs<ExtArgs>;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["checkResult"]>;
export type CheckResultSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    executionId?: boolean;
    checkId?: boolean;
    platform?: boolean;
    policyId?: boolean;
    rawCheckId?: boolean;
    result?: boolean;
    evaluatedAt?: boolean;
    execution?: boolean | Prisma.ExecutionDefaultArgs<ExtArgs>;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["checkResult"]>;
export type CheckResultSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    executionId?: boolean;
    checkId?: boolean;
    platform?: boolean;
    policyId?: boolean;
    rawCheckId?: boolean;
    result?: boolean;
    evaluatedAt?: boolean;
};
export type CheckResultOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "executionId" | "checkId" | "platform" | "policyId" | "rawCheckId" | "result" | "evaluatedAt", ExtArgs["result"]["checkResult"]>;
export type CheckResultInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    execution?: boolean | Prisma.ExecutionDefaultArgs<ExtArgs>;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type CheckResultIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    execution?: boolean | Prisma.ExecutionDefaultArgs<ExtArgs>;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type CheckResultIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    execution?: boolean | Prisma.ExecutionDefaultArgs<ExtArgs>;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $CheckResultPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "CheckResult";
    objects: {
        execution: Prisma.$ExecutionPayload<ExtArgs>;
        check: Prisma.$CheckPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        executionId: string;
        checkId: string;
        platform: string;
        policyId: string;
        rawCheckId: string;
        result: $Enums.CheckResultStatus;
        evaluatedAt: Date;
    }, ExtArgs["result"]["checkResult"]>;
    composites: {};
};
export type CheckResultGetPayload<S extends boolean | null | undefined | CheckResultDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CheckResultPayload, S>;
export type CheckResultCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CheckResultFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CheckResultCountAggregateInputType | true;
};
export interface CheckResultDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['CheckResult'];
        meta: {
            name: 'CheckResult';
        };
    };
    findUnique<T extends CheckResultFindUniqueArgs>(args: Prisma.SelectSubset<T, CheckResultFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CheckResultClient<runtime.Types.Result.GetResult<Prisma.$CheckResultPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CheckResultFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CheckResultFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CheckResultClient<runtime.Types.Result.GetResult<Prisma.$CheckResultPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CheckResultFindFirstArgs>(args?: Prisma.SelectSubset<T, CheckResultFindFirstArgs<ExtArgs>>): Prisma.Prisma__CheckResultClient<runtime.Types.Result.GetResult<Prisma.$CheckResultPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CheckResultFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CheckResultFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CheckResultClient<runtime.Types.Result.GetResult<Prisma.$CheckResultPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CheckResultFindManyArgs>(args?: Prisma.SelectSubset<T, CheckResultFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckResultPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CheckResultCreateArgs>(args: Prisma.SelectSubset<T, CheckResultCreateArgs<ExtArgs>>): Prisma.Prisma__CheckResultClient<runtime.Types.Result.GetResult<Prisma.$CheckResultPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CheckResultCreateManyArgs>(args?: Prisma.SelectSubset<T, CheckResultCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends CheckResultCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CheckResultCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckResultPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends CheckResultDeleteArgs>(args: Prisma.SelectSubset<T, CheckResultDeleteArgs<ExtArgs>>): Prisma.Prisma__CheckResultClient<runtime.Types.Result.GetResult<Prisma.$CheckResultPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CheckResultUpdateArgs>(args: Prisma.SelectSubset<T, CheckResultUpdateArgs<ExtArgs>>): Prisma.Prisma__CheckResultClient<runtime.Types.Result.GetResult<Prisma.$CheckResultPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CheckResultDeleteManyArgs>(args?: Prisma.SelectSubset<T, CheckResultDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CheckResultUpdateManyArgs>(args: Prisma.SelectSubset<T, CheckResultUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends CheckResultUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CheckResultUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckResultPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends CheckResultUpsertArgs>(args: Prisma.SelectSubset<T, CheckResultUpsertArgs<ExtArgs>>): Prisma.Prisma__CheckResultClient<runtime.Types.Result.GetResult<Prisma.$CheckResultPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CheckResultCountArgs>(args?: Prisma.Subset<T, CheckResultCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CheckResultCountAggregateOutputType> : number>;
    aggregate<T extends CheckResultAggregateArgs>(args: Prisma.Subset<T, CheckResultAggregateArgs>): Prisma.PrismaPromise<GetCheckResultAggregateType<T>>;
    groupBy<T extends CheckResultGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CheckResultGroupByArgs['orderBy'];
    } : {
        orderBy?: CheckResultGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CheckResultGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCheckResultGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CheckResultFieldRefs;
}
export interface Prisma__CheckResultClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    execution<T extends Prisma.ExecutionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ExecutionDefaultArgs<ExtArgs>>): Prisma.Prisma__ExecutionClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    check<T extends Prisma.CheckDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CheckDefaultArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CheckResultFieldRefs {
    readonly id: Prisma.FieldRef<"CheckResult", 'String'>;
    readonly tenantId: Prisma.FieldRef<"CheckResult", 'String'>;
    readonly executionId: Prisma.FieldRef<"CheckResult", 'String'>;
    readonly checkId: Prisma.FieldRef<"CheckResult", 'String'>;
    readonly platform: Prisma.FieldRef<"CheckResult", 'String'>;
    readonly policyId: Prisma.FieldRef<"CheckResult", 'String'>;
    readonly rawCheckId: Prisma.FieldRef<"CheckResult", 'String'>;
    readonly result: Prisma.FieldRef<"CheckResult", 'CheckResultStatus'>;
    readonly evaluatedAt: Prisma.FieldRef<"CheckResult", 'DateTime'>;
}
export type CheckResultFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckResultSelect<ExtArgs> | null;
    omit?: Prisma.CheckResultOmit<ExtArgs> | null;
    include?: Prisma.CheckResultInclude<ExtArgs> | null;
    where: Prisma.CheckResultWhereUniqueInput;
};
export type CheckResultFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckResultSelect<ExtArgs> | null;
    omit?: Prisma.CheckResultOmit<ExtArgs> | null;
    include?: Prisma.CheckResultInclude<ExtArgs> | null;
    where: Prisma.CheckResultWhereUniqueInput;
};
export type CheckResultFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckResultSelect<ExtArgs> | null;
    omit?: Prisma.CheckResultOmit<ExtArgs> | null;
    include?: Prisma.CheckResultInclude<ExtArgs> | null;
    where?: Prisma.CheckResultWhereInput;
    orderBy?: Prisma.CheckResultOrderByWithRelationInput | Prisma.CheckResultOrderByWithRelationInput[];
    cursor?: Prisma.CheckResultWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CheckResultScalarFieldEnum | Prisma.CheckResultScalarFieldEnum[];
};
export type CheckResultFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckResultSelect<ExtArgs> | null;
    omit?: Prisma.CheckResultOmit<ExtArgs> | null;
    include?: Prisma.CheckResultInclude<ExtArgs> | null;
    where?: Prisma.CheckResultWhereInput;
    orderBy?: Prisma.CheckResultOrderByWithRelationInput | Prisma.CheckResultOrderByWithRelationInput[];
    cursor?: Prisma.CheckResultWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CheckResultScalarFieldEnum | Prisma.CheckResultScalarFieldEnum[];
};
export type CheckResultFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckResultSelect<ExtArgs> | null;
    omit?: Prisma.CheckResultOmit<ExtArgs> | null;
    include?: Prisma.CheckResultInclude<ExtArgs> | null;
    where?: Prisma.CheckResultWhereInput;
    orderBy?: Prisma.CheckResultOrderByWithRelationInput | Prisma.CheckResultOrderByWithRelationInput[];
    cursor?: Prisma.CheckResultWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CheckResultScalarFieldEnum | Prisma.CheckResultScalarFieldEnum[];
};
export type CheckResultCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckResultSelect<ExtArgs> | null;
    omit?: Prisma.CheckResultOmit<ExtArgs> | null;
    include?: Prisma.CheckResultInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CheckResultCreateInput, Prisma.CheckResultUncheckedCreateInput>;
};
export type CheckResultCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CheckResultCreateManyInput | Prisma.CheckResultCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CheckResultCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckResultSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CheckResultOmit<ExtArgs> | null;
    data: Prisma.CheckResultCreateManyInput | Prisma.CheckResultCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.CheckResultIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type CheckResultUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckResultSelect<ExtArgs> | null;
    omit?: Prisma.CheckResultOmit<ExtArgs> | null;
    include?: Prisma.CheckResultInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CheckResultUpdateInput, Prisma.CheckResultUncheckedUpdateInput>;
    where: Prisma.CheckResultWhereUniqueInput;
};
export type CheckResultUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CheckResultUpdateManyMutationInput, Prisma.CheckResultUncheckedUpdateManyInput>;
    where?: Prisma.CheckResultWhereInput;
    limit?: number;
};
export type CheckResultUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckResultSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CheckResultOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CheckResultUpdateManyMutationInput, Prisma.CheckResultUncheckedUpdateManyInput>;
    where?: Prisma.CheckResultWhereInput;
    limit?: number;
    include?: Prisma.CheckResultIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type CheckResultUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckResultSelect<ExtArgs> | null;
    omit?: Prisma.CheckResultOmit<ExtArgs> | null;
    include?: Prisma.CheckResultInclude<ExtArgs> | null;
    where: Prisma.CheckResultWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckResultCreateInput, Prisma.CheckResultUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CheckResultUpdateInput, Prisma.CheckResultUncheckedUpdateInput>;
};
export type CheckResultDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckResultSelect<ExtArgs> | null;
    omit?: Prisma.CheckResultOmit<ExtArgs> | null;
    include?: Prisma.CheckResultInclude<ExtArgs> | null;
    where: Prisma.CheckResultWhereUniqueInput;
};
export type CheckResultDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckResultWhereInput;
    limit?: number;
};
export type CheckResultDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckResultSelect<ExtArgs> | null;
    omit?: Prisma.CheckResultOmit<ExtArgs> | null;
    include?: Prisma.CheckResultInclude<ExtArgs> | null;
};
export {};
