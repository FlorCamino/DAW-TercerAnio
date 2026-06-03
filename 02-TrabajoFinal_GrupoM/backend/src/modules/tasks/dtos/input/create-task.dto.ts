import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, } from 'class-validator';
import { TaskStatus } from '../../../../common/enums/task-status.enum';

export class CreateTaskDto {
  @ApiProperty({ example: 'Mantenimiento del sistema' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 1,
    description: 'Proyecto existente al que pertenece la tarea.',
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  projectId!: number;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.PENDING })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
