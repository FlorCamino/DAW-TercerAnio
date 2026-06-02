import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from "bcrypt";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserStatus } from '../../common/enums/user-status.enum';
import { CreateUserDto } from './dtos/input/create-user.dto';
import { UpdateUserDto } from './dtos/input/update-user.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserResponseDto } from './dtos/output/user-response.dto';
import { UsersMapper } from './mappers/users.mapper';
import { addAccentInsensitiveLike } from '../../common/utils/query-filters.util';

interface UserFilters {
    estado?: string;
    nombre?: string;
    rol?: string;
    page?: string;
    limit?: string;
    currentUser?: {
        id: number;
        rol: UserRole;
    };
}

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const user = this.userRepository.create({
            ...createUserDto,
            clave: bcrypt.hashSync(createUserDto.clave, 10),
            estado: UserStatus.ACTIVO,
        });

        const saved = await this.userRepository.save(user);
        return UsersMapper.toResponse(saved);
    }

    async findOne(id: number): Promise<UserResponseDto> {
        const user = await this.userRepository.findOne({ where: { id }});

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return UsersMapper.toResponse(user);
    }

    async findAll(filters: UserFilters = {}) {
        const query = this.userRepository.createQueryBuilder('user');
        
        const estado = this.normalizeStatus(filters.estado);
        const nombre = filters.nombre?.trim();
        const rol = this.normalizeRole(filters.rol);
        const page = this.parsePositiveInt(filters.page, 1);
        const limit = this.parsePositiveInt(filters.limit, 6);

        if (filters.currentUser && filters.currentUser.rol !== UserRole.ADMIN) {
            query.andWhere('user.id = :currentUserId', {
                currentUserId: filters.currentUser.id,
            });
        }

        if (estado) {
            query.andWhere('user.estado = :estado', { estado });
        }

        if (nombre) {
            addAccentInsensitiveLike(query, 'user.nombre', 'nombre', nombre);
        }

        if (rol) {
            query.andWhere('user.rol = :rol', { rol });
        }

        query.orderBy('user.id', 'DESC');
        query.skip((page - 1) * limit).take(limit);

        const [users, total] = await query.getManyAndCount();

        return {
            data: users.map((user) => UsersMapper.toResponse(user)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findByUsernameActivo(nombre: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { nombre,
            estado: UserStatus.ACTIVO },
            select: ['id', 'nombre', 'clave', 'estado', 'rol'],
        });
    }

    async cambiarEstado(id: number, estado: UserStatus): Promise<UserResponseDto> {
        const user = await this.findUserOrFail(id);
        user.estado = estado;
        const saved = await this.userRepository.save(user);
        return UsersMapper.toResponse(saved);
    }

    async cambiarRol(id: number, rol: UserRole): Promise<UserResponseDto> {
        const user = await this.findUserOrFail(id);
        user.rol = rol;
        const saved = await this.userRepository.save(user);
        return UsersMapper.toResponse(saved);
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
        const user = await this.findUserOrFail(id);

        if (dto.estado !== undefined) {
            user.estado = dto.estado;
        }

        if (dto.rol !== undefined) {
            user.rol = dto.rol;
        }

        if (dto.clave !== undefined) {
            user.clave = bcrypt.hashSync(dto.clave, 10);
        }

        const saved = await this.userRepository.save(user);
        return UsersMapper.toResponse(saved);
    }

    async cambiarClave(id: number, claveActual: string, claveNueva: string): Promise<void> {
        const user = await this.findUserOrFail(id);

        if (!bcrypt.compareSync(claveActual, user.clave)) {
            throw new UnauthorizedException("La clave actual es incorrecta");
        }
        
        user.clave = bcrypt.hashSync(claveNueva, 10);
        await this.userRepository.save(user);
    }

    private async findUserOrFail(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id }});

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return user;
    }

    private normalizeStatus(estado?: string): UserStatus | undefined {
        const trimmedStatus = estado?.trim();
        if (!trimmedStatus) return undefined;

        const normalizedStatus = trimmedStatus.toLowerCase() as UserStatus;

        if (!Object.values(UserStatus).includes(normalizedStatus)) {
            throw new BadRequestException('Estado de usuario inválido');
        }

        return normalizedStatus;
    }

    private normalizeRole(rol?: string): UserRole | undefined {
        const trimmedRole = rol?.trim();
        if (!trimmedRole) return undefined;

        const normalizedRole = trimmedRole.toLowerCase() as UserRole;

        if (!Object.values(UserRole).includes(normalizedRole)) {
            throw new BadRequestException('Rol de usuario invalido');
        }

        return normalizedRole;
    }

    private parsePositiveInt(value: string | undefined, defaultValue: number): number {
        const parsedValue = Number(value);
        if (!Number.isInteger(parsedValue) || parsedValue <=0) {
            return defaultValue;
        }
        return parsedValue;
    }

    private parseOptionalPositiveInt(value: string | undefined, fieldName: string): number | undefined {
        if (value === undefined || value.trim() === '') return undefined;

        const parsedValue = Number(value);
        if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
            throw new BadRequestException(`El ${fieldName} debe ser un número positivo`);
        }
        return parsedValue;
    }

}
