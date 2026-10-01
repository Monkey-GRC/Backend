import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type AssetProvisioningModel = runtime.Types.Result.DefaultSelection<Prisma.$AssetProvisioningPayload>;
export type AggregateAssetProvisioning = {
    _count: AssetProvisioningCountAggregateOutputType | null;
    _min: AssetProvisioningMinAggregateOutputType | null;
    _max: AssetProvisioningMaxAggregateOutputType | null;
};
export type AssetProvisioningMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    assetId: string | null;
    automatedCapabilityId: string | null;
    connectionStatus: $Enums.ProvisioningStatus | null;
    lastValidatedAt: Date | null;
    technicalCoverage: string | null;
    encryptedCredentials: string | null;
    isActive: boolean | null;
    scheduleFrequency: $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    assetId: string | null;
    automatedCapabilityId: string | null;
    connectionStatus: $Enums.ProvisioningStatus | null;
    lastValidatedAt: Date | null;
    technicalCoverage: string | null;
    encryptedCredentials: string | null;
    isActive: boolean | null;
    scheduleFrequency: $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningCountAggregateOutputType = {
    id: number;
    tenantId: number;
    assetId: number;
    automatedCapabilityId: number;
    connectionStatus: number;
    lastValidatedAt: number;
    technicalCoverage: number;
    encryptedCredentials: number;
    isActive: number;
    scheduleFrequency: number;
    _all: number;
};
export type AssetProvisioningMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    assetId?: true;
    automatedCapabilityId?: true;
    connectionStatus?: true;
    lastValidatedAt?: true;
    technicalCoverage?: true;
    encryptedCredentials?: true;
    isActive?: true;
    scheduleFrequency?: true;
};
export type AssetProvisioningMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    assetId?: true;
    automatedCapabilityId?: true;
    connectionStatus?: true;
    lastValidatedAt?: true;
    technicalCoverage?: true;
    encryptedCredentials?: true;
    isActive?: true;
    scheduleFrequency?: true;
};
export type AssetProvisioningCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    assetId?: true;
    automatedCapabilityId?: true;
    connectionStatus?: true;
    lastValidatedAt?: true;
    technicalCoverage?: true;
    encryptedCredentials?: true;
    isActive?: true;
    scheduleFrequency?: true;
    _all?: true;
};
export type AssetProvisioningAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssetProvisioningWhereInput;
    orderBy?: Prisma.AssetProvisioningOrderByWithRelationInput | Prisma.AssetProvisioningOrderByWithRelationInput[];
    cursor?: Prisma.AssetProvisioningWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | AssetProvisioningCountAggregateInputType;
    _min?: AssetProvisioningMinAggregateInputType;
    _max?: AssetProvisioningMaxAggregateInputType;
};
export type GetAssetProvisioningAggregateType<T extends AssetProvisioningAggregateArgs> = {
    [P in keyof T & keyof AggregateAssetProvisioning]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAssetProvisioning[P]> : Prisma.GetScalarType<T[P], AggregateAssetProvisioning[P]>;
};
export type AssetProvisioningGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssetProvisioningWhereInput;
    orderBy?: Prisma.AssetProvisioningOrderByWithAggregationInput | Prisma.AssetProvisioningOrderByWithAggregationInput[];
    by: Prisma.AssetProvisioningScalarFieldEnum[] | Prisma.AssetProvisioningScalarFieldEnum;
    having?: Prisma.AssetProvisioningScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AssetProvisioningCountAggregateInputType | true;
    _min?: AssetProvisioningMinAggregateInputType;
    _max?: AssetProvisioningMaxAggregateInputType;
};
export type AssetProvisioningGroupByOutputType = {
    id: string;
    tenantId: string;
    assetId: string;
    automatedCapabilityId: string;
    connectionStatus: $Enums.ProvisioningStatus;
    lastValidatedAt: Date | null;
    technicalCoverage: string;
    encryptedCredentials: string | null;
    isActive: boolean;
    scheduleFrequency: $Enums.ScheduleFrequency | null;
    _count: AssetProvisioningCountAggregateOutputType | null;
    _min: AssetProvisioningMinAggregateOutputType | null;
    _max: AssetProvisioningMaxAggregateOutputType | null;
};
type GetAssetProvisioningGroupByPayload<T extends AssetProvisioningGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AssetProvisioningGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AssetProvisioningGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AssetProvisioningGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AssetProvisioningGroupByOutputType[P]>;
}>>;
export type AssetProvisioningWhereInput = {
    AND?: Prisma.AssetProvisioningWhereInput | Prisma.AssetProvisioningWhereInput[];
    OR?: Prisma.AssetProvisioningWhereInput[];
    NOT?: Prisma.AssetProvisioningWhereInput | Prisma.AssetProvisioningWhereInput[];
    id?: Prisma.UuidFilter<"AssetProvisioning"> | string;
    tenantId?: Prisma.UuidFilter<"AssetProvisioning"> | string;
    assetId?: Prisma.UuidFilter<"AssetProvisioning"> | string;
    automatedCapabilityId?: Prisma.UuidFilter<"AssetProvisioning"> | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFilter<"AssetProvisioning"> | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.DateTimeNullableFilter<"AssetProvisioning"> | Date | string | null;
    technicalCoverage?: Prisma.StringFilter<"AssetProvisioning"> | string;
    encryptedCredentials?: Prisma.StringNullableFilter<"AssetProvisioning"> | string | null;
    isActive?: Prisma.BoolFilter<"AssetProvisioning"> | boolean;
    scheduleFrequency?: Prisma.EnumScheduleFrequencyNullableFilter<"AssetProvisioning"> | $Enums.ScheduleFrequency | null;
    asset?: Prisma.XOR<Prisma.AssetScalarRelationFilter, Prisma.AssetWhereInput>;
    automatedCapability?: Prisma.XOR<Prisma.AutomatedCapabilityScalarRelationFilter, Prisma.AutomatedCapabilityWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type AssetProvisioningOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    automatedCapabilityId?: Prisma.SortOrder;
    connectionStatus?: Prisma.SortOrder;
    lastValidatedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    technicalCoverage?: Prisma.SortOrder;
    encryptedCredentials?: Prisma.SortOrderInput | Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    scheduleFrequency?: Prisma.SortOrderInput | Prisma.SortOrder;
    asset?: Prisma.AssetOrderByWithRelationInput;
    automatedCapability?: Prisma.AutomatedCapabilityOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type AssetProvisioningWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.AssetProvisioningWhereInput | Prisma.AssetProvisioningWhereInput[];
    OR?: Prisma.AssetProvisioningWhereInput[];
    NOT?: Prisma.AssetProvisioningWhereInput | Prisma.AssetProvisioningWhereInput[];
    tenantId?: Prisma.UuidFilter<"AssetProvisioning"> | string;
    assetId?: Prisma.UuidFilter<"AssetProvisioning"> | string;
    automatedCapabilityId?: Prisma.UuidFilter<"AssetProvisioning"> | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFilter<"AssetProvisioning"> | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.DateTimeNullableFilter<"AssetProvisioning"> | Date | string | null;
    technicalCoverage?: Prisma.StringFilter<"AssetProvisioning"> | string;
    encryptedCredentials?: Prisma.StringNullableFilter<"AssetProvisioning"> | string | null;
    isActive?: Prisma.BoolFilter<"AssetProvisioning"> | boolean;
    scheduleFrequency?: Prisma.EnumScheduleFrequencyNullableFilter<"AssetProvisioning"> | $Enums.ScheduleFrequency | null;
    asset?: Prisma.XOR<Prisma.AssetScalarRelationFilter, Prisma.AssetWhereInput>;
    automatedCapability?: Prisma.XOR<Prisma.AutomatedCapabilityScalarRelationFilter, Prisma.AutomatedCapabilityWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id">;
export type AssetProvisioningOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    automatedCapabilityId?: Prisma.SortOrder;
    connectionStatus?: Prisma.SortOrder;
    lastValidatedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    technicalCoverage?: Prisma.SortOrder;
    encryptedCredentials?: Prisma.SortOrderInput | Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    scheduleFrequency?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.AssetProvisioningCountOrderByAggregateInput;
    _max?: Prisma.AssetProvisioningMaxOrderByAggregateInput;
    _min?: Prisma.AssetProvisioningMinOrderByAggregateInput;
};
export type AssetProvisioningScalarWhereWithAggregatesInput = {
    AND?: Prisma.AssetProvisioningScalarWhereWithAggregatesInput | Prisma.AssetProvisioningScalarWhereWithAggregatesInput[];
    OR?: Prisma.AssetProvisioningScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AssetProvisioningScalarWhereWithAggregatesInput | Prisma.AssetProvisioningScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"AssetProvisioning"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"AssetProvisioning"> | string;
    assetId?: Prisma.UuidWithAggregatesFilter<"AssetProvisioning"> | string;
    automatedCapabilityId?: Prisma.UuidWithAggregatesFilter<"AssetProvisioning"> | string;
    connectionStatus?: Prisma.EnumProvisioningStatusWithAggregatesFilter<"AssetProvisioning"> | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"AssetProvisioning"> | Date | string | null;
    technicalCoverage?: Prisma.StringWithAggregatesFilter<"AssetProvisioning"> | string;
    encryptedCredentials?: Prisma.StringNullableWithAggregatesFilter<"AssetProvisioning"> | string | null;
    isActive?: Prisma.BoolWithAggregatesFilter<"AssetProvisioning"> | boolean;
    scheduleFrequency?: Prisma.EnumScheduleFrequencyNullableWithAggregatesFilter<"AssetProvisioning"> | $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningCreateInput = {
    id?: string;
    connectionStatus?: $Enums.ProvisioningStatus;
    lastValidatedAt?: Date | string | null;
    technicalCoverage: string;
    encryptedCredentials?: string | null;
    isActive?: boolean;
    scheduleFrequency?: $Enums.ScheduleFrequency | null;
    asset: Prisma.AssetCreateNestedOneWithoutProvisioningsInput;
    automatedCapability: Prisma.AutomatedCapabilityCreateNestedOneWithoutAssetProvisioningsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutAssetProvisioningsInput;
};
export type AssetProvisioningUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    automatedCapabilityId: string;
    connectionStatus?: $Enums.ProvisioningStatus;
    lastValidatedAt?: Date | string | null;
    technicalCoverage: string;
    encryptedCredentials?: string | null;
    isActive?: boolean;
    scheduleFrequency?: $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFieldUpdateOperationsInput | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    technicalCoverage?: Prisma.StringFieldUpdateOperationsInput | string;
    encryptedCredentials?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    scheduleFrequency?: Prisma.NullableEnumScheduleFrequencyFieldUpdateOperationsInput | $Enums.ScheduleFrequency | null;
    asset?: Prisma.AssetUpdateOneRequiredWithoutProvisioningsNestedInput;
    automatedCapability?: Prisma.AutomatedCapabilityUpdateOneRequiredWithoutAssetProvisioningsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutAssetProvisioningsNestedInput;
};
export type AssetProvisioningUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    automatedCapabilityId?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFieldUpdateOperationsInput | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    technicalCoverage?: Prisma.StringFieldUpdateOperationsInput | string;
    encryptedCredentials?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    scheduleFrequency?: Prisma.NullableEnumScheduleFrequencyFieldUpdateOperationsInput | $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningCreateManyInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    automatedCapabilityId: string;
    connectionStatus?: $Enums.ProvisioningStatus;
    lastValidatedAt?: Date | string | null;
    technicalCoverage: string;
    encryptedCredentials?: string | null;
    isActive?: boolean;
    scheduleFrequency?: $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFieldUpdateOperationsInput | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    technicalCoverage?: Prisma.StringFieldUpdateOperationsInput | string;
    encryptedCredentials?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    scheduleFrequency?: Prisma.NullableEnumScheduleFrequencyFieldUpdateOperationsInput | $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    automatedCapabilityId?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFieldUpdateOperationsInput | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    technicalCoverage?: Prisma.StringFieldUpdateOperationsInput | string;
    encryptedCredentials?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    scheduleFrequency?: Prisma.NullableEnumScheduleFrequencyFieldUpdateOperationsInput | $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningListRelationFilter = {
    every?: Prisma.AssetProvisioningWhereInput;
    some?: Prisma.AssetProvisioningWhereInput;
    none?: Prisma.AssetProvisioningWhereInput;
};
export type AssetProvisioningOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type AssetProvisioningCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    automatedCapabilityId?: Prisma.SortOrder;
    connectionStatus?: Prisma.SortOrder;
    lastValidatedAt?: Prisma.SortOrder;
    technicalCoverage?: Prisma.SortOrder;
    encryptedCredentials?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    scheduleFrequency?: Prisma.SortOrder;
};
export type AssetProvisioningMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    automatedCapabilityId?: Prisma.SortOrder;
    connectionStatus?: Prisma.SortOrder;
    lastValidatedAt?: Prisma.SortOrder;
    technicalCoverage?: Prisma.SortOrder;
    encryptedCredentials?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    scheduleFrequency?: Prisma.SortOrder;
};
export type AssetProvisioningMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    assetId?: Prisma.SortOrder;
    automatedCapabilityId?: Prisma.SortOrder;
    connectionStatus?: Prisma.SortOrder;
    lastValidatedAt?: Prisma.SortOrder;
    technicalCoverage?: Prisma.SortOrder;
    encryptedCredentials?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    scheduleFrequency?: Prisma.SortOrder;
};
export type AssetProvisioningCreateNestedManyWithoutAutomatedCapabilityInput = {
    create?: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutAutomatedCapabilityInput, Prisma.AssetProvisioningUncheckedCreateWithoutAutomatedCapabilityInput> | Prisma.AssetProvisioningCreateWithoutAutomatedCapabilityInput[] | Prisma.AssetProvisioningUncheckedCreateWithoutAutomatedCapabilityInput[];
    connectOrCreate?: Prisma.AssetProvisioningCreateOrConnectWithoutAutomatedCapabilityInput | Prisma.AssetProvisioningCreateOrConnectWithoutAutomatedCapabilityInput[];
    createMany?: Prisma.AssetProvisioningCreateManyAutomatedCapabilityInputEnvelope;
    connect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
};
export type AssetProvisioningUncheckedCreateNestedManyWithoutAutomatedCapabilityInput = {
    create?: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutAutomatedCapabilityInput, Prisma.AssetProvisioningUncheckedCreateWithoutAutomatedCapabilityInput> | Prisma.AssetProvisioningCreateWithoutAutomatedCapabilityInput[] | Prisma.AssetProvisioningUncheckedCreateWithoutAutomatedCapabilityInput[];
    connectOrCreate?: Prisma.AssetProvisioningCreateOrConnectWithoutAutomatedCapabilityInput | Prisma.AssetProvisioningCreateOrConnectWithoutAutomatedCapabilityInput[];
    createMany?: Prisma.AssetProvisioningCreateManyAutomatedCapabilityInputEnvelope;
    connect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
};
export type AssetProvisioningUpdateManyWithoutAutomatedCapabilityNestedInput = {
    create?: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutAutomatedCapabilityInput, Prisma.AssetProvisioningUncheckedCreateWithoutAutomatedCapabilityInput> | Prisma.AssetProvisioningCreateWithoutAutomatedCapabilityInput[] | Prisma.AssetProvisioningUncheckedCreateWithoutAutomatedCapabilityInput[];
    connectOrCreate?: Prisma.AssetProvisioningCreateOrConnectWithoutAutomatedCapabilityInput | Prisma.AssetProvisioningCreateOrConnectWithoutAutomatedCapabilityInput[];
    upsert?: Prisma.AssetProvisioningUpsertWithWhereUniqueWithoutAutomatedCapabilityInput | Prisma.AssetProvisioningUpsertWithWhereUniqueWithoutAutomatedCapabilityInput[];
    createMany?: Prisma.AssetProvisioningCreateManyAutomatedCapabilityInputEnvelope;
    set?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    disconnect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    delete?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    connect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    update?: Prisma.AssetProvisioningUpdateWithWhereUniqueWithoutAutomatedCapabilityInput | Prisma.AssetProvisioningUpdateWithWhereUniqueWithoutAutomatedCapabilityInput[];
    updateMany?: Prisma.AssetProvisioningUpdateManyWithWhereWithoutAutomatedCapabilityInput | Prisma.AssetProvisioningUpdateManyWithWhereWithoutAutomatedCapabilityInput[];
    deleteMany?: Prisma.AssetProvisioningScalarWhereInput | Prisma.AssetProvisioningScalarWhereInput[];
};
export type AssetProvisioningUncheckedUpdateManyWithoutAutomatedCapabilityNestedInput = {
    create?: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutAutomatedCapabilityInput, Prisma.AssetProvisioningUncheckedCreateWithoutAutomatedCapabilityInput> | Prisma.AssetProvisioningCreateWithoutAutomatedCapabilityInput[] | Prisma.AssetProvisioningUncheckedCreateWithoutAutomatedCapabilityInput[];
    connectOrCreate?: Prisma.AssetProvisioningCreateOrConnectWithoutAutomatedCapabilityInput | Prisma.AssetProvisioningCreateOrConnectWithoutAutomatedCapabilityInput[];
    upsert?: Prisma.AssetProvisioningUpsertWithWhereUniqueWithoutAutomatedCapabilityInput | Prisma.AssetProvisioningUpsertWithWhereUniqueWithoutAutomatedCapabilityInput[];
    createMany?: Prisma.AssetProvisioningCreateManyAutomatedCapabilityInputEnvelope;
    set?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    disconnect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    delete?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    connect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    update?: Prisma.AssetProvisioningUpdateWithWhereUniqueWithoutAutomatedCapabilityInput | Prisma.AssetProvisioningUpdateWithWhereUniqueWithoutAutomatedCapabilityInput[];
    updateMany?: Prisma.AssetProvisioningUpdateManyWithWhereWithoutAutomatedCapabilityInput | Prisma.AssetProvisioningUpdateManyWithWhereWithoutAutomatedCapabilityInput[];
    deleteMany?: Prisma.AssetProvisioningScalarWhereInput | Prisma.AssetProvisioningScalarWhereInput[];
};
export type AssetProvisioningCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutTenantInput, Prisma.AssetProvisioningUncheckedCreateWithoutTenantInput> | Prisma.AssetProvisioningCreateWithoutTenantInput[] | Prisma.AssetProvisioningUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.AssetProvisioningCreateOrConnectWithoutTenantInput | Prisma.AssetProvisioningCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.AssetProvisioningCreateManyTenantInputEnvelope;
    connect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
};
export type AssetProvisioningUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutTenantInput, Prisma.AssetProvisioningUncheckedCreateWithoutTenantInput> | Prisma.AssetProvisioningCreateWithoutTenantInput[] | Prisma.AssetProvisioningUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.AssetProvisioningCreateOrConnectWithoutTenantInput | Prisma.AssetProvisioningCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.AssetProvisioningCreateManyTenantInputEnvelope;
    connect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
};
export type AssetProvisioningUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutTenantInput, Prisma.AssetProvisioningUncheckedCreateWithoutTenantInput> | Prisma.AssetProvisioningCreateWithoutTenantInput[] | Prisma.AssetProvisioningUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.AssetProvisioningCreateOrConnectWithoutTenantInput | Prisma.AssetProvisioningCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.AssetProvisioningUpsertWithWhereUniqueWithoutTenantInput | Prisma.AssetProvisioningUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.AssetProvisioningCreateManyTenantInputEnvelope;
    set?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    disconnect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    delete?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    connect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    update?: Prisma.AssetProvisioningUpdateWithWhereUniqueWithoutTenantInput | Prisma.AssetProvisioningUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.AssetProvisioningUpdateManyWithWhereWithoutTenantInput | Prisma.AssetProvisioningUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.AssetProvisioningScalarWhereInput | Prisma.AssetProvisioningScalarWhereInput[];
};
export type AssetProvisioningUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutTenantInput, Prisma.AssetProvisioningUncheckedCreateWithoutTenantInput> | Prisma.AssetProvisioningCreateWithoutTenantInput[] | Prisma.AssetProvisioningUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.AssetProvisioningCreateOrConnectWithoutTenantInput | Prisma.AssetProvisioningCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.AssetProvisioningUpsertWithWhereUniqueWithoutTenantInput | Prisma.AssetProvisioningUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.AssetProvisioningCreateManyTenantInputEnvelope;
    set?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    disconnect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    delete?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    connect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    update?: Prisma.AssetProvisioningUpdateWithWhereUniqueWithoutTenantInput | Prisma.AssetProvisioningUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.AssetProvisioningUpdateManyWithWhereWithoutTenantInput | Prisma.AssetProvisioningUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.AssetProvisioningScalarWhereInput | Prisma.AssetProvisioningScalarWhereInput[];
};
export type AssetProvisioningCreateNestedManyWithoutAssetInput = {
    create?: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutAssetInput, Prisma.AssetProvisioningUncheckedCreateWithoutAssetInput> | Prisma.AssetProvisioningCreateWithoutAssetInput[] | Prisma.AssetProvisioningUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.AssetProvisioningCreateOrConnectWithoutAssetInput | Prisma.AssetProvisioningCreateOrConnectWithoutAssetInput[];
    createMany?: Prisma.AssetProvisioningCreateManyAssetInputEnvelope;
    connect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
};
export type AssetProvisioningUncheckedCreateNestedManyWithoutAssetInput = {
    create?: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutAssetInput, Prisma.AssetProvisioningUncheckedCreateWithoutAssetInput> | Prisma.AssetProvisioningCreateWithoutAssetInput[] | Prisma.AssetProvisioningUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.AssetProvisioningCreateOrConnectWithoutAssetInput | Prisma.AssetProvisioningCreateOrConnectWithoutAssetInput[];
    createMany?: Prisma.AssetProvisioningCreateManyAssetInputEnvelope;
    connect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
};
export type AssetProvisioningUpdateManyWithoutAssetNestedInput = {
    create?: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutAssetInput, Prisma.AssetProvisioningUncheckedCreateWithoutAssetInput> | Prisma.AssetProvisioningCreateWithoutAssetInput[] | Prisma.AssetProvisioningUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.AssetProvisioningCreateOrConnectWithoutAssetInput | Prisma.AssetProvisioningCreateOrConnectWithoutAssetInput[];
    upsert?: Prisma.AssetProvisioningUpsertWithWhereUniqueWithoutAssetInput | Prisma.AssetProvisioningUpsertWithWhereUniqueWithoutAssetInput[];
    createMany?: Prisma.AssetProvisioningCreateManyAssetInputEnvelope;
    set?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    disconnect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    delete?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    connect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    update?: Prisma.AssetProvisioningUpdateWithWhereUniqueWithoutAssetInput | Prisma.AssetProvisioningUpdateWithWhereUniqueWithoutAssetInput[];
    updateMany?: Prisma.AssetProvisioningUpdateManyWithWhereWithoutAssetInput | Prisma.AssetProvisioningUpdateManyWithWhereWithoutAssetInput[];
    deleteMany?: Prisma.AssetProvisioningScalarWhereInput | Prisma.AssetProvisioningScalarWhereInput[];
};
export type AssetProvisioningUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutAssetInput, Prisma.AssetProvisioningUncheckedCreateWithoutAssetInput> | Prisma.AssetProvisioningCreateWithoutAssetInput[] | Prisma.AssetProvisioningUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.AssetProvisioningCreateOrConnectWithoutAssetInput | Prisma.AssetProvisioningCreateOrConnectWithoutAssetInput[];
    upsert?: Prisma.AssetProvisioningUpsertWithWhereUniqueWithoutAssetInput | Prisma.AssetProvisioningUpsertWithWhereUniqueWithoutAssetInput[];
    createMany?: Prisma.AssetProvisioningCreateManyAssetInputEnvelope;
    set?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    disconnect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    delete?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    connect?: Prisma.AssetProvisioningWhereUniqueInput | Prisma.AssetProvisioningWhereUniqueInput[];
    update?: Prisma.AssetProvisioningUpdateWithWhereUniqueWithoutAssetInput | Prisma.AssetProvisioningUpdateWithWhereUniqueWithoutAssetInput[];
    updateMany?: Prisma.AssetProvisioningUpdateManyWithWhereWithoutAssetInput | Prisma.AssetProvisioningUpdateManyWithWhereWithoutAssetInput[];
    deleteMany?: Prisma.AssetProvisioningScalarWhereInput | Prisma.AssetProvisioningScalarWhereInput[];
};
export type EnumProvisioningStatusFieldUpdateOperationsInput = {
    set?: $Enums.ProvisioningStatus;
};
export type NullableEnumScheduleFrequencyFieldUpdateOperationsInput = {
    set?: $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningCreateWithoutAutomatedCapabilityInput = {
    id?: string;
    connectionStatus?: $Enums.ProvisioningStatus;
    lastValidatedAt?: Date | string | null;
    technicalCoverage: string;
    encryptedCredentials?: string | null;
    isActive?: boolean;
    scheduleFrequency?: $Enums.ScheduleFrequency | null;
    asset: Prisma.AssetCreateNestedOneWithoutProvisioningsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutAssetProvisioningsInput;
};
export type AssetProvisioningUncheckedCreateWithoutAutomatedCapabilityInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    connectionStatus?: $Enums.ProvisioningStatus;
    lastValidatedAt?: Date | string | null;
    technicalCoverage: string;
    encryptedCredentials?: string | null;
    isActive?: boolean;
    scheduleFrequency?: $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningCreateOrConnectWithoutAutomatedCapabilityInput = {
    where: Prisma.AssetProvisioningWhereUniqueInput;
    create: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutAutomatedCapabilityInput, Prisma.AssetProvisioningUncheckedCreateWithoutAutomatedCapabilityInput>;
};
export type AssetProvisioningCreateManyAutomatedCapabilityInputEnvelope = {
    data: Prisma.AssetProvisioningCreateManyAutomatedCapabilityInput | Prisma.AssetProvisioningCreateManyAutomatedCapabilityInput[];
    skipDuplicates?: boolean;
};
export type AssetProvisioningUpsertWithWhereUniqueWithoutAutomatedCapabilityInput = {
    where: Prisma.AssetProvisioningWhereUniqueInput;
    update: Prisma.XOR<Prisma.AssetProvisioningUpdateWithoutAutomatedCapabilityInput, Prisma.AssetProvisioningUncheckedUpdateWithoutAutomatedCapabilityInput>;
    create: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutAutomatedCapabilityInput, Prisma.AssetProvisioningUncheckedCreateWithoutAutomatedCapabilityInput>;
};
export type AssetProvisioningUpdateWithWhereUniqueWithoutAutomatedCapabilityInput = {
    where: Prisma.AssetProvisioningWhereUniqueInput;
    data: Prisma.XOR<Prisma.AssetProvisioningUpdateWithoutAutomatedCapabilityInput, Prisma.AssetProvisioningUncheckedUpdateWithoutAutomatedCapabilityInput>;
};
export type AssetProvisioningUpdateManyWithWhereWithoutAutomatedCapabilityInput = {
    where: Prisma.AssetProvisioningScalarWhereInput;
    data: Prisma.XOR<Prisma.AssetProvisioningUpdateManyMutationInput, Prisma.AssetProvisioningUncheckedUpdateManyWithoutAutomatedCapabilityInput>;
};
export type AssetProvisioningScalarWhereInput = {
    AND?: Prisma.AssetProvisioningScalarWhereInput | Prisma.AssetProvisioningScalarWhereInput[];
    OR?: Prisma.AssetProvisioningScalarWhereInput[];
    NOT?: Prisma.AssetProvisioningScalarWhereInput | Prisma.AssetProvisioningScalarWhereInput[];
    id?: Prisma.UuidFilter<"AssetProvisioning"> | string;
    tenantId?: Prisma.UuidFilter<"AssetProvisioning"> | string;
    assetId?: Prisma.UuidFilter<"AssetProvisioning"> | string;
    automatedCapabilityId?: Prisma.UuidFilter<"AssetProvisioning"> | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFilter<"AssetProvisioning"> | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.DateTimeNullableFilter<"AssetProvisioning"> | Date | string | null;
    technicalCoverage?: Prisma.StringFilter<"AssetProvisioning"> | string;
    encryptedCredentials?: Prisma.StringNullableFilter<"AssetProvisioning"> | string | null;
    isActive?: Prisma.BoolFilter<"AssetProvisioning"> | boolean;
    scheduleFrequency?: Prisma.EnumScheduleFrequencyNullableFilter<"AssetProvisioning"> | $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningCreateWithoutTenantInput = {
    id?: string;
    connectionStatus?: $Enums.ProvisioningStatus;
    lastValidatedAt?: Date | string | null;
    technicalCoverage: string;
    encryptedCredentials?: string | null;
    isActive?: boolean;
    scheduleFrequency?: $Enums.ScheduleFrequency | null;
    asset: Prisma.AssetCreateNestedOneWithoutProvisioningsInput;
    automatedCapability: Prisma.AutomatedCapabilityCreateNestedOneWithoutAssetProvisioningsInput;
};
export type AssetProvisioningUncheckedCreateWithoutTenantInput = {
    id?: string;
    assetId: string;
    automatedCapabilityId: string;
    connectionStatus?: $Enums.ProvisioningStatus;
    lastValidatedAt?: Date | string | null;
    technicalCoverage: string;
    encryptedCredentials?: string | null;
    isActive?: boolean;
    scheduleFrequency?: $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningCreateOrConnectWithoutTenantInput = {
    where: Prisma.AssetProvisioningWhereUniqueInput;
    create: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutTenantInput, Prisma.AssetProvisioningUncheckedCreateWithoutTenantInput>;
};
export type AssetProvisioningCreateManyTenantInputEnvelope = {
    data: Prisma.AssetProvisioningCreateManyTenantInput | Prisma.AssetProvisioningCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type AssetProvisioningUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.AssetProvisioningWhereUniqueInput;
    update: Prisma.XOR<Prisma.AssetProvisioningUpdateWithoutTenantInput, Prisma.AssetProvisioningUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutTenantInput, Prisma.AssetProvisioningUncheckedCreateWithoutTenantInput>;
};
export type AssetProvisioningUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.AssetProvisioningWhereUniqueInput;
    data: Prisma.XOR<Prisma.AssetProvisioningUpdateWithoutTenantInput, Prisma.AssetProvisioningUncheckedUpdateWithoutTenantInput>;
};
export type AssetProvisioningUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.AssetProvisioningScalarWhereInput;
    data: Prisma.XOR<Prisma.AssetProvisioningUpdateManyMutationInput, Prisma.AssetProvisioningUncheckedUpdateManyWithoutTenantInput>;
};
export type AssetProvisioningCreateWithoutAssetInput = {
    id?: string;
    connectionStatus?: $Enums.ProvisioningStatus;
    lastValidatedAt?: Date | string | null;
    technicalCoverage: string;
    encryptedCredentials?: string | null;
    isActive?: boolean;
    scheduleFrequency?: $Enums.ScheduleFrequency | null;
    automatedCapability: Prisma.AutomatedCapabilityCreateNestedOneWithoutAssetProvisioningsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutAssetProvisioningsInput;
};
export type AssetProvisioningUncheckedCreateWithoutAssetInput = {
    id?: string;
    tenantId: string;
    automatedCapabilityId: string;
    connectionStatus?: $Enums.ProvisioningStatus;
    lastValidatedAt?: Date | string | null;
    technicalCoverage: string;
    encryptedCredentials?: string | null;
    isActive?: boolean;
    scheduleFrequency?: $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningCreateOrConnectWithoutAssetInput = {
    where: Prisma.AssetProvisioningWhereUniqueInput;
    create: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutAssetInput, Prisma.AssetProvisioningUncheckedCreateWithoutAssetInput>;
};
export type AssetProvisioningCreateManyAssetInputEnvelope = {
    data: Prisma.AssetProvisioningCreateManyAssetInput | Prisma.AssetProvisioningCreateManyAssetInput[];
    skipDuplicates?: boolean;
};
export type AssetProvisioningUpsertWithWhereUniqueWithoutAssetInput = {
    where: Prisma.AssetProvisioningWhereUniqueInput;
    update: Prisma.XOR<Prisma.AssetProvisioningUpdateWithoutAssetInput, Prisma.AssetProvisioningUncheckedUpdateWithoutAssetInput>;
    create: Prisma.XOR<Prisma.AssetProvisioningCreateWithoutAssetInput, Prisma.AssetProvisioningUncheckedCreateWithoutAssetInput>;
};
export type AssetProvisioningUpdateWithWhereUniqueWithoutAssetInput = {
    where: Prisma.AssetProvisioningWhereUniqueInput;
    data: Prisma.XOR<Prisma.AssetProvisioningUpdateWithoutAssetInput, Prisma.AssetProvisioningUncheckedUpdateWithoutAssetInput>;
};
export type AssetProvisioningUpdateManyWithWhereWithoutAssetInput = {
    where: Prisma.AssetProvisioningScalarWhereInput;
    data: Prisma.XOR<Prisma.AssetProvisioningUpdateManyMutationInput, Prisma.AssetProvisioningUncheckedUpdateManyWithoutAssetInput>;
};
export type AssetProvisioningCreateManyAutomatedCapabilityInput = {
    id?: string;
    tenantId: string;
    assetId: string;
    connectionStatus?: $Enums.ProvisioningStatus;
    lastValidatedAt?: Date | string | null;
    technicalCoverage: string;
    encryptedCredentials?: string | null;
    isActive?: boolean;
    scheduleFrequency?: $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningUpdateWithoutAutomatedCapabilityInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFieldUpdateOperationsInput | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    technicalCoverage?: Prisma.StringFieldUpdateOperationsInput | string;
    encryptedCredentials?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    scheduleFrequency?: Prisma.NullableEnumScheduleFrequencyFieldUpdateOperationsInput | $Enums.ScheduleFrequency | null;
    asset?: Prisma.AssetUpdateOneRequiredWithoutProvisioningsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutAssetProvisioningsNestedInput;
};
export type AssetProvisioningUncheckedUpdateWithoutAutomatedCapabilityInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFieldUpdateOperationsInput | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    technicalCoverage?: Prisma.StringFieldUpdateOperationsInput | string;
    encryptedCredentials?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    scheduleFrequency?: Prisma.NullableEnumScheduleFrequencyFieldUpdateOperationsInput | $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningUncheckedUpdateManyWithoutAutomatedCapabilityInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFieldUpdateOperationsInput | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    technicalCoverage?: Prisma.StringFieldUpdateOperationsInput | string;
    encryptedCredentials?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    scheduleFrequency?: Prisma.NullableEnumScheduleFrequencyFieldUpdateOperationsInput | $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningCreateManyTenantInput = {
    id?: string;
    assetId: string;
    automatedCapabilityId: string;
    connectionStatus?: $Enums.ProvisioningStatus;
    lastValidatedAt?: Date | string | null;
    technicalCoverage: string;
    encryptedCredentials?: string | null;
    isActive?: boolean;
    scheduleFrequency?: $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFieldUpdateOperationsInput | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    technicalCoverage?: Prisma.StringFieldUpdateOperationsInput | string;
    encryptedCredentials?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    scheduleFrequency?: Prisma.NullableEnumScheduleFrequencyFieldUpdateOperationsInput | $Enums.ScheduleFrequency | null;
    asset?: Prisma.AssetUpdateOneRequiredWithoutProvisioningsNestedInput;
    automatedCapability?: Prisma.AutomatedCapabilityUpdateOneRequiredWithoutAssetProvisioningsNestedInput;
};
export type AssetProvisioningUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    automatedCapabilityId?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFieldUpdateOperationsInput | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    technicalCoverage?: Prisma.StringFieldUpdateOperationsInput | string;
    encryptedCredentials?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    scheduleFrequency?: Prisma.NullableEnumScheduleFrequencyFieldUpdateOperationsInput | $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    assetId?: Prisma.StringFieldUpdateOperationsInput | string;
    automatedCapabilityId?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFieldUpdateOperationsInput | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    technicalCoverage?: Prisma.StringFieldUpdateOperationsInput | string;
    encryptedCredentials?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    scheduleFrequency?: Prisma.NullableEnumScheduleFrequencyFieldUpdateOperationsInput | $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningCreateManyAssetInput = {
    id?: string;
    tenantId: string;
    automatedCapabilityId: string;
    connectionStatus?: $Enums.ProvisioningStatus;
    lastValidatedAt?: Date | string | null;
    technicalCoverage: string;
    encryptedCredentials?: string | null;
    isActive?: boolean;
    scheduleFrequency?: $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningUpdateWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFieldUpdateOperationsInput | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    technicalCoverage?: Prisma.StringFieldUpdateOperationsInput | string;
    encryptedCredentials?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    scheduleFrequency?: Prisma.NullableEnumScheduleFrequencyFieldUpdateOperationsInput | $Enums.ScheduleFrequency | null;
    automatedCapability?: Prisma.AutomatedCapabilityUpdateOneRequiredWithoutAssetProvisioningsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutAssetProvisioningsNestedInput;
};
export type AssetProvisioningUncheckedUpdateWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    automatedCapabilityId?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFieldUpdateOperationsInput | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    technicalCoverage?: Prisma.StringFieldUpdateOperationsInput | string;
    encryptedCredentials?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    scheduleFrequency?: Prisma.NullableEnumScheduleFrequencyFieldUpdateOperationsInput | $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningUncheckedUpdateManyWithoutAssetInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    automatedCapabilityId?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionStatus?: Prisma.EnumProvisioningStatusFieldUpdateOperationsInput | $Enums.ProvisioningStatus;
    lastValidatedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    technicalCoverage?: Prisma.StringFieldUpdateOperationsInput | string;
    encryptedCredentials?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    scheduleFrequency?: Prisma.NullableEnumScheduleFrequencyFieldUpdateOperationsInput | $Enums.ScheduleFrequency | null;
};
export type AssetProvisioningSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    assetId?: boolean;
    automatedCapabilityId?: boolean;
    connectionStatus?: boolean;
    lastValidatedAt?: boolean;
    technicalCoverage?: boolean;
    encryptedCredentials?: boolean;
    isActive?: boolean;
    scheduleFrequency?: boolean;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    automatedCapability?: boolean | Prisma.AutomatedCapabilityDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["assetProvisioning"]>;
export type AssetProvisioningSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    assetId?: boolean;
    automatedCapabilityId?: boolean;
    connectionStatus?: boolean;
    lastValidatedAt?: boolean;
    technicalCoverage?: boolean;
    encryptedCredentials?: boolean;
    isActive?: boolean;
    scheduleFrequency?: boolean;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    automatedCapability?: boolean | Prisma.AutomatedCapabilityDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["assetProvisioning"]>;
export type AssetProvisioningSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    assetId?: boolean;
    automatedCapabilityId?: boolean;
    connectionStatus?: boolean;
    lastValidatedAt?: boolean;
    technicalCoverage?: boolean;
    encryptedCredentials?: boolean;
    isActive?: boolean;
    scheduleFrequency?: boolean;
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    automatedCapability?: boolean | Prisma.AutomatedCapabilityDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["assetProvisioning"]>;
export type AssetProvisioningSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    assetId?: boolean;
    automatedCapabilityId?: boolean;
    connectionStatus?: boolean;
    lastValidatedAt?: boolean;
    technicalCoverage?: boolean;
    encryptedCredentials?: boolean;
    isActive?: boolean;
    scheduleFrequency?: boolean;
};
export type AssetProvisioningOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "assetId" | "automatedCapabilityId" | "connectionStatus" | "lastValidatedAt" | "technicalCoverage" | "encryptedCredentials" | "isActive" | "scheduleFrequency", ExtArgs["result"]["assetProvisioning"]>;
export type AssetProvisioningInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    automatedCapability?: boolean | Prisma.AutomatedCapabilityDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type AssetProvisioningIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    automatedCapability?: boolean | Prisma.AutomatedCapabilityDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type AssetProvisioningIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    asset?: boolean | Prisma.AssetDefaultArgs<ExtArgs>;
    automatedCapability?: boolean | Prisma.AutomatedCapabilityDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $AssetProvisioningPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "AssetProvisioning";
    objects: {
        asset: Prisma.$AssetPayload<ExtArgs>;
        automatedCapability: Prisma.$AutomatedCapabilityPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        assetId: string;
        automatedCapabilityId: string;
        connectionStatus: $Enums.ProvisioningStatus;
        lastValidatedAt: Date | null;
        technicalCoverage: string;
        encryptedCredentials: string | null;
        isActive: boolean;
        scheduleFrequency: $Enums.ScheduleFrequency | null;
    }, ExtArgs["result"]["assetProvisioning"]>;
    composites: {};
};
export type AssetProvisioningGetPayload<S extends boolean | null | undefined | AssetProvisioningDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AssetProvisioningPayload, S>;
export type AssetProvisioningCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AssetProvisioningFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AssetProvisioningCountAggregateInputType | true;
};
export interface AssetProvisioningDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['AssetProvisioning'];
        meta: {
            name: 'AssetProvisioning';
        };
    };
    findUnique<T extends AssetProvisioningFindUniqueArgs>(args: Prisma.SelectSubset<T, AssetProvisioningFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AssetProvisioningClient<runtime.Types.Result.GetResult<Prisma.$AssetProvisioningPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends AssetProvisioningFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AssetProvisioningFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AssetProvisioningClient<runtime.Types.Result.GetResult<Prisma.$AssetProvisioningPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends AssetProvisioningFindFirstArgs>(args?: Prisma.SelectSubset<T, AssetProvisioningFindFirstArgs<ExtArgs>>): Prisma.Prisma__AssetProvisioningClient<runtime.Types.Result.GetResult<Prisma.$AssetProvisioningPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends AssetProvisioningFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AssetProvisioningFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AssetProvisioningClient<runtime.Types.Result.GetResult<Prisma.$AssetProvisioningPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends AssetProvisioningFindManyArgs>(args?: Prisma.SelectSubset<T, AssetProvisioningFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssetProvisioningPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends AssetProvisioningCreateArgs>(args: Prisma.SelectSubset<T, AssetProvisioningCreateArgs<ExtArgs>>): Prisma.Prisma__AssetProvisioningClient<runtime.Types.Result.GetResult<Prisma.$AssetProvisioningPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends AssetProvisioningCreateManyArgs>(args?: Prisma.SelectSubset<T, AssetProvisioningCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends AssetProvisioningCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AssetProvisioningCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssetProvisioningPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends AssetProvisioningDeleteArgs>(args: Prisma.SelectSubset<T, AssetProvisioningDeleteArgs<ExtArgs>>): Prisma.Prisma__AssetProvisioningClient<runtime.Types.Result.GetResult<Prisma.$AssetProvisioningPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends AssetProvisioningUpdateArgs>(args: Prisma.SelectSubset<T, AssetProvisioningUpdateArgs<ExtArgs>>): Prisma.Prisma__AssetProvisioningClient<runtime.Types.Result.GetResult<Prisma.$AssetProvisioningPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends AssetProvisioningDeleteManyArgs>(args?: Prisma.SelectSubset<T, AssetProvisioningDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends AssetProvisioningUpdateManyArgs>(args: Prisma.SelectSubset<T, AssetProvisioningUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends AssetProvisioningUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AssetProvisioningUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssetProvisioningPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends AssetProvisioningUpsertArgs>(args: Prisma.SelectSubset<T, AssetProvisioningUpsertArgs<ExtArgs>>): Prisma.Prisma__AssetProvisioningClient<runtime.Types.Result.GetResult<Prisma.$AssetProvisioningPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends AssetProvisioningCountArgs>(args?: Prisma.Subset<T, AssetProvisioningCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AssetProvisioningCountAggregateOutputType> : number>;
    aggregate<T extends AssetProvisioningAggregateArgs>(args: Prisma.Subset<T, AssetProvisioningAggregateArgs>): Prisma.PrismaPromise<GetAssetProvisioningAggregateType<T>>;
    groupBy<T extends AssetProvisioningGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AssetProvisioningGroupByArgs['orderBy'];
    } : {
        orderBy?: AssetProvisioningGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AssetProvisioningGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssetProvisioningGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: AssetProvisioningFieldRefs;
}
export interface Prisma__AssetProvisioningClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    asset<T extends Prisma.AssetDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.AssetDefaultArgs<ExtArgs>>): Prisma.Prisma__AssetClient<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    automatedCapability<T extends Prisma.AutomatedCapabilityDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.AutomatedCapabilityDefaultArgs<ExtArgs>>): Prisma.Prisma__AutomatedCapabilityClient<runtime.Types.Result.GetResult<Prisma.$AutomatedCapabilityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface AssetProvisioningFieldRefs {
    readonly id: Prisma.FieldRef<"AssetProvisioning", 'String'>;
    readonly tenantId: Prisma.FieldRef<"AssetProvisioning", 'String'>;
    readonly assetId: Prisma.FieldRef<"AssetProvisioning", 'String'>;
    readonly automatedCapabilityId: Prisma.FieldRef<"AssetProvisioning", 'String'>;
    readonly connectionStatus: Prisma.FieldRef<"AssetProvisioning", 'ProvisioningStatus'>;
    readonly lastValidatedAt: Prisma.FieldRef<"AssetProvisioning", 'DateTime'>;
    readonly technicalCoverage: Prisma.FieldRef<"AssetProvisioning", 'String'>;
    readonly encryptedCredentials: Prisma.FieldRef<"AssetProvisioning", 'String'>;
    readonly isActive: Prisma.FieldRef<"AssetProvisioning", 'Boolean'>;
    readonly scheduleFrequency: Prisma.FieldRef<"AssetProvisioning", 'ScheduleFrequency'>;
}
export type AssetProvisioningFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssetProvisioningSelect<ExtArgs> | null;
    omit?: Prisma.AssetProvisioningOmit<ExtArgs> | null;
    include?: Prisma.AssetProvisioningInclude<ExtArgs> | null;
    where: Prisma.AssetProvisioningWhereUniqueInput;
};
export type AssetProvisioningFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssetProvisioningSelect<ExtArgs> | null;
    omit?: Prisma.AssetProvisioningOmit<ExtArgs> | null;
    include?: Prisma.AssetProvisioningInclude<ExtArgs> | null;
    where: Prisma.AssetProvisioningWhereUniqueInput;
};
export type AssetProvisioningFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssetProvisioningSelect<ExtArgs> | null;
    omit?: Prisma.AssetProvisioningOmit<ExtArgs> | null;
    include?: Prisma.AssetProvisioningInclude<ExtArgs> | null;
    where?: Prisma.AssetProvisioningWhereInput;
    orderBy?: Prisma.AssetProvisioningOrderByWithRelationInput | Prisma.AssetProvisioningOrderByWithRelationInput[];
    cursor?: Prisma.AssetProvisioningWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AssetProvisioningScalarFieldEnum | Prisma.AssetProvisioningScalarFieldEnum[];
};
export type AssetProvisioningFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssetProvisioningSelect<ExtArgs> | null;
    omit?: Prisma.AssetProvisioningOmit<ExtArgs> | null;
    include?: Prisma.AssetProvisioningInclude<ExtArgs> | null;
    where?: Prisma.AssetProvisioningWhereInput;
    orderBy?: Prisma.AssetProvisioningOrderByWithRelationInput | Prisma.AssetProvisioningOrderByWithRelationInput[];
    cursor?: Prisma.AssetProvisioningWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AssetProvisioningScalarFieldEnum | Prisma.AssetProvisioningScalarFieldEnum[];
};
export type AssetProvisioningFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssetProvisioningSelect<ExtArgs> | null;
    omit?: Prisma.AssetProvisioningOmit<ExtArgs> | null;
    include?: Prisma.AssetProvisioningInclude<ExtArgs> | null;
    where?: Prisma.AssetProvisioningWhereInput;
    orderBy?: Prisma.AssetProvisioningOrderByWithRelationInput | Prisma.AssetProvisioningOrderByWithRelationInput[];
    cursor?: Prisma.AssetProvisioningWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AssetProvisioningScalarFieldEnum | Prisma.AssetProvisioningScalarFieldEnum[];
};
export type AssetProvisioningCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssetProvisioningSelect<ExtArgs> | null;
    omit?: Prisma.AssetProvisioningOmit<ExtArgs> | null;
    include?: Prisma.AssetProvisioningInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AssetProvisioningCreateInput, Prisma.AssetProvisioningUncheckedCreateInput>;
};
export type AssetProvisioningCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.AssetProvisioningCreateManyInput | Prisma.AssetProvisioningCreateManyInput[];
    skipDuplicates?: boolean;
};
export type AssetProvisioningCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssetProvisioningSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AssetProvisioningOmit<ExtArgs> | null;
    data: Prisma.AssetProvisioningCreateManyInput | Prisma.AssetProvisioningCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.AssetProvisioningIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type AssetProvisioningUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssetProvisioningSelect<ExtArgs> | null;
    omit?: Prisma.AssetProvisioningOmit<ExtArgs> | null;
    include?: Prisma.AssetProvisioningInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AssetProvisioningUpdateInput, Prisma.AssetProvisioningUncheckedUpdateInput>;
    where: Prisma.AssetProvisioningWhereUniqueInput;
};
export type AssetProvisioningUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.AssetProvisioningUpdateManyMutationInput, Prisma.AssetProvisioningUncheckedUpdateManyInput>;
    where?: Prisma.AssetProvisioningWhereInput;
    limit?: number;
};
export type AssetProvisioningUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssetProvisioningSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AssetProvisioningOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AssetProvisioningUpdateManyMutationInput, Prisma.AssetProvisioningUncheckedUpdateManyInput>;
    where?: Prisma.AssetProvisioningWhereInput;
    limit?: number;
    include?: Prisma.AssetProvisioningIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type AssetProvisioningUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssetProvisioningSelect<ExtArgs> | null;
    omit?: Prisma.AssetProvisioningOmit<ExtArgs> | null;
    include?: Prisma.AssetProvisioningInclude<ExtArgs> | null;
    where: Prisma.AssetProvisioningWhereUniqueInput;
    create: Prisma.XOR<Prisma.AssetProvisioningCreateInput, Prisma.AssetProvisioningUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.AssetProvisioningUpdateInput, Prisma.AssetProvisioningUncheckedUpdateInput>;
};
export type AssetProvisioningDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssetProvisioningSelect<ExtArgs> | null;
    omit?: Prisma.AssetProvisioningOmit<ExtArgs> | null;
    include?: Prisma.AssetProvisioningInclude<ExtArgs> | null;
    where: Prisma.AssetProvisioningWhereUniqueInput;
};
export type AssetProvisioningDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssetProvisioningWhereInput;
    limit?: number;
};
export type AssetProvisioningDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssetProvisioningSelect<ExtArgs> | null;
    omit?: Prisma.AssetProvisioningOmit<ExtArgs> | null;
    include?: Prisma.AssetProvisioningInclude<ExtArgs> | null;
};
export {};
