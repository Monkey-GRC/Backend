import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ClientControlDimensionModel = runtime.Types.Result.DefaultSelection<Prisma.$ClientControlDimensionPayload>;
export type AggregateClientControlDimension = {
    _count: ClientControlDimensionCountAggregateOutputType | null;
    _min: ClientControlDimensionMinAggregateOutputType | null;
    _max: ClientControlDimensionMaxAggregateOutputType | null;
};
export type ClientControlDimensionMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientControlId: string | null;
    dimension: $Enums.Dimension | null;
    type: $Enums.ControlDimensionType | null;
    requiresProbe: boolean | null;
    requiresAi: boolean | null;
    requiresComplianceConfirmation: boolean | null;
    reasonNotApplicable: string | null;
};
export type ClientControlDimensionMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientControlId: string | null;
    dimension: $Enums.Dimension | null;
    type: $Enums.ControlDimensionType | null;
    requiresProbe: boolean | null;
    requiresAi: boolean | null;
    requiresComplianceConfirmation: boolean | null;
    reasonNotApplicable: string | null;
};
export type ClientControlDimensionCountAggregateOutputType = {
    id: number;
    tenantId: number;
    clientControlId: number;
    dimension: number;
    type: number;
    requiresProbe: number;
    requiresAi: number;
    requiresComplianceConfirmation: number;
    reasonNotApplicable: number;
    _all: number;
};
export type ClientControlDimensionMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientControlId?: true;
    dimension?: true;
    type?: true;
    requiresProbe?: true;
    requiresAi?: true;
    requiresComplianceConfirmation?: true;
    reasonNotApplicable?: true;
};
export type ClientControlDimensionMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientControlId?: true;
    dimension?: true;
    type?: true;
    requiresProbe?: true;
    requiresAi?: true;
    requiresComplianceConfirmation?: true;
    reasonNotApplicable?: true;
};
export type ClientControlDimensionCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientControlId?: true;
    dimension?: true;
    type?: true;
    requiresProbe?: true;
    requiresAi?: true;
    requiresComplianceConfirmation?: true;
    reasonNotApplicable?: true;
    _all?: true;
};
export type ClientControlDimensionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientControlDimensionWhereInput;
    orderBy?: Prisma.ClientControlDimensionOrderByWithRelationInput | Prisma.ClientControlDimensionOrderByWithRelationInput[];
    cursor?: Prisma.ClientControlDimensionWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ClientControlDimensionCountAggregateInputType;
    _min?: ClientControlDimensionMinAggregateInputType;
    _max?: ClientControlDimensionMaxAggregateInputType;
};
export type GetClientControlDimensionAggregateType<T extends ClientControlDimensionAggregateArgs> = {
    [P in keyof T & keyof AggregateClientControlDimension]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateClientControlDimension[P]> : Prisma.GetScalarType<T[P], AggregateClientControlDimension[P]>;
};
export type ClientControlDimensionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientControlDimensionWhereInput;
    orderBy?: Prisma.ClientControlDimensionOrderByWithAggregationInput | Prisma.ClientControlDimensionOrderByWithAggregationInput[];
    by: Prisma.ClientControlDimensionScalarFieldEnum[] | Prisma.ClientControlDimensionScalarFieldEnum;
    having?: Prisma.ClientControlDimensionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClientControlDimensionCountAggregateInputType | true;
    _min?: ClientControlDimensionMinAggregateInputType;
    _max?: ClientControlDimensionMaxAggregateInputType;
};
export type ClientControlDimensionGroupByOutputType = {
    id: string;
    tenantId: string;
    clientControlId: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe: boolean;
    requiresAi: boolean;
    requiresComplianceConfirmation: boolean;
    reasonNotApplicable: string | null;
    _count: ClientControlDimensionCountAggregateOutputType | null;
    _min: ClientControlDimensionMinAggregateOutputType | null;
    _max: ClientControlDimensionMaxAggregateOutputType | null;
};
type GetClientControlDimensionGroupByPayload<T extends ClientControlDimensionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ClientControlDimensionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ClientControlDimensionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ClientControlDimensionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ClientControlDimensionGroupByOutputType[P]>;
}>>;
export type ClientControlDimensionWhereInput = {
    AND?: Prisma.ClientControlDimensionWhereInput | Prisma.ClientControlDimensionWhereInput[];
    OR?: Prisma.ClientControlDimensionWhereInput[];
    NOT?: Prisma.ClientControlDimensionWhereInput | Prisma.ClientControlDimensionWhereInput[];
    id?: Prisma.UuidFilter<"ClientControlDimension"> | string;
    tenantId?: Prisma.UuidFilter<"ClientControlDimension"> | string;
    clientControlId?: Prisma.UuidFilter<"ClientControlDimension"> | string;
    dimension?: Prisma.EnumDimensionFilter<"ClientControlDimension"> | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFilter<"ClientControlDimension"> | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFilter<"ClientControlDimension"> | boolean;
    requiresAi?: Prisma.BoolFilter<"ClientControlDimension"> | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFilter<"ClientControlDimension"> | boolean;
    reasonNotApplicable?: Prisma.StringNullableFilter<"ClientControlDimension"> | string | null;
    clientControl?: Prisma.XOR<Prisma.ClientControlScalarRelationFilter, Prisma.ClientControlWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type ClientControlDimensionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    requiresProbe?: Prisma.SortOrder;
    requiresAi?: Prisma.SortOrder;
    requiresComplianceConfirmation?: Prisma.SortOrder;
    reasonNotApplicable?: Prisma.SortOrderInput | Prisma.SortOrder;
    clientControl?: Prisma.ClientControlOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type ClientControlDimensionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    clientControlId_dimension?: Prisma.ClientControlDimensionClientControlIdDimensionCompoundUniqueInput;
    AND?: Prisma.ClientControlDimensionWhereInput | Prisma.ClientControlDimensionWhereInput[];
    OR?: Prisma.ClientControlDimensionWhereInput[];
    NOT?: Prisma.ClientControlDimensionWhereInput | Prisma.ClientControlDimensionWhereInput[];
    tenantId?: Prisma.UuidFilter<"ClientControlDimension"> | string;
    clientControlId?: Prisma.UuidFilter<"ClientControlDimension"> | string;
    dimension?: Prisma.EnumDimensionFilter<"ClientControlDimension"> | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFilter<"ClientControlDimension"> | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFilter<"ClientControlDimension"> | boolean;
    requiresAi?: Prisma.BoolFilter<"ClientControlDimension"> | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFilter<"ClientControlDimension"> | boolean;
    reasonNotApplicable?: Prisma.StringNullableFilter<"ClientControlDimension"> | string | null;
    clientControl?: Prisma.XOR<Prisma.ClientControlScalarRelationFilter, Prisma.ClientControlWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id" | "clientControlId_dimension">;
export type ClientControlDimensionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    requiresProbe?: Prisma.SortOrder;
    requiresAi?: Prisma.SortOrder;
    requiresComplianceConfirmation?: Prisma.SortOrder;
    reasonNotApplicable?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.ClientControlDimensionCountOrderByAggregateInput;
    _max?: Prisma.ClientControlDimensionMaxOrderByAggregateInput;
    _min?: Prisma.ClientControlDimensionMinOrderByAggregateInput;
};
export type ClientControlDimensionScalarWhereWithAggregatesInput = {
    AND?: Prisma.ClientControlDimensionScalarWhereWithAggregatesInput | Prisma.ClientControlDimensionScalarWhereWithAggregatesInput[];
    OR?: Prisma.ClientControlDimensionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ClientControlDimensionScalarWhereWithAggregatesInput | Prisma.ClientControlDimensionScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ClientControlDimension"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ClientControlDimension"> | string;
    clientControlId?: Prisma.UuidWithAggregatesFilter<"ClientControlDimension"> | string;
    dimension?: Prisma.EnumDimensionWithAggregatesFilter<"ClientControlDimension"> | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeWithAggregatesFilter<"ClientControlDimension"> | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolWithAggregatesFilter<"ClientControlDimension"> | boolean;
    requiresAi?: Prisma.BoolWithAggregatesFilter<"ClientControlDimension"> | boolean;
    requiresComplianceConfirmation?: Prisma.BoolWithAggregatesFilter<"ClientControlDimension"> | boolean;
    reasonNotApplicable?: Prisma.StringNullableWithAggregatesFilter<"ClientControlDimension"> | string | null;
};
export type ClientControlDimensionCreateInput = {
    id?: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutDimensionsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlDimensionsInput;
};
export type ClientControlDimensionUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
};
export type ClientControlDimensionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutDimensionsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlDimensionsNestedInput;
};
export type ClientControlDimensionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ClientControlDimensionCreateManyInput = {
    id?: string;
    tenantId: string;
    clientControlId: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
};
export type ClientControlDimensionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ClientControlDimensionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ClientControlDimensionListRelationFilter = {
    every?: Prisma.ClientControlDimensionWhereInput;
    some?: Prisma.ClientControlDimensionWhereInput;
    none?: Prisma.ClientControlDimensionWhereInput;
};
export type ClientControlDimensionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ClientControlDimensionClientControlIdDimensionCompoundUniqueInput = {
    clientControlId: string;
    dimension: $Enums.Dimension;
};
export type ClientControlDimensionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    requiresProbe?: Prisma.SortOrder;
    requiresAi?: Prisma.SortOrder;
    requiresComplianceConfirmation?: Prisma.SortOrder;
    reasonNotApplicable?: Prisma.SortOrder;
};
export type ClientControlDimensionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    requiresProbe?: Prisma.SortOrder;
    requiresAi?: Prisma.SortOrder;
    requiresComplianceConfirmation?: Prisma.SortOrder;
    reasonNotApplicable?: Prisma.SortOrder;
};
export type ClientControlDimensionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientControlId?: Prisma.SortOrder;
    dimension?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    requiresProbe?: Prisma.SortOrder;
    requiresAi?: Prisma.SortOrder;
    requiresComplianceConfirmation?: Prisma.SortOrder;
    reasonNotApplicable?: Prisma.SortOrder;
};
export type ClientControlDimensionCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ClientControlDimensionCreateWithoutTenantInput, Prisma.ClientControlDimensionUncheckedCreateWithoutTenantInput> | Prisma.ClientControlDimensionCreateWithoutTenantInput[] | Prisma.ClientControlDimensionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientControlDimensionCreateOrConnectWithoutTenantInput | Prisma.ClientControlDimensionCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ClientControlDimensionCreateManyTenantInputEnvelope;
    connect?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
};
export type ClientControlDimensionUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ClientControlDimensionCreateWithoutTenantInput, Prisma.ClientControlDimensionUncheckedCreateWithoutTenantInput> | Prisma.ClientControlDimensionCreateWithoutTenantInput[] | Prisma.ClientControlDimensionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientControlDimensionCreateOrConnectWithoutTenantInput | Prisma.ClientControlDimensionCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ClientControlDimensionCreateManyTenantInputEnvelope;
    connect?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
};
export type ClientControlDimensionUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlDimensionCreateWithoutTenantInput, Prisma.ClientControlDimensionUncheckedCreateWithoutTenantInput> | Prisma.ClientControlDimensionCreateWithoutTenantInput[] | Prisma.ClientControlDimensionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientControlDimensionCreateOrConnectWithoutTenantInput | Prisma.ClientControlDimensionCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ClientControlDimensionUpsertWithWhereUniqueWithoutTenantInput | Prisma.ClientControlDimensionUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ClientControlDimensionCreateManyTenantInputEnvelope;
    set?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    disconnect?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    delete?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    connect?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    update?: Prisma.ClientControlDimensionUpdateWithWhereUniqueWithoutTenantInput | Prisma.ClientControlDimensionUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ClientControlDimensionUpdateManyWithWhereWithoutTenantInput | Prisma.ClientControlDimensionUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ClientControlDimensionScalarWhereInput | Prisma.ClientControlDimensionScalarWhereInput[];
};
export type ClientControlDimensionUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlDimensionCreateWithoutTenantInput, Prisma.ClientControlDimensionUncheckedCreateWithoutTenantInput> | Prisma.ClientControlDimensionCreateWithoutTenantInput[] | Prisma.ClientControlDimensionUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientControlDimensionCreateOrConnectWithoutTenantInput | Prisma.ClientControlDimensionCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ClientControlDimensionUpsertWithWhereUniqueWithoutTenantInput | Prisma.ClientControlDimensionUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ClientControlDimensionCreateManyTenantInputEnvelope;
    set?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    disconnect?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    delete?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    connect?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    update?: Prisma.ClientControlDimensionUpdateWithWhereUniqueWithoutTenantInput | Prisma.ClientControlDimensionUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ClientControlDimensionUpdateManyWithWhereWithoutTenantInput | Prisma.ClientControlDimensionUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ClientControlDimensionScalarWhereInput | Prisma.ClientControlDimensionScalarWhereInput[];
};
export type ClientControlDimensionCreateNestedManyWithoutClientControlInput = {
    create?: Prisma.XOR<Prisma.ClientControlDimensionCreateWithoutClientControlInput, Prisma.ClientControlDimensionUncheckedCreateWithoutClientControlInput> | Prisma.ClientControlDimensionCreateWithoutClientControlInput[] | Prisma.ClientControlDimensionUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ClientControlDimensionCreateOrConnectWithoutClientControlInput | Prisma.ClientControlDimensionCreateOrConnectWithoutClientControlInput[];
    createMany?: Prisma.ClientControlDimensionCreateManyClientControlInputEnvelope;
    connect?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
};
export type ClientControlDimensionUncheckedCreateNestedManyWithoutClientControlInput = {
    create?: Prisma.XOR<Prisma.ClientControlDimensionCreateWithoutClientControlInput, Prisma.ClientControlDimensionUncheckedCreateWithoutClientControlInput> | Prisma.ClientControlDimensionCreateWithoutClientControlInput[] | Prisma.ClientControlDimensionUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ClientControlDimensionCreateOrConnectWithoutClientControlInput | Prisma.ClientControlDimensionCreateOrConnectWithoutClientControlInput[];
    createMany?: Prisma.ClientControlDimensionCreateManyClientControlInputEnvelope;
    connect?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
};
export type ClientControlDimensionUpdateManyWithoutClientControlNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlDimensionCreateWithoutClientControlInput, Prisma.ClientControlDimensionUncheckedCreateWithoutClientControlInput> | Prisma.ClientControlDimensionCreateWithoutClientControlInput[] | Prisma.ClientControlDimensionUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ClientControlDimensionCreateOrConnectWithoutClientControlInput | Prisma.ClientControlDimensionCreateOrConnectWithoutClientControlInput[];
    upsert?: Prisma.ClientControlDimensionUpsertWithWhereUniqueWithoutClientControlInput | Prisma.ClientControlDimensionUpsertWithWhereUniqueWithoutClientControlInput[];
    createMany?: Prisma.ClientControlDimensionCreateManyClientControlInputEnvelope;
    set?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    disconnect?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    delete?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    connect?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    update?: Prisma.ClientControlDimensionUpdateWithWhereUniqueWithoutClientControlInput | Prisma.ClientControlDimensionUpdateWithWhereUniqueWithoutClientControlInput[];
    updateMany?: Prisma.ClientControlDimensionUpdateManyWithWhereWithoutClientControlInput | Prisma.ClientControlDimensionUpdateManyWithWhereWithoutClientControlInput[];
    deleteMany?: Prisma.ClientControlDimensionScalarWhereInput | Prisma.ClientControlDimensionScalarWhereInput[];
};
export type ClientControlDimensionUncheckedUpdateManyWithoutClientControlNestedInput = {
    create?: Prisma.XOR<Prisma.ClientControlDimensionCreateWithoutClientControlInput, Prisma.ClientControlDimensionUncheckedCreateWithoutClientControlInput> | Prisma.ClientControlDimensionCreateWithoutClientControlInput[] | Prisma.ClientControlDimensionUncheckedCreateWithoutClientControlInput[];
    connectOrCreate?: Prisma.ClientControlDimensionCreateOrConnectWithoutClientControlInput | Prisma.ClientControlDimensionCreateOrConnectWithoutClientControlInput[];
    upsert?: Prisma.ClientControlDimensionUpsertWithWhereUniqueWithoutClientControlInput | Prisma.ClientControlDimensionUpsertWithWhereUniqueWithoutClientControlInput[];
    createMany?: Prisma.ClientControlDimensionCreateManyClientControlInputEnvelope;
    set?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    disconnect?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    delete?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    connect?: Prisma.ClientControlDimensionWhereUniqueInput | Prisma.ClientControlDimensionWhereUniqueInput[];
    update?: Prisma.ClientControlDimensionUpdateWithWhereUniqueWithoutClientControlInput | Prisma.ClientControlDimensionUpdateWithWhereUniqueWithoutClientControlInput[];
    updateMany?: Prisma.ClientControlDimensionUpdateManyWithWhereWithoutClientControlInput | Prisma.ClientControlDimensionUpdateManyWithWhereWithoutClientControlInput[];
    deleteMany?: Prisma.ClientControlDimensionScalarWhereInput | Prisma.ClientControlDimensionScalarWhereInput[];
};
export type ClientControlDimensionCreateWithoutTenantInput = {
    id?: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
    clientControl: Prisma.ClientControlCreateNestedOneWithoutDimensionsInput;
};
export type ClientControlDimensionUncheckedCreateWithoutTenantInput = {
    id?: string;
    clientControlId: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
};
export type ClientControlDimensionCreateOrConnectWithoutTenantInput = {
    where: Prisma.ClientControlDimensionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlDimensionCreateWithoutTenantInput, Prisma.ClientControlDimensionUncheckedCreateWithoutTenantInput>;
};
export type ClientControlDimensionCreateManyTenantInputEnvelope = {
    data: Prisma.ClientControlDimensionCreateManyTenantInput | Prisma.ClientControlDimensionCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ClientControlDimensionUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ClientControlDimensionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientControlDimensionUpdateWithoutTenantInput, Prisma.ClientControlDimensionUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ClientControlDimensionCreateWithoutTenantInput, Prisma.ClientControlDimensionUncheckedCreateWithoutTenantInput>;
};
export type ClientControlDimensionUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ClientControlDimensionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientControlDimensionUpdateWithoutTenantInput, Prisma.ClientControlDimensionUncheckedUpdateWithoutTenantInput>;
};
export type ClientControlDimensionUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ClientControlDimensionScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientControlDimensionUpdateManyMutationInput, Prisma.ClientControlDimensionUncheckedUpdateManyWithoutTenantInput>;
};
export type ClientControlDimensionScalarWhereInput = {
    AND?: Prisma.ClientControlDimensionScalarWhereInput | Prisma.ClientControlDimensionScalarWhereInput[];
    OR?: Prisma.ClientControlDimensionScalarWhereInput[];
    NOT?: Prisma.ClientControlDimensionScalarWhereInput | Prisma.ClientControlDimensionScalarWhereInput[];
    id?: Prisma.UuidFilter<"ClientControlDimension"> | string;
    tenantId?: Prisma.UuidFilter<"ClientControlDimension"> | string;
    clientControlId?: Prisma.UuidFilter<"ClientControlDimension"> | string;
    dimension?: Prisma.EnumDimensionFilter<"ClientControlDimension"> | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFilter<"ClientControlDimension"> | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFilter<"ClientControlDimension"> | boolean;
    requiresAi?: Prisma.BoolFilter<"ClientControlDimension"> | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFilter<"ClientControlDimension"> | boolean;
    reasonNotApplicable?: Prisma.StringNullableFilter<"ClientControlDimension"> | string | null;
};
export type ClientControlDimensionCreateWithoutClientControlInput = {
    id?: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientControlDimensionsInput;
};
export type ClientControlDimensionUncheckedCreateWithoutClientControlInput = {
    id?: string;
    tenantId: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
};
export type ClientControlDimensionCreateOrConnectWithoutClientControlInput = {
    where: Prisma.ClientControlDimensionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlDimensionCreateWithoutClientControlInput, Prisma.ClientControlDimensionUncheckedCreateWithoutClientControlInput>;
};
export type ClientControlDimensionCreateManyClientControlInputEnvelope = {
    data: Prisma.ClientControlDimensionCreateManyClientControlInput | Prisma.ClientControlDimensionCreateManyClientControlInput[];
    skipDuplicates?: boolean;
};
export type ClientControlDimensionUpsertWithWhereUniqueWithoutClientControlInput = {
    where: Prisma.ClientControlDimensionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientControlDimensionUpdateWithoutClientControlInput, Prisma.ClientControlDimensionUncheckedUpdateWithoutClientControlInput>;
    create: Prisma.XOR<Prisma.ClientControlDimensionCreateWithoutClientControlInput, Prisma.ClientControlDimensionUncheckedCreateWithoutClientControlInput>;
};
export type ClientControlDimensionUpdateWithWhereUniqueWithoutClientControlInput = {
    where: Prisma.ClientControlDimensionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientControlDimensionUpdateWithoutClientControlInput, Prisma.ClientControlDimensionUncheckedUpdateWithoutClientControlInput>;
};
export type ClientControlDimensionUpdateManyWithWhereWithoutClientControlInput = {
    where: Prisma.ClientControlDimensionScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientControlDimensionUpdateManyMutationInput, Prisma.ClientControlDimensionUncheckedUpdateManyWithoutClientControlInput>;
};
export type ClientControlDimensionCreateManyTenantInput = {
    id?: string;
    clientControlId: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
};
export type ClientControlDimensionUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    clientControl?: Prisma.ClientControlUpdateOneRequiredWithoutDimensionsNestedInput;
};
export type ClientControlDimensionUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ClientControlDimensionUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientControlId?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ClientControlDimensionCreateManyClientControlInput = {
    id?: string;
    tenantId: string;
    dimension: $Enums.Dimension;
    type: $Enums.ControlDimensionType;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: string | null;
};
export type ClientControlDimensionUpdateWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientControlDimensionsNestedInput;
};
export type ClientControlDimensionUncheckedUpdateWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ClientControlDimensionUncheckedUpdateManyWithoutClientControlInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    dimension?: Prisma.EnumDimensionFieldUpdateOperationsInput | $Enums.Dimension;
    type?: Prisma.EnumControlDimensionTypeFieldUpdateOperationsInput | $Enums.ControlDimensionType;
    requiresProbe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAi?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresComplianceConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    reasonNotApplicable?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type ClientControlDimensionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    dimension?: boolean;
    type?: boolean;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: boolean;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientControlDimension"]>;
