import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TestPlanModel = runtime.Types.Result.DefaultSelection<Prisma.$TestPlanPayload>;
export type AggregateTestPlan = {
    _count: TestPlanCountAggregateOutputType | null;
    _min: TestPlanMinAggregateOutputType | null;
    _max: TestPlanMaxAggregateOutputType | null;
};
export type TestPlanMinAggregateOutputType = {
    id: string | null;
    controlId: string | null;
    description: string | null;
    population: string | null;
    samplingRule: string | null;
    origin: $Enums.TestPlanOrigin | null;
};
export type TestPlanMaxAggregateOutputType = {
    id: string | null;
    controlId: string | null;
    description: string | null;
    population: string | null;
    samplingRule: string | null;
    origin: $Enums.TestPlanOrigin | null;
};
export type TestPlanCountAggregateOutputType = {
    id: number;
    controlId: number;
    description: number;
    steps: number;
    population: number;
    samplingRule: number;
    origin: number;
    _all: number;
};
export type TestPlanMinAggregateInputType = {
    id?: true;
    controlId?: true;
    description?: true;
    population?: true;
    samplingRule?: true;
    origin?: true;
};
export type TestPlanMaxAggregateInputType = {
    id?: true;
    controlId?: true;
    description?: true;
    population?: true;
    samplingRule?: true;
    origin?: true;
};
export type TestPlanCountAggregateInputType = {
    id?: true;
    controlId?: true;
    description?: true;
    steps?: true;
    population?: true;
    samplingRule?: true;
    origin?: true;
    _all?: true;
};
export type TestPlanAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TestPlanWhereInput;
    orderBy?: Prisma.TestPlanOrderByWithRelationInput | Prisma.TestPlanOrderByWithRelationInput[];
    cursor?: Prisma.TestPlanWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TestPlanCountAggregateInputType;
    _min?: TestPlanMinAggregateInputType;
    _max?: TestPlanMaxAggregateInputType;
};
export type GetTestPlanAggregateType<T extends TestPlanAggregateArgs> = {
    [P in keyof T & keyof AggregateTestPlan]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTestPlan[P]> : Prisma.GetScalarType<T[P], AggregateTestPlan[P]>;
};
export type TestPlanGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TestPlanWhereInput;
    orderBy?: Prisma.TestPlanOrderByWithAggregationInput | Prisma.TestPlanOrderByWithAggregationInput[];
    by: Prisma.TestPlanScalarFieldEnum[] | Prisma.TestPlanScalarFieldEnum;
    having?: Prisma.TestPlanScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TestPlanCountAggregateInputType | true;
    _min?: TestPlanMinAggregateInputType;
    _max?: TestPlanMaxAggregateInputType;
};
export type TestPlanGroupByOutputType = {
    id: string;
    controlId: string;
    description: string;
    steps: runtime.JsonValue;
    population: string;
    samplingRule: string;
    origin: $Enums.TestPlanOrigin;
    _count: TestPlanCountAggregateOutputType | null;
    _min: TestPlanMinAggregateOutputType | null;
    _max: TestPlanMaxAggregateOutputType | null;
};
type GetTestPlanGroupByPayload<T extends TestPlanGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TestPlanGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TestPlanGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TestPlanGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TestPlanGroupByOutputType[P]>;
}>>;
export type TestPlanWhereInput = {
    AND?: Prisma.TestPlanWhereInput | Prisma.TestPlanWhereInput[];
    OR?: Prisma.TestPlanWhereInput[];
    NOT?: Prisma.TestPlanWhereInput | Prisma.TestPlanWhereInput[];
    id?: Prisma.UuidFilter<"TestPlan"> | string;
    controlId?: Prisma.UuidFilter<"TestPlan"> | string;
    description?: Prisma.StringFilter<"TestPlan"> | string;
    steps?: Prisma.JsonFilter<"TestPlan">;
    population?: Prisma.StringFilter<"TestPlan"> | string;
    samplingRule?: Prisma.StringFilter<"TestPlan"> | string;
    origin?: Prisma.EnumTestPlanOriginFilter<"TestPlan"> | $Enums.TestPlanOrigin;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
};
export type TestPlanOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    steps?: Prisma.SortOrder;
    population?: Prisma.SortOrder;
    samplingRule?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    control?: Prisma.ControlOrderByWithRelationInput;
};
export type TestPlanWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.TestPlanWhereInput | Prisma.TestPlanWhereInput[];
    OR?: Prisma.TestPlanWhereInput[];
    NOT?: Prisma.TestPlanWhereInput | Prisma.TestPlanWhereInput[];
    controlId?: Prisma.UuidFilter<"TestPlan"> | string;
    description?: Prisma.StringFilter<"TestPlan"> | string;
    steps?: Prisma.JsonFilter<"TestPlan">;
    population?: Prisma.StringFilter<"TestPlan"> | string;
    samplingRule?: Prisma.StringFilter<"TestPlan"> | string;
    origin?: Prisma.EnumTestPlanOriginFilter<"TestPlan"> | $Enums.TestPlanOrigin;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
}, "id">;
export type TestPlanOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    steps?: Prisma.SortOrder;
    population?: Prisma.SortOrder;
    samplingRule?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    _count?: Prisma.TestPlanCountOrderByAggregateInput;
    _max?: Prisma.TestPlanMaxOrderByAggregateInput;
    _min?: Prisma.TestPlanMinOrderByAggregateInput;
};
export type TestPlanScalarWhereWithAggregatesInput = {
    AND?: Prisma.TestPlanScalarWhereWithAggregatesInput | Prisma.TestPlanScalarWhereWithAggregatesInput[];
    OR?: Prisma.TestPlanScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TestPlanScalarWhereWithAggregatesInput | Prisma.TestPlanScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"TestPlan"> | string;
    controlId?: Prisma.UuidWithAggregatesFilter<"TestPlan"> | string;
    description?: Prisma.StringWithAggregatesFilter<"TestPlan"> | string;
    steps?: Prisma.JsonWithAggregatesFilter<"TestPlan">;
    population?: Prisma.StringWithAggregatesFilter<"TestPlan"> | string;
    samplingRule?: Prisma.StringWithAggregatesFilter<"TestPlan"> | string;
    origin?: Prisma.EnumTestPlanOriginWithAggregatesFilter<"TestPlan"> | $Enums.TestPlanOrigin;
};
export type TestPlanCreateInput = {
    id?: string;
    description: string;
    steps: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    population: string;
    samplingRule: string;
    origin: $Enums.TestPlanOrigin;
    control: Prisma.ControlCreateNestedOneWithoutTestPlansInput;
};
export type TestPlanUncheckedCreateInput = {
    id?: string;
    controlId: string;
    description: string;
    steps: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    population: string;
    samplingRule: string;
    origin: $Enums.TestPlanOrigin;
};
export type TestPlanUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    steps?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    population?: Prisma.StringFieldUpdateOperationsInput | string;
    samplingRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumTestPlanOriginFieldUpdateOperationsInput | $Enums.TestPlanOrigin;
    control?: Prisma.ControlUpdateOneRequiredWithoutTestPlansNestedInput;
};
export type TestPlanUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    steps?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    population?: Prisma.StringFieldUpdateOperationsInput | string;
    samplingRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumTestPlanOriginFieldUpdateOperationsInput | $Enums.TestPlanOrigin;
};
export type TestPlanCreateManyInput = {
    id?: string;
    controlId: string;
    description: string;
    steps: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    population: string;
    samplingRule: string;
    origin: $Enums.TestPlanOrigin;
};
export type TestPlanUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    steps?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    population?: Prisma.StringFieldUpdateOperationsInput | string;
    samplingRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumTestPlanOriginFieldUpdateOperationsInput | $Enums.TestPlanOrigin;
};
export type TestPlanUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    steps?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    population?: Prisma.StringFieldUpdateOperationsInput | string;
    samplingRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumTestPlanOriginFieldUpdateOperationsInput | $Enums.TestPlanOrigin;
};
export type TestPlanListRelationFilter = {
    every?: Prisma.TestPlanWhereInput;
    some?: Prisma.TestPlanWhereInput;
    none?: Prisma.TestPlanWhereInput;
};
export type TestPlanOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TestPlanCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    steps?: Prisma.SortOrder;
    population?: Prisma.SortOrder;
    samplingRule?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
};
export type TestPlanMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    population?: Prisma.SortOrder;
    samplingRule?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
};
export type TestPlanMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    population?: Prisma.SortOrder;
    samplingRule?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
};
export type TestPlanCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.TestPlanCreateWithoutControlInput, Prisma.TestPlanUncheckedCreateWithoutControlInput> | Prisma.TestPlanCreateWithoutControlInput[] | Prisma.TestPlanUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.TestPlanCreateOrConnectWithoutControlInput | Prisma.TestPlanCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.TestPlanCreateManyControlInputEnvelope;
    connect?: Prisma.TestPlanWhereUniqueInput | Prisma.TestPlanWhereUniqueInput[];
};
export type TestPlanUncheckedCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.TestPlanCreateWithoutControlInput, Prisma.TestPlanUncheckedCreateWithoutControlInput> | Prisma.TestPlanCreateWithoutControlInput[] | Prisma.TestPlanUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.TestPlanCreateOrConnectWithoutControlInput | Prisma.TestPlanCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.TestPlanCreateManyControlInputEnvelope;
    connect?: Prisma.TestPlanWhereUniqueInput | Prisma.TestPlanWhereUniqueInput[];
};
export type TestPlanUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.TestPlanCreateWithoutControlInput, Prisma.TestPlanUncheckedCreateWithoutControlInput> | Prisma.TestPlanCreateWithoutControlInput[] | Prisma.TestPlanUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.TestPlanCreateOrConnectWithoutControlInput | Prisma.TestPlanCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.TestPlanUpsertWithWhereUniqueWithoutControlInput | Prisma.TestPlanUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.TestPlanCreateManyControlInputEnvelope;
    set?: Prisma.TestPlanWhereUniqueInput | Prisma.TestPlanWhereUniqueInput[];
    disconnect?: Prisma.TestPlanWhereUniqueInput | Prisma.TestPlanWhereUniqueInput[];
    delete?: Prisma.TestPlanWhereUniqueInput | Prisma.TestPlanWhereUniqueInput[];
    connect?: Prisma.TestPlanWhereUniqueInput | Prisma.TestPlanWhereUniqueInput[];
    update?: Prisma.TestPlanUpdateWithWhereUniqueWithoutControlInput | Prisma.TestPlanUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.TestPlanUpdateManyWithWhereWithoutControlInput | Prisma.TestPlanUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.TestPlanScalarWhereInput | Prisma.TestPlanScalarWhereInput[];
};
export type TestPlanUncheckedUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.TestPlanCreateWithoutControlInput, Prisma.TestPlanUncheckedCreateWithoutControlInput> | Prisma.TestPlanCreateWithoutControlInput[] | Prisma.TestPlanUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.TestPlanCreateOrConnectWithoutControlInput | Prisma.TestPlanCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.TestPlanUpsertWithWhereUniqueWithoutControlInput | Prisma.TestPlanUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.TestPlanCreateManyControlInputEnvelope;
    set?: Prisma.TestPlanWhereUniqueInput | Prisma.TestPlanWhereUniqueInput[];
    disconnect?: Prisma.TestPlanWhereUniqueInput | Prisma.TestPlanWhereUniqueInput[];
    delete?: Prisma.TestPlanWhereUniqueInput | Prisma.TestPlanWhereUniqueInput[];
    connect?: Prisma.TestPlanWhereUniqueInput | Prisma.TestPlanWhereUniqueInput[];
    update?: Prisma.TestPlanUpdateWithWhereUniqueWithoutControlInput | Prisma.TestPlanUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.TestPlanUpdateManyWithWhereWithoutControlInput | Prisma.TestPlanUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.TestPlanScalarWhereInput | Prisma.TestPlanScalarWhereInput[];
};
export type EnumTestPlanOriginFieldUpdateOperationsInput = {
    set?: $Enums.TestPlanOrigin;
};
export type TestPlanCreateWithoutControlInput = {
    id?: string;
    description: string;
    steps: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    population: string;
    samplingRule: string;
    origin: $Enums.TestPlanOrigin;
};
export type TestPlanUncheckedCreateWithoutControlInput = {
    id?: string;
    description: string;
    steps: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    population: string;
    samplingRule: string;
    origin: $Enums.TestPlanOrigin;
};
export type TestPlanCreateOrConnectWithoutControlInput = {
    where: Prisma.TestPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.TestPlanCreateWithoutControlInput, Prisma.TestPlanUncheckedCreateWithoutControlInput>;
};
export type TestPlanCreateManyControlInputEnvelope = {
    data: Prisma.TestPlanCreateManyControlInput | Prisma.TestPlanCreateManyControlInput[];
    skipDuplicates?: boolean;
};
export type TestPlanUpsertWithWhereUniqueWithoutControlInput = {
    where: Prisma.TestPlanWhereUniqueInput;
    update: Prisma.XOR<Prisma.TestPlanUpdateWithoutControlInput, Prisma.TestPlanUncheckedUpdateWithoutControlInput>;
    create: Prisma.XOR<Prisma.TestPlanCreateWithoutControlInput, Prisma.TestPlanUncheckedCreateWithoutControlInput>;
};
export type TestPlanUpdateWithWhereUniqueWithoutControlInput = {
    where: Prisma.TestPlanWhereUniqueInput;
    data: Prisma.XOR<Prisma.TestPlanUpdateWithoutControlInput, Prisma.TestPlanUncheckedUpdateWithoutControlInput>;
};
export type TestPlanUpdateManyWithWhereWithoutControlInput = {
    where: Prisma.TestPlanScalarWhereInput;
    data: Prisma.XOR<Prisma.TestPlanUpdateManyMutationInput, Prisma.TestPlanUncheckedUpdateManyWithoutControlInput>;
};
export type TestPlanScalarWhereInput = {
    AND?: Prisma.TestPlanScalarWhereInput | Prisma.TestPlanScalarWhereInput[];
    OR?: Prisma.TestPlanScalarWhereInput[];
    NOT?: Prisma.TestPlanScalarWhereInput | Prisma.TestPlanScalarWhereInput[];
    id?: Prisma.UuidFilter<"TestPlan"> | string;
    controlId?: Prisma.UuidFilter<"TestPlan"> | string;
    description?: Prisma.StringFilter<"TestPlan"> | string;
    steps?: Prisma.JsonFilter<"TestPlan">;
    population?: Prisma.StringFilter<"TestPlan"> | string;
    samplingRule?: Prisma.StringFilter<"TestPlan"> | string;
    origin?: Prisma.EnumTestPlanOriginFilter<"TestPlan"> | $Enums.TestPlanOrigin;
};
export type TestPlanCreateManyControlInput = {
    id?: string;
    description: string;
    steps: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    population: string;
    samplingRule: string;
    origin: $Enums.TestPlanOrigin;
};
export type TestPlanUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    steps?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    population?: Prisma.StringFieldUpdateOperationsInput | string;
    samplingRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumTestPlanOriginFieldUpdateOperationsInput | $Enums.TestPlanOrigin;
};
export type TestPlanUncheckedUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    steps?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    population?: Prisma.StringFieldUpdateOperationsInput | string;
    samplingRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumTestPlanOriginFieldUpdateOperationsInput | $Enums.TestPlanOrigin;
};
export type TestPlanUncheckedUpdateManyWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    steps?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    population?: Prisma.StringFieldUpdateOperationsInput | string;
    samplingRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumTestPlanOriginFieldUpdateOperationsInput | $Enums.TestPlanOrigin;
};
export type TestPlanSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    description?: boolean;
    steps?: boolean;
    population?: boolean;
    samplingRule?: boolean;
    origin?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["testPlan"]>;
