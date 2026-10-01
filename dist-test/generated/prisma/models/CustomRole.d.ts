import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CustomRoleModel = runtime.Types.Result.DefaultSelection<Prisma.$CustomRolePayload>;
export type AggregateCustomRole = {
    _count: CustomRoleCountAggregateOutputType | null;
    _min: CustomRoleMinAggregateOutputType | null;
    _max: CustomRoleMaxAggregateOutputType | null;
};
export type CustomRoleMinAggregateOutputType = {
    id: string | null;
    companyId: string | null;
    name: string | null;
    createdAt: Date | null;
};
export type CustomRoleMaxAggregateOutputType = {
    id: string | null;
    companyId: string | null;
    name: string | null;
    createdAt: Date | null;
};
export type CustomRoleCountAggregateOutputType = {
    id: number;
    companyId: number;
    name: number;
    permissions: number;
    createdAt: number;
    _all: number;
};
export type CustomRoleMinAggregateInputType = {
    id?: true;
    companyId?: true;
    name?: true;
    createdAt?: true;
};
export type CustomRoleMaxAggregateInputType = {
    id?: true;
    companyId?: true;
    name?: true;
    createdAt?: true;
};
export type CustomRoleCountAggregateInputType = {
    id?: true;
    companyId?: true;
    name?: true;
    permissions?: true;
    createdAt?: true;
    _all?: true;
};
export type CustomRoleAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CustomRoleWhereInput;
    orderBy?: Prisma.CustomRoleOrderByWithRelationInput | Prisma.CustomRoleOrderByWithRelationInput[];
    cursor?: Prisma.CustomRoleWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CustomRoleCountAggregateInputType;
    _min?: CustomRoleMinAggregateInputType;
    _max?: CustomRoleMaxAggregateInputType;
};
export type GetCustomRoleAggregateType<T extends CustomRoleAggregateArgs> = {
    [P in keyof T & keyof AggregateCustomRole]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCustomRole[P]> : Prisma.GetScalarType<T[P], AggregateCustomRole[P]>;
};
export type CustomRoleGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CustomRoleWhereInput;
    orderBy?: Prisma.CustomRoleOrderByWithAggregationInput | Prisma.CustomRoleOrderByWithAggregationInput[];
    by: Prisma.CustomRoleScalarFieldEnum[] | Prisma.CustomRoleScalarFieldEnum;
    having?: Prisma.CustomRoleScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CustomRoleCountAggregateInputType | true;
    _min?: CustomRoleMinAggregateInputType;
    _max?: CustomRoleMaxAggregateInputType;
};
export type CustomRoleGroupByOutputType = {
    id: string;
    companyId: string;
    name: string;
    permissions: runtime.JsonValue;
    createdAt: Date;
    _count: CustomRoleCountAggregateOutputType | null;
    _min: CustomRoleMinAggregateOutputType | null;
    _max: CustomRoleMaxAggregateOutputType | null;
};
type GetCustomRoleGroupByPayload<T extends CustomRoleGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CustomRoleGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CustomRoleGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CustomRoleGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CustomRoleGroupByOutputType[P]>;
}>>;
export type CustomRoleWhereInput = {
    AND?: Prisma.CustomRoleWhereInput | Prisma.CustomRoleWhereInput[];
    OR?: Prisma.CustomRoleWhereInput[];
    NOT?: Prisma.CustomRoleWhereInput | Prisma.CustomRoleWhereInput[];
    id?: Prisma.UuidFilter<"CustomRole"> | string;
    companyId?: Prisma.UuidFilter<"CustomRole"> | string;
    name?: Prisma.StringFilter<"CustomRole"> | string;
    permissions?: Prisma.JsonFilter<"CustomRole">;
    createdAt?: Prisma.DateTimeFilter<"CustomRole"> | Date | string;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    users?: Prisma.UserListRelationFilter;
};
export type CustomRoleOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    permissions?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    company?: Prisma.CompanyOrderByWithRelationInput;
    users?: Prisma.UserOrderByRelationAggregateInput;
};
export type CustomRoleWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.CustomRoleWhereInput | Prisma.CustomRoleWhereInput[];
    OR?: Prisma.CustomRoleWhereInput[];
    NOT?: Prisma.CustomRoleWhereInput | Prisma.CustomRoleWhereInput[];
    companyId?: Prisma.UuidFilter<"CustomRole"> | string;
    name?: Prisma.StringFilter<"CustomRole"> | string;
    permissions?: Prisma.JsonFilter<"CustomRole">;
    createdAt?: Prisma.DateTimeFilter<"CustomRole"> | Date | string;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    users?: Prisma.UserListRelationFilter;
}, "id">;
export type CustomRoleOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    permissions?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.CustomRoleCountOrderByAggregateInput;
    _max?: Prisma.CustomRoleMaxOrderByAggregateInput;
    _min?: Prisma.CustomRoleMinOrderByAggregateInput;
};
export type CustomRoleScalarWhereWithAggregatesInput = {
    AND?: Prisma.CustomRoleScalarWhereWithAggregatesInput | Prisma.CustomRoleScalarWhereWithAggregatesInput[];
    OR?: Prisma.CustomRoleScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CustomRoleScalarWhereWithAggregatesInput | Prisma.CustomRoleScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"CustomRole"> | string;
    companyId?: Prisma.UuidWithAggregatesFilter<"CustomRole"> | string;
    name?: Prisma.StringWithAggregatesFilter<"CustomRole"> | string;
    permissions?: Prisma.JsonWithAggregatesFilter<"CustomRole">;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"CustomRole"> | Date | string;
};
export type CustomRoleCreateInput = {
    id?: string;
    name: string;
    permissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutCustomRolesInput;
    users?: Prisma.UserCreateNestedManyWithoutCustomRoleInput;
};
export type CustomRoleUncheckedCreateInput = {
    id?: string;
    companyId: string;
    name: string;
    permissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    users?: Prisma.UserUncheckedCreateNestedManyWithoutCustomRoleInput;
};
export type CustomRoleUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    permissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutCustomRolesNestedInput;
    users?: Prisma.UserUpdateManyWithoutCustomRoleNestedInput;
};
export type CustomRoleUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    permissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUncheckedUpdateManyWithoutCustomRoleNestedInput;
};
export type CustomRoleCreateManyInput = {
    id?: string;
    companyId: string;
    name: string;
    permissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type CustomRoleUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    permissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CustomRoleUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    permissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CustomRoleListRelationFilter = {
    every?: Prisma.CustomRoleWhereInput;
    some?: Prisma.CustomRoleWhereInput;
    none?: Prisma.CustomRoleWhereInput;
};
export type CustomRoleOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CustomRoleNullableScalarRelationFilter = {
    is?: Prisma.CustomRoleWhereInput | null;
    isNot?: Prisma.CustomRoleWhereInput | null;
};
export type CustomRoleCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    permissions?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type CustomRoleMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type CustomRoleMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type CustomRoleCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.CustomRoleCreateWithoutCompanyInput, Prisma.CustomRoleUncheckedCreateWithoutCompanyInput> | Prisma.CustomRoleCreateWithoutCompanyInput[] | Prisma.CustomRoleUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.CustomRoleCreateOrConnectWithoutCompanyInput | Prisma.CustomRoleCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.CustomRoleCreateManyCompanyInputEnvelope;
    connect?: Prisma.CustomRoleWhereUniqueInput | Prisma.CustomRoleWhereUniqueInput[];
};
export type CustomRoleUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.CustomRoleCreateWithoutCompanyInput, Prisma.CustomRoleUncheckedCreateWithoutCompanyInput> | Prisma.CustomRoleCreateWithoutCompanyInput[] | Prisma.CustomRoleUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.CustomRoleCreateOrConnectWithoutCompanyInput | Prisma.CustomRoleCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.CustomRoleCreateManyCompanyInputEnvelope;
    connect?: Prisma.CustomRoleWhereUniqueInput | Prisma.CustomRoleWhereUniqueInput[];
};
export type CustomRoleUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.CustomRoleCreateWithoutCompanyInput, Prisma.CustomRoleUncheckedCreateWithoutCompanyInput> | Prisma.CustomRoleCreateWithoutCompanyInput[] | Prisma.CustomRoleUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.CustomRoleCreateOrConnectWithoutCompanyInput | Prisma.CustomRoleCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.CustomRoleUpsertWithWhereUniqueWithoutCompanyInput | Prisma.CustomRoleUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.CustomRoleCreateManyCompanyInputEnvelope;
    set?: Prisma.CustomRoleWhereUniqueInput | Prisma.CustomRoleWhereUniqueInput[];
    disconnect?: Prisma.CustomRoleWhereUniqueInput | Prisma.CustomRoleWhereUniqueInput[];
    delete?: Prisma.CustomRoleWhereUniqueInput | Prisma.CustomRoleWhereUniqueInput[];
    connect?: Prisma.CustomRoleWhereUniqueInput | Prisma.CustomRoleWhereUniqueInput[];
    update?: Prisma.CustomRoleUpdateWithWhereUniqueWithoutCompanyInput | Prisma.CustomRoleUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.CustomRoleUpdateManyWithWhereWithoutCompanyInput | Prisma.CustomRoleUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.CustomRoleScalarWhereInput | Prisma.CustomRoleScalarWhereInput[];
};
export type CustomRoleUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.CustomRoleCreateWithoutCompanyInput, Prisma.CustomRoleUncheckedCreateWithoutCompanyInput> | Prisma.CustomRoleCreateWithoutCompanyInput[] | Prisma.CustomRoleUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.CustomRoleCreateOrConnectWithoutCompanyInput | Prisma.CustomRoleCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.CustomRoleUpsertWithWhereUniqueWithoutCompanyInput | Prisma.CustomRoleUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.CustomRoleCreateManyCompanyInputEnvelope;
    set?: Prisma.CustomRoleWhereUniqueInput | Prisma.CustomRoleWhereUniqueInput[];
    disconnect?: Prisma.CustomRoleWhereUniqueInput | Prisma.CustomRoleWhereUniqueInput[];
    delete?: Prisma.CustomRoleWhereUniqueInput | Prisma.CustomRoleWhereUniqueInput[];
    connect?: Prisma.CustomRoleWhereUniqueInput | Prisma.CustomRoleWhereUniqueInput[];
    update?: Prisma.CustomRoleUpdateWithWhereUniqueWithoutCompanyInput | Prisma.CustomRoleUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.CustomRoleUpdateManyWithWhereWithoutCompanyInput | Prisma.CustomRoleUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.CustomRoleScalarWhereInput | Prisma.CustomRoleScalarWhereInput[];
};
export type CustomRoleCreateNestedOneWithoutUsersInput = {
    create?: Prisma.XOR<Prisma.CustomRoleCreateWithoutUsersInput, Prisma.CustomRoleUncheckedCreateWithoutUsersInput>;
    connectOrCreate?: Prisma.CustomRoleCreateOrConnectWithoutUsersInput;
    connect?: Prisma.CustomRoleWhereUniqueInput;
};
export type CustomRoleUpdateOneWithoutUsersNestedInput = {
    create?: Prisma.XOR<Prisma.CustomRoleCreateWithoutUsersInput, Prisma.CustomRoleUncheckedCreateWithoutUsersInput>;
    connectOrCreate?: Prisma.CustomRoleCreateOrConnectWithoutUsersInput;
    upsert?: Prisma.CustomRoleUpsertWithoutUsersInput;
    disconnect?: Prisma.CustomRoleWhereInput | boolean;
    delete?: Prisma.CustomRoleWhereInput | boolean;
    connect?: Prisma.CustomRoleWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CustomRoleUpdateToOneWithWhereWithoutUsersInput, Prisma.CustomRoleUpdateWithoutUsersInput>, Prisma.CustomRoleUncheckedUpdateWithoutUsersInput>;
};
export type CustomRoleCreateWithoutCompanyInput = {
    id?: string;
    name: string;
    permissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    users?: Prisma.UserCreateNestedManyWithoutCustomRoleInput;
};
export type CustomRoleUncheckedCreateWithoutCompanyInput = {
    id?: string;
    name: string;
    permissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    users?: Prisma.UserUncheckedCreateNestedManyWithoutCustomRoleInput;
};
export type CustomRoleCreateOrConnectWithoutCompanyInput = {
    where: Prisma.CustomRoleWhereUniqueInput;
    create: Prisma.XOR<Prisma.CustomRoleCreateWithoutCompanyInput, Prisma.CustomRoleUncheckedCreateWithoutCompanyInput>;
};
export type CustomRoleCreateManyCompanyInputEnvelope = {
    data: Prisma.CustomRoleCreateManyCompanyInput | Prisma.CustomRoleCreateManyCompanyInput[];
    skipDuplicates?: boolean;
};
export type CustomRoleUpsertWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.CustomRoleWhereUniqueInput;
    update: Prisma.XOR<Prisma.CustomRoleUpdateWithoutCompanyInput, Prisma.CustomRoleUncheckedUpdateWithoutCompanyInput>;
    create: Prisma.XOR<Prisma.CustomRoleCreateWithoutCompanyInput, Prisma.CustomRoleUncheckedCreateWithoutCompanyInput>;
};
export type CustomRoleUpdateWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.CustomRoleWhereUniqueInput;
    data: Prisma.XOR<Prisma.CustomRoleUpdateWithoutCompanyInput, Prisma.CustomRoleUncheckedUpdateWithoutCompanyInput>;
};
export type CustomRoleUpdateManyWithWhereWithoutCompanyInput = {
    where: Prisma.CustomRoleScalarWhereInput;
    data: Prisma.XOR<Prisma.CustomRoleUpdateManyMutationInput, Prisma.CustomRoleUncheckedUpdateManyWithoutCompanyInput>;
};
export type CustomRoleScalarWhereInput = {
    AND?: Prisma.CustomRoleScalarWhereInput | Prisma.CustomRoleScalarWhereInput[];
    OR?: Prisma.CustomRoleScalarWhereInput[];
    NOT?: Prisma.CustomRoleScalarWhereInput | Prisma.CustomRoleScalarWhereInput[];
    id?: Prisma.UuidFilter<"CustomRole"> | string;
    companyId?: Prisma.UuidFilter<"CustomRole"> | string;
    name?: Prisma.StringFilter<"CustomRole"> | string;
    permissions?: Prisma.JsonFilter<"CustomRole">;
    createdAt?: Prisma.DateTimeFilter<"CustomRole"> | Date | string;
};
export type CustomRoleCreateWithoutUsersInput = {
    id?: string;
    name: string;
    permissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutCustomRolesInput;
};
export type CustomRoleUncheckedCreateWithoutUsersInput = {
    id?: string;
    companyId: string;
    name: string;
    permissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type CustomRoleCreateOrConnectWithoutUsersInput = {
    where: Prisma.CustomRoleWhereUniqueInput;
    create: Prisma.XOR<Prisma.CustomRoleCreateWithoutUsersInput, Prisma.CustomRoleUncheckedCreateWithoutUsersInput>;
};
export type CustomRoleUpsertWithoutUsersInput = {
    update: Prisma.XOR<Prisma.CustomRoleUpdateWithoutUsersInput, Prisma.CustomRoleUncheckedUpdateWithoutUsersInput>;
    create: Prisma.XOR<Prisma.CustomRoleCreateWithoutUsersInput, Prisma.CustomRoleUncheckedCreateWithoutUsersInput>;
    where?: Prisma.CustomRoleWhereInput;
};
export type CustomRoleUpdateToOneWithWhereWithoutUsersInput = {
    where?: Prisma.CustomRoleWhereInput;
    data: Prisma.XOR<Prisma.CustomRoleUpdateWithoutUsersInput, Prisma.CustomRoleUncheckedUpdateWithoutUsersInput>;
};
export type CustomRoleUpdateWithoutUsersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    permissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutCustomRolesNestedInput;
};
export type CustomRoleUncheckedUpdateWithoutUsersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    permissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CustomRoleCreateManyCompanyInput = {
    id?: string;
    name: string;
    permissions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type CustomRoleUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    permissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUpdateManyWithoutCustomRoleNestedInput;
};
export type CustomRoleUncheckedUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    permissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUncheckedUpdateManyWithoutCustomRoleNestedInput;
};
export type CustomRoleUncheckedUpdateManyWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    permissions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CustomRoleCountOutputType = {
    users: number;
};
export type CustomRoleCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    users?: boolean | CustomRoleCountOutputTypeCountUsersArgs;
};
export type CustomRoleCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomRoleCountOutputTypeSelect<ExtArgs> | null;
};
export type CustomRoleCountOutputTypeCountUsersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
};
export type CustomRoleSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    name?: boolean;
    permissions?: boolean;
    createdAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    users?: boolean | Prisma.CustomRole$usersArgs<ExtArgs>;
    _count?: boolean | Prisma.CustomRoleCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["customRole"]>;
