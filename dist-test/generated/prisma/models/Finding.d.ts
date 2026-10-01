import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type FindingModel = runtime.Types.Result.DefaultSelection<Prisma.$FindingPayload>;
export type AggregateFinding = {
    _count: FindingCountAggregateOutputType | null;
    _min: FindingMinAggregateOutputType | null;
    _max: FindingMaxAggregateOutputType | null;
};
export type FindingMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    evaluationId: string | null;
    assetId: string | null;
    reportedBy: string | null;
    dimension: $Enums.Dimension | null;
    failedTestOrCheck: string | null;
    severity: $Enums.Severity | null;
    status: $Enums.FindingStatus | null;
    origin: $Enums.FindingOrigin | null;
    detectedAt: Date | null;
    closedAt: Date | null;
};
export type FindingMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    evaluationId: string | null;
    assetId: string | null;
    reportedBy: string | null;
    dimension: $Enums.Dimension | null;
    failedTestOrCheck: string | null;
    severity: $Enums.Severity | null;
    status: $Enums.FindingStatus | null;
    origin: $Enums.FindingOrigin | null;
    detectedAt: Date | null;
    closedAt: Date | null;
};
export type FindingCountAggregateOutputType = {
    id: number;
    tenantId: number;
    evaluationId: number;
    assetId: number;
    reportedBy: number;
    dimension: number;
    failedTestOrCheck: number;
    severity: number;
    status: number;
    origin: number;
    detectedAt: number;
    closedAt: number;
    _all: number;
};
export type FindingMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    evaluationId?: true;
    assetId?: true;
    reportedBy?: true;
    dimension?: true;
    failedTestOrCheck?: true;
    severity?: true;
    status?: true;
    origin?: true;
    detectedAt?: true;
    closedAt?: true;
};
export type FindingMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    evaluationId?: true;
    assetId?: true;
    reportedBy?: true;
    dimension?: true;
    failedTestOrCheck?: true;
    severity?: true;
    status?: true;
    origin?: true;
    detectedAt?: true;
    closedAt?: true;
};
export type FindingCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    evaluationId?: true;
    assetId?: true;
    reportedBy?: true;
    dimension?: true;
    failedTestOrCheck?: true;
    severity?: true;
    status?: true;
    origin?: true;
    detectedAt?: true;
    closedAt?: true;
    _all?: true;
};
export type FindingAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FindingWhereInput;
    orderBy?: Prisma.FindingOrderByWithRelationInput | Prisma.FindingOrderByWithRelationInput[];
    cursor?: Prisma.FindingWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | FindingCountAggregateInputType;
    _min?: FindingMinAggregateInputType;
    _max?: FindingMaxAggregateInputType;
};
export type GetFindingAggregateType<T extends FindingAggregateArgs> = {
    [P in keyof T & keyof AggregateFinding]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateFinding[P]> : Prisma.GetScalarType<T[P], AggregateFinding[P]>;
};
export type FindingGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FindingWhereInput;
    orderBy?: Prisma.FindingOrderByWithAggregationInput | Prisma.FindingOrderByWithAggregationInput[];
    by: Prisma.FindingScalarFieldEnum[] | Prisma.FindingScalarFieldEnum;
    having?: Prisma.FindingScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: FindingCountAggregateInputType | true;
    _min?: FindingMinAggregateInputType;
    _max?: FindingMaxAggregateInputType;
};
export type FindingGroupByOutputType = {
    id: string;
    tenantId: string;
    evaluationId: string;
    assetId: string;
    reportedBy: string | null;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date;
    closedAt: Date | null;
    _count: FindingCountAggregateOutputType | null;
    _min: FindingMinAggregateOutputType | null;
    _max: FindingMaxAggregateOutputType | null;
};
type GetFindingGroupByPayload<T extends FindingGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<FindingGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof FindingGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], FindingGroupByOutputType[P]> : Prisma.GetScalarType<T[P], FindingGroupByOutputType[P]>;
}>>;
export type FindingWhereInput = {
    AND?: Prisma.FindingWhereInput | Prisma.FindingWhereInput[];
    OR?: Prisma.FindingWhereInput[];
    NOT?: Prisma.FindingWhereInput | Prisma.FindingWhereInput[];
    id?: Prisma.UuidFilter<"Finding"> | string;
    tenantId?: Prisma.UuidFilter<"Finding"> | string;
    evaluationId?: Prisma.UuidFilter<"Finding"> | string;
    assetId?: Prisma.UuidFilter<"Finding"> | string;
    reportedBy?: Prisma.UuidNullableFilter<"Finding"> | string | null;
    dimension?: Prisma.EnumDimensionFilter<"Finding"> | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFilter<"Finding"> | string;
    severity?: Prisma.EnumSeverityFilter<"Finding"> | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFilter<"Finding"> | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFilter<"Finding"> | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFilter<"Finding"> | Date | string;
    closedAt?: Prisma.DateTimeNullableFilter<"Finding"> | Date | string | null;
    evaluation?: Prisma.XOR<Prisma.EvaluationScalarRelationFilter, Prisma.EvaluationWhereInput>;
    asset?: Prisma.XOR<Prisma.AssetScalarRelationFilter, Prisma.AssetWhereInput>;
    reportedByUser?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type FindingOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    evaluationId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    reportedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    failedTestOrCheck?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    detectedAt?: Prisma.SortOrder;
    closedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    evaluation?: Prisma.EvaluationOrderByWithRelationInput;
    asset?: Prisma.AssetOrderByWithRelationInput;
    reportedByUser?: Prisma.UserOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type FindingWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.FindingWhereInput | Prisma.FindingWhereInput[];
    OR?: Prisma.FindingWhereInput[];
    NOT?: Prisma.FindingWhereInput | Prisma.FindingWhereInput[];
    tenantId?: Prisma.UuidFilter<"Finding"> | string;
    evaluationId?: Prisma.UuidFilter<"Finding"> | string;
    assetId?: Prisma.UuidFilter<"Finding"> | string;
    reportedBy?: Prisma.UuidNullableFilter<"Finding"> | string | null;
    dimension?: Prisma.EnumDimensionFilter<"Finding"> | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFilter<"Finding"> | string;
    severity?: Prisma.EnumSeverityFilter<"Finding"> | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFilter<"Finding"> | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFilter<"Finding"> | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFilter<"Finding"> | Date | string;
    closedAt?: Prisma.DateTimeNullableFilter<"Finding"> | Date | string | null;
    evaluation?: Prisma.XOR<Prisma.EvaluationScalarRelationFilter, Prisma.EvaluationWhereInput>;
    asset?: Prisma.XOR<Prisma.AssetScalarRelationFilter, Prisma.AssetWhereInput>;
    reportedByUser?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id">;
export type FindingOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    evaluationId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    reportedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    failedTestOrCheck?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    detectedAt?: Prisma.SortOrder;
    closedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.FindingCountOrderByAggregateInput;
    _max?: Prisma.FindingMaxOrderByAggregateInput;
    _min?: Prisma.FindingMinOrderByAggregateInput;
};
export type FindingScalarWhereWithAggregatesInput = {
    AND?: Prisma.FindingScalarWhereWithAggregatesInput | Prisma.FindingScalarWhereWithAggregatesInput[];
    OR?: Prisma.FindingScalarWhereWithAggregatesInput[];
    NOT?: Prisma.FindingScalarWhereWithAggregatesInput | Prisma.FindingScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Finding"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"Finding"> | string;
    evaluationId?: Prisma.UuidWithAggregatesFilter<"Finding"> | string;
    assetId?: Prisma.UuidWithAggregatesFilter<"Finding"> | string;
    reportedBy?: Prisma.UuidNullableWithAggregatesFilter<"Finding"> | string | null;
    dimension?: Prisma.EnumDimensionWithAggregatesFilter<"Finding"> | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringWithAggregatesFilter<"Finding"> | string;
    severity?: Prisma.EnumSeverityWithAggregatesFilter<"Finding"> | $Enums.Severity;
    status?: Prisma.EnumFindingStatusWithAggregatesFilter<"Finding"> | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginWithAggregatesFilter<"Finding"> | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeWithAggregatesFilter<"Finding"> | Date | string;
    closedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Finding"> | Date | string | null;
};
export type FindingCreateInput = {
    id?: string;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
    evaluation: Prisma.EvaluationCreateNestedOneWithoutFindingsInput;
    asset: Prisma.AssetCreateNestedOneWithoutFindingsInput;
    reportedByUser?: Prisma.UserCreateNestedOneWithoutFindingsReportedInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutFindingsInput;
};
export type FindingUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    evaluationId: string;
    assetId: string;
    reportedBy?: string | null;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
};
export type FindingUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    evaluation?: Prisma.EvaluationUpdateOneRequiredWithoutFindingsNestedInput;
    asset?: Prisma.AssetUpdateOneRequiredWithoutFindingsNestedInput;
    reportedByUser?: Prisma.UserUpdateOneWithoutFindingsReportedNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutFindingsNestedInput;
};
export type FindingUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    evaluationId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    reportedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type FindingCreateManyInput = {
    id?: string;
    tenantId: string;
    evaluationId: string;
    assetId: string;
    reportedBy?: string | null;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
};
export type FindingUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type FindingUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    evaluationId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    reportedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type FindingListRelationFilter = {
    every?: Prisma.FindingWhereInput;
    some?: Prisma.FindingWhereInput;
    none?: Prisma.FindingWhereInput;
};
export type FindingOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type FindingCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    evaluationId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    reportedBy?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    failedTestOrCheck?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    detectedAt?: Prisma.SortOrder;
    closedAt?: Prisma.SortOrder;
};
export type FindingMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    evaluationId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    reportedBy?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    failedTestOrCheck?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    detectedAt?: Prisma.SortOrder;
    closedAt?: Prisma.SortOrder;
};
export type FindingMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    evaluationId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    reportedBy?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    failedTestOrCheck?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    detectedAt?: Prisma.SortOrder;
    closedAt?: Prisma.SortOrder;
};
export type FindingCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutTenantInput, Prisma.FindingUncheckedCreateWithoutTenantInput> | Prisma.FindingCreateWithoutTenantInput[] | Prisma.FindingUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutTenantInput | Prisma.FindingCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.FindingCreateManyTenantInputEnvelope;
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
};
export type FindingUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutTenantInput, Prisma.FindingUncheckedCreateWithoutTenantInput> | Prisma.FindingCreateWithoutTenantInput[] | Prisma.FindingUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutTenantInput | Prisma.FindingCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.FindingCreateManyTenantInputEnvelope;
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
};
export type FindingUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutTenantInput, Prisma.FindingUncheckedCreateWithoutTenantInput> | Prisma.FindingCreateWithoutTenantInput[] | Prisma.FindingUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutTenantInput | Prisma.FindingCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.FindingUpsertWithWhereUniqueWithoutTenantInput | Prisma.FindingUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.FindingCreateManyTenantInputEnvelope;
    set?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    disconnect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    delete?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    update?: Prisma.FindingUpdateWithWhereUniqueWithoutTenantInput | Prisma.FindingUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.FindingUpdateManyWithWhereWithoutTenantInput | Prisma.FindingUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.FindingScalarWhereInput | Prisma.FindingScalarWhereInput[];
};
export type FindingUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutTenantInput, Prisma.FindingUncheckedCreateWithoutTenantInput> | Prisma.FindingCreateWithoutTenantInput[] | Prisma.FindingUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutTenantInput | Prisma.FindingCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.FindingUpsertWithWhereUniqueWithoutTenantInput | Prisma.FindingUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.FindingCreateManyTenantInputEnvelope;
    set?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    disconnect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    delete?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    update?: Prisma.FindingUpdateWithWhereUniqueWithoutTenantInput | Prisma.FindingUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.FindingUpdateManyWithWhereWithoutTenantInput | Prisma.FindingUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.FindingScalarWhereInput | Prisma.FindingScalarWhereInput[];
};
export type FindingCreateNestedManyWithoutReportedByUserInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutReportedByUserInput, Prisma.FindingUncheckedCreateWithoutReportedByUserInput> | Prisma.FindingCreateWithoutReportedByUserInput[] | Prisma.FindingUncheckedCreateWithoutReportedByUserInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutReportedByUserInput | Prisma.FindingCreateOrConnectWithoutReportedByUserInput[];
    createMany?: Prisma.FindingCreateManyReportedByUserInputEnvelope;
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
};
export type FindingUncheckedCreateNestedManyWithoutReportedByUserInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutReportedByUserInput, Prisma.FindingUncheckedCreateWithoutReportedByUserInput> | Prisma.FindingCreateWithoutReportedByUserInput[] | Prisma.FindingUncheckedCreateWithoutReportedByUserInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutReportedByUserInput | Prisma.FindingCreateOrConnectWithoutReportedByUserInput[];
    createMany?: Prisma.FindingCreateManyReportedByUserInputEnvelope;
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
};
export type FindingUpdateManyWithoutReportedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutReportedByUserInput, Prisma.FindingUncheckedCreateWithoutReportedByUserInput> | Prisma.FindingCreateWithoutReportedByUserInput[] | Prisma.FindingUncheckedCreateWithoutReportedByUserInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutReportedByUserInput | Prisma.FindingCreateOrConnectWithoutReportedByUserInput[];
    upsert?: Prisma.FindingUpsertWithWhereUniqueWithoutReportedByUserInput | Prisma.FindingUpsertWithWhereUniqueWithoutReportedByUserInput[];
    createMany?: Prisma.FindingCreateManyReportedByUserInputEnvelope;
    set?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    disconnect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    delete?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    update?: Prisma.FindingUpdateWithWhereUniqueWithoutReportedByUserInput | Prisma.FindingUpdateWithWhereUniqueWithoutReportedByUserInput[];
    updateMany?: Prisma.FindingUpdateManyWithWhereWithoutReportedByUserInput | Prisma.FindingUpdateManyWithWhereWithoutReportedByUserInput[];
    deleteMany?: Prisma.FindingScalarWhereInput | Prisma.FindingScalarWhereInput[];
};
export type FindingUncheckedUpdateManyWithoutReportedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutReportedByUserInput, Prisma.FindingUncheckedCreateWithoutReportedByUserInput> | Prisma.FindingCreateWithoutReportedByUserInput[] | Prisma.FindingUncheckedCreateWithoutReportedByUserInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutReportedByUserInput | Prisma.FindingCreateOrConnectWithoutReportedByUserInput[];
    upsert?: Prisma.FindingUpsertWithWhereUniqueWithoutReportedByUserInput | Prisma.FindingUpsertWithWhereUniqueWithoutReportedByUserInput[];
    createMany?: Prisma.FindingCreateManyReportedByUserInputEnvelope;
    set?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    disconnect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    delete?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    update?: Prisma.FindingUpdateWithWhereUniqueWithoutReportedByUserInput | Prisma.FindingUpdateWithWhereUniqueWithoutReportedByUserInput[];
    updateMany?: Prisma.FindingUpdateManyWithWhereWithoutReportedByUserInput | Prisma.FindingUpdateManyWithWhereWithoutReportedByUserInput[];
    deleteMany?: Prisma.FindingScalarWhereInput | Prisma.FindingScalarWhereInput[];
};
export type FindingCreateNestedManyWithoutEvaluationInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutEvaluationInput, Prisma.FindingUncheckedCreateWithoutEvaluationInput> | Prisma.FindingCreateWithoutEvaluationInput[] | Prisma.FindingUncheckedCreateWithoutEvaluationInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutEvaluationInput | Prisma.FindingCreateOrConnectWithoutEvaluationInput[];
    createMany?: Prisma.FindingCreateManyEvaluationInputEnvelope;
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
};
export type FindingUncheckedCreateNestedManyWithoutEvaluationInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutEvaluationInput, Prisma.FindingUncheckedCreateWithoutEvaluationInput> | Prisma.FindingCreateWithoutEvaluationInput[] | Prisma.FindingUncheckedCreateWithoutEvaluationInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutEvaluationInput | Prisma.FindingCreateOrConnectWithoutEvaluationInput[];
    createMany?: Prisma.FindingCreateManyEvaluationInputEnvelope;
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
};
export type FindingUpdateManyWithoutEvaluationNestedInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutEvaluationInput, Prisma.FindingUncheckedCreateWithoutEvaluationInput> | Prisma.FindingCreateWithoutEvaluationInput[] | Prisma.FindingUncheckedCreateWithoutEvaluationInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutEvaluationInput | Prisma.FindingCreateOrConnectWithoutEvaluationInput[];
    upsert?: Prisma.FindingUpsertWithWhereUniqueWithoutEvaluationInput | Prisma.FindingUpsertWithWhereUniqueWithoutEvaluationInput[];
    createMany?: Prisma.FindingCreateManyEvaluationInputEnvelope;
    set?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    disconnect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    delete?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    update?: Prisma.FindingUpdateWithWhereUniqueWithoutEvaluationInput | Prisma.FindingUpdateWithWhereUniqueWithoutEvaluationInput[];
    updateMany?: Prisma.FindingUpdateManyWithWhereWithoutEvaluationInput | Prisma.FindingUpdateManyWithWhereWithoutEvaluationInput[];
    deleteMany?: Prisma.FindingScalarWhereInput | Prisma.FindingScalarWhereInput[];
};
export type FindingUncheckedUpdateManyWithoutEvaluationNestedInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutEvaluationInput, Prisma.FindingUncheckedCreateWithoutEvaluationInput> | Prisma.FindingCreateWithoutEvaluationInput[] | Prisma.FindingUncheckedCreateWithoutEvaluationInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutEvaluationInput | Prisma.FindingCreateOrConnectWithoutEvaluationInput[];
    upsert?: Prisma.FindingUpsertWithWhereUniqueWithoutEvaluationInput | Prisma.FindingUpsertWithWhereUniqueWithoutEvaluationInput[];
    createMany?: Prisma.FindingCreateManyEvaluationInputEnvelope;
    set?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    disconnect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    delete?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    update?: Prisma.FindingUpdateWithWhereUniqueWithoutEvaluationInput | Prisma.FindingUpdateWithWhereUniqueWithoutEvaluationInput[];
    updateMany?: Prisma.FindingUpdateManyWithWhereWithoutEvaluationInput | Prisma.FindingUpdateManyWithWhereWithoutEvaluationInput[];
    deleteMany?: Prisma.FindingScalarWhereInput | Prisma.FindingScalarWhereInput[];
};
export type EnumSeverityFieldUpdateOperationsInput = {
    set?: $Enums.Severity;
};
export type EnumFindingStatusFieldUpdateOperationsInput = {
    set?: $Enums.FindingStatus;
};
export type EnumFindingOriginFieldUpdateOperationsInput = {
    set?: $Enums.FindingOrigin;
};
export type FindingCreateNestedManyWithoutAssetInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutAssetInput, Prisma.FindingUncheckedCreateWithoutAssetInput> | Prisma.FindingCreateWithoutAssetInput[] | Prisma.FindingUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutAssetInput | Prisma.FindingCreateOrConnectWithoutAssetInput[];
    createMany?: Prisma.FindingCreateManyAssetInputEnvelope;
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
};
export type FindingUncheckedCreateNestedManyWithoutAssetInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutAssetInput, Prisma.FindingUncheckedCreateWithoutAssetInput> | Prisma.FindingCreateWithoutAssetInput[] | Prisma.FindingUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutAssetInput | Prisma.FindingCreateOrConnectWithoutAssetInput[];
    createMany?: Prisma.FindingCreateManyAssetInputEnvelope;
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
};
export type FindingUpdateManyWithoutAssetNestedInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutAssetInput, Prisma.FindingUncheckedCreateWithoutAssetInput> | Prisma.FindingCreateWithoutAssetInput[] | Prisma.FindingUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutAssetInput | Prisma.FindingCreateOrConnectWithoutAssetInput[];
    upsert?: Prisma.FindingUpsertWithWhereUniqueWithoutAssetInput | Prisma.FindingUpsertWithWhereUniqueWithoutAssetInput[];
    createMany?: Prisma.FindingCreateManyAssetInputEnvelope;
    set?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    disconnect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    delete?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    update?: Prisma.FindingUpdateWithWhereUniqueWithoutAssetInput | Prisma.FindingUpdateWithWhereUniqueWithoutAssetInput[];
    updateMany?: Prisma.FindingUpdateManyWithWhereWithoutAssetInput | Prisma.FindingUpdateManyWithWhereWithoutAssetInput[];
    deleteMany?: Prisma.FindingScalarWhereInput | Prisma.FindingScalarWhereInput[];
};
export type FindingUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutAssetInput, Prisma.FindingUncheckedCreateWithoutAssetInput> | Prisma.FindingCreateWithoutAssetInput[] | Prisma.FindingUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutAssetInput | Prisma.FindingCreateOrConnectWithoutAssetInput[];
    upsert?: Prisma.FindingUpsertWithWhereUniqueWithoutAssetInput | Prisma.FindingUpsertWithWhereUniqueWithoutAssetInput[];
    createMany?: Prisma.FindingCreateManyAssetInputEnvelope;
    set?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    disconnect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    delete?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    update?: Prisma.FindingUpdateWithWhereUniqueWithoutAssetInput | Prisma.FindingUpdateWithWhereUniqueWithoutAssetInput[];
    updateMany?: Prisma.FindingUpdateManyWithWhereWithoutAssetInput | Prisma.FindingUpdateManyWithWhereWithoutAssetInput[];
    deleteMany?: Prisma.FindingScalarWhereInput | Prisma.FindingScalarWhereInput[];
};
export type FindingCreateWithoutTenantInput = {
    id?: string;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
    evaluation: Prisma.EvaluationCreateNestedOneWithoutFindingsInput;
    asset: Prisma.AssetCreateNestedOneWithoutFindingsInput;
    reportedByUser?: Prisma.UserCreateNestedOneWithoutFindingsReportedInput;
};
export type FindingUncheckedCreateWithoutTenantInput = {
    id?: string;
    evaluationId: string;
    assetId: string;
    reportedBy?: string | null;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
};
export type FindingCreateOrConnectWithoutTenantInput = {
    where: Prisma.FindingWhereUniqueInput;
    create: Prisma.XOR<Prisma.FindingCreateWithoutTenantInput, Prisma.FindingUncheckedCreateWithoutTenantInput>;
};
export type FindingCreateManyTenantInputEnvelope = {
    data: Prisma.FindingCreateManyTenantInput | Prisma.FindingCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type FindingUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.FindingWhereUniqueInput;
    update: Prisma.XOR<Prisma.FindingUpdateWithoutTenantInput, Prisma.FindingUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.FindingCreateWithoutTenantInput, Prisma.FindingUncheckedCreateWithoutTenantInput>;
};
export type FindingUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.FindingWhereUniqueInput;
    data: Prisma.XOR<Prisma.FindingUpdateWithoutTenantInput, Prisma.FindingUncheckedUpdateWithoutTenantInput>;
};
export type FindingUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.FindingScalarWhereInput;
    data: Prisma.XOR<Prisma.FindingUpdateManyMutationInput, Prisma.FindingUncheckedUpdateManyWithoutTenantInput>;
};
export type FindingScalarWhereInput = {
    AND?: Prisma.FindingScalarWhereInput | Prisma.FindingScalarWhereInput[];
    OR?: Prisma.FindingScalarWhereInput[];
    NOT?: Prisma.FindingScalarWhereInput | Prisma.FindingScalarWhereInput[];
    id?: Prisma.UuidFilter<"Finding"> | string;
    tenantId?: Prisma.UuidFilter<"Finding"> | string;
    evaluationId?: Prisma.UuidFilter<"Finding"> | string;
    assetId?: Prisma.UuidFilter<"Finding"> | string;
    reportedBy?: Prisma.UuidNullableFilter<"Finding"> | string | null;
    dimension?: Prisma.EnumDimensionFilter<"Finding"> | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFilter<"Finding"> | string;
    severity?: Prisma.EnumSeverityFilter<"Finding"> | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFilter<"Finding"> | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFilter<"Finding"> | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFilter<"Finding"> | Date | string;
    closedAt?: Prisma.DateTimeNullableFilter<"Finding"> | Date | string | null;
};
export type FindingCreateWithoutReportedByUserInput = {
    id?: string;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
    evaluation: Prisma.EvaluationCreateNestedOneWithoutFindingsInput;
    asset: Prisma.AssetCreateNestedOneWithoutFindingsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutFindingsInput;
};
export type FindingUncheckedCreateWithoutReportedByUserInput = {
    id?: string;
    tenantId: string;
    evaluationId: string;
    assetId: string;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
};
export type FindingCreateOrConnectWithoutReportedByUserInput = {
    where: Prisma.FindingWhereUniqueInput;
    create: Prisma.XOR<Prisma.FindingCreateWithoutReportedByUserInput, Prisma.FindingUncheckedCreateWithoutReportedByUserInput>;
};
export type FindingCreateManyReportedByUserInputEnvelope = {
    data: Prisma.FindingCreateManyReportedByUserInput | Prisma.FindingCreateManyReportedByUserInput[];
    skipDuplicates?: boolean;
};
export type FindingUpsertWithWhereUniqueWithoutReportedByUserInput = {
    where: Prisma.FindingWhereUniqueInput;
    update: Prisma.XOR<Prisma.FindingUpdateWithoutReportedByUserInput, Prisma.FindingUncheckedUpdateWithoutReportedByUserInput>;
    create: Prisma.XOR<Prisma.FindingCreateWithoutReportedByUserInput, Prisma.FindingUncheckedCreateWithoutReportedByUserInput>;
};
export type FindingUpdateWithWhereUniqueWithoutReportedByUserInput = {
    where: Prisma.FindingWhereUniqueInput;
    data: Prisma.XOR<Prisma.FindingUpdateWithoutReportedByUserInput, Prisma.FindingUncheckedUpdateWithoutReportedByUserInput>;
};
export type FindingUpdateManyWithWhereWithoutReportedByUserInput = {
    where: Prisma.FindingScalarWhereInput;
    data: Prisma.XOR<Prisma.FindingUpdateManyMutationInput, Prisma.FindingUncheckedUpdateManyWithoutReportedByUserInput>;
};
export type FindingCreateWithoutEvaluationInput = {
    id?: string;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
    asset: Prisma.AssetCreateNestedOneWithoutFindingsInput;
    reportedByUser?: Prisma.UserCreateNestedOneWithoutFindingsReportedInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutFindingsInput;
};
export type FindingUncheckedCreateWithoutEvaluationInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    reportedBy?: string | null;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
};
export type FindingCreateOrConnectWithoutEvaluationInput = {
    where: Prisma.FindingWhereUniqueInput;
    create: Prisma.XOR<Prisma.FindingCreateWithoutEvaluationInput, Prisma.FindingUncheckedCreateWithoutEvaluationInput>;
};
export type FindingCreateManyEvaluationInputEnvelope = {
    data: Prisma.FindingCreateManyEvaluationInput | Prisma.FindingCreateManyEvaluationInput[];
    skipDuplicates?: boolean;
};
export type FindingUpsertWithWhereUniqueWithoutEvaluationInput = {
    where: Prisma.FindingWhereUniqueInput;
    update: Prisma.XOR<Prisma.FindingUpdateWithoutEvaluationInput, Prisma.FindingUncheckedUpdateWithoutEvaluationInput>;
    create: Prisma.XOR<Prisma.FindingCreateWithoutEvaluationInput, Prisma.FindingUncheckedCreateWithoutEvaluationInput>;
};
export type FindingUpdateWithWhereUniqueWithoutEvaluationInput = {
    where: Prisma.FindingWhereUniqueInput;
    data: Prisma.XOR<Prisma.FindingUpdateWithoutEvaluationInput, Prisma.FindingUncheckedUpdateWithoutEvaluationInput>;
};
export type FindingUpdateManyWithWhereWithoutEvaluationInput = {
    where: Prisma.FindingScalarWhereInput;
    data: Prisma.XOR<Prisma.FindingUpdateManyMutationInput, Prisma.FindingUncheckedUpdateManyWithoutEvaluationInput>;
};
export type FindingCreateWithoutAssetInput = {
    id?: string;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
    evaluation: Prisma.EvaluationCreateNestedOneWithoutFindingsInput;
    reportedByUser?: Prisma.UserCreateNestedOneWithoutFindingsReportedInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutFindingsInput;
};
export type FindingUncheckedCreateWithoutAssetInput = {
    id?: string;
    tenantId: string;
    evaluationId: string;
    reportedBy?: string | null;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
};
export type FindingCreateOrConnectWithoutAssetInput = {
    where: Prisma.FindingWhereUniqueInput;
    create: Prisma.XOR<Prisma.FindingCreateWithoutAssetInput, Prisma.FindingUncheckedCreateWithoutAssetInput>;
};
export type FindingCreateManyAssetInputEnvelope = {
    data: Prisma.FindingCreateManyAssetInput | Prisma.FindingCreateManyAssetInput[];
    skipDuplicates?: boolean;
};
export type FindingUpsertWithWhereUniqueWithoutAssetInput = {
    where: Prisma.FindingWhereUniqueInput;
    update: Prisma.XOR<Prisma.FindingUpdateWithoutAssetInput, Prisma.FindingUncheckedUpdateWithoutAssetInput>;
    create: Prisma.XOR<Prisma.FindingCreateWithoutAssetInput, Prisma.FindingUncheckedCreateWithoutAssetInput>;
};
export type FindingUpdateWithWhereUniqueWithoutAssetInput = {
    where: Prisma.FindingWhereUniqueInput;
    data: Prisma.XOR<Prisma.FindingUpdateWithoutAssetInput, Prisma.FindingUncheckedUpdateWithoutAssetInput>;
};
export type FindingUpdateManyWithWhereWithoutAssetInput = {
    where: Prisma.FindingScalarWhereInput;
    data: Prisma.XOR<Prisma.FindingUpdateManyMutationInput, Prisma.FindingUncheckedUpdateManyWithoutAssetInput>;
};
export type FindingCreateManyTenantInput = {
    id?: string;
    evaluationId: string;
    assetId: string;
    reportedBy?: string | null;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
};
export type FindingUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    evaluation?: Prisma.EvaluationUpdateOneRequiredWithoutFindingsNestedInput;
    asset?: Prisma.AssetUpdateOneRequiredWithoutFindingsNestedInput;
    reportedByUser?: Prisma.UserUpdateOneWithoutFindingsReportedNestedInput;
};
export type FindingUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    evaluationId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    reportedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type FindingUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    evaluationId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    reportedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type FindingCreateManyReportedByUserInput = {
    id?: string;
    tenantId: string;
    evaluationId: string;
    assetId: string;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
};
export type FindingUpdateWithoutReportedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    evaluation?: Prisma.EvaluationUpdateOneRequiredWithoutFindingsNestedInput;
    asset?: Prisma.AssetUpdateOneRequiredWithoutFindingsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutFindingsNestedInput;
};
export type FindingUncheckedUpdateWithoutReportedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    evaluationId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type FindingUncheckedUpdateManyWithoutReportedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    evaluationId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type FindingCreateManyEvaluationInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    reportedBy?: string | null;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
};
export type FindingUpdateWithoutEvaluationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    asset?: Prisma.AssetUpdateOneRequiredWithoutFindingsNestedInput;
    reportedByUser?: Prisma.UserUpdateOneWithoutFindingsReportedNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutFindingsNestedInput;
};
export type FindingUncheckedUpdateWithoutEvaluationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    reportedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type FindingUncheckedUpdateManyWithoutEvaluationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    reportedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type FindingCreateManyAssetInput = {
    id?: string;
    tenantId: string;
    evaluationId: string;
    reportedBy?: string | null;
    dimension: $Enums.Dimension;
    failedTestOrCheck: string;
    severity: $Enums.Severity;
    status?: $Enums.FindingStatus;
    origin: $Enums.FindingOrigin;
    detectedAt: Date | string;
    closedAt?: Date | string | null;
};
export type FindingUpdateWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    evaluation?: Prisma.EvaluationUpdateOneRequiredWithoutFindingsNestedInput;
    reportedByUser?: Prisma.UserUpdateOneWithoutFindingsReportedNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutFindingsNestedInput;
};
export type FindingUncheckedUpdateWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    evaluationId?: Prisma.StringFieldUpdateOperationsInput | string;
    reportedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type FindingUncheckedUpdateManyWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    evaluationId?: Prisma.StringFieldUpdateOperationsInput | string;
    reportedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    failedTestOrCheck?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.EnumSeverityFieldUpdateOperationsInput | $Enums.Severity;
    status?: Prisma.EnumFindingStatusFieldUpdateOperationsInput | $Enums.FindingStatus;
    origin?: Prisma.EnumFindingOriginFieldUpdateOperationsInput | $Enums.FindingOrigin;
    detectedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type FindingSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    evaluationId?: boolean;
    assetId?: boolean;
    reportedBy?: boolean;
    dimension?: boolean;
    failedTestOrCheck?: boolean;
    severity?: boolean;
    status?: boolean;
    origin?: boolean;
    detectedAt?: boolean;
    closedAt?: boolean;
    evaluation?: boolean | Prisma.EvaluationDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    reportedByUser?: boolean | Prisma.Finding$reportedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["finding"]>;
