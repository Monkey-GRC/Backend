import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ComplianceEventModel = runtime.Types.Result.DefaultSelection<Prisma.$ComplianceEventPayload>;
export type AggregateComplianceEvent = {
    _count: ComplianceEventCountAggregateOutputType | null;
    _min: ComplianceEventMinAggregateOutputType | null;
    _max: ComplianceEventMaxAggregateOutputType | null;
};
export type ComplianceEventMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    userId: string | null;
    changedField: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date | null;
};
export type ComplianceEventMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    userId: string | null;
    changedField: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date | null;
};
export type ComplianceEventCountAggregateOutputType = {
    id: number;
    tenantId: number;
    userId: number;
    changedField: number;
    previousValue: number;
    newValue: number;
    ipAddress: number;
    userAgent: number;
    createdAt: number;
    _all: number;
};
export type ComplianceEventMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    userId?: true;
    changedField?: true;
    ipAddress?: true;
    userAgent?: true;
    createdAt?: true;
};
export type ComplianceEventMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    userId?: true;
    changedField?: true;
    ipAddress?: true;
    userAgent?: true;
    createdAt?: true;
};
export type ComplianceEventCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    userId?: true;
    changedField?: true;
    previousValue?: true;
    newValue?: true;
    ipAddress?: true;
    userAgent?: true;
    createdAt?: true;
    _all?: true;
};
export type ComplianceEventAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ComplianceEventWhereInput;
    orderBy?: Prisma.ComplianceEventOrderByWithRelationInput | Prisma.ComplianceEventOrderByWithRelationInput[];
    cursor?: Prisma.ComplianceEventWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ComplianceEventCountAggregateInputType;
    _min?: ComplianceEventMinAggregateInputType;
    _max?: ComplianceEventMaxAggregateInputType;
};
export type GetComplianceEventAggregateType<T extends ComplianceEventAggregateArgs> = {
    [P in keyof T & keyof AggregateComplianceEvent]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateComplianceEvent[P]> : Prisma.GetScalarType<T[P], AggregateComplianceEvent[P]>;
};
export type ComplianceEventGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ComplianceEventWhereInput;
    orderBy?: Prisma.ComplianceEventOrderByWithAggregationInput | Prisma.ComplianceEventOrderByWithAggregationInput[];
    by: Prisma.ComplianceEventScalarFieldEnum[] | Prisma.ComplianceEventScalarFieldEnum;
    having?: Prisma.ComplianceEventScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ComplianceEventCountAggregateInputType | true;
    _min?: ComplianceEventMinAggregateInputType;
    _max?: ComplianceEventMaxAggregateInputType;
};
export type ComplianceEventGroupByOutputType = {
    id: string;
    tenantId: string;
    userId: string;
    changedField: string;
    previousValue: runtime.JsonValue | null;
    newValue: runtime.JsonValue;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    _count: ComplianceEventCountAggregateOutputType | null;
    _min: ComplianceEventMinAggregateOutputType | null;
    _max: ComplianceEventMaxAggregateOutputType | null;
};
type GetComplianceEventGroupByPayload<T extends ComplianceEventGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ComplianceEventGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ComplianceEventGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ComplianceEventGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ComplianceEventGroupByOutputType[P]>;
}>>;
export type ComplianceEventWhereInput = {
    AND?: Prisma.ComplianceEventWhereInput | Prisma.ComplianceEventWhereInput[];
    OR?: Prisma.ComplianceEventWhereInput[];
    NOT?: Prisma.ComplianceEventWhereInput | Prisma.ComplianceEventWhereInput[];
    id?: Prisma.UuidFilter<"ComplianceEvent"> | string;
    tenantId?: Prisma.UuidFilter<"ComplianceEvent"> | string;
    userId?: Prisma.UuidFilter<"ComplianceEvent"> | string;
    changedField?: Prisma.StringFilter<"ComplianceEvent"> | string;
    previousValue?: Prisma.JsonNullableFilter<"ComplianceEvent">;
    newValue?: Prisma.JsonFilter<"ComplianceEvent">;
    ipAddress?: Prisma.StringFilter<"ComplianceEvent"> | string;
    userAgent?: Prisma.StringFilter<"ComplianceEvent"> | string;
    createdAt?: Prisma.DateTimeFilter<"ComplianceEvent"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type ComplianceEventOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    changedField?: Prisma.SortOrder;
    previousValue?: Prisma.SortOrderInput | Prisma.SortOrder;
    newValue?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrder;
    userAgent?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type ComplianceEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ComplianceEventWhereInput | Prisma.ComplianceEventWhereInput[];
    OR?: Prisma.ComplianceEventWhereInput[];
    NOT?: Prisma.ComplianceEventWhereInput | Prisma.ComplianceEventWhereInput[];
    tenantId?: Prisma.UuidFilter<"ComplianceEvent"> | string;
    userId?: Prisma.UuidFilter<"ComplianceEvent"> | string;
    changedField?: Prisma.StringFilter<"ComplianceEvent"> | string;
    previousValue?: Prisma.JsonNullableFilter<"ComplianceEvent">;
    newValue?: Prisma.JsonFilter<"ComplianceEvent">;
    ipAddress?: Prisma.StringFilter<"ComplianceEvent"> | string;
    userAgent?: Prisma.StringFilter<"ComplianceEvent"> | string;
    createdAt?: Prisma.DateTimeFilter<"ComplianceEvent"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id">;
export type ComplianceEventOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    changedField?: Prisma.SortOrder;
    previousValue?: Prisma.SortOrderInput | Prisma.SortOrder;
    newValue?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrder;
    userAgent?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.ComplianceEventCountOrderByAggregateInput;
    _max?: Prisma.ComplianceEventMaxOrderByAggregateInput;
    _min?: Prisma.ComplianceEventMinOrderByAggregateInput;
};
export type ComplianceEventScalarWhereWithAggregatesInput = {
    AND?: Prisma.ComplianceEventScalarWhereWithAggregatesInput | Prisma.ComplianceEventScalarWhereWithAggregatesInput[];
    OR?: Prisma.ComplianceEventScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ComplianceEventScalarWhereWithAggregatesInput | Prisma.ComplianceEventScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ComplianceEvent"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ComplianceEvent"> | string;
    userId?: Prisma.UuidWithAggregatesFilter<"ComplianceEvent"> | string;
    changedField?: Prisma.StringWithAggregatesFilter<"ComplianceEvent"> | string;
    previousValue?: Prisma.JsonNullableWithAggregatesFilter<"ComplianceEvent">;
    newValue?: Prisma.JsonWithAggregatesFilter<"ComplianceEvent">;
    ipAddress?: Prisma.StringWithAggregatesFilter<"ComplianceEvent"> | string;
    userAgent?: Prisma.StringWithAggregatesFilter<"ComplianceEvent"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ComplianceEvent"> | Date | string;
};
export type ComplianceEventCreateInput = {
    id?: string;
    changedField: string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress: string;
    userAgent: string;
    createdAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutComplianceEventsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutComplianceEventsInput;
};
export type ComplianceEventUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    userId: string;
    changedField: string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress: string;
    userAgent: string;
    createdAt?: Date | string;
};
export type ComplianceEventUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    changedField?: Prisma.StringFieldUpdateOperationsInput | string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutComplianceEventsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutComplianceEventsNestedInput;
};
export type ComplianceEventUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    changedField?: Prisma.StringFieldUpdateOperationsInput | string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ComplianceEventCreateManyInput = {
    id?: string;
    tenantId: string;
    userId: string;
    changedField: string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress: string;
    userAgent: string;
    createdAt?: Date | string;
};
export type ComplianceEventUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    changedField?: Prisma.StringFieldUpdateOperationsInput | string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ComplianceEventUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    changedField?: Prisma.StringFieldUpdateOperationsInput | string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ComplianceEventCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    changedField?: Prisma.SortOrder;
    previousValue?: Prisma.SortOrder;
    newValue?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrder;
    userAgent?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ComplianceEventMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    changedField?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrder;
    userAgent?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ComplianceEventMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    changedField?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrder;
    userAgent?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ComplianceEventListRelationFilter = {
    every?: Prisma.ComplianceEventWhereInput;
    some?: Prisma.ComplianceEventWhereInput;
    none?: Prisma.ComplianceEventWhereInput;
};
export type ComplianceEventOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ComplianceEventCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ComplianceEventCreateWithoutTenantInput, Prisma.ComplianceEventUncheckedCreateWithoutTenantInput> | Prisma.ComplianceEventCreateWithoutTenantInput[] | Prisma.ComplianceEventUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ComplianceEventCreateOrConnectWithoutTenantInput | Prisma.ComplianceEventCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ComplianceEventCreateManyTenantInputEnvelope;
    connect?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
};
export type ComplianceEventUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ComplianceEventCreateWithoutTenantInput, Prisma.ComplianceEventUncheckedCreateWithoutTenantInput> | Prisma.ComplianceEventCreateWithoutTenantInput[] | Prisma.ComplianceEventUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ComplianceEventCreateOrConnectWithoutTenantInput | Prisma.ComplianceEventCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ComplianceEventCreateManyTenantInputEnvelope;
    connect?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
};
export type ComplianceEventUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ComplianceEventCreateWithoutTenantInput, Prisma.ComplianceEventUncheckedCreateWithoutTenantInput> | Prisma.ComplianceEventCreateWithoutTenantInput[] | Prisma.ComplianceEventUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ComplianceEventCreateOrConnectWithoutTenantInput | Prisma.ComplianceEventCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ComplianceEventUpsertWithWhereUniqueWithoutTenantInput | Prisma.ComplianceEventUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ComplianceEventCreateManyTenantInputEnvelope;
    set?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    disconnect?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    delete?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    connect?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    update?: Prisma.ComplianceEventUpdateWithWhereUniqueWithoutTenantInput | Prisma.ComplianceEventUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ComplianceEventUpdateManyWithWhereWithoutTenantInput | Prisma.ComplianceEventUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ComplianceEventScalarWhereInput | Prisma.ComplianceEventScalarWhereInput[];
};
export type ComplianceEventUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ComplianceEventCreateWithoutTenantInput, Prisma.ComplianceEventUncheckedCreateWithoutTenantInput> | Prisma.ComplianceEventCreateWithoutTenantInput[] | Prisma.ComplianceEventUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ComplianceEventCreateOrConnectWithoutTenantInput | Prisma.ComplianceEventCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ComplianceEventUpsertWithWhereUniqueWithoutTenantInput | Prisma.ComplianceEventUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ComplianceEventCreateManyTenantInputEnvelope;
    set?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    disconnect?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    delete?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    connect?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    update?: Prisma.ComplianceEventUpdateWithWhereUniqueWithoutTenantInput | Prisma.ComplianceEventUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ComplianceEventUpdateManyWithWhereWithoutTenantInput | Prisma.ComplianceEventUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ComplianceEventScalarWhereInput | Prisma.ComplianceEventScalarWhereInput[];
};
export type ComplianceEventCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ComplianceEventCreateWithoutUserInput, Prisma.ComplianceEventUncheckedCreateWithoutUserInput> | Prisma.ComplianceEventCreateWithoutUserInput[] | Prisma.ComplianceEventUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ComplianceEventCreateOrConnectWithoutUserInput | Prisma.ComplianceEventCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ComplianceEventCreateManyUserInputEnvelope;
    connect?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
};
export type ComplianceEventUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ComplianceEventCreateWithoutUserInput, Prisma.ComplianceEventUncheckedCreateWithoutUserInput> | Prisma.ComplianceEventCreateWithoutUserInput[] | Prisma.ComplianceEventUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ComplianceEventCreateOrConnectWithoutUserInput | Prisma.ComplianceEventCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ComplianceEventCreateManyUserInputEnvelope;
    connect?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
};
export type ComplianceEventUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ComplianceEventCreateWithoutUserInput, Prisma.ComplianceEventUncheckedCreateWithoutUserInput> | Prisma.ComplianceEventCreateWithoutUserInput[] | Prisma.ComplianceEventUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ComplianceEventCreateOrConnectWithoutUserInput | Prisma.ComplianceEventCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ComplianceEventUpsertWithWhereUniqueWithoutUserInput | Prisma.ComplianceEventUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ComplianceEventCreateManyUserInputEnvelope;
    set?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    disconnect?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    delete?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    connect?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    update?: Prisma.ComplianceEventUpdateWithWhereUniqueWithoutUserInput | Prisma.ComplianceEventUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ComplianceEventUpdateManyWithWhereWithoutUserInput | Prisma.ComplianceEventUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ComplianceEventScalarWhereInput | Prisma.ComplianceEventScalarWhereInput[];
};
export type ComplianceEventUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ComplianceEventCreateWithoutUserInput, Prisma.ComplianceEventUncheckedCreateWithoutUserInput> | Prisma.ComplianceEventCreateWithoutUserInput[] | Prisma.ComplianceEventUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ComplianceEventCreateOrConnectWithoutUserInput | Prisma.ComplianceEventCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ComplianceEventUpsertWithWhereUniqueWithoutUserInput | Prisma.ComplianceEventUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ComplianceEventCreateManyUserInputEnvelope;
    set?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    disconnect?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    delete?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    connect?: Prisma.ComplianceEventWhereUniqueInput | Prisma.ComplianceEventWhereUniqueInput[];
    update?: Prisma.ComplianceEventUpdateWithWhereUniqueWithoutUserInput | Prisma.ComplianceEventUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ComplianceEventUpdateManyWithWhereWithoutUserInput | Prisma.ComplianceEventUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ComplianceEventScalarWhereInput | Prisma.ComplianceEventScalarWhereInput[];
};
export type ComplianceEventCreateWithoutTenantInput = {
    id?: string;
    changedField: string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress: string;
    userAgent: string;
    createdAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutComplianceEventsInput;
};
export type ComplianceEventUncheckedCreateWithoutTenantInput = {
    id?: string;
    userId: string;
    changedField: string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress: string;
    userAgent: string;
    createdAt?: Date | string;
};
export type ComplianceEventCreateOrConnectWithoutTenantInput = {
    where: Prisma.ComplianceEventWhereUniqueInput;
    create: Prisma.XOR<Prisma.ComplianceEventCreateWithoutTenantInput, Prisma.ComplianceEventUncheckedCreateWithoutTenantInput>;
};
export type ComplianceEventCreateManyTenantInputEnvelope = {
    data: Prisma.ComplianceEventCreateManyTenantInput | Prisma.ComplianceEventCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ComplianceEventUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ComplianceEventWhereUniqueInput;
    update: Prisma.XOR<Prisma.ComplianceEventUpdateWithoutTenantInput, Prisma.ComplianceEventUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ComplianceEventCreateWithoutTenantInput, Prisma.ComplianceEventUncheckedCreateWithoutTenantInput>;
};
export type ComplianceEventUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ComplianceEventWhereUniqueInput;
    data: Prisma.XOR<Prisma.ComplianceEventUpdateWithoutTenantInput, Prisma.ComplianceEventUncheckedUpdateWithoutTenantInput>;
};
export type ComplianceEventUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ComplianceEventScalarWhereInput;
    data: Prisma.XOR<Prisma.ComplianceEventUpdateManyMutationInput, Prisma.ComplianceEventUncheckedUpdateManyWithoutTenantInput>;
};
export type ComplianceEventScalarWhereInput = {
    AND?: Prisma.ComplianceEventScalarWhereInput | Prisma.ComplianceEventScalarWhereInput[];
    OR?: Prisma.ComplianceEventScalarWhereInput[];
    NOT?: Prisma.ComplianceEventScalarWhereInput | Prisma.ComplianceEventScalarWhereInput[];
    id?: Prisma.UuidFilter<"ComplianceEvent"> | string;
    tenantId?: Prisma.UuidFilter<"ComplianceEvent"> | string;
    userId?: Prisma.UuidFilter<"ComplianceEvent"> | string;
    changedField?: Prisma.StringFilter<"ComplianceEvent"> | string;
    previousValue?: Prisma.JsonNullableFilter<"ComplianceEvent">;
    newValue?: Prisma.JsonFilter<"ComplianceEvent">;
    ipAddress?: Prisma.StringFilter<"ComplianceEvent"> | string;
    userAgent?: Prisma.StringFilter<"ComplianceEvent"> | string;
    createdAt?: Prisma.DateTimeFilter<"ComplianceEvent"> | Date | string;
};
export type ComplianceEventCreateWithoutUserInput = {
    id?: string;
    changedField: string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress: string;
    userAgent: string;
    createdAt?: Date | string;
    tenant: Prisma.CompanyCreateNestedOneWithoutComplianceEventsInput;
};
export type ComplianceEventUncheckedCreateWithoutUserInput = {
    id?: string;
    tenantId: string;
    changedField: string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress: string;
    userAgent: string;
    createdAt?: Date | string;
};
export type ComplianceEventCreateOrConnectWithoutUserInput = {
    where: Prisma.ComplianceEventWhereUniqueInput;
    create: Prisma.XOR<Prisma.ComplianceEventCreateWithoutUserInput, Prisma.ComplianceEventUncheckedCreateWithoutUserInput>;
};
export type ComplianceEventCreateManyUserInputEnvelope = {
    data: Prisma.ComplianceEventCreateManyUserInput | Prisma.ComplianceEventCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type ComplianceEventUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.ComplianceEventWhereUniqueInput;
    update: Prisma.XOR<Prisma.ComplianceEventUpdateWithoutUserInput, Prisma.ComplianceEventUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.ComplianceEventCreateWithoutUserInput, Prisma.ComplianceEventUncheckedCreateWithoutUserInput>;
};
export type ComplianceEventUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.ComplianceEventWhereUniqueInput;
    data: Prisma.XOR<Prisma.ComplianceEventUpdateWithoutUserInput, Prisma.ComplianceEventUncheckedUpdateWithoutUserInput>;
};
export type ComplianceEventUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.ComplianceEventScalarWhereInput;
    data: Prisma.XOR<Prisma.ComplianceEventUpdateManyMutationInput, Prisma.ComplianceEventUncheckedUpdateManyWithoutUserInput>;
};
export type ComplianceEventCreateManyTenantInput = {
    id?: string;
    userId: string;
    changedField: string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress: string;
    userAgent: string;
    createdAt?: Date | string;
};
export type ComplianceEventUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    changedField?: Prisma.StringFieldUpdateOperationsInput | string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutComplianceEventsNestedInput;
};
export type ComplianceEventUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    changedField?: Prisma.StringFieldUpdateOperationsInput | string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ComplianceEventUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    changedField?: Prisma.StringFieldUpdateOperationsInput | string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ComplianceEventCreateManyUserInput = {
    id?: string;
    tenantId: string;
    changedField: string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress: string;
    userAgent: string;
    createdAt?: Date | string;
};
export type ComplianceEventUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    changedField?: Prisma.StringFieldUpdateOperationsInput | string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutComplianceEventsNestedInput;
};
export type ComplianceEventUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    changedField?: Prisma.StringFieldUpdateOperationsInput | string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ComplianceEventUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    changedField?: Prisma.StringFieldUpdateOperationsInput | string;
    previousValue?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    newValue?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    ipAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    userAgent?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ComplianceEventSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    userId?: boolean;
    changedField?: boolean;
    previousValue?: boolean;
    newValue?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["complianceEvent"]>;
