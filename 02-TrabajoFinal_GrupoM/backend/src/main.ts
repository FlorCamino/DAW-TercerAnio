import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { HttpExceptionFilter } from './common/filters/http-exception.filter';
// import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalInterceptors(new ResponseInterceptor());

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  console.log(`Server running on http://localhost:${port}/api`);
}

bootstrap();