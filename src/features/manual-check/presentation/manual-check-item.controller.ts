import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth, ApiConsumes } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ClientCredentialsGuard } from 'src/common/guards/client-credentials.guard';
import { UpdateManualCheckDto } from '../application/dtos/update-manual-check.dto';
import { SetManualCheckStatusDto } from '../application/dtos/set-manual-check-status.dto';
import { UpdateManualCheckUseCase } from '../application/use-cases/update-manual-check.use-case';
import { SetManualCheckStatusUseCase } from '../application/use-cases/set-manual-check-status.use-case';
import { DeleteManualCheckUseCase } from '../application/use-cases/delete-manual-check.use-case';
import { UploadManualCheckEvidenceUseCase } from '../application/use-cases/upload-manual-check-evidence.use-case';
import { ListManualCheckEvidenceUseCase } from '../application/use-cases/list-manual-check-evidence.use-case';
import { DeleteManualCheckEvidenceUseCase } from '../application/use-cases/delete-manual-check-evidence.use-case';
import { MAX_EVIDENCE_FILE_SIZE_BYTES } from '../application/manual-check-evidence.constants';

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'), ClientCredentialsGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@Controller('manual-checks')
export class ManualCheckItemController {
    constructor(
        private readonly updateManualCheckUseCase: UpdateManualCheckUseCase,
        private readonly setManualCheckStatusUseCase: SetManualCheckStatusUseCase,
        private readonly deleteManualCheckUseCase: DeleteManualCheckUseCase,
        private readonly uploadManualCheckEvidenceUseCase: UploadManualCheckEvidenceUseCase,
        private readonly listManualCheckEvidenceUseCase: ListManualCheckEvidenceUseCase,
        private readonly deleteManualCheckEvidenceUseCase: DeleteManualCheckEvidenceUseCase,
    ) {}

    @Patch(':id')
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
    async update(@Param('id') id: string, @Body() body: UpdateManualCheckDto) {
        const data = await this.updateManualCheckUseCase.execute(id, body);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Check manual actualizado', data });
    }

    @Patch(':id/status')
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
    async setStatus(@Req() req: any, @Param('id') id: string, @Body() body: SetManualCheckStatusDto) {
        const data = await this.setManualCheckStatusUseCase.execute(id, body, req.user.id);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Estado del check actualizado', data });
    }

    @Delete(':id')
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
    async remove(@Param('id') id: string) {
        await this.deleteManualCheckUseCase.execute(id);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Check manual eliminado' });
    }

    @Post(':id/evidence')
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_EVIDENCE_FILE_SIZE_BYTES } }))
    async uploadEvidence(
        @Req() req: any,
        @Param('id') id: string,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!file) throw new BadRequestException('No se recibió ningún archivo');
        const data = await this.uploadManualCheckEvidenceUseCase.execute(id, file, req.user.id);
        return new ResponseDto({ statusCode: HttpStatus.CREATED, message: 'Evidencia subida', data });
    }

    @Get(':id/evidence')
    async listEvidence(@Param('id') id: string) {
        const data = await this.listManualCheckEvidenceUseCase.execute(id);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Evidencia obtenida', data });
    }

    @Delete(':id/evidence/:evidenceId')
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
    async removeEvidence(@Param('evidenceId') evidenceId: string) {
        await this.deleteManualCheckEvidenceUseCase.execute(evidenceId);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Evidencia eliminada' });
    }
}
