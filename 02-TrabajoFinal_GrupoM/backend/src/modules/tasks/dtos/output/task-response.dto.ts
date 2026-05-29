import { TaskStatus } from '../../../../common/enums/task-status.enum';

export class TaskResponseDto {
  id: number;
  descripcion: string;
  estado: TaskStatus;
  proyectoId: number;
  proyectoNombre: string | null;
}
