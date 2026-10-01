import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TestCheckModel = runtime.Types.Result.DefaultSelection<Prisma.$TestCheckPayload>;
export type AggregateTestCheck = {
    _count: TestCheckCountAggregateOutputType | null;
    _min: TestCheckMinAggregateOutputType | null;
    _max: TestCheckMaxAggregateOutputType | null;
};
export type TestCheckMinAggregateOutputType = {
    id: string | null;
    testId: string | null;
    checkId: string | null;
};
export type TestCheckMaxAggregateOutputType = {
    id: string | null;
    testId: string | null;
    checkId: string | null;
};
export type TestCheckCountAggregateOutputType = {
    id: number;
    testId: number;
    checkId: number;
    _all: number;
};
export type TestCheckMinAggregateInputType = {
    id?: true;
    testId?: true;
    checkId?: true;
};
export type TestCheckMaxAggregateInputType = {
    id?: true;
    testId?: true;
    checkId?: true;
};
export type TestCheckCountAggregateInputType = {
    id?: true;
    testId?: true;
    checkId?: true;
    _all?: true;
};
export type TestCheckAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TestCheckWhereInput;
    orderBy?: Prisma.TestCheckOrderByWithRelationInput | Prisma.TestCheckOrderByWithRelationInput[];
    cursor?: Prisma.TestCheckWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TestCheckCountAggregateInputType;
    _min?: TestCheckMinAggregateInputType;
    _max?: TestCheckMaxAggregateInputType;
};
export type GetTestCheckAggregateType<T extends TestCheckAggregateArgs> = {
    [P in keyof T & keyof AggregateTestCheck]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTestCheck[P]> : Prisma.GetScalarType<T[P], AggregateTestCheck[P]>;
};
export type TestCheckGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TestCheckWhereInput;
    orderBy?: Prisma.TestCheckOrderByWithAggregationInput | Prisma.TestCheckOrderByWithAggregationInput[];
    by: Prisma.TestCheckScalarFieldEnum[] | Prisma.TestCheckScalarFieldEnum;
    having?: Prisma.TestCheckScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TestCheckCountAggregateInputType | true;
    _min?: TestCheckMinAggregateInputType;
    _max?: TestCheckMaxAggregateInputType;
};
export type TestCheckGroupByOutputType = {
    id: string;
    testId: string;
    checkId: string;
    _count: TestCheckCountAggregateOutputType | null;
    _min: TestCheckMinAggregateOutputType | null;
    _max: TestCheckMaxAggregateOutputType | null;
};
type GetTestCheckGroupByPayload<T extends TestCheckGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TestCheckGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TestCheckGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TestCheckGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TestCheckGroupByOutputType[P]>;
}>>;
export type TestCheckWhereInput = {
    AND?: Prisma.TestCheckWhereInput | Prisma.TestCheckWhereInput[];
    OR?: Prisma.TestCheckWhereInput[];
    NOT?: Prisma.TestCheckWhereInput | Prisma.TestCheckWhereInput[];
    id?: Prisma.UuidFilter<"TestCheck"> | string;
    testId?: Prisma.UuidFilter<"TestCheck"> | string;
    checkId?: Prisma.UuidFilter<"TestCheck"> | string;
    test?: Prisma.XOR<Prisma.TestScalarRelationFilter, Prisma.TestWhereInput>;
    check?: Prisma.XOR<Prisma.CheckScalarRelationFilter, Prisma.CheckWhereInput>;
};
export type TestCheckOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    test?: Prisma.TestOrderByWithRelationInput;
    check?: Prisma.CheckOrderByWithRelationInput;
};
export type TestCheckWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    testId_checkId?: Prisma.TestCheckTestIdCheckIdCompoundUniqueInput;
    AND?: Prisma.TestCheckWhereInput | Prisma.TestCheckWhereInput[];
    OR?: Prisma.TestCheckWhereInput[];
    NOT?: Prisma.TestCheckWhereInput | Prisma.TestCheckWhereInput[];
    testId?: Prisma.UuidFilter<"TestCheck"> | string;
    checkId?: Prisma.UuidFilter<"TestCheck"> | string;
    test?: Prisma.XOR<Prisma.TestScalarRelationFilter, Prisma.TestWhereInput>;
    check?: Prisma.XOR<Prisma.CheckScalarRelationFilter, Prisma.CheckWhereInput>;
}, "id" | "testId_checkId">;
export type TestCheckOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    _count?: Prisma.TestCheckCountOrderByAggregateInput;
    _max?: Prisma.TestCheckMaxOrderByAggregateInput;
    _min?: Prisma.TestCheckMinOrderByAggregateInput;
};
export type TestCheckScalarWhereWithAggregatesInput = {
    AND?: Prisma.TestCheckScalarWhereWithAggregatesInput | Prisma.TestCheckScalarWhereWithAggregatesInput[];
    OR?: Prisma.TestCheckScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TestCheckScalarWhereWithAggregatesInput | Prisma.TestCheckScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"TestCheck"> | string;
    testId?: Prisma.UuidWithAggregatesFilter<"TestCheck"> | string;
    checkId?: Prisma.UuidWithAggregatesFilter<"TestCheck"> | string;
};
export type TestCheckCreateInput = {
    id?: string;
    test: Prisma.TestCreateNestedOneWithoutTestChecksInput;
    check: Prisma.CheckCreateNestedOneWithoutTestChecksInput;
};
export type TestCheckUncheckedCreateInput = {
    id?: string;
    testId: string;
    checkId: string;
};
export type TestCheckUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    test?: Prisma.TestUpdateOneRequiredWithoutTestChecksNestedInput;
    check?: Prisma.CheckUpdateOneRequiredWithoutTestChecksNestedInput;
};
export type TestCheckUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TestCheckCreateManyInput = {
    id?: string;
    testId: string;
    checkId: string;
};
export type TestCheckUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TestCheckUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TestCheckListRelationFilter = {
    every?: Prisma.TestCheckWhereInput;
    some?: Prisma.TestCheckWhereInput;
    none?: Prisma.TestCheckWhereInput;
};
export type TestCheckOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TestCheckTestIdCheckIdCompoundUniqueInput = {
    testId: string;
    checkId: string;
};
export type TestCheckCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
};
export type TestCheckMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
};
export type TestCheckMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    testId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
};
export type TestCheckCreateNestedManyWithoutTestInput = {
    create?: Prisma.XOR<Prisma.TestCheckCreateWithoutTestInput, Prisma.TestCheckUncheckedCreateWithoutTestInput> | Prisma.TestCheckCreateWithoutTestInput[] | Prisma.TestCheckUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.TestCheckCreateOrConnectWithoutTestInput | Prisma.TestCheckCreateOrConnectWithoutTestInput[];
    createMany?: Prisma.TestCheckCreateManyTestInputEnvelope;
    connect?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
};
export type TestCheckUncheckedCreateNestedManyWithoutTestInput = {
    create?: Prisma.XOR<Prisma.TestCheckCreateWithoutTestInput, Prisma.TestCheckUncheckedCreateWithoutTestInput> | Prisma.TestCheckCreateWithoutTestInput[] | Prisma.TestCheckUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.TestCheckCreateOrConnectWithoutTestInput | Prisma.TestCheckCreateOrConnectWithoutTestInput[];
    createMany?: Prisma.TestCheckCreateManyTestInputEnvelope;
    connect?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
};
export type TestCheckUpdateManyWithoutTestNestedInput = {
    create?: Prisma.XOR<Prisma.TestCheckCreateWithoutTestInput, Prisma.TestCheckUncheckedCreateWithoutTestInput> | Prisma.TestCheckCreateWithoutTestInput[] | Prisma.TestCheckUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.TestCheckCreateOrConnectWithoutTestInput | Prisma.TestCheckCreateOrConnectWithoutTestInput[];
    upsert?: Prisma.TestCheckUpsertWithWhereUniqueWithoutTestInput | Prisma.TestCheckUpsertWithWhereUniqueWithoutTestInput[];
    createMany?: Prisma.TestCheckCreateManyTestInputEnvelope;
    set?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    disconnect?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    delete?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    connect?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    update?: Prisma.TestCheckUpdateWithWhereUniqueWithoutTestInput | Prisma.TestCheckUpdateWithWhereUniqueWithoutTestInput[];
    updateMany?: Prisma.TestCheckUpdateManyWithWhereWithoutTestInput | Prisma.TestCheckUpdateManyWithWhereWithoutTestInput[];
    deleteMany?: Prisma.TestCheckScalarWhereInput | Prisma.TestCheckScalarWhereInput[];
};
export type TestCheckUncheckedUpdateManyWithoutTestNestedInput = {
    create?: Prisma.XOR<Prisma.TestCheckCreateWithoutTestInput, Prisma.TestCheckUncheckedCreateWithoutTestInput> | Prisma.TestCheckCreateWithoutTestInput[] | Prisma.TestCheckUncheckedCreateWithoutTestInput[];
    connectOrCreate?: Prisma.TestCheckCreateOrConnectWithoutTestInput | Prisma.TestCheckCreateOrConnectWithoutTestInput[];
    upsert?: Prisma.TestCheckUpsertWithWhereUniqueWithoutTestInput | Prisma.TestCheckUpsertWithWhereUniqueWithoutTestInput[];
    createMany?: Prisma.TestCheckCreateManyTestInputEnvelope;
    set?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    disconnect?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    delete?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    connect?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    update?: Prisma.TestCheckUpdateWithWhereUniqueWithoutTestInput | Prisma.TestCheckUpdateWithWhereUniqueWithoutTestInput[];
    updateMany?: Prisma.TestCheckUpdateManyWithWhereWithoutTestInput | Prisma.TestCheckUpdateManyWithWhereWithoutTestInput[];
    deleteMany?: Prisma.TestCheckScalarWhereInput | Prisma.TestCheckScalarWhereInput[];
};
export type TestCheckCreateNestedManyWithoutCheckInput = {
    create?: Prisma.XOR<Prisma.TestCheckCreateWithoutCheckInput, Prisma.TestCheckUncheckedCreateWithoutCheckInput> | Prisma.TestCheckCreateWithoutCheckInput[] | Prisma.TestCheckUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.TestCheckCreateOrConnectWithoutCheckInput | Prisma.TestCheckCreateOrConnectWithoutCheckInput[];
    createMany?: Prisma.TestCheckCreateManyCheckInputEnvelope;
    connect?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
};
export type TestCheckUncheckedCreateNestedManyWithoutCheckInput = {
    create?: Prisma.XOR<Prisma.TestCheckCreateWithoutCheckInput, Prisma.TestCheckUncheckedCreateWithoutCheckInput> | Prisma.TestCheckCreateWithoutCheckInput[] | Prisma.TestCheckUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.TestCheckCreateOrConnectWithoutCheckInput | Prisma.TestCheckCreateOrConnectWithoutCheckInput[];
    createMany?: Prisma.TestCheckCreateManyCheckInputEnvelope;
    connect?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
};
export type TestCheckUpdateManyWithoutCheckNestedInput = {
    create?: Prisma.XOR<Prisma.TestCheckCreateWithoutCheckInput, Prisma.TestCheckUncheckedCreateWithoutCheckInput> | Prisma.TestCheckCreateWithoutCheckInput[] | Prisma.TestCheckUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.TestCheckCreateOrConnectWithoutCheckInput | Prisma.TestCheckCreateOrConnectWithoutCheckInput[];
    upsert?: Prisma.TestCheckUpsertWithWhereUniqueWithoutCheckInput | Prisma.TestCheckUpsertWithWhereUniqueWithoutCheckInput[];
    createMany?: Prisma.TestCheckCreateManyCheckInputEnvelope;
    set?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    disconnect?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    delete?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    connect?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    update?: Prisma.TestCheckUpdateWithWhereUniqueWithoutCheckInput | Prisma.TestCheckUpdateWithWhereUniqueWithoutCheckInput[];
    updateMany?: Prisma.TestCheckUpdateManyWithWhereWithoutCheckInput | Prisma.TestCheckUpdateManyWithWhereWithoutCheckInput[];
    deleteMany?: Prisma.TestCheckScalarWhereInput | Prisma.TestCheckScalarWhereInput[];
};
export type TestCheckUncheckedUpdateManyWithoutCheckNestedInput = {
    create?: Prisma.XOR<Prisma.TestCheckCreateWithoutCheckInput, Prisma.TestCheckUncheckedCreateWithoutCheckInput> | Prisma.TestCheckCreateWithoutCheckInput[] | Prisma.TestCheckUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.TestCheckCreateOrConnectWithoutCheckInput | Prisma.TestCheckCreateOrConnectWithoutCheckInput[];
    upsert?: Prisma.TestCheckUpsertWithWhereUniqueWithoutCheckInput | Prisma.TestCheckUpsertWithWhereUniqueWithoutCheckInput[];
    createMany?: Prisma.TestCheckCreateManyCheckInputEnvelope;
    set?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    disconnect?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    delete?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    connect?: Prisma.TestCheckWhereUniqueInput | Prisma.TestCheckWhereUniqueInput[];
    update?: Prisma.TestCheckUpdateWithWhereUniqueWithoutCheckInput | Prisma.TestCheckUpdateWithWhereUniqueWithoutCheckInput[];
    updateMany?: Prisma.TestCheckUpdateManyWithWhereWithoutCheckInput | Prisma.TestCheckUpdateManyWithWhereWithoutCheckInput[];
    deleteMany?: Prisma.TestCheckScalarWhereInput | Prisma.TestCheckScalarWhereInput[];
};
export type TestCheckCreateWithoutTestInput = {
    id?: string;
    check: Prisma.CheckCreateNestedOneWithoutTestChecksInput;
};
export type TestCheckUncheckedCreateWithoutTestInput = {
    id?: string;
    checkId: string;
};
export type TestCheckCreateOrConnectWithoutTestInput = {
    where: Prisma.TestCheckWhereUniqueInput;
    create: Prisma.XOR<Prisma.TestCheckCreateWithoutTestInput, Prisma.TestCheckUncheckedCreateWithoutTestInput>;
};
export type TestCheckCreateManyTestInputEnvelope = {
    data: Prisma.TestCheckCreateManyTestInput | Prisma.TestCheckCreateManyTestInput[];
    skipDuplicates?: boolean;
};
export type TestCheckUpsertWithWhereUniqueWithoutTestInput = {
    where: Prisma.TestCheckWhereUniqueInput;
    update: Prisma.XOR<Prisma.TestCheckUpdateWithoutTestInput, Prisma.TestCheckUncheckedUpdateWithoutTestInput>;
    create: Prisma.XOR<Prisma.TestCheckCreateWithoutTestInput, Prisma.TestCheckUncheckedCreateWithoutTestInput>;
};
export type TestCheckUpdateWithWhereUniqueWithoutTestInput = {
    where: Prisma.TestCheckWhereUniqueInput;
    data: Prisma.XOR<Prisma.TestCheckUpdateWithoutTestInput, Prisma.TestCheckUncheckedUpdateWithoutTestInput>;
};
export type TestCheckUpdateManyWithWhereWithoutTestInput = {
    where: Prisma.TestCheckScalarWhereInput;
    data: Prisma.XOR<Prisma.TestCheckUpdateManyMutationInput, Prisma.TestCheckUncheckedUpdateManyWithoutTestInput>;
};
export type TestCheckScalarWhereInput = {
    AND?: Prisma.TestCheckScalarWhereInput | Prisma.TestCheckScalarWhereInput[];
    OR?: Prisma.TestCheckScalarWhereInput[];
    NOT?: Prisma.TestCheckScalarWhereInput | Prisma.TestCheckScalarWhereInput[];
    id?: Prisma.UuidFilter<"TestCheck"> | string;
    testId?: Prisma.UuidFilter<"TestCheck"> | string;
    checkId?: Prisma.UuidFilter<"TestCheck"> | string;
};
export type TestCheckCreateWithoutCheckInput = {
    id?: string;
    test: Prisma.TestCreateNestedOneWithoutTestChecksInput;
};
export type TestCheckUncheckedCreateWithoutCheckInput = {
    id?: string;
    testId: string;
};
export type TestCheckCreateOrConnectWithoutCheckInput = {
    where: Prisma.TestCheckWhereUniqueInput;
    create: Prisma.XOR<Prisma.TestCheckCreateWithoutCheckInput, Prisma.TestCheckUncheckedCreateWithoutCheckInput>;
};
export type TestCheckCreateManyCheckInputEnvelope = {
    data: Prisma.TestCheckCreateManyCheckInput | Prisma.TestCheckCreateManyCheckInput[];
    skipDuplicates?: boolean;
};
export type TestCheckUpsertWithWhereUniqueWithoutCheckInput = {
    where: Prisma.TestCheckWhereUniqueInput;
    update: Prisma.XOR<Prisma.TestCheckUpdateWithoutCheckInput, Prisma.TestCheckUncheckedUpdateWithoutCheckInput>;
    create: Prisma.XOR<Prisma.TestCheckCreateWithoutCheckInput, Prisma.TestCheckUncheckedCreateWithoutCheckInput>;
};
export type TestCheckUpdateWithWhereUniqueWithoutCheckInput = {
    where: Prisma.TestCheckWhereUniqueInput;
    data: Prisma.XOR<Prisma.TestCheckUpdateWithoutCheckInput, Prisma.TestCheckUncheckedUpdateWithoutCheckInput>;
};
export type TestCheckUpdateManyWithWhereWithoutCheckInput = {
    where: Prisma.TestCheckScalarWhereInput;
    data: Prisma.XOR<Prisma.TestCheckUpdateManyMutationInput, Prisma.TestCheckUncheckedUpdateManyWithoutCheckInput>;
};
export type TestCheckCreateManyTestInput = {
    id?: string;
    checkId: string;
};
export type TestCheckUpdateWithoutTestInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    check?: Prisma.CheckUpdateOneRequiredWithoutTestChecksNestedInput;
};
export type TestCheckUncheckedUpdateWithoutTestInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TestCheckUncheckedUpdateManyWithoutTestInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TestCheckCreateManyCheckInput = {
    id?: string;
    testId: string;
};
export type TestCheckUpdateWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    test?: Prisma.TestUpdateOneRequiredWithoutTestChecksNestedInput;
};
export type TestCheckUncheckedUpdateWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TestCheckUncheckedUpdateManyWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    testId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TestCheckSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    testId?: boolean;
    checkId?: boolean;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["testCheck"]>;
