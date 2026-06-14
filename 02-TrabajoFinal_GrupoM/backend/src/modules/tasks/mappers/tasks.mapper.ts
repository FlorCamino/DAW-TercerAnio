import { TaskResponseDto } from '../dtos/output/task-response.dto';
import { Task } from '../entities/task.entity';

export interface TaskListResponseDto {
  data: TaskResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class TasksMapper {
  static toResponse(task: Task): TaskResponseDto {
    return {
      id: task.id,
      description: task.description,
      status: task.status,
      projectId: task.projectId,
      projectName: task.project?.name ?? null,
    };
  }

  static toListResponse(
    tasks: Task[],
    total: number,
    page: number,
    limit: number,
  ): TaskListResponseDto {
    return {
      data: tasks.map((task) => this.toResponse(task)),
      total,
      page,
      limit,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
    };
  }
}
