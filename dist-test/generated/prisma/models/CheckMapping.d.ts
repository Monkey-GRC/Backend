import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CheckMappingModel = runtime.Types.Result.DefaultSelection<Prisma.$CheckMappingPayload>;
export type AggregateCheckMapping = {
    _count: CheckMappingCountAggregateOutputType | null;
    _min: CheckMappingMinAggregateOutputType | null;
    _max: CheckMappingMaxAggregateOutputType | null;
};
export type CheckMappingMinAggregateOutputType = {
    id: string | null;
    checkId: string | null;
    frameworkCode: string | null;
    frameworkVersion: string | null;
    requirementCode: string | null;
};
export type CheckMappingMaxAggregateOutputType = {
    id: string | null;
    checkId: string | null;
    frameworkCode: string | null;
    frameworkVersion: string | null;
    requirementCode: string | null;
};
export type CheckMappingCountAggregateOutputType = {
    id: number;
    checkId: number;
    frameworkCode: number;
    frameworkVersion: number;
    requirementCode: number;
    _all: number;
};
export type CheckMappingMinAggregateInputType = {
    id?: true;
    checkId?: true;
    frameworkCode?: true;
    frameworkVersion?: true;
    requirementCode?: true;
};
export type CheckMappingMaxAggregateInputType = {
    id?: true;
    checkId?: true;
    frameworkCode?: true;
    frameworkVersion?: true;
    requirementCode?: true;
};
export type CheckMappingCountAggregateInputType = {
    id?: true;
    checkId?: true;
    frameworkCode?: true;
    frameworkVersion?: true;
    requirementCode?: true;
    _all?: true;
};
export type CheckMappingAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckMappingWhereInput;
    orderBy?: Prisma.CheckMappingOrderByWithRelationInput | Prisma.CheckMappingOrderByWithRelationInput[];
    cursor?: Prisma.CheckMappingWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CheckMappingCountAggregateInputType;
    _min?: CheckMappingMinAggregateInputType;
    _max?: CheckMappingMaxAggregateInputType;
};
export type GetCheckMappingAggregateType<T extends CheckMappingAggregateArgs> = {
    [P in keyof T & keyof AggregateCheckMapping]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCheckMapping[P]> : Prisma.GetScalarType<T[P], AggregateCheckMapping[P]>;
};
export type CheckMappingGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckMappingWhereInput;
    orderBy?: Prisma.CheckMappingOrderByWithAggregationInput | Prisma.CheckMappingOrderByWithAggregationInput[];
    by: Prisma.CheckMappingScalarFieldEnum[] | Prisma.CheckMappingScalarFieldEnum;
    having?: Prisma.CheckMappingScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CheckMappingCountAggregateInputType | true;
    _min?: CheckMappingMinAggregateInputType;
    _max?: CheckMappingMaxAggregateInputType;
};
export type CheckMappingGroupByOutputType = {
    id: string;
    checkId: string;
    frameworkCode: string;
    frameworkVersion: string;
    requirementCode: string;
    _count: CheckMappingCountAggregateOutputType | null;
    _min: CheckMappingMinAggregateOutputType | null;
    _max: CheckMappingMaxAggregateOutputType | null;
};
type GetCheckMappingGroupByPayload<T extends CheckMappingGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CheckMappingGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CheckMappingGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CheckMappingGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CheckMappingGroupByOutputType[P]>;
}>>;
export type CheckMappingWhereInput = {
    AND?: Prisma.CheckMappingWhereInput | Prisma.CheckMappingWhereInput[];
    OR?: Prisma.CheckMappingWhereInput[];
    NOT?: Prisma.CheckMappingWhereInput | Prisma.CheckMappingWhereInput[];
    id?: Prisma.UuidFilter<"CheckMapping"> | string;
    checkId?: Prisma.UuidFilter<"CheckMapping"> | string;
    frameworkCode?: Prisma.StringFilter<"CheckMapping"> | string;
    frameworkVersion?: Prisma.StringFilter<"CheckMapping"> | string;
    requirementCode?: Prisma.StringFilter<"CheckMapping"> | string;
    check?: Prisma.XOR<Prisma.CheckScalarRelationFilter, Prisma.CheckWhereInput>;
};
export type CheckMappingOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    frameworkCode?: Prisma.SortOrder;
    frameworkVersion?: Prisma.SortOrder;
    requirementCode?: Prisma.SortOrder;
    check?: Prisma.CheckOrderByWithRelationInput;
};
export type CheckMappingWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.CheckMappingWhereInput | Prisma.CheckMappingWhereInput[];
    OR?: Prisma.CheckMappingWhereInput[];
    NOT?: Prisma.CheckMappingWhereInput | Prisma.CheckMappingWhereInput[];
    checkId?: Prisma.UuidFilter<"CheckMapping"> | string;
    frameworkCode?: Prisma.StringFilter<"CheckMapping"> | string;
    frameworkVersion?: Prisma.StringFilter<"CheckMapping"> | string;
    requirementCode?: Prisma.StringFilter<"CheckMapping"> | string;
    check?: Prisma.XOR<Prisma.CheckScalarRelationFilter, Prisma.CheckWhereInput>;
}, "id">;
export type CheckMappingOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    frameworkCode?: Prisma.SortOrder;
    frameworkVersion?: Prisma.SortOrder;
    requirementCode?: Prisma.SortOrder;
    _count?: Prisma.CheckMappingCountOrderByAggregateInput;
    _max?: Prisma.CheckMappingMaxOrderByAggregateInput;
    _min?: Prisma.CheckMappingMinOrderByAggregateInput;
};
export type CheckMappingScalarWhereWithAggregatesInput = {
    AND?: Prisma.CheckMappingScalarWhereWithAggregatesInput | Prisma.CheckMappingScalarWhereWithAggregatesInput[];
    OR?: Prisma.CheckMappingScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CheckMappingScalarWhereWithAggregatesInput | Prisma.CheckMappingScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"CheckMapping"> | string;
    checkId?: Prisma.UuidWithAggregatesFilter<"CheckMapping"> | string;
    frameworkCode?: Prisma.StringWithAggregatesFilter<"CheckMapping"> | string;
    frameworkVersion?: Prisma.StringWithAggregatesFilter<"CheckMapping"> | string;
    requirementCode?: Prisma.StringWithAggregatesFilter<"CheckMapping"> | string;
};
export type CheckMappingCreateInput = {
    id?: string;
    frameworkCode: string;
    frameworkVersion: string;
    requirementCode: string;
    check: Prisma.CheckCreateNestedOneWithoutCheckMappingsInput;
};
export type CheckMappingUncheckedCreateInput = {
    id?: string;
    checkId: string;
    frameworkCode: string;
    frameworkVersion: string;
    requirementCode: string;
};
export type CheckMappingUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkCode?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    requirementCode?: Prisma.StringFieldUpdateOperationsInput | string;
    check?: Prisma.CheckUpdateOneRequiredWithoutCheckMappingsNestedInput;
};
export type CheckMappingUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkCode?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    requirementCode?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CheckMappingCreateManyInput = {
    id?: string;
    checkId: string;
    frameworkCode: string;
    frameworkVersion: string;
    requirementCode: string;
};
export type CheckMappingUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkCode?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    requirementCode?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CheckMappingUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkCode?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    requirementCode?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CheckMappingListRelationFilter = {
    every?: Prisma.CheckMappingWhereInput;
    some?: Prisma.CheckMappingWhereInput;
    none?: Prisma.CheckMappingWhereInput;
};
export type CheckMappingOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CheckMappingCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    frameworkCode?: Prisma.SortOrder;
    frameworkVersion?: Prisma.SortOrder;
    requirementCode?: Prisma.SortOrder;
};
export type CheckMappingMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    frameworkCode?: Prisma.SortOrder;
    frameworkVersion?: Prisma.SortOrder;
    requirementCode?: Prisma.SortOrder;
};
export type CheckMappingMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    frameworkCode?: Prisma.SortOrder;
    frameworkVersion?: Prisma.SortOrder;
    requirementCode?: Prisma.SortOrder;
};
export type CheckMappingCreateNestedManyWithoutCheckInput = {
    create?: Prisma.XOR<Prisma.CheckMappingCreateWithoutCheckInput, Prisma.CheckMappingUncheckedCreateWithoutCheckInput> | Prisma.CheckMappingCreateWithoutCheckInput[] | Prisma.CheckMappingUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.CheckMappingCreateOrConnectWithoutCheckInput | Prisma.CheckMappingCreateOrConnectWithoutCheckInput[];
    createMany?: Prisma.CheckMappingCreateManyCheckInputEnvelope;
    connect?: Prisma.CheckMappingWhereUniqueInput | Prisma.CheckMappingWhereUniqueInput[];
};
export type CheckMappingUncheckedCreateNestedManyWithoutCheckInput = {
    create?: Prisma.XOR<Prisma.CheckMappingCreateWithoutCheckInput, Prisma.CheckMappingUncheckedCreateWithoutCheckInput> | Prisma.CheckMappingCreateWithoutCheckInput[] | Prisma.CheckMappingUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.CheckMappingCreateOrConnectWithoutCheckInput | Prisma.CheckMappingCreateOrConnectWithoutCheckInput[];
    createMany?: Prisma.CheckMappingCreateManyCheckInputEnvelope;
    connect?: Prisma.CheckMappingWhereUniqueInput | Prisma.CheckMappingWhereUniqueInput[];
};
export type CheckMappingUpdateManyWithoutCheckNestedInput = {
    create?: Prisma.XOR<Prisma.CheckMappingCreateWithoutCheckInput, Prisma.CheckMappingUncheckedCreateWithoutCheckInput> | Prisma.CheckMappingCreateWithoutCheckInput[] | Prisma.CheckMappingUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.CheckMappingCreateOrConnectWithoutCheckInput | Prisma.CheckMappingCreateOrConnectWithoutCheckInput[];
    upsert?: Prisma.CheckMappingUpsertWithWhereUniqueWithoutCheckInput | Prisma.CheckMappingUpsertWithWhereUniqueWithoutCheckInput[];
    createMany?: Prisma.CheckMappingCreateManyCheckInputEnvelope;
    set?: Prisma.CheckMappingWhereUniqueInput | Prisma.CheckMappingWhereUniqueInput[];
    disconnect?: Prisma.CheckMappingWhereUniqueInput | Prisma.CheckMappingWhereUniqueInput[];
    delete?: Prisma.CheckMappingWhereUniqueInput | Prisma.CheckMappingWhereUniqueInput[];
    connect?: Prisma.CheckMappingWhereUniqueInput | Prisma.CheckMappingWhereUniqueInput[];
    update?: Prisma.CheckMappingUpdateWithWhereUniqueWithoutCheckInput | Prisma.CheckMappingUpdateWithWhereUniqueWithoutCheckInput[];
    updateMany?: Prisma.CheckMappingUpdateManyWithWhereWithoutCheckInput | Prisma.CheckMappingUpdateManyWithWhereWithoutCheckInput[];
    deleteMany?: Prisma.CheckMappingScalarWhereInput | Prisma.CheckMappingScalarWhereInput[];
};
export type CheckMappingUncheckedUpdateManyWithoutCheckNestedInput = {
    create?: Prisma.XOR<Prisma.CheckMappingCreateWithoutCheckInput, Prisma.CheckMappingUncheckedCreateWithoutCheckInput> | Prisma.CheckMappingCreateWithoutCheckInput[] | Prisma.CheckMappingUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.CheckMappingCreateOrConnectWithoutCheckInput | Prisma.CheckMappingCreateOrConnectWithoutCheckInput[];
    upsert?: Prisma.CheckMappingUpsertWithWhereUniqueWithoutCheckInput | Prisma.CheckMappingUpsertWithWhereUniqueWithoutCheckInput[];
    createMany?: Prisma.CheckMappingCreateManyCheckInputEnvelope;
    set?: Prisma.CheckMappingWhereUniqueInput | Prisma.CheckMappingWhereUniqueInput[];
    disconnect?: Prisma.CheckMappingWhereUniqueInput | Prisma.CheckMappingWhereUniqueInput[];
    delete?: Prisma.CheckMappingWhereUniqueInput | Prisma.CheckMappingWhereUniqueInput[];
    connect?: Prisma.CheckMappingWhereUniqueInput | Prisma.CheckMappingWhereUniqueInput[];
    update?: Prisma.CheckMappingUpdateWithWhereUniqueWithoutCheckInput | Prisma.CheckMappingUpdateWithWhereUniqueWithoutCheckInput[];
    updateMany?: Prisma.CheckMappingUpdateManyWithWhereWithoutCheckInput | Prisma.CheckMappingUpdateManyWithWhereWithoutCheckInput[];
    deleteMany?: Prisma.CheckMappingScalarWhereInput | Prisma.CheckMappingScalarWhereInput[];
};
export type CheckMappingCreateWithoutCheckInput = {
    id?: string;
    frameworkCode: string;
    frameworkVersion: string;
    requirementCode: string;
};
export type CheckMappingUncheckedCreateWithoutCheckInput = {
    id?: string;
    frameworkCode: string;
    frameworkVersion: string;
    requirementCode: string;
};
export type CheckMappingCreateOrConnectWithoutCheckInput = {
    where: Prisma.CheckMappingWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckMappingCreateWithoutCheckInput, Prisma.CheckMappingUncheckedCreateWithoutCheckInput>;
};
export type CheckMappingCreateManyCheckInputEnvelope = {
    data: Prisma.CheckMappingCreateManyCheckInput | Prisma.CheckMappingCreateManyCheckInput[];
    skipDuplicates?: boolean;
};
export type CheckMappingUpsertWithWhereUniqueWithoutCheckInput = {
    where: Prisma.CheckMappingWhereUniqueInput;
    update: Prisma.XOR<Prisma.CheckMappingUpdateWithoutCheckInput, Prisma.CheckMappingUncheckedUpdateWithoutCheckInput>;
    create: Prisma.XOR<Prisma.CheckMappingCreateWithoutCheckInput, Prisma.CheckMappingUncheckedCreateWithoutCheckInput>;
};
export type CheckMappingUpdateWithWhereUniqueWithoutCheckInput = {
    where: Prisma.CheckMappingWhereUniqueInput;
    data: Prisma.XOR<Prisma.CheckMappingUpdateWithoutCheckInput, Prisma.CheckMappingUncheckedUpdateWithoutCheckInput>;
};
export type CheckMappingUpdateManyWithWhereWithoutCheckInput = {
    where: Prisma.CheckMappingScalarWhereInput;
    data: Prisma.XOR<Prisma.CheckMappingUpdateManyMutationInput, Prisma.CheckMappingUncheckedUpdateManyWithoutCheckInput>;
};
export type CheckMappingScalarWhereInput = {
    AND?: Prisma.CheckMappingScalarWhereInput | Prisma.CheckMappingScalarWhereInput[];
    OR?: Prisma.CheckMappingScalarWhereInput[];
    NOT?: Prisma.CheckMappingScalarWhereInput | Prisma.CheckMappingScalarWhereInput[];
    id?: Prisma.UuidFilter<"CheckMapping"> | string;
    checkId?: Prisma.UuidFilter<"CheckMapping"> | string;
    frameworkCode?: Prisma.StringFilter<"CheckMapping"> | string;
    frameworkVersion?: Prisma.StringFilter<"CheckMapping"> | string;
    requirementCode?: Prisma.StringFilter<"CheckMapping"> | string;
};
export type CheckMappingCreateManyCheckInput = {
    id?: string;
    frameworkCode: string;
    frameworkVersion: string;
    requirementCode: string;
};
export type CheckMappingUpdateWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkCode?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    requirementCode?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CheckMappingUncheckedUpdateWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkCode?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    requirementCode?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CheckMappingUncheckedUpdateManyWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkCode?: Prisma.StringFieldUpdateOperationsInput | string;
    frameworkVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    requirementCode?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CheckMappingSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    checkId?: boolean;
    frameworkCode?: boolean;
    frameworkVersion?: boolean;
    requirementCode?: boolean;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["checkMapping"]>;
