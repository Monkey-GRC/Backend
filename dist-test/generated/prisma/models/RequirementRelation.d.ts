import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type RequirementRelationModel = runtime.Types.Result.DefaultSelection<Prisma.$RequirementRelationPayload>;
export type AggregateRequirementRelation = {
    _count: RequirementRelationCountAggregateOutputType | null;
    _min: RequirementRelationMinAggregateOutputType | null;
    _max: RequirementRelationMaxAggregateOutputType | null;
};
export type RequirementRelationMinAggregateOutputType = {
    id: string | null;
    sourceRequirementId: string | null;
    relatedRequirementId: string | null;
};
export type RequirementRelationMaxAggregateOutputType = {
    id: string | null;
    sourceRequirementId: string | null;
    relatedRequirementId: string | null;
};
export type RequirementRelationCountAggregateOutputType = {
    id: number;
    sourceRequirementId: number;
    relatedRequirementId: number;
    _all: number;
};
export type RequirementRelationMinAggregateInputType = {
    id?: true;
    sourceRequirementId?: true;
    relatedRequirementId?: true;
};
export type RequirementRelationMaxAggregateInputType = {
    id?: true;
    sourceRequirementId?: true;
    relatedRequirementId?: true;
};
export type RequirementRelationCountAggregateInputType = {
    id?: true;
    sourceRequirementId?: true;
    relatedRequirementId?: true;
    _all?: true;
};
export type RequirementRelationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RequirementRelationWhereInput;
    orderBy?: Prisma.RequirementRelationOrderByWithRelationInput | Prisma.RequirementRelationOrderByWithRelationInput[];
    cursor?: Prisma.RequirementRelationWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | RequirementRelationCountAggregateInputType;
    _min?: RequirementRelationMinAggregateInputType;
    _max?: RequirementRelationMaxAggregateInputType;
};
export type GetRequirementRelationAggregateType<T extends RequirementRelationAggregateArgs> = {
    [P in keyof T & keyof AggregateRequirementRelation]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRequirementRelation[P]> : Prisma.GetScalarType<T[P], AggregateRequirementRelation[P]>;
};
export type RequirementRelationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RequirementRelationWhereInput;
    orderBy?: Prisma.RequirementRelationOrderByWithAggregationInput | Prisma.RequirementRelationOrderByWithAggregationInput[];
    by: Prisma.RequirementRelationScalarFieldEnum[] | Prisma.RequirementRelationScalarFieldEnum;
    having?: Prisma.RequirementRelationScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RequirementRelationCountAggregateInputType | true;
    _min?: RequirementRelationMinAggregateInputType;
    _max?: RequirementRelationMaxAggregateInputType;
};
export type RequirementRelationGroupByOutputType = {
    id: string;
    sourceRequirementId: string;
    relatedRequirementId: string;
    _count: RequirementRelationCountAggregateOutputType | null;
    _min: RequirementRelationMinAggregateOutputType | null;
    _max: RequirementRelationMaxAggregateOutputType | null;
};
type GetRequirementRelationGroupByPayload<T extends RequirementRelationGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RequirementRelationGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RequirementRelationGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RequirementRelationGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RequirementRelationGroupByOutputType[P]>;
}>>;
export type RequirementRelationWhereInput = {
    AND?: Prisma.RequirementRelationWhereInput | Prisma.RequirementRelationWhereInput[];
    OR?: Prisma.RequirementRelationWhereInput[];
    NOT?: Prisma.RequirementRelationWhereInput | Prisma.RequirementRelationWhereInput[];
    id?: Prisma.UuidFilter<"RequirementRelation"> | string;
    sourceRequirementId?: Prisma.UuidFilter<"RequirementRelation"> | string;
    relatedRequirementId?: Prisma.UuidFilter<"RequirementRelation"> | string;
    sourceRequirement?: Prisma.XOR<Prisma.RequirementScalarRelationFilter, Prisma.RequirementWhereInput>;
    relatedRequirement?: Prisma.XOR<Prisma.RequirementScalarRelationFilter, Prisma.RequirementWhereInput>;
};
export type RequirementRelationOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    sourceRequirementId?: Prisma.SortOrder;
    relatedRequirementId?: Prisma.SortOrder;
    sourceRequirement?: Prisma.RequirementOrderByWithRelationInput;
    relatedRequirement?: Prisma.RequirementOrderByWithRelationInput;
};
export type RequirementRelationWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    sourceRequirementId_relatedRequirementId?: Prisma.RequirementRelationSourceRequirementIdRelatedRequirementIdCompoundUniqueInput;
    AND?: Prisma.RequirementRelationWhereInput | Prisma.RequirementRelationWhereInput[];
    OR?: Prisma.RequirementRelationWhereInput[];
    NOT?: Prisma.RequirementRelationWhereInput | Prisma.RequirementRelationWhereInput[];
    sourceRequirementId?: Prisma.UuidFilter<"RequirementRelation"> | string;
    relatedRequirementId?: Prisma.UuidFilter<"RequirementRelation"> | string;
    sourceRequirement?: Prisma.XOR<Prisma.RequirementScalarRelationFilter, Prisma.RequirementWhereInput>;
    relatedRequirement?: Prisma.XOR<Prisma.RequirementScalarRelationFilter, Prisma.RequirementWhereInput>;
}, "id" | "sourceRequirementId_relatedRequirementId">;
export type RequirementRelationOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    sourceRequirementId?: Prisma.SortOrder;
    relatedRequirementId?: Prisma.SortOrder;
    _count?: Prisma.RequirementRelationCountOrderByAggregateInput;
    _max?: Prisma.RequirementRelationMaxOrderByAggregateInput;
    _min?: Prisma.RequirementRelationMinOrderByAggregateInput;
};
export type RequirementRelationScalarWhereWithAggregatesInput = {
    AND?: Prisma.RequirementRelationScalarWhereWithAggregatesInput | Prisma.RequirementRelationScalarWhereWithAggregatesInput[];
    OR?: Prisma.RequirementRelationScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RequirementRelationScalarWhereWithAggregatesInput | Prisma.RequirementRelationScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"RequirementRelation"> | string;
    sourceRequirementId?: Prisma.UuidWithAggregatesFilter<"RequirementRelation"> | string;
    relatedRequirementId?: Prisma.UuidWithAggregatesFilter<"RequirementRelation"> | string;
};
export type RequirementRelationCreateInput = {
    id?: string;
    sourceRequirement: Prisma.RequirementCreateNestedOneWithoutRelationsAsSourceInput;
    relatedRequirement: Prisma.RequirementCreateNestedOneWithoutRelationsAsRelatedInput;
};
export type RequirementRelationUncheckedCreateInput = {
    id?: string;
    sourceRequirementId: string;
    relatedRequirementId: string;
};
export type RequirementRelationUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRequirement?: Prisma.RequirementUpdateOneRequiredWithoutRelationsAsSourceNestedInput;
    relatedRequirement?: Prisma.RequirementUpdateOneRequiredWithoutRelationsAsRelatedNestedInput;
};
export type RequirementRelationUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
    relatedRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RequirementRelationCreateManyInput = {
    id?: string;
    sourceRequirementId: string;
    relatedRequirementId: string;
};
export type RequirementRelationUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RequirementRelationUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
    relatedRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RequirementRelationListRelationFilter = {
    every?: Prisma.RequirementRelationWhereInput;
    some?: Prisma.RequirementRelationWhereInput;
    none?: Prisma.RequirementRelationWhereInput;
};
export type RequirementRelationOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type RequirementRelationSourceRequirementIdRelatedRequirementIdCompoundUniqueInput = {
    sourceRequirementId: string;
    relatedRequirementId: string;
};
export type RequirementRelationCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sourceRequirementId?: Prisma.SortOrder;
    relatedRequirementId?: Prisma.SortOrder;
};
export type RequirementRelationMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sourceRequirementId?: Prisma.SortOrder;
    relatedRequirementId?: Prisma.SortOrder;
};
export type RequirementRelationMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sourceRequirementId?: Prisma.SortOrder;
    relatedRequirementId?: Prisma.SortOrder;
};
export type RequirementRelationCreateNestedManyWithoutSourceRequirementInput = {
    create?: Prisma.XOR<Prisma.RequirementRelationCreateWithoutSourceRequirementInput, Prisma.RequirementRelationUncheckedCreateWithoutSourceRequirementInput> | Prisma.RequirementRelationCreateWithoutSourceRequirementInput[] | Prisma.RequirementRelationUncheckedCreateWithoutSourceRequirementInput[];
    connectOrCreate?: Prisma.RequirementRelationCreateOrConnectWithoutSourceRequirementInput | Prisma.RequirementRelationCreateOrConnectWithoutSourceRequirementInput[];
    createMany?: Prisma.RequirementRelationCreateManySourceRequirementInputEnvelope;
    connect?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
};
export type RequirementRelationCreateNestedManyWithoutRelatedRequirementInput = {
    create?: Prisma.XOR<Prisma.RequirementRelationCreateWithoutRelatedRequirementInput, Prisma.RequirementRelationUncheckedCreateWithoutRelatedRequirementInput> | Prisma.RequirementRelationCreateWithoutRelatedRequirementInput[] | Prisma.RequirementRelationUncheckedCreateWithoutRelatedRequirementInput[];
    connectOrCreate?: Prisma.RequirementRelationCreateOrConnectWithoutRelatedRequirementInput | Prisma.RequirementRelationCreateOrConnectWithoutRelatedRequirementInput[];
    createMany?: Prisma.RequirementRelationCreateManyRelatedRequirementInputEnvelope;
    connect?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
};
export type RequirementRelationUncheckedCreateNestedManyWithoutSourceRequirementInput = {
    create?: Prisma.XOR<Prisma.RequirementRelationCreateWithoutSourceRequirementInput, Prisma.RequirementRelationUncheckedCreateWithoutSourceRequirementInput> | Prisma.RequirementRelationCreateWithoutSourceRequirementInput[] | Prisma.RequirementRelationUncheckedCreateWithoutSourceRequirementInput[];
    connectOrCreate?: Prisma.RequirementRelationCreateOrConnectWithoutSourceRequirementInput | Prisma.RequirementRelationCreateOrConnectWithoutSourceRequirementInput[];
    createMany?: Prisma.RequirementRelationCreateManySourceRequirementInputEnvelope;
    connect?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
};
export type RequirementRelationUncheckedCreateNestedManyWithoutRelatedRequirementInput = {
    create?: Prisma.XOR<Prisma.RequirementRelationCreateWithoutRelatedRequirementInput, Prisma.RequirementRelationUncheckedCreateWithoutRelatedRequirementInput> | Prisma.RequirementRelationCreateWithoutRelatedRequirementInput[] | Prisma.RequirementRelationUncheckedCreateWithoutRelatedRequirementInput[];
    connectOrCreate?: Prisma.RequirementRelationCreateOrConnectWithoutRelatedRequirementInput | Prisma.RequirementRelationCreateOrConnectWithoutRelatedRequirementInput[];
    createMany?: Prisma.RequirementRelationCreateManyRelatedRequirementInputEnvelope;
    connect?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
};
export type RequirementRelationUpdateManyWithoutSourceRequirementNestedInput = {
    create?: Prisma.XOR<Prisma.RequirementRelationCreateWithoutSourceRequirementInput, Prisma.RequirementRelationUncheckedCreateWithoutSourceRequirementInput> | Prisma.RequirementRelationCreateWithoutSourceRequirementInput[] | Prisma.RequirementRelationUncheckedCreateWithoutSourceRequirementInput[];
    connectOrCreate?: Prisma.RequirementRelationCreateOrConnectWithoutSourceRequirementInput | Prisma.RequirementRelationCreateOrConnectWithoutSourceRequirementInput[];
    upsert?: Prisma.RequirementRelationUpsertWithWhereUniqueWithoutSourceRequirementInput | Prisma.RequirementRelationUpsertWithWhereUniqueWithoutSourceRequirementInput[];
    createMany?: Prisma.RequirementRelationCreateManySourceRequirementInputEnvelope;
    set?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    disconnect?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    delete?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    connect?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    update?: Prisma.RequirementRelationUpdateWithWhereUniqueWithoutSourceRequirementInput | Prisma.RequirementRelationUpdateWithWhereUniqueWithoutSourceRequirementInput[];
    updateMany?: Prisma.RequirementRelationUpdateManyWithWhereWithoutSourceRequirementInput | Prisma.RequirementRelationUpdateManyWithWhereWithoutSourceRequirementInput[];
    deleteMany?: Prisma.RequirementRelationScalarWhereInput | Prisma.RequirementRelationScalarWhereInput[];
};
export type RequirementRelationUpdateManyWithoutRelatedRequirementNestedInput = {
    create?: Prisma.XOR<Prisma.RequirementRelationCreateWithoutRelatedRequirementInput, Prisma.RequirementRelationUncheckedCreateWithoutRelatedRequirementInput> | Prisma.RequirementRelationCreateWithoutRelatedRequirementInput[] | Prisma.RequirementRelationUncheckedCreateWithoutRelatedRequirementInput[];
    connectOrCreate?: Prisma.RequirementRelationCreateOrConnectWithoutRelatedRequirementInput | Prisma.RequirementRelationCreateOrConnectWithoutRelatedRequirementInput[];
    upsert?: Prisma.RequirementRelationUpsertWithWhereUniqueWithoutRelatedRequirementInput | Prisma.RequirementRelationUpsertWithWhereUniqueWithoutRelatedRequirementInput[];
    createMany?: Prisma.RequirementRelationCreateManyRelatedRequirementInputEnvelope;
    set?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    disconnect?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    delete?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    connect?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    update?: Prisma.RequirementRelationUpdateWithWhereUniqueWithoutRelatedRequirementInput | Prisma.RequirementRelationUpdateWithWhereUniqueWithoutRelatedRequirementInput[];
    updateMany?: Prisma.RequirementRelationUpdateManyWithWhereWithoutRelatedRequirementInput | Prisma.RequirementRelationUpdateManyWithWhereWithoutRelatedRequirementInput[];
    deleteMany?: Prisma.RequirementRelationScalarWhereInput | Prisma.RequirementRelationScalarWhereInput[];
};
export type RequirementRelationUncheckedUpdateManyWithoutSourceRequirementNestedInput = {
    create?: Prisma.XOR<Prisma.RequirementRelationCreateWithoutSourceRequirementInput, Prisma.RequirementRelationUncheckedCreateWithoutSourceRequirementInput> | Prisma.RequirementRelationCreateWithoutSourceRequirementInput[] | Prisma.RequirementRelationUncheckedCreateWithoutSourceRequirementInput[];
    connectOrCreate?: Prisma.RequirementRelationCreateOrConnectWithoutSourceRequirementInput | Prisma.RequirementRelationCreateOrConnectWithoutSourceRequirementInput[];
    upsert?: Prisma.RequirementRelationUpsertWithWhereUniqueWithoutSourceRequirementInput | Prisma.RequirementRelationUpsertWithWhereUniqueWithoutSourceRequirementInput[];
    createMany?: Prisma.RequirementRelationCreateManySourceRequirementInputEnvelope;
    set?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    disconnect?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    delete?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    connect?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    update?: Prisma.RequirementRelationUpdateWithWhereUniqueWithoutSourceRequirementInput | Prisma.RequirementRelationUpdateWithWhereUniqueWithoutSourceRequirementInput[];
    updateMany?: Prisma.RequirementRelationUpdateManyWithWhereWithoutSourceRequirementInput | Prisma.RequirementRelationUpdateManyWithWhereWithoutSourceRequirementInput[];
    deleteMany?: Prisma.RequirementRelationScalarWhereInput | Prisma.RequirementRelationScalarWhereInput[];
};
export type RequirementRelationUncheckedUpdateManyWithoutRelatedRequirementNestedInput = {
    create?: Prisma.XOR<Prisma.RequirementRelationCreateWithoutRelatedRequirementInput, Prisma.RequirementRelationUncheckedCreateWithoutRelatedRequirementInput> | Prisma.RequirementRelationCreateWithoutRelatedRequirementInput[] | Prisma.RequirementRelationUncheckedCreateWithoutRelatedRequirementInput[];
    connectOrCreate?: Prisma.RequirementRelationCreateOrConnectWithoutRelatedRequirementInput | Prisma.RequirementRelationCreateOrConnectWithoutRelatedRequirementInput[];
    upsert?: Prisma.RequirementRelationUpsertWithWhereUniqueWithoutRelatedRequirementInput | Prisma.RequirementRelationUpsertWithWhereUniqueWithoutRelatedRequirementInput[];
    createMany?: Prisma.RequirementRelationCreateManyRelatedRequirementInputEnvelope;
    set?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    disconnect?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    delete?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    connect?: Prisma.RequirementRelationWhereUniqueInput | Prisma.RequirementRelationWhereUniqueInput[];
    update?: Prisma.RequirementRelationUpdateWithWhereUniqueWithoutRelatedRequirementInput | Prisma.RequirementRelationUpdateWithWhereUniqueWithoutRelatedRequirementInput[];
    updateMany?: Prisma.RequirementRelationUpdateManyWithWhereWithoutRelatedRequirementInput | Prisma.RequirementRelationUpdateManyWithWhereWithoutRelatedRequirementInput[];
    deleteMany?: Prisma.RequirementRelationScalarWhereInput | Prisma.RequirementRelationScalarWhereInput[];
};
export type RequirementRelationCreateWithoutSourceRequirementInput = {
    id?: string;
    relatedRequirement: Prisma.RequirementCreateNestedOneWithoutRelationsAsRelatedInput;
};
export type RequirementRelationUncheckedCreateWithoutSourceRequirementInput = {
    id?: string;
    relatedRequirementId: string;
};
export type RequirementRelationCreateOrConnectWithoutSourceRequirementInput = {
    where: Prisma.RequirementRelationWhereUniqueInput;
    create: Prisma.XOR<Prisma.RequirementRelationCreateWithoutSourceRequirementInput, Prisma.RequirementRelationUncheckedCreateWithoutSourceRequirementInput>;
};
export type RequirementRelationCreateManySourceRequirementInputEnvelope = {
    data: Prisma.RequirementRelationCreateManySourceRequirementInput | Prisma.RequirementRelationCreateManySourceRequirementInput[];
    skipDuplicates?: boolean;
};
export type RequirementRelationCreateWithoutRelatedRequirementInput = {
    id?: string;
    sourceRequirement: Prisma.RequirementCreateNestedOneWithoutRelationsAsSourceInput;
};
export type RequirementRelationUncheckedCreateWithoutRelatedRequirementInput = {
    id?: string;
    sourceRequirementId: string;
};
export type RequirementRelationCreateOrConnectWithoutRelatedRequirementInput = {
    where: Prisma.RequirementRelationWhereUniqueInput;
    create: Prisma.XOR<Prisma.RequirementRelationCreateWithoutRelatedRequirementInput, Prisma.RequirementRelationUncheckedCreateWithoutRelatedRequirementInput>;
};
export type RequirementRelationCreateManyRelatedRequirementInputEnvelope = {
    data: Prisma.RequirementRelationCreateManyRelatedRequirementInput | Prisma.RequirementRelationCreateManyRelatedRequirementInput[];
    skipDuplicates?: boolean;
};
export type RequirementRelationUpsertWithWhereUniqueWithoutSourceRequirementInput = {
    where: Prisma.RequirementRelationWhereUniqueInput;
    update: Prisma.XOR<Prisma.RequirementRelationUpdateWithoutSourceRequirementInput, Prisma.RequirementRelationUncheckedUpdateWithoutSourceRequirementInput>;
    create: Prisma.XOR<Prisma.RequirementRelationCreateWithoutSourceRequirementInput, Prisma.RequirementRelationUncheckedCreateWithoutSourceRequirementInput>;
};
export type RequirementRelationUpdateWithWhereUniqueWithoutSourceRequirementInput = {
    where: Prisma.RequirementRelationWhereUniqueInput;
    data: Prisma.XOR<Prisma.RequirementRelationUpdateWithoutSourceRequirementInput, Prisma.RequirementRelationUncheckedUpdateWithoutSourceRequirementInput>;
};
export type RequirementRelationUpdateManyWithWhereWithoutSourceRequirementInput = {
    where: Prisma.RequirementRelationScalarWhereInput;
    data: Prisma.XOR<Prisma.RequirementRelationUpdateManyMutationInput, Prisma.RequirementRelationUncheckedUpdateManyWithoutSourceRequirementInput>;
};
export type RequirementRelationScalarWhereInput = {
    AND?: Prisma.RequirementRelationScalarWhereInput | Prisma.RequirementRelationScalarWhereInput[];
    OR?: Prisma.RequirementRelationScalarWhereInput[];
    NOT?: Prisma.RequirementRelationScalarWhereInput | Prisma.RequirementRelationScalarWhereInput[];
    id?: Prisma.UuidFilter<"RequirementRelation"> | string;
    sourceRequirementId?: Prisma.UuidFilter<"RequirementRelation"> | string;
    relatedRequirementId?: Prisma.UuidFilter<"RequirementRelation"> | string;
};
export type RequirementRelationUpsertWithWhereUniqueWithoutRelatedRequirementInput = {
    where: Prisma.RequirementRelationWhereUniqueInput;
    update: Prisma.XOR<Prisma.RequirementRelationUpdateWithoutRelatedRequirementInput, Prisma.RequirementRelationUncheckedUpdateWithoutRelatedRequirementInput>;
    create: Prisma.XOR<Prisma.RequirementRelationCreateWithoutRelatedRequirementInput, Prisma.RequirementRelationUncheckedCreateWithoutRelatedRequirementInput>;
};
export type RequirementRelationUpdateWithWhereUniqueWithoutRelatedRequirementInput = {
    where: Prisma.RequirementRelationWhereUniqueInput;
    data: Prisma.XOR<Prisma.RequirementRelationUpdateWithoutRelatedRequirementInput, Prisma.RequirementRelationUncheckedUpdateWithoutRelatedRequirementInput>;
};
export type RequirementRelationUpdateManyWithWhereWithoutRelatedRequirementInput = {
    where: Prisma.RequirementRelationScalarWhereInput;
    data: Prisma.XOR<Prisma.RequirementRelationUpdateManyMutationInput, Prisma.RequirementRelationUncheckedUpdateManyWithoutRelatedRequirementInput>;
};
export type RequirementRelationCreateManySourceRequirementInput = {
    id?: string;
    relatedRequirementId: string;
};
export type RequirementRelationCreateManyRelatedRequirementInput = {
    id?: string;
    sourceRequirementId: string;
};
export type RequirementRelationUpdateWithoutSourceRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    relatedRequirement?: Prisma.RequirementUpdateOneRequiredWithoutRelationsAsRelatedNestedInput;
};
export type RequirementRelationUncheckedUpdateWithoutSourceRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    relatedRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RequirementRelationUncheckedUpdateManyWithoutSourceRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    relatedRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RequirementRelationUpdateWithoutRelatedRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRequirement?: Prisma.RequirementUpdateOneRequiredWithoutRelationsAsSourceNestedInput;
};
export type RequirementRelationUncheckedUpdateWithoutRelatedRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RequirementRelationUncheckedUpdateManyWithoutRelatedRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RequirementRelationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sourceRequirementId?: boolean;
    relatedRequirementId?: boolean;
    sourceRequirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
    relatedRequirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["requirementRelation"]>;
