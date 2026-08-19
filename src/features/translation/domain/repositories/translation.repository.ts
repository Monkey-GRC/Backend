export type TranslationTargetLang = 'es' | 'en';

export abstract class TranslationRepository {
    abstract translate(text: string, targetLang: TranslationTargetLang): Promise<string>;
}
