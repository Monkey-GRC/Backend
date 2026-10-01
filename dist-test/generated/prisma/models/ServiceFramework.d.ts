import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ServiceFrameworkModel = runtime.Types.Result.DefaultSelection<Prisma.$ServiceFrameworkPayload>;
export type AggregateServiceFramework = {
    _count: ServiceFrameworkCountAggregateOutputType | null;
    _min: ServiceFrameworkMinAggregateOutputType | null;
    _max: ServiceFrameworkMaxAggregateOutputType | null;
};
export type ServiceFrameworkMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    frameworkId: string | null;
    serviceId: string | null;
    catalogVersionId: string | null;
    contractedAt: Date | null;
    status: $Enums.ServiceFrameworkStatus | null;
    evaluationPeriod: string | null;
};
export type ServiceFrameworkMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    frameworkId: string | null;
    serviceId: string | null;
    catalogVersionId: string | null;
    contractedAt: Date | null;
    status: $Enums.ServiceFrameworkStatus | null;
    evaluationPeriod: string | null;
};
export type ServiceFrameworkCountAggregateOutputType = {
    id: number;
    tenantId: number;
    frameworkId: number;
    serviceId: number;
    catalogVersionId: number;
    contractedAt: number;
    status: number;
    evaluationPeriod: number;
    _all: number;
};
export type ServiceFrameworkMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    frameworkId?: true;
    serviceId?: true;
    catalogVersionId?: true;
    contractedAt?: true;
    status?: true;
    evaluationPeriod?: true;
};
export type ServiceFrameworkMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    frameworkId?: true;
    serviceId?: true;
    catalogVersionId?: true;
    contractedAt?: true;
    status?: true;
    evaluationPeriod?: true;
};
export type ServiceFrameworkCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    frameworkId?: true;
    serviceId?: true;
    catalogVersionId?: true;
    contractedAt?: true;
    status?: true;
    evaluationPeriod?: true;
    _all?: true;
};
export type ServiceFrameworkAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceFrameworkWhereInput;
    orderBy?: Prisma.ServiceFrameworkOrderByWithRelationInput | Prisma.ServiceFrameworkOrderByWithRelationInput[];
    cursor?: Prisma.ServiceFrameworkWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ServiceFrameworkCountAggregateInputType;
    _min?: ServiceFrameworkMinAggregateInputType;
    _max?: ServiceFrameworkMaxAggregateInputType;
};
export type GetServiceFrameworkAggregateType<T extends ServiceFrameworkAggregateArgs> = {
    [P in keyof T & keyof AggregateServiceFramework]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateServiceFramework[P]> : Prisma.GetScalarType<T[P], AggregateServiceFramework[P]>;
};
export type ServiceFrameworkGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceFrameworkWhereInput;
    orderBy?: Prisma.ServiceFrameworkOrderByWithAggregationInput | Prisma.ServiceFrameworkOrderByWithAggregationInput[];
    by: Prisma.ServiceFrameworkScalarFieldEnum[] | Prisma.ServiceFrameworkScalarFieldEnum;
    having?: Prisma.ServiceFrameworkScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ServiceFrameworkCountAggregateInputType | true;
    _min?: ServiceFrameworkMinAggregateInputType;
    _max?: ServiceFrameworkMaxAggregateInputType;
};
export type ServiceFrameworkGroupByOutputType = {
    id: string;
    tenantId: string;
    frameworkId: string;
    serviceId: string;
    catalogVersionId: string;
    contractedAt: Date;
    status: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
    _count: ServiceFrameworkCountAggregateOutputType | null;
    _min: ServiceFrameworkMinAggregateOutputType | null;
    _max: ServiceFrameworkMaxAggregateOutputType | null;
};
type GetServiceFrameworkGroupByPayload<T extends ServiceFrameworkGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ServiceFrameworkGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ServiceFrameworkGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ServiceFrameworkGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ServiceFrameworkGroupByOutputType[P]>;
}>>;
export type ServiceFrameworkWhereInput = {
    AND?: Prisma.ServiceFrameworkWhereInput | Prisma.ServiceFrameworkWhereInput[];
    OR?: Prisma.ServiceFrameworkWhereInput[];
    NOT?: Prisma.ServiceFrameworkWhereInput | Prisma.ServiceFrameworkWhereInput[];
    id?: Prisma.UuidFilter<"ServiceFramework"> | string;
    tenantId?: Prisma.UuidFilter<"ServiceFramework"> | string;
    frameworkId?: Prisma.UuidFilter<"ServiceFramework"> | string;
    serviceId?: Prisma.UuidFilter<"ServiceFramework"> | string;
    catalogVersionId?: Prisma.UuidFilter<"ServiceFramework"> | string;
    contractedAt?: Prisma.DateTimeFilter<"ServiceFramework"> | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFilter<"ServiceFramework"> | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFilter<"ServiceFramework"> | string;
    framework?: Prisma.XOR<Prisma.FrameworkScalarRelationFilter, Prisma.FrameworkWhereInput>;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    catalogVersion?: Prisma.XOR<Prisma.CatalogVersionScalarRelationFilter, Prisma.CatalogVersionWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type ServiceFrameworkOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    frameworkId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    catalogVersionId?: Prisma.SortOrder;
    contractedAt?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    evaluationPeriod?: Prisma.SortOrder;
    framework?: Prisma.FrameworkOrderByWithRelationInput;
    service?: Prisma.ServiceOrderByWithRelationInput;
    catalogVersion?: Prisma.CatalogVersionOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type ServiceFrameworkWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    serviceId_frameworkId?: Prisma.ServiceFrameworkServiceIdFrameworkIdCompoundUniqueInput;
    AND?: Prisma.ServiceFrameworkWhereInput | Prisma.ServiceFrameworkWhereInput[];
    OR?: Prisma.ServiceFrameworkWhereInput[];
    NOT?: Prisma.ServiceFrameworkWhereInput | Prisma.ServiceFrameworkWhereInput[];
    tenantId?: Prisma.UuidFilter<"ServiceFramework"> | string;
    frameworkId?: Prisma.UuidFilter<"ServiceFramework"> | string;
    serviceId?: Prisma.UuidFilter<"ServiceFramework"> | string;
    catalogVersionId?: Prisma.UuidFilter<"ServiceFramework"> | string;
    contractedAt?: Prisma.DateTimeFilter<"ServiceFramework"> | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFilter<"ServiceFramework"> | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFilter<"ServiceFramework"> | string;
    framework?: Prisma.XOR<Prisma.FrameworkScalarRelationFilter, Prisma.FrameworkWhereInput>;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    catalogVersion?: Prisma.XOR<Prisma.CatalogVersionScalarRelationFilter, Prisma.CatalogVersionWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id" | "serviceId_frameworkId">;
export type ServiceFrameworkOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    frameworkId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    catalogVersionId?: Prisma.SortOrder;
    contractedAt?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    evaluationPeriod?: Prisma.SortOrder;
    _count?: Prisma.ServiceFrameworkCountOrderByAggregateInput;
    _max?: Prisma.ServiceFrameworkMaxOrderByAggregateInput;
    _min?: Prisma.ServiceFrameworkMinOrderByAggregateInput;
};
export type ServiceFrameworkScalarWhereWithAggregatesInput = {
    AND?: Prisma.ServiceFrameworkScalarWhereWithAggregatesInput | Prisma.ServiceFrameworkScalarWhereWithAggregatesInput[];
    OR?: Prisma.ServiceFrameworkScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ServiceFrameworkScalarWhereWithAggregatesInput | Prisma.ServiceFrameworkScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ServiceFramework"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ServiceFramework"> | string;
    frameworkId?: Prisma.UuidWithAggregatesFilter<"ServiceFramework"> | string;
    serviceId?: Prisma.UuidWithAggregatesFilter<"ServiceFramework"> | string;
    catalogVersionId?: Prisma.UuidWithAggregatesFilter<"ServiceFramework"> | string;
    contractedAt?: Prisma.DateTimeWithAggregatesFilter<"ServiceFramework"> | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusWithAggregatesFilter<"ServiceFramework"> | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringWithAggregatesFilter<"ServiceFramework"> | string;
};
export type ServiceFrameworkCreateInput = {
    id?: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
    framework: Prisma.FrameworkCreateNestedOneWithoutServiceFrameworksInput;
    service: Prisma.ServiceCreateNestedOneWithoutFrameworksInput;
    catalogVersion: Prisma.CatalogVersionCreateNestedOneWithoutServiceFrameworksInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutServiceFrameworksInput;
};
export type ServiceFrameworkUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    frameworkId: string;
    serviceId: string;
    catalogVersionId: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
};
export type ServiceFrameworkUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    framework?: Prisma.FrameworkUpdateOneRequiredWithoutServiceFrameworksNestedInput;
    service?: Prisma.ServiceUpdateOneRequiredWithoutFrameworksNestedInput;
    catalogVersion?: Prisma.CatalogVersionUpdateOneRequiredWithoutServiceFrameworksNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutServiceFrameworksNestedInput;
};
export type ServiceFrameworkUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogVersionId?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceFrameworkCreateManyInput = {
    id?: string;
    tenantId: string;
    frameworkId: string;
    serviceId: string;
    catalogVersionId: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
};
export type ServiceFrameworkUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceFrameworkUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogVersionId?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceFrameworkListRelationFilter = {
    every?: Prisma.ServiceFrameworkWhereInput;
    some?: Prisma.ServiceFrameworkWhereInput;
    none?: Prisma.ServiceFrameworkWhereInput;
};
export type ServiceFrameworkOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ServiceFrameworkServiceIdFrameworkIdCompoundUniqueInput = {
    serviceId: string;
    frameworkId: string;
};
export type ServiceFrameworkCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    frameworkId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    catalogVersionId?: Prisma.SortOrder;
    contractedAt?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    evaluationPeriod?: Prisma.SortOrder;
};
export type ServiceFrameworkMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    frameworkId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    catalogVersionId?: Prisma.SortOrder;
    contractedAt?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    evaluationPeriod?: Prisma.SortOrder;
};
export type ServiceFrameworkMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    frameworkId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    catalogVersionId?: Prisma.SortOrder;
    contractedAt?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    evaluationPeriod?: Prisma.SortOrder;
};
export type ServiceFrameworkCreateNestedManyWithoutFrameworkInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutFrameworkInput, Prisma.ServiceFrameworkUncheckedCreateWithoutFrameworkInput> | Prisma.ServiceFrameworkCreateWithoutFrameworkInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutFrameworkInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutFrameworkInput | Prisma.ServiceFrameworkCreateOrConnectWithoutFrameworkInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyFrameworkInputEnvelope;
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
};
export type ServiceFrameworkUncheckedCreateNestedManyWithoutFrameworkInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutFrameworkInput, Prisma.ServiceFrameworkUncheckedCreateWithoutFrameworkInput> | Prisma.ServiceFrameworkCreateWithoutFrameworkInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutFrameworkInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutFrameworkInput | Prisma.ServiceFrameworkCreateOrConnectWithoutFrameworkInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyFrameworkInputEnvelope;
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
};
export type ServiceFrameworkUpdateManyWithoutFrameworkNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutFrameworkInput, Prisma.ServiceFrameworkUncheckedCreateWithoutFrameworkInput> | Prisma.ServiceFrameworkCreateWithoutFrameworkInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutFrameworkInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutFrameworkInput | Prisma.ServiceFrameworkCreateOrConnectWithoutFrameworkInput[];
    upsert?: Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutFrameworkInput | Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutFrameworkInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyFrameworkInputEnvelope;
    set?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    disconnect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    delete?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    update?: Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutFrameworkInput | Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutFrameworkInput[];
    updateMany?: Prisma.ServiceFrameworkUpdateManyWithWhereWithoutFrameworkInput | Prisma.ServiceFrameworkUpdateManyWithWhereWithoutFrameworkInput[];
    deleteMany?: Prisma.ServiceFrameworkScalarWhereInput | Prisma.ServiceFrameworkScalarWhereInput[];
};
export type ServiceFrameworkUncheckedUpdateManyWithoutFrameworkNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutFrameworkInput, Prisma.ServiceFrameworkUncheckedCreateWithoutFrameworkInput> | Prisma.ServiceFrameworkCreateWithoutFrameworkInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutFrameworkInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutFrameworkInput | Prisma.ServiceFrameworkCreateOrConnectWithoutFrameworkInput[];
    upsert?: Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutFrameworkInput | Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutFrameworkInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyFrameworkInputEnvelope;
    set?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    disconnect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    delete?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    update?: Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutFrameworkInput | Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutFrameworkInput[];
    updateMany?: Prisma.ServiceFrameworkUpdateManyWithWhereWithoutFrameworkInput | Prisma.ServiceFrameworkUpdateManyWithWhereWithoutFrameworkInput[];
    deleteMany?: Prisma.ServiceFrameworkScalarWhereInput | Prisma.ServiceFrameworkScalarWhereInput[];
};
export type ServiceFrameworkCreateNestedManyWithoutCatalogVersionInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutCatalogVersionInput, Prisma.ServiceFrameworkUncheckedCreateWithoutCatalogVersionInput> | Prisma.ServiceFrameworkCreateWithoutCatalogVersionInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutCatalogVersionInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutCatalogVersionInput | Prisma.ServiceFrameworkCreateOrConnectWithoutCatalogVersionInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyCatalogVersionInputEnvelope;
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
};
export type ServiceFrameworkUncheckedCreateNestedManyWithoutCatalogVersionInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutCatalogVersionInput, Prisma.ServiceFrameworkUncheckedCreateWithoutCatalogVersionInput> | Prisma.ServiceFrameworkCreateWithoutCatalogVersionInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutCatalogVersionInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutCatalogVersionInput | Prisma.ServiceFrameworkCreateOrConnectWithoutCatalogVersionInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyCatalogVersionInputEnvelope;
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
};
export type ServiceFrameworkUpdateManyWithoutCatalogVersionNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutCatalogVersionInput, Prisma.ServiceFrameworkUncheckedCreateWithoutCatalogVersionInput> | Prisma.ServiceFrameworkCreateWithoutCatalogVersionInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutCatalogVersionInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutCatalogVersionInput | Prisma.ServiceFrameworkCreateOrConnectWithoutCatalogVersionInput[];
    upsert?: Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutCatalogVersionInput | Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutCatalogVersionInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyCatalogVersionInputEnvelope;
    set?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    disconnect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    delete?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    update?: Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutCatalogVersionInput | Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutCatalogVersionInput[];
    updateMany?: Prisma.ServiceFrameworkUpdateManyWithWhereWithoutCatalogVersionInput | Prisma.ServiceFrameworkUpdateManyWithWhereWithoutCatalogVersionInput[];
    deleteMany?: Prisma.ServiceFrameworkScalarWhereInput | Prisma.ServiceFrameworkScalarWhereInput[];
};
export type ServiceFrameworkUncheckedUpdateManyWithoutCatalogVersionNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutCatalogVersionInput, Prisma.ServiceFrameworkUncheckedCreateWithoutCatalogVersionInput> | Prisma.ServiceFrameworkCreateWithoutCatalogVersionInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutCatalogVersionInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutCatalogVersionInput | Prisma.ServiceFrameworkCreateOrConnectWithoutCatalogVersionInput[];
    upsert?: Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutCatalogVersionInput | Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutCatalogVersionInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyCatalogVersionInputEnvelope;
    set?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    disconnect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    delete?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    update?: Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutCatalogVersionInput | Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutCatalogVersionInput[];
    updateMany?: Prisma.ServiceFrameworkUpdateManyWithWhereWithoutCatalogVersionInput | Prisma.ServiceFrameworkUpdateManyWithWhereWithoutCatalogVersionInput[];
    deleteMany?: Prisma.ServiceFrameworkScalarWhereInput | Prisma.ServiceFrameworkScalarWhereInput[];
};
export type ServiceFrameworkCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutTenantInput, Prisma.ServiceFrameworkUncheckedCreateWithoutTenantInput> | Prisma.ServiceFrameworkCreateWithoutTenantInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutTenantInput | Prisma.ServiceFrameworkCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyTenantInputEnvelope;
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
};
export type ServiceFrameworkUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutTenantInput, Prisma.ServiceFrameworkUncheckedCreateWithoutTenantInput> | Prisma.ServiceFrameworkCreateWithoutTenantInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutTenantInput | Prisma.ServiceFrameworkCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyTenantInputEnvelope;
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
};
export type ServiceFrameworkUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutTenantInput, Prisma.ServiceFrameworkUncheckedCreateWithoutTenantInput> | Prisma.ServiceFrameworkCreateWithoutTenantInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutTenantInput | Prisma.ServiceFrameworkCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutTenantInput | Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyTenantInputEnvelope;
    set?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    disconnect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    delete?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    update?: Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutTenantInput | Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ServiceFrameworkUpdateManyWithWhereWithoutTenantInput | Prisma.ServiceFrameworkUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ServiceFrameworkScalarWhereInput | Prisma.ServiceFrameworkScalarWhereInput[];
};
export type ServiceFrameworkUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutTenantInput, Prisma.ServiceFrameworkUncheckedCreateWithoutTenantInput> | Prisma.ServiceFrameworkCreateWithoutTenantInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutTenantInput | Prisma.ServiceFrameworkCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutTenantInput | Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyTenantInputEnvelope;
    set?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    disconnect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    delete?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    update?: Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutTenantInput | Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ServiceFrameworkUpdateManyWithWhereWithoutTenantInput | Prisma.ServiceFrameworkUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ServiceFrameworkScalarWhereInput | Prisma.ServiceFrameworkScalarWhereInput[];
};
export type ServiceFrameworkCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutServiceInput, Prisma.ServiceFrameworkUncheckedCreateWithoutServiceInput> | Prisma.ServiceFrameworkCreateWithoutServiceInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutServiceInput | Prisma.ServiceFrameworkCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyServiceInputEnvelope;
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
};
export type ServiceFrameworkUncheckedCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutServiceInput, Prisma.ServiceFrameworkUncheckedCreateWithoutServiceInput> | Prisma.ServiceFrameworkCreateWithoutServiceInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutServiceInput | Prisma.ServiceFrameworkCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyServiceInputEnvelope;
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
};
export type ServiceFrameworkUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutServiceInput, Prisma.ServiceFrameworkUncheckedCreateWithoutServiceInput> | Prisma.ServiceFrameworkCreateWithoutServiceInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutServiceInput | Prisma.ServiceFrameworkCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutServiceInput | Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyServiceInputEnvelope;
    set?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    disconnect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    delete?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    update?: Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutServiceInput | Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.ServiceFrameworkUpdateManyWithWhereWithoutServiceInput | Prisma.ServiceFrameworkUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.ServiceFrameworkScalarWhereInput | Prisma.ServiceFrameworkScalarWhereInput[];
};
export type ServiceFrameworkUncheckedUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutServiceInput, Prisma.ServiceFrameworkUncheckedCreateWithoutServiceInput> | Prisma.ServiceFrameworkCreateWithoutServiceInput[] | Prisma.ServiceFrameworkUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ServiceFrameworkCreateOrConnectWithoutServiceInput | Prisma.ServiceFrameworkCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutServiceInput | Prisma.ServiceFrameworkUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.ServiceFrameworkCreateManyServiceInputEnvelope;
    set?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    disconnect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    delete?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    connect?: Prisma.ServiceFrameworkWhereUniqueInput | Prisma.ServiceFrameworkWhereUniqueInput[];
    update?: Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutServiceInput | Prisma.ServiceFrameworkUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.ServiceFrameworkUpdateManyWithWhereWithoutServiceInput | Prisma.ServiceFrameworkUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.ServiceFrameworkScalarWhereInput | Prisma.ServiceFrameworkScalarWhereInput[];
};
export type EnumServiceFrameworkStatusFieldUpdateOperationsInput = {
    set?: $Enums.ServiceFrameworkStatus;
};
export type ServiceFrameworkCreateWithoutFrameworkInput = {
    id?: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
    service: Prisma.ServiceCreateNestedOneWithoutFrameworksInput;
    catalogVersion: Prisma.CatalogVersionCreateNestedOneWithoutServiceFrameworksInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutServiceFrameworksInput;
};
export type ServiceFrameworkUncheckedCreateWithoutFrameworkInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    catalogVersionId: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
};
export type ServiceFrameworkCreateOrConnectWithoutFrameworkInput = {
    where: Prisma.ServiceFrameworkWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutFrameworkInput, Prisma.ServiceFrameworkUncheckedCreateWithoutFrameworkInput>;
};
export type ServiceFrameworkCreateManyFrameworkInputEnvelope = {
    data: Prisma.ServiceFrameworkCreateManyFrameworkInput | Prisma.ServiceFrameworkCreateManyFrameworkInput[];
    skipDuplicates?: boolean;
};
export type ServiceFrameworkUpsertWithWhereUniqueWithoutFrameworkInput = {
    where: Prisma.ServiceFrameworkWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceFrameworkUpdateWithoutFrameworkInput, Prisma.ServiceFrameworkUncheckedUpdateWithoutFrameworkInput>;
    create: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutFrameworkInput, Prisma.ServiceFrameworkUncheckedCreateWithoutFrameworkInput>;
};
export type ServiceFrameworkUpdateWithWhereUniqueWithoutFrameworkInput = {
    where: Prisma.ServiceFrameworkWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceFrameworkUpdateWithoutFrameworkInput, Prisma.ServiceFrameworkUncheckedUpdateWithoutFrameworkInput>;
};
export type ServiceFrameworkUpdateManyWithWhereWithoutFrameworkInput = {
    where: Prisma.ServiceFrameworkScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceFrameworkUpdateManyMutationInput, Prisma.ServiceFrameworkUncheckedUpdateManyWithoutFrameworkInput>;
};
export type ServiceFrameworkScalarWhereInput = {
    AND?: Prisma.ServiceFrameworkScalarWhereInput | Prisma.ServiceFrameworkScalarWhereInput[];
    OR?: Prisma.ServiceFrameworkScalarWhereInput[];
    NOT?: Prisma.ServiceFrameworkScalarWhereInput | Prisma.ServiceFrameworkScalarWhereInput[];
    id?: Prisma.UuidFilter<"ServiceFramework"> | string;
    tenantId?: Prisma.UuidFilter<"ServiceFramework"> | string;
    frameworkId?: Prisma.UuidFilter<"ServiceFramework"> | string;
    serviceId?: Prisma.UuidFilter<"ServiceFramework"> | string;
    catalogVersionId?: Prisma.UuidFilter<"ServiceFramework"> | string;
    contractedAt?: Prisma.DateTimeFilter<"ServiceFramework"> | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFilter<"ServiceFramework"> | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFilter<"ServiceFramework"> | string;
};
export type ServiceFrameworkCreateWithoutCatalogVersionInput = {
    id?: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
    framework: Prisma.FrameworkCreateNestedOneWithoutServiceFrameworksInput;
    service: Prisma.ServiceCreateNestedOneWithoutFrameworksInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutServiceFrameworksInput;
};
export type ServiceFrameworkUncheckedCreateWithoutCatalogVersionInput = {
    id?: string;
    tenantId: string;
    frameworkId: string;
    serviceId: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
};
export type ServiceFrameworkCreateOrConnectWithoutCatalogVersionInput = {
    where: Prisma.ServiceFrameworkWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutCatalogVersionInput, Prisma.ServiceFrameworkUncheckedCreateWithoutCatalogVersionInput>;
};
export type ServiceFrameworkCreateManyCatalogVersionInputEnvelope = {
    data: Prisma.ServiceFrameworkCreateManyCatalogVersionInput | Prisma.ServiceFrameworkCreateManyCatalogVersionInput[];
    skipDuplicates?: boolean;
};
export type ServiceFrameworkUpsertWithWhereUniqueWithoutCatalogVersionInput = {
    where: Prisma.ServiceFrameworkWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceFrameworkUpdateWithoutCatalogVersionInput, Prisma.ServiceFrameworkUncheckedUpdateWithoutCatalogVersionInput>;
    create: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutCatalogVersionInput, Prisma.ServiceFrameworkUncheckedCreateWithoutCatalogVersionInput>;
};
export type ServiceFrameworkUpdateWithWhereUniqueWithoutCatalogVersionInput = {
    where: Prisma.ServiceFrameworkWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceFrameworkUpdateWithoutCatalogVersionInput, Prisma.ServiceFrameworkUncheckedUpdateWithoutCatalogVersionInput>;
};
export type ServiceFrameworkUpdateManyWithWhereWithoutCatalogVersionInput = {
    where: Prisma.ServiceFrameworkScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceFrameworkUpdateManyMutationInput, Prisma.ServiceFrameworkUncheckedUpdateManyWithoutCatalogVersionInput>;
};
export type ServiceFrameworkCreateWithoutTenantInput = {
    id?: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
    framework: Prisma.FrameworkCreateNestedOneWithoutServiceFrameworksInput;
    service: Prisma.ServiceCreateNestedOneWithoutFrameworksInput;
    catalogVersion: Prisma.CatalogVersionCreateNestedOneWithoutServiceFrameworksInput;
};
export type ServiceFrameworkUncheckedCreateWithoutTenantInput = {
    id?: string;
    frameworkId: string;
    serviceId: string;
    catalogVersionId: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
};
export type ServiceFrameworkCreateOrConnectWithoutTenantInput = {
    where: Prisma.ServiceFrameworkWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutTenantInput, Prisma.ServiceFrameworkUncheckedCreateWithoutTenantInput>;
};
export type ServiceFrameworkCreateManyTenantInputEnvelope = {
    data: Prisma.ServiceFrameworkCreateManyTenantInput | Prisma.ServiceFrameworkCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ServiceFrameworkUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ServiceFrameworkWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceFrameworkUpdateWithoutTenantInput, Prisma.ServiceFrameworkUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutTenantInput, Prisma.ServiceFrameworkUncheckedCreateWithoutTenantInput>;
};
export type ServiceFrameworkUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ServiceFrameworkWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceFrameworkUpdateWithoutTenantInput, Prisma.ServiceFrameworkUncheckedUpdateWithoutTenantInput>;
};
export type ServiceFrameworkUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ServiceFrameworkScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceFrameworkUpdateManyMutationInput, Prisma.ServiceFrameworkUncheckedUpdateManyWithoutTenantInput>;
};
export type ServiceFrameworkCreateWithoutServiceInput = {
    id?: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
    framework: Prisma.FrameworkCreateNestedOneWithoutServiceFrameworksInput;
    catalogVersion: Prisma.CatalogVersionCreateNestedOneWithoutServiceFrameworksInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutServiceFrameworksInput;
};
export type ServiceFrameworkUncheckedCreateWithoutServiceInput = {
    id?: string;
    tenantId: string;
    frameworkId: string;
    catalogVersionId: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
};
export type ServiceFrameworkCreateOrConnectWithoutServiceInput = {
    where: Prisma.ServiceFrameworkWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutServiceInput, Prisma.ServiceFrameworkUncheckedCreateWithoutServiceInput>;
};
export type ServiceFrameworkCreateManyServiceInputEnvelope = {
    data: Prisma.ServiceFrameworkCreateManyServiceInput | Prisma.ServiceFrameworkCreateManyServiceInput[];
    skipDuplicates?: boolean;
};
export type ServiceFrameworkUpsertWithWhereUniqueWithoutServiceInput = {
    where: Prisma.ServiceFrameworkWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceFrameworkUpdateWithoutServiceInput, Prisma.ServiceFrameworkUncheckedUpdateWithoutServiceInput>;
    create: Prisma.XOR<Prisma.ServiceFrameworkCreateWithoutServiceInput, Prisma.ServiceFrameworkUncheckedCreateWithoutServiceInput>;
};
export type ServiceFrameworkUpdateWithWhereUniqueWithoutServiceInput = {
    where: Prisma.ServiceFrameworkWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceFrameworkUpdateWithoutServiceInput, Prisma.ServiceFrameworkUncheckedUpdateWithoutServiceInput>;
};
export type ServiceFrameworkUpdateManyWithWhereWithoutServiceInput = {
    where: Prisma.ServiceFrameworkScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceFrameworkUpdateManyMutationInput, Prisma.ServiceFrameworkUncheckedUpdateManyWithoutServiceInput>;
};
export type ServiceFrameworkCreateManyFrameworkInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    catalogVersionId: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
};
export type ServiceFrameworkUpdateWithoutFrameworkInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutFrameworksNestedInput;
    catalogVersion?: Prisma.CatalogVersionUpdateOneRequiredWithoutServiceFrameworksNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutServiceFrameworksNestedInput;
};
export type ServiceFrameworkUncheckedUpdateWithoutFrameworkInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogVersionId?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceFrameworkUncheckedUpdateManyWithoutFrameworkInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogVersionId?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceFrameworkCreateManyCatalogVersionInput = {
    id?: string;
    tenantId: string;
    frameworkId: string;
    serviceId: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
};
export type ServiceFrameworkUpdateWithoutCatalogVersionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    framework?: Prisma.FrameworkUpdateOneRequiredWithoutServiceFrameworksNestedInput;
    service?: Prisma.ServiceUpdateOneRequiredWithoutFrameworksNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutServiceFrameworksNestedInput;
};
export type ServiceFrameworkUncheckedUpdateWithoutCatalogVersionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceFrameworkUncheckedUpdateManyWithoutCatalogVersionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceFrameworkCreateManyTenantInput = {
    id?: string;
    frameworkId: string;
    serviceId: string;
    catalogVersionId: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
};
export type ServiceFrameworkUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    framework?: Prisma.FrameworkUpdateOneRequiredWithoutServiceFrameworksNestedInput;
    service?: Prisma.ServiceUpdateOneRequiredWithoutFrameworksNestedInput;
    catalogVersion?: Prisma.CatalogVersionUpdateOneRequiredWithoutServiceFrameworksNestedInput;
};
export type ServiceFrameworkUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogVersionId?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceFrameworkUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogVersionId?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceFrameworkCreateManyServiceInput = {
    id?: string;
    tenantId: string;
    frameworkId: string;
    catalogVersionId: string;
    contractedAt: Date | string;
    status?: $Enums.ServiceFrameworkStatus;
    evaluationPeriod: string;
};
export type ServiceFrameworkUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
    framework?: Prisma.FrameworkUpdateOneRequiredWithoutServiceFrameworksNestedInput;
    catalogVersion?: Prisma.CatalogVersionUpdateOneRequiredWithoutServiceFrameworksNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutServiceFrameworksNestedInput;
};
export type ServiceFrameworkUncheckedUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogVersionId?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceFrameworkUncheckedUpdateManyWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkId?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogVersionId?: Prisma.StringFieldUpdateOperationsInput | string;
    contractedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumServiceFrameworkStatusFieldUpdateOperationsInput | $Enums.ServiceFrameworkStatus;
    evaluationPeriod?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ServiceFrameworkSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    frameworkId?: boolean;
    serviceId?: boolean;
    catalogVersionId?: boolean;
    contractedAt?: boolean;
    status?: boolean;
    evaluationPeriod?: boolean;
    framework?: boolean | Prisma.FrameworkDefaultArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    catalogVersion?: boolean | Prisma.CatalogVersionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["serviceFramework"]>;
