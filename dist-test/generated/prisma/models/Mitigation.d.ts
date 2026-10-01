import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type MitigationModel = runtime.Types.Result.DefaultSelection<Prisma.$MitigationPayload>;
export type AggregateMitigation = {
    _count: MitigationCountAggregateOutputType | null;
    _avg: MitigationAvgAggregateOutputType | null;
    _sum: MitigationSumAggregateOutputType | null;
    _min: MitigationMinAggregateOutputType | null;
    _max: MitigationMaxAggregateOutputType | null;
};
export type MitigationAvgAggregateOutputType = {
    responsePercentage: runtime.Decimal | null;
};
export type MitigationSumAggregateOutputType = {
    responsePercentage: runtime.Decimal | null;
};
export type MitigationMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientCauseId: string | null;
    clientRiskId: string | null;
    responsePercentage: runtime.Decimal | null;
    calculatedAt: Date | null;
};
export type MitigationMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientCauseId: string | null;
    clientRiskId: string | null;
    responsePercentage: runtime.Decimal | null;
    calculatedAt: Date | null;
};
export type MitigationCountAggregateOutputType = {
    id: number;
    tenantId: number;
    clientCauseId: number;
    clientRiskId: number;
    responsePercentage: number;
    calculatedAt: number;
    _all: number;
};
export type MitigationAvgAggregateInputType = {
    responsePercentage?: true;
};
export type MitigationSumAggregateInputType = {
    responsePercentage?: true;
};
export type MitigationMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientCauseId?: true;
    clientRiskId?: true;
    responsePercentage?: true;
    calculatedAt?: true;
};
export type MitigationMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientCauseId?: true;
    clientRiskId?: true;
    responsePercentage?: true;
    calculatedAt?: true;
};
export type MitigationCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientCauseId?: true;
    clientRiskId?: true;
    responsePercentage?: true;
    calculatedAt?: true;
    _all?: true;
};
export type MitigationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MitigationWhereInput;
    orderBy?: Prisma.MitigationOrderByWithRelationInput | Prisma.MitigationOrderByWithRelationInput[];
    cursor?: Prisma.MitigationWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | MitigationCountAggregateInputType;
    _avg?: MitigationAvgAggregateInputType;
    _sum?: MitigationSumAggregateInputType;
    _min?: MitigationMinAggregateInputType;
    _max?: MitigationMaxAggregateInputType;
};
export type GetMitigationAggregateType<T extends MitigationAggregateArgs> = {
    [P in keyof T & keyof AggregateMitigation]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMitigation[P]> : Prisma.GetScalarType<T[P], AggregateMitigation[P]>;
};
export type MitigationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MitigationWhereInput;
    orderBy?: Prisma.MitigationOrderByWithAggregationInput | Prisma.MitigationOrderByWithAggregationInput[];
    by: Prisma.MitigationScalarFieldEnum[] | Prisma.MitigationScalarFieldEnum;
    having?: Prisma.MitigationScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MitigationCountAggregateInputType | true;
    _avg?: MitigationAvgAggregateInputType;
    _sum?: MitigationSumAggregateInputType;
    _min?: MitigationMinAggregateInputType;
    _max?: MitigationMaxAggregateInputType;
};
export type MitigationGroupByOutputType = {
    id: string;
    tenantId: string;
    clientCauseId: string | null;
    clientRiskId: string | null;
    responsePercentage: runtime.Decimal;
    calculatedAt: Date;
    _count: MitigationCountAggregateOutputType | null;
    _avg: MitigationAvgAggregateOutputType | null;
    _sum: MitigationSumAggregateOutputType | null;
    _min: MitigationMinAggregateOutputType | null;
    _max: MitigationMaxAggregateOutputType | null;
};
type GetMitigationGroupByPayload<T extends MitigationGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MitigationGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MitigationGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MitigationGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MitigationGroupByOutputType[P]>;
}>>;
export type MitigationWhereInput = {
    AND?: Prisma.MitigationWhereInput | Prisma.MitigationWhereInput[];
    OR?: Prisma.MitigationWhereInput[];
    NOT?: Prisma.MitigationWhereInput | Prisma.MitigationWhereInput[];
    id?: Prisma.UuidFilter<"Mitigation"> | string;
    tenantId?: Prisma.UuidFilter<"Mitigation"> | string;
    clientCauseId?: Prisma.UuidNullableFilter<"Mitigation"> | string | null;
    clientRiskId?: Prisma.UuidNullableFilter<"Mitigation"> | string | null;
    responsePercentage?: Prisma.DecimalFilter<"Mitigation"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFilter<"Mitigation"> | Date | string;
    clientCause?: Prisma.XOR<Prisma.ClientCauseNullableScalarRelationFilter, Prisma.ClientCauseWhereInput> | null;
    clientRisk?: Prisma.XOR<Prisma.ClientRiskNullableScalarRelationFilter, Prisma.ClientRiskWhereInput> | null;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type MitigationOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrderInput | Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrderInput | Prisma.SortOrder;
    responsePercentage?: Prisma.SortOrder;
    calculatedAt?: Prisma.SortOrder;
    clientCause?: Prisma.ClientCauseOrderByWithRelationInput;
    clientRisk?: Prisma.ClientRiskOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type MitigationWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.MitigationWhereInput | Prisma.MitigationWhereInput[];
    OR?: Prisma.MitigationWhereInput[];
    NOT?: Prisma.MitigationWhereInput | Prisma.MitigationWhereInput[];
    tenantId?: Prisma.UuidFilter<"Mitigation"> | string;
    clientCauseId?: Prisma.UuidNullableFilter<"Mitigation"> | string | null;
    clientRiskId?: Prisma.UuidNullableFilter<"Mitigation"> | string | null;
    responsePercentage?: Prisma.DecimalFilter<"Mitigation"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFilter<"Mitigation"> | Date | string;
    clientCause?: Prisma.XOR<Prisma.ClientCauseNullableScalarRelationFilter, Prisma.ClientCauseWhereInput> | null;
    clientRisk?: Prisma.XOR<Prisma.ClientRiskNullableScalarRelationFilter, Prisma.ClientRiskWhereInput> | null;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id">;
export type MitigationOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrderInput | Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrderInput | Prisma.SortOrder;
    responsePercentage?: Prisma.SortOrder;
    calculatedAt?: Prisma.SortOrder;
    _count?: Prisma.MitigationCountOrderByAggregateInput;
    _avg?: Prisma.MitigationAvgOrderByAggregateInput;
    _max?: Prisma.MitigationMaxOrderByAggregateInput;
    _min?: Prisma.MitigationMinOrderByAggregateInput;
    _sum?: Prisma.MitigationSumOrderByAggregateInput;
};
export type MitigationScalarWhereWithAggregatesInput = {
    AND?: Prisma.MitigationScalarWhereWithAggregatesInput | Prisma.MitigationScalarWhereWithAggregatesInput[];
    OR?: Prisma.MitigationScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MitigationScalarWhereWithAggregatesInput | Prisma.MitigationScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Mitigation"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"Mitigation"> | string;
    clientCauseId?: Prisma.UuidNullableWithAggregatesFilter<"Mitigation"> | string | null;
    clientRiskId?: Prisma.UuidNullableWithAggregatesFilter<"Mitigation"> | string | null;
    responsePercentage?: Prisma.DecimalWithAggregatesFilter<"Mitigation"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeWithAggregatesFilter<"Mitigation"> | Date | string;
};
export type MitigationCreateInput = {
    id?: string;
    responsePercentage: runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt: Date | string;
    clientCause?: Prisma.ClientCauseCreateNestedOneWithoutMitigationsInput;
    clientRisk?: Prisma.ClientRiskCreateNestedOneWithoutMitigationsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutMitigationsInput;
};
export type MitigationUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    clientCauseId?: string | null;
    clientRiskId?: string | null;
    responsePercentage: runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt: Date | string;
};
export type MitigationUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    responsePercentage?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientCause?: Prisma.ClientCauseUpdateOneWithoutMitigationsNestedInput;
    clientRisk?: Prisma.ClientRiskUpdateOneWithoutMitigationsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutMitigationsNestedInput;
};
export type MitigationUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    clientRiskId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsePercentage?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MitigationCreateManyInput = {
    id?: string;
    tenantId: string;
    clientCauseId?: string | null;
    clientRiskId?: string | null;
    responsePercentage: runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt: Date | string;
};
export type MitigationUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    responsePercentage?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MitigationUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    clientRiskId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsePercentage?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MitigationListRelationFilter = {
    every?: Prisma.MitigationWhereInput;
    some?: Prisma.MitigationWhereInput;
    none?: Prisma.MitigationWhereInput;
};
export type MitigationOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type MitigationCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    responsePercentage?: Prisma.SortOrder;
    calculatedAt?: Prisma.SortOrder;
};
export type MitigationAvgOrderByAggregateInput = {
    responsePercentage?: Prisma.SortOrder;
};
export type MitigationMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    responsePercentage?: Prisma.SortOrder;
    calculatedAt?: Prisma.SortOrder;
};
export type MitigationMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    responsePercentage?: Prisma.SortOrder;
    calculatedAt?: Prisma.SortOrder;
};
export type MitigationSumOrderByAggregateInput = {
    responsePercentage?: Prisma.SortOrder;
};
export type MitigationCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.MitigationCreateWithoutTenantInput, Prisma.MitigationUncheckedCreateWithoutTenantInput> | Prisma.MitigationCreateWithoutTenantInput[] | Prisma.MitigationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.MitigationCreateOrConnectWithoutTenantInput | Prisma.MitigationCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.MitigationCreateManyTenantInputEnvelope;
    connect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
};
export type MitigationUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.MitigationCreateWithoutTenantInput, Prisma.MitigationUncheckedCreateWithoutTenantInput> | Prisma.MitigationCreateWithoutTenantInput[] | Prisma.MitigationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.MitigationCreateOrConnectWithoutTenantInput | Prisma.MitigationCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.MitigationCreateManyTenantInputEnvelope;
    connect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
};
export type MitigationUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.MitigationCreateWithoutTenantInput, Prisma.MitigationUncheckedCreateWithoutTenantInput> | Prisma.MitigationCreateWithoutTenantInput[] | Prisma.MitigationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.MitigationCreateOrConnectWithoutTenantInput | Prisma.MitigationCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.MitigationUpsertWithWhereUniqueWithoutTenantInput | Prisma.MitigationUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.MitigationCreateManyTenantInputEnvelope;
    set?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    disconnect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    delete?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    connect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    update?: Prisma.MitigationUpdateWithWhereUniqueWithoutTenantInput | Prisma.MitigationUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.MitigationUpdateManyWithWhereWithoutTenantInput | Prisma.MitigationUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.MitigationScalarWhereInput | Prisma.MitigationScalarWhereInput[];
};
export type MitigationUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.MitigationCreateWithoutTenantInput, Prisma.MitigationUncheckedCreateWithoutTenantInput> | Prisma.MitigationCreateWithoutTenantInput[] | Prisma.MitigationUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.MitigationCreateOrConnectWithoutTenantInput | Prisma.MitigationCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.MitigationUpsertWithWhereUniqueWithoutTenantInput | Prisma.MitigationUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.MitigationCreateManyTenantInputEnvelope;
    set?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    disconnect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    delete?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    connect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    update?: Prisma.MitigationUpdateWithWhereUniqueWithoutTenantInput | Prisma.MitigationUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.MitigationUpdateManyWithWhereWithoutTenantInput | Prisma.MitigationUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.MitigationScalarWhereInput | Prisma.MitigationScalarWhereInput[];
};
export type MitigationCreateNestedManyWithoutClientRiskInput = {
    create?: Prisma.XOR<Prisma.MitigationCreateWithoutClientRiskInput, Prisma.MitigationUncheckedCreateWithoutClientRiskInput> | Prisma.MitigationCreateWithoutClientRiskInput[] | Prisma.MitigationUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.MitigationCreateOrConnectWithoutClientRiskInput | Prisma.MitigationCreateOrConnectWithoutClientRiskInput[];
    createMany?: Prisma.MitigationCreateManyClientRiskInputEnvelope;
    connect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
};
export type MitigationUncheckedCreateNestedManyWithoutClientRiskInput = {
    create?: Prisma.XOR<Prisma.MitigationCreateWithoutClientRiskInput, Prisma.MitigationUncheckedCreateWithoutClientRiskInput> | Prisma.MitigationCreateWithoutClientRiskInput[] | Prisma.MitigationUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.MitigationCreateOrConnectWithoutClientRiskInput | Prisma.MitigationCreateOrConnectWithoutClientRiskInput[];
    createMany?: Prisma.MitigationCreateManyClientRiskInputEnvelope;
    connect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
};
export type MitigationUpdateManyWithoutClientRiskNestedInput = {
    create?: Prisma.XOR<Prisma.MitigationCreateWithoutClientRiskInput, Prisma.MitigationUncheckedCreateWithoutClientRiskInput> | Prisma.MitigationCreateWithoutClientRiskInput[] | Prisma.MitigationUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.MitigationCreateOrConnectWithoutClientRiskInput | Prisma.MitigationCreateOrConnectWithoutClientRiskInput[];
    upsert?: Prisma.MitigationUpsertWithWhereUniqueWithoutClientRiskInput | Prisma.MitigationUpsertWithWhereUniqueWithoutClientRiskInput[];
    createMany?: Prisma.MitigationCreateManyClientRiskInputEnvelope;
    set?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    disconnect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    delete?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    connect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    update?: Prisma.MitigationUpdateWithWhereUniqueWithoutClientRiskInput | Prisma.MitigationUpdateWithWhereUniqueWithoutClientRiskInput[];
    updateMany?: Prisma.MitigationUpdateManyWithWhereWithoutClientRiskInput | Prisma.MitigationUpdateManyWithWhereWithoutClientRiskInput[];
    deleteMany?: Prisma.MitigationScalarWhereInput | Prisma.MitigationScalarWhereInput[];
};
export type MitigationUncheckedUpdateManyWithoutClientRiskNestedInput = {
    create?: Prisma.XOR<Prisma.MitigationCreateWithoutClientRiskInput, Prisma.MitigationUncheckedCreateWithoutClientRiskInput> | Prisma.MitigationCreateWithoutClientRiskInput[] | Prisma.MitigationUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.MitigationCreateOrConnectWithoutClientRiskInput | Prisma.MitigationCreateOrConnectWithoutClientRiskInput[];
    upsert?: Prisma.MitigationUpsertWithWhereUniqueWithoutClientRiskInput | Prisma.MitigationUpsertWithWhereUniqueWithoutClientRiskInput[];
    createMany?: Prisma.MitigationCreateManyClientRiskInputEnvelope;
    set?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    disconnect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    delete?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    connect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    update?: Prisma.MitigationUpdateWithWhereUniqueWithoutClientRiskInput | Prisma.MitigationUpdateWithWhereUniqueWithoutClientRiskInput[];
    updateMany?: Prisma.MitigationUpdateManyWithWhereWithoutClientRiskInput | Prisma.MitigationUpdateManyWithWhereWithoutClientRiskInput[];
    deleteMany?: Prisma.MitigationScalarWhereInput | Prisma.MitigationScalarWhereInput[];
};
export type MitigationCreateNestedManyWithoutClientCauseInput = {
    create?: Prisma.XOR<Prisma.MitigationCreateWithoutClientCauseInput, Prisma.MitigationUncheckedCreateWithoutClientCauseInput> | Prisma.MitigationCreateWithoutClientCauseInput[] | Prisma.MitigationUncheckedCreateWithoutClientCauseInput[];
    connectOrCreate?: Prisma.MitigationCreateOrConnectWithoutClientCauseInput | Prisma.MitigationCreateOrConnectWithoutClientCauseInput[];
    createMany?: Prisma.MitigationCreateManyClientCauseInputEnvelope;
    connect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
};
export type MitigationUncheckedCreateNestedManyWithoutClientCauseInput = {
    create?: Prisma.XOR<Prisma.MitigationCreateWithoutClientCauseInput, Prisma.MitigationUncheckedCreateWithoutClientCauseInput> | Prisma.MitigationCreateWithoutClientCauseInput[] | Prisma.MitigationUncheckedCreateWithoutClientCauseInput[];
    connectOrCreate?: Prisma.MitigationCreateOrConnectWithoutClientCauseInput | Prisma.MitigationCreateOrConnectWithoutClientCauseInput[];
    createMany?: Prisma.MitigationCreateManyClientCauseInputEnvelope;
    connect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
};
export type MitigationUpdateManyWithoutClientCauseNestedInput = {
    create?: Prisma.XOR<Prisma.MitigationCreateWithoutClientCauseInput, Prisma.MitigationUncheckedCreateWithoutClientCauseInput> | Prisma.MitigationCreateWithoutClientCauseInput[] | Prisma.MitigationUncheckedCreateWithoutClientCauseInput[];
    connectOrCreate?: Prisma.MitigationCreateOrConnectWithoutClientCauseInput | Prisma.MitigationCreateOrConnectWithoutClientCauseInput[];
    upsert?: Prisma.MitigationUpsertWithWhereUniqueWithoutClientCauseInput | Prisma.MitigationUpsertWithWhereUniqueWithoutClientCauseInput[];
    createMany?: Prisma.MitigationCreateManyClientCauseInputEnvelope;
    set?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    disconnect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    delete?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    connect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    update?: Prisma.MitigationUpdateWithWhereUniqueWithoutClientCauseInput | Prisma.MitigationUpdateWithWhereUniqueWithoutClientCauseInput[];
    updateMany?: Prisma.MitigationUpdateManyWithWhereWithoutClientCauseInput | Prisma.MitigationUpdateManyWithWhereWithoutClientCauseInput[];
    deleteMany?: Prisma.MitigationScalarWhereInput | Prisma.MitigationScalarWhereInput[];
};
export type MitigationUncheckedUpdateManyWithoutClientCauseNestedInput = {
    create?: Prisma.XOR<Prisma.MitigationCreateWithoutClientCauseInput, Prisma.MitigationUncheckedCreateWithoutClientCauseInput> | Prisma.MitigationCreateWithoutClientCauseInput[] | Prisma.MitigationUncheckedCreateWithoutClientCauseInput[];
    connectOrCreate?: Prisma.MitigationCreateOrConnectWithoutClientCauseInput | Prisma.MitigationCreateOrConnectWithoutClientCauseInput[];
    upsert?: Prisma.MitigationUpsertWithWhereUniqueWithoutClientCauseInput | Prisma.MitigationUpsertWithWhereUniqueWithoutClientCauseInput[];
    createMany?: Prisma.MitigationCreateManyClientCauseInputEnvelope;
    set?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    disconnect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    delete?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    connect?: Prisma.MitigationWhereUniqueInput | Prisma.MitigationWhereUniqueInput[];
    update?: Prisma.MitigationUpdateWithWhereUniqueWithoutClientCauseInput | Prisma.MitigationUpdateWithWhereUniqueWithoutClientCauseInput[];
    updateMany?: Prisma.MitigationUpdateManyWithWhereWithoutClientCauseInput | Prisma.MitigationUpdateManyWithWhereWithoutClientCauseInput[];
    deleteMany?: Prisma.MitigationScalarWhereInput | Prisma.MitigationScalarWhereInput[];
};
export type MitigationCreateWithoutTenantInput = {
    id?: string;
    responsePercentage: runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt: Date | string;
    clientCause?: Prisma.ClientCauseCreateNestedOneWithoutMitigationsInput;
    clientRisk?: Prisma.ClientRiskCreateNestedOneWithoutMitigationsInput;
};
export type MitigationUncheckedCreateWithoutTenantInput = {
    id?: string;
    clientCauseId?: string | null;
    clientRiskId?: string | null;
    responsePercentage: runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt: Date | string;
};
export type MitigationCreateOrConnectWithoutTenantInput = {
    where: Prisma.MitigationWhereUniqueInput;
    create: Prisma.XOR<Prisma.MitigationCreateWithoutTenantInput, Prisma.MitigationUncheckedCreateWithoutTenantInput>;
};
export type MitigationCreateManyTenantInputEnvelope = {
    data: Prisma.MitigationCreateManyTenantInput | Prisma.MitigationCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type MitigationUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.MitigationWhereUniqueInput;
    update: Prisma.XOR<Prisma.MitigationUpdateWithoutTenantInput, Prisma.MitigationUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.MitigationCreateWithoutTenantInput, Prisma.MitigationUncheckedCreateWithoutTenantInput>;
};
export type MitigationUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.MitigationWhereUniqueInput;
    data: Prisma.XOR<Prisma.MitigationUpdateWithoutTenantInput, Prisma.MitigationUncheckedUpdateWithoutTenantInput>;
};
export type MitigationUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.MitigationScalarWhereInput;
    data: Prisma.XOR<Prisma.MitigationUpdateManyMutationInput, Prisma.MitigationUncheckedUpdateManyWithoutTenantInput>;
};
export type MitigationScalarWhereInput = {
    AND?: Prisma.MitigationScalarWhereInput | Prisma.MitigationScalarWhereInput[];
    OR?: Prisma.MitigationScalarWhereInput[];
    NOT?: Prisma.MitigationScalarWhereInput | Prisma.MitigationScalarWhereInput[];
    id?: Prisma.UuidFilter<"Mitigation"> | string;
    tenantId?: Prisma.UuidFilter<"Mitigation"> | string;
    clientCauseId?: Prisma.UuidNullableFilter<"Mitigation"> | string | null;
    clientRiskId?: Prisma.UuidNullableFilter<"Mitigation"> | string | null;
    responsePercentage?: Prisma.DecimalFilter<"Mitigation"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFilter<"Mitigation"> | Date | string;
};
export type MitigationCreateWithoutClientRiskInput = {
    id?: string;
    responsePercentage: runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt: Date | string;
    clientCause?: Prisma.ClientCauseCreateNestedOneWithoutMitigationsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutMitigationsInput;
};
export type MitigationUncheckedCreateWithoutClientRiskInput = {
    id?: string;
    tenantId: string;
    clientCauseId?: string | null;
    responsePercentage: runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt: Date | string;
};
export type MitigationCreateOrConnectWithoutClientRiskInput = {
    where: Prisma.MitigationWhereUniqueInput;
    create: Prisma.XOR<Prisma.MitigationCreateWithoutClientRiskInput, Prisma.MitigationUncheckedCreateWithoutClientRiskInput>;
};
export type MitigationCreateManyClientRiskInputEnvelope = {
    data: Prisma.MitigationCreateManyClientRiskInput | Prisma.MitigationCreateManyClientRiskInput[];
    skipDuplicates?: boolean;
};
export type MitigationUpsertWithWhereUniqueWithoutClientRiskInput = {
    where: Prisma.MitigationWhereUniqueInput;
    update: Prisma.XOR<Prisma.MitigationUpdateWithoutClientRiskInput, Prisma.MitigationUncheckedUpdateWithoutClientRiskInput>;
    create: Prisma.XOR<Prisma.MitigationCreateWithoutClientRiskInput, Prisma.MitigationUncheckedCreateWithoutClientRiskInput>;
};
export type MitigationUpdateWithWhereUniqueWithoutClientRiskInput = {
    where: Prisma.MitigationWhereUniqueInput;
    data: Prisma.XOR<Prisma.MitigationUpdateWithoutClientRiskInput, Prisma.MitigationUncheckedUpdateWithoutClientRiskInput>;
};
export type MitigationUpdateManyWithWhereWithoutClientRiskInput = {
    where: Prisma.MitigationScalarWhereInput;
    data: Prisma.XOR<Prisma.MitigationUpdateManyMutationInput, Prisma.MitigationUncheckedUpdateManyWithoutClientRiskInput>;
};
export type MitigationCreateWithoutClientCauseInput = {
    id?: string;
    responsePercentage: runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt: Date | string;
    clientRisk?: Prisma.ClientRiskCreateNestedOneWithoutMitigationsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutMitigationsInput;
};
export type MitigationUncheckedCreateWithoutClientCauseInput = {
    id?: string;
    tenantId: string;
    clientRiskId?: string | null;
    responsePercentage: runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt: Date | string;
};
export type MitigationCreateOrConnectWithoutClientCauseInput = {
    where: Prisma.MitigationWhereUniqueInput;
    create: Prisma.XOR<Prisma.MitigationCreateWithoutClientCauseInput, Prisma.MitigationUncheckedCreateWithoutClientCauseInput>;
};
export type MitigationCreateManyClientCauseInputEnvelope = {
    data: Prisma.MitigationCreateManyClientCauseInput | Prisma.MitigationCreateManyClientCauseInput[];
    skipDuplicates?: boolean;
};
export type MitigationUpsertWithWhereUniqueWithoutClientCauseInput = {
    where: Prisma.MitigationWhereUniqueInput;
    update: Prisma.XOR<Prisma.MitigationUpdateWithoutClientCauseInput, Prisma.MitigationUncheckedUpdateWithoutClientCauseInput>;
    create: Prisma.XOR<Prisma.MitigationCreateWithoutClientCauseInput, Prisma.MitigationUncheckedCreateWithoutClientCauseInput>;
};
export type MitigationUpdateWithWhereUniqueWithoutClientCauseInput = {
    where: Prisma.MitigationWhereUniqueInput;
    data: Prisma.XOR<Prisma.MitigationUpdateWithoutClientCauseInput, Prisma.MitigationUncheckedUpdateWithoutClientCauseInput>;
};
export type MitigationUpdateManyWithWhereWithoutClientCauseInput = {
    where: Prisma.MitigationScalarWhereInput;
    data: Prisma.XOR<Prisma.MitigationUpdateManyMutationInput, Prisma.MitigationUncheckedUpdateManyWithoutClientCauseInput>;
};
export type MitigationCreateManyTenantInput = {
    id?: string;
    clientCauseId?: string | null;
    clientRiskId?: string | null;
    responsePercentage: runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt: Date | string;
};
export type MitigationUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    responsePercentage?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientCause?: Prisma.ClientCauseUpdateOneWithoutMitigationsNestedInput;
    clientRisk?: Prisma.ClientRiskUpdateOneWithoutMitigationsNestedInput;
};
export type MitigationUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    clientRiskId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsePercentage?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MitigationUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    clientRiskId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsePercentage?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MitigationCreateManyClientRiskInput = {
    id?: string;
    tenantId: string;
    clientCauseId?: string | null;
    responsePercentage: runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt: Date | string;
};
export type MitigationUpdateWithoutClientRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    responsePercentage?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientCause?: Prisma.ClientCauseUpdateOneWithoutMitigationsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutMitigationsNestedInput;
};
export type MitigationUncheckedUpdateWithoutClientRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsePercentage?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MitigationUncheckedUpdateManyWithoutClientRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsePercentage?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MitigationCreateManyClientCauseInput = {
    id?: string;
    tenantId: string;
    clientRiskId?: string | null;
    responsePercentage: runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt: Date | string;
};
export type MitigationUpdateWithoutClientCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    responsePercentage?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    clientRisk?: Prisma.ClientRiskUpdateOneWithoutMitigationsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutMitigationsNestedInput;
};
export type MitigationUncheckedUpdateWithoutClientCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsePercentage?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MitigationUncheckedUpdateManyWithoutClientCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsePercentage?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    calculatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MitigationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientCauseId?: boolean;
    clientRiskId?: boolean;
    responsePercentage?: boolean;
    calculatedAt?: boolean;
    clientCause?: boolean | Prisma.Mitigation$clientCauseArgs<ExtArgs>;
    clientRisk?: boolean | Prisma.Mitigation$clientRiskArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["mitigation"]>;
