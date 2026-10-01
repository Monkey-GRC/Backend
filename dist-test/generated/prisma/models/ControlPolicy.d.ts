import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ControlPolicyModel = runtime.Types.Result.DefaultSelection<Prisma.$ControlPolicyPayload>;
export type AggregateControlPolicy = {
    _count: ControlPolicyCountAggregateOutputType | null;
    _min: ControlPolicyMinAggregateOutputType | null;
    _max: ControlPolicyMaxAggregateOutputType | null;
};
export type ControlPolicyMinAggregateOutputType = {
    id: string | null;
    controlId: string | null;
    policyId: string | null;
};
export type ControlPolicyMaxAggregateOutputType = {
    id: string | null;
    controlId: string | null;
    policyId: string | null;
};
export type ControlPolicyCountAggregateOutputType = {
    id: number;
    controlId: number;
    policyId: number;
    _all: number;
};
export type ControlPolicyMinAggregateInputType = {
    id?: true;
    controlId?: true;
    policyId?: true;
};
export type ControlPolicyMaxAggregateInputType = {
    id?: true;
    controlId?: true;
    policyId?: true;
};
export type ControlPolicyCountAggregateInputType = {
    id?: true;
    controlId?: true;
    policyId?: true;
    _all?: true;
};
export type ControlPolicyAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlPolicyWhereInput;
    orderBy?: Prisma.ControlPolicyOrderByWithRelationInput | Prisma.ControlPolicyOrderByWithRelationInput[];
    cursor?: Prisma.ControlPolicyWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ControlPolicyCountAggregateInputType;
    _min?: ControlPolicyMinAggregateInputType;
    _max?: ControlPolicyMaxAggregateInputType;
};
export type GetControlPolicyAggregateType<T extends ControlPolicyAggregateArgs> = {
    [P in keyof T & keyof AggregateControlPolicy]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateControlPolicy[P]> : Prisma.GetScalarType<T[P], AggregateControlPolicy[P]>;
};
export type ControlPolicyGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlPolicyWhereInput;
    orderBy?: Prisma.ControlPolicyOrderByWithAggregationInput | Prisma.ControlPolicyOrderByWithAggregationInput[];
    by: Prisma.ControlPolicyScalarFieldEnum[] | Prisma.ControlPolicyScalarFieldEnum;
    having?: Prisma.ControlPolicyScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ControlPolicyCountAggregateInputType | true;
    _min?: ControlPolicyMinAggregateInputType;
    _max?: ControlPolicyMaxAggregateInputType;
};
export type ControlPolicyGroupByOutputType = {
    id: string;
    controlId: string;
    policyId: string;
    _count: ControlPolicyCountAggregateOutputType | null;
    _min: ControlPolicyMinAggregateOutputType | null;
    _max: ControlPolicyMaxAggregateOutputType | null;
};
type GetControlPolicyGroupByPayload<T extends ControlPolicyGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ControlPolicyGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ControlPolicyGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ControlPolicyGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ControlPolicyGroupByOutputType[P]>;
}>>;
export type ControlPolicyWhereInput = {
    AND?: Prisma.ControlPolicyWhereInput | Prisma.ControlPolicyWhereInput[];
    OR?: Prisma.ControlPolicyWhereInput[];
    NOT?: Prisma.ControlPolicyWhereInput | Prisma.ControlPolicyWhereInput[];
    id?: Prisma.UuidFilter<"ControlPolicy"> | string;
    controlId?: Prisma.UuidFilter<"ControlPolicy"> | string;
    policyId?: Prisma.UuidFilter<"ControlPolicy"> | string;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
    policy?: Prisma.XOR<Prisma.PolicyScalarRelationFilter, Prisma.PolicyWhereInput>;
};
export type ControlPolicyOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
    control?: Prisma.ControlOrderByWithRelationInput;
    policy?: Prisma.PolicyOrderByWithRelationInput;
};
export type ControlPolicyWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    controlId_policyId?: Prisma.ControlPolicyControlIdPolicyIdCompoundUniqueInput;
    AND?: Prisma.ControlPolicyWhereInput | Prisma.ControlPolicyWhereInput[];
    OR?: Prisma.ControlPolicyWhereInput[];
    NOT?: Prisma.ControlPolicyWhereInput | Prisma.ControlPolicyWhereInput[];
    controlId?: Prisma.UuidFilter<"ControlPolicy"> | string;
    policyId?: Prisma.UuidFilter<"ControlPolicy"> | string;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
    policy?: Prisma.XOR<Prisma.PolicyScalarRelationFilter, Prisma.PolicyWhereInput>;
}, "id" | "controlId_policyId">;
export type ControlPolicyOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
    _count?: Prisma.ControlPolicyCountOrderByAggregateInput;
    _max?: Prisma.ControlPolicyMaxOrderByAggregateInput;
    _min?: Prisma.ControlPolicyMinOrderByAggregateInput;
};
export type ControlPolicyScalarWhereWithAggregatesInput = {
    AND?: Prisma.ControlPolicyScalarWhereWithAggregatesInput | Prisma.ControlPolicyScalarWhereWithAggregatesInput[];
    OR?: Prisma.ControlPolicyScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ControlPolicyScalarWhereWithAggregatesInput | Prisma.ControlPolicyScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ControlPolicy"> | string;
    controlId?: Prisma.UuidWithAggregatesFilter<"ControlPolicy"> | string;
    policyId?: Prisma.UuidWithAggregatesFilter<"ControlPolicy"> | string;
};
export type ControlPolicyCreateInput = {
    id?: string;
    control: Prisma.ControlCreateNestedOneWithoutControlPoliciesInput;
    policy: Prisma.PolicyCreateNestedOneWithoutControlPoliciesInput;
};
export type ControlPolicyUncheckedCreateInput = {
    id?: string;
    controlId: string;
    policyId: string;
};
export type ControlPolicyUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    control?: Prisma.ControlUpdateOneRequiredWithoutControlPoliciesNestedInput;
    policy?: Prisma.PolicyUpdateOneRequiredWithoutControlPoliciesNestedInput;
};
export type ControlPolicyUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlPolicyCreateManyInput = {
    id?: string;
    controlId: string;
    policyId: string;
};
export type ControlPolicyUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlPolicyUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlPolicyListRelationFilter = {
    every?: Prisma.ControlPolicyWhereInput;
    some?: Prisma.ControlPolicyWhereInput;
    none?: Prisma.ControlPolicyWhereInput;
};
export type ControlPolicyOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ControlPolicyControlIdPolicyIdCompoundUniqueInput = {
    controlId: string;
    policyId: string;
};
export type ControlPolicyCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
};
export type ControlPolicyMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
};
export type ControlPolicyMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
};
export type ControlPolicyCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.ControlPolicyCreateWithoutControlInput, Prisma.ControlPolicyUncheckedCreateWithoutControlInput> | Prisma.ControlPolicyCreateWithoutControlInput[] | Prisma.ControlPolicyUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlPolicyCreateOrConnectWithoutControlInput | Prisma.ControlPolicyCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.ControlPolicyCreateManyControlInputEnvelope;
    connect?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
};
export type ControlPolicyUncheckedCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.ControlPolicyCreateWithoutControlInput, Prisma.ControlPolicyUncheckedCreateWithoutControlInput> | Prisma.ControlPolicyCreateWithoutControlInput[] | Prisma.ControlPolicyUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlPolicyCreateOrConnectWithoutControlInput | Prisma.ControlPolicyCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.ControlPolicyCreateManyControlInputEnvelope;
    connect?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
};
export type ControlPolicyUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.ControlPolicyCreateWithoutControlInput, Prisma.ControlPolicyUncheckedCreateWithoutControlInput> | Prisma.ControlPolicyCreateWithoutControlInput[] | Prisma.ControlPolicyUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlPolicyCreateOrConnectWithoutControlInput | Prisma.ControlPolicyCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.ControlPolicyUpsertWithWhereUniqueWithoutControlInput | Prisma.ControlPolicyUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.ControlPolicyCreateManyControlInputEnvelope;
    set?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    disconnect?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    delete?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    connect?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    update?: Prisma.ControlPolicyUpdateWithWhereUniqueWithoutControlInput | Prisma.ControlPolicyUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.ControlPolicyUpdateManyWithWhereWithoutControlInput | Prisma.ControlPolicyUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.ControlPolicyScalarWhereInput | Prisma.ControlPolicyScalarWhereInput[];
};
export type ControlPolicyUncheckedUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.ControlPolicyCreateWithoutControlInput, Prisma.ControlPolicyUncheckedCreateWithoutControlInput> | Prisma.ControlPolicyCreateWithoutControlInput[] | Prisma.ControlPolicyUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlPolicyCreateOrConnectWithoutControlInput | Prisma.ControlPolicyCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.ControlPolicyUpsertWithWhereUniqueWithoutControlInput | Prisma.ControlPolicyUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.ControlPolicyCreateManyControlInputEnvelope;
    set?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    disconnect?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    delete?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    connect?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    update?: Prisma.ControlPolicyUpdateWithWhereUniqueWithoutControlInput | Prisma.ControlPolicyUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.ControlPolicyUpdateManyWithWhereWithoutControlInput | Prisma.ControlPolicyUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.ControlPolicyScalarWhereInput | Prisma.ControlPolicyScalarWhereInput[];
};
export type ControlPolicyCreateNestedManyWithoutPolicyInput = {
    create?: Prisma.XOR<Prisma.ControlPolicyCreateWithoutPolicyInput, Prisma.ControlPolicyUncheckedCreateWithoutPolicyInput> | Prisma.ControlPolicyCreateWithoutPolicyInput[] | Prisma.ControlPolicyUncheckedCreateWithoutPolicyInput[];
    connectOrCreate?: Prisma.ControlPolicyCreateOrConnectWithoutPolicyInput | Prisma.ControlPolicyCreateOrConnectWithoutPolicyInput[];
    createMany?: Prisma.ControlPolicyCreateManyPolicyInputEnvelope;
    connect?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
};
export type ControlPolicyUncheckedCreateNestedManyWithoutPolicyInput = {
    create?: Prisma.XOR<Prisma.ControlPolicyCreateWithoutPolicyInput, Prisma.ControlPolicyUncheckedCreateWithoutPolicyInput> | Prisma.ControlPolicyCreateWithoutPolicyInput[] | Prisma.ControlPolicyUncheckedCreateWithoutPolicyInput[];
    connectOrCreate?: Prisma.ControlPolicyCreateOrConnectWithoutPolicyInput | Prisma.ControlPolicyCreateOrConnectWithoutPolicyInput[];
    createMany?: Prisma.ControlPolicyCreateManyPolicyInputEnvelope;
    connect?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
};
export type ControlPolicyUpdateManyWithoutPolicyNestedInput = {
    create?: Prisma.XOR<Prisma.ControlPolicyCreateWithoutPolicyInput, Prisma.ControlPolicyUncheckedCreateWithoutPolicyInput> | Prisma.ControlPolicyCreateWithoutPolicyInput[] | Prisma.ControlPolicyUncheckedCreateWithoutPolicyInput[];
    connectOrCreate?: Prisma.ControlPolicyCreateOrConnectWithoutPolicyInput | Prisma.ControlPolicyCreateOrConnectWithoutPolicyInput[];
    upsert?: Prisma.ControlPolicyUpsertWithWhereUniqueWithoutPolicyInput | Prisma.ControlPolicyUpsertWithWhereUniqueWithoutPolicyInput[];
    createMany?: Prisma.ControlPolicyCreateManyPolicyInputEnvelope;
    set?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    disconnect?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    delete?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    connect?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    update?: Prisma.ControlPolicyUpdateWithWhereUniqueWithoutPolicyInput | Prisma.ControlPolicyUpdateWithWhereUniqueWithoutPolicyInput[];
    updateMany?: Prisma.ControlPolicyUpdateManyWithWhereWithoutPolicyInput | Prisma.ControlPolicyUpdateManyWithWhereWithoutPolicyInput[];
    deleteMany?: Prisma.ControlPolicyScalarWhereInput | Prisma.ControlPolicyScalarWhereInput[];
};
export type ControlPolicyUncheckedUpdateManyWithoutPolicyNestedInput = {
    create?: Prisma.XOR<Prisma.ControlPolicyCreateWithoutPolicyInput, Prisma.ControlPolicyUncheckedCreateWithoutPolicyInput> | Prisma.ControlPolicyCreateWithoutPolicyInput[] | Prisma.ControlPolicyUncheckedCreateWithoutPolicyInput[];
    connectOrCreate?: Prisma.ControlPolicyCreateOrConnectWithoutPolicyInput | Prisma.ControlPolicyCreateOrConnectWithoutPolicyInput[];
    upsert?: Prisma.ControlPolicyUpsertWithWhereUniqueWithoutPolicyInput | Prisma.ControlPolicyUpsertWithWhereUniqueWithoutPolicyInput[];
    createMany?: Prisma.ControlPolicyCreateManyPolicyInputEnvelope;
    set?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    disconnect?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    delete?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    connect?: Prisma.ControlPolicyWhereUniqueInput | Prisma.ControlPolicyWhereUniqueInput[];
    update?: Prisma.ControlPolicyUpdateWithWhereUniqueWithoutPolicyInput | Prisma.ControlPolicyUpdateWithWhereUniqueWithoutPolicyInput[];
    updateMany?: Prisma.ControlPolicyUpdateManyWithWhereWithoutPolicyInput | Prisma.ControlPolicyUpdateManyWithWhereWithoutPolicyInput[];
    deleteMany?: Prisma.ControlPolicyScalarWhereInput | Prisma.ControlPolicyScalarWhereInput[];
};
export type ControlPolicyCreateWithoutControlInput = {
    id?: string;
    policy: Prisma.PolicyCreateNestedOneWithoutControlPoliciesInput;
};
export type ControlPolicyUncheckedCreateWithoutControlInput = {
    id?: string;
    policyId: string;
};
export type ControlPolicyCreateOrConnectWithoutControlInput = {
    where: Prisma.ControlPolicyWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlPolicyCreateWithoutControlInput, Prisma.ControlPolicyUncheckedCreateWithoutControlInput>;
};
export type ControlPolicyCreateManyControlInputEnvelope = {
    data: Prisma.ControlPolicyCreateManyControlInput | Prisma.ControlPolicyCreateManyControlInput[];
    skipDuplicates?: boolean;
};
export type ControlPolicyUpsertWithWhereUniqueWithoutControlInput = {
    where: Prisma.ControlPolicyWhereUniqueInput;
    update: Prisma.XOR<Prisma.ControlPolicyUpdateWithoutControlInput, Prisma.ControlPolicyUncheckedUpdateWithoutControlInput>;
    create: Prisma.XOR<Prisma.ControlPolicyCreateWithoutControlInput, Prisma.ControlPolicyUncheckedCreateWithoutControlInput>;
};
export type ControlPolicyUpdateWithWhereUniqueWithoutControlInput = {
    where: Prisma.ControlPolicyWhereUniqueInput;
    data: Prisma.XOR<Prisma.ControlPolicyUpdateWithoutControlInput, Prisma.ControlPolicyUncheckedUpdateWithoutControlInput>;
};
export type ControlPolicyUpdateManyWithWhereWithoutControlInput = {
    where: Prisma.ControlPolicyScalarWhereInput;
    data: Prisma.XOR<Prisma.ControlPolicyUpdateManyMutationInput, Prisma.ControlPolicyUncheckedUpdateManyWithoutControlInput>;
};
export type ControlPolicyScalarWhereInput = {
    AND?: Prisma.ControlPolicyScalarWhereInput | Prisma.ControlPolicyScalarWhereInput[];
    OR?: Prisma.ControlPolicyScalarWhereInput[];
    NOT?: Prisma.ControlPolicyScalarWhereInput | Prisma.ControlPolicyScalarWhereInput[];
    id?: Prisma.UuidFilter<"ControlPolicy"> | string;
    controlId?: Prisma.UuidFilter<"ControlPolicy"> | string;
    policyId?: Prisma.UuidFilter<"ControlPolicy"> | string;
};
export type ControlPolicyCreateWithoutPolicyInput = {
    id?: string;
    control: Prisma.ControlCreateNestedOneWithoutControlPoliciesInput;
};
export type ControlPolicyUncheckedCreateWithoutPolicyInput = {
    id?: string;
    controlId: string;
};
export type ControlPolicyCreateOrConnectWithoutPolicyInput = {
    where: Prisma.ControlPolicyWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlPolicyCreateWithoutPolicyInput, Prisma.ControlPolicyUncheckedCreateWithoutPolicyInput>;
};
export type ControlPolicyCreateManyPolicyInputEnvelope = {
    data: Prisma.ControlPolicyCreateManyPolicyInput | Prisma.ControlPolicyCreateManyPolicyInput[];
    skipDuplicates?: boolean;
};
export type ControlPolicyUpsertWithWhereUniqueWithoutPolicyInput = {
    where: Prisma.ControlPolicyWhereUniqueInput;
    update: Prisma.XOR<Prisma.ControlPolicyUpdateWithoutPolicyInput, Prisma.ControlPolicyUncheckedUpdateWithoutPolicyInput>;
    create: Prisma.XOR<Prisma.ControlPolicyCreateWithoutPolicyInput, Prisma.ControlPolicyUncheckedCreateWithoutPolicyInput>;
};
export type ControlPolicyUpdateWithWhereUniqueWithoutPolicyInput = {
    where: Prisma.ControlPolicyWhereUniqueInput;
    data: Prisma.XOR<Prisma.ControlPolicyUpdateWithoutPolicyInput, Prisma.ControlPolicyUncheckedUpdateWithoutPolicyInput>;
};
export type ControlPolicyUpdateManyWithWhereWithoutPolicyInput = {
    where: Prisma.ControlPolicyScalarWhereInput;
    data: Prisma.XOR<Prisma.ControlPolicyUpdateManyMutationInput, Prisma.ControlPolicyUncheckedUpdateManyWithoutPolicyInput>;
};
export type ControlPolicyCreateManyControlInput = {
    id?: string;
    policyId: string;
};
export type ControlPolicyUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    policy?: Prisma.PolicyUpdateOneRequiredWithoutControlPoliciesNestedInput;
};
export type ControlPolicyUncheckedUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlPolicyUncheckedUpdateManyWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlPolicyCreateManyPolicyInput = {
    id?: string;
    controlId: string;
};
export type ControlPolicyUpdateWithoutPolicyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    control?: Prisma.ControlUpdateOneRequiredWithoutControlPoliciesNestedInput;
};
export type ControlPolicyUncheckedUpdateWithoutPolicyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlPolicyUncheckedUpdateManyWithoutPolicyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlPolicySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    policyId?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    policy?: boolean | Prisma.PolicyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlPolicy"]>;
export type ControlPolicySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    policyId?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    policy?: boolean | Prisma.PolicyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlPolicy"]>;
export type ControlPolicySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    policyId?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    policy?: boolean | Prisma.PolicyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlPolicy"]>;
export type ControlPolicySelectScalar = {
    id?: boolean;
    controlId?: boolean;
    policyId?: boolean;
};
export type ControlPolicyOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "controlId" | "policyId", ExtArgs["result"]["controlPolicy"]>;
export type ControlPolicyInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    policy?: boolean | Prisma.PolicyDefaultArgs<ExtArgs>;
};
export type ControlPolicyIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    policy?: boolean | Prisma.PolicyDefaultArgs<ExtArgs>;
};
export type ControlPolicyIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    policy?: boolean | Prisma.PolicyDefaultArgs<ExtArgs>;
};
export type $ControlPolicyPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ControlPolicy";
    objects: {
        control: Prisma.$ControlPayload<ExtArgs>;
        policy: Prisma.$PolicyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        controlId: string;
        policyId: string;
    }, ExtArgs["result"]["controlPolicy"]>;
    composites: {};
};
export type ControlPolicyGetPayload<S extends boolean | null | undefined | ControlPolicyDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ControlPolicyPayload, S>;
export type ControlPolicyCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ControlPolicyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ControlPolicyCountAggregateInputType | true;
};
export interface ControlPolicyDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ControlPolicy'];
        meta: {
            name: 'ControlPolicy';
        };
    };
    findUnique<T extends ControlPolicyFindUniqueArgs>(args: Prisma.SelectSubset<T, ControlPolicyFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ControlPolicyClient<runtime.Types.Result.GetResult<Prisma.$ControlPolicyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ControlPolicyFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ControlPolicyFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ControlPolicyClient<runtime.Types.Result.GetResult<Prisma.$ControlPolicyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ControlPolicyFindFirstArgs>(args?: Prisma.SelectSubset<T, ControlPolicyFindFirstArgs<ExtArgs>>): Prisma.Prisma__ControlPolicyClient<runtime.Types.Result.GetResult<Prisma.$ControlPolicyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ControlPolicyFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ControlPolicyFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ControlPolicyClient<runtime.Types.Result.GetResult<Prisma.$ControlPolicyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ControlPolicyFindManyArgs>(args?: Prisma.SelectSubset<T, ControlPolicyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlPolicyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ControlPolicyCreateArgs>(args: Prisma.SelectSubset<T, ControlPolicyCreateArgs<ExtArgs>>): Prisma.Prisma__ControlPolicyClient<runtime.Types.Result.GetResult<Prisma.$ControlPolicyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ControlPolicyCreateManyArgs>(args?: Prisma.SelectSubset<T, ControlPolicyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ControlPolicyCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ControlPolicyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlPolicyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ControlPolicyDeleteArgs>(args: Prisma.SelectSubset<T, ControlPolicyDeleteArgs<ExtArgs>>): Prisma.Prisma__ControlPolicyClient<runtime.Types.Result.GetResult<Prisma.$ControlPolicyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ControlPolicyUpdateArgs>(args: Prisma.SelectSubset<T, ControlPolicyUpdateArgs<ExtArgs>>): Prisma.Prisma__ControlPolicyClient<runtime.Types.Result.GetResult<Prisma.$ControlPolicyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ControlPolicyDeleteManyArgs>(args?: Prisma.SelectSubset<T, ControlPolicyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ControlPolicyUpdateManyArgs>(args: Prisma.SelectSubset<T, ControlPolicyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ControlPolicyUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ControlPolicyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlPolicyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ControlPolicyUpsertArgs>(args: Prisma.SelectSubset<T, ControlPolicyUpsertArgs<ExtArgs>>): Prisma.Prisma__ControlPolicyClient<runtime.Types.Result.GetResult<Prisma.$ControlPolicyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ControlPolicyCountArgs>(args?: Prisma.Subset<T, ControlPolicyCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ControlPolicyCountAggregateOutputType> : number>;
    aggregate<T extends ControlPolicyAggregateArgs>(args: Prisma.Subset<T, ControlPolicyAggregateArgs>): Prisma.PrismaPromise<GetControlPolicyAggregateType<T>>;
    groupBy<T extends ControlPolicyGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ControlPolicyGroupByArgs['orderBy'];
    } : {
        orderBy?: ControlPolicyGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ControlPolicyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetControlPolicyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ControlPolicyFieldRefs;
}
export interface Prisma__ControlPolicyClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    control<T extends Prisma.ControlDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ControlDefaultArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    policy<T extends Prisma.PolicyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PolicyDefaultArgs<ExtArgs>>): Prisma.Prisma__PolicyClient<runtime.Types.Result.GetResult<Prisma.$PolicyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ControlPolicyFieldRefs {
    readonly id: Prisma.FieldRef<"ControlPolicy", 'String'>;
    readonly controlId: Prisma.FieldRef<"ControlPolicy", 'String'>;
    readonly policyId: Prisma.FieldRef<"ControlPolicy", 'String'>;
}
export type ControlPolicyFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlPolicySelect<ExtArgs> | null;
    omit?: Prisma.ControlPolicyOmit<ExtArgs> | null;
    include?: Prisma.ControlPolicyInclude<ExtArgs> | null;
    where: Prisma.ControlPolicyWhereUniqueInput;
};
export type ControlPolicyFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlPolicySelect<ExtArgs> | null;
    omit?: Prisma.ControlPolicyOmit<ExtArgs> | null;
    include?: Prisma.ControlPolicyInclude<ExtArgs> | null;
    where: Prisma.ControlPolicyWhereUniqueInput;
};
export type ControlPolicyFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ControlPolicyFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ControlPolicyFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ControlPolicyCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlPolicySelect<ExtArgs> | null;
    omit?: Prisma.ControlPolicyOmit<ExtArgs> | null;
    include?: Prisma.ControlPolicyInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlPolicyCreateInput, Prisma.ControlPolicyUncheckedCreateInput>;
};
export type ControlPolicyCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ControlPolicyCreateManyInput | Prisma.ControlPolicyCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ControlPolicyCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlPolicySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ControlPolicyOmit<ExtArgs> | null;
    data: Prisma.ControlPolicyCreateManyInput | Prisma.ControlPolicyCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ControlPolicyIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ControlPolicyUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlPolicySelect<ExtArgs> | null;
    omit?: Prisma.ControlPolicyOmit<ExtArgs> | null;
    include?: Prisma.ControlPolicyInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlPolicyUpdateInput, Prisma.ControlPolicyUncheckedUpdateInput>;
    where: Prisma.ControlPolicyWhereUniqueInput;
};
export type ControlPolicyUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ControlPolicyUpdateManyMutationInput, Prisma.ControlPolicyUncheckedUpdateManyInput>;
    where?: Prisma.ControlPolicyWhereInput;
    limit?: number;
};
export type ControlPolicyUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlPolicySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ControlPolicyOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlPolicyUpdateManyMutationInput, Prisma.ControlPolicyUncheckedUpdateManyInput>;
    where?: Prisma.ControlPolicyWhereInput;
    limit?: number;
    include?: Prisma.ControlPolicyIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ControlPolicyUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlPolicySelect<ExtArgs> | null;
    omit?: Prisma.ControlPolicyOmit<ExtArgs> | null;
    include?: Prisma.ControlPolicyInclude<ExtArgs> | null;
    where: Prisma.ControlPolicyWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlPolicyCreateInput, Prisma.ControlPolicyUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ControlPolicyUpdateInput, Prisma.ControlPolicyUncheckedUpdateInput>;
};
export type ControlPolicyDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlPolicySelect<ExtArgs> | null;
    omit?: Prisma.ControlPolicyOmit<ExtArgs> | null;
    include?: Prisma.ControlPolicyInclude<ExtArgs> | null;
    where: Prisma.ControlPolicyWhereUniqueInput;
};
export type ControlPolicyDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlPolicyWhereInput;
    limit?: number;
};
export type ControlPolicyDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlPolicySelect<ExtArgs> | null;
    omit?: Prisma.ControlPolicyOmit<ExtArgs> | null;
    include?: Prisma.ControlPolicyInclude<ExtArgs> | null;
};
export {};
