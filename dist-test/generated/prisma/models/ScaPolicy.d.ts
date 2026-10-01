import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ScaPolicyModel = runtime.Types.Result.DefaultSelection<Prisma.$ScaPolicyPayload>;
export type AggregateScaPolicy = {
    _count: ScaPolicyCountAggregateOutputType | null;
    _avg: ScaPolicyAvgAggregateOutputType | null;
    _sum: ScaPolicySumAggregateOutputType | null;
    _min: ScaPolicyMinAggregateOutputType | null;
    _max: ScaPolicyMaxAggregateOutputType | null;
};
export type ScaPolicyAvgAggregateOutputType = {
    checkCount: number | null;
};
export type ScaPolicySumAggregateOutputType = {
    checkCount: number | null;
};
export type ScaPolicyMinAggregateOutputType = {
    id: string | null;
    platform: string | null;
    benchmark: string | null;
    scaId: string | null;
    yamlFile: string | null;
    checkCount: number | null;
};
export type ScaPolicyMaxAggregateOutputType = {
    id: string | null;
    platform: string | null;
    benchmark: string | null;
    scaId: string | null;
    yamlFile: string | null;
    checkCount: number | null;
};
export type ScaPolicyCountAggregateOutputType = {
    id: number;
    platform: number;
    benchmark: number;
    scaId: number;
    yamlFile: number;
    checkCount: number;
    _all: number;
};
export type ScaPolicyAvgAggregateInputType = {
    checkCount?: true;
};
export type ScaPolicySumAggregateInputType = {
    checkCount?: true;
};
export type ScaPolicyMinAggregateInputType = {
    id?: true;
    platform?: true;
    benchmark?: true;
    scaId?: true;
    yamlFile?: true;
    checkCount?: true;
};
export type ScaPolicyMaxAggregateInputType = {
    id?: true;
    platform?: true;
    benchmark?: true;
    scaId?: true;
    yamlFile?: true;
    checkCount?: true;
};
export type ScaPolicyCountAggregateInputType = {
    id?: true;
    platform?: true;
    benchmark?: true;
    scaId?: true;
    yamlFile?: true;
    checkCount?: true;
    _all?: true;
};
export type ScaPolicyAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScaPolicyWhereInput;
    orderBy?: Prisma.ScaPolicyOrderByWithRelationInput | Prisma.ScaPolicyOrderByWithRelationInput[];
    cursor?: Prisma.ScaPolicyWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ScaPolicyCountAggregateInputType;
    _avg?: ScaPolicyAvgAggregateInputType;
    _sum?: ScaPolicySumAggregateInputType;
    _min?: ScaPolicyMinAggregateInputType;
    _max?: ScaPolicyMaxAggregateInputType;
};
export type GetScaPolicyAggregateType<T extends ScaPolicyAggregateArgs> = {
    [P in keyof T & keyof AggregateScaPolicy]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateScaPolicy[P]> : Prisma.GetScalarType<T[P], AggregateScaPolicy[P]>;
};
export type ScaPolicyGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScaPolicyWhereInput;
    orderBy?: Prisma.ScaPolicyOrderByWithAggregationInput | Prisma.ScaPolicyOrderByWithAggregationInput[];
    by: Prisma.ScaPolicyScalarFieldEnum[] | Prisma.ScaPolicyScalarFieldEnum;
    having?: Prisma.ScaPolicyScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ScaPolicyCountAggregateInputType | true;
    _avg?: ScaPolicyAvgAggregateInputType;
    _sum?: ScaPolicySumAggregateInputType;
    _min?: ScaPolicyMinAggregateInputType;
    _max?: ScaPolicyMaxAggregateInputType;
};
export type ScaPolicyGroupByOutputType = {
    id: string;
    platform: string;
    benchmark: string;
    scaId: string;
    yamlFile: string;
    checkCount: number;
    _count: ScaPolicyCountAggregateOutputType | null;
    _avg: ScaPolicyAvgAggregateOutputType | null;
    _sum: ScaPolicySumAggregateOutputType | null;
    _min: ScaPolicyMinAggregateOutputType | null;
    _max: ScaPolicyMaxAggregateOutputType | null;
};
type GetScaPolicyGroupByPayload<T extends ScaPolicyGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ScaPolicyGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ScaPolicyGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ScaPolicyGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ScaPolicyGroupByOutputType[P]>;
}>>;
export type ScaPolicyWhereInput = {
    AND?: Prisma.ScaPolicyWhereInput | Prisma.ScaPolicyWhereInput[];
    OR?: Prisma.ScaPolicyWhereInput[];
    NOT?: Prisma.ScaPolicyWhereInput | Prisma.ScaPolicyWhereInput[];
    id?: Prisma.UuidFilter<"ScaPolicy"> | string;
    platform?: Prisma.StringFilter<"ScaPolicy"> | string;
    benchmark?: Prisma.StringFilter<"ScaPolicy"> | string;
    scaId?: Prisma.StringFilter<"ScaPolicy"> | string;
    yamlFile?: Prisma.StringFilter<"ScaPolicy"> | string;
    checkCount?: Prisma.IntFilter<"ScaPolicy"> | number;
    checks?: Prisma.CheckListRelationFilter;
};
export type ScaPolicyOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    benchmark?: Prisma.SortOrder;
    scaId?: Prisma.SortOrder;
    yamlFile?: Prisma.SortOrder;
    checkCount?: Prisma.SortOrder;
    checks?: Prisma.CheckOrderByRelationAggregateInput;
};
export type ScaPolicyWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    scaId?: string;
    AND?: Prisma.ScaPolicyWhereInput | Prisma.ScaPolicyWhereInput[];
    OR?: Prisma.ScaPolicyWhereInput[];
    NOT?: Prisma.ScaPolicyWhereInput | Prisma.ScaPolicyWhereInput[];
    platform?: Prisma.StringFilter<"ScaPolicy"> | string;
    benchmark?: Prisma.StringFilter<"ScaPolicy"> | string;
    yamlFile?: Prisma.StringFilter<"ScaPolicy"> | string;
    checkCount?: Prisma.IntFilter<"ScaPolicy"> | number;
    checks?: Prisma.CheckListRelationFilter;
}, "id" | "scaId">;
export type ScaPolicyOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    benchmark?: Prisma.SortOrder;
    scaId?: Prisma.SortOrder;
    yamlFile?: Prisma.SortOrder;
    checkCount?: Prisma.SortOrder;
    _count?: Prisma.ScaPolicyCountOrderByAggregateInput;
    _avg?: Prisma.ScaPolicyAvgOrderByAggregateInput;
    _max?: Prisma.ScaPolicyMaxOrderByAggregateInput;
    _min?: Prisma.ScaPolicyMinOrderByAggregateInput;
    _sum?: Prisma.ScaPolicySumOrderByAggregateInput;
};
export type ScaPolicyScalarWhereWithAggregatesInput = {
    AND?: Prisma.ScaPolicyScalarWhereWithAggregatesInput | Prisma.ScaPolicyScalarWhereWithAggregatesInput[];
    OR?: Prisma.ScaPolicyScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ScaPolicyScalarWhereWithAggregatesInput | Prisma.ScaPolicyScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ScaPolicy"> | string;
    platform?: Prisma.StringWithAggregatesFilter<"ScaPolicy"> | string;
    benchmark?: Prisma.StringWithAggregatesFilter<"ScaPolicy"> | string;
    scaId?: Prisma.StringWithAggregatesFilter<"ScaPolicy"> | string;
    yamlFile?: Prisma.StringWithAggregatesFilter<"ScaPolicy"> | string;
    checkCount?: Prisma.IntWithAggregatesFilter<"ScaPolicy"> | number;
};
export type ScaPolicyCreateInput = {
    id?: string;
    platform: string;
    benchmark: string;
    scaId: string;
    yamlFile: string;
    checkCount: number;
    checks?: Prisma.CheckCreateNestedManyWithoutScaPolicyInput;
};
export type ScaPolicyUncheckedCreateInput = {
    id?: string;
    platform: string;
    benchmark: string;
    scaId: string;
    yamlFile: string;
    checkCount: number;
    checks?: Prisma.CheckUncheckedCreateNestedManyWithoutScaPolicyInput;
};
export type ScaPolicyUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    benchmark?: Prisma.StringFieldUpdateOperationsInput | string;
    scaId?: Prisma.StringFieldUpdateOperationsInput | string;
    yamlFile?: Prisma.StringFieldUpdateOperationsInput | string;
    checkCount?: Prisma.IntFieldUpdateOperationsInput | number;
    checks?: Prisma.CheckUpdateManyWithoutScaPolicyNestedInput;
};
export type ScaPolicyUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    benchmark?: Prisma.StringFieldUpdateOperationsInput | string;
    scaId?: Prisma.StringFieldUpdateOperationsInput | string;
    yamlFile?: Prisma.StringFieldUpdateOperationsInput | string;
    checkCount?: Prisma.IntFieldUpdateOperationsInput | number;
    checks?: Prisma.CheckUncheckedUpdateManyWithoutScaPolicyNestedInput;
};
export type ScaPolicyCreateManyInput = {
    id?: string;
    platform: string;
    benchmark: string;
    scaId: string;
    yamlFile: string;
    checkCount: number;
};
export type ScaPolicyUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    benchmark?: Prisma.StringFieldUpdateOperationsInput | string;
    scaId?: Prisma.StringFieldUpdateOperationsInput | string;
    yamlFile?: Prisma.StringFieldUpdateOperationsInput | string;
    checkCount?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ScaPolicyUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    benchmark?: Prisma.StringFieldUpdateOperationsInput | string;
    scaId?: Prisma.StringFieldUpdateOperationsInput | string;
    yamlFile?: Prisma.StringFieldUpdateOperationsInput | string;
    checkCount?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ScaPolicyNullableScalarRelationFilter = {
    is?: Prisma.ScaPolicyWhereInput | null;
    isNot?: Prisma.ScaPolicyWhereInput | null;
};
export type ScaPolicyCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    benchmark?: Prisma.SortOrder;
    scaId?: Prisma.SortOrder;
    yamlFile?: Prisma.SortOrder;
    checkCount?: Prisma.SortOrder;
};
export type ScaPolicyAvgOrderByAggregateInput = {
    checkCount?: Prisma.SortOrder;
};
export type ScaPolicyMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    benchmark?: Prisma.SortOrder;
    scaId?: Prisma.SortOrder;
    yamlFile?: Prisma.SortOrder;
    checkCount?: Prisma.SortOrder;
};
export type ScaPolicyMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    benchmark?: Prisma.SortOrder;
    scaId?: Prisma.SortOrder;
    yamlFile?: Prisma.SortOrder;
    checkCount?: Prisma.SortOrder;
};
export type ScaPolicySumOrderByAggregateInput = {
    checkCount?: Prisma.SortOrder;
};
export type ScaPolicyCreateNestedOneWithoutChecksInput = {
    create?: Prisma.XOR<Prisma.ScaPolicyCreateWithoutChecksInput, Prisma.ScaPolicyUncheckedCreateWithoutChecksInput>;
    connectOrCreate?: Prisma.ScaPolicyCreateOrConnectWithoutChecksInput;
    connect?: Prisma.ScaPolicyWhereUniqueInput;
};
export type ScaPolicyUpdateOneWithoutChecksNestedInput = {
    create?: Prisma.XOR<Prisma.ScaPolicyCreateWithoutChecksInput, Prisma.ScaPolicyUncheckedCreateWithoutChecksInput>;
    connectOrCreate?: Prisma.ScaPolicyCreateOrConnectWithoutChecksInput;
    upsert?: Prisma.ScaPolicyUpsertWithoutChecksInput;
    disconnect?: Prisma.ScaPolicyWhereInput | boolean;
    delete?: Prisma.ScaPolicyWhereInput | boolean;
    connect?: Prisma.ScaPolicyWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ScaPolicyUpdateToOneWithWhereWithoutChecksInput, Prisma.ScaPolicyUpdateWithoutChecksInput>, Prisma.ScaPolicyUncheckedUpdateWithoutChecksInput>;
};
export type ScaPolicyCreateWithoutChecksInput = {
    id?: string;
    platform: string;
    benchmark: string;
    scaId: string;
    yamlFile: string;
    checkCount: number;
};
export type ScaPolicyUncheckedCreateWithoutChecksInput = {
    id?: string;
    platform: string;
    benchmark: string;
    scaId: string;
    yamlFile: string;
    checkCount: number;
};
export type ScaPolicyCreateOrConnectWithoutChecksInput = {
    where: Prisma.ScaPolicyWhereUniqueInput;
    create: Prisma.XOR<Prisma.ScaPolicyCreateWithoutChecksInput, Prisma.ScaPolicyUncheckedCreateWithoutChecksInput>;
};
export type ScaPolicyUpsertWithoutChecksInput = {
    update: Prisma.XOR<Prisma.ScaPolicyUpdateWithoutChecksInput, Prisma.ScaPolicyUncheckedUpdateWithoutChecksInput>;
    create: Prisma.XOR<Prisma.ScaPolicyCreateWithoutChecksInput, Prisma.ScaPolicyUncheckedCreateWithoutChecksInput>;
    where?: Prisma.ScaPolicyWhereInput;
};
export type ScaPolicyUpdateToOneWithWhereWithoutChecksInput = {
    where?: Prisma.ScaPolicyWhereInput;
    data: Prisma.XOR<Prisma.ScaPolicyUpdateWithoutChecksInput, Prisma.ScaPolicyUncheckedUpdateWithoutChecksInput>;
};
export type ScaPolicyUpdateWithoutChecksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    benchmark?: Prisma.StringFieldUpdateOperationsInput | string;
    scaId?: Prisma.StringFieldUpdateOperationsInput | string;
    yamlFile?: Prisma.StringFieldUpdateOperationsInput | string;
    checkCount?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ScaPolicyUncheckedUpdateWithoutChecksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    benchmark?: Prisma.StringFieldUpdateOperationsInput | string;
    scaId?: Prisma.StringFieldUpdateOperationsInput | string;
    yamlFile?: Prisma.StringFieldUpdateOperationsInput | string;
    checkCount?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ScaPolicyCountOutputType = {
    checks: number;
};
export type ScaPolicyCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    checks?: boolean | ScaPolicyCountOutputTypeCountChecksArgs;
};
export type ScaPolicyCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScaPolicyCountOutputTypeSelect<ExtArgs> | null;
};
export type ScaPolicyCountOutputTypeCountChecksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckWhereInput;
};
export type ScaPolicySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    platform?: boolean;
    benchmark?: boolean;
    scaId?: boolean;
    yamlFile?: boolean;
    checkCount?: boolean;
    checks?: boolean | Prisma.ScaPolicy$checksArgs<ExtArgs>;
    _count?: boolean | Prisma.ScaPolicyCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["scaPolicy"]>;