export type MitigationSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientCauseId?: boolean;
    clientRiskId?: boolean;
    responsePercentage?: boolean;
    calculatedAt?: boolean;
    clientCause?: boolean | Prisma.Mitigation$clientCauseArgs<ExtArgs>;
    clientRisk?: boolean | Prisma.Mitigation$clientRiskArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["mitigation"]>;
export type MitigationSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientCauseId?: boolean;
    clientRiskId?: boolean;
    responsePercentage?: boolean;
    calculatedAt?: boolean;
    clientCause?: boolean | Prisma.Mitigation$clientCauseArgs<ExtArgs>;
    clientRisk?: boolean | Prisma.Mitigation$clientRiskArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["mitigation"]>;
export type MitigationSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    clientCauseId?: boolean;
    clientRiskId?: boolean;
    responsePercentage?: boolean;
    calculatedAt?: boolean;
};
export type MitigationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "clientCauseId" | "clientRiskId" | "responsePercentage" | "calculatedAt", ExtArgs["result"]["mitigation"]>;
export type MitigationInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientCause?: boolean | Prisma.Mitigation$clientCauseArgs<ExtArgs>;
    clientRisk?: boolean | Prisma.Mitigation$clientRiskArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type MitigationIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientCause?: boolean | Prisma.Mitigation$clientCauseArgs<ExtArgs>;
    clientRisk?: boolean | Prisma.Mitigation$clientRiskArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type MitigationIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientCause?: boolean | Prisma.Mitigation$clientCauseArgs<ExtArgs>;
    clientRisk?: boolean | Prisma.Mitigation$clientRiskArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $MitigationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Mitigation";
    objects: {
        clientCause: Prisma.$ClientCausePayload<ExtArgs> | null;
        clientRisk: Prisma.$ClientRiskPayload<ExtArgs> | null;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        clientCauseId: string | null;
        clientRiskId: string | null;
        responsePercentage: runtime.Decimal;
        calculatedAt: Date;
    }, ExtArgs["result"]["mitigation"]>;
    composites: {};
};
export type MitigationGetPayload<S extends boolean | null | undefined | MitigationDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MitigationPayload, S>;
export type MitigationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MitigationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MitigationCountAggregateInputType | true;
};
export interface MitigationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Mitigation'];
        meta: {
            name: 'Mitigation';
        };
    };
    findUnique<T extends MitigationFindUniqueArgs>(args: Prisma.SelectSubset<T, MitigationFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MitigationClient<runtime.Types.Result.GetResult<Prisma.$MitigationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends MitigationFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MitigationFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MitigationClient<runtime.Types.Result.GetResult<Prisma.$MitigationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends MitigationFindFirstArgs>(args?: Prisma.SelectSubset<T, MitigationFindFirstArgs<ExtArgs>>): Prisma.Prisma__MitigationClient<runtime.Types.Result.GetResult<Prisma.$MitigationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends MitigationFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MitigationFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MitigationClient<runtime.Types.Result.GetResult<Prisma.$MitigationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends MitigationFindManyArgs>(args?: Prisma.SelectSubset<T, MitigationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MitigationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends MitigationCreateArgs>(args: Prisma.SelectSubset<T, MitigationCreateArgs<ExtArgs>>): Prisma.Prisma__MitigationClient<runtime.Types.Result.GetResult<Prisma.$MitigationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends MitigationCreateManyArgs>(args?: Prisma.SelectSubset<T, MitigationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends MitigationCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MitigationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MitigationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends MitigationDeleteArgs>(args: Prisma.SelectSubset<T, MitigationDeleteArgs<ExtArgs>>): Prisma.Prisma__MitigationClient<runtime.Types.Result.GetResult<Prisma.$MitigationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends MitigationUpdateArgs>(args: Prisma.SelectSubset<T, MitigationUpdateArgs<ExtArgs>>): Prisma.Prisma__MitigationClient<runtime.Types.Result.GetResult<Prisma.$MitigationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends MitigationDeleteManyArgs>(args?: Prisma.SelectSubset<T, MitigationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends MitigationUpdateManyArgs>(args: Prisma.SelectSubset<T, MitigationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends MitigationUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MitigationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MitigationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends MitigationUpsertArgs>(args: Prisma.SelectSubset<T, MitigationUpsertArgs<ExtArgs>>): Prisma.Prisma__MitigationClient<runtime.Types.Result.GetResult<Prisma.$MitigationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends MitigationCountArgs>(args?: Prisma.Subset<T, MitigationCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MitigationCountAggregateOutputType> : number>;
    aggregate<T extends MitigationAggregateArgs>(args: Prisma.Subset<T, MitigationAggregateArgs>): Prisma.PrismaPromise<GetMitigationAggregateType<T>>;
    groupBy<T extends MitigationGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MitigationGroupByArgs['orderBy'];
    } : {
        orderBy?: MitigationGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MitigationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMitigationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: MitigationFieldRefs;
}
export interface Prisma__MitigationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    clientCause<T extends Prisma.Mitigation$clientCauseArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Mitigation$clientCauseArgs<ExtArgs>>): Prisma.Prisma__ClientCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    clientRisk<T extends Prisma.Mitigation$clientRiskArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Mitigation$clientRiskArgs<ExtArgs>>): Prisma.Prisma__ClientRiskClient<runtime.Types.Result.GetResult<Prisma.$ClientRiskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface MitigationFieldRefs {
    readonly id: Prisma.FieldRef<"Mitigation", 'String'>;
    readonly tenantId: Prisma.FieldRef<"Mitigation", 'String'>;
    readonly clientCauseId: Prisma.FieldRef<"Mitigation", 'String'>;
    readonly clientRiskId: Prisma.FieldRef<"Mitigation", 'String'>;
    readonly responsePercentage: Prisma.FieldRef<"Mitigation", 'Decimal'>;
    readonly calculatedAt: Prisma.FieldRef<"Mitigation", 'DateTime'>;
}
export type MitigationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MitigationSelect<ExtArgs> | null;
    omit?: Prisma.MitigationOmit<ExtArgs> | null;
    include?: Prisma.MitigationInclude<ExtArgs> | null;
    where: Prisma.MitigationWhereUniqueInput;
};
export type MitigationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MitigationSelect<ExtArgs> | null;
    omit?: Prisma.MitigationOmit<ExtArgs> | null;
    include?: Prisma.MitigationInclude<ExtArgs> | null;
    where: Prisma.MitigationWhereUniqueInput;
};
export type MitigationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MitigationSelect<ExtArgs> | null;
    omit?: Prisma.MitigationOmit<ExtArgs> | null;
    include?: Prisma.MitigationInclude<ExtArgs> | null;
    where?: Prisma.MitigationWhereInput;
    orderBy?: Prisma.MitigationOrderByWithRelationInput | Prisma.MitigationOrderByWithRelationInput[];
    cursor?: Prisma.MitigationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MitigationScalarFieldEnum | Prisma.MitigationScalarFieldEnum[];
};
export type MitigationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MitigationSelect<ExtArgs> | null;
    omit?: Prisma.MitigationOmit<ExtArgs> | null;
    include?: Prisma.MitigationInclude<ExtArgs> | null;
    where?: Prisma.MitigationWhereInput;
    orderBy?: Prisma.MitigationOrderByWithRelationInput | Prisma.MitigationOrderByWithRelationInput[];
    cursor?: Prisma.MitigationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MitigationScalarFieldEnum | Prisma.MitigationScalarFieldEnum[];
};
export type MitigationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MitigationSelect<ExtArgs> | null;
    omit?: Prisma.MitigationOmit<ExtArgs> | null;
    include?: Prisma.MitigationInclude<ExtArgs> | null;
    where?: Prisma.MitigationWhereInput;
    orderBy?: Prisma.MitigationOrderByWithRelationInput | Prisma.MitigationOrderByWithRelationInput[];
    cursor?: Prisma.MitigationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MitigationScalarFieldEnum | Prisma.MitigationScalarFieldEnum[];
};
export type MitigationCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MitigationSelect<ExtArgs> | null;
    omit?: Prisma.MitigationOmit<ExtArgs> | null;
    include?: Prisma.MitigationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MitigationCreateInput, Prisma.MitigationUncheckedCreateInput>;
};
export type MitigationCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.MitigationCreateManyInput | Prisma.MitigationCreateManyInput[];
    skipDuplicates?: boolean;
};
export type MitigationCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MitigationSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MitigationOmit<ExtArgs> | null;
    data: Prisma.MitigationCreateManyInput | Prisma.MitigationCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.MitigationIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type MitigationUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MitigationSelect<ExtArgs> | null;
    omit?: Prisma.MitigationOmit<ExtArgs> | null;
    include?: Prisma.MitigationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MitigationUpdateInput, Prisma.MitigationUncheckedUpdateInput>;
    where: Prisma.MitigationWhereUniqueInput;
};
export type MitigationUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.MitigationUpdateManyMutationInput, Prisma.MitigationUncheckedUpdateManyInput>;
    where?: Prisma.MitigationWhereInput;
    limit?: number;
};
export type MitigationUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MitigationSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MitigationOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MitigationUpdateManyMutationInput, Prisma.MitigationUncheckedUpdateManyInput>;
    where?: Prisma.MitigationWhereInput;
    limit?: number;
    include?: Prisma.MitigationIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type MitigationUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MitigationSelect<ExtArgs> | null;
    omit?: Prisma.MitigationOmit<ExtArgs> | null;
    include?: Prisma.MitigationInclude<ExtArgs> | null;
    where: Prisma.MitigationWhereUniqueInput;
    create: Prisma.XOR<Prisma.MitigationCreateInput, Prisma.MitigationUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.MitigationUpdateInput, Prisma.MitigationUncheckedUpdateInput>;
};
export type MitigationDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MitigationSelect<ExtArgs> | null;
    omit?: Prisma.MitigationOmit<ExtArgs> | null;
    include?: Prisma.MitigationInclude<ExtArgs> | null;
    where: Prisma.MitigationWhereUniqueInput;
};
export type MitigationDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MitigationWhereInput;
    limit?: number;
};
export type Mitigation$clientCauseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseInclude<ExtArgs> | null;
    where?: Prisma.ClientCauseWhereInput;
};
export type Mitigation$clientRiskArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientRiskSelect<ExtArgs> | null;
    omit?: Prisma.ClientRiskOmit<ExtArgs> | null;
    include?: Prisma.ClientRiskInclude<ExtArgs> | null;
    where?: Prisma.ClientRiskWhereInput;
};
export type MitigationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MitigationSelect<ExtArgs> | null;
    omit?: Prisma.MitigationOmit<ExtArgs> | null;
    include?: Prisma.MitigationInclude<ExtArgs> | null;
};
export {};
