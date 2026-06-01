import { UserStatus } from "../../../../common/enums/user-status.enum";

export class UserResponseDto {
    id: number;
    nombre: string;
    estado: UserStatus;
}