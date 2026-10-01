import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CauseControlModel = runtime.Types.Result.DefaultSelection<Prisma.$CauseControlPayload>;
export type AggregateCauseControl = {
    _count: CauseControlCountAggregateOutputType | null;
    _min: CauseControlMinAggregateOutputType | null;
    _max: CauseControlMaxAggregateOutputType | null;
};
export type CauseControlMinAggregateOutputType = {
    id: string | null;
    causeId: string | null;
    controlId: string | null;
};
export type CauseControlMaxAggregateOutputType = {
    id: string | null;
    causeId: string | null;
    controlId: string | null;
};
export type CauseControlCountAggregateOutputType = {
    id: number;
    causeId: number;
    controlId: number;
    _all: number;
};
export type CauseControlMinAggregateInputType = {
    id?: true;
    causeId?: true;
    controlId?: true;
};
export type CauseControlMaxAggregateInputType = {
    id?: true;
    causeId?: true;
    controlId?: true;
};
export type CauseControlCountAggregateInputType = {
    id?: true;
    causeId?: true;
    controlId?: true;
    _all?: true;
};
export type CauseControlAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CauseControlWhereInput;
    orderBy?: Prisma.CauseControlOrderByWithRelationInput | Prisma.CauseControlOrderByWithRelationInput[];
    cursor?: Prisma.CauseControlWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CauseControlCountAggregateInputType;
    _min?: CauseControlMinAggregateInputType;
    _max?: CauseControlMaxAggregateInputType;
};
export type GetCauseControlAggregateType<T extends CauseControlAggregateArgs> = {
    [P in keyof T & keyof AggregateCauseControl]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCauseControl[P]> : Prisma.GetScalarType<T[P], AggregateCauseControl[P]>;
};
export type CauseControlGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CauseControlWhereInput;
    orderBy?: Prisma.CauseControlOrderByWithAggregationInput | Prisma.CauseControlOrderByWithAggregationInput[];
    by: Prisma.CauseControlScalarFieldEnum[] | Prisma.CauseControlScalarFieldEnum;
    having?: Prisma.CauseControlScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CauseControlCountAggregateInputType | true;
    _min?: CauseControlMinAggregateInputType;
    _max?: CauseControlMaxAggregateInputType;
};
export type CauseControlGroupByOutputType = {
    id: string;
    causeId: string;
    controlId: string;
    _count: CauseControlCountAggregateOutputType | null;
    _min: CauseControlMinAggregateOutputType | null;
    _max: CauseControlMaxAggregateOutputType | null;
};
type GetCauseControlGroupByPayload<T extends CauseControlGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CauseControlGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CauseControlGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CauseControlGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CauseControlGroupByOutputType[P]>;
}>>;
export type CauseControlWhereInput = {
    AND?: Prisma.CauseControlWhereInput | Prisma.CauseControlWhereInput[];
    OR?: Prisma.CauseControlWhereInput[];
    NOT?: Prisma.CauseControlWhereInput | Prisma.CauseControlWhereInput[];
    id?: Prisma.UuidFilter<"CauseControl"> | string;
    causeId?: Prisma.UuidFilter<"CauseControl"> | string;
    controlId?: Prisma.UuidFilter<"CauseControl"> | string;
    cause?: Prisma.XOR<Prisma.CauseScalarRelationFilter, Prisma.CauseWhereInput>;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
};
export type CauseControlOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    causeId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    cause?: Prisma.CauseOrderByWithRelationInput;
    control?: Prisma.ControlOrderByWithRelationInput;
};
export type CauseControlWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    causeId_controlId?: Prisma.CauseControlCauseIdControlIdCompoundUniqueInput;
    AND?: Prisma.CauseControlWhereInput | Prisma.CauseControlWhereInput[];
    OR?: Prisma.CauseControlWhereInput[];
    NOT?: Prisma.CauseControlWhereInput | Prisma.CauseControlWhereInput[];
    causeId?: Prisma.UuidFilter<"CauseControl"> | string;
    controlId?: Prisma.UuidFilter<"CauseControl"> | string;
    cause?: Prisma.XOR<Prisma.CauseScalarRelationFilter, Prisma.CauseWhereInput>;
    control?: Prisma.XOR<Prisma.ControlScalarRelationFilter, Prisma.ControlWhereInput>;
}, "id" | "causeId_controlId">;
export type CauseControlOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    causeId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    _count?: Prisma.CauseControlCountOrderByAggregateInput;
    _max?: Prisma.CauseControlMaxOrderByAggregateInput;
    _min?: Prisma.CauseControlMinOrderByAggregateInput;
};
export type CauseControlScalarWhereWithAggregatesInput = {
    AND?: Prisma.CauseControlScalarWhereWithAggregatesInput | Prisma.CauseControlScalarWhereWithAggregatesInput[];
    OR?: Prisma.CauseControlScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CauseControlScalarWhereWithAggregatesInput | Prisma.CauseControlScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"CauseControl"> | string;
    causeId?: Prisma.UuidWithAggregatesFilter<"CauseControl"> | string;
    controlId?: Prisma.UuidWithAggregatesFilter<"CauseControl"> | string;
};
export type CauseControlCreateInput = {
    id?: string;
    cause: Prisma.CauseCreateNestedOneWithoutCauseControlsInput;
    control: Prisma.ControlCreateNestedOneWithoutCauseControlInput;
};
export type CauseControlUncheckedCreateInput = {
    id?: string;
    causeId: string;
    controlId: string;
};
export type CauseControlUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    cause?: Prisma.CauseUpdateOneRequiredWithoutCauseControlsNestedInput;
    control?: Prisma.ControlUpdateOneRequiredWithoutCauseControlNestedInput;
};
export type CauseControlUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CauseControlCreateManyInput = {
    id?: string;
    causeId: string;
    controlId: string;
};
export type CauseControlUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CauseControlUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CauseControlListRelationFilter = {
    every?: Prisma.CauseControlWhereInput;
    some?: Prisma.CauseControlWhereInput;
    none?: Prisma.CauseControlWhereInput;
};
export type CauseControlOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CauseControlCauseIdControlIdCompoundUniqueInput = {
    causeId: string;
    controlId: string;
};
export type CauseControlCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    causeId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
};
export type CauseControlMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    causeId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
};
export type CauseControlMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    causeId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
};
export type CauseControlCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.CauseControlCreateWithoutControlInput, Prisma.CauseControlUncheckedCreateWithoutControlInput> | Prisma.CauseControlCreateWithoutControlInput[] | Prisma.CauseControlUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.CauseControlCreateOrConnectWithoutControlInput | Prisma.CauseControlCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.CauseControlCreateManyControlInputEnvelope;
    connect?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
};
export type CauseControlUncheckedCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.CauseControlCreateWithoutControlInput, Prisma.CauseControlUncheckedCreateWithoutControlInput> | Prisma.CauseControlCreateWithoutControlInput[] | Prisma.CauseControlUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.CauseControlCreateOrConnectWithoutControlInput | Prisma.CauseControlCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.CauseControlCreateManyControlInputEnvelope;
    connect?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
};
export type CauseControlUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.CauseControlCreateWithoutControlInput, Prisma.CauseControlUncheckedCreateWithoutControlInput> | Prisma.CauseControlCreateWithoutControlInput[] | Prisma.CauseControlUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.CauseControlCreateOrConnectWithoutControlInput | Prisma.CauseControlCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.CauseControlUpsertWithWhereUniqueWithoutControlInput | Prisma.CauseControlUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.CauseControlCreateManyControlInputEnvelope;
    set?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    disconnect?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    delete?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    connect?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    update?: Prisma.CauseControlUpdateWithWhereUniqueWithoutControlInput | Prisma.CauseControlUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.CauseControlUpdateManyWithWhereWithoutControlInput | Prisma.CauseControlUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.CauseControlScalarWhereInput | Prisma.CauseControlScalarWhereInput[];
};
export type CauseControlUncheckedUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.CauseControlCreateWithoutControlInput, Prisma.CauseControlUncheckedCreateWithoutControlInput> | Prisma.CauseControlCreateWithoutControlInput[] | Prisma.CauseControlUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.CauseControlCreateOrConnectWithoutControlInput | Prisma.CauseControlCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.CauseControlUpsertWithWhereUniqueWithoutControlInput | Prisma.CauseControlUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.CauseControlCreateManyControlInputEnvelope;
    set?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    disconnect?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    delete?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    connect?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    update?: Prisma.CauseControlUpdateWithWhereUniqueWithoutControlInput | Prisma.CauseControlUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.CauseControlUpdateManyWithWhereWithoutControlInput | Prisma.CauseControlUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.CauseControlScalarWhereInput | Prisma.CauseControlScalarWhereInput[];
};
export type CauseControlCreateNestedManyWithoutCauseInput = {
    create?: Prisma.XOR<Prisma.CauseControlCreateWithoutCauseInput, Prisma.CauseControlUncheckedCreateWithoutCauseInput> | Prisma.CauseControlCreateWithoutCauseInput[] | Prisma.CauseControlUncheckedCreateWithoutCauseInput[];
    connectOrCreate?: Prisma.CauseControlCreateOrConnectWithoutCauseInput | Prisma.CauseControlCreateOrConnectWithoutCauseInput[];
    createMany?: Prisma.CauseControlCreateManyCauseInputEnvelope;
    connect?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
};
export type CauseControlUncheckedCreateNestedManyWithoutCauseInput = {
    create?: Prisma.XOR<Prisma.CauseControlCreateWithoutCauseInput, Prisma.CauseControlUncheckedCreateWithoutCauseInput> | Prisma.CauseControlCreateWithoutCauseInput[] | Prisma.CauseControlUncheckedCreateWithoutCauseInput[];
    connectOrCreate?: Prisma.CauseControlCreateOrConnectWithoutCauseInput | Prisma.CauseControlCreateOrConnectWithoutCauseInput[];
    createMany?: Prisma.CauseControlCreateManyCauseInputEnvelope;
    connect?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
};
export type CauseControlUpdateManyWithoutCauseNestedInput = {
    create?: Prisma.XOR<Prisma.CauseControlCreateWithoutCauseInput, Prisma.CauseControlUncheckedCreateWithoutCauseInput> | Prisma.CauseControlCreateWithoutCauseInput[] | Prisma.CauseControlUncheckedCreateWithoutCauseInput[];
    connectOrCreate?: Prisma.CauseControlCreateOrConnectWithoutCauseInput | Prisma.CauseControlCreateOrConnectWithoutCauseInput[];
    upsert?: Prisma.CauseControlUpsertWithWhereUniqueWithoutCauseInput | Prisma.CauseControlUpsertWithWhereUniqueWithoutCauseInput[];
    createMany?: Prisma.CauseControlCreateManyCauseInputEnvelope;
    set?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    disconnect?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    delete?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    connect?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    update?: Prisma.CauseControlUpdateWithWhereUniqueWithoutCauseInput | Prisma.CauseControlUpdateWithWhereUniqueWithoutCauseInput[];
    updateMany?: Prisma.CauseControlUpdateManyWithWhereWithoutCauseInput | Prisma.CauseControlUpdateManyWithWhereWithoutCauseInput[];
    deleteMany?: Prisma.CauseControlScalarWhereInput | Prisma.CauseControlScalarWhereInput[];
};
export type CauseControlUncheckedUpdateManyWithoutCauseNestedInput = {
    create?: Prisma.XOR<Prisma.CauseControlCreateWithoutCauseInput, Prisma.CauseControlUncheckedCreateWithoutCauseInput> | Prisma.CauseControlCreateWithoutCauseInput[] | Prisma.CauseControlUncheckedCreateWithoutCauseInput[];
    connectOrCreate?: Prisma.CauseControlCreateOrConnectWithoutCauseInput | Prisma.CauseControlCreateOrConnectWithoutCauseInput[];
    upsert?: Prisma.CauseControlUpsertWithWhereUniqueWithoutCauseInput | Prisma.CauseControlUpsertWithWhereUniqueWithoutCauseInput[];
    createMany?: Prisma.CauseControlCreateManyCauseInputEnvelope;
    set?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    disconnect?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    delete?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    connect?: Prisma.CauseControlWhereUniqueInput | Prisma.CauseControlWhereUniqueInput[];
    update?: Prisma.CauseControlUpdateWithWhereUniqueWithoutCauseInput | Prisma.CauseControlUpdateWithWhereUniqueWithoutCauseInput[];
    updateMany?: Prisma.CauseControlUpdateManyWithWhereWithoutCauseInput | Prisma.CauseControlUpdateManyWithWhereWithoutCauseInput[];
    deleteMany?: Prisma.CauseControlScalarWhereInput | Prisma.CauseControlScalarWhereInput[];
};
export type CauseControlCreateWithoutControlInput = {
    id?: string;
    cause: Prisma.CauseCreateNestedOneWithoutCauseControlsInput;
};
export type CauseControlUncheckedCreateWithoutControlInput = {
    id?: string;
    causeId: string;
};
export type CauseControlCreateOrConnectWithoutControlInput = {
    where: Prisma.CauseControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.CauseControlCreateWithoutControlInput, Prisma.CauseControlUncheckedCreateWithoutControlInput>;
};
export type CauseControlCreateManyControlInputEnvelope = {
    data: Prisma.CauseControlCreateManyControlInput | Prisma.CauseControlCreateManyControlInput[];
    skipDuplicates?: boolean;
};
export type CauseControlUpsertWithWhereUniqueWithoutControlInput = {
    where: Prisma.CauseControlWhereUniqueInput;
    update: Prisma.XOR<Prisma.CauseControlUpdateWithoutControlInput, Prisma.CauseControlUncheckedUpdateWithoutControlInput>;
    create: Prisma.XOR<Prisma.CauseControlCreateWithoutControlInput, Prisma.CauseControlUncheckedCreateWithoutControlInput>;
};
export type CauseControlUpdateWithWhereUniqueWithoutControlInput = {
    where: Prisma.CauseControlWhereUniqueInput;
    data: Prisma.XOR<Prisma.CauseControlUpdateWithoutControlInput, Prisma.CauseControlUncheckedUpdateWithoutControlInput>;
};
export type CauseControlUpdateManyWithWhereWithoutControlInput = {
    where: Prisma.CauseControlScalarWhereInput;
    data: Prisma.XOR<Prisma.CauseControlUpdateManyMutationInput, Prisma.CauseControlUncheckedUpdateManyWithoutControlInput>;
};
export type CauseControlScalarWhereInput = {
    AND?: Prisma.CauseControlScalarWhereInput | Prisma.CauseControlScalarWhereInput[];
    OR?: Prisma.CauseControlScalarWhereInput[];
    NOT?: Prisma.CauseControlScalarWhereInput | Prisma.CauseControlScalarWhereInput[];
    id?: Prisma.UuidFilter<"CauseControl"> | string;
    causeId?: Prisma.UuidFilter<"CauseControl"> | string;
    controlId?: Prisma.UuidFilter<"CauseControl"> | string;
};
export type CauseControlCreateWithoutCauseInput = {
    id?: string;
    control: Prisma.ControlCreateNestedOneWithoutCauseControlInput;
};
export type CauseControlUncheckedCreateWithoutCauseInput = {
    id?: string;
    controlId: string;
};
export type CauseControlCreateOrConnectWithoutCauseInput = {
    where: Prisma.CauseControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.CauseControlCreateWithoutCauseInput, Prisma.CauseControlUncheckedCreateWithoutCauseInput>;
};
export type CauseControlCreateManyCauseInputEnvelope = {
    data: Prisma.CauseControlCreateManyCauseInput | Prisma.CauseControlCreateManyCauseInput[];
    skipDuplicates?: boolean;
};
export type CauseControlUpsertWithWhereUniqueWithoutCauseInput = {
    where: Prisma.CauseControlWhereUniqueInput;
    update: Prisma.XOR<Prisma.CauseControlUpdateWithoutCauseInput, Prisma.CauseControlUncheckedUpdateWithoutCauseInput>;
    create: Prisma.XOR<Prisma.CauseControlCreateWithoutCauseInput, Prisma.CauseControlUncheckedCreateWithoutCauseInput>;
};
export type CauseControlUpdateWithWhereUniqueWithoutCauseInput = {
    where: Prisma.CauseControlWhereUniqueInput;
    data: Prisma.XOR<Prisma.CauseControlUpdateWithoutCauseInput, Prisma.CauseControlUncheckedUpdateWithoutCauseInput>;
};
export type CauseControlUpdateManyWithWhereWithoutCauseInput = {
    where: Prisma.CauseControlScalarWhereInput;
    data: Prisma.XOR<Prisma.CauseControlUpdateManyMutationInput, Prisma.CauseControlUncheckedUpdateManyWithoutCauseInput>;
};
export type CauseControlCreateManyControlInput = {
    id?: string;
    causeId: string;
};
export type CauseControlUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    cause?: Prisma.CauseUpdateOneRequiredWithoutCauseControlsNestedInput;
};
export type CauseControlUncheckedUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CauseControlUncheckedUpdateManyWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CauseControlCreateManyCauseInput = {
    id?: string;
    controlId: string;
};
export type CauseControlUpdateWithoutCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    control?: Prisma.ControlUpdateOneRequiredWithoutCauseControlNestedInput;
};
export type CauseControlUncheckedUpdateWithoutCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CauseControlUncheckedUpdateManyWithoutCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CauseControlSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    causeId?: boolean;
    controlId?: boolean;
    cause?: boolean | Prisma.CauseDefaultArgs<ExtArgs>;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["causeControl"]>;
