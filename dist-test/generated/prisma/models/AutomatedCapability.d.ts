import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type AutomatedCapabilityModel = runtime.Types.Result.DefaultSelection<Prisma.$AutomatedCapabilityPayload>;
export type AggregateAutomatedCapability = {
    _count: AutomatedCapabilityCountAggregateOutputType | null;
    _min: AutomatedCapabilityMinAggregateOutputType | null;
    _max: AutomatedCapabilityMaxAggregateOutputType | null;
};
export type AutomatedCapabilityMinAggregateOutputType = {
    id: string | null;
    catalogCode: string | null;
    category: string | null;
    method: string | null;
    provider: string | null;
    baseFrequency: string | null;
    generatedEvidence: string | null;
};
export type AutomatedCapabilityMaxAggregateOutputType = {
    id: string | null;
    catalogCode: string | null;
    category: string | null;
    method: string | null;
    provider: string | null;
    baseFrequency: string | null;
    generatedEvidence: string | null;
};
export type AutomatedCapabilityCountAggregateOutputType = {
    id: number;
    catalogCode: number;
    category: number;
    supportedPlatforms: number;
    method: number;
    requiredPermissions: number;
    provider: number;
    baseFrequency: number;
    generatedEvidence: number;
    _all: number;
};
export type AutomatedCapabilityMinAggregateInputType = {
    id?: true;
    catalogCode?: true;
    category?: true;
    method?: true;
    provider?: true;
    baseFrequency?: true;
    generatedEvidence?: true;
};
export type AutomatedCapabilityMaxAggregateInputType = {
    id?: true;
    catalogCode?: true;
    category?: true;
    method?: true;
    provider?: true;
    baseFrequency?: true;
    generatedEvidence?: true;
};
export type AutomatedCapabilityCountAggregateInputType = {
    id?: true;
    catalogCode?: true;
    category?: true;
    supportedPlatforms?: true;
    method?: true;
    requiredPermissions?: true;
    provider?: true;
    baseFrequency?: true;
    generatedEvidence?: true;
    _all?: true;
};
export type AutomatedCapabilityAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AutomatedCapabilityWhereInput;
    orderBy?: Prisma.AutomatedCapabilityOrderByWithRelationInput | Prisma.AutomatedCapabilityOrderByWithRelationInput[];
    cursor?: Prisma.AutomatedCapabilityWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | AutomatedCapabilityCountAggregateInputType;
    _min?: AutomatedCapabilityMinAggregateInputType;
    _max?: AutomatedCapabilityMaxAggregateInputType;
};
export type GetAutomatedCapabilityAggregateType<T extends AutomatedCapabilityAggregateArgs> = {
    [P in keyof T & keyof AggregateAutomatedCapability]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAutomatedCapability[P]> : Prisma.GetScalarType<T[P], AggregateAutomatedCapability[P]>;
};
export type AutomatedCapabilityGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AutomatedCapabilityWhereInput;
    orderBy?: Prisma.AutomatedCapabilityOrderByWithAggregationInput | Prisma.AutomatedCapabilityOrderByWithAggregationInput[];
    by: Prisma.AutomatedCapabilityScalarFieldEnum[] | Prisma.AutomatedCapabilityScalarFieldEnum;
    having?: Prisma.AutomatedCapabilityScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AutomatedCapabilityCountAggregateInputType | true;
    _min?: AutomatedCapabilityMinAggregateInputType;
    _max?: AutomatedCapabilityMaxAggregateInputType;
};
export type AutomatedCapabilityGroupByOutputType = {
    id: string;
    catalogCode: string;
    category: string;
    supportedPlatforms: runtime.JsonValue;
    method: string;
    requiredPermissions: runtime.JsonValue;
    provider: string;
    baseFrequency: string;
    generatedEvidence: string;
    _count: AutomatedCapabilityCountAggregateOutputType | null;
    _min: AutomatedCapabilityMinAggregateOutputType | null;
    _max: AutomatedCapabilityMaxAggregateOutputType | null;
};
type GetAutomatedCapabilityGroupByPayload<T extends AutomatedCapabilityGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AutomatedCapabilityGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AutomatedCapabilityGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AutomatedCapabilityGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AutomatedCapabilityGroupByOutputType[P]>;
}>>;
export type AutomatedCapabilityWhereInput = {
    AND?: Prisma.AutomatedCapabilityWhereInput | Prisma.AutomatedCapabilityWhereInput[];
    OR?: Prisma.AutomatedCapabilityWhereInput[];
    NOT?: Prisma.AutomatedCapabilityWhereInput | Prisma.AutomatedCapabilityWhereInput[];
    id?: Prisma.UuidFilter<"AutomatedCapability"> | string;
    catalogCode?: Prisma.StringFilter<"AutomatedCapability"> | string;
    category?: Prisma.StringFilter<"AutomatedCapability"> | string;
    supportedPlatforms?: Prisma.JsonFilter<"AutomatedCapability">;
    method?: Prisma.StringFilter<"AutomatedCapability"> | string;
    requiredPermissions?: Prisma.JsonFilter<"AutomatedCapability">;
    provider?: Prisma.StringFilter<"AutomatedCapability"> | string;
    baseFrequency?: Prisma.StringFilter<"AutomatedCapability"> | string;
    generatedEvidence?: Prisma.StringFilter<"AutomatedCapability"> | string;
    monitoringDomains?: Prisma.MonitoringDomainCapabilityListRelationFilter;
    assetProvisionings?: Prisma.AssetProvisioningListRelationFilter;
};
export type AutomatedCapabilityOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    catalogCode?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    supportedPlatforms?: Prisma.SortOrder;
    method?: Prisma.SortOrder;
    requiredPermissions?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    baseFrequency?: Prisma.SortOrder;
    generatedEvidence?: Prisma.SortOrder;
    monitoringDomains?: Prisma.MonitoringDomainCapabilityOrderByRelationAggregateInput;
    assetProvisionings?: Prisma.AssetProvisioningOrderByRelationAggregateInput;
};
export type AutomatedCapabilityWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    catalogCode?: string;
    AND?: Prisma.AutomatedCapabilityWhereInput | Prisma.AutomatedCapabilityWhereInput[];
    OR?: Prisma.AutomatedCapabilityWhereInput[];
    NOT?: Prisma.AutomatedCapabilityWhereInput | Prisma.AutomatedCapabilityWhereInput[];
    category?: Prisma.StringFilter<"AutomatedCapability"> | string;
    supportedPlatforms?: Prisma.JsonFilter<"AutomatedCapability">;
    method?: Prisma.StringFilter<"AutomatedCapability"> | string;
    requiredPermissions?: Prisma.JsonFilter<"AutomatedCapability">;
    provider?: Prisma.StringFilter<"AutomatedCapability"> | string;
    baseFrequency?: Prisma.StringFilter<"AutomatedCapability"> | string;
    generatedEvidence?: Prisma.StringFilter<"AutomatedCapability"> | string;
    monitoringDomains?: Prisma.MonitoringDomainCapabilityListRelationFilter;
    assetProvisionings?: Prisma.AssetProvisioningListRelationFilter;
}, "id" | "catalogCode">;
export type AutomatedCapabilityOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    catalogCode?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    supportedPlatforms?: Prisma.SortOrder;
    method?: Prisma.SortOrder;
    requiredPermissions?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    baseFrequency?: Prisma.SortOrder;
    generatedEvidence?: Prisma.SortOrder;
    _count?: Prisma.AutomatedCapabilityCountOrderByAggregateInput;
    _max?: Prisma.AutomatedCapabilityMaxOrderByAggregateInput;
    _min?: Prisma.AutomatedCapabilityMinOrderByAggregateInput;
};
export type AutomatedCapabilityScalarWhereWithAggregatesInput = {
    AND?: Prisma.AutomatedCapabilityScalarWhereWithAggregatesInput | Prisma.AutomatedCapabilityScalarWhereWithAggregatesInput[];
    OR?: Prisma.AutomatedCapabilityScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AutomatedCapabilityScalarWhereWithAggregatesInput | Prisma.AutomatedCapabilityScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"AutomatedCapability"> | string;
    catalogCode?: Prisma.StringWithAggregatesFilter<"AutomatedCapability"> | string;
    category?: Prisma.StringWithAggregatesFilter<"AutomatedCapability"> | string;
    supportedPlatforms?: Prisma.JsonWithAggregatesFilter<"AutomatedCapability">;
    method?: Prisma.StringWithAggregatesFilter<"AutomatedCapability"> | string;
    requiredPermissions?: Prisma.JsonWithAggregatesFilter<"AutomatedCapability">;
    provider?: Prisma.StringWithAggregatesFilter<"AutomatedCapability"> | string;
    baseFrequency?: Prisma.StringWithAggregatesFilter<"AutomatedCapability"> | string;
    generatedEvidence?: Prisma.StringWithAggregatesFilter<"AutomatedCapability"> | string;
};
export type AutomatedCapabilityCreateInput = {
    id?: string;
    catalogCode: string;
    category: string;
    supportedPlatforms: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method: string;
    requiredPermissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider: string;
    baseFrequency: string;
    generatedEvidence: string;
    monitoringDomains?: Prisma.MonitoringDomainCapabilityCreateNestedManyWithoutAutomatedCapabilityInput;
    assetProvisionings?: Prisma.AssetProvisioningCreateNestedManyWithoutAutomatedCapabilityInput;
};
export type AutomatedCapabilityUncheckedCreateInput = {
    id?: string;
    catalogCode: string;
    category: string;
    supportedPlatforms: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method: string;
    requiredPermissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider: string;
    baseFrequency: string;
    generatedEvidence: string;
    monitoringDomains?: Prisma.MonitoringDomainCapabilityUncheckedCreateNestedManyWithoutAutomatedCapabilityInput;
    assetProvisionings?: Prisma.AssetProvisioningUncheckedCreateNestedManyWithoutAutomatedCapabilityInput;
};
export type AutomatedCapabilityUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogCode?: Prisma.StringFieldUpdateOperationsInput | string;
    category?: Prisma.StringFieldUpdateOperationsInput | string;
    supportedPlatforms?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method?: Prisma.StringFieldUpdateOperationsInput | string;
    requiredPermissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    baseFrequency?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomains?: Prisma.MonitoringDomainCapabilityUpdateManyWithoutAutomatedCapabilityNestedInput;
    assetProvisionings?: Prisma.AssetProvisioningUpdateManyWithoutAutomatedCapabilityNestedInput;
};
export type AutomatedCapabilityUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogCode?: Prisma.StringFieldUpdateOperationsInput | string;
    category?: Prisma.StringFieldUpdateOperationsInput | string;
    supportedPlatforms?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method?: Prisma.StringFieldUpdateOperationsInput | string;
    requiredPermissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    baseFrequency?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomains?: Prisma.MonitoringDomainCapabilityUncheckedUpdateManyWithoutAutomatedCapabilityNestedInput;
    assetProvisionings?: Prisma.AssetProvisioningUncheckedUpdateManyWithoutAutomatedCapabilityNestedInput;
};
export type AutomatedCapabilityCreateManyInput = {
    id?: string;
    catalogCode: string;
    category: string;
    supportedPlatforms: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method: string;
    requiredPermissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider: string;
    baseFrequency: string;
    generatedEvidence: string;
};
export type AutomatedCapabilityUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogCode?: Prisma.StringFieldUpdateOperationsInput | string;
    category?: Prisma.StringFieldUpdateOperationsInput | string;
    supportedPlatforms?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method?: Prisma.StringFieldUpdateOperationsInput | string;
    requiredPermissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    baseFrequency?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type AutomatedCapabilityUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogCode?: Prisma.StringFieldUpdateOperationsInput | string;
    category?: Prisma.StringFieldUpdateOperationsInput | string;
    supportedPlatforms?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method?: Prisma.StringFieldUpdateOperationsInput | string;
    requiredPermissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    baseFrequency?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type AutomatedCapabilityCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    catalogCode?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    supportedPlatforms?: Prisma.SortOrder;
    method?: Prisma.SortOrder;
    requiredPermissions?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    baseFrequency?: Prisma.SortOrder;
    generatedEvidence?: Prisma.SortOrder;
};
export type AutomatedCapabilityMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    catalogCode?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    method?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    baseFrequency?: Prisma.SortOrder;
    generatedEvidence?: Prisma.SortOrder;
};
export type AutomatedCapabilityMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    catalogCode?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    method?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    baseFrequency?: Prisma.SortOrder;
    generatedEvidence?: Prisma.SortOrder;
};
export type AutomatedCapabilityScalarRelationFilter = {
    is?: Prisma.AutomatedCapabilityWhereInput;
    isNot?: Prisma.AutomatedCapabilityWhereInput;
};
export type AutomatedCapabilityCreateNestedOneWithoutMonitoringDomainsInput = {
    create?: Prisma.XOR<Prisma.AutomatedCapabilityCreateWithoutMonitoringDomainsInput, Prisma.AutomatedCapabilityUncheckedCreateWithoutMonitoringDomainsInput>;
    connectOrCreate?: Prisma.AutomatedCapabilityCreateOrConnectWithoutMonitoringDomainsInput;
    connect?: Prisma.AutomatedCapabilityWhereUniqueInput;
};
export type AutomatedCapabilityUpdateOneRequiredWithoutMonitoringDomainsNestedInput = {
    create?: Prisma.XOR<Prisma.AutomatedCapabilityCreateWithoutMonitoringDomainsInput, Prisma.AutomatedCapabilityUncheckedCreateWithoutMonitoringDomainsInput>;
    connectOrCreate?: Prisma.AutomatedCapabilityCreateOrConnectWithoutMonitoringDomainsInput;
    upsert?: Prisma.AutomatedCapabilityUpsertWithoutMonitoringDomainsInput;
    connect?: Prisma.AutomatedCapabilityWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.AutomatedCapabilityUpdateToOneWithWhereWithoutMonitoringDomainsInput, Prisma.AutomatedCapabilityUpdateWithoutMonitoringDomainsInput>, Prisma.AutomatedCapabilityUncheckedUpdateWithoutMonitoringDomainsInput>;
};
export type AutomatedCapabilityCreateNestedOneWithoutAssetProvisioningsInput = {
    create?: Prisma.XOR<Prisma.AutomatedCapabilityCreateWithoutAssetProvisioningsInput, Prisma.AutomatedCapabilityUncheckedCreateWithoutAssetProvisioningsInput>;
    connectOrCreate?: Prisma.AutomatedCapabilityCreateOrConnectWithoutAssetProvisioningsInput;
    connect?: Prisma.AutomatedCapabilityWhereUniqueInput;
};
export type AutomatedCapabilityUpdateOneRequiredWithoutAssetProvisioningsNestedInput = {
    create?: Prisma.XOR<Prisma.AutomatedCapabilityCreateWithoutAssetProvisioningsInput, Prisma.AutomatedCapabilityUncheckedCreateWithoutAssetProvisioningsInput>;
    connectOrCreate?: Prisma.AutomatedCapabilityCreateOrConnectWithoutAssetProvisioningsInput;
    upsert?: Prisma.AutomatedCapabilityUpsertWithoutAssetProvisioningsInput;
    connect?: Prisma.AutomatedCapabilityWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.AutomatedCapabilityUpdateToOneWithWhereWithoutAssetProvisioningsInput, Prisma.AutomatedCapabilityUpdateWithoutAssetProvisioningsInput>, Prisma.AutomatedCapabilityUncheckedUpdateWithoutAssetProvisioningsInput>;
};
export type AutomatedCapabilityCreateWithoutMonitoringDomainsInput = {
    id?: string;
    catalogCode: string;
    category: string;
    supportedPlatforms: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method: string;
    requiredPermissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider: string;
    baseFrequency: string;
    generatedEvidence: string;
    assetProvisionings?: Prisma.AssetProvisioningCreateNestedManyWithoutAutomatedCapabilityInput;
};
export type AutomatedCapabilityUncheckedCreateWithoutMonitoringDomainsInput = {
    id?: string;
    catalogCode: string;
    category: string;
    supportedPlatforms: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method: string;
    requiredPermissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider: string;
    baseFrequency: string;
    generatedEvidence: string;
    assetProvisionings?: Prisma.AssetProvisioningUncheckedCreateNestedManyWithoutAutomatedCapabilityInput;
};
export type AutomatedCapabilityCreateOrConnectWithoutMonitoringDomainsInput = {
    where: Prisma.AutomatedCapabilityWhereUniqueInput;
    create: Prisma.XOR<Prisma.AutomatedCapabilityCreateWithoutMonitoringDomainsInput, Prisma.AutomatedCapabilityUncheckedCreateWithoutMonitoringDomainsInput>;
};
export type AutomatedCapabilityUpsertWithoutMonitoringDomainsInput = {
    update: Prisma.XOR<Prisma.AutomatedCapabilityUpdateWithoutMonitoringDomainsInput, Prisma.AutomatedCapabilityUncheckedUpdateWithoutMonitoringDomainsInput>;
    create: Prisma.XOR<Prisma.AutomatedCapabilityCreateWithoutMonitoringDomainsInput, Prisma.AutomatedCapabilityUncheckedCreateWithoutMonitoringDomainsInput>;
    where?: Prisma.AutomatedCapabilityWhereInput;
};
export type AutomatedCapabilityUpdateToOneWithWhereWithoutMonitoringDomainsInput = {
    where?: Prisma.AutomatedCapabilityWhereInput;
    data: Prisma.XOR<Prisma.AutomatedCapabilityUpdateWithoutMonitoringDomainsInput, Prisma.AutomatedCapabilityUncheckedUpdateWithoutMonitoringDomainsInput>;
};
export type AutomatedCapabilityUpdateWithoutMonitoringDomainsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogCode?: Prisma.StringFieldUpdateOperationsInput | string;
    category?: Prisma.StringFieldUpdateOperationsInput | string;
    supportedPlatforms?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method?: Prisma.StringFieldUpdateOperationsInput | string;
    requiredPermissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    baseFrequency?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
    assetProvisionings?: Prisma.AssetProvisioningUpdateManyWithoutAutomatedCapabilityNestedInput;
};
export type AutomatedCapabilityUncheckedUpdateWithoutMonitoringDomainsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogCode?: Prisma.StringFieldUpdateOperationsInput | string;
    category?: Prisma.StringFieldUpdateOperationsInput | string;
    supportedPlatforms?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method?: Prisma.StringFieldUpdateOperationsInput | string;
    requiredPermissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    baseFrequency?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
    assetProvisionings?: Prisma.AssetProvisioningUncheckedUpdateManyWithoutAutomatedCapabilityNestedInput;
};
export type AutomatedCapabilityCreateWithoutAssetProvisioningsInput = {
    id?: string;
    catalogCode: string;
    category: string;
    supportedPlatforms: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method: string;
    requiredPermissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider: string;
    baseFrequency: string;
    generatedEvidence: string;
    monitoringDomains?: Prisma.MonitoringDomainCapabilityCreateNestedManyWithoutAutomatedCapabilityInput;
};
export type AutomatedCapabilityUncheckedCreateWithoutAssetProvisioningsInput = {
    id?: string;
    catalogCode: string;
    category: string;
    supportedPlatforms: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method: string;
    requiredPermissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider: string;
    baseFrequency: string;
    generatedEvidence: string;
    monitoringDomains?: Prisma.MonitoringDomainCapabilityUncheckedCreateNestedManyWithoutAutomatedCapabilityInput;
};
export type AutomatedCapabilityCreateOrConnectWithoutAssetProvisioningsInput = {
    where: Prisma.AutomatedCapabilityWhereUniqueInput;
    create: Prisma.XOR<Prisma.AutomatedCapabilityCreateWithoutAssetProvisioningsInput, Prisma.AutomatedCapabilityUncheckedCreateWithoutAssetProvisioningsInput>;
};
export type AutomatedCapabilityUpsertWithoutAssetProvisioningsInput = {
    update: Prisma.XOR<Prisma.AutomatedCapabilityUpdateWithoutAssetProvisioningsInput, Prisma.AutomatedCapabilityUncheckedUpdateWithoutAssetProvisioningsInput>;
    create: Prisma.XOR<Prisma.AutomatedCapabilityCreateWithoutAssetProvisioningsInput, Prisma.AutomatedCapabilityUncheckedCreateWithoutAssetProvisioningsInput>;
    where?: Prisma.AutomatedCapabilityWhereInput;
};
export type AutomatedCapabilityUpdateToOneWithWhereWithoutAssetProvisioningsInput = {
    where?: Prisma.AutomatedCapabilityWhereInput;
    data: Prisma.XOR<Prisma.AutomatedCapabilityUpdateWithoutAssetProvisioningsInput, Prisma.AutomatedCapabilityUncheckedUpdateWithoutAssetProvisioningsInput>;
};
export type AutomatedCapabilityUpdateWithoutAssetProvisioningsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogCode?: Prisma.StringFieldUpdateOperationsInput | string;
    category?: Prisma.StringFieldUpdateOperationsInput | string;
    supportedPlatforms?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method?: Prisma.StringFieldUpdateOperationsInput | string;
    requiredPermissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    baseFrequency?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomains?: Prisma.MonitoringDomainCapabilityUpdateManyWithoutAutomatedCapabilityNestedInput;
};
export type AutomatedCapabilityUncheckedUpdateWithoutAssetProvisioningsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    catalogCode?: Prisma.StringFieldUpdateOperationsInput | string;
    category?: Prisma.StringFieldUpdateOperationsInput | string;
    supportedPlatforms?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    method?: Prisma.StringFieldUpdateOperationsInput | string;
    requiredPermissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    baseFrequency?: Prisma.StringFieldUpdateOperationsInput | string;
    generatedEvidence?: Prisma.StringFieldUpdateOperationsInput | string;
    monitoringDomains?: Prisma.MonitoringDomainCapabilityUncheckedUpdateManyWithoutAutomatedCapabilityNestedInput;
};
export type AutomatedCapabilityCountOutputType = {
    monitoringDomains: number;
    assetProvisionings: number;
};
export type AutomatedCapabilityCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    monitoringDomains?: boolean | AutomatedCapabilityCountOutputTypeCountMonitoringDomainsArgs;
    assetProvisionings?: boolean | AutomatedCapabilityCountOutputTypeCountAssetProvisioningsArgs;
};
export type AutomatedCapabilityCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AutomatedCapabilityCountOutputTypeSelect<ExtArgs> | null;
};
export type AutomatedCapabilityCountOutputTypeCountMonitoringDomainsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MonitoringDomainCapabilityWhereInput;
};
export type AutomatedCapabilityCountOutputTypeCountAssetProvisioningsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssetProvisioningWhereInput;
};
export type AutomatedCapabilitySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    catalogCode?: boolean;
    category?: boolean;
    supportedPlatforms?: boolean;
    method?: boolean;
    requiredPermissions?: boolean;
    provider?: boolean;
    baseFrequency?: boolean;
    generatedEvidence?: boolean;
    monitoringDomains?: boolean | Prisma.AutomatedCapability$monitoringDomainsArgs<ExtArgs>;
    assetProvisionings?: boolean | Prisma.AutomatedCapability$assetProvisioningsArgs<ExtArgs>;
    _count?: boolean | Prisma.AutomatedCapabilityCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["automatedCapability"]>;
