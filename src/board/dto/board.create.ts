import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class BoardCreate {
  @Field()
  readonly title!: string;

  @Field()
  readonly content!: string;
}
