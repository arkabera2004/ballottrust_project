import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
