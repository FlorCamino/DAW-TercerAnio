import { Project } from '../entities/project.entity';
import { ProjectResponseDto } from '../dtos/output/project-response.dto';
import { ProjectListResponseDto } from '../dtos/output/project-list-response.dto';

export class ProjectsMapper {
  static toResponse(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      status: project.status,
      clientId: project.clientId,
      client: project.client
        ? {
            id: project.client.id,
            nombre: project.client.nombre,
            estado: project.client.estado,
          }
        : null,
    };
  }

  static toListResponse(projects: Project[]): ProjectListResponseDto {
    return {
      data: projects.map((p) => this.toResponse(p)),
      total: projects.length,
    };
  }
}