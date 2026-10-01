import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ScheduleRuleModel = runtime.Types.Result.DefaultSelection<Prisma.$ScheduleRulePayload>;
export type AggregateScheduleRule = {
    _count: ScheduleRuleCountAggregateOutputType | null;
    _avg: ScheduleRuleAvgAggregateOutputType | null;
    _sum: ScheduleRuleSumAggregateOutputType | null;
    _min: ScheduleRuleMinAggregateOutputType | null;
    _max: ScheduleRuleMaxAggregateOutputType | null;
};
export type ScheduleRuleAvgAggregateOutputType = {
    affectedAssetCount: number | null;
};
export type ScheduleRuleSumAggregateOutputType = {
    affectedAssetCount: number | null;
};
export type ScheduleRuleMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    rule: string | null;
    appliesTo: string | null;
    affectedAssetCount: number | null;
    nextRunAt: Date | null;
};
export type ScheduleRuleMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    rule: string | null;
    appliesTo: string | null;
    affectedAssetCount: number | null;
    nextRunAt: Date | null;
};
export type ScheduleRuleCountAggregateOutputType = {
    id: number;
    tenantId: number;
    rule: number;
    appliesTo: number;
    affectedAssetCount: number;
    nextRunAt: number;
    _all: number;
};
export type ScheduleRuleAvgAggregateInputType = {
    affectedAssetCount?: true;
};
export type ScheduleRuleSumAggregateInputType = {
    affectedAssetCount?: true;
};
export type ScheduleRuleMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    rule?: true;
    appliesTo?: true;
    affectedAssetCount?: true;
    nextRunAt?: true;
};
export type ScheduleRuleMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    rule?: true;
    appliesTo?: true;
    affectedAssetCount?: true;
    nextRunAt?: true;
};
export type ScheduleRuleCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    rule?: true;
    appliesTo?: true;
    affectedAssetCount?: true;
    nextRunAt?: true;
    _all?: true;
};
export type ScheduleRuleAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScheduleRuleWhereInput;
    orderBy?: Prisma.ScheduleRuleOrderByWithRelationInput | Prisma.ScheduleRuleOrderByWithRelationInput[];
    cursor?: Prisma.ScheduleRuleWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ScheduleRuleCountAggregateInputType;
    _avg?: ScheduleRuleAvgAggregateInputType;
    _sum?: ScheduleRuleSumAggregateInputType;
    _min?: ScheduleRuleMinAggregateInputType;
    _max?: ScheduleRuleMaxAggregateInputType;
};
export type GetScheduleRuleAggregateType<T extends ScheduleRuleAggregateArgs> = {
    [P in keyof T & keyof AggregateScheduleRule]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateScheduleRule[P]> : Prisma.GetScalarType<T[P], AggregateScheduleRule[P]>;
};
export type ScheduleRuleGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScheduleRuleWhereInput;
    orderBy?: Prisma.ScheduleRuleOrderByWithAggregationInput | Prisma.ScheduleRuleOrderByWithAggregationInput[];
    by: Prisma.ScheduleRuleScalarFieldEnum[] | Prisma.ScheduleRuleScalarFieldEnum;
    having?: Prisma.ScheduleRuleScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ScheduleRuleCountAggregateInputType | true;
    _avg?: ScheduleRuleAvgAggregateInputType;
    _sum?: ScheduleRuleSumAggregateInputType;
    _min?: ScheduleRuleMinAggregateInputType;
    _max?: ScheduleRuleMaxAggregateInputType;
};
export type ScheduleRuleGroupByOutputType = {
    id: string;
    tenantId: string;
    rule: string;
    appliesTo: string;
    affectedAssetCount: number;
    nextRunAt: Date;
    _count: ScheduleRuleCountAggregateOutputType | null;
    _avg: ScheduleRuleAvgAggregateOutputType | null;
    _sum: ScheduleRuleSumAggregateOutputType | null;
    _min: ScheduleRuleMinAggregateOutputType | null;
    _max: ScheduleRuleMaxAggregateOutputType | null;
};
type GetScheduleRuleGroupByPayload<T extends ScheduleRuleGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ScheduleRuleGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ScheduleRuleGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ScheduleRuleGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ScheduleRuleGroupByOutputType[P]>;
}>>;
export type ScheduleRuleWhereInput = {
    AND?: Prisma.ScheduleRuleWhereInput | Prisma.ScheduleRuleWhereInput[];
    OR?: Prisma.ScheduleRuleWhereInput[];
    NOT?: Prisma.ScheduleRuleWhereInput | Prisma.ScheduleRuleWhereInput[];
    id?: Prisma.UuidFilter<"ScheduleRule"> | string;
    tenantId?: Prisma.UuidFilter<"ScheduleRule"> | string;
    rule?: Prisma.StringFilter<"ScheduleRule"> | string;
    appliesTo?: Prisma.StringFilter<"ScheduleRule"> | string;
    affectedAssetCount?: Prisma.IntFilter<"ScheduleRule"> | number;
    nextRunAt?: Prisma.DateTimeFilter<"ScheduleRule"> | Date | string;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    executions?: Prisma.ExecutionListRelationFilter;
};
export type ScheduleRuleOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    rule?: Prisma.SortOrder;
    appliesTo?: Prisma.SortOrder;
    affectedAssetCount?: Prisma.SortOrder;
    nextRunAt?: Prisma.SortOrder;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
    executions?: Prisma.ExecutionOrderByRelationAggregateInput;
};
export type ScheduleRuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ScheduleRuleWhereInput | Prisma.ScheduleRuleWhereInput[];
    OR?: Prisma.ScheduleRuleWhereInput[];
    NOT?: Prisma.ScheduleRuleWhereInput | Prisma.ScheduleRuleWhereInput[];
    tenantId?: Prisma.UuidFilter<"ScheduleRule"> | string;
    rule?: Prisma.StringFilter<"ScheduleRule"> | string;
    appliesTo?: Prisma.StringFilter<"ScheduleRule"> | string;
    affectedAssetCount?: Prisma.IntFilter<"ScheduleRule"> | number;
    nextRunAt?: Prisma.DateTimeFilter<"ScheduleRule"> | Date | string;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    executions?: Prisma.ExecutionListRelationFilter;
}, "id">;
export type ScheduleRuleOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    rule?: Prisma.SortOrder;
    appliesTo?: Prisma.SortOrder;
    affectedAssetCount?: Prisma.SortOrder;
    nextRunAt?: Prisma.SortOrder;
    _count?: Prisma.ScheduleRuleCountOrderByAggregateInput;
    _avg?: Prisma.ScheduleRuleAvgOrderByAggregateInput;
    _max?: Prisma.ScheduleRuleMaxOrderByAggregateInput;
    _min?: Prisma.ScheduleRuleMinOrderByAggregateInput;
    _sum?: Prisma.ScheduleRuleSumOrderByAggregateInput;
};
export type ScheduleRuleScalarWhereWithAggregatesInput = {
    AND?: Prisma.ScheduleRuleScalarWhereWithAggregatesInput | Prisma.ScheduleRuleScalarWhereWithAggregatesInput[];
    OR?: Prisma.ScheduleRuleScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ScheduleRuleScalarWhereWithAggregatesInput | Prisma.ScheduleRuleScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ScheduleRule"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ScheduleRule"> | string;
    rule?: Prisma.StringWithAggregatesFilter<"ScheduleRule"> | string;
    appliesTo?: Prisma.StringWithAggregatesFilter<"ScheduleRule"> | string;
    affectedAssetCount?: Prisma.IntWithAggregatesFilter<"ScheduleRule"> | number;
    nextRunAt?: Prisma.DateTimeWithAggregatesFilter<"ScheduleRule"> | Date | string;
};
export type ScheduleRuleCreateInput = {
    id?: string;
    rule: string;
    appliesTo: string;
    affectedAssetCount: number;
    nextRunAt: Date | string;
    tenant: Prisma.CompanyCreateNestedOneWithoutScheduleRulesInput;
    executions?: Prisma.ExecutionCreateNestedManyWithoutScheduleRuleInput;
};
export type ScheduleRuleUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    rule: string;
    appliesTo: string;
    affectedAssetCount: number;
    nextRunAt: Date | string;
    executions?: Prisma.ExecutionUncheckedCreateNestedManyWithoutScheduleRuleInput;
};
export type ScheduleRuleUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    rule?: Prisma.StringFieldUpdateOperationsInput | string;
    appliesTo?: Prisma.StringFieldUpdateOperationsInput | string;
    affectedAssetCount?: Prisma.IntFieldUpdateOperationsInput | number;
    nextRunAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutScheduleRulesNestedInput;
    executions?: Prisma.ExecutionUpdateManyWithoutScheduleRuleNestedInput;
};
export type ScheduleRuleUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    rule?: Prisma.StringFieldUpdateOperationsInput | string;
    appliesTo?: Prisma.StringFieldUpdateOperationsInput | string;
    affectedAssetCount?: Prisma.IntFieldUpdateOperationsInput | number;
    nextRunAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    executions?: Prisma.ExecutionUncheckedUpdateManyWithoutScheduleRuleNestedInput;
};
export type ScheduleRuleCreateManyInput = {
    id?: string;
    tenantId: string;
    rule: string;
    appliesTo: string;
    affectedAssetCount: number;
    nextRunAt: Date | string;
};
export type ScheduleRuleUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    rule?: Prisma.StringFieldUpdateOperationsInput | string;
    appliesTo?: Prisma.StringFieldUpdateOperationsInput | string;
    affectedAssetCount?: Prisma.IntFieldUpdateOperationsInput | number;
    nextRunAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScheduleRuleUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    rule?: Prisma.StringFieldUpdateOperationsInput | string;
    appliesTo?: Prisma.StringFieldUpdateOperationsInput | string;
    affectedAssetCount?: Prisma.IntFieldUpdateOperationsInput | number;
    nextRunAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScheduleRuleListRelationFilter = {
    every?: Prisma.ScheduleRuleWhereInput;
    some?: Prisma.ScheduleRuleWhereInput;
    none?: Prisma.ScheduleRuleWhereInput;
};
export type ScheduleRuleOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ScheduleRuleCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    rule?: Prisma.SortOrder;
    appliesTo?: Prisma.SortOrder;
    affectedAssetCount?: Prisma.SortOrder;
    nextRunAt?: Prisma.SortOrder;
};
export type ScheduleRuleAvgOrderByAggregateInput = {
    affectedAssetCount?: Prisma.SortOrder;
};
export type ScheduleRuleMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    rule?: Prisma.SortOrder;
    appliesTo?: Prisma.SortOrder;
    affectedAssetCount?: Prisma.SortOrder;
    nextRunAt?: Prisma.SortOrder;
};
export type ScheduleRuleMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    rule?: Prisma.SortOrder;
    appliesTo?: Prisma.SortOrder;
    affectedAssetCount?: Prisma.SortOrder;
    nextRunAt?: Prisma.SortOrder;
};
export type ScheduleRuleSumOrderByAggregateInput = {
    affectedAssetCount?: Prisma.SortOrder;
};
export type ScheduleRuleNullableScalarRelationFilter = {
    is?: Prisma.ScheduleRuleWhereInput | null;
    isNot?: Prisma.ScheduleRuleWhereInput | null;
};
export type ScheduleRuleCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ScheduleRuleCreateWithoutTenantInput, Prisma.ScheduleRuleUncheckedCreateWithoutTenantInput> | Prisma.ScheduleRuleCreateWithoutTenantInput[] | Prisma.ScheduleRuleUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ScheduleRuleCreateOrConnectWithoutTenantInput | Prisma.ScheduleRuleCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ScheduleRuleCreateManyTenantInputEnvelope;
    connect?: Prisma.ScheduleRuleWhereUniqueInput | Prisma.ScheduleRuleWhereUniqueInput[];
};
export type ScheduleRuleUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ScheduleRuleCreateWithoutTenantInput, Prisma.ScheduleRuleUncheckedCreateWithoutTenantInput> | Prisma.ScheduleRuleCreateWithoutTenantInput[] | Prisma.ScheduleRuleUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ScheduleRuleCreateOrConnectWithoutTenantInput | Prisma.ScheduleRuleCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ScheduleRuleCreateManyTenantInputEnvelope;
    connect?: Prisma.ScheduleRuleWhereUniqueInput | Prisma.ScheduleRuleWhereUniqueInput[];
};
export type ScheduleRuleUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ScheduleRuleCreateWithoutTenantInput, Prisma.ScheduleRuleUncheckedCreateWithoutTenantInput> | Prisma.ScheduleRuleCreateWithoutTenantInput[] | Prisma.ScheduleRuleUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ScheduleRuleCreateOrConnectWithoutTenantInput | Prisma.ScheduleRuleCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ScheduleRuleUpsertWithWhereUniqueWithoutTenantInput | Prisma.ScheduleRuleUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ScheduleRuleCreateManyTenantInputEnvelope;
    set?: Prisma.ScheduleRuleWhereUniqueInput | Prisma.ScheduleRuleWhereUniqueInput[];
    disconnect?: Prisma.ScheduleRuleWhereUniqueInput | Prisma.ScheduleRuleWhereUniqueInput[];
    delete?: Prisma.ScheduleRuleWhereUniqueInput | Prisma.ScheduleRuleWhereUniqueInput[];
    connect?: Prisma.ScheduleRuleWhereUniqueInput | Prisma.ScheduleRuleWhereUniqueInput[];
    update?: Prisma.ScheduleRuleUpdateWithWhereUniqueWithoutTenantInput | Prisma.ScheduleRuleUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ScheduleRuleUpdateManyWithWhereWithoutTenantInput | Prisma.ScheduleRuleUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ScheduleRuleScalarWhereInput | Prisma.ScheduleRuleScalarWhereInput[];
};
export type ScheduleRuleUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ScheduleRuleCreateWithoutTenantInput, Prisma.ScheduleRuleUncheckedCreateWithoutTenantInput> | Prisma.ScheduleRuleCreateWithoutTenantInput[] | Prisma.ScheduleRuleUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ScheduleRuleCreateOrConnectWithoutTenantInput | Prisma.ScheduleRuleCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ScheduleRuleUpsertWithWhereUniqueWithoutTenantInput | Prisma.ScheduleRuleUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ScheduleRuleCreateManyTenantInputEnvelope;
    set?: Prisma.ScheduleRuleWhereUniqueInput | Prisma.ScheduleRuleWhereUniqueInput[];
    disconnect?: Prisma.ScheduleRuleWhereUniqueInput | Prisma.ScheduleRuleWhereUniqueInput[];
    delete?: Prisma.ScheduleRuleWhereUniqueInput | Prisma.ScheduleRuleWhereUniqueInput[];
    connect?: Prisma.ScheduleRuleWhereUniqueInput | Prisma.ScheduleRuleWhereUniqueInput[];
    update?: Prisma.ScheduleRuleUpdateWithWhereUniqueWithoutTenantInput | Prisma.ScheduleRuleUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ScheduleRuleUpdateManyWithWhereWithoutTenantInput | Prisma.ScheduleRuleUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ScheduleRuleScalarWhereInput | Prisma.ScheduleRuleScalarWhereInput[];
};
export type ScheduleRuleCreateNestedOneWithoutExecutionsInput = {
    create?: Prisma.XOR<Prisma.ScheduleRuleCreateWithoutExecutionsInput, Prisma.ScheduleRuleUncheckedCreateWithoutExecutionsInput>;
    connectOrCreate?: Prisma.ScheduleRuleCreateOrConnectWithoutExecutionsInput;
    connect?: Prisma.ScheduleRuleWhereUniqueInput;
};
export type ScheduleRuleUpdateOneWithoutExecutionsNestedInput = {
    create?: Prisma.XOR<Prisma.ScheduleRuleCreateWithoutExecutionsInput, Prisma.ScheduleRuleUncheckedCreateWithoutExecutionsInput>;
    connectOrCreate?: Prisma.ScheduleRuleCreateOrConnectWithoutExecutionsInput;
    upsert?: Prisma.ScheduleRuleUpsertWithoutExecutionsInput;
    disconnect?: Prisma.ScheduleRuleWhereInput | boolean;
    delete?: Prisma.ScheduleRuleWhereInput | boolean;
    connect?: Prisma.ScheduleRuleWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ScheduleRuleUpdateToOneWithWhereWithoutExecutionsInput, Prisma.ScheduleRuleUpdateWithoutExecutionsInput>, Prisma.ScheduleRuleUncheckedUpdateWithoutExecutionsInput>;
};
export type ScheduleRuleCreateWithoutTenantInput = {
    id?: string;
    rule: string;
    appliesTo: string;
    affectedAssetCount: number;
    nextRunAt: Date | string;
    executions?: Prisma.ExecutionCreateNestedManyWithoutScheduleRuleInput;
};
export type ScheduleRuleUncheckedCreateWithoutTenantInput = {
    id?: string;
    rule: string;
    appliesTo: string;
    affectedAssetCount: number;
    nextRunAt: Date | string;
    executions?: Prisma.ExecutionUncheckedCreateNestedManyWithoutScheduleRuleInput;
};
export type ScheduleRuleCreateOrConnectWithoutTenantInput = {
    where: Prisma.ScheduleRuleWhereUniqueInput;
    create: Prisma.XOR<Prisma.ScheduleRuleCreateWithoutTenantInput, Prisma.ScheduleRuleUncheckedCreateWithoutTenantInput>;
};
export type ScheduleRuleCreateManyTenantInputEnvelope = {
    data: Prisma.ScheduleRuleCreateManyTenantInput | Prisma.ScheduleRuleCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ScheduleRuleUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ScheduleRuleWhereUniqueInput;
    update: Prisma.XOR<Prisma.ScheduleRuleUpdateWithoutTenantInput, Prisma.ScheduleRuleUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ScheduleRuleCreateWithoutTenantInput, Prisma.ScheduleRuleUncheckedCreateWithoutTenantInput>;
};
export type ScheduleRuleUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ScheduleRuleWhereUniqueInput;
    data: Prisma.XOR<Prisma.ScheduleRuleUpdateWithoutTenantInput, Prisma.ScheduleRuleUncheckedUpdateWithoutTenantInput>;
};
export type ScheduleRuleUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ScheduleRuleScalarWhereInput;
    data: Prisma.XOR<Prisma.ScheduleRuleUpdateManyMutationInput, Prisma.ScheduleRuleUncheckedUpdateManyWithoutTenantInput>;
};
export type ScheduleRuleScalarWhereInput = {
    AND?: Prisma.ScheduleRuleScalarWhereInput | Prisma.ScheduleRuleScalarWhereInput[];
    OR?: Prisma.ScheduleRuleScalarWhereInput[];
    NOT?: Prisma.ScheduleRuleScalarWhereInput | Prisma.ScheduleRuleScalarWhereInput[];
    id?: Prisma.UuidFilter<"ScheduleRule"> | string;
    tenantId?: Prisma.UuidFilter<"ScheduleRule"> | string;
    rule?: Prisma.StringFilter<"ScheduleRule"> | string;
    appliesTo?: Prisma.StringFilter<"ScheduleRule"> | string;
    affectedAssetCount?: Prisma.IntFilter<"ScheduleRule"> | number;
    nextRunAt?: Prisma.DateTimeFilter<"ScheduleRule"> | Date | string;
};
export type ScheduleRuleCreateWithoutExecutionsInput = {
    id?: string;
    rule: string;
    appliesTo: string;
    affectedAssetCount: number;
    nextRunAt: Date | string;
    tenant: Prisma.CompanyCreateNestedOneWithoutScheduleRulesInput;
};
export type ScheduleRuleUncheckedCreateWithoutExecutionsInput = {
    id?: string;
    tenantId: string;
    rule: string;
    appliesTo: string;
    affectedAssetCount: number;
    nextRunAt: Date | string;
};
export type ScheduleRuleCreateOrConnectWithoutExecutionsInput = {
    where: Prisma.ScheduleRuleWhereUniqueInput;
    create: Prisma.XOR<Prisma.ScheduleRuleCreateWithoutExecutionsInput, Prisma.ScheduleRuleUncheckedCreateWithoutExecutionsInput>;
};
export type ScheduleRuleUpsertWithoutExecutionsInput = {
    update: Prisma.XOR<Prisma.ScheduleRuleUpdateWithoutExecutionsInput, Prisma.ScheduleRuleUncheckedUpdateWithoutExecutionsInput>;
    create: Prisma.XOR<Prisma.ScheduleRuleCreateWithoutExecutionsInput, Prisma.ScheduleRuleUncheckedCreateWithoutExecutionsInput>;
    where?: Prisma.ScheduleRuleWhereInput;
};
export type ScheduleRuleUpdateToOneWithWhereWithoutExecutionsInput = {
    where?: Prisma.ScheduleRuleWhereInput;
    data: Prisma.XOR<Prisma.ScheduleRuleUpdateWithoutExecutionsInput, Prisma.ScheduleRuleUncheckedUpdateWithoutExecutionsInput>;
};
export type ScheduleRuleUpdateWithoutExecutionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    rule?: Prisma.StringFieldUpdateOperationsInput | string;
    appliesTo?: Prisma.StringFieldUpdateOperationsInput | string;
    affectedAssetCount?: Prisma.IntFieldUpdateOperationsInput | number;
    nextRunAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutScheduleRulesNestedInput;
};
export type ScheduleRuleUncheckedUpdateWithoutExecutionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    rule?: Prisma.StringFieldUpdateOperationsInput | string;
    appliesTo?: Prisma.StringFieldUpdateOperationsInput | string;
    affectedAssetCount?: Prisma.IntFieldUpdateOperationsInput | number;
    nextRunAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScheduleRuleCreateManyTenantInput = {
    id?: string;
    rule: string;
    appliesTo: string;
    affectedAssetCount: number;
    nextRunAt: Date | string;
};
export type ScheduleRuleUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    rule?: Prisma.StringFieldUpdateOperationsInput | string;
    appliesTo?: Prisma.StringFieldUpdateOperationsInput | string;
    affectedAssetCount?: Prisma.IntFieldUpdateOperationsInput | number;
    nextRunAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    executions?: Prisma.ExecutionUpdateManyWithoutScheduleRuleNestedInput;
};
export type ScheduleRuleUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    rule?: Prisma.StringFieldUpdateOperationsInput | string;
    appliesTo?: Prisma.StringFieldUpdateOperationsInput | string;
    affectedAssetCount?: Prisma.IntFieldUpdateOperationsInput | number;
    nextRunAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    executions?: Prisma.ExecutionUncheckedUpdateManyWithoutScheduleRuleNestedInput;
};
export type ScheduleRuleUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    rule?: Prisma.StringFieldUpdateOperationsInput | string;
    appliesTo?: Prisma.StringFieldUpdateOperationsInput | string;
    affectedAssetCount?: Prisma.IntFieldUpdateOperationsInput | number;
    nextRunAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScheduleRuleCountOutputType = {
    executions: number;
};
export type ScheduleRuleCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    executions?: boolean | ScheduleRuleCountOutputTypeCountExecutionsArgs;
};
export type ScheduleRuleCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScheduleRuleCountOutputTypeSelect<ExtArgs> | null;
};
export type ScheduleRuleCountOutputTypeCountExecutionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExecutionWhereInput;
};
export type ScheduleRuleSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    rule?: boolean;
    appliesTo?: boolean;
    affectedAssetCount?: boolean;
    nextRunAt?: boolean;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    executions?: boolean | Prisma.ScheduleRule$executionsArgs<ExtArgs>;
    _count?: boolean | Prisma.ScheduleRuleCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["scheduleRule"]>;
