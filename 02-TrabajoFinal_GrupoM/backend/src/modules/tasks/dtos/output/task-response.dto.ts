import { TaskStatus } from '../../../../common/enums/task-status.enum';

export class TaskResponseDto {
  id!: number;
  description!: string;
  status!: TaskStatus;
  projectId!: number;
  projectName!: string | null;
}
