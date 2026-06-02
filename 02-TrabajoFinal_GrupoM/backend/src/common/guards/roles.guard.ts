import { Injectable, CanActivate, ExecutionContext, ForbiddenException} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../enums/user-role.enum";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const rolesRequeridos = this.reflector.getAllAndOverride<UserRole[]>("roles", [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!rolesRequeridos) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        const tieneRol = rolesRequeridos.includes(user.rol);

        if (!tieneRol) {
            throw new ForbiddenException("No tienes permisos para realizar esta operación")
        }
        return true;
    }
}
