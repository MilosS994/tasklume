import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../generated/prisma/client';
import { Response } from 'express';

const errorCodeToHttpStatusMap: Record<string, HttpStatus> = {
  P2002: HttpStatus.CONFLICT,
  P2025: HttpStatus.NOT_FOUND,
  P2003: HttpStatus.BAD_REQUEST,
  P2014: HttpStatus.BAD_REQUEST,
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const status = errorCodeToHttpStatusMap[exception.code];

    if (!status) {
      return super.catch(exception, host);
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(status).json({
      statusCode: status,
      message: this.toMessage(exception),
    });
  }

  private toMessage(exception: Prisma.PrismaClientKnownRequestError): string {
    switch (exception.code) {
      case 'P2002': {
        const meta = exception.meta as { target?: string[] } | undefined;
        const field = meta?.target?.join(', ') ?? 'polje';
        return `Value for "${field}" is already taken`;
      }
      case 'P2025':
        return 'The requested resource does not exist';
      case 'P2003':
      case 'P2014':
        return 'The operation violates a database relation';
      default:
        return 'Database communication error';
    }
  }
}
