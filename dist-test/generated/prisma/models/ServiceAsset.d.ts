import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ServiceAssetModel = runtime.Types.Result.DefaultSelection<Prisma.$ServiceAssetPayload>;
export type AggregateServiceAsset = {
    _count: ServiceAssetCountAggregateOutputType | null;
    _min: ServiceAssetMinAggregateOutputType | null;
    _max: ServiceAssetMaxAggregateOutputType | null;
};
export type ServiceAssetMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    assetId: string | null;
    serviceId: string | null;
};
export type ServiceAssetMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    assetId: string | null;
    serviceId: string | null;
};
export type ServiceAssetCountAggregateOutputType = {
    id: number;
    tenantId: number;
    assetId: number;
    serviceId: number;
    _all: number;
};
export type ServiceAssetMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    assetId?: true;
    serviceId?: true;
};
export type ServiceAssetMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    assetId?: true;
    serviceId?: true;
};
export type ServiceAssetCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    assetId?: true;
    serviceId?: true;
    _all?: true;
};
export type ServiceAssetAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceAssetWhereInput;
    orderBy?: Prisma.ServiceAssetOrderByWithRelationInput | Prisma.ServiceAssetOrderByWithRelationInput[];
    cursor?: Prisma.ServiceAssetWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ServiceAssetCountAggregateInputType;
    _min?: ServiceAssetMinAggregateInputType;
    _max?: ServiceAssetMaxAggregateInputType;
};
export type GetServiceAssetAggregateType<T extends ServiceAssetAggregateArgs> = {
    [P in keyof T & keyof AggregateServiceAsset]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateServiceAsset[P]> : Prisma.GetScalarType<T[P], AggregateServiceAsset[P]>;
};
export type ServiceAssetGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceAssetWhereInput;
    orderBy?: Prisma.ServiceAssetOrderByWithAggregationInput | Prisma.ServiceAssetOrderByWithAggregationInput[];
    by: Prisma.ServiceAssetScalarFieldEnum[] | Prisma.ServiceAssetScalarFieldEnum;
    having?: Prisma.ServiceAssetScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ServiceAssetCountAggregateInputType | true;
    _min?: ServiceAssetMinAggregateInputType;
    _max?: ServiceAssetMaxAggregateInputType;
};
export type ServiceAssetGroupByOutputType = {
    id: string;
    tenantId: string;
    assetId: string;
    serviceId: string;
    _count: ServiceAssetCountAggregateOutputType | null;
    _min: ServiceAssetMinAggregateOutputType | null;
    _max: ServiceAssetMaxAggregateOutputType | null;
};
type GetServiceAssetGroupByPayload<T extends ServiceAssetGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ServiceAssetGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ServiceAssetGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ServiceAssetGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ServiceAssetGroupByOutputType[P]>;
}>>;
export type ServiceAssetWhereInput = {
    AND?: Prisma.ServiceAssetWhereInput | Prisma.ServiceAssetWhereInput[];
    OR?: Prisma.ServiceAssetWhereInput[];
    NOT?: Prisma.ServiceAssetWhereInput | Prisma.ServiceAssetWhereInput[];
    id?: Prisma.UuidFilter<"ServiceAsset"> | string;
    tenantId?: Prisma.UuidFilter<"ServiceAsset"> | string;
    assetId?: Prisma.UuidFilter<"ServiceAsset"> | string;
    serviceId?: Prisma.UuidFilter<"ServiceAsset"> | string;
    asset?: Prisma.XOR<Prisma.AssetScalarRelationFilter, Prisma.AssetWhereInput>;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type ServiceAssetOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    asset?: Prisma.AssetOrderByWithRelationInput;
    service?: Prisma.ServiceOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type ServiceAssetWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    assetId_serviceId?: Prisma.ServiceAssetAssetIdServiceIdCompoundUniqueInput;
    AND?: Prisma.ServiceAssetWhereInput | Prisma.ServiceAssetWhereInput[];
    OR?: Prisma.ServiceAssetWhereInput[];
    NOT?: Prisma.ServiceAssetWhereInput | Prisma.ServiceAssetWhereInput[];
    tenantId?: Prisma.UuidFilter<"ServiceAsset"> | string;
    assetId?: Prisma.UuidFilter<"ServiceAsset"> | string;
    serviceId?: Prisma.UuidFilter<"ServiceAsset"> | string;
    asset?: Prisma.XOR<Prisma.AssetScalarRelationFilter, Prisma.AssetWhereInput>;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id" | "assetId_serviceId">;
export type ServiceAssetOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    _count?: Prisma.ServiceAssetCountOrderByAggregateInput;
    _max?: Prisma.ServiceAssetMaxOrderByAggregateInput;
    _min?: Prisma.ServiceAssetMinOrderByAggregateInput;
};
export type ServiceAssetScalarWhereWithAggregatesInput = {
    AND?: Prisma.ServiceAssetScalarWhereWithAggregatesInput | Prisma.ServiceAssetScalarWhereWithAggregatesInput[];
    OR?: Prisma.ServiceAssetScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ServiceAssetScalarWhereWithAggregatesInput | Prisma.ServiceAssetScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ServiceAsset"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ServiceAsset"> | string;
    assetId?: Prisma.UuidWithAggregatesFilter<"ServiceAsset"> | string;
    serviceId?: Prisma.UuidWithAggregatesFilter<"ServiceAsset"> | string;
};
export type ServiceAssetCreateInput = {
    id?: string;
    asset: Prisma.AssetCreateNestedOneWithoutServiceAssetsInput;
    service: Prisma.ServiceCreateNestedOneWithoutServiceAssetsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutServiceAssetsInput;
};
export type ServiceAssetUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    serviceId: string;
};
export type ServiceAssetUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    asset?: Prisma.AssetUpdateOneRequiredWithoutServiceAssetsNestedInput;
    service?: Prisma.ServiceUpdateOneRequiredWithoutServiceAssetsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutServiceAssetsNestedInput;
};
export type ServiceAssetUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceAssetCreateManyInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    serviceId: string;
};
export type ServiceAssetUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceAssetUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceAssetListRelationFilter = {
    every?: Prisma.ServiceAssetWhereInput;
    some?: Prisma.ServiceAssetWhereInput;
    none?: Prisma.ServiceAssetWhereInput;
};
export type ServiceAssetOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ServiceAssetAssetIdServiceIdCompoundUniqueInput = {
    assetId: string;
    serviceId: string;
};
export type ServiceAssetCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
};
export type ServiceAssetMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
};
export type ServiceAssetMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
};
export type ServiceAssetCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ServiceAssetCreateWithoutTenantInput, Prisma.ServiceAssetUncheckedCreateWithoutTenantInput> | Prisma.ServiceAssetCreateWithoutTenantInput[] | Prisma.ServiceAssetUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceAssetCreateOrConnectWithoutTenantInput | Prisma.ServiceAssetCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ServiceAssetCreateManyTenantInputEnvelope;
    connect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
};
export type ServiceAssetUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ServiceAssetCreateWithoutTenantInput, Prisma.ServiceAssetUncheckedCreateWithoutTenantInput> | Prisma.ServiceAssetCreateWithoutTenantInput[] | Prisma.ServiceAssetUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceAssetCreateOrConnectWithoutTenantInput | Prisma.ServiceAssetCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ServiceAssetCreateManyTenantInputEnvelope;
    connect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
};
export type ServiceAssetUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceAssetCreateWithoutTenantInput, Prisma.ServiceAssetUncheckedCreateWithoutTenantInput> | Prisma.ServiceAssetCreateWithoutTenantInput[] | Prisma.ServiceAssetUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceAssetCreateOrConnectWithoutTenantInput | Prisma.ServiceAssetCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ServiceAssetUpsertWithWhereUniqueWithoutTenantInput | Prisma.ServiceAssetUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ServiceAssetCreateManyTenantInputEnvelope;
    set?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    disconnect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    delete?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    connect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    update?: Prisma.ServiceAssetUpdateWithWhereUniqueWithoutTenantInput | Prisma.ServiceAssetUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ServiceAssetUpdateManyWithWhereWithoutTenantInput | Prisma.ServiceAssetUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ServiceAssetScalarWhereInput | Prisma.ServiceAssetScalarWhereInput[];
};
export type ServiceAssetUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceAssetCreateWithoutTenantInput, Prisma.ServiceAssetUncheckedCreateWithoutTenantInput> | Prisma.ServiceAssetCreateWithoutTenantInput[] | Prisma.ServiceAssetUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceAssetCreateOrConnectWithoutTenantInput | Prisma.ServiceAssetCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ServiceAssetUpsertWithWhereUniqueWithoutTenantInput | Prisma.ServiceAssetUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ServiceAssetCreateManyTenantInputEnvelope;
    set?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    disconnect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    delete?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    connect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    update?: Prisma.ServiceAssetUpdateWithWhereUniqueWithoutTenantInput | Prisma.ServiceAssetUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ServiceAssetUpdateManyWithWhereWithoutTenantInput | Prisma.ServiceAssetUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ServiceAssetScalarWhereInput | Prisma.ServiceAssetScalarWhereInput[];
};
export type ServiceAssetCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.ServiceAssetCreateWithoutServiceInput, Prisma.ServiceAssetUncheckedCreateWithoutServiceInput> | Prisma.ServiceAssetCreateWithoutServiceInput[] | Prisma.ServiceAssetUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceAssetCreateOrConnectWithoutServiceInput | Prisma.ServiceAssetCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.ServiceAssetCreateManyServiceInputEnvelope;
    connect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
};
export type ServiceAssetUncheckedCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.ServiceAssetCreateWithoutServiceInput, Prisma.ServiceAssetUncheckedCreateWithoutServiceInput> | Prisma.ServiceAssetCreateWithoutServiceInput[] | Prisma.ServiceAssetUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceAssetCreateOrConnectWithoutServiceInput | Prisma.ServiceAssetCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.ServiceAssetCreateManyServiceInputEnvelope;
    connect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
};
export type ServiceAssetUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceAssetCreateWithoutServiceInput, Prisma.ServiceAssetUncheckedCreateWithoutServiceInput> | Prisma.ServiceAssetCreateWithoutServiceInput[] | Prisma.ServiceAssetUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceAssetCreateOrConnectWithoutServiceInput | Prisma.ServiceAssetCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.ServiceAssetUpsertWithWhereUniqueWithoutServiceInput | Prisma.ServiceAssetUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.ServiceAssetCreateManyServiceInputEnvelope;
    set?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    disconnect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    delete?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    connect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    update?: Prisma.ServiceAssetUpdateWithWhereUniqueWithoutServiceInput | Prisma.ServiceAssetUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.ServiceAssetUpdateManyWithWhereWithoutServiceInput | Prisma.ServiceAssetUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.ServiceAssetScalarWhereInput | Prisma.ServiceAssetScalarWhereInput[];
};
export type ServiceAssetUncheckedUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceAssetCreateWithoutServiceInput, Prisma.ServiceAssetUncheckedCreateWithoutServiceInput> | Prisma.ServiceAssetCreateWithoutServiceInput[] | Prisma.ServiceAssetUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceAssetCreateOrConnectWithoutServiceInput | Prisma.ServiceAssetCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.ServiceAssetUpsertWithWhereUniqueWithoutServiceInput | Prisma.ServiceAssetUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.ServiceAssetCreateManyServiceInputEnvelope;
    set?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    disconnect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    delete?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    connect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    update?: Prisma.ServiceAssetUpdateWithWhereUniqueWithoutServiceInput | Prisma.ServiceAssetUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.ServiceAssetUpdateManyWithWhereWithoutServiceInput | Prisma.ServiceAssetUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.ServiceAssetScalarWhereInput | Prisma.ServiceAssetScalarWhereInput[];
};
export type ServiceAssetCreateNestedManyWithoutAssetInput = {
    create?: Prisma.XOR<Prisma.ServiceAssetCreateWithoutAssetInput, Prisma.ServiceAssetUncheckedCreateWithoutAssetInput> | Prisma.ServiceAssetCreateWithoutAssetInput[] | Prisma.ServiceAssetUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.ServiceAssetCreateOrConnectWithoutAssetInput | Prisma.ServiceAssetCreateOrConnectWithoutAssetInput[];
    createMany?: Prisma.ServiceAssetCreateManyAssetInputEnvelope;
    connect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
};
export type ServiceAssetUncheckedCreateNestedManyWithoutAssetInput = {
    create?: Prisma.XOR<Prisma.ServiceAssetCreateWithoutAssetInput, Prisma.ServiceAssetUncheckedCreateWithoutAssetInput> | Prisma.ServiceAssetCreateWithoutAssetInput[] | Prisma.ServiceAssetUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.ServiceAssetCreateOrConnectWithoutAssetInput | Prisma.ServiceAssetCreateOrConnectWithoutAssetInput[];
    createMany?: Prisma.ServiceAssetCreateManyAssetInputEnvelope;
    connect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
};
export type ServiceAssetUpdateManyWithoutAssetNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceAssetCreateWithoutAssetInput, Prisma.ServiceAssetUncheckedCreateWithoutAssetInput> | Prisma.ServiceAssetCreateWithoutAssetInput[] | Prisma.ServiceAssetUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.ServiceAssetCreateOrConnectWithoutAssetInput | Prisma.ServiceAssetCreateOrConnectWithoutAssetInput[];
    upsert?: Prisma.ServiceAssetUpsertWithWhereUniqueWithoutAssetInput | Prisma.ServiceAssetUpsertWithWhereUniqueWithoutAssetInput[];
    createMany?: Prisma.ServiceAssetCreateManyAssetInputEnvelope;
    set?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    disconnect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    delete?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    connect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    update?: Prisma.ServiceAssetUpdateWithWhereUniqueWithoutAssetInput | Prisma.ServiceAssetUpdateWithWhereUniqueWithoutAssetInput[];
    updateMany?: Prisma.ServiceAssetUpdateManyWithWhereWithoutAssetInput | Prisma.ServiceAssetUpdateManyWithWhereWithoutAssetInput[];
    deleteMany?: Prisma.ServiceAssetScalarWhereInput | Prisma.ServiceAssetScalarWhereInput[];
};
export type ServiceAssetUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceAssetCreateWithoutAssetInput, Prisma.ServiceAssetUncheckedCreateWithoutAssetInput> | Prisma.ServiceAssetCreateWithoutAssetInput[] | Prisma.ServiceAssetUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.ServiceAssetCreateOrConnectWithoutAssetInput | Prisma.ServiceAssetCreateOrConnectWithoutAssetInput[];
    upsert?: Prisma.ServiceAssetUpsertWithWhereUniqueWithoutAssetInput | Prisma.ServiceAssetUpsertWithWhereUniqueWithoutAssetInput[];
    createMany?: Prisma.ServiceAssetCreateManyAssetInputEnvelope;
    set?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    disconnect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    delete?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    connect?: Prisma.ServiceAssetWhereUniqueInput | Prisma.ServiceAssetWhereUniqueInput[];
    update?: Prisma.ServiceAssetUpdateWithWhereUniqueWithoutAssetInput | Prisma.ServiceAssetUpdateWithWhereUniqueWithoutAssetInput[];
    updateMany?: Prisma.ServiceAssetUpdateManyWithWhereWithoutAssetInput | Prisma.ServiceAssetUpdateManyWithWhereWithoutAssetInput[];
    deleteMany?: Prisma.ServiceAssetScalarWhereInput | Prisma.ServiceAssetScalarWhereInput[];
};
export type ServiceAssetCreateWithoutTenantInput = {
    id?: string;
    asset: Prisma.AssetCreateNestedOneWithoutServiceAssetsInput;
    service: Prisma.ServiceCreateNestedOneWithoutServiceAssetsInput;
};
export type ServiceAssetUncheckedCreateWithoutTenantInput = {
    id?: string;
    assetId: string;
    serviceId: string;
};
export type ServiceAssetCreateOrConnectWithoutTenantInput = {
    where: Prisma.ServiceAssetWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceAssetCreateWithoutTenantInput, Prisma.ServiceAssetUncheckedCreateWithoutTenantInput>;
};
export type ServiceAssetCreateManyTenantInputEnvelope = {
    data: Prisma.ServiceAssetCreateManyTenantInput | Prisma.ServiceAssetCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ServiceAssetUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ServiceAssetWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceAssetUpdateWithoutTenantInput, Prisma.ServiceAssetUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ServiceAssetCreateWithoutTenantInput, Prisma.ServiceAssetUncheckedCreateWithoutTenantInput>;
};
export type ServiceAssetUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ServiceAssetWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceAssetUpdateWithoutTenantInput, Prisma.ServiceAssetUncheckedUpdateWithoutTenantInput>;
};
export type ServiceAssetUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ServiceAssetScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceAssetUpdateManyMutationInput, Prisma.ServiceAssetUncheckedUpdateManyWithoutTenantInput>;
};
export type ServiceAssetScalarWhereInput = {
    AND?: Prisma.ServiceAssetScalarWhereInput | Prisma.ServiceAssetScalarWhereInput[];
    OR?: Prisma.ServiceAssetScalarWhereInput[];
    NOT?: Prisma.ServiceAssetScalarWhereInput | Prisma.ServiceAssetScalarWhereInput[];
    id?: Prisma.UuidFilter<"ServiceAsset"> | string;
    tenantId?: Prisma.UuidFilter<"ServiceAsset"> | string;
    assetId?: Prisma.UuidFilter<"ServiceAsset"> | string;
    serviceId?: Prisma.UuidFilter<"ServiceAsset"> | string;
};
export type ServiceAssetCreateWithoutServiceInput = {
    id?: string;
    asset: Prisma.AssetCreateNestedOneWithoutServiceAssetsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutServiceAssetsInput;
};
export type ServiceAssetUncheckedCreateWithoutServiceInput = {
    id?: string;
    tenantId: string;
    assetId: string;
};
export type ServiceAssetCreateOrConnectWithoutServiceInput = {
    where: Prisma.ServiceAssetWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceAssetCreateWithoutServiceInput, Prisma.ServiceAssetUncheckedCreateWithoutServiceInput>;
};
export type ServiceAssetCreateManyServiceInputEnvelope = {
    data: Prisma.ServiceAssetCreateManyServiceInput | Prisma.ServiceAssetCreateManyServiceInput[];
    skipDuplicates?: boolean;
};
export type ServiceAssetUpsertWithWhereUniqueWithoutServiceInput = {
    where: Prisma.ServiceAssetWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceAssetUpdateWithoutServiceInput, Prisma.ServiceAssetUncheckedUpdateWithoutServiceInput>;
    create: Prisma.XOR<Prisma.ServiceAssetCreateWithoutServiceInput, Prisma.ServiceAssetUncheckedCreateWithoutServiceInput>;
};
export type ServiceAssetUpdateWithWhereUniqueWithoutServiceInput = {
    where: Prisma.ServiceAssetWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceAssetUpdateWithoutServiceInput, Prisma.ServiceAssetUncheckedUpdateWithoutServiceInput>;
};
export type ServiceAssetUpdateManyWithWhereWithoutServiceInput = {
    where: Prisma.ServiceAssetScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceAssetUpdateManyMutationInput, Prisma.ServiceAssetUncheckedUpdateManyWithoutServiceInput>;
};
export type ServiceAssetCreateWithoutAssetInput = {
    id?: string;
    service: Prisma.ServiceCreateNestedOneWithoutServiceAssetsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutServiceAssetsInput;
};
export type ServiceAssetUncheckedCreateWithoutAssetInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
};
export type ServiceAssetCreateOrConnectWithoutAssetInput = {
    where: Prisma.ServiceAssetWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceAssetCreateWithoutAssetInput, Prisma.ServiceAssetUncheckedCreateWithoutAssetInput>;
};
export type ServiceAssetCreateManyAssetInputEnvelope = {
    data: Prisma.ServiceAssetCreateManyAssetInput | Prisma.ServiceAssetCreateManyAssetInput[];
    skipDuplicates?: boolean;
};
export type ServiceAssetUpsertWithWhereUniqueWithoutAssetInput = {
    where: Prisma.ServiceAssetWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceAssetUpdateWithoutAssetInput, Prisma.ServiceAssetUncheckedUpdateWithoutAssetInput>;
    create: Prisma.XOR<Prisma.ServiceAssetCreateWithoutAssetInput, Prisma.ServiceAssetUncheckedCreateWithoutAssetInput>;
};
export type ServiceAssetUpdateWithWhereUniqueWithoutAssetInput = {
    where: Prisma.ServiceAssetWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceAssetUpdateWithoutAssetInput, Prisma.ServiceAssetUncheckedUpdateWithoutAssetInput>;
};
export type ServiceAssetUpdateManyWithWhereWithoutAssetInput = {
    where: Prisma.ServiceAssetScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceAssetUpdateManyMutationInput, Prisma.ServiceAssetUncheckedUpdateManyWithoutAssetInput>;
};
export type ServiceAssetCreateManyTenantInput = {
    id?: string;
    assetId: string;
    serviceId: string;
};
export type ServiceAssetUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    asset?: Prisma.AssetUpdateOneRequiredWithoutServiceAssetsNestedInput;
    service?: Prisma.ServiceUpdateOneRequiredWithoutServiceAssetsNestedInput;
};
export type ServiceAssetUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceAssetUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceAssetCreateManyServiceInput = {
    id?: string;
    tenantId: string;
    assetId: string;
};
export type ServiceAssetUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    asset?: Prisma.AssetUpdateOneRequiredWithoutServiceAssetsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutServiceAssetsNestedInput;
};
export type ServiceAssetUncheckedUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceAssetUncheckedUpdateManyWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceAssetCreateManyAssetInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
};
export type ServiceAssetUpdateWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutServiceAssetsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutServiceAssetsNestedInput;
};
export type ServiceAssetUncheckedUpdateWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceAssetUncheckedUpdateManyWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceAssetSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    assetId?: boolean;
    serviceId?: boolean;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["serviceAsset"]>;