export type AutomatedCapabilitySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    catalogCode?: boolean;
    category?: boolean;
    supportedPlatforms?: boolean;
    method?: boolean;
    requiredPermissions?: boolean;
    provider?: boolean;
    baseFrequency?: boolean;
    generatedEvidence?: boolean;
}, ExtArgs["result"]["automatedCapability"]>;
export type AutomatedCapabilitySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    catalogCode?: boolean;
    category?: boolean;
    supportedPlatforms?: boolean;
    method?: boolean;
    requiredPermissions?: boolean;
    provider?: boolean;
    baseFrequency?: boolean;
    generatedEvidence?: boolean;
}, ExtArgs["result"]["automatedCapability"]>;
export type AutomatedCapabilitySelectScalar = {
    id?: boolean;
    catalogCode?: boolean;
    category?: boolean;
    supportedPlatforms?: boolean;
    method?: boolean;
    requiredPermissions?: boolean;
    provider?: boolean;
    baseFrequency?: boolean;
    generatedEvidence?: boolean;
};
export type AutomatedCapabilityOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "catalogCode" | "category" | "supportedPlatforms" | "method" | "requiredPermissions" | "provider" | "baseFrequency" | "generatedEvidence", ExtArgs["result"]["automatedCapability"]>;
export type AutomatedCapabilityInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    monitoringDomains?: boolean | Prisma.AutomatedCapability$monitoringDomainsArgs<ExtArgs>;
    assetProvisionings?: boolean | Prisma.AutomatedCapability$assetProvisioningsArgs<ExtArgs>;
    _count?: boolean | Prisma.AutomatedCapabilityCountOutputTypeDefaultArgs<ExtArgs>;
};
export type AutomatedCapabilityIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type AutomatedCapabilityIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $AutomatedCapabilityPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "AutomatedCapability";
    objects: {
        monitoringDomains: Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>[];
        assetProvisionings: Prisma.$AssetProvisioningPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        catalogCode: string;
        category: string;
        supportedPlatforms: runtime.JsonValue;
        method: string;
        requiredPermissions: runtime.JsonValue;
        provider: string;
        baseFrequency: string;
        generatedEvidence: string;
    }, ExtArgs["result"]["automatedCapability"]>;
    composites: {};
};
export type AutomatedCapabilityGetPayload<S extends boolean | null | undefined | AutomatedCapabilityDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AutomatedCapabilityPayload, S>;
export type AutomatedCapabilityCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AutomatedCapabilityFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AutomatedCapabilityCountAggregateInputType | true;
};
export interface AutomatedCapabilityDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['AutomatedCapability'];
        meta: {
            name: 'AutomatedCapability';
        };
    };
    findUnique<T extends AutomatedCapabilityFindUniqueArgs>(args: Prisma.SelectSubset<T, AutomatedCapabilityFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AutomatedCapabilityClient<runtime.Types.Result.GetResult<Prisma.$AutomatedCapabilityPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends AutomatedCapabilityFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AutomatedCapabilityFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AutomatedCapabilityClient<runtime.Types.Result.GetResult<Prisma.$AutomatedCapabilityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends AutomatedCapabilityFindFirstArgs>(args?: Prisma.SelectSubset<T, AutomatedCapabilityFindFirstArgs<ExtArgs>>): Prisma.Prisma__AutomatedCapabilityClient<runtime.Types.Result.GetResult<Prisma.$AutomatedCapabilityPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends AutomatedCapabilityFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AutomatedCapabilityFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AutomatedCapabilityClient<runtime.Types.Result.GetResult<Prisma.$AutomatedCapabilityPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends AutomatedCapabilityFindManyArgs>(args?: Prisma.SelectSubset<T, AutomatedCapabilityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AutomatedCapabilityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends AutomatedCapabilityCreateArgs>(args: Prisma.SelectSubset<T, AutomatedCapabilityCreateArgs<ExtArgs>>): Prisma.Prisma__AutomatedCapabilityClient<runtime.Types.Result.GetResult<Prisma.$AutomatedCapabilityPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends AutomatedCapabilityCreateManyArgs>(args?: Prisma.SelectSubset<T, AutomatedCapabilityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends AutomatedCapabilityCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AutomatedCapabilityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AutomatedCapabilityPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends AutomatedCapabilityDeleteArgs>(args: Prisma.SelectSubset<T, AutomatedCapabilityDeleteArgs<ExtArgs>>): Prisma.Prisma__AutomatedCapabilityClient<runtime.Types.Result.GetResult<Prisma.$AutomatedCapabilityPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends AutomatedCapabilityUpdateArgs>(args: Prisma.SelectSubset<T, AutomatedCapabilityUpdateArgs<ExtArgs>>): Prisma.Prisma__AutomatedCapabilityClient<runtime.Types.Result.GetResult<Prisma.$AutomatedCapabilityPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends AutomatedCapabilityDeleteManyArgs>(args?: Prisma.SelectSubset<T, AutomatedCapabilityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends AutomatedCapabilityUpdateManyArgs>(args: Prisma.SelectSubset<T, AutomatedCapabilityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends AutomatedCapabilityUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AutomatedCapabilityUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AutomatedCapabilityPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends AutomatedCapabilityUpsertArgs>(args: Prisma.SelectSubset<T, AutomatedCapabilityUpsertArgs<ExtArgs>>): Prisma.Prisma__AutomatedCapabilityClient<runtime.Types.Result.GetResult<Prisma.$AutomatedCapabilityPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends AutomatedCapabilityCountArgs>(args?: Prisma.Subset<T, AutomatedCapabilityCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AutomatedCapabilityCountAggregateOutputType> : number>;
    aggregate<T extends AutomatedCapabilityAggregateArgs>(args: Prisma.Subset<T, AutomatedCapabilityAggregateArgs>): Prisma.PrismaPromise<GetAutomatedCapabilityAggregateType<T>>;
    groupBy<T extends AutomatedCapabilityGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AutomatedCapabilityGroupByArgs['orderBy'];
    } : {
        orderBy?: AutomatedCapabilityGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AutomatedCapabilityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAutomatedCapabilityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: AutomatedCapabilityFieldRefs;
}
export interface Prisma__AutomatedCapabilityClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    monitoringDomains<T extends Prisma.AutomatedCapability$monitoringDomainsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.AutomatedCapability$monitoringDomainsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MonitoringDomainCapabilityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    assetProvisionings<T extends Prisma.AutomatedCapability$assetProvisioningsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.AutomatedCapability$assetProvisioningsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssetProvisioningPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface AutomatedCapabilityFieldRefs {
    readonly id: Prisma.FieldRef<"AutomatedCapability", 'String'>;
    readonly catalogCode: Prisma.FieldRef<"AutomatedCapability", 'String'>;
    readonly category: Prisma.FieldRef<"AutomatedCapability", 'String'>;
    readonly supportedPlatforms: Prisma.FieldRef<"AutomatedCapability", 'Json'>;
    readonly method: Prisma.FieldRef<"AutomatedCapability", 'String'>;
    readonly requiredPermissions: Prisma.FieldRef<"AutomatedCapability", 'Json'>;
    readonly provider: Prisma.FieldRef<"AutomatedCapability", 'String'>;
    readonly baseFrequency: Prisma.FieldRef<"AutomatedCapability", 'String'>;
    readonly generatedEvidence: Prisma.FieldRef<"AutomatedCapability", 'String'>;
}
export type AutomatedCapabilityFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AutomatedCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.AutomatedCapabilityOmit<ExtArgs> | null;
    include?: Prisma.AutomatedCapabilityInclude<ExtArgs> | null;
    where: Prisma.AutomatedCapabilityWhereUniqueInput;
};
export type AutomatedCapabilityFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AutomatedCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.AutomatedCapabilityOmit<ExtArgs> | null;
    include?: Prisma.AutomatedCapabilityInclude<ExtArgs> | null;
    where: Prisma.AutomatedCapabilityWhereUniqueInput;
};
export type AutomatedCapabilityFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AutomatedCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.AutomatedCapabilityOmit<ExtArgs> | null;
    include?: Prisma.AutomatedCapabilityInclude<ExtArgs> | null;
    where?: Prisma.AutomatedCapabilityWhereInput;
    orderBy?: Prisma.AutomatedCapabilityOrderByWithRelationInput | Prisma.AutomatedCapabilityOrderByWithRelationInput[];
    cursor?: Prisma.AutomatedCapabilityWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AutomatedCapabilityScalarFieldEnum | Prisma.AutomatedCapabilityScalarFieldEnum[];
};
export type AutomatedCapabilityFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AutomatedCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.AutomatedCapabilityOmit<ExtArgs> | null;
    include?: Prisma.AutomatedCapabilityInclude<ExtArgs> | null;
    where?: Prisma.AutomatedCapabilityWhereInput;
    orderBy?: Prisma.AutomatedCapabilityOrderByWithRelationInput | Prisma.AutomatedCapabilityOrderByWithRelationInput[];
    cursor?: Prisma.AutomatedCapabilityWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AutomatedCapabilityScalarFieldEnum | Prisma.AutomatedCapabilityScalarFieldEnum[];
};
export type AutomatedCapabilityFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AutomatedCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.AutomatedCapabilityOmit<ExtArgs> | null;
    include?: Prisma.AutomatedCapabilityInclude<ExtArgs> | null;
    where?: Prisma.AutomatedCapabilityWhereInput;
    orderBy?: Prisma.AutomatedCapabilityOrderByWithRelationInput | Prisma.AutomatedCapabilityOrderByWithRelationInput[];
    cursor?: Prisma.AutomatedCapabilityWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AutomatedCapabilityScalarFieldEnum | Prisma.AutomatedCapabilityScalarFieldEnum[];
};
export type AutomatedCapabilityCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AutomatedCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.AutomatedCapabilityOmit<ExtArgs> | null;
    include?: Prisma.AutomatedCapabilityInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AutomatedCapabilityCreateInput, Prisma.AutomatedCapabilityUncheckedCreateInput>;
};
export type AutomatedCapabilityCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.AutomatedCapabilityCreateManyInput | Prisma.AutomatedCapabilityCreateManyInput[];
    skipDuplicates?: boolean;
};
export type AutomatedCapabilityCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AutomatedCapabilitySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AutomatedCapabilityOmit<ExtArgs> | null;
    data: Prisma.AutomatedCapabilityCreateManyInput | Prisma.AutomatedCapabilityCreateManyInput[];
    skipDuplicates?: boolean;
};
export type AutomatedCapabilityUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AutomatedCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.AutomatedCapabilityOmit<ExtArgs> | null;
    include?: Prisma.AutomatedCapabilityInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AutomatedCapabilityUpdateInput, Prisma.AutomatedCapabilityUncheckedUpdateInput>;
    where: Prisma.AutomatedCapabilityWhereUniqueInput;
};
export type AutomatedCapabilityUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.AutomatedCapabilityUpdateManyMutationInput, Prisma.AutomatedCapabilityUncheckedUpdateManyInput>;
    where?: Prisma.AutomatedCapabilityWhereInput;
    limit?: number;
};
export type AutomatedCapabilityUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AutomatedCapabilitySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AutomatedCapabilityOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AutomatedCapabilityUpdateManyMutationInput, Prisma.AutomatedCapabilityUncheckedUpdateManyInput>;
    where?: Prisma.AutomatedCapabilityWhereInput;
    limit?: number;
};
export type AutomatedCapabilityUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AutomatedCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.AutomatedCapabilityOmit<ExtArgs> | null;
    include?: Prisma.AutomatedCapabilityInclude<ExtArgs> | null;
    where: Prisma.AutomatedCapabilityWhereUniqueInput;
    create: Prisma.XOR<Prisma.AutomatedCapabilityCreateInput, Prisma.AutomatedCapabilityUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.AutomatedCapabilityUpdateInput, Prisma.AutomatedCapabilityUncheckedUpdateInput>;
};
export type AutomatedCapabilityDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AutomatedCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.AutomatedCapabilityOmit<ExtArgs> | null;
    include?: Prisma.AutomatedCapabilityInclude<ExtArgs> | null;
    where: Prisma.AutomatedCapabilityWhereUniqueInput;
};
export type AutomatedCapabilityDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AutomatedCapabilityWhereInput;
    limit?: number;
};
export type AutomatedCapability$monitoringDomainsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MonitoringDomainCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.MonitoringDomainCapabilityOmit<ExtArgs> | null;
    include?: Prisma.MonitoringDomainCapabilityInclude<ExtArgs> | null;
    where?: Prisma.MonitoringDomainCapabilityWhereInput;
    orderBy?: Prisma.MonitoringDomainCapabilityOrderByWithRelationInput | Prisma.MonitoringDomainCapabilityOrderByWithRelationInput[];
    cursor?: Prisma.MonitoringDomainCapabilityWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MonitoringDomainCapabilityScalarFieldEnum | Prisma.MonitoringDomainCapabilityScalarFieldEnum[];
};
export type AutomatedCapability$assetProvisioningsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AutomatedCapabilityDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AutomatedCapabilitySelect<ExtArgs> | null;
    omit?: Prisma.AutomatedCapabilityOmit<ExtArgs> | null;
    include?: Prisma.AutomatedCapabilityInclude<ExtArgs> | null;
};
export {};
