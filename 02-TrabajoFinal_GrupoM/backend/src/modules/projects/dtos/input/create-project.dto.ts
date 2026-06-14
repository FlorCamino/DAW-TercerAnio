import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, } from 'class-validator';
import { ProjectStatusEnum } from '../../../../common/enums/project-status.enum';

export class CreateProjectDto {
  @ApiProperty({ example: 'Sistema de gestión interna' })
  @IsString({ message: 'El nombre del proyecto debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre del proyecto es obligatorio' })
  @MaxLength(150, {
    message: 'El nombre del proyecto no puede superar los 150 caracteres',
  })
  name!: string;

  @ApiPropertyOptional({ enum: ProjectStatusEnum, example: ProjectStatusEnum.ACTIVO })
  @IsOptional()
  @IsEnum(ProjectStatusEnum, { message: 'El estado tiene un valor inválido' })
  status?: ProjectStatusEnum;

  @ApiPropertyOptional({
    example: 1,
    nullable: true,
    description: 'Cliente asociado. Debe estar activo si se informa.',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'El clientId debe ser un numero entero' })
  @IsPositive({ message: 'El clientId debe ser un número positivo' })
  clientId?: number | null;

  @ApiPropertyOptional({
    example: '2026-07-15',
    nullable: true,
    description: 'Fecha de finalización con formato YYYY-MM-DD.',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de finalización debe tener formato YYYY-MM-DD' },
  )
  endDate?: string | null;
}
