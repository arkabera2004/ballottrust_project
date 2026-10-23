import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';
import { CloseElectionService } from './../src/modules/election/services';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * End-to-end coverage of the full election lifecycle (BT-TEST-001b):
 * candidate nomination -> verification -> approval -> ballot generation
 * and finalization -> election start -> vote casting -> duplicate-vote
 * rejection -> election closure -> results retrieval. Builds on the
 * governance coverage in election.e2e-spec.ts (BT-TEST-001), driving the
 * real HTTP endpoints with real roles rather than direct Prisma writes,
 * except for closing the election: there is no public "close" endpoint —
 * it is cron-triggered (election-lifecycle.job.ts) — so CloseElectionService
 * is resolved and called directly, exactly as the cron job does.
 */
describe('Election lifecycle: nomination to results (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwt: JwtService;
  let closeElectionService: CloseElectionService;

  const suffix = Date.now();
  const commissionerEmail = `e2e-lifecycle-commissioner-${suffix}@example.com`;
  const candidateUserEmail = `e2e-lifecycle-candidate-${suffix}@example.com`;
  const voterEmail = `e2e-lifecycle-voter-${suffix}@example.com`;

  let commissionerToken: string;
  let candidateUserId: string;
  let voterId: string;
  let electionId: string;
  let candidateId: string;

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
    closeElectionService = moduleFixture.get(CloseElectionService);

    await app.init();

    const commissioner = await prisma.user.create({
      data: {
        fullName: 'E2E Lifecycle Commissioner',
        email: commissionerEmail,
        password: 'unused',
        role: Role.ELECTION_COMMISSIONER,
        status: 'APPROVED',
        emailVerified: true,
        provider: 'LOCAL',
      },
    });
    commissionerToken = await signToken(commissioner);

    const candidateUser = await prisma.user.create({
      data: {
        fullName: 'E2E Lifecycle Candidate',
        email: candidateUserEmail,
        password: 'unused',
        role: Role.CANDIDATE,
        status: 'APPROVED',
        emailVerified: true,
        provider: 'LOCAL',
      },
    });
    candidateUserId = candidateUser.id;

    const voter = await prisma.user.create({
      data: {
        fullName: 'E2E Lifecycle Voter',
        email: voterEmail,
        password: 'unused',
        role: Role.VOTER,
        status: 'APPROVED',
        emailVerified: true,
        provider: 'LOCAL',
      },
    });
    voterId = voter.id;
  });

  afterAll(async () => {
    if (electionId) {
      await prisma.voteReceipt.deleteMany({
        where: { vote: { electionId } },
      });
      await prisma.vote.deleteMany({ where: { electionId } });
      await prisma.voterCredential.deleteMany({ where: { electionId } });
      await prisma.candidate.deleteMany({ where: { electionId } });
      await prisma.election.deleteMany({ where: { id: electionId } });
    }
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [commissionerEmail, candidateUserEmail, voterEmail],
        },
      },
    });
    await app.close();
  });

  it('creates, approves, and publishes an election with an open nomination window', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/elections')
      .set('Authorization', `Bearer ${commissionerToken}`)
      .send({
        title: 'E2E Lifecycle Election',
        electionType: 'STUDENT_COUNCIL',
        nominationStart: new Date(Date.now() - 60_000).toISOString(),
        nominationEnd: new Date(Date.now() + 3_600_000).toISOString(),
        startDate: new Date(Date.now() + 2_000).toISOString(),
        endDate: new Date(Date.now() + 7_200_000).toISOString(),
      })
      .expect(201);

    electionId = createResponse.body.data.id;

    await request(app.getHttpServer())
      .patch(`/api/v1/elections/${electionId}/submit`)
      .set('Authorization', `Bearer ${commissionerToken}`)
      .expect(200);

    const admin = await prisma.user.create({
      data: {
        fullName: 'E2E Lifecycle Super Admin',
        email: `e2e-lifecycle-admin-${suffix}@example.com`,
        password: 'unused',
        role: Role.SUPER_ADMIN,
        status: 'APPROVED',
        emailVerified: true,
        provider: 'LOCAL',
      },
    });
    const adminToken = await signToken(admin);

    await request(app.getHttpServer())
      .patch(`/api/v1/elections/${electionId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await prisma.user.delete({ where: { id: admin.id } });

    const publishResponse = await request(app.getHttpServer())
      .patch(`/api/v1/elections/${electionId}/publish`)
      .set('Authorization', `Bearer ${commissionerToken}`)
      .expect(200);

    expect(publishResponse.body.data.data.status).toBe('PUBLISHED');
  });

  it('lets the candidate submit a nomination', async () => {
    const candidateToken = await signToken({
      id: candidateUserId,
      email: candidateUserEmail,
      role: Role.CANDIDATE,
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/candidates/nominate')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        electionId,
        candidateType: 'INDEPENDENT',
        position: 'President',
        nominationStatement:
          'I am running to represent the student body fairly.',
      })
      .expect(201);

    candidateId = response.body.data.id;
    expect(response.body.data.status).toBe('PENDING');
  });

  it('verifies, then approves, the candidate', async () => {
    const verifyResponse = await request(app.getHttpServer())
      .patch(`/api/v1/candidates/${candidateId}/verify`)
      .set('Authorization', `Bearer ${commissionerToken}`)
      .expect(200);
    expect(verifyResponse.body.data.status).toBe('VERIFIED');

    const approveResponse = await request(app.getHttpServer())
      .patch(`/api/v1/candidates/${candidateId}/approve`)
      .set('Authorization', `Bearer ${commissionerToken}`)
      .expect(200);
    expect(approveResponse.body.data.status).toBe('APPROVED');
  });

  it('assigns a candidate number, generates the ballot order, and finalizes it', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/candidates/${candidateId}/candidate-number/auto`)
      .set('Authorization', `Bearer ${commissionerToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/candidates/election/${electionId}/ballot-order/generate`)
      .set('Authorization', `Bearer ${commissionerToken}`)
      .send({ method: 'CANDIDATE_NUMBER' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/candidates/election/${electionId}/ballot/finalize`)
      .set('Authorization', `Bearer ${commissionerToken}`)
      .expect(200);
  });

  it('starts the election now that the ballot is finalized', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/elections/${electionId}/start`)
      .set('Authorization', `Bearer ${commissionerToken}`)
      .expect(200);

    expect(response.body.data.data.status).toBe('ACTIVE');
  });

  it('lets the voter cast a vote, and rejects a duplicate vote', async () => {
    const voterToken = await signToken({
      id: voterId,
      email: voterEmail,
      role: Role.VOTER,
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/votes')
      .set('Authorization', `Bearer ${voterToken}`)
      .send({ electionId, candidateId })
      .expect(201);

    expect(response.body.data.receipt.receiptNumber).toEqual(
      expect.stringMatching(/^BT-/),
    );

    await request(app.getHttpServer())
      .post('/api/v1/votes')
      .set('Authorization', `Bearer ${voterToken}`)
      .send({ electionId, candidateId })
      .expect(400);
  });

  it('closes the election (cron-equivalent action) and publishes results', async () => {
    await closeElectionService.execute(electionId);

    const response = await request(app.getHttpServer())
      .get(`/api/v1/results/${electionId}`)
      .expect(200);

    expect(response.body.data).toEqual(
      expect.objectContaining({
        totalVotes: 1,
        results: expect.arrayContaining([
          expect.objectContaining({
            candidateId,
            votes: 1,
          }),
        ]),
      }),
    );
    expect(response.body.data.election.id).toBe(electionId);
  });
});
