import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { Board } from './board.model';
import { BoardService } from './board.service';
import { JwtAuthGuard } from '../shared/auth/jwt.guard';
import { UseGuards } from '@nestjs/common';
import { BoardCreate, BoardList } from './dto';
import { CurrentUser } from '../user/decorators/user.decorator';
import { UserPayload } from '../user/dto';

@Resolver()
export class BoardResolver {
  constructor(private readonly boardService: BoardService) {}

  @Mutation(() => Board)
  @UseGuards(JwtAuthGuard)
  createBoard(
    @Args('data') dto: BoardCreate,
    @CurrentUser() user: UserPayload,
  ) {
    return this.boardService.createBoard(dto, user.id);
  }

  @Query(() => [Board])
  getBoards(@Args('data', { nullable: true }) dto: BoardList) {
    return this.boardService.getBoards(dto);
  }
}
