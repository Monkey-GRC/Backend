import { Injectable } from '@nestjs/common';
import { TranslationRepository } from '../../domain/repositories/translation.repository';
import { TranslateTextDto } from '../dtos/translate-text.dto';

@Injectable()
export class TranslateTextUseCase {
    constructor(private readonly translationRepository: TranslationRepository) { }

    execute(dto: TranslateTextDto) {
        return this.translationRepository.translate(dto.text, dto.targetLang);
    }
}
