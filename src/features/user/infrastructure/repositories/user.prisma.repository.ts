import { Injectable } from '@nestjs/common';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import {
  UserRepository,
  CreateUserInput,
  UpdateUserInput,
} from '../../domain/repositories/user.repository';

const USER_SELECT = {
  id: true,
  email: true,
  username: true,
  name: true,
  last_name: true,
  role: true,
  is_active: true,
  created_at: true,
  updated_at: true,
};

@Injectable()
export class UserPrismaRepository extends UserRepository {
  constructor(private readonly prisma: CentralPrismaService) {
    super();
  }

  findAll() {
    return this.prisma.user.findMany({ select: USER_SELECT });
  }

  findOne(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: USER_SELECT,
    });
  }

  create(input: CreateUserInput) {
    return this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        username: input.username,
        password: input.password,
        name: input.name,
        last_name: input.last_name,
      },
      select: USER_SELECT,
    });
  }

  update(id: string, input: UpdateUserInput) {
    const updateData: Record<string, any> = {};

    if (input.email !== undefined) updateData['email'] = input.email.toLowerCase();
    if (input.username !== undefined) updateData['username'] = input.username;
    if (input.password !== undefined) updateData['password'] = input.password;
    if (input.name !== undefined) updateData['name'] = input.name;
    if (input.last_name !== undefined) updateData['last_name'] = input.last_name;
    if (input.is_active !== undefined) updateData['is_active'] = input.is_active;

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SELECT,
    });
  }

  delete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { is_active: false },
      select: USER_SELECT,
    });
  }
}
