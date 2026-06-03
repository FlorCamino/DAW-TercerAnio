import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { LoginDto } from "./dtos/input/login.dto";
import { UsersService } from "../users/users.service";
import { Session } from "./entities/session.entity";
import { User } from "../users/entities/user.entity";
import { AuthResponseDto } from "./dtos/output/auth-response.dto";
import { UserStatus } from "../../common/enums/user-status.enum";

@Injectable()
export class AuthService {
    private readonly sessionDurationInHours = 8;

    constructor(
        private readonly usersService: UsersService,

        @InjectRepository(Session)
        private readonly sessionRepository: Repository<Session>,
    ) { }

    async login(dto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.usersService.findByUsernameActivo(dto.nombre);

        if (!user) {
            throw new UnauthorizedException("Nombre de usuario inválido o inactivo");
        }

        if (!bcrypt.compareSync(dto.clave, user.clave)) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        const tokenGenerado = randomUUID();
        const expiraEn = this.getSessionExpirationDate();

        const nuevaSesion = this.sessionRepository.create({
            token: tokenGenerado,
            user,
            expiraEn,
        });

        await this.sessionRepository.save(nuevaSesion);

        return {
            accessToken: tokenGenerado,
            rol: user.rol,
            nombre: user.nombre,
        };
    }

    async logout(token: string): Promise<void> {
        await this.sessionRepository.delete({ token });
    }

    async validarToken(token: string): Promise<User | null> {
        if (!token) return null;

        const sesionActiva = await this.sessionRepository.findOne({
            where: { token },
            relations: ["user"],
        });

        if (!sesionActiva || !sesionActiva.user) {
            return null;
        }

        if (sesionActiva.expiraEn <= new Date()) {
            await this.sessionRepository.delete({ id: sesionActiva.id });
            return null;
        }

        if (sesionActiva.user.estado !== UserStatus.ACTIVO) {
            return null;
        }

        return sesionActiva.user;
    }

    async deleteExpiredSessions(): Promise<void> {
        await this.sessionRepository.delete({
            expiraEn: LessThan(new Date()),
        });
    }

    private getSessionExpirationDate(): Date {
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + this.sessionDurationInHours);
        return expirationDate;
    }
}