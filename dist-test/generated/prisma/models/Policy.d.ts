import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type PolicyModel = runtime.Types.Result.DefaultSelection<Prisma.$PolicyPayload>;
export type AggregatePolicy = {
    _count: PolicyCountAggregateOutputType | null;
    _min: PolicyMinAggregateOutputType | null;
    _max: PolicyMaxAggregateOutputType | null;
};
export type PolicyMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    approvalStatus: $Enums.PolicyApprovalStatus | null;
    validUntil: Date | null;
    version: string | null;
};
export type PolicyMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    approvalStatus: $Enums.PolicyApprovalStatus | null;
    validUntil: Date | null;
    version: string | null;
};
export type PolicyCountAggregateOutputType = {
    id: number;
    name: number;
    approvalStatus: number;
    validUntil: number;
    version: number;
    _all: number;
};
export type PolicyMinAggregateInputType = {
    id?: true;
    name?: true;
    approvalStatus?: true;
    validUntil?: true;
    version?: true;
};
export type PolicyMaxAggregateInputType = {
    id?: true;
    name?: true;
    approvalStatus?: true;
    validUntil?: true;
    version?: true;
};
export type PolicyCountAggregateInputType = {
    id?: true;
    name?: true;
    approvalStatus?: true;
    validUntil?: true;
    version?: true;
    _all?: true;
};
export type PolicyAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PolicyWhereInput;
    orderBy?: Prisma.PolicyOrderByWithRelationInput | Prisma.PolicyOrderByWithRelationInput[];
    cursor?: Prisma.PolicyWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | PolicyCountAggregateInputType;
    _min?: PolicyMinAggregateInputType;
    _max?: PolicyMaxAggregateInputType;
};
export type GetPolicyAggregateType<T extends PolicyAggregateArgs> = {
    [P in keyof T & keyof AggregatePolicy]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePolicy[P]> : Prisma.GetScalarType<T[P], AggregatePolicy[P]>;
};
export type PolicyGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PolicyWhereInput;
    orderBy?: Prisma.PolicyOrderByWithAggregationInput | Prisma.PolicyOrderByWithAggregationInput[];
    by: Prisma.PolicyScalarFieldEnum[] | Prisma.PolicyScalarFieldEnum;
    having?: Prisma.PolicyScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PolicyCountAggregateInputType | true;
    _min?: PolicyMinAggregateInputType;
    _max?: PolicyMaxAggregateInputType;
};
export type PolicyGroupByOutputType = {
    id: string;
    name: string;
    approvalStatus: $Enums.PolicyApprovalStatus;
    validUntil: Date;
    version: string;
    _count: PolicyCountAggregateOutputType | null;
    _min: PolicyMinAggregateOutputType | null;
    _max: PolicyMaxAggregateOutputType | null;
};
type GetPolicyGroupByPayload<T extends PolicyGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PolicyGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PolicyGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PolicyGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PolicyGroupByOutputType[P]>;
}>>;
export type PolicyWhereInput = {
    AND?: Prisma.PolicyWhereInput | Prisma.PolicyWhereInput[];
    OR?: Prisma.PolicyWhereInput[];
    NOT?: Prisma.PolicyWhereInput | Prisma.PolicyWhereInput[];
    id?: Prisma.UuidFilter<"Policy"> | string;
    name?: Prisma.StringFilter<"Policy"> | string;
    approvalStatus?: Prisma.EnumPolicyApprovalStatusFilter<"Policy"> | $Enums.PolicyApprovalStatus;
    validUntil?: Prisma.DateTimeFilter<"Policy"> | Date | string;
    version?: Prisma.StringFilter<"Policy"> | string;
    controlPolicies?: Prisma.ControlPolicyListRelationFilter;
};
export type PolicyOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    approvalStatus?: Prisma.SortOrder;
    validUntil?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    controlPolicies?: Prisma.ControlPolicyOrderByRelationAggregateInput;
};
export type PolicyWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.PolicyWhereInput | Prisma.PolicyWhereInput[];
    OR?: Prisma.PolicyWhereInput[];
    NOT?: Prisma.PolicyWhereInput | Prisma.PolicyWhereInput[];
    name?: Prisma.StringFilter<"Policy"> | string;
    approvalStatus?: Prisma.EnumPolicyApprovalStatusFilter<"Policy"> | $Enums.PolicyApprovalStatus;
    validUntil?: Prisma.DateTimeFilter<"Policy"> | Date | string;
    version?: Prisma.StringFilter<"Policy"> | string;
    controlPolicies?: Prisma.ControlPolicyListRelationFilter;
}, "id">;
export type PolicyOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    approvalStatus?: Prisma.SortOrder;
    validUntil?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    _count?: Prisma.PolicyCountOrderByAggregateInput;
    _max?: Prisma.PolicyMaxOrderByAggregateInput;
    _min?: Prisma.PolicyMinOrderByAggregateInput;
};
export type PolicyScalarWhereWithAggregatesInput = {
    AND?: Prisma.PolicyScalarWhereWithAggregatesInput | Prisma.PolicyScalarWhereWithAggregatesInput[];
    OR?: Prisma.PolicyScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PolicyScalarWhereWithAggregatesInput | Prisma.PolicyScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Policy"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Policy"> | string;
    approvalStatus?: Prisma.EnumPolicyApprovalStatusWithAggregatesFilter<"Policy"> | $Enums.PolicyApprovalStatus;
    validUntil?: Prisma.DateTimeWithAggregatesFilter<"Policy"> | Date | string;
    version?: Prisma.StringWithAggregatesFilter<"Policy"> | string;
};
export type PolicyCreateInput = {
    id?: string;
    name: string;
    approvalStatus: $Enums.PolicyApprovalStatus;
    validUntil: Date | string;
    version: string;
    controlPolicies?: Prisma.ControlPolicyCreateNestedManyWithoutPolicyInput;
};
export type PolicyUncheckedCreateInput = {
    id?: string;
    name: string;
    approvalStatus: $Enums.PolicyApprovalStatus;
    validUntil: Date | string;
    version: string;
    controlPolicies?: Prisma.ControlPolicyUncheckedCreateNestedManyWithoutPolicyInput;
};
export type PolicyUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    approvalStatus?: Prisma.EnumPolicyApprovalStatusFieldUpdateOperationsInput | $Enums.PolicyApprovalStatus;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    controlPolicies?: Prisma.ControlPolicyUpdateManyWithoutPolicyNestedInput;
};
export type PolicyUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    approvalStatus?: Prisma.EnumPolicyApprovalStatusFieldUpdateOperationsInput | $Enums.PolicyApprovalStatus;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    controlPolicies?: Prisma.ControlPolicyUncheckedUpdateManyWithoutPolicyNestedInput;
};
export type PolicyCreateManyInput = {
    id?: string;
    name: string;
    approvalStatus: $Enums.PolicyApprovalStatus;
    validUntil: Date | string;
    version: string;
};
export type PolicyUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    approvalStatus?: Prisma.EnumPolicyApprovalStatusFieldUpdateOperationsInput | $Enums.PolicyApprovalStatus;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PolicyUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    approvalStatus?: Prisma.EnumPolicyApprovalStatusFieldUpdateOperationsInput | $Enums.PolicyApprovalStatus;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PolicyCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    approvalStatus?: Prisma.SortOrder;
    validUntil?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
};
export type PolicyMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    approvalStatus?: Prisma.SortOrder;
    validUntil?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
};
export type PolicyMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    approvalStatus?: Prisma.SortOrder;
    validUntil?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
};
export type PolicyScalarRelationFilter = {
    is?: Prisma.PolicyWhereInput;
    isNot?: Prisma.PolicyWhereInput;
};
export type EnumPolicyApprovalStatusFieldUpdateOperationsInput = {
    set?: $Enums.PolicyApprovalStatus;
};
export type PolicyCreateNestedOneWithoutControlPoliciesInput = {
    create?: Prisma.XOR<Prisma.PolicyCreateWithoutControlPoliciesInput, Prisma.PolicyUncheckedCreateWithoutControlPoliciesInput>;
    connectOrCreate?: Prisma.PolicyCreateOrConnectWithoutControlPoliciesInput;
    connect?: Prisma.PolicyWhereUniqueInput;
};
export type PolicyUpdateOneRequiredWithoutControlPoliciesNestedInput = {
    create?: Prisma.XOR<Prisma.PolicyCreateWithoutControlPoliciesInput, Prisma.PolicyUncheckedCreateWithoutControlPoliciesInput>;
    connectOrCreate?: Prisma.PolicyCreateOrConnectWithoutControlPoliciesInput;
    upsert?: Prisma.PolicyUpsertWithoutControlPoliciesInput;
    connect?: Prisma.PolicyWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PolicyUpdateToOneWithWhereWithoutControlPoliciesInput, Prisma.PolicyUpdateWithoutControlPoliciesInput>, Prisma.PolicyUncheckedUpdateWithoutControlPoliciesInput>;
};
export type PolicyCreateWithoutControlPoliciesInput = {
    id?: string;
    name: string;
    approvalStatus: $Enums.PolicyApprovalStatus;
    validUntil: Date | string;
    version: string;
};
export type PolicyUncheckedCreateWithoutControlPoliciesInput = {
    id?: string;
    name: string;
    approvalStatus: $Enums.PolicyApprovalStatus;
    validUntil: Date | string;
    version: string;
};
export type PolicyCreateOrConnectWithoutControlPoliciesInput = {
    where: Prisma.PolicyWhereUniqueInput;
    create: Prisma.XOR<Prisma.PolicyCreateWithoutControlPoliciesInput, Prisma.PolicyUncheckedCreateWithoutControlPoliciesInput>;
};
export type PolicyUpsertWithoutControlPoliciesInput = {
    update: Prisma.XOR<Prisma.PolicyUpdateWithoutControlPoliciesInput, Prisma.PolicyUncheckedUpdateWithoutControlPoliciesInput>;
    create: Prisma.XOR<Prisma.PolicyCreateWithoutControlPoliciesInput, Prisma.PolicyUncheckedCreateWithoutControlPoliciesInput>;
    where?: Prisma.PolicyWhereInput;
};
export type PolicyUpdateToOneWithWhereWithoutControlPoliciesInput = {
    where?: Prisma.PolicyWhereInput;
    data: Prisma.XOR<Prisma.PolicyUpdateWithoutControlPoliciesInput, Prisma.PolicyUncheckedUpdateWithoutControlPoliciesInput>;
};
export type PolicyUpdateWithoutControlPoliciesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    approvalStatus?: Prisma.EnumPolicyApprovalStatusFieldUpdateOperationsInput | $Enums.PolicyApprovalStatus;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PolicyUncheckedUpdateWithoutControlPoliciesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    approvalStatus?: Prisma.EnumPolicyApprovalStatusFieldUpdateOperationsInput | $Enums.PolicyApprovalStatus;
    validUntil?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PolicyCountOutputType = {
    controlPolicies: number;
};
export type PolicyCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    controlPolicies?: boolean | PolicyCountOutputTypeCountControlPoliciesArgs;
};
export type PolicyCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PolicyCountOutputTypeSelect<ExtArgs> | null;
};
export type PolicyCountOutputTypeCountControlPoliciesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlPolicyWhereInput;
};
export type PolicySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    approvalStatus?: boolean;
    validUntil?: boolean;
    version?: boolean;
    controlPolicies?: boolean | Prisma.Policy$controlPoliciesArgs<ExtArgs>;
    _count?: boolean | Prisma.PolicyCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["policy"]>;
