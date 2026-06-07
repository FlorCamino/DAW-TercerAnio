import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.USER, UserRole.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumen general del sistema' })
  getSummary() {
    return this.reportsService.getSummary();
  }

  @Get('projects-by-status')
  @ApiOperation({ summary: 'Cantidad de proyectos por estado' })
  getProjectsByStatus() {
    return this.reportsService.getProjectsByStatus();
  }

  @Get('tasks-by-status')
  @ApiOperation({ summary: 'Cantidad de tareas por estado' })
  @ApiQuery({ name: 'projectId', required: false, example: 1 })
  getTasksByStatus(@Query('projectId') projectId?: string) {
    return this.reportsService.getTasksByStatus(projectId);
  }

  @Get('project-deadlines')
  @ApiOperation({ summary: 'Proyectos vencidos o proximos a finalizar' })
  getProjectDeadlines() {
    return this.reportsService.getProjectDeadlines();
  }

  @Get('clients-projects')
  @ApiOperation({ summary: 'Clientes con proyectos asociados' })
  getClientsProjectsReport() {
    return this.reportsService.getClientsProjectsReport();
  }
}
