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
import { CreateReasonUseCase } from '../application/use-case/create-reason.use-case';
import { GetAllReasonsUseCase } from '../application/use-case/get-all-reasons.use-case';
import { UpdateReasonUseCase } from '../application/use-case/update-reason.use-case';
import { DeleteReasonUseCase } from '../application/use-case/delete-reason.use-case';

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reasons')
export class ReasonController {
  constructor(
    private readonly createReasonUseCase: CreateReasonUseCase,
    private readonly getAllReasonsUseCase: GetAllReasonsUseCase,
    private readonly updateReasonUseCase: UpdateReasonUseCase,
    private readonly deleteReasonUseCase: DeleteReasonUseCase,
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
}