export type ServiceFrameworkSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    frameworkId?: boolean;
    serviceId?: boolean;
    catalogVersionId?: boolean;
    contractedAt?: boolean;
    status?: boolean;
    evaluationPeriod?: boolean;
    framework?: boolean | Prisma.FrameworkDefaultArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    catalogVersion?: boolean | Prisma.CatalogVersionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["serviceFramework"]>;
export type ServiceFrameworkSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    frameworkId?: boolean;
    serviceId?: boolean;
    catalogVersionId?: boolean;
    contractedAt?: boolean;
    status?: boolean;
    evaluationPeriod?: boolean;
    framework?: boolean | Prisma.FrameworkDefaultArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    catalogVersion?: boolean | Prisma.CatalogVersionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["serviceFramework"]>;
export type ServiceFrameworkSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    frameworkId?: boolean;
    serviceId?: boolean;
    catalogVersionId?: boolean;
    contractedAt?: boolean;
    status?: boolean;
    evaluationPeriod?: boolean;
};
export type ServiceFrameworkOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "frameworkId" | "serviceId" | "catalogVersionId" | "contractedAt" | "status" | "evaluationPeriod", ExtArgs["result"]["serviceFramework"]>;
export type ServiceFrameworkInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    framework?: boolean | Prisma.FrameworkDefaultArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    catalogVersion?: boolean | Prisma.CatalogVersionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ServiceFrameworkIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    framework?: boolean | Prisma.FrameworkDefaultArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    catalogVersion?: boolean | Prisma.CatalogVersionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ServiceFrameworkIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    framework?: boolean | Prisma.FrameworkDefaultArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    catalogVersion?: boolean | Prisma.CatalogVersionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ServiceFrameworkPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ServiceFramework";
    objects: {
        framework: Prisma.$FrameworkPayload<ExtArgs>;
        service: Prisma.$ServicePayload<ExtArgs>;
        catalogVersion: Prisma.$CatalogVersionPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        frameworkId: string;
        serviceId: string;
        catalogVersionId: string;
        contractedAt: Date;
        status: $Enums.ServiceFrameworkStatus;
        evaluationPeriod: string;
    }, ExtArgs["result"]["serviceFramework"]>;
    composites: {};
};
export type ServiceFrameworkGetPayload<S extends boolean | null | undefined | ServiceFrameworkDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ServiceFrameworkPayload, S>;
export type ServiceFrameworkCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ServiceFrameworkFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ServiceFrameworkCountAggregateInputType | true;
};
export interface ServiceFrameworkDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ServiceFramework'];
        meta: {
            name: 'ServiceFramework';
        };
    };
    findUnique<T extends ServiceFrameworkFindUniqueArgs>(args: Prisma.SelectSubset<T, ServiceFrameworkFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ServiceFrameworkClient<runtime.Types.Result.GetResult<Prisma.$ServiceFrameworkPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ServiceFrameworkFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ServiceFrameworkFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ServiceFrameworkClient<runtime.Types.Result.GetResult<Prisma.$ServiceFrameworkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ServiceFrameworkFindFirstArgs>(args?: Prisma.SelectSubset<T, ServiceFrameworkFindFirstArgs<ExtArgs>>): Prisma.Prisma__ServiceFrameworkClient<runtime.Types.Result.GetResult<Prisma.$ServiceFrameworkPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ServiceFrameworkFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ServiceFrameworkFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ServiceFrameworkClient<runtime.Types.Result.GetResult<Prisma.$ServiceFrameworkPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ServiceFrameworkFindManyArgs>(args?: Prisma.SelectSubset<T, ServiceFrameworkFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceFrameworkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ServiceFrameworkCreateArgs>(args: Prisma.SelectSubset<T, ServiceFrameworkCreateArgs<ExtArgs>>): Prisma.Prisma__ServiceFrameworkClient<runtime.Types.Result.GetResult<Prisma.$ServiceFrameworkPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ServiceFrameworkCreateManyArgs>(args?: Prisma.SelectSubset<T, ServiceFrameworkCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ServiceFrameworkCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ServiceFrameworkCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceFrameworkPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ServiceFrameworkDeleteArgs>(args: Prisma.SelectSubset<T, ServiceFrameworkDeleteArgs<ExtArgs>>): Prisma.Prisma__ServiceFrameworkClient<runtime.Types.Result.GetResult<Prisma.$ServiceFrameworkPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ServiceFrameworkUpdateArgs>(args: Prisma.SelectSubset<T, ServiceFrameworkUpdateArgs<ExtArgs>>): Prisma.Prisma__ServiceFrameworkClient<runtime.Types.Result.GetResult<Prisma.$ServiceFrameworkPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ServiceFrameworkDeleteManyArgs>(args?: Prisma.SelectSubset<T, ServiceFrameworkDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ServiceFrameworkUpdateManyArgs>(args: Prisma.SelectSubset<T, ServiceFrameworkUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ServiceFrameworkUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ServiceFrameworkUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceFrameworkPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ServiceFrameworkUpsertArgs>(args: Prisma.SelectSubset<T, ServiceFrameworkUpsertArgs<ExtArgs>>): Prisma.Prisma__ServiceFrameworkClient<runtime.Types.Result.GetResult<Prisma.$ServiceFrameworkPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ServiceFrameworkCountArgs>(args?: Prisma.Subset<T, ServiceFrameworkCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ServiceFrameworkCountAggregateOutputType> : number>;
    aggregate<T extends ServiceFrameworkAggregateArgs>(args: Prisma.Subset<T, ServiceFrameworkAggregateArgs>): Prisma.PrismaPromise<GetServiceFrameworkAggregateType<T>>;
    groupBy<T extends ServiceFrameworkGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ServiceFrameworkGroupByArgs['orderBy'];
    } : {
        orderBy?: ServiceFrameworkGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ServiceFrameworkGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServiceFrameworkGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ServiceFrameworkFieldRefs;
}
export interface Prisma__ServiceFrameworkClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    framework<T extends Prisma.FrameworkDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.FrameworkDefaultArgs<ExtArgs>>): Prisma.Prisma__FrameworkClient<runtime.Types.Result.GetResult<Prisma.$FrameworkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    service<T extends Prisma.ServiceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ServiceDefaultArgs<ExtArgs>>): Prisma.Prisma__ServiceClient<runtime.Types.Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    catalogVersion<T extends Prisma.CatalogVersionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CatalogVersionDefaultArgs<ExtArgs>>): Prisma.Prisma__CatalogVersionClient<runtime.Types.Result.GetResult<Prisma.$CatalogVersionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ServiceFrameworkFieldRefs {
    readonly id: Prisma.FieldRef<"ServiceFramework", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ServiceFramework", 'String'>;
    readonly frameworkId: Prisma.FieldRef<"ServiceFramework", 'String'>;
    readonly serviceId: Prisma.FieldRef<"ServiceFramework", 'String'>;
    readonly catalogVersionId: Prisma.FieldRef<"ServiceFramework", 'String'>;
    readonly contractedAt: Prisma.FieldRef<"ServiceFramework", 'DateTime'>;
    readonly status: Prisma.FieldRef<"ServiceFramework", 'ServiceFrameworkStatus'>;
    readonly evaluationPeriod: Prisma.FieldRef<"ServiceFramework", 'String'>;
}
export type ServiceFrameworkFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceFrameworkSelect<ExtArgs> | null;
    omit?: Prisma.ServiceFrameworkOmit<ExtArgs> | null;
    include?: Prisma.ServiceFrameworkInclude<ExtArgs> | null;
    where: Prisma.ServiceFrameworkWhereUniqueInput;
};
export type ServiceFrameworkFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceFrameworkSelect<ExtArgs> | null;
    omit?: Prisma.ServiceFrameworkOmit<ExtArgs> | null;
    include?: Prisma.ServiceFrameworkInclude<ExtArgs> | null;
    where: Prisma.ServiceFrameworkWhereUniqueInput;
};
export type ServiceFrameworkFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceFrameworkSelect<ExtArgs> | null;
    omit?: Prisma.ServiceFrameworkOmit<ExtArgs> | null;
    include?: Prisma.ServiceFrameworkInclude<ExtArgs> | null;
    where?: Prisma.ServiceFrameworkWhereInput;
    orderBy?: Prisma.ServiceFrameworkOrderByWithRelationInput | Prisma.ServiceFrameworkOrderByWithRelationInput[];
    cursor?: Prisma.ServiceFrameworkWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceFrameworkScalarFieldEnum | Prisma.ServiceFrameworkScalarFieldEnum[];
};
export type ServiceFrameworkFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceFrameworkSelect<ExtArgs> | null;
    omit?: Prisma.ServiceFrameworkOmit<ExtArgs> | null;
    include?: Prisma.ServiceFrameworkInclude<ExtArgs> | null;
    where?: Prisma.ServiceFrameworkWhereInput;
    orderBy?: Prisma.ServiceFrameworkOrderByWithRelationInput | Prisma.ServiceFrameworkOrderByWithRelationInput[];
    cursor?: Prisma.ServiceFrameworkWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceFrameworkScalarFieldEnum | Prisma.ServiceFrameworkScalarFieldEnum[];
};
export type ServiceFrameworkFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceFrameworkSelect<ExtArgs> | null;
    omit?: Prisma.ServiceFrameworkOmit<ExtArgs> | null;
    include?: Prisma.ServiceFrameworkInclude<ExtArgs> | null;
    where?: Prisma.ServiceFrameworkWhereInput;
    orderBy?: Prisma.ServiceFrameworkOrderByWithRelationInput | Prisma.ServiceFrameworkOrderByWithRelationInput[];
    cursor?: Prisma.ServiceFrameworkWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceFrameworkScalarFieldEnum | Prisma.ServiceFrameworkScalarFieldEnum[];
};
export type ServiceFrameworkCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceFrameworkSelect<ExtArgs> | null;
    omit?: Prisma.ServiceFrameworkOmit<ExtArgs> | null;
    include?: Prisma.ServiceFrameworkInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceFrameworkCreateInput, Prisma.ServiceFrameworkUncheckedCreateInput>;
};
export type ServiceFrameworkCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ServiceFrameworkCreateManyInput | Prisma.ServiceFrameworkCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ServiceFrameworkCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceFrameworkSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ServiceFrameworkOmit<ExtArgs> | null;
    data: Prisma.ServiceFrameworkCreateManyInput | Prisma.ServiceFrameworkCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ServiceFrameworkIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ServiceFrameworkUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceFrameworkSelect<ExtArgs> | null;
    omit?: Prisma.ServiceFrameworkOmit<ExtArgs> | null;
    include?: Prisma.ServiceFrameworkInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceFrameworkUpdateInput, Prisma.ServiceFrameworkUncheckedUpdateInput>;
    where: Prisma.ServiceFrameworkWhereUniqueInput;
};
export type ServiceFrameworkUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ServiceFrameworkUpdateManyMutationInput, Prisma.ServiceFrameworkUncheckedUpdateManyInput>;
    where?: Prisma.ServiceFrameworkWhereInput;
    limit?: number;
};
export type ServiceFrameworkUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceFrameworkSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ServiceFrameworkOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceFrameworkUpdateManyMutationInput, Prisma.ServiceFrameworkUncheckedUpdateManyInput>;
    where?: Prisma.ServiceFrameworkWhereInput;
    limit?: number;
    include?: Prisma.ServiceFrameworkIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ServiceFrameworkUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceFrameworkSelect<ExtArgs> | null;
    omit?: Prisma.ServiceFrameworkOmit<ExtArgs> | null;
    include?: Prisma.ServiceFrameworkInclude<ExtArgs> | null;
    where: Prisma.ServiceFrameworkWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceFrameworkCreateInput, Prisma.ServiceFrameworkUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ServiceFrameworkUpdateInput, Prisma.ServiceFrameworkUncheckedUpdateInput>;
};
export type ServiceFrameworkDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceFrameworkSelect<ExtArgs> | null;
    omit?: Prisma.ServiceFrameworkOmit<ExtArgs> | null;
    include?: Prisma.ServiceFrameworkInclude<ExtArgs> | null;
    where: Prisma.ServiceFrameworkWhereUniqueInput;
};
export type ServiceFrameworkDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceFrameworkWhereInput;
    limit?: number;
};
export type ServiceFrameworkDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceFrameworkSelect<ExtArgs> | null;
    omit?: Prisma.ServiceFrameworkOmit<ExtArgs> | null;
    include?: Prisma.ServiceFrameworkInclude<ExtArgs> | null;
};
export {};
