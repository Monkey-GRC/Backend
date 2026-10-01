import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TrustCriterionModel = runtime.Types.Result.DefaultSelection<Prisma.$TrustCriterionPayload>;
export type AggregateTrustCriterion = {
    _count: TrustCriterionCountAggregateOutputType | null;
    _min: TrustCriterionMinAggregateOutputType | null;
    _max: TrustCriterionMaxAggregateOutputType | null;
};
export type TrustCriterionMinAggregateOutputType = {
    id: string | null;
    criterion: $Enums.TrustCriterionCode | null;
    isMandatory: boolean | null;
};
export type TrustCriterionMaxAggregateOutputType = {
    id: string | null;
    criterion: $Enums.TrustCriterionCode | null;
    isMandatory: boolean | null;
};
export type TrustCriterionCountAggregateOutputType = {
    id: number;
    criterion: number;
    isMandatory: number;
    _all: number;
};
export type TrustCriterionMinAggregateInputType = {
    id?: true;
    criterion?: true;
    isMandatory?: true;
};
export type TrustCriterionMaxAggregateInputType = {
    id?: true;
    criterion?: true;
    isMandatory?: true;
};
export type TrustCriterionCountAggregateInputType = {
    id?: true;
    criterion?: true;
    isMandatory?: true;
    _all?: true;
};
export type TrustCriterionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TrustCriterionWhereInput;
    orderBy?: Prisma.TrustCriterionOrderByWithRelationInput | Prisma.TrustCriterionOrderByWithRelationInput[];
    cursor?: Prisma.TrustCriterionWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TrustCriterionCountAggregateInputType;
    _min?: TrustCriterionMinAggregateInputType;
    _max?: TrustCriterionMaxAggregateInputType;
};
export type GetTrustCriterionAggregateType<T extends TrustCriterionAggregateArgs> = {
    [P in keyof T & keyof AggregateTrustCriterion]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTrustCriterion[P]> : Prisma.GetScalarType<T[P], AggregateTrustCriterion[P]>;
};
export type TrustCriterionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TrustCriterionWhereInput;
    orderBy?: Prisma.TrustCriterionOrderByWithAggregationInput | Prisma.TrustCriterionOrderByWithAggregationInput[];
    by: Prisma.TrustCriterionScalarFieldEnum[] | Prisma.TrustCriterionScalarFieldEnum;
    having?: Prisma.TrustCriterionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TrustCriterionCountAggregateInputType | true;
    _min?: TrustCriterionMinAggregateInputType;
    _max?: TrustCriterionMaxAggregateInputType;
};
export type TrustCriterionGroupByOutputType = {
    id: string;
    criterion: $Enums.TrustCriterionCode;
    isMandatory: boolean;
    _count: TrustCriterionCountAggregateOutputType | null;
    _min: TrustCriterionMinAggregateOutputType | null;
    _max: TrustCriterionMaxAggregateOutputType | null;
};
type GetTrustCriterionGroupByPayload<T extends TrustCriterionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TrustCriterionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TrustCriterionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TrustCriterionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TrustCriterionGroupByOutputType[P]>;
}>>;
export type TrustCriterionWhereInput = {
    AND?: Prisma.TrustCriterionWhereInput | Prisma.TrustCriterionWhereInput[];
    OR?: Prisma.TrustCriterionWhereInput[];
    NOT?: Prisma.TrustCriterionWhereInput | Prisma.TrustCriterionWhereInput[];
    id?: Prisma.UuidFilter<"TrustCriterion"> | string;
    criterion?: Prisma.EnumTrustCriterionCodeFilter<"TrustCriterion"> | $Enums.TrustCriterionCode;
    isMandatory?: Prisma.BoolFilter<"TrustCriterion"> | boolean;
    requirements?: Prisma.RequirementListRelationFilter;
    serviceTrustCriteria?: Prisma.ServiceTrustCriterionListRelationFilter;
};
export type TrustCriterionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    criterion?: Prisma.SortOrder;
    isMandatory?: Prisma.SortOrder;
    requirements?: Prisma.RequirementOrderByRelationAggregateInput;
    serviceTrustCriteria?: Prisma.ServiceTrustCriterionOrderByRelationAggregateInput;
};
export type TrustCriterionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    criterion?: $Enums.TrustCriterionCode;
    AND?: Prisma.TrustCriterionWhereInput | Prisma.TrustCriterionWhereInput[];
    OR?: Prisma.TrustCriterionWhereInput[];
    NOT?: Prisma.TrustCriterionWhereInput | Prisma.TrustCriterionWhereInput[];
    isMandatory?: Prisma.BoolFilter<"TrustCriterion"> | boolean;
    requirements?: Prisma.RequirementListRelationFilter;
    serviceTrustCriteria?: Prisma.ServiceTrustCriterionListRelationFilter;
}, "id" | "criterion">;
export type TrustCriterionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    criterion?: Prisma.SortOrder;
    isMandatory?: Prisma.SortOrder;
    _count?: Prisma.TrustCriterionCountOrderByAggregateInput;
    _max?: Prisma.TrustCriterionMaxOrderByAggregateInput;
    _min?: Prisma.TrustCriterionMinOrderByAggregateInput;
};
export type TrustCriterionScalarWhereWithAggregatesInput = {
    AND?: Prisma.TrustCriterionScalarWhereWithAggregatesInput | Prisma.TrustCriterionScalarWhereWithAggregatesInput[];
    OR?: Prisma.TrustCriterionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TrustCriterionScalarWhereWithAggregatesInput | Prisma.TrustCriterionScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"TrustCriterion"> | string;
    criterion?: Prisma.EnumTrustCriterionCodeWithAggregatesFilter<"TrustCriterion"> | $Enums.TrustCriterionCode;
    isMandatory?: Prisma.BoolWithAggregatesFilter<"TrustCriterion"> | boolean;
};
export type TrustCriterionCreateInput = {
    id?: string;
    criterion: $Enums.TrustCriterionCode;
    isMandatory: boolean;
    requirements?: Prisma.RequirementCreateNestedManyWithoutTrustCriterionInput;
    serviceTrustCriteria?: Prisma.ServiceTrustCriterionCreateNestedManyWithoutTrustCriterionInput;
};
export type TrustCriterionUncheckedCreateInput = {
    id?: string;
    criterion: $Enums.TrustCriterionCode;
    isMandatory: boolean;
    requirements?: Prisma.RequirementUncheckedCreateNestedManyWithoutTrustCriterionInput;
    serviceTrustCriteria?: Prisma.ServiceTrustCriterionUncheckedCreateNestedManyWithoutTrustCriterionInput;
};
export type TrustCriterionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.EnumTrustCriterionCodeFieldUpdateOperationsInput | $Enums.TrustCriterionCode;
    isMandatory?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requirements?: Prisma.RequirementUpdateManyWithoutTrustCriterionNestedInput;
    serviceTrustCriteria?: Prisma.ServiceTrustCriterionUpdateManyWithoutTrustCriterionNestedInput;
};
export type TrustCriterionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.EnumTrustCriterionCodeFieldUpdateOperationsInput | $Enums.TrustCriterionCode;
    isMandatory?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requirements?: Prisma.RequirementUncheckedUpdateManyWithoutTrustCriterionNestedInput;
    serviceTrustCriteria?: Prisma.ServiceTrustCriterionUncheckedUpdateManyWithoutTrustCriterionNestedInput;
};
export type TrustCriterionCreateManyInput = {
    id?: string;
    criterion: $Enums.TrustCriterionCode;
    isMandatory: boolean;
};
export type TrustCriterionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.EnumTrustCriterionCodeFieldUpdateOperationsInput | $Enums.TrustCriterionCode;
    isMandatory?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type TrustCriterionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.EnumTrustCriterionCodeFieldUpdateOperationsInput | $Enums.TrustCriterionCode;
    isMandatory?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type TrustCriterionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    criterion?: Prisma.SortOrder;
    isMandatory?: Prisma.SortOrder;
};
export type TrustCriterionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    criterion?: Prisma.SortOrder;
    isMandatory?: Prisma.SortOrder;
};
export type TrustCriterionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    criterion?: Prisma.SortOrder;
    isMandatory?: Prisma.SortOrder;
};
export type TrustCriterionScalarRelationFilter = {
    is?: Prisma.TrustCriterionWhereInput;
    isNot?: Prisma.TrustCriterionWhereInput;
};
export type EnumTrustCriterionCodeFieldUpdateOperationsInput = {
    set?: $Enums.TrustCriterionCode;
};
export type TrustCriterionCreateNestedOneWithoutRequirementsInput = {
    create?: Prisma.XOR<Prisma.TrustCriterionCreateWithoutRequirementsInput, Prisma.TrustCriterionUncheckedCreateWithoutRequirementsInput>;
    connectOrCreate?: Prisma.TrustCriterionCreateOrConnectWithoutRequirementsInput;
    connect?: Prisma.TrustCriterionWhereUniqueInput;
};
export type TrustCriterionUpdateOneRequiredWithoutRequirementsNestedInput = {
    create?: Prisma.XOR<Prisma.TrustCriterionCreateWithoutRequirementsInput, Prisma.TrustCriterionUncheckedCreateWithoutRequirementsInput>;
    connectOrCreate?: Prisma.TrustCriterionCreateOrConnectWithoutRequirementsInput;
    upsert?: Prisma.TrustCriterionUpsertWithoutRequirementsInput;
    connect?: Prisma.TrustCriterionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TrustCriterionUpdateToOneWithWhereWithoutRequirementsInput, Prisma.TrustCriterionUpdateWithoutRequirementsInput>, Prisma.TrustCriterionUncheckedUpdateWithoutRequirementsInput>;
};
export type TrustCriterionCreateNestedOneWithoutServiceTrustCriteriaInput = {
    create?: Prisma.XOR<Prisma.TrustCriterionCreateWithoutServiceTrustCriteriaInput, Prisma.TrustCriterionUncheckedCreateWithoutServiceTrustCriteriaInput>;
    connectOrCreate?: Prisma.TrustCriterionCreateOrConnectWithoutServiceTrustCriteriaInput;
    connect?: Prisma.TrustCriterionWhereUniqueInput;
};
export type TrustCriterionUpdateOneRequiredWithoutServiceTrustCriteriaNestedInput = {
    create?: Prisma.XOR<Prisma.TrustCriterionCreateWithoutServiceTrustCriteriaInput, Prisma.TrustCriterionUncheckedCreateWithoutServiceTrustCriteriaInput>;
    connectOrCreate?: Prisma.TrustCriterionCreateOrConnectWithoutServiceTrustCriteriaInput;
    upsert?: Prisma.TrustCriterionUpsertWithoutServiceTrustCriteriaInput;
    connect?: Prisma.TrustCriterionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TrustCriterionUpdateToOneWithWhereWithoutServiceTrustCriteriaInput, Prisma.TrustCriterionUpdateWithoutServiceTrustCriteriaInput>, Prisma.TrustCriterionUncheckedUpdateWithoutServiceTrustCriteriaInput>;
};
export type TrustCriterionCreateWithoutRequirementsInput = {
    id?: string;
    criterion: $Enums.TrustCriterionCode;
    isMandatory: boolean;
    serviceTrustCriteria?: Prisma.ServiceTrustCriterionCreateNestedManyWithoutTrustCriterionInput;
};
export type TrustCriterionUncheckedCreateWithoutRequirementsInput = {
    id?: string;
    criterion: $Enums.TrustCriterionCode;
    isMandatory: boolean;
    serviceTrustCriteria?: Prisma.ServiceTrustCriterionUncheckedCreateNestedManyWithoutTrustCriterionInput;
};
export type TrustCriterionCreateOrConnectWithoutRequirementsInput = {
    where: Prisma.TrustCriterionWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrustCriterionCreateWithoutRequirementsInput, Prisma.TrustCriterionUncheckedCreateWithoutRequirementsInput>;
};
export type TrustCriterionUpsertWithoutRequirementsInput = {
    update: Prisma.XOR<Prisma.TrustCriterionUpdateWithoutRequirementsInput, Prisma.TrustCriterionUncheckedUpdateWithoutRequirementsInput>;
    create: Prisma.XOR<Prisma.TrustCriterionCreateWithoutRequirementsInput, Prisma.TrustCriterionUncheckedCreateWithoutRequirementsInput>;
    where?: Prisma.TrustCriterionWhereInput;
};
export type TrustCriterionUpdateToOneWithWhereWithoutRequirementsInput = {
    where?: Prisma.TrustCriterionWhereInput;
    data: Prisma.XOR<Prisma.TrustCriterionUpdateWithoutRequirementsInput, Prisma.TrustCriterionUncheckedUpdateWithoutRequirementsInput>;
};
export type TrustCriterionUpdateWithoutRequirementsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.EnumTrustCriterionCodeFieldUpdateOperationsInput | $Enums.TrustCriterionCode;
    isMandatory?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    serviceTrustCriteria?: Prisma.ServiceTrustCriterionUpdateManyWithoutTrustCriterionNestedInput;
};
export type TrustCriterionUncheckedUpdateWithoutRequirementsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.EnumTrustCriterionCodeFieldUpdateOperationsInput | $Enums.TrustCriterionCode;
    isMandatory?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    serviceTrustCriteria?: Prisma.ServiceTrustCriterionUncheckedUpdateManyWithoutTrustCriterionNestedInput;
};
export type TrustCriterionCreateWithoutServiceTrustCriteriaInput = {
    id?: string;
    criterion: $Enums.TrustCriterionCode;
    isMandatory: boolean;
    requirements?: Prisma.RequirementCreateNestedManyWithoutTrustCriterionInput;
};
export type TrustCriterionUncheckedCreateWithoutServiceTrustCriteriaInput = {
    id?: string;
    criterion: $Enums.TrustCriterionCode;
    isMandatory: boolean;
    requirements?: Prisma.RequirementUncheckedCreateNestedManyWithoutTrustCriterionInput;
};
export type TrustCriterionCreateOrConnectWithoutServiceTrustCriteriaInput = {
    where: Prisma.TrustCriterionWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrustCriterionCreateWithoutServiceTrustCriteriaInput, Prisma.TrustCriterionUncheckedCreateWithoutServiceTrustCriteriaInput>;
};
export type TrustCriterionUpsertWithoutServiceTrustCriteriaInput = {
    update: Prisma.XOR<Prisma.TrustCriterionUpdateWithoutServiceTrustCriteriaInput, Prisma.TrustCriterionUncheckedUpdateWithoutServiceTrustCriteriaInput>;
    create: Prisma.XOR<Prisma.TrustCriterionCreateWithoutServiceTrustCriteriaInput, Prisma.TrustCriterionUncheckedCreateWithoutServiceTrustCriteriaInput>;
    where?: Prisma.TrustCriterionWhereInput;
};
export type TrustCriterionUpdateToOneWithWhereWithoutServiceTrustCriteriaInput = {
    where?: Prisma.TrustCriterionWhereInput;
    data: Prisma.XOR<Prisma.TrustCriterionUpdateWithoutServiceTrustCriteriaInput, Prisma.TrustCriterionUncheckedUpdateWithoutServiceTrustCriteriaInput>;
};
export type TrustCriterionUpdateWithoutServiceTrustCriteriaInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.EnumTrustCriterionCodeFieldUpdateOperationsInput | $Enums.TrustCriterionCode;
    isMandatory?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requirements?: Prisma.RequirementUpdateManyWithoutTrustCriterionNestedInput;
};
export type TrustCriterionUncheckedUpdateWithoutServiceTrustCriteriaInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    criterion?: Prisma.EnumTrustCriterionCodeFieldUpdateOperationsInput | $Enums.TrustCriterionCode;
    isMandatory?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requirements?: Prisma.RequirementUncheckedUpdateManyWithoutTrustCriterionNestedInput;
};
export type TrustCriterionCountOutputType = {
    requirements: number;
    serviceTrustCriteria: number;
};
export type TrustCriterionCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    requirements?: boolean | TrustCriterionCountOutputTypeCountRequirementsArgs;
    serviceTrustCriteria?: boolean | TrustCriterionCountOutputTypeCountServiceTrustCriteriaArgs;
};
export type TrustCriterionCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrustCriterionCountOutputTypeSelect<ExtArgs> | null;
};
export type TrustCriterionCountOutputTypeCountRequirementsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RequirementWhereInput;
};
export type TrustCriterionCountOutputTypeCountServiceTrustCriteriaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceTrustCriterionWhereInput;
};
export type TrustCriterionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    criterion?: boolean;
    isMandatory?: boolean;
    requirements?: boolean | Prisma.TrustCriterion$requirementsArgs<ExtArgs>;
    serviceTrustCriteria?: boolean | Prisma.TrustCriterion$serviceTrustCriteriaArgs<ExtArgs>;
    _count?: boolean | Prisma.TrustCriterionCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["trustCriterion"]>;
