import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Request, Response } from 'express';

/**
 * HttpException.getResponse() is `string | object`. Nest's built-in
 * exceptions put the human-readable text under `message`, but a handler
 * may throw an arbitrary object, so narrow rather than cast.
 */
function extractMessage(payload: string | object): string | string[] {
  if (typeof payload === 'string') {
    return payload;
  }

  if ('message' in payload) {
    const { message } = payload;

    if (typeof message === 'string' || Array.isArray(message)) {
      return message as string | string[];
    }
  }

  return 'Internal server error';
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const message = extractMessage(exceptionResponse);

    // Anything that is not an HttpException reached us unplanned: a bug, a
    // driver error, a failed assumption. The response deliberately stays a
    // bare "Internal server error" so nothing internal leaks to the caller,
    // which previously meant the cause was lost entirely — the process wrote
    // nothing at all. Record it server-side, with the stack when there is
    // one, so these are diagnosable from the logs.
    if (!(exception instanceof HttpException)) {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
