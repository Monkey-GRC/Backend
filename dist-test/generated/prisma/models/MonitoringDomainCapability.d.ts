import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type MonitoringDomainCapabilityModel = runtime.Types.Result.DefaultSelection<Prisma.$MonitoringDomainCapabilityPayload>;
export type AggregateMonitoringDomainCapability = {
    _count: MonitoringDomainCapabilityCountAggregateOutputType | null;
    _min: MonitoringDomainCapabilityMinAggregateOutputType | null;
    _max: MonitoringDomainCapabilityMaxAggregateOutputType | null;
};
export type MonitoringDomainCapabilityMinAggregateOutputType = {
    id: string | null;
    monitoringDomainId: string | null;
    automatedCapabilityId: string | null;
};
export type MonitoringDomainCapabilityMaxAggregateOutputType = {
    id: string | null;
    monitoringDomainId: string | null;
    automatedCapabilityId: string | null;
};
export type MonitoringDomainCapabilityCountAggregateOutputType = {
    id: number;
    monitoringDomainId: number;
    automatedCapabilityId: number;
    _all: number;
};
export type MonitoringDomainCapabilityMinAggregateInputType = {
    id?: true;
    monitoringDomainId?: true;
    automatedCapabilityId?: true;
};
export type MonitoringDomainCapabilityMaxAggregateInputType = {
    id?: true;
    monitoringDomainId?: true;
    automatedCapabilityId?: true;
};
export type MonitoringDomainCapabilityCountAggregateInputType = {
    id?: true;
    monitoringDomainId?: true;
    automatedCapabilityId?: true;
    _all?: true;
};
export type MonitoringDomainCapabilityAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MonitoringDomainCapabilityWhereInput;
    orderBy?: Prisma.MonitoringDomainCapabilityOrderByWithRelationInput | Prisma.MonitoringDomainCapabilityOrderByWithRelationInput[];
    cursor?: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | MonitoringDomainCapabilityCountAggregateInputType;
    _min?: MonitoringDomainCapabilityMinAggregateInputType;
    _max?: MonitoringDomainCapabilityMaxAggregateInputType;
};
export type GetMonitoringDomainCapabilityAggregateType<T extends MonitoringDomainCapabilityAggregateArgs> = {
    [P in keyof T & keyof AggregateMonitoringDomainCapability]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMonitoringDomainCapability[P]> : Prisma.GetScalarType<T[P], AggregateMonitoringDomainCapability[P]>;
};
export type MonitoringDomainCapabilityGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MonitoringDomainCapabilityWhereInput;
    orderBy?: Prisma.MonitoringDomainCapabilityOrderByWithAggregationInput | Prisma.MonitoringDomainCapabilityOrderByWithAggregationInput[];
    by: Prisma.MonitoringDomainCapabilityScalarFieldEnum[] | Prisma.MonitoringDomainCapabilityScalarFieldEnum;
    having?: Prisma.MonitoringDomainCapabilityScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MonitoringDomainCapabilityCountAggregateInputType | true;
    _min?: MonitoringDomainCapabilityMinAggregateInputType;
    _max?: MonitoringDomainCapabilityMaxAggregateInputType;
};
export type MonitoringDomainCapabilityGroupByOutputType = {
    id: string;
    monitoringDomainId: string;
    automatedCapabilityId: string;
    _count: MonitoringDomainCapabilityCountAggregateOutputType | null;
    _min: MonitoringDomainCapabilityMinAggregateOutputType | null;
    _max: MonitoringDomainCapabilityMaxAggregateOutputType | null;
};
type GetMonitoringDomainCapabilityGroupByPayload<T extends MonitoringDomainCapabilityGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MonitoringDomainCapabilityGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MonitoringDomainCapabilityGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MonitoringDomainCapabilityGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MonitoringDomainCapabilityGroupByOutputType[P]>;
}>>;
export type MonitoringDomainCapabilityWhereInput = {
    AND?: Prisma.MonitoringDomainCapabilityWhereInput | Prisma.MonitoringDomainCapabilityWhereInput[];
    OR?: Prisma.MonitoringDomainCapabilityWhereInput[];
    NOT?: Prisma.MonitoringDomainCapabilityWhereInput | Prisma.MonitoringDomainCapabilityWhereInput[];
    id?: Prisma.UuidFilter<"MonitoringDomainCapability"> | string;
    monitoringDomainId?: Prisma.UuidFilter<"MonitoringDomainCapability"> | string;
    automatedCapabilityId?: Prisma.UuidFilter<"MonitoringDomainCapability"> | string;
    monitoringDomain?: Prisma.XOR<Prisma.MonitoringDomainScalarRelationFilter, Prisma.MonitoringDomainWhereInput>;
    automatedCapability?: Prisma.XOR<Prisma.AutomatedCapabilityScalarRelationFilter, Prisma.AutomatedCapabilityWhereInput>;
};
export type MonitoringDomainCapabilityOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    monitoringDomainId?: Prisma.SortOrder;
    automatedCapabilityId?: Prisma.SortOrder;
    monitoringDomain?: Prisma.MonitoringDomainOrderByWithRelationInput;
    automatedCapability?: Prisma.AutomatedCapabilityOrderByWithRelationInput;
};
export type MonitoringDomainCapabilityWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    monitoringDomainId_automatedCapabilityId?: Prisma.MonitoringDomainCapabilityMonitoringDomainIdAutomatedCapabilityIdCompoundUniqueInput;
    AND?: Prisma.MonitoringDomainCapabilityWhereInput | Prisma.MonitoringDomainCapabilityWhereInput[];
    OR?: Prisma.MonitoringDomainCapabilityWhereInput[];
    NOT?: Prisma.MonitoringDomainCapabilityWhereInput | Prisma.MonitoringDomainCapabilityWhereInput[];
    monitoringDomainId?: Prisma.UuidFilter<"MonitoringDomainCapability"> | string;
    automatedCapabilityId?: Prisma.UuidFilter<"MonitoringDomainCapability"> | string;
    monitoringDomain?: Prisma.XOR<Prisma.MonitoringDomainScalarRelationFilter, Prisma.MonitoringDomainWhereInput>;
    automatedCapability?: Prisma.XOR<Prisma.AutomatedCapabilityScalarRelationFilter, Prisma.AutomatedCapabilityWhereInput>;
}, "id" | "monitoringDomainId_automatedCapabilityId">;
export type MonitoringDomainCapabilityOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    monitoringDomainId?: Prisma.SortOrder;
    automatedCapabilityId?: Prisma.SortOrder;
    _count?: Prisma.MonitoringDomainCapabilityCountOrderByAggregateInput;
    _max?: Prisma.MonitoringDomainCapabilityMaxOrderByAggregateInput;
    _min?: Prisma.MonitoringDomainCapabilityMinOrderByAggregateInput;
};
export type MonitoringDomainCapabilityScalarWhereWithAggregatesInput = {
    AND?: Prisma.MonitoringDomainCapabilityScalarWhereWithAggregatesInput | Prisma.MonitoringDomainCapabilityScalarWhereWithAggregatesInput[];
    OR?: Prisma.MonitoringDomainCapabilityScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MonitoringDomainCapabilityScalarWhereWithAggregatesInput | Prisma.MonitoringDomainCapabilityScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"MonitoringDomainCapability"> | string;
    monitoringDomainId?: Prisma.UuidWithAggregatesFilter<"MonitoringDomainCapability"> | string;
    automatedCapabilityId?: Prisma.UuidWithAggregatesFilter<"MonitoringDomainCapability"> | string;
};
export type MonitoringDomainCapabilityCreateInput = {
    id?: string;
    monitoringDomain: Prisma.MonitoringDomainCreateNestedOneWithoutCapabilitiesInput;
    automatedCapability: Prisma.AutomatedCapabilityCreateNestedOneWithoutMonitoringDomainsInput;
};
export type MonitoringDomainCapabilityUncheckedCreateInput = {
    id?: string;
    monitoringDomainId: string;
    automatedCapabilityId: string;
};
export type MonitoringDomainCapabilityUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomain?: Prisma.MonitoringDomainUpdateOneRequiredWithoutCapabilitiesNestedInput;
    automatedCapability?: Prisma.AutomatedCapabilityUpdateOneRequiredWithoutMonitoringDomainsNestedInput;
};
export type MonitoringDomainCapabilityUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomainId?: Prisma.StringFieldUpdateOperationsInput | string;
    automatedCapabilityId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainCapabilityCreateManyInput = {
    id?: string;
    monitoringDomainId: string;
    automatedCapabilityId: string;
};
export type MonitoringDomainCapabilityUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainCapabilityUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomainId?: Prisma.StringFieldUpdateOperationsInput | string;
    automatedCapabilityId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainCapabilityListRelationFilter = {
    every?: Prisma.MonitoringDomainCapabilityWhereInput;
    some?: Prisma.MonitoringDomainCapabilityWhereInput;
    none?: Prisma.MonitoringDomainCapabilityWhereInput;
};
export type MonitoringDomainCapabilityOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type MonitoringDomainCapabilityMonitoringDomainIdAutomatedCapabilityIdCompoundUniqueInput = {
    monitoringDomainId: string;
    automatedCapabilityId: string;
};
export type MonitoringDomainCapabilityCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    monitoringDomainId?: Prisma.SortOrder;
    automatedCapabilityId?: Prisma.SortOrder;
};
export type MonitoringDomainCapabilityMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    monitoringDomainId?: Prisma.SortOrder;
    automatedCapabilityId?: Prisma.SortOrder;
};
export type MonitoringDomainCapabilityMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    monitoringDomainId?: Prisma.SortOrder;
    automatedCapabilityId?: Prisma.SortOrder;
};
export type MonitoringDomainCapabilityCreateNestedManyWithoutAutomatedCapabilityInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainCapabilityCreateWithoutAutomatedCapabilityInput, Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutAutomatedCapabilityInput> | Prisma.MonitoringDomainCapabilityCreateWithoutAutomatedCapabilityInput[] | Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutAutomatedCapabilityInput[];
    connectOrCreate?: Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutAutomatedCapabilityInput | Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutAutomatedCapabilityInput[];
    createMany?: Prisma.MonitoringDomainCapabilityCreateManyAutomatedCapabilityInputEnvelope;
    connect?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
};
export type MonitoringDomainCapabilityUncheckedCreateNestedManyWithoutAutomatedCapabilityInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainCapabilityCreateWithoutAutomatedCapabilityInput, Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutAutomatedCapabilityInput> | Prisma.MonitoringDomainCapabilityCreateWithoutAutomatedCapabilityInput[] | Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutAutomatedCapabilityInput[];
    connectOrCreate?: Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutAutomatedCapabilityInput | Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutAutomatedCapabilityInput[];
    createMany?: Prisma.MonitoringDomainCapabilityCreateManyAutomatedCapabilityInputEnvelope;
    connect?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
};
export type MonitoringDomainCapabilityUpdateManyWithoutAutomatedCapabilityNestedInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainCapabilityCreateWithoutAutomatedCapabilityInput, Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutAutomatedCapabilityInput> | Prisma.MonitoringDomainCapabilityCreateWithoutAutomatedCapabilityInput[] | Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutAutomatedCapabilityInput[];
    connectOrCreate?: Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutAutomatedCapabilityInput | Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutAutomatedCapabilityInput[];
    upsert?: Prisma.MonitoringDomainCapabilityUpsertWithWhereUniqueWithoutAutomatedCapabilityInput | Prisma.MonitoringDomainCapabilityUpsertWithWhereUniqueWithoutAutomatedCapabilityInput[];
    createMany?: Prisma.MonitoringDomainCapabilityCreateManyAutomatedCapabilityInputEnvelope;
    set?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    disconnect?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    delete?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    connect?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    update?: Prisma.MonitoringDomainCapabilityUpdateWithWhereUniqueWithoutAutomatedCapabilityInput | Prisma.MonitoringDomainCapabilityUpdateWithWhereUniqueWithoutAutomatedCapabilityInput[];
    updateMany?: Prisma.MonitoringDomainCapabilityUpdateManyWithWhereWithoutAutomatedCapabilityInput | Prisma.MonitoringDomainCapabilityUpdateManyWithWhereWithoutAutomatedCapabilityInput[];
    deleteMany?: Prisma.MonitoringDomainCapabilityScalarWhereInput | Prisma.MonitoringDomainCapabilityScalarWhereInput[];
};
export type MonitoringDomainCapabilityUncheckedUpdateManyWithoutAutomatedCapabilityNestedInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainCapabilityCreateWithoutAutomatedCapabilityInput, Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutAutomatedCapabilityInput> | Prisma.MonitoringDomainCapabilityCreateWithoutAutomatedCapabilityInput[] | Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutAutomatedCapabilityInput[];
    connectOrCreate?: Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutAutomatedCapabilityInput | Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutAutomatedCapabilityInput[];
    upsert?: Prisma.MonitoringDomainCapabilityUpsertWithWhereUniqueWithoutAutomatedCapabilityInput | Prisma.MonitoringDomainCapabilityUpsertWithWhereUniqueWithoutAutomatedCapabilityInput[];
    createMany?: Prisma.MonitoringDomainCapabilityCreateManyAutomatedCapabilityInputEnvelope;
    set?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    disconnect?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    delete?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    connect?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    update?: Prisma.MonitoringDomainCapabilityUpdateWithWhereUniqueWithoutAutomatedCapabilityInput | Prisma.MonitoringDomainCapabilityUpdateWithWhereUniqueWithoutAutomatedCapabilityInput[];
    updateMany?: Prisma.MonitoringDomainCapabilityUpdateManyWithWhereWithoutAutomatedCapabilityInput | Prisma.MonitoringDomainCapabilityUpdateManyWithWhereWithoutAutomatedCapabilityInput[];
    deleteMany?: Prisma.MonitoringDomainCapabilityScalarWhereInput | Prisma.MonitoringDomainCapabilityScalarWhereInput[];
};
export type MonitoringDomainCapabilityCreateNestedManyWithoutMonitoringDomainInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainCapabilityCreateWithoutMonitoringDomainInput, Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutMonitoringDomainInput> | Prisma.MonitoringDomainCapabilityCreateWithoutMonitoringDomainInput[] | Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutMonitoringDomainInput[];
    connectOrCreate?: Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutMonitoringDomainInput | Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutMonitoringDomainInput[];
    createMany?: Prisma.MonitoringDomainCapabilityCreateManyMonitoringDomainInputEnvelope;
    connect?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
};
export type MonitoringDomainCapabilityUncheckedCreateNestedManyWithoutMonitoringDomainInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainCapabilityCreateWithoutMonitoringDomainInput, Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutMonitoringDomainInput> | Prisma.MonitoringDomainCapabilityCreateWithoutMonitoringDomainInput[] | Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutMonitoringDomainInput[];
    connectOrCreate?: Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutMonitoringDomainInput | Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutMonitoringDomainInput[];
    createMany?: Prisma.MonitoringDomainCapabilityCreateManyMonitoringDomainInputEnvelope;
    connect?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
};
export type MonitoringDomainCapabilityUpdateManyWithoutMonitoringDomainNestedInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainCapabilityCreateWithoutMonitoringDomainInput, Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutMonitoringDomainInput> | Prisma.MonitoringDomainCapabilityCreateWithoutMonitoringDomainInput[] | Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutMonitoringDomainInput[];
    connectOrCreate?: Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutMonitoringDomainInput | Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutMonitoringDomainInput[];
    upsert?: Prisma.MonitoringDomainCapabilityUpsertWithWhereUniqueWithoutMonitoringDomainInput | Prisma.MonitoringDomainCapabilityUpsertWithWhereUniqueWithoutMonitoringDomainInput[];
    createMany?: Prisma.MonitoringDomainCapabilityCreateManyMonitoringDomainInputEnvelope;
    set?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    disconnect?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    delete?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    connect?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    update?: Prisma.MonitoringDomainCapabilityUpdateWithWhereUniqueWithoutMonitoringDomainInput | Prisma.MonitoringDomainCapabilityUpdateWithWhereUniqueWithoutMonitoringDomainInput[];
    updateMany?: Prisma.MonitoringDomainCapabilityUpdateManyWithWhereWithoutMonitoringDomainInput | Prisma.MonitoringDomainCapabilityUpdateManyWithWhereWithoutMonitoringDomainInput[];
    deleteMany?: Prisma.MonitoringDomainCapabilityScalarWhereInput | Prisma.MonitoringDomainCapabilityScalarWhereInput[];
};
export type MonitoringDomainCapabilityUncheckedUpdateManyWithoutMonitoringDomainNestedInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainCapabilityCreateWithoutMonitoringDomainInput, Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutMonitoringDomainInput> | Prisma.MonitoringDomainCapabilityCreateWithoutMonitoringDomainInput[] | Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutMonitoringDomainInput[];
    connectOrCreate?: Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutMonitoringDomainInput | Prisma.MonitoringDomainCapabilityCreateOrConnectWithoutMonitoringDomainInput[];
    upsert?: Prisma.MonitoringDomainCapabilityUpsertWithWhereUniqueWithoutMonitoringDomainInput | Prisma.MonitoringDomainCapabilityUpsertWithWhereUniqueWithoutMonitoringDomainInput[];
    createMany?: Prisma.MonitoringDomainCapabilityCreateManyMonitoringDomainInputEnvelope;
    set?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    disconnect?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    delete?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    connect?: Prisma.MonitoringDomainCapabilityWhereUniqueInput | Prisma.MonitoringDomainCapabilityWhereUniqueInput[];
    update?: Prisma.MonitoringDomainCapabilityUpdateWithWhereUniqueWithoutMonitoringDomainInput | Prisma.MonitoringDomainCapabilityUpdateWithWhereUniqueWithoutMonitoringDomainInput[];
    updateMany?: Prisma.MonitoringDomainCapabilityUpdateManyWithWhereWithoutMonitoringDomainInput | Prisma.MonitoringDomainCapabilityUpdateManyWithWhereWithoutMonitoringDomainInput[];
    deleteMany?: Prisma.MonitoringDomainCapabilityScalarWhereInput | Prisma.MonitoringDomainCapabilityScalarWhereInput[];
};
export type MonitoringDomainCapabilityCreateWithoutAutomatedCapabilityInput = {
    id?: string;
    monitoringDomain: Prisma.MonitoringDomainCreateNestedOneWithoutCapabilitiesInput;
};
export type MonitoringDomainCapabilityUncheckedCreateWithoutAutomatedCapabilityInput = {
    id?: string;
    monitoringDomainId: string;
};
export type MonitoringDomainCapabilityCreateOrConnectWithoutAutomatedCapabilityInput = {
    where: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
    create: Prisma.XOR<Prisma.MonitoringDomainCapabilityCreateWithoutAutomatedCapabilityInput, Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutAutomatedCapabilityInput>;
};
export type MonitoringDomainCapabilityCreateManyAutomatedCapabilityInputEnvelope = {
    data: Prisma.MonitoringDomainCapabilityCreateManyAutomatedCapabilityInput | Prisma.MonitoringDomainCapabilityCreateManyAutomatedCapabilityInput[];
    skipDuplicates?: boolean;
};
export type MonitoringDomainCapabilityUpsertWithWhereUniqueWithoutAutomatedCapabilityInput = {
    where: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
    update: Prisma.XOR<Prisma.MonitoringDomainCapabilityUpdateWithoutAutomatedCapabilityInput, Prisma.MonitoringDomainCapabilityUncheckedUpdateWithoutAutomatedCapabilityInput>;
    create: Prisma.XOR<Prisma.MonitoringDomainCapabilityCreateWithoutAutomatedCapabilityInput, Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutAutomatedCapabilityInput>;
};
export type MonitoringDomainCapabilityUpdateWithWhereUniqueWithoutAutomatedCapabilityInput = {
    where: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
    data: Prisma.XOR<Prisma.MonitoringDomainCapabilityUpdateWithoutAutomatedCapabilityInput, Prisma.MonitoringDomainCapabilityUncheckedUpdateWithoutAutomatedCapabilityInput>;
};
export type MonitoringDomainCapabilityUpdateManyWithWhereWithoutAutomatedCapabilityInput = {
    where: Prisma.MonitoringDomainCapabilityScalarWhereInput;
    data: Prisma.XOR<Prisma.MonitoringDomainCapabilityUpdateManyMutationInput, Prisma.MonitoringDomainCapabilityUncheckedUpdateManyWithoutAutomatedCapabilityInput>;
};
export type MonitoringDomainCapabilityScalarWhereInput = {
    AND?: Prisma.MonitoringDomainCapabilityScalarWhereInput | Prisma.MonitoringDomainCapabilityScalarWhereInput[];
    OR?: Prisma.MonitoringDomainCapabilityScalarWhereInput[];
    NOT?: Prisma.MonitoringDomainCapabilityScalarWhereInput | Prisma.MonitoringDomainCapabilityScalarWhereInput[];
    id?: Prisma.UuidFilter<"MonitoringDomainCapability"> | string;
    monitoringDomainId?: Prisma.UuidFilter<"MonitoringDomainCapability"> | string;
    automatedCapabilityId?: Prisma.UuidFilter<"MonitoringDomainCapability"> | string;
};
export type MonitoringDomainCapabilityCreateWithoutMonitoringDomainInput = {
    id?: string;
    automatedCapability: Prisma.AutomatedCapabilityCreateNestedOneWithoutMonitoringDomainsInput;
};
export type MonitoringDomainCapabilityUncheckedCreateWithoutMonitoringDomainInput = {
    id?: string;
    automatedCapabilityId: string;
};
export type MonitoringDomainCapabilityCreateOrConnectWithoutMonitoringDomainInput = {
    where: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
    create: Prisma.XOR<Prisma.MonitoringDomainCapabilityCreateWithoutMonitoringDomainInput, Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutMonitoringDomainInput>;
};
export type MonitoringDomainCapabilityCreateManyMonitoringDomainInputEnvelope = {
    data: Prisma.MonitoringDomainCapabilityCreateManyMonitoringDomainInput | Prisma.MonitoringDomainCapabilityCreateManyMonitoringDomainInput[];
    skipDuplicates?: boolean;
};
export type MonitoringDomainCapabilityUpsertWithWhereUniqueWithoutMonitoringDomainInput = {
    where: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
    update: Prisma.XOR<Prisma.MonitoringDomainCapabilityUpdateWithoutMonitoringDomainInput, Prisma.MonitoringDomainCapabilityUncheckedUpdateWithoutMonitoringDomainInput>;
    create: Prisma.XOR<Prisma.MonitoringDomainCapabilityCreateWithoutMonitoringDomainInput, Prisma.MonitoringDomainCapabilityUncheckedCreateWithoutMonitoringDomainInput>;
};
export type MonitoringDomainCapabilityUpdateWithWhereUniqueWithoutMonitoringDomainInput = {
    where: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
    data: Prisma.XOR<Prisma.MonitoringDomainCapabilityUpdateWithoutMonitoringDomainInput, Prisma.MonitoringDomainCapabilityUncheckedUpdateWithoutMonitoringDomainInput>;
};
export type MonitoringDomainCapabilityUpdateManyWithWhereWithoutMonitoringDomainInput = {
    where: Prisma.MonitoringDomainCapabilityScalarWhereInput;
    data: Prisma.XOR<Prisma.MonitoringDomainCapabilityUpdateManyMutationInput, Prisma.MonitoringDomainCapabilityUncheckedUpdateManyWithoutMonitoringDomainInput>;
};
export type MonitoringDomainCapabilityCreateManyAutomatedCapabilityInput = {
    id?: string;
    monitoringDomainId: string;
};
export type MonitoringDomainCapabilityUpdateWithoutAutomatedCapabilityInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomain?: Prisma.MonitoringDomainUpdateOneRequiredWithoutCapabilitiesNestedInput;
};
export type MonitoringDomainCapabilityUncheckedUpdateWithoutAutomatedCapabilityInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomainId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainCapabilityUncheckedUpdateManyWithoutAutomatedCapabilityInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomainId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainCapabilityCreateManyMonitoringDomainInput = {
    id?: string;
    automatedCapabilityId: string;
};
export type MonitoringDomainCapabilityUpdateWithoutMonitoringDomainInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    automatedCapability?: Prisma.AutomatedCapabilityUpdateOneRequiredWithoutMonitoringDomainsNestedInput;
};
export type MonitoringDomainCapabilityUncheckedUpdateWithoutMonitoringDomainInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    automatedCapabilityId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainCapabilityUncheckedUpdateManyWithoutMonitoringDomainInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    automatedCapabilityId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainCapabilitySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    monitoringDomainId?: boolean;
    automatedCapabilityId?: boolean;
    monitoringDomain?: boolean | Prisma.MonitoringDomainDefaultArgs<ExtArgs>;
    automatedCapability?: boolean | Prisma.AutomatedCapabilityDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["monitoringDomainCapability"]>;
export type MonitoringDomainCapabilitySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    monitoringDomainId?: boolean;
    automatedCapabilityId?: boolean;
    monitoringDomain?: boolean | Prisma.MonitoringDomainDefaultArgs<ExtArgs>;
    automatedCapability?: boolean | Prisma.AutomatedCapabilityDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["monitoringDomainCapability"]>;
export type MonitoringDomainCapabilitySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    monitoringDomainId?: boolean;
    automatedCapabilityId?: boolean;
    monitoringDomain?: boolean | Prisma.MonitoringDomainDefaultArgs<ExtArgs>;
    automatedCapability?: boolean | Prisma.AutomatedCapabilityDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["monitoringDomainCapability"]>;
export type MonitoringDomainCapabilitySelectScalar = {
    id?: boolean;
    monitoringDomainId?: boolean;
    automatedCapabilityId?: boolean;
};
export type MonitoringDomainCapabilityOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "monitoringDomainId" | "automatedCapabilityId", ExtArgs["result"]["monitoringDomainCapability"]>;
export type MonitoringDomainCapabilityInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    monitoringDomain?: boolean | Prisma.MonitoringDomainDefaultArgs<ExtArgs>;
    automatedCapability?: boolean | Prisma.AutomatedCapabilityDefaultArgs<ExtArgs>;
};
export type MonitoringDomainCapabilityIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    monitoringDomain?: boolean | Prisma.MonitoringDomainDefaultArgs<ExtArgs>;
    automatedCapability?: boolean | Prisma.AutomatedCapabilityDefaultArgs<ExtArgs>;
};
export type MonitoringDomainCapabilityIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    monitoringDomain?: boolean | Prisma.MonitoringDomainDefaultArgs<ExtArgs>;
    automatedCapability?: boolean | Prisma.AutomatedCapabilityDefaultArgs<ExtArgs>;
};
export type $MonitoringDomainCapabilityPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "MonitoringDomainCapability";
    objects: {
        monitoringDomain: Prisma.$MonitoringDomainPayload<ExtArgs>;
        automatedCapability: Prisma.$AutomatedCapabilityPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        monitoringDomainId: string;
        automatedCapabilityId: string;
    }, ExtArgs["result"]["monitoringDomainCapability"]>;
    composites: {};
};
export type MonitoringDomainCapabilityGetPayload<S extends boolean | null | undefined | MonitoringDomainCapabilityDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MonitoringDomainCapabilityPayload, S>;
export type MonitoringDomainCapabilityCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MonitoringDomainCapabilityFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MonitoringDomainCapabilityCountAggregateInputType | true;
};
export interface MonitoringDomainCapabilityDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['MonitoringDomainCapability'];
        meta: {
            name: 'MonitoringDomainCapability';
        };
    };
    findUnique<T extends MonitoringDomainCapabilityFindUniqueArgs>(args: Prisma.SelectSubset<T, MonitoringDomainCapabilityFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainCapabilityClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends MonitoringDomainCapabilityFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MonitoringDomainCapabilityFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainCapabilityClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends MonitoringDomainCapabilityFindFirstArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainCapabilityFindFirstArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainCapabilityClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends MonitoringDomainCapabilityFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainCapabilityFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainCapabilityClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends MonitoringDomainCapabilityFindManyArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainCapabilityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends MonitoringDomainCapabilityCreateArgs>(args: Prisma.SelectSubset<T, MonitoringDomainCapabilityCreateArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainCapabilityClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends MonitoringDomainCapabilityCreateManyArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainCapabilityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends MonitoringDomainCapabilityCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainCapabilityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends MonitoringDomainCapabilityDeleteArgs>(args: Prisma.SelectSubset<T, MonitoringDomainCapabilityDeleteArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainCapabilityClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends MonitoringDomainCapabilityUpdateArgs>(args: Prisma.SelectSubset<T, MonitoringDomainCapabilityUpdateArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainCapabilityClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends MonitoringDomainCapabilityDeleteManyArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainCapabilityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends MonitoringDomainCapabilityUpdateManyArgs>(args: Prisma.SelectSubset<T, MonitoringDomainCapabilityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends MonitoringDomainCapabilityUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MonitoringDomainCapabilityUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends MonitoringDomainCapabilityUpsertArgs>(args: Prisma.SelectSubset<T, MonitoringDomainCapabilityUpsertArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainCapabilityClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends MonitoringDomainCapabilityCountArgs>(args?: Prisma.Subset<T, MonitoringDomainCapabilityCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MonitoringDomainCapabilityCountAggregateOutputType> : number>;
    aggregate<T extends MonitoringDomainCapabilityAggregateArgs>(args: Prisma.Subset<T, MonitoringDomainCapabilityAggregateArgs>): Prisma.PrismaPromise<GetMonitoringDomainCapabilityAggregateType<T>>;
    groupBy<T extends MonitoringDomainCapabilityGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MonitoringDomainCapabilityGroupByArgs['orderBy'];
    } : {
        orderBy?: MonitoringDomainCapabilityGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MonitoringDomainCapabilityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMonitoringDomainCapabilityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: MonitoringDomainCapabilityFieldRefs;
}
export interface Prisma__MonitoringDomainCapabilityClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    monitoringDomain<T extends Prisma.MonitoringDomainDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MonitoringDomainDefaultArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    automatedCapability<T extends Prisma.AutomatedCapabilityDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.AutomatedCapabilityDefaultArgs<ExtArgs>>): Prisma.Prisma__AutomatedCapabilityClient<runtime.Types.Result.GetResult<Prisma.$AutomatedCapabilityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface MonitoringDomainCapabilityFieldRefs {
    readonly id: Prisma.FieldRef<"MonitoringDomainCapability", 'String'>;
    readonly monitoringDomainId: Prisma.FieldRef<"MonitoringDomainCapability", 'String'>;
    readonly automatedCapabilityId: Prisma.FieldRef<"MonitoringDomainCapability", 'String'>;
}
export type MonitoringDomainCapabilityFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainCapabilityOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainCapabilityInclude<ExtArgs> | null;
    where: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
};
export type MonitoringDomainCapabilityFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainCapabilityOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainCapabilityInclude<ExtArgs> | null;
    where: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
};
export type MonitoringDomainCapabilityFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainCapabilityOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainCapabilityInclude<ExtArgs> | null;
    where?: Prisma.MonitoringDomainCapabilityWhereInput;
    orderBy?: Prisma.MonitoringDomainCapabilityOrderByWithRelationInput | Prisma.MonitoringDomainCapabilityOrderByWithRelationInput[];
    cursor?: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MonitoringDomainCapabilityScalarFieldEnum | Prisma.MonitoringDomainCapabilityScalarFieldEnum[];
};
export type MonitoringDomainCapabilityFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainCapabilityOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainCapabilityInclude<ExtArgs> | null;
    where?: Prisma.MonitoringDomainCapabilityWhereInput;
    orderBy?: Prisma.MonitoringDomainCapabilityOrderByWithRelationInput | Prisma.MonitoringDomainCapabilityOrderByWithRelationInput[];
    cursor?: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MonitoringDomainCapabilityScalarFieldEnum | Prisma.MonitoringDomainCapabilityScalarFieldEnum[];
};
export type MonitoringDomainCapabilityFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainCapabilityOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainCapabilityInclude<ExtArgs> | null;
    where?: Prisma.MonitoringDomainCapabilityWhereInput;
    orderBy?: Prisma.MonitoringDomainCapabilityOrderByWithRelationInput | Prisma.MonitoringDomainCapabilityOrderByWithRelationInput[];
    cursor?: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MonitoringDomainCapabilityScalarFieldEnum | Prisma.MonitoringDomainCapabilityScalarFieldEnum[];
};
export type MonitoringDomainCapabilityCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainCapabilityOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainCapabilityInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MonitoringDomainCapabilityCreateInput, Prisma.MonitoringDomainCapabilityUncheckedCreateInput>;
};
export type MonitoringDomainCapabilityCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.MonitoringDomainCapabilityCreateManyInput | Prisma.MonitoringDomainCapabilityCreateManyInput[];
    skipDuplicates?: boolean;
};
export type MonitoringDomainCapabilityCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCapabilitySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainCapabilityOmit<ExtArgs> | null;
    data: Prisma.MonitoringDomainCapabilityCreateManyInput | Prisma.MonitoringDomainCapabilityCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.MonitoringDomainCapabilityIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type MonitoringDomainCapabilityUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainCapabilityOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainCapabilityInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MonitoringDomainCapabilityUpdateInput, Prisma.MonitoringDomainCapabilityUncheckedUpdateInput>;
    where: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
};
export type MonitoringDomainCapabilityUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.MonitoringDomainCapabilityUpdateManyMutationInput, Prisma.MonitoringDomainCapabilityUncheckedUpdateManyInput>;
    where?: Prisma.MonitoringDomainCapabilityWhereInput;
    limit?: number;
};
export type MonitoringDomainCapabilityUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCapabilitySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainCapabilityOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MonitoringDomainCapabilityUpdateManyMutationInput, Prisma.MonitoringDomainCapabilityUncheckedUpdateManyInput>;
    where?: Prisma.MonitoringDomainCapabilityWhereInput;
    limit?: number;
    include?: Prisma.MonitoringDomainCapabilityIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type MonitoringDomainCapabilityUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainCapabilityOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainCapabilityInclude<ExtArgs> | null;
    where: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
    create: Prisma.XOR<Prisma.MonitoringDomainCapabilityCreateInput, Prisma.MonitoringDomainCapabilityUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.MonitoringDomainCapabilityUpdateInput, Prisma.MonitoringDomainCapabilityUncheckedUpdateInput>;
};
export type MonitoringDomainCapabilityDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainCapabilityOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainCapabilityInclude<ExtArgs> | null;
    where: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
};
export type MonitoringDomainCapabilityDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MonitoringDomainCapabilityWhereInput;
    limit?: number;
};
export type MonitoringDomainCapabilityDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainCapabilityOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainCapabilityInclude<ExtArgs> | null;
};
export {};
