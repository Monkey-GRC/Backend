import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ClientCauseControlModel = runtime.Types.Result.DefaultSelection<Prisma.$ClientCauseControlPayload>;
export type AggregateClientCauseControl = {
    _count: ClientCauseControlCountAggregateOutputType | null;
    _min: ClientCauseControlMinAggregateOutputType | null;
    _max: ClientCauseControlMaxAggregateOutputType | null;
};
export type ClientCauseControlMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientCauseId: string | null;
    clientControlId: string | null;
};
export type ClientCauseControlMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientCauseId: string | null;
    clientControlId: string | null;
};
export type ClientCauseControlCountAggregateOutputType = {
    id: number;
    tenantId: number;
    clientCauseId: number;
    clientControlId: number;
    _all: number;
};
export type ClientCauseControlMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientCauseId?: true;
    clientControlId?: true;
};
export type ClientCauseControlMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientCauseId?: true;
    clientControlId?: true;
};
export type ClientCauseControlCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientCauseId?: true;
    clientControlId?: true;
    _all?: true;
};
export type ClientCauseControlAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientCauseControlWhereInput;
    orderBy?: Prisma.ClientCauseControlOrderByWithRelationInput | Prisma.ClientCauseControlOrderByWithRelationInput[];
    cursor?: Prisma.ClientCauseControlWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ClientCauseControlCountAggregateInputType;
    _min?: ClientCauseControlMinAggregateInputType;
    _max?: ClientCauseControlMaxAggregateInputType;
};
export type GetClientCauseControlAggregateType<T extends ClientCauseControlAggregateArgs> = {
    [P in keyof T & keyof AggregateClientCauseControl]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateClientCauseControl[P]> : Prisma.GetScalarType<T[P], AggregateClientCauseControl[P]>;
};
export type ClientCauseControlGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientCauseControlWhereInput;
    orderBy?: Prisma.ClientCauseControlOrderByWithAggregationInput | Prisma.ClientCauseControlOrderByWithAggregationInput[];
    by: Prisma.ClientCauseControlScalarFieldEnum[] | Prisma.ClientCauseControlScalarFieldEnum;
    having?: Prisma.ClientCauseControlScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClientCauseControlCountAggregateInputType | true;
    _min?: ClientCauseControlMinAggregateInputType;
    _max?: ClientCauseControlMaxAggregateInputType;
};
export type ClientCauseControlGroupByOutputType = {
    id: string;
    tenantId: string;
    clientCauseId: string;
    clientControlId: string;
    _count: ClientCauseControlCountAggregateOutputType | null;
    _min: ClientCauseControlMinAggregateOutputType | null;
    _max: ClientCauseControlMaxAggregateOutputType | null;
};
type GetClientCauseControlGroupByPayload<T extends ClientCauseControlGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ClientCauseControlGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ClientCauseControlGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ClientCauseControlGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ClientCauseControlGroupByOutputType[P]>;
}>>;
export type ClientCauseControlWhereInput = {
    AND?: Prisma.ClientCauseControlWhereInput | Prisma.ClientCauseControlWhereInput[];
    OR?: Prisma.ClientCauseControlWhereInput[];
    NOT?: Prisma.ClientCauseControlWhereInput | Prisma.ClientCauseControlWhereInput[];
    id?: Prisma.UuidFilter<"ClientCauseControl"> | string;
    tenantId?: Prisma.UuidFilter<"ClientCauseControl"> | string;
    clientCauseId?: Prisma.UuidFilter<"ClientCauseControl"> | string;
    clientControlId?: Prisma.UuidFilter<"ClientCauseControl"> | string;
    clientCause?: Prisma.XOR<Prisma.ClientCauseScalarRelationFilter, Prisma.ClientCauseWhereInput>;
    clientControl?: Prisma.XOR<Prisma.ClientControlScalarRelationFilter, Prisma.ClientControlWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type ClientCauseControlOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    clientCause?: Prisma.ClientCauseOrderByWithRelationInput;
    clientControl?: Prisma.ClientControlOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type ClientCauseControlWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    clientCauseId_clientControlId?: Prisma.ClientCauseControlClientCauseIdClientControlIdCompoundUniqueInput;
    AND?: Prisma.ClientCauseControlWhereInput | Prisma.ClientCauseControlWhereInput[];
    OR?: Prisma.ClientCauseControlWhereInput[];
    NOT?: Prisma.ClientCauseControlWhereInput | Prisma.ClientCauseControlWhereInput[];
    tenantId?: Prisma.UuidFilter<"ClientCauseControl"> | string;
    clientCauseId?: Prisma.UuidFilter<"ClientCauseControl"> | string;
    clientControlId?: Prisma.UuidFilter<"ClientCauseControl"> | string;
    clientCause?: Prisma.XOR<Prisma.ClientCauseScalarRelationFilter, Prisma.ClientCauseWhereInput>;
    clientControl?: Prisma.XOR<Prisma.ClientControlScalarRelationFilter, Prisma.ClientControlWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id" | "clientCauseId_clientControlId">;
export type ClientCauseControlOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    _count?: Prisma.ClientCauseControlCountOrderByAggregateInput;
    _max?: Prisma.ClientCauseControlMaxOrderByAggregateInput;
    _min?: Prisma.ClientCauseControlMinOrderByAggregateInput;
};
export type ClientCauseControlScalarWhereWithAggregatesInput = {
    AND?: Prisma.ClientCauseControlScalarWhereWithAggregatesInput | Prisma.ClientCauseControlScalarWhereWithAggregatesInput[];
    OR?: Prisma.ClientCauseControlScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ClientCauseControlScalarWhereWithAggregatesInput | Prisma.ClientCauseControlScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ClientCauseControl"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ClientCauseControl"> | string;
    clientCauseId?: Prisma.UuidWithAggregatesFilter<"ClientCauseControl"> | string;
    clientControlId?: Prisma.UuidWithAggregatesFilter<"ClientCauseControl"> | string;
};
export type ClientCauseControlCreateInput = {
    id?: string;
    clientCause: Prisma.ClientCauseCreateNestedOneWithoutCauseControlsInput;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutClientCauseControlsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientCauseControlsInput;
};
export type ClientCauseControlUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    clientCauseId: string;
    clientControlId: string;
};
export type ClientCauseControlUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCause?: Prisma.ClientCauseUpdateOneRequiredWithoutCauseControlsNestedInput;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutClientCauseControlsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientCauseControlsNestedInput;
};
export type ClientCauseControlUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientCauseControlCreateManyInput = {
    id?: string;
    tenantId: string;
    clientCauseId: string;
    clientControlId: string;
};
export type ClientCauseControlUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientCauseControlUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientCauseControlListRelationFilter = {
    every?: Prisma.ClientCauseControlWhereInput;
    some?: Prisma.ClientCauseControlWhereInput;
    none?: Prisma.ClientCauseControlWhereInput;
};
export type ClientCauseControlOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ClientCauseControlClientCauseIdClientControlIdCompoundUniqueInput = {
    clientCauseId: string;
    clientControlId: string;
};
export type ClientCauseControlCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
};
export type ClientCauseControlMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
};
export type ClientCauseControlMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
};
export type ClientCauseControlCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutTenantInput, Prisma.ClientCauseControlUncheckedCreateWithoutTenantInput> | Prisma.ClientCauseControlCreateWithoutTenantInput[] | Prisma.ClientCauseControlUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientCauseControlCreateOrConnectWithoutTenantInput | Prisma.ClientCauseControlCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ClientCauseControlCreateManyTenantInputEnvelope;
    connect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
};
export type ClientCauseControlUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutTenantInput, Prisma.ClientCauseControlUncheckedCreateWithoutTenantInput> | Prisma.ClientCauseControlCreateWithoutTenantInput[] | Prisma.ClientCauseControlUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientCauseControlCreateOrConnectWithoutTenantInput | Prisma.ClientCauseControlCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ClientCauseControlCreateManyTenantInputEnvelope;
    connect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
};
export type ClientCauseControlUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutTenantInput, Prisma.ClientCauseControlUncheckedCreateWithoutTenantInput> | Prisma.ClientCauseControlCreateWithoutTenantInput[] | Prisma.ClientCauseControlUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientCauseControlCreateOrConnectWithoutTenantInput | Prisma.ClientCauseControlCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ClientCauseControlUpsertWithWhereUniqueWithoutTenantInput | Prisma.ClientCauseControlUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ClientCauseControlCreateManyTenantInputEnvelope;
    set?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    disconnect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    delete?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    connect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    update?: Prisma.ClientCauseControlUpdateWithWhereUniqueWithoutTenantInput | Prisma.ClientCauseControlUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ClientCauseControlUpdateManyWithWhereWithoutTenantInput | Prisma.ClientCauseControlUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ClientCauseControlScalarWhereInput | Prisma.ClientCauseControlScalarWhereInput[];
};
export type ClientCauseControlUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutTenantInput, Prisma.ClientCauseControlUncheckedCreateWithoutTenantInput> | Prisma.ClientCauseControlCreateWithoutTenantInput[] | Prisma.ClientCauseControlUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientCauseControlCreateOrConnectWithoutTenantInput | Prisma.ClientCauseControlCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ClientCauseControlUpsertWithWhereUniqueWithoutTenantInput | Prisma.ClientCauseControlUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ClientCauseControlCreateManyTenantInputEnvelope;
    set?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    disconnect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    delete?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    connect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    update?: Prisma.ClientCauseControlUpdateWithWhereUniqueWithoutTenantInput | Prisma.ClientCauseControlUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ClientCauseControlUpdateManyWithWhereWithoutTenantInput | Prisma.ClientCauseControlUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ClientCauseControlScalarWhereInput | Prisma.ClientCauseControlScalarWhereInput[];
};
export type ClientCauseControlCreateNestedManyWithoutClientControlInput = {
    create?: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutClientControlInput, Prisma.ClientCauseControlUncheckedCreateWithoutClientControlInput> | Prisma.ClientCauseControlCreateWithoutClientControlInput[] | Prisma.ClientCauseControlUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ClientCauseControlCreateOrConnectWithoutClientControlInput | Prisma.ClientCauseControlCreateOrConnectWithoutClientControlInput[];
    createMany?: Prisma.ClientCauseControlCreateManyClientControlInputEnvelope;
    connect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
};
export type ClientCauseControlUncheckedCreateNestedManyWithoutClientControlInput = {
    create?: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutClientControlInput, Prisma.ClientCauseControlUncheckedCreateWithoutClientControlInput> | Prisma.ClientCauseControlCreateWithoutClientControlInput[] | Prisma.ClientCauseControlUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ClientCauseControlCreateOrConnectWithoutClientControlInput | Prisma.ClientCauseControlCreateOrConnectWithoutClientControlInput[];
    createMany?: Prisma.ClientCauseControlCreateManyClientControlInputEnvelope;
    connect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
};
export type ClientCauseControlUpdateManyWithoutClientControlNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutClientControlInput, Prisma.ClientCauseControlUncheckedCreateWithoutClientControlInput> | Prisma.ClientCauseControlCreateWithoutClientControlInput[] | Prisma.ClientCauseControlUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ClientCauseControlCreateOrConnectWithoutClientControlInput | Prisma.ClientCauseControlCreateOrConnectWithoutClientControlInput[];
    upsert?: Prisma.ClientCauseControlUpsertWithWhereUniqueWithoutClientControlInput | Prisma.ClientCauseControlUpsertWithWhereUniqueWithoutClientControlInput[];
    createMany?: Prisma.ClientCauseControlCreateManyClientControlInputEnvelope;
    set?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    disconnect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    delete?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    connect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    update?: Prisma.ClientCauseControlUpdateWithWhereUniqueWithoutClientControlInput | Prisma.ClientCauseControlUpdateWithWhereUniqueWithoutClientControlInput[];
    updateMany?: Prisma.ClientCauseControlUpdateManyWithWhereWithoutClientControlInput | Prisma.ClientCauseControlUpdateManyWithWhereWithoutClientControlInput[];
    deleteMany?: Prisma.ClientCauseControlScalarWhereInput | Prisma.ClientCauseControlScalarWhereInput[];
};
export type ClientCauseControlUncheckedUpdateManyWithoutClientControlNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutClientControlInput, Prisma.ClientCauseControlUncheckedCreateWithoutClientControlInput> | Prisma.ClientCauseControlCreateWithoutClientControlInput[] | Prisma.ClientCauseControlUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ClientCauseControlCreateOrConnectWithoutClientControlInput | Prisma.ClientCauseControlCreateOrConnectWithoutClientControlInput[];
    upsert?: Prisma.ClientCauseControlUpsertWithWhereUniqueWithoutClientControlInput | Prisma.ClientCauseControlUpsertWithWhereUniqueWithoutClientControlInput[];
    createMany?: Prisma.ClientCauseControlCreateManyClientControlInputEnvelope;
    set?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    disconnect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    delete?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    connect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    update?: Prisma.ClientCauseControlUpdateWithWhereUniqueWithoutClientControlInput | Prisma.ClientCauseControlUpdateWithWhereUniqueWithoutClientControlInput[];
    updateMany?: Prisma.ClientCauseControlUpdateManyWithWhereWithoutClientControlInput | Prisma.ClientCauseControlUpdateManyWithWhereWithoutClientControlInput[];
    deleteMany?: Prisma.ClientCauseControlScalarWhereInput | Prisma.ClientCauseControlScalarWhereInput[];
};
export type ClientCauseControlCreateNestedManyWithoutClientCauseInput = {
    create?: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutClientCauseInput, Prisma.ClientCauseControlUncheckedCreateWithoutClientCauseInput> | Prisma.ClientCauseControlCreateWithoutClientCauseInput[] | Prisma.ClientCauseControlUncheckedCreateWithoutClientCauseInput[];
    connectOrCreate?: Prisma.ClientCauseControlCreateOrConnectWithoutClientCauseInput | Prisma.ClientCauseControlCreateOrConnectWithoutClientCauseInput[];
    createMany?: Prisma.ClientCauseControlCreateManyClientCauseInputEnvelope;
    connect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
};
export type ClientCauseControlUncheckedCreateNestedManyWithoutClientCauseInput = {
    create?: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutClientCauseInput, Prisma.ClientCauseControlUncheckedCreateWithoutClientCauseInput> | Prisma.ClientCauseControlCreateWithoutClientCauseInput[] | Prisma.ClientCauseControlUncheckedCreateWithoutClientCauseInput[];
    connectOrCreate?: Prisma.ClientCauseControlCreateOrConnectWithoutClientCauseInput | Prisma.ClientCauseControlCreateOrConnectWithoutClientCauseInput[];
    createMany?: Prisma.ClientCauseControlCreateManyClientCauseInputEnvelope;
    connect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
};
export type ClientCauseControlUpdateManyWithoutClientCauseNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutClientCauseInput, Prisma.ClientCauseControlUncheckedCreateWithoutClientCauseInput> | Prisma.ClientCauseControlCreateWithoutClientCauseInput[] | Prisma.ClientCauseControlUncheckedCreateWithoutClientCauseInput[];
    connectOrCreate?: Prisma.ClientCauseControlCreateOrConnectWithoutClientCauseInput | Prisma.ClientCauseControlCreateOrConnectWithoutClientCauseInput[];
    upsert?: Prisma.ClientCauseControlUpsertWithWhereUniqueWithoutClientCauseInput | Prisma.ClientCauseControlUpsertWithWhereUniqueWithoutClientCauseInput[];
    createMany?: Prisma.ClientCauseControlCreateManyClientCauseInputEnvelope;
    set?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    disconnect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    delete?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    connect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    update?: Prisma.ClientCauseControlUpdateWithWhereUniqueWithoutClientCauseInput | Prisma.ClientCauseControlUpdateWithWhereUniqueWithoutClientCauseInput[];
    updateMany?: Prisma.ClientCauseControlUpdateManyWithWhereWithoutClientCauseInput | Prisma.ClientCauseControlUpdateManyWithWhereWithoutClientCauseInput[];
    deleteMany?: Prisma.ClientCauseControlScalarWhereInput | Prisma.ClientCauseControlScalarWhereInput[];
};
export type ClientCauseControlUncheckedUpdateManyWithoutClientCauseNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutClientCauseInput, Prisma.ClientCauseControlUncheckedCreateWithoutClientCauseInput> | Prisma.ClientCauseControlCreateWithoutClientCauseInput[] | Prisma.ClientCauseControlUncheckedCreateWithoutClientCauseInput[];
    connectOrCreate?: Prisma.ClientCauseControlCreateOrConnectWithoutClientCauseInput | Prisma.ClientCauseControlCreateOrConnectWithoutClientCauseInput[];
    upsert?: Prisma.ClientCauseControlUpsertWithWhereUniqueWithoutClientCauseInput | Prisma.ClientCauseControlUpsertWithWhereUniqueWithoutClientCauseInput[];
    createMany?: Prisma.ClientCauseControlCreateManyClientCauseInputEnvelope;
    set?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    disconnect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    delete?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    connect?: Prisma.ClientCauseControlWhereUniqueInput | Prisma.ClientCauseControlWhereUniqueInput[];
    update?: Prisma.ClientCauseControlUpdateWithWhereUniqueWithoutClientCauseInput | Prisma.ClientCauseControlUpdateWithWhereUniqueWithoutClientCauseInput[];
    updateMany?: Prisma.ClientCauseControlUpdateManyWithWhereWithoutClientCauseInput | Prisma.ClientCauseControlUpdateManyWithWhereWithoutClientCauseInput[];
    deleteMany?: Prisma.ClientCauseControlScalarWhereInput | Prisma.ClientCauseControlScalarWhereInput[];
};
export type ClientCauseControlCreateWithoutTenantInput = {
    id?: string;
    clientCause: Prisma.ClientCauseCreateNestedOneWithoutCauseControlsInput;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutClientCauseControlsInput;
};
export type ClientCauseControlUncheckedCreateWithoutTenantInput = {
    id?: string;
    clientCauseId: string;
    clientControlId: string;
};
export type ClientCauseControlCreateOrConnectWithoutTenantInput = {
    where: Prisma.ClientCauseControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutTenantInput, Prisma.ClientCauseControlUncheckedCreateWithoutTenantInput>;
};
export type ClientCauseControlCreateManyTenantInputEnvelope = {
    data: Prisma.ClientCauseControlCreateManyTenantInput | Prisma.ClientCauseControlCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ClientCauseControlUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ClientCauseControlWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientCauseControlUpdateWithoutTenantInput, Prisma.ClientCauseControlUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutTenantInput, Prisma.ClientCauseControlUncheckedCreateWithoutTenantInput>;
};
export type ClientCauseControlUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ClientCauseControlWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientCauseControlUpdateWithoutTenantInput, Prisma.ClientCauseControlUncheckedUpdateWithoutTenantInput>;
};
export type ClientCauseControlUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ClientCauseControlScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientCauseControlUpdateManyMutationInput, Prisma.ClientCauseControlUncheckedUpdateManyWithoutTenantInput>;
};
export type ClientCauseControlScalarWhereInput = {
    AND?: Prisma.ClientCauseControlScalarWhereInput | Prisma.ClientCauseControlScalarWhereInput[];
    OR?: Prisma.ClientCauseControlScalarWhereInput[];
    NOT?: Prisma.ClientCauseControlScalarWhereInput | Prisma.ClientCauseControlScalarWhereInput[];
    id?: Prisma.UuidFilter<"ClientCauseControl"> | string;
    tenantId?: Prisma.UuidFilter<"ClientCauseControl"> | string;
    clientCauseId?: Prisma.UuidFilter<"ClientCauseControl"> | string;
    clientControlId?: Prisma.UuidFilter<"ClientCauseControl"> | string;
};
export type ClientCauseControlCreateWithoutClientControlInput = {
    id?: string;
    clientCause: Prisma.ClientCauseCreateNestedOneWithoutCauseControlsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientCauseControlsInput;
};
export type ClientCauseControlUncheckedCreateWithoutClientControlInput = {
    id?: string;
    tenantId: string;
    clientCauseId: string;
};
export type ClientCauseControlCreateOrConnectWithoutClientControlInput = {
    where: Prisma.ClientCauseControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutClientControlInput, Prisma.ClientCauseControlUncheckedCreateWithoutClientControlInput>;
};
export type ClientCauseControlCreateManyClientControlInputEnvelope = {
    data: Prisma.ClientCauseControlCreateManyClientControlInput | Prisma.ClientCauseControlCreateManyClientControlInput[];
    skipDuplicates?: boolean;
};
export type ClientCauseControlUpsertWithWhereUniqueWithoutClientControlInput = {
    where: Prisma.ClientCauseControlWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientCauseControlUpdateWithoutClientControlInput, Prisma.ClientCauseControlUncheckedUpdateWithoutClientControlInput>;
    create: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutClientControlInput, Prisma.ClientCauseControlUncheckedCreateWithoutClientControlInput>;
};
export type ClientCauseControlUpdateWithWhereUniqueWithoutClientControlInput = {
    where: Prisma.ClientCauseControlWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientCauseControlUpdateWithoutClientControlInput, Prisma.ClientCauseControlUncheckedUpdateWithoutClientControlInput>;
};
export type ClientCauseControlUpdateManyWithWhereWithoutClientControlInput = {
    where: Prisma.ClientCauseControlScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientCauseControlUpdateManyMutationInput, Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientControlInput>;
};
export type ClientCauseControlCreateWithoutClientCauseInput = {
    id?: string;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutClientCauseControlsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientCauseControlsInput;
};
export type ClientCauseControlUncheckedCreateWithoutClientCauseInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
};
export type ClientCauseControlCreateOrConnectWithoutClientCauseInput = {
    where: Prisma.ClientCauseControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutClientCauseInput, Prisma.ClientCauseControlUncheckedCreateWithoutClientCauseInput>;
};
export type ClientCauseControlCreateManyClientCauseInputEnvelope = {
    data: Prisma.ClientCauseControlCreateManyClientCauseInput | Prisma.ClientCauseControlCreateManyClientCauseInput[];
    skipDuplicates?: boolean;
};
export type ClientCauseControlUpsertWithWhereUniqueWithoutClientCauseInput = {
    where: Prisma.ClientCauseControlWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientCauseControlUpdateWithoutClientCauseInput, Prisma.ClientCauseControlUncheckedUpdateWithoutClientCauseInput>;
    create: Prisma.XOR<Prisma.ClientCauseControlCreateWithoutClientCauseInput, Prisma.ClientCauseControlUncheckedCreateWithoutClientCauseInput>;
};
export type ClientCauseControlUpdateWithWhereUniqueWithoutClientCauseInput = {
    where: Prisma.ClientCauseControlWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientCauseControlUpdateWithoutClientCauseInput, Prisma.ClientCauseControlUncheckedUpdateWithoutClientCauseInput>;
};
export type ClientCauseControlUpdateManyWithWhereWithoutClientCauseInput = {
    where: Prisma.ClientCauseControlScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientCauseControlUpdateManyMutationInput, Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientCauseInput>;
};
export type ClientCauseControlCreateManyTenantInput = {
    id?: string;
    clientCauseId: string;
    clientControlId: string;
};
export type ClientCauseControlUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCause?: Prisma.ClientCauseUpdateOneRequiredWithoutCauseControlsNestedInput;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutClientCauseControlsNestedInput;
};
export type ClientCauseControlUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientCauseControlUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientCauseControlCreateManyClientControlInput = {
    id?: string;
    tenantId: string;
    clientCauseId: string;
};
export type ClientCauseControlUpdateWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCause?: Prisma.ClientCauseUpdateOneRequiredWithoutCauseControlsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientCauseControlsNestedInput;
};
export type ClientCauseControlUncheckedUpdateWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientCauseControlUncheckedUpdateManyWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientCauseControlCreateManyClientCauseInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
};
export type ClientCauseControlUpdateWithoutClientCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutClientCauseControlsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientCauseControlsNestedInput;
};
export type ClientCauseControlUncheckedUpdateWithoutClientCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientCauseControlUncheckedUpdateManyWithoutClientCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientCauseControlSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientCauseId?: boolean;
    clientControlId?: boolean;
    clientCause?: boolean | Prisma.ClientCauseDefaultArgs<ExtArgs>;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientCauseControl"]>;
