import { Module } from '@nestjs/common';
import { TranslationController } from './presentation/translation.controller';
import { TranslationRepository } from './domain/repositories/translation.repository';
import { TranslationMyMemoryRepository } from './infrastructure/repositories/translation.mymemory.repository';
import { TranslateTextUseCase } from './application/use-cases/translate-text.use-case';

@Module({
    controllers: [TranslationController],
    providers: [
        {
            provide: TranslationRepository,
            useClass: TranslationMyMemoryRepository,
        },
        TranslateTextUseCase,
    ],
})
export class TranslationModule { }
