import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type AccessKeyModel = runtime.Types.Result.DefaultSelection<Prisma.$AccessKeyPayload>;
export type AggregateAccessKey = {
    _count: AccessKeyCountAggregateOutputType | null;
    _min: AccessKeyMinAggregateOutputType | null;
    _max: AccessKeyMaxAggregateOutputType | null;
};
export type AccessKeyMinAggregateOutputType = {
    id: string | null;
    companyId: string | null;
    createdBy: string | null;
    codeHash: string | null;
    status: $Enums.AccessKeyStatus | null;
    expiresAt: Date | null;
    usedAt: Date | null;
};
export type AccessKeyMaxAggregateOutputType = {
    id: string | null;
    companyId: string | null;
    createdBy: string | null;
    codeHash: string | null;
    status: $Enums.AccessKeyStatus | null;
    expiresAt: Date | null;
    usedAt: Date | null;
};
export type AccessKeyCountAggregateOutputType = {
    id: number;
    companyId: number;
    createdBy: number;
    codeHash: number;
    status: number;
    expiresAt: number;
    usedAt: number;
    _all: number;
};
export type AccessKeyMinAggregateInputType = {
    id?: true;
    companyId?: true;
    createdBy?: true;
    codeHash?: true;
    status?: true;
    expiresAt?: true;
    usedAt?: true;
};
export type AccessKeyMaxAggregateInputType = {
    id?: true;
    companyId?: true;
    createdBy?: true;
    codeHash?: true;
    status?: true;
    expiresAt?: true;
    usedAt?: true;
};
export type AccessKeyCountAggregateInputType = {
    id?: true;
    companyId?: true;
    createdBy?: true;
    codeHash?: true;
    status?: true;
    expiresAt?: true;
    usedAt?: true;
    _all?: true;
};
export type AccessKeyAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AccessKeyWhereInput;
    orderBy?: Prisma.AccessKeyOrderByWithRelationInput | Prisma.AccessKeyOrderByWithRelationInput[];
    cursor?: Prisma.AccessKeyWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | AccessKeyCountAggregateInputType;
    _min?: AccessKeyMinAggregateInputType;
    _max?: AccessKeyMaxAggregateInputType;
};
export type GetAccessKeyAggregateType<T extends AccessKeyAggregateArgs> = {
    [P in keyof T & keyof AggregateAccessKey]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAccessKey[P]> : Prisma.GetScalarType<T[P], AggregateAccessKey[P]>;
};
export type AccessKeyGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AccessKeyWhereInput;
    orderBy?: Prisma.AccessKeyOrderByWithAggregationInput | Prisma.AccessKeyOrderByWithAggregationInput[];
    by: Prisma.AccessKeyScalarFieldEnum[] | Prisma.AccessKeyScalarFieldEnum;
    having?: Prisma.AccessKeyScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AccessKeyCountAggregateInputType | true;
    _min?: AccessKeyMinAggregateInputType;
    _max?: AccessKeyMaxAggregateInputType;
};
export type AccessKeyGroupByOutputType = {
    id: string;
    companyId: string;
    createdBy: string;
    codeHash: string;
    status: $Enums.AccessKeyStatus;
    expiresAt: Date;
    usedAt: Date | null;
    _count: AccessKeyCountAggregateOutputType | null;
    _min: AccessKeyMinAggregateOutputType | null;
    _max: AccessKeyMaxAggregateOutputType | null;
};
type GetAccessKeyGroupByPayload<T extends AccessKeyGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AccessKeyGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AccessKeyGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AccessKeyGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AccessKeyGroupByOutputType[P]>;
}>>;
export type AccessKeyWhereInput = {
    AND?: Prisma.AccessKeyWhereInput | Prisma.AccessKeyWhereInput[];
    OR?: Prisma.AccessKeyWhereInput[];
    NOT?: Prisma.AccessKeyWhereInput | Prisma.AccessKeyWhereInput[];
    id?: Prisma.UuidFilter<"AccessKey"> | string;
    companyId?: Prisma.UuidFilter<"AccessKey"> | string;
    createdBy?: Prisma.UuidFilter<"AccessKey"> | string;
    codeHash?: Prisma.StringFilter<"AccessKey"> | string;
    status?: Prisma.EnumAccessKeyStatusFilter<"AccessKey"> | $Enums.AccessKeyStatus;
    expiresAt?: Prisma.DateTimeFilter<"AccessKey"> | Date | string;
    usedAt?: Prisma.DateTimeNullableFilter<"AccessKey"> | Date | string | null;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    createdByUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type AccessKeyOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    createdBy?: Prisma.SortOrder;
    codeHash?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
    usedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    company?: Prisma.CompanyOrderByWithRelationInput;
    createdByUser?: Prisma.UserOrderByWithRelationInput;
};
export type AccessKeyWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    codeHash?: string;
    AND?: Prisma.AccessKeyWhereInput | Prisma.AccessKeyWhereInput[];
    OR?: Prisma.AccessKeyWhereInput[];
    NOT?: Prisma.AccessKeyWhereInput | Prisma.AccessKeyWhereInput[];
    companyId?: Prisma.UuidFilter<"AccessKey"> | string;
    createdBy?: Prisma.UuidFilter<"AccessKey"> | string;
    status?: Prisma.EnumAccessKeyStatusFilter<"AccessKey"> | $Enums.AccessKeyStatus;
    expiresAt?: Prisma.DateTimeFilter<"AccessKey"> | Date | string;
    usedAt?: Prisma.DateTimeNullableFilter<"AccessKey"> | Date | string | null;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    createdByUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id" | "codeHash">;
