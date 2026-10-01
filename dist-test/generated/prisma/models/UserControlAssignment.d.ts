import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type UserControlAssignmentModel = runtime.Types.Result.DefaultSelection<Prisma.$UserControlAssignmentPayload>;
export type AggregateUserControlAssignment = {
    _count: UserControlAssignmentCountAggregateOutputType | null;
    _min: UserControlAssignmentMinAggregateOutputType | null;
    _max: UserControlAssignmentMaxAggregateOutputType | null;
};
export type UserControlAssignmentMinAggregateOutputType = {
    id: string | null;
    companyId: string | null;
    userId: string | null;
    clientControlId: string | null;
    assignedBy: string | null;
    assignedAt: Date | null;
};
export type UserControlAssignmentMaxAggregateOutputType = {
    id: string | null;
    companyId: string | null;
    userId: string | null;
    clientControlId: string | null;
    assignedBy: string | null;
    assignedAt: Date | null;
};
export type UserControlAssignmentCountAggregateOutputType = {
    id: number;
    companyId: number;
    userId: number;
    clientControlId: number;
    assignedBy: number;
    assignedAt: number;
    _all: number;
};
export type UserControlAssignmentMinAggregateInputType = {
    id?: true;
    companyId?: true;
    userId?: true;
    clientControlId?: true;
    assignedBy?: true;
    assignedAt?: true;
};
export type UserControlAssignmentMaxAggregateInputType = {
    id?: true;
    companyId?: true;
    userId?: true;
    clientControlId?: true;
    assignedBy?: true;
    assignedAt?: true;
};
export type UserControlAssignmentCountAggregateInputType = {
    id?: true;
    companyId?: true;
    userId?: true;
    clientControlId?: true;
    assignedBy?: true;
    assignedAt?: true;
    _all?: true;
};
export type UserControlAssignmentAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserControlAssignmentWhereInput;
    orderBy?: Prisma.UserControlAssignmentOrderByWithRelationInput | Prisma.UserControlAssignmentOrderByWithRelationInput[];
    cursor?: Prisma.UserControlAssignmentWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | UserControlAssignmentCountAggregateInputType;
    _min?: UserControlAssignmentMinAggregateInputType;
    _max?: UserControlAssignmentMaxAggregateInputType;
};
export type GetUserControlAssignmentAggregateType<T extends UserControlAssignmentAggregateArgs> = {
    [P in keyof T & keyof AggregateUserControlAssignment]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUserControlAssignment[P]> : Prisma.GetScalarType<T[P], AggregateUserControlAssignment[P]>;
};
export type UserControlAssignmentGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserControlAssignmentWhereInput;
    orderBy?: Prisma.UserControlAssignmentOrderByWithAggregationInput | Prisma.UserControlAssignmentOrderByWithAggregationInput[];
    by: Prisma.UserControlAssignmentScalarFieldEnum[] | Prisma.UserControlAssignmentScalarFieldEnum;
    having?: Prisma.UserControlAssignmentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserControlAssignmentCountAggregateInputType | true;
    _min?: UserControlAssignmentMinAggregateInputType;
    _max?: UserControlAssignmentMaxAggregateInputType;
};
export type UserControlAssignmentGroupByOutputType = {
    id: string;
    companyId: string;
    userId: string;
    clientControlId: string;
    assignedBy: string;
    assignedAt: Date;
    _count: UserControlAssignmentCountAggregateOutputType | null;
    _min: UserControlAssignmentMinAggregateOutputType | null;
    _max: UserControlAssignmentMaxAggregateOutputType | null;
};
type GetUserControlAssignmentGroupByPayload<T extends UserControlAssignmentGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UserControlAssignmentGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UserControlAssignmentGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UserControlAssignmentGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UserControlAssignmentGroupByOutputType[P]>;
}>>;
export type UserControlAssignmentWhereInput = {
    AND?: Prisma.UserControlAssignmentWhereInput | Prisma.UserControlAssignmentWhereInput[];
    OR?: Prisma.UserControlAssignmentWhereInput[];
    NOT?: Prisma.UserControlAssignmentWhereInput | Prisma.UserControlAssignmentWhereInput[];
    id?: Prisma.UuidFilter<"UserControlAssignment"> | string;
    companyId?: Prisma.UuidFilter<"UserControlAssignment"> | string;
    userId?: Prisma.UuidFilter<"UserControlAssignment"> | string;
    clientControlId?: Prisma.UuidFilter<"UserControlAssignment"> | string;
    assignedBy?: Prisma.UuidFilter<"UserControlAssignment"> | string;
    assignedAt?: Prisma.DateTimeFilter<"UserControlAssignment"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    assignedByUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    clientControl?: Prisma.XOR<Prisma.ClientControlScalarRelationFilter, Prisma.ClientControlWhereInput>;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type UserControlAssignmentOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    assignedBy?: Prisma.SortOrder;
    assignedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    assignedByUser?: Prisma.UserOrderByWithRelationInput;
    clientControl?: Prisma.ClientControlOrderByWithRelationInput;
    company?: Prisma.CompanyOrderByWithRelationInput;
};
export type UserControlAssignmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    userId_clientControlId?: Prisma.UserControlAssignmentUserIdClientControlIdCompoundUniqueInput;
    AND?: Prisma.UserControlAssignmentWhereInput | Prisma.UserControlAssignmentWhereInput[];
    OR?: Prisma.UserControlAssignmentWhereInput[];
    NOT?: Prisma.UserControlAssignmentWhereInput | Prisma.UserControlAssignmentWhereInput[];
    companyId?: Prisma.UuidFilter<"UserControlAssignment"> | string;
    userId?: Prisma.UuidFilter<"UserControlAssignment"> | string;
    clientControlId?: Prisma.UuidFilter<"UserControlAssignment"> | string;
    assignedBy?: Prisma.UuidFilter<"UserControlAssignment"> | string;
    assignedAt?: Prisma.DateTimeFilter<"UserControlAssignment"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    assignedByUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    clientControl?: Prisma.XOR<Prisma.ClientControlScalarRelationFilter, Prisma.ClientControlWhereInput>;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id" | "userId_clientControlId">;
