import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type RiskModel = runtime.Types.Result.DefaultSelection<Prisma.$RiskPayload>;
export type AggregateRisk = {
    _count: RiskCountAggregateOutputType | null;
    _avg: RiskAvgAggregateOutputType | null;
    _sum: RiskSumAggregateOutputType | null;
    _min: RiskMinAggregateOutputType | null;
    _max: RiskMaxAggregateOutputType | null;
};
export type RiskAvgAggregateOutputType = {
    likelihood: number | null;
    impact: number | null;
    inherentRiskValue: number | null;
};
export type RiskSumAggregateOutputType = {
    likelihood: number | null;
    impact: number | null;
    inherentRiskValue: number | null;
};
export type RiskMinAggregateOutputType = {
    id: string | null;
    code: string | null;
    name: string | null;
    description: string | null;
    trustCriterion: $Enums.RiskCriterion | null;
    likelihood: number | null;
    impact: number | null;
    inherentRiskValue: number | null;
    inherentRiskLevel: $Enums.RiskLevel | null;
    isActive: boolean | null;
};
export type RiskMaxAggregateOutputType = {
    id: string | null;
    code: string | null;
    name: string | null;
    description: string | null;
    trustCriterion: $Enums.RiskCriterion | null;
    likelihood: number | null;
    impact: number | null;
    inherentRiskValue: number | null;
    inherentRiskLevel: $Enums.RiskLevel | null;
    isActive: boolean | null;
};
export type RiskCountAggregateOutputType = {
    id: number;
    code: number;
    name: number;
    description: number;
    trustCriterion: number;
    potentialImpact: number;
    likelihood: number;
    impact: number;
    inherentRiskValue: number;
    inherentRiskLevel: number;
    isActive: number;
    _all: number;
};
export type RiskAvgAggregateInputType = {
    likelihood?: true;
    impact?: true;
    inherentRiskValue?: true;
};
export type RiskSumAggregateInputType = {
    likelihood?: true;
    impact?: true;
    inherentRiskValue?: true;
};
export type RiskMinAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    description?: true;
    trustCriterion?: true;
    likelihood?: true;
    impact?: true;
    inherentRiskValue?: true;
    inherentRiskLevel?: true;
    isActive?: true;
};
export type RiskMaxAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    description?: true;
    trustCriterion?: true;
    likelihood?: true;
    impact?: true;
    inherentRiskValue?: true;
    inherentRiskLevel?: true;
    isActive?: true;
};
export type RiskCountAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    description?: true;
    trustCriterion?: true;
    potentialImpact?: true;
    likelihood?: true;
    impact?: true;
    inherentRiskValue?: true;
    inherentRiskLevel?: true;
    isActive?: true;
    _all?: true;
};
export type RiskAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RiskWhereInput;
    orderBy?: Prisma.RiskOrderByWithRelationInput | Prisma.RiskOrderByWithRelationInput[];
    cursor?: Prisma.RiskWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | RiskCountAggregateInputType;
    _avg?: RiskAvgAggregateInputType;
    _sum?: RiskSumAggregateInputType;
    _min?: RiskMinAggregateInputType;
    _max?: RiskMaxAggregateInputType;
};
export type GetRiskAggregateType<T extends RiskAggregateArgs> = {
    [P in keyof T & keyof AggregateRisk]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRisk[P]> : Prisma.GetScalarType<T[P], AggregateRisk[P]>;
};
export type RiskGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RiskWhereInput;
    orderBy?: Prisma.RiskOrderByWithAggregationInput | Prisma.RiskOrderByWithAggregationInput[];
    by: Prisma.RiskScalarFieldEnum[] | Prisma.RiskScalarFieldEnum;
    having?: Prisma.RiskScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RiskCountAggregateInputType | true;
    _avg?: RiskAvgAggregateInputType;
    _sum?: RiskSumAggregateInputType;
    _min?: RiskMinAggregateInputType;
    _max?: RiskMaxAggregateInputType;
};
export type RiskGroupByOutputType = {
    id: string;
    code: string;
    name: string;
    description: string;
    trustCriterion: $Enums.RiskCriterion;
    potentialImpact: runtime.JsonValue;
    likelihood: number | null;
    impact: number | null;
    inherentRiskValue: number | null;
    inherentRiskLevel: $Enums.RiskLevel | null;
    isActive: boolean;
    _count: RiskCountAggregateOutputType | null;
    _avg: RiskAvgAggregateOutputType | null;
    _sum: RiskSumAggregateOutputType | null;
    _min: RiskMinAggregateOutputType | null;
    _max: RiskMaxAggregateOutputType | null;
};
type GetRiskGroupByPayload<T extends RiskGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RiskGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RiskGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RiskGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RiskGroupByOutputType[P]>;
}>>;
export type RiskWhereInput = {
    AND?: Prisma.RiskWhereInput | Prisma.RiskWhereInput[];
    OR?: Prisma.RiskWhereInput[];
    NOT?: Prisma.RiskWhereInput | Prisma.RiskWhereInput[];
    id?: Prisma.UuidFilter<"Risk"> | string;
    code?: Prisma.StringFilter<"Risk"> | string;
    name?: Prisma.StringFilter<"Risk"> | string;
    description?: Prisma.StringFilter<"Risk"> | string;
    trustCriterion?: Prisma.EnumRiskCriterionFilter<"Risk"> | $Enums.RiskCriterion;
    potentialImpact?: Prisma.JsonFilter<"Risk">;
    likelihood?: Prisma.IntNullableFilter<"Risk"> | number | null;
    impact?: Prisma.IntNullableFilter<"Risk"> | number | null;
    inherentRiskValue?: Prisma.IntNullableFilter<"Risk"> | number | null;
    inherentRiskLevel?: Prisma.EnumRiskLevelNullableFilter<"Risk"> | $Enums.RiskLevel | null;
    isActive?: Prisma.BoolFilter<"Risk"> | boolean;
    riskCauses?: Prisma.RiskCauseListRelationFilter;
    clientRisks?: Prisma.ClientRiskListRelationFilter;
};
export type RiskOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    trustCriterion?: Prisma.SortOrder;
    potentialImpact?: Prisma.SortOrder;
    likelihood?: Prisma.SortOrderInput | Prisma.SortOrder;
    impact?: Prisma.SortOrderInput | Prisma.SortOrder;
    inherentRiskValue?: Prisma.SortOrderInput | Prisma.SortOrder;
    inherentRiskLevel?: Prisma.SortOrderInput | Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    riskCauses?: Prisma.RiskCauseOrderByRelationAggregateInput;
    clientRisks?: Prisma.ClientRiskOrderByRelationAggregateInput;
};
export type RiskWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    code?: string;
    AND?: Prisma.RiskWhereInput | Prisma.RiskWhereInput[];
    OR?: Prisma.RiskWhereInput[];
    NOT?: Prisma.RiskWhereInput | Prisma.RiskWhereInput[];
    name?: Prisma.StringFilter<"Risk"> | string;
    description?: Prisma.StringFilter<"Risk"> | string;
    trustCriterion?: Prisma.EnumRiskCriterionFilter<"Risk"> | $Enums.RiskCriterion;
    potentialImpact?: Prisma.JsonFilter<"Risk">;
    likelihood?: Prisma.IntNullableFilter<"Risk"> | number | null;
    impact?: Prisma.IntNullableFilter<"Risk"> | number | null;
    inherentRiskValue?: Prisma.IntNullableFilter<"Risk"> | number | null;
    inherentRiskLevel?: Prisma.EnumRiskLevelNullableFilter<"Risk"> | $Enums.RiskLevel | null;
    isActive?: Prisma.BoolFilter<"Risk"> | boolean;
    riskCauses?: Prisma.RiskCauseListRelationFilter;
    clientRisks?: Prisma.ClientRiskListRelationFilter;
}, "id" | "code">;
export type RiskOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    trustCriterion?: Prisma.SortOrder;
    potentialImpact?: Prisma.SortOrder;
    likelihood?: Prisma.SortOrderInput | Prisma.SortOrder;
    impact?: Prisma.SortOrderInput | Prisma.SortOrder;
    inherentRiskValue?: Prisma.SortOrderInput | Prisma.SortOrder;
    inherentRiskLevel?: Prisma.SortOrderInput | Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    _count?: Prisma.RiskCountOrderByAggregateInput;
    _avg?: Prisma.RiskAvgOrderByAggregateInput;
    _max?: Prisma.RiskMaxOrderByAggregateInput;
    _min?: Prisma.RiskMinOrderByAggregateInput;
    _sum?: Prisma.RiskSumOrderByAggregateInput;
};
export type RiskScalarWhereWithAggregatesInput = {
    AND?: Prisma.RiskScalarWhereWithAggregatesInput | Prisma.RiskScalarWhereWithAggregatesInput[];
    OR?: Prisma.RiskScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RiskScalarWhereWithAggregatesInput | Prisma.RiskScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Risk"> | string;
    code?: Prisma.StringWithAggregatesFilter<"Risk"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Risk"> | string;
    description?: Prisma.StringWithAggregatesFilter<"Risk"> | string;
    trustCriterion?: Prisma.EnumRiskCriterionWithAggregatesFilter<"Risk"> | $Enums.RiskCriterion;
    potentialImpact?: Prisma.JsonWithAggregatesFilter<"Risk">;
    likelihood?: Prisma.IntNullableWithAggregatesFilter<"Risk"> | number | null;
    impact?: Prisma.IntNullableWithAggregatesFilter<"Risk"> | number | null;
    inherentRiskValue?: Prisma.IntNullableWithAggregatesFilter<"Risk"> | number | null;
    inherentRiskLevel?: Prisma.EnumRiskLevelNullableWithAggregatesFilter<"Risk"> | $Enums.RiskLevel | null;
    isActive?: Prisma.BoolWithAggregatesFilter<"Risk"> | boolean;
};
export type RiskCreateInput = {
    id?: string;
    code: string;
    name: string;
    description: string;
    trustCriterion: $Enums.RiskCriterion;
    potentialImpact: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: number | null;
    impact?: number | null;
    inherentRiskValue?: number | null;
    inherentRiskLevel?: $Enums.RiskLevel | null;
    isActive?: boolean;
    riskCauses?: Prisma.RiskCauseCreateNestedManyWithoutRiskInput;
    clientRisks?: Prisma.ClientRiskCreateNestedManyWithoutRiskInput;
};
export type RiskUncheckedCreateInput = {
    id?: string;
    code: string;
    name: string;
    description: string;
    trustCriterion: $Enums.RiskCriterion;
    potentialImpact: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: number | null;
    impact?: number | null;
    inherentRiskValue?: number | null;
    inherentRiskLevel?: $Enums.RiskLevel | null;
    isActive?: boolean;
    riskCauses?: Prisma.RiskCauseUncheckedCreateNestedManyWithoutRiskInput;
    clientRisks?: Prisma.ClientRiskUncheckedCreateNestedManyWithoutRiskInput;
};
export type RiskUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterion?: Prisma.EnumRiskCriterionFieldUpdateOperationsInput | $Enums.RiskCriterion;
    potentialImpact?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    impact?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskLevel?: Prisma.NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    riskCauses?: Prisma.RiskCauseUpdateManyWithoutRiskNestedInput;
    clientRisks?: Prisma.ClientRiskUpdateManyWithoutRiskNestedInput;
};
export type RiskUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterion?: Prisma.EnumRiskCriterionFieldUpdateOperationsInput | $Enums.RiskCriterion;
    potentialImpact?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    impact?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskLevel?: Prisma.NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    riskCauses?: Prisma.RiskCauseUncheckedUpdateManyWithoutRiskNestedInput;
    clientRisks?: Prisma.ClientRiskUncheckedUpdateManyWithoutRiskNestedInput;
};
export type RiskCreateManyInput = {
    id?: string;
    code: string;
    name: string;
    description: string;
    trustCriterion: $Enums.RiskCriterion;
    potentialImpact: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: number | null;
    impact?: number | null;
    inherentRiskValue?: number | null;
    inherentRiskLevel?: $Enums.RiskLevel | null;
    isActive?: boolean;
};
export type RiskUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterion?: Prisma.EnumRiskCriterionFieldUpdateOperationsInput | $Enums.RiskCriterion;
    potentialImpact?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    impact?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskLevel?: Prisma.NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type RiskUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterion?: Prisma.EnumRiskCriterionFieldUpdateOperationsInput | $Enums.RiskCriterion;
    potentialImpact?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    impact?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskLevel?: Prisma.NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type RiskCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    trustCriterion?: Prisma.SortOrder;
    potentialImpact?: Prisma.SortOrder;
    likelihood?: Prisma.SortOrder;
    impact?: Prisma.SortOrder;
    inherentRiskValue?: Prisma.SortOrder;
    inherentRiskLevel?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
};
export type RiskAvgOrderByAggregateInput = {
    likelihood?: Prisma.SortOrder;
    impact?: Prisma.SortOrder;
    inherentRiskValue?: Prisma.SortOrder;
};
export type RiskMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    trustCriterion?: Prisma.SortOrder;
    likelihood?: Prisma.SortOrder;
    impact?: Prisma.SortOrder;
    inherentRiskValue?: Prisma.SortOrder;
    inherentRiskLevel?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
};
export type RiskMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    trustCriterion?: Prisma.SortOrder;
    likelihood?: Prisma.SortOrder;
    impact?: Prisma.SortOrder;
    inherentRiskValue?: Prisma.SortOrder;
    inherentRiskLevel?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
};
export type RiskSumOrderByAggregateInput = {
    likelihood?: Prisma.SortOrder;
    impact?: Prisma.SortOrder;
    inherentRiskValue?: Prisma.SortOrder;
};
export type RiskScalarRelationFilter = {
    is?: Prisma.RiskWhereInput;
    isNot?: Prisma.RiskWhereInput;
};
export type RiskNullableScalarRelationFilter = {
    is?: Prisma.RiskWhereInput | null;
    isNot?: Prisma.RiskWhereInput | null;
};
export type EnumRiskCriterionFieldUpdateOperationsInput = {
    set?: $Enums.RiskCriterion;
};
export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type NullableEnumRiskLevelFieldUpdateOperationsInput = {
    set?: $Enums.RiskLevel | null;
};
export type RiskCreateNestedOneWithoutRiskCausesInput = {
    create?: Prisma.XOR<Prisma.RiskCreateWithoutRiskCausesInput, Prisma.RiskUncheckedCreateWithoutRiskCausesInput>;
    connectOrCreate?: Prisma.RiskCreateOrConnectWithoutRiskCausesInput;
    connect?: Prisma.RiskWhereUniqueInput;
};
export type RiskUpdateOneRequiredWithoutRiskCausesNestedInput = {
    create?: Prisma.XOR<Prisma.RiskCreateWithoutRiskCausesInput, Prisma.RiskUncheckedCreateWithoutRiskCausesInput>;
    connectOrCreate?: Prisma.RiskCreateOrConnectWithoutRiskCausesInput;
    upsert?: Prisma.RiskUpsertWithoutRiskCausesInput;
    connect?: Prisma.RiskWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RiskUpdateToOneWithWhereWithoutRiskCausesInput, Prisma.RiskUpdateWithoutRiskCausesInput>, Prisma.RiskUncheckedUpdateWithoutRiskCausesInput>;
};
export type RiskCreateNestedOneWithoutClientRisksInput = {
    create?: Prisma.XOR<Prisma.RiskCreateWithoutClientRisksInput, Prisma.RiskUncheckedCreateWithoutClientRisksInput>;
    connectOrCreate?: Prisma.RiskCreateOrConnectWithoutClientRisksInput;
    connect?: Prisma.RiskWhereUniqueInput;
};
export type RiskUpdateOneWithoutClientRisksNestedInput = {
    create?: Prisma.XOR<Prisma.RiskCreateWithoutClientRisksInput, Prisma.RiskUncheckedCreateWithoutClientRisksInput>;
    connectOrCreate?: Prisma.RiskCreateOrConnectWithoutClientRisksInput;
    upsert?: Prisma.RiskUpsertWithoutClientRisksInput;
    disconnect?: Prisma.RiskWhereInput | boolean;
    delete?: Prisma.RiskWhereInput | boolean;
    connect?: Prisma.RiskWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RiskUpdateToOneWithWhereWithoutClientRisksInput, Prisma.RiskUpdateWithoutClientRisksInput>, Prisma.RiskUncheckedUpdateWithoutClientRisksInput>;
};
export type RiskCreateWithoutRiskCausesInput = {
    id?: string;
    code: string;
    name: string;
    description: string;
    trustCriterion: $Enums.RiskCriterion;
    potentialImpact: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: number | null;
    impact?: number | null;
    inherentRiskValue?: number | null;
    inherentRiskLevel?: $Enums.RiskLevel | null;
    isActive?: boolean;
    clientRisks?: Prisma.ClientRiskCreateNestedManyWithoutRiskInput;
};
export type RiskUncheckedCreateWithoutRiskCausesInput = {
    id?: string;
    code: string;
    name: string;
    description: string;
    trustCriterion: $Enums.RiskCriterion;
    potentialImpact: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: number | null;
    impact?: number | null;
    inherentRiskValue?: number | null;
    inherentRiskLevel?: $Enums.RiskLevel | null;
    isActive?: boolean;
    clientRisks?: Prisma.ClientRiskUncheckedCreateNestedManyWithoutRiskInput;
};
export type RiskCreateOrConnectWithoutRiskCausesInput = {
    where: Prisma.RiskWhereUniqueInput;
    create: Prisma.XOR<Prisma.RiskCreateWithoutRiskCausesInput, Prisma.RiskUncheckedCreateWithoutRiskCausesInput>;
};
export type RiskUpsertWithoutRiskCausesInput = {
    update: Prisma.XOR<Prisma.RiskUpdateWithoutRiskCausesInput, Prisma.RiskUncheckedUpdateWithoutRiskCausesInput>;
    create: Prisma.XOR<Prisma.RiskCreateWithoutRiskCausesInput, Prisma.RiskUncheckedCreateWithoutRiskCausesInput>;
    where?: Prisma.RiskWhereInput;
};
export type RiskUpdateToOneWithWhereWithoutRiskCausesInput = {
    where?: Prisma.RiskWhereInput;
    data: Prisma.XOR<Prisma.RiskUpdateWithoutRiskCausesInput, Prisma.RiskUncheckedUpdateWithoutRiskCausesInput>;
};
export type RiskUpdateWithoutRiskCausesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterion?: Prisma.EnumRiskCriterionFieldUpdateOperationsInput | $Enums.RiskCriterion;
    potentialImpact?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    impact?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskLevel?: Prisma.NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    clientRisks?: Prisma.ClientRiskUpdateManyWithoutRiskNestedInput;
};
export type RiskUncheckedUpdateWithoutRiskCausesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterion?: Prisma.EnumRiskCriterionFieldUpdateOperationsInput | $Enums.RiskCriterion;
    potentialImpact?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    impact?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskLevel?: Prisma.NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    clientRisks?: Prisma.ClientRiskUncheckedUpdateManyWithoutRiskNestedInput;
};
export type RiskCreateWithoutClientRisksInput = {
    id?: string;
    code: string;
    name: string;
    description: string;
    trustCriterion: $Enums.RiskCriterion;
    potentialImpact: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: number | null;
    impact?: number | null;
    inherentRiskValue?: number | null;
    inherentRiskLevel?: $Enums.RiskLevel | null;
    isActive?: boolean;
    riskCauses?: Prisma.RiskCauseCreateNestedManyWithoutRiskInput;
};
export type RiskUncheckedCreateWithoutClientRisksInput = {
    id?: string;
    code: string;
    name: string;
    description: string;
    trustCriterion: $Enums.RiskCriterion;
    potentialImpact: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: number | null;
    impact?: number | null;
    inherentRiskValue?: number | null;
    inherentRiskLevel?: $Enums.RiskLevel | null;
    isActive?: boolean;
    riskCauses?: Prisma.RiskCauseUncheckedCreateNestedManyWithoutRiskInput;
};
export type RiskCreateOrConnectWithoutClientRisksInput = {
    where: Prisma.RiskWhereUniqueInput;
    create: Prisma.XOR<Prisma.RiskCreateWithoutClientRisksInput, Prisma.RiskUncheckedCreateWithoutClientRisksInput>;
};
export type RiskUpsertWithoutClientRisksInput = {
    update: Prisma.XOR<Prisma.RiskUpdateWithoutClientRisksInput, Prisma.RiskUncheckedUpdateWithoutClientRisksInput>;
    create: Prisma.XOR<Prisma.RiskCreateWithoutClientRisksInput, Prisma.RiskUncheckedCreateWithoutClientRisksInput>;
    where?: Prisma.RiskWhereInput;
};
export type RiskUpdateToOneWithWhereWithoutClientRisksInput = {
    where?: Prisma.RiskWhereInput;
    data: Prisma.XOR<Prisma.RiskUpdateWithoutClientRisksInput, Prisma.RiskUncheckedUpdateWithoutClientRisksInput>;
};
export type RiskUpdateWithoutClientRisksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterion?: Prisma.EnumRiskCriterionFieldUpdateOperationsInput | $Enums.RiskCriterion;
    potentialImpact?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    impact?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskLevel?: Prisma.NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    riskCauses?: Prisma.RiskCauseUpdateManyWithoutRiskNestedInput;
};
export type RiskUncheckedUpdateWithoutClientRisksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    trustCriterion?: Prisma.EnumRiskCriterionFieldUpdateOperationsInput | $Enums.RiskCriterion;
    potentialImpact?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    likelihood?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    impact?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    inherentRiskLevel?: Prisma.NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    riskCauses?: Prisma.RiskCauseUncheckedUpdateManyWithoutRiskNestedInput;
};
export type RiskCountOutputType = {
    riskCauses: number;
    clientRisks: number;
};
export type RiskCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    riskCauses?: boolean | RiskCountOutputTypeCountRiskCausesArgs;
    clientRisks?: boolean | RiskCountOutputTypeCountClientRisksArgs;
};
export type RiskCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskCountOutputTypeSelect<ExtArgs> | null;
};
export type RiskCountOutputTypeCountRiskCausesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RiskCauseWhereInput;
};
export type RiskCountOutputTypeCountClientRisksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientRiskWhereInput;
};
export type RiskSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    description?: boolean;
    trustCriterion?: boolean;
    potentialImpact?: boolean;
    likelihood?: boolean;
    impact?: boolean;
    inherentRiskValue?: boolean;
    inherentRiskLevel?: boolean;
    isActive?: boolean;
    riskCauses?: boolean | Prisma.Risk$riskCausesArgs<ExtArgs>;
    clientRisks?: boolean | Prisma.Risk$clientRisksArgs<ExtArgs>;
    _count?: boolean | Prisma.RiskCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["risk"]>;
