import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type OrganizationResponsibleModel = runtime.Types.Result.DefaultSelection<Prisma.$OrganizationResponsiblePayload>;
export type AggregateOrganizationResponsible = {
    _count: OrganizationResponsibleCountAggregateOutputType | null;
    _min: OrganizationResponsibleMinAggregateOutputType | null;
    _max: OrganizationResponsibleMaxAggregateOutputType | null;
};
export type OrganizationResponsibleMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    organizationId: string | null;
    type: $Enums.OrganizationResponsibleType | null;
    personName: string | null;
};
export type OrganizationResponsibleMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    organizationId: string | null;
    type: $Enums.OrganizationResponsibleType | null;
    personName: string | null;
};
export type OrganizationResponsibleCountAggregateOutputType = {
    id: number;
    tenantId: number;
    organizationId: number;
    type: number;
    personName: number;
    _all: number;
};
export type OrganizationResponsibleMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    organizationId?: true;
    type?: true;
    personName?: true;
};
export type OrganizationResponsibleMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    organizationId?: true;
    type?: true;
    personName?: true;
};
export type OrganizationResponsibleCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    organizationId?: true;
    type?: true;
    personName?: true;
    _all?: true;
};
export type OrganizationResponsibleAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrganizationResponsibleWhereInput;
    orderBy?: Prisma.OrganizationResponsibleOrderByWithRelationInput | Prisma.OrganizationResponsibleOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationResponsibleWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | OrganizationResponsibleCountAggregateInputType;
    _min?: OrganizationResponsibleMinAggregateInputType;
    _max?: OrganizationResponsibleMaxAggregateInputType;
};
export type GetOrganizationResponsibleAggregateType<T extends OrganizationResponsibleAggregateArgs> = {
    [P in keyof T & keyof AggregateOrganizationResponsible]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateOrganizationResponsible[P]> : Prisma.GetScalarType<T[P], AggregateOrganizationResponsible[P]>;
};
export type OrganizationResponsibleGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrganizationResponsibleWhereInput;
    orderBy?: Prisma.OrganizationResponsibleOrderByWithAggregationInput | Prisma.OrganizationResponsibleOrderByWithAggregationInput[];
    by: Prisma.OrganizationResponsibleScalarFieldEnum[] | Prisma.OrganizationResponsibleScalarFieldEnum;
    having?: Prisma.OrganizationResponsibleScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: OrganizationResponsibleCountAggregateInputType | true;
    _min?: OrganizationResponsibleMinAggregateInputType;
    _max?: OrganizationResponsibleMaxAggregateInputType;
};
export type OrganizationResponsibleGroupByOutputType = {
    id: string;
    tenantId: string;
    organizationId: string;
    type: $Enums.OrganizationResponsibleType;
    personName: string;
    _count: OrganizationResponsibleCountAggregateOutputType | null;
    _min: OrganizationResponsibleMinAggregateOutputType | null;
    _max: OrganizationResponsibleMaxAggregateOutputType | null;
};
type GetOrganizationResponsibleGroupByPayload<T extends OrganizationResponsibleGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<OrganizationResponsibleGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof OrganizationResponsibleGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], OrganizationResponsibleGroupByOutputType[P]> : Prisma.GetScalarType<T[P], OrganizationResponsibleGroupByOutputType[P]>;
}>>;
export type OrganizationResponsibleWhereInput = {
    AND?: Prisma.OrganizationResponsibleWhereInput | Prisma.OrganizationResponsibleWhereInput[];
    OR?: Prisma.OrganizationResponsibleWhereInput[];
    NOT?: Prisma.OrganizationResponsibleWhereInput | Prisma.OrganizationResponsibleWhereInput[];
    id?: Prisma.UuidFilter<"OrganizationResponsible"> | string;
    tenantId?: Prisma.UuidFilter<"OrganizationResponsible"> | string;
    organizationId?: Prisma.UuidFilter<"OrganizationResponsible"> | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFilter<"OrganizationResponsible"> | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFilter<"OrganizationResponsible"> | string;
    organization?: Prisma.XOR<Prisma.OrganizationScalarRelationFilter, Prisma.OrganizationWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    assets?: Prisma.AssetListRelationFilter;
    evidenceRequirements?: Prisma.EvidenceRequirementListRelationFilter;
};
export type OrganizationResponsibleOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    personName?: Prisma.SortOrder;
    organization?: Prisma.OrganizationOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
    assets?: Prisma.AssetOrderByRelationAggregateInput;
    evidenceRequirements?: Prisma.EvidenceRequirementOrderByRelationAggregateInput;
};
export type OrganizationResponsibleWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.OrganizationResponsibleWhereInput | Prisma.OrganizationResponsibleWhereInput[];
    OR?: Prisma.OrganizationResponsibleWhereInput[];
    NOT?: Prisma.OrganizationResponsibleWhereInput | Prisma.OrganizationResponsibleWhereInput[];
    tenantId?: Prisma.UuidFilter<"OrganizationResponsible"> | string;
    organizationId?: Prisma.UuidFilter<"OrganizationResponsible"> | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFilter<"OrganizationResponsible"> | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFilter<"OrganizationResponsible"> | string;
    organization?: Prisma.XOR<Prisma.OrganizationScalarRelationFilter, Prisma.OrganizationWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    assets?: Prisma.AssetListRelationFilter;
    evidenceRequirements?: Prisma.EvidenceRequirementListRelationFilter;
}, "id">;
export type OrganizationResponsibleOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    personName?: Prisma.SortOrder;
    _count?: Prisma.OrganizationResponsibleCountOrderByAggregateInput;
    _max?: Prisma.OrganizationResponsibleMaxOrderByAggregateInput;
    _min?: Prisma.OrganizationResponsibleMinOrderByAggregateInput;
};
export type OrganizationResponsibleScalarWhereWithAggregatesInput = {
    AND?: Prisma.OrganizationResponsibleScalarWhereWithAggregatesInput | Prisma.OrganizationResponsibleScalarWhereWithAggregatesInput[];
    OR?: Prisma.OrganizationResponsibleScalarWhereWithAggregatesInput[];
    NOT?: Prisma.OrganizationResponsibleScalarWhereWithAggregatesInput | Prisma.OrganizationResponsibleScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"OrganizationResponsible"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"OrganizationResponsible"> | string;
    organizationId?: Prisma.UuidWithAggregatesFilter<"OrganizationResponsible"> | string;
    type?: Prisma.EnumOrganizationResponsibleTypeWithAggregatesFilter<"OrganizationResponsible"> | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringWithAggregatesFilter<"OrganizationResponsible"> | string;
};
export type OrganizationResponsibleCreateInput = {
    id?: string;
    type: $Enums.OrganizationResponsibleType;
    personName: string;
    organization: Prisma.OrganizationCreateNestedOneWithoutResponsiblesInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutOrganizationResponsiblesInput;
    assets?: Prisma.AssetCreateNestedManyWithoutResponsibleInput;
    evidenceRequirements?: Prisma.EvidenceRequirementCreateNestedManyWithoutResponsibleInput;
};
export type OrganizationResponsibleUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    organizationId: string;
    type: $Enums.OrganizationResponsibleType;
    personName: string;
    assets?: Prisma.AssetUncheckedCreateNestedManyWithoutResponsibleInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedCreateNestedManyWithoutResponsibleInput;
};
export type OrganizationResponsibleUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFieldUpdateOperationsInput | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFieldUpdateOperationsInput | string;
    organization?: Prisma.OrganizationUpdateOneRequiredWithoutResponsiblesNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutOrganizationResponsiblesNestedInput;
    assets?: Prisma.AssetUpdateManyWithoutResponsibleNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUpdateManyWithoutResponsibleNestedInput;
};
export type OrganizationResponsibleUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFieldUpdateOperationsInput | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFieldUpdateOperationsInput | string;
    assets?: Prisma.AssetUncheckedUpdateManyWithoutResponsibleNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedUpdateManyWithoutResponsibleNestedInput;
};
export type OrganizationResponsibleCreateManyInput = {
    id?: string;
    tenantId: string;
    organizationId: string;
    type: $Enums.OrganizationResponsibleType;
    personName: string;
};
export type OrganizationResponsibleUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFieldUpdateOperationsInput | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type OrganizationResponsibleUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFieldUpdateOperationsInput | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type OrganizationResponsibleListRelationFilter = {
    every?: Prisma.OrganizationResponsibleWhereInput;
    some?: Prisma.OrganizationResponsibleWhereInput;
    none?: Prisma.OrganizationResponsibleWhereInput;
};
export type OrganizationResponsibleOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type OrganizationResponsibleNullableScalarRelationFilter = {
    is?: Prisma.OrganizationResponsibleWhereInput | null;
    isNot?: Prisma.OrganizationResponsibleWhereInput | null;
};
export type OrganizationResponsibleCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    personName?: Prisma.SortOrder;
};
export type OrganizationResponsibleMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    personName?: Prisma.SortOrder;
};
export type OrganizationResponsibleMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    organizationId?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    personName?: Prisma.SortOrder;
};
export type OrganizationResponsibleCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutTenantInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutTenantInput> | Prisma.OrganizationResponsibleCreateWithoutTenantInput[] | Prisma.OrganizationResponsibleUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.OrganizationResponsibleCreateOrConnectWithoutTenantInput | Prisma.OrganizationResponsibleCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.OrganizationResponsibleCreateManyTenantInputEnvelope;
    connect?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
};
export type OrganizationResponsibleUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutTenantInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutTenantInput> | Prisma.OrganizationResponsibleCreateWithoutTenantInput[] | Prisma.OrganizationResponsibleUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.OrganizationResponsibleCreateOrConnectWithoutTenantInput | Prisma.OrganizationResponsibleCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.OrganizationResponsibleCreateManyTenantInputEnvelope;
    connect?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
};
export type OrganizationResponsibleUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutTenantInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutTenantInput> | Prisma.OrganizationResponsibleCreateWithoutTenantInput[] | Prisma.OrganizationResponsibleUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.OrganizationResponsibleCreateOrConnectWithoutTenantInput | Prisma.OrganizationResponsibleCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.OrganizationResponsibleUpsertWithWhereUniqueWithoutTenantInput | Prisma.OrganizationResponsibleUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.OrganizationResponsibleCreateManyTenantInputEnvelope;
    set?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    disconnect?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    delete?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    connect?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    update?: Prisma.OrganizationResponsibleUpdateWithWhereUniqueWithoutTenantInput | Prisma.OrganizationResponsibleUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.OrganizationResponsibleUpdateManyWithWhereWithoutTenantInput | Prisma.OrganizationResponsibleUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.OrganizationResponsibleScalarWhereInput | Prisma.OrganizationResponsibleScalarWhereInput[];
};
export type OrganizationResponsibleUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutTenantInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutTenantInput> | Prisma.OrganizationResponsibleCreateWithoutTenantInput[] | Prisma.OrganizationResponsibleUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.OrganizationResponsibleCreateOrConnectWithoutTenantInput | Prisma.OrganizationResponsibleCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.OrganizationResponsibleUpsertWithWhereUniqueWithoutTenantInput | Prisma.OrganizationResponsibleUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.OrganizationResponsibleCreateManyTenantInputEnvelope;
    set?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    disconnect?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    delete?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    connect?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    update?: Prisma.OrganizationResponsibleUpdateWithWhereUniqueWithoutTenantInput | Prisma.OrganizationResponsibleUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.OrganizationResponsibleUpdateManyWithWhereWithoutTenantInput | Prisma.OrganizationResponsibleUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.OrganizationResponsibleScalarWhereInput | Prisma.OrganizationResponsibleScalarWhereInput[];
};
export type OrganizationResponsibleCreateNestedOneWithoutEvidenceRequirementsInput = {
    create?: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutEvidenceRequirementsInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutEvidenceRequirementsInput>;
    connectOrCreate?: Prisma.OrganizationResponsibleCreateOrConnectWithoutEvidenceRequirementsInput;
    connect?: Prisma.OrganizationResponsibleWhereUniqueInput;
};
export type OrganizationResponsibleUpdateOneWithoutEvidenceRequirementsNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutEvidenceRequirementsInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutEvidenceRequirementsInput>;
    connectOrCreate?: Prisma.OrganizationResponsibleCreateOrConnectWithoutEvidenceRequirementsInput;
    upsert?: Prisma.OrganizationResponsibleUpsertWithoutEvidenceRequirementsInput;
    disconnect?: Prisma.OrganizationResponsibleWhereInput | boolean;
    delete?: Prisma.OrganizationResponsibleWhereInput | boolean;
    connect?: Prisma.OrganizationResponsibleWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.OrganizationResponsibleUpdateToOneWithWhereWithoutEvidenceRequirementsInput, Prisma.OrganizationResponsibleUpdateWithoutEvidenceRequirementsInput>, Prisma.OrganizationResponsibleUncheckedUpdateWithoutEvidenceRequirementsInput>;
};
export type OrganizationResponsibleCreateNestedManyWithoutOrganizationInput = {
    create?: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutOrganizationInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutOrganizationInput> | Prisma.OrganizationResponsibleCreateWithoutOrganizationInput[] | Prisma.OrganizationResponsibleUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.OrganizationResponsibleCreateOrConnectWithoutOrganizationInput | Prisma.OrganizationResponsibleCreateOrConnectWithoutOrganizationInput[];
    createMany?: Prisma.OrganizationResponsibleCreateManyOrganizationInputEnvelope;
    connect?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
};
export type OrganizationResponsibleUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutOrganizationInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutOrganizationInput> | Prisma.OrganizationResponsibleCreateWithoutOrganizationInput[] | Prisma.OrganizationResponsibleUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.OrganizationResponsibleCreateOrConnectWithoutOrganizationInput | Prisma.OrganizationResponsibleCreateOrConnectWithoutOrganizationInput[];
    createMany?: Prisma.OrganizationResponsibleCreateManyOrganizationInputEnvelope;
    connect?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
};
export type OrganizationResponsibleUpdateManyWithoutOrganizationNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutOrganizationInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutOrganizationInput> | Prisma.OrganizationResponsibleCreateWithoutOrganizationInput[] | Prisma.OrganizationResponsibleUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.OrganizationResponsibleCreateOrConnectWithoutOrganizationInput | Prisma.OrganizationResponsibleCreateOrConnectWithoutOrganizationInput[];
    upsert?: Prisma.OrganizationResponsibleUpsertWithWhereUniqueWithoutOrganizationInput | Prisma.OrganizationResponsibleUpsertWithWhereUniqueWithoutOrganizationInput[];
    createMany?: Prisma.OrganizationResponsibleCreateManyOrganizationInputEnvelope;
    set?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    disconnect?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    delete?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    connect?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    update?: Prisma.OrganizationResponsibleUpdateWithWhereUniqueWithoutOrganizationInput | Prisma.OrganizationResponsibleUpdateWithWhereUniqueWithoutOrganizationInput[];
    updateMany?: Prisma.OrganizationResponsibleUpdateManyWithWhereWithoutOrganizationInput | Prisma.OrganizationResponsibleUpdateManyWithWhereWithoutOrganizationInput[];
    deleteMany?: Prisma.OrganizationResponsibleScalarWhereInput | Prisma.OrganizationResponsibleScalarWhereInput[];
};
export type OrganizationResponsibleUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutOrganizationInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutOrganizationInput> | Prisma.OrganizationResponsibleCreateWithoutOrganizationInput[] | Prisma.OrganizationResponsibleUncheckedCreateWithoutOrganizationInput[];
    connectOrCreate?: Prisma.OrganizationResponsibleCreateOrConnectWithoutOrganizationInput | Prisma.OrganizationResponsibleCreateOrConnectWithoutOrganizationInput[];
    upsert?: Prisma.OrganizationResponsibleUpsertWithWhereUniqueWithoutOrganizationInput | Prisma.OrganizationResponsibleUpsertWithWhereUniqueWithoutOrganizationInput[];
    createMany?: Prisma.OrganizationResponsibleCreateManyOrganizationInputEnvelope;
    set?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    disconnect?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    delete?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    connect?: Prisma.OrganizationResponsibleWhereUniqueInput | Prisma.OrganizationResponsibleWhereUniqueInput[];
    update?: Prisma.OrganizationResponsibleUpdateWithWhereUniqueWithoutOrganizationInput | Prisma.OrganizationResponsibleUpdateWithWhereUniqueWithoutOrganizationInput[];
    updateMany?: Prisma.OrganizationResponsibleUpdateManyWithWhereWithoutOrganizationInput | Prisma.OrganizationResponsibleUpdateManyWithWhereWithoutOrganizationInput[];
    deleteMany?: Prisma.OrganizationResponsibleScalarWhereInput | Prisma.OrganizationResponsibleScalarWhereInput[];
};
export type EnumOrganizationResponsibleTypeFieldUpdateOperationsInput = {
    set?: $Enums.OrganizationResponsibleType;
};
export type OrganizationResponsibleCreateNestedOneWithoutAssetsInput = {
    create?: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutAssetsInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutAssetsInput>;
    connectOrCreate?: Prisma.OrganizationResponsibleCreateOrConnectWithoutAssetsInput;
    connect?: Prisma.OrganizationResponsibleWhereUniqueInput;
};
export type OrganizationResponsibleUpdateOneWithoutAssetsNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutAssetsInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutAssetsInput>;
    connectOrCreate?: Prisma.OrganizationResponsibleCreateOrConnectWithoutAssetsInput;
    upsert?: Prisma.OrganizationResponsibleUpsertWithoutAssetsInput;
    disconnect?: Prisma.OrganizationResponsibleWhereInput | boolean;
    delete?: Prisma.OrganizationResponsibleWhereInput | boolean;
    connect?: Prisma.OrganizationResponsibleWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.OrganizationResponsibleUpdateToOneWithWhereWithoutAssetsInput, Prisma.OrganizationResponsibleUpdateWithoutAssetsInput>, Prisma.OrganizationResponsibleUncheckedUpdateWithoutAssetsInput>;
};
export type OrganizationResponsibleCreateWithoutTenantInput = {
    id?: string;
    type: $Enums.OrganizationResponsibleType;
    personName: string;
    organization: Prisma.OrganizationCreateNestedOneWithoutResponsiblesInput;
    assets?: Prisma.AssetCreateNestedManyWithoutResponsibleInput;
    evidenceRequirements?: Prisma.EvidenceRequirementCreateNestedManyWithoutResponsibleInput;
};
export type OrganizationResponsibleUncheckedCreateWithoutTenantInput = {
    id?: string;
    organizationId: string;
    type: $Enums.OrganizationResponsibleType;
    personName: string;
    assets?: Prisma.AssetUncheckedCreateNestedManyWithoutResponsibleInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedCreateNestedManyWithoutResponsibleInput;
};
export type OrganizationResponsibleCreateOrConnectWithoutTenantInput = {
    where: Prisma.OrganizationResponsibleWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutTenantInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutTenantInput>;
};
export type OrganizationResponsibleCreateManyTenantInputEnvelope = {
    data: Prisma.OrganizationResponsibleCreateManyTenantInput | Prisma.OrganizationResponsibleCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type OrganizationResponsibleUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.OrganizationResponsibleWhereUniqueInput;
    update: Prisma.XOR<Prisma.OrganizationResponsibleUpdateWithoutTenantInput, Prisma.OrganizationResponsibleUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutTenantInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutTenantInput>;
};
export type OrganizationResponsibleUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.OrganizationResponsibleWhereUniqueInput;
    data: Prisma.XOR<Prisma.OrganizationResponsibleUpdateWithoutTenantInput, Prisma.OrganizationResponsibleUncheckedUpdateWithoutTenantInput>;
};
export type OrganizationResponsibleUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.OrganizationResponsibleScalarWhereInput;
    data: Prisma.XOR<Prisma.OrganizationResponsibleUpdateManyMutationInput, Prisma.OrganizationResponsibleUncheckedUpdateManyWithoutTenantInput>;
};
export type OrganizationResponsibleScalarWhereInput = {
    AND?: Prisma.OrganizationResponsibleScalarWhereInput | Prisma.OrganizationResponsibleScalarWhereInput[];
    OR?: Prisma.OrganizationResponsibleScalarWhereInput[];
    NOT?: Prisma.OrganizationResponsibleScalarWhereInput | Prisma.OrganizationResponsibleScalarWhereInput[];
    id?: Prisma.UuidFilter<"OrganizationResponsible"> | string;
    tenantId?: Prisma.UuidFilter<"OrganizationResponsible"> | string;
    organizationId?: Prisma.UuidFilter<"OrganizationResponsible"> | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFilter<"OrganizationResponsible"> | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFilter<"OrganizationResponsible"> | string;
};
export type OrganizationResponsibleCreateWithoutEvidenceRequirementsInput = {
    id?: string;
    type: $Enums.OrganizationResponsibleType;
    personName: string;
    organization: Prisma.OrganizationCreateNestedOneWithoutResponsiblesInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutOrganizationResponsiblesInput;
    assets?: Prisma.AssetCreateNestedManyWithoutResponsibleInput;
};
export type OrganizationResponsibleUncheckedCreateWithoutEvidenceRequirementsInput = {
    id?: string;
    tenantId: string;
    organizationId: string;
    type: $Enums.OrganizationResponsibleType;
    personName: string;
    assets?: Prisma.AssetUncheckedCreateNestedManyWithoutResponsibleInput;
};
export type OrganizationResponsibleCreateOrConnectWithoutEvidenceRequirementsInput = {
    where: Prisma.OrganizationResponsibleWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutEvidenceRequirementsInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutEvidenceRequirementsInput>;
};
export type OrganizationResponsibleUpsertWithoutEvidenceRequirementsInput = {
    update: Prisma.XOR<Prisma.OrganizationResponsibleUpdateWithoutEvidenceRequirementsInput, Prisma.OrganizationResponsibleUncheckedUpdateWithoutEvidenceRequirementsInput>;
    create: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutEvidenceRequirementsInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutEvidenceRequirementsInput>;
    where?: Prisma.OrganizationResponsibleWhereInput;
};
export type OrganizationResponsibleUpdateToOneWithWhereWithoutEvidenceRequirementsInput = {
    where?: Prisma.OrganizationResponsibleWhereInput;
    data: Prisma.XOR<Prisma.OrganizationResponsibleUpdateWithoutEvidenceRequirementsInput, Prisma.OrganizationResponsibleUncheckedUpdateWithoutEvidenceRequirementsInput>;
};
export type OrganizationResponsibleUpdateWithoutEvidenceRequirementsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFieldUpdateOperationsInput | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFieldUpdateOperationsInput | string;
    organization?: Prisma.OrganizationUpdateOneRequiredWithoutResponsiblesNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutOrganizationResponsiblesNestedInput;
    assets?: Prisma.AssetUpdateManyWithoutResponsibleNestedInput;
};
export type OrganizationResponsibleUncheckedUpdateWithoutEvidenceRequirementsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFieldUpdateOperationsInput | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFieldUpdateOperationsInput | string;
    assets?: Prisma.AssetUncheckedUpdateManyWithoutResponsibleNestedInput;
};
export type OrganizationResponsibleCreateWithoutOrganizationInput = {
    id?: string;
    type: $Enums.OrganizationResponsibleType;
    personName: string;
    tenant: Prisma.CompanyCreateNestedOneWithoutOrganizationResponsiblesInput;
    assets?: Prisma.AssetCreateNestedManyWithoutResponsibleInput;
    evidenceRequirements?: Prisma.EvidenceRequirementCreateNestedManyWithoutResponsibleInput;
};
export type OrganizationResponsibleUncheckedCreateWithoutOrganizationInput = {
    id?: string;
    tenantId: string;
    type: $Enums.OrganizationResponsibleType;
    personName: string;
    assets?: Prisma.AssetUncheckedCreateNestedManyWithoutResponsibleInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedCreateNestedManyWithoutResponsibleInput;
};
export type OrganizationResponsibleCreateOrConnectWithoutOrganizationInput = {
    where: Prisma.OrganizationResponsibleWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutOrganizationInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutOrganizationInput>;
};
export type OrganizationResponsibleCreateManyOrganizationInputEnvelope = {
    data: Prisma.OrganizationResponsibleCreateManyOrganizationInput | Prisma.OrganizationResponsibleCreateManyOrganizationInput[];
    skipDuplicates?: boolean;
};
export type OrganizationResponsibleUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: Prisma.OrganizationResponsibleWhereUniqueInput;
    update: Prisma.XOR<Prisma.OrganizationResponsibleUpdateWithoutOrganizationInput, Prisma.OrganizationResponsibleUncheckedUpdateWithoutOrganizationInput>;
    create: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutOrganizationInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutOrganizationInput>;
};
export type OrganizationResponsibleUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: Prisma.OrganizationResponsibleWhereUniqueInput;
    data: Prisma.XOR<Prisma.OrganizationResponsibleUpdateWithoutOrganizationInput, Prisma.OrganizationResponsibleUncheckedUpdateWithoutOrganizationInput>;
};
export type OrganizationResponsibleUpdateManyWithWhereWithoutOrganizationInput = {
    where: Prisma.OrganizationResponsibleScalarWhereInput;
    data: Prisma.XOR<Prisma.OrganizationResponsibleUpdateManyMutationInput, Prisma.OrganizationResponsibleUncheckedUpdateManyWithoutOrganizationInput>;
};
export type OrganizationResponsibleCreateWithoutAssetsInput = {
    id?: string;
    type: $Enums.OrganizationResponsibleType;
    personName: string;
    organization: Prisma.OrganizationCreateNestedOneWithoutResponsiblesInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutOrganizationResponsiblesInput;
    evidenceRequirements?: Prisma.EvidenceRequirementCreateNestedManyWithoutResponsibleInput;
};
export type OrganizationResponsibleUncheckedCreateWithoutAssetsInput = {
    id?: string;
    tenantId: string;
    organizationId: string;
    type: $Enums.OrganizationResponsibleType;
    personName: string;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedCreateNestedManyWithoutResponsibleInput;
};
export type OrganizationResponsibleCreateOrConnectWithoutAssetsInput = {
    where: Prisma.OrganizationResponsibleWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutAssetsInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutAssetsInput>;
};
export type OrganizationResponsibleUpsertWithoutAssetsInput = {
    update: Prisma.XOR<Prisma.OrganizationResponsibleUpdateWithoutAssetsInput, Prisma.OrganizationResponsibleUncheckedUpdateWithoutAssetsInput>;
    create: Prisma.XOR<Prisma.OrganizationResponsibleCreateWithoutAssetsInput, Prisma.OrganizationResponsibleUncheckedCreateWithoutAssetsInput>;
    where?: Prisma.OrganizationResponsibleWhereInput;
};
export type OrganizationResponsibleUpdateToOneWithWhereWithoutAssetsInput = {
    where?: Prisma.OrganizationResponsibleWhereInput;
    data: Prisma.XOR<Prisma.OrganizationResponsibleUpdateWithoutAssetsInput, Prisma.OrganizationResponsibleUncheckedUpdateWithoutAssetsInput>;
};
export type OrganizationResponsibleUpdateWithoutAssetsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFieldUpdateOperationsInput | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFieldUpdateOperationsInput | string;
    organization?: Prisma.OrganizationUpdateOneRequiredWithoutResponsiblesNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutOrganizationResponsiblesNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUpdateManyWithoutResponsibleNestedInput;
};
export type OrganizationResponsibleUncheckedUpdateWithoutAssetsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFieldUpdateOperationsInput | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFieldUpdateOperationsInput | string;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedUpdateManyWithoutResponsibleNestedInput;
};
export type OrganizationResponsibleCreateManyTenantInput = {
    id?: string;
    organizationId: string;
    type: $Enums.OrganizationResponsibleType;
    personName: string;
};
export type OrganizationResponsibleUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFieldUpdateOperationsInput | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFieldUpdateOperationsInput | string;
    organization?: Prisma.OrganizationUpdateOneRequiredWithoutResponsiblesNestedInput;
    assets?: Prisma.AssetUpdateManyWithoutResponsibleNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUpdateManyWithoutResponsibleNestedInput;
};
export type OrganizationResponsibleUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFieldUpdateOperationsInput | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFieldUpdateOperationsInput | string;
    assets?: Prisma.AssetUncheckedUpdateManyWithoutResponsibleNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedUpdateManyWithoutResponsibleNestedInput;
};
export type OrganizationResponsibleUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFieldUpdateOperationsInput | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type OrganizationResponsibleCreateManyOrganizationInput = {
    id?: string;
    tenantId: string;
    type: $Enums.OrganizationResponsibleType;
    personName: string;
};
export type OrganizationResponsibleUpdateWithoutOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFieldUpdateOperationsInput | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFieldUpdateOperationsInput | string;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutOrganizationResponsiblesNestedInput;
    assets?: Prisma.AssetUpdateManyWithoutResponsibleNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUpdateManyWithoutResponsibleNestedInput;
};
export type OrganizationResponsibleUncheckedUpdateWithoutOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFieldUpdateOperationsInput | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFieldUpdateOperationsInput | string;
    assets?: Prisma.AssetUncheckedUpdateManyWithoutResponsibleNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedUpdateManyWithoutResponsibleNestedInput;
};
export type OrganizationResponsibleUncheckedUpdateManyWithoutOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumOrganizationResponsibleTypeFieldUpdateOperationsInput | $Enums.OrganizationResponsibleType;
    personName?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type OrganizationResponsibleCountOutputType = {
    assets: number;
    evidenceRequirements: number;
};
export type OrganizationResponsibleCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    assets?: boolean | OrganizationResponsibleCountOutputTypeCountAssetsArgs;
    evidenceRequirements?: boolean | OrganizationResponsibleCountOutputTypeCountEvidenceRequirementsArgs;
};
export type OrganizationResponsibleCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleCountOutputTypeSelect<ExtArgs> | null;
};
export type OrganizationResponsibleCountOutputTypeCountAssetsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssetWhereInput;
};
export type OrganizationResponsibleCountOutputTypeCountEvidenceRequirementsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvidenceRequirementWhereInput;
};
export type OrganizationResponsibleSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    organizationId?: boolean;
    type?: boolean;
    personName?: boolean;
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    assets?: boolean | Prisma.OrganizationResponsible$assetsArgs<ExtArgs>;
    evidenceRequirements?: boolean | Prisma.OrganizationResponsible$evidenceRequirementsArgs<ExtArgs>;
    _count?: boolean | Prisma.OrganizationResponsibleCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["organizationResponsible"]>;
