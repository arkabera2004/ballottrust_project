import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import helmet from 'helmet';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';

/**
 * End-to-end smoke test over the real module graph.
 *
 * This exercises the wiring that unit tests mock away: the global /api/v1
 * prefix, the response envelope, the exception filter, the validation pipe
 * and the JWT guard. It boots AppModule for real, so it needs a reachable
 * PostgreSQL at DATABASE_URL — see .env.example.
 *
 * The bootstrap version of this file asserted `GET /` returned "Hello
 * World!", which stopped being true once main.ts adopted the /api/v1 prefix
 * and the response interceptor. It had also been unable to run at all,
 * because @nestjs/mapped-types is ESM-only and Jest could not parse it.
 */
describe('BallotTrust API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Mirrors main.ts so the test sees what a real client sees.
    app.setGlobalPrefix('api/v1');
    app.use(helmet());
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ============================================================
  // ROUTING AND RESPONSE ENVELOPE
  // ============================================================

  it('serves the public portal under the /api/v1 prefix', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/public/statistics')
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        timestamp: expect.any(String),
        data: expect.objectContaining({
          totalElections: expect.any(Number),
          totalVotesCast: expect.any(Number),
        }),
      }),
    );
  });

  it('does not serve application routes off the prefix', async () => {
    await request(app.getHttpServer()).get('/public/statistics').expect(404);
  });

  it('shapes an unknown route through the exception filter', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/definitely-not-a-route')
      .expect(404);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        statusCode: 404,
        path: '/api/v1/definitely-not-a-route',
      }),
    );
  });

  // ============================================================
  // AUTHENTICATION BOUNDARY
  // ============================================================

  it('rejects an unauthenticated request to a guarded route', async () => {
    await request(app.getHttpServer()).get('/api/v1/auth/profile').expect(401);
  });

  it('rejects a malformed bearer token rather than failing open', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/auth/profile')
      .set('Authorization', 'Bearer not-a-real-token')
      .expect(401);
  });

  // ============================================================
  // INPUT VALIDATION
  // ============================================================

  it('rejects a login payload that is missing required fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('strips unknown properties rather than accepting them', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'x@example.com', password: 'x', isAdmin: true })
      .expect(400);
  });

  // ============================================================
  // SECURITY HEADERS (BT-SEC-004)
  // ============================================================

  it('sets baseline security headers via helmet', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/public/statistics')
      .expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});
