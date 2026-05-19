import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../../../../common/enums/task-status.enum';

export class CreateTaskDto {

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  projectId: number;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}