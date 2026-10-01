import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ClientRiskCauseModel = runtime.Types.Result.DefaultSelection<Prisma.$ClientRiskCausePayload>;
export type AggregateClientRiskCause = {
    _count: ClientRiskCauseCountAggregateOutputType | null;
    _min: ClientRiskCauseMinAggregateOutputType | null;
    _max: ClientRiskCauseMaxAggregateOutputType | null;
};
export type ClientRiskCauseMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientRiskId: string | null;
    clientCauseId: string | null;
};
export type ClientRiskCauseMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    clientRiskId: string | null;
    clientCauseId: string | null;
};
export type ClientRiskCauseCountAggregateOutputType = {
    id: number;
    tenantId: number;
    clientRiskId: number;
    clientCauseId: number;
    _all: number;
};
export type ClientRiskCauseMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientRiskId?: true;
    clientCauseId?: true;
};
export type ClientRiskCauseMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientRiskId?: true;
    clientCauseId?: true;
};
export type ClientRiskCauseCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    clientRiskId?: true;
    clientCauseId?: true;
    _all?: true;
};
export type ClientRiskCauseAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientRiskCauseWhereInput;
    orderBy?: Prisma.ClientRiskCauseOrderByWithRelationInput | Prisma.ClientRiskCauseOrderByWithRelationInput[];
    cursor?: Prisma.ClientRiskCauseWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ClientRiskCauseCountAggregateInputType;
    _min?: ClientRiskCauseMinAggregateInputType;
    _max?: ClientRiskCauseMaxAggregateInputType;
};
export type GetClientRiskCauseAggregateType<T extends ClientRiskCauseAggregateArgs> = {
    [P in keyof T & keyof AggregateClientRiskCause]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateClientRiskCause[P]> : Prisma.GetScalarType<T[P], AggregateClientRiskCause[P]>;
};
export type ClientRiskCauseGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientRiskCauseWhereInput;
    orderBy?: Prisma.ClientRiskCauseOrderByWithAggregationInput | Prisma.ClientRiskCauseOrderByWithAggregationInput[];
    by: Prisma.ClientRiskCauseScalarFieldEnum[] | Prisma.ClientRiskCauseScalarFieldEnum;
    having?: Prisma.ClientRiskCauseScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClientRiskCauseCountAggregateInputType | true;
    _min?: ClientRiskCauseMinAggregateInputType;
    _max?: ClientRiskCauseMaxAggregateInputType;
};
export type ClientRiskCauseGroupByOutputType = {
    id: string;
    tenantId: string;
    clientRiskId: string;
    clientCauseId: string;
    _count: ClientRiskCauseCountAggregateOutputType | null;
    _min: ClientRiskCauseMinAggregateOutputType | null;
    _max: ClientRiskCauseMaxAggregateOutputType | null;
};
type GetClientRiskCauseGroupByPayload<T extends ClientRiskCauseGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ClientRiskCauseGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ClientRiskCauseGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ClientRiskCauseGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ClientRiskCauseGroupByOutputType[P]>;
}>>;
export type ClientRiskCauseWhereInput = {
    AND?: Prisma.ClientRiskCauseWhereInput | Prisma.ClientRiskCauseWhereInput[];
    OR?: Prisma.ClientRiskCauseWhereInput[];
    NOT?: Prisma.ClientRiskCauseWhereInput | Prisma.ClientRiskCauseWhereInput[];
    id?: Prisma.UuidFilter<"ClientRiskCause"> | string;
    tenantId?: Prisma.UuidFilter<"ClientRiskCause"> | string;
    clientRiskId?: Prisma.UuidFilter<"ClientRiskCause"> | string;
    clientCauseId?: Prisma.UuidFilter<"ClientRiskCause"> | string;
    clientRisk?: Prisma.XOR<Prisma.ClientRiskScalarRelationFilter, Prisma.ClientRiskWhereInput>;
    clientCause?: Prisma.XOR<Prisma.ClientCauseScalarRelationFilter, Prisma.ClientCauseWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type ClientRiskCauseOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrder;
    clientRisk?: Prisma.ClientRiskOrderByWithRelationInput;
    clientCause?: Prisma.ClientCauseOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type ClientRiskCauseWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    clientRiskId_clientCauseId?: Prisma.ClientRiskCauseClientRiskIdClientCauseIdCompoundUniqueInput;
    AND?: Prisma.ClientRiskCauseWhereInput | Prisma.ClientRiskCauseWhereInput[];
    OR?: Prisma.ClientRiskCauseWhereInput[];
    NOT?: Prisma.ClientRiskCauseWhereInput | Prisma.ClientRiskCauseWhereInput[];
    tenantId?: Prisma.UuidFilter<"ClientRiskCause"> | string;
    clientRiskId?: Prisma.UuidFilter<"ClientRiskCause"> | string;
    clientCauseId?: Prisma.UuidFilter<"ClientRiskCause"> | string;
    clientRisk?: Prisma.XOR<Prisma.ClientRiskScalarRelationFilter, Prisma.ClientRiskWhereInput>;
    clientCause?: Prisma.XOR<Prisma.ClientCauseScalarRelationFilter, Prisma.ClientCauseWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id" | "clientRiskId_clientCauseId">;
export type ClientRiskCauseOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrder;
    _count?: Prisma.ClientRiskCauseCountOrderByAggregateInput;
    _max?: Prisma.ClientRiskCauseMaxOrderByAggregateInput;
    _min?: Prisma.ClientRiskCauseMinOrderByAggregateInput;
};
export type ClientRiskCauseScalarWhereWithAggregatesInput = {
    AND?: Prisma.ClientRiskCauseScalarWhereWithAggregatesInput | Prisma.ClientRiskCauseScalarWhereWithAggregatesInput[];
    OR?: Prisma.ClientRiskCauseScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ClientRiskCauseScalarWhereWithAggregatesInput | Prisma.ClientRiskCauseScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ClientRiskCause"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ClientRiskCause"> | string;
    clientRiskId?: Prisma.UuidWithAggregatesFilter<"ClientRiskCause"> | string;
    clientCauseId?: Prisma.UuidWithAggregatesFilter<"ClientRiskCause"> | string;
};
export type ClientRiskCauseCreateInput = {
    id?: string;
    clientRisk: Prisma.ClientRiskCreateNestedOneWithoutRiskCausesInput;
    clientCause: Prisma.ClientCauseCreateNestedOneWithoutRiskCausesInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientRiskCausesInput;
};
export type ClientRiskCauseUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    clientRiskId: string;
    clientCauseId: string;
};
export type ClientRiskCauseUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRisk?: Prisma.ClientRiskUpdateOneRequiredWithoutRiskCausesNestedInput;
    clientCause?: Prisma.ClientCauseUpdateOneRequiredWithoutRiskCausesNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientRiskCausesNestedInput;
};
export type ClientRiskCauseUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientRiskCauseCreateManyInput = {
    id?: string;
    tenantId: string;
    clientRiskId: string;
    clientCauseId: string;
};
export type ClientRiskCauseUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientRiskCauseUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientRiskCauseListRelationFilter = {
    every?: Prisma.ClientRiskCauseWhereInput;
    some?: Prisma.ClientRiskCauseWhereInput;
    none?: Prisma.ClientRiskCauseWhereInput;
};
export type ClientRiskCauseOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ClientRiskCauseClientRiskIdClientCauseIdCompoundUniqueInput = {
    clientRiskId: string;
    clientCauseId: string;
};
export type ClientRiskCauseCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrder;
};
export type ClientRiskCauseMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrder;
};
export type ClientRiskCauseMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    clientRiskId?: Prisma.SortOrder;
    clientCauseId?: Prisma.SortOrder;
};
export type ClientRiskCauseCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutTenantInput, Prisma.ClientRiskCauseUncheckedCreateWithoutTenantInput> | Prisma.ClientRiskCauseCreateWithoutTenantInput[] | Prisma.ClientRiskCauseUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientRiskCauseCreateOrConnectWithoutTenantInput | Prisma.ClientRiskCauseCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ClientRiskCauseCreateManyTenantInputEnvelope;
    connect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
};
export type ClientRiskCauseUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutTenantInput, Prisma.ClientRiskCauseUncheckedCreateWithoutTenantInput> | Prisma.ClientRiskCauseCreateWithoutTenantInput[] | Prisma.ClientRiskCauseUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientRiskCauseCreateOrConnectWithoutTenantInput | Prisma.ClientRiskCauseCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ClientRiskCauseCreateManyTenantInputEnvelope;
    connect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
};
export type ClientRiskCauseUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutTenantInput, Prisma.ClientRiskCauseUncheckedCreateWithoutTenantInput> | Prisma.ClientRiskCauseCreateWithoutTenantInput[] | Prisma.ClientRiskCauseUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientRiskCauseCreateOrConnectWithoutTenantInput | Prisma.ClientRiskCauseCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ClientRiskCauseUpsertWithWhereUniqueWithoutTenantInput | Prisma.ClientRiskCauseUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ClientRiskCauseCreateManyTenantInputEnvelope;
    set?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    disconnect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    delete?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    connect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    update?: Prisma.ClientRiskCauseUpdateWithWhereUniqueWithoutTenantInput | Prisma.ClientRiskCauseUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ClientRiskCauseUpdateManyWithWhereWithoutTenantInput | Prisma.ClientRiskCauseUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ClientRiskCauseScalarWhereInput | Prisma.ClientRiskCauseScalarWhereInput[];
};
export type ClientRiskCauseUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutTenantInput, Prisma.ClientRiskCauseUncheckedCreateWithoutTenantInput> | Prisma.ClientRiskCauseCreateWithoutTenantInput[] | Prisma.ClientRiskCauseUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ClientRiskCauseCreateOrConnectWithoutTenantInput | Prisma.ClientRiskCauseCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ClientRiskCauseUpsertWithWhereUniqueWithoutTenantInput | Prisma.ClientRiskCauseUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ClientRiskCauseCreateManyTenantInputEnvelope;
    set?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    disconnect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    delete?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    connect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    update?: Prisma.ClientRiskCauseUpdateWithWhereUniqueWithoutTenantInput | Prisma.ClientRiskCauseUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ClientRiskCauseUpdateManyWithWhereWithoutTenantInput | Prisma.ClientRiskCauseUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ClientRiskCauseScalarWhereInput | Prisma.ClientRiskCauseScalarWhereInput[];
};
export type ClientRiskCauseCreateNestedManyWithoutClientRiskInput = {
    create?: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutClientRiskInput, Prisma.ClientRiskCauseUncheckedCreateWithoutClientRiskInput> | Prisma.ClientRiskCauseCreateWithoutClientRiskInput[] | Prisma.ClientRiskCauseUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.ClientRiskCauseCreateOrConnectWithoutClientRiskInput | Prisma.ClientRiskCauseCreateOrConnectWithoutClientRiskInput[];
    createMany?: Prisma.ClientRiskCauseCreateManyClientRiskInputEnvelope;
    connect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
};
export type ClientRiskCauseUncheckedCreateNestedManyWithoutClientRiskInput = {
    create?: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutClientRiskInput, Prisma.ClientRiskCauseUncheckedCreateWithoutClientRiskInput> | Prisma.ClientRiskCauseCreateWithoutClientRiskInput[] | Prisma.ClientRiskCauseUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.ClientRiskCauseCreateOrConnectWithoutClientRiskInput | Prisma.ClientRiskCauseCreateOrConnectWithoutClientRiskInput[];
    createMany?: Prisma.ClientRiskCauseCreateManyClientRiskInputEnvelope;
    connect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
};
export type ClientRiskCauseUpdateManyWithoutClientRiskNestedInput = {
    create?: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutClientRiskInput, Prisma.ClientRiskCauseUncheckedCreateWithoutClientRiskInput> | Prisma.ClientRiskCauseCreateWithoutClientRiskInput[] | Prisma.ClientRiskCauseUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.ClientRiskCauseCreateOrConnectWithoutClientRiskInput | Prisma.ClientRiskCauseCreateOrConnectWithoutClientRiskInput[];
    upsert?: Prisma.ClientRiskCauseUpsertWithWhereUniqueWithoutClientRiskInput | Prisma.ClientRiskCauseUpsertWithWhereUniqueWithoutClientRiskInput[];
    createMany?: Prisma.ClientRiskCauseCreateManyClientRiskInputEnvelope;
    set?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    disconnect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    delete?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    connect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    update?: Prisma.ClientRiskCauseUpdateWithWhereUniqueWithoutClientRiskInput | Prisma.ClientRiskCauseUpdateWithWhereUniqueWithoutClientRiskInput[];
    updateMany?: Prisma.ClientRiskCauseUpdateManyWithWhereWithoutClientRiskInput | Prisma.ClientRiskCauseUpdateManyWithWhereWithoutClientRiskInput[];
    deleteMany?: Prisma.ClientRiskCauseScalarWhereInput | Prisma.ClientRiskCauseScalarWhereInput[];
};
export type ClientRiskCauseUncheckedUpdateManyWithoutClientRiskNestedInput = {
    create?: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutClientRiskInput, Prisma.ClientRiskCauseUncheckedCreateWithoutClientRiskInput> | Prisma.ClientRiskCauseCreateWithoutClientRiskInput[] | Prisma.ClientRiskCauseUncheckedCreateWithoutClientRiskInput[];
    connectOrCreate?: Prisma.ClientRiskCauseCreateOrConnectWithoutClientRiskInput | Prisma.ClientRiskCauseCreateOrConnectWithoutClientRiskInput[];
    upsert?: Prisma.ClientRiskCauseUpsertWithWhereUniqueWithoutClientRiskInput | Prisma.ClientRiskCauseUpsertWithWhereUniqueWithoutClientRiskInput[];
    createMany?: Prisma.ClientRiskCauseCreateManyClientRiskInputEnvelope;
    set?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    disconnect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    delete?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    connect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    update?: Prisma.ClientRiskCauseUpdateWithWhereUniqueWithoutClientRiskInput | Prisma.ClientRiskCauseUpdateWithWhereUniqueWithoutClientRiskInput[];
    updateMany?: Prisma.ClientRiskCauseUpdateManyWithWhereWithoutClientRiskInput | Prisma.ClientRiskCauseUpdateManyWithWhereWithoutClientRiskInput[];
    deleteMany?: Prisma.ClientRiskCauseScalarWhereInput | Prisma.ClientRiskCauseScalarWhereInput[];
};
export type ClientRiskCauseCreateNestedManyWithoutClientCauseInput = {
    create?: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutClientCauseInput, Prisma.ClientRiskCauseUncheckedCreateWithoutClientCauseInput> | Prisma.ClientRiskCauseCreateWithoutClientCauseInput[] | Prisma.ClientRiskCauseUncheckedCreateWithoutClientCauseInput[];
    connectOrCreate?: Prisma.ClientRiskCauseCreateOrConnectWithoutClientCauseInput | Prisma.ClientRiskCauseCreateOrConnectWithoutClientCauseInput[];
    createMany?: Prisma.ClientRiskCauseCreateManyClientCauseInputEnvelope;
    connect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
};
export type ClientRiskCauseUncheckedCreateNestedManyWithoutClientCauseInput = {
    create?: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutClientCauseInput, Prisma.ClientRiskCauseUncheckedCreateWithoutClientCauseInput> | Prisma.ClientRiskCauseCreateWithoutClientCauseInput[] | Prisma.ClientRiskCauseUncheckedCreateWithoutClientCauseInput[];
    connectOrCreate?: Prisma.ClientRiskCauseCreateOrConnectWithoutClientCauseInput | Prisma.ClientRiskCauseCreateOrConnectWithoutClientCauseInput[];
    createMany?: Prisma.ClientRiskCauseCreateManyClientCauseInputEnvelope;
    connect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
};
export type ClientRiskCauseUpdateManyWithoutClientCauseNestedInput = {
    create?: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutClientCauseInput, Prisma.ClientRiskCauseUncheckedCreateWithoutClientCauseInput> | Prisma.ClientRiskCauseCreateWithoutClientCauseInput[] | Prisma.ClientRiskCauseUncheckedCreateWithoutClientCauseInput[];
    connectOrCreate?: Prisma.ClientRiskCauseCreateOrConnectWithoutClientCauseInput | Prisma.ClientRiskCauseCreateOrConnectWithoutClientCauseInput[];
    upsert?: Prisma.ClientRiskCauseUpsertWithWhereUniqueWithoutClientCauseInput | Prisma.ClientRiskCauseUpsertWithWhereUniqueWithoutClientCauseInput[];
    createMany?: Prisma.ClientRiskCauseCreateManyClientCauseInputEnvelope;
    set?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    disconnect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    delete?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    connect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    update?: Prisma.ClientRiskCauseUpdateWithWhereUniqueWithoutClientCauseInput | Prisma.ClientRiskCauseUpdateWithWhereUniqueWithoutClientCauseInput[];
    updateMany?: Prisma.ClientRiskCauseUpdateManyWithWhereWithoutClientCauseInput | Prisma.ClientRiskCauseUpdateManyWithWhereWithoutClientCauseInput[];
    deleteMany?: Prisma.ClientRiskCauseScalarWhereInput | Prisma.ClientRiskCauseScalarWhereInput[];
};
export type ClientRiskCauseUncheckedUpdateManyWithoutClientCauseNestedInput = {
    create?: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutClientCauseInput, Prisma.ClientRiskCauseUncheckedCreateWithoutClientCauseInput> | Prisma.ClientRiskCauseCreateWithoutClientCauseInput[] | Prisma.ClientRiskCauseUncheckedCreateWithoutClientCauseInput[];
    connectOrCreate?: Prisma.ClientRiskCauseCreateOrConnectWithoutClientCauseInput | Prisma.ClientRiskCauseCreateOrConnectWithoutClientCauseInput[];
    upsert?: Prisma.ClientRiskCauseUpsertWithWhereUniqueWithoutClientCauseInput | Prisma.ClientRiskCauseUpsertWithWhereUniqueWithoutClientCauseInput[];
    createMany?: Prisma.ClientRiskCauseCreateManyClientCauseInputEnvelope;
    set?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    disconnect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    delete?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    connect?: Prisma.ClientRiskCauseWhereUniqueInput | Prisma.ClientRiskCauseWhereUniqueInput[];
    update?: Prisma.ClientRiskCauseUpdateWithWhereUniqueWithoutClientCauseInput | Prisma.ClientRiskCauseUpdateWithWhereUniqueWithoutClientCauseInput[];
    updateMany?: Prisma.ClientRiskCauseUpdateManyWithWhereWithoutClientCauseInput | Prisma.ClientRiskCauseUpdateManyWithWhereWithoutClientCauseInput[];
    deleteMany?: Prisma.ClientRiskCauseScalarWhereInput | Prisma.ClientRiskCauseScalarWhereInput[];
};
export type ClientRiskCauseCreateWithoutTenantInput = {
    id?: string;
    clientRisk: Prisma.ClientRiskCreateNestedOneWithoutRiskCausesInput;
    clientCause: Prisma.ClientCauseCreateNestedOneWithoutRiskCausesInput;
};
export type ClientRiskCauseUncheckedCreateWithoutTenantInput = {
    id?: string;
    clientRiskId: string;
    clientCauseId: string;
};
export type ClientRiskCauseCreateOrConnectWithoutTenantInput = {
    where: Prisma.ClientRiskCauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutTenantInput, Prisma.ClientRiskCauseUncheckedCreateWithoutTenantInput>;
};
export type ClientRiskCauseCreateManyTenantInputEnvelope = {
    data: Prisma.ClientRiskCauseCreateManyTenantInput | Prisma.ClientRiskCauseCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ClientRiskCauseUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ClientRiskCauseWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientRiskCauseUpdateWithoutTenantInput, Prisma.ClientRiskCauseUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutTenantInput, Prisma.ClientRiskCauseUncheckedCreateWithoutTenantInput>;
};
export type ClientRiskCauseUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ClientRiskCauseWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientRiskCauseUpdateWithoutTenantInput, Prisma.ClientRiskCauseUncheckedUpdateWithoutTenantInput>;
};
export type ClientRiskCauseUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ClientRiskCauseScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientRiskCauseUpdateManyMutationInput, Prisma.ClientRiskCauseUncheckedUpdateManyWithoutTenantInput>;
};
export type ClientRiskCauseScalarWhereInput = {
    AND?: Prisma.ClientRiskCauseScalarWhereInput | Prisma.ClientRiskCauseScalarWhereInput[];
    OR?: Prisma.ClientRiskCauseScalarWhereInput[];
    NOT?: Prisma.ClientRiskCauseScalarWhereInput | Prisma.ClientRiskCauseScalarWhereInput[];
    id?: Prisma.UuidFilter<"ClientRiskCause"> | string;
    tenantId?: Prisma.UuidFilter<"ClientRiskCause"> | string;
    clientRiskId?: Prisma.UuidFilter<"ClientRiskCause"> | string;
    clientCauseId?: Prisma.UuidFilter<"ClientRiskCause"> | string;
};
export type ClientRiskCauseCreateWithoutClientRiskInput = {
    id?: string;
    clientCause: Prisma.ClientCauseCreateNestedOneWithoutRiskCausesInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientRiskCausesInput;
};
export type ClientRiskCauseUncheckedCreateWithoutClientRiskInput = {
    id?: string;
    tenantId: string;
    clientCauseId: string;
};
export type ClientRiskCauseCreateOrConnectWithoutClientRiskInput = {
    where: Prisma.ClientRiskCauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutClientRiskInput, Prisma.ClientRiskCauseUncheckedCreateWithoutClientRiskInput>;
};
export type ClientRiskCauseCreateManyClientRiskInputEnvelope = {
    data: Prisma.ClientRiskCauseCreateManyClientRiskInput | Prisma.ClientRiskCauseCreateManyClientRiskInput[];
    skipDuplicates?: boolean;
};
export type ClientRiskCauseUpsertWithWhereUniqueWithoutClientRiskInput = {
    where: Prisma.ClientRiskCauseWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientRiskCauseUpdateWithoutClientRiskInput, Prisma.ClientRiskCauseUncheckedUpdateWithoutClientRiskInput>;
    create: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutClientRiskInput, Prisma.ClientRiskCauseUncheckedCreateWithoutClientRiskInput>;
};
export type ClientRiskCauseUpdateWithWhereUniqueWithoutClientRiskInput = {
    where: Prisma.ClientRiskCauseWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientRiskCauseUpdateWithoutClientRiskInput, Prisma.ClientRiskCauseUncheckedUpdateWithoutClientRiskInput>;
};
export type ClientRiskCauseUpdateManyWithWhereWithoutClientRiskInput = {
    where: Prisma.ClientRiskCauseScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientRiskCauseUpdateManyMutationInput, Prisma.ClientRiskCauseUncheckedUpdateManyWithoutClientRiskInput>;
};
export type ClientRiskCauseCreateWithoutClientCauseInput = {
    id?: string;
    clientRisk: Prisma.ClientRiskCreateNestedOneWithoutRiskCausesInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutClientRiskCausesInput;
};
export type ClientRiskCauseUncheckedCreateWithoutClientCauseInput = {
    id?: string;
    tenantId: string;
    clientRiskId: string;
};
export type ClientRiskCauseCreateOrConnectWithoutClientCauseInput = {
    where: Prisma.ClientRiskCauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutClientCauseInput, Prisma.ClientRiskCauseUncheckedCreateWithoutClientCauseInput>;
};
export type ClientRiskCauseCreateManyClientCauseInputEnvelope = {
    data: Prisma.ClientRiskCauseCreateManyClientCauseInput | Prisma.ClientRiskCauseCreateManyClientCauseInput[];
    skipDuplicates?: boolean;
};
export type ClientRiskCauseUpsertWithWhereUniqueWithoutClientCauseInput = {
    where: Prisma.ClientRiskCauseWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClientRiskCauseUpdateWithoutClientCauseInput, Prisma.ClientRiskCauseUncheckedUpdateWithoutClientCauseInput>;
    create: Prisma.XOR<Prisma.ClientRiskCauseCreateWithoutClientCauseInput, Prisma.ClientRiskCauseUncheckedCreateWithoutClientCauseInput>;
};
export type ClientRiskCauseUpdateWithWhereUniqueWithoutClientCauseInput = {
    where: Prisma.ClientRiskCauseWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClientRiskCauseUpdateWithoutClientCauseInput, Prisma.ClientRiskCauseUncheckedUpdateWithoutClientCauseInput>;
};
export type ClientRiskCauseUpdateManyWithWhereWithoutClientCauseInput = {
    where: Prisma.ClientRiskCauseScalarWhereInput;
    data: Prisma.XOR<Prisma.ClientRiskCauseUpdateManyMutationInput, Prisma.ClientRiskCauseUncheckedUpdateManyWithoutClientCauseInput>;
};
export type ClientRiskCauseCreateManyTenantInput = {
    id?: string;
    clientRiskId: string;
    clientCauseId: string;
};
export type ClientRiskCauseUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRisk?: Prisma.ClientRiskUpdateOneRequiredWithoutRiskCausesNestedInput;
    clientCause?: Prisma.ClientCauseUpdateOneRequiredWithoutRiskCausesNestedInput;
};
export type ClientRiskCauseUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientRiskCauseUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientRiskCauseCreateManyClientRiskInput = {
    id?: string;
    tenantId: string;
    clientCauseId: string;
};
export type ClientRiskCauseUpdateWithoutClientRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCause?: Prisma.ClientCauseUpdateOneRequiredWithoutRiskCausesNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientRiskCausesNestedInput;
};
export type ClientRiskCauseUncheckedUpdateWithoutClientRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientRiskCauseUncheckedUpdateManyWithoutClientRiskInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientCauseId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientRiskCauseCreateManyClientCauseInput = {
    id?: string;
    tenantId: string;
    clientRiskId: string;
};
export type ClientRiskCauseUpdateWithoutClientCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRisk?: Prisma.ClientRiskUpdateOneRequiredWithoutRiskCausesNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutClientRiskCausesNestedInput;
};
export type ClientRiskCauseUncheckedUpdateWithoutClientCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientRiskCauseUncheckedUpdateManyWithoutClientCauseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    clientRiskId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ClientRiskCauseSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientRiskId?: boolean;
    clientCauseId?: boolean;
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    clientCause?: boolean | Prisma.ClientCauseDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientRiskCause"]>;
export type ClientRiskCauseSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientRiskId?: boolean;
    clientCauseId?: boolean;
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    clientCause?: boolean | Prisma.ClientCauseDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientRiskCause"]>;
export type ClientRiskCauseSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    clientRiskId?: boolean;
    clientCauseId?: boolean;
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    clientCause?: boolean | Prisma.ClientCauseDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["clientRiskCause"]>;
export type ClientRiskCauseSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    clientRiskId?: boolean;
    clientCauseId?: boolean;
};
export type ClientRiskCauseOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "clientRiskId" | "clientCauseId", ExtArgs["result"]["clientRiskCause"]>;
export type ClientRiskCauseInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    clientCause?: boolean | Prisma.ClientCauseDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ClientRiskCauseIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    clientCause?: boolean | Prisma.ClientCauseDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ClientRiskCauseIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    clientRisk?: boolean | Prisma.ClientRiskDefaultArgs<ExtArgs>;
    clientCause?: boolean | Prisma.ClientCauseDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ClientRiskCausePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ClientRiskCause";
    objects: {
        clientRisk: Prisma.$ClientRiskPayload<ExtArgs>;
        clientCause: Prisma.$ClientCausePayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        clientRiskId: string;
        clientCauseId: string;
    }, ExtArgs["result"]["clientRiskCause"]>;
    composites: {};
};
export type ClientRiskCauseGetPayload<S extends boolean | null | undefined | ClientRiskCauseDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ClientRiskCausePayload, S>;
export type ClientRiskCauseCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ClientRiskCauseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClientRiskCauseCountAggregateInputType | true;
};
export interface ClientRiskCauseDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ClientRiskCause'];
        meta: {
            name: 'ClientRiskCause';
        };
    };
    findUnique<T extends ClientRiskCauseFindUniqueArgs>(args: Prisma.SelectSubset<T, ClientRiskCauseFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ClientRiskCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientRiskCausePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ClientRiskCauseFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ClientRiskCauseFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientRiskCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientRiskCausePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ClientRiskCauseFindFirstArgs>(args?: Prisma.SelectSubset<T, ClientRiskCauseFindFirstArgs<ExtArgs>>): Prisma.Prisma__ClientRiskCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientRiskCausePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ClientRiskCauseFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ClientRiskCauseFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClientRiskCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientRiskCausePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ClientRiskCauseFindManyArgs>(args?: Prisma.SelectSubset<T, ClientRiskCauseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientRiskCausePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ClientRiskCauseCreateArgs>(args: Prisma.SelectSubset<T, ClientRiskCauseCreateArgs<ExtArgs>>): Prisma.Prisma__ClientRiskCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientRiskCausePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ClientRiskCauseCreateManyArgs>(args?: Prisma.SelectSubset<T, ClientRiskCauseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ClientRiskCauseCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ClientRiskCauseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientRiskCausePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ClientRiskCauseDeleteArgs>(args: Prisma.SelectSubset<T, ClientRiskCauseDeleteArgs<ExtArgs>>): Prisma.Prisma__ClientRiskCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientRiskCausePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ClientRiskCauseUpdateArgs>(args: Prisma.SelectSubset<T, ClientRiskCauseUpdateArgs<ExtArgs>>): Prisma.Prisma__ClientRiskCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientRiskCausePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ClientRiskCauseDeleteManyArgs>(args?: Prisma.SelectSubset<T, ClientRiskCauseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ClientRiskCauseUpdateManyArgs>(args: Prisma.SelectSubset<T, ClientRiskCauseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ClientRiskCauseUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ClientRiskCauseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClientRiskCausePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ClientRiskCauseUpsertArgs>(args: Prisma.SelectSubset<T, ClientRiskCauseUpsertArgs<ExtArgs>>): Prisma.Prisma__ClientRiskCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientRiskCausePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ClientRiskCauseCountArgs>(args?: Prisma.Subset<T, ClientRiskCauseCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ClientRiskCauseCountAggregateOutputType> : number>;
    aggregate<T extends ClientRiskCauseAggregateArgs>(args: Prisma.Subset<T, ClientRiskCauseAggregateArgs>): Prisma.PrismaPromise<GetClientRiskCauseAggregateType<T>>;
    groupBy<T extends ClientRiskCauseGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ClientRiskCauseGroupByArgs['orderBy'];
    } : {
        orderBy?: ClientRiskCauseGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ClientRiskCauseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientRiskCauseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ClientRiskCauseFieldRefs;
}
export interface Prisma__ClientRiskCauseClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    clientRisk<T extends Prisma.ClientRiskDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientRiskDefaultArgs<ExtArgs>>): Prisma.Prisma__ClientRiskClient<runtime.Types.Result.GetResult<Prisma.$ClientRiskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    clientCause<T extends Prisma.ClientCauseDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClientCauseDefaultArgs<ExtArgs>>): Prisma.Prisma__ClientCauseClient<runtime.Types.Result.GetResult<Prisma.$ClientCausePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ClientRiskCauseFieldRefs {
    readonly id: Prisma.FieldRef<"ClientRiskCause", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ClientRiskCause", 'String'>;
    readonly clientRiskId: Prisma.FieldRef<"ClientRiskCause", 'String'>;
    readonly clientCauseId: Prisma.FieldRef<"ClientRiskCause", 'String'>;
}
export type ClientRiskCauseFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientRiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientRiskCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientRiskCauseInclude<ExtArgs> | null;
    where: Prisma.ClientRiskCauseWhereUniqueInput;
};
export type ClientRiskCauseFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientRiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientRiskCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientRiskCauseInclude<ExtArgs> | null;
    where: Prisma.ClientRiskCauseWhereUniqueInput;
};
export type ClientRiskCauseFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClientRiskCauseFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClientRiskCauseFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClientRiskCauseCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientRiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientRiskCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientRiskCauseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientRiskCauseCreateInput, Prisma.ClientRiskCauseUncheckedCreateInput>;
};
export type ClientRiskCauseCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ClientRiskCauseCreateManyInput | Prisma.ClientRiskCauseCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClientRiskCauseCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientRiskCauseSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientRiskCauseOmit<ExtArgs> | null;
    data: Prisma.ClientRiskCauseCreateManyInput | Prisma.ClientRiskCauseCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ClientRiskCauseIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ClientRiskCauseUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientRiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientRiskCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientRiskCauseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientRiskCauseUpdateInput, Prisma.ClientRiskCauseUncheckedUpdateInput>;
    where: Prisma.ClientRiskCauseWhereUniqueInput;
};
export type ClientRiskCauseUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ClientRiskCauseUpdateManyMutationInput, Prisma.ClientRiskCauseUncheckedUpdateManyInput>;
    where?: Prisma.ClientRiskCauseWhereInput;
    limit?: number;
};
export type ClientRiskCauseUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientRiskCauseSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClientRiskCauseOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClientRiskCauseUpdateManyMutationInput, Prisma.ClientRiskCauseUncheckedUpdateManyInput>;
    where?: Prisma.ClientRiskCauseWhereInput;
    limit?: number;
    include?: Prisma.ClientRiskCauseIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ClientRiskCauseUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientRiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientRiskCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientRiskCauseInclude<ExtArgs> | null;
    where: Prisma.ClientRiskCauseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClientRiskCauseCreateInput, Prisma.ClientRiskCauseUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ClientRiskCauseUpdateInput, Prisma.ClientRiskCauseUncheckedUpdateInput>;
};
export type ClientRiskCauseDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientRiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientRiskCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientRiskCauseInclude<ExtArgs> | null;
    where: Prisma.ClientRiskCauseWhereUniqueInput;
};
export type ClientRiskCauseDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClientRiskCauseWhereInput;
    limit?: number;
};
export type ClientRiskCauseDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClientRiskCauseSelect<ExtArgs> | null;
    omit?: Prisma.ClientRiskCauseOmit<ExtArgs> | null;
    include?: Prisma.ClientRiskCauseInclude<ExtArgs> | null;
};
export {};
