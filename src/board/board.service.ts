import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.model';
import { EntityManager, Like, Repository } from 'typeorm';
import { Board } from './board.model';
import { BoardCreate, BoardList } from './dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly _boardRepository: Repository<Board>,
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {
    console.log('use this repository board', Board);
  }

  public async createBoard(dto: BoardCreate, id: number) {
    // Jwt payload에서 id를 알수있으니
    // id(PK)로 유저를 조회함
    const user = await this.entityManager.findOne<User>('User', { id });

    const board = this._boardRepository.create();
    Object.keys(dto).forEach((el) => {
      board[el] = dto[el];
    });
    board.author = user;

    return this._boardRepository.save(board);
  }

  public async getBoards(dto: BoardList) {
    const result = await this._boardRepository.find({
      join: {
        alias: 'board',
        leftJoinAndSelect: {
          user: 'board.author',
        },
      },
      // relations: ['author'],
      /**
       * https://stackoverflow.com/questions/57647558/typeorm-query-entity-based-on-relation-property
       * board에 대한 조건
       * user에 대한 조건
       */
      where: (qb) => {
        qb.where({
          // 글 제목, 내용 부분 일치 검색
          title: Like(`%${dto?.title ?? ''}%`),
          content: Like(`%${dto?.content ?? ''}%`),
        }).andWhere(
          // 작성자 일치 검색
          dto?.author ? 'user.name = :userName' : '1=1',
          dto?.author ? { userName: dto.author } : {},
        );
      },
      order: { createdAt: 'ASC' },
      take: dto?.size ?? 10,
      skip: (dto?.page - 1) * dto?.size ?? 0,
    });

    return result;
  }
}
