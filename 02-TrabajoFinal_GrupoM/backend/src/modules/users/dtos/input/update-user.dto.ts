import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "../../../../common/enums/user-role.enum";
import { UserStatus } from "../../../../common/enums/user-status.enum";

export class UpdateUserDto {
    @ApiPropertyOptional({ enum: UserStatus, example: UserStatus.ACTIVO })
    @IsEnum(UserStatus, { message: "El estado debe ser valido" })
    @IsOptional()
    status?: UserStatus;

    @ApiPropertyOptional({ enum: UserRole, example: UserRole.USER })
    @IsEnum(UserRole, { message: "El rol debe ser valido" })
    @IsOptional()
    role?: UserRole;

    @ApiPropertyOptional({ example: "nuevaClave123", minLength: 6 })
    @IsString({ message: "La clave debe ser texto" })
    @MinLength(6, { message: "La clave debe tener 6 o mas caracteres" })
    @IsOptional()
    password?: string;
}
