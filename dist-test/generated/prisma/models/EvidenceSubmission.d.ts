import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type EvidenceSubmissionModel = runtime.Types.Result.DefaultSelection<Prisma.$EvidenceSubmissionPayload>;
export type AggregateEvidenceSubmission = {
    _count: EvidenceSubmissionCountAggregateOutputType | null;
    _avg: EvidenceSubmissionAvgAggregateOutputType | null;
    _sum: EvidenceSubmissionSumAggregateOutputType | null;
    _min: EvidenceSubmissionMinAggregateOutputType | null;
    _max: EvidenceSubmissionMaxAggregateOutputType | null;
};
export type EvidenceSubmissionAvgAggregateOutputType = {
    fileSize: number | null;
};
export type EvidenceSubmissionSumAggregateOutputType = {
    fileSize: number | null;
};
export type EvidenceSubmissionMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    evidenceRequirementId: string | null;
    submittedBy: string | null;
    approvedBy: string | null;
    filePath: string | null;
    fileType: string | null;
    fileSize: number | null;
    storageLocation: string | null;
    integrityHash: string | null;
    version: string | null;
    validationStatus: $Enums.EvidenceValidationStatus | null;
    aiVerdict: string | null;
};
export type EvidenceSubmissionMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    evidenceRequirementId: string | null;
    submittedBy: string | null;
    approvedBy: string | null;
    filePath: string | null;
    fileType: string | null;
    fileSize: number | null;
    storageLocation: string | null;
    integrityHash: string | null;
    version: string | null;
    validationStatus: $Enums.EvidenceValidationStatus | null;
    aiVerdict: string | null;
};
export type EvidenceSubmissionCountAggregateOutputType = {
    id: number;
    tenantId: number;
    evidenceRequirementId: number;
    submittedBy: number;
    approvedBy: number;
    filePath: number;
    fileType: number;
    fileSize: number;
    storageLocation: number;
    integrityHash: number;
    version: number;
    validationStatus: number;
    aiVerdict: number;
    _all: number;
};
export type EvidenceSubmissionAvgAggregateInputType = {
    fileSize?: true;
};
export type EvidenceSubmissionSumAggregateInputType = {
    fileSize?: true;
};
export type EvidenceSubmissionMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    evidenceRequirementId?: true;
    submittedBy?: true;
    approvedBy?: true;
    filePath?: true;
    fileType?: true;
    fileSize?: true;
    storageLocation?: true;
    integrityHash?: true;
    version?: true;
    validationStatus?: true;
    aiVerdict?: true;
};
export type EvidenceSubmissionMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    evidenceRequirementId?: true;
    submittedBy?: true;
    approvedBy?: true;
    filePath?: true;
    fileType?: true;
    fileSize?: true;
    storageLocation?: true;
    integrityHash?: true;
    version?: true;
    validationStatus?: true;
    aiVerdict?: true;
};
export type EvidenceSubmissionCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    evidenceRequirementId?: true;
    submittedBy?: true;
    approvedBy?: true;
    filePath?: true;
    fileType?: true;
    fileSize?: true;
    storageLocation?: true;
    integrityHash?: true;
    version?: true;
    validationStatus?: true;
    aiVerdict?: true;
    _all?: true;
};
export type EvidenceSubmissionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvidenceSubmissionWhereInput;
    orderBy?: Prisma.EvidenceSubmissionOrderByWithRelationInput | Prisma.EvidenceSubmissionOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceSubmissionWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | EvidenceSubmissionCountAggregateInputType;
    _avg?: EvidenceSubmissionAvgAggregateInputType;
    _sum?: EvidenceSubmissionSumAggregateInputType;
    _min?: EvidenceSubmissionMinAggregateInputType;
    _max?: EvidenceSubmissionMaxAggregateInputType;
};
export type GetEvidenceSubmissionAggregateType<T extends EvidenceSubmissionAggregateArgs> = {
    [P in keyof T & keyof AggregateEvidenceSubmission]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateEvidenceSubmission[P]> : Prisma.GetScalarType<T[P], AggregateEvidenceSubmission[P]>;
};
export type EvidenceSubmissionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvidenceSubmissionWhereInput;
    orderBy?: Prisma.EvidenceSubmissionOrderByWithAggregationInput | Prisma.EvidenceSubmissionOrderByWithAggregationInput[];
    by: Prisma.EvidenceSubmissionScalarFieldEnum[] | Prisma.EvidenceSubmissionScalarFieldEnum;
    having?: Prisma.EvidenceSubmissionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: EvidenceSubmissionCountAggregateInputType | true;
    _avg?: EvidenceSubmissionAvgAggregateInputType;
    _sum?: EvidenceSubmissionSumAggregateInputType;
    _min?: EvidenceSubmissionMinAggregateInputType;
    _max?: EvidenceSubmissionMaxAggregateInputType;
};
export type EvidenceSubmissionGroupByOutputType = {
    id: string;
    tenantId: string;
    evidenceRequirementId: string;
    submittedBy: string;
    approvedBy: string | null;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus: $Enums.EvidenceValidationStatus;
    aiVerdict: string | null;
    _count: EvidenceSubmissionCountAggregateOutputType | null;
    _avg: EvidenceSubmissionAvgAggregateOutputType | null;
    _sum: EvidenceSubmissionSumAggregateOutputType | null;
    _min: EvidenceSubmissionMinAggregateOutputType | null;
    _max: EvidenceSubmissionMaxAggregateOutputType | null;
};
type GetEvidenceSubmissionGroupByPayload<T extends EvidenceSubmissionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<EvidenceSubmissionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof EvidenceSubmissionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], EvidenceSubmissionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], EvidenceSubmissionGroupByOutputType[P]>;
}>>;
export type EvidenceSubmissionWhereInput = {
    AND?: Prisma.EvidenceSubmissionWhereInput | Prisma.EvidenceSubmissionWhereInput[];
    OR?: Prisma.EvidenceSubmissionWhereInput[];
    NOT?: Prisma.EvidenceSubmissionWhereInput | Prisma.EvidenceSubmissionWhereInput[];
    id?: Prisma.UuidFilter<"EvidenceSubmission"> | string;
    tenantId?: Prisma.UuidFilter<"EvidenceSubmission"> | string;
    evidenceRequirementId?: Prisma.UuidFilter<"EvidenceSubmission"> | string;
    submittedBy?: Prisma.UuidFilter<"EvidenceSubmission"> | string;
    approvedBy?: Prisma.UuidNullableFilter<"EvidenceSubmission"> | string | null;
    filePath?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    fileType?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    fileSize?: Prisma.IntFilter<"EvidenceSubmission"> | number;
    storageLocation?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    integrityHash?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    version?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFilter<"EvidenceSubmission"> | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.StringNullableFilter<"EvidenceSubmission"> | string | null;
    evidenceRequirement?: Prisma.XOR<Prisma.EvidenceRequirementScalarRelationFilter, Prisma.EvidenceRequirementWhereInput>;
    submittedByUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    approvedByUser?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type EvidenceSubmissionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    evidenceRequirementId?: Prisma.SortOrder;
    submittedBy?: Prisma.SortOrder;
    approvedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    filePath?: Prisma.SortOrder;
    fileType?: Prisma.SortOrder;
    fileSize?: Prisma.SortOrder;
    storageLocation?: Prisma.SortOrder;
    integrityHash?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    validationStatus?: Prisma.SortOrder;
    aiVerdict?: Prisma.SortOrderInput | Prisma.SortOrder;
    evidenceRequirement?: Prisma.EvidenceRequirementOrderByWithRelationInput;
    submittedByUser?: Prisma.UserOrderByWithRelationInput;
    approvedByUser?: Prisma.UserOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type EvidenceSubmissionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.EvidenceSubmissionWhereInput | Prisma.EvidenceSubmissionWhereInput[];
    OR?: Prisma.EvidenceSubmissionWhereInput[];
    NOT?: Prisma.EvidenceSubmissionWhereInput | Prisma.EvidenceSubmissionWhereInput[];
    tenantId?: Prisma.UuidFilter<"EvidenceSubmission"> | string;
    evidenceRequirementId?: Prisma.UuidFilter<"EvidenceSubmission"> | string;
    submittedBy?: Prisma.UuidFilter<"EvidenceSubmission"> | string;
    approvedBy?: Prisma.UuidNullableFilter<"EvidenceSubmission"> | string | null;
    filePath?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    fileType?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    fileSize?: Prisma.IntFilter<"EvidenceSubmission"> | number;
    storageLocation?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    integrityHash?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    version?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFilter<"EvidenceSubmission"> | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.StringNullableFilter<"EvidenceSubmission"> | string | null;
    evidenceRequirement?: Prisma.XOR<Prisma.EvidenceRequirementScalarRelationFilter, Prisma.EvidenceRequirementWhereInput>;
    submittedByUser?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    approvedByUser?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id">;
export type EvidenceSubmissionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    evidenceRequirementId?: Prisma.SortOrder;
    submittedBy?: Prisma.SortOrder;
    approvedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    filePath?: Prisma.SortOrder;
    fileType?: Prisma.SortOrder;
    fileSize?: Prisma.SortOrder;
    storageLocation?: Prisma.SortOrder;
    integrityHash?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    validationStatus?: Prisma.SortOrder;
    aiVerdict?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.EvidenceSubmissionCountOrderByAggregateInput;
    _avg?: Prisma.EvidenceSubmissionAvgOrderByAggregateInput;
    _max?: Prisma.EvidenceSubmissionMaxOrderByAggregateInput;
    _min?: Prisma.EvidenceSubmissionMinOrderByAggregateInput;
    _sum?: Prisma.EvidenceSubmissionSumOrderByAggregateInput;
};
export type EvidenceSubmissionScalarWhereWithAggregatesInput = {
    AND?: Prisma.EvidenceSubmissionScalarWhereWithAggregatesInput | Prisma.EvidenceSubmissionScalarWhereWithAggregatesInput[];
    OR?: Prisma.EvidenceSubmissionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.EvidenceSubmissionScalarWhereWithAggregatesInput | Prisma.EvidenceSubmissionScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"EvidenceSubmission"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"EvidenceSubmission"> | string;
    evidenceRequirementId?: Prisma.UuidWithAggregatesFilter<"EvidenceSubmission"> | string;
    submittedBy?: Prisma.UuidWithAggregatesFilter<"EvidenceSubmission"> | string;
    approvedBy?: Prisma.UuidNullableWithAggregatesFilter<"EvidenceSubmission"> | string | null;
    filePath?: Prisma.StringWithAggregatesFilter<"EvidenceSubmission"> | string;
    fileType?: Prisma.StringWithAggregatesFilter<"EvidenceSubmission"> | string;
    fileSize?: Prisma.IntWithAggregatesFilter<"EvidenceSubmission"> | number;
    storageLocation?: Prisma.StringWithAggregatesFilter<"EvidenceSubmission"> | string;
    integrityHash?: Prisma.StringWithAggregatesFilter<"EvidenceSubmission"> | string;
    version?: Prisma.StringWithAggregatesFilter<"EvidenceSubmission"> | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusWithAggregatesFilter<"EvidenceSubmission"> | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.StringNullableWithAggregatesFilter<"EvidenceSubmission"> | string | null;
};
export type EvidenceSubmissionCreateInput = {
    id?: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
    evidenceRequirement: Prisma.EvidenceRequirementCreateNestedOneWithoutSubmissionsInput;
    submittedByUser: Prisma.UserCreateNestedOneWithoutEvidenceSubmittedInput;
    approvedByUser?: Prisma.UserCreateNestedOneWithoutEvidenceApprovedInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutEvidenceSubmissionsInput;
};
export type EvidenceSubmissionUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    evidenceRequirementId: string;
    submittedBy: string;
    approvedBy?: string | null;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
};
export type EvidenceSubmissionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    evidenceRequirement?: Prisma.EvidenceRequirementUpdateOneRequiredWithoutSubmissionsNestedInput;
    submittedByUser?: Prisma.UserUpdateOneRequiredWithoutEvidenceSubmittedNestedInput;
    approvedByUser?: Prisma.UserUpdateOneWithoutEvidenceApprovedNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutEvidenceSubmissionsNestedInput;
};
export type EvidenceSubmissionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    evidenceRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
    submittedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceSubmissionCreateManyInput = {
    id?: string;
    tenantId: string;
    evidenceRequirementId: string;
    submittedBy: string;
    approvedBy?: string | null;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
};
export type EvidenceSubmissionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceSubmissionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    evidenceRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
    submittedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceSubmissionListRelationFilter = {
    every?: Prisma.EvidenceSubmissionWhereInput;
    some?: Prisma.EvidenceSubmissionWhereInput;
    none?: Prisma.EvidenceSubmissionWhereInput;
};
export type EvidenceSubmissionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type EvidenceSubmissionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    evidenceRequirementId?: Prisma.SortOrder;
    submittedBy?: Prisma.SortOrder;
    approvedBy?: Prisma.SortOrder;
    filePath?: Prisma.SortOrder;
    fileType?: Prisma.SortOrder;
    fileSize?: Prisma.SortOrder;
    storageLocation?: Prisma.SortOrder;
    integrityHash?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    validationStatus?: Prisma.SortOrder;
    aiVerdict?: Prisma.SortOrder;
};
export type EvidenceSubmissionAvgOrderByAggregateInput = {
    fileSize?: Prisma.SortOrder;
};
export type EvidenceSubmissionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    evidenceRequirementId?: Prisma.SortOrder;
    submittedBy?: Prisma.SortOrder;
    approvedBy?: Prisma.SortOrder;
    filePath?: Prisma.SortOrder;
    fileType?: Prisma.SortOrder;
    fileSize?: Prisma.SortOrder;
    storageLocation?: Prisma.SortOrder;
    integrityHash?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    validationStatus?: Prisma.SortOrder;
    aiVerdict?: Prisma.SortOrder;
};
export type EvidenceSubmissionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    evidenceRequirementId?: Prisma.SortOrder;
    submittedBy?: Prisma.SortOrder;
    approvedBy?: Prisma.SortOrder;
    filePath?: Prisma.SortOrder;
    fileType?: Prisma.SortOrder;
    fileSize?: Prisma.SortOrder;
    storageLocation?: Prisma.SortOrder;
    integrityHash?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    validationStatus?: Prisma.SortOrder;
    aiVerdict?: Prisma.SortOrder;
};
export type EvidenceSubmissionSumOrderByAggregateInput = {
    fileSize?: Prisma.SortOrder;
};
export type EvidenceSubmissionCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutTenantInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutTenantInput> | Prisma.EvidenceSubmissionCreateWithoutTenantInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutTenantInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManyTenantInputEnvelope;
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
};
export type EvidenceSubmissionUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutTenantInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutTenantInput> | Prisma.EvidenceSubmissionCreateWithoutTenantInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutTenantInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManyTenantInputEnvelope;
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
};
export type EvidenceSubmissionUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutTenantInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutTenantInput> | Prisma.EvidenceSubmissionCreateWithoutTenantInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutTenantInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutTenantInput | Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManyTenantInputEnvelope;
    set?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    disconnect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    delete?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    update?: Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutTenantInput | Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutTenantInput | Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.EvidenceSubmissionScalarWhereInput | Prisma.EvidenceSubmissionScalarWhereInput[];
};
export type EvidenceSubmissionUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutTenantInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutTenantInput> | Prisma.EvidenceSubmissionCreateWithoutTenantInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutTenantInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutTenantInput | Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManyTenantInputEnvelope;
    set?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    disconnect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    delete?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    update?: Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutTenantInput | Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutTenantInput | Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.EvidenceSubmissionScalarWhereInput | Prisma.EvidenceSubmissionScalarWhereInput[];
};
export type EvidenceSubmissionCreateNestedManyWithoutSubmittedByUserInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutSubmittedByUserInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutSubmittedByUserInput> | Prisma.EvidenceSubmissionCreateWithoutSubmittedByUserInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutSubmittedByUserInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutSubmittedByUserInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutSubmittedByUserInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManySubmittedByUserInputEnvelope;
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
};
export type EvidenceSubmissionCreateNestedManyWithoutApprovedByUserInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutApprovedByUserInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutApprovedByUserInput> | Prisma.EvidenceSubmissionCreateWithoutApprovedByUserInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutApprovedByUserInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutApprovedByUserInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutApprovedByUserInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManyApprovedByUserInputEnvelope;
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
};
export type EvidenceSubmissionUncheckedCreateNestedManyWithoutSubmittedByUserInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutSubmittedByUserInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutSubmittedByUserInput> | Prisma.EvidenceSubmissionCreateWithoutSubmittedByUserInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutSubmittedByUserInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutSubmittedByUserInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutSubmittedByUserInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManySubmittedByUserInputEnvelope;
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
};
export type EvidenceSubmissionUncheckedCreateNestedManyWithoutApprovedByUserInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutApprovedByUserInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutApprovedByUserInput> | Prisma.EvidenceSubmissionCreateWithoutApprovedByUserInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutApprovedByUserInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutApprovedByUserInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutApprovedByUserInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManyApprovedByUserInputEnvelope;
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
};
export type EvidenceSubmissionUpdateManyWithoutSubmittedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutSubmittedByUserInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutSubmittedByUserInput> | Prisma.EvidenceSubmissionCreateWithoutSubmittedByUserInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutSubmittedByUserInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutSubmittedByUserInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutSubmittedByUserInput[];
    upsert?: Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutSubmittedByUserInput | Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutSubmittedByUserInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManySubmittedByUserInputEnvelope;
    set?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    disconnect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    delete?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    update?: Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutSubmittedByUserInput | Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutSubmittedByUserInput[];
    updateMany?: Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutSubmittedByUserInput | Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutSubmittedByUserInput[];
    deleteMany?: Prisma.EvidenceSubmissionScalarWhereInput | Prisma.EvidenceSubmissionScalarWhereInput[];
};
export type EvidenceSubmissionUpdateManyWithoutApprovedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutApprovedByUserInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutApprovedByUserInput> | Prisma.EvidenceSubmissionCreateWithoutApprovedByUserInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutApprovedByUserInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutApprovedByUserInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutApprovedByUserInput[];
    upsert?: Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutApprovedByUserInput | Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutApprovedByUserInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManyApprovedByUserInputEnvelope;
    set?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    disconnect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    delete?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    update?: Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutApprovedByUserInput | Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutApprovedByUserInput[];
    updateMany?: Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutApprovedByUserInput | Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutApprovedByUserInput[];
    deleteMany?: Prisma.EvidenceSubmissionScalarWhereInput | Prisma.EvidenceSubmissionScalarWhereInput[];
};
export type EvidenceSubmissionUncheckedUpdateManyWithoutSubmittedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutSubmittedByUserInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutSubmittedByUserInput> | Prisma.EvidenceSubmissionCreateWithoutSubmittedByUserInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutSubmittedByUserInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutSubmittedByUserInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutSubmittedByUserInput[];
    upsert?: Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutSubmittedByUserInput | Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutSubmittedByUserInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManySubmittedByUserInputEnvelope;
    set?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    disconnect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    delete?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    update?: Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutSubmittedByUserInput | Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutSubmittedByUserInput[];
    updateMany?: Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutSubmittedByUserInput | Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutSubmittedByUserInput[];
    deleteMany?: Prisma.EvidenceSubmissionScalarWhereInput | Prisma.EvidenceSubmissionScalarWhereInput[];
};
export type EvidenceSubmissionUncheckedUpdateManyWithoutApprovedByUserNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutApprovedByUserInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutApprovedByUserInput> | Prisma.EvidenceSubmissionCreateWithoutApprovedByUserInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutApprovedByUserInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutApprovedByUserInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutApprovedByUserInput[];
    upsert?: Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutApprovedByUserInput | Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutApprovedByUserInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManyApprovedByUserInputEnvelope;
    set?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    disconnect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    delete?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    update?: Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutApprovedByUserInput | Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutApprovedByUserInput[];
    updateMany?: Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutApprovedByUserInput | Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutApprovedByUserInput[];
    deleteMany?: Prisma.EvidenceSubmissionScalarWhereInput | Prisma.EvidenceSubmissionScalarWhereInput[];
};
export type EvidenceSubmissionCreateNestedManyWithoutEvidenceRequirementInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutEvidenceRequirementInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutEvidenceRequirementInput> | Prisma.EvidenceSubmissionCreateWithoutEvidenceRequirementInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutEvidenceRequirementInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutEvidenceRequirementInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutEvidenceRequirementInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManyEvidenceRequirementInputEnvelope;
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
};
export type EvidenceSubmissionUncheckedCreateNestedManyWithoutEvidenceRequirementInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutEvidenceRequirementInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutEvidenceRequirementInput> | Prisma.EvidenceSubmissionCreateWithoutEvidenceRequirementInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutEvidenceRequirementInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutEvidenceRequirementInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutEvidenceRequirementInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManyEvidenceRequirementInputEnvelope;
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
};
export type EvidenceSubmissionUpdateManyWithoutEvidenceRequirementNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutEvidenceRequirementInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutEvidenceRequirementInput> | Prisma.EvidenceSubmissionCreateWithoutEvidenceRequirementInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutEvidenceRequirementInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutEvidenceRequirementInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutEvidenceRequirementInput[];
    upsert?: Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutEvidenceRequirementInput | Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutEvidenceRequirementInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManyEvidenceRequirementInputEnvelope;
    set?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    disconnect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    delete?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    update?: Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutEvidenceRequirementInput | Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutEvidenceRequirementInput[];
    updateMany?: Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutEvidenceRequirementInput | Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutEvidenceRequirementInput[];
    deleteMany?: Prisma.EvidenceSubmissionScalarWhereInput | Prisma.EvidenceSubmissionScalarWhereInput[];
};
export type EvidenceSubmissionUncheckedUpdateManyWithoutEvidenceRequirementNestedInput = {
    create?: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutEvidenceRequirementInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutEvidenceRequirementInput> | Prisma.EvidenceSubmissionCreateWithoutEvidenceRequirementInput[] | Prisma.EvidenceSubmissionUncheckedCreateWithoutEvidenceRequirementInput[];
    connectOrCreate?: Prisma.EvidenceSubmissionCreateOrConnectWithoutEvidenceRequirementInput | Prisma.EvidenceSubmissionCreateOrConnectWithoutEvidenceRequirementInput[];
    upsert?: Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutEvidenceRequirementInput | Prisma.EvidenceSubmissionUpsertWithWhereUniqueWithoutEvidenceRequirementInput[];
    createMany?: Prisma.EvidenceSubmissionCreateManyEvidenceRequirementInputEnvelope;
    set?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    disconnect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    delete?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    connect?: Prisma.EvidenceSubmissionWhereUniqueInput | Prisma.EvidenceSubmissionWhereUniqueInput[];
    update?: Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutEvidenceRequirementInput | Prisma.EvidenceSubmissionUpdateWithWhereUniqueWithoutEvidenceRequirementInput[];
    updateMany?: Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutEvidenceRequirementInput | Prisma.EvidenceSubmissionUpdateManyWithWhereWithoutEvidenceRequirementInput[];
    deleteMany?: Prisma.EvidenceSubmissionScalarWhereInput | Prisma.EvidenceSubmissionScalarWhereInput[];
};
export type EnumEvidenceValidationStatusFieldUpdateOperationsInput = {
    set?: $Enums.EvidenceValidationStatus;
};
export type EvidenceSubmissionCreateWithoutTenantInput = {
    id?: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
    evidenceRequirement: Prisma.EvidenceRequirementCreateNestedOneWithoutSubmissionsInput;
    submittedByUser: Prisma.UserCreateNestedOneWithoutEvidenceSubmittedInput;
    approvedByUser?: Prisma.UserCreateNestedOneWithoutEvidenceApprovedInput;
};
export type EvidenceSubmissionUncheckedCreateWithoutTenantInput = {
    id?: string;
    evidenceRequirementId: string;
    submittedBy: string;
    approvedBy?: string | null;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
};
export type EvidenceSubmissionCreateOrConnectWithoutTenantInput = {
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
    create: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutTenantInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutTenantInput>;
};
export type EvidenceSubmissionCreateManyTenantInputEnvelope = {
    data: Prisma.EvidenceSubmissionCreateManyTenantInput | Prisma.EvidenceSubmissionCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type EvidenceSubmissionUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
    update: Prisma.XOR<Prisma.EvidenceSubmissionUpdateWithoutTenantInput, Prisma.EvidenceSubmissionUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutTenantInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutTenantInput>;
};
export type EvidenceSubmissionUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
    data: Prisma.XOR<Prisma.EvidenceSubmissionUpdateWithoutTenantInput, Prisma.EvidenceSubmissionUncheckedUpdateWithoutTenantInput>;
};
export type EvidenceSubmissionUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.EvidenceSubmissionScalarWhereInput;
    data: Prisma.XOR<Prisma.EvidenceSubmissionUpdateManyMutationInput, Prisma.EvidenceSubmissionUncheckedUpdateManyWithoutTenantInput>;
};
export type EvidenceSubmissionScalarWhereInput = {
    AND?: Prisma.EvidenceSubmissionScalarWhereInput | Prisma.EvidenceSubmissionScalarWhereInput[];
    OR?: Prisma.EvidenceSubmissionScalarWhereInput[];
    NOT?: Prisma.EvidenceSubmissionScalarWhereInput | Prisma.EvidenceSubmissionScalarWhereInput[];
    id?: Prisma.UuidFilter<"EvidenceSubmission"> | string;
    tenantId?: Prisma.UuidFilter<"EvidenceSubmission"> | string;
    evidenceRequirementId?: Prisma.UuidFilter<"EvidenceSubmission"> | string;
    submittedBy?: Prisma.UuidFilter<"EvidenceSubmission"> | string;
    approvedBy?: Prisma.UuidNullableFilter<"EvidenceSubmission"> | string | null;
    filePath?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    fileType?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    fileSize?: Prisma.IntFilter<"EvidenceSubmission"> | number;
    storageLocation?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    integrityHash?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    version?: Prisma.StringFilter<"EvidenceSubmission"> | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFilter<"EvidenceSubmission"> | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.StringNullableFilter<"EvidenceSubmission"> | string | null;
};
export type EvidenceSubmissionCreateWithoutSubmittedByUserInput = {
    id?: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
    evidenceRequirement: Prisma.EvidenceRequirementCreateNestedOneWithoutSubmissionsInput;
    approvedByUser?: Prisma.UserCreateNestedOneWithoutEvidenceApprovedInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutEvidenceSubmissionsInput;
};
export type EvidenceSubmissionUncheckedCreateWithoutSubmittedByUserInput = {
    id?: string;
    tenantId: string;
    evidenceRequirementId: string;
    approvedBy?: string | null;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
};
export type EvidenceSubmissionCreateOrConnectWithoutSubmittedByUserInput = {
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
    create: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutSubmittedByUserInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutSubmittedByUserInput>;
};
export type EvidenceSubmissionCreateManySubmittedByUserInputEnvelope = {
    data: Prisma.EvidenceSubmissionCreateManySubmittedByUserInput | Prisma.EvidenceSubmissionCreateManySubmittedByUserInput[];
    skipDuplicates?: boolean;
};
export type EvidenceSubmissionCreateWithoutApprovedByUserInput = {
    id?: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
    evidenceRequirement: Prisma.EvidenceRequirementCreateNestedOneWithoutSubmissionsInput;
    submittedByUser: Prisma.UserCreateNestedOneWithoutEvidenceSubmittedInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutEvidenceSubmissionsInput;
};
export type EvidenceSubmissionUncheckedCreateWithoutApprovedByUserInput = {
    id?: string;
    tenantId: string;
    evidenceRequirementId: string;
    submittedBy: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
};
export type EvidenceSubmissionCreateOrConnectWithoutApprovedByUserInput = {
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
    create: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutApprovedByUserInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutApprovedByUserInput>;
};
export type EvidenceSubmissionCreateManyApprovedByUserInputEnvelope = {
    data: Prisma.EvidenceSubmissionCreateManyApprovedByUserInput | Prisma.EvidenceSubmissionCreateManyApprovedByUserInput[];
    skipDuplicates?: boolean;
};
export type EvidenceSubmissionUpsertWithWhereUniqueWithoutSubmittedByUserInput = {
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
    update: Prisma.XOR<Prisma.EvidenceSubmissionUpdateWithoutSubmittedByUserInput, Prisma.EvidenceSubmissionUncheckedUpdateWithoutSubmittedByUserInput>;
    create: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutSubmittedByUserInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutSubmittedByUserInput>;
};
export type EvidenceSubmissionUpdateWithWhereUniqueWithoutSubmittedByUserInput = {
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
    data: Prisma.XOR<Prisma.EvidenceSubmissionUpdateWithoutSubmittedByUserInput, Prisma.EvidenceSubmissionUncheckedUpdateWithoutSubmittedByUserInput>;
};
export type EvidenceSubmissionUpdateManyWithWhereWithoutSubmittedByUserInput = {
    where: Prisma.EvidenceSubmissionScalarWhereInput;
    data: Prisma.XOR<Prisma.EvidenceSubmissionUpdateManyMutationInput, Prisma.EvidenceSubmissionUncheckedUpdateManyWithoutSubmittedByUserInput>;
};
export type EvidenceSubmissionUpsertWithWhereUniqueWithoutApprovedByUserInput = {
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
    update: Prisma.XOR<Prisma.EvidenceSubmissionUpdateWithoutApprovedByUserInput, Prisma.EvidenceSubmissionUncheckedUpdateWithoutApprovedByUserInput>;
    create: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutApprovedByUserInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutApprovedByUserInput>;
};
export type EvidenceSubmissionUpdateWithWhereUniqueWithoutApprovedByUserInput = {
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
    data: Prisma.XOR<Prisma.EvidenceSubmissionUpdateWithoutApprovedByUserInput, Prisma.EvidenceSubmissionUncheckedUpdateWithoutApprovedByUserInput>;
};
export type EvidenceSubmissionUpdateManyWithWhereWithoutApprovedByUserInput = {
    where: Prisma.EvidenceSubmissionScalarWhereInput;
    data: Prisma.XOR<Prisma.EvidenceSubmissionUpdateManyMutationInput, Prisma.EvidenceSubmissionUncheckedUpdateManyWithoutApprovedByUserInput>;
};
export type EvidenceSubmissionCreateWithoutEvidenceRequirementInput = {
    id?: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
    submittedByUser: Prisma.UserCreateNestedOneWithoutEvidenceSubmittedInput;
    approvedByUser?: Prisma.UserCreateNestedOneWithoutEvidenceApprovedInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutEvidenceSubmissionsInput;
};
export type EvidenceSubmissionUncheckedCreateWithoutEvidenceRequirementInput = {
    id?: string;
    tenantId: string;
    submittedBy: string;
    approvedBy?: string | null;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
};
export type EvidenceSubmissionCreateOrConnectWithoutEvidenceRequirementInput = {
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
    create: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutEvidenceRequirementInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutEvidenceRequirementInput>;
};
export type EvidenceSubmissionCreateManyEvidenceRequirementInputEnvelope = {
    data: Prisma.EvidenceSubmissionCreateManyEvidenceRequirementInput | Prisma.EvidenceSubmissionCreateManyEvidenceRequirementInput[];
    skipDuplicates?: boolean;
};
export type EvidenceSubmissionUpsertWithWhereUniqueWithoutEvidenceRequirementInput = {
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
    update: Prisma.XOR<Prisma.EvidenceSubmissionUpdateWithoutEvidenceRequirementInput, Prisma.EvidenceSubmissionUncheckedUpdateWithoutEvidenceRequirementInput>;
    create: Prisma.XOR<Prisma.EvidenceSubmissionCreateWithoutEvidenceRequirementInput, Prisma.EvidenceSubmissionUncheckedCreateWithoutEvidenceRequirementInput>;
};
export type EvidenceSubmissionUpdateWithWhereUniqueWithoutEvidenceRequirementInput = {
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
    data: Prisma.XOR<Prisma.EvidenceSubmissionUpdateWithoutEvidenceRequirementInput, Prisma.EvidenceSubmissionUncheckedUpdateWithoutEvidenceRequirementInput>;
};
export type EvidenceSubmissionUpdateManyWithWhereWithoutEvidenceRequirementInput = {
    where: Prisma.EvidenceSubmissionScalarWhereInput;
    data: Prisma.XOR<Prisma.EvidenceSubmissionUpdateManyMutationInput, Prisma.EvidenceSubmissionUncheckedUpdateManyWithoutEvidenceRequirementInput>;
};
export type EvidenceSubmissionCreateManyTenantInput = {
    id?: string;
    evidenceRequirementId: string;
    submittedBy: string;
    approvedBy?: string | null;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
};
export type EvidenceSubmissionUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    evidenceRequirement?: Prisma.EvidenceRequirementUpdateOneRequiredWithoutSubmissionsNestedInput;
    submittedByUser?: Prisma.UserUpdateOneRequiredWithoutEvidenceSubmittedNestedInput;
    approvedByUser?: Prisma.UserUpdateOneWithoutEvidenceApprovedNestedInput;
};
export type EvidenceSubmissionUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    evidenceRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
    submittedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceSubmissionUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    evidenceRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
    submittedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceSubmissionCreateManySubmittedByUserInput = {
    id?: string;
    tenantId: string;
    evidenceRequirementId: string;
    approvedBy?: string | null;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
};
export type EvidenceSubmissionCreateManyApprovedByUserInput = {
    id?: string;
    tenantId: string;
    evidenceRequirementId: string;
    submittedBy: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
};
export type EvidenceSubmissionUpdateWithoutSubmittedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    evidenceRequirement?: Prisma.EvidenceRequirementUpdateOneRequiredWithoutSubmissionsNestedInput;
    approvedByUser?: Prisma.UserUpdateOneWithoutEvidenceApprovedNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutEvidenceSubmissionsNestedInput;
};
export type EvidenceSubmissionUncheckedUpdateWithoutSubmittedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    evidenceRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceSubmissionUncheckedUpdateManyWithoutSubmittedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    evidenceRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceSubmissionUpdateWithoutApprovedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    evidenceRequirement?: Prisma.EvidenceRequirementUpdateOneRequiredWithoutSubmissionsNestedInput;
    submittedByUser?: Prisma.UserUpdateOneRequiredWithoutEvidenceSubmittedNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutEvidenceSubmissionsNestedInput;
};
export type EvidenceSubmissionUncheckedUpdateWithoutApprovedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    evidenceRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
    submittedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceSubmissionUncheckedUpdateManyWithoutApprovedByUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    evidenceRequirementId?: Prisma.StringFieldUpdateOperationsInput | string;
    submittedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceSubmissionCreateManyEvidenceRequirementInput = {
    id?: string;
    tenantId: string;
    submittedBy: string;
    approvedBy?: string | null;
    filePath: string;
    fileType: string;
    fileSize: number;
    storageLocation: string;
    integrityHash: string;
    version: string;
    validationStatus?: $Enums.EvidenceValidationStatus;
    aiVerdict?: string | null;
};
export type EvidenceSubmissionUpdateWithoutEvidenceRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    submittedByUser?: Prisma.UserUpdateOneRequiredWithoutEvidenceSubmittedNestedInput;
    approvedByUser?: Prisma.UserUpdateOneWithoutEvidenceApprovedNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutEvidenceSubmissionsNestedInput;
};
export type EvidenceSubmissionUncheckedUpdateWithoutEvidenceRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    submittedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceSubmissionUncheckedUpdateManyWithoutEvidenceRequirementInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    submittedBy?: Prisma.StringFieldUpdateOperationsInput | string;
    approvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    filePath?: Prisma.StringFieldUpdateOperationsInput | string;
    fileType?: Prisma.StringFieldUpdateOperationsInput | string;
    fileSize?: Prisma.IntFieldUpdateOperationsInput | number;
    storageLocation?: Prisma.StringFieldUpdateOperationsInput | string;
    integrityHash?: Prisma.StringFieldUpdateOperationsInput | string;
    version?: Prisma.StringFieldUpdateOperationsInput | string;
    validationStatus?: Prisma.EnumEvidenceValidationStatusFieldUpdateOperationsInput | $Enums.EvidenceValidationStatus;
    aiVerdict?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EvidenceSubmissionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    evidenceRequirementId?: boolean;
    submittedBy?: boolean;
    approvedBy?: boolean;
    filePath?: boolean;
    fileType?: boolean;
    fileSize?: boolean;
    storageLocation?: boolean;
    integrityHash?: boolean;
    version?: boolean;
    validationStatus?: boolean;
    aiVerdict?: boolean;
    evidenceRequirement?: boolean | Prisma.EvidenceRequirementDefaultArgs<ExtArgs>;
    submittedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    approvedByUser?: boolean | Prisma.EvidenceSubmission$approvedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["evidenceSubmission"]>;
