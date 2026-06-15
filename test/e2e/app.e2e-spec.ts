import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@infrastructure/../app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  describe('Auth flow', () => {
    it('POST /auth/login should return JWT for valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@oficina.com', password: 'admin123' })
        .expect(201)
        .then((res) => {
          expect(res.body.access_token).toBeDefined();
        });
    });

    it('POST /auth/login should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@oficina.com', password: 'wrong' })
        .expect(401);
    });
  });

  describe('Protected routes', () => {
    it('GET /clients should return 401 without token', () => {
      return request(app.getHttpServer()).get('/clients').expect(401);
    });

    it('GET /service-orders should return 401 without token', () => {
      return request(app.getHttpServer()).get('/service-orders').expect(401);
    });

    it('GET /parts should return 401 without token', () => {
      return request(app.getHttpServer()).get('/parts').expect(401);
    });
  });

  describe('Public consult route', () => {
    it('GET /consult/:id should not require auth', () => {
      return request(app.getHttpServer())
        .get('/consult/some-client-id?cpf=12345678901')
        .expect((res) => {
          // Should NOT be 401 (no auth required)
          // Could be 404 (client not found) which is expected
          expect(res.status).not.toBe(401);
        });
    });
  });
});
