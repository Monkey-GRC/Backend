import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { CreateReasonDto } from '../application/dtos/create-reason.dto';
import { UpdateReasonDto } from '../application/dtos/update-reason.dto';
import { AttachRisksDto } from '../application/dtos/attach-risks.dto';
import { AttachControlsDto } from '../application/dtos/attach-controls.dto';
import { CreateReasonUseCase } from '../application/use-case/create-reason.use-case';
import { GetAllReasonsUseCase } from '../application/use-case/get-all-reasons.use-case';
import { GetOneReasonUseCase } from '../application/use-case/get-one-reason.use-case';
import { UpdateReasonUseCase } from '../application/use-case/update-reason.use-case';
import { DeleteReasonUseCase } from '../application/use-case/delete-reason.use-case';
import { AttachRisksToReasonUseCase } from '../application/use-case/attach-risks-to-reason.use-case';
import { DetachRiskFromReasonUseCase } from '../application/use-case/detach-risk-from-reason.use-case';
import { AttachControlsToReasonUseCase } from '../application/use-case/attach-controls-to-reason.use-case';
import { DetachControlFromReasonUseCase } from '../application/use-case/detach-control-from-reason.use-case';

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reasons')
export class ReasonController {
  constructor(
    private readonly createReasonUseCase: CreateReasonUseCase,
    private readonly getAllReasonsUseCase: GetAllReasonsUseCase,
    private readonly getOneReasonUseCase: GetOneReasonUseCase,
    private readonly updateReasonUseCase: UpdateReasonUseCase,
    private readonly deleteReasonUseCase: DeleteReasonUseCase,
    private readonly attachRisksToReasonUseCase: AttachRisksToReasonUseCase,
    private readonly detachRiskFromReasonUseCase: DetachRiskFromReasonUseCase,
    private readonly attachControlsToReasonUseCase: AttachControlsToReasonUseCase,
    private readonly detachControlFromReasonUseCase: DetachControlFromReasonUseCase,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  async createReason(@Req() req: any, @Body() body: CreateReasonDto) {
    try {
      await this.createReasonUseCase.execute(body, req.user.id);
      return new ResponseDto({
        statusCode: HttpStatus.CREATED,
        message: this.i18n.t('reason.CREATED'),
      });
    } catch (error) {
      console.error('Error creating reason:', error);
      throw new HttpException(
        this.i18n.t('reason.CREATE_FAILED'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllReasons() {
    try {
      const reasons = await this.getAllReasonsUseCase.execute();
      return new ResponseDto({
        statusCode: HttpStatus.OK,
        message: this.i18n.t('reason.READ.ALL'),
        data: reasons,
      });
    } catch (error) {
      console.error('Error fetching reasons:', error);
      throw new HttpException(
        this.i18n.t('reason.READ_FAILED'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOneReason(@Param('id') id: string) {
    try {
      const reason = await this.getOneReasonUseCase.execute(id);
      return new ResponseDto({
        statusCode: HttpStatus.OK,
        message: this.i18n.t('reason.READ.ONE'),
        data: reason,
      });
    } catch (error) {
      console.error('Error fetching reason:', error);
      throw new HttpException(
        this.i18n.t('reason.NOT_FOUND'),
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch(':id')
  async updateReason(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateReasonDto,
  ) {
    try {
      await this.updateReasonUseCase.execute(id, body, req.user.id);
      return new ResponseDto({
        statusCode: HttpStatus.OK,
        message: this.i18n.t('reason.UPDATED'),
      });
    } catch (error) {
      console.error('Error updating reason:', error);
      throw new HttpException(
        this.i18n.t('reason.UPDATE_FAILED'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteReason(@Param('id') id: string) {
    try {
      await this.deleteReasonUseCase.execute(id);
      return new ResponseDto({
        statusCode: HttpStatus.OK,
        message: this.i18n.t('reason.DELETED'),
      });
    } catch (error) {
      console.error('Error deleting reason:', error);
      throw new HttpException(
        this.i18n.t('reason.DELETE_FAILED'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/risks')
  async attachRisks(@Param('id') id: string, @Body() body: AttachRisksDto) {
    try {
      await this.attachRisksToReasonUseCase.execute(id, body);
      return new ResponseDto({
        statusCode: HttpStatus.OK,
        message: this.i18n.t('reason.ATTACHED'),
      });
    } catch (error) {
      console.error('Error attaching risks to reason:', error);
      throw new HttpException(
        this.i18n.t('reason.ATTACH_FAILED'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id/risks/:riskId')
  async detachRisk(@Param('id') id: string, @Param('riskId') riskId: string) {
    try {
      await this.detachRiskFromReasonUseCase.execute(id, riskId);
      return new ResponseDto({
        statusCode: HttpStatus.OK,
        message: this.i18n.t('reason.DETACHED'),
      });
    } catch (error) {
      console.error('Error detaching risk from reason:', error);
      throw new HttpException(
        this.i18n.t('reason.DETACH_FAILED'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/controls')
  async attachControls(@Param('id') id: string, @Body() body: AttachControlsDto) {
    try {
      await this.attachControlsToReasonUseCase.execute(id, body);
      return new ResponseDto({
        statusCode: HttpStatus.OK,
        message: this.i18n.t('reason.ATTACHED'),
      });
    } catch (error) {
      console.error('Error attaching controls to reason:', error);
      throw new HttpException(
        this.i18n.t('reason.ATTACH_FAILED'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id/controls/:controlId')
  async detachControl(@Param('id') id: string, @Param('controlId') controlId: string) {
    try {
      await this.detachControlFromReasonUseCase.execute(id, controlId);
      return new ResponseDto({
        statusCode: HttpStatus.OK,
        message: this.i18n.t('reason.DETACHED'),
      });
    } catch (error) {
      console.error('Error detaching control from reason:', error);
      throw new HttpException(
        this.i18n.t('reason.DETACH_FAILED'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
