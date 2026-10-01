import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ApiKeyModel = runtime.Types.Result.DefaultSelection<Prisma.$ApiKeyPayload>;
export type AggregateApiKey = {
    _count: ApiKeyCountAggregateOutputType | null;
    _min: ApiKeyMinAggregateOutputType | null;
    _max: ApiKeyMaxAggregateOutputType | null;
};
export type ApiKeyMinAggregateOutputType = {
    id: string | null;
    companyId: string | null;
    createdBy: string | null;
    name: string | null;
    keyHash: string | null;
    status: $Enums.ApiKeyStatus | null;
    lastRotatedAt: Date | null;
};
export type ApiKeyMaxAggregateOutputType = {
    id: string | null;
    companyId: string | null;
    createdBy: string | null;
    name: string | null;
    keyHash: string | null;
    status: $Enums.ApiKeyStatus | null;
    lastRotatedAt: Date | null;
};
export type ApiKeyCountAggregateOutputType = {
    id: number;
    companyId: number;
    createdBy: number;
    name: number;
    keyHash: number;
    status: number;
    lastRotatedAt: number;
    _all: number;
};
export type ApiKeyMinAggregateInputType = {
    id?: true;
    companyId?: true;
    createdBy?: true;
    name?: true;
    keyHash?: true;
    status?: true;
    lastRotatedAt?: true;
};
export type ApiKeyMaxAggregateInputType = {
    id?: true;
    companyId?: true;
    createdBy?: true;
    name?: true;
    keyHash?: true;
    status?: true;
    lastRotatedAt?: true;
};
export type ApiKeyCountAggregateInputType = {
    id?: true;
    companyId?: true;
    createdBy?: true;
    name?: true;
    keyHash?: true;
    status?: true;
    lastRotatedAt?: true;
    _all?: true;
};
export type ApiKeyAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ApiKeyWhereInput;
    orderBy?: Prisma.ApiKeyOrderByWithRelationInput | Prisma.ApiKeyOrderByWithRelationInput[];
    cursor?: Prisma.ApiKeyWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ApiKeyCountAggregateInputType;
    _min?: ApiKeyMinAggregateInputType;
    _max?: ApiKeyMaxAggregateInputType;
};
export type GetApiKeyAggregateType<T extends ApiKeyAggregateArgs> = {
    [P in keyof T & keyof AggregateApiKey]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateApiKey[P]> : Prisma.GetScalarType<T[P], AggregateApiKey[P]>;
};
export type ApiKeyGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ApiKeyWhereInput;
    orderBy?: Prisma.ApiKeyOrderByWithAggregationInput | Prisma.ApiKeyOrderByWithAggregationInput[];
    by: Prisma.ApiKeyScalarFieldEnum[] | Prisma.ApiKeyScalarFieldEnum;
    having?: Prisma.ApiKeyScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ApiKeyCountAggregateInputType | true;
    _min?: ApiKeyMinAggregateInputType;
    _max?: ApiKeyMaxAggregateInputType;
};
export type ApiKeyGroupByOutputType = {
    id: string;
    companyId: string;
    createdBy: string;
    name: string;
    keyHash: string;
    status: $Enums.ApiKeyStatus;
    lastRotatedAt: Date;
    _count: ApiKeyCountAggregateOutputType | null;
    _min: ApiKeyMinAggregateOutputType | null;
    _max: ApiKeyMaxAggregateOutputType | null;
};
type GetApiKeyGroupByPayload<T extends ApiKeyGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ApiKeyGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ApiKeyGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ApiKeyGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ApiKeyGroupByOutputType[P]>;
}>>;
export type ApiKeyWhereInput = {
    AND?: Prisma.ApiKeyWhereInput | Prisma.ApiKeyWhereInput[];
    OR?: Prisma.ApiKeyWhereInput[];
    NOT?: Prisma.ApiKeyWhereInput | Prisma.ApiKeyWhereInput[];
    id?: Prisma.UuidFilter<"ApiKey"> | string;
    companyId?: Prisma.UuidFilter<"ApiKey"> | string;
    createdBy?: Prisma.UuidFilter<"ApiKey"> | string;
    name?: Prisma.StringFilter<"ApiKey"> | string;
    keyHash?: Prisma.StringFilter<"ApiKey"> | string;
    status?: Prisma.EnumApiKeyStatusFilter<"ApiKey"> | $Enums.ApiKeyStatus;
    lastRotatedAt?: Prisma.DateTimeFilter<"ApiKey"> | Date | string;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    createdByUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type ApiKeyOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    createdBy?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    keyHash?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    lastRotatedAt?: Prisma.SortOrder;
    company?: Prisma.CompanyOrderByWithRelationInput;
    createdByUser?: Prisma.UserOrderByWithRelationInput;
};
export type ApiKeyWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    keyHash?: string;
    AND?: Prisma.ApiKeyWhereInput | Prisma.ApiKeyWhereInput[];
    OR?: Prisma.ApiKeyWhereInput[];
    NOT?: Prisma.ApiKeyWhereInput | Prisma.ApiKeyWhereInput[];
    companyId?: Prisma.UuidFilter<"ApiKey"> | string;
    createdBy?: Prisma.UuidFilter<"ApiKey"> | string;
    name?: Prisma.StringFilter<"ApiKey"> | string;
    status?: Prisma.EnumApiKeyStatusFilter<"ApiKey"> | $Enums.ApiKeyStatus;
    lastRotatedAt?: Prisma.DateTimeFilter<"ApiKey"> | Date | string;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    createdByUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id" | "keyHash">;
