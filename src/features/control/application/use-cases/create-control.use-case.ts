import { Injectable } from '@nestjs/common';
import { ControlRepository } from '../../domain/repositories/control.repository';
import { CreateControlDto } from '../dtos/create-control.dto';

@Injectable()
export class CreateControlUseCase {
    constructor(private readonly controlRepository: ControlRepository) { }

    execute(dto: CreateControlDto, userId: string) {
        return this.controlRepository.create({
            name: dto.name,
            description: dto.description,
            objective: dto.objective,
            type: dto.type,
            os: dto.os,
            checklist: dto.checklist,
            userId,
        });
    }
}
