import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ExecutionLogModel = runtime.Types.Result.DefaultSelection<Prisma.$ExecutionLogPayload>;
export type AggregateExecutionLog = {
    _count: ExecutionLogCountAggregateOutputType | null;
    _min: ExecutionLogMinAggregateOutputType | null;
    _max: ExecutionLogMaxAggregateOutputType | null;
};
export type ExecutionLogMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    executionId: string | null;
    loggedAt: Date | null;
    level: $Enums.ExecutionLogLevel | null;
    message: string | null;
};
export type ExecutionLogMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    executionId: string | null;
    loggedAt: Date | null;
    level: $Enums.ExecutionLogLevel | null;
    message: string | null;
};
export type ExecutionLogCountAggregateOutputType = {
    id: number;
    tenantId: number;
    executionId: number;
    loggedAt: number;
    level: number;
    message: number;
    _all: number;
};
export type ExecutionLogMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    executionId?: true;
    loggedAt?: true;
    level?: true;
    message?: true;
};
export type ExecutionLogMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    executionId?: true;
    loggedAt?: true;
    level?: true;
    message?: true;
};
export type ExecutionLogCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    executionId?: true;
    loggedAt?: true;
    level?: true;
    message?: true;
    _all?: true;
};
export type ExecutionLogAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExecutionLogWhereInput;
    orderBy?: Prisma.ExecutionLogOrderByWithRelationInput | Prisma.ExecutionLogOrderByWithRelationInput[];
    cursor?: Prisma.ExecutionLogWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ExecutionLogCountAggregateInputType;
    _min?: ExecutionLogMinAggregateInputType;
    _max?: ExecutionLogMaxAggregateInputType;
};
export type GetExecutionLogAggregateType<T extends ExecutionLogAggregateArgs> = {
    [P in keyof T & keyof AggregateExecutionLog]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateExecutionLog[P]> : Prisma.GetScalarType<T[P], AggregateExecutionLog[P]>;
};
export type ExecutionLogGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExecutionLogWhereInput;
    orderBy?: Prisma.ExecutionLogOrderByWithAggregationInput | Prisma.ExecutionLogOrderByWithAggregationInput[];
    by: Prisma.ExecutionLogScalarFieldEnum[] | Prisma.ExecutionLogScalarFieldEnum;
    having?: Prisma.ExecutionLogScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ExecutionLogCountAggregateInputType | true;
    _min?: ExecutionLogMinAggregateInputType;
    _max?: ExecutionLogMaxAggregateInputType;
};
export type ExecutionLogGroupByOutputType = {
    id: string;
    tenantId: string;
    executionId: string;
    loggedAt: Date;
    level: $Enums.ExecutionLogLevel;
    message: string;
    _count: ExecutionLogCountAggregateOutputType | null;
    _min: ExecutionLogMinAggregateOutputType | null;
    _max: ExecutionLogMaxAggregateOutputType | null;
};
type GetExecutionLogGroupByPayload<T extends ExecutionLogGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ExecutionLogGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ExecutionLogGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ExecutionLogGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ExecutionLogGroupByOutputType[P]>;
}>>;
export type ExecutionLogWhereInput = {
    AND?: Prisma.ExecutionLogWhereInput | Prisma.ExecutionLogWhereInput[];
    OR?: Prisma.ExecutionLogWhereInput[];
    NOT?: Prisma.ExecutionLogWhereInput | Prisma.ExecutionLogWhereInput[];
    id?: Prisma.UuidFilter<"ExecutionLog"> | string;
    tenantId?: Prisma.UuidFilter<"ExecutionLog"> | string;
    executionId?: Prisma.UuidFilter<"ExecutionLog"> | string;
    loggedAt?: Prisma.DateTimeFilter<"ExecutionLog"> | Date | string;
    level?: Prisma.EnumExecutionLogLevelFilter<"ExecutionLog"> | $Enums.ExecutionLogLevel;
    message?: Prisma.StringFilter<"ExecutionLog"> | string;
    execution?: Prisma.XOR<Prisma.ExecutionScalarRelationFilter, Prisma.ExecutionWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
};
export type ExecutionLogOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    executionId?: Prisma.SortOrder;
    loggedAt?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    message?: Prisma.SortOrder;
    execution?: Prisma.ExecutionOrderByWithRelationInput;
    tenant?: Prisma.CompanyOrderByWithRelationInput;
};
export type ExecutionLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ExecutionLogWhereInput | Prisma.ExecutionLogWhereInput[];
    OR?: Prisma.ExecutionLogWhereInput[];
    NOT?: Prisma.ExecutionLogWhereInput | Prisma.ExecutionLogWhereInput[];
    tenantId?: Prisma.UuidFilter<"ExecutionLog"> | string;
    executionId?: Prisma.UuidFilter<"ExecutionLog"> | string;
    loggedAt?: Prisma.DateTimeFilter<"ExecutionLog"> | Date | string;
    level?: Prisma.EnumExecutionLogLevelFilter<"ExecutionLog"> | $Enums.ExecutionLogLevel;
    message?: Prisma.StringFilter<"ExecutionLog"> | string;
    execution?: Prisma.XOR<Prisma.ExecutionScalarRelationFilter, Prisma.ExecutionWhereInput>;
    tenant?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
}, "id">;
export type ExecutionLogOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    executionId?: Prisma.SortOrder;
    loggedAt?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    message?: Prisma.SortOrder;
    _count?: Prisma.ExecutionLogCountOrderByAggregateInput;
    _max?: Prisma.ExecutionLogMaxOrderByAggregateInput;
    _min?: Prisma.ExecutionLogMinOrderByAggregateInput;
};
export type ExecutionLogScalarWhereWithAggregatesInput = {
    AND?: Prisma.ExecutionLogScalarWhereWithAggregatesInput | Prisma.ExecutionLogScalarWhereWithAggregatesInput[];
    OR?: Prisma.ExecutionLogScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ExecutionLogScalarWhereWithAggregatesInput | Prisma.ExecutionLogScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ExecutionLog"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"ExecutionLog"> | string;
    executionId?: Prisma.UuidWithAggregatesFilter<"ExecutionLog"> | string;
    loggedAt?: Prisma.DateTimeWithAggregatesFilter<"ExecutionLog"> | Date | string;
    level?: Prisma.EnumExecutionLogLevelWithAggregatesFilter<"ExecutionLog"> | $Enums.ExecutionLogLevel;
    message?: Prisma.StringWithAggregatesFilter<"ExecutionLog"> | string;
};
export type ExecutionLogCreateInput = {
    id?: string;
    loggedAt: Date | string;
    level: $Enums.ExecutionLogLevel;
    message: string;
    execution: Prisma.ExecutionCreateNestedOneWithoutLogsInput;
    tenant: Prisma.CompanyCreateNestedOneWithoutExecutionLogsInput;
};
export type ExecutionLogUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    executionId: string;
    loggedAt: Date | string;
    level: $Enums.ExecutionLogLevel;
    message: string;
};
export type ExecutionLogUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    loggedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    level?: Prisma.EnumExecutionLogLevelFieldUpdateOperationsInput | $Enums.ExecutionLogLevel;
    message?: Prisma.StringFieldUpdateOperationsInput | string;
    execution?: Prisma.ExecutionUpdateOneRequiredWithoutLogsNestedInput;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutExecutionLogsNestedInput;
};
export type ExecutionLogUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    executionId?: Prisma.StringFieldUpdateOperationsInput | string;
    loggedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    level?: Prisma.EnumExecutionLogLevelFieldUpdateOperationsInput | $Enums.ExecutionLogLevel;
    message?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ExecutionLogCreateManyInput = {
    id?: string;
    tenantId: string;
    executionId: string;
    loggedAt: Date | string;
    level: $Enums.ExecutionLogLevel;
    message: string;
};
export type ExecutionLogUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    loggedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    level?: Prisma.EnumExecutionLogLevelFieldUpdateOperationsInput | $Enums.ExecutionLogLevel;
    message?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ExecutionLogUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    executionId?: Prisma.StringFieldUpdateOperationsInput | string;
    loggedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    level?: Prisma.EnumExecutionLogLevelFieldUpdateOperationsInput | $Enums.ExecutionLogLevel;
    message?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ExecutionLogListRelationFilter = {
    every?: Prisma.ExecutionLogWhereInput;
    some?: Prisma.ExecutionLogWhereInput;
    none?: Prisma.ExecutionLogWhereInput;
};
export type ExecutionLogOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ExecutionLogCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    executionId?: Prisma.SortOrder;
    loggedAt?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    message?: Prisma.SortOrder;
};
export type ExecutionLogMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    executionId?: Prisma.SortOrder;
    loggedAt?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    message?: Prisma.SortOrder;
};
export type ExecutionLogMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    executionId?: Prisma.SortOrder;
    loggedAt?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    message?: Prisma.SortOrder;
};
export type ExecutionLogCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ExecutionLogCreateWithoutTenantInput, Prisma.ExecutionLogUncheckedCreateWithoutTenantInput> | Prisma.ExecutionLogCreateWithoutTenantInput[] | Prisma.ExecutionLogUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ExecutionLogCreateOrConnectWithoutTenantInput | Prisma.ExecutionLogCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ExecutionLogCreateManyTenantInputEnvelope;
    connect?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
};
export type ExecutionLogUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.ExecutionLogCreateWithoutTenantInput, Prisma.ExecutionLogUncheckedCreateWithoutTenantInput> | Prisma.ExecutionLogCreateWithoutTenantInput[] | Prisma.ExecutionLogUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ExecutionLogCreateOrConnectWithoutTenantInput | Prisma.ExecutionLogCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.ExecutionLogCreateManyTenantInputEnvelope;
    connect?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
};
export type ExecutionLogUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionLogCreateWithoutTenantInput, Prisma.ExecutionLogUncheckedCreateWithoutTenantInput> | Prisma.ExecutionLogCreateWithoutTenantInput[] | Prisma.ExecutionLogUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ExecutionLogCreateOrConnectWithoutTenantInput | Prisma.ExecutionLogCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ExecutionLogUpsertWithWhereUniqueWithoutTenantInput | Prisma.ExecutionLogUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ExecutionLogCreateManyTenantInputEnvelope;
    set?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    disconnect?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    delete?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    connect?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    update?: Prisma.ExecutionLogUpdateWithWhereUniqueWithoutTenantInput | Prisma.ExecutionLogUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ExecutionLogUpdateManyWithWhereWithoutTenantInput | Prisma.ExecutionLogUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ExecutionLogScalarWhereInput | Prisma.ExecutionLogScalarWhereInput[];
};
export type ExecutionLogUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionLogCreateWithoutTenantInput, Prisma.ExecutionLogUncheckedCreateWithoutTenantInput> | Prisma.ExecutionLogCreateWithoutTenantInput[] | Prisma.ExecutionLogUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.ExecutionLogCreateOrConnectWithoutTenantInput | Prisma.ExecutionLogCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.ExecutionLogUpsertWithWhereUniqueWithoutTenantInput | Prisma.ExecutionLogUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.ExecutionLogCreateManyTenantInputEnvelope;
    set?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    disconnect?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    delete?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    connect?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    update?: Prisma.ExecutionLogUpdateWithWhereUniqueWithoutTenantInput | Prisma.ExecutionLogUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.ExecutionLogUpdateManyWithWhereWithoutTenantInput | Prisma.ExecutionLogUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.ExecutionLogScalarWhereInput | Prisma.ExecutionLogScalarWhereInput[];
};
export type ExecutionLogCreateNestedManyWithoutExecutionInput = {
    create?: Prisma.XOR<Prisma.ExecutionLogCreateWithoutExecutionInput, Prisma.ExecutionLogUncheckedCreateWithoutExecutionInput> | Prisma.ExecutionLogCreateWithoutExecutionInput[] | Prisma.ExecutionLogUncheckedCreateWithoutExecutionInput[];
    connectOrCreate?: Prisma.ExecutionLogCreateOrConnectWithoutExecutionInput | Prisma.ExecutionLogCreateOrConnectWithoutExecutionInput[];
    createMany?: Prisma.ExecutionLogCreateManyExecutionInputEnvelope;
    connect?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
};
export type ExecutionLogUncheckedCreateNestedManyWithoutExecutionInput = {
    create?: Prisma.XOR<Prisma.ExecutionLogCreateWithoutExecutionInput, Prisma.ExecutionLogUncheckedCreateWithoutExecutionInput> | Prisma.ExecutionLogCreateWithoutExecutionInput[] | Prisma.ExecutionLogUncheckedCreateWithoutExecutionInput[];
    connectOrCreate?: Prisma.ExecutionLogCreateOrConnectWithoutExecutionInput | Prisma.ExecutionLogCreateOrConnectWithoutExecutionInput[];
    createMany?: Prisma.ExecutionLogCreateManyExecutionInputEnvelope;
    connect?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
};
export type ExecutionLogUpdateManyWithoutExecutionNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionLogCreateWithoutExecutionInput, Prisma.ExecutionLogUncheckedCreateWithoutExecutionInput> | Prisma.ExecutionLogCreateWithoutExecutionInput[] | Prisma.ExecutionLogUncheckedCreateWithoutExecutionInput[];
    connectOrCreate?: Prisma.ExecutionLogCreateOrConnectWithoutExecutionInput | Prisma.ExecutionLogCreateOrConnectWithoutExecutionInput[];
    upsert?: Prisma.ExecutionLogUpsertWithWhereUniqueWithoutExecutionInput | Prisma.ExecutionLogUpsertWithWhereUniqueWithoutExecutionInput[];
    createMany?: Prisma.ExecutionLogCreateManyExecutionInputEnvelope;
    set?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    disconnect?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    delete?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    connect?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    update?: Prisma.ExecutionLogUpdateWithWhereUniqueWithoutExecutionInput | Prisma.ExecutionLogUpdateWithWhereUniqueWithoutExecutionInput[];
    updateMany?: Prisma.ExecutionLogUpdateManyWithWhereWithoutExecutionInput | Prisma.ExecutionLogUpdateManyWithWhereWithoutExecutionInput[];
    deleteMany?: Prisma.ExecutionLogScalarWhereInput | Prisma.ExecutionLogScalarWhereInput[];
};
export type ExecutionLogUncheckedUpdateManyWithoutExecutionNestedInput = {
    create?: Prisma.XOR<Prisma.ExecutionLogCreateWithoutExecutionInput, Prisma.ExecutionLogUncheckedCreateWithoutExecutionInput> | Prisma.ExecutionLogCreateWithoutExecutionInput[] | Prisma.ExecutionLogUncheckedCreateWithoutExecutionInput[];
    connectOrCreate?: Prisma.ExecutionLogCreateOrConnectWithoutExecutionInput | Prisma.ExecutionLogCreateOrConnectWithoutExecutionInput[];
    upsert?: Prisma.ExecutionLogUpsertWithWhereUniqueWithoutExecutionInput | Prisma.ExecutionLogUpsertWithWhereUniqueWithoutExecutionInput[];
    createMany?: Prisma.ExecutionLogCreateManyExecutionInputEnvelope;
    set?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    disconnect?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    delete?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    connect?: Prisma.ExecutionLogWhereUniqueInput | Prisma.ExecutionLogWhereUniqueInput[];
    update?: Prisma.ExecutionLogUpdateWithWhereUniqueWithoutExecutionInput | Prisma.ExecutionLogUpdateWithWhereUniqueWithoutExecutionInput[];
    updateMany?: Prisma.ExecutionLogUpdateManyWithWhereWithoutExecutionInput | Prisma.ExecutionLogUpdateManyWithWhereWithoutExecutionInput[];
    deleteMany?: Prisma.ExecutionLogScalarWhereInput | Prisma.ExecutionLogScalarWhereInput[];
};
export type EnumExecutionLogLevelFieldUpdateOperationsInput = {
    set?: $Enums.ExecutionLogLevel;
};
export type ExecutionLogCreateWithoutTenantInput = {
    id?: string;
    loggedAt: Date | string;
    level: $Enums.ExecutionLogLevel;
    message: string;
    execution: Prisma.ExecutionCreateNestedOneWithoutLogsInput;
};
export type ExecutionLogUncheckedCreateWithoutTenantInput = {
    id?: string;
    executionId: string;
    loggedAt: Date | string;
    level: $Enums.ExecutionLogLevel;
    message: string;
};
export type ExecutionLogCreateOrConnectWithoutTenantInput = {
    where: Prisma.ExecutionLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExecutionLogCreateWithoutTenantInput, Prisma.ExecutionLogUncheckedCreateWithoutTenantInput>;
};
export type ExecutionLogCreateManyTenantInputEnvelope = {
    data: Prisma.ExecutionLogCreateManyTenantInput | Prisma.ExecutionLogCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type ExecutionLogUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ExecutionLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExecutionLogUpdateWithoutTenantInput, Prisma.ExecutionLogUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.ExecutionLogCreateWithoutTenantInput, Prisma.ExecutionLogUncheckedCreateWithoutTenantInput>;
};
export type ExecutionLogUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.ExecutionLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExecutionLogUpdateWithoutTenantInput, Prisma.ExecutionLogUncheckedUpdateWithoutTenantInput>;
};
export type ExecutionLogUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.ExecutionLogScalarWhereInput;
    data: Prisma.XOR<Prisma.ExecutionLogUpdateManyMutationInput, Prisma.ExecutionLogUncheckedUpdateManyWithoutTenantInput>;
};
export type ExecutionLogScalarWhereInput = {
    AND?: Prisma.ExecutionLogScalarWhereInput | Prisma.ExecutionLogScalarWhereInput[];
    OR?: Prisma.ExecutionLogScalarWhereInput[];
    NOT?: Prisma.ExecutionLogScalarWhereInput | Prisma.ExecutionLogScalarWhereInput[];
    id?: Prisma.UuidFilter<"ExecutionLog"> | string;
    tenantId?: Prisma.UuidFilter<"ExecutionLog"> | string;
    executionId?: Prisma.UuidFilter<"ExecutionLog"> | string;
    loggedAt?: Prisma.DateTimeFilter<"ExecutionLog"> | Date | string;
    level?: Prisma.EnumExecutionLogLevelFilter<"ExecutionLog"> | $Enums.ExecutionLogLevel;
    message?: Prisma.StringFilter<"ExecutionLog"> | string;
};
export type ExecutionLogCreateWithoutExecutionInput = {
    id?: string;
    loggedAt: Date | string;
    level: $Enums.ExecutionLogLevel;
    message: string;
    tenant: Prisma.CompanyCreateNestedOneWithoutExecutionLogsInput;
};
export type ExecutionLogUncheckedCreateWithoutExecutionInput = {
    id?: string;
    tenantId: string;
    loggedAt: Date | string;
    level: $Enums.ExecutionLogLevel;
    message: string;
};
export type ExecutionLogCreateOrConnectWithoutExecutionInput = {
    where: Prisma.ExecutionLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExecutionLogCreateWithoutExecutionInput, Prisma.ExecutionLogUncheckedCreateWithoutExecutionInput>;
};
export type ExecutionLogCreateManyExecutionInputEnvelope = {
    data: Prisma.ExecutionLogCreateManyExecutionInput | Prisma.ExecutionLogCreateManyExecutionInput[];
    skipDuplicates?: boolean;
};
export type ExecutionLogUpsertWithWhereUniqueWithoutExecutionInput = {
    where: Prisma.ExecutionLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExecutionLogUpdateWithoutExecutionInput, Prisma.ExecutionLogUncheckedUpdateWithoutExecutionInput>;
    create: Prisma.XOR<Prisma.ExecutionLogCreateWithoutExecutionInput, Prisma.ExecutionLogUncheckedCreateWithoutExecutionInput>;
};
export type ExecutionLogUpdateWithWhereUniqueWithoutExecutionInput = {
    where: Prisma.ExecutionLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExecutionLogUpdateWithoutExecutionInput, Prisma.ExecutionLogUncheckedUpdateWithoutExecutionInput>;
};
export type ExecutionLogUpdateManyWithWhereWithoutExecutionInput = {
    where: Prisma.ExecutionLogScalarWhereInput;
    data: Prisma.XOR<Prisma.ExecutionLogUpdateManyMutationInput, Prisma.ExecutionLogUncheckedUpdateManyWithoutExecutionInput>;
};
export type ExecutionLogCreateManyTenantInput = {
    id?: string;
    executionId: string;
    loggedAt: Date | string;
    level: $Enums.ExecutionLogLevel;
    message: string;
};
export type ExecutionLogUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    loggedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    level?: Prisma.EnumExecutionLogLevelFieldUpdateOperationsInput | $Enums.ExecutionLogLevel;
    message?: Prisma.StringFieldUpdateOperationsInput | string;
    execution?: Prisma.ExecutionUpdateOneRequiredWithoutLogsNestedInput;
};
export type ExecutionLogUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    executionId?: Prisma.StringFieldUpdateOperationsInput | string;
    loggedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    level?: Prisma.EnumExecutionLogLevelFieldUpdateOperationsInput | $Enums.ExecutionLogLevel;
    message?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ExecutionLogUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    executionId?: Prisma.StringFieldUpdateOperationsInput | string;
    loggedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    level?: Prisma.EnumExecutionLogLevelFieldUpdateOperationsInput | $Enums.ExecutionLogLevel;
    message?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ExecutionLogCreateManyExecutionInput = {
    id?: string;
    tenantId: string;
    loggedAt: Date | string;
    level: $Enums.ExecutionLogLevel;
    message: string;
};
export type ExecutionLogUpdateWithoutExecutionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    loggedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    level?: Prisma.EnumExecutionLogLevelFieldUpdateOperationsInput | $Enums.ExecutionLogLevel;
    message?: Prisma.StringFieldUpdateOperationsInput | string;
    tenant?: Prisma.CompanyUpdateOneRequiredWithoutExecutionLogsNestedInput;
};
export type ExecutionLogUncheckedUpdateWithoutExecutionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    loggedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    level?: Prisma.EnumExecutionLogLevelFieldUpdateOperationsInput | $Enums.ExecutionLogLevel;
    message?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ExecutionLogUncheckedUpdateManyWithoutExecutionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    loggedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    level?: Prisma.EnumExecutionLogLevelFieldUpdateOperationsInput | $Enums.ExecutionLogLevel;
    message?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ExecutionLogSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    executionId?: boolean;
    loggedAt?: boolean;
    level?: boolean;
    message?: boolean;
    execution?: boolean | Prisma.ExecutionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["executionLog"]>;