export type TestCheckSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    testId?: boolean;
    checkId?: boolean;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["testCheck"]>;
export type TestCheckSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    testId?: boolean;
    checkId?: boolean;
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["testCheck"]>;
export type TestCheckSelectScalar = {
    id?: boolean;
    testId?: boolean;
    checkId?: boolean;
};
export type TestCheckOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "testId" | "checkId", ExtArgs["result"]["testCheck"]>;
export type TestCheckInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
};
export type TestCheckIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
};
export type TestCheckIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    test?: boolean | Prisma.TestDefaultArgs<ExtArgs>;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
};
export type $TestCheckPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TestCheck";
    objects: {
        test: Prisma.$TestPayload<ExtArgs>;
        check: Prisma.$CheckPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        testId: string;
        checkId: string;
    }, ExtArgs["result"]["testCheck"]>;
    composites: {};
};
export type TestCheckGetPayload<S extends boolean | null | undefined | TestCheckDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TestCheckPayload, S>;
export type TestCheckCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TestCheckFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TestCheckCountAggregateInputType | true;
};
export interface TestCheckDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TestCheck'];
        meta: {
            name: 'TestCheck';
        };
    };
    findUnique<T extends TestCheckFindUniqueArgs>(args: Prisma.SelectSubset<T, TestCheckFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TestCheckClient<runtime.Types.Result.GetResult<Prisma.$TestCheckPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TestCheckFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TestCheckFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TestCheckClient<runtime.Types.Result.GetResult<Prisma.$TestCheckPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TestCheckFindFirstArgs>(args?: Prisma.SelectSubset<T, TestCheckFindFirstArgs<ExtArgs>>): Prisma.Prisma__TestCheckClient<runtime.Types.Result.GetResult<Prisma.$TestCheckPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TestCheckFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TestCheckFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TestCheckClient<runtime.Types.Result.GetResult<Prisma.$TestCheckPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TestCheckFindManyArgs>(args?: Prisma.SelectSubset<T, TestCheckFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TestCheckPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TestCheckCreateArgs>(args: Prisma.SelectSubset<T, TestCheckCreateArgs<ExtArgs>>): Prisma.Prisma__TestCheckClient<runtime.Types.Result.GetResult<Prisma.$TestCheckPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TestCheckCreateManyArgs>(args?: Prisma.SelectSubset<T, TestCheckCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TestCheckCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TestCheckCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TestCheckPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TestCheckDeleteArgs>(args: Prisma.SelectSubset<T, TestCheckDeleteArgs<ExtArgs>>): Prisma.Prisma__TestCheckClient<runtime.Types.Result.GetResult<Prisma.$TestCheckPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TestCheckUpdateArgs>(args: Prisma.SelectSubset<T, TestCheckUpdateArgs<ExtArgs>>): Prisma.Prisma__TestCheckClient<runtime.Types.Result.GetResult<Prisma.$TestCheckPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TestCheckDeleteManyArgs>(args?: Prisma.SelectSubset<T, TestCheckDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TestCheckUpdateManyArgs>(args: Prisma.SelectSubset<T, TestCheckUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TestCheckUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TestCheckUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TestCheckPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TestCheckUpsertArgs>(args: Prisma.SelectSubset<T, TestCheckUpsertArgs<ExtArgs>>): Prisma.Prisma__TestCheckClient<runtime.Types.Result.GetResult<Prisma.$TestCheckPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TestCheckCountArgs>(args?: Prisma.Subset<T, TestCheckCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TestCheckCountAggregateOutputType> : number>;
    aggregate<T extends TestCheckAggregateArgs>(args: Prisma.Subset<T, TestCheckAggregateArgs>): Prisma.PrismaPromise<GetTestCheckAggregateType<T>>;
    groupBy<T extends TestCheckGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TestCheckGroupByArgs['orderBy'];
    } : {
        orderBy?: TestCheckGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TestCheckGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTestCheckGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TestCheckFieldRefs;
}
export interface Prisma__TestCheckClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    test<T extends Prisma.TestDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TestDefaultArgs<ExtArgs>>): Prisma.Prisma__TestClient<runtime.Types.Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    check<T extends Prisma.CheckDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CheckDefaultArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TestCheckFieldRefs {
    readonly id: Prisma.FieldRef<"TestCheck", 'String'>;
    readonly testId: Prisma.FieldRef<"TestCheck", 'String'>;
    readonly checkId: Prisma.FieldRef<"TestCheck", 'String'>;
}
export type TestCheckFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestCheckSelect<ExtArgs> | null;
    omit?: Prisma.TestCheckOmit<ExtArgs> | null;
    include?: Prisma.TestCheckInclude<ExtArgs> | null;
    where: Prisma.TestCheckWhereUniqueInput;
};
export type TestCheckFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestCheckSelect<ExtArgs> | null;
    omit?: Prisma.TestCheckOmit<ExtArgs> | null;
    include?: Prisma.TestCheckInclude<ExtArgs> | null;
    where: Prisma.TestCheckWhereUniqueInput;
};
export type TestCheckFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestCheckSelect<ExtArgs> | null;
    omit?: Prisma.TestCheckOmit<ExtArgs> | null;
    include?: Prisma.TestCheckInclude<ExtArgs> | null;
    where?: Prisma.TestCheckWhereInput;
    orderBy?: Prisma.TestCheckOrderByWithRelationInput | Prisma.TestCheckOrderByWithRelationInput[];
    cursor?: Prisma.TestCheckWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TestCheckScalarFieldEnum | Prisma.TestCheckScalarFieldEnum[];
};
export type TestCheckFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestCheckSelect<ExtArgs> | null;
    omit?: Prisma.TestCheckOmit<ExtArgs> | null;
    include?: Prisma.TestCheckInclude<ExtArgs> | null;
    where?: Prisma.TestCheckWhereInput;
    orderBy?: Prisma.TestCheckOrderByWithRelationInput | Prisma.TestCheckOrderByWithRelationInput[];
    cursor?: Prisma.TestCheckWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TestCheckScalarFieldEnum | Prisma.TestCheckScalarFieldEnum[];
};
export type TestCheckFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestCheckSelect<ExtArgs> | null;
    omit?: Prisma.TestCheckOmit<ExtArgs> | null;
    include?: Prisma.TestCheckInclude<ExtArgs> | null;
    where?: Prisma.TestCheckWhereInput;
    orderBy?: Prisma.TestCheckOrderByWithRelationInput | Prisma.TestCheckOrderByWithRelationInput[];
    cursor?: Prisma.TestCheckWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TestCheckScalarFieldEnum | Prisma.TestCheckScalarFieldEnum[];
};
export type TestCheckCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestCheckSelect<ExtArgs> | null;
    omit?: Prisma.TestCheckOmit<ExtArgs> | null;
    include?: Prisma.TestCheckInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TestCheckCreateInput, Prisma.TestCheckUncheckedCreateInput>;
};
export type TestCheckCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TestCheckCreateManyInput | Prisma.TestCheckCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TestCheckCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestCheckSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TestCheckOmit<ExtArgs> | null;
    data: Prisma.TestCheckCreateManyInput | Prisma.TestCheckCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TestCheckIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TestCheckUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestCheckSelect<ExtArgs> | null;
    omit?: Prisma.TestCheckOmit<ExtArgs> | null;
    include?: Prisma.TestCheckInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TestCheckUpdateInput, Prisma.TestCheckUncheckedUpdateInput>;
    where: Prisma.TestCheckWhereUniqueInput;
};
export type TestCheckUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TestCheckUpdateManyMutationInput, Prisma.TestCheckUncheckedUpdateManyInput>;
    where?: Prisma.TestCheckWhereInput;
    limit?: number;
};
export type TestCheckUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestCheckSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TestCheckOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TestCheckUpdateManyMutationInput, Prisma.TestCheckUncheckedUpdateManyInput>;
    where?: Prisma.TestCheckWhereInput;
    limit?: number;
    include?: Prisma.TestCheckIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TestCheckUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestCheckSelect<ExtArgs> | null;
    omit?: Prisma.TestCheckOmit<ExtArgs> | null;
    include?: Prisma.TestCheckInclude<ExtArgs> | null;
    where: Prisma.TestCheckWhereUniqueInput;
    create: Prisma.XOR<Prisma.TestCheckCreateInput, Prisma.TestCheckUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TestCheckUpdateInput, Prisma.TestCheckUncheckedUpdateInput>;
};
export type TestCheckDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestCheckSelect<ExtArgs> | null;
    omit?: Prisma.TestCheckOmit<ExtArgs> | null;
    include?: Prisma.TestCheckInclude<ExtArgs> | null;
    where: Prisma.TestCheckWhereUniqueInput;
};
export type TestCheckDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TestCheckWhereInput;
    limit?: number;
};
export type TestCheckDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestCheckSelect<ExtArgs> | null;
    omit?: Prisma.TestCheckOmit<ExtArgs> | null;
    include?: Prisma.TestCheckInclude<ExtArgs> | null;
};
export {};
