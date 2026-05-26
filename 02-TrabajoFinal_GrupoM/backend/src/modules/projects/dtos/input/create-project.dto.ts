import { IsString, IsNotEmpty, IsOptional, IsInt, IsPositive, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { ProjectStatus } from '../../../../common/enums/project-status.enum';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del proyecto es obligatorio' })
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsEnum(ProjectStatus, { message: 'Estado inválido' })
  status?: ProjectStatus;

  @IsOptional()
  @IsInt()
  @IsPositive()
  clientId?: number | null;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de finalización debe tener formato YYYY-MM-DD' })
  endDate?: string | null;
}