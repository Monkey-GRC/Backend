import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type RegulationModel = runtime.Types.Result.DefaultSelection<Prisma.$RegulationPayload>;
export type AggregateRegulation = {
    _count: RegulationCountAggregateOutputType | null;
    _min: RegulationMinAggregateOutputType | null;
    _max: RegulationMaxAggregateOutputType | null;
};
export type RegulationMinAggregateOutputType = {
    id: string | null;
    code: string | null;
    name: string | null;
    jurisdiction: string | null;
};
export type RegulationMaxAggregateOutputType = {
    id: string | null;
    code: string | null;
    name: string | null;
    jurisdiction: string | null;
};
export type RegulationCountAggregateOutputType = {
    id: number;
    code: number;
    name: number;
    jurisdiction: number;
    _all: number;
};
export type RegulationMinAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    jurisdiction?: true;
};
export type RegulationMaxAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    jurisdiction?: true;
};
export type RegulationCountAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    jurisdiction?: true;
    _all?: true;
};
export type RegulationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RegulationWhereInput;
    orderBy?: Prisma.RegulationOrderByWithRelationInput | Prisma.RegulationOrderByWithRelationInput[];
    cursor?: Prisma.RegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | RegulationCountAggregateInputType;
    _min?: RegulationMinAggregateInputType;
    _max?: RegulationMaxAggregateInputType;
};
export type GetRegulationAggregateType<T extends RegulationAggregateArgs> = {
    [P in keyof T & keyof AggregateRegulation]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRegulation[P]> : Prisma.GetScalarType<T[P], AggregateRegulation[P]>;
};
export type RegulationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RegulationWhereInput;
    orderBy?: Prisma.RegulationOrderByWithAggregationInput | Prisma.RegulationOrderByWithAggregationInput[];
    by: Prisma.RegulationScalarFieldEnum[] | Prisma.RegulationScalarFieldEnum;
    having?: Prisma.RegulationScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RegulationCountAggregateInputType | true;
    _min?: RegulationMinAggregateInputType;
    _max?: RegulationMaxAggregateInputType;
};
export type RegulationGroupByOutputType = {
    id: string;
    code: string;
    name: string;
    jurisdiction: string;
    _count: RegulationCountAggregateOutputType | null;
    _min: RegulationMinAggregateOutputType | null;
    _max: RegulationMaxAggregateOutputType | null;
};
type GetRegulationGroupByPayload<T extends RegulationGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RegulationGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RegulationGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RegulationGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RegulationGroupByOutputType[P]>;
}>>;
export type RegulationWhereInput = {
    AND?: Prisma.RegulationWhereInput | Prisma.RegulationWhereInput[];
    OR?: Prisma.RegulationWhereInput[];
    NOT?: Prisma.RegulationWhereInput | Prisma.RegulationWhereInput[];
    id?: Prisma.UuidFilter<"Regulation"> | string;
    code?: Prisma.StringFilter<"Regulation"> | string;
    name?: Prisma.StringFilter<"Regulation"> | string;
    jurisdiction?: Prisma.StringFilter<"Regulation"> | string;
    organizationRegulations?: Prisma.OrganizationRegulationListRelationFilter;
    serviceRegulations?: Prisma.ServiceRegulationListRelationFilter;
};
export type RegulationOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    jurisdiction?: Prisma.SortOrder;
    organizationRegulations?: Prisma.OrganizationRegulationOrderByRelationAggregateInput;
    serviceRegulations?: Prisma.ServiceRegulationOrderByRelationAggregateInput;
};
export type RegulationWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    code?: string;
    AND?: Prisma.RegulationWhereInput | Prisma.RegulationWhereInput[];
    OR?: Prisma.RegulationWhereInput[];
    NOT?: Prisma.RegulationWhereInput | Prisma.RegulationWhereInput[];
    name?: Prisma.StringFilter<"Regulation"> | string;
    jurisdiction?: Prisma.StringFilter<"Regulation"> | string;
    organizationRegulations?: Prisma.OrganizationRegulationListRelationFilter;
    serviceRegulations?: Prisma.ServiceRegulationListRelationFilter;
}, "id" | "code">;
export type RegulationOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    jurisdiction?: Prisma.SortOrder;
    _count?: Prisma.RegulationCountOrderByAggregateInput;
    _max?: Prisma.RegulationMaxOrderByAggregateInput;
    _min?: Prisma.RegulationMinOrderByAggregateInput;
};
export type RegulationScalarWhereWithAggregatesInput = {
    AND?: Prisma.RegulationScalarWhereWithAggregatesInput | Prisma.RegulationScalarWhereWithAggregatesInput[];
    OR?: Prisma.RegulationScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RegulationScalarWhereWithAggregatesInput | Prisma.RegulationScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Regulation"> | string;
    code?: Prisma.StringWithAggregatesFilter<"Regulation"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Regulation"> | string;
    jurisdiction?: Prisma.StringWithAggregatesFilter<"Regulation"> | string;
};
export type RegulationCreateInput = {
    id?: string;
    code: string;
    name: string;
    jurisdiction: string;
    organizationRegulations?: Prisma.OrganizationRegulationCreateNestedManyWithoutRegulationInput;
    serviceRegulations?: Prisma.ServiceRegulationCreateNestedManyWithoutRegulationInput;
};
export type RegulationUncheckedCreateInput = {
    id?: string;
    code: string;
    name: string;
    jurisdiction: string;
    organizationRegulations?: Prisma.OrganizationRegulationUncheckedCreateNestedManyWithoutRegulationInput;
    serviceRegulations?: Prisma.ServiceRegulationUncheckedCreateNestedManyWithoutRegulationInput;
};
export type RegulationUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    jurisdiction?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationRegulations?: Prisma.OrganizationRegulationUpdateManyWithoutRegulationNestedInput;
    serviceRegulations?: Prisma.ServiceRegulationUpdateManyWithoutRegulationNestedInput;
};
export type RegulationUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    jurisdiction?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationRegulations?: Prisma.OrganizationRegulationUncheckedUpdateManyWithoutRegulationNestedInput;
    serviceRegulations?: Prisma.ServiceRegulationUncheckedUpdateManyWithoutRegulationNestedInput;
};
export type RegulationCreateManyInput = {
    id?: string;
    code: string;
    name: string;
    jurisdiction: string;
};
export type RegulationUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    jurisdiction?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RegulationUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    jurisdiction?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RegulationCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    jurisdiction?: Prisma.SortOrder;
};
export type RegulationMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    jurisdiction?: Prisma.SortOrder;
};
export type RegulationMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    jurisdiction?: Prisma.SortOrder;
};
export type RegulationScalarRelationFilter = {
    is?: Prisma.RegulationWhereInput;
    isNot?: Prisma.RegulationWhereInput;
};
export type RegulationCreateNestedOneWithoutOrganizationRegulationsInput = {
    create?: Prisma.XOR<Prisma.RegulationCreateWithoutOrganizationRegulationsInput, Prisma.RegulationUncheckedCreateWithoutOrganizationRegulationsInput>;
    connectOrCreate?: Prisma.RegulationCreateOrConnectWithoutOrganizationRegulationsInput;
    connect?: Prisma.RegulationWhereUniqueInput;
};
export type RegulationUpdateOneRequiredWithoutOrganizationRegulationsNestedInput = {
    create?: Prisma.XOR<Prisma.RegulationCreateWithoutOrganizationRegulationsInput, Prisma.RegulationUncheckedCreateWithoutOrganizationRegulationsInput>;
    connectOrCreate?: Prisma.RegulationCreateOrConnectWithoutOrganizationRegulationsInput;
    upsert?: Prisma.RegulationUpsertWithoutOrganizationRegulationsInput;
    connect?: Prisma.RegulationWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RegulationUpdateToOneWithWhereWithoutOrganizationRegulationsInput, Prisma.RegulationUpdateWithoutOrganizationRegulationsInput>, Prisma.RegulationUncheckedUpdateWithoutOrganizationRegulationsInput>;
};
export type RegulationCreateNestedOneWithoutServiceRegulationsInput = {
    create?: Prisma.XOR<Prisma.RegulationCreateWithoutServiceRegulationsInput, Prisma.RegulationUncheckedCreateWithoutServiceRegulationsInput>;
    connectOrCreate?: Prisma.RegulationCreateOrConnectWithoutServiceRegulationsInput;
    connect?: Prisma.RegulationWhereUniqueInput;
};
export type RegulationUpdateOneRequiredWithoutServiceRegulationsNestedInput = {
    create?: Prisma.XOR<Prisma.RegulationCreateWithoutServiceRegulationsInput, Prisma.RegulationUncheckedCreateWithoutServiceRegulationsInput>;
    connectOrCreate?: Prisma.RegulationCreateOrConnectWithoutServiceRegulationsInput;
    upsert?: Prisma.RegulationUpsertWithoutServiceRegulationsInput;
    connect?: Prisma.RegulationWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RegulationUpdateToOneWithWhereWithoutServiceRegulationsInput, Prisma.RegulationUpdateWithoutServiceRegulationsInput>, Prisma.RegulationUncheckedUpdateWithoutServiceRegulationsInput>;
};
export type RegulationCreateWithoutOrganizationRegulationsInput = {
    id?: string;
    code: string;
    name: string;
    jurisdiction: string;
    serviceRegulations?: Prisma.ServiceRegulationCreateNestedManyWithoutRegulationInput;
};
export type RegulationUncheckedCreateWithoutOrganizationRegulationsInput = {
    id?: string;
    code: string;
    name: string;
    jurisdiction: string;
    serviceRegulations?: Prisma.ServiceRegulationUncheckedCreateNestedManyWithoutRegulationInput;
};
export type RegulationCreateOrConnectWithoutOrganizationRegulationsInput = {
    where: Prisma.RegulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.RegulationCreateWithoutOrganizationRegulationsInput, Prisma.RegulationUncheckedCreateWithoutOrganizationRegulationsInput>;
};
export type RegulationUpsertWithoutOrganizationRegulationsInput = {
    update: Prisma.XOR<Prisma.RegulationUpdateWithoutOrganizationRegulationsInput, Prisma.RegulationUncheckedUpdateWithoutOrganizationRegulationsInput>;
    create: Prisma.XOR<Prisma.RegulationCreateWithoutOrganizationRegulationsInput, Prisma.RegulationUncheckedCreateWithoutOrganizationRegulationsInput>;
    where?: Prisma.RegulationWhereInput;
};
export type RegulationUpdateToOneWithWhereWithoutOrganizationRegulationsInput = {
    where?: Prisma.RegulationWhereInput;
    data: Prisma.XOR<Prisma.RegulationUpdateWithoutOrganizationRegulationsInput, Prisma.RegulationUncheckedUpdateWithoutOrganizationRegulationsInput>;
};
export type RegulationUpdateWithoutOrganizationRegulationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    jurisdiction?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceRegulations?: Prisma.ServiceRegulationUpdateManyWithoutRegulationNestedInput;
};
export type RegulationUncheckedUpdateWithoutOrganizationRegulationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    jurisdiction?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceRegulations?: Prisma.ServiceRegulationUncheckedUpdateManyWithoutRegulationNestedInput;
};
export type RegulationCreateWithoutServiceRegulationsInput = {
    id?: string;
    code: string;
    name: string;
    jurisdiction: string;
    organizationRegulations?: Prisma.OrganizationRegulationCreateNestedManyWithoutRegulationInput;
};
export type RegulationUncheckedCreateWithoutServiceRegulationsInput = {
    id?: string;
    code: string;
    name: string;
    jurisdiction: string;
    organizationRegulations?: Prisma.OrganizationRegulationUncheckedCreateNestedManyWithoutRegulationInput;
};
export type RegulationCreateOrConnectWithoutServiceRegulationsInput = {
    where: Prisma.RegulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.RegulationCreateWithoutServiceRegulationsInput, Prisma.RegulationUncheckedCreateWithoutServiceRegulationsInput>;
};
export type RegulationUpsertWithoutServiceRegulationsInput = {
    update: Prisma.XOR<Prisma.RegulationUpdateWithoutServiceRegulationsInput, Prisma.RegulationUncheckedUpdateWithoutServiceRegulationsInput>;
    create: Prisma.XOR<Prisma.RegulationCreateWithoutServiceRegulationsInput, Prisma.RegulationUncheckedCreateWithoutServiceRegulationsInput>;
    where?: Prisma.RegulationWhereInput;
};
export type RegulationUpdateToOneWithWhereWithoutServiceRegulationsInput = {
    where?: Prisma.RegulationWhereInput;
    data: Prisma.XOR<Prisma.RegulationUpdateWithoutServiceRegulationsInput, Prisma.RegulationUncheckedUpdateWithoutServiceRegulationsInput>;
};
export type RegulationUpdateWithoutServiceRegulationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    jurisdiction?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationRegulations?: Prisma.OrganizationRegulationUpdateManyWithoutRegulationNestedInput;
};
export type RegulationUncheckedUpdateWithoutServiceRegulationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    jurisdiction?: Prisma.StringFieldUpdateOperationsInput | string;
    organizationRegulations?: Prisma.OrganizationRegulationUncheckedUpdateManyWithoutRegulationNestedInput;
};
export type RegulationCountOutputType = {
    organizationRegulations: number;
    serviceRegulations: number;
};
export type RegulationCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    organizationRegulations?: boolean | RegulationCountOutputTypeCountOrganizationRegulationsArgs;
    serviceRegulations?: boolean | RegulationCountOutputTypeCountServiceRegulationsArgs;
};
export type RegulationCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegulationCountOutputTypeSelect<ExtArgs> | null;
};
export type RegulationCountOutputTypeCountOrganizationRegulationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrganizationRegulationWhereInput;
};
export type RegulationCountOutputTypeCountServiceRegulationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceRegulationWhereInput;
};
export type RegulationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    jurisdiction?: boolean;
    organizationRegulations?: boolean | Prisma.Regulation$organizationRegulationsArgs<ExtArgs>;
    serviceRegulations?: boolean | Prisma.Regulation$serviceRegulationsArgs<ExtArgs>;
    _count?: boolean | Prisma.RegulationCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["regulation"]>;
