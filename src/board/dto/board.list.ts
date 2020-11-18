import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class BoardList {
  @Field({ nullable: true })
  readonly title?: string;

  @Field({ nullable: true })
  readonly content?: string;

  @Field({ nullable: true })
  readonly author?: string;

  @Field(() => Int, { nullable: true })
  readonly page?: number;

  @Field(() => Int, { nullable: true })
  readonly size?: number;
}
