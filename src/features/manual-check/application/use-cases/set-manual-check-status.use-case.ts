import { Injectable, NotFoundException } from '@nestjs/common';
import { ManualCheckRepository } from '../../domain/repositories/manual-check.repository';
import { SetManualCheckStatusDto } from '../dtos/set-manual-check-status.dto';

@Injectable()
export class SetManualCheckStatusUseCase {
    constructor(private readonly manualCheckRepository: ManualCheckRepository) {}

    async execute(id: string, dto: SetManualCheckStatusDto, userId: string) {
        const existing = await this.manualCheckRepository.findOne(id);
        if (!existing) throw new NotFoundException('Check manual no encontrado');
        return this.manualCheckRepository.setStatus(id, { status: dto.status, notes: dto.notes, userId });
    }
}
