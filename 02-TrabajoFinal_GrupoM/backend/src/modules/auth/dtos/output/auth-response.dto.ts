import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../../../common/enums/user-role.enum";

export class AuthResponseDto {
    @ApiProperty({
        description: "Token de sesión único generado y guardado en base de datos"
    })
    accessToken!: string;

    @ApiProperty({
        description: "Rol del usuario: Administrador o Usuario"
    })
    rol!: UserRole;

    @ApiProperty({
        description: "Nombre del usuario"
    })
    nombre!: string;
}