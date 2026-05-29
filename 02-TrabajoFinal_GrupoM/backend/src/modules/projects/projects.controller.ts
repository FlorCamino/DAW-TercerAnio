import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectStatus } from '../../common/enums/project-status.enum';
import { CreateProjectDto } from './dtos/input/create-project.dto';
import { UpdateProjectDto } from './dtos/input/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiBody({
    type: CreateProjectDto,
    examples: {
      crearProyectoConCliente: {
        summary: 'Crear proyecto asociado a cliente activo',
        value: {
          name: 'Sistema de gestion interna',
          status: ProjectStatus.ACTIVE,
          clientId: 1,
          endDate: '2026-07-15',
        },
      },
      crearProyectoInterno: {
        summary: 'Crear proyecto interno sin cliente',
        value: {
          name: 'Automatizacion interna',
          clientId: null,
        },
      },
    },
  })
  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @ApiQuery({ name: 'estado', enum: ProjectStatus, required: false })
  @ApiQuery({
    name: 'status',
    enum: ProjectStatus,
    required: false,
    description: 'Alias de estado para compatibilidad.',
  })
  @ApiQuery({ name: 'busqueda', required: false, example: 'gestion' })
  @ApiQuery({ name: 'nombre', required: false, example: 'Sistema' })
  @ApiQuery({ name: 'clientId', required: false, example: 1 })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 6 })
  @Get()
  findAll(
    @Query('estado') estado?: string,
    @Query('status') status?: string,
    @Query('busqueda') busqueda?: string,
    @Query('nombre') nombre?: string,
    @Query('clientId') clientId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.findAll({
      estado: estado ?? status,
      busqueda,
      nombre,
      clientId,
      page,
      limit,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @ApiBody({
    type: UpdateProjectDto,
    examples: {
      editarProyecto: {
        summary: 'Modificar proyecto',
        value: {
          name: 'Sistema de gestion interna v2',
          status: ProjectStatus.FINISHED,
          clientId: 1,
          endDate: '2026-08-10',
        },
      },
    },
  })
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.remove(id);
  }
}
