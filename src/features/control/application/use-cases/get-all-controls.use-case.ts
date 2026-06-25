import { Injectable } from '@nestjs/common';
import { ControlRepository } from '../../domain/repositories/control.repository';

@Injectable()
export class GetAllControlsUseCase {
    constructor(private readonly controlRepository: ControlRepository) { }

    execute() {
        return this.controlRepository.findAll();
    }
}
