import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpGlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    // 1. Nếu là HttpException (NestJS)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      // response có thể là string hoặc object
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        // Một số lỗi Nest trả message là mảng, hoặc object
        if ('message' in response) {
          message = response['message'];
        } else {
          message = response;
        }
      }
    }
    else if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as any).code === 11000
    ) {
      status = HttpStatus.BAD_REQUEST;
      const keyValue = (exception as any).keyValue;
      const duplicateField = keyValue ? Object.keys(keyValue)[0] : 'field';
      message = `${duplicateField} already exists`;
    }
    // 3. Nếu là lỗi Axios hoặc lỗi từ service khác (có response.data)
    else if (
      typeof exception === 'object' &&
      exception !== null &&
      'response' in exception &&
      typeof (exception as any).response === 'object'
    ) {
      const errorResponse = (exception as any).response;
      // Lấy status nếu có
      if (errorResponse.status) {
        status = errorResponse.status;
      }
      // Lấy message gốc nếu có (service trả về)
      if (errorResponse.data) {
        message = errorResponse.data;
      }
    }
    // 4. Trường hợp khác
    else if (typeof exception === 'string') {
      message = exception;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    res.status(status).json({
      statusCode: status,
      message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