export type CustomRoleSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    name?: boolean;
    permissions?: boolean;
    createdAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["customRole"]>;
export type CustomRoleSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    name?: boolean;
    permissions?: boolean;
    createdAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["customRole"]>;
export type CustomRoleSelectScalar = {
    id?: boolean;
    companyId?: boolean;
    name?: boolean;
    permissions?: boolean;
    createdAt?: boolean;
};
export type CustomRoleOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "companyId" | "name" | "permissions" | "createdAt", ExtArgs["result"]["customRole"]>;
export type CustomRoleInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    users?: boolean | Prisma.CustomRole$usersArgs<ExtArgs>;
    _count?: boolean | Prisma.CustomRoleCountOutputTypeDefaultArgs<ExtArgs>;
};
export type CustomRoleIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type CustomRoleIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $CustomRolePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "CustomRole";
    objects: {
        company: Prisma.$CompanyPayload<ExtArgs>;
        users: Prisma.$UserPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        companyId: string;
        name: string;
        permissions: runtime.JsonValue;
        createdAt: Date;
    }, ExtArgs["result"]["customRole"]>;
    composites: {};
};
export type CustomRoleGetPayload<S extends boolean | null | undefined | CustomRoleDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CustomRolePayload, S>;
export type CustomRoleCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CustomRoleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CustomRoleCountAggregateInputType | true;
};
export interface CustomRoleDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['CustomRole'];
        meta: {
            name: 'CustomRole';
        };
    };
    findUnique<T extends CustomRoleFindUniqueArgs>(args: Prisma.SelectSubset<T, CustomRoleFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CustomRoleClient<runtime.Types.Result.GetResult<Prisma.$CustomRolePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CustomRoleFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CustomRoleFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CustomRoleClient<runtime.Types.Result.GetResult<Prisma.$CustomRolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CustomRoleFindFirstArgs>(args?: Prisma.SelectSubset<T, CustomRoleFindFirstArgs<ExtArgs>>): Prisma.Prisma__CustomRoleClient<runtime.Types.Result.GetResult<Prisma.$CustomRolePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CustomRoleFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CustomRoleFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CustomRoleClient<runtime.Types.Result.GetResult<Prisma.$CustomRolePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CustomRoleFindManyArgs>(args?: Prisma.SelectSubset<T, CustomRoleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CustomRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CustomRoleCreateArgs>(args: Prisma.SelectSubset<T, CustomRoleCreateArgs<ExtArgs>>): Prisma.Prisma__CustomRoleClient<runtime.Types.Result.GetResult<Prisma.$CustomRolePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CustomRoleCreateManyArgs>(args?: Prisma.SelectSubset<T, CustomRoleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends CustomRoleCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CustomRoleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CustomRolePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends CustomRoleDeleteArgs>(args: Prisma.SelectSubset<T, CustomRoleDeleteArgs<ExtArgs>>): Prisma.Prisma__CustomRoleClient<runtime.Types.Result.GetResult<Prisma.$CustomRolePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CustomRoleUpdateArgs>(args: Prisma.SelectSubset<T, CustomRoleUpdateArgs<ExtArgs>>): Prisma.Prisma__CustomRoleClient<runtime.Types.Result.GetResult<Prisma.$CustomRolePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CustomRoleDeleteManyArgs>(args?: Prisma.SelectSubset<T, CustomRoleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CustomRoleUpdateManyArgs>(args: Prisma.SelectSubset<T, CustomRoleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends CustomRoleUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CustomRoleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CustomRolePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends CustomRoleUpsertArgs>(args: Prisma.SelectSubset<T, CustomRoleUpsertArgs<ExtArgs>>): Prisma.Prisma__CustomRoleClient<runtime.Types.Result.GetResult<Prisma.$CustomRolePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CustomRoleCountArgs>(args?: Prisma.Subset<T, CustomRoleCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CustomRoleCountAggregateOutputType> : number>;
    aggregate<T extends CustomRoleAggregateArgs>(args: Prisma.Subset<T, CustomRoleAggregateArgs>): Prisma.PrismaPromise<GetCustomRoleAggregateType<T>>;
    groupBy<T extends CustomRoleGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CustomRoleGroupByArgs['orderBy'];
    } : {
        orderBy?: CustomRoleGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CustomRoleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomRoleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CustomRoleFieldRefs;
}
export interface Prisma__CustomRoleClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    company<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    users<T extends Prisma.CustomRole$usersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CustomRole$usersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CustomRoleFieldRefs {
    readonly id: Prisma.FieldRef<"CustomRole", 'String'>;
    readonly companyId: Prisma.FieldRef<"CustomRole", 'String'>;
    readonly name: Prisma.FieldRef<"CustomRole", 'String'>;
    readonly permissions: Prisma.FieldRef<"CustomRole", 'Json'>;
    readonly createdAt: Prisma.FieldRef<"CustomRole", 'DateTime'>;
}
export type CustomRoleFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomRoleSelect<ExtArgs> | null;
    omit?: Prisma.CustomRoleOmit<ExtArgs> | null;
    include?: Prisma.CustomRoleInclude<ExtArgs> | null;
    where: Prisma.CustomRoleWhereUniqueInput;
};
export type CustomRoleFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomRoleSelect<ExtArgs> | null;
    omit?: Prisma.CustomRoleOmit<ExtArgs> | null;
    include?: Prisma.CustomRoleInclude<ExtArgs> | null;
    where: Prisma.CustomRoleWhereUniqueInput;
};
export type CustomRoleFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomRoleSelect<ExtArgs> | null;
    omit?: Prisma.CustomRoleOmit<ExtArgs> | null;
    include?: Prisma.CustomRoleInclude<ExtArgs> | null;
    where?: Prisma.CustomRoleWhereInput;
    orderBy?: Prisma.CustomRoleOrderByWithRelationInput | Prisma.CustomRoleOrderByWithRelationInput[];
    cursor?: Prisma.CustomRoleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CustomRoleScalarFieldEnum | Prisma.CustomRoleScalarFieldEnum[];
};
export type CustomRoleFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomRoleSelect<ExtArgs> | null;
    omit?: Prisma.CustomRoleOmit<ExtArgs> | null;
    include?: Prisma.CustomRoleInclude<ExtArgs> | null;
    where?: Prisma.CustomRoleWhereInput;
    orderBy?: Prisma.CustomRoleOrderByWithRelationInput | Prisma.CustomRoleOrderByWithRelationInput[];
    cursor?: Prisma.CustomRoleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CustomRoleScalarFieldEnum | Prisma.CustomRoleScalarFieldEnum[];
};
export type CustomRoleFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomRoleSelect<ExtArgs> | null;
    omit?: Prisma.CustomRoleOmit<ExtArgs> | null;
    include?: Prisma.CustomRoleInclude<ExtArgs> | null;
    where?: Prisma.CustomRoleWhereInput;
    orderBy?: Prisma.CustomRoleOrderByWithRelationInput | Prisma.CustomRoleOrderByWithRelationInput[];
    cursor?: Prisma.CustomRoleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CustomRoleScalarFieldEnum | Prisma.CustomRoleScalarFieldEnum[];
};
export type CustomRoleCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomRoleSelect<ExtArgs> | null;
    omit?: Prisma.CustomRoleOmit<ExtArgs> | null;
    include?: Prisma.CustomRoleInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CustomRoleCreateInput, Prisma.CustomRoleUncheckedCreateInput>;
};
export type CustomRoleCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CustomRoleCreateManyInput | Prisma.CustomRoleCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CustomRoleCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomRoleSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CustomRoleOmit<ExtArgs> | null;
    data: Prisma.CustomRoleCreateManyInput | Prisma.CustomRoleCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.CustomRoleIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type CustomRoleUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomRoleSelect<ExtArgs> | null;
    omit?: Prisma.CustomRoleOmit<ExtArgs> | null;
    include?: Prisma.CustomRoleInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CustomRoleUpdateInput, Prisma.CustomRoleUncheckedUpdateInput>;
    where: Prisma.CustomRoleWhereUniqueInput;
};
export type CustomRoleUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CustomRoleUpdateManyMutationInput, Prisma.CustomRoleUncheckedUpdateManyInput>;
    where?: Prisma.CustomRoleWhereInput;
    limit?: number;
};
export type CustomRoleUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomRoleSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CustomRoleOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CustomRoleUpdateManyMutationInput, Prisma.CustomRoleUncheckedUpdateManyInput>;
    where?: Prisma.CustomRoleWhereInput;
    limit?: number;
    include?: Prisma.CustomRoleIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type CustomRoleUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomRoleSelect<ExtArgs> | null;
    omit?: Prisma.CustomRoleOmit<ExtArgs> | null;
    include?: Prisma.CustomRoleInclude<ExtArgs> | null;
    where: Prisma.CustomRoleWhereUniqueInput;
    create: Prisma.XOR<Prisma.CustomRoleCreateInput, Prisma.CustomRoleUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CustomRoleUpdateInput, Prisma.CustomRoleUncheckedUpdateInput>;
};
export type CustomRoleDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomRoleSelect<ExtArgs> | null;
    omit?: Prisma.CustomRoleOmit<ExtArgs> | null;
    include?: Prisma.CustomRoleInclude<ExtArgs> | null;
    where: Prisma.CustomRoleWhereUniqueInput;
};
export type CustomRoleDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CustomRoleWhereInput;
    limit?: number;
};
export type CustomRole$usersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type CustomRoleDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomRoleSelect<ExtArgs> | null;
    omit?: Prisma.CustomRoleOmit<ExtArgs> | null;
    include?: Prisma.CustomRoleInclude<ExtArgs> | null;
};
export {};