export type CauseControlSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    causeId?: boolean;
    controlId?: boolean;
    cause?: boolean | Prisma.CauseDefaultArgs<ExtArgs>;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["causeControl"]>;
export type CauseControlSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    causeId?: boolean;
    controlId?: boolean;
    cause?: boolean | Prisma.CauseDefaultArgs<ExtArgs>;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["causeControl"]>;
export type CauseControlSelectScalar = {
    id?: boolean;
    causeId?: boolean;
    controlId?: boolean;
};
export type CauseControlOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "causeId" | "controlId", ExtArgs["result"]["causeControl"]>;
export type CauseControlInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cause?: boolean | Prisma.CauseDefaultArgs<ExtArgs>;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type CauseControlIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cause?: boolean | Prisma.CauseDefaultArgs<ExtArgs>;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type CauseControlIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    cause?: boolean | Prisma.CauseDefaultArgs<ExtArgs>;
    control?: boolean | Prisma.ControlDefaultArgs<ExtArgs>;
};
export type $CauseControlPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "CauseControl";
    objects: {
        cause: Prisma.$CausePayload<ExtArgs>;
        control: Prisma.$ControlPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        causeId: string;
        controlId: string;
    }, ExtArgs["result"]["causeControl"]>;
    composites: {};
};
export type CauseControlGetPayload<S extends boolean | null | undefined | CauseControlDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CauseControlPayload, S>;
export type CauseControlCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CauseControlFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CauseControlCountAggregateInputType | true;
};
export interface CauseControlDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['CauseControl'];
        meta: {
            name: 'CauseControl';
        };
    };
    findUnique<T extends CauseControlFindUniqueArgs>(args: Prisma.SelectSubset<T, CauseControlFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CauseControlClient<runtime.Types.Result.GetResult<Prisma.$CauseControlPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CauseControlFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CauseControlFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CauseControlClient<runtime.Types.Result.GetResult<Prisma.$CauseControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CauseControlFindFirstArgs>(args?: Prisma.SelectSubset<T, CauseControlFindFirstArgs<ExtArgs>>): Prisma.Prisma__CauseControlClient<runtime.Types.Result.GetResult<Prisma.$CauseControlPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CauseControlFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CauseControlFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CauseControlClient<runtime.Types.Result.GetResult<Prisma.$CauseControlPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CauseControlFindManyArgs>(args?: Prisma.SelectSubset<T, CauseControlFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CauseControlPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CauseControlCreateArgs>(args: Prisma.SelectSubset<T, CauseControlCreateArgs<ExtArgs>>): Prisma.Prisma__CauseControlClient<runtime.Types.Result.GetResult<Prisma.$CauseControlPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CauseControlCreateManyArgs>(args?: Prisma.SelectSubset<T, CauseControlCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends CauseControlCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CauseControlCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CauseControlPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends CauseControlDeleteArgs>(args: Prisma.SelectSubset<T, CauseControlDeleteArgs<ExtArgs>>): Prisma.Prisma__CauseControlClient<runtime.Types.Result.GetResult<Prisma.$CauseControlPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CauseControlUpdateArgs>(args: Prisma.SelectSubset<T, CauseControlUpdateArgs<ExtArgs>>): Prisma.Prisma__CauseControlClient<runtime.Types.Result.GetResult<Prisma.$CauseControlPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CauseControlDeleteManyArgs>(args?: Prisma.SelectSubset<T, CauseControlDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CauseControlUpdateManyArgs>(args: Prisma.SelectSubset<T, CauseControlUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends CauseControlUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CauseControlUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CauseControlPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends CauseControlUpsertArgs>(args: Prisma.SelectSubset<T, CauseControlUpsertArgs<ExtArgs>>): Prisma.Prisma__CauseControlClient<runtime.Types.Result.GetResult<Prisma.$CauseControlPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CauseControlCountArgs>(args?: Prisma.Subset<T, CauseControlCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CauseControlCountAggregateOutputType> : number>;
    aggregate<T extends CauseControlAggregateArgs>(args: Prisma.Subset<T, CauseControlAggregateArgs>): Prisma.PrismaPromise<GetCauseControlAggregateType<T>>;
    groupBy<T extends CauseControlGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CauseControlGroupByArgs['orderBy'];
    } : {
        orderBy?: CauseControlGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CauseControlGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCauseControlGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CauseControlFieldRefs;
}
export interface Prisma__CauseControlClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    cause<T extends Prisma.CauseDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CauseDefaultArgs<ExtArgs>>): Prisma.Prisma__CauseClient<runtime.Types.Result.GetResult<Prisma.$CausePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    control<T extends Prisma.ControlDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ControlDefaultArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CauseControlFieldRefs {
    readonly id: Prisma.FieldRef<"CauseControl", 'String'>;
    readonly causeId: Prisma.FieldRef<"CauseControl", 'String'>;
    readonly controlId: Prisma.FieldRef<"CauseControl", 'String'>;
}
export type CauseControlFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseControlSelect<ExtArgs> | null;
    omit?: Prisma.CauseControlOmit<ExtArgs> | null;
    include?: Prisma.CauseControlInclude<ExtArgs> | null;
    where: Prisma.CauseControlWhereUniqueInput;
};
export type CauseControlFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseControlSelect<ExtArgs> | null;
    omit?: Prisma.CauseControlOmit<ExtArgs> | null;
    include?: Prisma.CauseControlInclude<ExtArgs> | null;
    where: Prisma.CauseControlWhereUniqueInput;
};
export type CauseControlFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseControlSelect<ExtArgs> | null;
    omit?: Prisma.CauseControlOmit<ExtArgs> | null;
    include?: Prisma.CauseControlInclude<ExtArgs> | null;
    where?: Prisma.CauseControlWhereInput;
    orderBy?: Prisma.CauseControlOrderByWithRelationInput | Prisma.CauseControlOrderByWithRelationInput[];
    cursor?: Prisma.CauseControlWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CauseControlScalarFieldEnum | Prisma.CauseControlScalarFieldEnum[];
};
export type CauseControlFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseControlSelect<ExtArgs> | null;
    omit?: Prisma.CauseControlOmit<ExtArgs> | null;
    include?: Prisma.CauseControlInclude<ExtArgs> | null;
    where?: Prisma.CauseControlWhereInput;
    orderBy?: Prisma.CauseControlOrderByWithRelationInput | Prisma.CauseControlOrderByWithRelationInput[];
    cursor?: Prisma.CauseControlWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CauseControlScalarFieldEnum | Prisma.CauseControlScalarFieldEnum[];
};
export type CauseControlFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseControlSelect<ExtArgs> | null;
    omit?: Prisma.CauseControlOmit<ExtArgs> | null;
    include?: Prisma.CauseControlInclude<ExtArgs> | null;
    where?: Prisma.CauseControlWhereInput;
    orderBy?: Prisma.CauseControlOrderByWithRelationInput | Prisma.CauseControlOrderByWithRelationInput[];
    cursor?: Prisma.CauseControlWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CauseControlScalarFieldEnum | Prisma.CauseControlScalarFieldEnum[];
};
export type CauseControlCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseControlSelect<ExtArgs> | null;
    omit?: Prisma.CauseControlOmit<ExtArgs> | null;
    include?: Prisma.CauseControlInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CauseControlCreateInput, Prisma.CauseControlUncheckedCreateInput>;
};
export type CauseControlCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CauseControlCreateManyInput | Prisma.CauseControlCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CauseControlCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseControlSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CauseControlOmit<ExtArgs> | null;
    data: Prisma.CauseControlCreateManyInput | Prisma.CauseControlCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.CauseControlIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type CauseControlUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseControlSelect<ExtArgs> | null;
    omit?: Prisma.CauseControlOmit<ExtArgs> | null;
    include?: Prisma.CauseControlInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CauseControlUpdateInput, Prisma.CauseControlUncheckedUpdateInput>;
    where: Prisma.CauseControlWhereUniqueInput;
};
export type CauseControlUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CauseControlUpdateManyMutationInput, Prisma.CauseControlUncheckedUpdateManyInput>;
    where?: Prisma.CauseControlWhereInput;
    limit?: number;
};
export type CauseControlUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseControlSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CauseControlOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CauseControlUpdateManyMutationInput, Prisma.CauseControlUncheckedUpdateManyInput>;
    where?: Prisma.CauseControlWhereInput;
    limit?: number;
    include?: Prisma.CauseControlIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type CauseControlUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseControlSelect<ExtArgs> | null;
    omit?: Prisma.CauseControlOmit<ExtArgs> | null;
    include?: Prisma.CauseControlInclude<ExtArgs> | null;
    where: Prisma.CauseControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.CauseControlCreateInput, Prisma.CauseControlUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CauseControlUpdateInput, Prisma.CauseControlUncheckedUpdateInput>;
};
export type CauseControlDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseControlSelect<ExtArgs> | null;
    omit?: Prisma.CauseControlOmit<ExtArgs> | null;
    include?: Prisma.CauseControlInclude<ExtArgs> | null;
    where: Prisma.CauseControlWhereUniqueInput;
};
export type CauseControlDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CauseControlWhereInput;
    limit?: number;
};
export type CauseControlDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseControlSelect<ExtArgs> | null;
    omit?: Prisma.CauseControlOmit<ExtArgs> | null;
    include?: Prisma.CauseControlInclude<ExtArgs> | null;
};
export {};
