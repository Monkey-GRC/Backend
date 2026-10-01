import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type SystemDescriptionModel = runtime.Types.Result.DefaultSelection<Prisma.$SystemDescriptionPayload>;
export type AggregateSystemDescription = {
    _count: SystemDescriptionCountAggregateOutputType | null;
    _min: SystemDescriptionMinAggregateOutputType | null;
    _max: SystemDescriptionMaxAggregateOutputType | null;
};
export type SystemDescriptionMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    serviceId: string | null;
    filePath: string | null;
};
export type SystemDescriptionMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    serviceId: string | null;
    filePath: string | null;
};
export type SystemDescriptionCountAggregateOutputType = {
    id: number;
    tenantId: number;
    serviceId: number;
    filePath: number;
    sections: number;
    _all: number;
};
export type SystemDescriptionMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    filePath?: true;
};
export type SystemDescriptionMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    filePath?: true;
};
export type SystemDescriptionCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    filePath?: true;
    sections?: true;
    _all?: true;
};
export type SystemDescriptionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SystemDescriptionWhereInput;
    orderBy?: Prisma.SystemDescriptionOrderByWithRelationInput | Prisma.SystemDescriptionOrderByWithRelationInput[];
    cursor?: Prisma.SystemDescriptionWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SystemDescriptionCountAggregateInputType;
    _min?: SystemDescriptionMinAggregateInputType;
    _max?: SystemDescriptionMaxAggregateInputType;
};
export type GetSystemDescriptionAggregateType<T extends SystemDescriptionAggregateArgs> = {
    [P in keyof T & keyof AggregateSystemDescription]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSystemDescription[P]> : Prisma.GetScalarType<T[P], AggregateSystemDescription[P]>;
};
export type SystemDescriptionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SystemDescriptionWhereInput;
    orderBy?: Prisma.SystemDescriptionOrderByWithAggregationInput | Prisma.SystemDescriptionOrderByWithAggregationInput[];
    by: Prisma.SystemDescriptionScalarFieldEnum[] | Prisma.SystemDescriptionScalarFieldEnum;
    having?: Prisma.SystemDescriptionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SystemDescriptionCountAggregateInputType | true;
    _min?: SystemDescriptionMinAggregateInputType;
    _max?: SystemDescriptionMaxAggregateInputType;
};
export type SystemDescriptionGroupByOutputType = {
    id: string;
    tenantId: string;
    serviceId: string;
    filePath: string;
    sections: runtime.JsonValue;
    _count: SystemDescriptionCountAggregateOutputType | null;
    _min: SystemDescriptionMinAggregateOutputType | null;
    _max: SystemDescriptionMaxAggregateOutputType | null;
};
type GetSystemDescriptionGroupByPayload<T extends SystemDescriptionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SystemDescriptionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SystemDescriptionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SystemDescriptionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SystemDescriptionGroupByOutputType[P]>;
}>>;
export type SystemDescriptionWhereInput = {
    AND?: Prisma.SystemDescriptionWhereInput | Prisma.SystemDescriptionWhereInput[];
    OR?: Prisma.SystemDescriptionWhereInput[];
    NOT?: Prisma.SystemDescriptionWhereInput | Prisma.SystemDescriptionWhereInput[];
    id?: Prisma.UuidFilter<"SystemDescription"> | string;
    tenantId?: Prisma.UuidFilter<"SystemDescription"> | string;
    serviceId?: Prisma.UuidFilter<"SystemDescription"> | string;
    filePath?: Prisma.StringFilter<"SystemDescription"> | string;
    sections?: Prisma.JsonFilter<"SystemDescription">;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type SystemDescriptionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    filePath?: Prisma.SortOrder;
    sections?: Prisma.SortOrder;
    service?: Prisma.ServiceOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type SystemDescriptionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    serviceId?: string;
    AND?: Prisma.SystemDescriptionWhereInput | Prisma.SystemDescriptionWhereInput[];
    OR?: Prisma.SystemDescriptionWhereInput[];
    NOT?: Prisma.SystemDescriptionWhereInput | Prisma.SystemDescriptionWhereInput[];
    tenantId?: Prisma.UuidFilter<"SystemDescription"> | string;
    filePath?: Prisma.StringFilter<"SystemDescription"> | string;
    sections?: Prisma.JsonFilter<"SystemDescription">;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id" | "serviceId">;
export type SystemDescriptionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    filePath?: Prisma.SortOrder;
    sections?: Prisma.SortOrder;
    _count?: Prisma.SystemDescriptionCountOrderByAggregateInput;
    _max?: Prisma.SystemDescriptionMaxOrderByAggregateInput;
    _min?: Prisma.SystemDescriptionMinOrderByAggregateInput;
};
export type SystemDescriptionScalarWhereWithAggregatesInput = {
    AND?: Prisma.SystemDescriptionScalarWhereWithAggregatesInput | Prisma.SystemDescriptionScalarWhereWithAggregatesInput[];
    OR?: Prisma.SystemDescriptionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SystemDescriptionScalarWhereWithAggregatesInput | Prisma.SystemDescriptionScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"SystemDescription"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"SystemDescription"> | string;
    serviceId?: Prisma.UuidWithAggregatesFilter<"SystemDescription"> | string;
    filePath?: Prisma.StringWithAggregatesFilter<"SystemDescription"> | string;
    sections?: Prisma.JsonWithAggregatesFilter<"SystemDescription">;
};
export type SystemDescriptionCreateInput = {
    id?: string;
    filePath: string;
    sections: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    service: Prisma.ServiceCreateNestedOneWithoutSystemDescriptionInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutSystemDescriptionsInput;
};
export type SystemDescriptionUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    filePath: string;
    sections: Prisma.JsonNullValueInput | runtime.InputJsonValue;
};
export type SystemDescriptionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    sections?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    service?: Prisma.ServiceUpdateOneRequiredWithoutSystemDescriptionNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutSystemDescriptionsNestedInput;
};
export type SystemDescriptionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    sections?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
};
export type SystemDescriptionCreateManyInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    filePath: string;
    sections: Prisma.JsonNullValueInput | runtime.InputJsonValue;
};
export type SystemDescriptionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    sections?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
};
export type SystemDescriptionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    sections?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
};
export type SystemDescriptionListRelationFilter = {
    every?: Prisma.SystemDescriptionWhereInput;
    some?: Prisma.SystemDescriptionWhereInput;
    none?: Prisma.SystemDescriptionWhereInput;
};
export type SystemDescriptionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type SystemDescriptionNullableScalarRelationFilter = {
    is?: Prisma.SystemDescriptionWhereInput | null;
    isNot?: Prisma.SystemDescriptionWhereInput | null;
};
export type SystemDescriptionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    filePath?: Prisma.SortOrder;
    sections?: Prisma.SortOrder;
};
export type SystemDescriptionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    filePath?: Prisma.SortOrder;
};
export type SystemDescriptionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    filePath?: Prisma.SortOrder;
};
export type SystemDescriptionCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.SystemDescriptionCreateWithoutTenantInput, Prisma.SystemDescriptionUncheckedCreateWithoutTenantInput> | Prisma.SystemDescriptionCreateWithoutTenantInput[] | Prisma.SystemDescriptionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.SystemDescriptionCreateOrConnectWithoutTenantInput | Prisma.SystemDescriptionCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.SystemDescriptionCreateManyTenantInputEnvelope;
    connect?: Prisma.SystemDescriptionWhereUniqueInput | Prisma.SystemDescriptionWhereUniqueInput[];
};
export type SystemDescriptionUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.SystemDescriptionCreateWithoutTenantInput, Prisma.SystemDescriptionUncheckedCreateWithoutTenantInput> | Prisma.SystemDescriptionCreateWithoutTenantInput[] | Prisma.SystemDescriptionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.SystemDescriptionCreateOrConnectWithoutTenantInput | Prisma.SystemDescriptionCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.SystemDescriptionCreateManyTenantInputEnvelope;
    connect?: Prisma.SystemDescriptionWhereUniqueInput | Prisma.SystemDescriptionWhereUniqueInput[];
};
export type SystemDescriptionUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.SystemDescriptionCreateWithoutTenantInput, Prisma.SystemDescriptionUncheckedCreateWithoutTenantInput> | Prisma.SystemDescriptionCreateWithoutTenantInput[] | Prisma.SystemDescriptionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.SystemDescriptionCreateOrConnectWithoutTenantInput | Prisma.SystemDescriptionCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.SystemDescriptionUpsertWithWhereUniqueWithoutTenantInput | Prisma.SystemDescriptionUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.SystemDescriptionCreateManyTenantInputEnvelope;
    set?: Prisma.SystemDescriptionWhereUniqueInput | Prisma.SystemDescriptionWhereUniqueInput[];
    disconnect?: Prisma.SystemDescriptionWhereUniqueInput | Prisma.SystemDescriptionWhereUniqueInput[];
    delete?: Prisma.SystemDescriptionWhereUniqueInput | Prisma.SystemDescriptionWhereUniqueInput[];
    connect?: Prisma.SystemDescriptionWhereUniqueInput | Prisma.SystemDescriptionWhereUniqueInput[];
    update?: Prisma.SystemDescriptionUpdateWithWhereUniqueWithoutTenantInput | Prisma.SystemDescriptionUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.SystemDescriptionUpdateManyWithWhereWithoutTenantInput | Prisma.SystemDescriptionUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.SystemDescriptionScalarWhereInput | Prisma.SystemDescriptionScalarWhereInput[];
};
export type SystemDescriptionUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.SystemDescriptionCreateWithoutTenantInput, Prisma.SystemDescriptionUncheckedCreateWithoutTenantInput> | Prisma.SystemDescriptionCreateWithoutTenantInput[] | Prisma.SystemDescriptionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.SystemDescriptionCreateOrConnectWithoutTenantInput | Prisma.SystemDescriptionCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.SystemDescriptionUpsertWithWhereUniqueWithoutTenantInput | Prisma.SystemDescriptionUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.SystemDescriptionCreateManyTenantInputEnvelope;
    set?: Prisma.SystemDescriptionWhereUniqueInput | Prisma.SystemDescriptionWhereUniqueInput[];
    disconnect?: Prisma.SystemDescriptionWhereUniqueInput | Prisma.SystemDescriptionWhereUniqueInput[];
    delete?: Prisma.SystemDescriptionWhereUniqueInput | Prisma.SystemDescriptionWhereUniqueInput[];
    connect?: Prisma.SystemDescriptionWhereUniqueInput | Prisma.SystemDescriptionWhereUniqueInput[];
    update?: Prisma.SystemDescriptionUpdateWithWhereUniqueWithoutTenantInput | Prisma.SystemDescriptionUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.SystemDescriptionUpdateManyWithWhereWithoutTenantInput | Prisma.SystemDescriptionUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.SystemDescriptionScalarWhereInput | Prisma.SystemDescriptionScalarWhereInput[];
};
export type SystemDescriptionCreateNestedOneWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.SystemDescriptionCreateWithoutServiceInput, Prisma.SystemDescriptionUncheckedCreateWithoutServiceInput>;
    connectOrCreate?: Prisma.SystemDescriptionCreateOrConnectWithoutServiceInput;
    connect?: Prisma.SystemDescriptionWhereUniqueInput;
};
export type SystemDescriptionUncheckedCreateNestedOneWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.SystemDescriptionCreateWithoutServiceInput, Prisma.SystemDescriptionUncheckedCreateWithoutServiceInput>;
    connectOrCreate?: Prisma.SystemDescriptionCreateOrConnectWithoutServiceInput;
    connect?: Prisma.SystemDescriptionWhereUniqueInput;
};
export type SystemDescriptionUpdateOneWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.SystemDescriptionCreateWithoutServiceInput, Prisma.SystemDescriptionUncheckedCreateWithoutServiceInput>;
    connectOrCreate?: Prisma.SystemDescriptionCreateOrConnectWithoutServiceInput;
    upsert?: Prisma.SystemDescriptionUpsertWithoutServiceInput;
    disconnect?: Prisma.SystemDescriptionWhereInput | boolean;
    delete?: Prisma.SystemDescriptionWhereInput | boolean;
    connect?: Prisma.SystemDescriptionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SystemDescriptionUpdateToOneWithWhereWithoutServiceInput, Prisma.SystemDescriptionUpdateWithoutServiceInput>, Prisma.SystemDescriptionUncheckedUpdateWithoutServiceInput>;
};
export type SystemDescriptionUncheckedUpdateOneWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.SystemDescriptionCreateWithoutServiceInput, Prisma.SystemDescriptionUncheckedCreateWithoutServiceInput>;
    connectOrCreate?: Prisma.SystemDescriptionCreateOrConnectWithoutServiceInput;
    upsert?: Prisma.SystemDescriptionUpsertWithoutServiceInput;
    disconnect?: Prisma.SystemDescriptionWhereInput | boolean;
    delete?: Prisma.SystemDescriptionWhereInput | boolean;
    connect?: Prisma.SystemDescriptionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SystemDescriptionUpdateToOneWithWhereWithoutServiceInput, Prisma.SystemDescriptionUpdateWithoutServiceInput>, Prisma.SystemDescriptionUncheckedUpdateWithoutServiceInput>;
};
export type SystemDescriptionCreateWithoutTenantInput = {
    id?: string;
    filePath: string;
    sections: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    service: Prisma.ServiceCreateNestedOneWithoutSystemDescriptionInput;
};
export type SystemDescriptionUncheckedCreateWithoutTenantInput = {
    id?: string;
    serviceId: string;
    filePath: string;
    sections: Prisma.JsonNullValueInput | runtime.InputJsonValue;
};
export type SystemDescriptionCreateOrConnectWithoutTenantInput = {
    where: Prisma.SystemDescriptionWhereUniqueInput;
    create: Prisma.XOR<Prisma.SystemDescriptionCreateWithoutTenantInput, Prisma.SystemDescriptionUncheckedCreateWithoutTenantInput>;
};
export type SystemDescriptionCreateManyTenantInputEnvelope = {
    data: Prisma.SystemDescriptionCreateManyTenantInput | Prisma.SystemDescriptionCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type SystemDescriptionUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.SystemDescriptionWhereUniqueInput;
    update: Prisma.XOR<Prisma.SystemDescriptionUpdateWithoutTenantInput, Prisma.SystemDescriptionUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.SystemDescriptionCreateWithoutTenantInput, Prisma.SystemDescriptionUncheckedCreateWithoutTenantInput>;
};
export type SystemDescriptionUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.SystemDescriptionWhereUniqueInput;
    data: Prisma.XOR<Prisma.SystemDescriptionUpdateWithoutTenantInput, Prisma.SystemDescriptionUncheckedUpdateWithoutTenantInput>;
};
export type SystemDescriptionUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.SystemDescriptionScalarWhereInput;
    data: Prisma.XOR<Prisma.SystemDescriptionUpdateManyMutationInput, Prisma.SystemDescriptionUncheckedUpdateManyWithoutTenantInput>;
};
export type SystemDescriptionScalarWhereInput = {
    AND?: Prisma.SystemDescriptionScalarWhereInput | Prisma.SystemDescriptionScalarWhereInput[];
    OR?: Prisma.SystemDescriptionScalarWhereInput[];
    NOT?: Prisma.SystemDescriptionScalarWhereInput | Prisma.SystemDescriptionScalarWhereInput[];
    id?: Prisma.UuidFilter<"SystemDescription"> | string;
    tenantId?: Prisma.UuidFilter<"SystemDescription"> | string;
    serviceId?: Prisma.UuidFilter<"SystemDescription"> | string;
    filePath?: Prisma.StringFilter<"SystemDescription"> | string;
    sections?: Prisma.JsonFilter<"SystemDescription">;
};
export type SystemDescriptionCreateWithoutServiceInput = {
    id?: string;
    filePath: string;
    sections: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    tenant: Prisma.CompanyCreateNestedOneWithoutSystemDescriptionsInput;
};
export type SystemDescriptionUncheckedCreateWithoutServiceInput = {
    id?: string;
    tenantId: string;
    filePath: string;
    sections: Prisma.JsonNullValueInput | runtime.InputJsonValue;
};
export type SystemDescriptionCreateOrConnectWithoutServiceInput = {
    where: Prisma.SystemDescriptionWhereUniqueInput;
    create: Prisma.XOR<Prisma.SystemDescriptionCreateWithoutServiceInput, Prisma.SystemDescriptionUncheckedCreateWithoutServiceInput>;
};
export type SystemDescriptionUpsertWithoutServiceInput = {
    update: Prisma.XOR<Prisma.SystemDescriptionUpdateWithoutServiceInput, Prisma.SystemDescriptionUncheckedUpdateWithoutServiceInput>;
    create: Prisma.XOR<Prisma.SystemDescriptionCreateWithoutServiceInput, Prisma.SystemDescriptionUncheckedCreateWithoutServiceInput>;
    where?: Prisma.SystemDescriptionWhereInput;
};
export type SystemDescriptionUpdateToOneWithWhereWithoutServiceInput = {
    where?: Prisma.SystemDescriptionWhereInput;
    data: Prisma.XOR<Prisma.SystemDescriptionUpdateWithoutServiceInput, Prisma.SystemDescriptionUncheckedUpdateWithoutServiceInput>;
};
export type SystemDescriptionUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    sections?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutSystemDescriptionsNestedInput;
};
export type SystemDescriptionUncheckedUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    sections?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
};
export type SystemDescriptionCreateManyTenantInput = {
    id?: string;
    serviceId: string;
    filePath: string;
    sections: Prisma.JsonNullValueInput | runtime.InputJsonValue;
};
export type SystemDescriptionUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    sections?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    service?: Prisma.ServiceUpdateOneRequiredWithoutSystemDescriptionNestedInput;
};
export type SystemDescriptionUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    sections?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
};
export type SystemDescriptionUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    sections?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
};
export type SystemDescriptionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    filePath?: boolean;
    sections?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["systemDescription"]>;
