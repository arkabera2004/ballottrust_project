import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let json: jest.Mock;
  let status: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });

    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ method: 'POST', url: '/api/v1/auth/login' }),
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================
  // HTTP EXCEPTIONS
  // ============================================================

  it('passes an HttpException through with its own status and message', () => {
    filter.catch(new BadRequestException('Invalid credentials'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid credentials',
        path: '/api/v1/auth/login',
      }),
    );
  });

  it('does not log expected HttpExceptions', () => {
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    filter.catch(new BadRequestException('nope'), host);

    expect(error).not.toHaveBeenCalled();
  });

  // ============================================================
  // UNHANDLED EXCEPTIONS
  // ============================================================

  it('logs an unhandled exception with its stack and the failing route', () => {
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const boom = new Error('secretOrPrivateKey must have a value');

    filter.catch(boom, host);

    expect(error).toHaveBeenCalledWith(
      'Unhandled exception on POST /api/v1/auth/login',
      boom.stack,
    );
  });

  it('still answers 500 without leaking the internal message', () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    filter.catch(
      new Error('connection string rejected: password=hunter2'),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);

    const body = json.mock.calls[0][0];

    expect(body.message).toBe('Internal server error');

    expect(JSON.stringify(body)).not.toContain('hunter2');
  });

  it('handles a thrown non-Error value', () => {
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    filter.catch('a bare string', host);

    expect(error).toHaveBeenCalledWith(
      'Unhandled exception on POST /api/v1/auth/login',
      'a bare string',
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
