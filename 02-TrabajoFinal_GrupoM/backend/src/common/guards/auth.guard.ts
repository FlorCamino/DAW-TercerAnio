import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../../modules/auth/auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException("No se proporcionó un token de acceso válido");
        }

        const usuarioValido = await this.authService.validarToken(token);

        if (!usuarioValido) {
            throw new UnauthorizedException("La sesión caducó o el token es inválido");
        }
        request["user"] = usuarioValido;
        return true;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers["authorization"]?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
