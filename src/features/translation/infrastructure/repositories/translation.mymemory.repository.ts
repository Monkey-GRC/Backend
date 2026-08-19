import { Injectable, Logger } from '@nestjs/common';
import { TranslationRepository, TranslationTargetLang } from '../../domain/repositories/translation.repository';

@Injectable()
export class TranslationMyMemoryRepository extends TranslationRepository {
    private readonly logger = new Logger(TranslationMyMemoryRepository.name);
    private readonly baseUrl = 'https://api.mymemory.translated.net/get';
    private readonly maxChunkLength = 450;
    private readonly cache = new Map<string, string>();

    async translate(text: string, targetLang: TranslationTargetLang): Promise<string> {
        const sourceLang = targetLang === 'es' ? 'en' : 'es';
        const cacheKey = `${sourceLang}|${targetLang}|${text}`;

        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const chunks = this.splitIntoChunks(text);
        const translatedChunks = await Promise.all(
            chunks.map((chunk) => this.translateChunk(chunk, sourceLang, targetLang)),
        );
        const result = translatedChunks.join(' ');

        this.cache.set(cacheKey, result);
        return result;
    }

    private async translateChunk(chunk: string, sourceLang: string, targetLang: string): Promise<string> {
        const url = `${this.baseUrl}?q=${encodeURIComponent(chunk)}&langpair=${sourceLang}|${targetLang}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`MyMemory respondio ${response.status}`);
            }
            const data = await response.json();
            const translated = data?.responseData?.translatedText;
            if (!translated) {
                throw new Error('MyMemory no devolvio texto traducido');
            }
            return translated;
        } catch (error) {
            this.logger.warn(`No se pudo traducir un fragmento, se deja el original: ${(error as Error).message}`);
            return chunk;
        }
    }

    private splitIntoChunks(text: string): string[] {
        if (text.length <= this.maxChunkLength) {
            return [text];
        }

        const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text];
        const chunks: string[] = [];
        let current = '';

        for (const sentence of sentences) {
            if ((current + sentence).length > this.maxChunkLength && current) {
                chunks.push(current.trim());
                current = '';
            }
            current += sentence;
        }
        if (current.trim()) {
            chunks.push(current.trim());
        }

        return chunks;
    }
}