export type EvidenceSubmissionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    evidenceRequirementId?: boolean;
    submittedBy?: boolean;
    approvedBy?: boolean;
    filePath?: boolean;
    fileType?: boolean;
    fileSize?: boolean;
    storageLocation?: boolean;
    integrityHash?: boolean;
    version?: boolean;
    validationStatus?: boolean;
    aiVerdict?: boolean;
    evidenceRequirement?: boolean | Prisma.EvidenceRequirementDefaultArgs<ExtArgs>;
    submittedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    approvedByUser?: boolean | Prisma.EvidenceSubmission$approvedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["evidenceSubmission"]>;
export type EvidenceSubmissionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    evidenceRequirementId?: boolean;
    submittedBy?: boolean;
    approvedBy?: boolean;
    filePath?: boolean;
    fileType?: boolean;
    fileSize?: boolean;
    storageLocation?: boolean;
    integrityHash?: boolean;
    version?: boolean;
    validationStatus?: boolean;
    aiVerdict?: boolean;
    evidenceRequirement?: boolean | Prisma.EvidenceRequirementDefaultArgs<ExtArgs>;
    submittedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    approvedByUser?: boolean | Prisma.EvidenceSubmission$approvedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["evidenceSubmission"]>;
export type EvidenceSubmissionSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    evidenceRequirementId?: boolean;
    submittedBy?: boolean;
    approvedBy?: boolean;
    filePath?: boolean;
    fileType?: boolean;
    fileSize?: boolean;
    storageLocation?: boolean;
    integrityHash?: boolean;
    version?: boolean;
    validationStatus?: boolean;
    aiVerdict?: boolean;
};
export type EvidenceSubmissionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "evidenceRequirementId" | "submittedBy" | "approvedBy" | "filePath" | "fileType" | "fileSize" | "storageLocation" | "integrityHash" | "version" | "validationStatus" | "aiVerdict", ExtArgs["result"]["evidenceSubmission"]>;
export type EvidenceSubmissionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    evidenceRequirement?: boolean | Prisma.EvidenceRequirementDefaultArgs<ExtArgs>;
    submittedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    approvedByUser?: boolean | Prisma.EvidenceSubmission$approvedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type EvidenceSubmissionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    evidenceRequirement?: boolean | Prisma.EvidenceRequirementDefaultArgs<ExtArgs>;
    submittedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    approvedByUser?: boolean | Prisma.EvidenceSubmission$approvedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type EvidenceSubmissionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    evidenceRequirement?: boolean | Prisma.EvidenceRequirementDefaultArgs<ExtArgs>;
    submittedByUser?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    approvedByUser?: boolean | Prisma.EvidenceSubmission$approvedByUserArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $EvidenceSubmissionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "EvidenceSubmission";
    objects: {
        evidenceRequirement: Prisma.$EvidenceRequirementPayload<ExtArgs>;
        submittedByUser: Prisma.$UserPayload<ExtArgs>;
        approvedByUser: Prisma.$UserPayload<ExtArgs> | null;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        evidenceRequirementId: string;
        submittedBy: string;
        approvedBy: string | null;
        filePath: string;
        fileType: string;
        fileSize: number;
        storageLocation: string;
        integrityHash: string;
        version: string;
        validationStatus: $Enums.EvidenceValidationStatus;
        aiVerdict: string | null;
    }, ExtArgs["result"]["evidenceSubmission"]>;
    composites: {};
};
export type EvidenceSubmissionGetPayload<S extends boolean | null | undefined | EvidenceSubmissionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$EvidenceSubmissionPayload, S>;
export type EvidenceSubmissionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<EvidenceSubmissionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: EvidenceSubmissionCountAggregateInputType | true;
};
export interface EvidenceSubmissionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['EvidenceSubmission'];
        meta: {
            name: 'EvidenceSubmission';
        };
    };
    findUnique<T extends EvidenceSubmissionFindUniqueArgs>(args: Prisma.SelectSubset<T, EvidenceSubmissionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__EvidenceSubmissionClient<runtime.Types.Result.GetResult<Prisma.$EvidenceSubmissionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends EvidenceSubmissionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, EvidenceSubmissionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__EvidenceSubmissionClient<runtime.Types.Result.GetResult<Prisma.$EvidenceSubmissionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends EvidenceSubmissionFindFirstArgs>(args?: Prisma.SelectSubset<T, EvidenceSubmissionFindFirstArgs<ExtArgs>>): Prisma.Prisma__EvidenceSubmissionClient<runtime.Types.Result.GetResult<Prisma.$EvidenceSubmissionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends EvidenceSubmissionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, EvidenceSubmissionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__EvidenceSubmissionClient<runtime.Types.Result.GetResult<Prisma.$EvidenceSubmissionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends EvidenceSubmissionFindManyArgs>(args?: Prisma.SelectSubset<T, EvidenceSubmissionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvidenceSubmissionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends EvidenceSubmissionCreateArgs>(args: Prisma.SelectSubset<T, EvidenceSubmissionCreateArgs<ExtArgs>>): Prisma.Prisma__EvidenceSubmissionClient<runtime.Types.Result.GetResult<Prisma.$EvidenceSubmissionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends EvidenceSubmissionCreateManyArgs>(args?: Prisma.SelectSubset<T, EvidenceSubmissionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends EvidenceSubmissionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, EvidenceSubmissionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvidenceSubmissionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends EvidenceSubmissionDeleteArgs>(args: Prisma.SelectSubset<T, EvidenceSubmissionDeleteArgs<ExtArgs>>): Prisma.Prisma__EvidenceSubmissionClient<runtime.Types.Result.GetResult<Prisma.$EvidenceSubmissionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends EvidenceSubmissionUpdateArgs>(args: Prisma.SelectSubset<T, EvidenceSubmissionUpdateArgs<ExtArgs>>): Prisma.Prisma__EvidenceSubmissionClient<runtime.Types.Result.GetResult<Prisma.$EvidenceSubmissionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends EvidenceSubmissionDeleteManyArgs>(args?: Prisma.SelectSubset<T, EvidenceSubmissionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends EvidenceSubmissionUpdateManyArgs>(args: Prisma.SelectSubset<T, EvidenceSubmissionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends EvidenceSubmissionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, EvidenceSubmissionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvidenceSubmissionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends EvidenceSubmissionUpsertArgs>(args: Prisma.SelectSubset<T, EvidenceSubmissionUpsertArgs<ExtArgs>>): Prisma.Prisma__EvidenceSubmissionClient<runtime.Types.Result.GetResult<Prisma.$EvidenceSubmissionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends EvidenceSubmissionCountArgs>(args?: Prisma.Subset<T, EvidenceSubmissionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], EvidenceSubmissionCountAggregateOutputType> : number>;
    aggregate<T extends EvidenceSubmissionAggregateArgs>(args: Prisma.Subset<T, EvidenceSubmissionAggregateArgs>): Prisma.PrismaPromise<GetEvidenceSubmissionAggregateType<T>>;
    groupBy<T extends EvidenceSubmissionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: EvidenceSubmissionGroupByArgs['orderBy'];
    } : {
        orderBy?: EvidenceSubmissionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, EvidenceSubmissionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEvidenceSubmissionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: EvidenceSubmissionFieldRefs;
}
export interface Prisma__EvidenceSubmissionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    evidenceRequirement<T extends Prisma.EvidenceRequirementDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EvidenceRequirementDefaultArgs<ExtArgs>>): Prisma.Prisma__EvidenceRequirementClient<runtime.Types.Result.GetResult<Prisma.$EvidenceRequirementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    submittedByUser<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    approvedByUser<T extends Prisma.EvidenceSubmission$approvedByUserArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EvidenceSubmission$approvedByUserArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface EvidenceSubmissionFieldRefs {
    readonly id: Prisma.FieldRef<"EvidenceSubmission", 'String'>;
    readonly tenantId: Prisma.FieldRef<"EvidenceSubmission", 'String'>;
    readonly evidenceRequirementId: Prisma.FieldRef<"EvidenceSubmission", 'String'>;
    readonly submittedBy: Prisma.FieldRef<"EvidenceSubmission", 'String'>;
    readonly approvedBy: Prisma.FieldRef<"EvidenceSubmission", 'String'>;
    readonly filePath: Prisma.FieldRef<"EvidenceSubmission", 'String'>;
    readonly fileType: Prisma.FieldRef<"EvidenceSubmission", 'String'>;
    readonly fileSize: Prisma.FieldRef<"EvidenceSubmission", 'Int'>;
    readonly storageLocation: Prisma.FieldRef<"EvidenceSubmission", 'String'>;
    readonly integrityHash: Prisma.FieldRef<"EvidenceSubmission", 'String'>;
    readonly version: Prisma.FieldRef<"EvidenceSubmission", 'String'>;
    readonly validationStatus: Prisma.FieldRef<"EvidenceSubmission", 'EvidenceValidationStatus'>;
    readonly aiVerdict: Prisma.FieldRef<"EvidenceSubmission", 'String'>;
}
export type EvidenceSubmissionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceSubmissionSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceSubmissionOmit<ExtArgs> | null;
    include?: Prisma.EvidenceSubmissionInclude<ExtArgs> | null;
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
};
export type EvidenceSubmissionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceSubmissionSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceSubmissionOmit<ExtArgs> | null;
    include?: Prisma.EvidenceSubmissionInclude<ExtArgs> | null;
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
};
export type EvidenceSubmissionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceSubmissionSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceSubmissionOmit<ExtArgs> | null;
    include?: Prisma.EvidenceSubmissionInclude<ExtArgs> | null;
    where?: Prisma.EvidenceSubmissionWhereInput;
    orderBy?: Prisma.EvidenceSubmissionOrderByWithRelationInput | Prisma.EvidenceSubmissionOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceSubmissionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EvidenceSubmissionScalarFieldEnum | Prisma.EvidenceSubmissionScalarFieldEnum[];
};
export type EvidenceSubmissionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceSubmissionSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceSubmissionOmit<ExtArgs> | null;
    include?: Prisma.EvidenceSubmissionInclude<ExtArgs> | null;
    where?: Prisma.EvidenceSubmissionWhereInput;
    orderBy?: Prisma.EvidenceSubmissionOrderByWithRelationInput | Prisma.EvidenceSubmissionOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceSubmissionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EvidenceSubmissionScalarFieldEnum | Prisma.EvidenceSubmissionScalarFieldEnum[];
};
export type EvidenceSubmissionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceSubmissionSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceSubmissionOmit<ExtArgs> | null;
    include?: Prisma.EvidenceSubmissionInclude<ExtArgs> | null;
    where?: Prisma.EvidenceSubmissionWhereInput;
    orderBy?: Prisma.EvidenceSubmissionOrderByWithRelationInput | Prisma.EvidenceSubmissionOrderByWithRelationInput[];
    cursor?: Prisma.EvidenceSubmissionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EvidenceSubmissionScalarFieldEnum | Prisma.EvidenceSubmissionScalarFieldEnum[];
};
export type EvidenceSubmissionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceSubmissionSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceSubmissionOmit<ExtArgs> | null;
    include?: Prisma.EvidenceSubmissionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EvidenceSubmissionCreateInput, Prisma.EvidenceSubmissionUncheckedCreateInput>;
};
export type EvidenceSubmissionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.EvidenceSubmissionCreateManyInput | Prisma.EvidenceSubmissionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type EvidenceSubmissionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceSubmissionSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EvidenceSubmissionOmit<ExtArgs> | null;
    data: Prisma.EvidenceSubmissionCreateManyInput | Prisma.EvidenceSubmissionCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.EvidenceSubmissionIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type EvidenceSubmissionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceSubmissionSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceSubmissionOmit<ExtArgs> | null;
    include?: Prisma.EvidenceSubmissionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EvidenceSubmissionUpdateInput, Prisma.EvidenceSubmissionUncheckedUpdateInput>;
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
};
export type EvidenceSubmissionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.EvidenceSubmissionUpdateManyMutationInput, Prisma.EvidenceSubmissionUncheckedUpdateManyInput>;
    where?: Prisma.EvidenceSubmissionWhereInput;
    limit?: number;
};
export type EvidenceSubmissionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceSubmissionSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EvidenceSubmissionOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EvidenceSubmissionUpdateManyMutationInput, Prisma.EvidenceSubmissionUncheckedUpdateManyInput>;
    where?: Prisma.EvidenceSubmissionWhereInput;
    limit?: number;
    include?: Prisma.EvidenceSubmissionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type EvidenceSubmissionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceSubmissionSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceSubmissionOmit<ExtArgs> | null;
    include?: Prisma.EvidenceSubmissionInclude<ExtArgs> | null;
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
    create: Prisma.XOR<Prisma.EvidenceSubmissionCreateInput, Prisma.EvidenceSubmissionUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.EvidenceSubmissionUpdateInput, Prisma.EvidenceSubmissionUncheckedUpdateInput>;
};
export type EvidenceSubmissionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceSubmissionSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceSubmissionOmit<ExtArgs> | null;
    include?: Prisma.EvidenceSubmissionInclude<ExtArgs> | null;
    where: Prisma.EvidenceSubmissionWhereUniqueInput;
};
export type EvidenceSubmissionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvidenceSubmissionWhereInput;
    limit?: number;
};
export type EvidenceSubmission$approvedByUserArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
export type EvidenceSubmissionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvidenceSubmissionSelect<ExtArgs> | null;
    omit?: Prisma.EvidenceSubmissionOmit<ExtArgs> | null;
    include?: Prisma.EvidenceSubmissionInclude<ExtArgs> | null;
};
export {};
