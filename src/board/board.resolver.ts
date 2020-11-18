import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { Board } from './board.model';
import { BoardService } from './board.service';
import { JwtAuthGuard } from '../shared/auth/jwt.guard';
import { UseGuards } from '@nestjs/common';
import { BoardCreate, BoardDelete, BoardList, BoardUpdate } from './dto';
import { CurrentUser } from '../user/decorators/user.decorator';
import { UserPayload } from '../user/dto';
import { UpdatePipe } from './pipes';

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

  @Mutation(() => Board)
  @UseGuards(JwtAuthGuard)
  updateBoard(
    @Args('data', UpdatePipe) dto: BoardUpdate,
    @CurrentUser() user: UserPayload,
  ) {
    return this.boardService.updateBoard(dto, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  deleteBoard(
    @Args('data') dto: BoardDelete,
    @CurrentUser() user: UserPayload,
  ) {
    return this.boardService.deleteBoard(dto, user.id);
  }
}
