import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type OrganizationModel = runtime.Types.Result.DefaultSelection<Prisma.$OrganizationPayload>;
export type AggregateOrganization = {
    _count: OrganizationCountAggregateOutputType | null;
    _min: OrganizationMinAggregateOutputType | null;
    _max: OrganizationMaxAggregateOutputType | null;
};
export type OrganizationMinAggregateOutputType = {
    id: string | null;
    companyId: string | null;
    name: string | null;
    description: string | null;
    size: $Enums.OrganizationSize | null;
    industry: $Enums.Industry | null;
    businessModel: $Enums.BusinessModel | null;
    yearsInOperation: $Enums.YearsInOperation | null;
    complianceMaturity: $Enums.ComplianceMaturity | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type OrganizationMaxAggregateOutputType = {
    id: string | null;
    companyId: string | null;
    name: string | null;
    description: string | null;
    size: $Enums.OrganizationSize | null;
    industry: $Enums.Industry | null;
    businessModel: $Enums.BusinessModel | null;
    yearsInOperation: $Enums.YearsInOperation | null;
    complianceMaturity: $Enums.ComplianceMaturity | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type OrganizationCountAggregateOutputType = {
    id: number;
    companyId: number;
    name: number;
    description: number;
    size: number;
    industry: number;
    businessModel: number;
    yearsInOperation: number;
    incorporationCountries: number;
    clientCountries: number;
    complianceMaturity: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type OrganizationMinAggregateInputType = {
    id?: true;
    companyId?: true;
    name?: true;
    description?: true;
    size?: true;
    industry?: true;
    businessModel?: true;
    yearsInOperation?: true;
    complianceMaturity?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type OrganizationMaxAggregateInputType = {
    id?: true;
    companyId?: true;
    name?: true;
    description?: true;
    size?: true;
    industry?: true;
    businessModel?: true;
    yearsInOperation?: true;
    complianceMaturity?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type OrganizationCountAggregateInputType = {
    id?: true;
    companyId?: true;
    name?: true;
    description?: true;
    size?: true;
    industry?: true;
    businessModel?: true;
    yearsInOperation?: true;
    incorporationCountries?: true;
    clientCountries?: true;
    complianceMaturity?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type OrganizationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrganizationWhereInput;
    orderBy?: Prisma.OrganizationOrderByWithRelationInput | Prisma.OrganizationOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | OrganizationCountAggregateInputType;
    _min?: OrganizationMinAggregateInputType;
    _max?: OrganizationMaxAggregateInputType;
};
export type GetOrganizationAggregateType<T extends OrganizationAggregateArgs> = {
    [P in keyof T & keyof AggregateOrganization]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateOrganization[P]> : Prisma.GetScalarType<T[P], AggregateOrganization[P]>;
};
export type OrganizationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrganizationWhereInput;
    orderBy?: Prisma.OrganizationOrderByWithAggregationInput | Prisma.OrganizationOrderByWithAggregationInput[];
    by: Prisma.OrganizationScalarFieldEnum[] | Prisma.OrganizationScalarFieldEnum;
    having?: Prisma.OrganizationScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: OrganizationCountAggregateInputType | true;
    _min?: OrganizationMinAggregateInputType;
    _max?: OrganizationMaxAggregateInputType;
};
export type OrganizationGroupByOutputType = {
    id: string;
    companyId: string;
    name: string;
    description: string;
    size: $Enums.OrganizationSize;
    industry: $Enums.Industry;
    businessModel: $Enums.BusinessModel;
    yearsInOperation: $Enums.YearsInOperation | null;
    incorporationCountries: $Enums.IncorporationCountry[];
    clientCountries: $Enums.ClientCountry[];
    complianceMaturity: $Enums.ComplianceMaturity;
    createdAt: Date;
    updatedAt: Date;
    _count: OrganizationCountAggregateOutputType | null;
    _min: OrganizationMinAggregateOutputType | null;
    _max: OrganizationMaxAggregateOutputType | null;
};
type GetOrganizationGroupByPayload<T extends OrganizationGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<OrganizationGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof OrganizationGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], OrganizationGroupByOutputType[P]> : Prisma.GetScalarType<T[P], OrganizationGroupByOutputType[P]>;
}>>;
export type OrganizationWhereInput = {
    AND?: Prisma.OrganizationWhereInput | Prisma.OrganizationWhereInput[];
    OR?: Prisma.OrganizationWhereInput[];
    NOT?: Prisma.OrganizationWhereInput | Prisma.OrganizationWhereInput[];
    id?: Prisma.UuidFilter<"Organization"> | string;
    companyId?: Prisma.UuidFilter<"Organization"> | string;
    name?: Prisma.StringFilter<"Organization"> | string;
    description?: Prisma.StringFilter<"Organization"> | string;
    size?: Prisma.EnumOrganizationSizeFilter<"Organization"> | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFilter<"Organization"> | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFilter<"Organization"> | $Enums.BusinessModel;
    yearsInOperation?: Prisma.EnumYearsInOperationNullableFilter<"Organization"> | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.EnumIncorporationCountryNullableListFilter<"Organization">;
    clientCountries?: Prisma.EnumClientCountryNullableListFilter<"Organization">;
    complianceMaturity?: Prisma.EnumComplianceMaturityFilter<"Organization"> | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFilter<"Organization"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Organization"> | Date | string;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    regulations?: Prisma.OrganizationRegulationListRelationFilter;
    responsibles?: Prisma.OrganizationResponsibleListRelationFilter;
    services?: Prisma.ServiceListRelationFilter;
    assets?: Prisma.AssetListRelationFilter;
};
export type OrganizationOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    size?: Prisma.SortOrder;
    industry?: Prisma.SortOrder;
    businessModel?: Prisma.SortOrder;
    yearsInOperation?: Prisma.SortOrderInput | Prisma.SortOrder;
    incorporationCountries?: Prisma.SortOrder;
    clientCountries?: Prisma.SortOrder;
    complianceMaturity?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    company?: Prisma.CompanyOrderByWithRelationInput;
    regulations?: Prisma.OrganizationRegulationOrderByRelationAggregateInput;
    responsibles?: Prisma.OrganizationResponsibleOrderByRelationAggregateInput;
    services?: Prisma.ServiceOrderByRelationAggregateInput;
    assets?: Prisma.AssetOrderByRelationAggregateInput;
};
export type OrganizationWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    companyId?: string;
    AND?: Prisma.OrganizationWhereInput | Prisma.OrganizationWhereInput[];
    OR?: Prisma.OrganizationWhereInput[];
    NOT?: Prisma.OrganizationWhereInput | Prisma.OrganizationWhereInput[];
    name?: Prisma.StringFilter<"Organization"> | string;
    description?: Prisma.StringFilter<"Organization"> | string;
    size?: Prisma.EnumOrganizationSizeFilter<"Organization"> | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFilter<"Organization"> | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFilter<"Organization"> | $Enums.BusinessModel;
    yearsInOperation?: Prisma.EnumYearsInOperationNullableFilter<"Organization"> | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.EnumIncorporationCountryNullableListFilter<"Organization">;
    clientCountries?: Prisma.EnumClientCountryNullableListFilter<"Organization">;
    complianceMaturity?: Prisma.EnumComplianceMaturityFilter<"Organization"> | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFilter<"Organization"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Organization"> | Date | string;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    regulations?: Prisma.OrganizationRegulationListRelationFilter;
    responsibles?: Prisma.OrganizationResponsibleListRelationFilter;
    services?: Prisma.ServiceListRelationFilter;
    assets?: Prisma.AssetListRelationFilter;
}, "id" | "companyId">;
export type OrganizationOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    size?: Prisma.SortOrder;
    industry?: Prisma.SortOrder;
    businessModel?: Prisma.SortOrder;
    yearsInOperation?: Prisma.SortOrderInput | Prisma.SortOrder;
    incorporationCountries?: Prisma.SortOrder;
    clientCountries?: Prisma.SortOrder;
    complianceMaturity?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.OrganizationCountOrderByAggregateInput;
    _max?: Prisma.OrganizationMaxOrderByAggregateInput;
    _min?: Prisma.OrganizationMinOrderByAggregateInput;
};
export type OrganizationScalarWhereWithAggregatesInput = {
    AND?: Prisma.OrganizationScalarWhereWithAggregatesInput | Prisma.OrganizationScalarWhereWithAggregatesInput[];
    OR?: Prisma.OrganizationScalarWhereWithAggregatesInput[];
    NOT?: Prisma.OrganizationScalarWhereWithAggregatesInput | Prisma.OrganizationScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Organization"> | string;
    companyId?: Prisma.UuidWithAggregatesFilter<"Organization"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Organization"> | string;
    description?: Prisma.StringWithAggregatesFilter<"Organization"> | string;
    size?: Prisma.EnumOrganizationSizeWithAggregatesFilter<"Organization"> | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryWithAggregatesFilter<"Organization"> | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelWithAggregatesFilter<"Organization"> | $Enums.BusinessModel;
    yearsInOperation?: Prisma.EnumYearsInOperationNullableWithAggregatesFilter<"Organization"> | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.EnumIncorporationCountryNullableListFilter<"Organization">;
    clientCountries?: Prisma.EnumClientCountryNullableListFilter<"Organization">;
    complianceMaturity?: Prisma.EnumComplianceMaturityWithAggregatesFilter<"Organization"> | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Organization"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Organization"> | Date | string;
};
export type OrganizationCreateInput = {
    id?: string;
    name: string;
    description: string;
    size: $Enums.OrganizationSize;
    industry: $Enums.Industry;
    businessModel: $Enums.BusinessModel;
    yearsInOperation?: $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationCreateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationCreateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity: $Enums.ComplianceMaturity;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutOrganizationInput;
    regulations?: Prisma.OrganizationRegulationCreateNestedManyWithoutOrganizationInput;
    responsibles?: Prisma.OrganizationResponsibleCreateNestedManyWithoutOrganizationInput;
    services?: Prisma.ServiceCreateNestedManyWithoutOrganizationInput;
    assets?: Prisma.AssetCreateNestedManyWithoutOrganizationInput;
};
export type OrganizationUncheckedCreateInput = {
    id?: string;
    companyId: string;
    name: string;
    description: string;
    size: $Enums.OrganizationSize;
    industry: $Enums.Industry;
    businessModel: $Enums.BusinessModel;
    yearsInOperation?: $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationCreateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationCreateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity: $Enums.ComplianceMaturity;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    regulations?: Prisma.OrganizationRegulationUncheckedCreateNestedManyWithoutOrganizationInput;
    responsibles?: Prisma.OrganizationResponsibleUncheckedCreateNestedManyWithoutOrganizationInput;
    services?: Prisma.ServiceUncheckedCreateNestedManyWithoutOrganizationInput;
    assets?: Prisma.AssetUncheckedCreateNestedManyWithoutOrganizationInput;
};
export type OrganizationUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    size?: Prisma.EnumOrganizationSizeFieldUpdateOperationsInput | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFieldUpdateOperationsInput | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFieldUpdateOperationsInput | $Enums.BusinessModel;
    yearsInOperation?: Prisma.NullableEnumYearsInOperationFieldUpdateOperationsInput | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationUpdateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationUpdateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity?: Prisma.EnumComplianceMaturityFieldUpdateOperationsInput | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutOrganizationNestedInput;
    regulations?: Prisma.OrganizationRegulationUpdateManyWithoutOrganizationNestedInput;
    responsibles?: Prisma.OrganizationResponsibleUpdateManyWithoutOrganizationNestedInput;
    services?: Prisma.ServiceUpdateManyWithoutOrganizationNestedInput;
    assets?: Prisma.AssetUpdateManyWithoutOrganizationNestedInput;
};
export type OrganizationUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    size?: Prisma.EnumOrganizationSizeFieldUpdateOperationsInput | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFieldUpdateOperationsInput | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFieldUpdateOperationsInput | $Enums.BusinessModel;
    yearsInOperation?: Prisma.NullableEnumYearsInOperationFieldUpdateOperationsInput | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationUpdateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationUpdateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity?: Prisma.EnumComplianceMaturityFieldUpdateOperationsInput | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    regulations?: Prisma.OrganizationRegulationUncheckedUpdateManyWithoutOrganizationNestedInput;
    responsibles?: Prisma.OrganizationResponsibleUncheckedUpdateManyWithoutOrganizationNestedInput;
    services?: Prisma.ServiceUncheckedUpdateManyWithoutOrganizationNestedInput;
    assets?: Prisma.AssetUncheckedUpdateManyWithoutOrganizationNestedInput;
};
export type OrganizationCreateManyInput = {
    id?: string;
    companyId: string;
    name: string;
    description: string;
    size: $Enums.OrganizationSize;
    industry: $Enums.Industry;
    businessModel: $Enums.BusinessModel;
    yearsInOperation?: $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationCreateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationCreateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity: $Enums.ComplianceMaturity;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type OrganizationUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    size?: Prisma.EnumOrganizationSizeFieldUpdateOperationsInput | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFieldUpdateOperationsInput | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFieldUpdateOperationsInput | $Enums.BusinessModel;
    yearsInOperation?: Prisma.NullableEnumYearsInOperationFieldUpdateOperationsInput | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationUpdateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationUpdateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity?: Prisma.EnumComplianceMaturityFieldUpdateOperationsInput | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OrganizationUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    size?: Prisma.EnumOrganizationSizeFieldUpdateOperationsInput | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFieldUpdateOperationsInput | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFieldUpdateOperationsInput | $Enums.BusinessModel;
    yearsInOperation?: Prisma.NullableEnumYearsInOperationFieldUpdateOperationsInput | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationUpdateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationUpdateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity?: Prisma.EnumComplianceMaturityFieldUpdateOperationsInput | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OrganizationNullableScalarRelationFilter = {
    is?: Prisma.OrganizationWhereInput | null;
    isNot?: Prisma.OrganizationWhereInput | null;
};
export type EnumIncorporationCountryNullableListFilter<$PrismaModel = never> = {
    equals?: $Enums.IncorporationCountry[] | Prisma.ListEnumIncorporationCountryFieldRefInput<$PrismaModel> | null;
    has?: $Enums.IncorporationCountry | Prisma.EnumIncorporationCountryFieldRefInput<$PrismaModel> | null;
    hasEvery?: $Enums.IncorporationCountry[] | Prisma.ListEnumIncorporationCountryFieldRefInput<$PrismaModel>;
    hasSome?: $Enums.IncorporationCountry[] | Prisma.ListEnumIncorporationCountryFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
};
export type EnumClientCountryNullableListFilter<$PrismaModel = never> = {
    equals?: $Enums.ClientCountry[] | Prisma.ListEnumClientCountryFieldRefInput<$PrismaModel> | null;
    has?: $Enums.ClientCountry | Prisma.EnumClientCountryFieldRefInput<$PrismaModel> | null;
    hasEvery?: $Enums.ClientCountry[] | Prisma.ListEnumClientCountryFieldRefInput<$PrismaModel>;
    hasSome?: $Enums.ClientCountry[] | Prisma.ListEnumClientCountryFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
};
export type OrganizationCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    size?: Prisma.SortOrder;
    industry?: Prisma.SortOrder;
    businessModel?: Prisma.SortOrder;
    yearsInOperation?: Prisma.SortOrder;
    incorporationCountries?: Prisma.SortOrder;
    clientCountries?: Prisma.SortOrder;
    complianceMaturity?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type OrganizationMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    size?: Prisma.SortOrder;
    industry?: Prisma.SortOrder;
    businessModel?: Prisma.SortOrder;
    yearsInOperation?: Prisma.SortOrder;
    complianceMaturity?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type OrganizationMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    size?: Prisma.SortOrder;
    industry?: Prisma.SortOrder;
    businessModel?: Prisma.SortOrder;
    yearsInOperation?: Prisma.SortOrder;
    complianceMaturity?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type OrganizationScalarRelationFilter = {
    is?: Prisma.OrganizationWhereInput;
    isNot?: Prisma.OrganizationWhereInput;
};
export type OrganizationCreateNestedOneWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.OrganizationCreateWithoutCompanyInput, Prisma.OrganizationUncheckedCreateWithoutCompanyInput>;
    connectOrCreate?: Prisma.OrganizationCreateOrConnectWithoutCompanyInput;
    connect?: Prisma.OrganizationWhereUniqueInput;
};
export type OrganizationUncheckedCreateNestedOneWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.OrganizationCreateWithoutCompanyInput, Prisma.OrganizationUncheckedCreateWithoutCompanyInput>;
    connectOrCreate?: Prisma.OrganizationCreateOrConnectWithoutCompanyInput;
    connect?: Prisma.OrganizationWhereUniqueInput;
};
export type OrganizationUpdateOneWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationCreateWithoutCompanyInput, Prisma.OrganizationUncheckedCreateWithoutCompanyInput>;
    connectOrCreate?: Prisma.OrganizationCreateOrConnectWithoutCompanyInput;
    upsert?: Prisma.OrganizationUpsertWithoutCompanyInput;
    disconnect?: Prisma.OrganizationWhereInput | boolean;
    delete?: Prisma.OrganizationWhereInput | boolean;
    connect?: Prisma.OrganizationWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.OrganizationUpdateToOneWithWhereWithoutCompanyInput, Prisma.OrganizationUpdateWithoutCompanyInput>, Prisma.OrganizationUncheckedUpdateWithoutCompanyInput>;
};
export type OrganizationUncheckedUpdateOneWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationCreateWithoutCompanyInput, Prisma.OrganizationUncheckedCreateWithoutCompanyInput>;
    connectOrCreate?: Prisma.OrganizationCreateOrConnectWithoutCompanyInput;
    upsert?: Prisma.OrganizationUpsertWithoutCompanyInput;
    disconnect?: Prisma.OrganizationWhereInput | boolean;
    delete?: Prisma.OrganizationWhereInput | boolean;
    connect?: Prisma.OrganizationWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.OrganizationUpdateToOneWithWhereWithoutCompanyInput, Prisma.OrganizationUpdateWithoutCompanyInput>, Prisma.OrganizationUncheckedUpdateWithoutCompanyInput>;
};
export type OrganizationCreateincorporationCountriesInput = {
    set: $Enums.IncorporationCountry[];
};
export type OrganizationCreateclientCountriesInput = {
    set: $Enums.ClientCountry[];
};
export type EnumOrganizationSizeFieldUpdateOperationsInput = {
    set?: $Enums.OrganizationSize;
};
export type EnumIndustryFieldUpdateOperationsInput = {
    set?: $Enums.Industry;
};
export type EnumBusinessModelFieldUpdateOperationsInput = {
    set?: $Enums.BusinessModel;
};
export type NullableEnumYearsInOperationFieldUpdateOperationsInput = {
    set?: $Enums.YearsInOperation | null;
};
export type OrganizationUpdateincorporationCountriesInput = {
    set?: $Enums.IncorporationCountry[];
    push?: $Enums.IncorporationCountry | $Enums.IncorporationCountry[];
};
export type OrganizationUpdateclientCountriesInput = {
    set?: $Enums.ClientCountry[];
    push?: $Enums.ClientCountry | $Enums.ClientCountry[];
};
export type EnumComplianceMaturityFieldUpdateOperationsInput = {
    set?: $Enums.ComplianceMaturity;
};
export type OrganizationCreateNestedOneWithoutRegulationsInput = {
    create?: Prisma.XOR<Prisma.OrganizationCreateWithoutRegulationsInput, Prisma.OrganizationUncheckedCreateWithoutRegulationsInput>;
    connectOrCreate?: Prisma.OrganizationCreateOrConnectWithoutRegulationsInput;
    connect?: Prisma.OrganizationWhereUniqueInput;
};
export type OrganizationUpdateOneRequiredWithoutRegulationsNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationCreateWithoutRegulationsInput, Prisma.OrganizationUncheckedCreateWithoutRegulationsInput>;
    connectOrCreate?: Prisma.OrganizationCreateOrConnectWithoutRegulationsInput;
    upsert?: Prisma.OrganizationUpsertWithoutRegulationsInput;
    connect?: Prisma.OrganizationWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.OrganizationUpdateToOneWithWhereWithoutRegulationsInput, Prisma.OrganizationUpdateWithoutRegulationsInput>, Prisma.OrganizationUncheckedUpdateWithoutRegulationsInput>;
};
export type OrganizationCreateNestedOneWithoutResponsiblesInput = {
    create?: Prisma.XOR<Prisma.OrganizationCreateWithoutResponsiblesInput, Prisma.OrganizationUncheckedCreateWithoutResponsiblesInput>;
    connectOrCreate?: Prisma.OrganizationCreateOrConnectWithoutResponsiblesInput;
    connect?: Prisma.OrganizationWhereUniqueInput;
};
export type OrganizationUpdateOneRequiredWithoutResponsiblesNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationCreateWithoutResponsiblesInput, Prisma.OrganizationUncheckedCreateWithoutResponsiblesInput>;
    connectOrCreate?: Prisma.OrganizationCreateOrConnectWithoutResponsiblesInput;
    upsert?: Prisma.OrganizationUpsertWithoutResponsiblesInput;
    connect?: Prisma.OrganizationWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.OrganizationUpdateToOneWithWhereWithoutResponsiblesInput, Prisma.OrganizationUpdateWithoutResponsiblesInput>, Prisma.OrganizationUncheckedUpdateWithoutResponsiblesInput>;
};
export type OrganizationCreateNestedOneWithoutServicesInput = {
    create?: Prisma.XOR<Prisma.OrganizationCreateWithoutServicesInput, Prisma.OrganizationUncheckedCreateWithoutServicesInput>;
    connectOrCreate?: Prisma.OrganizationCreateOrConnectWithoutServicesInput;
    connect?: Prisma.OrganizationWhereUniqueInput;
};
export type OrganizationUpdateOneRequiredWithoutServicesNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationCreateWithoutServicesInput, Prisma.OrganizationUncheckedCreateWithoutServicesInput>;
    connectOrCreate?: Prisma.OrganizationCreateOrConnectWithoutServicesInput;
    upsert?: Prisma.OrganizationUpsertWithoutServicesInput;
    connect?: Prisma.OrganizationWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.OrganizationUpdateToOneWithWhereWithoutServicesInput, Prisma.OrganizationUpdateWithoutServicesInput>, Prisma.OrganizationUncheckedUpdateWithoutServicesInput>;
};
export type OrganizationCreateNestedOneWithoutAssetsInput = {
    create?: Prisma.XOR<Prisma.OrganizationCreateWithoutAssetsInput, Prisma.OrganizationUncheckedCreateWithoutAssetsInput>;
    connectOrCreate?: Prisma.OrganizationCreateOrConnectWithoutAssetsInput;
    connect?: Prisma.OrganizationWhereUniqueInput;
};
export type OrganizationUpdateOneRequiredWithoutAssetsNestedInput = {
    create?: Prisma.XOR<Prisma.OrganizationCreateWithoutAssetsInput, Prisma.OrganizationUncheckedCreateWithoutAssetsInput>;
    connectOrCreate?: Prisma.OrganizationCreateOrConnectWithoutAssetsInput;
    upsert?: Prisma.OrganizationUpsertWithoutAssetsInput;
    connect?: Prisma.OrganizationWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.OrganizationUpdateToOneWithWhereWithoutAssetsInput, Prisma.OrganizationUpdateWithoutAssetsInput>, Prisma.OrganizationUncheckedUpdateWithoutAssetsInput>;
};
export type OrganizationCreateWithoutCompanyInput = {
    id?: string;
    name: string;
    description: string;
    size: $Enums.OrganizationSize;
    industry: $Enums.Industry;
    businessModel: $Enums.BusinessModel;
    yearsInOperation?: $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationCreateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationCreateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity: $Enums.ComplianceMaturity;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    regulations?: Prisma.OrganizationRegulationCreateNestedManyWithoutOrganizationInput;
    responsibles?: Prisma.OrganizationResponsibleCreateNestedManyWithoutOrganizationInput;
    services?: Prisma.ServiceCreateNestedManyWithoutOrganizationInput;
    assets?: Prisma.AssetCreateNestedManyWithoutOrganizationInput;
};
export type OrganizationUncheckedCreateWithoutCompanyInput = {
    id?: string;
    name: string;
    description: string;
    size: $Enums.OrganizationSize;
    industry: $Enums.Industry;
    businessModel: $Enums.BusinessModel;
    yearsInOperation?: $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationCreateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationCreateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity: $Enums.ComplianceMaturity;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    regulations?: Prisma.OrganizationRegulationUncheckedCreateNestedManyWithoutOrganizationInput;
    responsibles?: Prisma.OrganizationResponsibleUncheckedCreateNestedManyWithoutOrganizationInput;
    services?: Prisma.ServiceUncheckedCreateNestedManyWithoutOrganizationInput;
    assets?: Prisma.AssetUncheckedCreateNestedManyWithoutOrganizationInput;
};
export type OrganizationCreateOrConnectWithoutCompanyInput = {
    where: Prisma.OrganizationWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationCreateWithoutCompanyInput, Prisma.OrganizationUncheckedCreateWithoutCompanyInput>;
};
export type OrganizationUpsertWithoutCompanyInput = {
    update: Prisma.XOR<Prisma.OrganizationUpdateWithoutCompanyInput, Prisma.OrganizationUncheckedUpdateWithoutCompanyInput>;
    create: Prisma.XOR<Prisma.OrganizationCreateWithoutCompanyInput, Prisma.OrganizationUncheckedCreateWithoutCompanyInput>;
    where?: Prisma.OrganizationWhereInput;
};
export type OrganizationUpdateToOneWithWhereWithoutCompanyInput = {
    where?: Prisma.OrganizationWhereInput;
    data: Prisma.XOR<Prisma.OrganizationUpdateWithoutCompanyInput, Prisma.OrganizationUncheckedUpdateWithoutCompanyInput>;
};
export type OrganizationUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    size?: Prisma.EnumOrganizationSizeFieldUpdateOperationsInput | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFieldUpdateOperationsInput | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFieldUpdateOperationsInput | $Enums.BusinessModel;
    yearsInOperation?: Prisma.NullableEnumYearsInOperationFieldUpdateOperationsInput | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationUpdateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationUpdateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity?: Prisma.EnumComplianceMaturityFieldUpdateOperationsInput | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    regulations?: Prisma.OrganizationRegulationUpdateManyWithoutOrganizationNestedInput;
    responsibles?: Prisma.OrganizationResponsibleUpdateManyWithoutOrganizationNestedInput;
    services?: Prisma.ServiceUpdateManyWithoutOrganizationNestedInput;
    assets?: Prisma.AssetUpdateManyWithoutOrganizationNestedInput;
};
export type OrganizationUncheckedUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    size?: Prisma.EnumOrganizationSizeFieldUpdateOperationsInput | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFieldUpdateOperationsInput | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFieldUpdateOperationsInput | $Enums.BusinessModel;
    yearsInOperation?: Prisma.NullableEnumYearsInOperationFieldUpdateOperationsInput | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationUpdateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationUpdateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity?: Prisma.EnumComplianceMaturityFieldUpdateOperationsInput | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    regulations?: Prisma.OrganizationRegulationUncheckedUpdateManyWithoutOrganizationNestedInput;
    responsibles?: Prisma.OrganizationResponsibleUncheckedUpdateManyWithoutOrganizationNestedInput;
    services?: Prisma.ServiceUncheckedUpdateManyWithoutOrganizationNestedInput;
    assets?: Prisma.AssetUncheckedUpdateManyWithoutOrganizationNestedInput;
};
export type OrganizationCreateWithoutRegulationsInput = {
    id?: string;
    name: string;
    description: string;
    size: $Enums.OrganizationSize;
    industry: $Enums.Industry;
    businessModel: $Enums.BusinessModel;
    yearsInOperation?: $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationCreateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationCreateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity: $Enums.ComplianceMaturity;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutOrganizationInput;
    responsibles?: Prisma.OrganizationResponsibleCreateNestedManyWithoutOrganizationInput;
    services?: Prisma.ServiceCreateNestedManyWithoutOrganizationInput;
    assets?: Prisma.AssetCreateNestedManyWithoutOrganizationInput;
};
export type OrganizationUncheckedCreateWithoutRegulationsInput = {
    id?: string;
    companyId: string;
    name: string;
    description: string;
    size: $Enums.OrganizationSize;
    industry: $Enums.Industry;
    businessModel: $Enums.BusinessModel;
    yearsInOperation?: $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationCreateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationCreateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity: $Enums.ComplianceMaturity;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    responsibles?: Prisma.OrganizationResponsibleUncheckedCreateNestedManyWithoutOrganizationInput;
    services?: Prisma.ServiceUncheckedCreateNestedManyWithoutOrganizationInput;
    assets?: Prisma.AssetUncheckedCreateNestedManyWithoutOrganizationInput;
};
export type OrganizationCreateOrConnectWithoutRegulationsInput = {
    where: Prisma.OrganizationWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationCreateWithoutRegulationsInput, Prisma.OrganizationUncheckedCreateWithoutRegulationsInput>;
};
export type OrganizationUpsertWithoutRegulationsInput = {
    update: Prisma.XOR<Prisma.OrganizationUpdateWithoutRegulationsInput, Prisma.OrganizationUncheckedUpdateWithoutRegulationsInput>;
    create: Prisma.XOR<Prisma.OrganizationCreateWithoutRegulationsInput, Prisma.OrganizationUncheckedCreateWithoutRegulationsInput>;
    where?: Prisma.OrganizationWhereInput;
};
export type OrganizationUpdateToOneWithWhereWithoutRegulationsInput = {
    where?: Prisma.OrganizationWhereInput;
    data: Prisma.XOR<Prisma.OrganizationUpdateWithoutRegulationsInput, Prisma.OrganizationUncheckedUpdateWithoutRegulationsInput>;
};
export type OrganizationUpdateWithoutRegulationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    size?: Prisma.EnumOrganizationSizeFieldUpdateOperationsInput | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFieldUpdateOperationsInput | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFieldUpdateOperationsInput | $Enums.BusinessModel;
    yearsInOperation?: Prisma.NullableEnumYearsInOperationFieldUpdateOperationsInput | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationUpdateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationUpdateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity?: Prisma.EnumComplianceMaturityFieldUpdateOperationsInput | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutOrganizationNestedInput;
    responsibles?: Prisma.OrganizationResponsibleUpdateManyWithoutOrganizationNestedInput;
    services?: Prisma.ServiceUpdateManyWithoutOrganizationNestedInput;
    assets?: Prisma.AssetUpdateManyWithoutOrganizationNestedInput;
};
export type OrganizationUncheckedUpdateWithoutRegulationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    size?: Prisma.EnumOrganizationSizeFieldUpdateOperationsInput | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFieldUpdateOperationsInput | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFieldUpdateOperationsInput | $Enums.BusinessModel;
    yearsInOperation?: Prisma.NullableEnumYearsInOperationFieldUpdateOperationsInput | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationUpdateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationUpdateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity?: Prisma.EnumComplianceMaturityFieldUpdateOperationsInput | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    responsibles?: Prisma.OrganizationResponsibleUncheckedUpdateManyWithoutOrganizationNestedInput;
    services?: Prisma.ServiceUncheckedUpdateManyWithoutOrganizationNestedInput;
    assets?: Prisma.AssetUncheckedUpdateManyWithoutOrganizationNestedInput;
};
export type OrganizationCreateWithoutResponsiblesInput = {
    id?: string;
    name: string;
    description: string;
    size: $Enums.OrganizationSize;
    industry: $Enums.Industry;
    businessModel: $Enums.BusinessModel;
    yearsInOperation?: $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationCreateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationCreateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity: $Enums.ComplianceMaturity;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutOrganizationInput;
    regulations?: Prisma.OrganizationRegulationCreateNestedManyWithoutOrganizationInput;
    services?: Prisma.ServiceCreateNestedManyWithoutOrganizationInput;
    assets?: Prisma.AssetCreateNestedManyWithoutOrganizationInput;
};
export type OrganizationUncheckedCreateWithoutResponsiblesInput = {
    id?: string;
    companyId: string;
    name: string;
    description: string;
    size: $Enums.OrganizationSize;
    industry: $Enums.Industry;
    businessModel: $Enums.BusinessModel;
    yearsInOperation?: $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationCreateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationCreateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity: $Enums.ComplianceMaturity;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    regulations?: Prisma.OrganizationRegulationUncheckedCreateNestedManyWithoutOrganizationInput;
    services?: Prisma.ServiceUncheckedCreateNestedManyWithoutOrganizationInput;
    assets?: Prisma.AssetUncheckedCreateNestedManyWithoutOrganizationInput;
};
export type OrganizationCreateOrConnectWithoutResponsiblesInput = {
    where: Prisma.OrganizationWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationCreateWithoutResponsiblesInput, Prisma.OrganizationUncheckedCreateWithoutResponsiblesInput>;
};
export type OrganizationUpsertWithoutResponsiblesInput = {
    update: Prisma.XOR<Prisma.OrganizationUpdateWithoutResponsiblesInput, Prisma.OrganizationUncheckedUpdateWithoutResponsiblesInput>;
    create: Prisma.XOR<Prisma.OrganizationCreateWithoutResponsiblesInput, Prisma.OrganizationUncheckedCreateWithoutResponsiblesInput>;
    where?: Prisma.OrganizationWhereInput;
};
export type OrganizationUpdateToOneWithWhereWithoutResponsiblesInput = {
    where?: Prisma.OrganizationWhereInput;
    data: Prisma.XOR<Prisma.OrganizationUpdateWithoutResponsiblesInput, Prisma.OrganizationUncheckedUpdateWithoutResponsiblesInput>;
};
export type OrganizationUpdateWithoutResponsiblesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    size?: Prisma.EnumOrganizationSizeFieldUpdateOperationsInput | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFieldUpdateOperationsInput | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFieldUpdateOperationsInput | $Enums.BusinessModel;
    yearsInOperation?: Prisma.NullableEnumYearsInOperationFieldUpdateOperationsInput | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationUpdateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationUpdateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity?: Prisma.EnumComplianceMaturityFieldUpdateOperationsInput | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutOrganizationNestedInput;
    regulations?: Prisma.OrganizationRegulationUpdateManyWithoutOrganizationNestedInput;
    services?: Prisma.ServiceUpdateManyWithoutOrganizationNestedInput;
    assets?: Prisma.AssetUpdateManyWithoutOrganizationNestedInput;
};
export type OrganizationUncheckedUpdateWithoutResponsiblesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    size?: Prisma.EnumOrganizationSizeFieldUpdateOperationsInput | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFieldUpdateOperationsInput | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFieldUpdateOperationsInput | $Enums.BusinessModel;
    yearsInOperation?: Prisma.NullableEnumYearsInOperationFieldUpdateOperationsInput | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationUpdateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationUpdateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity?: Prisma.EnumComplianceMaturityFieldUpdateOperationsInput | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    regulations?: Prisma.OrganizationRegulationUncheckedUpdateManyWithoutOrganizationNestedInput;
    services?: Prisma.ServiceUncheckedUpdateManyWithoutOrganizationNestedInput;
    assets?: Prisma.AssetUncheckedUpdateManyWithoutOrganizationNestedInput;
};
export type OrganizationCreateWithoutServicesInput = {
    id?: string;
    name: string;
    description: string;
    size: $Enums.OrganizationSize;
    industry: $Enums.Industry;
    businessModel: $Enums.BusinessModel;
    yearsInOperation?: $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationCreateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationCreateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity: $Enums.ComplianceMaturity;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutOrganizationInput;
    regulations?: Prisma.OrganizationRegulationCreateNestedManyWithoutOrganizationInput;
    responsibles?: Prisma.OrganizationResponsibleCreateNestedManyWithoutOrganizationInput;
    assets?: Prisma.AssetCreateNestedManyWithoutOrganizationInput;
};
export type OrganizationUncheckedCreateWithoutServicesInput = {
    id?: string;
    companyId: string;
    name: string;
    description: string;
    size: $Enums.OrganizationSize;
    industry: $Enums.Industry;
    businessModel: $Enums.BusinessModel;
    yearsInOperation?: $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationCreateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationCreateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity: $Enums.ComplianceMaturity;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    regulations?: Prisma.OrganizationRegulationUncheckedCreateNestedManyWithoutOrganizationInput;
    responsibles?: Prisma.OrganizationResponsibleUncheckedCreateNestedManyWithoutOrganizationInput;
    assets?: Prisma.AssetUncheckedCreateNestedManyWithoutOrganizationInput;
};
export type OrganizationCreateOrConnectWithoutServicesInput = {
    where: Prisma.OrganizationWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationCreateWithoutServicesInput, Prisma.OrganizationUncheckedCreateWithoutServicesInput>;
};
export type OrganizationUpsertWithoutServicesInput = {
    update: Prisma.XOR<Prisma.OrganizationUpdateWithoutServicesInput, Prisma.OrganizationUncheckedUpdateWithoutServicesInput>;
    create: Prisma.XOR<Prisma.OrganizationCreateWithoutServicesInput, Prisma.OrganizationUncheckedCreateWithoutServicesInput>;
    where?: Prisma.OrganizationWhereInput;
};
export type OrganizationUpdateToOneWithWhereWithoutServicesInput = {
    where?: Prisma.OrganizationWhereInput;
    data: Prisma.XOR<Prisma.OrganizationUpdateWithoutServicesInput, Prisma.OrganizationUncheckedUpdateWithoutServicesInput>;
};
export type OrganizationUpdateWithoutServicesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    size?: Prisma.EnumOrganizationSizeFieldUpdateOperationsInput | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFieldUpdateOperationsInput | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFieldUpdateOperationsInput | $Enums.BusinessModel;
    yearsInOperation?: Prisma.NullableEnumYearsInOperationFieldUpdateOperationsInput | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationUpdateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationUpdateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity?: Prisma.EnumComplianceMaturityFieldUpdateOperationsInput | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutOrganizationNestedInput;
    regulations?: Prisma.OrganizationRegulationUpdateManyWithoutOrganizationNestedInput;
    responsibles?: Prisma.OrganizationResponsibleUpdateManyWithoutOrganizationNestedInput;
    assets?: Prisma.AssetUpdateManyWithoutOrganizationNestedInput;
};
export type OrganizationUncheckedUpdateWithoutServicesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    size?: Prisma.EnumOrganizationSizeFieldUpdateOperationsInput | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFieldUpdateOperationsInput | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFieldUpdateOperationsInput | $Enums.BusinessModel;
    yearsInOperation?: Prisma.NullableEnumYearsInOperationFieldUpdateOperationsInput | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationUpdateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationUpdateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity?: Prisma.EnumComplianceMaturityFieldUpdateOperationsInput | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    regulations?: Prisma.OrganizationRegulationUncheckedUpdateManyWithoutOrganizationNestedInput;
    responsibles?: Prisma.OrganizationResponsibleUncheckedUpdateManyWithoutOrganizationNestedInput;
    assets?: Prisma.AssetUncheckedUpdateManyWithoutOrganizationNestedInput;
};
export type OrganizationCreateWithoutAssetsInput = {
    id?: string;
    name: string;
    description: string;
    size: $Enums.OrganizationSize;
    industry: $Enums.Industry;
    businessModel: $Enums.BusinessModel;
    yearsInOperation?: $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationCreateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationCreateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity: $Enums.ComplianceMaturity;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutOrganizationInput;
    regulations?: Prisma.OrganizationRegulationCreateNestedManyWithoutOrganizationInput;
    responsibles?: Prisma.OrganizationResponsibleCreateNestedManyWithoutOrganizationInput;
    services?: Prisma.ServiceCreateNestedManyWithoutOrganizationInput;
};
export type OrganizationUncheckedCreateWithoutAssetsInput = {
    id?: string;
    companyId: string;
    name: string;
    description: string;
    size: $Enums.OrganizationSize;
    industry: $Enums.Industry;
    businessModel: $Enums.BusinessModel;
    yearsInOperation?: $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationCreateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationCreateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity: $Enums.ComplianceMaturity;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    regulations?: Prisma.OrganizationRegulationUncheckedCreateNestedManyWithoutOrganizationInput;
    responsibles?: Prisma.OrganizationResponsibleUncheckedCreateNestedManyWithoutOrganizationInput;
    services?: Prisma.ServiceUncheckedCreateNestedManyWithoutOrganizationInput;
};
export type OrganizationCreateOrConnectWithoutAssetsInput = {
    where: Prisma.OrganizationWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationCreateWithoutAssetsInput, Prisma.OrganizationUncheckedCreateWithoutAssetsInput>;
};
export type OrganizationUpsertWithoutAssetsInput = {
    update: Prisma.XOR<Prisma.OrganizationUpdateWithoutAssetsInput, Prisma.OrganizationUncheckedUpdateWithoutAssetsInput>;
    create: Prisma.XOR<Prisma.OrganizationCreateWithoutAssetsInput, Prisma.OrganizationUncheckedCreateWithoutAssetsInput>;
    where?: Prisma.OrganizationWhereInput;
};
export type OrganizationUpdateToOneWithWhereWithoutAssetsInput = {
    where?: Prisma.OrganizationWhereInput;
    data: Prisma.XOR<Prisma.OrganizationUpdateWithoutAssetsInput, Prisma.OrganizationUncheckedUpdateWithoutAssetsInput>;
};
export type OrganizationUpdateWithoutAssetsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    size?: Prisma.EnumOrganizationSizeFieldUpdateOperationsInput | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFieldUpdateOperationsInput | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFieldUpdateOperationsInput | $Enums.BusinessModel;
    yearsInOperation?: Prisma.NullableEnumYearsInOperationFieldUpdateOperationsInput | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationUpdateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationUpdateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity?: Prisma.EnumComplianceMaturityFieldUpdateOperationsInput | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutOrganizationNestedInput;
    regulations?: Prisma.OrganizationRegulationUpdateManyWithoutOrganizationNestedInput;
    responsibles?: Prisma.OrganizationResponsibleUpdateManyWithoutOrganizationNestedInput;
    services?: Prisma.ServiceUpdateManyWithoutOrganizationNestedInput;
};
export type OrganizationUncheckedUpdateWithoutAssetsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    size?: Prisma.EnumOrganizationSizeFieldUpdateOperationsInput | $Enums.OrganizationSize;
    industry?: Prisma.EnumIndustryFieldUpdateOperationsInput | $Enums.Industry;
    businessModel?: Prisma.EnumBusinessModelFieldUpdateOperationsInput | $Enums.BusinessModel;
    yearsInOperation?: Prisma.NullableEnumYearsInOperationFieldUpdateOperationsInput | $Enums.YearsInOperation | null;
    incorporationCountries?: Prisma.OrganizationUpdateincorporationCountriesInput | $Enums.IncorporationCountry[];
    clientCountries?: Prisma.OrganizationUpdateclientCountriesInput | $Enums.ClientCountry[];
    complianceMaturity?: Prisma.EnumComplianceMaturityFieldUpdateOperationsInput | $Enums.ComplianceMaturity;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    regulations?: Prisma.OrganizationRegulationUncheckedUpdateManyWithoutOrganizationNestedInput;
    responsibles?: Prisma.OrganizationResponsibleUncheckedUpdateManyWithoutOrganizationNestedInput;
    services?: Prisma.ServiceUncheckedUpdateManyWithoutOrganizationNestedInput;
};
export type OrganizationCountOutputType = {
    regulations: number;
    responsibles: number;
    services: number;
    assets: number;
};
export type OrganizationCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    regulations?: boolean | OrganizationCountOutputTypeCountRegulationsArgs;
    responsibles?: boolean | OrganizationCountOutputTypeCountResponsiblesArgs;
    services?: boolean | OrganizationCountOutputTypeCountServicesArgs;
    assets?: boolean | OrganizationCountOutputTypeCountAssetsArgs;
};
export type OrganizationCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationCountOutputTypeSelect<ExtArgs> | null;
};
export type OrganizationCountOutputTypeCountRegulationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrganizationRegulationWhereInput;
};
export type OrganizationCountOutputTypeCountResponsiblesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrganizationResponsibleWhereInput;
};
export type OrganizationCountOutputTypeCountServicesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceWhereInput;
};
export type OrganizationCountOutputTypeCountAssetsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssetWhereInput;
};
export type OrganizationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    name?: boolean;
    description?: boolean;
    size?: boolean;
    industry?: boolean;
    businessModel?: boolean;
    yearsInOperation?: boolean;
    incorporationCountries?: boolean;
    clientCountries?: boolean;
    complianceMaturity?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    regulations?: boolean | Prisma.Organization$regulationsArgs<ExtArgs>;
    responsibles?: boolean | Prisma.Organization$responsiblesArgs<ExtArgs>;
    services?: boolean | Prisma.Organization$servicesArgs<ExtArgs>;
    assets?: boolean | Prisma.Organization$assetsArgs<ExtArgs>;
    _count?: boolean | Prisma.OrganizationCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["organization"]>;
