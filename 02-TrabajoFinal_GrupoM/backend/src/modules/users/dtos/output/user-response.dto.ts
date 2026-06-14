import { UserStatusEnum } from "../../../../common/enums/user-status.enum";
import { UserRoleEnum } from "../../../../common/enums/user-role.enum";

export class UserResponseDto {
    id!: number;
    name!: string;
    status!: UserStatusEnum;
    role!: UserRoleEnum;
}
