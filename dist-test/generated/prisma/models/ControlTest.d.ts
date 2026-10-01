import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ControlTestModel = runtime.Types.Result.DefaultSelection<Prisma.$ControlTestPayload>;
export type AggregateControlTest = {
    _count: ControlTestCountAggregateOutputType | null;
    _min: ControlTestMinAggregateOutputType | null;
    _max: ControlTestMaxAggregateOutputType | null;
};
export type ControlTestMinAggregateOutputType = {
    id: string | null;
    controlId: string | null;
    testId: string | null;
};
export type ControlTestMaxAggregateOutputType = {
    id: string | null;
    controlId: string | null;
    testId: string | null;
};
export type ControlTestCountAggregateOutputType = {
    id: number;
    controlId: number;
    testId: number;
    _all: number;
};
export type ControlTestMinAggregateInputType = {
    id?: true;
    controlId?: true;
    testId?: true;
};
export type ControlTestMaxAggregateInputType = {
    id?: true;
    controlId?: true;
    testId?: true;
};
export type ControlTestCountAggregateInputType = {
    id?: true;
    controlId?: true;
    testId?: true;
    _all?: true;
};
export type ControlTestAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlTestWhereInput;
    orderBy?: Prisma.ControlTestOrderByWithRelationInput | Prisma.ControlTestOrderByWithRelationInput[];
    cursor?: Prisma.ControlTestWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ControlTestCountAggregateInputType;
    _min?: ControlTestMinAggregateInputType;
    _max?: ControlTestMaxAggregateInputType;
};
export type GetControlTestAggregateType<T extends ControlTestAggregateArgs> = {
    [P in keyof T & keyof AggregateControlTest]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateControlTest[P]> : Prisma.GetScalarType<T[P], AggregateControlTest[P]>;
};
export type ControlTestGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlTestWhereInput;
    orderBy?: Prisma.ControlTestOrderByWithAggregationInput | Prisma.ControlTestOrderByWithAggregationInput[];
    by: Prisma.ControlTestScalarFieldEnum[] | Prisma.ControlTestScalarFieldEnum;
    having?: Prisma.ControlTestScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ControlTestCountAggregateInputType | true;
    _min?: ControlTestMinAggregateInputType;
    _max?: ControlTestMaxAggregateInputType;
};
export type ControlTestGroupByOutputType = {
    id: string;
    controlId: string;
    testId: string;
    _count: ControlTestCountAggregateOutputType | null;
    _min: ControlTestMinAggregateOutputType | null;
    _max: ControlTestMaxAggregateOutputType | null;
};
type GetControlTestGroupByPayload<T extends ControlTestGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ControlTestGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ControlTestGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ControlTestGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ControlTestGroupByOutputType[P]>;
}>>;
export type ControlTestWhereInput = {
    AND?: Prisma.ControlTestWhereInput | Prisma.ControlTestWhereInput[];
    OR?: Prisma.ControlTestWhereInput[];
    NOT?: Prisma.ControlTestWhereInput | Prisma.ControlTestWhereInput[];
    id?: Prisma.UuidFilter<"ControlTest"> | string;
    controlId?: Prisma.UuidFilter<"ControlTest"> | string;
    testId?: Prisma.UuidFilter<"ControlTest"> | string;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
    test?: Prisma.XOR<Prisma.TestScalarRelationFilter, Prisma.TestWhereInput>;
};
export type ControlTestOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
    control?: Prisma.ControlOrderByWithRelationInput;
    test?: Prisma.TestOrderByWithRelationInput;
};
export type ControlTestWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    controlId_testId?: Prisma.ControlTestControlIdTestIdCompoundUniqueInput;
    AND?: Prisma.ControlTestWhereInput | Prisma.ControlTestWhereInput[];
    OR?: Prisma.ControlTestWhereInput[];
    NOT?: Prisma.ControlTestWhereInput | Prisma.ControlTestWhereInput[];
    controlId?: Prisma.UuidFilter<"ControlTest"> | string;
    testId?: Prisma.UuidFilter<"ControlTest"> | string;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
    test?: Prisma.XOR<Prisma.TestScalarRelationFilter, Prisma.TestWhereInput>;
}, "id" | "controlId_testId">;
export type ControlTestOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
    _count?: Prisma.ControlTestCountOrderByAggregateInput;
    _max?: Prisma.ControlTestMaxOrderByAggregateInput;
    _min?: Prisma.ControlTestMinOrderByAggregateInput;
};
export type ControlTestScalarWhereWithAggregatesInput = {
    AND?: Prisma.ControlTestScalarWhereWithAggregatesInput | Prisma.ControlTestScalarWhereWithAggregatesInput[];
    OR?: Prisma.ControlTestScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ControlTestScalarWhereWithAggregatesInput | Prisma.ControlTestScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ControlTest"> | string;
    controlId?: Prisma.UuidWithAggregatesFilter<"ControlTest"> | string;
    testId?: Prisma.UuidWithAggregatesFilter<"ControlTest"> | string;
};
export type ControlTestCreateInput = {
    id?: string;
    control: Prisma.ControlCreateNestedOneWithoutControlTestsInput;
    test: Prisma.TestCreateNestedOneWithoutControlTestsInput;
};
export type ControlTestUncheckedCreateInput = {
    id?: string;
    controlId: string;
    testId: string;
};
export type ControlTestUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    control?: Prisma.ControlUpdateOneRequiredWithoutControlTestsNestedInput;
    test?: Prisma.TestUpdateOneRequiredWithoutControlTestsNestedInput;
};
export type ControlTestUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlTestCreateManyInput = {
    id?: string;
    controlId: string;
    testId: string;
};
export type ControlTestUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlTestUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlTestListRelationFilter = {
    every?: Prisma.ControlTestWhereInput;
    some?: Prisma.ControlTestWhereInput;
    none?: Prisma.ControlTestWhereInput;
};
export type ControlTestOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ControlTestControlIdTestIdCompoundUniqueInput = {
    controlId: string;
    testId: string;
};
export type ControlTestCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
};
export type ControlTestMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
};
export type ControlTestMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
};
export type ControlTestCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.ControlTestCreateWithoutControlInput, Prisma.ControlTestUncheckedCreateWithoutControlInput> | Prisma.ControlTestCreateWithoutControlInput[] | Prisma.ControlTestUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlTestCreateOrConnectWithoutControlInput | Prisma.ControlTestCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.ControlTestCreateManyControlInputEnvelope;
    connect?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
};
export type ControlTestUncheckedCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.ControlTestCreateWithoutControlInput, Prisma.ControlTestUncheckedCreateWithoutControlInput> | Prisma.ControlTestCreateWithoutControlInput[] | Prisma.ControlTestUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlTestCreateOrConnectWithoutControlInput | Prisma.ControlTestCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.ControlTestCreateManyControlInputEnvelope;
    connect?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
};
export type ControlTestUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.ControlTestCreateWithoutControlInput, Prisma.ControlTestUncheckedCreateWithoutControlInput> | Prisma.ControlTestCreateWithoutControlInput[] | Prisma.ControlTestUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlTestCreateOrConnectWithoutControlInput | Prisma.ControlTestCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.ControlTestUpsertWithWhereUniqueWithoutControlInput | Prisma.ControlTestUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.ControlTestCreateManyControlInputEnvelope;
    set?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    disconnect?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    delete?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    connect?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    update?: Prisma.ControlTestUpdateWithWhereUniqueWithoutControlInput | Prisma.ControlTestUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.ControlTestUpdateManyWithWhereWithoutControlInput | Prisma.ControlTestUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.ControlTestScalarWhereInput | Prisma.ControlTestScalarWhereInput[];
};
export type ControlTestUncheckedUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.ControlTestCreateWithoutControlInput, Prisma.ControlTestUncheckedCreateWithoutControlInput> | Prisma.ControlTestCreateWithoutControlInput[] | Prisma.ControlTestUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlTestCreateOrConnectWithoutControlInput | Prisma.ControlTestCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.ControlTestUpsertWithWhereUniqueWithoutControlInput | Prisma.ControlTestUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.ControlTestCreateManyControlInputEnvelope;
    set?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    disconnect?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    delete?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    connect?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    update?: Prisma.ControlTestUpdateWithWhereUniqueWithoutControlInput | Prisma.ControlTestUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.ControlTestUpdateManyWithWhereWithoutControlInput | Prisma.ControlTestUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.ControlTestScalarWhereInput | Prisma.ControlTestScalarWhereInput[];
};
export type ControlTestCreateNestedManyWithoutTestInput = {
    create?: Prisma.XOR<Prisma.ControlTestCreateWithoutTestInput, Prisma.ControlTestUncheckedCreateWithoutTestInput> | Prisma.ControlTestCreateWithoutTestInput[] | Prisma.ControlTestUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.ControlTestCreateOrConnectWithoutTestInput | Prisma.ControlTestCreateOrConnectWithoutTestInput[];
    createMany?: Prisma.ControlTestCreateManyTestInputEnvelope;
    connect?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
};
export type ControlTestUncheckedCreateNestedManyWithoutTestInput = {
    create?: Prisma.XOR<Prisma.ControlTestCreateWithoutTestInput, Prisma.ControlTestUncheckedCreateWithoutTestInput> | Prisma.ControlTestCreateWithoutTestInput[] | Prisma.ControlTestUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.ControlTestCreateOrConnectWithoutTestInput | Prisma.ControlTestCreateOrConnectWithoutTestInput[];
    createMany?: Prisma.ControlTestCreateManyTestInputEnvelope;
    connect?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
};
export type ControlTestUpdateManyWithoutTestNestedInput = {
    create?: Prisma.XOR<Prisma.ControlTestCreateWithoutTestInput, Prisma.ControlTestUncheckedCreateWithoutTestInput> | Prisma.ControlTestCreateWithoutTestInput[] | Prisma.ControlTestUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.ControlTestCreateOrConnectWithoutTestInput | Prisma.ControlTestCreateOrConnectWithoutTestInput[];
    upsert?: Prisma.ControlTestUpsertWithWhereUniqueWithoutTestInput | Prisma.ControlTestUpsertWithWhereUniqueWithoutTestInput[];
    createMany?: Prisma.ControlTestCreateManyTestInputEnvelope;
    set?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    disconnect?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    delete?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    connect?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    update?: Prisma.ControlTestUpdateWithWhereUniqueWithoutTestInput | Prisma.ControlTestUpdateWithWhereUniqueWithoutTestInput[];
    updateMany?: Prisma.ControlTestUpdateManyWithWhereWithoutTestInput | Prisma.ControlTestUpdateManyWithWhereWithoutTestInput[];
    deleteMany?: Prisma.ControlTestScalarWhereInput | Prisma.ControlTestScalarWhereInput[];
};
export type ControlTestUncheckedUpdateManyWithoutTestNestedInput = {
    create?: Prisma.XOR<Prisma.ControlTestCreateWithoutTestInput, Prisma.ControlTestUncheckedCreateWithoutTestInput> | Prisma.ControlTestCreateWithoutTestInput[] | Prisma.ControlTestUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.ControlTestCreateOrConnectWithoutTestInput | Prisma.ControlTestCreateOrConnectWithoutTestInput[];
    upsert?: Prisma.ControlTestUpsertWithWhereUniqueWithoutTestInput | Prisma.ControlTestUpsertWithWhereUniqueWithoutTestInput[];
    createMany?: Prisma.ControlTestCreateManyTestInputEnvelope;
    set?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    disconnect?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    delete?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    connect?: Prisma.ControlTestWhereUniqueInput | Prisma.ControlTestWhereUniqueInput[];
    update?: Prisma.ControlTestUpdateWithWhereUniqueWithoutTestInput | Prisma.ControlTestUpdateWithWhereUniqueWithoutTestInput[];
    updateMany?: Prisma.ControlTestUpdateManyWithWhereWithoutTestInput | Prisma.ControlTestUpdateManyWithWhereWithoutTestInput[];
    deleteMany?: Prisma.ControlTestScalarWhereInput | Prisma.ControlTestScalarWhereInput[];
};
export type ControlTestCreateWithoutControlInput = {
    id?: string;
    test: Prisma.TestCreateNestedOneWithoutControlTestsInput;
};
export type ControlTestUncheckedCreateWithoutControlInput = {
    id?: string;
    testId: string;
};
export type ControlTestCreateOrConnectWithoutControlInput = {
    where: Prisma.ControlTestWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlTestCreateWithoutControlInput, Prisma.ControlTestUncheckedCreateWithoutControlInput>;
};
export type ControlTestCreateManyControlInputEnvelope = {
    data: Prisma.ControlTestCreateManyControlInput | Prisma.ControlTestCreateManyControlInput[];
    skipDuplicates?: boolean;
};
export type ControlTestUpsertWithWhereUniqueWithoutControlInput = {
    where: Prisma.ControlTestWhereUniqueInput;
    update: Prisma.XOR<Prisma.ControlTestUpdateWithoutControlInput, Prisma.ControlTestUncheckedUpdateWithoutControlInput>;
    create: Prisma.XOR<Prisma.ControlTestCreateWithoutControlInput, Prisma.ControlTestUncheckedCreateWithoutControlInput>;
};
export type ControlTestUpdateWithWhereUniqueWithoutControlInput = {
    where: Prisma.ControlTestWhereUniqueInput;
    data: Prisma.XOR<Prisma.ControlTestUpdateWithoutControlInput, Prisma.ControlTestUncheckedUpdateWithoutControlInput>;
};
export type ControlTestUpdateManyWithWhereWithoutControlInput = {
    where: Prisma.ControlTestScalarWhereInput;
    data: Prisma.XOR<Prisma.ControlTestUpdateManyMutationInput, Prisma.ControlTestUncheckedUpdateManyWithoutControlInput>;
};
export type ControlTestScalarWhereInput = {
    AND?: Prisma.ControlTestScalarWhereInput | Prisma.ControlTestScalarWhereInput[];
    OR?: Prisma.ControlTestScalarWhereInput[];
    NOT?: Prisma.ControlTestScalarWhereInput | Prisma.ControlTestScalarWhereInput[];
    id?: Prisma.UuidFilter<"ControlTest"> | string;
    controlId?: Prisma.UuidFilter<"ControlTest"> | string;
    testId?: Prisma.UuidFilter<"ControlTest"> | string;
};
export type ControlTestCreateWithoutTestInput = {
    id?: string;
    control: Prisma.ControlCreateNestedOneWithoutControlTestsInput;
};
export type ControlTestUncheckedCreateWithoutTestInput = {
    id?: string;
    controlId: string;
};
export type ControlTestCreateOrConnectWithoutTestInput = {
    where: Prisma.ControlTestWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlTestCreateWithoutTestInput, Prisma.ControlTestUncheckedCreateWithoutTestInput>;
};
export type ControlTestCreateManyTestInputEnvelope = {
    data: Prisma.ControlTestCreateManyTestInput | Prisma.ControlTestCreateManyTestInput[];
    skipDuplicates?: boolean;
};
export type ControlTestUpsertWithWhereUniqueWithoutTestInput = {
    where: Prisma.ControlTestWhereUniqueInput;
    update: Prisma.XOR<Prisma.ControlTestUpdateWithoutTestInput, Prisma.ControlTestUncheckedUpdateWithoutTestInput>;
    create: Prisma.XOR<Prisma.ControlTestCreateWithoutTestInput, Prisma.ControlTestUncheckedCreateWithoutTestInput>;
};
export type ControlTestUpdateWithWhereUniqueWithoutTestInput = {
    where: Prisma.ControlTestWhereUniqueInput;
    data: Prisma.XOR<Prisma.ControlTestUpdateWithoutTestInput, Prisma.ControlTestUncheckedUpdateWithoutTestInput>;
};
export type ControlTestUpdateManyWithWhereWithoutTestInput = {
    where: Prisma.ControlTestScalarWhereInput;
    data: Prisma.XOR<Prisma.ControlTestUpdateManyMutationInput, Prisma.ControlTestUncheckedUpdateManyWithoutTestInput>;
};
export type ControlTestCreateManyControlInput = {
    id?: string;
    testId: string;
};
export type ControlTestUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    test?: Prisma.TestUpdateOneRequiredWithoutControlTestsNestedInput;
};
export type ControlTestUncheckedUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlTestUncheckedUpdateManyWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlTestCreateManyTestInput = {
    id?: string;
    controlId: string;
};
export type ControlTestUpdateWithoutTestInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    control?: Prisma.ControlUpdateOneRequiredWithoutControlTestsNestedInput;
};
export type ControlTestUncheckedUpdateWithoutTestInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlTestUncheckedUpdateManyWithoutTestInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlTestSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    testId?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlTest"]>;
export type ControlTestSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    testId?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlTest"]>;
export type ControlTestSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    testId?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlTest"]>;
export type ControlTestSelectScalar = {
    id?: boolean;
    controlId?: boolean;
    testId?: boolean;
};
export type ControlTestOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "controlId" | "testId", ExtArgs["result"]["controlTest"]>;
export type ControlTestInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
};
export type ControlTestIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
};
export type ControlTestIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
};
export type $ControlTestPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ControlTest";
    objects: {
        control: Prisma.$ControlPayload<ExtArgs>;
        test: Prisma.$TestPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        controlId: string;
        testId: string;
    }, ExtArgs["result"]["controlTest"]>;
    composites: {};
};
export type ControlTestGetPayload<S extends boolean | null | undefined | ControlTestDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ControlTestPayload, S>;
export type ControlTestCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ControlTestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ControlTestCountAggregateInputType | true;
};
export interface ControlTestDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ControlTest'];
        meta: {
            name: 'ControlTest';
        };
    };
    findUnique<T extends ControlTestFindUniqueArgs>(args: Prisma.SelectSubset<T, ControlTestFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ControlTestClient<runtime.Types.Result.GetResult<Prisma.$ControlTestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ControlTestFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ControlTestFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ControlTestClient<runtime.Types.Result.GetResult<Prisma.$ControlTestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ControlTestFindFirstArgs>(args?: Prisma.SelectSubset<T, ControlTestFindFirstArgs<ExtArgs>>): Prisma.Prisma__ControlTestClient<runtime.Types.Result.GetResult<Prisma.$ControlTestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ControlTestFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ControlTestFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ControlTestClient<runtime.Types.Result.GetResult<Prisma.$ControlTestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ControlTestFindManyArgs>(args?: Prisma.SelectSubset<T, ControlTestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlTestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ControlTestCreateArgs>(args: Prisma.SelectSubset<T, ControlTestCreateArgs<ExtArgs>>): Prisma.Prisma__ControlTestClient<runtime.Types.Result.GetResult<Prisma.$ControlTestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ControlTestCreateManyArgs>(args?: Prisma.SelectSubset<T, ControlTestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ControlTestCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ControlTestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlTestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ControlTestDeleteArgs>(args: Prisma.SelectSubset<T, ControlTestDeleteArgs<ExtArgs>>): Prisma.Prisma__ControlTestClient<runtime.Types.Result.GetResult<Prisma.$ControlTestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ControlTestUpdateArgs>(args: Prisma.SelectSubset<T, ControlTestUpdateArgs<ExtArgs>>): Prisma.Prisma__ControlTestClient<runtime.Types.Result.GetResult<Prisma.$ControlTestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ControlTestDeleteManyArgs>(args?: Prisma.SelectSubset<T, ControlTestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ControlTestUpdateManyArgs>(args: Prisma.SelectSubset<T, ControlTestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ControlTestUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ControlTestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlTestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ControlTestUpsertArgs>(args: Prisma.SelectSubset<T, ControlTestUpsertArgs<ExtArgs>>): Prisma.Prisma__ControlTestClient<runtime.Types.Result.GetResult<Prisma.$ControlTestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ControlTestCountArgs>(args?: Prisma.Subset<T, ControlTestCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ControlTestCountAggregateOutputType> : number>;
    aggregate<T extends ControlTestAggregateArgs>(args: Prisma.Subset<T, ControlTestAggregateArgs>): Prisma.PrismaPromise<GetControlTestAggregateType<T>>;
    groupBy<T extends ControlTestGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ControlTestGroupByArgs['orderBy'];
    } : {
        orderBy?: ControlTestGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ControlTestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetControlTestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ControlTestFieldRefs;
}
export interface Prisma__ControlTestClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    control<T extends Prisma.ControlDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ControlDefaultArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    test<T extends Prisma.TestDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TestDefaultArgs<ExtArgs>>): Prisma.Prisma__TestClient<runtime.Types.Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ControlTestFieldRefs {
    readonly id: Prisma.FieldRef<"ControlTest", 'String'>;
    readonly controlId: Prisma.FieldRef<"ControlTest", 'String'>;
    readonly testId: Prisma.FieldRef<"ControlTest", 'String'>;
}
export type ControlTestFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ControlTestOmit<ExtArgs> | null;
    include?: Prisma.ControlTestInclude<ExtArgs> | null;
    where: Prisma.ControlTestWhereUniqueInput;
};
export type ControlTestFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ControlTestOmit<ExtArgs> | null;
    include?: Prisma.ControlTestInclude<ExtArgs> | null;
    where: Prisma.ControlTestWhereUniqueInput;
};
export type ControlTestFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ControlTestOmit<ExtArgs> | null;
    include?: Prisma.ControlTestInclude<ExtArgs> | null;
    where?: Prisma.ControlTestWhereInput;
    orderBy?: Prisma.ControlTestOrderByWithRelationInput | Prisma.ControlTestOrderByWithRelationInput[];
    cursor?: Prisma.ControlTestWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlTestScalarFieldEnum | Prisma.ControlTestScalarFieldEnum[];
};
export type ControlTestFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ControlTestOmit<ExtArgs> | null;
    include?: Prisma.ControlTestInclude<ExtArgs> | null;
    where?: Prisma.ControlTestWhereInput;
    orderBy?: Prisma.ControlTestOrderByWithRelationInput | Prisma.ControlTestOrderByWithRelationInput[];
    cursor?: Prisma.ControlTestWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlTestScalarFieldEnum | Prisma.ControlTestScalarFieldEnum[];
};
export type ControlTestFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ControlTestOmit<ExtArgs> | null;
    include?: Prisma.ControlTestInclude<ExtArgs> | null;
    where?: Prisma.ControlTestWhereInput;
    orderBy?: Prisma.ControlTestOrderByWithRelationInput | Prisma.ControlTestOrderByWithRelationInput[];
    cursor?: Prisma.ControlTestWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlTestScalarFieldEnum | Prisma.ControlTestScalarFieldEnum[];
};
export type ControlTestCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ControlTestOmit<ExtArgs> | null;
    include?: Prisma.ControlTestInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlTestCreateInput, Prisma.ControlTestUncheckedCreateInput>;
};
export type ControlTestCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ControlTestCreateManyInput | Prisma.ControlTestCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ControlTestCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlTestSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ControlTestOmit<ExtArgs> | null;
    data: Prisma.ControlTestCreateManyInput | Prisma.ControlTestCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ControlTestIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ControlTestUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ControlTestOmit<ExtArgs> | null;
    include?: Prisma.ControlTestInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlTestUpdateInput, Prisma.ControlTestUncheckedUpdateInput>;
    where: Prisma.ControlTestWhereUniqueInput;
};
export type ControlTestUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ControlTestUpdateManyMutationInput, Prisma.ControlTestUncheckedUpdateManyInput>;
    where?: Prisma.ControlTestWhereInput;
    limit?: number;
};
export type ControlTestUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlTestSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ControlTestOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlTestUpdateManyMutationInput, Prisma.ControlTestUncheckedUpdateManyInput>;
    where?: Prisma.ControlTestWhereInput;
    limit?: number;
    include?: Prisma.ControlTestIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ControlTestUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ControlTestOmit<ExtArgs> | null;
    include?: Prisma.ControlTestInclude<ExtArgs> | null;
    where: Prisma.ControlTestWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlTestCreateInput, Prisma.ControlTestUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ControlTestUpdateInput, Prisma.ControlTestUncheckedUpdateInput>;
};
export type ControlTestDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ControlTestOmit<ExtArgs> | null;
    include?: Prisma.ControlTestInclude<ExtArgs> | null;
    where: Prisma.ControlTestWhereUniqueInput;
};
export type ControlTestDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlTestWhereInput;
    limit?: number;
};
export type ControlTestDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ControlTestOmit<ExtArgs> | null;
    include?: Prisma.ControlTestInclude<ExtArgs> | null;
};
export {};
