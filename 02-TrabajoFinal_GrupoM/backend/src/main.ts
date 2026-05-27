import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { API_PREFIX } from './common/constants/app.constants';

function formatValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      for (const [constraint, message] of Object.entries(error.constraints)) {
        messages.push(
          translateValidationMessage(constraint, error.property, message),
        );
      }
    }

    if (error.children?.length) {
      messages.push(...formatValidationErrors(error.children));
    }
  }

  return messages;
}

function translateValidationMessage(
  constraint: string,
  property: string,
  defaultMessage: string,
): string {
  const fieldName = translateFieldName(property);

  switch (constraint) {
    case 'whitelistValidation':
      return `La propiedad "${property}" no esta permitida`;
    case 'isEmail':
      return `${fieldName} debe ser un correo valido`;
    case 'isEnum':
      return `${fieldName} tiene un valor invalido`;
    case 'isNotEmpty':
      return `${fieldName} es obligatorio`;
    case 'isString':
      return `${fieldName} debe ser texto`;
    default:
      return defaultMessage;
  }
}

function translateFieldName(property: string): string {
  const fieldNames: Record<string, string> = {
    email: 'El email',
    estado: 'El estado',
    nombre: 'El nombre',
    telefono: 'El telefono',
  };

  return fieldNames[property] ?? `El campo ${property}`;
}

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
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException(formatValidationErrors(errors)),
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