export type UserControlAssignmentOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    assignedBy?: Prisma.SortOrder;
    assignedAt?: Prisma.SortOrder;
    _count?: Prisma.UserControlAssignmentCountOrderByAggregateInput;
    _max?: Prisma.UserControlAssignmentMaxOrderByAggregateInput;
    _min?: Prisma.UserControlAssignmentMinOrderByAggregateInput;
};
export type UserControlAssignmentScalarWhereWithAggregatesInput = {
    AND?: Prisma.UserControlAssignmentScalarWhereWithAggregatesInput | Prisma.UserControlAssignmentScalarWhereWithAggregatesInput[];
    OR?: Prisma.UserControlAssignmentScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UserControlAssignmentScalarWhereWithAggregatesInput | Prisma.UserControlAssignmentScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"UserControlAssignment"> | string;
    companyId?: Prisma.UuidWithAggregatesFilter<"UserControlAssignment"> | string;
    userId?: Prisma.UuidWithAggregatesFilter<"UserControlAssignment"> | string;
    clientControlId?: Prisma.UuidWithAggregatesFilter<"UserControlAssignment"> | string;
    assignedBy?: Prisma.UuidWithAggregatesFilter<"UserControlAssignment"> | string;
    assignedAt?: Prisma.DateTimeWithAggregatesFilter<"UserControlAssignment"> | Date | string;
};
export type UserControlAssignmentCreateInput = {
    id?: string;
    assignedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutControlAssignmentsInput;
    assignedByUser: Prisma.UserCreateNestedOneWithoutControlAssignmentsGrantedInput;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutUserControlAssignmentsInput;
    company: Prisma.CompanyCreateNestedOneWithoutUserControlAssignmentsInput;
};
export type UserControlAssignmentUncheckedCreateInput = {
    id?: string;
    companyId: string;
    userId: string;
    clientControlId: string;
    assignedBy: string;
    assignedAt?: Date | string;
};
export type UserControlAssignmentUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutControlAssignmentsNestedInput;
    assignedByUser?: Prisma.UserUpdateOneRequiredWithoutControlAssignmentsGrantedNestedInput;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutUserControlAssignmentsNestedInput;
    company?: Prisma.CompanyUpdateOneRequiredWithoutUserControlAssignmentsNestedInput;
};
export type UserControlAssignmentUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserControlAssignmentCreateManyInput = {
    id?: string;
    companyId: string;
    userId: string;
    clientControlId: string;
    assignedBy: string;
    assignedAt?: Date | string;
};
export type UserControlAssignmentUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserControlAssignmentUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserControlAssignmentListRelationFilter = {
    every?: Prisma.UserControlAssignmentWhereInput;
    some?: Prisma.UserControlAssignmentWhereInput;
    none?: Prisma.UserControlAssignmentWhereInput;
};
export type UserControlAssignmentOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type UserControlAssignmentUserIdClientControlIdCompoundUniqueInput = {
    userId: string;
    clientControlId: string;
};
export type UserControlAssignmentCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    assignedBy?: Prisma.SortOrder;
    assignedAt?: Prisma.SortOrder;
};
export type UserControlAssignmentMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    assignedBy?: Prisma.SortOrder;
    assignedAt?: Prisma.SortOrder;
};
export type UserControlAssignmentMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    assignedBy?: Prisma.SortOrder;
    assignedAt?: Prisma.SortOrder;
};
export type UserControlAssignmentCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutCompanyInput, Prisma.UserControlAssignmentUncheckedCreateWithoutCompanyInput> | Prisma.UserControlAssignmentCreateWithoutCompanyInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutCompanyInput | Prisma.UserControlAssignmentCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyCompanyInputEnvelope;
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
};
export type UserControlAssignmentUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutCompanyInput, Prisma.UserControlAssignmentUncheckedCreateWithoutCompanyInput> | Prisma.UserControlAssignmentCreateWithoutCompanyInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutCompanyInput | Prisma.UserControlAssignmentCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyCompanyInputEnvelope;
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
};
export type UserControlAssignmentUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutCompanyInput, Prisma.UserControlAssignmentUncheckedCreateWithoutCompanyInput> | Prisma.UserControlAssignmentCreateWithoutCompanyInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutCompanyInput | Prisma.UserControlAssignmentCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutCompanyInput | Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyCompanyInputEnvelope;
    set?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    disconnect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    delete?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    update?: Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutCompanyInput | Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.UserControlAssignmentUpdateManyWithWhereWithoutCompanyInput | Prisma.UserControlAssignmentUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.UserControlAssignmentScalarWhereInput | Prisma.UserControlAssignmentScalarWhereInput[];
};
export type UserControlAssignmentUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutCompanyInput, Prisma.UserControlAssignmentUncheckedCreateWithoutCompanyInput> | Prisma.UserControlAssignmentCreateWithoutCompanyInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutCompanyInput | Prisma.UserControlAssignmentCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutCompanyInput | Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyCompanyInputEnvelope;
    set?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    disconnect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    delete?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    update?: Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutCompanyInput | Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.UserControlAssignmentUpdateManyWithWhereWithoutCompanyInput | Prisma.UserControlAssignmentUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.UserControlAssignmentScalarWhereInput | Prisma.UserControlAssignmentScalarWhereInput[];
};
export type UserControlAssignmentCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutUserInput, Prisma.UserControlAssignmentUncheckedCreateWithoutUserInput> | Prisma.UserControlAssignmentCreateWithoutUserInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutUserInput | Prisma.UserControlAssignmentCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyUserInputEnvelope;
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
};
export type UserControlAssignmentCreateNestedManyWithoutAssignedByUserInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutAssignedByUserInput, Prisma.UserControlAssignmentUncheckedCreateWithoutAssignedByUserInput> | Prisma.UserControlAssignmentCreateWithoutAssignedByUserInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutAssignedByUserInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutAssignedByUserInput | Prisma.UserControlAssignmentCreateOrConnectWithoutAssignedByUserInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyAssignedByUserInputEnvelope;
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
};
export type UserControlAssignmentUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutUserInput, Prisma.UserControlAssignmentUncheckedCreateWithoutUserInput> | Prisma.UserControlAssignmentCreateWithoutUserInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutUserInput | Prisma.UserControlAssignmentCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyUserInputEnvelope;
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
};
export type UserControlAssignmentUncheckedCreateNestedManyWithoutAssignedByUserInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutAssignedByUserInput, Prisma.UserControlAssignmentUncheckedCreateWithoutAssignedByUserInput> | Prisma.UserControlAssignmentCreateWithoutAssignedByUserInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutAssignedByUserInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutAssignedByUserInput | Prisma.UserControlAssignmentCreateOrConnectWithoutAssignedByUserInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyAssignedByUserInputEnvelope;
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
};
export type UserControlAssignmentUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutUserInput, Prisma.UserControlAssignmentUncheckedCreateWithoutUserInput> | Prisma.UserControlAssignmentCreateWithoutUserInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutUserInput | Prisma.UserControlAssignmentCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutUserInput | Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyUserInputEnvelope;
    set?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    disconnect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    delete?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    update?: Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutUserInput | Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.UserControlAssignmentUpdateManyWithWhereWithoutUserInput | Prisma.UserControlAssignmentUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.UserControlAssignmentScalarWhereInput | Prisma.UserControlAssignmentScalarWhereInput[];
};
export type UserControlAssignmentUpdateManyWithoutAssignedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutAssignedByUserInput, Prisma.UserControlAssignmentUncheckedCreateWithoutAssignedByUserInput> | Prisma.UserControlAssignmentCreateWithoutAssignedByUserInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutAssignedByUserInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutAssignedByUserInput | Prisma.UserControlAssignmentCreateOrConnectWithoutAssignedByUserInput[];
    upsert?: Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutAssignedByUserInput | Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutAssignedByUserInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyAssignedByUserInputEnvelope;
    set?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    disconnect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    delete?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    update?: Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutAssignedByUserInput | Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutAssignedByUserInput[];
    updateMany?: Prisma.UserControlAssignmentUpdateManyWithWhereWithoutAssignedByUserInput | Prisma.UserControlAssignmentUpdateManyWithWhereWithoutAssignedByUserInput[];
    deleteMany?: Prisma.UserControlAssignmentScalarWhereInput | Prisma.UserControlAssignmentScalarWhereInput[];
};
export type UserControlAssignmentUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutUserInput, Prisma.UserControlAssignmentUncheckedCreateWithoutUserInput> | Prisma.UserControlAssignmentCreateWithoutUserInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutUserInput | Prisma.UserControlAssignmentCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutUserInput | Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyUserInputEnvelope;
    set?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    disconnect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    delete?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    update?: Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutUserInput | Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.UserControlAssignmentUpdateManyWithWhereWithoutUserInput | Prisma.UserControlAssignmentUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.UserControlAssignmentScalarWhereInput | Prisma.UserControlAssignmentScalarWhereInput[];
};
export type UserControlAssignmentUncheckedUpdateManyWithoutAssignedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutAssignedByUserInput, Prisma.UserControlAssignmentUncheckedCreateWithoutAssignedByUserInput> | Prisma.UserControlAssignmentCreateWithoutAssignedByUserInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutAssignedByUserInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutAssignedByUserInput | Prisma.UserControlAssignmentCreateOrConnectWithoutAssignedByUserInput[];
    upsert?: Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutAssignedByUserInput | Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutAssignedByUserInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyAssignedByUserInputEnvelope;
    set?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    disconnect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    delete?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    update?: Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutAssignedByUserInput | Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutAssignedByUserInput[];
    updateMany?: Prisma.UserControlAssignmentUpdateManyWithWhereWithoutAssignedByUserInput | Prisma.UserControlAssignmentUpdateManyWithWhereWithoutAssignedByUserInput[];
    deleteMany?: Prisma.UserControlAssignmentScalarWhereInput | Prisma.UserControlAssignmentScalarWhereInput[];
};
export type UserControlAssignmentCreateNestedManyWithoutClientControlInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutClientControlInput, Prisma.UserControlAssignmentUncheckedCreateWithoutClientControlInput> | Prisma.UserControlAssignmentCreateWithoutClientControlInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutClientControlInput | Prisma.UserControlAssignmentCreateOrConnectWithoutClientControlInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyClientControlInputEnvelope;
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
};
export type UserControlAssignmentUncheckedCreateNestedManyWithoutClientControlInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutClientControlInput, Prisma.UserControlAssignmentUncheckedCreateWithoutClientControlInput> | Prisma.UserControlAssignmentCreateWithoutClientControlInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutClientControlInput | Prisma.UserControlAssignmentCreateOrConnectWithoutClientControlInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyClientControlInputEnvelope;
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
};
export type UserControlAssignmentUpdateManyWithoutClientControlNestedInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutClientControlInput, Prisma.UserControlAssignmentUncheckedCreateWithoutClientControlInput> | Prisma.UserControlAssignmentCreateWithoutClientControlInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutClientControlInput | Prisma.UserControlAssignmentCreateOrConnectWithoutClientControlInput[];
    upsert?: Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutClientControlInput | Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutClientControlInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyClientControlInputEnvelope;
    set?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    disconnect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    delete?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    update?: Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutClientControlInput | Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutClientControlInput[];
    updateMany?: Prisma.UserControlAssignmentUpdateManyWithWhereWithoutClientControlInput | Prisma.UserControlAssignmentUpdateManyWithWhereWithoutClientControlInput[];
    deleteMany?: Prisma.UserControlAssignmentScalarWhereInput | Prisma.UserControlAssignmentScalarWhereInput[];
};
export type UserControlAssignmentUncheckedUpdateManyWithoutClientControlNestedInput = {
    create?: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutClientControlInput, Prisma.UserControlAssignmentUncheckedCreateWithoutClientControlInput> | Prisma.UserControlAssignmentCreateWithoutClientControlInput[] | Prisma.UserControlAssignmentUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.UserControlAssignmentCreateOrConnectWithoutClientControlInput | Prisma.UserControlAssignmentCreateOrConnectWithoutClientControlInput[];
    upsert?: Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutClientControlInput | Prisma.UserControlAssignmentUpsertWithWhereUniqueWithoutClientControlInput[];
    createMany?: Prisma.UserControlAssignmentCreateManyClientControlInputEnvelope;
    set?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    disconnect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    delete?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    connect?: Prisma.UserControlAssignmentWhereUniqueInput | Prisma.UserControlAssignmentWhereUniqueInput[];
    update?: Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutClientControlInput | Prisma.UserControlAssignmentUpdateWithWhereUniqueWithoutClientControlInput[];
    updateMany?: Prisma.UserControlAssignmentUpdateManyWithWhereWithoutClientControlInput | Prisma.UserControlAssignmentUpdateManyWithWhereWithoutClientControlInput[];
    deleteMany?: Prisma.UserControlAssignmentScalarWhereInput | Prisma.UserControlAssignmentScalarWhereInput[];
};
export type UserControlAssignmentCreateWithoutCompanyInput = {
    id?: string;
    assignedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutControlAssignmentsInput;
    assignedByUser: Prisma.UserCreateNestedOneWithoutControlAssignmentsGrantedInput;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutUserControlAssignmentsInput;
};
export type UserControlAssignmentUncheckedCreateWithoutCompanyInput = {
    id?: string;
    userId: string;
    clientControlId: string;
    assignedBy: string;
    assignedAt?: Date | string;
};
export type UserControlAssignmentCreateOrConnectWithoutCompanyInput = {
    where: Prisma.UserControlAssignmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutCompanyInput, Prisma.UserControlAssignmentUncheckedCreateWithoutCompanyInput>;
};
export type UserControlAssignmentCreateManyCompanyInputEnvelope = {
    data: Prisma.UserControlAssignmentCreateManyCompanyInput | Prisma.UserControlAssignmentCreateManyCompanyInput[];
    skipDuplicates?: boolean;
};
export type UserControlAssignmentUpsertWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.UserControlAssignmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.UserControlAssignmentUpdateWithoutCompanyInput, Prisma.UserControlAssignmentUncheckedUpdateWithoutCompanyInput>;
    create: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutCompanyInput, Prisma.UserControlAssignmentUncheckedCreateWithoutCompanyInput>;
};
export type UserControlAssignmentUpdateWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.UserControlAssignmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.UserControlAssignmentUpdateWithoutCompanyInput, Prisma.UserControlAssignmentUncheckedUpdateWithoutCompanyInput>;
};
export type UserControlAssignmentUpdateManyWithWhereWithoutCompanyInput = {
    where: Prisma.UserControlAssignmentScalarWhereInput;
    data: Prisma.XOR<Prisma.UserControlAssignmentUpdateManyMutationInput, Prisma.UserControlAssignmentUncheckedUpdateManyWithoutCompanyInput>;
};
export type UserControlAssignmentScalarWhereInput = {
    AND?: Prisma.UserControlAssignmentScalarWhereInput | Prisma.UserControlAssignmentScalarWhereInput[];
    OR?: Prisma.UserControlAssignmentScalarWhereInput[];
    NOT?: Prisma.UserControlAssignmentScalarWhereInput | Prisma.UserControlAssignmentScalarWhereInput[];
    id?: Prisma.UuidFilter<"UserControlAssignment"> | string;
    companyId?: Prisma.UuidFilter<"UserControlAssignment"> | string;
    userId?: Prisma.UuidFilter<"UserControlAssignment"> | string;
    clientControlId?: Prisma.UuidFilter<"UserControlAssignment"> | string;
    assignedBy?: Prisma.UuidFilter<"UserControlAssignment"> | string;
    assignedAt?: Prisma.DateTimeFilter<"UserControlAssignment"> | Date | string;
};
export type UserControlAssignmentCreateWithoutUserInput = {
    id?: string;
    assignedAt?: Date | string;
    assignedByUser: Prisma.UserCreateNestedOneWithoutControlAssignmentsGrantedInput;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutUserControlAssignmentsInput;
    company: Prisma.CompanyCreateNestedOneWithoutUserControlAssignmentsInput;
};
export type UserControlAssignmentUncheckedCreateWithoutUserInput = {
    id?: string;
    companyId: string;
    clientControlId: string;
    assignedBy: string;
    assignedAt?: Date | string;
};
export type UserControlAssignmentCreateOrConnectWithoutUserInput = {
    where: Prisma.UserControlAssignmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutUserInput, Prisma.UserControlAssignmentUncheckedCreateWithoutUserInput>;
};
export type UserControlAssignmentCreateManyUserInputEnvelope = {
    data: Prisma.UserControlAssignmentCreateManyUserInput | Prisma.UserControlAssignmentCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type UserControlAssignmentCreateWithoutAssignedByUserInput = {
    id?: string;
    assignedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutControlAssignmentsInput;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutUserControlAssignmentsInput;
    company: Prisma.CompanyCreateNestedOneWithoutUserControlAssignmentsInput;
};
export type UserControlAssignmentUncheckedCreateWithoutAssignedByUserInput = {
    id?: string;
    companyId: string;
    userId: string;
    clientControlId: string;
    assignedAt?: Date | string;
};
export type UserControlAssignmentCreateOrConnectWithoutAssignedByUserInput = {
    where: Prisma.UserControlAssignmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutAssignedByUserInput, Prisma.UserControlAssignmentUncheckedCreateWithoutAssignedByUserInput>;
};
export type UserControlAssignmentCreateManyAssignedByUserInputEnvelope = {
    data: Prisma.UserControlAssignmentCreateManyAssignedByUserInput | Prisma.UserControlAssignmentCreateManyAssignedByUserInput[];
    skipDuplicates?: boolean;
};
export type UserControlAssignmentUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.UserControlAssignmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.UserControlAssignmentUpdateWithoutUserInput, Prisma.UserControlAssignmentUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutUserInput, Prisma.UserControlAssignmentUncheckedCreateWithoutUserInput>;
};
export type UserControlAssignmentUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.UserControlAssignmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.UserControlAssignmentUpdateWithoutUserInput, Prisma.UserControlAssignmentUncheckedUpdateWithoutUserInput>;
};
export type UserControlAssignmentUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.UserControlAssignmentScalarWhereInput;
    data: Prisma.XOR<Prisma.UserControlAssignmentUpdateManyMutationInput, Prisma.UserControlAssignmentUncheckedUpdateManyWithoutUserInput>;
};
export type UserControlAssignmentUpsertWithWhereUniqueWithoutAssignedByUserInput = {
    where: Prisma.UserControlAssignmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.UserControlAssignmentUpdateWithoutAssignedByUserInput, Prisma.UserControlAssignmentUncheckedUpdateWithoutAssignedByUserInput>;
    create: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutAssignedByUserInput, Prisma.UserControlAssignmentUncheckedCreateWithoutAssignedByUserInput>;
};
export type UserControlAssignmentUpdateWithWhereUniqueWithoutAssignedByUserInput = {
    where: Prisma.UserControlAssignmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.UserControlAssignmentUpdateWithoutAssignedByUserInput, Prisma.UserControlAssignmentUncheckedUpdateWithoutAssignedByUserInput>;
};
export type UserControlAssignmentUpdateManyWithWhereWithoutAssignedByUserInput = {
    where: Prisma.UserControlAssignmentScalarWhereInput;
    data: Prisma.XOR<Prisma.UserControlAssignmentUpdateManyMutationInput, Prisma.UserControlAssignmentUncheckedUpdateManyWithoutAssignedByUserInput>;
};
export type UserControlAssignmentCreateWithoutClientControlInput = {
    id?: string;
    assignedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutControlAssignmentsInput;
    assignedByUser: Prisma.UserCreateNestedOneWithoutControlAssignmentsGrantedInput;
    company: Prisma.CompanyCreateNestedOneWithoutUserControlAssignmentsInput;
};
export type UserControlAssignmentUncheckedCreateWithoutClientControlInput = {
    id?: string;
    companyId: string;
    userId: string;
    assignedBy: string;
    assignedAt?: Date | string;
};
export type UserControlAssignmentCreateOrConnectWithoutClientControlInput = {
    where: Prisma.UserControlAssignmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutClientControlInput, Prisma.UserControlAssignmentUncheckedCreateWithoutClientControlInput>;
};
export type UserControlAssignmentCreateManyClientControlInputEnvelope = {
    data: Prisma.UserControlAssignmentCreateManyClientControlInput | Prisma.UserControlAssignmentCreateManyClientControlInput[];
    skipDuplicates?: boolean;
};
export type UserControlAssignmentUpsertWithWhereUniqueWithoutClientControlInput = {
    where: Prisma.UserControlAssignmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.UserControlAssignmentUpdateWithoutClientControlInput, Prisma.UserControlAssignmentUncheckedUpdateWithoutClientControlInput>;
    create: Prisma.XOR<Prisma.UserControlAssignmentCreateWithoutClientControlInput, Prisma.UserControlAssignmentUncheckedCreateWithoutClientControlInput>;
};
export type UserControlAssignmentUpdateWithWhereUniqueWithoutClientControlInput = {
    where: Prisma.UserControlAssignmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.UserControlAssignmentUpdateWithoutClientControlInput, Prisma.UserControlAssignmentUncheckedUpdateWithoutClientControlInput>;
};
export type UserControlAssignmentUpdateManyWithWhereWithoutClientControlInput = {
    where: Prisma.UserControlAssignmentScalarWhereInput;
    data: Prisma.XOR<Prisma.UserControlAssignmentUpdateManyMutationInput, Prisma.UserControlAssignmentUncheckedUpdateManyWithoutClientControlInput>;
};
export type UserControlAssignmentCreateManyCompanyInput = {
    id?: string;
    userId: string;
    clientControlId: string;
    assignedBy: string;
    assignedAt?: Date | string;
};
export type UserControlAssignmentUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutControlAssignmentsNestedInput;
    assignedByUser?: Prisma.UserUpdateOneRequiredWithoutControlAssignmentsGrantedNestedInput;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutUserControlAssignmentsNestedInput;
};
export type UserControlAssignmentUncheckedUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserControlAssignmentUncheckedUpdateManyWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserControlAssignmentCreateManyUserInput = {
    id?: string;
    companyId: string;
    clientControlId: string;
    assignedBy: string;
    assignedAt?: Date | string;
};
export type UserControlAssignmentCreateManyAssignedByUserInput = {
    id?: string;
    companyId: string;
    userId: string;
    clientControlId: string;
    assignedAt?: Date | string;
};
export type UserControlAssignmentUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assignedByUser?: Prisma.UserUpdateOneRequiredWithoutControlAssignmentsGrantedNestedInput;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutUserControlAssignmentsNestedInput;
    company?: Prisma.CompanyUpdateOneRequiredWithoutUserControlAssignmentsNestedInput;
};
export type UserControlAssignmentUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserControlAssignmentUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserControlAssignmentUpdateWithoutAssignedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutControlAssignmentsNestedInput;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutUserControlAssignmentsNestedInput;
    company?: Prisma.CompanyUpdateOneRequiredWithoutUserControlAssignmentsNestedInput;
};
export type UserControlAssignmentUncheckedUpdateWithoutAssignedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserControlAssignmentUncheckedUpdateManyWithoutAssignedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserControlAssignmentCreateManyClientControlInput = {
    id?: string;
    companyId: string;
    userId: string;
    assignedBy: string;
    assignedAt?: Date | string;
};
export type UserControlAssignmentUpdateWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutControlAssignmentsNestedInput;
    assignedByUser?: Prisma.UserUpdateOneRequiredWithoutControlAssignmentsGrantedNestedInput;
    company?: Prisma.CompanyUpdateOneRequiredWithoutUserControlAssignmentsNestedInput;
};
export type UserControlAssignmentUncheckedUpdateWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserControlAssignmentUncheckedUpdateManyWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserControlAssignmentSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    userId?: boolean;
    clientControlId?: boolean;
    assignedBy?: boolean;
    assignedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userControlAssignment"]>;
