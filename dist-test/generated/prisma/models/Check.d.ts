import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CheckModel = runtime.Types.Result.DefaultSelection<Prisma.$CheckPayload>;
export type AggregateCheck = {
    _count: CheckCountAggregateOutputType | null;
    _min: CheckMinAggregateOutputType | null;
    _max: CheckMaxAggregateOutputType | null;
};
export type CheckMinAggregateOutputType = {
    id: string | null;
    platform: string | null;
    policyId: string | null;
    checkId: string | null;
    titleEs: string | null;
    titleEn: string | null;
    condition: string | null;
    remediation: string | null;
    verificationRule: string | null;
    origin: $Enums.CheckOrigin | null;
    mappingProvenance: string | null;
    mappingConfidence: $Enums.MappingConfidence | null;
    scaPolicyId: string | null;
};
export type CheckMaxAggregateOutputType = {
    id: string | null;
    platform: string | null;
    policyId: string | null;
    checkId: string | null;
    titleEs: string | null;
    titleEn: string | null;
    condition: string | null;
    remediation: string | null;
    verificationRule: string | null;
    origin: $Enums.CheckOrigin | null;
    mappingProvenance: string | null;
    mappingConfidence: $Enums.MappingConfidence | null;
    scaPolicyId: string | null;
};
export type CheckCountAggregateOutputType = {
    id: number;
    platform: number;
    policyId: number;
    checkId: number;
    titleEs: number;
    titleEn: number;
    condition: number;
    remediation: number;
    verificationRule: number;
    origin: number;
    mappingProvenance: number;
    mappingConfidence: number;
    scaPolicyId: number;
    _all: number;
};
export type CheckMinAggregateInputType = {
    id?: true;
    platform?: true;
    policyId?: true;
    checkId?: true;
    titleEs?: true;
    titleEn?: true;
    condition?: true;
    remediation?: true;
    verificationRule?: true;
    origin?: true;
    mappingProvenance?: true;
    mappingConfidence?: true;
    scaPolicyId?: true;
};
export type CheckMaxAggregateInputType = {
    id?: true;
    platform?: true;
    policyId?: true;
    checkId?: true;
    titleEs?: true;
    titleEn?: true;
    condition?: true;
    remediation?: true;
    verificationRule?: true;
    origin?: true;
    mappingProvenance?: true;
    mappingConfidence?: true;
    scaPolicyId?: true;
};
export type CheckCountAggregateInputType = {
    id?: true;
    platform?: true;
    policyId?: true;
    checkId?: true;
    titleEs?: true;
    titleEn?: true;
    condition?: true;
    remediation?: true;
    verificationRule?: true;
    origin?: true;
    mappingProvenance?: true;
    mappingConfidence?: true;
    scaPolicyId?: true;
    _all?: true;
};
export type CheckAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckWhereInput;
    orderBy?: Prisma.CheckOrderByWithRelationInput | Prisma.CheckOrderByWithRelationInput[];
    cursor?: Prisma.CheckWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CheckCountAggregateInputType;
    _min?: CheckMinAggregateInputType;
    _max?: CheckMaxAggregateInputType;
};
export type GetCheckAggregateType<T extends CheckAggregateArgs> = {
    [P in keyof T & keyof AggregateCheck]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCheck[P]> : Prisma.GetScalarType<T[P], AggregateCheck[P]>;
};
export type CheckGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckWhereInput;
    orderBy?: Prisma.CheckOrderByWithAggregationInput | Prisma.CheckOrderByWithAggregationInput[];
    by: Prisma.CheckScalarFieldEnum[] | Prisma.CheckScalarFieldEnum;
    having?: Prisma.CheckScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CheckCountAggregateInputType | true;
    _min?: CheckMinAggregateInputType;
    _max?: CheckMaxAggregateInputType;
};
export type CheckGroupByOutputType = {
    id: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
    scaPolicyId: string | null;
    _count: CheckCountAggregateOutputType | null;
    _min: CheckMinAggregateOutputType | null;
    _max: CheckMaxAggregateOutputType | null;
};
type GetCheckGroupByPayload<T extends CheckGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CheckGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CheckGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CheckGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CheckGroupByOutputType[P]>;
}>>;
export type CheckWhereInput = {
    AND?: Prisma.CheckWhereInput | Prisma.CheckWhereInput[];
    OR?: Prisma.CheckWhereInput[];
    NOT?: Prisma.CheckWhereInput | Prisma.CheckWhereInput[];
    id?: Prisma.UuidFilter<"Check"> | string;
    platform?: Prisma.StringFilter<"Check"> | string;
    policyId?: Prisma.StringFilter<"Check"> | string;
    checkId?: Prisma.StringFilter<"Check"> | string;
    titleEs?: Prisma.StringFilter<"Check"> | string;
    titleEn?: Prisma.StringFilter<"Check"> | string;
    condition?: Prisma.StringFilter<"Check"> | string;
    remediation?: Prisma.StringFilter<"Check"> | string;
    verificationRule?: Prisma.StringFilter<"Check"> | string;
    origin?: Prisma.EnumCheckOriginFilter<"Check"> | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFilter<"Check"> | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFilter<"Check"> | $Enums.MappingConfidence;
    scaPolicyId?: Prisma.UuidNullableFilter<"Check"> | string | null;
    scaPolicy?: Prisma.XOR<Prisma.ScaPolicyNullableScalarRelationFilter, Prisma.ScaPolicyWhereInput> | null;
    testChecks?: Prisma.TestCheckListRelationFilter;
    checkMappings?: Prisma.CheckMappingListRelationFilter;
    checkResults?: Prisma.CheckResultListRelationFilter;
    evaluations?: Prisma.EvaluationListRelationFilter;
};
export type CheckOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    titleEs?: Prisma.SortOrder;
    titleEn?: Prisma.SortOrder;
    condition?: Prisma.SortOrder;
    remediation?: Prisma.SortOrder;
    verificationRule?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    mappingProvenance?: Prisma.SortOrder;
    mappingConfidence?: Prisma.SortOrder;
    scaPolicyId?: Prisma.SortOrderInput | Prisma.SortOrder;
    scaPolicy?: Prisma.ScaPolicyOrderByWithRelationInput;
    testChecks?: Prisma.TestCheckOrderByRelationAggregateInput;
    checkMappings?: Prisma.CheckMappingOrderByRelationAggregateInput;
    checkResults?: Prisma.CheckResultOrderByRelationAggregateInput;
    evaluations?: Prisma.EvaluationOrderByRelationAggregateInput;
};
export type CheckWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    platform_policyId_checkId?: Prisma.CheckPlatformPolicyIdCheckIdCompoundUniqueInput;
    AND?: Prisma.CheckWhereInput | Prisma.CheckWhereInput[];
    OR?: Prisma.CheckWhereInput[];
    NOT?: Prisma.CheckWhereInput | Prisma.CheckWhereInput[];
    platform?: Prisma.StringFilter<"Check"> | string;
    policyId?: Prisma.StringFilter<"Check"> | string;
    checkId?: Prisma.StringFilter<"Check"> | string;
    titleEs?: Prisma.StringFilter<"Check"> | string;
    titleEn?: Prisma.StringFilter<"Check"> | string;
    condition?: Prisma.StringFilter<"Check"> | string;
    remediation?: Prisma.StringFilter<"Check"> | string;
    verificationRule?: Prisma.StringFilter<"Check"> | string;
    origin?: Prisma.EnumCheckOriginFilter<"Check"> | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFilter<"Check"> | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFilter<"Check"> | $Enums.MappingConfidence;
    scaPolicyId?: Prisma.UuidNullableFilter<"Check"> | string | null;
    scaPolicy?: Prisma.XOR<Prisma.ScaPolicyNullableScalarRelationFilter, Prisma.ScaPolicyWhereInput> | null;
    testChecks?: Prisma.TestCheckListRelationFilter;
    checkMappings?: Prisma.CheckMappingListRelationFilter;
    checkResults?: Prisma.CheckResultListRelationFilter;
    evaluations?: Prisma.EvaluationListRelationFilter;
}, "id" | "platform_policyId_checkId">;
export type CheckOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    titleEs?: Prisma.SortOrder;
    titleEn?: Prisma.SortOrder;
    condition?: Prisma.SortOrder;
    remediation?: Prisma.SortOrder;
    verificationRule?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    mappingProvenance?: Prisma.SortOrder;
    mappingConfidence?: Prisma.SortOrder;
    scaPolicyId?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.CheckCountOrderByAggregateInput;
    _max?: Prisma.CheckMaxOrderByAggregateInput;
    _min?: Prisma.CheckMinOrderByAggregateInput;
};
export type CheckScalarWhereWithAggregatesInput = {
    AND?: Prisma.CheckScalarWhereWithAggregatesInput | Prisma.CheckScalarWhereWithAggregatesInput[];
    OR?: Prisma.CheckScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CheckScalarWhereWithAggregatesInput | Prisma.CheckScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Check"> | string;
    platform?: Prisma.StringWithAggregatesFilter<"Check"> | string;
    policyId?: Prisma.StringWithAggregatesFilter<"Check"> | string;
    checkId?: Prisma.StringWithAggregatesFilter<"Check"> | string;
    titleEs?: Prisma.StringWithAggregatesFilter<"Check"> | string;
    titleEn?: Prisma.StringWithAggregatesFilter<"Check"> | string;
    condition?: Prisma.StringWithAggregatesFilter<"Check"> | string;
    remediation?: Prisma.StringWithAggregatesFilter<"Check"> | string;
    verificationRule?: Prisma.StringWithAggregatesFilter<"Check"> | string;
    origin?: Prisma.EnumCheckOriginWithAggregatesFilter<"Check"> | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringWithAggregatesFilter<"Check"> | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceWithAggregatesFilter<"Check"> | $Enums.MappingConfidence;
    scaPolicyId?: Prisma.UuidNullableWithAggregatesFilter<"Check"> | string | null;
};
export type CheckCreateInput = {
    id?: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
    scaPolicy?: Prisma.ScaPolicyCreateNestedOneWithoutChecksInput;
    testChecks?: Prisma.TestCheckCreateNestedManyWithoutCheckInput;
    checkMappings?: Prisma.CheckMappingCreateNestedManyWithoutCheckInput;
    checkResults?: Prisma.CheckResultCreateNestedManyWithoutCheckInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutCheckInput;
};
export type CheckUncheckedCreateInput = {
    id?: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
    scaPolicyId?: string | null;
    testChecks?: Prisma.TestCheckUncheckedCreateNestedManyWithoutCheckInput;
    checkMappings?: Prisma.CheckMappingUncheckedCreateNestedManyWithoutCheckInput;
    checkResults?: Prisma.CheckResultUncheckedCreateNestedManyWithoutCheckInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutCheckInput;
};
export type CheckUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
    scaPolicy?: Prisma.ScaPolicyUpdateOneWithoutChecksNestedInput;
    testChecks?: Prisma.TestCheckUpdateManyWithoutCheckNestedInput;
    checkMappings?: Prisma.CheckMappingUpdateManyWithoutCheckNestedInput;
    checkResults?: Prisma.CheckResultUpdateManyWithoutCheckNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutCheckNestedInput;
};
export type CheckUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
    scaPolicyId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    testChecks?: Prisma.TestCheckUncheckedUpdateManyWithoutCheckNestedInput;
    checkMappings?: Prisma.CheckMappingUncheckedUpdateManyWithoutCheckNestedInput;
    checkResults?: Prisma.CheckResultUncheckedUpdateManyWithoutCheckNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutCheckNestedInput;
};
export type CheckCreateManyInput = {
    id?: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
    scaPolicyId?: string | null;
};
export type CheckUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
};
export type CheckUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
    scaPolicyId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type CheckPlatformPolicyIdCheckIdCompoundUniqueInput = {
    platform: string;
    policyId: string;
    checkId: string;
};
export type CheckCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    titleEs?: Prisma.SortOrder;
    titleEn?: Prisma.SortOrder;
    condition?: Prisma.SortOrder;
    remediation?: Prisma.SortOrder;
    verificationRule?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    mappingProvenance?: Prisma.SortOrder;
    mappingConfidence?: Prisma.SortOrder;
    scaPolicyId?: Prisma.SortOrder;
};
export type CheckMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    titleEs?: Prisma.SortOrder;
    titleEn?: Prisma.SortOrder;
    condition?: Prisma.SortOrder;
    remediation?: Prisma.SortOrder;
    verificationRule?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    mappingProvenance?: Prisma.SortOrder;
    mappingConfidence?: Prisma.SortOrder;
    scaPolicyId?: Prisma.SortOrder;
};
export type CheckMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    policyId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    titleEs?: Prisma.SortOrder;
    titleEn?: Prisma.SortOrder;
    condition?: Prisma.SortOrder;
    remediation?: Prisma.SortOrder;
    verificationRule?: Prisma.SortOrder;
    origin?: Prisma.SortOrder;
    mappingProvenance?: Prisma.SortOrder;
    mappingConfidence?: Prisma.SortOrder;
    scaPolicyId?: Prisma.SortOrder;
};
export type CheckScalarRelationFilter = {
    is?: Prisma.CheckWhereInput;
    isNot?: Prisma.CheckWhereInput;
};
export type CheckListRelationFilter = {
    every?: Prisma.CheckWhereInput;
    some?: Prisma.CheckWhereInput;
    none?: Prisma.CheckWhereInput;
};
export type CheckOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CheckNullableScalarRelationFilter = {
    is?: Prisma.CheckWhereInput | null;
    isNot?: Prisma.CheckWhereInput | null;
};
export type EnumCheckOriginFieldUpdateOperationsInput = {
    set?: $Enums.CheckOrigin;
};
export type EnumMappingConfidenceFieldUpdateOperationsInput = {
    set?: $Enums.MappingConfidence;
};
export type CheckCreateNestedOneWithoutTestChecksInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutTestChecksInput, Prisma.CheckUncheckedCreateWithoutTestChecksInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutTestChecksInput;
    connect?: Prisma.CheckWhereUniqueInput;
};
export type CheckUpdateOneRequiredWithoutTestChecksNestedInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutTestChecksInput, Prisma.CheckUncheckedCreateWithoutTestChecksInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutTestChecksInput;
    upsert?: Prisma.CheckUpsertWithoutTestChecksInput;
    connect?: Prisma.CheckWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CheckUpdateToOneWithWhereWithoutTestChecksInput, Prisma.CheckUpdateWithoutTestChecksInput>, Prisma.CheckUncheckedUpdateWithoutTestChecksInput>;
};
export type CheckCreateNestedOneWithoutCheckMappingsInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutCheckMappingsInput, Prisma.CheckUncheckedCreateWithoutCheckMappingsInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutCheckMappingsInput;
    connect?: Prisma.CheckWhereUniqueInput;
};
export type CheckUpdateOneRequiredWithoutCheckMappingsNestedInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutCheckMappingsInput, Prisma.CheckUncheckedCreateWithoutCheckMappingsInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutCheckMappingsInput;
    upsert?: Prisma.CheckUpsertWithoutCheckMappingsInput;
    connect?: Prisma.CheckWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CheckUpdateToOneWithWhereWithoutCheckMappingsInput, Prisma.CheckUpdateWithoutCheckMappingsInput>, Prisma.CheckUncheckedUpdateWithoutCheckMappingsInput>;
};
export type CheckCreateNestedManyWithoutScaPolicyInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutScaPolicyInput, Prisma.CheckUncheckedCreateWithoutScaPolicyInput> | Prisma.CheckCreateWithoutScaPolicyInput[] | Prisma.CheckUncheckedCreateWithoutScaPolicyInput[];
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutScaPolicyInput | Prisma.CheckCreateOrConnectWithoutScaPolicyInput[];
    createMany?: Prisma.CheckCreateManyScaPolicyInputEnvelope;
    connect?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
};
export type CheckUncheckedCreateNestedManyWithoutScaPolicyInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutScaPolicyInput, Prisma.CheckUncheckedCreateWithoutScaPolicyInput> | Prisma.CheckCreateWithoutScaPolicyInput[] | Prisma.CheckUncheckedCreateWithoutScaPolicyInput[];
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutScaPolicyInput | Prisma.CheckCreateOrConnectWithoutScaPolicyInput[];
    createMany?: Prisma.CheckCreateManyScaPolicyInputEnvelope;
    connect?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
};
export type CheckUpdateManyWithoutScaPolicyNestedInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutScaPolicyInput, Prisma.CheckUncheckedCreateWithoutScaPolicyInput> | Prisma.CheckCreateWithoutScaPolicyInput[] | Prisma.CheckUncheckedCreateWithoutScaPolicyInput[];
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutScaPolicyInput | Prisma.CheckCreateOrConnectWithoutScaPolicyInput[];
    upsert?: Prisma.CheckUpsertWithWhereUniqueWithoutScaPolicyInput | Prisma.CheckUpsertWithWhereUniqueWithoutScaPolicyInput[];
    createMany?: Prisma.CheckCreateManyScaPolicyInputEnvelope;
    set?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    disconnect?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    delete?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    connect?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    update?: Prisma.CheckUpdateWithWhereUniqueWithoutScaPolicyInput | Prisma.CheckUpdateWithWhereUniqueWithoutScaPolicyInput[];
    updateMany?: Prisma.CheckUpdateManyWithWhereWithoutScaPolicyInput | Prisma.CheckUpdateManyWithWhereWithoutScaPolicyInput[];
    deleteMany?: Prisma.CheckScalarWhereInput | Prisma.CheckScalarWhereInput[];
};
export type CheckUncheckedUpdateManyWithoutScaPolicyNestedInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutScaPolicyInput, Prisma.CheckUncheckedCreateWithoutScaPolicyInput> | Prisma.CheckCreateWithoutScaPolicyInput[] | Prisma.CheckUncheckedCreateWithoutScaPolicyInput[];
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutScaPolicyInput | Prisma.CheckCreateOrConnectWithoutScaPolicyInput[];
    upsert?: Prisma.CheckUpsertWithWhereUniqueWithoutScaPolicyInput | Prisma.CheckUpsertWithWhereUniqueWithoutScaPolicyInput[];
    createMany?: Prisma.CheckCreateManyScaPolicyInputEnvelope;
    set?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    disconnect?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    delete?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    connect?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    update?: Prisma.CheckUpdateWithWhereUniqueWithoutScaPolicyInput | Prisma.CheckUpdateWithWhereUniqueWithoutScaPolicyInput[];
    updateMany?: Prisma.CheckUpdateManyWithWhereWithoutScaPolicyInput | Prisma.CheckUpdateManyWithWhereWithoutScaPolicyInput[];
    deleteMany?: Prisma.CheckScalarWhereInput | Prisma.CheckScalarWhereInput[];
};
export type CheckCreateNestedOneWithoutEvaluationsInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutEvaluationsInput, Prisma.CheckUncheckedCreateWithoutEvaluationsInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutEvaluationsInput;
    connect?: Prisma.CheckWhereUniqueInput;
};
export type CheckUpdateOneWithoutEvaluationsNestedInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutEvaluationsInput, Prisma.CheckUncheckedCreateWithoutEvaluationsInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutEvaluationsInput;
    upsert?: Prisma.CheckUpsertWithoutEvaluationsInput;
    disconnect?: Prisma.CheckWhereInput | boolean;
    delete?: Prisma.CheckWhereInput | boolean;
    connect?: Prisma.CheckWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CheckUpdateToOneWithWhereWithoutEvaluationsInput, Prisma.CheckUpdateWithoutEvaluationsInput>, Prisma.CheckUncheckedUpdateWithoutEvaluationsInput>;
};
export type CheckCreateNestedOneWithoutCheckResultsInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutCheckResultsInput, Prisma.CheckUncheckedCreateWithoutCheckResultsInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutCheckResultsInput;
    connect?: Prisma.CheckWhereUniqueInput;
};
export type CheckUpdateOneRequiredWithoutCheckResultsNestedInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutCheckResultsInput, Prisma.CheckUncheckedCreateWithoutCheckResultsInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutCheckResultsInput;
    upsert?: Prisma.CheckUpsertWithoutCheckResultsInput;
    connect?: Prisma.CheckWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CheckUpdateToOneWithWhereWithoutCheckResultsInput, Prisma.CheckUpdateWithoutCheckResultsInput>, Prisma.CheckUncheckedUpdateWithoutCheckResultsInput>;
};
export type CheckCreateWithoutTestChecksInput = {
    id?: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
    scaPolicy?: Prisma.ScaPolicyCreateNestedOneWithoutChecksInput;
    checkMappings?: Prisma.CheckMappingCreateNestedManyWithoutCheckInput;
    checkResults?: Prisma.CheckResultCreateNestedManyWithoutCheckInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutCheckInput;
};
export type CheckUncheckedCreateWithoutTestChecksInput = {
    id?: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
    scaPolicyId?: string | null;
    checkMappings?: Prisma.CheckMappingUncheckedCreateNestedManyWithoutCheckInput;
    checkResults?: Prisma.CheckResultUncheckedCreateNestedManyWithoutCheckInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutCheckInput;
};
export type CheckCreateOrConnectWithoutTestChecksInput = {
    where: Prisma.CheckWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckCreateWithoutTestChecksInput, Prisma.CheckUncheckedCreateWithoutTestChecksInput>;
};
export type CheckUpsertWithoutTestChecksInput = {
    update: Prisma.XOR<Prisma.CheckUpdateWithoutTestChecksInput, Prisma.CheckUncheckedUpdateWithoutTestChecksInput>;
    create: Prisma.XOR<Prisma.CheckCreateWithoutTestChecksInput, Prisma.CheckUncheckedCreateWithoutTestChecksInput>;
    where?: Prisma.CheckWhereInput;
};
export type CheckUpdateToOneWithWhereWithoutTestChecksInput = {
    where?: Prisma.CheckWhereInput;
    data: Prisma.XOR<Prisma.CheckUpdateWithoutTestChecksInput, Prisma.CheckUncheckedUpdateWithoutTestChecksInput>;
};
export type CheckUpdateWithoutTestChecksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
    scaPolicy?: Prisma.ScaPolicyUpdateOneWithoutChecksNestedInput;
    checkMappings?: Prisma.CheckMappingUpdateManyWithoutCheckNestedInput;
    checkResults?: Prisma.CheckResultUpdateManyWithoutCheckNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutCheckNestedInput;
};
export type CheckUncheckedUpdateWithoutTestChecksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
    scaPolicyId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkMappings?: Prisma.CheckMappingUncheckedUpdateManyWithoutCheckNestedInput;
    checkResults?: Prisma.CheckResultUncheckedUpdateManyWithoutCheckNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutCheckNestedInput;
};
export type CheckCreateWithoutCheckMappingsInput = {
    id?: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
    scaPolicy?: Prisma.ScaPolicyCreateNestedOneWithoutChecksInput;
    testChecks?: Prisma.TestCheckCreateNestedManyWithoutCheckInput;
    checkResults?: Prisma.CheckResultCreateNestedManyWithoutCheckInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutCheckInput;
};
export type CheckUncheckedCreateWithoutCheckMappingsInput = {
    id?: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
    scaPolicyId?: string | null;
    testChecks?: Prisma.TestCheckUncheckedCreateNestedManyWithoutCheckInput;
    checkResults?: Prisma.CheckResultUncheckedCreateNestedManyWithoutCheckInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutCheckInput;
};
export type CheckCreateOrConnectWithoutCheckMappingsInput = {
    where: Prisma.CheckWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckCreateWithoutCheckMappingsInput, Prisma.CheckUncheckedCreateWithoutCheckMappingsInput>;
};
export type CheckUpsertWithoutCheckMappingsInput = {
    update: Prisma.XOR<Prisma.CheckUpdateWithoutCheckMappingsInput, Prisma.CheckUncheckedUpdateWithoutCheckMappingsInput>;
    create: Prisma.XOR<Prisma.CheckCreateWithoutCheckMappingsInput, Prisma.CheckUncheckedCreateWithoutCheckMappingsInput>;
    where?: Prisma.CheckWhereInput;
};
export type CheckUpdateToOneWithWhereWithoutCheckMappingsInput = {
    where?: Prisma.CheckWhereInput;
    data: Prisma.XOR<Prisma.CheckUpdateWithoutCheckMappingsInput, Prisma.CheckUncheckedUpdateWithoutCheckMappingsInput>;
};
export type CheckUpdateWithoutCheckMappingsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
    scaPolicy?: Prisma.ScaPolicyUpdateOneWithoutChecksNestedInput;
    testChecks?: Prisma.TestCheckUpdateManyWithoutCheckNestedInput;
    checkResults?: Prisma.CheckResultUpdateManyWithoutCheckNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutCheckNestedInput;
};
export type CheckUncheckedUpdateWithoutCheckMappingsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
    scaPolicyId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    testChecks?: Prisma.TestCheckUncheckedUpdateManyWithoutCheckNestedInput;
    checkResults?: Prisma.CheckResultUncheckedUpdateManyWithoutCheckNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutCheckNestedInput;
};
export type CheckCreateWithoutScaPolicyInput = {
    id?: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
    testChecks?: Prisma.TestCheckCreateNestedManyWithoutCheckInput;
    checkMappings?: Prisma.CheckMappingCreateNestedManyWithoutCheckInput;
    checkResults?: Prisma.CheckResultCreateNestedManyWithoutCheckInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutCheckInput;
};
export type CheckUncheckedCreateWithoutScaPolicyInput = {
    id?: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
    testChecks?: Prisma.TestCheckUncheckedCreateNestedManyWithoutCheckInput;
    checkMappings?: Prisma.CheckMappingUncheckedCreateNestedManyWithoutCheckInput;
    checkResults?: Prisma.CheckResultUncheckedCreateNestedManyWithoutCheckInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutCheckInput;
};
export type CheckCreateOrConnectWithoutScaPolicyInput = {
    where: Prisma.CheckWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckCreateWithoutScaPolicyInput, Prisma.CheckUncheckedCreateWithoutScaPolicyInput>;
};
export type CheckCreateManyScaPolicyInputEnvelope = {
    data: Prisma.CheckCreateManyScaPolicyInput | Prisma.CheckCreateManyScaPolicyInput[];
    skipDuplicates?: boolean;
};
export type CheckUpsertWithWhereUniqueWithoutScaPolicyInput = {
    where: Prisma.CheckWhereUniqueInput;
    update: Prisma.XOR<Prisma.CheckUpdateWithoutScaPolicyInput, Prisma.CheckUncheckedUpdateWithoutScaPolicyInput>;
    create: Prisma.XOR<Prisma.CheckCreateWithoutScaPolicyInput, Prisma.CheckUncheckedCreateWithoutScaPolicyInput>;
};
export type CheckUpdateWithWhereUniqueWithoutScaPolicyInput = {
    where: Prisma.CheckWhereUniqueInput;
    data: Prisma.XOR<Prisma.CheckUpdateWithoutScaPolicyInput, Prisma.CheckUncheckedUpdateWithoutScaPolicyInput>;
};
export type CheckUpdateManyWithWhereWithoutScaPolicyInput = {
    where: Prisma.CheckScalarWhereInput;
    data: Prisma.XOR<Prisma.CheckUpdateManyMutationInput, Prisma.CheckUncheckedUpdateManyWithoutScaPolicyInput>;
};
export type CheckScalarWhereInput = {
    AND?: Prisma.CheckScalarWhereInput | Prisma.CheckScalarWhereInput[];
    OR?: Prisma.CheckScalarWhereInput[];
    NOT?: Prisma.CheckScalarWhereInput | Prisma.CheckScalarWhereInput[];
    id?: Prisma.UuidFilter<"Check"> | string;
    platform?: Prisma.StringFilter<"Check"> | string;
    policyId?: Prisma.StringFilter<"Check"> | string;
    checkId?: Prisma.StringFilter<"Check"> | string;
    titleEs?: Prisma.StringFilter<"Check"> | string;
    titleEn?: Prisma.StringFilter<"Check"> | string;
    condition?: Prisma.StringFilter<"Check"> | string;
    remediation?: Prisma.StringFilter<"Check"> | string;
    verificationRule?: Prisma.StringFilter<"Check"> | string;
    origin?: Prisma.EnumCheckOriginFilter<"Check"> | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFilter<"Check"> | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFilter<"Check"> | $Enums.MappingConfidence;
    scaPolicyId?: Prisma.UuidNullableFilter<"Check"> | string | null;
};
export type CheckCreateWithoutEvaluationsInput = {
    id?: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
    scaPolicy?: Prisma.ScaPolicyCreateNestedOneWithoutChecksInput;
    testChecks?: Prisma.TestCheckCreateNestedManyWithoutCheckInput;
    checkMappings?: Prisma.CheckMappingCreateNestedManyWithoutCheckInput;
    checkResults?: Prisma.CheckResultCreateNestedManyWithoutCheckInput;
};
export type CheckUncheckedCreateWithoutEvaluationsInput = {
    id?: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
    scaPolicyId?: string | null;
    testChecks?: Prisma.TestCheckUncheckedCreateNestedManyWithoutCheckInput;
    checkMappings?: Prisma.CheckMappingUncheckedCreateNestedManyWithoutCheckInput;
    checkResults?: Prisma.CheckResultUncheckedCreateNestedManyWithoutCheckInput;
};
export type CheckCreateOrConnectWithoutEvaluationsInput = {
    where: Prisma.CheckWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckCreateWithoutEvaluationsInput, Prisma.CheckUncheckedCreateWithoutEvaluationsInput>;
};
export type CheckUpsertWithoutEvaluationsInput = {
    update: Prisma.XOR<Prisma.CheckUpdateWithoutEvaluationsInput, Prisma.CheckUncheckedUpdateWithoutEvaluationsInput>;
    create: Prisma.XOR<Prisma.CheckCreateWithoutEvaluationsInput, Prisma.CheckUncheckedCreateWithoutEvaluationsInput>;
    where?: Prisma.CheckWhereInput;
};
export type CheckUpdateToOneWithWhereWithoutEvaluationsInput = {
    where?: Prisma.CheckWhereInput;
    data: Prisma.XOR<Prisma.CheckUpdateWithoutEvaluationsInput, Prisma.CheckUncheckedUpdateWithoutEvaluationsInput>;
};
export type CheckUpdateWithoutEvaluationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
    scaPolicy?: Prisma.ScaPolicyUpdateOneWithoutChecksNestedInput;
    testChecks?: Prisma.TestCheckUpdateManyWithoutCheckNestedInput;
    checkMappings?: Prisma.CheckMappingUpdateManyWithoutCheckNestedInput;
    checkResults?: Prisma.CheckResultUpdateManyWithoutCheckNestedInput;
};
export type CheckUncheckedUpdateWithoutEvaluationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
    scaPolicyId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    testChecks?: Prisma.TestCheckUncheckedUpdateManyWithoutCheckNestedInput;
    checkMappings?: Prisma.CheckMappingUncheckedUpdateManyWithoutCheckNestedInput;
    checkResults?: Prisma.CheckResultUncheckedUpdateManyWithoutCheckNestedInput;
};
export type CheckCreateWithoutCheckResultsInput = {
    id?: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
    scaPolicy?: Prisma.ScaPolicyCreateNestedOneWithoutChecksInput;
    testChecks?: Prisma.TestCheckCreateNestedManyWithoutCheckInput;
    checkMappings?: Prisma.CheckMappingCreateNestedManyWithoutCheckInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutCheckInput;
};
export type CheckUncheckedCreateWithoutCheckResultsInput = {
    id?: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
    scaPolicyId?: string | null;
    testChecks?: Prisma.TestCheckUncheckedCreateNestedManyWithoutCheckInput;
    checkMappings?: Prisma.CheckMappingUncheckedCreateNestedManyWithoutCheckInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutCheckInput;
};
export type CheckCreateOrConnectWithoutCheckResultsInput = {
    where: Prisma.CheckWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckCreateWithoutCheckResultsInput, Prisma.CheckUncheckedCreateWithoutCheckResultsInput>;
};
export type CheckUpsertWithoutCheckResultsInput = {
    update: Prisma.XOR<Prisma.CheckUpdateWithoutCheckResultsInput, Prisma.CheckUncheckedUpdateWithoutCheckResultsInput>;
    create: Prisma.XOR<Prisma.CheckCreateWithoutCheckResultsInput, Prisma.CheckUncheckedCreateWithoutCheckResultsInput>;
    where?: Prisma.CheckWhereInput;
};
export type CheckUpdateToOneWithWhereWithoutCheckResultsInput = {
    where?: Prisma.CheckWhereInput;
    data: Prisma.XOR<Prisma.CheckUpdateWithoutCheckResultsInput, Prisma.CheckUncheckedUpdateWithoutCheckResultsInput>;
};
export type CheckUpdateWithoutCheckResultsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
    scaPolicy?: Prisma.ScaPolicyUpdateOneWithoutChecksNestedInput;
    testChecks?: Prisma.TestCheckUpdateManyWithoutCheckNestedInput;
    checkMappings?: Prisma.CheckMappingUpdateManyWithoutCheckNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutCheckNestedInput;
};
export type CheckUncheckedUpdateWithoutCheckResultsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
    scaPolicyId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    testChecks?: Prisma.TestCheckUncheckedUpdateManyWithoutCheckNestedInput;
    checkMappings?: Prisma.CheckMappingUncheckedUpdateManyWithoutCheckNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutCheckNestedInput;
};
export type CheckCreateManyScaPolicyInput = {
    id?: string;
    platform: string;
    policyId: string;
    checkId: string;
    titleEs: string;
    titleEn: string;
    condition: string;
    remediation: string;
    verificationRule: string;
    origin: $Enums.CheckOrigin;
    mappingProvenance: string;
    mappingConfidence: $Enums.MappingConfidence;
};
export type CheckUpdateWithoutScaPolicyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
    testChecks?: Prisma.TestCheckUpdateManyWithoutCheckNestedInput;
    checkMappings?: Prisma.CheckMappingUpdateManyWithoutCheckNestedInput;
    checkResults?: Prisma.CheckResultUpdateManyWithoutCheckNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutCheckNestedInput;
};
export type CheckUncheckedUpdateWithoutScaPolicyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
    testChecks?: Prisma.TestCheckUncheckedUpdateManyWithoutCheckNestedInput;
    checkMappings?: Prisma.CheckMappingUncheckedUpdateManyWithoutCheckNestedInput;
    checkResults?: Prisma.CheckResultUncheckedUpdateManyWithoutCheckNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutCheckNestedInput;
};
export type CheckUncheckedUpdateManyWithoutScaPolicyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.StringFieldUpdateOperationsInput | string;
    policyId?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEs?: Prisma.StringFieldUpdateOperationsInput | string;
    titleEn?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    remediation?: Prisma.StringFieldUpdateOperationsInput | string;
    verificationRule?: Prisma.StringFieldUpdateOperationsInput | string;
    origin?: Prisma.EnumCheckOriginFieldUpdateOperationsInput | $Enums.CheckOrigin;
    mappingProvenance?: Prisma.StringFieldUpdateOperationsInput | string;
    mappingConfidence?: Prisma.EnumMappingConfidenceFieldUpdateOperationsInput | $Enums.MappingConfidence;
};
export type CheckCountOutputType = {
    testChecks: number;
    checkMappings: number;
    checkResults: number;
    evaluations: number;
};
export type CheckCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    testChecks?: boolean | CheckCountOutputTypeCountTestChecksArgs;
    checkMappings?: boolean | CheckCountOutputTypeCountCheckMappingsArgs;
    checkResults?: boolean | CheckCountOutputTypeCountCheckResultsArgs;
    evaluations?: boolean | CheckCountOutputTypeCountEvaluationsArgs;
};
export type CheckCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckCountOutputTypeSelect<ExtArgs> | null;
};
export type CheckCountOutputTypeCountTestChecksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TestCheckWhereInput;
};
export type CheckCountOutputTypeCountCheckMappingsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckMappingWhereInput;
};
export type CheckCountOutputTypeCountCheckResultsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckResultWhereInput;
};
export type CheckCountOutputTypeCountEvaluationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvaluationWhereInput;
};
export type CheckSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    platform?: boolean;
    policyId?: boolean;
    checkId?: boolean;
    titleEs?: boolean;
    titleEn?: boolean;
    condition?: boolean;
    remediation?: boolean;
    verificationRule?: boolean;
    origin?: boolean;
    mappingProvenance?: boolean;
    mappingConfidence?: boolean;
    scaPolicyId?: boolean;
    scaPolicy?: boolean | Prisma.Check$scaPolicyArgs<ExtArgs>;
    testChecks?: boolean | Prisma.Check$testChecksArgs<ExtArgs>;
    checkMappings?: boolean | Prisma.Check$checkMappingsArgs<ExtArgs>;
    checkResults?: boolean | Prisma.Check$checkResultsArgs<ExtArgs>;
    evaluations?: boolean | Prisma.Check$evaluationsArgs<ExtArgs>;
    _count?: boolean | Prisma.CheckCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["check"]>;
