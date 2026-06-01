import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { LoginDto } from "./dtos/input/login.dto";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dtos/input/create-user.dto";
import { Session } from "./entities/session.entity";
import { User } from "../users/entities/user.entity";
import { AuthResponseDto } from "./dtos/output/auth-response.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        
        @InjectRepository(Session)
        private readonly sessionRepository: Repository<Session>
    ) {}

    async registrar(dto: CreateUserDto) {
        const salt = bcrypt.genSaltSync(10);
        const hashClave = bcrypt.hashSync(dto.clave, salt);

        return this.usersService.create({
            ...dto,
            clave: hashClave,
        });
    }

    async login(dto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.usersService.findByUsernameActivo(dto.nombre);

        if (!user) {
            throw new UnauthorizedException("Nombre de usuario inválido o inactivo");
        }

        if (!bcrypt.compareSync(dto.clave, user.clave)) {
            throw new UnauthorizedException("Clave inválida");
        }

        const tokenGenerado = randomUUID();

        const nuevaSesion = this.sessionRepository.create({
            token: tokenGenerado,
            user: user
        });
        await this.sessionRepository.save(nuevaSesion);

        return {
            accessToken: tokenGenerado,
            rol: user.rol,
            nombre: user.nombre
        };
    }

    async logout(token: string): Promise<void> {
        await this.sessionRepository.delete({ token });
    }

    async validarToken(token: string): Promise<User | null> {
        if (!token) return null;
        
        const sesionActiva = await this.sessionRepository.findOne({
            where: { token },
            relations: ["user"]
        });

        if (!sesionActiva || !sesionActiva.user) {
            return null;
        }

        return sesionActiva.user;
    }
}