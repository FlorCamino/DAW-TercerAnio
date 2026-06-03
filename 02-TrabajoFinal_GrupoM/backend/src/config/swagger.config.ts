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
  document.tags = ['App', 'Auth', 'Clients', 'Projects', 'Tasks', 'Users'].map((name) => ({ name }));

  SwaggerModule.setup(`${API_PREFIX}/v${API_VERSION}/docs`, app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      tagsSorter: 'alpha',
      operationsSorter: (a, b) => {
        const order = ['get', 'post', 'patch', 'delete'];
        const methodA = a.get('method');
        const methodB = b.get('method');
        const methodDiff = order.indexOf(methodA) - order.indexOf(methodB);

        if (methodDiff !== 0) {
          return methodDiff;
        }

        return a.get('path').localeCompare(b.get('path'));
      },
    },
  });
}
