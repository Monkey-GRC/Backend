import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CuecModel = runtime.Types.Result.DefaultSelection<Prisma.$CuecPayload>;
export type AggregateCuec = {
    _count: CuecCountAggregateOutputType | null;
    _min: CuecMinAggregateOutputType | null;
    _max: CuecMaxAggregateOutputType | null;
};
export type CuecMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    serviceId: string | null;
    expectedControl: string | null;
};
export type CuecMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    serviceId: string | null;
    expectedControl: string | null;
};
export type CuecCountAggregateOutputType = {
    id: number;
    tenantId: number;
    serviceId: number;
    expectedControl: number;
    _all: number;
};
export type CuecMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    expectedControl?: true;
};
export type CuecMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    expectedControl?: true;
};
export type CuecCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    expectedControl?: true;
    _all?: true;
};
export type CuecAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CuecWhereInput;
    orderBy?: Prisma.CuecOrderByWithRelationInput | Prisma.CuecOrderByWithRelationInput[];
    cursor?: Prisma.CuecWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CuecCountAggregateInputType;
    _min?: CuecMinAggregateInputType;
    _max?: CuecMaxAggregateInputType;
};
export type GetCuecAggregateType<T extends CuecAggregateArgs> = {
    [P in keyof T & keyof AggregateCuec]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCuec[P]> : Prisma.GetScalarType<T[P], AggregateCuec[P]>;
};
export type CuecGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CuecWhereInput;
    orderBy?: Prisma.CuecOrderByWithAggregationInput | Prisma.CuecOrderByWithAggregationInput[];
    by: Prisma.CuecScalarFieldEnum[] | Prisma.CuecScalarFieldEnum;
    having?: Prisma.CuecScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CuecCountAggregateInputType | true;
    _min?: CuecMinAggregateInputType;
    _max?: CuecMaxAggregateInputType;
};
export type CuecGroupByOutputType = {
    id: string;
    tenantId: string;
    serviceId: string;
    expectedControl: string;
    _count: CuecCountAggregateOutputType | null;
    _min: CuecMinAggregateOutputType | null;
    _max: CuecMaxAggregateOutputType | null;
};
type GetCuecGroupByPayload<T extends CuecGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CuecGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CuecGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CuecGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CuecGroupByOutputType[P]>;
}>>;
export type CuecWhereInput = {
    AND?: Prisma.CuecWhereInput | Prisma.CuecWhereInput[];
    OR?: Prisma.CuecWhereInput[];
    NOT?: Prisma.CuecWhereInput | Prisma.CuecWhereInput[];
    id?: Prisma.UuidFilter<"Cuec"> | string;
    tenantId?: Prisma.UuidFilter<"Cuec"> | string;
    serviceId?: Prisma.UuidFilter<"Cuec"> | string;
    expectedControl?: Prisma.StringFilter<"Cuec"> | string;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type CuecOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    expectedControl?: Prisma.SortOrder;
    service?: Prisma.ServiceOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type CuecWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.CuecWhereInput | Prisma.CuecWhereInput[];
    OR?: Prisma.CuecWhereInput[];
    NOT?: Prisma.CuecWhereInput | Prisma.CuecWhereInput[];
    tenantId?: Prisma.UuidFilter<"Cuec"> | string;
    serviceId?: Prisma.UuidFilter<"Cuec"> | string;
    expectedControl?: Prisma.StringFilter<"Cuec"> | string;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id">;
export type CuecOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    expectedControl?: Prisma.SortOrder;
    _count?: Prisma.CuecCountOrderByAggregateInput;
    _max?: Prisma.CuecMaxOrderByAggregateInput;
    _min?: Prisma.CuecMinOrderByAggregateInput;
};
export type CuecScalarWhereWithAggregatesInput = {
    AND?: Prisma.CuecScalarWhereWithAggregatesInput | Prisma.CuecScalarWhereWithAggregatesInput[];
    OR?: Prisma.CuecScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CuecScalarWhereWithAggregatesInput | Prisma.CuecScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Cuec"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"Cuec"> | string;
    serviceId?: Prisma.UuidWithAggregatesFilter<"Cuec"> | string;
    expectedControl?: Prisma.StringWithAggregatesFilter<"Cuec"> | string;
};
export type CuecCreateInput = {
    id?: string;
    expectedControl: string;
    service: Prisma.ServiceCreateNestedOneWithoutCuecsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutCuecsInput;
};
export type CuecUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    expectedControl: string;
};
export type CuecUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutCuecsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutCuecsNestedInput;
};
export type CuecUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CuecCreateManyInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    expectedControl: string;
};
export type CuecUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CuecUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CuecListRelationFilter = {
    every?: Prisma.CuecWhereInput;
    some?: Prisma.CuecWhereInput;
    none?: Prisma.CuecWhereInput;
};
export type CuecOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CuecCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    expectedControl?: Prisma.SortOrder;
};
export type CuecMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    expectedControl?: Prisma.SortOrder;
};
export type CuecMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    expectedControl?: Prisma.SortOrder;
};
export type CuecCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.CuecCreateWithoutTenantInput, Prisma.CuecUncheckedCreateWithoutTenantInput> | Prisma.CuecCreateWithoutTenantInput[] | Prisma.CuecUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.CuecCreateOrConnectWithoutTenantInput | Prisma.CuecCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.CuecCreateManyTenantInputEnvelope;
    connect?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
};
export type CuecUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.CuecCreateWithoutTenantInput, Prisma.CuecUncheckedCreateWithoutTenantInput> | Prisma.CuecCreateWithoutTenantInput[] | Prisma.CuecUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.CuecCreateOrConnectWithoutTenantInput | Prisma.CuecCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.CuecCreateManyTenantInputEnvelope;
    connect?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
};
export type CuecUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.CuecCreateWithoutTenantInput, Prisma.CuecUncheckedCreateWithoutTenantInput> | Prisma.CuecCreateWithoutTenantInput[] | Prisma.CuecUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.CuecCreateOrConnectWithoutTenantInput | Prisma.CuecCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.CuecUpsertWithWhereUniqueWithoutTenantInput | Prisma.CuecUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.CuecCreateManyTenantInputEnvelope;
    set?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    disconnect?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    delete?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    connect?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    update?: Prisma.CuecUpdateWithWhereUniqueWithoutTenantInput | Prisma.CuecUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.CuecUpdateManyWithWhereWithoutTenantInput | Prisma.CuecUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.CuecScalarWhereInput | Prisma.CuecScalarWhereInput[];
};
export type CuecUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.CuecCreateWithoutTenantInput, Prisma.CuecUncheckedCreateWithoutTenantInput> | Prisma.CuecCreateWithoutTenantInput[] | Prisma.CuecUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.CuecCreateOrConnectWithoutTenantInput | Prisma.CuecCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.CuecUpsertWithWhereUniqueWithoutTenantInput | Prisma.CuecUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.CuecCreateManyTenantInputEnvelope;
    set?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    disconnect?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    delete?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    connect?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    update?: Prisma.CuecUpdateWithWhereUniqueWithoutTenantInput | Prisma.CuecUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.CuecUpdateManyWithWhereWithoutTenantInput | Prisma.CuecUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.CuecScalarWhereInput | Prisma.CuecScalarWhereInput[];
};
export type CuecCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.CuecCreateWithoutServiceInput, Prisma.CuecUncheckedCreateWithoutServiceInput> | Prisma.CuecCreateWithoutServiceInput[] | Prisma.CuecUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.CuecCreateOrConnectWithoutServiceInput | Prisma.CuecCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.CuecCreateManyServiceInputEnvelope;
    connect?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
};
export type CuecUncheckedCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.CuecCreateWithoutServiceInput, Prisma.CuecUncheckedCreateWithoutServiceInput> | Prisma.CuecCreateWithoutServiceInput[] | Prisma.CuecUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.CuecCreateOrConnectWithoutServiceInput | Prisma.CuecCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.CuecCreateManyServiceInputEnvelope;
    connect?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
};
export type CuecUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.CuecCreateWithoutServiceInput, Prisma.CuecUncheckedCreateWithoutServiceInput> | Prisma.CuecCreateWithoutServiceInput[] | Prisma.CuecUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.CuecCreateOrConnectWithoutServiceInput | Prisma.CuecCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.CuecUpsertWithWhereUniqueWithoutServiceInput | Prisma.CuecUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.CuecCreateManyServiceInputEnvelope;
    set?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    disconnect?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    delete?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    connect?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    update?: Prisma.CuecUpdateWithWhereUniqueWithoutServiceInput | Prisma.CuecUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.CuecUpdateManyWithWhereWithoutServiceInput | Prisma.CuecUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.CuecScalarWhereInput | Prisma.CuecScalarWhereInput[];
};
export type CuecUncheckedUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.CuecCreateWithoutServiceInput, Prisma.CuecUncheckedCreateWithoutServiceInput> | Prisma.CuecCreateWithoutServiceInput[] | Prisma.CuecUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.CuecCreateOrConnectWithoutServiceInput | Prisma.CuecCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.CuecUpsertWithWhereUniqueWithoutServiceInput | Prisma.CuecUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.CuecCreateManyServiceInputEnvelope;
    set?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    disconnect?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    delete?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    connect?: Prisma.CuecWhereUniqueInput | Prisma.CuecWhereUniqueInput[];
    update?: Prisma.CuecUpdateWithWhereUniqueWithoutServiceInput | Prisma.CuecUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.CuecUpdateManyWithWhereWithoutServiceInput | Prisma.CuecUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.CuecScalarWhereInput | Prisma.CuecScalarWhereInput[];
};
export type CuecCreateWithoutTenantInput = {
    id?: string;
    expectedControl: string;
    service: Prisma.ServiceCreateNestedOneWithoutCuecsInput;
};
export type CuecUncheckedCreateWithoutTenantInput = {
    id?: string;
    serviceId: string;
    expectedControl: string;
};
export type CuecCreateOrConnectWithoutTenantInput = {
    where: Prisma.CuecWhereUniqueInput;
    create: Prisma.XOR<Prisma.CuecCreateWithoutTenantInput, Prisma.CuecUncheckedCreateWithoutTenantInput>;
};
export type CuecCreateManyTenantInputEnvelope = {
    data: Prisma.CuecCreateManyTenantInput | Prisma.CuecCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type CuecUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.CuecWhereUniqueInput;
    update: Prisma.XOR<Prisma.CuecUpdateWithoutTenantInput, Prisma.CuecUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.CuecCreateWithoutTenantInput, Prisma.CuecUncheckedCreateWithoutTenantInput>;
};
export type CuecUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.CuecWhereUniqueInput;
    data: Prisma.XOR<Prisma.CuecUpdateWithoutTenantInput, Prisma.CuecUncheckedUpdateWithoutTenantInput>;
};
export type CuecUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.CuecScalarWhereInput;
    data: Prisma.XOR<Prisma.CuecUpdateManyMutationInput, Prisma.CuecUncheckedUpdateManyWithoutTenantInput>;
};
export type CuecScalarWhereInput = {
    AND?: Prisma.CuecScalarWhereInput | Prisma.CuecScalarWhereInput[];
    OR?: Prisma.CuecScalarWhereInput[];
    NOT?: Prisma.CuecScalarWhereInput | Prisma.CuecScalarWhereInput[];
    id?: Prisma.UuidFilter<"Cuec"> | string;
    tenantId?: Prisma.UuidFilter<"Cuec"> | string;
    serviceId?: Prisma.UuidFilter<"Cuec"> | string;
    expectedControl?: Prisma.StringFilter<"Cuec"> | string;
};
export type CuecCreateWithoutServiceInput = {
    id?: string;
    expectedControl: string;
    tenant: Prisma.CompanyCreateNestedOneWithoutCuecsInput;
};
export type CuecUncheckedCreateWithoutServiceInput = {
    id?: string;
    tenantId: string;
    expectedControl: string;
};
export type CuecCreateOrConnectWithoutServiceInput = {
    where: Prisma.CuecWhereUniqueInput;
    create: Prisma.XOR<Prisma.CuecCreateWithoutServiceInput, Prisma.CuecUncheckedCreateWithoutServiceInput>;
};
export type CuecCreateManyServiceInputEnvelope = {
    data: Prisma.CuecCreateManyServiceInput | Prisma.CuecCreateManyServiceInput[];
    skipDuplicates?: boolean;
};
export type CuecUpsertWithWhereUniqueWithoutServiceInput = {
    where: Prisma.CuecWhereUniqueInput;
    update: Prisma.XOR<Prisma.CuecUpdateWithoutServiceInput, Prisma.CuecUncheckedUpdateWithoutServiceInput>;
    create: Prisma.XOR<Prisma.CuecCreateWithoutServiceInput, Prisma.CuecUncheckedCreateWithoutServiceInput>;
};
export type CuecUpdateWithWhereUniqueWithoutServiceInput = {
    where: Prisma.CuecWhereUniqueInput;
    data: Prisma.XOR<Prisma.CuecUpdateWithoutServiceInput, Prisma.CuecUncheckedUpdateWithoutServiceInput>;
};
export type CuecUpdateManyWithWhereWithoutServiceInput = {
    where: Prisma.CuecScalarWhereInput;
    data: Prisma.XOR<Prisma.CuecUpdateManyMutationInput, Prisma.CuecUncheckedUpdateManyWithoutServiceInput>;
};
export type CuecCreateManyTenantInput = {
    id?: string;
    serviceId: string;
    expectedControl: string;
};
export type CuecUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutCuecsNestedInput;
};
export type CuecUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CuecUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CuecCreateManyServiceInput = {
    id?: string;
    tenantId: string;
    expectedControl: string;
};
export type CuecUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutCuecsNestedInput;
};
export type CuecUncheckedUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CuecUncheckedUpdateManyWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CuecSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    expectedControl?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["cuec"]>;
export type CuecSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    expectedControl?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["cuec"]>;
export type CuecSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    expectedControl?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["cuec"]>;
export type CuecSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    expectedControl?: boolean;
};
export type CuecOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "serviceId" | "expectedControl", ExtArgs["result"]["cuec"]>;
export type CuecInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type CuecIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type CuecIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $CuecPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Cuec";
    objects: {
        service: Prisma.$ServicePayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        serviceId: string;
        expectedControl: string;
    }, ExtArgs["result"]["cuec"]>;
    composites: {};
};
export type CuecGetPayload<S extends boolean | null | undefined | CuecDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CuecPayload, S>;
export type CuecCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CuecFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CuecCountAggregateInputType | true;
};
export interface CuecDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Cuec'];
        meta: {
            name: 'Cuec';
        };
    };
    findUnique<T extends CuecFindUniqueArgs>(args: Prisma.SelectSubset<T, CuecFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CuecClient<runtime.Types.Result.GetResult<Prisma.$CuecPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CuecFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CuecFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CuecClient<runtime.Types.Result.GetResult<Prisma.$CuecPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CuecFindFirstArgs>(args?: Prisma.SelectSubset<T, CuecFindFirstArgs<ExtArgs>>): Prisma.Prisma__CuecClient<runtime.Types.Result.GetResult<Prisma.$CuecPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CuecFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CuecFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CuecClient<runtime.Types.Result.GetResult<Prisma.$CuecPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CuecFindManyArgs>(args?: Prisma.SelectSubset<T, CuecFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CuecPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CuecCreateArgs>(args: Prisma.SelectSubset<T, CuecCreateArgs<ExtArgs>>): Prisma.Prisma__CuecClient<runtime.Types.Result.GetResult<Prisma.$CuecPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CuecCreateManyArgs>(args?: Prisma.SelectSubset<T, CuecCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends CuecCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CuecCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CuecPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends CuecDeleteArgs>(args: Prisma.SelectSubset<T, CuecDeleteArgs<ExtArgs>>): Prisma.Prisma__CuecClient<runtime.Types.Result.GetResult<Prisma.$CuecPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CuecUpdateArgs>(args: Prisma.SelectSubset<T, CuecUpdateArgs<ExtArgs>>): Prisma.Prisma__CuecClient<runtime.Types.Result.GetResult<Prisma.$CuecPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CuecDeleteManyArgs>(args?: Prisma.SelectSubset<T, CuecDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CuecUpdateManyArgs>(args: Prisma.SelectSubset<T, CuecUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends CuecUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CuecUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CuecPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends CuecUpsertArgs>(args: Prisma.SelectSubset<T, CuecUpsertArgs<ExtArgs>>): Prisma.Prisma__CuecClient<runtime.Types.Result.GetResult<Prisma.$CuecPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CuecCountArgs>(args?: Prisma.Subset<T, CuecCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CuecCountAggregateOutputType> : number>;
    aggregate<T extends CuecAggregateArgs>(args: Prisma.Subset<T, CuecAggregateArgs>): Prisma.PrismaPromise<GetCuecAggregateType<T>>;
    groupBy<T extends CuecGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CuecGroupByArgs['orderBy'];
    } : {
        orderBy?: CuecGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CuecGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCuecGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CuecFieldRefs;
}
export interface Prisma__CuecClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    service<T extends Prisma.ServiceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ServiceDefaultArgs<ExtArgs>>): Prisma.Prisma__ServiceClient<runtime.Types.Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CuecFieldRefs {
    readonly id: Prisma.FieldRef<"Cuec", 'String'>;
    readonly tenantId: Prisma.FieldRef<"Cuec", 'String'>;
    readonly serviceId: Prisma.FieldRef<"Cuec", 'String'>;
    readonly expectedControl: Prisma.FieldRef<"Cuec", 'String'>;
}
export type CuecFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CuecSelect<ExtArgs> | null;
    omit?: Prisma.CuecOmit<ExtArgs> | null;
    include?: Prisma.CuecInclude<ExtArgs> | null;
    where: Prisma.CuecWhereUniqueInput;
};
export type CuecFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CuecSelect<ExtArgs> | null;
    omit?: Prisma.CuecOmit<ExtArgs> | null;
    include?: Prisma.CuecInclude<ExtArgs> | null;
    where: Prisma.CuecWhereUniqueInput;
};
export type CuecFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CuecSelect<ExtArgs> | null;
    omit?: Prisma.CuecOmit<ExtArgs> | null;
    include?: Prisma.CuecInclude<ExtArgs> | null;
    where?: Prisma.CuecWhereInput;
    orderBy?: Prisma.CuecOrderByWithRelationInput | Prisma.CuecOrderByWithRelationInput[];
    cursor?: Prisma.CuecWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CuecScalarFieldEnum | Prisma.CuecScalarFieldEnum[];
};
export type CuecFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CuecSelect<ExtArgs> | null;
    omit?: Prisma.CuecOmit<ExtArgs> | null;
    include?: Prisma.CuecInclude<ExtArgs> | null;
    where?: Prisma.CuecWhereInput;
    orderBy?: Prisma.CuecOrderByWithRelationInput | Prisma.CuecOrderByWithRelationInput[];
    cursor?: Prisma.CuecWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CuecScalarFieldEnum | Prisma.CuecScalarFieldEnum[];
};
export type CuecFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CuecSelect<ExtArgs> | null;
    omit?: Prisma.CuecOmit<ExtArgs> | null;
    include?: Prisma.CuecInclude<ExtArgs> | null;
    where?: Prisma.CuecWhereInput;
    orderBy?: Prisma.CuecOrderByWithRelationInput | Prisma.CuecOrderByWithRelationInput[];
    cursor?: Prisma.CuecWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CuecScalarFieldEnum | Prisma.CuecScalarFieldEnum[];
};
export type CuecCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CuecSelect<ExtArgs> | null;
    omit?: Prisma.CuecOmit<ExtArgs> | null;
    include?: Prisma.CuecInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CuecCreateInput, Prisma.CuecUncheckedCreateInput>;
};
export type CuecCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CuecCreateManyInput | Prisma.CuecCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CuecCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CuecSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CuecOmit<ExtArgs> | null;
    data: Prisma.CuecCreateManyInput | Prisma.CuecCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.CuecIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type CuecUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CuecSelect<ExtArgs> | null;
    omit?: Prisma.CuecOmit<ExtArgs> | null;
    include?: Prisma.CuecInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CuecUpdateInput, Prisma.CuecUncheckedUpdateInput>;
    where: Prisma.CuecWhereUniqueInput;
};
export type CuecUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CuecUpdateManyMutationInput, Prisma.CuecUncheckedUpdateManyInput>;
    where?: Prisma.CuecWhereInput;
    limit?: number;
};
export type CuecUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CuecSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CuecOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CuecUpdateManyMutationInput, Prisma.CuecUncheckedUpdateManyInput>;
    where?: Prisma.CuecWhereInput;
    limit?: number;
    include?: Prisma.CuecIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type CuecUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CuecSelect<ExtArgs> | null;
    omit?: Prisma.CuecOmit<ExtArgs> | null;
    include?: Prisma.CuecInclude<ExtArgs> | null;
    where: Prisma.CuecWhereUniqueInput;
    create: Prisma.XOR<Prisma.CuecCreateInput, Prisma.CuecUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CuecUpdateInput, Prisma.CuecUncheckedUpdateInput>;
};
export type CuecDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CuecSelect<ExtArgs> | null;
    omit?: Prisma.CuecOmit<ExtArgs> | null;
    include?: Prisma.CuecInclude<ExtArgs> | null;
    where: Prisma.CuecWhereUniqueInput;
};
export type CuecDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CuecWhereInput;
    limit?: number;
};
export type CuecDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CuecSelect<ExtArgs> | null;
    omit?: Prisma.CuecOmit<ExtArgs> | null;
    include?: Prisma.CuecInclude<ExtArgs> | null;
};
export {};
