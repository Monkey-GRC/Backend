import { Injectable, NotFoundException } from '@nestjs/common';
import { ManualCheckRepository } from '../../domain/repositories/manual-check.repository';
import { UpdateManualCheckDto } from '../dtos/update-manual-check.dto';

@Injectable()
export class UpdateManualCheckUseCase {
    constructor(private readonly manualCheckRepository: ManualCheckRepository) {}

    async execute(id: string, dto: UpdateManualCheckDto) {
        const existing = await this.manualCheckRepository.findOne(id);
        if (!existing) throw new NotFoundException('Check manual no encontrado');
        return this.manualCheckRepository.update(id, dto);
    }
}
