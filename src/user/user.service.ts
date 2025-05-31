import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User as PrismaUser } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import { PaginationInput } from './dto/pagination.input';
import { PageInfo, UserConnection, UserEdge } from './dto/user-connection.type';
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

  // カーソルをエンコード/デコードするヘルパー関数
  private encodeCursor(date: Date, id: string): string {
    return Buffer.from(`${date.toISOString()}:${id}`).toString('base64');
  }

  private decodeCursor(cursor: string): { date: Date; id: string } {
    const decoded = Buffer.from(cursor, 'base64').toString('ascii');
    const [dateStr, id] = decoded.split(':');
    return { date: new Date(dateStr), id };
  }

  async findAllPaginated(
    pagination: PaginationInput = {},
  ): Promise<UserConnection> {
    const { first = 10, after, last, before } = pagination;

    // ページサイズを制限
    const limit = Math.min(first || last || 10, 100);

    let whereClause: Prisma.UserWhereInput = {};
    let orderBy: Prisma.UserOrderByWithRelationInput[] = [
      { createdAt: 'desc' },
      { id: 'desc' },
    ];

    // afterカーソルが指定された場合
    if (after) {
      const { date, id } = this.decodeCursor(after);
      whereClause = {
        OR: [{ createdAt: { lt: date } }, { createdAt: date, id: { lt: id } }],
      };
    }

    // beforeカーソルが指定された場合
    if (before) {
      const { date, id } = this.decodeCursor(before);
      whereClause = {
        OR: [{ createdAt: { gt: date } }, { createdAt: date, id: { gt: id } }],
      };
      orderBy = [{ createdAt: 'asc' }, { id: 'asc' }];
    }

    // 1つ多く取得してhasNextPage/hasPreviousPageを判定
    const users = await this.prisma.user.findMany({
      where: whereClause,
      orderBy,
      take: limit + 1,
    });

    // 総数を取得
    const totalCount = await this.prisma.user.count();

    // beforeの場合は結果を逆順にする
    if (before) {
      users.reverse();
    }

    // hasNextPage/hasPreviousPageの判定
    const hasNextPage = first ? users.length > limit : false;
    const hasPreviousPage = after || before ? true : false;

    // 実際に返すユーザー（1つ多く取得した分を除く）
    const resultUsers = users.slice(0, limit);

    // エッジを作成
    const edges: UserEdge[] = resultUsers.map((user) => ({
      node: this.mapPrismaUserToGraphQLUser(user),
      cursor: this.encodeCursor(user.createdAt, user.id),
    }));

    // PageInfoを作成
    const pageInfo: PageInfo = {
      hasNextPage,
      hasPreviousPage,
      startCursor: edges.length > 0 ? edges[0].cursor : undefined,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
    };

    return {
      edges,
      pageInfo,
      totalCount,
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
