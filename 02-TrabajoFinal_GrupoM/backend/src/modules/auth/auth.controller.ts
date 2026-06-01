import { Controller, Post, Body, Delete, Headers } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/input/login.dto";
import { CreateUserDto } from "../users/dtos/input/create-user.dto";
import { AuthResponseDto } from "./dtos/output/auth-response.dto";
import { ApiTags, ApiOperation, ApiResponse} from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("Auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("registrar")
    @ApiOperation({ summary: "Registrar un nuevo usuario "})
    registrar(@Body() createUserDto: CreateUserDto) {
        return this.authService.registrar(createUserDto);
    }

    @Post("login")
    @ApiOperation({ summary: "Iniciar sesión" })
    @ApiResponse({ status: 200, description: "Login exitoso", type: AuthResponseDto })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @Delete("logout")
    @ApiOperation({ summary: "Cerrar sesión" })
    async logout(@Headers("authorization") authHeader: string) {
        const token = authHeader?.replace("Bearer ", "");
        if (token) {
            await this.authService.logout(token);
        }
        return { message: "Sesión cerrada correctamente" };
    }
}