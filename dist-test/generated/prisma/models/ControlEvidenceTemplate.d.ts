import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ControlEvidenceTemplateModel = runtime.Types.Result.DefaultSelection<Prisma.$ControlEvidenceTemplatePayload>;
export type AggregateControlEvidenceTemplate = {
    _count: ControlEvidenceTemplateCountAggregateOutputType | null;
    _avg: ControlEvidenceTemplateAvgAggregateOutputType | null;
    _sum: ControlEvidenceTemplateSumAggregateOutputType | null;
    _min: ControlEvidenceTemplateMinAggregateOutputType | null;
    _max: ControlEvidenceTemplateMaxAggregateOutputType | null;
};
export type ControlEvidenceTemplateAvgAggregateOutputType = {
    sequence: number | null;
};
export type ControlEvidenceTemplateSumAggregateOutputType = {
    sequence: number | null;
};
export type ControlEvidenceTemplateMinAggregateOutputType = {
    id: string | null;
    controlId: string | null;
    evidenceTemplateId: string | null;
    sequence: number | null;
};
export type ControlEvidenceTemplateMaxAggregateOutputType = {
    id: string | null;
    controlId: string | null;
    evidenceTemplateId: string | null;
    sequence: number | null;
};
export type ControlEvidenceTemplateCountAggregateOutputType = {
    id: number;
    controlId: number;
    evidenceTemplateId: number;
    sequence: number;
    _all: number;
};
export type ControlEvidenceTemplateAvgAggregateInputType = {
    sequence?: true;
};
export type ControlEvidenceTemplateSumAggregateInputType = {
    sequence?: true;
};
export type ControlEvidenceTemplateMinAggregateInputType = {
    id?: true;
    controlId?: true;
    evidenceTemplateId?: true;
    sequence?: true;
};
export type ControlEvidenceTemplateMaxAggregateInputType = {
    id?: true;
    controlId?: true;
    evidenceTemplateId?: true;
    sequence?: true;
};
export type ControlEvidenceTemplateCountAggregateInputType = {
    id?: true;
    controlId?: true;
    evidenceTemplateId?: true;
    sequence?: true;
    _all?: true;
};
export type ControlEvidenceTemplateAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlEvidenceTemplateWhereInput;
    orderBy?: Prisma.ControlEvidenceTemplateOrderByWithRelationInput | Prisma.ControlEvidenceTemplateOrderByWithRelationInput[];
    cursor?: Prisma.ControlEvidenceTemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ControlEvidenceTemplateCountAggregateInputType;
    _avg?: ControlEvidenceTemplateAvgAggregateInputType;
    _sum?: ControlEvidenceTemplateSumAggregateInputType;
    _min?: ControlEvidenceTemplateMinAggregateInputType;
    _max?: ControlEvidenceTemplateMaxAggregateInputType;
};
export type GetControlEvidenceTemplateAggregateType<T extends ControlEvidenceTemplateAggregateArgs> = {
    [P in keyof T & keyof AggregateControlEvidenceTemplate]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateControlEvidenceTemplate[P]> : Prisma.GetScalarType<T[P], AggregateControlEvidenceTemplate[P]>;
};
export type ControlEvidenceTemplateGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlEvidenceTemplateWhereInput;
    orderBy?: Prisma.ControlEvidenceTemplateOrderByWithAggregationInput | Prisma.ControlEvidenceTemplateOrderByWithAggregationInput[];
    by: Prisma.ControlEvidenceTemplateScalarFieldEnum[] | Prisma.ControlEvidenceTemplateScalarFieldEnum;
    having?: Prisma.ControlEvidenceTemplateScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ControlEvidenceTemplateCountAggregateInputType | true;
    _avg?: ControlEvidenceTemplateAvgAggregateInputType;
    _sum?: ControlEvidenceTemplateSumAggregateInputType;
    _min?: ControlEvidenceTemplateMinAggregateInputType;
    _max?: ControlEvidenceTemplateMaxAggregateInputType;
};
export type ControlEvidenceTemplateGroupByOutputType = {
    id: string;
    controlId: string;
    evidenceTemplateId: string;
    sequence: number;
    _count: ControlEvidenceTemplateCountAggregateOutputType | null;
    _avg: ControlEvidenceTemplateAvgAggregateOutputType | null;
    _sum: ControlEvidenceTemplateSumAggregateOutputType | null;
    _min: ControlEvidenceTemplateMinAggregateOutputType | null;
    _max: ControlEvidenceTemplateMaxAggregateOutputType | null;
};
type GetControlEvidenceTemplateGroupByPayload<T extends ControlEvidenceTemplateGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ControlEvidenceTemplateGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ControlEvidenceTemplateGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ControlEvidenceTemplateGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ControlEvidenceTemplateGroupByOutputType[P]>;
}>>;
export type ControlEvidenceTemplateWhereInput = {
    AND?: Prisma.ControlEvidenceTemplateWhereInput | Prisma.ControlEvidenceTemplateWhereInput[];
    OR?: Prisma.ControlEvidenceTemplateWhereInput[];
    NOT?: Prisma.ControlEvidenceTemplateWhereInput | Prisma.ControlEvidenceTemplateWhereInput[];
    id?: Prisma.UuidFilter<"ControlEvidenceTemplate"> | string;
    controlId?: Prisma.UuidFilter<"ControlEvidenceTemplate"> | string;
    evidenceTemplateId?: Prisma.UuidFilter<"ControlEvidenceTemplate"> | string;
    sequence?: Prisma.IntFilter<"ControlEvidenceTemplate"> | number;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
    evidenceTemplate?: Prisma.XOR<Prisma.EvidenceTemplateScalarRelationFilter, Prisma.EvidenceTemplateWhereInput>;
};
export type ControlEvidenceTemplateOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    evidenceTemplateId?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
    control?: Prisma.ControlOrderByWithRelationInput;
    evidenceTemplate?: Prisma.EvidenceTemplateOrderByWithRelationInput;
};
export type ControlEvidenceTemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    controlId_evidenceTemplateId?: Prisma.ControlEvidenceTemplateControlIdEvidenceTemplateIdCompoundUniqueInput;
    controlId_sequence?: Prisma.ControlEvidenceTemplateControlIdSequenceCompoundUniqueInput;
    AND?: Prisma.ControlEvidenceTemplateWhereInput | Prisma.ControlEvidenceTemplateWhereInput[];
    OR?: Prisma.ControlEvidenceTemplateWhereInput[];
    NOT?: Prisma.ControlEvidenceTemplateWhereInput | Prisma.ControlEvidenceTemplateWhereInput[];
    controlId?: Prisma.UuidFilter<"ControlEvidenceTemplate"> | string;
    evidenceTemplateId?: Prisma.UuidFilter<"ControlEvidenceTemplate"> | string;
    sequence?: Prisma.IntFilter<"ControlEvidenceTemplate"> | number;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
    evidenceTemplate?: Prisma.XOR<Prisma.EvidenceTemplateScalarRelationFilter, Prisma.EvidenceTemplateWhereInput>;
}, "id" | "controlId_evidenceTemplateId" | "controlId_sequence">;
export type ControlEvidenceTemplateOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    evidenceTemplateId?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
    _count?: Prisma.ControlEvidenceTemplateCountOrderByAggregateInput;
    _avg?: Prisma.ControlEvidenceTemplateAvgOrderByAggregateInput;
    _max?: Prisma.ControlEvidenceTemplateMaxOrderByAggregateInput;
    _min?: Prisma.ControlEvidenceTemplateMinOrderByAggregateInput;
    _sum?: Prisma.ControlEvidenceTemplateSumOrderByAggregateInput;
};
export type ControlEvidenceTemplateScalarWhereWithAggregatesInput = {
    AND?: Prisma.ControlEvidenceTemplateScalarWhereWithAggregatesInput | Prisma.ControlEvidenceTemplateScalarWhereWithAggregatesInput[];
    OR?: Prisma.ControlEvidenceTemplateScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ControlEvidenceTemplateScalarWhereWithAggregatesInput | Prisma.ControlEvidenceTemplateScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ControlEvidenceTemplate"> | string;
    controlId?: Prisma.UuidWithAggregatesFilter<"ControlEvidenceTemplate"> | string;
    evidenceTemplateId?: Prisma.UuidWithAggregatesFilter<"ControlEvidenceTemplate"> | string;
    sequence?: Prisma.IntWithAggregatesFilter<"ControlEvidenceTemplate"> | number;
};
export type ControlEvidenceTemplateCreateInput = {
    id?: string;
    sequence: number;
    control: Prisma.ControlCreateNestedOneWithoutEvidenceTemplatesInput;
    evidenceTemplate: Prisma.EvidenceTemplateCreateNestedOneWithoutControlsInput;
};
export type ControlEvidenceTemplateUncheckedCreateInput = {
    id?: string;
    controlId: string;
    evidenceTemplateId: string;
    sequence: number;
};
export type ControlEvidenceTemplateUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    control?: Prisma.ControlUpdateOneRequiredWithoutEvidenceTemplatesNestedInput;
    evidenceTemplate?: Prisma.EvidenceTemplateUpdateOneRequiredWithoutControlsNestedInput;
};
export type ControlEvidenceTemplateUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
    evidenceTemplateId?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ControlEvidenceTemplateCreateManyInput = {
    id?: string;
    controlId: string;
    evidenceTemplateId: string;
    sequence: number;
};
export type ControlEvidenceTemplateUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ControlEvidenceTemplateUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
    evidenceTemplateId?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ControlEvidenceTemplateListRelationFilter = {
    every?: Prisma.ControlEvidenceTemplateWhereInput;
    some?: Prisma.ControlEvidenceTemplateWhereInput;
    none?: Prisma.ControlEvidenceTemplateWhereInput;
};
export type ControlEvidenceTemplateOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ControlEvidenceTemplateControlIdEvidenceTemplateIdCompoundUniqueInput = {
    controlId: string;
    evidenceTemplateId: string;
};
export type ControlEvidenceTemplateControlIdSequenceCompoundUniqueInput = {
    controlId: string;
    sequence: number;
};
export type ControlEvidenceTemplateCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    evidenceTemplateId?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
};
export type ControlEvidenceTemplateAvgOrderByAggregateInput = {
    sequence?: Prisma.SortOrder;
};
export type ControlEvidenceTemplateMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    evidenceTemplateId?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
};
export type ControlEvidenceTemplateMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    evidenceTemplateId?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
};
export type ControlEvidenceTemplateSumOrderByAggregateInput = {
    sequence?: Prisma.SortOrder;
};
export type ControlEvidenceTemplateCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.ControlEvidenceTemplateCreateWithoutControlInput, Prisma.ControlEvidenceTemplateUncheckedCreateWithoutControlInput> | Prisma.ControlEvidenceTemplateCreateWithoutControlInput[] | Prisma.ControlEvidenceTemplateUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlEvidenceTemplateCreateOrConnectWithoutControlInput | Prisma.ControlEvidenceTemplateCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.ControlEvidenceTemplateCreateManyControlInputEnvelope;
    connect?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
};
export type ControlEvidenceTemplateUncheckedCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.ControlEvidenceTemplateCreateWithoutControlInput, Prisma.ControlEvidenceTemplateUncheckedCreateWithoutControlInput> | Prisma.ControlEvidenceTemplateCreateWithoutControlInput[] | Prisma.ControlEvidenceTemplateUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlEvidenceTemplateCreateOrConnectWithoutControlInput | Prisma.ControlEvidenceTemplateCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.ControlEvidenceTemplateCreateManyControlInputEnvelope;
    connect?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
};
export type ControlEvidenceTemplateUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.ControlEvidenceTemplateCreateWithoutControlInput, Prisma.ControlEvidenceTemplateUncheckedCreateWithoutControlInput> | Prisma.ControlEvidenceTemplateCreateWithoutControlInput[] | Prisma.ControlEvidenceTemplateUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlEvidenceTemplateCreateOrConnectWithoutControlInput | Prisma.ControlEvidenceTemplateCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.ControlEvidenceTemplateUpsertWithWhereUniqueWithoutControlInput | Prisma.ControlEvidenceTemplateUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.ControlEvidenceTemplateCreateManyControlInputEnvelope;
    set?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    disconnect?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    delete?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    connect?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    update?: Prisma.ControlEvidenceTemplateUpdateWithWhereUniqueWithoutControlInput | Prisma.ControlEvidenceTemplateUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.ControlEvidenceTemplateUpdateManyWithWhereWithoutControlInput | Prisma.ControlEvidenceTemplateUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.ControlEvidenceTemplateScalarWhereInput | Prisma.ControlEvidenceTemplateScalarWhereInput[];
};
export type ControlEvidenceTemplateUncheckedUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.ControlEvidenceTemplateCreateWithoutControlInput, Prisma.ControlEvidenceTemplateUncheckedCreateWithoutControlInput> | Prisma.ControlEvidenceTemplateCreateWithoutControlInput[] | Prisma.ControlEvidenceTemplateUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlEvidenceTemplateCreateOrConnectWithoutControlInput | Prisma.ControlEvidenceTemplateCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.ControlEvidenceTemplateUpsertWithWhereUniqueWithoutControlInput | Prisma.ControlEvidenceTemplateUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.ControlEvidenceTemplateCreateManyControlInputEnvelope;
    set?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    disconnect?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    delete?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    connect?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    update?: Prisma.ControlEvidenceTemplateUpdateWithWhereUniqueWithoutControlInput | Prisma.ControlEvidenceTemplateUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.ControlEvidenceTemplateUpdateManyWithWhereWithoutControlInput | Prisma.ControlEvidenceTemplateUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.ControlEvidenceTemplateScalarWhereInput | Prisma.ControlEvidenceTemplateScalarWhereInput[];
};
export type ControlEvidenceTemplateCreateNestedManyWithoutEvidenceTemplateInput = {
    create?: Prisma.XOR<Prisma.ControlEvidenceTemplateCreateWithoutEvidenceTemplateInput, Prisma.ControlEvidenceTemplateUncheckedCreateWithoutEvidenceTemplateInput> | Prisma.ControlEvidenceTemplateCreateWithoutEvidenceTemplateInput[] | Prisma.ControlEvidenceTemplateUncheckedCreateWithoutEvidenceTemplateInput[];
    connectOrCreate?: Prisma.ControlEvidenceTemplateCreateOrConnectWithoutEvidenceTemplateInput | Prisma.ControlEvidenceTemplateCreateOrConnectWithoutEvidenceTemplateInput[];
    createMany?: Prisma.ControlEvidenceTemplateCreateManyEvidenceTemplateInputEnvelope;
    connect?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
};
export type ControlEvidenceTemplateUncheckedCreateNestedManyWithoutEvidenceTemplateInput = {
    create?: Prisma.XOR<Prisma.ControlEvidenceTemplateCreateWithoutEvidenceTemplateInput, Prisma.ControlEvidenceTemplateUncheckedCreateWithoutEvidenceTemplateInput> | Prisma.ControlEvidenceTemplateCreateWithoutEvidenceTemplateInput[] | Prisma.ControlEvidenceTemplateUncheckedCreateWithoutEvidenceTemplateInput[];
    connectOrCreate?: Prisma.ControlEvidenceTemplateCreateOrConnectWithoutEvidenceTemplateInput | Prisma.ControlEvidenceTemplateCreateOrConnectWithoutEvidenceTemplateInput[];
    createMany?: Prisma.ControlEvidenceTemplateCreateManyEvidenceTemplateInputEnvelope;
    connect?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
};
export type ControlEvidenceTemplateUpdateManyWithoutEvidenceTemplateNestedInput = {
    create?: Prisma.XOR<Prisma.ControlEvidenceTemplateCreateWithoutEvidenceTemplateInput, Prisma.ControlEvidenceTemplateUncheckedCreateWithoutEvidenceTemplateInput> | Prisma.ControlEvidenceTemplateCreateWithoutEvidenceTemplateInput[] | Prisma.ControlEvidenceTemplateUncheckedCreateWithoutEvidenceTemplateInput[];
    connectOrCreate?: Prisma.ControlEvidenceTemplateCreateOrConnectWithoutEvidenceTemplateInput | Prisma.ControlEvidenceTemplateCreateOrConnectWithoutEvidenceTemplateInput[];
    upsert?: Prisma.ControlEvidenceTemplateUpsertWithWhereUniqueWithoutEvidenceTemplateInput | Prisma.ControlEvidenceTemplateUpsertWithWhereUniqueWithoutEvidenceTemplateInput[];
    createMany?: Prisma.ControlEvidenceTemplateCreateManyEvidenceTemplateInputEnvelope;
    set?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    disconnect?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    delete?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    connect?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    update?: Prisma.ControlEvidenceTemplateUpdateWithWhereUniqueWithoutEvidenceTemplateInput | Prisma.ControlEvidenceTemplateUpdateWithWhereUniqueWithoutEvidenceTemplateInput[];
    updateMany?: Prisma.ControlEvidenceTemplateUpdateManyWithWhereWithoutEvidenceTemplateInput | Prisma.ControlEvidenceTemplateUpdateManyWithWhereWithoutEvidenceTemplateInput[];
    deleteMany?: Prisma.ControlEvidenceTemplateScalarWhereInput | Prisma.ControlEvidenceTemplateScalarWhereInput[];
};
export type ControlEvidenceTemplateUncheckedUpdateManyWithoutEvidenceTemplateNestedInput = {
    create?: Prisma.XOR<Prisma.ControlEvidenceTemplateCreateWithoutEvidenceTemplateInput, Prisma.ControlEvidenceTemplateUncheckedCreateWithoutEvidenceTemplateInput> | Prisma.ControlEvidenceTemplateCreateWithoutEvidenceTemplateInput[] | Prisma.ControlEvidenceTemplateUncheckedCreateWithoutEvidenceTemplateInput[];
    connectOrCreate?: Prisma.ControlEvidenceTemplateCreateOrConnectWithoutEvidenceTemplateInput | Prisma.ControlEvidenceTemplateCreateOrConnectWithoutEvidenceTemplateInput[];
    upsert?: Prisma.ControlEvidenceTemplateUpsertWithWhereUniqueWithoutEvidenceTemplateInput | Prisma.ControlEvidenceTemplateUpsertWithWhereUniqueWithoutEvidenceTemplateInput[];
    createMany?: Prisma.ControlEvidenceTemplateCreateManyEvidenceTemplateInputEnvelope;
    set?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    disconnect?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    delete?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    connect?: Prisma.ControlEvidenceTemplateWhereUniqueInput | Prisma.ControlEvidenceTemplateWhereUniqueInput[];
    update?: Prisma.ControlEvidenceTemplateUpdateWithWhereUniqueWithoutEvidenceTemplateInput | Prisma.ControlEvidenceTemplateUpdateWithWhereUniqueWithoutEvidenceTemplateInput[];
    updateMany?: Prisma.ControlEvidenceTemplateUpdateManyWithWhereWithoutEvidenceTemplateInput | Prisma.ControlEvidenceTemplateUpdateManyWithWhereWithoutEvidenceTemplateInput[];
    deleteMany?: Prisma.ControlEvidenceTemplateScalarWhereInput | Prisma.ControlEvidenceTemplateScalarWhereInput[];
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type ControlEvidenceTemplateCreateWithoutControlInput = {
    id?: string;
    sequence: number;
    evidenceTemplate: Prisma.EvidenceTemplateCreateNestedOneWithoutControlsInput;
};
export type ControlEvidenceTemplateUncheckedCreateWithoutControlInput = {
    id?: string;
    evidenceTemplateId: string;
    sequence: number;
};
export type ControlEvidenceTemplateCreateOrConnectWithoutControlInput = {
    where: Prisma.ControlEvidenceTemplateWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlEvidenceTemplateCreateWithoutControlInput, Prisma.ControlEvidenceTemplateUncheckedCreateWithoutControlInput>;
};
export type ControlEvidenceTemplateCreateManyControlInputEnvelope = {
    data: Prisma.ControlEvidenceTemplateCreateManyControlInput | Prisma.ControlEvidenceTemplateCreateManyControlInput[];
    skipDuplicates?: boolean;
};
export type ControlEvidenceTemplateUpsertWithWhereUniqueWithoutControlInput = {
    where: Prisma.ControlEvidenceTemplateWhereUniqueInput;
    update: Prisma.XOR<Prisma.ControlEvidenceTemplateUpdateWithoutControlInput, Prisma.ControlEvidenceTemplateUncheckedUpdateWithoutControlInput>;
    create: Prisma.XOR<Prisma.ControlEvidenceTemplateCreateWithoutControlInput, Prisma.ControlEvidenceTemplateUncheckedCreateWithoutControlInput>;
};
export type ControlEvidenceTemplateUpdateWithWhereUniqueWithoutControlInput = {
    where: Prisma.ControlEvidenceTemplateWhereUniqueInput;
    data: Prisma.XOR<Prisma.ControlEvidenceTemplateUpdateWithoutControlInput, Prisma.ControlEvidenceTemplateUncheckedUpdateWithoutControlInput>;
};
export type ControlEvidenceTemplateUpdateManyWithWhereWithoutControlInput = {
    where: Prisma.ControlEvidenceTemplateScalarWhereInput;
    data: Prisma.XOR<Prisma.ControlEvidenceTemplateUpdateManyMutationInput, Prisma.ControlEvidenceTemplateUncheckedUpdateManyWithoutControlInput>;
};
export type ControlEvidenceTemplateScalarWhereInput = {
    AND?: Prisma.ControlEvidenceTemplateScalarWhereInput | Prisma.ControlEvidenceTemplateScalarWhereInput[];
    OR?: Prisma.ControlEvidenceTemplateScalarWhereInput[];
    NOT?: Prisma.ControlEvidenceTemplateScalarWhereInput | Prisma.ControlEvidenceTemplateScalarWhereInput[];
    id?: Prisma.UuidFilter<"ControlEvidenceTemplate"> | string;
    controlId?: Prisma.UuidFilter<"ControlEvidenceTemplate"> | string;
    evidenceTemplateId?: Prisma.UuidFilter<"ControlEvidenceTemplate"> | string;
    sequence?: Prisma.IntFilter<"ControlEvidenceTemplate"> | number;
};
export type ControlEvidenceTemplateCreateWithoutEvidenceTemplateInput = {
    id?: string;
    sequence: number;
    control: Prisma.ControlCreateNestedOneWithoutEvidenceTemplatesInput;
};
export type ControlEvidenceTemplateUncheckedCreateWithoutEvidenceTemplateInput = {
    id?: string;
    controlId: string;
    sequence: number;
};
export type ControlEvidenceTemplateCreateOrConnectWithoutEvidenceTemplateInput = {
    where: Prisma.ControlEvidenceTemplateWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlEvidenceTemplateCreateWithoutEvidenceTemplateInput, Prisma.ControlEvidenceTemplateUncheckedCreateWithoutEvidenceTemplateInput>;
};
export type ControlEvidenceTemplateCreateManyEvidenceTemplateInputEnvelope = {
    data: Prisma.ControlEvidenceTemplateCreateManyEvidenceTemplateInput | Prisma.ControlEvidenceTemplateCreateManyEvidenceTemplateInput[];
    skipDuplicates?: boolean;
};
export type ControlEvidenceTemplateUpsertWithWhereUniqueWithoutEvidenceTemplateInput = {
    where: Prisma.ControlEvidenceTemplateWhereUniqueInput;
    update: Prisma.XOR<Prisma.ControlEvidenceTemplateUpdateWithoutEvidenceTemplateInput, Prisma.ControlEvidenceTemplateUncheckedUpdateWithoutEvidenceTemplateInput>;
    create: Prisma.XOR<Prisma.ControlEvidenceTemplateCreateWithoutEvidenceTemplateInput, Prisma.ControlEvidenceTemplateUncheckedCreateWithoutEvidenceTemplateInput>;
};
export type ControlEvidenceTemplateUpdateWithWhereUniqueWithoutEvidenceTemplateInput = {
    where: Prisma.ControlEvidenceTemplateWhereUniqueInput;
    data: Prisma.XOR<Prisma.ControlEvidenceTemplateUpdateWithoutEvidenceTemplateInput, Prisma.ControlEvidenceTemplateUncheckedUpdateWithoutEvidenceTemplateInput>;
};
export type ControlEvidenceTemplateUpdateManyWithWhereWithoutEvidenceTemplateInput = {
    where: Prisma.ControlEvidenceTemplateScalarWhereInput;
    data: Prisma.XOR<Prisma.ControlEvidenceTemplateUpdateManyMutationInput, Prisma.ControlEvidenceTemplateUncheckedUpdateManyWithoutEvidenceTemplateInput>;
};
export type ControlEvidenceTemplateCreateManyControlInput = {
    id?: string;
    evidenceTemplateId: string;
    sequence: number;
};
export type ControlEvidenceTemplateUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    evidenceTemplate?: Prisma.EvidenceTemplateUpdateOneRequiredWithoutControlsNestedInput;
};
export type ControlEvidenceTemplateUncheckedUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    evidenceTemplateId?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ControlEvidenceTemplateUncheckedUpdateManyWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    evidenceTemplateId?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ControlEvidenceTemplateCreateManyEvidenceTemplateInput = {
    id?: string;
    controlId: string;
    sequence: number;
};
export type ControlEvidenceTemplateUpdateWithoutEvidenceTemplateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    control?: Prisma.ControlUpdateOneRequiredWithoutEvidenceTemplatesNestedInput;
};
export type ControlEvidenceTemplateUncheckedUpdateWithoutEvidenceTemplateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ControlEvidenceTemplateUncheckedUpdateManyWithoutEvidenceTemplateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ControlEvidenceTemplateSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    evidenceTemplateId?: boolean;
    sequence?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    evidenceTemplate?: boolean | Prisma.EvidenceTemplateDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlEvidenceTemplate"]>;
export type ControlEvidenceTemplateSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    evidenceTemplateId?: boolean;
    sequence?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    evidenceTemplate?: boolean | Prisma.EvidenceTemplateDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlEvidenceTemplate"]>;
export type ControlEvidenceTemplateSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    evidenceTemplateId?: boolean;
    sequence?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    evidenceTemplate?: boolean | Prisma.EvidenceTemplateDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlEvidenceTemplate"]>;
export type ControlEvidenceTemplateSelectScalar = {
    id?: boolean;
    controlId?: boolean;
    evidenceTemplateId?: boolean;
    sequence?: boolean;
};
export type ControlEvidenceTemplateOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "controlId" | "evidenceTemplateId" | "sequence", ExtArgs["result"]["controlEvidenceTemplate"]>;
export type ControlEvidenceTemplateInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    evidenceTemplate?: boolean | Prisma.EvidenceTemplateDefaultArgs<ExtArgs>;
};
export type ControlEvidenceTemplateIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    evidenceTemplate?: boolean | Prisma.EvidenceTemplateDefaultArgs<ExtArgs>;
};
export type ControlEvidenceTemplateIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
    evidenceTemplate?: boolean | Prisma.EvidenceTemplateDefaultArgs<ExtArgs>;
};
export type $ControlEvidenceTemplatePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ControlEvidenceTemplate";
    objects: {
        control: Prisma.$ControlPayload<ExtArgs>;
        evidenceTemplate: Prisma.$EvidenceTemplatePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        controlId: string;
        evidenceTemplateId: string;
        sequence: number;
    }, ExtArgs["result"]["controlEvidenceTemplate"]>;
    composites: {};
};
export type ControlEvidenceTemplateGetPayload<S extends boolean | null | undefined | ControlEvidenceTemplateDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ControlEvidenceTemplatePayload, S>;
export type ControlEvidenceTemplateCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ControlEvidenceTemplateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ControlEvidenceTemplateCountAggregateInputType | true;
};
export interface ControlEvidenceTemplateDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ControlEvidenceTemplate'];
        meta: {
            name: 'ControlEvidenceTemplate';
        };
    };
    findUnique<T extends ControlEvidenceTemplateFindUniqueArgs>(args: Prisma.SelectSubset<T, ControlEvidenceTemplateFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ControlEvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$ControlEvidenceTemplatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ControlEvidenceTemplateFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ControlEvidenceTemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ControlEvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$ControlEvidenceTemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ControlEvidenceTemplateFindFirstArgs>(args?: Prisma.SelectSubset<T, ControlEvidenceTemplateFindFirstArgs<ExtArgs>>): Prisma.Prisma__ControlEvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$ControlEvidenceTemplatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ControlEvidenceTemplateFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ControlEvidenceTemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ControlEvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$ControlEvidenceTemplatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ControlEvidenceTemplateFindManyArgs>(args?: Prisma.SelectSubset<T, ControlEvidenceTemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlEvidenceTemplatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ControlEvidenceTemplateCreateArgs>(args: Prisma.SelectSubset<T, ControlEvidenceTemplateCreateArgs<ExtArgs>>): Prisma.Prisma__ControlEvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$ControlEvidenceTemplatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ControlEvidenceTemplateCreateManyArgs>(args?: Prisma.SelectSubset<T, ControlEvidenceTemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ControlEvidenceTemplateCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ControlEvidenceTemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlEvidenceTemplatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ControlEvidenceTemplateDeleteArgs>(args: Prisma.SelectSubset<T, ControlEvidenceTemplateDeleteArgs<ExtArgs>>): Prisma.Prisma__ControlEvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$ControlEvidenceTemplatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ControlEvidenceTemplateUpdateArgs>(args: Prisma.SelectSubset<T, ControlEvidenceTemplateUpdateArgs<ExtArgs>>): Prisma.Prisma__ControlEvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$ControlEvidenceTemplatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ControlEvidenceTemplateDeleteManyArgs>(args?: Prisma.SelectSubset<T, ControlEvidenceTemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ControlEvidenceTemplateUpdateManyArgs>(args: Prisma.SelectSubset<T, ControlEvidenceTemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ControlEvidenceTemplateUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ControlEvidenceTemplateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlEvidenceTemplatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ControlEvidenceTemplateUpsertArgs>(args: Prisma.SelectSubset<T, ControlEvidenceTemplateUpsertArgs<ExtArgs>>): Prisma.Prisma__ControlEvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$ControlEvidenceTemplatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ControlEvidenceTemplateCountArgs>(args?: Prisma.Subset<T, ControlEvidenceTemplateCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ControlEvidenceTemplateCountAggregateOutputType> : number>;
    aggregate<T extends ControlEvidenceTemplateAggregateArgs>(args: Prisma.Subset<T, ControlEvidenceTemplateAggregateArgs>): Prisma.PrismaPromise<GetControlEvidenceTemplateAggregateType<T>>;
    groupBy<T extends ControlEvidenceTemplateGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ControlEvidenceTemplateGroupByArgs['orderBy'];
    } : {
        orderBy?: ControlEvidenceTemplateGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ControlEvidenceTemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetControlEvidenceTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ControlEvidenceTemplateFieldRefs;
}
export interface Prisma__ControlEvidenceTemplateClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    control<T extends Prisma.ControlDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ControlDefaultArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    evidenceTemplate<T extends Prisma.EvidenceTemplateDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EvidenceTemplateDefaultArgs<ExtArgs>>): Prisma.Prisma__EvidenceTemplateClient<runtime.Types.Result.GetResult<Prisma.$EvidenceTemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ControlEvidenceTemplateFieldRefs {
    readonly id: Prisma.FieldRef<"ControlEvidenceTemplate", 'String'>;
    readonly controlId: Prisma.FieldRef<"ControlEvidenceTemplate", 'String'>;
    readonly evidenceTemplateId: Prisma.FieldRef<"ControlEvidenceTemplate", 'String'>;
    readonly sequence: Prisma.FieldRef<"ControlEvidenceTemplate", 'Int'>;
}
export type ControlEvidenceTemplateFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlEvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.ControlEvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.ControlEvidenceTemplateInclude<ExtArgs> | null;
    where: Prisma.ControlEvidenceTemplateWhereUniqueInput;
};
export type ControlEvidenceTemplateFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlEvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.ControlEvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.ControlEvidenceTemplateInclude<ExtArgs> | null;
    where: Prisma.ControlEvidenceTemplateWhereUniqueInput;
};
export type ControlEvidenceTemplateFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ControlEvidenceTemplateFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ControlEvidenceTemplateFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ControlEvidenceTemplateCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlEvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.ControlEvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.ControlEvidenceTemplateInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlEvidenceTemplateCreateInput, Prisma.ControlEvidenceTemplateUncheckedCreateInput>;
};
export type ControlEvidenceTemplateCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ControlEvidenceTemplateCreateManyInput | Prisma.ControlEvidenceTemplateCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ControlEvidenceTemplateCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlEvidenceTemplateSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ControlEvidenceTemplateOmit<ExtArgs> | null;
    data: Prisma.ControlEvidenceTemplateCreateManyInput | Prisma.ControlEvidenceTemplateCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ControlEvidenceTemplateIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ControlEvidenceTemplateUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlEvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.ControlEvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.ControlEvidenceTemplateInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlEvidenceTemplateUpdateInput, Prisma.ControlEvidenceTemplateUncheckedUpdateInput>;
    where: Prisma.ControlEvidenceTemplateWhereUniqueInput;
};
export type ControlEvidenceTemplateUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ControlEvidenceTemplateUpdateManyMutationInput, Prisma.ControlEvidenceTemplateUncheckedUpdateManyInput>;
    where?: Prisma.ControlEvidenceTemplateWhereInput;
    limit?: number;
};
export type ControlEvidenceTemplateUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlEvidenceTemplateSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ControlEvidenceTemplateOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlEvidenceTemplateUpdateManyMutationInput, Prisma.ControlEvidenceTemplateUncheckedUpdateManyInput>;
    where?: Prisma.ControlEvidenceTemplateWhereInput;
    limit?: number;
    include?: Prisma.ControlEvidenceTemplateIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ControlEvidenceTemplateUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlEvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.ControlEvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.ControlEvidenceTemplateInclude<ExtArgs> | null;
    where: Prisma.ControlEvidenceTemplateWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlEvidenceTemplateCreateInput, Prisma.ControlEvidenceTemplateUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ControlEvidenceTemplateUpdateInput, Prisma.ControlEvidenceTemplateUncheckedUpdateInput>;
};
export type ControlEvidenceTemplateDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlEvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.ControlEvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.ControlEvidenceTemplateInclude<ExtArgs> | null;
    where: Prisma.ControlEvidenceTemplateWhereUniqueInput;
};
export type ControlEvidenceTemplateDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlEvidenceTemplateWhereInput;
    limit?: number;
};
export type ControlEvidenceTemplateDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlEvidenceTemplateSelect<ExtArgs> | null;
    omit?: Prisma.ControlEvidenceTemplateOmit<ExtArgs> | null;
    include?: Prisma.ControlEvidenceTemplateInclude<ExtArgs> | null;
};
export {};
