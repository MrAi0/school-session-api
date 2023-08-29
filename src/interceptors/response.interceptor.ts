/* eslint-disable prettier/prettier */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as http from 'http'

@Injectable()

export class StandardResponseDto {
    statusCode: number;
    statusMessage: string;
    data: any;
}

export class StandardResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => {
                const response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode;
                const statusMessage = http.STATUS_CODES[response.statusCode];
                const standardResponse: StandardResponseDto = {
                    statusCode,
                    statusMessage,
                    data,
                };

                return standardResponse;
            }),
        );
    }
}