export type ApiKeyOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    createdBy?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    keyHash?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    lastRotatedAt?: Prisma.SortOrder;
    _count?: Prisma.ApiKeyCountOrderByAggregateInput;
    _max?: Prisma.ApiKeyMaxOrderByAggregateInput;
    _min?: Prisma.ApiKeyMinOrderByAggregateInput;
};
export type ApiKeyScalarWhereWithAggregatesInput = {
    AND?: Prisma.ApiKeyScalarWhereWithAggregatesInput | Prisma.ApiKeyScalarWhereWithAggregatesInput[];
    OR?: Prisma.ApiKeyScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ApiKeyScalarWhereWithAggregatesInput | Prisma.ApiKeyScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ApiKey"> | string;
    companyId?: Prisma.UuidWithAggregatesFilter<"ApiKey"> | string;
    createdBy?: Prisma.UuidWithAggregatesFilter<"ApiKey"> | string;
    name?: Prisma.StringWithAggregatesFilter<"ApiKey"> | string;
    keyHash?: Prisma.StringWithAggregatesFilter<"ApiKey"> | string;
    status?: Prisma.EnumApiKeyStatusWithAggregatesFilter<"ApiKey"> | $Enums.ApiKeyStatus;
    lastRotatedAt?: Prisma.DateTimeWithAggregatesFilter<"ApiKey"> | Date | string;
};
export type ApiKeyCreateInput = {
    id?: string;
    name: string;
    keyHash: string;
    status?: $Enums.ApiKeyStatus;
    lastRotatedAt: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutApiKeysInput;
    createdByUser: Prisma.UserCreateNestedOneWithoutApiKeysCreatedInput;
};
export type ApiKeyUncheckedCreateInput = {
    id?: string;
    companyId: string;
    createdBy: string;
    name: string;
    keyHash: string;
    status?: $Enums.ApiKeyStatus;
    lastRotatedAt: Date | string;
};
export type ApiKeyUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    keyHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumApiKeyStatusFieldUpdateOperationsInput | $Enums.ApiKeyStatus;
    lastRotatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutApiKeysNestedInput;
    createdByUser?: Prisma.UserUpdateOneRequiredWithoutApiKeysCreatedNestedInput;
};
export type ApiKeyUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdBy?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    keyHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumApiKeyStatusFieldUpdateOperationsInput | $Enums.ApiKeyStatus;
    lastRotatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ApiKeyCreateManyInput = {
    id?: string;
    companyId: string;
    createdBy: string;
    name: string;
    keyHash: string;
    status?: $Enums.ApiKeyStatus;
    lastRotatedAt: Date | string;
};
export type ApiKeyUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    keyHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumApiKeyStatusFieldUpdateOperationsInput | $Enums.ApiKeyStatus;
    lastRotatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ApiKeyUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdBy?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    keyHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumApiKeyStatusFieldUpdateOperationsInput | $Enums.ApiKeyStatus;
    lastRotatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ApiKeyListRelationFilter = {
    every?: Prisma.ApiKeyWhereInput;
    some?: Prisma.ApiKeyWhereInput;
    none?: Prisma.ApiKeyWhereInput;
};
export type ApiKeyOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ApiKeyCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    createdBy?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    keyHash?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    lastRotatedAt?: Prisma.SortOrder;
};
export type ApiKeyMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    createdBy?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    keyHash?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    lastRotatedAt?: Prisma.SortOrder;
};
export type ApiKeyMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    createdBy?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    keyHash?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    lastRotatedAt?: Prisma.SortOrder;
};
export type ApiKeyCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.ApiKeyCreateWithoutCompanyInput, Prisma.ApiKeyUncheckedCreateWithoutCompanyInput> | Prisma.ApiKeyCreateWithoutCompanyInput[] | Prisma.ApiKeyUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.ApiKeyCreateOrConnectWithoutCompanyInput | Prisma.ApiKeyCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.ApiKeyCreateManyCompanyInputEnvelope;
    connect?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
};
export type ApiKeyUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.ApiKeyCreateWithoutCompanyInput, Prisma.ApiKeyUncheckedCreateWithoutCompanyInput> | Prisma.ApiKeyCreateWithoutCompanyInput[] | Prisma.ApiKeyUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.ApiKeyCreateOrConnectWithoutCompanyInput | Prisma.ApiKeyCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.ApiKeyCreateManyCompanyInputEnvelope;
    connect?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
};
export type ApiKeyUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.ApiKeyCreateWithoutCompanyInput, Prisma.ApiKeyUncheckedCreateWithoutCompanyInput> | Prisma.ApiKeyCreateWithoutCompanyInput[] | Prisma.ApiKeyUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.ApiKeyCreateOrConnectWithoutCompanyInput | Prisma.ApiKeyCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.ApiKeyUpsertWithWhereUniqueWithoutCompanyInput | Prisma.ApiKeyUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.ApiKeyCreateManyCompanyInputEnvelope;
    set?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    disconnect?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    delete?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    connect?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    update?: Prisma.ApiKeyUpdateWithWhereUniqueWithoutCompanyInput | Prisma.ApiKeyUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.ApiKeyUpdateManyWithWhereWithoutCompanyInput | Prisma.ApiKeyUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.ApiKeyScalarWhereInput | Prisma.ApiKeyScalarWhereInput[];
};
export type ApiKeyUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.ApiKeyCreateWithoutCompanyInput, Prisma.ApiKeyUncheckedCreateWithoutCompanyInput> | Prisma.ApiKeyCreateWithoutCompanyInput[] | Prisma.ApiKeyUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.ApiKeyCreateOrConnectWithoutCompanyInput | Prisma.ApiKeyCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.ApiKeyUpsertWithWhereUniqueWithoutCompanyInput | Prisma.ApiKeyUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.ApiKeyCreateManyCompanyInputEnvelope;
    set?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    disconnect?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    delete?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    connect?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    update?: Prisma.ApiKeyUpdateWithWhereUniqueWithoutCompanyInput | Prisma.ApiKeyUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.ApiKeyUpdateManyWithWhereWithoutCompanyInput | Prisma.ApiKeyUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.ApiKeyScalarWhereInput | Prisma.ApiKeyScalarWhereInput[];
};
export type ApiKeyCreateNestedManyWithoutCreatedByUserInput = {
    create?: Prisma.XOR<Prisma.ApiKeyCreateWithoutCreatedByUserInput, Prisma.ApiKeyUncheckedCreateWithoutCreatedByUserInput> | Prisma.ApiKeyCreateWithoutCreatedByUserInput[] | Prisma.ApiKeyUncheckedCreateWithoutCreatedByUserInput[];
    connectOrCreate?: Prisma.ApiKeyCreateOrConnectWithoutCreatedByUserInput | Prisma.ApiKeyCreateOrConnectWithoutCreatedByUserInput[];
    createMany?: Prisma.ApiKeyCreateManyCreatedByUserInputEnvelope;
    connect?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
};
export type ApiKeyUncheckedCreateNestedManyWithoutCreatedByUserInput = {
    create?: Prisma.XOR<Prisma.ApiKeyCreateWithoutCreatedByUserInput, Prisma.ApiKeyUncheckedCreateWithoutCreatedByUserInput> | Prisma.ApiKeyCreateWithoutCreatedByUserInput[] | Prisma.ApiKeyUncheckedCreateWithoutCreatedByUserInput[];
    connectOrCreate?: Prisma.ApiKeyCreateOrConnectWithoutCreatedByUserInput | Prisma.ApiKeyCreateOrConnectWithoutCreatedByUserInput[];
    createMany?: Prisma.ApiKeyCreateManyCreatedByUserInputEnvelope;
    connect?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
};
export type ApiKeyUpdateManyWithoutCreatedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.ApiKeyCreateWithoutCreatedByUserInput, Prisma.ApiKeyUncheckedCreateWithoutCreatedByUserInput> | Prisma.ApiKeyCreateWithoutCreatedByUserInput[] | Prisma.ApiKeyUncheckedCreateWithoutCreatedByUserInput[];
    connectOrCreate?: Prisma.ApiKeyCreateOrConnectWithoutCreatedByUserInput | Prisma.ApiKeyCreateOrConnectWithoutCreatedByUserInput[];
    upsert?: Prisma.ApiKeyUpsertWithWhereUniqueWithoutCreatedByUserInput | Prisma.ApiKeyUpsertWithWhereUniqueWithoutCreatedByUserInput[];
    createMany?: Prisma.ApiKeyCreateManyCreatedByUserInputEnvelope;
    set?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    disconnect?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    delete?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    connect?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    update?: Prisma.ApiKeyUpdateWithWhereUniqueWithoutCreatedByUserInput | Prisma.ApiKeyUpdateWithWhereUniqueWithoutCreatedByUserInput[];
    updateMany?: Prisma.ApiKeyUpdateManyWithWhereWithoutCreatedByUserInput | Prisma.ApiKeyUpdateManyWithWhereWithoutCreatedByUserInput[];
    deleteMany?: Prisma.ApiKeyScalarWhereInput | Prisma.ApiKeyScalarWhereInput[];
};
export type ApiKeyUncheckedUpdateManyWithoutCreatedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.ApiKeyCreateWithoutCreatedByUserInput, Prisma.ApiKeyUncheckedCreateWithoutCreatedByUserInput> | Prisma.ApiKeyCreateWithoutCreatedByUserInput[] | Prisma.ApiKeyUncheckedCreateWithoutCreatedByUserInput[];
    connectOrCreate?: Prisma.ApiKeyCreateOrConnectWithoutCreatedByUserInput | Prisma.ApiKeyCreateOrConnectWithoutCreatedByUserInput[];
    upsert?: Prisma.ApiKeyUpsertWithWhereUniqueWithoutCreatedByUserInput | Prisma.ApiKeyUpsertWithWhereUniqueWithoutCreatedByUserInput[];
    createMany?: Prisma.ApiKeyCreateManyCreatedByUserInputEnvelope;
    set?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    disconnect?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    delete?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    connect?: Prisma.ApiKeyWhereUniqueInput | Prisma.ApiKeyWhereUniqueInput[];
    update?: Prisma.ApiKeyUpdateWithWhereUniqueWithoutCreatedByUserInput | Prisma.ApiKeyUpdateWithWhereUniqueWithoutCreatedByUserInput[];
    updateMany?: Prisma.ApiKeyUpdateManyWithWhereWithoutCreatedByUserInput | Prisma.ApiKeyUpdateManyWithWhereWithoutCreatedByUserInput[];
    deleteMany?: Prisma.ApiKeyScalarWhereInput | Prisma.ApiKeyScalarWhereInput[];
};
export type EnumApiKeyStatusFieldUpdateOperationsInput = {
    set?: $Enums.ApiKeyStatus;
};
export type ApiKeyCreateWithoutCompanyInput = {
    id?: string;
    name: string;
    keyHash: string;
    status?: $Enums.ApiKeyStatus;
    lastRotatedAt: Date | string;
    createdByUser: Prisma.UserCreateNestedOneWithoutApiKeysCreatedInput;
};
export type ApiKeyUncheckedCreateWithoutCompanyInput = {
    id?: string;
    createdBy: string;
    name: string;
    keyHash: string;
    status?: $Enums.ApiKeyStatus;
    lastRotatedAt: Date | string;
};
export type ApiKeyCreateOrConnectWithoutCompanyInput = {
    where: Prisma.ApiKeyWhereUniqueInput;
    create: Prisma.XOR<Prisma.ApiKeyCreateWithoutCompanyInput, Prisma.ApiKeyUncheckedCreateWithoutCompanyInput>;
};
export type ApiKeyCreateManyCompanyInputEnvelope = {
    data: Prisma.ApiKeyCreateManyCompanyInput | Prisma.ApiKeyCreateManyCompanyInput[];
    skipDuplicates?: boolean;
};
export type ApiKeyUpsertWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.ApiKeyWhereUniqueInput;
    update: Prisma.XOR<Prisma.ApiKeyUpdateWithoutCompanyInput, Prisma.ApiKeyUncheckedUpdateWithoutCompanyInput>;
    create: Prisma.XOR<Prisma.ApiKeyCreateWithoutCompanyInput, Prisma.ApiKeyUncheckedCreateWithoutCompanyInput>;
};
export type ApiKeyUpdateWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.ApiKeyWhereUniqueInput;
    data: Prisma.XOR<Prisma.ApiKeyUpdateWithoutCompanyInput, Prisma.ApiKeyUncheckedUpdateWithoutCompanyInput>;
};
export type ApiKeyUpdateManyWithWhereWithoutCompanyInput = {
    where: Prisma.ApiKeyScalarWhereInput;
    data: Prisma.XOR<Prisma.ApiKeyUpdateManyMutationInput, Prisma.ApiKeyUncheckedUpdateManyWithoutCompanyInput>;
};
export type ApiKeyScalarWhereInput = {
    AND?: Prisma.ApiKeyScalarWhereInput | Prisma.ApiKeyScalarWhereInput[];
    OR?: Prisma.ApiKeyScalarWhereInput[];
    NOT?: Prisma.ApiKeyScalarWhereInput | Prisma.ApiKeyScalarWhereInput[];
    id?: Prisma.UuidFilter<"ApiKey"> | string;
    companyId?: Prisma.UuidFilter<"ApiKey"> | string;
    createdBy?: Prisma.UuidFilter<"ApiKey"> | string;
    name?: Prisma.StringFilter<"ApiKey"> | string;
    keyHash?: Prisma.StringFilter<"ApiKey"> | string;
    status?: Prisma.EnumApiKeyStatusFilter<"ApiKey"> | $Enums.ApiKeyStatus;
    lastRotatedAt?: Prisma.DateTimeFilter<"ApiKey"> | Date | string;
};
export type ApiKeyCreateWithoutCreatedByUserInput = {
    id?: string;
    name: string;
    keyHash: string;
    status?: $Enums.ApiKeyStatus;
    lastRotatedAt: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutApiKeysInput;
};
export type ApiKeyUncheckedCreateWithoutCreatedByUserInput = {
    id?: string;
    companyId: string;
    name: string;
    keyHash: string;
    status?: $Enums.ApiKeyStatus;
    lastRotatedAt: Date | string;
};
export type ApiKeyCreateOrConnectWithoutCreatedByUserInput = {
    where: Prisma.ApiKeyWhereUniqueInput;
    create: Prisma.XOR<Prisma.ApiKeyCreateWithoutCreatedByUserInput, Prisma.ApiKeyUncheckedCreateWithoutCreatedByUserInput>;
};
export type ApiKeyCreateManyCreatedByUserInputEnvelope = {
    data: Prisma.ApiKeyCreateManyCreatedByUserInput | Prisma.ApiKeyCreateManyCreatedByUserInput[];
    skipDuplicates?: boolean;
};
export type ApiKeyUpsertWithWhereUniqueWithoutCreatedByUserInput = {
    where: Prisma.ApiKeyWhereUniqueInput;
    update: Prisma.XOR<Prisma.ApiKeyUpdateWithoutCreatedByUserInput, Prisma.ApiKeyUncheckedUpdateWithoutCreatedByUserInput>;
    create: Prisma.XOR<Prisma.ApiKeyCreateWithoutCreatedByUserInput, Prisma.ApiKeyUncheckedCreateWithoutCreatedByUserInput>;
};
export type ApiKeyUpdateWithWhereUniqueWithoutCreatedByUserInput = {
    where: Prisma.ApiKeyWhereUniqueInput;
    data: Prisma.XOR<Prisma.ApiKeyUpdateWithoutCreatedByUserInput, Prisma.ApiKeyUncheckedUpdateWithoutCreatedByUserInput>;
};
export type ApiKeyUpdateManyWithWhereWithoutCreatedByUserInput = {
    where: Prisma.ApiKeyScalarWhereInput;
    data: Prisma.XOR<Prisma.ApiKeyUpdateManyMutationInput, Prisma.ApiKeyUncheckedUpdateManyWithoutCreatedByUserInput>;
};
export type ApiKeyCreateManyCompanyInput = {
    id?: string;
    createdBy: string;
    name: string;
    keyHash: string;
    status?: $Enums.ApiKeyStatus;
    lastRotatedAt: Date | string;
};
export type ApiKeyUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    keyHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumApiKeyStatusFieldUpdateOperationsInput | $Enums.ApiKeyStatus;
    lastRotatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdByUser?: Prisma.UserUpdateOneRequiredWithoutApiKeysCreatedNestedInput;
};
export type ApiKeyUncheckedUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    createdBy?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    keyHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumApiKeyStatusFieldUpdateOperationsInput | $Enums.ApiKeyStatus;
    lastRotatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ApiKeyUncheckedUpdateManyWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    createdBy?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    keyHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumApiKeyStatusFieldUpdateOperationsInput | $Enums.ApiKeyStatus;
    lastRotatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ApiKeyCreateManyCreatedByUserInput = {
    id?: string;
    companyId: string;
    name: string;
    keyHash: string;
    status?: $Enums.ApiKeyStatus;
    lastRotatedAt: Date | string;
};
export type ApiKeyUpdateWithoutCreatedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    keyHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumApiKeyStatusFieldUpdateOperationsInput | $Enums.ApiKeyStatus;
    lastRotatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutApiKeysNestedInput;
};
export type ApiKeyUncheckedUpdateWithoutCreatedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    keyHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumApiKeyStatusFieldUpdateOperationsInput | $Enums.ApiKeyStatus;
    lastRotatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ApiKeyUncheckedUpdateManyWithoutCreatedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    keyHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumApiKeyStatusFieldUpdateOperationsInput | $Enums.ApiKeyStatus;
    lastRotatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ApiKeySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    createdBy?: boolean;
    name?: boolean;
    keyHash?: boolean;
    status?: boolean;
    lastRotatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    createdByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["apiKey"]>;
