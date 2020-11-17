/* eslint-disable @typescript-eslint/no-unused-vars */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'dotenv';
import { resolve } from 'path';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    config({ path: resolve(__dirname, `../.${process.env.NODE_ENV}.env`) });
    console.log(process.env.NODE_ENV);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('get hello', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{hello}' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.hello).toBe('Hello World!');
      });
  });

  it('get hello with data', () => {
    const message = 'Hello New World!!';
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: `{ hello( data: "${message}" ) }` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.hello).toBe(message);
      });
  });

  // password도 같이 전달하게 send 수정
  it('user create', () => {
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

  it('user create without password', () => {
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

  // 유저 로그인, 토큰 반환
  it('user signin', () => {
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

  it('user signin with Incorrect password', () => {
    const name = 'hakhak';
    const password = '1234';
    return (
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {signinUser(data: { name: "${name}", password: "${password}" })}`,
        })
        // .expect(400)
        // TODO 400이 와야 하는데 200이 옴
        .expect(({ body }) => {
          expect(body.errors[0].message).toBe('User Not Found');
        })
    );
  });

  // 유저 삭세
  // 권한을 갖고 있는 유저만이 스스로 삭제(= 탈퇴) 할수있음
  it('user delete', () => {
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

  it('user delete without token', () => {
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

  // 인증된 유저만 글을 쓸수 있게 변경
  it('user create board', () => {
    const board = {
      title: '학학이 소개',
      content: '학학이는 살아있어요',
    };

    const name = 'hakhak';

    return request(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${jwtToken}`)
      .send({
        query: `mutation {createBoard(title: "${board.title}", content:"${board.content}"){content}}`,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.createBoard.title).toBe(board.title);
      });
  });

  it('boards of user', () => {
    const name = 'hakhak';

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query {getBoards(userName:"${name}"){author {name}}}`,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.getBoards).toBe(expect.arrayContaining(['author']));
      });
  });
});
