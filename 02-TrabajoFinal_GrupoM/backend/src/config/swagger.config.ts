import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { API_PREFIX, API_VERSION } from '../common/constants/app.constants';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Sistema de Gestión de Proyectos - Equipo M')
    .setDescription('API para usuarios, clientes, proyectos y tareas')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el token JWT recibido al iniciar sesion',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(`${API_PREFIX}/v${API_VERSION}/docs`, app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
    },
  });
}
