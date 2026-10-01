import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CauseModel = runtime.Types.Result.DefaultSelection<Prisma.$CausePayload>;
export type AggregateCause = {
    _count: CauseCountAggregateOutputType | null;
    _min: CauseMinAggregateOutputType | null;
    _max: CauseMaxAggregateOutputType | null;
};
export type CauseMinAggregateOutputType = {
    id: string | null;
    code: string | null;
    name: string | null;
    failureCategory: $Enums.FailureCategory | null;
    description: string | null;
};
export type CauseMaxAggregateOutputType = {
    id: string | null;
    code: string | null;
    name: string | null;
    failureCategory: $Enums.FailureCategory | null;
    description: string | null;
};
export type CauseCountAggregateOutputType = {
    id: number;
    code: number;
    name: number;
    failureCategory: number;
    description: number;
    _all: number;
};
export type CauseMinAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    failureCategory?: true;
    description?: true;
};
export type CauseMaxAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    failureCategory?: true;
    description?: true;
};
export type CauseCountAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    failureCategory?: true;
    description?: true;
    _all?: true;
};
export type CauseAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CauseWhereInput;
    orderBy?: Prisma.CauseOrderByWithRelationInput | Prisma.CauseOrderByWithRelationInput[];
    cursor?: Prisma.CauseWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CauseCountAggregateInputType;
    _min?: CauseMinAggregateInputType;
    _max?: CauseMaxAggregateInputType;
};
export type GetCauseAggregateType<T extends CauseAggregateArgs> = {
    [P in keyof T & keyof AggregateCause]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCause[P]> : Prisma.GetScalarType<T[P], AggregateCause[P]>;
};
export type CauseGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CauseWhereInput;
    orderBy?: Prisma.CauseOrderByWithAggregationInput | Prisma.CauseOrderByWithAggregationInput[];
    by: Prisma.CauseScalarFieldEnum[] | Prisma.CauseScalarFieldEnum;
    having?: Prisma.CauseScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CauseCountAggregateInputType | true;
    _min?: CauseMinAggregateInputType;
    _max?: CauseMaxAggregateInputType;
};
export type CauseGroupByOutputType = {
    id: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    _count: CauseCountAggregateOutputType | null;
    _min: CauseMinAggregateOutputType | null;
    _max: CauseMaxAggregateOutputType | null;
};
type GetCauseGroupByPayload<T extends CauseGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CauseGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CauseGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CauseGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CauseGroupByOutputType[P]>;
}>>;
export type CauseWhereInput = {
    AND?: Prisma.CauseWhereInput | Prisma.CauseWhereInput[];
    OR?: Prisma.CauseWhereInput[];
    NOT?: Prisma.CauseWhereInput | Prisma.CauseWhereInput[];
    id?: Prisma.UuidFilter<"Cause"> | string;
    code?: Prisma.StringFilter<"Cause"> | string;
    name?: Prisma.StringFilter<"Cause"> | string;
    failureCategory?: Prisma.EnumFailureCategoryFilter<"Cause"> | $Enums.FailureCategory;
    description?: Prisma.StringFilter<"Cause"> | string;
    riskCauses?: Prisma.RiskCauseListRelationFilter;
    causeControls?: Prisma.CauseControlListRelationFilter;
    clientCauses?: Prisma.ClientCauseListRelationFilter;
};
export type CauseOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    failureCategory?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    riskCauses?: Prisma.RiskCauseOrderByRelationAggregateInput;
    causeControls?: Prisma.CauseControlOrderByRelationAggregateInput;
    clientCauses?: Prisma.ClientCauseOrderByRelationAggregateInput;
};
export type CauseWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    code?: string;
    AND?: Prisma.CauseWhereInput | Prisma.CauseWhereInput[];
    OR?: Prisma.CauseWhereInput[];
    NOT?: Prisma.CauseWhereInput | Prisma.CauseWhereInput[];
    name?: Prisma.StringFilter<"Cause"> | string;
    failureCategory?: Prisma.EnumFailureCategoryFilter<"Cause"> | $Enums.FailureCategory;
    description?: Prisma.StringFilter<"Cause"> | string;
    riskCauses?: Prisma.RiskCauseListRelationFilter;
    causeControls?: Prisma.CauseControlListRelationFilter;
    clientCauses?: Prisma.ClientCauseListRelationFilter;
}, "id" | "code">;
export type CauseOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    failureCategory?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    _count?: Prisma.CauseCountOrderByAggregateInput;
    _max?: Prisma.CauseMaxOrderByAggregateInput;
    _min?: Prisma.CauseMinOrderByAggregateInput;
};
export type CauseScalarWhereWithAggregatesInput = {
    AND?: Prisma.CauseScalarWhereWithAggregatesInput | Prisma.CauseScalarWhereWithAggregatesInput[];
    OR?: Prisma.CauseScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CauseScalarWhereWithAggregatesInput | Prisma.CauseScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Cause"> | string;
    code?: Prisma.StringWithAggregatesFilter<"Cause"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Cause"> | string;
    failureCategory?: Prisma.EnumFailureCategoryWithAggregatesFilter<"Cause"> | $Enums.FailureCategory;
    description?: Prisma.StringWithAggregatesFilter<"Cause"> | string;
};
export type CauseCreateInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    riskCauses?: Prisma.RiskCauseCreateNestedManyWithoutCauseInput;
    causeControls?: Prisma.CauseControlCreateNestedManyWithoutCauseInput;
    clientCauses?: Prisma.ClientCauseCreateNestedManyWithoutCauseInput;
};
export type CauseUncheckedCreateInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    riskCauses?: Prisma.RiskCauseUncheckedCreateNestedManyWithoutCauseInput;
    causeControls?: Prisma.CauseControlUncheckedCreateNestedManyWithoutCauseInput;
    clientCauses?: Prisma.ClientCauseUncheckedCreateNestedManyWithoutCauseInput;
};
export type CauseUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    riskCauses?: Prisma.RiskCauseUpdateManyWithoutCauseNestedInput;
    causeControls?: Prisma.CauseControlUpdateManyWithoutCauseNestedInput;
    clientCauses?: Prisma.ClientCauseUpdateManyWithoutCauseNestedInput;
};
export type CauseUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    riskCauses?: Prisma.RiskCauseUncheckedUpdateManyWithoutCauseNestedInput;
    causeControls?: Prisma.CauseControlUncheckedUpdateManyWithoutCauseNestedInput;
    clientCauses?: Prisma.ClientCauseUncheckedUpdateManyWithoutCauseNestedInput;
};
export type CauseCreateManyInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
};
export type CauseUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CauseUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CauseCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    failureCategory?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
};
export type CauseMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    failureCategory?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
};
export type CauseMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    failureCategory?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
};
export type CauseScalarRelationFilter = {
    is?: Prisma.CauseWhereInput;
    isNot?: Prisma.CauseWhereInput;
};
export type CauseNullableScalarRelationFilter = {
    is?: Prisma.CauseWhereInput | null;
    isNot?: Prisma.CauseWhereInput | null;
};
export type EnumFailureCategoryFieldUpdateOperationsInput = {
    set?: $Enums.FailureCategory;
};
export type CauseCreateNestedOneWithoutRiskCausesInput = {
    create?: Prisma.XOR<Prisma.CauseCreateWithoutRiskCausesInput, Prisma.CauseUncheckedCreateWithoutRiskCausesInput>;
    connectOrCreate?: Prisma.CauseCreateOrConnectWithoutRiskCausesInput;
    connect?: Prisma.CauseWhereUniqueInput;
};
export type CauseUpdateOneRequiredWithoutRiskCausesNestedInput = {
    create?: Prisma.XOR<Prisma.CauseCreateWithoutRiskCausesInput, Prisma.CauseUncheckedCreateWithoutRiskCausesInput>;
    connectOrCreate?: Prisma.CauseCreateOrConnectWithoutRiskCausesInput;
    upsert?: Prisma.CauseUpsertWithoutRiskCausesInput;
    connect?: Prisma.CauseWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CauseUpdateToOneWithWhereWithoutRiskCausesInput, Prisma.CauseUpdateWithoutRiskCausesInput>, Prisma.CauseUncheckedUpdateWithoutRiskCausesInput>;
};
export type CauseCreateNestedOneWithoutCauseControlsInput = {
    create?: Prisma.XOR<Prisma.CauseCreateWithoutCauseControlsInput, Prisma.CauseUncheckedCreateWithoutCauseControlsInput>;
    connectOrCreate?: Prisma.CauseCreateOrConnectWithoutCauseControlsInput;
    connect?: Prisma.CauseWhereUniqueInput;
};
export type CauseUpdateOneRequiredWithoutCauseControlsNestedInput = {
    create?: Prisma.XOR<Prisma.CauseCreateWithoutCauseControlsInput, Prisma.CauseUncheckedCreateWithoutCauseControlsInput>;
    connectOrCreate?: Prisma.CauseCreateOrConnectWithoutCauseControlsInput;
    upsert?: Prisma.CauseUpsertWithoutCauseControlsInput;
    connect?: Prisma.CauseWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CauseUpdateToOneWithWhereWithoutCauseControlsInput, Prisma.CauseUpdateWithoutCauseControlsInput>, Prisma.CauseUncheckedUpdateWithoutCauseControlsInput>;
};
export type CauseCreateNestedOneWithoutClientCausesInput = {
    create?: Prisma.XOR<Prisma.CauseCreateWithoutClientCausesInput, Prisma.CauseUncheckedCreateWithoutClientCausesInput>;
    connectOrCreate?: Prisma.CauseCreateOrConnectWithoutClientCausesInput;
    connect?: Prisma.CauseWhereUniqueInput;
};
export type CauseUpdateOneWithoutClientCausesNestedInput = {
    create?: Prisma.XOR<Prisma.CauseCreateWithoutClientCausesInput, Prisma.CauseUncheckedCreateWithoutClientCausesInput>;
    connectOrCreate?: Prisma.CauseCreateOrConnectWithoutClientCausesInput;
    upsert?: Prisma.CauseUpsertWithoutClientCausesInput;
    disconnect?: Prisma.CauseWhereInput | boolean;
    delete?: Prisma.CauseWhereInput | boolean;
    connect?: Prisma.CauseWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CauseUpdateToOneWithWhereWithoutClientCausesInput, Prisma.CauseUpdateWithoutClientCausesInput>, Prisma.CauseUncheckedUpdateWithoutClientCausesInput>;
};
export type CauseCreateWithoutRiskCausesInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    causeControls?: Prisma.CauseControlCreateNestedManyWithoutCauseInput;
    clientCauses?: Prisma.ClientCauseCreateNestedManyWithoutCauseInput;
};
export type CauseUncheckedCreateWithoutRiskCausesInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    causeControls?: Prisma.CauseControlUncheckedCreateNestedManyWithoutCauseInput;
    clientCauses?: Prisma.ClientCauseUncheckedCreateNestedManyWithoutCauseInput;
};
export type CauseCreateOrConnectWithoutRiskCausesInput = {
    where: Prisma.CauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.CauseCreateWithoutRiskCausesInput, Prisma.CauseUncheckedCreateWithoutRiskCausesInput>;
};
export type CauseUpsertWithoutRiskCausesInput = {
    update: Prisma.XOR<Prisma.CauseUpdateWithoutRiskCausesInput, Prisma.CauseUncheckedUpdateWithoutRiskCausesInput>;
    create: Prisma.XOR<Prisma.CauseCreateWithoutRiskCausesInput, Prisma.CauseUncheckedCreateWithoutRiskCausesInput>;
    where?: Prisma.CauseWhereInput;
};
export type CauseUpdateToOneWithWhereWithoutRiskCausesInput = {
    where?: Prisma.CauseWhereInput;
    data: Prisma.XOR<Prisma.CauseUpdateWithoutRiskCausesInput, Prisma.CauseUncheckedUpdateWithoutRiskCausesInput>;
};
export type CauseUpdateWithoutRiskCausesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    causeControls?: Prisma.CauseControlUpdateManyWithoutCauseNestedInput;
    clientCauses?: Prisma.ClientCauseUpdateManyWithoutCauseNestedInput;
};
export type CauseUncheckedUpdateWithoutRiskCausesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    causeControls?: Prisma.CauseControlUncheckedUpdateManyWithoutCauseNestedInput;
    clientCauses?: Prisma.ClientCauseUncheckedUpdateManyWithoutCauseNestedInput;
};
export type CauseCreateWithoutCauseControlsInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    riskCauses?: Prisma.RiskCauseCreateNestedManyWithoutCauseInput;
    clientCauses?: Prisma.ClientCauseCreateNestedManyWithoutCauseInput;
};
export type CauseUncheckedCreateWithoutCauseControlsInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    riskCauses?: Prisma.RiskCauseUncheckedCreateNestedManyWithoutCauseInput;
    clientCauses?: Prisma.ClientCauseUncheckedCreateNestedManyWithoutCauseInput;
};
export type CauseCreateOrConnectWithoutCauseControlsInput = {
    where: Prisma.CauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.CauseCreateWithoutCauseControlsInput, Prisma.CauseUncheckedCreateWithoutCauseControlsInput>;
};
export type CauseUpsertWithoutCauseControlsInput = {
    update: Prisma.XOR<Prisma.CauseUpdateWithoutCauseControlsInput, Prisma.CauseUncheckedUpdateWithoutCauseControlsInput>;
    create: Prisma.XOR<Prisma.CauseCreateWithoutCauseControlsInput, Prisma.CauseUncheckedCreateWithoutCauseControlsInput>;
    where?: Prisma.CauseWhereInput;
};
export type CauseUpdateToOneWithWhereWithoutCauseControlsInput = {
    where?: Prisma.CauseWhereInput;
    data: Prisma.XOR<Prisma.CauseUpdateWithoutCauseControlsInput, Prisma.CauseUncheckedUpdateWithoutCauseControlsInput>;
};
export type CauseUpdateWithoutCauseControlsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    riskCauses?: Prisma.RiskCauseUpdateManyWithoutCauseNestedInput;
    clientCauses?: Prisma.ClientCauseUpdateManyWithoutCauseNestedInput;
};
export type CauseUncheckedUpdateWithoutCauseControlsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    riskCauses?: Prisma.RiskCauseUncheckedUpdateManyWithoutCauseNestedInput;
    clientCauses?: Prisma.ClientCauseUncheckedUpdateManyWithoutCauseNestedInput;
};
export type CauseCreateWithoutClientCausesInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    riskCauses?: Prisma.RiskCauseCreateNestedManyWithoutCauseInput;
    causeControls?: Prisma.CauseControlCreateNestedManyWithoutCauseInput;
};
export type CauseUncheckedCreateWithoutClientCausesInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    riskCauses?: Prisma.RiskCauseUncheckedCreateNestedManyWithoutCauseInput;
    causeControls?: Prisma.CauseControlUncheckedCreateNestedManyWithoutCauseInput;
};
export type CauseCreateOrConnectWithoutClientCausesInput = {
    where: Prisma.CauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.CauseCreateWithoutClientCausesInput, Prisma.CauseUncheckedCreateWithoutClientCausesInput>;
};
export type CauseUpsertWithoutClientCausesInput = {
    update: Prisma.XOR<Prisma.CauseUpdateWithoutClientCausesInput, Prisma.CauseUncheckedUpdateWithoutClientCausesInput>;
    create: Prisma.XOR<Prisma.CauseCreateWithoutClientCausesInput, Prisma.CauseUncheckedCreateWithoutClientCausesInput>;
    where?: Prisma.CauseWhereInput;
};
export type CauseUpdateToOneWithWhereWithoutClientCausesInput = {
    where?: Prisma.CauseWhereInput;
    data: Prisma.XOR<Prisma.CauseUpdateWithoutClientCausesInput, Prisma.CauseUncheckedUpdateWithoutClientCausesInput>;
};
export type CauseUpdateWithoutClientCausesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    riskCauses?: Prisma.RiskCauseUpdateManyWithoutCauseNestedInput;
    causeControls?: Prisma.CauseControlUpdateManyWithoutCauseNestedInput;
};
export type CauseUncheckedUpdateWithoutClientCausesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    riskCauses?: Prisma.RiskCauseUncheckedUpdateManyWithoutCauseNestedInput;
    causeControls?: Prisma.CauseControlUncheckedUpdateManyWithoutCauseNestedInput;
};
export type CauseCountOutputType = {
    riskCauses: number;
    causeControls: number;
    clientCauses: number;
};
export type CauseCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    riskCauses?: boolean | CauseCountOutputTypeCountRiskCausesArgs;
    causeControls?: boolean | CauseCountOutputTypeCountCauseControlsArgs;
    clientCauses?: boolean | CauseCountOutputTypeCountClientCausesArgs;
};
export type CauseCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseCountOutputTypeSelect<ExtArgs> | null;
};
export type CauseCountOutputTypeCountRiskCausesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RiskCauseWhereInput;
};
export type CauseCountOutputTypeCountCauseControlsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CauseControlWhereInput;
};
export type CauseCountOutputTypeCountClientCausesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientCauseWhereInput;
};
export type CauseSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    failureCategory?: boolean;
    description?: boolean;
    riskCauses?: boolean | Prisma.Cause$riskCausesArgs<ExtArgs>;
    causeControls?: boolean | Prisma.Cause$causeControlsArgs<ExtArgs>;
    clientCauses?: boolean | Prisma.Cause$clientCausesArgs<ExtArgs>;
    _count?: boolean | Prisma.CauseCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["cause"]>;
