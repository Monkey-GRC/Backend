import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ResidualRiskModel = runtime.Types.Result.DefaultSelection<Prisma.$ResidualRiskPayload>;
export type AggregateResidualRisk = {
    _count: ResidualRiskCountAggregateOutputType | null;
    _min: ResidualRiskMinAggregateOutputType | null;
    _max: ResidualRiskMaxAggregateOutputType | null;
};
export type ResidualRiskMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientRiskId: string | null;
    acceptedBy: string | null;
    residualLevel: $Enums.RiskLevel | null;
    justification: string | null;
    acceptedAt: Date | null;
};
export type ResidualRiskMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientRiskId: string | null;
    acceptedBy: string | null;
    residualLevel: $Enums.RiskLevel | null;
    justification: string | null;
    acceptedAt: Date | null;
};
export type ResidualRiskCountAggregateOutputType = {
    id: number;
    tenantId: number;
    clientRiskId: number;
    acceptedBy: number;
    residualLevel: number;
    justification: number;
    acceptedAt: number;
    _all: number;
};
export type ResidualRiskMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientRiskId?: true;
    acceptedBy?: true;
    residualLevel?: true;
    justification?: true;
    acceptedAt?: true;
};
export type ResidualRiskMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientRiskId?: true;
    acceptedBy?: true;
    residualLevel?: true;
    justification?: true;
    acceptedAt?: true;
};
export type ResidualRiskCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientRiskId?: true;
    acceptedBy?: true;
    residualLevel?: true;
    justification?: true;
    acceptedAt?: true;
    _all?: true;
};
export type ResidualRiskAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ResidualRiskWhereInput;
    orderBy?: Prisma.ResidualRiskOrderByWithRelationInput | Prisma.ResidualRiskOrderByWithRelationInput[];
    cursor?: Prisma.ResidualRiskWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ResidualRiskCountAggregateInputType;
    _min?: ResidualRiskMinAggregateInputType;
    _max?: ResidualRiskMaxAggregateInputType;
};
export type GetResidualRiskAggregateType<T extends ResidualRiskAggregateArgs> = {
    [P in keyof T & keyof AggregateResidualRisk]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateResidualRisk[P]> : Prisma.GetScalarType<T[P], AggregateResidualRisk[P]>;
};
export type ResidualRiskGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ResidualRiskWhereInput;
    orderBy?: Prisma.ResidualRiskOrderByWithAggregationInput | Prisma.ResidualRiskOrderByWithAggregationInput[];
    by: Prisma.ResidualRiskScalarFieldEnum[] | Prisma.ResidualRiskScalarFieldEnum;
    having?: Prisma.ResidualRiskScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ResidualRiskCountAggregateInputType | true;
    _min?: ResidualRiskMinAggregateInputType;
    _max?: ResidualRiskMaxAggregateInputType;
};
export type ResidualRiskGroupByOutputType = {
    id: string;
    tenantId: string;
    clientRiskId: string;
    acceptedBy: string;
    residualLevel: $Enums.RiskLevel;
    justification: string;
    acceptedAt: Date;
    _count: ResidualRiskCountAggregateOutputType | null;
    _min: ResidualRiskMinAggregateOutputType | null;
    _max: ResidualRiskMaxAggregateOutputType | null;
};
type GetResidualRiskGroupByPayload<T extends ResidualRiskGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ResidualRiskGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ResidualRiskGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ResidualRiskGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ResidualRiskGroupByOutputType[P]>;
}>>;
export type ResidualRiskWhereInput = {
    AND?: Prisma.ResidualRiskWhereInput | Prisma.ResidualRiskWhereInput[];
    OR?: Prisma.ResidualRiskWhereInput[];
    NOT?: Prisma.ResidualRiskWhereInput | Prisma.ResidualRiskWhereInput[];
    id?: Prisma.UuidFilter<"ResidualRisk"> | string;
    tenantId?: Prisma.UuidFilter<"ResidualRisk"> | string;
    clientRiskId?: Prisma.UuidFilter<"ResidualRisk"> | string;
    acceptedBy?: Prisma.UuidFilter<"ResidualRisk"> | string;
    residualLevel?: Prisma.EnumRiskLevelFilter<"ResidualRisk"> | $Enums.RiskLevel;
    justification?: Prisma.StringFilter<"ResidualRisk"> | string;
    acceptedAt?: Prisma.DateTimeFilter<"ResidualRisk"> | Date | string;
    clientRisk?: Prisma.XOR<Prisma.ClientRiskScalarRelationFilter, Prisma.ClientRiskWhereInput>;
    acceptedByUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type ResidualRiskOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    acceptedBy?: Prisma.SortOrder;
    residualLevel?: Prisma.SortOrder;
    justification?: Prisma.SortOrder;
    acceptedAt?: Prisma.SortOrder;
    clientRisk?: Prisma.ClientRiskOrderByWithRelationInput;
    acceptedByUser?: Prisma.UserOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type ResidualRiskWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ResidualRiskWhereInput | Prisma.ResidualRiskWhereInput[];
    OR?: Prisma.ResidualRiskWhereInput[];
    NOT?: Prisma.ResidualRiskWhereInput | Prisma.ResidualRiskWhereInput[];
    tenantId?: Prisma.UuidFilter<"ResidualRisk"> | string;
    clientRiskId?: Prisma.UuidFilter<"ResidualRisk"> | string;
    acceptedBy?: Prisma.UuidFilter<"ResidualRisk"> | string;
    residualLevel?: Prisma.EnumRiskLevelFilter<"ResidualRisk"> | $Enums.RiskLevel;
    justification?: Prisma.StringFilter<"ResidualRisk"> | string;
    acceptedAt?: Prisma.DateTimeFilter<"ResidualRisk"> | Date | string;
    clientRisk?: Prisma.XOR<Prisma.ClientRiskScalarRelationFilter, Prisma.ClientRiskWhereInput>;
    acceptedByUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id">;
export type ResidualRiskOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    acceptedBy?: Prisma.SortOrder;
    residualLevel?: Prisma.SortOrder;
    justification?: Prisma.SortOrder;
    acceptedAt?: Prisma.SortOrder;
    _count?: Prisma.ResidualRiskCountOrderByAggregateInput;
    _max?: Prisma.ResidualRiskMaxOrderByAggregateInput;
    _min?: Prisma.ResidualRiskMinOrderByAggregateInput;
};
export type ResidualRiskScalarWhereWithAggregatesInput = {
    AND?: Prisma.ResidualRiskScalarWhereWithAggregatesInput | Prisma.ResidualRiskScalarWhereWithAggregatesInput[];
    OR?: Prisma.ResidualRiskScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ResidualRiskScalarWhereWithAggregatesInput | Prisma.ResidualRiskScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ResidualRisk"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ResidualRisk"> | string;
    clientRiskId?: Prisma.UuidWithAggregatesFilter<"ResidualRisk"> | string;
    acceptedBy?: Prisma.UuidWithAggregatesFilter<"ResidualRisk"> | string;
    residualLevel?: Prisma.EnumRiskLevelWithAggregatesFilter<"ResidualRisk"> | $Enums.RiskLevel;
    justification?: Prisma.StringWithAggregatesFilter<"ResidualRisk"> | string;
    acceptedAt?: Prisma.DateTimeWithAggregatesFilter<"ResidualRisk"> | Date | string;
};
export type ResidualRiskCreateInput = {
    id?: string;
    residualLevel: $Enums.RiskLevel;
    justification: string;
    acceptedAt: Date | string;
    clientRisk: Prisma.ClientRiskCreateNestedOneWithoutResidualRisksInput;
    acceptedByUser: Prisma.UserCreateNestedOneWithoutResidualRisksAcceptedInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutResidualRisksInput;
};
export type ResidualRiskUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    clientRiskId: string;
    acceptedBy: string;
    residualLevel: $Enums.RiskLevel;
    justification: string;
    acceptedAt: Date | string;
};
export type ResidualRiskUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    residualLevel?: Prisma.EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientRisk?: Prisma.ClientRiskUpdateOneRequiredWithoutResidualRisksNestedInput;
    acceptedByUser?: Prisma.UserUpdateOneRequiredWithoutResidualRisksAcceptedNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutResidualRisksNestedInput;
};
export type ResidualRiskUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    residualLevel?: Prisma.EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ResidualRiskCreateManyInput = {
    id?: string;
    tenantId: string;
    clientRiskId: string;
    acceptedBy: string;
    residualLevel: $Enums.RiskLevel;
    justification: string;
    acceptedAt: Date | string;
};
export type ResidualRiskUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    residualLevel?: Prisma.EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ResidualRiskUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    residualLevel?: Prisma.EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ResidualRiskListRelationFilter = {
    every?: Prisma.ResidualRiskWhereInput;
    some?: Prisma.ResidualRiskWhereInput;
    none?: Prisma.ResidualRiskWhereInput;
};
export type ResidualRiskOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ResidualRiskCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    acceptedBy?: Prisma.SortOrder;
    residualLevel?: Prisma.SortOrder;
    justification?: Prisma.SortOrder;
    acceptedAt?: Prisma.SortOrder;
};
export type ResidualRiskMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    acceptedBy?: Prisma.SortOrder;
    residualLevel?: Prisma.SortOrder;
    justification?: Prisma.SortOrder;
    acceptedAt?: Prisma.SortOrder;
};
export type ResidualRiskMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    acceptedBy?: Prisma.SortOrder;
    residualLevel?: Prisma.SortOrder;
    justification?: Prisma.SortOrder;
    acceptedAt?: Prisma.SortOrder;
};
export type ResidualRiskCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ResidualRiskCreateWithoutTenantInput, Prisma.ResidualRiskUncheckedCreateWithoutTenantInput> | Prisma.ResidualRiskCreateWithoutTenantInput[] | Prisma.ResidualRiskUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ResidualRiskCreateOrConnectWithoutTenantInput | Prisma.ResidualRiskCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ResidualRiskCreateManyTenantInputEnvelope;
    connect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
};
export type ResidualRiskUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ResidualRiskCreateWithoutTenantInput, Prisma.ResidualRiskUncheckedCreateWithoutTenantInput> | Prisma.ResidualRiskCreateWithoutTenantInput[] | Prisma.ResidualRiskUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ResidualRiskCreateOrConnectWithoutTenantInput | Prisma.ResidualRiskCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ResidualRiskCreateManyTenantInputEnvelope;
    connect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
};
export type ResidualRiskUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ResidualRiskCreateWithoutTenantInput, Prisma.ResidualRiskUncheckedCreateWithoutTenantInput> | Prisma.ResidualRiskCreateWithoutTenantInput[] | Prisma.ResidualRiskUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ResidualRiskCreateOrConnectWithoutTenantInput | Prisma.ResidualRiskCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ResidualRiskUpsertWithWhereUniqueWithoutTenantInput | Prisma.ResidualRiskUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ResidualRiskCreateManyTenantInputEnvelope;
    set?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    disconnect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    delete?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    connect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    update?: Prisma.ResidualRiskUpdateWithWhereUniqueWithoutTenantInput | Prisma.ResidualRiskUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ResidualRiskUpdateManyWithWhereWithoutTenantInput | Prisma.ResidualRiskUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ResidualRiskScalarWhereInput | Prisma.ResidualRiskScalarWhereInput[];
};
export type ResidualRiskUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ResidualRiskCreateWithoutTenantInput, Prisma.ResidualRiskUncheckedCreateWithoutTenantInput> | Prisma.ResidualRiskCreateWithoutTenantInput[] | Prisma.ResidualRiskUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ResidualRiskCreateOrConnectWithoutTenantInput | Prisma.ResidualRiskCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ResidualRiskUpsertWithWhereUniqueWithoutTenantInput | Prisma.ResidualRiskUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ResidualRiskCreateManyTenantInputEnvelope;
    set?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    disconnect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    delete?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    connect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    update?: Prisma.ResidualRiskUpdateWithWhereUniqueWithoutTenantInput | Prisma.ResidualRiskUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ResidualRiskUpdateManyWithWhereWithoutTenantInput | Prisma.ResidualRiskUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ResidualRiskScalarWhereInput | Prisma.ResidualRiskScalarWhereInput[];
};
export type ResidualRiskCreateNestedManyWithoutAcceptedByUserInput = {
    create?: Prisma.XOR<Prisma.ResidualRiskCreateWithoutAcceptedByUserInput, Prisma.ResidualRiskUncheckedCreateWithoutAcceptedByUserInput> | Prisma.ResidualRiskCreateWithoutAcceptedByUserInput[] | Prisma.ResidualRiskUncheckedCreateWithoutAcceptedByUserInput[];
    connectOrCreate?: Prisma.ResidualRiskCreateOrConnectWithoutAcceptedByUserInput | Prisma.ResidualRiskCreateOrConnectWithoutAcceptedByUserInput[];
    createMany?: Prisma.ResidualRiskCreateManyAcceptedByUserInputEnvelope;
    connect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
};
export type ResidualRiskUncheckedCreateNestedManyWithoutAcceptedByUserInput = {
    create?: Prisma.XOR<Prisma.ResidualRiskCreateWithoutAcceptedByUserInput, Prisma.ResidualRiskUncheckedCreateWithoutAcceptedByUserInput> | Prisma.ResidualRiskCreateWithoutAcceptedByUserInput[] | Prisma.ResidualRiskUncheckedCreateWithoutAcceptedByUserInput[];
    connectOrCreate?: Prisma.ResidualRiskCreateOrConnectWithoutAcceptedByUserInput | Prisma.ResidualRiskCreateOrConnectWithoutAcceptedByUserInput[];
    createMany?: Prisma.ResidualRiskCreateManyAcceptedByUserInputEnvelope;
    connect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
};
export type ResidualRiskUpdateManyWithoutAcceptedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.ResidualRiskCreateWithoutAcceptedByUserInput, Prisma.ResidualRiskUncheckedCreateWithoutAcceptedByUserInput> | Prisma.ResidualRiskCreateWithoutAcceptedByUserInput[] | Prisma.ResidualRiskUncheckedCreateWithoutAcceptedByUserInput[];
    connectOrCreate?: Prisma.ResidualRiskCreateOrConnectWithoutAcceptedByUserInput | Prisma.ResidualRiskCreateOrConnectWithoutAcceptedByUserInput[];
    upsert?: Prisma.ResidualRiskUpsertWithWhereUniqueWithoutAcceptedByUserInput | Prisma.ResidualRiskUpsertWithWhereUniqueWithoutAcceptedByUserInput[];
    createMany?: Prisma.ResidualRiskCreateManyAcceptedByUserInputEnvelope;
    set?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    disconnect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    delete?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    connect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    update?: Prisma.ResidualRiskUpdateWithWhereUniqueWithoutAcceptedByUserInput | Prisma.ResidualRiskUpdateWithWhereUniqueWithoutAcceptedByUserInput[];
    updateMany?: Prisma.ResidualRiskUpdateManyWithWhereWithoutAcceptedByUserInput | Prisma.ResidualRiskUpdateManyWithWhereWithoutAcceptedByUserInput[];
    deleteMany?: Prisma.ResidualRiskScalarWhereInput | Prisma.ResidualRiskScalarWhereInput[];
};
export type ResidualRiskUncheckedUpdateManyWithoutAcceptedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.ResidualRiskCreateWithoutAcceptedByUserInput, Prisma.ResidualRiskUncheckedCreateWithoutAcceptedByUserInput> | Prisma.ResidualRiskCreateWithoutAcceptedByUserInput[] | Prisma.ResidualRiskUncheckedCreateWithoutAcceptedByUserInput[];
    connectOrCreate?: Prisma.ResidualRiskCreateOrConnectWithoutAcceptedByUserInput | Prisma.ResidualRiskCreateOrConnectWithoutAcceptedByUserInput[];
    upsert?: Prisma.ResidualRiskUpsertWithWhereUniqueWithoutAcceptedByUserInput | Prisma.ResidualRiskUpsertWithWhereUniqueWithoutAcceptedByUserInput[];
    createMany?: Prisma.ResidualRiskCreateManyAcceptedByUserInputEnvelope;
    set?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    disconnect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    delete?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    connect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    update?: Prisma.ResidualRiskUpdateWithWhereUniqueWithoutAcceptedByUserInput | Prisma.ResidualRiskUpdateWithWhereUniqueWithoutAcceptedByUserInput[];
    updateMany?: Prisma.ResidualRiskUpdateManyWithWhereWithoutAcceptedByUserInput | Prisma.ResidualRiskUpdateManyWithWhereWithoutAcceptedByUserInput[];
    deleteMany?: Prisma.ResidualRiskScalarWhereInput | Prisma.ResidualRiskScalarWhereInput[];
};
export type EnumRiskLevelFieldUpdateOperationsInput = {
    set?: $Enums.RiskLevel;
};
export type ResidualRiskCreateNestedManyWithoutClientRiskInput = {
    create?: Prisma.XOR<Prisma.ResidualRiskCreateWithoutClientRiskInput, Prisma.ResidualRiskUncheckedCreateWithoutClientRiskInput> | Prisma.ResidualRiskCreateWithoutClientRiskInput[] | Prisma.ResidualRiskUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.ResidualRiskCreateOrConnectWithoutClientRiskInput | Prisma.ResidualRiskCreateOrConnectWithoutClientRiskInput[];
    createMany?: Prisma.ResidualRiskCreateManyClientRiskInputEnvelope;
    connect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
};
export type ResidualRiskUncheckedCreateNestedManyWithoutClientRiskInput = {
    create?: Prisma.XOR<Prisma.ResidualRiskCreateWithoutClientRiskInput, Prisma.ResidualRiskUncheckedCreateWithoutClientRiskInput> | Prisma.ResidualRiskCreateWithoutClientRiskInput[] | Prisma.ResidualRiskUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.ResidualRiskCreateOrConnectWithoutClientRiskInput | Prisma.ResidualRiskCreateOrConnectWithoutClientRiskInput[];
    createMany?: Prisma.ResidualRiskCreateManyClientRiskInputEnvelope;
    connect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
};
export type ResidualRiskUpdateManyWithoutClientRiskNestedInput = {
    create?: Prisma.XOR<Prisma.ResidualRiskCreateWithoutClientRiskInput, Prisma.ResidualRiskUncheckedCreateWithoutClientRiskInput> | Prisma.ResidualRiskCreateWithoutClientRiskInput[] | Prisma.ResidualRiskUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.ResidualRiskCreateOrConnectWithoutClientRiskInput | Prisma.ResidualRiskCreateOrConnectWithoutClientRiskInput[];
    upsert?: Prisma.ResidualRiskUpsertWithWhereUniqueWithoutClientRiskInput | Prisma.ResidualRiskUpsertWithWhereUniqueWithoutClientRiskInput[];
    createMany?: Prisma.ResidualRiskCreateManyClientRiskInputEnvelope;
    set?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    disconnect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    delete?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    connect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    update?: Prisma.ResidualRiskUpdateWithWhereUniqueWithoutClientRiskInput | Prisma.ResidualRiskUpdateWithWhereUniqueWithoutClientRiskInput[];
    updateMany?: Prisma.ResidualRiskUpdateManyWithWhereWithoutClientRiskInput | Prisma.ResidualRiskUpdateManyWithWhereWithoutClientRiskInput[];
    deleteMany?: Prisma.ResidualRiskScalarWhereInput | Prisma.ResidualRiskScalarWhereInput[];
};
export type ResidualRiskUncheckedUpdateManyWithoutClientRiskNestedInput = {
    create?: Prisma.XOR<Prisma.ResidualRiskCreateWithoutClientRiskInput, Prisma.ResidualRiskUncheckedCreateWithoutClientRiskInput> | Prisma.ResidualRiskCreateWithoutClientRiskInput[] | Prisma.ResidualRiskUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.ResidualRiskCreateOrConnectWithoutClientRiskInput | Prisma.ResidualRiskCreateOrConnectWithoutClientRiskInput[];
    upsert?: Prisma.ResidualRiskUpsertWithWhereUniqueWithoutClientRiskInput | Prisma.ResidualRiskUpsertWithWhereUniqueWithoutClientRiskInput[];
    createMany?: Prisma.ResidualRiskCreateManyClientRiskInputEnvelope;
    set?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    disconnect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    delete?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    connect?: Prisma.ResidualRiskWhereUniqueInput | Prisma.ResidualRiskWhereUniqueInput[];
    update?: Prisma.ResidualRiskUpdateWithWhereUniqueWithoutClientRiskInput | Prisma.ResidualRiskUpdateWithWhereUniqueWithoutClientRiskInput[];
    updateMany?: Prisma.ResidualRiskUpdateManyWithWhereWithoutClientRiskInput | Prisma.ResidualRiskUpdateManyWithWhereWithoutClientRiskInput[];
    deleteMany?: Prisma.ResidualRiskScalarWhereInput | Prisma.ResidualRiskScalarWhereInput[];
};
export type ResidualRiskCreateWithoutTenantInput = {
    id?: string;
    residualLevel: $Enums.RiskLevel;
    justification: string;
    acceptedAt: Date | string;
    clientRisk: Prisma.ClientRiskCreateNestedOneWithoutResidualRisksInput;
    acceptedByUser: Prisma.UserCreateNestedOneWithoutResidualRisksAcceptedInput;
};
export type ResidualRiskUncheckedCreateWithoutTenantInput = {
    id?: string;
    clientRiskId: string;
    acceptedBy: string;
    residualLevel: $Enums.RiskLevel;
    justification: string;
    acceptedAt: Date | string;
};
export type ResidualRiskCreateOrConnectWithoutTenantInput = {
    where: Prisma.ResidualRiskWhereUniqueInput;
    create: Prisma.XOR<Prisma.ResidualRiskCreateWithoutTenantInput, Prisma.ResidualRiskUncheckedCreateWithoutTenantInput>;
};
export type ResidualRiskCreateManyTenantInputEnvelope = {
    data: Prisma.ResidualRiskCreateManyTenantInput | Prisma.ResidualRiskCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ResidualRiskUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ResidualRiskWhereUniqueInput;
    update: Prisma.XOR<Prisma.ResidualRiskUpdateWithoutTenantInput, Prisma.ResidualRiskUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ResidualRiskCreateWithoutTenantInput, Prisma.ResidualRiskUncheckedCreateWithoutTenantInput>;
};
export type ResidualRiskUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ResidualRiskWhereUniqueInput;
    data: Prisma.XOR<Prisma.ResidualRiskUpdateWithoutTenantInput, Prisma.ResidualRiskUncheckedUpdateWithoutTenantInput>;
};
export type ResidualRiskUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ResidualRiskScalarWhereInput;
    data: Prisma.XOR<Prisma.ResidualRiskUpdateManyMutationInput, Prisma.ResidualRiskUncheckedUpdateManyWithoutTenantInput>;
};
export type ResidualRiskScalarWhereInput = {
    AND?: Prisma.ResidualRiskScalarWhereInput | Prisma.ResidualRiskScalarWhereInput[];
    OR?: Prisma.ResidualRiskScalarWhereInput[];
    NOT?: Prisma.ResidualRiskScalarWhereInput | Prisma.ResidualRiskScalarWhereInput[];
    id?: Prisma.UuidFilter<"ResidualRisk"> | string;
    tenantId?: Prisma.UuidFilter<"ResidualRisk"> | string;
    clientRiskId?: Prisma.UuidFilter<"ResidualRisk"> | string;
    acceptedBy?: Prisma.UuidFilter<"ResidualRisk"> | string;
    residualLevel?: Prisma.EnumRiskLevelFilter<"ResidualRisk"> | $Enums.RiskLevel;
    justification?: Prisma.StringFilter<"ResidualRisk"> | string;
    acceptedAt?: Prisma.DateTimeFilter<"ResidualRisk"> | Date | string;
};
export type ResidualRiskCreateWithoutAcceptedByUserInput = {
    id?: string;
    residualLevel: $Enums.RiskLevel;
    justification: string;
    acceptedAt: Date | string;
    clientRisk: Prisma.ClientRiskCreateNestedOneWithoutResidualRisksInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutResidualRisksInput;
};
export type ResidualRiskUncheckedCreateWithoutAcceptedByUserInput = {
    id?: string;
    tenantId: string;
    clientRiskId: string;
    residualLevel: $Enums.RiskLevel;
    justification: string;
    acceptedAt: Date | string;
};
export type ResidualRiskCreateOrConnectWithoutAcceptedByUserInput = {
    where: Prisma.ResidualRiskWhereUniqueInput;
    create: Prisma.XOR<Prisma.ResidualRiskCreateWithoutAcceptedByUserInput, Prisma.ResidualRiskUncheckedCreateWithoutAcceptedByUserInput>;
};
export type ResidualRiskCreateManyAcceptedByUserInputEnvelope = {
    data: Prisma.ResidualRiskCreateManyAcceptedByUserInput | Prisma.ResidualRiskCreateManyAcceptedByUserInput[];
    skipDuplicates?: boolean;
};
export type ResidualRiskUpsertWithWhereUniqueWithoutAcceptedByUserInput = {
    where: Prisma.ResidualRiskWhereUniqueInput;
    update: Prisma.XOR<Prisma.ResidualRiskUpdateWithoutAcceptedByUserInput, Prisma.ResidualRiskUncheckedUpdateWithoutAcceptedByUserInput>;
    create: Prisma.XOR<Prisma.ResidualRiskCreateWithoutAcceptedByUserInput, Prisma.ResidualRiskUncheckedCreateWithoutAcceptedByUserInput>;
};
export type ResidualRiskUpdateWithWhereUniqueWithoutAcceptedByUserInput = {
    where: Prisma.ResidualRiskWhereUniqueInput;
    data: Prisma.XOR<Prisma.ResidualRiskUpdateWithoutAcceptedByUserInput, Prisma.ResidualRiskUncheckedUpdateWithoutAcceptedByUserInput>;
};
export type ResidualRiskUpdateManyWithWhereWithoutAcceptedByUserInput = {
    where: Prisma.ResidualRiskScalarWhereInput;
    data: Prisma.XOR<Prisma.ResidualRiskUpdateManyMutationInput, Prisma.ResidualRiskUncheckedUpdateManyWithoutAcceptedByUserInput>;
};
export type ResidualRiskCreateWithoutClientRiskInput = {
    id?: string;
    residualLevel: $Enums.RiskLevel;
    justification: string;
    acceptedAt: Date | string;
    acceptedByUser: Prisma.UserCreateNestedOneWithoutResidualRisksAcceptedInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutResidualRisksInput;
};
export type ResidualRiskUncheckedCreateWithoutClientRiskInput = {
    id?: string;
    tenantId: string;
    acceptedBy: string;
    residualLevel: $Enums.RiskLevel;
    justification: string;
    acceptedAt: Date | string;
};
export type ResidualRiskCreateOrConnectWithoutClientRiskInput = {
    where: Prisma.ResidualRiskWhereUniqueInput;
    create: Prisma.XOR<Prisma.ResidualRiskCreateWithoutClientRiskInput, Prisma.ResidualRiskUncheckedCreateWithoutClientRiskInput>;
};
export type ResidualRiskCreateManyClientRiskInputEnvelope = {
    data: Prisma.ResidualRiskCreateManyClientRiskInput | Prisma.ResidualRiskCreateManyClientRiskInput[];
    skipDuplicates?: boolean;
};
export type ResidualRiskUpsertWithWhereUniqueWithoutClientRiskInput = {
    where: Prisma.ResidualRiskWhereUniqueInput;
    update: Prisma.XOR<Prisma.ResidualRiskUpdateWithoutClientRiskInput, Prisma.ResidualRiskUncheckedUpdateWithoutClientRiskInput>;
    create: Prisma.XOR<Prisma.ResidualRiskCreateWithoutClientRiskInput, Prisma.ResidualRiskUncheckedCreateWithoutClientRiskInput>;
};
export type ResidualRiskUpdateWithWhereUniqueWithoutClientRiskInput = {
    where: Prisma.ResidualRiskWhereUniqueInput;
    data: Prisma.XOR<Prisma.ResidualRiskUpdateWithoutClientRiskInput, Prisma.ResidualRiskUncheckedUpdateWithoutClientRiskInput>;
};
export type ResidualRiskUpdateManyWithWhereWithoutClientRiskInput = {
    where: Prisma.ResidualRiskScalarWhereInput;
    data: Prisma.XOR<Prisma.ResidualRiskUpdateManyMutationInput, Prisma.ResidualRiskUncheckedUpdateManyWithoutClientRiskInput>;
};
export type ResidualRiskCreateManyTenantInput = {
    id?: string;
    clientRiskId: string;
    acceptedBy: string;
    residualLevel: $Enums.RiskLevel;
    justification: string;
    acceptedAt: Date | string;
};
export type ResidualRiskUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    residualLevel?: Prisma.EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientRisk?: Prisma.ClientRiskUpdateOneRequiredWithoutResidualRisksNestedInput;
    acceptedByUser?: Prisma.UserUpdateOneRequiredWithoutResidualRisksAcceptedNestedInput;
};
export type ResidualRiskUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    residualLevel?: Prisma.EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ResidualRiskUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    residualLevel?: Prisma.EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ResidualRiskCreateManyAcceptedByUserInput = {
    id?: string;
    tenantId: string;
    clientRiskId: string;
    residualLevel: $Enums.RiskLevel;
    justification: string;
    acceptedAt: Date | string;
};
export type ResidualRiskUpdateWithoutAcceptedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    residualLevel?: Prisma.EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientRisk?: Prisma.ClientRiskUpdateOneRequiredWithoutResidualRisksNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutResidualRisksNestedInput;
};
export type ResidualRiskUncheckedUpdateWithoutAcceptedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    residualLevel?: Prisma.EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ResidualRiskUncheckedUpdateManyWithoutAcceptedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    residualLevel?: Prisma.EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ResidualRiskCreateManyClientRiskInput = {
    id?: string;
    tenantId: string;
    acceptedBy: string;
    residualLevel: $Enums.RiskLevel;
    justification: string;
    acceptedAt: Date | string;
};
export type ResidualRiskUpdateWithoutClientRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    residualLevel?: Prisma.EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    acceptedByUser?: Prisma.UserUpdateOneRequiredWithoutResidualRisksAcceptedNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutResidualRisksNestedInput;
};
export type ResidualRiskUncheckedUpdateWithoutClientRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    residualLevel?: Prisma.EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ResidualRiskUncheckedUpdateManyWithoutClientRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    residualLevel?: Prisma.EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel;
    justification?: Prisma.StringFieldUpdateOperationsInput | string;
    acceptedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ResidualRiskSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientRiskId?: boolean;
    acceptedBy?: boolean;
    residualLevel?: boolean;
    justification?: boolean;
    acceptedAt?: boolean;
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    acceptedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["residualRisk"]>;
export type ResidualRiskSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientRiskId?: boolean;
    acceptedBy?: boolean;
    residualLevel?: boolean;
    justification?: boolean;
    acceptedAt?: boolean;
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    acceptedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["residualRisk"]>;
export type ResidualRiskSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientRiskId?: boolean;
    acceptedBy?: boolean;
    residualLevel?: boolean;
    justification?: boolean;
    acceptedAt?: boolean;
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    acceptedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["residualRisk"]>;
export type ResidualRiskSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    clientRiskId?: boolean;
    acceptedBy?: boolean;
    residualLevel?: boolean;
    justification?: boolean;
    acceptedAt?: boolean;
};
export type ResidualRiskOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "clientRiskId" | "acceptedBy" | "residualLevel" | "justification" | "acceptedAt", ExtArgs["result"]["residualRisk"]>;
export type ResidualRiskInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    acceptedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ResidualRiskIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    acceptedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ResidualRiskIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    acceptedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ResidualRiskPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ResidualRisk";
    objects: {
        clientRisk: Prisma.$ClientRiskPayload<ExtArgs>;
        acceptedByUser: Prisma.$UserPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        clientRiskId: string;
        acceptedBy: string;
        residualLevel: $Enums.RiskLevel;
        justification: string;
        acceptedAt: Date;
    }, ExtArgs["result"]["residualRisk"]>;
    composites: {};
};
export type ResidualRiskGetPayload<S extends boolean | null | undefined | ResidualRiskDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ResidualRiskPayload, S>;
export type ResidualRiskCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ResidualRiskFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ResidualRiskCountAggregateInputType | true;
};
export interface ResidualRiskDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ResidualRisk'];
        meta: {
            name: 'ResidualRisk';
        };
    };
    findUnique<T extends ResidualRiskFindUniqueArgs>(args: Prisma.SelectSubset<T, ResidualRiskFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ResidualRiskClient<runtime.Types.Result.GetResult<Prisma.$ResidualRiskPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ResidualRiskFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ResidualRiskFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ResidualRiskClient<runtime.Types.Result.GetResult<Prisma.$ResidualRiskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ResidualRiskFindFirstArgs>(args?: Prisma.SelectSubset<T, ResidualRiskFindFirstArgs<ExtArgs>>): Prisma.Prisma__ResidualRiskClient<runtime.Types.Result.GetResult<Prisma.$ResidualRiskPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ResidualRiskFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ResidualRiskFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ResidualRiskClient<runtime.Types.Result.GetResult<Prisma.$ResidualRiskPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ResidualRiskFindManyArgs>(args?: Prisma.SelectSubset<T, ResidualRiskFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ResidualRiskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ResidualRiskCreateArgs>(args: Prisma.SelectSubset<T, ResidualRiskCreateArgs<ExtArgs>>): Prisma.Prisma__ResidualRiskClient<runtime.Types.Result.GetResult<Prisma.$ResidualRiskPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ResidualRiskCreateManyArgs>(args?: Prisma.SelectSubset<T, ResidualRiskCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ResidualRiskCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ResidualRiskCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ResidualRiskPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ResidualRiskDeleteArgs>(args: Prisma.SelectSubset<T, ResidualRiskDeleteArgs<ExtArgs>>): Prisma.Prisma__ResidualRiskClient<runtime.Types.Result.GetResult<Prisma.$ResidualRiskPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ResidualRiskUpdateArgs>(args: Prisma.SelectSubset<T, ResidualRiskUpdateArgs<ExtArgs>>): Prisma.Prisma__ResidualRiskClient<runtime.Types.Result.GetResult<Prisma.$ResidualRiskPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ResidualRiskDeleteManyArgs>(args?: Prisma.SelectSubset<T, ResidualRiskDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ResidualRiskUpdateManyArgs>(args: Prisma.SelectSubset<T, ResidualRiskUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ResidualRiskUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ResidualRiskUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ResidualRiskPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ResidualRiskUpsertArgs>(args: Prisma.SelectSubset<T, ResidualRiskUpsertArgs<ExtArgs>>): Prisma.Prisma__ResidualRiskClient<runtime.Types.Result.GetResult<Prisma.$ResidualRiskPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ResidualRiskCountArgs>(args?: Prisma.Subset<T, ResidualRiskCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ResidualRiskCountAggregateOutputType> : number>;
    aggregate<T extends ResidualRiskAggregateArgs>(args: Prisma.Subset<T, ResidualRiskAggregateArgs>): Prisma.PrismaPromise<GetResidualRiskAggregateType<T>>;
    groupBy<T extends ResidualRiskGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ResidualRiskGroupByArgs['orderBy'];
    } : {
        orderBy?: ResidualRiskGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ResidualRiskGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetResidualRiskGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ResidualRiskFieldRefs;
}
export interface Prisma__ResidualRiskClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    clientRisk<T extends Prisma.ClientRiskDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientRiskDefaultArgs<ExtArgs>>): Prisma.Prisma__ClientRiskClient<runtime.Types.Result.GetResult<Prisma.$ClientRiskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    acceptedByUser<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ResidualRiskFieldRefs {
    readonly id: Prisma.FieldRef<"ResidualRisk", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ResidualRisk", 'String'>;
    readonly clientRiskId: Prisma.FieldRef<"ResidualRisk", 'String'>;
    readonly acceptedBy: Prisma.FieldRef<"ResidualRisk", 'String'>;
    readonly residualLevel: Prisma.FieldRef<"ResidualRisk", 'RiskLevel'>;
    readonly justification: Prisma.FieldRef<"ResidualRisk", 'String'>;
    readonly acceptedAt: Prisma.FieldRef<"ResidualRisk", 'DateTime'>;
}
export type ResidualRiskFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ResidualRiskSelect<ExtArgs> | null;
    omit?: Prisma.ResidualRiskOmit<ExtArgs> | null;
    include?: Prisma.ResidualRiskInclude<ExtArgs> | null;
    where: Prisma.ResidualRiskWhereUniqueInput;
};
export type ResidualRiskFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ResidualRiskSelect<ExtArgs> | null;
    omit?: Prisma.ResidualRiskOmit<ExtArgs> | null;
    include?: Prisma.ResidualRiskInclude<ExtArgs> | null;
    where: Prisma.ResidualRiskWhereUniqueInput;
};
export type ResidualRiskFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ResidualRiskSelect<ExtArgs> | null;
    omit?: Prisma.ResidualRiskOmit<ExtArgs> | null;
    include?: Prisma.ResidualRiskInclude<ExtArgs> | null;
    where?: Prisma.ResidualRiskWhereInput;
    orderBy?: Prisma.ResidualRiskOrderByWithRelationInput | Prisma.ResidualRiskOrderByWithRelationInput[];
    cursor?: Prisma.ResidualRiskWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ResidualRiskScalarFieldEnum | Prisma.ResidualRiskScalarFieldEnum[];
};
export type ResidualRiskFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ResidualRiskSelect<ExtArgs> | null;
    omit?: Prisma.ResidualRiskOmit<ExtArgs> | null;
    include?: Prisma.ResidualRiskInclude<ExtArgs> | null;
    where?: Prisma.ResidualRiskWhereInput;
    orderBy?: Prisma.ResidualRiskOrderByWithRelationInput | Prisma.ResidualRiskOrderByWithRelationInput[];
    cursor?: Prisma.ResidualRiskWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ResidualRiskScalarFieldEnum | Prisma.ResidualRiskScalarFieldEnum[];
};
export type ResidualRiskFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ResidualRiskSelect<ExtArgs> | null;
    omit?: Prisma.ResidualRiskOmit<ExtArgs> | null;
    include?: Prisma.ResidualRiskInclude<ExtArgs> | null;
    where?: Prisma.ResidualRiskWhereInput;
    orderBy?: Prisma.ResidualRiskOrderByWithRelationInput | Prisma.ResidualRiskOrderByWithRelationInput[];
    cursor?: Prisma.ResidualRiskWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ResidualRiskScalarFieldEnum | Prisma.ResidualRiskScalarFieldEnum[];
};
export type ResidualRiskCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ResidualRiskSelect<ExtArgs> | null;
    omit?: Prisma.ResidualRiskOmit<ExtArgs> | null;
    include?: Prisma.ResidualRiskInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ResidualRiskCreateInput, Prisma.ResidualRiskUncheckedCreateInput>;
};
export type ResidualRiskCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ResidualRiskCreateManyInput | Prisma.ResidualRiskCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ResidualRiskCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ResidualRiskSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ResidualRiskOmit<ExtArgs> | null;
    data: Prisma.ResidualRiskCreateManyInput | Prisma.ResidualRiskCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ResidualRiskIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ResidualRiskUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ResidualRiskSelect<ExtArgs> | null;
    omit?: Prisma.ResidualRiskOmit<ExtArgs> | null;
    include?: Prisma.ResidualRiskInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ResidualRiskUpdateInput, Prisma.ResidualRiskUncheckedUpdateInput>;
    where: Prisma.ResidualRiskWhereUniqueInput;
};
export type ResidualRiskUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ResidualRiskUpdateManyMutationInput, Prisma.ResidualRiskUncheckedUpdateManyInput>;
    where?: Prisma.ResidualRiskWhereInput;
    limit?: number;
};
export type ResidualRiskUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ResidualRiskSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ResidualRiskOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ResidualRiskUpdateManyMutationInput, Prisma.ResidualRiskUncheckedUpdateManyInput>;
    where?: Prisma.ResidualRiskWhereInput;
    limit?: number;
    include?: Prisma.ResidualRiskIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ResidualRiskUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ResidualRiskSelect<ExtArgs> | null;
    omit?: Prisma.ResidualRiskOmit<ExtArgs> | null;
    include?: Prisma.ResidualRiskInclude<ExtArgs> | null;
    where: Prisma.ResidualRiskWhereUniqueInput;
    create: Prisma.XOR<Prisma.ResidualRiskCreateInput, Prisma.ResidualRiskUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ResidualRiskUpdateInput, Prisma.ResidualRiskUncheckedUpdateInput>;
};
export type ResidualRiskDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ResidualRiskSelect<ExtArgs> | null;
    omit?: Prisma.ResidualRiskOmit<ExtArgs> | null;
    include?: Prisma.ResidualRiskInclude<ExtArgs> | null;
    where: Prisma.ResidualRiskWhereUniqueInput;
};
export type ResidualRiskDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ResidualRiskWhereInput;
    limit?: number;
};
export type ResidualRiskDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ResidualRiskSelect<ExtArgs> | null;
    omit?: Prisma.ResidualRiskOmit<ExtArgs> | null;
    include?: Prisma.ResidualRiskInclude<ExtArgs> | null;
};
export {};
