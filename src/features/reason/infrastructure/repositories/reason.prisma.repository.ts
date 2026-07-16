// src/features/reason/infrastructure/repositories/reason.prisma.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { obfuscateSeq } from 'src/common/utils/obfuscate-code';
import {
  ReasonRepository,
  CreateReasonInput,
  UpdateReasonInput,
} from '../../domain/repositories/reason.repository';

@Injectable()
export class ReasonPrismaRepository extends ReasonRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findAll() {
    return this.prisma.reason.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        created_by_user: {
          select: {
            id: true,
            name: true,
            last_name: true,
            role: true,
            username: true,
          },
        },
        updated_by_user: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async create(input: CreateReasonInput) {
    return this.prisma.$transaction(async (tx) => {
      const reason = await tx.reason.create({
        data: {
          name: input.name,
          description: input.description,
          code: 'PENDING',
          created_by_user: { connect: { id: input.userId } },
        },
      });

      const code = `RSN-${obfuscateSeq(reason.seq)}`;

      return tx.reason.update({
        where: { id: reason.id },
        data: { code },
      });
    });
  }

  async update(id: string, input: UpdateReasonInput) {
    const updateData: Record<string, any> = {};

    if (input.name !== undefined) updateData['name'] = input.name;
    if (input.description !== undefined)
      updateData['description'] = input.description;
    updateData['updated_by_user'] = { connect: { id: input.userId } };

    return this.prisma.reason.update({ where: { id }, data: updateData });
  }

  delete(id: string) {
    return this.prisma.reason.delete({ where: { id } });
  }
}
