import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.model';
import { UserCreate, UserSignin } from './dto';
import { JwtAuthGuard } from '../shared/auth/jwt.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from './decorators/user.decorator';

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

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  getUser(@CurrentUser() user: User) {
    return user;
  }
}
