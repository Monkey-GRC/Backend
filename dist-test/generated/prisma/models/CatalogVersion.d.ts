import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CatalogVersionModel = runtime.Types.Result.DefaultSelection<Prisma.$CatalogVersionPayload>;
export type AggregateCatalogVersion = {
    _count: CatalogVersionCountAggregateOutputType | null;
    _avg: CatalogVersionAvgAggregateOutputType | null;
    _sum: CatalogVersionSumAggregateOutputType | null;
    _min: CatalogVersionMinAggregateOutputType | null;
    _max: CatalogVersionMaxAggregateOutputType | null;
};
export type CatalogVersionAvgAggregateOutputType = {
    number: number | null;
};
export type CatalogVersionSumAggregateOutputType = {
    number: number | null;
};
export type CatalogVersionMinAggregateOutputType = {
    id: string | null;
    number: number | null;
    publishedAt: Date | null;
    changeSummary: string | null;
    publishedBy: string | null;
    propagatedAutomatically: boolean | null;
    requiresAcceptance: boolean | null;
};
export type CatalogVersionMaxAggregateOutputType = {
    id: string | null;
    number: number | null;
    publishedAt: Date | null;
    changeSummary: string | null;
    publishedBy: string | null;
    propagatedAutomatically: boolean | null;
    requiresAcceptance: boolean | null;
};
export type CatalogVersionCountAggregateOutputType = {
    id: number;
    number: number;
    publishedAt: number;
    changeSummary: number;
    publishedBy: number;
    propagatedAutomatically: number;
    requiresAcceptance: number;
    _all: number;
};
export type CatalogVersionAvgAggregateInputType = {
    number?: true;
};
export type CatalogVersionSumAggregateInputType = {
    number?: true;
};
export type CatalogVersionMinAggregateInputType = {
    id?: true;
    number?: true;
    publishedAt?: true;
    changeSummary?: true;
    publishedBy?: true;
    propagatedAutomatically?: true;
    requiresAcceptance?: true;
};
export type CatalogVersionMaxAggregateInputType = {
    id?: true;
    number?: true;
    publishedAt?: true;
    changeSummary?: true;
    publishedBy?: true;
    propagatedAutomatically?: true;
    requiresAcceptance?: true;
};
export type CatalogVersionCountAggregateInputType = {
    id?: true;
    number?: true;
    publishedAt?: true;
    changeSummary?: true;
    publishedBy?: true;
    propagatedAutomatically?: true;
    requiresAcceptance?: true;
    _all?: true;
};
export type CatalogVersionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CatalogVersionWhereInput;
    orderBy?: Prisma.CatalogVersionOrderByWithRelationInput | Prisma.CatalogVersionOrderByWithRelationInput[];
    cursor?: Prisma.CatalogVersionWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CatalogVersionCountAggregateInputType;
    _avg?: CatalogVersionAvgAggregateInputType;
    _sum?: CatalogVersionSumAggregateInputType;
    _min?: CatalogVersionMinAggregateInputType;
    _max?: CatalogVersionMaxAggregateInputType;
};
export type GetCatalogVersionAggregateType<T extends CatalogVersionAggregateArgs> = {
    [P in keyof T & keyof AggregateCatalogVersion]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCatalogVersion[P]> : Prisma.GetScalarType<T[P], AggregateCatalogVersion[P]>;
};
export type CatalogVersionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CatalogVersionWhereInput;
    orderBy?: Prisma.CatalogVersionOrderByWithAggregationInput | Prisma.CatalogVersionOrderByWithAggregationInput[];
    by: Prisma.CatalogVersionScalarFieldEnum[] | Prisma.CatalogVersionScalarFieldEnum;
    having?: Prisma.CatalogVersionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CatalogVersionCountAggregateInputType | true;
    _avg?: CatalogVersionAvgAggregateInputType;
    _sum?: CatalogVersionSumAggregateInputType;
    _min?: CatalogVersionMinAggregateInputType;
    _max?: CatalogVersionMaxAggregateInputType;
};
export type CatalogVersionGroupByOutputType = {
    id: string;
    number: number;
    publishedAt: Date;
    changeSummary: string;
    publishedBy: string | null;
    propagatedAutomatically: boolean;
    requiresAcceptance: boolean;
    _count: CatalogVersionCountAggregateOutputType | null;
    _avg: CatalogVersionAvgAggregateOutputType | null;
    _sum: CatalogVersionSumAggregateOutputType | null;
    _min: CatalogVersionMinAggregateOutputType | null;
    _max: CatalogVersionMaxAggregateOutputType | null;
};
type GetCatalogVersionGroupByPayload<T extends CatalogVersionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CatalogVersionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CatalogVersionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CatalogVersionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CatalogVersionGroupByOutputType[P]>;
}>>;
export type CatalogVersionWhereInput = {
    AND?: Prisma.CatalogVersionWhereInput | Prisma.CatalogVersionWhereInput[];
    OR?: Prisma.CatalogVersionWhereInput[];
    NOT?: Prisma.CatalogVersionWhereInput | Prisma.CatalogVersionWhereInput[];
    id?: Prisma.UuidFilter<"CatalogVersion"> | string;
    number?: Prisma.IntFilter<"CatalogVersion"> | number;
    publishedAt?: Prisma.DateTimeFilter<"CatalogVersion"> | Date | string;
    changeSummary?: Prisma.StringFilter<"CatalogVersion"> | string;
    publishedBy?: Prisma.UuidNullableFilter<"CatalogVersion"> | string | null;
    propagatedAutomatically?: Prisma.BoolFilter<"CatalogVersion"> | boolean;
    requiresAcceptance?: Prisma.BoolFilter<"CatalogVersion"> | boolean;
    serviceFrameworks?: Prisma.ServiceFrameworkListRelationFilter;
    evaluations?: Prisma.EvaluationListRelationFilter;
    publisher?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
};
export type CatalogVersionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    changeSummary?: Prisma.SortOrder;
    publishedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    propagatedAutomatically?: Prisma.SortOrder;
    requiresAcceptance?: Prisma.SortOrder;
    serviceFrameworks?: Prisma.ServiceFrameworkOrderByRelationAggregateInput;
    evaluations?: Prisma.EvaluationOrderByRelationAggregateInput;
    publisher?: Prisma.UserOrderByWithRelationInput;
};
export type CatalogVersionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.CatalogVersionWhereInput | Prisma.CatalogVersionWhereInput[];
    OR?: Prisma.CatalogVersionWhereInput[];
    NOT?: Prisma.CatalogVersionWhereInput | Prisma.CatalogVersionWhereInput[];
    number?: Prisma.IntFilter<"CatalogVersion"> | number;
    publishedAt?: Prisma.DateTimeFilter<"CatalogVersion"> | Date | string;
    changeSummary?: Prisma.StringFilter<"CatalogVersion"> | string;
    publishedBy?: Prisma.UuidNullableFilter<"CatalogVersion"> | string | null;
    propagatedAutomatically?: Prisma.BoolFilter<"CatalogVersion"> | boolean;
    requiresAcceptance?: Prisma.BoolFilter<"CatalogVersion"> | boolean;
    serviceFrameworks?: Prisma.ServiceFrameworkListRelationFilter;
    evaluations?: Prisma.EvaluationListRelationFilter;
    publisher?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
}, "id">;
export type CatalogVersionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    changeSummary?: Prisma.SortOrder;
    publishedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    propagatedAutomatically?: Prisma.SortOrder;
    requiresAcceptance?: Prisma.SortOrder;
    _count?: Prisma.CatalogVersionCountOrderByAggregateInput;
    _avg?: Prisma.CatalogVersionAvgOrderByAggregateInput;
    _max?: Prisma.CatalogVersionMaxOrderByAggregateInput;
    _min?: Prisma.CatalogVersionMinOrderByAggregateInput;
    _sum?: Prisma.CatalogVersionSumOrderByAggregateInput;
};
export type CatalogVersionScalarWhereWithAggregatesInput = {
    AND?: Prisma.CatalogVersionScalarWhereWithAggregatesInput | Prisma.CatalogVersionScalarWhereWithAggregatesInput[];
    OR?: Prisma.CatalogVersionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CatalogVersionScalarWhereWithAggregatesInput | Prisma.CatalogVersionScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"CatalogVersion"> | string;
    number?: Prisma.IntWithAggregatesFilter<"CatalogVersion"> | number;
    publishedAt?: Prisma.DateTimeWithAggregatesFilter<"CatalogVersion"> | Date | string;
    changeSummary?: Prisma.StringWithAggregatesFilter<"CatalogVersion"> | string;
    publishedBy?: Prisma.UuidNullableWithAggregatesFilter<"CatalogVersion"> | string | null;
    propagatedAutomatically?: Prisma.BoolWithAggregatesFilter<"CatalogVersion"> | boolean;
    requiresAcceptance?: Prisma.BoolWithAggregatesFilter<"CatalogVersion"> | boolean;
};
export type CatalogVersionCreateInput = {
    id?: string;
    number: number;
    publishedAt: Date | string;
    changeSummary: string;
    propagatedAutomatically: boolean;
    requiresAcceptance: boolean;
    serviceFrameworks?: Prisma.ServiceFrameworkCreateNestedManyWithoutCatalogVersionInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutCatalogVersionInput;
    publisher?: Prisma.UserCreateNestedOneWithoutCatalogVersionsPublishedInput;
};
export type CatalogVersionUncheckedCreateInput = {
    id?: string;
    number: number;
    publishedAt: Date | string;
    changeSummary: string;
    publishedBy?: string | null;
    propagatedAutomatically: boolean;
    requiresAcceptance: boolean;
    serviceFrameworks?: Prisma.ServiceFrameworkUncheckedCreateNestedManyWithoutCatalogVersionInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutCatalogVersionInput;
};
export type CatalogVersionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeSummary?: Prisma.StringFieldUpdateOperationsInput | string;
    propagatedAutomatically?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAcceptance?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    serviceFrameworks?: Prisma.ServiceFrameworkUpdateManyWithoutCatalogVersionNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutCatalogVersionNestedInput;
    publisher?: Prisma.UserUpdateOneWithoutCatalogVersionsPublishedNestedInput;
};
export type CatalogVersionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeSummary?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    propagatedAutomatically?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAcceptance?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    serviceFrameworks?: Prisma.ServiceFrameworkUncheckedUpdateManyWithoutCatalogVersionNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutCatalogVersionNestedInput;
};
export type CatalogVersionCreateManyInput = {
    id?: string;
    number: number;
    publishedAt: Date | string;
    changeSummary: string;
    publishedBy?: string | null;
    propagatedAutomatically: boolean;
    requiresAcceptance: boolean;
};
export type CatalogVersionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeSummary?: Prisma.StringFieldUpdateOperationsInput | string;
    propagatedAutomatically?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAcceptance?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type CatalogVersionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeSummary?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    propagatedAutomatically?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAcceptance?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type CatalogVersionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    changeSummary?: Prisma.SortOrder;
    publishedBy?: Prisma.SortOrder;
    propagatedAutomatically?: Prisma.SortOrder;
    requiresAcceptance?: Prisma.SortOrder;
};
export type CatalogVersionAvgOrderByAggregateInput = {
    number?: Prisma.SortOrder;
};
export type CatalogVersionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    changeSummary?: Prisma.SortOrder;
    publishedBy?: Prisma.SortOrder;
    propagatedAutomatically?: Prisma.SortOrder;
    requiresAcceptance?: Prisma.SortOrder;
};
export type CatalogVersionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    changeSummary?: Prisma.SortOrder;
    publishedBy?: Prisma.SortOrder;
    propagatedAutomatically?: Prisma.SortOrder;
    requiresAcceptance?: Prisma.SortOrder;
};
export type CatalogVersionSumOrderByAggregateInput = {
    number?: Prisma.SortOrder;
};
export type CatalogVersionListRelationFilter = {
    every?: Prisma.CatalogVersionWhereInput;
    some?: Prisma.CatalogVersionWhereInput;
    none?: Prisma.CatalogVersionWhereInput;
};
export type CatalogVersionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CatalogVersionScalarRelationFilter = {
    is?: Prisma.CatalogVersionWhereInput;
    isNot?: Prisma.CatalogVersionWhereInput;
};
export type CatalogVersionCreateNestedManyWithoutPublisherInput = {
    create?: Prisma.XOR<Prisma.CatalogVersionCreateWithoutPublisherInput, Prisma.CatalogVersionUncheckedCreateWithoutPublisherInput> | Prisma.CatalogVersionCreateWithoutPublisherInput[] | Prisma.CatalogVersionUncheckedCreateWithoutPublisherInput[];
    connectOrCreate?: Prisma.CatalogVersionCreateOrConnectWithoutPublisherInput | Prisma.CatalogVersionCreateOrConnectWithoutPublisherInput[];
    createMany?: Prisma.CatalogVersionCreateManyPublisherInputEnvelope;
    connect?: Prisma.CatalogVersionWhereUniqueInput | Prisma.CatalogVersionWhereUniqueInput[];
};
export type CatalogVersionUncheckedCreateNestedManyWithoutPublisherInput = {
    create?: Prisma.XOR<Prisma.CatalogVersionCreateWithoutPublisherInput, Prisma.CatalogVersionUncheckedCreateWithoutPublisherInput> | Prisma.CatalogVersionCreateWithoutPublisherInput[] | Prisma.CatalogVersionUncheckedCreateWithoutPublisherInput[];
    connectOrCreate?: Prisma.CatalogVersionCreateOrConnectWithoutPublisherInput | Prisma.CatalogVersionCreateOrConnectWithoutPublisherInput[];
    createMany?: Prisma.CatalogVersionCreateManyPublisherInputEnvelope;
    connect?: Prisma.CatalogVersionWhereUniqueInput | Prisma.CatalogVersionWhereUniqueInput[];
};
export type CatalogVersionUpdateManyWithoutPublisherNestedInput = {
    create?: Prisma.XOR<Prisma.CatalogVersionCreateWithoutPublisherInput, Prisma.CatalogVersionUncheckedCreateWithoutPublisherInput> | Prisma.CatalogVersionCreateWithoutPublisherInput[] | Prisma.CatalogVersionUncheckedCreateWithoutPublisherInput[];
    connectOrCreate?: Prisma.CatalogVersionCreateOrConnectWithoutPublisherInput | Prisma.CatalogVersionCreateOrConnectWithoutPublisherInput[];
    upsert?: Prisma.CatalogVersionUpsertWithWhereUniqueWithoutPublisherInput | Prisma.CatalogVersionUpsertWithWhereUniqueWithoutPublisherInput[];
    createMany?: Prisma.CatalogVersionCreateManyPublisherInputEnvelope;
    set?: Prisma.CatalogVersionWhereUniqueInput | Prisma.CatalogVersionWhereUniqueInput[];
    disconnect?: Prisma.CatalogVersionWhereUniqueInput | Prisma.CatalogVersionWhereUniqueInput[];
    delete?: Prisma.CatalogVersionWhereUniqueInput | Prisma.CatalogVersionWhereUniqueInput[];
    connect?: Prisma.CatalogVersionWhereUniqueInput | Prisma.CatalogVersionWhereUniqueInput[];
    update?: Prisma.CatalogVersionUpdateWithWhereUniqueWithoutPublisherInput | Prisma.CatalogVersionUpdateWithWhereUniqueWithoutPublisherInput[];
    updateMany?: Prisma.CatalogVersionUpdateManyWithWhereWithoutPublisherInput | Prisma.CatalogVersionUpdateManyWithWhereWithoutPublisherInput[];
    deleteMany?: Prisma.CatalogVersionScalarWhereInput | Prisma.CatalogVersionScalarWhereInput[];
};
export type CatalogVersionUncheckedUpdateManyWithoutPublisherNestedInput = {
    create?: Prisma.XOR<Prisma.CatalogVersionCreateWithoutPublisherInput, Prisma.CatalogVersionUncheckedCreateWithoutPublisherInput> | Prisma.CatalogVersionCreateWithoutPublisherInput[] | Prisma.CatalogVersionUncheckedCreateWithoutPublisherInput[];
    connectOrCreate?: Prisma.CatalogVersionCreateOrConnectWithoutPublisherInput | Prisma.CatalogVersionCreateOrConnectWithoutPublisherInput[];
    upsert?: Prisma.CatalogVersionUpsertWithWhereUniqueWithoutPublisherInput | Prisma.CatalogVersionUpsertWithWhereUniqueWithoutPublisherInput[];
    createMany?: Prisma.CatalogVersionCreateManyPublisherInputEnvelope;
    set?: Prisma.CatalogVersionWhereUniqueInput | Prisma.CatalogVersionWhereUniqueInput[];
    disconnect?: Prisma.CatalogVersionWhereUniqueInput | Prisma.CatalogVersionWhereUniqueInput[];
    delete?: Prisma.CatalogVersionWhereUniqueInput | Prisma.CatalogVersionWhereUniqueInput[];
    connect?: Prisma.CatalogVersionWhereUniqueInput | Prisma.CatalogVersionWhereUniqueInput[];
    update?: Prisma.CatalogVersionUpdateWithWhereUniqueWithoutPublisherInput | Prisma.CatalogVersionUpdateWithWhereUniqueWithoutPublisherInput[];
    updateMany?: Prisma.CatalogVersionUpdateManyWithWhereWithoutPublisherInput | Prisma.CatalogVersionUpdateManyWithWhereWithoutPublisherInput[];
    deleteMany?: Prisma.CatalogVersionScalarWhereInput | Prisma.CatalogVersionScalarWhereInput[];
};
export type CatalogVersionCreateNestedOneWithoutEvaluationsInput = {
    create?: Prisma.XOR<Prisma.CatalogVersionCreateWithoutEvaluationsInput, Prisma.CatalogVersionUncheckedCreateWithoutEvaluationsInput>;
    connectOrCreate?: Prisma.CatalogVersionCreateOrConnectWithoutEvaluationsInput;
    connect?: Prisma.CatalogVersionWhereUniqueInput;
};
export type CatalogVersionUpdateOneRequiredWithoutEvaluationsNestedInput = {
    create?: Prisma.XOR<Prisma.CatalogVersionCreateWithoutEvaluationsInput, Prisma.CatalogVersionUncheckedCreateWithoutEvaluationsInput>;
    connectOrCreate?: Prisma.CatalogVersionCreateOrConnectWithoutEvaluationsInput;
    upsert?: Prisma.CatalogVersionUpsertWithoutEvaluationsInput;
    connect?: Prisma.CatalogVersionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CatalogVersionUpdateToOneWithWhereWithoutEvaluationsInput, Prisma.CatalogVersionUpdateWithoutEvaluationsInput>, Prisma.CatalogVersionUncheckedUpdateWithoutEvaluationsInput>;
};
export type CatalogVersionCreateNestedOneWithoutServiceFrameworksInput = {
    create?: Prisma.XOR<Prisma.CatalogVersionCreateWithoutServiceFrameworksInput, Prisma.CatalogVersionUncheckedCreateWithoutServiceFrameworksInput>;
    connectOrCreate?: Prisma.CatalogVersionCreateOrConnectWithoutServiceFrameworksInput;
    connect?: Prisma.CatalogVersionWhereUniqueInput;
};
export type CatalogVersionUpdateOneRequiredWithoutServiceFrameworksNestedInput = {
    create?: Prisma.XOR<Prisma.CatalogVersionCreateWithoutServiceFrameworksInput, Prisma.CatalogVersionUncheckedCreateWithoutServiceFrameworksInput>;
    connectOrCreate?: Prisma.CatalogVersionCreateOrConnectWithoutServiceFrameworksInput;
    upsert?: Prisma.CatalogVersionUpsertWithoutServiceFrameworksInput;
    connect?: Prisma.CatalogVersionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CatalogVersionUpdateToOneWithWhereWithoutServiceFrameworksInput, Prisma.CatalogVersionUpdateWithoutServiceFrameworksInput>, Prisma.CatalogVersionUncheckedUpdateWithoutServiceFrameworksInput>;
};
export type CatalogVersionCreateWithoutPublisherInput = {
    id?: string;
    number: number;
    publishedAt: Date | string;
    changeSummary: string;
    propagatedAutomatically: boolean;
    requiresAcceptance: boolean;
    serviceFrameworks?: Prisma.ServiceFrameworkCreateNestedManyWithoutCatalogVersionInput;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutCatalogVersionInput;
};
export type CatalogVersionUncheckedCreateWithoutPublisherInput = {
    id?: string;
    number: number;
    publishedAt: Date | string;
    changeSummary: string;
    propagatedAutomatically: boolean;
    requiresAcceptance: boolean;
    serviceFrameworks?: Prisma.ServiceFrameworkUncheckedCreateNestedManyWithoutCatalogVersionInput;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutCatalogVersionInput;
};
export type CatalogVersionCreateOrConnectWithoutPublisherInput = {
    where: Prisma.CatalogVersionWhereUniqueInput;
    create: Prisma.XOR<Prisma.CatalogVersionCreateWithoutPublisherInput, Prisma.CatalogVersionUncheckedCreateWithoutPublisherInput>;
};
export type CatalogVersionCreateManyPublisherInputEnvelope = {
    data: Prisma.CatalogVersionCreateManyPublisherInput | Prisma.CatalogVersionCreateManyPublisherInput[];
    skipDuplicates?: boolean;
};
export type CatalogVersionUpsertWithWhereUniqueWithoutPublisherInput = {
    where: Prisma.CatalogVersionWhereUniqueInput;
    update: Prisma.XOR<Prisma.CatalogVersionUpdateWithoutPublisherInput, Prisma.CatalogVersionUncheckedUpdateWithoutPublisherInput>;
    create: Prisma.XOR<Prisma.CatalogVersionCreateWithoutPublisherInput, Prisma.CatalogVersionUncheckedCreateWithoutPublisherInput>;
};
export type CatalogVersionUpdateWithWhereUniqueWithoutPublisherInput = {
    where: Prisma.CatalogVersionWhereUniqueInput;
    data: Prisma.XOR<Prisma.CatalogVersionUpdateWithoutPublisherInput, Prisma.CatalogVersionUncheckedUpdateWithoutPublisherInput>;
};
export type CatalogVersionUpdateManyWithWhereWithoutPublisherInput = {
    where: Prisma.CatalogVersionScalarWhereInput;
    data: Prisma.XOR<Prisma.CatalogVersionUpdateManyMutationInput, Prisma.CatalogVersionUncheckedUpdateManyWithoutPublisherInput>;
};
export type CatalogVersionScalarWhereInput = {
    AND?: Prisma.CatalogVersionScalarWhereInput | Prisma.CatalogVersionScalarWhereInput[];
    OR?: Prisma.CatalogVersionScalarWhereInput[];
    NOT?: Prisma.CatalogVersionScalarWhereInput | Prisma.CatalogVersionScalarWhereInput[];
    id?: Prisma.UuidFilter<"CatalogVersion"> | string;
    number?: Prisma.IntFilter<"CatalogVersion"> | number;
    publishedAt?: Prisma.DateTimeFilter<"CatalogVersion"> | Date | string;
    changeSummary?: Prisma.StringFilter<"CatalogVersion"> | string;
    publishedBy?: Prisma.UuidNullableFilter<"CatalogVersion"> | string | null;
    propagatedAutomatically?: Prisma.BoolFilter<"CatalogVersion"> | boolean;
    requiresAcceptance?: Prisma.BoolFilter<"CatalogVersion"> | boolean;
};
export type CatalogVersionCreateWithoutEvaluationsInput = {
    id?: string;
    number: number;
    publishedAt: Date | string;
    changeSummary: string;
    propagatedAutomatically: boolean;
    requiresAcceptance: boolean;
    serviceFrameworks?: Prisma.ServiceFrameworkCreateNestedManyWithoutCatalogVersionInput;
    publisher?: Prisma.UserCreateNestedOneWithoutCatalogVersionsPublishedInput;
};
export type CatalogVersionUncheckedCreateWithoutEvaluationsInput = {
    id?: string;
    number: number;
    publishedAt: Date | string;
    changeSummary: string;
    publishedBy?: string | null;
    propagatedAutomatically: boolean;
    requiresAcceptance: boolean;
    serviceFrameworks?: Prisma.ServiceFrameworkUncheckedCreateNestedManyWithoutCatalogVersionInput;
};
export type CatalogVersionCreateOrConnectWithoutEvaluationsInput = {
    where: Prisma.CatalogVersionWhereUniqueInput;
    create: Prisma.XOR<Prisma.CatalogVersionCreateWithoutEvaluationsInput, Prisma.CatalogVersionUncheckedCreateWithoutEvaluationsInput>;
};
export type CatalogVersionUpsertWithoutEvaluationsInput = {
    update: Prisma.XOR<Prisma.CatalogVersionUpdateWithoutEvaluationsInput, Prisma.CatalogVersionUncheckedUpdateWithoutEvaluationsInput>;
    create: Prisma.XOR<Prisma.CatalogVersionCreateWithoutEvaluationsInput, Prisma.CatalogVersionUncheckedCreateWithoutEvaluationsInput>;
    where?: Prisma.CatalogVersionWhereInput;
};
export type CatalogVersionUpdateToOneWithWhereWithoutEvaluationsInput = {
    where?: Prisma.CatalogVersionWhereInput;
    data: Prisma.XOR<Prisma.CatalogVersionUpdateWithoutEvaluationsInput, Prisma.CatalogVersionUncheckedUpdateWithoutEvaluationsInput>;
};
export type CatalogVersionUpdateWithoutEvaluationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeSummary?: Prisma.StringFieldUpdateOperationsInput | string;
    propagatedAutomatically?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAcceptance?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    serviceFrameworks?: Prisma.ServiceFrameworkUpdateManyWithoutCatalogVersionNestedInput;
    publisher?: Prisma.UserUpdateOneWithoutCatalogVersionsPublishedNestedInput;
};
export type CatalogVersionUncheckedUpdateWithoutEvaluationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeSummary?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    propagatedAutomatically?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAcceptance?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    serviceFrameworks?: Prisma.ServiceFrameworkUncheckedUpdateManyWithoutCatalogVersionNestedInput;
};
export type CatalogVersionCreateWithoutServiceFrameworksInput = {
    id?: string;
    number: number;
    publishedAt: Date | string;
    changeSummary: string;
    propagatedAutomatically: boolean;
    requiresAcceptance: boolean;
    evaluations?: Prisma.EvaluationCreateNestedManyWithoutCatalogVersionInput;
    publisher?: Prisma.UserCreateNestedOneWithoutCatalogVersionsPublishedInput;
};
export type CatalogVersionUncheckedCreateWithoutServiceFrameworksInput = {
    id?: string;
    number: number;
    publishedAt: Date | string;
    changeSummary: string;
    publishedBy?: string | null;
    propagatedAutomatically: boolean;
    requiresAcceptance: boolean;
    evaluations?: Prisma.EvaluationUncheckedCreateNestedManyWithoutCatalogVersionInput;
};
export type CatalogVersionCreateOrConnectWithoutServiceFrameworksInput = {
    where: Prisma.CatalogVersionWhereUniqueInput;
    create: Prisma.XOR<Prisma.CatalogVersionCreateWithoutServiceFrameworksInput, Prisma.CatalogVersionUncheckedCreateWithoutServiceFrameworksInput>;
};
export type CatalogVersionUpsertWithoutServiceFrameworksInput = {
    update: Prisma.XOR<Prisma.CatalogVersionUpdateWithoutServiceFrameworksInput, Prisma.CatalogVersionUncheckedUpdateWithoutServiceFrameworksInput>;
    create: Prisma.XOR<Prisma.CatalogVersionCreateWithoutServiceFrameworksInput, Prisma.CatalogVersionUncheckedCreateWithoutServiceFrameworksInput>;
    where?: Prisma.CatalogVersionWhereInput;
};
export type CatalogVersionUpdateToOneWithWhereWithoutServiceFrameworksInput = {
    where?: Prisma.CatalogVersionWhereInput;
    data: Prisma.XOR<Prisma.CatalogVersionUpdateWithoutServiceFrameworksInput, Prisma.CatalogVersionUncheckedUpdateWithoutServiceFrameworksInput>;
};
export type CatalogVersionUpdateWithoutServiceFrameworksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeSummary?: Prisma.StringFieldUpdateOperationsInput | string;
    propagatedAutomatically?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAcceptance?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    evaluations?: Prisma.EvaluationUpdateManyWithoutCatalogVersionNestedInput;
    publisher?: Prisma.UserUpdateOneWithoutCatalogVersionsPublishedNestedInput;
};
export type CatalogVersionUncheckedUpdateWithoutServiceFrameworksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeSummary?: Prisma.StringFieldUpdateOperationsInput | string;
    publishedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    propagatedAutomatically?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAcceptance?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutCatalogVersionNestedInput;
};
export type CatalogVersionCreateManyPublisherInput = {
    id?: string;
    number: number;
    publishedAt: Date | string;
    changeSummary: string;
    propagatedAutomatically: boolean;
    requiresAcceptance: boolean;
};
export type CatalogVersionUpdateWithoutPublisherInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeSummary?: Prisma.StringFieldUpdateOperationsInput | string;
    propagatedAutomatically?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAcceptance?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    serviceFrameworks?: Prisma.ServiceFrameworkUpdateManyWithoutCatalogVersionNestedInput;
    evaluations?: Prisma.EvaluationUpdateManyWithoutCatalogVersionNestedInput;
};
export type CatalogVersionUncheckedUpdateWithoutPublisherInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeSummary?: Prisma.StringFieldUpdateOperationsInput | string;
    propagatedAutomatically?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAcceptance?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    serviceFrameworks?: Prisma.ServiceFrameworkUncheckedUpdateManyWithoutCatalogVersionNestedInput;
    evaluations?: Prisma.EvaluationUncheckedUpdateManyWithoutCatalogVersionNestedInput;
};
export type CatalogVersionUncheckedUpdateManyWithoutPublisherInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    publishedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeSummary?: Prisma.StringFieldUpdateOperationsInput | string;
    propagatedAutomatically?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requiresAcceptance?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type CatalogVersionCountOutputType = {
    serviceFrameworks: number;
    evaluations: number;
};
export type CatalogVersionCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    serviceFrameworks?: boolean | CatalogVersionCountOutputTypeCountServiceFrameworksArgs;
    evaluations?: boolean | CatalogVersionCountOutputTypeCountEvaluationsArgs;
};
export type CatalogVersionCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CatalogVersionCountOutputTypeSelect<ExtArgs> | null;
};
export type CatalogVersionCountOutputTypeCountServiceFrameworksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceFrameworkWhereInput;
};
export type CatalogVersionCountOutputTypeCountEvaluationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EvaluationWhereInput;
};
export type CatalogVersionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    number?: boolean;
    publishedAt?: boolean;
    changeSummary?: boolean;
    publishedBy?: boolean;
    propagatedAutomatically?: boolean;
    requiresAcceptance?: boolean;
    serviceFrameworks?: boolean | Prisma.CatalogVersion$serviceFrameworksArgs<ExtArgs>;
    evaluations?: boolean | Prisma.CatalogVersion$evaluationsArgs<ExtArgs>;
    publisher?: boolean | Prisma.CatalogVersion$publisherArgs<ExtArgs>;
    _count?: boolean | Prisma.CatalogVersionCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["catalogVersion"]>;