export type ServiceAssetSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    assetId?: boolean;
    serviceId?: boolean;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["serviceAsset"]>;
export type ServiceAssetSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    assetId?: boolean;
    serviceId?: boolean;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["serviceAsset"]>;
export type ServiceAssetSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    assetId?: boolean;
    serviceId?: boolean;
};
export type ServiceAssetOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "assetId" | "serviceId", ExtArgs["result"]["serviceAsset"]>;
export type ServiceAssetInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ServiceAssetIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ServiceAssetIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ServiceAssetPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ServiceAsset";
    objects: {
        asset: Prisma.$AssetPayload<ExtArgs>;
        service: Prisma.$ServicePayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        assetId: string;
        serviceId: string;
    }, ExtArgs["result"]["serviceAsset"]>;
    composites: {};
};
export type ServiceAssetGetPayload<S extends boolean | null | undefined | ServiceAssetDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ServiceAssetPayload, S>;
export type ServiceAssetCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ServiceAssetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ServiceAssetCountAggregateInputType | true;
};
export interface ServiceAssetDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ServiceAsset'];
        meta: {
            name: 'ServiceAsset';
        };
    };
    findUnique<T extends ServiceAssetFindUniqueArgs>(args: Prisma.SelectSubset<T, ServiceAssetFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ServiceAssetClient<runtime.Types.Result.GetResult<Prisma.$ServiceAssetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ServiceAssetFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ServiceAssetFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ServiceAssetClient<runtime.Types.Result.GetResult<Prisma.$ServiceAssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ServiceAssetFindFirstArgs>(args?: Prisma.SelectSubset<T, ServiceAssetFindFirstArgs<ExtArgs>>): Prisma.Prisma__ServiceAssetClient<runtime.Types.Result.GetResult<Prisma.$ServiceAssetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ServiceAssetFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ServiceAssetFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ServiceAssetClient<runtime.Types.Result.GetResult<Prisma.$ServiceAssetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ServiceAssetFindManyArgs>(args?: Prisma.SelectSubset<T, ServiceAssetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceAssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ServiceAssetCreateArgs>(args: Prisma.SelectSubset<T, ServiceAssetCreateArgs<ExtArgs>>): Prisma.Prisma__ServiceAssetClient<runtime.Types.Result.GetResult<Prisma.$ServiceAssetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ServiceAssetCreateManyArgs>(args?: Prisma.SelectSubset<T, ServiceAssetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ServiceAssetCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ServiceAssetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceAssetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ServiceAssetDeleteArgs>(args: Prisma.SelectSubset<T, ServiceAssetDeleteArgs<ExtArgs>>): Prisma.Prisma__ServiceAssetClient<runtime.Types.Result.GetResult<Prisma.$ServiceAssetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ServiceAssetUpdateArgs>(args: Prisma.SelectSubset<T, ServiceAssetUpdateArgs<ExtArgs>>): Prisma.Prisma__ServiceAssetClient<runtime.Types.Result.GetResult<Prisma.$ServiceAssetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ServiceAssetDeleteManyArgs>(args?: Prisma.SelectSubset<T, ServiceAssetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ServiceAssetUpdateManyArgs>(args: Prisma.SelectSubset<T, ServiceAssetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ServiceAssetUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ServiceAssetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceAssetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ServiceAssetUpsertArgs>(args: Prisma.SelectSubset<T, ServiceAssetUpsertArgs<ExtArgs>>): Prisma.Prisma__ServiceAssetClient<runtime.Types.Result.GetResult<Prisma.$ServiceAssetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ServiceAssetCountArgs>(args?: Prisma.Subset<T, ServiceAssetCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ServiceAssetCountAggregateOutputType> : number>;
    aggregate<T extends ServiceAssetAggregateArgs>(args: Prisma.Subset<T, ServiceAssetAggregateArgs>): Prisma.PrismaPromise<GetServiceAssetAggregateType<T>>;
    groupBy<T extends ServiceAssetGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ServiceAssetGroupByArgs['orderBy'];
    } : {
        orderBy?: ServiceAssetGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ServiceAssetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServiceAssetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ServiceAssetFieldRefs;
}
export interface Prisma__ServiceAssetClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    asset<T extends Prisma.AssetDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.AssetDefaultArgs<ExtArgs>>): Prisma.Prisma__AssetClient<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    service<T extends Prisma.ServiceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ServiceDefaultArgs<ExtArgs>>): Prisma.Prisma__ServiceClient<runtime.Types.Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ServiceAssetFieldRefs {
    readonly id: Prisma.FieldRef<"ServiceAsset", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ServiceAsset", 'String'>;
    readonly assetId: Prisma.FieldRef<"ServiceAsset", 'String'>;
    readonly serviceId: Prisma.FieldRef<"ServiceAsset", 'String'>;
}
export type ServiceAssetFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceAssetSelect<ExtArgs> | null;
    omit?: Prisma.ServiceAssetOmit<ExtArgs> | null;
    include?: Prisma.ServiceAssetInclude<ExtArgs> | null;
    where: Prisma.ServiceAssetWhereUniqueInput;
};
export type ServiceAssetFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceAssetSelect<ExtArgs> | null;
    omit?: Prisma.ServiceAssetOmit<ExtArgs> | null;
    include?: Prisma.ServiceAssetInclude<ExtArgs> | null;
    where: Prisma.ServiceAssetWhereUniqueInput;
};
export type ServiceAssetFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceAssetSelect<ExtArgs> | null;
    omit?: Prisma.ServiceAssetOmit<ExtArgs> | null;
    include?: Prisma.ServiceAssetInclude<ExtArgs> | null;
    where?: Prisma.ServiceAssetWhereInput;
    orderBy?: Prisma.ServiceAssetOrderByWithRelationInput | Prisma.ServiceAssetOrderByWithRelationInput[];
    cursor?: Prisma.ServiceAssetWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceAssetScalarFieldEnum | Prisma.ServiceAssetScalarFieldEnum[];
};
export type ServiceAssetFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceAssetSelect<ExtArgs> | null;
    omit?: Prisma.ServiceAssetOmit<ExtArgs> | null;
    include?: Prisma.ServiceAssetInclude<ExtArgs> | null;
    where?: Prisma.ServiceAssetWhereInput;
    orderBy?: Prisma.ServiceAssetOrderByWithRelationInput | Prisma.ServiceAssetOrderByWithRelationInput[];
    cursor?: Prisma.ServiceAssetWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceAssetScalarFieldEnum | Prisma.ServiceAssetScalarFieldEnum[];
};
export type ServiceAssetFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceAssetSelect<ExtArgs> | null;
    omit?: Prisma.ServiceAssetOmit<ExtArgs> | null;
    include?: Prisma.ServiceAssetInclude<ExtArgs> | null;
    where?: Prisma.ServiceAssetWhereInput;
    orderBy?: Prisma.ServiceAssetOrderByWithRelationInput | Prisma.ServiceAssetOrderByWithRelationInput[];
    cursor?: Prisma.ServiceAssetWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceAssetScalarFieldEnum | Prisma.ServiceAssetScalarFieldEnum[];
};
export type ServiceAssetCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceAssetSelect<ExtArgs> | null;
    omit?: Prisma.ServiceAssetOmit<ExtArgs> | null;
    include?: Prisma.ServiceAssetInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceAssetCreateInput, Prisma.ServiceAssetUncheckedCreateInput>;
};
export type ServiceAssetCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ServiceAssetCreateManyInput | Prisma.ServiceAssetCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ServiceAssetCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceAssetSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ServiceAssetOmit<ExtArgs> | null;
    data: Prisma.ServiceAssetCreateManyInput | Prisma.ServiceAssetCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ServiceAssetIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ServiceAssetUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceAssetSelect<ExtArgs> | null;
    omit?: Prisma.ServiceAssetOmit<ExtArgs> | null;
    include?: Prisma.ServiceAssetInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceAssetUpdateInput, Prisma.ServiceAssetUncheckedUpdateInput>;
    where: Prisma.ServiceAssetWhereUniqueInput;
};
export type ServiceAssetUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ServiceAssetUpdateManyMutationInput, Prisma.ServiceAssetUncheckedUpdateManyInput>;
    where?: Prisma.ServiceAssetWhereInput;
    limit?: number;
};
export type ServiceAssetUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceAssetSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ServiceAssetOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceAssetUpdateManyMutationInput, Prisma.ServiceAssetUncheckedUpdateManyInput>;
    where?: Prisma.ServiceAssetWhereInput;
    limit?: number;
    include?: Prisma.ServiceAssetIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ServiceAssetUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceAssetSelect<ExtArgs> | null;
    omit?: Prisma.ServiceAssetOmit<ExtArgs> | null;
    include?: Prisma.ServiceAssetInclude<ExtArgs> | null;
    where: Prisma.ServiceAssetWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceAssetCreateInput, Prisma.ServiceAssetUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ServiceAssetUpdateInput, Prisma.ServiceAssetUncheckedUpdateInput>;
};
export type ServiceAssetDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceAssetSelect<ExtArgs> | null;
    omit?: Prisma.ServiceAssetOmit<ExtArgs> | null;
    include?: Prisma.ServiceAssetInclude<ExtArgs> | null;
    where: Prisma.ServiceAssetWhereUniqueInput;
};
export type ServiceAssetDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceAssetWhereInput;
    limit?: number;
};
export type ServiceAssetDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceAssetSelect<ExtArgs> | null;
    omit?: Prisma.ServiceAssetOmit<ExtArgs> | null;
    include?: Prisma.ServiceAssetInclude<ExtArgs> | null;
};
export {};
