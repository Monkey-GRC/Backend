import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
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
  client_id: true,
  client: { select: { id: true, name: true, tax_id: true } },
  is_active: true,
  created_at: true,
  updated_at: true,
};

@Injectable()
export class UserPrismaRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
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
        role: input.role,
        client: input.client_id ? { connect: { id: input.client_id } } : undefined,
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
    if (input.role !== undefined) updateData['role'] = input.role;
    if (input.is_active !== undefined) updateData['is_active'] = input.is_active;
    if (input.client_id !== undefined) {
      updateData['client'] = input.client_id
        ? { connect: { id: input.client_id } }
        : { disconnect: true };
    }

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
