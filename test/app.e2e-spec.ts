/* eslint-disable @typescript-eslint/no-unused-vars */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'dotenv';
import { resolve } from 'path';
import { AppModule } from '../src/app.module';
import request from 'supertest';

let app: INestApplication;
let jwtToken: string;
let boardId: number;

describe('hello 요청에 대하여', () => {
  beforeAll(async () => {
    config({ path: resolve(__dirname, `../.${process.env.NODE_ENV}.env`) });
    console.log(process.env.NODE_ENV);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('데이터 없이 hello를 호출하면 기본 문자열이 반환된다', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{hello}' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.hello).toBe('Hello World!');
      });
  });

  it('데이터를 주면 데이터가 그대로 반환된다', () => {
    const message = 'Hello New World!!';
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: `{ hello( data: "${message}" ) }` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.hello).toBe(message);
      });
  });
});

describe('유저의 생성에 대하여', () => {
  beforeAll(async () => {
    config({ path: resolve(__dirname, `../.${process.env.NODE_ENV}.env`) });
    console.log(process.env.NODE_ENV);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // password도 같이 전달하게 send 수정
  it('이름, 비밀번호를 넘기면 회원이 생성되고 이름이 반환된다', () => {
    const name = 'hakhak';
    const password = '1234qwer';
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {createUser(data: { name: "${name}", password: "${password}" }){name}}`,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.createUser.name).toBe(name);
      });
  });

  it('비밀번호를 넘기지 않으면 파라미터 오류', () => {
    const name = 'hakhak';
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {createUser(data: { name: "${name}" }){name}}`,
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.errors[0].extensions.code).toBe(
          'GRAPHQL_VALIDATION_FAILED',
        );
      });
  });
});

describe('유저의 로그인에 대하여', () => {
  beforeAll(async () => {
    config({ path: resolve(__dirname, `../.${process.env.NODE_ENV}.env`) });
    console.log(process.env.NODE_ENV);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // 유저 로그인, 토큰 반환
  it('올바른 이름과 비밀번호를 넘기면 토큰을 반환한다', () => {
    const name = 'hakhak';
    const password = '1234qwer';
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {signinUser(data: { name: "${name}", password: "${password}" })}`,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(typeof body.data.signinUser).toBe('string');
        jwtToken = body.data.signinUser;
      });
  });

  it('비밀번호가 틀리면 유저를 찾을 수 없다는 에러 메시지가 출력된다', () => {
    const name = 'hakhak';
    const password = '1234';
    return (
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {signinUser(data: { name: "${name}", password: "${password}" })}`,
        })
        .expect(400)
        // TODO 400이 와야 하는데 200이 옴
        .expect(({ body }) => {
          expect(body.errors[0].message).toBe('User Not Found');
        })
    );
  });
});

describe('유저의 삭제에 대하여', () => {
  beforeAll(async () => {
    config({ path: resolve(__dirname, `../.${process.env.NODE_ENV}.env`) });
    console.log(process.env.NODE_ENV);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // 유저 삭세
  // 권한을 갖고 있는 유저만이 스스로 삭제(= 탈퇴) 할수있음
  it('올바른 권한을 갖고 있으면 성공이 반환된다', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${jwtToken}`)
      .send({
        query: `mutation { deleteUser }`,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.deleteUser).toBe(true);
      });
  });

  it('토큰이 없으면 권한 없음 에러가 출력된다', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation { deleteUser }`,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.errors[0].message).toBe('Unauthorized');
      });
  });
});

describe('게시물 생성에 대하여', () => {
  beforeAll(async () => {
    config({ path: resolve(__dirname, `../.${process.env.NODE_ENV}.env`) });
    console.log(process.env.NODE_ENV);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('인증된 유저는 게시물을 생성할 수 있다', () => {
    const board = {
      title: '학학이 소개',
      content: '학학이는 살아있어요',
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${jwtToken}`)
      .send({
        query: `mutation {createBoard(title: "${board.title}", content:"${board.content}"){ title, content, id }}`,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.createBoard.title).toBe(board.title);
        expect(body.data.createBoard.content).toBe(board.content);
        boardId = body.data.createBoard.id;
      });
  });

  it('인증되지 않은 유저는 게시물을 생성할 수 없다', () => {
    const board = {
      title: '학학이 소개',
      content: '학학이는 살아있어요',
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${jwtToken}`)
      .send({
        query: `mutation {createBoard(title: "${board.title}", content:"${board.content}"){content}}`,
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.errors[0].message).toBe('Unauthorized');
      });
  });
});

describe('게시물 수정에 대하여', () => {
  beforeAll(async () => {
    config({ path: resolve(__dirname, `../.${process.env.NODE_ENV}.env`) });
    console.log(process.env.NODE_ENV);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('글쓴이 본인만 게시물을 수정할 수 있다', () => {
    const board = {
      title: '안녕하세요',
      content: '반가워요',
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${jwtToken}`)
      .send({
        query: `mutation {createBoard(title: "${board.title}", content:"${board.content}"){ title, content }}`,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.createBoard.title).toBe(board.title);
        expect(body.data.createBoard.content).toBe(board.content);
      });
  });

  it('권한이 없는 유저는 게시물을 수정할 수 없다', () => {
    const board = {
      title: '안녕하세요',
      content: '반가워요',
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${jwtToken}`)
      .send({
        query: `mutation {createBoard(title: "${board.title}", content:"${board.content}"){content}}`,
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.errors[0].message).toBe('Unauthorized');
      });
  });
});

describe('게시물 삭제에 대하여', () => {
  beforeAll(async () => {
    config({ path: resolve(__dirname, `../.${process.env.NODE_ENV}.env`) });
    console.log(process.env.NODE_ENV);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('글쓴이 본인만 게시물을 삭제할 수 있다', () => {
    const board = {
      title: '안녕하세요',
      content: '반가워요',
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${jwtToken}`)
      .send({
        query: `mutation {deleteBoard(id: "${boardId}")}`,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.deleteBoard).toBe(true);
      });
  });

  it('권한이 없는 유저는 게시물을 삭제할 수 없다', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${jwtToken}`)
      .send({
        query: `mutation {deleteBoard(id: "${boardId}")`,
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.data.deleteBoard).toBe(false);
      });
  });
});

describe('게시물 검색에 대하여', () => {
  beforeAll(async () => {
    config({ path: resolve(__dirname, `../.${process.env.NODE_ENV}.env`) });
    console.log(process.env.NODE_ENV);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('제목으로 게시물을 검색할 수 있다', () => {
    const title = '안녕하세요';
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query { getBoards( title: "${title}" ){ id, title } }`,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.getBoards[0].title).toBe(title);
      });
  });

  it('작성자 이름으로 게시물을 검색할 수 있다', () => {
    const author = 'hakhak';
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query { getBoards( author: "${author}" ){ id, author } }`,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.getBoards[0].author).toBe(author);
      });
  });
});

// it('boards of user', () => {
//   const name = 'hakhak';

//   return request(app.getHttpServer())
//     .post('/graphql')
//     .send({
//       query: `query {getBoards(userName:"${name}"){author {name}}}`,
//     })
//     .expect(200)
//     .expect(({ body }) => {
//       expect(body.data.getBoards).toBe(expect.arrayContaining(['author']));
//     });
// });