export type UserControlAssignmentSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    userId?: boolean;
    clientControlId?: boolean;
    assignedBy?: boolean;
    assignedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userControlAssignment"]>;
export type UserControlAssignmentSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    userId?: boolean;
    clientControlId?: boolean;
    assignedBy?: boolean;
    assignedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userControlAssignment"]>;
export type UserControlAssignmentSelectScalar = {
    id?: boolean;
    companyId?: boolean;
    userId?: boolean;
    clientControlId?: boolean;
    assignedBy?: boolean;
    assignedAt?: boolean;
};
export type UserControlAssignmentOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "companyId" | "userId" | "clientControlId" | "assignedBy" | "assignedAt", ExtArgs["result"]["userControlAssignment"]>;
export type UserControlAssignmentInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type UserControlAssignmentIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type UserControlAssignmentIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $UserControlAssignmentPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "UserControlAssignment";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        assignedByUser: Prisma.$UserPayload<ExtArgs>;
        clientControl: Prisma.$ClientControlPayload<ExtArgs>;
        company: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        companyId: string;
        userId: string;
        clientControlId: string;
        assignedBy: string;
        assignedAt: Date;
    }, ExtArgs["result"]["userControlAssignment"]>;
    composites: {};
};
export type UserControlAssignmentGetPayload<S extends boolean | null | undefined | UserControlAssignmentDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UserControlAssignmentPayload, S>;
export type UserControlAssignmentCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UserControlAssignmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UserControlAssignmentCountAggregateInputType | true;
};
export interface UserControlAssignmentDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['UserControlAssignment'];
        meta: {
            name: 'UserControlAssignment';
        };
    };
    findUnique<T extends UserControlAssignmentFindUniqueArgs>(args: Prisma.SelectSubset<T, UserControlAssignmentFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UserControlAssignmentClient<runtime.Types.Result.GetResult<Prisma.$UserControlAssignmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends UserControlAssignmentFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UserControlAssignmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserControlAssignmentClient<runtime.Types.Result.GetResult<Prisma.$UserControlAssignmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends UserControlAssignmentFindFirstArgs>(args?: Prisma.SelectSubset<T, UserControlAssignmentFindFirstArgs<ExtArgs>>): Prisma.Prisma__UserControlAssignmentClient<runtime.Types.Result.GetResult<Prisma.$UserControlAssignmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends UserControlAssignmentFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UserControlAssignmentFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserControlAssignmentClient<runtime.Types.Result.GetResult<Prisma.$UserControlAssignmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends UserControlAssignmentFindManyArgs>(args?: Prisma.SelectSubset<T, UserControlAssignmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserControlAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends UserControlAssignmentCreateArgs>(args: Prisma.SelectSubset<T, UserControlAssignmentCreateArgs<ExtArgs>>): Prisma.Prisma__UserControlAssignmentClient<runtime.Types.Result.GetResult<Prisma.$UserControlAssignmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends UserControlAssignmentCreateManyArgs>(args?: Prisma.SelectSubset<T, UserControlAssignmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends UserControlAssignmentCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UserControlAssignmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserControlAssignmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends UserControlAssignmentDeleteArgs>(args: Prisma.SelectSubset<T, UserControlAssignmentDeleteArgs<ExtArgs>>): Prisma.Prisma__UserControlAssignmentClient<runtime.Types.Result.GetResult<Prisma.$UserControlAssignmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends UserControlAssignmentUpdateArgs>(args: Prisma.SelectSubset<T, UserControlAssignmentUpdateArgs<ExtArgs>>): Prisma.Prisma__UserControlAssignmentClient<runtime.Types.Result.GetResult<Prisma.$UserControlAssignmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends UserControlAssignmentDeleteManyArgs>(args?: Prisma.SelectSubset<T, UserControlAssignmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends UserControlAssignmentUpdateManyArgs>(args: Prisma.SelectSubset<T, UserControlAssignmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends UserControlAssignmentUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UserControlAssignmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserControlAssignmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends UserControlAssignmentUpsertArgs>(args: Prisma.SelectSubset<T, UserControlAssignmentUpsertArgs<ExtArgs>>): Prisma.Prisma__UserControlAssignmentClient<runtime.Types.Result.GetResult<Prisma.$UserControlAssignmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends UserControlAssignmentCountArgs>(args?: Prisma.Subset<T, UserControlAssignmentCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UserControlAssignmentCountAggregateOutputType> : number>;
    aggregate<T extends UserControlAssignmentAggregateArgs>(args: Prisma.Subset<T, UserControlAssignmentAggregateArgs>): Prisma.PrismaPromise<GetUserControlAssignmentAggregateType<T>>;
    groupBy<T extends UserControlAssignmentGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UserControlAssignmentGroupByArgs['orderBy'];
    } : {
        orderBy?: UserControlAssignmentGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UserControlAssignmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserControlAssignmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: UserControlAssignmentFieldRefs;
}
export interface Prisma__UserControlAssignmentClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    assignedByUser<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    clientControl<T extends Prisma.ClientControlDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientControlDefaultArgs<ExtArgs>>): Prisma.Prisma__ClientControlClient<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    company<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface UserControlAssignmentFieldRefs {
    readonly id: Prisma.FieldRef<"UserControlAssignment", 'String'>;
    readonly companyId: Prisma.FieldRef<"UserControlAssignment", 'String'>;
    readonly userId: Prisma.FieldRef<"UserControlAssignment", 'String'>;
    readonly clientControlId: Prisma.FieldRef<"UserControlAssignment", 'String'>;
    readonly assignedBy: Prisma.FieldRef<"UserControlAssignment", 'String'>;
    readonly assignedAt: Prisma.FieldRef<"UserControlAssignment", 'DateTime'>;
}
export type UserControlAssignmentFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserControlAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.UserControlAssignmentOmit<ExtArgs> | null;
    include?: Prisma.UserControlAssignmentInclude<ExtArgs> | null;
    where: Prisma.UserControlAssignmentWhereUniqueInput;
};
export type UserControlAssignmentFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserControlAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.UserControlAssignmentOmit<ExtArgs> | null;
    include?: Prisma.UserControlAssignmentInclude<ExtArgs> | null;
    where: Prisma.UserControlAssignmentWhereUniqueInput;
};
export type UserControlAssignmentFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type UserControlAssignmentFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type UserControlAssignmentFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type UserControlAssignmentCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserControlAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.UserControlAssignmentOmit<ExtArgs> | null;
    include?: Prisma.UserControlAssignmentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserControlAssignmentCreateInput, Prisma.UserControlAssignmentUncheckedCreateInput>;
};
export type UserControlAssignmentCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.UserControlAssignmentCreateManyInput | Prisma.UserControlAssignmentCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UserControlAssignmentCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserControlAssignmentSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserControlAssignmentOmit<ExtArgs> | null;
    data: Prisma.UserControlAssignmentCreateManyInput | Prisma.UserControlAssignmentCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.UserControlAssignmentIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type UserControlAssignmentUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserControlAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.UserControlAssignmentOmit<ExtArgs> | null;
    include?: Prisma.UserControlAssignmentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserControlAssignmentUpdateInput, Prisma.UserControlAssignmentUncheckedUpdateInput>;
    where: Prisma.UserControlAssignmentWhereUniqueInput;
};
export type UserControlAssignmentUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.UserControlAssignmentUpdateManyMutationInput, Prisma.UserControlAssignmentUncheckedUpdateManyInput>;
    where?: Prisma.UserControlAssignmentWhereInput;
    limit?: number;
};
export type UserControlAssignmentUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserControlAssignmentSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserControlAssignmentOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserControlAssignmentUpdateManyMutationInput, Prisma.UserControlAssignmentUncheckedUpdateManyInput>;
    where?: Prisma.UserControlAssignmentWhereInput;
    limit?: number;
    include?: Prisma.UserControlAssignmentIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type UserControlAssignmentUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserControlAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.UserControlAssignmentOmit<ExtArgs> | null;
    include?: Prisma.UserControlAssignmentInclude<ExtArgs> | null;
    where: Prisma.UserControlAssignmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserControlAssignmentCreateInput, Prisma.UserControlAssignmentUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.UserControlAssignmentUpdateInput, Prisma.UserControlAssignmentUncheckedUpdateInput>;
};
export type UserControlAssignmentDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserControlAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.UserControlAssignmentOmit<ExtArgs> | null;
    include?: Prisma.UserControlAssignmentInclude<ExtArgs> | null;
    where: Prisma.UserControlAssignmentWhereUniqueInput;
};
export type UserControlAssignmentDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserControlAssignmentWhereInput;
    limit?: number;
};
export type UserControlAssignmentDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserControlAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.UserControlAssignmentOmit<ExtArgs> | null;
    include?: Prisma.UserControlAssignmentInclude<ExtArgs> | null;
};
export {};
