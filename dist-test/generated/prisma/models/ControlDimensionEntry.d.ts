import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ControlDimensionEntryModel = runtime.Types.Result.DefaultSelection<Prisma.$ControlDimensionEntryPayload>;
export type AggregateControlDimensionEntry = {
    _count: ControlDimensionEntryCountAggregateOutputType | null;
    _min: ControlDimensionEntryMinAggregateOutputType | null;
    _max: ControlDimensionEntryMaxAggregateOutputType | null;
};
export type ControlDimensionEntryMinAggregateOutputType = {
    id: string | null;
    controlId: string | null;
    dimension: $Enums.Dimension | null;
    type: $Enums.ControlDimensionType | null;
    requiresProbe: boolean | null;
    requiresAi: boolean | null;
    requiresComplianceConfirmation: boolean | null;
    reasonNotApplicable: string | null;
};
export type ControlDimensionEntryMaxAggregateOutputType = {
    id: string | null;
    controlId: string | null;
    dimension: $Enums.Dimension | null;
    type: $Enums.ControlDimensionType | null;
    requiresProbe: boolean | null;
    requiresAi: boolean | null;
    requiresComplianceConfirmation: boolean | null;
    reasonNotApplicable: string | null;
};
export type ControlDimensionEntryCountAggregateOutputType = {
    id: number;
    controlId: number;
    dimension: number;
    type: number;
    requiresProbe: number;
    requiresAi: number;
    requiresComplianceConfirmation: number;
    reasonNotApplicable: number;
    _all: number;
};
export type ControlDimensionEntryMinAggregateInputType = {
    id?: true;
    controlId?: true;
    dimension?: true;
    type?: true;
    requiresProbe?: true;
    requiresAi?: true;
    requiresComplianceConfirmation?: true;
    reasonNotApplicable?: true;
};
export type ControlDimensionEntryMaxAggregateInputType = {
    id?: true;
    controlId?: true;
    dimension?: true;
    type?: true;
    requiresProbe?: true;
    requiresAi?: true;
    requiresComplianceConfirmation?: true;
    reasonNotApplicable?: true;
};
export type ControlDimensionEntryCountAggregateInputType = {
    id?: true;
    controlId?: true;
    dimension?: true;
    type?: true;
    requiresProbe?: true;
    requiresAi?: true;
    requiresComplianceConfirmation?: true;
    reasonNotApplicable?: true;
    _all?: true;
};
export type ControlDimensionEntryAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlDimensionEntryWhereInput;
    orderBy?: Prisma.ControlDimensionEntryOrderByWithRelationInput | Prisma.ControlDimensionEntryOrderByWithRelationInput[];
    cursor?: Prisma.ControlDimensionEntryWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ControlDimensionEntryCountAggregateInputType;
    _min?: ControlDimensionEntryMinAggregateInputType;
    _max?: ControlDimensionEntryMaxAggregateInputType;
};
export type GetControlDimensionEntryAggregateType<T extends ControlDimensionEntryAggregateArgs> = {
    [P in keyof T & keyof AggregateControlDimensionEntry]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateControlDimensionEntry[P]> : Prisma.GetScalarType<T[P], AggregateControlDimensionEntry[P]>;
};
export type ControlDimensionEntryGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlDimensionEntryWhereInput;
    orderBy?: Prisma.ControlDimensionEntryOrderByWithAggregationInput | Prisma.ControlDimensionEntryOrderByWithAggregationInput[];
    by: Prisma.ControlDimensionEntryScalarFieldEnum[] | Prisma.ControlDimensionEntryScalarFieldEnum;
    having?: Prisma.ControlDimensionEntryScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ControlDimensionEntryCountAggregateInputType | true;
    _min?: ControlDimensionEntryMinAggregateInputType;
    _max?: ControlDimensionEntryMaxAggregateInputType;
};
export type ControlDimensionEntryGroupByOutputType = {
    id: string;
    controlId: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe: boolean;
    requiresAi: boolean;
    requiresComplianceConfirmation: boolean;
    reasonNotApplicable: string | null;
    _count: ControlDimensionEntryCountAggregateOutputType | null;
    _min: ControlDimensionEntryMinAggregateOutputType | null;
    _max: ControlDimensionEntryMaxAggregateOutputType | null;
};
type GetControlDimensionEntryGroupByPayload<T extends ControlDimensionEntryGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ControlDimensionEntryGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ControlDimensionEntryGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ControlDimensionEntryGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ControlDimensionEntryGroupByOutputType[P]>;
}>>;
export type ControlDimensionEntryWhereInput = {
    AND?: Prisma.ControlDimensionEntryWhereInput | Prisma.ControlDimensionEntryWhereInput[];
    OR?: Prisma.ControlDimensionEntryWhereInput[];
    NOT?: Prisma.ControlDimensionEntryWhereInput | Prisma.ControlDimensionEntryWhereInput[];
    id?: Prisma.UuidFilter<"ControlDimensionEntry"> | string;
    controlId?: Prisma.UuidFilter<"ControlDimensionEntry"> | string;
    dimension?: Prisma.EnumDimensionFilter<"ControlDimensionEntry"> | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFilter<"ControlDimensionEntry"> | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFilter<"ControlDimensionEntry"> | boolean;
    requiresAi?: Prisma.BoolFilter<"ControlDimensionEntry"> | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFilter<"ControlDimensionEntry"> | boolean;
    reasonNotApplicable?: Prisma.StringNullableFilter<"ControlDimensionEntry"> | string | null;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
};
export type ControlDimensionEntryOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    requiresProbe?: Prisma.SortOrder;
    requiresAi?: Prisma.SortOrder;
    requiresComplianceConfirmation?: Prisma.SortOrder;
    reasonNotApplicable?: Prisma.SortOrderInput | Prisma.SortOrder;
    control?: Prisma.ControlOrderByWithRelationInput;
};
export type ControlDimensionEntryWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    controlId_dimension?: Prisma.ControlDimensionEntryControlIdDimensionCompoundUniqueInput;
    AND?: Prisma.ControlDimensionEntryWhereInput | Prisma.ControlDimensionEntryWhereInput[];
    OR?: Prisma.ControlDimensionEntryWhereInput[];
    NOT?: Prisma.ControlDimensionEntryWhereInput | Prisma.ControlDimensionEntryWhereInput[];
    controlId?: Prisma.UuidFilter<"ControlDimensionEntry"> | string;
    dimension?: Prisma.EnumDimensionFilter<"ControlDimensionEntry"> | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFilter<"ControlDimensionEntry"> | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFilter<"ControlDimensionEntry"> | boolean;
    requiresAi?: Prisma.BoolFilter<"ControlDimensionEntry"> | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFilter<"ControlDimensionEntry"> | boolean;
    reasonNotApplicable?: Prisma.StringNullableFilter<"ControlDimensionEntry"> | string | null;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
}, "id" | "controlId_dimension">;
export type ControlDimensionEntryOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    requiresProbe?: Prisma.SortOrder;
    requiresAi?: Prisma.SortOrder;
    requiresComplianceConfirmation?: Prisma.SortOrder;
    reasonNotApplicable?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.ControlDimensionEntryCountOrderByAggregateInput;
    _max?: Prisma.ControlDimensionEntryMaxOrderByAggregateInput;
    _min?: Prisma.ControlDimensionEntryMinOrderByAggregateInput;
};
export type ControlDimensionEntryScalarWhereWithAggregatesInput = {
    AND?: Prisma.ControlDimensionEntryScalarWhereWithAggregatesInput | Prisma.ControlDimensionEntryScalarWhereWithAggregatesInput[];
    OR?: Prisma.ControlDimensionEntryScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ControlDimensionEntryScalarWhereWithAggregatesInput | Prisma.ControlDimensionEntryScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ControlDimensionEntry"> | string;
    controlId?: Prisma.UuidWithAggregatesFilter<"ControlDimensionEntry"> | string;
    dimension?: Prisma.EnumDimensionWithAggregatesFilter<"ControlDimensionEntry"> | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeWithAggregatesFilter<"ControlDimensionEntry"> | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolWithAggregatesFilter<"ControlDimensionEntry"> | boolean;
    requiresAi?: Prisma.BoolWithAggregatesFilter<"ControlDimensionEntry"> | boolean;
    requiresComplianceConfirmation?: Prisma.BoolWithAggregatesFilter<"ControlDimensionEntry"> | boolean;
    reasonNotApplicable?: Prisma.StringNullableWithAggregatesFilter<"ControlDimensionEntry"> | string | null;
};
export type ControlDimensionEntryCreateInput = {
    id?: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
    control: Prisma.ControlCreateNestedOneWithoutDimensionsInput;
};
export type ControlDimensionEntryUncheckedCreateInput = {
    id?: string;
    controlId: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
};
export type ControlDimensionEntryUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    control?: Prisma.ControlUpdateOneRequiredWithoutDimensionsNestedInput;
};
export type ControlDimensionEntryUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ControlDimensionEntryCreateManyInput = {
    id?: string;
    controlId: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
};
export type ControlDimensionEntryUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ControlDimensionEntryUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ControlDimensionEntryListRelationFilter = {
    every?: Prisma.ControlDimensionEntryWhereInput;
    some?: Prisma.ControlDimensionEntryWhereInput;
    none?: Prisma.ControlDimensionEntryWhereInput;
};
export type ControlDimensionEntryOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ControlDimensionEntryControlIdDimensionCompoundUniqueInput = {
    controlId: string;
    dimension: $Enums.Dimension;
};
export type ControlDimensionEntryCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    requiresProbe?: Prisma.SortOrder;
    requiresAi?: Prisma.SortOrder;
    requiresComplianceConfirmation?: Prisma.SortOrder;
    reasonNotApplicable?: Prisma.SortOrder;
};
export type ControlDimensionEntryMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    requiresProbe?: Prisma.SortOrder;
    requiresAi?: Prisma.SortOrder;
    requiresComplianceConfirmation?: Prisma.SortOrder;
    reasonNotApplicable?: Prisma.SortOrder;
};
export type ControlDimensionEntryMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    requiresProbe?: Prisma.SortOrder;
    requiresAi?: Prisma.SortOrder;
    requiresComplianceConfirmation?: Prisma.SortOrder;
    reasonNotApplicable?: Prisma.SortOrder;
};
export type ControlDimensionEntryCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.ControlDimensionEntryCreateWithoutControlInput, Prisma.ControlDimensionEntryUncheckedCreateWithoutControlInput> | Prisma.ControlDimensionEntryCreateWithoutControlInput[] | Prisma.ControlDimensionEntryUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlDimensionEntryCreateOrConnectWithoutControlInput | Prisma.ControlDimensionEntryCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.ControlDimensionEntryCreateManyControlInputEnvelope;
    connect?: Prisma.ControlDimensionEntryWhereUniqueInput | Prisma.ControlDimensionEntryWhereUniqueInput[];
};
export type ControlDimensionEntryUncheckedCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.ControlDimensionEntryCreateWithoutControlInput, Prisma.ControlDimensionEntryUncheckedCreateWithoutControlInput> | Prisma.ControlDimensionEntryCreateWithoutControlInput[] | Prisma.ControlDimensionEntryUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlDimensionEntryCreateOrConnectWithoutControlInput | Prisma.ControlDimensionEntryCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.ControlDimensionEntryCreateManyControlInputEnvelope;
    connect?: Prisma.ControlDimensionEntryWhereUniqueInput | Prisma.ControlDimensionEntryWhereUniqueInput[];
};
export type ControlDimensionEntryUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.ControlDimensionEntryCreateWithoutControlInput, Prisma.ControlDimensionEntryUncheckedCreateWithoutControlInput> | Prisma.ControlDimensionEntryCreateWithoutControlInput[] | Prisma.ControlDimensionEntryUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlDimensionEntryCreateOrConnectWithoutControlInput | Prisma.ControlDimensionEntryCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.ControlDimensionEntryUpsertWithWhereUniqueWithoutControlInput | Prisma.ControlDimensionEntryUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.ControlDimensionEntryCreateManyControlInputEnvelope;
    set?: Prisma.ControlDimensionEntryWhereUniqueInput | Prisma.ControlDimensionEntryWhereUniqueInput[];
    disconnect?: Prisma.ControlDimensionEntryWhereUniqueInput | Prisma.ControlDimensionEntryWhereUniqueInput[];
    delete?: Prisma.ControlDimensionEntryWhereUniqueInput | Prisma.ControlDimensionEntryWhereUniqueInput[];
    connect?: Prisma.ControlDimensionEntryWhereUniqueInput | Prisma.ControlDimensionEntryWhereUniqueInput[];
    update?: Prisma.ControlDimensionEntryUpdateWithWhereUniqueWithoutControlInput | Prisma.ControlDimensionEntryUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.ControlDimensionEntryUpdateManyWithWhereWithoutControlInput | Prisma.ControlDimensionEntryUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.ControlDimensionEntryScalarWhereInput | Prisma.ControlDimensionEntryScalarWhereInput[];
};
export type ControlDimensionEntryUncheckedUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.ControlDimensionEntryCreateWithoutControlInput, Prisma.ControlDimensionEntryUncheckedCreateWithoutControlInput> | Prisma.ControlDimensionEntryCreateWithoutControlInput[] | Prisma.ControlDimensionEntryUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlDimensionEntryCreateOrConnectWithoutControlInput | Prisma.ControlDimensionEntryCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.ControlDimensionEntryUpsertWithWhereUniqueWithoutControlInput | Prisma.ControlDimensionEntryUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.ControlDimensionEntryCreateManyControlInputEnvelope;
    set?: Prisma.ControlDimensionEntryWhereUniqueInput | Prisma.ControlDimensionEntryWhereUniqueInput[];
    disconnect?: Prisma.ControlDimensionEntryWhereUniqueInput | Prisma.ControlDimensionEntryWhereUniqueInput[];
    delete?: Prisma.ControlDimensionEntryWhereUniqueInput | Prisma.ControlDimensionEntryWhereUniqueInput[];
    connect?: Prisma.ControlDimensionEntryWhereUniqueInput | Prisma.ControlDimensionEntryWhereUniqueInput[];
    update?: Prisma.ControlDimensionEntryUpdateWithWhereUniqueWithoutControlInput | Prisma.ControlDimensionEntryUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.ControlDimensionEntryUpdateManyWithWhereWithoutControlInput | Prisma.ControlDimensionEntryUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.ControlDimensionEntryScalarWhereInput | Prisma.ControlDimensionEntryScalarWhereInput[];
};
export type EnumDimensionFieldUpdateOperationsInput = {
    set?: $Enums.Dimension;
};
export type EnumControlDimensionTypeFieldUpdateOperationsInput = {
    set?: $Enums.ControlDimensionType;
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type ControlDimensionEntryCreateWithoutControlInput = {
    id?: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
};
export type ControlDimensionEntryUncheckedCreateWithoutControlInput = {
    id?: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
};
export type ControlDimensionEntryCreateOrConnectWithoutControlInput = {
    where: Prisma.ControlDimensionEntryWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlDimensionEntryCreateWithoutControlInput, Prisma.ControlDimensionEntryUncheckedCreateWithoutControlInput>;
};
export type ControlDimensionEntryCreateManyControlInputEnvelope = {
    data: Prisma.ControlDimensionEntryCreateManyControlInput | Prisma.ControlDimensionEntryCreateManyControlInput[];
    skipDuplicates?: boolean;
};
export type ControlDimensionEntryUpsertWithWhereUniqueWithoutControlInput = {
    where: Prisma.ControlDimensionEntryWhereUniqueInput;
    update: Prisma.XOR<Prisma.ControlDimensionEntryUpdateWithoutControlInput, Prisma.ControlDimensionEntryUncheckedUpdateWithoutControlInput>;
    create: Prisma.XOR<Prisma.ControlDimensionEntryCreateWithoutControlInput, Prisma.ControlDimensionEntryUncheckedCreateWithoutControlInput>;
};
export type ControlDimensionEntryUpdateWithWhereUniqueWithoutControlInput = {
    where: Prisma.ControlDimensionEntryWhereUniqueInput;
    data: Prisma.XOR<Prisma.ControlDimensionEntryUpdateWithoutControlInput, Prisma.ControlDimensionEntryUncheckedUpdateWithoutControlInput>;
};
export type ControlDimensionEntryUpdateManyWithWhereWithoutControlInput = {
    where: Prisma.ControlDimensionEntryScalarWhereInput;
    data: Prisma.XOR<Prisma.ControlDimensionEntryUpdateManyMutationInput, Prisma.ControlDimensionEntryUncheckedUpdateManyWithoutControlInput>;
};
export type ControlDimensionEntryScalarWhereInput = {
    AND?: Prisma.ControlDimensionEntryScalarWhereInput | Prisma.ControlDimensionEntryScalarWhereInput[];
    OR?: Prisma.ControlDimensionEntryScalarWhereInput[];
    NOT?: Prisma.ControlDimensionEntryScalarWhereInput | Prisma.ControlDimensionEntryScalarWhereInput[];
    id?: Prisma.UuidFilter<"ControlDimensionEntry"> | string;
    controlId?: Prisma.UuidFilter<"ControlDimensionEntry"> | string;
    dimension?: Prisma.EnumDimensionFilter<"ControlDimensionEntry"> | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFilter<"ControlDimensionEntry"> | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFilter<"ControlDimensionEntry"> | boolean;
    requiresAi?: Prisma.BoolFilter<"ControlDimensionEntry"> | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFilter<"ControlDimensionEntry"> | boolean;
    reasonNotApplicable?: Prisma.StringNullableFilter<"ControlDimensionEntry"> | string | null;
};
export type ControlDimensionEntryCreateManyControlInput = {
    id?: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
};
export type ControlDimensionEntryUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ControlDimensionEntryUncheckedUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ControlDimensionEntryUncheckedUpdateManyWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ControlDimensionEntrySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    dimension?: boolean;
    type?: boolean;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlDimensionEntry"]>;
export type ControlDimensionEntrySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    dimension?: boolean;
    type?: boolean;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlDimensionEntry"]>;
export type ControlDimensionEntrySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    dimension?: boolean;
    type?: boolean;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlDimensionEntry"]>;
export type ControlDimensionEntrySelectScalar = {
    id?: boolean;
    controlId?: boolean;
    dimension?: boolean;
    type?: boolean;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: boolean;
};
export type ControlDimensionEntryOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "controlId" | "dimension" | "type" | "requiresProbe" | "requiresAi" | "requiresComplianceConfirmation" | "reasonNotApplicable", ExtArgs["result"]["controlDimensionEntry"]>;
export type ControlDimensionEntryInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type ControlDimensionEntryIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type ControlDimensionEntryIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type $ControlDimensionEntryPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ControlDimensionEntry";
    objects: {
        control: Prisma.$ControlPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        controlId: string;
        dimension: $Enums.Dimension;
        type: $Enums.ControlDimensionType;
        requiresProbe: boolean;
        requiresAi: boolean;
        requiresComplianceConfirmation: boolean;
        reasonNotApplicable: string | null;
    }, ExtArgs["result"]["controlDimensionEntry"]>;
    composites: {};
};
export type ControlDimensionEntryGetPayload<S extends boolean | null | undefined | ControlDimensionEntryDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ControlDimensionEntryPayload, S>;
export type ControlDimensionEntryCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ControlDimensionEntryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ControlDimensionEntryCountAggregateInputType | true;
};
export interface ControlDimensionEntryDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ControlDimensionEntry'];
        meta: {
            name: 'ControlDimensionEntry';
        };
    };
    findUnique<T extends ControlDimensionEntryFindUniqueArgs>(args: Prisma.SelectSubset<T, ControlDimensionEntryFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ControlDimensionEntryClient<runtime.Types.Result.GetResult<Prisma.$ControlDimensionEntryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ControlDimensionEntryFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ControlDimensionEntryFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ControlDimensionEntryClient<runtime.Types.Result.GetResult<Prisma.$ControlDimensionEntryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ControlDimensionEntryFindFirstArgs>(args?: Prisma.SelectSubset<T, ControlDimensionEntryFindFirstArgs<ExtArgs>>): Prisma.Prisma__ControlDimensionEntryClient<runtime.Types.Result.GetResult<Prisma.$ControlDimensionEntryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ControlDimensionEntryFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ControlDimensionEntryFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ControlDimensionEntryClient<runtime.Types.Result.GetResult<Prisma.$ControlDimensionEntryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ControlDimensionEntryFindManyArgs>(args?: Prisma.SelectSubset<T, ControlDimensionEntryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlDimensionEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ControlDimensionEntryCreateArgs>(args: Prisma.SelectSubset<T, ControlDimensionEntryCreateArgs<ExtArgs>>): Prisma.Prisma__ControlDimensionEntryClient<runtime.Types.Result.GetResult<Prisma.$ControlDimensionEntryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ControlDimensionEntryCreateManyArgs>(args?: Prisma.SelectSubset<T, ControlDimensionEntryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ControlDimensionEntryCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ControlDimensionEntryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlDimensionEntryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ControlDimensionEntryDeleteArgs>(args: Prisma.SelectSubset<T, ControlDimensionEntryDeleteArgs<ExtArgs>>): Prisma.Prisma__ControlDimensionEntryClient<runtime.Types.Result.GetResult<Prisma.$ControlDimensionEntryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ControlDimensionEntryUpdateArgs>(args: Prisma.SelectSubset<T, ControlDimensionEntryUpdateArgs<ExtArgs>>): Prisma.Prisma__ControlDimensionEntryClient<runtime.Types.Result.GetResult<Prisma.$ControlDimensionEntryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ControlDimensionEntryDeleteManyArgs>(args?: Prisma.SelectSubset<T, ControlDimensionEntryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ControlDimensionEntryUpdateManyArgs>(args: Prisma.SelectSubset<T, ControlDimensionEntryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ControlDimensionEntryUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ControlDimensionEntryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlDimensionEntryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ControlDimensionEntryUpsertArgs>(args: Prisma.SelectSubset<T, ControlDimensionEntryUpsertArgs<ExtArgs>>): Prisma.Prisma__ControlDimensionEntryClient<runtime.Types.Result.GetResult<Prisma.$ControlDimensionEntryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ControlDimensionEntryCountArgs>(args?: Prisma.Subset<T, ControlDimensionEntryCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ControlDimensionEntryCountAggregateOutputType> : number>;
    aggregate<T extends ControlDimensionEntryAggregateArgs>(args: Prisma.Subset<T, ControlDimensionEntryAggregateArgs>): Prisma.PrismaPromise<GetControlDimensionEntryAggregateType<T>>;
    groupBy<T extends ControlDimensionEntryGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ControlDimensionEntryGroupByArgs['orderBy'];
    } : {
        orderBy?: ControlDimensionEntryGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ControlDimensionEntryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetControlDimensionEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ControlDimensionEntryFieldRefs;
}
export interface Prisma__ControlDimensionEntryClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    control<T extends Prisma.ControlDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ControlDefaultArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ControlDimensionEntryFieldRefs {
    readonly id: Prisma.FieldRef<"ControlDimensionEntry", 'String'>;
    readonly controlId: Prisma.FieldRef<"ControlDimensionEntry", 'String'>;
    readonly dimension: Prisma.FieldRef<"ControlDimensionEntry", 'Dimension'>;
    readonly type: Prisma.FieldRef<"ControlDimensionEntry", 'ControlDimensionType'>;
    readonly requiresProbe: Prisma.FieldRef<"ControlDimensionEntry", 'Boolean'>;
    readonly requiresAi: Prisma.FieldRef<"ControlDimensionEntry", 'Boolean'>;
    readonly requiresComplianceConfirmation: Prisma.FieldRef<"ControlDimensionEntry", 'Boolean'>;
    readonly reasonNotApplicable: Prisma.FieldRef<"ControlDimensionEntry", 'String'>;
}
export type ControlDimensionEntryFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlDimensionEntrySelect<ExtArgs> | null;
    omit?: Prisma.ControlDimensionEntryOmit<ExtArgs> | null;
    include?: Prisma.ControlDimensionEntryInclude<ExtArgs> | null;
    where: Prisma.ControlDimensionEntryWhereUniqueInput;
};
export type ControlDimensionEntryFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlDimensionEntrySelect<ExtArgs> | null;
    omit?: Prisma.ControlDimensionEntryOmit<ExtArgs> | null;
    include?: Prisma.ControlDimensionEntryInclude<ExtArgs> | null;
    where: Prisma.ControlDimensionEntryWhereUniqueInput;
};
export type ControlDimensionEntryFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlDimensionEntrySelect<ExtArgs> | null;
    omit?: Prisma.ControlDimensionEntryOmit<ExtArgs> | null;
    include?: Prisma.ControlDimensionEntryInclude<ExtArgs> | null;
    where?: Prisma.ControlDimensionEntryWhereInput;
    orderBy?: Prisma.ControlDimensionEntryOrderByWithRelationInput | Prisma.ControlDimensionEntryOrderByWithRelationInput[];
    cursor?: Prisma.ControlDimensionEntryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlDimensionEntryScalarFieldEnum | Prisma.ControlDimensionEntryScalarFieldEnum[];
};
export type ControlDimensionEntryFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlDimensionEntrySelect<ExtArgs> | null;
    omit?: Prisma.ControlDimensionEntryOmit<ExtArgs> | null;
    include?: Prisma.ControlDimensionEntryInclude<ExtArgs> | null;
    where?: Prisma.ControlDimensionEntryWhereInput;
    orderBy?: Prisma.ControlDimensionEntryOrderByWithRelationInput | Prisma.ControlDimensionEntryOrderByWithRelationInput[];
    cursor?: Prisma.ControlDimensionEntryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlDimensionEntryScalarFieldEnum | Prisma.ControlDimensionEntryScalarFieldEnum[];
};
export type ControlDimensionEntryFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlDimensionEntrySelect<ExtArgs> | null;
    omit?: Prisma.ControlDimensionEntryOmit<ExtArgs> | null;
    include?: Prisma.ControlDimensionEntryInclude<ExtArgs> | null;
    where?: Prisma.ControlDimensionEntryWhereInput;
    orderBy?: Prisma.ControlDimensionEntryOrderByWithRelationInput | Prisma.ControlDimensionEntryOrderByWithRelationInput[];
    cursor?: Prisma.ControlDimensionEntryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlDimensionEntryScalarFieldEnum | Prisma.ControlDimensionEntryScalarFieldEnum[];
};
export type ControlDimensionEntryCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlDimensionEntrySelect<ExtArgs> | null;
    omit?: Prisma.ControlDimensionEntryOmit<ExtArgs> | null;
    include?: Prisma.ControlDimensionEntryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlDimensionEntryCreateInput, Prisma.ControlDimensionEntryUncheckedCreateInput>;
};
export type ControlDimensionEntryCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ControlDimensionEntryCreateManyInput | Prisma.ControlDimensionEntryCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ControlDimensionEntryCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlDimensionEntrySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ControlDimensionEntryOmit<ExtArgs> | null;
    data: Prisma.ControlDimensionEntryCreateManyInput | Prisma.ControlDimensionEntryCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ControlDimensionEntryIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ControlDimensionEntryUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlDimensionEntrySelect<ExtArgs> | null;
    omit?: Prisma.ControlDimensionEntryOmit<ExtArgs> | null;
    include?: Prisma.ControlDimensionEntryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlDimensionEntryUpdateInput, Prisma.ControlDimensionEntryUncheckedUpdateInput>;
    where: Prisma.ControlDimensionEntryWhereUniqueInput;
};
export type ControlDimensionEntryUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ControlDimensionEntryUpdateManyMutationInput, Prisma.ControlDimensionEntryUncheckedUpdateManyInput>;
    where?: Prisma.ControlDimensionEntryWhereInput;
    limit?: number;
};
export type ControlDimensionEntryUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlDimensionEntrySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ControlDimensionEntryOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlDimensionEntryUpdateManyMutationInput, Prisma.ControlDimensionEntryUncheckedUpdateManyInput>;
    where?: Prisma.ControlDimensionEntryWhereInput;
    limit?: number;
    include?: Prisma.ControlDimensionEntryIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ControlDimensionEntryUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlDimensionEntrySelect<ExtArgs> | null;
    omit?: Prisma.ControlDimensionEntryOmit<ExtArgs> | null;
    include?: Prisma.ControlDimensionEntryInclude<ExtArgs> | null;
    where: Prisma.ControlDimensionEntryWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlDimensionEntryCreateInput, Prisma.ControlDimensionEntryUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ControlDimensionEntryUpdateInput, Prisma.ControlDimensionEntryUncheckedUpdateInput>;
};
export type ControlDimensionEntryDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlDimensionEntrySelect<ExtArgs> | null;
    omit?: Prisma.ControlDimensionEntryOmit<ExtArgs> | null;
    include?: Prisma.ControlDimensionEntryInclude<ExtArgs> | null;
    where: Prisma.ControlDimensionEntryWhereUniqueInput;
};
export type ControlDimensionEntryDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlDimensionEntryWhereInput;
    limit?: number;
};
export type ControlDimensionEntryDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlDimensionEntrySelect<ExtArgs> | null;
    omit?: Prisma.ControlDimensionEntryOmit<ExtArgs> | null;
    include?: Prisma.ControlDimensionEntryInclude<ExtArgs> | null;
};
export {};