export type ComplianceEventSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    userId?: boolean;
    changedField?: boolean;
    previousValue?: boolean;
    newValue?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["complianceEvent"]>;
export type ComplianceEventSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    userId?: boolean;
    changedField?: boolean;
    previousValue?: boolean;
    newValue?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["complianceEvent"]>;
export type ComplianceEventSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    userId?: boolean;
    changedField?: boolean;
    previousValue?: boolean;
    newValue?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
    createdAt?: boolean;
};
export type ComplianceEventOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "userId" | "changedField" | "previousValue" | "newValue" | "ipAddress" | "userAgent" | "createdAt", ExtArgs["result"]["complianceEvent"]>;
export type ComplianceEventInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ComplianceEventIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ComplianceEventIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ComplianceEventPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ComplianceEvent";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        userId: string;
        changedField: string;
        previousValue: runtime.JsonValue | null;
        newValue: runtime.JsonValue;
        ipAddress: string;
        userAgent: string;
        createdAt: Date;
    }, ExtArgs["result"]["complianceEvent"]>;
    composites: {};
};
export type ComplianceEventGetPayload<S extends boolean | null | undefined | ComplianceEventDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ComplianceEventPayload, S>;
export type ComplianceEventCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ComplianceEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ComplianceEventCountAggregateInputType | true;
};
export interface ComplianceEventDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ComplianceEvent'];
        meta: {
            name: 'ComplianceEvent';
        };
    };
    findUnique<T extends ComplianceEventFindUniqueArgs>(args: Prisma.SelectSubset<T, ComplianceEventFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ComplianceEventClient<runtime.Types.Result.GetResult<Prisma.$ComplianceEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ComplianceEventFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ComplianceEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ComplianceEventClient<runtime.Types.Result.GetResult<Prisma.$ComplianceEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ComplianceEventFindFirstArgs>(args?: Prisma.SelectSubset<T, ComplianceEventFindFirstArgs<ExtArgs>>): Prisma.Prisma__ComplianceEventClient<runtime.Types.Result.GetResult<Prisma.$ComplianceEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ComplianceEventFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ComplianceEventFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ComplianceEventClient<runtime.Types.Result.GetResult<Prisma.$ComplianceEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ComplianceEventFindManyArgs>(args?: Prisma.SelectSubset<T, ComplianceEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ComplianceEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ComplianceEventCreateArgs>(args: Prisma.SelectSubset<T, ComplianceEventCreateArgs<ExtArgs>>): Prisma.Prisma__ComplianceEventClient<runtime.Types.Result.GetResult<Prisma.$ComplianceEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ComplianceEventCreateManyArgs>(args?: Prisma.SelectSubset<T, ComplianceEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ComplianceEventCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ComplianceEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ComplianceEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ComplianceEventDeleteArgs>(args: Prisma.SelectSubset<T, ComplianceEventDeleteArgs<ExtArgs>>): Prisma.Prisma__ComplianceEventClient<runtime.Types.Result.GetResult<Prisma.$ComplianceEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ComplianceEventUpdateArgs>(args: Prisma.SelectSubset<T, ComplianceEventUpdateArgs<ExtArgs>>): Prisma.Prisma__ComplianceEventClient<runtime.Types.Result.GetResult<Prisma.$ComplianceEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ComplianceEventDeleteManyArgs>(args?: Prisma.SelectSubset<T, ComplianceEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ComplianceEventUpdateManyArgs>(args: Prisma.SelectSubset<T, ComplianceEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ComplianceEventUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ComplianceEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ComplianceEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ComplianceEventUpsertArgs>(args: Prisma.SelectSubset<T, ComplianceEventUpsertArgs<ExtArgs>>): Prisma.Prisma__ComplianceEventClient<runtime.Types.Result.GetResult<Prisma.$ComplianceEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ComplianceEventCountArgs>(args?: Prisma.Subset<T, ComplianceEventCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ComplianceEventCountAggregateOutputType> : number>;
    aggregate<T extends ComplianceEventAggregateArgs>(args: Prisma.Subset<T, ComplianceEventAggregateArgs>): Prisma.PrismaPromise<GetComplianceEventAggregateType<T>>;
    groupBy<T extends ComplianceEventGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ComplianceEventGroupByArgs['orderBy'];
    } : {
        orderBy?: ComplianceEventGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ComplianceEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetComplianceEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ComplianceEventFieldRefs;
}
export interface Prisma__ComplianceEventClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ComplianceEventFieldRefs {
    readonly id: Prisma.FieldRef<"ComplianceEvent", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ComplianceEvent", 'String'>;
    readonly userId: Prisma.FieldRef<"ComplianceEvent", 'String'>;
    readonly changedField: Prisma.FieldRef<"ComplianceEvent", 'String'>;
    readonly previousValue: Prisma.FieldRef<"ComplianceEvent", 'Json'>;
    readonly newValue: Prisma.FieldRef<"ComplianceEvent", 'Json'>;
    readonly ipAddress: Prisma.FieldRef<"ComplianceEvent", 'String'>;
    readonly userAgent: Prisma.FieldRef<"ComplianceEvent", 'String'>;
    readonly createdAt: Prisma.FieldRef<"ComplianceEvent", 'DateTime'>;
}
export type ComplianceEventFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComplianceEventSelect<ExtArgs> | null;
    omit?: Prisma.ComplianceEventOmit<ExtArgs> | null;
    include?: Prisma.ComplianceEventInclude<ExtArgs> | null;
    where: Prisma.ComplianceEventWhereUniqueInput;
};
export type ComplianceEventFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComplianceEventSelect<ExtArgs> | null;
    omit?: Prisma.ComplianceEventOmit<ExtArgs> | null;
    include?: Prisma.ComplianceEventInclude<ExtArgs> | null;
    where: Prisma.ComplianceEventWhereUniqueInput;
};
export type ComplianceEventFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComplianceEventSelect<ExtArgs> | null;
    omit?: Prisma.ComplianceEventOmit<ExtArgs> | null;
    include?: Prisma.ComplianceEventInclude<ExtArgs> | null;
    where?: Prisma.ComplianceEventWhereInput;
    orderBy?: Prisma.ComplianceEventOrderByWithRelationInput | Prisma.ComplianceEventOrderByWithRelationInput[];
    cursor?: Prisma.ComplianceEventWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ComplianceEventScalarFieldEnum | Prisma.ComplianceEventScalarFieldEnum[];
};
export type ComplianceEventFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComplianceEventSelect<ExtArgs> | null;
    omit?: Prisma.ComplianceEventOmit<ExtArgs> | null;
    include?: Prisma.ComplianceEventInclude<ExtArgs> | null;
    where?: Prisma.ComplianceEventWhereInput;
    orderBy?: Prisma.ComplianceEventOrderByWithRelationInput | Prisma.ComplianceEventOrderByWithRelationInput[];
    cursor?: Prisma.ComplianceEventWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ComplianceEventScalarFieldEnum | Prisma.ComplianceEventScalarFieldEnum[];
};
export type ComplianceEventFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComplianceEventSelect<ExtArgs> | null;
    omit?: Prisma.ComplianceEventOmit<ExtArgs> | null;
    include?: Prisma.ComplianceEventInclude<ExtArgs> | null;
    where?: Prisma.ComplianceEventWhereInput;
    orderBy?: Prisma.ComplianceEventOrderByWithRelationInput | Prisma.ComplianceEventOrderByWithRelationInput[];
    cursor?: Prisma.ComplianceEventWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ComplianceEventScalarFieldEnum | Prisma.ComplianceEventScalarFieldEnum[];
};
export type ComplianceEventCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComplianceEventSelect<ExtArgs> | null;
    omit?: Prisma.ComplianceEventOmit<ExtArgs> | null;
    include?: Prisma.ComplianceEventInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ComplianceEventCreateInput, Prisma.ComplianceEventUncheckedCreateInput>;
};
export type ComplianceEventCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ComplianceEventCreateManyInput | Prisma.ComplianceEventCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ComplianceEventCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComplianceEventSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ComplianceEventOmit<ExtArgs> | null;
    data: Prisma.ComplianceEventCreateManyInput | Prisma.ComplianceEventCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ComplianceEventIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ComplianceEventUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComplianceEventSelect<ExtArgs> | null;
    omit?: Prisma.ComplianceEventOmit<ExtArgs> | null;
    include?: Prisma.ComplianceEventInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ComplianceEventUpdateInput, Prisma.ComplianceEventUncheckedUpdateInput>;
    where: Prisma.ComplianceEventWhereUniqueInput;
};
export type ComplianceEventUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ComplianceEventUpdateManyMutationInput, Prisma.ComplianceEventUncheckedUpdateManyInput>;
    where?: Prisma.ComplianceEventWhereInput;
    limit?: number;
};
export type ComplianceEventUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComplianceEventSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ComplianceEventOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ComplianceEventUpdateManyMutationInput, Prisma.ComplianceEventUncheckedUpdateManyInput>;
    where?: Prisma.ComplianceEventWhereInput;
    limit?: number;
    include?: Prisma.ComplianceEventIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ComplianceEventUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComplianceEventSelect<ExtArgs> | null;
    omit?: Prisma.ComplianceEventOmit<ExtArgs> | null;
    include?: Prisma.ComplianceEventInclude<ExtArgs> | null;
    where: Prisma.ComplianceEventWhereUniqueInput;
    create: Prisma.XOR<Prisma.ComplianceEventCreateInput, Prisma.ComplianceEventUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ComplianceEventUpdateInput, Prisma.ComplianceEventUncheckedUpdateInput>;
};
export type ComplianceEventDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComplianceEventSelect<ExtArgs> | null;
    omit?: Prisma.ComplianceEventOmit<ExtArgs> | null;
    include?: Prisma.ComplianceEventInclude<ExtArgs> | null;
    where: Prisma.ComplianceEventWhereUniqueInput;
};
export type ComplianceEventDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ComplianceEventWhereInput;
    limit?: number;
};
export type ComplianceEventDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ComplianceEventSelect<ExtArgs> | null;
    omit?: Prisma.ComplianceEventOmit<ExtArgs> | null;
    include?: Prisma.ComplianceEventInclude<ExtArgs> | null;
};
export {};
