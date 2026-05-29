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
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';

import { TaskStatus } from '../../common/enums/task-status.enum';
import { CreateTaskDto } from './dtos/input/create-task.dto';
import { UpdateTaskDto } from './dtos/input/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiQuery({ name: 'estado', enum: TaskStatus, required: false })
  @ApiQuery({ name: 'busqueda', required: false, example: 'modelo' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 6 })
  @Get()
  findAll(
    @Query('estado') estado?: string,
    @Query('status') status?: string,
    @Query('busqueda') busqueda?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tasksService.findAll({
      estado: estado ?? status,
      busqueda,
      page: Number(page ?? 1),
      limit: Number(limit ?? 10),
    });
  }

  @Get(':id')
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
