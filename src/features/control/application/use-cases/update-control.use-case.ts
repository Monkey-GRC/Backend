import { Injectable } from '@nestjs/common';
import { ControlRepository } from '../../domain/repositories/control.repository';
import { UpdateControlDto } from '../dtos/update-control.dto';

@Injectable()
export class UpdateControlUseCase {
    constructor(private readonly controlRepository: ControlRepository) { }

    execute(id: string, dto: UpdateControlDto, userId: string) {
        return this.controlRepository.update(id, {
            name: dto.name,
            description: dto.description,
            objective: dto.objective,
            type: dto.type,
            userId,
        });
    }
}
