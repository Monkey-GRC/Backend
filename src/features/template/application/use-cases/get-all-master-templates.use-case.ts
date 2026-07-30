import { Injectable } from '@nestjs/common';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';

@Injectable()
export class GetAllMasterTemplatesUseCase {
  constructor(private readonly centralPrisma: CentralPrismaService) {}

  execute() {
    return this.centralPrisma.template.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        objective: true,
        scope: true,
        slug: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { seq: 'asc' },
    });
  }
}
