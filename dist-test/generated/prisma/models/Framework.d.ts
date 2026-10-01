import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type FrameworkModel = runtime.Types.Result.DefaultSelection<Prisma.$FrameworkPayload>;
export type AggregateFramework = {
    _count: FrameworkCountAggregateOutputType | null;
    _min: FrameworkMinAggregateOutputType | null;
    _max: FrameworkMaxAggregateOutputType | null;
};
export type FrameworkMinAggregateOutputType = {
    id: string | null;
    code: string | null;
    name: string | null;
    version: string | null;
    type: $Enums.FrameworkType | null;
    scopeDescription: string | null;
};
export type FrameworkMaxAggregateOutputType = {
    id: string | null;
    code: string | null;
    name: string | null;
    version: string | null;
    type: $Enums.FrameworkType | null;
    scopeDescription: string | null;
};
export type FrameworkCountAggregateOutputType = {
    id: number;
    code: number;
    name: number;
    version: number;
    type: number;
    scopeDescription: number;
    _all: number;
};
export type FrameworkMinAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    version?: true;
    type?: true;
    scopeDescription?: true;
};
export type FrameworkMaxAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    version?: true;
    type?: true;
    scopeDescription?: true;
};
export type FrameworkCountAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    version?: true;
    type?: true;
    scopeDescription?: true;
    _all?: true;
};
export type FrameworkAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FrameworkWhereInput;
    orderBy?: Prisma.FrameworkOrderByWithRelationInput | Prisma.FrameworkOrderByWithRelationInput[];
    cursor?: Prisma.FrameworkWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | FrameworkCountAggregateInputType;
    _min?: FrameworkMinAggregateInputType;
    _max?: FrameworkMaxAggregateInputType;
};
export type GetFrameworkAggregateType<T extends FrameworkAggregateArgs> = {
    [P in keyof T & keyof AggregateFramework]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateFramework[P]> : Prisma.GetScalarType<T[P], AggregateFramework[P]>;
};
export type FrameworkGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FrameworkWhereInput;
    orderBy?: Prisma.FrameworkOrderByWithAggregationInput | Prisma.FrameworkOrderByWithAggregationInput[];
    by: Prisma.FrameworkScalarFieldEnum[] | Prisma.FrameworkScalarFieldEnum;
    having?: Prisma.FrameworkScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: FrameworkCountAggregateInputType | true;
    _min?: FrameworkMinAggregateInputType;
    _max?: FrameworkMaxAggregateInputType;
};
export type FrameworkGroupByOutputType = {
    id: string;
    code: string;
    name: string;
    version: string;
    type: $Enums.FrameworkType;
    scopeDescription: string;
    _count: FrameworkCountAggregateOutputType | null;
    _min: FrameworkMinAggregateOutputType | null;
    _max: FrameworkMaxAggregateOutputType | null;
};
type GetFrameworkGroupByPayload<T extends FrameworkGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<FrameworkGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof FrameworkGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], FrameworkGroupByOutputType[P]> : Prisma.GetScalarType<T[P], FrameworkGroupByOutputType[P]>;
}>>;
export type FrameworkWhereInput = {
    AND?: Prisma.FrameworkWhereInput | Prisma.FrameworkWhereInput[];
    OR?: Prisma.FrameworkWhereInput[];
    NOT?: Prisma.FrameworkWhereInput | Prisma.FrameworkWhereInput[];
    id?: Prisma.UuidFilter<"Framework"> | string;
    code?: Prisma.StringFilter<"Framework"> | string;
    name?: Prisma.StringFilter<"Framework"> | string;
    version?: Prisma.StringFilter<"Framework"> | string;
    type?: Prisma.EnumFrameworkTypeFilter<"Framework"> | $Enums.FrameworkType;
    scopeDescription?: Prisma.StringFilter<"Framework"> | string;
    requirements?: Prisma.RequirementListRelationFilter;
    serviceFrameworks?: Prisma.ServiceFrameworkListRelationFilter;
};
export type FrameworkOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    scopeDescription?: Prisma.SortOrder;
    requirements?: Prisma.RequirementOrderByRelationAggregateInput;
    serviceFrameworks?: Prisma.ServiceFrameworkOrderByRelationAggregateInput;
};
export type FrameworkWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    code_version?: Prisma.FrameworkCodeVersionCompoundUniqueInput;
    AND?: Prisma.FrameworkWhereInput | Prisma.FrameworkWhereInput[];
    OR?: Prisma.FrameworkWhereInput[];
    NOT?: Prisma.FrameworkWhereInput | Prisma.FrameworkWhereInput[];
    code?: Prisma.StringFilter<"Framework"> | string;
    name?: Prisma.StringFilter<"Framework"> | string;
    version?: Prisma.StringFilter<"Framework"> | string;
    type?: Prisma.EnumFrameworkTypeFilter<"Framework"> | $Enums.FrameworkType;
    scopeDescription?: Prisma.StringFilter<"Framework"> | string;
    requirements?: Prisma.RequirementListRelationFilter;
    serviceFrameworks?: Prisma.ServiceFrameworkListRelationFilter;
}, "id" | "code_version">;
export type FrameworkOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    scopeDescription?: Prisma.SortOrder;
    _count?: Prisma.FrameworkCountOrderByAggregateInput;
    _max?: Prisma.FrameworkMaxOrderByAggregateInput;
    _min?: Prisma.FrameworkMinOrderByAggregateInput;
};
export type FrameworkScalarWhereWithAggregatesInput = {
    AND?: Prisma.FrameworkScalarWhereWithAggregatesInput | Prisma.FrameworkScalarWhereWithAggregatesInput[];
    OR?: Prisma.FrameworkScalarWhereWithAggregatesInput[];
    NOT?: Prisma.FrameworkScalarWhereWithAggregatesInput | Prisma.FrameworkScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Framework"> | string;
    code?: Prisma.StringWithAggregatesFilter<"Framework"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Framework"> | string;
    version?: Prisma.StringWithAggregatesFilter<"Framework"> | string;
    type?: Prisma.EnumFrameworkTypeWithAggregatesFilter<"Framework"> | $Enums.FrameworkType;
    scopeDescription?: Prisma.StringWithAggregatesFilter<"Framework"> | string;
};
export type FrameworkCreateInput = {
    id?: string;
    code: string;
    name: string;
    version: string;
    type: $Enums.FrameworkType;
    scopeDescription: string;
    requirements?: Prisma.RequirementCreateNestedManyWithoutFrameworkInput;
    serviceFrameworks?: Prisma.ServiceFrameworkCreateNestedManyWithoutFrameworkInput;
};
export type FrameworkUncheckedCreateInput = {
    id?: string;
    code: string;
    name: string;
    version: string;
    type: $Enums.FrameworkType;
    scopeDescription: string;
    requirements?: Prisma.RequirementUncheckedCreateNestedManyWithoutFrameworkInput;
    serviceFrameworks?: Prisma.ServiceFrameworkUncheckedCreateNestedManyWithoutFrameworkInput;
};
export type FrameworkUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumFrameworkTypeFieldUpdateOperationsInput | $Enums.FrameworkType;
    scopeDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    requirements?: Prisma.RequirementUpdateManyWithoutFrameworkNestedInput;
    serviceFrameworks?: Prisma.ServiceFrameworkUpdateManyWithoutFrameworkNestedInput;
};
export type FrameworkUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumFrameworkTypeFieldUpdateOperationsInput | $Enums.FrameworkType;
    scopeDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    requirements?: Prisma.RequirementUncheckedUpdateManyWithoutFrameworkNestedInput;
    serviceFrameworks?: Prisma.ServiceFrameworkUncheckedUpdateManyWithoutFrameworkNestedInput;
};
export type FrameworkCreateManyInput = {
    id?: string;
    code: string;
    name: string;
    version: string;
    type: $Enums.FrameworkType;
    scopeDescription: string;
};
export type FrameworkUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumFrameworkTypeFieldUpdateOperationsInput | $Enums.FrameworkType;
    scopeDescription?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type FrameworkUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumFrameworkTypeFieldUpdateOperationsInput | $Enums.FrameworkType;
    scopeDescription?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type FrameworkCodeVersionCompoundUniqueInput = {
    code: string;
    version: string;
};
export type FrameworkCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    scopeDescription?: Prisma.SortOrder;
};
export type FrameworkMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    scopeDescription?: Prisma.SortOrder;
};
export type FrameworkMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    scopeDescription?: Prisma.SortOrder;
};
export type FrameworkScalarRelationFilter = {
    is?: Prisma.FrameworkWhereInput;
    isNot?: Prisma.FrameworkWhereInput;
};
export type EnumFrameworkTypeFieldUpdateOperationsInput = {
    set?: $Enums.FrameworkType;
};
export type FrameworkCreateNestedOneWithoutRequirementsInput = {
    create?: Prisma.XOR<Prisma.FrameworkCreateWithoutRequirementsInput, Prisma.FrameworkUncheckedCreateWithoutRequirementsInput>;
    connectOrCreate?: Prisma.FrameworkCreateOrConnectWithoutRequirementsInput;
    connect?: Prisma.FrameworkWhereUniqueInput;
};
export type FrameworkUpdateOneRequiredWithoutRequirementsNestedInput = {
    create?: Prisma.XOR<Prisma.FrameworkCreateWithoutRequirementsInput, Prisma.FrameworkUncheckedCreateWithoutRequirementsInput>;
    connectOrCreate?: Prisma.FrameworkCreateOrConnectWithoutRequirementsInput;
    upsert?: Prisma.FrameworkUpsertWithoutRequirementsInput;
    connect?: Prisma.FrameworkWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.FrameworkUpdateToOneWithWhereWithoutRequirementsInput, Prisma.FrameworkUpdateWithoutRequirementsInput>, Prisma.FrameworkUncheckedUpdateWithoutRequirementsInput>;
};
export type FrameworkCreateNestedOneWithoutServiceFrameworksInput = {
    create?: Prisma.XOR<Prisma.FrameworkCreateWithoutServiceFrameworksInput, Prisma.FrameworkUncheckedCreateWithoutServiceFrameworksInput>;
    connectOrCreate?: Prisma.FrameworkCreateOrConnectWithoutServiceFrameworksInput;
    connect?: Prisma.FrameworkWhereUniqueInput;
};
export type FrameworkUpdateOneRequiredWithoutServiceFrameworksNestedInput = {
    create?: Prisma.XOR<Prisma.FrameworkCreateWithoutServiceFrameworksInput, Prisma.FrameworkUncheckedCreateWithoutServiceFrameworksInput>;
    connectOrCreate?: Prisma.FrameworkCreateOrConnectWithoutServiceFrameworksInput;
    upsert?: Prisma.FrameworkUpsertWithoutServiceFrameworksInput;
    connect?: Prisma.FrameworkWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.FrameworkUpdateToOneWithWhereWithoutServiceFrameworksInput, Prisma.FrameworkUpdateWithoutServiceFrameworksInput>, Prisma.FrameworkUncheckedUpdateWithoutServiceFrameworksInput>;
};
export type FrameworkCreateWithoutRequirementsInput = {
    id?: string;
    code: string;
    name: string;
    version: string;
    type: $Enums.FrameworkType;
    scopeDescription: string;
    serviceFrameworks?: Prisma.ServiceFrameworkCreateNestedManyWithoutFrameworkInput;
};
export type FrameworkUncheckedCreateWithoutRequirementsInput = {
    id?: string;
    code: string;
    name: string;
    version: string;
    type: $Enums.FrameworkType;
    scopeDescription: string;
    serviceFrameworks?: Prisma.ServiceFrameworkUncheckedCreateNestedManyWithoutFrameworkInput;
};
export type FrameworkCreateOrConnectWithoutRequirementsInput = {
    where: Prisma.FrameworkWhereUniqueInput;
    create: Prisma.XOR<Prisma.FrameworkCreateWithoutRequirementsInput, Prisma.FrameworkUncheckedCreateWithoutRequirementsInput>;
};
export type FrameworkUpsertWithoutRequirementsInput = {
    update: Prisma.XOR<Prisma.FrameworkUpdateWithoutRequirementsInput, Prisma.FrameworkUncheckedUpdateWithoutRequirementsInput>;
    create: Prisma.XOR<Prisma.FrameworkCreateWithoutRequirementsInput, Prisma.FrameworkUncheckedCreateWithoutRequirementsInput>;
    where?: Prisma.FrameworkWhereInput;
};
export type FrameworkUpdateToOneWithWhereWithoutRequirementsInput = {
    where?: Prisma.FrameworkWhereInput;
    data: Prisma.XOR<Prisma.FrameworkUpdateWithoutRequirementsInput, Prisma.FrameworkUncheckedUpdateWithoutRequirementsInput>;
};
export type FrameworkUpdateWithoutRequirementsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumFrameworkTypeFieldUpdateOperationsInput | $Enums.FrameworkType;
    scopeDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceFrameworks?: Prisma.ServiceFrameworkUpdateManyWithoutFrameworkNestedInput;
};
export type FrameworkUncheckedUpdateWithoutRequirementsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumFrameworkTypeFieldUpdateOperationsInput | $Enums.FrameworkType;
    scopeDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceFrameworks?: Prisma.ServiceFrameworkUncheckedUpdateManyWithoutFrameworkNestedInput;
};
export type FrameworkCreateWithoutServiceFrameworksInput = {
    id?: string;
    code: string;
    name: string;
    version: string;
    type: $Enums.FrameworkType;
    scopeDescription: string;
    requirements?: Prisma.RequirementCreateNestedManyWithoutFrameworkInput;
};
export type FrameworkUncheckedCreateWithoutServiceFrameworksInput = {
    id?: string;
    code: string;
    name: string;
    version: string;
    type: $Enums.FrameworkType;
    scopeDescription: string;
    requirements?: Prisma.RequirementUncheckedCreateNestedManyWithoutFrameworkInput;
};
export type FrameworkCreateOrConnectWithoutServiceFrameworksInput = {
    where: Prisma.FrameworkWhereUniqueInput;
    create: Prisma.XOR<Prisma.FrameworkCreateWithoutServiceFrameworksInput, Prisma.FrameworkUncheckedCreateWithoutServiceFrameworksInput>;
};
export type FrameworkUpsertWithoutServiceFrameworksInput = {
    update: Prisma.XOR<Prisma.FrameworkUpdateWithoutServiceFrameworksInput, Prisma.FrameworkUncheckedUpdateWithoutServiceFrameworksInput>;
    create: Prisma.XOR<Prisma.FrameworkCreateWithoutServiceFrameworksInput, Prisma.FrameworkUncheckedCreateWithoutServiceFrameworksInput>;
    where?: Prisma.FrameworkWhereInput;
};
export type FrameworkUpdateToOneWithWhereWithoutServiceFrameworksInput = {
    where?: Prisma.FrameworkWhereInput;
    data: Prisma.XOR<Prisma.FrameworkUpdateWithoutServiceFrameworksInput, Prisma.FrameworkUncheckedUpdateWithoutServiceFrameworksInput>;
};
export type FrameworkUpdateWithoutServiceFrameworksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumFrameworkTypeFieldUpdateOperationsInput | $Enums.FrameworkType;
    scopeDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    requirements?: Prisma.RequirementUpdateManyWithoutFrameworkNestedInput;
};
export type FrameworkUncheckedUpdateWithoutServiceFrameworksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumFrameworkTypeFieldUpdateOperationsInput | $Enums.FrameworkType;
    scopeDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    requirements?: Prisma.RequirementUncheckedUpdateManyWithoutFrameworkNestedInput;
};
export type FrameworkCountOutputType = {
    requirements: number;
    serviceFrameworks: number;
};
export type FrameworkCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    requirements?: boolean | FrameworkCountOutputTypeCountRequirementsArgs;
    serviceFrameworks?: boolean | FrameworkCountOutputTypeCountServiceFrameworksArgs;
};
export type FrameworkCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FrameworkCountOutputTypeSelect<ExtArgs> | null;
};
export type FrameworkCountOutputTypeCountRequirementsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RequirementWhereInput;
};
export type FrameworkCountOutputTypeCountServiceFrameworksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceFrameworkWhereInput;
};
export type FrameworkSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    version?: boolean;
    type?: boolean;
    scopeDescription?: boolean;
    requirements?: boolean | Prisma.Framework$requirementsArgs<ExtArgs>;
    serviceFrameworks?: boolean | Prisma.Framework$serviceFrameworksArgs<ExtArgs>;
    _count?: boolean | Prisma.FrameworkCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["framework"]>;
