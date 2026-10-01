import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type EvidenceTemplateModel = runtime.Types.Result.DefaultSelection<Prisma.$EvidenceTemplatePayload>;
export type AggregateEvidenceTemplate = {
    _count: EvidenceTemplateCountAggregateOutputType | null;
    _min: EvidenceTemplateMinAggregateOutputType | null;
    _max: EvidenceTemplateMaxAggregateOutputType | null;
};
export type EvidenceTemplateMinAggregateOutputType = {
    id: string | null;
    code: string | null;
    description: string | null;
    dimension: $Enums.Dimension | null;
};
export type EvidenceTemplateMaxAggregateOutputType = {
    id: string | null;
    code: string | null;
    description: string | null;
    dimension: $Enums.Dimension | null;
};
export type EvidenceTemplateCountAggregateOutputType = {
    id: number;
    code: number;
    description: number;
    dimension: number;
    _all: number;
};
export type EvidenceTemplateMinAggregateInputType = {
    id?: true;
    code?: true;
    description?: true;
    dimension?: true;
};
export type EvidenceTemplateMaxAggregateInputType = {
    id?: true;
    code?: true;
    description?: true;
    dimension?: true;
};
export type EvidenceTemplateCountAggregateInputType = {
    id?: true;
    code?: true;
    description?: true;
    dimension?: true;
    _all?: true;
};
export type EvidenceTemplateAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvidenceTemplateWhereInput;
    orderBy?: Prisma.EvidenceTemplateOrderByWithRelationInput | Prisma.EvidenceTemplateOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceTemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | EvidenceTemplateCountAggregateInputType;
    _min?: EvidenceTemplateMinAggregateInputType;
    _max?: EvidenceTemplateMaxAggregateInputType;
};
export type GetEvidenceTemplateAggregateType<T extends EvidenceTemplateAggregateArgs> = {
    [P in keyof T & keyof AggregateEvidenceTemplate]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateEvidenceTemplate[P]> : Prisma.GetScalarType<T[P], AggregateEvidenceTemplate[P]>;
};
export type EvidenceTemplateGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvidenceTemplateWhereInput;
    orderBy?: Prisma.EvidenceTemplateOrderByWithAggregationInput | Prisma.EvidenceTemplateOrderByWithAggregationInput[];
    by: Prisma.EvidenceTemplateScalarFieldEnum[] | Prisma.EvidenceTemplateScalarFieldEnum;
    having?: Prisma.EvidenceTemplateScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: EvidenceTemplateCountAggregateInputType | true;
    _min?: EvidenceTemplateMinAggregateInputType;
    _max?: EvidenceTemplateMaxAggregateInputType;
};
export type EvidenceTemplateGroupByOutputType = {
    id: string;
    code: string;
    description: string;
    dimension: $Enums.Dimension;
    _count: EvidenceTemplateCountAggregateOutputType | null;
    _min: EvidenceTemplateMinAggregateOutputType | null;
    _max: EvidenceTemplateMaxAggregateOutputType | null;
};
type GetEvidenceTemplateGroupByPayload<T extends EvidenceTemplateGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<EvidenceTemplateGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof EvidenceTemplateGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], EvidenceTemplateGroupByOutputType[P]> : Prisma.GetScalarType<T[P], EvidenceTemplateGroupByOutputType[P]>;
}>>;
export type EvidenceTemplateWhereInput = {
    AND?: Prisma.EvidenceTemplateWhereInput | Prisma.EvidenceTemplateWhereInput[];
    OR?: Prisma.EvidenceTemplateWhereInput[];
    NOT?: Prisma.EvidenceTemplateWhereInput | Prisma.EvidenceTemplateWhereInput[];
    id?: Prisma.UuidFilter<"EvidenceTemplate"> | string;
    code?: Prisma.StringFilter<"EvidenceTemplate"> | string;
    description?: Prisma.StringFilter<"EvidenceTemplate"> | string;
    dimension?: Prisma.EnumDimensionFilter<"EvidenceTemplate"> | $Enums.Dimension;
    controls?: Prisma.ControlEvidenceTemplateListRelationFilter;
};
export type EvidenceTemplateOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    controls?: Prisma.ControlEvidenceTemplateOrderByRelationAggregateInput;
};
export type EvidenceTemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    code?: string;
    AND?: Prisma.EvidenceTemplateWhereInput | Prisma.EvidenceTemplateWhereInput[];
    OR?: Prisma.EvidenceTemplateWhereInput[];
    NOT?: Prisma.EvidenceTemplateWhereInput | Prisma.EvidenceTemplateWhereInput[];
    description?: Prisma.StringFilter<"EvidenceTemplate"> | string;
    dimension?: Prisma.EnumDimensionFilter<"EvidenceTemplate"> | $Enums.Dimension;
    controls?: Prisma.ControlEvidenceTemplateListRelationFilter;
}, "id" | "code">;
export type EvidenceTemplateOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    _count?: Prisma.EvidenceTemplateCountOrderByAggregateInput;
    _max?: Prisma.EvidenceTemplateMaxOrderByAggregateInput;
    _min?: Prisma.EvidenceTemplateMinOrderByAggregateInput;
};
export type EvidenceTemplateScalarWhereWithAggregatesInput = {
    AND?: Prisma.EvidenceTemplateScalarWhereWithAggregatesInput | Prisma.EvidenceTemplateScalarWhereWithAggregatesInput[];
    OR?: Prisma.EvidenceTemplateScalarWhereWithAggregatesInput[];
    NOT?: Prisma.EvidenceTemplateScalarWhereWithAggregatesInput | Prisma.EvidenceTemplateScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"EvidenceTemplate"> | string;
    code?: Prisma.StringWithAggregatesFilter<"EvidenceTemplate"> | string;
    description?: Prisma.StringWithAggregatesFilter<"EvidenceTemplate"> | string;
    dimension?: Prisma.EnumDimensionWithAggregatesFilter<"EvidenceTemplate"> | $Enums.Dimension;
};
export type EvidenceTemplateCreateInput = {
    id?: string;
    code: string;
    description: string;
    dimension?: $Enums.Dimension;
    controls?: Prisma.ControlEvidenceTemplateCreateNestedManyWithoutEvidenceTemplateInput;
};
export type EvidenceTemplateUncheckedCreateInput = {
    id?: string;
    code: string;
    description: string;
    dimension?: $Enums.Dimension;
    controls?: Prisma.ControlEvidenceTemplateUncheckedCreateNestedManyWithoutEvidenceTemplateInput;
};
export type EvidenceTemplateUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    controls?: Prisma.ControlEvidenceTemplateUpdateManyWithoutEvidenceTemplateNestedInput;
};
export type EvidenceTemplateUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    controls?: Prisma.ControlEvidenceTemplateUncheckedUpdateManyWithoutEvidenceTemplateNestedInput;
};
export type EvidenceTemplateCreateManyInput = {
    id?: string;
    code: string;
    description: string;
    dimension?: $Enums.Dimension;
};
export type EvidenceTemplateUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
};
export type EvidenceTemplateUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
};
export type EvidenceTemplateCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
};
export type EvidenceTemplateMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
};
export type EvidenceTemplateMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
};
export type EvidenceTemplateScalarRelationFilter = {
    is?: Prisma.EvidenceTemplateWhereInput;
    isNot?: Prisma.EvidenceTemplateWhereInput;
};
export type EvidenceTemplateCreateNestedOneWithoutControlsInput = {
    create?: Prisma.XOR<Prisma.EvidenceTemplateCreateWithoutControlsInput, Prisma.EvidenceTemplateUncheckedCreateWithoutControlsInput>;
    connectOrCreate?: Prisma.EvidenceTemplateCreateOrConnectWithoutControlsInput;
    connect?: Prisma.EvidenceTemplateWhereUniqueInput;
};
export type EvidenceTemplateUpdateOneRequiredWithoutControlsNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceTemplateCreateWithoutControlsInput, Prisma.EvidenceTemplateUncheckedCreateWithoutControlsInput>;
    connectOrCreate?: Prisma.EvidenceTemplateCreateOrConnectWithoutControlsInput;
    upsert?: Prisma.EvidenceTemplateUpsertWithoutControlsInput;
    connect?: Prisma.EvidenceTemplateWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EvidenceTemplateUpdateToOneWithWhereWithoutControlsInput, Prisma.EvidenceTemplateUpdateWithoutControlsInput>, Prisma.EvidenceTemplateUncheckedUpdateWithoutControlsInput>;
};
export type EvidenceTemplateCreateWithoutControlsInput = {
    id?: string;
    code: string;
    description: string;
    dimension?: $Enums.Dimension;
};
export type EvidenceTemplateUncheckedCreateWithoutControlsInput = {
    id?: string;
    code: string;
    description: string;
    dimension?: $Enums.Dimension;
};
export type EvidenceTemplateCreateOrConnectWithoutControlsInput = {
    where: Prisma.EvidenceTemplateWhereUniqueInput;
    create: Prisma.XOR<Prisma.EvidenceTemplateCreateWithoutControlsInput, Prisma.EvidenceTemplateUncheckedCreateWithoutControlsInput>;
};
export type EvidenceTemplateUpsertWithoutControlsInput = {
    update: Prisma.XOR<Prisma.EvidenceTemplateUpdateWithoutControlsInput, Prisma.EvidenceTemplateUncheckedUpdateWithoutControlsInput>;
    create: Prisma.XOR<Prisma.EvidenceTemplateCreateWithoutControlsInput, Prisma.EvidenceTemplateUncheckedCreateWithoutControlsInput>;
    where?: Prisma.EvidenceTemplateWhereInput;
};
export type EvidenceTemplateUpdateToOneWithWhereWithoutControlsInput = {
    where?: Prisma.EvidenceTemplateWhereInput;
    data: Prisma.XOR<Prisma.EvidenceTemplateUpdateWithoutControlsInput, Prisma.EvidenceTemplateUncheckedUpdateWithoutControlsInput>;
};
export type EvidenceTemplateUpdateWithoutControlsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
};
export type EvidenceTemplateUncheckedUpdateWithoutControlsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
};
export type EvidenceTemplateCountOutputType = {
    controls: number;
};
export type EvidenceTemplateCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    controls?: boolean | EvidenceTemplateCountOutputTypeCountControlsArgs;
};
export type EvidenceTemplateCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceTemplateCountOutputTypeSelect<ExtArgs> | null;
};
export type EvidenceTemplateCountOutputTypeCountControlsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlEvidenceTemplateWhereInput;
};
export type EvidenceTemplateSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    description?: boolean;
    dimension?: boolean;
    controls?: boolean | Prisma.EvidenceTemplate$controlsArgs<ExtArgs>;
    _count?: boolean | Prisma.EvidenceTemplateCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["evidenceTemplate"]>;
