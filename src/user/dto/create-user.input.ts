import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  age: number;

  @Field(() => String, { nullable: true })
  bio?: string;
}
