import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { API_PREFIX } from './common/constants/app.constants';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_PREFIX);

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:4200',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  if (process.env.SWAGGER_HABILITADO === 'true') {
    setupSwagger(app);
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  console.log(`Server running on http://localhost:${port}/${API_PREFIX}`);

  if (process.env.SWAGGER_HABILITADO === 'true') {
    console.log(`Swagger docs: http://localhost:${port}/${API_PREFIX}/docs`);
  }
}

bootstrap();
