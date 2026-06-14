import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { API_PREFIX, API_VERSION } from './common/constants/app.constants';
import { createValidationPipe } from './config/validation.config';

dotenv.config({ override: true });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const swaggerEnabled = isSwaggerEnabled();

  app.use(helmet());

  app.setGlobalPrefix(API_PREFIX);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION,
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:4200',
    credentials: true,
  });

  app.useGlobalPipes(createValidationPipe());

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  if (swaggerEnabled) {
    setupSwagger(app);
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  console.log(`Server running on http://localhost:${port}/${API_PREFIX}/v${API_VERSION}`);

  if (swaggerEnabled) {
    console.log(`Swagger docs: http://localhost:${port}/${API_PREFIX}/v${API_VERSION}/docs`);
  }
}

function isSwaggerEnabled(): boolean {
  const currentEnvironment = process.env.NODE_ENV?.toLowerCase();
  const allowedEnvironments = ['development', 'testing', 'test'];

  return (
    process.env.SWAGGER_HABILITADO === 'true' &&
    allowedEnvironments.includes(currentEnvironment ?? '')
  );
}

bootstrap();