export type FrameworkSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    version?: boolean;
    type?: boolean;
    scopeDescription?: boolean;
}, ExtArgs["result"]["framework"]>;
export type FrameworkSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    version?: boolean;
    type?: boolean;
    scopeDescription?: boolean;
}, ExtArgs["result"]["framework"]>;
export type FrameworkSelectScalar = {
    id?: boolean;
    code?: boolean;
    name?: boolean;
    version?: boolean;
    type?: boolean;
    scopeDescription?: boolean;
};
export type FrameworkOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "code" | "name" | "version" | "type" | "scopeDescription", ExtArgs["result"]["framework"]>;
export type FrameworkInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    requirements?: boolean | Prisma.Framework$requirementsArgs<ExtArgs>;
    serviceFrameworks?: boolean | Prisma.Framework$serviceFrameworksArgs<ExtArgs>;
    _count?: boolean | Prisma.FrameworkCountOutputTypeDefaultArgs<ExtArgs>;
};
export type FrameworkIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type FrameworkIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $FrameworkPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Framework";
    objects: {
        requirements: Prisma.$RequirementPayload<ExtArgs>[];
        serviceFrameworks: Prisma.$ServiceFrameworkPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        code: string;
        name: string;
        version: string;
        type: $Enums.FrameworkType;
        scopeDescription: string;
    }, ExtArgs["result"]["framework"]>;
    composites: {};
};
export type FrameworkGetPayload<S extends boolean | null | undefined | FrameworkDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$FrameworkPayload, S>;
export type FrameworkCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<FrameworkFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: FrameworkCountAggregateInputType | true;
};
export interface FrameworkDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Framework'];
        meta: {
            name: 'Framework';
        };
    };
    findUnique<T extends FrameworkFindUniqueArgs>(args: Prisma.SelectSubset<T, FrameworkFindUniqueArgs<ExtArgs>>): Prisma.Prisma__FrameworkClient<runtime.Types.Result.GetResult<Prisma.$FrameworkPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends FrameworkFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, FrameworkFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__FrameworkClient<runtime.Types.Result.GetResult<Prisma.$FrameworkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends FrameworkFindFirstArgs>(args?: Prisma.SelectSubset<T, FrameworkFindFirstArgs<ExtArgs>>): Prisma.Prisma__FrameworkClient<runtime.Types.Result.GetResult<Prisma.$FrameworkPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends FrameworkFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, FrameworkFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__FrameworkClient<runtime.Types.Result.GetResult<Prisma.$FrameworkPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends FrameworkFindManyArgs>(args?: Prisma.SelectSubset<T, FrameworkFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FrameworkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends FrameworkCreateArgs>(args: Prisma.SelectSubset<T, FrameworkCreateArgs<ExtArgs>>): Prisma.Prisma__FrameworkClient<runtime.Types.Result.GetResult<Prisma.$FrameworkPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends FrameworkCreateManyArgs>(args?: Prisma.SelectSubset<T, FrameworkCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends FrameworkCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, FrameworkCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FrameworkPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends FrameworkDeleteArgs>(args: Prisma.SelectSubset<T, FrameworkDeleteArgs<ExtArgs>>): Prisma.Prisma__FrameworkClient<runtime.Types.Result.GetResult<Prisma.$FrameworkPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends FrameworkUpdateArgs>(args: Prisma.SelectSubset<T, FrameworkUpdateArgs<ExtArgs>>): Prisma.Prisma__FrameworkClient<runtime.Types.Result.GetResult<Prisma.$FrameworkPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends FrameworkDeleteManyArgs>(args?: Prisma.SelectSubset<T, FrameworkDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends FrameworkUpdateManyArgs>(args: Prisma.SelectSubset<T, FrameworkUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends FrameworkUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, FrameworkUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FrameworkPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends FrameworkUpsertArgs>(args: Prisma.SelectSubset<T, FrameworkUpsertArgs<ExtArgs>>): Prisma.Prisma__FrameworkClient<runtime.Types.Result.GetResult<Prisma.$FrameworkPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends FrameworkCountArgs>(args?: Prisma.Subset<T, FrameworkCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], FrameworkCountAggregateOutputType> : number>;
    aggregate<T extends FrameworkAggregateArgs>(args: Prisma.Subset<T, FrameworkAggregateArgs>): Prisma.PrismaPromise<GetFrameworkAggregateType<T>>;
    groupBy<T extends FrameworkGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: FrameworkGroupByArgs['orderBy'];
    } : {
        orderBy?: FrameworkGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, FrameworkGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFrameworkGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: FrameworkFieldRefs;
}
export interface Prisma__FrameworkClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    requirements<T extends Prisma.Framework$requirementsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Framework$requirementsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    serviceFrameworks<T extends Prisma.Framework$serviceFrameworksArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Framework$serviceFrameworksArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceFrameworkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface FrameworkFieldRefs {
    readonly id: Prisma.FieldRef<"Framework", 'String'>;
    readonly code: Prisma.FieldRef<"Framework", 'String'>;
    readonly name: Prisma.FieldRef<"Framework", 'String'>;
    readonly version: Prisma.FieldRef<"Framework", 'String'>;
    readonly type: Prisma.FieldRef<"Framework", 'FrameworkType'>;
    readonly scopeDescription: Prisma.FieldRef<"Framework", 'String'>;
}
export type FrameworkFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FrameworkSelect<ExtArgs> | null;
    omit?: Prisma.FrameworkOmit<ExtArgs> | null;
    include?: Prisma.FrameworkInclude<ExtArgs> | null;
    where: Prisma.FrameworkWhereUniqueInput;
};
export type FrameworkFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FrameworkSelect<ExtArgs> | null;
    omit?: Prisma.FrameworkOmit<ExtArgs> | null;
    include?: Prisma.FrameworkInclude<ExtArgs> | null;
    where: Prisma.FrameworkWhereUniqueInput;
};
export type FrameworkFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FrameworkSelect<ExtArgs> | null;
    omit?: Prisma.FrameworkOmit<ExtArgs> | null;
    include?: Prisma.FrameworkInclude<ExtArgs> | null;
    where?: Prisma.FrameworkWhereInput;
    orderBy?: Prisma.FrameworkOrderByWithRelationInput | Prisma.FrameworkOrderByWithRelationInput[];
    cursor?: Prisma.FrameworkWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FrameworkScalarFieldEnum | Prisma.FrameworkScalarFieldEnum[];
};
export type FrameworkFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FrameworkSelect<ExtArgs> | null;
    omit?: Prisma.FrameworkOmit<ExtArgs> | null;
    include?: Prisma.FrameworkInclude<ExtArgs> | null;
    where?: Prisma.FrameworkWhereInput;
    orderBy?: Prisma.FrameworkOrderByWithRelationInput | Prisma.FrameworkOrderByWithRelationInput[];
    cursor?: Prisma.FrameworkWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FrameworkScalarFieldEnum | Prisma.FrameworkScalarFieldEnum[];
};
export type FrameworkFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FrameworkSelect<ExtArgs> | null;
    omit?: Prisma.FrameworkOmit<ExtArgs> | null;
    include?: Prisma.FrameworkInclude<ExtArgs> | null;
    where?: Prisma.FrameworkWhereInput;
    orderBy?: Prisma.FrameworkOrderByWithRelationInput | Prisma.FrameworkOrderByWithRelationInput[];
    cursor?: Prisma.FrameworkWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FrameworkScalarFieldEnum | Prisma.FrameworkScalarFieldEnum[];
};
export type FrameworkCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FrameworkSelect<ExtArgs> | null;
    omit?: Prisma.FrameworkOmit<ExtArgs> | null;
    include?: Prisma.FrameworkInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.FrameworkCreateInput, Prisma.FrameworkUncheckedCreateInput>;
};
export type FrameworkCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.FrameworkCreateManyInput | Prisma.FrameworkCreateManyInput[];
    skipDuplicates?: boolean;
};
export type FrameworkCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FrameworkSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.FrameworkOmit<ExtArgs> | null;
    data: Prisma.FrameworkCreateManyInput | Prisma.FrameworkCreateManyInput[];
    skipDuplicates?: boolean;
};
export type FrameworkUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FrameworkSelect<ExtArgs> | null;
    omit?: Prisma.FrameworkOmit<ExtArgs> | null;
    include?: Prisma.FrameworkInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.FrameworkUpdateInput, Prisma.FrameworkUncheckedUpdateInput>;
    where: Prisma.FrameworkWhereUniqueInput;
};
export type FrameworkUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.FrameworkUpdateManyMutationInput, Prisma.FrameworkUncheckedUpdateManyInput>;
    where?: Prisma.FrameworkWhereInput;
    limit?: number;
};
export type FrameworkUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FrameworkSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.FrameworkOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.FrameworkUpdateManyMutationInput, Prisma.FrameworkUncheckedUpdateManyInput>;
    where?: Prisma.FrameworkWhereInput;
    limit?: number;
};
export type FrameworkUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FrameworkSelect<ExtArgs> | null;
    omit?: Prisma.FrameworkOmit<ExtArgs> | null;
    include?: Prisma.FrameworkInclude<ExtArgs> | null;
    where: Prisma.FrameworkWhereUniqueInput;
    create: Prisma.XOR<Prisma.FrameworkCreateInput, Prisma.FrameworkUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.FrameworkUpdateInput, Prisma.FrameworkUncheckedUpdateInput>;
};
export type FrameworkDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FrameworkSelect<ExtArgs> | null;
    omit?: Prisma.FrameworkOmit<ExtArgs> | null;
    include?: Prisma.FrameworkInclude<ExtArgs> | null;
    where: Prisma.FrameworkWhereUniqueInput;
};
export type FrameworkDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FrameworkWhereInput;
    limit?: number;
};
export type Framework$requirementsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Framework$serviceFrameworksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceFrameworkSelect<ExtArgs> | null;
    omit?: Prisma.ServiceFrameworkOmit<ExtArgs> | null;
    include?: Prisma.ServiceFrameworkInclude<ExtArgs> | null;
    where?: Prisma.ServiceFrameworkWhereInput;
    orderBy?: Prisma.ServiceFrameworkOrderByWithRelationInput | Prisma.ServiceFrameworkOrderByWithRelationInput[];
    cursor?: Prisma.ServiceFrameworkWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceFrameworkScalarFieldEnum | Prisma.ServiceFrameworkScalarFieldEnum[];
};
export type FrameworkDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FrameworkSelect<ExtArgs> | null;
    omit?: Prisma.FrameworkOmit<ExtArgs> | null;
    include?: Prisma.FrameworkInclude<ExtArgs> | null;
};
export {};
