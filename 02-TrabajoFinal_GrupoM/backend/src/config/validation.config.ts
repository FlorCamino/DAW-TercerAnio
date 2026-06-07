import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException(formatValidationErrors(errors)),
  });
}

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
    clientId: 'El cliente',
    description: 'La descripcion',
    email: 'El email',
    endDate: 'La fecha de finalizacion',
    status: 'El estado',
    limit: 'El limite',
    name: 'El nombre',
    page: 'La pagina',
    proyectoId: 'El proyecto',
    phone: 'El telefono',
  };

  return fieldNames[property] ?? `El campo ${property}`;
}
