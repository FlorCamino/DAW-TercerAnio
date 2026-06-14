import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, MinLength, IsOptional } from "class-validator";
import { UserRoleEnum } from "../../../../common/enums/user-role.enum";

export class CreateUserDto {
    @ApiProperty({ example: "usuario", description: "Nombre de usuario", uniqueItems: true })
    @IsString({ message: "El nombre de usuario debe ser texto" })
    @IsNotEmpty({ message: "El nombre de usuario es obligatorio" })
    name!: string;

    @ApiProperty({ example: "usuario123456", description: "Contraseña" })
    @IsString({ message: "La clave debe ser texto" })
    @IsNotEmpty({ message: "La clave es obligatoria" })
    @MinLength(6, { message: "La clave debe tener entre 6 o más caracteres" })
    password!: string;

    @ApiProperty({ example: UserRoleEnum.USER, description: "Rol del usuario: Usuario o Administrador", required: false })
    @IsEnum(UserRoleEnum, { message: "El rol debe ser válido" })
    @IsOptional()
    role?: UserRoleEnum;
}
