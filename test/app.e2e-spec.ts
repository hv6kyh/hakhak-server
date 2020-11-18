/* eslint-disable @typescript-eslint/no-unused-vars */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'dotenv';
import { resolve } from 'path';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { Exception } from '../src/shared/constant';

let app: INestApplication;
let jwtToken: string;
let jwtToken2: string;
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

      .expect(({ body }) => {
        expect(body.data.hello).toBe('Hello World!');
      });
  });

  it('데이터를 주면 데이터가 그대로 반환된다', () => {
    const message = 'Hello New World!!';
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: `{ hello( data: "${message}" ) }` })
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
      .expect(({ body }) => {
        expect(body.data.createUser.name).toBe(name);
      });
  });

  it('이름, 비밀번호를 넘기면 회원이 생성되고 이름이 반환된다 (계정 추가로 생성)', () => {
    const name = 'youngho';
    const password = '1234qwer';
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {createUser(data: { name: "${name}", password: "${password}" }){name}}`,
      })
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
      .expect(({ body }) => {
        expect(body.errors[0].extensions.code).toBe(
          Exception.GRAPHQL_VALIDATION_FAILED,
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
      .expect(({ body }) => {
        expect(typeof body.data.signinUser).toBe('string');
        jwtToken = body.data.signinUser;
      });
  });

  it('올바른 이름과 비밀번호를 넘기면 토큰을 반환한다 (추가 계정)', () => {
    const name = 'youngho';
    const password = '1234qwer';
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {signinUser(data: { name: "${name}", password: "${password}" })}`,
      })
      .expect(({ body }) => {
        expect(typeof body.data.signinUser).toBe('string');
        jwtToken2 = body.data.signinUser;
      });
  });

  it('비밀번호가 틀리면 유저를 찾을 수 없다는 에러 메시지가 출력된다', () => {
    const name = 'hakhak';
    const password = '1234';
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {signinUser(data: { name: "${name}", password: "${password}" })}`,
      })
      .expect(({ body }) => {
        expect(body.errors[0].extensions.code).toBe(Exception.NOT_FOUND);
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
        query: `mutation {createBoard( data: { title: "${board.title}", content:"${board.content}" } ){ title, content, id }}`,
      })
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
      .send({
        query: `mutation {createBoard( data: { title: "${board.title}", content:"${board.content}" } ){ title, content, id }}`,
      })
      .expect(({ body }) => {
        expect(body.errors[0].extensions.code).toBe(Exception.UNAUTHORIZED);
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
        query: `mutation {updateBoard( data: { id: ${boardId}, title: "${board.title}", content:"${board.content}" } ){ title, content, id }}`,
      })
      .expect(({ body }) => {
        expect(body.data.updateBoard.title).toBe(board.title);
        expect(body.data.updateBoard.content).toBe(board.content);
        expect(body.data.updateBoard.id).toBe(boardId);
      });
  });

  it('제목과 내용을 모두 넘기지 않으면 파라미터 검증 에러', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${jwtToken}`)
      .send({
        query: `mutation {updateBoard( data: { id: ${boardId} } ){ title, content, id }}`,
      })
      .expect(({ body }) => {
        expect(body.errors[0].extensions.code).toBe(Exception.BAD_REQUEST);
      });
  });

  it('다른 사람의 게시물을 수정할 수 없다', () => {
    const board = {
      title: '안녕하세요',
      content: '반가워요',
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${jwtToken2}`)
      .send({
        query: `mutation {updateBoard( data: { id: ${boardId}, title: "${board.title}", content:"${board.content}" } ){ title, content, id }}`,
      })
      .expect(({ body }) => {
        expect(body.errors[0].extensions.code).toBe(Exception.UNAUTHORIZED);
      });
  });

  it('권한이 없는 유저는 게시물을 수정할 수 없다', () => {
    const board = {
      title: '안녕하세요',
      content: '반가워요',
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {updateBoard( data: { id: ${boardId}, title: "${board.title}", content:"${board.content}" } ){ title, content, id }}`,
      })
      .expect(({ body }) => {
        expect(body.errors[0].extensions.code).toBe(Exception.UNAUTHORIZED);
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
    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${jwtToken}`)
      .send({
        query: `mutation { deleteBoard( data: { id: ${boardId} } ) }`,
      })
      .expect(({ body }) => {
        expect(body.data.deleteBoard).toBe(true);
      });
  });

  it('다른 사람의 게시물을 삭제할 수 없다', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${jwtToken2}`)
      .send({
        query: `mutation { deleteBoard( data: { id: ${boardId} } ) }`,
      })
      .expect(({ body }) => {
        expect(body.errors[0].extensions.code).toBe(Exception.UNAUTHORIZED);
      });
  });

  it('권한이 없는 유저는 게시물을 삭제할 수 없다', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation { deleteBoard( data: { id: ${boardId} } ) }`,
      })
      .expect(({ body }) => {
        expect(body.errors[0].extensions.code).toBe(Exception.UNAUTHORIZED);
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
    const query = '안녕';
    // const title = '학학이 소개';
    // const query = '학학';
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query { getBoards( data: { title: "${query}" } ){ id, title } }`,
      })
      .expect(({ body }) => {
        expect(body.data.getBoards[0].title).toBe(title);
      });
  });

  it('내용으로 게시물을 검색할 수 있다', () => {
    // const title = '학학이 소개';
    // const content = '학학이는 살아있어요';
    // const query = '살아';
    const title = '안녕하세요';
    const content = '반가워요';
    const query = '반가';
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query { getBoards( data: { content: "${query}" } ){ id, title, content } }`,
      })
      .expect(({ body }) => {
        expect(body.data.getBoards[0].title).toBe(title);
        expect(body.data.getBoards[0].content).toBe(content);
      });
  });

  it('작성자 이름으로 게시물을 검색할 수 있다', () => {
    // const title = '학학이 소개';
    const title = '안녕하세요';
    const author = 'hakhak';
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query { getBoards( data: { author: "${author}" } ){ id, title, author { name } } }`,
      })
      .expect(({ body }) => {
        expect(body.data.getBoards[0].author.name).toBe(author);
        expect(body.data.getBoards[0].title).toBe(title);
      });
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
      .expect(({ body }) => {
        expect(body.errors[0].extensions.code).toBe(Exception.UNAUTHORIZED);
      });
  });
});