export type TestPlanSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    description?: boolean;
    steps?: boolean;
    population?: boolean;
    samplingRule?: boolean;
    origin?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["testPlan"]>;
export type TestPlanSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    description?: boolean;
    steps?: boolean;
    population?: boolean;
    samplingRule?: boolean;
    origin?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["testPlan"]>;
export type TestPlanSelectScalar = {
    id?: boolean;
    controlId?: boolean;
    description?: boolean;
    steps?: boolean;
    population?: boolean;
    samplingRule?: boolean;
    origin?: boolean;
};
export type TestPlanOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "controlId" | "description" | "steps" | "population" | "samplingRule" | "origin", ExtArgs["result"]["testPlan"]>;
export type TestPlanInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type TestPlanIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type TestPlanIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type $TestPlanPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TestPlan";
    objects: {
        control: Prisma.$ControlPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        controlId: string;
        description: string;
        steps: runtime.JsonValue;
        population: string;
        samplingRule: string;
        origin: $Enums.TestPlanOrigin;
    }, ExtArgs["result"]["testPlan"]>;
    composites: {};
};
export type TestPlanGetPayload<S extends boolean | null | undefined | TestPlanDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TestPlanPayload, S>;
export type TestPlanCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TestPlanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TestPlanCountAggregateInputType | true;
};
export interface TestPlanDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TestPlan'];
        meta: {
            name: 'TestPlan';
        };
    };
    findUnique<T extends TestPlanFindUniqueArgs>(args: Prisma.SelectSubset<T, TestPlanFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TestPlanClient<runtime.Types.Result.GetResult<Prisma.$TestPlanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TestPlanFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TestPlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TestPlanClient<runtime.Types.Result.GetResult<Prisma.$TestPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TestPlanFindFirstArgs>(args?: Prisma.SelectSubset<T, TestPlanFindFirstArgs<ExtArgs>>): Prisma.Prisma__TestPlanClient<runtime.Types.Result.GetResult<Prisma.$TestPlanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TestPlanFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TestPlanFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TestPlanClient<runtime.Types.Result.GetResult<Prisma.$TestPlanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TestPlanFindManyArgs>(args?: Prisma.SelectSubset<T, TestPlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TestPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TestPlanCreateArgs>(args: Prisma.SelectSubset<T, TestPlanCreateArgs<ExtArgs>>): Prisma.Prisma__TestPlanClient<runtime.Types.Result.GetResult<Prisma.$TestPlanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TestPlanCreateManyArgs>(args?: Prisma.SelectSubset<T, TestPlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TestPlanCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TestPlanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TestPlanPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TestPlanDeleteArgs>(args: Prisma.SelectSubset<T, TestPlanDeleteArgs<ExtArgs>>): Prisma.Prisma__TestPlanClient<runtime.Types.Result.GetResult<Prisma.$TestPlanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TestPlanUpdateArgs>(args: Prisma.SelectSubset<T, TestPlanUpdateArgs<ExtArgs>>): Prisma.Prisma__TestPlanClient<runtime.Types.Result.GetResult<Prisma.$TestPlanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TestPlanDeleteManyArgs>(args?: Prisma.SelectSubset<T, TestPlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TestPlanUpdateManyArgs>(args: Prisma.SelectSubset<T, TestPlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TestPlanUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TestPlanUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TestPlanPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TestPlanUpsertArgs>(args: Prisma.SelectSubset<T, TestPlanUpsertArgs<ExtArgs>>): Prisma.Prisma__TestPlanClient<runtime.Types.Result.GetResult<Prisma.$TestPlanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TestPlanCountArgs>(args?: Prisma.Subset<T, TestPlanCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TestPlanCountAggregateOutputType> : number>;
    aggregate<T extends TestPlanAggregateArgs>(args: Prisma.Subset<T, TestPlanAggregateArgs>): Prisma.PrismaPromise<GetTestPlanAggregateType<T>>;
    groupBy<T extends TestPlanGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TestPlanGroupByArgs['orderBy'];
    } : {
        orderBy?: TestPlanGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TestPlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTestPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TestPlanFieldRefs;
}
export interface Prisma__TestPlanClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    control<T extends Prisma.ControlDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ControlDefaultArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TestPlanFieldRefs {
    readonly id: Prisma.FieldRef<"TestPlan", 'String'>;
    readonly controlId: Prisma.FieldRef<"TestPlan", 'String'>;
    readonly description: Prisma.FieldRef<"TestPlan", 'String'>;
    readonly steps: Prisma.FieldRef<"TestPlan", 'Json'>;
    readonly population: Prisma.FieldRef<"TestPlan", 'String'>;
    readonly samplingRule: Prisma.FieldRef<"TestPlan", 'String'>;
    readonly origin: Prisma.FieldRef<"TestPlan", 'TestPlanOrigin'>;
}
export type TestPlanFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestPlanSelect<ExtArgs> | null;
    omit?: Prisma.TestPlanOmit<ExtArgs> | null;
    include?: Prisma.TestPlanInclude<ExtArgs> | null;
    where: Prisma.TestPlanWhereUniqueInput;
};
export type TestPlanFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestPlanSelect<ExtArgs> | null;
    omit?: Prisma.TestPlanOmit<ExtArgs> | null;
    include?: Prisma.TestPlanInclude<ExtArgs> | null;
    where: Prisma.TestPlanWhereUniqueInput;
};
export type TestPlanFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestPlanSelect<ExtArgs> | null;
    omit?: Prisma.TestPlanOmit<ExtArgs> | null;
    include?: Prisma.TestPlanInclude<ExtArgs> | null;
    where?: Prisma.TestPlanWhereInput;
    orderBy?: Prisma.TestPlanOrderByWithRelationInput | Prisma.TestPlanOrderByWithRelationInput[];
    cursor?: Prisma.TestPlanWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TestPlanScalarFieldEnum | Prisma.TestPlanScalarFieldEnum[];
};
export type TestPlanFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestPlanSelect<ExtArgs> | null;
    omit?: Prisma.TestPlanOmit<ExtArgs> | null;
    include?: Prisma.TestPlanInclude<ExtArgs> | null;
    where?: Prisma.TestPlanWhereInput;
    orderBy?: Prisma.TestPlanOrderByWithRelationInput | Prisma.TestPlanOrderByWithRelationInput[];
    cursor?: Prisma.TestPlanWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TestPlanScalarFieldEnum | Prisma.TestPlanScalarFieldEnum[];
};
export type TestPlanFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestPlanSelect<ExtArgs> | null;
    omit?: Prisma.TestPlanOmit<ExtArgs> | null;
    include?: Prisma.TestPlanInclude<ExtArgs> | null;
    where?: Prisma.TestPlanWhereInput;
    orderBy?: Prisma.TestPlanOrderByWithRelationInput | Prisma.TestPlanOrderByWithRelationInput[];
    cursor?: Prisma.TestPlanWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TestPlanScalarFieldEnum | Prisma.TestPlanScalarFieldEnum[];
};
export type TestPlanCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestPlanSelect<ExtArgs> | null;
    omit?: Prisma.TestPlanOmit<ExtArgs> | null;
    include?: Prisma.TestPlanInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TestPlanCreateInput, Prisma.TestPlanUncheckedCreateInput>;
};
export type TestPlanCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TestPlanCreateManyInput | Prisma.TestPlanCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TestPlanCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestPlanSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TestPlanOmit<ExtArgs> | null;
    data: Prisma.TestPlanCreateManyInput | Prisma.TestPlanCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TestPlanIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TestPlanUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestPlanSelect<ExtArgs> | null;
    omit?: Prisma.TestPlanOmit<ExtArgs> | null;
    include?: Prisma.TestPlanInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TestPlanUpdateInput, Prisma.TestPlanUncheckedUpdateInput>;
    where: Prisma.TestPlanWhereUniqueInput;
};
export type TestPlanUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TestPlanUpdateManyMutationInput, Prisma.TestPlanUncheckedUpdateManyInput>;
    where?: Prisma.TestPlanWhereInput;
    limit?: number;
};
export type TestPlanUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestPlanSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TestPlanOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TestPlanUpdateManyMutationInput, Prisma.TestPlanUncheckedUpdateManyInput>;
    where?: Prisma.TestPlanWhereInput;
    limit?: number;
    include?: Prisma.TestPlanIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TestPlanUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestPlanSelect<ExtArgs> | null;
    omit?: Prisma.TestPlanOmit<ExtArgs> | null;
    include?: Prisma.TestPlanInclude<ExtArgs> | null;
    where: Prisma.TestPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.TestPlanCreateInput, Prisma.TestPlanUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TestPlanUpdateInput, Prisma.TestPlanUncheckedUpdateInput>;
};
export type TestPlanDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestPlanSelect<ExtArgs> | null;
    omit?: Prisma.TestPlanOmit<ExtArgs> | null;
    include?: Prisma.TestPlanInclude<ExtArgs> | null;
    where: Prisma.TestPlanWhereUniqueInput;
};
export type TestPlanDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TestPlanWhereInput;
    limit?: number;
};
export type TestPlanDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestPlanSelect<ExtArgs> | null;
    omit?: Prisma.TestPlanOmit<ExtArgs> | null;
    include?: Prisma.TestPlanInclude<ExtArgs> | null;
};
export {};