export type CheckMappingSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    checkId?: boolean;
    frameworkCode?: boolean;
    frameworkVersion?: boolean;
    requirementCode?: boolean;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["checkMapping"]>;
export type CheckMappingSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    checkId?: boolean;
    frameworkCode?: boolean;
    frameworkVersion?: boolean;
    requirementCode?: boolean;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["checkMapping"]>;
export type CheckMappingSelectScalar = {
    id?: boolean;
    checkId?: boolean;
    frameworkCode?: boolean;
    frameworkVersion?: boolean;
    requirementCode?: boolean;
};
export type CheckMappingOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "checkId" | "frameworkCode" | "frameworkVersion" | "requirementCode", ExtArgs["result"]["checkMapping"]>;
export type CheckMappingInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
};
export type CheckMappingIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
};
export type CheckMappingIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
};
export type $CheckMappingPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "CheckMapping";
    objects: {
        check: Prisma.$CheckPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        checkId: string;
        frameworkCode: string;
        frameworkVersion: string;
        requirementCode: string;
    }, ExtArgs["result"]["checkMapping"]>;
    composites: {};
};
export type CheckMappingGetPayload<S extends boolean | null | undefined | CheckMappingDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CheckMappingPayload, S>;
export type CheckMappingCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CheckMappingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CheckMappingCountAggregateInputType | true;
};
export interface CheckMappingDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['CheckMapping'];
        meta: {
            name: 'CheckMapping';
        };
    };
    findUnique<T extends CheckMappingFindUniqueArgs>(args: Prisma.SelectSubset<T, CheckMappingFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CheckMappingClient<runtime.Types.Result.GetResult<Prisma.$CheckMappingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CheckMappingFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CheckMappingFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CheckMappingClient<runtime.Types.Result.GetResult<Prisma.$CheckMappingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CheckMappingFindFirstArgs>(args?: Prisma.SelectSubset<T, CheckMappingFindFirstArgs<ExtArgs>>): Prisma.Prisma__CheckMappingClient<runtime.Types.Result.GetResult<Prisma.$CheckMappingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CheckMappingFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CheckMappingFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CheckMappingClient<runtime.Types.Result.GetResult<Prisma.$CheckMappingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CheckMappingFindManyArgs>(args?: Prisma.SelectSubset<T, CheckMappingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckMappingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CheckMappingCreateArgs>(args: Prisma.SelectSubset<T, CheckMappingCreateArgs<ExtArgs>>): Prisma.Prisma__CheckMappingClient<runtime.Types.Result.GetResult<Prisma.$CheckMappingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CheckMappingCreateManyArgs>(args?: Prisma.SelectSubset<T, CheckMappingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends CheckMappingCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CheckMappingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckMappingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends CheckMappingDeleteArgs>(args: Prisma.SelectSubset<T, CheckMappingDeleteArgs<ExtArgs>>): Prisma.Prisma__CheckMappingClient<runtime.Types.Result.GetResult<Prisma.$CheckMappingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CheckMappingUpdateArgs>(args: Prisma.SelectSubset<T, CheckMappingUpdateArgs<ExtArgs>>): Prisma.Prisma__CheckMappingClient<runtime.Types.Result.GetResult<Prisma.$CheckMappingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CheckMappingDeleteManyArgs>(args?: Prisma.SelectSubset<T, CheckMappingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CheckMappingUpdateManyArgs>(args: Prisma.SelectSubset<T, CheckMappingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends CheckMappingUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CheckMappingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckMappingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends CheckMappingUpsertArgs>(args: Prisma.SelectSubset<T, CheckMappingUpsertArgs<ExtArgs>>): Prisma.Prisma__CheckMappingClient<runtime.Types.Result.GetResult<Prisma.$CheckMappingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CheckMappingCountArgs>(args?: Prisma.Subset<T, CheckMappingCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CheckMappingCountAggregateOutputType> : number>;
    aggregate<T extends CheckMappingAggregateArgs>(args: Prisma.Subset<T, CheckMappingAggregateArgs>): Prisma.PrismaPromise<GetCheckMappingAggregateType<T>>;
    groupBy<T extends CheckMappingGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CheckMappingGroupByArgs['orderBy'];
    } : {
        orderBy?: CheckMappingGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CheckMappingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCheckMappingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CheckMappingFieldRefs;
}
export interface Prisma__CheckMappingClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    check<T extends Prisma.CheckDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CheckDefaultArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CheckMappingFieldRefs {
    readonly id: Prisma.FieldRef<"CheckMapping", 'String'>;
    readonly checkId: Prisma.FieldRef<"CheckMapping", 'String'>;
    readonly frameworkCode: Prisma.FieldRef<"CheckMapping", 'String'>;
    readonly frameworkVersion: Prisma.FieldRef<"CheckMapping", 'String'>;
    readonly requirementCode: Prisma.FieldRef<"CheckMapping", 'String'>;
}
export type CheckMappingFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckMappingSelect<ExtArgs> | null;
    omit?: Prisma.CheckMappingOmit<ExtArgs> | null;
    include?: Prisma.CheckMappingInclude<ExtArgs> | null;
    where: Prisma.CheckMappingWhereUniqueInput;
};
export type CheckMappingFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckMappingSelect<ExtArgs> | null;
    omit?: Prisma.CheckMappingOmit<ExtArgs> | null;
    include?: Prisma.CheckMappingInclude<ExtArgs> | null;
    where: Prisma.CheckMappingWhereUniqueInput;
};
export type CheckMappingFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckMappingSelect<ExtArgs> | null;
    omit?: Prisma.CheckMappingOmit<ExtArgs> | null;
    include?: Prisma.CheckMappingInclude<ExtArgs> | null;
    where?: Prisma.CheckMappingWhereInput;
    orderBy?: Prisma.CheckMappingOrderByWithRelationInput | Prisma.CheckMappingOrderByWithRelationInput[];
    cursor?: Prisma.CheckMappingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CheckMappingScalarFieldEnum | Prisma.CheckMappingScalarFieldEnum[];
};
export type CheckMappingFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckMappingSelect<ExtArgs> | null;
    omit?: Prisma.CheckMappingOmit<ExtArgs> | null;
    include?: Prisma.CheckMappingInclude<ExtArgs> | null;
    where?: Prisma.CheckMappingWhereInput;
    orderBy?: Prisma.CheckMappingOrderByWithRelationInput | Prisma.CheckMappingOrderByWithRelationInput[];
    cursor?: Prisma.CheckMappingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CheckMappingScalarFieldEnum | Prisma.CheckMappingScalarFieldEnum[];
};
export type CheckMappingFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckMappingSelect<ExtArgs> | null;
    omit?: Prisma.CheckMappingOmit<ExtArgs> | null;
    include?: Prisma.CheckMappingInclude<ExtArgs> | null;
    where?: Prisma.CheckMappingWhereInput;
    orderBy?: Prisma.CheckMappingOrderByWithRelationInput | Prisma.CheckMappingOrderByWithRelationInput[];
    cursor?: Prisma.CheckMappingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CheckMappingScalarFieldEnum | Prisma.CheckMappingScalarFieldEnum[];
};
export type CheckMappingCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckMappingSelect<ExtArgs> | null;
    omit?: Prisma.CheckMappingOmit<ExtArgs> | null;
    include?: Prisma.CheckMappingInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CheckMappingCreateInput, Prisma.CheckMappingUncheckedCreateInput>;
};
export type CheckMappingCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CheckMappingCreateManyInput | Prisma.CheckMappingCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CheckMappingCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckMappingSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CheckMappingOmit<ExtArgs> | null;
    data: Prisma.CheckMappingCreateManyInput | Prisma.CheckMappingCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.CheckMappingIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type CheckMappingUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckMappingSelect<ExtArgs> | null;
    omit?: Prisma.CheckMappingOmit<ExtArgs> | null;
    include?: Prisma.CheckMappingInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CheckMappingUpdateInput, Prisma.CheckMappingUncheckedUpdateInput>;
    where: Prisma.CheckMappingWhereUniqueInput;
};
export type CheckMappingUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CheckMappingUpdateManyMutationInput, Prisma.CheckMappingUncheckedUpdateManyInput>;
    where?: Prisma.CheckMappingWhereInput;
    limit?: number;
};
export type CheckMappingUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckMappingSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CheckMappingOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CheckMappingUpdateManyMutationInput, Prisma.CheckMappingUncheckedUpdateManyInput>;
    where?: Prisma.CheckMappingWhereInput;
    limit?: number;
    include?: Prisma.CheckMappingIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type CheckMappingUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckMappingSelect<ExtArgs> | null;
    omit?: Prisma.CheckMappingOmit<ExtArgs> | null;
    include?: Prisma.CheckMappingInclude<ExtArgs> | null;
    where: Prisma.CheckMappingWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckMappingCreateInput, Prisma.CheckMappingUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CheckMappingUpdateInput, Prisma.CheckMappingUncheckedUpdateInput>;
};
export type CheckMappingDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckMappingSelect<ExtArgs> | null;
    omit?: Prisma.CheckMappingOmit<ExtArgs> | null;
    include?: Prisma.CheckMappingInclude<ExtArgs> | null;
    where: Prisma.CheckMappingWhereUniqueInput;
};
export type CheckMappingDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckMappingWhereInput;
    limit?: number;
};
export type CheckMappingDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckMappingSelect<ExtArgs> | null;
    omit?: Prisma.CheckMappingOmit<ExtArgs> | null;
    include?: Prisma.CheckMappingInclude<ExtArgs> | null;
};
export {};
