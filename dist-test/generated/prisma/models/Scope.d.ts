import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ScopeModel = runtime.Types.Result.DefaultSelection<Prisma.$ScopePayload>;
export type AggregateScope = {
    _count: ScopeCountAggregateOutputType | null;
    _avg: ScopeAvgAggregateOutputType | null;
    _sum: ScopeSumAggregateOutputType | null;
    _min: ScopeMinAggregateOutputType | null;
    _max: ScopeMaxAggregateOutputType | null;
};
export type ScopeAvgAggregateOutputType = {
    serverCount: number | null;
    cloudCount: number | null;
    appCount: number | null;
    databaseCount: number | null;
    endpointCount: number | null;
};
export type ScopeSumAggregateOutputType = {
    serverCount: number | null;
    cloudCount: number | null;
    appCount: number | null;
    databaseCount: number | null;
    endpointCount: number | null;
};
export type ScopeMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    serviceId: string | null;
    serverCount: number | null;
    cloudCount: number | null;
    appCount: number | null;
    databaseCount: number | null;
    endpointCount: number | null;
};
export type ScopeMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    serviceId: string | null;
    serverCount: number | null;
    cloudCount: number | null;
    appCount: number | null;
    databaseCount: number | null;
    endpointCount: number | null;
};
export type ScopeCountAggregateOutputType = {
    id: number;
    tenantId: number;
    serviceId: number;
    serverCount: number;
    cloudCount: number;
    appCount: number;
    databaseCount: number;
    endpointCount: number;
    _all: number;
};
export type ScopeAvgAggregateInputType = {
    serverCount?: true;
    cloudCount?: true;
    appCount?: true;
    databaseCount?: true;
    endpointCount?: true;
};
export type ScopeSumAggregateInputType = {
    serverCount?: true;
    cloudCount?: true;
    appCount?: true;
    databaseCount?: true;
    endpointCount?: true;
};
export type ScopeMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    serverCount?: true;
    cloudCount?: true;
    appCount?: true;
    databaseCount?: true;
    endpointCount?: true;
};
export type ScopeMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    serverCount?: true;
    cloudCount?: true;
    appCount?: true;
    databaseCount?: true;
    endpointCount?: true;
};
export type ScopeCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    serverCount?: true;
    cloudCount?: true;
    appCount?: true;
    databaseCount?: true;
    endpointCount?: true;
    _all?: true;
};
export type ScopeAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScopeWhereInput;
    orderBy?: Prisma.ScopeOrderByWithRelationInput | Prisma.ScopeOrderByWithRelationInput[];
    cursor?: Prisma.ScopeWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ScopeCountAggregateInputType;
    _avg?: ScopeAvgAggregateInputType;
    _sum?: ScopeSumAggregateInputType;
    _min?: ScopeMinAggregateInputType;
    _max?: ScopeMaxAggregateInputType;
};
export type GetScopeAggregateType<T extends ScopeAggregateArgs> = {
    [P in keyof T & keyof AggregateScope]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateScope[P]> : Prisma.GetScalarType<T[P], AggregateScope[P]>;
};
export type ScopeGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScopeWhereInput;
    orderBy?: Prisma.ScopeOrderByWithAggregationInput | Prisma.ScopeOrderByWithAggregationInput[];
    by: Prisma.ScopeScalarFieldEnum[] | Prisma.ScopeScalarFieldEnum;
    having?: Prisma.ScopeScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ScopeCountAggregateInputType | true;
    _avg?: ScopeAvgAggregateInputType;
    _sum?: ScopeSumAggregateInputType;
    _min?: ScopeMinAggregateInputType;
    _max?: ScopeMaxAggregateInputType;
};
export type ScopeGroupByOutputType = {
    id: string;
    tenantId: string;
    serviceId: string;
    serverCount: number;
    cloudCount: number;
    appCount: number;
    databaseCount: number;
    endpointCount: number;
    _count: ScopeCountAggregateOutputType | null;
    _avg: ScopeAvgAggregateOutputType | null;
    _sum: ScopeSumAggregateOutputType | null;
    _min: ScopeMinAggregateOutputType | null;
    _max: ScopeMaxAggregateOutputType | null;
};
type GetScopeGroupByPayload<T extends ScopeGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ScopeGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ScopeGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ScopeGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ScopeGroupByOutputType[P]>;
}>>;
export type ScopeWhereInput = {
    AND?: Prisma.ScopeWhereInput | Prisma.ScopeWhereInput[];
    OR?: Prisma.ScopeWhereInput[];
    NOT?: Prisma.ScopeWhereInput | Prisma.ScopeWhereInput[];
    id?: Prisma.UuidFilter<"Scope"> | string;
    tenantId?: Prisma.UuidFilter<"Scope"> | string;
    serviceId?: Prisma.UuidFilter<"Scope"> | string;
    serverCount?: Prisma.IntFilter<"Scope"> | number;
    cloudCount?: Prisma.IntFilter<"Scope"> | number;
    appCount?: Prisma.IntFilter<"Scope"> | number;
    databaseCount?: Prisma.IntFilter<"Scope"> | number;
    endpointCount?: Prisma.IntFilter<"Scope"> | number;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type ScopeOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    serverCount?: Prisma.SortOrder;
    cloudCount?: Prisma.SortOrder;
    appCount?: Prisma.SortOrder;
    databaseCount?: Prisma.SortOrder;
    endpointCount?: Prisma.SortOrder;
    service?: Prisma.ServiceOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type ScopeWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    serviceId?: string;
    AND?: Prisma.ScopeWhereInput | Prisma.ScopeWhereInput[];
    OR?: Prisma.ScopeWhereInput[];
    NOT?: Prisma.ScopeWhereInput | Prisma.ScopeWhereInput[];
    tenantId?: Prisma.UuidFilter<"Scope"> | string;
    serverCount?: Prisma.IntFilter<"Scope"> | number;
    cloudCount?: Prisma.IntFilter<"Scope"> | number;
    appCount?: Prisma.IntFilter<"Scope"> | number;
    databaseCount?: Prisma.IntFilter<"Scope"> | number;
    endpointCount?: Prisma.IntFilter<"Scope"> | number;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id" | "serviceId">;
export type ScopeOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    serverCount?: Prisma.SortOrder;
    cloudCount?: Prisma.SortOrder;
    appCount?: Prisma.SortOrder;
    databaseCount?: Prisma.SortOrder;
    endpointCount?: Prisma.SortOrder;
    _count?: Prisma.ScopeCountOrderByAggregateInput;
    _avg?: Prisma.ScopeAvgOrderByAggregateInput;
    _max?: Prisma.ScopeMaxOrderByAggregateInput;
    _min?: Prisma.ScopeMinOrderByAggregateInput;
    _sum?: Prisma.ScopeSumOrderByAggregateInput;
};
export type ScopeScalarWhereWithAggregatesInput = {
    AND?: Prisma.ScopeScalarWhereWithAggregatesInput | Prisma.ScopeScalarWhereWithAggregatesInput[];
    OR?: Prisma.ScopeScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ScopeScalarWhereWithAggregatesInput | Prisma.ScopeScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Scope"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"Scope"> | string;
    serviceId?: Prisma.UuidWithAggregatesFilter<"Scope"> | string;
    serverCount?: Prisma.IntWithAggregatesFilter<"Scope"> | number;
    cloudCount?: Prisma.IntWithAggregatesFilter<"Scope"> | number;
    appCount?: Prisma.IntWithAggregatesFilter<"Scope"> | number;
    databaseCount?: Prisma.IntWithAggregatesFilter<"Scope"> | number;
    endpointCount?: Prisma.IntWithAggregatesFilter<"Scope"> | number;
};
export type ScopeCreateInput = {
    id?: string;
    serverCount: number;
    cloudCount: number;
    appCount: number;
    databaseCount: number;
    endpointCount: number;
    service: Prisma.ServiceCreateNestedOneWithoutScopeInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutScopesInput;
};
export type ScopeUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    serverCount: number;
    cloudCount: number;
    appCount: number;
    databaseCount: number;
    endpointCount: number;
};
export type ScopeUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serverCount?: Prisma.IntFieldUpdateOperationsInput | number;
    cloudCount?: Prisma.IntFieldUpdateOperationsInput | number;
    appCount?: Prisma.IntFieldUpdateOperationsInput | number;
    databaseCount?: Prisma.IntFieldUpdateOperationsInput | number;
    endpointCount?: Prisma.IntFieldUpdateOperationsInput | number;
    service?: Prisma.ServiceUpdateOneRequiredWithoutScopeNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutScopesNestedInput;
};
export type ScopeUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    serverCount?: Prisma.IntFieldUpdateOperationsInput | number;
    cloudCount?: Prisma.IntFieldUpdateOperationsInput | number;
    appCount?: Prisma.IntFieldUpdateOperationsInput | number;
    databaseCount?: Prisma.IntFieldUpdateOperationsInput | number;
    endpointCount?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ScopeCreateManyInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    serverCount: number;
    cloudCount: number;
    appCount: number;
    databaseCount: number;
    endpointCount: number;
};
export type ScopeUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serverCount?: Prisma.IntFieldUpdateOperationsInput | number;
    cloudCount?: Prisma.IntFieldUpdateOperationsInput | number;
    appCount?: Prisma.IntFieldUpdateOperationsInput | number;
    databaseCount?: Prisma.IntFieldUpdateOperationsInput | number;
    endpointCount?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ScopeUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    serverCount?: Prisma.IntFieldUpdateOperationsInput | number;
    cloudCount?: Prisma.IntFieldUpdateOperationsInput | number;
    appCount?: Prisma.IntFieldUpdateOperationsInput | number;
    databaseCount?: Prisma.IntFieldUpdateOperationsInput | number;
    endpointCount?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ScopeListRelationFilter = {
    every?: Prisma.ScopeWhereInput;
    some?: Prisma.ScopeWhereInput;
    none?: Prisma.ScopeWhereInput;
};
export type ScopeOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ScopeNullableScalarRelationFilter = {
    is?: Prisma.ScopeWhereInput | null;
    isNot?: Prisma.ScopeWhereInput | null;
};
export type ScopeCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    serverCount?: Prisma.SortOrder;
    cloudCount?: Prisma.SortOrder;
    appCount?: Prisma.SortOrder;
    databaseCount?: Prisma.SortOrder;
    endpointCount?: Prisma.SortOrder;
};
export type ScopeAvgOrderByAggregateInput = {
    serverCount?: Prisma.SortOrder;
    cloudCount?: Prisma.SortOrder;
    appCount?: Prisma.SortOrder;
    databaseCount?: Prisma.SortOrder;
    endpointCount?: Prisma.SortOrder;
};
export type ScopeMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    serverCount?: Prisma.SortOrder;
    cloudCount?: Prisma.SortOrder;
    appCount?: Prisma.SortOrder;
    databaseCount?: Prisma.SortOrder;
    endpointCount?: Prisma.SortOrder;
};
export type ScopeMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    serverCount?: Prisma.SortOrder;
    cloudCount?: Prisma.SortOrder;
    appCount?: Prisma.SortOrder;
    databaseCount?: Prisma.SortOrder;
    endpointCount?: Prisma.SortOrder;
};
export type ScopeSumOrderByAggregateInput = {
    serverCount?: Prisma.SortOrder;
    cloudCount?: Prisma.SortOrder;
    appCount?: Prisma.SortOrder;
    databaseCount?: Prisma.SortOrder;
    endpointCount?: Prisma.SortOrder;
};
export type ScopeCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ScopeCreateWithoutTenantInput, Prisma.ScopeUncheckedCreateWithoutTenantInput> | Prisma.ScopeCreateWithoutTenantInput[] | Prisma.ScopeUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ScopeCreateOrConnectWithoutTenantInput | Prisma.ScopeCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ScopeCreateManyTenantInputEnvelope;
    connect?: Prisma.ScopeWhereUniqueInput | Prisma.ScopeWhereUniqueInput[];
};
export type ScopeUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ScopeCreateWithoutTenantInput, Prisma.ScopeUncheckedCreateWithoutTenantInput> | Prisma.ScopeCreateWithoutTenantInput[] | Prisma.ScopeUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ScopeCreateOrConnectWithoutTenantInput | Prisma.ScopeCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ScopeCreateManyTenantInputEnvelope;
    connect?: Prisma.ScopeWhereUniqueInput | Prisma.ScopeWhereUniqueInput[];
};
export type ScopeUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ScopeCreateWithoutTenantInput, Prisma.ScopeUncheckedCreateWithoutTenantInput> | Prisma.ScopeCreateWithoutTenantInput[] | Prisma.ScopeUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ScopeCreateOrConnectWithoutTenantInput | Prisma.ScopeCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ScopeUpsertWithWhereUniqueWithoutTenantInput | Prisma.ScopeUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ScopeCreateManyTenantInputEnvelope;
    set?: Prisma.ScopeWhereUniqueInput | Prisma.ScopeWhereUniqueInput[];
    disconnect?: Prisma.ScopeWhereUniqueInput | Prisma.ScopeWhereUniqueInput[];
    delete?: Prisma.ScopeWhereUniqueInput | Prisma.ScopeWhereUniqueInput[];
    connect?: Prisma.ScopeWhereUniqueInput | Prisma.ScopeWhereUniqueInput[];
    update?: Prisma.ScopeUpdateWithWhereUniqueWithoutTenantInput | Prisma.ScopeUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ScopeUpdateManyWithWhereWithoutTenantInput | Prisma.ScopeUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ScopeScalarWhereInput | Prisma.ScopeScalarWhereInput[];
};
export type ScopeUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ScopeCreateWithoutTenantInput, Prisma.ScopeUncheckedCreateWithoutTenantInput> | Prisma.ScopeCreateWithoutTenantInput[] | Prisma.ScopeUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ScopeCreateOrConnectWithoutTenantInput | Prisma.ScopeCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ScopeUpsertWithWhereUniqueWithoutTenantInput | Prisma.ScopeUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ScopeCreateManyTenantInputEnvelope;
    set?: Prisma.ScopeWhereUniqueInput | Prisma.ScopeWhereUniqueInput[];
    disconnect?: Prisma.ScopeWhereUniqueInput | Prisma.ScopeWhereUniqueInput[];
    delete?: Prisma.ScopeWhereUniqueInput | Prisma.ScopeWhereUniqueInput[];
    connect?: Prisma.ScopeWhereUniqueInput | Prisma.ScopeWhereUniqueInput[];
    update?: Prisma.ScopeUpdateWithWhereUniqueWithoutTenantInput | Prisma.ScopeUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ScopeUpdateManyWithWhereWithoutTenantInput | Prisma.ScopeUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ScopeScalarWhereInput | Prisma.ScopeScalarWhereInput[];
};
export type ScopeCreateNestedOneWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.ScopeCreateWithoutServiceInput, Prisma.ScopeUncheckedCreateWithoutServiceInput>;
    connectOrCreate?: Prisma.ScopeCreateOrConnectWithoutServiceInput;
    connect?: Prisma.ScopeWhereUniqueInput;
};
export type ScopeUncheckedCreateNestedOneWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.ScopeCreateWithoutServiceInput, Prisma.ScopeUncheckedCreateWithoutServiceInput>;
    connectOrCreate?: Prisma.ScopeCreateOrConnectWithoutServiceInput;
    connect?: Prisma.ScopeWhereUniqueInput;
};
export type ScopeUpdateOneWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.ScopeCreateWithoutServiceInput, Prisma.ScopeUncheckedCreateWithoutServiceInput>;
    connectOrCreate?: Prisma.ScopeCreateOrConnectWithoutServiceInput;
    upsert?: Prisma.ScopeUpsertWithoutServiceInput;
    disconnect?: Prisma.ScopeWhereInput | boolean;
    delete?: Prisma.ScopeWhereInput | boolean;
    connect?: Prisma.ScopeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ScopeUpdateToOneWithWhereWithoutServiceInput, Prisma.ScopeUpdateWithoutServiceInput>, Prisma.ScopeUncheckedUpdateWithoutServiceInput>;
};
export type ScopeUncheckedUpdateOneWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.ScopeCreateWithoutServiceInput, Prisma.ScopeUncheckedCreateWithoutServiceInput>;
    connectOrCreate?: Prisma.ScopeCreateOrConnectWithoutServiceInput;
    upsert?: Prisma.ScopeUpsertWithoutServiceInput;
    disconnect?: Prisma.ScopeWhereInput | boolean;
    delete?: Prisma.ScopeWhereInput | boolean;
    connect?: Prisma.ScopeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ScopeUpdateToOneWithWhereWithoutServiceInput, Prisma.ScopeUpdateWithoutServiceInput>, Prisma.ScopeUncheckedUpdateWithoutServiceInput>;
};
export type ScopeCreateWithoutTenantInput = {
    id?: string;
    serverCount: number;
    cloudCount: number;
    appCount: number;
    databaseCount: number;
    endpointCount: number;
    service: Prisma.ServiceCreateNestedOneWithoutScopeInput;
};
export type ScopeUncheckedCreateWithoutTenantInput = {
    id?: string;
    serviceId: string;
    serverCount: number;
    cloudCount: number;
    appCount: number;
    databaseCount: number;
    endpointCount: number;
};
export type ScopeCreateOrConnectWithoutTenantInput = {
    where: Prisma.ScopeWhereUniqueInput;
    create: Prisma.XOR<Prisma.ScopeCreateWithoutTenantInput, Prisma.ScopeUncheckedCreateWithoutTenantInput>;
};
export type ScopeCreateManyTenantInputEnvelope = {
    data: Prisma.ScopeCreateManyTenantInput | Prisma.ScopeCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ScopeUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ScopeWhereUniqueInput;
    update: Prisma.XOR<Prisma.ScopeUpdateWithoutTenantInput, Prisma.ScopeUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ScopeCreateWithoutTenantInput, Prisma.ScopeUncheckedCreateWithoutTenantInput>;
};
export type ScopeUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ScopeWhereUniqueInput;
    data: Prisma.XOR<Prisma.ScopeUpdateWithoutTenantInput, Prisma.ScopeUncheckedUpdateWithoutTenantInput>;
};
export type ScopeUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ScopeScalarWhereInput;
    data: Prisma.XOR<Prisma.ScopeUpdateManyMutationInput, Prisma.ScopeUncheckedUpdateManyWithoutTenantInput>;
};
export type ScopeScalarWhereInput = {
    AND?: Prisma.ScopeScalarWhereInput | Prisma.ScopeScalarWhereInput[];
    OR?: Prisma.ScopeScalarWhereInput[];
    NOT?: Prisma.ScopeScalarWhereInput | Prisma.ScopeScalarWhereInput[];
    id?: Prisma.UuidFilter<"Scope"> | string;
    tenantId?: Prisma.UuidFilter<"Scope"> | string;
    serviceId?: Prisma.UuidFilter<"Scope"> | string;
    serverCount?: Prisma.IntFilter<"Scope"> | number;
    cloudCount?: Prisma.IntFilter<"Scope"> | number;
    appCount?: Prisma.IntFilter<"Scope"> | number;
    databaseCount?: Prisma.IntFilter<"Scope"> | number;
    endpointCount?: Prisma.IntFilter<"Scope"> | number;
};
export type ScopeCreateWithoutServiceInput = {
    id?: string;
    serverCount: number;
    cloudCount: number;
    appCount: number;
    databaseCount: number;
    endpointCount: number;
    tenant: Prisma.CompanyCreateNestedOneWithoutScopesInput;
};
export type ScopeUncheckedCreateWithoutServiceInput = {
    id?: string;
    tenantId: string;
    serverCount: number;
    cloudCount: number;
    appCount: number;
    databaseCount: number;
    endpointCount: number;
};
export type ScopeCreateOrConnectWithoutServiceInput = {
    where: Prisma.ScopeWhereUniqueInput;
    create: Prisma.XOR<Prisma.ScopeCreateWithoutServiceInput, Prisma.ScopeUncheckedCreateWithoutServiceInput>;
};
export type ScopeUpsertWithoutServiceInput = {
    update: Prisma.XOR<Prisma.ScopeUpdateWithoutServiceInput, Prisma.ScopeUncheckedUpdateWithoutServiceInput>;
    create: Prisma.XOR<Prisma.ScopeCreateWithoutServiceInput, Prisma.ScopeUncheckedCreateWithoutServiceInput>;
    where?: Prisma.ScopeWhereInput;
};
export type ScopeUpdateToOneWithWhereWithoutServiceInput = {
    where?: Prisma.ScopeWhereInput;
    data: Prisma.XOR<Prisma.ScopeUpdateWithoutServiceInput, Prisma.ScopeUncheckedUpdateWithoutServiceInput>;
};
export type ScopeUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serverCount?: Prisma.IntFieldUpdateOperationsInput | number;
    cloudCount?: Prisma.IntFieldUpdateOperationsInput | number;
    appCount?: Prisma.IntFieldUpdateOperationsInput | number;
    databaseCount?: Prisma.IntFieldUpdateOperationsInput | number;
    endpointCount?: Prisma.IntFieldUpdateOperationsInput | number;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutScopesNestedInput;
};
export type ScopeUncheckedUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serverCount?: Prisma.IntFieldUpdateOperationsInput | number;
    cloudCount?: Prisma.IntFieldUpdateOperationsInput | number;
    appCount?: Prisma.IntFieldUpdateOperationsInput | number;
    databaseCount?: Prisma.IntFieldUpdateOperationsInput | number;
    endpointCount?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ScopeCreateManyTenantInput = {
    id?: string;
    serviceId: string;
    serverCount: number;
    cloudCount: number;
    appCount: number;
    databaseCount: number;
    endpointCount: number;
};
export type ScopeUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serverCount?: Prisma.IntFieldUpdateOperationsInput | number;
    cloudCount?: Prisma.IntFieldUpdateOperationsInput | number;
    appCount?: Prisma.IntFieldUpdateOperationsInput | number;
    databaseCount?: Prisma.IntFieldUpdateOperationsInput | number;
    endpointCount?: Prisma.IntFieldUpdateOperationsInput | number;
    service?: Prisma.ServiceUpdateOneRequiredWithoutScopeNestedInput;
};
export type ScopeUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    serverCount?: Prisma.IntFieldUpdateOperationsInput | number;
    cloudCount?: Prisma.IntFieldUpdateOperationsInput | number;
    appCount?: Prisma.IntFieldUpdateOperationsInput | number;
    databaseCount?: Prisma.IntFieldUpdateOperationsInput | number;
    endpointCount?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ScopeUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    serverCount?: Prisma.IntFieldUpdateOperationsInput | number;
    cloudCount?: Prisma.IntFieldUpdateOperationsInput | number;
    appCount?: Prisma.IntFieldUpdateOperationsInput | number;
    databaseCount?: Prisma.IntFieldUpdateOperationsInput | number;
    endpointCount?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ScopeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    serverCount?: boolean;
    cloudCount?: boolean;
    appCount?: boolean;
    databaseCount?: boolean;
    endpointCount?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["scope"]>;
