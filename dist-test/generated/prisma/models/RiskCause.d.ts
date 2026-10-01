import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type RiskCauseModel = runtime.Types.Result.DefaultSelection<Prisma.$RiskCausePayload>;
export type AggregateRiskCause = {
    _count: RiskCauseCountAggregateOutputType | null;
    _min: RiskCauseMinAggregateOutputType | null;
    _max: RiskCauseMaxAggregateOutputType | null;
};
export type RiskCauseMinAggregateOutputType = {
    id: string | null;
    code: string | null;
    riskId: string | null;
    causeId: string | null;
};
export type RiskCauseMaxAggregateOutputType = {
    id: string | null;
    code: string | null;
    riskId: string | null;
    causeId: string | null;
};
export type RiskCauseCountAggregateOutputType = {
    id: number;
    code: number;
    riskId: number;
    causeId: number;
    _all: number;
};
export type RiskCauseMinAggregateInputType = {
    id?: true;
    code?: true;
    riskId?: true;
    causeId?: true;
};
export type RiskCauseMaxAggregateInputType = {
    id?: true;
    code?: true;
    riskId?: true;
    causeId?: true;
};
export type RiskCauseCountAggregateInputType = {
    id?: true;
    code?: true;
    riskId?: true;
    causeId?: true;
    _all?: true;
};
export type RiskCauseAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RiskCauseWhereInput;
    orderBy?: Prisma.RiskCauseOrderByWithRelationInput | Prisma.RiskCauseOrderByWithRelationInput[];
    cursor?: Prisma.RiskCauseWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | RiskCauseCountAggregateInputType;
    _min?: RiskCauseMinAggregateInputType;
    _max?: RiskCauseMaxAggregateInputType;
};
export type GetRiskCauseAggregateType<T extends RiskCauseAggregateArgs> = {
    [P in keyof T & keyof AggregateRiskCause]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRiskCause[P]> : Prisma.GetScalarType<T[P], AggregateRiskCause[P]>;
};
export type RiskCauseGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RiskCauseWhereInput;
    orderBy?: Prisma.RiskCauseOrderByWithAggregationInput | Prisma.RiskCauseOrderByWithAggregationInput[];
    by: Prisma.RiskCauseScalarFieldEnum[] | Prisma.RiskCauseScalarFieldEnum;
    having?: Prisma.RiskCauseScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RiskCauseCountAggregateInputType | true;
    _min?: RiskCauseMinAggregateInputType;
    _max?: RiskCauseMaxAggregateInputType;
};
export type RiskCauseGroupByOutputType = {
    id: string;
    code: string;
    riskId: string;
    causeId: string;
    _count: RiskCauseCountAggregateOutputType | null;
    _min: RiskCauseMinAggregateOutputType | null;
    _max: RiskCauseMaxAggregateOutputType | null;
};
type GetRiskCauseGroupByPayload<T extends RiskCauseGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RiskCauseGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RiskCauseGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RiskCauseGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RiskCauseGroupByOutputType[P]>;
}>>;
export type RiskCauseWhereInput = {
    AND?: Prisma.RiskCauseWhereInput | Prisma.RiskCauseWhereInput[];
    OR?: Prisma.RiskCauseWhereInput[];
    NOT?: Prisma.RiskCauseWhereInput | Prisma.RiskCauseWhereInput[];
    id?: Prisma.UuidFilter<"RiskCause"> | string;
    code?: Prisma.StringFilter<"RiskCause"> | string;
    riskId?: Prisma.UuidFilter<"RiskCause"> | string;
    causeId?: Prisma.UuidFilter<"RiskCause"> | string;
    risk?: Prisma.XOR<Prisma.RiskScalarRelationFilter, Prisma.RiskWhereInput>;
    cause?: Prisma.XOR<Prisma.CauseScalarRelationFilter, Prisma.CauseWhereInput>;
};
export type RiskCauseOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    riskId?: Prisma.SortOrder;
    causeId?: Prisma.SortOrder;
    risk?: Prisma.RiskOrderByWithRelationInput;
    cause?: Prisma.CauseOrderByWithRelationInput;
};
export type RiskCauseWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    code?: string;
    riskId_causeId?: Prisma.RiskCauseRiskIdCauseIdCompoundUniqueInput;
    AND?: Prisma.RiskCauseWhereInput | Prisma.RiskCauseWhereInput[];
    OR?: Prisma.RiskCauseWhereInput[];
    NOT?: Prisma.RiskCauseWhereInput | Prisma.RiskCauseWhereInput[];
    riskId?: Prisma.UuidFilter<"RiskCause"> | string;
    causeId?: Prisma.UuidFilter<"RiskCause"> | string;
    risk?: Prisma.XOR<Prisma.RiskScalarRelationFilter, Prisma.RiskWhereInput>;
    cause?: Prisma.XOR<Prisma.CauseScalarRelationFilter, Prisma.CauseWhereInput>;
}, "id" | "code" | "riskId_causeId">;
export type RiskCauseOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    riskId?: Prisma.SortOrder;
    causeId?: Prisma.SortOrder;
    _count?: Prisma.RiskCauseCountOrderByAggregateInput;
    _max?: Prisma.RiskCauseMaxOrderByAggregateInput;
    _min?: Prisma.RiskCauseMinOrderByAggregateInput;
};
export type RiskCauseScalarWhereWithAggregatesInput = {
    AND?: Prisma.RiskCauseScalarWhereWithAggregatesInput | Prisma.RiskCauseScalarWhereWithAggregatesInput[];
    OR?: Prisma.RiskCauseScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RiskCauseScalarWhereWithAggregatesInput | Prisma.RiskCauseScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"RiskCause"> | string;
    code?: Prisma.StringWithAggregatesFilter<"RiskCause"> | string;
    riskId?: Prisma.UuidWithAggregatesFilter<"RiskCause"> | string;
    causeId?: Prisma.UuidWithAggregatesFilter<"RiskCause"> | string;
};
export type RiskCauseCreateInput = {
    id?: string;
    code: string;
    risk: Prisma.RiskCreateNestedOneWithoutRiskCausesInput;
    cause: Prisma.CauseCreateNestedOneWithoutRiskCausesInput;
};
export type RiskCauseUncheckedCreateInput = {
    id?: string;
    code: string;
    riskId: string;
    causeId: string;
};
export type RiskCauseUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    risk?: Prisma.RiskUpdateOneRequiredWithoutRiskCausesNestedInput;
    cause?: Prisma.CauseUpdateOneRequiredWithoutRiskCausesNestedInput;
};
export type RiskCauseUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    riskId?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RiskCauseCreateManyInput = {
    id?: string;
    code: string;
    riskId: string;
    causeId: string;
};
export type RiskCauseUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RiskCauseUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    riskId?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RiskCauseListRelationFilter = {
    every?: Prisma.RiskCauseWhereInput;
    some?: Prisma.RiskCauseWhereInput;
    none?: Prisma.RiskCauseWhereInput;
};
export type RiskCauseOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type RiskCauseRiskIdCauseIdCompoundUniqueInput = {
    riskId: string;
    causeId: string;
};
export type RiskCauseCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    riskId?: Prisma.SortOrder;
    causeId?: Prisma.SortOrder;
};
export type RiskCauseMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    riskId?: Prisma.SortOrder;
    causeId?: Prisma.SortOrder;
};
export type RiskCauseMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    riskId?: Prisma.SortOrder;
    causeId?: Prisma.SortOrder;
};
export type RiskCauseCreateNestedManyWithoutRiskInput = {
    create?: Prisma.XOR<Prisma.RiskCauseCreateWithoutRiskInput, Prisma.RiskCauseUncheckedCreateWithoutRiskInput> | Prisma.RiskCauseCreateWithoutRiskInput[] | Prisma.RiskCauseUncheckedCreateWithoutRiskInput[];
    connectOrCreate?: Prisma.RiskCauseCreateOrConnectWithoutRiskInput | Prisma.RiskCauseCreateOrConnectWithoutRiskInput[];
    createMany?: Prisma.RiskCauseCreateManyRiskInputEnvelope;
    connect?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
};
export type RiskCauseUncheckedCreateNestedManyWithoutRiskInput = {
    create?: Prisma.XOR<Prisma.RiskCauseCreateWithoutRiskInput, Prisma.RiskCauseUncheckedCreateWithoutRiskInput> | Prisma.RiskCauseCreateWithoutRiskInput[] | Prisma.RiskCauseUncheckedCreateWithoutRiskInput[];
    connectOrCreate?: Prisma.RiskCauseCreateOrConnectWithoutRiskInput | Prisma.RiskCauseCreateOrConnectWithoutRiskInput[];
    createMany?: Prisma.RiskCauseCreateManyRiskInputEnvelope;
    connect?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
};
export type RiskCauseUpdateManyWithoutRiskNestedInput = {
    create?: Prisma.XOR<Prisma.RiskCauseCreateWithoutRiskInput, Prisma.RiskCauseUncheckedCreateWithoutRiskInput> | Prisma.RiskCauseCreateWithoutRiskInput[] | Prisma.RiskCauseUncheckedCreateWithoutRiskInput[];
    connectOrCreate?: Prisma.RiskCauseCreateOrConnectWithoutRiskInput | Prisma.RiskCauseCreateOrConnectWithoutRiskInput[];
    upsert?: Prisma.RiskCauseUpsertWithWhereUniqueWithoutRiskInput | Prisma.RiskCauseUpsertWithWhereUniqueWithoutRiskInput[];
    createMany?: Prisma.RiskCauseCreateManyRiskInputEnvelope;
    set?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    disconnect?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    delete?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    connect?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    update?: Prisma.RiskCauseUpdateWithWhereUniqueWithoutRiskInput | Prisma.RiskCauseUpdateWithWhereUniqueWithoutRiskInput[];
    updateMany?: Prisma.RiskCauseUpdateManyWithWhereWithoutRiskInput | Prisma.RiskCauseUpdateManyWithWhereWithoutRiskInput[];
    deleteMany?: Prisma.RiskCauseScalarWhereInput | Prisma.RiskCauseScalarWhereInput[];
};
export type RiskCauseUncheckedUpdateManyWithoutRiskNestedInput = {
    create?: Prisma.XOR<Prisma.RiskCauseCreateWithoutRiskInput, Prisma.RiskCauseUncheckedCreateWithoutRiskInput> | Prisma.RiskCauseCreateWithoutRiskInput[] | Prisma.RiskCauseUncheckedCreateWithoutRiskInput[];
    connectOrCreate?: Prisma.RiskCauseCreateOrConnectWithoutRiskInput | Prisma.RiskCauseCreateOrConnectWithoutRiskInput[];
    upsert?: Prisma.RiskCauseUpsertWithWhereUniqueWithoutRiskInput | Prisma.RiskCauseUpsertWithWhereUniqueWithoutRiskInput[];
    createMany?: Prisma.RiskCauseCreateManyRiskInputEnvelope;
    set?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    disconnect?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    delete?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    connect?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    update?: Prisma.RiskCauseUpdateWithWhereUniqueWithoutRiskInput | Prisma.RiskCauseUpdateWithWhereUniqueWithoutRiskInput[];
    updateMany?: Prisma.RiskCauseUpdateManyWithWhereWithoutRiskInput | Prisma.RiskCauseUpdateManyWithWhereWithoutRiskInput[];
    deleteMany?: Prisma.RiskCauseScalarWhereInput | Prisma.RiskCauseScalarWhereInput[];
};
export type RiskCauseCreateNestedManyWithoutCauseInput = {
    create?: Prisma.XOR<Prisma.RiskCauseCreateWithoutCauseInput, Prisma.RiskCauseUncheckedCreateWithoutCauseInput> | Prisma.RiskCauseCreateWithoutCauseInput[] | Prisma.RiskCauseUncheckedCreateWithoutCauseInput[];
    connectOrCreate?: Prisma.RiskCauseCreateOrConnectWithoutCauseInput | Prisma.RiskCauseCreateOrConnectWithoutCauseInput[];
    createMany?: Prisma.RiskCauseCreateManyCauseInputEnvelope;
    connect?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
};
export type RiskCauseUncheckedCreateNestedManyWithoutCauseInput = {
    create?: Prisma.XOR<Prisma.RiskCauseCreateWithoutCauseInput, Prisma.RiskCauseUncheckedCreateWithoutCauseInput> | Prisma.RiskCauseCreateWithoutCauseInput[] | Prisma.RiskCauseUncheckedCreateWithoutCauseInput[];
    connectOrCreate?: Prisma.RiskCauseCreateOrConnectWithoutCauseInput | Prisma.RiskCauseCreateOrConnectWithoutCauseInput[];
    createMany?: Prisma.RiskCauseCreateManyCauseInputEnvelope;
    connect?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
};
export type RiskCauseUpdateManyWithoutCauseNestedInput = {
    create?: Prisma.XOR<Prisma.RiskCauseCreateWithoutCauseInput, Prisma.RiskCauseUncheckedCreateWithoutCauseInput> | Prisma.RiskCauseCreateWithoutCauseInput[] | Prisma.RiskCauseUncheckedCreateWithoutCauseInput[];
    connectOrCreate?: Prisma.RiskCauseCreateOrConnectWithoutCauseInput | Prisma.RiskCauseCreateOrConnectWithoutCauseInput[];
    upsert?: Prisma.RiskCauseUpsertWithWhereUniqueWithoutCauseInput | Prisma.RiskCauseUpsertWithWhereUniqueWithoutCauseInput[];
    createMany?: Prisma.RiskCauseCreateManyCauseInputEnvelope;
    set?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    disconnect?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    delete?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    connect?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    update?: Prisma.RiskCauseUpdateWithWhereUniqueWithoutCauseInput | Prisma.RiskCauseUpdateWithWhereUniqueWithoutCauseInput[];
    updateMany?: Prisma.RiskCauseUpdateManyWithWhereWithoutCauseInput | Prisma.RiskCauseUpdateManyWithWhereWithoutCauseInput[];
    deleteMany?: Prisma.RiskCauseScalarWhereInput | Prisma.RiskCauseScalarWhereInput[];
};
export type RiskCauseUncheckedUpdateManyWithoutCauseNestedInput = {
    create?: Prisma.XOR<Prisma.RiskCauseCreateWithoutCauseInput, Prisma.RiskCauseUncheckedCreateWithoutCauseInput> | Prisma.RiskCauseCreateWithoutCauseInput[] | Prisma.RiskCauseUncheckedCreateWithoutCauseInput[];
    connectOrCreate?: Prisma.RiskCauseCreateOrConnectWithoutCauseInput | Prisma.RiskCauseCreateOrConnectWithoutCauseInput[];
    upsert?: Prisma.RiskCauseUpsertWithWhereUniqueWithoutCauseInput | Prisma.RiskCauseUpsertWithWhereUniqueWithoutCauseInput[];
    createMany?: Prisma.RiskCauseCreateManyCauseInputEnvelope;
    set?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    disconnect?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    delete?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    connect?: Prisma.RiskCauseWhereUniqueInput | Prisma.RiskCauseWhereUniqueInput[];
    update?: Prisma.RiskCauseUpdateWithWhereUniqueWithoutCauseInput | Prisma.RiskCauseUpdateWithWhereUniqueWithoutCauseInput[];
    updateMany?: Prisma.RiskCauseUpdateManyWithWhereWithoutCauseInput | Prisma.RiskCauseUpdateManyWithWhereWithoutCauseInput[];
    deleteMany?: Prisma.RiskCauseScalarWhereInput | Prisma.RiskCauseScalarWhereInput[];
};
export type RiskCauseCreateWithoutRiskInput = {
    id?: string;
    code: string;
    cause: Prisma.CauseCreateNestedOneWithoutRiskCausesInput;
};
export type RiskCauseUncheckedCreateWithoutRiskInput = {
    id?: string;
    code: string;
    causeId: string;
};
export type RiskCauseCreateOrConnectWithoutRiskInput = {
    where: Prisma.RiskCauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.RiskCauseCreateWithoutRiskInput, Prisma.RiskCauseUncheckedCreateWithoutRiskInput>;
};
export type RiskCauseCreateManyRiskInputEnvelope = {
    data: Prisma.RiskCauseCreateManyRiskInput | Prisma.RiskCauseCreateManyRiskInput[];
    skipDuplicates?: boolean;
};
export type RiskCauseUpsertWithWhereUniqueWithoutRiskInput = {
    where: Prisma.RiskCauseWhereUniqueInput;
    update: Prisma.XOR<Prisma.RiskCauseUpdateWithoutRiskInput, Prisma.RiskCauseUncheckedUpdateWithoutRiskInput>;
    create: Prisma.XOR<Prisma.RiskCauseCreateWithoutRiskInput, Prisma.RiskCauseUncheckedCreateWithoutRiskInput>;
};
export type RiskCauseUpdateWithWhereUniqueWithoutRiskInput = {
    where: Prisma.RiskCauseWhereUniqueInput;
    data: Prisma.XOR<Prisma.RiskCauseUpdateWithoutRiskInput, Prisma.RiskCauseUncheckedUpdateWithoutRiskInput>;
};
export type RiskCauseUpdateManyWithWhereWithoutRiskInput = {
    where: Prisma.RiskCauseScalarWhereInput;
    data: Prisma.XOR<Prisma.RiskCauseUpdateManyMutationInput, Prisma.RiskCauseUncheckedUpdateManyWithoutRiskInput>;
};
export type RiskCauseScalarWhereInput = {
    AND?: Prisma.RiskCauseScalarWhereInput | Prisma.RiskCauseScalarWhereInput[];
    OR?: Prisma.RiskCauseScalarWhereInput[];
    NOT?: Prisma.RiskCauseScalarWhereInput | Prisma.RiskCauseScalarWhereInput[];
    id?: Prisma.UuidFilter<"RiskCause"> | string;
    code?: Prisma.StringFilter<"RiskCause"> | string;
    riskId?: Prisma.UuidFilter<"RiskCause"> | string;
    causeId?: Prisma.UuidFilter<"RiskCause"> | string;
};
export type RiskCauseCreateWithoutCauseInput = {
    id?: string;
    code: string;
    risk: Prisma.RiskCreateNestedOneWithoutRiskCausesInput;
};
export type RiskCauseUncheckedCreateWithoutCauseInput = {
    id?: string;
    code: string;
    riskId: string;
};
export type RiskCauseCreateOrConnectWithoutCauseInput = {
    where: Prisma.RiskCauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.RiskCauseCreateWithoutCauseInput, Prisma.RiskCauseUncheckedCreateWithoutCauseInput>;
};
export type RiskCauseCreateManyCauseInputEnvelope = {
    data: Prisma.RiskCauseCreateManyCauseInput | Prisma.RiskCauseCreateManyCauseInput[];
    skipDuplicates?: boolean;
};
export type RiskCauseUpsertWithWhereUniqueWithoutCauseInput = {
    where: Prisma.RiskCauseWhereUniqueInput;
    update: Prisma.XOR<Prisma.RiskCauseUpdateWithoutCauseInput, Prisma.RiskCauseUncheckedUpdateWithoutCauseInput>;
    create: Prisma.XOR<Prisma.RiskCauseCreateWithoutCauseInput, Prisma.RiskCauseUncheckedCreateWithoutCauseInput>;
};
export type RiskCauseUpdateWithWhereUniqueWithoutCauseInput = {
    where: Prisma.RiskCauseWhereUniqueInput;
    data: Prisma.XOR<Prisma.RiskCauseUpdateWithoutCauseInput, Prisma.RiskCauseUncheckedUpdateWithoutCauseInput>;
};
export type RiskCauseUpdateManyWithWhereWithoutCauseInput = {
    where: Prisma.RiskCauseScalarWhereInput;
    data: Prisma.XOR<Prisma.RiskCauseUpdateManyMutationInput, Prisma.RiskCauseUncheckedUpdateManyWithoutCauseInput>;
};
export type RiskCauseCreateManyRiskInput = {
    id?: string;
    code: string;
    causeId: string;
};
export type RiskCauseUpdateWithoutRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    cause?: Prisma.CauseUpdateOneRequiredWithoutRiskCausesNestedInput;
};
export type RiskCauseUncheckedUpdateWithoutRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RiskCauseUncheckedUpdateManyWithoutRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RiskCauseCreateManyCauseInput = {
    id?: string;
    code: string;
    riskId: string;
};
export type RiskCauseUpdateWithoutCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    risk?: Prisma.RiskUpdateOneRequiredWithoutRiskCausesNestedInput;
};
export type RiskCauseUncheckedUpdateWithoutCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    riskId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RiskCauseUncheckedUpdateManyWithoutCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    riskId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RiskCauseSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    riskId?: boolean;
    causeId?: boolean;
    risk?: boolean | Prisma.RiskDefaultArgs<ExtArgs>;
    cause?: boolean | Prisma.CauseDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["riskCause"]>;
