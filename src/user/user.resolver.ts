import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from './dto/create-user.input';
import { PaginationInput } from './dto/pagination.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserConnection } from './dto/user-connection.type';
import { User } from './user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User], {
    name: 'users',
    description:
      '全てのユーザーを取得します（非推奨: ページングを使用してください）',
  })
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => UserConnection, {
    name: 'usersConnection',
    description: 'ページング対応でユーザーを取得します',
  })
  async findAllPaginated(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
  ): Promise<UserConnection> {
    return this.userService.findAllPaginated(pagination);
  }

  @Query(() => User, {
    name: 'user',
    description: '指定されたIDのユーザーを取得します',
  })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Mutation(() => User, {
    name: 'createUser',
    description: '新しいユーザーを作成します',
  })
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.userService.create(createUserInput);
  }

  @Mutation(() => User, {
    name: 'updateUser',
    description: 'ユーザー情報を更新します',
  })
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    const { id, ...updateData } = updateUserInput;
    return this.userService.update(id, updateData);
  }

  @Mutation(() => Boolean, {
    name: 'removeUser',
    description: 'ユーザーを削除します',
  })
  async removeUser(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.userService.remove(id);
  }
}