export type AccessKeyOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    createdBy?: Prisma.SortOrder;
    codeHash?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
    usedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.AccessKeyCountOrderByAggregateInput;
    _max?: Prisma.AccessKeyMaxOrderByAggregateInput;
    _min?: Prisma.AccessKeyMinOrderByAggregateInput;
};
export type AccessKeyScalarWhereWithAggregatesInput = {
    AND?: Prisma.AccessKeyScalarWhereWithAggregatesInput | Prisma.AccessKeyScalarWhereWithAggregatesInput[];
    OR?: Prisma.AccessKeyScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AccessKeyScalarWhereWithAggregatesInput | Prisma.AccessKeyScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"AccessKey"> | string;
    companyId?: Prisma.UuidWithAggregatesFilter<"AccessKey"> | string;
    createdBy?: Prisma.UuidWithAggregatesFilter<"AccessKey"> | string;
    codeHash?: Prisma.StringWithAggregatesFilter<"AccessKey"> | string;
    status?: Prisma.EnumAccessKeyStatusWithAggregatesFilter<"AccessKey"> | $Enums.AccessKeyStatus;
    expiresAt?: Prisma.DateTimeWithAggregatesFilter<"AccessKey"> | Date | string;
    usedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"AccessKey"> | Date | string | null;
};
export type AccessKeyCreateInput = {
    id?: string;
    codeHash: string;
    status?: $Enums.AccessKeyStatus;
    expiresAt: Date | string;
    usedAt?: Date | string | null;
    company: Prisma.CompanyCreateNestedOneWithoutAccessKeysInput;
    createdByUser: Prisma.UserCreateNestedOneWithoutAccessKeysCreatedInput;
};
export type AccessKeyUncheckedCreateInput = {
    id?: string;
    companyId: string;
    createdBy: string;
    codeHash: string;
    status?: $Enums.AccessKeyStatus;
    expiresAt: Date | string;
    usedAt?: Date | string | null;
};
export type AccessKeyUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    codeHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAccessKeyStatusFieldUpdateOperationsInput | $Enums.AccessKeyStatus;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    company?: Prisma.CompanyUpdateOneRequiredWithoutAccessKeysNestedInput;
    createdByUser?: Prisma.UserUpdateOneRequiredWithoutAccessKeysCreatedNestedInput;
};
export type AccessKeyUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdBy?: Prisma.StringFieldUpdateOperationsInput | string;
    codeHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAccessKeyStatusFieldUpdateOperationsInput | $Enums.AccessKeyStatus;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AccessKeyCreateManyInput = {
    id?: string;
    companyId: string;
    createdBy: string;
    codeHash: string;
    status?: $Enums.AccessKeyStatus;
    expiresAt: Date | string;
    usedAt?: Date | string | null;
};
export type AccessKeyUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    codeHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAccessKeyStatusFieldUpdateOperationsInput | $Enums.AccessKeyStatus;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AccessKeyUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdBy?: Prisma.StringFieldUpdateOperationsInput | string;
    codeHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAccessKeyStatusFieldUpdateOperationsInput | $Enums.AccessKeyStatus;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AccessKeyListRelationFilter = {
    every?: Prisma.AccessKeyWhereInput;
    some?: Prisma.AccessKeyWhereInput;
    none?: Prisma.AccessKeyWhereInput;
};
export type AccessKeyOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type AccessKeyCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    createdBy?: Prisma.SortOrder;
    codeHash?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
    usedAt?: Prisma.SortOrder;
};
export type AccessKeyMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    createdBy?: Prisma.SortOrder;
    codeHash?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
    usedAt?: Prisma.SortOrder;
};
export type AccessKeyMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    createdBy?: Prisma.SortOrder;
    codeHash?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
    usedAt?: Prisma.SortOrder;
};
export type AccessKeyCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.AccessKeyCreateWithoutCompanyInput, Prisma.AccessKeyUncheckedCreateWithoutCompanyInput> | Prisma.AccessKeyCreateWithoutCompanyInput[] | Prisma.AccessKeyUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.AccessKeyCreateOrConnectWithoutCompanyInput | Prisma.AccessKeyCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.AccessKeyCreateManyCompanyInputEnvelope;
    connect?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
};
export type AccessKeyUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.AccessKeyCreateWithoutCompanyInput, Prisma.AccessKeyUncheckedCreateWithoutCompanyInput> | Prisma.AccessKeyCreateWithoutCompanyInput[] | Prisma.AccessKeyUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.AccessKeyCreateOrConnectWithoutCompanyInput | Prisma.AccessKeyCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.AccessKeyCreateManyCompanyInputEnvelope;
    connect?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
};
export type AccessKeyUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.AccessKeyCreateWithoutCompanyInput, Prisma.AccessKeyUncheckedCreateWithoutCompanyInput> | Prisma.AccessKeyCreateWithoutCompanyInput[] | Prisma.AccessKeyUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.AccessKeyCreateOrConnectWithoutCompanyInput | Prisma.AccessKeyCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.AccessKeyUpsertWithWhereUniqueWithoutCompanyInput | Prisma.AccessKeyUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.AccessKeyCreateManyCompanyInputEnvelope;
    set?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    disconnect?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    delete?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    connect?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    update?: Prisma.AccessKeyUpdateWithWhereUniqueWithoutCompanyInput | Prisma.AccessKeyUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.AccessKeyUpdateManyWithWhereWithoutCompanyInput | Prisma.AccessKeyUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.AccessKeyScalarWhereInput | Prisma.AccessKeyScalarWhereInput[];
};
export type AccessKeyUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.AccessKeyCreateWithoutCompanyInput, Prisma.AccessKeyUncheckedCreateWithoutCompanyInput> | Prisma.AccessKeyCreateWithoutCompanyInput[] | Prisma.AccessKeyUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.AccessKeyCreateOrConnectWithoutCompanyInput | Prisma.AccessKeyCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.AccessKeyUpsertWithWhereUniqueWithoutCompanyInput | Prisma.AccessKeyUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.AccessKeyCreateManyCompanyInputEnvelope;
    set?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    disconnect?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    delete?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    connect?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    update?: Prisma.AccessKeyUpdateWithWhereUniqueWithoutCompanyInput | Prisma.AccessKeyUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.AccessKeyUpdateManyWithWhereWithoutCompanyInput | Prisma.AccessKeyUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.AccessKeyScalarWhereInput | Prisma.AccessKeyScalarWhereInput[];
};
export type EnumAccessKeyStatusFieldUpdateOperationsInput = {
    set?: $Enums.AccessKeyStatus;
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type AccessKeyCreateNestedManyWithoutCreatedByUserInput = {
    create?: Prisma.XOR<Prisma.AccessKeyCreateWithoutCreatedByUserInput, Prisma.AccessKeyUncheckedCreateWithoutCreatedByUserInput> | Prisma.AccessKeyCreateWithoutCreatedByUserInput[] | Prisma.AccessKeyUncheckedCreateWithoutCreatedByUserInput[];
    connectOrCreate?: Prisma.AccessKeyCreateOrConnectWithoutCreatedByUserInput | Prisma.AccessKeyCreateOrConnectWithoutCreatedByUserInput[];
    createMany?: Prisma.AccessKeyCreateManyCreatedByUserInputEnvelope;
    connect?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
};
export type AccessKeyUncheckedCreateNestedManyWithoutCreatedByUserInput = {
    create?: Prisma.XOR<Prisma.AccessKeyCreateWithoutCreatedByUserInput, Prisma.AccessKeyUncheckedCreateWithoutCreatedByUserInput> | Prisma.AccessKeyCreateWithoutCreatedByUserInput[] | Prisma.AccessKeyUncheckedCreateWithoutCreatedByUserInput[];
    connectOrCreate?: Prisma.AccessKeyCreateOrConnectWithoutCreatedByUserInput | Prisma.AccessKeyCreateOrConnectWithoutCreatedByUserInput[];
    createMany?: Prisma.AccessKeyCreateManyCreatedByUserInputEnvelope;
    connect?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
};
export type AccessKeyUpdateManyWithoutCreatedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.AccessKeyCreateWithoutCreatedByUserInput, Prisma.AccessKeyUncheckedCreateWithoutCreatedByUserInput> | Prisma.AccessKeyCreateWithoutCreatedByUserInput[] | Prisma.AccessKeyUncheckedCreateWithoutCreatedByUserInput[];
    connectOrCreate?: Prisma.AccessKeyCreateOrConnectWithoutCreatedByUserInput | Prisma.AccessKeyCreateOrConnectWithoutCreatedByUserInput[];
    upsert?: Prisma.AccessKeyUpsertWithWhereUniqueWithoutCreatedByUserInput | Prisma.AccessKeyUpsertWithWhereUniqueWithoutCreatedByUserInput[];
    createMany?: Prisma.AccessKeyCreateManyCreatedByUserInputEnvelope;
    set?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    disconnect?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    delete?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    connect?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    update?: Prisma.AccessKeyUpdateWithWhereUniqueWithoutCreatedByUserInput | Prisma.AccessKeyUpdateWithWhereUniqueWithoutCreatedByUserInput[];
    updateMany?: Prisma.AccessKeyUpdateManyWithWhereWithoutCreatedByUserInput | Prisma.AccessKeyUpdateManyWithWhereWithoutCreatedByUserInput[];
    deleteMany?: Prisma.AccessKeyScalarWhereInput | Prisma.AccessKeyScalarWhereInput[];
};
export type AccessKeyUncheckedUpdateManyWithoutCreatedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.AccessKeyCreateWithoutCreatedByUserInput, Prisma.AccessKeyUncheckedCreateWithoutCreatedByUserInput> | Prisma.AccessKeyCreateWithoutCreatedByUserInput[] | Prisma.AccessKeyUncheckedCreateWithoutCreatedByUserInput[];
    connectOrCreate?: Prisma.AccessKeyCreateOrConnectWithoutCreatedByUserInput | Prisma.AccessKeyCreateOrConnectWithoutCreatedByUserInput[];
    upsert?: Prisma.AccessKeyUpsertWithWhereUniqueWithoutCreatedByUserInput | Prisma.AccessKeyUpsertWithWhereUniqueWithoutCreatedByUserInput[];
    createMany?: Prisma.AccessKeyCreateManyCreatedByUserInputEnvelope;
    set?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    disconnect?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    delete?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    connect?: Prisma.AccessKeyWhereUniqueInput | Prisma.AccessKeyWhereUniqueInput[];
    update?: Prisma.AccessKeyUpdateWithWhereUniqueWithoutCreatedByUserInput | Prisma.AccessKeyUpdateWithWhereUniqueWithoutCreatedByUserInput[];
    updateMany?: Prisma.AccessKeyUpdateManyWithWhereWithoutCreatedByUserInput | Prisma.AccessKeyUpdateManyWithWhereWithoutCreatedByUserInput[];
    deleteMany?: Prisma.AccessKeyScalarWhereInput | Prisma.AccessKeyScalarWhereInput[];
};
export type AccessKeyCreateWithoutCompanyInput = {
    id?: string;
    codeHash: string;
    status?: $Enums.AccessKeyStatus;
    expiresAt: Date | string;
    usedAt?: Date | string | null;
    createdByUser: Prisma.UserCreateNestedOneWithoutAccessKeysCreatedInput;
};
export type AccessKeyUncheckedCreateWithoutCompanyInput = {
    id?: string;
    createdBy: string;
    codeHash: string;
    status?: $Enums.AccessKeyStatus;
    expiresAt: Date | string;
    usedAt?: Date | string | null;
};
export type AccessKeyCreateOrConnectWithoutCompanyInput = {
    where: Prisma.AccessKeyWhereUniqueInput;
    create: Prisma.XOR<Prisma.AccessKeyCreateWithoutCompanyInput, Prisma.AccessKeyUncheckedCreateWithoutCompanyInput>;
};
export type AccessKeyCreateManyCompanyInputEnvelope = {
    data: Prisma.AccessKeyCreateManyCompanyInput | Prisma.AccessKeyCreateManyCompanyInput[];
    skipDuplicates?: boolean;
};
export type AccessKeyUpsertWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.AccessKeyWhereUniqueInput;
    update: Prisma.XOR<Prisma.AccessKeyUpdateWithoutCompanyInput, Prisma.AccessKeyUncheckedUpdateWithoutCompanyInput>;
    create: Prisma.XOR<Prisma.AccessKeyCreateWithoutCompanyInput, Prisma.AccessKeyUncheckedCreateWithoutCompanyInput>;
};
export type AccessKeyUpdateWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.AccessKeyWhereUniqueInput;
    data: Prisma.XOR<Prisma.AccessKeyUpdateWithoutCompanyInput, Prisma.AccessKeyUncheckedUpdateWithoutCompanyInput>;
};
export type AccessKeyUpdateManyWithWhereWithoutCompanyInput = {
    where: Prisma.AccessKeyScalarWhereInput;
    data: Prisma.XOR<Prisma.AccessKeyUpdateManyMutationInput, Prisma.AccessKeyUncheckedUpdateManyWithoutCompanyInput>;
};
export type AccessKeyScalarWhereInput = {
    AND?: Prisma.AccessKeyScalarWhereInput | Prisma.AccessKeyScalarWhereInput[];
    OR?: Prisma.AccessKeyScalarWhereInput[];
    NOT?: Prisma.AccessKeyScalarWhereInput | Prisma.AccessKeyScalarWhereInput[];
    id?: Prisma.UuidFilter<"AccessKey"> | string;
    companyId?: Prisma.UuidFilter<"AccessKey"> | string;
    createdBy?: Prisma.UuidFilter<"AccessKey"> | string;
    codeHash?: Prisma.StringFilter<"AccessKey"> | string;
    status?: Prisma.EnumAccessKeyStatusFilter<"AccessKey"> | $Enums.AccessKeyStatus;
    expiresAt?: Prisma.DateTimeFilter<"AccessKey"> | Date | string;
    usedAt?: Prisma.DateTimeNullableFilter<"AccessKey"> | Date | string | null;
};
export type AccessKeyCreateWithoutCreatedByUserInput = {
    id?: string;
    codeHash: string;
    status?: $Enums.AccessKeyStatus;
    expiresAt: Date | string;
    usedAt?: Date | string | null;
    company: Prisma.CompanyCreateNestedOneWithoutAccessKeysInput;
};
export type AccessKeyUncheckedCreateWithoutCreatedByUserInput = {
    id?: string;
    companyId: string;
    codeHash: string;
    status?: $Enums.AccessKeyStatus;
    expiresAt: Date | string;
    usedAt?: Date | string | null;
};
export type AccessKeyCreateOrConnectWithoutCreatedByUserInput = {
    where: Prisma.AccessKeyWhereUniqueInput;
    create: Prisma.XOR<Prisma.AccessKeyCreateWithoutCreatedByUserInput, Prisma.AccessKeyUncheckedCreateWithoutCreatedByUserInput>;
};
export type AccessKeyCreateManyCreatedByUserInputEnvelope = {
    data: Prisma.AccessKeyCreateManyCreatedByUserInput | Prisma.AccessKeyCreateManyCreatedByUserInput[];
    skipDuplicates?: boolean;
};
export type AccessKeyUpsertWithWhereUniqueWithoutCreatedByUserInput = {
    where: Prisma.AccessKeyWhereUniqueInput;
    update: Prisma.XOR<Prisma.AccessKeyUpdateWithoutCreatedByUserInput, Prisma.AccessKeyUncheckedUpdateWithoutCreatedByUserInput>;
    create: Prisma.XOR<Prisma.AccessKeyCreateWithoutCreatedByUserInput, Prisma.AccessKeyUncheckedCreateWithoutCreatedByUserInput>;
};
export type AccessKeyUpdateWithWhereUniqueWithoutCreatedByUserInput = {
    where: Prisma.AccessKeyWhereUniqueInput;
    data: Prisma.XOR<Prisma.AccessKeyUpdateWithoutCreatedByUserInput, Prisma.AccessKeyUncheckedUpdateWithoutCreatedByUserInput>;
};
export type AccessKeyUpdateManyWithWhereWithoutCreatedByUserInput = {
    where: Prisma.AccessKeyScalarWhereInput;
    data: Prisma.XOR<Prisma.AccessKeyUpdateManyMutationInput, Prisma.AccessKeyUncheckedUpdateManyWithoutCreatedByUserInput>;
};
export type AccessKeyCreateManyCompanyInput = {
    id?: string;
    createdBy: string;
    codeHash: string;
    status?: $Enums.AccessKeyStatus;
    expiresAt: Date | string;
    usedAt?: Date | string | null;
};
export type AccessKeyUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    codeHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAccessKeyStatusFieldUpdateOperationsInput | $Enums.AccessKeyStatus;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdByUser?: Prisma.UserUpdateOneRequiredWithoutAccessKeysCreatedNestedInput;
};
export type AccessKeyUncheckedUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    createdBy?: Prisma.StringFieldUpdateOperationsInput | string;
    codeHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAccessKeyStatusFieldUpdateOperationsInput | $Enums.AccessKeyStatus;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AccessKeyUncheckedUpdateManyWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    createdBy?: Prisma.StringFieldUpdateOperationsInput | string;
    codeHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAccessKeyStatusFieldUpdateOperationsInput | $Enums.AccessKeyStatus;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AccessKeyCreateManyCreatedByUserInput = {
    id?: string;
    companyId: string;
    codeHash: string;
    status?: $Enums.AccessKeyStatus;
    expiresAt: Date | string;
    usedAt?: Date | string | null;
};
export type AccessKeyUpdateWithoutCreatedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    codeHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAccessKeyStatusFieldUpdateOperationsInput | $Enums.AccessKeyStatus;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    company?: Prisma.CompanyUpdateOneRequiredWithoutAccessKeysNestedInput;
};
export type AccessKeyUncheckedUpdateWithoutCreatedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    codeHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAccessKeyStatusFieldUpdateOperationsInput | $Enums.AccessKeyStatus;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AccessKeyUncheckedUpdateManyWithoutCreatedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    codeHash?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAccessKeyStatusFieldUpdateOperationsInput | $Enums.AccessKeyStatus;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AccessKeySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    createdBy?: boolean;
    codeHash?: boolean;
    status?: boolean;
    expiresAt?: boolean;
    usedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    createdByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["accessKey"]>;
