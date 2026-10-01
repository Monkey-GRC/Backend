import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CsocModel = runtime.Types.Result.DefaultSelection<Prisma.$CsocPayload>;
export type AggregateCsoc = {
    _count: CsocCountAggregateOutputType | null;
    _min: CsocMinAggregateOutputType | null;
    _max: CsocMaxAggregateOutputType | null;
};
export type CsocMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    subserviceOrganizationId: string | null;
    expectedControl: string | null;
};
export type CsocMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    subserviceOrganizationId: string | null;
    expectedControl: string | null;
};
export type CsocCountAggregateOutputType = {
    id: number;
    tenantId: number;
    subserviceOrganizationId: number;
    expectedControl: number;
    _all: number;
};
export type CsocMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    subserviceOrganizationId?: true;
    expectedControl?: true;
};
export type CsocMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    subserviceOrganizationId?: true;
    expectedControl?: true;
};
export type CsocCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    subserviceOrganizationId?: true;
    expectedControl?: true;
    _all?: true;
};
export type CsocAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CsocWhereInput;
    orderBy?: Prisma.CsocOrderByWithRelationInput | Prisma.CsocOrderByWithRelationInput[];
    cursor?: Prisma.CsocWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CsocCountAggregateInputType;
    _min?: CsocMinAggregateInputType;
    _max?: CsocMaxAggregateInputType;
};
export type GetCsocAggregateType<T extends CsocAggregateArgs> = {
    [P in keyof T & keyof AggregateCsoc]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCsoc[P]> : Prisma.GetScalarType<T[P], AggregateCsoc[P]>;
};
export type CsocGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CsocWhereInput;
    orderBy?: Prisma.CsocOrderByWithAggregationInput | Prisma.CsocOrderByWithAggregationInput[];
    by: Prisma.CsocScalarFieldEnum[] | Prisma.CsocScalarFieldEnum;
    having?: Prisma.CsocScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CsocCountAggregateInputType | true;
    _min?: CsocMinAggregateInputType;
    _max?: CsocMaxAggregateInputType;
};
export type CsocGroupByOutputType = {
    id: string;
    tenantId: string;
    subserviceOrganizationId: string;
    expectedControl: string;
    _count: CsocCountAggregateOutputType | null;
    _min: CsocMinAggregateOutputType | null;
    _max: CsocMaxAggregateOutputType | null;
};
type GetCsocGroupByPayload<T extends CsocGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CsocGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CsocGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CsocGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CsocGroupByOutputType[P]>;
}>>;
export type CsocWhereInput = {
    AND?: Prisma.CsocWhereInput | Prisma.CsocWhereInput[];
    OR?: Prisma.CsocWhereInput[];
    NOT?: Prisma.CsocWhereInput | Prisma.CsocWhereInput[];
    id?: Prisma.UuidFilter<"Csoc"> | string;
    tenantId?: Prisma.UuidFilter<"Csoc"> | string;
    subserviceOrganizationId?: Prisma.UuidFilter<"Csoc"> | string;
    expectedControl?: Prisma.StringFilter<"Csoc"> | string;
    subserviceOrganization?: Prisma.XOR<Prisma.SubserviceOrganizationScalarRelationFilter, Prisma.SubserviceOrganizationWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type CsocOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    subserviceOrganizationId?: Prisma.SortOrder;
    expectedControl?: Prisma.SortOrder;
    subserviceOrganization?: Prisma.SubserviceOrganizationOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type CsocWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.CsocWhereInput | Prisma.CsocWhereInput[];
    OR?: Prisma.CsocWhereInput[];
    NOT?: Prisma.CsocWhereInput | Prisma.CsocWhereInput[];
    tenantId?: Prisma.UuidFilter<"Csoc"> | string;
    subserviceOrganizationId?: Prisma.UuidFilter<"Csoc"> | string;
    expectedControl?: Prisma.StringFilter<"Csoc"> | string;
    subserviceOrganization?: Prisma.XOR<Prisma.SubserviceOrganizationScalarRelationFilter, Prisma.SubserviceOrganizationWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id">;
export type CsocOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    subserviceOrganizationId?: Prisma.SortOrder;
    expectedControl?: Prisma.SortOrder;
    _count?: Prisma.CsocCountOrderByAggregateInput;
    _max?: Prisma.CsocMaxOrderByAggregateInput;
    _min?: Prisma.CsocMinOrderByAggregateInput;
};
export type CsocScalarWhereWithAggregatesInput = {
    AND?: Prisma.CsocScalarWhereWithAggregatesInput | Prisma.CsocScalarWhereWithAggregatesInput[];
    OR?: Prisma.CsocScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CsocScalarWhereWithAggregatesInput | Prisma.CsocScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Csoc"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"Csoc"> | string;
    subserviceOrganizationId?: Prisma.UuidWithAggregatesFilter<"Csoc"> | string;
    expectedControl?: Prisma.StringWithAggregatesFilter<"Csoc"> | string;
};
export type CsocCreateInput = {
    id?: string;
    expectedControl: string;
    subserviceOrganization: Prisma.SubserviceOrganizationCreateNestedOneWithoutCsocsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutCsocsInput;
};
export type CsocUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    subserviceOrganizationId: string;
    expectedControl: string;
};
export type CsocUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
    subserviceOrganization?: Prisma.SubserviceOrganizationUpdateOneRequiredWithoutCsocsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutCsocsNestedInput;
};
export type CsocUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    subserviceOrganizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CsocCreateManyInput = {
    id?: string;
    tenantId: string;
    subserviceOrganizationId: string;
    expectedControl: string;
};
export type CsocUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CsocUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    subserviceOrganizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CsocListRelationFilter = {
    every?: Prisma.CsocWhereInput;
    some?: Prisma.CsocWhereInput;
    none?: Prisma.CsocWhereInput;
};
export type CsocOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CsocCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    subserviceOrganizationId?: Prisma.SortOrder;
    expectedControl?: Prisma.SortOrder;
};
export type CsocMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    subserviceOrganizationId?: Prisma.SortOrder;
    expectedControl?: Prisma.SortOrder;
};
export type CsocMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    subserviceOrganizationId?: Prisma.SortOrder;
    expectedControl?: Prisma.SortOrder;
};
export type CsocCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.CsocCreateWithoutTenantInput, Prisma.CsocUncheckedCreateWithoutTenantInput> | Prisma.CsocCreateWithoutTenantInput[] | Prisma.CsocUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.CsocCreateOrConnectWithoutTenantInput | Prisma.CsocCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.CsocCreateManyTenantInputEnvelope;
    connect?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
};
export type CsocUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.CsocCreateWithoutTenantInput, Prisma.CsocUncheckedCreateWithoutTenantInput> | Prisma.CsocCreateWithoutTenantInput[] | Prisma.CsocUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.CsocCreateOrConnectWithoutTenantInput | Prisma.CsocCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.CsocCreateManyTenantInputEnvelope;
    connect?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
};
export type CsocUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.CsocCreateWithoutTenantInput, Prisma.CsocUncheckedCreateWithoutTenantInput> | Prisma.CsocCreateWithoutTenantInput[] | Prisma.CsocUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.CsocCreateOrConnectWithoutTenantInput | Prisma.CsocCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.CsocUpsertWithWhereUniqueWithoutTenantInput | Prisma.CsocUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.CsocCreateManyTenantInputEnvelope;
    set?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    disconnect?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    delete?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    connect?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    update?: Prisma.CsocUpdateWithWhereUniqueWithoutTenantInput | Prisma.CsocUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.CsocUpdateManyWithWhereWithoutTenantInput | Prisma.CsocUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.CsocScalarWhereInput | Prisma.CsocScalarWhereInput[];
};
export type CsocUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.CsocCreateWithoutTenantInput, Prisma.CsocUncheckedCreateWithoutTenantInput> | Prisma.CsocCreateWithoutTenantInput[] | Prisma.CsocUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.CsocCreateOrConnectWithoutTenantInput | Prisma.CsocCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.CsocUpsertWithWhereUniqueWithoutTenantInput | Prisma.CsocUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.CsocCreateManyTenantInputEnvelope;
    set?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    disconnect?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    delete?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    connect?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    update?: Prisma.CsocUpdateWithWhereUniqueWithoutTenantInput | Prisma.CsocUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.CsocUpdateManyWithWhereWithoutTenantInput | Prisma.CsocUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.CsocScalarWhereInput | Prisma.CsocScalarWhereInput[];
};
export type CsocCreateNestedManyWithoutSubserviceOrganizationInput = {
    create?: Prisma.XOR<Prisma.CsocCreateWithoutSubserviceOrganizationInput, Prisma.CsocUncheckedCreateWithoutSubserviceOrganizationInput> | Prisma.CsocCreateWithoutSubserviceOrganizationInput[] | Prisma.CsocUncheckedCreateWithoutSubserviceOrganizationInput[];
    connectOrCreate?: Prisma.CsocCreateOrConnectWithoutSubserviceOrganizationInput | Prisma.CsocCreateOrConnectWithoutSubserviceOrganizationInput[];
    createMany?: Prisma.CsocCreateManySubserviceOrganizationInputEnvelope;
    connect?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
};
export type CsocUncheckedCreateNestedManyWithoutSubserviceOrganizationInput = {
    create?: Prisma.XOR<Prisma.CsocCreateWithoutSubserviceOrganizationInput, Prisma.CsocUncheckedCreateWithoutSubserviceOrganizationInput> | Prisma.CsocCreateWithoutSubserviceOrganizationInput[] | Prisma.CsocUncheckedCreateWithoutSubserviceOrganizationInput[];
    connectOrCreate?: Prisma.CsocCreateOrConnectWithoutSubserviceOrganizationInput | Prisma.CsocCreateOrConnectWithoutSubserviceOrganizationInput[];
    createMany?: Prisma.CsocCreateManySubserviceOrganizationInputEnvelope;
    connect?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
};
export type CsocUpdateManyWithoutSubserviceOrganizationNestedInput = {
    create?: Prisma.XOR<Prisma.CsocCreateWithoutSubserviceOrganizationInput, Prisma.CsocUncheckedCreateWithoutSubserviceOrganizationInput> | Prisma.CsocCreateWithoutSubserviceOrganizationInput[] | Prisma.CsocUncheckedCreateWithoutSubserviceOrganizationInput[];
    connectOrCreate?: Prisma.CsocCreateOrConnectWithoutSubserviceOrganizationInput | Prisma.CsocCreateOrConnectWithoutSubserviceOrganizationInput[];
    upsert?: Prisma.CsocUpsertWithWhereUniqueWithoutSubserviceOrganizationInput | Prisma.CsocUpsertWithWhereUniqueWithoutSubserviceOrganizationInput[];
    createMany?: Prisma.CsocCreateManySubserviceOrganizationInputEnvelope;
    set?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    disconnect?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    delete?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    connect?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    update?: Prisma.CsocUpdateWithWhereUniqueWithoutSubserviceOrganizationInput | Prisma.CsocUpdateWithWhereUniqueWithoutSubserviceOrganizationInput[];
    updateMany?: Prisma.CsocUpdateManyWithWhereWithoutSubserviceOrganizationInput | Prisma.CsocUpdateManyWithWhereWithoutSubserviceOrganizationInput[];
    deleteMany?: Prisma.CsocScalarWhereInput | Prisma.CsocScalarWhereInput[];
};
export type CsocUncheckedUpdateManyWithoutSubserviceOrganizationNestedInput = {
    create?: Prisma.XOR<Prisma.CsocCreateWithoutSubserviceOrganizationInput, Prisma.CsocUncheckedCreateWithoutSubserviceOrganizationInput> | Prisma.CsocCreateWithoutSubserviceOrganizationInput[] | Prisma.CsocUncheckedCreateWithoutSubserviceOrganizationInput[];
    connectOrCreate?: Prisma.CsocCreateOrConnectWithoutSubserviceOrganizationInput | Prisma.CsocCreateOrConnectWithoutSubserviceOrganizationInput[];
    upsert?: Prisma.CsocUpsertWithWhereUniqueWithoutSubserviceOrganizationInput | Prisma.CsocUpsertWithWhereUniqueWithoutSubserviceOrganizationInput[];
    createMany?: Prisma.CsocCreateManySubserviceOrganizationInputEnvelope;
    set?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    disconnect?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    delete?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    connect?: Prisma.CsocWhereUniqueInput | Prisma.CsocWhereUniqueInput[];
    update?: Prisma.CsocUpdateWithWhereUniqueWithoutSubserviceOrganizationInput | Prisma.CsocUpdateWithWhereUniqueWithoutSubserviceOrganizationInput[];
    updateMany?: Prisma.CsocUpdateManyWithWhereWithoutSubserviceOrganizationInput | Prisma.CsocUpdateManyWithWhereWithoutSubserviceOrganizationInput[];
    deleteMany?: Prisma.CsocScalarWhereInput | Prisma.CsocScalarWhereInput[];
};
export type CsocCreateWithoutTenantInput = {
    id?: string;
    expectedControl: string;
    subserviceOrganization: Prisma.SubserviceOrganizationCreateNestedOneWithoutCsocsInput;
};
export type CsocUncheckedCreateWithoutTenantInput = {
    id?: string;
    subserviceOrganizationId: string;
    expectedControl: string;
};
export type CsocCreateOrConnectWithoutTenantInput = {
    where: Prisma.CsocWhereUniqueInput;
    create: Prisma.XOR<Prisma.CsocCreateWithoutTenantInput, Prisma.CsocUncheckedCreateWithoutTenantInput>;
};
export type CsocCreateManyTenantInputEnvelope = {
    data: Prisma.CsocCreateManyTenantInput | Prisma.CsocCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type CsocUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.CsocWhereUniqueInput;
    update: Prisma.XOR<Prisma.CsocUpdateWithoutTenantInput, Prisma.CsocUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.CsocCreateWithoutTenantInput, Prisma.CsocUncheckedCreateWithoutTenantInput>;
};
export type CsocUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.CsocWhereUniqueInput;
    data: Prisma.XOR<Prisma.CsocUpdateWithoutTenantInput, Prisma.CsocUncheckedUpdateWithoutTenantInput>;
};
export type CsocUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.CsocScalarWhereInput;
    data: Prisma.XOR<Prisma.CsocUpdateManyMutationInput, Prisma.CsocUncheckedUpdateManyWithoutTenantInput>;
};
export type CsocScalarWhereInput = {
    AND?: Prisma.CsocScalarWhereInput | Prisma.CsocScalarWhereInput[];
    OR?: Prisma.CsocScalarWhereInput[];
    NOT?: Prisma.CsocScalarWhereInput | Prisma.CsocScalarWhereInput[];
    id?: Prisma.UuidFilter<"Csoc"> | string;
    tenantId?: Prisma.UuidFilter<"Csoc"> | string;
    subserviceOrganizationId?: Prisma.UuidFilter<"Csoc"> | string;
    expectedControl?: Prisma.StringFilter<"Csoc"> | string;
};
export type CsocCreateWithoutSubserviceOrganizationInput = {
    id?: string;
    expectedControl: string;
    tenant: Prisma.CompanyCreateNestedOneWithoutCsocsInput;
};
export type CsocUncheckedCreateWithoutSubserviceOrganizationInput = {
    id?: string;
    tenantId: string;
    expectedControl: string;
};
export type CsocCreateOrConnectWithoutSubserviceOrganizationInput = {
    where: Prisma.CsocWhereUniqueInput;
    create: Prisma.XOR<Prisma.CsocCreateWithoutSubserviceOrganizationInput, Prisma.CsocUncheckedCreateWithoutSubserviceOrganizationInput>;
};
export type CsocCreateManySubserviceOrganizationInputEnvelope = {
    data: Prisma.CsocCreateManySubserviceOrganizationInput | Prisma.CsocCreateManySubserviceOrganizationInput[];
    skipDuplicates?: boolean;
};
export type CsocUpsertWithWhereUniqueWithoutSubserviceOrganizationInput = {
    where: Prisma.CsocWhereUniqueInput;
    update: Prisma.XOR<Prisma.CsocUpdateWithoutSubserviceOrganizationInput, Prisma.CsocUncheckedUpdateWithoutSubserviceOrganizationInput>;
    create: Prisma.XOR<Prisma.CsocCreateWithoutSubserviceOrganizationInput, Prisma.CsocUncheckedCreateWithoutSubserviceOrganizationInput>;
};
export type CsocUpdateWithWhereUniqueWithoutSubserviceOrganizationInput = {
    where: Prisma.CsocWhereUniqueInput;
    data: Prisma.XOR<Prisma.CsocUpdateWithoutSubserviceOrganizationInput, Prisma.CsocUncheckedUpdateWithoutSubserviceOrganizationInput>;
};
export type CsocUpdateManyWithWhereWithoutSubserviceOrganizationInput = {
    where: Prisma.CsocScalarWhereInput;
    data: Prisma.XOR<Prisma.CsocUpdateManyMutationInput, Prisma.CsocUncheckedUpdateManyWithoutSubserviceOrganizationInput>;
};
export type CsocCreateManyTenantInput = {
    id?: string;
    subserviceOrganizationId: string;
    expectedControl: string;
};
export type CsocUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
    subserviceOrganization?: Prisma.SubserviceOrganizationUpdateOneRequiredWithoutCsocsNestedInput;
};
export type CsocUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    subserviceOrganizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CsocUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    subserviceOrganizationId?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CsocCreateManySubserviceOrganizationInput = {
    id?: string;
    tenantId: string;
    expectedControl: string;
};
export type CsocUpdateWithoutSubserviceOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutCsocsNestedInput;
};
export type CsocUncheckedUpdateWithoutSubserviceOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CsocUncheckedUpdateManyWithoutSubserviceOrganizationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    expectedControl?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type CsocSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    subserviceOrganizationId?: boolean;
    expectedControl?: boolean;
    subserviceOrganization?: boolean | Prisma.SubserviceOrganizationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["csoc"]>;