export type CauseSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    failureCategory?: boolean;
    description?: boolean;
}, ExtArgs["result"]["cause"]>;
export type CauseSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    failureCategory?: boolean;
    description?: boolean;
}, ExtArgs["result"]["cause"]>;
export type CauseSelectScalar = {
    id?: boolean;
    code?: boolean;
    name?: boolean;
    failureCategory?: boolean;
    description?: boolean;
};
export type CauseOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "code" | "name" | "failureCategory" | "description", ExtArgs["result"]["cause"]>;
export type CauseInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    riskCauses?: boolean | Prisma.Cause$riskCausesArgs<ExtArgs>;
    causeControls?: boolean | Prisma.Cause$causeControlsArgs<ExtArgs>;
    clientCauses?: boolean | Prisma.Cause$clientCausesArgs<ExtArgs>;
    _count?: boolean | Prisma.CauseCountOutputTypeDefaultArgs<ExtArgs>;
};
export type CauseIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type CauseIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $CausePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Cause";
    objects: {
        riskCauses: Prisma.$RiskCausePayload<ExtArgs>[];
        causeControls: Prisma.$CauseControlPayload<ExtArgs>[];
        clientCauses: Prisma.$ClientCausePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        code: string;
        name: string;
        failureCategory: $Enums.FailureCategory;
        description: string;
    }, ExtArgs["result"]["cause"]>;
    composites: {};
};
export type CauseGetPayload<S extends boolean | null | undefined | CauseDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CausePayload, S>;
export type CauseCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CauseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CauseCountAggregateInputType | true;
};
export interface CauseDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Cause'];
        meta: {
            name: 'Cause';
        };
    };
    findUnique<T extends CauseFindUniqueArgs>(args: Prisma.SelectSubset<T, CauseFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CauseClient<runtime.Types.Result.GetResult<Prisma.$CausePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CauseFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CauseFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CauseClient<runtime.Types.Result.GetResult<Prisma.$CausePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CauseFindFirstArgs>(args?: Prisma.SelectSubset<T, CauseFindFirstArgs<ExtArgs>>): Prisma.Prisma__CauseClient<runtime.Types.Result.GetResult<Prisma.$CausePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CauseFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CauseFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CauseClient<runtime.Types.Result.GetResult<Prisma.$CausePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CauseFindManyArgs>(args?: Prisma.SelectSubset<T, CauseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CausePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CauseCreateArgs>(args: Prisma.SelectSubset<T, CauseCreateArgs<ExtArgs>>): Prisma.Prisma__CauseClient<runtime.Types.Result.GetResult<Prisma.$CausePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CauseCreateManyArgs>(args?: Prisma.SelectSubset<T, CauseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends CauseCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CauseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CausePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends CauseDeleteArgs>(args: Prisma.SelectSubset<T, CauseDeleteArgs<ExtArgs>>): Prisma.Prisma__CauseClient<runtime.Types.Result.GetResult<Prisma.$CausePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CauseUpdateArgs>(args: Prisma.SelectSubset<T, CauseUpdateArgs<ExtArgs>>): Prisma.Prisma__CauseClient<runtime.Types.Result.GetResult<Prisma.$CausePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CauseDeleteManyArgs>(args?: Prisma.SelectSubset<T, CauseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CauseUpdateManyArgs>(args: Prisma.SelectSubset<T, CauseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends CauseUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CauseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CausePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends CauseUpsertArgs>(args: Prisma.SelectSubset<T, CauseUpsertArgs<ExtArgs>>): Prisma.Prisma__CauseClient<runtime.Types.Result.GetResult<Prisma.$CausePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CauseCountArgs>(args?: Prisma.Subset<T, CauseCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CauseCountAggregateOutputType> : number>;
    aggregate<T extends CauseAggregateArgs>(args: Prisma.Subset<T, CauseAggregateArgs>): Prisma.PrismaPromise<GetCauseAggregateType<T>>;
    groupBy<T extends CauseGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CauseGroupByArgs['orderBy'];
    } : {
        orderBy?: CauseGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CauseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCauseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CauseFieldRefs;
}
export interface Prisma__CauseClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    riskCauses<T extends Prisma.Cause$riskCausesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Cause$riskCausesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RiskCausePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    causeControls<T extends Prisma.Cause$causeControlsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Cause$causeControlsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CauseControlPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    clientCauses<T extends Prisma.Cause$clientCausesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Cause$clientCausesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CauseFieldRefs {
    readonly id: Prisma.FieldRef<"Cause", 'String'>;
    readonly code: Prisma.FieldRef<"Cause", 'String'>;
    readonly name: Prisma.FieldRef<"Cause", 'String'>;
    readonly failureCategory: Prisma.FieldRef<"Cause", 'FailureCategory'>;
    readonly description: Prisma.FieldRef<"Cause", 'String'>;
}
export type CauseFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseSelect<ExtArgs> | null;
    omit?: Prisma.CauseOmit<ExtArgs> | null;
    include?: Prisma.CauseInclude<ExtArgs> | null;
    where: Prisma.CauseWhereUniqueInput;
};
export type CauseFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseSelect<ExtArgs> | null;
    omit?: Prisma.CauseOmit<ExtArgs> | null;
    include?: Prisma.CauseInclude<ExtArgs> | null;
    where: Prisma.CauseWhereUniqueInput;
};
export type CauseFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseSelect<ExtArgs> | null;
    omit?: Prisma.CauseOmit<ExtArgs> | null;
    include?: Prisma.CauseInclude<ExtArgs> | null;
    where?: Prisma.CauseWhereInput;
    orderBy?: Prisma.CauseOrderByWithRelationInput | Prisma.CauseOrderByWithRelationInput[];
    cursor?: Prisma.CauseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CauseScalarFieldEnum | Prisma.CauseScalarFieldEnum[];
};
export type CauseFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseSelect<ExtArgs> | null;
    omit?: Prisma.CauseOmit<ExtArgs> | null;
    include?: Prisma.CauseInclude<ExtArgs> | null;
    where?: Prisma.CauseWhereInput;
    orderBy?: Prisma.CauseOrderByWithRelationInput | Prisma.CauseOrderByWithRelationInput[];
    cursor?: Prisma.CauseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CauseScalarFieldEnum | Prisma.CauseScalarFieldEnum[];
};
export type CauseFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseSelect<ExtArgs> | null;
    omit?: Prisma.CauseOmit<ExtArgs> | null;
    include?: Prisma.CauseInclude<ExtArgs> | null;
    where?: Prisma.CauseWhereInput;
    orderBy?: Prisma.CauseOrderByWithRelationInput | Prisma.CauseOrderByWithRelationInput[];
    cursor?: Prisma.CauseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CauseScalarFieldEnum | Prisma.CauseScalarFieldEnum[];
};
export type CauseCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseSelect<ExtArgs> | null;
    omit?: Prisma.CauseOmit<ExtArgs> | null;
    include?: Prisma.CauseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CauseCreateInput, Prisma.CauseUncheckedCreateInput>;
};
export type CauseCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CauseCreateManyInput | Prisma.CauseCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CauseCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CauseOmit<ExtArgs> | null;
    data: Prisma.CauseCreateManyInput | Prisma.CauseCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CauseUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseSelect<ExtArgs> | null;
    omit?: Prisma.CauseOmit<ExtArgs> | null;
    include?: Prisma.CauseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CauseUpdateInput, Prisma.CauseUncheckedUpdateInput>;
    where: Prisma.CauseWhereUniqueInput;
};
export type CauseUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CauseUpdateManyMutationInput, Prisma.CauseUncheckedUpdateManyInput>;
    where?: Prisma.CauseWhereInput;
    limit?: number;
};
export type CauseUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CauseOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CauseUpdateManyMutationInput, Prisma.CauseUncheckedUpdateManyInput>;
    where?: Prisma.CauseWhereInput;
    limit?: number;
};
export type CauseUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseSelect<ExtArgs> | null;
    omit?: Prisma.CauseOmit<ExtArgs> | null;
    include?: Prisma.CauseInclude<ExtArgs> | null;
    where: Prisma.CauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.CauseCreateInput, Prisma.CauseUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CauseUpdateInput, Prisma.CauseUncheckedUpdateInput>;
};
export type CauseDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseSelect<ExtArgs> | null;
    omit?: Prisma.CauseOmit<ExtArgs> | null;
    include?: Prisma.CauseInclude<ExtArgs> | null;
    where: Prisma.CauseWhereUniqueInput;
};
export type CauseDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CauseWhereInput;
    limit?: number;
};
export type Cause$riskCausesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Cause$causeControlsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Cause$clientCausesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseInclude<ExtArgs> | null;
    where?: Prisma.ClientCauseWhereInput;
    orderBy?: Prisma.ClientCauseOrderByWithRelationInput | Prisma.ClientCauseOrderByWithRelationInput[];
    cursor?: Prisma.ClientCauseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientCauseScalarFieldEnum | Prisma.ClientCauseScalarFieldEnum[];
};
export type CauseDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseSelect<ExtArgs> | null;
    omit?: Prisma.CauseOmit<ExtArgs> | null;
    include?: Prisma.CauseInclude<ExtArgs> | null;
};
export {};
