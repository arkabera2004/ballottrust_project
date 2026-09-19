import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

interface ApiResponse<T> {
  success: true;
  timestamp: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(
        (data): ApiResponse<T> => ({
          success: true,
          timestamp: new Date().toISOString(),
          data,
        }),
      ),
    );
  }
}
