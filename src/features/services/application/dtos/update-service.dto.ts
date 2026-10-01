import { PartialType } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';

// PATCH /v1/services/{id}: las mismas claves que al crear, todas opcionales; solo se aplican las
// que vienen. Cambiar `trust_criteria` o `framework_codes` recalcula los requisitos aplicables.
export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
