import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('API Gestión de Proyectos - Grupo M')
    .setDescription('Documentación de la API para Clientes (Integrante 2)')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('🚀 Servidor corriendo en: http://localhost:3000');
  console.log('📖 Swagger disponible en: http://localhost:3000/api');
}
bootstrap();