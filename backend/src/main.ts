import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const IS_PRODUCTION = (process.env.NODE_ENV as string) === 'production';

const pipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  disableErrorMessages: IS_PRODUCTION,
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