export type CheckSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    platform?: boolean;
    policyId?: boolean;
    checkId?: boolean;
    titleEs?: boolean;
    titleEn?: boolean;
    condition?: boolean;
    remediation?: boolean;
    verificationRule?: boolean;
    origin?: boolean;
    mappingProvenance?: boolean;
    mappingConfidence?: boolean;
    scaPolicyId?: boolean;
    scaPolicy?: boolean | Prisma.Check$scaPolicyArgs<ExtArgs>;
}, ExtArgs["result"]["check"]>;
export type CheckSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    platform?: boolean;
    policyId?: boolean;
    checkId?: boolean;
    titleEs?: boolean;
    titleEn?: boolean;
    condition?: boolean;
    remediation?: boolean;
    verificationRule?: boolean;
    origin?: boolean;
    mappingProvenance?: boolean;
    mappingConfidence?: boolean;
    scaPolicyId?: boolean;
    scaPolicy?: boolean | Prisma.Check$scaPolicyArgs<ExtArgs>;
}, ExtArgs["result"]["check"]>;
export type CheckSelectScalar = {
    id?: boolean;
    platform?: boolean;
    policyId?: boolean;
    checkId?: boolean;
    titleEs?: boolean;
    titleEn?: boolean;
    condition?: boolean;
    remediation?: boolean;
    verificationRule?: boolean;
    origin?: boolean;
    mappingProvenance?: boolean;
    mappingConfidence?: boolean;
    scaPolicyId?: boolean;
};
export type CheckOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "platform" | "policyId" | "checkId" | "titleEs" | "titleEn" | "condition" | "remediation" | "verificationRule" | "origin" | "mappingProvenance" | "mappingConfidence" | "scaPolicyId", ExtArgs["result"]["check"]>;
export type CheckInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    scaPolicy?: boolean | Prisma.Check$scaPolicyArgs<ExtArgs>;
    testChecks?: boolean | Prisma.Check$testChecksArgs<ExtArgs>;
    checkMappings?: boolean | Prisma.Check$checkMappingsArgs<ExtArgs>;
    checkResults?: boolean | Prisma.Check$checkResultsArgs<ExtArgs>;
    evaluations?: boolean | Prisma.Check$evaluationsArgs<ExtArgs>;
    _count?: boolean | Prisma.CheckCountOutputTypeDefaultArgs<ExtArgs>;
};
export type CheckIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    scaPolicy?: boolean | Prisma.Check$scaPolicyArgs<ExtArgs>;
};
export type CheckIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    scaPolicy?: boolean | Prisma.Check$scaPolicyArgs<ExtArgs>;
};
export type $CheckPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Check";
    objects: {
        scaPolicy: Prisma.$ScaPolicyPayload<ExtArgs> | null;
        testChecks: Prisma.$TestCheckPayload<ExtArgs>[];
        checkMappings: Prisma.$CheckMappingPayload<ExtArgs>[];
        checkResults: Prisma.$CheckResultPayload<ExtArgs>[];
        evaluations: Prisma.$EvaluationPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        platform: string;
        policyId: string;
        checkId: string;
        titleEs: string;
        titleEn: string;
        condition: string;
        remediation: string;
        verificationRule: string;
        origin: $Enums.CheckOrigin;
        mappingProvenance: string;
        mappingConfidence: $Enums.MappingConfidence;
        scaPolicyId: string | null;
    }, ExtArgs["result"]["check"]>;
    composites: {};
};
export type CheckGetPayload<S extends boolean | null | undefined | CheckDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CheckPayload, S>;
export type CheckCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CheckFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CheckCountAggregateInputType | true;
};
export interface CheckDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Check'];
        meta: {
            name: 'Check';
        };
    };
    findUnique<T extends CheckFindUniqueArgs>(args: Prisma.SelectSubset<T, CheckFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CheckFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CheckFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CheckFindFirstArgs>(args?: Prisma.SelectSubset<T, CheckFindFirstArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CheckFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CheckFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CheckFindManyArgs>(args?: Prisma.SelectSubset<T, CheckFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CheckCreateArgs>(args: Prisma.SelectSubset<T, CheckCreateArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CheckCreateManyArgs>(args?: Prisma.SelectSubset<T, CheckCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends CheckCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CheckCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends CheckDeleteArgs>(args: Prisma.SelectSubset<T, CheckDeleteArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CheckUpdateArgs>(args: Prisma.SelectSubset<T, CheckUpdateArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CheckDeleteManyArgs>(args?: Prisma.SelectSubset<T, CheckDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CheckUpdateManyArgs>(args: Prisma.SelectSubset<T, CheckUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends CheckUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CheckUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends CheckUpsertArgs>(args: Prisma.SelectSubset<T, CheckUpsertArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CheckCountArgs>(args?: Prisma.Subset<T, CheckCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CheckCountAggregateOutputType> : number>;
    aggregate<T extends CheckAggregateArgs>(args: Prisma.Subset<T, CheckAggregateArgs>): Prisma.PrismaPromise<GetCheckAggregateType<T>>;
    groupBy<T extends CheckGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CheckGroupByArgs['orderBy'];
    } : {
        orderBy?: CheckGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CheckGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCheckGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CheckFieldRefs;
}
export interface Prisma__CheckClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    scaPolicy<T extends Prisma.Check$scaPolicyArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Check$scaPolicyArgs<ExtArgs>>): Prisma.Prisma__ScaPolicyClient<runtime.Types.Result.GetResult<Prisma.$ScaPolicyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    testChecks<T extends Prisma.Check$testChecksArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Check$testChecksArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TestCheckPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    checkMappings<T extends Prisma.Check$checkMappingsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Check$checkMappingsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckMappingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    checkResults<T extends Prisma.Check$checkResultsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Check$checkResultsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckResultPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    evaluations<T extends Prisma.Check$evaluationsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Check$evaluationsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvaluationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CheckFieldRefs {
    readonly id: Prisma.FieldRef<"Check", 'String'>;
    readonly platform: Prisma.FieldRef<"Check", 'String'>;
    readonly policyId: Prisma.FieldRef<"Check", 'String'>;
    readonly checkId: Prisma.FieldRef<"Check", 'String'>;
    readonly titleEs: Prisma.FieldRef<"Check", 'String'>;
    readonly titleEn: Prisma.FieldRef<"Check", 'String'>;
    readonly condition: Prisma.FieldRef<"Check", 'String'>;
    readonly remediation: Prisma.FieldRef<"Check", 'String'>;
    readonly verificationRule: Prisma.FieldRef<"Check", 'String'>;
    readonly origin: Prisma.FieldRef<"Check", 'CheckOrigin'>;
    readonly mappingProvenance: Prisma.FieldRef<"Check", 'String'>;
    readonly mappingConfidence: Prisma.FieldRef<"Check", 'MappingConfidence'>;
    readonly scaPolicyId: Prisma.FieldRef<"Check", 'String'>;
}
export type CheckFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckSelect<ExtArgs> | null;
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    include?: Prisma.CheckInclude<ExtArgs> | null;
    where: Prisma.CheckWhereUniqueInput;
};
export type CheckFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckSelect<ExtArgs> | null;
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    include?: Prisma.CheckInclude<ExtArgs> | null;
    where: Prisma.CheckWhereUniqueInput;
};
export type CheckFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckSelect<ExtArgs> | null;
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    include?: Prisma.CheckInclude<ExtArgs> | null;
    where?: Prisma.CheckWhereInput;
    orderBy?: Prisma.CheckOrderByWithRelationInput | Prisma.CheckOrderByWithRelationInput[];
    cursor?: Prisma.CheckWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CheckScalarFieldEnum | Prisma.CheckScalarFieldEnum[];
};
export type CheckFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckSelect<ExtArgs> | null;
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    include?: Prisma.CheckInclude<ExtArgs> | null;
    where?: Prisma.CheckWhereInput;
    orderBy?: Prisma.CheckOrderByWithRelationInput | Prisma.CheckOrderByWithRelationInput[];
    cursor?: Prisma.CheckWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CheckScalarFieldEnum | Prisma.CheckScalarFieldEnum[];
};
export type CheckFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckSelect<ExtArgs> | null;
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    include?: Prisma.CheckInclude<ExtArgs> | null;
    where?: Prisma.CheckWhereInput;
    orderBy?: Prisma.CheckOrderByWithRelationInput | Prisma.CheckOrderByWithRelationInput[];
    cursor?: Prisma.CheckWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CheckScalarFieldEnum | Prisma.CheckScalarFieldEnum[];
};
export type CheckCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckSelect<ExtArgs> | null;
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    include?: Prisma.CheckInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CheckCreateInput, Prisma.CheckUncheckedCreateInput>;
};
export type CheckCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CheckCreateManyInput | Prisma.CheckCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CheckCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    data: Prisma.CheckCreateManyInput | Prisma.CheckCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.CheckIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type CheckUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckSelect<ExtArgs> | null;
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    include?: Prisma.CheckInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CheckUpdateInput, Prisma.CheckUncheckedUpdateInput>;
    where: Prisma.CheckWhereUniqueInput;
};
export type CheckUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CheckUpdateManyMutationInput, Prisma.CheckUncheckedUpdateManyInput>;
    where?: Prisma.CheckWhereInput;
    limit?: number;
};
export type CheckUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CheckUpdateManyMutationInput, Prisma.CheckUncheckedUpdateManyInput>;
    where?: Prisma.CheckWhereInput;
    limit?: number;
    include?: Prisma.CheckIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type CheckUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckSelect<ExtArgs> | null;
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    include?: Prisma.CheckInclude<ExtArgs> | null;
    where: Prisma.CheckWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckCreateInput, Prisma.CheckUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CheckUpdateInput, Prisma.CheckUncheckedUpdateInput>;
};
export type CheckDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckSelect<ExtArgs> | null;
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    include?: Prisma.CheckInclude<ExtArgs> | null;
    where: Prisma.CheckWhereUniqueInput;
};
export type CheckDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckWhereInput;
    limit?: number;
};
export type Check$scaPolicyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ScaPolicySelect<ExtArgs> | null;
    omit?: Prisma.ScaPolicyOmit<ExtArgs> | null;
    include?: Prisma.ScaPolicyInclude<ExtArgs> | null;
    where?: Prisma.ScaPolicyWhereInput;
};
export type Check$testChecksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestCheckSelect<ExtArgs> | null;
    omit?: Prisma.TestCheckOmit<ExtArgs> | null;
    include?: Prisma.TestCheckInclude<ExtArgs> | null;
    where?: Prisma.TestCheckWhereInput;
    orderBy?: Prisma.TestCheckOrderByWithRelationInput | Prisma.TestCheckOrderByWithRelationInput[];
    cursor?: Prisma.TestCheckWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TestCheckScalarFieldEnum | Prisma.TestCheckScalarFieldEnum[];
};
export type Check$checkMappingsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckMappingSelect<ExtArgs> | null;
    omit?: Prisma.CheckMappingOmit<ExtArgs> | null;
    include?: Prisma.CheckMappingInclude<ExtArgs> | null;
    where?: Prisma.CheckMappingWhereInput;
    orderBy?: Prisma.CheckMappingOrderByWithRelationInput | Prisma.CheckMappingOrderByWithRelationInput[];
    cursor?: Prisma.CheckMappingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CheckMappingScalarFieldEnum | Prisma.CheckMappingScalarFieldEnum[];
};
export type Check$checkResultsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckResultSelect<ExtArgs> | null;
    omit?: Prisma.CheckResultOmit<ExtArgs> | null;
    include?: Prisma.CheckResultInclude<ExtArgs> | null;
    where?: Prisma.CheckResultWhereInput;
    orderBy?: Prisma.CheckResultOrderByWithRelationInput | Prisma.CheckResultOrderByWithRelationInput[];
    cursor?: Prisma.CheckResultWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CheckResultScalarFieldEnum | Prisma.CheckResultScalarFieldEnum[];
};
export type Check$evaluationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvaluationSelect<ExtArgs> | null;
    omit?: Prisma.EvaluationOmit<ExtArgs> | null;
    include?: Prisma.EvaluationInclude<ExtArgs> | null;
    where?: Prisma.EvaluationWhereInput;
    orderBy?: Prisma.EvaluationOrderByWithRelationInput | Prisma.EvaluationOrderByWithRelationInput[];
    cursor?: Prisma.EvaluationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EvaluationScalarFieldEnum | Prisma.EvaluationScalarFieldEnum[];
};
export type CheckDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CheckSelect<ExtArgs> | null;
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    include?: Prisma.CheckInclude<ExtArgs> | null;
};
export {};
