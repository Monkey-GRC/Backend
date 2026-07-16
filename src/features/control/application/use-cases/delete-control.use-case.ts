import { Injectable } from '@nestjs/common';
import { ControlRepository } from '../../domain/repositories/control.repository';

@Injectable()
export class DeleteControlUseCase {
    constructor(private readonly controlRepository: ControlRepository) { }

    execute(id: string) {
        return this.controlRepository.delete(id);
    }
}
