import { Controller, Get, Post, Param, ParseIntPipe, Query, Body } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UserResponseDto } from "./dtos/output/user-response.dto";
import { CreateUserDto } from "./dtos/input/create-user.dto";

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
    async findOne(@Param("id", ParseIntPipe) id: number): Promise<UserResponseDto> {
        return await this.usersService.findOne(id);
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }
}