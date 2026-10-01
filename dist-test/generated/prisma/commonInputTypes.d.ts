import type * as runtime from "@prisma/client/runtime/client";
import * as $Enums from "./enums.js";
import type * as Prisma from "./internal/prismaNamespace.js";
export type UuidFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedUuidFilter<$PrismaModel> | string;
};
export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedUuidNullableFilter<$PrismaModel> | string | null;
};
export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringNullableFilter<$PrismaModel> | string | null;
};
export type StringFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringFilter<$PrismaModel> | string;
};
export type JsonNullableFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>, Required<JsonNullableFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>;
export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
};
export type EnumAuditResultFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditResult | Prisma.EnumAuditResultFieldRefInput<$PrismaModel>;
    in?: $Enums.AuditResult[] | Prisma.ListEnumAuditResultFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AuditResult[] | Prisma.ListEnumAuditResultFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAuditResultFilter<$PrismaModel> | $Enums.AuditResult;
};
export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeFilter<$PrismaModel> | Date | string;
};
export type SortOrderInput = {
    sort: Prisma.SortOrder;
    nulls?: Prisma.NullsOrder;
};
export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedUuidWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>, Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>;
export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedJsonNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedJsonNullableFilter<$PrismaModel>;
};
export type EnumAuditResultWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditResult | Prisma.EnumAuditResultFieldRefInput<$PrismaModel>;
    in?: $Enums.AuditResult[] | Prisma.ListEnumAuditResultFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AuditResult[] | Prisma.ListEnumAuditResultFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAuditResultWithAggregatesFilter<$PrismaModel> | $Enums.AuditResult;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAuditResultFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAuditResultFilter<$PrismaModel>;
};
export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeFilter<$PrismaModel>;
};
export type JsonFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>, Required<JsonFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>;
export type JsonFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
};
export type JsonWithAggregatesFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>, Required<JsonWithAggregatesFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>;
export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedJsonFilter<$PrismaModel>;
    _max?: Prisma.NestedJsonFilter<$PrismaModel>;
};
export type EnumDimensionFilter<$PrismaModel = never> = {
    equals?: $Enums.Dimension | Prisma.EnumDimensionFieldRefInput<$PrismaModel>;
    in?: $Enums.Dimension[] | Prisma.ListEnumDimensionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Dimension[] | Prisma.ListEnumDimensionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumDimensionFilter<$PrismaModel> | $Enums.Dimension;
};
export type EnumControlDimensionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ControlDimensionType | Prisma.EnumControlDimensionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.ControlDimensionType[] | Prisma.ListEnumControlDimensionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ControlDimensionType[] | Prisma.ListEnumControlDimensionTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumControlDimensionTypeFilter<$PrismaModel> | $Enums.ControlDimensionType;
};
export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolFilter<$PrismaModel> | boolean;
};
export type EnumDimensionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Dimension | Prisma.EnumDimensionFieldRefInput<$PrismaModel>;
    in?: $Enums.Dimension[] | Prisma.ListEnumDimensionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Dimension[] | Prisma.ListEnumDimensionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumDimensionWithAggregatesFilter<$PrismaModel> | $Enums.Dimension;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumDimensionFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumDimensionFilter<$PrismaModel>;
};
export type EnumControlDimensionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ControlDimensionType | Prisma.EnumControlDimensionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.ControlDimensionType[] | Prisma.ListEnumControlDimensionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ControlDimensionType[] | Prisma.ListEnumControlDimensionTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumControlDimensionTypeWithAggregatesFilter<$PrismaModel> | $Enums.ControlDimensionType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumControlDimensionTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumControlDimensionTypeFilter<$PrismaModel>;
};
export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedBoolFilter<$PrismaModel>;
    _max?: Prisma.NestedBoolFilter<$PrismaModel>;
};
export type DecimalFilter<$PrismaModel = never> = {
    equals?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    in?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel>;
    notIn?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel>;
    lt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    lte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDecimalFilter<$PrismaModel> | runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    in?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel>;
    notIn?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel>;
    lt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    lte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDecimalWithAggregatesFilter<$PrismaModel> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedDecimalFilter<$PrismaModel>;
    _sum?: Prisma.NestedDecimalFilter<$PrismaModel>;
    _min?: Prisma.NestedDecimalFilter<$PrismaModel>;
    _max?: Prisma.NestedDecimalFilter<$PrismaModel>;
};
export type EnumPolicyApprovalStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PolicyApprovalStatus | Prisma.EnumPolicyApprovalStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.PolicyApprovalStatus[] | Prisma.ListEnumPolicyApprovalStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PolicyApprovalStatus[] | Prisma.ListEnumPolicyApprovalStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPolicyApprovalStatusFilter<$PrismaModel> | $Enums.PolicyApprovalStatus;
};
export type EnumPolicyApprovalStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PolicyApprovalStatus | Prisma.EnumPolicyApprovalStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.PolicyApprovalStatus[] | Prisma.ListEnumPolicyApprovalStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PolicyApprovalStatus[] | Prisma.ListEnumPolicyApprovalStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPolicyApprovalStatusWithAggregatesFilter<$PrismaModel> | $Enums.PolicyApprovalStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPolicyApprovalStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPolicyApprovalStatusFilter<$PrismaModel>;
};
export type IntFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntFilter<$PrismaModel> | number;
};
export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedIntFilter<$PrismaModel>;
    _max?: Prisma.NestedIntFilter<$PrismaModel>;
};
export type EnumFrameworkTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.FrameworkType | Prisma.EnumFrameworkTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.FrameworkType[] | Prisma.ListEnumFrameworkTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FrameworkType[] | Prisma.ListEnumFrameworkTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFrameworkTypeFilter<$PrismaModel> | $Enums.FrameworkType;
};
export type EnumFrameworkTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FrameworkType | Prisma.EnumFrameworkTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.FrameworkType[] | Prisma.ListEnumFrameworkTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FrameworkType[] | Prisma.ListEnumFrameworkTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFrameworkTypeWithAggregatesFilter<$PrismaModel> | $Enums.FrameworkType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumFrameworkTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumFrameworkTypeFilter<$PrismaModel>;
};
export type EnumTrustCriterionCodeFilter<$PrismaModel = never> = {
    equals?: $Enums.TrustCriterionCode | Prisma.EnumTrustCriterionCodeFieldRefInput<$PrismaModel>;
    in?: $Enums.TrustCriterionCode[] | Prisma.ListEnumTrustCriterionCodeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TrustCriterionCode[] | Prisma.ListEnumTrustCriterionCodeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTrustCriterionCodeFilter<$PrismaModel> | $Enums.TrustCriterionCode;
};
export type EnumTrustCriterionCodeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TrustCriterionCode | Prisma.EnumTrustCriterionCodeFieldRefInput<$PrismaModel>;
    in?: $Enums.TrustCriterionCode[] | Prisma.ListEnumTrustCriterionCodeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TrustCriterionCode[] | Prisma.ListEnumTrustCriterionCodeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTrustCriterionCodeWithAggregatesFilter<$PrismaModel> | $Enums.TrustCriterionCode;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTrustCriterionCodeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTrustCriterionCodeFilter<$PrismaModel>;
};
export type EnumRiskCriterionFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskCriterion | Prisma.EnumRiskCriterionFieldRefInput<$PrismaModel>;
    in?: $Enums.RiskCriterion[] | Prisma.ListEnumRiskCriterionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RiskCriterion[] | Prisma.ListEnumRiskCriterionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRiskCriterionFilter<$PrismaModel> | $Enums.RiskCriterion;
};
export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableFilter<$PrismaModel> | number | null;
};
export type EnumRiskLevelNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | Prisma.EnumRiskLevelFieldRefInput<$PrismaModel> | null;
    in?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumRiskLevelNullableFilter<$PrismaModel> | $Enums.RiskLevel | null;
};
export type EnumRiskCriterionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskCriterion | Prisma.EnumRiskCriterionFieldRefInput<$PrismaModel>;
    in?: $Enums.RiskCriterion[] | Prisma.ListEnumRiskCriterionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RiskCriterion[] | Prisma.ListEnumRiskCriterionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRiskCriterionWithAggregatesFilter<$PrismaModel> | $Enums.RiskCriterion;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRiskCriterionFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRiskCriterionFilter<$PrismaModel>;
};
export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedIntNullableFilter<$PrismaModel>;
};
export type EnumRiskLevelNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | Prisma.EnumRiskLevelFieldRefInput<$PrismaModel> | null;
    in?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumRiskLevelNullableWithAggregatesFilter<$PrismaModel> | $Enums.RiskLevel | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRiskLevelNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRiskLevelNullableFilter<$PrismaModel>;
};
export type EnumFailureCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.FailureCategory | Prisma.EnumFailureCategoryFieldRefInput<$PrismaModel>;
    in?: $Enums.FailureCategory[] | Prisma.ListEnumFailureCategoryFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FailureCategory[] | Prisma.ListEnumFailureCategoryFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFailureCategoryFilter<$PrismaModel> | $Enums.FailureCategory;
};
export type EnumFailureCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FailureCategory | Prisma.EnumFailureCategoryFieldRefInput<$PrismaModel>;
    in?: $Enums.FailureCategory[] | Prisma.ListEnumFailureCategoryFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FailureCategory[] | Prisma.ListEnumFailureCategoryFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFailureCategoryWithAggregatesFilter<$PrismaModel> | $Enums.FailureCategory;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumFailureCategoryFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumFailureCategoryFilter<$PrismaModel>;
};
export type EnumTestPlanOriginFilter<$PrismaModel = never> = {
    equals?: $Enums.TestPlanOrigin | Prisma.EnumTestPlanOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.TestPlanOrigin[] | Prisma.ListEnumTestPlanOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TestPlanOrigin[] | Prisma.ListEnumTestPlanOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTestPlanOriginFilter<$PrismaModel> | $Enums.TestPlanOrigin;
};
export type EnumTestPlanOriginWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TestPlanOrigin | Prisma.EnumTestPlanOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.TestPlanOrigin[] | Prisma.ListEnumTestPlanOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TestPlanOrigin[] | Prisma.ListEnumTestPlanOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTestPlanOriginWithAggregatesFilter<$PrismaModel> | $Enums.TestPlanOrigin;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTestPlanOriginFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTestPlanOriginFilter<$PrismaModel>;
};
export type EnumCheckOriginFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckOrigin | Prisma.EnumCheckOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.CheckOrigin[] | Prisma.ListEnumCheckOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CheckOrigin[] | Prisma.ListEnumCheckOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCheckOriginFilter<$PrismaModel> | $Enums.CheckOrigin;
};
export type EnumMappingConfidenceFilter<$PrismaModel = never> = {
    equals?: $Enums.MappingConfidence | Prisma.EnumMappingConfidenceFieldRefInput<$PrismaModel>;
    in?: $Enums.MappingConfidence[] | Prisma.ListEnumMappingConfidenceFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MappingConfidence[] | Prisma.ListEnumMappingConfidenceFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMappingConfidenceFilter<$PrismaModel> | $Enums.MappingConfidence;
};
export type EnumCheckOriginWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckOrigin | Prisma.EnumCheckOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.CheckOrigin[] | Prisma.ListEnumCheckOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CheckOrigin[] | Prisma.ListEnumCheckOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCheckOriginWithAggregatesFilter<$PrismaModel> | $Enums.CheckOrigin;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumCheckOriginFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumCheckOriginFilter<$PrismaModel>;
};
export type EnumMappingConfidenceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MappingConfidence | Prisma.EnumMappingConfidenceFieldRefInput<$PrismaModel>;
    in?: $Enums.MappingConfidence[] | Prisma.ListEnumMappingConfidenceFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MappingConfidence[] | Prisma.ListEnumMappingConfidenceFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMappingConfidenceWithAggregatesFilter<$PrismaModel> | $Enums.MappingConfidence;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumMappingConfidenceFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumMappingConfidenceFilter<$PrismaModel>;
};
export type EnumIsolationStrategyFilter<$PrismaModel = never> = {
    equals?: $Enums.IsolationStrategy | Prisma.EnumIsolationStrategyFieldRefInput<$PrismaModel>;
    in?: $Enums.IsolationStrategy[] | Prisma.ListEnumIsolationStrategyFieldRefInput<$PrismaModel>;
    notIn?: $Enums.IsolationStrategy[] | Prisma.ListEnumIsolationStrategyFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumIsolationStrategyFilter<$PrismaModel> | $Enums.IsolationStrategy;
};
export type EnumCompanyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CompanyStatus | Prisma.EnumCompanyStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.CompanyStatus[] | Prisma.ListEnumCompanyStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CompanyStatus[] | Prisma.ListEnumCompanyStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCompanyStatusFilter<$PrismaModel> | $Enums.CompanyStatus;
};
export type EnumIsolationStrategyWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.IsolationStrategy | Prisma.EnumIsolationStrategyFieldRefInput<$PrismaModel>;
    in?: $Enums.IsolationStrategy[] | Prisma.ListEnumIsolationStrategyFieldRefInput<$PrismaModel>;
    notIn?: $Enums.IsolationStrategy[] | Prisma.ListEnumIsolationStrategyFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumIsolationStrategyWithAggregatesFilter<$PrismaModel> | $Enums.IsolationStrategy;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumIsolationStrategyFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumIsolationStrategyFilter<$PrismaModel>;
};
export type EnumCompanyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CompanyStatus | Prisma.EnumCompanyStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.CompanyStatus[] | Prisma.ListEnumCompanyStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CompanyStatus[] | Prisma.ListEnumCompanyStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCompanyStatusWithAggregatesFilter<$PrismaModel> | $Enums.CompanyStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumCompanyStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumCompanyStatusFilter<$PrismaModel>;
};
export type EnumAccessKeyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AccessKeyStatus | Prisma.EnumAccessKeyStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AccessKeyStatus[] | Prisma.ListEnumAccessKeyStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AccessKeyStatus[] | Prisma.ListEnumAccessKeyStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAccessKeyStatusFilter<$PrismaModel> | $Enums.AccessKeyStatus;
};
export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
};
export type EnumAccessKeyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AccessKeyStatus | Prisma.EnumAccessKeyStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AccessKeyStatus[] | Prisma.ListEnumAccessKeyStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AccessKeyStatus[] | Prisma.ListEnumAccessKeyStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAccessKeyStatusWithAggregatesFilter<$PrismaModel> | $Enums.AccessKeyStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAccessKeyStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAccessKeyStatusFilter<$PrismaModel>;
};
export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
};
export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | Prisma.EnumUserRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.UserRole[] | Prisma.ListEnumUserRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserRole[] | Prisma.ListEnumUserRoleFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole;
};
export type EnumUserStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | Prisma.EnumUserStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.UserStatus[] | Prisma.ListEnumUserStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserStatus[] | Prisma.ListEnumUserStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumUserStatusFilter<$PrismaModel> | $Enums.UserStatus;
};
export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | Prisma.EnumUserRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.UserRole[] | Prisma.ListEnumUserRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserRole[] | Prisma.ListEnumUserRoleFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumUserRoleFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumUserRoleFilter<$PrismaModel>;
};
export type EnumUserStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | Prisma.EnumUserStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.UserStatus[] | Prisma.ListEnumUserStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserStatus[] | Prisma.ListEnumUserStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumUserStatusWithAggregatesFilter<$PrismaModel> | $Enums.UserStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumUserStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumUserStatusFilter<$PrismaModel>;
};
export type EnumApiKeyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ApiKeyStatus | Prisma.EnumApiKeyStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ApiKeyStatus[] | Prisma.ListEnumApiKeyStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ApiKeyStatus[] | Prisma.ListEnumApiKeyStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumApiKeyStatusFilter<$PrismaModel> | $Enums.ApiKeyStatus;
};
export type EnumApiKeyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ApiKeyStatus | Prisma.EnumApiKeyStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ApiKeyStatus[] | Prisma.ListEnumApiKeyStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ApiKeyStatus[] | Prisma.ListEnumApiKeyStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumApiKeyStatusWithAggregatesFilter<$PrismaModel> | $Enums.ApiKeyStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumApiKeyStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumApiKeyStatusFilter<$PrismaModel>;
};
export type EnumActionPlanStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ActionPlanStatus | Prisma.EnumActionPlanStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ActionPlanStatus[] | Prisma.ListEnumActionPlanStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ActionPlanStatus[] | Prisma.ListEnumActionPlanStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumActionPlanStatusFilter<$PrismaModel> | $Enums.ActionPlanStatus;
};
export type EnumActionPlanStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActionPlanStatus | Prisma.EnumActionPlanStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ActionPlanStatus[] | Prisma.ListEnumActionPlanStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ActionPlanStatus[] | Prisma.ListEnumActionPlanStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumActionPlanStatusWithAggregatesFilter<$PrismaModel> | $Enums.ActionPlanStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumActionPlanStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumActionPlanStatusFilter<$PrismaModel>;
};
export type EnumRiskLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | Prisma.EnumRiskLevelFieldRefInput<$PrismaModel>;
    in?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRiskLevelFilter<$PrismaModel> | $Enums.RiskLevel;
};
export type EnumRiskLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | Prisma.EnumRiskLevelFieldRefInput<$PrismaModel>;
    in?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRiskLevelWithAggregatesFilter<$PrismaModel> | $Enums.RiskLevel;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRiskLevelFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRiskLevelFilter<$PrismaModel>;
};
export type EnumRiskTreatmentDecisionFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskTreatmentDecision | Prisma.EnumRiskTreatmentDecisionFieldRefInput<$PrismaModel>;
    in?: $Enums.RiskTreatmentDecision[] | Prisma.ListEnumRiskTreatmentDecisionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RiskTreatmentDecision[] | Prisma.ListEnumRiskTreatmentDecisionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRiskTreatmentDecisionFilter<$PrismaModel> | $Enums.RiskTreatmentDecision;
};
export type EnumRiskTreatmentDecisionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskTreatmentDecision | Prisma.EnumRiskTreatmentDecisionFieldRefInput<$PrismaModel>;
    in?: $Enums.RiskTreatmentDecision[] | Prisma.ListEnumRiskTreatmentDecisionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RiskTreatmentDecision[] | Prisma.ListEnumRiskTreatmentDecisionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRiskTreatmentDecisionWithAggregatesFilter<$PrismaModel> | $Enums.RiskTreatmentDecision;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRiskTreatmentDecisionFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRiskTreatmentDecisionFilter<$PrismaModel>;
};
export type EnumEvidenceValidationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.EvidenceValidationStatus | Prisma.EnumEvidenceValidationStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.EvidenceValidationStatus[] | Prisma.ListEnumEvidenceValidationStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EvidenceValidationStatus[] | Prisma.ListEnumEvidenceValidationStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEvidenceValidationStatusFilter<$PrismaModel> | $Enums.EvidenceValidationStatus;
};
export type EnumEvidenceValidationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EvidenceValidationStatus | Prisma.EnumEvidenceValidationStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.EvidenceValidationStatus[] | Prisma.ListEnumEvidenceValidationStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EvidenceValidationStatus[] | Prisma.ListEnumEvidenceValidationStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEvidenceValidationStatusWithAggregatesFilter<$PrismaModel> | $Enums.EvidenceValidationStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEvidenceValidationStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEvidenceValidationStatusFilter<$PrismaModel>;
};
export type EnumEvaluationResultFilter<$PrismaModel = never> = {
    equals?: $Enums.EvaluationResult | Prisma.EnumEvaluationResultFieldRefInput<$PrismaModel>;
    in?: $Enums.EvaluationResult[] | Prisma.ListEnumEvaluationResultFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EvaluationResult[] | Prisma.ListEnumEvaluationResultFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEvaluationResultFilter<$PrismaModel> | $Enums.EvaluationResult;
};
export type EnumRawProbeResultNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.RawProbeResult | Prisma.EnumRawProbeResultFieldRefInput<$PrismaModel> | null;
    in?: $Enums.RawProbeResult[] | Prisma.ListEnumRawProbeResultFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.RawProbeResult[] | Prisma.ListEnumRawProbeResultFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumRawProbeResultNullableFilter<$PrismaModel> | $Enums.RawProbeResult | null;
};
export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel> | null;
    in?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    notIn?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    lt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    lte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDecimalNullableFilter<$PrismaModel> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
};
export type EnumEvaluationOriginFilter<$PrismaModel = never> = {
    equals?: $Enums.EvaluationOrigin | Prisma.EnumEvaluationOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.EvaluationOrigin[] | Prisma.ListEnumEvaluationOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EvaluationOrigin[] | Prisma.ListEnumEvaluationOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEvaluationOriginFilter<$PrismaModel> | $Enums.EvaluationOrigin;
};
export type EnumEvaluationResultWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EvaluationResult | Prisma.EnumEvaluationResultFieldRefInput<$PrismaModel>;
    in?: $Enums.EvaluationResult[] | Prisma.ListEnumEvaluationResultFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EvaluationResult[] | Prisma.ListEnumEvaluationResultFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEvaluationResultWithAggregatesFilter<$PrismaModel> | $Enums.EvaluationResult;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEvaluationResultFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEvaluationResultFilter<$PrismaModel>;
};
export type EnumRawProbeResultNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RawProbeResult | Prisma.EnumRawProbeResultFieldRefInput<$PrismaModel> | null;
    in?: $Enums.RawProbeResult[] | Prisma.ListEnumRawProbeResultFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.RawProbeResult[] | Prisma.ListEnumRawProbeResultFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumRawProbeResultNullableWithAggregatesFilter<$PrismaModel> | $Enums.RawProbeResult | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRawProbeResultNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRawProbeResultNullableFilter<$PrismaModel>;
};
export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel> | null;
    in?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    notIn?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    lt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    lte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
};
export type EnumEvaluationOriginWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EvaluationOrigin | Prisma.EnumEvaluationOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.EvaluationOrigin[] | Prisma.ListEnumEvaluationOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EvaluationOrigin[] | Prisma.ListEnumEvaluationOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEvaluationOriginWithAggregatesFilter<$PrismaModel> | $Enums.EvaluationOrigin;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEvaluationOriginFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEvaluationOriginFilter<$PrismaModel>;
};
export type EnumSeverityFilter<$PrismaModel = never> = {
    equals?: $Enums.Severity | Prisma.EnumSeverityFieldRefInput<$PrismaModel>;
    in?: $Enums.Severity[] | Prisma.ListEnumSeverityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Severity[] | Prisma.ListEnumSeverityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSeverityFilter<$PrismaModel> | $Enums.Severity;
};
export type EnumFindingStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.FindingStatus | Prisma.EnumFindingStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.FindingStatus[] | Prisma.ListEnumFindingStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FindingStatus[] | Prisma.ListEnumFindingStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFindingStatusFilter<$PrismaModel> | $Enums.FindingStatus;
};
export type EnumFindingOriginFilter<$PrismaModel = never> = {
    equals?: $Enums.FindingOrigin | Prisma.EnumFindingOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.FindingOrigin[] | Prisma.ListEnumFindingOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FindingOrigin[] | Prisma.ListEnumFindingOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFindingOriginFilter<$PrismaModel> | $Enums.FindingOrigin;
};
export type EnumSeverityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Severity | Prisma.EnumSeverityFieldRefInput<$PrismaModel>;
    in?: $Enums.Severity[] | Prisma.ListEnumSeverityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Severity[] | Prisma.ListEnumSeverityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSeverityWithAggregatesFilter<$PrismaModel> | $Enums.Severity;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumSeverityFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumSeverityFilter<$PrismaModel>;
};
export type EnumFindingStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FindingStatus | Prisma.EnumFindingStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.FindingStatus[] | Prisma.ListEnumFindingStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FindingStatus[] | Prisma.ListEnumFindingStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFindingStatusWithAggregatesFilter<$PrismaModel> | $Enums.FindingStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumFindingStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumFindingStatusFilter<$PrismaModel>;
};
export type EnumFindingOriginWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FindingOrigin | Prisma.EnumFindingOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.FindingOrigin[] | Prisma.ListEnumFindingOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FindingOrigin[] | Prisma.ListEnumFindingOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFindingOriginWithAggregatesFilter<$PrismaModel> | $Enums.FindingOrigin;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumFindingOriginFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumFindingOriginFilter<$PrismaModel>;
};
export type EnumVulnerabilityStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.VulnerabilityStatus | Prisma.EnumVulnerabilityStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.VulnerabilityStatus[] | Prisma.ListEnumVulnerabilityStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.VulnerabilityStatus[] | Prisma.ListEnumVulnerabilityStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumVulnerabilityStatusFilter<$PrismaModel> | $Enums.VulnerabilityStatus;
};
export type EnumVulnerabilityStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VulnerabilityStatus | Prisma.EnumVulnerabilityStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.VulnerabilityStatus[] | Prisma.ListEnumVulnerabilityStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.VulnerabilityStatus[] | Prisma.ListEnumVulnerabilityStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumVulnerabilityStatusWithAggregatesFilter<$PrismaModel> | $Enums.VulnerabilityStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumVulnerabilityStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumVulnerabilityStatusFilter<$PrismaModel>;
};
export type EnumOrganizationSizeFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationSize | Prisma.EnumOrganizationSizeFieldRefInput<$PrismaModel>;
    in?: $Enums.OrganizationSize[] | Prisma.ListEnumOrganizationSizeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrganizationSize[] | Prisma.ListEnumOrganizationSizeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrganizationSizeFilter<$PrismaModel> | $Enums.OrganizationSize;
};
export type EnumIndustryFilter<$PrismaModel = never> = {
    equals?: $Enums.Industry | Prisma.EnumIndustryFieldRefInput<$PrismaModel>;
    in?: $Enums.Industry[] | Prisma.ListEnumIndustryFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Industry[] | Prisma.ListEnumIndustryFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumIndustryFilter<$PrismaModel> | $Enums.Industry;
};
export type EnumBusinessModelFilter<$PrismaModel = never> = {
    equals?: $Enums.BusinessModel | Prisma.EnumBusinessModelFieldRefInput<$PrismaModel>;
    in?: $Enums.BusinessModel[] | Prisma.ListEnumBusinessModelFieldRefInput<$PrismaModel>;
    notIn?: $Enums.BusinessModel[] | Prisma.ListEnumBusinessModelFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumBusinessModelFilter<$PrismaModel> | $Enums.BusinessModel;
};
export type EnumYearsInOperationNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.YearsInOperation | Prisma.EnumYearsInOperationFieldRefInput<$PrismaModel> | null;
    in?: $Enums.YearsInOperation[] | Prisma.ListEnumYearsInOperationFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.YearsInOperation[] | Prisma.ListEnumYearsInOperationFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumYearsInOperationNullableFilter<$PrismaModel> | $Enums.YearsInOperation | null;
};
export type EnumComplianceMaturityFilter<$PrismaModel = never> = {
    equals?: $Enums.ComplianceMaturity | Prisma.EnumComplianceMaturityFieldRefInput<$PrismaModel>;
    in?: $Enums.ComplianceMaturity[] | Prisma.ListEnumComplianceMaturityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ComplianceMaturity[] | Prisma.ListEnumComplianceMaturityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumComplianceMaturityFilter<$PrismaModel> | $Enums.ComplianceMaturity;
};
export type EnumOrganizationSizeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationSize | Prisma.EnumOrganizationSizeFieldRefInput<$PrismaModel>;
    in?: $Enums.OrganizationSize[] | Prisma.ListEnumOrganizationSizeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrganizationSize[] | Prisma.ListEnumOrganizationSizeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrganizationSizeWithAggregatesFilter<$PrismaModel> | $Enums.OrganizationSize;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumOrganizationSizeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumOrganizationSizeFilter<$PrismaModel>;
};
export type EnumIndustryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Industry | Prisma.EnumIndustryFieldRefInput<$PrismaModel>;
    in?: $Enums.Industry[] | Prisma.ListEnumIndustryFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Industry[] | Prisma.ListEnumIndustryFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumIndustryWithAggregatesFilter<$PrismaModel> | $Enums.Industry;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumIndustryFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumIndustryFilter<$PrismaModel>;
};
export type EnumBusinessModelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BusinessModel | Prisma.EnumBusinessModelFieldRefInput<$PrismaModel>;
    in?: $Enums.BusinessModel[] | Prisma.ListEnumBusinessModelFieldRefInput<$PrismaModel>;
    notIn?: $Enums.BusinessModel[] | Prisma.ListEnumBusinessModelFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumBusinessModelWithAggregatesFilter<$PrismaModel> | $Enums.BusinessModel;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumBusinessModelFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumBusinessModelFilter<$PrismaModel>;
};
export type EnumYearsInOperationNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.YearsInOperation | Prisma.EnumYearsInOperationFieldRefInput<$PrismaModel> | null;
    in?: $Enums.YearsInOperation[] | Prisma.ListEnumYearsInOperationFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.YearsInOperation[] | Prisma.ListEnumYearsInOperationFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumYearsInOperationNullableWithAggregatesFilter<$PrismaModel> | $Enums.YearsInOperation | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumYearsInOperationNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumYearsInOperationNullableFilter<$PrismaModel>;
};
export type EnumComplianceMaturityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ComplianceMaturity | Prisma.EnumComplianceMaturityFieldRefInput<$PrismaModel>;
    in?: $Enums.ComplianceMaturity[] | Prisma.ListEnumComplianceMaturityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ComplianceMaturity[] | Prisma.ListEnumComplianceMaturityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumComplianceMaturityWithAggregatesFilter<$PrismaModel> | $Enums.ComplianceMaturity;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumComplianceMaturityFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumComplianceMaturityFilter<$PrismaModel>;
};
export type EnumOrganizationResponsibleTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationResponsibleType | Prisma.EnumOrganizationResponsibleTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.OrganizationResponsibleType[] | Prisma.ListEnumOrganizationResponsibleTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrganizationResponsibleType[] | Prisma.ListEnumOrganizationResponsibleTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrganizationResponsibleTypeFilter<$PrismaModel> | $Enums.OrganizationResponsibleType;
};
export type EnumOrganizationResponsibleTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationResponsibleType | Prisma.EnumOrganizationResponsibleTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.OrganizationResponsibleType[] | Prisma.ListEnumOrganizationResponsibleTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrganizationResponsibleType[] | Prisma.ListEnumOrganizationResponsibleTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrganizationResponsibleTypeWithAggregatesFilter<$PrismaModel> | $Enums.OrganizationResponsibleType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumOrganizationResponsibleTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumOrganizationResponsibleTypeFilter<$PrismaModel>;
};
export type EnumServiceTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceType | Prisma.EnumServiceTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.ServiceType[] | Prisma.ListEnumServiceTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ServiceType[] | Prisma.ListEnumServiceTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumServiceTypeFilter<$PrismaModel> | $Enums.ServiceType;
};
export type EnumActiveClientCountNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ActiveClientCount | Prisma.EnumActiveClientCountFieldRefInput<$PrismaModel> | null;
    in?: $Enums.ActiveClientCount[] | Prisma.ListEnumActiveClientCountFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.ActiveClientCount[] | Prisma.ListEnumActiveClientCountFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumActiveClientCountNullableFilter<$PrismaModel> | $Enums.ActiveClientCount | null;
};
export type EnumExpectedAvailabilityFilter<$PrismaModel = never> = {
    equals?: $Enums.ExpectedAvailability | Prisma.EnumExpectedAvailabilityFieldRefInput<$PrismaModel>;
    in?: $Enums.ExpectedAvailability[] | Prisma.ListEnumExpectedAvailabilityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExpectedAvailability[] | Prisma.ListEnumExpectedAvailabilityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExpectedAvailabilityFilter<$PrismaModel> | $Enums.ExpectedAvailability;
};
export type EnumDeploymentScenarioNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.DeploymentScenario | Prisma.EnumDeploymentScenarioFieldRefInput<$PrismaModel> | null;
    in?: $Enums.DeploymentScenario[] | Prisma.ListEnumDeploymentScenarioFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.DeploymentScenario[] | Prisma.ListEnumDeploymentScenarioFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumDeploymentScenarioNullableFilter<$PrismaModel> | $Enums.DeploymentScenario | null;
};
export type EnumPreviousCertificationNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.PreviousCertification | Prisma.EnumPreviousCertificationFieldRefInput<$PrismaModel> | null;
    in?: $Enums.PreviousCertification[] | Prisma.ListEnumPreviousCertificationFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.PreviousCertification[] | Prisma.ListEnumPreviousCertificationFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumPreviousCertificationNullableFilter<$PrismaModel> | $Enums.PreviousCertification | null;
};
export type EnumServiceTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceType | Prisma.EnumServiceTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.ServiceType[] | Prisma.ListEnumServiceTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ServiceType[] | Prisma.ListEnumServiceTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumServiceTypeWithAggregatesFilter<$PrismaModel> | $Enums.ServiceType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumServiceTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumServiceTypeFilter<$PrismaModel>;
};
export type EnumActiveClientCountNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActiveClientCount | Prisma.EnumActiveClientCountFieldRefInput<$PrismaModel> | null;
    in?: $Enums.ActiveClientCount[] | Prisma.ListEnumActiveClientCountFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.ActiveClientCount[] | Prisma.ListEnumActiveClientCountFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumActiveClientCountNullableWithAggregatesFilter<$PrismaModel> | $Enums.ActiveClientCount | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumActiveClientCountNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumActiveClientCountNullableFilter<$PrismaModel>;
};
export type EnumExpectedAvailabilityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ExpectedAvailability | Prisma.EnumExpectedAvailabilityFieldRefInput<$PrismaModel>;
    in?: $Enums.ExpectedAvailability[] | Prisma.ListEnumExpectedAvailabilityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExpectedAvailability[] | Prisma.ListEnumExpectedAvailabilityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExpectedAvailabilityWithAggregatesFilter<$PrismaModel> | $Enums.ExpectedAvailability;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumExpectedAvailabilityFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumExpectedAvailabilityFilter<$PrismaModel>;
};
export type EnumDeploymentScenarioNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DeploymentScenario | Prisma.EnumDeploymentScenarioFieldRefInput<$PrismaModel> | null;
    in?: $Enums.DeploymentScenario[] | Prisma.ListEnumDeploymentScenarioFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.DeploymentScenario[] | Prisma.ListEnumDeploymentScenarioFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumDeploymentScenarioNullableWithAggregatesFilter<$PrismaModel> | $Enums.DeploymentScenario | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumDeploymentScenarioNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumDeploymentScenarioNullableFilter<$PrismaModel>;
};
export type EnumPreviousCertificationNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PreviousCertification | Prisma.EnumPreviousCertificationFieldRefInput<$PrismaModel> | null;
    in?: $Enums.PreviousCertification[] | Prisma.ListEnumPreviousCertificationFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.PreviousCertification[] | Prisma.ListEnumPreviousCertificationFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumPreviousCertificationNullableWithAggregatesFilter<$PrismaModel> | $Enums.PreviousCertification | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPreviousCertificationNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPreviousCertificationNullableFilter<$PrismaModel>;
};
export type EnumServiceFrameworkStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceFrameworkStatus | Prisma.EnumServiceFrameworkStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ServiceFrameworkStatus[] | Prisma.ListEnumServiceFrameworkStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ServiceFrameworkStatus[] | Prisma.ListEnumServiceFrameworkStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumServiceFrameworkStatusFilter<$PrismaModel> | $Enums.ServiceFrameworkStatus;
};
export type EnumServiceFrameworkStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceFrameworkStatus | Prisma.EnumServiceFrameworkStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ServiceFrameworkStatus[] | Prisma.ListEnumServiceFrameworkStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ServiceFrameworkStatus[] | Prisma.ListEnumServiceFrameworkStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumServiceFrameworkStatusWithAggregatesFilter<$PrismaModel> | $Enums.ServiceFrameworkStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumServiceFrameworkStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumServiceFrameworkStatusFilter<$PrismaModel>;
};
export type EnumSubserviceProviderTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SubserviceProviderType | Prisma.EnumSubserviceProviderTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.SubserviceProviderType[] | Prisma.ListEnumSubserviceProviderTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SubserviceProviderType[] | Prisma.ListEnumSubserviceProviderTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSubserviceProviderTypeFilter<$PrismaModel> | $Enums.SubserviceProviderType;
};
export type EnumSubserviceProviderTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SubserviceProviderType | Prisma.EnumSubserviceProviderTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.SubserviceProviderType[] | Prisma.ListEnumSubserviceProviderTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SubserviceProviderType[] | Prisma.ListEnumSubserviceProviderTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSubserviceProviderTypeWithAggregatesFilter<$PrismaModel> | $Enums.SubserviceProviderType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumSubserviceProviderTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumSubserviceProviderTypeFilter<$PrismaModel>;
};
export type EnumAssetConnectionCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetConnectionCategory | Prisma.EnumAssetConnectionCategoryFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetConnectionCategory[] | Prisma.ListEnumAssetConnectionCategoryFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetConnectionCategory[] | Prisma.ListEnumAssetConnectionCategoryFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetConnectionCategoryFilter<$PrismaModel> | $Enums.AssetConnectionCategory;
};
export type EnumAssetTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | Prisma.EnumAssetTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetTypeFilter<$PrismaModel> | $Enums.AssetType;
};
export type EnumAssetCriticalityFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetCriticality | Prisma.EnumAssetCriticalityFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetCriticality[] | Prisma.ListEnumAssetCriticalityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetCriticality[] | Prisma.ListEnumAssetCriticalityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetCriticalityFilter<$PrismaModel> | $Enums.AssetCriticality;
};
export type EnumAssetOriginFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetOrigin | Prisma.EnumAssetOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetOrigin[] | Prisma.ListEnumAssetOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetOrigin[] | Prisma.ListEnumAssetOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetOriginFilter<$PrismaModel> | $Enums.AssetOrigin;
};
export type EnumAssetStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetStatus | Prisma.EnumAssetStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetStatus[] | Prisma.ListEnumAssetStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetStatus[] | Prisma.ListEnumAssetStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetStatusFilter<$PrismaModel> | $Enums.AssetStatus;
};
export type EnumAssetOperationalStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetOperationalStatus | Prisma.EnumAssetOperationalStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetOperationalStatus[] | Prisma.ListEnumAssetOperationalStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetOperationalStatus[] | Prisma.ListEnumAssetOperationalStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetOperationalStatusFilter<$PrismaModel> | $Enums.AssetOperationalStatus;
};
export type EnumAssetConnectionCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetConnectionCategory | Prisma.EnumAssetConnectionCategoryFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetConnectionCategory[] | Prisma.ListEnumAssetConnectionCategoryFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetConnectionCategory[] | Prisma.ListEnumAssetConnectionCategoryFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetConnectionCategoryWithAggregatesFilter<$PrismaModel> | $Enums.AssetConnectionCategory;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAssetConnectionCategoryFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAssetConnectionCategoryFilter<$PrismaModel>;
};
export type EnumAssetTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | Prisma.EnumAssetTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel> | $Enums.AssetType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAssetTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAssetTypeFilter<$PrismaModel>;
};
export type EnumAssetCriticalityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetCriticality | Prisma.EnumAssetCriticalityFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetCriticality[] | Prisma.ListEnumAssetCriticalityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetCriticality[] | Prisma.ListEnumAssetCriticalityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetCriticalityWithAggregatesFilter<$PrismaModel> | $Enums.AssetCriticality;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAssetCriticalityFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAssetCriticalityFilter<$PrismaModel>;
};
export type EnumAssetOriginWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetOrigin | Prisma.EnumAssetOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetOrigin[] | Prisma.ListEnumAssetOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetOrigin[] | Prisma.ListEnumAssetOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetOriginWithAggregatesFilter<$PrismaModel> | $Enums.AssetOrigin;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAssetOriginFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAssetOriginFilter<$PrismaModel>;
};
export type EnumAssetStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetStatus | Prisma.EnumAssetStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetStatus[] | Prisma.ListEnumAssetStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetStatus[] | Prisma.ListEnumAssetStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetStatusWithAggregatesFilter<$PrismaModel> | $Enums.AssetStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAssetStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAssetStatusFilter<$PrismaModel>;
};
export type EnumAssetOperationalStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetOperationalStatus | Prisma.EnumAssetOperationalStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetOperationalStatus[] | Prisma.ListEnumAssetOperationalStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetOperationalStatus[] | Prisma.ListEnumAssetOperationalStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetOperationalStatusWithAggregatesFilter<$PrismaModel> | $Enums.AssetOperationalStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAssetOperationalStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAssetOperationalStatusFilter<$PrismaModel>;
};
export type EnumProvisioningStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProvisioningStatus | Prisma.EnumProvisioningStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ProvisioningStatus[] | Prisma.ListEnumProvisioningStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ProvisioningStatus[] | Prisma.ListEnumProvisioningStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumProvisioningStatusFilter<$PrismaModel> | $Enums.ProvisioningStatus;
};
export type EnumScheduleFrequencyNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ScheduleFrequency | Prisma.EnumScheduleFrequencyFieldRefInput<$PrismaModel> | null;
    in?: $Enums.ScheduleFrequency[] | Prisma.ListEnumScheduleFrequencyFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.ScheduleFrequency[] | Prisma.ListEnumScheduleFrequencyFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumScheduleFrequencyNullableFilter<$PrismaModel> | $Enums.ScheduleFrequency | null;
};
export type EnumProvisioningStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProvisioningStatus | Prisma.EnumProvisioningStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ProvisioningStatus[] | Prisma.ListEnumProvisioningStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ProvisioningStatus[] | Prisma.ListEnumProvisioningStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumProvisioningStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProvisioningStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumProvisioningStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumProvisioningStatusFilter<$PrismaModel>;
};
export type EnumScheduleFrequencyNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ScheduleFrequency | Prisma.EnumScheduleFrequencyFieldRefInput<$PrismaModel> | null;
    in?: $Enums.ScheduleFrequency[] | Prisma.ListEnumScheduleFrequencyFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.ScheduleFrequency[] | Prisma.ListEnumScheduleFrequencyFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumScheduleFrequencyNullableWithAggregatesFilter<$PrismaModel> | $Enums.ScheduleFrequency | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumScheduleFrequencyNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumScheduleFrequencyNullableFilter<$PrismaModel>;
};
export type EnumExecutionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionStatus | Prisma.EnumExecutionStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ExecutionStatus[] | Prisma.ListEnumExecutionStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExecutionStatus[] | Prisma.ListEnumExecutionStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExecutionStatusFilter<$PrismaModel> | $Enums.ExecutionStatus;
};
export type EnumExecutionOriginFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionOrigin | Prisma.EnumExecutionOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.ExecutionOrigin[] | Prisma.ListEnumExecutionOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExecutionOrigin[] | Prisma.ListEnumExecutionOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExecutionOriginFilter<$PrismaModel> | $Enums.ExecutionOrigin;
};
export type EnumExecutionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionStatus | Prisma.EnumExecutionStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ExecutionStatus[] | Prisma.ListEnumExecutionStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExecutionStatus[] | Prisma.ListEnumExecutionStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExecutionStatusWithAggregatesFilter<$PrismaModel> | $Enums.ExecutionStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumExecutionStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumExecutionStatusFilter<$PrismaModel>;
};
export type EnumExecutionOriginWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionOrigin | Prisma.EnumExecutionOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.ExecutionOrigin[] | Prisma.ListEnumExecutionOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExecutionOrigin[] | Prisma.ListEnumExecutionOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExecutionOriginWithAggregatesFilter<$PrismaModel> | $Enums.ExecutionOrigin;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumExecutionOriginFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumExecutionOriginFilter<$PrismaModel>;
};
export type EnumCheckResultStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckResultStatus | Prisma.EnumCheckResultStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.CheckResultStatus[] | Prisma.ListEnumCheckResultStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CheckResultStatus[] | Prisma.ListEnumCheckResultStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCheckResultStatusFilter<$PrismaModel> | $Enums.CheckResultStatus;
};
export type EnumCheckResultStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckResultStatus | Prisma.EnumCheckResultStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.CheckResultStatus[] | Prisma.ListEnumCheckResultStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CheckResultStatus[] | Prisma.ListEnumCheckResultStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCheckResultStatusWithAggregatesFilter<$PrismaModel> | $Enums.CheckResultStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumCheckResultStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumCheckResultStatusFilter<$PrismaModel>;
};
export type EnumExecutionLogLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionLogLevel | Prisma.EnumExecutionLogLevelFieldRefInput<$PrismaModel>;
    in?: $Enums.ExecutionLogLevel[] | Prisma.ListEnumExecutionLogLevelFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExecutionLogLevel[] | Prisma.ListEnumExecutionLogLevelFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExecutionLogLevelFilter<$PrismaModel> | $Enums.ExecutionLogLevel;
};
export type EnumExecutionLogLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionLogLevel | Prisma.EnumExecutionLogLevelFieldRefInput<$PrismaModel>;
    in?: $Enums.ExecutionLogLevel[] | Prisma.ListEnumExecutionLogLevelFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExecutionLogLevel[] | Prisma.ListEnumExecutionLogLevelFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExecutionLogLevelWithAggregatesFilter<$PrismaModel> | $Enums.ExecutionLogLevel;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumExecutionLogLevelFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumExecutionLogLevelFilter<$PrismaModel>;
};
export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedUuidFilter<$PrismaModel> | string;
};
export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedUuidNullableFilter<$PrismaModel> | string | null;
};
export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringNullableFilter<$PrismaModel> | string | null;
};
export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringFilter<$PrismaModel> | string;
};
export type NestedEnumAuditResultFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditResult | Prisma.EnumAuditResultFieldRefInput<$PrismaModel>;
    in?: $Enums.AuditResult[] | Prisma.ListEnumAuditResultFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AuditResult[] | Prisma.ListEnumAuditResultFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAuditResultFilter<$PrismaModel> | $Enums.AuditResult;
};
export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeFilter<$PrismaModel> | Date | string;
};
export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedUuidWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntFilter<$PrismaModel> | number;
};
export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableFilter<$PrismaModel> | number | null;
};
export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type NestedJsonNullableFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>, Required<NestedJsonNullableFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>;
export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
};
export type NestedEnumAuditResultWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditResult | Prisma.EnumAuditResultFieldRefInput<$PrismaModel>;
    in?: $Enums.AuditResult[] | Prisma.ListEnumAuditResultFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AuditResult[] | Prisma.ListEnumAuditResultFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAuditResultWithAggregatesFilter<$PrismaModel> | $Enums.AuditResult;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAuditResultFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAuditResultFilter<$PrismaModel>;
};
export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeFilter<$PrismaModel>;
};
export type NestedJsonFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>, Required<NestedJsonFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>;
export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
};
export type NestedEnumDimensionFilter<$PrismaModel = never> = {
    equals?: $Enums.Dimension | Prisma.EnumDimensionFieldRefInput<$PrismaModel>;
    in?: $Enums.Dimension[] | Prisma.ListEnumDimensionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Dimension[] | Prisma.ListEnumDimensionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumDimensionFilter<$PrismaModel> | $Enums.Dimension;
};
export type NestedEnumControlDimensionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ControlDimensionType | Prisma.EnumControlDimensionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.ControlDimensionType[] | Prisma.ListEnumControlDimensionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ControlDimensionType[] | Prisma.ListEnumControlDimensionTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumControlDimensionTypeFilter<$PrismaModel> | $Enums.ControlDimensionType;
};
export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolFilter<$PrismaModel> | boolean;
};
export type NestedEnumDimensionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Dimension | Prisma.EnumDimensionFieldRefInput<$PrismaModel>;
    in?: $Enums.Dimension[] | Prisma.ListEnumDimensionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Dimension[] | Prisma.ListEnumDimensionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumDimensionWithAggregatesFilter<$PrismaModel> | $Enums.Dimension;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumDimensionFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumDimensionFilter<$PrismaModel>;
};
export type NestedEnumControlDimensionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ControlDimensionType | Prisma.EnumControlDimensionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.ControlDimensionType[] | Prisma.ListEnumControlDimensionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ControlDimensionType[] | Prisma.ListEnumControlDimensionTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumControlDimensionTypeWithAggregatesFilter<$PrismaModel> | $Enums.ControlDimensionType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumControlDimensionTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumControlDimensionTypeFilter<$PrismaModel>;
};
export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedBoolFilter<$PrismaModel>;
    _max?: Prisma.NestedBoolFilter<$PrismaModel>;
};
export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    in?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel>;
    notIn?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel>;
    lt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    lte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDecimalFilter<$PrismaModel> | runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    in?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel>;
    notIn?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel>;
    lt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    lte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDecimalWithAggregatesFilter<$PrismaModel> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedDecimalFilter<$PrismaModel>;
    _sum?: Prisma.NestedDecimalFilter<$PrismaModel>;
    _min?: Prisma.NestedDecimalFilter<$PrismaModel>;
    _max?: Prisma.NestedDecimalFilter<$PrismaModel>;
};
export type NestedEnumPolicyApprovalStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PolicyApprovalStatus | Prisma.EnumPolicyApprovalStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.PolicyApprovalStatus[] | Prisma.ListEnumPolicyApprovalStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PolicyApprovalStatus[] | Prisma.ListEnumPolicyApprovalStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPolicyApprovalStatusFilter<$PrismaModel> | $Enums.PolicyApprovalStatus;
};
export type NestedEnumPolicyApprovalStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PolicyApprovalStatus | Prisma.EnumPolicyApprovalStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.PolicyApprovalStatus[] | Prisma.ListEnumPolicyApprovalStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PolicyApprovalStatus[] | Prisma.ListEnumPolicyApprovalStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPolicyApprovalStatusWithAggregatesFilter<$PrismaModel> | $Enums.PolicyApprovalStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPolicyApprovalStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPolicyApprovalStatusFilter<$PrismaModel>;
};
export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedIntFilter<$PrismaModel>;
    _max?: Prisma.NestedIntFilter<$PrismaModel>;
};
export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatFilter<$PrismaModel> | number;
};
export type NestedEnumFrameworkTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.FrameworkType | Prisma.EnumFrameworkTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.FrameworkType[] | Prisma.ListEnumFrameworkTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FrameworkType[] | Prisma.ListEnumFrameworkTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFrameworkTypeFilter<$PrismaModel> | $Enums.FrameworkType;
};
export type NestedEnumFrameworkTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FrameworkType | Prisma.EnumFrameworkTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.FrameworkType[] | Prisma.ListEnumFrameworkTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FrameworkType[] | Prisma.ListEnumFrameworkTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFrameworkTypeWithAggregatesFilter<$PrismaModel> | $Enums.FrameworkType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumFrameworkTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumFrameworkTypeFilter<$PrismaModel>;
};
export type NestedEnumTrustCriterionCodeFilter<$PrismaModel = never> = {
    equals?: $Enums.TrustCriterionCode | Prisma.EnumTrustCriterionCodeFieldRefInput<$PrismaModel>;
    in?: $Enums.TrustCriterionCode[] | Prisma.ListEnumTrustCriterionCodeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TrustCriterionCode[] | Prisma.ListEnumTrustCriterionCodeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTrustCriterionCodeFilter<$PrismaModel> | $Enums.TrustCriterionCode;
};
export type NestedEnumTrustCriterionCodeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TrustCriterionCode | Prisma.EnumTrustCriterionCodeFieldRefInput<$PrismaModel>;
    in?: $Enums.TrustCriterionCode[] | Prisma.ListEnumTrustCriterionCodeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TrustCriterionCode[] | Prisma.ListEnumTrustCriterionCodeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTrustCriterionCodeWithAggregatesFilter<$PrismaModel> | $Enums.TrustCriterionCode;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTrustCriterionCodeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTrustCriterionCodeFilter<$PrismaModel>;
};
export type NestedEnumRiskCriterionFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskCriterion | Prisma.EnumRiskCriterionFieldRefInput<$PrismaModel>;
    in?: $Enums.RiskCriterion[] | Prisma.ListEnumRiskCriterionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RiskCriterion[] | Prisma.ListEnumRiskCriterionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRiskCriterionFilter<$PrismaModel> | $Enums.RiskCriterion;
};
export type NestedEnumRiskLevelNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | Prisma.EnumRiskLevelFieldRefInput<$PrismaModel> | null;
    in?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumRiskLevelNullableFilter<$PrismaModel> | $Enums.RiskLevel | null;
};
export type NestedEnumRiskCriterionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskCriterion | Prisma.EnumRiskCriterionFieldRefInput<$PrismaModel>;
    in?: $Enums.RiskCriterion[] | Prisma.ListEnumRiskCriterionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RiskCriterion[] | Prisma.ListEnumRiskCriterionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRiskCriterionWithAggregatesFilter<$PrismaModel> | $Enums.RiskCriterion;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRiskCriterionFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRiskCriterionFilter<$PrismaModel>;
};
export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedIntNullableFilter<$PrismaModel>;
};
export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatNullableFilter<$PrismaModel> | number | null;
};
export type NestedEnumRiskLevelNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | Prisma.EnumRiskLevelFieldRefInput<$PrismaModel> | null;
    in?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumRiskLevelNullableWithAggregatesFilter<$PrismaModel> | $Enums.RiskLevel | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRiskLevelNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRiskLevelNullableFilter<$PrismaModel>;
};
export type NestedEnumFailureCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.FailureCategory | Prisma.EnumFailureCategoryFieldRefInput<$PrismaModel>;
    in?: $Enums.FailureCategory[] | Prisma.ListEnumFailureCategoryFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FailureCategory[] | Prisma.ListEnumFailureCategoryFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFailureCategoryFilter<$PrismaModel> | $Enums.FailureCategory;
};
export type NestedEnumFailureCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FailureCategory | Prisma.EnumFailureCategoryFieldRefInput<$PrismaModel>;
    in?: $Enums.FailureCategory[] | Prisma.ListEnumFailureCategoryFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FailureCategory[] | Prisma.ListEnumFailureCategoryFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFailureCategoryWithAggregatesFilter<$PrismaModel> | $Enums.FailureCategory;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumFailureCategoryFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumFailureCategoryFilter<$PrismaModel>;
};
export type NestedEnumTestPlanOriginFilter<$PrismaModel = never> = {
    equals?: $Enums.TestPlanOrigin | Prisma.EnumTestPlanOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.TestPlanOrigin[] | Prisma.ListEnumTestPlanOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TestPlanOrigin[] | Prisma.ListEnumTestPlanOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTestPlanOriginFilter<$PrismaModel> | $Enums.TestPlanOrigin;
};
export type NestedEnumTestPlanOriginWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TestPlanOrigin | Prisma.EnumTestPlanOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.TestPlanOrigin[] | Prisma.ListEnumTestPlanOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TestPlanOrigin[] | Prisma.ListEnumTestPlanOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTestPlanOriginWithAggregatesFilter<$PrismaModel> | $Enums.TestPlanOrigin;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTestPlanOriginFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTestPlanOriginFilter<$PrismaModel>;
};
export type NestedEnumCheckOriginFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckOrigin | Prisma.EnumCheckOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.CheckOrigin[] | Prisma.ListEnumCheckOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CheckOrigin[] | Prisma.ListEnumCheckOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCheckOriginFilter<$PrismaModel> | $Enums.CheckOrigin;
};
export type NestedEnumMappingConfidenceFilter<$PrismaModel = never> = {
    equals?: $Enums.MappingConfidence | Prisma.EnumMappingConfidenceFieldRefInput<$PrismaModel>;
    in?: $Enums.MappingConfidence[] | Prisma.ListEnumMappingConfidenceFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MappingConfidence[] | Prisma.ListEnumMappingConfidenceFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMappingConfidenceFilter<$PrismaModel> | $Enums.MappingConfidence;
};
export type NestedEnumCheckOriginWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckOrigin | Prisma.EnumCheckOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.CheckOrigin[] | Prisma.ListEnumCheckOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CheckOrigin[] | Prisma.ListEnumCheckOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCheckOriginWithAggregatesFilter<$PrismaModel> | $Enums.CheckOrigin;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumCheckOriginFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumCheckOriginFilter<$PrismaModel>;
};
export type NestedEnumMappingConfidenceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MappingConfidence | Prisma.EnumMappingConfidenceFieldRefInput<$PrismaModel>;
    in?: $Enums.MappingConfidence[] | Prisma.ListEnumMappingConfidenceFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MappingConfidence[] | Prisma.ListEnumMappingConfidenceFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMappingConfidenceWithAggregatesFilter<$PrismaModel> | $Enums.MappingConfidence;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumMappingConfidenceFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumMappingConfidenceFilter<$PrismaModel>;
};
export type NestedEnumIsolationStrategyFilter<$PrismaModel = never> = {
    equals?: $Enums.IsolationStrategy | Prisma.EnumIsolationStrategyFieldRefInput<$PrismaModel>;
    in?: $Enums.IsolationStrategy[] | Prisma.ListEnumIsolationStrategyFieldRefInput<$PrismaModel>;
    notIn?: $Enums.IsolationStrategy[] | Prisma.ListEnumIsolationStrategyFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumIsolationStrategyFilter<$PrismaModel> | $Enums.IsolationStrategy;
};
export type NestedEnumCompanyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CompanyStatus | Prisma.EnumCompanyStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.CompanyStatus[] | Prisma.ListEnumCompanyStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CompanyStatus[] | Prisma.ListEnumCompanyStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCompanyStatusFilter<$PrismaModel> | $Enums.CompanyStatus;
};
export type NestedEnumIsolationStrategyWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.IsolationStrategy | Prisma.EnumIsolationStrategyFieldRefInput<$PrismaModel>;
    in?: $Enums.IsolationStrategy[] | Prisma.ListEnumIsolationStrategyFieldRefInput<$PrismaModel>;
    notIn?: $Enums.IsolationStrategy[] | Prisma.ListEnumIsolationStrategyFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumIsolationStrategyWithAggregatesFilter<$PrismaModel> | $Enums.IsolationStrategy;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumIsolationStrategyFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumIsolationStrategyFilter<$PrismaModel>;
};
export type NestedEnumCompanyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CompanyStatus | Prisma.EnumCompanyStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.CompanyStatus[] | Prisma.ListEnumCompanyStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CompanyStatus[] | Prisma.ListEnumCompanyStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCompanyStatusWithAggregatesFilter<$PrismaModel> | $Enums.CompanyStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumCompanyStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumCompanyStatusFilter<$PrismaModel>;
};
export type NestedEnumAccessKeyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AccessKeyStatus | Prisma.EnumAccessKeyStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AccessKeyStatus[] | Prisma.ListEnumAccessKeyStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AccessKeyStatus[] | Prisma.ListEnumAccessKeyStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAccessKeyStatusFilter<$PrismaModel> | $Enums.AccessKeyStatus;
};
export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
};
export type NestedEnumAccessKeyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AccessKeyStatus | Prisma.EnumAccessKeyStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AccessKeyStatus[] | Prisma.ListEnumAccessKeyStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AccessKeyStatus[] | Prisma.ListEnumAccessKeyStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAccessKeyStatusWithAggregatesFilter<$PrismaModel> | $Enums.AccessKeyStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAccessKeyStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAccessKeyStatusFilter<$PrismaModel>;
};
export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
};
export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | Prisma.EnumUserRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.UserRole[] | Prisma.ListEnumUserRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserRole[] | Prisma.ListEnumUserRoleFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole;
};
export type NestedEnumUserStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | Prisma.EnumUserStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.UserStatus[] | Prisma.ListEnumUserStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserStatus[] | Prisma.ListEnumUserStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumUserStatusFilter<$PrismaModel> | $Enums.UserStatus;
};
export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | Prisma.EnumUserRoleFieldRefInput<$PrismaModel>;
    in?: $Enums.UserRole[] | Prisma.ListEnumUserRoleFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserRole[] | Prisma.ListEnumUserRoleFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumUserRoleFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumUserRoleFilter<$PrismaModel>;
};
export type NestedEnumUserStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | Prisma.EnumUserStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.UserStatus[] | Prisma.ListEnumUserStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.UserStatus[] | Prisma.ListEnumUserStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumUserStatusWithAggregatesFilter<$PrismaModel> | $Enums.UserStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumUserStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumUserStatusFilter<$PrismaModel>;
};
export type NestedEnumApiKeyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ApiKeyStatus | Prisma.EnumApiKeyStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ApiKeyStatus[] | Prisma.ListEnumApiKeyStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ApiKeyStatus[] | Prisma.ListEnumApiKeyStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumApiKeyStatusFilter<$PrismaModel> | $Enums.ApiKeyStatus;
};
export type NestedEnumApiKeyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ApiKeyStatus | Prisma.EnumApiKeyStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ApiKeyStatus[] | Prisma.ListEnumApiKeyStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ApiKeyStatus[] | Prisma.ListEnumApiKeyStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumApiKeyStatusWithAggregatesFilter<$PrismaModel> | $Enums.ApiKeyStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumApiKeyStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumApiKeyStatusFilter<$PrismaModel>;
};
export type NestedEnumActionPlanStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ActionPlanStatus | Prisma.EnumActionPlanStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ActionPlanStatus[] | Prisma.ListEnumActionPlanStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ActionPlanStatus[] | Prisma.ListEnumActionPlanStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumActionPlanStatusFilter<$PrismaModel> | $Enums.ActionPlanStatus;
};
export type NestedEnumActionPlanStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActionPlanStatus | Prisma.EnumActionPlanStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ActionPlanStatus[] | Prisma.ListEnumActionPlanStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ActionPlanStatus[] | Prisma.ListEnumActionPlanStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumActionPlanStatusWithAggregatesFilter<$PrismaModel> | $Enums.ActionPlanStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumActionPlanStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumActionPlanStatusFilter<$PrismaModel>;
};
export type NestedEnumRiskLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | Prisma.EnumRiskLevelFieldRefInput<$PrismaModel>;
    in?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRiskLevelFilter<$PrismaModel> | $Enums.RiskLevel;
};
export type NestedEnumRiskLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | Prisma.EnumRiskLevelFieldRefInput<$PrismaModel>;
    in?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RiskLevel[] | Prisma.ListEnumRiskLevelFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRiskLevelWithAggregatesFilter<$PrismaModel> | $Enums.RiskLevel;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRiskLevelFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRiskLevelFilter<$PrismaModel>;
};
export type NestedEnumRiskTreatmentDecisionFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskTreatmentDecision | Prisma.EnumRiskTreatmentDecisionFieldRefInput<$PrismaModel>;
    in?: $Enums.RiskTreatmentDecision[] | Prisma.ListEnumRiskTreatmentDecisionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RiskTreatmentDecision[] | Prisma.ListEnumRiskTreatmentDecisionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRiskTreatmentDecisionFilter<$PrismaModel> | $Enums.RiskTreatmentDecision;
};
export type NestedEnumRiskTreatmentDecisionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskTreatmentDecision | Prisma.EnumRiskTreatmentDecisionFieldRefInput<$PrismaModel>;
    in?: $Enums.RiskTreatmentDecision[] | Prisma.ListEnumRiskTreatmentDecisionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RiskTreatmentDecision[] | Prisma.ListEnumRiskTreatmentDecisionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRiskTreatmentDecisionWithAggregatesFilter<$PrismaModel> | $Enums.RiskTreatmentDecision;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRiskTreatmentDecisionFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRiskTreatmentDecisionFilter<$PrismaModel>;
};
export type NestedEnumEvidenceValidationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.EvidenceValidationStatus | Prisma.EnumEvidenceValidationStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.EvidenceValidationStatus[] | Prisma.ListEnumEvidenceValidationStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EvidenceValidationStatus[] | Prisma.ListEnumEvidenceValidationStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEvidenceValidationStatusFilter<$PrismaModel> | $Enums.EvidenceValidationStatus;
};
export type NestedEnumEvidenceValidationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EvidenceValidationStatus | Prisma.EnumEvidenceValidationStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.EvidenceValidationStatus[] | Prisma.ListEnumEvidenceValidationStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EvidenceValidationStatus[] | Prisma.ListEnumEvidenceValidationStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEvidenceValidationStatusWithAggregatesFilter<$PrismaModel> | $Enums.EvidenceValidationStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEvidenceValidationStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEvidenceValidationStatusFilter<$PrismaModel>;
};
export type NestedEnumEvaluationResultFilter<$PrismaModel = never> = {
    equals?: $Enums.EvaluationResult | Prisma.EnumEvaluationResultFieldRefInput<$PrismaModel>;
    in?: $Enums.EvaluationResult[] | Prisma.ListEnumEvaluationResultFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EvaluationResult[] | Prisma.ListEnumEvaluationResultFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEvaluationResultFilter<$PrismaModel> | $Enums.EvaluationResult;
};
export type NestedEnumRawProbeResultNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.RawProbeResult | Prisma.EnumRawProbeResultFieldRefInput<$PrismaModel> | null;
    in?: $Enums.RawProbeResult[] | Prisma.ListEnumRawProbeResultFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.RawProbeResult[] | Prisma.ListEnumRawProbeResultFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumRawProbeResultNullableFilter<$PrismaModel> | $Enums.RawProbeResult | null;
};
export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel> | null;
    in?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    notIn?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    lt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    lte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDecimalNullableFilter<$PrismaModel> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
};
export type NestedEnumEvaluationOriginFilter<$PrismaModel = never> = {
    equals?: $Enums.EvaluationOrigin | Prisma.EnumEvaluationOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.EvaluationOrigin[] | Prisma.ListEnumEvaluationOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EvaluationOrigin[] | Prisma.ListEnumEvaluationOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEvaluationOriginFilter<$PrismaModel> | $Enums.EvaluationOrigin;
};
export type NestedEnumEvaluationResultWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EvaluationResult | Prisma.EnumEvaluationResultFieldRefInput<$PrismaModel>;
    in?: $Enums.EvaluationResult[] | Prisma.ListEnumEvaluationResultFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EvaluationResult[] | Prisma.ListEnumEvaluationResultFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEvaluationResultWithAggregatesFilter<$PrismaModel> | $Enums.EvaluationResult;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEvaluationResultFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEvaluationResultFilter<$PrismaModel>;
};
export type NestedEnumRawProbeResultNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RawProbeResult | Prisma.EnumRawProbeResultFieldRefInput<$PrismaModel> | null;
    in?: $Enums.RawProbeResult[] | Prisma.ListEnumRawProbeResultFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.RawProbeResult[] | Prisma.ListEnumRawProbeResultFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumRawProbeResultNullableWithAggregatesFilter<$PrismaModel> | $Enums.RawProbeResult | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRawProbeResultNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRawProbeResultNullableFilter<$PrismaModel>;
};
export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel> | null;
    in?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    notIn?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    lt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    lte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
};
export type NestedEnumEvaluationOriginWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EvaluationOrigin | Prisma.EnumEvaluationOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.EvaluationOrigin[] | Prisma.ListEnumEvaluationOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EvaluationOrigin[] | Prisma.ListEnumEvaluationOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEvaluationOriginWithAggregatesFilter<$PrismaModel> | $Enums.EvaluationOrigin;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEvaluationOriginFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEvaluationOriginFilter<$PrismaModel>;
};
export type NestedEnumSeverityFilter<$PrismaModel = never> = {
    equals?: $Enums.Severity | Prisma.EnumSeverityFieldRefInput<$PrismaModel>;
    in?: $Enums.Severity[] | Prisma.ListEnumSeverityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Severity[] | Prisma.ListEnumSeverityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSeverityFilter<$PrismaModel> | $Enums.Severity;
};
export type NestedEnumFindingStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.FindingStatus | Prisma.EnumFindingStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.FindingStatus[] | Prisma.ListEnumFindingStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FindingStatus[] | Prisma.ListEnumFindingStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFindingStatusFilter<$PrismaModel> | $Enums.FindingStatus;
};
export type NestedEnumFindingOriginFilter<$PrismaModel = never> = {
    equals?: $Enums.FindingOrigin | Prisma.EnumFindingOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.FindingOrigin[] | Prisma.ListEnumFindingOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FindingOrigin[] | Prisma.ListEnumFindingOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFindingOriginFilter<$PrismaModel> | $Enums.FindingOrigin;
};
export type NestedEnumSeverityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Severity | Prisma.EnumSeverityFieldRefInput<$PrismaModel>;
    in?: $Enums.Severity[] | Prisma.ListEnumSeverityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Severity[] | Prisma.ListEnumSeverityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSeverityWithAggregatesFilter<$PrismaModel> | $Enums.Severity;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumSeverityFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumSeverityFilter<$PrismaModel>;
};
export type NestedEnumFindingStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FindingStatus | Prisma.EnumFindingStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.FindingStatus[] | Prisma.ListEnumFindingStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FindingStatus[] | Prisma.ListEnumFindingStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFindingStatusWithAggregatesFilter<$PrismaModel> | $Enums.FindingStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumFindingStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumFindingStatusFilter<$PrismaModel>;
};
export type NestedEnumFindingOriginWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FindingOrigin | Prisma.EnumFindingOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.FindingOrigin[] | Prisma.ListEnumFindingOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.FindingOrigin[] | Prisma.ListEnumFindingOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumFindingOriginWithAggregatesFilter<$PrismaModel> | $Enums.FindingOrigin;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumFindingOriginFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumFindingOriginFilter<$PrismaModel>;
};
export type NestedEnumVulnerabilityStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.VulnerabilityStatus | Prisma.EnumVulnerabilityStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.VulnerabilityStatus[] | Prisma.ListEnumVulnerabilityStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.VulnerabilityStatus[] | Prisma.ListEnumVulnerabilityStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumVulnerabilityStatusFilter<$PrismaModel> | $Enums.VulnerabilityStatus;
};
export type NestedEnumVulnerabilityStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VulnerabilityStatus | Prisma.EnumVulnerabilityStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.VulnerabilityStatus[] | Prisma.ListEnumVulnerabilityStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.VulnerabilityStatus[] | Prisma.ListEnumVulnerabilityStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumVulnerabilityStatusWithAggregatesFilter<$PrismaModel> | $Enums.VulnerabilityStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumVulnerabilityStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumVulnerabilityStatusFilter<$PrismaModel>;
};
export type NestedEnumOrganizationSizeFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationSize | Prisma.EnumOrganizationSizeFieldRefInput<$PrismaModel>;
    in?: $Enums.OrganizationSize[] | Prisma.ListEnumOrganizationSizeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrganizationSize[] | Prisma.ListEnumOrganizationSizeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrganizationSizeFilter<$PrismaModel> | $Enums.OrganizationSize;
};
export type NestedEnumIndustryFilter<$PrismaModel = never> = {
    equals?: $Enums.Industry | Prisma.EnumIndustryFieldRefInput<$PrismaModel>;
    in?: $Enums.Industry[] | Prisma.ListEnumIndustryFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Industry[] | Prisma.ListEnumIndustryFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumIndustryFilter<$PrismaModel> | $Enums.Industry;
};
export type NestedEnumBusinessModelFilter<$PrismaModel = never> = {
    equals?: $Enums.BusinessModel | Prisma.EnumBusinessModelFieldRefInput<$PrismaModel>;
    in?: $Enums.BusinessModel[] | Prisma.ListEnumBusinessModelFieldRefInput<$PrismaModel>;
    notIn?: $Enums.BusinessModel[] | Prisma.ListEnumBusinessModelFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumBusinessModelFilter<$PrismaModel> | $Enums.BusinessModel;
};
export type NestedEnumYearsInOperationNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.YearsInOperation | Prisma.EnumYearsInOperationFieldRefInput<$PrismaModel> | null;
    in?: $Enums.YearsInOperation[] | Prisma.ListEnumYearsInOperationFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.YearsInOperation[] | Prisma.ListEnumYearsInOperationFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumYearsInOperationNullableFilter<$PrismaModel> | $Enums.YearsInOperation | null;
};
export type NestedEnumComplianceMaturityFilter<$PrismaModel = never> = {
    equals?: $Enums.ComplianceMaturity | Prisma.EnumComplianceMaturityFieldRefInput<$PrismaModel>;
    in?: $Enums.ComplianceMaturity[] | Prisma.ListEnumComplianceMaturityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ComplianceMaturity[] | Prisma.ListEnumComplianceMaturityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumComplianceMaturityFilter<$PrismaModel> | $Enums.ComplianceMaturity;
};
export type NestedEnumOrganizationSizeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationSize | Prisma.EnumOrganizationSizeFieldRefInput<$PrismaModel>;
    in?: $Enums.OrganizationSize[] | Prisma.ListEnumOrganizationSizeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrganizationSize[] | Prisma.ListEnumOrganizationSizeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrganizationSizeWithAggregatesFilter<$PrismaModel> | $Enums.OrganizationSize;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumOrganizationSizeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumOrganizationSizeFilter<$PrismaModel>;
};
export type NestedEnumIndustryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Industry | Prisma.EnumIndustryFieldRefInput<$PrismaModel>;
    in?: $Enums.Industry[] | Prisma.ListEnumIndustryFieldRefInput<$PrismaModel>;
    notIn?: $Enums.Industry[] | Prisma.ListEnumIndustryFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumIndustryWithAggregatesFilter<$PrismaModel> | $Enums.Industry;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumIndustryFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumIndustryFilter<$PrismaModel>;
};
export type NestedEnumBusinessModelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BusinessModel | Prisma.EnumBusinessModelFieldRefInput<$PrismaModel>;
    in?: $Enums.BusinessModel[] | Prisma.ListEnumBusinessModelFieldRefInput<$PrismaModel>;
    notIn?: $Enums.BusinessModel[] | Prisma.ListEnumBusinessModelFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumBusinessModelWithAggregatesFilter<$PrismaModel> | $Enums.BusinessModel;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumBusinessModelFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumBusinessModelFilter<$PrismaModel>;
};
export type NestedEnumYearsInOperationNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.YearsInOperation | Prisma.EnumYearsInOperationFieldRefInput<$PrismaModel> | null;
    in?: $Enums.YearsInOperation[] | Prisma.ListEnumYearsInOperationFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.YearsInOperation[] | Prisma.ListEnumYearsInOperationFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumYearsInOperationNullableWithAggregatesFilter<$PrismaModel> | $Enums.YearsInOperation | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumYearsInOperationNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumYearsInOperationNullableFilter<$PrismaModel>;
};
export type NestedEnumComplianceMaturityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ComplianceMaturity | Prisma.EnumComplianceMaturityFieldRefInput<$PrismaModel>;
    in?: $Enums.ComplianceMaturity[] | Prisma.ListEnumComplianceMaturityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ComplianceMaturity[] | Prisma.ListEnumComplianceMaturityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumComplianceMaturityWithAggregatesFilter<$PrismaModel> | $Enums.ComplianceMaturity;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumComplianceMaturityFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumComplianceMaturityFilter<$PrismaModel>;
};
export type NestedEnumOrganizationResponsibleTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationResponsibleType | Prisma.EnumOrganizationResponsibleTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.OrganizationResponsibleType[] | Prisma.ListEnumOrganizationResponsibleTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrganizationResponsibleType[] | Prisma.ListEnumOrganizationResponsibleTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrganizationResponsibleTypeFilter<$PrismaModel> | $Enums.OrganizationResponsibleType;
};
export type NestedEnumOrganizationResponsibleTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationResponsibleType | Prisma.EnumOrganizationResponsibleTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.OrganizationResponsibleType[] | Prisma.ListEnumOrganizationResponsibleTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrganizationResponsibleType[] | Prisma.ListEnumOrganizationResponsibleTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrganizationResponsibleTypeWithAggregatesFilter<$PrismaModel> | $Enums.OrganizationResponsibleType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumOrganizationResponsibleTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumOrganizationResponsibleTypeFilter<$PrismaModel>;
};
export type NestedEnumServiceTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceType | Prisma.EnumServiceTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.ServiceType[] | Prisma.ListEnumServiceTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ServiceType[] | Prisma.ListEnumServiceTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumServiceTypeFilter<$PrismaModel> | $Enums.ServiceType;
};
export type NestedEnumActiveClientCountNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ActiveClientCount | Prisma.EnumActiveClientCountFieldRefInput<$PrismaModel> | null;
    in?: $Enums.ActiveClientCount[] | Prisma.ListEnumActiveClientCountFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.ActiveClientCount[] | Prisma.ListEnumActiveClientCountFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumActiveClientCountNullableFilter<$PrismaModel> | $Enums.ActiveClientCount | null;
};
export type NestedEnumExpectedAvailabilityFilter<$PrismaModel = never> = {
    equals?: $Enums.ExpectedAvailability | Prisma.EnumExpectedAvailabilityFieldRefInput<$PrismaModel>;
    in?: $Enums.ExpectedAvailability[] | Prisma.ListEnumExpectedAvailabilityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExpectedAvailability[] | Prisma.ListEnumExpectedAvailabilityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExpectedAvailabilityFilter<$PrismaModel> | $Enums.ExpectedAvailability;
};
export type NestedEnumDeploymentScenarioNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.DeploymentScenario | Prisma.EnumDeploymentScenarioFieldRefInput<$PrismaModel> | null;
    in?: $Enums.DeploymentScenario[] | Prisma.ListEnumDeploymentScenarioFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.DeploymentScenario[] | Prisma.ListEnumDeploymentScenarioFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumDeploymentScenarioNullableFilter<$PrismaModel> | $Enums.DeploymentScenario | null;
};
export type NestedEnumPreviousCertificationNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.PreviousCertification | Prisma.EnumPreviousCertificationFieldRefInput<$PrismaModel> | null;
    in?: $Enums.PreviousCertification[] | Prisma.ListEnumPreviousCertificationFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.PreviousCertification[] | Prisma.ListEnumPreviousCertificationFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumPreviousCertificationNullableFilter<$PrismaModel> | $Enums.PreviousCertification | null;
};
export type NestedEnumServiceTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceType | Prisma.EnumServiceTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.ServiceType[] | Prisma.ListEnumServiceTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ServiceType[] | Prisma.ListEnumServiceTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumServiceTypeWithAggregatesFilter<$PrismaModel> | $Enums.ServiceType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumServiceTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumServiceTypeFilter<$PrismaModel>;
};
export type NestedEnumActiveClientCountNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActiveClientCount | Prisma.EnumActiveClientCountFieldRefInput<$PrismaModel> | null;
    in?: $Enums.ActiveClientCount[] | Prisma.ListEnumActiveClientCountFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.ActiveClientCount[] | Prisma.ListEnumActiveClientCountFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumActiveClientCountNullableWithAggregatesFilter<$PrismaModel> | $Enums.ActiveClientCount | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumActiveClientCountNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumActiveClientCountNullableFilter<$PrismaModel>;
};
export type NestedEnumExpectedAvailabilityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ExpectedAvailability | Prisma.EnumExpectedAvailabilityFieldRefInput<$PrismaModel>;
    in?: $Enums.ExpectedAvailability[] | Prisma.ListEnumExpectedAvailabilityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExpectedAvailability[] | Prisma.ListEnumExpectedAvailabilityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExpectedAvailabilityWithAggregatesFilter<$PrismaModel> | $Enums.ExpectedAvailability;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumExpectedAvailabilityFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumExpectedAvailabilityFilter<$PrismaModel>;
};
export type NestedEnumDeploymentScenarioNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DeploymentScenario | Prisma.EnumDeploymentScenarioFieldRefInput<$PrismaModel> | null;
    in?: $Enums.DeploymentScenario[] | Prisma.ListEnumDeploymentScenarioFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.DeploymentScenario[] | Prisma.ListEnumDeploymentScenarioFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumDeploymentScenarioNullableWithAggregatesFilter<$PrismaModel> | $Enums.DeploymentScenario | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumDeploymentScenarioNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumDeploymentScenarioNullableFilter<$PrismaModel>;
};
export type NestedEnumPreviousCertificationNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PreviousCertification | Prisma.EnumPreviousCertificationFieldRefInput<$PrismaModel> | null;
    in?: $Enums.PreviousCertification[] | Prisma.ListEnumPreviousCertificationFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.PreviousCertification[] | Prisma.ListEnumPreviousCertificationFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumPreviousCertificationNullableWithAggregatesFilter<$PrismaModel> | $Enums.PreviousCertification | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPreviousCertificationNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPreviousCertificationNullableFilter<$PrismaModel>;
};
export type NestedEnumServiceFrameworkStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceFrameworkStatus | Prisma.EnumServiceFrameworkStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ServiceFrameworkStatus[] | Prisma.ListEnumServiceFrameworkStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ServiceFrameworkStatus[] | Prisma.ListEnumServiceFrameworkStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumServiceFrameworkStatusFilter<$PrismaModel> | $Enums.ServiceFrameworkStatus;
};
export type NestedEnumServiceFrameworkStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceFrameworkStatus | Prisma.EnumServiceFrameworkStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ServiceFrameworkStatus[] | Prisma.ListEnumServiceFrameworkStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ServiceFrameworkStatus[] | Prisma.ListEnumServiceFrameworkStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumServiceFrameworkStatusWithAggregatesFilter<$PrismaModel> | $Enums.ServiceFrameworkStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumServiceFrameworkStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumServiceFrameworkStatusFilter<$PrismaModel>;
};
export type NestedEnumSubserviceProviderTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SubserviceProviderType | Prisma.EnumSubserviceProviderTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.SubserviceProviderType[] | Prisma.ListEnumSubserviceProviderTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SubserviceProviderType[] | Prisma.ListEnumSubserviceProviderTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSubserviceProviderTypeFilter<$PrismaModel> | $Enums.SubserviceProviderType;
};
export type NestedEnumSubserviceProviderTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SubserviceProviderType | Prisma.EnumSubserviceProviderTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.SubserviceProviderType[] | Prisma.ListEnumSubserviceProviderTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SubserviceProviderType[] | Prisma.ListEnumSubserviceProviderTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSubserviceProviderTypeWithAggregatesFilter<$PrismaModel> | $Enums.SubserviceProviderType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumSubserviceProviderTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumSubserviceProviderTypeFilter<$PrismaModel>;
};
export type NestedEnumAssetConnectionCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetConnectionCategory | Prisma.EnumAssetConnectionCategoryFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetConnectionCategory[] | Prisma.ListEnumAssetConnectionCategoryFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetConnectionCategory[] | Prisma.ListEnumAssetConnectionCategoryFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetConnectionCategoryFilter<$PrismaModel> | $Enums.AssetConnectionCategory;
};
export type NestedEnumAssetTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | Prisma.EnumAssetTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetTypeFilter<$PrismaModel> | $Enums.AssetType;
};
export type NestedEnumAssetCriticalityFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetCriticality | Prisma.EnumAssetCriticalityFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetCriticality[] | Prisma.ListEnumAssetCriticalityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetCriticality[] | Prisma.ListEnumAssetCriticalityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetCriticalityFilter<$PrismaModel> | $Enums.AssetCriticality;
};
export type NestedEnumAssetOriginFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetOrigin | Prisma.EnumAssetOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetOrigin[] | Prisma.ListEnumAssetOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetOrigin[] | Prisma.ListEnumAssetOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetOriginFilter<$PrismaModel> | $Enums.AssetOrigin;
};
export type NestedEnumAssetStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetStatus | Prisma.EnumAssetStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetStatus[] | Prisma.ListEnumAssetStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetStatus[] | Prisma.ListEnumAssetStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetStatusFilter<$PrismaModel> | $Enums.AssetStatus;
};
export type NestedEnumAssetOperationalStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetOperationalStatus | Prisma.EnumAssetOperationalStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetOperationalStatus[] | Prisma.ListEnumAssetOperationalStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetOperationalStatus[] | Prisma.ListEnumAssetOperationalStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetOperationalStatusFilter<$PrismaModel> | $Enums.AssetOperationalStatus;
};
export type NestedEnumAssetConnectionCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetConnectionCategory | Prisma.EnumAssetConnectionCategoryFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetConnectionCategory[] | Prisma.ListEnumAssetConnectionCategoryFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetConnectionCategory[] | Prisma.ListEnumAssetConnectionCategoryFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetConnectionCategoryWithAggregatesFilter<$PrismaModel> | $Enums.AssetConnectionCategory;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAssetConnectionCategoryFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAssetConnectionCategoryFilter<$PrismaModel>;
};
export type NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | Prisma.EnumAssetTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetType[] | Prisma.ListEnumAssetTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel> | $Enums.AssetType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAssetTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAssetTypeFilter<$PrismaModel>;
};
export type NestedEnumAssetCriticalityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetCriticality | Prisma.EnumAssetCriticalityFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetCriticality[] | Prisma.ListEnumAssetCriticalityFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetCriticality[] | Prisma.ListEnumAssetCriticalityFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetCriticalityWithAggregatesFilter<$PrismaModel> | $Enums.AssetCriticality;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAssetCriticalityFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAssetCriticalityFilter<$PrismaModel>;
};
export type NestedEnumAssetOriginWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetOrigin | Prisma.EnumAssetOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetOrigin[] | Prisma.ListEnumAssetOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetOrigin[] | Prisma.ListEnumAssetOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetOriginWithAggregatesFilter<$PrismaModel> | $Enums.AssetOrigin;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAssetOriginFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAssetOriginFilter<$PrismaModel>;
};
export type NestedEnumAssetStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetStatus | Prisma.EnumAssetStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetStatus[] | Prisma.ListEnumAssetStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetStatus[] | Prisma.ListEnumAssetStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetStatusWithAggregatesFilter<$PrismaModel> | $Enums.AssetStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAssetStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAssetStatusFilter<$PrismaModel>;
};
export type NestedEnumAssetOperationalStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetOperationalStatus | Prisma.EnumAssetOperationalStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.AssetOperationalStatus[] | Prisma.ListEnumAssetOperationalStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AssetOperationalStatus[] | Prisma.ListEnumAssetOperationalStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAssetOperationalStatusWithAggregatesFilter<$PrismaModel> | $Enums.AssetOperationalStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAssetOperationalStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAssetOperationalStatusFilter<$PrismaModel>;
};
export type NestedEnumProvisioningStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProvisioningStatus | Prisma.EnumProvisioningStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ProvisioningStatus[] | Prisma.ListEnumProvisioningStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ProvisioningStatus[] | Prisma.ListEnumProvisioningStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumProvisioningStatusFilter<$PrismaModel> | $Enums.ProvisioningStatus;
};
export type NestedEnumScheduleFrequencyNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ScheduleFrequency | Prisma.EnumScheduleFrequencyFieldRefInput<$PrismaModel> | null;
    in?: $Enums.ScheduleFrequency[] | Prisma.ListEnumScheduleFrequencyFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.ScheduleFrequency[] | Prisma.ListEnumScheduleFrequencyFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumScheduleFrequencyNullableFilter<$PrismaModel> | $Enums.ScheduleFrequency | null;
};
export type NestedEnumProvisioningStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProvisioningStatus | Prisma.EnumProvisioningStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ProvisioningStatus[] | Prisma.ListEnumProvisioningStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ProvisioningStatus[] | Prisma.ListEnumProvisioningStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumProvisioningStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProvisioningStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumProvisioningStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumProvisioningStatusFilter<$PrismaModel>;
};
export type NestedEnumScheduleFrequencyNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ScheduleFrequency | Prisma.EnumScheduleFrequencyFieldRefInput<$PrismaModel> | null;
    in?: $Enums.ScheduleFrequency[] | Prisma.ListEnumScheduleFrequencyFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.ScheduleFrequency[] | Prisma.ListEnumScheduleFrequencyFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumScheduleFrequencyNullableWithAggregatesFilter<$PrismaModel> | $Enums.ScheduleFrequency | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumScheduleFrequencyNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumScheduleFrequencyNullableFilter<$PrismaModel>;
};
export type NestedEnumExecutionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionStatus | Prisma.EnumExecutionStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ExecutionStatus[] | Prisma.ListEnumExecutionStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExecutionStatus[] | Prisma.ListEnumExecutionStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExecutionStatusFilter<$PrismaModel> | $Enums.ExecutionStatus;
};
export type NestedEnumExecutionOriginFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionOrigin | Prisma.EnumExecutionOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.ExecutionOrigin[] | Prisma.ListEnumExecutionOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExecutionOrigin[] | Prisma.ListEnumExecutionOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExecutionOriginFilter<$PrismaModel> | $Enums.ExecutionOrigin;
};
export type NestedEnumExecutionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionStatus | Prisma.EnumExecutionStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.ExecutionStatus[] | Prisma.ListEnumExecutionStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExecutionStatus[] | Prisma.ListEnumExecutionStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExecutionStatusWithAggregatesFilter<$PrismaModel> | $Enums.ExecutionStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumExecutionStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumExecutionStatusFilter<$PrismaModel>;
};
export type NestedEnumExecutionOriginWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionOrigin | Prisma.EnumExecutionOriginFieldRefInput<$PrismaModel>;
    in?: $Enums.ExecutionOrigin[] | Prisma.ListEnumExecutionOriginFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExecutionOrigin[] | Prisma.ListEnumExecutionOriginFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExecutionOriginWithAggregatesFilter<$PrismaModel> | $Enums.ExecutionOrigin;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumExecutionOriginFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumExecutionOriginFilter<$PrismaModel>;
};
export type NestedEnumCheckResultStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckResultStatus | Prisma.EnumCheckResultStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.CheckResultStatus[] | Prisma.ListEnumCheckResultStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CheckResultStatus[] | Prisma.ListEnumCheckResultStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCheckResultStatusFilter<$PrismaModel> | $Enums.CheckResultStatus;
};
export type NestedEnumCheckResultStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckResultStatus | Prisma.EnumCheckResultStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.CheckResultStatus[] | Prisma.ListEnumCheckResultStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CheckResultStatus[] | Prisma.ListEnumCheckResultStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCheckResultStatusWithAggregatesFilter<$PrismaModel> | $Enums.CheckResultStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumCheckResultStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumCheckResultStatusFilter<$PrismaModel>;
};
export type NestedEnumExecutionLogLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionLogLevel | Prisma.EnumExecutionLogLevelFieldRefInput<$PrismaModel>;
    in?: $Enums.ExecutionLogLevel[] | Prisma.ListEnumExecutionLogLevelFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExecutionLogLevel[] | Prisma.ListEnumExecutionLogLevelFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExecutionLogLevelFilter<$PrismaModel> | $Enums.ExecutionLogLevel;
};
export type NestedEnumExecutionLogLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ExecutionLogLevel | Prisma.EnumExecutionLogLevelFieldRefInput<$PrismaModel>;
    in?: $Enums.ExecutionLogLevel[] | Prisma.ListEnumExecutionLogLevelFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ExecutionLogLevel[] | Prisma.ListEnumExecutionLogLevelFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumExecutionLogLevelWithAggregatesFilter<$PrismaModel> | $Enums.ExecutionLogLevel;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumExecutionLogLevelFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumExecutionLogLevelFilter<$PrismaModel>;
};