export type FindingSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    evaluationId?: boolean;
    assetId?: boolean;
    reportedBy?: boolean;
    dimension?: boolean;
    failedTestOrCheck?: boolean;
    severity?: boolean;
    status?: boolean;
    origin?: boolean;
    detectedAt?: boolean;
    closedAt?: boolean;
    evaluation?: boolean | Prisma.EvaluationDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    reportedByUser?: boolean | Prisma.Finding$reportedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["finding"]>;
export type FindingSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    evaluationId?: boolean;
    assetId?: boolean;
    reportedBy?: boolean;
    dimension?: boolean;
    failedTestOrCheck?: boolean;
    severity?: boolean;
    status?: boolean;
    origin?: boolean;
    detectedAt?: boolean;
    closedAt?: boolean;
    evaluation?: boolean | Prisma.EvaluationDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    reportedByUser?: boolean | Prisma.Finding$reportedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["finding"]>;
export type FindingSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    evaluationId?: boolean;
    assetId?: boolean;
    reportedBy?: boolean;
    dimension?: boolean;
    failedTestOrCheck?: boolean;
    severity?: boolean;
    status?: boolean;
    origin?: boolean;
    detectedAt?: boolean;
    closedAt?: boolean;
};
export type FindingOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "evaluationId" | "assetId" | "reportedBy" | "dimension" | "failedTestOrCheck" | "severity" | "status" | "origin" | "detectedAt" | "closedAt", ExtArgs["result"]["finding"]>;
export type FindingInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    evaluation?: boolean | Prisma.EvaluationDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    reportedByUser?: boolean | Prisma.Finding$reportedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type FindingIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    evaluation?: boolean | Prisma.EvaluationDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    reportedByUser?: boolean | Prisma.Finding$reportedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type FindingIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    evaluation?: boolean | Prisma.EvaluationDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    reportedByUser?: boolean | Prisma.Finding$reportedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $FindingPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Finding";
    objects: {
        evaluation: Prisma.$EvaluationPayload<ExtArgs>;
        asset: Prisma.$AssetPayload<ExtArgs>;
        reportedByUser: Prisma.$UserPayload<ExtArgs> | null;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        evaluationId: string;
        assetId: string;
        reportedBy: string | null;
        dimension: $Enums.Dimension;
        failedTestOrCheck: string;
        severity: $Enums.Severity;
        status: $Enums.FindingStatus;
        origin: $Enums.FindingOrigin;
        detectedAt: Date;
        closedAt: Date | null;
    }, ExtArgs["result"]["finding"]>;
    composites: {};
};
export type FindingGetPayload<S extends boolean | null | undefined | FindingDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$FindingPayload, S>;
export type FindingCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<FindingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: FindingCountAggregateInputType | true;
};
export interface FindingDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Finding'];
        meta: {
            name: 'Finding';
        };
    };
    findUnique<T extends FindingFindUniqueArgs>(args: Prisma.SelectSubset<T, FindingFindUniqueArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends FindingFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, FindingFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends FindingFindFirstArgs>(args?: Prisma.SelectSubset<T, FindingFindFirstArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends FindingFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, FindingFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends FindingFindManyArgs>(args?: Prisma.SelectSubset<T, FindingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends FindingCreateArgs>(args: Prisma.SelectSubset<T, FindingCreateArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends FindingCreateManyArgs>(args?: Prisma.SelectSubset<T, FindingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends FindingCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, FindingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends FindingDeleteArgs>(args: Prisma.SelectSubset<T, FindingDeleteArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends FindingUpdateArgs>(args: Prisma.SelectSubset<T, FindingUpdateArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends FindingDeleteManyArgs>(args?: Prisma.SelectSubset<T, FindingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends FindingUpdateManyArgs>(args: Prisma.SelectSubset<T, FindingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends FindingUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, FindingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends FindingUpsertArgs>(args: Prisma.SelectSubset<T, FindingUpsertArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends FindingCountArgs>(args?: Prisma.Subset<T, FindingCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], FindingCountAggregateOutputType> : number>;
    aggregate<T extends FindingAggregateArgs>(args: Prisma.Subset<T, FindingAggregateArgs>): Prisma.PrismaPromise<GetFindingAggregateType<T>>;
    groupBy<T extends FindingGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: FindingGroupByArgs['orderBy'];
    } : {
        orderBy?: FindingGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, FindingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFindingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: FindingFieldRefs;
}
export interface Prisma__FindingClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    evaluation<T extends Prisma.EvaluationDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EvaluationDefaultArgs<ExtArgs>>): Prisma.Prisma__EvaluationClient<runtime.Types.Result.GetResult<Prisma.$EvaluationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    asset<T extends Prisma.AssetDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.AssetDefaultArgs<ExtArgs>>): Prisma.Prisma__AssetClient<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    reportedByUser<T extends Prisma.Finding$reportedByUserArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Finding$reportedByUserArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface FindingFieldRefs {
    readonly id: Prisma.FieldRef<"Finding", 'String'>;
    readonly tenantId: Prisma.FieldRef<"Finding", 'String'>;
    readonly evaluationId: Prisma.FieldRef<"Finding", 'String'>;
    readonly assetId: Prisma.FieldRef<"Finding", 'String'>;
    readonly reportedBy: Prisma.FieldRef<"Finding", 'String'>;
    readonly dimension: Prisma.FieldRef<"Finding", 'Dimension'>;
    readonly failedTestOrCheck: Prisma.FieldRef<"Finding", 'String'>;
    readonly severity: Prisma.FieldRef<"Finding", 'Severity'>;
    readonly status: Prisma.FieldRef<"Finding", 'FindingStatus'>;
    readonly origin: Prisma.FieldRef<"Finding", 'FindingOrigin'>;
    readonly detectedAt: Prisma.FieldRef<"Finding", 'DateTime'>;
    readonly closedAt: Prisma.FieldRef<"Finding", 'DateTime'>;
}
export type FindingFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    where: Prisma.FindingWhereUniqueInput;
};
export type FindingFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    where: Prisma.FindingWhereUniqueInput;
};
export type FindingFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    where?: Prisma.FindingWhereInput;
    orderBy?: Prisma.FindingOrderByWithRelationInput | Prisma.FindingOrderByWithRelationInput[];
    cursor?: Prisma.FindingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FindingScalarFieldEnum | Prisma.FindingScalarFieldEnum[];
};
export type FindingFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    where?: Prisma.FindingWhereInput;
    orderBy?: Prisma.FindingOrderByWithRelationInput | Prisma.FindingOrderByWithRelationInput[];
    cursor?: Prisma.FindingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FindingScalarFieldEnum | Prisma.FindingScalarFieldEnum[];
};
export type FindingFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    where?: Prisma.FindingWhereInput;
    orderBy?: Prisma.FindingOrderByWithRelationInput | Prisma.FindingOrderByWithRelationInput[];
    cursor?: Prisma.FindingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FindingScalarFieldEnum | Prisma.FindingScalarFieldEnum[];
};
export type FindingCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.FindingCreateInput, Prisma.FindingUncheckedCreateInput>;
};
export type FindingCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.FindingCreateManyInput | Prisma.FindingCreateManyInput[];
    skipDuplicates?: boolean;
};
export type FindingCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    data: Prisma.FindingCreateManyInput | Prisma.FindingCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.FindingIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type FindingUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.FindingUpdateInput, Prisma.FindingUncheckedUpdateInput>;
    where: Prisma.FindingWhereUniqueInput;
};
export type FindingUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.FindingUpdateManyMutationInput, Prisma.FindingUncheckedUpdateManyInput>;
    where?: Prisma.FindingWhereInput;
    limit?: number;
};
export type FindingUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.FindingUpdateManyMutationInput, Prisma.FindingUncheckedUpdateManyInput>;
    where?: Prisma.FindingWhereInput;
    limit?: number;
    include?: Prisma.FindingIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type FindingUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    where: Prisma.FindingWhereUniqueInput;
    create: Prisma.XOR<Prisma.FindingCreateInput, Prisma.FindingUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.FindingUpdateInput, Prisma.FindingUncheckedUpdateInput>;
};
export type FindingDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    where: Prisma.FindingWhereUniqueInput;
};
export type FindingDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FindingWhereInput;
    limit?: number;
};
export type Finding$reportedByUserArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
export type FindingDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
};
export {};
