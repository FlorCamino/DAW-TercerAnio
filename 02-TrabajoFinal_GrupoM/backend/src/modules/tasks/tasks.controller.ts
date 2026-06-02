import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { TaskStatus } from '../../common/enums/task-status.enum';
import { CreateTaskDto } from './dtos/input/create-task.dto';
import { UpdateTaskDto } from './dtos/input/update-task.dto';
import { TasksService } from './tasks.service';

// Para manejo de roles
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.USER, UserRole.ADMIN)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiQuery({ name: 'estado', enum: TaskStatus, required: false })
  @ApiQuery({
    name: 'descripcion',
    required: false,
    example: 'modelo',
    description: 'Filtro parcial sin distinguir mayusculas ni acentos.',
  })
  @ApiQuery({ name: 'proyectoId', required: false, example: 1 })
  @ApiQuery({ name: 'page', required: true, example: 1, schema: { default: 1 } })
  @ApiQuery({ name: 'limit', required: true, example: 10, schema: { default: 10 } })
  @Get()
  @ApiOperation({ summary: 'Listar tareas' })
  findAll(
    @Query('estado') estado?: string,
    @Query('descripcion') descripcion?: string,
    @Query('proyectoId') proyectoId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.tasksService.findAll({
      estado,
      descripcion,
      proyectoId,
      page: Number(page ?? 1),
      limit: Number(limit ?? 10),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tarea por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @ApiBody({
    type: CreateTaskDto,
    examples: {
      crearTarea: {
        summary: 'Crear tarea pendiente para un proyecto',
        value: {
          descripcion: 'Definir modelo de datos inicial',
          proyectoId: 1,
          estado: TaskStatus.PENDING,
        },
      },
    },
  })
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear tarea' })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @ApiBody({
    type: UpdateTaskDto,
    examples: {
      editarTarea: {
        summary: 'Modificar tarea',
        value: {
          descripcion: 'Definir modelo de datos final',
          proyectoId: 1,
          estado: TaskStatus.FINISHED,
        },
      },
      cambiarEstado: {
        summary: 'Cambiar solo el estado',
        value: {
          estado: TaskStatus.FINISHED,
        },
      },
    },
  })
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modificar tarea' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  // Solo los administradores pueden eliminar (manejo de roles)
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Dar de baja tarea' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
