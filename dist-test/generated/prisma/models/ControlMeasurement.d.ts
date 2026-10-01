import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ControlMeasurementModel = runtime.Types.Result.DefaultSelection<Prisma.$ControlMeasurementPayload>;
export type AggregateControlMeasurement = {
    _count: ControlMeasurementCountAggregateOutputType | null;
    _avg: ControlMeasurementAvgAggregateOutputType | null;
    _sum: ControlMeasurementSumAggregateOutputType | null;
    _min: ControlMeasurementMinAggregateOutputType | null;
    _max: ControlMeasurementMaxAggregateOutputType | null;
};
export type ControlMeasurementAvgAggregateOutputType = {
    weight: runtime.Decimal | null;
};
export type ControlMeasurementSumAggregateOutputType = {
    weight: runtime.Decimal | null;
};
export type ControlMeasurementMinAggregateOutputType = {
    id: string | null;
    controlId: string | null;
    dimension: $Enums.Dimension | null;
    weight: runtime.Decimal | null;
    formula: string | null;
};
export type ControlMeasurementMaxAggregateOutputType = {
    id: string | null;
    controlId: string | null;
    dimension: $Enums.Dimension | null;
    weight: runtime.Decimal | null;
    formula: string | null;
};
export type ControlMeasurementCountAggregateOutputType = {
    id: number;
    controlId: number;
    dimension: number;
    weight: number;
    formula: number;
    _all: number;
};
export type ControlMeasurementAvgAggregateInputType = {
    weight?: true;
};
export type ControlMeasurementSumAggregateInputType = {
    weight?: true;
};
export type ControlMeasurementMinAggregateInputType = {
    id?: true;
    controlId?: true;
    dimension?: true;
    weight?: true;
    formula?: true;
};
export type ControlMeasurementMaxAggregateInputType = {
    id?: true;
    controlId?: true;
    dimension?: true;
    weight?: true;
    formula?: true;
};
export type ControlMeasurementCountAggregateInputType = {
    id?: true;
    controlId?: true;
    dimension?: true;
    weight?: true;
    formula?: true;
    _all?: true;
};
export type ControlMeasurementAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlMeasurementWhereInput;
    orderBy?: Prisma.ControlMeasurementOrderByWithRelationInput | Prisma.ControlMeasurementOrderByWithRelationInput[];
    cursor?: Prisma.ControlMeasurementWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ControlMeasurementCountAggregateInputType;
    _avg?: ControlMeasurementAvgAggregateInputType;
    _sum?: ControlMeasurementSumAggregateInputType;
    _min?: ControlMeasurementMinAggregateInputType;
    _max?: ControlMeasurementMaxAggregateInputType;
};
export type GetControlMeasurementAggregateType<T extends ControlMeasurementAggregateArgs> = {
    [P in keyof T & keyof AggregateControlMeasurement]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateControlMeasurement[P]> : Prisma.GetScalarType<T[P], AggregateControlMeasurement[P]>;
};
export type ControlMeasurementGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlMeasurementWhereInput;
    orderBy?: Prisma.ControlMeasurementOrderByWithAggregationInput | Prisma.ControlMeasurementOrderByWithAggregationInput[];
    by: Prisma.ControlMeasurementScalarFieldEnum[] | Prisma.ControlMeasurementScalarFieldEnum;
    having?: Prisma.ControlMeasurementScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ControlMeasurementCountAggregateInputType | true;
    _avg?: ControlMeasurementAvgAggregateInputType;
    _sum?: ControlMeasurementSumAggregateInputType;
    _min?: ControlMeasurementMinAggregateInputType;
    _max?: ControlMeasurementMaxAggregateInputType;
};
export type ControlMeasurementGroupByOutputType = {
    id: string;
    controlId: string;
    dimension: $Enums.Dimension;
    weight: runtime.Decimal;
    formula: string;
    _count: ControlMeasurementCountAggregateOutputType | null;
    _avg: ControlMeasurementAvgAggregateOutputType | null;
    _sum: ControlMeasurementSumAggregateOutputType | null;
    _min: ControlMeasurementMinAggregateOutputType | null;
    _max: ControlMeasurementMaxAggregateOutputType | null;
};
type GetControlMeasurementGroupByPayload<T extends ControlMeasurementGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ControlMeasurementGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ControlMeasurementGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ControlMeasurementGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ControlMeasurementGroupByOutputType[P]>;
}>>;
export type ControlMeasurementWhereInput = {
    AND?: Prisma.ControlMeasurementWhereInput | Prisma.ControlMeasurementWhereInput[];
    OR?: Prisma.ControlMeasurementWhereInput[];
    NOT?: Prisma.ControlMeasurementWhereInput | Prisma.ControlMeasurementWhereInput[];
    id?: Prisma.UuidFilter<"ControlMeasurement"> | string;
    controlId?: Prisma.UuidFilter<"ControlMeasurement"> | string;
    dimension?: Prisma.EnumDimensionFilter<"ControlMeasurement"> | $Enums.Dimension;
    weight?: Prisma.DecimalFilter<"ControlMeasurement"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula?: Prisma.StringFilter<"ControlMeasurement"> | string;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
};
export type ControlMeasurementOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    weight?: Prisma.SortOrder;
    formula?: Prisma.SortOrder;
    control?: Prisma.ControlOrderByWithRelationInput;
};
export type ControlMeasurementWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    controlId_dimension?: Prisma.ControlMeasurementControlIdDimensionCompoundUniqueInput;
    AND?: Prisma.ControlMeasurementWhereInput | Prisma.ControlMeasurementWhereInput[];
    OR?: Prisma.ControlMeasurementWhereInput[];
    NOT?: Prisma.ControlMeasurementWhereInput | Prisma.ControlMeasurementWhereInput[];
    controlId?: Prisma.UuidFilter<"ControlMeasurement"> | string;
    dimension?: Prisma.EnumDimensionFilter<"ControlMeasurement"> | $Enums.Dimension;
    weight?: Prisma.DecimalFilter<"ControlMeasurement"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula?: Prisma.StringFilter<"ControlMeasurement"> | string;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
}, "id" | "controlId_dimension">;
export type ControlMeasurementOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    weight?: Prisma.SortOrder;
    formula?: Prisma.SortOrder;
    _count?: Prisma.ControlMeasurementCountOrderByAggregateInput;
    _avg?: Prisma.ControlMeasurementAvgOrderByAggregateInput;
    _max?: Prisma.ControlMeasurementMaxOrderByAggregateInput;
    _min?: Prisma.ControlMeasurementMinOrderByAggregateInput;
    _sum?: Prisma.ControlMeasurementSumOrderByAggregateInput;
};
export type ControlMeasurementScalarWhereWithAggregatesInput = {
    AND?: Prisma.ControlMeasurementScalarWhereWithAggregatesInput | Prisma.ControlMeasurementScalarWhereWithAggregatesInput[];
    OR?: Prisma.ControlMeasurementScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ControlMeasurementScalarWhereWithAggregatesInput | Prisma.ControlMeasurementScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ControlMeasurement"> | string;
    controlId?: Prisma.UuidWithAggregatesFilter<"ControlMeasurement"> | string;
    dimension?: Prisma.EnumDimensionWithAggregatesFilter<"ControlMeasurement"> | $Enums.Dimension;
    weight?: Prisma.DecimalWithAggregatesFilter<"ControlMeasurement"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula?: Prisma.StringWithAggregatesFilter<"ControlMeasurement"> | string;
};
export type ControlMeasurementCreateInput = {
    id?: string;
    dimension: $Enums.Dimension;
    weight?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula: string;
    control: Prisma.ControlCreateNestedOneWithoutMeasurementsInput;
};
export type ControlMeasurementUncheckedCreateInput = {
    id?: string;
    controlId: string;
    dimension: $Enums.Dimension;
    weight?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula: string;
};
export type ControlMeasurementUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    weight?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula?: Prisma.StringFieldUpdateOperationsInput | string;
    control?: Prisma.ControlUpdateOneRequiredWithoutMeasurementsNestedInput;
};
export type ControlMeasurementUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    weight?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlMeasurementCreateManyInput = {
    id?: string;
    controlId: string;
    dimension: $Enums.Dimension;
    weight?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula: string;
};
export type ControlMeasurementUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    weight?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlMeasurementUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    weight?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlMeasurementListRelationFilter = {
    every?: Prisma.ControlMeasurementWhereInput;
    some?: Prisma.ControlMeasurementWhereInput;
    none?: Prisma.ControlMeasurementWhereInput;
};
export type ControlMeasurementOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ControlMeasurementControlIdDimensionCompoundUniqueInput = {
    controlId: string;
    dimension: $Enums.Dimension;
};
export type ControlMeasurementCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    weight?: Prisma.SortOrder;
    formula?: Prisma.SortOrder;
};
export type ControlMeasurementAvgOrderByAggregateInput = {
    weight?: Prisma.SortOrder;
};
export type ControlMeasurementMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    weight?: Prisma.SortOrder;
    formula?: Prisma.SortOrder;
};
export type ControlMeasurementMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    weight?: Prisma.SortOrder;
    formula?: Prisma.SortOrder;
};
export type ControlMeasurementSumOrderByAggregateInput = {
    weight?: Prisma.SortOrder;
};
export type ControlMeasurementCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.ControlMeasurementCreateWithoutControlInput, Prisma.ControlMeasurementUncheckedCreateWithoutControlInput> | Prisma.ControlMeasurementCreateWithoutControlInput[] | Prisma.ControlMeasurementUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlMeasurementCreateOrConnectWithoutControlInput | Prisma.ControlMeasurementCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.ControlMeasurementCreateManyControlInputEnvelope;
    connect?: Prisma.ControlMeasurementWhereUniqueInput | Prisma.ControlMeasurementWhereUniqueInput[];
};
export type ControlMeasurementUncheckedCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.ControlMeasurementCreateWithoutControlInput, Prisma.ControlMeasurementUncheckedCreateWithoutControlInput> | Prisma.ControlMeasurementCreateWithoutControlInput[] | Prisma.ControlMeasurementUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlMeasurementCreateOrConnectWithoutControlInput | Prisma.ControlMeasurementCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.ControlMeasurementCreateManyControlInputEnvelope;
    connect?: Prisma.ControlMeasurementWhereUniqueInput | Prisma.ControlMeasurementWhereUniqueInput[];
};
export type ControlMeasurementUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.ControlMeasurementCreateWithoutControlInput, Prisma.ControlMeasurementUncheckedCreateWithoutControlInput> | Prisma.ControlMeasurementCreateWithoutControlInput[] | Prisma.ControlMeasurementUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlMeasurementCreateOrConnectWithoutControlInput | Prisma.ControlMeasurementCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.ControlMeasurementUpsertWithWhereUniqueWithoutControlInput | Prisma.ControlMeasurementUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.ControlMeasurementCreateManyControlInputEnvelope;
    set?: Prisma.ControlMeasurementWhereUniqueInput | Prisma.ControlMeasurementWhereUniqueInput[];
    disconnect?: Prisma.ControlMeasurementWhereUniqueInput | Prisma.ControlMeasurementWhereUniqueInput[];
    delete?: Prisma.ControlMeasurementWhereUniqueInput | Prisma.ControlMeasurementWhereUniqueInput[];
    connect?: Prisma.ControlMeasurementWhereUniqueInput | Prisma.ControlMeasurementWhereUniqueInput[];
    update?: Prisma.ControlMeasurementUpdateWithWhereUniqueWithoutControlInput | Prisma.ControlMeasurementUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.ControlMeasurementUpdateManyWithWhereWithoutControlInput | Prisma.ControlMeasurementUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.ControlMeasurementScalarWhereInput | Prisma.ControlMeasurementScalarWhereInput[];
};
export type ControlMeasurementUncheckedUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.ControlMeasurementCreateWithoutControlInput, Prisma.ControlMeasurementUncheckedCreateWithoutControlInput> | Prisma.ControlMeasurementCreateWithoutControlInput[] | Prisma.ControlMeasurementUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ControlMeasurementCreateOrConnectWithoutControlInput | Prisma.ControlMeasurementCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.ControlMeasurementUpsertWithWhereUniqueWithoutControlInput | Prisma.ControlMeasurementUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.ControlMeasurementCreateManyControlInputEnvelope;
    set?: Prisma.ControlMeasurementWhereUniqueInput | Prisma.ControlMeasurementWhereUniqueInput[];
    disconnect?: Prisma.ControlMeasurementWhereUniqueInput | Prisma.ControlMeasurementWhereUniqueInput[];
    delete?: Prisma.ControlMeasurementWhereUniqueInput | Prisma.ControlMeasurementWhereUniqueInput[];
    connect?: Prisma.ControlMeasurementWhereUniqueInput | Prisma.ControlMeasurementWhereUniqueInput[];
    update?: Prisma.ControlMeasurementUpdateWithWhereUniqueWithoutControlInput | Prisma.ControlMeasurementUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.ControlMeasurementUpdateManyWithWhereWithoutControlInput | Prisma.ControlMeasurementUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.ControlMeasurementScalarWhereInput | Prisma.ControlMeasurementScalarWhereInput[];
};
export type DecimalFieldUpdateOperationsInput = {
    set?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    increment?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    decrement?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    multiply?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    divide?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type ControlMeasurementCreateWithoutControlInput = {
    id?: string;
    dimension: $Enums.Dimension;
    weight?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula: string;
};
export type ControlMeasurementUncheckedCreateWithoutControlInput = {
    id?: string;
    dimension: $Enums.Dimension;
    weight?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula: string;
};
export type ControlMeasurementCreateOrConnectWithoutControlInput = {
    where: Prisma.ControlMeasurementWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlMeasurementCreateWithoutControlInput, Prisma.ControlMeasurementUncheckedCreateWithoutControlInput>;
};
export type ControlMeasurementCreateManyControlInputEnvelope = {
    data: Prisma.ControlMeasurementCreateManyControlInput | Prisma.ControlMeasurementCreateManyControlInput[];
    skipDuplicates?: boolean;
};
export type ControlMeasurementUpsertWithWhereUniqueWithoutControlInput = {
    where: Prisma.ControlMeasurementWhereUniqueInput;
    update: Prisma.XOR<Prisma.ControlMeasurementUpdateWithoutControlInput, Prisma.ControlMeasurementUncheckedUpdateWithoutControlInput>;
    create: Prisma.XOR<Prisma.ControlMeasurementCreateWithoutControlInput, Prisma.ControlMeasurementUncheckedCreateWithoutControlInput>;
};
export type ControlMeasurementUpdateWithWhereUniqueWithoutControlInput = {
    where: Prisma.ControlMeasurementWhereUniqueInput;
    data: Prisma.XOR<Prisma.ControlMeasurementUpdateWithoutControlInput, Prisma.ControlMeasurementUncheckedUpdateWithoutControlInput>;
};
export type ControlMeasurementUpdateManyWithWhereWithoutControlInput = {
    where: Prisma.ControlMeasurementScalarWhereInput;
    data: Prisma.XOR<Prisma.ControlMeasurementUpdateManyMutationInput, Prisma.ControlMeasurementUncheckedUpdateManyWithoutControlInput>;
};
export type ControlMeasurementScalarWhereInput = {
    AND?: Prisma.ControlMeasurementScalarWhereInput | Prisma.ControlMeasurementScalarWhereInput[];
    OR?: Prisma.ControlMeasurementScalarWhereInput[];
    NOT?: Prisma.ControlMeasurementScalarWhereInput | Prisma.ControlMeasurementScalarWhereInput[];
    id?: Prisma.UuidFilter<"ControlMeasurement"> | string;
    controlId?: Prisma.UuidFilter<"ControlMeasurement"> | string;
    dimension?: Prisma.EnumDimensionFilter<"ControlMeasurement"> | $Enums.Dimension;
    weight?: Prisma.DecimalFilter<"ControlMeasurement"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula?: Prisma.StringFilter<"ControlMeasurement"> | string;
};
export type ControlMeasurementCreateManyControlInput = {
    id?: string;
    dimension: $Enums.Dimension;
    weight?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula: string;
};
export type ControlMeasurementUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    weight?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlMeasurementUncheckedUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    weight?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlMeasurementUncheckedUpdateManyWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    weight?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    formula?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ControlMeasurementSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    dimension?: boolean;
    weight?: boolean;
    formula?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlMeasurement"]>;
export type ControlMeasurementSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    dimension?: boolean;
    weight?: boolean;
    formula?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlMeasurement"]>;
export type ControlMeasurementSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    controlId?: boolean;
    dimension?: boolean;
    weight?: boolean;
    formula?: boolean;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["controlMeasurement"]>;
export type ControlMeasurementSelectScalar = {
    id?: boolean;
    controlId?: boolean;
    dimension?: boolean;
    weight?: boolean;
    formula?: boolean;
};
export type ControlMeasurementOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "controlId" | "dimension" | "weight" | "formula", ExtArgs["result"]["controlMeasurement"]>;
export type ControlMeasurementInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type ControlMeasurementIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type ControlMeasurementIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type $ControlMeasurementPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ControlMeasurement";
    objects: {
        control: Prisma.$ControlPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        controlId: string;
        dimension: $Enums.Dimension;
        weight: runtime.Decimal;
        formula: string;
    }, ExtArgs["result"]["controlMeasurement"]>;
    composites: {};
};
export type ControlMeasurementGetPayload<S extends boolean | null | undefined | ControlMeasurementDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ControlMeasurementPayload, S>;
export type ControlMeasurementCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ControlMeasurementFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ControlMeasurementCountAggregateInputType | true;
};
export interface ControlMeasurementDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ControlMeasurement'];
        meta: {
            name: 'ControlMeasurement';
        };
    };
    findUnique<T extends ControlMeasurementFindUniqueArgs>(args: Prisma.SelectSubset<T, ControlMeasurementFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ControlMeasurementClient<runtime.Types.Result.GetResult<Prisma.$ControlMeasurementPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ControlMeasurementFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ControlMeasurementFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ControlMeasurementClient<runtime.Types.Result.GetResult<Prisma.$ControlMeasurementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ControlMeasurementFindFirstArgs>(args?: Prisma.SelectSubset<T, ControlMeasurementFindFirstArgs<ExtArgs>>): Prisma.Prisma__ControlMeasurementClient<runtime.Types.Result.GetResult<Prisma.$ControlMeasurementPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ControlMeasurementFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ControlMeasurementFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ControlMeasurementClient<runtime.Types.Result.GetResult<Prisma.$ControlMeasurementPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ControlMeasurementFindManyArgs>(args?: Prisma.SelectSubset<T, ControlMeasurementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlMeasurementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ControlMeasurementCreateArgs>(args: Prisma.SelectSubset<T, ControlMeasurementCreateArgs<ExtArgs>>): Prisma.Prisma__ControlMeasurementClient<runtime.Types.Result.GetResult<Prisma.$ControlMeasurementPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ControlMeasurementCreateManyArgs>(args?: Prisma.SelectSubset<T, ControlMeasurementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ControlMeasurementCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ControlMeasurementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlMeasurementPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ControlMeasurementDeleteArgs>(args: Prisma.SelectSubset<T, ControlMeasurementDeleteArgs<ExtArgs>>): Prisma.Prisma__ControlMeasurementClient<runtime.Types.Result.GetResult<Prisma.$ControlMeasurementPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ControlMeasurementUpdateArgs>(args: Prisma.SelectSubset<T, ControlMeasurementUpdateArgs<ExtArgs>>): Prisma.Prisma__ControlMeasurementClient<runtime.Types.Result.GetResult<Prisma.$ControlMeasurementPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ControlMeasurementDeleteManyArgs>(args?: Prisma.SelectSubset<T, ControlMeasurementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ControlMeasurementUpdateManyArgs>(args: Prisma.SelectSubset<T, ControlMeasurementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ControlMeasurementUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ControlMeasurementUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlMeasurementPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ControlMeasurementUpsertArgs>(args: Prisma.SelectSubset<T, ControlMeasurementUpsertArgs<ExtArgs>>): Prisma.Prisma__ControlMeasurementClient<runtime.Types.Result.GetResult<Prisma.$ControlMeasurementPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ControlMeasurementCountArgs>(args?: Prisma.Subset<T, ControlMeasurementCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ControlMeasurementCountAggregateOutputType> : number>;
    aggregate<T extends ControlMeasurementAggregateArgs>(args: Prisma.Subset<T, ControlMeasurementAggregateArgs>): Prisma.PrismaPromise<GetControlMeasurementAggregateType<T>>;
    groupBy<T extends ControlMeasurementGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ControlMeasurementGroupByArgs['orderBy'];
    } : {
        orderBy?: ControlMeasurementGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ControlMeasurementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetControlMeasurementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ControlMeasurementFieldRefs;
}
export interface Prisma__ControlMeasurementClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    control<T extends Prisma.ControlDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ControlDefaultArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ControlMeasurementFieldRefs {
    readonly id: Prisma.FieldRef<"ControlMeasurement", 'String'>;
    readonly controlId: Prisma.FieldRef<"ControlMeasurement", 'String'>;
    readonly dimension: Prisma.FieldRef<"ControlMeasurement", 'Dimension'>;
    readonly weight: Prisma.FieldRef<"ControlMeasurement", 'Decimal'>;
    readonly formula: Prisma.FieldRef<"ControlMeasurement", 'String'>;
}
export type ControlMeasurementFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlMeasurementSelect<ExtArgs> | null;
    omit?: Prisma.ControlMeasurementOmit<ExtArgs> | null;
    include?: Prisma.ControlMeasurementInclude<ExtArgs> | null;
    where: Prisma.ControlMeasurementWhereUniqueInput;
};
export type ControlMeasurementFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlMeasurementSelect<ExtArgs> | null;
    omit?: Prisma.ControlMeasurementOmit<ExtArgs> | null;
    include?: Prisma.ControlMeasurementInclude<ExtArgs> | null;
    where: Prisma.ControlMeasurementWhereUniqueInput;
};
export type ControlMeasurementFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlMeasurementSelect<ExtArgs> | null;
    omit?: Prisma.ControlMeasurementOmit<ExtArgs> | null;
    include?: Prisma.ControlMeasurementInclude<ExtArgs> | null;
    where?: Prisma.ControlMeasurementWhereInput;
    orderBy?: Prisma.ControlMeasurementOrderByWithRelationInput | Prisma.ControlMeasurementOrderByWithRelationInput[];
    cursor?: Prisma.ControlMeasurementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlMeasurementScalarFieldEnum | Prisma.ControlMeasurementScalarFieldEnum[];
};
export type ControlMeasurementFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlMeasurementSelect<ExtArgs> | null;
    omit?: Prisma.ControlMeasurementOmit<ExtArgs> | null;
    include?: Prisma.ControlMeasurementInclude<ExtArgs> | null;
    where?: Prisma.ControlMeasurementWhereInput;
    orderBy?: Prisma.ControlMeasurementOrderByWithRelationInput | Prisma.ControlMeasurementOrderByWithRelationInput[];
    cursor?: Prisma.ControlMeasurementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlMeasurementScalarFieldEnum | Prisma.ControlMeasurementScalarFieldEnum[];
};
export type ControlMeasurementFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlMeasurementSelect<ExtArgs> | null;
    omit?: Prisma.ControlMeasurementOmit<ExtArgs> | null;
    include?: Prisma.ControlMeasurementInclude<ExtArgs> | null;
    where?: Prisma.ControlMeasurementWhereInput;
    orderBy?: Prisma.ControlMeasurementOrderByWithRelationInput | Prisma.ControlMeasurementOrderByWithRelationInput[];
    cursor?: Prisma.ControlMeasurementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlMeasurementScalarFieldEnum | Prisma.ControlMeasurementScalarFieldEnum[];
};
export type ControlMeasurementCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlMeasurementSelect<ExtArgs> | null;
    omit?: Prisma.ControlMeasurementOmit<ExtArgs> | null;
    include?: Prisma.ControlMeasurementInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlMeasurementCreateInput, Prisma.ControlMeasurementUncheckedCreateInput>;
};
export type ControlMeasurementCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ControlMeasurementCreateManyInput | Prisma.ControlMeasurementCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ControlMeasurementCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlMeasurementSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ControlMeasurementOmit<ExtArgs> | null;
    data: Prisma.ControlMeasurementCreateManyInput | Prisma.ControlMeasurementCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ControlMeasurementIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ControlMeasurementUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlMeasurementSelect<ExtArgs> | null;
    omit?: Prisma.ControlMeasurementOmit<ExtArgs> | null;
    include?: Prisma.ControlMeasurementInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlMeasurementUpdateInput, Prisma.ControlMeasurementUncheckedUpdateInput>;
    where: Prisma.ControlMeasurementWhereUniqueInput;
};
export type ControlMeasurementUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ControlMeasurementUpdateManyMutationInput, Prisma.ControlMeasurementUncheckedUpdateManyInput>;
    where?: Prisma.ControlMeasurementWhereInput;
    limit?: number;
};
export type ControlMeasurementUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlMeasurementSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ControlMeasurementOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlMeasurementUpdateManyMutationInput, Prisma.ControlMeasurementUncheckedUpdateManyInput>;
    where?: Prisma.ControlMeasurementWhereInput;
    limit?: number;
    include?: Prisma.ControlMeasurementIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ControlMeasurementUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlMeasurementSelect<ExtArgs> | null;
    omit?: Prisma.ControlMeasurementOmit<ExtArgs> | null;
    include?: Prisma.ControlMeasurementInclude<ExtArgs> | null;
    where: Prisma.ControlMeasurementWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlMeasurementCreateInput, Prisma.ControlMeasurementUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ControlMeasurementUpdateInput, Prisma.ControlMeasurementUncheckedUpdateInput>;
};
export type ControlMeasurementDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlMeasurementSelect<ExtArgs> | null;
    omit?: Prisma.ControlMeasurementOmit<ExtArgs> | null;
    include?: Prisma.ControlMeasurementInclude<ExtArgs> | null;
    where: Prisma.ControlMeasurementWhereUniqueInput;
};
export type ControlMeasurementDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlMeasurementWhereInput;
    limit?: number;
};
export type ControlMeasurementDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlMeasurementSelect<ExtArgs> | null;
    omit?: Prisma.ControlMeasurementOmit<ExtArgs> | null;
    include?: Prisma.ControlMeasurementInclude<ExtArgs> | null;
};
export {};
