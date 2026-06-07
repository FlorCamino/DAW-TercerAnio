import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Janet Casaretto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MaxLength(150, {
    message: 'El nombre del cliente no puede superar los 150 caracteres',
  })
  name!: string;

  @ApiProperty({ example: 'janet@mail.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser un correo valido' })
  @MaxLength(150, {
    message: 'El email no puede superar los 150 caracteres',
  })
  email?: string;

  @ApiProperty({
    example: '123456789',
    required: false,
    description: 'Solo numeros, entre 7 y 15 digitos',
  })
  @IsOptional()
  @IsString({ message: 'El telefono debe ser texto' })
  @Matches(/^[0-9]{7,15}$/, {
    message: 'El teléfono debe tener entre 7 y 15 números',
  })
  phone?: string;
}
