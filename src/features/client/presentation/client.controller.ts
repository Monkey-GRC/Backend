import { Body, Controller, Get, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';
import { CreateClientDto } from '../application/dtos/create-client.dto';
import { CreateClientUseCase } from '../application/use-cases/create-client.use-case';
import { GetAllClientsUseCase } from '../application/use-cases/get-all-clients.use-case';
import { GetOneClientUseCase } from '../application/use-cases/get-one-client.use-case';
import { RegenerateOnboardingCodeUseCase } from '../application/use-cases/regenerate-onboarding-code.use-case';
import { SetClientActiveUseCase } from '../application/use-cases/set-client-active.use-case';

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.MONKEY_ADMIN)
@Controller('clients')
export class ClientController {
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly getAllClientsUseCase: GetAllClientsUseCase,
    private readonly getOneClientUseCase: GetOneClientUseCase,
    private readonly regenerateOnboardingCodeUseCase: RegenerateOnboardingCodeUseCase,
    private readonly setClientActiveUseCase: SetClientActiveUseCase,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  async create(@Body() dto: CreateClientDto) {
    const result = await this.createClientUseCase.execute(dto);
    return new ResponseDto({
      statusCode: HttpStatus.CREATED,
      message: this.i18n.t('client.CREATED'),
      data: result,
    });
  }

  @Get()
  async findAll() {
    const clients = await this.getAllClientsUseCase.execute();
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: this.i18n.t('client.READ.ALL'),
      data: clients,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const client = await this.getOneClientUseCase.execute(id);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: this.i18n.t('client.READ.ONE'),
      data: client,
    });
  }

  @Post(':id/onboarding-code/regenerate')
  async regenerateOnboardingCode(@Param('id') id: string) {
    const result = await this.regenerateOnboardingCodeUseCase.execute(id);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: this.i18n.t('client.ONBOARDING_CODE_REGENERATED'),
      data: result,
    });
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    const client = await this.setClientActiveUseCase.execute(id, false);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: this.i18n.t('client.DEACTIVATED'),
      data: client,
    });
  }

  @Patch(':id/reactivate')
  async reactivate(@Param('id') id: string) {
    const client = await this.setClientActiveUseCase.execute(id, true);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: this.i18n.t('client.REACTIVATED'),
      data: client,
    });
  }
}