export type ApiKeySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    createdBy?: boolean;
    name?: boolean;
    keyHash?: boolean;
    status?: boolean;
    lastRotatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    createdByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["apiKey"]>;
export type ApiKeySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    createdBy?: boolean;
    name?: boolean;
    keyHash?: boolean;
    status?: boolean;
    lastRotatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    createdByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["apiKey"]>;
export type ApiKeySelectScalar = {
    id?: boolean;
    companyId?: boolean;
    createdBy?: boolean;
    name?: boolean;
    keyHash?: boolean;
    status?: boolean;
    lastRotatedAt?: boolean;
};
export type ApiKeyOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "companyId" | "createdBy" | "name" | "keyHash" | "status" | "lastRotatedAt", ExtArgs["result"]["apiKey"]>;
export type ApiKeyInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    createdByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ApiKeyIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    createdByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ApiKeyIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    createdByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $ApiKeyPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ApiKey";
    objects: {
        company: Prisma.$CompanyPayload<ExtArgs>;
        createdByUser: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        companyId: string;
        createdBy: string;
        name: string;
        keyHash: string;
        status: $Enums.ApiKeyStatus;
        lastRotatedAt: Date;
    }, ExtArgs["result"]["apiKey"]>;
    composites: {};
};
export type ApiKeyGetPayload<S extends boolean | null | undefined | ApiKeyDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ApiKeyPayload, S>;
export type ApiKeyCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ApiKeyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ApiKeyCountAggregateInputType | true;
};
export interface ApiKeyDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ApiKey'];
        meta: {
            name: 'ApiKey';
        };
    };
    findUnique<T extends ApiKeyFindUniqueArgs>(args: Prisma.SelectSubset<T, ApiKeyFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ApiKeyClient<runtime.Types.Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ApiKeyFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ApiKeyFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ApiKeyClient<runtime.Types.Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ApiKeyFindFirstArgs>(args?: Prisma.SelectSubset<T, ApiKeyFindFirstArgs<ExtArgs>>): Prisma.Prisma__ApiKeyClient<runtime.Types.Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ApiKeyFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ApiKeyFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ApiKeyClient<runtime.Types.Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ApiKeyFindManyArgs>(args?: Prisma.SelectSubset<T, ApiKeyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ApiKeyCreateArgs>(args: Prisma.SelectSubset<T, ApiKeyCreateArgs<ExtArgs>>): Prisma.Prisma__ApiKeyClient<runtime.Types.Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ApiKeyCreateManyArgs>(args?: Prisma.SelectSubset<T, ApiKeyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ApiKeyCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ApiKeyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ApiKeyDeleteArgs>(args: Prisma.SelectSubset<T, ApiKeyDeleteArgs<ExtArgs>>): Prisma.Prisma__ApiKeyClient<runtime.Types.Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ApiKeyUpdateArgs>(args: Prisma.SelectSubset<T, ApiKeyUpdateArgs<ExtArgs>>): Prisma.Prisma__ApiKeyClient<runtime.Types.Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ApiKeyDeleteManyArgs>(args?: Prisma.SelectSubset<T, ApiKeyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ApiKeyUpdateManyArgs>(args: Prisma.SelectSubset<T, ApiKeyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ApiKeyUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ApiKeyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ApiKeyUpsertArgs>(args: Prisma.SelectSubset<T, ApiKeyUpsertArgs<ExtArgs>>): Prisma.Prisma__ApiKeyClient<runtime.Types.Result.GetResult<Prisma.$ApiKeyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ApiKeyCountArgs>(args?: Prisma.Subset<T, ApiKeyCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ApiKeyCountAggregateOutputType> : number>;
    aggregate<T extends ApiKeyAggregateArgs>(args: Prisma.Subset<T, ApiKeyAggregateArgs>): Prisma.PrismaPromise<GetApiKeyAggregateType<T>>;
    groupBy<T extends ApiKeyGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ApiKeyGroupByArgs['orderBy'];
    } : {
        orderBy?: ApiKeyGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ApiKeyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApiKeyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ApiKeyFieldRefs;
}
export interface Prisma__ApiKeyClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    company<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    createdByUser<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ApiKeyFieldRefs {
    readonly id: Prisma.FieldRef<"ApiKey", 'String'>;
    readonly companyId: Prisma.FieldRef<"ApiKey", 'String'>;
    readonly createdBy: Prisma.FieldRef<"ApiKey", 'String'>;
    readonly name: Prisma.FieldRef<"ApiKey", 'String'>;
    readonly keyHash: Prisma.FieldRef<"ApiKey", 'String'>;
    readonly status: Prisma.FieldRef<"ApiKey", 'ApiKeyStatus'>;
    readonly lastRotatedAt: Prisma.FieldRef<"ApiKey", 'DateTime'>;
}
export type ApiKeyFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ApiKeySelect<ExtArgs> | null;
    omit?: Prisma.ApiKeyOmit<ExtArgs> | null;
    include?: Prisma.ApiKeyInclude<ExtArgs> | null;
    where: Prisma.ApiKeyWhereUniqueInput;
};
export type ApiKeyFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ApiKeySelect<ExtArgs> | null;
    omit?: Prisma.ApiKeyOmit<ExtArgs> | null;
    include?: Prisma.ApiKeyInclude<ExtArgs> | null;
    where: Prisma.ApiKeyWhereUniqueInput;
};
export type ApiKeyFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ApiKeySelect<ExtArgs> | null;
    omit?: Prisma.ApiKeyOmit<ExtArgs> | null;
    include?: Prisma.ApiKeyInclude<ExtArgs> | null;
    where?: Prisma.ApiKeyWhereInput;
    orderBy?: Prisma.ApiKeyOrderByWithRelationInput | Prisma.ApiKeyOrderByWithRelationInput[];
    cursor?: Prisma.ApiKeyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ApiKeyScalarFieldEnum | Prisma.ApiKeyScalarFieldEnum[];
};
export type ApiKeyFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ApiKeySelect<ExtArgs> | null;
    omit?: Prisma.ApiKeyOmit<ExtArgs> | null;
    include?: Prisma.ApiKeyInclude<ExtArgs> | null;
    where?: Prisma.ApiKeyWhereInput;
    orderBy?: Prisma.ApiKeyOrderByWithRelationInput | Prisma.ApiKeyOrderByWithRelationInput[];
    cursor?: Prisma.ApiKeyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ApiKeyScalarFieldEnum | Prisma.ApiKeyScalarFieldEnum[];
};
export type ApiKeyFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ApiKeySelect<ExtArgs> | null;
    omit?: Prisma.ApiKeyOmit<ExtArgs> | null;
    include?: Prisma.ApiKeyInclude<ExtArgs> | null;
    where?: Prisma.ApiKeyWhereInput;
    orderBy?: Prisma.ApiKeyOrderByWithRelationInput | Prisma.ApiKeyOrderByWithRelationInput[];
    cursor?: Prisma.ApiKeyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ApiKeyScalarFieldEnum | Prisma.ApiKeyScalarFieldEnum[];
};
export type ApiKeyCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ApiKeySelect<ExtArgs> | null;
    omit?: Prisma.ApiKeyOmit<ExtArgs> | null;
    include?: Prisma.ApiKeyInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ApiKeyCreateInput, Prisma.ApiKeyUncheckedCreateInput>;
};
export type ApiKeyCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ApiKeyCreateManyInput | Prisma.ApiKeyCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ApiKeyCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ApiKeySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ApiKeyOmit<ExtArgs> | null;
    data: Prisma.ApiKeyCreateManyInput | Prisma.ApiKeyCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ApiKeyIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ApiKeyUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ApiKeySelect<ExtArgs> | null;
    omit?: Prisma.ApiKeyOmit<ExtArgs> | null;
    include?: Prisma.ApiKeyInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ApiKeyUpdateInput, Prisma.ApiKeyUncheckedUpdateInput>;
    where: Prisma.ApiKeyWhereUniqueInput;
};
export type ApiKeyUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ApiKeyUpdateManyMutationInput, Prisma.ApiKeyUncheckedUpdateManyInput>;
    where?: Prisma.ApiKeyWhereInput;
    limit?: number;
};
export type ApiKeyUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ApiKeySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ApiKeyOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ApiKeyUpdateManyMutationInput, Prisma.ApiKeyUncheckedUpdateManyInput>;
    where?: Prisma.ApiKeyWhereInput;
    limit?: number;
    include?: Prisma.ApiKeyIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ApiKeyUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ApiKeySelect<ExtArgs> | null;
    omit?: Prisma.ApiKeyOmit<ExtArgs> | null;
    include?: Prisma.ApiKeyInclude<ExtArgs> | null;
    where: Prisma.ApiKeyWhereUniqueInput;
    create: Prisma.XOR<Prisma.ApiKeyCreateInput, Prisma.ApiKeyUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ApiKeyUpdateInput, Prisma.ApiKeyUncheckedUpdateInput>;
};
export type ApiKeyDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ApiKeySelect<ExtArgs> | null;
    omit?: Prisma.ApiKeyOmit<ExtArgs> | null;
    include?: Prisma.ApiKeyInclude<ExtArgs> | null;
    where: Prisma.ApiKeyWhereUniqueInput;
};
export type ApiKeyDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ApiKeyWhereInput;
    limit?: number;
};
export type ApiKeyDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ApiKeySelect<ExtArgs> | null;
    omit?: Prisma.ApiKeyOmit<ExtArgs> | null;
    include?: Prisma.ApiKeyInclude<ExtArgs> | null;
};
export {};