export type RiskCauseSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    riskId?: boolean;
    causeId?: boolean;
    risk?: boolean | Prisma.RiskDefaultArgs<ExtArgs>;
    cause?: boolean | Prisma.CauseDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["riskCause"]>;
export type RiskCauseSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    riskId?: boolean;
    causeId?: boolean;
    risk?: boolean | Prisma.RiskDefaultArgs<ExtArgs>;
    cause?: boolean | Prisma.CauseDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["riskCause"]>;
export type RiskCauseSelectScalar = {
    id?: boolean;
    code?: boolean;
    riskId?: boolean;
    causeId?: boolean;
};
export type RiskCauseOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "code" | "riskId" | "causeId", ExtArgs["result"]["riskCause"]>;
export type RiskCauseInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    risk?: boolean | Prisma.RiskDefaultArgs<ExtArgs>;
    cause?: boolean | Prisma.CauseDefaultArgs<ExtArgs>;
};
export type RiskCauseIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    risk?: boolean | Prisma.RiskDefaultArgs<ExtArgs>;
    cause?: boolean | Prisma.CauseDefaultArgs<ExtArgs>;
};
export type RiskCauseIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    risk?: boolean | Prisma.RiskDefaultArgs<ExtArgs>;
    cause?: boolean | Prisma.CauseDefaultArgs<ExtArgs>;
};
export type $RiskCausePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "RiskCause";
    objects: {
        risk: Prisma.$RiskPayload<ExtArgs>;
        cause: Prisma.$CausePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        code: string;
        riskId: string;
        causeId: string;
    }, ExtArgs["result"]["riskCause"]>;
    composites: {};
};
export type RiskCauseGetPayload<S extends boolean | null | undefined | RiskCauseDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RiskCausePayload, S>;
export type RiskCauseCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RiskCauseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RiskCauseCountAggregateInputType | true;
};
export interface RiskCauseDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['RiskCause'];
        meta: {
            name: 'RiskCause';
        };
    };
    findUnique<T extends RiskCauseFindUniqueArgs>(args: Prisma.SelectSubset<T, RiskCauseFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RiskCauseClient<runtime.Types.Result.GetResult<Prisma.$RiskCausePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends RiskCauseFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RiskCauseFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RiskCauseClient<runtime.Types.Result.GetResult<Prisma.$RiskCausePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends RiskCauseFindFirstArgs>(args?: Prisma.SelectSubset<T, RiskCauseFindFirstArgs<ExtArgs>>): Prisma.Prisma__RiskCauseClient<runtime.Types.Result.GetResult<Prisma.$RiskCausePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends RiskCauseFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RiskCauseFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RiskCauseClient<runtime.Types.Result.GetResult<Prisma.$RiskCausePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends RiskCauseFindManyArgs>(args?: Prisma.SelectSubset<T, RiskCauseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RiskCausePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends RiskCauseCreateArgs>(args: Prisma.SelectSubset<T, RiskCauseCreateArgs<ExtArgs>>): Prisma.Prisma__RiskCauseClient<runtime.Types.Result.GetResult<Prisma.$RiskCausePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends RiskCauseCreateManyArgs>(args?: Prisma.SelectSubset<T, RiskCauseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends RiskCauseCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RiskCauseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RiskCausePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends RiskCauseDeleteArgs>(args: Prisma.SelectSubset<T, RiskCauseDeleteArgs<ExtArgs>>): Prisma.Prisma__RiskCauseClient<runtime.Types.Result.GetResult<Prisma.$RiskCausePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends RiskCauseUpdateArgs>(args: Prisma.SelectSubset<T, RiskCauseUpdateArgs<ExtArgs>>): Prisma.Prisma__RiskCauseClient<runtime.Types.Result.GetResult<Prisma.$RiskCausePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends RiskCauseDeleteManyArgs>(args?: Prisma.SelectSubset<T, RiskCauseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends RiskCauseUpdateManyArgs>(args: Prisma.SelectSubset<T, RiskCauseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends RiskCauseUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RiskCauseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RiskCausePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends RiskCauseUpsertArgs>(args: Prisma.SelectSubset<T, RiskCauseUpsertArgs<ExtArgs>>): Prisma.Prisma__RiskCauseClient<runtime.Types.Result.GetResult<Prisma.$RiskCausePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends RiskCauseCountArgs>(args?: Prisma.Subset<T, RiskCauseCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RiskCauseCountAggregateOutputType> : number>;
    aggregate<T extends RiskCauseAggregateArgs>(args: Prisma.Subset<T, RiskCauseAggregateArgs>): Prisma.PrismaPromise<GetRiskCauseAggregateType<T>>;
    groupBy<T extends RiskCauseGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RiskCauseGroupByArgs['orderBy'];
    } : {
        orderBy?: RiskCauseGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RiskCauseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRiskCauseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: RiskCauseFieldRefs;
}
export interface Prisma__RiskCauseClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    risk<T extends Prisma.RiskDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RiskDefaultArgs<ExtArgs>>): Prisma.Prisma__RiskClient<runtime.Types.Result.GetResult<Prisma.$RiskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    cause<T extends Prisma.CauseDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CauseDefaultArgs<ExtArgs>>): Prisma.Prisma__CauseClient<runtime.Types.Result.GetResult<Prisma.$CausePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface RiskCauseFieldRefs {
    readonly id: Prisma.FieldRef<"RiskCause", 'String'>;
    readonly code: Prisma.FieldRef<"RiskCause", 'String'>;
    readonly riskId: Prisma.FieldRef<"RiskCause", 'String'>;
    readonly causeId: Prisma.FieldRef<"RiskCause", 'String'>;
}
export type RiskCauseFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.RiskCauseOmit<ExtArgs> | null;
    include?: Prisma.RiskCauseInclude<ExtArgs> | null;
    where: Prisma.RiskCauseWhereUniqueInput;
};
export type RiskCauseFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.RiskCauseOmit<ExtArgs> | null;
    include?: Prisma.RiskCauseInclude<ExtArgs> | null;
    where: Prisma.RiskCauseWhereUniqueInput;
};
export type RiskCauseFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.RiskCauseOmit<ExtArgs> | null;
    include?: Prisma.RiskCauseInclude<ExtArgs> | null;
    where?: Prisma.RiskCauseWhereInput;
    orderBy?: Prisma.RiskCauseOrderByWithRelationInput | Prisma.RiskCauseOrderByWithRelationInput[];
    cursor?: Prisma.RiskCauseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RiskCauseScalarFieldEnum | Prisma.RiskCauseScalarFieldEnum[];
};
export type RiskCauseFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.RiskCauseOmit<ExtArgs> | null;
    include?: Prisma.RiskCauseInclude<ExtArgs> | null;
    where?: Prisma.RiskCauseWhereInput;
    orderBy?: Prisma.RiskCauseOrderByWithRelationInput | Prisma.RiskCauseOrderByWithRelationInput[];
    cursor?: Prisma.RiskCauseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RiskCauseScalarFieldEnum | Prisma.RiskCauseScalarFieldEnum[];
};
export type RiskCauseFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.RiskCauseOmit<ExtArgs> | null;
    include?: Prisma.RiskCauseInclude<ExtArgs> | null;
    where?: Prisma.RiskCauseWhereInput;
    orderBy?: Prisma.RiskCauseOrderByWithRelationInput | Prisma.RiskCauseOrderByWithRelationInput[];
    cursor?: Prisma.RiskCauseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RiskCauseScalarFieldEnum | Prisma.RiskCauseScalarFieldEnum[];
};
export type RiskCauseCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.RiskCauseOmit<ExtArgs> | null;
    include?: Prisma.RiskCauseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RiskCauseCreateInput, Prisma.RiskCauseUncheckedCreateInput>;
};
export type RiskCauseCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.RiskCauseCreateManyInput | Prisma.RiskCauseCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RiskCauseCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskCauseSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RiskCauseOmit<ExtArgs> | null;
    data: Prisma.RiskCauseCreateManyInput | Prisma.RiskCauseCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.RiskCauseIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type RiskCauseUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.RiskCauseOmit<ExtArgs> | null;
    include?: Prisma.RiskCauseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RiskCauseUpdateInput, Prisma.RiskCauseUncheckedUpdateInput>;
    where: Prisma.RiskCauseWhereUniqueInput;
};
export type RiskCauseUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.RiskCauseUpdateManyMutationInput, Prisma.RiskCauseUncheckedUpdateManyInput>;
    where?: Prisma.RiskCauseWhereInput;
    limit?: number;
};
export type RiskCauseUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskCauseSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RiskCauseOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RiskCauseUpdateManyMutationInput, Prisma.RiskCauseUncheckedUpdateManyInput>;
    where?: Prisma.RiskCauseWhereInput;
    limit?: number;
    include?: Prisma.RiskCauseIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type RiskCauseUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.RiskCauseOmit<ExtArgs> | null;
    include?: Prisma.RiskCauseInclude<ExtArgs> | null;
    where: Prisma.RiskCauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.RiskCauseCreateInput, Prisma.RiskCauseUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.RiskCauseUpdateInput, Prisma.RiskCauseUncheckedUpdateInput>;
};
export type RiskCauseDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.RiskCauseOmit<ExtArgs> | null;
    include?: Prisma.RiskCauseInclude<ExtArgs> | null;
    where: Prisma.RiskCauseWhereUniqueInput;
};
export type RiskCauseDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RiskCauseWhereInput;
    limit?: number;
};
export type RiskCauseDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.RiskCauseOmit<ExtArgs> | null;
    include?: Prisma.RiskCauseInclude<ExtArgs> | null;
};
export {};
