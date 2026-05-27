import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Janet Casaretto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser texto' })
  nombre!: string;

  @ApiProperty({ example: 'janet@mail.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser un correo valido' })
  email?: string;

  @ApiProperty({
    example: '123456789',
    required: false,
    description: 'Solo numeros, entre 7 y 15 digitos',
  })
  @IsOptional()
  @IsString({ message: 'El telefono debe ser texto' })
  @Matches(/^[0-9]{7,15}$/, {
    message: 'El telefono debe tener entre 7 y 15 numeros',
  })
  telefono?: string;
}
