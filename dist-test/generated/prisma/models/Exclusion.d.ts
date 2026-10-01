import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ExclusionModel = runtime.Types.Result.DefaultSelection<Prisma.$ExclusionPayload>;
export type AggregateExclusion = {
    _count: ExclusionCountAggregateOutputType | null;
    _min: ExclusionMinAggregateOutputType | null;
    _max: ExclusionMaxAggregateOutputType | null;
};
export type ExclusionMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    testId: string | null;
    proposedBy: string | null;
    approvedBy: string | null;
    excludedCheckId: string | null;
    justification: string | null;
    validUntil: Date | null;
};
export type ExclusionMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    testId: string | null;
    proposedBy: string | null;
    approvedBy: string | null;
    excludedCheckId: string | null;
    justification: string | null;
    validUntil: Date | null;
};
export type ExclusionCountAggregateOutputType = {
    id: number;
    tenantId: number;
    testId: number;
    proposedBy: number;
    approvedBy: number;
    excludedCheckId: number;
    justification: number;
    validUntil: number;
    _all: number;
};
export type ExclusionMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    testId?: true;
    proposedBy?: true;
    approvedBy?: true;
    excludedCheckId?: true;
    justification?: true;
    validUntil?: true;
};
export type ExclusionMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    testId?: true;
    proposedBy?: true;
    approvedBy?: true;
    excludedCheckId?: true;
    justification?: true;
    validUntil?: true;
};
export type ExclusionCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    testId?: true;
    proposedBy?: true;
    approvedBy?: true;
    excludedCheckId?: true;
    justification?: true;
    validUntil?: true;
    _all?: true;
};
export type ExclusionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExclusionWhereInput;
    orderBy?: Prisma.ExclusionOrderByWithRelationInput | Prisma.ExclusionOrderByWithRelationInput[];
    cursor?: Prisma.ExclusionWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ExclusionCountAggregateInputType;
    _min?: ExclusionMinAggregateInputType;
    _max?: ExclusionMaxAggregateInputType;
};
export type GetExclusionAggregateType<T extends ExclusionAggregateArgs> = {
    [P in keyof T & keyof AggregateExclusion]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateExclusion[P]> : Prisma.GetScalarType<T[P], AggregateExclusion[P]>;
};
export type ExclusionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExclusionWhereInput;
    orderBy?: Prisma.ExclusionOrderByWithAggregationInput | Prisma.ExclusionOrderByWithAggregationInput[];
    by: Prisma.ExclusionScalarFieldEnum[] | Prisma.ExclusionScalarFieldEnum;
    having?: Prisma.ExclusionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ExclusionCountAggregateInputType | true;
    _min?: ExclusionMinAggregateInputType;
    _max?: ExclusionMaxAggregateInputType;
};
export type ExclusionGroupByOutputType = {
    id: string;
    tenantId: string;
    testId: string;
    proposedBy: string;
    approvedBy: string | null;
    excludedCheckId: string;
    justification: string;
    validUntil: Date;
    _count: ExclusionCountAggregateOutputType | null;
    _min: ExclusionMinAggregateOutputType | null;
    _max: ExclusionMaxAggregateOutputType | null;
};
type GetExclusionGroupByPayload<T extends ExclusionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ExclusionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ExclusionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ExclusionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ExclusionGroupByOutputType[P]>;
}>>;
export type ExclusionWhereInput = {
    AND?: Prisma.ExclusionWhereInput | Prisma.ExclusionWhereInput[];
    OR?: Prisma.ExclusionWhereInput[];
    NOT?: Prisma.ExclusionWhereInput | Prisma.ExclusionWhereInput[];
    id?: Prisma.UuidFilter<"Exclusion"> | string;
    tenantId?: Prisma.UuidFilter<"Exclusion"> | string;
    testId?: Prisma.UuidFilter<"Exclusion"> | string;
    proposedBy?: Prisma.UuidFilter<"Exclusion"> | string;
    approvedBy?: Prisma.UuidNullableFilter<"Exclusion"> | string | null;
    excludedCheckId?: Prisma.StringFilter<"Exclusion"> | string;
    justification?: Prisma.StringFilter<"Exclusion"> | string;
    validUntil?: Prisma.DateTimeFilter<"Exclusion"> | Date | string;
    test?: Prisma.XOR<Prisma.TestScalarRelationFilter, Prisma.TestWhereInput>;
    proposedByUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    approvedByUser?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type ExclusionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
    proposedBy?: Prisma.SortOrder;
    approvedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    excludedCheckId?: Prisma.SortOrder;
    justification?: Prisma.SortOrder;
    validUntil?: Prisma.SortOrder;
    test?: Prisma.TestOrderByWithRelationInput;
    proposedByUser?: Prisma.UserOrderByWithRelationInput;
    approvedByUser?: Prisma.UserOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type ExclusionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ExclusionWhereInput | Prisma.ExclusionWhereInput[];
    OR?: Prisma.ExclusionWhereInput[];
    NOT?: Prisma.ExclusionWhereInput | Prisma.ExclusionWhereInput[];
    tenantId?: Prisma.UuidFilter<"Exclusion"> | string;
    testId?: Prisma.UuidFilter<"Exclusion"> | string;
    proposedBy?: Prisma.UuidFilter<"Exclusion"> | string;
    approvedBy?: Prisma.UuidNullableFilter<"Exclusion"> | string | null;
    excludedCheckId?: Prisma.StringFilter<"Exclusion"> | string;
    justification?: Prisma.StringFilter<"Exclusion"> | string;
    validUntil?: Prisma.DateTimeFilter<"Exclusion"> | Date | string;
    test?: Prisma.XOR<Prisma.TestScalarRelationFilter, Prisma.TestWhereInput>;
    proposedByUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    approvedByUser?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id">;
export type ExclusionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
    proposedBy?: Prisma.SortOrder;
    approvedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    excludedCheckId?: Prisma.SortOrder;
    justification?: Prisma.SortOrder;
    validUntil?: Prisma.SortOrder;
    _count?: Prisma.ExclusionCountOrderByAggregateInput;
    _max?: Prisma.ExclusionMaxOrderByAggregateInput;
    _min?: Prisma.ExclusionMinOrderByAggregateInput;
};
export type ExclusionScalarWhereWithAggregatesInput = {
    AND?: Prisma.ExclusionScalarWhereWithAggregatesInput | Prisma.ExclusionScalarWhereWithAggregatesInput[];
    OR?: Prisma.ExclusionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ExclusionScalarWhereWithAggregatesInput | Prisma.ExclusionScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Exclusion"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"Exclusion"> | string;
    testId?: Prisma.UuidWithAggregatesFilter<"Exclusion"> | string;
    proposedBy?: Prisma.UuidWithAggregatesFilter<"Exclusion"> | string;
    approvedBy?: Prisma.UuidNullableWithAggregatesFilter<"Exclusion"> | string | null;
    excludedCheckId?: Prisma.StringWithAggregatesFilter<"Exclusion"> | string;
    justification?: Prisma.StringWithAggregatesFilter<"Exclusion"> | string;
    validUntil?: Prisma.DateTimeWithAggregatesFilter<"Exclusion"> | Date | string;
};
export type ExclusionCreateInput = {
    id?: string;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
    test: Prisma.TestCreateNestedOneWithoutExclusionsInput;
    proposedByUser: Prisma.UserCreateNestedOneWithoutExclusionsProposedInput;
    approvedByUser?: Prisma.UserCreateNestedOneWithoutExclusionsApprovedInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutExclusionsInput;
};
export type ExclusionUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    testId: string;
    proposedBy: string;
    approvedBy?: string | null;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
};
export type ExclusionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    test?: Prisma.TestUpdateOneRequiredWithoutExclusionsNestedInput;
    proposedByUser?: Prisma.UserUpdateOneRequiredWithoutExclusionsProposedNestedInput;
    approvedByUser?: Prisma.UserUpdateOneWithoutExclusionsApprovedNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutExclusionsNestedInput;
};
export type ExclusionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
    proposedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExclusionCreateManyInput = {
    id?: string;
    tenantId: string;
    testId: string;
    proposedBy: string;
    approvedBy?: string | null;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
};
export type ExclusionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExclusionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
    proposedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExclusionListRelationFilter = {
    every?: Prisma.ExclusionWhereInput;
    some?: Prisma.ExclusionWhereInput;
    none?: Prisma.ExclusionWhereInput;
};
export type ExclusionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ExclusionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
    proposedBy?: Prisma.SortOrder;
    approvedBy?: Prisma.SortOrder;
    excludedCheckId?: Prisma.SortOrder;
    justification?: Prisma.SortOrder;
    validUntil?: Prisma.SortOrder;
};
export type ExclusionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
    proposedBy?: Prisma.SortOrder;
    approvedBy?: Prisma.SortOrder;
    excludedCheckId?: Prisma.SortOrder;
    justification?: Prisma.SortOrder;
    validUntil?: Prisma.SortOrder;
};
export type ExclusionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
    proposedBy?: Prisma.SortOrder;
    approvedBy?: Prisma.SortOrder;
    excludedCheckId?: Prisma.SortOrder;
    justification?: Prisma.SortOrder;
    validUntil?: Prisma.SortOrder;
};
export type ExclusionCreateNestedManyWithoutTestInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutTestInput, Prisma.ExclusionUncheckedCreateWithoutTestInput> | Prisma.ExclusionCreateWithoutTestInput[] | Prisma.ExclusionUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutTestInput | Prisma.ExclusionCreateOrConnectWithoutTestInput[];
    createMany?: Prisma.ExclusionCreateManyTestInputEnvelope;
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
};
export type ExclusionUncheckedCreateNestedManyWithoutTestInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutTestInput, Prisma.ExclusionUncheckedCreateWithoutTestInput> | Prisma.ExclusionCreateWithoutTestInput[] | Prisma.ExclusionUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutTestInput | Prisma.ExclusionCreateOrConnectWithoutTestInput[];
    createMany?: Prisma.ExclusionCreateManyTestInputEnvelope;
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
};
export type ExclusionUpdateManyWithoutTestNestedInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutTestInput, Prisma.ExclusionUncheckedCreateWithoutTestInput> | Prisma.ExclusionCreateWithoutTestInput[] | Prisma.ExclusionUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutTestInput | Prisma.ExclusionCreateOrConnectWithoutTestInput[];
    upsert?: Prisma.ExclusionUpsertWithWhereUniqueWithoutTestInput | Prisma.ExclusionUpsertWithWhereUniqueWithoutTestInput[];
    createMany?: Prisma.ExclusionCreateManyTestInputEnvelope;
    set?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    disconnect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    delete?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    update?: Prisma.ExclusionUpdateWithWhereUniqueWithoutTestInput | Prisma.ExclusionUpdateWithWhereUniqueWithoutTestInput[];
    updateMany?: Prisma.ExclusionUpdateManyWithWhereWithoutTestInput | Prisma.ExclusionUpdateManyWithWhereWithoutTestInput[];
    deleteMany?: Prisma.ExclusionScalarWhereInput | Prisma.ExclusionScalarWhereInput[];
};
export type ExclusionUncheckedUpdateManyWithoutTestNestedInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutTestInput, Prisma.ExclusionUncheckedCreateWithoutTestInput> | Prisma.ExclusionCreateWithoutTestInput[] | Prisma.ExclusionUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutTestInput | Prisma.ExclusionCreateOrConnectWithoutTestInput[];
    upsert?: Prisma.ExclusionUpsertWithWhereUniqueWithoutTestInput | Prisma.ExclusionUpsertWithWhereUniqueWithoutTestInput[];
    createMany?: Prisma.ExclusionCreateManyTestInputEnvelope;
    set?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    disconnect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    delete?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    update?: Prisma.ExclusionUpdateWithWhereUniqueWithoutTestInput | Prisma.ExclusionUpdateWithWhereUniqueWithoutTestInput[];
    updateMany?: Prisma.ExclusionUpdateManyWithWhereWithoutTestInput | Prisma.ExclusionUpdateManyWithWhereWithoutTestInput[];
    deleteMany?: Prisma.ExclusionScalarWhereInput | Prisma.ExclusionScalarWhereInput[];
};
export type ExclusionCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutTenantInput, Prisma.ExclusionUncheckedCreateWithoutTenantInput> | Prisma.ExclusionCreateWithoutTenantInput[] | Prisma.ExclusionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutTenantInput | Prisma.ExclusionCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ExclusionCreateManyTenantInputEnvelope;
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
};
export type ExclusionUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutTenantInput, Prisma.ExclusionUncheckedCreateWithoutTenantInput> | Prisma.ExclusionCreateWithoutTenantInput[] | Prisma.ExclusionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutTenantInput | Prisma.ExclusionCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ExclusionCreateManyTenantInputEnvelope;
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
};
export type ExclusionUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutTenantInput, Prisma.ExclusionUncheckedCreateWithoutTenantInput> | Prisma.ExclusionCreateWithoutTenantInput[] | Prisma.ExclusionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutTenantInput | Prisma.ExclusionCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ExclusionUpsertWithWhereUniqueWithoutTenantInput | Prisma.ExclusionUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ExclusionCreateManyTenantInputEnvelope;
    set?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    disconnect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    delete?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    update?: Prisma.ExclusionUpdateWithWhereUniqueWithoutTenantInput | Prisma.ExclusionUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ExclusionUpdateManyWithWhereWithoutTenantInput | Prisma.ExclusionUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ExclusionScalarWhereInput | Prisma.ExclusionScalarWhereInput[];
};
export type ExclusionUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutTenantInput, Prisma.ExclusionUncheckedCreateWithoutTenantInput> | Prisma.ExclusionCreateWithoutTenantInput[] | Prisma.ExclusionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutTenantInput | Prisma.ExclusionCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ExclusionUpsertWithWhereUniqueWithoutTenantInput | Prisma.ExclusionUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ExclusionCreateManyTenantInputEnvelope;
    set?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    disconnect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    delete?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    update?: Prisma.ExclusionUpdateWithWhereUniqueWithoutTenantInput | Prisma.ExclusionUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ExclusionUpdateManyWithWhereWithoutTenantInput | Prisma.ExclusionUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ExclusionScalarWhereInput | Prisma.ExclusionScalarWhereInput[];
};
export type ExclusionCreateNestedManyWithoutProposedByUserInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutProposedByUserInput, Prisma.ExclusionUncheckedCreateWithoutProposedByUserInput> | Prisma.ExclusionCreateWithoutProposedByUserInput[] | Prisma.ExclusionUncheckedCreateWithoutProposedByUserInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutProposedByUserInput | Prisma.ExclusionCreateOrConnectWithoutProposedByUserInput[];
    createMany?: Prisma.ExclusionCreateManyProposedByUserInputEnvelope;
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
};
export type ExclusionCreateNestedManyWithoutApprovedByUserInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutApprovedByUserInput, Prisma.ExclusionUncheckedCreateWithoutApprovedByUserInput> | Prisma.ExclusionCreateWithoutApprovedByUserInput[] | Prisma.ExclusionUncheckedCreateWithoutApprovedByUserInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutApprovedByUserInput | Prisma.ExclusionCreateOrConnectWithoutApprovedByUserInput[];
    createMany?: Prisma.ExclusionCreateManyApprovedByUserInputEnvelope;
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
};
export type ExclusionUncheckedCreateNestedManyWithoutProposedByUserInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutProposedByUserInput, Prisma.ExclusionUncheckedCreateWithoutProposedByUserInput> | Prisma.ExclusionCreateWithoutProposedByUserInput[] | Prisma.ExclusionUncheckedCreateWithoutProposedByUserInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutProposedByUserInput | Prisma.ExclusionCreateOrConnectWithoutProposedByUserInput[];
    createMany?: Prisma.ExclusionCreateManyProposedByUserInputEnvelope;
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
};
export type ExclusionUncheckedCreateNestedManyWithoutApprovedByUserInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutApprovedByUserInput, Prisma.ExclusionUncheckedCreateWithoutApprovedByUserInput> | Prisma.ExclusionCreateWithoutApprovedByUserInput[] | Prisma.ExclusionUncheckedCreateWithoutApprovedByUserInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutApprovedByUserInput | Prisma.ExclusionCreateOrConnectWithoutApprovedByUserInput[];
    createMany?: Prisma.ExclusionCreateManyApprovedByUserInputEnvelope;
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
};
export type ExclusionUpdateManyWithoutProposedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutProposedByUserInput, Prisma.ExclusionUncheckedCreateWithoutProposedByUserInput> | Prisma.ExclusionCreateWithoutProposedByUserInput[] | Prisma.ExclusionUncheckedCreateWithoutProposedByUserInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutProposedByUserInput | Prisma.ExclusionCreateOrConnectWithoutProposedByUserInput[];
    upsert?: Prisma.ExclusionUpsertWithWhereUniqueWithoutProposedByUserInput | Prisma.ExclusionUpsertWithWhereUniqueWithoutProposedByUserInput[];
    createMany?: Prisma.ExclusionCreateManyProposedByUserInputEnvelope;
    set?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    disconnect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    delete?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    update?: Prisma.ExclusionUpdateWithWhereUniqueWithoutProposedByUserInput | Prisma.ExclusionUpdateWithWhereUniqueWithoutProposedByUserInput[];
    updateMany?: Prisma.ExclusionUpdateManyWithWhereWithoutProposedByUserInput | Prisma.ExclusionUpdateManyWithWhereWithoutProposedByUserInput[];
    deleteMany?: Prisma.ExclusionScalarWhereInput | Prisma.ExclusionScalarWhereInput[];
};
export type ExclusionUpdateManyWithoutApprovedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutApprovedByUserInput, Prisma.ExclusionUncheckedCreateWithoutApprovedByUserInput> | Prisma.ExclusionCreateWithoutApprovedByUserInput[] | Prisma.ExclusionUncheckedCreateWithoutApprovedByUserInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutApprovedByUserInput | Prisma.ExclusionCreateOrConnectWithoutApprovedByUserInput[];
    upsert?: Prisma.ExclusionUpsertWithWhereUniqueWithoutApprovedByUserInput | Prisma.ExclusionUpsertWithWhereUniqueWithoutApprovedByUserInput[];
    createMany?: Prisma.ExclusionCreateManyApprovedByUserInputEnvelope;
    set?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    disconnect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    delete?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    update?: Prisma.ExclusionUpdateWithWhereUniqueWithoutApprovedByUserInput | Prisma.ExclusionUpdateWithWhereUniqueWithoutApprovedByUserInput[];
    updateMany?: Prisma.ExclusionUpdateManyWithWhereWithoutApprovedByUserInput | Prisma.ExclusionUpdateManyWithWhereWithoutApprovedByUserInput[];
    deleteMany?: Prisma.ExclusionScalarWhereInput | Prisma.ExclusionScalarWhereInput[];
};
export type ExclusionUncheckedUpdateManyWithoutProposedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutProposedByUserInput, Prisma.ExclusionUncheckedCreateWithoutProposedByUserInput> | Prisma.ExclusionCreateWithoutProposedByUserInput[] | Prisma.ExclusionUncheckedCreateWithoutProposedByUserInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutProposedByUserInput | Prisma.ExclusionCreateOrConnectWithoutProposedByUserInput[];
    upsert?: Prisma.ExclusionUpsertWithWhereUniqueWithoutProposedByUserInput | Prisma.ExclusionUpsertWithWhereUniqueWithoutProposedByUserInput[];
    createMany?: Prisma.ExclusionCreateManyProposedByUserInputEnvelope;
    set?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    disconnect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    delete?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    update?: Prisma.ExclusionUpdateWithWhereUniqueWithoutProposedByUserInput | Prisma.ExclusionUpdateWithWhereUniqueWithoutProposedByUserInput[];
    updateMany?: Prisma.ExclusionUpdateManyWithWhereWithoutProposedByUserInput | Prisma.ExclusionUpdateManyWithWhereWithoutProposedByUserInput[];
    deleteMany?: Prisma.ExclusionScalarWhereInput | Prisma.ExclusionScalarWhereInput[];
};
export type ExclusionUncheckedUpdateManyWithoutApprovedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.ExclusionCreateWithoutApprovedByUserInput, Prisma.ExclusionUncheckedCreateWithoutApprovedByUserInput> | Prisma.ExclusionCreateWithoutApprovedByUserInput[] | Prisma.ExclusionUncheckedCreateWithoutApprovedByUserInput[];
    connectOrCreate?: Prisma.ExclusionCreateOrConnectWithoutApprovedByUserInput | Prisma.ExclusionCreateOrConnectWithoutApprovedByUserInput[];
    upsert?: Prisma.ExclusionUpsertWithWhereUniqueWithoutApprovedByUserInput | Prisma.ExclusionUpsertWithWhereUniqueWithoutApprovedByUserInput[];
    createMany?: Prisma.ExclusionCreateManyApprovedByUserInputEnvelope;
    set?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    disconnect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    delete?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    connect?: Prisma.ExclusionWhereUniqueInput | Prisma.ExclusionWhereUniqueInput[];
    update?: Prisma.ExclusionUpdateWithWhereUniqueWithoutApprovedByUserInput | Prisma.ExclusionUpdateWithWhereUniqueWithoutApprovedByUserInput[];
    updateMany?: Prisma.ExclusionUpdateManyWithWhereWithoutApprovedByUserInput | Prisma.ExclusionUpdateManyWithWhereWithoutApprovedByUserInput[];
    deleteMany?: Prisma.ExclusionScalarWhereInput | Prisma.ExclusionScalarWhereInput[];
};
export type ExclusionCreateWithoutTestInput = {
    id?: string;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
    proposedByUser: Prisma.UserCreateNestedOneWithoutExclusionsProposedInput;
    approvedByUser?: Prisma.UserCreateNestedOneWithoutExclusionsApprovedInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutExclusionsInput;
};
export type ExclusionUncheckedCreateWithoutTestInput = {
    id?: string;
    tenantId: string;
    proposedBy: string;
    approvedBy?: string | null;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
};
export type ExclusionCreateOrConnectWithoutTestInput = {
    where: Prisma.ExclusionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExclusionCreateWithoutTestInput, Prisma.ExclusionUncheckedCreateWithoutTestInput>;
};
export type ExclusionCreateManyTestInputEnvelope = {
    data: Prisma.ExclusionCreateManyTestInput | Prisma.ExclusionCreateManyTestInput[];
    skipDuplicates?: boolean;
};
export type ExclusionUpsertWithWhereUniqueWithoutTestInput = {
    where: Prisma.ExclusionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExclusionUpdateWithoutTestInput, Prisma.ExclusionUncheckedUpdateWithoutTestInput>;
    create: Prisma.XOR<Prisma.ExclusionCreateWithoutTestInput, Prisma.ExclusionUncheckedCreateWithoutTestInput>;
};
export type ExclusionUpdateWithWhereUniqueWithoutTestInput = {
    where: Prisma.ExclusionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExclusionUpdateWithoutTestInput, Prisma.ExclusionUncheckedUpdateWithoutTestInput>;
};
export type ExclusionUpdateManyWithWhereWithoutTestInput = {
    where: Prisma.ExclusionScalarWhereInput;
    data: Prisma.XOR<Prisma.ExclusionUpdateManyMutationInput, Prisma.ExclusionUncheckedUpdateManyWithoutTestInput>;
};
export type ExclusionScalarWhereInput = {
    AND?: Prisma.ExclusionScalarWhereInput | Prisma.ExclusionScalarWhereInput[];
    OR?: Prisma.ExclusionScalarWhereInput[];
    NOT?: Prisma.ExclusionScalarWhereInput | Prisma.ExclusionScalarWhereInput[];
    id?: Prisma.UuidFilter<"Exclusion"> | string;
    tenantId?: Prisma.UuidFilter<"Exclusion"> | string;
    testId?: Prisma.UuidFilter<"Exclusion"> | string;
    proposedBy?: Prisma.UuidFilter<"Exclusion"> | string;
    approvedBy?: Prisma.UuidNullableFilter<"Exclusion"> | string | null;
    excludedCheckId?: Prisma.StringFilter<"Exclusion"> | string;
    justification?: Prisma.StringFilter<"Exclusion"> | string;
    validUntil?: Prisma.DateTimeFilter<"Exclusion"> | Date | string;
};
export type ExclusionCreateWithoutTenantInput = {
    id?: string;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
    test: Prisma.TestCreateNestedOneWithoutExclusionsInput;
    proposedByUser: Prisma.UserCreateNestedOneWithoutExclusionsProposedInput;
    approvedByUser?: Prisma.UserCreateNestedOneWithoutExclusionsApprovedInput;
};
export type ExclusionUncheckedCreateWithoutTenantInput = {
    id?: string;
    testId: string;
    proposedBy: string;
    approvedBy?: string | null;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
};
export type ExclusionCreateOrConnectWithoutTenantInput = {
    where: Prisma.ExclusionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExclusionCreateWithoutTenantInput, Prisma.ExclusionUncheckedCreateWithoutTenantInput>;
};
export type ExclusionCreateManyTenantInputEnvelope = {
    data: Prisma.ExclusionCreateManyTenantInput | Prisma.ExclusionCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ExclusionUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ExclusionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExclusionUpdateWithoutTenantInput, Prisma.ExclusionUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ExclusionCreateWithoutTenantInput, Prisma.ExclusionUncheckedCreateWithoutTenantInput>;
};
export type ExclusionUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ExclusionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExclusionUpdateWithoutTenantInput, Prisma.ExclusionUncheckedUpdateWithoutTenantInput>;
};
export type ExclusionUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ExclusionScalarWhereInput;
    data: Prisma.XOR<Prisma.ExclusionUpdateManyMutationInput, Prisma.ExclusionUncheckedUpdateManyWithoutTenantInput>;
};
export type ExclusionCreateWithoutProposedByUserInput = {
    id?: string;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
    test: Prisma.TestCreateNestedOneWithoutExclusionsInput;
    approvedByUser?: Prisma.UserCreateNestedOneWithoutExclusionsApprovedInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutExclusionsInput;
};
export type ExclusionUncheckedCreateWithoutProposedByUserInput = {
    id?: string;
    tenantId: string;
    testId: string;
    approvedBy?: string | null;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
};
export type ExclusionCreateOrConnectWithoutProposedByUserInput = {
    where: Prisma.ExclusionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExclusionCreateWithoutProposedByUserInput, Prisma.ExclusionUncheckedCreateWithoutProposedByUserInput>;
};
export type ExclusionCreateManyProposedByUserInputEnvelope = {
    data: Prisma.ExclusionCreateManyProposedByUserInput | Prisma.ExclusionCreateManyProposedByUserInput[];
    skipDuplicates?: boolean;
};
export type ExclusionCreateWithoutApprovedByUserInput = {
    id?: string;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
    test: Prisma.TestCreateNestedOneWithoutExclusionsInput;
    proposedByUser: Prisma.UserCreateNestedOneWithoutExclusionsProposedInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutExclusionsInput;
};
export type ExclusionUncheckedCreateWithoutApprovedByUserInput = {
    id?: string;
    tenantId: string;
    testId: string;
    proposedBy: string;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
};
export type ExclusionCreateOrConnectWithoutApprovedByUserInput = {
    where: Prisma.ExclusionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExclusionCreateWithoutApprovedByUserInput, Prisma.ExclusionUncheckedCreateWithoutApprovedByUserInput>;
};
export type ExclusionCreateManyApprovedByUserInputEnvelope = {
    data: Prisma.ExclusionCreateManyApprovedByUserInput | Prisma.ExclusionCreateManyApprovedByUserInput[];
    skipDuplicates?: boolean;
};
export type ExclusionUpsertWithWhereUniqueWithoutProposedByUserInput = {
    where: Prisma.ExclusionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExclusionUpdateWithoutProposedByUserInput, Prisma.ExclusionUncheckedUpdateWithoutProposedByUserInput>;
    create: Prisma.XOR<Prisma.ExclusionCreateWithoutProposedByUserInput, Prisma.ExclusionUncheckedCreateWithoutProposedByUserInput>;
};
export type ExclusionUpdateWithWhereUniqueWithoutProposedByUserInput = {
    where: Prisma.ExclusionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExclusionUpdateWithoutProposedByUserInput, Prisma.ExclusionUncheckedUpdateWithoutProposedByUserInput>;
};
export type ExclusionUpdateManyWithWhereWithoutProposedByUserInput = {
    where: Prisma.ExclusionScalarWhereInput;
    data: Prisma.XOR<Prisma.ExclusionUpdateManyMutationInput, Prisma.ExclusionUncheckedUpdateManyWithoutProposedByUserInput>;
};
export type ExclusionUpsertWithWhereUniqueWithoutApprovedByUserInput = {
    where: Prisma.ExclusionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExclusionUpdateWithoutApprovedByUserInput, Prisma.ExclusionUncheckedUpdateWithoutApprovedByUserInput>;
    create: Prisma.XOR<Prisma.ExclusionCreateWithoutApprovedByUserInput, Prisma.ExclusionUncheckedCreateWithoutApprovedByUserInput>;
};
export type ExclusionUpdateWithWhereUniqueWithoutApprovedByUserInput = {
    where: Prisma.ExclusionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExclusionUpdateWithoutApprovedByUserInput, Prisma.ExclusionUncheckedUpdateWithoutApprovedByUserInput>;
};
export type ExclusionUpdateManyWithWhereWithoutApprovedByUserInput = {
    where: Prisma.ExclusionScalarWhereInput;
    data: Prisma.XOR<Prisma.ExclusionUpdateManyMutationInput, Prisma.ExclusionUncheckedUpdateManyWithoutApprovedByUserInput>;
};
export type ExclusionCreateManyTestInput = {
    id?: string;
    tenantId: string;
    proposedBy: string;
    approvedBy?: string | null;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
};
export type ExclusionUpdateWithoutTestInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    proposedByUser?: Prisma.UserUpdateOneRequiredWithoutExclusionsProposedNestedInput;
    approvedByUser?: Prisma.UserUpdateOneWithoutExclusionsApprovedNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutExclusionsNestedInput;
};
export type ExclusionUncheckedUpdateWithoutTestInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    proposedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExclusionUncheckedUpdateManyWithoutTestInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    proposedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExclusionCreateManyTenantInput = {
    id?: string;
    testId: string;
    proposedBy: string;
    approvedBy?: string | null;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
};
export type ExclusionUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    test?: Prisma.TestUpdateOneRequiredWithoutExclusionsNestedInput;
    proposedByUser?: Prisma.UserUpdateOneRequiredWithoutExclusionsProposedNestedInput;
    approvedByUser?: Prisma.UserUpdateOneWithoutExclusionsApprovedNestedInput;
};
export type ExclusionUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
    proposedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExclusionUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
    proposedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExclusionCreateManyProposedByUserInput = {
    id?: string;
    tenantId: string;
    testId: string;
    approvedBy?: string | null;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
};
export type ExclusionCreateManyApprovedByUserInput = {
    id?: string;
    tenantId: string;
    testId: string;
    proposedBy: string;
    excludedCheckId: string;
    justification: string;
    validUntil: Date | string;
};
export type ExclusionUpdateWithoutProposedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    test?: Prisma.TestUpdateOneRequiredWithoutExclusionsNestedInput;
    approvedByUser?: Prisma.UserUpdateOneWithoutExclusionsApprovedNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutExclusionsNestedInput;
};
export type ExclusionUncheckedUpdateWithoutProposedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExclusionUncheckedUpdateManyWithoutProposedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExclusionUpdateWithoutApprovedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    test?: Prisma.TestUpdateOneRequiredWithoutExclusionsNestedInput;
    proposedByUser?: Prisma.UserUpdateOneRequiredWithoutExclusionsProposedNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutExclusionsNestedInput;
};
export type ExclusionUncheckedUpdateWithoutApprovedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
    proposedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExclusionUncheckedUpdateManyWithoutApprovedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
    proposedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    excludedCheckId?: Prisma.StringFieldUpdateOperationsInput | string;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExclusionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    testId?: boolean;
    proposedBy?: boolean;
    approvedBy?: boolean;
    excludedCheckId?: boolean;
    justification?: boolean;
    validUntil?: boolean;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    proposedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    approvedByUser?: boolean | Prisma.Exclusion$approvedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["exclusion"]>;
