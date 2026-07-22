// src/common/filters/http-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: string | object;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            // Use the detailed validation message array if present, otherwise the string message
            message =
                typeof exceptionResponse === 'object'
                    ? exceptionResponse
                    : { message: exceptionResponse };
        } else {
            // Unhandled / unexpected errors — log them, return generic 500
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = { message: 'An unexpected internal server error occurred.' };
            this.logger.error('Unhandled exception', exception);
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            ...(typeof message === 'object' ? message : { message }),
        });
    }
}
