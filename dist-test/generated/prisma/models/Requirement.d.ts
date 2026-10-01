import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type RequirementModel = runtime.Types.Result.DefaultSelection<Prisma.$RequirementPayload>;
export type AggregateRequirement = {
    _count: RequirementCountAggregateOutputType | null;
    _min: RequirementMinAggregateOutputType | null;
    _max: RequirementMaxAggregateOutputType | null;
};
export type RequirementMinAggregateOutputType = {
    id: string | null;
    frameworkId: string | null;
    trustCriterionId: string | null;
    code: string | null;
    tscCategory: string | null;
    criterion: string | null;
};
export type RequirementMaxAggregateOutputType = {
    id: string | null;
    frameworkId: string | null;
    trustCriterionId: string | null;
    code: string | null;
    tscCategory: string | null;
    criterion: string | null;
};
export type RequirementCountAggregateOutputType = {
    id: number;
    frameworkId: number;
    trustCriterionId: number;
    code: number;
    tscCategory: number;
    criterion: number;
    _all: number;
};
export type RequirementMinAggregateInputType = {
    id?: true;
    frameworkId?: true;
    trustCriterionId?: true;
    code?: true;
    tscCategory?: true;
    criterion?: true;
};
export type RequirementMaxAggregateInputType = {
    id?: true;
    frameworkId?: true;
    trustCriterionId?: true;
    code?: true;
    tscCategory?: true;
    criterion?: true;
};
export type RequirementCountAggregateInputType = {
    id?: true;
    frameworkId?: true;
    trustCriterionId?: true;
    code?: true;
    tscCategory?: true;
    criterion?: true;
    _all?: true;
};
export type RequirementAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RequirementWhereInput;
    orderBy?: Prisma.RequirementOrderByWithRelationInput | Prisma.RequirementOrderByWithRelationInput[];
    cursor?: Prisma.RequirementWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | RequirementCountAggregateInputType;
    _min?: RequirementMinAggregateInputType;
    _max?: RequirementMaxAggregateInputType;
};
export type GetRequirementAggregateType<T extends RequirementAggregateArgs> = {
    [P in keyof T & keyof AggregateRequirement]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRequirement[P]> : Prisma.GetScalarType<T[P], AggregateRequirement[P]>;
};
export type RequirementGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RequirementWhereInput;
    orderBy?: Prisma.RequirementOrderByWithAggregationInput | Prisma.RequirementOrderByWithAggregationInput[];
    by: Prisma.RequirementScalarFieldEnum[] | Prisma.RequirementScalarFieldEnum;
    having?: Prisma.RequirementScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RequirementCountAggregateInputType | true;
    _min?: RequirementMinAggregateInputType;
    _max?: RequirementMaxAggregateInputType;
};
export type RequirementGroupByOutputType = {
    id: string;
    frameworkId: string;
    trustCriterionId: string;
    code: string;
    tscCategory: string;
    criterion: string;
    _count: RequirementCountAggregateOutputType | null;
    _min: RequirementMinAggregateOutputType | null;
    _max: RequirementMaxAggregateOutputType | null;
};
type GetRequirementGroupByPayload<T extends RequirementGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RequirementGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RequirementGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RequirementGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RequirementGroupByOutputType[P]>;
}>>;
export type RequirementWhereInput = {
    AND?: Prisma.RequirementWhereInput | Prisma.RequirementWhereInput[];
    OR?: Prisma.RequirementWhereInput[];
    NOT?: Prisma.RequirementWhereInput | Prisma.RequirementWhereInput[];
    id?: Prisma.UuidFilter<"Requirement"> | string;
    frameworkId?: Prisma.UuidFilter<"Requirement"> | string;
    trustCriterionId?: Prisma.UuidFilter<"Requirement"> | string;
    code?: Prisma.StringFilter<"Requirement"> | string;
    tscCategory?: Prisma.StringFilter<"Requirement"> | string;
    criterion?: Prisma.StringFilter<"Requirement"> | string;
    framework?: Prisma.XOR<Prisma.FrameworkScalarRelationFilter, Prisma.FrameworkWhereInput>;
    trustCriterion?: Prisma.XOR<Prisma.TrustCriterionScalarRelationFilter, Prisma.TrustCriterionWhereInput>;
    pointsOfFocus?: Prisma.PointOfFocusListRelationFilter;
    relationsAsSource?: Prisma.RequirementRelationListRelationFilter;
    relationsAsRelated?: Prisma.RequirementRelationListRelationFilter;
    monitoringDomains?: Prisma.MonitoringDomainRequirementListRelationFilter;
};
export type RequirementOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    frameworkId?: Prisma.SortOrder;
    trustCriterionId?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    tscCategory?: Prisma.SortOrder;
    criterion?: Prisma.SortOrder;
    framework?: Prisma.FrameworkOrderByWithRelationInput;
    trustCriterion?: Prisma.TrustCriterionOrderByWithRelationInput;
    pointsOfFocus?: Prisma.PointOfFocusOrderByRelationAggregateInput;
    relationsAsSource?: Prisma.RequirementRelationOrderByRelationAggregateInput;
    relationsAsRelated?: Prisma.RequirementRelationOrderByRelationAggregateInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementOrderByRelationAggregateInput;
};
export type RequirementWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    frameworkId_code?: Prisma.RequirementFrameworkIdCodeCompoundUniqueInput;
    AND?: Prisma.RequirementWhereInput | Prisma.RequirementWhereInput[];
    OR?: Prisma.RequirementWhereInput[];
    NOT?: Prisma.RequirementWhereInput | Prisma.RequirementWhereInput[];
    frameworkId?: Prisma.UuidFilter<"Requirement"> | string;
    trustCriterionId?: Prisma.UuidFilter<"Requirement"> | string;
    code?: Prisma.StringFilter<"Requirement"> | string;
    tscCategory?: Prisma.StringFilter<"Requirement"> | string;
    criterion?: Prisma.StringFilter<"Requirement"> | string;
    framework?: Prisma.XOR<Prisma.FrameworkScalarRelationFilter, Prisma.FrameworkWhereInput>;
    trustCriterion?: Prisma.XOR<Prisma.TrustCriterionScalarRelationFilter, Prisma.TrustCriterionWhereInput>;
    pointsOfFocus?: Prisma.PointOfFocusListRelationFilter;
    relationsAsSource?: Prisma.RequirementRelationListRelationFilter;
    relationsAsRelated?: Prisma.RequirementRelationListRelationFilter;
    monitoringDomains?: Prisma.MonitoringDomainRequirementListRelationFilter;
}, "id" | "frameworkId_code">;
export type RequirementOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    frameworkId?: Prisma.SortOrder;
    trustCriterionId?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    tscCategory?: Prisma.SortOrder;
    criterion?: Prisma.SortOrder;
    _count?: Prisma.RequirementCountOrderByAggregateInput;
    _max?: Prisma.RequirementMaxOrderByAggregateInput;
    _min?: Prisma.RequirementMinOrderByAggregateInput;
};
export type RequirementScalarWhereWithAggregatesInput = {
    AND?: Prisma.RequirementScalarWhereWithAggregatesInput | Prisma.RequirementScalarWhereWithAggregatesInput[];
    OR?: Prisma.RequirementScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RequirementScalarWhereWithAggregatesInput | Prisma.RequirementScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Requirement"> | string;
    frameworkId?: Prisma.UuidWithAggregatesFilter<"Requirement"> | string;
    trustCriterionId?: Prisma.UuidWithAggregatesFilter<"Requirement"> | string;
    code?: Prisma.StringWithAggregatesFilter<"Requirement"> | string;
    tscCategory?: Prisma.StringWithAggregatesFilter<"Requirement"> | string;
    criterion?: Prisma.StringWithAggregatesFilter<"Requirement"> | string;
};
export type RequirementCreateInput = {
    id?: string;
    code: string;
    tscCategory: string;
    criterion: string;
    framework: Prisma.FrameworkCreateNestedOneWithoutRequirementsInput;
    trustCriterion: Prisma.TrustCriterionCreateNestedOneWithoutRequirementsInput;
    pointsOfFocus?: Prisma.PointOfFocusCreateNestedManyWithoutRequirementInput;
    relationsAsSource?: Prisma.RequirementRelationCreateNestedManyWithoutSourceRequirementInput;
    relationsAsRelated?: Prisma.RequirementRelationCreateNestedManyWithoutRelatedRequirementInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementCreateNestedManyWithoutRequirementInput;
};
export type RequirementUncheckedCreateInput = {
    id?: string;
    frameworkId: string;
    trustCriterionId: string;
    code: string;
    tscCategory: string;
    criterion: string;
    pointsOfFocus?: Prisma.PointOfFocusUncheckedCreateNestedManyWithoutRequirementInput;
    relationsAsSource?: Prisma.RequirementRelationUncheckedCreateNestedManyWithoutSourceRequirementInput;
    relationsAsRelated?: Prisma.RequirementRelationUncheckedCreateNestedManyWithoutRelatedRequirementInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUncheckedCreateNestedManyWithoutRequirementInput;
};
export type RequirementUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
    framework?: Prisma.FrameworkUpdateOneRequiredWithoutRequirementsNestedInput;
    trustCriterion?: Prisma.TrustCriterionUpdateOneRequiredWithoutRequirementsNestedInput;
    pointsOfFocus?: Prisma.PointOfFocusUpdateManyWithoutRequirementNestedInput;
    relationsAsSource?: Prisma.RequirementRelationUpdateManyWithoutSourceRequirementNestedInput;
    relationsAsRelated?: Prisma.RequirementRelationUpdateManyWithoutRelatedRequirementNestedInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUpdateManyWithoutRequirementNestedInput;
};
export type RequirementUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterionId?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
    pointsOfFocus?: Prisma.PointOfFocusUncheckedUpdateManyWithoutRequirementNestedInput;
    relationsAsSource?: Prisma.RequirementRelationUncheckedUpdateManyWithoutSourceRequirementNestedInput;
    relationsAsRelated?: Prisma.RequirementRelationUncheckedUpdateManyWithoutRelatedRequirementNestedInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUncheckedUpdateManyWithoutRequirementNestedInput;
};
export type RequirementCreateManyInput = {
    id?: string;
    frameworkId: string;
    trustCriterionId: string;
    code: string;
    tscCategory: string;
    criterion: string;
};
export type RequirementUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RequirementUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterionId?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RequirementListRelationFilter = {
    every?: Prisma.RequirementWhereInput;
    some?: Prisma.RequirementWhereInput;
    none?: Prisma.RequirementWhereInput;
};
export type RequirementOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type RequirementFrameworkIdCodeCompoundUniqueInput = {
    frameworkId: string;
    code: string;
};
export type RequirementCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    frameworkId?: Prisma.SortOrder;
    trustCriterionId?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    tscCategory?: Prisma.SortOrder;
    criterion?: Prisma.SortOrder;
};
export type RequirementMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    frameworkId?: Prisma.SortOrder;
    trustCriterionId?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    tscCategory?: Prisma.SortOrder;
    criterion?: Prisma.SortOrder;
};
export type RequirementMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    frameworkId?: Prisma.SortOrder;
    trustCriterionId?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    tscCategory?: Prisma.SortOrder;
    criterion?: Prisma.SortOrder;
};
export type RequirementScalarRelationFilter = {
    is?: Prisma.RequirementWhereInput;
    isNot?: Prisma.RequirementWhereInput;
};
export type RequirementCreateNestedManyWithoutFrameworkInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutFrameworkInput, Prisma.RequirementUncheckedCreateWithoutFrameworkInput> | Prisma.RequirementCreateWithoutFrameworkInput[] | Prisma.RequirementUncheckedCreateWithoutFrameworkInput[];
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutFrameworkInput | Prisma.RequirementCreateOrConnectWithoutFrameworkInput[];
    createMany?: Prisma.RequirementCreateManyFrameworkInputEnvelope;
    connect?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
};
export type RequirementUncheckedCreateNestedManyWithoutFrameworkInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutFrameworkInput, Prisma.RequirementUncheckedCreateWithoutFrameworkInput> | Prisma.RequirementCreateWithoutFrameworkInput[] | Prisma.RequirementUncheckedCreateWithoutFrameworkInput[];
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutFrameworkInput | Prisma.RequirementCreateOrConnectWithoutFrameworkInput[];
    createMany?: Prisma.RequirementCreateManyFrameworkInputEnvelope;
    connect?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
};
export type RequirementUpdateManyWithoutFrameworkNestedInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutFrameworkInput, Prisma.RequirementUncheckedCreateWithoutFrameworkInput> | Prisma.RequirementCreateWithoutFrameworkInput[] | Prisma.RequirementUncheckedCreateWithoutFrameworkInput[];
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutFrameworkInput | Prisma.RequirementCreateOrConnectWithoutFrameworkInput[];
    upsert?: Prisma.RequirementUpsertWithWhereUniqueWithoutFrameworkInput | Prisma.RequirementUpsertWithWhereUniqueWithoutFrameworkInput[];
    createMany?: Prisma.RequirementCreateManyFrameworkInputEnvelope;
    set?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    disconnect?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    delete?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    connect?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    update?: Prisma.RequirementUpdateWithWhereUniqueWithoutFrameworkInput | Prisma.RequirementUpdateWithWhereUniqueWithoutFrameworkInput[];
    updateMany?: Prisma.RequirementUpdateManyWithWhereWithoutFrameworkInput | Prisma.RequirementUpdateManyWithWhereWithoutFrameworkInput[];
    deleteMany?: Prisma.RequirementScalarWhereInput | Prisma.RequirementScalarWhereInput[];
};
export type RequirementUncheckedUpdateManyWithoutFrameworkNestedInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutFrameworkInput, Prisma.RequirementUncheckedCreateWithoutFrameworkInput> | Prisma.RequirementCreateWithoutFrameworkInput[] | Prisma.RequirementUncheckedCreateWithoutFrameworkInput[];
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutFrameworkInput | Prisma.RequirementCreateOrConnectWithoutFrameworkInput[];
    upsert?: Prisma.RequirementUpsertWithWhereUniqueWithoutFrameworkInput | Prisma.RequirementUpsertWithWhereUniqueWithoutFrameworkInput[];
    createMany?: Prisma.RequirementCreateManyFrameworkInputEnvelope;
    set?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    disconnect?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    delete?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    connect?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    update?: Prisma.RequirementUpdateWithWhereUniqueWithoutFrameworkInput | Prisma.RequirementUpdateWithWhereUniqueWithoutFrameworkInput[];
    updateMany?: Prisma.RequirementUpdateManyWithWhereWithoutFrameworkInput | Prisma.RequirementUpdateManyWithWhereWithoutFrameworkInput[];
    deleteMany?: Prisma.RequirementScalarWhereInput | Prisma.RequirementScalarWhereInput[];
};
export type RequirementCreateNestedManyWithoutTrustCriterionInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutTrustCriterionInput, Prisma.RequirementUncheckedCreateWithoutTrustCriterionInput> | Prisma.RequirementCreateWithoutTrustCriterionInput[] | Prisma.RequirementUncheckedCreateWithoutTrustCriterionInput[];
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutTrustCriterionInput | Prisma.RequirementCreateOrConnectWithoutTrustCriterionInput[];
    createMany?: Prisma.RequirementCreateManyTrustCriterionInputEnvelope;
    connect?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
};
export type RequirementUncheckedCreateNestedManyWithoutTrustCriterionInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutTrustCriterionInput, Prisma.RequirementUncheckedCreateWithoutTrustCriterionInput> | Prisma.RequirementCreateWithoutTrustCriterionInput[] | Prisma.RequirementUncheckedCreateWithoutTrustCriterionInput[];
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutTrustCriterionInput | Prisma.RequirementCreateOrConnectWithoutTrustCriterionInput[];
    createMany?: Prisma.RequirementCreateManyTrustCriterionInputEnvelope;
    connect?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
};
export type RequirementUpdateManyWithoutTrustCriterionNestedInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutTrustCriterionInput, Prisma.RequirementUncheckedCreateWithoutTrustCriterionInput> | Prisma.RequirementCreateWithoutTrustCriterionInput[] | Prisma.RequirementUncheckedCreateWithoutTrustCriterionInput[];
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutTrustCriterionInput | Prisma.RequirementCreateOrConnectWithoutTrustCriterionInput[];
    upsert?: Prisma.RequirementUpsertWithWhereUniqueWithoutTrustCriterionInput | Prisma.RequirementUpsertWithWhereUniqueWithoutTrustCriterionInput[];
    createMany?: Prisma.RequirementCreateManyTrustCriterionInputEnvelope;
    set?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    disconnect?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    delete?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    connect?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    update?: Prisma.RequirementUpdateWithWhereUniqueWithoutTrustCriterionInput | Prisma.RequirementUpdateWithWhereUniqueWithoutTrustCriterionInput[];
    updateMany?: Prisma.RequirementUpdateManyWithWhereWithoutTrustCriterionInput | Prisma.RequirementUpdateManyWithWhereWithoutTrustCriterionInput[];
    deleteMany?: Prisma.RequirementScalarWhereInput | Prisma.RequirementScalarWhereInput[];
};
export type RequirementUncheckedUpdateManyWithoutTrustCriterionNestedInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutTrustCriterionInput, Prisma.RequirementUncheckedCreateWithoutTrustCriterionInput> | Prisma.RequirementCreateWithoutTrustCriterionInput[] | Prisma.RequirementUncheckedCreateWithoutTrustCriterionInput[];
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutTrustCriterionInput | Prisma.RequirementCreateOrConnectWithoutTrustCriterionInput[];
    upsert?: Prisma.RequirementUpsertWithWhereUniqueWithoutTrustCriterionInput | Prisma.RequirementUpsertWithWhereUniqueWithoutTrustCriterionInput[];
    createMany?: Prisma.RequirementCreateManyTrustCriterionInputEnvelope;
    set?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    disconnect?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    delete?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    connect?: Prisma.RequirementWhereUniqueInput | Prisma.RequirementWhereUniqueInput[];
    update?: Prisma.RequirementUpdateWithWhereUniqueWithoutTrustCriterionInput | Prisma.RequirementUpdateWithWhereUniqueWithoutTrustCriterionInput[];
    updateMany?: Prisma.RequirementUpdateManyWithWhereWithoutTrustCriterionInput | Prisma.RequirementUpdateManyWithWhereWithoutTrustCriterionInput[];
    deleteMany?: Prisma.RequirementScalarWhereInput | Prisma.RequirementScalarWhereInput[];
};
export type RequirementCreateNestedOneWithoutPointsOfFocusInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutPointsOfFocusInput, Prisma.RequirementUncheckedCreateWithoutPointsOfFocusInput>;
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutPointsOfFocusInput;
    connect?: Prisma.RequirementWhereUniqueInput;
};
export type RequirementUpdateOneRequiredWithoutPointsOfFocusNestedInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutPointsOfFocusInput, Prisma.RequirementUncheckedCreateWithoutPointsOfFocusInput>;
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutPointsOfFocusInput;
    upsert?: Prisma.RequirementUpsertWithoutPointsOfFocusInput;
    connect?: Prisma.RequirementWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RequirementUpdateToOneWithWhereWithoutPointsOfFocusInput, Prisma.RequirementUpdateWithoutPointsOfFocusInput>, Prisma.RequirementUncheckedUpdateWithoutPointsOfFocusInput>;
};
export type RequirementCreateNestedOneWithoutRelationsAsSourceInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutRelationsAsSourceInput, Prisma.RequirementUncheckedCreateWithoutRelationsAsSourceInput>;
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutRelationsAsSourceInput;
    connect?: Prisma.RequirementWhereUniqueInput;
};
export type RequirementCreateNestedOneWithoutRelationsAsRelatedInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutRelationsAsRelatedInput, Prisma.RequirementUncheckedCreateWithoutRelationsAsRelatedInput>;
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutRelationsAsRelatedInput;
    connect?: Prisma.RequirementWhereUniqueInput;
};
export type RequirementUpdateOneRequiredWithoutRelationsAsSourceNestedInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutRelationsAsSourceInput, Prisma.RequirementUncheckedCreateWithoutRelationsAsSourceInput>;
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutRelationsAsSourceInput;
    upsert?: Prisma.RequirementUpsertWithoutRelationsAsSourceInput;
    connect?: Prisma.RequirementWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RequirementUpdateToOneWithWhereWithoutRelationsAsSourceInput, Prisma.RequirementUpdateWithoutRelationsAsSourceInput>, Prisma.RequirementUncheckedUpdateWithoutRelationsAsSourceInput>;
};
export type RequirementUpdateOneRequiredWithoutRelationsAsRelatedNestedInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutRelationsAsRelatedInput, Prisma.RequirementUncheckedCreateWithoutRelationsAsRelatedInput>;
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutRelationsAsRelatedInput;
    upsert?: Prisma.RequirementUpsertWithoutRelationsAsRelatedInput;
    connect?: Prisma.RequirementWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RequirementUpdateToOneWithWhereWithoutRelationsAsRelatedInput, Prisma.RequirementUpdateWithoutRelationsAsRelatedInput>, Prisma.RequirementUncheckedUpdateWithoutRelationsAsRelatedInput>;
};
export type RequirementCreateNestedOneWithoutMonitoringDomainsInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutMonitoringDomainsInput, Prisma.RequirementUncheckedCreateWithoutMonitoringDomainsInput>;
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutMonitoringDomainsInput;
    connect?: Prisma.RequirementWhereUniqueInput;
};
export type RequirementUpdateOneRequiredWithoutMonitoringDomainsNestedInput = {
    create?: Prisma.XOR<Prisma.RequirementCreateWithoutMonitoringDomainsInput, Prisma.RequirementUncheckedCreateWithoutMonitoringDomainsInput>;
    connectOrCreate?: Prisma.RequirementCreateOrConnectWithoutMonitoringDomainsInput;
    upsert?: Prisma.RequirementUpsertWithoutMonitoringDomainsInput;
    connect?: Prisma.RequirementWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RequirementUpdateToOneWithWhereWithoutMonitoringDomainsInput, Prisma.RequirementUpdateWithoutMonitoringDomainsInput>, Prisma.RequirementUncheckedUpdateWithoutMonitoringDomainsInput>;
};
export type RequirementCreateWithoutFrameworkInput = {
    id?: string;
    code: string;
    tscCategory: string;
    criterion: string;
    trustCriterion: Prisma.TrustCriterionCreateNestedOneWithoutRequirementsInput;
    pointsOfFocus?: Prisma.PointOfFocusCreateNestedManyWithoutRequirementInput;
    relationsAsSource?: Prisma.RequirementRelationCreateNestedManyWithoutSourceRequirementInput;
    relationsAsRelated?: Prisma.RequirementRelationCreateNestedManyWithoutRelatedRequirementInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementCreateNestedManyWithoutRequirementInput;
};
export type RequirementUncheckedCreateWithoutFrameworkInput = {
    id?: string;
    trustCriterionId: string;
    code: string;
    tscCategory: string;
    criterion: string;
    pointsOfFocus?: Prisma.PointOfFocusUncheckedCreateNestedManyWithoutRequirementInput;
    relationsAsSource?: Prisma.RequirementRelationUncheckedCreateNestedManyWithoutSourceRequirementInput;
    relationsAsRelated?: Prisma.RequirementRelationUncheckedCreateNestedManyWithoutRelatedRequirementInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUncheckedCreateNestedManyWithoutRequirementInput;
};
export type RequirementCreateOrConnectWithoutFrameworkInput = {
    where: Prisma.RequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.RequirementCreateWithoutFrameworkInput, Prisma.RequirementUncheckedCreateWithoutFrameworkInput>;
};
export type RequirementCreateManyFrameworkInputEnvelope = {
    data: Prisma.RequirementCreateManyFrameworkInput | Prisma.RequirementCreateManyFrameworkInput[];
    skipDuplicates?: boolean;
};
export type RequirementUpsertWithWhereUniqueWithoutFrameworkInput = {
    where: Prisma.RequirementWhereUniqueInput;
    update: Prisma.XOR<Prisma.RequirementUpdateWithoutFrameworkInput, Prisma.RequirementUncheckedUpdateWithoutFrameworkInput>;
    create: Prisma.XOR<Prisma.RequirementCreateWithoutFrameworkInput, Prisma.RequirementUncheckedCreateWithoutFrameworkInput>;
};
export type RequirementUpdateWithWhereUniqueWithoutFrameworkInput = {
    where: Prisma.RequirementWhereUniqueInput;
    data: Prisma.XOR<Prisma.RequirementUpdateWithoutFrameworkInput, Prisma.RequirementUncheckedUpdateWithoutFrameworkInput>;
};
export type RequirementUpdateManyWithWhereWithoutFrameworkInput = {
    where: Prisma.RequirementScalarWhereInput;
    data: Prisma.XOR<Prisma.RequirementUpdateManyMutationInput, Prisma.RequirementUncheckedUpdateManyWithoutFrameworkInput>;
};
export type RequirementScalarWhereInput = {
    AND?: Prisma.RequirementScalarWhereInput | Prisma.RequirementScalarWhereInput[];
    OR?: Prisma.RequirementScalarWhereInput[];
    NOT?: Prisma.RequirementScalarWhereInput | Prisma.RequirementScalarWhereInput[];
    id?: Prisma.UuidFilter<"Requirement"> | string;
    frameworkId?: Prisma.UuidFilter<"Requirement"> | string;
    trustCriterionId?: Prisma.UuidFilter<"Requirement"> | string;
    code?: Prisma.StringFilter<"Requirement"> | string;
    tscCategory?: Prisma.StringFilter<"Requirement"> | string;
    criterion?: Prisma.StringFilter<"Requirement"> | string;
};
export type RequirementCreateWithoutTrustCriterionInput = {
    id?: string;
    code: string;
    tscCategory: string;
    criterion: string;
    framework: Prisma.FrameworkCreateNestedOneWithoutRequirementsInput;
    pointsOfFocus?: Prisma.PointOfFocusCreateNestedManyWithoutRequirementInput;
    relationsAsSource?: Prisma.RequirementRelationCreateNestedManyWithoutSourceRequirementInput;
    relationsAsRelated?: Prisma.RequirementRelationCreateNestedManyWithoutRelatedRequirementInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementCreateNestedManyWithoutRequirementInput;
};
export type RequirementUncheckedCreateWithoutTrustCriterionInput = {
    id?: string;
    frameworkId: string;
    code: string;
    tscCategory: string;
    criterion: string;
    pointsOfFocus?: Prisma.PointOfFocusUncheckedCreateNestedManyWithoutRequirementInput;
    relationsAsSource?: Prisma.RequirementRelationUncheckedCreateNestedManyWithoutSourceRequirementInput;
    relationsAsRelated?: Prisma.RequirementRelationUncheckedCreateNestedManyWithoutRelatedRequirementInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUncheckedCreateNestedManyWithoutRequirementInput;
};
export type RequirementCreateOrConnectWithoutTrustCriterionInput = {
    where: Prisma.RequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.RequirementCreateWithoutTrustCriterionInput, Prisma.RequirementUncheckedCreateWithoutTrustCriterionInput>;
};
export type RequirementCreateManyTrustCriterionInputEnvelope = {
    data: Prisma.RequirementCreateManyTrustCriterionInput | Prisma.RequirementCreateManyTrustCriterionInput[];
    skipDuplicates?: boolean;
};
export type RequirementUpsertWithWhereUniqueWithoutTrustCriterionInput = {
    where: Prisma.RequirementWhereUniqueInput;
    update: Prisma.XOR<Prisma.RequirementUpdateWithoutTrustCriterionInput, Prisma.RequirementUncheckedUpdateWithoutTrustCriterionInput>;
    create: Prisma.XOR<Prisma.RequirementCreateWithoutTrustCriterionInput, Prisma.RequirementUncheckedCreateWithoutTrustCriterionInput>;
};
export type RequirementUpdateWithWhereUniqueWithoutTrustCriterionInput = {
    where: Prisma.RequirementWhereUniqueInput;
    data: Prisma.XOR<Prisma.RequirementUpdateWithoutTrustCriterionInput, Prisma.RequirementUncheckedUpdateWithoutTrustCriterionInput>;
};
export type RequirementUpdateManyWithWhereWithoutTrustCriterionInput = {
    where: Prisma.RequirementScalarWhereInput;
    data: Prisma.XOR<Prisma.RequirementUpdateManyMutationInput, Prisma.RequirementUncheckedUpdateManyWithoutTrustCriterionInput>;
};
export type RequirementCreateWithoutPointsOfFocusInput = {
    id?: string;
    code: string;
    tscCategory: string;
    criterion: string;
    framework: Prisma.FrameworkCreateNestedOneWithoutRequirementsInput;
    trustCriterion: Prisma.TrustCriterionCreateNestedOneWithoutRequirementsInput;
    relationsAsSource?: Prisma.RequirementRelationCreateNestedManyWithoutSourceRequirementInput;
    relationsAsRelated?: Prisma.RequirementRelationCreateNestedManyWithoutRelatedRequirementInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementCreateNestedManyWithoutRequirementInput;
};
export type RequirementUncheckedCreateWithoutPointsOfFocusInput = {
    id?: string;
    frameworkId: string;
    trustCriterionId: string;
    code: string;
    tscCategory: string;
    criterion: string;
    relationsAsSource?: Prisma.RequirementRelationUncheckedCreateNestedManyWithoutSourceRequirementInput;
    relationsAsRelated?: Prisma.RequirementRelationUncheckedCreateNestedManyWithoutRelatedRequirementInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUncheckedCreateNestedManyWithoutRequirementInput;
};
export type RequirementCreateOrConnectWithoutPointsOfFocusInput = {
    where: Prisma.RequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.RequirementCreateWithoutPointsOfFocusInput, Prisma.RequirementUncheckedCreateWithoutPointsOfFocusInput>;
};
export type RequirementUpsertWithoutPointsOfFocusInput = {
    update: Prisma.XOR<Prisma.RequirementUpdateWithoutPointsOfFocusInput, Prisma.RequirementUncheckedUpdateWithoutPointsOfFocusInput>;
    create: Prisma.XOR<Prisma.RequirementCreateWithoutPointsOfFocusInput, Prisma.RequirementUncheckedCreateWithoutPointsOfFocusInput>;
    where?: Prisma.RequirementWhereInput;
};
export type RequirementUpdateToOneWithWhereWithoutPointsOfFocusInput = {
    where?: Prisma.RequirementWhereInput;
    data: Prisma.XOR<Prisma.RequirementUpdateWithoutPointsOfFocusInput, Prisma.RequirementUncheckedUpdateWithoutPointsOfFocusInput>;
};
export type RequirementUpdateWithoutPointsOfFocusInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
    framework?: Prisma.FrameworkUpdateOneRequiredWithoutRequirementsNestedInput;
    trustCriterion?: Prisma.TrustCriterionUpdateOneRequiredWithoutRequirementsNestedInput;
    relationsAsSource?: Prisma.RequirementRelationUpdateManyWithoutSourceRequirementNestedInput;
    relationsAsRelated?: Prisma.RequirementRelationUpdateManyWithoutRelatedRequirementNestedInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUpdateManyWithoutRequirementNestedInput;
};
export type RequirementUncheckedUpdateWithoutPointsOfFocusInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterionId?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
    relationsAsSource?: Prisma.RequirementRelationUncheckedUpdateManyWithoutSourceRequirementNestedInput;
    relationsAsRelated?: Prisma.RequirementRelationUncheckedUpdateManyWithoutRelatedRequirementNestedInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUncheckedUpdateManyWithoutRequirementNestedInput;
};
export type RequirementCreateWithoutRelationsAsSourceInput = {
    id?: string;
    code: string;
    tscCategory: string;
    criterion: string;
    framework: Prisma.FrameworkCreateNestedOneWithoutRequirementsInput;
    trustCriterion: Prisma.TrustCriterionCreateNestedOneWithoutRequirementsInput;
    pointsOfFocus?: Prisma.PointOfFocusCreateNestedManyWithoutRequirementInput;
    relationsAsRelated?: Prisma.RequirementRelationCreateNestedManyWithoutRelatedRequirementInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementCreateNestedManyWithoutRequirementInput;
};
export type RequirementUncheckedCreateWithoutRelationsAsSourceInput = {
    id?: string;
    frameworkId: string;
    trustCriterionId: string;
    code: string;
    tscCategory: string;
    criterion: string;
    pointsOfFocus?: Prisma.PointOfFocusUncheckedCreateNestedManyWithoutRequirementInput;
    relationsAsRelated?: Prisma.RequirementRelationUncheckedCreateNestedManyWithoutRelatedRequirementInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUncheckedCreateNestedManyWithoutRequirementInput;
};
export type RequirementCreateOrConnectWithoutRelationsAsSourceInput = {
    where: Prisma.RequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.RequirementCreateWithoutRelationsAsSourceInput, Prisma.RequirementUncheckedCreateWithoutRelationsAsSourceInput>;
};
export type RequirementCreateWithoutRelationsAsRelatedInput = {
    id?: string;
    code: string;
    tscCategory: string;
    criterion: string;
    framework: Prisma.FrameworkCreateNestedOneWithoutRequirementsInput;
    trustCriterion: Prisma.TrustCriterionCreateNestedOneWithoutRequirementsInput;
    pointsOfFocus?: Prisma.PointOfFocusCreateNestedManyWithoutRequirementInput;
    relationsAsSource?: Prisma.RequirementRelationCreateNestedManyWithoutSourceRequirementInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementCreateNestedManyWithoutRequirementInput;
};
export type RequirementUncheckedCreateWithoutRelationsAsRelatedInput = {
    id?: string;
    frameworkId: string;
    trustCriterionId: string;
    code: string;
    tscCategory: string;
    criterion: string;
    pointsOfFocus?: Prisma.PointOfFocusUncheckedCreateNestedManyWithoutRequirementInput;
    relationsAsSource?: Prisma.RequirementRelationUncheckedCreateNestedManyWithoutSourceRequirementInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUncheckedCreateNestedManyWithoutRequirementInput;
};
export type RequirementCreateOrConnectWithoutRelationsAsRelatedInput = {
    where: Prisma.RequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.RequirementCreateWithoutRelationsAsRelatedInput, Prisma.RequirementUncheckedCreateWithoutRelationsAsRelatedInput>;
};
export type RequirementUpsertWithoutRelationsAsSourceInput = {
    update: Prisma.XOR<Prisma.RequirementUpdateWithoutRelationsAsSourceInput, Prisma.RequirementUncheckedUpdateWithoutRelationsAsSourceInput>;
    create: Prisma.XOR<Prisma.RequirementCreateWithoutRelationsAsSourceInput, Prisma.RequirementUncheckedCreateWithoutRelationsAsSourceInput>;
    where?: Prisma.RequirementWhereInput;
};
export type RequirementUpdateToOneWithWhereWithoutRelationsAsSourceInput = {
    where?: Prisma.RequirementWhereInput;
    data: Prisma.XOR<Prisma.RequirementUpdateWithoutRelationsAsSourceInput, Prisma.RequirementUncheckedUpdateWithoutRelationsAsSourceInput>;
};
export type RequirementUpdateWithoutRelationsAsSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
    framework?: Prisma.FrameworkUpdateOneRequiredWithoutRequirementsNestedInput;
    trustCriterion?: Prisma.TrustCriterionUpdateOneRequiredWithoutRequirementsNestedInput;
    pointsOfFocus?: Prisma.PointOfFocusUpdateManyWithoutRequirementNestedInput;
    relationsAsRelated?: Prisma.RequirementRelationUpdateManyWithoutRelatedRequirementNestedInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUpdateManyWithoutRequirementNestedInput;
};
export type RequirementUncheckedUpdateWithoutRelationsAsSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterionId?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
    pointsOfFocus?: Prisma.PointOfFocusUncheckedUpdateManyWithoutRequirementNestedInput;
    relationsAsRelated?: Prisma.RequirementRelationUncheckedUpdateManyWithoutRelatedRequirementNestedInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUncheckedUpdateManyWithoutRequirementNestedInput;
};
export type RequirementUpsertWithoutRelationsAsRelatedInput = {
    update: Prisma.XOR<Prisma.RequirementUpdateWithoutRelationsAsRelatedInput, Prisma.RequirementUncheckedUpdateWithoutRelationsAsRelatedInput>;
    create: Prisma.XOR<Prisma.RequirementCreateWithoutRelationsAsRelatedInput, Prisma.RequirementUncheckedCreateWithoutRelationsAsRelatedInput>;
    where?: Prisma.RequirementWhereInput;
};
export type RequirementUpdateToOneWithWhereWithoutRelationsAsRelatedInput = {
    where?: Prisma.RequirementWhereInput;
    data: Prisma.XOR<Prisma.RequirementUpdateWithoutRelationsAsRelatedInput, Prisma.RequirementUncheckedUpdateWithoutRelationsAsRelatedInput>;
};
export type RequirementUpdateWithoutRelationsAsRelatedInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
    framework?: Prisma.FrameworkUpdateOneRequiredWithoutRequirementsNestedInput;
    trustCriterion?: Prisma.TrustCriterionUpdateOneRequiredWithoutRequirementsNestedInput;
    pointsOfFocus?: Prisma.PointOfFocusUpdateManyWithoutRequirementNestedInput;
    relationsAsSource?: Prisma.RequirementRelationUpdateManyWithoutSourceRequirementNestedInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUpdateManyWithoutRequirementNestedInput;
};
export type RequirementUncheckedUpdateWithoutRelationsAsRelatedInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterionId?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
    pointsOfFocus?: Prisma.PointOfFocusUncheckedUpdateManyWithoutRequirementNestedInput;
    relationsAsSource?: Prisma.RequirementRelationUncheckedUpdateManyWithoutSourceRequirementNestedInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUncheckedUpdateManyWithoutRequirementNestedInput;
};
export type RequirementCreateWithoutMonitoringDomainsInput = {
    id?: string;
    code: string;
    tscCategory: string;
    criterion: string;
    framework: Prisma.FrameworkCreateNestedOneWithoutRequirementsInput;
    trustCriterion: Prisma.TrustCriterionCreateNestedOneWithoutRequirementsInput;
    pointsOfFocus?: Prisma.PointOfFocusCreateNestedManyWithoutRequirementInput;
    relationsAsSource?: Prisma.RequirementRelationCreateNestedManyWithoutSourceRequirementInput;
    relationsAsRelated?: Prisma.RequirementRelationCreateNestedManyWithoutRelatedRequirementInput;
};
export type RequirementUncheckedCreateWithoutMonitoringDomainsInput = {
    id?: string;
    frameworkId: string;
    trustCriterionId: string;
    code: string;
    tscCategory: string;
    criterion: string;
    pointsOfFocus?: Prisma.PointOfFocusUncheckedCreateNestedManyWithoutRequirementInput;
    relationsAsSource?: Prisma.RequirementRelationUncheckedCreateNestedManyWithoutSourceRequirementInput;
    relationsAsRelated?: Prisma.RequirementRelationUncheckedCreateNestedManyWithoutRelatedRequirementInput;
};
export type RequirementCreateOrConnectWithoutMonitoringDomainsInput = {
    where: Prisma.RequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.RequirementCreateWithoutMonitoringDomainsInput, Prisma.RequirementUncheckedCreateWithoutMonitoringDomainsInput>;
};
export type RequirementUpsertWithoutMonitoringDomainsInput = {
    update: Prisma.XOR<Prisma.RequirementUpdateWithoutMonitoringDomainsInput, Prisma.RequirementUncheckedUpdateWithoutMonitoringDomainsInput>;
    create: Prisma.XOR<Prisma.RequirementCreateWithoutMonitoringDomainsInput, Prisma.RequirementUncheckedCreateWithoutMonitoringDomainsInput>;
    where?: Prisma.RequirementWhereInput;
};
export type RequirementUpdateToOneWithWhereWithoutMonitoringDomainsInput = {
    where?: Prisma.RequirementWhereInput;
    data: Prisma.XOR<Prisma.RequirementUpdateWithoutMonitoringDomainsInput, Prisma.RequirementUncheckedUpdateWithoutMonitoringDomainsInput>;
};
export type RequirementUpdateWithoutMonitoringDomainsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
    framework?: Prisma.FrameworkUpdateOneRequiredWithoutRequirementsNestedInput;
    trustCriterion?: Prisma.TrustCriterionUpdateOneRequiredWithoutRequirementsNestedInput;
    pointsOfFocus?: Prisma.PointOfFocusUpdateManyWithoutRequirementNestedInput;
    relationsAsSource?: Prisma.RequirementRelationUpdateManyWithoutSourceRequirementNestedInput;
    relationsAsRelated?: Prisma.RequirementRelationUpdateManyWithoutRelatedRequirementNestedInput;
};
export type RequirementUncheckedUpdateWithoutMonitoringDomainsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterionId?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
    pointsOfFocus?: Prisma.PointOfFocusUncheckedUpdateManyWithoutRequirementNestedInput;
    relationsAsSource?: Prisma.RequirementRelationUncheckedUpdateManyWithoutSourceRequirementNestedInput;
    relationsAsRelated?: Prisma.RequirementRelationUncheckedUpdateManyWithoutRelatedRequirementNestedInput;
};
export type RequirementCreateManyFrameworkInput = {
    id?: string;
    trustCriterionId: string;
    code: string;
    tscCategory: string;
    criterion: string;
};
export type RequirementUpdateWithoutFrameworkInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterion?: Prisma.TrustCriterionUpdateOneRequiredWithoutRequirementsNestedInput;
    pointsOfFocus?: Prisma.PointOfFocusUpdateManyWithoutRequirementNestedInput;
    relationsAsSource?: Prisma.RequirementRelationUpdateManyWithoutSourceRequirementNestedInput;
    relationsAsRelated?: Prisma.RequirementRelationUpdateManyWithoutRelatedRequirementNestedInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUpdateManyWithoutRequirementNestedInput;
};
export type RequirementUncheckedUpdateWithoutFrameworkInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterionId?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
    pointsOfFocus?: Prisma.PointOfFocusUncheckedUpdateManyWithoutRequirementNestedInput;
    relationsAsSource?: Prisma.RequirementRelationUncheckedUpdateManyWithoutSourceRequirementNestedInput;
    relationsAsRelated?: Prisma.RequirementRelationUncheckedUpdateManyWithoutRelatedRequirementNestedInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUncheckedUpdateManyWithoutRequirementNestedInput;
};
export type RequirementUncheckedUpdateManyWithoutFrameworkInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterionId?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RequirementCreateManyTrustCriterionInput = {
    id?: string;
    frameworkId: string;
    code: string;
    tscCategory: string;
    criterion: string;
};
export type RequirementUpdateWithoutTrustCriterionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
    framework?: Prisma.FrameworkUpdateOneRequiredWithoutRequirementsNestedInput;
    pointsOfFocus?: Prisma.PointOfFocusUpdateManyWithoutRequirementNestedInput;
    relationsAsSource?: Prisma.RequirementRelationUpdateManyWithoutSourceRequirementNestedInput;
    relationsAsRelated?: Prisma.RequirementRelationUpdateManyWithoutRelatedRequirementNestedInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUpdateManyWithoutRequirementNestedInput;
};
export type RequirementUncheckedUpdateWithoutTrustCriterionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
    pointsOfFocus?: Prisma.PointOfFocusUncheckedUpdateManyWithoutRequirementNestedInput;
    relationsAsSource?: Prisma.RequirementRelationUncheckedUpdateManyWithoutSourceRequirementNestedInput;
    relationsAsRelated?: Prisma.RequirementRelationUncheckedUpdateManyWithoutRelatedRequirementNestedInput;
    monitoringDomains?: Prisma.MonitoringDomainRequirementUncheckedUpdateManyWithoutRequirementNestedInput;
};
export type RequirementUncheckedUpdateManyWithoutTrustCriterionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    tscCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RequirementCountOutputType = {
    pointsOfFocus: number;
    relationsAsSource: number;
    relationsAsRelated: number;
    monitoringDomains: number;
};
export type RequirementCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    pointsOfFocus?: boolean | RequirementCountOutputTypeCountPointsOfFocusArgs;
    relationsAsSource?: boolean | RequirementCountOutputTypeCountRelationsAsSourceArgs;
    relationsAsRelated?: boolean | RequirementCountOutputTypeCountRelationsAsRelatedArgs;
    monitoringDomains?: boolean | RequirementCountOutputTypeCountMonitoringDomainsArgs;
};
export type RequirementCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementCountOutputTypeSelect<ExtArgs> | null;
};
export type RequirementCountOutputTypeCountPointsOfFocusArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PointOfFocusWhereInput;
};
export type RequirementCountOutputTypeCountRelationsAsSourceArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RequirementRelationWhereInput;
};
export type RequirementCountOutputTypeCountRelationsAsRelatedArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RequirementRelationWhereInput;
};
export type RequirementCountOutputTypeCountMonitoringDomainsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MonitoringDomainRequirementWhereInput;
};
export type RequirementSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    frameworkId?: boolean;
    trustCriterionId?: boolean;
    code?: boolean;
    tscCategory?: boolean;
    criterion?: boolean;
    framework?: boolean | Prisma.FrameworkDefaultArgs<ExtArgs>;
    trustCriterion?: boolean | Prisma.TrustCriterionDefaultArgs<ExtArgs>;
    pointsOfFocus?: boolean | Prisma.Requirement$pointsOfFocusArgs<ExtArgs>;
    relationsAsSource?: boolean | Prisma.Requirement$relationsAsSourceArgs<ExtArgs>;
    relationsAsRelated?: boolean | Prisma.Requirement$relationsAsRelatedArgs<ExtArgs>;
    monitoringDomains?: boolean | Prisma.Requirement$monitoringDomainsArgs<ExtArgs>;
    _count?: boolean | Prisma.RequirementCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["requirement"]>;
