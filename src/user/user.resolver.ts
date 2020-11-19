import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.model';
import { UserCreate, UserSignin, UserPayload } from './dto';
import { JwtAuthGuard } from '../shared/auth/jwt.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from './decorators';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('data') dto: UserCreate) {
    return this.userService.createUser(dto);
  }

  @Mutation(() => String)
  signinUser(@Args('data') dto: UserSignin) {
    return this.userService.signinUser(dto);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  deleteUser(@CurrentUser() user: UserPayload) {
    return this.userService.deleteUser(user.id);
  }
}
