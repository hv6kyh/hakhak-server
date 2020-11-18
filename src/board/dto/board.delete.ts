import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class BoardDelete {
  @Field(() => Int)
  readonly id!: number;
}