export type ExclusionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    testId?: boolean;
    proposedBy?: boolean;
    approvedBy?: boolean;
    excludedCheckId?: boolean;
    justification?: boolean;
    validUntil?: boolean;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    proposedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    approvedByUser?: boolean | Prisma.Exclusion$approvedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["exclusion"]>;
export type ExclusionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    testId?: boolean;
    proposedBy?: boolean;
    approvedBy?: boolean;
    excludedCheckId?: boolean;
    justification?: boolean;
    validUntil?: boolean;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    proposedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    approvedByUser?: boolean | Prisma.Exclusion$approvedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["exclusion"]>;
export type ExclusionSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    testId?: boolean;
    proposedBy?: boolean;
    approvedBy?: boolean;
    excludedCheckId?: boolean;
    justification?: boolean;
    validUntil?: boolean;
};
export type ExclusionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "testId" | "proposedBy" | "approvedBy" | "excludedCheckId" | "justification" | "validUntil", ExtArgs["result"]["exclusion"]>;
export type ExclusionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    proposedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    approvedByUser?: boolean | Prisma.Exclusion$approvedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ExclusionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    proposedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    approvedByUser?: boolean | Prisma.Exclusion$approvedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ExclusionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    proposedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    approvedByUser?: boolean | Prisma.Exclusion$approvedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ExclusionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Exclusion";
    objects: {
        test: Prisma.$TestPayload<ExtArgs>;
        proposedByUser: Prisma.$UserPayload<ExtArgs>;
        approvedByUser: Prisma.$UserPayload<ExtArgs> | null;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        testId: string;
        proposedBy: string;
        approvedBy: string | null;
        excludedCheckId: string;
        justification: string;
        validUntil: Date;
    }, ExtArgs["result"]["exclusion"]>;
    composites: {};
};
export type ExclusionGetPayload<S extends boolean | null | undefined | ExclusionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ExclusionPayload, S>;
export type ExclusionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ExclusionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ExclusionCountAggregateInputType | true;
};
export interface ExclusionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Exclusion'];
        meta: {
            name: 'Exclusion';
        };
    };
    findUnique<T extends ExclusionFindUniqueArgs>(args: Prisma.SelectSubset<T, ExclusionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ExclusionClient<runtime.Types.Result.GetResult<Prisma.$ExclusionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ExclusionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ExclusionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ExclusionClient<runtime.Types.Result.GetResult<Prisma.$ExclusionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ExclusionFindFirstArgs>(args?: Prisma.SelectSubset<T, ExclusionFindFirstArgs<ExtArgs>>): Prisma.Prisma__ExclusionClient<runtime.Types.Result.GetResult<Prisma.$ExclusionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ExclusionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ExclusionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ExclusionClient<runtime.Types.Result.GetResult<Prisma.$ExclusionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ExclusionFindManyArgs>(args?: Prisma.SelectSubset<T, ExclusionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExclusionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ExclusionCreateArgs>(args: Prisma.SelectSubset<T, ExclusionCreateArgs<ExtArgs>>): Prisma.Prisma__ExclusionClient<runtime.Types.Result.GetResult<Prisma.$ExclusionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ExclusionCreateManyArgs>(args?: Prisma.SelectSubset<T, ExclusionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ExclusionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ExclusionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExclusionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ExclusionDeleteArgs>(args: Prisma.SelectSubset<T, ExclusionDeleteArgs<ExtArgs>>): Prisma.Prisma__ExclusionClient<runtime.Types.Result.GetResult<Prisma.$ExclusionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ExclusionUpdateArgs>(args: Prisma.SelectSubset<T, ExclusionUpdateArgs<ExtArgs>>): Prisma.Prisma__ExclusionClient<runtime.Types.Result.GetResult<Prisma.$ExclusionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ExclusionDeleteManyArgs>(args?: Prisma.SelectSubset<T, ExclusionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ExclusionUpdateManyArgs>(args: Prisma.SelectSubset<T, ExclusionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ExclusionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ExclusionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExclusionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ExclusionUpsertArgs>(args: Prisma.SelectSubset<T, ExclusionUpsertArgs<ExtArgs>>): Prisma.Prisma__ExclusionClient<runtime.Types.Result.GetResult<Prisma.$ExclusionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ExclusionCountArgs>(args?: Prisma.Subset<T, ExclusionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ExclusionCountAggregateOutputType> : number>;
    aggregate<T extends ExclusionAggregateArgs>(args: Prisma.Subset<T, ExclusionAggregateArgs>): Prisma.PrismaPromise<GetExclusionAggregateType<T>>;
    groupBy<T extends ExclusionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ExclusionGroupByArgs['orderBy'];
    } : {
        orderBy?: ExclusionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ExclusionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExclusionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ExclusionFieldRefs;
}
export interface Prisma__ExclusionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    test<T extends Prisma.TestDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TestDefaultArgs<ExtArgs>>): Prisma.Prisma__TestClient<runtime.Types.Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    proposedByUser<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    approvedByUser<T extends Prisma.Exclusion$approvedByUserArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Exclusion$approvedByUserArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ExclusionFieldRefs {
    readonly id: Prisma.FieldRef<"Exclusion", 'String'>;
    readonly tenantId: Prisma.FieldRef<"Exclusion", 'String'>;
    readonly testId: Prisma.FieldRef<"Exclusion", 'String'>;
    readonly proposedBy: Prisma.FieldRef<"Exclusion", 'String'>;
    readonly approvedBy: Prisma.FieldRef<"Exclusion", 'String'>;
    readonly excludedCheckId: Prisma.FieldRef<"Exclusion", 'String'>;
    readonly justification: Prisma.FieldRef<"Exclusion", 'String'>;
    readonly validUntil: Prisma.FieldRef<"Exclusion", 'DateTime'>;
}
export type ExclusionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExclusionSelect<ExtArgs> | null;
    omit?: Prisma.ExclusionOmit<ExtArgs> | null;
    include?: Prisma.ExclusionInclude<ExtArgs> | null;
    where: Prisma.ExclusionWhereUniqueInput;
};
export type ExclusionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExclusionSelect<ExtArgs> | null;
    omit?: Prisma.ExclusionOmit<ExtArgs> | null;
    include?: Prisma.ExclusionInclude<ExtArgs> | null;
    where: Prisma.ExclusionWhereUniqueInput;
};
export type ExclusionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExclusionSelect<ExtArgs> | null;
    omit?: Prisma.ExclusionOmit<ExtArgs> | null;
    include?: Prisma.ExclusionInclude<ExtArgs> | null;
    where?: Prisma.ExclusionWhereInput;
    orderBy?: Prisma.ExclusionOrderByWithRelationInput | Prisma.ExclusionOrderByWithRelationInput[];
    cursor?: Prisma.ExclusionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExclusionScalarFieldEnum | Prisma.ExclusionScalarFieldEnum[];
};
export type ExclusionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExclusionSelect<ExtArgs> | null;
    omit?: Prisma.ExclusionOmit<ExtArgs> | null;
    include?: Prisma.ExclusionInclude<ExtArgs> | null;
    where?: Prisma.ExclusionWhereInput;
    orderBy?: Prisma.ExclusionOrderByWithRelationInput | Prisma.ExclusionOrderByWithRelationInput[];
    cursor?: Prisma.ExclusionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExclusionScalarFieldEnum | Prisma.ExclusionScalarFieldEnum[];
};
export type ExclusionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExclusionSelect<ExtArgs> | null;
    omit?: Prisma.ExclusionOmit<ExtArgs> | null;
    include?: Prisma.ExclusionInclude<ExtArgs> | null;
    where?: Prisma.ExclusionWhereInput;
    orderBy?: Prisma.ExclusionOrderByWithRelationInput | Prisma.ExclusionOrderByWithRelationInput[];
    cursor?: Prisma.ExclusionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExclusionScalarFieldEnum | Prisma.ExclusionScalarFieldEnum[];
};
export type ExclusionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExclusionSelect<ExtArgs> | null;
    omit?: Prisma.ExclusionOmit<ExtArgs> | null;
    include?: Prisma.ExclusionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExclusionCreateInput, Prisma.ExclusionUncheckedCreateInput>;
};
export type ExclusionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ExclusionCreateManyInput | Prisma.ExclusionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ExclusionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExclusionSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ExclusionOmit<ExtArgs> | null;
    data: Prisma.ExclusionCreateManyInput | Prisma.ExclusionCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ExclusionIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ExclusionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExclusionSelect<ExtArgs> | null;
    omit?: Prisma.ExclusionOmit<ExtArgs> | null;
    include?: Prisma.ExclusionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExclusionUpdateInput, Prisma.ExclusionUncheckedUpdateInput>;
    where: Prisma.ExclusionWhereUniqueInput;
};
export type ExclusionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ExclusionUpdateManyMutationInput, Prisma.ExclusionUncheckedUpdateManyInput>;
    where?: Prisma.ExclusionWhereInput;
    limit?: number;
};
export type ExclusionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExclusionSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ExclusionOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExclusionUpdateManyMutationInput, Prisma.ExclusionUncheckedUpdateManyInput>;
    where?: Prisma.ExclusionWhereInput;
    limit?: number;
    include?: Prisma.ExclusionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ExclusionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExclusionSelect<ExtArgs> | null;
    omit?: Prisma.ExclusionOmit<ExtArgs> | null;
    include?: Prisma.ExclusionInclude<ExtArgs> | null;
    where: Prisma.ExclusionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExclusionCreateInput, Prisma.ExclusionUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ExclusionUpdateInput, Prisma.ExclusionUncheckedUpdateInput>;
};
export type ExclusionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExclusionSelect<ExtArgs> | null;
    omit?: Prisma.ExclusionOmit<ExtArgs> | null;
    include?: Prisma.ExclusionInclude<ExtArgs> | null;
    where: Prisma.ExclusionWhereUniqueInput;
};
export type ExclusionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExclusionWhereInput;
    limit?: number;
};
export type Exclusion$approvedByUserArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
export type ExclusionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExclusionSelect<ExtArgs> | null;
    omit?: Prisma.ExclusionOmit<ExtArgs> | null;
    include?: Prisma.ExclusionInclude<ExtArgs> | null;
};
export {};
