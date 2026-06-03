import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { ClientStatus } from '../../common/enums/client-status.enum';
import { CreateClientDto } from './dtos/input/create-client.dto';
import { UpdateClientDto } from './dtos/input/update-client.dto';
import { ClientResponseDto } from './dtos/output/client-response.dto';
import { ClientsMapper } from './mappers/clients.mapper';
import { Project } from '../projects/entities/project.entity';
import { ProjectStatus } from '../../common/enums/project-status.enum';

interface ClientFilters {
  status?: string;
  name?: string;
  email?: string;
  phone?: string;
  page?: string;
  limit?: string;
}

export interface PaginatedClientsResponse {
  data: ClientResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) { }

  async create(dto: CreateClientDto): Promise<ClientResponseDto> {
    const client = this.clientRepository.create({
      ...dto,
      status: ClientStatus.ACTIVO,
    });
    const saved = await this.clientRepository.save(client);
    return ClientsMapper.toResponse(saved);
  }

  async findAll(
    filters: ClientFilters = {},
  ): Promise<PaginatedClientsResponse> {
    const where = this.buildFindAllWhere(filters);
    const page = this.parsePositiveInt(filters.page, 1);
    const limit = this.parsePositiveInt(filters.limit, 6);
    const skip = (page - 1) * limit;

    const [clients, total] = await this.clientRepository.findAndCount({
      where,
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    if (this.hasSearchFilters(filters) && total === 0) {
      throw new BadRequestException(
        'No se encontraron clientes con los filtros ingresados',
      );
    }

    return {
      data: clients.map((client) => ClientsMapper.toResponse(client)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: {
        projects: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return client;
  }

  async update(id: number, dto: UpdateClientDto): Promise<ClientResponseDto> {
    const client = await this.findClientOrFail(id);

    if (
      dto.status === ClientStatus.BAJA &&
      client.status !== ClientStatus.BAJA
    ) {
      await this.validateClientWithoutProjects(id);
    }

    Object.assign(client, dto);
    const saved = await this.clientRepository.save(client);
    return ClientsMapper.toResponse(saved);
  }

  async remove(id: number): Promise<ClientResponseDto> {
    const client = await this.findClientOrFail(id);

    if (client.status === ClientStatus.BAJA) {
      throw new BadRequestException('El cliente ya esta dado de baja');
    }

    await this.validateClientWithoutProjects(id);

    client.status = ClientStatus.BAJA;
    const saved = await this.clientRepository.save(client);
    return ClientsMapper.toResponse(saved);
  }

  private async findClientOrFail(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });

    if (!client) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }

    return client;
  }

  private async validateClientWithoutProjects(id: number): Promise<void> {
    const projectsCount = await this.projectRepository.count({
      where: {
        clientId: id,
        status: ProjectStatus.ACTIVE,
      },
    });

    if (projectsCount > 0) {
      throw new BadRequestException(
        'No se puede dar de baja un cliente asociado a proyectos',
      );
    }
  }

  private normalizeStatus(estado?: string): ClientStatus | undefined {
    const trimmedStatus = estado?.trim();

    if (!trimmedStatus) {
      return undefined;
    }

    const normalizedStatus = trimmedStatus.toLowerCase() as ClientStatus;

    if (!Object.values(ClientStatus).includes(normalizedStatus)) {
      throw new BadRequestException('Estado de cliente inválido');
    }

    return normalizedStatus;
  }

  private buildFindAllWhere(
    filters: ClientFilters,
  ): FindOptionsWhere<Client> | FindOptionsWhere<Client>[] {
    const where: FindOptionsWhere<Client> = {};
    const normalizedStatus = this.normalizeStatus(filters.status);
    const name = filters.name?.trim();
    const email = filters.email?.trim();
    const phone = filters.phone?.trim();

    if (normalizedStatus) {
      where.status = normalizedStatus;
    }

    if (name) {
      where.name = ILike(`%${name}%`);
    }

    if (email) {
      where.email = ILike(`%${email}%`);
    }

    if (phone) {
      where.phone = ILike(`%${phone}%`);
    }

    return where;
  }

  private hasSearchFilters(filters: ClientFilters): boolean {
    return [
      filters.status,
      filters.name,
      filters.email,
      filters.phone,
    ].some((value) => value?.trim());
  }

  private parsePositiveInt(
    value: string | undefined,
    defaultValue: number,
  ): number {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      return defaultValue;
    }

    return parsedValue;
  }
}
