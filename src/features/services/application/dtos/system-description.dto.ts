import { SystemDescriptionDto } from './create-service.dto';

// POST /v1/services/{id}/system-description: el mismo objeto que viaja dentro del servicio.
export class SetSystemDescriptionDto extends SystemDescriptionDto {}
