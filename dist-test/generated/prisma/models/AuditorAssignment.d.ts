import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type AuditorAssignmentModel = runtime.Types.Result.DefaultSelection<Prisma.$AuditorAssignmentPayload>;
export type AggregateAuditorAssignment = {
    _count: AuditorAssignmentCountAggregateOutputType | null;
    _min: AuditorAssignmentMinAggregateOutputType | null;
    _max: AuditorAssignmentMaxAggregateOutputType | null;
};
export type AuditorAssignmentMinAggregateOutputType = {
    id: string | null;
    auditorUserId: string | null;
    companyId: string | null;
    assignedBy: string | null;
    assignedAt: Date | null;
    expiresAt: Date | null;
};
export type AuditorAssignmentMaxAggregateOutputType = {
    id: string | null;
    auditorUserId: string | null;
    companyId: string | null;
    assignedBy: string | null;
    assignedAt: Date | null;
    expiresAt: Date | null;
};
export type AuditorAssignmentCountAggregateOutputType = {
    id: number;
    auditorUserId: number;
    companyId: number;
    assignedBy: number;
    assignedAt: number;
    expiresAt: number;
    _all: number;
};
export type AuditorAssignmentMinAggregateInputType = {
    id?: true;
    auditorUserId?: true;
    companyId?: true;
    assignedBy?: true;
    assignedAt?: true;
    expiresAt?: true;
};
export type AuditorAssignmentMaxAggregateInputType = {
    id?: true;
    auditorUserId?: true;
    companyId?: true;
    assignedBy?: true;
    assignedAt?: true;
    expiresAt?: true;
};
export type AuditorAssignmentCountAggregateInputType = {
    id?: true;
    auditorUserId?: true;
    companyId?: true;
    assignedBy?: true;
    assignedAt?: true;
    expiresAt?: true;
    _all?: true;
};
export type AuditorAssignmentAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuditorAssignmentWhereInput;
    orderBy?: Prisma.AuditorAssignmentOrderByWithRelationInput | Prisma.AuditorAssignmentOrderByWithRelationInput[];
    cursor?: Prisma.AuditorAssignmentWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | AuditorAssignmentCountAggregateInputType;
    _min?: AuditorAssignmentMinAggregateInputType;
    _max?: AuditorAssignmentMaxAggregateInputType;
};
export type GetAuditorAssignmentAggregateType<T extends AuditorAssignmentAggregateArgs> = {
    [P in keyof T & keyof AggregateAuditorAssignment]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAuditorAssignment[P]> : Prisma.GetScalarType<T[P], AggregateAuditorAssignment[P]>;
};
export type AuditorAssignmentGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuditorAssignmentWhereInput;
    orderBy?: Prisma.AuditorAssignmentOrderByWithAggregationInput | Prisma.AuditorAssignmentOrderByWithAggregationInput[];
    by: Prisma.AuditorAssignmentScalarFieldEnum[] | Prisma.AuditorAssignmentScalarFieldEnum;
    having?: Prisma.AuditorAssignmentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AuditorAssignmentCountAggregateInputType | true;
    _min?: AuditorAssignmentMinAggregateInputType;
    _max?: AuditorAssignmentMaxAggregateInputType;
};
export type AuditorAssignmentGroupByOutputType = {
    id: string;
    auditorUserId: string;
    companyId: string;
    assignedBy: string;
    assignedAt: Date;
    expiresAt: Date | null;
    _count: AuditorAssignmentCountAggregateOutputType | null;
    _min: AuditorAssignmentMinAggregateOutputType | null;
    _max: AuditorAssignmentMaxAggregateOutputType | null;
};
type GetAuditorAssignmentGroupByPayload<T extends AuditorAssignmentGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AuditorAssignmentGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AuditorAssignmentGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AuditorAssignmentGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AuditorAssignmentGroupByOutputType[P]>;
}>>;
export type AuditorAssignmentWhereInput = {
    AND?: Prisma.AuditorAssignmentWhereInput | Prisma.AuditorAssignmentWhereInput[];
    OR?: Prisma.AuditorAssignmentWhereInput[];
    NOT?: Prisma.AuditorAssignmentWhereInput | Prisma.AuditorAssignmentWhereInput[];
    id?: Prisma.UuidFilter<"AuditorAssignment"> | string;
    auditorUserId?: Prisma.UuidFilter<"AuditorAssignment"> | string;
    companyId?: Prisma.UuidFilter<"AuditorAssignment"> | string;
    assignedBy?: Prisma.UuidFilter<"AuditorAssignment"> | string;
    assignedAt?: Prisma.DateTimeFilter<"AuditorAssignment"> | Date | string;
    expiresAt?: Prisma.DateTimeNullableFilter<"AuditorAssignment"> | Date | string | null;
    auditorUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    assignedByUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type AuditorAssignmentOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    auditorUserId?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    assignedBy?: Prisma.SortOrder;
    assignedAt?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    auditorUser?: Prisma.UserOrderByWithRelationInput;
    assignedByUser?: Prisma.UserOrderByWithRelationInput;
    company?: Prisma.CompanyOrderByWithRelationInput;
};
export type AuditorAssignmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    auditorUserId_companyId?: Prisma.AuditorAssignmentAuditorUserIdCompanyIdCompoundUniqueInput;
    AND?: Prisma.AuditorAssignmentWhereInput | Prisma.AuditorAssignmentWhereInput[];
    OR?: Prisma.AuditorAssignmentWhereInput[];
    NOT?: Prisma.AuditorAssignmentWhereInput | Prisma.AuditorAssignmentWhereInput[];
    auditorUserId?: Prisma.UuidFilter<"AuditorAssignment"> | string;
    companyId?: Prisma.UuidFilter<"AuditorAssignment"> | string;
    assignedBy?: Prisma.UuidFilter<"AuditorAssignment"> | string;
    assignedAt?: Prisma.DateTimeFilter<"AuditorAssignment"> | Date | string;
    expiresAt?: Prisma.DateTimeNullableFilter<"AuditorAssignment"> | Date | string | null;
    auditorUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    assignedByUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id" | "auditorUserId_companyId">;
