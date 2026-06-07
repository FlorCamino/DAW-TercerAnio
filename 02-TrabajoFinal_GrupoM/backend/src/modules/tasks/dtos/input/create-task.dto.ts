import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, } from 'class-validator';
import { TaskStatus } from '../../../../common/enums/task-status.enum';

export class CreateTaskDto {
  @ApiProperty({ example: 'Mantenimiento del sistema' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(255, {
    message: 'La descripción no puede superar los 255 caracteres',
  })
  description!: string;

  @ApiProperty({
    example: 1,
    description: 'Proyecto existente al que pertenece la tarea.',
  })
  @Type(() => Number)
  @IsInt({ message: 'El proyecto debe ser un número entero' })
  @IsPositive({ message: 'El proyecto debe ser un número positivo' })
  @IsNotEmpty({ message: 'El proyecto es obligatorio' })
  projectId!: number;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.PENDIENTE })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsEnum(TaskStatus, { message: 'El estado de la tarea no es válido' })
  status?: TaskStatus;
}
