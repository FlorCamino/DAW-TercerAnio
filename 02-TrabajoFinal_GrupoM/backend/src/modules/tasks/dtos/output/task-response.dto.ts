import { TaskStatusEnum } from '../../../../common/enums/task-status.enum';

export class TaskResponseDto {
  id!: number;
  description!: string;
  status!: TaskStatusEnum;
  projectId!: number;
  projectName!: string | null;
}