export type AuditorAssignmentOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    auditorUserId?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    assignedBy?: Prisma.SortOrder;
    assignedAt?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.AuditorAssignmentCountOrderByAggregateInput;
    _max?: Prisma.AuditorAssignmentMaxOrderByAggregateInput;
    _min?: Prisma.AuditorAssignmentMinOrderByAggregateInput;
};
export type AuditorAssignmentScalarWhereWithAggregatesInput = {
    AND?: Prisma.AuditorAssignmentScalarWhereWithAggregatesInput | Prisma.AuditorAssignmentScalarWhereWithAggregatesInput[];
    OR?: Prisma.AuditorAssignmentScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AuditorAssignmentScalarWhereWithAggregatesInput | Prisma.AuditorAssignmentScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"AuditorAssignment"> | string;
    auditorUserId?: Prisma.UuidWithAggregatesFilter<"AuditorAssignment"> | string;
    companyId?: Prisma.UuidWithAggregatesFilter<"AuditorAssignment"> | string;
    assignedBy?: Prisma.UuidWithAggregatesFilter<"AuditorAssignment"> | string;
    assignedAt?: Prisma.DateTimeWithAggregatesFilter<"AuditorAssignment"> | Date | string;
    expiresAt?: Prisma.DateTimeNullableWithAggregatesFilter<"AuditorAssignment"> | Date | string | null;
};
export type AuditorAssignmentCreateInput = {
    id?: string;
    assignedAt?: Date | string;
    expiresAt?: Date | string | null;
    auditorUser: Prisma.UserCreateNestedOneWithoutAuditorAssignmentsInput;
    assignedByUser: Prisma.UserCreateNestedOneWithoutAuditorAssignmentsGrantedInput;
    company: Prisma.CompanyCreateNestedOneWithoutAuditorAssignmentsInput;
};
export type AuditorAssignmentUncheckedCreateInput = {
    id?: string;
    auditorUserId: string;
    companyId: string;
    assignedBy: string;
    assignedAt?: Date | string;
    expiresAt?: Date | string | null;
};
export type AuditorAssignmentUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    auditorUser?: Prisma.UserUpdateOneRequiredWithoutAuditorAssignmentsNestedInput;
    assignedByUser?: Prisma.UserUpdateOneRequiredWithoutAuditorAssignmentsGrantedNestedInput;
    company?: Prisma.CompanyUpdateOneRequiredWithoutAuditorAssignmentsNestedInput;
};
export type AuditorAssignmentUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    auditorUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AuditorAssignmentCreateManyInput = {
    id?: string;
    auditorUserId: string;
    companyId: string;
    assignedBy: string;
    assignedAt?: Date | string;
    expiresAt?: Date | string | null;
};
export type AuditorAssignmentUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AuditorAssignmentUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    auditorUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AuditorAssignmentListRelationFilter = {
    every?: Prisma.AuditorAssignmentWhereInput;
    some?: Prisma.AuditorAssignmentWhereInput;
    none?: Prisma.AuditorAssignmentWhereInput;
};
export type AuditorAssignmentOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type AuditorAssignmentAuditorUserIdCompanyIdCompoundUniqueInput = {
    auditorUserId: string;
    companyId: string;
};
export type AuditorAssignmentCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    auditorUserId?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    assignedBy?: Prisma.SortOrder;
    assignedAt?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
};
export type AuditorAssignmentMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    auditorUserId?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    assignedBy?: Prisma.SortOrder;
    assignedAt?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
};
export type AuditorAssignmentMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    auditorUserId?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    assignedBy?: Prisma.SortOrder;
    assignedAt?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
};
export type AuditorAssignmentCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutCompanyInput, Prisma.AuditorAssignmentUncheckedCreateWithoutCompanyInput> | Prisma.AuditorAssignmentCreateWithoutCompanyInput[] | Prisma.AuditorAssignmentUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.AuditorAssignmentCreateOrConnectWithoutCompanyInput | Prisma.AuditorAssignmentCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.AuditorAssignmentCreateManyCompanyInputEnvelope;
    connect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
};
export type AuditorAssignmentUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutCompanyInput, Prisma.AuditorAssignmentUncheckedCreateWithoutCompanyInput> | Prisma.AuditorAssignmentCreateWithoutCompanyInput[] | Prisma.AuditorAssignmentUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.AuditorAssignmentCreateOrConnectWithoutCompanyInput | Prisma.AuditorAssignmentCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.AuditorAssignmentCreateManyCompanyInputEnvelope;
    connect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
};
export type AuditorAssignmentUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutCompanyInput, Prisma.AuditorAssignmentUncheckedCreateWithoutCompanyInput> | Prisma.AuditorAssignmentCreateWithoutCompanyInput[] | Prisma.AuditorAssignmentUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.AuditorAssignmentCreateOrConnectWithoutCompanyInput | Prisma.AuditorAssignmentCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.AuditorAssignmentUpsertWithWhereUniqueWithoutCompanyInput | Prisma.AuditorAssignmentUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.AuditorAssignmentCreateManyCompanyInputEnvelope;
    set?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    disconnect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    delete?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    connect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    update?: Prisma.AuditorAssignmentUpdateWithWhereUniqueWithoutCompanyInput | Prisma.AuditorAssignmentUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.AuditorAssignmentUpdateManyWithWhereWithoutCompanyInput | Prisma.AuditorAssignmentUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.AuditorAssignmentScalarWhereInput | Prisma.AuditorAssignmentScalarWhereInput[];
};
export type AuditorAssignmentUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutCompanyInput, Prisma.AuditorAssignmentUncheckedCreateWithoutCompanyInput> | Prisma.AuditorAssignmentCreateWithoutCompanyInput[] | Prisma.AuditorAssignmentUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.AuditorAssignmentCreateOrConnectWithoutCompanyInput | Prisma.AuditorAssignmentCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.AuditorAssignmentUpsertWithWhereUniqueWithoutCompanyInput | Prisma.AuditorAssignmentUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.AuditorAssignmentCreateManyCompanyInputEnvelope;
    set?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    disconnect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    delete?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    connect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    update?: Prisma.AuditorAssignmentUpdateWithWhereUniqueWithoutCompanyInput | Prisma.AuditorAssignmentUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.AuditorAssignmentUpdateManyWithWhereWithoutCompanyInput | Prisma.AuditorAssignmentUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.AuditorAssignmentScalarWhereInput | Prisma.AuditorAssignmentScalarWhereInput[];
};
export type AuditorAssignmentCreateNestedManyWithoutAuditorUserInput = {
    create?: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutAuditorUserInput, Prisma.AuditorAssignmentUncheckedCreateWithoutAuditorUserInput> | Prisma.AuditorAssignmentCreateWithoutAuditorUserInput[] | Prisma.AuditorAssignmentUncheckedCreateWithoutAuditorUserInput[];
    connectOrCreate?: Prisma.AuditorAssignmentCreateOrConnectWithoutAuditorUserInput | Prisma.AuditorAssignmentCreateOrConnectWithoutAuditorUserInput[];
    createMany?: Prisma.AuditorAssignmentCreateManyAuditorUserInputEnvelope;
    connect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
};
export type AuditorAssignmentCreateNestedManyWithoutAssignedByUserInput = {
    create?: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutAssignedByUserInput, Prisma.AuditorAssignmentUncheckedCreateWithoutAssignedByUserInput> | Prisma.AuditorAssignmentCreateWithoutAssignedByUserInput[] | Prisma.AuditorAssignmentUncheckedCreateWithoutAssignedByUserInput[];
    connectOrCreate?: Prisma.AuditorAssignmentCreateOrConnectWithoutAssignedByUserInput | Prisma.AuditorAssignmentCreateOrConnectWithoutAssignedByUserInput[];
    createMany?: Prisma.AuditorAssignmentCreateManyAssignedByUserInputEnvelope;
    connect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
};
export type AuditorAssignmentUncheckedCreateNestedManyWithoutAuditorUserInput = {
    create?: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutAuditorUserInput, Prisma.AuditorAssignmentUncheckedCreateWithoutAuditorUserInput> | Prisma.AuditorAssignmentCreateWithoutAuditorUserInput[] | Prisma.AuditorAssignmentUncheckedCreateWithoutAuditorUserInput[];
    connectOrCreate?: Prisma.AuditorAssignmentCreateOrConnectWithoutAuditorUserInput | Prisma.AuditorAssignmentCreateOrConnectWithoutAuditorUserInput[];
    createMany?: Prisma.AuditorAssignmentCreateManyAuditorUserInputEnvelope;
    connect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
};
export type AuditorAssignmentUncheckedCreateNestedManyWithoutAssignedByUserInput = {
    create?: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutAssignedByUserInput, Prisma.AuditorAssignmentUncheckedCreateWithoutAssignedByUserInput> | Prisma.AuditorAssignmentCreateWithoutAssignedByUserInput[] | Prisma.AuditorAssignmentUncheckedCreateWithoutAssignedByUserInput[];
    connectOrCreate?: Prisma.AuditorAssignmentCreateOrConnectWithoutAssignedByUserInput | Prisma.AuditorAssignmentCreateOrConnectWithoutAssignedByUserInput[];
    createMany?: Prisma.AuditorAssignmentCreateManyAssignedByUserInputEnvelope;
    connect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
};
export type AuditorAssignmentUpdateManyWithoutAuditorUserNestedInput = {
    create?: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutAuditorUserInput, Prisma.AuditorAssignmentUncheckedCreateWithoutAuditorUserInput> | Prisma.AuditorAssignmentCreateWithoutAuditorUserInput[] | Prisma.AuditorAssignmentUncheckedCreateWithoutAuditorUserInput[];
    connectOrCreate?: Prisma.AuditorAssignmentCreateOrConnectWithoutAuditorUserInput | Prisma.AuditorAssignmentCreateOrConnectWithoutAuditorUserInput[];
    upsert?: Prisma.AuditorAssignmentUpsertWithWhereUniqueWithoutAuditorUserInput | Prisma.AuditorAssignmentUpsertWithWhereUniqueWithoutAuditorUserInput[];
    createMany?: Prisma.AuditorAssignmentCreateManyAuditorUserInputEnvelope;
    set?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    disconnect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    delete?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    connect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    update?: Prisma.AuditorAssignmentUpdateWithWhereUniqueWithoutAuditorUserInput | Prisma.AuditorAssignmentUpdateWithWhereUniqueWithoutAuditorUserInput[];
    updateMany?: Prisma.AuditorAssignmentUpdateManyWithWhereWithoutAuditorUserInput | Prisma.AuditorAssignmentUpdateManyWithWhereWithoutAuditorUserInput[];
    deleteMany?: Prisma.AuditorAssignmentScalarWhereInput | Prisma.AuditorAssignmentScalarWhereInput[];
};
export type AuditorAssignmentUpdateManyWithoutAssignedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutAssignedByUserInput, Prisma.AuditorAssignmentUncheckedCreateWithoutAssignedByUserInput> | Prisma.AuditorAssignmentCreateWithoutAssignedByUserInput[] | Prisma.AuditorAssignmentUncheckedCreateWithoutAssignedByUserInput[];
    connectOrCreate?: Prisma.AuditorAssignmentCreateOrConnectWithoutAssignedByUserInput | Prisma.AuditorAssignmentCreateOrConnectWithoutAssignedByUserInput[];
    upsert?: Prisma.AuditorAssignmentUpsertWithWhereUniqueWithoutAssignedByUserInput | Prisma.AuditorAssignmentUpsertWithWhereUniqueWithoutAssignedByUserInput[];
    createMany?: Prisma.AuditorAssignmentCreateManyAssignedByUserInputEnvelope;
    set?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    disconnect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    delete?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    connect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    update?: Prisma.AuditorAssignmentUpdateWithWhereUniqueWithoutAssignedByUserInput | Prisma.AuditorAssignmentUpdateWithWhereUniqueWithoutAssignedByUserInput[];
    updateMany?: Prisma.AuditorAssignmentUpdateManyWithWhereWithoutAssignedByUserInput | Prisma.AuditorAssignmentUpdateManyWithWhereWithoutAssignedByUserInput[];
    deleteMany?: Prisma.AuditorAssignmentScalarWhereInput | Prisma.AuditorAssignmentScalarWhereInput[];
};
export type AuditorAssignmentUncheckedUpdateManyWithoutAuditorUserNestedInput = {
    create?: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutAuditorUserInput, Prisma.AuditorAssignmentUncheckedCreateWithoutAuditorUserInput> | Prisma.AuditorAssignmentCreateWithoutAuditorUserInput[] | Prisma.AuditorAssignmentUncheckedCreateWithoutAuditorUserInput[];
    connectOrCreate?: Prisma.AuditorAssignmentCreateOrConnectWithoutAuditorUserInput | Prisma.AuditorAssignmentCreateOrConnectWithoutAuditorUserInput[];
    upsert?: Prisma.AuditorAssignmentUpsertWithWhereUniqueWithoutAuditorUserInput | Prisma.AuditorAssignmentUpsertWithWhereUniqueWithoutAuditorUserInput[];
    createMany?: Prisma.AuditorAssignmentCreateManyAuditorUserInputEnvelope;
    set?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    disconnect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    delete?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    connect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    update?: Prisma.AuditorAssignmentUpdateWithWhereUniqueWithoutAuditorUserInput | Prisma.AuditorAssignmentUpdateWithWhereUniqueWithoutAuditorUserInput[];
    updateMany?: Prisma.AuditorAssignmentUpdateManyWithWhereWithoutAuditorUserInput | Prisma.AuditorAssignmentUpdateManyWithWhereWithoutAuditorUserInput[];
    deleteMany?: Prisma.AuditorAssignmentScalarWhereInput | Prisma.AuditorAssignmentScalarWhereInput[];
};
export type AuditorAssignmentUncheckedUpdateManyWithoutAssignedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutAssignedByUserInput, Prisma.AuditorAssignmentUncheckedCreateWithoutAssignedByUserInput> | Prisma.AuditorAssignmentCreateWithoutAssignedByUserInput[] | Prisma.AuditorAssignmentUncheckedCreateWithoutAssignedByUserInput[];
    connectOrCreate?: Prisma.AuditorAssignmentCreateOrConnectWithoutAssignedByUserInput | Prisma.AuditorAssignmentCreateOrConnectWithoutAssignedByUserInput[];
    upsert?: Prisma.AuditorAssignmentUpsertWithWhereUniqueWithoutAssignedByUserInput | Prisma.AuditorAssignmentUpsertWithWhereUniqueWithoutAssignedByUserInput[];
    createMany?: Prisma.AuditorAssignmentCreateManyAssignedByUserInputEnvelope;
    set?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    disconnect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    delete?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    connect?: Prisma.AuditorAssignmentWhereUniqueInput | Prisma.AuditorAssignmentWhereUniqueInput[];
    update?: Prisma.AuditorAssignmentUpdateWithWhereUniqueWithoutAssignedByUserInput | Prisma.AuditorAssignmentUpdateWithWhereUniqueWithoutAssignedByUserInput[];
    updateMany?: Prisma.AuditorAssignmentUpdateManyWithWhereWithoutAssignedByUserInput | Prisma.AuditorAssignmentUpdateManyWithWhereWithoutAssignedByUserInput[];
    deleteMany?: Prisma.AuditorAssignmentScalarWhereInput | Prisma.AuditorAssignmentScalarWhereInput[];
};
export type AuditorAssignmentCreateWithoutCompanyInput = {
    id?: string;
    assignedAt?: Date | string;
    expiresAt?: Date | string | null;
    auditorUser: Prisma.UserCreateNestedOneWithoutAuditorAssignmentsInput;
    assignedByUser: Prisma.UserCreateNestedOneWithoutAuditorAssignmentsGrantedInput;
};
export type AuditorAssignmentUncheckedCreateWithoutCompanyInput = {
    id?: string;
    auditorUserId: string;
    assignedBy: string;
    assignedAt?: Date | string;
    expiresAt?: Date | string | null;
};
export type AuditorAssignmentCreateOrConnectWithoutCompanyInput = {
    where: Prisma.AuditorAssignmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutCompanyInput, Prisma.AuditorAssignmentUncheckedCreateWithoutCompanyInput>;
};
export type AuditorAssignmentCreateManyCompanyInputEnvelope = {
    data: Prisma.AuditorAssignmentCreateManyCompanyInput | Prisma.AuditorAssignmentCreateManyCompanyInput[];
    skipDuplicates?: boolean;
};
export type AuditorAssignmentUpsertWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.AuditorAssignmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.AuditorAssignmentUpdateWithoutCompanyInput, Prisma.AuditorAssignmentUncheckedUpdateWithoutCompanyInput>;
    create: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutCompanyInput, Prisma.AuditorAssignmentUncheckedCreateWithoutCompanyInput>;
};
export type AuditorAssignmentUpdateWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.AuditorAssignmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.AuditorAssignmentUpdateWithoutCompanyInput, Prisma.AuditorAssignmentUncheckedUpdateWithoutCompanyInput>;
};
export type AuditorAssignmentUpdateManyWithWhereWithoutCompanyInput = {
    where: Prisma.AuditorAssignmentScalarWhereInput;
    data: Prisma.XOR<Prisma.AuditorAssignmentUpdateManyMutationInput, Prisma.AuditorAssignmentUncheckedUpdateManyWithoutCompanyInput>;
};
export type AuditorAssignmentScalarWhereInput = {
    AND?: Prisma.AuditorAssignmentScalarWhereInput | Prisma.AuditorAssignmentScalarWhereInput[];
    OR?: Prisma.AuditorAssignmentScalarWhereInput[];
    NOT?: Prisma.AuditorAssignmentScalarWhereInput | Prisma.AuditorAssignmentScalarWhereInput[];
    id?: Prisma.UuidFilter<"AuditorAssignment"> | string;
    auditorUserId?: Prisma.UuidFilter<"AuditorAssignment"> | string;
    companyId?: Prisma.UuidFilter<"AuditorAssignment"> | string;
    assignedBy?: Prisma.UuidFilter<"AuditorAssignment"> | string;
    assignedAt?: Prisma.DateTimeFilter<"AuditorAssignment"> | Date | string;
    expiresAt?: Prisma.DateTimeNullableFilter<"AuditorAssignment"> | Date | string | null;
};
export type AuditorAssignmentCreateWithoutAuditorUserInput = {
    id?: string;
    assignedAt?: Date | string;
    expiresAt?: Date | string | null;
    assignedByUser: Prisma.UserCreateNestedOneWithoutAuditorAssignmentsGrantedInput;
    company: Prisma.CompanyCreateNestedOneWithoutAuditorAssignmentsInput;
};
export type AuditorAssignmentUncheckedCreateWithoutAuditorUserInput = {
    id?: string;
    companyId: string;
    assignedBy: string;
    assignedAt?: Date | string;
    expiresAt?: Date | string | null;
};
export type AuditorAssignmentCreateOrConnectWithoutAuditorUserInput = {
    where: Prisma.AuditorAssignmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutAuditorUserInput, Prisma.AuditorAssignmentUncheckedCreateWithoutAuditorUserInput>;
};
export type AuditorAssignmentCreateManyAuditorUserInputEnvelope = {
    data: Prisma.AuditorAssignmentCreateManyAuditorUserInput | Prisma.AuditorAssignmentCreateManyAuditorUserInput[];
    skipDuplicates?: boolean;
};
export type AuditorAssignmentCreateWithoutAssignedByUserInput = {
    id?: string;
    assignedAt?: Date | string;
    expiresAt?: Date | string | null;
    auditorUser: Prisma.UserCreateNestedOneWithoutAuditorAssignmentsInput;
    company: Prisma.CompanyCreateNestedOneWithoutAuditorAssignmentsInput;
};
export type AuditorAssignmentUncheckedCreateWithoutAssignedByUserInput = {
    id?: string;
    auditorUserId: string;
    companyId: string;
    assignedAt?: Date | string;
    expiresAt?: Date | string | null;
};
export type AuditorAssignmentCreateOrConnectWithoutAssignedByUserInput = {
    where: Prisma.AuditorAssignmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutAssignedByUserInput, Prisma.AuditorAssignmentUncheckedCreateWithoutAssignedByUserInput>;
};
export type AuditorAssignmentCreateManyAssignedByUserInputEnvelope = {
    data: Prisma.AuditorAssignmentCreateManyAssignedByUserInput | Prisma.AuditorAssignmentCreateManyAssignedByUserInput[];
    skipDuplicates?: boolean;
};
export type AuditorAssignmentUpsertWithWhereUniqueWithoutAuditorUserInput = {
    where: Prisma.AuditorAssignmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.AuditorAssignmentUpdateWithoutAuditorUserInput, Prisma.AuditorAssignmentUncheckedUpdateWithoutAuditorUserInput>;
    create: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutAuditorUserInput, Prisma.AuditorAssignmentUncheckedCreateWithoutAuditorUserInput>;
};
export type AuditorAssignmentUpdateWithWhereUniqueWithoutAuditorUserInput = {
    where: Prisma.AuditorAssignmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.AuditorAssignmentUpdateWithoutAuditorUserInput, Prisma.AuditorAssignmentUncheckedUpdateWithoutAuditorUserInput>;
};
export type AuditorAssignmentUpdateManyWithWhereWithoutAuditorUserInput = {
    where: Prisma.AuditorAssignmentScalarWhereInput;
    data: Prisma.XOR<Prisma.AuditorAssignmentUpdateManyMutationInput, Prisma.AuditorAssignmentUncheckedUpdateManyWithoutAuditorUserInput>;
};
export type AuditorAssignmentUpsertWithWhereUniqueWithoutAssignedByUserInput = {
    where: Prisma.AuditorAssignmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.AuditorAssignmentUpdateWithoutAssignedByUserInput, Prisma.AuditorAssignmentUncheckedUpdateWithoutAssignedByUserInput>;
    create: Prisma.XOR<Prisma.AuditorAssignmentCreateWithoutAssignedByUserInput, Prisma.AuditorAssignmentUncheckedCreateWithoutAssignedByUserInput>;
};
export type AuditorAssignmentUpdateWithWhereUniqueWithoutAssignedByUserInput = {
    where: Prisma.AuditorAssignmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.AuditorAssignmentUpdateWithoutAssignedByUserInput, Prisma.AuditorAssignmentUncheckedUpdateWithoutAssignedByUserInput>;
};
export type AuditorAssignmentUpdateManyWithWhereWithoutAssignedByUserInput = {
    where: Prisma.AuditorAssignmentScalarWhereInput;
    data: Prisma.XOR<Prisma.AuditorAssignmentUpdateManyMutationInput, Prisma.AuditorAssignmentUncheckedUpdateManyWithoutAssignedByUserInput>;
};
export type AuditorAssignmentCreateManyCompanyInput = {
    id?: string;
    auditorUserId: string;
    assignedBy: string;
    assignedAt?: Date | string;
    expiresAt?: Date | string | null;
};
export type AuditorAssignmentUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    auditorUser?: Prisma.UserUpdateOneRequiredWithoutAuditorAssignmentsNestedInput;
    assignedByUser?: Prisma.UserUpdateOneRequiredWithoutAuditorAssignmentsGrantedNestedInput;
};
export type AuditorAssignmentUncheckedUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    auditorUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AuditorAssignmentUncheckedUpdateManyWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    auditorUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AuditorAssignmentCreateManyAuditorUserInput = {
    id?: string;
    companyId: string;
    assignedBy: string;
    assignedAt?: Date | string;
    expiresAt?: Date | string | null;
};
export type AuditorAssignmentCreateManyAssignedByUserInput = {
    id?: string;
    auditorUserId: string;
    companyId: string;
    assignedAt?: Date | string;
    expiresAt?: Date | string | null;
};
export type AuditorAssignmentUpdateWithoutAuditorUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    assignedByUser?: Prisma.UserUpdateOneRequiredWithoutAuditorAssignmentsGrantedNestedInput;
    company?: Prisma.CompanyUpdateOneRequiredWithoutAuditorAssignmentsNestedInput;
};
export type AuditorAssignmentUncheckedUpdateWithoutAuditorUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AuditorAssignmentUncheckedUpdateManyWithoutAuditorUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AuditorAssignmentUpdateWithoutAssignedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    auditorUser?: Prisma.UserUpdateOneRequiredWithoutAuditorAssignmentsNestedInput;
    company?: Prisma.CompanyUpdateOneRequiredWithoutAuditorAssignmentsNestedInput;
};
export type AuditorAssignmentUncheckedUpdateWithoutAssignedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    auditorUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AuditorAssignmentUncheckedUpdateManyWithoutAssignedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    auditorUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type AuditorAssignmentSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    auditorUserId?: boolean;
    companyId?: boolean;
    assignedBy?: boolean;
    assignedAt?: boolean;
    expiresAt?: boolean;
    auditorUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["auditorAssignment"]>;
