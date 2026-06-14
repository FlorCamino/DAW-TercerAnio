import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { UserRoleEnum } from "../../../../common/enums/user-role.enum";
import { UserStatusEnum } from "../../../../common/enums/user-status.enum";

export class UpdateUserDto {
    @ApiPropertyOptional({ enum: UserStatusEnum, example: UserStatusEnum.ACTIVO })
    @IsEnum(UserStatusEnum, { message: "El estado debe ser válido" })
    @IsOptional()
    status?: UserStatusEnum;

    @ApiPropertyOptional({ enum: UserRoleEnum, example: UserRoleEnum.USER })
    @IsEnum(UserRoleEnum, { message: "El rol debe ser válido" })
    @IsOptional()
    role?: UserRoleEnum;

    @ApiPropertyOptional({ example: "nuevaClave123", minLength: 6 })
    @IsString({ message: "La clave debe ser texto" })
    @MinLength(6, { message: "La clave debe tener 6 o más caracteres" })
    @IsOptional()
    password?: string;
}
