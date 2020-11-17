import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserSignin {
  @Field()
  readonly name!: string;

  @Field()
  readonly password!: string;
}