export type RiskSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    description?: boolean;
    trustCriterion?: boolean;
    potentialImpact?: boolean;
    likelihood?: boolean;
    impact?: boolean;
    inherentRiskValue?: boolean;
    inherentRiskLevel?: boolean;
    isActive?: boolean;
}, ExtArgs["result"]["risk"]>;
export type RiskSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    description?: boolean;
    trustCriterion?: boolean;
    potentialImpact?: boolean;
    likelihood?: boolean;
    impact?: boolean;
    inherentRiskValue?: boolean;
    inherentRiskLevel?: boolean;
    isActive?: boolean;
}, ExtArgs["result"]["risk"]>;
export type RiskSelectScalar = {
    id?: boolean;
    code?: boolean;
    name?: boolean;
    description?: boolean;
    trustCriterion?: boolean;
    potentialImpact?: boolean;
    likelihood?: boolean;
    impact?: boolean;
    inherentRiskValue?: boolean;
    inherentRiskLevel?: boolean;
    isActive?: boolean;
};
export type RiskOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "code" | "name" | "description" | "trustCriterion" | "potentialImpact" | "likelihood" | "impact" | "inherentRiskValue" | "inherentRiskLevel" | "isActive", ExtArgs["result"]["risk"]>;
export type RiskInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    riskCauses?: boolean | Prisma.Risk$riskCausesArgs<ExtArgs>;
    clientRisks?: boolean | Prisma.Risk$clientRisksArgs<ExtArgs>;
    _count?: boolean | Prisma.RiskCountOutputTypeDefaultArgs<ExtArgs>;
};
export type RiskIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type RiskIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $RiskPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Risk";
    objects: {
        riskCauses: Prisma.$RiskCausePayload<ExtArgs>[];
        clientRisks: Prisma.$ClientRiskPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        code: string;
        name: string;
        description: string;
        trustCriterion: $Enums.RiskCriterion;
        potentialImpact: runtime.JsonValue;
        likelihood: number | null;
        impact: number | null;
        inherentRiskValue: number | null;
        inherentRiskLevel: $Enums.RiskLevel | null;
        isActive: boolean;
    }, ExtArgs["result"]["risk"]>;
    composites: {};
};
export type RiskGetPayload<S extends boolean | null | undefined | RiskDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RiskPayload, S>;
export type RiskCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RiskFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RiskCountAggregateInputType | true;
};
export interface RiskDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Risk'];
        meta: {
            name: 'Risk';
        };
    };
    findUnique<T extends RiskFindUniqueArgs>(args: Prisma.SelectSubset<T, RiskFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RiskClient<runtime.Types.Result.GetResult<Prisma.$RiskPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends RiskFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RiskFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RiskClient<runtime.Types.Result.GetResult<Prisma.$RiskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends RiskFindFirstArgs>(args?: Prisma.SelectSubset<T, RiskFindFirstArgs<ExtArgs>>): Prisma.Prisma__RiskClient<runtime.Types.Result.GetResult<Prisma.$RiskPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends RiskFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RiskFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RiskClient<runtime.Types.Result.GetResult<Prisma.$RiskPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends RiskFindManyArgs>(args?: Prisma.SelectSubset<T, RiskFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RiskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends RiskCreateArgs>(args: Prisma.SelectSubset<T, RiskCreateArgs<ExtArgs>>): Prisma.Prisma__RiskClient<runtime.Types.Result.GetResult<Prisma.$RiskPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends RiskCreateManyArgs>(args?: Prisma.SelectSubset<T, RiskCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends RiskCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RiskCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RiskPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends RiskDeleteArgs>(args: Prisma.SelectSubset<T, RiskDeleteArgs<ExtArgs>>): Prisma.Prisma__RiskClient<runtime.Types.Result.GetResult<Prisma.$RiskPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends RiskUpdateArgs>(args: Prisma.SelectSubset<T, RiskUpdateArgs<ExtArgs>>): Prisma.Prisma__RiskClient<runtime.Types.Result.GetResult<Prisma.$RiskPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends RiskDeleteManyArgs>(args?: Prisma.SelectSubset<T, RiskDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends RiskUpdateManyArgs>(args: Prisma.SelectSubset<T, RiskUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends RiskUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RiskUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RiskPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends RiskUpsertArgs>(args: Prisma.SelectSubset<T, RiskUpsertArgs<ExtArgs>>): Prisma.Prisma__RiskClient<runtime.Types.Result.GetResult<Prisma.$RiskPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends RiskCountArgs>(args?: Prisma.Subset<T, RiskCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RiskCountAggregateOutputType> : number>;
    aggregate<T extends RiskAggregateArgs>(args: Prisma.Subset<T, RiskAggregateArgs>): Prisma.PrismaPromise<GetRiskAggregateType<T>>;
    groupBy<T extends RiskGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RiskGroupByArgs['orderBy'];
    } : {
        orderBy?: RiskGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RiskGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRiskGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: RiskFieldRefs;
}
export interface Prisma__RiskClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    riskCauses<T extends Prisma.Risk$riskCausesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Risk$riskCausesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RiskCausePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    clientRisks<T extends Prisma.Risk$clientRisksArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Risk$clientRisksArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientRiskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface RiskFieldRefs {
    readonly id: Prisma.FieldRef<"Risk", 'String'>;
    readonly code: Prisma.FieldRef<"Risk", 'String'>;
    readonly name: Prisma.FieldRef<"Risk", 'String'>;
    readonly description: Prisma.FieldRef<"Risk", 'String'>;
    readonly trustCriterion: Prisma.FieldRef<"Risk", 'RiskCriterion'>;
    readonly potentialImpact: Prisma.FieldRef<"Risk", 'Json'>;
    readonly likelihood: Prisma.FieldRef<"Risk", 'Int'>;
    readonly impact: Prisma.FieldRef<"Risk", 'Int'>;
    readonly inherentRiskValue: Prisma.FieldRef<"Risk", 'Int'>;
    readonly inherentRiskLevel: Prisma.FieldRef<"Risk", 'RiskLevel'>;
    readonly isActive: Prisma.FieldRef<"Risk", 'Boolean'>;
}
export type RiskFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskSelect<ExtArgs> | null;
    omit?: Prisma.RiskOmit<ExtArgs> | null;
    include?: Prisma.RiskInclude<ExtArgs> | null;
    where: Prisma.RiskWhereUniqueInput;
};
export type RiskFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskSelect<ExtArgs> | null;
    omit?: Prisma.RiskOmit<ExtArgs> | null;
    include?: Prisma.RiskInclude<ExtArgs> | null;
    where: Prisma.RiskWhereUniqueInput;
};
export type RiskFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskSelect<ExtArgs> | null;
    omit?: Prisma.RiskOmit<ExtArgs> | null;
    include?: Prisma.RiskInclude<ExtArgs> | null;
    where?: Prisma.RiskWhereInput;
    orderBy?: Prisma.RiskOrderByWithRelationInput | Prisma.RiskOrderByWithRelationInput[];
    cursor?: Prisma.RiskWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RiskScalarFieldEnum | Prisma.RiskScalarFieldEnum[];
};
export type RiskFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskSelect<ExtArgs> | null;
    omit?: Prisma.RiskOmit<ExtArgs> | null;
    include?: Prisma.RiskInclude<ExtArgs> | null;
    where?: Prisma.RiskWhereInput;
    orderBy?: Prisma.RiskOrderByWithRelationInput | Prisma.RiskOrderByWithRelationInput[];
    cursor?: Prisma.RiskWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RiskScalarFieldEnum | Prisma.RiskScalarFieldEnum[];
};
export type RiskFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskSelect<ExtArgs> | null;
    omit?: Prisma.RiskOmit<ExtArgs> | null;
    include?: Prisma.RiskInclude<ExtArgs> | null;
    where?: Prisma.RiskWhereInput;
    orderBy?: Prisma.RiskOrderByWithRelationInput | Prisma.RiskOrderByWithRelationInput[];
    cursor?: Prisma.RiskWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RiskScalarFieldEnum | Prisma.RiskScalarFieldEnum[];
};
export type RiskCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskSelect<ExtArgs> | null;
    omit?: Prisma.RiskOmit<ExtArgs> | null;
    include?: Prisma.RiskInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RiskCreateInput, Prisma.RiskUncheckedCreateInput>;
};
export type RiskCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.RiskCreateManyInput | Prisma.RiskCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RiskCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RiskOmit<ExtArgs> | null;
    data: Prisma.RiskCreateManyInput | Prisma.RiskCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RiskUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskSelect<ExtArgs> | null;
    omit?: Prisma.RiskOmit<ExtArgs> | null;
    include?: Prisma.RiskInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RiskUpdateInput, Prisma.RiskUncheckedUpdateInput>;
    where: Prisma.RiskWhereUniqueInput;
};
export type RiskUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.RiskUpdateManyMutationInput, Prisma.RiskUncheckedUpdateManyInput>;
    where?: Prisma.RiskWhereInput;
    limit?: number;
};
export type RiskUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RiskOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RiskUpdateManyMutationInput, Prisma.RiskUncheckedUpdateManyInput>;
    where?: Prisma.RiskWhereInput;
    limit?: number;
};
export type RiskUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskSelect<ExtArgs> | null;
    omit?: Prisma.RiskOmit<ExtArgs> | null;
    include?: Prisma.RiskInclude<ExtArgs> | null;
    where: Prisma.RiskWhereUniqueInput;
    create: Prisma.XOR<Prisma.RiskCreateInput, Prisma.RiskUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.RiskUpdateInput, Prisma.RiskUncheckedUpdateInput>;
};
export type RiskDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskSelect<ExtArgs> | null;
    omit?: Prisma.RiskOmit<ExtArgs> | null;
    include?: Prisma.RiskInclude<ExtArgs> | null;
    where: Prisma.RiskWhereUniqueInput;
};
export type RiskDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RiskWhereInput;
    limit?: number;
};
export type Risk$riskCausesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Risk$clientRisksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientRiskSelect<ExtArgs> | null;
    omit?: Prisma.ClientRiskOmit<ExtArgs> | null;
    include?: Prisma.ClientRiskInclude<ExtArgs> | null;
    where?: Prisma.ClientRiskWhereInput;
    orderBy?: Prisma.ClientRiskOrderByWithRelationInput | Prisma.ClientRiskOrderByWithRelationInput[];
    cursor?: Prisma.ClientRiskWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientRiskScalarFieldEnum | Prisma.ClientRiskScalarFieldEnum[];
};
export type RiskDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskSelect<ExtArgs> | null;
    omit?: Prisma.RiskOmit<ExtArgs> | null;
    include?: Prisma.RiskInclude<ExtArgs> | null;
};
export {};
