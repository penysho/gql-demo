import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../user.entity';

@ObjectType()
export class PageInfo {
  @Field(() => Boolean, { description: '次のページが存在するかどうか' })
  hasNextPage: boolean;

  @Field(() => Boolean, { description: '前のページが存在するかどうか' })
  hasPreviousPage: boolean;

  @Field(() => String, { nullable: true, description: '最初の要素のカーソル' })
  startCursor?: string;

  @Field(() => String, { nullable: true, description: '最後の要素のカーソル' })
  endCursor?: string;
}

@ObjectType()
export class UserEdge {
  @Field(() => User, { description: 'ノード' })
  node: User;

  @Field(() => String, { description: 'カーソル' })
  cursor: string;
}

@ObjectType()
export class UserConnection {
  @Field(() => [UserEdge], { description: 'エッジの配列' })
  edges: UserEdge[];

  @Field(() => PageInfo, { description: 'ページング情報' })
  pageInfo: PageInfo;

  @Field(() => Number, { description: '総数' })
  totalCount: number;
}
