import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * End-to-end coverage of the election governance workflow (BT-TEST-001):
 * DRAFT -> PENDING_APPROVAL -> APPROVED -> PUBLISHED, against the real
 * module graph and a real (disposable, local) Postgres database.
 *
 * Scope note: this covers the election lifecycle's governance transitions
 * and role enforcement only. Starting an election additionally requires a
 * finalized ballot with approved candidates (StartElectionService's ballot
 * readiness check), and voting requires voter-eligibility setup — both are
 * a larger, separate increment (tracked as BT-TEST-001b in the ledger) to
 * keep this change small and independently verifiable.
 *
 * Test users are created directly via Prisma (there is no public
 * "create an admin" endpoint other than the one-time bootstrap flow), and
 * access tokens are signed directly via JwtService with the same claim
 * shape auth.service.ts uses, mirroring what a real login would issue.
 */
describe('Election governance workflow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwt: JwtService;

  const suffix = Date.now();
  const commissionerEmail = `e2e-commissioner-${suffix}@example.com`;
  const voterEmail = `e2e-voter-${suffix}@example.com`;

  let commissionerToken: string;
  let voterToken: string;
  let electionId: string;

  function signToken(user: { id: string; email: string; role: Role }) {
    return jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
  }

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
    jwt = moduleFixture.get(JwtService);

    await app.init();

    const commissioner = await prisma.user.create({
      data: {
        fullName: 'E2E Commissioner',
        email: commissionerEmail,
        password: 'unused',
        role: Role.ELECTION_COMMISSIONER,
        status: 'APPROVED',
        emailVerified: true,
        provider: 'LOCAL',
      },
    });

    const voter = await prisma.user.create({
      data: {
        fullName: 'E2E Voter',
        email: voterEmail,
        password: 'unused',
        role: Role.VOTER,
        status: 'APPROVED',
        emailVerified: true,
        provider: 'LOCAL',
      },
    });

    commissionerToken = await signToken(commissioner);
    voterToken = await signToken(voter);
  });

  afterAll(async () => {
    if (electionId) {
      await prisma.election.deleteMany({ where: { id: electionId } });
    }
    await prisma.user.deleteMany({
      where: { email: { in: [commissionerEmail, voterEmail] } },
    });
    await app.close();
  });

  it('rejects election creation from a non-commissioner role', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/elections')
      .set('Authorization', `Bearer ${voterToken}`)
      .send({
        title: 'E2E Student Council Election',
        electionType: 'STUDENT_COUNCIL',
        startDate: new Date(Date.now() + 86_400_000).toISOString(),
        endDate: new Date(Date.now() + 2 * 86_400_000).toISOString(),
      })
      .expect(403);
  });

  it('lets a commissioner create a DRAFT election', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/elections')
      .set('Authorization', `Bearer ${commissionerToken}`)
      .send({
        title: 'E2E Student Council Election',
        electionType: 'STUDENT_COUNCIL',
        startDate: new Date(Date.now() + 86_400_000).toISOString(),
        endDate: new Date(Date.now() + 2 * 86_400_000).toISOString(),
      })
      .expect(201);

    electionId = response.body.data.id;
    expect(response.body.data.status).toBe('DRAFT');
  });

  it('refuses to approve an election that has not been submitted yet', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/elections/${electionId}/approve`)
      .set('Authorization', `Bearer ${commissionerToken}`)
      .expect(403);
  });

  it('submits the election for approval', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/elections/${electionId}/submit`)
      .set('Authorization', `Bearer ${commissionerToken}`)
      .expect(200);

    expect(response.body.data.status).toBe('PENDING_APPROVAL');
  });

  it('refuses to publish before approval', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/elections/${electionId}/publish`)
      .set('Authorization', `Bearer ${commissionerToken}`)
      .expect(400);
  });

  it('rejects approval from a non-SUPER_ADMIN role', async () => {
    // Commissioners can submit/publish but only SUPER_ADMIN may approve.
    await request(app.getHttpServer())
      .patch(`/api/v1/elections/${electionId}/approve`)
      .set('Authorization', `Bearer ${commissionerToken}`)
      .expect(403);
  });

  it('approves the election once a SUPER_ADMIN acts', async () => {
    const admin = await prisma.user.create({
      data: {
        fullName: 'E2E Super Admin',
        email: `e2e-admin-${suffix}@example.com`,
        password: 'unused',
        role: Role.SUPER_ADMIN,
        status: 'APPROVED',
        emailVerified: true,
        provider: 'LOCAL',
      },
    });
    const adminToken = await signToken(admin);

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/elections/${electionId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.data.status).toBe('APPROVED');

    await prisma.user.delete({ where: { id: admin.id } });
  });

  it('publishes the approved election', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/elections/${electionId}/publish`)
      .set('Authorization', `Bearer ${commissionerToken}`)
      .expect(200);

    expect(response.body.data.data.status).toBe('PUBLISHED');
  });

  it('refuses to start the election before a ballot is finalized', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/elections/${electionId}/start`)
      .set('Authorization', `Bearer ${commissionerToken}`)
      .expect(400);
  });
});
