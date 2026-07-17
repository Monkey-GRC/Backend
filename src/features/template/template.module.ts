import { Module } from "@nestjs/common";
import { TemplateController } from "./presentation/template.controller";
import { TemplateRepository } from "./domain/repositories/template.repository";
import { TemplatePrismaRepository } from "./infrastructure/repositories/template.prisma.repository";
import { CreateTemplateUseCase } from "./application/use-cases/create-template.use-case";
import { GetAllTemplatesUseCase } from "./application/use-cases/get-all-templates.use-case";
import { GetOneTemplateUseCase } from "./application/use-cases/get-one-template.use-case";
import { UpdateTemplateUseCase } from "./application/use-cases/update-template.use-case";
import { DeleteTemplateUseCase } from "./application/use-cases/delete-template.use-case";

@Module({
    controllers: [TemplateController],
    providers: [
        {
            provide: TemplateRepository,
            useClass: TemplatePrismaRepository,
        },
        CreateTemplateUseCase,
        GetAllTemplatesUseCase,
        GetOneTemplateUseCase,
        UpdateTemplateUseCase,
        DeleteTemplateUseCase,
    ],
})
export class TemplateModule { }
