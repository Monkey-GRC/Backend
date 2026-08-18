import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ManualCheckRepository } from '../../domain/repositories/manual-check.repository';
import { CreateManualCheckDto } from '../dtos/create-manual-check.dto';

@Injectable()
export class CreateManualCheckUseCase {
    constructor(private readonly manualCheckRepository: ManualCheckRepository) {}

    async execute(controlId: string, dto: CreateManualCheckDto, userId: string) {
        const control = await this.manualCheckRepository.findControlType(controlId);
        if (!control) throw new NotFoundException('Control no encontrado');
        if (control.type === 'AUTOMATIC') {
            throw new BadRequestException(
                'Un control automático no admite checks manuales — sus checks vienen del catálogo CIS.',
            );
        }

        return this.manualCheckRepository.create({
            controlId,
            title: dto.title,
            description: dto.description,
            remediation: dto.remediation,
            userId,
        });
    }
}
