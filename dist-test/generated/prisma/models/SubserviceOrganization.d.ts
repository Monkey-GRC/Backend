import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type SubserviceOrganizationModel = runtime.Types.Result.DefaultSelection<Prisma.$SubserviceOrganizationPayload>;
export type AggregateSubserviceOrganization = {
    _count: SubserviceOrganizationCountAggregateOutputType | null;
    _min: SubserviceOrganizationMinAggregateOutputType | null;
    _max: SubserviceOrganizationMaxAggregateOutputType | null;
};
export type SubserviceOrganizationMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    serviceId: string | null;
    provider: string | null;
    serviceProvided: string | null;
    responsibility: string | null;
    type: $Enums.SubserviceProviderType | null;
};
export type SubserviceOrganizationMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    serviceId: string | null;
    provider: string | null;
    serviceProvided: string | null;
    responsibility: string | null;
    type: $Enums.SubserviceProviderType | null;
};
export type SubserviceOrganizationCountAggregateOutputType = {
    id: number;
    tenantId: number;
    serviceId: number;
    provider: number;
    serviceProvided: number;
    responsibility: number;
    type: number;
    _all: number;
};
export type SubserviceOrganizationMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    provider?: true;
    serviceProvided?: true;
    responsibility?: true;
    type?: true;
};
export type SubserviceOrganizationMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    provider?: true;
    serviceProvided?: true;
    responsibility?: true;
    type?: true;
};
export type SubserviceOrganizationCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    provider?: true;
    serviceProvided?: true;
    responsibility?: true;
    type?: true;
    _all?: true;
};
export type SubserviceOrganizationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SubserviceOrganizationWhereInput;
    orderBy?: Prisma.SubserviceOrganizationOrderByWithRelationInput | Prisma.SubserviceOrganizationOrderByWithRelationInput[];
    cursor?: Prisma.SubserviceOrganizationWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SubserviceOrganizationCountAggregateInputType;
    _min?: SubserviceOrganizationMinAggregateInputType;
    _max?: SubserviceOrganizationMaxAggregateInputType;
};
export type GetSubserviceOrganizationAggregateType<T extends SubserviceOrganizationAggregateArgs> = {
    [P in keyof T & keyof AggregateSubserviceOrganization]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSubserviceOrganization[P]> : Prisma.GetScalarType<T[P], AggregateSubserviceOrganization[P]>;
};
export type SubserviceOrganizationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SubserviceOrganizationWhereInput;
    orderBy?: Prisma.SubserviceOrganizationOrderByWithAggregationInput | Prisma.SubserviceOrganizationOrderByWithAggregationInput[];
    by: Prisma.SubserviceOrganizationScalarFieldEnum[] | Prisma.SubserviceOrganizationScalarFieldEnum;
    having?: Prisma.SubserviceOrganizationScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SubserviceOrganizationCountAggregateInputType | true;
    _min?: SubserviceOrganizationMinAggregateInputType;
    _max?: SubserviceOrganizationMaxAggregateInputType;
};
export type SubserviceOrganizationGroupByOutputType = {
    id: string;
    tenantId: string;
    serviceId: string;
    provider: string | null;
    serviceProvided: string | null;
    responsibility: string | null;
    type: $Enums.SubserviceProviderType;
    _count: SubserviceOrganizationCountAggregateOutputType | null;
    _min: SubserviceOrganizationMinAggregateOutputType | null;
    _max: SubserviceOrganizationMaxAggregateOutputType | null;
};
type GetSubserviceOrganizationGroupByPayload<T extends SubserviceOrganizationGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SubserviceOrganizationGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SubserviceOrganizationGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SubserviceOrganizationGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SubserviceOrganizationGroupByOutputType[P]>;
}>>;
export type SubserviceOrganizationWhereInput = {
    AND?: Prisma.SubserviceOrganizationWhereInput | Prisma.SubserviceOrganizationWhereInput[];
    OR?: Prisma.SubserviceOrganizationWhereInput[];
    NOT?: Prisma.SubserviceOrganizationWhereInput | Prisma.SubserviceOrganizationWhereInput[];
    id?: Prisma.UuidFilter<"SubserviceOrganization"> | string;
    tenantId?: Prisma.UuidFilter<"SubserviceOrganization"> | string;
    serviceId?: Prisma.UuidFilter<"SubserviceOrganization"> | string;
    provider?: Prisma.StringNullableFilter<"SubserviceOrganization"> | string | null;
    serviceProvided?: Prisma.StringNullableFilter<"SubserviceOrganization"> | string | null;
    responsibility?: Prisma.StringNullableFilter<"SubserviceOrganization"> | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFilter<"SubserviceOrganization"> | $Enums.SubserviceProviderType;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    csocs?: Prisma.CsocListRelationFilter;
};
export type SubserviceOrganizationOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    provider?: Prisma.SortOrderInput | Prisma.SortOrder;
    serviceProvided?: Prisma.SortOrderInput | Prisma.SortOrder;
    responsibility?: Prisma.SortOrderInput | Prisma.SortOrder;
    type?: Prisma.SortOrder;
    service?: Prisma.ServiceOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
    csocs?: Prisma.CsocOrderByRelationAggregateInput;
};
export type SubserviceOrganizationWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.SubserviceOrganizationWhereInput | Prisma.SubserviceOrganizationWhereInput[];
    OR?: Prisma.SubserviceOrganizationWhereInput[];
    NOT?: Prisma.SubserviceOrganizationWhereInput | Prisma.SubserviceOrganizationWhereInput[];
    tenantId?: Prisma.UuidFilter<"SubserviceOrganization"> | string;
    serviceId?: Prisma.UuidFilter<"SubserviceOrganization"> | string;
    provider?: Prisma.StringNullableFilter<"SubserviceOrganization"> | string | null;
    serviceProvided?: Prisma.StringNullableFilter<"SubserviceOrganization"> | string | null;
    responsibility?: Prisma.StringNullableFilter<"SubserviceOrganization"> | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFilter<"SubserviceOrganization"> | $Enums.SubserviceProviderType;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    csocs?: Prisma.CsocListRelationFilter;
}, "id">;
export type SubserviceOrganizationOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    provider?: Prisma.SortOrderInput | Prisma.SortOrder;
    serviceProvided?: Prisma.SortOrderInput | Prisma.SortOrder;
    responsibility?: Prisma.SortOrderInput | Prisma.SortOrder;
    type?: Prisma.SortOrder;
    _count?: Prisma.SubserviceOrganizationCountOrderByAggregateInput;
    _max?: Prisma.SubserviceOrganizationMaxOrderByAggregateInput;
    _min?: Prisma.SubserviceOrganizationMinOrderByAggregateInput;
};
export type SubserviceOrganizationScalarWhereWithAggregatesInput = {
    AND?: Prisma.SubserviceOrganizationScalarWhereWithAggregatesInput | Prisma.SubserviceOrganizationScalarWhereWithAggregatesInput[];
    OR?: Prisma.SubserviceOrganizationScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SubserviceOrganizationScalarWhereWithAggregatesInput | Prisma.SubserviceOrganizationScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"SubserviceOrganization"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"SubserviceOrganization"> | string;
    serviceId?: Prisma.UuidWithAggregatesFilter<"SubserviceOrganization"> | string;
    provider?: Prisma.StringNullableWithAggregatesFilter<"SubserviceOrganization"> | string | null;
    serviceProvided?: Prisma.StringNullableWithAggregatesFilter<"SubserviceOrganization"> | string | null;
    responsibility?: Prisma.StringNullableWithAggregatesFilter<"SubserviceOrganization"> | string | null;
    type?: Prisma.EnumSubserviceProviderTypeWithAggregatesFilter<"SubserviceOrganization"> | $Enums.SubserviceProviderType;
};
export type SubserviceOrganizationCreateInput = {
    id?: string;
    provider?: string | null;
    serviceProvided?: string | null;
    responsibility?: string | null;
    type: $Enums.SubserviceProviderType;
    service: Prisma.ServiceCreateNestedOneWithoutSubserviceOrganizationsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutSubserviceOrganizationsInput;
    csocs?: Prisma.CsocCreateNestedManyWithoutSubserviceOrganizationInput;
};
export type SubserviceOrganizationUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    provider?: string | null;
    serviceProvided?: string | null;
    responsibility?: string | null;
    type: $Enums.SubserviceProviderType;
    csocs?: Prisma.CsocUncheckedCreateNestedManyWithoutSubserviceOrganizationInput;
};
export type SubserviceOrganizationUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceProvided?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsibility?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFieldUpdateOperationsInput | $Enums.SubserviceProviderType;
    service?: Prisma.ServiceUpdateOneRequiredWithoutSubserviceOrganizationsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutSubserviceOrganizationsNestedInput;
    csocs?: Prisma.CsocUpdateManyWithoutSubserviceOrganizationNestedInput;
};
export type SubserviceOrganizationUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceProvided?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsibility?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFieldUpdateOperationsInput | $Enums.SubserviceProviderType;
    csocs?: Prisma.CsocUncheckedUpdateManyWithoutSubserviceOrganizationNestedInput;
};
export type SubserviceOrganizationCreateManyInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    provider?: string | null;
    serviceProvided?: string | null;
    responsibility?: string | null;
    type: $Enums.SubserviceProviderType;
};
export type SubserviceOrganizationUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceProvided?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsibility?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFieldUpdateOperationsInput | $Enums.SubserviceProviderType;
};
export type SubserviceOrganizationUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceProvided?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsibility?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFieldUpdateOperationsInput | $Enums.SubserviceProviderType;
};
export type SubserviceOrganizationListRelationFilter = {
    every?: Prisma.SubserviceOrganizationWhereInput;
    some?: Prisma.SubserviceOrganizationWhereInput;
    none?: Prisma.SubserviceOrganizationWhereInput;
};
export type SubserviceOrganizationOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type SubserviceOrganizationCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    serviceProvided?: Prisma.SortOrder;
    responsibility?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
};
export type SubserviceOrganizationMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    serviceProvided?: Prisma.SortOrder;
    responsibility?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
};
export type SubserviceOrganizationMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    serviceProvided?: Prisma.SortOrder;
    responsibility?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
};
export type SubserviceOrganizationScalarRelationFilter = {
    is?: Prisma.SubserviceOrganizationWhereInput;
    isNot?: Prisma.SubserviceOrganizationWhereInput;
};
export type SubserviceOrganizationCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutTenantInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutTenantInput> | Prisma.SubserviceOrganizationCreateWithoutTenantInput[] | Prisma.SubserviceOrganizationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.SubserviceOrganizationCreateOrConnectWithoutTenantInput | Prisma.SubserviceOrganizationCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.SubserviceOrganizationCreateManyTenantInputEnvelope;
    connect?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
};
export type SubserviceOrganizationUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutTenantInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutTenantInput> | Prisma.SubserviceOrganizationCreateWithoutTenantInput[] | Prisma.SubserviceOrganizationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.SubserviceOrganizationCreateOrConnectWithoutTenantInput | Prisma.SubserviceOrganizationCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.SubserviceOrganizationCreateManyTenantInputEnvelope;
    connect?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
};
export type SubserviceOrganizationUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutTenantInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutTenantInput> | Prisma.SubserviceOrganizationCreateWithoutTenantInput[] | Prisma.SubserviceOrganizationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.SubserviceOrganizationCreateOrConnectWithoutTenantInput | Prisma.SubserviceOrganizationCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.SubserviceOrganizationUpsertWithWhereUniqueWithoutTenantInput | Prisma.SubserviceOrganizationUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.SubserviceOrganizationCreateManyTenantInputEnvelope;
    set?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    disconnect?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    delete?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    connect?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    update?: Prisma.SubserviceOrganizationUpdateWithWhereUniqueWithoutTenantInput | Prisma.SubserviceOrganizationUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.SubserviceOrganizationUpdateManyWithWhereWithoutTenantInput | Prisma.SubserviceOrganizationUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.SubserviceOrganizationScalarWhereInput | Prisma.SubserviceOrganizationScalarWhereInput[];
};
export type SubserviceOrganizationUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutTenantInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutTenantInput> | Prisma.SubserviceOrganizationCreateWithoutTenantInput[] | Prisma.SubserviceOrganizationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.SubserviceOrganizationCreateOrConnectWithoutTenantInput | Prisma.SubserviceOrganizationCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.SubserviceOrganizationUpsertWithWhereUniqueWithoutTenantInput | Prisma.SubserviceOrganizationUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.SubserviceOrganizationCreateManyTenantInputEnvelope;
    set?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    disconnect?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    delete?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    connect?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    update?: Prisma.SubserviceOrganizationUpdateWithWhereUniqueWithoutTenantInput | Prisma.SubserviceOrganizationUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.SubserviceOrganizationUpdateManyWithWhereWithoutTenantInput | Prisma.SubserviceOrganizationUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.SubserviceOrganizationScalarWhereInput | Prisma.SubserviceOrganizationScalarWhereInput[];
};
export type SubserviceOrganizationCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutServiceInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutServiceInput> | Prisma.SubserviceOrganizationCreateWithoutServiceInput[] | Prisma.SubserviceOrganizationUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.SubserviceOrganizationCreateOrConnectWithoutServiceInput | Prisma.SubserviceOrganizationCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.SubserviceOrganizationCreateManyServiceInputEnvelope;
    connect?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
};
export type SubserviceOrganizationUncheckedCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutServiceInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutServiceInput> | Prisma.SubserviceOrganizationCreateWithoutServiceInput[] | Prisma.SubserviceOrganizationUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.SubserviceOrganizationCreateOrConnectWithoutServiceInput | Prisma.SubserviceOrganizationCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.SubserviceOrganizationCreateManyServiceInputEnvelope;
    connect?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
};
export type SubserviceOrganizationUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutServiceInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutServiceInput> | Prisma.SubserviceOrganizationCreateWithoutServiceInput[] | Prisma.SubserviceOrganizationUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.SubserviceOrganizationCreateOrConnectWithoutServiceInput | Prisma.SubserviceOrganizationCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.SubserviceOrganizationUpsertWithWhereUniqueWithoutServiceInput | Prisma.SubserviceOrganizationUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.SubserviceOrganizationCreateManyServiceInputEnvelope;
    set?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    disconnect?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    delete?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    connect?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    update?: Prisma.SubserviceOrganizationUpdateWithWhereUniqueWithoutServiceInput | Prisma.SubserviceOrganizationUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.SubserviceOrganizationUpdateManyWithWhereWithoutServiceInput | Prisma.SubserviceOrganizationUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.SubserviceOrganizationScalarWhereInput | Prisma.SubserviceOrganizationScalarWhereInput[];
};
export type SubserviceOrganizationUncheckedUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutServiceInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutServiceInput> | Prisma.SubserviceOrganizationCreateWithoutServiceInput[] | Prisma.SubserviceOrganizationUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.SubserviceOrganizationCreateOrConnectWithoutServiceInput | Prisma.SubserviceOrganizationCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.SubserviceOrganizationUpsertWithWhereUniqueWithoutServiceInput | Prisma.SubserviceOrganizationUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.SubserviceOrganizationCreateManyServiceInputEnvelope;
    set?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    disconnect?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    delete?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    connect?: Prisma.SubserviceOrganizationWhereUniqueInput | Prisma.SubserviceOrganizationWhereUniqueInput[];
    update?: Prisma.SubserviceOrganizationUpdateWithWhereUniqueWithoutServiceInput | Prisma.SubserviceOrganizationUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.SubserviceOrganizationUpdateManyWithWhereWithoutServiceInput | Prisma.SubserviceOrganizationUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.SubserviceOrganizationScalarWhereInput | Prisma.SubserviceOrganizationScalarWhereInput[];
};
export type EnumSubserviceProviderTypeFieldUpdateOperationsInput = {
    set?: $Enums.SubserviceProviderType;
};
export type SubserviceOrganizationCreateNestedOneWithoutCsocsInput = {
    create?: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutCsocsInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutCsocsInput>;
    connectOrCreate?: Prisma.SubserviceOrganizationCreateOrConnectWithoutCsocsInput;
    connect?: Prisma.SubserviceOrganizationWhereUniqueInput;
};
export type SubserviceOrganizationUpdateOneRequiredWithoutCsocsNestedInput = {
    create?: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutCsocsInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutCsocsInput>;
    connectOrCreate?: Prisma.SubserviceOrganizationCreateOrConnectWithoutCsocsInput;
    upsert?: Prisma.SubserviceOrganizationUpsertWithoutCsocsInput;
    connect?: Prisma.SubserviceOrganizationWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SubserviceOrganizationUpdateToOneWithWhereWithoutCsocsInput, Prisma.SubserviceOrganizationUpdateWithoutCsocsInput>, Prisma.SubserviceOrganizationUncheckedUpdateWithoutCsocsInput>;
};
export type SubserviceOrganizationCreateWithoutTenantInput = {
    id?: string;
    provider?: string | null;
    serviceProvided?: string | null;
    responsibility?: string | null;
    type: $Enums.SubserviceProviderType;
    service: Prisma.ServiceCreateNestedOneWithoutSubserviceOrganizationsInput;
    csocs?: Prisma.CsocCreateNestedManyWithoutSubserviceOrganizationInput;
};
export type SubserviceOrganizationUncheckedCreateWithoutTenantInput = {
    id?: string;
    serviceId: string;
    provider?: string | null;
    serviceProvided?: string | null;
    responsibility?: string | null;
    type: $Enums.SubserviceProviderType;
    csocs?: Prisma.CsocUncheckedCreateNestedManyWithoutSubserviceOrganizationInput;
};
export type SubserviceOrganizationCreateOrConnectWithoutTenantInput = {
    where: Prisma.SubserviceOrganizationWhereUniqueInput;
    create: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutTenantInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutTenantInput>;
};
export type SubserviceOrganizationCreateManyTenantInputEnvelope = {
    data: Prisma.SubserviceOrganizationCreateManyTenantInput | Prisma.SubserviceOrganizationCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type SubserviceOrganizationUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.SubserviceOrganizationWhereUniqueInput;
    update: Prisma.XOR<Prisma.SubserviceOrganizationUpdateWithoutTenantInput, Prisma.SubserviceOrganizationUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutTenantInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutTenantInput>;
};
export type SubserviceOrganizationUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.SubserviceOrganizationWhereUniqueInput;
    data: Prisma.XOR<Prisma.SubserviceOrganizationUpdateWithoutTenantInput, Prisma.SubserviceOrganizationUncheckedUpdateWithoutTenantInput>;
};
export type SubserviceOrganizationUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.SubserviceOrganizationScalarWhereInput;
    data: Prisma.XOR<Prisma.SubserviceOrganizationUpdateManyMutationInput, Prisma.SubserviceOrganizationUncheckedUpdateManyWithoutTenantInput>;
};
export type SubserviceOrganizationScalarWhereInput = {
    AND?: Prisma.SubserviceOrganizationScalarWhereInput | Prisma.SubserviceOrganizationScalarWhereInput[];
    OR?: Prisma.SubserviceOrganizationScalarWhereInput[];
    NOT?: Prisma.SubserviceOrganizationScalarWhereInput | Prisma.SubserviceOrganizationScalarWhereInput[];
    id?: Prisma.UuidFilter<"SubserviceOrganization"> | string;
    tenantId?: Prisma.UuidFilter<"SubserviceOrganization"> | string;
    serviceId?: Prisma.UuidFilter<"SubserviceOrganization"> | string;
    provider?: Prisma.StringNullableFilter<"SubserviceOrganization"> | string | null;
    serviceProvided?: Prisma.StringNullableFilter<"SubserviceOrganization"> | string | null;
    responsibility?: Prisma.StringNullableFilter<"SubserviceOrganization"> | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFilter<"SubserviceOrganization"> | $Enums.SubserviceProviderType;
};
export type SubserviceOrganizationCreateWithoutServiceInput = {
    id?: string;
    provider?: string | null;
    serviceProvided?: string | null;
    responsibility?: string | null;
    type: $Enums.SubserviceProviderType;
    tenant: Prisma.CompanyCreateNestedOneWithoutSubserviceOrganizationsInput;
    csocs?: Prisma.CsocCreateNestedManyWithoutSubserviceOrganizationInput;
};
export type SubserviceOrganizationUncheckedCreateWithoutServiceInput = {
    id?: string;
    tenantId: string;
    provider?: string | null;
    serviceProvided?: string | null;
    responsibility?: string | null;
    type: $Enums.SubserviceProviderType;
    csocs?: Prisma.CsocUncheckedCreateNestedManyWithoutSubserviceOrganizationInput;
};
export type SubserviceOrganizationCreateOrConnectWithoutServiceInput = {
    where: Prisma.SubserviceOrganizationWhereUniqueInput;
    create: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutServiceInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutServiceInput>;
};
export type SubserviceOrganizationCreateManyServiceInputEnvelope = {
    data: Prisma.SubserviceOrganizationCreateManyServiceInput | Prisma.SubserviceOrganizationCreateManyServiceInput[];
    skipDuplicates?: boolean;
};
export type SubserviceOrganizationUpsertWithWhereUniqueWithoutServiceInput = {
    where: Prisma.SubserviceOrganizationWhereUniqueInput;
    update: Prisma.XOR<Prisma.SubserviceOrganizationUpdateWithoutServiceInput, Prisma.SubserviceOrganizationUncheckedUpdateWithoutServiceInput>;
    create: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutServiceInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutServiceInput>;
};
export type SubserviceOrganizationUpdateWithWhereUniqueWithoutServiceInput = {
    where: Prisma.SubserviceOrganizationWhereUniqueInput;
    data: Prisma.XOR<Prisma.SubserviceOrganizationUpdateWithoutServiceInput, Prisma.SubserviceOrganizationUncheckedUpdateWithoutServiceInput>;
};
export type SubserviceOrganizationUpdateManyWithWhereWithoutServiceInput = {
    where: Prisma.SubserviceOrganizationScalarWhereInput;
    data: Prisma.XOR<Prisma.SubserviceOrganizationUpdateManyMutationInput, Prisma.SubserviceOrganizationUncheckedUpdateManyWithoutServiceInput>;
};
export type SubserviceOrganizationCreateWithoutCsocsInput = {
    id?: string;
    provider?: string | null;
    serviceProvided?: string | null;
    responsibility?: string | null;
    type: $Enums.SubserviceProviderType;
    service: Prisma.ServiceCreateNestedOneWithoutSubserviceOrganizationsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutSubserviceOrganizationsInput;
};
export type SubserviceOrganizationUncheckedCreateWithoutCsocsInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    provider?: string | null;
    serviceProvided?: string | null;
    responsibility?: string | null;
    type: $Enums.SubserviceProviderType;
};
export type SubserviceOrganizationCreateOrConnectWithoutCsocsInput = {
    where: Prisma.SubserviceOrganizationWhereUniqueInput;
    create: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutCsocsInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutCsocsInput>;
};
export type SubserviceOrganizationUpsertWithoutCsocsInput = {
    update: Prisma.XOR<Prisma.SubserviceOrganizationUpdateWithoutCsocsInput, Prisma.SubserviceOrganizationUncheckedUpdateWithoutCsocsInput>;
    create: Prisma.XOR<Prisma.SubserviceOrganizationCreateWithoutCsocsInput, Prisma.SubserviceOrganizationUncheckedCreateWithoutCsocsInput>;
    where?: Prisma.SubserviceOrganizationWhereInput;
};
export type SubserviceOrganizationUpdateToOneWithWhereWithoutCsocsInput = {
    where?: Prisma.SubserviceOrganizationWhereInput;
    data: Prisma.XOR<Prisma.SubserviceOrganizationUpdateWithoutCsocsInput, Prisma.SubserviceOrganizationUncheckedUpdateWithoutCsocsInput>;
};
export type SubserviceOrganizationUpdateWithoutCsocsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceProvided?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsibility?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFieldUpdateOperationsInput | $Enums.SubserviceProviderType;
    service?: Prisma.ServiceUpdateOneRequiredWithoutSubserviceOrganizationsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutSubserviceOrganizationsNestedInput;
};
export type SubserviceOrganizationUncheckedUpdateWithoutCsocsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceProvided?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsibility?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFieldUpdateOperationsInput | $Enums.SubserviceProviderType;
};
export type SubserviceOrganizationCreateManyTenantInput = {
    id?: string;
    serviceId: string;
    provider?: string | null;
    serviceProvided?: string | null;
    responsibility?: string | null;
    type: $Enums.SubserviceProviderType;
};
export type SubserviceOrganizationUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceProvided?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsibility?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFieldUpdateOperationsInput | $Enums.SubserviceProviderType;
    service?: Prisma.ServiceUpdateOneRequiredWithoutSubserviceOrganizationsNestedInput;
    csocs?: Prisma.CsocUpdateManyWithoutSubserviceOrganizationNestedInput;
};
export type SubserviceOrganizationUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceProvided?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsibility?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFieldUpdateOperationsInput | $Enums.SubserviceProviderType;
    csocs?: Prisma.CsocUncheckedUpdateManyWithoutSubserviceOrganizationNestedInput;
};
export type SubserviceOrganizationUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceProvided?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsibility?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFieldUpdateOperationsInput | $Enums.SubserviceProviderType;
};
export type SubserviceOrganizationCreateManyServiceInput = {
    id?: string;
    tenantId: string;
    provider?: string | null;
    serviceProvided?: string | null;
    responsibility?: string | null;
    type: $Enums.SubserviceProviderType;
};
export type SubserviceOrganizationUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceProvided?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsibility?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFieldUpdateOperationsInput | $Enums.SubserviceProviderType;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutSubserviceOrganizationsNestedInput;
    csocs?: Prisma.CsocUpdateManyWithoutSubserviceOrganizationNestedInput;
};
export type SubserviceOrganizationUncheckedUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceProvided?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsibility?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFieldUpdateOperationsInput | $Enums.SubserviceProviderType;
    csocs?: Prisma.CsocUncheckedUpdateManyWithoutSubserviceOrganizationNestedInput;
};
export type SubserviceOrganizationUncheckedUpdateManyWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceProvided?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsibility?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumSubserviceProviderTypeFieldUpdateOperationsInput | $Enums.SubserviceProviderType;
};
export type SubserviceOrganizationCountOutputType = {
    csocs: number;
};
export type SubserviceOrganizationCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    csocs?: boolean | SubserviceOrganizationCountOutputTypeCountCsocsArgs;
};
export type SubserviceOrganizationCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SubserviceOrganizationCountOutputTypeSelect<ExtArgs> | null;
};
export type SubserviceOrganizationCountOutputTypeCountCsocsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CsocWhereInput;
};
export type SubserviceOrganizationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    provider?: boolean;
    serviceProvided?: boolean;
    responsibility?: boolean;
    type?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    csocs?: boolean | Prisma.SubserviceOrganization$csocsArgs<ExtArgs>;
    _count?: boolean | Prisma.SubserviceOrganizationCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["subserviceOrganization"]>;
