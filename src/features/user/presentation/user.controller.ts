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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { Prisma } from 'generated/prisma-central/client';
import { Role } from 'src/common/enums/role.enum';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateUserDto } from '../application/dtos/create-user.dto';
import { UpdateUserDto } from '../application/dtos/update-user.dto';
import { CreateUserUseCase } from '../application/use-case/create-user.use-case';
import { GetAllUsersUseCase } from '../application/use-case/get-all-users.use-case';
import { GetOneUserUseCase } from '../application/use-case/get-one-user.use-case';
import { UpdateUserUseCase } from '../application/use-case/update-user.use-case';
import { DeleteUserUseCase } from '../application/use-case/delete-user.use-case';

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.MONKEY_ADMIN)
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getOneUserUseCase: GetOneUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  async createUser(@Body() body: CreateUserDto) {
    try {
      const user = await this.createUserUseCase.execute(body);
      return new ResponseDto({
        statusCode: HttpStatus.CREATED,
        message: this.i18n.t('user.CREATED'),
        data: user,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new HttpException(this.i18n.t('user.DUPLICATE'), HttpStatus.CONFLICT);
      }
      console.error('Error creating user:', error);
      throw new HttpException(
        this.i18n.t('user.CREATE_FAILED'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllUsers() {
    try {
      const users = await this.getAllUsersUseCase.execute();
      return new ResponseDto({
        statusCode: HttpStatus.OK,
        message: this.i18n.t('user.READ.ALL'),
        data: users,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new HttpException(
        this.i18n.t('user.READ_FAILED'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOneUser(@Param('id') id: string) {
    try {
      const user = await this.getOneUserUseCase.execute(id);
      return new ResponseDto({
        statusCode: HttpStatus.OK,
        message: this.i18n.t('user.READ.ONE'),
        data: user,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new HttpException(this.i18n.t('user.NOT_FOUND'), HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    try {
      const user = await this.updateUserUseCase.execute(id, body);
      return new ResponseDto({
        statusCode: HttpStatus.OK,
        message: this.i18n.t('user.UPDATED'),
        data: user,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new HttpException(this.i18n.t('user.DUPLICATE'), HttpStatus.CONFLICT);
      }
      console.error('Error updating user:', error);
      throw new HttpException(
        this.i18n.t('user.UPDATE_FAILED'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    try {
      await this.deleteUserUseCase.execute(id);
      return new ResponseDto({
        statusCode: HttpStatus.OK,
        message: this.i18n.t('user.DELETED'),
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new HttpException(
        this.i18n.t('user.DELETE_FAILED'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