export type RequirementSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    frameworkId?: boolean;
    trustCriterionId?: boolean;
    code?: boolean;
    tscCategory?: boolean;
    criterion?: boolean;
    framework?: boolean | Prisma.FrameworkDefaultArgs<ExtArgs>;
    trustCriterion?: boolean | Prisma.TrustCriterionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["requirement"]>;
export type RequirementSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    frameworkId?: boolean;
    trustCriterionId?: boolean;
    code?: boolean;
    tscCategory?: boolean;
    criterion?: boolean;
    framework?: boolean | Prisma.FrameworkDefaultArgs<ExtArgs>;
    trustCriterion?: boolean | Prisma.TrustCriterionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["requirement"]>;
export type RequirementSelectScalar = {
    id?: boolean;
    frameworkId?: boolean;
    trustCriterionId?: boolean;
    code?: boolean;
    tscCategory?: boolean;
    criterion?: boolean;
};
export type RequirementOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "frameworkId" | "trustCriterionId" | "code" | "tscCategory" | "criterion", ExtArgs["result"]["requirement"]>;
export type RequirementInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    framework?: boolean | Prisma.FrameworkDefaultArgs<ExtArgs>;
    trustCriterion?: boolean | Prisma.TrustCriterionDefaultArgs<ExtArgs>;
    pointsOfFocus?: boolean | Prisma.Requirement$pointsOfFocusArgs<ExtArgs>;
    relationsAsSource?: boolean | Prisma.Requirement$relationsAsSourceArgs<ExtArgs>;
    relationsAsRelated?: boolean | Prisma.Requirement$relationsAsRelatedArgs<ExtArgs>;
    monitoringDomains?: boolean | Prisma.Requirement$monitoringDomainsArgs<ExtArgs>;
    _count?: boolean | Prisma.RequirementCountOutputTypeDefaultArgs<ExtArgs>;
};
export type RequirementIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    framework?: boolean | Prisma.FrameworkDefaultArgs<ExtArgs>;
    trustCriterion?: boolean | Prisma.TrustCriterionDefaultArgs<ExtArgs>;
};
export type RequirementIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    framework?: boolean | Prisma.FrameworkDefaultArgs<ExtArgs>;
    trustCriterion?: boolean | Prisma.TrustCriterionDefaultArgs<ExtArgs>;
};
export type $RequirementPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Requirement";
    objects: {
        framework: Prisma.$FrameworkPayload<ExtArgs>;
        trustCriterion: Prisma.$TrustCriterionPayload<ExtArgs>;
        pointsOfFocus: Prisma.$PointOfFocusPayload<ExtArgs>[];
        relationsAsSource: Prisma.$RequirementRelationPayload<ExtArgs>[];
        relationsAsRelated: Prisma.$RequirementRelationPayload<ExtArgs>[];
        monitoringDomains: Prisma.$MonitoringDomainRequirementPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        frameworkId: string;
        trustCriterionId: string;
        code: string;
        tscCategory: string;
        criterion: string;
    }, ExtArgs["result"]["requirement"]>;
    composites: {};
};
export type RequirementGetPayload<S extends boolean | null | undefined | RequirementDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RequirementPayload, S>;
export type RequirementCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RequirementFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RequirementCountAggregateInputType | true;
};
export interface RequirementDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Requirement'];
        meta: {
            name: 'Requirement';
        };
    };
    findUnique<T extends RequirementFindUniqueArgs>(args: Prisma.SelectSubset<T, RequirementFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RequirementClient<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends RequirementFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RequirementFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RequirementClient<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends RequirementFindFirstArgs>(args?: Prisma.SelectSubset<T, RequirementFindFirstArgs<ExtArgs>>): Prisma.Prisma__RequirementClient<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends RequirementFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RequirementFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RequirementClient<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends RequirementFindManyArgs>(args?: Prisma.SelectSubset<T, RequirementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends RequirementCreateArgs>(args: Prisma.SelectSubset<T, RequirementCreateArgs<ExtArgs>>): Prisma.Prisma__RequirementClient<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends RequirementCreateManyArgs>(args?: Prisma.SelectSubset<T, RequirementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends RequirementCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RequirementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends RequirementDeleteArgs>(args: Prisma.SelectSubset<T, RequirementDeleteArgs<ExtArgs>>): Prisma.Prisma__RequirementClient<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends RequirementUpdateArgs>(args: Prisma.SelectSubset<T, RequirementUpdateArgs<ExtArgs>>): Prisma.Prisma__RequirementClient<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends RequirementDeleteManyArgs>(args?: Prisma.SelectSubset<T, RequirementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends RequirementUpdateManyArgs>(args: Prisma.SelectSubset<T, RequirementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends RequirementUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RequirementUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends RequirementUpsertArgs>(args: Prisma.SelectSubset<T, RequirementUpsertArgs<ExtArgs>>): Prisma.Prisma__RequirementClient<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends RequirementCountArgs>(args?: Prisma.Subset<T, RequirementCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RequirementCountAggregateOutputType> : number>;
    aggregate<T extends RequirementAggregateArgs>(args: Prisma.Subset<T, RequirementAggregateArgs>): Prisma.PrismaPromise<GetRequirementAggregateType<T>>;
    groupBy<T extends RequirementGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RequirementGroupByArgs['orderBy'];
    } : {
        orderBy?: RequirementGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RequirementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRequirementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: RequirementFieldRefs;
}
export interface Prisma__RequirementClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    framework<T extends Prisma.FrameworkDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.FrameworkDefaultArgs<ExtArgs>>): Prisma.Prisma__FrameworkClient<runtime.Types.Result.GetResult<Prisma.$FrameworkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    trustCriterion<T extends Prisma.TrustCriterionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TrustCriterionDefaultArgs<ExtArgs>>): Prisma.Prisma__TrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$TrustCriterionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    pointsOfFocus<T extends Prisma.Requirement$pointsOfFocusArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Requirement$pointsOfFocusArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PointOfFocusPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    relationsAsSource<T extends Prisma.Requirement$relationsAsSourceArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Requirement$relationsAsSourceArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RequirementRelationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    relationsAsRelated<T extends Prisma.Requirement$relationsAsRelatedArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Requirement$relationsAsRelatedArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RequirementRelationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    monitoringDomains<T extends Prisma.Requirement$monitoringDomainsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Requirement$monitoringDomainsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainRequirementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface RequirementFieldRefs {
    readonly id: Prisma.FieldRef<"Requirement", 'String'>;
    readonly frameworkId: Prisma.FieldRef<"Requirement", 'String'>;
    readonly trustCriterionId: Prisma.FieldRef<"Requirement", 'String'>;
    readonly code: Prisma.FieldRef<"Requirement", 'String'>;
    readonly tscCategory: Prisma.FieldRef<"Requirement", 'String'>;
    readonly criterion: Prisma.FieldRef<"Requirement", 'String'>;
}
export type RequirementFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementSelect<ExtArgs> | null;
    omit?: Prisma.RequirementOmit<ExtArgs> | null;
    include?: Prisma.RequirementInclude<ExtArgs> | null;
    where: Prisma.RequirementWhereUniqueInput;
};
export type RequirementFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementSelect<ExtArgs> | null;
    omit?: Prisma.RequirementOmit<ExtArgs> | null;
    include?: Prisma.RequirementInclude<ExtArgs> | null;
    where: Prisma.RequirementWhereUniqueInput;
};
export type RequirementFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementSelect<ExtArgs> | null;
    omit?: Prisma.RequirementOmit<ExtArgs> | null;
    include?: Prisma.RequirementInclude<ExtArgs> | null;
    where?: Prisma.RequirementWhereInput;
    orderBy?: Prisma.RequirementOrderByWithRelationInput | Prisma.RequirementOrderByWithRelationInput[];
    cursor?: Prisma.RequirementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RequirementScalarFieldEnum | Prisma.RequirementScalarFieldEnum[];
};
export type RequirementFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementSelect<ExtArgs> | null;
    omit?: Prisma.RequirementOmit<ExtArgs> | null;
    include?: Prisma.RequirementInclude<ExtArgs> | null;
    where?: Prisma.RequirementWhereInput;
    orderBy?: Prisma.RequirementOrderByWithRelationInput | Prisma.RequirementOrderByWithRelationInput[];
    cursor?: Prisma.RequirementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RequirementScalarFieldEnum | Prisma.RequirementScalarFieldEnum[];
};
export type RequirementFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementSelect<ExtArgs> | null;
    omit?: Prisma.RequirementOmit<ExtArgs> | null;
    include?: Prisma.RequirementInclude<ExtArgs> | null;
    where?: Prisma.RequirementWhereInput;
    orderBy?: Prisma.RequirementOrderByWithRelationInput | Prisma.RequirementOrderByWithRelationInput[];
    cursor?: Prisma.RequirementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RequirementScalarFieldEnum | Prisma.RequirementScalarFieldEnum[];
};
export type RequirementCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementSelect<ExtArgs> | null;
    omit?: Prisma.RequirementOmit<ExtArgs> | null;
    include?: Prisma.RequirementInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RequirementCreateInput, Prisma.RequirementUncheckedCreateInput>;
};
export type RequirementCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.RequirementCreateManyInput | Prisma.RequirementCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RequirementCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RequirementOmit<ExtArgs> | null;
    data: Prisma.RequirementCreateManyInput | Prisma.RequirementCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.RequirementIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type RequirementUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementSelect<ExtArgs> | null;
    omit?: Prisma.RequirementOmit<ExtArgs> | null;
    include?: Prisma.RequirementInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RequirementUpdateInput, Prisma.RequirementUncheckedUpdateInput>;
    where: Prisma.RequirementWhereUniqueInput;
};
export type RequirementUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.RequirementUpdateManyMutationInput, Prisma.RequirementUncheckedUpdateManyInput>;
    where?: Prisma.RequirementWhereInput;
    limit?: number;
};
export type RequirementUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RequirementOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RequirementUpdateManyMutationInput, Prisma.RequirementUncheckedUpdateManyInput>;
    where?: Prisma.RequirementWhereInput;
    limit?: number;
    include?: Prisma.RequirementIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type RequirementUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementSelect<ExtArgs> | null;
    omit?: Prisma.RequirementOmit<ExtArgs> | null;
    include?: Prisma.RequirementInclude<ExtArgs> | null;
    where: Prisma.RequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.RequirementCreateInput, Prisma.RequirementUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.RequirementUpdateInput, Prisma.RequirementUncheckedUpdateInput>;
};
export type RequirementDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementSelect<ExtArgs> | null;
    omit?: Prisma.RequirementOmit<ExtArgs> | null;
    include?: Prisma.RequirementInclude<ExtArgs> | null;
    where: Prisma.RequirementWhereUniqueInput;
};
export type RequirementDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RequirementWhereInput;
    limit?: number;
};
export type Requirement$pointsOfFocusArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusInclude<ExtArgs> | null;
    where?: Prisma.PointOfFocusWhereInput;
    orderBy?: Prisma.PointOfFocusOrderByWithRelationInput | Prisma.PointOfFocusOrderByWithRelationInput[];
    cursor?: Prisma.PointOfFocusWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PointOfFocusScalarFieldEnum | Prisma.PointOfFocusScalarFieldEnum[];
};
export type Requirement$relationsAsSourceArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementRelationSelect<ExtArgs> | null;
    omit?: Prisma.RequirementRelationOmit<ExtArgs> | null;
    include?: Prisma.RequirementRelationInclude<ExtArgs> | null;
    where?: Prisma.RequirementRelationWhereInput;
    orderBy?: Prisma.RequirementRelationOrderByWithRelationInput | Prisma.RequirementRelationOrderByWithRelationInput[];
    cursor?: Prisma.RequirementRelationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RequirementRelationScalarFieldEnum | Prisma.RequirementRelationScalarFieldEnum[];
};
export type Requirement$relationsAsRelatedArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementRelationSelect<ExtArgs> | null;
    omit?: Prisma.RequirementRelationOmit<ExtArgs> | null;
    include?: Prisma.RequirementRelationInclude<ExtArgs> | null;
    where?: Prisma.RequirementRelationWhereInput;
    orderBy?: Prisma.RequirementRelationOrderByWithRelationInput | Prisma.RequirementRelationOrderByWithRelationInput[];
    cursor?: Prisma.RequirementRelationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RequirementRelationScalarFieldEnum | Prisma.RequirementRelationScalarFieldEnum[];
};
export type Requirement$monitoringDomainsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainRequirementSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainRequirementOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainRequirementInclude<ExtArgs> | null;
    where?: Prisma.MonitoringDomainRequirementWhereInput;
    orderBy?: Prisma.MonitoringDomainRequirementOrderByWithRelationInput | Prisma.MonitoringDomainRequirementOrderByWithRelationInput[];
    cursor?: Prisma.MonitoringDomainRequirementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MonitoringDomainRequirementScalarFieldEnum | Prisma.MonitoringDomainRequirementScalarFieldEnum[];
};
export type RequirementDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementSelect<ExtArgs> | null;
    omit?: Prisma.RequirementOmit<ExtArgs> | null;
    include?: Prisma.RequirementInclude<ExtArgs> | null;
};
export {};
