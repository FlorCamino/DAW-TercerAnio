import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ProjectStatus } from '../../../../common/enums/project-status.enum';

export class CreateProjectDto {
  @ApiProperty({ example: 'Sistema de gestion interna' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del proyecto es obligatorio' })
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ enum: ProjectStatus, example: ProjectStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProjectStatus, { message: 'Estado invalido' })
  status?: ProjectStatus;

  @ApiPropertyOptional({
    example: 1,
    nullable: true,
    description: 'Cliente asociado. Debe estar activo si se informa.',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  clientId?: number | null;

  @ApiPropertyOptional({
    example: '2026-07-15',
    nullable: true,
    description: 'Fecha de finalizacion con formato YYYY-MM-DD.',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de finalizacion debe tener formato YYYY-MM-DD' },
  )
  endDate?: string | null;
}
