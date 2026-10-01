import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type EvidenceRequirementModel = runtime.Types.Result.DefaultSelection<Prisma.$EvidenceRequirementPayload>;
export type AggregateEvidenceRequirement = {
    _count: EvidenceRequirementCountAggregateOutputType | null;
    _avg: EvidenceRequirementAvgAggregateOutputType | null;
    _sum: EvidenceRequirementSumAggregateOutputType | null;
    _min: EvidenceRequirementMinAggregateOutputType | null;
    _max: EvidenceRequirementMaxAggregateOutputType | null;
};
export type EvidenceRequirementAvgAggregateOutputType = {
    sequence: number | null;
};
export type EvidenceRequirementSumAggregateOutputType = {
    sequence: number | null;
};
export type EvidenceRequirementMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientControlId: string | null;
    responsibleId: string | null;
    code: string | null;
    sequence: number | null;
    description: string | null;
    dimension: $Enums.Dimension | null;
    validityWithinPeriod: string | null;
    sourceRef: string | null;
};
export type EvidenceRequirementMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientControlId: string | null;
    responsibleId: string | null;
    code: string | null;
    sequence: number | null;
    description: string | null;
    dimension: $Enums.Dimension | null;
    validityWithinPeriod: string | null;
    sourceRef: string | null;
};
export type EvidenceRequirementCountAggregateOutputType = {
    id: number;
    tenantId: number;
    clientControlId: number;
    responsibleId: number;
    code: number;
    sequence: number;
    description: number;
    dimension: number;
    validityWithinPeriod: number;
    sourceRef: number;
    _all: number;
};
export type EvidenceRequirementAvgAggregateInputType = {
    sequence?: true;
};
export type EvidenceRequirementSumAggregateInputType = {
    sequence?: true;
};
export type EvidenceRequirementMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientControlId?: true;
    responsibleId?: true;
    code?: true;
    sequence?: true;
    description?: true;
    dimension?: true;
    validityWithinPeriod?: true;
    sourceRef?: true;
};
export type EvidenceRequirementMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientControlId?: true;
    responsibleId?: true;
    code?: true;
    sequence?: true;
    description?: true;
    dimension?: true;
    validityWithinPeriod?: true;
    sourceRef?: true;
};
export type EvidenceRequirementCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientControlId?: true;
    responsibleId?: true;
    code?: true;
    sequence?: true;
    description?: true;
    dimension?: true;
    validityWithinPeriod?: true;
    sourceRef?: true;
    _all?: true;
};
export type EvidenceRequirementAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvidenceRequirementWhereInput;
    orderBy?: Prisma.EvidenceRequirementOrderByWithRelationInput | Prisma.EvidenceRequirementOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceRequirementWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | EvidenceRequirementCountAggregateInputType;
    _avg?: EvidenceRequirementAvgAggregateInputType;
    _sum?: EvidenceRequirementSumAggregateInputType;
    _min?: EvidenceRequirementMinAggregateInputType;
    _max?: EvidenceRequirementMaxAggregateInputType;
};
export type GetEvidenceRequirementAggregateType<T extends EvidenceRequirementAggregateArgs> = {
    [P in keyof T & keyof AggregateEvidenceRequirement]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateEvidenceRequirement[P]> : Prisma.GetScalarType<T[P], AggregateEvidenceRequirement[P]>;
};
export type EvidenceRequirementGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvidenceRequirementWhereInput;
    orderBy?: Prisma.EvidenceRequirementOrderByWithAggregationInput | Prisma.EvidenceRequirementOrderByWithAggregationInput[];
    by: Prisma.EvidenceRequirementScalarFieldEnum[] | Prisma.EvidenceRequirementScalarFieldEnum;
    having?: Prisma.EvidenceRequirementScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: EvidenceRequirementCountAggregateInputType | true;
    _avg?: EvidenceRequirementAvgAggregateInputType;
    _sum?: EvidenceRequirementSumAggregateInputType;
    _min?: EvidenceRequirementMinAggregateInputType;
    _max?: EvidenceRequirementMaxAggregateInputType;
};
export type EvidenceRequirementGroupByOutputType = {
    id: string;
    tenantId: string;
    clientControlId: string;
    responsibleId: string | null;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef: string | null;
    _count: EvidenceRequirementCountAggregateOutputType | null;
    _avg: EvidenceRequirementAvgAggregateOutputType | null;
    _sum: EvidenceRequirementSumAggregateOutputType | null;
    _min: EvidenceRequirementMinAggregateOutputType | null;
    _max: EvidenceRequirementMaxAggregateOutputType | null;
};
type GetEvidenceRequirementGroupByPayload<T extends EvidenceRequirementGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<EvidenceRequirementGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof EvidenceRequirementGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], EvidenceRequirementGroupByOutputType[P]> : Prisma.GetScalarType<T[P], EvidenceRequirementGroupByOutputType[P]>;
}>>;
export type EvidenceRequirementWhereInput = {
    AND?: Prisma.EvidenceRequirementWhereInput | Prisma.EvidenceRequirementWhereInput[];
    OR?: Prisma.EvidenceRequirementWhereInput[];
    NOT?: Prisma.EvidenceRequirementWhereInput | Prisma.EvidenceRequirementWhereInput[];
    id?: Prisma.UuidFilter<"EvidenceRequirement"> | string;
    tenantId?: Prisma.UuidFilter<"EvidenceRequirement"> | string;
    clientControlId?: Prisma.UuidFilter<"EvidenceRequirement"> | string;
    responsibleId?: Prisma.UuidNullableFilter<"EvidenceRequirement"> | string | null;
    code?: Prisma.StringFilter<"EvidenceRequirement"> | string;
    sequence?: Prisma.IntFilter<"EvidenceRequirement"> | number;
    description?: Prisma.StringFilter<"EvidenceRequirement"> | string;
    dimension?: Prisma.EnumDimensionFilter<"EvidenceRequirement"> | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFilter<"EvidenceRequirement"> | string;
    sourceRef?: Prisma.StringNullableFilter<"EvidenceRequirement"> | string | null;
    clientControl?: Prisma.XOR<Prisma.ClientControlScalarRelationFilter, Prisma.ClientControlWhereInput>;
    responsible?: Prisma.XOR<Prisma.OrganizationResponsibleNullableScalarRelationFilter, Prisma.OrganizationResponsibleWhereInput> | null;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    submissions?: Prisma.EvidenceSubmissionListRelationFilter;
};
export type EvidenceRequirementOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    code?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    validityWithinPeriod?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrderInput | Prisma.SortOrder;
    clientControl?: Prisma.ClientControlOrderByWithRelationInput;
    responsible?: Prisma.OrganizationResponsibleOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
    submissions?: Prisma.EvidenceSubmissionOrderByRelationAggregateInput;
};
export type EvidenceRequirementWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    clientControlId_code?: Prisma.EvidenceRequirementClientControlIdCodeCompoundUniqueInput;
    AND?: Prisma.EvidenceRequirementWhereInput | Prisma.EvidenceRequirementWhereInput[];
    OR?: Prisma.EvidenceRequirementWhereInput[];
    NOT?: Prisma.EvidenceRequirementWhereInput | Prisma.EvidenceRequirementWhereInput[];
    tenantId?: Prisma.UuidFilter<"EvidenceRequirement"> | string;
    clientControlId?: Prisma.UuidFilter<"EvidenceRequirement"> | string;
    responsibleId?: Prisma.UuidNullableFilter<"EvidenceRequirement"> | string | null;
    code?: Prisma.StringFilter<"EvidenceRequirement"> | string;
    sequence?: Prisma.IntFilter<"EvidenceRequirement"> | number;
    description?: Prisma.StringFilter<"EvidenceRequirement"> | string;
    dimension?: Prisma.EnumDimensionFilter<"EvidenceRequirement"> | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFilter<"EvidenceRequirement"> | string;
    sourceRef?: Prisma.StringNullableFilter<"EvidenceRequirement"> | string | null;
    clientControl?: Prisma.XOR<Prisma.ClientControlScalarRelationFilter, Prisma.ClientControlWhereInput>;
    responsible?: Prisma.XOR<Prisma.OrganizationResponsibleNullableScalarRelationFilter, Prisma.OrganizationResponsibleWhereInput> | null;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    submissions?: Prisma.EvidenceSubmissionListRelationFilter;
}, "id" | "clientControlId_code">;
export type EvidenceRequirementOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    code?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    validityWithinPeriod?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.EvidenceRequirementCountOrderByAggregateInput;
    _avg?: Prisma.EvidenceRequirementAvgOrderByAggregateInput;
    _max?: Prisma.EvidenceRequirementMaxOrderByAggregateInput;
    _min?: Prisma.EvidenceRequirementMinOrderByAggregateInput;
    _sum?: Prisma.EvidenceRequirementSumOrderByAggregateInput;
};
export type EvidenceRequirementScalarWhereWithAggregatesInput = {
    AND?: Prisma.EvidenceRequirementScalarWhereWithAggregatesInput | Prisma.EvidenceRequirementScalarWhereWithAggregatesInput[];
    OR?: Prisma.EvidenceRequirementScalarWhereWithAggregatesInput[];
    NOT?: Prisma.EvidenceRequirementScalarWhereWithAggregatesInput | Prisma.EvidenceRequirementScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"EvidenceRequirement"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"EvidenceRequirement"> | string;
    clientControlId?: Prisma.UuidWithAggregatesFilter<"EvidenceRequirement"> | string;
    responsibleId?: Prisma.UuidNullableWithAggregatesFilter<"EvidenceRequirement"> | string | null;
    code?: Prisma.StringWithAggregatesFilter<"EvidenceRequirement"> | string;
    sequence?: Prisma.IntWithAggregatesFilter<"EvidenceRequirement"> | number;
    description?: Prisma.StringWithAggregatesFilter<"EvidenceRequirement"> | string;
    dimension?: Prisma.EnumDimensionWithAggregatesFilter<"EvidenceRequirement"> | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringWithAggregatesFilter<"EvidenceRequirement"> | string;
    sourceRef?: Prisma.StringNullableWithAggregatesFilter<"EvidenceRequirement"> | string | null;
};
export type EvidenceRequirementCreateInput = {
    id?: string;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef?: string | null;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutEvidenceRequirementsInput;
    responsible?: Prisma.OrganizationResponsibleCreateNestedOneWithoutEvidenceRequirementsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutEvidenceRequirementsInput;
    submissions?: Prisma.EvidenceSubmissionCreateNestedManyWithoutEvidenceRequirementInput;
};
export type EvidenceRequirementUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
    responsibleId?: string | null;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef?: string | null;
    submissions?: Prisma.EvidenceSubmissionUncheckedCreateNestedManyWithoutEvidenceRequirementInput;
};
export type EvidenceRequirementUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutEvidenceRequirementsNestedInput;
    responsible?: Prisma.OrganizationResponsibleUpdateOneWithoutEvidenceRequirementsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutEvidenceRequirementsNestedInput;
    submissions?: Prisma.EvidenceSubmissionUpdateManyWithoutEvidenceRequirementNestedInput;
};
export type EvidenceRequirementUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    submissions?: Prisma.EvidenceSubmissionUncheckedUpdateManyWithoutEvidenceRequirementNestedInput;
};
export type EvidenceRequirementCreateManyInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
    responsibleId?: string | null;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef?: string | null;
};
export type EvidenceRequirementUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceRequirementUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceRequirementListRelationFilter = {
    every?: Prisma.EvidenceRequirementWhereInput;
    some?: Prisma.EvidenceRequirementWhereInput;
    none?: Prisma.EvidenceRequirementWhereInput;
};
export type EvidenceRequirementOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type EvidenceRequirementClientControlIdCodeCompoundUniqueInput = {
    clientControlId: string;
    code: string;
};
export type EvidenceRequirementCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    validityWithinPeriod?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrder;
};
export type EvidenceRequirementAvgOrderByAggregateInput = {
    sequence?: Prisma.SortOrder;
};
export type EvidenceRequirementMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    validityWithinPeriod?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrder;
};
export type EvidenceRequirementMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    validityWithinPeriod?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrder;
};
export type EvidenceRequirementSumOrderByAggregateInput = {
    sequence?: Prisma.SortOrder;
};
export type EvidenceRequirementScalarRelationFilter = {
    is?: Prisma.EvidenceRequirementWhereInput;
    isNot?: Prisma.EvidenceRequirementWhereInput;
};
export type EvidenceRequirementCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutTenantInput, Prisma.EvidenceRequirementUncheckedCreateWithoutTenantInput> | Prisma.EvidenceRequirementCreateWithoutTenantInput[] | Prisma.EvidenceRequirementUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.EvidenceRequirementCreateOrConnectWithoutTenantInput | Prisma.EvidenceRequirementCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.EvidenceRequirementCreateManyTenantInputEnvelope;
    connect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
};
export type EvidenceRequirementUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutTenantInput, Prisma.EvidenceRequirementUncheckedCreateWithoutTenantInput> | Prisma.EvidenceRequirementCreateWithoutTenantInput[] | Prisma.EvidenceRequirementUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.EvidenceRequirementCreateOrConnectWithoutTenantInput | Prisma.EvidenceRequirementCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.EvidenceRequirementCreateManyTenantInputEnvelope;
    connect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
};
export type EvidenceRequirementUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutTenantInput, Prisma.EvidenceRequirementUncheckedCreateWithoutTenantInput> | Prisma.EvidenceRequirementCreateWithoutTenantInput[] | Prisma.EvidenceRequirementUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.EvidenceRequirementCreateOrConnectWithoutTenantInput | Prisma.EvidenceRequirementCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.EvidenceRequirementUpsertWithWhereUniqueWithoutTenantInput | Prisma.EvidenceRequirementUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.EvidenceRequirementCreateManyTenantInputEnvelope;
    set?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    disconnect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    delete?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    connect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    update?: Prisma.EvidenceRequirementUpdateWithWhereUniqueWithoutTenantInput | Prisma.EvidenceRequirementUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.EvidenceRequirementUpdateManyWithWhereWithoutTenantInput | Prisma.EvidenceRequirementUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.EvidenceRequirementScalarWhereInput | Prisma.EvidenceRequirementScalarWhereInput[];
};
export type EvidenceRequirementUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutTenantInput, Prisma.EvidenceRequirementUncheckedCreateWithoutTenantInput> | Prisma.EvidenceRequirementCreateWithoutTenantInput[] | Prisma.EvidenceRequirementUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.EvidenceRequirementCreateOrConnectWithoutTenantInput | Prisma.EvidenceRequirementCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.EvidenceRequirementUpsertWithWhereUniqueWithoutTenantInput | Prisma.EvidenceRequirementUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.EvidenceRequirementCreateManyTenantInputEnvelope;
    set?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    disconnect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    delete?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    connect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    update?: Prisma.EvidenceRequirementUpdateWithWhereUniqueWithoutTenantInput | Prisma.EvidenceRequirementUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.EvidenceRequirementUpdateManyWithWhereWithoutTenantInput | Prisma.EvidenceRequirementUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.EvidenceRequirementScalarWhereInput | Prisma.EvidenceRequirementScalarWhereInput[];
};
export type EvidenceRequirementCreateNestedManyWithoutClientControlInput = {
    create?: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutClientControlInput, Prisma.EvidenceRequirementUncheckedCreateWithoutClientControlInput> | Prisma.EvidenceRequirementCreateWithoutClientControlInput[] | Prisma.EvidenceRequirementUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.EvidenceRequirementCreateOrConnectWithoutClientControlInput | Prisma.EvidenceRequirementCreateOrConnectWithoutClientControlInput[];
    createMany?: Prisma.EvidenceRequirementCreateManyClientControlInputEnvelope;
    connect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
};
export type EvidenceRequirementUncheckedCreateNestedManyWithoutClientControlInput = {
    create?: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutClientControlInput, Prisma.EvidenceRequirementUncheckedCreateWithoutClientControlInput> | Prisma.EvidenceRequirementCreateWithoutClientControlInput[] | Prisma.EvidenceRequirementUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.EvidenceRequirementCreateOrConnectWithoutClientControlInput | Prisma.EvidenceRequirementCreateOrConnectWithoutClientControlInput[];
    createMany?: Prisma.EvidenceRequirementCreateManyClientControlInputEnvelope;
    connect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
};
export type EvidenceRequirementUpdateManyWithoutClientControlNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutClientControlInput, Prisma.EvidenceRequirementUncheckedCreateWithoutClientControlInput> | Prisma.EvidenceRequirementCreateWithoutClientControlInput[] | Prisma.EvidenceRequirementUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.EvidenceRequirementCreateOrConnectWithoutClientControlInput | Prisma.EvidenceRequirementCreateOrConnectWithoutClientControlInput[];
    upsert?: Prisma.EvidenceRequirementUpsertWithWhereUniqueWithoutClientControlInput | Prisma.EvidenceRequirementUpsertWithWhereUniqueWithoutClientControlInput[];
    createMany?: Prisma.EvidenceRequirementCreateManyClientControlInputEnvelope;
    set?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    disconnect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    delete?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    connect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    update?: Prisma.EvidenceRequirementUpdateWithWhereUniqueWithoutClientControlInput | Prisma.EvidenceRequirementUpdateWithWhereUniqueWithoutClientControlInput[];
    updateMany?: Prisma.EvidenceRequirementUpdateManyWithWhereWithoutClientControlInput | Prisma.EvidenceRequirementUpdateManyWithWhereWithoutClientControlInput[];
    deleteMany?: Prisma.EvidenceRequirementScalarWhereInput | Prisma.EvidenceRequirementScalarWhereInput[];
};
export type EvidenceRequirementUncheckedUpdateManyWithoutClientControlNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutClientControlInput, Prisma.EvidenceRequirementUncheckedCreateWithoutClientControlInput> | Prisma.EvidenceRequirementCreateWithoutClientControlInput[] | Prisma.EvidenceRequirementUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.EvidenceRequirementCreateOrConnectWithoutClientControlInput | Prisma.EvidenceRequirementCreateOrConnectWithoutClientControlInput[];
    upsert?: Prisma.EvidenceRequirementUpsertWithWhereUniqueWithoutClientControlInput | Prisma.EvidenceRequirementUpsertWithWhereUniqueWithoutClientControlInput[];
    createMany?: Prisma.EvidenceRequirementCreateManyClientControlInputEnvelope;
    set?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    disconnect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    delete?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    connect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    update?: Prisma.EvidenceRequirementUpdateWithWhereUniqueWithoutClientControlInput | Prisma.EvidenceRequirementUpdateWithWhereUniqueWithoutClientControlInput[];
    updateMany?: Prisma.EvidenceRequirementUpdateManyWithWhereWithoutClientControlInput | Prisma.EvidenceRequirementUpdateManyWithWhereWithoutClientControlInput[];
    deleteMany?: Prisma.EvidenceRequirementScalarWhereInput | Prisma.EvidenceRequirementScalarWhereInput[];
};
export type EvidenceRequirementCreateNestedOneWithoutSubmissionsInput = {
    create?: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutSubmissionsInput, Prisma.EvidenceRequirementUncheckedCreateWithoutSubmissionsInput>;
    connectOrCreate?: Prisma.EvidenceRequirementCreateOrConnectWithoutSubmissionsInput;
    connect?: Prisma.EvidenceRequirementWhereUniqueInput;
};
export type EvidenceRequirementUpdateOneRequiredWithoutSubmissionsNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutSubmissionsInput, Prisma.EvidenceRequirementUncheckedCreateWithoutSubmissionsInput>;
    connectOrCreate?: Prisma.EvidenceRequirementCreateOrConnectWithoutSubmissionsInput;
    upsert?: Prisma.EvidenceRequirementUpsertWithoutSubmissionsInput;
    connect?: Prisma.EvidenceRequirementWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EvidenceRequirementUpdateToOneWithWhereWithoutSubmissionsInput, Prisma.EvidenceRequirementUpdateWithoutSubmissionsInput>, Prisma.EvidenceRequirementUncheckedUpdateWithoutSubmissionsInput>;
};
export type EvidenceRequirementCreateNestedManyWithoutResponsibleInput = {
    create?: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutResponsibleInput, Prisma.EvidenceRequirementUncheckedCreateWithoutResponsibleInput> | Prisma.EvidenceRequirementCreateWithoutResponsibleInput[] | Prisma.EvidenceRequirementUncheckedCreateWithoutResponsibleInput[];
    connectOrCreate?: Prisma.EvidenceRequirementCreateOrConnectWithoutResponsibleInput | Prisma.EvidenceRequirementCreateOrConnectWithoutResponsibleInput[];
    createMany?: Prisma.EvidenceRequirementCreateManyResponsibleInputEnvelope;
    connect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
};
export type EvidenceRequirementUncheckedCreateNestedManyWithoutResponsibleInput = {
    create?: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutResponsibleInput, Prisma.EvidenceRequirementUncheckedCreateWithoutResponsibleInput> | Prisma.EvidenceRequirementCreateWithoutResponsibleInput[] | Prisma.EvidenceRequirementUncheckedCreateWithoutResponsibleInput[];
    connectOrCreate?: Prisma.EvidenceRequirementCreateOrConnectWithoutResponsibleInput | Prisma.EvidenceRequirementCreateOrConnectWithoutResponsibleInput[];
    createMany?: Prisma.EvidenceRequirementCreateManyResponsibleInputEnvelope;
    connect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
};
export type EvidenceRequirementUpdateManyWithoutResponsibleNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutResponsibleInput, Prisma.EvidenceRequirementUncheckedCreateWithoutResponsibleInput> | Prisma.EvidenceRequirementCreateWithoutResponsibleInput[] | Prisma.EvidenceRequirementUncheckedCreateWithoutResponsibleInput[];
    connectOrCreate?: Prisma.EvidenceRequirementCreateOrConnectWithoutResponsibleInput | Prisma.EvidenceRequirementCreateOrConnectWithoutResponsibleInput[];
    upsert?: Prisma.EvidenceRequirementUpsertWithWhereUniqueWithoutResponsibleInput | Prisma.EvidenceRequirementUpsertWithWhereUniqueWithoutResponsibleInput[];
    createMany?: Prisma.EvidenceRequirementCreateManyResponsibleInputEnvelope;
    set?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    disconnect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    delete?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    connect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    update?: Prisma.EvidenceRequirementUpdateWithWhereUniqueWithoutResponsibleInput | Prisma.EvidenceRequirementUpdateWithWhereUniqueWithoutResponsibleInput[];
    updateMany?: Prisma.EvidenceRequirementUpdateManyWithWhereWithoutResponsibleInput | Prisma.EvidenceRequirementUpdateManyWithWhereWithoutResponsibleInput[];
    deleteMany?: Prisma.EvidenceRequirementScalarWhereInput | Prisma.EvidenceRequirementScalarWhereInput[];
};
export type EvidenceRequirementUncheckedUpdateManyWithoutResponsibleNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutResponsibleInput, Prisma.EvidenceRequirementUncheckedCreateWithoutResponsibleInput> | Prisma.EvidenceRequirementCreateWithoutResponsibleInput[] | Prisma.EvidenceRequirementUncheckedCreateWithoutResponsibleInput[];
    connectOrCreate?: Prisma.EvidenceRequirementCreateOrConnectWithoutResponsibleInput | Prisma.EvidenceRequirementCreateOrConnectWithoutResponsibleInput[];
    upsert?: Prisma.EvidenceRequirementUpsertWithWhereUniqueWithoutResponsibleInput | Prisma.EvidenceRequirementUpsertWithWhereUniqueWithoutResponsibleInput[];
    createMany?: Prisma.EvidenceRequirementCreateManyResponsibleInputEnvelope;
    set?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    disconnect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    delete?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    connect?: Prisma.EvidenceRequirementWhereUniqueInput | Prisma.EvidenceRequirementWhereUniqueInput[];
    update?: Prisma.EvidenceRequirementUpdateWithWhereUniqueWithoutResponsibleInput | Prisma.EvidenceRequirementUpdateWithWhereUniqueWithoutResponsibleInput[];
    updateMany?: Prisma.EvidenceRequirementUpdateManyWithWhereWithoutResponsibleInput | Prisma.EvidenceRequirementUpdateManyWithWhereWithoutResponsibleInput[];
    deleteMany?: Prisma.EvidenceRequirementScalarWhereInput | Prisma.EvidenceRequirementScalarWhereInput[];
};
export type EvidenceRequirementCreateWithoutTenantInput = {
    id?: string;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef?: string | null;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutEvidenceRequirementsInput;
    responsible?: Prisma.OrganizationResponsibleCreateNestedOneWithoutEvidenceRequirementsInput;
    submissions?: Prisma.EvidenceSubmissionCreateNestedManyWithoutEvidenceRequirementInput;
};
export type EvidenceRequirementUncheckedCreateWithoutTenantInput = {
    id?: string;
    clientControlId: string;
    responsibleId?: string | null;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef?: string | null;
    submissions?: Prisma.EvidenceSubmissionUncheckedCreateNestedManyWithoutEvidenceRequirementInput;
};
export type EvidenceRequirementCreateOrConnectWithoutTenantInput = {
    where: Prisma.EvidenceRequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutTenantInput, Prisma.EvidenceRequirementUncheckedCreateWithoutTenantInput>;
};
export type EvidenceRequirementCreateManyTenantInputEnvelope = {
    data: Prisma.EvidenceRequirementCreateManyTenantInput | Prisma.EvidenceRequirementCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type EvidenceRequirementUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.EvidenceRequirementWhereUniqueInput;
    update: Prisma.XOR<Prisma.EvidenceRequirementUpdateWithoutTenantInput, Prisma.EvidenceRequirementUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutTenantInput, Prisma.EvidenceRequirementUncheckedCreateWithoutTenantInput>;
};
export type EvidenceRequirementUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.EvidenceRequirementWhereUniqueInput;
    data: Prisma.XOR<Prisma.EvidenceRequirementUpdateWithoutTenantInput, Prisma.EvidenceRequirementUncheckedUpdateWithoutTenantInput>;
};
export type EvidenceRequirementUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.EvidenceRequirementScalarWhereInput;
    data: Prisma.XOR<Prisma.EvidenceRequirementUpdateManyMutationInput, Prisma.EvidenceRequirementUncheckedUpdateManyWithoutTenantInput>;
};
export type EvidenceRequirementScalarWhereInput = {
    AND?: Prisma.EvidenceRequirementScalarWhereInput | Prisma.EvidenceRequirementScalarWhereInput[];
    OR?: Prisma.EvidenceRequirementScalarWhereInput[];
    NOT?: Prisma.EvidenceRequirementScalarWhereInput | Prisma.EvidenceRequirementScalarWhereInput[];
    id?: Prisma.UuidFilter<"EvidenceRequirement"> | string;
    tenantId?: Prisma.UuidFilter<"EvidenceRequirement"> | string;
    clientControlId?: Prisma.UuidFilter<"EvidenceRequirement"> | string;
    responsibleId?: Prisma.UuidNullableFilter<"EvidenceRequirement"> | string | null;
    code?: Prisma.StringFilter<"EvidenceRequirement"> | string;
    sequence?: Prisma.IntFilter<"EvidenceRequirement"> | number;
    description?: Prisma.StringFilter<"EvidenceRequirement"> | string;
    dimension?: Prisma.EnumDimensionFilter<"EvidenceRequirement"> | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFilter<"EvidenceRequirement"> | string;
    sourceRef?: Prisma.StringNullableFilter<"EvidenceRequirement"> | string | null;
};
export type EvidenceRequirementCreateWithoutClientControlInput = {
    id?: string;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef?: string | null;
    responsible?: Prisma.OrganizationResponsibleCreateNestedOneWithoutEvidenceRequirementsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutEvidenceRequirementsInput;
    submissions?: Prisma.EvidenceSubmissionCreateNestedManyWithoutEvidenceRequirementInput;
};
export type EvidenceRequirementUncheckedCreateWithoutClientControlInput = {
    id?: string;
    tenantId: string;
    responsibleId?: string | null;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef?: string | null;
    submissions?: Prisma.EvidenceSubmissionUncheckedCreateNestedManyWithoutEvidenceRequirementInput;
};
export type EvidenceRequirementCreateOrConnectWithoutClientControlInput = {
    where: Prisma.EvidenceRequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutClientControlInput, Prisma.EvidenceRequirementUncheckedCreateWithoutClientControlInput>;
};
export type EvidenceRequirementCreateManyClientControlInputEnvelope = {
    data: Prisma.EvidenceRequirementCreateManyClientControlInput | Prisma.EvidenceRequirementCreateManyClientControlInput[];
    skipDuplicates?: boolean;
};
export type EvidenceRequirementUpsertWithWhereUniqueWithoutClientControlInput = {
    where: Prisma.EvidenceRequirementWhereUniqueInput;
    update: Prisma.XOR<Prisma.EvidenceRequirementUpdateWithoutClientControlInput, Prisma.EvidenceRequirementUncheckedUpdateWithoutClientControlInput>;
    create: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutClientControlInput, Prisma.EvidenceRequirementUncheckedCreateWithoutClientControlInput>;
};
export type EvidenceRequirementUpdateWithWhereUniqueWithoutClientControlInput = {
    where: Prisma.EvidenceRequirementWhereUniqueInput;
    data: Prisma.XOR<Prisma.EvidenceRequirementUpdateWithoutClientControlInput, Prisma.EvidenceRequirementUncheckedUpdateWithoutClientControlInput>;
};
export type EvidenceRequirementUpdateManyWithWhereWithoutClientControlInput = {
    where: Prisma.EvidenceRequirementScalarWhereInput;
    data: Prisma.XOR<Prisma.EvidenceRequirementUpdateManyMutationInput, Prisma.EvidenceRequirementUncheckedUpdateManyWithoutClientControlInput>;
};
export type EvidenceRequirementCreateWithoutSubmissionsInput = {
    id?: string;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef?: string | null;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutEvidenceRequirementsInput;
    responsible?: Prisma.OrganizationResponsibleCreateNestedOneWithoutEvidenceRequirementsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutEvidenceRequirementsInput;
};
export type EvidenceRequirementUncheckedCreateWithoutSubmissionsInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
    responsibleId?: string | null;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef?: string | null;
};
export type EvidenceRequirementCreateOrConnectWithoutSubmissionsInput = {
    where: Prisma.EvidenceRequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutSubmissionsInput, Prisma.EvidenceRequirementUncheckedCreateWithoutSubmissionsInput>;
};
export type EvidenceRequirementUpsertWithoutSubmissionsInput = {
    update: Prisma.XOR<Prisma.EvidenceRequirementUpdateWithoutSubmissionsInput, Prisma.EvidenceRequirementUncheckedUpdateWithoutSubmissionsInput>;
    create: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutSubmissionsInput, Prisma.EvidenceRequirementUncheckedCreateWithoutSubmissionsInput>;
    where?: Prisma.EvidenceRequirementWhereInput;
};
export type EvidenceRequirementUpdateToOneWithWhereWithoutSubmissionsInput = {
    where?: Prisma.EvidenceRequirementWhereInput;
    data: Prisma.XOR<Prisma.EvidenceRequirementUpdateWithoutSubmissionsInput, Prisma.EvidenceRequirementUncheckedUpdateWithoutSubmissionsInput>;
};
export type EvidenceRequirementUpdateWithoutSubmissionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutEvidenceRequirementsNestedInput;
    responsible?: Prisma.OrganizationResponsibleUpdateOneWithoutEvidenceRequirementsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutEvidenceRequirementsNestedInput;
};
export type EvidenceRequirementUncheckedUpdateWithoutSubmissionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceRequirementCreateWithoutResponsibleInput = {
    id?: string;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef?: string | null;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutEvidenceRequirementsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutEvidenceRequirementsInput;
    submissions?: Prisma.EvidenceSubmissionCreateNestedManyWithoutEvidenceRequirementInput;
};
export type EvidenceRequirementUncheckedCreateWithoutResponsibleInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef?: string | null;
    submissions?: Prisma.EvidenceSubmissionUncheckedCreateNestedManyWithoutEvidenceRequirementInput;
};
export type EvidenceRequirementCreateOrConnectWithoutResponsibleInput = {
    where: Prisma.EvidenceRequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutResponsibleInput, Prisma.EvidenceRequirementUncheckedCreateWithoutResponsibleInput>;
};
export type EvidenceRequirementCreateManyResponsibleInputEnvelope = {
    data: Prisma.EvidenceRequirementCreateManyResponsibleInput | Prisma.EvidenceRequirementCreateManyResponsibleInput[];
    skipDuplicates?: boolean;
};
export type EvidenceRequirementUpsertWithWhereUniqueWithoutResponsibleInput = {
    where: Prisma.EvidenceRequirementWhereUniqueInput;
    update: Prisma.XOR<Prisma.EvidenceRequirementUpdateWithoutResponsibleInput, Prisma.EvidenceRequirementUncheckedUpdateWithoutResponsibleInput>;
    create: Prisma.XOR<Prisma.EvidenceRequirementCreateWithoutResponsibleInput, Prisma.EvidenceRequirementUncheckedCreateWithoutResponsibleInput>;
};
export type EvidenceRequirementUpdateWithWhereUniqueWithoutResponsibleInput = {
    where: Prisma.EvidenceRequirementWhereUniqueInput;
    data: Prisma.XOR<Prisma.EvidenceRequirementUpdateWithoutResponsibleInput, Prisma.EvidenceRequirementUncheckedUpdateWithoutResponsibleInput>;
};
export type EvidenceRequirementUpdateManyWithWhereWithoutResponsibleInput = {
    where: Prisma.EvidenceRequirementScalarWhereInput;
    data: Prisma.XOR<Prisma.EvidenceRequirementUpdateManyMutationInput, Prisma.EvidenceRequirementUncheckedUpdateManyWithoutResponsibleInput>;
};
export type EvidenceRequirementCreateManyTenantInput = {
    id?: string;
    clientControlId: string;
    responsibleId?: string | null;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef?: string | null;
};
export type EvidenceRequirementUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutEvidenceRequirementsNestedInput;
    responsible?: Prisma.OrganizationResponsibleUpdateOneWithoutEvidenceRequirementsNestedInput;
    submissions?: Prisma.EvidenceSubmissionUpdateManyWithoutEvidenceRequirementNestedInput;
};
export type EvidenceRequirementUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    submissions?: Prisma.EvidenceSubmissionUncheckedUpdateManyWithoutEvidenceRequirementNestedInput;
};
export type EvidenceRequirementUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceRequirementCreateManyClientControlInput = {
    id?: string;
    tenantId: string;
    responsibleId?: string | null;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef?: string | null;
};
export type EvidenceRequirementUpdateWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsible?: Prisma.OrganizationResponsibleUpdateOneWithoutEvidenceRequirementsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutEvidenceRequirementsNestedInput;
    submissions?: Prisma.EvidenceSubmissionUpdateManyWithoutEvidenceRequirementNestedInput;
};
export type EvidenceRequirementUncheckedUpdateWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    submissions?: Prisma.EvidenceSubmissionUncheckedUpdateManyWithoutEvidenceRequirementNestedInput;
};
export type EvidenceRequirementUncheckedUpdateManyWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceRequirementCreateManyResponsibleInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
    code: string;
    sequence: number;
    description: string;
    dimension: $Enums.Dimension;
    validityWithinPeriod: string;
    sourceRef?: string | null;
};
export type EvidenceRequirementUpdateWithoutResponsibleInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutEvidenceRequirementsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutEvidenceRequirementsNestedInput;
    submissions?: Prisma.EvidenceSubmissionUpdateManyWithoutEvidenceRequirementNestedInput;
};
export type EvidenceRequirementUncheckedUpdateWithoutResponsibleInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    submissions?: Prisma.EvidenceSubmissionUncheckedUpdateManyWithoutEvidenceRequirementNestedInput;
};
export type EvidenceRequirementUncheckedUpdateManyWithoutResponsibleInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    validityWithinPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceRequirementCountOutputType = {
    submissions: number;
};
export type EvidenceRequirementCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    submissions?: boolean | EvidenceRequirementCountOutputTypeCountSubmissionsArgs;
};
export type EvidenceRequirementCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementCountOutputTypeSelect<ExtArgs> | null;
};
export type EvidenceRequirementCountOutputTypeCountSubmissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvidenceSubmissionWhereInput;
};
export type EvidenceRequirementSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    responsibleId?: boolean;
    code?: boolean;
    sequence?: boolean;
    description?: boolean;
    dimension?: boolean;
    validityWithinPeriod?: boolean;
    sourceRef?: boolean;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    responsible?: boolean | Prisma.EvidenceRequirement$responsibleArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    submissions?: boolean | Prisma.EvidenceRequirement$submissionsArgs<ExtArgs>;
    _count?: boolean | Prisma.EvidenceRequirementCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["evidenceRequirement"]>;
