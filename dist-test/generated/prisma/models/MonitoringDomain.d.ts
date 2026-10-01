import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type MonitoringDomainModel = runtime.Types.Result.DefaultSelection<Prisma.$MonitoringDomainPayload>;
export type AggregateMonitoringDomain = {
    _count: MonitoringDomainCountAggregateOutputType | null;
    _min: MonitoringDomainMinAggregateOutputType | null;
    _max: MonitoringDomainMaxAggregateOutputType | null;
};
export type MonitoringDomainMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    monitoredScope: string | null;
    coveredCriterion: string | null;
    generatedEvidence: string | null;
};
export type MonitoringDomainMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    monitoredScope: string | null;
    coveredCriterion: string | null;
    generatedEvidence: string | null;
};
export type MonitoringDomainCountAggregateOutputType = {
    id: number;
    name: number;
    monitoredScope: number;
    coveredCriterion: number;
    generatedEvidence: number;
    _all: number;
};
export type MonitoringDomainMinAggregateInputType = {
    id?: true;
    name?: true;
    monitoredScope?: true;
    coveredCriterion?: true;
    generatedEvidence?: true;
};
export type MonitoringDomainMaxAggregateInputType = {
    id?: true;
    name?: true;
    monitoredScope?: true;
    coveredCriterion?: true;
    generatedEvidence?: true;
};
export type MonitoringDomainCountAggregateInputType = {
    id?: true;
    name?: true;
    monitoredScope?: true;
    coveredCriterion?: true;
    generatedEvidence?: true;
    _all?: true;
};
export type MonitoringDomainAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MonitoringDomainWhereInput;
    orderBy?: Prisma.MonitoringDomainOrderByWithRelationInput | Prisma.MonitoringDomainOrderByWithRelationInput[];
    cursor?: Prisma.MonitoringDomainWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | MonitoringDomainCountAggregateInputType;
    _min?: MonitoringDomainMinAggregateInputType;
    _max?: MonitoringDomainMaxAggregateInputType;
};
export type GetMonitoringDomainAggregateType<T extends MonitoringDomainAggregateArgs> = {
    [P in keyof T & keyof AggregateMonitoringDomain]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMonitoringDomain[P]> : Prisma.GetScalarType<T[P], AggregateMonitoringDomain[P]>;
};
export type MonitoringDomainGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MonitoringDomainWhereInput;
    orderBy?: Prisma.MonitoringDomainOrderByWithAggregationInput | Prisma.MonitoringDomainOrderByWithAggregationInput[];
    by: Prisma.MonitoringDomainScalarFieldEnum[] | Prisma.MonitoringDomainScalarFieldEnum;
    having?: Prisma.MonitoringDomainScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MonitoringDomainCountAggregateInputType | true;
    _min?: MonitoringDomainMinAggregateInputType;
    _max?: MonitoringDomainMaxAggregateInputType;
};
export type MonitoringDomainGroupByOutputType = {
    id: string;
    name: string;
    monitoredScope: string;
    coveredCriterion: string;
    generatedEvidence: string;
    _count: MonitoringDomainCountAggregateOutputType | null;
    _min: MonitoringDomainMinAggregateOutputType | null;
    _max: MonitoringDomainMaxAggregateOutputType | null;
};
type GetMonitoringDomainGroupByPayload<T extends MonitoringDomainGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MonitoringDomainGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MonitoringDomainGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MonitoringDomainGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MonitoringDomainGroupByOutputType[P]>;
}>>;
export type MonitoringDomainWhereInput = {
    AND?: Prisma.MonitoringDomainWhereInput | Prisma.MonitoringDomainWhereInput[];
    OR?: Prisma.MonitoringDomainWhereInput[];
    NOT?: Prisma.MonitoringDomainWhereInput | Prisma.MonitoringDomainWhereInput[];
    id?: Prisma.UuidFilter<"MonitoringDomain"> | string;
    name?: Prisma.StringFilter<"MonitoringDomain"> | string;
    monitoredScope?: Prisma.StringFilter<"MonitoringDomain"> | string;
    coveredCriterion?: Prisma.StringFilter<"MonitoringDomain"> | string;
    generatedEvidence?: Prisma.StringFilter<"MonitoringDomain"> | string;
    requirements?: Prisma.MonitoringDomainRequirementListRelationFilter;
    capabilities?: Prisma.MonitoringDomainCapabilityListRelationFilter;
};
export type MonitoringDomainOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    monitoredScope?: Prisma.SortOrder;
    coveredCriterion?: Prisma.SortOrder;
    generatedEvidence?: Prisma.SortOrder;
    requirements?: Prisma.MonitoringDomainRequirementOrderByRelationAggregateInput;
    capabilities?: Prisma.MonitoringDomainCapabilityOrderByRelationAggregateInput;
};
export type MonitoringDomainWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.MonitoringDomainWhereInput | Prisma.MonitoringDomainWhereInput[];
    OR?: Prisma.MonitoringDomainWhereInput[];
    NOT?: Prisma.MonitoringDomainWhereInput | Prisma.MonitoringDomainWhereInput[];
    name?: Prisma.StringFilter<"MonitoringDomain"> | string;
    monitoredScope?: Prisma.StringFilter<"MonitoringDomain"> | string;
    coveredCriterion?: Prisma.StringFilter<"MonitoringDomain"> | string;
    generatedEvidence?: Prisma.StringFilter<"MonitoringDomain"> | string;
    requirements?: Prisma.MonitoringDomainRequirementListRelationFilter;
    capabilities?: Prisma.MonitoringDomainCapabilityListRelationFilter;
}, "id">;
export type MonitoringDomainOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    monitoredScope?: Prisma.SortOrder;
    coveredCriterion?: Prisma.SortOrder;
    generatedEvidence?: Prisma.SortOrder;
    _count?: Prisma.MonitoringDomainCountOrderByAggregateInput;
    _max?: Prisma.MonitoringDomainMaxOrderByAggregateInput;
    _min?: Prisma.MonitoringDomainMinOrderByAggregateInput;
};
export type MonitoringDomainScalarWhereWithAggregatesInput = {
    AND?: Prisma.MonitoringDomainScalarWhereWithAggregatesInput | Prisma.MonitoringDomainScalarWhereWithAggregatesInput[];
    OR?: Prisma.MonitoringDomainScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MonitoringDomainScalarWhereWithAggregatesInput | Prisma.MonitoringDomainScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"MonitoringDomain"> | string;
    name?: Prisma.StringWithAggregatesFilter<"MonitoringDomain"> | string;
    monitoredScope?: Prisma.StringWithAggregatesFilter<"MonitoringDomain"> | string;
    coveredCriterion?: Prisma.StringWithAggregatesFilter<"MonitoringDomain"> | string;
    generatedEvidence?: Prisma.StringWithAggregatesFilter<"MonitoringDomain"> | string;
};
export type MonitoringDomainCreateInput = {
    id?: string;
    name: string;
    monitoredScope: string;
    coveredCriterion: string;
    generatedEvidence: string;
    requirements?: Prisma.MonitoringDomainRequirementCreateNestedManyWithoutMonitoringDomainInput;
    capabilities?: Prisma.MonitoringDomainCapabilityCreateNestedManyWithoutMonitoringDomainInput;
};
export type MonitoringDomainUncheckedCreateInput = {
    id?: string;
    name: string;
    monitoredScope: string;
    coveredCriterion: string;
    generatedEvidence: string;
    requirements?: Prisma.MonitoringDomainRequirementUncheckedCreateNestedManyWithoutMonitoringDomainInput;
    capabilities?: Prisma.MonitoringDomainCapabilityUncheckedCreateNestedManyWithoutMonitoringDomainInput;
};
export type MonitoringDomainUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoredScope?: Prisma.StringFieldUpdateOperationsInput | string;
    coveredCriterion?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
    requirements?: Prisma.MonitoringDomainRequirementUpdateManyWithoutMonitoringDomainNestedInput;
    capabilities?: Prisma.MonitoringDomainCapabilityUpdateManyWithoutMonitoringDomainNestedInput;
};
export type MonitoringDomainUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoredScope?: Prisma.StringFieldUpdateOperationsInput | string;
    coveredCriterion?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
    requirements?: Prisma.MonitoringDomainRequirementUncheckedUpdateManyWithoutMonitoringDomainNestedInput;
    capabilities?: Prisma.MonitoringDomainCapabilityUncheckedUpdateManyWithoutMonitoringDomainNestedInput;
};
export type MonitoringDomainCreateManyInput = {
    id?: string;
    name: string;
    monitoredScope: string;
    coveredCriterion: string;
    generatedEvidence: string;
};
export type MonitoringDomainUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoredScope?: Prisma.StringFieldUpdateOperationsInput | string;
    coveredCriterion?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoredScope?: Prisma.StringFieldUpdateOperationsInput | string;
    coveredCriterion?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MonitoringDomainCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    monitoredScope?: Prisma.SortOrder;
    coveredCriterion?: Prisma.SortOrder;
    generatedEvidence?: Prisma.SortOrder;
};
export type MonitoringDomainMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    monitoredScope?: Prisma.SortOrder;
    coveredCriterion?: Prisma.SortOrder;
    generatedEvidence?: Prisma.SortOrder;
};
export type MonitoringDomainMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    monitoredScope?: Prisma.SortOrder;
    coveredCriterion?: Prisma.SortOrder;
    generatedEvidence?: Prisma.SortOrder;
};
export type MonitoringDomainScalarRelationFilter = {
    is?: Prisma.MonitoringDomainWhereInput;
    isNot?: Prisma.MonitoringDomainWhereInput;
};
export type MonitoringDomainCreateNestedOneWithoutRequirementsInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainCreateWithoutRequirementsInput, Prisma.MonitoringDomainUncheckedCreateWithoutRequirementsInput>;
    connectOrCreate?: Prisma.MonitoringDomainCreateOrConnectWithoutRequirementsInput;
    connect?: Prisma.MonitoringDomainWhereUniqueInput;
};
export type MonitoringDomainUpdateOneRequiredWithoutRequirementsNestedInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainCreateWithoutRequirementsInput, Prisma.MonitoringDomainUncheckedCreateWithoutRequirementsInput>;
    connectOrCreate?: Prisma.MonitoringDomainCreateOrConnectWithoutRequirementsInput;
    upsert?: Prisma.MonitoringDomainUpsertWithoutRequirementsInput;
    connect?: Prisma.MonitoringDomainWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.MonitoringDomainUpdateToOneWithWhereWithoutRequirementsInput, Prisma.MonitoringDomainUpdateWithoutRequirementsInput>, Prisma.MonitoringDomainUncheckedUpdateWithoutRequirementsInput>;
};
export type MonitoringDomainCreateNestedOneWithoutCapabilitiesInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainCreateWithoutCapabilitiesInput, Prisma.MonitoringDomainUncheckedCreateWithoutCapabilitiesInput>;
    connectOrCreate?: Prisma.MonitoringDomainCreateOrConnectWithoutCapabilitiesInput;
    connect?: Prisma.MonitoringDomainWhereUniqueInput;
};
export type MonitoringDomainUpdateOneRequiredWithoutCapabilitiesNestedInput = {
    create?: Prisma.XOR<Prisma.MonitoringDomainCreateWithoutCapabilitiesInput, Prisma.MonitoringDomainUncheckedCreateWithoutCapabilitiesInput>;
    connectOrCreate?: Prisma.MonitoringDomainCreateOrConnectWithoutCapabilitiesInput;
    upsert?: Prisma.MonitoringDomainUpsertWithoutCapabilitiesInput;
    connect?: Prisma.MonitoringDomainWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.MonitoringDomainUpdateToOneWithWhereWithoutCapabilitiesInput, Prisma.MonitoringDomainUpdateWithoutCapabilitiesInput>, Prisma.MonitoringDomainUncheckedUpdateWithoutCapabilitiesInput>;
};
export type MonitoringDomainCreateWithoutRequirementsInput = {
    id?: string;
    name: string;
    monitoredScope: string;
    coveredCriterion: string;
    generatedEvidence: string;
    capabilities?: Prisma.MonitoringDomainCapabilityCreateNestedManyWithoutMonitoringDomainInput;
};
export type MonitoringDomainUncheckedCreateWithoutRequirementsInput = {
    id?: string;
    name: string;
    monitoredScope: string;
    coveredCriterion: string;
    generatedEvidence: string;
    capabilities?: Prisma.MonitoringDomainCapabilityUncheckedCreateNestedManyWithoutMonitoringDomainInput;
};
export type MonitoringDomainCreateOrConnectWithoutRequirementsInput = {
    where: Prisma.MonitoringDomainWhereUniqueInput;
    create: Prisma.XOR<Prisma.MonitoringDomainCreateWithoutRequirementsInput, Prisma.MonitoringDomainUncheckedCreateWithoutRequirementsInput>;
};
export type MonitoringDomainUpsertWithoutRequirementsInput = {
    update: Prisma.XOR<Prisma.MonitoringDomainUpdateWithoutRequirementsInput, Prisma.MonitoringDomainUncheckedUpdateWithoutRequirementsInput>;
    create: Prisma.XOR<Prisma.MonitoringDomainCreateWithoutRequirementsInput, Prisma.MonitoringDomainUncheckedCreateWithoutRequirementsInput>;
    where?: Prisma.MonitoringDomainWhereInput;
};
export type MonitoringDomainUpdateToOneWithWhereWithoutRequirementsInput = {
    where?: Prisma.MonitoringDomainWhereInput;
    data: Prisma.XOR<Prisma.MonitoringDomainUpdateWithoutRequirementsInput, Prisma.MonitoringDomainUncheckedUpdateWithoutRequirementsInput>;
};
export type MonitoringDomainUpdateWithoutRequirementsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoredScope?: Prisma.StringFieldUpdateOperationsInput | string;
    coveredCriterion?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
    capabilities?: Prisma.MonitoringDomainCapabilityUpdateManyWithoutMonitoringDomainNestedInput;
};
export type MonitoringDomainUncheckedUpdateWithoutRequirementsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoredScope?: Prisma.StringFieldUpdateOperationsInput | string;
    coveredCriterion?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
    capabilities?: Prisma.MonitoringDomainCapabilityUncheckedUpdateManyWithoutMonitoringDomainNestedInput;
};
export type MonitoringDomainCreateWithoutCapabilitiesInput = {
    id?: string;
    name: string;
    monitoredScope: string;
    coveredCriterion: string;
    generatedEvidence: string;
    requirements?: Prisma.MonitoringDomainRequirementCreateNestedManyWithoutMonitoringDomainInput;
};
export type MonitoringDomainUncheckedCreateWithoutCapabilitiesInput = {
    id?: string;
    name: string;
    monitoredScope: string;
    coveredCriterion: string;
    generatedEvidence: string;
    requirements?: Prisma.MonitoringDomainRequirementUncheckedCreateNestedManyWithoutMonitoringDomainInput;
};
export type MonitoringDomainCreateOrConnectWithoutCapabilitiesInput = {
    where: Prisma.MonitoringDomainWhereUniqueInput;
    create: Prisma.XOR<Prisma.MonitoringDomainCreateWithoutCapabilitiesInput, Prisma.MonitoringDomainUncheckedCreateWithoutCapabilitiesInput>;
};
export type MonitoringDomainUpsertWithoutCapabilitiesInput = {
    update: Prisma.XOR<Prisma.MonitoringDomainUpdateWithoutCapabilitiesInput, Prisma.MonitoringDomainUncheckedUpdateWithoutCapabilitiesInput>;
    create: Prisma.XOR<Prisma.MonitoringDomainCreateWithoutCapabilitiesInput, Prisma.MonitoringDomainUncheckedCreateWithoutCapabilitiesInput>;
    where?: Prisma.MonitoringDomainWhereInput;
};
export type MonitoringDomainUpdateToOneWithWhereWithoutCapabilitiesInput = {
    where?: Prisma.MonitoringDomainWhereInput;
    data: Prisma.XOR<Prisma.MonitoringDomainUpdateWithoutCapabilitiesInput, Prisma.MonitoringDomainUncheckedUpdateWithoutCapabilitiesInput>;
};
export type MonitoringDomainUpdateWithoutCapabilitiesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoredScope?: Prisma.StringFieldUpdateOperationsInput | string;
    coveredCriterion?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
    requirements?: Prisma.MonitoringDomainRequirementUpdateManyWithoutMonitoringDomainNestedInput;
};
export type MonitoringDomainUncheckedUpdateWithoutCapabilitiesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoredScope?: Prisma.StringFieldUpdateOperationsInput | string;
    coveredCriterion?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
    requirements?: Prisma.MonitoringDomainRequirementUncheckedUpdateManyWithoutMonitoringDomainNestedInput;
};
export type MonitoringDomainCountOutputType = {
    requirements: number;
    capabilities: number;
};
export type MonitoringDomainCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    requirements?: boolean | MonitoringDomainCountOutputTypeCountRequirementsArgs;
    capabilities?: boolean | MonitoringDomainCountOutputTypeCountCapabilitiesArgs;
};
export type MonitoringDomainCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCountOutputTypeSelect<ExtArgs> | null;
};
export type MonitoringDomainCountOutputTypeCountRequirementsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MonitoringDomainRequirementWhereInput;
};
export type MonitoringDomainCountOutputTypeCountCapabilitiesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MonitoringDomainCapabilityWhereInput;
};
export type MonitoringDomainSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    monitoredScope?: boolean;
    coveredCriterion?: boolean;
    generatedEvidence?: boolean;
    requirements?: boolean | Prisma.MonitoringDomain$requirementsArgs<ExtArgs>;
    capabilities?: boolean | Prisma.MonitoringDomain$capabilitiesArgs<ExtArgs>;
    _count?: boolean | Prisma.MonitoringDomainCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["monitoringDomain"]>;
