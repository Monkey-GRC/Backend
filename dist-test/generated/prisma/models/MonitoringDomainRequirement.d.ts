import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type MonitoringDomainRequirementModel = runtime.Types.Result.DefaultSelection<Prisma.$MonitoringDomainRequirementPayload>;
export type AggregateMonitoringDomainRequirement = {
    _count: MonitoringDomainRequirementCountAggregateOutputType | null;
    _min: MonitoringDomainRequirementMinAggregateOutputType | null;
    _max: MonitoringDomainRequirementMaxAggregateOutputType | null;
};
export type MonitoringDomainRequirementMinAggregateOutputType = {
    id: string | null;
    monitoringDomainId: string | null;
    requirementId: string | null;
};
export type MonitoringDomainRequirementMaxAggregateOutputType = {
    id: string | null;
    monitoringDomainId: string | null;
    requirementId: string | null;
};
export type MonitoringDomainRequirementCountAggregateOutputType = {
    id: number;
    monitoringDomainId: number;
    requirementId: number;
    _all: number;
};
export type MonitoringDomainRequirementMinAggregateInputType = {
    id?: true;
    monitoringDomainId?: true;
    requirementId?: true;
};
export type MonitoringDomainRequirementMaxAggregateInputType = {
    id?: true;
    monitoringDomainId?: true;
    requirementId?: true;
};
export type MonitoringDomainRequirementCountAggregateInputType = {
    id?: true;
    monitoringDomainId?: true;
    requirementId?: true;
    _all?: true;
};
export type MonitoringDomainRequirementAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MonitoringDomainRequirementWhereInput;
    orderBy?: Prisma.MonitoringDomainRequirementOrderByWithRelationInput | Prisma.MonitoringDomainRequirementOrderByWithRelationInput[];
    cursor?: Prisma.MonitoringDomainRequirementWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | MonitoringDomainRequirementCountAggregateInputType;
    _min?: MonitoringDomainRequirementMinAggregateInputType;
    _max?: MonitoringDomainRequirementMaxAggregateInputType;
};
export type GetMonitoringDomainRequirementAggregateType<T extends MonitoringDomainRequirementAggregateArgs> = {
    [P in keyof T & keyof AggregateMonitoringDomainRequirement]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMonitoringDomainRequirement[P]> : Prisma.GetScalarType<T[P], AggregateMonitoringDomainRequirement[P]>;
};
export type MonitoringDomainRequirementGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MonitoringDomainRequirementWhereInput;
    orderBy?: Prisma.MonitoringDomainRequirementOrderByWithAggregationInput | Prisma.MonitoringDomainRequirementOrderByWithAggregationInput[];
    by: Prisma.MonitoringDomainRequirementScalarFieldEnum[] | Prisma.MonitoringDomainRequirementScalarFieldEnum;
    having?: Prisma.MonitoringDomainRequirementScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MonitoringDomainRequirementCountAggregateInputType | true;
    _min?: MonitoringDomainRequirementMinAggregateInputType;
    _max?: MonitoringDomainRequirementMaxAggregateInputType;
};
export type MonitoringDomainRequirementGroupByOutputType = {
    id: string;
    monitoringDomainId: string;
    requirementId: string;
    _count: MonitoringDomainRequirementCountAggregateOutputType | null;
    _min: MonitoringDomainRequirementMinAggregateOutputType | null;
    _max: MonitoringDomainRequirementMaxAggregateOutputType | null;
};
type GetMonitoringDomainRequirementGroupByPayload<T extends MonitoringDomainRequirementGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MonitoringDomainRequirementGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MonitoringDomainRequirementGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MonitoringDomainRequirementGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MonitoringDomainRequirementGroupByOutputType[P]>;
}>>;
export type MonitoringDomainRequirementWhereInput = {
    AND?: Prisma.MonitoringDomainRequirementWhereInput | Prisma.MonitoringDomainRequirementWhereInput[];
    OR?: Prisma.MonitoringDomainRequirementWhereInput[];
    NOT?: Prisma.MonitoringDomainRequirementWhereInput | Prisma.MonitoringDomainRequirementWhereInput[];
    id?: Prisma.UuidFilter<"MonitoringDomainRequirement"> | string;
    monitoringDomainId?: Prisma.UuidFilter<"MonitoringDomainRequirement"> | string;
    requirementId?: Prisma.UuidFilter<"MonitoringDomainRequirement"> | string;
    monitoringDomain?: Prisma.XOR<Prisma.MonitoringDomainScalarRelationFilter, Prisma.MonitoringDomainWhereInput>;
    requirement?: Prisma.XOR<Prisma.RequirementScalarRelationFilter, Prisma.RequirementWhereInput>;
};
export type MonitoringDomainRequirementOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    monitoringDomainId?: Prisma.SortOrder;
    requirementId?: Prisma.SortOrder;
    monitoringDomain?: Prisma.MonitoringDomainOrderByWithRelationInput;
    requirement?: Prisma.RequirementOrderByWithRelationInput;
};
export type MonitoringDomainRequirementWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    monitoringDomainId_requirementId?: Prisma.MonitoringDomainRequirementMonitoringDomainIdRequirementIdCompoundUniqueInput;
    AND?: Prisma.MonitoringDomainRequirementWhereInput | Prisma.MonitoringDomainRequirementWhereInput[];
    OR?: Prisma.MonitoringDomainRequirementWhereInput[];
    NOT?: Prisma.MonitoringDomainRequirementWhereInput | Prisma.MonitoringDomainRequirementWhereInput[];
    monitoringDomainId?: Prisma.UuidFilter<"MonitoringDomainRequirement"> | string;
    requirementId?: Prisma.UuidFilter<"MonitoringDomainRequirement"> | string;
    monitoringDomain?: Prisma.XOR<Prisma.MonitoringDomainScalarRelationFilter, Prisma.MonitoringDomainWhereInput>;
    requirement?: Prisma.XOR<Prisma.RequirementScalarRelationFilter, Prisma.RequirementWhereInput>;
}, "id" | "monitoringDomainId_requirementId">;
export type MonitoringDomainRequirementOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    monitoringDomainId?: Prisma.SortOrder;
    requirementId?: Prisma.SortOrder;
    _count?: Prisma.MonitoringDomainRequirementCountOrderByAggregateInput;
    _max?: Prisma.MonitoringDomainRequirementMaxOrderByAggregateInput;
    _min?: Prisma.MonitoringDomainRequirementMinOrderByAggregateInput;
};
export type MonitoringDomainRequirementScalarWhereWithAggregatesInput = {
    AND?: Prisma.MonitoringDomainRequirementScalarWhereWithAggregatesInput | Prisma.MonitoringDomainRequirementScalarWhereWithAggregatesInput[];
    OR?: Prisma.MonitoringDomainRequirementScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MonitoringDomainRequirementScalarWhereWithAggregatesInput | Prisma.MonitoringDomainRequirementScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"MonitoringDomainRequirement"> | string;
    monitoringDomainId?: Prisma.UuidWithAggregatesFilter<"MonitoringDomainRequirement"> | string;
    requirementId?: Prisma.UuidWithAggregatesFilter<"MonitoringDomainRequirement"> | string;
};
export type MonitoringDomainRequirementCreateInput = {
    id?: string;
    monitoringDomain: Prisma.MonitoringDomainCreateNestedOneWithoutRequirementsInput;
    requirement: Prisma.RequirementCreateNestedOneWithoutMonitoringDomainsInput;
};
export type MonitoringDomainRequirementUncheckedCreateInput = {
    id?: string;
    monitoringDomainId: string;
    requirementId: string;
};
export type MonitoringDomainRequirementUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomain?: Prisma.MonitoringDomainUpdateOneRequiredWithoutRequirementsNestedInput;
    requirement?: Prisma.RequirementUpdateOneRequiredWithoutMonitoringDomainsNestedInput;
};
export type MonitoringDomainRequirementUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomainId?: Prisma.StringFieldUpdateOperationsInput | string;
    requirementId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainRequirementCreateManyInput = {
    id?: string;
    monitoringDomainId: string;
    requirementId: string;
};
export type MonitoringDomainRequirementUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainRequirementUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomainId?: Prisma.StringFieldUpdateOperationsInput | string;
    requirementId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainRequirementListRelationFilter = {
    every?: Prisma.MonitoringDomainRequirementWhereInput;
    some?: Prisma.MonitoringDomainRequirementWhereInput;
    none?: Prisma.MonitoringDomainRequirementWhereInput;
};
export type MonitoringDomainRequirementOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type MonitoringDomainRequirementMonitoringDomainIdRequirementIdCompoundUniqueInput = {
    monitoringDomainId: string;
    requirementId: string;
};
export type MonitoringDomainRequirementCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    monitoringDomainId?: Prisma.SortOrder;
    requirementId?: Prisma.SortOrder;
};
export type MonitoringDomainRequirementMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    monitoringDomainId?: Prisma.SortOrder;
    requirementId?: Prisma.SortOrder;
};
export type MonitoringDomainRequirementMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    monitoringDomainId?: Prisma.SortOrder;
    requirementId?: Prisma.SortOrder;
};
export type MonitoringDomainRequirementCreateNestedManyWithoutRequirementInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainRequirementCreateWithoutRequirementInput, Prisma.MonitoringDomainRequirementUncheckedCreateWithoutRequirementInput> | Prisma.MonitoringDomainRequirementCreateWithoutRequirementInput[] | Prisma.MonitoringDomainRequirementUncheckedCreateWithoutRequirementInput[];
    connectOrCreate?: Prisma.MonitoringDomainRequirementCreateOrConnectWithoutRequirementInput | Prisma.MonitoringDomainRequirementCreateOrConnectWithoutRequirementInput[];
    createMany?: Prisma.MonitoringDomainRequirementCreateManyRequirementInputEnvelope;
    connect?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
};
export type MonitoringDomainRequirementUncheckedCreateNestedManyWithoutRequirementInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainRequirementCreateWithoutRequirementInput, Prisma.MonitoringDomainRequirementUncheckedCreateWithoutRequirementInput> | Prisma.MonitoringDomainRequirementCreateWithoutRequirementInput[] | Prisma.MonitoringDomainRequirementUncheckedCreateWithoutRequirementInput[];
    connectOrCreate?: Prisma.MonitoringDomainRequirementCreateOrConnectWithoutRequirementInput | Prisma.MonitoringDomainRequirementCreateOrConnectWithoutRequirementInput[];
    createMany?: Prisma.MonitoringDomainRequirementCreateManyRequirementInputEnvelope;
    connect?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
};
export type MonitoringDomainRequirementUpdateManyWithoutRequirementNestedInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainRequirementCreateWithoutRequirementInput, Prisma.MonitoringDomainRequirementUncheckedCreateWithoutRequirementInput> | Prisma.MonitoringDomainRequirementCreateWithoutRequirementInput[] | Prisma.MonitoringDomainRequirementUncheckedCreateWithoutRequirementInput[];
    connectOrCreate?: Prisma.MonitoringDomainRequirementCreateOrConnectWithoutRequirementInput | Prisma.MonitoringDomainRequirementCreateOrConnectWithoutRequirementInput[];
    upsert?: Prisma.MonitoringDomainRequirementUpsertWithWhereUniqueWithoutRequirementInput | Prisma.MonitoringDomainRequirementUpsertWithWhereUniqueWithoutRequirementInput[];
    createMany?: Prisma.MonitoringDomainRequirementCreateManyRequirementInputEnvelope;
    set?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    disconnect?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    delete?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    connect?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    update?: Prisma.MonitoringDomainRequirementUpdateWithWhereUniqueWithoutRequirementInput | Prisma.MonitoringDomainRequirementUpdateWithWhereUniqueWithoutRequirementInput[];
    updateMany?: Prisma.MonitoringDomainRequirementUpdateManyWithWhereWithoutRequirementInput | Prisma.MonitoringDomainRequirementUpdateManyWithWhereWithoutRequirementInput[];
    deleteMany?: Prisma.MonitoringDomainRequirementScalarWhereInput | Prisma.MonitoringDomainRequirementScalarWhereInput[];
};
export type MonitoringDomainRequirementUncheckedUpdateManyWithoutRequirementNestedInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainRequirementCreateWithoutRequirementInput, Prisma.MonitoringDomainRequirementUncheckedCreateWithoutRequirementInput> | Prisma.MonitoringDomainRequirementCreateWithoutRequirementInput[] | Prisma.MonitoringDomainRequirementUncheckedCreateWithoutRequirementInput[];
    connectOrCreate?: Prisma.MonitoringDomainRequirementCreateOrConnectWithoutRequirementInput | Prisma.MonitoringDomainRequirementCreateOrConnectWithoutRequirementInput[];
    upsert?: Prisma.MonitoringDomainRequirementUpsertWithWhereUniqueWithoutRequirementInput | Prisma.MonitoringDomainRequirementUpsertWithWhereUniqueWithoutRequirementInput[];
    createMany?: Prisma.MonitoringDomainRequirementCreateManyRequirementInputEnvelope;
    set?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    disconnect?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    delete?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    connect?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    update?: Prisma.MonitoringDomainRequirementUpdateWithWhereUniqueWithoutRequirementInput | Prisma.MonitoringDomainRequirementUpdateWithWhereUniqueWithoutRequirementInput[];
    updateMany?: Prisma.MonitoringDomainRequirementUpdateManyWithWhereWithoutRequirementInput | Prisma.MonitoringDomainRequirementUpdateManyWithWhereWithoutRequirementInput[];
    deleteMany?: Prisma.MonitoringDomainRequirementScalarWhereInput | Prisma.MonitoringDomainRequirementScalarWhereInput[];
};
export type MonitoringDomainRequirementCreateNestedManyWithoutMonitoringDomainInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainRequirementCreateWithoutMonitoringDomainInput, Prisma.MonitoringDomainRequirementUncheckedCreateWithoutMonitoringDomainInput> | Prisma.MonitoringDomainRequirementCreateWithoutMonitoringDomainInput[] | Prisma.MonitoringDomainRequirementUncheckedCreateWithoutMonitoringDomainInput[];
    connectOrCreate?: Prisma.MonitoringDomainRequirementCreateOrConnectWithoutMonitoringDomainInput | Prisma.MonitoringDomainRequirementCreateOrConnectWithoutMonitoringDomainInput[];
    createMany?: Prisma.MonitoringDomainRequirementCreateManyMonitoringDomainInputEnvelope;
    connect?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
};
export type MonitoringDomainRequirementUncheckedCreateNestedManyWithoutMonitoringDomainInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainRequirementCreateWithoutMonitoringDomainInput, Prisma.MonitoringDomainRequirementUncheckedCreateWithoutMonitoringDomainInput> | Prisma.MonitoringDomainRequirementCreateWithoutMonitoringDomainInput[] | Prisma.MonitoringDomainRequirementUncheckedCreateWithoutMonitoringDomainInput[];
    connectOrCreate?: Prisma.MonitoringDomainRequirementCreateOrConnectWithoutMonitoringDomainInput | Prisma.MonitoringDomainRequirementCreateOrConnectWithoutMonitoringDomainInput[];
    createMany?: Prisma.MonitoringDomainRequirementCreateManyMonitoringDomainInputEnvelope;
    connect?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
};
export type MonitoringDomainRequirementUpdateManyWithoutMonitoringDomainNestedInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainRequirementCreateWithoutMonitoringDomainInput, Prisma.MonitoringDomainRequirementUncheckedCreateWithoutMonitoringDomainInput> | Prisma.MonitoringDomainRequirementCreateWithoutMonitoringDomainInput[] | Prisma.MonitoringDomainRequirementUncheckedCreateWithoutMonitoringDomainInput[];
    connectOrCreate?: Prisma.MonitoringDomainRequirementCreateOrConnectWithoutMonitoringDomainInput | Prisma.MonitoringDomainRequirementCreateOrConnectWithoutMonitoringDomainInput[];
    upsert?: Prisma.MonitoringDomainRequirementUpsertWithWhereUniqueWithoutMonitoringDomainInput | Prisma.MonitoringDomainRequirementUpsertWithWhereUniqueWithoutMonitoringDomainInput[];
    createMany?: Prisma.MonitoringDomainRequirementCreateManyMonitoringDomainInputEnvelope;
    set?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    disconnect?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    delete?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    connect?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    update?: Prisma.MonitoringDomainRequirementUpdateWithWhereUniqueWithoutMonitoringDomainInput | Prisma.MonitoringDomainRequirementUpdateWithWhereUniqueWithoutMonitoringDomainInput[];
    updateMany?: Prisma.MonitoringDomainRequirementUpdateManyWithWhereWithoutMonitoringDomainInput | Prisma.MonitoringDomainRequirementUpdateManyWithWhereWithoutMonitoringDomainInput[];
    deleteMany?: Prisma.MonitoringDomainRequirementScalarWhereInput | Prisma.MonitoringDomainRequirementScalarWhereInput[];
};
export type MonitoringDomainRequirementUncheckedUpdateManyWithoutMonitoringDomainNestedInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainRequirementCreateWithoutMonitoringDomainInput, Prisma.MonitoringDomainRequirementUncheckedCreateWithoutMonitoringDomainInput> | Prisma.MonitoringDomainRequirementCreateWithoutMonitoringDomainInput[] | Prisma.MonitoringDomainRequirementUncheckedCreateWithoutMonitoringDomainInput[];
    connectOrCreate?: Prisma.MonitoringDomainRequirementCreateOrConnectWithoutMonitoringDomainInput | Prisma.MonitoringDomainRequirementCreateOrConnectWithoutMonitoringDomainInput[];
    upsert?: Prisma.MonitoringDomainRequirementUpsertWithWhereUniqueWithoutMonitoringDomainInput | Prisma.MonitoringDomainRequirementUpsertWithWhereUniqueWithoutMonitoringDomainInput[];
    createMany?: Prisma.MonitoringDomainRequirementCreateManyMonitoringDomainInputEnvelope;
    set?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    disconnect?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    delete?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    connect?: Prisma.MonitoringDomainRequirementWhereUniqueInput | Prisma.MonitoringDomainRequirementWhereUniqueInput[];
    update?: Prisma.MonitoringDomainRequirementUpdateWithWhereUniqueWithoutMonitoringDomainInput | Prisma.MonitoringDomainRequirementUpdateWithWhereUniqueWithoutMonitoringDomainInput[];
    updateMany?: Prisma.MonitoringDomainRequirementUpdateManyWithWhereWithoutMonitoringDomainInput | Prisma.MonitoringDomainRequirementUpdateManyWithWhereWithoutMonitoringDomainInput[];
    deleteMany?: Prisma.MonitoringDomainRequirementScalarWhereInput | Prisma.MonitoringDomainRequirementScalarWhereInput[];
};
export type MonitoringDomainRequirementCreateWithoutRequirementInput = {
    id?: string;
    monitoringDomain: Prisma.MonitoringDomainCreateNestedOneWithoutRequirementsInput;
};
export type MonitoringDomainRequirementUncheckedCreateWithoutRequirementInput = {
    id?: string;
    monitoringDomainId: string;
};
export type MonitoringDomainRequirementCreateOrConnectWithoutRequirementInput = {
    where: Prisma.MonitoringDomainRequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.MonitoringDomainRequirementCreateWithoutRequirementInput, Prisma.MonitoringDomainRequirementUncheckedCreateWithoutRequirementInput>;
};
export type MonitoringDomainRequirementCreateManyRequirementInputEnvelope = {
    data: Prisma.MonitoringDomainRequirementCreateManyRequirementInput | Prisma.MonitoringDomainRequirementCreateManyRequirementInput[];
    skipDuplicates?: boolean;
};
export type MonitoringDomainRequirementUpsertWithWhereUniqueWithoutRequirementInput = {
    where: Prisma.MonitoringDomainRequirementWhereUniqueInput;
    update: Prisma.XOR<Prisma.MonitoringDomainRequirementUpdateWithoutRequirementInput, Prisma.MonitoringDomainRequirementUncheckedUpdateWithoutRequirementInput>;
    create: Prisma.XOR<Prisma.MonitoringDomainRequirementCreateWithoutRequirementInput, Prisma.MonitoringDomainRequirementUncheckedCreateWithoutRequirementInput>;
};
export type MonitoringDomainRequirementUpdateWithWhereUniqueWithoutRequirementInput = {
    where: Prisma.MonitoringDomainRequirementWhereUniqueInput;
    data: Prisma.XOR<Prisma.MonitoringDomainRequirementUpdateWithoutRequirementInput, Prisma.MonitoringDomainRequirementUncheckedUpdateWithoutRequirementInput>;
};
export type MonitoringDomainRequirementUpdateManyWithWhereWithoutRequirementInput = {
    where: Prisma.MonitoringDomainRequirementScalarWhereInput;
    data: Prisma.XOR<Prisma.MonitoringDomainRequirementUpdateManyMutationInput, Prisma.MonitoringDomainRequirementUncheckedUpdateManyWithoutRequirementInput>;
};
export type MonitoringDomainRequirementScalarWhereInput = {
    AND?: Prisma.MonitoringDomainRequirementScalarWhereInput | Prisma.MonitoringDomainRequirementScalarWhereInput[];
    OR?: Prisma.MonitoringDomainRequirementScalarWhereInput[];
    NOT?: Prisma.MonitoringDomainRequirementScalarWhereInput | Prisma.MonitoringDomainRequirementScalarWhereInput[];
    id?: Prisma.UuidFilter<"MonitoringDomainRequirement"> | string;
    monitoringDomainId?: Prisma.UuidFilter<"MonitoringDomainRequirement"> | string;
    requirementId?: Prisma.UuidFilter<"MonitoringDomainRequirement"> | string;
};
export type MonitoringDomainRequirementCreateWithoutMonitoringDomainInput = {
    id?: string;
    requirement: Prisma.RequirementCreateNestedOneWithoutMonitoringDomainsInput;
};
export type MonitoringDomainRequirementUncheckedCreateWithoutMonitoringDomainInput = {
    id?: string;
    requirementId: string;
};
export type MonitoringDomainRequirementCreateOrConnectWithoutMonitoringDomainInput = {
    where: Prisma.MonitoringDomainRequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.MonitoringDomainRequirementCreateWithoutMonitoringDomainInput, Prisma.MonitoringDomainRequirementUncheckedCreateWithoutMonitoringDomainInput>;
};
export type MonitoringDomainRequirementCreateManyMonitoringDomainInputEnvelope = {
    data: Prisma.MonitoringDomainRequirementCreateManyMonitoringDomainInput | Prisma.MonitoringDomainRequirementCreateManyMonitoringDomainInput[];
    skipDuplicates?: boolean;
};
export type MonitoringDomainRequirementUpsertWithWhereUniqueWithoutMonitoringDomainInput = {
    where: Prisma.MonitoringDomainRequirementWhereUniqueInput;
    update: Prisma.XOR<Prisma.MonitoringDomainRequirementUpdateWithoutMonitoringDomainInput, Prisma.MonitoringDomainRequirementUncheckedUpdateWithoutMonitoringDomainInput>;
    create: Prisma.XOR<Prisma.MonitoringDomainRequirementCreateWithoutMonitoringDomainInput, Prisma.MonitoringDomainRequirementUncheckedCreateWithoutMonitoringDomainInput>;
};
export type MonitoringDomainRequirementUpdateWithWhereUniqueWithoutMonitoringDomainInput = {
    where: Prisma.MonitoringDomainRequirementWhereUniqueInput;
    data: Prisma.XOR<Prisma.MonitoringDomainRequirementUpdateWithoutMonitoringDomainInput, Prisma.MonitoringDomainRequirementUncheckedUpdateWithoutMonitoringDomainInput>;
};
export type MonitoringDomainRequirementUpdateManyWithWhereWithoutMonitoringDomainInput = {
    where: Prisma.MonitoringDomainRequirementScalarWhereInput;
    data: Prisma.XOR<Prisma.MonitoringDomainRequirementUpdateManyMutationInput, Prisma.MonitoringDomainRequirementUncheckedUpdateManyWithoutMonitoringDomainInput>;
};
export type MonitoringDomainRequirementCreateManyRequirementInput = {
    id?: string;
    monitoringDomainId: string;
};
export type MonitoringDomainRequirementUpdateWithoutRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomain?: Prisma.MonitoringDomainUpdateOneRequiredWithoutRequirementsNestedInput;
};
export type MonitoringDomainRequirementUncheckedUpdateWithoutRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomainId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainRequirementUncheckedUpdateManyWithoutRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomainId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainRequirementCreateManyMonitoringDomainInput = {
    id?: string;
    requirementId: string;
};
export type MonitoringDomainRequirementUpdateWithoutMonitoringDomainInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    requirement?: Prisma.RequirementUpdateOneRequiredWithoutMonitoringDomainsNestedInput;
};
export type MonitoringDomainRequirementUncheckedUpdateWithoutMonitoringDomainInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    requirementId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainRequirementUncheckedUpdateManyWithoutMonitoringDomainInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    requirementId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainRequirementSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    monitoringDomainId?: boolean;
    requirementId?: boolean;
    monitoringDomain?: boolean | Prisma.MonitoringDomainDefaultArgs<ExtArgs>;
    requirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["monitoringDomainRequirement"]>;
export type MonitoringDomainRequirementSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    monitoringDomainId?: boolean;
    requirementId?: boolean;
    monitoringDomain?: boolean | Prisma.MonitoringDomainDefaultArgs<ExtArgs>;
    requirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["monitoringDomainRequirement"]>;
export type MonitoringDomainRequirementSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    monitoringDomainId?: boolean;
    requirementId?: boolean;
    monitoringDomain?: boolean | Prisma.MonitoringDomainDefaultArgs<ExtArgs>;
    requirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["monitoringDomainRequirement"]>;
export type MonitoringDomainRequirementSelectScalar = {
    id?: boolean;
    monitoringDomainId?: boolean;
    requirementId?: boolean;
};
export type MonitoringDomainRequirementOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "monitoringDomainId" | "requirementId", ExtArgs["result"]["monitoringDomainRequirement"]>;
export type MonitoringDomainRequirementInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    monitoringDomain?: boolean | Prisma.MonitoringDomainDefaultArgs<ExtArgs>;
    requirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
};
export type MonitoringDomainRequirementIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    monitoringDomain?: boolean | Prisma.MonitoringDomainDefaultArgs<ExtArgs>;
    requirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
};
export type MonitoringDomainRequirementIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    monitoringDomain?: boolean | Prisma.MonitoringDomainDefaultArgs<ExtArgs>;
    requirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
};
export type $MonitoringDomainRequirementPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "MonitoringDomainRequirement";
    objects: {
        monitoringDomain: Prisma.$MonitoringDomainPayload<ExtArgs>;
        requirement: Prisma.$RequirementPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        monitoringDomainId: string;
        requirementId: string;
    }, ExtArgs["result"]["monitoringDomainRequirement"]>;
    composites: {};
};
export type MonitoringDomainRequirementGetPayload<S extends boolean | null | undefined | MonitoringDomainRequirementDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MonitoringDomainRequirementPayload, S>;
export type MonitoringDomainRequirementCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MonitoringDomainRequirementFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MonitoringDomainRequirementCountAggregateInputType | true;
};
export interface MonitoringDomainRequirementDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['MonitoringDomainRequirement'];
        meta: {
            name: 'MonitoringDomainRequirement';
        };
    };
    findUnique<T extends MonitoringDomainRequirementFindUniqueArgs>(args: Prisma.SelectSubset<T, MonitoringDomainRequirementFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainRequirementClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainRequirementPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends MonitoringDomainRequirementFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MonitoringDomainRequirementFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainRequirementClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainRequirementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends MonitoringDomainRequirementFindFirstArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainRequirementFindFirstArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainRequirementClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainRequirementPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends MonitoringDomainRequirementFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainRequirementFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainRequirementClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainRequirementPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends MonitoringDomainRequirementFindManyArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainRequirementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainRequirementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends MonitoringDomainRequirementCreateArgs>(args: Prisma.SelectSubset<T, MonitoringDomainRequirementCreateArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainRequirementClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainRequirementPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends MonitoringDomainRequirementCreateManyArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainRequirementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends MonitoringDomainRequirementCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainRequirementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainRequirementPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends MonitoringDomainRequirementDeleteArgs>(args: Prisma.SelectSubset<T, MonitoringDomainRequirementDeleteArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainRequirementClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainRequirementPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends MonitoringDomainRequirementUpdateArgs>(args: Prisma.SelectSubset<T, MonitoringDomainRequirementUpdateArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainRequirementClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainRequirementPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends MonitoringDomainRequirementDeleteManyArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainRequirementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends MonitoringDomainRequirementUpdateManyArgs>(args: Prisma.SelectSubset<T, MonitoringDomainRequirementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends MonitoringDomainRequirementUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MonitoringDomainRequirementUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainRequirementPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends MonitoringDomainRequirementUpsertArgs>(args: Prisma.SelectSubset<T, MonitoringDomainRequirementUpsertArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainRequirementClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainRequirementPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends MonitoringDomainRequirementCountArgs>(args?: Prisma.Subset<T, MonitoringDomainRequirementCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MonitoringDomainRequirementCountAggregateOutputType> : number>;
    aggregate<T extends MonitoringDomainRequirementAggregateArgs>(args: Prisma.Subset<T, MonitoringDomainRequirementAggregateArgs>): Prisma.PrismaPromise<GetMonitoringDomainRequirementAggregateType<T>>;
    groupBy<T extends MonitoringDomainRequirementGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MonitoringDomainRequirementGroupByArgs['orderBy'];
    } : {
        orderBy?: MonitoringDomainRequirementGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MonitoringDomainRequirementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMonitoringDomainRequirementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: MonitoringDomainRequirementFieldRefs;
}
export interface Prisma__MonitoringDomainRequirementClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    monitoringDomain<T extends Prisma.MonitoringDomainDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MonitoringDomainDefaultArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    requirement<T extends Prisma.RequirementDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RequirementDefaultArgs<ExtArgs>>): Prisma.Prisma__RequirementClient<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface MonitoringDomainRequirementFieldRefs {
    readonly id: Prisma.FieldRef<"MonitoringDomainRequirement", 'String'>;
    readonly monitoringDomainId: Prisma.FieldRef<"MonitoringDomainRequirement", 'String'>;
    readonly requirementId: Prisma.FieldRef<"MonitoringDomainRequirement", 'String'>;
}
export type MonitoringDomainRequirementFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainRequirementSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainRequirementOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainRequirementInclude<ExtArgs> | null;
    where: Prisma.MonitoringDomainRequirementWhereUniqueInput;
};
export type MonitoringDomainRequirementFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainRequirementSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainRequirementOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainRequirementInclude<ExtArgs> | null;
    where: Prisma.MonitoringDomainRequirementWhereUniqueInput;
};
export type MonitoringDomainRequirementFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type MonitoringDomainRequirementFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type MonitoringDomainRequirementFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type MonitoringDomainRequirementCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainRequirementSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainRequirementOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainRequirementInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MonitoringDomainRequirementCreateInput, Prisma.MonitoringDomainRequirementUncheckedCreateInput>;
};
export type MonitoringDomainRequirementCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.MonitoringDomainRequirementCreateManyInput | Prisma.MonitoringDomainRequirementCreateManyInput[];
    skipDuplicates?: boolean;
};
export type MonitoringDomainRequirementCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainRequirementSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainRequirementOmit<ExtArgs> | null;
    data: Prisma.MonitoringDomainRequirementCreateManyInput | Prisma.MonitoringDomainRequirementCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.MonitoringDomainRequirementIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type MonitoringDomainRequirementUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainRequirementSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainRequirementOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainRequirementInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MonitoringDomainRequirementUpdateInput, Prisma.MonitoringDomainRequirementUncheckedUpdateInput>;
    where: Prisma.MonitoringDomainRequirementWhereUniqueInput;
};
export type MonitoringDomainRequirementUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.MonitoringDomainRequirementUpdateManyMutationInput, Prisma.MonitoringDomainRequirementUncheckedUpdateManyInput>;
    where?: Prisma.MonitoringDomainRequirementWhereInput;
    limit?: number;
};
export type MonitoringDomainRequirementUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainRequirementSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainRequirementOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MonitoringDomainRequirementUpdateManyMutationInput, Prisma.MonitoringDomainRequirementUncheckedUpdateManyInput>;
    where?: Prisma.MonitoringDomainRequirementWhereInput;
    limit?: number;
    include?: Prisma.MonitoringDomainRequirementIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type MonitoringDomainRequirementUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainRequirementSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainRequirementOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainRequirementInclude<ExtArgs> | null;
    where: Prisma.MonitoringDomainRequirementWhereUniqueInput;
    create: Prisma.XOR<Prisma.MonitoringDomainRequirementCreateInput, Prisma.MonitoringDomainRequirementUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.MonitoringDomainRequirementUpdateInput, Prisma.MonitoringDomainRequirementUncheckedUpdateInput>;
};
export type MonitoringDomainRequirementDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainRequirementSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainRequirementOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainRequirementInclude<ExtArgs> | null;
    where: Prisma.MonitoringDomainRequirementWhereUniqueInput;
};
export type MonitoringDomainRequirementDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MonitoringDomainRequirementWhereInput;
    limit?: number;
};
export type MonitoringDomainRequirementDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainRequirementSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainRequirementOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainRequirementInclude<ExtArgs> | null;
};
export {};
