import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.model';
import { UserCreate, UserSignin } from './dto';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('data') dto: UserCreate) {
    return this.userService.createUser(dto);
  }

  @Mutation(() => User)
  signinUser(@Args('data') dto: UserSignin) {
    return this.userService.signinUser(dto);
  }
}
