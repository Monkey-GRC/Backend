import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type PointOfFocusModel = runtime.Types.Result.DefaultSelection<Prisma.$PointOfFocusPayload>;
export type AggregatePointOfFocus = {
    _count: PointOfFocusCountAggregateOutputType | null;
    _avg: PointOfFocusAvgAggregateOutputType | null;
    _sum: PointOfFocusSumAggregateOutputType | null;
    _min: PointOfFocusMinAggregateOutputType | null;
    _max: PointOfFocusMaxAggregateOutputType | null;
};
export type PointOfFocusAvgAggregateOutputType = {
    number: number | null;
};
export type PointOfFocusSumAggregateOutputType = {
    number: number | null;
};
export type PointOfFocusMinAggregateOutputType = {
    id: string | null;
    requirementId: string | null;
    number: number | null;
    description: string | null;
};
export type PointOfFocusMaxAggregateOutputType = {
    id: string | null;
    requirementId: string | null;
    number: number | null;
    description: string | null;
};
export type PointOfFocusCountAggregateOutputType = {
    id: number;
    requirementId: number;
    number: number;
    description: number;
    _all: number;
};
export type PointOfFocusAvgAggregateInputType = {
    number?: true;
};
export type PointOfFocusSumAggregateInputType = {
    number?: true;
};
export type PointOfFocusMinAggregateInputType = {
    id?: true;
    requirementId?: true;
    number?: true;
    description?: true;
};
export type PointOfFocusMaxAggregateInputType = {
    id?: true;
    requirementId?: true;
    number?: true;
    description?: true;
};
export type PointOfFocusCountAggregateInputType = {
    id?: true;
    requirementId?: true;
    number?: true;
    description?: true;
    _all?: true;
};
export type PointOfFocusAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PointOfFocusWhereInput;
    orderBy?: Prisma.PointOfFocusOrderByWithRelationInput | Prisma.PointOfFocusOrderByWithRelationInput[];
    cursor?: Prisma.PointOfFocusWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | PointOfFocusCountAggregateInputType;
    _avg?: PointOfFocusAvgAggregateInputType;
    _sum?: PointOfFocusSumAggregateInputType;
    _min?: PointOfFocusMinAggregateInputType;
    _max?: PointOfFocusMaxAggregateInputType;
};
export type GetPointOfFocusAggregateType<T extends PointOfFocusAggregateArgs> = {
    [P in keyof T & keyof AggregatePointOfFocus]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePointOfFocus[P]> : Prisma.GetScalarType<T[P], AggregatePointOfFocus[P]>;
};
export type PointOfFocusGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PointOfFocusWhereInput;
    orderBy?: Prisma.PointOfFocusOrderByWithAggregationInput | Prisma.PointOfFocusOrderByWithAggregationInput[];
    by: Prisma.PointOfFocusScalarFieldEnum[] | Prisma.PointOfFocusScalarFieldEnum;
    having?: Prisma.PointOfFocusScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PointOfFocusCountAggregateInputType | true;
    _avg?: PointOfFocusAvgAggregateInputType;
    _sum?: PointOfFocusSumAggregateInputType;
    _min?: PointOfFocusMinAggregateInputType;
    _max?: PointOfFocusMaxAggregateInputType;
};
export type PointOfFocusGroupByOutputType = {
    id: string;
    requirementId: string;
    number: number;
    description: string;
    _count: PointOfFocusCountAggregateOutputType | null;
    _avg: PointOfFocusAvgAggregateOutputType | null;
    _sum: PointOfFocusSumAggregateOutputType | null;
    _min: PointOfFocusMinAggregateOutputType | null;
    _max: PointOfFocusMaxAggregateOutputType | null;
};
type GetPointOfFocusGroupByPayload<T extends PointOfFocusGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PointOfFocusGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PointOfFocusGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PointOfFocusGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PointOfFocusGroupByOutputType[P]>;
}>>;
export type PointOfFocusWhereInput = {
    AND?: Prisma.PointOfFocusWhereInput | Prisma.PointOfFocusWhereInput[];
    OR?: Prisma.PointOfFocusWhereInput[];
    NOT?: Prisma.PointOfFocusWhereInput | Prisma.PointOfFocusWhereInput[];
    id?: Prisma.UuidFilter<"PointOfFocus"> | string;
    requirementId?: Prisma.UuidFilter<"PointOfFocus"> | string;
    number?: Prisma.IntFilter<"PointOfFocus"> | number;
    description?: Prisma.StringFilter<"PointOfFocus"> | string;
    pointOfFocusControls?: Prisma.PointOfFocusControlListRelationFilter;
    requirement?: Prisma.XOR<Prisma.RequirementScalarRelationFilter, Prisma.RequirementWhereInput>;
};
export type PointOfFocusOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    requirementId?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    pointOfFocusControls?: Prisma.PointOfFocusControlOrderByRelationAggregateInput;
    requirement?: Prisma.RequirementOrderByWithRelationInput;
};
export type PointOfFocusWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    requirementId_number?: Prisma.PointOfFocusRequirementIdNumberCompoundUniqueInput;
    AND?: Prisma.PointOfFocusWhereInput | Prisma.PointOfFocusWhereInput[];
    OR?: Prisma.PointOfFocusWhereInput[];
    NOT?: Prisma.PointOfFocusWhereInput | Prisma.PointOfFocusWhereInput[];
    requirementId?: Prisma.UuidFilter<"PointOfFocus"> | string;
    number?: Prisma.IntFilter<"PointOfFocus"> | number;
    description?: Prisma.StringFilter<"PointOfFocus"> | string;
    pointOfFocusControls?: Prisma.PointOfFocusControlListRelationFilter;
    requirement?: Prisma.XOR<Prisma.RequirementScalarRelationFilter, Prisma.RequirementWhereInput>;
}, "id" | "requirementId_number">;
export type PointOfFocusOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    requirementId?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    _count?: Prisma.PointOfFocusCountOrderByAggregateInput;
    _avg?: Prisma.PointOfFocusAvgOrderByAggregateInput;
    _max?: Prisma.PointOfFocusMaxOrderByAggregateInput;
    _min?: Prisma.PointOfFocusMinOrderByAggregateInput;
    _sum?: Prisma.PointOfFocusSumOrderByAggregateInput;
};
export type PointOfFocusScalarWhereWithAggregatesInput = {
    AND?: Prisma.PointOfFocusScalarWhereWithAggregatesInput | Prisma.PointOfFocusScalarWhereWithAggregatesInput[];
    OR?: Prisma.PointOfFocusScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PointOfFocusScalarWhereWithAggregatesInput | Prisma.PointOfFocusScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"PointOfFocus"> | string;
    requirementId?: Prisma.UuidWithAggregatesFilter<"PointOfFocus"> | string;
    number?: Prisma.IntWithAggregatesFilter<"PointOfFocus"> | number;
    description?: Prisma.StringWithAggregatesFilter<"PointOfFocus"> | string;
};
export type PointOfFocusCreateInput = {
    id?: string;
    number: number;
    description: string;
    pointOfFocusControls?: Prisma.PointOfFocusControlCreateNestedManyWithoutPointOfFocusInput;
    requirement: Prisma.RequirementCreateNestedOneWithoutPointsOfFocusInput;
};
export type PointOfFocusUncheckedCreateInput = {
    id?: string;
    requirementId: string;
    number: number;
    description: string;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedCreateNestedManyWithoutPointOfFocusInput;
};
export type PointOfFocusUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    pointOfFocusControls?: Prisma.PointOfFocusControlUpdateManyWithoutPointOfFocusNestedInput;
    requirement?: Prisma.RequirementUpdateOneRequiredWithoutPointsOfFocusNestedInput;
};
export type PointOfFocusUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    requirementId?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedUpdateManyWithoutPointOfFocusNestedInput;
};
export type PointOfFocusCreateManyInput = {
    id?: string;
    requirementId: string;
    number: number;
    description: string;
};
export type PointOfFocusUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PointOfFocusUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    requirementId?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PointOfFocusScalarRelationFilter = {
    is?: Prisma.PointOfFocusWhereInput;
    isNot?: Prisma.PointOfFocusWhereInput;
};
export type PointOfFocusListRelationFilter = {
    every?: Prisma.PointOfFocusWhereInput;
    some?: Prisma.PointOfFocusWhereInput;
    none?: Prisma.PointOfFocusWhereInput;
};
export type PointOfFocusOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type PointOfFocusRequirementIdNumberCompoundUniqueInput = {
    requirementId: string;
    number: number;
};
export type PointOfFocusCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    requirementId?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
};
export type PointOfFocusAvgOrderByAggregateInput = {
    number?: Prisma.SortOrder;
};
export type PointOfFocusMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    requirementId?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
};
export type PointOfFocusMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    requirementId?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
};
export type PointOfFocusSumOrderByAggregateInput = {
    number?: Prisma.SortOrder;
};
export type PointOfFocusCreateNestedOneWithoutPointOfFocusControlsInput = {
    create?: Prisma.XOR<Prisma.PointOfFocusCreateWithoutPointOfFocusControlsInput, Prisma.PointOfFocusUncheckedCreateWithoutPointOfFocusControlsInput>;
    connectOrCreate?: Prisma.PointOfFocusCreateOrConnectWithoutPointOfFocusControlsInput;
    connect?: Prisma.PointOfFocusWhereUniqueInput;
};
export type PointOfFocusUpdateOneRequiredWithoutPointOfFocusControlsNestedInput = {
    create?: Prisma.XOR<Prisma.PointOfFocusCreateWithoutPointOfFocusControlsInput, Prisma.PointOfFocusUncheckedCreateWithoutPointOfFocusControlsInput>;
    connectOrCreate?: Prisma.PointOfFocusCreateOrConnectWithoutPointOfFocusControlsInput;
    upsert?: Prisma.PointOfFocusUpsertWithoutPointOfFocusControlsInput;
    connect?: Prisma.PointOfFocusWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PointOfFocusUpdateToOneWithWhereWithoutPointOfFocusControlsInput, Prisma.PointOfFocusUpdateWithoutPointOfFocusControlsInput>, Prisma.PointOfFocusUncheckedUpdateWithoutPointOfFocusControlsInput>;
};
export type PointOfFocusCreateNestedManyWithoutRequirementInput = {
    create?: Prisma.XOR<Prisma.PointOfFocusCreateWithoutRequirementInput, Prisma.PointOfFocusUncheckedCreateWithoutRequirementInput> | Prisma.PointOfFocusCreateWithoutRequirementInput[] | Prisma.PointOfFocusUncheckedCreateWithoutRequirementInput[];
    connectOrCreate?: Prisma.PointOfFocusCreateOrConnectWithoutRequirementInput | Prisma.PointOfFocusCreateOrConnectWithoutRequirementInput[];
    createMany?: Prisma.PointOfFocusCreateManyRequirementInputEnvelope;
    connect?: Prisma.PointOfFocusWhereUniqueInput | Prisma.PointOfFocusWhereUniqueInput[];
};
export type PointOfFocusUncheckedCreateNestedManyWithoutRequirementInput = {
    create?: Prisma.XOR<Prisma.PointOfFocusCreateWithoutRequirementInput, Prisma.PointOfFocusUncheckedCreateWithoutRequirementInput> | Prisma.PointOfFocusCreateWithoutRequirementInput[] | Prisma.PointOfFocusUncheckedCreateWithoutRequirementInput[];
    connectOrCreate?: Prisma.PointOfFocusCreateOrConnectWithoutRequirementInput | Prisma.PointOfFocusCreateOrConnectWithoutRequirementInput[];
    createMany?: Prisma.PointOfFocusCreateManyRequirementInputEnvelope;
    connect?: Prisma.PointOfFocusWhereUniqueInput | Prisma.PointOfFocusWhereUniqueInput[];
};
export type PointOfFocusUpdateManyWithoutRequirementNestedInput = {
    create?: Prisma.XOR<Prisma.PointOfFocusCreateWithoutRequirementInput, Prisma.PointOfFocusUncheckedCreateWithoutRequirementInput> | Prisma.PointOfFocusCreateWithoutRequirementInput[] | Prisma.PointOfFocusUncheckedCreateWithoutRequirementInput[];
    connectOrCreate?: Prisma.PointOfFocusCreateOrConnectWithoutRequirementInput | Prisma.PointOfFocusCreateOrConnectWithoutRequirementInput[];
    upsert?: Prisma.PointOfFocusUpsertWithWhereUniqueWithoutRequirementInput | Prisma.PointOfFocusUpsertWithWhereUniqueWithoutRequirementInput[];
    createMany?: Prisma.PointOfFocusCreateManyRequirementInputEnvelope;
    set?: Prisma.PointOfFocusWhereUniqueInput | Prisma.PointOfFocusWhereUniqueInput[];
    disconnect?: Prisma.PointOfFocusWhereUniqueInput | Prisma.PointOfFocusWhereUniqueInput[];
    delete?: Prisma.PointOfFocusWhereUniqueInput | Prisma.PointOfFocusWhereUniqueInput[];
    connect?: Prisma.PointOfFocusWhereUniqueInput | Prisma.PointOfFocusWhereUniqueInput[];
    update?: Prisma.PointOfFocusUpdateWithWhereUniqueWithoutRequirementInput | Prisma.PointOfFocusUpdateWithWhereUniqueWithoutRequirementInput[];
    updateMany?: Prisma.PointOfFocusUpdateManyWithWhereWithoutRequirementInput | Prisma.PointOfFocusUpdateManyWithWhereWithoutRequirementInput[];
    deleteMany?: Prisma.PointOfFocusScalarWhereInput | Prisma.PointOfFocusScalarWhereInput[];
};
export type PointOfFocusUncheckedUpdateManyWithoutRequirementNestedInput = {
    create?: Prisma.XOR<Prisma.PointOfFocusCreateWithoutRequirementInput, Prisma.PointOfFocusUncheckedCreateWithoutRequirementInput> | Prisma.PointOfFocusCreateWithoutRequirementInput[] | Prisma.PointOfFocusUncheckedCreateWithoutRequirementInput[];
    connectOrCreate?: Prisma.PointOfFocusCreateOrConnectWithoutRequirementInput | Prisma.PointOfFocusCreateOrConnectWithoutRequirementInput[];
    upsert?: Prisma.PointOfFocusUpsertWithWhereUniqueWithoutRequirementInput | Prisma.PointOfFocusUpsertWithWhereUniqueWithoutRequirementInput[];
    createMany?: Prisma.PointOfFocusCreateManyRequirementInputEnvelope;
    set?: Prisma.PointOfFocusWhereUniqueInput | Prisma.PointOfFocusWhereUniqueInput[];
    disconnect?: Prisma.PointOfFocusWhereUniqueInput | Prisma.PointOfFocusWhereUniqueInput[];
    delete?: Prisma.PointOfFocusWhereUniqueInput | Prisma.PointOfFocusWhereUniqueInput[];
    connect?: Prisma.PointOfFocusWhereUniqueInput | Prisma.PointOfFocusWhereUniqueInput[];
    update?: Prisma.PointOfFocusUpdateWithWhereUniqueWithoutRequirementInput | Prisma.PointOfFocusUpdateWithWhereUniqueWithoutRequirementInput[];
    updateMany?: Prisma.PointOfFocusUpdateManyWithWhereWithoutRequirementInput | Prisma.PointOfFocusUpdateManyWithWhereWithoutRequirementInput[];
    deleteMany?: Prisma.PointOfFocusScalarWhereInput | Prisma.PointOfFocusScalarWhereInput[];
};
export type PointOfFocusCreateWithoutPointOfFocusControlsInput = {
    id?: string;
    number: number;
    description: string;
    requirement: Prisma.RequirementCreateNestedOneWithoutPointsOfFocusInput;
};
export type PointOfFocusUncheckedCreateWithoutPointOfFocusControlsInput = {
    id?: string;
    requirementId: string;
    number: number;
    description: string;
};
export type PointOfFocusCreateOrConnectWithoutPointOfFocusControlsInput = {
    where: Prisma.PointOfFocusWhereUniqueInput;
    create: Prisma.XOR<Prisma.PointOfFocusCreateWithoutPointOfFocusControlsInput, Prisma.PointOfFocusUncheckedCreateWithoutPointOfFocusControlsInput>;
};
export type PointOfFocusUpsertWithoutPointOfFocusControlsInput = {
    update: Prisma.XOR<Prisma.PointOfFocusUpdateWithoutPointOfFocusControlsInput, Prisma.PointOfFocusUncheckedUpdateWithoutPointOfFocusControlsInput>;
    create: Prisma.XOR<Prisma.PointOfFocusCreateWithoutPointOfFocusControlsInput, Prisma.PointOfFocusUncheckedCreateWithoutPointOfFocusControlsInput>;
    where?: Prisma.PointOfFocusWhereInput;
};
export type PointOfFocusUpdateToOneWithWhereWithoutPointOfFocusControlsInput = {
    where?: Prisma.PointOfFocusWhereInput;
    data: Prisma.XOR<Prisma.PointOfFocusUpdateWithoutPointOfFocusControlsInput, Prisma.PointOfFocusUncheckedUpdateWithoutPointOfFocusControlsInput>;
};
export type PointOfFocusUpdateWithoutPointOfFocusControlsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    requirement?: Prisma.RequirementUpdateOneRequiredWithoutPointsOfFocusNestedInput;
};
export type PointOfFocusUncheckedUpdateWithoutPointOfFocusControlsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    requirementId?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PointOfFocusCreateWithoutRequirementInput = {
    id?: string;
    number: number;
    description: string;
    pointOfFocusControls?: Prisma.PointOfFocusControlCreateNestedManyWithoutPointOfFocusInput;
};
export type PointOfFocusUncheckedCreateWithoutRequirementInput = {
    id?: string;
    number: number;
    description: string;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedCreateNestedManyWithoutPointOfFocusInput;
};
export type PointOfFocusCreateOrConnectWithoutRequirementInput = {
    where: Prisma.PointOfFocusWhereUniqueInput;
    create: Prisma.XOR<Prisma.PointOfFocusCreateWithoutRequirementInput, Prisma.PointOfFocusUncheckedCreateWithoutRequirementInput>;
};
export type PointOfFocusCreateManyRequirementInputEnvelope = {
    data: Prisma.PointOfFocusCreateManyRequirementInput | Prisma.PointOfFocusCreateManyRequirementInput[];
    skipDuplicates?: boolean;
};
export type PointOfFocusUpsertWithWhereUniqueWithoutRequirementInput = {
    where: Prisma.PointOfFocusWhereUniqueInput;
    update: Prisma.XOR<Prisma.PointOfFocusUpdateWithoutRequirementInput, Prisma.PointOfFocusUncheckedUpdateWithoutRequirementInput>;
    create: Prisma.XOR<Prisma.PointOfFocusCreateWithoutRequirementInput, Prisma.PointOfFocusUncheckedCreateWithoutRequirementInput>;
};
export type PointOfFocusUpdateWithWhereUniqueWithoutRequirementInput = {
    where: Prisma.PointOfFocusWhereUniqueInput;
    data: Prisma.XOR<Prisma.PointOfFocusUpdateWithoutRequirementInput, Prisma.PointOfFocusUncheckedUpdateWithoutRequirementInput>;
};
export type PointOfFocusUpdateManyWithWhereWithoutRequirementInput = {
    where: Prisma.PointOfFocusScalarWhereInput;
    data: Prisma.XOR<Prisma.PointOfFocusUpdateManyMutationInput, Prisma.PointOfFocusUncheckedUpdateManyWithoutRequirementInput>;
};
export type PointOfFocusScalarWhereInput = {
    AND?: Prisma.PointOfFocusScalarWhereInput | Prisma.PointOfFocusScalarWhereInput[];
    OR?: Prisma.PointOfFocusScalarWhereInput[];
    NOT?: Prisma.PointOfFocusScalarWhereInput | Prisma.PointOfFocusScalarWhereInput[];
    id?: Prisma.UuidFilter<"PointOfFocus"> | string;
    requirementId?: Prisma.UuidFilter<"PointOfFocus"> | string;
    number?: Prisma.IntFilter<"PointOfFocus"> | number;
    description?: Prisma.StringFilter<"PointOfFocus"> | string;
};
export type PointOfFocusCreateManyRequirementInput = {
    id?: string;
    number: number;
    description: string;
};
export type PointOfFocusUpdateWithoutRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    pointOfFocusControls?: Prisma.PointOfFocusControlUpdateManyWithoutPointOfFocusNestedInput;
};
export type PointOfFocusUncheckedUpdateWithoutRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedUpdateManyWithoutPointOfFocusNestedInput;
};
export type PointOfFocusUncheckedUpdateManyWithoutRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PointOfFocusCountOutputType = {
    pointOfFocusControls: number;
};
export type PointOfFocusCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    pointOfFocusControls?: boolean | PointOfFocusCountOutputTypeCountPointOfFocusControlsArgs;
};
export type PointOfFocusCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusCountOutputTypeSelect<ExtArgs> | null;
};
export type PointOfFocusCountOutputTypeCountPointOfFocusControlsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PointOfFocusControlWhereInput;
};
export type PointOfFocusSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    requirementId?: boolean;
    number?: boolean;
    description?: boolean;
    pointOfFocusControls?: boolean | Prisma.PointOfFocus$pointOfFocusControlsArgs<ExtArgs>;
    requirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
    _count?: boolean | Prisma.PointOfFocusCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["pointOfFocus"]>;
