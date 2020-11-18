import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class BoardUpdate {
  @Field(() => Int)
  readonly id!: number;

  @Field({ nullable: true })
  readonly title?: string;

  @Field({ nullable: true })
  readonly content?: string;
}
