// src/features/user/user.module.ts

import { Module } from '@nestjs/common';
import { UserController } from './presentation/user.controller';
import { UserRepository } from './domain/repositories/user.repository';
import { UserPrismaRepository } from './infrastructure/repositories/user.prisma.repository';
import { CreateUserUseCase } from './application/use-case/create-user.use-case';
import { GetAllUsersUseCase } from './application/use-case/get-all-users.use-case';
import { GetOneUserUseCase } from './application/use-case/get-one-user.use-case';
import { UpdateUserUseCase } from './application/use-case/update-user.use-case';
import { DeleteUserUseCase } from './application/use-case/delete-user.use-case';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: UserRepository,
      useClass: UserPrismaRepository,
    },
    CreateUserUseCase,
    GetAllUsersUseCase,
    GetOneUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
})
export class UserModule {}