export type RegulationSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    jurisdiction?: boolean;
}, ExtArgs["result"]["regulation"]>;
export type RegulationSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    jurisdiction?: boolean;
}, ExtArgs["result"]["regulation"]>;
export type RegulationSelectScalar = {
    id?: boolean;
    code?: boolean;
    name?: boolean;
    jurisdiction?: boolean;
};
export type RegulationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "code" | "name" | "jurisdiction", ExtArgs["result"]["regulation"]>;
export type RegulationInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    organizationRegulations?: boolean | Prisma.Regulation$organizationRegulationsArgs<ExtArgs>;
    serviceRegulations?: boolean | Prisma.Regulation$serviceRegulationsArgs<ExtArgs>;
    _count?: boolean | Prisma.RegulationCountOutputTypeDefaultArgs<ExtArgs>;
};
export type RegulationIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type RegulationIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $RegulationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Regulation";
    objects: {
        organizationRegulations: Prisma.$OrganizationRegulationPayload<ExtArgs>[];
        serviceRegulations: Prisma.$ServiceRegulationPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        code: string;
        name: string;
        jurisdiction: string;
    }, ExtArgs["result"]["regulation"]>;
    composites: {};
};
export type RegulationGetPayload<S extends boolean | null | undefined | RegulationDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RegulationPayload, S>;
export type RegulationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RegulationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RegulationCountAggregateInputType | true;
};
export interface RegulationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Regulation'];
        meta: {
            name: 'Regulation';
        };
    };
    findUnique<T extends RegulationFindUniqueArgs>(args: Prisma.SelectSubset<T, RegulationFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RegulationClient<runtime.Types.Result.GetResult<Prisma.$RegulationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends RegulationFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RegulationFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RegulationClient<runtime.Types.Result.GetResult<Prisma.$RegulationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends RegulationFindFirstArgs>(args?: Prisma.SelectSubset<T, RegulationFindFirstArgs<ExtArgs>>): Prisma.Prisma__RegulationClient<runtime.Types.Result.GetResult<Prisma.$RegulationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends RegulationFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RegulationFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RegulationClient<runtime.Types.Result.GetResult<Prisma.$RegulationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends RegulationFindManyArgs>(args?: Prisma.SelectSubset<T, RegulationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RegulationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends RegulationCreateArgs>(args: Prisma.SelectSubset<T, RegulationCreateArgs<ExtArgs>>): Prisma.Prisma__RegulationClient<runtime.Types.Result.GetResult<Prisma.$RegulationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends RegulationCreateManyArgs>(args?: Prisma.SelectSubset<T, RegulationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends RegulationCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RegulationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RegulationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends RegulationDeleteArgs>(args: Prisma.SelectSubset<T, RegulationDeleteArgs<ExtArgs>>): Prisma.Prisma__RegulationClient<runtime.Types.Result.GetResult<Prisma.$RegulationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends RegulationUpdateArgs>(args: Prisma.SelectSubset<T, RegulationUpdateArgs<ExtArgs>>): Prisma.Prisma__RegulationClient<runtime.Types.Result.GetResult<Prisma.$RegulationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends RegulationDeleteManyArgs>(args?: Prisma.SelectSubset<T, RegulationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends RegulationUpdateManyArgs>(args: Prisma.SelectSubset<T, RegulationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends RegulationUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RegulationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RegulationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends RegulationUpsertArgs>(args: Prisma.SelectSubset<T, RegulationUpsertArgs<ExtArgs>>): Prisma.Prisma__RegulationClient<runtime.Types.Result.GetResult<Prisma.$RegulationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends RegulationCountArgs>(args?: Prisma.Subset<T, RegulationCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RegulationCountAggregateOutputType> : number>;
    aggregate<T extends RegulationAggregateArgs>(args: Prisma.Subset<T, RegulationAggregateArgs>): Prisma.PrismaPromise<GetRegulationAggregateType<T>>;
    groupBy<T extends RegulationGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RegulationGroupByArgs['orderBy'];
    } : {
        orderBy?: RegulationGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RegulationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRegulationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: RegulationFieldRefs;
}
export interface Prisma__RegulationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    organizationRegulations<T extends Prisma.Regulation$organizationRegulationsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Regulation$organizationRegulationsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrganizationRegulationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    serviceRegulations<T extends Prisma.Regulation$serviceRegulationsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Regulation$serviceRegulationsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceRegulationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface RegulationFieldRefs {
    readonly id: Prisma.FieldRef<"Regulation", 'String'>;
    readonly code: Prisma.FieldRef<"Regulation", 'String'>;
    readonly name: Prisma.FieldRef<"Regulation", 'String'>;
    readonly jurisdiction: Prisma.FieldRef<"Regulation", 'String'>;
}
export type RegulationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegulationSelect<ExtArgs> | null;
    omit?: Prisma.RegulationOmit<ExtArgs> | null;
    include?: Prisma.RegulationInclude<ExtArgs> | null;
    where: Prisma.RegulationWhereUniqueInput;
};
export type RegulationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegulationSelect<ExtArgs> | null;
    omit?: Prisma.RegulationOmit<ExtArgs> | null;
    include?: Prisma.RegulationInclude<ExtArgs> | null;
    where: Prisma.RegulationWhereUniqueInput;
};
export type RegulationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegulationSelect<ExtArgs> | null;
    omit?: Prisma.RegulationOmit<ExtArgs> | null;
    include?: Prisma.RegulationInclude<ExtArgs> | null;
    where?: Prisma.RegulationWhereInput;
    orderBy?: Prisma.RegulationOrderByWithRelationInput | Prisma.RegulationOrderByWithRelationInput[];
    cursor?: Prisma.RegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RegulationScalarFieldEnum | Prisma.RegulationScalarFieldEnum[];
};
export type RegulationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegulationSelect<ExtArgs> | null;
    omit?: Prisma.RegulationOmit<ExtArgs> | null;
    include?: Prisma.RegulationInclude<ExtArgs> | null;
    where?: Prisma.RegulationWhereInput;
    orderBy?: Prisma.RegulationOrderByWithRelationInput | Prisma.RegulationOrderByWithRelationInput[];
    cursor?: Prisma.RegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RegulationScalarFieldEnum | Prisma.RegulationScalarFieldEnum[];
};
export type RegulationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegulationSelect<ExtArgs> | null;
    omit?: Prisma.RegulationOmit<ExtArgs> | null;
    include?: Prisma.RegulationInclude<ExtArgs> | null;
    where?: Prisma.RegulationWhereInput;
    orderBy?: Prisma.RegulationOrderByWithRelationInput | Prisma.RegulationOrderByWithRelationInput[];
    cursor?: Prisma.RegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RegulationScalarFieldEnum | Prisma.RegulationScalarFieldEnum[];
};
export type RegulationCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegulationSelect<ExtArgs> | null;
    omit?: Prisma.RegulationOmit<ExtArgs> | null;
    include?: Prisma.RegulationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RegulationCreateInput, Prisma.RegulationUncheckedCreateInput>;
};
export type RegulationCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.RegulationCreateManyInput | Prisma.RegulationCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RegulationCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegulationSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RegulationOmit<ExtArgs> | null;
    data: Prisma.RegulationCreateManyInput | Prisma.RegulationCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RegulationUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegulationSelect<ExtArgs> | null;
    omit?: Prisma.RegulationOmit<ExtArgs> | null;
    include?: Prisma.RegulationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RegulationUpdateInput, Prisma.RegulationUncheckedUpdateInput>;
    where: Prisma.RegulationWhereUniqueInput;
};
export type RegulationUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.RegulationUpdateManyMutationInput, Prisma.RegulationUncheckedUpdateManyInput>;
    where?: Prisma.RegulationWhereInput;
    limit?: number;
};
export type RegulationUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegulationSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RegulationOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RegulationUpdateManyMutationInput, Prisma.RegulationUncheckedUpdateManyInput>;
    where?: Prisma.RegulationWhereInput;
    limit?: number;
};
export type RegulationUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegulationSelect<ExtArgs> | null;
    omit?: Prisma.RegulationOmit<ExtArgs> | null;
    include?: Prisma.RegulationInclude<ExtArgs> | null;
    where: Prisma.RegulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.RegulationCreateInput, Prisma.RegulationUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.RegulationUpdateInput, Prisma.RegulationUncheckedUpdateInput>;
};
export type RegulationDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegulationSelect<ExtArgs> | null;
    omit?: Prisma.RegulationOmit<ExtArgs> | null;
    include?: Prisma.RegulationInclude<ExtArgs> | null;
    where: Prisma.RegulationWhereUniqueInput;
};
export type RegulationDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RegulationWhereInput;
    limit?: number;
};
export type Regulation$organizationRegulationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationRegulationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationRegulationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationRegulationInclude<ExtArgs> | null;
    where?: Prisma.OrganizationRegulationWhereInput;
    orderBy?: Prisma.OrganizationRegulationOrderByWithRelationInput | Prisma.OrganizationRegulationOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationRegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrganizationRegulationScalarFieldEnum | Prisma.OrganizationRegulationScalarFieldEnum[];
};
export type Regulation$serviceRegulationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceRegulationSelect<ExtArgs> | null;
    omit?: Prisma.ServiceRegulationOmit<ExtArgs> | null;
    include?: Prisma.ServiceRegulationInclude<ExtArgs> | null;
    where?: Prisma.ServiceRegulationWhereInput;
    orderBy?: Prisma.ServiceRegulationOrderByWithRelationInput | Prisma.ServiceRegulationOrderByWithRelationInput[];
    cursor?: Prisma.ServiceRegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceRegulationScalarFieldEnum | Prisma.ServiceRegulationScalarFieldEnum[];
};
export type RegulationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegulationSelect<ExtArgs> | null;
    omit?: Prisma.RegulationOmit<ExtArgs> | null;
    include?: Prisma.RegulationInclude<ExtArgs> | null;
};
export {};
