import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserCreate {
  @Field()
  readonly name!: string;

  @Field()
  readonly password!: string;
}
