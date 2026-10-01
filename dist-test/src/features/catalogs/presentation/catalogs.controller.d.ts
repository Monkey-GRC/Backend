import { ResponseDto } from '../../../common/dtos/response.dto';
import { GetCatalogUseCase } from '../application/use-cases/get-catalog.use-case';
export declare class CatalogsController {
    private readonly getCatalog;
    constructor(getCatalog: GetCatalogUseCase);
    get(name: string): Promise<ResponseDto<{
        items: {
            catalog_code: string;
            category: string;
            method: string;
            required_permissions: string[];
            base_frequency: string;
            supported_platforms: string[];
            generated_evidence: string;
        }[] | {
            code: string;
            name: string;
            jurisdiction: string;
            label: string;
        }[] | {
            code: string;
            name: string;
            description: string;
            label: string;
        }[] | {
            group?: "other" | "country" | "region" | undefined;
            value: string;
            label: string;
        }[];
    }>>;
}
