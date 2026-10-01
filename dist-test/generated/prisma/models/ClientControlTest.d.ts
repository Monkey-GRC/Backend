import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ClientControlTestModel = runtime.Types.Result.DefaultSelection<Prisma.$ClientControlTestPayload>;
export type AggregateClientControlTest = {
    _count: ClientControlTestCountAggregateOutputType | null;
    _min: ClientControlTestMinAggregateOutputType | null;
    _max: ClientControlTestMaxAggregateOutputType | null;
};
export type ClientControlTestMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientControlId: string | null;
    testId: string | null;
};
export type ClientControlTestMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientControlId: string | null;
    testId: string | null;
};
export type ClientControlTestCountAggregateOutputType = {
    id: number;
    tenantId: number;
    clientControlId: number;
    testId: number;
    _all: number;
};
export type ClientControlTestMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientControlId?: true;
    testId?: true;
};
export type ClientControlTestMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientControlId?: true;
    testId?: true;
};
export type ClientControlTestCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientControlId?: true;
    testId?: true;
    _all?: true;
};
export type ClientControlTestAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientControlTestWhereInput;
    orderBy?: Prisma.ClientControlTestOrderByWithRelationInput | Prisma.ClientControlTestOrderByWithRelationInput[];
    cursor?: Prisma.ClientControlTestWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ClientControlTestCountAggregateInputType;
    _min?: ClientControlTestMinAggregateInputType;
    _max?: ClientControlTestMaxAggregateInputType;
};
export type GetClientControlTestAggregateType<T extends ClientControlTestAggregateArgs> = {
    [P in keyof T & keyof AggregateClientControlTest]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateClientControlTest[P]> : Prisma.GetScalarType<T[P], AggregateClientControlTest[P]>;
};
export type ClientControlTestGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientControlTestWhereInput;
    orderBy?: Prisma.ClientControlTestOrderByWithAggregationInput | Prisma.ClientControlTestOrderByWithAggregationInput[];
    by: Prisma.ClientControlTestScalarFieldEnum[] | Prisma.ClientControlTestScalarFieldEnum;
    having?: Prisma.ClientControlTestScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClientControlTestCountAggregateInputType | true;
    _min?: ClientControlTestMinAggregateInputType;
    _max?: ClientControlTestMaxAggregateInputType;
};
export type ClientControlTestGroupByOutputType = {
    id: string;
    tenantId: string;
    clientControlId: string;
    testId: string;
    _count: ClientControlTestCountAggregateOutputType | null;
    _min: ClientControlTestMinAggregateOutputType | null;
    _max: ClientControlTestMaxAggregateOutputType | null;
};
type GetClientControlTestGroupByPayload<T extends ClientControlTestGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ClientControlTestGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ClientControlTestGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ClientControlTestGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ClientControlTestGroupByOutputType[P]>;
}>>;
export type ClientControlTestWhereInput = {
    AND?: Prisma.ClientControlTestWhereInput | Prisma.ClientControlTestWhereInput[];
    OR?: Prisma.ClientControlTestWhereInput[];
    NOT?: Prisma.ClientControlTestWhereInput | Prisma.ClientControlTestWhereInput[];
    id?: Prisma.UuidFilter<"ClientControlTest"> | string;
    tenantId?: Prisma.UuidFilter<"ClientControlTest"> | string;
    clientControlId?: Prisma.UuidFilter<"ClientControlTest"> | string;
    testId?: Prisma.UuidFilter<"ClientControlTest"> | string;
    clientControl?: Prisma.XOR<Prisma.ClientControlScalarRelationFilter, Prisma.ClientControlWhereInput>;
    test?: Prisma.XOR<Prisma.TestScalarRelationFilter, Prisma.TestWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type ClientControlTestOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
    clientControl?: Prisma.ClientControlOrderByWithRelationInput;
    test?: Prisma.TestOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type ClientControlTestWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    clientControlId_testId?: Prisma.ClientControlTestClientControlIdTestIdCompoundUniqueInput;
    AND?: Prisma.ClientControlTestWhereInput | Prisma.ClientControlTestWhereInput[];
    OR?: Prisma.ClientControlTestWhereInput[];
    NOT?: Prisma.ClientControlTestWhereInput | Prisma.ClientControlTestWhereInput[];
    tenantId?: Prisma.UuidFilter<"ClientControlTest"> | string;
    clientControlId?: Prisma.UuidFilter<"ClientControlTest"> | string;
    testId?: Prisma.UuidFilter<"ClientControlTest"> | string;
    clientControl?: Prisma.XOR<Prisma.ClientControlScalarRelationFilter, Prisma.ClientControlWhereInput>;
    test?: Prisma.XOR<Prisma.TestScalarRelationFilter, Prisma.TestWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id" | "clientControlId_testId">;
export type ClientControlTestOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
    _count?: Prisma.ClientControlTestCountOrderByAggregateInput;
    _max?: Prisma.ClientControlTestMaxOrderByAggregateInput;
    _min?: Prisma.ClientControlTestMinOrderByAggregateInput;
};
export type ClientControlTestScalarWhereWithAggregatesInput = {
    AND?: Prisma.ClientControlTestScalarWhereWithAggregatesInput | Prisma.ClientControlTestScalarWhereWithAggregatesInput[];
    OR?: Prisma.ClientControlTestScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ClientControlTestScalarWhereWithAggregatesInput | Prisma.ClientControlTestScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ClientControlTest"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ClientControlTest"> | string;
    clientControlId?: Prisma.UuidWithAggregatesFilter<"ClientControlTest"> | string;
    testId?: Prisma.UuidWithAggregatesFilter<"ClientControlTest"> | string;
};
export type ClientControlTestCreateInput = {
    id?: string;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutTestsInput;
    test: Prisma.TestCreateNestedOneWithoutClientControlTestsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlTestsInput;
};
export type ClientControlTestUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
    testId: string;
};
export type ClientControlTestUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutTestsNestedInput;
    test?: Prisma.TestUpdateOneRequiredWithoutClientControlTestsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlTestsNestedInput;
};
export type ClientControlTestUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientControlTestCreateManyInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
    testId: string;
};
export type ClientControlTestUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientControlTestUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientControlTestListRelationFilter = {
    every?: Prisma.ClientControlTestWhereInput;
    some?: Prisma.ClientControlTestWhereInput;
    none?: Prisma.ClientControlTestWhereInput;
};
export type ClientControlTestOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ClientControlTestClientControlIdTestIdCompoundUniqueInput = {
    clientControlId: string;
    testId: string;
};
export type ClientControlTestCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
};
export type ClientControlTestMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
};
export type ClientControlTestMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
};
export type ClientControlTestCreateNestedManyWithoutTestInput = {
    create?: Prisma.XOR<Prisma.ClientControlTestCreateWithoutTestInput, Prisma.ClientControlTestUncheckedCreateWithoutTestInput> | Prisma.ClientControlTestCreateWithoutTestInput[] | Prisma.ClientControlTestUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.ClientControlTestCreateOrConnectWithoutTestInput | Prisma.ClientControlTestCreateOrConnectWithoutTestInput[];
    createMany?: Prisma.ClientControlTestCreateManyTestInputEnvelope;
    connect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
};
export type ClientControlTestUncheckedCreateNestedManyWithoutTestInput = {
    create?: Prisma.XOR<Prisma.ClientControlTestCreateWithoutTestInput, Prisma.ClientControlTestUncheckedCreateWithoutTestInput> | Prisma.ClientControlTestCreateWithoutTestInput[] | Prisma.ClientControlTestUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.ClientControlTestCreateOrConnectWithoutTestInput | Prisma.ClientControlTestCreateOrConnectWithoutTestInput[];
    createMany?: Prisma.ClientControlTestCreateManyTestInputEnvelope;
    connect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
};
export type ClientControlTestUpdateManyWithoutTestNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlTestCreateWithoutTestInput, Prisma.ClientControlTestUncheckedCreateWithoutTestInput> | Prisma.ClientControlTestCreateWithoutTestInput[] | Prisma.ClientControlTestUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.ClientControlTestCreateOrConnectWithoutTestInput | Prisma.ClientControlTestCreateOrConnectWithoutTestInput[];
    upsert?: Prisma.ClientControlTestUpsertWithWhereUniqueWithoutTestInput | Prisma.ClientControlTestUpsertWithWhereUniqueWithoutTestInput[];
    createMany?: Prisma.ClientControlTestCreateManyTestInputEnvelope;
    set?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    disconnect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    delete?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    connect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    update?: Prisma.ClientControlTestUpdateWithWhereUniqueWithoutTestInput | Prisma.ClientControlTestUpdateWithWhereUniqueWithoutTestInput[];
    updateMany?: Prisma.ClientControlTestUpdateManyWithWhereWithoutTestInput | Prisma.ClientControlTestUpdateManyWithWhereWithoutTestInput[];
    deleteMany?: Prisma.ClientControlTestScalarWhereInput | Prisma.ClientControlTestScalarWhereInput[];
};
export type ClientControlTestUncheckedUpdateManyWithoutTestNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlTestCreateWithoutTestInput, Prisma.ClientControlTestUncheckedCreateWithoutTestInput> | Prisma.ClientControlTestCreateWithoutTestInput[] | Prisma.ClientControlTestUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.ClientControlTestCreateOrConnectWithoutTestInput | Prisma.ClientControlTestCreateOrConnectWithoutTestInput[];
    upsert?: Prisma.ClientControlTestUpsertWithWhereUniqueWithoutTestInput | Prisma.ClientControlTestUpsertWithWhereUniqueWithoutTestInput[];
    createMany?: Prisma.ClientControlTestCreateManyTestInputEnvelope;
    set?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    disconnect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    delete?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    connect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    update?: Prisma.ClientControlTestUpdateWithWhereUniqueWithoutTestInput | Prisma.ClientControlTestUpdateWithWhereUniqueWithoutTestInput[];
    updateMany?: Prisma.ClientControlTestUpdateManyWithWhereWithoutTestInput | Prisma.ClientControlTestUpdateManyWithWhereWithoutTestInput[];
    deleteMany?: Prisma.ClientControlTestScalarWhereInput | Prisma.ClientControlTestScalarWhereInput[];
};
export type ClientControlTestCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ClientControlTestCreateWithoutTenantInput, Prisma.ClientControlTestUncheckedCreateWithoutTenantInput> | Prisma.ClientControlTestCreateWithoutTenantInput[] | Prisma.ClientControlTestUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientControlTestCreateOrConnectWithoutTenantInput | Prisma.ClientControlTestCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ClientControlTestCreateManyTenantInputEnvelope;
    connect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
};
export type ClientControlTestUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ClientControlTestCreateWithoutTenantInput, Prisma.ClientControlTestUncheckedCreateWithoutTenantInput> | Prisma.ClientControlTestCreateWithoutTenantInput[] | Prisma.ClientControlTestUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientControlTestCreateOrConnectWithoutTenantInput | Prisma.ClientControlTestCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ClientControlTestCreateManyTenantInputEnvelope;
    connect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
};
export type ClientControlTestUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlTestCreateWithoutTenantInput, Prisma.ClientControlTestUncheckedCreateWithoutTenantInput> | Prisma.ClientControlTestCreateWithoutTenantInput[] | Prisma.ClientControlTestUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientControlTestCreateOrConnectWithoutTenantInput | Prisma.ClientControlTestCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ClientControlTestUpsertWithWhereUniqueWithoutTenantInput | Prisma.ClientControlTestUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ClientControlTestCreateManyTenantInputEnvelope;
    set?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    disconnect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    delete?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    connect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    update?: Prisma.ClientControlTestUpdateWithWhereUniqueWithoutTenantInput | Prisma.ClientControlTestUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ClientControlTestUpdateManyWithWhereWithoutTenantInput | Prisma.ClientControlTestUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ClientControlTestScalarWhereInput | Prisma.ClientControlTestScalarWhereInput[];
};
export type ClientControlTestUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlTestCreateWithoutTenantInput, Prisma.ClientControlTestUncheckedCreateWithoutTenantInput> | Prisma.ClientControlTestCreateWithoutTenantInput[] | Prisma.ClientControlTestUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientControlTestCreateOrConnectWithoutTenantInput | Prisma.ClientControlTestCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ClientControlTestUpsertWithWhereUniqueWithoutTenantInput | Prisma.ClientControlTestUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ClientControlTestCreateManyTenantInputEnvelope;
    set?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    disconnect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    delete?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    connect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    update?: Prisma.ClientControlTestUpdateWithWhereUniqueWithoutTenantInput | Prisma.ClientControlTestUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ClientControlTestUpdateManyWithWhereWithoutTenantInput | Prisma.ClientControlTestUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ClientControlTestScalarWhereInput | Prisma.ClientControlTestScalarWhereInput[];
};
export type ClientControlTestCreateNestedManyWithoutClientControlInput = {
    create?: Prisma.XOR<Prisma.ClientControlTestCreateWithoutClientControlInput, Prisma.ClientControlTestUncheckedCreateWithoutClientControlInput> | Prisma.ClientControlTestCreateWithoutClientControlInput[] | Prisma.ClientControlTestUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ClientControlTestCreateOrConnectWithoutClientControlInput | Prisma.ClientControlTestCreateOrConnectWithoutClientControlInput[];
    createMany?: Prisma.ClientControlTestCreateManyClientControlInputEnvelope;
    connect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
};
export type ClientControlTestUncheckedCreateNestedManyWithoutClientControlInput = {
    create?: Prisma.XOR<Prisma.ClientControlTestCreateWithoutClientControlInput, Prisma.ClientControlTestUncheckedCreateWithoutClientControlInput> | Prisma.ClientControlTestCreateWithoutClientControlInput[] | Prisma.ClientControlTestUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ClientControlTestCreateOrConnectWithoutClientControlInput | Prisma.ClientControlTestCreateOrConnectWithoutClientControlInput[];
    createMany?: Prisma.ClientControlTestCreateManyClientControlInputEnvelope;
    connect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
};
export type ClientControlTestUpdateManyWithoutClientControlNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlTestCreateWithoutClientControlInput, Prisma.ClientControlTestUncheckedCreateWithoutClientControlInput> | Prisma.ClientControlTestCreateWithoutClientControlInput[] | Prisma.ClientControlTestUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ClientControlTestCreateOrConnectWithoutClientControlInput | Prisma.ClientControlTestCreateOrConnectWithoutClientControlInput[];
    upsert?: Prisma.ClientControlTestUpsertWithWhereUniqueWithoutClientControlInput | Prisma.ClientControlTestUpsertWithWhereUniqueWithoutClientControlInput[];
    createMany?: Prisma.ClientControlTestCreateManyClientControlInputEnvelope;
    set?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    disconnect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    delete?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    connect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    update?: Prisma.ClientControlTestUpdateWithWhereUniqueWithoutClientControlInput | Prisma.ClientControlTestUpdateWithWhereUniqueWithoutClientControlInput[];
    updateMany?: Prisma.ClientControlTestUpdateManyWithWhereWithoutClientControlInput | Prisma.ClientControlTestUpdateManyWithWhereWithoutClientControlInput[];
    deleteMany?: Prisma.ClientControlTestScalarWhereInput | Prisma.ClientControlTestScalarWhereInput[];
};
export type ClientControlTestUncheckedUpdateManyWithoutClientControlNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlTestCreateWithoutClientControlInput, Prisma.ClientControlTestUncheckedCreateWithoutClientControlInput> | Prisma.ClientControlTestCreateWithoutClientControlInput[] | Prisma.ClientControlTestUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ClientControlTestCreateOrConnectWithoutClientControlInput | Prisma.ClientControlTestCreateOrConnectWithoutClientControlInput[];
    upsert?: Prisma.ClientControlTestUpsertWithWhereUniqueWithoutClientControlInput | Prisma.ClientControlTestUpsertWithWhereUniqueWithoutClientControlInput[];
    createMany?: Prisma.ClientControlTestCreateManyClientControlInputEnvelope;
    set?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    disconnect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    delete?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    connect?: Prisma.ClientControlTestWhereUniqueInput | Prisma.ClientControlTestWhereUniqueInput[];
    update?: Prisma.ClientControlTestUpdateWithWhereUniqueWithoutClientControlInput | Prisma.ClientControlTestUpdateWithWhereUniqueWithoutClientControlInput[];
    updateMany?: Prisma.ClientControlTestUpdateManyWithWhereWithoutClientControlInput | Prisma.ClientControlTestUpdateManyWithWhereWithoutClientControlInput[];
    deleteMany?: Prisma.ClientControlTestScalarWhereInput | Prisma.ClientControlTestScalarWhereInput[];
};
export type ClientControlTestCreateWithoutTestInput = {
    id?: string;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutTestsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlTestsInput;
};
export type ClientControlTestUncheckedCreateWithoutTestInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
};
export type ClientControlTestCreateOrConnectWithoutTestInput = {
    where: Prisma.ClientControlTestWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlTestCreateWithoutTestInput, Prisma.ClientControlTestUncheckedCreateWithoutTestInput>;
};
export type ClientControlTestCreateManyTestInputEnvelope = {
    data: Prisma.ClientControlTestCreateManyTestInput | Prisma.ClientControlTestCreateManyTestInput[];
    skipDuplicates?: boolean;
};
export type ClientControlTestUpsertWithWhereUniqueWithoutTestInput = {
    where: Prisma.ClientControlTestWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientControlTestUpdateWithoutTestInput, Prisma.ClientControlTestUncheckedUpdateWithoutTestInput>;
    create: Prisma.XOR<Prisma.ClientControlTestCreateWithoutTestInput, Prisma.ClientControlTestUncheckedCreateWithoutTestInput>;
};
export type ClientControlTestUpdateWithWhereUniqueWithoutTestInput = {
    where: Prisma.ClientControlTestWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientControlTestUpdateWithoutTestInput, Prisma.ClientControlTestUncheckedUpdateWithoutTestInput>;
};
export type ClientControlTestUpdateManyWithWhereWithoutTestInput = {
    where: Prisma.ClientControlTestScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientControlTestUpdateManyMutationInput, Prisma.ClientControlTestUncheckedUpdateManyWithoutTestInput>;
};
export type ClientControlTestScalarWhereInput = {
    AND?: Prisma.ClientControlTestScalarWhereInput | Prisma.ClientControlTestScalarWhereInput[];
    OR?: Prisma.ClientControlTestScalarWhereInput[];
    NOT?: Prisma.ClientControlTestScalarWhereInput | Prisma.ClientControlTestScalarWhereInput[];
    id?: Prisma.UuidFilter<"ClientControlTest"> | string;
    tenantId?: Prisma.UuidFilter<"ClientControlTest"> | string;
    clientControlId?: Prisma.UuidFilter<"ClientControlTest"> | string;
    testId?: Prisma.UuidFilter<"ClientControlTest"> | string;
};
export type ClientControlTestCreateWithoutTenantInput = {
    id?: string;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutTestsInput;
    test: Prisma.TestCreateNestedOneWithoutClientControlTestsInput;
};
export type ClientControlTestUncheckedCreateWithoutTenantInput = {
    id?: string;
    clientControlId: string;
    testId: string;
};
export type ClientControlTestCreateOrConnectWithoutTenantInput = {
    where: Prisma.ClientControlTestWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlTestCreateWithoutTenantInput, Prisma.ClientControlTestUncheckedCreateWithoutTenantInput>;
};
export type ClientControlTestCreateManyTenantInputEnvelope = {
    data: Prisma.ClientControlTestCreateManyTenantInput | Prisma.ClientControlTestCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ClientControlTestUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ClientControlTestWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientControlTestUpdateWithoutTenantInput, Prisma.ClientControlTestUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ClientControlTestCreateWithoutTenantInput, Prisma.ClientControlTestUncheckedCreateWithoutTenantInput>;
};
export type ClientControlTestUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ClientControlTestWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientControlTestUpdateWithoutTenantInput, Prisma.ClientControlTestUncheckedUpdateWithoutTenantInput>;
};
export type ClientControlTestUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ClientControlTestScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientControlTestUpdateManyMutationInput, Prisma.ClientControlTestUncheckedUpdateManyWithoutTenantInput>;
};
export type ClientControlTestCreateWithoutClientControlInput = {
    id?: string;
    test: Prisma.TestCreateNestedOneWithoutClientControlTestsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlTestsInput;
};
export type ClientControlTestUncheckedCreateWithoutClientControlInput = {
    id?: string;
    tenantId: string;
    testId: string;
};
export type ClientControlTestCreateOrConnectWithoutClientControlInput = {
    where: Prisma.ClientControlTestWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlTestCreateWithoutClientControlInput, Prisma.ClientControlTestUncheckedCreateWithoutClientControlInput>;
};
export type ClientControlTestCreateManyClientControlInputEnvelope = {
    data: Prisma.ClientControlTestCreateManyClientControlInput | Prisma.ClientControlTestCreateManyClientControlInput[];
    skipDuplicates?: boolean;
};
export type ClientControlTestUpsertWithWhereUniqueWithoutClientControlInput = {
    where: Prisma.ClientControlTestWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientControlTestUpdateWithoutClientControlInput, Prisma.ClientControlTestUncheckedUpdateWithoutClientControlInput>;
    create: Prisma.XOR<Prisma.ClientControlTestCreateWithoutClientControlInput, Prisma.ClientControlTestUncheckedCreateWithoutClientControlInput>;
};
export type ClientControlTestUpdateWithWhereUniqueWithoutClientControlInput = {
    where: Prisma.ClientControlTestWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientControlTestUpdateWithoutClientControlInput, Prisma.ClientControlTestUncheckedUpdateWithoutClientControlInput>;
};
export type ClientControlTestUpdateManyWithWhereWithoutClientControlInput = {
    where: Prisma.ClientControlTestScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientControlTestUpdateManyMutationInput, Prisma.ClientControlTestUncheckedUpdateManyWithoutClientControlInput>;
};
export type ClientControlTestCreateManyTestInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
};
export type ClientControlTestUpdateWithoutTestInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutTestsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlTestsNestedInput;
};
export type ClientControlTestUncheckedUpdateWithoutTestInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientControlTestUncheckedUpdateManyWithoutTestInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientControlTestCreateManyTenantInput = {
    id?: string;
    clientControlId: string;
    testId: string;
};
export type ClientControlTestUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutTestsNestedInput;
    test?: Prisma.TestUpdateOneRequiredWithoutClientControlTestsNestedInput;
};
export type ClientControlTestUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientControlTestUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientControlTestCreateManyClientControlInput = {
    id?: string;
    tenantId: string;
    testId: string;
};
export type ClientControlTestUpdateWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    test?: Prisma.TestUpdateOneRequiredWithoutClientControlTestsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlTestsNestedInput;
};
export type ClientControlTestUncheckedUpdateWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientControlTestUncheckedUpdateManyWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientControlTestSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    testId?: boolean;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientControlTest"]>;
export type ClientControlTestSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    testId?: boolean;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientControlTest"]>;
export type ClientControlTestSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    testId?: boolean;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientControlTest"]>;
export type ClientControlTestSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    testId?: boolean;
};
export type ClientControlTestOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "clientControlId" | "testId", ExtArgs["result"]["clientControlTest"]>;
export type ClientControlTestInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ClientControlTestIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ClientControlTestIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ClientControlTestPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ClientControlTest";
    objects: {
        clientControl: Prisma.$ClientControlPayload<ExtArgs>;
        test: Prisma.$TestPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        clientControlId: string;
        testId: string;
    }, ExtArgs["result"]["clientControlTest"]>;
    composites: {};
};
export type ClientControlTestGetPayload<S extends boolean | null | undefined | ClientControlTestDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ClientControlTestPayload, S>;
export type ClientControlTestCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ClientControlTestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClientControlTestCountAggregateInputType | true;
};
export interface ClientControlTestDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ClientControlTest'];
        meta: {
            name: 'ClientControlTest';
        };
    };
    findUnique<T extends ClientControlTestFindUniqueArgs>(args: Prisma.SelectSubset<T, ClientControlTestFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ClientControlTestClient<runtime.Types.Result.GetResult<Prisma.$ClientControlTestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ClientControlTestFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ClientControlTestFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientControlTestClient<runtime.Types.Result.GetResult<Prisma.$ClientControlTestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ClientControlTestFindFirstArgs>(args?: Prisma.SelectSubset<T, ClientControlTestFindFirstArgs<ExtArgs>>): Prisma.Prisma__ClientControlTestClient<runtime.Types.Result.GetResult<Prisma.$ClientControlTestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ClientControlTestFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ClientControlTestFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientControlTestClient<runtime.Types.Result.GetResult<Prisma.$ClientControlTestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ClientControlTestFindManyArgs>(args?: Prisma.SelectSubset<T, ClientControlTestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientControlTestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ClientControlTestCreateArgs>(args: Prisma.SelectSubset<T, ClientControlTestCreateArgs<ExtArgs>>): Prisma.Prisma__ClientControlTestClient<runtime.Types.Result.GetResult<Prisma.$ClientControlTestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ClientControlTestCreateManyArgs>(args?: Prisma.SelectSubset<T, ClientControlTestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ClientControlTestCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ClientControlTestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientControlTestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ClientControlTestDeleteArgs>(args: Prisma.SelectSubset<T, ClientControlTestDeleteArgs<ExtArgs>>): Prisma.Prisma__ClientControlTestClient<runtime.Types.Result.GetResult<Prisma.$ClientControlTestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ClientControlTestUpdateArgs>(args: Prisma.SelectSubset<T, ClientControlTestUpdateArgs<ExtArgs>>): Prisma.Prisma__ClientControlTestClient<runtime.Types.Result.GetResult<Prisma.$ClientControlTestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ClientControlTestDeleteManyArgs>(args?: Prisma.SelectSubset<T, ClientControlTestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ClientControlTestUpdateManyArgs>(args: Prisma.SelectSubset<T, ClientControlTestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ClientControlTestUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ClientControlTestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientControlTestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ClientControlTestUpsertArgs>(args: Prisma.SelectSubset<T, ClientControlTestUpsertArgs<ExtArgs>>): Prisma.Prisma__ClientControlTestClient<runtime.Types.Result.GetResult<Prisma.$ClientControlTestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ClientControlTestCountArgs>(args?: Prisma.Subset<T, ClientControlTestCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ClientControlTestCountAggregateOutputType> : number>;
    aggregate<T extends ClientControlTestAggregateArgs>(args: Prisma.Subset<T, ClientControlTestAggregateArgs>): Prisma.PrismaPromise<GetClientControlTestAggregateType<T>>;
    groupBy<T extends ClientControlTestGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ClientControlTestGroupByArgs['orderBy'];
    } : {
        orderBy?: ClientControlTestGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ClientControlTestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientControlTestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ClientControlTestFieldRefs;
}
export interface Prisma__ClientControlTestClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    clientControl<T extends Prisma.ClientControlDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientControlDefaultArgs<ExtArgs>>): Prisma.Prisma__ClientControlClient<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    test<T extends Prisma.TestDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TestDefaultArgs<ExtArgs>>): Prisma.Prisma__TestClient<runtime.Types.Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ClientControlTestFieldRefs {
    readonly id: Prisma.FieldRef<"ClientControlTest", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ClientControlTest", 'String'>;
    readonly clientControlId: Prisma.FieldRef<"ClientControlTest", 'String'>;
    readonly testId: Prisma.FieldRef<"ClientControlTest", 'String'>;
}
export type ClientControlTestFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlTestOmit<ExtArgs> | null;
    include?: Prisma.ClientControlTestInclude<ExtArgs> | null;
    where: Prisma.ClientControlTestWhereUniqueInput;
};
export type ClientControlTestFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlTestOmit<ExtArgs> | null;
    include?: Prisma.ClientControlTestInclude<ExtArgs> | null;
    where: Prisma.ClientControlTestWhereUniqueInput;
};
export type ClientControlTestFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlTestOmit<ExtArgs> | null;
    include?: Prisma.ClientControlTestInclude<ExtArgs> | null;
    where?: Prisma.ClientControlTestWhereInput;
    orderBy?: Prisma.ClientControlTestOrderByWithRelationInput | Prisma.ClientControlTestOrderByWithRelationInput[];
    cursor?: Prisma.ClientControlTestWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientControlTestScalarFieldEnum | Prisma.ClientControlTestScalarFieldEnum[];
};
export type ClientControlTestFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlTestOmit<ExtArgs> | null;
    include?: Prisma.ClientControlTestInclude<ExtArgs> | null;
    where?: Prisma.ClientControlTestWhereInput;
    orderBy?: Prisma.ClientControlTestOrderByWithRelationInput | Prisma.ClientControlTestOrderByWithRelationInput[];
    cursor?: Prisma.ClientControlTestWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientControlTestScalarFieldEnum | Prisma.ClientControlTestScalarFieldEnum[];
};
export type ClientControlTestFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlTestOmit<ExtArgs> | null;
    include?: Prisma.ClientControlTestInclude<ExtArgs> | null;
    where?: Prisma.ClientControlTestWhereInput;
    orderBy?: Prisma.ClientControlTestOrderByWithRelationInput | Prisma.ClientControlTestOrderByWithRelationInput[];
    cursor?: Prisma.ClientControlTestWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientControlTestScalarFieldEnum | Prisma.ClientControlTestScalarFieldEnum[];
};
export type ClientControlTestCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlTestOmit<ExtArgs> | null;
    include?: Prisma.ClientControlTestInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientControlTestCreateInput, Prisma.ClientControlTestUncheckedCreateInput>;
};
export type ClientControlTestCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ClientControlTestCreateManyInput | Prisma.ClientControlTestCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClientControlTestCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlTestSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientControlTestOmit<ExtArgs> | null;
    data: Prisma.ClientControlTestCreateManyInput | Prisma.ClientControlTestCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ClientControlTestIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ClientControlTestUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlTestOmit<ExtArgs> | null;
    include?: Prisma.ClientControlTestInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientControlTestUpdateInput, Prisma.ClientControlTestUncheckedUpdateInput>;
    where: Prisma.ClientControlTestWhereUniqueInput;
};
export type ClientControlTestUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ClientControlTestUpdateManyMutationInput, Prisma.ClientControlTestUncheckedUpdateManyInput>;
    where?: Prisma.ClientControlTestWhereInput;
    limit?: number;
};
export type ClientControlTestUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlTestSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientControlTestOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientControlTestUpdateManyMutationInput, Prisma.ClientControlTestUncheckedUpdateManyInput>;
    where?: Prisma.ClientControlTestWhereInput;
    limit?: number;
    include?: Prisma.ClientControlTestIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ClientControlTestUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlTestOmit<ExtArgs> | null;
    include?: Prisma.ClientControlTestInclude<ExtArgs> | null;
    where: Prisma.ClientControlTestWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlTestCreateInput, Prisma.ClientControlTestUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ClientControlTestUpdateInput, Prisma.ClientControlTestUncheckedUpdateInput>;
};
export type ClientControlTestDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlTestOmit<ExtArgs> | null;
    include?: Prisma.ClientControlTestInclude<ExtArgs> | null;
    where: Prisma.ClientControlTestWhereUniqueInput;
};
export type ClientControlTestDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientControlTestWhereInput;
    limit?: number;
};
export type ClientControlTestDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlTestOmit<ExtArgs> | null;
    include?: Prisma.ClientControlTestInclude<ExtArgs> | null;
};
export {};
