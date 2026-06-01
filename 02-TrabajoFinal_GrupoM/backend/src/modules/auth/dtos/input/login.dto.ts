import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Min, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty({
        description: "Nombre de usuario",
        example: "micazalazar",
    })
    @IsString({message: "El nombre de usuario debe ser un texto"})
    @IsNotEmpty({message: "El nombre de usuario es obligatorio"})
    nombre!: string;

    @ApiProperty({
        description: "Contraseña de usuario",
        example: "mica123456",
    })
    @IsString({message: "La clave debe ser un texto"})
    @IsNotEmpty({message: "La clave es obligatoria"})
    @MinLength(6, {message: "La clave debe tener entre 6 o más caracteres"})
    clave!: string;
}