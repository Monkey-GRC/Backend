import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ExecutionModel = runtime.Types.Result.DefaultSelection<Prisma.$ExecutionPayload>;
export type AggregateExecution = {
    _count: ExecutionCountAggregateOutputType | null;
    _avg: ExecutionAvgAggregateOutputType | null;
    _sum: ExecutionSumAggregateOutputType | null;
    _min: ExecutionMinAggregateOutputType | null;
    _max: ExecutionMaxAggregateOutputType | null;
};
export type ExecutionAvgAggregateOutputType = {
    progressPercentage: number | null;
};
export type ExecutionSumAggregateOutputType = {
    progressPercentage: number | null;
};
export type ExecutionMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    assetId: string | null;
    scheduleRuleId: string | null;
    retryOfId: string | null;
    startedAt: Date | null;
    finishedAt: Date | null;
    status: $Enums.ExecutionStatus | null;
    progressPercentage: number | null;
    origin: $Enums.ExecutionOrigin | null;
};
export type ExecutionMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    assetId: string | null;
    scheduleRuleId: string | null;
    retryOfId: string | null;
    startedAt: Date | null;
    finishedAt: Date | null;
    status: $Enums.ExecutionStatus | null;
    progressPercentage: number | null;
    origin: $Enums.ExecutionOrigin | null;
};
export type ExecutionCountAggregateOutputType = {
    id: number;
    tenantId: number;
    assetId: number;
    scheduleRuleId: number;
    retryOfId: number;
    startedAt: number;
    finishedAt: number;
    status: number;
    progressPercentage: number;
    origin: number;
    _all: number;
};
export type ExecutionAvgAggregateInputType = {
    progressPercentage?: true;
};
export type ExecutionSumAggregateInputType = {
    progressPercentage?: true;
};
export type ExecutionMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    assetId?: true;
    scheduleRuleId?: true;
    retryOfId?: true;
    startedAt?: true;
    finishedAt?: true;
    status?: true;
    progressPercentage?: true;
    origin?: true;
};
export type ExecutionMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    assetId?: true;
    scheduleRuleId?: true;
    retryOfId?: true;
    startedAt?: true;
    finishedAt?: true;
    status?: true;
    progressPercentage?: true;
    origin?: true;
};
export type ExecutionCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    assetId?: true;
    scheduleRuleId?: true;
    retryOfId?: true;
    startedAt?: true;
    finishedAt?: true;
    status?: true;
    progressPercentage?: true;
    origin?: true;
    _all?: true;
};
export type ExecutionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExecutionWhereInput;
    orderBy?: Prisma.ExecutionOrderByWithRelationInput | Prisma.ExecutionOrderByWithRelationInput[];
    cursor?: Prisma.ExecutionWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ExecutionCountAggregateInputType;
    _avg?: ExecutionAvgAggregateInputType;
    _sum?: ExecutionSumAggregateInputType;
    _min?: ExecutionMinAggregateInputType;
    _max?: ExecutionMaxAggregateInputType;
};
export type GetExecutionAggregateType<T extends ExecutionAggregateArgs> = {
    [P in keyof T & keyof AggregateExecution]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateExecution[P]> : Prisma.GetScalarType<T[P], AggregateExecution[P]>;
};
export type ExecutionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExecutionWhereInput;
    orderBy?: Prisma.ExecutionOrderByWithAggregationInput | Prisma.ExecutionOrderByWithAggregationInput[];
    by: Prisma.ExecutionScalarFieldEnum[] | Prisma.ExecutionScalarFieldEnum;
    having?: Prisma.ExecutionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ExecutionCountAggregateInputType | true;
    _avg?: ExecutionAvgAggregateInputType;
    _sum?: ExecutionSumAggregateInputType;
    _min?: ExecutionMinAggregateInputType;
    _max?: ExecutionMaxAggregateInputType;
};
export type ExecutionGroupByOutputType = {
    id: string;
    tenantId: string;
    assetId: string;
    scheduleRuleId: string | null;
    retryOfId: string | null;
    startedAt: Date;
    finishedAt: Date | null;
    status: $Enums.ExecutionStatus;
    progressPercentage: number;
    origin: $Enums.ExecutionOrigin;
    _count: ExecutionCountAggregateOutputType | null;
    _avg: ExecutionAvgAggregateOutputType | null;
    _sum: ExecutionSumAggregateOutputType | null;
    _min: ExecutionMinAggregateOutputType | null;
    _max: ExecutionMaxAggregateOutputType | null;
};
type GetExecutionGroupByPayload<T extends ExecutionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ExecutionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ExecutionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ExecutionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ExecutionGroupByOutputType[P]>;
}>>;
export type ExecutionWhereInput = {
    AND?: Prisma.ExecutionWhereInput | Prisma.ExecutionWhereInput[];
    OR?: Prisma.ExecutionWhereInput[];
    NOT?: Prisma.ExecutionWhereInput | Prisma.ExecutionWhereInput[];
    id?: Prisma.UuidFilter<"Execution"> | string;
    tenantId?: Prisma.UuidFilter<"Execution"> | string;
    assetId?: Prisma.UuidFilter<"Execution"> | string;
    scheduleRuleId?: Prisma.UuidNullableFilter<"Execution"> | string | null;
    retryOfId?: Prisma.UuidNullableFilter<"Execution"> | string | null;
    startedAt?: Prisma.DateTimeFilter<"Execution"> | Date | string;
    finishedAt?: Prisma.DateTimeNullableFilter<"Execution"> | Date | string | null;
    status?: Prisma.EnumExecutionStatusFilter<"Execution"> | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFilter<"Execution"> | number;
    origin?: Prisma.EnumExecutionOriginFilter<"Execution"> | $Enums.ExecutionOrigin;
    asset?: Prisma.XOR<Prisma.AssetScalarRelationFilter, Prisma.AssetWhereInput>;
    scheduleRule?: Prisma.XOR<Prisma.ScheduleRuleNullableScalarRelationFilter, Prisma.ScheduleRuleWhereInput> | null;
    retryOf?: Prisma.XOR<Prisma.ExecutionNullableScalarRelationFilter, Prisma.ExecutionWhereInput> | null;
    retries?: Prisma.ExecutionListRelationFilter;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    checkResults?: Prisma.CheckResultListRelationFilter;
    logs?: Prisma.ExecutionLogListRelationFilter;
};
export type ExecutionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    scheduleRuleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    retryOfId?: Prisma.SortOrderInput | Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    finishedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    progressPercentage?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    asset?: Prisma.AssetOrderByWithRelationInput;
    scheduleRule?: Prisma.ScheduleRuleOrderByWithRelationInput;
    retryOf?: Prisma.ExecutionOrderByWithRelationInput;
    retries?: Prisma.ExecutionOrderByRelationAggregateInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
    checkResults?: Prisma.CheckResultOrderByRelationAggregateInput;
    logs?: Prisma.ExecutionLogOrderByRelationAggregateInput;
};
export type ExecutionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ExecutionWhereInput | Prisma.ExecutionWhereInput[];
    OR?: Prisma.ExecutionWhereInput[];
    NOT?: Prisma.ExecutionWhereInput | Prisma.ExecutionWhereInput[];
    tenantId?: Prisma.UuidFilter<"Execution"> | string;
    assetId?: Prisma.UuidFilter<"Execution"> | string;
    scheduleRuleId?: Prisma.UuidNullableFilter<"Execution"> | string | null;
    retryOfId?: Prisma.UuidNullableFilter<"Execution"> | string | null;
    startedAt?: Prisma.DateTimeFilter<"Execution"> | Date | string;
    finishedAt?: Prisma.DateTimeNullableFilter<"Execution"> | Date | string | null;
    status?: Prisma.EnumExecutionStatusFilter<"Execution"> | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFilter<"Execution"> | number;
    origin?: Prisma.EnumExecutionOriginFilter<"Execution"> | $Enums.ExecutionOrigin;
    asset?: Prisma.XOR<Prisma.AssetScalarRelationFilter, Prisma.AssetWhereInput>;
    scheduleRule?: Prisma.XOR<Prisma.ScheduleRuleNullableScalarRelationFilter, Prisma.ScheduleRuleWhereInput> | null;
    retryOf?: Prisma.XOR<Prisma.ExecutionNullableScalarRelationFilter, Prisma.ExecutionWhereInput> | null;
    retries?: Prisma.ExecutionListRelationFilter;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    checkResults?: Prisma.CheckResultListRelationFilter;
    logs?: Prisma.ExecutionLogListRelationFilter;
}, "id">;
export type ExecutionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    scheduleRuleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    retryOfId?: Prisma.SortOrderInput | Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    finishedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    progressPercentage?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    _count?: Prisma.ExecutionCountOrderByAggregateInput;
    _avg?: Prisma.ExecutionAvgOrderByAggregateInput;
    _max?: Prisma.ExecutionMaxOrderByAggregateInput;
    _min?: Prisma.ExecutionMinOrderByAggregateInput;
    _sum?: Prisma.ExecutionSumOrderByAggregateInput;
};
export type ExecutionScalarWhereWithAggregatesInput = {
    AND?: Prisma.ExecutionScalarWhereWithAggregatesInput | Prisma.ExecutionScalarWhereWithAggregatesInput[];
    OR?: Prisma.ExecutionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ExecutionScalarWhereWithAggregatesInput | Prisma.ExecutionScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Execution"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"Execution"> | string;
    assetId?: Prisma.UuidWithAggregatesFilter<"Execution"> | string;
    scheduleRuleId?: Prisma.UuidNullableWithAggregatesFilter<"Execution"> | string | null;
    retryOfId?: Prisma.UuidNullableWithAggregatesFilter<"Execution"> | string | null;
    startedAt?: Prisma.DateTimeWithAggregatesFilter<"Execution"> | Date | string;
    finishedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Execution"> | Date | string | null;
    status?: Prisma.EnumExecutionStatusWithAggregatesFilter<"Execution"> | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntWithAggregatesFilter<"Execution"> | number;
    origin?: Prisma.EnumExecutionOriginWithAggregatesFilter<"Execution"> | $Enums.ExecutionOrigin;
};
export type ExecutionCreateInput = {
    id?: string;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    asset: Prisma.AssetCreateNestedOneWithoutExecutionsInput;
    scheduleRule?: Prisma.ScheduleRuleCreateNestedOneWithoutExecutionsInput;
    retryOf?: Prisma.ExecutionCreateNestedOneWithoutRetriesInput;
    retries?: Prisma.ExecutionCreateNestedManyWithoutRetryOfInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutExecutionsInput;
    checkResults?: Prisma.CheckResultCreateNestedManyWithoutExecutionInput;
    logs?: Prisma.ExecutionLogCreateNestedManyWithoutExecutionInput;
};
export type ExecutionUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    scheduleRuleId?: string | null;
    retryOfId?: string | null;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    retries?: Prisma.ExecutionUncheckedCreateNestedManyWithoutRetryOfInput;
    checkResults?: Prisma.CheckResultUncheckedCreateNestedManyWithoutExecutionInput;
    logs?: Prisma.ExecutionLogUncheckedCreateNestedManyWithoutExecutionInput;
};
export type ExecutionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    asset?: Prisma.AssetUpdateOneRequiredWithoutExecutionsNestedInput;
    scheduleRule?: Prisma.ScheduleRuleUpdateOneWithoutExecutionsNestedInput;
    retryOf?: Prisma.ExecutionUpdateOneWithoutRetriesNestedInput;
    retries?: Prisma.ExecutionUpdateManyWithoutRetryOfNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutExecutionsNestedInput;
    checkResults?: Prisma.CheckResultUpdateManyWithoutExecutionNestedInput;
    logs?: Prisma.ExecutionLogUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    scheduleRuleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    retryOfId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    retries?: Prisma.ExecutionUncheckedUpdateManyWithoutRetryOfNestedInput;
    checkResults?: Prisma.CheckResultUncheckedUpdateManyWithoutExecutionNestedInput;
    logs?: Prisma.ExecutionLogUncheckedUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionCreateManyInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    scheduleRuleId?: string | null;
    retryOfId?: string | null;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
};
export type ExecutionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
};
export type ExecutionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    scheduleRuleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    retryOfId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
};
export type ExecutionListRelationFilter = {
    every?: Prisma.ExecutionWhereInput;
    some?: Prisma.ExecutionWhereInput;
    none?: Prisma.ExecutionWhereInput;
};
export type ExecutionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ExecutionNullableScalarRelationFilter = {
    is?: Prisma.ExecutionWhereInput | null;
    isNot?: Prisma.ExecutionWhereInput | null;
};
export type ExecutionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    scheduleRuleId?: Prisma.SortOrder;
    retryOfId?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    finishedAt?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    progressPercentage?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
};
export type ExecutionAvgOrderByAggregateInput = {
    progressPercentage?: Prisma.SortOrder;
};
export type ExecutionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    scheduleRuleId?: Prisma.SortOrder;
    retryOfId?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    finishedAt?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    progressPercentage?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
};
export type ExecutionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    scheduleRuleId?: Prisma.SortOrder;
    retryOfId?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    finishedAt?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    progressPercentage?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
};
export type ExecutionSumOrderByAggregateInput = {
    progressPercentage?: Prisma.SortOrder;
};
export type ExecutionScalarRelationFilter = {
    is?: Prisma.ExecutionWhereInput;
    isNot?: Prisma.ExecutionWhereInput;
};
export type ExecutionCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutTenantInput, Prisma.ExecutionUncheckedCreateWithoutTenantInput> | Prisma.ExecutionCreateWithoutTenantInput[] | Prisma.ExecutionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutTenantInput | Prisma.ExecutionCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ExecutionCreateManyTenantInputEnvelope;
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
};
export type ExecutionUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutTenantInput, Prisma.ExecutionUncheckedCreateWithoutTenantInput> | Prisma.ExecutionCreateWithoutTenantInput[] | Prisma.ExecutionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutTenantInput | Prisma.ExecutionCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ExecutionCreateManyTenantInputEnvelope;
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
};
export type ExecutionUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutTenantInput, Prisma.ExecutionUncheckedCreateWithoutTenantInput> | Prisma.ExecutionCreateWithoutTenantInput[] | Prisma.ExecutionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutTenantInput | Prisma.ExecutionCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ExecutionUpsertWithWhereUniqueWithoutTenantInput | Prisma.ExecutionUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ExecutionCreateManyTenantInputEnvelope;
    set?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    disconnect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    delete?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    update?: Prisma.ExecutionUpdateWithWhereUniqueWithoutTenantInput | Prisma.ExecutionUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ExecutionUpdateManyWithWhereWithoutTenantInput | Prisma.ExecutionUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ExecutionScalarWhereInput | Prisma.ExecutionScalarWhereInput[];
};
export type ExecutionUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutTenantInput, Prisma.ExecutionUncheckedCreateWithoutTenantInput> | Prisma.ExecutionCreateWithoutTenantInput[] | Prisma.ExecutionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutTenantInput | Prisma.ExecutionCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ExecutionUpsertWithWhereUniqueWithoutTenantInput | Prisma.ExecutionUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ExecutionCreateManyTenantInputEnvelope;
    set?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    disconnect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    delete?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    update?: Prisma.ExecutionUpdateWithWhereUniqueWithoutTenantInput | Prisma.ExecutionUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ExecutionUpdateManyWithWhereWithoutTenantInput | Prisma.ExecutionUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ExecutionScalarWhereInput | Prisma.ExecutionScalarWhereInput[];
};
export type ExecutionCreateNestedManyWithoutAssetInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutAssetInput, Prisma.ExecutionUncheckedCreateWithoutAssetInput> | Prisma.ExecutionCreateWithoutAssetInput[] | Prisma.ExecutionUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutAssetInput | Prisma.ExecutionCreateOrConnectWithoutAssetInput[];
    createMany?: Prisma.ExecutionCreateManyAssetInputEnvelope;
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
};
export type ExecutionUncheckedCreateNestedManyWithoutAssetInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutAssetInput, Prisma.ExecutionUncheckedCreateWithoutAssetInput> | Prisma.ExecutionCreateWithoutAssetInput[] | Prisma.ExecutionUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutAssetInput | Prisma.ExecutionCreateOrConnectWithoutAssetInput[];
    createMany?: Prisma.ExecutionCreateManyAssetInputEnvelope;
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
};
export type ExecutionUpdateManyWithoutAssetNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutAssetInput, Prisma.ExecutionUncheckedCreateWithoutAssetInput> | Prisma.ExecutionCreateWithoutAssetInput[] | Prisma.ExecutionUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutAssetInput | Prisma.ExecutionCreateOrConnectWithoutAssetInput[];
    upsert?: Prisma.ExecutionUpsertWithWhereUniqueWithoutAssetInput | Prisma.ExecutionUpsertWithWhereUniqueWithoutAssetInput[];
    createMany?: Prisma.ExecutionCreateManyAssetInputEnvelope;
    set?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    disconnect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    delete?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    update?: Prisma.ExecutionUpdateWithWhereUniqueWithoutAssetInput | Prisma.ExecutionUpdateWithWhereUniqueWithoutAssetInput[];
    updateMany?: Prisma.ExecutionUpdateManyWithWhereWithoutAssetInput | Prisma.ExecutionUpdateManyWithWhereWithoutAssetInput[];
    deleteMany?: Prisma.ExecutionScalarWhereInput | Prisma.ExecutionScalarWhereInput[];
};
export type ExecutionUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutAssetInput, Prisma.ExecutionUncheckedCreateWithoutAssetInput> | Prisma.ExecutionCreateWithoutAssetInput[] | Prisma.ExecutionUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutAssetInput | Prisma.ExecutionCreateOrConnectWithoutAssetInput[];
    upsert?: Prisma.ExecutionUpsertWithWhereUniqueWithoutAssetInput | Prisma.ExecutionUpsertWithWhereUniqueWithoutAssetInput[];
    createMany?: Prisma.ExecutionCreateManyAssetInputEnvelope;
    set?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    disconnect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    delete?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    update?: Prisma.ExecutionUpdateWithWhereUniqueWithoutAssetInput | Prisma.ExecutionUpdateWithWhereUniqueWithoutAssetInput[];
    updateMany?: Prisma.ExecutionUpdateManyWithWhereWithoutAssetInput | Prisma.ExecutionUpdateManyWithWhereWithoutAssetInput[];
    deleteMany?: Prisma.ExecutionScalarWhereInput | Prisma.ExecutionScalarWhereInput[];
};
export type ExecutionCreateNestedManyWithoutScheduleRuleInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutScheduleRuleInput, Prisma.ExecutionUncheckedCreateWithoutScheduleRuleInput> | Prisma.ExecutionCreateWithoutScheduleRuleInput[] | Prisma.ExecutionUncheckedCreateWithoutScheduleRuleInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutScheduleRuleInput | Prisma.ExecutionCreateOrConnectWithoutScheduleRuleInput[];
    createMany?: Prisma.ExecutionCreateManyScheduleRuleInputEnvelope;
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
};
export type ExecutionUncheckedCreateNestedManyWithoutScheduleRuleInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutScheduleRuleInput, Prisma.ExecutionUncheckedCreateWithoutScheduleRuleInput> | Prisma.ExecutionCreateWithoutScheduleRuleInput[] | Prisma.ExecutionUncheckedCreateWithoutScheduleRuleInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutScheduleRuleInput | Prisma.ExecutionCreateOrConnectWithoutScheduleRuleInput[];
    createMany?: Prisma.ExecutionCreateManyScheduleRuleInputEnvelope;
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
};
export type ExecutionUpdateManyWithoutScheduleRuleNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutScheduleRuleInput, Prisma.ExecutionUncheckedCreateWithoutScheduleRuleInput> | Prisma.ExecutionCreateWithoutScheduleRuleInput[] | Prisma.ExecutionUncheckedCreateWithoutScheduleRuleInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutScheduleRuleInput | Prisma.ExecutionCreateOrConnectWithoutScheduleRuleInput[];
    upsert?: Prisma.ExecutionUpsertWithWhereUniqueWithoutScheduleRuleInput | Prisma.ExecutionUpsertWithWhereUniqueWithoutScheduleRuleInput[];
    createMany?: Prisma.ExecutionCreateManyScheduleRuleInputEnvelope;
    set?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    disconnect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    delete?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    update?: Prisma.ExecutionUpdateWithWhereUniqueWithoutScheduleRuleInput | Prisma.ExecutionUpdateWithWhereUniqueWithoutScheduleRuleInput[];
    updateMany?: Prisma.ExecutionUpdateManyWithWhereWithoutScheduleRuleInput | Prisma.ExecutionUpdateManyWithWhereWithoutScheduleRuleInput[];
    deleteMany?: Prisma.ExecutionScalarWhereInput | Prisma.ExecutionScalarWhereInput[];
};
export type ExecutionUncheckedUpdateManyWithoutScheduleRuleNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutScheduleRuleInput, Prisma.ExecutionUncheckedCreateWithoutScheduleRuleInput> | Prisma.ExecutionCreateWithoutScheduleRuleInput[] | Prisma.ExecutionUncheckedCreateWithoutScheduleRuleInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutScheduleRuleInput | Prisma.ExecutionCreateOrConnectWithoutScheduleRuleInput[];
    upsert?: Prisma.ExecutionUpsertWithWhereUniqueWithoutScheduleRuleInput | Prisma.ExecutionUpsertWithWhereUniqueWithoutScheduleRuleInput[];
    createMany?: Prisma.ExecutionCreateManyScheduleRuleInputEnvelope;
    set?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    disconnect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    delete?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    update?: Prisma.ExecutionUpdateWithWhereUniqueWithoutScheduleRuleInput | Prisma.ExecutionUpdateWithWhereUniqueWithoutScheduleRuleInput[];
    updateMany?: Prisma.ExecutionUpdateManyWithWhereWithoutScheduleRuleInput | Prisma.ExecutionUpdateManyWithWhereWithoutScheduleRuleInput[];
    deleteMany?: Prisma.ExecutionScalarWhereInput | Prisma.ExecutionScalarWhereInput[];
};
export type ExecutionCreateNestedOneWithoutRetriesInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutRetriesInput, Prisma.ExecutionUncheckedCreateWithoutRetriesInput>;
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutRetriesInput;
    connect?: Prisma.ExecutionWhereUniqueInput;
};
export type ExecutionCreateNestedManyWithoutRetryOfInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutRetryOfInput, Prisma.ExecutionUncheckedCreateWithoutRetryOfInput> | Prisma.ExecutionCreateWithoutRetryOfInput[] | Prisma.ExecutionUncheckedCreateWithoutRetryOfInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutRetryOfInput | Prisma.ExecutionCreateOrConnectWithoutRetryOfInput[];
    createMany?: Prisma.ExecutionCreateManyRetryOfInputEnvelope;
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
};
export type ExecutionUncheckedCreateNestedManyWithoutRetryOfInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutRetryOfInput, Prisma.ExecutionUncheckedCreateWithoutRetryOfInput> | Prisma.ExecutionCreateWithoutRetryOfInput[] | Prisma.ExecutionUncheckedCreateWithoutRetryOfInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutRetryOfInput | Prisma.ExecutionCreateOrConnectWithoutRetryOfInput[];
    createMany?: Prisma.ExecutionCreateManyRetryOfInputEnvelope;
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
};
export type EnumExecutionStatusFieldUpdateOperationsInput = {
    set?: $Enums.ExecutionStatus;
};
export type EnumExecutionOriginFieldUpdateOperationsInput = {
    set?: $Enums.ExecutionOrigin;
};
export type ExecutionUpdateOneWithoutRetriesNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutRetriesInput, Prisma.ExecutionUncheckedCreateWithoutRetriesInput>;
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutRetriesInput;
    upsert?: Prisma.ExecutionUpsertWithoutRetriesInput;
    disconnect?: Prisma.ExecutionWhereInput | boolean;
    delete?: Prisma.ExecutionWhereInput | boolean;
    connect?: Prisma.ExecutionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ExecutionUpdateToOneWithWhereWithoutRetriesInput, Prisma.ExecutionUpdateWithoutRetriesInput>, Prisma.ExecutionUncheckedUpdateWithoutRetriesInput>;
};
export type ExecutionUpdateManyWithoutRetryOfNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutRetryOfInput, Prisma.ExecutionUncheckedCreateWithoutRetryOfInput> | Prisma.ExecutionCreateWithoutRetryOfInput[] | Prisma.ExecutionUncheckedCreateWithoutRetryOfInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutRetryOfInput | Prisma.ExecutionCreateOrConnectWithoutRetryOfInput[];
    upsert?: Prisma.ExecutionUpsertWithWhereUniqueWithoutRetryOfInput | Prisma.ExecutionUpsertWithWhereUniqueWithoutRetryOfInput[];
    createMany?: Prisma.ExecutionCreateManyRetryOfInputEnvelope;
    set?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    disconnect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    delete?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    update?: Prisma.ExecutionUpdateWithWhereUniqueWithoutRetryOfInput | Prisma.ExecutionUpdateWithWhereUniqueWithoutRetryOfInput[];
    updateMany?: Prisma.ExecutionUpdateManyWithWhereWithoutRetryOfInput | Prisma.ExecutionUpdateManyWithWhereWithoutRetryOfInput[];
    deleteMany?: Prisma.ExecutionScalarWhereInput | Prisma.ExecutionScalarWhereInput[];
};
export type ExecutionUncheckedUpdateManyWithoutRetryOfNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutRetryOfInput, Prisma.ExecutionUncheckedCreateWithoutRetryOfInput> | Prisma.ExecutionCreateWithoutRetryOfInput[] | Prisma.ExecutionUncheckedCreateWithoutRetryOfInput[];
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutRetryOfInput | Prisma.ExecutionCreateOrConnectWithoutRetryOfInput[];
    upsert?: Prisma.ExecutionUpsertWithWhereUniqueWithoutRetryOfInput | Prisma.ExecutionUpsertWithWhereUniqueWithoutRetryOfInput[];
    createMany?: Prisma.ExecutionCreateManyRetryOfInputEnvelope;
    set?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    disconnect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    delete?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    connect?: Prisma.ExecutionWhereUniqueInput | Prisma.ExecutionWhereUniqueInput[];
    update?: Prisma.ExecutionUpdateWithWhereUniqueWithoutRetryOfInput | Prisma.ExecutionUpdateWithWhereUniqueWithoutRetryOfInput[];
    updateMany?: Prisma.ExecutionUpdateManyWithWhereWithoutRetryOfInput | Prisma.ExecutionUpdateManyWithWhereWithoutRetryOfInput[];
    deleteMany?: Prisma.ExecutionScalarWhereInput | Prisma.ExecutionScalarWhereInput[];
};
export type ExecutionCreateNestedOneWithoutCheckResultsInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutCheckResultsInput, Prisma.ExecutionUncheckedCreateWithoutCheckResultsInput>;
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutCheckResultsInput;
    connect?: Prisma.ExecutionWhereUniqueInput;
};
export type ExecutionUpdateOneRequiredWithoutCheckResultsNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutCheckResultsInput, Prisma.ExecutionUncheckedCreateWithoutCheckResultsInput>;
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutCheckResultsInput;
    upsert?: Prisma.ExecutionUpsertWithoutCheckResultsInput;
    connect?: Prisma.ExecutionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ExecutionUpdateToOneWithWhereWithoutCheckResultsInput, Prisma.ExecutionUpdateWithoutCheckResultsInput>, Prisma.ExecutionUncheckedUpdateWithoutCheckResultsInput>;
};
export type ExecutionCreateNestedOneWithoutLogsInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutLogsInput, Prisma.ExecutionUncheckedCreateWithoutLogsInput>;
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutLogsInput;
    connect?: Prisma.ExecutionWhereUniqueInput;
};
export type ExecutionUpdateOneRequiredWithoutLogsNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionCreateWithoutLogsInput, Prisma.ExecutionUncheckedCreateWithoutLogsInput>;
    connectOrCreate?: Prisma.ExecutionCreateOrConnectWithoutLogsInput;
    upsert?: Prisma.ExecutionUpsertWithoutLogsInput;
    connect?: Prisma.ExecutionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ExecutionUpdateToOneWithWhereWithoutLogsInput, Prisma.ExecutionUpdateWithoutLogsInput>, Prisma.ExecutionUncheckedUpdateWithoutLogsInput>;
};
export type ExecutionCreateWithoutTenantInput = {
    id?: string;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    asset: Prisma.AssetCreateNestedOneWithoutExecutionsInput;
    scheduleRule?: Prisma.ScheduleRuleCreateNestedOneWithoutExecutionsInput;
    retryOf?: Prisma.ExecutionCreateNestedOneWithoutRetriesInput;
    retries?: Prisma.ExecutionCreateNestedManyWithoutRetryOfInput;
    checkResults?: Prisma.CheckResultCreateNestedManyWithoutExecutionInput;
    logs?: Prisma.ExecutionLogCreateNestedManyWithoutExecutionInput;
};
export type ExecutionUncheckedCreateWithoutTenantInput = {
    id?: string;
    assetId: string;
    scheduleRuleId?: string | null;
    retryOfId?: string | null;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    retries?: Prisma.ExecutionUncheckedCreateNestedManyWithoutRetryOfInput;
    checkResults?: Prisma.CheckResultUncheckedCreateNestedManyWithoutExecutionInput;
    logs?: Prisma.ExecutionLogUncheckedCreateNestedManyWithoutExecutionInput;
};
export type ExecutionCreateOrConnectWithoutTenantInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExecutionCreateWithoutTenantInput, Prisma.ExecutionUncheckedCreateWithoutTenantInput>;
};
export type ExecutionCreateManyTenantInputEnvelope = {
    data: Prisma.ExecutionCreateManyTenantInput | Prisma.ExecutionCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ExecutionUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExecutionUpdateWithoutTenantInput, Prisma.ExecutionUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ExecutionCreateWithoutTenantInput, Prisma.ExecutionUncheckedCreateWithoutTenantInput>;
};
export type ExecutionUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExecutionUpdateWithoutTenantInput, Prisma.ExecutionUncheckedUpdateWithoutTenantInput>;
};
export type ExecutionUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ExecutionScalarWhereInput;
    data: Prisma.XOR<Prisma.ExecutionUpdateManyMutationInput, Prisma.ExecutionUncheckedUpdateManyWithoutTenantInput>;
};
export type ExecutionScalarWhereInput = {
    AND?: Prisma.ExecutionScalarWhereInput | Prisma.ExecutionScalarWhereInput[];
    OR?: Prisma.ExecutionScalarWhereInput[];
    NOT?: Prisma.ExecutionScalarWhereInput | Prisma.ExecutionScalarWhereInput[];
    id?: Prisma.UuidFilter<"Execution"> | string;
    tenantId?: Prisma.UuidFilter<"Execution"> | string;
    assetId?: Prisma.UuidFilter<"Execution"> | string;
    scheduleRuleId?: Prisma.UuidNullableFilter<"Execution"> | string | null;
    retryOfId?: Prisma.UuidNullableFilter<"Execution"> | string | null;
    startedAt?: Prisma.DateTimeFilter<"Execution"> | Date | string;
    finishedAt?: Prisma.DateTimeNullableFilter<"Execution"> | Date | string | null;
    status?: Prisma.EnumExecutionStatusFilter<"Execution"> | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFilter<"Execution"> | number;
    origin?: Prisma.EnumExecutionOriginFilter<"Execution"> | $Enums.ExecutionOrigin;
};
export type ExecutionCreateWithoutAssetInput = {
    id?: string;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    scheduleRule?: Prisma.ScheduleRuleCreateNestedOneWithoutExecutionsInput;
    retryOf?: Prisma.ExecutionCreateNestedOneWithoutRetriesInput;
    retries?: Prisma.ExecutionCreateNestedManyWithoutRetryOfInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutExecutionsInput;
    checkResults?: Prisma.CheckResultCreateNestedManyWithoutExecutionInput;
    logs?: Prisma.ExecutionLogCreateNestedManyWithoutExecutionInput;
};
export type ExecutionUncheckedCreateWithoutAssetInput = {
    id?: string;
    tenantId: string;
    scheduleRuleId?: string | null;
    retryOfId?: string | null;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    retries?: Prisma.ExecutionUncheckedCreateNestedManyWithoutRetryOfInput;
    checkResults?: Prisma.CheckResultUncheckedCreateNestedManyWithoutExecutionInput;
    logs?: Prisma.ExecutionLogUncheckedCreateNestedManyWithoutExecutionInput;
};
export type ExecutionCreateOrConnectWithoutAssetInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExecutionCreateWithoutAssetInput, Prisma.ExecutionUncheckedCreateWithoutAssetInput>;
};
export type ExecutionCreateManyAssetInputEnvelope = {
    data: Prisma.ExecutionCreateManyAssetInput | Prisma.ExecutionCreateManyAssetInput[];
    skipDuplicates?: boolean;
};
export type ExecutionUpsertWithWhereUniqueWithoutAssetInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExecutionUpdateWithoutAssetInput, Prisma.ExecutionUncheckedUpdateWithoutAssetInput>;
    create: Prisma.XOR<Prisma.ExecutionCreateWithoutAssetInput, Prisma.ExecutionUncheckedCreateWithoutAssetInput>;
};
export type ExecutionUpdateWithWhereUniqueWithoutAssetInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExecutionUpdateWithoutAssetInput, Prisma.ExecutionUncheckedUpdateWithoutAssetInput>;
};
export type ExecutionUpdateManyWithWhereWithoutAssetInput = {
    where: Prisma.ExecutionScalarWhereInput;
    data: Prisma.XOR<Prisma.ExecutionUpdateManyMutationInput, Prisma.ExecutionUncheckedUpdateManyWithoutAssetInput>;
};
export type ExecutionCreateWithoutScheduleRuleInput = {
    id?: string;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    asset: Prisma.AssetCreateNestedOneWithoutExecutionsInput;
    retryOf?: Prisma.ExecutionCreateNestedOneWithoutRetriesInput;
    retries?: Prisma.ExecutionCreateNestedManyWithoutRetryOfInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutExecutionsInput;
    checkResults?: Prisma.CheckResultCreateNestedManyWithoutExecutionInput;
    logs?: Prisma.ExecutionLogCreateNestedManyWithoutExecutionInput;
};
export type ExecutionUncheckedCreateWithoutScheduleRuleInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    retryOfId?: string | null;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    retries?: Prisma.ExecutionUncheckedCreateNestedManyWithoutRetryOfInput;
    checkResults?: Prisma.CheckResultUncheckedCreateNestedManyWithoutExecutionInput;
    logs?: Prisma.ExecutionLogUncheckedCreateNestedManyWithoutExecutionInput;
};
export type ExecutionCreateOrConnectWithoutScheduleRuleInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExecutionCreateWithoutScheduleRuleInput, Prisma.ExecutionUncheckedCreateWithoutScheduleRuleInput>;
};
export type ExecutionCreateManyScheduleRuleInputEnvelope = {
    data: Prisma.ExecutionCreateManyScheduleRuleInput | Prisma.ExecutionCreateManyScheduleRuleInput[];
    skipDuplicates?: boolean;
};
export type ExecutionUpsertWithWhereUniqueWithoutScheduleRuleInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExecutionUpdateWithoutScheduleRuleInput, Prisma.ExecutionUncheckedUpdateWithoutScheduleRuleInput>;
    create: Prisma.XOR<Prisma.ExecutionCreateWithoutScheduleRuleInput, Prisma.ExecutionUncheckedCreateWithoutScheduleRuleInput>;
};
export type ExecutionUpdateWithWhereUniqueWithoutScheduleRuleInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExecutionUpdateWithoutScheduleRuleInput, Prisma.ExecutionUncheckedUpdateWithoutScheduleRuleInput>;
};
export type ExecutionUpdateManyWithWhereWithoutScheduleRuleInput = {
    where: Prisma.ExecutionScalarWhereInput;
    data: Prisma.XOR<Prisma.ExecutionUpdateManyMutationInput, Prisma.ExecutionUncheckedUpdateManyWithoutScheduleRuleInput>;
};
export type ExecutionCreateWithoutRetriesInput = {
    id?: string;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    asset: Prisma.AssetCreateNestedOneWithoutExecutionsInput;
    scheduleRule?: Prisma.ScheduleRuleCreateNestedOneWithoutExecutionsInput;
    retryOf?: Prisma.ExecutionCreateNestedOneWithoutRetriesInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutExecutionsInput;
    checkResults?: Prisma.CheckResultCreateNestedManyWithoutExecutionInput;
    logs?: Prisma.ExecutionLogCreateNestedManyWithoutExecutionInput;
};
export type ExecutionUncheckedCreateWithoutRetriesInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    scheduleRuleId?: string | null;
    retryOfId?: string | null;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    checkResults?: Prisma.CheckResultUncheckedCreateNestedManyWithoutExecutionInput;
    logs?: Prisma.ExecutionLogUncheckedCreateNestedManyWithoutExecutionInput;
};
export type ExecutionCreateOrConnectWithoutRetriesInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExecutionCreateWithoutRetriesInput, Prisma.ExecutionUncheckedCreateWithoutRetriesInput>;
};
export type ExecutionCreateWithoutRetryOfInput = {
    id?: string;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    asset: Prisma.AssetCreateNestedOneWithoutExecutionsInput;
    scheduleRule?: Prisma.ScheduleRuleCreateNestedOneWithoutExecutionsInput;
    retries?: Prisma.ExecutionCreateNestedManyWithoutRetryOfInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutExecutionsInput;
    checkResults?: Prisma.CheckResultCreateNestedManyWithoutExecutionInput;
    logs?: Prisma.ExecutionLogCreateNestedManyWithoutExecutionInput;
};
export type ExecutionUncheckedCreateWithoutRetryOfInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    scheduleRuleId?: string | null;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    retries?: Prisma.ExecutionUncheckedCreateNestedManyWithoutRetryOfInput;
    checkResults?: Prisma.CheckResultUncheckedCreateNestedManyWithoutExecutionInput;
    logs?: Prisma.ExecutionLogUncheckedCreateNestedManyWithoutExecutionInput;
};
export type ExecutionCreateOrConnectWithoutRetryOfInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExecutionCreateWithoutRetryOfInput, Prisma.ExecutionUncheckedCreateWithoutRetryOfInput>;
};
export type ExecutionCreateManyRetryOfInputEnvelope = {
    data: Prisma.ExecutionCreateManyRetryOfInput | Prisma.ExecutionCreateManyRetryOfInput[];
    skipDuplicates?: boolean;
};
export type ExecutionUpsertWithoutRetriesInput = {
    update: Prisma.XOR<Prisma.ExecutionUpdateWithoutRetriesInput, Prisma.ExecutionUncheckedUpdateWithoutRetriesInput>;
    create: Prisma.XOR<Prisma.ExecutionCreateWithoutRetriesInput, Prisma.ExecutionUncheckedCreateWithoutRetriesInput>;
    where?: Prisma.ExecutionWhereInput;
};
export type ExecutionUpdateToOneWithWhereWithoutRetriesInput = {
    where?: Prisma.ExecutionWhereInput;
    data: Prisma.XOR<Prisma.ExecutionUpdateWithoutRetriesInput, Prisma.ExecutionUncheckedUpdateWithoutRetriesInput>;
};
export type ExecutionUpdateWithoutRetriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    asset?: Prisma.AssetUpdateOneRequiredWithoutExecutionsNestedInput;
    scheduleRule?: Prisma.ScheduleRuleUpdateOneWithoutExecutionsNestedInput;
    retryOf?: Prisma.ExecutionUpdateOneWithoutRetriesNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutExecutionsNestedInput;
    checkResults?: Prisma.CheckResultUpdateManyWithoutExecutionNestedInput;
    logs?: Prisma.ExecutionLogUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionUncheckedUpdateWithoutRetriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    scheduleRuleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    retryOfId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    checkResults?: Prisma.CheckResultUncheckedUpdateManyWithoutExecutionNestedInput;
    logs?: Prisma.ExecutionLogUncheckedUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionUpsertWithWhereUniqueWithoutRetryOfInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExecutionUpdateWithoutRetryOfInput, Prisma.ExecutionUncheckedUpdateWithoutRetryOfInput>;
    create: Prisma.XOR<Prisma.ExecutionCreateWithoutRetryOfInput, Prisma.ExecutionUncheckedCreateWithoutRetryOfInput>;
};
export type ExecutionUpdateWithWhereUniqueWithoutRetryOfInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExecutionUpdateWithoutRetryOfInput, Prisma.ExecutionUncheckedUpdateWithoutRetryOfInput>;
};
export type ExecutionUpdateManyWithWhereWithoutRetryOfInput = {
    where: Prisma.ExecutionScalarWhereInput;
    data: Prisma.XOR<Prisma.ExecutionUpdateManyMutationInput, Prisma.ExecutionUncheckedUpdateManyWithoutRetryOfInput>;
};
export type ExecutionCreateWithoutCheckResultsInput = {
    id?: string;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    asset: Prisma.AssetCreateNestedOneWithoutExecutionsInput;
    scheduleRule?: Prisma.ScheduleRuleCreateNestedOneWithoutExecutionsInput;
    retryOf?: Prisma.ExecutionCreateNestedOneWithoutRetriesInput;
    retries?: Prisma.ExecutionCreateNestedManyWithoutRetryOfInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutExecutionsInput;
    logs?: Prisma.ExecutionLogCreateNestedManyWithoutExecutionInput;
};
export type ExecutionUncheckedCreateWithoutCheckResultsInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    scheduleRuleId?: string | null;
    retryOfId?: string | null;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    retries?: Prisma.ExecutionUncheckedCreateNestedManyWithoutRetryOfInput;
    logs?: Prisma.ExecutionLogUncheckedCreateNestedManyWithoutExecutionInput;
};
export type ExecutionCreateOrConnectWithoutCheckResultsInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExecutionCreateWithoutCheckResultsInput, Prisma.ExecutionUncheckedCreateWithoutCheckResultsInput>;
};
export type ExecutionUpsertWithoutCheckResultsInput = {
    update: Prisma.XOR<Prisma.ExecutionUpdateWithoutCheckResultsInput, Prisma.ExecutionUncheckedUpdateWithoutCheckResultsInput>;
    create: Prisma.XOR<Prisma.ExecutionCreateWithoutCheckResultsInput, Prisma.ExecutionUncheckedCreateWithoutCheckResultsInput>;
    where?: Prisma.ExecutionWhereInput;
};
export type ExecutionUpdateToOneWithWhereWithoutCheckResultsInput = {
    where?: Prisma.ExecutionWhereInput;
    data: Prisma.XOR<Prisma.ExecutionUpdateWithoutCheckResultsInput, Prisma.ExecutionUncheckedUpdateWithoutCheckResultsInput>;
};
export type ExecutionUpdateWithoutCheckResultsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    asset?: Prisma.AssetUpdateOneRequiredWithoutExecutionsNestedInput;
    scheduleRule?: Prisma.ScheduleRuleUpdateOneWithoutExecutionsNestedInput;
    retryOf?: Prisma.ExecutionUpdateOneWithoutRetriesNestedInput;
    retries?: Prisma.ExecutionUpdateManyWithoutRetryOfNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutExecutionsNestedInput;
    logs?: Prisma.ExecutionLogUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionUncheckedUpdateWithoutCheckResultsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    scheduleRuleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    retryOfId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    retries?: Prisma.ExecutionUncheckedUpdateManyWithoutRetryOfNestedInput;
    logs?: Prisma.ExecutionLogUncheckedUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionCreateWithoutLogsInput = {
    id?: string;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    asset: Prisma.AssetCreateNestedOneWithoutExecutionsInput;
    scheduleRule?: Prisma.ScheduleRuleCreateNestedOneWithoutExecutionsInput;
    retryOf?: Prisma.ExecutionCreateNestedOneWithoutRetriesInput;
    retries?: Prisma.ExecutionCreateNestedManyWithoutRetryOfInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutExecutionsInput;
    checkResults?: Prisma.CheckResultCreateNestedManyWithoutExecutionInput;
};
export type ExecutionUncheckedCreateWithoutLogsInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    scheduleRuleId?: string | null;
    retryOfId?: string | null;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
    retries?: Prisma.ExecutionUncheckedCreateNestedManyWithoutRetryOfInput;
    checkResults?: Prisma.CheckResultUncheckedCreateNestedManyWithoutExecutionInput;
};
export type ExecutionCreateOrConnectWithoutLogsInput = {
    where: Prisma.ExecutionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExecutionCreateWithoutLogsInput, Prisma.ExecutionUncheckedCreateWithoutLogsInput>;
};
export type ExecutionUpsertWithoutLogsInput = {
    update: Prisma.XOR<Prisma.ExecutionUpdateWithoutLogsInput, Prisma.ExecutionUncheckedUpdateWithoutLogsInput>;
    create: Prisma.XOR<Prisma.ExecutionCreateWithoutLogsInput, Prisma.ExecutionUncheckedCreateWithoutLogsInput>;
    where?: Prisma.ExecutionWhereInput;
};
export type ExecutionUpdateToOneWithWhereWithoutLogsInput = {
    where?: Prisma.ExecutionWhereInput;
    data: Prisma.XOR<Prisma.ExecutionUpdateWithoutLogsInput, Prisma.ExecutionUncheckedUpdateWithoutLogsInput>;
};
export type ExecutionUpdateWithoutLogsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    asset?: Prisma.AssetUpdateOneRequiredWithoutExecutionsNestedInput;
    scheduleRule?: Prisma.ScheduleRuleUpdateOneWithoutExecutionsNestedInput;
    retryOf?: Prisma.ExecutionUpdateOneWithoutRetriesNestedInput;
    retries?: Prisma.ExecutionUpdateManyWithoutRetryOfNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutExecutionsNestedInput;
    checkResults?: Prisma.CheckResultUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionUncheckedUpdateWithoutLogsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    scheduleRuleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    retryOfId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    retries?: Prisma.ExecutionUncheckedUpdateManyWithoutRetryOfNestedInput;
    checkResults?: Prisma.CheckResultUncheckedUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionCreateManyTenantInput = {
    id?: string;
    assetId: string;
    scheduleRuleId?: string | null;
    retryOfId?: string | null;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
};
export type ExecutionUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    asset?: Prisma.AssetUpdateOneRequiredWithoutExecutionsNestedInput;
    scheduleRule?: Prisma.ScheduleRuleUpdateOneWithoutExecutionsNestedInput;
    retryOf?: Prisma.ExecutionUpdateOneWithoutRetriesNestedInput;
    retries?: Prisma.ExecutionUpdateManyWithoutRetryOfNestedInput;
    checkResults?: Prisma.CheckResultUpdateManyWithoutExecutionNestedInput;
    logs?: Prisma.ExecutionLogUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    scheduleRuleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    retryOfId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    retries?: Prisma.ExecutionUncheckedUpdateManyWithoutRetryOfNestedInput;
    checkResults?: Prisma.CheckResultUncheckedUpdateManyWithoutExecutionNestedInput;
    logs?: Prisma.ExecutionLogUncheckedUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    scheduleRuleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    retryOfId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
};
export type ExecutionCreateManyAssetInput = {
    id?: string;
    tenantId: string;
    scheduleRuleId?: string | null;
    retryOfId?: string | null;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
};
export type ExecutionUpdateWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    scheduleRule?: Prisma.ScheduleRuleUpdateOneWithoutExecutionsNestedInput;
    retryOf?: Prisma.ExecutionUpdateOneWithoutRetriesNestedInput;
    retries?: Prisma.ExecutionUpdateManyWithoutRetryOfNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutExecutionsNestedInput;
    checkResults?: Prisma.CheckResultUpdateManyWithoutExecutionNestedInput;
    logs?: Prisma.ExecutionLogUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionUncheckedUpdateWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    scheduleRuleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    retryOfId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    retries?: Prisma.ExecutionUncheckedUpdateManyWithoutRetryOfNestedInput;
    checkResults?: Prisma.CheckResultUncheckedUpdateManyWithoutExecutionNestedInput;
    logs?: Prisma.ExecutionLogUncheckedUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionUncheckedUpdateManyWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    scheduleRuleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    retryOfId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
};
export type ExecutionCreateManyScheduleRuleInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    retryOfId?: string | null;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
};
export type ExecutionUpdateWithoutScheduleRuleInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    asset?: Prisma.AssetUpdateOneRequiredWithoutExecutionsNestedInput;
    retryOf?: Prisma.ExecutionUpdateOneWithoutRetriesNestedInput;
    retries?: Prisma.ExecutionUpdateManyWithoutRetryOfNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutExecutionsNestedInput;
    checkResults?: Prisma.CheckResultUpdateManyWithoutExecutionNestedInput;
    logs?: Prisma.ExecutionLogUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionUncheckedUpdateWithoutScheduleRuleInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    retryOfId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    retries?: Prisma.ExecutionUncheckedUpdateManyWithoutRetryOfNestedInput;
    checkResults?: Prisma.CheckResultUncheckedUpdateManyWithoutExecutionNestedInput;
    logs?: Prisma.ExecutionLogUncheckedUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionUncheckedUpdateManyWithoutScheduleRuleInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    retryOfId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
};
export type ExecutionCreateManyRetryOfInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    scheduleRuleId?: string | null;
    startedAt: Date | string;
    finishedAt?: Date | string | null;
    status: $Enums.ExecutionStatus;
    progressPercentage?: number;
    origin: $Enums.ExecutionOrigin;
};
export type ExecutionUpdateWithoutRetryOfInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    asset?: Prisma.AssetUpdateOneRequiredWithoutExecutionsNestedInput;
    scheduleRule?: Prisma.ScheduleRuleUpdateOneWithoutExecutionsNestedInput;
    retries?: Prisma.ExecutionUpdateManyWithoutRetryOfNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutExecutionsNestedInput;
    checkResults?: Prisma.CheckResultUpdateManyWithoutExecutionNestedInput;
    logs?: Prisma.ExecutionLogUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionUncheckedUpdateWithoutRetryOfInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    scheduleRuleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
    retries?: Prisma.ExecutionUncheckedUpdateManyWithoutRetryOfNestedInput;
    checkResults?: Prisma.CheckResultUncheckedUpdateManyWithoutExecutionNestedInput;
    logs?: Prisma.ExecutionLogUncheckedUpdateManyWithoutExecutionNestedInput;
};
export type ExecutionUncheckedUpdateManyWithoutRetryOfInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    scheduleRuleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumExecutionStatusFieldUpdateOperationsInput | $Enums.ExecutionStatus;
    progressPercentage?: Prisma.IntFieldUpdateOperationsInput | number;
    origin?: Prisma.EnumExecutionOriginFieldUpdateOperationsInput | $Enums.ExecutionOrigin;
};
export type ExecutionCountOutputType = {
    retries: number;
    checkResults: number;
    logs: number;
};
export type ExecutionCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    retries?: boolean | ExecutionCountOutputTypeCountRetriesArgs;
    checkResults?: boolean | ExecutionCountOutputTypeCountCheckResultsArgs;
    logs?: boolean | ExecutionCountOutputTypeCountLogsArgs;
};
export type ExecutionCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionCountOutputTypeSelect<ExtArgs> | null;
};
export type ExecutionCountOutputTypeCountRetriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExecutionWhereInput;
};
export type ExecutionCountOutputTypeCountCheckResultsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckResultWhereInput;
};
export type ExecutionCountOutputTypeCountLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExecutionLogWhereInput;
};
export type ExecutionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    assetId?: boolean;
    scheduleRuleId?: boolean;
    retryOfId?: boolean;
    startedAt?: boolean;
    finishedAt?: boolean;
    status?: boolean;
    progressPercentage?: boolean;
    origin?: boolean;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    scheduleRule?: boolean | Prisma.Execution$scheduleRuleArgs<ExtArgs>;
    retryOf?: boolean | Prisma.Execution$retryOfArgs<ExtArgs>;
    retries?: boolean | Prisma.Execution$retriesArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    checkResults?: boolean | Prisma.Execution$checkResultsArgs<ExtArgs>;
    logs?: boolean | Prisma.Execution$logsArgs<ExtArgs>;
    _count?: boolean | Prisma.ExecutionCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["execution"]>;
