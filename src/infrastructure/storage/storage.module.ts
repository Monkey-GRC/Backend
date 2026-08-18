import { Module } from '@nestjs/common';
import { StorageRepository } from './storage.repository';
import { S3StorageService } from './s3-storage.service';

@Module({
    providers: [{ provide: StorageRepository, useClass: S3StorageService }],
    exports: [StorageRepository],
})
export class StorageModule {}
