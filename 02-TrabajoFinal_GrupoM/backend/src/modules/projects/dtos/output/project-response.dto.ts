import { ProjectStatus } from '../../../../common/enums/project-status.enum';
import { TaskStatus } from '../../../../common/enums/task-status.enum';

export class ProjectResponseDto {
  id!: number;
  name!: string;
  status!: ProjectStatus;
  clientId!: number | null;
  client!: { id: number; name: string; status: string } | null;
  endDate!: string | null;
  isOverdue!: boolean;
  tasks?: {
    id: number;
    description: string;
    status: TaskStatus;
    projectId: number;
  }[];
}