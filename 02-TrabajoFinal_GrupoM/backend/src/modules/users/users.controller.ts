import { Controller, Get, Post, Patch, Param, ParseIntPipe, Query, Body, ForbiddenException, Req } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UserResponseDto } from "./dtos/output/user-response.dto";
import { CreateUserDto } from "./dtos/input/create-user.dto";
import { ApiOperation } from "@nestjs/swagger";
import { UserStatus } from "../../common/enums/user-status.enum";
import { UserRole } from "../../common/enums/user-role.enum";

// Manejo de roles
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";


@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async findAll(
        @Query("estado") estado?: string,
        @Query("busqueda") busqueda?: string,
        @Query("page") page?: string,
        @Query("limit") limit?: string,
    ){
        return this.usersService.findAll({
            estado,
            busqueda,
            page,
            limit
        });
    }

    @Get(":id")
    @ApiOperation({ summary: "Buscar usuario por ID"})
    async findOne(@Param("id", ParseIntPipe) id: number): Promise<UserResponseDto> {
        return await this.usersService.findOne(id);
    }

    // Solo administradores pueden crear nuevos usuarios y cambiar rol/estado
    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: "Crear un nuevo usuario" })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Patch(":id/estado")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: "Cambiar estado del usuario"})
    async cambiarEstado(@Param("id", ParseIntPipe) id: number, @Body("estado") estado: UserStatus) {
        return this.usersService.cambiarEstado(id, estado);
    }

    @Patch(":id/rol")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: "Cambiar rol del usuario" })
    async cambiarRol(@Param("id", ParseIntPipe) id: number, @Body("rol") rol: UserRole) {
        return this.usersService.cambiarRol(id, rol);
    }

    // Cualquier usuario puede cambiar su propia clave
    @Patch(":id/clave")
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: "Cambiar la contraseña de usuario"})
    async cambiarClave(
        @Param("id", ParseIntPipe) id: number,
        @Body("claveActual") claveActual: string,
        @Body("claveNueva") claveNueva: string,
        @Req() req: any
    ) {
        if (req.user.id !== id && req.user.rol !== "administrador") {
            throw new ForbiddenException("No es posible cambiar la clave de otro usuario");
        }
        return this.usersService.cambiarClave(id, claveActual, claveNueva);
    }
}