export type PointOfFocusSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    requirementId?: boolean;
    number?: boolean;
    description?: boolean;
    requirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["pointOfFocus"]>;
export type PointOfFocusSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    requirementId?: boolean;
    number?: boolean;
    description?: boolean;
    requirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["pointOfFocus"]>;
export type PointOfFocusSelectScalar = {
    id?: boolean;
    requirementId?: boolean;
    number?: boolean;
    description?: boolean;
};
export type PointOfFocusOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "requirementId" | "number" | "description", ExtArgs["result"]["pointOfFocus"]>;
export type PointOfFocusInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    pointOfFocusControls?: boolean | Prisma.PointOfFocus$pointOfFocusControlsArgs<ExtArgs>;
    requirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
    _count?: boolean | Prisma.PointOfFocusCountOutputTypeDefaultArgs<ExtArgs>;
};
export type PointOfFocusIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    requirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
};
export type PointOfFocusIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    requirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
};
export type $PointOfFocusPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "PointOfFocus";
    objects: {
        pointOfFocusControls: Prisma.$PointOfFocusControlPayload<ExtArgs>[];
        requirement: Prisma.$RequirementPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        requirementId: string;
        number: number;
        description: string;
    }, ExtArgs["result"]["pointOfFocus"]>;
    composites: {};
};
export type PointOfFocusGetPayload<S extends boolean | null | undefined | PointOfFocusDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PointOfFocusPayload, S>;
export type PointOfFocusCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PointOfFocusFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PointOfFocusCountAggregateInputType | true;
};
export interface PointOfFocusDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['PointOfFocus'];
        meta: {
            name: 'PointOfFocus';
        };
    };
    findUnique<T extends PointOfFocusFindUniqueArgs>(args: Prisma.SelectSubset<T, PointOfFocusFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends PointOfFocusFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PointOfFocusFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends PointOfFocusFindFirstArgs>(args?: Prisma.SelectSubset<T, PointOfFocusFindFirstArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends PointOfFocusFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PointOfFocusFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends PointOfFocusFindManyArgs>(args?: Prisma.SelectSubset<T, PointOfFocusFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PointOfFocusPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends PointOfFocusCreateArgs>(args: Prisma.SelectSubset<T, PointOfFocusCreateArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends PointOfFocusCreateManyArgs>(args?: Prisma.SelectSubset<T, PointOfFocusCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends PointOfFocusCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PointOfFocusCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PointOfFocusPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends PointOfFocusDeleteArgs>(args: Prisma.SelectSubset<T, PointOfFocusDeleteArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends PointOfFocusUpdateArgs>(args: Prisma.SelectSubset<T, PointOfFocusUpdateArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends PointOfFocusDeleteManyArgs>(args?: Prisma.SelectSubset<T, PointOfFocusDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends PointOfFocusUpdateManyArgs>(args: Prisma.SelectSubset<T, PointOfFocusUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends PointOfFocusUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PointOfFocusUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PointOfFocusPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends PointOfFocusUpsertArgs>(args: Prisma.SelectSubset<T, PointOfFocusUpsertArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends PointOfFocusCountArgs>(args?: Prisma.Subset<T, PointOfFocusCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PointOfFocusCountAggregateOutputType> : number>;
    aggregate<T extends PointOfFocusAggregateArgs>(args: Prisma.Subset<T, PointOfFocusAggregateArgs>): Prisma.PrismaPromise<GetPointOfFocusAggregateType<T>>;
    groupBy<T extends PointOfFocusGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PointOfFocusGroupByArgs['orderBy'];
    } : {
        orderBy?: PointOfFocusGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PointOfFocusGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPointOfFocusGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: PointOfFocusFieldRefs;
}
export interface Prisma__PointOfFocusClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    pointOfFocusControls<T extends Prisma.PointOfFocus$pointOfFocusControlsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PointOfFocus$pointOfFocusControlsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PointOfFocusControlPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    requirement<T extends Prisma.RequirementDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RequirementDefaultArgs<ExtArgs>>): Prisma.Prisma__RequirementClient<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface PointOfFocusFieldRefs {
    readonly id: Prisma.FieldRef<"PointOfFocus", 'String'>;
    readonly requirementId: Prisma.FieldRef<"PointOfFocus", 'String'>;
    readonly number: Prisma.FieldRef<"PointOfFocus", 'Int'>;
    readonly description: Prisma.FieldRef<"PointOfFocus", 'String'>;
}
export type PointOfFocusFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusInclude<ExtArgs> | null;
    where: Prisma.PointOfFocusWhereUniqueInput;
};
export type PointOfFocusFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusInclude<ExtArgs> | null;
    where: Prisma.PointOfFocusWhereUniqueInput;
};
export type PointOfFocusFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusInclude<ExtArgs> | null;
    where?: Prisma.PointOfFocusWhereInput;
    orderBy?: Prisma.PointOfFocusOrderByWithRelationInput | Prisma.PointOfFocusOrderByWithRelationInput[];
    cursor?: Prisma.PointOfFocusWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PointOfFocusScalarFieldEnum | Prisma.PointOfFocusScalarFieldEnum[];
};
export type PointOfFocusFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusInclude<ExtArgs> | null;
    where?: Prisma.PointOfFocusWhereInput;
    orderBy?: Prisma.PointOfFocusOrderByWithRelationInput | Prisma.PointOfFocusOrderByWithRelationInput[];
    cursor?: Prisma.PointOfFocusWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PointOfFocusScalarFieldEnum | Prisma.PointOfFocusScalarFieldEnum[];
};
export type PointOfFocusFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusInclude<ExtArgs> | null;
    where?: Prisma.PointOfFocusWhereInput;
    orderBy?: Prisma.PointOfFocusOrderByWithRelationInput | Prisma.PointOfFocusOrderByWithRelationInput[];
    cursor?: Prisma.PointOfFocusWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PointOfFocusScalarFieldEnum | Prisma.PointOfFocusScalarFieldEnum[];
};
export type PointOfFocusCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PointOfFocusCreateInput, Prisma.PointOfFocusUncheckedCreateInput>;
};
export type PointOfFocusCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.PointOfFocusCreateManyInput | Prisma.PointOfFocusCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PointOfFocusCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PointOfFocusOmit<ExtArgs> | null;
    data: Prisma.PointOfFocusCreateManyInput | Prisma.PointOfFocusCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.PointOfFocusIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type PointOfFocusUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PointOfFocusUpdateInput, Prisma.PointOfFocusUncheckedUpdateInput>;
    where: Prisma.PointOfFocusWhereUniqueInput;
};
export type PointOfFocusUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.PointOfFocusUpdateManyMutationInput, Prisma.PointOfFocusUncheckedUpdateManyInput>;
    where?: Prisma.PointOfFocusWhereInput;
    limit?: number;
};
export type PointOfFocusUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PointOfFocusOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PointOfFocusUpdateManyMutationInput, Prisma.PointOfFocusUncheckedUpdateManyInput>;
    where?: Prisma.PointOfFocusWhereInput;
    limit?: number;
    include?: Prisma.PointOfFocusIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type PointOfFocusUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusInclude<ExtArgs> | null;
    where: Prisma.PointOfFocusWhereUniqueInput;
    create: Prisma.XOR<Prisma.PointOfFocusCreateInput, Prisma.PointOfFocusUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.PointOfFocusUpdateInput, Prisma.PointOfFocusUncheckedUpdateInput>;
};
export type PointOfFocusDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusInclude<ExtArgs> | null;
    where: Prisma.PointOfFocusWhereUniqueInput;
};
export type PointOfFocusDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PointOfFocusWhereInput;
    limit?: number;
};
export type PointOfFocus$pointOfFocusControlsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusControlSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusControlOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusControlInclude<ExtArgs> | null;
    where?: Prisma.PointOfFocusControlWhereInput;
    orderBy?: Prisma.PointOfFocusControlOrderByWithRelationInput | Prisma.PointOfFocusControlOrderByWithRelationInput[];
    cursor?: Prisma.PointOfFocusControlWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PointOfFocusControlScalarFieldEnum | Prisma.PointOfFocusControlScalarFieldEnum[];
};
export type PointOfFocusDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusInclude<ExtArgs> | null;
};
export {};
