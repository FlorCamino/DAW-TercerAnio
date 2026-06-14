import { Body, Controller, Delete, Get, Param, Patch, ParseIntPipe, Post, Query, } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectStatusEnum } from '../../common/enums/project-status.enum';
import { CreateProjectDto } from './dtos/input/create-project.dto';
import { UpdateProjectDto } from './dtos/input/update-project.dto';
import { ProjectsService } from './projects.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRoleEnum } from '../../common/enums/user-role.enum';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Projects')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoleEnum.USER, UserRoleEnum.ADMIN)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @ApiQuery({ name: 'status', enum: ProjectStatusEnum, required: false })
  @ApiQuery({
    name: 'name',
    required: false,
    example: 'Sistema',
    description: 'Filtro parcial sin distinguir mayúsculas ni acentos.',
  })
  @ApiQuery({ name: 'clientId', required: false, example: 1 })
  @ApiQuery({ name: 'page', required: true, example: 1, schema: { default: 1 } })
  @ApiQuery({ name: 'limit', required: true, example: 6, schema: { default: 6 } })
  @Get()
  @ApiOperation({ summary: 'Listar proyectos' })
  findAll(
    @Query('status') status?: string,
    @Query('name') name?: string,
    @Query('clientId') clientId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '6',
  ) {
    return this.projectsService.findAll({
      status,
      name,
      clientId,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proyecto por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @ApiBody({
    type: CreateProjectDto,
    examples: {
      crearProyectoConCliente: {
        summary: 'Crear proyecto asociado a cliente activo',
        value: {
          name: 'Sistema de gestión interna',
          status: ProjectStatusEnum.ACTIVO,
          clientId: 1,
          endDate: '2026-07-15',
        },
      },
      crearProyectoInterno: {
        summary: 'Crear proyecto interno sin cliente',
        value: {
          name: 'Automatización interna',
          status: ProjectStatusEnum.ACTIVO,
          clientId: null,
        },
      },
    },
  })
  @Post()
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: 'Crear proyecto' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @ApiBody({
    type: UpdateProjectDto,
    examples: {
      editarProyecto: {
        summary: 'Modificar proyecto',
        value: {
          name: 'Sistema de gestión interna v2',
          status: ProjectStatusEnum.FINALIZADO,
          clientId: 1,
          endDate: '2026-08-10',
        },
      },
    },
  })
  @Patch(':id')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: 'Modificar proyecto' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: 'Dar de baja proyecto' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.remove(id);
  }
}
