import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ClientControlModel = runtime.Types.Result.DefaultSelection<Prisma.$ClientControlPayload>;
export type AggregateClientControl = {
    _count: ClientControlCountAggregateOutputType | null;
    _min: ClientControlMinAggregateOutputType | null;
    _max: ClientControlMaxAggregateOutputType | null;
};
export type ClientControlMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    controlId: string | null;
    serviceId: string | null;
    ownCode: string | null;
    clientInterpretation: string | null;
    type: $Enums.ControlDimensionType | null;
    sourceRef: string | null;
    isActive: boolean | null;
};
export type ClientControlMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    controlId: string | null;
    serviceId: string | null;
    ownCode: string | null;
    clientInterpretation: string | null;
    type: $Enums.ControlDimensionType | null;
    sourceRef: string | null;
    isActive: boolean | null;
};
export type ClientControlCountAggregateOutputType = {
    id: number;
    tenantId: number;
    controlId: number;
    serviceId: number;
    ownCode: number;
    clientInterpretation: number;
    type: number;
    sourceRef: number;
    isActive: number;
    _all: number;
};
export type ClientControlMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    controlId?: true;
    serviceId?: true;
    ownCode?: true;
    clientInterpretation?: true;
    type?: true;
    sourceRef?: true;
    isActive?: true;
};
export type ClientControlMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    controlId?: true;
    serviceId?: true;
    ownCode?: true;
    clientInterpretation?: true;
    type?: true;
    sourceRef?: true;
    isActive?: true;
};
export type ClientControlCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    controlId?: true;
    serviceId?: true;
    ownCode?: true;
    clientInterpretation?: true;
    type?: true;
    sourceRef?: true;
    isActive?: true;
    _all?: true;
};
export type ClientControlAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientControlWhereInput;
    orderBy?: Prisma.ClientControlOrderByWithRelationInput | Prisma.ClientControlOrderByWithRelationInput[];
    cursor?: Prisma.ClientControlWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ClientControlCountAggregateInputType;
    _min?: ClientControlMinAggregateInputType;
    _max?: ClientControlMaxAggregateInputType;
};
export type GetClientControlAggregateType<T extends ClientControlAggregateArgs> = {
    [P in keyof T & keyof AggregateClientControl]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateClientControl[P]> : Prisma.GetScalarType<T[P], AggregateClientControl[P]>;
};
export type ClientControlGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientControlWhereInput;
    orderBy?: Prisma.ClientControlOrderByWithAggregationInput | Prisma.ClientControlOrderByWithAggregationInput[];
    by: Prisma.ClientControlScalarFieldEnum[] | Prisma.ClientControlScalarFieldEnum;
    having?: Prisma.ClientControlScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClientControlCountAggregateInputType | true;
    _min?: ClientControlMinAggregateInputType;
    _max?: ClientControlMaxAggregateInputType;
};
export type ClientControlGroupByOutputType = {
    id: string;
    tenantId: string;
    controlId: string | null;
    serviceId: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef: string | null;
    isActive: boolean;
    _count: ClientControlCountAggregateOutputType | null;
    _min: ClientControlMinAggregateOutputType | null;
    _max: ClientControlMaxAggregateOutputType | null;
};
type GetClientControlGroupByPayload<T extends ClientControlGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ClientControlGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ClientControlGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ClientControlGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ClientControlGroupByOutputType[P]>;
}>>;
export type ClientControlWhereInput = {
    AND?: Prisma.ClientControlWhereInput | Prisma.ClientControlWhereInput[];
    OR?: Prisma.ClientControlWhereInput[];
    NOT?: Prisma.ClientControlWhereInput | Prisma.ClientControlWhereInput[];
    id?: Prisma.UuidFilter<"ClientControl"> | string;
    tenantId?: Prisma.UuidFilter<"ClientControl"> | string;
    controlId?: Prisma.UuidNullableFilter<"ClientControl"> | string | null;
    serviceId?: Prisma.UuidFilter<"ClientControl"> | string;
    ownCode?: Prisma.StringFilter<"ClientControl"> | string;
    clientInterpretation?: Prisma.StringFilter<"ClientControl"> | string;
    type?: Prisma.EnumControlDimensionTypeFilter<"ClientControl"> | $Enums.ControlDimensionType;
    sourceRef?: Prisma.StringNullableFilter<"ClientControl"> | string | null;
    isActive?: Prisma.BoolFilter<"ClientControl"> | boolean;
    control?: Prisma.XOR<Prisma.ControlNullableScalarRelationFilter, Prisma.ControlWhereInput> | null;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    actionPlans?: Prisma.ActionPlanListRelationFilter;
    userControlAssignments?: Prisma.UserControlAssignmentListRelationFilter;
    clientCauseControls?: Prisma.ClientCauseControlListRelationFilter;
    evaluations?: Prisma.EvaluationListRelationFilter;
    evidenceRequirements?: Prisma.EvidenceRequirementListRelationFilter;
    dimensions?: Prisma.ClientControlDimensionListRelationFilter;
    tests?: Prisma.ClientControlTestListRelationFilter;
};
export type ClientControlOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrderInput | Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    ownCode?: Prisma.SortOrder;
    clientInterpretation?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrderInput | Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    control?: Prisma.ControlOrderByWithRelationInput;
    service?: Prisma.ServiceOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
    actionPlans?: Prisma.ActionPlanOrderByRelationAggregateInput;
    userControlAssignments?: Prisma.UserControlAssignmentOrderByRelationAggregateInput;
    clientCauseControls?: Prisma.ClientCauseControlOrderByRelationAggregateInput;
    evaluations?: Prisma.EvaluationOrderByRelationAggregateInput;
    evidenceRequirements?: Prisma.EvidenceRequirementOrderByRelationAggregateInput;
    dimensions?: Prisma.ClientControlDimensionOrderByRelationAggregateInput;
    tests?: Prisma.ClientControlTestOrderByRelationAggregateInput;
};
export type ClientControlWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    serviceId_controlId?: Prisma.ClientControlServiceIdControlIdCompoundUniqueInput;
    serviceId_ownCode?: Prisma.ClientControlServiceIdOwnCodeCompoundUniqueInput;
    AND?: Prisma.ClientControlWhereInput | Prisma.ClientControlWhereInput[];
    OR?: Prisma.ClientControlWhereInput[];
    NOT?: Prisma.ClientControlWhereInput | Prisma.ClientControlWhereInput[];
    tenantId?: Prisma.UuidFilter<"ClientControl"> | string;
    controlId?: Prisma.UuidNullableFilter<"ClientControl"> | string | null;
    serviceId?: Prisma.UuidFilter<"ClientControl"> | string;
    ownCode?: Prisma.StringFilter<"ClientControl"> | string;
    clientInterpretation?: Prisma.StringFilter<"ClientControl"> | string;
    type?: Prisma.EnumControlDimensionTypeFilter<"ClientControl"> | $Enums.ControlDimensionType;
    sourceRef?: Prisma.StringNullableFilter<"ClientControl"> | string | null;
    isActive?: Prisma.BoolFilter<"ClientControl"> | boolean;
    control?: Prisma.XOR<Prisma.ControlNullableScalarRelationFilter, Prisma.ControlWhereInput> | null;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    actionPlans?: Prisma.ActionPlanListRelationFilter;
    userControlAssignments?: Prisma.UserControlAssignmentListRelationFilter;
    clientCauseControls?: Prisma.ClientCauseControlListRelationFilter;
    evaluations?: Prisma.EvaluationListRelationFilter;
    evidenceRequirements?: Prisma.EvidenceRequirementListRelationFilter;
    dimensions?: Prisma.ClientControlDimensionListRelationFilter;
    tests?: Prisma.ClientControlTestListRelationFilter;
}, "id" | "serviceId_controlId" | "serviceId_ownCode">;
export type ClientControlOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrderInput | Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    ownCode?: Prisma.SortOrder;
    clientInterpretation?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrderInput | Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    _count?: Prisma.ClientControlCountOrderByAggregateInput;
    _max?: Prisma.ClientControlMaxOrderByAggregateInput;
    _min?: Prisma.ClientControlMinOrderByAggregateInput;
};
export type ClientControlScalarWhereWithAggregatesInput = {
    AND?: Prisma.ClientControlScalarWhereWithAggregatesInput | Prisma.ClientControlScalarWhereWithAggregatesInput[];
    OR?: Prisma.ClientControlScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ClientControlScalarWhereWithAggregatesInput | Prisma.ClientControlScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ClientControl"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ClientControl"> | string;
    controlId?: Prisma.UuidNullableWithAggregatesFilter<"ClientControl"> | string | null;
    serviceId?: Prisma.UuidWithAggregatesFilter<"ClientControl"> | string;
    ownCode?: Prisma.StringWithAggregatesFilter<"ClientControl"> | string;
    clientInterpretation?: Prisma.StringWithAggregatesFilter<"ClientControl"> | string;
    type?: Prisma.EnumControlDimensionTypeWithAggregatesFilter<"ClientControl"> | $Enums.ControlDimensionType;
    sourceRef?: Prisma.StringNullableWithAggregatesFilter<"ClientControl"> | string | null;
    isActive?: Prisma.BoolWithAggregatesFilter<"ClientControl"> | boolean;
};
export type ClientControlCreateInput = {
    id?: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    control?: Prisma.ControlCreateNestedOneWithoutClientControlsInput;
    service: Prisma.ServiceCreateNestedOneWithoutClientControlsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlsInput;
    actionPlans?: Prisma.ActionPlanCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestCreateNestedManyWithoutClientControlInput;
};
export type ClientControlUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    controlId?: string | null;
    serviceId: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    actionPlans?: Prisma.ActionPlanUncheckedCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestUncheckedCreateNestedManyWithoutClientControlInput;
};
export type ClientControlUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    control?: Prisma.ControlUpdateOneWithoutClientControlsNestedInput;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientControlsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlsNestedInput;
    actionPlans?: Prisma.ActionPlanUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    actionPlans?: Prisma.ActionPlanUncheckedUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUncheckedUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlCreateManyInput = {
    id?: string;
    tenantId: string;
    controlId?: string | null;
    serviceId: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
};
export type ClientControlUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ClientControlUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ClientControlListRelationFilter = {
    every?: Prisma.ClientControlWhereInput;
    some?: Prisma.ClientControlWhereInput;
    none?: Prisma.ClientControlWhereInput;
};
export type ClientControlOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ClientControlScalarRelationFilter = {
    is?: Prisma.ClientControlWhereInput;
    isNot?: Prisma.ClientControlWhereInput;
};
export type ClientControlServiceIdControlIdCompoundUniqueInput = {
    serviceId: string;
    controlId: string;
};
export type ClientControlServiceIdOwnCodeCompoundUniqueInput = {
    serviceId: string;
    ownCode: string;
};
export type ClientControlCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    ownCode?: Prisma.SortOrder;
    clientInterpretation?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
};
export type ClientControlMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    ownCode?: Prisma.SortOrder;
    clientInterpretation?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
};
export type ClientControlMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    controlId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    ownCode?: Prisma.SortOrder;
    clientInterpretation?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    sourceRef?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
};
export type ClientControlCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutControlInput, Prisma.ClientControlUncheckedCreateWithoutControlInput> | Prisma.ClientControlCreateWithoutControlInput[] | Prisma.ClientControlUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutControlInput | Prisma.ClientControlCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.ClientControlCreateManyControlInputEnvelope;
    connect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
};
export type ClientControlUncheckedCreateNestedManyWithoutControlInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutControlInput, Prisma.ClientControlUncheckedCreateWithoutControlInput> | Prisma.ClientControlCreateWithoutControlInput[] | Prisma.ClientControlUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutControlInput | Prisma.ClientControlCreateOrConnectWithoutControlInput[];
    createMany?: Prisma.ClientControlCreateManyControlInputEnvelope;
    connect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
};
export type ClientControlUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutControlInput, Prisma.ClientControlUncheckedCreateWithoutControlInput> | Prisma.ClientControlCreateWithoutControlInput[] | Prisma.ClientControlUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutControlInput | Prisma.ClientControlCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.ClientControlUpsertWithWhereUniqueWithoutControlInput | Prisma.ClientControlUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.ClientControlCreateManyControlInputEnvelope;
    set?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    disconnect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    delete?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    connect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    update?: Prisma.ClientControlUpdateWithWhereUniqueWithoutControlInput | Prisma.ClientControlUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.ClientControlUpdateManyWithWhereWithoutControlInput | Prisma.ClientControlUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.ClientControlScalarWhereInput | Prisma.ClientControlScalarWhereInput[];
};
export type ClientControlUncheckedUpdateManyWithoutControlNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutControlInput, Prisma.ClientControlUncheckedCreateWithoutControlInput> | Prisma.ClientControlCreateWithoutControlInput[] | Prisma.ClientControlUncheckedCreateWithoutControlInput[];
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutControlInput | Prisma.ClientControlCreateOrConnectWithoutControlInput[];
    upsert?: Prisma.ClientControlUpsertWithWhereUniqueWithoutControlInput | Prisma.ClientControlUpsertWithWhereUniqueWithoutControlInput[];
    createMany?: Prisma.ClientControlCreateManyControlInputEnvelope;
    set?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    disconnect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    delete?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    connect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    update?: Prisma.ClientControlUpdateWithWhereUniqueWithoutControlInput | Prisma.ClientControlUpdateWithWhereUniqueWithoutControlInput[];
    updateMany?: Prisma.ClientControlUpdateManyWithWhereWithoutControlInput | Prisma.ClientControlUpdateManyWithWhereWithoutControlInput[];
    deleteMany?: Prisma.ClientControlScalarWhereInput | Prisma.ClientControlScalarWhereInput[];
};
export type ClientControlCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutTenantInput, Prisma.ClientControlUncheckedCreateWithoutTenantInput> | Prisma.ClientControlCreateWithoutTenantInput[] | Prisma.ClientControlUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutTenantInput | Prisma.ClientControlCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ClientControlCreateManyTenantInputEnvelope;
    connect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
};
export type ClientControlUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutTenantInput, Prisma.ClientControlUncheckedCreateWithoutTenantInput> | Prisma.ClientControlCreateWithoutTenantInput[] | Prisma.ClientControlUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutTenantInput | Prisma.ClientControlCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ClientControlCreateManyTenantInputEnvelope;
    connect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
};
export type ClientControlUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutTenantInput, Prisma.ClientControlUncheckedCreateWithoutTenantInput> | Prisma.ClientControlCreateWithoutTenantInput[] | Prisma.ClientControlUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutTenantInput | Prisma.ClientControlCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ClientControlUpsertWithWhereUniqueWithoutTenantInput | Prisma.ClientControlUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ClientControlCreateManyTenantInputEnvelope;
    set?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    disconnect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    delete?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    connect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    update?: Prisma.ClientControlUpdateWithWhereUniqueWithoutTenantInput | Prisma.ClientControlUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ClientControlUpdateManyWithWhereWithoutTenantInput | Prisma.ClientControlUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ClientControlScalarWhereInput | Prisma.ClientControlScalarWhereInput[];
};
export type ClientControlUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutTenantInput, Prisma.ClientControlUncheckedCreateWithoutTenantInput> | Prisma.ClientControlCreateWithoutTenantInput[] | Prisma.ClientControlUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutTenantInput | Prisma.ClientControlCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ClientControlUpsertWithWhereUniqueWithoutTenantInput | Prisma.ClientControlUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ClientControlCreateManyTenantInputEnvelope;
    set?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    disconnect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    delete?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    connect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    update?: Prisma.ClientControlUpdateWithWhereUniqueWithoutTenantInput | Prisma.ClientControlUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ClientControlUpdateManyWithWhereWithoutTenantInput | Prisma.ClientControlUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ClientControlScalarWhereInput | Prisma.ClientControlScalarWhereInput[];
};
export type ClientControlCreateNestedOneWithoutUserControlAssignmentsInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutUserControlAssignmentsInput, Prisma.ClientControlUncheckedCreateWithoutUserControlAssignmentsInput>;
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutUserControlAssignmentsInput;
    connect?: Prisma.ClientControlWhereUniqueInput;
};
export type ClientControlUpdateOneRequiredWithoutUserControlAssignmentsNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutUserControlAssignmentsInput, Prisma.ClientControlUncheckedCreateWithoutUserControlAssignmentsInput>;
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutUserControlAssignmentsInput;
    upsert?: Prisma.ClientControlUpsertWithoutUserControlAssignmentsInput;
    connect?: Prisma.ClientControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientControlUpdateToOneWithWhereWithoutUserControlAssignmentsInput, Prisma.ClientControlUpdateWithoutUserControlAssignmentsInput>, Prisma.ClientControlUncheckedUpdateWithoutUserControlAssignmentsInput>;
};
export type ClientControlCreateNestedOneWithoutActionPlansInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutActionPlansInput, Prisma.ClientControlUncheckedCreateWithoutActionPlansInput>;
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutActionPlansInput;
    connect?: Prisma.ClientControlWhereUniqueInput;
};
export type ClientControlUpdateOneRequiredWithoutActionPlansNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutActionPlansInput, Prisma.ClientControlUncheckedCreateWithoutActionPlansInput>;
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutActionPlansInput;
    upsert?: Prisma.ClientControlUpsertWithoutActionPlansInput;
    connect?: Prisma.ClientControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientControlUpdateToOneWithWhereWithoutActionPlansInput, Prisma.ClientControlUpdateWithoutActionPlansInput>, Prisma.ClientControlUncheckedUpdateWithoutActionPlansInput>;
};
export type ClientControlCreateNestedOneWithoutEvidenceRequirementsInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutEvidenceRequirementsInput, Prisma.ClientControlUncheckedCreateWithoutEvidenceRequirementsInput>;
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutEvidenceRequirementsInput;
    connect?: Prisma.ClientControlWhereUniqueInput;
};
export type ClientControlUpdateOneRequiredWithoutEvidenceRequirementsNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutEvidenceRequirementsInput, Prisma.ClientControlUncheckedCreateWithoutEvidenceRequirementsInput>;
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutEvidenceRequirementsInput;
    upsert?: Prisma.ClientControlUpsertWithoutEvidenceRequirementsInput;
    connect?: Prisma.ClientControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientControlUpdateToOneWithWhereWithoutEvidenceRequirementsInput, Prisma.ClientControlUpdateWithoutEvidenceRequirementsInput>, Prisma.ClientControlUncheckedUpdateWithoutEvidenceRequirementsInput>;
};
export type ClientControlCreateNestedOneWithoutEvaluationsInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutEvaluationsInput, Prisma.ClientControlUncheckedCreateWithoutEvaluationsInput>;
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutEvaluationsInput;
    connect?: Prisma.ClientControlWhereUniqueInput;
};
export type ClientControlUpdateOneRequiredWithoutEvaluationsNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutEvaluationsInput, Prisma.ClientControlUncheckedCreateWithoutEvaluationsInput>;
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutEvaluationsInput;
    upsert?: Prisma.ClientControlUpsertWithoutEvaluationsInput;
    connect?: Prisma.ClientControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientControlUpdateToOneWithWhereWithoutEvaluationsInput, Prisma.ClientControlUpdateWithoutEvaluationsInput>, Prisma.ClientControlUncheckedUpdateWithoutEvaluationsInput>;
};
export type ClientControlCreateNestedOneWithoutClientCauseControlsInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutClientCauseControlsInput, Prisma.ClientControlUncheckedCreateWithoutClientCauseControlsInput>;
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutClientCauseControlsInput;
    connect?: Prisma.ClientControlWhereUniqueInput;
};
export type ClientControlUpdateOneRequiredWithoutClientCauseControlsNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutClientCauseControlsInput, Prisma.ClientControlUncheckedCreateWithoutClientCauseControlsInput>;
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutClientCauseControlsInput;
    upsert?: Prisma.ClientControlUpsertWithoutClientCauseControlsInput;
    connect?: Prisma.ClientControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientControlUpdateToOneWithWhereWithoutClientCauseControlsInput, Prisma.ClientControlUpdateWithoutClientCauseControlsInput>, Prisma.ClientControlUncheckedUpdateWithoutClientCauseControlsInput>;
};
export type ClientControlCreateNestedOneWithoutDimensionsInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutDimensionsInput, Prisma.ClientControlUncheckedCreateWithoutDimensionsInput>;
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutDimensionsInput;
    connect?: Prisma.ClientControlWhereUniqueInput;
};
export type ClientControlUpdateOneRequiredWithoutDimensionsNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutDimensionsInput, Prisma.ClientControlUncheckedCreateWithoutDimensionsInput>;
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutDimensionsInput;
    upsert?: Prisma.ClientControlUpsertWithoutDimensionsInput;
    connect?: Prisma.ClientControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientControlUpdateToOneWithWhereWithoutDimensionsInput, Prisma.ClientControlUpdateWithoutDimensionsInput>, Prisma.ClientControlUncheckedUpdateWithoutDimensionsInput>;
};
export type ClientControlCreateNestedOneWithoutTestsInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutTestsInput, Prisma.ClientControlUncheckedCreateWithoutTestsInput>;
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutTestsInput;
    connect?: Prisma.ClientControlWhereUniqueInput;
};
export type ClientControlUpdateOneRequiredWithoutTestsNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutTestsInput, Prisma.ClientControlUncheckedCreateWithoutTestsInput>;
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutTestsInput;
    upsert?: Prisma.ClientControlUpsertWithoutTestsInput;
    connect?: Prisma.ClientControlWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientControlUpdateToOneWithWhereWithoutTestsInput, Prisma.ClientControlUpdateWithoutTestsInput>, Prisma.ClientControlUncheckedUpdateWithoutTestsInput>;
};
export type ClientControlCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutServiceInput, Prisma.ClientControlUncheckedCreateWithoutServiceInput> | Prisma.ClientControlCreateWithoutServiceInput[] | Prisma.ClientControlUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutServiceInput | Prisma.ClientControlCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.ClientControlCreateManyServiceInputEnvelope;
    connect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
};
export type ClientControlUncheckedCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutServiceInput, Prisma.ClientControlUncheckedCreateWithoutServiceInput> | Prisma.ClientControlCreateWithoutServiceInput[] | Prisma.ClientControlUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutServiceInput | Prisma.ClientControlCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.ClientControlCreateManyServiceInputEnvelope;
    connect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
};
export type ClientControlUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutServiceInput, Prisma.ClientControlUncheckedCreateWithoutServiceInput> | Prisma.ClientControlCreateWithoutServiceInput[] | Prisma.ClientControlUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutServiceInput | Prisma.ClientControlCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.ClientControlUpsertWithWhereUniqueWithoutServiceInput | Prisma.ClientControlUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.ClientControlCreateManyServiceInputEnvelope;
    set?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    disconnect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    delete?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    connect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    update?: Prisma.ClientControlUpdateWithWhereUniqueWithoutServiceInput | Prisma.ClientControlUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.ClientControlUpdateManyWithWhereWithoutServiceInput | Prisma.ClientControlUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.ClientControlScalarWhereInput | Prisma.ClientControlScalarWhereInput[];
};
export type ClientControlUncheckedUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlCreateWithoutServiceInput, Prisma.ClientControlUncheckedCreateWithoutServiceInput> | Prisma.ClientControlCreateWithoutServiceInput[] | Prisma.ClientControlUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ClientControlCreateOrConnectWithoutServiceInput | Prisma.ClientControlCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.ClientControlUpsertWithWhereUniqueWithoutServiceInput | Prisma.ClientControlUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.ClientControlCreateManyServiceInputEnvelope;
    set?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    disconnect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    delete?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    connect?: Prisma.ClientControlWhereUniqueInput | Prisma.ClientControlWhereUniqueInput[];
    update?: Prisma.ClientControlUpdateWithWhereUniqueWithoutServiceInput | Prisma.ClientControlUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.ClientControlUpdateManyWithWhereWithoutServiceInput | Prisma.ClientControlUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.ClientControlScalarWhereInput | Prisma.ClientControlScalarWhereInput[];
};
export type ClientControlCreateWithoutControlInput = {
    id?: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    service: Prisma.ServiceCreateNestedOneWithoutClientControlsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlsInput;
    actionPlans?: Prisma.ActionPlanCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestCreateNestedManyWithoutClientControlInput;
};
export type ClientControlUncheckedCreateWithoutControlInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    actionPlans?: Prisma.ActionPlanUncheckedCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestUncheckedCreateNestedManyWithoutClientControlInput;
};
export type ClientControlCreateOrConnectWithoutControlInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutControlInput, Prisma.ClientControlUncheckedCreateWithoutControlInput>;
};
export type ClientControlCreateManyControlInputEnvelope = {
    data: Prisma.ClientControlCreateManyControlInput | Prisma.ClientControlCreateManyControlInput[];
    skipDuplicates?: boolean;
};
export type ClientControlUpsertWithWhereUniqueWithoutControlInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientControlUpdateWithoutControlInput, Prisma.ClientControlUncheckedUpdateWithoutControlInput>;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutControlInput, Prisma.ClientControlUncheckedCreateWithoutControlInput>;
};
export type ClientControlUpdateWithWhereUniqueWithoutControlInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientControlUpdateWithoutControlInput, Prisma.ClientControlUncheckedUpdateWithoutControlInput>;
};
export type ClientControlUpdateManyWithWhereWithoutControlInput = {
    where: Prisma.ClientControlScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientControlUpdateManyMutationInput, Prisma.ClientControlUncheckedUpdateManyWithoutControlInput>;
};
export type ClientControlScalarWhereInput = {
    AND?: Prisma.ClientControlScalarWhereInput | Prisma.ClientControlScalarWhereInput[];
    OR?: Prisma.ClientControlScalarWhereInput[];
    NOT?: Prisma.ClientControlScalarWhereInput | Prisma.ClientControlScalarWhereInput[];
    id?: Prisma.UuidFilter<"ClientControl"> | string;
    tenantId?: Prisma.UuidFilter<"ClientControl"> | string;
    controlId?: Prisma.UuidNullableFilter<"ClientControl"> | string | null;
    serviceId?: Prisma.UuidFilter<"ClientControl"> | string;
    ownCode?: Prisma.StringFilter<"ClientControl"> | string;
    clientInterpretation?: Prisma.StringFilter<"ClientControl"> | string;
    type?: Prisma.EnumControlDimensionTypeFilter<"ClientControl"> | $Enums.ControlDimensionType;
    sourceRef?: Prisma.StringNullableFilter<"ClientControl"> | string | null;
    isActive?: Prisma.BoolFilter<"ClientControl"> | boolean;
};
export type ClientControlCreateWithoutTenantInput = {
    id?: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    control?: Prisma.ControlCreateNestedOneWithoutClientControlsInput;
    service: Prisma.ServiceCreateNestedOneWithoutClientControlsInput;
    actionPlans?: Prisma.ActionPlanCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestCreateNestedManyWithoutClientControlInput;
};
export type ClientControlUncheckedCreateWithoutTenantInput = {
    id?: string;
    controlId?: string | null;
    serviceId: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    actionPlans?: Prisma.ActionPlanUncheckedCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestUncheckedCreateNestedManyWithoutClientControlInput;
};
export type ClientControlCreateOrConnectWithoutTenantInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutTenantInput, Prisma.ClientControlUncheckedCreateWithoutTenantInput>;
};
export type ClientControlCreateManyTenantInputEnvelope = {
    data: Prisma.ClientControlCreateManyTenantInput | Prisma.ClientControlCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ClientControlUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientControlUpdateWithoutTenantInput, Prisma.ClientControlUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutTenantInput, Prisma.ClientControlUncheckedCreateWithoutTenantInput>;
};
export type ClientControlUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientControlUpdateWithoutTenantInput, Prisma.ClientControlUncheckedUpdateWithoutTenantInput>;
};
export type ClientControlUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ClientControlScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientControlUpdateManyMutationInput, Prisma.ClientControlUncheckedUpdateManyWithoutTenantInput>;
};
export type ClientControlCreateWithoutUserControlAssignmentsInput = {
    id?: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    control?: Prisma.ControlCreateNestedOneWithoutClientControlsInput;
    service: Prisma.ServiceCreateNestedOneWithoutClientControlsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlsInput;
    actionPlans?: Prisma.ActionPlanCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestCreateNestedManyWithoutClientControlInput;
};
export type ClientControlUncheckedCreateWithoutUserControlAssignmentsInput = {
    id?: string;
    tenantId: string;
    controlId?: string | null;
    serviceId: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    actionPlans?: Prisma.ActionPlanUncheckedCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestUncheckedCreateNestedManyWithoutClientControlInput;
};
export type ClientControlCreateOrConnectWithoutUserControlAssignmentsInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutUserControlAssignmentsInput, Prisma.ClientControlUncheckedCreateWithoutUserControlAssignmentsInput>;
};
export type ClientControlUpsertWithoutUserControlAssignmentsInput = {
    update: Prisma.XOR<Prisma.ClientControlUpdateWithoutUserControlAssignmentsInput, Prisma.ClientControlUncheckedUpdateWithoutUserControlAssignmentsInput>;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutUserControlAssignmentsInput, Prisma.ClientControlUncheckedCreateWithoutUserControlAssignmentsInput>;
    where?: Prisma.ClientControlWhereInput;
};
export type ClientControlUpdateToOneWithWhereWithoutUserControlAssignmentsInput = {
    where?: Prisma.ClientControlWhereInput;
    data: Prisma.XOR<Prisma.ClientControlUpdateWithoutUserControlAssignmentsInput, Prisma.ClientControlUncheckedUpdateWithoutUserControlAssignmentsInput>;
};
export type ClientControlUpdateWithoutUserControlAssignmentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    control?: Prisma.ControlUpdateOneWithoutClientControlsNestedInput;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientControlsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlsNestedInput;
    actionPlans?: Prisma.ActionPlanUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlUncheckedUpdateWithoutUserControlAssignmentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    actionPlans?: Prisma.ActionPlanUncheckedUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUncheckedUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlCreateWithoutActionPlansInput = {
    id?: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    control?: Prisma.ControlCreateNestedOneWithoutClientControlsInput;
    service: Prisma.ServiceCreateNestedOneWithoutClientControlsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlsInput;
    userControlAssignments?: Prisma.UserControlAssignmentCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestCreateNestedManyWithoutClientControlInput;
};
export type ClientControlUncheckedCreateWithoutActionPlansInput = {
    id?: string;
    tenantId: string;
    controlId?: string | null;
    serviceId: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestUncheckedCreateNestedManyWithoutClientControlInput;
};
export type ClientControlCreateOrConnectWithoutActionPlansInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutActionPlansInput, Prisma.ClientControlUncheckedCreateWithoutActionPlansInput>;
};
export type ClientControlUpsertWithoutActionPlansInput = {
    update: Prisma.XOR<Prisma.ClientControlUpdateWithoutActionPlansInput, Prisma.ClientControlUncheckedUpdateWithoutActionPlansInput>;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutActionPlansInput, Prisma.ClientControlUncheckedCreateWithoutActionPlansInput>;
    where?: Prisma.ClientControlWhereInput;
};
export type ClientControlUpdateToOneWithWhereWithoutActionPlansInput = {
    where?: Prisma.ClientControlWhereInput;
    data: Prisma.XOR<Prisma.ClientControlUpdateWithoutActionPlansInput, Prisma.ClientControlUncheckedUpdateWithoutActionPlansInput>;
};
export type ClientControlUpdateWithoutActionPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    control?: Prisma.ControlUpdateOneWithoutClientControlsNestedInput;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientControlsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlsNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlUncheckedUpdateWithoutActionPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUncheckedUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlCreateWithoutEvidenceRequirementsInput = {
    id?: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    control?: Prisma.ControlCreateNestedOneWithoutClientControlsInput;
    service: Prisma.ServiceCreateNestedOneWithoutClientControlsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlsInput;
    actionPlans?: Prisma.ActionPlanCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestCreateNestedManyWithoutClientControlInput;
};
export type ClientControlUncheckedCreateWithoutEvidenceRequirementsInput = {
    id?: string;
    tenantId: string;
    controlId?: string | null;
    serviceId: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    actionPlans?: Prisma.ActionPlanUncheckedCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestUncheckedCreateNestedManyWithoutClientControlInput;
};
export type ClientControlCreateOrConnectWithoutEvidenceRequirementsInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutEvidenceRequirementsInput, Prisma.ClientControlUncheckedCreateWithoutEvidenceRequirementsInput>;
};
export type ClientControlUpsertWithoutEvidenceRequirementsInput = {
    update: Prisma.XOR<Prisma.ClientControlUpdateWithoutEvidenceRequirementsInput, Prisma.ClientControlUncheckedUpdateWithoutEvidenceRequirementsInput>;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutEvidenceRequirementsInput, Prisma.ClientControlUncheckedCreateWithoutEvidenceRequirementsInput>;
    where?: Prisma.ClientControlWhereInput;
};
export type ClientControlUpdateToOneWithWhereWithoutEvidenceRequirementsInput = {
    where?: Prisma.ClientControlWhereInput;
    data: Prisma.XOR<Prisma.ClientControlUpdateWithoutEvidenceRequirementsInput, Prisma.ClientControlUncheckedUpdateWithoutEvidenceRequirementsInput>;
};
export type ClientControlUpdateWithoutEvidenceRequirementsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    control?: Prisma.ControlUpdateOneWithoutClientControlsNestedInput;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientControlsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlsNestedInput;
    actionPlans?: Prisma.ActionPlanUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlUncheckedUpdateWithoutEvidenceRequirementsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    actionPlans?: Prisma.ActionPlanUncheckedUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUncheckedUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlCreateWithoutEvaluationsInput = {
    id?: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    control?: Prisma.ControlCreateNestedOneWithoutClientControlsInput;
    service: Prisma.ServiceCreateNestedOneWithoutClientControlsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlsInput;
    actionPlans?: Prisma.ActionPlanCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestCreateNestedManyWithoutClientControlInput;
};
export type ClientControlUncheckedCreateWithoutEvaluationsInput = {
    id?: string;
    tenantId: string;
    controlId?: string | null;
    serviceId: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    actionPlans?: Prisma.ActionPlanUncheckedCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestUncheckedCreateNestedManyWithoutClientControlInput;
};
export type ClientControlCreateOrConnectWithoutEvaluationsInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutEvaluationsInput, Prisma.ClientControlUncheckedCreateWithoutEvaluationsInput>;
};
export type ClientControlUpsertWithoutEvaluationsInput = {
    update: Prisma.XOR<Prisma.ClientControlUpdateWithoutEvaluationsInput, Prisma.ClientControlUncheckedUpdateWithoutEvaluationsInput>;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutEvaluationsInput, Prisma.ClientControlUncheckedCreateWithoutEvaluationsInput>;
    where?: Prisma.ClientControlWhereInput;
};
export type ClientControlUpdateToOneWithWhereWithoutEvaluationsInput = {
    where?: Prisma.ClientControlWhereInput;
    data: Prisma.XOR<Prisma.ClientControlUpdateWithoutEvaluationsInput, Prisma.ClientControlUncheckedUpdateWithoutEvaluationsInput>;
};
export type ClientControlUpdateWithoutEvaluationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    control?: Prisma.ControlUpdateOneWithoutClientControlsNestedInput;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientControlsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlsNestedInput;
    actionPlans?: Prisma.ActionPlanUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlUncheckedUpdateWithoutEvaluationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    actionPlans?: Prisma.ActionPlanUncheckedUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUncheckedUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlCreateWithoutClientCauseControlsInput = {
    id?: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    control?: Prisma.ControlCreateNestedOneWithoutClientControlsInput;
    service: Prisma.ServiceCreateNestedOneWithoutClientControlsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlsInput;
    actionPlans?: Prisma.ActionPlanCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestCreateNestedManyWithoutClientControlInput;
};
export type ClientControlUncheckedCreateWithoutClientCauseControlsInput = {
    id?: string;
    tenantId: string;
    controlId?: string | null;
    serviceId: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    actionPlans?: Prisma.ActionPlanUncheckedCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestUncheckedCreateNestedManyWithoutClientControlInput;
};
export type ClientControlCreateOrConnectWithoutClientCauseControlsInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutClientCauseControlsInput, Prisma.ClientControlUncheckedCreateWithoutClientCauseControlsInput>;
};
export type ClientControlUpsertWithoutClientCauseControlsInput = {
    update: Prisma.XOR<Prisma.ClientControlUpdateWithoutClientCauseControlsInput, Prisma.ClientControlUncheckedUpdateWithoutClientCauseControlsInput>;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutClientCauseControlsInput, Prisma.ClientControlUncheckedCreateWithoutClientCauseControlsInput>;
    where?: Prisma.ClientControlWhereInput;
};
export type ClientControlUpdateToOneWithWhereWithoutClientCauseControlsInput = {
    where?: Prisma.ClientControlWhereInput;
    data: Prisma.XOR<Prisma.ClientControlUpdateWithoutClientCauseControlsInput, Prisma.ClientControlUncheckedUpdateWithoutClientCauseControlsInput>;
};
export type ClientControlUpdateWithoutClientCauseControlsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    control?: Prisma.ControlUpdateOneWithoutClientControlsNestedInput;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientControlsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlsNestedInput;
    actionPlans?: Prisma.ActionPlanUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlUncheckedUpdateWithoutClientCauseControlsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    actionPlans?: Prisma.ActionPlanUncheckedUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUncheckedUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlCreateWithoutDimensionsInput = {
    id?: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    control?: Prisma.ControlCreateNestedOneWithoutClientControlsInput;
    service: Prisma.ServiceCreateNestedOneWithoutClientControlsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlsInput;
    actionPlans?: Prisma.ActionPlanCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestCreateNestedManyWithoutClientControlInput;
};
export type ClientControlUncheckedCreateWithoutDimensionsInput = {
    id?: string;
    tenantId: string;
    controlId?: string | null;
    serviceId: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    actionPlans?: Prisma.ActionPlanUncheckedCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestUncheckedCreateNestedManyWithoutClientControlInput;
};
export type ClientControlCreateOrConnectWithoutDimensionsInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutDimensionsInput, Prisma.ClientControlUncheckedCreateWithoutDimensionsInput>;
};
export type ClientControlUpsertWithoutDimensionsInput = {
    update: Prisma.XOR<Prisma.ClientControlUpdateWithoutDimensionsInput, Prisma.ClientControlUncheckedUpdateWithoutDimensionsInput>;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutDimensionsInput, Prisma.ClientControlUncheckedCreateWithoutDimensionsInput>;
    where?: Prisma.ClientControlWhereInput;
};
export type ClientControlUpdateToOneWithWhereWithoutDimensionsInput = {
    where?: Prisma.ClientControlWhereInput;
    data: Prisma.XOR<Prisma.ClientControlUpdateWithoutDimensionsInput, Prisma.ClientControlUncheckedUpdateWithoutDimensionsInput>;
};
export type ClientControlUpdateWithoutDimensionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    control?: Prisma.ControlUpdateOneWithoutClientControlsNestedInput;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientControlsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlsNestedInput;
    actionPlans?: Prisma.ActionPlanUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlUncheckedUpdateWithoutDimensionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    actionPlans?: Prisma.ActionPlanUncheckedUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUncheckedUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlCreateWithoutTestsInput = {
    id?: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    control?: Prisma.ControlCreateNestedOneWithoutClientControlsInput;
    service: Prisma.ServiceCreateNestedOneWithoutClientControlsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlsInput;
    actionPlans?: Prisma.ActionPlanCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionCreateNestedManyWithoutClientControlInput;
};
export type ClientControlUncheckedCreateWithoutTestsInput = {
    id?: string;
    tenantId: string;
    controlId?: string | null;
    serviceId: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    actionPlans?: Prisma.ActionPlanUncheckedCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedCreateNestedManyWithoutClientControlInput;
};
export type ClientControlCreateOrConnectWithoutTestsInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutTestsInput, Prisma.ClientControlUncheckedCreateWithoutTestsInput>;
};
export type ClientControlUpsertWithoutTestsInput = {
    update: Prisma.XOR<Prisma.ClientControlUpdateWithoutTestsInput, Prisma.ClientControlUncheckedUpdateWithoutTestsInput>;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutTestsInput, Prisma.ClientControlUncheckedCreateWithoutTestsInput>;
    where?: Prisma.ClientControlWhereInput;
};
export type ClientControlUpdateToOneWithWhereWithoutTestsInput = {
    where?: Prisma.ClientControlWhereInput;
    data: Prisma.XOR<Prisma.ClientControlUpdateWithoutTestsInput, Prisma.ClientControlUncheckedUpdateWithoutTestsInput>;
};
export type ClientControlUpdateWithoutTestsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    control?: Prisma.ControlUpdateOneWithoutClientControlsNestedInput;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientControlsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlsNestedInput;
    actionPlans?: Prisma.ActionPlanUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlUncheckedUpdateWithoutTestsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    actionPlans?: Prisma.ActionPlanUncheckedUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlCreateWithoutServiceInput = {
    id?: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    control?: Prisma.ControlCreateNestedOneWithoutClientControlsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlsInput;
    actionPlans?: Prisma.ActionPlanCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestCreateNestedManyWithoutClientControlInput;
};
export type ClientControlUncheckedCreateWithoutServiceInput = {
    id?: string;
    tenantId: string;
    controlId?: string | null;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
    actionPlans?: Prisma.ActionPlanUncheckedCreateNestedManyWithoutClientControlInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedCreateNestedManyWithoutClientControlInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientControlInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutClientControlInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedCreateNestedManyWithoutClientControlInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedCreateNestedManyWithoutClientControlInput;
    tests?: Prisma.ClientControlTestUncheckedCreateNestedManyWithoutClientControlInput;
};
export type ClientControlCreateOrConnectWithoutServiceInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutServiceInput, Prisma.ClientControlUncheckedCreateWithoutServiceInput>;
};
export type ClientControlCreateManyServiceInputEnvelope = {
    data: Prisma.ClientControlCreateManyServiceInput | Prisma.ClientControlCreateManyServiceInput[];
    skipDuplicates?: boolean;
};
export type ClientControlUpsertWithWhereUniqueWithoutServiceInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientControlUpdateWithoutServiceInput, Prisma.ClientControlUncheckedUpdateWithoutServiceInput>;
    create: Prisma.XOR<Prisma.ClientControlCreateWithoutServiceInput, Prisma.ClientControlUncheckedCreateWithoutServiceInput>;
};
export type ClientControlUpdateWithWhereUniqueWithoutServiceInput = {
    where: Prisma.ClientControlWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientControlUpdateWithoutServiceInput, Prisma.ClientControlUncheckedUpdateWithoutServiceInput>;
};
export type ClientControlUpdateManyWithWhereWithoutServiceInput = {
    where: Prisma.ClientControlScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientControlUpdateManyMutationInput, Prisma.ClientControlUncheckedUpdateManyWithoutServiceInput>;
};
export type ClientControlCreateManyControlInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
};
export type ClientControlUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientControlsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlsNestedInput;
    actionPlans?: Prisma.ActionPlanUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlUncheckedUpdateWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    actionPlans?: Prisma.ActionPlanUncheckedUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUncheckedUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlUncheckedUpdateManyWithoutControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ClientControlCreateManyTenantInput = {
    id?: string;
    controlId?: string | null;
    serviceId: string;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
};
export type ClientControlUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    control?: Prisma.ControlUpdateOneWithoutClientControlsNestedInput;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientControlsNestedInput;
    actionPlans?: Prisma.ActionPlanUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    actionPlans?: Prisma.ActionPlanUncheckedUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUncheckedUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ClientControlCreateManyServiceInput = {
    id?: string;
    tenantId: string;
    controlId?: string | null;
    ownCode: string;
    clientInterpretation: string;
    type: $Enums.ControlDimensionType;
    sourceRef?: string | null;
    isActive?: boolean;
};
export type ClientControlUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    control?: Prisma.ControlUpdateOneWithoutClientControlsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlsNestedInput;
    actionPlans?: Prisma.ActionPlanUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlUncheckedUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    actionPlans?: Prisma.ActionPlanUncheckedUpdateManyWithoutClientControlNestedInput;
    userControlAssignments?: Prisma.UserControlAssignmentUncheckedUpdateManyWithoutClientControlNestedInput;
    clientCauseControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientControlNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutClientControlNestedInput;
    evidenceRequirements?: Prisma.EvidenceRequirementUncheckedUpdateManyWithoutClientControlNestedInput;
    dimensions?: Prisma.ClientControlDimensionUncheckedUpdateManyWithoutClientControlNestedInput;
    tests?: Prisma.ClientControlTestUncheckedUpdateManyWithoutClientControlNestedInput;
};
export type ClientControlUncheckedUpdateManyWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    controlId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    ownCode?: Prisma.StringFieldUpdateOperationsInput | string;
    clientInterpretation?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    sourceRef?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type ClientControlCountOutputType = {
    actionPlans: number;
    userControlAssignments: number;
    clientCauseControls: number;
    evaluations: number;
    evidenceRequirements: number;
    dimensions: number;
    tests: number;
};
export type ClientControlCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    actionPlans?: boolean | ClientControlCountOutputTypeCountActionPlansArgs;
    userControlAssignments?: boolean | ClientControlCountOutputTypeCountUserControlAssignmentsArgs;
    clientCauseControls?: boolean | ClientControlCountOutputTypeCountClientCauseControlsArgs;
    evaluations?: boolean | ClientControlCountOutputTypeCountEvaluationsArgs;
    evidenceRequirements?: boolean | ClientControlCountOutputTypeCountEvidenceRequirementsArgs;
    dimensions?: boolean | ClientControlCountOutputTypeCountDimensionsArgs;
    tests?: boolean | ClientControlCountOutputTypeCountTestsArgs;
};
export type ClientControlCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlCountOutputTypeSelect<ExtArgs> | null;
};
export type ClientControlCountOutputTypeCountActionPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ActionPlanWhereInput;
};
export type ClientControlCountOutputTypeCountUserControlAssignmentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserControlAssignmentWhereInput;
};
export type ClientControlCountOutputTypeCountClientCauseControlsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientCauseControlWhereInput;
};
export type ClientControlCountOutputTypeCountEvaluationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvaluationWhereInput;
};
export type ClientControlCountOutputTypeCountEvidenceRequirementsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvidenceRequirementWhereInput;
};
export type ClientControlCountOutputTypeCountDimensionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientControlDimensionWhereInput;
};
export type ClientControlCountOutputTypeCountTestsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientControlTestWhereInput;
};
export type ClientControlSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    controlId?: boolean;
    serviceId?: boolean;
    ownCode?: boolean;
    clientInterpretation?: boolean;
    type?: boolean;
    sourceRef?: boolean;
    isActive?: boolean;
    control?: boolean | Prisma.ClientControl$controlArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    actionPlans?: boolean | Prisma.ClientControl$actionPlansArgs<ExtArgs>;
    userControlAssignments?: boolean | Prisma.ClientControl$userControlAssignmentsArgs<ExtArgs>;
    clientCauseControls?: boolean | Prisma.ClientControl$clientCauseControlsArgs<ExtArgs>;
    evaluations?: boolean | Prisma.ClientControl$evaluationsArgs<ExtArgs>;
    evidenceRequirements?: boolean | Prisma.ClientControl$evidenceRequirementsArgs<ExtArgs>;
    dimensions?: boolean | Prisma.ClientControl$dimensionsArgs<ExtArgs>;
    tests?: boolean | Prisma.ClientControl$testsArgs<ExtArgs>;
    _count?: boolean | Prisma.ClientControlCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientControl"]>;
