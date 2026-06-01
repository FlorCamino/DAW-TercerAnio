import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, MinLength, IsOptional } from "class-validator";
import { UserRole } from "../../../../common/enums/user-role.enum";

export class CreateUserDto {
    @ApiProperty({ example: "Micaela_Zalazar", description: "Nombre de usuario", uniqueItems: true})
    @IsString({ message: "El nombre de usuario debe ser texto"})
    @IsNotEmpty({ message: "El nombre de usuario es obligatorio"})
    nombre!: string;

    @ApiProperty({ example: "mica123456", description: "Contraseña"})
    @IsString({ message: "La clave debe ser texto"})
    @IsNotEmpty({ message: "La clave es obligatoria"})
    @MinLength(6, { message: "La clave debe tener entre 6 o más caracteres"})
    clave!: string;

    @ApiProperty({ example: UserRole.USER, description:"Rol del usuario: Usuario o Administrador", required: false })
    @IsEnum(UserRole, { message: "El rol debe ser válido"})
    @IsOptional()
    rol?: UserRole;
}