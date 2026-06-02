import { UserResponseDto } from '../dtos/output/user-response.dto';
import { User } from '../entities/user.entity';

export class UsersMapper {
    static toResponse(user: User): UserResponseDto {
        return {
            id: user.id,
            nombre: user.nombre,
            estado: user.estado,
            rol: user.rol,
        };
    }
}