export type EvidenceRequirementSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    responsibleId?: boolean;
    code?: boolean;
    sequence?: boolean;
    description?: boolean;
    dimension?: boolean;
    validityWithinPeriod?: boolean;
    sourceRef?: boolean;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    responsible?: boolean | Prisma.EvidenceRequirement$responsibleArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["evidenceRequirement"]>;
export type EvidenceRequirementSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    responsibleId?: boolean;
    code?: boolean;
    sequence?: boolean;
    description?: boolean;
    dimension?: boolean;
    validityWithinPeriod?: boolean;
    sourceRef?: boolean;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    responsible?: boolean | Prisma.EvidenceRequirement$responsibleArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["evidenceRequirement"]>;
export type EvidenceRequirementSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    responsibleId?: boolean;
    code?: boolean;
    sequence?: boolean;
    description?: boolean;
    dimension?: boolean;
    validityWithinPeriod?: boolean;
    sourceRef?: boolean;
};
export type EvidenceRequirementOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "clientControlId" | "responsibleId" | "code" | "sequence" | "description" | "dimension" | "validityWithinPeriod" | "sourceRef", ExtArgs["result"]["evidenceRequirement"]>;
export type EvidenceRequirementInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    responsible?: boolean | Prisma.EvidenceRequirement$responsibleArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    submissions?: boolean | Prisma.EvidenceRequirement$submissionsArgs<ExtArgs>;
    _count?: boolean | Prisma.EvidenceRequirementCountOutputTypeDefaultArgs<ExtArgs>;
};
export type EvidenceRequirementIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    responsible?: boolean | Prisma.EvidenceRequirement$responsibleArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type EvidenceRequirementIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    responsible?: boolean | Prisma.EvidenceRequirement$responsibleArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $EvidenceRequirementPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "EvidenceRequirement";
    objects: {
        clientControl: Prisma.$ClientControlPayload<ExtArgs>;
        responsible: Prisma.$OrganizationResponsiblePayload<ExtArgs> | null;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
        submissions: Prisma.$EvidenceSubmissionPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        clientControlId: string;
        responsibleId: string | null;
        code: string;
        sequence: number;
        description: string;
        dimension: $Enums.Dimension;
        validityWithinPeriod: string;
        sourceRef: string | null;
    }, ExtArgs["result"]["evidenceRequirement"]>;
    composites: {};
};
export type EvidenceRequirementGetPayload<S extends boolean | null | undefined | EvidenceRequirementDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload, S>;
export type EvidenceRequirementCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<EvidenceRequirementFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: EvidenceRequirementCountAggregateInputType | true;
};
export interface EvidenceRequirementDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['EvidenceRequirement'];
        meta: {
            name: 'EvidenceRequirement';
        };
    };
    findUnique<T extends EvidenceRequirementFindUniqueArgs>(args: Prisma.SelectSubset<T, EvidenceRequirementFindUniqueArgs<ExtArgs>>): Prisma.Prisma__EvidenceRequirementClient<runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends EvidenceRequirementFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, EvidenceRequirementFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__EvidenceRequirementClient<runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends EvidenceRequirementFindFirstArgs>(args?: Prisma.SelectSubset<T, EvidenceRequirementFindFirstArgs<ExtArgs>>): Prisma.Prisma__EvidenceRequirementClient<runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends EvidenceRequirementFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, EvidenceRequirementFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__EvidenceRequirementClient<runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends EvidenceRequirementFindManyArgs>(args?: Prisma.SelectSubset<T, EvidenceRequirementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends EvidenceRequirementCreateArgs>(args: Prisma.SelectSubset<T, EvidenceRequirementCreateArgs<ExtArgs>>): Prisma.Prisma__EvidenceRequirementClient<runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends EvidenceRequirementCreateManyArgs>(args?: Prisma.SelectSubset<T, EvidenceRequirementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends EvidenceRequirementCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, EvidenceRequirementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends EvidenceRequirementDeleteArgs>(args: Prisma.SelectSubset<T, EvidenceRequirementDeleteArgs<ExtArgs>>): Prisma.Prisma__EvidenceRequirementClient<runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends EvidenceRequirementUpdateArgs>(args: Prisma.SelectSubset<T, EvidenceRequirementUpdateArgs<ExtArgs>>): Prisma.Prisma__EvidenceRequirementClient<runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends EvidenceRequirementDeleteManyArgs>(args?: Prisma.SelectSubset<T, EvidenceRequirementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends EvidenceRequirementUpdateManyArgs>(args: Prisma.SelectSubset<T, EvidenceRequirementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends EvidenceRequirementUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, EvidenceRequirementUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends EvidenceRequirementUpsertArgs>(args: Prisma.SelectSubset<T, EvidenceRequirementUpsertArgs<ExtArgs>>): Prisma.Prisma__EvidenceRequirementClient<runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends EvidenceRequirementCountArgs>(args?: Prisma.Subset<T, EvidenceRequirementCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], EvidenceRequirementCountAggregateOutputType> : number>;
    aggregate<T extends EvidenceRequirementAggregateArgs>(args: Prisma.Subset<T, EvidenceRequirementAggregateArgs>): Prisma.PrismaPromise<GetEvidenceRequirementAggregateType<T>>;
    groupBy<T extends EvidenceRequirementGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: EvidenceRequirementGroupByArgs['orderBy'];
    } : {
        orderBy?: EvidenceRequirementGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, EvidenceRequirementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEvidenceRequirementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: EvidenceRequirementFieldRefs;
}
export interface Prisma__EvidenceRequirementClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    clientControl<T extends Prisma.ClientControlDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientControlDefaultArgs<ExtArgs>>): Prisma.Prisma__ClientControlClient<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    responsible<T extends Prisma.EvidenceRequirement$responsibleArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EvidenceRequirement$responsibleArgs<ExtArgs>>): Prisma.Prisma__OrganizationResponsibleClient<runtime.Types.Result.GetResult<Prisma.$OrganizationResponsiblePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    submissions<T extends Prisma.EvidenceRequirement$submissionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EvidenceRequirement$submissionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvidenceSubmissionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface EvidenceRequirementFieldRefs {
    readonly id: Prisma.FieldRef<"EvidenceRequirement", 'String'>;
    readonly tenantId: Prisma.FieldRef<"EvidenceRequirement", 'String'>;
    readonly clientControlId: Prisma.FieldRef<"EvidenceRequirement", 'String'>;
    readonly responsibleId: Prisma.FieldRef<"EvidenceRequirement", 'String'>;
    readonly code: Prisma.FieldRef<"EvidenceRequirement", 'String'>;
    readonly sequence: Prisma.FieldRef<"EvidenceRequirement", 'Int'>;
    readonly description: Prisma.FieldRef<"EvidenceRequirement", 'String'>;
    readonly dimension: Prisma.FieldRef<"EvidenceRequirement", 'Dimension'>;
    readonly validityWithinPeriod: Prisma.FieldRef<"EvidenceRequirement", 'String'>;
    readonly sourceRef: Prisma.FieldRef<"EvidenceRequirement", 'String'>;
}
export type EvidenceRequirementFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceRequirementOmit<ExtArgs> | null;
    include?: Prisma.EvidenceRequirementInclude<ExtArgs> | null;
    where: Prisma.EvidenceRequirementWhereUniqueInput;
};
export type EvidenceRequirementFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceRequirementOmit<ExtArgs> | null;
    include?: Prisma.EvidenceRequirementInclude<ExtArgs> | null;
    where: Prisma.EvidenceRequirementWhereUniqueInput;
};
export type EvidenceRequirementFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceRequirementOmit<ExtArgs> | null;
    include?: Prisma.EvidenceRequirementInclude<ExtArgs> | null;
    where?: Prisma.EvidenceRequirementWhereInput;
    orderBy?: Prisma.EvidenceRequirementOrderByWithRelationInput | Prisma.EvidenceRequirementOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceRequirementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EvidenceRequirementScalarFieldEnum | Prisma.EvidenceRequirementScalarFieldEnum[];
};
export type EvidenceRequirementFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceRequirementOmit<ExtArgs> | null;
    include?: Prisma.EvidenceRequirementInclude<ExtArgs> | null;
    where?: Prisma.EvidenceRequirementWhereInput;
    orderBy?: Prisma.EvidenceRequirementOrderByWithRelationInput | Prisma.EvidenceRequirementOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceRequirementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EvidenceRequirementScalarFieldEnum | Prisma.EvidenceRequirementScalarFieldEnum[];
};
export type EvidenceRequirementFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceRequirementOmit<ExtArgs> | null;
    include?: Prisma.EvidenceRequirementInclude<ExtArgs> | null;
    where?: Prisma.EvidenceRequirementWhereInput;
    orderBy?: Prisma.EvidenceRequirementOrderByWithRelationInput | Prisma.EvidenceRequirementOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceRequirementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EvidenceRequirementScalarFieldEnum | Prisma.EvidenceRequirementScalarFieldEnum[];
};
export type EvidenceRequirementCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceRequirementOmit<ExtArgs> | null;
    include?: Prisma.EvidenceRequirementInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EvidenceRequirementCreateInput, Prisma.EvidenceRequirementUncheckedCreateInput>;
};
export type EvidenceRequirementCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.EvidenceRequirementCreateManyInput | Prisma.EvidenceRequirementCreateManyInput[];
    skipDuplicates?: boolean;
};
export type EvidenceRequirementCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EvidenceRequirementOmit<ExtArgs> | null;
    data: Prisma.EvidenceRequirementCreateManyInput | Prisma.EvidenceRequirementCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.EvidenceRequirementIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type EvidenceRequirementUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceRequirementOmit<ExtArgs> | null;
    include?: Prisma.EvidenceRequirementInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EvidenceRequirementUpdateInput, Prisma.EvidenceRequirementUncheckedUpdateInput>;
    where: Prisma.EvidenceRequirementWhereUniqueInput;
};
export type EvidenceRequirementUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.EvidenceRequirementUpdateManyMutationInput, Prisma.EvidenceRequirementUncheckedUpdateManyInput>;
    where?: Prisma.EvidenceRequirementWhereInput;
    limit?: number;
};
export type EvidenceRequirementUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EvidenceRequirementOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EvidenceRequirementUpdateManyMutationInput, Prisma.EvidenceRequirementUncheckedUpdateManyInput>;
    where?: Prisma.EvidenceRequirementWhereInput;
    limit?: number;
    include?: Prisma.EvidenceRequirementIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type EvidenceRequirementUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceRequirementOmit<ExtArgs> | null;
    include?: Prisma.EvidenceRequirementInclude<ExtArgs> | null;
    where: Prisma.EvidenceRequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.EvidenceRequirementCreateInput, Prisma.EvidenceRequirementUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.EvidenceRequirementUpdateInput, Prisma.EvidenceRequirementUncheckedUpdateInput>;
};
export type EvidenceRequirementDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceRequirementOmit<ExtArgs> | null;
    include?: Prisma.EvidenceRequirementInclude<ExtArgs> | null;
    where: Prisma.EvidenceRequirementWhereUniqueInput;
};
export type EvidenceRequirementDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvidenceRequirementWhereInput;
    limit?: number;
};
export type EvidenceRequirement$responsibleArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationResponsibleOmit<ExtArgs> | null;
    include?: Prisma.OrganizationResponsibleInclude<ExtArgs> | null;
    where?: Prisma.OrganizationResponsibleWhereInput;
};
export type EvidenceRequirement$submissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceSubmissionSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceSubmissionOmit<ExtArgs> | null;
    include?: Prisma.EvidenceSubmissionInclude<ExtArgs> | null;
    where?: Prisma.EvidenceSubmissionWhereInput;
    orderBy?: Prisma.EvidenceSubmissionOrderByWithRelationInput | Prisma.EvidenceSubmissionOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceSubmissionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EvidenceSubmissionScalarFieldEnum | Prisma.EvidenceSubmissionScalarFieldEnum[];
};
export type EvidenceRequirementDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceRequirementOmit<ExtArgs> | null;
    include?: Prisma.EvidenceRequirementInclude<ExtArgs> | null;
};
export {};
