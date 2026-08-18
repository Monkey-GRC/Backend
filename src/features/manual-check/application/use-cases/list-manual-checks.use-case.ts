import { Injectable, NotFoundException } from '@nestjs/common';
import { ManualCheckRepository } from '../../domain/repositories/manual-check.repository';

@Injectable()
export class ListManualChecksUseCase {
    constructor(private readonly manualCheckRepository: ManualCheckRepository) {}

    async execute(controlId: string) {
        const control = await this.manualCheckRepository.findControlType(controlId);
        if (!control) throw new NotFoundException('Control no encontrado');
        return this.manualCheckRepository.findAllByControl(controlId);
    }
}