export type ScopeSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    serverCount?: boolean;
    cloudCount?: boolean;
    appCount?: boolean;
    databaseCount?: boolean;
    endpointCount?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["scope"]>;
export type ScopeSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    serverCount?: boolean;
    cloudCount?: boolean;
    appCount?: boolean;
    databaseCount?: boolean;
    endpointCount?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["scope"]>;
export type ScopeSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    serverCount?: boolean;
    cloudCount?: boolean;
    appCount?: boolean;
    databaseCount?: boolean;
    endpointCount?: boolean;
};
export type ScopeOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "serviceId" | "serverCount" | "cloudCount" | "appCount" | "databaseCount" | "endpointCount", ExtArgs["result"]["scope"]>;
export type ScopeInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ScopeIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ScopeIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ScopePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Scope";
    objects: {
        service: Prisma.$ServicePayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        serviceId: string;
        serverCount: number;
        cloudCount: number;
        appCount: number;
        databaseCount: number;
        endpointCount: number;
    }, ExtArgs["result"]["scope"]>;
    composites: {};
};
export type ScopeGetPayload<S extends boolean | null | undefined | ScopeDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ScopePayload, S>;
export type ScopeCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ScopeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ScopeCountAggregateInputType | true;
};
export interface ScopeDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Scope'];
        meta: {
            name: 'Scope';
        };
    };
    findUnique<T extends ScopeFindUniqueArgs>(args: Prisma.SelectSubset<T, ScopeFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ScopeClient<runtime.Types.Result.GetResult<Prisma.$ScopePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ScopeFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ScopeFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ScopeClient<runtime.Types.Result.GetResult<Prisma.$ScopePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ScopeFindFirstArgs>(args?: Prisma.SelectSubset<T, ScopeFindFirstArgs<ExtArgs>>): Prisma.Prisma__ScopeClient<runtime.Types.Result.GetResult<Prisma.$ScopePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ScopeFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ScopeFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ScopeClient<runtime.Types.Result.GetResult<Prisma.$ScopePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ScopeFindManyArgs>(args?: Prisma.SelectSubset<T, ScopeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScopePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ScopeCreateArgs>(args: Prisma.SelectSubset<T, ScopeCreateArgs<ExtArgs>>): Prisma.Prisma__ScopeClient<runtime.Types.Result.GetResult<Prisma.$ScopePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ScopeCreateManyArgs>(args?: Prisma.SelectSubset<T, ScopeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ScopeCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ScopeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScopePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ScopeDeleteArgs>(args: Prisma.SelectSubset<T, ScopeDeleteArgs<ExtArgs>>): Prisma.Prisma__ScopeClient<runtime.Types.Result.GetResult<Prisma.$ScopePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ScopeUpdateArgs>(args: Prisma.SelectSubset<T, ScopeUpdateArgs<ExtArgs>>): Prisma.Prisma__ScopeClient<runtime.Types.Result.GetResult<Prisma.$ScopePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ScopeDeleteManyArgs>(args?: Prisma.SelectSubset<T, ScopeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ScopeUpdateManyArgs>(args: Prisma.SelectSubset<T, ScopeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ScopeUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ScopeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScopePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ScopeUpsertArgs>(args: Prisma.SelectSubset<T, ScopeUpsertArgs<ExtArgs>>): Prisma.Prisma__ScopeClient<runtime.Types.Result.GetResult<Prisma.$ScopePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ScopeCountArgs>(args?: Prisma.Subset<T, ScopeCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ScopeCountAggregateOutputType> : number>;
    aggregate<T extends ScopeAggregateArgs>(args: Prisma.Subset<T, ScopeAggregateArgs>): Prisma.PrismaPromise<GetScopeAggregateType<T>>;
    groupBy<T extends ScopeGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ScopeGroupByArgs['orderBy'];
    } : {
        orderBy?: ScopeGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ScopeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScopeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ScopeFieldRefs;
}
export interface Prisma__ScopeClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    service<T extends Prisma.ServiceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ServiceDefaultArgs<ExtArgs>>): Prisma.Prisma__ServiceClient<runtime.Types.Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ScopeFieldRefs {
    readonly id: Prisma.FieldRef<"Scope", 'String'>;
    readonly tenantId: Prisma.FieldRef<"Scope", 'String'>;
    readonly serviceId: Prisma.FieldRef<"Scope", 'String'>;
    readonly serverCount: Prisma.FieldRef<"Scope", 'Int'>;
    readonly cloudCount: Prisma.FieldRef<"Scope", 'Int'>;
    readonly appCount: Prisma.FieldRef<"Scope", 'Int'>;
    readonly databaseCount: Prisma.FieldRef<"Scope", 'Int'>;
    readonly endpointCount: Prisma.FieldRef<"Scope", 'Int'>;
}
export type ScopeFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScopeSelect<ExtArgs> | null;
    omit?: Prisma.ScopeOmit<ExtArgs> | null;
    include?: Prisma.ScopeInclude<ExtArgs> | null;
    where: Prisma.ScopeWhereUniqueInput;
};
export type ScopeFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScopeSelect<ExtArgs> | null;
    omit?: Prisma.ScopeOmit<ExtArgs> | null;
    include?: Prisma.ScopeInclude<ExtArgs> | null;
    where: Prisma.ScopeWhereUniqueInput;
};
export type ScopeFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScopeSelect<ExtArgs> | null;
    omit?: Prisma.ScopeOmit<ExtArgs> | null;
    include?: Prisma.ScopeInclude<ExtArgs> | null;
    where?: Prisma.ScopeWhereInput;
    orderBy?: Prisma.ScopeOrderByWithRelationInput | Prisma.ScopeOrderByWithRelationInput[];
    cursor?: Prisma.ScopeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ScopeScalarFieldEnum | Prisma.ScopeScalarFieldEnum[];
};
export type ScopeFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScopeSelect<ExtArgs> | null;
    omit?: Prisma.ScopeOmit<ExtArgs> | null;
    include?: Prisma.ScopeInclude<ExtArgs> | null;
    where?: Prisma.ScopeWhereInput;
    orderBy?: Prisma.ScopeOrderByWithRelationInput | Prisma.ScopeOrderByWithRelationInput[];
    cursor?: Prisma.ScopeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ScopeScalarFieldEnum | Prisma.ScopeScalarFieldEnum[];
};
export type ScopeFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScopeSelect<ExtArgs> | null;
    omit?: Prisma.ScopeOmit<ExtArgs> | null;
    include?: Prisma.ScopeInclude<ExtArgs> | null;
    where?: Prisma.ScopeWhereInput;
    orderBy?: Prisma.ScopeOrderByWithRelationInput | Prisma.ScopeOrderByWithRelationInput[];
    cursor?: Prisma.ScopeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ScopeScalarFieldEnum | Prisma.ScopeScalarFieldEnum[];
};
export type ScopeCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScopeSelect<ExtArgs> | null;
    omit?: Prisma.ScopeOmit<ExtArgs> | null;
    include?: Prisma.ScopeInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ScopeCreateInput, Prisma.ScopeUncheckedCreateInput>;
};
export type ScopeCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ScopeCreateManyInput | Prisma.ScopeCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ScopeCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScopeSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ScopeOmit<ExtArgs> | null;
    data: Prisma.ScopeCreateManyInput | Prisma.ScopeCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ScopeIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ScopeUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScopeSelect<ExtArgs> | null;
    omit?: Prisma.ScopeOmit<ExtArgs> | null;
    include?: Prisma.ScopeInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ScopeUpdateInput, Prisma.ScopeUncheckedUpdateInput>;
    where: Prisma.ScopeWhereUniqueInput;
};
export type ScopeUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ScopeUpdateManyMutationInput, Prisma.ScopeUncheckedUpdateManyInput>;
    where?: Prisma.ScopeWhereInput;
    limit?: number;
};
export type ScopeUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScopeSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ScopeOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ScopeUpdateManyMutationInput, Prisma.ScopeUncheckedUpdateManyInput>;
    where?: Prisma.ScopeWhereInput;
    limit?: number;
    include?: Prisma.ScopeIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ScopeUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScopeSelect<ExtArgs> | null;
    omit?: Prisma.ScopeOmit<ExtArgs> | null;
    include?: Prisma.ScopeInclude<ExtArgs> | null;
    where: Prisma.ScopeWhereUniqueInput;
    create: Prisma.XOR<Prisma.ScopeCreateInput, Prisma.ScopeUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ScopeUpdateInput, Prisma.ScopeUncheckedUpdateInput>;
};
export type ScopeDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScopeSelect<ExtArgs> | null;
    omit?: Prisma.ScopeOmit<ExtArgs> | null;
    include?: Prisma.ScopeInclude<ExtArgs> | null;
    where: Prisma.ScopeWhereUniqueInput;
};
export type ScopeDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScopeWhereInput;
    limit?: number;
};
export type ScopeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScopeSelect<ExtArgs> | null;
    omit?: Prisma.ScopeOmit<ExtArgs> | null;
    include?: Prisma.ScopeInclude<ExtArgs> | null;
};
export {};