export type ScaPolicySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    platform?: boolean;
    benchmark?: boolean;
    scaId?: boolean;
    yamlFile?: boolean;
    checkCount?: boolean;
}, ExtArgs["result"]["scaPolicy"]>;
export type ScaPolicySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    platform?: boolean;
    benchmark?: boolean;
    scaId?: boolean;
    yamlFile?: boolean;
    checkCount?: boolean;
}, ExtArgs["result"]["scaPolicy"]>;
export type ScaPolicySelectScalar = {
    id?: boolean;
    platform?: boolean;
    benchmark?: boolean;
    scaId?: boolean;
    yamlFile?: boolean;
    checkCount?: boolean;
};
export type ScaPolicyOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "platform" | "benchmark" | "scaId" | "yamlFile" | "checkCount", ExtArgs["result"]["scaPolicy"]>;
export type ScaPolicyInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    checks?: boolean | Prisma.ScaPolicy$checksArgs<ExtArgs>;
    _count?: boolean | Prisma.ScaPolicyCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ScaPolicyIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type ScaPolicyIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $ScaPolicyPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ScaPolicy";
    objects: {
        checks: Prisma.$CheckPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        platform: string;
        benchmark: string;
        scaId: string;
        yamlFile: string;
        checkCount: number;
    }, ExtArgs["result"]["scaPolicy"]>;
    composites: {};
};
export type ScaPolicyGetPayload<S extends boolean | null | undefined | ScaPolicyDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ScaPolicyPayload, S>;
export type ScaPolicyCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ScaPolicyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ScaPolicyCountAggregateInputType | true;
};
export interface ScaPolicyDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ScaPolicy'];
        meta: {
            name: 'ScaPolicy';
        };
    };
    findUnique<T extends ScaPolicyFindUniqueArgs>(args: Prisma.SelectSubset<T, ScaPolicyFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ScaPolicyClient<runtime.Types.Result.GetResult<Prisma.$ScaPolicyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ScaPolicyFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ScaPolicyFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ScaPolicyClient<runtime.Types.Result.GetResult<Prisma.$ScaPolicyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ScaPolicyFindFirstArgs>(args?: Prisma.SelectSubset<T, ScaPolicyFindFirstArgs<ExtArgs>>): Prisma.Prisma__ScaPolicyClient<runtime.Types.Result.GetResult<Prisma.$ScaPolicyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ScaPolicyFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ScaPolicyFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ScaPolicyClient<runtime.Types.Result.GetResult<Prisma.$ScaPolicyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ScaPolicyFindManyArgs>(args?: Prisma.SelectSubset<T, ScaPolicyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScaPolicyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ScaPolicyCreateArgs>(args: Prisma.SelectSubset<T, ScaPolicyCreateArgs<ExtArgs>>): Prisma.Prisma__ScaPolicyClient<runtime.Types.Result.GetResult<Prisma.$ScaPolicyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ScaPolicyCreateManyArgs>(args?: Prisma.SelectSubset<T, ScaPolicyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ScaPolicyCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ScaPolicyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScaPolicyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ScaPolicyDeleteArgs>(args: Prisma.SelectSubset<T, ScaPolicyDeleteArgs<ExtArgs>>): Prisma.Prisma__ScaPolicyClient<runtime.Types.Result.GetResult<Prisma.$ScaPolicyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ScaPolicyUpdateArgs>(args: Prisma.SelectSubset<T, ScaPolicyUpdateArgs<ExtArgs>>): Prisma.Prisma__ScaPolicyClient<runtime.Types.Result.GetResult<Prisma.$ScaPolicyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ScaPolicyDeleteManyArgs>(args?: Prisma.SelectSubset<T, ScaPolicyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ScaPolicyUpdateManyArgs>(args: Prisma.SelectSubset<T, ScaPolicyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ScaPolicyUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ScaPolicyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScaPolicyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ScaPolicyUpsertArgs>(args: Prisma.SelectSubset<T, ScaPolicyUpsertArgs<ExtArgs>>): Prisma.Prisma__ScaPolicyClient<runtime.Types.Result.GetResult<Prisma.$ScaPolicyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ScaPolicyCountArgs>(args?: Prisma.Subset<T, ScaPolicyCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ScaPolicyCountAggregateOutputType> : number>;
    aggregate<T extends ScaPolicyAggregateArgs>(args: Prisma.Subset<T, ScaPolicyAggregateArgs>): Prisma.PrismaPromise<GetScaPolicyAggregateType<T>>;
    groupBy<T extends ScaPolicyGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ScaPolicyGroupByArgs['orderBy'];
    } : {
        orderBy?: ScaPolicyGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ScaPolicyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScaPolicyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ScaPolicyFieldRefs;
}
export interface Prisma__ScaPolicyClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    checks<T extends Prisma.ScaPolicy$checksArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ScaPolicy$checksArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ScaPolicyFieldRefs {
    readonly id: Prisma.FieldRef<"ScaPolicy", 'String'>;
    readonly platform: Prisma.FieldRef<"ScaPolicy", 'String'>;
    readonly benchmark: Prisma.FieldRef<"ScaPolicy", 'String'>;
    readonly scaId: Prisma.FieldRef<"ScaPolicy", 'String'>;
    readonly yamlFile: Prisma.FieldRef<"ScaPolicy", 'String'>;
    readonly checkCount: Prisma.FieldRef<"ScaPolicy", 'Int'>;
}
export type ScaPolicyFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScaPolicySelect<ExtArgs> | null;
    omit?: Prisma.ScaPolicyOmit<ExtArgs> | null;
    include?: Prisma.ScaPolicyInclude<ExtArgs> | null;
    where: Prisma.ScaPolicyWhereUniqueInput;
};
export type ScaPolicyFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScaPolicySelect<ExtArgs> | null;
    omit?: Prisma.ScaPolicyOmit<ExtArgs> | null;
    include?: Prisma.ScaPolicyInclude<ExtArgs> | null;
    where: Prisma.ScaPolicyWhereUniqueInput;
};
export type ScaPolicyFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScaPolicySelect<ExtArgs> | null;
    omit?: Prisma.ScaPolicyOmit<ExtArgs> | null;
    include?: Prisma.ScaPolicyInclude<ExtArgs> | null;
    where?: Prisma.ScaPolicyWhereInput;
    orderBy?: Prisma.ScaPolicyOrderByWithRelationInput | Prisma.ScaPolicyOrderByWithRelationInput[];
    cursor?: Prisma.ScaPolicyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ScaPolicyScalarFieldEnum | Prisma.ScaPolicyScalarFieldEnum[];
};
export type ScaPolicyFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScaPolicySelect<ExtArgs> | null;
    omit?: Prisma.ScaPolicyOmit<ExtArgs> | null;
    include?: Prisma.ScaPolicyInclude<ExtArgs> | null;
    where?: Prisma.ScaPolicyWhereInput;
    orderBy?: Prisma.ScaPolicyOrderByWithRelationInput | Prisma.ScaPolicyOrderByWithRelationInput[];
    cursor?: Prisma.ScaPolicyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ScaPolicyScalarFieldEnum | Prisma.ScaPolicyScalarFieldEnum[];
};
export type ScaPolicyFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScaPolicySelect<ExtArgs> | null;
    omit?: Prisma.ScaPolicyOmit<ExtArgs> | null;
    include?: Prisma.ScaPolicyInclude<ExtArgs> | null;
    where?: Prisma.ScaPolicyWhereInput;
    orderBy?: Prisma.ScaPolicyOrderByWithRelationInput | Prisma.ScaPolicyOrderByWithRelationInput[];
    cursor?: Prisma.ScaPolicyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ScaPolicyScalarFieldEnum | Prisma.ScaPolicyScalarFieldEnum[];
};
export type ScaPolicyCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScaPolicySelect<ExtArgs> | null;
    omit?: Prisma.ScaPolicyOmit<ExtArgs> | null;
    include?: Prisma.ScaPolicyInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ScaPolicyCreateInput, Prisma.ScaPolicyUncheckedCreateInput>;
};
export type ScaPolicyCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ScaPolicyCreateManyInput | Prisma.ScaPolicyCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ScaPolicyCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScaPolicySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ScaPolicyOmit<ExtArgs> | null;
    data: Prisma.ScaPolicyCreateManyInput | Prisma.ScaPolicyCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ScaPolicyUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScaPolicySelect<ExtArgs> | null;
    omit?: Prisma.ScaPolicyOmit<ExtArgs> | null;
    include?: Prisma.ScaPolicyInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ScaPolicyUpdateInput, Prisma.ScaPolicyUncheckedUpdateInput>;
    where: Prisma.ScaPolicyWhereUniqueInput;
};
export type ScaPolicyUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ScaPolicyUpdateManyMutationInput, Prisma.ScaPolicyUncheckedUpdateManyInput>;
    where?: Prisma.ScaPolicyWhereInput;
    limit?: number;
};
export type ScaPolicyUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScaPolicySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ScaPolicyOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ScaPolicyUpdateManyMutationInput, Prisma.ScaPolicyUncheckedUpdateManyInput>;
    where?: Prisma.ScaPolicyWhereInput;
    limit?: number;
};
export type ScaPolicyUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScaPolicySelect<ExtArgs> | null;
    omit?: Prisma.ScaPolicyOmit<ExtArgs> | null;
    include?: Prisma.ScaPolicyInclude<ExtArgs> | null;
    where: Prisma.ScaPolicyWhereUniqueInput;
    create: Prisma.XOR<Prisma.ScaPolicyCreateInput, Prisma.ScaPolicyUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ScaPolicyUpdateInput, Prisma.ScaPolicyUncheckedUpdateInput>;
};
export type ScaPolicyDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScaPolicySelect<ExtArgs> | null;
    omit?: Prisma.ScaPolicyOmit<ExtArgs> | null;
    include?: Prisma.ScaPolicyInclude<ExtArgs> | null;
    where: Prisma.ScaPolicyWhereUniqueInput;
};
export type ScaPolicyDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScaPolicyWhereInput;
    limit?: number;
};
export type ScaPolicy$checksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckSelect<ExtArgs> | null;
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    include?: Prisma.CheckInclude<ExtArgs> | null;
    where?: Prisma.CheckWhereInput;
    orderBy?: Prisma.CheckOrderByWithRelationInput | Prisma.CheckOrderByWithRelationInput[];
    cursor?: Prisma.CheckWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CheckScalarFieldEnum | Prisma.CheckScalarFieldEnum[];
};
export type ScaPolicyDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScaPolicySelect<ExtArgs> | null;
    omit?: Prisma.ScaPolicyOmit<ExtArgs> | null;
    include?: Prisma.ScaPolicyInclude<ExtArgs> | null;
};
export {};