export type ClientControlSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    controlId?: boolean;
    serviceId?: boolean;
    ownCode?: boolean;
    clientInterpretation?: boolean;
    type?: boolean;
    sourceRef?: boolean;
    isActive?: boolean;
    control?: boolean | Prisma.ClientControl$controlArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientControl"]>;
export type ClientControlSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    controlId?: boolean;
    serviceId?: boolean;
    ownCode?: boolean;
    clientInterpretation?: boolean;
    type?: boolean;
    sourceRef?: boolean;
    isActive?: boolean;
    control?: boolean | Prisma.ClientControl$controlArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientControl"]>;
export type ClientControlSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    controlId?: boolean;
    serviceId?: boolean;
    ownCode?: boolean;
    clientInterpretation?: boolean;
    type?: boolean;
    sourceRef?: boolean;
    isActive?: boolean;
};
export type ClientControlOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "controlId" | "serviceId" | "ownCode" | "clientInterpretation" | "type" | "sourceRef" | "isActive", ExtArgs["result"]["clientControl"]>;
export type ClientControlInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ClientControl$controlArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    actionPlans?: boolean | Prisma.ClientControl$actionPlansArgs<ExtArgs>;
    userControlAssignments?: boolean | Prisma.ClientControl$userControlAssignmentsArgs<ExtArgs>;
    clientCauseControls?: boolean | Prisma.ClientControl$clientCauseControlsArgs<ExtArgs>;
    evaluations?: boolean | Prisma.ClientControl$evaluationsArgs<ExtArgs>;
    evidenceRequirements?: boolean | Prisma.ClientControl$evidenceRequirementsArgs<ExtArgs>;
    dimensions?: boolean | Prisma.ClientControl$dimensionsArgs<ExtArgs>;
    tests?: boolean | Prisma.ClientControl$testsArgs<ExtArgs>;
    _count?: boolean | Prisma.ClientControlCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ClientControlIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ClientControl$controlArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ClientControlIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    control?: boolean | Prisma.ClientControl$controlArgs<ExtArgs>;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ClientControlPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ClientControl";
    objects: {
        control: Prisma.$ControlPayload<ExtArgs> | null;
        service: Prisma.$ServicePayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
        actionPlans: Prisma.$ActionPlanPayload<ExtArgs>[];
        userControlAssignments: Prisma.$UserControlAssignmentPayload<ExtArgs>[];
        clientCauseControls: Prisma.$ClientCauseControlPayload<ExtArgs>[];
        evaluations: Prisma.$EvaluationPayload<ExtArgs>[];
        evidenceRequirements: Prisma.$EvidenceRequirementPayload<ExtArgs>[];
        dimensions: Prisma.$ClientControlDimensionPayload<ExtArgs>[];
        tests: Prisma.$ClientControlTestPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        controlId: string | null;
        serviceId: string;
        ownCode: string;
        clientInterpretation: string;
        type: $Enums.ControlDimensionType;
        sourceRef: string | null;
        isActive: boolean;
    }, ExtArgs["result"]["clientControl"]>;
    composites: {};
};
export type ClientControlGetPayload<S extends boolean | null | undefined | ClientControlDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ClientControlPayload, S>;
export type ClientControlCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ClientControlFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClientControlCountAggregateInputType | true;
};
export interface ClientControlDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ClientControl'];
        meta: {
            name: 'ClientControl';
        };
    };
    findUnique<T extends ClientControlFindUniqueArgs>(args: Prisma.SelectSubset<T, ClientControlFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ClientControlClient<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ClientControlFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ClientControlFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientControlClient<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ClientControlFindFirstArgs>(args?: Prisma.SelectSubset<T, ClientControlFindFirstArgs<ExtArgs>>): Prisma.Prisma__ClientControlClient<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ClientControlFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ClientControlFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientControlClient<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ClientControlFindManyArgs>(args?: Prisma.SelectSubset<T, ClientControlFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ClientControlCreateArgs>(args: Prisma.SelectSubset<T, ClientControlCreateArgs<ExtArgs>>): Prisma.Prisma__ClientControlClient<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ClientControlCreateManyArgs>(args?: Prisma.SelectSubset<T, ClientControlCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ClientControlCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ClientControlCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ClientControlDeleteArgs>(args: Prisma.SelectSubset<T, ClientControlDeleteArgs<ExtArgs>>): Prisma.Prisma__ClientControlClient<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ClientControlUpdateArgs>(args: Prisma.SelectSubset<T, ClientControlUpdateArgs<ExtArgs>>): Prisma.Prisma__ClientControlClient<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ClientControlDeleteManyArgs>(args?: Prisma.SelectSubset<T, ClientControlDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ClientControlUpdateManyArgs>(args: Prisma.SelectSubset<T, ClientControlUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ClientControlUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ClientControlUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ClientControlUpsertArgs>(args: Prisma.SelectSubset<T, ClientControlUpsertArgs<ExtArgs>>): Prisma.Prisma__ClientControlClient<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ClientControlCountArgs>(args?: Prisma.Subset<T, ClientControlCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ClientControlCountAggregateOutputType> : number>;
    aggregate<T extends ClientControlAggregateArgs>(args: Prisma.Subset<T, ClientControlAggregateArgs>): Prisma.PrismaPromise<GetClientControlAggregateType<T>>;
    groupBy<T extends ClientControlGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ClientControlGroupByArgs['orderBy'];
    } : {
        orderBy?: ClientControlGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ClientControlGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientControlGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ClientControlFieldRefs;
}
export interface Prisma__ClientControlClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    control<T extends Prisma.ClientControl$controlArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientControl$controlArgs<ExtArgs>>): Prisma.Prisma__ControlClient<runtime.Types.Result.GetResult<Prisma.$ControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    service<T extends Prisma.ServiceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ServiceDefaultArgs<ExtArgs>>): Prisma.Prisma__ServiceClient<runtime.Types.Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    actionPlans<T extends Prisma.ClientControl$actionPlansArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientControl$actionPlansArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    userControlAssignments<T extends Prisma.ClientControl$userControlAssignmentsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientControl$userControlAssignmentsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserControlAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    clientCauseControls<T extends Prisma.ClientControl$clientCauseControlsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientControl$clientCauseControlsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientCauseControlPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    evaluations<T extends Prisma.ClientControl$evaluationsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientControl$evaluationsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvaluationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    evidenceRequirements<T extends Prisma.ClientControl$evidenceRequirementsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientControl$evidenceRequirementsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    dimensions<T extends Prisma.ClientControl$dimensionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientControl$dimensionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientControlDimensionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    tests<T extends Prisma.ClientControl$testsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientControl$testsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientControlTestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ClientControlFieldRefs {
    readonly id: Prisma.FieldRef<"ClientControl", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ClientControl", 'String'>;
    readonly controlId: Prisma.FieldRef<"ClientControl", 'String'>;
    readonly serviceId: Prisma.FieldRef<"ClientControl", 'String'>;
    readonly ownCode: Prisma.FieldRef<"ClientControl", 'String'>;
    readonly clientInterpretation: Prisma.FieldRef<"ClientControl", 'String'>;
    readonly type: Prisma.FieldRef<"ClientControl", 'ControlDimensionType'>;
    readonly sourceRef: Prisma.FieldRef<"ClientControl", 'String'>;
    readonly isActive: Prisma.FieldRef<"ClientControl", 'Boolean'>;
}
export type ClientControlFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlOmit<ExtArgs> | null;
    include?: Prisma.ClientControlInclude<ExtArgs> | null;
    where: Prisma.ClientControlWhereUniqueInput;
};
export type ClientControlFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlOmit<ExtArgs> | null;
    include?: Prisma.ClientControlInclude<ExtArgs> | null;
    where: Prisma.ClientControlWhereUniqueInput;
};
export type ClientControlFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClientControlFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClientControlFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClientControlCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlOmit<ExtArgs> | null;
    include?: Prisma.ClientControlInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientControlCreateInput, Prisma.ClientControlUncheckedCreateInput>;
};
export type ClientControlCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ClientControlCreateManyInput | Prisma.ClientControlCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClientControlCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientControlOmit<ExtArgs> | null;
    data: Prisma.ClientControlCreateManyInput | Prisma.ClientControlCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ClientControlIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ClientControlUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlOmit<ExtArgs> | null;
    include?: Prisma.ClientControlInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientControlUpdateInput, Prisma.ClientControlUncheckedUpdateInput>;
    where: Prisma.ClientControlWhereUniqueInput;
};
export type ClientControlUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ClientControlUpdateManyMutationInput, Prisma.ClientControlUncheckedUpdateManyInput>;
    where?: Prisma.ClientControlWhereInput;
    limit?: number;
};
export type ClientControlUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientControlOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientControlUpdateManyMutationInput, Prisma.ClientControlUncheckedUpdateManyInput>;
    where?: Prisma.ClientControlWhereInput;
    limit?: number;
    include?: Prisma.ClientControlIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ClientControlUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlOmit<ExtArgs> | null;
    include?: Prisma.ClientControlInclude<ExtArgs> | null;
    where: Prisma.ClientControlWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlCreateInput, Prisma.ClientControlUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ClientControlUpdateInput, Prisma.ClientControlUncheckedUpdateInput>;
};
export type ClientControlDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlOmit<ExtArgs> | null;
    include?: Prisma.ClientControlInclude<ExtArgs> | null;
    where: Prisma.ClientControlWhereUniqueInput;
};
export type ClientControlDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientControlWhereInput;
    limit?: number;
};
export type ClientControl$controlArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ControlSelect<ExtArgs> | null;
    omit?: Prisma.ControlOmit<ExtArgs> | null;
    include?: Prisma.ControlInclude<ExtArgs> | null;
    where?: Prisma.ControlWhereInput;
};
export type ClientControl$actionPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
    where?: Prisma.ActionPlanWhereInput;
    orderBy?: Prisma.ActionPlanOrderByWithRelationInput | Prisma.ActionPlanOrderByWithRelationInput[];
    cursor?: Prisma.ActionPlanWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ActionPlanScalarFieldEnum | Prisma.ActionPlanScalarFieldEnum[];
};
export type ClientControl$userControlAssignmentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserControlAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.UserControlAssignmentOmit<ExtArgs> | null;
    include?: Prisma.UserControlAssignmentInclude<ExtArgs> | null;
    where?: Prisma.UserControlAssignmentWhereInput;
    orderBy?: Prisma.UserControlAssignmentOrderByWithRelationInput | Prisma.UserControlAssignmentOrderByWithRelationInput[];
    cursor?: Prisma.UserControlAssignmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserControlAssignmentScalarFieldEnum | Prisma.UserControlAssignmentScalarFieldEnum[];
};
export type ClientControl$clientCauseControlsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseControlOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseControlInclude<ExtArgs> | null;
    where?: Prisma.ClientCauseControlWhereInput;
    orderBy?: Prisma.ClientCauseControlOrderByWithRelationInput | Prisma.ClientCauseControlOrderByWithRelationInput[];
    cursor?: Prisma.ClientCauseControlWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientCauseControlScalarFieldEnum | Prisma.ClientCauseControlScalarFieldEnum[];
};
export type ClientControl$evaluationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClientControl$evidenceRequirementsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceRequirementSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceRequirementOmit<ExtArgs> | null;
    include?: Prisma.EvidenceRequirementInclude<ExtArgs> | null;
    where?: Prisma.EvidenceRequirementWhereInput;
    orderBy?: Prisma.EvidenceRequirementOrderByWithRelationInput | Prisma.EvidenceRequirementOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceRequirementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EvidenceRequirementScalarFieldEnum | Prisma.EvidenceRequirementScalarFieldEnum[];
};
export type ClientControl$dimensionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlDimensionSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlDimensionOmit<ExtArgs> | null;
    include?: Prisma.ClientControlDimensionInclude<ExtArgs> | null;
    where?: Prisma.ClientControlDimensionWhereInput;
    orderBy?: Prisma.ClientControlDimensionOrderByWithRelationInput | Prisma.ClientControlDimensionOrderByWithRelationInput[];
    cursor?: Prisma.ClientControlDimensionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientControlDimensionScalarFieldEnum | Prisma.ClientControlDimensionScalarFieldEnum[];
};
export type ClientControl$testsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlTestSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlTestOmit<ExtArgs> | null;
    include?: Prisma.ClientControlTestInclude<ExtArgs> | null;
    where?: Prisma.ClientControlTestWhereInput;
    orderBy?: Prisma.ClientControlTestOrderByWithRelationInput | Prisma.ClientControlTestOrderByWithRelationInput[];
    cursor?: Prisma.ClientControlTestWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientControlTestScalarFieldEnum | Prisma.ClientControlTestScalarFieldEnum[];
};
export type ClientControlDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlOmit<ExtArgs> | null;
    include?: Prisma.ClientControlInclude<ExtArgs> | null;
};
export {};
