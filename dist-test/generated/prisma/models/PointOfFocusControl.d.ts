import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type PointOfFocusControlModel = runtime.Types.Result.DefaultSelection<Prisma.$PointOfFocusControlPayload>;
export type AggregatePointOfFocusControl = {
    _count: PointOfFocusControlCountAggregateOutputType | null;
    _min: PointOfFocusControlMinAggregateOutputType | null;
    _max: PointOfFocusControlMaxAggregateOutputType | null;
};
export type PointOfFocusControlMinAggregateOutputType = {
    id: string | null;
    pointOfFocusId: string | null;
    controlId: string | null;
};
export type PointOfFocusControlMaxAggregateOutputType = {
    id: string | null;
    pointOfFocusId: string | null;
    controlId: string | null;
};
export type PointOfFocusControlCountAggregateOutputType = {
    id: number;
    pointOfFocusId: number;
    controlId: number;
    _all: number;
};
export type PointOfFocusControlMinAggregateInputType = {
    id?: true;
    pointOfFocusId?: true;
    controlId?: true;
};
export type PointOfFocusControlMaxAggregateInputType = {
    id?: true;
    pointOfFocusId?: true;
    controlId?: true;
};
export type PointOfFocusControlCountAggregateInputType = {
    id?: true;
    pointOfFocusId?: true;
    controlId?: true;
    _all?: true;
};
export type PointOfFocusControlAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PointOfFocusControlWhereInput;
    orderBy?: Prisma.PointOfFocusControlOrderByWithRelationInput | Prisma.PointOfFocusControlOrderByWithRelationInput[];
    cursor?: Prisma.PointOfFocusControlWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | PointOfFocusControlCountAggregateInputType;
    _min?: PointOfFocusControlMinAggregateInputType;
    _max?: PointOfFocusControlMaxAggregateInputType;
};
export type GetPointOfFocusControlAggregateType<T extends PointOfFocusControlAggregateArgs> = {
    [P in keyof T & keyof AggregatePointOfFocusControl]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePointOfFocusControl[P]> : Prisma.GetScalarType<T[P], AggregatePointOfFocusControl[P]>;
};
export type PointOfFocusControlGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PointOfFocusControlWhereInput;
    orderBy?: Prisma.PointOfFocusControlOrderByWithAggregationInput | Prisma.PointOfFocusControlOrderByWithAggregationInput[];
    by: Prisma.PointOfFocusControlScalarFieldEnum[] | Prisma.PointOfFocusControlScalarFieldEnum;
    having?: Prisma.PointOfFocusControlScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PointOfFocusControlCountAggregateInputType | true;
    _min?: PointOfFocusControlMinAggregateInputType;
    _max?: PointOfFocusControlMaxAggregateInputType;
};
export type PointOfFocusControlGroupByOutputType = {
    id: string;
    pointOfFocusId: string;
    controlId: string;
    _count: PointOfFocusControlCountAggregateOutputType | null;
    _min: PointOfFocusControlMinAggregateOutputType | null;
    _max: PointOfFocusControlMaxAggregateOutputType | null;
};
type GetPointOfFocusControlGroupByPayload<T extends PointOfFocusControlGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PointOfFocusControlGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PointOfFocusControlGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PointOfFocusControlGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PointOfFocusControlGroupByOutputType[P]>;
}>>;
export type PointOfFocusControlWhereInput = {
    AND?: Prisma.PointOfFocusControlWhereInput | Prisma.PointOfFocusControlWhereInput[];
    OR?: Prisma.PointOfFocusControlWhereInput[];
    NOT?: Prisma.PointOfFocusControlWhereInput | Prisma.PointOfFocusControlWhereInput[];
    id?: Prisma.UuidFilter<"PointOfFocusControl"> | string;
    pointOfFocusId?: Prisma.UuidFilter<"PointOfFocusControl"> | string;
    controlId?: Prisma.UuidFilter<"PointOfFocusControl"> | string;
    pointOfFocus?: Prisma.XOR<Prisma.PointOfFocusScalarRelationFilter, Prisma.PointOfFocusWhereInput>;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
};
export type PointOfFocusControlOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    pointOfFocusId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    pointOfFocus?: Prisma.PointOfFocusOrderByWithRelationInput;
    control?: Prisma.ControlOrderByWithRelationInput;
};
export type PointOfFocusControlWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    pointOfFocusId_controlId?: Prisma.PointOfFocusControlPointOfFocusIdControlIdCompoundUniqueInput;
    AND?: Prisma.PointOfFocusControlWhereInput | Prisma.PointOfFocusControlWhereInput[];
    OR?: Prisma.PointOfFocusControlWhereInput[];
    NOT?: Prisma.PointOfFocusControlWhereInput | Prisma.PointOfFocusControlWhereInput[];
    pointOfFocusId?: Prisma.UuidFilter<"PointOfFocusControl"> | string;
    controlId?: Prisma.UuidFilter<"PointOfFocusControl"> | string;
    pointOfFocus?: Prisma.XOR<Prisma.PointOfFocusScalarRelationFilter, Prisma.PointOfFocusWhereInput>;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
}, "id" | "pointOfFocusId_controlId">;
export type PointOfFocusControlOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    pointOfFocusId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    _count?: Prisma.PointOfFocusControlCountOrderByAggregateInput;
    _max?: Prisma.PointOfFocusControlMaxOrderByAggregateInput;
    _min?: Prisma.PointOfFocusControlMinOrderByAggregateInput;
};
export type PointOfFocusControlScalarWhereWithAggregatesInput = {
    AND?: Prisma.PointOfFocusControlScalarWhereWithAggregatesInput | Prisma.PointOfFocusControlScalarWhereWithAggregatesInput[];
    OR?: Prisma.PointOfFocusControlScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PointOfFocusControlScalarWhereWithAggregatesInput | Prisma.PointOfFocusControlScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"PointOfFocusControl"> | string;
    pointOfFocusId?: Prisma.UuidWithAggregatesFilter<"PointOfFocusControl"> | string;
    controlId?: Prisma.UuidWithAggregatesFilter<"PointOfFocusControl"> | string;
};
export type PointOfFocusControlCreateInput = {
    id?: string;
    pointOfFocus: Prisma.PointOfFocusCreateNestedOneWithoutPointOfFocusControlsInput;
    control: Prisma.ControlCreateNestedOneWithoutPointOfFocusControlsInput;
};
export type PointOfFocusControlUncheckedCreateInput = {
    id?: string;
    pointOfFocusId: string;
    controlId: string;
};
export type PointOfFocusControlUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    pointOfFocus?: Prisma.PointOfFocusUpdateOneRequiredWithoutPointOfFocusControlsNestedInput;
    control?: Prisma.ControlUpdateOneRequiredWithoutPointOfFocusControlsNestedInput;
};
export type PointOfFocusControlUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    pointOfFocusId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PointOfFocusControlCreateManyInput = {
    id?: string;
    pointOfFocusId: string;
    controlId: string;
};
export type PointOfFocusControlUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PointOfFocusControlUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    pointOfFocusId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PointOfFocusControlListRelationFilter = {
    every?: Prisma.PointOfFocusControlWhereInput;
    some?: Prisma.PointOfFocusControlWhereInput;
    none?: Prisma.PointOfFocusControlWhereInput;
};
export type PointOfFocusControlOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type PointOfFocusControlPointOfFocusIdControlIdCompoundUniqueInput = {
    pointOfFocusId: string;
    controlId: string;
};
export type PointOfFocusControlCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    pointOfFocusId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
};
export type PointOfFocusControlMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    pointOfFocusId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
};
export type PointOfFocusControlMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    pointOfFocusId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
};
export type PointOfFocusControlCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.PointOfFocusControlCreateWithoutControlInput, Prisma.PointOfFocusControlUncheckedCreateWithoutControlInput> | Prisma.PointOfFocusControlCreateWithoutControlInput[] | Prisma.PointOfFocusControlUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.PointOfFocusControlCreateOrConnectWithoutControlInput | Prisma.PointOfFocusControlCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.PointOfFocusControlCreateManyControlInputEnvelope;
    connect?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
};
export type PointOfFocusControlUncheckedCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.PointOfFocusControlCreateWithoutControlInput, Prisma.PointOfFocusControlUncheckedCreateWithoutControlInput> | Prisma.PointOfFocusControlCreateWithoutControlInput[] | Prisma.PointOfFocusControlUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.PointOfFocusControlCreateOrConnectWithoutControlInput | Prisma.PointOfFocusControlCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.PointOfFocusControlCreateManyControlInputEnvelope;
    connect?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
};
export type PointOfFocusControlUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.PointOfFocusControlCreateWithoutControlInput, Prisma.PointOfFocusControlUncheckedCreateWithoutControlInput> | Prisma.PointOfFocusControlCreateWithoutControlInput[] | Prisma.PointOfFocusControlUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.PointOfFocusControlCreateOrConnectWithoutControlInput | Prisma.PointOfFocusControlCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.PointOfFocusControlUpsertWithWhereUniqueWithoutControlInput | Prisma.PointOfFocusControlUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.PointOfFocusControlCreateManyControlInputEnvelope;
    set?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    disconnect?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    delete?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    connect?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    update?: Prisma.PointOfFocusControlUpdateWithWhereUniqueWithoutControlInput | Prisma.PointOfFocusControlUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.PointOfFocusControlUpdateManyWithWhereWithoutControlInput | Prisma.PointOfFocusControlUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.PointOfFocusControlScalarWhereInput | Prisma.PointOfFocusControlScalarWhereInput[];
};
export type PointOfFocusControlUncheckedUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.PointOfFocusControlCreateWithoutControlInput, Prisma.PointOfFocusControlUncheckedCreateWithoutControlInput> | Prisma.PointOfFocusControlCreateWithoutControlInput[] | Prisma.PointOfFocusControlUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.PointOfFocusControlCreateOrConnectWithoutControlInput | Prisma.PointOfFocusControlCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.PointOfFocusControlUpsertWithWhereUniqueWithoutControlInput | Prisma.PointOfFocusControlUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.PointOfFocusControlCreateManyControlInputEnvelope;
    set?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    disconnect?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    delete?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    connect?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    update?: Prisma.PointOfFocusControlUpdateWithWhereUniqueWithoutControlInput | Prisma.PointOfFocusControlUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.PointOfFocusControlUpdateManyWithWhereWithoutControlInput | Prisma.PointOfFocusControlUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.PointOfFocusControlScalarWhereInput | Prisma.PointOfFocusControlScalarWhereInput[];
};
export type PointOfFocusControlCreateNestedManyWithoutPointOfFocusInput = {
    create?: Prisma.XOR<Prisma.PointOfFocusControlCreateWithoutPointOfFocusInput, Prisma.PointOfFocusControlUncheckedCreateWithoutPointOfFocusInput> | Prisma.PointOfFocusControlCreateWithoutPointOfFocusInput[] | Prisma.PointOfFocusControlUncheckedCreateWithoutPointOfFocusInput[];
    connectOrCreate?: Prisma.PointOfFocusControlCreateOrConnectWithoutPointOfFocusInput | Prisma.PointOfFocusControlCreateOrConnectWithoutPointOfFocusInput[];
    createMany?: Prisma.PointOfFocusControlCreateManyPointOfFocusInputEnvelope;
    connect?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
};
export type PointOfFocusControlUncheckedCreateNestedManyWithoutPointOfFocusInput = {
    create?: Prisma.XOR<Prisma.PointOfFocusControlCreateWithoutPointOfFocusInput, Prisma.PointOfFocusControlUncheckedCreateWithoutPointOfFocusInput> | Prisma.PointOfFocusControlCreateWithoutPointOfFocusInput[] | Prisma.PointOfFocusControlUncheckedCreateWithoutPointOfFocusInput[];
    connectOrCreate?: Prisma.PointOfFocusControlCreateOrConnectWithoutPointOfFocusInput | Prisma.PointOfFocusControlCreateOrConnectWithoutPointOfFocusInput[];
    createMany?: Prisma.PointOfFocusControlCreateManyPointOfFocusInputEnvelope;
    connect?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
};
export type PointOfFocusControlUpdateManyWithoutPointOfFocusNestedInput = {
    create?: Prisma.XOR<Prisma.PointOfFocusControlCreateWithoutPointOfFocusInput, Prisma.PointOfFocusControlUncheckedCreateWithoutPointOfFocusInput> | Prisma.PointOfFocusControlCreateWithoutPointOfFocusInput[] | Prisma.PointOfFocusControlUncheckedCreateWithoutPointOfFocusInput[];
    connectOrCreate?: Prisma.PointOfFocusControlCreateOrConnectWithoutPointOfFocusInput | Prisma.PointOfFocusControlCreateOrConnectWithoutPointOfFocusInput[];
    upsert?: Prisma.PointOfFocusControlUpsertWithWhereUniqueWithoutPointOfFocusInput | Prisma.PointOfFocusControlUpsertWithWhereUniqueWithoutPointOfFocusInput[];
    createMany?: Prisma.PointOfFocusControlCreateManyPointOfFocusInputEnvelope;
    set?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    disconnect?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    delete?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    connect?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    update?: Prisma.PointOfFocusControlUpdateWithWhereUniqueWithoutPointOfFocusInput | Prisma.PointOfFocusControlUpdateWithWhereUniqueWithoutPointOfFocusInput[];
    updateMany?: Prisma.PointOfFocusControlUpdateManyWithWhereWithoutPointOfFocusInput | Prisma.PointOfFocusControlUpdateManyWithWhereWithoutPointOfFocusInput[];
    deleteMany?: Prisma.PointOfFocusControlScalarWhereInput | Prisma.PointOfFocusControlScalarWhereInput[];
};
export type PointOfFocusControlUncheckedUpdateManyWithoutPointOfFocusNestedInput = {
    create?: Prisma.XOR<Prisma.PointOfFocusControlCreateWithoutPointOfFocusInput, Prisma.PointOfFocusControlUncheckedCreateWithoutPointOfFocusInput> | Prisma.PointOfFocusControlCreateWithoutPointOfFocusInput[] | Prisma.PointOfFocusControlUncheckedCreateWithoutPointOfFocusInput[];
    connectOrCreate?: Prisma.PointOfFocusControlCreateOrConnectWithoutPointOfFocusInput | Prisma.PointOfFocusControlCreateOrConnectWithoutPointOfFocusInput[];
    upsert?: Prisma.PointOfFocusControlUpsertWithWhereUniqueWithoutPointOfFocusInput | Prisma.PointOfFocusControlUpsertWithWhereUniqueWithoutPointOfFocusInput[];
    createMany?: Prisma.PointOfFocusControlCreateManyPointOfFocusInputEnvelope;
    set?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    disconnect?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    delete?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    connect?: Prisma.PointOfFocusControlWhereUniqueInput | Prisma.PointOfFocusControlWhereUniqueInput[];
    update?: Prisma.PointOfFocusControlUpdateWithWhereUniqueWithoutPointOfFocusInput | Prisma.PointOfFocusControlUpdateWithWhereUniqueWithoutPointOfFocusInput[];
    updateMany?: Prisma.PointOfFocusControlUpdateManyWithWhereWithoutPointOfFocusInput | Prisma.PointOfFocusControlUpdateManyWithWhereWithoutPointOfFocusInput[];
    deleteMany?: Prisma.PointOfFocusControlScalarWhereInput | Prisma.PointOfFocusControlScalarWhereInput[];
};
export type PointOfFocusControlCreateWithoutControlInput = {
    id?: string;
    pointOfFocus: Prisma.PointOfFocusCreateNestedOneWithoutPointOfFocusControlsInput;
};
export type PointOfFocusControlUncheckedCreateWithoutControlInput = {
    id?: string;
    pointOfFocusId: string;
};
export type PointOfFocusControlCreateOrConnectWithoutControlInput = {
    where: Prisma.PointOfFocusControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.PointOfFocusControlCreateWithoutControlInput, Prisma.PointOfFocusControlUncheckedCreateWithoutControlInput>;
};
export type PointOfFocusControlCreateManyControlInputEnvelope = {
    data: Prisma.PointOfFocusControlCreateManyControlInput | Prisma.PointOfFocusControlCreateManyControlInput[];
    skipDuplicates?: boolean;
};
export type PointOfFocusControlUpsertWithWhereUniqueWithoutControlInput = {
    where: Prisma.PointOfFocusControlWhereUniqueInput;
    update: Prisma.XOR<Prisma.PointOfFocusControlUpdateWithoutControlInput, Prisma.PointOfFocusControlUncheckedUpdateWithoutControlInput>;
    create: Prisma.XOR<Prisma.PointOfFocusControlCreateWithoutControlInput, Prisma.PointOfFocusControlUncheckedCreateWithoutControlInput>;
};
export type PointOfFocusControlUpdateWithWhereUniqueWithoutControlInput = {
    where: Prisma.PointOfFocusControlWhereUniqueInput;
    data: Prisma.XOR<Prisma.PointOfFocusControlUpdateWithoutControlInput, Prisma.PointOfFocusControlUncheckedUpdateWithoutControlInput>;
};
export type PointOfFocusControlUpdateManyWithWhereWithoutControlInput = {
    where: Prisma.PointOfFocusControlScalarWhereInput;
    data: Prisma.XOR<Prisma.PointOfFocusControlUpdateManyMutationInput, Prisma.PointOfFocusControlUncheckedUpdateManyWithoutControlInput>;
};
export type PointOfFocusControlScalarWhereInput = {
    AND?: Prisma.PointOfFocusControlScalarWhereInput | Prisma.PointOfFocusControlScalarWhereInput[];
    OR?: Prisma.PointOfFocusControlScalarWhereInput[];
    NOT?: Prisma.PointOfFocusControlScalarWhereInput | Prisma.PointOfFocusControlScalarWhereInput[];
    id?: Prisma.UuidFilter<"PointOfFocusControl"> | string;
    pointOfFocusId?: Prisma.UuidFilter<"PointOfFocusControl"> | string;
    controlId?: Prisma.UuidFilter<"PointOfFocusControl"> | string;
};
export type PointOfFocusControlCreateWithoutPointOfFocusInput = {
    id?: string;
    control: Prisma.ControlCreateNestedOneWithoutPointOfFocusControlsInput;
};
export type PointOfFocusControlUncheckedCreateWithoutPointOfFocusInput = {
    id?: string;
    controlId: string;
};
export type PointOfFocusControlCreateOrConnectWithoutPointOfFocusInput = {
    where: Prisma.PointOfFocusControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.PointOfFocusControlCreateWithoutPointOfFocusInput, Prisma.PointOfFocusControlUncheckedCreateWithoutPointOfFocusInput>;
};
export type PointOfFocusControlCreateManyPointOfFocusInputEnvelope = {
    data: Prisma.PointOfFocusControlCreateManyPointOfFocusInput | Prisma.PointOfFocusControlCreateManyPointOfFocusInput[];
    skipDuplicates?: boolean;
};
export type PointOfFocusControlUpsertWithWhereUniqueWithoutPointOfFocusInput = {
    where: Prisma.PointOfFocusControlWhereUniqueInput;
    update: Prisma.XOR<Prisma.PointOfFocusControlUpdateWithoutPointOfFocusInput, Prisma.PointOfFocusControlUncheckedUpdateWithoutPointOfFocusInput>;
    create: Prisma.XOR<Prisma.PointOfFocusControlCreateWithoutPointOfFocusInput, Prisma.PointOfFocusControlUncheckedCreateWithoutPointOfFocusInput>;
};
export type PointOfFocusControlUpdateWithWhereUniqueWithoutPointOfFocusInput = {
    where: Prisma.PointOfFocusControlWhereUniqueInput;
    data: Prisma.XOR<Prisma.PointOfFocusControlUpdateWithoutPointOfFocusInput, Prisma.PointOfFocusControlUncheckedUpdateWithoutPointOfFocusInput>;
};
export type PointOfFocusControlUpdateManyWithWhereWithoutPointOfFocusInput = {
    where: Prisma.PointOfFocusControlScalarWhereInput;
    data: Prisma.XOR<Prisma.PointOfFocusControlUpdateManyMutationInput, Prisma.PointOfFocusControlUncheckedUpdateManyWithoutPointOfFocusInput>;
};
export type PointOfFocusControlCreateManyControlInput = {
    id?: string;
    pointOfFocusId: string;
};
export type PointOfFocusControlUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    pointOfFocus?: Prisma.PointOfFocusUpdateOneRequiredWithoutPointOfFocusControlsNestedInput;
};
export type PointOfFocusControlUncheckedUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    pointOfFocusId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PointOfFocusControlUncheckedUpdateManyWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    pointOfFocusId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PointOfFocusControlCreateManyPointOfFocusInput = {
    id?: string;
    controlId: string;
};
export type PointOfFocusControlUpdateWithoutPointOfFocusInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    control?: Prisma.ControlUpdateOneRequiredWithoutPointOfFocusControlsNestedInput;
};
export type PointOfFocusControlUncheckedUpdateWithoutPointOfFocusInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PointOfFocusControlUncheckedUpdateManyWithoutPointOfFocusInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type PointOfFocusControlSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    pointOfFocusId?: boolean;
    controlId?: boolean;
    pointOfFocus?: boolean | Prisma.PointOfFocusDefaultArgs<ExtArgs>;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["pointOfFocusControl"]>;
