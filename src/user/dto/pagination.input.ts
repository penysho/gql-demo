import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
  @Field(() => Int, {
    nullable: true,
    description: 'コレクションから取得する要素数の上限',
  })
  first?: number;

  @Field(() => String, {
    nullable: true,
    description: 'この要素の後から取得を開始するカーソル',
  })
  after?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'コレクションの末尾から取得する要素数の上限',
  })
  last?: number;

  @Field(() => String, {
    nullable: true,
    description: 'この要素の前から取得を開始するカーソル',
  })
  before?: string;
}
