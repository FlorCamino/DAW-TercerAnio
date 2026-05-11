import { ProjectStatus } from '../../../../common/enums/project-status.enum';

export class ProjectResponseDto {
  id: number;
  name: string;
  status: ProjectStatus;
  clientId: number | null;
  client: { id: number; nombre: string; estado: string } | null;
}