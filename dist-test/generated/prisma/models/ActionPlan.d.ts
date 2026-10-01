import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ActionPlanModel = runtime.Types.Result.DefaultSelection<Prisma.$ActionPlanPayload>;
export type AggregateActionPlan = {
    _count: ActionPlanCountAggregateOutputType | null;
    _min: ActionPlanMinAggregateOutputType | null;
    _max: ActionPlanMaxAggregateOutputType | null;
};
export type ActionPlanMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientControlId: string | null;
    responsibleId: string | null;
    actionDescription: string | null;
    dueDate: Date | null;
    status: $Enums.ActionPlanStatus | null;
};
export type ActionPlanMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientControlId: string | null;
    responsibleId: string | null;
    actionDescription: string | null;
    dueDate: Date | null;
    status: $Enums.ActionPlanStatus | null;
};
export type ActionPlanCountAggregateOutputType = {
    id: number;
    tenantId: number;
    clientControlId: number;
    responsibleId: number;
    actionDescription: number;
    dueDate: number;
    status: number;
    _all: number;
};
export type ActionPlanMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientControlId?: true;
    responsibleId?: true;
    actionDescription?: true;
    dueDate?: true;
    status?: true;
};
export type ActionPlanMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientControlId?: true;
    responsibleId?: true;
    actionDescription?: true;
    dueDate?: true;
    status?: true;
};
export type ActionPlanCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientControlId?: true;
    responsibleId?: true;
    actionDescription?: true;
    dueDate?: true;
    status?: true;
    _all?: true;
};
export type ActionPlanAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ActionPlanWhereInput;
    orderBy?: Prisma.ActionPlanOrderByWithRelationInput | Prisma.ActionPlanOrderByWithRelationInput[];
    cursor?: Prisma.ActionPlanWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ActionPlanCountAggregateInputType;
    _min?: ActionPlanMinAggregateInputType;
    _max?: ActionPlanMaxAggregateInputType;
};
export type GetActionPlanAggregateType<T extends ActionPlanAggregateArgs> = {
    [P in keyof T & keyof AggregateActionPlan]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateActionPlan[P]> : Prisma.GetScalarType<T[P], AggregateActionPlan[P]>;
};
export type ActionPlanGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ActionPlanWhereInput;
    orderBy?: Prisma.ActionPlanOrderByWithAggregationInput | Prisma.ActionPlanOrderByWithAggregationInput[];
    by: Prisma.ActionPlanScalarFieldEnum[] | Prisma.ActionPlanScalarFieldEnum;
    having?: Prisma.ActionPlanScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ActionPlanCountAggregateInputType | true;
    _min?: ActionPlanMinAggregateInputType;
    _max?: ActionPlanMaxAggregateInputType;
};
export type ActionPlanGroupByOutputType = {
    id: string;
    tenantId: string;
    clientControlId: string;
    responsibleId: string;
    actionDescription: string;
    dueDate: Date;
    status: $Enums.ActionPlanStatus;
    _count: ActionPlanCountAggregateOutputType | null;
    _min: ActionPlanMinAggregateOutputType | null;
    _max: ActionPlanMaxAggregateOutputType | null;
};
type GetActionPlanGroupByPayload<T extends ActionPlanGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ActionPlanGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ActionPlanGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ActionPlanGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ActionPlanGroupByOutputType[P]>;
}>>;
export type ActionPlanWhereInput = {
    AND?: Prisma.ActionPlanWhereInput | Prisma.ActionPlanWhereInput[];
    OR?: Prisma.ActionPlanWhereInput[];
    NOT?: Prisma.ActionPlanWhereInput | Prisma.ActionPlanWhereInput[];
    id?: Prisma.UuidFilter<"ActionPlan"> | string;
    tenantId?: Prisma.UuidFilter<"ActionPlan"> | string;
    clientControlId?: Prisma.UuidFilter<"ActionPlan"> | string;
    responsibleId?: Prisma.UuidFilter<"ActionPlan"> | string;
    actionDescription?: Prisma.StringFilter<"ActionPlan"> | string;
    dueDate?: Prisma.DateTimeFilter<"ActionPlan"> | Date | string;
    status?: Prisma.EnumActionPlanStatusFilter<"ActionPlan"> | $Enums.ActionPlanStatus;
    clientControl?: Prisma.XOR<Prisma.ClientControlScalarRelationFilter, Prisma.ClientControlWhereInput>;
    responsibleUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type ActionPlanOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrder;
    actionDescription?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    clientControl?: Prisma.ClientControlOrderByWithRelationInput;
    responsibleUser?: Prisma.UserOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type ActionPlanWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ActionPlanWhereInput | Prisma.ActionPlanWhereInput[];
    OR?: Prisma.ActionPlanWhereInput[];
    NOT?: Prisma.ActionPlanWhereInput | Prisma.ActionPlanWhereInput[];
    tenantId?: Prisma.UuidFilter<"ActionPlan"> | string;
    clientControlId?: Prisma.UuidFilter<"ActionPlan"> | string;
    responsibleId?: Prisma.UuidFilter<"ActionPlan"> | string;
    actionDescription?: Prisma.StringFilter<"ActionPlan"> | string;
    dueDate?: Prisma.DateTimeFilter<"ActionPlan"> | Date | string;
    status?: Prisma.EnumActionPlanStatusFilter<"ActionPlan"> | $Enums.ActionPlanStatus;
    clientControl?: Prisma.XOR<Prisma.ClientControlScalarRelationFilter, Prisma.ClientControlWhereInput>;
    responsibleUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id">;
export type ActionPlanOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrder;
    actionDescription?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    _count?: Prisma.ActionPlanCountOrderByAggregateInput;
    _max?: Prisma.ActionPlanMaxOrderByAggregateInput;
    _min?: Prisma.ActionPlanMinOrderByAggregateInput;
};
export type ActionPlanScalarWhereWithAggregatesInput = {
    AND?: Prisma.ActionPlanScalarWhereWithAggregatesInput | Prisma.ActionPlanScalarWhereWithAggregatesInput[];
    OR?: Prisma.ActionPlanScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ActionPlanScalarWhereWithAggregatesInput | Prisma.ActionPlanScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ActionPlan"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ActionPlan"> | string;
    clientControlId?: Prisma.UuidWithAggregatesFilter<"ActionPlan"> | string;
    responsibleId?: Prisma.UuidWithAggregatesFilter<"ActionPlan"> | string;
    actionDescription?: Prisma.StringWithAggregatesFilter<"ActionPlan"> | string;
    dueDate?: Prisma.DateTimeWithAggregatesFilter<"ActionPlan"> | Date | string;
    status?: Prisma.EnumActionPlanStatusWithAggregatesFilter<"ActionPlan"> | $Enums.ActionPlanStatus;
};
export type ActionPlanCreateInput = {
    id?: string;
    actionDescription: string;
    dueDate: Date | string;
    status: $Enums.ActionPlanStatus;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutActionPlansInput;
    responsibleUser: Prisma.UserCreateNestedOneWithoutActionPlansResponsibleInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutActionPlansInput;
};
export type ActionPlanUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
    responsibleId: string;
    actionDescription: string;
    dueDate: Date | string;
    status: $Enums.ActionPlanStatus;
};
export type ActionPlanUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumActionPlanStatusFieldUpdateOperationsInput | $Enums.ActionPlanStatus;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutActionPlansNestedInput;
    responsibleUser?: Prisma.UserUpdateOneRequiredWithoutActionPlansResponsibleNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutActionPlansNestedInput;
};
export type ActionPlanUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumActionPlanStatusFieldUpdateOperationsInput | $Enums.ActionPlanStatus;
};
export type ActionPlanCreateManyInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
    responsibleId: string;
    actionDescription: string;
    dueDate: Date | string;
    status: $Enums.ActionPlanStatus;
};
export type ActionPlanUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumActionPlanStatusFieldUpdateOperationsInput | $Enums.ActionPlanStatus;
};
export type ActionPlanUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumActionPlanStatusFieldUpdateOperationsInput | $Enums.ActionPlanStatus;
};
export type ActionPlanListRelationFilter = {
    every?: Prisma.ActionPlanWhereInput;
    some?: Prisma.ActionPlanWhereInput;
    none?: Prisma.ActionPlanWhereInput;
};
export type ActionPlanOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ActionPlanCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrder;
    actionDescription?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
};
export type ActionPlanMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrder;
    actionDescription?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
};
export type ActionPlanMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    responsibleId?: Prisma.SortOrder;
    actionDescription?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
};
export type ActionPlanCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutTenantInput, Prisma.ActionPlanUncheckedCreateWithoutTenantInput> | Prisma.ActionPlanCreateWithoutTenantInput[] | Prisma.ActionPlanUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutTenantInput | Prisma.ActionPlanCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ActionPlanCreateManyTenantInputEnvelope;
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
};
export type ActionPlanUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutTenantInput, Prisma.ActionPlanUncheckedCreateWithoutTenantInput> | Prisma.ActionPlanCreateWithoutTenantInput[] | Prisma.ActionPlanUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutTenantInput | Prisma.ActionPlanCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ActionPlanCreateManyTenantInputEnvelope;
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
};
export type ActionPlanUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutTenantInput, Prisma.ActionPlanUncheckedCreateWithoutTenantInput> | Prisma.ActionPlanCreateWithoutTenantInput[] | Prisma.ActionPlanUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutTenantInput | Prisma.ActionPlanCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ActionPlanUpsertWithWhereUniqueWithoutTenantInput | Prisma.ActionPlanUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ActionPlanCreateManyTenantInputEnvelope;
    set?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    disconnect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    delete?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    update?: Prisma.ActionPlanUpdateWithWhereUniqueWithoutTenantInput | Prisma.ActionPlanUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ActionPlanUpdateManyWithWhereWithoutTenantInput | Prisma.ActionPlanUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ActionPlanScalarWhereInput | Prisma.ActionPlanScalarWhereInput[];
};
export type ActionPlanUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutTenantInput, Prisma.ActionPlanUncheckedCreateWithoutTenantInput> | Prisma.ActionPlanCreateWithoutTenantInput[] | Prisma.ActionPlanUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutTenantInput | Prisma.ActionPlanCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ActionPlanUpsertWithWhereUniqueWithoutTenantInput | Prisma.ActionPlanUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ActionPlanCreateManyTenantInputEnvelope;
    set?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    disconnect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    delete?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    update?: Prisma.ActionPlanUpdateWithWhereUniqueWithoutTenantInput | Prisma.ActionPlanUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ActionPlanUpdateManyWithWhereWithoutTenantInput | Prisma.ActionPlanUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ActionPlanScalarWhereInput | Prisma.ActionPlanScalarWhereInput[];
};
export type ActionPlanCreateNestedManyWithoutResponsibleUserInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutResponsibleUserInput, Prisma.ActionPlanUncheckedCreateWithoutResponsibleUserInput> | Prisma.ActionPlanCreateWithoutResponsibleUserInput[] | Prisma.ActionPlanUncheckedCreateWithoutResponsibleUserInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutResponsibleUserInput | Prisma.ActionPlanCreateOrConnectWithoutResponsibleUserInput[];
    createMany?: Prisma.ActionPlanCreateManyResponsibleUserInputEnvelope;
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
};
export type ActionPlanUncheckedCreateNestedManyWithoutResponsibleUserInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutResponsibleUserInput, Prisma.ActionPlanUncheckedCreateWithoutResponsibleUserInput> | Prisma.ActionPlanCreateWithoutResponsibleUserInput[] | Prisma.ActionPlanUncheckedCreateWithoutResponsibleUserInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutResponsibleUserInput | Prisma.ActionPlanCreateOrConnectWithoutResponsibleUserInput[];
    createMany?: Prisma.ActionPlanCreateManyResponsibleUserInputEnvelope;
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
};
export type ActionPlanUpdateManyWithoutResponsibleUserNestedInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutResponsibleUserInput, Prisma.ActionPlanUncheckedCreateWithoutResponsibleUserInput> | Prisma.ActionPlanCreateWithoutResponsibleUserInput[] | Prisma.ActionPlanUncheckedCreateWithoutResponsibleUserInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutResponsibleUserInput | Prisma.ActionPlanCreateOrConnectWithoutResponsibleUserInput[];
    upsert?: Prisma.ActionPlanUpsertWithWhereUniqueWithoutResponsibleUserInput | Prisma.ActionPlanUpsertWithWhereUniqueWithoutResponsibleUserInput[];
    createMany?: Prisma.ActionPlanCreateManyResponsibleUserInputEnvelope;
    set?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    disconnect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    delete?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    update?: Prisma.ActionPlanUpdateWithWhereUniqueWithoutResponsibleUserInput | Prisma.ActionPlanUpdateWithWhereUniqueWithoutResponsibleUserInput[];
    updateMany?: Prisma.ActionPlanUpdateManyWithWhereWithoutResponsibleUserInput | Prisma.ActionPlanUpdateManyWithWhereWithoutResponsibleUserInput[];
    deleteMany?: Prisma.ActionPlanScalarWhereInput | Prisma.ActionPlanScalarWhereInput[];
};
export type ActionPlanUncheckedUpdateManyWithoutResponsibleUserNestedInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutResponsibleUserInput, Prisma.ActionPlanUncheckedCreateWithoutResponsibleUserInput> | Prisma.ActionPlanCreateWithoutResponsibleUserInput[] | Prisma.ActionPlanUncheckedCreateWithoutResponsibleUserInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutResponsibleUserInput | Prisma.ActionPlanCreateOrConnectWithoutResponsibleUserInput[];
    upsert?: Prisma.ActionPlanUpsertWithWhereUniqueWithoutResponsibleUserInput | Prisma.ActionPlanUpsertWithWhereUniqueWithoutResponsibleUserInput[];
    createMany?: Prisma.ActionPlanCreateManyResponsibleUserInputEnvelope;
    set?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    disconnect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    delete?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    update?: Prisma.ActionPlanUpdateWithWhereUniqueWithoutResponsibleUserInput | Prisma.ActionPlanUpdateWithWhereUniqueWithoutResponsibleUserInput[];
    updateMany?: Prisma.ActionPlanUpdateManyWithWhereWithoutResponsibleUserInput | Prisma.ActionPlanUpdateManyWithWhereWithoutResponsibleUserInput[];
    deleteMany?: Prisma.ActionPlanScalarWhereInput | Prisma.ActionPlanScalarWhereInput[];
};
export type ActionPlanCreateNestedManyWithoutClientControlInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutClientControlInput, Prisma.ActionPlanUncheckedCreateWithoutClientControlInput> | Prisma.ActionPlanCreateWithoutClientControlInput[] | Prisma.ActionPlanUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutClientControlInput | Prisma.ActionPlanCreateOrConnectWithoutClientControlInput[];
    createMany?: Prisma.ActionPlanCreateManyClientControlInputEnvelope;
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
};
export type ActionPlanUncheckedCreateNestedManyWithoutClientControlInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutClientControlInput, Prisma.ActionPlanUncheckedCreateWithoutClientControlInput> | Prisma.ActionPlanCreateWithoutClientControlInput[] | Prisma.ActionPlanUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutClientControlInput | Prisma.ActionPlanCreateOrConnectWithoutClientControlInput[];
    createMany?: Prisma.ActionPlanCreateManyClientControlInputEnvelope;
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
};
export type ActionPlanUpdateManyWithoutClientControlNestedInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutClientControlInput, Prisma.ActionPlanUncheckedCreateWithoutClientControlInput> | Prisma.ActionPlanCreateWithoutClientControlInput[] | Prisma.ActionPlanUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutClientControlInput | Prisma.ActionPlanCreateOrConnectWithoutClientControlInput[];
    upsert?: Prisma.ActionPlanUpsertWithWhereUniqueWithoutClientControlInput | Prisma.ActionPlanUpsertWithWhereUniqueWithoutClientControlInput[];
    createMany?: Prisma.ActionPlanCreateManyClientControlInputEnvelope;
    set?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    disconnect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    delete?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    update?: Prisma.ActionPlanUpdateWithWhereUniqueWithoutClientControlInput | Prisma.ActionPlanUpdateWithWhereUniqueWithoutClientControlInput[];
    updateMany?: Prisma.ActionPlanUpdateManyWithWhereWithoutClientControlInput | Prisma.ActionPlanUpdateManyWithWhereWithoutClientControlInput[];
    deleteMany?: Prisma.ActionPlanScalarWhereInput | Prisma.ActionPlanScalarWhereInput[];
};
export type ActionPlanUncheckedUpdateManyWithoutClientControlNestedInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutClientControlInput, Prisma.ActionPlanUncheckedCreateWithoutClientControlInput> | Prisma.ActionPlanCreateWithoutClientControlInput[] | Prisma.ActionPlanUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutClientControlInput | Prisma.ActionPlanCreateOrConnectWithoutClientControlInput[];
    upsert?: Prisma.ActionPlanUpsertWithWhereUniqueWithoutClientControlInput | Prisma.ActionPlanUpsertWithWhereUniqueWithoutClientControlInput[];
    createMany?: Prisma.ActionPlanCreateManyClientControlInputEnvelope;
    set?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    disconnect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    delete?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    update?: Prisma.ActionPlanUpdateWithWhereUniqueWithoutClientControlInput | Prisma.ActionPlanUpdateWithWhereUniqueWithoutClientControlInput[];
    updateMany?: Prisma.ActionPlanUpdateManyWithWhereWithoutClientControlInput | Prisma.ActionPlanUpdateManyWithWhereWithoutClientControlInput[];
    deleteMany?: Prisma.ActionPlanScalarWhereInput | Prisma.ActionPlanScalarWhereInput[];
};
export type EnumActionPlanStatusFieldUpdateOperationsInput = {
    set?: $Enums.ActionPlanStatus;
};
export type ActionPlanCreateWithoutTenantInput = {
    id?: string;
    actionDescription: string;
    dueDate: Date | string;
    status: $Enums.ActionPlanStatus;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutActionPlansInput;
    responsibleUser: Prisma.UserCreateNestedOneWithoutActionPlansResponsibleInput;
};
export type ActionPlanUncheckedCreateWithoutTenantInput = {
    id?: string;
    clientControlId: string;
    responsibleId: string;
    actionDescription: string;
    dueDate: Date | string;
    status: $Enums.ActionPlanStatus;
};
export type ActionPlanCreateOrConnectWithoutTenantInput = {
    where: Prisma.ActionPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.ActionPlanCreateWithoutTenantInput, Prisma.ActionPlanUncheckedCreateWithoutTenantInput>;
};
export type ActionPlanCreateManyTenantInputEnvelope = {
    data: Prisma.ActionPlanCreateManyTenantInput | Prisma.ActionPlanCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ActionPlanUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ActionPlanWhereUniqueInput;
    update: Prisma.XOR<Prisma.ActionPlanUpdateWithoutTenantInput, Prisma.ActionPlanUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ActionPlanCreateWithoutTenantInput, Prisma.ActionPlanUncheckedCreateWithoutTenantInput>;
};
export type ActionPlanUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ActionPlanWhereUniqueInput;
    data: Prisma.XOR<Prisma.ActionPlanUpdateWithoutTenantInput, Prisma.ActionPlanUncheckedUpdateWithoutTenantInput>;
};
export type ActionPlanUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ActionPlanScalarWhereInput;
    data: Prisma.XOR<Prisma.ActionPlanUpdateManyMutationInput, Prisma.ActionPlanUncheckedUpdateManyWithoutTenantInput>;
};
export type ActionPlanScalarWhereInput = {
    AND?: Prisma.ActionPlanScalarWhereInput | Prisma.ActionPlanScalarWhereInput[];
    OR?: Prisma.ActionPlanScalarWhereInput[];
    NOT?: Prisma.ActionPlanScalarWhereInput | Prisma.ActionPlanScalarWhereInput[];
    id?: Prisma.UuidFilter<"ActionPlan"> | string;
    tenantId?: Prisma.UuidFilter<"ActionPlan"> | string;
    clientControlId?: Prisma.UuidFilter<"ActionPlan"> | string;
    responsibleId?: Prisma.UuidFilter<"ActionPlan"> | string;
    actionDescription?: Prisma.StringFilter<"ActionPlan"> | string;
    dueDate?: Prisma.DateTimeFilter<"ActionPlan"> | Date | string;
    status?: Prisma.EnumActionPlanStatusFilter<"ActionPlan"> | $Enums.ActionPlanStatus;
};
export type ActionPlanCreateWithoutResponsibleUserInput = {
    id?: string;
    actionDescription: string;
    dueDate: Date | string;
    status: $Enums.ActionPlanStatus;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutActionPlansInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutActionPlansInput;
};
export type ActionPlanUncheckedCreateWithoutResponsibleUserInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
    actionDescription: string;
    dueDate: Date | string;
    status: $Enums.ActionPlanStatus;
};
export type ActionPlanCreateOrConnectWithoutResponsibleUserInput = {
    where: Prisma.ActionPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.ActionPlanCreateWithoutResponsibleUserInput, Prisma.ActionPlanUncheckedCreateWithoutResponsibleUserInput>;
};
export type ActionPlanCreateManyResponsibleUserInputEnvelope = {
    data: Prisma.ActionPlanCreateManyResponsibleUserInput | Prisma.ActionPlanCreateManyResponsibleUserInput[];
    skipDuplicates?: boolean;
};
export type ActionPlanUpsertWithWhereUniqueWithoutResponsibleUserInput = {
    where: Prisma.ActionPlanWhereUniqueInput;
    update: Prisma.XOR<Prisma.ActionPlanUpdateWithoutResponsibleUserInput, Prisma.ActionPlanUncheckedUpdateWithoutResponsibleUserInput>;
    create: Prisma.XOR<Prisma.ActionPlanCreateWithoutResponsibleUserInput, Prisma.ActionPlanUncheckedCreateWithoutResponsibleUserInput>;
};
export type ActionPlanUpdateWithWhereUniqueWithoutResponsibleUserInput = {
    where: Prisma.ActionPlanWhereUniqueInput;
    data: Prisma.XOR<Prisma.ActionPlanUpdateWithoutResponsibleUserInput, Prisma.ActionPlanUncheckedUpdateWithoutResponsibleUserInput>;
};
export type ActionPlanUpdateManyWithWhereWithoutResponsibleUserInput = {
    where: Prisma.ActionPlanScalarWhereInput;
    data: Prisma.XOR<Prisma.ActionPlanUpdateManyMutationInput, Prisma.ActionPlanUncheckedUpdateManyWithoutResponsibleUserInput>;
};
export type ActionPlanCreateWithoutClientControlInput = {
    id?: string;
    actionDescription: string;
    dueDate: Date | string;
    status: $Enums.ActionPlanStatus;
    responsibleUser: Prisma.UserCreateNestedOneWithoutActionPlansResponsibleInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutActionPlansInput;
};
export type ActionPlanUncheckedCreateWithoutClientControlInput = {
    id?: string;
    tenantId: string;
    responsibleId: string;
    actionDescription: string;
    dueDate: Date | string;
    status: $Enums.ActionPlanStatus;
};
export type ActionPlanCreateOrConnectWithoutClientControlInput = {
    where: Prisma.ActionPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.ActionPlanCreateWithoutClientControlInput, Prisma.ActionPlanUncheckedCreateWithoutClientControlInput>;
};
export type ActionPlanCreateManyClientControlInputEnvelope = {
    data: Prisma.ActionPlanCreateManyClientControlInput | Prisma.ActionPlanCreateManyClientControlInput[];
    skipDuplicates?: boolean;
};
export type ActionPlanUpsertWithWhereUniqueWithoutClientControlInput = {
    where: Prisma.ActionPlanWhereUniqueInput;
    update: Prisma.XOR<Prisma.ActionPlanUpdateWithoutClientControlInput, Prisma.ActionPlanUncheckedUpdateWithoutClientControlInput>;
    create: Prisma.XOR<Prisma.ActionPlanCreateWithoutClientControlInput, Prisma.ActionPlanUncheckedCreateWithoutClientControlInput>;
};
export type ActionPlanUpdateWithWhereUniqueWithoutClientControlInput = {
    where: Prisma.ActionPlanWhereUniqueInput;
    data: Prisma.XOR<Prisma.ActionPlanUpdateWithoutClientControlInput, Prisma.ActionPlanUncheckedUpdateWithoutClientControlInput>;
};
export type ActionPlanUpdateManyWithWhereWithoutClientControlInput = {
    where: Prisma.ActionPlanScalarWhereInput;
    data: Prisma.XOR<Prisma.ActionPlanUpdateManyMutationInput, Prisma.ActionPlanUncheckedUpdateManyWithoutClientControlInput>;
};
export type ActionPlanCreateManyTenantInput = {
    id?: string;
    clientControlId: string;
    responsibleId: string;
    actionDescription: string;
    dueDate: Date | string;
    status: $Enums.ActionPlanStatus;
};
export type ActionPlanUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumActionPlanStatusFieldUpdateOperationsInput | $Enums.ActionPlanStatus;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutActionPlansNestedInput;
    responsibleUser?: Prisma.UserUpdateOneRequiredWithoutActionPlansResponsibleNestedInput;
};
export type ActionPlanUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumActionPlanStatusFieldUpdateOperationsInput | $Enums.ActionPlanStatus;
};
export type ActionPlanUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumActionPlanStatusFieldUpdateOperationsInput | $Enums.ActionPlanStatus;
};
export type ActionPlanCreateManyResponsibleUserInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
    actionDescription: string;
    dueDate: Date | string;
    status: $Enums.ActionPlanStatus;
};
export type ActionPlanUpdateWithoutResponsibleUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumActionPlanStatusFieldUpdateOperationsInput | $Enums.ActionPlanStatus;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutActionPlansNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutActionPlansNestedInput;
};
export type ActionPlanUncheckedUpdateWithoutResponsibleUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumActionPlanStatusFieldUpdateOperationsInput | $Enums.ActionPlanStatus;
};
export type ActionPlanUncheckedUpdateManyWithoutResponsibleUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumActionPlanStatusFieldUpdateOperationsInput | $Enums.ActionPlanStatus;
};
export type ActionPlanCreateManyClientControlInput = {
    id?: string;
    tenantId: string;
    responsibleId: string;
    actionDescription: string;
    dueDate: Date | string;
    status: $Enums.ActionPlanStatus;
};
export type ActionPlanUpdateWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumActionPlanStatusFieldUpdateOperationsInput | $Enums.ActionPlanStatus;
    responsibleUser?: Prisma.UserUpdateOneRequiredWithoutActionPlansResponsibleNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutActionPlansNestedInput;
};
export type ActionPlanUncheckedUpdateWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumActionPlanStatusFieldUpdateOperationsInput | $Enums.ActionPlanStatus;
};
export type ActionPlanUncheckedUpdateManyWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    responsibleId?: Prisma.StringFieldUpdateOperationsInput | string;
    actionDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumActionPlanStatusFieldUpdateOperationsInput | $Enums.ActionPlanStatus;
};
export type ActionPlanSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    responsibleId?: boolean;
    actionDescription?: boolean;
    dueDate?: boolean;
    status?: boolean;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    responsibleUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["actionPlan"]>;
