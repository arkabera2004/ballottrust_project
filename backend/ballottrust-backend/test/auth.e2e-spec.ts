import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * End-to-end coverage of the full authentication lifecycle against the real
 * module graph and a real (disposable, local) Postgres database — see
 * BT-TEST-001 in docs/PROJECT_COMPLETION_LEDGER.md.
 *
 * Account approval (PENDING -> APPROVED) is an admin action with no public
 * endpoint exercised here, so it is simulated with a direct Prisma write
 * between email verification and login, mirroring what a real admin
 * approval would change in the database.
 */
describe('Auth lifecycle (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const email = `e2e-auth-${Date.now()}@example.com`;
  const password = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api/v1');
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

    prisma = moduleFixture.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('registers a new voter as PENDING and unverified', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'E2E Auth Test',
        email,
        password,
        role: 'VOTER',
      })
      .expect(201);

    expect(response.body.success).toBe(true);

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).not.toBeNull();
    expect(user?.status).toBe('PENDING');
    expect(user?.emailVerified).toBe(false);
    expect(user?.emailVerificationOtp).toHaveLength(6);
  });

  it('rejects login before the account is verified and approved', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(401);
  });

  it('rejects verification with the wrong OTP', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/verify-email')
      .send({ email, otp: '000000' })
      .expect(400);
  });

  it('verifies the email with the real OTP', async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });

    await request(app.getHttpServer())
      .post('/api/v1/auth/verify-email')
      .send({ email, otp: user.emailVerificationOtp })
      .expect(201);

    const verified = await prisma.user.findUniqueOrThrow({
      where: { email },
    });
    expect(verified.emailVerified).toBe(true);
    expect(verified.emailVerificationOtp).toBeNull();
  });

  it('still rejects login while the account is pending approval', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(401);
  });

  let accessToken: string;
  let refreshToken: string;

  it('logs in once approved, and issues an access + refresh token', async () => {
    await prisma.user.update({
      where: { email },
      data: { status: 'APPROVED' },
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(201);

    expect(response.body.data).toEqual(
      expect.objectContaining({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      }),
    );

    accessToken = response.body.data.access_token;
    refreshToken = response.body.data.refresh_token;
  });

  it('accepts the access token on a guarded route', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.email).toBe(email);
  });

  it('rotates the refresh token on use and rejects the old one on reuse', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(201);

    const rotated = response.body.data.refresh_token;
    expect(rotated).not.toBe(refreshToken);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);

    refreshToken = rotated;
  });

  it('revokes the refresh token on logout', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .send({ refreshToken })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });
});
