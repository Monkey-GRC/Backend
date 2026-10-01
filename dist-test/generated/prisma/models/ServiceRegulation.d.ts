import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ServiceRegulationModel = runtime.Types.Result.DefaultSelection<Prisma.$ServiceRegulationPayload>;
export type AggregateServiceRegulation = {
    _count: ServiceRegulationCountAggregateOutputType | null;
    _min: ServiceRegulationMinAggregateOutputType | null;
    _max: ServiceRegulationMaxAggregateOutputType | null;
};
export type ServiceRegulationMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    serviceId: string | null;
    regulationId: string | null;
};
export type ServiceRegulationMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    serviceId: string | null;
    regulationId: string | null;
};
export type ServiceRegulationCountAggregateOutputType = {
    id: number;
    tenantId: number;
    serviceId: number;
    regulationId: number;
    _all: number;
};
export type ServiceRegulationMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    regulationId?: true;
};
export type ServiceRegulationMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    regulationId?: true;
};
export type ServiceRegulationCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    regulationId?: true;
    _all?: true;
};
export type ServiceRegulationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceRegulationWhereInput;
    orderBy?: Prisma.ServiceRegulationOrderByWithRelationInput | Prisma.ServiceRegulationOrderByWithRelationInput[];
    cursor?: Prisma.ServiceRegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ServiceRegulationCountAggregateInputType;
    _min?: ServiceRegulationMinAggregateInputType;
    _max?: ServiceRegulationMaxAggregateInputType;
};
export type GetServiceRegulationAggregateType<T extends ServiceRegulationAggregateArgs> = {
    [P in keyof T & keyof AggregateServiceRegulation]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateServiceRegulation[P]> : Prisma.GetScalarType<T[P], AggregateServiceRegulation[P]>;
};
export type ServiceRegulationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceRegulationWhereInput;
    orderBy?: Prisma.ServiceRegulationOrderByWithAggregationInput | Prisma.ServiceRegulationOrderByWithAggregationInput[];
    by: Prisma.ServiceRegulationScalarFieldEnum[] | Prisma.ServiceRegulationScalarFieldEnum;
    having?: Prisma.ServiceRegulationScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ServiceRegulationCountAggregateInputType | true;
    _min?: ServiceRegulationMinAggregateInputType;
    _max?: ServiceRegulationMaxAggregateInputType;
};
export type ServiceRegulationGroupByOutputType = {
    id: string;
    tenantId: string;
    serviceId: string;
    regulationId: string;
    _count: ServiceRegulationCountAggregateOutputType | null;
    _min: ServiceRegulationMinAggregateOutputType | null;
    _max: ServiceRegulationMaxAggregateOutputType | null;
};
type GetServiceRegulationGroupByPayload<T extends ServiceRegulationGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ServiceRegulationGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ServiceRegulationGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ServiceRegulationGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ServiceRegulationGroupByOutputType[P]>;
}>>;
export type ServiceRegulationWhereInput = {
    AND?: Prisma.ServiceRegulationWhereInput | Prisma.ServiceRegulationWhereInput[];
    OR?: Prisma.ServiceRegulationWhereInput[];
    NOT?: Prisma.ServiceRegulationWhereInput | Prisma.ServiceRegulationWhereInput[];
    id?: Prisma.UuidFilter<"ServiceRegulation"> | string;
    tenantId?: Prisma.UuidFilter<"ServiceRegulation"> | string;
    serviceId?: Prisma.UuidFilter<"ServiceRegulation"> | string;
    regulationId?: Prisma.UuidFilter<"ServiceRegulation"> | string;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    regulation?: Prisma.XOR<Prisma.RegulationScalarRelationFilter, Prisma.RegulationWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type ServiceRegulationOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    regulationId?: Prisma.SortOrder;
    service?: Prisma.ServiceOrderByWithRelationInput;
    regulation?: Prisma.RegulationOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type ServiceRegulationWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    serviceId_regulationId?: Prisma.ServiceRegulationServiceIdRegulationIdCompoundUniqueInput;
    AND?: Prisma.ServiceRegulationWhereInput | Prisma.ServiceRegulationWhereInput[];
    OR?: Prisma.ServiceRegulationWhereInput[];
    NOT?: Prisma.ServiceRegulationWhereInput | Prisma.ServiceRegulationWhereInput[];
    tenantId?: Prisma.UuidFilter<"ServiceRegulation"> | string;
    serviceId?: Prisma.UuidFilter<"ServiceRegulation"> | string;
    regulationId?: Prisma.UuidFilter<"ServiceRegulation"> | string;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    regulation?: Prisma.XOR<Prisma.RegulationScalarRelationFilter, Prisma.RegulationWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id" | "serviceId_regulationId">;
export type ServiceRegulationOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    regulationId?: Prisma.SortOrder;
    _count?: Prisma.ServiceRegulationCountOrderByAggregateInput;
    _max?: Prisma.ServiceRegulationMaxOrderByAggregateInput;
    _min?: Prisma.ServiceRegulationMinOrderByAggregateInput;
};
export type ServiceRegulationScalarWhereWithAggregatesInput = {
    AND?: Prisma.ServiceRegulationScalarWhereWithAggregatesInput | Prisma.ServiceRegulationScalarWhereWithAggregatesInput[];
    OR?: Prisma.ServiceRegulationScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ServiceRegulationScalarWhereWithAggregatesInput | Prisma.ServiceRegulationScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ServiceRegulation"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ServiceRegulation"> | string;
    serviceId?: Prisma.UuidWithAggregatesFilter<"ServiceRegulation"> | string;
    regulationId?: Prisma.UuidWithAggregatesFilter<"ServiceRegulation"> | string;
};
export type ServiceRegulationCreateInput = {
    id?: string;
    service: Prisma.ServiceCreateNestedOneWithoutRegulationsInput;
    regulation: Prisma.RegulationCreateNestedOneWithoutServiceRegulationsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutServiceRegulationsInput;
};
export type ServiceRegulationUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    regulationId: string;
};
export type ServiceRegulationUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutRegulationsNestedInput;
    regulation?: Prisma.RegulationUpdateOneRequiredWithoutServiceRegulationsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutServiceRegulationsNestedInput;
};
export type ServiceRegulationUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    regulationId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceRegulationCreateManyInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    regulationId: string;
};
export type ServiceRegulationUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceRegulationUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    regulationId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceRegulationListRelationFilter = {
    every?: Prisma.ServiceRegulationWhereInput;
    some?: Prisma.ServiceRegulationWhereInput;
    none?: Prisma.ServiceRegulationWhereInput;
};
export type ServiceRegulationOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ServiceRegulationServiceIdRegulationIdCompoundUniqueInput = {
    serviceId: string;
    regulationId: string;
};
export type ServiceRegulationCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    regulationId?: Prisma.SortOrder;
};
export type ServiceRegulationMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    regulationId?: Prisma.SortOrder;
};
export type ServiceRegulationMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    regulationId?: Prisma.SortOrder;
};
export type ServiceRegulationCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutTenantInput, Prisma.ServiceRegulationUncheckedCreateWithoutTenantInput> | Prisma.ServiceRegulationCreateWithoutTenantInput[] | Prisma.ServiceRegulationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceRegulationCreateOrConnectWithoutTenantInput | Prisma.ServiceRegulationCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ServiceRegulationCreateManyTenantInputEnvelope;
    connect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
};
export type ServiceRegulationUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutTenantInput, Prisma.ServiceRegulationUncheckedCreateWithoutTenantInput> | Prisma.ServiceRegulationCreateWithoutTenantInput[] | Prisma.ServiceRegulationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceRegulationCreateOrConnectWithoutTenantInput | Prisma.ServiceRegulationCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ServiceRegulationCreateManyTenantInputEnvelope;
    connect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
};
export type ServiceRegulationUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutTenantInput, Prisma.ServiceRegulationUncheckedCreateWithoutTenantInput> | Prisma.ServiceRegulationCreateWithoutTenantInput[] | Prisma.ServiceRegulationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceRegulationCreateOrConnectWithoutTenantInput | Prisma.ServiceRegulationCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ServiceRegulationUpsertWithWhereUniqueWithoutTenantInput | Prisma.ServiceRegulationUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ServiceRegulationCreateManyTenantInputEnvelope;
    set?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    disconnect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    delete?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    connect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    update?: Prisma.ServiceRegulationUpdateWithWhereUniqueWithoutTenantInput | Prisma.ServiceRegulationUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ServiceRegulationUpdateManyWithWhereWithoutTenantInput | Prisma.ServiceRegulationUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ServiceRegulationScalarWhereInput | Prisma.ServiceRegulationScalarWhereInput[];
};
export type ServiceRegulationUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutTenantInput, Prisma.ServiceRegulationUncheckedCreateWithoutTenantInput> | Prisma.ServiceRegulationCreateWithoutTenantInput[] | Prisma.ServiceRegulationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceRegulationCreateOrConnectWithoutTenantInput | Prisma.ServiceRegulationCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ServiceRegulationUpsertWithWhereUniqueWithoutTenantInput | Prisma.ServiceRegulationUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ServiceRegulationCreateManyTenantInputEnvelope;
    set?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    disconnect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    delete?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    connect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    update?: Prisma.ServiceRegulationUpdateWithWhereUniqueWithoutTenantInput | Prisma.ServiceRegulationUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ServiceRegulationUpdateManyWithWhereWithoutTenantInput | Prisma.ServiceRegulationUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ServiceRegulationScalarWhereInput | Prisma.ServiceRegulationScalarWhereInput[];
};
export type ServiceRegulationCreateNestedManyWithoutRegulationInput = {
    create?: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutRegulationInput, Prisma.ServiceRegulationUncheckedCreateWithoutRegulationInput> | Prisma.ServiceRegulationCreateWithoutRegulationInput[] | Prisma.ServiceRegulationUncheckedCreateWithoutRegulationInput[];
    connectOrCreate?: Prisma.ServiceRegulationCreateOrConnectWithoutRegulationInput | Prisma.ServiceRegulationCreateOrConnectWithoutRegulationInput[];
    createMany?: Prisma.ServiceRegulationCreateManyRegulationInputEnvelope;
    connect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
};
export type ServiceRegulationUncheckedCreateNestedManyWithoutRegulationInput = {
    create?: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutRegulationInput, Prisma.ServiceRegulationUncheckedCreateWithoutRegulationInput> | Prisma.ServiceRegulationCreateWithoutRegulationInput[] | Prisma.ServiceRegulationUncheckedCreateWithoutRegulationInput[];
    connectOrCreate?: Prisma.ServiceRegulationCreateOrConnectWithoutRegulationInput | Prisma.ServiceRegulationCreateOrConnectWithoutRegulationInput[];
    createMany?: Prisma.ServiceRegulationCreateManyRegulationInputEnvelope;
    connect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
};
export type ServiceRegulationUpdateManyWithoutRegulationNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutRegulationInput, Prisma.ServiceRegulationUncheckedCreateWithoutRegulationInput> | Prisma.ServiceRegulationCreateWithoutRegulationInput[] | Prisma.ServiceRegulationUncheckedCreateWithoutRegulationInput[];
    connectOrCreate?: Prisma.ServiceRegulationCreateOrConnectWithoutRegulationInput | Prisma.ServiceRegulationCreateOrConnectWithoutRegulationInput[];
    upsert?: Prisma.ServiceRegulationUpsertWithWhereUniqueWithoutRegulationInput | Prisma.ServiceRegulationUpsertWithWhereUniqueWithoutRegulationInput[];
    createMany?: Prisma.ServiceRegulationCreateManyRegulationInputEnvelope;
    set?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    disconnect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    delete?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    connect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    update?: Prisma.ServiceRegulationUpdateWithWhereUniqueWithoutRegulationInput | Prisma.ServiceRegulationUpdateWithWhereUniqueWithoutRegulationInput[];
    updateMany?: Prisma.ServiceRegulationUpdateManyWithWhereWithoutRegulationInput | Prisma.ServiceRegulationUpdateManyWithWhereWithoutRegulationInput[];
    deleteMany?: Prisma.ServiceRegulationScalarWhereInput | Prisma.ServiceRegulationScalarWhereInput[];
};
export type ServiceRegulationUncheckedUpdateManyWithoutRegulationNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutRegulationInput, Prisma.ServiceRegulationUncheckedCreateWithoutRegulationInput> | Prisma.ServiceRegulationCreateWithoutRegulationInput[] | Prisma.ServiceRegulationUncheckedCreateWithoutRegulationInput[];
    connectOrCreate?: Prisma.ServiceRegulationCreateOrConnectWithoutRegulationInput | Prisma.ServiceRegulationCreateOrConnectWithoutRegulationInput[];
    upsert?: Prisma.ServiceRegulationUpsertWithWhereUniqueWithoutRegulationInput | Prisma.ServiceRegulationUpsertWithWhereUniqueWithoutRegulationInput[];
    createMany?: Prisma.ServiceRegulationCreateManyRegulationInputEnvelope;
    set?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    disconnect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    delete?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    connect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    update?: Prisma.ServiceRegulationUpdateWithWhereUniqueWithoutRegulationInput | Prisma.ServiceRegulationUpdateWithWhereUniqueWithoutRegulationInput[];
    updateMany?: Prisma.ServiceRegulationUpdateManyWithWhereWithoutRegulationInput | Prisma.ServiceRegulationUpdateManyWithWhereWithoutRegulationInput[];
    deleteMany?: Prisma.ServiceRegulationScalarWhereInput | Prisma.ServiceRegulationScalarWhereInput[];
};
export type ServiceRegulationCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutServiceInput, Prisma.ServiceRegulationUncheckedCreateWithoutServiceInput> | Prisma.ServiceRegulationCreateWithoutServiceInput[] | Prisma.ServiceRegulationUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceRegulationCreateOrConnectWithoutServiceInput | Prisma.ServiceRegulationCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.ServiceRegulationCreateManyServiceInputEnvelope;
    connect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
};
export type ServiceRegulationUncheckedCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutServiceInput, Prisma.ServiceRegulationUncheckedCreateWithoutServiceInput> | Prisma.ServiceRegulationCreateWithoutServiceInput[] | Prisma.ServiceRegulationUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceRegulationCreateOrConnectWithoutServiceInput | Prisma.ServiceRegulationCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.ServiceRegulationCreateManyServiceInputEnvelope;
    connect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
};
export type ServiceRegulationUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutServiceInput, Prisma.ServiceRegulationUncheckedCreateWithoutServiceInput> | Prisma.ServiceRegulationCreateWithoutServiceInput[] | Prisma.ServiceRegulationUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceRegulationCreateOrConnectWithoutServiceInput | Prisma.ServiceRegulationCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.ServiceRegulationUpsertWithWhereUniqueWithoutServiceInput | Prisma.ServiceRegulationUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.ServiceRegulationCreateManyServiceInputEnvelope;
    set?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    disconnect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    delete?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    connect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    update?: Prisma.ServiceRegulationUpdateWithWhereUniqueWithoutServiceInput | Prisma.ServiceRegulationUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.ServiceRegulationUpdateManyWithWhereWithoutServiceInput | Prisma.ServiceRegulationUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.ServiceRegulationScalarWhereInput | Prisma.ServiceRegulationScalarWhereInput[];
};
export type ServiceRegulationUncheckedUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutServiceInput, Prisma.ServiceRegulationUncheckedCreateWithoutServiceInput> | Prisma.ServiceRegulationCreateWithoutServiceInput[] | Prisma.ServiceRegulationUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceRegulationCreateOrConnectWithoutServiceInput | Prisma.ServiceRegulationCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.ServiceRegulationUpsertWithWhereUniqueWithoutServiceInput | Prisma.ServiceRegulationUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.ServiceRegulationCreateManyServiceInputEnvelope;
    set?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    disconnect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    delete?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    connect?: Prisma.ServiceRegulationWhereUniqueInput | Prisma.ServiceRegulationWhereUniqueInput[];
    update?: Prisma.ServiceRegulationUpdateWithWhereUniqueWithoutServiceInput | Prisma.ServiceRegulationUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.ServiceRegulationUpdateManyWithWhereWithoutServiceInput | Prisma.ServiceRegulationUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.ServiceRegulationScalarWhereInput | Prisma.ServiceRegulationScalarWhereInput[];
};
export type ServiceRegulationCreateWithoutTenantInput = {
    id?: string;
    service: Prisma.ServiceCreateNestedOneWithoutRegulationsInput;
    regulation: Prisma.RegulationCreateNestedOneWithoutServiceRegulationsInput;
};
export type ServiceRegulationUncheckedCreateWithoutTenantInput = {
    id?: string;
    serviceId: string;
    regulationId: string;
};
export type ServiceRegulationCreateOrConnectWithoutTenantInput = {
    where: Prisma.ServiceRegulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutTenantInput, Prisma.ServiceRegulationUncheckedCreateWithoutTenantInput>;
};
export type ServiceRegulationCreateManyTenantInputEnvelope = {
    data: Prisma.ServiceRegulationCreateManyTenantInput | Prisma.ServiceRegulationCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ServiceRegulationUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ServiceRegulationWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceRegulationUpdateWithoutTenantInput, Prisma.ServiceRegulationUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutTenantInput, Prisma.ServiceRegulationUncheckedCreateWithoutTenantInput>;
};
export type ServiceRegulationUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ServiceRegulationWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceRegulationUpdateWithoutTenantInput, Prisma.ServiceRegulationUncheckedUpdateWithoutTenantInput>;
};
export type ServiceRegulationUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ServiceRegulationScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceRegulationUpdateManyMutationInput, Prisma.ServiceRegulationUncheckedUpdateManyWithoutTenantInput>;
};
export type ServiceRegulationScalarWhereInput = {
    AND?: Prisma.ServiceRegulationScalarWhereInput | Prisma.ServiceRegulationScalarWhereInput[];
    OR?: Prisma.ServiceRegulationScalarWhereInput[];
    NOT?: Prisma.ServiceRegulationScalarWhereInput | Prisma.ServiceRegulationScalarWhereInput[];
    id?: Prisma.UuidFilter<"ServiceRegulation"> | string;
    tenantId?: Prisma.UuidFilter<"ServiceRegulation"> | string;
    serviceId?: Prisma.UuidFilter<"ServiceRegulation"> | string;
    regulationId?: Prisma.UuidFilter<"ServiceRegulation"> | string;
};
export type ServiceRegulationCreateWithoutRegulationInput = {
    id?: string;
    service: Prisma.ServiceCreateNestedOneWithoutRegulationsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutServiceRegulationsInput;
};
export type ServiceRegulationUncheckedCreateWithoutRegulationInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
};
export type ServiceRegulationCreateOrConnectWithoutRegulationInput = {
    where: Prisma.ServiceRegulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutRegulationInput, Prisma.ServiceRegulationUncheckedCreateWithoutRegulationInput>;
};
export type ServiceRegulationCreateManyRegulationInputEnvelope = {
    data: Prisma.ServiceRegulationCreateManyRegulationInput | Prisma.ServiceRegulationCreateManyRegulationInput[];
    skipDuplicates?: boolean;
};
export type ServiceRegulationUpsertWithWhereUniqueWithoutRegulationInput = {
    where: Prisma.ServiceRegulationWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceRegulationUpdateWithoutRegulationInput, Prisma.ServiceRegulationUncheckedUpdateWithoutRegulationInput>;
    create: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutRegulationInput, Prisma.ServiceRegulationUncheckedCreateWithoutRegulationInput>;
};
export type ServiceRegulationUpdateWithWhereUniqueWithoutRegulationInput = {
    where: Prisma.ServiceRegulationWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceRegulationUpdateWithoutRegulationInput, Prisma.ServiceRegulationUncheckedUpdateWithoutRegulationInput>;
};
export type ServiceRegulationUpdateManyWithWhereWithoutRegulationInput = {
    where: Prisma.ServiceRegulationScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceRegulationUpdateManyMutationInput, Prisma.ServiceRegulationUncheckedUpdateManyWithoutRegulationInput>;
};
export type ServiceRegulationCreateWithoutServiceInput = {
    id?: string;
    regulation: Prisma.RegulationCreateNestedOneWithoutServiceRegulationsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutServiceRegulationsInput;
};
export type ServiceRegulationUncheckedCreateWithoutServiceInput = {
    id?: string;
    tenantId: string;
    regulationId: string;
};
export type ServiceRegulationCreateOrConnectWithoutServiceInput = {
    where: Prisma.ServiceRegulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutServiceInput, Prisma.ServiceRegulationUncheckedCreateWithoutServiceInput>;
};
export type ServiceRegulationCreateManyServiceInputEnvelope = {
    data: Prisma.ServiceRegulationCreateManyServiceInput | Prisma.ServiceRegulationCreateManyServiceInput[];
    skipDuplicates?: boolean;
};
export type ServiceRegulationUpsertWithWhereUniqueWithoutServiceInput = {
    where: Prisma.ServiceRegulationWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceRegulationUpdateWithoutServiceInput, Prisma.ServiceRegulationUncheckedUpdateWithoutServiceInput>;
    create: Prisma.XOR<Prisma.ServiceRegulationCreateWithoutServiceInput, Prisma.ServiceRegulationUncheckedCreateWithoutServiceInput>;
};
export type ServiceRegulationUpdateWithWhereUniqueWithoutServiceInput = {
    where: Prisma.ServiceRegulationWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceRegulationUpdateWithoutServiceInput, Prisma.ServiceRegulationUncheckedUpdateWithoutServiceInput>;
};
export type ServiceRegulationUpdateManyWithWhereWithoutServiceInput = {
    where: Prisma.ServiceRegulationScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceRegulationUpdateManyMutationInput, Prisma.ServiceRegulationUncheckedUpdateManyWithoutServiceInput>;
};
export type ServiceRegulationCreateManyTenantInput = {
    id?: string;
    serviceId: string;
    regulationId: string;
};
export type ServiceRegulationUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutRegulationsNestedInput;
    regulation?: Prisma.RegulationUpdateOneRequiredWithoutServiceRegulationsNestedInput;
};
export type ServiceRegulationUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    regulationId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceRegulationUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    regulationId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceRegulationCreateManyRegulationInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
};
export type ServiceRegulationUpdateWithoutRegulationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutRegulationsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutServiceRegulationsNestedInput;
};
export type ServiceRegulationUncheckedUpdateWithoutRegulationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceRegulationUncheckedUpdateManyWithoutRegulationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceRegulationCreateManyServiceInput = {
    id?: string;
    tenantId: string;
    regulationId: string;
};
export type ServiceRegulationUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    regulation?: Prisma.RegulationUpdateOneRequiredWithoutServiceRegulationsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutServiceRegulationsNestedInput;
};
export type ServiceRegulationUncheckedUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    regulationId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceRegulationUncheckedUpdateManyWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    regulationId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceRegulationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    regulationId?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    regulation?: boolean | Prisma.RegulationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["serviceRegulation"]>;
export type ServiceRegulationSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    regulationId?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    regulation?: boolean | Prisma.RegulationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["serviceRegulation"]>;
export type ServiceRegulationSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    regulationId?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    regulation?: boolean | Prisma.RegulationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["serviceRegulation"]>;
export type ServiceRegulationSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    regulationId?: boolean;
};
export type ServiceRegulationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "serviceId" | "regulationId", ExtArgs["result"]["serviceRegulation"]>;
export type ServiceRegulationInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    regulation?: boolean | Prisma.RegulationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ServiceRegulationIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    regulation?: boolean | Prisma.RegulationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ServiceRegulationIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    regulation?: boolean | Prisma.RegulationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ServiceRegulationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ServiceRegulation";
    objects: {
        service: Prisma.$ServicePayload<ExtArgs>;
        regulation: Prisma.$RegulationPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        serviceId: string;
        regulationId: string;
    }, ExtArgs["result"]["serviceRegulation"]>;
    composites: {};
};
export type ServiceRegulationGetPayload<S extends boolean | null | undefined | ServiceRegulationDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ServiceRegulationPayload, S>;
export type ServiceRegulationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ServiceRegulationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ServiceRegulationCountAggregateInputType | true;
};
export interface ServiceRegulationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ServiceRegulation'];
        meta: {
            name: 'ServiceRegulation';
        };
    };
    findUnique<T extends ServiceRegulationFindUniqueArgs>(args: Prisma.SelectSubset<T, ServiceRegulationFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ServiceRegulationClient<runtime.Types.Result.GetResult<Prisma.$ServiceRegulationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ServiceRegulationFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ServiceRegulationFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ServiceRegulationClient<runtime.Types.Result.GetResult<Prisma.$ServiceRegulationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ServiceRegulationFindFirstArgs>(args?: Prisma.SelectSubset<T, ServiceRegulationFindFirstArgs<ExtArgs>>): Prisma.Prisma__ServiceRegulationClient<runtime.Types.Result.GetResult<Prisma.$ServiceRegulationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ServiceRegulationFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ServiceRegulationFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ServiceRegulationClient<runtime.Types.Result.GetResult<Prisma.$ServiceRegulationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ServiceRegulationFindManyArgs>(args?: Prisma.SelectSubset<T, ServiceRegulationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceRegulationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ServiceRegulationCreateArgs>(args: Prisma.SelectSubset<T, ServiceRegulationCreateArgs<ExtArgs>>): Prisma.Prisma__ServiceRegulationClient<runtime.Types.Result.GetResult<Prisma.$ServiceRegulationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ServiceRegulationCreateManyArgs>(args?: Prisma.SelectSubset<T, ServiceRegulationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ServiceRegulationCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ServiceRegulationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceRegulationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ServiceRegulationDeleteArgs>(args: Prisma.SelectSubset<T, ServiceRegulationDeleteArgs<ExtArgs>>): Prisma.Prisma__ServiceRegulationClient<runtime.Types.Result.GetResult<Prisma.$ServiceRegulationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ServiceRegulationUpdateArgs>(args: Prisma.SelectSubset<T, ServiceRegulationUpdateArgs<ExtArgs>>): Prisma.Prisma__ServiceRegulationClient<runtime.Types.Result.GetResult<Prisma.$ServiceRegulationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ServiceRegulationDeleteManyArgs>(args?: Prisma.SelectSubset<T, ServiceRegulationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ServiceRegulationUpdateManyArgs>(args: Prisma.SelectSubset<T, ServiceRegulationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ServiceRegulationUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ServiceRegulationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceRegulationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ServiceRegulationUpsertArgs>(args: Prisma.SelectSubset<T, ServiceRegulationUpsertArgs<ExtArgs>>): Prisma.Prisma__ServiceRegulationClient<runtime.Types.Result.GetResult<Prisma.$ServiceRegulationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ServiceRegulationCountArgs>(args?: Prisma.Subset<T, ServiceRegulationCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ServiceRegulationCountAggregateOutputType> : number>;
    aggregate<T extends ServiceRegulationAggregateArgs>(args: Prisma.Subset<T, ServiceRegulationAggregateArgs>): Prisma.PrismaPromise<GetServiceRegulationAggregateType<T>>;
    groupBy<T extends ServiceRegulationGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ServiceRegulationGroupByArgs['orderBy'];
    } : {
        orderBy?: ServiceRegulationGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ServiceRegulationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServiceRegulationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ServiceRegulationFieldRefs;
}
export interface Prisma__ServiceRegulationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    service<T extends Prisma.ServiceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ServiceDefaultArgs<ExtArgs>>): Prisma.Prisma__ServiceClient<runtime.Types.Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    regulation<T extends Prisma.RegulationDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RegulationDefaultArgs<ExtArgs>>): Prisma.Prisma__RegulationClient<runtime.Types.Result.GetResult<Prisma.$RegulationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ServiceRegulationFieldRefs {
    readonly id: Prisma.FieldRef<"ServiceRegulation", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ServiceRegulation", 'String'>;
    readonly serviceId: Prisma.FieldRef<"ServiceRegulation", 'String'>;
    readonly regulationId: Prisma.FieldRef<"ServiceRegulation", 'String'>;
}
export type ServiceRegulationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceRegulationSelect<ExtArgs> | null;
    omit?: Prisma.ServiceRegulationOmit<ExtArgs> | null;
    include?: Prisma.ServiceRegulationInclude<ExtArgs> | null;
    where: Prisma.ServiceRegulationWhereUniqueInput;
};
export type ServiceRegulationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceRegulationSelect<ExtArgs> | null;
    omit?: Prisma.ServiceRegulationOmit<ExtArgs> | null;
    include?: Prisma.ServiceRegulationInclude<ExtArgs> | null;
    where: Prisma.ServiceRegulationWhereUniqueInput;
};
export type ServiceRegulationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceRegulationSelect<ExtArgs> | null;
    omit?: Prisma.ServiceRegulationOmit<ExtArgs> | null;
    include?: Prisma.ServiceRegulationInclude<ExtArgs> | null;
    where?: Prisma.ServiceRegulationWhereInput;
    orderBy?: Prisma.ServiceRegulationOrderByWithRelationInput | Prisma.ServiceRegulationOrderByWithRelationInput[];
    cursor?: Prisma.ServiceRegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceRegulationScalarFieldEnum | Prisma.ServiceRegulationScalarFieldEnum[];
};
export type ServiceRegulationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceRegulationSelect<ExtArgs> | null;
    omit?: Prisma.ServiceRegulationOmit<ExtArgs> | null;
    include?: Prisma.ServiceRegulationInclude<ExtArgs> | null;
    where?: Prisma.ServiceRegulationWhereInput;
    orderBy?: Prisma.ServiceRegulationOrderByWithRelationInput | Prisma.ServiceRegulationOrderByWithRelationInput[];
    cursor?: Prisma.ServiceRegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceRegulationScalarFieldEnum | Prisma.ServiceRegulationScalarFieldEnum[];
};
export type ServiceRegulationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceRegulationSelect<ExtArgs> | null;
    omit?: Prisma.ServiceRegulationOmit<ExtArgs> | null;
    include?: Prisma.ServiceRegulationInclude<ExtArgs> | null;
    where?: Prisma.ServiceRegulationWhereInput;
    orderBy?: Prisma.ServiceRegulationOrderByWithRelationInput | Prisma.ServiceRegulationOrderByWithRelationInput[];
    cursor?: Prisma.ServiceRegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceRegulationScalarFieldEnum | Prisma.ServiceRegulationScalarFieldEnum[];
};
export type ServiceRegulationCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceRegulationSelect<ExtArgs> | null;
    omit?: Prisma.ServiceRegulationOmit<ExtArgs> | null;
    include?: Prisma.ServiceRegulationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceRegulationCreateInput, Prisma.ServiceRegulationUncheckedCreateInput>;
};
export type ServiceRegulationCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ServiceRegulationCreateManyInput | Prisma.ServiceRegulationCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ServiceRegulationCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceRegulationSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ServiceRegulationOmit<ExtArgs> | null;
    data: Prisma.ServiceRegulationCreateManyInput | Prisma.ServiceRegulationCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ServiceRegulationIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ServiceRegulationUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceRegulationSelect<ExtArgs> | null;
    omit?: Prisma.ServiceRegulationOmit<ExtArgs> | null;
    include?: Prisma.ServiceRegulationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceRegulationUpdateInput, Prisma.ServiceRegulationUncheckedUpdateInput>;
    where: Prisma.ServiceRegulationWhereUniqueInput;
};
export type ServiceRegulationUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ServiceRegulationUpdateManyMutationInput, Prisma.ServiceRegulationUncheckedUpdateManyInput>;
    where?: Prisma.ServiceRegulationWhereInput;
    limit?: number;
};
export type ServiceRegulationUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceRegulationSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ServiceRegulationOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceRegulationUpdateManyMutationInput, Prisma.ServiceRegulationUncheckedUpdateManyInput>;
    where?: Prisma.ServiceRegulationWhereInput;
    limit?: number;
    include?: Prisma.ServiceRegulationIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ServiceRegulationUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceRegulationSelect<ExtArgs> | null;
    omit?: Prisma.ServiceRegulationOmit<ExtArgs> | null;
    include?: Prisma.ServiceRegulationInclude<ExtArgs> | null;
    where: Prisma.ServiceRegulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceRegulationCreateInput, Prisma.ServiceRegulationUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ServiceRegulationUpdateInput, Prisma.ServiceRegulationUncheckedUpdateInput>;
};
export type ServiceRegulationDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceRegulationSelect<ExtArgs> | null;
    omit?: Prisma.ServiceRegulationOmit<ExtArgs> | null;
    include?: Prisma.ServiceRegulationInclude<ExtArgs> | null;
    where: Prisma.ServiceRegulationWhereUniqueInput;
};
export type ServiceRegulationDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceRegulationWhereInput;
    limit?: number;
};
export type ServiceRegulationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceRegulationSelect<ExtArgs> | null;
    omit?: Prisma.ServiceRegulationOmit<ExtArgs> | null;
    include?: Prisma.ServiceRegulationInclude<ExtArgs> | null;
};
export {};
