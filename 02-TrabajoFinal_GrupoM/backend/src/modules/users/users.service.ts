import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserStatus } from '../../common/enums/user-status.enum';
import { CreateUserDto } from './dtos/input/create-user.dto';

interface UserFilters {
    estado?: string;
    busqueda?: string;
    page?: string;
    limit?: string;
}

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create({
            ...createUserDto,
            estado: UserStatus.ACTIVO,
        });

        return await this.userRepository.save(user);
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id }});

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return user;
    }

    async findAll(filters: UserFilters = {}) {
        const query = this.userRepository.createQueryBuilder('user');
        
        const estado = this.normalizeStatus(filters.estado);
        const busqueda = filters.busqueda?.trim();
        const page = this.parsePositiveInt(filters.page, 1);
        const limit = this.parseOptionalPositiveInt(filters.limit, 'limite');

        if (estado) {
            query.andWhere('user.status = :estado', { estado });
        }

        if (busqueda) {
            query.andWhere('LOWER(user.nombre) LIKE LOWER(:busqueda)', { busqueda: `%${busqueda}%` });
        }

        query.orderBy('user.id', 'DESC');

        if (limit) {
            query.skip((page - 1) * limit).take(limit);
        }

        const [users, total] = await query.getManyAndCount();

        return {
            data: users,
            total,
            page,
            limit: limit ?? total,
            totalPages: limit ? Math.ceil(total / limit) : total > 0 ? 1 : 0,
        };
    }

    async findByUsernameActivo(nombre: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { nombre,
            estado: UserStatus.ACTIVO },
            select: ['id', 'nombre', 'clave', 'estado'],
        });
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