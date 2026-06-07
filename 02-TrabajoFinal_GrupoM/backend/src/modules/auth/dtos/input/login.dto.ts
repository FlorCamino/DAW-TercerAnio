import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty({
        description: "Nombre de usuario",
        example: "micazalazar",
    })
    @IsString({ message: "El nombre de usuario debe ser un texto" })
    @IsNotEmpty({ message: "El nombre de usuario es obligatorio" })
    username!: string;

    @ApiProperty({
        description: "Contraseña de usuario",
        example: "mica123456",
    })
    @IsString({ message: "La contraseña debe ser un texto" })
    @IsNotEmpty({ message: "La contraseña es obligatoria" })
    @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    password!: string;
}