export type ExecutionLogSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    executionId?: boolean;
    loggedAt?: boolean;
    level?: boolean;
    message?: boolean;
    execution?: boolean | Prisma.ExecutionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["executionLog"]>;
export type ExecutionLogSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    executionId?: boolean;
    loggedAt?: boolean;
    level?: boolean;
    message?: boolean;
    execution?: boolean | Prisma.ExecutionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["executionLog"]>;
export type ExecutionLogSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    executionId?: boolean;
    loggedAt?: boolean;
    level?: boolean;
    message?: boolean;
};
export type ExecutionLogOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "executionId" | "loggedAt" | "level" | "message", ExtArgs["result"]["executionLog"]>;
export type ExecutionLogInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    execution?: boolean | Prisma.ExecutionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ExecutionLogIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    execution?: boolean | Prisma.ExecutionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type ExecutionLogIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    execution?: boolean | Prisma.ExecutionDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $ExecutionLogPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ExecutionLog";
    objects: {
        execution: Prisma.$ExecutionPayload<ExtArgs>;
        tenant: Prisma.$CompanyPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        executionId: string;
        loggedAt: Date;
        level: $Enums.ExecutionLogLevel;
        message: string;
    }, ExtArgs["result"]["executionLog"]>;
    composites: {};
};
export type ExecutionLogGetPayload<S extends boolean | null | undefined | ExecutionLogDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ExecutionLogPayload, S>;
export type ExecutionLogCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ExecutionLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ExecutionLogCountAggregateInputType | true;
};
export interface ExecutionLogDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ExecutionLog'];
        meta: {
            name: 'ExecutionLog';
        };
    };
    findUnique<T extends ExecutionLogFindUniqueArgs>(args: Prisma.SelectSubset<T, ExecutionLogFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ExecutionLogClient<runtime.Types.Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ExecutionLogFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ExecutionLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ExecutionLogClient<runtime.Types.Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ExecutionLogFindFirstArgs>(args?: Prisma.SelectSubset<T, ExecutionLogFindFirstArgs<ExtArgs>>): Prisma.Prisma__ExecutionLogClient<runtime.Types.Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ExecutionLogFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ExecutionLogFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ExecutionLogClient<runtime.Types.Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ExecutionLogFindManyArgs>(args?: Prisma.SelectSubset<T, ExecutionLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ExecutionLogCreateArgs>(args: Prisma.SelectSubset<T, ExecutionLogCreateArgs<ExtArgs>>): Prisma.Prisma__ExecutionLogClient<runtime.Types.Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ExecutionLogCreateManyArgs>(args?: Prisma.SelectSubset<T, ExecutionLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ExecutionLogCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ExecutionLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ExecutionLogDeleteArgs>(args: Prisma.SelectSubset<T, ExecutionLogDeleteArgs<ExtArgs>>): Prisma.Prisma__ExecutionLogClient<runtime.Types.Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ExecutionLogUpdateArgs>(args: Prisma.SelectSubset<T, ExecutionLogUpdateArgs<ExtArgs>>): Prisma.Prisma__ExecutionLogClient<runtime.Types.Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ExecutionLogDeleteManyArgs>(args?: Prisma.SelectSubset<T, ExecutionLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ExecutionLogUpdateManyArgs>(args: Prisma.SelectSubset<T, ExecutionLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ExecutionLogUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ExecutionLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ExecutionLogUpsertArgs>(args: Prisma.SelectSubset<T, ExecutionLogUpsertArgs<ExtArgs>>): Prisma.Prisma__ExecutionLogClient<runtime.Types.Result.GetResult<Prisma.$ExecutionLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ExecutionLogCountArgs>(args?: Prisma.Subset<T, ExecutionLogCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ExecutionLogCountAggregateOutputType> : number>;
    aggregate<T extends ExecutionLogAggregateArgs>(args: Prisma.Subset<T, ExecutionLogAggregateArgs>): Prisma.PrismaPromise<GetExecutionLogAggregateType<T>>;
    groupBy<T extends ExecutionLogGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ExecutionLogGroupByArgs['orderBy'];
    } : {
        orderBy?: ExecutionLogGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ExecutionLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExecutionLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ExecutionLogFieldRefs;
}
export interface Prisma__ExecutionLogClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    execution<T extends Prisma.ExecutionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ExecutionDefaultArgs<ExtArgs>>): Prisma.Prisma__ExecutionClient<runtime.Types.Result.GetResult<Prisma.$ExecutionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ExecutionLogFieldRefs {
    readonly id: Prisma.FieldRef<"ExecutionLog", 'String'>;
    readonly tenantId: Prisma.FieldRef<"ExecutionLog", 'String'>;
    readonly executionId: Prisma.FieldRef<"ExecutionLog", 'String'>;
    readonly loggedAt: Prisma.FieldRef<"ExecutionLog", 'DateTime'>;
    readonly level: Prisma.FieldRef<"ExecutionLog", 'ExecutionLogLevel'>;
    readonly message: Prisma.FieldRef<"ExecutionLog", 'String'>;
}
export type ExecutionLogFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionLogSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionLogOmit<ExtArgs> | null;
    include?: Prisma.ExecutionLogInclude<ExtArgs> | null;
    where: Prisma.ExecutionLogWhereUniqueInput;
};
export type ExecutionLogFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionLogSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionLogOmit<ExtArgs> | null;
    include?: Prisma.ExecutionLogInclude<ExtArgs> | null;
    where: Prisma.ExecutionLogWhereUniqueInput;
};
export type ExecutionLogFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionLogSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionLogOmit<ExtArgs> | null;
    include?: Prisma.ExecutionLogInclude<ExtArgs> | null;
    where?: Prisma.ExecutionLogWhereInput;
    orderBy?: Prisma.ExecutionLogOrderByWithRelationInput | Prisma.ExecutionLogOrderByWithRelationInput[];
    cursor?: Prisma.ExecutionLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExecutionLogScalarFieldEnum | Prisma.ExecutionLogScalarFieldEnum[];
};
export type ExecutionLogFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionLogSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionLogOmit<ExtArgs> | null;
    include?: Prisma.ExecutionLogInclude<ExtArgs> | null;
    where?: Prisma.ExecutionLogWhereInput;
    orderBy?: Prisma.ExecutionLogOrderByWithRelationInput | Prisma.ExecutionLogOrderByWithRelationInput[];
    cursor?: Prisma.ExecutionLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExecutionLogScalarFieldEnum | Prisma.ExecutionLogScalarFieldEnum[];
};
export type ExecutionLogFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionLogSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionLogOmit<ExtArgs> | null;
    include?: Prisma.ExecutionLogInclude<ExtArgs> | null;
    where?: Prisma.ExecutionLogWhereInput;
    orderBy?: Prisma.ExecutionLogOrderByWithRelationInput | Prisma.ExecutionLogOrderByWithRelationInput[];
    cursor?: Prisma.ExecutionLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExecutionLogScalarFieldEnum | Prisma.ExecutionLogScalarFieldEnum[];
};
export type ExecutionLogCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionLogSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionLogOmit<ExtArgs> | null;
    include?: Prisma.ExecutionLogInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExecutionLogCreateInput, Prisma.ExecutionLogUncheckedCreateInput>;
};
export type ExecutionLogCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ExecutionLogCreateManyInput | Prisma.ExecutionLogCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ExecutionLogCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionLogSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ExecutionLogOmit<ExtArgs> | null;
    data: Prisma.ExecutionLogCreateManyInput | Prisma.ExecutionLogCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ExecutionLogIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ExecutionLogUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionLogSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionLogOmit<ExtArgs> | null;
    include?: Prisma.ExecutionLogInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExecutionLogUpdateInput, Prisma.ExecutionLogUncheckedUpdateInput>;
    where: Prisma.ExecutionLogWhereUniqueInput;
};
export type ExecutionLogUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ExecutionLogUpdateManyMutationInput, Prisma.ExecutionLogUncheckedUpdateManyInput>;
    where?: Prisma.ExecutionLogWhereInput;
    limit?: number;
};
export type ExecutionLogUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionLogSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ExecutionLogOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExecutionLogUpdateManyMutationInput, Prisma.ExecutionLogUncheckedUpdateManyInput>;
    where?: Prisma.ExecutionLogWhereInput;
    limit?: number;
    include?: Prisma.ExecutionLogIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ExecutionLogUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionLogSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionLogOmit<ExtArgs> | null;
    include?: Prisma.ExecutionLogInclude<ExtArgs> | null;
    where: Prisma.ExecutionLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExecutionLogCreateInput, Prisma.ExecutionLogUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ExecutionLogUpdateInput, Prisma.ExecutionLogUncheckedUpdateInput>;
};
export type ExecutionLogDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionLogSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionLogOmit<ExtArgs> | null;
    include?: Prisma.ExecutionLogInclude<ExtArgs> | null;
    where: Prisma.ExecutionLogWhereUniqueInput;
};
export type ExecutionLogDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExecutionLogWhereInput;
    limit?: number;
};
export type ExecutionLogDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExecutionLogSelect<ExtArgs> | null;
    omit?: Prisma.ExecutionLogOmit<ExtArgs> | null;
    include?: Prisma.ExecutionLogInclude<ExtArgs> | null;
};
export {};
