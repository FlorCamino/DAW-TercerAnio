import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    status?: string;
    name?: string;
    role?: string;
    page?: string;
    limit?: string;
    currentUser?: {
        id: number;
        role: UserRole;
    };
}

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const user = this.userRepository.create({
            ...createUserDto,
            password: bcrypt.hashSync(createUserDto.password, 10),
            status: UserStatus.ACTIVO,
        });

        const saved = await this.userRepository.save(user);
        return UsersMapper.toResponse(saved);
    }

    async findOne(id: number): Promise<UserResponseDto> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return UsersMapper.toResponse(user);
    }

    async findAll(filters: UserFilters = {}) {
        const query = this.userRepository.createQueryBuilder('user');

        const estado = this.normalizeStatus(filters.status);
        const name = filters.name?.trim();
        const role = this.normalizeRole(filters.role);
        const page = this.parsePositiveInt(filters.page, 1);
        const limit = this.parsePositiveInt(filters.limit, 6);

        if (filters.currentUser && filters.currentUser.role !== UserRole.ADMIN) {
            query.andWhere('user.id = :currentUserId', {
                currentUserId: filters.currentUser.id,
            });
        }

        if (estado) {
            query.andWhere('user.status = :estado', { estado });
        }

        if (name) {
            addAccentInsensitiveLike(query, 'user.name', 'name', name);
        }

        if (role) {
            query.andWhere('user.role = :role', { role });
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

    async findByUsernameActivo(name: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: {
                name,
                status: UserStatus.ACTIVO
            },
            select: ['id', 'name', 'password', 'status', 'role'],
        });
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
        const user = await this.findUserOrFail(id);

        if (dto.status !== undefined) {
            user.status = dto.status;
        }

        if (dto.role !== undefined) {
            user.role = dto.role;
        }

        if (dto.password !== undefined) {
            user.password = bcrypt.hashSync(dto.password, 10);
        }

        const saved = await this.userRepository.save(user);
        return UsersMapper.toResponse(saved);
    }

    private async findUserOrFail(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });

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
        if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
            return defaultValue;
        }
        return parsedValue;
    }

}