export type RequirementRelationSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sourceRequirementId?: boolean;
    relatedRequirementId?: boolean;
    sourceRequirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
    relatedRequirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["requirementRelation"]>;
export type RequirementRelationSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sourceRequirementId?: boolean;
    relatedRequirementId?: boolean;
    sourceRequirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
    relatedRequirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["requirementRelation"]>;
export type RequirementRelationSelectScalar = {
    id?: boolean;
    sourceRequirementId?: boolean;
    relatedRequirementId?: boolean;
};
export type RequirementRelationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "sourceRequirementId" | "relatedRequirementId", ExtArgs["result"]["requirementRelation"]>;
export type RequirementRelationInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    sourceRequirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
    relatedRequirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
};
export type RequirementRelationIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    sourceRequirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
    relatedRequirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
};
export type RequirementRelationIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    sourceRequirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
    relatedRequirement?: boolean | Prisma.RequirementDefaultArgs<ExtArgs>;
};
export type $RequirementRelationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "RequirementRelation";
    objects: {
        sourceRequirement: Prisma.$RequirementPayload<ExtArgs>;
        relatedRequirement: Prisma.$RequirementPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        sourceRequirementId: string;
        relatedRequirementId: string;
    }, ExtArgs["result"]["requirementRelation"]>;
    composites: {};
};
export type RequirementRelationGetPayload<S extends boolean | null | undefined | RequirementRelationDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RequirementRelationPayload, S>;
export type RequirementRelationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RequirementRelationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RequirementRelationCountAggregateInputType | true;
};
export interface RequirementRelationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['RequirementRelation'];
        meta: {
            name: 'RequirementRelation';
        };
    };
    findUnique<T extends RequirementRelationFindUniqueArgs>(args: Prisma.SelectSubset<T, RequirementRelationFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RequirementRelationClient<runtime.Types.Result.GetResult<Prisma.$RequirementRelationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends RequirementRelationFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RequirementRelationFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RequirementRelationClient<runtime.Types.Result.GetResult<Prisma.$RequirementRelationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends RequirementRelationFindFirstArgs>(args?: Prisma.SelectSubset<T, RequirementRelationFindFirstArgs<ExtArgs>>): Prisma.Prisma__RequirementRelationClient<runtime.Types.Result.GetResult<Prisma.$RequirementRelationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends RequirementRelationFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RequirementRelationFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RequirementRelationClient<runtime.Types.Result.GetResult<Prisma.$RequirementRelationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends RequirementRelationFindManyArgs>(args?: Prisma.SelectSubset<T, RequirementRelationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RequirementRelationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends RequirementRelationCreateArgs>(args: Prisma.SelectSubset<T, RequirementRelationCreateArgs<ExtArgs>>): Prisma.Prisma__RequirementRelationClient<runtime.Types.Result.GetResult<Prisma.$RequirementRelationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends RequirementRelationCreateManyArgs>(args?: Prisma.SelectSubset<T, RequirementRelationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends RequirementRelationCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RequirementRelationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RequirementRelationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends RequirementRelationDeleteArgs>(args: Prisma.SelectSubset<T, RequirementRelationDeleteArgs<ExtArgs>>): Prisma.Prisma__RequirementRelationClient<runtime.Types.Result.GetResult<Prisma.$RequirementRelationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends RequirementRelationUpdateArgs>(args: Prisma.SelectSubset<T, RequirementRelationUpdateArgs<ExtArgs>>): Prisma.Prisma__RequirementRelationClient<runtime.Types.Result.GetResult<Prisma.$RequirementRelationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends RequirementRelationDeleteManyArgs>(args?: Prisma.SelectSubset<T, RequirementRelationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends RequirementRelationUpdateManyArgs>(args: Prisma.SelectSubset<T, RequirementRelationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends RequirementRelationUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RequirementRelationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RequirementRelationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends RequirementRelationUpsertArgs>(args: Prisma.SelectSubset<T, RequirementRelationUpsertArgs<ExtArgs>>): Prisma.Prisma__RequirementRelationClient<runtime.Types.Result.GetResult<Prisma.$RequirementRelationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends RequirementRelationCountArgs>(args?: Prisma.Subset<T, RequirementRelationCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RequirementRelationCountAggregateOutputType> : number>;
    aggregate<T extends RequirementRelationAggregateArgs>(args: Prisma.Subset<T, RequirementRelationAggregateArgs>): Prisma.PrismaPromise<GetRequirementRelationAggregateType<T>>;
    groupBy<T extends RequirementRelationGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RequirementRelationGroupByArgs['orderBy'];
    } : {
        orderBy?: RequirementRelationGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RequirementRelationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRequirementRelationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: RequirementRelationFieldRefs;
}
export interface Prisma__RequirementRelationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    sourceRequirement<T extends Prisma.RequirementDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RequirementDefaultArgs<ExtArgs>>): Prisma.Prisma__RequirementClient<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    relatedRequirement<T extends Prisma.RequirementDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RequirementDefaultArgs<ExtArgs>>): Prisma.Prisma__RequirementClient<runtime.Types.Result.GetResult<Prisma.$RequirementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface RequirementRelationFieldRefs {
    readonly id: Prisma.FieldRef<"RequirementRelation", 'String'>;
    readonly sourceRequirementId: Prisma.FieldRef<"RequirementRelation", 'String'>;
    readonly relatedRequirementId: Prisma.FieldRef<"RequirementRelation", 'String'>;
}
export type RequirementRelationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementRelationSelect<ExtArgs> | null;
    omit?: Prisma.RequirementRelationOmit<ExtArgs> | null;
    include?: Prisma.RequirementRelationInclude<ExtArgs> | null;
    where: Prisma.RequirementRelationWhereUniqueInput;
};
export type RequirementRelationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementRelationSelect<ExtArgs> | null;
    omit?: Prisma.RequirementRelationOmit<ExtArgs> | null;
    include?: Prisma.RequirementRelationInclude<ExtArgs> | null;
    where: Prisma.RequirementRelationWhereUniqueInput;
};
export type RequirementRelationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementRelationSelect<ExtArgs> | null;
    omit?: Prisma.RequirementRelationOmit<ExtArgs> | null;
    include?: Prisma.RequirementRelationInclude<ExtArgs> | null;
    where?: Prisma.RequirementRelationWhereInput;
    orderBy?: Prisma.RequirementRelationOrderByWithRelationInput | Prisma.RequirementRelationOrderByWithRelationInput[];
    cursor?: Prisma.RequirementRelationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RequirementRelationScalarFieldEnum | Prisma.RequirementRelationScalarFieldEnum[];
};
export type RequirementRelationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementRelationSelect<ExtArgs> | null;
    omit?: Prisma.RequirementRelationOmit<ExtArgs> | null;
    include?: Prisma.RequirementRelationInclude<ExtArgs> | null;
    where?: Prisma.RequirementRelationWhereInput;
    orderBy?: Prisma.RequirementRelationOrderByWithRelationInput | Prisma.RequirementRelationOrderByWithRelationInput[];
    cursor?: Prisma.RequirementRelationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RequirementRelationScalarFieldEnum | Prisma.RequirementRelationScalarFieldEnum[];
};
export type RequirementRelationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementRelationSelect<ExtArgs> | null;
    omit?: Prisma.RequirementRelationOmit<ExtArgs> | null;
    include?: Prisma.RequirementRelationInclude<ExtArgs> | null;
    where?: Prisma.RequirementRelationWhereInput;
    orderBy?: Prisma.RequirementRelationOrderByWithRelationInput | Prisma.RequirementRelationOrderByWithRelationInput[];
    cursor?: Prisma.RequirementRelationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RequirementRelationScalarFieldEnum | Prisma.RequirementRelationScalarFieldEnum[];
};
export type RequirementRelationCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementRelationSelect<ExtArgs> | null;
    omit?: Prisma.RequirementRelationOmit<ExtArgs> | null;
    include?: Prisma.RequirementRelationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RequirementRelationCreateInput, Prisma.RequirementRelationUncheckedCreateInput>;
};
export type RequirementRelationCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.RequirementRelationCreateManyInput | Prisma.RequirementRelationCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RequirementRelationCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementRelationSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RequirementRelationOmit<ExtArgs> | null;
    data: Prisma.RequirementRelationCreateManyInput | Prisma.RequirementRelationCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.RequirementRelationIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type RequirementRelationUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementRelationSelect<ExtArgs> | null;
    omit?: Prisma.RequirementRelationOmit<ExtArgs> | null;
    include?: Prisma.RequirementRelationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RequirementRelationUpdateInput, Prisma.RequirementRelationUncheckedUpdateInput>;
    where: Prisma.RequirementRelationWhereUniqueInput;
};
export type RequirementRelationUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.RequirementRelationUpdateManyMutationInput, Prisma.RequirementRelationUncheckedUpdateManyInput>;
    where?: Prisma.RequirementRelationWhereInput;
    limit?: number;
};
export type RequirementRelationUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementRelationSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RequirementRelationOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RequirementRelationUpdateManyMutationInput, Prisma.RequirementRelationUncheckedUpdateManyInput>;
    where?: Prisma.RequirementRelationWhereInput;
    limit?: number;
    include?: Prisma.RequirementRelationIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type RequirementRelationUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementRelationSelect<ExtArgs> | null;
    omit?: Prisma.RequirementRelationOmit<ExtArgs> | null;
    include?: Prisma.RequirementRelationInclude<ExtArgs> | null;
    where: Prisma.RequirementRelationWhereUniqueInput;
    create: Prisma.XOR<Prisma.RequirementRelationCreateInput, Prisma.RequirementRelationUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.RequirementRelationUpdateInput, Prisma.RequirementRelationUncheckedUpdateInput>;
};
export type RequirementRelationDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementRelationSelect<ExtArgs> | null;
    omit?: Prisma.RequirementRelationOmit<ExtArgs> | null;
    include?: Prisma.RequirementRelationInclude<ExtArgs> | null;
    where: Prisma.RequirementRelationWhereUniqueInput;
};
export type RequirementRelationDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RequirementRelationWhereInput;
    limit?: number;
};
export type RequirementRelationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequirementRelationSelect<ExtArgs> | null;
    omit?: Prisma.RequirementRelationOmit<ExtArgs> | null;
    include?: Prisma.RequirementRelationInclude<ExtArgs> | null;
};
export {};