export type ScheduleRuleSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    rule?: boolean;
    appliesTo?: boolean;
    affectedAssetCount?: boolean;
    nextRunAt?: boolean;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["scheduleRule"]>;
export type ScheduleRuleSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    rule?: boolean;
    appliesTo?: boolean;
    affectedAssetCount?: boolean;
    nextRunAt?: boolean;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["scheduleRule"]>;
export type ScheduleRuleSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    rule?: boolean;
    appliesTo?: boolean;
    affectedAssetCount?: boolean;
    nextRunAt?: boolean;
};
export type ScheduleRuleOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "rule" | "appliesTo" | "affectedAssetCount" | "nextRunAt", ExtArgs["result"]["scheduleRule"]>;
export type ScheduleRuleInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    executions?: boolean | Prisma.ScheduleRule$executionsArgs<ExtArgs>;
    _count?: boolean | Prisma.ScheduleRuleCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ScheduleRuleIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ScheduleRuleIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ScheduleRulePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ScheduleRule";
    objects: {
        tenant: Prisma.$CompanyPayload<ExtArgs>;
        executions: Prisma.$ExecutionPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        rule: string;
        appliesTo: string;
        affectedAssetCount: number;
        nextRunAt: Date;
    }, ExtArgs["result"]["scheduleRule"]>;
    composites: {};
};
export type ScheduleRuleGetPayload<S extends boolean | null | undefined | ScheduleRuleDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ScheduleRulePayload, S>;
export type ScheduleRuleCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ScheduleRuleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ScheduleRuleCountAggregateInputType | true;
};
export interface ScheduleRuleDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ScheduleRule'];
        meta: {
            name: 'ScheduleRule';
        };
    };
    findUnique<T extends ScheduleRuleFindUniqueArgs>(args: Prisma.SelectSubset<T, ScheduleRuleFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ScheduleRuleClient<runtime.Types.Result.GetResult<Prisma.$ScheduleRulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ScheduleRuleFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ScheduleRuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ScheduleRuleClient<runtime.Types.Result.GetResult<Prisma.$ScheduleRulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ScheduleRuleFindFirstArgs>(args?: Prisma.SelectSubset<T, ScheduleRuleFindFirstArgs<ExtArgs>>): Prisma.Prisma__ScheduleRuleClient<runtime.Types.Result.GetResult<Prisma.$ScheduleRulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ScheduleRuleFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ScheduleRuleFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ScheduleRuleClient<runtime.Types.Result.GetResult<Prisma.$ScheduleRulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ScheduleRuleFindManyArgs>(args?: Prisma.SelectSubset<T, ScheduleRuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScheduleRulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ScheduleRuleCreateArgs>(args: Prisma.SelectSubset<T, ScheduleRuleCreateArgs<ExtArgs>>): Prisma.Prisma__ScheduleRuleClient<runtime.Types.Result.GetResult<Prisma.$ScheduleRulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ScheduleRuleCreateManyArgs>(args?: Prisma.SelectSubset<T, ScheduleRuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ScheduleRuleCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ScheduleRuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScheduleRulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ScheduleRuleDeleteArgs>(args: Prisma.SelectSubset<T, ScheduleRuleDeleteArgs<ExtArgs>>): Prisma.Prisma__ScheduleRuleClient<runtime.Types.Result.GetResult<Prisma.$ScheduleRulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ScheduleRuleUpdateArgs>(args: Prisma.SelectSubset<T, ScheduleRuleUpdateArgs<ExtArgs>>): Prisma.Prisma__ScheduleRuleClient<runtime.Types.Result.GetResult<Prisma.$ScheduleRulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ScheduleRuleDeleteManyArgs>(args?: Prisma.SelectSubset<T, ScheduleRuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ScheduleRuleUpdateManyArgs>(args: Prisma.SelectSubset<T, ScheduleRuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ScheduleRuleUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ScheduleRuleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScheduleRulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ScheduleRuleUpsertArgs>(args: Prisma.SelectSubset<T, ScheduleRuleUpsertArgs<ExtArgs>>): Prisma.Prisma__ScheduleRuleClient<runtime.Types.Result.GetResult<Prisma.$ScheduleRulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ScheduleRuleCountArgs>(args?: Prisma.Subset<T, ScheduleRuleCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ScheduleRuleCountAggregateOutputType> : number>;
    aggregate<T extends ScheduleRuleAggregateArgs>(args: Prisma.Subset<T, ScheduleRuleAggregateArgs>): Prisma.PrismaPromise<GetScheduleRuleAggregateType<T>>;
    groupBy<T extends ScheduleRuleGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ScheduleRuleGroupByArgs['orderBy'];
    } : {
        orderBy?: ScheduleRuleGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ScheduleRuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScheduleRuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ScheduleRuleFieldRefs;
}
export interface Prisma__ScheduleRuleClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    executions<T extends Prisma.ScheduleRule$executionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ScheduleRule$executionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ScheduleRuleFieldRefs {
    readonly id: Prisma.FieldRef<"ScheduleRule", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ScheduleRule", 'String'>;
    readonly rule: Prisma.FieldRef<"ScheduleRule", 'String'>;
    readonly appliesTo: Prisma.FieldRef<"ScheduleRule", 'String'>;
    readonly affectedAssetCount: Prisma.FieldRef<"ScheduleRule", 'Int'>;
    readonly nextRunAt: Prisma.FieldRef<"ScheduleRule", 'DateTime'>;
}
export type ScheduleRuleFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScheduleRuleSelect<ExtArgs> | null;
    omit?: Prisma.ScheduleRuleOmit<ExtArgs> | null;
    include?: Prisma.ScheduleRuleInclude<ExtArgs> | null;
    where: Prisma.ScheduleRuleWhereUniqueInput;
};
export type ScheduleRuleFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScheduleRuleSelect<ExtArgs> | null;
    omit?: Prisma.ScheduleRuleOmit<ExtArgs> | null;
    include?: Prisma.ScheduleRuleInclude<ExtArgs> | null;
    where: Prisma.ScheduleRuleWhereUniqueInput;
};
export type ScheduleRuleFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScheduleRuleSelect<ExtArgs> | null;
    omit?: Prisma.ScheduleRuleOmit<ExtArgs> | null;
    include?: Prisma.ScheduleRuleInclude<ExtArgs> | null;
    where?: Prisma.ScheduleRuleWhereInput;
    orderBy?: Prisma.ScheduleRuleOrderByWithRelationInput | Prisma.ScheduleRuleOrderByWithRelationInput[];
    cursor?: Prisma.ScheduleRuleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ScheduleRuleScalarFieldEnum | Prisma.ScheduleRuleScalarFieldEnum[];
};
export type ScheduleRuleFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScheduleRuleSelect<ExtArgs> | null;
    omit?: Prisma.ScheduleRuleOmit<ExtArgs> | null;
    include?: Prisma.ScheduleRuleInclude<ExtArgs> | null;
    where?: Prisma.ScheduleRuleWhereInput;
    orderBy?: Prisma.ScheduleRuleOrderByWithRelationInput | Prisma.ScheduleRuleOrderByWithRelationInput[];
    cursor?: Prisma.ScheduleRuleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ScheduleRuleScalarFieldEnum | Prisma.ScheduleRuleScalarFieldEnum[];
};
export type ScheduleRuleFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScheduleRuleSelect<ExtArgs> | null;
    omit?: Prisma.ScheduleRuleOmit<ExtArgs> | null;
    include?: Prisma.ScheduleRuleInclude<ExtArgs> | null;
    where?: Prisma.ScheduleRuleWhereInput;
    orderBy?: Prisma.ScheduleRuleOrderByWithRelationInput | Prisma.ScheduleRuleOrderByWithRelationInput[];
    cursor?: Prisma.ScheduleRuleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ScheduleRuleScalarFieldEnum | Prisma.ScheduleRuleScalarFieldEnum[];
};
export type ScheduleRuleCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScheduleRuleSelect<ExtArgs> | null;
    omit?: Prisma.ScheduleRuleOmit<ExtArgs> | null;
    include?: Prisma.ScheduleRuleInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ScheduleRuleCreateInput, Prisma.ScheduleRuleUncheckedCreateInput>;
};
export type ScheduleRuleCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ScheduleRuleCreateManyInput | Prisma.ScheduleRuleCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ScheduleRuleCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScheduleRuleSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ScheduleRuleOmit<ExtArgs> | null;
    data: Prisma.ScheduleRuleCreateManyInput | Prisma.ScheduleRuleCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ScheduleRuleIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ScheduleRuleUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScheduleRuleSelect<ExtArgs> | null;
    omit?: Prisma.ScheduleRuleOmit<ExtArgs> | null;
    include?: Prisma.ScheduleRuleInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ScheduleRuleUpdateInput, Prisma.ScheduleRuleUncheckedUpdateInput>;
    where: Prisma.ScheduleRuleWhereUniqueInput;
};
export type ScheduleRuleUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ScheduleRuleUpdateManyMutationInput, Prisma.ScheduleRuleUncheckedUpdateManyInput>;
    where?: Prisma.ScheduleRuleWhereInput;
    limit?: number;
};
export type ScheduleRuleUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScheduleRuleSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ScheduleRuleOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ScheduleRuleUpdateManyMutationInput, Prisma.ScheduleRuleUncheckedUpdateManyInput>;
    where?: Prisma.ScheduleRuleWhereInput;
    limit?: number;
    include?: Prisma.ScheduleRuleIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ScheduleRuleUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScheduleRuleSelect<ExtArgs> | null;
    omit?: Prisma.ScheduleRuleOmit<ExtArgs> | null;
    include?: Prisma.ScheduleRuleInclude<ExtArgs> | null;
    where: Prisma.ScheduleRuleWhereUniqueInput;
    create: Prisma.XOR<Prisma.ScheduleRuleCreateInput, Prisma.ScheduleRuleUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ScheduleRuleUpdateInput, Prisma.ScheduleRuleUncheckedUpdateInput>;
};
export type ScheduleRuleDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScheduleRuleSelect<ExtArgs> | null;
    omit?: Prisma.ScheduleRuleOmit<ExtArgs> | null;
    include?: Prisma.ScheduleRuleInclude<ExtArgs> | null;
    where: Prisma.ScheduleRuleWhereUniqueInput;
};
export type ScheduleRuleDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScheduleRuleWhereInput;
    limit?: number;
};
export type ScheduleRule$executionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionOmit<ExtArgs> | null;
    include?: Prisma.ExecutionInclude<ExtArgs> | null;
    where?: Prisma.ExecutionWhereInput;
    orderBy?: Prisma.ExecutionOrderByWithRelationInput | Prisma.ExecutionOrderByWithRelationInput[];
    cursor?: Prisma.ExecutionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExecutionScalarFieldEnum | Prisma.ExecutionScalarFieldEnum[];
};
export type ScheduleRuleDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScheduleRuleSelect<ExtArgs> | null;
    omit?: Prisma.ScheduleRuleOmit<ExtArgs> | null;
    include?: Prisma.ScheduleRuleInclude<ExtArgs> | null;
};
export {};
