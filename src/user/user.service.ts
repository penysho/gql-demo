import { Injectable, NotFoundException } from '@nestjs/common';
import { User as PrismaUser } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private mapPrismaUserToGraphQLUser(prismaUser: PrismaUser): User {
    return {
      ...prismaUser,
      bio: prismaUser.bio ?? undefined,
    };
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return users.map((user) => this.mapPrismaUserToGraphQLUser(user));
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapPrismaUserToGraphQLUser(user);
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        ...createUserInput,
        bio: createUserInput.bio ?? null,
      },
    });
    return this.mapPrismaUserToGraphQLUser(user);
  }

  async update(
    id: string,
    updateData: Partial<CreateUserInput>,
  ): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...updateData,
          bio:
            updateData.bio !== undefined ? (updateData.bio ?? null) : undefined,
        },
      });
      return this.mapPrismaUserToGraphQLUser(user);
    } catch {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
