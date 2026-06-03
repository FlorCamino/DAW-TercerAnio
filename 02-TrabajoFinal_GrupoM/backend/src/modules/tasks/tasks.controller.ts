import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TaskStatus } from '../../common/enums/task-status.enum';
import { CreateTaskDto } from './dtos/input/create-task.dto';
import { UpdateTaskDto } from './dtos/input/update-task.dto';
import { TasksService } from './tasks.service';
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
  constructor(private readonly tasksService: TasksService) { }

  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  @ApiQuery({
    name: 'description',
    required: false,
    example: 'modelo',
    description: 'Filtro parcial sin distinguir mayusculas ni acentos.',
  })
  @ApiQuery({ name: 'projectId', required: false, example: 1 })
  @ApiQuery({ name: 'page', required: true, example: 1, schema: { default: 1 } })
  @ApiQuery({ name: 'limit', required: true, example: 10, schema: { default: 10 } })
  @Get()
  @ApiOperation({ summary: 'Listar tareas' })
  findAll(
    @Query('status') status?: string,
    @Query('description') description?: string,
    @Query('projectId') projectId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.tasksService.findAll({
      status,
      description,
      projectId,
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
          description: 'Definir modelo de datos inicial',
          projectId: 1,
          status: TaskStatus.PENDING,
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
          description: 'Definir modelo de datos final',
          projectId: 1,
          status: TaskStatus.FINISHED,
        },
      },
      cambiarEstado: {
        summary: 'Cambiar solo el estado',
        value: {
          status: TaskStatus.FINISHED,
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

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Dar de baja tarea' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