export type SubserviceOrganizationSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    provider?: boolean;
    serviceProvided?: boolean;
    responsibility?: boolean;
    type?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["subserviceOrganization"]>;
export type SubserviceOrganizationSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    provider?: boolean;
    serviceProvided?: boolean;
    responsibility?: boolean;
    type?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["subserviceOrganization"]>;
export type SubserviceOrganizationSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    provider?: boolean;
    serviceProvided?: boolean;
    responsibility?: boolean;
    type?: boolean;
};
export type SubserviceOrganizationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "serviceId" | "provider" | "serviceProvided" | "responsibility" | "type", ExtArgs["result"]["subserviceOrganization"]>;
export type SubserviceOrganizationInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    csocs?: boolean | Prisma.SubserviceOrganization$csocsArgs<ExtArgs>;
    _count?: boolean | Prisma.SubserviceOrganizationCountOutputTypeDefaultArgs<ExtArgs>;
};
export type SubserviceOrganizationIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type SubserviceOrganizationIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $SubserviceOrganizationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "SubserviceOrganization";
    objects: {
        service: Prisma.$ServicePayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
        csocs: Prisma.$CsocPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        serviceId: string;
        provider: string | null;
        serviceProvided: string | null;
        responsibility: string | null;
        type: $Enums.SubserviceProviderType;
    }, ExtArgs["result"]["subserviceOrganization"]>;
    composites: {};
};
export type SubserviceOrganizationGetPayload<S extends boolean | null | undefined | SubserviceOrganizationDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SubserviceOrganizationPayload, S>;
export type SubserviceOrganizationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SubserviceOrganizationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SubserviceOrganizationCountAggregateInputType | true;
};
export interface SubserviceOrganizationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['SubserviceOrganization'];
        meta: {
            name: 'SubserviceOrganization';
        };
    };
    findUnique<T extends SubserviceOrganizationFindUniqueArgs>(args: Prisma.SelectSubset<T, SubserviceOrganizationFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SubserviceOrganizationClient<runtime.Types.Result.GetResult<Prisma.$SubserviceOrganizationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SubserviceOrganizationFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SubserviceOrganizationFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SubserviceOrganizationClient<runtime.Types.Result.GetResult<Prisma.$SubserviceOrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SubserviceOrganizationFindFirstArgs>(args?: Prisma.SelectSubset<T, SubserviceOrganizationFindFirstArgs<ExtArgs>>): Prisma.Prisma__SubserviceOrganizationClient<runtime.Types.Result.GetResult<Prisma.$SubserviceOrganizationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SubserviceOrganizationFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SubserviceOrganizationFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SubserviceOrganizationClient<runtime.Types.Result.GetResult<Prisma.$SubserviceOrganizationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SubserviceOrganizationFindManyArgs>(args?: Prisma.SelectSubset<T, SubserviceOrganizationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SubserviceOrganizationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SubserviceOrganizationCreateArgs>(args: Prisma.SelectSubset<T, SubserviceOrganizationCreateArgs<ExtArgs>>): Prisma.Prisma__SubserviceOrganizationClient<runtime.Types.Result.GetResult<Prisma.$SubserviceOrganizationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SubserviceOrganizationCreateManyArgs>(args?: Prisma.SelectSubset<T, SubserviceOrganizationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends SubserviceOrganizationCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SubserviceOrganizationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SubserviceOrganizationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends SubserviceOrganizationDeleteArgs>(args: Prisma.SelectSubset<T, SubserviceOrganizationDeleteArgs<ExtArgs>>): Prisma.Prisma__SubserviceOrganizationClient<runtime.Types.Result.GetResult<Prisma.$SubserviceOrganizationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SubserviceOrganizationUpdateArgs>(args: Prisma.SelectSubset<T, SubserviceOrganizationUpdateArgs<ExtArgs>>): Prisma.Prisma__SubserviceOrganizationClient<runtime.Types.Result.GetResult<Prisma.$SubserviceOrganizationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SubserviceOrganizationDeleteManyArgs>(args?: Prisma.SelectSubset<T, SubserviceOrganizationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SubserviceOrganizationUpdateManyArgs>(args: Prisma.SelectSubset<T, SubserviceOrganizationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends SubserviceOrganizationUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SubserviceOrganizationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SubserviceOrganizationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends SubserviceOrganizationUpsertArgs>(args: Prisma.SelectSubset<T, SubserviceOrganizationUpsertArgs<ExtArgs>>): Prisma.Prisma__SubserviceOrganizationClient<runtime.Types.Result.GetResult<Prisma.$SubserviceOrganizationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SubserviceOrganizationCountArgs>(args?: Prisma.Subset<T, SubserviceOrganizationCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SubserviceOrganizationCountAggregateOutputType> : number>;
    aggregate<T extends SubserviceOrganizationAggregateArgs>(args: Prisma.Subset<T, SubserviceOrganizationAggregateArgs>): Prisma.PrismaPromise<GetSubserviceOrganizationAggregateType<T>>;
    groupBy<T extends SubserviceOrganizationGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SubserviceOrganizationGroupByArgs['orderBy'];
    } : {
        orderBy?: SubserviceOrganizationGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SubserviceOrganizationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSubserviceOrganizationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SubserviceOrganizationFieldRefs;
}
export interface Prisma__SubserviceOrganizationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    service<T extends Prisma.ServiceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ServiceDefaultArgs<ExtArgs>>): Prisma.Prisma__ServiceClient<runtime.Types.Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    csocs<T extends Prisma.SubserviceOrganization$csocsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SubserviceOrganization$csocsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CsocPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SubserviceOrganizationFieldRefs {
    readonly id: Prisma.FieldRef<"SubserviceOrganization", 'String'>;
    readonly tenantId: Prisma.FieldRef<"SubserviceOrganization", 'String'>;
    readonly serviceId: Prisma.FieldRef<"SubserviceOrganization", 'String'>;
    readonly provider: Prisma.FieldRef<"SubserviceOrganization", 'String'>;
    readonly serviceProvided: Prisma.FieldRef<"SubserviceOrganization", 'String'>;
    readonly responsibility: Prisma.FieldRef<"SubserviceOrganization", 'String'>;
    readonly type: Prisma.FieldRef<"SubserviceOrganization", 'SubserviceProviderType'>;
}
export type SubserviceOrganizationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SubserviceOrganizationSelect<ExtArgs> | null;
    omit?: Prisma.SubserviceOrganizationOmit<ExtArgs> | null;
    include?: Prisma.SubserviceOrganizationInclude<ExtArgs> | null;
    where: Prisma.SubserviceOrganizationWhereUniqueInput;
};
export type SubserviceOrganizationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SubserviceOrganizationSelect<ExtArgs> | null;
    omit?: Prisma.SubserviceOrganizationOmit<ExtArgs> | null;
    include?: Prisma.SubserviceOrganizationInclude<ExtArgs> | null;
    where: Prisma.SubserviceOrganizationWhereUniqueInput;
};
export type SubserviceOrganizationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SubserviceOrganizationSelect<ExtArgs> | null;
    omit?: Prisma.SubserviceOrganizationOmit<ExtArgs> | null;
    include?: Prisma.SubserviceOrganizationInclude<ExtArgs> | null;
    where?: Prisma.SubserviceOrganizationWhereInput;
    orderBy?: Prisma.SubserviceOrganizationOrderByWithRelationInput | Prisma.SubserviceOrganizationOrderByWithRelationInput[];
    cursor?: Prisma.SubserviceOrganizationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SubserviceOrganizationScalarFieldEnum | Prisma.SubserviceOrganizationScalarFieldEnum[];
};
export type SubserviceOrganizationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SubserviceOrganizationSelect<ExtArgs> | null;
    omit?: Prisma.SubserviceOrganizationOmit<ExtArgs> | null;
    include?: Prisma.SubserviceOrganizationInclude<ExtArgs> | null;
    where?: Prisma.SubserviceOrganizationWhereInput;
    orderBy?: Prisma.SubserviceOrganizationOrderByWithRelationInput | Prisma.SubserviceOrganizationOrderByWithRelationInput[];
    cursor?: Prisma.SubserviceOrganizationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SubserviceOrganizationScalarFieldEnum | Prisma.SubserviceOrganizationScalarFieldEnum[];
};
export type SubserviceOrganizationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SubserviceOrganizationSelect<ExtArgs> | null;
    omit?: Prisma.SubserviceOrganizationOmit<ExtArgs> | null;
    include?: Prisma.SubserviceOrganizationInclude<ExtArgs> | null;
    where?: Prisma.SubserviceOrganizationWhereInput;
    orderBy?: Prisma.SubserviceOrganizationOrderByWithRelationInput | Prisma.SubserviceOrganizationOrderByWithRelationInput[];
    cursor?: Prisma.SubserviceOrganizationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SubserviceOrganizationScalarFieldEnum | Prisma.SubserviceOrganizationScalarFieldEnum[];
};
export type SubserviceOrganizationCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SubserviceOrganizationSelect<ExtArgs> | null;
    omit?: Prisma.SubserviceOrganizationOmit<ExtArgs> | null;
    include?: Prisma.SubserviceOrganizationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SubserviceOrganizationCreateInput, Prisma.SubserviceOrganizationUncheckedCreateInput>;
};
export type SubserviceOrganizationCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SubserviceOrganizationCreateManyInput | Prisma.SubserviceOrganizationCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SubserviceOrganizationCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SubserviceOrganizationSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SubserviceOrganizationOmit<ExtArgs> | null;
    data: Prisma.SubserviceOrganizationCreateManyInput | Prisma.SubserviceOrganizationCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.SubserviceOrganizationIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type SubserviceOrganizationUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SubserviceOrganizationSelect<ExtArgs> | null;
    omit?: Prisma.SubserviceOrganizationOmit<ExtArgs> | null;
    include?: Prisma.SubserviceOrganizationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SubserviceOrganizationUpdateInput, Prisma.SubserviceOrganizationUncheckedUpdateInput>;
    where: Prisma.SubserviceOrganizationWhereUniqueInput;
};
export type SubserviceOrganizationUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SubserviceOrganizationUpdateManyMutationInput, Prisma.SubserviceOrganizationUncheckedUpdateManyInput>;
    where?: Prisma.SubserviceOrganizationWhereInput;
    limit?: number;
};
export type SubserviceOrganizationUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SubserviceOrganizationSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SubserviceOrganizationOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SubserviceOrganizationUpdateManyMutationInput, Prisma.SubserviceOrganizationUncheckedUpdateManyInput>;
    where?: Prisma.SubserviceOrganizationWhereInput;
    limit?: number;
    include?: Prisma.SubserviceOrganizationIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type SubserviceOrganizationUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SubserviceOrganizationSelect<ExtArgs> | null;
    omit?: Prisma.SubserviceOrganizationOmit<ExtArgs> | null;
    include?: Prisma.SubserviceOrganizationInclude<ExtArgs> | null;
    where: Prisma.SubserviceOrganizationWhereUniqueInput;
    create: Prisma.XOR<Prisma.SubserviceOrganizationCreateInput, Prisma.SubserviceOrganizationUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SubserviceOrganizationUpdateInput, Prisma.SubserviceOrganizationUncheckedUpdateInput>;
};
export type SubserviceOrganizationDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SubserviceOrganizationSelect<ExtArgs> | null;
    omit?: Prisma.SubserviceOrganizationOmit<ExtArgs> | null;
    include?: Prisma.SubserviceOrganizationInclude<ExtArgs> | null;
    where: Prisma.SubserviceOrganizationWhereUniqueInput;
};
export type SubserviceOrganizationDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SubserviceOrganizationWhereInput;
    limit?: number;
};
export type SubserviceOrganization$csocsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CsocSelect<ExtArgs> | null;
    omit?: Prisma.CsocOmit<ExtArgs> | null;
    include?: Prisma.CsocInclude<ExtArgs> | null;
    where?: Prisma.CsocWhereInput;
    orderBy?: Prisma.CsocOrderByWithRelationInput | Prisma.CsocOrderByWithRelationInput[];
    cursor?: Prisma.CsocWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CsocScalarFieldEnum | Prisma.CsocScalarFieldEnum[];
};
export type SubserviceOrganizationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SubserviceOrganizationSelect<ExtArgs> | null;
    omit?: Prisma.SubserviceOrganizationOmit<ExtArgs> | null;
    include?: Prisma.SubserviceOrganizationInclude<ExtArgs> | null;
};
export {};
