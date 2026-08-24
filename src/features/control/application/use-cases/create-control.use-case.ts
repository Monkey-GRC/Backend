import { Injectable } from '@nestjs/common';
import { CisCheckRepository } from 'src/features/checklist/domain/repositories/cis-check.repository';
import {
  ControlChecklistItemInput,
  ControlRepository,
} from '../../domain/repositories/control.repository';
import { CreateControlDto } from '../dtos/create-control.dto';

@Injectable()
export class CreateControlUseCase {
  constructor(
    private readonly controlRepository: ControlRepository,
    private readonly cisCheckRepository: CisCheckRepository,
  ) {}

  async execute(dto: CreateControlDto, userId: string) {
    const checklist = await this.enrichChecklist(dto);

    return this.controlRepository.create({
      name: dto.name,
      description: dto.description,
      objective: dto.objective,
      type: dto.type,
      os: dto.os,
      checklist,
      userId,
    });
  }

  private async enrichChecklist(
    dto: CreateControlDto,
  ): Promise<ControlChecklistItemInput[] | undefined> {
    if (!dto.checklist?.length || !dto.os) {
      return dto.checklist;
    }

    const checkIds = dto.checklist.map((item) => item.checkId);
    const catalogItems = await this.cisCheckRepository.findByCheckIds(
      dto.os,
      checkIds,
    );
    const catalogByCheckId = new Map(
      catalogItems.map((item) => [item.checkId, item]),
    );

    return dto.checklist.map((item) => {
      const catalogItem = catalogByCheckId.get(item.checkId);
      return {
        checkId: item.checkId,
        title: item.title,
        soc2Code: catalogItem?.soc2Code ?? null,
        cisCode: catalogItem?.cisCode ?? null,
        pciDssCode: catalogItem?.pciDssCode ?? null,
        soc2CodeInferred: catalogItem?.soc2CodeInferred ?? null,
        soc2MappingSource: catalogItem?.soc2MappingSource ?? null,
        soc2MappingConfidence: catalogItem?.soc2MappingConfidence ?? null,
        soc2MappingCitation: catalogItem?.soc2MappingCitation ?? null,
      };
    });
  }
}