export type ClientCauseControlSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientCauseId?: boolean;
    clientControlId?: boolean;
    clientCause?: boolean | Prisma.ClientCauseDefaultArgs<ExtArgs>;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientCauseControl"]>;
export type ClientCauseControlSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientCauseId?: boolean;
    clientControlId?: boolean;
    clientCause?: boolean | Prisma.ClientCauseDefaultArgs<ExtArgs>;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientCauseControl"]>;
export type ClientCauseControlSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    clientCauseId?: boolean;
    clientControlId?: boolean;
};
export type ClientCauseControlOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "clientCauseId" | "clientControlId", ExtArgs["result"]["clientCauseControl"]>;
export type ClientCauseControlInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientCause?: boolean | Prisma.ClientCauseDefaultArgs<ExtArgs>;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ClientCauseControlIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientCause?: boolean | Prisma.ClientCauseDefaultArgs<ExtArgs>;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ClientCauseControlIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientCause?: boolean | Prisma.ClientCauseDefaultArgs<ExtArgs>;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ClientCauseControlPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ClientCauseControl";
    objects: {
        clientCause: Prisma.$ClientCausePayload<ExtArgs>;
        clientControl: Prisma.$ClientControlPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        clientCauseId: string;
        clientControlId: string;
    }, ExtArgs["result"]["clientCauseControl"]>;
    composites: {};
};
export type ClientCauseControlGetPayload<S extends boolean | null | undefined | ClientCauseControlDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ClientCauseControlPayload, S>;
export type ClientCauseControlCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ClientCauseControlFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClientCauseControlCountAggregateInputType | true;
};
export interface ClientCauseControlDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ClientCauseControl'];
        meta: {
            name: 'ClientCauseControl';
        };
    };
    findUnique<T extends ClientCauseControlFindUniqueArgs>(args: Prisma.SelectSubset<T, ClientCauseControlFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ClientCauseControlClient<runtime.Types.Result.GetResult<Prisma.$ClientCauseControlPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ClientCauseControlFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ClientCauseControlFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientCauseControlClient<runtime.Types.Result.GetResult<Prisma.$ClientCauseControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ClientCauseControlFindFirstArgs>(args?: Prisma.SelectSubset<T, ClientCauseControlFindFirstArgs<ExtArgs>>): Prisma.Prisma__ClientCauseControlClient<runtime.Types.Result.GetResult<Prisma.$ClientCauseControlPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ClientCauseControlFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ClientCauseControlFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientCauseControlClient<runtime.Types.Result.GetResult<Prisma.$ClientCauseControlPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ClientCauseControlFindManyArgs>(args?: Prisma.SelectSubset<T, ClientCauseControlFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientCauseControlPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ClientCauseControlCreateArgs>(args: Prisma.SelectSubset<T, ClientCauseControlCreateArgs<ExtArgs>>): Prisma.Prisma__ClientCauseControlClient<runtime.Types.Result.GetResult<Prisma.$ClientCauseControlPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ClientCauseControlCreateManyArgs>(args?: Prisma.SelectSubset<T, ClientCauseControlCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ClientCauseControlCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ClientCauseControlCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientCauseControlPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ClientCauseControlDeleteArgs>(args: Prisma.SelectSubset<T, ClientCauseControlDeleteArgs<ExtArgs>>): Prisma.Prisma__ClientCauseControlClient<runtime.Types.Result.GetResult<Prisma.$ClientCauseControlPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ClientCauseControlUpdateArgs>(args: Prisma.SelectSubset<T, ClientCauseControlUpdateArgs<ExtArgs>>): Prisma.Prisma__ClientCauseControlClient<runtime.Types.Result.GetResult<Prisma.$ClientCauseControlPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ClientCauseControlDeleteManyArgs>(args?: Prisma.SelectSubset<T, ClientCauseControlDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ClientCauseControlUpdateManyArgs>(args: Prisma.SelectSubset<T, ClientCauseControlUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ClientCauseControlUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ClientCauseControlUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientCauseControlPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ClientCauseControlUpsertArgs>(args: Prisma.SelectSubset<T, ClientCauseControlUpsertArgs<ExtArgs>>): Prisma.Prisma__ClientCauseControlClient<runtime.Types.Result.GetResult<Prisma.$ClientCauseControlPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ClientCauseControlCountArgs>(args?: Prisma.Subset<T, ClientCauseControlCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ClientCauseControlCountAggregateOutputType> : number>;
    aggregate<T extends ClientCauseControlAggregateArgs>(args: Prisma.Subset<T, ClientCauseControlAggregateArgs>): Prisma.PrismaPromise<GetClientCauseControlAggregateType<T>>;
    groupBy<T extends ClientCauseControlGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ClientCauseControlGroupByArgs['orderBy'];
    } : {
        orderBy?: ClientCauseControlGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ClientCauseControlGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientCauseControlGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ClientCauseControlFieldRefs;
}
export interface Prisma__ClientCauseControlClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    clientCause<T extends Prisma.ClientCauseDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientCauseDefaultArgs<ExtArgs>>): Prisma.Prisma__ClientCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    clientControl<T extends Prisma.ClientControlDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientControlDefaultArgs<ExtArgs>>): Prisma.Prisma__ClientControlClient<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ClientCauseControlFieldRefs {
    readonly id: Prisma.FieldRef<"ClientCauseControl", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ClientCauseControl", 'String'>;
    readonly clientCauseId: Prisma.FieldRef<"ClientCauseControl", 'String'>;
    readonly clientControlId: Prisma.FieldRef<"ClientCauseControl", 'String'>;
}
export type ClientCauseControlFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseControlOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseControlInclude<ExtArgs> | null;
    where: Prisma.ClientCauseControlWhereUniqueInput;
};
export type ClientCauseControlFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseControlOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseControlInclude<ExtArgs> | null;
    where: Prisma.ClientCauseControlWhereUniqueInput;
};
export type ClientCauseControlFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseControlOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseControlInclude<ExtArgs> | null;
    where?: Prisma.ClientCauseControlWhereInput;
    orderBy?: Prisma.ClientCauseControlOrderByWithRelationInput | Prisma.ClientCauseControlOrderByWithRelationInput[];
    cursor?: Prisma.ClientCauseControlWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientCauseControlScalarFieldEnum | Prisma.ClientCauseControlScalarFieldEnum[];
};
export type ClientCauseControlFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseControlOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseControlInclude<ExtArgs> | null;
    where?: Prisma.ClientCauseControlWhereInput;
    orderBy?: Prisma.ClientCauseControlOrderByWithRelationInput | Prisma.ClientCauseControlOrderByWithRelationInput[];
    cursor?: Prisma.ClientCauseControlWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientCauseControlScalarFieldEnum | Prisma.ClientCauseControlScalarFieldEnum[];
};
export type ClientCauseControlFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseControlOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseControlInclude<ExtArgs> | null;
    where?: Prisma.ClientCauseControlWhereInput;
    orderBy?: Prisma.ClientCauseControlOrderByWithRelationInput | Prisma.ClientCauseControlOrderByWithRelationInput[];
    cursor?: Prisma.ClientCauseControlWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientCauseControlScalarFieldEnum | Prisma.ClientCauseControlScalarFieldEnum[];
};
export type ClientCauseControlCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseControlOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseControlInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientCauseControlCreateInput, Prisma.ClientCauseControlUncheckedCreateInput>;
};
export type ClientCauseControlCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ClientCauseControlCreateManyInput | Prisma.ClientCauseControlCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClientCauseControlCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseControlSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientCauseControlOmit<ExtArgs> | null;
    data: Prisma.ClientCauseControlCreateManyInput | Prisma.ClientCauseControlCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ClientCauseControlIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ClientCauseControlUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseControlOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseControlInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientCauseControlUpdateInput, Prisma.ClientCauseControlUncheckedUpdateInput>;
    where: Prisma.ClientCauseControlWhereUniqueInput;
};
export type ClientCauseControlUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ClientCauseControlUpdateManyMutationInput, Prisma.ClientCauseControlUncheckedUpdateManyInput>;
    where?: Prisma.ClientCauseControlWhereInput;
    limit?: number;
};
export type ClientCauseControlUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseControlSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientCauseControlOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientCauseControlUpdateManyMutationInput, Prisma.ClientCauseControlUncheckedUpdateManyInput>;
    where?: Prisma.ClientCauseControlWhereInput;
    limit?: number;
    include?: Prisma.ClientCauseControlIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ClientCauseControlUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseControlOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseControlInclude<ExtArgs> | null;
    where: Prisma.ClientCauseControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientCauseControlCreateInput, Prisma.ClientCauseControlUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ClientCauseControlUpdateInput, Prisma.ClientCauseControlUncheckedUpdateInput>;
};
export type ClientCauseControlDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseControlOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseControlInclude<ExtArgs> | null;
    where: Prisma.ClientCauseControlWhereUniqueInput;
};
export type ClientCauseControlDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientCauseControlWhereInput;
    limit?: number;
};
export type ClientCauseControlDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseControlOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseControlInclude<ExtArgs> | null;
};
export {};
