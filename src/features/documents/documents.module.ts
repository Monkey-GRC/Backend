import { Module } from '@nestjs/common';
import { EvaluationParametersModule } from '../../infrastructure/evaluation-parameters/evaluation-parameters.module';
import { AcceptDocumentUseCase } from './application/use-cases/accept-document.use-case';
import { AssignDocumentUseCase, UnassignDocumentUseCase } from './application/use-cases/document-assignment.use-cases';
import { GetDocumentUseCase, ListDocumentsUseCase, ListMyDocumentsUseCase } from './application/use-cases/document-read.use-cases';
import { GetDocumentFileUseCase } from './application/use-cases/download-document-file.use-case';
import { ImportDocumentVersionUseCase } from './application/use-cases/import-document-version.use-case';
import { DocumentRepository } from './domain/repositories/document.repository';
import { DocumentPrismaRepository } from './infrastructure/repositories/document.prisma.repository';
import { DocumentsController } from './presentation/documents.controller';
import { MyDocumentsController } from './presentation/my-documents.controller';

// Documentos de la empresa (corte mínimo de MD-503, D152). El plazo para aceptar (PR-14) llega por el puerto de parámetros de evaluación, sin importar el interior de `compliance`.
@Module({
  imports: [EvaluationParametersModule],
  controllers: [DocumentsController, MyDocumentsController],
  providers: [
    { provide: DocumentRepository, useClass: DocumentPrismaRepository },
    ListDocumentsUseCase,
    GetDocumentUseCase,
    ListMyDocumentsUseCase,
    ImportDocumentVersionUseCase,
    GetDocumentFileUseCase,
    AssignDocumentUseCase,
    UnassignDocumentUseCase,
    AcceptDocumentUseCase,
  ],
})
export class DocumentsModule {}
