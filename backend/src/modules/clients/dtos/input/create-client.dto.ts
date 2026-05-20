import { IsNotEmpty, IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClientStatus } from '../../../../common/enums/client-status.enum'; 

export class CreateClientDto {
  @ApiProperty({ example: 'Janet Casaretto' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'janet@mail.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '123456789', required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ enum: ClientStatus, required: false })
  @IsOptional()
  @IsEnum(ClientStatus) 
  estado?: ClientStatus;
}