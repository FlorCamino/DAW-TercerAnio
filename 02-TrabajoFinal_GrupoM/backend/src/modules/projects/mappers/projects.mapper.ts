import { Project } from '../entities/project.entity';
import { ProjectResponseDto } from '../dtos/output/project-response.dto';
import { ProjectListResponseDto } from '../dtos/output/project-list-response.dto';
import { ProjectStatus } from '../../../common/enums/project-status.enum';

export class ProjectsMapper {
  static toResponse(project: Project): ProjectResponseDto {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isOverdue =
      project.endDate !== null &&
      new Date(project.endDate) < today &&
      project.status === ProjectStatus.ACTIVO;

    const response: ProjectResponseDto = {
      id: project.id,
      name: project.name,
      status: project.status,
      clientId: project.clientId,
      client: project.client
        ? {
          id: project.client.id,
          name: project.client.name,
          status: project.client.status,
        }
        : null,
      endDate: project.endDate,
      isOverdue,
    };

    if (project.tasks) {
      response.tasks = project.tasks.map((task) => ({
        id: task.id,
        description: task.description,
        status: task.status,
        projectId: task.projectId,
      }));
    }

    return response;
  }

  static toListResponse(projects: Project[]): ProjectListResponseDto {
    return {
      data: projects.map((p) => this.toResponse(p)),
      total: projects.length,
    };
  }
}