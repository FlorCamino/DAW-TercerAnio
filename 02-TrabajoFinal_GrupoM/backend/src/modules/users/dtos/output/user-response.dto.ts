import { UserStatus } from "../../../../common/enums/user-status.enum";
import { UserRole } from "../../../../common/enums/user-role.enum";

export class UserResponseDto {
    id: number;
    nombre: string;
    estado: UserStatus;
    rol: UserRole;
}
