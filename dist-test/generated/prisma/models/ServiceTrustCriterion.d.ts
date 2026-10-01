import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ServiceTrustCriterionModel = runtime.Types.Result.DefaultSelection<Prisma.$ServiceTrustCriterionPayload>;
export type AggregateServiceTrustCriterion = {
    _count: ServiceTrustCriterionCountAggregateOutputType | null;
    _min: ServiceTrustCriterionMinAggregateOutputType | null;
    _max: ServiceTrustCriterionMaxAggregateOutputType | null;
};
export type ServiceTrustCriterionMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    serviceId: string | null;
    trustCriterionId: string | null;
};
export type ServiceTrustCriterionMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    serviceId: string | null;
    trustCriterionId: string | null;
};
export type ServiceTrustCriterionCountAggregateOutputType = {
    id: number;
    tenantId: number;
    serviceId: number;
    trustCriterionId: number;
    _all: number;
};
export type ServiceTrustCriterionMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    trustCriterionId?: true;
};
export type ServiceTrustCriterionMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    trustCriterionId?: true;
};
export type ServiceTrustCriterionCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    trustCriterionId?: true;
    _all?: true;
};
export type ServiceTrustCriterionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceTrustCriterionWhereInput;
    orderBy?: Prisma.ServiceTrustCriterionOrderByWithRelationInput | Prisma.ServiceTrustCriterionOrderByWithRelationInput[];
    cursor?: Prisma.ServiceTrustCriterionWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ServiceTrustCriterionCountAggregateInputType;
    _min?: ServiceTrustCriterionMinAggregateInputType;
    _max?: ServiceTrustCriterionMaxAggregateInputType;
};
export type GetServiceTrustCriterionAggregateType<T extends ServiceTrustCriterionAggregateArgs> = {
    [P in keyof T & keyof AggregateServiceTrustCriterion]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateServiceTrustCriterion[P]> : Prisma.GetScalarType<T[P], AggregateServiceTrustCriterion[P]>;
};
export type ServiceTrustCriterionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceTrustCriterionWhereInput;
    orderBy?: Prisma.ServiceTrustCriterionOrderByWithAggregationInput | Prisma.ServiceTrustCriterionOrderByWithAggregationInput[];
    by: Prisma.ServiceTrustCriterionScalarFieldEnum[] | Prisma.ServiceTrustCriterionScalarFieldEnum;
    having?: Prisma.ServiceTrustCriterionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ServiceTrustCriterionCountAggregateInputType | true;
    _min?: ServiceTrustCriterionMinAggregateInputType;
    _max?: ServiceTrustCriterionMaxAggregateInputType;
};
export type ServiceTrustCriterionGroupByOutputType = {
    id: string;
    tenantId: string;
    serviceId: string;
    trustCriterionId: string;
    _count: ServiceTrustCriterionCountAggregateOutputType | null;
    _min: ServiceTrustCriterionMinAggregateOutputType | null;
    _max: ServiceTrustCriterionMaxAggregateOutputType | null;
};
type GetServiceTrustCriterionGroupByPayload<T extends ServiceTrustCriterionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ServiceTrustCriterionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ServiceTrustCriterionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ServiceTrustCriterionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ServiceTrustCriterionGroupByOutputType[P]>;
}>>;
export type ServiceTrustCriterionWhereInput = {
    AND?: Prisma.ServiceTrustCriterionWhereInput | Prisma.ServiceTrustCriterionWhereInput[];
    OR?: Prisma.ServiceTrustCriterionWhereInput[];
    NOT?: Prisma.ServiceTrustCriterionWhereInput | Prisma.ServiceTrustCriterionWhereInput[];
    id?: Prisma.UuidFilter<"ServiceTrustCriterion"> | string;
    tenantId?: Prisma.UuidFilter<"ServiceTrustCriterion"> | string;
    serviceId?: Prisma.UuidFilter<"ServiceTrustCriterion"> | string;
    trustCriterionId?: Prisma.UuidFilter<"ServiceTrustCriterion"> | string;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    trustCriterion?: Prisma.XOR<Prisma.TrustCriterionScalarRelationFilter, Prisma.TrustCriterionWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type ServiceTrustCriterionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    trustCriterionId?: Prisma.SortOrder;
    service?: Prisma.ServiceOrderByWithRelationInput;
    trustCriterion?: Prisma.TrustCriterionOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type ServiceTrustCriterionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    serviceId_trustCriterionId?: Prisma.ServiceTrustCriterionServiceIdTrustCriterionIdCompoundUniqueInput;
    AND?: Prisma.ServiceTrustCriterionWhereInput | Prisma.ServiceTrustCriterionWhereInput[];
    OR?: Prisma.ServiceTrustCriterionWhereInput[];
    NOT?: Prisma.ServiceTrustCriterionWhereInput | Prisma.ServiceTrustCriterionWhereInput[];
    tenantId?: Prisma.UuidFilter<"ServiceTrustCriterion"> | string;
    serviceId?: Prisma.UuidFilter<"ServiceTrustCriterion"> | string;
    trustCriterionId?: Prisma.UuidFilter<"ServiceTrustCriterion"> | string;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    trustCriterion?: Prisma.XOR<Prisma.TrustCriterionScalarRelationFilter, Prisma.TrustCriterionWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id" | "serviceId_trustCriterionId">;
export type ServiceTrustCriterionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    trustCriterionId?: Prisma.SortOrder;
    _count?: Prisma.ServiceTrustCriterionCountOrderByAggregateInput;
    _max?: Prisma.ServiceTrustCriterionMaxOrderByAggregateInput;
    _min?: Prisma.ServiceTrustCriterionMinOrderByAggregateInput;
};
export type ServiceTrustCriterionScalarWhereWithAggregatesInput = {
    AND?: Prisma.ServiceTrustCriterionScalarWhereWithAggregatesInput | Prisma.ServiceTrustCriterionScalarWhereWithAggregatesInput[];
    OR?: Prisma.ServiceTrustCriterionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ServiceTrustCriterionScalarWhereWithAggregatesInput | Prisma.ServiceTrustCriterionScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ServiceTrustCriterion"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ServiceTrustCriterion"> | string;
    serviceId?: Prisma.UuidWithAggregatesFilter<"ServiceTrustCriterion"> | string;
    trustCriterionId?: Prisma.UuidWithAggregatesFilter<"ServiceTrustCriterion"> | string;
};
export type ServiceTrustCriterionCreateInput = {
    id?: string;
    service: Prisma.ServiceCreateNestedOneWithoutTrustCriteriaInput;
    trustCriterion: Prisma.TrustCriterionCreateNestedOneWithoutServiceTrustCriteriaInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutServiceTrustCriteriaInput;
};
export type ServiceTrustCriterionUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    trustCriterionId: string;
};
export type ServiceTrustCriterionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutTrustCriteriaNestedInput;
    trustCriterion?: Prisma.TrustCriterionUpdateOneRequiredWithoutServiceTrustCriteriaNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutServiceTrustCriteriaNestedInput;
};
export type ServiceTrustCriterionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterionId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceTrustCriterionCreateManyInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    trustCriterionId: string;
};
export type ServiceTrustCriterionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceTrustCriterionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterionId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceTrustCriterionListRelationFilter = {
    every?: Prisma.ServiceTrustCriterionWhereInput;
    some?: Prisma.ServiceTrustCriterionWhereInput;
    none?: Prisma.ServiceTrustCriterionWhereInput;
};
export type ServiceTrustCriterionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ServiceTrustCriterionServiceIdTrustCriterionIdCompoundUniqueInput = {
    serviceId: string;
    trustCriterionId: string;
};
export type ServiceTrustCriterionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    trustCriterionId?: Prisma.SortOrder;
};
export type ServiceTrustCriterionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    trustCriterionId?: Prisma.SortOrder;
};
export type ServiceTrustCriterionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    trustCriterionId?: Prisma.SortOrder;
};
export type ServiceTrustCriterionCreateNestedManyWithoutTrustCriterionInput = {
    create?: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutTrustCriterionInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutTrustCriterionInput> | Prisma.ServiceTrustCriterionCreateWithoutTrustCriterionInput[] | Prisma.ServiceTrustCriterionUncheckedCreateWithoutTrustCriterionInput[];
    connectOrCreate?: Prisma.ServiceTrustCriterionCreateOrConnectWithoutTrustCriterionInput | Prisma.ServiceTrustCriterionCreateOrConnectWithoutTrustCriterionInput[];
    createMany?: Prisma.ServiceTrustCriterionCreateManyTrustCriterionInputEnvelope;
    connect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
};
export type ServiceTrustCriterionUncheckedCreateNestedManyWithoutTrustCriterionInput = {
    create?: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutTrustCriterionInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutTrustCriterionInput> | Prisma.ServiceTrustCriterionCreateWithoutTrustCriterionInput[] | Prisma.ServiceTrustCriterionUncheckedCreateWithoutTrustCriterionInput[];
    connectOrCreate?: Prisma.ServiceTrustCriterionCreateOrConnectWithoutTrustCriterionInput | Prisma.ServiceTrustCriterionCreateOrConnectWithoutTrustCriterionInput[];
    createMany?: Prisma.ServiceTrustCriterionCreateManyTrustCriterionInputEnvelope;
    connect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
};
export type ServiceTrustCriterionUpdateManyWithoutTrustCriterionNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutTrustCriterionInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutTrustCriterionInput> | Prisma.ServiceTrustCriterionCreateWithoutTrustCriterionInput[] | Prisma.ServiceTrustCriterionUncheckedCreateWithoutTrustCriterionInput[];
    connectOrCreate?: Prisma.ServiceTrustCriterionCreateOrConnectWithoutTrustCriterionInput | Prisma.ServiceTrustCriterionCreateOrConnectWithoutTrustCriterionInput[];
    upsert?: Prisma.ServiceTrustCriterionUpsertWithWhereUniqueWithoutTrustCriterionInput | Prisma.ServiceTrustCriterionUpsertWithWhereUniqueWithoutTrustCriterionInput[];
    createMany?: Prisma.ServiceTrustCriterionCreateManyTrustCriterionInputEnvelope;
    set?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    disconnect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    delete?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    connect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    update?: Prisma.ServiceTrustCriterionUpdateWithWhereUniqueWithoutTrustCriterionInput | Prisma.ServiceTrustCriterionUpdateWithWhereUniqueWithoutTrustCriterionInput[];
    updateMany?: Prisma.ServiceTrustCriterionUpdateManyWithWhereWithoutTrustCriterionInput | Prisma.ServiceTrustCriterionUpdateManyWithWhereWithoutTrustCriterionInput[];
    deleteMany?: Prisma.ServiceTrustCriterionScalarWhereInput | Prisma.ServiceTrustCriterionScalarWhereInput[];
};
export type ServiceTrustCriterionUncheckedUpdateManyWithoutTrustCriterionNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutTrustCriterionInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutTrustCriterionInput> | Prisma.ServiceTrustCriterionCreateWithoutTrustCriterionInput[] | Prisma.ServiceTrustCriterionUncheckedCreateWithoutTrustCriterionInput[];
    connectOrCreate?: Prisma.ServiceTrustCriterionCreateOrConnectWithoutTrustCriterionInput | Prisma.ServiceTrustCriterionCreateOrConnectWithoutTrustCriterionInput[];
    upsert?: Prisma.ServiceTrustCriterionUpsertWithWhereUniqueWithoutTrustCriterionInput | Prisma.ServiceTrustCriterionUpsertWithWhereUniqueWithoutTrustCriterionInput[];
    createMany?: Prisma.ServiceTrustCriterionCreateManyTrustCriterionInputEnvelope;
    set?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    disconnect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    delete?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    connect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    update?: Prisma.ServiceTrustCriterionUpdateWithWhereUniqueWithoutTrustCriterionInput | Prisma.ServiceTrustCriterionUpdateWithWhereUniqueWithoutTrustCriterionInput[];
    updateMany?: Prisma.ServiceTrustCriterionUpdateManyWithWhereWithoutTrustCriterionInput | Prisma.ServiceTrustCriterionUpdateManyWithWhereWithoutTrustCriterionInput[];
    deleteMany?: Prisma.ServiceTrustCriterionScalarWhereInput | Prisma.ServiceTrustCriterionScalarWhereInput[];
};
export type ServiceTrustCriterionCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutTenantInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutTenantInput> | Prisma.ServiceTrustCriterionCreateWithoutTenantInput[] | Prisma.ServiceTrustCriterionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceTrustCriterionCreateOrConnectWithoutTenantInput | Prisma.ServiceTrustCriterionCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ServiceTrustCriterionCreateManyTenantInputEnvelope;
    connect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
};
export type ServiceTrustCriterionUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutTenantInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutTenantInput> | Prisma.ServiceTrustCriterionCreateWithoutTenantInput[] | Prisma.ServiceTrustCriterionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceTrustCriterionCreateOrConnectWithoutTenantInput | Prisma.ServiceTrustCriterionCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ServiceTrustCriterionCreateManyTenantInputEnvelope;
    connect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
};
export type ServiceTrustCriterionUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutTenantInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutTenantInput> | Prisma.ServiceTrustCriterionCreateWithoutTenantInput[] | Prisma.ServiceTrustCriterionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceTrustCriterionCreateOrConnectWithoutTenantInput | Prisma.ServiceTrustCriterionCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ServiceTrustCriterionUpsertWithWhereUniqueWithoutTenantInput | Prisma.ServiceTrustCriterionUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ServiceTrustCriterionCreateManyTenantInputEnvelope;
    set?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    disconnect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    delete?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    connect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    update?: Prisma.ServiceTrustCriterionUpdateWithWhereUniqueWithoutTenantInput | Prisma.ServiceTrustCriterionUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ServiceTrustCriterionUpdateManyWithWhereWithoutTenantInput | Prisma.ServiceTrustCriterionUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ServiceTrustCriterionScalarWhereInput | Prisma.ServiceTrustCriterionScalarWhereInput[];
};
export type ServiceTrustCriterionUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutTenantInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutTenantInput> | Prisma.ServiceTrustCriterionCreateWithoutTenantInput[] | Prisma.ServiceTrustCriterionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceTrustCriterionCreateOrConnectWithoutTenantInput | Prisma.ServiceTrustCriterionCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ServiceTrustCriterionUpsertWithWhereUniqueWithoutTenantInput | Prisma.ServiceTrustCriterionUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ServiceTrustCriterionCreateManyTenantInputEnvelope;
    set?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    disconnect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    delete?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    connect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    update?: Prisma.ServiceTrustCriterionUpdateWithWhereUniqueWithoutTenantInput | Prisma.ServiceTrustCriterionUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ServiceTrustCriterionUpdateManyWithWhereWithoutTenantInput | Prisma.ServiceTrustCriterionUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ServiceTrustCriterionScalarWhereInput | Prisma.ServiceTrustCriterionScalarWhereInput[];
};
export type ServiceTrustCriterionCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutServiceInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutServiceInput> | Prisma.ServiceTrustCriterionCreateWithoutServiceInput[] | Prisma.ServiceTrustCriterionUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceTrustCriterionCreateOrConnectWithoutServiceInput | Prisma.ServiceTrustCriterionCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.ServiceTrustCriterionCreateManyServiceInputEnvelope;
    connect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
};
export type ServiceTrustCriterionUncheckedCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutServiceInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutServiceInput> | Prisma.ServiceTrustCriterionCreateWithoutServiceInput[] | Prisma.ServiceTrustCriterionUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceTrustCriterionCreateOrConnectWithoutServiceInput | Prisma.ServiceTrustCriterionCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.ServiceTrustCriterionCreateManyServiceInputEnvelope;
    connect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
};
export type ServiceTrustCriterionUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutServiceInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutServiceInput> | Prisma.ServiceTrustCriterionCreateWithoutServiceInput[] | Prisma.ServiceTrustCriterionUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceTrustCriterionCreateOrConnectWithoutServiceInput | Prisma.ServiceTrustCriterionCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.ServiceTrustCriterionUpsertWithWhereUniqueWithoutServiceInput | Prisma.ServiceTrustCriterionUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.ServiceTrustCriterionCreateManyServiceInputEnvelope;
    set?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    disconnect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    delete?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    connect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    update?: Prisma.ServiceTrustCriterionUpdateWithWhereUniqueWithoutServiceInput | Prisma.ServiceTrustCriterionUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.ServiceTrustCriterionUpdateManyWithWhereWithoutServiceInput | Prisma.ServiceTrustCriterionUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.ServiceTrustCriterionScalarWhereInput | Prisma.ServiceTrustCriterionScalarWhereInput[];
};
export type ServiceTrustCriterionUncheckedUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutServiceInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutServiceInput> | Prisma.ServiceTrustCriterionCreateWithoutServiceInput[] | Prisma.ServiceTrustCriterionUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceTrustCriterionCreateOrConnectWithoutServiceInput | Prisma.ServiceTrustCriterionCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.ServiceTrustCriterionUpsertWithWhereUniqueWithoutServiceInput | Prisma.ServiceTrustCriterionUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.ServiceTrustCriterionCreateManyServiceInputEnvelope;
    set?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    disconnect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    delete?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    connect?: Prisma.ServiceTrustCriterionWhereUniqueInput | Prisma.ServiceTrustCriterionWhereUniqueInput[];
    update?: Prisma.ServiceTrustCriterionUpdateWithWhereUniqueWithoutServiceInput | Prisma.ServiceTrustCriterionUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.ServiceTrustCriterionUpdateManyWithWhereWithoutServiceInput | Prisma.ServiceTrustCriterionUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.ServiceTrustCriterionScalarWhereInput | Prisma.ServiceTrustCriterionScalarWhereInput[];
};
export type ServiceTrustCriterionCreateWithoutTrustCriterionInput = {
    id?: string;
    service: Prisma.ServiceCreateNestedOneWithoutTrustCriteriaInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutServiceTrustCriteriaInput;
};
export type ServiceTrustCriterionUncheckedCreateWithoutTrustCriterionInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
};
export type ServiceTrustCriterionCreateOrConnectWithoutTrustCriterionInput = {
    where: Prisma.ServiceTrustCriterionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutTrustCriterionInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutTrustCriterionInput>;
};
export type ServiceTrustCriterionCreateManyTrustCriterionInputEnvelope = {
    data: Prisma.ServiceTrustCriterionCreateManyTrustCriterionInput | Prisma.ServiceTrustCriterionCreateManyTrustCriterionInput[];
    skipDuplicates?: boolean;
};
export type ServiceTrustCriterionUpsertWithWhereUniqueWithoutTrustCriterionInput = {
    where: Prisma.ServiceTrustCriterionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceTrustCriterionUpdateWithoutTrustCriterionInput, Prisma.ServiceTrustCriterionUncheckedUpdateWithoutTrustCriterionInput>;
    create: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutTrustCriterionInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutTrustCriterionInput>;
};
export type ServiceTrustCriterionUpdateWithWhereUniqueWithoutTrustCriterionInput = {
    where: Prisma.ServiceTrustCriterionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceTrustCriterionUpdateWithoutTrustCriterionInput, Prisma.ServiceTrustCriterionUncheckedUpdateWithoutTrustCriterionInput>;
};
export type ServiceTrustCriterionUpdateManyWithWhereWithoutTrustCriterionInput = {
    where: Prisma.ServiceTrustCriterionScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceTrustCriterionUpdateManyMutationInput, Prisma.ServiceTrustCriterionUncheckedUpdateManyWithoutTrustCriterionInput>;
};
export type ServiceTrustCriterionScalarWhereInput = {
    AND?: Prisma.ServiceTrustCriterionScalarWhereInput | Prisma.ServiceTrustCriterionScalarWhereInput[];
    OR?: Prisma.ServiceTrustCriterionScalarWhereInput[];
    NOT?: Prisma.ServiceTrustCriterionScalarWhereInput | Prisma.ServiceTrustCriterionScalarWhereInput[];
    id?: Prisma.UuidFilter<"ServiceTrustCriterion"> | string;
    tenantId?: Prisma.UuidFilter<"ServiceTrustCriterion"> | string;
    serviceId?: Prisma.UuidFilter<"ServiceTrustCriterion"> | string;
    trustCriterionId?: Prisma.UuidFilter<"ServiceTrustCriterion"> | string;
};
export type ServiceTrustCriterionCreateWithoutTenantInput = {
    id?: string;
    service: Prisma.ServiceCreateNestedOneWithoutTrustCriteriaInput;
    trustCriterion: Prisma.TrustCriterionCreateNestedOneWithoutServiceTrustCriteriaInput;
};
export type ServiceTrustCriterionUncheckedCreateWithoutTenantInput = {
    id?: string;
    serviceId: string;
    trustCriterionId: string;
};
export type ServiceTrustCriterionCreateOrConnectWithoutTenantInput = {
    where: Prisma.ServiceTrustCriterionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutTenantInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutTenantInput>;
};
export type ServiceTrustCriterionCreateManyTenantInputEnvelope = {
    data: Prisma.ServiceTrustCriterionCreateManyTenantInput | Prisma.ServiceTrustCriterionCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ServiceTrustCriterionUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ServiceTrustCriterionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceTrustCriterionUpdateWithoutTenantInput, Prisma.ServiceTrustCriterionUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutTenantInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutTenantInput>;
};
export type ServiceTrustCriterionUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ServiceTrustCriterionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceTrustCriterionUpdateWithoutTenantInput, Prisma.ServiceTrustCriterionUncheckedUpdateWithoutTenantInput>;
};
export type ServiceTrustCriterionUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ServiceTrustCriterionScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceTrustCriterionUpdateManyMutationInput, Prisma.ServiceTrustCriterionUncheckedUpdateManyWithoutTenantInput>;
};
export type ServiceTrustCriterionCreateWithoutServiceInput = {
    id?: string;
    trustCriterion: Prisma.TrustCriterionCreateNestedOneWithoutServiceTrustCriteriaInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutServiceTrustCriteriaInput;
};
export type ServiceTrustCriterionUncheckedCreateWithoutServiceInput = {
    id?: string;
    tenantId: string;
    trustCriterionId: string;
};
export type ServiceTrustCriterionCreateOrConnectWithoutServiceInput = {
    where: Prisma.ServiceTrustCriterionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutServiceInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutServiceInput>;
};
export type ServiceTrustCriterionCreateManyServiceInputEnvelope = {
    data: Prisma.ServiceTrustCriterionCreateManyServiceInput | Prisma.ServiceTrustCriterionCreateManyServiceInput[];
    skipDuplicates?: boolean;
};
export type ServiceTrustCriterionUpsertWithWhereUniqueWithoutServiceInput = {
    where: Prisma.ServiceTrustCriterionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceTrustCriterionUpdateWithoutServiceInput, Prisma.ServiceTrustCriterionUncheckedUpdateWithoutServiceInput>;
    create: Prisma.XOR<Prisma.ServiceTrustCriterionCreateWithoutServiceInput, Prisma.ServiceTrustCriterionUncheckedCreateWithoutServiceInput>;
};
export type ServiceTrustCriterionUpdateWithWhereUniqueWithoutServiceInput = {
    where: Prisma.ServiceTrustCriterionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceTrustCriterionUpdateWithoutServiceInput, Prisma.ServiceTrustCriterionUncheckedUpdateWithoutServiceInput>;
};
export type ServiceTrustCriterionUpdateManyWithWhereWithoutServiceInput = {
    where: Prisma.ServiceTrustCriterionScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceTrustCriterionUpdateManyMutationInput, Prisma.ServiceTrustCriterionUncheckedUpdateManyWithoutServiceInput>;
};
export type ServiceTrustCriterionCreateManyTrustCriterionInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
};
export type ServiceTrustCriterionUpdateWithoutTrustCriterionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutTrustCriteriaNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutServiceTrustCriteriaNestedInput;
};
export type ServiceTrustCriterionUncheckedUpdateWithoutTrustCriterionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceTrustCriterionUncheckedUpdateManyWithoutTrustCriterionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceTrustCriterionCreateManyTenantInput = {
    id?: string;
    serviceId: string;
    trustCriterionId: string;
};
export type ServiceTrustCriterionUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutTrustCriteriaNestedInput;
    trustCriterion?: Prisma.TrustCriterionUpdateOneRequiredWithoutServiceTrustCriteriaNestedInput;
};
export type ServiceTrustCriterionUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterionId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceTrustCriterionUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterionId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceTrustCriterionCreateManyServiceInput = {
    id?: string;
    tenantId: string;
    trustCriterionId: string;
};
export type ServiceTrustCriterionUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterion?: Prisma.TrustCriterionUpdateOneRequiredWithoutServiceTrustCriteriaNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutServiceTrustCriteriaNestedInput;
};
export type ServiceTrustCriterionUncheckedUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterionId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceTrustCriterionUncheckedUpdateManyWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterionId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceTrustCriterionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    trustCriterionId?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    trustCriterion?: boolean | Prisma.TrustCriterionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["serviceTrustCriterion"]>;
export type ServiceTrustCriterionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    trustCriterionId?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    trustCriterion?: boolean | Prisma.TrustCriterionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["serviceTrustCriterion"]>;
export type ServiceTrustCriterionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    trustCriterionId?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    trustCriterion?: boolean | Prisma.TrustCriterionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["serviceTrustCriterion"]>;
export type ServiceTrustCriterionSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    trustCriterionId?: boolean;
};
export type ServiceTrustCriterionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "serviceId" | "trustCriterionId", ExtArgs["result"]["serviceTrustCriterion"]>;
export type ServiceTrustCriterionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    trustCriterion?: boolean | Prisma.TrustCriterionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ServiceTrustCriterionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    trustCriterion?: boolean | Prisma.TrustCriterionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ServiceTrustCriterionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    trustCriterion?: boolean | Prisma.TrustCriterionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ServiceTrustCriterionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ServiceTrustCriterion";
    objects: {
        service: Prisma.$ServicePayload<ExtArgs>;
        trustCriterion: Prisma.$TrustCriterionPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        serviceId: string;
        trustCriterionId: string;
    }, ExtArgs["result"]["serviceTrustCriterion"]>;
    composites: {};
};
export type ServiceTrustCriterionGetPayload<S extends boolean | null | undefined | ServiceTrustCriterionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ServiceTrustCriterionPayload, S>;
export type ServiceTrustCriterionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ServiceTrustCriterionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ServiceTrustCriterionCountAggregateInputType | true;
};
export interface ServiceTrustCriterionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ServiceTrustCriterion'];
        meta: {
            name: 'ServiceTrustCriterion';
        };
    };
    findUnique<T extends ServiceTrustCriterionFindUniqueArgs>(args: Prisma.SelectSubset<T, ServiceTrustCriterionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ServiceTrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$ServiceTrustCriterionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ServiceTrustCriterionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ServiceTrustCriterionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ServiceTrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$ServiceTrustCriterionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ServiceTrustCriterionFindFirstArgs>(args?: Prisma.SelectSubset<T, ServiceTrustCriterionFindFirstArgs<ExtArgs>>): Prisma.Prisma__ServiceTrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$ServiceTrustCriterionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ServiceTrustCriterionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ServiceTrustCriterionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ServiceTrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$ServiceTrustCriterionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ServiceTrustCriterionFindManyArgs>(args?: Prisma.SelectSubset<T, ServiceTrustCriterionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceTrustCriterionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ServiceTrustCriterionCreateArgs>(args: Prisma.SelectSubset<T, ServiceTrustCriterionCreateArgs<ExtArgs>>): Prisma.Prisma__ServiceTrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$ServiceTrustCriterionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ServiceTrustCriterionCreateManyArgs>(args?: Prisma.SelectSubset<T, ServiceTrustCriterionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ServiceTrustCriterionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ServiceTrustCriterionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceTrustCriterionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ServiceTrustCriterionDeleteArgs>(args: Prisma.SelectSubset<T, ServiceTrustCriterionDeleteArgs<ExtArgs>>): Prisma.Prisma__ServiceTrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$ServiceTrustCriterionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ServiceTrustCriterionUpdateArgs>(args: Prisma.SelectSubset<T, ServiceTrustCriterionUpdateArgs<ExtArgs>>): Prisma.Prisma__ServiceTrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$ServiceTrustCriterionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ServiceTrustCriterionDeleteManyArgs>(args?: Prisma.SelectSubset<T, ServiceTrustCriterionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ServiceTrustCriterionUpdateManyArgs>(args: Prisma.SelectSubset<T, ServiceTrustCriterionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ServiceTrustCriterionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ServiceTrustCriterionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceTrustCriterionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ServiceTrustCriterionUpsertArgs>(args: Prisma.SelectSubset<T, ServiceTrustCriterionUpsertArgs<ExtArgs>>): Prisma.Prisma__ServiceTrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$ServiceTrustCriterionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ServiceTrustCriterionCountArgs>(args?: Prisma.Subset<T, ServiceTrustCriterionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ServiceTrustCriterionCountAggregateOutputType> : number>;
    aggregate<T extends ServiceTrustCriterionAggregateArgs>(args: Prisma.Subset<T, ServiceTrustCriterionAggregateArgs>): Prisma.PrismaPromise<GetServiceTrustCriterionAggregateType<T>>;
    groupBy<T extends ServiceTrustCriterionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ServiceTrustCriterionGroupByArgs['orderBy'];
    } : {
        orderBy?: ServiceTrustCriterionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ServiceTrustCriterionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServiceTrustCriterionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ServiceTrustCriterionFieldRefs;
}
export interface Prisma__ServiceTrustCriterionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    service<T extends Prisma.ServiceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ServiceDefaultArgs<ExtArgs>>): Prisma.Prisma__ServiceClient<runtime.Types.Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    trustCriterion<T extends Prisma.TrustCriterionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TrustCriterionDefaultArgs<ExtArgs>>): Prisma.Prisma__TrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$TrustCriterionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ServiceTrustCriterionFieldRefs {
    readonly id: Prisma.FieldRef<"ServiceTrustCriterion", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ServiceTrustCriterion", 'String'>;
    readonly serviceId: Prisma.FieldRef<"ServiceTrustCriterion", 'String'>;
    readonly trustCriterionId: Prisma.FieldRef<"ServiceTrustCriterion", 'String'>;
}
export type ServiceTrustCriterionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceTrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.ServiceTrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.ServiceTrustCriterionInclude<ExtArgs> | null;
    where: Prisma.ServiceTrustCriterionWhereUniqueInput;
};
export type ServiceTrustCriterionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceTrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.ServiceTrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.ServiceTrustCriterionInclude<ExtArgs> | null;
    where: Prisma.ServiceTrustCriterionWhereUniqueInput;
};
export type ServiceTrustCriterionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceTrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.ServiceTrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.ServiceTrustCriterionInclude<ExtArgs> | null;
    where?: Prisma.ServiceTrustCriterionWhereInput;
    orderBy?: Prisma.ServiceTrustCriterionOrderByWithRelationInput | Prisma.ServiceTrustCriterionOrderByWithRelationInput[];
    cursor?: Prisma.ServiceTrustCriterionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceTrustCriterionScalarFieldEnum | Prisma.ServiceTrustCriterionScalarFieldEnum[];
};
export type ServiceTrustCriterionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceTrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.ServiceTrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.ServiceTrustCriterionInclude<ExtArgs> | null;
    where?: Prisma.ServiceTrustCriterionWhereInput;
    orderBy?: Prisma.ServiceTrustCriterionOrderByWithRelationInput | Prisma.ServiceTrustCriterionOrderByWithRelationInput[];
    cursor?: Prisma.ServiceTrustCriterionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceTrustCriterionScalarFieldEnum | Prisma.ServiceTrustCriterionScalarFieldEnum[];
};
export type ServiceTrustCriterionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceTrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.ServiceTrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.ServiceTrustCriterionInclude<ExtArgs> | null;
    where?: Prisma.ServiceTrustCriterionWhereInput;
    orderBy?: Prisma.ServiceTrustCriterionOrderByWithRelationInput | Prisma.ServiceTrustCriterionOrderByWithRelationInput[];
    cursor?: Prisma.ServiceTrustCriterionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceTrustCriterionScalarFieldEnum | Prisma.ServiceTrustCriterionScalarFieldEnum[];
};
export type ServiceTrustCriterionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceTrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.ServiceTrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.ServiceTrustCriterionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceTrustCriterionCreateInput, Prisma.ServiceTrustCriterionUncheckedCreateInput>;
};
export type ServiceTrustCriterionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ServiceTrustCriterionCreateManyInput | Prisma.ServiceTrustCriterionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ServiceTrustCriterionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceTrustCriterionSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ServiceTrustCriterionOmit<ExtArgs> | null;
    data: Prisma.ServiceTrustCriterionCreateManyInput | Prisma.ServiceTrustCriterionCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ServiceTrustCriterionIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ServiceTrustCriterionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceTrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.ServiceTrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.ServiceTrustCriterionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceTrustCriterionUpdateInput, Prisma.ServiceTrustCriterionUncheckedUpdateInput>;
    where: Prisma.ServiceTrustCriterionWhereUniqueInput;
};
export type ServiceTrustCriterionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ServiceTrustCriterionUpdateManyMutationInput, Prisma.ServiceTrustCriterionUncheckedUpdateManyInput>;
    where?: Prisma.ServiceTrustCriterionWhereInput;
    limit?: number;
};
export type ServiceTrustCriterionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceTrustCriterionSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ServiceTrustCriterionOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceTrustCriterionUpdateManyMutationInput, Prisma.ServiceTrustCriterionUncheckedUpdateManyInput>;
    where?: Prisma.ServiceTrustCriterionWhereInput;
    limit?: number;
    include?: Prisma.ServiceTrustCriterionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ServiceTrustCriterionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceTrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.ServiceTrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.ServiceTrustCriterionInclude<ExtArgs> | null;
    where: Prisma.ServiceTrustCriterionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceTrustCriterionCreateInput, Prisma.ServiceTrustCriterionUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ServiceTrustCriterionUpdateInput, Prisma.ServiceTrustCriterionUncheckedUpdateInput>;
};
export type ServiceTrustCriterionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceTrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.ServiceTrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.ServiceTrustCriterionInclude<ExtArgs> | null;
    where: Prisma.ServiceTrustCriterionWhereUniqueInput;
};
export type ServiceTrustCriterionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceTrustCriterionWhereInput;
    limit?: number;
};
export type ServiceTrustCriterionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceTrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.ServiceTrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.ServiceTrustCriterionInclude<ExtArgs> | null;
};
export {};
