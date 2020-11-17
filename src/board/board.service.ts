import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.model';
import { BoardCreate } from './dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly _boardRepository: Repository<Board>,
  ) {
    console.log('use this repository board', Board);
  }

  public createBoard(dto: BoardCreate, userId: number) {
    const board = this._boardRepository.create();
    Object.keys(dto).forEach((el) => {
      board[el] = dto[el];
    });
    return this._boardRepository.save(board);
  }
}