export type TrustCriterionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    criterion?: boolean;
    isMandatory?: boolean;
}, ExtArgs["result"]["trustCriterion"]>;
export type TrustCriterionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    criterion?: boolean;
    isMandatory?: boolean;
}, ExtArgs["result"]["trustCriterion"]>;
export type TrustCriterionSelectScalar = {
    id?: boolean;
    criterion?: boolean;
    isMandatory?: boolean;
};
export type TrustCriterionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "criterion" | "isMandatory", ExtArgs["result"]["trustCriterion"]>;
export type TrustCriterionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    requirements?: boolean | Prisma.TrustCriterion$requirementsArgs<ExtArgs>;
    serviceTrustCriteria?: boolean | Prisma.TrustCriterion$serviceTrustCriteriaArgs<ExtArgs>;
    _count?: boolean | Prisma.TrustCriterionCountOutputTypeDefaultArgs<ExtArgs>;
};
export type TrustCriterionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type TrustCriterionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $TrustCriterionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TrustCriterion";
    objects: {
        requirements: Prisma.$RequirementPayload<ExtArgs>[];
        serviceTrustCriteria: Prisma.$ServiceTrustCriterionPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        criterion: $Enums.TrustCriterionCode;
        isMandatory: boolean;
    }, ExtArgs["result"]["trustCriterion"]>;
    composites: {};
};
export type TrustCriterionGetPayload<S extends boolean | null | undefined | TrustCriterionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TrustCriterionPayload, S>;
export type TrustCriterionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TrustCriterionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TrustCriterionCountAggregateInputType | true;
};
export interface TrustCriterionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TrustCriterion'];
        meta: {
            name: 'TrustCriterion';
        };
    };
    findUnique<T extends TrustCriterionFindUniqueArgs>(args: Prisma.SelectSubset<T, TrustCriterionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$TrustCriterionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TrustCriterionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TrustCriterionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$TrustCriterionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TrustCriterionFindFirstArgs>(args?: Prisma.SelectSubset<T, TrustCriterionFindFirstArgs<ExtArgs>>): Prisma.Prisma__TrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$TrustCriterionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TrustCriterionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TrustCriterionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$TrustCriterionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TrustCriterionFindManyArgs>(args?: Prisma.SelectSubset<T, TrustCriterionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TrustCriterionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TrustCriterionCreateArgs>(args: Prisma.SelectSubset<T, TrustCriterionCreateArgs<ExtArgs>>): Prisma.Prisma__TrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$TrustCriterionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TrustCriterionCreateManyArgs>(args?: Prisma.SelectSubset<T, TrustCriterionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TrustCriterionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TrustCriterionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TrustCriterionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TrustCriterionDeleteArgs>(args: Prisma.SelectSubset<T, TrustCriterionDeleteArgs<ExtArgs>>): Prisma.Prisma__TrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$TrustCriterionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TrustCriterionUpdateArgs>(args: Prisma.SelectSubset<T, TrustCriterionUpdateArgs<ExtArgs>>): Prisma.Prisma__TrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$TrustCriterionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TrustCriterionDeleteManyArgs>(args?: Prisma.SelectSubset<T, TrustCriterionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TrustCriterionUpdateManyArgs>(args: Prisma.SelectSubset<T, TrustCriterionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TrustCriterionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TrustCriterionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TrustCriterionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TrustCriterionUpsertArgs>(args: Prisma.SelectSubset<T, TrustCriterionUpsertArgs<ExtArgs>>): Prisma.Prisma__TrustCriterionClient<runtime.Types.Result.GetResult<Prisma.$TrustCriterionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TrustCriterionCountArgs>(args?: Prisma.Subset<T, TrustCriterionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TrustCriterionCountAggregateOutputType> : number>;
    aggregate<T extends TrustCriterionAggregateArgs>(args: Prisma.Subset<T, TrustCriterionAggregateArgs>): Prisma.PrismaPromise<GetTrustCriterionAggregateType<T>>;
    groupBy<T extends TrustCriterionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TrustCriterionGroupByArgs['orderBy'];
    } : {
        orderBy?: TrustCriterionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TrustCriterionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrustCriterionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TrustCriterionFieldRefs;
}
export interface Prisma__TrustCriterionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    requirements<T extends Prisma.TrustCriterion$requirementsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TrustCriterion$requirementsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    serviceTrustCriteria<T extends Prisma.TrustCriterion$serviceTrustCriteriaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TrustCriterion$serviceTrustCriteriaArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceTrustCriterionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TrustCriterionFieldRefs {
    readonly id: Prisma.FieldRef<"TrustCriterion", 'String'>;
    readonly criterion: Prisma.FieldRef<"TrustCriterion", 'TrustCriterionCode'>;
    readonly isMandatory: Prisma.FieldRef<"TrustCriterion", 'Boolean'>;
}
export type TrustCriterionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.TrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.TrustCriterionInclude<ExtArgs> | null;
    where: Prisma.TrustCriterionWhereUniqueInput;
};
export type TrustCriterionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.TrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.TrustCriterionInclude<ExtArgs> | null;
    where: Prisma.TrustCriterionWhereUniqueInput;
};
export type TrustCriterionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.TrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.TrustCriterionInclude<ExtArgs> | null;
    where?: Prisma.TrustCriterionWhereInput;
    orderBy?: Prisma.TrustCriterionOrderByWithRelationInput | Prisma.TrustCriterionOrderByWithRelationInput[];
    cursor?: Prisma.TrustCriterionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TrustCriterionScalarFieldEnum | Prisma.TrustCriterionScalarFieldEnum[];
};
export type TrustCriterionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.TrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.TrustCriterionInclude<ExtArgs> | null;
    where?: Prisma.TrustCriterionWhereInput;
    orderBy?: Prisma.TrustCriterionOrderByWithRelationInput | Prisma.TrustCriterionOrderByWithRelationInput[];
    cursor?: Prisma.TrustCriterionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TrustCriterionScalarFieldEnum | Prisma.TrustCriterionScalarFieldEnum[];
};
export type TrustCriterionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.TrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.TrustCriterionInclude<ExtArgs> | null;
    where?: Prisma.TrustCriterionWhereInput;
    orderBy?: Prisma.TrustCriterionOrderByWithRelationInput | Prisma.TrustCriterionOrderByWithRelationInput[];
    cursor?: Prisma.TrustCriterionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TrustCriterionScalarFieldEnum | Prisma.TrustCriterionScalarFieldEnum[];
};
export type TrustCriterionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.TrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.TrustCriterionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TrustCriterionCreateInput, Prisma.TrustCriterionUncheckedCreateInput>;
};
export type TrustCriterionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TrustCriterionCreateManyInput | Prisma.TrustCriterionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TrustCriterionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrustCriterionSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TrustCriterionOmit<ExtArgs> | null;
    data: Prisma.TrustCriterionCreateManyInput | Prisma.TrustCriterionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TrustCriterionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.TrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.TrustCriterionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TrustCriterionUpdateInput, Prisma.TrustCriterionUncheckedUpdateInput>;
    where: Prisma.TrustCriterionWhereUniqueInput;
};
export type TrustCriterionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TrustCriterionUpdateManyMutationInput, Prisma.TrustCriterionUncheckedUpdateManyInput>;
    where?: Prisma.TrustCriterionWhereInput;
    limit?: number;
};
export type TrustCriterionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrustCriterionSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TrustCriterionOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TrustCriterionUpdateManyMutationInput, Prisma.TrustCriterionUncheckedUpdateManyInput>;
    where?: Prisma.TrustCriterionWhereInput;
    limit?: number;
};
export type TrustCriterionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.TrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.TrustCriterionInclude<ExtArgs> | null;
    where: Prisma.TrustCriterionWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrustCriterionCreateInput, Prisma.TrustCriterionUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TrustCriterionUpdateInput, Prisma.TrustCriterionUncheckedUpdateInput>;
};
export type TrustCriterionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.TrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.TrustCriterionInclude<ExtArgs> | null;
    where: Prisma.TrustCriterionWhereUniqueInput;
};
export type TrustCriterionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TrustCriterionWhereInput;
    limit?: number;
};
export type TrustCriterion$requirementsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementSelect<ExtArgs> | null;
    omit?: Prisma.RequirementOmit<ExtArgs> | null;
    include?: Prisma.RequirementInclude<ExtArgs> | null;
    where?: Prisma.RequirementWhereInput;
    orderBy?: Prisma.RequirementOrderByWithRelationInput | Prisma.RequirementOrderByWithRelationInput[];
    cursor?: Prisma.RequirementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RequirementScalarFieldEnum | Prisma.RequirementScalarFieldEnum[];
};
export type TrustCriterion$serviceTrustCriteriaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceTrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.ServiceTrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.ServiceTrustCriterionInclude<ExtArgs> | null;
    where?: Prisma.ServiceTrustCriterionWhereInput;
    orderBy?: Prisma.ServiceTrustCriterionOrderByWithRelationInput | Prisma.ServiceTrustCriterionOrderByWithRelationInput[];
    cursor?: Prisma.ServiceTrustCriterionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceTrustCriterionScalarFieldEnum | Prisma.ServiceTrustCriterionScalarFieldEnum[];
};
export type TrustCriterionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrustCriterionSelect<ExtArgs> | null;
    omit?: Prisma.TrustCriterionOmit<ExtArgs> | null;
    include?: Prisma.TrustCriterionInclude<ExtArgs> | null;
};
export {};
