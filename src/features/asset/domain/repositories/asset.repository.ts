import { AssetSource, AssetStatus, AssetType, ChecklistOs } from 'generated/prisma-tenant/browser';

export type CreateAssetInput = {
    name: string;
    type: AssetType;
    source?: AssetSource;
    externalId?: string;
    os?: ChecklistOs;
    userId: string;
};

export type UpdateAssetInput = {
    name?: string;
    type?: AssetType;
    status?: AssetStatus;
    externalId?: string;
    os?: ChecklistOs;
    userId: string;
};

export abstract class AssetRepository {
    abstract findAll(): Promise<any[]>;
    abstract findOne(id: string): Promise<any>;
    abstract create(input: CreateAssetInput): Promise<any>;
    abstract update(id: string, input: UpdateAssetInput): Promise<any>;
    abstract delete(id: string): Promise<any>;
}
