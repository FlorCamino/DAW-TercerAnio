import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApiInfo() {
    return {
      success: true,
      message: 'API de gestión de proyectos está corriendo correctamente.',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}