export type OrganizationSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    name?: boolean;
    description?: boolean;
    size?: boolean;
    industry?: boolean;
    businessModel?: boolean;
    yearsInOperation?: boolean;
    incorporationCountries?: boolean;
    clientCountries?: boolean;
    complianceMaturity?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["organization"]>;
export type OrganizationSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    name?: boolean;
    description?: boolean;
    size?: boolean;
    industry?: boolean;
    businessModel?: boolean;
    yearsInOperation?: boolean;
    incorporationCountries?: boolean;
    clientCountries?: boolean;
    complianceMaturity?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["organization"]>;
export type OrganizationSelectScalar = {
    id?: boolean;
    companyId?: boolean;
    name?: boolean;
    description?: boolean;
    size?: boolean;
    industry?: boolean;
    businessModel?: boolean;
    yearsInOperation?: boolean;
    incorporationCountries?: boolean;
    clientCountries?: boolean;
    complianceMaturity?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type OrganizationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "companyId" | "name" | "description" | "size" | "industry" | "businessModel" | "yearsInOperation" | "incorporationCountries" | "clientCountries" | "complianceMaturity" | "createdAt" | "updatedAt", ExtArgs["result"]["organization"]>;
export type OrganizationInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    regulations?: boolean | Prisma.Organization$regulationsArgs<ExtArgs>;
    responsibles?: boolean | Prisma.Organization$responsiblesArgs<ExtArgs>;
    services?: boolean | Prisma.Organization$servicesArgs<ExtArgs>;
    assets?: boolean | Prisma.Organization$assetsArgs<ExtArgs>;
    _count?: boolean | Prisma.OrganizationCountOutputTypeDefaultArgs<ExtArgs>;
};
export type OrganizationIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type OrganizationIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $OrganizationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Organization";
    objects: {
        company: Prisma.$CompanyPayload<ExtArgs>;
        regulations: Prisma.$OrganizationRegulationPayload<ExtArgs>[];
        responsibles: Prisma.$OrganizationResponsiblePayload<ExtArgs>[];
        services: Prisma.$ServicePayload<ExtArgs>[];
        assets: Prisma.$AssetPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        companyId: string;
        name: string;
        description: string;
        size: $Enums.OrganizationSize;
        industry: $Enums.Industry;
        businessModel: $Enums.BusinessModel;
        yearsInOperation: $Enums.YearsInOperation | null;
        incorporationCountries: $Enums.IncorporationCountry[];
        clientCountries: $Enums.ClientCountry[];
        complianceMaturity: $Enums.ComplianceMaturity;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["organization"]>;
    composites: {};
};
export type OrganizationGetPayload<S extends boolean | null | undefined | OrganizationDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$OrganizationPayload, S>;
export type OrganizationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<OrganizationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: OrganizationCountAggregateInputType | true;
};
export interface OrganizationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Organization'];
        meta: {
            name: 'Organization';
        };
    };
    findUnique<T extends OrganizationFindUniqueArgs>(args: Prisma.SelectSubset<T, OrganizationFindUniqueArgs<ExtArgs>>): Prisma.Prisma__OrganizationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends OrganizationFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, OrganizationFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__OrganizationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends OrganizationFindFirstArgs>(args?: Prisma.SelectSubset<T, OrganizationFindFirstArgs<ExtArgs>>): Prisma.Prisma__OrganizationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends OrganizationFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, OrganizationFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__OrganizationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends OrganizationFindManyArgs>(args?: Prisma.SelectSubset<T, OrganizationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends OrganizationCreateArgs>(args: Prisma.SelectSubset<T, OrganizationCreateArgs<ExtArgs>>): Prisma.Prisma__OrganizationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends OrganizationCreateManyArgs>(args?: Prisma.SelectSubset<T, OrganizationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends OrganizationCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, OrganizationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends OrganizationDeleteArgs>(args: Prisma.SelectSubset<T, OrganizationDeleteArgs<ExtArgs>>): Prisma.Prisma__OrganizationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends OrganizationUpdateArgs>(args: Prisma.SelectSubset<T, OrganizationUpdateArgs<ExtArgs>>): Prisma.Prisma__OrganizationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends OrganizationDeleteManyArgs>(args?: Prisma.SelectSubset<T, OrganizationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends OrganizationUpdateManyArgs>(args: Prisma.SelectSubset<T, OrganizationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends OrganizationUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, OrganizationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends OrganizationUpsertArgs>(args: Prisma.SelectSubset<T, OrganizationUpsertArgs<ExtArgs>>): Prisma.Prisma__OrganizationClient<runtime.Types.Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends OrganizationCountArgs>(args?: Prisma.Subset<T, OrganizationCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], OrganizationCountAggregateOutputType> : number>;
    aggregate<T extends OrganizationAggregateArgs>(args: Prisma.Subset<T, OrganizationAggregateArgs>): Prisma.PrismaPromise<GetOrganizationAggregateType<T>>;
    groupBy<T extends OrganizationGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: OrganizationGroupByArgs['orderBy'];
    } : {
        orderBy?: OrganizationGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, OrganizationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: OrganizationFieldRefs;
}
export interface Prisma__OrganizationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    company<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    regulations<T extends Prisma.Organization$regulationsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Organization$regulationsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrganizationRegulationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    responsibles<T extends Prisma.Organization$responsiblesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Organization$responsiblesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrganizationResponsiblePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    services<T extends Prisma.Organization$servicesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Organization$servicesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    assets<T extends Prisma.Organization$assetsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Organization$assetsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface OrganizationFieldRefs {
    readonly id: Prisma.FieldRef<"Organization", 'String'>;
    readonly companyId: Prisma.FieldRef<"Organization", 'String'>;
    readonly name: Prisma.FieldRef<"Organization", 'String'>;
    readonly description: Prisma.FieldRef<"Organization", 'String'>;
    readonly size: Prisma.FieldRef<"Organization", 'OrganizationSize'>;
    readonly industry: Prisma.FieldRef<"Organization", 'Industry'>;
    readonly businessModel: Prisma.FieldRef<"Organization", 'BusinessModel'>;
    readonly yearsInOperation: Prisma.FieldRef<"Organization", 'YearsInOperation'>;
    readonly incorporationCountries: Prisma.FieldRef<"Organization", 'IncorporationCountry[]'>;
    readonly clientCountries: Prisma.FieldRef<"Organization", 'ClientCountry[]'>;
    readonly complianceMaturity: Prisma.FieldRef<"Organization", 'ComplianceMaturity'>;
    readonly createdAt: Prisma.FieldRef<"Organization", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Organization", 'DateTime'>;
}
export type OrganizationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationInclude<ExtArgs> | null;
    where: Prisma.OrganizationWhereUniqueInput;
};
export type OrganizationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationInclude<ExtArgs> | null;
    where: Prisma.OrganizationWhereUniqueInput;
};
export type OrganizationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationInclude<ExtArgs> | null;
    where?: Prisma.OrganizationWhereInput;
    orderBy?: Prisma.OrganizationOrderByWithRelationInput | Prisma.OrganizationOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrganizationScalarFieldEnum | Prisma.OrganizationScalarFieldEnum[];
};
export type OrganizationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationInclude<ExtArgs> | null;
    where?: Prisma.OrganizationWhereInput;
    orderBy?: Prisma.OrganizationOrderByWithRelationInput | Prisma.OrganizationOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrganizationScalarFieldEnum | Prisma.OrganizationScalarFieldEnum[];
};
export type OrganizationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationInclude<ExtArgs> | null;
    where?: Prisma.OrganizationWhereInput;
    orderBy?: Prisma.OrganizationOrderByWithRelationInput | Prisma.OrganizationOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrganizationScalarFieldEnum | Prisma.OrganizationScalarFieldEnum[];
};
export type OrganizationCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OrganizationCreateInput, Prisma.OrganizationUncheckedCreateInput>;
};
export type OrganizationCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.OrganizationCreateManyInput | Prisma.OrganizationCreateManyInput[];
    skipDuplicates?: boolean;
};
export type OrganizationCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.OrganizationOmit<ExtArgs> | null;
    data: Prisma.OrganizationCreateManyInput | Prisma.OrganizationCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.OrganizationIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type OrganizationUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OrganizationUpdateInput, Prisma.OrganizationUncheckedUpdateInput>;
    where: Prisma.OrganizationWhereUniqueInput;
};
export type OrganizationUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.OrganizationUpdateManyMutationInput, Prisma.OrganizationUncheckedUpdateManyInput>;
    where?: Prisma.OrganizationWhereInput;
    limit?: number;
};
export type OrganizationUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.OrganizationOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OrganizationUpdateManyMutationInput, Prisma.OrganizationUncheckedUpdateManyInput>;
    where?: Prisma.OrganizationWhereInput;
    limit?: number;
    include?: Prisma.OrganizationIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type OrganizationUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationInclude<ExtArgs> | null;
    where: Prisma.OrganizationWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrganizationCreateInput, Prisma.OrganizationUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.OrganizationUpdateInput, Prisma.OrganizationUncheckedUpdateInput>;
};
export type OrganizationDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationInclude<ExtArgs> | null;
    where: Prisma.OrganizationWhereUniqueInput;
};
export type OrganizationDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrganizationWhereInput;
    limit?: number;
};
export type Organization$regulationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationRegulationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationRegulationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationRegulationInclude<ExtArgs> | null;
    where?: Prisma.OrganizationRegulationWhereInput;
    orderBy?: Prisma.OrganizationRegulationOrderByWithRelationInput | Prisma.OrganizationRegulationOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationRegulationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrganizationRegulationScalarFieldEnum | Prisma.OrganizationRegulationScalarFieldEnum[];
};
export type Organization$responsiblesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationResponsibleSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationResponsibleOmit<ExtArgs> | null;
    include?: Prisma.OrganizationResponsibleInclude<ExtArgs> | null;
    where?: Prisma.OrganizationResponsibleWhereInput;
    orderBy?: Prisma.OrganizationResponsibleOrderByWithRelationInput | Prisma.OrganizationResponsibleOrderByWithRelationInput[];
    cursor?: Prisma.OrganizationResponsibleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrganizationResponsibleScalarFieldEnum | Prisma.OrganizationResponsibleScalarFieldEnum[];
};
export type Organization$servicesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceSelect<ExtArgs> | null;
    omit?: Prisma.ServiceOmit<ExtArgs> | null;
    include?: Prisma.ServiceInclude<ExtArgs> | null;
    where?: Prisma.ServiceWhereInput;
    orderBy?: Prisma.ServiceOrderByWithRelationInput | Prisma.ServiceOrderByWithRelationInput[];
    cursor?: Prisma.ServiceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceScalarFieldEnum | Prisma.ServiceScalarFieldEnum[];
};
export type Organization$assetsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssetSelect<ExtArgs> | null;
    omit?: Prisma.AssetOmit<ExtArgs> | null;
    include?: Prisma.AssetInclude<ExtArgs> | null;
    where?: Prisma.AssetWhereInput;
    orderBy?: Prisma.AssetOrderByWithRelationInput | Prisma.AssetOrderByWithRelationInput[];
    cursor?: Prisma.AssetWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AssetScalarFieldEnum | Prisma.AssetScalarFieldEnum[];
};
export type OrganizationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrganizationSelect<ExtArgs> | null;
    omit?: Prisma.OrganizationOmit<ExtArgs> | null;
    include?: Prisma.OrganizationInclude<ExtArgs> | null;
};
export {};
