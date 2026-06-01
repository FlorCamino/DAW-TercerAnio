import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
    @ApiProperty({
        description: "Token de sesión único generado y guardado en base de datos"
    })
    accessToken!: string;
}