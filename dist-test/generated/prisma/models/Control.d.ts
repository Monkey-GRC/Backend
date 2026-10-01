import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ControlModel = runtime.Types.Result.DefaultSelection<Prisma.$ControlPayload>;
export type AggregateControl = {
    _count: ControlCountAggregateOutputType | null;
    _min: ControlMinAggregateOutputType | null;
    _max: ControlMaxAggregateOutputType | null;
};
export type ControlMinAggregateOutputType = {
    id: string | null;
    code: string | null;
    domain: string | null;
    name: string | null;
    description: string | null;
    sourceRef: string | null;
};
export type ControlMaxAggregateOutputType = {
    id: string | null;
    code: string | null;
    domain: string | null;
    name: string | null;
    description: string | null;
    sourceRef: string | null;
};
export type ControlCountAggregateOutputType = {
    id: number;
    code: number;
    domain: number;
    name: number;
    description: number;
    sourceRef: number;
    _all: number;
};
export type ControlMinAggregateInputType = {
    id?: true;
    code?: true;
    domain?: true;
    name?: true;
    description?: true;
    sourceRef?: true;
};
export type ControlMaxAggregateInputType = {
    id?: true;
    code?: true;
    domain?: true;
    name?: true;
    description?: true;
    sourceRef?: true;
};
export type ControlCountAggregateInputType = {
    id?: true;
    code?: true;
    domain?: true;
    name?: true;
    description?: true;
    sourceRef?: true;
    _all?: true;
};
export type ControlAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlWhereInput;
    orderBy?: Prisma.ControlOrderByWithRelationInput | Prisma.ControlOrderByWithRelationInput[];
    cursor?: Prisma.ControlWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ControlCountAggregateInputType;
    _min?: ControlMinAggregateInputType;
    _max?: ControlMaxAggregateInputType;
};
export type GetControlAggregateType<T extends ControlAggregateArgs> = {
    [P in keyof T & keyof AggregateControl]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateControl[P]> : Prisma.GetScalarType<T[P], AggregateControl[P]>;
};
export type ControlGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlWhereInput;
    orderBy?: Prisma.ControlOrderByWithAggregationInput | Prisma.ControlOrderByWithAggregationInput[];
    by: Prisma.ControlScalarFieldEnum[] | Prisma.ControlScalarFieldEnum;
    having?: Prisma.ControlScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ControlCountAggregateInputType | true;
    _min?: ControlMinAggregateInputType;
    _max?: ControlMaxAggregateInputType;
};
export type ControlGroupByOutputType = {
    id: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef: string | null;
    _count: ControlCountAggregateOutputType | null;
    _min: ControlMinAggregateOutputType | null;
    _max: ControlMaxAggregateOutputType | null;
};
type GetControlGroupByPayload<T extends ControlGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ControlGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ControlGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ControlGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ControlGroupByOutputType[P]>;
}>>;
export type ControlWhereInput = {
    AND?: Prisma.ControlWhereInput | Prisma.ControlWhereInput[];
    OR?: Prisma.ControlWhereInput[];
    NOT?: Prisma.ControlWhereInput | Prisma.ControlWhereInput[];
    id?: Prisma.UuidFilter<"Control"> | string;
    code?: Prisma.StringFilter<"Control"> | string;
    domain?: Prisma.StringFilter<"Control"> | string;
    name?: Prisma.StringFilter<"Control"> | string;
    description?: Prisma.StringFilter<"Control"> | string;
    sourceRef?: Prisma.StringNullableFilter<"Control"> | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlListRelationFilter;
    dimensions?: Prisma.ControlDimensionEntryListRelationFilter;
    measurements?: Prisma.ControlMeasurementListRelationFilter;
    controlPolicies?: Prisma.ControlPolicyListRelationFilter;
    controlTests?: Prisma.ControlTestListRelationFilter;
    testPlans?: Prisma.TestPlanListRelationFilter;
    causeControl?: Prisma.CauseControlListRelationFilter;
    clientControls?: Prisma.ClientControlListRelationFilter;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateListRelationFilter;
};
export type ControlOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    domain?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrderInput | Prisma.SortOrder;
    pointOfFocusControls?: Prisma.PointOfFocusControlOrderByRelationAggregateInput;
    dimensions?: Prisma.ControlDimensionEntryOrderByRelationAggregateInput;
    measurements?: Prisma.ControlMeasurementOrderByRelationAggregateInput;
    controlPolicies?: Prisma.ControlPolicyOrderByRelationAggregateInput;
    controlTests?: Prisma.ControlTestOrderByRelationAggregateInput;
    testPlans?: Prisma.TestPlanOrderByRelationAggregateInput;
    causeControl?: Prisma.CauseControlOrderByRelationAggregateInput;
    clientControls?: Prisma.ClientControlOrderByRelationAggregateInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateOrderByRelationAggregateInput;
};
export type ControlWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    code?: string;
    AND?: Prisma.ControlWhereInput | Prisma.ControlWhereInput[];
    OR?: Prisma.ControlWhereInput[];
    NOT?: Prisma.ControlWhereInput | Prisma.ControlWhereInput[];
    domain?: Prisma.StringFilter<"Control"> | string;
    name?: Prisma.StringFilter<"Control"> | string;
    description?: Prisma.StringFilter<"Control"> | string;
    sourceRef?: Prisma.StringNullableFilter<"Control"> | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlListRelationFilter;
    dimensions?: Prisma.ControlDimensionEntryListRelationFilter;
    measurements?: Prisma.ControlMeasurementListRelationFilter;
    controlPolicies?: Prisma.ControlPolicyListRelationFilter;
    controlTests?: Prisma.ControlTestListRelationFilter;
    testPlans?: Prisma.TestPlanListRelationFilter;
    causeControl?: Prisma.CauseControlListRelationFilter;
    clientControls?: Prisma.ClientControlListRelationFilter;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateListRelationFilter;
}, "id" | "code">;
export type ControlOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    domain?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.ControlCountOrderByAggregateInput;
    _max?: Prisma.ControlMaxOrderByAggregateInput;
    _min?: Prisma.ControlMinOrderByAggregateInput;
};
export type ControlScalarWhereWithAggregatesInput = {
    AND?: Prisma.ControlScalarWhereWithAggregatesInput | Prisma.ControlScalarWhereWithAggregatesInput[];
    OR?: Prisma.ControlScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ControlScalarWhereWithAggregatesInput | Prisma.ControlScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Control"> | string;
    code?: Prisma.StringWithAggregatesFilter<"Control"> | string;
    domain?: Prisma.StringWithAggregatesFilter<"Control"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Control"> | string;
    description?: Prisma.StringWithAggregatesFilter<"Control"> | string;
    sourceRef?: Prisma.StringNullableWithAggregatesFilter<"Control"> | string | null;
};
export type ControlCreateInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateCreateNestedManyWithoutControlInput;
};
export type ControlUncheckedCreateInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementUncheckedCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestUncheckedCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanUncheckedCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlUncheckedCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlUncheckedCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedCreateNestedManyWithoutControlInput;
};
export type ControlUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUpdateManyWithoutControlNestedInput;
};
export type ControlUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUncheckedUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUncheckedUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUncheckedUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUncheckedUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUncheckedUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedUpdateManyWithoutControlNestedInput;
};
export type ControlCreateManyInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
};
export type ControlUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ControlUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ControlCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    domain?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrder;
};
export type ControlMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    domain?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrder;
};
export type ControlMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    domain?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrder;
};
export type ControlScalarRelationFilter = {
    is?: Prisma.ControlWhereInput;
    isNot?: Prisma.ControlWhereInput;
};
export type ControlNullableScalarRelationFilter = {
    is?: Prisma.ControlWhereInput | null;
    isNot?: Prisma.ControlWhereInput | null;
};
export type ControlCreateNestedOneWithoutPointOfFocusControlsInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutPointOfFocusControlsInput, Prisma.ControlUncheckedCreateWithoutPointOfFocusControlsInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutPointOfFocusControlsInput;
    connect?: Prisma.ControlWhereUniqueInput;
};
export type ControlUpdateOneRequiredWithoutPointOfFocusControlsNestedInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutPointOfFocusControlsInput, Prisma.ControlUncheckedCreateWithoutPointOfFocusControlsInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutPointOfFocusControlsInput;
    upsert?: Prisma.ControlUpsertWithoutPointOfFocusControlsInput;
    connect?: Prisma.ControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ControlUpdateToOneWithWhereWithoutPointOfFocusControlsInput, Prisma.ControlUpdateWithoutPointOfFocusControlsInput>, Prisma.ControlUncheckedUpdateWithoutPointOfFocusControlsInput>;
};
export type ControlCreateNestedOneWithoutDimensionsInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutDimensionsInput, Prisma.ControlUncheckedCreateWithoutDimensionsInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutDimensionsInput;
    connect?: Prisma.ControlWhereUniqueInput;
};
export type ControlUpdateOneRequiredWithoutDimensionsNestedInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutDimensionsInput, Prisma.ControlUncheckedCreateWithoutDimensionsInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutDimensionsInput;
    upsert?: Prisma.ControlUpsertWithoutDimensionsInput;
    connect?: Prisma.ControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ControlUpdateToOneWithWhereWithoutDimensionsInput, Prisma.ControlUpdateWithoutDimensionsInput>, Prisma.ControlUncheckedUpdateWithoutDimensionsInput>;
};
export type ControlCreateNestedOneWithoutMeasurementsInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutMeasurementsInput, Prisma.ControlUncheckedCreateWithoutMeasurementsInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutMeasurementsInput;
    connect?: Prisma.ControlWhereUniqueInput;
};
export type ControlUpdateOneRequiredWithoutMeasurementsNestedInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutMeasurementsInput, Prisma.ControlUncheckedCreateWithoutMeasurementsInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutMeasurementsInput;
    upsert?: Prisma.ControlUpsertWithoutMeasurementsInput;
    connect?: Prisma.ControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ControlUpdateToOneWithWhereWithoutMeasurementsInput, Prisma.ControlUpdateWithoutMeasurementsInput>, Prisma.ControlUncheckedUpdateWithoutMeasurementsInput>;
};
export type ControlCreateNestedOneWithoutControlPoliciesInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutControlPoliciesInput, Prisma.ControlUncheckedCreateWithoutControlPoliciesInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutControlPoliciesInput;
    connect?: Prisma.ControlWhereUniqueInput;
};
export type ControlUpdateOneRequiredWithoutControlPoliciesNestedInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutControlPoliciesInput, Prisma.ControlUncheckedCreateWithoutControlPoliciesInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutControlPoliciesInput;
    upsert?: Prisma.ControlUpsertWithoutControlPoliciesInput;
    connect?: Prisma.ControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ControlUpdateToOneWithWhereWithoutControlPoliciesInput, Prisma.ControlUpdateWithoutControlPoliciesInput>, Prisma.ControlUncheckedUpdateWithoutControlPoliciesInput>;
};
export type ControlCreateNestedOneWithoutEvidenceTemplatesInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutEvidenceTemplatesInput, Prisma.ControlUncheckedCreateWithoutEvidenceTemplatesInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutEvidenceTemplatesInput;
    connect?: Prisma.ControlWhereUniqueInput;
};
export type ControlUpdateOneRequiredWithoutEvidenceTemplatesNestedInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutEvidenceTemplatesInput, Prisma.ControlUncheckedCreateWithoutEvidenceTemplatesInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutEvidenceTemplatesInput;
    upsert?: Prisma.ControlUpsertWithoutEvidenceTemplatesInput;
    connect?: Prisma.ControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ControlUpdateToOneWithWhereWithoutEvidenceTemplatesInput, Prisma.ControlUpdateWithoutEvidenceTemplatesInput>, Prisma.ControlUncheckedUpdateWithoutEvidenceTemplatesInput>;
};
export type ControlCreateNestedOneWithoutCauseControlInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutCauseControlInput, Prisma.ControlUncheckedCreateWithoutCauseControlInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutCauseControlInput;
    connect?: Prisma.ControlWhereUniqueInput;
};
export type ControlUpdateOneRequiredWithoutCauseControlNestedInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutCauseControlInput, Prisma.ControlUncheckedCreateWithoutCauseControlInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutCauseControlInput;
    upsert?: Prisma.ControlUpsertWithoutCauseControlInput;
    connect?: Prisma.ControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ControlUpdateToOneWithWhereWithoutCauseControlInput, Prisma.ControlUpdateWithoutCauseControlInput>, Prisma.ControlUncheckedUpdateWithoutCauseControlInput>;
};
export type ControlCreateNestedOneWithoutTestPlansInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutTestPlansInput, Prisma.ControlUncheckedCreateWithoutTestPlansInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutTestPlansInput;
    connect?: Prisma.ControlWhereUniqueInput;
};
export type ControlUpdateOneRequiredWithoutTestPlansNestedInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutTestPlansInput, Prisma.ControlUncheckedCreateWithoutTestPlansInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutTestPlansInput;
    upsert?: Prisma.ControlUpsertWithoutTestPlansInput;
    connect?: Prisma.ControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ControlUpdateToOneWithWhereWithoutTestPlansInput, Prisma.ControlUpdateWithoutTestPlansInput>, Prisma.ControlUncheckedUpdateWithoutTestPlansInput>;
};
export type ControlCreateNestedOneWithoutControlTestsInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutControlTestsInput, Prisma.ControlUncheckedCreateWithoutControlTestsInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutControlTestsInput;
    connect?: Prisma.ControlWhereUniqueInput;
};
export type ControlUpdateOneRequiredWithoutControlTestsNestedInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutControlTestsInput, Prisma.ControlUncheckedCreateWithoutControlTestsInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutControlTestsInput;
    upsert?: Prisma.ControlUpsertWithoutControlTestsInput;
    connect?: Prisma.ControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ControlUpdateToOneWithWhereWithoutControlTestsInput, Prisma.ControlUpdateWithoutControlTestsInput>, Prisma.ControlUncheckedUpdateWithoutControlTestsInput>;
};
export type ControlCreateNestedOneWithoutClientControlsInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutClientControlsInput, Prisma.ControlUncheckedCreateWithoutClientControlsInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutClientControlsInput;
    connect?: Prisma.ControlWhereUniqueInput;
};
export type ControlUpdateOneWithoutClientControlsNestedInput = {
    create?: Prisma.XOR<Prisma.ControlCreateWithoutClientControlsInput, Prisma.ControlUncheckedCreateWithoutClientControlsInput>;
    connectOrCreate?: Prisma.ControlCreateOrConnectWithoutClientControlsInput;
    upsert?: Prisma.ControlUpsertWithoutClientControlsInput;
    disconnect?: Prisma.ControlWhereInput | boolean;
    delete?: Prisma.ControlWhereInput | boolean;
    connect?: Prisma.ControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ControlUpdateToOneWithWhereWithoutClientControlsInput, Prisma.ControlUpdateWithoutClientControlsInput>, Prisma.ControlUncheckedUpdateWithoutClientControlsInput>;
};
export type ControlCreateWithoutPointOfFocusControlsInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    dimensions?: Prisma.ControlDimensionEntryCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateCreateNestedManyWithoutControlInput;
};
export type ControlUncheckedCreateWithoutPointOfFocusControlsInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    dimensions?: Prisma.ControlDimensionEntryUncheckedCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementUncheckedCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestUncheckedCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanUncheckedCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlUncheckedCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlUncheckedCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedCreateNestedManyWithoutControlInput;
};
export type ControlCreateOrConnectWithoutPointOfFocusControlsInput = {
    where: Prisma.ControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlCreateWithoutPointOfFocusControlsInput, Prisma.ControlUncheckedCreateWithoutPointOfFocusControlsInput>;
};
export type ControlUpsertWithoutPointOfFocusControlsInput = {
    update: Prisma.XOR<Prisma.ControlUpdateWithoutPointOfFocusControlsInput, Prisma.ControlUncheckedUpdateWithoutPointOfFocusControlsInput>;
    create: Prisma.XOR<Prisma.ControlCreateWithoutPointOfFocusControlsInput, Prisma.ControlUncheckedCreateWithoutPointOfFocusControlsInput>;
    where?: Prisma.ControlWhereInput;
};
export type ControlUpdateToOneWithWhereWithoutPointOfFocusControlsInput = {
    where?: Prisma.ControlWhereInput;
    data: Prisma.XOR<Prisma.ControlUpdateWithoutPointOfFocusControlsInput, Prisma.ControlUncheckedUpdateWithoutPointOfFocusControlsInput>;
};
export type ControlUpdateWithoutPointOfFocusControlsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dimensions?: Prisma.ControlDimensionEntryUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUpdateManyWithoutControlNestedInput;
};
export type ControlUncheckedUpdateWithoutPointOfFocusControlsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    dimensions?: Prisma.ControlDimensionEntryUncheckedUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUncheckedUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUncheckedUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUncheckedUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUncheckedUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUncheckedUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedUpdateManyWithoutControlNestedInput;
};
export type ControlCreateWithoutDimensionsInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateCreateNestedManyWithoutControlInput;
};
export type ControlUncheckedCreateWithoutDimensionsInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementUncheckedCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestUncheckedCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanUncheckedCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlUncheckedCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlUncheckedCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedCreateNestedManyWithoutControlInput;
};
export type ControlCreateOrConnectWithoutDimensionsInput = {
    where: Prisma.ControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlCreateWithoutDimensionsInput, Prisma.ControlUncheckedCreateWithoutDimensionsInput>;
};
export type ControlUpsertWithoutDimensionsInput = {
    update: Prisma.XOR<Prisma.ControlUpdateWithoutDimensionsInput, Prisma.ControlUncheckedUpdateWithoutDimensionsInput>;
    create: Prisma.XOR<Prisma.ControlCreateWithoutDimensionsInput, Prisma.ControlUncheckedCreateWithoutDimensionsInput>;
    where?: Prisma.ControlWhereInput;
};
export type ControlUpdateToOneWithWhereWithoutDimensionsInput = {
    where?: Prisma.ControlWhereInput;
    data: Prisma.XOR<Prisma.ControlUpdateWithoutDimensionsInput, Prisma.ControlUncheckedUpdateWithoutDimensionsInput>;
};
export type ControlUpdateWithoutDimensionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUpdateManyWithoutControlNestedInput;
};
export type ControlUncheckedUpdateWithoutDimensionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUncheckedUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUncheckedUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUncheckedUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUncheckedUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUncheckedUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedUpdateManyWithoutControlNestedInput;
};
export type ControlCreateWithoutMeasurementsInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateCreateNestedManyWithoutControlInput;
};
export type ControlUncheckedCreateWithoutMeasurementsInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestUncheckedCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanUncheckedCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlUncheckedCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlUncheckedCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedCreateNestedManyWithoutControlInput;
};
export type ControlCreateOrConnectWithoutMeasurementsInput = {
    where: Prisma.ControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlCreateWithoutMeasurementsInput, Prisma.ControlUncheckedCreateWithoutMeasurementsInput>;
};
export type ControlUpsertWithoutMeasurementsInput = {
    update: Prisma.XOR<Prisma.ControlUpdateWithoutMeasurementsInput, Prisma.ControlUncheckedUpdateWithoutMeasurementsInput>;
    create: Prisma.XOR<Prisma.ControlCreateWithoutMeasurementsInput, Prisma.ControlUncheckedCreateWithoutMeasurementsInput>;
    where?: Prisma.ControlWhereInput;
};
export type ControlUpdateToOneWithWhereWithoutMeasurementsInput = {
    where?: Prisma.ControlWhereInput;
    data: Prisma.XOR<Prisma.ControlUpdateWithoutMeasurementsInput, Prisma.ControlUncheckedUpdateWithoutMeasurementsInput>;
};
export type ControlUpdateWithoutMeasurementsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUpdateManyWithoutControlNestedInput;
};
export type ControlUncheckedUpdateWithoutMeasurementsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUncheckedUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUncheckedUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUncheckedUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUncheckedUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedUpdateManyWithoutControlNestedInput;
};
export type ControlCreateWithoutControlPoliciesInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateCreateNestedManyWithoutControlInput;
};
export type ControlUncheckedCreateWithoutControlPoliciesInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementUncheckedCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestUncheckedCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanUncheckedCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlUncheckedCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlUncheckedCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedCreateNestedManyWithoutControlInput;
};
export type ControlCreateOrConnectWithoutControlPoliciesInput = {
    where: Prisma.ControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlCreateWithoutControlPoliciesInput, Prisma.ControlUncheckedCreateWithoutControlPoliciesInput>;
};
export type ControlUpsertWithoutControlPoliciesInput = {
    update: Prisma.XOR<Prisma.ControlUpdateWithoutControlPoliciesInput, Prisma.ControlUncheckedUpdateWithoutControlPoliciesInput>;
    create: Prisma.XOR<Prisma.ControlCreateWithoutControlPoliciesInput, Prisma.ControlUncheckedCreateWithoutControlPoliciesInput>;
    where?: Prisma.ControlWhereInput;
};
export type ControlUpdateToOneWithWhereWithoutControlPoliciesInput = {
    where?: Prisma.ControlWhereInput;
    data: Prisma.XOR<Prisma.ControlUpdateWithoutControlPoliciesInput, Prisma.ControlUncheckedUpdateWithoutControlPoliciesInput>;
};
export type ControlUpdateWithoutControlPoliciesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUpdateManyWithoutControlNestedInput;
};
export type ControlUncheckedUpdateWithoutControlPoliciesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUncheckedUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUncheckedUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUncheckedUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUncheckedUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUncheckedUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedUpdateManyWithoutControlNestedInput;
};
export type ControlCreateWithoutEvidenceTemplatesInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlCreateNestedManyWithoutControlInput;
};
export type ControlUncheckedCreateWithoutEvidenceTemplatesInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementUncheckedCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestUncheckedCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanUncheckedCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlUncheckedCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlUncheckedCreateNestedManyWithoutControlInput;
};
export type ControlCreateOrConnectWithoutEvidenceTemplatesInput = {
    where: Prisma.ControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlCreateWithoutEvidenceTemplatesInput, Prisma.ControlUncheckedCreateWithoutEvidenceTemplatesInput>;
};
export type ControlUpsertWithoutEvidenceTemplatesInput = {
    update: Prisma.XOR<Prisma.ControlUpdateWithoutEvidenceTemplatesInput, Prisma.ControlUncheckedUpdateWithoutEvidenceTemplatesInput>;
    create: Prisma.XOR<Prisma.ControlCreateWithoutEvidenceTemplatesInput, Prisma.ControlUncheckedCreateWithoutEvidenceTemplatesInput>;
    where?: Prisma.ControlWhereInput;
};
export type ControlUpdateToOneWithWhereWithoutEvidenceTemplatesInput = {
    where?: Prisma.ControlWhereInput;
    data: Prisma.XOR<Prisma.ControlUpdateWithoutEvidenceTemplatesInput, Prisma.ControlUncheckedUpdateWithoutEvidenceTemplatesInput>;
};
export type ControlUpdateWithoutEvidenceTemplatesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUpdateManyWithoutControlNestedInput;
};
export type ControlUncheckedUpdateWithoutEvidenceTemplatesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUncheckedUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUncheckedUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUncheckedUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUncheckedUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUncheckedUpdateManyWithoutControlNestedInput;
};
export type ControlCreateWithoutCauseControlInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateCreateNestedManyWithoutControlInput;
};
export type ControlUncheckedCreateWithoutCauseControlInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementUncheckedCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestUncheckedCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanUncheckedCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlUncheckedCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedCreateNestedManyWithoutControlInput;
};
export type ControlCreateOrConnectWithoutCauseControlInput = {
    where: Prisma.ControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlCreateWithoutCauseControlInput, Prisma.ControlUncheckedCreateWithoutCauseControlInput>;
};
export type ControlUpsertWithoutCauseControlInput = {
    update: Prisma.XOR<Prisma.ControlUpdateWithoutCauseControlInput, Prisma.ControlUncheckedUpdateWithoutCauseControlInput>;
    create: Prisma.XOR<Prisma.ControlCreateWithoutCauseControlInput, Prisma.ControlUncheckedCreateWithoutCauseControlInput>;
    where?: Prisma.ControlWhereInput;
};
export type ControlUpdateToOneWithWhereWithoutCauseControlInput = {
    where?: Prisma.ControlWhereInput;
    data: Prisma.XOR<Prisma.ControlUpdateWithoutCauseControlInput, Prisma.ControlUncheckedUpdateWithoutCauseControlInput>;
};
export type ControlUpdateWithoutCauseControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUpdateManyWithoutControlNestedInput;
};
export type ControlUncheckedUpdateWithoutCauseControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUncheckedUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUncheckedUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUncheckedUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUncheckedUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedUpdateManyWithoutControlNestedInput;
};
export type ControlCreateWithoutTestPlansInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateCreateNestedManyWithoutControlInput;
};
export type ControlUncheckedCreateWithoutTestPlansInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementUncheckedCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestUncheckedCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlUncheckedCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlUncheckedCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedCreateNestedManyWithoutControlInput;
};
export type ControlCreateOrConnectWithoutTestPlansInput = {
    where: Prisma.ControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlCreateWithoutTestPlansInput, Prisma.ControlUncheckedCreateWithoutTestPlansInput>;
};
export type ControlUpsertWithoutTestPlansInput = {
    update: Prisma.XOR<Prisma.ControlUpdateWithoutTestPlansInput, Prisma.ControlUncheckedUpdateWithoutTestPlansInput>;
    create: Prisma.XOR<Prisma.ControlCreateWithoutTestPlansInput, Prisma.ControlUncheckedCreateWithoutTestPlansInput>;
    where?: Prisma.ControlWhereInput;
};
export type ControlUpdateToOneWithWhereWithoutTestPlansInput = {
    where?: Prisma.ControlWhereInput;
    data: Prisma.XOR<Prisma.ControlUpdateWithoutTestPlansInput, Prisma.ControlUncheckedUpdateWithoutTestPlansInput>;
};
export type ControlUpdateWithoutTestPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUpdateManyWithoutControlNestedInput;
};
export type ControlUncheckedUpdateWithoutTestPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUncheckedUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUncheckedUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUncheckedUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUncheckedUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedUpdateManyWithoutControlNestedInput;
};
export type ControlCreateWithoutControlTestsInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateCreateNestedManyWithoutControlInput;
};
export type ControlUncheckedCreateWithoutControlTestsInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementUncheckedCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanUncheckedCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlUncheckedCreateNestedManyWithoutControlInput;
    clientControls?: Prisma.ClientControlUncheckedCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedCreateNestedManyWithoutControlInput;
};
export type ControlCreateOrConnectWithoutControlTestsInput = {
    where: Prisma.ControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlCreateWithoutControlTestsInput, Prisma.ControlUncheckedCreateWithoutControlTestsInput>;
};
export type ControlUpsertWithoutControlTestsInput = {
    update: Prisma.XOR<Prisma.ControlUpdateWithoutControlTestsInput, Prisma.ControlUncheckedUpdateWithoutControlTestsInput>;
    create: Prisma.XOR<Prisma.ControlCreateWithoutControlTestsInput, Prisma.ControlUncheckedCreateWithoutControlTestsInput>;
    where?: Prisma.ControlWhereInput;
};
export type ControlUpdateToOneWithWhereWithoutControlTestsInput = {
    where?: Prisma.ControlWhereInput;
    data: Prisma.XOR<Prisma.ControlUpdateWithoutControlTestsInput, Prisma.ControlUncheckedUpdateWithoutControlTestsInput>;
};
export type ControlUpdateWithoutControlTestsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUpdateManyWithoutControlNestedInput;
};
export type ControlUncheckedUpdateWithoutControlTestsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUncheckedUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUncheckedUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUncheckedUpdateManyWithoutControlNestedInput;
    clientControls?: Prisma.ClientControlUncheckedUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedUpdateManyWithoutControlNestedInput;
};
export type ControlCreateWithoutClientControlsInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateCreateNestedManyWithoutControlInput;
};
export type ControlUncheckedCreateWithoutClientControlsInput = {
    id?: string;
    code: string;
    domain: string;
    name: string;
    description: string;
    sourceRef?: string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedCreateNestedManyWithoutControlInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedCreateNestedManyWithoutControlInput;
    measurements?: Prisma.ControlMeasurementUncheckedCreateNestedManyWithoutControlInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedCreateNestedManyWithoutControlInput;
    controlTests?: Prisma.ControlTestUncheckedCreateNestedManyWithoutControlInput;
    testPlans?: Prisma.TestPlanUncheckedCreateNestedManyWithoutControlInput;
    causeControl?: Prisma.CauseControlUncheckedCreateNestedManyWithoutControlInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedCreateNestedManyWithoutControlInput;
};
export type ControlCreateOrConnectWithoutClientControlsInput = {
    where: Prisma.ControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlCreateWithoutClientControlsInput, Prisma.ControlUncheckedCreateWithoutClientControlsInput>;
};
export type ControlUpsertWithoutClientControlsInput = {
    update: Prisma.XOR<Prisma.ControlUpdateWithoutClientControlsInput, Prisma.ControlUncheckedUpdateWithoutClientControlsInput>;
    create: Prisma.XOR<Prisma.ControlCreateWithoutClientControlsInput, Prisma.ControlUncheckedCreateWithoutClientControlsInput>;
    where?: Prisma.ControlWhereInput;
};
export type ControlUpdateToOneWithWhereWithoutClientControlsInput = {
    where?: Prisma.ControlWhereInput;
    data: Prisma.XOR<Prisma.ControlUpdateWithoutClientControlsInput, Prisma.ControlUncheckedUpdateWithoutClientControlsInput>;
};
export type ControlUpdateWithoutClientControlsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUpdateManyWithoutControlNestedInput;
};
export type ControlUncheckedUpdateWithoutClientControlsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    domain?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pointOfFocusControls?: Prisma.PointOfFocusControlUncheckedUpdateManyWithoutControlNestedInput;
    dimensions?: Prisma.ControlDimensionEntryUncheckedUpdateManyWithoutControlNestedInput;
    measurements?: Prisma.ControlMeasurementUncheckedUpdateManyWithoutControlNestedInput;
    controlPolicies?: Prisma.ControlPolicyUncheckedUpdateManyWithoutControlNestedInput;
    controlTests?: Prisma.ControlTestUncheckedUpdateManyWithoutControlNestedInput;
    testPlans?: Prisma.TestPlanUncheckedUpdateManyWithoutControlNestedInput;
    causeControl?: Prisma.CauseControlUncheckedUpdateManyWithoutControlNestedInput;
    evidenceTemplates?: Prisma.ControlEvidenceTemplateUncheckedUpdateManyWithoutControlNestedInput;
};
export type ControlCountOutputType = {
    pointOfFocusControls: number;
    dimensions: number;
    measurements: number;
    controlPolicies: number;
    controlTests: number;
    testPlans: number;
    causeControl: number;
    clientControls: number;
    evidenceTemplates: number;
};
export type ControlCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    pointOfFocusControls?: boolean | ControlCountOutputTypeCountPointOfFocusControlsArgs;
    dimensions?: boolean | ControlCountOutputTypeCountDimensionsArgs;
    measurements?: boolean | ControlCountOutputTypeCountMeasurementsArgs;
    controlPolicies?: boolean | ControlCountOutputTypeCountControlPoliciesArgs;
    controlTests?: boolean | ControlCountOutputTypeCountControlTestsArgs;
    testPlans?: boolean | ControlCountOutputTypeCountTestPlansArgs;
    causeControl?: boolean | ControlCountOutputTypeCountCauseControlArgs;
    clientControls?: boolean | ControlCountOutputTypeCountClientControlsArgs;
    evidenceTemplates?: boolean | ControlCountOutputTypeCountEvidenceTemplatesArgs;
};
export type ControlCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlCountOutputTypeSelect<ExtArgs> | null;
};
export type ControlCountOutputTypeCountPointOfFocusControlsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PointOfFocusControlWhereInput;
};
export type ControlCountOutputTypeCountDimensionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlDimensionEntryWhereInput;
};
export type ControlCountOutputTypeCountMeasurementsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlMeasurementWhereInput;
};
export type ControlCountOutputTypeCountControlPoliciesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlPolicyWhereInput;
};
export type ControlCountOutputTypeCountControlTestsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlTestWhereInput;
};
export type ControlCountOutputTypeCountTestPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TestPlanWhereInput;
};
export type ControlCountOutputTypeCountCauseControlArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CauseControlWhereInput;
};
export type ControlCountOutputTypeCountClientControlsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientControlWhereInput;
};
export type ControlCountOutputTypeCountEvidenceTemplatesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlEvidenceTemplateWhereInput;
};
export type ControlSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    domain?: boolean;
    name?: boolean;
    description?: boolean;
    sourceRef?: boolean;
    pointOfFocusControls?: boolean | Prisma.Control$pointOfFocusControlsArgs<ExtArgs>;
    dimensions?: boolean | Prisma.Control$dimensionsArgs<ExtArgs>;
    measurements?: boolean | Prisma.Control$measurementsArgs<ExtArgs>;
    controlPolicies?: boolean | Prisma.Control$controlPoliciesArgs<ExtArgs>;
    controlTests?: boolean | Prisma.Control$controlTestsArgs<ExtArgs>;
    testPlans?: boolean | Prisma.Control$testPlansArgs<ExtArgs>;
    causeControl?: boolean | Prisma.Control$causeControlArgs<ExtArgs>;
    clientControls?: boolean | Prisma.Control$clientControlsArgs<ExtArgs>;
    evidenceTemplates?: boolean | Prisma.Control$evidenceTemplatesArgs<ExtArgs>;
    _count?: boolean | Prisma.ControlCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["control"]>;