export type OrganizationResponsibleSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    organizationId?: boolean;
    type?: boolean;
    personName?: boolean;
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["organizationResponsible"]>;
export type OrganizationResponsibleSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    organizationId?: boolean;
    type?: boolean;
    personName?: boolean;
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["organizationResponsible"]>;
export type OrganizationResponsibleSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    organizationId?: boolean;
    type?: boolean;
    personName?: boolean;
};
export type OrganizationResponsibleOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "organizationId" | "type" | "personName", ExtArgs["result"]["organizationResponsible"]>;
export type OrganizationResponsibleInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    assets?: boolean | Prisma.OrganizationResponsible$assetsArgs<ExtArgs>;
    evidenceRequirements?: boolean | Prisma.OrganizationResponsible$evidenceRequirementsArgs<ExtArgs>;
    _count?: boolean | Prisma.OrganizationResponsibleCountOutputTypeDefaultArgs<ExtArgs>;
};
export type OrganizationResponsibleIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type OrganizationResponsibleIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    organization?: boolean | Prisma.OrganizationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $OrganizationResponsiblePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "OrganizationResponsible";
    objects: {
        organization: Prisma.$OrganizationPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
        assets: Prisma.$AssetPayload<ExtArgs>[];
        evidenceRequirements: Prisma.$EvidenceRequirementPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        organizationId: string;
        type: $Enums.OrganizationResponsibleType;
        personName: string;
    }, ExtArgs["result"]["organizationResponsible"]>;
    composites: {};
};
export type OrganizationResponsibleGetPayload<S extends boolean | null | undefined | OrganizationResponsibleDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$OrganizationResponsiblePayload, S>;
export type OrganizationResponsibleCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<OrganizationResponsibleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: OrganizationResponsibleCountAggregateInputType | true;
};
export interface OrganizationResponsibleDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['OrganizationResponsible'];
        meta: {
            name: 'OrganizationResponsible';
        };
    };
    findUnique<T extends OrganizationResponsibleFindUniqueArgs>(args: Prisma.SelectSubset<T, OrganizationResponsibleFindUniqueArgs<ExtArgs>>): Prisma.Prisma__OrganizationResponsibleClient<runtime.Types.Result.GetResult<Prisma.$OrganizationResponsiblePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends OrganizationResponsibleFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, OrganizationResponsibleFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__OrganizationResponsibleClient<runtime.Types.Result.GetResult<Prisma.$OrganizationResponsiblePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends OrganizationResponsibleFindFirstArgs>(args?: Prisma.SelectSubset<T, OrganizationResponsibleFindFirstArgs<ExtArgs>>): Prisma.Prisma__OrganizationResponsibleClient<runtime.Types.Result.GetResult<Prisma.$OrganizationResponsiblePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends OrganizationResponsibleFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, OrganizationResponsibleFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__OrganizationResponsibleClient<runtime.Types.Result.GetResult<Prisma.$OrganizationResponsiblePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends OrganizationResponsibleFindManyArgs>(args?: Prisma.SelectSubset<T, OrganizationResponsibleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrganizationResponsiblePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends OrganizationResponsibleCreateArgs>(args: Prisma.SelectSubset<T, OrganizationResponsibleCreateArgs<ExtArgs>>): Prisma.Prisma__OrganizationResponsibleClient<runtime.Types.Result.GetResult<Prisma.$OrganizationResponsiblePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends OrganizationResponsibleCreateManyArgs>(args?: Prisma.SelectSubset<T, OrganizationResponsibleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends OrganizationResponsibleCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, OrganizationResponsibleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrganizationResponsiblePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends OrganizationResponsibleDeleteArgs>(args: Prisma.SelectSubset<T, OrganizationResponsibleDeleteArgs<ExtArgs>>): Prisma.Prisma__OrganizationResponsibleClient<runtime.Types.Result.GetResult<Prisma.$OrganizationResponsiblePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends OrganizationResponsibleUpdateArgs>(args: Prisma.SelectSubset<T, OrganizationResponsibleUpdateArgs<ExtArgs>>): Prisma.Prisma__OrganizationResponsibleClient<runtime.Types.Result.GetResult<Prisma.$OrganizationResponsiblePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends OrganizationResponsibleDeleteManyArgs>(args?: Prisma.SelectSubset<T, OrganizationResponsibleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends OrganizationResponsibleUpdateManyArgs>(args: Prisma.SelectSubset<T, OrganizationResponsibleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends OrganizationResponsibleUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, OrganizationResponsibleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrganizationResponsiblePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends OrganizationResponsibleUpsertArgs>(args: Prisma.SelectSubset<T, OrganizationResponsibleUpsertArgs<ExtArgs>>): Prisma.Prisma__OrganizationResponsibleClient<runtime.Types.Result.GetResult<Prisma.$OrganizationResponsiblePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends OrganizationResponsibleCountArgs>(args?: Prisma.Subset<T, OrganizationResponsibleCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], OrganizationResponsibleCountAggregateOutputType> : number>;
    aggregate<T extends OrganizationResponsibleAggregateArgs>(args: Prisma.Subset<T, OrganizationResponsibleAggregateArgs>): Prisma.PrismaPromise<GetOrganizationResponsibleAggregateType<T>>;
    groupBy<T extends OrganizationResponsibleGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: OrganizationResponsibleGroupByArgs['orderBy'];
    } : {
        orderBy?: OrganizationResponsibleGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, OrganizationResponsibleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationResponsibleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: OrganizationResponsibleFieldRefs;
}
export interface Prisma__OrganizationResponsibleClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    organization<T extends Prisma.OrganizationDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OrganizationDefaultArgs<ExtArgs>>): Prisma.Prisma__OrganizationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    assets<T extends Prisma.OrganizationResponsible$assetsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OrganizationResponsible$assetsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    evidenceRequirements<T extends Prisma.OrganizationResponsible$evidenceRequirementsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OrganizationResponsible$evidenceRequirementsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface OrganizationResponsibleFieldRefs {
    readonly id: Prisma.FieldRef<"OrganizationResponsible", 'String'>;
    readonly tenantId: Prisma.FieldRef<"OrganizationResponsible", 'String'>;
    readonly organizationId: Prisma.FieldRef<"OrganizationResponsible", 'String'>;
    readonly type: Prisma.FieldRef<"OrganizationResponsible", 'OrganizationResponsibleType'>;
    readonly personName: Prisma.FieldRef<"OrganizationResponsible", 'String'>;
}
export type OrganizationResponsibleFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationResponsibleOmit<ExtArgs> | null;
    include?: Prisma.OrganizationResponsibleInclude<ExtArgs> | null;
    where: Prisma.OrganizationResponsibleWhereUniqueInput;
};
export type OrganizationResponsibleFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationResponsibleOmit<ExtArgs> | null;
    include?: Prisma.OrganizationResponsibleInclude<ExtArgs> | null;
    where: Prisma.OrganizationResponsibleWhereUniqueInput;
};
export type OrganizationResponsibleFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationResponsibleOmit<ExtArgs> | null;
    include?: Prisma.OrganizationResponsibleInclude<ExtArgs> | null;
    where?: Prisma.OrganizationResponsibleWhereInput;
    orderBy?: Prisma.OrganizationResponsibleOrderByWithRelationInput | Prisma.OrganizationResponsibleOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationResponsibleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrganizationResponsibleScalarFieldEnum | Prisma.OrganizationResponsibleScalarFieldEnum[];
};
export type OrganizationResponsibleFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationResponsibleOmit<ExtArgs> | null;
    include?: Prisma.OrganizationResponsibleInclude<ExtArgs> | null;
    where?: Prisma.OrganizationResponsibleWhereInput;
    orderBy?: Prisma.OrganizationResponsibleOrderByWithRelationInput | Prisma.OrganizationResponsibleOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationResponsibleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrganizationResponsibleScalarFieldEnum | Prisma.OrganizationResponsibleScalarFieldEnum[];
};
export type OrganizationResponsibleFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationResponsibleOmit<ExtArgs> | null;
    include?: Prisma.OrganizationResponsibleInclude<ExtArgs> | null;
    where?: Prisma.OrganizationResponsibleWhereInput;
    orderBy?: Prisma.OrganizationResponsibleOrderByWithRelationInput | Prisma.OrganizationResponsibleOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationResponsibleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrganizationResponsibleScalarFieldEnum | Prisma.OrganizationResponsibleScalarFieldEnum[];
};
export type OrganizationResponsibleCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationResponsibleOmit<ExtArgs> | null;
    include?: Prisma.OrganizationResponsibleInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OrganizationResponsibleCreateInput, Prisma.OrganizationResponsibleUncheckedCreateInput>;
};
export type OrganizationResponsibleCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.OrganizationResponsibleCreateManyInput | Prisma.OrganizationResponsibleCreateManyInput[];
    skipDuplicates?: boolean;
};
export type OrganizationResponsibleCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.OrganizationResponsibleOmit<ExtArgs> | null;
    data: Prisma.OrganizationResponsibleCreateManyInput | Prisma.OrganizationResponsibleCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.OrganizationResponsibleIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type OrganizationResponsibleUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationResponsibleOmit<ExtArgs> | null;
    include?: Prisma.OrganizationResponsibleInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OrganizationResponsibleUpdateInput, Prisma.OrganizationResponsibleUncheckedUpdateInput>;
    where: Prisma.OrganizationResponsibleWhereUniqueInput;
};
export type OrganizationResponsibleUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.OrganizationResponsibleUpdateManyMutationInput, Prisma.OrganizationResponsibleUncheckedUpdateManyInput>;
    where?: Prisma.OrganizationResponsibleWhereInput;
    limit?: number;
};
export type OrganizationResponsibleUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.OrganizationResponsibleOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OrganizationResponsibleUpdateManyMutationInput, Prisma.OrganizationResponsibleUncheckedUpdateManyInput>;
    where?: Prisma.OrganizationResponsibleWhereInput;
    limit?: number;
    include?: Prisma.OrganizationResponsibleIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type OrganizationResponsibleUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationResponsibleOmit<ExtArgs> | null;
    include?: Prisma.OrganizationResponsibleInclude<ExtArgs> | null;
    where: Prisma.OrganizationResponsibleWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationResponsibleCreateInput, Prisma.OrganizationResponsibleUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.OrganizationResponsibleUpdateInput, Prisma.OrganizationResponsibleUncheckedUpdateInput>;
};
export type OrganizationResponsibleDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationResponsibleOmit<ExtArgs> | null;
    include?: Prisma.OrganizationResponsibleInclude<ExtArgs> | null;
    where: Prisma.OrganizationResponsibleWhereUniqueInput;
};
export type OrganizationResponsibleDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrganizationResponsibleWhereInput;
    limit?: number;
};
export type OrganizationResponsible$assetsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssetSelect<ExtArgs> | null;
    omit?: Prisma.AssetOmit<ExtArgs> | null;
    include?: Prisma.AssetInclude<ExtArgs> | null;
    where?: Prisma.AssetWhereInput;
    orderBy?: Prisma.AssetOrderByWithRelationInput | Prisma.AssetOrderByWithRelationInput[];
    cursor?: Prisma.AssetWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AssetScalarFieldEnum | Prisma.AssetScalarFieldEnum[];
};
export type OrganizationResponsible$evidenceRequirementsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceRequirementOmit<ExtArgs> | null;
    include?: Prisma.EvidenceRequirementInclude<ExtArgs> | null;
    where?: Prisma.EvidenceRequirementWhereInput;
    orderBy?: Prisma.EvidenceRequirementOrderByWithRelationInput | Prisma.EvidenceRequirementOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceRequirementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EvidenceRequirementScalarFieldEnum | Prisma.EvidenceRequirementScalarFieldEnum[];
};
export type OrganizationResponsibleDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationResponsibleOmit<ExtArgs> | null;
    include?: Prisma.OrganizationResponsibleInclude<ExtArgs> | null;
};
export {};
