import { Controller, Post, Body, Delete, Headers, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/input/login.dto";
import { AuthResponseDto } from "./dtos/output/auth-response.dto";
import { ApiBearerAuth, ApiBody, ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-role.enum";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post("login")
    @ApiOperation({ summary: "Iniciar sesión" })
    @ApiBody({
        type: LoginDto,
        examples: {
            administrador: {
                summary: "Usuario administrador de prueba",
                value: {
                    username: "admin",
                    password: "admin123456",
                },
            },
            usuario: {
                summary: "Usuario estandar de prueba",
                value: {
                    username: "usuario",
                    password: "usuario123456",
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: "Login exitoso", type: AuthResponseDto })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @Delete("logout")
    @ApiBearerAuth('access-token')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    @ApiOperation({ summary: "Cerrar sesión" })
    async logout(@Headers("authorization") authHeader: string) {
        const token = authHeader?.replace("Bearer ", "");
        if (token) {
            await this.authService.logout(token);
        }
        return { message: "Sesión cerrada correctamente" };
    }
}