export type AuditorAssignmentSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    auditorUserId?: boolean;
    companyId?: boolean;
    assignedBy?: boolean;
    assignedAt?: boolean;
    expiresAt?: boolean;
    auditorUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["auditorAssignment"]>;
export type AuditorAssignmentSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    auditorUserId?: boolean;
    companyId?: boolean;
    assignedBy?: boolean;
    assignedAt?: boolean;
    expiresAt?: boolean;
    auditorUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["auditorAssignment"]>;
export type AuditorAssignmentSelectScalar = {
    id?: boolean;
    auditorUserId?: boolean;
    companyId?: boolean;
    assignedBy?: boolean;
    assignedAt?: boolean;
    expiresAt?: boolean;
};
export type AuditorAssignmentOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "auditorUserId" | "companyId" | "assignedBy" | "assignedAt" | "expiresAt", ExtArgs["result"]["auditorAssignment"]>;
export type AuditorAssignmentInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    auditorUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type AuditorAssignmentIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    auditorUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type AuditorAssignmentIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    auditorUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $AuditorAssignmentPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "AuditorAssignment";
    objects: {
        auditorUser: Prisma.$UserPayload<ExtArgs>;
        assignedByUser: Prisma.$UserPayload<ExtArgs>;
        company: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        auditorUserId: string;
        companyId: string;
        assignedBy: string;
        assignedAt: Date;
        expiresAt: Date | null;
    }, ExtArgs["result"]["auditorAssignment"]>;
    composites: {};
};
export type AuditorAssignmentGetPayload<S extends boolean | null | undefined | AuditorAssignmentDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AuditorAssignmentPayload, S>;
export type AuditorAssignmentCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AuditorAssignmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AuditorAssignmentCountAggregateInputType | true;
};
export interface AuditorAssignmentDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['AuditorAssignment'];
        meta: {
            name: 'AuditorAssignment';
        };
    };
    findUnique<T extends AuditorAssignmentFindUniqueArgs>(args: Prisma.SelectSubset<T, AuditorAssignmentFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AuditorAssignmentClient<runtime.Types.Result.GetResult<Prisma.$AuditorAssignmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends AuditorAssignmentFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AuditorAssignmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AuditorAssignmentClient<runtime.Types.Result.GetResult<Prisma.$AuditorAssignmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends AuditorAssignmentFindFirstArgs>(args?: Prisma.SelectSubset<T, AuditorAssignmentFindFirstArgs<ExtArgs>>): Prisma.Prisma__AuditorAssignmentClient<runtime.Types.Result.GetResult<Prisma.$AuditorAssignmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends AuditorAssignmentFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AuditorAssignmentFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AuditorAssignmentClient<runtime.Types.Result.GetResult<Prisma.$AuditorAssignmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends AuditorAssignmentFindManyArgs>(args?: Prisma.SelectSubset<T, AuditorAssignmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuditorAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends AuditorAssignmentCreateArgs>(args: Prisma.SelectSubset<T, AuditorAssignmentCreateArgs<ExtArgs>>): Prisma.Prisma__AuditorAssignmentClient<runtime.Types.Result.GetResult<Prisma.$AuditorAssignmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends AuditorAssignmentCreateManyArgs>(args?: Prisma.SelectSubset<T, AuditorAssignmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends AuditorAssignmentCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AuditorAssignmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuditorAssignmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends AuditorAssignmentDeleteArgs>(args: Prisma.SelectSubset<T, AuditorAssignmentDeleteArgs<ExtArgs>>): Prisma.Prisma__AuditorAssignmentClient<runtime.Types.Result.GetResult<Prisma.$AuditorAssignmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends AuditorAssignmentUpdateArgs>(args: Prisma.SelectSubset<T, AuditorAssignmentUpdateArgs<ExtArgs>>): Prisma.Prisma__AuditorAssignmentClient<runtime.Types.Result.GetResult<Prisma.$AuditorAssignmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends AuditorAssignmentDeleteManyArgs>(args?: Prisma.SelectSubset<T, AuditorAssignmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends AuditorAssignmentUpdateManyArgs>(args: Prisma.SelectSubset<T, AuditorAssignmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends AuditorAssignmentUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AuditorAssignmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuditorAssignmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends AuditorAssignmentUpsertArgs>(args: Prisma.SelectSubset<T, AuditorAssignmentUpsertArgs<ExtArgs>>): Prisma.Prisma__AuditorAssignmentClient<runtime.Types.Result.GetResult<Prisma.$AuditorAssignmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends AuditorAssignmentCountArgs>(args?: Prisma.Subset<T, AuditorAssignmentCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AuditorAssignmentCountAggregateOutputType> : number>;
    aggregate<T extends AuditorAssignmentAggregateArgs>(args: Prisma.Subset<T, AuditorAssignmentAggregateArgs>): Prisma.PrismaPromise<GetAuditorAssignmentAggregateType<T>>;
    groupBy<T extends AuditorAssignmentGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AuditorAssignmentGroupByArgs['orderBy'];
    } : {
        orderBy?: AuditorAssignmentGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AuditorAssignmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditorAssignmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: AuditorAssignmentFieldRefs;
}
export interface Prisma__AuditorAssignmentClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    auditorUser<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    assignedByUser<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    company<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface AuditorAssignmentFieldRefs {
    readonly id: Prisma.FieldRef<"AuditorAssignment", 'String'>;
    readonly auditorUserId: Prisma.FieldRef<"AuditorAssignment", 'String'>;
    readonly companyId: Prisma.FieldRef<"AuditorAssignment", 'String'>;
    readonly assignedBy: Prisma.FieldRef<"AuditorAssignment", 'String'>;
    readonly assignedAt: Prisma.FieldRef<"AuditorAssignment", 'DateTime'>;
    readonly expiresAt: Prisma.FieldRef<"AuditorAssignment", 'DateTime'>;
}
export type AuditorAssignmentFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditorAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AuditorAssignmentOmit<ExtArgs> | null;
    include?: Prisma.AuditorAssignmentInclude<ExtArgs> | null;
    where: Prisma.AuditorAssignmentWhereUniqueInput;
};
export type AuditorAssignmentFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditorAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AuditorAssignmentOmit<ExtArgs> | null;
    include?: Prisma.AuditorAssignmentInclude<ExtArgs> | null;
    where: Prisma.AuditorAssignmentWhereUniqueInput;
};
export type AuditorAssignmentFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditorAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AuditorAssignmentOmit<ExtArgs> | null;
    include?: Prisma.AuditorAssignmentInclude<ExtArgs> | null;
    where?: Prisma.AuditorAssignmentWhereInput;
    orderBy?: Prisma.AuditorAssignmentOrderByWithRelationInput | Prisma.AuditorAssignmentOrderByWithRelationInput[];
    cursor?: Prisma.AuditorAssignmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AuditorAssignmentScalarFieldEnum | Prisma.AuditorAssignmentScalarFieldEnum[];
};
export type AuditorAssignmentFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditorAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AuditorAssignmentOmit<ExtArgs> | null;
    include?: Prisma.AuditorAssignmentInclude<ExtArgs> | null;
    where?: Prisma.AuditorAssignmentWhereInput;
    orderBy?: Prisma.AuditorAssignmentOrderByWithRelationInput | Prisma.AuditorAssignmentOrderByWithRelationInput[];
    cursor?: Prisma.AuditorAssignmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AuditorAssignmentScalarFieldEnum | Prisma.AuditorAssignmentScalarFieldEnum[];
};
export type AuditorAssignmentFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditorAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AuditorAssignmentOmit<ExtArgs> | null;
    include?: Prisma.AuditorAssignmentInclude<ExtArgs> | null;
    where?: Prisma.AuditorAssignmentWhereInput;
    orderBy?: Prisma.AuditorAssignmentOrderByWithRelationInput | Prisma.AuditorAssignmentOrderByWithRelationInput[];
    cursor?: Prisma.AuditorAssignmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AuditorAssignmentScalarFieldEnum | Prisma.AuditorAssignmentScalarFieldEnum[];
};
export type AuditorAssignmentCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditorAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AuditorAssignmentOmit<ExtArgs> | null;
    include?: Prisma.AuditorAssignmentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AuditorAssignmentCreateInput, Prisma.AuditorAssignmentUncheckedCreateInput>;
};
export type AuditorAssignmentCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.AuditorAssignmentCreateManyInput | Prisma.AuditorAssignmentCreateManyInput[];
    skipDuplicates?: boolean;
};
export type AuditorAssignmentCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditorAssignmentSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AuditorAssignmentOmit<ExtArgs> | null;
    data: Prisma.AuditorAssignmentCreateManyInput | Prisma.AuditorAssignmentCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.AuditorAssignmentIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type AuditorAssignmentUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditorAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AuditorAssignmentOmit<ExtArgs> | null;
    include?: Prisma.AuditorAssignmentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AuditorAssignmentUpdateInput, Prisma.AuditorAssignmentUncheckedUpdateInput>;
    where: Prisma.AuditorAssignmentWhereUniqueInput;
};
export type AuditorAssignmentUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.AuditorAssignmentUpdateManyMutationInput, Prisma.AuditorAssignmentUncheckedUpdateManyInput>;
    where?: Prisma.AuditorAssignmentWhereInput;
    limit?: number;
};
export type AuditorAssignmentUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditorAssignmentSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AuditorAssignmentOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AuditorAssignmentUpdateManyMutationInput, Prisma.AuditorAssignmentUncheckedUpdateManyInput>;
    where?: Prisma.AuditorAssignmentWhereInput;
    limit?: number;
    include?: Prisma.AuditorAssignmentIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type AuditorAssignmentUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditorAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AuditorAssignmentOmit<ExtArgs> | null;
    include?: Prisma.AuditorAssignmentInclude<ExtArgs> | null;
    where: Prisma.AuditorAssignmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.AuditorAssignmentCreateInput, Prisma.AuditorAssignmentUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.AuditorAssignmentUpdateInput, Prisma.AuditorAssignmentUncheckedUpdateInput>;
};
export type AuditorAssignmentDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditorAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AuditorAssignmentOmit<ExtArgs> | null;
    include?: Prisma.AuditorAssignmentInclude<ExtArgs> | null;
    where: Prisma.AuditorAssignmentWhereUniqueInput;
};
export type AuditorAssignmentDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuditorAssignmentWhereInput;
    limit?: number;
};
export type AuditorAssignmentDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditorAssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AuditorAssignmentOmit<ExtArgs> | null;
    include?: Prisma.AuditorAssignmentInclude<ExtArgs> | null;
};
export {};
