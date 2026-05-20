import { ProjectResponseDto } from './project-response.dto';

export class ProjectListResponseDto {
  data: ProjectResponseDto[];
  total: number;
}