export type CatalogVersionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    number?: boolean;
    publishedAt?: boolean;
    changeSummary?: boolean;
    publishedBy?: boolean;
    propagatedAutomatically?: boolean;
    requiresAcceptance?: boolean;
    publisher?: boolean | Prisma.CatalogVersion$publisherArgs<ExtArgs>;
}, ExtArgs["result"]["catalogVersion"]>;
export type CatalogVersionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    number?: boolean;
    publishedAt?: boolean;
    changeSummary?: boolean;
    publishedBy?: boolean;
    propagatedAutomatically?: boolean;
    requiresAcceptance?: boolean;
    publisher?: boolean | Prisma.CatalogVersion$publisherArgs<ExtArgs>;
}, ExtArgs["result"]["catalogVersion"]>;
export type CatalogVersionSelectScalar = {
    id?: boolean;
    number?: boolean;
    publishedAt?: boolean;
    changeSummary?: boolean;
    publishedBy?: boolean;
    propagatedAutomatically?: boolean;
    requiresAcceptance?: boolean;
};
export type CatalogVersionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "number" | "publishedAt" | "changeSummary" | "publishedBy" | "propagatedAutomatically" | "requiresAcceptance", ExtArgs["result"]["catalogVersion"]>;
export type CatalogVersionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    serviceFrameworks?: boolean | Prisma.CatalogVersion$serviceFrameworksArgs<ExtArgs>;
    evaluations?: boolean | Prisma.CatalogVersion$evaluationsArgs<ExtArgs>;
    publisher?: boolean | Prisma.CatalogVersion$publisherArgs<ExtArgs>;
    _count?: boolean | Prisma.CatalogVersionCountOutputTypeDefaultArgs<ExtArgs>;
};
export type CatalogVersionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    publisher?: boolean | Prisma.CatalogVersion$publisherArgs<ExtArgs>;
};
export type CatalogVersionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    publisher?: boolean | Prisma.CatalogVersion$publisherArgs<ExtArgs>;
};
export type $CatalogVersionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "CatalogVersion";
    objects: {
        serviceFrameworks: Prisma.$ServiceFrameworkPayload<ExtArgs>[];
        evaluations: Prisma.$EvaluationPayload<ExtArgs>[];
        publisher: Prisma.$UserPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        number: number;
        publishedAt: Date;
        changeSummary: string;
        publishedBy: string | null;
        propagatedAutomatically: boolean;
        requiresAcceptance: boolean;
    }, ExtArgs["result"]["catalogVersion"]>;
    composites: {};
};
export type CatalogVersionGetPayload<S extends boolean | null | undefined | CatalogVersionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CatalogVersionPayload, S>;
export type CatalogVersionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CatalogVersionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CatalogVersionCountAggregateInputType | true;
};
export interface CatalogVersionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['CatalogVersion'];
        meta: {
            name: 'CatalogVersion';
        };
    };
    findUnique<T extends CatalogVersionFindUniqueArgs>(args: Prisma.SelectSubset<T, CatalogVersionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CatalogVersionClient<runtime.Types.Result.GetResult<Prisma.$CatalogVersionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CatalogVersionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CatalogVersionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CatalogVersionClient<runtime.Types.Result.GetResult<Prisma.$CatalogVersionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CatalogVersionFindFirstArgs>(args?: Prisma.SelectSubset<T, CatalogVersionFindFirstArgs<ExtArgs>>): Prisma.Prisma__CatalogVersionClient<runtime.Types.Result.GetResult<Prisma.$CatalogVersionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CatalogVersionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CatalogVersionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CatalogVersionClient<runtime.Types.Result.GetResult<Prisma.$CatalogVersionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CatalogVersionFindManyArgs>(args?: Prisma.SelectSubset<T, CatalogVersionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CatalogVersionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CatalogVersionCreateArgs>(args: Prisma.SelectSubset<T, CatalogVersionCreateArgs<ExtArgs>>): Prisma.Prisma__CatalogVersionClient<runtime.Types.Result.GetResult<Prisma.$CatalogVersionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CatalogVersionCreateManyArgs>(args?: Prisma.SelectSubset<T, CatalogVersionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends CatalogVersionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CatalogVersionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CatalogVersionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends CatalogVersionDeleteArgs>(args: Prisma.SelectSubset<T, CatalogVersionDeleteArgs<ExtArgs>>): Prisma.Prisma__CatalogVersionClient<runtime.Types.Result.GetResult<Prisma.$CatalogVersionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CatalogVersionUpdateArgs>(args: Prisma.SelectSubset<T, CatalogVersionUpdateArgs<ExtArgs>>): Prisma.Prisma__CatalogVersionClient<runtime.Types.Result.GetResult<Prisma.$CatalogVersionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CatalogVersionDeleteManyArgs>(args?: Prisma.SelectSubset<T, CatalogVersionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CatalogVersionUpdateManyArgs>(args: Prisma.SelectSubset<T, CatalogVersionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends CatalogVersionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CatalogVersionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CatalogVersionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends CatalogVersionUpsertArgs>(args: Prisma.SelectSubset<T, CatalogVersionUpsertArgs<ExtArgs>>): Prisma.Prisma__CatalogVersionClient<runtime.Types.Result.GetResult<Prisma.$CatalogVersionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CatalogVersionCountArgs>(args?: Prisma.Subset<T, CatalogVersionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CatalogVersionCountAggregateOutputType> : number>;
    aggregate<T extends CatalogVersionAggregateArgs>(args: Prisma.Subset<T, CatalogVersionAggregateArgs>): Prisma.PrismaPromise<GetCatalogVersionAggregateType<T>>;
    groupBy<T extends CatalogVersionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CatalogVersionGroupByArgs['orderBy'];
    } : {
        orderBy?: CatalogVersionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CatalogVersionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCatalogVersionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CatalogVersionFieldRefs;
}
export interface Prisma__CatalogVersionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    serviceFrameworks<T extends Prisma.CatalogVersion$serviceFrameworksArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CatalogVersion$serviceFrameworksArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceFrameworkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    evaluations<T extends Prisma.CatalogVersion$evaluationsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CatalogVersion$evaluationsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EvaluationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    publisher<T extends Prisma.CatalogVersion$publisherArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CatalogVersion$publisherArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CatalogVersionFieldRefs {
    readonly id: Prisma.FieldRef<"CatalogVersion", 'String'>;
    readonly number: Prisma.FieldRef<"CatalogVersion", 'Int'>;
    readonly publishedAt: Prisma.FieldRef<"CatalogVersion", 'DateTime'>;
    readonly changeSummary: Prisma.FieldRef<"CatalogVersion", 'String'>;
    readonly publishedBy: Prisma.FieldRef<"CatalogVersion", 'String'>;
    readonly propagatedAutomatically: Prisma.FieldRef<"CatalogVersion", 'Boolean'>;
    readonly requiresAcceptance: Prisma.FieldRef<"CatalogVersion", 'Boolean'>;
}
export type CatalogVersionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CatalogVersionSelect<ExtArgs> | null;
    omit?: Prisma.CatalogVersionOmit<ExtArgs> | null;
    include?: Prisma.CatalogVersionInclude<ExtArgs> | null;
    where: Prisma.CatalogVersionWhereUniqueInput;
};
export type CatalogVersionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CatalogVersionSelect<ExtArgs> | null;
    omit?: Prisma.CatalogVersionOmit<ExtArgs> | null;
    include?: Prisma.CatalogVersionInclude<ExtArgs> | null;
    where: Prisma.CatalogVersionWhereUniqueInput;
};
export type CatalogVersionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CatalogVersionSelect<ExtArgs> | null;
    omit?: Prisma.CatalogVersionOmit<ExtArgs> | null;
    include?: Prisma.CatalogVersionInclude<ExtArgs> | null;
    where?: Prisma.CatalogVersionWhereInput;
    orderBy?: Prisma.CatalogVersionOrderByWithRelationInput | Prisma.CatalogVersionOrderByWithRelationInput[];
    cursor?: Prisma.CatalogVersionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CatalogVersionScalarFieldEnum | Prisma.CatalogVersionScalarFieldEnum[];
};
export type CatalogVersionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CatalogVersionSelect<ExtArgs> | null;
    omit?: Prisma.CatalogVersionOmit<ExtArgs> | null;
    include?: Prisma.CatalogVersionInclude<ExtArgs> | null;
    where?: Prisma.CatalogVersionWhereInput;
    orderBy?: Prisma.CatalogVersionOrderByWithRelationInput | Prisma.CatalogVersionOrderByWithRelationInput[];
    cursor?: Prisma.CatalogVersionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CatalogVersionScalarFieldEnum | Prisma.CatalogVersionScalarFieldEnum[];
};
export type CatalogVersionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CatalogVersionSelect<ExtArgs> | null;
    omit?: Prisma.CatalogVersionOmit<ExtArgs> | null;
    include?: Prisma.CatalogVersionInclude<ExtArgs> | null;
    where?: Prisma.CatalogVersionWhereInput;
    orderBy?: Prisma.CatalogVersionOrderByWithRelationInput | Prisma.CatalogVersionOrderByWithRelationInput[];
    cursor?: Prisma.CatalogVersionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CatalogVersionScalarFieldEnum | Prisma.CatalogVersionScalarFieldEnum[];
};
export type CatalogVersionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CatalogVersionSelect<ExtArgs> | null;
    omit?: Prisma.CatalogVersionOmit<ExtArgs> | null;
    include?: Prisma.CatalogVersionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CatalogVersionCreateInput, Prisma.CatalogVersionUncheckedCreateInput>;
};
export type CatalogVersionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CatalogVersionCreateManyInput | Prisma.CatalogVersionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CatalogVersionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CatalogVersionSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CatalogVersionOmit<ExtArgs> | null;
    data: Prisma.CatalogVersionCreateManyInput | Prisma.CatalogVersionCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.CatalogVersionIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type CatalogVersionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CatalogVersionSelect<ExtArgs> | null;
    omit?: Prisma.CatalogVersionOmit<ExtArgs> | null;
    include?: Prisma.CatalogVersionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CatalogVersionUpdateInput, Prisma.CatalogVersionUncheckedUpdateInput>;
    where: Prisma.CatalogVersionWhereUniqueInput;
};
export type CatalogVersionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CatalogVersionUpdateManyMutationInput, Prisma.CatalogVersionUncheckedUpdateManyInput>;
    where?: Prisma.CatalogVersionWhereInput;
    limit?: number;
};
export type CatalogVersionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CatalogVersionSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CatalogVersionOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CatalogVersionUpdateManyMutationInput, Prisma.CatalogVersionUncheckedUpdateManyInput>;
    where?: Prisma.CatalogVersionWhereInput;
    limit?: number;
    include?: Prisma.CatalogVersionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type CatalogVersionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CatalogVersionSelect<ExtArgs> | null;
    omit?: Prisma.CatalogVersionOmit<ExtArgs> | null;
    include?: Prisma.CatalogVersionInclude<ExtArgs> | null;
    where: Prisma.CatalogVersionWhereUniqueInput;
    create: Prisma.XOR<Prisma.CatalogVersionCreateInput, Prisma.CatalogVersionUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CatalogVersionUpdateInput, Prisma.CatalogVersionUncheckedUpdateInput>;
};
export type CatalogVersionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CatalogVersionSelect<ExtArgs> | null;
    omit?: Prisma.CatalogVersionOmit<ExtArgs> | null;
    include?: Prisma.CatalogVersionInclude<ExtArgs> | null;
    where: Prisma.CatalogVersionWhereUniqueInput;
};
export type CatalogVersionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CatalogVersionWhereInput;
    limit?: number;
};
export type CatalogVersion$serviceFrameworksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceFrameworkSelect<ExtArgs> | null;
    omit?: Prisma.ServiceFrameworkOmit<ExtArgs> | null;
    include?: Prisma.ServiceFrameworkInclude<ExtArgs> | null;
    where?: Prisma.ServiceFrameworkWhereInput;
    orderBy?: Prisma.ServiceFrameworkOrderByWithRelationInput | Prisma.ServiceFrameworkOrderByWithRelationInput[];
    cursor?: Prisma.ServiceFrameworkWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceFrameworkScalarFieldEnum | Prisma.ServiceFrameworkScalarFieldEnum[];
};
export type CatalogVersion$evaluationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EvaluationSelect<ExtArgs> | null;
    omit?: Prisma.EvaluationOmit<ExtArgs> | null;
    include?: Prisma.EvaluationInclude<ExtArgs> | null;
    where?: Prisma.EvaluationWhereInput;
    orderBy?: Prisma.EvaluationOrderByWithRelationInput | Prisma.EvaluationOrderByWithRelationInput[];
    cursor?: Prisma.EvaluationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EvaluationScalarFieldEnum | Prisma.EvaluationScalarFieldEnum[];
};
export type CatalogVersion$publisherArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
export type CatalogVersionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CatalogVersionSelect<ExtArgs> | null;
    omit?: Prisma.CatalogVersionOmit<ExtArgs> | null;
    include?: Prisma.CatalogVersionInclude<ExtArgs> | null;
};
export {};
