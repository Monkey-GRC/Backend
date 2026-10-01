import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ClientCauseModel = runtime.Types.Result.DefaultSelection<Prisma.$ClientCausePayload>;
export type AggregateClientCause = {
    _count: ClientCauseCountAggregateOutputType | null;
    _min: ClientCauseMinAggregateOutputType | null;
    _max: ClientCauseMaxAggregateOutputType | null;
};
export type ClientCauseMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    serviceId: string | null;
    causeId: string | null;
    code: string | null;
    name: string | null;
    failureCategory: $Enums.FailureCategory | null;
    description: string | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ClientCauseMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    serviceId: string | null;
    causeId: string | null;
    code: string | null;
    name: string | null;
    failureCategory: $Enums.FailureCategory | null;
    description: string | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ClientCauseCountAggregateOutputType = {
    id: number;
    tenantId: number;
    serviceId: number;
    causeId: number;
    code: number;
    name: number;
    failureCategory: number;
    description: number;
    isActive: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ClientCauseMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    causeId?: true;
    code?: true;
    name?: true;
    failureCategory?: true;
    description?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ClientCauseMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    causeId?: true;
    code?: true;
    name?: true;
    failureCategory?: true;
    description?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ClientCauseCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    serviceId?: true;
    causeId?: true;
    code?: true;
    name?: true;
    failureCategory?: true;
    description?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ClientCauseAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientCauseWhereInput;
    orderBy?: Prisma.ClientCauseOrderByWithRelationInput | Prisma.ClientCauseOrderByWithRelationInput[];
    cursor?: Prisma.ClientCauseWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ClientCauseCountAggregateInputType;
    _min?: ClientCauseMinAggregateInputType;
    _max?: ClientCauseMaxAggregateInputType;
};
export type GetClientCauseAggregateType<T extends ClientCauseAggregateArgs> = {
    [P in keyof T & keyof AggregateClientCause]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateClientCause[P]> : Prisma.GetScalarType<T[P], AggregateClientCause[P]>;
};
export type ClientCauseGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientCauseWhereInput;
    orderBy?: Prisma.ClientCauseOrderByWithAggregationInput | Prisma.ClientCauseOrderByWithAggregationInput[];
    by: Prisma.ClientCauseScalarFieldEnum[] | Prisma.ClientCauseScalarFieldEnum;
    having?: Prisma.ClientCauseScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClientCauseCountAggregateInputType | true;
    _min?: ClientCauseMinAggregateInputType;
    _max?: ClientCauseMaxAggregateInputType;
};
export type ClientCauseGroupByOutputType = {
    id: string;
    tenantId: string;
    serviceId: string;
    causeId: string | null;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: ClientCauseCountAggregateOutputType | null;
    _min: ClientCauseMinAggregateOutputType | null;
    _max: ClientCauseMaxAggregateOutputType | null;
};
type GetClientCauseGroupByPayload<T extends ClientCauseGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ClientCauseGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ClientCauseGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ClientCauseGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ClientCauseGroupByOutputType[P]>;
}>>;
export type ClientCauseWhereInput = {
    AND?: Prisma.ClientCauseWhereInput | Prisma.ClientCauseWhereInput[];
    OR?: Prisma.ClientCauseWhereInput[];
    NOT?: Prisma.ClientCauseWhereInput | Prisma.ClientCauseWhereInput[];
    id?: Prisma.UuidFilter<"ClientCause"> | string;
    tenantId?: Prisma.UuidFilter<"ClientCause"> | string;
    serviceId?: Prisma.UuidFilter<"ClientCause"> | string;
    causeId?: Prisma.UuidNullableFilter<"ClientCause"> | string | null;
    code?: Prisma.StringFilter<"ClientCause"> | string;
    name?: Prisma.StringFilter<"ClientCause"> | string;
    failureCategory?: Prisma.EnumFailureCategoryFilter<"ClientCause"> | $Enums.FailureCategory;
    description?: Prisma.StringFilter<"ClientCause"> | string;
    isActive?: Prisma.BoolFilter<"ClientCause"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"ClientCause"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ClientCause"> | Date | string;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    cause?: Prisma.XOR<Prisma.CauseNullableScalarRelationFilter, Prisma.CauseWhereInput> | null;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    riskCauses?: Prisma.ClientRiskCauseListRelationFilter;
    causeControls?: Prisma.ClientCauseControlListRelationFilter;
    mitigations?: Prisma.MitigationListRelationFilter;
};
export type ClientCauseOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    causeId?: Prisma.SortOrderInput | Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    failureCategory?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    service?: Prisma.ServiceOrderByWithRelationInput;
    cause?: Prisma.CauseOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
    riskCauses?: Prisma.ClientRiskCauseOrderByRelationAggregateInput;
    causeControls?: Prisma.ClientCauseControlOrderByRelationAggregateInput;
    mitigations?: Prisma.MitigationOrderByRelationAggregateInput;
};
export type ClientCauseWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    serviceId_code?: Prisma.ClientCauseServiceIdCodeCompoundUniqueInput;
    serviceId_causeId?: Prisma.ClientCauseServiceIdCauseIdCompoundUniqueInput;
    AND?: Prisma.ClientCauseWhereInput | Prisma.ClientCauseWhereInput[];
    OR?: Prisma.ClientCauseWhereInput[];
    NOT?: Prisma.ClientCauseWhereInput | Prisma.ClientCauseWhereInput[];
    tenantId?: Prisma.UuidFilter<"ClientCause"> | string;
    serviceId?: Prisma.UuidFilter<"ClientCause"> | string;
    causeId?: Prisma.UuidNullableFilter<"ClientCause"> | string | null;
    code?: Prisma.StringFilter<"ClientCause"> | string;
    name?: Prisma.StringFilter<"ClientCause"> | string;
    failureCategory?: Prisma.EnumFailureCategoryFilter<"ClientCause"> | $Enums.FailureCategory;
    description?: Prisma.StringFilter<"ClientCause"> | string;
    isActive?: Prisma.BoolFilter<"ClientCause"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"ClientCause"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ClientCause"> | Date | string;
    service?: Prisma.XOR<Prisma.ServiceScalarRelationFilter, Prisma.ServiceWhereInput>;
    cause?: Prisma.XOR<Prisma.CauseNullableScalarRelationFilter, Prisma.CauseWhereInput> | null;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    riskCauses?: Prisma.ClientRiskCauseListRelationFilter;
    causeControls?: Prisma.ClientCauseControlListRelationFilter;
    mitigations?: Prisma.MitigationListRelationFilter;
}, "id" | "serviceId_code" | "serviceId_causeId">;
export type ClientCauseOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    causeId?: Prisma.SortOrderInput | Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    failureCategory?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ClientCauseCountOrderByAggregateInput;
    _max?: Prisma.ClientCauseMaxOrderByAggregateInput;
    _min?: Prisma.ClientCauseMinOrderByAggregateInput;
};
export type ClientCauseScalarWhereWithAggregatesInput = {
    AND?: Prisma.ClientCauseScalarWhereWithAggregatesInput | Prisma.ClientCauseScalarWhereWithAggregatesInput[];
    OR?: Prisma.ClientCauseScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ClientCauseScalarWhereWithAggregatesInput | Prisma.ClientCauseScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ClientCause"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ClientCause"> | string;
    serviceId?: Prisma.UuidWithAggregatesFilter<"ClientCause"> | string;
    causeId?: Prisma.UuidNullableWithAggregatesFilter<"ClientCause"> | string | null;
    code?: Prisma.StringWithAggregatesFilter<"ClientCause"> | string;
    name?: Prisma.StringWithAggregatesFilter<"ClientCause"> | string;
    failureCategory?: Prisma.EnumFailureCategoryWithAggregatesFilter<"ClientCause"> | $Enums.FailureCategory;
    description?: Prisma.StringWithAggregatesFilter<"ClientCause"> | string;
    isActive?: Prisma.BoolWithAggregatesFilter<"ClientCause"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ClientCause"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ClientCause"> | Date | string;
};
export type ClientCauseCreateInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    service: Prisma.ServiceCreateNestedOneWithoutClientCausesInput;
    cause?: Prisma.CauseCreateNestedOneWithoutClientCausesInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientCausesInput;
    riskCauses?: Prisma.ClientRiskCauseCreateNestedManyWithoutClientCauseInput;
    causeControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientCauseInput;
    mitigations?: Prisma.MitigationCreateNestedManyWithoutClientCauseInput;
};
export type ClientCauseUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    causeId?: string | null;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    riskCauses?: Prisma.ClientRiskCauseUncheckedCreateNestedManyWithoutClientCauseInput;
    causeControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientCauseInput;
    mitigations?: Prisma.MitigationUncheckedCreateNestedManyWithoutClientCauseInput;
};
export type ClientCauseUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientCausesNestedInput;
    cause?: Prisma.CauseUpdateOneWithoutClientCausesNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientCausesNestedInput;
    riskCauses?: Prisma.ClientRiskCauseUpdateManyWithoutClientCauseNestedInput;
    causeControls?: Prisma.ClientCauseControlUpdateManyWithoutClientCauseNestedInput;
    mitigations?: Prisma.MitigationUpdateManyWithoutClientCauseNestedInput;
};
export type ClientCauseUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    riskCauses?: Prisma.ClientRiskCauseUncheckedUpdateManyWithoutClientCauseNestedInput;
    causeControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientCauseNestedInput;
    mitigations?: Prisma.MitigationUncheckedUpdateManyWithoutClientCauseNestedInput;
};
export type ClientCauseCreateManyInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    causeId?: string | null;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClientCauseUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClientCauseUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClientCauseListRelationFilter = {
    every?: Prisma.ClientCauseWhereInput;
    some?: Prisma.ClientCauseWhereInput;
    none?: Prisma.ClientCauseWhereInput;
};
export type ClientCauseOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ClientCauseNullableScalarRelationFilter = {
    is?: Prisma.ClientCauseWhereInput | null;
    isNot?: Prisma.ClientCauseWhereInput | null;
};
export type ClientCauseServiceIdCodeCompoundUniqueInput = {
    serviceId: string;
    code: string;
};
export type ClientCauseServiceIdCauseIdCompoundUniqueInput = {
    serviceId: string;
    causeId: string;
};
export type ClientCauseCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    causeId?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    failureCategory?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClientCauseMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    causeId?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    failureCategory?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClientCauseMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    serviceId?: Prisma.SortOrder;
    causeId?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    failureCategory?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClientCauseScalarRelationFilter = {
    is?: Prisma.ClientCauseWhereInput;
    isNot?: Prisma.ClientCauseWhereInput;
};
export type ClientCauseCreateNestedManyWithoutCauseInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutCauseInput, Prisma.ClientCauseUncheckedCreateWithoutCauseInput> | Prisma.ClientCauseCreateWithoutCauseInput[] | Prisma.ClientCauseUncheckedCreateWithoutCauseInput[];
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutCauseInput | Prisma.ClientCauseCreateOrConnectWithoutCauseInput[];
    createMany?: Prisma.ClientCauseCreateManyCauseInputEnvelope;
    connect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
};
export type ClientCauseUncheckedCreateNestedManyWithoutCauseInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutCauseInput, Prisma.ClientCauseUncheckedCreateWithoutCauseInput> | Prisma.ClientCauseCreateWithoutCauseInput[] | Prisma.ClientCauseUncheckedCreateWithoutCauseInput[];
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutCauseInput | Prisma.ClientCauseCreateOrConnectWithoutCauseInput[];
    createMany?: Prisma.ClientCauseCreateManyCauseInputEnvelope;
    connect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
};
export type ClientCauseUpdateManyWithoutCauseNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutCauseInput, Prisma.ClientCauseUncheckedCreateWithoutCauseInput> | Prisma.ClientCauseCreateWithoutCauseInput[] | Prisma.ClientCauseUncheckedCreateWithoutCauseInput[];
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutCauseInput | Prisma.ClientCauseCreateOrConnectWithoutCauseInput[];
    upsert?: Prisma.ClientCauseUpsertWithWhereUniqueWithoutCauseInput | Prisma.ClientCauseUpsertWithWhereUniqueWithoutCauseInput[];
    createMany?: Prisma.ClientCauseCreateManyCauseInputEnvelope;
    set?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    disconnect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    delete?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    connect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    update?: Prisma.ClientCauseUpdateWithWhereUniqueWithoutCauseInput | Prisma.ClientCauseUpdateWithWhereUniqueWithoutCauseInput[];
    updateMany?: Prisma.ClientCauseUpdateManyWithWhereWithoutCauseInput | Prisma.ClientCauseUpdateManyWithWhereWithoutCauseInput[];
    deleteMany?: Prisma.ClientCauseScalarWhereInput | Prisma.ClientCauseScalarWhereInput[];
};
export type ClientCauseUncheckedUpdateManyWithoutCauseNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutCauseInput, Prisma.ClientCauseUncheckedCreateWithoutCauseInput> | Prisma.ClientCauseCreateWithoutCauseInput[] | Prisma.ClientCauseUncheckedCreateWithoutCauseInput[];
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutCauseInput | Prisma.ClientCauseCreateOrConnectWithoutCauseInput[];
    upsert?: Prisma.ClientCauseUpsertWithWhereUniqueWithoutCauseInput | Prisma.ClientCauseUpsertWithWhereUniqueWithoutCauseInput[];
    createMany?: Prisma.ClientCauseCreateManyCauseInputEnvelope;
    set?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    disconnect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    delete?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    connect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    update?: Prisma.ClientCauseUpdateWithWhereUniqueWithoutCauseInput | Prisma.ClientCauseUpdateWithWhereUniqueWithoutCauseInput[];
    updateMany?: Prisma.ClientCauseUpdateManyWithWhereWithoutCauseInput | Prisma.ClientCauseUpdateManyWithWhereWithoutCauseInput[];
    deleteMany?: Prisma.ClientCauseScalarWhereInput | Prisma.ClientCauseScalarWhereInput[];
};
export type ClientCauseCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutTenantInput, Prisma.ClientCauseUncheckedCreateWithoutTenantInput> | Prisma.ClientCauseCreateWithoutTenantInput[] | Prisma.ClientCauseUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutTenantInput | Prisma.ClientCauseCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ClientCauseCreateManyTenantInputEnvelope;
    connect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
};
export type ClientCauseUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutTenantInput, Prisma.ClientCauseUncheckedCreateWithoutTenantInput> | Prisma.ClientCauseCreateWithoutTenantInput[] | Prisma.ClientCauseUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutTenantInput | Prisma.ClientCauseCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ClientCauseCreateManyTenantInputEnvelope;
    connect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
};
export type ClientCauseUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutTenantInput, Prisma.ClientCauseUncheckedCreateWithoutTenantInput> | Prisma.ClientCauseCreateWithoutTenantInput[] | Prisma.ClientCauseUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutTenantInput | Prisma.ClientCauseCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ClientCauseUpsertWithWhereUniqueWithoutTenantInput | Prisma.ClientCauseUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ClientCauseCreateManyTenantInputEnvelope;
    set?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    disconnect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    delete?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    connect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    update?: Prisma.ClientCauseUpdateWithWhereUniqueWithoutTenantInput | Prisma.ClientCauseUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ClientCauseUpdateManyWithWhereWithoutTenantInput | Prisma.ClientCauseUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ClientCauseScalarWhereInput | Prisma.ClientCauseScalarWhereInput[];
};
export type ClientCauseUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutTenantInput, Prisma.ClientCauseUncheckedCreateWithoutTenantInput> | Prisma.ClientCauseCreateWithoutTenantInput[] | Prisma.ClientCauseUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutTenantInput | Prisma.ClientCauseCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ClientCauseUpsertWithWhereUniqueWithoutTenantInput | Prisma.ClientCauseUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ClientCauseCreateManyTenantInputEnvelope;
    set?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    disconnect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    delete?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    connect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    update?: Prisma.ClientCauseUpdateWithWhereUniqueWithoutTenantInput | Prisma.ClientCauseUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ClientCauseUpdateManyWithWhereWithoutTenantInput | Prisma.ClientCauseUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ClientCauseScalarWhereInput | Prisma.ClientCauseScalarWhereInput[];
};
export type ClientCauseCreateNestedOneWithoutMitigationsInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutMitigationsInput, Prisma.ClientCauseUncheckedCreateWithoutMitigationsInput>;
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutMitigationsInput;
    connect?: Prisma.ClientCauseWhereUniqueInput;
};
export type ClientCauseUpdateOneWithoutMitigationsNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutMitigationsInput, Prisma.ClientCauseUncheckedCreateWithoutMitigationsInput>;
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutMitigationsInput;
    upsert?: Prisma.ClientCauseUpsertWithoutMitigationsInput;
    disconnect?: Prisma.ClientCauseWhereInput | boolean;
    delete?: Prisma.ClientCauseWhereInput | boolean;
    connect?: Prisma.ClientCauseWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientCauseUpdateToOneWithWhereWithoutMitigationsInput, Prisma.ClientCauseUpdateWithoutMitigationsInput>, Prisma.ClientCauseUncheckedUpdateWithoutMitigationsInput>;
};
export type ClientCauseCreateNestedOneWithoutRiskCausesInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutRiskCausesInput, Prisma.ClientCauseUncheckedCreateWithoutRiskCausesInput>;
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutRiskCausesInput;
    connect?: Prisma.ClientCauseWhereUniqueInput;
};
export type ClientCauseUpdateOneRequiredWithoutRiskCausesNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutRiskCausesInput, Prisma.ClientCauseUncheckedCreateWithoutRiskCausesInput>;
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutRiskCausesInput;
    upsert?: Prisma.ClientCauseUpsertWithoutRiskCausesInput;
    connect?: Prisma.ClientCauseWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientCauseUpdateToOneWithWhereWithoutRiskCausesInput, Prisma.ClientCauseUpdateWithoutRiskCausesInput>, Prisma.ClientCauseUncheckedUpdateWithoutRiskCausesInput>;
};
export type ClientCauseCreateNestedOneWithoutCauseControlsInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutCauseControlsInput, Prisma.ClientCauseUncheckedCreateWithoutCauseControlsInput>;
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutCauseControlsInput;
    connect?: Prisma.ClientCauseWhereUniqueInput;
};
export type ClientCauseUpdateOneRequiredWithoutCauseControlsNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutCauseControlsInput, Prisma.ClientCauseUncheckedCreateWithoutCauseControlsInput>;
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutCauseControlsInput;
    upsert?: Prisma.ClientCauseUpsertWithoutCauseControlsInput;
    connect?: Prisma.ClientCauseWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClientCauseUpdateToOneWithWhereWithoutCauseControlsInput, Prisma.ClientCauseUpdateWithoutCauseControlsInput>, Prisma.ClientCauseUncheckedUpdateWithoutCauseControlsInput>;
};
export type ClientCauseCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutServiceInput, Prisma.ClientCauseUncheckedCreateWithoutServiceInput> | Prisma.ClientCauseCreateWithoutServiceInput[] | Prisma.ClientCauseUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutServiceInput | Prisma.ClientCauseCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.ClientCauseCreateManyServiceInputEnvelope;
    connect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
};
export type ClientCauseUncheckedCreateNestedManyWithoutServiceInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutServiceInput, Prisma.ClientCauseUncheckedCreateWithoutServiceInput> | Prisma.ClientCauseCreateWithoutServiceInput[] | Prisma.ClientCauseUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutServiceInput | Prisma.ClientCauseCreateOrConnectWithoutServiceInput[];
    createMany?: Prisma.ClientCauseCreateManyServiceInputEnvelope;
    connect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
};
export type ClientCauseUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutServiceInput, Prisma.ClientCauseUncheckedCreateWithoutServiceInput> | Prisma.ClientCauseCreateWithoutServiceInput[] | Prisma.ClientCauseUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutServiceInput | Prisma.ClientCauseCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.ClientCauseUpsertWithWhereUniqueWithoutServiceInput | Prisma.ClientCauseUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.ClientCauseCreateManyServiceInputEnvelope;
    set?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    disconnect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    delete?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    connect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    update?: Prisma.ClientCauseUpdateWithWhereUniqueWithoutServiceInput | Prisma.ClientCauseUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.ClientCauseUpdateManyWithWhereWithoutServiceInput | Prisma.ClientCauseUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.ClientCauseScalarWhereInput | Prisma.ClientCauseScalarWhereInput[];
};
export type ClientCauseUncheckedUpdateManyWithoutServiceNestedInput = {
    create?: Prisma.XOR<Prisma.ClientCauseCreateWithoutServiceInput, Prisma.ClientCauseUncheckedCreateWithoutServiceInput> | Prisma.ClientCauseCreateWithoutServiceInput[] | Prisma.ClientCauseUncheckedCreateWithoutServiceInput[];
    connectOrCreate?: Prisma.ClientCauseCreateOrConnectWithoutServiceInput | Prisma.ClientCauseCreateOrConnectWithoutServiceInput[];
    upsert?: Prisma.ClientCauseUpsertWithWhereUniqueWithoutServiceInput | Prisma.ClientCauseUpsertWithWhereUniqueWithoutServiceInput[];
    createMany?: Prisma.ClientCauseCreateManyServiceInputEnvelope;
    set?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    disconnect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    delete?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    connect?: Prisma.ClientCauseWhereUniqueInput | Prisma.ClientCauseWhereUniqueInput[];
    update?: Prisma.ClientCauseUpdateWithWhereUniqueWithoutServiceInput | Prisma.ClientCauseUpdateWithWhereUniqueWithoutServiceInput[];
    updateMany?: Prisma.ClientCauseUpdateManyWithWhereWithoutServiceInput | Prisma.ClientCauseUpdateManyWithWhereWithoutServiceInput[];
    deleteMany?: Prisma.ClientCauseScalarWhereInput | Prisma.ClientCauseScalarWhereInput[];
};
export type ClientCauseCreateWithoutCauseInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    service: Prisma.ServiceCreateNestedOneWithoutClientCausesInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientCausesInput;
    riskCauses?: Prisma.ClientRiskCauseCreateNestedManyWithoutClientCauseInput;
    causeControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientCauseInput;
    mitigations?: Prisma.MitigationCreateNestedManyWithoutClientCauseInput;
};
export type ClientCauseUncheckedCreateWithoutCauseInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    riskCauses?: Prisma.ClientRiskCauseUncheckedCreateNestedManyWithoutClientCauseInput;
    causeControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientCauseInput;
    mitigations?: Prisma.MitigationUncheckedCreateNestedManyWithoutClientCauseInput;
};
export type ClientCauseCreateOrConnectWithoutCauseInput = {
    where: Prisma.ClientCauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientCauseCreateWithoutCauseInput, Prisma.ClientCauseUncheckedCreateWithoutCauseInput>;
};
export type ClientCauseCreateManyCauseInputEnvelope = {
    data: Prisma.ClientCauseCreateManyCauseInput | Prisma.ClientCauseCreateManyCauseInput[];
    skipDuplicates?: boolean;
};
export type ClientCauseUpsertWithWhereUniqueWithoutCauseInput = {
    where: Prisma.ClientCauseWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientCauseUpdateWithoutCauseInput, Prisma.ClientCauseUncheckedUpdateWithoutCauseInput>;
    create: Prisma.XOR<Prisma.ClientCauseCreateWithoutCauseInput, Prisma.ClientCauseUncheckedCreateWithoutCauseInput>;
};
export type ClientCauseUpdateWithWhereUniqueWithoutCauseInput = {
    where: Prisma.ClientCauseWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientCauseUpdateWithoutCauseInput, Prisma.ClientCauseUncheckedUpdateWithoutCauseInput>;
};
export type ClientCauseUpdateManyWithWhereWithoutCauseInput = {
    where: Prisma.ClientCauseScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientCauseUpdateManyMutationInput, Prisma.ClientCauseUncheckedUpdateManyWithoutCauseInput>;
};
export type ClientCauseScalarWhereInput = {
    AND?: Prisma.ClientCauseScalarWhereInput | Prisma.ClientCauseScalarWhereInput[];
    OR?: Prisma.ClientCauseScalarWhereInput[];
    NOT?: Prisma.ClientCauseScalarWhereInput | Prisma.ClientCauseScalarWhereInput[];
    id?: Prisma.UuidFilter<"ClientCause"> | string;
    tenantId?: Prisma.UuidFilter<"ClientCause"> | string;
    serviceId?: Prisma.UuidFilter<"ClientCause"> | string;
    causeId?: Prisma.UuidNullableFilter<"ClientCause"> | string | null;
    code?: Prisma.StringFilter<"ClientCause"> | string;
    name?: Prisma.StringFilter<"ClientCause"> | string;
    failureCategory?: Prisma.EnumFailureCategoryFilter<"ClientCause"> | $Enums.FailureCategory;
    description?: Prisma.StringFilter<"ClientCause"> | string;
    isActive?: Prisma.BoolFilter<"ClientCause"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"ClientCause"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ClientCause"> | Date | string;
};
export type ClientCauseCreateWithoutTenantInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    service: Prisma.ServiceCreateNestedOneWithoutClientCausesInput;
    cause?: Prisma.CauseCreateNestedOneWithoutClientCausesInput;
    riskCauses?: Prisma.ClientRiskCauseCreateNestedManyWithoutClientCauseInput;
    causeControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientCauseInput;
    mitigations?: Prisma.MitigationCreateNestedManyWithoutClientCauseInput;
};
export type ClientCauseUncheckedCreateWithoutTenantInput = {
    id?: string;
    serviceId: string;
    causeId?: string | null;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    riskCauses?: Prisma.ClientRiskCauseUncheckedCreateNestedManyWithoutClientCauseInput;
    causeControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientCauseInput;
    mitigations?: Prisma.MitigationUncheckedCreateNestedManyWithoutClientCauseInput;
};
export type ClientCauseCreateOrConnectWithoutTenantInput = {
    where: Prisma.ClientCauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientCauseCreateWithoutTenantInput, Prisma.ClientCauseUncheckedCreateWithoutTenantInput>;
};
export type ClientCauseCreateManyTenantInputEnvelope = {
    data: Prisma.ClientCauseCreateManyTenantInput | Prisma.ClientCauseCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ClientCauseUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ClientCauseWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientCauseUpdateWithoutTenantInput, Prisma.ClientCauseUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ClientCauseCreateWithoutTenantInput, Prisma.ClientCauseUncheckedCreateWithoutTenantInput>;
};
export type ClientCauseUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ClientCauseWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientCauseUpdateWithoutTenantInput, Prisma.ClientCauseUncheckedUpdateWithoutTenantInput>;
};
export type ClientCauseUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ClientCauseScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientCauseUpdateManyMutationInput, Prisma.ClientCauseUncheckedUpdateManyWithoutTenantInput>;
};
export type ClientCauseCreateWithoutMitigationsInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    service: Prisma.ServiceCreateNestedOneWithoutClientCausesInput;
    cause?: Prisma.CauseCreateNestedOneWithoutClientCausesInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientCausesInput;
    riskCauses?: Prisma.ClientRiskCauseCreateNestedManyWithoutClientCauseInput;
    causeControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientCauseInput;
};
export type ClientCauseUncheckedCreateWithoutMitigationsInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    causeId?: string | null;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    riskCauses?: Prisma.ClientRiskCauseUncheckedCreateNestedManyWithoutClientCauseInput;
    causeControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientCauseInput;
};
export type ClientCauseCreateOrConnectWithoutMitigationsInput = {
    where: Prisma.ClientCauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientCauseCreateWithoutMitigationsInput, Prisma.ClientCauseUncheckedCreateWithoutMitigationsInput>;
};
export type ClientCauseUpsertWithoutMitigationsInput = {
    update: Prisma.XOR<Prisma.ClientCauseUpdateWithoutMitigationsInput, Prisma.ClientCauseUncheckedUpdateWithoutMitigationsInput>;
    create: Prisma.XOR<Prisma.ClientCauseCreateWithoutMitigationsInput, Prisma.ClientCauseUncheckedCreateWithoutMitigationsInput>;
    where?: Prisma.ClientCauseWhereInput;
};
export type ClientCauseUpdateToOneWithWhereWithoutMitigationsInput = {
    where?: Prisma.ClientCauseWhereInput;
    data: Prisma.XOR<Prisma.ClientCauseUpdateWithoutMitigationsInput, Prisma.ClientCauseUncheckedUpdateWithoutMitigationsInput>;
};
export type ClientCauseUpdateWithoutMitigationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientCausesNestedInput;
    cause?: Prisma.CauseUpdateOneWithoutClientCausesNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientCausesNestedInput;
    riskCauses?: Prisma.ClientRiskCauseUpdateManyWithoutClientCauseNestedInput;
    causeControls?: Prisma.ClientCauseControlUpdateManyWithoutClientCauseNestedInput;
};
export type ClientCauseUncheckedUpdateWithoutMitigationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    riskCauses?: Prisma.ClientRiskCauseUncheckedUpdateManyWithoutClientCauseNestedInput;
    causeControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientCauseNestedInput;
};
export type ClientCauseCreateWithoutRiskCausesInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    service: Prisma.ServiceCreateNestedOneWithoutClientCausesInput;
    cause?: Prisma.CauseCreateNestedOneWithoutClientCausesInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientCausesInput;
    causeControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientCauseInput;
    mitigations?: Prisma.MitigationCreateNestedManyWithoutClientCauseInput;
};
export type ClientCauseUncheckedCreateWithoutRiskCausesInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    causeId?: string | null;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    causeControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientCauseInput;
    mitigations?: Prisma.MitigationUncheckedCreateNestedManyWithoutClientCauseInput;
};
export type ClientCauseCreateOrConnectWithoutRiskCausesInput = {
    where: Prisma.ClientCauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientCauseCreateWithoutRiskCausesInput, Prisma.ClientCauseUncheckedCreateWithoutRiskCausesInput>;
};
export type ClientCauseUpsertWithoutRiskCausesInput = {
    update: Prisma.XOR<Prisma.ClientCauseUpdateWithoutRiskCausesInput, Prisma.ClientCauseUncheckedUpdateWithoutRiskCausesInput>;
    create: Prisma.XOR<Prisma.ClientCauseCreateWithoutRiskCausesInput, Prisma.ClientCauseUncheckedCreateWithoutRiskCausesInput>;
    where?: Prisma.ClientCauseWhereInput;
};
export type ClientCauseUpdateToOneWithWhereWithoutRiskCausesInput = {
    where?: Prisma.ClientCauseWhereInput;
    data: Prisma.XOR<Prisma.ClientCauseUpdateWithoutRiskCausesInput, Prisma.ClientCauseUncheckedUpdateWithoutRiskCausesInput>;
};
export type ClientCauseUpdateWithoutRiskCausesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientCausesNestedInput;
    cause?: Prisma.CauseUpdateOneWithoutClientCausesNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientCausesNestedInput;
    causeControls?: Prisma.ClientCauseControlUpdateManyWithoutClientCauseNestedInput;
    mitigations?: Prisma.MitigationUpdateManyWithoutClientCauseNestedInput;
};
export type ClientCauseUncheckedUpdateWithoutRiskCausesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    causeControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientCauseNestedInput;
    mitigations?: Prisma.MitigationUncheckedUpdateManyWithoutClientCauseNestedInput;
};
export type ClientCauseCreateWithoutCauseControlsInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    service: Prisma.ServiceCreateNestedOneWithoutClientCausesInput;
    cause?: Prisma.CauseCreateNestedOneWithoutClientCausesInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientCausesInput;
    riskCauses?: Prisma.ClientRiskCauseCreateNestedManyWithoutClientCauseInput;
    mitigations?: Prisma.MitigationCreateNestedManyWithoutClientCauseInput;
};
export type ClientCauseUncheckedCreateWithoutCauseControlsInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    causeId?: string | null;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    riskCauses?: Prisma.ClientRiskCauseUncheckedCreateNestedManyWithoutClientCauseInput;
    mitigations?: Prisma.MitigationUncheckedCreateNestedManyWithoutClientCauseInput;
};
export type ClientCauseCreateOrConnectWithoutCauseControlsInput = {
    where: Prisma.ClientCauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientCauseCreateWithoutCauseControlsInput, Prisma.ClientCauseUncheckedCreateWithoutCauseControlsInput>;
};
export type ClientCauseUpsertWithoutCauseControlsInput = {
    update: Prisma.XOR<Prisma.ClientCauseUpdateWithoutCauseControlsInput, Prisma.ClientCauseUncheckedUpdateWithoutCauseControlsInput>;
    create: Prisma.XOR<Prisma.ClientCauseCreateWithoutCauseControlsInput, Prisma.ClientCauseUncheckedCreateWithoutCauseControlsInput>;
    where?: Prisma.ClientCauseWhereInput;
};
export type ClientCauseUpdateToOneWithWhereWithoutCauseControlsInput = {
    where?: Prisma.ClientCauseWhereInput;
    data: Prisma.XOR<Prisma.ClientCauseUpdateWithoutCauseControlsInput, Prisma.ClientCauseUncheckedUpdateWithoutCauseControlsInput>;
};
export type ClientCauseUpdateWithoutCauseControlsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientCausesNestedInput;
    cause?: Prisma.CauseUpdateOneWithoutClientCausesNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientCausesNestedInput;
    riskCauses?: Prisma.ClientRiskCauseUpdateManyWithoutClientCauseNestedInput;
    mitigations?: Prisma.MitigationUpdateManyWithoutClientCauseNestedInput;
};
export type ClientCauseUncheckedUpdateWithoutCauseControlsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    riskCauses?: Prisma.ClientRiskCauseUncheckedUpdateManyWithoutClientCauseNestedInput;
    mitigations?: Prisma.MitigationUncheckedUpdateManyWithoutClientCauseNestedInput;
};
export type ClientCauseCreateWithoutServiceInput = {
    id?: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    cause?: Prisma.CauseCreateNestedOneWithoutClientCausesInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientCausesInput;
    riskCauses?: Prisma.ClientRiskCauseCreateNestedManyWithoutClientCauseInput;
    causeControls?: Prisma.ClientCauseControlCreateNestedManyWithoutClientCauseInput;
    mitigations?: Prisma.MitigationCreateNestedManyWithoutClientCauseInput;
};
export type ClientCauseUncheckedCreateWithoutServiceInput = {
    id?: string;
    tenantId: string;
    causeId?: string | null;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    riskCauses?: Prisma.ClientRiskCauseUncheckedCreateNestedManyWithoutClientCauseInput;
    causeControls?: Prisma.ClientCauseControlUncheckedCreateNestedManyWithoutClientCauseInput;
    mitigations?: Prisma.MitigationUncheckedCreateNestedManyWithoutClientCauseInput;
};
export type ClientCauseCreateOrConnectWithoutServiceInput = {
    where: Prisma.ClientCauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientCauseCreateWithoutServiceInput, Prisma.ClientCauseUncheckedCreateWithoutServiceInput>;
};
export type ClientCauseCreateManyServiceInputEnvelope = {
    data: Prisma.ClientCauseCreateManyServiceInput | Prisma.ClientCauseCreateManyServiceInput[];
    skipDuplicates?: boolean;
};
export type ClientCauseUpsertWithWhereUniqueWithoutServiceInput = {
    where: Prisma.ClientCauseWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientCauseUpdateWithoutServiceInput, Prisma.ClientCauseUncheckedUpdateWithoutServiceInput>;
    create: Prisma.XOR<Prisma.ClientCauseCreateWithoutServiceInput, Prisma.ClientCauseUncheckedCreateWithoutServiceInput>;
};
export type ClientCauseUpdateWithWhereUniqueWithoutServiceInput = {
    where: Prisma.ClientCauseWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientCauseUpdateWithoutServiceInput, Prisma.ClientCauseUncheckedUpdateWithoutServiceInput>;
};
export type ClientCauseUpdateManyWithWhereWithoutServiceInput = {
    where: Prisma.ClientCauseScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientCauseUpdateManyMutationInput, Prisma.ClientCauseUncheckedUpdateManyWithoutServiceInput>;
};
export type ClientCauseCreateManyCauseInput = {
    id?: string;
    tenantId: string;
    serviceId: string;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClientCauseUpdateWithoutCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientCausesNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientCausesNestedInput;
    riskCauses?: Prisma.ClientRiskCauseUpdateManyWithoutClientCauseNestedInput;
    causeControls?: Prisma.ClientCauseControlUpdateManyWithoutClientCauseNestedInput;
    mitigations?: Prisma.MitigationUpdateManyWithoutClientCauseNestedInput;
};
export type ClientCauseUncheckedUpdateWithoutCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    riskCauses?: Prisma.ClientRiskCauseUncheckedUpdateManyWithoutClientCauseNestedInput;
    causeControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientCauseNestedInput;
    mitigations?: Prisma.MitigationUncheckedUpdateManyWithoutClientCauseNestedInput;
};
export type ClientCauseUncheckedUpdateManyWithoutCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClientCauseCreateManyTenantInput = {
    id?: string;
    serviceId: string;
    causeId?: string | null;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClientCauseUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    service?: Prisma.ServiceUpdateOneRequiredWithoutClientCausesNestedInput;
    cause?: Prisma.CauseUpdateOneWithoutClientCausesNestedInput;
    riskCauses?: Prisma.ClientRiskCauseUpdateManyWithoutClientCauseNestedInput;
    causeControls?: Prisma.ClientCauseControlUpdateManyWithoutClientCauseNestedInput;
    mitigations?: Prisma.MitigationUpdateManyWithoutClientCauseNestedInput;
};
export type ClientCauseUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    riskCauses?: Prisma.ClientRiskCauseUncheckedUpdateManyWithoutClientCauseNestedInput;
    causeControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientCauseNestedInput;
    mitigations?: Prisma.MitigationUncheckedUpdateManyWithoutClientCauseNestedInput;
};
export type ClientCauseUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serviceId?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClientCauseCreateManyServiceInput = {
    id?: string;
    tenantId: string;
    causeId?: string | null;
    code: string;
    name: string;
    failureCategory: $Enums.FailureCategory;
    description: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClientCauseUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    cause?: Prisma.CauseUpdateOneWithoutClientCausesNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientCausesNestedInput;
    riskCauses?: Prisma.ClientRiskCauseUpdateManyWithoutClientCauseNestedInput;
    causeControls?: Prisma.ClientCauseControlUpdateManyWithoutClientCauseNestedInput;
    mitigations?: Prisma.MitigationUpdateManyWithoutClientCauseNestedInput;
};
export type ClientCauseUncheckedUpdateWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    riskCauses?: Prisma.ClientRiskCauseUncheckedUpdateManyWithoutClientCauseNestedInput;
    causeControls?: Prisma.ClientCauseControlUncheckedUpdateManyWithoutClientCauseNestedInput;
    mitigations?: Prisma.MitigationUncheckedUpdateManyWithoutClientCauseNestedInput;
};
export type ClientCauseUncheckedUpdateManyWithoutServiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    causeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    failureCategory?: Prisma.EnumFailureCategoryFieldUpdateOperationsInput | $Enums.FailureCategory;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClientCauseCountOutputType = {
    riskCauses: number;
    causeControls: number;
    mitigations: number;
};
export type ClientCauseCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    riskCauses?: boolean | ClientCauseCountOutputTypeCountRiskCausesArgs;
    causeControls?: boolean | ClientCauseCountOutputTypeCountCauseControlsArgs;
    mitigations?: boolean | ClientCauseCountOutputTypeCountMitigationsArgs;
};
export type ClientCauseCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseCountOutputTypeSelect<ExtArgs> | null;
};
export type ClientCauseCountOutputTypeCountRiskCausesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientRiskCauseWhereInput;
};
export type ClientCauseCountOutputTypeCountCauseControlsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientCauseControlWhereInput;
};
export type ClientCauseCountOutputTypeCountMitigationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MitigationWhereInput;
};
export type ClientCauseSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    causeId?: boolean;
    code?: boolean;
    name?: boolean;
    failureCategory?: boolean;
    description?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    cause?: boolean | Prisma.ClientCause$causeArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    riskCauses?: boolean | Prisma.ClientCause$riskCausesArgs<ExtArgs>;
    causeControls?: boolean | Prisma.ClientCause$causeControlsArgs<ExtArgs>;
    mitigations?: boolean | Prisma.ClientCause$mitigationsArgs<ExtArgs>;
    _count?: boolean | Prisma.ClientCauseCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientCause"]>;
