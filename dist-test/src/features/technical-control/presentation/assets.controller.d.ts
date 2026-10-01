import type { Request } from 'express';
import type { Principal } from '../../../common/auth/principal';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { CreateAssetDto, ListAssetsQuery, ScheduleDto } from '../application/dtos/technical-control.dtos';
import { ActivateAssetUseCase, CreateAssetUseCase, GetAssetUseCase, ListAssetsUseCase, ScheduleAssetUseCase, ValidateAssetUseCase } from '../application/use-cases/asset.use-cases';
import { ConnectionProbe } from '../domain/ports/connection-probe';
export declare class AssetsController {
    private readonly createAsset;
    private readonly listAssets;
    private readonly getAsset;
    private readonly validateAsset;
    private readonly activateAsset;
    private readonly scheduleAsset;
    private readonly probe;
    constructor(createAsset: CreateAssetUseCase, listAssets: ListAssetsUseCase, getAsset: GetAssetUseCase, validateAsset: ValidateAssetUseCase, activateAsset: ActivateAssetUseCase, scheduleAsset: ScheduleAssetUseCase, probe: ConnectionProbe);
    create(principal: Principal, dto: CreateAssetDto, req: Request): Promise<ResponseDto<{
        id: string;
        code: string;
        name: string;
        connection_category: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
        type: string;
        platform: string;
        ip_address: string | null;
        location: string | null;
        criticality: string;
        tags: string[];
        origin: string;
        status: string;
        operational_status: string;
        technical_coverage: string;
        services: {
            id: string;
            name: string;
        }[];
        provisioning: {
            id: string;
            automated_capability_code: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
            connection_status: string;
            last_validated_at: string | null;
            is_active: boolean;
            schedule_frequency: "continuous" | "every_6h" | "every_24h" | null;
        };
    }>>;
    list(principal: Principal, query: ListAssetsQuery): Promise<ResponseDto<{
        items: {
            id: string;
            code: string;
            name: string;
            connection_category: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
            type: string;
            operational_status: string;
            technical_coverage: string;
            services: {
                id: string;
                name: string;
            }[];
            provisioning: {
                connection_status: string;
                is_active: boolean;
                schedule_frequency: "continuous" | "every_6h" | "every_24h" | null;
            };
        }[];
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
    }>>;
    detail(principal: Principal, id: string): Promise<ResponseDto<{
        id: string;
        code: string;
        name: string;
        connection_category: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
        type: string;
        platform: string;
        ip_address: string | null;
        location: string | null;
        criticality: string;
        tags: string[];
        origin: string;
        status: string;
        operational_status: string;
        technical_coverage: string;
        services: {
            id: string;
            name: string;
        }[];
        provisioning: {
            id: string;
            automated_capability_code: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
            connection_status: string;
            last_validated_at: string | null;
            is_active: boolean;
            schedule_frequency: "continuous" | "every_6h" | "every_24h" | null;
        };
    }>>;
    validate(principal: Principal, id: string, req: Request): Promise<ResponseDto<{
        connection_status: string;
        last_validated_at: string | null;
        technical_coverage: string;
        checks_available: number;
        mode: string;
    }>>;
    activate(principal: Principal, id: string, req: Request): Promise<ResponseDto<{
        id: string;
        code: string;
        name: string;
        connection_category: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
        type: string;
        platform: string;
        ip_address: string | null;
        location: string | null;
        criticality: string;
        tags: string[];
        origin: string;
        status: string;
        operational_status: string;
        technical_coverage: string;
        services: {
            id: string;
            name: string;
        }[];
        provisioning: {
            id: string;
            automated_capability_code: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
            connection_status: string;
            last_validated_at: string | null;
            is_active: boolean;
            schedule_frequency: "continuous" | "every_6h" | "every_24h" | null;
        };
    }>>;
    schedule(principal: Principal, id: string, dto: ScheduleDto, req: Request): Promise<ResponseDto<{
        id: string;
        code: string;
        name: string;
        connection_category: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
        type: string;
        platform: string;
        ip_address: string | null;
        location: string | null;
        criticality: string;
        tags: string[];
        origin: string;
        status: string;
        operational_status: string;
        technical_coverage: string;
        services: {
            id: string;
            name: string;
        }[];
        provisioning: {
            id: string;
            automated_capability_code: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
            connection_status: string;
            last_validated_at: string | null;
            is_active: boolean;
            schedule_frequency: "continuous" | "every_6h" | "every_24h" | null;
        };
    }>>;
}