export type EvidenceTemplateSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    description?: boolean;
    dimension?: boolean;
}, ExtArgs["result"]["evidenceTemplate"]>;
export type EvidenceTemplateSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    description?: boolean;
    dimension?: boolean;
}, ExtArgs["result"]["evidenceTemplate"]>;
export type EvidenceTemplateSelectScalar = {
    id?: boolean;
    code?: boolean;
    description?: boolean;
    dimension?: boolean;
};
export type EvidenceTemplateOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "code" | "description" | "dimension", ExtArgs["result"]["evidenceTemplate"]>;
export type EvidenceTemplateInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    controls?: boolean | Prisma.EvidenceTemplate$controlsArgs<ExtArgs>;
    _count?: boolean | Prisma.EvidenceTemplateCountOutputTypeDefaultArgs<ExtArgs>;
};
export type EvidenceTemplateIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type EvidenceTemplateIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $EvidenceTemplatePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "EvidenceTemplate";
    objects: {
        controls: Prisma.$ControlEvidenceTemplatePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        code: string;
        description: string;
        dimension: $Enums.Dimension;
    }, ExtArgs["result"]["evidenceTemplate"]>;
    composites: {};
};
export type EvidenceTemplateGetPayload<S extends boolean | null | undefined | EvidenceTemplateDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$EvidenceTemplatePayload, S>;
export type EvidenceTemplateCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<EvidenceTemplateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: EvidenceTemplateCountAggregateInputType | true;
};
export interface EvidenceTemplateDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['EvidenceTemplate'];
        meta: {
            name: 'EvidenceTemplate';
        };
    };
    findUnique<T extends EvidenceTemplateFindUniqueArgs>(args: Prisma.SelectSubset<T, EvidenceTemplateFindUniqueArgs<ExtArgs>>): Prisma.Prisma__EvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$EvidenceTemplatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends EvidenceTemplateFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, EvidenceTemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__EvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$EvidenceTemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends EvidenceTemplateFindFirstArgs>(args?: Prisma.SelectSubset<T, EvidenceTemplateFindFirstArgs<ExtArgs>>): Prisma.Prisma__EvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$EvidenceTemplatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends EvidenceTemplateFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, EvidenceTemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__EvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$EvidenceTemplatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends EvidenceTemplateFindManyArgs>(args?: Prisma.SelectSubset<T, EvidenceTemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvidenceTemplatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends EvidenceTemplateCreateArgs>(args: Prisma.SelectSubset<T, EvidenceTemplateCreateArgs<ExtArgs>>): Prisma.Prisma__EvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$EvidenceTemplatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends EvidenceTemplateCreateManyArgs>(args?: Prisma.SelectSubset<T, EvidenceTemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends EvidenceTemplateCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, EvidenceTemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvidenceTemplatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends EvidenceTemplateDeleteArgs>(args: Prisma.SelectSubset<T, EvidenceTemplateDeleteArgs<ExtArgs>>): Prisma.Prisma__EvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$EvidenceTemplatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends EvidenceTemplateUpdateArgs>(args: Prisma.SelectSubset<T, EvidenceTemplateUpdateArgs<ExtArgs>>): Prisma.Prisma__EvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$EvidenceTemplatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends EvidenceTemplateDeleteManyArgs>(args?: Prisma.SelectSubset<T, EvidenceTemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends EvidenceTemplateUpdateManyArgs>(args: Prisma.SelectSubset<T, EvidenceTemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends EvidenceTemplateUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, EvidenceTemplateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvidenceTemplatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends EvidenceTemplateUpsertArgs>(args: Prisma.SelectSubset<T, EvidenceTemplateUpsertArgs<ExtArgs>>): Prisma.Prisma__EvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$EvidenceTemplatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends EvidenceTemplateCountArgs>(args?: Prisma.Subset<T, EvidenceTemplateCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], EvidenceTemplateCountAggregateOutputType> : number>;
    aggregate<T extends EvidenceTemplateAggregateArgs>(args: Prisma.Subset<T, EvidenceTemplateAggregateArgs>): Prisma.PrismaPromise<GetEvidenceTemplateAggregateType<T>>;
    groupBy<T extends EvidenceTemplateGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: EvidenceTemplateGroupByArgs['orderBy'];
    } : {
        orderBy?: EvidenceTemplateGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, EvidenceTemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEvidenceTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: EvidenceTemplateFieldRefs;
}
export interface Prisma__EvidenceTemplateClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    controls<T extends Prisma.EvidenceTemplate$controlsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EvidenceTemplate$controlsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlEvidenceTemplatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface EvidenceTemplateFieldRefs {
    readonly id: Prisma.FieldRef<"EvidenceTemplate", 'String'>;
    readonly code: Prisma.FieldRef<"EvidenceTemplate", 'String'>;
    readonly description: Prisma.FieldRef<"EvidenceTemplate", 'String'>;
    readonly dimension: Prisma.FieldRef<"EvidenceTemplate", 'Dimension'>;
}
export type EvidenceTemplateFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.EvidenceTemplateInclude<ExtArgs> | null;
    where: Prisma.EvidenceTemplateWhereUniqueInput;
};
export type EvidenceTemplateFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.EvidenceTemplateInclude<ExtArgs> | null;
    where: Prisma.EvidenceTemplateWhereUniqueInput;
};
export type EvidenceTemplateFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.EvidenceTemplateInclude<ExtArgs> | null;
    where?: Prisma.EvidenceTemplateWhereInput;
    orderBy?: Prisma.EvidenceTemplateOrderByWithRelationInput | Prisma.EvidenceTemplateOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceTemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EvidenceTemplateScalarFieldEnum | Prisma.EvidenceTemplateScalarFieldEnum[];
};
export type EvidenceTemplateFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.EvidenceTemplateInclude<ExtArgs> | null;
    where?: Prisma.EvidenceTemplateWhereInput;
    orderBy?: Prisma.EvidenceTemplateOrderByWithRelationInput | Prisma.EvidenceTemplateOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceTemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EvidenceTemplateScalarFieldEnum | Prisma.EvidenceTemplateScalarFieldEnum[];
};
export type EvidenceTemplateFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.EvidenceTemplateInclude<ExtArgs> | null;
    where?: Prisma.EvidenceTemplateWhereInput;
    orderBy?: Prisma.EvidenceTemplateOrderByWithRelationInput | Prisma.EvidenceTemplateOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceTemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EvidenceTemplateScalarFieldEnum | Prisma.EvidenceTemplateScalarFieldEnum[];
};
export type EvidenceTemplateCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.EvidenceTemplateInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EvidenceTemplateCreateInput, Prisma.EvidenceTemplateUncheckedCreateInput>;
};
export type EvidenceTemplateCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.EvidenceTemplateCreateManyInput | Prisma.EvidenceTemplateCreateManyInput[];
    skipDuplicates?: boolean;
};
export type EvidenceTemplateCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceTemplateSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EvidenceTemplateOmit<ExtArgs> | null;
    data: Prisma.EvidenceTemplateCreateManyInput | Prisma.EvidenceTemplateCreateManyInput[];
    skipDuplicates?: boolean;
};
export type EvidenceTemplateUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.EvidenceTemplateInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EvidenceTemplateUpdateInput, Prisma.EvidenceTemplateUncheckedUpdateInput>;
    where: Prisma.EvidenceTemplateWhereUniqueInput;
};
export type EvidenceTemplateUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.EvidenceTemplateUpdateManyMutationInput, Prisma.EvidenceTemplateUncheckedUpdateManyInput>;
    where?: Prisma.EvidenceTemplateWhereInput;
    limit?: number;
};
export type EvidenceTemplateUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceTemplateSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EvidenceTemplateOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EvidenceTemplateUpdateManyMutationInput, Prisma.EvidenceTemplateUncheckedUpdateManyInput>;
    where?: Prisma.EvidenceTemplateWhereInput;
    limit?: number;
};
export type EvidenceTemplateUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.EvidenceTemplateInclude<ExtArgs> | null;
    where: Prisma.EvidenceTemplateWhereUniqueInput;
    create: Prisma.XOR<Prisma.EvidenceTemplateCreateInput, Prisma.EvidenceTemplateUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.EvidenceTemplateUpdateInput, Prisma.EvidenceTemplateUncheckedUpdateInput>;
};
export type EvidenceTemplateDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.EvidenceTemplateInclude<ExtArgs> | null;
    where: Prisma.EvidenceTemplateWhereUniqueInput;
};
export type EvidenceTemplateDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvidenceTemplateWhereInput;
    limit?: number;
};
export type EvidenceTemplate$controlsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlEvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.ControlEvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.ControlEvidenceTemplateInclude<ExtArgs> | null;
    where?: Prisma.ControlEvidenceTemplateWhereInput;
    orderBy?: Prisma.ControlEvidenceTemplateOrderByWithRelationInput | Prisma.ControlEvidenceTemplateOrderByWithRelationInput[];
    cursor?: Prisma.ControlEvidenceTemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlEvidenceTemplateScalarFieldEnum | Prisma.ControlEvidenceTemplateScalarFieldEnum[];
};
export type EvidenceTemplateDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.EvidenceTemplateInclude<ExtArgs> | null;
};
export {};