export type ActionPlanSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    responsibleId?: boolean;
    actionDescription?: boolean;
    dueDate?: boolean;
    status?: boolean;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    responsibleUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["actionPlan"]>;
export type ActionPlanSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    responsibleId?: boolean;
    actionDescription?: boolean;
    dueDate?: boolean;
    status?: boolean;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    responsibleUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["actionPlan"]>;
export type ActionPlanSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    responsibleId?: boolean;
    actionDescription?: boolean;
    dueDate?: boolean;
    status?: boolean;
};
export type ActionPlanOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "clientControlId" | "responsibleId" | "actionDescription" | "dueDate" | "status", ExtArgs["result"]["actionPlan"]>;
export type ActionPlanInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    responsibleUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ActionPlanIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    responsibleUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ActionPlanIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    responsibleUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ActionPlanPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ActionPlan";
    objects: {
        clientControl: Prisma.$ClientControlPayload<ExtArgs>;
        responsibleUser: Prisma.$UserPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        clientControlId: string;
        responsibleId: string;
        actionDescription: string;
        dueDate: Date;
        status: $Enums.ActionPlanStatus;
    }, ExtArgs["result"]["actionPlan"]>;
    composites: {};
};
export type ActionPlanGetPayload<S extends boolean | null | undefined | ActionPlanDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload, S>;
export type ActionPlanCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ActionPlanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ActionPlanCountAggregateInputType | true;
};
export interface ActionPlanDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ActionPlan'];
        meta: {
            name: 'ActionPlan';
        };
    };
    findUnique<T extends ActionPlanFindUniqueArgs>(args: Prisma.SelectSubset<T, ActionPlanFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ActionPlanFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ActionPlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ActionPlanFindFirstArgs>(args?: Prisma.SelectSubset<T, ActionPlanFindFirstArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ActionPlanFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ActionPlanFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ActionPlanFindManyArgs>(args?: Prisma.SelectSubset<T, ActionPlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ActionPlanCreateArgs>(args: Prisma.SelectSubset<T, ActionPlanCreateArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ActionPlanCreateManyArgs>(args?: Prisma.SelectSubset<T, ActionPlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ActionPlanCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ActionPlanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ActionPlanDeleteArgs>(args: Prisma.SelectSubset<T, ActionPlanDeleteArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ActionPlanUpdateArgs>(args: Prisma.SelectSubset<T, ActionPlanUpdateArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ActionPlanDeleteManyArgs>(args?: Prisma.SelectSubset<T, ActionPlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ActionPlanUpdateManyArgs>(args: Prisma.SelectSubset<T, ActionPlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ActionPlanUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ActionPlanUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ActionPlanUpsertArgs>(args: Prisma.SelectSubset<T, ActionPlanUpsertArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ActionPlanCountArgs>(args?: Prisma.Subset<T, ActionPlanCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ActionPlanCountAggregateOutputType> : number>;
    aggregate<T extends ActionPlanAggregateArgs>(args: Prisma.Subset<T, ActionPlanAggregateArgs>): Prisma.PrismaPromise<GetActionPlanAggregateType<T>>;
    groupBy<T extends ActionPlanGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ActionPlanGroupByArgs['orderBy'];
    } : {
        orderBy?: ActionPlanGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ActionPlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetActionPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ActionPlanFieldRefs;
}
export interface Prisma__ActionPlanClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    clientControl<T extends Prisma.ClientControlDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientControlDefaultArgs<ExtArgs>>): Prisma.Prisma__ClientControlClient<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    responsibleUser<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ActionPlanFieldRefs {
    readonly id: Prisma.FieldRef<"ActionPlan", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ActionPlan", 'String'>;
    readonly clientControlId: Prisma.FieldRef<"ActionPlan", 'String'>;
    readonly responsibleId: Prisma.FieldRef<"ActionPlan", 'String'>;
    readonly actionDescription: Prisma.FieldRef<"ActionPlan", 'String'>;
    readonly dueDate: Prisma.FieldRef<"ActionPlan", 'DateTime'>;
    readonly status: Prisma.FieldRef<"ActionPlan", 'ActionPlanStatus'>;
}
export type ActionPlanFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
    where: Prisma.ActionPlanWhereUniqueInput;
};
export type ActionPlanFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
    where: Prisma.ActionPlanWhereUniqueInput;
};
export type ActionPlanFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ActionPlanFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ActionPlanFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ActionPlanCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ActionPlanCreateInput, Prisma.ActionPlanUncheckedCreateInput>;
};
export type ActionPlanCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ActionPlanCreateManyInput | Prisma.ActionPlanCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ActionPlanCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    data: Prisma.ActionPlanCreateManyInput | Prisma.ActionPlanCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ActionPlanIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ActionPlanUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ActionPlanUpdateInput, Prisma.ActionPlanUncheckedUpdateInput>;
    where: Prisma.ActionPlanWhereUniqueInput;
};
export type ActionPlanUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ActionPlanUpdateManyMutationInput, Prisma.ActionPlanUncheckedUpdateManyInput>;
    where?: Prisma.ActionPlanWhereInput;
    limit?: number;
};
export type ActionPlanUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ActionPlanUpdateManyMutationInput, Prisma.ActionPlanUncheckedUpdateManyInput>;
    where?: Prisma.ActionPlanWhereInput;
    limit?: number;
    include?: Prisma.ActionPlanIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ActionPlanUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
    where: Prisma.ActionPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.ActionPlanCreateInput, Prisma.ActionPlanUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ActionPlanUpdateInput, Prisma.ActionPlanUncheckedUpdateInput>;
};
export type ActionPlanDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
    where: Prisma.ActionPlanWhereUniqueInput;
};
export type ActionPlanDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ActionPlanWhereInput;
    limit?: number;
};
export type ActionPlanDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
};
export {};