export type ClientCauseSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    causeId?: boolean;
    code?: boolean;
    name?: boolean;
    failureCategory?: boolean;
    description?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    cause?: boolean | Prisma.ClientCause$causeArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientCause"]>;
export type ClientCauseSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    causeId?: boolean;
    code?: boolean;
    name?: boolean;
    failureCategory?: boolean;
    description?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    cause?: boolean | Prisma.ClientCause$causeArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientCause"]>;
export type ClientCauseSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    serviceId?: boolean;
    causeId?: boolean;
    code?: boolean;
    name?: boolean;
    failureCategory?: boolean;
    description?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ClientCauseOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "serviceId" | "causeId" | "code" | "name" | "failureCategory" | "description" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["clientCause"]>;
export type ClientCauseInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    cause?: boolean | Prisma.ClientCause$causeArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    riskCauses?: boolean | Prisma.ClientCause$riskCausesArgs<ExtArgs>;
    causeControls?: boolean | Prisma.ClientCause$causeControlsArgs<ExtArgs>;
    mitigations?: boolean | Prisma.ClientCause$mitigationsArgs<ExtArgs>;
    _count?: boolean | Prisma.ClientCauseCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ClientCauseIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    cause?: boolean | Prisma.ClientCause$causeArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ClientCauseIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    service?: boolean | Prisma.ServiceDefaultArgs<ExtArgs>;
    cause?: boolean | Prisma.ClientCause$causeArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ClientCausePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ClientCause";
    objects: {
        service: Prisma.$ServicePayload<ExtArgs>;
        cause: Prisma.$CausePayload<ExtArgs> | null;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
        riskCauses: Prisma.$ClientRiskCausePayload<ExtArgs>[];
        causeControls: Prisma.$ClientCauseControlPayload<ExtArgs>[];
        mitigations: Prisma.$MitigationPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        serviceId: string;
        causeId: string | null;
        code: string;
        name: string;
        failureCategory: $Enums.FailureCategory;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["clientCause"]>;
    composites: {};
};
export type ClientCauseGetPayload<S extends boolean | null | undefined | ClientCauseDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ClientCausePayload, S>;
export type ClientCauseCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ClientCauseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClientCauseCountAggregateInputType | true;
};
export interface ClientCauseDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ClientCause'];
        meta: {
            name: 'ClientCause';
        };
    };
    findUnique<T extends ClientCauseFindUniqueArgs>(args: Prisma.SelectSubset<T, ClientCauseFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ClientCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ClientCauseFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ClientCauseFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ClientCauseFindFirstArgs>(args?: Prisma.SelectSubset<T, ClientCauseFindFirstArgs<ExtArgs>>): Prisma.Prisma__ClientCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ClientCauseFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ClientCauseFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ClientCauseFindManyArgs>(args?: Prisma.SelectSubset<T, ClientCauseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ClientCauseCreateArgs>(args: Prisma.SelectSubset<T, ClientCauseCreateArgs<ExtArgs>>): Prisma.Prisma__ClientCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ClientCauseCreateManyArgs>(args?: Prisma.SelectSubset<T, ClientCauseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ClientCauseCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ClientCauseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ClientCauseDeleteArgs>(args: Prisma.SelectSubset<T, ClientCauseDeleteArgs<ExtArgs>>): Prisma.Prisma__ClientCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ClientCauseUpdateArgs>(args: Prisma.SelectSubset<T, ClientCauseUpdateArgs<ExtArgs>>): Prisma.Prisma__ClientCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ClientCauseDeleteManyArgs>(args?: Prisma.SelectSubset<T, ClientCauseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ClientCauseUpdateManyArgs>(args: Prisma.SelectSubset<T, ClientCauseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ClientCauseUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ClientCauseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ClientCauseUpsertArgs>(args: Prisma.SelectSubset<T, ClientCauseUpsertArgs<ExtArgs>>): Prisma.Prisma__ClientCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ClientCauseCountArgs>(args?: Prisma.Subset<T, ClientCauseCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ClientCauseCountAggregateOutputType> : number>;
    aggregate<T extends ClientCauseAggregateArgs>(args: Prisma.Subset<T, ClientCauseAggregateArgs>): Prisma.PrismaPromise<GetClientCauseAggregateType<T>>;
    groupBy<T extends ClientCauseGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ClientCauseGroupByArgs['orderBy'];
    } : {
        orderBy?: ClientCauseGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ClientCauseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientCauseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ClientCauseFieldRefs;
}
export interface Prisma__ClientCauseClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    service<T extends Prisma.ServiceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ServiceDefaultArgs<ExtArgs>>): Prisma.Prisma__ServiceClient<runtime.Types.Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    cause<T extends Prisma.ClientCause$causeArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientCause$causeArgs<ExtArgs>>): Prisma.Prisma__CauseClient<runtime.Types.Result.GetResult<Prisma.$CausePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    riskCauses<T extends Prisma.ClientCause$riskCausesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientCause$riskCausesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientRiskCausePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    causeControls<T extends Prisma.ClientCause$causeControlsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientCause$causeControlsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientCauseControlPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    mitigations<T extends Prisma.ClientCause$mitigationsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientCause$mitigationsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MitigationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ClientCauseFieldRefs {
    readonly id: Prisma.FieldRef<"ClientCause", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ClientCause", 'String'>;
    readonly serviceId: Prisma.FieldRef<"ClientCause", 'String'>;
    readonly causeId: Prisma.FieldRef<"ClientCause", 'String'>;
    readonly code: Prisma.FieldRef<"ClientCause", 'String'>;
    readonly name: Prisma.FieldRef<"ClientCause", 'String'>;
    readonly failureCategory: Prisma.FieldRef<"ClientCause", 'FailureCategory'>;
    readonly description: Prisma.FieldRef<"ClientCause", 'String'>;
    readonly isActive: Prisma.FieldRef<"ClientCause", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"ClientCause", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ClientCause", 'DateTime'>;
}
export type ClientCauseFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseInclude<ExtArgs> | null;
    where: Prisma.ClientCauseWhereUniqueInput;
};
export type ClientCauseFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseInclude<ExtArgs> | null;
    where: Prisma.ClientCauseWhereUniqueInput;
};
export type ClientCauseFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseInclude<ExtArgs> | null;
    where?: Prisma.ClientCauseWhereInput;
    orderBy?: Prisma.ClientCauseOrderByWithRelationInput | Prisma.ClientCauseOrderByWithRelationInput[];
    cursor?: Prisma.ClientCauseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientCauseScalarFieldEnum | Prisma.ClientCauseScalarFieldEnum[];
};
export type ClientCauseFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseInclude<ExtArgs> | null;
    where?: Prisma.ClientCauseWhereInput;
    orderBy?: Prisma.ClientCauseOrderByWithRelationInput | Prisma.ClientCauseOrderByWithRelationInput[];
    cursor?: Prisma.ClientCauseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientCauseScalarFieldEnum | Prisma.ClientCauseScalarFieldEnum[];
};
export type ClientCauseFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseInclude<ExtArgs> | null;
    where?: Prisma.ClientCauseWhereInput;
    orderBy?: Prisma.ClientCauseOrderByWithRelationInput | Prisma.ClientCauseOrderByWithRelationInput[];
    cursor?: Prisma.ClientCauseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientCauseScalarFieldEnum | Prisma.ClientCauseScalarFieldEnum[];
};
export type ClientCauseCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientCauseCreateInput, Prisma.ClientCauseUncheckedCreateInput>;
};
export type ClientCauseCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ClientCauseCreateManyInput | Prisma.ClientCauseCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClientCauseCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientCauseOmit<ExtArgs> | null;
    data: Prisma.ClientCauseCreateManyInput | Prisma.ClientCauseCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ClientCauseIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ClientCauseUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientCauseUpdateInput, Prisma.ClientCauseUncheckedUpdateInput>;
    where: Prisma.ClientCauseWhereUniqueInput;
};
export type ClientCauseUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ClientCauseUpdateManyMutationInput, Prisma.ClientCauseUncheckedUpdateManyInput>;
    where?: Prisma.ClientCauseWhereInput;
    limit?: number;
};
export type ClientCauseUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientCauseOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientCauseUpdateManyMutationInput, Prisma.ClientCauseUncheckedUpdateManyInput>;
    where?: Prisma.ClientCauseWhereInput;
    limit?: number;
    include?: Prisma.ClientCauseIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ClientCauseUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseInclude<ExtArgs> | null;
    where: Prisma.ClientCauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientCauseCreateInput, Prisma.ClientCauseUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ClientCauseUpdateInput, Prisma.ClientCauseUncheckedUpdateInput>;
};
export type ClientCauseDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseInclude<ExtArgs> | null;
    where: Prisma.ClientCauseWhereUniqueInput;
};
export type ClientCauseDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientCauseWhereInput;
    limit?: number;
};
export type ClientCause$causeArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CauseSelect<ExtArgs> | null;
    omit?: Prisma.CauseOmit<ExtArgs> | null;
    include?: Prisma.CauseInclude<ExtArgs> | null;
    where?: Prisma.CauseWhereInput;
};
export type ClientCause$riskCausesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientRiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientRiskCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientRiskCauseInclude<ExtArgs> | null;
    where?: Prisma.ClientRiskCauseWhereInput;
    orderBy?: Prisma.ClientRiskCauseOrderByWithRelationInput | Prisma.ClientRiskCauseOrderByWithRelationInput[];
    cursor?: Prisma.ClientRiskCauseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientRiskCauseScalarFieldEnum | Prisma.ClientRiskCauseScalarFieldEnum[];
};
export type ClientCause$causeControlsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClientCause$mitigationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClientCauseDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientCauseInclude<ExtArgs> | null;
};
export {};
