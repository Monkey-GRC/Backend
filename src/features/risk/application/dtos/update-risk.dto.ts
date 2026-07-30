import { ApiPropertyOptional, OmitType, PartialType } from "@nestjs/swagger";
import { IsOptional, IsUUID, ValidateIf } from "class-validator";
import { CreateRiskDto } from "./create-risk.dto";

export class UpdateRiskDto extends PartialType(
    OmitType(CreateRiskDto, ['templateId'] as const),
) {
    @ApiPropertyOptional({
        description: 'ID del template al que pertenece este riesgo. Enviar null para desvincularlo.',
        nullable: true,
    })
    @IsOptional()
    @ValidateIf((_, value) => value !== null)
    @IsUUID()
    templateId?: string | null;
}
