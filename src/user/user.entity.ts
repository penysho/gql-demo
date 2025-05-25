import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  age: number;

  @Field({ nullable: true })
  bio?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
