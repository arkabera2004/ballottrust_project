import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // `trust proxy` governs which hop of X-Forwarded-For the app (and the
  // BT-SEC-001 rate limiter, which keys on req.ip) trusts. Defaults to `false`
  // (trust nobody) because the real hosting topology is not yet decided -
  // see docs/11_Deployment_Guide.md and BT-DEPLOY-001/002 in the ledger.
  // Once deployed, set TRUST_PROXY to the hop count behind the actual proxy
  // (e.g. "1" for a single reverse proxy/load balancer), never "true", which
  // trusts every hop and lets a client spoof its own IP.
  const trustProxy = process.env.TRUST_PROXY;
  app.set(
    'trust proxy',
    trustProxy === undefined
      ? false
      : Number.isNaN(Number(trustProxy))
        ? trustProxy
        : Number(trustProxy),
  );

  // docs/05 §2 specifies /api/v1 as the base URL. Controllers declare
  // their paths without it, so it is applied globally here. Static
  // uploads are served by ServeStaticModule middleware and are not
  // affected by this prefix.
  app.setGlobalPrefix('api/v1');

  // CSP is left to default-src 'self' with Swagger UI and the API itself in
  // mind: Swagger UI (served below, non-production only) needs inline styles
  // and its own bundled scripts, so contentSecurityPolicy is relaxed just
  // enough for that in non-production and left at helmet's safe default
  // (which blocks inline scripts/styles) in production, where Swagger is not
  // mounted. HSTS is only meaningful once the app is actually served over
  // HTTPS, which depends on the still-undecided hosting choice (BT-DEPLOY-001).
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production'
          ? undefined
          : {
              directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                'script-src': ["'self'", "'unsafe-inline'"],
                'style-src': ["'self'", "'unsafe-inline'"],
              },
            },
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());

  app.enableCors({
    // Comma-separated list so the Vite dev server, the Next.js dev
    // server and a deployed frontend can each be allowed without a code
    // change. Defaults cover local development only.
    origin: (
      process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:5173'
    )
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    credentials: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // ======================================================
  // API Documentation
  // ======================================================
  //
  // Served in non-production only: the schema enumerates every route and
  // role requirement, which is reconnaissance material on a live
  // election system.

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('BallotTrust API')
      .setDescription(
        'Enterprise Election Management Platform. See docs/05_API_Design.md for the design rationale.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication and identity')
      .addTag('elections', 'Election lifecycle')
      .addTag('candidates', 'Candidate nomination and verification')
      .addTag('manifestos', 'Candidate manifestos')
      .addTag('voters', 'Voter registration and roll management')
      .addTag('votes', 'Vote casting')
      .addTag('results', 'Result tabulation')
      .addTag('tasks', 'Workflow and task management')
      .addTag('notifications', 'Notification centre')
      .addTag('reports', 'Reports and analytics')
      .addTag('audit', 'Audit and compliance')
      .addTag('config', 'System configuration')
      .addTag('public', 'Public election portal (no authentication)')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port);
}
void bootstrap();