export type MonitoringDomainSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    monitoredScope?: boolean;
    coveredCriterion?: boolean;
    generatedEvidence?: boolean;
}, ExtArgs["result"]["monitoringDomain"]>;
export type MonitoringDomainSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    monitoredScope?: boolean;
    coveredCriterion?: boolean;
    generatedEvidence?: boolean;
}, ExtArgs["result"]["monitoringDomain"]>;
export type MonitoringDomainSelectScalar = {
    id?: boolean;
    name?: boolean;
    monitoredScope?: boolean;
    coveredCriterion?: boolean;
    generatedEvidence?: boolean;
};
export type MonitoringDomainOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "monitoredScope" | "coveredCriterion" | "generatedEvidence", ExtArgs["result"]["monitoringDomain"]>;
export type MonitoringDomainInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    requirements?: boolean | Prisma.MonitoringDomain$requirementsArgs<ExtArgs>;
    capabilities?: boolean | Prisma.MonitoringDomain$capabilitiesArgs<ExtArgs>;
    _count?: boolean | Prisma.MonitoringDomainCountOutputTypeDefaultArgs<ExtArgs>;
};
export type MonitoringDomainIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type MonitoringDomainIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $MonitoringDomainPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "MonitoringDomain";
    objects: {
        requirements: Prisma.$MonitoringDomainRequirementPayload<ExtArgs>[];
        capabilities: Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        monitoredScope: string;
        coveredCriterion: string;
        generatedEvidence: string;
    }, ExtArgs["result"]["monitoringDomain"]>;
    composites: {};
};
export type MonitoringDomainGetPayload<S extends boolean | null | undefined | MonitoringDomainDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MonitoringDomainPayload, S>;
export type MonitoringDomainCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MonitoringDomainFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MonitoringDomainCountAggregateInputType | true;
};
export interface MonitoringDomainDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['MonitoringDomain'];
        meta: {
            name: 'MonitoringDomain';
        };
    };
    findUnique<T extends MonitoringDomainFindUniqueArgs>(args: Prisma.SelectSubset<T, MonitoringDomainFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends MonitoringDomainFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MonitoringDomainFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends MonitoringDomainFindFirstArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainFindFirstArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends MonitoringDomainFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends MonitoringDomainFindManyArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends MonitoringDomainCreateArgs>(args: Prisma.SelectSubset<T, MonitoringDomainCreateArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends MonitoringDomainCreateManyArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends MonitoringDomainCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends MonitoringDomainDeleteArgs>(args: Prisma.SelectSubset<T, MonitoringDomainDeleteArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends MonitoringDomainUpdateArgs>(args: Prisma.SelectSubset<T, MonitoringDomainUpdateArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends MonitoringDomainDeleteManyArgs>(args?: Prisma.SelectSubset<T, MonitoringDomainDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends MonitoringDomainUpdateManyArgs>(args: Prisma.SelectSubset<T, MonitoringDomainUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends MonitoringDomainUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MonitoringDomainUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends MonitoringDomainUpsertArgs>(args: Prisma.SelectSubset<T, MonitoringDomainUpsertArgs<ExtArgs>>): Prisma.Prisma__MonitoringDomainClient<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends MonitoringDomainCountArgs>(args?: Prisma.Subset<T, MonitoringDomainCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MonitoringDomainCountAggregateOutputType> : number>;
    aggregate<T extends MonitoringDomainAggregateArgs>(args: Prisma.Subset<T, MonitoringDomainAggregateArgs>): Prisma.PrismaPromise<GetMonitoringDomainAggregateType<T>>;
    groupBy<T extends MonitoringDomainGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MonitoringDomainGroupByArgs['orderBy'];
    } : {
        orderBy?: MonitoringDomainGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MonitoringDomainGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMonitoringDomainGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: MonitoringDomainFieldRefs;
}
export interface Prisma__MonitoringDomainClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    requirements<T extends Prisma.MonitoringDomain$requirementsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MonitoringDomain$requirementsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainRequirementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    capabilities<T extends Prisma.MonitoringDomain$capabilitiesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MonitoringDomain$capabilitiesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface MonitoringDomainFieldRefs {
    readonly id: Prisma.FieldRef<"MonitoringDomain", 'String'>;
    readonly name: Prisma.FieldRef<"MonitoringDomain", 'String'>;
    readonly monitoredScope: Prisma.FieldRef<"MonitoringDomain", 'String'>;
    readonly coveredCriterion: Prisma.FieldRef<"MonitoringDomain", 'String'>;
    readonly generatedEvidence: Prisma.FieldRef<"MonitoringDomain", 'String'>;
}
export type MonitoringDomainFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainInclude<ExtArgs> | null;
    where: Prisma.MonitoringDomainWhereUniqueInput;
};
export type MonitoringDomainFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainInclude<ExtArgs> | null;
    where: Prisma.MonitoringDomainWhereUniqueInput;
};
export type MonitoringDomainFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainInclude<ExtArgs> | null;
    where?: Prisma.MonitoringDomainWhereInput;
    orderBy?: Prisma.MonitoringDomainOrderByWithRelationInput | Prisma.MonitoringDomainOrderByWithRelationInput[];
    cursor?: Prisma.MonitoringDomainWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MonitoringDomainScalarFieldEnum | Prisma.MonitoringDomainScalarFieldEnum[];
};
export type MonitoringDomainFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainInclude<ExtArgs> | null;
    where?: Prisma.MonitoringDomainWhereInput;
    orderBy?: Prisma.MonitoringDomainOrderByWithRelationInput | Prisma.MonitoringDomainOrderByWithRelationInput[];
    cursor?: Prisma.MonitoringDomainWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MonitoringDomainScalarFieldEnum | Prisma.MonitoringDomainScalarFieldEnum[];
};
export type MonitoringDomainFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainInclude<ExtArgs> | null;
    where?: Prisma.MonitoringDomainWhereInput;
    orderBy?: Prisma.MonitoringDomainOrderByWithRelationInput | Prisma.MonitoringDomainOrderByWithRelationInput[];
    cursor?: Prisma.MonitoringDomainWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MonitoringDomainScalarFieldEnum | Prisma.MonitoringDomainScalarFieldEnum[];
};
export type MonitoringDomainCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MonitoringDomainCreateInput, Prisma.MonitoringDomainUncheckedCreateInput>;
};
export type MonitoringDomainCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.MonitoringDomainCreateManyInput | Prisma.MonitoringDomainCreateManyInput[];
    skipDuplicates?: boolean;
};
export type MonitoringDomainCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainOmit<ExtArgs> | null;
    data: Prisma.MonitoringDomainCreateManyInput | Prisma.MonitoringDomainCreateManyInput[];
    skipDuplicates?: boolean;
};
export type MonitoringDomainUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MonitoringDomainUpdateInput, Prisma.MonitoringDomainUncheckedUpdateInput>;
    where: Prisma.MonitoringDomainWhereUniqueInput;
};
export type MonitoringDomainUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.MonitoringDomainUpdateManyMutationInput, Prisma.MonitoringDomainUncheckedUpdateManyInput>;
    where?: Prisma.MonitoringDomainWhereInput;
    limit?: number;
};
export type MonitoringDomainUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MonitoringDomainUpdateManyMutationInput, Prisma.MonitoringDomainUncheckedUpdateManyInput>;
    where?: Prisma.MonitoringDomainWhereInput;
    limit?: number;
};
export type MonitoringDomainUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainInclude<ExtArgs> | null;
    where: Prisma.MonitoringDomainWhereUniqueInput;
    create: Prisma.XOR<Prisma.MonitoringDomainCreateInput, Prisma.MonitoringDomainUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.MonitoringDomainUpdateInput, Prisma.MonitoringDomainUncheckedUpdateInput>;
};
export type MonitoringDomainDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainInclude<ExtArgs> | null;
    where: Prisma.MonitoringDomainWhereUniqueInput;
};
export type MonitoringDomainDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MonitoringDomainWhereInput;
    limit?: number;
};
export type MonitoringDomain$requirementsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainRequirementSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainRequirementOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainRequirementInclude<ExtArgs> | null;
    where?: Prisma.MonitoringDomainRequirementWhereInput;
    orderBy?: Prisma.MonitoringDomainRequirementOrderByWithRelationInput | Prisma.MonitoringDomainRequirementOrderByWithRelationInput[];
    cursor?: Prisma.MonitoringDomainRequirementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MonitoringDomainRequirementScalarFieldEnum | Prisma.MonitoringDomainRequirementScalarFieldEnum[];
};
export type MonitoringDomain$capabilitiesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainCapabilityOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainCapabilityInclude<ExtArgs> | null;
    where?: Prisma.MonitoringDomainCapabilityWhereInput;
    orderBy?: Prisma.MonitoringDomainCapabilityOrderByWithRelationInput | Prisma.MonitoringDomainCapabilityOrderByWithRelationInput[];
    cursor?: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MonitoringDomainCapabilityScalarFieldEnum | Prisma.MonitoringDomainCapabilityScalarFieldEnum[];
};
export type MonitoringDomainDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainSelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainInclude<ExtArgs> | null;
};
export {};