export type AccessKeySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    createdBy?: boolean;
    codeHash?: boolean;
    status?: boolean;
    expiresAt?: boolean;
    usedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    createdByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["accessKey"]>;
export type AccessKeySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    createdBy?: boolean;
    codeHash?: boolean;
    status?: boolean;
    expiresAt?: boolean;
    usedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    createdByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["accessKey"]>;
export type AccessKeySelectScalar = {
    id?: boolean;
    companyId?: boolean;
    createdBy?: boolean;
    codeHash?: boolean;
    status?: boolean;
    expiresAt?: boolean;
    usedAt?: boolean;
};
export type AccessKeyOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "companyId" | "createdBy" | "codeHash" | "status" | "expiresAt" | "usedAt", ExtArgs["result"]["accessKey"]>;
export type AccessKeyInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    createdByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type AccessKeyIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    createdByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type AccessKeyIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    createdByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $AccessKeyPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "AccessKey";
    objects: {
        company: Prisma.$CompanyPayload<ExtArgs>;
        createdByUser: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        companyId: string;
        createdBy: string;
        codeHash: string;
        status: $Enums.AccessKeyStatus;
        expiresAt: Date;
        usedAt: Date | null;
    }, ExtArgs["result"]["accessKey"]>;
    composites: {};
};
export type AccessKeyGetPayload<S extends boolean | null | undefined | AccessKeyDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AccessKeyPayload, S>;
export type AccessKeyCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AccessKeyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AccessKeyCountAggregateInputType | true;
};
export interface AccessKeyDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['AccessKey'];
        meta: {
            name: 'AccessKey';
        };
    };
    findUnique<T extends AccessKeyFindUniqueArgs>(args: Prisma.SelectSubset<T, AccessKeyFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AccessKeyClient<runtime.Types.Result.GetResult<Prisma.$AccessKeyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends AccessKeyFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AccessKeyFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AccessKeyClient<runtime.Types.Result.GetResult<Prisma.$AccessKeyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends AccessKeyFindFirstArgs>(args?: Prisma.SelectSubset<T, AccessKeyFindFirstArgs<ExtArgs>>): Prisma.Prisma__AccessKeyClient<runtime.Types.Result.GetResult<Prisma.$AccessKeyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends AccessKeyFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AccessKeyFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AccessKeyClient<runtime.Types.Result.GetResult<Prisma.$AccessKeyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends AccessKeyFindManyArgs>(args?: Prisma.SelectSubset<T, AccessKeyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AccessKeyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends AccessKeyCreateArgs>(args: Prisma.SelectSubset<T, AccessKeyCreateArgs<ExtArgs>>): Prisma.Prisma__AccessKeyClient<runtime.Types.Result.GetResult<Prisma.$AccessKeyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends AccessKeyCreateManyArgs>(args?: Prisma.SelectSubset<T, AccessKeyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends AccessKeyCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AccessKeyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AccessKeyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends AccessKeyDeleteArgs>(args: Prisma.SelectSubset<T, AccessKeyDeleteArgs<ExtArgs>>): Prisma.Prisma__AccessKeyClient<runtime.Types.Result.GetResult<Prisma.$AccessKeyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends AccessKeyUpdateArgs>(args: Prisma.SelectSubset<T, AccessKeyUpdateArgs<ExtArgs>>): Prisma.Prisma__AccessKeyClient<runtime.Types.Result.GetResult<Prisma.$AccessKeyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends AccessKeyDeleteManyArgs>(args?: Prisma.SelectSubset<T, AccessKeyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends AccessKeyUpdateManyArgs>(args: Prisma.SelectSubset<T, AccessKeyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends AccessKeyUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AccessKeyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AccessKeyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends AccessKeyUpsertArgs>(args: Prisma.SelectSubset<T, AccessKeyUpsertArgs<ExtArgs>>): Prisma.Prisma__AccessKeyClient<runtime.Types.Result.GetResult<Prisma.$AccessKeyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends AccessKeyCountArgs>(args?: Prisma.Subset<T, AccessKeyCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AccessKeyCountAggregateOutputType> : number>;
    aggregate<T extends AccessKeyAggregateArgs>(args: Prisma.Subset<T, AccessKeyAggregateArgs>): Prisma.PrismaPromise<GetAccessKeyAggregateType<T>>;
    groupBy<T extends AccessKeyGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AccessKeyGroupByArgs['orderBy'];
    } : {
        orderBy?: AccessKeyGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AccessKeyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccessKeyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: AccessKeyFieldRefs;
}
export interface Prisma__AccessKeyClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    company<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    createdByUser<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface AccessKeyFieldRefs {
    readonly id: Prisma.FieldRef<"AccessKey", 'String'>;
    readonly companyId: Prisma.FieldRef<"AccessKey", 'String'>;
    readonly createdBy: Prisma.FieldRef<"AccessKey", 'String'>;
    readonly codeHash: Prisma.FieldRef<"AccessKey", 'String'>;
    readonly status: Prisma.FieldRef<"AccessKey", 'AccessKeyStatus'>;
    readonly expiresAt: Prisma.FieldRef<"AccessKey", 'DateTime'>;
    readonly usedAt: Prisma.FieldRef<"AccessKey", 'DateTime'>;
}
export type AccessKeyFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AccessKeySelect<ExtArgs> | null;
    omit?: Prisma.AccessKeyOmit<ExtArgs> | null;
    include?: Prisma.AccessKeyInclude<ExtArgs> | null;
    where: Prisma.AccessKeyWhereUniqueInput;
};
export type AccessKeyFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AccessKeySelect<ExtArgs> | null;
    omit?: Prisma.AccessKeyOmit<ExtArgs> | null;
    include?: Prisma.AccessKeyInclude<ExtArgs> | null;
    where: Prisma.AccessKeyWhereUniqueInput;
};
export type AccessKeyFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AccessKeySelect<ExtArgs> | null;
    omit?: Prisma.AccessKeyOmit<ExtArgs> | null;
    include?: Prisma.AccessKeyInclude<ExtArgs> | null;
    where?: Prisma.AccessKeyWhereInput;
    orderBy?: Prisma.AccessKeyOrderByWithRelationInput | Prisma.AccessKeyOrderByWithRelationInput[];
    cursor?: Prisma.AccessKeyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AccessKeyScalarFieldEnum | Prisma.AccessKeyScalarFieldEnum[];
};
export type AccessKeyFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AccessKeySelect<ExtArgs> | null;
    omit?: Prisma.AccessKeyOmit<ExtArgs> | null;
    include?: Prisma.AccessKeyInclude<ExtArgs> | null;
    where?: Prisma.AccessKeyWhereInput;
    orderBy?: Prisma.AccessKeyOrderByWithRelationInput | Prisma.AccessKeyOrderByWithRelationInput[];
    cursor?: Prisma.AccessKeyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AccessKeyScalarFieldEnum | Prisma.AccessKeyScalarFieldEnum[];
};
export type AccessKeyFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AccessKeySelect<ExtArgs> | null;
    omit?: Prisma.AccessKeyOmit<ExtArgs> | null;
    include?: Prisma.AccessKeyInclude<ExtArgs> | null;
    where?: Prisma.AccessKeyWhereInput;
    orderBy?: Prisma.AccessKeyOrderByWithRelationInput | Prisma.AccessKeyOrderByWithRelationInput[];
    cursor?: Prisma.AccessKeyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AccessKeyScalarFieldEnum | Prisma.AccessKeyScalarFieldEnum[];
};
export type AccessKeyCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AccessKeySelect<ExtArgs> | null;
    omit?: Prisma.AccessKeyOmit<ExtArgs> | null;
    include?: Prisma.AccessKeyInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AccessKeyCreateInput, Prisma.AccessKeyUncheckedCreateInput>;
};
export type AccessKeyCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.AccessKeyCreateManyInput | Prisma.AccessKeyCreateManyInput[];
    skipDuplicates?: boolean;
};
export type AccessKeyCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AccessKeySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AccessKeyOmit<ExtArgs> | null;
    data: Prisma.AccessKeyCreateManyInput | Prisma.AccessKeyCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.AccessKeyIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type AccessKeyUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AccessKeySelect<ExtArgs> | null;
    omit?: Prisma.AccessKeyOmit<ExtArgs> | null;
    include?: Prisma.AccessKeyInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AccessKeyUpdateInput, Prisma.AccessKeyUncheckedUpdateInput>;
    where: Prisma.AccessKeyWhereUniqueInput;
};
export type AccessKeyUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.AccessKeyUpdateManyMutationInput, Prisma.AccessKeyUncheckedUpdateManyInput>;
    where?: Prisma.AccessKeyWhereInput;
    limit?: number;
};
export type AccessKeyUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AccessKeySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AccessKeyOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AccessKeyUpdateManyMutationInput, Prisma.AccessKeyUncheckedUpdateManyInput>;
    where?: Prisma.AccessKeyWhereInput;
    limit?: number;
    include?: Prisma.AccessKeyIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type AccessKeyUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AccessKeySelect<ExtArgs> | null;
    omit?: Prisma.AccessKeyOmit<ExtArgs> | null;
    include?: Prisma.AccessKeyInclude<ExtArgs> | null;
    where: Prisma.AccessKeyWhereUniqueInput;
    create: Prisma.XOR<Prisma.AccessKeyCreateInput, Prisma.AccessKeyUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.AccessKeyUpdateInput, Prisma.AccessKeyUncheckedUpdateInput>;
};
export type AccessKeyDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AccessKeySelect<ExtArgs> | null;
    omit?: Prisma.AccessKeyOmit<ExtArgs> | null;
    include?: Prisma.AccessKeyInclude<ExtArgs> | null;
    where: Prisma.AccessKeyWhereUniqueInput;
};
export type AccessKeyDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AccessKeyWhereInput;
    limit?: number;
};
export type AccessKeyDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AccessKeySelect<ExtArgs> | null;
    omit?: Prisma.AccessKeyOmit<ExtArgs> | null;
    include?: Prisma.AccessKeyInclude<ExtArgs> | null;
};
export {};