export type PointOfFocusControlSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    pointOfFocusId?: boolean;
    controlId?: boolean;
    pointOfFocus?: boolean | Prisma.PointOfFocusDefaultArgs<ExtArgs>;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["pointOfFocusControl"]>;
export type PointOfFocusControlSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    pointOfFocusId?: boolean;
    controlId?: boolean;
    pointOfFocus?: boolean | Prisma.PointOfFocusDefaultArgs<ExtArgs>;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["pointOfFocusControl"]>;
export type PointOfFocusControlSelectScalar = {
    id?: boolean;
    pointOfFocusId?: boolean;
    controlId?: boolean;
};
export type PointOfFocusControlOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "pointOfFocusId" | "controlId", ExtArgs["result"]["pointOfFocusControl"]>;
export type PointOfFocusControlInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    pointOfFocus?: boolean | Prisma.PointOfFocusDefaultArgs<ExtArgs>;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type PointOfFocusControlIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    pointOfFocus?: boolean | Prisma.PointOfFocusDefaultArgs<ExtArgs>;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type PointOfFocusControlIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    pointOfFocus?: boolean | Prisma.PointOfFocusDefaultArgs<ExtArgs>;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type $PointOfFocusControlPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "PointOfFocusControl";
    objects: {
        pointOfFocus: Prisma.$PointOfFocusPayload<ExtArgs>;
        control: Prisma.$ControlPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        pointOfFocusId: string;
        controlId: string;
    }, ExtArgs["result"]["pointOfFocusControl"]>;
    composites: {};
};
export type PointOfFocusControlGetPayload<S extends boolean | null | undefined | PointOfFocusControlDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PointOfFocusControlPayload, S>;
export type PointOfFocusControlCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PointOfFocusControlFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PointOfFocusControlCountAggregateInputType | true;
};
export interface PointOfFocusControlDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['PointOfFocusControl'];
        meta: {
            name: 'PointOfFocusControl';
        };
    };
    findUnique<T extends PointOfFocusControlFindUniqueArgs>(args: Prisma.SelectSubset<T, PointOfFocusControlFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusControlClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusControlPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends PointOfFocusControlFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PointOfFocusControlFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusControlClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends PointOfFocusControlFindFirstArgs>(args?: Prisma.SelectSubset<T, PointOfFocusControlFindFirstArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusControlClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusControlPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends PointOfFocusControlFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PointOfFocusControlFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusControlClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusControlPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends PointOfFocusControlFindManyArgs>(args?: Prisma.SelectSubset<T, PointOfFocusControlFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PointOfFocusControlPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends PointOfFocusControlCreateArgs>(args: Prisma.SelectSubset<T, PointOfFocusControlCreateArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusControlClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusControlPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends PointOfFocusControlCreateManyArgs>(args?: Prisma.SelectSubset<T, PointOfFocusControlCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends PointOfFocusControlCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PointOfFocusControlCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PointOfFocusControlPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends PointOfFocusControlDeleteArgs>(args: Prisma.SelectSubset<T, PointOfFocusControlDeleteArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusControlClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusControlPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends PointOfFocusControlUpdateArgs>(args: Prisma.SelectSubset<T, PointOfFocusControlUpdateArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusControlClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusControlPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends PointOfFocusControlDeleteManyArgs>(args?: Prisma.SelectSubset<T, PointOfFocusControlDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends PointOfFocusControlUpdateManyArgs>(args: Prisma.SelectSubset<T, PointOfFocusControlUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends PointOfFocusControlUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PointOfFocusControlUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PointOfFocusControlPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends PointOfFocusControlUpsertArgs>(args: Prisma.SelectSubset<T, PointOfFocusControlUpsertArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusControlClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusControlPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends PointOfFocusControlCountArgs>(args?: Prisma.Subset<T, PointOfFocusControlCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PointOfFocusControlCountAggregateOutputType> : number>;
    aggregate<T extends PointOfFocusControlAggregateArgs>(args: Prisma.Subset<T, PointOfFocusControlAggregateArgs>): Prisma.PrismaPromise<GetPointOfFocusControlAggregateType<T>>;
    groupBy<T extends PointOfFocusControlGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PointOfFocusControlGroupByArgs['orderBy'];
    } : {
        orderBy?: PointOfFocusControlGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PointOfFocusControlGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPointOfFocusControlGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: PointOfFocusControlFieldRefs;
}
export interface Prisma__PointOfFocusControlClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    pointOfFocus<T extends Prisma.PointOfFocusDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PointOfFocusDefaultArgs<ExtArgs>>): Prisma.Prisma__PointOfFocusClient<runtime.Types.Result.GetResult<Prisma.$PointOfFocusPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    control<T extends Prisma.ControlDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ControlDefaultArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface PointOfFocusControlFieldRefs {
    readonly id: Prisma.FieldRef<"PointOfFocusControl", 'String'>;
    readonly pointOfFocusId: Prisma.FieldRef<"PointOfFocusControl", 'String'>;
    readonly controlId: Prisma.FieldRef<"PointOfFocusControl", 'String'>;
}
export type PointOfFocusControlFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusControlSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusControlOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusControlInclude<ExtArgs> | null;
    where: Prisma.PointOfFocusControlWhereUniqueInput;
};
export type PointOfFocusControlFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusControlSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusControlOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusControlInclude<ExtArgs> | null;
    where: Prisma.PointOfFocusControlWhereUniqueInput;
};
export type PointOfFocusControlFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PointOfFocusControlFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PointOfFocusControlFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PointOfFocusControlCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusControlSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusControlOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusControlInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PointOfFocusControlCreateInput, Prisma.PointOfFocusControlUncheckedCreateInput>;
};
export type PointOfFocusControlCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.PointOfFocusControlCreateManyInput | Prisma.PointOfFocusControlCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PointOfFocusControlCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusControlSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PointOfFocusControlOmit<ExtArgs> | null;
    data: Prisma.PointOfFocusControlCreateManyInput | Prisma.PointOfFocusControlCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.PointOfFocusControlIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type PointOfFocusControlUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusControlSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusControlOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusControlInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PointOfFocusControlUpdateInput, Prisma.PointOfFocusControlUncheckedUpdateInput>;
    where: Prisma.PointOfFocusControlWhereUniqueInput;
};
export type PointOfFocusControlUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.PointOfFocusControlUpdateManyMutationInput, Prisma.PointOfFocusControlUncheckedUpdateManyInput>;
    where?: Prisma.PointOfFocusControlWhereInput;
    limit?: number;
};
export type PointOfFocusControlUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusControlSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PointOfFocusControlOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PointOfFocusControlUpdateManyMutationInput, Prisma.PointOfFocusControlUncheckedUpdateManyInput>;
    where?: Prisma.PointOfFocusControlWhereInput;
    limit?: number;
    include?: Prisma.PointOfFocusControlIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type PointOfFocusControlUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusControlSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusControlOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusControlInclude<ExtArgs> | null;
    where: Prisma.PointOfFocusControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.PointOfFocusControlCreateInput, Prisma.PointOfFocusControlUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.PointOfFocusControlUpdateInput, Prisma.PointOfFocusControlUncheckedUpdateInput>;
};
export type PointOfFocusControlDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusControlSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusControlOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusControlInclude<ExtArgs> | null;
    where: Prisma.PointOfFocusControlWhereUniqueInput;
};
export type PointOfFocusControlDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PointOfFocusControlWhereInput;
    limit?: number;
};
export type PointOfFocusControlDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PointOfFocusControlSelect<ExtArgs> | null;
    omit?: Prisma.PointOfFocusControlOmit<ExtArgs> | null;
    include?: Prisma.PointOfFocusControlInclude<ExtArgs> | null;
};
export {};
