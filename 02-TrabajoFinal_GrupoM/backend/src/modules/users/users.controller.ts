import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-role.enum";
import { UserStatus } from "../../common/enums/user-status.enum";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CreateUserDto } from "./dtos/input/create-user.dto";
import { UpdateUserDto } from "./dtos/input/update-user.dto";
import { UserResponseDto } from "./dtos/output/user-response.dto";
import { UsersService } from "./users.service";
import { UseGuards } from "@nestjs/common";

@ApiTags("Users")
@ApiBearerAuth("access-token")
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.USER, UserRole.ADMIN)
@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiQuery({ name: "estado", enum: UserStatus, required: false })
    @ApiQuery({
        name: "nombre",
        required: false,
        example: "mica",
        description: "Filtro parcial sin distinguir mayusculas ni acentos. Los usuarios comunes solo ven su propio usuario.",
    })
    @ApiQuery({ name: "rol", enum: UserRole, required: false })
    @ApiQuery({ name: "page", required: true, example: 1, schema: { default: 1 } })
    @ApiQuery({ name: "limit", required: true, example: 6, schema: { default: 6 } })
    @Get()
    @ApiOperation({ summary: "Listar usuarios" })
    async findAll(
        @Query("estado") estado?: string,
        @Query("nombre") nombre?: string,
        @Query("rol") rol?: string,
        @Query("page") page: string = "1",
        @Query("limit") limit: string = "6",
        @Req() request?: { user: { id: number; rol: UserRole } },
    ) {
        return this.usersService.findAll({
            estado,
            nombre,
            rol,
            page,
            limit,
            currentUser: request?.user,
        });
    }

    @Get(":id")
    @ApiOperation({ summary: "Obtener usuario por ID" })
    async findOne(
        @Param("id", ParseIntPipe) id: number,
        @Req() request?: { user: { id: number; rol: UserRole } },
    ): Promise<UserResponseDto> {
        if (request?.user.rol !== UserRole.ADMIN && request?.user.id !== id) {
            throw new ForbiddenException("Solo puede consultar su propio usuario");
        }

        return this.usersService.findOne(id);
    }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: "Crear usuario" })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Patch(":id")
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: "Modificar usuario" })
    update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }
}
