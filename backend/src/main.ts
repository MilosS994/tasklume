import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { HttpAdapterHost } from '@nestjs/core';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const pipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  disableErrorMessages: IS_PRODUCTION,
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaExceptionFilter(httpAdapter));

  // Helmet configuration
  app.use(helmet());
  // CORS configuration
  app.enableCors({
    origin: IS_PRODUCTION ? (process.env.CORS_ORIGIN?.split(',') ?? []) : true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.useGlobalPipes(new ValidationPipe(pipeOptions));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap()
  .then(() => {
    console.log(`
      =============================================
      Server is running on http://localhost:${process.env.PORT ?? 3000}
      =============================================
      `);
  })
  .catch((error) => {
    console.error('Error starting the server:', error);
    process.exit(1);
  });