export type ExecutionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    assetId?: boolean;
    scheduleRuleId?: boolean;
    retryOfId?: boolean;
    startedAt?: boolean;
    finishedAt?: boolean;
    status?: boolean;
    progressPercentage?: boolean;
    origin?: boolean;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    scheduleRule?: boolean | Prisma.Execution$scheduleRuleArgs<ExtArgs>;
    retryOf?: boolean | Prisma.Execution$retryOfArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["execution"]>;
export type ExecutionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    assetId?: boolean;
    scheduleRuleId?: boolean;
    retryOfId?: boolean;
    startedAt?: boolean;
    finishedAt?: boolean;
    status?: boolean;
    progressPercentage?: boolean;
    origin?: boolean;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    scheduleRule?: boolean | Prisma.Execution$scheduleRuleArgs<ExtArgs>;
    retryOf?: boolean | Prisma.Execution$retryOfArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["execution"]>;
export type ExecutionSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    assetId?: boolean;
    scheduleRuleId?: boolean;
    retryOfId?: boolean;
    startedAt?: boolean;
    finishedAt?: boolean;
    status?: boolean;
    progressPercentage?: boolean;
    origin?: boolean;
};
export type ExecutionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "assetId" | "scheduleRuleId" | "retryOfId" | "startedAt" | "finishedAt" | "status" | "progressPercentage" | "origin", ExtArgs["result"]["execution"]>;
export type ExecutionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    scheduleRule?: boolean | Prisma.Execution$scheduleRuleArgs<ExtArgs>;
    retryOf?: boolean | Prisma.Execution$retryOfArgs<ExtArgs>;
    retries?: boolean | Prisma.Execution$retriesArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    checkResults?: boolean | Prisma.Execution$checkResultsArgs<ExtArgs>;
    logs?: boolean | Prisma.Execution$logsArgs<ExtArgs>;
    _count?: boolean | Prisma.ExecutionCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ExecutionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    scheduleRule?: boolean | Prisma.Execution$scheduleRuleArgs<ExtArgs>;
    retryOf?: boolean | Prisma.Execution$retryOfArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ExecutionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    scheduleRule?: boolean | Prisma.Execution$scheduleRuleArgs<ExtArgs>;
    retryOf?: boolean | Prisma.Execution$retryOfArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ExecutionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Execution";
    objects: {
        asset: Prisma.$AssetPayload<ExtArgs>;
        scheduleRule: Prisma.$ScheduleRulePayload<ExtArgs> | null;
        retryOf: Prisma.$ExecutionPayload<ExtArgs> | null;
        retries: Prisma.$ExecutionPayload<ExtArgs>[];
        tenant: Prisma.$CompanyPayload<ExtArgs>;
        checkResults: Prisma.$CheckResultPayload<ExtArgs>[];
        logs: Prisma.$ExecutionLogPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        assetId: string;
        scheduleRuleId: string | null;
        retryOfId: string | null;
        startedAt: Date;
        finishedAt: Date | null;
        status: $Enums.ExecutionStatus;
        progressPercentage: number;
        origin: $Enums.ExecutionOrigin;
    }, ExtArgs["result"]["execution"]>;
    composites: {};
};
export type ExecutionGetPayload<S extends boolean | null | undefined | ExecutionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ExecutionPayload, S>;
export type ExecutionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ExecutionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ExecutionCountAggregateInputType | true;
};
export interface ExecutionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Execution'];
        meta: {
            name: 'Execution';
        };
    };
    findUnique<T extends ExecutionFindUniqueArgs>(args: Prisma.SelectSubset<T, ExecutionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ExecutionClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ExecutionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ExecutionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ExecutionClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ExecutionFindFirstArgs>(args?: Prisma.SelectSubset<T, ExecutionFindFirstArgs<ExtArgs>>): Prisma.Prisma__ExecutionClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ExecutionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ExecutionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ExecutionClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ExecutionFindManyArgs>(args?: Prisma.SelectSubset<T, ExecutionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ExecutionCreateArgs>(args: Prisma.SelectSubset<T, ExecutionCreateArgs<ExtArgs>>): Prisma.Prisma__ExecutionClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ExecutionCreateManyArgs>(args?: Prisma.SelectSubset<T, ExecutionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ExecutionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ExecutionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ExecutionDeleteArgs>(args: Prisma.SelectSubset<T, ExecutionDeleteArgs<ExtArgs>>): Prisma.Prisma__ExecutionClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ExecutionUpdateArgs>(args: Prisma.SelectSubset<T, ExecutionUpdateArgs<ExtArgs>>): Prisma.Prisma__ExecutionClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ExecutionDeleteManyArgs>(args?: Prisma.SelectSubset<T, ExecutionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ExecutionUpdateManyArgs>(args: Prisma.SelectSubset<T, ExecutionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ExecutionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ExecutionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ExecutionUpsertArgs>(args: Prisma.SelectSubset<T, ExecutionUpsertArgs<ExtArgs>>): Prisma.Prisma__ExecutionClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ExecutionCountArgs>(args?: Prisma.Subset<T, ExecutionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ExecutionCountAggregateOutputType> : number>;
    aggregate<T extends ExecutionAggregateArgs>(args: Prisma.Subset<T, ExecutionAggregateArgs>): Prisma.PrismaPromise<GetExecutionAggregateType<T>>;
    groupBy<T extends ExecutionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ExecutionGroupByArgs['orderBy'];
    } : {
        orderBy?: ExecutionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ExecutionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExecutionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ExecutionFieldRefs;
}
export interface Prisma__ExecutionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    asset<T extends Prisma.AssetDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.AssetDefaultArgs<ExtArgs>>): Prisma.Prisma__AssetClient<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    scheduleRule<T extends Prisma.Execution$scheduleRuleArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Execution$scheduleRuleArgs<ExtArgs>>): Prisma.Prisma__ScheduleRuleClient<runtime.Types.Result.GetResult<Prisma.$ScheduleRulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    retryOf<T extends Prisma.Execution$retryOfArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Execution$retryOfArgs<ExtArgs>>): Prisma.Prisma__ExecutionClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    retries<T extends Prisma.Execution$retriesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Execution$retriesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    checkResults<T extends Prisma.Execution$checkResultsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Execution$checkResultsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckResultPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    logs<T extends Prisma.Execution$logsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Execution$logsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ExecutionFieldRefs {
    readonly id: Prisma.FieldRef<"Execution", 'String'>;
    readonly tenantId: Prisma.FieldRef<"Execution", 'String'>;
    readonly assetId: Prisma.FieldRef<"Execution", 'String'>;
    readonly scheduleRuleId: Prisma.FieldRef<"Execution", 'String'>;
    readonly retryOfId: Prisma.FieldRef<"Execution", 'String'>;
    readonly startedAt: Prisma.FieldRef<"Execution", 'DateTime'>;
    readonly finishedAt: Prisma.FieldRef<"Execution", 'DateTime'>;
    readonly status: Prisma.FieldRef<"Execution", 'ExecutionStatus'>;
    readonly progressPercentage: Prisma.FieldRef<"Execution", 'Int'>;
    readonly origin: Prisma.FieldRef<"Execution", 'ExecutionOrigin'>;
}
export type ExecutionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    include?: Prisma.ExecutionInclude<ExtArgs> | null;
    where: Prisma.ExecutionWhereUniqueInput;
};
export type ExecutionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    include?: Prisma.ExecutionInclude<ExtArgs> | null;
    where: Prisma.ExecutionWhereUniqueInput;
};
export type ExecutionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    include?: Prisma.ExecutionInclude<ExtArgs> | null;
    where?: Prisma.ExecutionWhereInput;
    orderBy?: Prisma.ExecutionOrderByWithRelationInput | Prisma.ExecutionOrderByWithRelationInput[];
    cursor?: Prisma.ExecutionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExecutionScalarFieldEnum | Prisma.ExecutionScalarFieldEnum[];
};
export type ExecutionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    include?: Prisma.ExecutionInclude<ExtArgs> | null;
    where?: Prisma.ExecutionWhereInput;
    orderBy?: Prisma.ExecutionOrderByWithRelationInput | Prisma.ExecutionOrderByWithRelationInput[];
    cursor?: Prisma.ExecutionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExecutionScalarFieldEnum | Prisma.ExecutionScalarFieldEnum[];
};
export type ExecutionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    include?: Prisma.ExecutionInclude<ExtArgs> | null;
    where?: Prisma.ExecutionWhereInput;
    orderBy?: Prisma.ExecutionOrderByWithRelationInput | Prisma.ExecutionOrderByWithRelationInput[];
    cursor?: Prisma.ExecutionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExecutionScalarFieldEnum | Prisma.ExecutionScalarFieldEnum[];
};
export type ExecutionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    include?: Prisma.ExecutionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExecutionCreateInput, Prisma.ExecutionUncheckedCreateInput>;
};
export type ExecutionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ExecutionCreateManyInput | Prisma.ExecutionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ExecutionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    data: Prisma.ExecutionCreateManyInput | Prisma.ExecutionCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ExecutionIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ExecutionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    include?: Prisma.ExecutionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExecutionUpdateInput, Prisma.ExecutionUncheckedUpdateInput>;
    where: Prisma.ExecutionWhereUniqueInput;
};
export type ExecutionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ExecutionUpdateManyMutationInput, Prisma.ExecutionUncheckedUpdateManyInput>;
    where?: Prisma.ExecutionWhereInput;
    limit?: number;
};
export type ExecutionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExecutionUpdateManyMutationInput, Prisma.ExecutionUncheckedUpdateManyInput>;
    where?: Prisma.ExecutionWhereInput;
    limit?: number;
    include?: Prisma.ExecutionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ExecutionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    include?: Prisma.ExecutionInclude<ExtArgs> | null;
    where: Prisma.ExecutionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExecutionCreateInput, Prisma.ExecutionUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ExecutionUpdateInput, Prisma.ExecutionUncheckedUpdateInput>;
};
export type ExecutionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    include?: Prisma.ExecutionInclude<ExtArgs> | null;
    where: Prisma.ExecutionWhereUniqueInput;
};
export type ExecutionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExecutionWhereInput;
    limit?: number;
};
export type Execution$scheduleRuleArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScheduleRuleSelect<ExtArgs> | null;
    omit?: Prisma.ScheduleRuleOmit<ExtArgs> | null;
    include?: Prisma.ScheduleRuleInclude<ExtArgs> | null;
    where?: Prisma.ScheduleRuleWhereInput;
};
export type Execution$retryOfArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    include?: Prisma.ExecutionInclude<ExtArgs> | null;
    where?: Prisma.ExecutionWhereInput;
};
export type Execution$retriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    include?: Prisma.ExecutionInclude<ExtArgs> | null;
    where?: Prisma.ExecutionWhereInput;
    orderBy?: Prisma.ExecutionOrderByWithRelationInput | Prisma.ExecutionOrderByWithRelationInput[];
    cursor?: Prisma.ExecutionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExecutionScalarFieldEnum | Prisma.ExecutionScalarFieldEnum[];
};
export type Execution$checkResultsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Execution$logsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionLogSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionLogOmit<ExtArgs> | null;
    include?: Prisma.ExecutionLogInclude<ExtArgs> | null;
    where?: Prisma.ExecutionLogWhereInput;
    orderBy?: Prisma.ExecutionLogOrderByWithRelationInput | Prisma.ExecutionLogOrderByWithRelationInput[];
    cursor?: Prisma.ExecutionLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExecutionLogScalarFieldEnum | Prisma.ExecutionLogScalarFieldEnum[];
};
export type ExecutionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    include?: Prisma.ExecutionInclude<ExtArgs> | null;
};
export {};
