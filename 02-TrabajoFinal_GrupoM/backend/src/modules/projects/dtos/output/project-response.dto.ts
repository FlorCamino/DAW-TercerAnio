import { ProjectStatusEnum } from '../../../../common/enums/project-status.enum';
import { TaskStatusEnum } from '../../../../common/enums/task-status.enum';

export class ProjectResponseDto {
  id!: number;
  name!: string;
  status!: ProjectStatusEnum;
  clientId!: number | null;
  client!: { id: number; name: string; status: string } | null;
  endDate!: string | null;
  isOverdue!: boolean;
  tasks?: {
    id: number;
    description: string;
    status: TaskStatusEnum;
    projectId: number;
  }[];
}