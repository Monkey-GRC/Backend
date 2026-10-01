import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type RiskTreatmentModel = runtime.Types.Result.DefaultSelection<Prisma.$RiskTreatmentPayload>;
export type AggregateRiskTreatment = {
    _count: RiskTreatmentCountAggregateOutputType | null;
    _min: RiskTreatmentMinAggregateOutputType | null;
    _max: RiskTreatmentMaxAggregateOutputType | null;
};
export type RiskTreatmentMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientRiskId: string | null;
    responsibleId: string | null;
    decision: $Enums.RiskTreatmentDecision | null;
    dueDate: Date | null;
};
export type RiskTreatmentMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientRiskId: string | null;
    responsibleId: string | null;
    decision: $Enums.RiskTreatmentDecision | null;
    dueDate: Date | null;
};
export type RiskTreatmentCountAggregateOutputType = {
    id: number;
    tenantId: number;
    clientRiskId: number;
    responsibleId: number;
    decision: number;
    dueDate: number;
    _all: number;
};
export type RiskTreatmentMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientRiskId?: true;
    responsibleId?: true;
    decision?: true;
    dueDate?: true;
};
export type RiskTreatmentMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientRiskId?: true;
    responsibleId?: true;
    decision?: true;
    dueDate?: true;
};
export type RiskTreatmentCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientRiskId?: true;
    responsibleId?: true;
    decision?: true;
    dueDate?: true;
    _all?: true;
};
export type RiskTreatmentAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RiskTreatmentWhereInput;
    orderBy?: Prisma.RiskTreatmentOrderByWithRelationInput | Prisma.RiskTreatmentOrderByWithRelationInput[];
    cursor?: Prisma.RiskTreatmentWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | RiskTreatmentCountAggregateInputType;
    _min?: RiskTreatmentMinAggregateInputType;
    _max?: RiskTreatmentMaxAggregateInputType;
};
export type GetRiskTreatmentAggregateType<T extends RiskTreatmentAggregateArgs> = {
    [P in keyof T & keyof AggregateRiskTreatment]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRiskTreatment[P]> : Prisma.GetScalarType<T[P], AggregateRiskTreatment[P]>;
};
export type RiskTreatmentGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RiskTreatmentWhereInput;
    orderBy?: Prisma.RiskTreatmentOrderByWithAggregationInput | Prisma.RiskTreatmentOrderByWithAggregationInput[];
    by: Prisma.RiskTreatmentScalarFieldEnum[] | Prisma.RiskTreatmentScalarFieldEnum;
    having?: Prisma.RiskTreatmentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RiskTreatmentCountAggregateInputType | true;
    _min?: RiskTreatmentMinAggregateInputType;
    _max?: RiskTreatmentMaxAggregateInputType;
};
export type RiskTreatmentGroupByOutputType = {
    id: string;
    tenantId: string;
    clientRiskId: string;
    responsibleId: string;
    decision: $Enums.RiskTreatmentDecision;
    dueDate: Date;
    _count: RiskTreatmentCountAggregateOutputType | null;
    _min: RiskTreatmentMinAggregateOutputType | null;
    _max: RiskTreatmentMaxAggregateOutputType | null;
};
type GetRiskTreatmentGroupByPayload<T extends RiskTreatmentGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RiskTreatmentGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RiskTreatmentGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RiskTreatmentGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RiskTreatmentGroupByOutputType[P]>;
}>>;
export type RiskTreatmentWhereInput = {
    AND?: Prisma.RiskTreatmentWhereInput | Prisma.RiskTreatmentWhereInput[];
    OR?: Prisma.RiskTreatmentWhereInput[];
    NOT?: Prisma.RiskTreatmentWhereInput | Prisma.RiskTreatmentWhereInput[];
    id?: Prisma.UuidFilter<"RiskTreatment"> | string;
    tenantId?: Prisma.UuidFilter<"RiskTreatment"> | string;
    clientRiskId?: Prisma.UuidFilter<"RiskTreatment"> | string;
    responsibleId?: Prisma.UuidFilter<"RiskTreatment"> | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFilter<"RiskTreatment"> | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFilter<"RiskTreatment"> | Date | string;
    clientRisk?: Prisma.XOR<Prisma.ClientRiskScalarRelationFilter, Prisma.ClientRiskWhereInput>;
    responsibleUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type RiskTreatmentOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrder;
    decision?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    clientRisk?: Prisma.ClientRiskOrderByWithRelationInput;
    responsibleUser?: Prisma.UserOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type RiskTreatmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.RiskTreatmentWhereInput | Prisma.RiskTreatmentWhereInput[];
    OR?: Prisma.RiskTreatmentWhereInput[];
    NOT?: Prisma.RiskTreatmentWhereInput | Prisma.RiskTreatmentWhereInput[];
    tenantId?: Prisma.UuidFilter<"RiskTreatment"> | string;
    clientRiskId?: Prisma.UuidFilter<"RiskTreatment"> | string;
    responsibleId?: Prisma.UuidFilter<"RiskTreatment"> | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFilter<"RiskTreatment"> | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFilter<"RiskTreatment"> | Date | string;
    clientRisk?: Prisma.XOR<Prisma.ClientRiskScalarRelationFilter, Prisma.ClientRiskWhereInput>;
    responsibleUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id">;
export type RiskTreatmentOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrder;
    decision?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    _count?: Prisma.RiskTreatmentCountOrderByAggregateInput;
    _max?: Prisma.RiskTreatmentMaxOrderByAggregateInput;
    _min?: Prisma.RiskTreatmentMinOrderByAggregateInput;
};
export type RiskTreatmentScalarWhereWithAggregatesInput = {
    AND?: Prisma.RiskTreatmentScalarWhereWithAggregatesInput | Prisma.RiskTreatmentScalarWhereWithAggregatesInput[];
    OR?: Prisma.RiskTreatmentScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RiskTreatmentScalarWhereWithAggregatesInput | Prisma.RiskTreatmentScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"RiskTreatment"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"RiskTreatment"> | string;
    clientRiskId?: Prisma.UuidWithAggregatesFilter<"RiskTreatment"> | string;
    responsibleId?: Prisma.UuidWithAggregatesFilter<"RiskTreatment"> | string;
    decision?: Prisma.EnumRiskTreatmentDecisionWithAggregatesFilter<"RiskTreatment"> | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeWithAggregatesFilter<"RiskTreatment"> | Date | string;
};
export type RiskTreatmentCreateInput = {
    id?: string;
    decision: $Enums.RiskTreatmentDecision;
    dueDate: Date | string;
    clientRisk: Prisma.ClientRiskCreateNestedOneWithoutRiskTreatmentsInput;
    responsibleUser: Prisma.UserCreateNestedOneWithoutRiskTreatmentsResponsibleInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutRiskTreatmentsInput;
};
export type RiskTreatmentUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    clientRiskId: string;
    responsibleId: string;
    decision: $Enums.RiskTreatmentDecision;
    dueDate: Date | string;
};
export type RiskTreatmentUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFieldUpdateOperationsInput | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientRisk?: Prisma.ClientRiskUpdateOneRequiredWithoutRiskTreatmentsNestedInput;
    responsibleUser?: Prisma.UserUpdateOneRequiredWithoutRiskTreatmentsResponsibleNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutRiskTreatmentsNestedInput;
};
export type RiskTreatmentUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.StringFieldUpdateOperationsInput | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFieldUpdateOperationsInput | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RiskTreatmentCreateManyInput = {
    id?: string;
    tenantId: string;
    clientRiskId: string;
    responsibleId: string;
    decision: $Enums.RiskTreatmentDecision;
    dueDate: Date | string;
};
export type RiskTreatmentUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFieldUpdateOperationsInput | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RiskTreatmentUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.StringFieldUpdateOperationsInput | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFieldUpdateOperationsInput | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RiskTreatmentListRelationFilter = {
    every?: Prisma.RiskTreatmentWhereInput;
    some?: Prisma.RiskTreatmentWhereInput;
    none?: Prisma.RiskTreatmentWhereInput;
};
export type RiskTreatmentOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type RiskTreatmentCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrder;
    decision?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
};
export type RiskTreatmentMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrder;
    decision?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
};
export type RiskTreatmentMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrder;
    decision?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
};
export type RiskTreatmentCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutTenantInput, Prisma.RiskTreatmentUncheckedCreateWithoutTenantInput> | Prisma.RiskTreatmentCreateWithoutTenantInput[] | Prisma.RiskTreatmentUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.RiskTreatmentCreateOrConnectWithoutTenantInput | Prisma.RiskTreatmentCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.RiskTreatmentCreateManyTenantInputEnvelope;
    connect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
};
export type RiskTreatmentUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutTenantInput, Prisma.RiskTreatmentUncheckedCreateWithoutTenantInput> | Prisma.RiskTreatmentCreateWithoutTenantInput[] | Prisma.RiskTreatmentUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.RiskTreatmentCreateOrConnectWithoutTenantInput | Prisma.RiskTreatmentCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.RiskTreatmentCreateManyTenantInputEnvelope;
    connect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
};
export type RiskTreatmentUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutTenantInput, Prisma.RiskTreatmentUncheckedCreateWithoutTenantInput> | Prisma.RiskTreatmentCreateWithoutTenantInput[] | Prisma.RiskTreatmentUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.RiskTreatmentCreateOrConnectWithoutTenantInput | Prisma.RiskTreatmentCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.RiskTreatmentUpsertWithWhereUniqueWithoutTenantInput | Prisma.RiskTreatmentUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.RiskTreatmentCreateManyTenantInputEnvelope;
    set?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    disconnect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    delete?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    connect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    update?: Prisma.RiskTreatmentUpdateWithWhereUniqueWithoutTenantInput | Prisma.RiskTreatmentUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.RiskTreatmentUpdateManyWithWhereWithoutTenantInput | Prisma.RiskTreatmentUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.RiskTreatmentScalarWhereInput | Prisma.RiskTreatmentScalarWhereInput[];
};
export type RiskTreatmentUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutTenantInput, Prisma.RiskTreatmentUncheckedCreateWithoutTenantInput> | Prisma.RiskTreatmentCreateWithoutTenantInput[] | Prisma.RiskTreatmentUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.RiskTreatmentCreateOrConnectWithoutTenantInput | Prisma.RiskTreatmentCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.RiskTreatmentUpsertWithWhereUniqueWithoutTenantInput | Prisma.RiskTreatmentUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.RiskTreatmentCreateManyTenantInputEnvelope;
    set?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    disconnect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    delete?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    connect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    update?: Prisma.RiskTreatmentUpdateWithWhereUniqueWithoutTenantInput | Prisma.RiskTreatmentUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.RiskTreatmentUpdateManyWithWhereWithoutTenantInput | Prisma.RiskTreatmentUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.RiskTreatmentScalarWhereInput | Prisma.RiskTreatmentScalarWhereInput[];
};
export type RiskTreatmentCreateNestedManyWithoutResponsibleUserInput = {
    create?: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutResponsibleUserInput, Prisma.RiskTreatmentUncheckedCreateWithoutResponsibleUserInput> | Prisma.RiskTreatmentCreateWithoutResponsibleUserInput[] | Prisma.RiskTreatmentUncheckedCreateWithoutResponsibleUserInput[];
    connectOrCreate?: Prisma.RiskTreatmentCreateOrConnectWithoutResponsibleUserInput | Prisma.RiskTreatmentCreateOrConnectWithoutResponsibleUserInput[];
    createMany?: Prisma.RiskTreatmentCreateManyResponsibleUserInputEnvelope;
    connect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
};
export type RiskTreatmentUncheckedCreateNestedManyWithoutResponsibleUserInput = {
    create?: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutResponsibleUserInput, Prisma.RiskTreatmentUncheckedCreateWithoutResponsibleUserInput> | Prisma.RiskTreatmentCreateWithoutResponsibleUserInput[] | Prisma.RiskTreatmentUncheckedCreateWithoutResponsibleUserInput[];
    connectOrCreate?: Prisma.RiskTreatmentCreateOrConnectWithoutResponsibleUserInput | Prisma.RiskTreatmentCreateOrConnectWithoutResponsibleUserInput[];
    createMany?: Prisma.RiskTreatmentCreateManyResponsibleUserInputEnvelope;
    connect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
};
export type RiskTreatmentUpdateManyWithoutResponsibleUserNestedInput = {
    create?: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutResponsibleUserInput, Prisma.RiskTreatmentUncheckedCreateWithoutResponsibleUserInput> | Prisma.RiskTreatmentCreateWithoutResponsibleUserInput[] | Prisma.RiskTreatmentUncheckedCreateWithoutResponsibleUserInput[];
    connectOrCreate?: Prisma.RiskTreatmentCreateOrConnectWithoutResponsibleUserInput | Prisma.RiskTreatmentCreateOrConnectWithoutResponsibleUserInput[];
    upsert?: Prisma.RiskTreatmentUpsertWithWhereUniqueWithoutResponsibleUserInput | Prisma.RiskTreatmentUpsertWithWhereUniqueWithoutResponsibleUserInput[];
    createMany?: Prisma.RiskTreatmentCreateManyResponsibleUserInputEnvelope;
    set?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    disconnect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    delete?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    connect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    update?: Prisma.RiskTreatmentUpdateWithWhereUniqueWithoutResponsibleUserInput | Prisma.RiskTreatmentUpdateWithWhereUniqueWithoutResponsibleUserInput[];
    updateMany?: Prisma.RiskTreatmentUpdateManyWithWhereWithoutResponsibleUserInput | Prisma.RiskTreatmentUpdateManyWithWhereWithoutResponsibleUserInput[];
    deleteMany?: Prisma.RiskTreatmentScalarWhereInput | Prisma.RiskTreatmentScalarWhereInput[];
};
export type RiskTreatmentUncheckedUpdateManyWithoutResponsibleUserNestedInput = {
    create?: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutResponsibleUserInput, Prisma.RiskTreatmentUncheckedCreateWithoutResponsibleUserInput> | Prisma.RiskTreatmentCreateWithoutResponsibleUserInput[] | Prisma.RiskTreatmentUncheckedCreateWithoutResponsibleUserInput[];
    connectOrCreate?: Prisma.RiskTreatmentCreateOrConnectWithoutResponsibleUserInput | Prisma.RiskTreatmentCreateOrConnectWithoutResponsibleUserInput[];
    upsert?: Prisma.RiskTreatmentUpsertWithWhereUniqueWithoutResponsibleUserInput | Prisma.RiskTreatmentUpsertWithWhereUniqueWithoutResponsibleUserInput[];
    createMany?: Prisma.RiskTreatmentCreateManyResponsibleUserInputEnvelope;
    set?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    disconnect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    delete?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    connect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    update?: Prisma.RiskTreatmentUpdateWithWhereUniqueWithoutResponsibleUserInput | Prisma.RiskTreatmentUpdateWithWhereUniqueWithoutResponsibleUserInput[];
    updateMany?: Prisma.RiskTreatmentUpdateManyWithWhereWithoutResponsibleUserInput | Prisma.RiskTreatmentUpdateManyWithWhereWithoutResponsibleUserInput[];
    deleteMany?: Prisma.RiskTreatmentScalarWhereInput | Prisma.RiskTreatmentScalarWhereInput[];
};
export type EnumRiskTreatmentDecisionFieldUpdateOperationsInput = {
    set?: $Enums.RiskTreatmentDecision;
};
export type RiskTreatmentCreateNestedManyWithoutClientRiskInput = {
    create?: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutClientRiskInput, Prisma.RiskTreatmentUncheckedCreateWithoutClientRiskInput> | Prisma.RiskTreatmentCreateWithoutClientRiskInput[] | Prisma.RiskTreatmentUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.RiskTreatmentCreateOrConnectWithoutClientRiskInput | Prisma.RiskTreatmentCreateOrConnectWithoutClientRiskInput[];
    createMany?: Prisma.RiskTreatmentCreateManyClientRiskInputEnvelope;
    connect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
};
export type RiskTreatmentUncheckedCreateNestedManyWithoutClientRiskInput = {
    create?: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutClientRiskInput, Prisma.RiskTreatmentUncheckedCreateWithoutClientRiskInput> | Prisma.RiskTreatmentCreateWithoutClientRiskInput[] | Prisma.RiskTreatmentUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.RiskTreatmentCreateOrConnectWithoutClientRiskInput | Prisma.RiskTreatmentCreateOrConnectWithoutClientRiskInput[];
    createMany?: Prisma.RiskTreatmentCreateManyClientRiskInputEnvelope;
    connect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
};
export type RiskTreatmentUpdateManyWithoutClientRiskNestedInput = {
    create?: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutClientRiskInput, Prisma.RiskTreatmentUncheckedCreateWithoutClientRiskInput> | Prisma.RiskTreatmentCreateWithoutClientRiskInput[] | Prisma.RiskTreatmentUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.RiskTreatmentCreateOrConnectWithoutClientRiskInput | Prisma.RiskTreatmentCreateOrConnectWithoutClientRiskInput[];
    upsert?: Prisma.RiskTreatmentUpsertWithWhereUniqueWithoutClientRiskInput | Prisma.RiskTreatmentUpsertWithWhereUniqueWithoutClientRiskInput[];
    createMany?: Prisma.RiskTreatmentCreateManyClientRiskInputEnvelope;
    set?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    disconnect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    delete?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    connect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    update?: Prisma.RiskTreatmentUpdateWithWhereUniqueWithoutClientRiskInput | Prisma.RiskTreatmentUpdateWithWhereUniqueWithoutClientRiskInput[];
    updateMany?: Prisma.RiskTreatmentUpdateManyWithWhereWithoutClientRiskInput | Prisma.RiskTreatmentUpdateManyWithWhereWithoutClientRiskInput[];
    deleteMany?: Prisma.RiskTreatmentScalarWhereInput | Prisma.RiskTreatmentScalarWhereInput[];
};
export type RiskTreatmentUncheckedUpdateManyWithoutClientRiskNestedInput = {
    create?: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutClientRiskInput, Prisma.RiskTreatmentUncheckedCreateWithoutClientRiskInput> | Prisma.RiskTreatmentCreateWithoutClientRiskInput[] | Prisma.RiskTreatmentUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.RiskTreatmentCreateOrConnectWithoutClientRiskInput | Prisma.RiskTreatmentCreateOrConnectWithoutClientRiskInput[];
    upsert?: Prisma.RiskTreatmentUpsertWithWhereUniqueWithoutClientRiskInput | Prisma.RiskTreatmentUpsertWithWhereUniqueWithoutClientRiskInput[];
    createMany?: Prisma.RiskTreatmentCreateManyClientRiskInputEnvelope;
    set?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    disconnect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    delete?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    connect?: Prisma.RiskTreatmentWhereUniqueInput | Prisma.RiskTreatmentWhereUniqueInput[];
    update?: Prisma.RiskTreatmentUpdateWithWhereUniqueWithoutClientRiskInput | Prisma.RiskTreatmentUpdateWithWhereUniqueWithoutClientRiskInput[];
    updateMany?: Prisma.RiskTreatmentUpdateManyWithWhereWithoutClientRiskInput | Prisma.RiskTreatmentUpdateManyWithWhereWithoutClientRiskInput[];
    deleteMany?: Prisma.RiskTreatmentScalarWhereInput | Prisma.RiskTreatmentScalarWhereInput[];
};
export type RiskTreatmentCreateWithoutTenantInput = {
    id?: string;
    decision: $Enums.RiskTreatmentDecision;
    dueDate: Date | string;
    clientRisk: Prisma.ClientRiskCreateNestedOneWithoutRiskTreatmentsInput;
    responsibleUser: Prisma.UserCreateNestedOneWithoutRiskTreatmentsResponsibleInput;
};
export type RiskTreatmentUncheckedCreateWithoutTenantInput = {
    id?: string;
    clientRiskId: string;
    responsibleId: string;
    decision: $Enums.RiskTreatmentDecision;
    dueDate: Date | string;
};
export type RiskTreatmentCreateOrConnectWithoutTenantInput = {
    where: Prisma.RiskTreatmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutTenantInput, Prisma.RiskTreatmentUncheckedCreateWithoutTenantInput>;
};
export type RiskTreatmentCreateManyTenantInputEnvelope = {
    data: Prisma.RiskTreatmentCreateManyTenantInput | Prisma.RiskTreatmentCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type RiskTreatmentUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.RiskTreatmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.RiskTreatmentUpdateWithoutTenantInput, Prisma.RiskTreatmentUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutTenantInput, Prisma.RiskTreatmentUncheckedCreateWithoutTenantInput>;
};
export type RiskTreatmentUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.RiskTreatmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.RiskTreatmentUpdateWithoutTenantInput, Prisma.RiskTreatmentUncheckedUpdateWithoutTenantInput>;
};
export type RiskTreatmentUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.RiskTreatmentScalarWhereInput;
    data: Prisma.XOR<Prisma.RiskTreatmentUpdateManyMutationInput, Prisma.RiskTreatmentUncheckedUpdateManyWithoutTenantInput>;
};
export type RiskTreatmentScalarWhereInput = {
    AND?: Prisma.RiskTreatmentScalarWhereInput | Prisma.RiskTreatmentScalarWhereInput[];
    OR?: Prisma.RiskTreatmentScalarWhereInput[];
    NOT?: Prisma.RiskTreatmentScalarWhereInput | Prisma.RiskTreatmentScalarWhereInput[];
    id?: Prisma.UuidFilter<"RiskTreatment"> | string;
    tenantId?: Prisma.UuidFilter<"RiskTreatment"> | string;
    clientRiskId?: Prisma.UuidFilter<"RiskTreatment"> | string;
    responsibleId?: Prisma.UuidFilter<"RiskTreatment"> | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFilter<"RiskTreatment"> | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFilter<"RiskTreatment"> | Date | string;
};
export type RiskTreatmentCreateWithoutResponsibleUserInput = {
    id?: string;
    decision: $Enums.RiskTreatmentDecision;
    dueDate: Date | string;
    clientRisk: Prisma.ClientRiskCreateNestedOneWithoutRiskTreatmentsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutRiskTreatmentsInput;
};
export type RiskTreatmentUncheckedCreateWithoutResponsibleUserInput = {
    id?: string;
    tenantId: string;
    clientRiskId: string;
    decision: $Enums.RiskTreatmentDecision;
    dueDate: Date | string;
};
export type RiskTreatmentCreateOrConnectWithoutResponsibleUserInput = {
    where: Prisma.RiskTreatmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutResponsibleUserInput, Prisma.RiskTreatmentUncheckedCreateWithoutResponsibleUserInput>;
};
export type RiskTreatmentCreateManyResponsibleUserInputEnvelope = {
    data: Prisma.RiskTreatmentCreateManyResponsibleUserInput | Prisma.RiskTreatmentCreateManyResponsibleUserInput[];
    skipDuplicates?: boolean;
};
export type RiskTreatmentUpsertWithWhereUniqueWithoutResponsibleUserInput = {
    where: Prisma.RiskTreatmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.RiskTreatmentUpdateWithoutResponsibleUserInput, Prisma.RiskTreatmentUncheckedUpdateWithoutResponsibleUserInput>;
    create: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutResponsibleUserInput, Prisma.RiskTreatmentUncheckedCreateWithoutResponsibleUserInput>;
};
export type RiskTreatmentUpdateWithWhereUniqueWithoutResponsibleUserInput = {
    where: Prisma.RiskTreatmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.RiskTreatmentUpdateWithoutResponsibleUserInput, Prisma.RiskTreatmentUncheckedUpdateWithoutResponsibleUserInput>;
};
export type RiskTreatmentUpdateManyWithWhereWithoutResponsibleUserInput = {
    where: Prisma.RiskTreatmentScalarWhereInput;
    data: Prisma.XOR<Prisma.RiskTreatmentUpdateManyMutationInput, Prisma.RiskTreatmentUncheckedUpdateManyWithoutResponsibleUserInput>;
};
export type RiskTreatmentCreateWithoutClientRiskInput = {
    id?: string;
    decision: $Enums.RiskTreatmentDecision;
    dueDate: Date | string;
    responsibleUser: Prisma.UserCreateNestedOneWithoutRiskTreatmentsResponsibleInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutRiskTreatmentsInput;
};
export type RiskTreatmentUncheckedCreateWithoutClientRiskInput = {
    id?: string;
    tenantId: string;
    responsibleId: string;
    decision: $Enums.RiskTreatmentDecision;
    dueDate: Date | string;
};
export type RiskTreatmentCreateOrConnectWithoutClientRiskInput = {
    where: Prisma.RiskTreatmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutClientRiskInput, Prisma.RiskTreatmentUncheckedCreateWithoutClientRiskInput>;
};
export type RiskTreatmentCreateManyClientRiskInputEnvelope = {
    data: Prisma.RiskTreatmentCreateManyClientRiskInput | Prisma.RiskTreatmentCreateManyClientRiskInput[];
    skipDuplicates?: boolean;
};
export type RiskTreatmentUpsertWithWhereUniqueWithoutClientRiskInput = {
    where: Prisma.RiskTreatmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.RiskTreatmentUpdateWithoutClientRiskInput, Prisma.RiskTreatmentUncheckedUpdateWithoutClientRiskInput>;
    create: Prisma.XOR<Prisma.RiskTreatmentCreateWithoutClientRiskInput, Prisma.RiskTreatmentUncheckedCreateWithoutClientRiskInput>;
};
export type RiskTreatmentUpdateWithWhereUniqueWithoutClientRiskInput = {
    where: Prisma.RiskTreatmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.RiskTreatmentUpdateWithoutClientRiskInput, Prisma.RiskTreatmentUncheckedUpdateWithoutClientRiskInput>;
};
export type RiskTreatmentUpdateManyWithWhereWithoutClientRiskInput = {
    where: Prisma.RiskTreatmentScalarWhereInput;
    data: Prisma.XOR<Prisma.RiskTreatmentUpdateManyMutationInput, Prisma.RiskTreatmentUncheckedUpdateManyWithoutClientRiskInput>;
};
export type RiskTreatmentCreateManyTenantInput = {
    id?: string;
    clientRiskId: string;
    responsibleId: string;
    decision: $Enums.RiskTreatmentDecision;
    dueDate: Date | string;
};
export type RiskTreatmentUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFieldUpdateOperationsInput | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientRisk?: Prisma.ClientRiskUpdateOneRequiredWithoutRiskTreatmentsNestedInput;
    responsibleUser?: Prisma.UserUpdateOneRequiredWithoutRiskTreatmentsResponsibleNestedInput;
};
export type RiskTreatmentUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.StringFieldUpdateOperationsInput | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFieldUpdateOperationsInput | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RiskTreatmentUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.StringFieldUpdateOperationsInput | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFieldUpdateOperationsInput | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RiskTreatmentCreateManyResponsibleUserInput = {
    id?: string;
    tenantId: string;
    clientRiskId: string;
    decision: $Enums.RiskTreatmentDecision;
    dueDate: Date | string;
};
export type RiskTreatmentUpdateWithoutResponsibleUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFieldUpdateOperationsInput | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientRisk?: Prisma.ClientRiskUpdateOneRequiredWithoutRiskTreatmentsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutRiskTreatmentsNestedInput;
};
export type RiskTreatmentUncheckedUpdateWithoutResponsibleUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFieldUpdateOperationsInput | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RiskTreatmentUncheckedUpdateManyWithoutResponsibleUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFieldUpdateOperationsInput | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RiskTreatmentCreateManyClientRiskInput = {
    id?: string;
    tenantId: string;
    responsibleId: string;
    decision: $Enums.RiskTreatmentDecision;
    dueDate: Date | string;
};
export type RiskTreatmentUpdateWithoutClientRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFieldUpdateOperationsInput | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    responsibleUser?: Prisma.UserUpdateOneRequiredWithoutRiskTreatmentsResponsibleNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutRiskTreatmentsNestedInput;
};
export type RiskTreatmentUncheckedUpdateWithoutClientRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.StringFieldUpdateOperationsInput | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFieldUpdateOperationsInput | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RiskTreatmentUncheckedUpdateManyWithoutClientRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.StringFieldUpdateOperationsInput | string;
    decision?: Prisma.EnumRiskTreatmentDecisionFieldUpdateOperationsInput | $Enums.RiskTreatmentDecision;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RiskTreatmentSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientRiskId?: boolean;
    responsibleId?: boolean;
    decision?: boolean;
    dueDate?: boolean;
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    responsibleUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["riskTreatment"]>;
export type RiskTreatmentSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientRiskId?: boolean;
    responsibleId?: boolean;
    decision?: boolean;
    dueDate?: boolean;
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    responsibleUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["riskTreatment"]>;
export type RiskTreatmentSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientRiskId?: boolean;
    responsibleId?: boolean;
    decision?: boolean;
    dueDate?: boolean;
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    responsibleUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["riskTreatment"]>;
export type RiskTreatmentSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    clientRiskId?: boolean;
    responsibleId?: boolean;
    decision?: boolean;
    dueDate?: boolean;
};
export type RiskTreatmentOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "clientRiskId" | "responsibleId" | "decision" | "dueDate", ExtArgs["result"]["riskTreatment"]>;
export type RiskTreatmentInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    responsibleUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type RiskTreatmentIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    responsibleUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type RiskTreatmentIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    responsibleUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $RiskTreatmentPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "RiskTreatment";
    objects: {
        clientRisk: Prisma.$ClientRiskPayload<ExtArgs>;
        responsibleUser: Prisma.$UserPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        clientRiskId: string;
        responsibleId: string;
        decision: $Enums.RiskTreatmentDecision;
        dueDate: Date;
    }, ExtArgs["result"]["riskTreatment"]>;
    composites: {};
};
export type RiskTreatmentGetPayload<S extends boolean | null | undefined | RiskTreatmentDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RiskTreatmentPayload, S>;
export type RiskTreatmentCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RiskTreatmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RiskTreatmentCountAggregateInputType | true;
};
export interface RiskTreatmentDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['RiskTreatment'];
        meta: {
            name: 'RiskTreatment';
        };
    };
    findUnique<T extends RiskTreatmentFindUniqueArgs>(args: Prisma.SelectSubset<T, RiskTreatmentFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RiskTreatmentClient<runtime.Types.Result.GetResult<Prisma.$RiskTreatmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends RiskTreatmentFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RiskTreatmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RiskTreatmentClient<runtime.Types.Result.GetResult<Prisma.$RiskTreatmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends RiskTreatmentFindFirstArgs>(args?: Prisma.SelectSubset<T, RiskTreatmentFindFirstArgs<ExtArgs>>): Prisma.Prisma__RiskTreatmentClient<runtime.Types.Result.GetResult<Prisma.$RiskTreatmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends RiskTreatmentFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RiskTreatmentFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RiskTreatmentClient<runtime.Types.Result.GetResult<Prisma.$RiskTreatmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends RiskTreatmentFindManyArgs>(args?: Prisma.SelectSubset<T, RiskTreatmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RiskTreatmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends RiskTreatmentCreateArgs>(args: Prisma.SelectSubset<T, RiskTreatmentCreateArgs<ExtArgs>>): Prisma.Prisma__RiskTreatmentClient<runtime.Types.Result.GetResult<Prisma.$RiskTreatmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends RiskTreatmentCreateManyArgs>(args?: Prisma.SelectSubset<T, RiskTreatmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends RiskTreatmentCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RiskTreatmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RiskTreatmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends RiskTreatmentDeleteArgs>(args: Prisma.SelectSubset<T, RiskTreatmentDeleteArgs<ExtArgs>>): Prisma.Prisma__RiskTreatmentClient<runtime.Types.Result.GetResult<Prisma.$RiskTreatmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends RiskTreatmentUpdateArgs>(args: Prisma.SelectSubset<T, RiskTreatmentUpdateArgs<ExtArgs>>): Prisma.Prisma__RiskTreatmentClient<runtime.Types.Result.GetResult<Prisma.$RiskTreatmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends RiskTreatmentDeleteManyArgs>(args?: Prisma.SelectSubset<T, RiskTreatmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends RiskTreatmentUpdateManyArgs>(args: Prisma.SelectSubset<T, RiskTreatmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends RiskTreatmentUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RiskTreatmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RiskTreatmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends RiskTreatmentUpsertArgs>(args: Prisma.SelectSubset<T, RiskTreatmentUpsertArgs<ExtArgs>>): Prisma.Prisma__RiskTreatmentClient<runtime.Types.Result.GetResult<Prisma.$RiskTreatmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends RiskTreatmentCountArgs>(args?: Prisma.Subset<T, RiskTreatmentCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RiskTreatmentCountAggregateOutputType> : number>;
    aggregate<T extends RiskTreatmentAggregateArgs>(args: Prisma.Subset<T, RiskTreatmentAggregateArgs>): Prisma.PrismaPromise<GetRiskTreatmentAggregateType<T>>;
    groupBy<T extends RiskTreatmentGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RiskTreatmentGroupByArgs['orderBy'];
    } : {
        orderBy?: RiskTreatmentGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RiskTreatmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRiskTreatmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: RiskTreatmentFieldRefs;
}
export interface Prisma__RiskTreatmentClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    clientRisk<T extends Prisma.ClientRiskDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientRiskDefaultArgs<ExtArgs>>): Prisma.Prisma__ClientRiskClient<runtime.Types.Result.GetResult<Prisma.$ClientRiskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    responsibleUser<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface RiskTreatmentFieldRefs {
    readonly id: Prisma.FieldRef<"RiskTreatment", 'String'>;
    readonly tenantId: Prisma.FieldRef<"RiskTreatment", 'String'>;
    readonly clientRiskId: Prisma.FieldRef<"RiskTreatment", 'String'>;
    readonly responsibleId: Prisma.FieldRef<"RiskTreatment", 'String'>;
    readonly decision: Prisma.FieldRef<"RiskTreatment", 'RiskTreatmentDecision'>;
    readonly dueDate: Prisma.FieldRef<"RiskTreatment", 'DateTime'>;
}
export type RiskTreatmentFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskTreatmentSelect<ExtArgs> | null;
    omit?: Prisma.RiskTreatmentOmit<ExtArgs> | null;
    include?: Prisma.RiskTreatmentInclude<ExtArgs> | null;
    where: Prisma.RiskTreatmentWhereUniqueInput;
};
export type RiskTreatmentFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskTreatmentSelect<ExtArgs> | null;
    omit?: Prisma.RiskTreatmentOmit<ExtArgs> | null;
    include?: Prisma.RiskTreatmentInclude<ExtArgs> | null;
    where: Prisma.RiskTreatmentWhereUniqueInput;
};
export type RiskTreatmentFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskTreatmentSelect<ExtArgs> | null;
    omit?: Prisma.RiskTreatmentOmit<ExtArgs> | null;
    include?: Prisma.RiskTreatmentInclude<ExtArgs> | null;
    where?: Prisma.RiskTreatmentWhereInput;
    orderBy?: Prisma.RiskTreatmentOrderByWithRelationInput | Prisma.RiskTreatmentOrderByWithRelationInput[];
    cursor?: Prisma.RiskTreatmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RiskTreatmentScalarFieldEnum | Prisma.RiskTreatmentScalarFieldEnum[];
};
export type RiskTreatmentFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskTreatmentSelect<ExtArgs> | null;
    omit?: Prisma.RiskTreatmentOmit<ExtArgs> | null;
    include?: Prisma.RiskTreatmentInclude<ExtArgs> | null;
    where?: Prisma.RiskTreatmentWhereInput;
    orderBy?: Prisma.RiskTreatmentOrderByWithRelationInput | Prisma.RiskTreatmentOrderByWithRelationInput[];
    cursor?: Prisma.RiskTreatmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RiskTreatmentScalarFieldEnum | Prisma.RiskTreatmentScalarFieldEnum[];
};
export type RiskTreatmentFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskTreatmentSelect<ExtArgs> | null;
    omit?: Prisma.RiskTreatmentOmit<ExtArgs> | null;
    include?: Prisma.RiskTreatmentInclude<ExtArgs> | null;
    where?: Prisma.RiskTreatmentWhereInput;
    orderBy?: Prisma.RiskTreatmentOrderByWithRelationInput | Prisma.RiskTreatmentOrderByWithRelationInput[];
    cursor?: Prisma.RiskTreatmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RiskTreatmentScalarFieldEnum | Prisma.RiskTreatmentScalarFieldEnum[];
};
export type RiskTreatmentCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskTreatmentSelect<ExtArgs> | null;
    omit?: Prisma.RiskTreatmentOmit<ExtArgs> | null;
    include?: Prisma.RiskTreatmentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RiskTreatmentCreateInput, Prisma.RiskTreatmentUncheckedCreateInput>;
};
export type RiskTreatmentCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.RiskTreatmentCreateManyInput | Prisma.RiskTreatmentCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RiskTreatmentCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskTreatmentSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RiskTreatmentOmit<ExtArgs> | null;
    data: Prisma.RiskTreatmentCreateManyInput | Prisma.RiskTreatmentCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.RiskTreatmentIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type RiskTreatmentUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskTreatmentSelect<ExtArgs> | null;
    omit?: Prisma.RiskTreatmentOmit<ExtArgs> | null;
    include?: Prisma.RiskTreatmentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RiskTreatmentUpdateInput, Prisma.RiskTreatmentUncheckedUpdateInput>;
    where: Prisma.RiskTreatmentWhereUniqueInput;
};
export type RiskTreatmentUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.RiskTreatmentUpdateManyMutationInput, Prisma.RiskTreatmentUncheckedUpdateManyInput>;
    where?: Prisma.RiskTreatmentWhereInput;
    limit?: number;
};
export type RiskTreatmentUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskTreatmentSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RiskTreatmentOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RiskTreatmentUpdateManyMutationInput, Prisma.RiskTreatmentUncheckedUpdateManyInput>;
    where?: Prisma.RiskTreatmentWhereInput;
    limit?: number;
    include?: Prisma.RiskTreatmentIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type RiskTreatmentUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskTreatmentSelect<ExtArgs> | null;
    omit?: Prisma.RiskTreatmentOmit<ExtArgs> | null;
    include?: Prisma.RiskTreatmentInclude<ExtArgs> | null;
    where: Prisma.RiskTreatmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.RiskTreatmentCreateInput, Prisma.RiskTreatmentUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.RiskTreatmentUpdateInput, Prisma.RiskTreatmentUncheckedUpdateInput>;
};
export type RiskTreatmentDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskTreatmentSelect<ExtArgs> | null;
    omit?: Prisma.RiskTreatmentOmit<ExtArgs> | null;
    include?: Prisma.RiskTreatmentInclude<ExtArgs> | null;
    where: Prisma.RiskTreatmentWhereUniqueInput;
};
export type RiskTreatmentDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RiskTreatmentWhereInput;
    limit?: number;
};
export type RiskTreatmentDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RiskTreatmentSelect<ExtArgs> | null;
    omit?: Prisma.RiskTreatmentOmit<ExtArgs> | null;
    include?: Prisma.RiskTreatmentInclude<ExtArgs> | null;
};
export {};