export type CsocSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    subserviceOrganizationId?: boolean;
    expectedControl?: boolean;
    subserviceOrganization?: boolean | Prisma.SubserviceOrganizationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["csoc"]>;
export type CsocSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    subserviceOrganizationId?: boolean;
    expectedControl?: boolean;
    subserviceOrganization?: boolean | Prisma.SubserviceOrganizationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["csoc"]>;
export type CsocSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    subserviceOrganizationId?: boolean;
    expectedControl?: boolean;
};
export type CsocOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "subserviceOrganizationId" | "expectedControl", ExtArgs["result"]["csoc"]>;
export type CsocInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    subserviceOrganization?: boolean | Prisma.SubserviceOrganizationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type CsocIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    subserviceOrganization?: boolean | Prisma.SubserviceOrganizationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type CsocIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    subserviceOrganization?: boolean | Prisma.SubserviceOrganizationDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $CsocPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Csoc";
    objects: {
        subserviceOrganization: Prisma.$SubserviceOrganizationPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        subserviceOrganizationId: string;
        expectedControl: string;
    }, ExtArgs["result"]["csoc"]>;
    composites: {};
};
export type CsocGetPayload<S extends boolean | null | undefined | CsocDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CsocPayload, S>;
export type CsocCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CsocFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CsocCountAggregateInputType | true;
};
export interface CsocDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Csoc'];
        meta: {
            name: 'Csoc';
        };
    };
    findUnique<T extends CsocFindUniqueArgs>(args: Prisma.SelectSubset<T, CsocFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CsocClient<runtime.Types.Result.GetResult<Prisma.$CsocPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CsocFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CsocFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CsocClient<runtime.Types.Result.GetResult<Prisma.$CsocPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CsocFindFirstArgs>(args?: Prisma.SelectSubset<T, CsocFindFirstArgs<ExtArgs>>): Prisma.Prisma__CsocClient<runtime.Types.Result.GetResult<Prisma.$CsocPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CsocFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CsocFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CsocClient<runtime.Types.Result.GetResult<Prisma.$CsocPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CsocFindManyArgs>(args?: Prisma.SelectSubset<T, CsocFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CsocPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CsocCreateArgs>(args: Prisma.SelectSubset<T, CsocCreateArgs<ExtArgs>>): Prisma.Prisma__CsocClient<runtime.Types.Result.GetResult<Prisma.$CsocPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CsocCreateManyArgs>(args?: Prisma.SelectSubset<T, CsocCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends CsocCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CsocCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CsocPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends CsocDeleteArgs>(args: Prisma.SelectSubset<T, CsocDeleteArgs<ExtArgs>>): Prisma.Prisma__CsocClient<runtime.Types.Result.GetResult<Prisma.$CsocPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CsocUpdateArgs>(args: Prisma.SelectSubset<T, CsocUpdateArgs<ExtArgs>>): Prisma.Prisma__CsocClient<runtime.Types.Result.GetResult<Prisma.$CsocPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CsocDeleteManyArgs>(args?: Prisma.SelectSubset<T, CsocDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CsocUpdateManyArgs>(args: Prisma.SelectSubset<T, CsocUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends CsocUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CsocUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CsocPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends CsocUpsertArgs>(args: Prisma.SelectSubset<T, CsocUpsertArgs<ExtArgs>>): Prisma.Prisma__CsocClient<runtime.Types.Result.GetResult<Prisma.$CsocPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CsocCountArgs>(args?: Prisma.Subset<T, CsocCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CsocCountAggregateOutputType> : number>;
    aggregate<T extends CsocAggregateArgs>(args: Prisma.Subset<T, CsocAggregateArgs>): Prisma.PrismaPromise<GetCsocAggregateType<T>>;
    groupBy<T extends CsocGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CsocGroupByArgs['orderBy'];
    } : {
        orderBy?: CsocGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CsocGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCsocGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CsocFieldRefs;
}
export interface Prisma__CsocClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    subserviceOrganization<T extends Prisma.SubserviceOrganizationDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SubserviceOrganizationDefaultArgs<ExtArgs>>): Prisma.Prisma__SubserviceOrganizationClient<runtime.Types.Result.GetResult<Prisma.$SubserviceOrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CsocFieldRefs {
    readonly id: Prisma.FieldRef<"Csoc", 'String'>;
    readonly tenantId: Prisma.FieldRef<"Csoc", 'String'>;
    readonly subserviceOrganizationId: Prisma.FieldRef<"Csoc", 'String'>;
    readonly expectedControl: Prisma.FieldRef<"Csoc", 'String'>;
}
export type CsocFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CsocSelect<ExtArgs> | null;
    omit?: Prisma.CsocOmit<ExtArgs> | null;
    include?: Prisma.CsocInclude<ExtArgs> | null;
    where: Prisma.CsocWhereUniqueInput;
};
export type CsocFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CsocSelect<ExtArgs> | null;
    omit?: Prisma.CsocOmit<ExtArgs> | null;
    include?: Prisma.CsocInclude<ExtArgs> | null;
    where: Prisma.CsocWhereUniqueInput;
};
export type CsocFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CsocSelect<ExtArgs> | null;
    omit?: Prisma.CsocOmit<ExtArgs> | null;
    include?: Prisma.CsocInclude<ExtArgs> | null;
    where?: Prisma.CsocWhereInput;
    orderBy?: Prisma.CsocOrderByWithRelationInput | Prisma.CsocOrderByWithRelationInput[];
    cursor?: Prisma.CsocWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CsocScalarFieldEnum | Prisma.CsocScalarFieldEnum[];
};
export type CsocFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CsocSelect<ExtArgs> | null;
    omit?: Prisma.CsocOmit<ExtArgs> | null;
    include?: Prisma.CsocInclude<ExtArgs> | null;
    where?: Prisma.CsocWhereInput;
    orderBy?: Prisma.CsocOrderByWithRelationInput | Prisma.CsocOrderByWithRelationInput[];
    cursor?: Prisma.CsocWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CsocScalarFieldEnum | Prisma.CsocScalarFieldEnum[];
};
export type CsocFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CsocSelect<ExtArgs> | null;
    omit?: Prisma.CsocOmit<ExtArgs> | null;
    include?: Prisma.CsocInclude<ExtArgs> | null;
    where?: Prisma.CsocWhereInput;
    orderBy?: Prisma.CsocOrderByWithRelationInput | Prisma.CsocOrderByWithRelationInput[];
    cursor?: Prisma.CsocWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CsocScalarFieldEnum | Prisma.CsocScalarFieldEnum[];
};
export type CsocCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CsocSelect<ExtArgs> | null;
    omit?: Prisma.CsocOmit<ExtArgs> | null;
    include?: Prisma.CsocInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CsocCreateInput, Prisma.CsocUncheckedCreateInput>;
};
export type CsocCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CsocCreateManyInput | Prisma.CsocCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CsocCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CsocSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CsocOmit<ExtArgs> | null;
    data: Prisma.CsocCreateManyInput | Prisma.CsocCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.CsocIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type CsocUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CsocSelect<ExtArgs> | null;
    omit?: Prisma.CsocOmit<ExtArgs> | null;
    include?: Prisma.CsocInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CsocUpdateInput, Prisma.CsocUncheckedUpdateInput>;
    where: Prisma.CsocWhereUniqueInput;
};
export type CsocUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CsocUpdateManyMutationInput, Prisma.CsocUncheckedUpdateManyInput>;
    where?: Prisma.CsocWhereInput;
    limit?: number;
};
export type CsocUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CsocSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CsocOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CsocUpdateManyMutationInput, Prisma.CsocUncheckedUpdateManyInput>;
    where?: Prisma.CsocWhereInput;
    limit?: number;
    include?: Prisma.CsocIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type CsocUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CsocSelect<ExtArgs> | null;
    omit?: Prisma.CsocOmit<ExtArgs> | null;
    include?: Prisma.CsocInclude<ExtArgs> | null;
    where: Prisma.CsocWhereUniqueInput;
    create: Prisma.XOR<Prisma.CsocCreateInput, Prisma.CsocUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CsocUpdateInput, Prisma.CsocUncheckedUpdateInput>;
};
export type CsocDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CsocSelect<ExtArgs> | null;
    omit?: Prisma.CsocOmit<ExtArgs> | null;
    include?: Prisma.CsocInclude<ExtArgs> | null;
    where: Prisma.CsocWhereUniqueInput;
};
export type CsocDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CsocWhereInput;
    limit?: number;
};
export type CsocDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CsocSelect<ExtArgs> | null;
    omit?: Prisma.CsocOmit<ExtArgs> | null;
    include?: Prisma.CsocInclude<ExtArgs> | null;
};
export {};
