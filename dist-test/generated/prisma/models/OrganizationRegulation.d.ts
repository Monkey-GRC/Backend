import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type OrganizationRegulationModel = runtime.Types.Result.DefaultSelection<Prisma.$OrganizationRegulationPayload>;
export type AggregateOrganizationRegulation = {
    _count: OrganizationRegulationCountAggregateOutputType | null;
    _min: OrganizationRegulationMinAggregateOutputType | null;
    _max: OrganizationRegulationMaxAggregateOutputType | null;
};
export type OrganizationRegulationMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    organizationId: string | null;
    regulationId: string | null;
};
export type OrganizationRegulationMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    organizationId: string | null;
    regulationId: string | null;
};
export type OrganizationRegulationCountAggregateOutputType = {
    id: number;
    tenantId: number;
    organizationId: number;
    regulationId: number;
    _all: number;
};
export type OrganizationRegulationMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    organizationId?: true;
    regulationId?: true;
};
export type OrganizationRegulationMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    organizationId?: true;
    regulationId?: true;
};
export type OrganizationRegulationCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    organizationId?: true;
    regulationId?: true;
    _all?: true;
};
export type OrganizationRegulationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrganizationRegulationWhereInput;
    orderBy?: Prisma.OrganizationRegulationOrderByWithRelationInput | Prisma.OrganizationRegulationOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationRegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | OrganizationRegulationCountAggregateInputType;
    _min?: OrganizationRegulationMinAggregateInputType;
    _max?: OrganizationRegulationMaxAggregateInputType;
};
export type GetOrganizationRegulationAggregateType<T extends OrganizationRegulationAggregateArgs> = {
    [P in keyof T & keyof AggregateOrganizationRegulation]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateOrganizationRegulation[P]> : Prisma.GetScalarType<T[P], AggregateOrganizationRegulation[P]>;
};
export type OrganizationRegulationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrganizationRegulationWhereInput;
    orderBy?: Prisma.OrganizationRegulationOrderByWithAggregationInput | Prisma.OrganizationRegulationOrderByWithAggregationInput[];
    by: Prisma.OrganizationRegulationScalarFieldEnum[] | Prisma.OrganizationRegulationScalarFieldEnum;
    having?: Prisma.OrganizationRegulationScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: OrganizationRegulationCountAggregateInputType | true;
    _min?: OrganizationRegulationMinAggregateInputType;
    _max?: OrganizationRegulationMaxAggregateInputType;
};
export type OrganizationRegulationGroupByOutputType = {
    id: string;
    tenantId: string;
    organizationId: string;
    regulationId: string;
    _count: OrganizationRegulationCountAggregateOutputType | null;
    _min: OrganizationRegulationMinAggregateOutputType | null;
    _max: OrganizationRegulationMaxAggregateOutputType | null;
};
type GetOrganizationRegulationGroupByPayload<T extends OrganizationRegulationGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<OrganizationRegulationGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof OrganizationRegulationGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], OrganizationRegulationGroupByOutputType[P]> : Prisma.GetScalarType<T[P], OrganizationRegulationGroupByOutputType[P]>;
}>>;
export type OrganizationRegulationWhereInput = {
    AND?: Prisma.OrganizationRegulationWhereInput | Prisma.OrganizationRegulationWhereInput[];
    OR?: Prisma.OrganizationRegulationWhereInput[];
    NOT?: Prisma.OrganizationRegulationWhereInput | Prisma.OrganizationRegulationWhereInput[];
    id?: Prisma.UuidFilter<"OrganizationRegulation"> | string;
    tenantId?: Prisma.UuidFilter<"OrganizationRegulation"> | string;
    organizationId?: Prisma.UuidFilter<"OrganizationRegulation"> | string;
    regulationId?: Prisma.UuidFilter<"OrganizationRegulation"> | string;
    organization?: Prisma.XOR<Prisma.OrganizationScalarRelationFilter, Prisma.OrganizationWhereInput>;
    regulation?: Prisma.XOR<Prisma.RegulationScalarRelationFilter, Prisma.RegulationWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type OrganizationRegulationOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    regulationId?: Prisma.SortOrder;
    organization?: Prisma.OrganizationOrderByWithRelationInput;
    regulation?: Prisma.RegulationOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type OrganizationRegulationWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    organizationId_regulationId?: Prisma.OrganizationRegulationOrganizationIdRegulationIdCompoundUniqueInput;
    AND?: Prisma.OrganizationRegulationWhereInput | Prisma.OrganizationRegulationWhereInput[];
    OR?: Prisma.OrganizationRegulationWhereInput[];
    NOT?: Prisma.OrganizationRegulationWhereInput | Prisma.OrganizationRegulationWhereInput[];
    tenantId?: Prisma.UuidFilter<"OrganizationRegulation"> | string;
    organizationId?: Prisma.UuidFilter<"OrganizationRegulation"> | string;
    regulationId?: Prisma.UuidFilter<"OrganizationRegulation"> | string;
    organization?: Prisma.XOR<Prisma.OrganizationScalarRelationFilter, Prisma.OrganizationWhereInput>;
    regulation?: Prisma.XOR<Prisma.RegulationScalarRelationFilter, Prisma.RegulationWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id" | "organizationId_regulationId">;
export type OrganizationRegulationOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    regulationId?: Prisma.SortOrder;
    _count?: Prisma.OrganizationRegulationCountOrderByAggregateInput;
    _max?: Prisma.OrganizationRegulationMaxOrderByAggregateInput;
    _min?: Prisma.OrganizationRegulationMinOrderByAggregateInput;
};
export type OrganizationRegulationScalarWhereWithAggregatesInput = {
    AND?: Prisma.OrganizationRegulationScalarWhereWithAggregatesInput | Prisma.OrganizationRegulationScalarWhereWithAggregatesInput[];
    OR?: Prisma.OrganizationRegulationScalarWhereWithAggregatesInput[];
    NOT?: Prisma.OrganizationRegulationScalarWhereWithAggregatesInput | Prisma.OrganizationRegulationScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"OrganizationRegulation"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"OrganizationRegulation"> | string;
    organizationId?: Prisma.UuidWithAggregatesFilter<"OrganizationRegulation"> | string;
    regulationId?: Prisma.UuidWithAggregatesFilter<"OrganizationRegulation"> | string;
};
export type OrganizationRegulationCreateInput = {
    id?: string;
    organization: Prisma.OrganizationCreateNestedOneWithoutRegulationsInput;
    regulation: Prisma.RegulationCreateNestedOneWithoutOrganizationRegulationsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutOrganizationRegulationsInput;
};
export type OrganizationRegulationUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    organizationId: string;
    regulationId: string;
};
export type OrganizationRegulationUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organization?: Prisma.OrganizationUpdateOneRequiredWithoutRegulationsNestedInput;
    regulation?: Prisma.RegulationUpdateOneRequiredWithoutOrganizationRegulationsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutOrganizationRegulationsNestedInput;
};
export type OrganizationRegulationUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    regulationId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type OrganizationRegulationCreateManyInput = {
    id?: string;
    tenantId: string;
    organizationId: string;
    regulationId: string;
};
export type OrganizationRegulationUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type OrganizationRegulationUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    regulationId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type OrganizationRegulationListRelationFilter = {
    every?: Prisma.OrganizationRegulationWhereInput;
    some?: Prisma.OrganizationRegulationWhereInput;
    none?: Prisma.OrganizationRegulationWhereInput;
};
export type OrganizationRegulationOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type OrganizationRegulationOrganizationIdRegulationIdCompoundUniqueInput = {
    organizationId: string;
    regulationId: string;
};
export type OrganizationRegulationCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    regulationId?: Prisma.SortOrder;
};
export type OrganizationRegulationMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    regulationId?: Prisma.SortOrder;
};
export type OrganizationRegulationMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    regulationId?: Prisma.SortOrder;
};
export type OrganizationRegulationCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutTenantInput, Prisma.OrganizationRegulationUncheckedCreateWithoutTenantInput> | Prisma.OrganizationRegulationCreateWithoutTenantInput[] | Prisma.OrganizationRegulationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.OrganizationRegulationCreateOrConnectWithoutTenantInput | Prisma.OrganizationRegulationCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.OrganizationRegulationCreateManyTenantInputEnvelope;
    connect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
};
export type OrganizationRegulationUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutTenantInput, Prisma.OrganizationRegulationUncheckedCreateWithoutTenantInput> | Prisma.OrganizationRegulationCreateWithoutTenantInput[] | Prisma.OrganizationRegulationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.OrganizationRegulationCreateOrConnectWithoutTenantInput | Prisma.OrganizationRegulationCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.OrganizationRegulationCreateManyTenantInputEnvelope;
    connect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
};
export type OrganizationRegulationUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutTenantInput, Prisma.OrganizationRegulationUncheckedCreateWithoutTenantInput> | Prisma.OrganizationRegulationCreateWithoutTenantInput[] | Prisma.OrganizationRegulationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.OrganizationRegulationCreateOrConnectWithoutTenantInput | Prisma.OrganizationRegulationCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.OrganizationRegulationUpsertWithWhereUniqueWithoutTenantInput | Prisma.OrganizationRegulationUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.OrganizationRegulationCreateManyTenantInputEnvelope;
    set?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    disconnect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    delete?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    connect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    update?: Prisma.OrganizationRegulationUpdateWithWhereUniqueWithoutTenantInput | Prisma.OrganizationRegulationUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.OrganizationRegulationUpdateManyWithWhereWithoutTenantInput | Prisma.OrganizationRegulationUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.OrganizationRegulationScalarWhereInput | Prisma.OrganizationRegulationScalarWhereInput[];
};
export type OrganizationRegulationUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutTenantInput, Prisma.OrganizationRegulationUncheckedCreateWithoutTenantInput> | Prisma.OrganizationRegulationCreateWithoutTenantInput[] | Prisma.OrganizationRegulationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.OrganizationRegulationCreateOrConnectWithoutTenantInput | Prisma.OrganizationRegulationCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.OrganizationRegulationUpsertWithWhereUniqueWithoutTenantInput | Prisma.OrganizationRegulationUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.OrganizationRegulationCreateManyTenantInputEnvelope;
    set?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    disconnect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    delete?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    connect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    update?: Prisma.OrganizationRegulationUpdateWithWhereUniqueWithoutTenantInput | Prisma.OrganizationRegulationUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.OrganizationRegulationUpdateManyWithWhereWithoutTenantInput | Prisma.OrganizationRegulationUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.OrganizationRegulationScalarWhereInput | Prisma.OrganizationRegulationScalarWhereInput[];
};
export type OrganizationRegulationCreateNestedManyWithoutOrganizationInput = {
    create?: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutOrganizationInput, Prisma.OrganizationRegulationUncheckedCreateWithoutOrganizationInput> | Prisma.OrganizationRegulationCreateWithoutOrganizationInput[] | Prisma.OrganizationRegulationUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.OrganizationRegulationCreateOrConnectWithoutOrganizationInput | Prisma.OrganizationRegulationCreateOrConnectWithoutOrganizationInput[];
    createMany?: Prisma.OrganizationRegulationCreateManyOrganizationInputEnvelope;
    connect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
};
export type OrganizationRegulationUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutOrganizationInput, Prisma.OrganizationRegulationUncheckedCreateWithoutOrganizationInput> | Prisma.OrganizationRegulationCreateWithoutOrganizationInput[] | Prisma.OrganizationRegulationUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.OrganizationRegulationCreateOrConnectWithoutOrganizationInput | Prisma.OrganizationRegulationCreateOrConnectWithoutOrganizationInput[];
    createMany?: Prisma.OrganizationRegulationCreateManyOrganizationInputEnvelope;
    connect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
};
export type OrganizationRegulationUpdateManyWithoutOrganizationNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutOrganizationInput, Prisma.OrganizationRegulationUncheckedCreateWithoutOrganizationInput> | Prisma.OrganizationRegulationCreateWithoutOrganizationInput[] | Prisma.OrganizationRegulationUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.OrganizationRegulationCreateOrConnectWithoutOrganizationInput | Prisma.OrganizationRegulationCreateOrConnectWithoutOrganizationInput[];
    upsert?: Prisma.OrganizationRegulationUpsertWithWhereUniqueWithoutOrganizationInput | Prisma.OrganizationRegulationUpsertWithWhereUniqueWithoutOrganizationInput[];
    createMany?: Prisma.OrganizationRegulationCreateManyOrganizationInputEnvelope;
    set?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    disconnect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    delete?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    connect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    update?: Prisma.OrganizationRegulationUpdateWithWhereUniqueWithoutOrganizationInput | Prisma.OrganizationRegulationUpdateWithWhereUniqueWithoutOrganizationInput[];
    updateMany?: Prisma.OrganizationRegulationUpdateManyWithWhereWithoutOrganizationInput | Prisma.OrganizationRegulationUpdateManyWithWhereWithoutOrganizationInput[];
    deleteMany?: Prisma.OrganizationRegulationScalarWhereInput | Prisma.OrganizationRegulationScalarWhereInput[];
};
export type OrganizationRegulationUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutOrganizationInput, Prisma.OrganizationRegulationUncheckedCreateWithoutOrganizationInput> | Prisma.OrganizationRegulationCreateWithoutOrganizationInput[] | Prisma.OrganizationRegulationUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.OrganizationRegulationCreateOrConnectWithoutOrganizationInput | Prisma.OrganizationRegulationCreateOrConnectWithoutOrganizationInput[];
    upsert?: Prisma.OrganizationRegulationUpsertWithWhereUniqueWithoutOrganizationInput | Prisma.OrganizationRegulationUpsertWithWhereUniqueWithoutOrganizationInput[];
    createMany?: Prisma.OrganizationRegulationCreateManyOrganizationInputEnvelope;
    set?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    disconnect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    delete?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    connect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    update?: Prisma.OrganizationRegulationUpdateWithWhereUniqueWithoutOrganizationInput | Prisma.OrganizationRegulationUpdateWithWhereUniqueWithoutOrganizationInput[];
    updateMany?: Prisma.OrganizationRegulationUpdateManyWithWhereWithoutOrganizationInput | Prisma.OrganizationRegulationUpdateManyWithWhereWithoutOrganizationInput[];
    deleteMany?: Prisma.OrganizationRegulationScalarWhereInput | Prisma.OrganizationRegulationScalarWhereInput[];
};
export type OrganizationRegulationCreateNestedManyWithoutRegulationInput = {
    create?: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutRegulationInput, Prisma.OrganizationRegulationUncheckedCreateWithoutRegulationInput> | Prisma.OrganizationRegulationCreateWithoutRegulationInput[] | Prisma.OrganizationRegulationUncheckedCreateWithoutRegulationInput[];
    connectOrCreate?: Prisma.OrganizationRegulationCreateOrConnectWithoutRegulationInput | Prisma.OrganizationRegulationCreateOrConnectWithoutRegulationInput[];
    createMany?: Prisma.OrganizationRegulationCreateManyRegulationInputEnvelope;
    connect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
};
export type OrganizationRegulationUncheckedCreateNestedManyWithoutRegulationInput = {
    create?: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutRegulationInput, Prisma.OrganizationRegulationUncheckedCreateWithoutRegulationInput> | Prisma.OrganizationRegulationCreateWithoutRegulationInput[] | Prisma.OrganizationRegulationUncheckedCreateWithoutRegulationInput[];
    connectOrCreate?: Prisma.OrganizationRegulationCreateOrConnectWithoutRegulationInput | Prisma.OrganizationRegulationCreateOrConnectWithoutRegulationInput[];
    createMany?: Prisma.OrganizationRegulationCreateManyRegulationInputEnvelope;
    connect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
};
export type OrganizationRegulationUpdateManyWithoutRegulationNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutRegulationInput, Prisma.OrganizationRegulationUncheckedCreateWithoutRegulationInput> | Prisma.OrganizationRegulationCreateWithoutRegulationInput[] | Prisma.OrganizationRegulationUncheckedCreateWithoutRegulationInput[];
    connectOrCreate?: Prisma.OrganizationRegulationCreateOrConnectWithoutRegulationInput | Prisma.OrganizationRegulationCreateOrConnectWithoutRegulationInput[];
    upsert?: Prisma.OrganizationRegulationUpsertWithWhereUniqueWithoutRegulationInput | Prisma.OrganizationRegulationUpsertWithWhereUniqueWithoutRegulationInput[];
    createMany?: Prisma.OrganizationRegulationCreateManyRegulationInputEnvelope;
    set?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    disconnect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    delete?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    connect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    update?: Prisma.OrganizationRegulationUpdateWithWhereUniqueWithoutRegulationInput | Prisma.OrganizationRegulationUpdateWithWhereUniqueWithoutRegulationInput[];
    updateMany?: Prisma.OrganizationRegulationUpdateManyWithWhereWithoutRegulationInput | Prisma.OrganizationRegulationUpdateManyWithWhereWithoutRegulationInput[];
    deleteMany?: Prisma.OrganizationRegulationScalarWhereInput | Prisma.OrganizationRegulationScalarWhereInput[];
};
export type OrganizationRegulationUncheckedUpdateManyWithoutRegulationNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutRegulationInput, Prisma.OrganizationRegulationUncheckedCreateWithoutRegulationInput> | Prisma.OrganizationRegulationCreateWithoutRegulationInput[] | Prisma.OrganizationRegulationUncheckedCreateWithoutRegulationInput[];
    connectOrCreate?: Prisma.OrganizationRegulationCreateOrConnectWithoutRegulationInput | Prisma.OrganizationRegulationCreateOrConnectWithoutRegulationInput[];
    upsert?: Prisma.OrganizationRegulationUpsertWithWhereUniqueWithoutRegulationInput | Prisma.OrganizationRegulationUpsertWithWhereUniqueWithoutRegulationInput[];
    createMany?: Prisma.OrganizationRegulationCreateManyRegulationInputEnvelope;
    set?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    disconnect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    delete?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    connect?: Prisma.OrganizationRegulationWhereUniqueInput | Prisma.OrganizationRegulationWhereUniqueInput[];
    update?: Prisma.OrganizationRegulationUpdateWithWhereUniqueWithoutRegulationInput | Prisma.OrganizationRegulationUpdateWithWhereUniqueWithoutRegulationInput[];
    updateMany?: Prisma.OrganizationRegulationUpdateManyWithWhereWithoutRegulationInput | Prisma.OrganizationRegulationUpdateManyWithWhereWithoutRegulationInput[];
    deleteMany?: Prisma.OrganizationRegulationScalarWhereInput | Prisma.OrganizationRegulationScalarWhereInput[];
};
export type OrganizationRegulationCreateWithoutTenantInput = {
    id?: string;
    organization: Prisma.OrganizationCreateNestedOneWithoutRegulationsInput;
    regulation: Prisma.RegulationCreateNestedOneWithoutOrganizationRegulationsInput;
};
export type OrganizationRegulationUncheckedCreateWithoutTenantInput = {
    id?: string;
    organizationId: string;
    regulationId: string;
};
export type OrganizationRegulationCreateOrConnectWithoutTenantInput = {
    where: Prisma.OrganizationRegulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutTenantInput, Prisma.OrganizationRegulationUncheckedCreateWithoutTenantInput>;
};
export type OrganizationRegulationCreateManyTenantInputEnvelope = {
    data: Prisma.OrganizationRegulationCreateManyTenantInput | Prisma.OrganizationRegulationCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type OrganizationRegulationUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.OrganizationRegulationWhereUniqueInput;
    update: Prisma.XOR<Prisma.OrganizationRegulationUpdateWithoutTenantInput, Prisma.OrganizationRegulationUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutTenantInput, Prisma.OrganizationRegulationUncheckedCreateWithoutTenantInput>;
};
export type OrganizationRegulationUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.OrganizationRegulationWhereUniqueInput;
    data: Prisma.XOR<Prisma.OrganizationRegulationUpdateWithoutTenantInput, Prisma.OrganizationRegulationUncheckedUpdateWithoutTenantInput>;
};
export type OrganizationRegulationUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.OrganizationRegulationScalarWhereInput;
    data: Prisma.XOR<Prisma.OrganizationRegulationUpdateManyMutationInput, Prisma.OrganizationRegulationUncheckedUpdateManyWithoutTenantInput>;
};
export type OrganizationRegulationScalarWhereInput = {
    AND?: Prisma.OrganizationRegulationScalarWhereInput | Prisma.OrganizationRegulationScalarWhereInput[];
    OR?: Prisma.OrganizationRegulationScalarWhereInput[];
    NOT?: Prisma.OrganizationRegulationScalarWhereInput | Prisma.OrganizationRegulationScalarWhereInput[];
    id?: Prisma.UuidFilter<"OrganizationRegulation"> | string;
    tenantId?: Prisma.UuidFilter<"OrganizationRegulation"> | string;
    organizationId?: Prisma.UuidFilter<"OrganizationRegulation"> | string;
    regulationId?: Prisma.UuidFilter<"OrganizationRegulation"> | string;
};
export type OrganizationRegulationCreateWithoutOrganizationInput = {
    id?: string;
    regulation: Prisma.RegulationCreateNestedOneWithoutOrganizationRegulationsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutOrganizationRegulationsInput;
};
export type OrganizationRegulationUncheckedCreateWithoutOrganizationInput = {
    id?: string;
    tenantId: string;
    regulationId: string;
};
export type OrganizationRegulationCreateOrConnectWithoutOrganizationInput = {
    where: Prisma.OrganizationRegulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutOrganizationInput, Prisma.OrganizationRegulationUncheckedCreateWithoutOrganizationInput>;
};
export type OrganizationRegulationCreateManyOrganizationInputEnvelope = {
    data: Prisma.OrganizationRegulationCreateManyOrganizationInput | Prisma.OrganizationRegulationCreateManyOrganizationInput[];
    skipDuplicates?: boolean;
};
export type OrganizationRegulationUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: Prisma.OrganizationRegulationWhereUniqueInput;
    update: Prisma.XOR<Prisma.OrganizationRegulationUpdateWithoutOrganizationInput, Prisma.OrganizationRegulationUncheckedUpdateWithoutOrganizationInput>;
    create: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutOrganizationInput, Prisma.OrganizationRegulationUncheckedCreateWithoutOrganizationInput>;
};
export type OrganizationRegulationUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: Prisma.OrganizationRegulationWhereUniqueInput;
    data: Prisma.XOR<Prisma.OrganizationRegulationUpdateWithoutOrganizationInput, Prisma.OrganizationRegulationUncheckedUpdateWithoutOrganizationInput>;
};
export type OrganizationRegulationUpdateManyWithWhereWithoutOrganizationInput = {
    where: Prisma.OrganizationRegulationScalarWhereInput;
    data: Prisma.XOR<Prisma.OrganizationRegulationUpdateManyMutationInput, Prisma.OrganizationRegulationUncheckedUpdateManyWithoutOrganizationInput>;
};
export type OrganizationRegulationCreateWithoutRegulationInput = {
    id?: string;
    organization: Prisma.OrganizationCreateNestedOneWithoutRegulationsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutOrganizationRegulationsInput;
};
export type OrganizationRegulationUncheckedCreateWithoutRegulationInput = {
    id?: string;
    tenantId: string;
    organizationId: string;
};
export type OrganizationRegulationCreateOrConnectWithoutRegulationInput = {
    where: Prisma.OrganizationRegulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutRegulationInput, Prisma.OrganizationRegulationUncheckedCreateWithoutRegulationInput>;
};
export type OrganizationRegulationCreateManyRegulationInputEnvelope = {
    data: Prisma.OrganizationRegulationCreateManyRegulationInput | Prisma.OrganizationRegulationCreateManyRegulationInput[];
    skipDuplicates?: boolean;
};
export type OrganizationRegulationUpsertWithWhereUniqueWithoutRegulationInput = {
    where: Prisma.OrganizationRegulationWhereUniqueInput;
    update: Prisma.XOR<Prisma.OrganizationRegulationUpdateWithoutRegulationInput, Prisma.OrganizationRegulationUncheckedUpdateWithoutRegulationInput>;
    create: Prisma.XOR<Prisma.OrganizationRegulationCreateWithoutRegulationInput, Prisma.OrganizationRegulationUncheckedCreateWithoutRegulationInput>;
};
export type OrganizationRegulationUpdateWithWhereUniqueWithoutRegulationInput = {
    where: Prisma.OrganizationRegulationWhereUniqueInput;
    data: Prisma.XOR<Prisma.OrganizationRegulationUpdateWithoutRegulationInput, Prisma.OrganizationRegulationUncheckedUpdateWithoutRegulationInput>;
};
export type OrganizationRegulationUpdateManyWithWhereWithoutRegulationInput = {
    where: Prisma.OrganizationRegulationScalarWhereInput;
    data: Prisma.XOR<Prisma.OrganizationRegulationUpdateManyMutationInput, Prisma.OrganizationRegulationUncheckedUpdateManyWithoutRegulationInput>;
};
export type OrganizationRegulationCreateManyTenantInput = {
    id?: string;
    organizationId: string;
    regulationId: string;
};
export type OrganizationRegulationUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organization?: Prisma.OrganizationUpdateOneRequiredWithoutRegulationsNestedInput;
    regulation?: Prisma.RegulationUpdateOneRequiredWithoutOrganizationRegulationsNestedInput;
};
export type OrganizationRegulationUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    regulationId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type OrganizationRegulationUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    regulationId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type OrganizationRegulationCreateManyOrganizationInput = {
    id?: string;
    tenantId: string;
    regulationId: string;
};
export type OrganizationRegulationUpdateWithoutOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    regulation?: Prisma.RegulationUpdateOneRequiredWithoutOrganizationRegulationsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutOrganizationRegulationsNestedInput;
};
export type OrganizationRegulationUncheckedUpdateWithoutOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    regulationId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type OrganizationRegulationUncheckedUpdateManyWithoutOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    regulationId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type OrganizationRegulationCreateManyRegulationInput = {
    id?: string;
    tenantId: string;
    organizationId: string;
};
export type OrganizationRegulationUpdateWithoutRegulationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organization?: Prisma.OrganizationUpdateOneRequiredWithoutRegulationsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutOrganizationRegulationsNestedInput;
};
export type OrganizationRegulationUncheckedUpdateWithoutRegulationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type OrganizationRegulationUncheckedUpdateManyWithoutRegulationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type OrganizationRegulationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    organizationId?: boolean;
    regulationId?: boolean;
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    regulation?: boolean | Prisma.RegulationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["organizationRegulation"]>;
export type OrganizationRegulationSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    organizationId?: boolean;
    regulationId?: boolean;
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    regulation?: boolean | Prisma.RegulationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["organizationRegulation"]>;
export type OrganizationRegulationSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    organizationId?: boolean;
    regulationId?: boolean;
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    regulation?: boolean | Prisma.RegulationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["organizationRegulation"]>;
export type OrganizationRegulationSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    organizationId?: boolean;
    regulationId?: boolean;
};
export type OrganizationRegulationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "organizationId" | "regulationId", ExtArgs["result"]["organizationRegulation"]>;
export type OrganizationRegulationInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    regulation?: boolean | Prisma.RegulationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type OrganizationRegulationIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    regulation?: boolean | Prisma.RegulationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type OrganizationRegulationIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    regulation?: boolean | Prisma.RegulationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $OrganizationRegulationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "OrganizationRegulation";
    objects: {
        organization: Prisma.$OrganizationPayload<ExtArgs>;
        regulation: Prisma.$RegulationPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        organizationId: string;
        regulationId: string;
    }, ExtArgs["result"]["organizationRegulation"]>;
    composites: {};
};
export type OrganizationRegulationGetPayload<S extends boolean | null | undefined | OrganizationRegulationDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$OrganizationRegulationPayload, S>;
export type OrganizationRegulationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<OrganizationRegulationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: OrganizationRegulationCountAggregateInputType | true;
};
export interface OrganizationRegulationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['OrganizationRegulation'];
        meta: {
            name: 'OrganizationRegulation';
        };
    };
    findUnique<T extends OrganizationRegulationFindUniqueArgs>(args: Prisma.SelectSubset<T, OrganizationRegulationFindUniqueArgs<ExtArgs>>): Prisma.Prisma__OrganizationRegulationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationRegulationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends OrganizationRegulationFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, OrganizationRegulationFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__OrganizationRegulationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationRegulationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends OrganizationRegulationFindFirstArgs>(args?: Prisma.SelectSubset<T, OrganizationRegulationFindFirstArgs<ExtArgs>>): Prisma.Prisma__OrganizationRegulationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationRegulationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends OrganizationRegulationFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, OrganizationRegulationFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__OrganizationRegulationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationRegulationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends OrganizationRegulationFindManyArgs>(args?: Prisma.SelectSubset<T, OrganizationRegulationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrganizationRegulationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends OrganizationRegulationCreateArgs>(args: Prisma.SelectSubset<T, OrganizationRegulationCreateArgs<ExtArgs>>): Prisma.Prisma__OrganizationRegulationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationRegulationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends OrganizationRegulationCreateManyArgs>(args?: Prisma.SelectSubset<T, OrganizationRegulationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends OrganizationRegulationCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, OrganizationRegulationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrganizationRegulationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends OrganizationRegulationDeleteArgs>(args: Prisma.SelectSubset<T, OrganizationRegulationDeleteArgs<ExtArgs>>): Prisma.Prisma__OrganizationRegulationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationRegulationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends OrganizationRegulationUpdateArgs>(args: Prisma.SelectSubset<T, OrganizationRegulationUpdateArgs<ExtArgs>>): Prisma.Prisma__OrganizationRegulationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationRegulationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends OrganizationRegulationDeleteManyArgs>(args?: Prisma.SelectSubset<T, OrganizationRegulationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends OrganizationRegulationUpdateManyArgs>(args: Prisma.SelectSubset<T, OrganizationRegulationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends OrganizationRegulationUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, OrganizationRegulationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrganizationRegulationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends OrganizationRegulationUpsertArgs>(args: Prisma.SelectSubset<T, OrganizationRegulationUpsertArgs<ExtArgs>>): Prisma.Prisma__OrganizationRegulationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationRegulationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends OrganizationRegulationCountArgs>(args?: Prisma.Subset<T, OrganizationRegulationCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], OrganizationRegulationCountAggregateOutputType> : number>;
    aggregate<T extends OrganizationRegulationAggregateArgs>(args: Prisma.Subset<T, OrganizationRegulationAggregateArgs>): Prisma.PrismaPromise<GetOrganizationRegulationAggregateType<T>>;
    groupBy<T extends OrganizationRegulationGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: OrganizationRegulationGroupByArgs['orderBy'];
    } : {
        orderBy?: OrganizationRegulationGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, OrganizationRegulationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationRegulationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: OrganizationRegulationFieldRefs;
}
export interface Prisma__OrganizationRegulationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    organization<T extends Prisma.OrganizationDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OrganizationDefaultArgs<ExtArgs>>): Prisma.Prisma__OrganizationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    regulation<T extends Prisma.RegulationDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RegulationDefaultArgs<ExtArgs>>): Prisma.Prisma__RegulationClient<runtime.Types.Result.GetResult<Prisma.$RegulationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface OrganizationRegulationFieldRefs {
    readonly id: Prisma.FieldRef<"OrganizationRegulation", 'String'>;
    readonly tenantId: Prisma.FieldRef<"OrganizationRegulation", 'String'>;
    readonly organizationId: Prisma.FieldRef<"OrganizationRegulation", 'String'>;
    readonly regulationId: Prisma.FieldRef<"OrganizationRegulation", 'String'>;
}
export type OrganizationRegulationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationRegulationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationRegulationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationRegulationInclude<ExtArgs> | null;
    where: Prisma.OrganizationRegulationWhereUniqueInput;
};
export type OrganizationRegulationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationRegulationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationRegulationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationRegulationInclude<ExtArgs> | null;
    where: Prisma.OrganizationRegulationWhereUniqueInput;
};
export type OrganizationRegulationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationRegulationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationRegulationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationRegulationInclude<ExtArgs> | null;
    where?: Prisma.OrganizationRegulationWhereInput;
    orderBy?: Prisma.OrganizationRegulationOrderByWithRelationInput | Prisma.OrganizationRegulationOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationRegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrganizationRegulationScalarFieldEnum | Prisma.OrganizationRegulationScalarFieldEnum[];
};
export type OrganizationRegulationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationRegulationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationRegulationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationRegulationInclude<ExtArgs> | null;
    where?: Prisma.OrganizationRegulationWhereInput;
    orderBy?: Prisma.OrganizationRegulationOrderByWithRelationInput | Prisma.OrganizationRegulationOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationRegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrganizationRegulationScalarFieldEnum | Prisma.OrganizationRegulationScalarFieldEnum[];
};
export type OrganizationRegulationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationRegulationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationRegulationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationRegulationInclude<ExtArgs> | null;
    where?: Prisma.OrganizationRegulationWhereInput;
    orderBy?: Prisma.OrganizationRegulationOrderByWithRelationInput | Prisma.OrganizationRegulationOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationRegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrganizationRegulationScalarFieldEnum | Prisma.OrganizationRegulationScalarFieldEnum[];
};
export type OrganizationRegulationCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationRegulationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationRegulationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationRegulationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OrganizationRegulationCreateInput, Prisma.OrganizationRegulationUncheckedCreateInput>;
};
export type OrganizationRegulationCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.OrganizationRegulationCreateManyInput | Prisma.OrganizationRegulationCreateManyInput[];
    skipDuplicates?: boolean;
};
export type OrganizationRegulationCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationRegulationSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.OrganizationRegulationOmit<ExtArgs> | null;
    data: Prisma.OrganizationRegulationCreateManyInput | Prisma.OrganizationRegulationCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.OrganizationRegulationIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type OrganizationRegulationUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationRegulationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationRegulationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationRegulationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OrganizationRegulationUpdateInput, Prisma.OrganizationRegulationUncheckedUpdateInput>;
    where: Prisma.OrganizationRegulationWhereUniqueInput;
};
export type OrganizationRegulationUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.OrganizationRegulationUpdateManyMutationInput, Prisma.OrganizationRegulationUncheckedUpdateManyInput>;
    where?: Prisma.OrganizationRegulationWhereInput;
    limit?: number;
};
export type OrganizationRegulationUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationRegulationSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.OrganizationRegulationOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OrganizationRegulationUpdateManyMutationInput, Prisma.OrganizationRegulationUncheckedUpdateManyInput>;
    where?: Prisma.OrganizationRegulationWhereInput;
    limit?: number;
    include?: Prisma.OrganizationRegulationIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type OrganizationRegulationUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationRegulationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationRegulationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationRegulationInclude<ExtArgs> | null;
    where: Prisma.OrganizationRegulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationRegulationCreateInput, Prisma.OrganizationRegulationUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.OrganizationRegulationUpdateInput, Prisma.OrganizationRegulationUncheckedUpdateInput>;
};
export type OrganizationRegulationDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationRegulationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationRegulationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationRegulationInclude<ExtArgs> | null;
    where: Prisma.OrganizationRegulationWhereUniqueInput;
};
export type OrganizationRegulationDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrganizationRegulationWhereInput;
    limit?: number;
};
export type OrganizationRegulationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationRegulationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationRegulationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationRegulationInclude<ExtArgs> | null;
};
export {};