export type PolicySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    approvalStatus?: boolean;
    validUntil?: boolean;
    version?: boolean;
}, ExtArgs["result"]["policy"]>;
export type PolicySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    approvalStatus?: boolean;
    validUntil?: boolean;
    version?: boolean;
}, ExtArgs["result"]["policy"]>;
export type PolicySelectScalar = {
    id?: boolean;
    name?: boolean;
    approvalStatus?: boolean;
    validUntil?: boolean;
    version?: boolean;
};
export type PolicyOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "approvalStatus" | "validUntil" | "version", ExtArgs["result"]["policy"]>;
export type PolicyInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    controlPolicies?: boolean | Prisma.Policy$controlPoliciesArgs<ExtArgs>;
    _count?: boolean | Prisma.PolicyCountOutputTypeDefaultArgs<ExtArgs>;
};
export type PolicyIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type PolicyIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $PolicyPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Policy";
    objects: {
        controlPolicies: Prisma.$ControlPolicyPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        approvalStatus: $Enums.PolicyApprovalStatus;
        validUntil: Date;
        version: string;
    }, ExtArgs["result"]["policy"]>;
    composites: {};
};
export type PolicyGetPayload<S extends boolean | null | undefined | PolicyDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PolicyPayload, S>;
export type PolicyCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PolicyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PolicyCountAggregateInputType | true;
};
export interface PolicyDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Policy'];
        meta: {
            name: 'Policy';
        };
    };
    findUnique<T extends PolicyFindUniqueArgs>(args: Prisma.SelectSubset<T, PolicyFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PolicyClient<runtime.Types.Result.GetResult<Prisma.$PolicyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends PolicyFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PolicyFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PolicyClient<runtime.Types.Result.GetResult<Prisma.$PolicyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends PolicyFindFirstArgs>(args?: Prisma.SelectSubset<T, PolicyFindFirstArgs<ExtArgs>>): Prisma.Prisma__PolicyClient<runtime.Types.Result.GetResult<Prisma.$PolicyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends PolicyFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PolicyFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PolicyClient<runtime.Types.Result.GetResult<Prisma.$PolicyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends PolicyFindManyArgs>(args?: Prisma.SelectSubset<T, PolicyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PolicyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends PolicyCreateArgs>(args: Prisma.SelectSubset<T, PolicyCreateArgs<ExtArgs>>): Prisma.Prisma__PolicyClient<runtime.Types.Result.GetResult<Prisma.$PolicyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends PolicyCreateManyArgs>(args?: Prisma.SelectSubset<T, PolicyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends PolicyCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PolicyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PolicyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends PolicyDeleteArgs>(args: Prisma.SelectSubset<T, PolicyDeleteArgs<ExtArgs>>): Prisma.Prisma__PolicyClient<runtime.Types.Result.GetResult<Prisma.$PolicyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends PolicyUpdateArgs>(args: Prisma.SelectSubset<T, PolicyUpdateArgs<ExtArgs>>): Prisma.Prisma__PolicyClient<runtime.Types.Result.GetResult<Prisma.$PolicyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends PolicyDeleteManyArgs>(args?: Prisma.SelectSubset<T, PolicyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends PolicyUpdateManyArgs>(args: Prisma.SelectSubset<T, PolicyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends PolicyUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PolicyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PolicyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends PolicyUpsertArgs>(args: Prisma.SelectSubset<T, PolicyUpsertArgs<ExtArgs>>): Prisma.Prisma__PolicyClient<runtime.Types.Result.GetResult<Prisma.$PolicyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends PolicyCountArgs>(args?: Prisma.Subset<T, PolicyCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PolicyCountAggregateOutputType> : number>;
    aggregate<T extends PolicyAggregateArgs>(args: Prisma.Subset<T, PolicyAggregateArgs>): Prisma.PrismaPromise<GetPolicyAggregateType<T>>;
    groupBy<T extends PolicyGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PolicyGroupByArgs['orderBy'];
    } : {
        orderBy?: PolicyGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PolicyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPolicyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: PolicyFieldRefs;
}
export interface Prisma__PolicyClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    controlPolicies<T extends Prisma.Policy$controlPoliciesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Policy$controlPoliciesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlPolicyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface PolicyFieldRefs {
    readonly id: Prisma.FieldRef<"Policy", 'String'>;
    readonly name: Prisma.FieldRef<"Policy", 'String'>;
    readonly approvalStatus: Prisma.FieldRef<"Policy", 'PolicyApprovalStatus'>;
    readonly validUntil: Prisma.FieldRef<"Policy", 'DateTime'>;
    readonly version: Prisma.FieldRef<"Policy", 'String'>;
}
export type PolicyFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PolicySelect<ExtArgs> | null;
    omit?: Prisma.PolicyOmit<ExtArgs> | null;
    include?: Prisma.PolicyInclude<ExtArgs> | null;
    where: Prisma.PolicyWhereUniqueInput;
};
export type PolicyFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PolicySelect<ExtArgs> | null;
    omit?: Prisma.PolicyOmit<ExtArgs> | null;
    include?: Prisma.PolicyInclude<ExtArgs> | null;
    where: Prisma.PolicyWhereUniqueInput;
};
export type PolicyFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PolicySelect<ExtArgs> | null;
    omit?: Prisma.PolicyOmit<ExtArgs> | null;
    include?: Prisma.PolicyInclude<ExtArgs> | null;
    where?: Prisma.PolicyWhereInput;
    orderBy?: Prisma.PolicyOrderByWithRelationInput | Prisma.PolicyOrderByWithRelationInput[];
    cursor?: Prisma.PolicyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PolicyScalarFieldEnum | Prisma.PolicyScalarFieldEnum[];
};
export type PolicyFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PolicySelect<ExtArgs> | null;
    omit?: Prisma.PolicyOmit<ExtArgs> | null;
    include?: Prisma.PolicyInclude<ExtArgs> | null;
    where?: Prisma.PolicyWhereInput;
    orderBy?: Prisma.PolicyOrderByWithRelationInput | Prisma.PolicyOrderByWithRelationInput[];
    cursor?: Prisma.PolicyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PolicyScalarFieldEnum | Prisma.PolicyScalarFieldEnum[];
};
export type PolicyFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PolicySelect<ExtArgs> | null;
    omit?: Prisma.PolicyOmit<ExtArgs> | null;
    include?: Prisma.PolicyInclude<ExtArgs> | null;
    where?: Prisma.PolicyWhereInput;
    orderBy?: Prisma.PolicyOrderByWithRelationInput | Prisma.PolicyOrderByWithRelationInput[];
    cursor?: Prisma.PolicyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PolicyScalarFieldEnum | Prisma.PolicyScalarFieldEnum[];
};
export type PolicyCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PolicySelect<ExtArgs> | null;
    omit?: Prisma.PolicyOmit<ExtArgs> | null;
    include?: Prisma.PolicyInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PolicyCreateInput, Prisma.PolicyUncheckedCreateInput>;
};
export type PolicyCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.PolicyCreateManyInput | Prisma.PolicyCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PolicyCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PolicySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PolicyOmit<ExtArgs> | null;
    data: Prisma.PolicyCreateManyInput | Prisma.PolicyCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PolicyUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PolicySelect<ExtArgs> | null;
    omit?: Prisma.PolicyOmit<ExtArgs> | null;
    include?: Prisma.PolicyInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PolicyUpdateInput, Prisma.PolicyUncheckedUpdateInput>;
    where: Prisma.PolicyWhereUniqueInput;
};
export type PolicyUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.PolicyUpdateManyMutationInput, Prisma.PolicyUncheckedUpdateManyInput>;
    where?: Prisma.PolicyWhereInput;
    limit?: number;
};
export type PolicyUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PolicySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PolicyOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PolicyUpdateManyMutationInput, Prisma.PolicyUncheckedUpdateManyInput>;
    where?: Prisma.PolicyWhereInput;
    limit?: number;
};
export type PolicyUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PolicySelect<ExtArgs> | null;
    omit?: Prisma.PolicyOmit<ExtArgs> | null;
    include?: Prisma.PolicyInclude<ExtArgs> | null;
    where: Prisma.PolicyWhereUniqueInput;
    create: Prisma.XOR<Prisma.PolicyCreateInput, Prisma.PolicyUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.PolicyUpdateInput, Prisma.PolicyUncheckedUpdateInput>;
};
export type PolicyDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PolicySelect<ExtArgs> | null;
    omit?: Prisma.PolicyOmit<ExtArgs> | null;
    include?: Prisma.PolicyInclude<ExtArgs> | null;
    where: Prisma.PolicyWhereUniqueInput;
};
export type PolicyDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PolicyWhereInput;
    limit?: number;
};
export type Policy$controlPoliciesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlPolicySelect<ExtArgs> | null;
    omit?: Prisma.ControlPolicyOmit<ExtArgs> | null;
    include?: Prisma.ControlPolicyInclude<ExtArgs> | null;
    where?: Prisma.ControlPolicyWhereInput;
    orderBy?: Prisma.ControlPolicyOrderByWithRelationInput | Prisma.ControlPolicyOrderByWithRelationInput[];
    cursor?: Prisma.ControlPolicyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlPolicyScalarFieldEnum | Prisma.ControlPolicyScalarFieldEnum[];
};
export type PolicyDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PolicySelect<ExtArgs> | null;
    omit?: Prisma.PolicyOmit<ExtArgs> | null;
    include?: Prisma.PolicyInclude<ExtArgs> | null;
};
export {};
