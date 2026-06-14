import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Ver estado de la API' })
  getApiInfo() {
    return {
      message: 'API de gestión de proyectos corriendo correctamente.',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
