import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApiInfo() {
    return {
      message: 'API de gestion de proyectos corriendo correctamente.',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