export type ClientControlDimensionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    dimension?: boolean;
    type?: boolean;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: boolean;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientControlDimension"]>;
export type ClientControlDimensionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    dimension?: boolean;
    type?: boolean;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: boolean;
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientControlDimension"]>;
export type ClientControlDimensionSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    clientControlId?: boolean;
    dimension?: boolean;
    type?: boolean;
    requiresProbe?: boolean;
    requiresAi?: boolean;
    requiresComplianceConfirmation?: boolean;
    reasonNotApplicable?: boolean;
};
export type ClientControlDimensionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "clientControlId" | "dimension" | "type" | "requiresProbe" | "requiresAi" | "requiresComplianceConfirmation" | "reasonNotApplicable", ExtArgs["result"]["clientControlDimension"]>;
export type ClientControlDimensionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ClientControlDimensionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ClientControlDimensionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientControl?: boolean | Prisma.ClientControlDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ClientControlDimensionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ClientControlDimension";
    objects: {
        clientControl: Prisma.$ClientControlPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        clientControlId: string;
        dimension: $Enums.Dimension;
        type: $Enums.ControlDimensionType;
        requiresProbe: boolean;
        requiresAi: boolean;
        requiresComplianceConfirmation: boolean;
        reasonNotApplicable: string | null;
    }, ExtArgs["result"]["clientControlDimension"]>;
    composites: {};
};
export type ClientControlDimensionGetPayload<S extends boolean | null | undefined | ClientControlDimensionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ClientControlDimensionPayload, S>;
export type ClientControlDimensionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ClientControlDimensionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClientControlDimensionCountAggregateInputType | true;
};
export interface ClientControlDimensionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ClientControlDimension'];
        meta: {
            name: 'ClientControlDimension';
        };
    };
    findUnique<T extends ClientControlDimensionFindUniqueArgs>(args: Prisma.SelectSubset<T, ClientControlDimensionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ClientControlDimensionClient<runtime.Types.Result.GetResult<Prisma.$ClientControlDimensionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ClientControlDimensionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ClientControlDimensionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientControlDimensionClient<runtime.Types.Result.GetResult<Prisma.$ClientControlDimensionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ClientControlDimensionFindFirstArgs>(args?: Prisma.SelectSubset<T, ClientControlDimensionFindFirstArgs<ExtArgs>>): Prisma.Prisma__ClientControlDimensionClient<runtime.Types.Result.GetResult<Prisma.$ClientControlDimensionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ClientControlDimensionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ClientControlDimensionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientControlDimensionClient<runtime.Types.Result.GetResult<Prisma.$ClientControlDimensionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ClientControlDimensionFindManyArgs>(args?: Prisma.SelectSubset<T, ClientControlDimensionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientControlDimensionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ClientControlDimensionCreateArgs>(args: Prisma.SelectSubset<T, ClientControlDimensionCreateArgs<ExtArgs>>): Prisma.Prisma__ClientControlDimensionClient<runtime.Types.Result.GetResult<Prisma.$ClientControlDimensionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ClientControlDimensionCreateManyArgs>(args?: Prisma.SelectSubset<T, ClientControlDimensionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ClientControlDimensionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ClientControlDimensionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientControlDimensionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ClientControlDimensionDeleteArgs>(args: Prisma.SelectSubset<T, ClientControlDimensionDeleteArgs<ExtArgs>>): Prisma.Prisma__ClientControlDimensionClient<runtime.Types.Result.GetResult<Prisma.$ClientControlDimensionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ClientControlDimensionUpdateArgs>(args: Prisma.SelectSubset<T, ClientControlDimensionUpdateArgs<ExtArgs>>): Prisma.Prisma__ClientControlDimensionClient<runtime.Types.Result.GetResult<Prisma.$ClientControlDimensionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ClientControlDimensionDeleteManyArgs>(args?: Prisma.SelectSubset<T, ClientControlDimensionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ClientControlDimensionUpdateManyArgs>(args: Prisma.SelectSubset<T, ClientControlDimensionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ClientControlDimensionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ClientControlDimensionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientControlDimensionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ClientControlDimensionUpsertArgs>(args: Prisma.SelectSubset<T, ClientControlDimensionUpsertArgs<ExtArgs>>): Prisma.Prisma__ClientControlDimensionClient<runtime.Types.Result.GetResult<Prisma.$ClientControlDimensionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ClientControlDimensionCountArgs>(args?: Prisma.Subset<T, ClientControlDimensionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ClientControlDimensionCountAggregateOutputType> : number>;
    aggregate<T extends ClientControlDimensionAggregateArgs>(args: Prisma.Subset<T, ClientControlDimensionAggregateArgs>): Prisma.PrismaPromise<GetClientControlDimensionAggregateType<T>>;
    groupBy<T extends ClientControlDimensionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ClientControlDimensionGroupByArgs['orderBy'];
    } : {
        orderBy?: ClientControlDimensionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ClientControlDimensionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientControlDimensionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ClientControlDimensionFieldRefs;
}
export interface Prisma__ClientControlDimensionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    clientControl<T extends Prisma.ClientControlDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientControlDefaultArgs<ExtArgs>>): Prisma.Prisma__ClientControlClient<runtime.Types.Result.GetResult<Prisma.$ClientControlPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ClientControlDimensionFieldRefs {
    readonly id: Prisma.FieldRef<"ClientControlDimension", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ClientControlDimension", 'String'>;
    readonly clientControlId: Prisma.FieldRef<"ClientControlDimension", 'String'>;
    readonly dimension: Prisma.FieldRef<"ClientControlDimension", 'Dimension'>;
    readonly type: Prisma.FieldRef<"ClientControlDimension", 'ControlDimensionType'>;
    readonly requiresProbe: Prisma.FieldRef<"ClientControlDimension", 'Boolean'>;
    readonly requiresAi: Prisma.FieldRef<"ClientControlDimension", 'Boolean'>;
    readonly requiresComplianceConfirmation: Prisma.FieldRef<"ClientControlDimension", 'Boolean'>;
    readonly reasonNotApplicable: Prisma.FieldRef<"ClientControlDimension", 'String'>;
}
export type ClientControlDimensionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlDimensionSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlDimensionOmit<ExtArgs> | null;
    include?: Prisma.ClientControlDimensionInclude<ExtArgs> | null;
    where: Prisma.ClientControlDimensionWhereUniqueInput;
};
export type ClientControlDimensionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlDimensionSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlDimensionOmit<ExtArgs> | null;
    include?: Prisma.ClientControlDimensionInclude<ExtArgs> | null;
    where: Prisma.ClientControlDimensionWhereUniqueInput;
};
export type ClientControlDimensionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlDimensionSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlDimensionOmit<ExtArgs> | null;
    include?: Prisma.ClientControlDimensionInclude<ExtArgs> | null;
    where?: Prisma.ClientControlDimensionWhereInput;
    orderBy?: Prisma.ClientControlDimensionOrderByWithRelationInput | Prisma.ClientControlDimensionOrderByWithRelationInput[];
    cursor?: Prisma.ClientControlDimensionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientControlDimensionScalarFieldEnum | Prisma.ClientControlDimensionScalarFieldEnum[];
};
export type ClientControlDimensionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlDimensionSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlDimensionOmit<ExtArgs> | null;
    include?: Prisma.ClientControlDimensionInclude<ExtArgs> | null;
    where?: Prisma.ClientControlDimensionWhereInput;
    orderBy?: Prisma.ClientControlDimensionOrderByWithRelationInput | Prisma.ClientControlDimensionOrderByWithRelationInput[];
    cursor?: Prisma.ClientControlDimensionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientControlDimensionScalarFieldEnum | Prisma.ClientControlDimensionScalarFieldEnum[];
};
export type ClientControlDimensionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlDimensionSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlDimensionOmit<ExtArgs> | null;
    include?: Prisma.ClientControlDimensionInclude<ExtArgs> | null;
    where?: Prisma.ClientControlDimensionWhereInput;
    orderBy?: Prisma.ClientControlDimensionOrderByWithRelationInput | Prisma.ClientControlDimensionOrderByWithRelationInput[];
    cursor?: Prisma.ClientControlDimensionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClientControlDimensionScalarFieldEnum | Prisma.ClientControlDimensionScalarFieldEnum[];
};
export type ClientControlDimensionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlDimensionSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlDimensionOmit<ExtArgs> | null;
    include?: Prisma.ClientControlDimensionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientControlDimensionCreateInput, Prisma.ClientControlDimensionUncheckedCreateInput>;
};
export type ClientControlDimensionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ClientControlDimensionCreateManyInput | Prisma.ClientControlDimensionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClientControlDimensionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlDimensionSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientControlDimensionOmit<ExtArgs> | null;
    data: Prisma.ClientControlDimensionCreateManyInput | Prisma.ClientControlDimensionCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ClientControlDimensionIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ClientControlDimensionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlDimensionSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlDimensionOmit<ExtArgs> | null;
    include?: Prisma.ClientControlDimensionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientControlDimensionUpdateInput, Prisma.ClientControlDimensionUncheckedUpdateInput>;
    where: Prisma.ClientControlDimensionWhereUniqueInput;
};
export type ClientControlDimensionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ClientControlDimensionUpdateManyMutationInput, Prisma.ClientControlDimensionUncheckedUpdateManyInput>;
    where?: Prisma.ClientControlDimensionWhereInput;
    limit?: number;
};
export type ClientControlDimensionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlDimensionSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientControlDimensionOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientControlDimensionUpdateManyMutationInput, Prisma.ClientControlDimensionUncheckedUpdateManyInput>;
    where?: Prisma.ClientControlDimensionWhereInput;
    limit?: number;
    include?: Prisma.ClientControlDimensionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ClientControlDimensionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlDimensionSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlDimensionOmit<ExtArgs> | null;
    include?: Prisma.ClientControlDimensionInclude<ExtArgs> | null;
    where: Prisma.ClientControlDimensionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientControlDimensionCreateInput, Prisma.ClientControlDimensionUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ClientControlDimensionUpdateInput, Prisma.ClientControlDimensionUncheckedUpdateInput>;
};
export type ClientControlDimensionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlDimensionSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlDimensionOmit<ExtArgs> | null;
    include?: Prisma.ClientControlDimensionInclude<ExtArgs> | null;
    where: Prisma.ClientControlDimensionWhereUniqueInput;
};
export type ClientControlDimensionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientControlDimensionWhereInput;
    limit?: number;
};
export type ClientControlDimensionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientControlDimensionSelect<ExtArgs> | null;
    omit?: Prisma.ClientControlDimensionOmit<ExtArgs> | null;
    include?: Prisma.ClientControlDimensionInclude<ExtArgs> | null;
};
export {};