export type ControlSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    domain?: boolean;
    name?: boolean;
    description?: boolean;
    sourceRef?: boolean;
}, ExtArgs["result"]["control"]>;
export type ControlSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    domain?: boolean;
    name?: boolean;
    description?: boolean;
    sourceRef?: boolean;
}, ExtArgs["result"]["control"]>;
export type ControlSelectScalar = {
    id?: boolean;
    code?: boolean;
    domain?: boolean;
    name?: boolean;
    description?: boolean;
    sourceRef?: boolean;
};
export type ControlOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "code" | "domain" | "name" | "description" | "sourceRef", ExtArgs["result"]["control"]>;
export type ControlInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    pointOfFocusControls?: boolean | Prisma.Control$pointOfFocusControlsArgs<ExtArgs>;
    dimensions?: boolean | Prisma.Control$dimensionsArgs<ExtArgs>;
    measurements?: boolean | Prisma.Control$measurementsArgs<ExtArgs>;
    controlPolicies?: boolean | Prisma.Control$controlPoliciesArgs<ExtArgs>;
    controlTests?: boolean | Prisma.Control$controlTestsArgs<ExtArgs>;
    testPlans?: boolean | Prisma.Control$testPlansArgs<ExtArgs>;
    causeControl?: boolean | Prisma.Control$causeControlArgs<ExtArgs>;
    clientControls?: boolean | Prisma.Control$clientControlsArgs<ExtArgs>;
    evidenceTemplates?: boolean | Prisma.Control$evidenceTemplatesArgs<ExtArgs>;
    _count?: boolean | Prisma.ControlCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ControlIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type ControlIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $ControlPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Control";
    objects: {
        pointOfFocusControls: Prisma.$PointOfFocusControlPayload<ExtArgs>[];
        dimensions: Prisma.$ControlDimensionEntryPayload<ExtArgs>[];
        measurements: Prisma.$ControlMeasurementPayload<ExtArgs>[];
        controlPolicies: Prisma.$ControlPolicyPayload<ExtArgs>[];
        controlTests: Prisma.$ControlTestPayload<ExtArgs>[];
        testPlans: Prisma.$TestPlanPayload<ExtArgs>[];
        causeControl: Prisma.$CauseControlPayload<ExtArgs>[];
        clientControls: Prisma.$ClientControlPayload<ExtArgs>[];
        evidenceTemplates: Prisma.$ControlEvidenceTemplatePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        code: string;
        domain: string;
        name: string;
        description: string;
        sourceRef: string | null;
    }, ExtArgs["result"]["control"]>;
    composites: {};
};
export type ControlGetPayload<S extends boolean | null | undefined | ControlDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ControlPayload, S>;
export type ControlCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ControlFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ControlCountAggregateInputType | true;
};
export interface ControlDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Control'];
        meta: {
            name: 'Control';
        };
    };
    findUnique<T extends ControlFindUniqueArgs>(args: Prisma.SelectSubset<T, ControlFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ControlFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ControlFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ControlFindFirstArgs>(args?: Prisma.SelectSubset<T, ControlFindFirstArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ControlFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ControlFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ControlFindManyArgs>(args?: Prisma.SelectSubset<T, ControlFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ControlCreateArgs>(args: Prisma.SelectSubset<T, ControlCreateArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ControlCreateManyArgs>(args?: Prisma.SelectSubset<T, ControlCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ControlCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ControlCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ControlDeleteArgs>(args: Prisma.SelectSubset<T, ControlDeleteArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ControlUpdateArgs>(args: Prisma.SelectSubset<T, ControlUpdateArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ControlDeleteManyArgs>(args?: Prisma.SelectSubset<T, ControlDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ControlUpdateManyArgs>(args: Prisma.SelectSubset<T, ControlUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ControlUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ControlUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ControlUpsertArgs>(args: Prisma.SelectSubset<T, ControlUpsertArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ControlCountArgs>(args?: Prisma.Subset<T, ControlCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ControlCountAggregateOutputType> : number>;
    aggregate<T extends ControlAggregateArgs>(args: Prisma.Subset<T, ControlAggregateArgs>): Prisma.PrismaPromise<GetControlAggregateType<T>>;
    groupBy<T extends ControlGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ControlGroupByArgs['orderBy'];
    } : {
        orderBy?: ControlGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ControlGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetControlGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ControlFieldRefs;
}
export interface Prisma__ControlClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    pointOfFocusControls<T extends Prisma.Control$pointOfFocusControlsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Control$pointOfFocusControlsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PointOfFocusControlPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    dimensions<T extends Prisma.Control$dimensionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Control$dimensionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlDimensionEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    measurements<T extends Prisma.Control$measurementsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Control$measurementsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlMeasurementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    controlPolicies<T extends Prisma.Control$controlPoliciesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Control$controlPoliciesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlPolicyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    controlTests<T extends Prisma.Control$controlTestsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Control$controlTestsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlTestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    testPlans<T extends Prisma.Control$testPlansArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Control$testPlansArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TestPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    causeControl<T extends Prisma.Control$causeControlArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Control$causeControlArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CauseControlPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    clientControls<T extends Prisma.Control$clientControlsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Control$clientControlsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    evidenceTemplates<T extends Prisma.Control$evidenceTemplatesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Control$evidenceTemplatesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ControlEvidenceTemplatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ControlFieldRefs {
    readonly id: Prisma.FieldRef<"Control", 'String'>;
    readonly code: Prisma.FieldRef<"Control", 'String'>;
    readonly domain: Prisma.FieldRef<"Control", 'String'>;
    readonly name: Prisma.FieldRef<"Control", 'String'>;
    readonly description: Prisma.FieldRef<"Control", 'String'>;
    readonly sourceRef: Prisma.FieldRef<"Control", 'String'>;
}
export type ControlFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlSelect<ExtArgs> | null;
    omit?: Prisma.ControlOmit<ExtArgs> | null;
    include?: Prisma.ControlInclude<ExtArgs> | null;
    where: Prisma.ControlWhereUniqueInput;
};
export type ControlFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlSelect<ExtArgs> | null;
    omit?: Prisma.ControlOmit<ExtArgs> | null;
    include?: Prisma.ControlInclude<ExtArgs> | null;
    where: Prisma.ControlWhereUniqueInput;
};
export type ControlFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlSelect<ExtArgs> | null;
    omit?: Prisma.ControlOmit<ExtArgs> | null;
    include?: Prisma.ControlInclude<ExtArgs> | null;
    where?: Prisma.ControlWhereInput;
    orderBy?: Prisma.ControlOrderByWithRelationInput | Prisma.ControlOrderByWithRelationInput[];
    cursor?: Prisma.ControlWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlScalarFieldEnum | Prisma.ControlScalarFieldEnum[];
};
export type ControlFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlSelect<ExtArgs> | null;
    omit?: Prisma.ControlOmit<ExtArgs> | null;
    include?: Prisma.ControlInclude<ExtArgs> | null;
    where?: Prisma.ControlWhereInput;
    orderBy?: Prisma.ControlOrderByWithRelationInput | Prisma.ControlOrderByWithRelationInput[];
    cursor?: Prisma.ControlWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlScalarFieldEnum | Prisma.ControlScalarFieldEnum[];
};
export type ControlFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlSelect<ExtArgs> | null;
    omit?: Prisma.ControlOmit<ExtArgs> | null;
    include?: Prisma.ControlInclude<ExtArgs> | null;
    where?: Prisma.ControlWhereInput;
    orderBy?: Prisma.ControlOrderByWithRelationInput | Prisma.ControlOrderByWithRelationInput[];
    cursor?: Prisma.ControlWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlScalarFieldEnum | Prisma.ControlScalarFieldEnum[];
};
export type ControlCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlSelect<ExtArgs> | null;
    omit?: Prisma.ControlOmit<ExtArgs> | null;
    include?: Prisma.ControlInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlCreateInput, Prisma.ControlUncheckedCreateInput>;
};
export type ControlCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ControlCreateManyInput | Prisma.ControlCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ControlCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ControlOmit<ExtArgs> | null;
    data: Prisma.ControlCreateManyInput | Prisma.ControlCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ControlUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlSelect<ExtArgs> | null;
    omit?: Prisma.ControlOmit<ExtArgs> | null;
    include?: Prisma.ControlInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlUpdateInput, Prisma.ControlUncheckedUpdateInput>;
    where: Prisma.ControlWhereUniqueInput;
};
export type ControlUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ControlUpdateManyMutationInput, Prisma.ControlUncheckedUpdateManyInput>;
    where?: Prisma.ControlWhereInput;
    limit?: number;
};
export type ControlUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ControlOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ControlUpdateManyMutationInput, Prisma.ControlUncheckedUpdateManyInput>;
    where?: Prisma.ControlWhereInput;
    limit?: number;
};
export type ControlUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlSelect<ExtArgs> | null;
    omit?: Prisma.ControlOmit<ExtArgs> | null;
    include?: Prisma.ControlInclude<ExtArgs> | null;
    where: Prisma.ControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ControlCreateInput, Prisma.ControlUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ControlUpdateInput, Prisma.ControlUncheckedUpdateInput>;
};
export type ControlDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlSelect<ExtArgs> | null;
    omit?: Prisma.ControlOmit<ExtArgs> | null;
    include?: Prisma.ControlInclude<ExtArgs> | null;
    where: Prisma.ControlWhereUniqueInput;
};
export type ControlDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ControlWhereInput;
    limit?: number;
};
export type Control$pointOfFocusControlsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Control$dimensionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Control$measurementsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Control$controlPoliciesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlPolicySelect<ExtArgs> | null;
    omit?: Prisma.ControlPolicyOmit<ExtArgs> | null;
    include?: Prisma.ControlPolicyInclude<ExtArgs> | null;
    where?: Prisma.ControlPolicyWhereInput;
    orderBy?: Prisma.ControlPolicyOrderByWithRelationInput | Prisma.ControlPolicyOrderByWithRelationInput[];
    cursor?: Prisma.ControlPolicyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlPolicyScalarFieldEnum | Prisma.ControlPolicyScalarFieldEnum[];
};
export type Control$controlTestsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ControlTestOmit<ExtArgs> | null;
    include?: Prisma.ControlTestInclude<ExtArgs> | null;
    where?: Prisma.ControlTestWhereInput;
    orderBy?: Prisma.ControlTestOrderByWithRelationInput | Prisma.ControlTestOrderByWithRelationInput[];
    cursor?: Prisma.ControlTestWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ControlTestScalarFieldEnum | Prisma.ControlTestScalarFieldEnum[];
};
export type Control$testPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TestPlanSelect<ExtArgs> | null;
    omit?: Prisma.TestPlanOmit<ExtArgs> | null;
    include?: Prisma.TestPlanInclude<ExtArgs> | null;
    where?: Prisma.TestPlanWhereInput;
    orderBy?: Prisma.TestPlanOrderByWithRelationInput | Prisma.TestPlanOrderByWithRelationInput[];
    cursor?: Prisma.TestPlanWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TestPlanScalarFieldEnum | Prisma.TestPlanScalarFieldEnum[];
};
export type Control$causeControlArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Control$clientControlsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlOmit<ExtArgs> | null;
    include?: Prisma.ClientControlInclude<ExtArgs> | null;
    where?: Prisma.ClientControlWhereInput;
    orderBy?: Prisma.ClientControlOrderByWithRelationInput | Prisma.ClientControlOrderByWithRelationInput[];
    cursor?: Prisma.ClientControlWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientControlScalarFieldEnum | Prisma.ClientControlScalarFieldEnum[];
};
export type Control$evidenceTemplatesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ControlDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlSelect<ExtArgs> | null;
    omit?: Prisma.ControlOmit<ExtArgs> | null;
    include?: Prisma.ControlInclude<ExtArgs> | null;
};
export {};