export type SystemDescriptionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    filePath?: boolean;
    sections?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["systemDescription"]>;
export type SystemDescriptionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    filePath?: boolean;
    sections?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["systemDescription"]>;
export type SystemDescriptionSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    filePath?: boolean;
    sections?: boolean;
};
export type SystemDescriptionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "serviceId" | "filePath" | "sections", ExtArgs["result"]["systemDescription"]>;
export type SystemDescriptionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type SystemDescriptionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type SystemDescriptionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $SystemDescriptionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "SystemDescription";
    objects: {
        service: Prisma.$ServicePayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        serviceId: string;
        filePath: string;
        sections: runtime.JsonValue;
    }, ExtArgs["result"]["systemDescription"]>;
    composites: {};
};
export type SystemDescriptionGetPayload<S extends boolean | null | undefined | SystemDescriptionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SystemDescriptionPayload, S>;
export type SystemDescriptionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SystemDescriptionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SystemDescriptionCountAggregateInputType | true;
};
export interface SystemDescriptionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['SystemDescription'];
        meta: {
            name: 'SystemDescription';
        };
    };
    findUnique<T extends SystemDescriptionFindUniqueArgs>(args: Prisma.SelectSubset<T, SystemDescriptionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SystemDescriptionClient<runtime.Types.Result.GetResult<Prisma.$SystemDescriptionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SystemDescriptionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SystemDescriptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SystemDescriptionClient<runtime.Types.Result.GetResult<Prisma.$SystemDescriptionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SystemDescriptionFindFirstArgs>(args?: Prisma.SelectSubset<T, SystemDescriptionFindFirstArgs<ExtArgs>>): Prisma.Prisma__SystemDescriptionClient<runtime.Types.Result.GetResult<Prisma.$SystemDescriptionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SystemDescriptionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SystemDescriptionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SystemDescriptionClient<runtime.Types.Result.GetResult<Prisma.$SystemDescriptionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SystemDescriptionFindManyArgs>(args?: Prisma.SelectSubset<T, SystemDescriptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SystemDescriptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SystemDescriptionCreateArgs>(args: Prisma.SelectSubset<T, SystemDescriptionCreateArgs<ExtArgs>>): Prisma.Prisma__SystemDescriptionClient<runtime.Types.Result.GetResult<Prisma.$SystemDescriptionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SystemDescriptionCreateManyArgs>(args?: Prisma.SelectSubset<T, SystemDescriptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends SystemDescriptionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SystemDescriptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SystemDescriptionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends SystemDescriptionDeleteArgs>(args: Prisma.SelectSubset<T, SystemDescriptionDeleteArgs<ExtArgs>>): Prisma.Prisma__SystemDescriptionClient<runtime.Types.Result.GetResult<Prisma.$SystemDescriptionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SystemDescriptionUpdateArgs>(args: Prisma.SelectSubset<T, SystemDescriptionUpdateArgs<ExtArgs>>): Prisma.Prisma__SystemDescriptionClient<runtime.Types.Result.GetResult<Prisma.$SystemDescriptionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SystemDescriptionDeleteManyArgs>(args?: Prisma.SelectSubset<T, SystemDescriptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SystemDescriptionUpdateManyArgs>(args: Prisma.SelectSubset<T, SystemDescriptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends SystemDescriptionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SystemDescriptionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SystemDescriptionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends SystemDescriptionUpsertArgs>(args: Prisma.SelectSubset<T, SystemDescriptionUpsertArgs<ExtArgs>>): Prisma.Prisma__SystemDescriptionClient<runtime.Types.Result.GetResult<Prisma.$SystemDescriptionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SystemDescriptionCountArgs>(args?: Prisma.Subset<T, SystemDescriptionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SystemDescriptionCountAggregateOutputType> : number>;
    aggregate<T extends SystemDescriptionAggregateArgs>(args: Prisma.Subset<T, SystemDescriptionAggregateArgs>): Prisma.PrismaPromise<GetSystemDescriptionAggregateType<T>>;
    groupBy<T extends SystemDescriptionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SystemDescriptionGroupByArgs['orderBy'];
    } : {
        orderBy?: SystemDescriptionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SystemDescriptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSystemDescriptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SystemDescriptionFieldRefs;
}
export interface Prisma__SystemDescriptionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    service<T extends Prisma.ServiceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ServiceDefaultArgs<ExtArgs>>): Prisma.Prisma__ServiceClient<runtime.Types.Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SystemDescriptionFieldRefs {
    readonly id: Prisma.FieldRef<"SystemDescription", 'String'>;
    readonly tenantId: Prisma.FieldRef<"SystemDescription", 'String'>;
    readonly serviceId: Prisma.FieldRef<"SystemDescription", 'String'>;
    readonly filePath: Prisma.FieldRef<"SystemDescription", 'String'>;
    readonly sections: Prisma.FieldRef<"SystemDescription", 'Json'>;
}
export type SystemDescriptionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SystemDescriptionSelect<ExtArgs> | null;
    omit?: Prisma.SystemDescriptionOmit<ExtArgs> | null;
    include?: Prisma.SystemDescriptionInclude<ExtArgs> | null;
    where: Prisma.SystemDescriptionWhereUniqueInput;
};
export type SystemDescriptionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SystemDescriptionSelect<ExtArgs> | null;
    omit?: Prisma.SystemDescriptionOmit<ExtArgs> | null;
    include?: Prisma.SystemDescriptionInclude<ExtArgs> | null;
    where: Prisma.SystemDescriptionWhereUniqueInput;
};
export type SystemDescriptionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SystemDescriptionSelect<ExtArgs> | null;
    omit?: Prisma.SystemDescriptionOmit<ExtArgs> | null;
    include?: Prisma.SystemDescriptionInclude<ExtArgs> | null;
    where?: Prisma.SystemDescriptionWhereInput;
    orderBy?: Prisma.SystemDescriptionOrderByWithRelationInput | Prisma.SystemDescriptionOrderByWithRelationInput[];
    cursor?: Prisma.SystemDescriptionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SystemDescriptionScalarFieldEnum | Prisma.SystemDescriptionScalarFieldEnum[];
};
export type SystemDescriptionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SystemDescriptionSelect<ExtArgs> | null;
    omit?: Prisma.SystemDescriptionOmit<ExtArgs> | null;
    include?: Prisma.SystemDescriptionInclude<ExtArgs> | null;
    where?: Prisma.SystemDescriptionWhereInput;
    orderBy?: Prisma.SystemDescriptionOrderByWithRelationInput | Prisma.SystemDescriptionOrderByWithRelationInput[];
    cursor?: Prisma.SystemDescriptionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SystemDescriptionScalarFieldEnum | Prisma.SystemDescriptionScalarFieldEnum[];
};
export type SystemDescriptionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SystemDescriptionSelect<ExtArgs> | null;
    omit?: Prisma.SystemDescriptionOmit<ExtArgs> | null;
    include?: Prisma.SystemDescriptionInclude<ExtArgs> | null;
    where?: Prisma.SystemDescriptionWhereInput;
    orderBy?: Prisma.SystemDescriptionOrderByWithRelationInput | Prisma.SystemDescriptionOrderByWithRelationInput[];
    cursor?: Prisma.SystemDescriptionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SystemDescriptionScalarFieldEnum | Prisma.SystemDescriptionScalarFieldEnum[];
};
export type SystemDescriptionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SystemDescriptionSelect<ExtArgs> | null;
    omit?: Prisma.SystemDescriptionOmit<ExtArgs> | null;
    include?: Prisma.SystemDescriptionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SystemDescriptionCreateInput, Prisma.SystemDescriptionUncheckedCreateInput>;
};
export type SystemDescriptionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SystemDescriptionCreateManyInput | Prisma.SystemDescriptionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SystemDescriptionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SystemDescriptionSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SystemDescriptionOmit<ExtArgs> | null;
    data: Prisma.SystemDescriptionCreateManyInput | Prisma.SystemDescriptionCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.SystemDescriptionIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type SystemDescriptionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SystemDescriptionSelect<ExtArgs> | null;
    omit?: Prisma.SystemDescriptionOmit<ExtArgs> | null;
    include?: Prisma.SystemDescriptionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SystemDescriptionUpdateInput, Prisma.SystemDescriptionUncheckedUpdateInput>;
    where: Prisma.SystemDescriptionWhereUniqueInput;
};
export type SystemDescriptionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SystemDescriptionUpdateManyMutationInput, Prisma.SystemDescriptionUncheckedUpdateManyInput>;
    where?: Prisma.SystemDescriptionWhereInput;
    limit?: number;
};
export type SystemDescriptionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SystemDescriptionSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SystemDescriptionOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SystemDescriptionUpdateManyMutationInput, Prisma.SystemDescriptionUncheckedUpdateManyInput>;
    where?: Prisma.SystemDescriptionWhereInput;
    limit?: number;
    include?: Prisma.SystemDescriptionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type SystemDescriptionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SystemDescriptionSelect<ExtArgs> | null;
    omit?: Prisma.SystemDescriptionOmit<ExtArgs> | null;
    include?: Prisma.SystemDescriptionInclude<ExtArgs> | null;
    where: Prisma.SystemDescriptionWhereUniqueInput;
    create: Prisma.XOR<Prisma.SystemDescriptionCreateInput, Prisma.SystemDescriptionUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SystemDescriptionUpdateInput, Prisma.SystemDescriptionUncheckedUpdateInput>;
};
export type SystemDescriptionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SystemDescriptionSelect<ExtArgs> | null;
    omit?: Prisma.SystemDescriptionOmit<ExtArgs> | null;
    include?: Prisma.SystemDescriptionInclude<ExtArgs> | null;
    where: Prisma.SystemDescriptionWhereUniqueInput;
};
export type SystemDescriptionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SystemDescriptionWhereInput;
    limit?: number;
};
export type SystemDescriptionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SystemDescriptionSelect<ExtArgs> | null;
    omit?: Prisma.SystemDescriptionOmit<ExtArgs> | null;
    include?: Prisma.SystemDescriptionInclude<ExtArgs> | null;
};
export {};
